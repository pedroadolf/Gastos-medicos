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
      className="gmm-box p-4 transition-all duration-300 group flex flex-col lg:flex-row items-center gap-6"
    >
      {/* Identity (Left) */}
      <div className="flex items-center gap-4 w-full lg:w-[280px] shrink-0">
        <div className="relative group/photo">
           <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] flex items-center justify-center border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-transform duration-500 group-hover/photo:scale-105">
             {event.patientPhoto ? (
               <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover" />
             ) : (
               <span className="text-base font-black text-gmm-text uppercase">{initials}</span>
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
             className="absolute -bottom-1 -right-1 bg-gmm-text text-white p-1 rounded-lg opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg"
           >
             <Upload size={10} />
           </button>
        </div>
        <div>
          <h3 className="text-[13px] font-black text-gmm-text uppercase tracking-tight leading-none mb-1">{event.patientName}</h3>
          <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-wider mb-1.5">{event.diagnosis}</p>
          <div className="flex gap-1.5">
            {event.chronic && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">
                Crónico
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest border border-green-100">
              Activo
            </span>
          </div>
        </div>
      </div>

      {/* KPI Matrix (Middle) */}
      <div className="flex-1 w-full grid grid-cols-3 gap-4 lg:border-l lg:border-r border-[#E8E8E8] lg:px-6">
        <div>
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-0.5">Disponible</p>
          <p className={`text-sm font-black tracking-tighter ${availableColor}`}>${available.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-0.5">A tu cargo</p>
          <p className="text-sm font-black tracking-tighter text-gmm-danger">${(event.coaseguroPagado || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-0.5">Coaseguro %</p>
          <p className="text-sm font-black tracking-tighter text-amber-500">{coaPct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Progress Bar (Middle Right) */}
      <div className="w-full lg:w-[200px] shrink-0 flex flex-col justify-center">
         <div className="flex justify-between items-end mb-1">
            <p className="text-[8px] font-black text-gmm-text uppercase">Consumo total</p>
            <p className="text-[8px] font-bold text-gmm-text-muted">${sublimit.toLocaleString()}</p>
         </div>
         <div className="h-2 w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-full overflow-hidden flex p-[1px]">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${consumedPct}%` }} viewport={{once: true}} className="h-full bg-gmm-danger rounded-l-full relative group" />
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${pendingPct}%` }} viewport={{once: true}} className="h-full bg-amber-400 relative group" />
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${availablePct}%` }} viewport={{once: true}} className="h-full bg-green-500 rounded-r-full relative group" />
         </div>
         <div className="flex justify-between mt-1">
            <p className="text-[7px] font-bold text-gmm-text-muted uppercase">{consumedPct.toFixed(0)}% Pagado</p>
            <p className="text-[7px] font-bold text-gmm-text-muted uppercase text-right">{availablePct.toFixed(0)}% Disp.</p>
         </div>
      </div>

      {/* Actions (Right) */}
      <div className="w-full lg:w-auto shrink-0 flex items-center justify-end gap-2">
        <button className="p-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-gmm-text-muted hover:text-gmm-text hover:bg-white transition-all">
          <History size={14} />
        </button>
        <button className="py-2.5 px-4 rounded-xl bg-gmm-accent text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 group/btn">
          Detalle
          <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
