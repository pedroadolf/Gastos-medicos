import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Clock, TrendingDown, Receipt } from 'lucide-react';
import {
  ASEGURADOS_GRUPO,
  calcularSubtotalAsegurado,
} from '@/lib/siniestros-data';
import { type PolicyCalculada, POLIZA_FALLBACK } from '@/lib/uma';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1_000).toFixed(1)}k`;

const COLORS: Record<string, string> = {
  'pedro-soto':      '#38BDF8', // Sky Blue
  'claudia-fonseca':  '#FFAA00', // Gold/Amber (unified!)
  'emilio-soto':      '#10B981', // Emerald Green
  'sebastian-soto':   '#A78BFA', // Purple
};

const SHORT_NAMES: Record<string, string> = {
  'pedro-soto':      'PASH',
  'claudia-fonseca':  'Claudia',
  'emilio-soto':      'Emilio',
  'sebastian-soto':   'Chari',
};

interface FinancialAnalysisProps {
  policy?: PolicyCalculada;
}

export function FinancialAnalysis({ policy }: FinancialAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  const [asegurados, setAsegurados] = useState(ASEGURADOS_GRUPO);

  useEffect(() => {
    setMounted(true);
    // Load local storage conciliaciones to calculate dynamic values
    const saved = localStorage.getItem('gmm-conciliaciones');
    if (saved) {
      try {
        const conciliaciones = JSON.parse(saved);
        const updatedGrupo = JSON.parse(JSON.stringify(ASEGURADOS_GRUPO));
        
        conciliaciones.forEach((c: any) => {
          const asegurado = updatedGrupo.find((a: any) => a.id === c.insuredKey);
          if (asegurado) {
            const normalize = (num: string) => num.replace(/\D/g, '');
            const targetNorm = normalize(c.claimNum);
            
            // Check if claim exists
            let siniestro = asegurado.siniestros.find((s: any) => 
              normalize(s.numero).startsWith(targetNorm.substring(0, 11))
            );
            
            if (siniestro) {
              siniestro.total_pagado += c.amount;
              siniestro.pendiente_carta_pase = Math.max(0, siniestro.pendiente_carta_pase - c.amount);
              siniestro.estado = 'liquidado';
            } else {
              asegurado.siniestros.unshift({
                numero: c.claimNum,
                padecimiento: c.diagnosis,
                poliza: '02012-0075008',
                inciso: 4,
                suma_asegurada: 108049334,
                total_pagado: c.amount,
                pendiente_carta_pase: 0,
                sa_disponible: 108049334 - c.amount,
                deducible_aplicado: c.deducible,
                coaseguro_pct: 10,
                coaseguro_aplicado: c.coaseguro,
                estado: 'liquidado'
              });
            }
          }
        });
        setAsegurados(updatedGrupo);
      } catch (e) {
        console.error("Error applying saved conciliaciones:", e);
      }
    }
  }, []);

  const policySum = policy?.suma_asegurada_mxn || POLIZA_FALLBACK.suma_asegurada_mxn;

  // Calculate stats based on local state
  const patientSubtotals = asegurados.map((a) => {
    const sub = calcularSubtotalAsegurado(a);
    return {
      id: a.id,
      name: SHORT_NAMES[a.id] || a.nombre.split(' ')[0],
      pagado: sub.total_pagado,
      color: COLORS[a.id] || '#94A3B8',
    };
  });

  const totalPending = asegurados.reduce((acc, a) => {
    const sub = calcularSubtotalAsegurado(a);
    return acc + sub.total_pendiente;
  }, 0);

  const totalPaid = asegurados.reduce((acc, a) => {
    const sub = calcularSubtotalAsegurado(a);
    return acc + sub.total_pagado;
  }, 0);

  const totalDeducible = asegurados.reduce((acc, a) => {
    const sub = calcularSubtotalAsegurado(a);
    return acc + sub.total_deducible;
  }, 0);

  const totalCoaseguro = asegurados.reduce((acc, a) => {
    const sub = calcularSubtotalAsegurado(a);
    return acc + sub.total_coaseguro;
  }, 0);

  // 1. Policy Limit (Start)
  // 2-5. Consumed by Insured family members
  // 6. Pending Claims
  // 7. Available Balance (Total)
  const steps: { name: string; value: number; type: 'start' | 'step' | 'total'; color: string }[] = [
    { name: 'Límite', value: policySum, type: 'start', color: '#64748B' },
  ];

  patientSubtotals.forEach((p) => {
    if (p.pagado > 0) {
      steps.push({
        name: p.name,
        value: -p.pagado,
        type: 'step',
        color: p.color
      });
    }
  });

  if (totalPending > 0) {
    steps.push({
      name: 'Pendiente',
      value: -totalPending,
      type: 'step',
      color: '#F59E0B'
    });
  }

  const saDisponible = Math.max(0, policySum - totalPaid - totalPending);
  steps.push({
    name: 'Disponible',
    value: saDisponible,
    type: 'total',
    color: '#10B981'
  });

  // Transform data for Recharts stack waterfall
  let cumulative = 0;
  const waterfallData = steps.map((item) => {
    const isStart = item.type === 'start';
    const isTotal = item.type === 'total';
    
    let base = 0;
    let displayValue = Math.abs(item.value);
    
    if (isStart) {
      base = 0;
      cumulative = item.value;
    } else if (isTotal) {
      base = 0;
      displayValue = item.value;
    } else {
      if (item.value < 0) {
        cumulative += item.value;
        base = cumulative;
      } else {
        base = cumulative;
        cumulative += item.value;
      }
    }

    return {
      name: item.name,
      value: item.value,
      displayValue,
      base,
      color: item.color,
      isTotal
    };
  });

  const perInsured = asegurados.map((a) => {
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

  const kpis = [
    { label: 'Total Pagado',       value: totalPaid,       icon: Wallet,       color: '#FFAA00' },
    { label: 'Pend. Carta Pase',   value: totalPending,    icon: Clock,        color: totalPending > 0 ? '#EF4444' : '#94A3B8' },
    { label: 'Deducibles',         value: totalDeducible,  icon: TrendingDown, color: '#38BDF8' },
    { label: 'Coaseguro 10%',      value: totalCoaseguro,  icon: Receipt,      color: '#A78BFA' },
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

      {/* ── Policy Waterfall Chart ── */}
      <div className="gmm-box p-5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text)' }}>
            Consumo de Póliza (Cascada)
          </h3>
          <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {Math.round((saDisponible / policySum) * 100)}% Disp.
          </span>
        </div>
        <div className="h-[210px] w-full relative">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallData}
                margin={{ top: 10, right: 5, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  fontSize={8} 
                  fontWeight="black" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', opacity: 0.5 }}
                />
                <YAxis 
                  fontSize={8}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', opacity: 0.5 }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 170, 0, 0.04)' }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const val = data.value;
                      const isTotal = data.isTotal;
                      const isLimit = data.name === 'Límite';
                      return (
                        <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-white">
                          <p className="text-[9px] font-black uppercase text-white/40 mb-1 tracking-wider">{data.name}</p>
                          <p className="text-xs font-black">
                            {isLimit || isTotal ? '' : val > 0 ? '+' : ''}{fmt(val)}
                          </p>
                          <p className="text-[7px] font-bold text-white/30 uppercase mt-1">
                            {isLimit ? 'Suma Asegurada Póliza' : isTotal ? 'Disponible para Reclamos' : 'Consumido'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Base bar (transparent) to lift the value bar */}
                <Bar dataKey="base" stackId="a" fill="transparent" />
                
                {/* The actual value bar */}
                <Bar dataKey="displayValue" stackId="a" radius={[3, 3, 3, 3]}>
                  {waterfallData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
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

