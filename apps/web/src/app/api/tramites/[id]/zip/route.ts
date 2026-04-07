// /app/api/tramites/[id]/zip/route.ts
import { NextResponse } from "next/server";
import { getSupabaseService } from "@/services/supabase";
import { withLock, assertState } from "@/lib/workflow-engine";
import JSZip from "jszip";

export async function POST(req: Request, { params }: any) {
  const supabase = getSupabaseService();
  const tramiteId = params.id;

  try {
    // --- WORKFLOW ENGINE (V4.0) ---
    return await withLock(tramiteId, 'api-zip-engine', async () => {
      
      // 1. Obtener trámite y siniestro
      const { data: tramite, error: tramiteError } = await supabase
        .from("tramites")
        .select("*, siniestros(numero_siniestro)")
        .eq("id", tramiteId)
        .single();

      if (tramiteError || !tramite) throw new Error("Trámite no encontrado");

      // 2. IDEMPOTENCY: Si ya está completado, no repetir proceso costoso
      if (tramite.url_expediente_zip && tramite.status === 'completed') {
        return NextResponse.json({
          success: true,
          url: tramite.url_expediente_zip,
          fromCache: true
        });
      }

      // 3. STATE GUARD: Solo permitir ZIP si ha sido auditado
      // (Pre-requisito para cumplir con 'enforce_integrity' trigger)
      assertState(tramite.status, ['audited', 'processing']);

      // 4. Obtener adjuntos
      const { data: adjuntos, error: adjuntosError } = await supabase
        .from("adjuntos")
        .select("*")
        .eq("tramite_id", tramiteId);

      if (adjuntosError) throw new Error("Error recuperando adjuntos");

      const zip = new JSZip();
      const bucketName = "documentos"; // Usar el bucket consolidado v4.0

      // 5. Helper: descargar archivo desde storage
      const downloadFile = async (path: string) => {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(path);

        if (error) {
          console.error(`❌ Error downloading ${path}:`, error);
          return null;
        }
        return data;
      };

      // 6. Agregar archivos al ZIP
      if (adjuntos && adjuntos.length > 0) {
        for (const adjunto of adjuntos) {
          const fileData = await downloadFile(adjunto.file_path);
          if (fileData) {
            const folder = (adjunto.tipo_documento || 'documentos').toLowerCase();
            const fileName = adjunto.file_name || adjunto.file_path.split('/').pop();
            zip.file(`${folder}/${fileName}`, fileData);
          }
        }
      } else {
         zip.file("info.txt", "Este expediente no contiene documentos adjuntos.");
      }

      // 7. Generar buffer del ZIP
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const fileNameZip = `EXPEDIENTE_${tramite.siniestros?.numero_siniestro || tramiteId}.zip`;
      const zipPath = `${tramiteId}/${fileNameZip}`;

      // 8. Subir ZIP al bucket
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(zipPath, zipBuffer, {
          contentType: "application/zip",
          upsert: true,
        });

      if (uploadError) throw new Error("Error guardando el ZIP en Storage");

      // 9. Generar URL pública (o firmada si se prefiere)
      const { data: publicUrl } = supabase.storage
        .from(bucketName)
        .getPublicUrl(zipPath);

      // 10. Actualizar DB: El trigger 'enforce_integrity' validará que url_expediente_zip no sea nulo al pasar a completed
      const { error: updateError } = await supabase
        .from("tramites")
        .update({
          url_expediente_zip: publicUrl.publicUrl,
          status: "completed"
        })
        .eq("id", tramiteId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        url: publicUrl.publicUrl,
        fileName: fileNameZip
      });
    });

  } catch (error: any) {
    console.error("Unexpected ZIP Error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
