// apps/web/src/components/tramites/TramitesTable.tsx
'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TramiteStatusBadge, StatusType } from './TramiteStatusBadge';
import { TramiteActions } from './TramiteActions';
import { ScoreBadge } from './ScoreBadge';
import { cn } from '@/lib/utils';

interface Tramite {
  id: string;
  folio: string;
  tipo_tramite: string;
  aseguradora: string;
  paciente_nombre: string;
  estado: StatusType;
  score?: number;
  created_at: string;
  updated_at: string;
  zip_url?: string;
}

interface TramitesTableProps {
  items: Tramite[];
  onSelect: (item: Tramite) => void;
  selectedId?: string;
  onDownload?: (item: Tramite) => void;
}

export function TramitesTable({ items, onSelect, selectedId, onDownload }: TramitesTableProps) {
  return (
    <div className="bg-slate-900/30 rounded-[32px] border border-slate-800/60 overflow-hidden backdrop-blur-md shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-medical-cyan/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40">
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Folio / Póliza</th>
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Paciente / Aseguradora</th>
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo de Trámite</th>
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Score IA</th>
              <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-500 italic font-medium">
                  No se encontraron trámites en el historial.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group cursor-pointer transition-all duration-300 relative",
                    selectedId === item.id 
                      ? "bg-medical-cyan/10 border-l-4 border-l-medical-cyan" 
                      : "hover:bg-slate-800/30"
                  )}
                >
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-black tracking-tight transition-colors",
                        selectedId === item.id ? "text-medical-cyan" : "text-slate-100 group-hover:text-medical-cyan"
                      )}>
                        {item.folio || "SIN-FOLIO"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {format(new Date(item.created_at), "dd MMM, yyyy · HH:mm'h'", { locale: es })}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-300 italic group-hover:text-white transition-colors">
                        {item.paciente_nombre}
                      </span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        {item.aseguradora}
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          {item.tipo_tramite.replace('_', ' ')}
                       </span>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <TramiteStatusBadge status={item.estado} progress={75} />
                  </td>
                  
                  <td className="py-5 px-6">
                    <ScoreBadge score={item.score} />
                  </td>
                  
                  <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                    <TramiteActions 
                      tramite={item}
                      onView={() => onSelect(item)}
                      onFix={() => console.log('Fix', item.id)}
                      onRetry={() => console.log('Retry', item.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
