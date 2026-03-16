import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import Tesseract from "tesseract.js";
import { PdfReader } from "pdfreader";
import { supabase, getSupabaseService } from "@/lib/supabase";

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

        // 1. Crear el Job en Supabase usando Service Role centralizado en supabase.ts
        const supabaseService = getSupabaseService();

        const { data: job, error: jobError } = await supabaseService
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
            return NextResponse.json({ 
                error: "Error al iniciar proceso en Base de Datos", 
                details: jobError.message,
                hint: jobError.hint,
                code: jobError.code
            }, { status: 500 });
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

interface ExtractedResult {
    fileName: string;
    mimeType?: string;
    text?: string;
    structuredData?: any;
    error?: string;
    classification?: string;
}

async function processFilesInBackground(jobId: string, files: File[]) {
    const results: ExtractedResult[] = [];
    console.log(`👷 [WORKER] Iniciando procesamiento para Job: ${jobId}`);

    try {
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type;
            const name = file.name;

            let extractedData: ExtractedResult = {
                fileName: name,
                mimeType,
                text: "",
                structuredData: null
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
                        const ocrResult: any = await Promise.race([ocrTask, timeoutPromise]);
                        extractedData.text = ocrResult?.data?.text || "";
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

        // 4. Clasificación Inteligente: primero por contenido (OCR/XML), luego por nombre de archivo
        const enhancedResults = results.map(res => {
            if (res.error) return res;
            
            let classification = "desconocido";
            const text = (res.text || "").toUpperCase();
            const fileName = (res.fileName || "").toUpperCase();
            const hasXML = !!res.structuredData;

            // Estrategia 1: Clasificación por CONTENIDO (OCR/XML)
            if (hasXML) classification = "factura_xml";
            else if (text.includes("INSTITUTO NACIONAL ELECTORAL") || text.includes("IFE") || text.includes("CREDENCIAL PARA VOTAR") || text.includes("CLAVE DE ELECTOR")) classification = "ine";
            else if (text.includes("RECETA") || text.includes("MEDICAMENTO") || text.includes("MG/DL") || text.includes("POSOLOGIA") || text.includes("TABLETAS") || text.includes("DOSIS")) classification = "receta_medica";
            else if (text.includes("INFORME") || text.includes("DIAGNOSTICO") || text.includes("HISTORIA CLINICA") || text.includes("ANAMNESIS") || text.includes("PADECIMIENTO") || text.includes("EXPEDIENTE CLINICO")) classification = "informe_medico";
            else if (text.includes("DOMICILIO") || text.includes("CFE") || text.includes("TELMEX") || text.includes("RECIBO DE LUZ") || text.includes("ESTADO DE CUENTA")) classification = "comprobante_domicilio";
            else if (text.includes("ESTUDIO") || text.includes("LABORATORIO") || text.includes("RADIOLOGIA") || text.includes("RESULTADO") || text.includes("MUESTRA")) classification = "estudios_diagnosticos";
            else if (text.includes("$") || text.includes("TOTAL") || text.includes("RFC") || text.includes("CFDI")) classification = "posible_factura";

            // Estrategia 2: Fallback por NOMBRE de archivo (cuando OCR no detecta texto útil)
            if (classification === "desconocido") {
                if (fileName.includes("INE") || fileName.includes("CREDENCIAL") || fileName.includes("IFE")) classification = "ine";
                else if (fileName.includes("DOMICILIO") || fileName.includes("CFE") || fileName.includes("LUZ") || fileName.includes("COMPROBANTE")) classification = "comprobante_domicilio";
                else if (fileName.includes("INFORME") || fileName.includes("MEDICO") || fileName.includes("CLINICO")) classification = "informe_medico";
                else if (fileName.includes("RECETA") || fileName.includes("PRESCRIPCION")) classification = "receta_medica";
                else if (fileName.includes("FACTURA") || fileName.includes("CFDI") || fileName.includes("XML")) classification = "factura_xml";
                else if (fileName.includes("ESTUDIO") || fileName.includes("LAB") || fileName.includes("RADIO") || fileName.includes("DIAGNOSTICO")) classification = "estudios_diagnosticos";
            }

            return { ...res, classification };
        });

        // 5. Actualizar Job como completado
        const supabaseService = getSupabaseService();
        await supabaseService
            .from('jobs')
            .update({ 
                status: 'completed', 
                results: enhancedResults,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);

        console.log(`✅ [WORKER] Job ${jobId} finalizado y clasificado.`);

        // 6. 🚀 DISPARAR N8N (Opcional pero recomendado)
        const n8nWebhook = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhook) {
            console.log(`🔗 [NOTIFY] Avisando a n8n del Job ${jobId}...`);
            await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    event: 'job_completed',
                    jobId: jobId,
                    results: enhancedResults 
                })
            }).catch(e => console.warn("⚠️ n8n no respondió, pero el Job se guardó en Supabase."));
        }

    } catch (err: any) {
        console.error(`❌ [WORKER] Error fatal en Job ${jobId}:`, err);
        const supabaseService = getSupabaseService();
        await supabaseService
            .from('jobs')
            .update({ status: 'failed', error_message: err.message })
            .eq('id', jobId);
    }
}
