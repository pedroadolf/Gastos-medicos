'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronRight, Calculator, History, Pill, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EventMonitorCardProps {
  event: {
    claimId: string;
    diagnosis: string;
    chronic?: boolean;
    patientName: string;
    patientPhoto?: string;
    role: string;
    age: string;
    consumed: number;
    pendingAmount?: number;
    sublimit: number;
    deductibleAmount?: number;
    deductibleStatus?: string;
    coaseguroPagado?: number;
    coaseguroLimit?: number;
    coaseguroPercentage?: number;
    lastUpdate?: string;
    status: string;
    observations?: string;
    policyNumber?: string;
    affectedName?: string;
    firstExpenseDate?: string;
    medications?: { name: string; period: string; status: string }[];
  };
  index: number;
  onPhotoUpload: (patientName: string, file: File) => void;
}

export function EventMonitorCard({ event, index, onPhotoUpload }: EventMonitorCardProps) {
  const consumed = event.consumed;
  const pending = event.pendingAmount || 0;
  const available = event.sublimit - consumed;
  const sublimit = event.sublimit;
  const consumedPct = (consumed / sublimit) * 100;

  const initials = (event.patientName || 'Asegurado').split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      className="gmm-box p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500"
    >
      {/* Header Informativo con Gradiente Sutil */}
      <div className="bg-gmm-bg-panel dark:bg-zinc-800/50 px-8 py-8 border-b border-slate-200 dark:border-white/5 flex flex-wrap items-center gap-x-12 gap-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group/photo shrink-0">
             <div className="h-16 w-16 rounded-[22px] overflow-hidden ring-4 ring-white dark:ring-white/10 shadow-2xl bg-white dark:bg-zinc-800 flex items-center justify-center transition-all duration-500 group-hover/photo:scale-110 group-hover/photo:rotate-3">
               {event.patientPhoto ? (
                 <img src={event.patientPhoto} alt={event.patientName} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-2xl font-black text-slate-300 dark:text-slate-500 uppercase">{initials}</span>
               )}
             </div>
          </div>
          <div>
            <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Asegurado / Afectado</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              {event.patientName} <span className="text-slate-300 dark:text-slate-600 font-light mx-2">|</span> <span className="text-blue-600 dark:text-blue-400">{event.affectedName || event.patientName}</span>
            </h3>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <div className="space-y-1">
            <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Póliza</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-200">{event.policyNumber || '02001-2012432'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Siniestro</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-200">{event.claimId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Primer Gasto</p>
            <p className="text-lg font-black text-slate-700 dark:text-slate-200">{event.firstExpenseDate || 'N/A'}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 ${event.status === 'ACTIVO' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
            {event.status}
          </div>
          <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 shadow-lg active:scale-95">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="p-12 flex flex-col xl:flex-row gap-16">
        {/* Lado Izquierdo: Saldo Disponible */}
        <div className="flex-1 space-y-10">
          <div className="bg-gmm-bg-panel/40 dark:bg-white/[0.03] p-10 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-inner">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[15px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] mb-2">Saldo Disponible del Seguro</p>
                <h4 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{consumedPct.toFixed(1)}%</span>
                <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Consumido</p>
              </div>
            </div>
            
            {/* Barra de Progreso Mejorada */}
            <div className="h-7 w-full bg-slate-300/30 dark:bg-white/10 rounded-full overflow-hidden flex shadow-inner border-4 border-white dark:border-zinc-800">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${consumedPct}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[progress-bar-stripes_2s_linear_infinite]" />
              </motion.div>
            </div>
            
            <div className="flex justify-between mt-5 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Suma Inicial: ${(sublimit/1000000).toFixed(2)}M</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Deducible Aplicado: ${(event.deductibleAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 px-6 bg-orange-50/50 dark:bg-orange-500/5 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/10">
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[12px] font-bold text-orange-800/80 dark:text-orange-300/80 italic leading-relaxed">
              Nota aclaratoria: "Información sujeta a cambios por flujo de facturación y procesos de auditoría médica en curso."
            </p>
          </div>
        </div>

        {/* Lado Derecho: Grid de Métricas con Efecto Elevado */}
        <div className="xl:w-[540px] grid grid-cols-2 gap-6">
          {[
            { label: 'Total Pagado', value: consumed, color: 'text-slate-900 dark:text-white', sub: 'Monto liquidado' },
            { label: 'Pendiente Carta Pase', value: pending, color: 'text-orange-500', sub: 'En proceso' },
            { label: 'Coaseguro Pagado', value: event.coaseguroPagado, color: 'text-blue-600 dark:text-blue-400', sub: `${event.coaseguroPercentage || 10}% contratado` },
            { label: 'Deducible Total', value: event.deductibleAmount, color: 'text-slate-900 dark:text-white', sub: 'Cuota fija' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-white/[0.03] p-10 rounded-[35px] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 group/metric">
              <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-5 group-hover/metric:text-blue-500 transition-colors">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color} tracking-tight mb-2`}>
                ${(stat.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
