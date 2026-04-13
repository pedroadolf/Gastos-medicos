'use client';

import React from 'react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Hash, 
  DollarSign, 
  ArrowLeft, 
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FacturaRow, FacturaTipo } from '@/types/claims';
import { cn } from '@/lib/utils';

interface FacturasTableProps {
  invoices: FacturaRow[];
  onChange: (invoices: FacturaRow[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const TIPO_LABELS: Record<FacturaTipo, string> = {
  H: 'Hospital',
  M: 'Honorarios Médicos',
  F: 'Farmacia',
  O: 'Otros Gastos'
};

const TIPO_COLORS: Record<FacturaTipo, string> = {
  H: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  M: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  F: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  O: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

export default function FacturasTable({ invoices, onChange, onBack, onNext }: FacturasTableProps) {
  const addRow = () => {
    const newRow: FacturaRow = {
      numero_factura: '',
      importe: 0,
      tipo_gasto: 'O'
    };
    onChange([...invoices, newRow]);
  };

  const removeRow = (index: number) => {
    const newInvoices = invoices.filter((_, i) => i !== index);
    onChange(newInvoices);
  };

  const updateRow = (index: number, field: keyof FacturaRow, value: any) => {
    const newInvoices = [...invoices];
    newInvoices[index] = { ...newInvoices[index], [field]: value };
    onChange(newInvoices);
  };

  const total = invoices.reduce((sum, inv) => sum + (Number(inv.importe) || 0), 0);

  return (
    <div className="space-y-12">
      {/* 🧾 Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Detalle de <span className="text-medical-cyan">Facturas</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Ingresa el desglose de los gastos. Esta información será procesada por el motor de auditoría automatizada.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* 📋 Table Container */}
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden scale-100 group">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura / UUID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Importe</th>
                <th className="px-4 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence initial={false}>
                {invoices.map((row, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <select 
                        value={row.tipo_gasto}
                        onChange={(e) => updateRow(index, 'tipo_gasto', e.target.value as FacturaTipo)}
                        className={cn(
                          "appearance-none text-xs font-black px-4 py-2 rounded-xl border focus:ring-4 focus:ring-medical-cyan/5 outline-none transition-all cursor-pointer",
                          TIPO_COLORS[row.tipo_gasto]
                        )}
                      >
                        {Object.entries(TIPO_LABELS).map(([val, label]) => (
                          <option key={val} value={val} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text"
                          value={row.numero_factura}
                          onChange={(e) => updateRow(index, 'numero_factura', e.target.value)}
                          placeholder="Ej: A-12345"
                          className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl px-10 py-2.5 text-sm outline-none focus:border-medical-cyan transition-all font-bold placeholder:text-slate-300 placeholder:font-medium"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medical-cyan" />
                        <input 
                          type="number"
                          step="0.01"
                          value={row.importe || ''}
                          onChange={(e) => updateRow(index, 'importe', e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-xl px-10 py-2.5 text-sm text-right outline-none focus:border-emerald-500 transition-all font-black text-slate-900 dark:text-white tabular-nums placeholder:text-slate-300"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => removeRow(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* ➕ Add Row Button */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/40">
            <button 
              onClick={addRow}
              className="group flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-medical-cyan/50 p-4 rounded-2xl transition-all"
            >
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:scale-110 group-hover:rotate-90 transition-transform">
                <Plus size={18} strokeWidth={3} />
              </div>
              <span className="text-sm font-black text-slate-500 dark:text-slate-400 group-hover:text-medical-cyan uppercase tracking-widest">
                Agregar Factura o Gasto Médico
              </span>
            </button>
          </div>
        </div>

        {/* 📊 Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-2 p-3 bg-medical-cyan/5 border border-medical-cyan/10 rounded-2xl">
            <div className="p-2 bg-medical-cyan/10 rounded-xl text-medical-cyan">
              <Sparkle size={16} fill="currentColor" />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight font-medium uppercase tracking-wider">
              Los importes se consolidan en el <br/><span className="text-medical-cyan font-black">Expediente de n8n</span>
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 px-8 py-5 rounded-3xl shadow-2xl shadow-medical-cyan/5 ring-1 ring-white/5">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Cálculo Total</p>
              <div className="flex items-center gap-1 justify-end">
                <Calculator size={14} className="text-medical-cyan" />
                <span className="text-3xl font-black text-white tabular-nums text-glow-cyan">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 Navigation */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={onBack}
            className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> ATRÁS
          </button>
          <button
            onClick={onNext}
            disabled={invoices.length === 0}
            className={cn(
              "px-12 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl",
              invoices.length === 0 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                : "bg-medical-cyan text-white shadow-medical-cyan/30 hover:scale-[1.03] active:scale-95 group"
            )}
          >
            DOCUMENTACIÓN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
