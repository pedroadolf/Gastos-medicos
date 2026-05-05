'use client';

import { Shield, Users, FolderOpen, DollarSign, Activity, TrendingUp, RefreshCw, Settings, Info } from 'lucide-react';
import { formatMXN, type PolicyCalculada } from '@/lib/uma';
import Link from 'next/link';

interface GlobalPolicyCardProps {
  policy: PolicyCalculada;
  consumedSum: number;
  claimsCount?: number;
}

export function GlobalPolicyCard({ policy, consumedSum, claimsCount = 0 }: GlobalPolicyCardProps) {
  const vigInicio = new Date(policy.vigencia_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  const vigFin    = new Date(policy.vigencia_fin  ).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="gmm-box relative overflow-hidden group" style={{ padding: 0 }}>

      {/* ── Banner UMA ──────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-x-10 gap-y-3 px-6 py-4 border-b"
        style={{ background: 'rgba(255,170,0,0.06)', borderColor: 'rgba(255,170,0,0.18)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gmm-accent/10 flex items-center justify-center text-gmm-accent">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#FFAA00' }}>
                UMA {policy.uma_year}
              </span>
              {policy.uma_year === new Date().getFullYear() && (
                <span className="px-2 py-0.5 text-[8px] font-black uppercase rounded-full"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                  Vigente
                </span>
              )}
            </div>
            {policy.uma_fuente && (
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Fuente: {policy.uma_fuente}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {[
            { label: 'Diaria',  value: `$${formatMXN(policy.uma_diaria)}` },
            { label: 'Mensual', value: `$${formatMXN(policy.uma_mensual)}` },
            { label: 'Anual',   value: `$${formatMXN(policy.uma_anual)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] font-black" style={{ color: 'var(--gmm-text)' }}>{value}</span>
                <span className="text-[9px] font-bold text-slate-400">MXN</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 opacity-40">
              <RefreshCw size={10} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                Sincronizado Supabase
              </span>
            </div>
            {policy.uma_vigente_desde && (
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Actualizado: {new Date(policy.uma_vigente_desde).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>

          <Link
            href="/dashboard/admin/uma"
            className="w-8 h-8 rounded-lg border border-gmm-accent/20 flex items-center justify-center text-gmm-accent hover:bg-gmm-accent hover:text-white transition-all shadow-sm"
            title="Configurar UMA"
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>

      {/* ── Contenido Principal ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row border-b border-slate-200 dark:border-white/5">

        {/* Panel Izquierdo: Póliza Principal */}
        <div className="flex-1 p-6 lg:border-r border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-2 rounded-full" style={{ background: '#FFAA00' }} />
            <div>
              <h2 className="gmm-title-h1" style={{ color: 'var(--gmm-text)' }}>
                Póliza Principal <span style={{ color: '#FFAA00' }}>— MetLife {policy.uma_year}</span>
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                Vigente: {vigInicio} → {vigFin}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>No. de Póliza</p>
              <p className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--gmm-text)' }}>{policy.numero_poliza}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Certificado</p>
              <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>{policy.certificado}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Plan</p>
              <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>{policy.tipo_plan}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Titular</p>
              <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>Fonseca Aguilar, Claudia</p>
            </div>

            {/* KPIs financieros calculados desde UMA */}
            <div className="md:col-span-2 pt-5 border-t border-slate-50 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>
                    Suma Asegurada
                  </p>
                  <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>
                    ${formatMXN(policy.suma_asegurada_mxn)} <span className="text-xs font-bold uppercase" style={{ color: 'var(--gmm-text-muted)' }}>MXN</span>
                  </p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                    {policy.suma_asegurada_uma.toLocaleString()} UMA × ${policy.uma_diaria}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>
                    Deducible
                  </p>
                  <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>
                    ${formatMXN(policy.deducible_mxn)} <span className="text-xs font-bold uppercase" style={{ color: 'var(--gmm-text-muted)' }}>MXN</span>
                  </p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                    {policy.deducible_uma} UMA × ${policy.uma_diaria}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Coaseguro</p>
                  <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>{policy.coaseguro_pct}%</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Por siniestro</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Excesos */}
        <div className="lg:w-[420px] p-6 relative overflow-hidden" style={{ background: 'var(--gmm-bg-panel)' }}>
          <div className="absolute top-0 right-0 p-6" style={{ opacity: 0.04 }}>
            <Shield size={100} style={{ color: 'var(--gmm-text)' }} />
          </div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="h-8 w-2 rounded-full" style={{ background: '#22C55E' }} />
            <div>
              <h2 className="gmm-title-h1" style={{ color: 'var(--gmm-text)' }}>
                Capa de Excesos <span style={{ color: '#22C55E' }}>— M172</span>
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                Vigente: {vigInicio} → {vigFin}
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>No. Póliza Individual</p>
              <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>{policy.excess_policy_num ?? 'M172 1011'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Suma Excesos</p>
                <p className="text-2xl font-black uppercase" style={{ color: 'var(--gmm-text)' }}>Sin límite</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Deducible Exceso</p>
                <p className="text-2xl font-black" style={{ color: 'var(--gmm-text)' }}>
                  ${policy.excess_deductible ? (policy.excess_deductible / 1_000_000).toFixed(1) + 'M' : '2.0M'}
                </p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Por siniestro · En pesos fijos</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Coaseguro Excesos</p>
              <p className="text-xl font-black" style={{ color: 'var(--gmm-text)' }}>{policy.excess_coaseguro ?? 10}%</p>
            </div>

            <div className="p-5 rounded-[20px]" style={{ background: 'var(--gmm-card)', border: '1px solid var(--gmm-border)' }}>
              <p className="text-[13px] leading-relaxed font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
                Activa automáticamente al superar{' '}
                <strong style={{ color: 'var(--gmm-text)', fontWeight: 900 }}>
                  ${policy.excess_deductible ? (policy.excess_deductible / 1_000_000).toFixed(0) + '.0M' : '2.0M'}
                </strong>{' '}
                en un solo evento. Deducible fijo en pesos — no indexado a UMA.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--gmm-bg-panel)', borderTop: '1px solid var(--gmm-border)' }}>
        {[
          { icon: <Users size={22} />,      label: 'Integrantes',  value: '4',      sub: 'Claudia + Familia',  accent: '#FFAA00' },
          { icon: <FolderOpen size={22} />, label: 'Siniestros',   value: String(claimsCount), sub: 'Trámites activos', accent: '#FFAA00' },
          { icon: <DollarSign size={22} />, label: 'Consumo',      value: `$${(consumedSum / 1000).toFixed(0)}k`, sub: 'Acumulado póliza', accent: '#22C55E' },
          { icon: <Activity size={22} />,   label: 'Alertas',      value: '0',      sub: 'Eventos críticos',   accent: 'var(--gmm-text-muted)' },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="p-6 flex items-center gap-4 transition-colors cursor-default"
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
