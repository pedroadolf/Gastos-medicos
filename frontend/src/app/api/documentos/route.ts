import { NextRequest, NextResponse } from "next/server";
import { getSupabaseService, supabaseUrl } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        console.log("📥 [POST] /api/documentos: Iniciando recepción de URLs firmadas (v2.0)...");
        
        // El frontend ahora envía JSON directamente, no FormData multipart
        const payload = await req.json();
        const { siniestroId, asegurado, tipoTramite, grupoA_anexos, grupoB_facturas, metadata } = payload;
        
        const totalFiles = (grupoA_anexos?.length || 0) + (grupoB_facturas?.length || 0);
        console.log(`📂 [POST] Payload recibido. Total archivos: ${totalFiles}. Metadata:`, metadata);

        if (totalFiles === 0) {
            console.warn("⚠️ [POST] No se detectaron archivos en el payload.");
            return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
        }

        console.log(`🚀 [QUEUE] Creando Job en Supabase ${supabaseUrl}...`);

        // 1. Crear el Job en Supabase usando Service Role centralizado
        const supabaseService = getSupabaseService();

        const { data: job, error: jobError } = await supabaseService
            .from('jobs')
            .insert([
                { 
                    status: 'processing', 
                    file_count: totalFiles,
                    metadata: {
                        ...metadata,
                        siniestroId,
                        asegurado,
                        tipoTramite,
                        // Guardamos las URLs iniciales en el job como referencia
                        grupoA_anexos,
                        grupoB_facturas
                    }
                }
            ])
            .select()
            .single();

        if (jobError) {
            console.error("❌ [POST] Error creando Job en Supabase:", jobError);
            return NextResponse.json({ 
                error: "Error al iniciar proceso en Base de Datos", 
                details: jobError.message,
                hint: jobError.hint,
                code: jobError.code,
                target: supabaseUrl
            }, { status: 500 });
        }

        const jobId = job.id;
        console.log(`✅ [POST] Job creado exitosamente. ID: ${jobId}`);

        // 2. Disparar webhook de n8n para que el agente inicie el procesamiento
        // El agente en n8n recibirá las URLs, procesará el Grupo B e integrará el Grupo A.
        const n8nWebhook = process.env.N8N_WEBHOOK_URL;
        
        if (n8nWebhook) {
            console.log(`🔗 [NOTIFY] Enviando payload a webhook n8n: ${n8nWebhook}`);
            
            // Hacemos el llamado a n8n en el background pero capturamos errores si los hay temprano
            fetch(n8nWebhook, {
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
            }).then(resp => {
                if (!resp.ok) {
                    console.error("⚠️ [NOTIFY] El webhook de n8n devolvió un error:", resp.status);
                } else {
                    console.log("✅ [NOTIFY] Webhook de n8n disparado exitosamente.");
                }
            }).catch(e => {
                console.error("❌ [NOTIFY] Error al contactar webhook de n8n:", e);
                // Si falla el webhook inmediato, podríamos marcar el job como failed
                supabaseService
                    .from('jobs')
                    .update({ status: 'failed', error_message: 'Error de conexión con orchestrador n8n' })
                    .eq('id', jobId);
            });
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
