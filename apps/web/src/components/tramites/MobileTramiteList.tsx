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

export function MobileTramiteList({ 
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
    <div className="space-y-3">
      {displayItems.length === 0 ? (
        <div className="p-10 text-center text-slate-500 italic bg-slate-900/20 rounded-2xl border border-slate-800">
          No se encontraron asegurados
        </div>
      ) : (
        displayItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelect?.(item)}
            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer ${
              selectedId === item.id 
                ? "bg-medical-cyan/10 border-medical-cyan shadow-lg shadow-medical-cyan/5" 
                : "bg-slate-900/40 border-slate-800"
            }`}
          >
            {/* Status Icon */}
            <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${getStatusIconColor(item.statusProceso || 'active')}`}>
              {getStatusIcon(item.statusProceso || 'active')}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold uppercase tracking-tight truncate block ${
                   selectedId === item.id ? "text-medical-cyan" : "text-slate-100"
                }`}>
                  {item.nombre}
                </span>
                <span className="text-[10px] bg-slate-950 font-bold text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                  {item.tipoPago || "Reembolso"}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 truncate">
                    Póliza: {item.poliza || "N/A"}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    ${item.montoReclamado || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {item.id}
                  </span>
                  <span className="text-[10px] font-bold text-medical-emerald">
                    Recu: ${item.montoPagado || "0"}
                  </span>
                </div>
              </div>
            </div>
            
            <ChevronRight size={16} className={selectedId === item.id ? "text-medical-cyan" : "text-slate-600"} />
          </div>
        ))
      )}
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
