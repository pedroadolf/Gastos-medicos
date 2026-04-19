'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload } from 'lucide-react';

interface EventMonitorCardProps {
  event: {
    claimId: string;
    diagnosis: string;
    patientName: string;
    patientPhoto?: string;
    role: string;
    age: string;
    consumed: number;
    sublimit: number;
    status: string;
    openClaims?: number;
  };
  index: number;
  onPhotoUpload: (patientName: string, file: File) => void;
}

export function EventMonitorCard({ event, index, onPhotoUpload }: EventMonitorCardProps) {
  const pct = Math.min((event.consumed / event.sublimit) * 100, 100);
  const statusColor = event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger' : 
                      pct > 80 ? 'bg-gmm-danger' : 
                      pct > 50 ? 'bg-gmm-accent' : 'bg-green-500';
  
  const initials = event.patientName.substring(0, 1) + (event.patientName === 'Sebastian' ? 'S' : event.patientName === 'Claudia' ? 'C' : 'G');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="gmm-card-premium p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
    >
      {/* Patient Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative group/photo">
          <div className="w-12 h-12 rounded-full bg-gmm-bg flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm shrink-0 overflow-hidden">
            {event.patientPhoto ? (
              <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover" />
            ) : (
                <span className="text-xs font-black text-gmm-text uppercase">{initials}</span>
            )}
          </div>
          {/* Photo Upload Overlay */}
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
            <Upload size={14} className="text-white" />
          </button>
        </div>
        <div className="min-w-0">
           <h3 className="text-sm font-black text-gmm-text truncate uppercase tracking-tight">{event.patientName}</h3>
           <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest">{event.role} · {event.age} años</p>
        </div>
      </div>

      {/* Diagnosis Pill */}
      <div className="mb-6">
        <div className={`inline-flex px-4 py-1 rounded-lg ${event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger/10 text-gmm-danger' : 'bg-gmm-accent/10 text-gmm-accent'} border border-current/20 mb-2`}>
           <span className="text-[10px] font-black uppercase tracking-tight">#{event.claimId.split('-')[0]}</span>
        </div>
        <h4 className="text-[11px] font-black text-gmm-text uppercase tracking-tight leading-tight">
          {event.diagnosis.replace(/\([^)]*\)/, '').trim()}
        </h4>
      </div>

      {/* Numerical Data Monitor */}
      <div className="space-y-4 mb-6">
         <div className="flex justify-between items-end">
            <div>
               <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">Consumo Siniestro</p>
               <p className="text-xl font-black text-gmm-text italic tracking-tighter">${(event.consumed / 1000).toLocaleString()}k <span className="text-[10px] text-gmm-text-muted">/ ${(event.sublimit / 1000000).toFixed(0)}M</span></p>
            </div>
            <div className="text-right">
               <span className={`text-[10px] font-black ${pct > 80 ? 'text-gmm-danger' : 'text-gmm-text'}`}>{pct.toFixed(1)}%</span>
            </div>
         </div>
         <div className="h-1.5 w-full bg-gmm-text/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: `${pct}%` }}
               transition={{ duration: 1, ease: 'easeOut' }}
               className={`h-full rounded-full ${statusColor}`} 
            />
         </div>
      </div>

      {/* Footer Status */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gmm-text/5">
        <div>
           <span className="text-[7px] font-bold text-gmm-text-muted uppercase tracking-widest block mb-1">Estatus</span>
           <span className={`text-[10px] font-black ${event.status === 'OPERATIVO' ? 'text-gmm-success' : 'text-gmm-yellow'}`}>{event.status}</span>
        </div>
        <div className="text-right">
           <span className="text-[7px] font-bold text-gmm-text-muted uppercase tracking-widest block mb-1">Coaseguro</span>
           <span className="text-[10px] font-black text-gmm-text">10%</span>
        </div>
      </div>

      <Link href={`/tramites?id=${event.claimId}`} className="w-full mt-6 py-3 rounded-2xl border border-gmm-text/10 text-gmm-text text-[9px] font-black uppercase tracking-widest hover:bg-gmm-text hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
        Ver Gestión Clínica
        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
      </Link>
    </motion.div>

  );
}
