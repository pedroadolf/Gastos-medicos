import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import Tesseract from "tesseract.js";
import { PdfReader } from "pdfreader";
import { supabase } from "@/lib/supabase";

// Esta ruta ahora actúa como el "Productor" de trabajos
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const metadataRaw = formData.get("metadata") as string;
        const metadata = metadataRaw ? JSON.parse(metadataRaw) : {};

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
        }

        console.log(`🚀 [QUEUE] Recibidos ${files.length} archivos. Creando Job...`);

        // 1. Crear el Job en Supabase
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert([
                { 
                    status: 'processing', 
                    file_count: files.length,
                    metadata: metadata
                }
            ])
            .select()
            .single();

        if (jobError) {
            console.error("❌ Error creando Job:", jobError);
            return NextResponse.json({ error: "Error al iniciar proceso" }, { status: 500 });
        }

        const jobId = job.id;

        // 2. Procesar en "Background" (En Node/Next.js sin await el bucle)
        // NOTA: En una arquitectura más robusta, esto lo haría un Worker separado leyendo la tabla.
        // Por ahora lo hacemos asíncrono aquí para no bloquear la respuesta al usuario.
        processFilesInBackground(jobId, files);

        // 3. Responder de inmediato con el ID del Job
        return NextResponse.json({ 
            success: true, 
            jobId: jobId, 
            message: "Procesamiento iniciado en segundo plano" 
        });

    } catch (error: any) {
        console.error("Error Core Extract API:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

async function processFilesInBackground(jobId: string, files: File[]) {
    const results = [];
    console.log(`👷 [WORKER] Iniciando procesamiento para Job: ${jobId}`);

    try {
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type;
            const name = file.name;

            let extractedData = {
                fileName: name,
                mimeType,
                text: "",
                structuredData: null as any
            };

            try {
                if (mimeType === "text/xml" || name.toLowerCase().endsWith(".xml")) {
                    console.log(`[XML] 🔎 Procesando: ${name}`);
                    const xmlRaw = buffer.toString("utf-8");
                    const result = await parseStringPromise(xmlRaw, { explicitArray: false, ignoreAttrs: false });
                    const comprobante = result["cfdi:Comprobante"];
                    
                    if (comprobante) {
                        extractedData.structuredData = {
                            tipoDoc: "CFDI_Factura",
                            uuid: comprobante["cfdi:Complemento"]?.["tfd:TimbreFiscalDigital"]?.["$"]?.UUID || "NO_UUID",
                            monto: comprobante["$"]?.Total || comprobante["$"]?.total || "0.00",
                            fechaFactura: comprobante["$"]?.Fecha || comprobante["$"]?.fecha || "",
                            proveedor: comprobante["cfdi:Emisor"]?.["$"]?.Nombre || comprobante["cfdi:Emisor"]?.["$"]?.nombre || "N/A",
                        };
                    }
                } 
                else if (mimeType.includes("image/")) {
                    console.log(`[OCR] 📸 Tesseract para: ${name}...`);
                    const ocrTask = Tesseract.recognize(buffer, "spa");
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("OCR_TIMEOUT")), 30000));

                    try {
                        const { data: { text } } = await Promise.race([ocrTask, timeoutPromise]) as any;
                        extractedData.text = text;
                    } catch (e: any) {
                        extractedData.text = "[ERROR_TIMEOUT]";
                    }
                } 
                else if (mimeType === "application/pdf") {
                    console.log(`[PDF] 📄 PdfReader: ${name}...`);
                    const pdfText = await new Promise<string>((resolve, reject) => {
                        let content = "";
                        const reader = new PdfReader();
                        reader.parseBuffer(buffer, (err, item) => {
                            if (err) reject(err);
                            else if (!item) resolve(content);
                            else if (item.text) content += item.text + " ";
                        });
                    });
                    extractedData.text = pdfText;
                }

                results.push(extractedData);
            } catch (err: any) {
                results.push({ fileName: name, error: err.message });
            }
        }

        // 4. Actualizar Job como completado
        await supabase
            .from('jobs')
            .update({ 
                status: 'completed', 
                results: results,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);

        console.log(`✅ [WORKER] Job ${jobId} finalizado.`);

    } catch (err: any) {
        console.error(`❌ [WORKER] Error fatal en Job ${jobId}:`, err);
        await supabase
            .from('jobs')
            .update({ status: 'failed', error_message: err.message })
            .eq('id', jobId);
    }
}
