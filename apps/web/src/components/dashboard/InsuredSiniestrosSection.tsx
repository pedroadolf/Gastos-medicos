'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ASEGURADOS_GRUPO, 
  calcularSubtotalAsegurado, 
  calcularTotalGrupo 
} from '@/lib/siniestros-data';

// Utilities
const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k` : `$${fmt(n)}`;

const COLORS: Record<string, string> = {
  'pedro-soto': '#38BDF8',      // Sky Blue
  'claudia-fonseca': '#FFAA00',  // Gold/Amber (unified!)
  'emilio-soto': '#10B981',      // Emerald Green
  'sebastian-soto': '#A78BFA',   // Purple
};

const SHORT_NAMES: Record<string, string> = {
  'pedro-soto': 'PASH',
  'claudia-fonseca': 'Claudia',
  'emilio-soto': 'Emilio',
  'sebastian-soto': 'Chari',
};

export function InsuredSiniestrosSection() {
  const [mounted, setMounted] = useState(false);
  const [asegurados, setAsegurados] = useState(ASEGURADOS_GRUPO);
  const [activeTab, setActiveTab] = useState<string>(ASEGURADOS_GRUPO[0].id);

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

  if (!mounted) return null;

  // Transform all group data once based on dynamic state
  const groupData = asegurados.map((asegurado) => {
    const sub = calcularSubtotalAsegurado(asegurado);
    return { asegurado, sub };
  });

  const activeData = groupData.find(g => g.asegurado.id === activeTab);
  
  // Calculate total group dynamically from state
  const totalGrupo = asegurados.reduce((acc, asegurado) => {
    const sub = calcularSubtotalAsegurado(asegurado);
    return {
      total_pagado: acc.total_pagado + sub.total_pagado,
      total_pendiente: acc.total_pendiente + sub.total_pendiente,
      total_deducible: acc.total_deducible + sub.total_deducible,
      total_coaseguro: acc.total_coaseguro + sub.total_coaseguro,
      count_siniestros: acc.count_siniestros + sub.count_siniestros,
    };
  }, { total_pagado: 0, total_pendiente: 0, total_deducible: 0, total_coaseguro: 0, count_siniestros: 0 });

  if (!activeData) return null;

  return (
    <div className="space-y-6">
      {/* ── TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {groupData.map(({ asegurado }) => {
          const isActive = activeTab === asegurado.id;
          const color = COLORS[asegurado.id] || '#94A3B8';
          const name = SHORT_NAMES[asegurado.id] || asegurado.nombre.split(' ')[0];

          return (
            <button
              key={asegurado.id}
              onClick={() => setActiveTab(asegurado.id)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border outline-none",
                isActive 
                  ? "shadow-lg scale-[1.02]" 
                  : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10 dark:text-slate-400"
              )}
              style={isActive ? { 
                background: `${color}15`, 
                color, 
                borderColor: `${color}40`,
                boxShadow: `0 8px 20px -6px ${color}25`
              } : {}}
            >
              {name}
            </button>
          );
        })}
      </div>


      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="gmm-box overflow-hidden"
        >
          {/* Header Info */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-black shrink-0 shadow-inner"
                style={{ background: `${COLORS[activeData.asegurado.id] || '#ccc'}15`, color: COLORS[activeData.asegurado.id] || '#ccc' }}
              >
                {SHORT_NAMES[activeData.asegurado.id]?.substring(0, 2).toUpperCase() || 'NA'}
              </div>
              <div>
                <h3 className="text-[14px] font-black" style={{ color: 'var(--gmm-text)' }}>
                  {activeData.asegurado.nombre}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                  {activeData.asegurado.parentesco} · {activeData.asegurado.siniestros.length} Siniestros
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-slate-500">Subtotal Pagado</p>
                <p className="text-[15px] font-black text-emerald-500">{fmtK(activeData.sub.total_pagado)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-slate-500">Subtotal Pendiente</p>
                <p className="text-[15px] font-black text-amber-500">{fmtK(activeData.sub.total_pendiente)}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {activeData.asegurado.siniestros.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Sin siniestros registrados</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Siniestro / Padecimiento</th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Pagado</th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Pendiente</th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Deducible</th>
                    <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200 dark:border-slate-800">Coaseguro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeData.asegurado.siniestros.map((siniestro, idx) => (
                    <tr key={`${siniestro.numero}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>{siniestro.numero}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{siniestro.padecimiento}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">
                          {siniestro.total_pagado > 0 ? fmtK(siniestro.total_pagado) : '-'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[12px] font-black text-amber-600 dark:text-amber-400">
                          {siniestro.pendiente_carta_pase > 0 ? fmtK(siniestro.pendiente_carta_pase) : '-'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                          {siniestro.deducible_aplicado > 0 ? fmtK(siniestro.deducible_aplicado) : '-'}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                          {siniestro.coaseguro_aplicado > 0 ? fmtK(siniestro.coaseguro_aplicado) : '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── GLOBAL TOTALS BOTTOM BAR ── */}
      <div className="gmm-box p-4 flex flex-wrap items-center justify-between gap-4 border-t-2 border-emerald-500/20 bg-emerald-500/5 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <Users size={14} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest">Gran Total Grupo</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{ASEGURADOS_GRUPO.length} Asegurados · {totalGrupo.count_siniestros} Siniestros</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-slate-500">Pagado</p>
            <p className="text-[14px] font-black text-emerald-500">{fmtK(totalGrupo.total_pagado)}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 text-slate-500">Pendiente</p>
            <p className="text-[14px] font-black text-amber-500">{fmtK(totalGrupo.total_pendiente)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
