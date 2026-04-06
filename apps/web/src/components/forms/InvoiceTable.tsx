'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Receipt, DollarSign, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FacturaRow, FacturaTipo } from '@/types/claims';
import { cn } from '@/lib/utils';

interface InvoiceTableProps {
  invoices: FacturaRow[];
  onChange: (invoices: FacturaRow[]) => void;
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

export function InvoiceTable({ invoices, onChange }: InvoiceTableProps) {
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
    <div className="w-full space-y-4">
      {/* 🧾 Encabezado y Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gasto / Concepto</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Número Factura</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Importe ($)</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <AnimatePresence initial={false}>
              {invoices.map((row, index) => (
                <motion.tr 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select 
                        value={row.tipo_gasto}
                        onChange={(e) => updateRow(index, 'tipo_gasto', e.target.value as FacturaTipo)}
                        className={cn(
                          "appearance-none text-xs font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-medical-cyan/20 outline-none transition-all cursor-pointer",
                          TIPO_COLORS[row.tipo_gasto]
                        )}
                      >
                        {Object.entries(TIPO_LABELS).map(([val, label]) => (
                          <option key={val} value={val} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text"
                        value={row.numero_factura}
                        onChange={(e) => updateRow(index, 'numero_factura', e.target.value)}
                        placeholder="Ej: A-12345"
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-8 py-2 text-sm focus:border-medical-cyan outline-none transition-all font-medium"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="number"
                        step="0.01"
                        value={row.importe || ''}
                        onChange={(e) => updateRow(index, 'importe', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-8 py-2 text-sm text-right focus:border-medical-cyan outline-none transition-all font-bold text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => removeRow(index)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* ➕ Agregar Fila Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/40">
          <button 
            onClick={addRow}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
          >
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 group-hover:scale-110 transition-transform">
              <Plus size={16} />
            </div>
            Agregar factura o gasto
          </button>
        </div>
      </div>

      {/* 📊 Resumen / Total */}
      <div className="flex justify-end pr-6">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Calculator size={14} className="text-slate-400" />
            Total Capturado
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
