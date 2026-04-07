import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseService } from "@/services/supabase";
import { PdfEngine } from "@/services/pdfEngine";
import { AuditorService, type AuditFinding } from "@/services/auditorService";
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
        if (session.user.role !== 'admin') {
            const { data: siniestro, error: sError } = await supabase
                .from("siniestros")
                .select("id")
                .eq("id", siniestroId)
                .eq("user_id", session.user.id)
                .single();
            
            if (sError || !siniestro) {
                return NextResponse.json({ error: "No tienes permiso para crear trámites en este siniestro" }, { status: 403 });
            }
        }

        // 🧾 1. Crear trámite (Initial state: pending)
        const { data: tramite, error: tError } = await supabase
            .from("tramites")
            .insert({
                siniestro_id: siniestroId,
                tipo: tipo,
                status: "pending", 
                user_id: session.user.id
            })
            .select()
            .single();

        if (tError) throw tError;

        // 🛡️ BLOQUEO ATÓMICO (Atomic Lock)
        // Pasamos a 'processing' inmediatamente para habilitar el flujo enterprise.
        const { data: isLocked, error: lError } = await supabase.rpc('lock_tramite', {
            p_id: tramite.id,
            p_owner: 'API_ORCHESTRATOR'
        });

        if (lError || !isLocked) {
            throw new Error("No se pudo obtener el bloqueo del trámite para procesamiento.");
        }

        // 🔄 TRANSICIÓN OBLIGATORIA A 'PROCESSING' (v4.4 Requirement)
        await supabase.from("tramites").update({ status: "processing" }).eq("id", tramite.id);

        // 📊 Registrar LOG inicial
        await supabase.from("workflow_logs").insert({
            tramite_id: tramite.id,
            step: "CREATION",
            status: "success",
            message: `Trámite ${tramite.folio || tramite.id} iniciado en modo determinista.`,
            metadata: { user_id: session.user.id, tipo, trace_id: traceId }
        });

        // 🧾 2. Guardar facturas
        if (facturas.length > 0) {
            const facturasPayload = facturas.map((f: any) => ({
                tramite_id: tramite.id,
                rfc_emisor: f.rfc_emisor || "",
                nombre_emisor: f.nombre_emisor || "",
                monto_total: parseFloat(f.monto_total || f.importe) || 0,
                tipo: f.tipo || "O"
            }));

            const { error: fError } = await supabase.from("facturas").insert(facturasPayload);

            if (fError) {
                console.error("[BACKEND] Error al insertar facturas:", fError);
                await supabase.from("workflow_logs").insert({
                    tramite_id: tramite.id,
                    step: "FACTURAS",
                    status: "error",
                    message: "Error al registrar facturas en base de datos",
                    metadata: { error: fError }
                });
            }
        }

        // 📎 3. Subir archivos a Storage
        const files: { [key: string]: File } = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) files[key] = value;
        }

        const bucketName = "documentos";
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

        // 🚀 4.4 MOTOR DE DOCUMENTOS (PDF Engine)
        await supabase.from("workflow_logs").insert({
            tramite_id: tramite.id,
            step: "PDF_ENGINE",
            status: "processing",
            message: "Generando adjuntos dinámicos y formatos de aseguradora..."
        });

        try {
            const generatedPdfs = await PdfEngine.generateExpediente(tramite.id);
            for (const pdf of generatedPdfs) {
                const fileName = `${tramite.id}/AUTO_${Date.now()}-${pdf.name}`;
                const { data: uploadData, error: uError } = await supabase.storage
                    .from(bucketName)
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
        } catch (pdfErr) {
            console.error("[BACKEND] Error PDF Engine:", pdfErr);
        }

        // 🚀 4.5 AUDITORÍA EN TIEMPO REAL
        await supabase.from("workflow_logs").insert({
            tramite_id: tramite.id,
            step: "AUDIT_ENGINE",
            status: "processing",
            message: "Iniciando auditoría inteligente con Gemini-1.5-Pro..."
        });

        let auditFindings = await AuditorService.auditTramite(tramite.id);
        const isApproved = !auditFindings.some(f => f.severity === 'error');

        // 📦 4.6 ZIP Engine
        let zipUrl = null;
        if (isApproved) {
            await supabase.from("workflow_logs").insert({
                tramite_id: tramite.id,
                step: "ZIP_ENGINE",
                status: "processing",
                message: "Empaquetando expediente digital..."
            });
            zipUrl = await generateZip(tramite.id);
        }

        // 🚀 5. Liberar Bloqueo (Unlock)
        await supabase.rpc('unlock_tramite', { p_id: tramite.id });

        // 🚀 6. Disparar n8n (Async)
        const n8nUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nUrl) {
            fetch(n8nUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trace_id: traceId,
                    tramite_id: tramite.id,
                    zip_url: zipUrl,
                    status: isApproved ? "audited" : "error",
                    source: "dashboard-v4"
                })
            }).catch(err => console.error("[BACKEND] n8n error:", err));
        }

        return NextResponse.json({
            success: true,
            tramite_id: tramite.id,
            status: isApproved ? "audited" : "error"
        });

    } catch (error: any) {
        console.error("[BACKEND ERROR]:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
