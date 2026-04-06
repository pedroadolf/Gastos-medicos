import { getSupabaseService } from './supabase';

/**
 * 🤖 AI FIX ENGINE v1.1 - Observability Edition
 * Analyzes audit findings and executes autonomous corrections (Auto-Fix).
 * Records each action in the global history to power the "Timeline UI".
 */
export class AiFixService {
  private supabase = getSupabaseService();

  async analyzeAndFix(tramiteId: string) {
    // 1. Get findings from latest audit
    const { data: audit } = await this.supabase
      .from('audit_results')
      .select('*')
      .eq('tramite_id', tramiteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!audit || !audit.issues) return { fixed: 0, actions: [] };

    const findings = audit.issues as any[];
    const actions: any[] = [];
    let fixedCount = 0;

    // 2. Intelligent Fix Loop
    for (const issue of findings) {
      if (issue.type === 'error' && (issue.message.includes('Monto') || issue.message.includes('total'))) {
        // AI-Driven Correction: Recalculate totals from individual invoices
        const { data: facturas } = await this.supabase
          .from('facturas')
          .select('importe')
          .eq('tramite_id', tramiteId);

        if (facturas) {
          const newTotal = facturas.reduce((acc, f) => acc + (Number(f.importe) || 0), 0);
          
          await this.supabase
            .from('tramites')
            .update({ total_reclamado: newTotal })
            .eq('id', tramiteId);
          
          fixedCount++;
          actions.push({ type: 'auto_fix', message: `Monto total recalculado autónomamente: $${newTotal.toFixed(2)} MXN`, status: 'success' });
        }
      } else if (issue.message.includes('CLABE')) {
        actions.push({ type: 'user_action', message: 'Corrección manual: El usuario debe proporcionar una CLABE interbancaria de 18 dígitos.', status: 'pending' });
      } else if (issue.message.includes('Identificación') || issue.message.includes('INE')) {
        actions.push({ type: 'user_action', message: 'GMM Missing Doc: Falta Identificación Oficial (Frente/Reverso).', status: 'pending' });
      } else {
        actions.push({ type: 'log', message: issue.message, status: 'note' });
      }
    }

    // 3. Register Event in Global Timeline (Observability)
    if (actions.length > 0) {
      await this.supabase.from('tramite_history').insert({
        tramite_id: tramiteId,
        event_type: 'AI_AUDIT_RESOLUTION',
        message: `IA Auditor procesó ${actions.length} hallazgos. Se corrigieron ${fixedCount} errores automáticamente.`,
        metadata: { actions, audit_id: audit.id },
        created_at: new Date().toISOString()
      });
    }

    // 4. Reputation / Score Injection
    if (fixedCount > 0) {
      const newScore = Math.min(100, (audit.score || 0) + (fixedCount * 15));
      await this.supabase
        .from('audit_results')
        .update({ 
            score: newScore,
            status: newScore >= 95 ? 'approved_by_ai' : 'partially_resolved'
        })
        .eq('id', audit.id);
    }

    return { 
      fixed: fixedCount, 
      actions, 
      finalScore: Math.min(100, (audit.score || 0) + (fixedCount * 15)) 
    };
  }
}
