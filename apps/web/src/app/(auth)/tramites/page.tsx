'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Clock, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const TIPO_LABELS = {
  reembolso: 'Reembolso de Gastos Médicos',
  programacion: 'Programación de Cirugía',
  carta_pase: 'Carta Pase / Autorización'
};

function TramiteNode({ tramite, index }: { tramite: any; index: number }) {
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
      
      {/* Tarjeta del Trámite */}
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
                  {tramite.tipo_tramite_label}
                </h4>
                <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-widest mt-1">
                  Asegurado: <span className="text-gmm-text font-black">{tramite.asegurado}</span>
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gmm-bg rounded-xl transition-colors">
              <ArrowUpRight size={18} className="text-gmm-text-muted group-hover:text-gmm-accent transition-colors" />
            </button>
          </div>

          {/* Contexto Médico */}
          <div className="mb-6 bg-gmm-bg/20 border border-gmm-border/10 rounded-2xl p-4">
            <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-wider mb-1">Contexto Médico</p>
            <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight italic mb-1">
              Siniestro: {tramite.num_siniestro}
            </p>
            <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-wide">
              {tramite.padecimiento}
            </p>
          </div>

          <div className="bg-gmm-bg/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-wider mb-1">Monto Solicitado</p>
                <p className="text-xs font-black text-gmm-text tracking-tighter">
                  ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(tramite.total)} MXN
                </p>
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
          {tramite.dbStatus === 'pending' || tramite.dbStatus === 'borrador' || tramite.dbStatus === 'en_revision'
            ? "Validando facturas y relación médica en el centro de diagnóstico."
            : tramite.dbStatus === 'audited'
            ? "Auditoría completada exitosamente. Pre-autorizado para liquidación."
            : tramite.dbStatus === 'processing' || tramite.dbStatus === 'procesando' || tramite.dbStatus === 'completed'
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/tramites')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((t: any) => {
            const numSiniestro = t.siniestros?.numero_siniestro || t.num_siniestro_ref || 'Sin Siniestro';
            const padecimiento = t.siniestros?.nombre_siniestro || 'Sin Diagnóstico';
            const total = (t.facturas || []).reduce((acc: number, f: any) => acc + Number(f.importe || 0), 0);
            
            let statusKey = 'EN_TRAMITE';
            if (['pending', 'borrador', 'en_revision'].includes(t.status)) {
              statusKey = 'EN_TRAMITE';
            } else if (t.status === 'audited') {
              statusKey = 'PRE_AUTORIZADO';
            } else if (['processing', 'procesando', 'completed'].includes(t.status)) {
              statusKey = 'EN_PAGO';
            } else if (['error', 'rechazado'].includes(t.status)) {
              statusKey = 'RECHAZADO';
            }

            const tipoKey = t.tipo as keyof typeof TIPO_LABELS;
            const tipoLabel = TIPO_LABELS[tipoKey] || t.tipo || 'Trámite';

            return {
              id: t.id,
              tipo: t.tipo,
              tipo_tramite_label: tipoLabel,
              asegurado: t.paciente_nombre || 'Asegurado',
              num_siniestro: numSiniestro,
              padecimiento: padecimiento,
              total: total,
              status: statusKey,
              fecha: t.created_at,
              dbStatus: t.status
            };
          });

          setTramites(mapped.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        }
      })
      .catch(err => console.error("❌ Error loading tramites:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTramites = tramites.filter((t: any) => {
    const term = searchTerm.toLowerCase();
    return (
      t.asegurado.toLowerCase().includes(term) ||
      t.num_siniestro.toLowerCase().includes(term) ||
      t.padecimiento.toLowerCase().includes(term) ||
      t.tipo_tramite_label.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  });

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white/50 border border-white/80 rounded-full text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-gmm-accent outline-none w-64 shadow-sm"
            />
          </div>
          <button className="p-4 bg-white/50 border border-white/80 rounded-full text-gmm-text-muted hover:text-gmm-accent transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-gmm-text/20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando Hitos...</p>
          </div>
        ) : filteredTramites.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white/20 border border-dashed border-white/40 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-gmm-bg flex items-center justify-center text-gmm-text/30">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gmm-text uppercase tracking-wider mb-2 italic">Sin Trámites en Historial</h3>
              <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-widest leading-relaxed">
                No se encontraron trámites en el historial. Comienza creando un nuevo trámite médico.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredTramites.map((t: any, i: number) => (
              <TramiteNode key={t.id} tramite={t} index={i} />
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
