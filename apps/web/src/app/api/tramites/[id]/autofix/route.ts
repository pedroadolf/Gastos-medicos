// /app/api/tramites/[id]/autofix/route.ts
import { NextResponse } from "next/server";
import { getSupabaseService } from "@/services/supabase";
import { withLock, assertState } from "@/lib/workflow-engine";

export async function POST(req: Request, { params }: any) {
  try {
    const supabase = getSupabaseService();
    const tramiteId = params.id;

    // 1. Obtener la URL del webhook de n8n
    const webhookUrl = process.env.N8N_AUTOFIX_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_AUTOFIX_URL no configurada en las variables de entorno." },
        { status: 500 }
      );
    }

    // 2. Pre-validación local (opcional: verificar retry_count)
    const { data: tramite, error: fetchError } = await supabase
      .from("tramites")
      .select("id, folio, retry_count, status")
      .eq("id", tramiteId)
      .single();

    if (fetchError || !tramite) {
      return NextResponse.json({ error: "Trámite no encontrado" }, { status: 404 });
    }

    // --- WORKFLOW ENGINE (V4.0) ---
    return await withLock(tramiteId, 'api-autofix', async () => {
      // 1. Re-validación bajo bloqueo
      const { data: current, error: cError } = await supabase
        .from("tramites")
        .select("status, retry_count")
        .eq("id", tramiteId)
        .single();
      
      if (cError || !current) throw new Error("Trámite no encontrado");

      // 2. Guard de Estado
      assertState(current.status, ['error', 'audited']);

      if ((current.retry_count || 0) >= 3) {
        throw new Error("Límite de reintentos (3) alcanzado. Requiere intervención humana.");
      }

      // 3. Disparar n8n
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gmm-secret": process.env.GMM_CALLBACK_SECRET || ""
        },
        body: JSON.stringify({
          tramite_id: tramiteId,
          source: 'api-autofix'
        }),
      });

      if (!res.ok) throw new Error("Error en el servidor de automatización (n8n)");

      // 4. Update status a 'processing'
      // Este status es legal desde 'error' o 'audited' según el trigger validate_status_flow
      const { error: uError } = await supabase
        .from("tramites")
        .update({ 
          status: "processing", 
          last_error: null,
          last_retry_at: new Date().toISOString() 
        })
        .eq("id", tramiteId);

      if (uError) throw uError;

      return NextResponse.json({ success: true });
    });
    
  } catch (error: any) {
    console.error("Error en Auto-Fix API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
