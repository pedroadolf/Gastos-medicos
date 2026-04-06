import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseService } from "@/services/supabase";
import { PdfEngine } from "@/services/pdfEngine";
import { AuditorService } from "@/services/auditorService";
import { generateZip } from "@/services/zipEngine";



/**
 * 🚀 ENDPOINT: Create full claim procedure (Tramite)
 * Handles:
 * 1. Metadata creation (Tramite record)
 * 2. Dynamic Invoices (Facturas table)
 * 3. File Uploads (Supabase Storage + Adjuntos table)
 * 4. n8n Audit Engine trigger
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const traceId = crypto.randomUUID();
        
        // 🧩 Extract metadata
        const siniestroId = formData.get("siniestro_id") as string;
        const tipo = formData.get("tipo") as string;
        const facturasRaw = formData.get("facturas") as string;
        const facturas = facturasRaw ? JSON.parse(facturasRaw) : [];

        if (!siniestroId || !tipo) {
            return NextResponse.json({ error: "Faltan datos obligatorios (siniestro_id, tipo)" }, { status: 400 });
        }

        const supabase = getSupabaseService();

        // 🔐 VERIFICACIÓN DE PROPIEDAD (Ownership Check)
        // Como usamos service role client (bypass RLS), verificamos manual.
        if (session.user.role !== 'admin') {
            const { data: siniestro, error: sError } = await supabase
                .from("siniestros")
                .select("id")
                .eq("id", siniestroId)
                .eq("user_id", session.user.id)
                .single();
            
            if (sError || !siniestro) {
                console.error(`[BACKEND] Ownership mismatch: user ${session.user.id} tried accessing siniestro ${siniestroId}`);
                return NextResponse.json({ error: "No tienes permiso para crear trámites en este siniestro" }, { status: 403 });
            }
        }

        // 🧾 1. Crear trámite
        const { data: tramite, error: tError } = await supabase
            .from("tramites")
            .insert({
                siniestro_id: siniestroId,
                tipo: tipo,
                status: "borrador"
            })
            .select()
            .single();

        if (tError) throw tError;

        // 📊 Registrar LOG inicial
        await supabase.from("system_logs").insert({
            trace_id: traceId,
            agent: "backend-api",
            workflow: "create-tramite",
            status: "success",
            message: `Trámite ${tramite.id} creado para siniestro ${siniestroId}`,
            metadata: { user_id: session.user.id, tipo }
        });

        // 🧾 2. Guardar facturas
        if (facturas.length > 0) {
            const facturasPayload = facturas.map((f: any) => ({
                tramite_id: tramite.id,
                numero_factura: f.numero_factura || f.numero || "",
                importe: parseFloat(f.importe) || 0,
                tipo_gasto: f.tipo_gasto || f.tipo || "O"
            }));

            const { error: fError } = await supabase
                .from("facturas")
                .insert(facturasPayload);

            if (fError) {
                console.error("[BACKEND] Error al insertar facturas:", fError);
                await supabase.from("system_logs").insert({
                    trace_id: traceId,
                    severity: "error",
                    message: "Error al registrar facturas",
                    metadata: { error: fError, tramite_id: tramite.id }
                });
            }
        }

        // 📎 3. Subir archivos a Storage y registrar adjuntos
        const files: { [key: string]: File } = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                files[key] = value;
            }
        }

        const adjuntosPayload: any[] = [];

        for (const [docName, file] of Object.entries(files)) {
            // Generar ruta única en el bucket 'documentos'
            const fileName = `${tramite.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            
            const buffer = await file.arrayBuffer();
            const { data: uploadData, error: uError } = await supabase.storage
                .from("documentos")
                .upload(fileName, buffer, { // Pasamos buffer para asegurar compatibilidad server-side
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uError) {
                console.error(`[BACKEND] Error subiendo archivo ${docName}:`, uError);
                continue;
            }

            adjuntosPayload.push({
                tramite_id: tramite.id,
                tipo_documento: docName, 
                file_path: uploadData.path,
                file_name: file.name
            });
        }

        if (adjuntosPayload.length > 0) {
            const { error: aError } = await supabase
                .from("adjuntos")
                .insert(adjuntosPayload);
                
            if (aError) console.error("[BACKEND] Error al registrar adjuntos:", aError);
        }

        // 🚀 4. GENERACIÓN AUTOMÁTICA DE PDFs (PDF Engine)
        try {
            console.log(`[BACKEND] Inyectando PDF Engine para trámite ${tramite.id}...`);
            const generatedPdfs = await PdfEngine.generateExpediente(tramite.id);
            const extraAdjuntos = [];

            for (const pdf of generatedPdfs) {
                const fileName = `${tramite.id}/AUTO_${Date.now()}-${pdf.name}`;
                
                const { data: uploadData, error: uError } = await supabase.storage
                    .from("documentos")
                    .upload(fileName, pdf.buffer, {
                        contentType: 'application/pdf',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (!uError && uploadData) {
                    extraAdjuntos.push({
                        tramite_id: tramite.id,
                        tipo_documento: pdf.name.toLowerCase().includes('srgmm') ? 'form_srgmm_auto' : 'form_remesa_auto',
                        file_path: uploadData.path,
                        file_name: pdf.name
                    });
                } else {
                    console.error(`[BACKEND] Error subiendo PDF generado ${pdf.name}:`, uError);
                }
            }

            if (extraAdjuntos.length > 0) {
                await supabase.from("adjuntos").insert(extraAdjuntos);
                console.log(`[BACKEND] ${extraAdjuntos.length} PDFs automáticos registrados.`);
            }

        } catch (pdfErr) {
            console.error("[BACKEND] Error crítico en PDF Engine:", pdfErr);
            await supabase.from("system_logs").insert({
                trace_id: traceId,
                severity: "error",
                message: "Fallo generación automática de PDFs",
                metadata: { error: pdfErr, tramite_id: tramite.id }
            });
        }

        // 🚀 4.5 AUDITORÍA EN TIEMPO REAL
        let auditResults = { approved: true, findings_count: 0 };
        try {
            const findings = await AuditorService.auditTramite(tramite.id);
            auditResults = {
                approved: !findings.some(f => f.severity === 'error'),
                findings_count: findings.length
            };
        } catch (auditErr) {
            console.error("[BACKEND] Auditor fail:", auditErr);
        }

        // 📦 4.6 ZIP Engine (FINAL PACKAGING)
        let zipUrl = null;
        try {
            console.log(`[BACKEND] Starting ZIP generation for ${tramite.id}...`);
            zipUrl = await generateZip(tramite.id);
        } catch (zipErr) {
            console.error("[BACKEND] ZIP Engine Error:", zipErr);
        }

        // 🚀 5. Disparar n8n
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nUrl) {
            try {
                // Preparamos payload enriquecido para n8n
                const n8nPayload = {
                    trace_id: traceId,
                    tramite_id: tramite.id,
                    siniestro_id: siniestroId,
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        role: session.user.role
                    },
                    tipo: tipo,
                    audit: auditResults,
                    zip_url: zipUrl,
                    metadata: {
                        facturas_count: facturas.length,
                        adjuntos_count: adjuntosPayload.length
                    },
                    source: "dashboard-v2"
                };

                // Disparo asíncrono
                fetch(n8nUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(n8nPayload)
                }).then(async (res) => {
                    const status = res.ok ? "success" : "error";
                    await supabase.from("system_logs").insert({
                        trace_id: traceId,
                        agent: "n8n-trigger",
                        status,
                        message: res.ok ? "Workflow n8n disparado" : `Error n8n: ${res.statusText}`,
                        metadata: { response_status: res.status }
                    });
                }).catch(err => console.error("[BACKEND] Error al disparar n8n:", err));

            } catch (err) {
                console.error("[BACKEND] Error al contactar con n8n:", err);
            }
        }

        return NextResponse.json({
            success: true,
            tramite_id: tramite.id,
            trace_id: traceId,
            status: "creado"
        });

    } catch (error: any) {
        console.error("[BACKEND ERROR]:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
