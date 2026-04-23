'use client';

import { Shield, ShieldAlert, Users, FolderOpen, DollarSign, Activity } from 'lucide-react';

interface GlobalPolicyCardProps {
  totalSum: number;
  consumedSum: number;
  policyNumber: string;
}

export function GlobalPolicyCard({ totalSum, consumedSum, policyNumber }: GlobalPolicyCardProps) {
  return (
    <div className="gmm-box relative overflow-hidden group" style={{ padding: 0 }}>
      {/* Contenido Principal */}
      <div className="flex flex-col lg:flex-row border-b border-slate-200 dark:border-white/5">
        {/* Panel Izquierdo: Póliza Primaria */}
        <div className="flex-1 p-8 lg:border-r border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-2 rounded-full" style={{ background: '#FFAA00' }} />
            <h2 className="gmm-title-h1" style={{ color: 'var(--gmm-text)' }}>
              Póliza Colectiva <span style={{ color: '#FFAA00' }}>— MetLife 2026</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>No. de Póliza</p>
              <p className="text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--gmm-text)' }}>{policyNumber}</p>
            </div>
            <div>
              <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>Contratante</p>
              <p className="text-2xl font-black leading-tight" style={{ color: 'var(--gmm-text)' }}>Colgate Palmolive, S.A. de C.V.</p>
            </div>
            <div>
              <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>Certificado / Vigencia</p>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>2001</p>
                <span className="px-4 py-1.5 text-[11px] font-black uppercase rounded-lg"
                      style={{ background: 'rgba(34,197,94,0.10)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.20)' }}>Vigente</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>Asegurado Titular</p>
              <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>Fonseca Aguilar, Claudia</p>
            </div>
            <div className="md:col-span-2 pt-6 border-t border-slate-50 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gmm-text-muted)' }}>Suma Asegurada</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>${(totalSum).toLocaleString()} <span className="text-xs font-bold uppercase" style={{ color: 'var(--gmm-text-muted)' }}>MXN</span></p>
                </div>
                <div>
                  <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gmm-text-muted)' }}>Deducible Base</p>
                  <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>$6,602.88 <span className="text-xs font-bold uppercase" style={{ color: 'var(--gmm-text-muted)' }}>/ Año</span></p>
                </div>
                <div>
                  <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gmm-text-muted)' }}>Coaseguro</p>
                  <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>10% <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--gmm-text-muted)' }}>(Tope $17,500)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Excesos con fondo distinguido */}
        <div className="lg:w-[420px] p-8 relative overflow-hidden" style={{ background: 'var(--gmm-bg-panel)' }}>
          <div className="absolute top-0 right-0 p-6" style={{ opacity: 0.04 }}>
            <Shield size={100} style={{ color: 'var(--gmm-text)' }} />
          </div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="h-8 w-2 rounded-full" style={{ background: '#22C55E' }} />
            <h2 className="gmm-title-h1" style={{ color: 'var(--gmm-text)' }}>
              Capa de Excesos <span style={{ color: '#22C55E' }}>— M172</span>
            </h2>
          </div>

          <div className="space-y-8 relative z-10">
            <div>
              <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gmm-text-muted)' }}>Póliza Individual de Respaldo</p>
              <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>M172 1011</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>Suma Excesos</p>
                <p className="text-2xl font-black uppercase" style={{ color: 'var(--gmm-text)' }}>Sin límite</p>
              </div>
              <div>
                <p className="text-[14px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--gmm-text-muted)' }}>Deducible Exceso</p>
                <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>$2,000,000</p>
              </div>
            </div>

            <div className="p-8 rounded-[20px]" style={{ background: 'var(--gmm-card)', border: '1px solid var(--gmm-border)' }}>
              <p className="text-[15px] leading-relaxed font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
                La cobertura de excesos activa automáticamente al superar <strong style={{ color: 'var(--gmm-text)', fontWeight: 900 }}>$2.0M</strong> en un solo evento, eliminando el riesgo de ruina financiera.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer KPI Cards: Más grandes y claros */}
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--gmm-bg-panel)', borderTop: '1px solid var(--gmm-border)' }}>
        {[
          { icon: <Users size={22} />, label: 'Integrantes', value: '4', sub: 'Claudia + Familia', accent: '#FFAA00' },
          { icon: <FolderOpen size={22} />, label: 'Siniestros', value: '3', sub: 'Trámites en curso', accent: '#FFAA00' },
          { icon: <DollarSign size={22} />, label: 'Coaseguro', value: '$42k', sub: 'Pagado este año', accent: '#22C55E' },
          { icon: <Activity size={22} />, label: 'Alertas', value: '0', sub: 'Eventos críticos', accent: 'var(--gmm-text-muted)' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 flex items-center gap-4 transition-colors cursor-default"
               style={{ borderRight: idx < 3 ? '1px solid var(--gmm-border)' : 'none' }}
               onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,170,0,0.04)'}
               onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                 style={{ background: `${kpi.accent}18`, color: kpi.accent, border: `1px solid ${kpi.accent}28` }}>
              {kpi.icon}
            </div>
            <div>
              <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>{kpi.label}</p>
              <p className="gmm-kpi-value" style={{ color: 'var(--gmm-text)' }}>{kpi.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gmm-text-muted)' }}>{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
