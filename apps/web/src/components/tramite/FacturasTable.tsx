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
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
          Detalle de <span style={{ color: 'var(--gmm-accent)' }}>Facturas</span>
        </h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--gmm-text-muted)' }}>
          Ingresa el desglose de los gastos. Esta información será procesada por el motor de auditoría automatizada.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* 📋 Table Container */}
        <div className="bg-gmm-card border rounded-[var(--gmm-radius)] shadow-[var(--gmm-shadow)] overflow-hidden scale-100 group" style={{ borderColor: 'var(--gmm-border)' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ background: 'var(--gmm-bg-panel)', borderColor: 'var(--gmm-border)' }}>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Concepto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Factura / UUID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--gmm-text-muted)' }}>Importe</th>
                <th className="px-4 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--gmm-border)' }}>
              <AnimatePresence initial={false}>
                {invoices.map((row, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="hover:bg-slate-500/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <select 
                        value={row.tipo_gasto}
                        onChange={(e) => updateRow(index, 'tipo_gasto', e.target.value as FacturaTipo)}
                        className={cn(
                          "appearance-none text-xs font-black px-4 py-2 rounded-xl border focus:ring-4 focus:ring-gmm-accent/10 outline-none transition-all cursor-pointer",
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
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gmm-text-muted)' }} />
                        <input 
                          type="text"
                          value={row.numero_factura}
                          onChange={(e) => updateRow(index, 'numero_factura', e.target.value)}
                          placeholder="Ej: A-12345"
                          className="w-full rounded-xl px-10 py-2.5 text-sm outline-none transition-all font-bold"
                          style={{
                            background: 'var(--gmm-bg-panel)',
                            border: '1px solid var(--gmm-border)',
                            color: 'var(--gmm-text)',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--gmm-accent)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--gmm-border)'; }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--gmm-accent)' }} />
                        <input 
                          type="number"
                          step="0.01"
                          value={row.importe || ''}
                          onChange={(e) => updateRow(index, 'importe', e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl px-10 py-2.5 text-sm text-right outline-none transition-all font-black tabular-nums"
                          style={{
                            background: 'var(--gmm-bg-panel)',
                            border: '1px solid var(--gmm-border)',
                            color: 'var(--gmm-text)',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--gmm-accent)'; }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--gmm-border)'; }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => removeRow(index)}
                        className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                        style={{ color: 'var(--gmm-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gmm-danger)'; e.currentTarget.style.background = 'rgba(178, 43, 33, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gmm-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
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
          <div className="p-6 border-t" style={{ borderColor: 'var(--gmm-border)', background: 'var(--gmm-bg-panel)' }}>
            <button 
              onClick={addRow}
              className="group flex items-center justify-center gap-3 w-full border-2 border-dashed p-4 rounded-2xl transition-all"
              style={{ borderColor: 'var(--gmm-border)', background: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gmm-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--gmm-border)'; }}
            >
              <div className="p-2 rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-90" style={{ background: 'rgba(255, 170, 0, 0.1)', color: 'var(--gmm-accent)' }}>
                <Plus size={18} strokeWidth={3} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest transition-colors group-hover:text-[var(--gmm-accent)]" style={{ color: 'var(--gmm-text-muted)' }}>
                Agregar Factura o Gasto Médico
              </span>
            </button>
          </div>
        </div>

        {/* 📊 Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-2 p-3 rounded-2xl border" style={{ background: 'rgba(255, 170, 0, 0.05)', borderColor: 'rgba(255, 170, 0, 0.15)' }}>
            <div className="p-2 rounded-xl" style={{ background: 'rgba(255, 170, 0, 0.1)', color: 'var(--gmm-accent)' }}>
              <Sparkle size={16} fill="currentColor" />
            </div>
            <p className="text-[10px] leading-tight font-medium uppercase tracking-wider" style={{ color: 'var(--gmm-text-muted)' }}>
              Los importes se consolidan en el <br/><span className="font-black" style={{ color: 'var(--gmm-accent)' }}>Expediente de n8n</span>
            </p>
          </div>

          <div className="flex items-center gap-6 px-8 py-5 rounded-3xl shadow-lg border" style={{ background: 'var(--gmm-bg-panel)', borderColor: 'var(--gmm-border)', boxShadow: 'var(--gmm-shadow)' }}>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Cálculo Total</p>
              <div className="flex items-center gap-2 justify-end">
                <Calculator size={14} style={{ color: 'var(--gmm-accent)' }} />
                <span className="text-3xl font-black tabular-nums" style={{ color: 'var(--gmm-text)' }}>
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
            className="px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
            style={{ color: 'var(--gmm-text-muted)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gmm-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gmm-text-muted)'; }}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> ATRÁS
          </button>
          <button
            onClick={onNext}
            disabled={invoices.length === 0}
            className="px-12 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 active:scale-[0.98] group"
            style={invoices.length === 0 ? {
              background: 'transparent',
              border: '2px solid var(--gmm-border)',
              color: 'var(--gmm-text-muted)',
              cursor: 'not-allowed',
              opacity: 0.6,
              boxShadow: 'none'
            } : {
              background: '#FFAA00',
              border: '2px solid transparent',
              color: '#1a1a1a',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255,170,0,0.25)'
            }}
          >
            DOCUMENTACIÓN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
