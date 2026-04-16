'use client';

import { Bell, AlertCircle, FileX, Zap, ChevronRight, ShieldCheck } from 'lucide-react';

interface Alert {
  id: string;
  execution_id?: string;
  event_type?: string;
  message: string;
  severity: string;
  timestamp: string;
  impact?: string;
  action?: string;
  workflow_executions?: {
    workflow_name: string;
  }
}

export function AlertCenter({ alerts = [], onAlertClick }: { alerts: Alert[], onAlertClick?: (id: string) => void }) {
  return (
    <div className="bg-gmm-gray-dark border border-white/5 rounded-[40px] p-8 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-gmm-yellow rounded-2xl">
                <Bell className="text-black" size={20} />
            </div>
            <div>
                <h3 className="text-white font-black italic text-xl tracking-tighter uppercase">NOC Alert Stack</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live System Events</p>
            </div>
        </div>
        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-slate-400">{alerts.length} ACTIVE</span>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 ? alerts.map((alert) => (
          <div 
            key={alert.id} 
            onClick={() => alert.execution_id && onAlertClick?.(alert.execution_id)}
            className="p-6 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/[0.08] transition-all cursor-pointer group"
          >
             <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                    alert.severity === 'critical' || alert.severity === 'error' || alert.severity === 'high' ? 'bg-gmm-danger/20 text-gmm-danger' : 
                    alert.severity === 'medium' ? 'bg-gmm-warning/20 text-gmm-warning' : 
                    'bg-gmm-success/20 text-gmm-success'
                }`}>
                    {alert.severity === 'critical' || alert.severity === 'error' ? <FileX size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-black text-white italic uppercase tracking-tight">
                            {alert.workflow_executions?.workflow_name || 'Workflow Exception'}
                        </p>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-xs text-white/80 font-bold leading-tight line-clamp-2">{alert.message}</p>
                </div>
                <ChevronRight className="text-slate-700 group-hover:text-gmm-yellow transition-colors shrink-0" size={16} />
             </div>

             {(alert.impact || alert.action) && (
                 <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                     {alert.impact && (
                         <div>
                             <p className="text-[8px] font-black text-gmm-danger uppercase mb-1">Impact</p>
                             <p className="text-[10px] text-slate-400 font-medium leading-tight">{alert.impact}</p>
                         </div>
                     )}
                     {alert.action && (
                         <div>
                             <p className="text-[8px] font-black text-gmm-yellow uppercase mb-1">Action</p>
                             <p className="text-[10px] text-slate-400 font-medium leading-tight">{alert.action}</p>
                         </div>
                     )}
                 </div>
             )}
          </div>
        )) : (
            <div className="py-12 flex flex-col items-center justify-center opacity-20">
                <ShieldCheck size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No critical events detected</p>
            </div>
        )}
      </div>

      <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-transparent hover:border-white/10">
          Ver Historial de Logs
      </button>
    </div>
  );
}
