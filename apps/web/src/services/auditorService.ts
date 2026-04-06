import { getSupabaseService } from './supabase';

export type AuditFinding = {
  severity: 'warning' | 'error';
  message: string;
  field?: string;
};

/**
 * 🕵️ AUDITOR SERVICE
 * Validates claims before final submission.
 */
export class AuditorService {
  /**
   * Run full audit on a Tramite
   */
  static async auditTramite(tramiteId: string): Promise<AuditFinding[]> {
    const supabase = getSupabaseService();
    const findings: AuditFinding[] = [];

    // 1. Fetch data
    const { data: tramite, error } = await supabase
      .from('tramites')
      .select(`
        *,
        siniestros (*),
        facturas (*),
        adjuntos (*)
      `)
      .eq('id', tramiteId)
      .single();

    if (error || !tramite) throw new Error('Tramite not found for audit');

    // --- RULES ---

    // Rule 1: CLABE check for reimbursements
    if (tramite.tipo === 'reembolso') {
      const clabe = tramite.siniestros?.clabe_bancaria;
      if (!clabe) {
        findings.push({ severity: 'error', message: 'Falta cuenta CLABE para el reembolso', field: 'clabe_bancaria' });
      } else if (clabe.length !== 18) {
        findings.push({ severity: 'error', message: 'La cuenta CLABE debe tener 18 dígitos', field: 'clabe_bancaria' });
      }
    }

    // Rule 2: Invoices check
    if (tramite.facturas?.length === 0) {
      findings.push({ severity: 'error', message: 'No hay facturas registradas en este trámite' });
    } else {
      tramite.facturas.forEach((f: any, i: number) => {
        if (!f.numero_factura) {
          findings.push({ 
            severity: 'warning', 
            message: `La factura #${i+1} no tiene número de folio`,
            field: `facturas[${i}].numero_factura`
          });
        }
        if (f.importe <= 0) {
          findings.push({ 
            severity: 'error', 
            message: `La factura #${i+1} tiene un importe inválido`,
            field: `facturas[${i}].importe`
          });
        }
      });
    }

    // Rule 3: Essential Docs check
    const docTypes = tramite.adjuntos?.map((a: any) => a.tipo_documento) || [];
    if (!docTypes.includes('id_oficial') && !docTypes.includes('INE')) {
      findings.push({ severity: 'warning', message: 'Falta identificación oficial' });
    }

    // Rule 4: Number of Claimed Data vs Invoices
    const totalClaimed = tramite.facturas?.reduce((sum: number, f: any) => sum + Number(f.importe), 0) || 0;
    if (totalClaimed > 100000 && !docTypes.includes('comprobante_domicilio')) {
        findings.push({ severity: 'warning', message: 'Reembolso mayor a $100k requiere comprobante de domicilio' });
    }

    // 2. Save results to public.audit_results
    if (findings.length > 0) {
        await supabase.from('audit_results').insert({
            tramite_id: tramiteId,
            workflow_name: 'claims-audit-v1',
            issues: findings,
            score: this.calculateScore(findings),
            approved: !findings.some(f => f.severity === 'error'),
            automated: true
        });
    }

    return findings;
  }

  private static calculateScore(findings: AuditFinding[]): number {
    const errorCount = findings.filter(f => f.severity === 'error').length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;
    
    let score = 100;
    score -= (errorCount * 25);
    score -= (warningCount * 10);
    
    return Math.max(0, score);
  }
}
