import { NextRequest, NextResponse } from "next/server";
import { llenarFormatoGMM } from "@/lib/pdfGenerator";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { datosExtraidos, webHookUrl_n8n, plantillaSeleccionada } = await req.json();

        if (!datosExtraidos) {
            return NextResponse.json({ error: "No se enviaron datos para poblar el PDF." }, { status: 400 });
        }

        console.log("\n========================================================");
        console.log("📄 [ANTIGRAVITY PDF ENGINE] - GENERANDO EXPEDIENTE GMM");
        console.log("========================================================");
        console.log("Datos recibidos:", JSON.stringify(datosExtraidos, null, 2));

        // Ruta de la plantilla dinámica elegida por el usuario
        const nombreArchivoPlantilla = plantillaSeleccionada || '4_SRGMM-Mar26.pdf';
        const templatePath = path.join(process.cwd(), 'public', 'plantillas', nombreArchivoPlantilla);
        console.log("Cargando plantilla desde:", templatePath);

        const plantillaBytes = fs.readFileSync(templatePath);

        let pdfBytesGenerado: Uint8Array | null = null;
        let documentoBase64: string | null = null;

        // Llenado real de campos
        try {
            pdfBytesGenerado = await llenarFormatoGMM(plantillaBytes, datosExtraidos);
            documentoBase64 = Buffer.from(pdfBytesGenerado!).toString('base64');
            console.log("✅ PDF Llenado, Protegido (Flattened) y codificado en Base64.");
        } catch (pdfErr) {
            console.error(">> Error fatal al llenar el PDF:", pdfErr);
            throw new Error("No se pudo generar el documento PDF.");
        }

        console.log("========================================================\n");

        // 🔗 AQUÍ CONECTAMOS CON TU n8n (Orquestador VPS Dokploy) //
        let n8nSuccess = false;
        let n8nError = null;
        const webhookDestino = webHookUrl_n8n || process.env.N8N_WEBHOOK_URL || "";

        // Calculamos el prefijo de fecha dinámico (ej: Mar26)
        const now = new Date();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const prefijoFecha = `${meses[now.getMonth()]}${now.getFullYear().toString().slice(-2)}`;

        if (webhookDestino) {
            console.log("📡 Disparando trigger a n8n:", webhookDestino);

            try {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

                const response = await fetch(webhookDestino, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        documentoBase64: documentoBase64,
                        metadata: {
                            siniestroId: datosExtraidos.siniestro?.numeroSiniestro || "DESCONOCIDO",
                            nombreArchivoGenerado: nombreArchivoPlantilla.replace(".pdf", ""),
                            nombreAsegurado: datosExtraidos.asegurado?.nombre || "Expediente_GMM",
                            nombreCarpetaAsegurado: (datosExtraidos.asegurado?.nombre || "Asegurado_Sin_Nombre").trim(),
                            nombreCarpetaEvento: prefijoFecha, // Ahora es dinámico
                            fechaEmision: new Date().toISOString().split('T')[0],
                            emailAsegurado: datosExtraidos.asegurado?.email || "test@pash.uno",
                            googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "root"
                        }
                    }),
                });

                if (response.ok) {
                    n8nSuccess = true;
                    console.log(`✅ n8n Hook OK (Status ${response.status})`);
                } else {
                    n8nError = await response.text();
                    console.error(`❌ n8n Hook Error (Status ${response.status}):`, n8nError);
                }
            } catch (err: any) {
                n8nError = err.message;
                console.error("❌ Error de red al contactar a n8n:", err.message);
            }
        }

        if (!n8nSuccess && webhookDestino) {
            return NextResponse.json({
                error: "El PDF se generó pero no se pudo enviar a n8n. Verifica que el workflow esté ACTIVO.",
                details: n8nError
            }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            message: "PDF generado y enviado a n8n exitosamente.",
            prefijoUsado: prefijoFecha
        });

    } catch (error: any) {
        console.error("Error Generador de PDF API:", error);
        return NextResponse.json({ error: "Error en el Creador de PDFs." }, { status: 500 });
    }
}
