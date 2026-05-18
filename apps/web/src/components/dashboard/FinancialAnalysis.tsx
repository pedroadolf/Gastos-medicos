'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Clock, TrendingDown, Receipt, Users } from 'lucide-react';
import {
  ASEGURADOS_GRUPO,
  calcularSubtotalAsegurado,
  calcularTotalGrupo,
} from '@/lib/siniestros-data';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1_000).toFixed(1)}k`;

const COLORS: Record<string, string> = {
  'pedro-soto':      '#22C55E',
  'claudia-fonseca':  '#FFAA00',
  'emilio-soto':      '#38BDF8',
  'sebastian-soto':   '#A78BFA',
};

const SHORT_NAMES: Record<string, string> = {
  'pedro-soto':      'Pedro',
  'claudia-fonseca':  'Claudia',
  'emilio-soto':      'Emilio',
  'sebastian-soto':   'Sebastián',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function FinancialAnalysis() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = calcularTotalGrupo();

  // Per-insured subtotals for charts
  const perInsured = ASEGURADOS_GRUPO.map((a) => {
    const sub = calcularSubtotalAsegurado(a);
    return {
      id: a.id,
      name: SHORT_NAMES[a.id] || a.nombre.split(' ')[0],
      parentesco: a.parentesco,
      pagado: sub.total_pagado,
      pendiente: sub.total_pendiente,
      deducible: sub.total_deducible,
      coaseguro: sub.total_coaseguro,
      siniestros: sub.count_siniestros,
      color: COLORS[a.id] || '#94A3B8',
    };
  }).sort((a, b) => b.pagado - a.pagado);

  const maxPagado = Math.max(...perInsured.map((p) => p.pagado), 1);

  // Donut data — only insured with pagado > 0
  const donutData = perInsured
    .filter((p) => p.pagado > 0)
    .map((p) => ({ name: p.name, value: p.pagado, color: p.color }));

  // KPIs
  const kpis = [
    { label: 'Total Pagado',       value: total.total_pagado,    icon: Wallet,       color: '#FFAA00', sub: `${total.count_siniestros} siniestros` },
    { label: 'Pend. Carta Pase',   value: total.total_pendiente, icon: Clock,        color: total.total_pendiente > 0 ? '#EF4444' : '#94A3B8', sub: 'En trámite' },
    { label: 'Deducibles',         value: total.total_deducible, icon: TrendingDown, color: '#38BDF8', sub: 'Pagado por asegurado' },
    { label: 'Coaseguro 10%',      value: total.total_coaseguro, icon: Receipt,      color: '#A78BFA', sub: 'Acumulado' },
  ];

  return (
    <div className="space-y-6">

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="gmm-box p-5 flex items-center gap-4 group hover:shadow-lg transition-all"
          >
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
              <Icon size={19} style={{ color }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
              <p className="text-[22px] font-black tracking-tight" style={{ color }}>{fmtK(value)}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT — Horizontal Bars (3 cols) */}
        <div className="lg:col-span-3 gmm-box p-6 space-y-6">
          <div>
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text)' }}>
              Total Pagado por Asegurado
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gmm-text-muted)' }}>
              Distribución real del gasto acumulado
            </p>
          </div>

          <div className="space-y-5">
            {perInsured.map((p, i) => {
              const pct = maxPagado > 0 ? (p.pagado / maxPagado) * 100 : 0;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[10px] font-black"
                        style={{ background: `${p.color}18`, border: `1px solid ${p.color}30`, color: p.color }}
                      >
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>{p.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                          {p.parentesco} · {p.siniestros} siniestro{p.siniestros !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black" style={{ color: p.color }}>{fmtK(p.pagado)}</p>
                      {p.pendiente > 0 && (
                        <p className="text-[9px] font-bold text-red-400">+{fmtK(p.pendiente)} pend.</p>
                      )}
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'var(--gmm-border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: p.color, minWidth: p.pagado > 0 ? '4px' : 0 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Donut (2 cols) */}
        <div className="lg:col-span-2 gmm-box p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text)' }}>
              Distribución del Gasto
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gmm-text-muted)' }}>
              Participación por integrante
            </p>
          </div>

          <div className="flex-1 min-h-[260px] relative">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--gmm-card)',
                      border: '1px solid var(--gmm-border)',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      color: 'var(--gmm-text)',
                      padding: '12px 16px',
                    }}
                    formatter={((value: number) => [`$${fmt(value)}`, '']) as any}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Total</p>
              <p className="text-[18px] font-black" style={{ color: 'var(--gmm-text)' }}>{fmtK(total.total_pagado)}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--gmm-border)' }}>
            {perInsured.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="text-[10px] font-bold truncate" style={{ color: 'var(--gmm-text-muted)' }}>
                  {p.name} — {fmtK(p.pagado)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
