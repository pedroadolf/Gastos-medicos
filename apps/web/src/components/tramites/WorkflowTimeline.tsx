'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Activity, 
  Brain, 
  AlertCircle,
  FileText,
  Package,
  Zap,
  Wand2,
  Bug,
  Info,
  ChevronRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowLogs, WorkflowLog } from '@/hooks/useWorkflowLogs';
import { cn } from '@/lib/utils';

// --- ARQUITECTURA DE FASES (Logos -> Grupos) ---
const PHASE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PREPARE: { label: 'Preparación de Expediente', icon: Database, color: 'text-blue-400' },
  AUDIT: { label: 'Análisis e Inteligencia', icon: Brain, color: 'text-purple-400' },
  DELIVERY: { label: 'Generación y Entrega', icon: Package, color: 'text-emerald-400' },
  AUTOFIX: { label: 'Recuperación Automática', icon: Wand2, color: 'text-pink-400' },
  ERROR: { label: 'Gestión de Excepciones', icon: AlertCircle, color: 'text-rose-400' },
};

const STEP_TO_PHASE: Record<string, string> = {
  'CREATE': 'PREPARE',
  'PDF_ENGINE': 'PREPARE',
  'AUDIT_ENGINE': 'AUDIT',
  'AUTOFIX': 'AUTOFIX',
  'ZIP_ENGINE': 'DELIVERY',
  'CALLBACK': 'DELIVERY'
};

export function WorkflowTimeline({ tramiteId }: { tramiteId: string }) {
  const { logs, loading } = useWorkflowLogs(tramiteId);
  const [showDebug, setShowDebug] = useState(false);

  // 🧠 Lógica de Agrupación por Fases
  const groupedPhases = useMemo(() => {
    const phases: Record<string, WorkflowLog[]> = {};
    
    // Ordenar logs (recientes al final internamente para cada fase)
    const sortedLogs = [...logs].reverse();

    sortedLogs.forEach(log => {
      const phaseKey = log.status === 'error' ? 'ERROR' : (STEP_TO_PHASE[log.step] || 'PREPARE');
      if (!phases[phaseKey]) phases[phaseKey] = [];
      phases[phaseKey].push(log);
    });

    return phases;
  }, [logs]);

  if (loading && logs.length === 0) return <TimelineSkeleton />;

  if (logs.length === 0 && !loading) return <EmptyTimeline />;

  return (
    <div className="space-y-6">
      {/* Header PRO */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-3">
           <Activity size={18} className="text-medical-cyan animate-pulse" />
           <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Flow Engine v4.0</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Observability</p>
           </div>
        </div>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
            showDebug 
              ? "bg-medical-cyan/20 text-medical-cyan border border-medical-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
              : "bg-slate-950/50 text-slate-500 border border-slate-800 hover:border-slate-700 hover:text-slate-300"
          )}
        >
          <Bug size={12} className={cn("transition-transform", showDebug ? "rotate-12" : "group-hover:-rotate-12")} />
          {showDebug ? 'Cerrar Debug' : 'Console Debug'}
        </button>
      </div>

      <div className="relative space-y-4">
        {/* Animated Line Connector */}
        <div className="absolute left-[33px] top-6 bottom-6 w-[2px] bg-slate-800/50 hidden lg:block" />

        <AnimatePresence>
          {Object.entries(PHASE_CONFIG).map(([key, config]) => {
            const phaseLogs = groupedPhases[key];
            if (!phaseLogs || phaseLogs.length === 0) return null;

            const isProcessing = phaseLogs.some(l => l.status === 'processing');
            const isError = key === 'ERROR';

            return (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group relative overflow-hidden rounded-[24px] border transition-all duration-500",
                  isProcessing ? "bg-slate-900/80 border-medical-cyan/40 shadow-xl shadow-medical-cyan/5" : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700",
                  isError ? "border-rose-500/30 bg-rose-500/5" : ""
                )}
              >
                {/* Pulse Indicator on Processing */}
                {isProcessing && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-medical-cyan to-transparent" 
                  />
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl border transition-colors relative",
                        isProcessing ? "bg-medical-cyan/20 border-medical-cyan/30 text-medical-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "bg-slate-900 border-slate-800 text-slate-500"
                      )}>
                        <config.icon size={18} className={isProcessing ? "animate-pulse" : ""} />
                      </div>
                      <div>
                        <h3 className={cn(
                          "text-[12px] font-black uppercase tracking-tight italic",
                          isProcessing ? "text-white" : "text-slate-400"
                        )}>
                          {config.label}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            {phaseLogs.length} EVENTOS REGISTRADOS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pl-2">
                    <AnimatePresence>
                      {phaseLogs.map((log) => (
                        <TimelineItem key={log.id} log={log} showDebug={showDebug} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TimelineItem({ log, showDebug }: { log: WorkflowLog; showDebug: boolean }) {
  const isError = log.status === 'error';
  const isProcessing = log.status === 'processing';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      className="relative pl-6 border-l border-slate-800/50 group/item"
    >
      {/* Connector Node */}
      <motion.div 
        layoutId={`node-${log.id}`}
        className={cn(
          "absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full border border-slate-950 transition-all z-10",
          log.status === 'success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
          log.status === 'error' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" :
          log.status === 'processing' ? "bg-medical-cyan animate-pulse" : "bg-slate-700"
        )} 
      />

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4">
             <p className={cn(
               "text-[11px] font-bold tracking-tight",
               isError ? "text-rose-400" : isProcessing ? "text-medical-cyan" : "text-slate-300"
             )}>
               {log.message || log.step}
             </p>
             <span className="text-[8px] font-mono font-bold text-slate-600 shrink-0">
               {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
          </div>

          {showDebug && log.metadata && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 p-2 bg-slate-950/80 border border-slate-800/50 rounded-lg overflow-x-hidden"
            >
               <div className="flex flex-wrap gap-2 mb-1">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Metadata Context:</span>
               </div>
               <pre className="text-[9px] font-mono text-slate-500 block overflow-x-auto whitespace-pre max-w-full">
                 {JSON.stringify(log.metadata, null, 2)}
               </pre>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse px-2">
      <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 bg-slate-800 rounded-xl" />
         <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-800 rounded shadow-sm" />
            <div className="h-2 w-20 bg-slate-900 rounded" />
         </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-slate-900/40 border border-slate-800/80 rounded-[32px] p-6 shadow-sm" />
      ))}
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-950/20 border border-dashed border-slate-800/50 rounded-[40px] transition-all hover:bg-slate-950/30">
       <div className="w-16 h-16 bg-slate-900/50 rounded-3xl flex items-center justify-center mb-4 border border-slate-800">
          <Zap size={32} className="text-slate-700" />
       </div>
       <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2 italic">Sin Señal de Workflow</h3>
       <p className="text-[10px] text-slate-500 font-bold max-w-[200px] leading-relaxed">
          El motor de orquestación v4.0 está a la espera de eventos entrantes de la API o n8n.
       </p>
    </div>
  );
}
