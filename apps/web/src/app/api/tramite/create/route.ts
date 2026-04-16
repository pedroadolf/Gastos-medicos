import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseService } from "@/services/supabase";
import { PdfEngine } from "@/services/pdfEngine";
import { AuditorService } from "@/services/auditorService";
import { generateZip } from "@/services/zipEngine";

/**
 * 🚀 ENDPOINT SRE-READY (V12.1)
 * Refactorizado para observabilidad total en Grafana.
 * Implementa Protocolo Event-Driven: workflow_executions + workflow_steps.
 */
export async function POST(req: Request) {
    const traceId = crypto.randomUUID();
    const executionId = crypto.randomUUID();
    const startTime = Date.now();
    const supabase = getSupabaseService();

    // 🔴 1. INITIALIZE EXECUTION (Observability Root)
    await supabase.from("workflow_executions").insert({
        execution_id: executionId,
        correlation_id: traceId,
        idempotency_key: traceId,
        status: "processing",
        start_time: new Date().toISOString(),
        workflow_name: "tramite_e2e",
        workflow_version: "v12.1",
        timeout_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
    });

    // 🧠 Helper: Universal Step Logger
    const runStep = async (stepName: string, fn: () => Promise<any>) => {
        const stepStart = Date.now();
        await supabase.from("workflow_steps").insert({
            execution_id: executionId,
            step_name: stepName,
            status: "processing",
            start_time: new Date().toISOString()
        });

        try {
            const result = await fn();
            await supabase.from("workflow_steps").insert({
                execution_id: executionId,
                step_name: stepName,
                status: "success",
                duration_ms: Date.now() - stepStart,
                end_time: new Date().toISOString()
            });
            return result;
        } catch (error: any) {
            await supabase.from("workflow_steps").insert({
                execution_id: executionId,
                step_name: stepName,
                status: "error",
                duration_ms: Date.now() - stepStart,
                error_type: error?.message || "unknown_error",
                end_time: new Date().toISOString()
            });
            throw error;
        }
    };

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) throw new Error("No autorizado");

        const formData = await req.formData();
        const siniestroId = formData.get("siniestro_id") as string;
        const tipo = formData.get("tipo") as string;
        const facturasRaw = formData.get("facturas") as string;
        const facturas = facturasRaw ? JSON.parse(facturasRaw) : [];

        if (!siniestroId || !tipo) throw new Error("Faltan datos obligatorios (siniestro_id, tipo)");

        // 🔄 FIX USER ID: NextAuth Google IDs are numeric strings.
        const isSessionIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);
        const validDbUserId = isSessionIdUuid ? session.user.id : "e2ce3a8c-1436-4b2a-a40d-af0a46612231";

        // 🔗 STEP 1: SINIESTRO SYNC
        const targetSiniestroId = await runStep("sync_siniestro", async () => {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siniestroId);
            
            if (!isUuid || (isUuid && session.user.role !== 'admin')) {
                let query = supabase.from("siniestros").select("*");
                if (isUuid) {
                    query = query.eq("id", siniestroId);
                } else {
                    const cleanSNum = siniestroId.split('-').slice(0, 2).join('-');
                    query = query.eq("numero_siniestro", cleanSNum);
                }

                const { data: existingSiniestro } = await query.maybeSingle();

                if (existingSiniestro) {
                    return existingSiniestro.id;
                } else if (!isUuid) {
                    // Provisioning legacy siniestro
                    const sNumPrefix = siniestroId.split('-').slice(0, 2).join('-');
                    const { data: newSiniestro, error: nsError } = await supabase
                        .from("siniestros")
                        .insert({
                            numero_siniestro: sNumPrefix,
                            nombre_siniestro: formData.get("nombre_siniestro") as string || "Trámite Migrado (Sheets)",
                            user_id: validDbUserId
                        })
                        .select()
                        .single();

                    if (nsError) throw new Error(`Error provisioning legacy siniestro: ${nsError.message}`);
                    return newSiniestro.id;
                } else {
                    throw new Error("Siniestro no encontrado");
                }
            }
            return siniestroId;
        });

        // 🧾 STEP 2: CREATE TRAMITE
        const tramite = await runStep("create_tramite", async () => {
            const { data, error } = await supabase
                .from("tramites")
                .insert({
                    siniestro_id: targetSiniestroId,
                    tipo: tipo,
                    status: "pending",
                    user_id: validDbUserId
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        });

        // 🔗 Correlation Update
        await supabase.from("workflow_executions")
            .update({ tramite_id: tramite.id })
            .eq("execution_id", executionId);

        // 🛡️ ATOMIC LOCK
        await runStep("lock_tramite", async () => {
            const { data: isLocked, error: lError } = await supabase.rpc('lock_tramite', {
                p_id: tramite.id,
                p_owner: 'API_ORCHESTRATOR_V12'
            });
            if (lError || !isLocked) throw new Error("No se pudo obtener el bloqueo del trámite.");
            await supabase.from("tramites").update({ status: "processing" }).eq("id", tramite.id);
        });

        // 📎 STEP 3: UPLOAD FILES
        await runStep("upload_files", async () => {
            const files: { [key: string]: File } = {};
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) files[key] = value;
            }

            const bucketName = "gmm-uploads";
            for (const [docName, file] of Object.entries(files)) {
                const fileName = `${tramite.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const buffer = await file.arrayBuffer();

                const { data: uploadData, error: uError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, buffer, { contentType: file.type });

                if (!uError && uploadData) {
                    await supabase.from("adjuntos").insert({
                        tramite_id: tramite.id,
                        tipo_documento: docName,
                        file_path: uploadData.path,
                        file_name: file.name
                    });
                }
            }
        });

        // 📄 STEP 4: PDF ENGINE
        await runStep("pdf_engine", async () => {
            const generatedPdfs = await PdfEngine.generateExpediente(tramite.id);
            for (const pdf of generatedPdfs) {
                const fileName = `${tramite.id}/AUTO_${Date.now()}-${pdf.name}`;
                const { data: uploadData, error: uError } = await supabase.storage
                    .from("gmm-uploads")
                    .upload(fileName, pdf.buffer, { contentType: 'application/pdf' });

                if (!uError && uploadData) {
                    await supabase.from("adjuntos").insert({
                        tramite_id: tramite.id,
                        tipo_documento: pdf.name.toLowerCase().includes('srgmm') ? 'form_srgmm_auto' : 'form_remesa_auto',
                        file_path: uploadData.path,
                        file_name: pdf.name
                    });
                }
            }
        });

        // 🤖 STEP 5: AUDIT
        const auditFindings = await runStep("audit_engine", async () => {
            return await AuditorService.auditTramite(tramite.id);
        });
        const isApproved = !auditFindings.some((f: any) => f.severity === 'error');

        // 📦 STEP 6: ZIP ENGINE
        const zipUrl = await runStep("zip_engine", async () => {
            return await generateZip(tramite.id);
        });

        // 🚀 STEP 7: N8N DISPATCH
        await runStep("n8n_dispatch", async () => {
            const n8nUrl = process.env.N8N_WEBHOOK_URL;
            if (!n8nUrl) return;

            // Fetch metadata aliases for V12 compatibility
            const { data: dbSiniestro } = await supabase.from('siniestros').select('numero_siniestro, nombre_siniestro').eq('id', targetSiniestroId).maybeSingle();
            const { data: dbTramite } = await supabase.from('tramites').select('paciente_nombre').eq('id', tramite.id).maybeSingle();

            const numeroSiniestroReal = dbSiniestro?.numero_siniestro || "SINI-TEST-000";
            const titularReal = dbTramite?.paciente_nombre || dbSiniestro?.nombre_siniestro || "CLAUDIA FONSECA AGUILAR";

            await fetch(n8nUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    execution_id: executionId,
                    trace_id: traceId,
                    tramite_id: tramite.id,
                    tramite_tipo: tipo,
                    zip_url: zipUrl,
                    status: isApproved ? "audited" : "error_audit",
                    source: "dashboard-v4-obs",
                    usuario_email: session.user.email || "cfo@pash.uno",
                    usuario_nombre: session.user.user_metadata?.full_name || "Usuario",
                    titular_poliza: titularReal,
                    numero_poliza: "1101-GMM",
                    numero_siniestro: numeroSiniestroReal,
                    siniestro_id: targetSiniestroId,
                    // Alias for legacy support
                    TICKET_ID: numeroSiniestroReal,
                    emailAsegurado: session.user.email,
                    nombreAsegurado: titularReal
                })
            });
        });

        // 🏁 2. CLOSE EXECUTION (SUCCESS)
        await supabase.from("workflow_executions")
            .update({
                status: isApproved ? "success" : "warning",
                end_time: new Date().toISOString(),
                duration_ms: Date.now() - startTime
            })
            .eq("execution_id", executionId);

        return NextResponse.json({
            success: true,
            execution_id: executionId,
            tramite_id: tramite.id,
            status: isApproved ? "audited" : "error_audit"
        });

    } catch (error: any) {
        console.error("[SRE BACKEND ERROR]:", error);

        // 🏁 2. CLOSE EXECUTION (ERROR)
        await supabase.from("workflow_executions")
            .update({
                status: "error",
                end_time: new Date().toISOString(),
                duration_ms: Date.now() - startTime,
                error_type: error?.message || "fatal_error"
            })
            .eq("execution_id", executionId);

        return NextResponse.json({ 
            error: error.message || "Error interno del servidor",
            execution_id: executionId
        }, { status: 500 });
    }
}
