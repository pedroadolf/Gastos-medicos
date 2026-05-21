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
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
          Cargar <span style={{ color: 'var(--gmm-accent)' }}>Documentación</span>
        </h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--gmm-text-muted)' }}>
          Sube los archivos necesarios para completar tu expediente. El motor de IA los clasificará automáticamente.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* 🚀 Master Dropzone (The "Bulk" Option) */}
        <div 
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gmm-accent)'; e.currentTarget.style.background = 'rgba(255, 170, 0, 0.05)'; }}
          onDragLeave={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gmm-border)'; e.currentTarget.style.background = 'var(--gmm-bg-panel)'; }}
          onDrop={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'var(--gmm-border)';
            e.currentTarget.style.background = 'var(--gmm-bg-panel)';
            const droppedFiles = Array.from(e.dataTransfer.files);
            
            const newFiles = { ...files };
            droppedFiles.forEach(file => {
              const name = file.name.toLowerCase();
              if (name.includes('ine') || name.includes('identifica') || name.includes('dni') || name.includes('id_')) newFiles['identificacion'] = file;
              else if (name.includes('comprobante') || name.includes('domicilio') || name.includes('luz') || name.includes('agua') || name.includes('direcci')) newFiles['comprobante'] = file;
              else if (name.includes('receta') || name.includes('medico') || name.includes('doctor')) newFiles['receta'] = file;
              else if (name.includes('estudio') || name.includes('analisis') || name.includes('lab') || name.includes('imagen') || name.includes('rx') || name.includes('sangre')) newFiles['estudios'] = file;
              else if (name.includes('estado') || name.includes('cuenta') || name.includes('banco') || name.includes('clabe') || name.includes('fiscal')) newFiles['estado_cuenta'] = file;
              else {
                // Fallback: assign to first empty slot if it's a PDF/Image
                const firstEmpty = REQUIRED_DOCS.find(doc => !newFiles[doc.id]);
                if (firstEmpty) newFiles[firstEmpty.id] = file;
              }
            });
            setFiles(newFiles);
          }}
          className="relative group cursor-pointer"
        >
          <div className="absolute -top-14 right-4 flex flex-col items-end gap-1">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Documentos Detectados</span>
            <div 
              className="px-4 py-1.5 rounded-full shadow-lg transition-all duration-500 border-2"
              style={
                Object.keys(files).length > 0
                  ? { background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }
                  : { background: 'rgba(255, 170, 0, 0.1)', borderColor: 'rgba(255, 170, 0, 0.3)', color: 'var(--gmm-accent)' }
              }
            >
              <span className="text-sm font-black tracking-tighter">
                {Object.keys(files).length} <span className="text-[10px] opacity-40">de</span> {REQUIRED_DOCS.length}
              </span>
            </div>
          </div>
          
          <div className="absolute -inset-2 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
               style={{ background: 'linear-gradient(to right, rgba(255, 170, 0, 0.3), rgba(255, 170, 0, 0.15))' }}></div>
          <div 
            className="relative p-12 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all group-hover:shadow-2xl overflow-hidden min-h-[300px]"
            style={{
              background: 'var(--gmm-bg-panel)',
              borderColor: 'var(--gmm-border)'
            }}
          >
             
             {/* Decorative Background Icon */}
             <FileUp size={120} className="absolute -bottom-4 -right-4 -rotate-12 pointer-events-none" style={{ color: 'var(--gmm-accent)', opacity: 0.05 }} />

             <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ background: '#FFAA00', color: '#1a1a1a', boxShadow: '0 12px 32px rgba(255,170,0,0.3)' }}>
                <FileUp size={42} strokeWidth={3} />
             </div>
             
             <div className="text-center space-y-3">
                <h3 className="text-3xl font-black uppercase tracking-tight italic" style={{ color: 'var(--gmm-text)' }}>CARGA MASIVA</h3>
                <p className="text-sm font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--gmm-text-muted)' }}>
                   Arrastra <span style={{ color: 'var(--gmm-text)', fontWeight: 900, textDecoration: 'underline', textDecorationColor: '#FFAA00', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>todo el expediente</span> aquí. El sistema clasificará INE, Recetas y Estudios automáticamente.
                </p>
             </div>

             <div className="flex gap-4 p-2 rounded-2xl border" style={{ background: 'var(--gmm-bg)', borderColor: 'var(--gmm-border)' }}>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border-r last:border-0" style={{ color: 'var(--gmm-text-muted)', borderColor: 'var(--gmm-border)' }}>PDF</span>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border-r last:border-0" style={{ color: 'var(--gmm-text-muted)', borderColor: 'var(--gmm-border)' }}>JPG/PNG</span>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>XML</span>
             </div>

             <input 
               type="file" 
               multiple 
               className="absolute inset-0 opacity-0 cursor-pointer" 
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                 const selected = Array.from(e.target.files || []);
                 const newFiles = { ...files };
                 selected.forEach(file => {
                   const name = file.name.toLowerCase();
                   if (name.includes('ine') || name.includes('identifica') || name.includes('dni') || name.includes('id_')) newFiles['identificacion'] = file;
                   else if (name.includes('comprobante') || name.includes('domicilio') || name.includes('luz') || name.includes('agua') || name.includes('direcci')) newFiles['comprobante'] = file;
                   else if (name.includes('receta') || name.includes('medico') || name.includes('doctor')) newFiles['receta'] = file;
                   else if (name.includes('estudio') || name.includes('analisis') || name.includes('lab') || name.includes('imagen') || name.includes('rx') || name.includes('sangre')) newFiles['estudios'] = file;
                   else if (name.includes('estado') || name.includes('cuenta') || name.includes('banco') || name.includes('clabe') || name.includes('fiscal')) newFiles['estado_cuenta'] = file;
                   else {
                     const firstEmpty = REQUIRED_DOCS.find(doc => !newFiles[doc.id]);
                     if (firstEmpty) newFiles[firstEmpty.id] = file;
                   }
                 });
                 setFiles(newFiles);
               }}
             />
          </div>
        </div>

        <div className="flex items-center gap-4 py-4">
          <div className="h-[1px] flex-1" style={{ background: 'var(--gmm-border)' }} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--gmm-text-muted)' }}>o carga individual</span>
          <div className="h-[1px] flex-1" style={{ background: 'var(--gmm-border)' }} />
        </div>

        {/* 🧩 Individual Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUIRED_DOCS.map((doc, idx) => {
            const file = files[doc.id];
            
            return (
              <motion.label
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onDragOver={(e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gmm-accent)'; }}
                onDragLeave={(e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.currentTarget.style.borderColor = file ? 'rgba(34, 197, 94, 0.3)' : 'var(--gmm-border)'; }}
                onDrop={(e: React.DragEvent<HTMLLabelElement>) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = file ? 'rgba(34, 197, 94, 0.3)' : 'var(--gmm-border)';
                  if (e.dataTransfer.files[0]) handleFile(doc.id, e.dataTransfer.files[0]);
                }}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col items-start gap-4 h-full min-h-[140px] relative overflow-hidden",
                  file 
                    ? "bg-emerald-500/5 ring-1 ring-emerald-500/10" 
                    : "bg-gmm-card hover:shadow-md"
                )}
                style={{
                  borderColor: file ? 'rgba(34, 197, 94, 0.3)' : 'var(--gmm-border)'
                }}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFile(doc.id, e.target.files?.[0] || null)}
                />

                <div className="flex justify-between w-full items-start">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                       style={{
                         background: file ? '#22c55e' : 'var(--gmm-bg)',
                         color: file ? '#ffffff' : 'var(--gmm-text-muted)'
                       }}>
                    {file ? <Check size={24} strokeWidth={3} /> : <FileUp size={24} />}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border"
                        style={
                          file
                            ? { background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22c55e' }
                            : { background: 'rgba(0,0,0,0.03)', borderColor: 'var(--gmm-border)', color: 'var(--gmm-text-muted)' }
                        }>
                    {doc.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black tracking-tight"
                      style={{ color: file ? '#2e7d32' : 'var(--gmm-text)' }}>
                    {doc.label}
                  </h4>
                  <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'var(--gmm-text-muted)' }}>
                    {file ? `${file.name.substring(0, 30)}...` : doc.desc}
                  </p>
                </div>
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
        <div className="flex justify-between items-center mt-12 p-6 rounded-3xl border border-dashed"
             style={{ background: 'var(--gmm-bg-panel)', borderColor: 'var(--gmm-border)' }}>
          <button
            onClick={onBack}
            className="px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
            style={{ color: 'var(--gmm-text-muted)', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gmm-text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gmm-text-muted)'; }}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> ATRÁS
          </button>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Estado</p>
                <p className="text-xs font-bold flex items-center gap-1 justify-end" style={{ color: '#22c55e' }}>
                   <ShieldCheck size={14} /> Listo para procesar
                </p>
             </div>
             <button
              onClick={onSubmit}
              disabled={isSubmitting || !allUploaded}
              className="px-12 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 relative overflow-hidden group"
              style={(isSubmitting || !allUploaded) ? {
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
