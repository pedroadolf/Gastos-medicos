'use client';

import { useState } from 'react';
import { 
  User, Hospital, Paperclip, Plus, Save, Send
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function NuevoTramitePage() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-12">
        <h2 className="text-[28px] font-black tracking-tighter text-gmm-text uppercase italic leading-none">
          Nuevo Trámite
        </h2>
        <p className="text-[11px] font-bold text-gmm-text/40 uppercase tracking-widest mt-2">
          Sigue la línea para completar el registro del expediente médico.
        </p>
      </div>

        {/* Timeline Indicator Line */}
        <div className="absolute left-[1.75rem] top-7 bottom-7 w-1 bg-gmm-border/30 rounded-full" />

        {/* Step 1: Información del Asegurado */}
        <div className="relative pl-16 pb-16">
          <div className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
            activeStep === 1 
              ? 'bg-gmm-accent text-white scale-110 shadow-gmm-accent/20' 
              : 'bg-gmm-card text-gmm-text/20 border border-gmm-border/50'
          }`}>
            <User size={24} />
          </div>
          
          <div className="gmm-pill-card border-gmm-border/30">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">
              1. Identificación del Asegurado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gmm-text-muted">Asegurado / Parentesco</label>
                <div className="relative">
                  <select className="w-full bg-gmm-bg/50 border border-gmm-border/30 rounded-2xl px-6 py-4 text-xs font-bold text-gmm-text focus:ring-2 focus:ring-gmm-accent outline-none appearance-none transition-all cursor-pointer">
                    <option>Seleccionar asegurado...</option>
                    <option>Claudia Soto (Titular)</option>
                    <option>Marcos Pérez (Esposo)</option>
                    <option>Sofía Pérez (Hija)</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Plus size={16} className="rotate-45" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gmm-text-muted">Número de Póliza Activa</label>
                <div className="px-6 py-4 bg-gmm-bg/30 border border-gmm-border/20 rounded-2xl">
                  <p className="text-xs font-black text-gmm-text/50 tracking-widest">GMM-98765-MET</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Detalles del Evento */}
        <div className="relative pl-16 pb-16">
          <div className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
             activeStep === 2 
               ? 'bg-gmm-accent text-white scale-110 shadow-gmm-accent/20' 
               : 'bg-gmm-card text-gmm-text/20 border border-gmm-border/50'
          }`}>
            <Hospital size={24} />
          </div>
          
          <div className="gmm-pill-card border-gmm-border/30">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">
              2. Protocolo Clínico y Detalle
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border-2 border-transparent bg-gmm-bg/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 focus:border-gmm-accent group">
                   <div className="text-3xl group-hover:scale-110 transition-transform">⚡</div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gmm-text-muted">Accidente</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] border-2 border-transparent bg-gmm-bg/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5 focus:border-gmm-accent group">
                   <div className="text-3xl group-hover:scale-110 transition-transform">🩺</div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gmm-text-muted">Enfermedad</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gmm-text-muted">Descripción del Diagnóstico / Síntomas</label>
                <textarea 
                  rows={4} 
                  className="w-full bg-gmm-bg/50 border border-gmm-border/30 rounded-[2rem] px-8 py-6 text-xs font-bold text-gmm-text focus:ring-2 focus:ring-gmm-accent outline-none transition-all placeholder:text-gmm-text/20" 
                  placeholder="Relación cronológica de los hechos..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Documentación */}
        <div className="relative pl-16">
          <div className={`absolute left-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
            activeStep === 3 
              ? 'bg-gmm-accent text-white scale-110 shadow-gmm-accent/20' 
              : 'bg-gmm-card text-gmm-text/20 border border-gmm-border/50'
          }`}>
            <Paperclip size={24} />
          </div>
          
          <div className="gmm-pill-card border-gmm-border/30">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">
              3. Carga de Documentación Digital
            </h3>
            <div className="group relative border-2 border-dashed border-gmm-border/50 rounded-[3rem] p-12 flex flex-col items-center justify-center transition-all duration-500 hover:border-gmm-accent hover:bg-gmm-accent/5 cursor-pointer">
              <div className="w-16 h-16 bg-gmm-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Plus size={28} className="text-gmm-accent" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gmm-text underline decoration-gmm-accent decoration-2 underline-offset-8">
                Adjuntar Expediente OCR
              </p>
              <p className="text-[9px] font-black text-gmm-text-muted mt-5 uppercase tracking-widest opacity-60">
                PDF, JPG o PNG · Máximo 25MB por archivo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 flex justify-end items-center gap-8">
        <button className="flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gmm-text-muted hover:text-gmm-text transition-all hover:bg-gmm-text/5">
          <Save size={16} />
          Guardar Borrador
        </button>
        <button className="flex items-center gap-4 px-12 py-5 bg-gmm-danger text-white rounded-full text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-gmm-danger/30 hover:scale-105 active:scale-95 transition-all">
          <Send size={18} />
          Enviar Trámite
        </button>
      </div>
    </div>
  );
}
