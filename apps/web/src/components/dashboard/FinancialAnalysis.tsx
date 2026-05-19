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
  const donutData = perInsured.filter((p) => p.pagado > 0).map((p) => ({ name: p.name, value: p.pagado, color: p.color }));

  const kpis = [
    { label: 'Total Pagado',       value: total.total_pagado,    icon: Wallet,       color: '#FFAA00' },
    { label: 'Pend. Carta Pase',   value: total.total_pendiente, icon: Clock,        color: total.total_pendiente > 0 ? '#EF4444' : '#94A3B8' },
    { label: 'Deducibles',         value: total.total_deducible, icon: TrendingDown, color: '#38BDF8' },
    { label: 'Coaseguro 10%',      value: total.total_coaseguro, icon: Receipt,      color: '#A78BFA' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Vertical KPIs ── */}
      <div className="grid grid-cols-2 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="gmm-box p-4 flex flex-col items-start gap-3 hover:shadow-lg transition-all"
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
              <p className="text-[18px] font-black tracking-tight" style={{ color }}>{fmtK(value)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Donut ── */}
      <div className="gmm-box p-5 flex flex-col">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--gmm-text)' }}>Distribución</h3>
        <div className="flex-1 min-h-[180px] relative">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
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
                    backgroundColor: 'var(--gmm-card)', border: '1px solid var(--gmm-border)', borderRadius: '12px', fontSize: '10px'
                  }}
                  formatter={((value: number) => [`$${fmt(value)}`, '']) as any}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Horizontal Bars ── */}
      <div className="gmm-box p-5 space-y-5">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text)' }}>Por Asegurado</h3>
        <div className="space-y-4">
          {perInsured.map((p, i) => {
            const pct = maxPagado > 0 ? (p.pagado / maxPagado) * 100 : 0;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <p className="text-[11px] font-bold" style={{ color: 'var(--gmm-text)' }}>{p.name}</p>
                  </div>
                  <p className="text-[11px] font-black" style={{ color: p.color }}>{fmtK(p.pagado)}</p>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--gmm-border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: i * 0.12 }}
                    className="h-full rounded-full"
                    style={{ background: p.color, minWidth: p.pagado > 0 ? '4px' : 0 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
