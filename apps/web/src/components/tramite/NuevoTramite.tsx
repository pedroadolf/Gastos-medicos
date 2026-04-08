'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Info, ShieldCheck, Sparkles, AlertCircle, ChevronLeft, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
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
  { id: 1, label: 'Asociar', signal: 'VINCULACIÓN' },
  { id: 2, label: 'Propósito', signal: 'CONFIGURACIÓN' },
  { id: 3, label: 'Detalle', signal: 'FINANZAS' },
  { id: 4, label: 'Archivos', signal: 'DOCUMENTACIÓN' },
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
      // Mock result or actual service call
      const result = await claimsService.createFullTramite({
        siniestro_id: selectedSiniestroId,
        nombre_siniestro: siniestros.find(s => s.id === selectedSiniestroId)?.nombre_siniestro,
        tipo,
        facturas: invoices,
        files: files
      });

      console.log("¡Éxito! Trámite creado:", result);
      
      // Visual feedback before redirect
      setStep(5); // Success step
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error(error);
      alert('Error crítico al procesar el trámite en Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSiniestro = siniestros.find(s => s.id === selectedSiniestroId);

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* 🚀 Header */}
      <div className={cn(
        "p-8 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-700",
        step === 5 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-950/40 border-white/5"
      )}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-medical-cyan/5 blur-[80px] -mr-32 -mt-32" />
        
        <div className="flex flex-col space-y-4 relative z-10">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-medical-cyan text-[10px] font-black uppercase tracking-widest transition-colors w-fit group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Regresar al Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-medical-cyan/10 border border-medical-cyan/20 text-medical-cyan text-[10px] font-black uppercase tracking-widest rounded-md">
                   SISTEMA DE GESTIÓN GMM v3.5
                </span>
                <span className="text-white/20 text-xs">•</span>
                <span className={cn(
                  "text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 px-2 py-0.5 rounded-md border transition-all",
                  selectedSiniestroId ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                )}>
                   {selectedSiniestroId ? <ShieldCheck size={12} strokeWidth={3} /> : <AlertCircle size={12} />}
                   {selectedSiniestroId ? 'SINIESTRO VINCULADO' : 'PENDIENTE DE VINCULAR'}
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
                {step === 5 ? '¡Trámite ' : 'Nuevo '}
                <span className={cn(
                  "font-black text-glow-cyan",
                  step === 5 ? "text-emerald-500" : "text-medical-cyan"
                )}>
                  {step === 5 ? 'Completado!' : 'Trámite Digital'}
                </span>
              </h1>
            </div>

            {selectedSiniestroId && step < 5 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900/60 px-6 py-4 rounded-3xl border border-medical-cyan/20 backdrop-blur-xl shadow-xl shadow-medical-cyan/5"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cargando datos para:</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-medical-cyan/10 flex items-center justify-center text-medical-cyan border border-medical-cyan/10">
                      <ShieldCheck size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-black text-white">{currentSiniestro?.numero_siniestro || 'SIN-000'}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[200px]">
                        {currentSiniestro?.nombre_siniestro}
                      </p>
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 🧭 Stepper */}
      {step < 5 && (
        <div className="max-w-4xl mx-auto">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      )}

      {/* 🧩 Container */}
      <main className={cn(
        "rounded-[3rem] border p-8 md:p-12 shadow-2xl min-h-[550px] relative overflow-hidden backdrop-blur-sm transition-all duration-1000",
        step === 5 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-900/40 border-slate-800/80"
      )}>
        <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-[0.02] z-0" />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                   <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-slate-950 border border-slate-800 text-medical-cyan font-black text-3xl mb-2 shadow-inner">1</div>
                   <h2 className="text-3xl font-black text-white tracking-tight">Vincular <span className="text-medical-cyan text-glow-cyan italic">Expediente</span></h2>
                   <p className="text-slate-500 text-sm max-w-md mx-auto font-medium leading-relaxed">
                     Selecciona el siniestro o padecimiento del asegurado para comenzar. Esto activará los flujos inteligentes de validación.
                   </p>
                </div>

                <div className="max-w-lg mx-auto space-y-8">
                  <div className="space-y-4">
                    <label className={cn(
                      "text-[10px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-2",
                      selectedSiniestroId ? "text-emerald-500" : "text-slate-500"
                    )}>
                      {selectedSiniestroId ? <Check size={14} strokeWidth={4} /> : <Search size={14} />}
                      Seleccionar Siniestro / Padecimiento Activo
                    </label>
                    <div className="relative group">
                       <select
                         disabled={isLoading}
                         value={selectedSiniestroId}
                         onChange={(e) => setSelectedSiniestroId(e.target.value)}
                         className={cn(
                           "w-full bg-slate-950 border rounded-[2rem] px-8 py-6 text-sm text-white outline-none transition-all appearance-none font-black cursor-pointer shadow-inner",
                           selectedSiniestroId 
                             ? "border-emerald-500/50 ring-8 ring-emerald-500/5 text-emerald-50" 
                             : "border-slate-800 focus:border-medical-cyan focus:ring-8 focus:ring-medical-cyan/5"
                         )}
                       >
                         {isLoading ? (
                           <option>Cargando padecimientos...</option>
                         ) : (
                           <>
                             <option value="">-- SELECCIONAR PADECIMIENTO / SINIESTRO --</option>
                             {siniestros && siniestros.length > 0 ? (
                               siniestros.map(s => (
                                 <option key={s.id} value={s.id}>
                                   {s.numero_siniestro || 'S/N'} • {s.nombre_siniestro?.toUpperCase() || 'TRÁMITE GENERAL'}
                                 </option>
                               ))
                             ) : (
                               <option value="" disabled>No se encontraron siniestros activos</option>
                             )}
                           </>
                         )}
                       </select>
                       <div className={cn(
                          "absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300",
                          selectedSiniestroId ? "text-emerald-500 scale-110" : "text-slate-600"
                       )}>
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={22} />}
                       </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedSiniestroId}
                      className={cn(
                        "w-full py-6 rounded-3xl font-black text-xs transition-all flex items-center justify-center gap-4 shadow-2xl uppercase tracking-[0.1em]",
                        !selectedSiniestroId 
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-50 italic" 
                          : "bg-medical-cyan text-slate-950 hover:bg-white hover:scale-[1.03] active:scale-95 group shadow-medical-cyan/30"
                      )}
                    >
                      CONTINUAR AL PROPÓSITO <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    {siniestros.length === 0 && !isLoading && (
                        <p className="text-[10px] text-amber-500 font-bold text-center mt-4 flex items-center justify-center gap-2">
                            <AlertCircle size={12} /> Solicita a soporte la precarga de tus padecimientos.
                        </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-8"
              >
                <div className="w-32 h-32 rounded-[3.5rem] bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                    >
                        <Check size={56} strokeWidth={4} />
                    </motion.div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter">¡TRÁMITE ENVIADO!</h2>
                    <p className="text-slate-500 text-lg font-bold">
                        Tu solicitud ha sido ingresada a la cola de procesamiento de <span className="text-medical-cyan">n8n Engine</span>.
                    </p>
                </div>
                <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 inline-block px-10">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Folio de Seguimiento</p>
                    <p className="text-2xl font-mono text-medical-cyan font-black">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
                <p className="text-xs text-slate-600 font-black animate-pulse uppercase tracking-widest mt-10">Redirigiendo al panel central...</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 flex items-center justify-center font-black">2</div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Seleccionar Propósito</h2>
                </div>
                <StepTipo 
                  value={tipo} 
                  onChange={setTipo} 
                  onNext={() => setStep(3)} 
                />
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Volver al paso 1
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-10 h-10 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 flex items-center justify-center font-black">3</div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Detalle Económico</h2>
                </div>
                <FacturasTable 
                  invoices={invoices} 
                  onChange={setInvoices} 
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 flex items-center justify-center font-black">4</div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cargar Documentos</h2>
                   </div>
                   {Object.keys(files).length > 0 && (
                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center gap-2 animate-in fade-in zoom-in">
                         <Check size={14} strokeWidth={3} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{Object.keys(files).length} Archivos Listos</span>
                      </div>
                   )}
                </div>
                <UploadDocs 
                  files={files} 
                  setFiles={setFiles} 
                  onBack={() => setStep(3)}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Footer Branding */}
      <div className="flex justify-center flex-col items-center gap-4 py-10 opacity-30">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-slate-800" />
            <Sparkles className="text-medical-cyan" size={16} />
            <div className="h-[1px] w-12 bg-slate-800" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
            Audit Engine v4.0 • Secured by Supabase
          </p>
      </div>
    </div>
  );
}
