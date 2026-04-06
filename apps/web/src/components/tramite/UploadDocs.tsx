'use client';

import React from 'react';
import { 
  FileUp, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle,
  FileText,
  BadgeInfo,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UploadDocsProps {
  files: Record<string, File>;
  setFiles: (files: Record<string, File>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const REQUIRED_DOCS = [
  { id: 'identificacion', label: 'Identificación Oficial', desc: 'INE o Pasaporte vigente.', category: 'Legal' },
  { id: 'comprobante', label: 'Comprobante Domicilio', desc: 'Luz, agua o predial (Max 3 meses).', category: 'Legal' },
  { id: 'receta', label: 'Recetas Médicas', desc: 'Con sello y firma legible.', category: 'Médico' },
  { id: 'estudios', label: 'Estudios Médicos', desc: 'Resultados de laboratorio o imagen.', category: 'Médico' },
  { id: 'estado_cuenta', label: 'Estado de Cuenta', desc: 'Para el depósito del reembolso.', category: 'Financiero' },
];

export default function UploadDocs({ files, setFiles, onBack, onSubmit, isSubmitting }: UploadDocsProps) {
  const handleFile = (id: string, file: File | null) => {
    if (!file) {
      const newFiles = { ...files };
      delete newFiles[id];
      setFiles(newFiles);
      return;
    }
    setFiles({ ...files, [id]: file });
  };

  const allUploaded = REQUIRED_DOCS.every(doc => files[doc.id]);

  return (
    <div className="space-y-12">
      {/* 📎 Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Cargar <span className="text-medical-cyan">Documentación</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Sube los archivos necesarios para completar tu expediente. El motor de IA los clasificará automáticamente.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* 🧩 Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUIRED_DOCS.map((doc, idx) => {
            const file = files[doc.id];
            
            return (
              <motion.label
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col items-start gap-4 h-full min-h-[140px] relative overflow-hidden",
                  file 
                    ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/10" 
                    : "bg-white dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFile(doc.id, e.target.files?.[0] || null)}
                />

                <div className="flex justify-between w-full items-start">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    file ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    {file ? <Check size={24} strokeWidth={3} /> : <FileUp size={24} />}
                  </div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                    file ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                  )}>
                    {doc.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className={cn("text-sm font-black tracking-tight", file ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                    {doc.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    {file ? `${file.name.substring(0, 20)}...` : doc.desc}
                  </p>
                </div>

                {/* Overlays / State signals */}
                {!file && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BadgeInfo size={20} className="text-medical-cyan" />
                  </div>
                )}
              </motion.label>
            );
          })}
        </div>

        {/* ⚠️ Warning If Missing */}
        <AnimatePresence>
          {!allUploaded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 overflow-hidden"
            >
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
                Faltan algunos documentos obligatorios. Para un procesamiento rápido de n8n, se recomienda subir el expediente completo.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚀 Navigation */}
        <div className="flex justify-between items-center mt-12 bg-slate-950/20 p-6 rounded-3xl border border-slate-800/40 border-dashed">
          <button
            onClick={onBack}
            className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> ATRÁS
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</p>
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                   <ShieldCheck size={14} /> Listo para procesar
                </p>
             </div>
             <button
              onClick={onSubmit}
              disabled={isSubmitting || !allUploaded}
              className={cn(
                "px-12 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-2xl relative overflow-hidden group",
                isSubmitting || !allUploaded
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                  : "bg-medical-cyan text-white shadow-medical-cyan/30 hover:scale-[1.03] active:scale-95"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> GENERANDO EXPEDIENTE...
                </>
              ) : (
                <>
                  FINALIZAR Y ENVIAR <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
