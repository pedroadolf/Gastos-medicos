import { NextRequest, NextResponse } from "next/server";
import { llenarFormatoGMM } from "@/services/pdfGenerator";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

export async function POST(req: NextRequest) {
    // ⚠️ DEPRECATED: This endpoint is deprecated as of 2026-04-03.
    // Use POST /api/documentos instead (n8n-based, no local PDF generation).
    // This endpoint will be REMOVED in v2.0 (estimated June 2026).
    // Migration: replace fetch("/api/generar", ...) with fetch("/api/documentos", ...)
    console.warn(
        '[DEPRECATED] POST /api/_legacy/generar is deprecated as of 2026-04-03. ' +
        'Use POST /api/documentos instead. ' +
        'Removal scheduled for v2.0 (est. June 2026).'
    );

    try {
        const { datosExtraidos, webHookUrl_n8n, plantillaSeleccionada, plantillasMultiples, archivosManuales, jobId } = await req.json();

        console.log(`\n🚀 [API generar] Iniciando proceso para JobId: ${jobId || 'NUEVO'}`);

        if (!datosExtraidos) {
            return NextResponse.json({ error: "No se enviaron datos para poblar el PDF." }, { status: 400 });
        }

        console.log("\n========================================================");
        console.log("📄 [ANTIGRAVITY PDF ENGINE] - GENERANDO EXPEDIENTE GMM");
        console.log("========================================================");
        console.log("Datos recibidos:", JSON.stringify(datosExtraidos, null, 2));

        // Determinar las plantillas a procesar (soporte multi-plantilla + legacy)
        const plantillas: string[] = plantillasMultiples && plantillasMultiples.length > 0
            ? plantillasMultiples
            : [plantillaSeleccionada || '4_SRGMM-Mar26.pdf'];

        console.log(`📋 Plantillas a generar: ${plantillas.length} → ${plantillas.join(', ')}`);

        // Generar TODOS los PDFs localmente
        const documentosGenerados: { nombre: string; base64: string }[] = [];

        for (const nombrePlantilla of plantillas) {
            const templatePath = path.join(process.cwd(), 'public', 'plantillas', nombrePlantilla);
            console.log(`  📄 Procesando: ${nombrePlantilla}`);

            try {
                const plantillaBytes = fs.readFileSync(templatePath);
                const pdfBytesGenerado = await llenarFormatoGMM(plantillaBytes, datosExtraidos);
                const base64 = Buffer.from(pdfBytesGenerado).toString('base64');

                documentosGenerados.push({
                    nombre: nombrePlantilla.replace(".pdf", ""),
                    base64: base64
                });
                console.log(`  ✅ ${nombrePlantilla} → OK`);
            } catch (pdfErr) {
                console.error(`  ❌ Error en ${nombrePlantilla}:`, pdfErr);
                // Continuar con las demás plantillas si una falla
            }
        }

        if (documentosGenerados.length === 0) {
            throw new Error("No se pudo generar ningún documento PDF.");
        }

        console.log(`📦 Total PDFs generados: ${documentosGenerados.length}/${plantillas.length}`);
        console.log("========================================================\n");

        // 🔗 UN SOLO webhook a n8n con TODOS los documentos combinados
        let n8nSuccess = false;
        let n8nError = null;
        let n8nJobId = null;
        const webhookDestino = webHookUrl_n8n || process.env.N8N_WEBHOOK_URL || "";

        // Prefijo de fecha dinámico (ej: Mar26)
        const now = new Date();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const prefijoFecha = `${meses[now.getMonth()]}${now.getFullYear().toString().slice(-2)}`;

        if (webhookDestino) {
            console.log("📡 [DEBUG] Destino Webhook:", webhookDestino);
            console.log("📡 [DEBUG] Metadata:", JSON.stringify({
                asegurado: datosExtraidos.asegurado?.nombre,
                siniestro: datosExtraidos.siniestro?.numeroSiniestro,
                totalDocs: documentosGenerados.length
            }, null, 2));
            console.log("📡 Disparando UN SOLO trigger a n8n:", webhookDestino);

            try {
                const requestPayload = JSON.stringify({
                    // Compatibilidad: primer documento como campo principal
                    documentoBase64: documentosGenerados[0].base64,
                    // Todos los documentos generados
                    documentosGenerados: documentosGenerados,
                    archivosManuales: archivosManuales || [],
                    metadata: {
                        siniestroId: datosExtraidos.siniestro?.numeroSiniestro || "DESCONOCIDO",
                        nombreArchivoGenerado: documentosGenerados[0].nombre,
                        plantillasUsadas: documentosGenerados.map(d => d.nombre),
                        totalPlantillas: documentosGenerados.length,
                        nombreAsegurado: datosExtraidos.asegurado?.nombre || "Expediente_GMM",
                        nombreCarpetaAsegurado: (datosExtraidos.asegurado?.nombre || "Asegurado_Sin_Nombre").trim(),
                        nombreCarpetaEvento: prefijoFecha,
                        fechaEmision: new Date().toISOString().split('T')[0],
                        emailAsegurado: datosExtraidos.asegurado?.email || "test@pash.uno",
                        googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "root",
                        jobId: jobId // 🔑 Crucial para el callback
                    }
                });

                const doRequest = async (targetUrl: string, isFallback: boolean = false) => {
                    const typeStr = isFallback ? 'FALLBACK PÚBLICO' : 'INTERNO DOCKER';
                    console.log(`📡 [Webhook Proxy] Intentando ${typeStr}: ${targetUrl}`);
                    
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds, fail fast

                        const headers: any = {
                            "Content-Type": "application/json"
                        };
                        
                        if (process.env.N8N_WEBHOOK_HOST_HEADER && !targetUrl.startsWith('https:')) {
                            headers['Host'] = process.env.N8N_WEBHOOK_HOST_HEADER;
                        }

                        // Use fetch internally
                        const response = await fetch(targetUrl, {
                            method: "POST",
                            headers,
                            body: requestPayload,
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        const responseBody = await response.text();
                        console.log(`📡 [Webhook Proxy] Status: ${response.status} | Intento: ${typeStr}`);
                        
                        if (response.ok) {
                            n8nSuccess = true;
                            console.log(`✅ [DEBUG] n8n respondió OK: ${responseBody || 'Success'}`);
                            try {
                                const parsedResponse = JSON.parse(responseBody);
                                if (parsedResponse.jobId) {
                                    n8nJobId = parsedResponse.jobId;
                                }
                            } catch (e) {
                                // Not JSON, ignore
                            }
                        } else {
                            console.error(`❌ [DEBUG] n8n respondió con error ${response.status}:`, responseBody);
                            if (!isFallback) n8nError = responseBody;
                        }
                    } catch (e: any) {
                        if (e.name === 'AbortError') {
                            console.error(`❌ Timeout en intento ${typeStr}`);
                            n8nError = "Timeout reaching n8n";
                        } else {
                            console.error(`❌ Error fatal en doRequest (${typeStr}):`, e.message);
                            n8nError = e.message;
                        }
                    }
                };

                // Intento 1: Principal (Destino dinámico o .env)
                await doRequest(webhookDestino);

                // Intento 2: Fallback Público (si falla el primero)
                if (!n8nSuccess) {
                    const publicUrl = "https://n8n.pash.uno/webhook/gmm-new-request-prod";
                    console.log("🔄 Iniciando Fallback a URL pública (Prod Webhook)...");
                    await doRequest(publicUrl, true);
                }
            } catch (err: any) {
                n8nError = err.message;
                console.error("❌ Error de red al contactar a n8n:", err.message);
            }
        }

        if (!n8nSuccess && webhookDestino) {
            return NextResponse.json({
                error: "Los PDFs se generaron pero no se pudo enviar a n8n. Verifica que el workflow esté ACTIVO.",
                details: n8nError
            }, { status: 502 });
        }

        console.log(`✅ [DEBUG] Retornando al Dashboard: jobId=${jobId || n8nJobId} (n8nJobId=${n8nJobId})`);
        return NextResponse.json({
            success: true,
            message: `${documentosGenerados.length} PDF(s) generados y enviados a n8n en un solo request.`,
            prefijoUsado: prefijoFecha,
            documentosGenerados: documentosGenerados.length,
            jobId: jobId || n8nJobId,
            status: "processing"
        });

    } catch (error: any) {
        console.error("Error Generador de PDF API:", error);
        return NextResponse.json({ error: "Error en el Creador de PDFs." }, { status: 500 });
    }
}
