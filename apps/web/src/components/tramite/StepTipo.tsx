'use client';

import React from 'react';
import { 
  Receipt, 
  CalendarClock, 
  Files, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TramiteType } from '@/types/claims';

interface StepTipoProps {
  value: TramiteType;
  onChange: (type: TramiteType) => void;
  onNext: () => void;
}

const TYPES = [
  {
    id: 'reembolso',
    label: 'Reembolso de Gastos',
    description: 'Recupera los gastos médicos que ya pagaste (Consultas, Medicamentos, etc).',
    icon: Receipt,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20'
  },
  {
    id: 'programacion',
    label: 'Programación de Cirugía',
    description: 'Solicita autorización previa para un procedimiento quirúrgico u hospitalario.',
    icon: CalendarClock,
    color: 'text-medical-cyan',
    bg: 'bg-medical-cyan/10',
    border: 'border-medical-cyan/20'
  },
  {
    id: 'carta_pase',
    label: 'Carta Pase Especial',
    description: 'Solicitud de autorización para terapias, estudios especiales o consultas.',
    icon: Files,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  }
];

export default function StepTipo({ value, onChange, onNext }: StepTipoProps) {
  return (
    <div className="space-y-12">
      {/* 🧭 Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Seleccionar <span className="text-medical-cyan">Propósito</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          ¿Qué tipo de trámite deseas iniciar hoy? El motor de n8n usará esta configuración para procesar tus documentos.
        </p>
      </div>

      {/* 🧩 Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TYPES.map((type, idx) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onChange(type.id as TramiteType)}
            className={cn(
              "p-8 rounded-3xl border-2 transition-all relative overflow-hidden group text-left h-full flex flex-col",
              value === type.id 
                ? "bg-slate-900 border-medical-cyan shadow-xl shadow-medical-cyan/10 ring-4 ring-medical-cyan/5" 
                : "bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {/* Visual indicator of selection */}
            {value === type.id && (
              <div className="absolute top-4 right-4 text-medical-cyan">
                <CheckCircle2 size={24} fill="currentColor" fillOpacity={0.1} />
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:-rotate-3",
              type.bg,
              type.color
            )}>
              <type.icon size={28} strokeWidth={2.5} />
            </div>

            {/* Label & Description */}
            <div className="flex-1 space-y-3">
              <h3 className={cn(
                "text-lg font-black tracking-tight transition-colors",
                value === type.id ? "text-white" : "text-slate-900 dark:text-white"
              )}>
                {type.label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {type.description}
              </p>
            </div>

            {/* Background Grain/Grid decoration */}
            <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-[0.03]" />
          </motion.button>
        ))}
      </div>

      {/* 🚀 Action */}
      <div className="flex justify-center pt-8">
        <button
          onClick={onNext}
          disabled={!value}
          className={cn(
            "px-12 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl",
            !value 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
              : "bg-medical-cyan text-white shadow-medical-cyan/30 hover:scale-[1.03] active:scale-95 group"
          )}
        >
          CONTINUAR AL DETALLE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 🛡️ Privacy Note */}
      <div className="text-center opacity-40">
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck size={12} /> Procesamiento Conforme a Políticas GMM v2.0
        </p>
      </div>
    </div>
  );
}
