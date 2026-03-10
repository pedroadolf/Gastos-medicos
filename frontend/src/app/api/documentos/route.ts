import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import Tesseract from "tesseract.js";

// Workaround para pdf-parse en entornos ESM/Next.js
const pdfParse = require("pdf-parse");

// Esta ruta procesa facturas XML, PDFs escaneados (OCR) y PDFs regulares
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
        }

        const results = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const mimeType = file.type;
            const name = file.name;

            type ExtractedData = {
                fileName: string;
                mimeType: string;
                text: string;
                structuredData?: any;
                error?: string;
            };

            let extractedData: ExtractedData = {
                fileName: name,
                mimeType,
                text: "",
            };

            try {
                if (mimeType === "text/xml" || name.toLowerCase().endsWith(".xml")) {
                    // 🔎 1. PROCESAR XML CFDI
                    const xmlRaw = buffer.toString("utf-8");
                    const result = await parseStringPromise(xmlRaw, { explicitArray: false, ignoreAttrs: false });

                    // Mapeo seguro para CFDI (V3.3 o V4.0)
                    const comprobante = result["cfdi:Comprobante"];
                    if (comprobante) {
                        extractedData.structuredData = {
                            tipoDoc: "CFDI_Factura",
                            uuid: comprobante["cfdi:Complemento"]?.["tfd:TimbreFiscalDigital"]?.["$"]?.UUID || "NO_UUID",
                            monto: comprobante["$"]?.Total || comprobante["$"]?.total || "0.00",
                            fechaFactura: comprobante["$"]?.Fecha || comprobante["$"]?.fecha || "",
                            proveedor: comprobante["cfdi:Emisor"]?.["$"]?.Nombre || comprobante["cfdi:Emisor"]?.["$"]?.nombre || "N/A",
                            rfcProveedor: comprobante["cfdi:Emisor"]?.["$"]?.Rfc || comprobante["cfdi:Emisor"]?.["$"]?.rfc || "N/A",
                        };
                        extractedData.text = `Factura XML procesada. UUID: ${extractedData.structuredData.uuid}`;
                    } else {
                        extractedData.text = "XML sin esquema CFDI reconocido válido.";
                        extractedData.structuredData = result;
                    }

                } else if (mimeType.includes("image/")) {
                    // 🔎 2. PROCESAR IAMGEN CON OCR (Tesseract)
                    // Usamos el idioma español predeterminado
                    const { data: { text } } = await Tesseract.recognize(buffer, "spa");
                    extractedData.text = text;

                    // Regex simple: Detectar la palabra "Total" seguida por números (ej. Total: $1,200.50)
                    const totalMatch = text.match(/TOTAL[\s\S]*?\$?\s*([0-9,]+\.[0-9]{2})/i);
                    if (totalMatch) {
                        extractedData.structuredData = { tipoDoc: "Imagen OCR", montoDetectado: totalMatch[1] };
                    }

                } else if (mimeType === "application/pdf") {
                    // 🔎 3. PROCESAR PDF CON TEXTO (e.g. Informes médicos o Facts Puras)
                    const data = await pdfParse(buffer);
                    extractedData.text = data.text;

                    const totalMatch = data.text.match(/TOTAL[\s\S]*?\$?\s*([0-9,]+\.[0-9]{2})/i);
                    if (totalMatch) {
                        extractedData.structuredData = { tipoDoc: "PDF Texto", montoDetectado: totalMatch[1] };
                    }
                } else {
                    extractedData.error = "Formato no soportado por el motor de extracción.";
                }

                results.push(extractedData);
            } catch (err: any) {
                results.push({ fileName: name, error: "Error de parsing: " + err.message });
            }
        }

        console.log("\n========================================================");
        console.log("🚀 [ANTIGRAVITY OCR/XML ENGINE] - EXTRACCIÓN EXITOSA");
        console.log("========================================================");
        console.log(JSON.stringify(results, null, 2));
        console.log("========================================================\n");

        return NextResponse.json({ success: true, processedFiles: results });

    } catch (error: any) {
        console.error("Error Core Extract API:", error);
        return NextResponse.json({ error: "Error interno del servidor Procesador Global." }, { status: 500 });
    }
}
