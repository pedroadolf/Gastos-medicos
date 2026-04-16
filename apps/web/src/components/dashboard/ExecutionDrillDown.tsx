'use client';

import { X, RotateCw, Activity, Terminal, Info, AlertCircle, Clock, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AIPanel } from './AIPanel';
import { HealingActionPanel } from './HealingActionPanel';

interface ExecutionDrillDownProps {
  executionId: string | null;
  onClose: () => void;
}

export function ExecutionDrillDown({ executionId, onClose }: ExecutionDrillDownProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (executionId) {
      setLoading(true);
      fetch(`/api/workflow/execution/${executionId}`)
        .then(res => res.json())
        .then(d => {
          if (d.success) setData(d.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [executionId]);

  if (!executionId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-gmm-gray-dark border-l border-white/5 h-screen overflow-hidden flex flex-col"
        >
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center gap-4">
                <RotateCw className="text-gmm-yellow animate-spin" size={32} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracing execution node...</p>
             </div>
          ) : data ? (
            <>
              {/* 1. Execution Header (Decisión Rápida) */}
              <div className="p-8 border-b border-white/5 bg-black/20">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className={`w-2 h-2 rounded-full animate-pulse ${
                                 data.execution.status === 'success' ? 'bg-gmm-success' : 'bg-gmm-danger'
                             }`} />
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {data.execution.workflow_name}
                             </p>
                        </div>
                        <h2 className="text-2xl font-black text-white italic truncate uppercase tracking-tighter">
                            {data.execution.status === 'success' ? 'Execution Success' : 'Critical Failure Detected'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex items-center gap-8">
                     <div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Execution ID</p>
                        <p className="text-xs font-mono text-white tracking-tighter">{data.execution.execution_id}</p>
                     </div>
                     <div className="h-6 w-px bg-white/5" />
                     <div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Duration</p>
                        <p className="text-xs font-black text-gmm-yellow uppercase italic">
                            {data.execution.finished_at ? `${(new Date(data.execution.finished_at).getTime() - new Date(data.execution.started_at).getTime())}ms` : 'In Progress'}
                        </p>
                     </div>
                </div>

                {data.rootCause && (
                    <div className="mt-8 p-6 bg-gmm-danger/5 border border-gmm-danger/20 rounded-[28px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <AlertCircle size={48} className="text-gmm-danger" />
                        </div>
                        <p className="text-[9px] font-black text-gmm-danger uppercase mb-2 tracking-widest">Root Cause Analysis</p>
                        <p className="text-sm font-bold text-white mb-2 italic">❌ {data.rootCause.error}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{data.rootCause.impact}. {data.rootCause.recovery}</p>
                    </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                  {/* 🧠 AI Decision Engine Section */}
                  {data.ai && (
                      <div className="space-y-4">
                          <AIPanel ai={data.ai} />
                          {data.ai.action && (
                              <HealingActionPanel action={data.ai.action} />
                          )}
                      </div>
                  )}

                  {/* 2. Timeline Visual (The Heart) */}
                  <section>
                      <div className="flex items-center gap-2 mb-8">
                          <Activity className="text-gmm-yellow" size={14} />
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Visual Timeline</h3>
                      </div>
                      <div className="flex items-center gap-1.5 h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                          {data.steps.map((s: any, i: number) => (
                              <div key={i} className={`h-full flex-1 ${
                                  s.status === 'success' ? 'bg-gmm-success/40' : 'bg-gmm-danger'
                              }`} />
                          ))}
                      </div>
                  </section>

                  {/* 3. Steps table (Debug Real) */}
                  <section>
                      <div className="flex items-center gap-2 mb-6">
                          <Terminal className="text-gmm-yellow" size={14} />
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Step Analysis</h3>
                      </div>
                      <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Node Name</th>
                                    <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.steps.map((s: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-700">#{(idx+1).toString().padStart(2, '0')}</td>
                                        <td className="px-6 py-4 text-xs font-black text-white italic uppercase tracking-tight">{s.step_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                                s.status === 'success' ? 'bg-gmm-success/20 text-gmm-success' : 'bg-gmm-danger/20 text-gmm-danger'
                                            }`}>{s.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-slate-500 font-bold">
                                            {s.finished_at ? `${(new Date(s.finished_at).getTime() - new Date(s.started_at).getTime())}ms` : '...'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                  </section>

                  {/* 4. Logs Viewer (CLAVE) */}
                  <section>
                      <div className="flex items-center gap-2 mb-6">
                          <Info className="text-gmm-yellow" size={14} />
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Event Stream</h3>
                      </div>
                      <div className="bg-black p-6 rounded-[32px] font-mono text-[10px] border border-white/5 h-64 overflow-y-auto space-y-2 custom-scrollbar">
                        {data.logs.map((log: any, i: number) => (
                            <div key={i} className={`flex gap-4 ${
                                log.level === 'error' ? 'text-gmm-danger' : log.level === 'warn' ? 'text-gmm-warning' : 'text-slate-500'
                            }`}>
                                <span className="opacity-30 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="opacity-50 uppercase font-bold w-12">[{log.level}]</span>
                                <span className="flex-1 opacity-80">{log.message}</span>
                            </div>
                        ))}
                      </div>
                  </section>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
