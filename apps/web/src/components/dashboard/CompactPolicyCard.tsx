'use client';

import { Shield } from 'lucide-react';
import { formatMXN, type PolicyCalculada } from '@/lib/uma';

interface CompactPolicyCardProps {
  policy: PolicyCalculada;
}

export function CompactPolicyCard({ policy }: CompactPolicyCardProps) {
  const vigInicio = new Date(policy.vigencia_inicio).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
  const vigFin    = new Date(policy.vigencia_fin  ).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });

  return (
    <div className="gmm-box p-0 overflow-hidden group border border-slate-200 dark:border-white/5 relative">
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gmm-accent/5 blur-xl pointer-events-none" />
      
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Branding & Core Info */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gmm-accent/10 flex items-center justify-center text-gmm-accent shrink-0 shadow-inner">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
                Póliza <span style={{ color: '#FFAA00' }}>{policy.numero_poliza}</span>
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Vigente
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gmm-text-muted)' }}>
              {policy.tipo_plan} · {vigInicio} → {vigFin}
            </p>
          </div>
        </div>

        {/* Right: Key Financials */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Suma Asegurada</p>
            <p className="text-[15px] font-black" style={{ color: 'var(--gmm-text)' }}>${formatMXN(policy.suma_asegurada_mxn)}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Deducible</p>
            <p className="text-[15px] font-black" style={{ color: 'var(--gmm-text)' }}>${formatMXN(policy.deducible_mxn)}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Coaseguro</p>
            <p className="text-[15px] font-black" style={{ color: 'var(--gmm-text)' }}>{policy.coaseguro_pct}%</p>
          </div>
          <div className="pl-6 border-l border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Excesos M172</p>
            <p className="text-[15px] font-black text-emerald-500">Sin límite</p>
          </div>
        </div>

      </div>
    </div>
  );
}
