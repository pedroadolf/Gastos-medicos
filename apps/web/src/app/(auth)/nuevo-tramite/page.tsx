'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';
import { TYPES } from '@/types/claims';

export default function NuevoTramiteLanding() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-12">
        <h2 className="text-[28px] font-black tracking-tighter text-gmm-text uppercase italic leading-none">
          Nuevo Trámite
        </h2>
        <p className="text-[11px] font-bold text-gmm-text-muted uppercase tracking-widest mt-2">
          Selecciona el tipo de solicitud que deseas iniciar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TYPES.map((type, idx) => (
          <Link href={`/nuevo-tramite/${type.id}`} key={type.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="gmm-box h-full flex flex-col group relative overflow-hidden transition-all hover:border-gmm-accent hover:shadow-xl hover:shadow-gmm-accent/10"
            >
              {/* Decorative background */}
              <div className="absolute -right-10 -top-10 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <type.icon size={160} style={{ color: 'var(--gmm-text)' }} />
              </div>

              <div className="flex items-start gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3 ${type.bg} ${type.color}`}>
                  <type.icon size={28} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
                    {type.label}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed mt-2" style={{ color: 'var(--gmm-text-muted)' }}>
                    {type.description}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-gmm-text-muted group-hover:text-gmm-accent transition-colors flex items-center gap-1">
                  Iniciar Trámite <ChevronRight size={14} />
                </span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Helper Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-6 rounded-[20px] flex items-center gap-6"
        style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-sky-500/10 text-sky-500 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-sky-500 uppercase tracking-widest">Documentación Lista</h4>
          <p className="text-xs font-medium text-gmm-text-muted mt-1">
            Asegúrate de tener tus facturas, recetas, estudios y formatos en PDF o imagen antes de iniciar.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
