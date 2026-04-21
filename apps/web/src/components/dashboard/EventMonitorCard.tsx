'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronRight, Calculator, History, Pill, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EventMonitorCardProps {
  event: {
    claimId: string;
    diagnosis: string;
    chronic?: boolean;
    patientName: string;
    patientPhoto?: string;
    role: string;
    age: string;
    consumed: number;
    pendingAmount?: number;
    sublimit: number;
    deductibleStatus?: string;
    coaseguroPagado?: number;
    coaseguroLimit?: number;
    lastUpdate?: string;
    status: string;
    observations?: string;
    medications?: { name: string; period: string; status: string }[];
  };
  index: number;
  onPhotoUpload: (patientName: string, file: File) => void;
}

type TabType = 'siniestro' | 'pagos' | 'meds';

export function EventMonitorCard({ event, index, onPhotoUpload }: EventMonitorCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('siniestro');
  
  const consumed = event.consumed;
  const pending = event.pendingAmount || 0;
  const available = event.sublimit - consumed - pending;
  const sublimit = event.sublimit;

  const consumedPct = (consumed / sublimit) * 100;
  const pendingPct = (pending / sublimit) * 100;
  const availablePct = (available / sublimit) * 100;

  const coaPct = event.coaseguroPagado !== undefined && event.coaseguroLimit ? Math.min((event.coaseguroPagado / event.coaseguroLimit) * 100, 100) : 0;
  
  const initials = event.patientName.split(' ').map(n => n[0]).join('').substring(0, 2);

  const availableColor = available < sublimit * 0.2 ? 'text-gmm-danger' : 
                         available < sublimit * 0.5 ? 'text-orange-500' : 'text-green-600';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-zinc-900/50 border border-gmm-border/50 rounded-[40px] p-8 shadow-2xl transition-all duration-500 hover:shadow-premium group"
    >
      {/* Header: Identity & Status */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="relative group/photo">
             <div className="w-14 h-14 rounded-2xl bg-gmm-bg flex items-center justify-center border border-gmm-border shadow-sm overflow-hidden transition-transform duration-500 group-hover/photo:scale-105">
               {event.patientPhoto ? (
                 <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-lg font-black text-gmm-text uppercase">{initials}</span>
               )}
             </div>
             <button 
               onClick={() => {
                 const input = document.createElement('input');
                 input.type = 'file';
                 input.accept = 'image/*';
                 input.onchange = (e: any) => {
                   const file = e.target.files?.[0];
                   if (file) onPhotoUpload(event.patientName, file);
                 };
                 input.click();
               }}
               className="absolute -bottom-1 -right-1 bg-gmm-text text-white p-1.5 rounded-lg opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg"
             >
               <Upload size={10} />
             </button>
          </div>
          <div>
            <h3 className="text-lg font-black text-gmm-text uppercase tracking-tight leading-none mb-1">{event.patientName}</h3>
            <p className="text-xs font-bold text-gmm-text-muted uppercase tracking-wider mb-2">{event.diagnosis}</p>
            <div className="flex gap-2">
              {event.chronic && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                  Crónico
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-100 dark:border-green-800/30">
                Activo
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-0.5">Corte</p>
          <p className="text-[11px] font-black text-gmm-text">{event.lastUpdate}</p>
        </div>
      </div>

      {/* KPI Matrix: Quick Access */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gmm-bg/30 p-4 rounded-3xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">Disponible</p>
          <p className={`text-lg font-black tracking-tighter ${availableColor}`}>
            ${available.toLocaleString()}
          </p>
        </div>
        <div className="bg-gmm-bg/30 p-4 rounded-3xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">A tu cargo</p>
          <p className="text-lg font-black tracking-tighter text-gmm-danger">
            ${(event.coaseguroPagado || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gmm-bg/30 p-4 rounded-3xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">Coaseguro %</p>
          <p className="text-lg font-black tracking-tighter text-amber-500">
            {coaPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Intelligent Excess Policy Alert */}
      <div className={`mb-8 p-4 rounded-3xl border transition-all duration-500 flex items-center justify-between group/excess cursor-pointer
        ${available < sublimit * 0.2 
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 text-amber-800 dark:text-amber-300' 
          : 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-800/20 text-green-700 dark:text-green-400 opacity-60 hover:opacity-100'}`}
      >
        <div className="flex items-center gap-3">
          {available < sublimit * 0.2 ? <AlertCircle size={16} className="animate-pulse" /> : <CheckCircle2 size={16} />}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
              {available < sublimit * 0.2 ? 'Próximo a activar excesos' : 'Cobertura base activa'}
            </p>
            <p className="text-[9px] opacity-70 font-bold uppercase">Póliza M172 1011 disponible · $2M</p>
          </div>
        </div>
        <ChevronRight size={14} className="group-hover/excess:translate-x-1 transition-transform" />
      </div>

      {/* Contextual Tabs */}
      <div className="flex gap-2 p-1 bg-gmm-bg rounded-2xl mb-6">
        {(['siniestro', 'pagos', 'meds'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab 
                ? 'bg-white dark:bg-zinc-800 text-gmm-text shadow-sm' 
                : 'text-gmm-text-muted hover:text-gmm-text'}`}
          >
            {tab === 'siniestro' ? 'Siniestro' : tab === 'pagos' ? 'Lo que pagas' : 'Meds'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[140px] mb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'siniestro' && (
            <motion.div
              key="siniestro"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-black text-gmm-text uppercase">Distribución de suma</p>
                  <p className="text-[10px] font-bold text-gmm-text-muted">${sublimit.toLocaleString()}</p>
                </div>
                <div className="h-4 w-full bg-gmm-bg rounded-full overflow-hidden flex p-0.5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${consumedPct}%` }} className="h-full bg-gmm-danger rounded-l-full relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gmm-text text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Pagado</div>
                  </motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pendingPct}%` }} className="h-full bg-amber-400 relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gmm-text text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">En Proceso</div>
                  </motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${availablePct}%` }} className="h-full bg-green-500 rounded-r-full relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gmm-text text-white px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Disponible</div>
                  </motion.div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Pagado Acumulado</p>
                  <p className="text-xs font-black text-gmm-text">-${consumed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Pendiente</p>
                  <p className="text-xs font-black text-amber-600">-${pending.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pagos' && (
            <motion.div
              key="pagos"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-gmm-accent/5 p-4 rounded-2xl border border-gmm-accent/10">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black text-gmm-text uppercase">Tope de Coaseguro</p>
                  <p className="text-[10px] font-bold text-gmm-accent">${event.coaseguroLimit?.toLocaleString()}</p>
                </div>
                <div className="h-[6px] bg-gmm-bg rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${coaPct}%` }} 
                    className="h-full bg-gmm-accent" 
                  />
                </div>
                <p className="mt-2 text-[9px] font-bold text-gmm-text-muted">
                  Faltan ${(event.coaseguroLimit! - event.coaseguroPagado!).toLocaleString()} para dejar de pagar coaseguro.
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Deducible</p>
                <p className="text-xs font-black text-gmm-text">{event.deductibleStatus}</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'meds' && (
            <motion.div
              key="meds"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2"
            >
              {event.medications && event.medications.length > 0 ? (
                event.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gmm-bg/50 border border-gmm-border/30">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-gmm-accent shadow-sm">
                        <Pill size={12} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gmm-text leading-tight">{med.name}</p>
                        <p className="text-[8px] font-bold text-gmm-text-muted uppercase">{med.period}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full 
                      ${med.status === 'Surtido' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {med.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gmm-text-muted text-center py-8 italic font-bold">Sin medicamentos registrados</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3.5 rounded-2xl bg-gmm-accent-tidal text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-gmm-accent-tidal/20 flex items-center justify-center gap-2 group/btn">
          Subir Informe
          <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
        <button className="p-3.5 rounded-2xl border border-gmm-border text-gmm-text-muted hover:text-gmm-text hover:bg-gmm-bg transition-all">
          <History size={16} />
        </button>
        <button className="p-3.5 rounded-2xl border border-gmm-border text-gmm-text-muted hover:text-gmm-text hover:bg-gmm-bg transition-all">
          <Calculator size={16} />
        </button>
      </div>
    </motion.div>
  );
}
