import { NextRequest, NextResponse } from "next/server";
import { llenarFormatoGMM } from "@/lib/pdfGenerator";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

export async function POST(req: NextRequest) {
    try {
        const { datosExtraidos, webHookUrl_n8n, plantillaSeleccionada, plantillasMultiples, archivosManuales } = await req.json();

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
                        googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "root"
                    }
                });

                const doRequest = async (targetUrl: string, isFallback: boolean = false) => {
                    return new Promise<void>((resolve) => {
                        try {
                            const url = new URL(targetUrl);
                            const isHttps = url.protocol === 'https:';
                            const reqModule: any = isHttps ? https : http;

                            const options: any = {
                                method: 'POST',
                                hostname: url.hostname,
                                port: url.port || (isHttps ? 443 : 80),
                                path: url.pathname + url.search,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': Buffer.byteLength(requestPayload)
                                },
                                timeout: 10000,
                                rejectUnauthorized: false
                            };

                            if (process.env.N8N_WEBHOOK_HOST_HEADER && !isHttps) {
                                options.headers['Host'] = process.env.N8N_WEBHOOK_HOST_HEADER;
                            }

                            const typeStr = isFallback ? 'FALLBACK PÚBLICO' : 'INTERNO DOCKER';
                            console.log(`📡 [Webhook Proxy] Intentando ${typeStr}: ${url.hostname}:${options.port}${url.pathname}`);

                            const req = reqModule.request(options, (res: any) => {
                                let responseBody = '';
                                res.on('data', (chunk: any) => responseBody += chunk);
                                res.on('end', () => {
                                    console.log(`📡 [Webhook Proxy] Status: ${res.statusCode} | Intento: ${typeStr}`);
                                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                                        n8nSuccess = true;
                                        console.log(`✅ [DEBUG] n8n respondió OK: ${responseBody || 'Success'}`);
                                    } else {
                                        console.error(`❌ [DEBUG] n8n respondió con error ${res.statusCode}:`, responseBody);
                                        if (!isFallback) n8nError = responseBody;
                                    }
                                    resolve();
                                });
                            });

                            req.on('error', (err: any) => {
                                console.error(`❌ Error en intento ${typeStr} (${err.code}):`, err.message);
                                n8nError = err.message;
                                resolve();
                            });

                            req.on('timeout', () => {
                                req.destroy();
                                console.error(`❌ Timeout en intento ${typeStr}`);
                                n8nError = "Timeout reaching n8n";
                                resolve();
                            });

                            req.write(requestPayload);
                            req.end();
                        } catch (e: any) {
                            console.error(`❌ Error fatal en doRequest (${isFallback ? 'fallback' : 'interno'}):`, e.message);
                            n8nError = e.message;
                            resolve();
                        }
                    });
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

        return NextResponse.json({
            success: true,
            message: `${documentosGenerados.length} PDF(s) generados y enviados a n8n en un solo request.`,
            prefijoUsado: prefijoFecha,
            documentosGenerados: documentosGenerados.length
        });

    } catch (error: any) {
        console.error("Error Generador de PDF API:", error);
        return NextResponse.json({ error: "Error en el Creador de PDFs." }, { status: 500 });
    }
}
