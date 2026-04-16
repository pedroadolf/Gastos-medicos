import React from 'react';

export function AICopilot({ insight }: { insight: any }) {
    if (!insight) return null;

    return (
        <div className="bg-black/40 p-4 rounded-xl border border-yellow-400/30 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                    AI Copilot Tracing
                </span>
            </div>

            <div className="text-xl font-black text-white italic tracking-tighter mb-1">
                "{insight.message}"
            </div>

            <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                    <span className="text-slate-500 uppercase font-bold">Probable Cause</span>
                    <span className="text-slate-300 font-medium">{insight.cause}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-bold">Recommended Action</span>
                    <span className="text-green-400 font-black italic">{insight.action}</span>
                </div>
            </div>
        </div>
    );
}

export function AnomalyClusters({ clusters }: { clusters: any[] }) {
    if (!clusters || clusters.length === 0) return null;

    return (
        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Pattern Clustering
            </div>

            <div className="space-y-3">
                {clusters.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded-full ${c.severity === 'critical' ? 'bg-gmm-danger' : 'bg-gmm-warning'}`} />
                        <div className="flex-1">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-white uppercase tracking-tight">{c.type.replace('_', ' ')}</span>
                                <span className={`text-[10px] font-bold ${c.severity === 'critical' ? 'text-gmm-danger' : 'text-gmm-warning'}`}>
                                    {c.count} Events
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] text-slate-500 font-bold italic">Max Deviation</span>
                                <span className="text-[9px] text-slate-400 font-mono tracking-tighter">
                                    {(c.maxDeviation * 100).toFixed(0)}% SLOW
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PreventivePanel({ actions }: { actions: any[] }) {
    if (!actions || actions.length === 0) return null;

    return (
        <div className="bg-black/50 p-4 rounded-xl border border-blue-400/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Preventive Control Active
                </span>
            </div>

            <div className="space-y-4">
                {actions.map((a, i) => (
                    <div key={i} className="group relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-black text-white italic">{a.action}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${
                                a.status === 'executed' ? 'bg-blue-500/10 text-blue-400 border-blue-400/20' : 'bg-red-500/10 text-red-400 border-red-400/20'
                            }`}>
                                {a.status}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            {a.reason}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 bg-blue-500/5 w-fit px-2 py-0.5 rounded border border-blue-400/10">
                            <span className="text-[8px] font-black text-blue-300 uppercase italic">Risk Avoidance:</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase">-72% ERR</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GovernanceBadge({ mode }: { mode: string }) {
    const colors: Record<string, string> = {
        NORMAL: 'bg-green-500/10 text-green-400 border-green-500/20',
        ELEVATED: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        CONSERVATIVE: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
    };

    return (
        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${colors[mode] || colors.NORMAL}`}>
            Mode: {mode}
        </div>
    );
}
