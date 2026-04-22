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
      className="gmm-box group"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* AVATAR Y NOMBRE */}
        <div className="flex items-center gap-6 w-full lg:w-1/3">
          <div className="relative group/photo shrink-0">
             <div className="h-20 w-20 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-white/10 shadow-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-500 group-hover/photo:scale-110">
               {event.patientPhoto ? (
                 <img src={event.patientPhoto} alt={event.patientName} className="h-full w-full object-cover" />
               ) : (
                 <span className="text-2xl font-black text-gray-900 dark:text-white uppercase">{initials}</span>
               )}
             </div>
             <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-[#1C1C1E]"></div>
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
               className="absolute top-0 right-0 bg-zinc-900 text-white p-1.5 rounded-full opacity-0 group-hover/photo:opacity-100 transition-all shadow-lg border border-white/20"
             >
               <Upload size={10} />
             </button>
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
               {event.patientName}
            </h3>
            <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase mt-1">
              {event.chronic ? 'CRÓNICO • ' : ''}ACTIVO
            </p>
          </div>
        </div>

        {/* MÉTRICAS (Con fondo interno para separar más) */}
        <div className="flex gap-12 bg-gray-50 dark:bg-white/[0.03] px-10 py-6 rounded-[30px] border border-gray-100 dark:border-white/[0.02]">
          <div className="text-center">
            <span className="block text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Disponible</span>
            <span className={`text-xl font-bold ${availableColor}`}>${available.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">A tu cargo</span>
            <span className="text-xl font-bold text-red-500">${(event.coaseguroPagado || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* ACCIÓN (Botón con sombra propia naranja) */}
        <div className="flex items-center gap-4">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-5 rounded-[20px] shadow-[0_10px_20px_rgba(249,115,22,0.3)] transition-all uppercase text-[10px] tracking-widest flex items-center gap-2 group/btn">
            Ver Detalle
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
