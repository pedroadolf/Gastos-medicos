// apps/web/src/components/tramites/DesktopTable.tsx
'use client';

import { 
  MoreHorizontal, 
  Download, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Clock3
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
    progress: 100
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
    progress: 65
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
    progress: 40
  },
  {
    id: '4',
    folio: 'TR-2024-00449',
    type: 'Emergencia',
    status: 'document_pending',
    asegurado: 'Elena Martínez',
    poliza: 'GMM-667788',
    monto: 8500.00,
    fecha: new Date('2024-04-05T11:00:00'),
    progress: 20
  }
];

export function DesktopTable() {
  return (
    <div className="bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Folio / Tipo</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asegurado / Póliza</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Monto</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {DUMMY_TRAMITES.map((tramite) => (
            <tr key={tramite.id} className="group hover:bg-slate-800/20 transition-colors">
              <td className="py-4 px-6">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-100 group-hover:text-medical-cyan transition-colors">
                    {tramite.folio}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">
                    {tramite.type}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-300">
                    {tramite.asegurado}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">
                    {tramite.poliza}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">
                <StatusBadge status={tramite.status} progress={tramite.progress} />
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    ${tramite.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {format(tramite.fecha, 'dd MMM, HH:mm', { locale: es })}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-medical-cyan hover:border-medical-cyan/30 transition-all">
                    <Download size={14} />
                  </button>
                  <button className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-white transition-all">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status, progress }: { status: string; progress: number }) {
  const configs: any = {
    completed: {
      label: 'Completado',
      icon: CheckCircle2,
      styles: 'bg-medical-emerald/10 text-medical-emerald border-medical-emerald/20',
    },
    processing: {
      label: 'Procesando n8n',
      icon: Clock,
      styles: 'bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20',
      showProgress: true
    },
    document_pending: {
      label: 'Doc. Pendiente',
      icon: Clock3,
      styles: 'bg-medical-amber/10 text-medical-amber border-medical-amber/20',
    },
    rejected: {
      label: 'Error / Rechazado',
      icon: AlertCircle,
      styles: 'bg-medical-red/10 text-medical-red border-medical-red/20',
    },
  };

  const config = configs[status] || configs.rejected;
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.styles}`}>
        <Icon size={10} />
        {config.label}
      </span>
      {config.showProgress && (
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-medical-cyan transition-all duration-1000" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}
