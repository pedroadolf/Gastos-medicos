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

interface Tramite {
  id: string;
  nombre: string;
  poliza: string;
  empresa?: string;
  statusProceso?: string;
  tipoPago?: string;
  montoReclamado?: string;
  montoPagado?: string; // We'll assume this field exists or map it
}

export function DesktopTable({ 
  items, 
  onSelect, 
  selectedId 
}: { 
  items: any[]; 
  onSelect?: (item: any) => void;
  selectedId?: string;
}) {
  const displayItems = items && items.length > 0 ? items : [];

  return (
    <div className="bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/50">
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asegurado / Trámite</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Póliza / ID</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto Solicitado</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reembolsado</th>
            <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {displayItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-12 text-center text-slate-500 italic">No se encontraron asegurados para seleccionar</td>
            </tr>
          ) : (
            displayItems.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onSelect?.(item)}
                className={`group cursor-pointer transition-all ${
                  selectedId === item.id 
                    ? "bg-medical-cyan/10 border-l-2 border-l-medical-cyan" 
                    : "hover:bg-slate-800/20"
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold transition-colors ${
                      selectedId === item.id ? "text-medical-cyan" : "text-slate-100 group-hover:text-medical-cyan"
                    }`}>
                      {item.nombre}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter mt-0.5">
                      {item.tipoPago || "Reembolso"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-300">
                      {item.poliza || "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      ID: {item.id}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-bold text-slate-100">
                    ${item.montoReclamado || "0"}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-bold text-medical-emerald">
                    ${item.montoPagado || "0"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <StatusBadge status={item.statusProceso || 'active'} progress={0} />
                </td>
              </tr>
            ))
          )}
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
