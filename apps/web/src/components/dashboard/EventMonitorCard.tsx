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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      viewport={{ once: true }}
      className="gmm-box p-6 mb-8 group"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* AVATAR Y NOMBRE */}
        <div className="flex items-center gap-5 w-full lg:w-1/4">
          <div className="relative group/photo shrink-0">
             <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-slate-50 dark:ring-zinc-800 shadow-inner bg-gray-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-500 group-hover/photo:scale-110">
               {event.patientPhoto ? (
                 <img src={event.patientPhoto} alt={event.patientName} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-xl font-black text-gray-900 dark:text-white uppercase">{initials}</span>
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
               className="absolute -bottom-1 -right-1 bg-zinc-900 text-white p-1.5 rounded-full opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg border border-white/20"
             >
               <Upload size={12} />
             </button>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight uppercase truncate">
               {event.patientName}
            </h3>
            <div className="flex gap-2 mt-1">
              {event.chronic && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 uppercase tracking-widest">
                  CRÓNICO
                </span>
              )}
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 uppercase tracking-widest">
                ACTIVO
              </span>
            </div>
          </div>
        </div>

        {/* MÉTRICAS (Con separadores visuales) */}
        <div className="flex-1 w-full grid grid-cols-3 gap-4 lg:px-8 py-2 lg:border-x border-slate-100 dark:border-zinc-800">
          <div className="text-center lg:text-left">
            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-500 tracking-wider mb-1">Disponible</p>
            <p className={`text-xl font-bold ${availableColor}`}>${available.toLocaleString()}</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-500 tracking-wider mb-1">A tu cargo</p>
            <p className="text-xl font-bold text-red-500">${(event.coaseguroPagado || 0).toLocaleString()}</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-500 tracking-wider mb-1">Coaseguro</p>
            <p className="text-xl font-bold text-orange-400">{coaPct.toFixed(1)}%</p>
          </div>
        </div>

        {/* ACCIONES Y PROGRESO */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
           <div className="space-y-1.5">
             <div className="flex justify-between items-end">
                <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase">Progreso Global</p>
                <p className="text-[9px] font-bold text-slate-500">${sublimit.toLocaleString()}</p>
             </div>
             <div className="h-2.5 w-full bg-slate-50 dark:bg-zinc-800/50 rounded-full overflow-hidden flex p-[1.5px] border border-slate-100 dark:border-zinc-800">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${consumedPct}%` }} viewport={{once: true}} className="h-full bg-red-500 rounded-l-full" />
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${pendingPct}%` }} viewport={{once: true}} className="h-full bg-amber-400" />
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${availablePct}%` }} viewport={{once: true}} className="h-full bg-green-500 rounded-r-full" />
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group/btn">
               Detalle
               <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
             </button>
             <button className="p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
               <History size={18} />
             </button>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
