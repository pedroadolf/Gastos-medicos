import { NextRequest, NextResponse } from "next/server";
import { getSupabaseService, supabaseUrl } from "@/services/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        console.log("📥 [POST] /api/documentos: Iniciando recepción de URLs firmadas (v2.0)...");
        
        // Auth check - ensure user is logged in
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const userId = session.user.id;
        console.log(`👤 [POST] Usuario: ${userId} (${session.user.email})`);

        // El frontend ahora envía JSON directamente, no FormData multipart
        const payload = await req.json();
        const { siniestroId, asegurado, tipoTramite, grupoA_anexos = [], grupoB_facturas = [], metadata } = payload;
        
        const totalFiles = grupoA_anexos.length + grupoB_facturas.length;
        
        console.log(`📂 [POST] Payload recibido. Total archivos: ${totalFiles}. Metadata:`, JSON.stringify(metadata, null, 2));

        if (totalFiles === 0) {
            console.warn("⚠️ [POST] No se detectaron archivos en el payload.");
            return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
        }

        // 1. Resolver Siniestro (Crear si es nuevo)
        const supabaseService = getSupabaseService();
        let finalSiniestroId = siniestroId;

        if (siniestroId === "SIN_NUEVO") {
            console.log("🆕 [DB] Creando nuevo Siniestro...");
            const { data: newSiniestro, error: sinError } = await supabaseService
                .from('siniestros')
                .insert([
                    {
                        user_id: userId,
                        nombre_siniestro: asegurado?.padecimiento || `Trámite ${tipoTramite}`,
                        numero_siniestro: `PEND-${Date.now().toString().slice(-6)}`
                    }
                ])
                .select()
                .single();

            if (sinError) {
                console.error("❌ [DB] Error creando Siniestro:", sinError);
                return NextResponse.json({ error: "Error al crear siniestro context", details: sinError.message }, { status: 500 });
            }
            finalSiniestroId = newSiniestro.id;
        }

        // 2. Crear Trámite (para visibilidad inmediata en Dashboard)
        console.log(`📑 [DB] Creando Trámite para siniestro: ${finalSiniestroId}...`);
        const { data: tramite, error: tramiteError } = await supabaseService
            .from('tramites')
            .insert([
                {
                    siniestro_id: finalSiniestroId,
                    tipo: tipoTramite,
                    status: 'procesando'
                }
            ])
            .select()
            .single();

        if (tramiteError) {
            console.error("❌ [DB] Error creando Trámite:", tramiteError);
            return NextResponse.json({ error: "Error al registrar trámite", details: tramiteError.message }, { status: 500 });
        }

        const jobId = tramite.id; // Usamos el ID del trámite como ID de proceso unificado
        console.log(`✅ [DB] Trámite creado exitosamente. ID: ${jobId}`);

        // 3. Crear el Job (Legacy/Tracking complementario)
        const { error: jobError } = await supabaseService
            .from('jobs')
            .insert([
                { 
                    id: jobId, // Match con el trámite
                    status: 'processing', 
                    file_count: totalFiles,
                    metadata: {
                        ...metadata,
                        siniestroId: finalSiniestroId,
                        asegurado,
                        tipoTramite,
                        grupoA_anexos,
                        grupoB_facturas
                    }
                }
            ]);

        // 5. Registrar archivos en la base de datos (adjuntos/facturas)
        const results = [...grupoA_anexos, ...grupoB_facturas];
        console.log(`📑 [API Documentos] Registrando ${results.length} archivos en DB...`);
        
        for (const result of results) {
          if (result.url) {
            const isFactura = result.name.toLowerCase().endsWith('.xml');
            
            if (isFactura) {
              // Registrar en la tabla 'facturas'
              await supabaseService.from('facturas').insert({
                tramite_id: jobId,
                archivo_storage_path: result.url,
                nombre_archivo: result.name,
                estado: 'pendiente'
              });
            } else {
              // Registrar en la tabla 'adjuntos'
              await supabaseService.from('adjuntos').insert({
                tramite_id: jobId,
                storage_path: result.url,
                nombre_archivo: result.name,
                tipo_archivo: result.name.split('.').pop() || 'unknown'
              });
            }
          }
        }

        // 6. Notificar a n8n para iniciar el procesamiento
        console.log("🚀 [API Documentos] Notificando a n8n...");
        const n8nWebhook = process.env.N8N_WEBHOOK_URL;
        
        if (n8nWebhook) {
            console.log(`🔗 [NOTIFY] Enviando payload a webhook n8n: ${n8nWebhook}`);
            
            try {
                // AWAIT el llamado para asegurar que llegue a n8n antes de que el proceso termine
                const resp = await fetch(n8nWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: jobId,
                        siniestroId,
                        asegurado,
                        tipoTramite,
                        grupoA_anexos,
                        grupoB_facturas,
                        metadata
                    })
                });

                if (!resp.ok) {
                    const errorBody = await resp.text().catch(() => "Cuerpo de error ilegible");
                    console.error(`⚠️ [NOTIFY] El webhook de n8n devolvió un error ${resp.status}:`, errorBody);
                    
                    // Guardamos el detalle del error en Supabase para que el usuario pueda reportarlo con precisión
                    await supabaseService
                        .from('jobs')
                        .update({ 
                            status: 'failed', 
                            error_message: `Fallo HTTP ${resp.status} al contactar orquestador. Detalle: ${errorBody.substring(0, 200)}`
                        })
                        .eq('id', jobId);
                } else {
                    console.log("✅ [NOTIFY] Webhook de n8n disparado exitosamente.");
                }
            } catch (e: any) {
                console.error("❌ [NOTIFY] Error al contactar webhook de n8n:", e);
                await supabaseService
                    .from('jobs')
                    .update({ status: 'failed', error_message: 'Error de red con orchestrador n8n (revisa N8N_WEBHOOK_URL): ' + e.message })
                    .eq('id', jobId);
            }
        } else {
            console.warn("⚠️ [NOTIFY] N8N_WEBHOOK_URL no está definido en .env");
        }

        // 3. Responder de inmediato al frontend
        return NextResponse.json({ 
            success: true, 
            jobId: jobId, 
            message: "Archivos guardados en Storage y proceso iniciado en n8n." 
        });

    } catch (error: any) {
        console.error("❌ [POST] Error inesperado en API Documentos:", error);
        return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
    }
}
