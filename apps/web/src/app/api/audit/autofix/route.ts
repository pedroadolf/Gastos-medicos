import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { PdfEngine } from '@/services/pdfEngine';
import { generateZip } from '@/services/zipEngine';
import { AuditorService } from '@/services/auditorService';
import { AiFixService } from '@/services/aiFixService';

/**
 * 🔧 API: AUTO-FIX SYSTEM v1.1 (IA Powered)
 * Re-runs extraction, PDF generation, and ZIP packaging for a claim.
 */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      }
    }
  );

  const { tramite_id } = await req.json();

  if (!tramite_id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    console.log(`[AUTO-FIX] Processing ID: ${tramite_id}...`);

    // 0. AI FIX ENGINE (DECISION MAKING)
    const aiFix = new AiFixService();
    const fixResult = await aiFix.analyzeAndFix(tramite_id);
    console.log(`[AUTO-FIX] AI applied ${fixResult.fixed} fixes.`);

    // 1. RE-GENERATE PDFs
    const pdfs = await PdfEngine.generateExpediente(tramite_id);
    console.log(`[AUTO-FIX] ${pdfs.length} PDFs regenerated.`);

    // 2. RE-AUDIT
    const findings = await AuditorService.auditTramite(tramite_id);
    
    // Calculate new score after re-audit
    const errorCount = findings.filter(f => f.severity === 'error').length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;
    let score = 100 - (errorCount * 25) - (warningCount * 10);
    score = Math.max(0, score);

    console.log(`[AUTO-FIX] Re-audited with score: ${score}`);

    // 3. RE-GENERATE ZIP
    const zipUrl = await generateZip(tramite_id);
    console.log(`[AUTO-FIX] ZIP updated: ${zipUrl}`);

    return NextResponse.json({ 
      success: true, 
      score: score,
      zip_url: zipUrl
    });

  } catch (err) {
    console.error('[AUTO-FIX] Critical failed:', err);
    return NextResponse.json({ error: 'Auto-fix failed' }, { status: 500 });
  }
}
