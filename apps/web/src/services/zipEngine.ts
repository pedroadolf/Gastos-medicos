import JSZip from 'jszip';
import { getSupabaseService } from './supabase';

/**
 * 📦 ZIP ENGINE v1.1 - Orchestrated Edition
 * Packages generated PDFs, original invoices, and attachments into a single ZIP.
 * Then notifies n8n for final email submission to the insurer.
 */
export async function generateZip(tramiteId: string) {
  const supabase = getSupabaseService();
  const zip = new JSZip();

  // 1. Fetch metadata and all documents for this tramite
  const { data: tramite, error: tError } = await supabase
    .from('tramites')
    .select('*')
    .eq('id', tramiteId)
    .single();

  if (tError || !tramite) throw new Error(`Tramite ${tramiteId} not found`);

  // Fetch documents linked to the tramite
  // Note: We use the 'adjuntos' or 'documentos_metadata' table as a registry.
  const { data: docs, error: dError } = await supabase
    .from('adjuntos')
    .select('*')
    .eq('tramite_id', tramiteId);

  if (dError || !docs || docs.length === 0) {
    throw new Error('No files found to package for this claim.');
  }

  // 2. Optimized Organization (Subfolders for the Insurer)
  const folders = {
    generados: zip.folder('1_Documentacion_Oficial'),
    originales: zip.folder('2_Facturas_Originales_XML_PDF'),
    anexos: zip.folder('3_Anexos_Identificaciones_Estudios')
  };

  // 3. Concurrent Processing (Download and Add to ZIP)
  const downloadPromises = docs.map(async (doc) => {
    try {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('gmm-uploads')
        .download(doc.file_path);

      if (downloadError || !fileBlob) {
        console.error(`[ZIP ENGINE] Failed download of ${doc.file_name}:`, downloadError);
        return;
      }

      const arrayBuffer = await fileBlob.arrayBuffer();
      const lowerType = (doc.tipo_documento || '').toLowerCase();
      const fileName = doc.file_name || `${Date.now()}_${doc.id.slice(0, 4)}.pdf`;

      // Intelligent folder routing
      if (lowerType.includes('auto') || lowerType.includes('generado') || lowerType.includes('oficial')) {
        folders.generados?.file(fileName, arrayBuffer);
      } else if (lowerType.includes('factura') || lowerType.includes('xml')) {
        folders.originales?.file(fileName, arrayBuffer);
      } else {
        folders.anexos?.file(fileName, arrayBuffer);
      }
    } catch (err) {
      console.error(`[ZIP ENGINE] Error processing file ${doc.file_name}:`, err);
    }
  });

  await Promise.all(downloadPromises);

  // 4. Final Compilation
  const zipBuffer = await zip.generateAsync({ 
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 } 
  });

  // 5. Encrypted Upload to Supabase Storage
  const zipPath = `${tramiteId}/EXPEDIENTE_GMM_${Date.now()}.zip`;
  const { error: uploadError } = await supabase.storage
    .from('gmm-uploads')
    .upload(zipPath, zipBuffer, {
      contentType: 'application/zip',
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

  const { data: publicUrl } = supabase.storage
    .from('gmm-uploads')
    .getPublicUrl(zipPath);

  // 6. Persistence: Update Tramite with the ZIP pointer
  await supabase
    .from('tramites')
    .update({ 
        url_expediente_zip: publicUrl.publicUrl,
        status: 'completed',
        updated_at: new Date().toISOString()
    })
    .eq('id', tramiteId);

  // 7. 🔥 CONNECT TO n8n: Trigger Autonomous Email Submission
  const n8nWebhook = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhook) {
      console.log(`📡 Notifying n8n orchestrator for submission...`);
      try {
        await fetch(n8nWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'SUBMIT_CLAIM',
                tramite_id: tramiteId,
                zip_url: publicUrl.publicUrl,
                status: 'ready_to_send',
                source: 'ZipEngine-Production',
                metadata: {
                    file_count: docs.length,
                    generated_at: new Date().toISOString()
                }
            })
        });
        console.log('✅ n8n Orchestrator notified successfully.');
      } catch (err) {
        console.error('❌ Failed to trigger n8n orchestration:', err);
      }
  }

  return publicUrl.publicUrl;
}
