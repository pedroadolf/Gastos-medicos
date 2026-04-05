// apps/web/src/components/tramites/MobileTramiteList.tsx
'use client';

import { 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DUMMY_TRAMITES = [
  {
    id: '1',
    folio: 'TR-2024-00452',
    type: 'Reembolso',
    status: 'completed',
    asegurado: 'Juan Pérez García',
    poliza: 'GMM-987234',
    monto: 12500.50,
    fecha: new Date('2024-04-01T10:00:00'),
  },
  {
    id: '2',
    folio: 'TR-2024-00451',
    type: 'Carta Pase',
    status: 'processing',
    asegurado: 'María Rodríguez Solo',
    poliza: 'GMM-123456',
    monto: 45000.00,
    fecha: new Date('2024-04-03T14:30:00'),
    progress: 75
  },
  {
    id: '3',
    folio: 'TR-2024-00450',
    type: 'Reembolso',
    status: 'rejected',
    asegurado: 'Roberto Sánchez',
    poliza: 'GMM-554433',
    monto: 3200.00,
    fecha: new Date('2024-04-04T09:15:00'),
  }
];

export function MobileTramiteList() {
  return (
    <div className="space-y-3">
      {DUMMY_TRAMITES.map((tramite) => (
        <div 
          key={tramite.id} 
          className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all active:scale-[0.98] active:bg-slate-800/40"
        >
          {/* Status Icon */}
          <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${getStatusIconColor(tramite.status)}`}>
            {getStatusIcon(tramite.status)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-slate-100 uppercase tracking-tight truncate">
                {tramite.folio}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 ml-2 shrink-0">
                {tramite.type}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-300 truncate font-medium">
                {tramite.asegurado}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-500">
                  {format(tramite.fecha, 'dd MMM, HH:mm', { locale: es })}
                </span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  ${tramite.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          
          <ChevronRight size={16} className="text-slate-600" />
        </div>
      ))}
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle2 size={18} />;
    case 'processing': return <Clock size={18} className="animate-spin-slow" />;
    case 'document_pending': return <Clock3 size={18} />;
    default: return <AlertCircle size={18} />;
  }
}

function getStatusIconColor(status: string) {
  switch (status) {
    case 'completed': return 'text-medical-emerald';
    case 'processing': return 'text-medical-cyan shadow-lg shadow-medical-cyan/20';
    case 'document_pending': return 'text-medical-amber';
    default: return 'text-medical-red';
  }
}
