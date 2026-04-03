import { NextRequest, NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase";

/**
 * API Route: /api/upload-storage
 * 
 * Recibe archivos del frontend via FormData y los sube a Supabase Storage
 * usando Service Role (bypass RLS). Retorna signed URLs para cada archivo.
 * 
 * Esto soluciona el error "new row violates row-level security policy"
 * que ocurre cuando el browser intenta subir con anon key sin políticas RLS configuradas.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];
        const folder = formData.get("folder") as string;
        const group = formData.get("group") as string; // "anexos" o "facturas"

        if (!files.length || !folder) {
            return NextResponse.json(
                { error: "Se requieren archivos y carpeta destino." },
                { status: 400 }
            );
        }

        console.log(`📤 [UPLOAD] Subiendo ${files.length} archivos al folder: ${folder}/${group}`);

        const supabase = getSupabaseService();
        const results: Array<{ name: string; url: string; path: string }> = [];

        for (const file of files) {
            const fileExt = file.name.split(".").pop();
            const safeId = Math.random().toString(36).substring(2);
            const fileName = `${safeId}_${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${group}/${fileName}`;

            // Convertir File del FormData a Buffer para Supabase Storage
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { error: uploadError } = await supabase.storage
                .from("gmm-uploads")
                .upload(filePath, buffer, {
                    contentType: file.type || "application/octet-stream",
                    upsert: false,
                });

            if (uploadError) {
                console.error(`❌ [UPLOAD] Error subiendo ${file.name}:`, uploadError);
                return NextResponse.json(
                    { 
                        error: `Error al subir archivo: ${file.name}`, 
                        details: uploadError.message 
                    },
                    { status: 500 }
                );
            }

            // Generar signed URL con validez de 24h
            const { data: signedData, error: signedError } = await supabase.storage
                .from("gmm-uploads")
                .createSignedUrl(filePath, 86400);

            if (signedError) {
                console.error(`❌ [UPLOAD] Error generando signed URL para ${file.name}:`, signedError);
                return NextResponse.json(
                    { 
                        error: `Error generando URL firmada: ${file.name}`, 
                        details: signedError.message 
                    },
                    { status: 500 }
                );
            }

            results.push({
                name: file.name,
                url: signedData.signedUrl,
                path: filePath,
            });

            console.log(`  ✅ ${file.name} → ${filePath}`);
        }

        console.log(`✅ [UPLOAD] ${results.length} archivos subidos exitosamente.`);

        return NextResponse.json({ 
            success: true, 
            files: results 
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("❌ [UPLOAD] Error inesperado:", message);
        return NextResponse.json(
            { error: "Error interno al subir archivos", details: message },
            { status: 500 }
        );
    }
}
