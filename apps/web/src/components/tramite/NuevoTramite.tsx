'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Info, ShieldCheck, Sparkles, AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import Stepper from './Stepper';
import StepTipo from './StepTipo';
import FacturasTable from './FacturasTable';
import UploadDocs from './UploadDocs';

// Services & Types
import { claimsService } from '@/services/claimsService';
import { Siniestro, FacturaRow, TramiteType } from '@/types/claims';

const STEPS = [
  { id: 1, label: 'Tipo' },
  { id: 2, label: 'Detalle' },
  { id: 3, label: 'Documentos' },
];

export default function NuevoTramite() {
  const router = useRouter();
  
  // -- State --
  const [step, setStep] = useState(1);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [selectedSiniestroId, setSelectedSiniestroId] = useState<string>('');
  const [tipo, setTipo] = useState<TramiteType>('reembolso');
  const [invoices, setInvoices] = useState<FacturaRow[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- Initial Load --
  useEffect(() => {
    fetch('/api/afectados')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSiniestros(data.siniestros);
        }
      })
      .catch(err => console.error("Error loading siniestros from API:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // -- Handlers --
  const handleFinalSubmit = async () => {
    if (!selectedSiniestroId) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create the procedure in Supabase
      const result = await claimsService.createFullTramite({
        siniestro_id: selectedSiniestroId,
        tipo,
        facturas: invoices,
        files: files
      });

      // Processed successfully by the backend (includes file uploads)
      console.log("¡Éxito! Trámite creado y documentos subidos:", result);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error(error);
      alert('Error crítico al procesar el trámite en Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* 🚀 Top Header (Fixed Logic Indicator) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-medical-cyan text-[10px] font-black uppercase tracking-widest transition-colors w-fit group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Regresar al Dashboard
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-medical-cyan/10 border border-medical-cyan/20 text-medical-cyan text-[10px] font-black uppercase tracking-widest rounded-md">
                Módulo de Reclamaciones
              </span>
              <span className="text-white/20 text-[10px] uppercase font-black tracking-widest">•</span>
              <span className="text-emerald-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                 <ShieldCheck size={12} /> Supabase SSOT v2.1
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
              Nuevo <span className="text-medical-cyan text-glow-cyan font-black">Expediente Digital</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-lg font-medium">
              Completa los pasos para generar la auditoría automatizada en el motor de n8n.
            </p>
          </div>
        </div>

        {/* Selected Siniestro Dropdown (Global Context) */}
        <div className="w-full md:w-80 group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-medical-cyan transition-colors">
            Siniestro / Evento Asociado
          </label>
          <div className="relative">
            <select
              value={selectedSiniestroId}
              onChange={(e) => setSelectedSiniestroId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-medical-cyan focus:ring-4 focus:ring-medical-cyan/5 transition-all appearance-none font-bold"
            >
              <option value="">-- SELECCIONAR --</option>
              {siniestros.map(s => (
                <option key={s.id} value={s.id}>
                  {s.numero_siniestro} • {s.nombre_siniestro}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
               <Search size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Central Stepper Container */}
      <div className="max-w-4xl mx-auto">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      {/* 🧩 Step Content */}
      <main className="bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/80 p-8 md:p-12 shadow-sm min-h-[500px] relative overflow-hidden backdrop-blur-sm">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-[0.02] z-0" />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StepTipo 
                  value={tipo} 
                  onChange={setTipo} 
                  onNext={() => setStep(2)} 
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <FacturasTable 
                  invoices={invoices} 
                  onChange={setInvoices} 
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <UploadDocs 
                  files={files} 
                  setFiles={setFiles} 
                  onBack={() => setStep(2)}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ⚠️ Warning if no Siniestro is selected */}
        {!selectedSiniestroId && (
          <div className="mt-12 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                <Info size={20} />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Debes seleccionar un <span className="text-indigo-500">Siniestro</span> en la parte superior para habilitar el envío oficial.
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* Branding / Footer Footer */}
      <div className="flex justify-center flex-col items-center gap-4 py-10 opacity-30">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-slate-800" />
            <Sparkles className="text-medical-cyan" size={16} />
            <div className="h-[1px] w-12 bg-slate-800" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
            Powered by n8n Advanced Audit Engine
          </p>
      </div>
    </div>
  );
}
