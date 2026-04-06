import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSupabaseService } from "@/services/supabase";
import { PdfEngine } from "@/services/pdfEngine";

/**
 * 🚀 ENDPOINT: Generate / Regenerate Claim PDFs
 * This can be triggered by n8n or the Dashboard.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { tramite_id } = await req.json();
        if (!tramite_id) {
            return NextResponse.json({ error: "Falta tramite_id" }, { status: 400 });
        }

        const supabase = getSupabaseService();

        // 🔐 TODO: Add ownership check here for extra security

        // 📄 1. Jale del PdfEngine
        console.log(`[BACKEND] Regenerando PDFs para el trámite ${tramite_id}...`);
        const generatedPdfs = await PdfEngine.generateExpediente(tramite_id);
        const adjuntosPayload = [];

        for (const pdf of generatedPdfs) {
            // El mismo patrón que en create/route.ts
            const fileName = `${tramite_id}/AUTO_${Date.now()}-${pdf.name}`;
            
            const { data: uploadData, error: uError } = await supabase.storage
                .from("documentos")
                .upload(fileName, pdf.buffer, {
                    contentType: 'application/pdf',
                    cacheControl: '3600',
                    upsert: false
                });

            if (!uError && uploadData) {
                adjuntosPayload.push({
                    tramite_id,
                    tipo_documento: pdf.name.toLowerCase().includes('srgmm') ? 'form_srgmm_auto' : 'form_remesa_auto',
                    file_path: uploadData.path,
                    file_name: pdf.name
                });
            } else {
                console.error(`[BACKEND] Error subiendo PDF generado ${pdf.name}:`, uError);
            }
        }

        // 🧾 2. Registrar en la base de datos
        if (adjuntosPayload.length > 0) {
            const { error: aError } = await supabase
                .from("adjuntos")
                .insert(adjuntosPayload);
            
            if (aError) console.error("[BACKEND] Error registrando adjuntos PDFs:", aError);
        }

        return NextResponse.json({
            success: true,
            generated: adjuntosPayload.length,
            message: "PDFs generados y guardados correctamente"
        });

    } catch (error: any) {
        console.error("[BACKEND ERROR - PDF Generate]:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
