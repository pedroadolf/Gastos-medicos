// apps/web/src/components/tramites/SiniestroTimeline.tsx
'use client';

import { 
    CheckCircle2, 
    Clock, 
    Activity, 
    Zap, 
    ShieldCheck, 
    ChevronDown, 
    Plus, 
    Brain, 
    AlertCircle,
    ArrowRight
} from 'lucide-react';

interface TimelineStep {
    id: string;
    title: string;
    agent: string;
    status: 'completed' | 'in-progress' | 'pending' | 'error';
    time?: string;
    description: string;
    metrics?: string;
}

export function SiniestroTimeline({ steps }: { steps: TimelineStep[] }) {
    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
                <div key={step.id} className="relative group">
                    {/* Vertical Line Connector */}
                    {index !== steps.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-[-16px] w-[2px] bg-slate-800 group-hover:bg-medical-cyan/30 transition-colors z-0" />
                    )}

                    <div className={`relative z-10 flex gap-6 p-5 rounded-[24px] border border-slate-800 transition-all ${step.status === 'in-progress' ? 'bg-medical-cyan/5 border-medical-cyan/30' : 'bg-slate-900/40 hover:bg-slate-900/60'}`}>
                        {/* Status Icon Container */}
                        <div className="shrink-0 flex items-center justify-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                step.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                step.status === 'in-progress' ? 'bg-medical-cyan/20 border-medical-cyan/40 text-medical-cyan animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                                step.status === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                'bg-slate-950 border-slate-800 text-slate-600'
                            }`}>
                                {step.status === 'completed' && <CheckCircle2 size={24} />}
                                {step.status === 'in-progress' && <Activity size={24} />}
                                {step.status === 'error' && <AlertCircle size={24} />}
                                {step.status === 'pending' && <Clock size={24} />}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight">{step.title}</h3>
                                {step.time && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 whitespace-nowrap">
                                        {step.time}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mb-3 leading-relaxed">{step.description}</p>
                            
                            {/* Agent Badge */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-full">
                                    <Brain size={12} className={step.status === 'in-progress' ? 'text-medical-cyan' : 'text-slate-500'} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.agent}</span>
                                </div>
                                {step.metrics && (
                                    <span className="text-[9px] font-bold text-medical-cyan/70 uppercase tracking-tighter">
                                        ⚡ {step.metrics}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Check Indicator */}
                        <div className="shrink-0 self-center hidden sm:block">
                            {step.status === 'completed' && <ArrowRight size={16} className="text-emerald-500/40" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
