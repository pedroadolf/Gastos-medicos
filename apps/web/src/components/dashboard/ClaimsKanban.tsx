import { ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';

export function ClaimsKanban({ kanban }: { kanban: any }) {
  const steps = [
    { label: 'Ingreso', status: kanban?.queued > 0 ? 'active' : 'completed', count: kanban?.queued || 0 },
    { label: 'Procesamiento', status: kanban?.processing > 0 ? 'active' : 'pending', count: kanban?.processing || 0 },
    { label: 'Auditoría', status: 'pending', count: 0 },
    { label: 'Completado', status: kanban?.completed > 0 ? 'completed' : 'pending', count: kanban?.completed || 0 },
  ];

  return (
    <div className="bg-gmm-gray-dark border border-white/5 rounded-[40px] p-8 h-full">
        <h3 className="text-white font-black italic text-xl tracking-tighter uppercase mb-2">Pipeline Monitor</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 text-glow-yellow">Active n8n Orchestrators</p>

        <div className="space-y-6">
            {steps.map((step, idx) => (
                <div key={idx} className="relative">
                    <div className={`p-6 rounded-[28px] border transition-all ${
                        step.status === 'completed' ? 'bg-gmm-success/5 border-gmm-success/20' :
                        step.status === 'active' ? 'bg-gmm-yellow/5 border-gmm-yellow/30 shadow-[0_0_20px_rgba(255,211,44,0.05)]' :
                        'bg-white/20 border-white/5 opacity-20'
                    }`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                step.status === 'active' ? 'text-gmm-yellow' : 'text-slate-500'
                            }`}>{step.label}</span>
                            {step.status === 'completed' && <CheckCircle2 className="text-gmm-success" size={14} />}
                            {step.status === 'active' && <RotateCw className="text-gmm-yellow animate-spin" size={14} />}
                        </div>
                        <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black text-white italic tracking-tighter">{step.count}</span>
                             <span className="text-[10px] font-bold text-slate-600 uppercase">Requests</span>
                        </div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 z-10">
                            <div className="w-8 h-8 rounded-full bg-gmm-gray border border-white/5 flex items-center justify-center">
                                <ArrowRight className="text-slate-700 rotate-90" size={12} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
}
