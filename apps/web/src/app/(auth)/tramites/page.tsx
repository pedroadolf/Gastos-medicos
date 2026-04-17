'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, ChevronRight, 
  CheckCircle2, Clock, AlertCircle, MoreHorizontal, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

function TramiteNode({ tramite, index }: any) {
  const isEven = index % 2 === 0;
  
  const statusConfig = {
    'EN_TRAMITE': { color: 'bg-gmm-accent', icon: Clock, label: 'En Proceso' },
    'EN_PAGO': { color: 'bg-gmm-success', icon: CheckCircle2, label: 'En Pago' },
    'RECHAZADO': { color: 'bg-gmm-danger', icon: AlertCircle, label: 'Rechazado' },
    'PRE_AUTORIZADO': { color: 'bg-amber-400', icon: CheckCircle2, label: 'Pre-Autorizado' }
  };

  const status = statusConfig[tramite.status as keyof typeof statusConfig] || statusConfig['EN_TRAMITE'];

  return (
    <div className={`relative flex items-center justify-center gap-12 mb-20 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Targeta del Trámite */}
      <motion.div 
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="w-full md:w-[45%] group"
      >
        <div className="gmm-pill-card relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${status.color}/20 flex items-center justify-center`}>
                <FileText className={status.color.replace('bg-', 'text-')} size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gmm-text uppercase tracking-tight leading-tight italic">
                  {tramite.nombre}
                </h4>
                <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-widest mt-1">
                  ID: {tramite.id} · {tramite.asegurado}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gmm-bg rounded-xl transition-colors">
              <ArrowUpRight size={18} className="text-gmm-text-muted group-hover:text-gmm-accent transition-colors" />
            </button>
          </div>

          <div className="bg-gmm-bg/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-wider mb-1">Monto Solicitado</p>
                <p className="text-xs font-black text-gmm-text tracking-tighter">${(tramite.total / 1000).toFixed(1)}k MXN</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-wider mb-1">Estatus actual</p>
                <span className={`text-[10px] font-black uppercase italic ${status.color.replace('bg-', 'text-')}`}>
                  {status.label}
                </span>
              </div>
          </div>
        </div>
      </motion.div>

      {/* Nodo Central */}
      <div className="hidden md:flex w-14 h-14 bg-white border-[10px] border-gmm-bg rounded-full z-10 items-center justify-center shadow-lg">
        <div className={`w-3 h-3 rounded-full ${status.color} shadow-lg ${status.color.replace('bg-', 'shadow-')}/40`} />
      </div>

      {/* Info Flotante del Hito */}
      <div className={`hidden md:block w-[45%] ${isEven ? 'text-left' : 'text-right'}`}>
        <p className="text-[11px] font-black text-gmm-text/30 uppercase tracking-[0.4em] mb-2">
          {new Date(tramite.fecha).toLocaleDateString('es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-[11px] font-medium text-gmm-text/50 uppercase tracking-widest leading-relaxed max-w-sm">
          {tramite.status === 'EN_TRAMITE' 
            ? "Validando facturas y relación médica en el centro de diagnóstico."
            : tramite.status === 'EN_PAGO'
            ? "Transferencia enviada. Fondos disponibles en 24-48 horas hábiles."
            : "Incidencia detectada en la póliza. Ver comentarios del auditor."
          }
        </p>
      </div>
    </div>
  );
}

export default function MisTramitesPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/estado-cuenta')
      .then(r => r.json())
      .then(data => {
        // Flatten kanban items for timeline view
        const all = [
          ...(data.kanban?.en_tramite || []),
          ...(data.kanban?.pre_autorizados || []),
          ...(data.kanban?.en_pago || []),
          ...(data.kanban?.rechazados || [])
        ];
        setTramites(all.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
        <div>
          <h2 className="text-[32px] font-black tracking-tighter text-gmm-text uppercase italic leading-none">
            Historial de Trámites
          </h2>
          <p className="text-[11px] font-bold text-gmm-text/40 uppercase tracking-widest mt-3">
            Explora la evolución cronológica de tus procesos médicos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gmm-text/20 group-focus-within:text-gmm-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar trámite..."
              className="pl-12 pr-6 py-4 bg-white/50 border border-white/80 rounded-full text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-gmm-accent outline-none w-64 shadow-sm"
            />
          </div>
          <button className="p-4 bg-white/50 border border-white/80 rounded-full text-gmm-text-muted hover:text-gmm-accent transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* The Timeline Backbone is provided by the global layout */}
        
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-gmm-text/20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Hitos...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {tramites.map((t: any, i: number) => (
              <TramiteNode key={i} tramite={{...t, icon: FileText, asegurado: 'Claudia Soto', total: 45000}} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Final del Timeline */}
      <div className="flex justify-center mt-20 mb-10">
        <div className="bg-white px-8 py-3 rounded-full border border-gmm-border shadow-md text-[10px] font-black uppercase tracking-[0.4em] text-gmm-text/20 italic">
          Inicio del historial médico
        </div>
      </div>
    </div>
  );
}
