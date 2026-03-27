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

                const doRequest = () => new Promise<void>((resolve) => {
                    const url = new URL(webhookDestino);
                    let isHttps = url.protocol === 'https:';
                    let reqModule: any = isHttps ? https : http;

                    const options: any = {
                        method: 'POST',
                        hostname: url.hostname,
                        port: url.port || (isHttps ? 443 : 80),
                        path: url.pathname + url.search,
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(requestPayload)
                        },
                        timeout: 30000,
                        rejectUnauthorized: false
                    };

                    if (process.env.N8N_WEBHOOK_HOST_HEADER) {
                        options.headers['Host'] = process.env.N8N_WEBHOOK_HOST_HEADER;
                        
                        // Si estamos usando Host override hacia Traefik localmente,
                        // forzamos HTTPS en el puerto 443 con SNI para evitar el Redirect 308 de Traefik HTTP->HTTPS
                        isHttps = true;
                        reqModule = https;
                        options.port = 443;
                        options.servername = process.env.N8N_WEBHOOK_HOST_HEADER; // SNI para Traefik
                    }

                    const req = reqModule.request(options, (res: any) => {
                        let responseBody = '';
                        res.on('data', (chunk: any) => responseBody += chunk);
                        res.on('end', () => {
                            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                                n8nSuccess = true;
                                console.log(`✅ [DEBUG] n8n respondió OK (Status ${res.statusCode})`);
                            } else if (res.statusCode === 308 || res.statusCode === 301 || res.statusCode === 302) {
                                n8nError = `Redirected to ${res.headers.location}. Asegúrate de usar HTTPS en el N8N_WEBHOOK_URL o el bypass SNI falló.`;
                                console.error(`❌ [DEBUG] n8n respondió con REDIRECT (Status ${res.statusCode}):`, res.headers.location);
                            } else {
                                n8nError = responseBody;
                                console.error(`❌ [DEBUG] n8n respondió con ERROR (Status ${res.statusCode}):`, n8nError);
                            }
                            resolve();
                        });
                    });

                    req.on('error', (err: any) => {
                        n8nError = `${err.code || 'UNKNOWN'}: ${err.message}`;
                        console.error(`❌ Error de red al contactar a n8n (${err.code}):`, err.message);
                        if (err.syscall) console.error(`  Syscall: ${err.syscall}`);
                        resolve();
                    });

                    req.on('timeout', () => {
                        req.destroy();
                        n8nError = 'Timeout after 30000ms';
                        console.error("❌ Error de red al contactar a n8n (Timeout):", n8nError);
                        resolve();
                    });

                    req.write(requestPayload);
                    req.end();
                });

                await doRequest();
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
