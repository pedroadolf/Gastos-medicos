'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload } from 'lucide-react';

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
    sublimit: number;
    deductibleStatus?: string;
    coaseguroPagado?: number;
    coaseguroLimit?: number;
    lastUpdate?: string;
    status: string;
    observations?: string;
  };
  index: number;
  onPhotoUpload: (patientName: string, file: File) => void;
}

export function EventMonitorCard({ event, index, onPhotoUpload }: EventMonitorCardProps) {
  const sinPct = Math.min((event.consumed / event.sublimit) * 100, 100);
  const coaPct = event.coaseguroPagado !== undefined && event.coaseguroLimit ? Math.min((event.coaseguroPagado / event.coaseguroLimit) * 100, 100) : 0;
  
  const initials = event.patientName.substring(0, 1) + 
                   (event.patientName.includes('Sebastian') ? 'S' : 
                    event.patientName.includes('Claudia') ? 'C' : 'G');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="gmm-card-premium p-6 flex flex-col h-full relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
    >
      {/* Patient Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative group/photo">
           <div className="w-10 h-10 rounded-full bg-gmm-bg flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm shrink-0 overflow-hidden">
             {event.patientPhoto ? (
               <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover" />
             ) : (
                 <span className="text-xs font-black text-gmm-text uppercase">{initials}</span>
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
             className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-full"
           >
             <Upload size={12} className="text-white" />
           </button>
        </div>
        <div className="min-w-0">
           <h3 className="text-[13px] font-black text-gmm-text truncate uppercase tracking-tight leading-tight">{event.patientName}</h3>
           <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-wider">{event.role} - {event.age} años</p>
        </div>
      </div>

      {/* Diagnosis Pill */}
      <div className="mb-5">
        <div className="inline-flex px-3 py-1.5 rounded-full bg-gmm-accent/10 border border-gmm-accent/20 items-center">
           <span className="text-[10px] font-black text-gmm-accent uppercase tracking-wider">
             {event.diagnosis} {event.chronic && <span className="text-gmm-text-muted">· Crónico</span>}
           </span>
        </div>
      </div>

      {/* Numerical Data Monitor */}
      <div className="space-y-4 mb-5 flex-1">
         {/* Siniestro Progress */}
         <div>
           <div className="flex justify-between items-end mb-1">
              <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Siniestro Acum.</p>
              <p className="text-[13px] font-black text-gmm-text tracking-tighter">
                ${event.consumed.toLocaleString()} <span className="text-[9px] text-gmm-text-muted font-bold">/ ${(event.sublimit / 1000000).toFixed(0)}M</span>
              </p>
           </div>
           <div className="h-[6px] w-full bg-gmm-text/5 rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${sinPct}%` }}
                 transition={{ duration: 1, ease: 'easeOut' }}
                 className="h-full rounded-full bg-gmm-accent" 
              />
           </div>
         </div>

         {/* Coaseguro Progress */}
         {event.coaseguroPagado !== undefined && event.coaseguroLimit && (
           <div>
             <div className="flex justify-between items-end mb-1">
                <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">Coaseguro Pagado</p>
                <p className="text-[13px] font-black text-gmm-text tracking-tighter">
                  ${event.coaseguroPagado.toLocaleString()} <span className="text-[9px] text-gmm-text-muted font-bold">/ ${event.coaseguroLimit.toLocaleString()}</span>
                </p>
             </div>
             <div className="h-[6px] w-full bg-gmm-text/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   whileInView={{ width: `${coaPct}%` }}
                   transition={{ duration: 1, ease: 'easeOut' }}
                   className="h-full rounded-full bg-gmm-warning" 
                />
             </div>
           </div>
         )}
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-4">
        <div>
           <span className="text-[8px] font-bold text-gmm-text-muted uppercase tracking-widest block mb-0.5">No. Siniestro</span>
           <span className="text-[11px] font-black text-gmm-text">{event.claimId}</span>
        </div>
        <div>
           <span className="text-[8px] font-bold text-gmm-text-muted uppercase tracking-widest block mb-0.5">Deducible</span>
           <span className="text-[11px] font-black text-gmm-text">{event.deductibleStatus || '-'}</span>
        </div>
        <div className="col-span-2">
           <span className="text-[8px] font-bold text-gmm-text-muted uppercase tracking-widest block mb-0.5">Último trámite</span>
           <span className="text-[11px] font-black text-gmm-text">{event.lastUpdate || '-'}</span>
        </div>
      </div>

      {/* Observations Box if exists */}
      {event.observations && (
        <div className="mt-auto mb-4 bg-[#EDF7ED] dark:bg-green-900/20 border border-[#C2E0C6] dark:border-green-800/30 p-3 rounded-lg shadow-sm">
           <span className="text-[8px] font-black text-green-800 dark:text-green-400 uppercase tracking-widest block mb-1">Observaciones</span>
           <p className="text-[10px] font-medium text-green-900 dark:text-green-200 leading-snug whitespace-pre-wrap">
             {event.observations}
           </p>
        </div>
      )}

      {/* Action Button */}
      <Link href={`/tramites?id=${event.claimId}`} className="w-full mt-auto py-3 rounded-xl border border-gmm-text/10 text-gmm-text text-[9px] font-black uppercase tracking-widest hover:bg-gmm-text hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
        Ver detalle
        <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↗</motion.span>
      </Link>
    </motion.div>
  );
}
