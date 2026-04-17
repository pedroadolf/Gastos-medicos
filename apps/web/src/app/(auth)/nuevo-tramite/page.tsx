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

      <div className="relative">
        {/* Step 1: Información del Asegurado */}
        <div className="relative pl-20 pb-16">
          <div className={`absolute left-0 w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
            activeStep === 1 ? 'bg-gmm-accent text-gmm-text scale-110' : 'bg-white text-gmm-text/20 border border-gmm-border'
          }`}>
            <User size={24} />
          </div>
          
          <div className="gmm-pill-card">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-6">
              1. Identificación del Asegurado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-gmm-text/40">Nombre Completo / Parentesco</label>
                <select className="w-full bg-gmm-bg/30 border-none rounded-2xl px-5 py-4 text-xs font-bold text-gmm-text focus:ring-2 focus:ring-gmm-accent outline-none appearance-none transition-all">
                  <option>Seleccionar asegurado...</option>
                  <option>Claudia Soto (Titular)</option>
                  <option>Marcos Pérez (Esposo)</option>
                  <option>Sofía Pérez (Hija)</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-gmm-text/40">Número de Póliza Activa</label>
                <input 
                  type="text" 
                  value="GMM-98765-MET" 
                  readOnly
                  className="w-full bg-gmm-bg/30 border-none rounded-2xl px-5 py-4 text-xs font-black text-gmm-text/50 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Detalles del Evento */}
        <div className="relative pl-20 pb-16">
          <div className={`absolute left-0 w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
             activeStep === 2 ? 'bg-gmm-accent text-gmm-text scale-110' : 'bg-white text-gmm-text/20 border border-gmm-border'
          }`}>
            <Hospital size={24} />
          </div>
          
          <div className="gmm-pill-card">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-6 uppercase italic">
              2. Protocolo Clínico y Detalle del Evento
            </h3>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-2 border-transparent bg-gmm-bg/30 transition-all hover:bg-gmm-accent/10 focus:border-gmm-accent focus:bg-gmm-accent/5">
                   <div className="text-2xl">⚡</div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Accidente</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-2 border-transparent bg-gmm-bg/30 transition-all hover:bg-gmm-accent/10 focus:border-gmm-accent focus:bg-gmm-accent/5">
                   <div className="text-2xl">🩺</div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Enfermedad</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-gmm-text/40 tracking-widest">Descripción del Diagnóstico / Síntomas</label>
                <textarea 
                  rows={4} 
                  className="w-full bg-gmm-bg/30 border-none rounded-3xl px-6 py-5 text-xs font-bold text-gmm-text focus:ring-2 focus:ring-gmm-accent outline-none transition-all placeholder:text-gmm-text/20" 
                  placeholder="Relación cronológica de los hechos..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Documentación */}
        <div className="relative pl-20">
          <div className={`absolute left-0 w-14 h-14 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 z-10 ${
            activeStep === 3 ? 'bg-gmm-accent text-gmm-text scale-110' : 'bg-white text-gmm-text/20 border border-gmm-border'
          }`}>
            <Paperclip size={24} />
          </div>
          
          <div className="gmm-pill-card">
            <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-6">
              3. Carga de Documentación Digital
            </h3>
            <div className="group relative border-2 border-dashed border-gmm-border rounded-[40px] p-16 flex flex-col items-center justify-center transition-all duration-500 hover:border-gmm-accent hover:bg-gmm-accent/5 cursor-pointer">
              <div className="w-20 h-20 bg-gmm-accent/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Plus size={32} className="text-gmm-accent" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gmm-text underline decoration-gmm-accent decoration-2 underline-offset-4">
                Adjuntar Expediente OCR
              </p>
              <p className="text-[9px] font-medium text-gmm-text/40 mt-3 uppercase tracking-widest">
                PDF, JPG o PNG · Máximo 25MB por archivo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-end items-center gap-6">
        <button className="flex items-center gap-2 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gmm-text/40 hover:text-gmm-text transition-colors">
          <Save size={16} />
          Guardar Borrador
        </button>
        <button className="flex items-center gap-3 px-12 py-5 bg-gmm-danger text-white rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gmm-danger/20 hover:scale-105 active:scale-95 transition-all">
          <Send size={18} />
          Enviar Trámite
        </button>
      </div>
    </div>
  );
}
