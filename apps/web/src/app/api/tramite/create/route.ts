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
        
        console.log(`[E2E-BACKEND] 🚀 Recibida solicitud de creación. TraceID: ${traceId}`);

        // 🧩 Extract metadata
        const siniestroId = formData.get("siniestro_id") as string;
        const tipo = formData.get("tipo") as string;
        const facturasRaw = formData.get("facturas") as string;
        const facturas = facturasRaw ? JSON.parse(facturasRaw) : [];

        console.log(`[E2E-BACKEND] 📦 Metadata: SiniestroID=${siniestroId}, Tipo=${tipo}, Facturas=${facturas.length}`);

        if (!siniestroId || !tipo) {
            console.error("[E2E-BACKEND] ❌ Faltan datos obligatorios.");
            return NextResponse.json({ error: "Faltan datos obligatorios (siniestro_id, tipo)" }, { status: 400 });
        }

        const supabase = getSupabaseService();
        // 🔄 FIX: NextAuth Google IDs are numeric strings. Supabase expects UUID.
        const isSessionIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);
        const validDbUserId = isSessionIdUuid ? session.user.id : "e2ce3a8c-1436-4b2a-a40d-af0a46612231";
        
        let targetSiniestroId = siniestroId;

        // 🔗 1. GESTIÓN DE SINIESTROS (Sync on-the-fly)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siniestroId);
        
        if (!isUuid || (isUuid && session.user.role !== 'admin')) {
            let query = supabase.from("siniestros").select("*");
            
            if (isUuid) {
                query = query.eq("id", siniestroId);
            } else {
                const cleanSNum = siniestroId.split('-').slice(0, 2).join('-');
                query = query.eq("numero_siniestro", cleanSNum);
            }

            const { data: existingSiniestro } = await query.single();

            if (existingSiniestro) {
                targetSiniestroId = existingSiniestro.id;
                const isTestSiniestro = existingSiniestro?.numero_siniestro?.startsWith('SINI-TEST');
                console.log(`[E2E-DEBUG] Validando Siniestro: ${existingSiniestro?.numero_siniestro}. TestMode: ${isTestSiniestro}. UserID: ${session.user.id}. SiniestroOwner: ${existingSiniestro?.user_id}`);
            } else if (!isUuid) {
                console.log("[BACKEND] Provisionando siniestro legacy:", siniestroId);
                const sNumPrefix = siniestroId.split('-').slice(0, 2).join('-');
                
                const { data: newSiniestro, error: nsError } = await supabase
                    .from("siniestros")
                    .insert({
                        numero_siniestro: sNumPrefix,
                        nombre_siniestro: formData.get("nombre_siniestro") as string || "Trámite Migrado (Sheets)",
                        user_id: validDbUserId,
                        descripcion: "Migrado automáticamente desde Google Sheets por el Orchestrator."
                    })
                    .select()
                    .single();

                if (nsError) {
                    console.error("[BACKEND] Error provisionando siniestro:", nsError);
                    throw new Error("Error al sincronizar el siniestro legacy.");
                }
                targetSiniestroId = newSiniestro.id;
            } else {
                return NextResponse.json({ error: "Siniestro no encontrado" }, { status: 404 });
            }
        }

        // 🧾 2. Crear trámite (Initial state: pending)

        const { data: tramite, error: tError } = await supabase
            .from("tramites")
            .insert({
                siniestro_id: targetSiniestroId,
                tipo: tipo,
                status: "pending", 
                user_id: validDbUserId
            })
            .select()
            .single();

        if (tError) {
            console.error("[E2E-BACKEND] ❌ Error al insertar trámite en DB:", tError);
            throw tError;
        }

        console.log(`[E2E-BACKEND] ✅ Trámite insertado en DB con ID: ${tramite.id}`);

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
