import { PdfEngine } from '../services/pdfEngine';
import { AuditorService } from '../services/auditorService';
import { AiFixService } from '../services/aiFixService';
import { generateZip } from '../services/zipEngine';
import { getSupabaseService } from '../services/supabase';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables for the test
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

/**
 * 🔥 SMOKE TEST v2.0 - FULL ENGINE INTEGRATION
 * This script runs the entire GMM automated pipeline for the latest claim.
 */
async function runTest() {
  console.log('🚀 [SMOKE-TEST] Starting Full Pipeline Validation...');
  const supabase = getSupabaseService();

  // 1. Fetch the most recent tramite
  const { data: tramite, error: tError } = await supabase
    .from('tramites')
    .select('id, tipo, status')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (tError || !tramite) {
    console.error('❌ [SMOKE-TEST] No tramite found in DB to test.');
    return;
  }

  console.log(`📌 [SMOKE-TEST] Testing Tramite ID: ${tramite.id} (${tramite.tipo})`);

  try {
    // 2. Test PDF Generation
    console.log('📄 [SMOKE-TEST] Step 1: Generating PDFs...');
    const pdfs = await PdfEngine.generateExpediente(tramite.id);
    console.log(`✅ [SMOKE-TEST] Generated ${pdfs.length} files.`);

    // 3. Test Auditor
    console.log('🕵️ [SMOKE-TEST] Step 2: Running Auditor...');
    const findings = await AuditorService.auditTramite(tramite.id);
    const errorCount = findings.filter(f => f.severity === 'error').length;
    console.log(`✅ [SMOKE-TEST] Auditor finished. Finding count: ${findings.length} (Errors: ${errorCount})`);

    // 4. Test AI Fix Engine
    console.log('🤖 [SMOKE-TEST] Step 3: Running AI Fix Engine...');
    const aiFix = new AiFixService();
    const fixResult = await aiFix.analyzeAndFix(tramite.id);
    console.log(`✅ [SMOKE-TEST] AI Fixed ${fixResult.fixed} items.`);

    // 5. Test ZIP Packaging
    console.log('📦 [SMOKE-TEST] Step 4: Generating ZIP Archive...');
    const zipUrl = await generateZip(tramite.id);
    console.log(`✅ [SMOKE-TEST] ZIP Generated successfully: ${zipUrl}`);

    console.log('\n🌟 [SMOKE-TEST] FULL PIPELINE PASSED! 🌟');
    console.log('-----------------------------------------');
    console.log(`Trace Target: ${tramite.id}`);
    console.log(`ZIP Link: ${zipUrl}`);
    console.log('-----------------------------------------');

  } catch (err) {
    console.error('💥 [SMOKE-TEST] PIPELINE FAILED:', err);
  }
}

runTest();
