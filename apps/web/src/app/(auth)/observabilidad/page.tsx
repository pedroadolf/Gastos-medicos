// apps/web/src/app/(auth)/observabilidad/page.tsx
'use client';

import { Activity, Terminal, Zap, Search, Filter, RefreshCcw, Brain, BarChart3, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ObservabilidadPage() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const { alerts, loading: loadingAlerts } = useAlerts(10);
    const { logs, loading: loadingLogs } = useSystemLogs(30);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Modern Header with Live Clock */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-2 rounded-lg bg-medical-violet/10 border border-medical-violet/20">
                                <Activity className="w-5 h-5 text-medical-violet" />
                             </div>
                             <span className="text-xs font-black text-medical-violet uppercase tracking-widest">Real-time Telemetry</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-100 tracking-tighter italic">Observabilidad</h1>
                        <p className="text-slate-500 mt-2 max-w-xl">
                            Visualización táctica de procesos neuronales. Monitorea el flujo de datos y la orquestación de agentes en tiempo real.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl md:text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Time</p>
                        <p className="text-xl font-bold font-mono text-medical-cyan tabular-nums tracking-wider">{currentTime}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Living Alerts Stream */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-white italic tracking-tight uppercase">Alertas Activas (AIOps)</h2>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-medical-cyan bg-medical-cyan/10 px-3 py-1 rounded-full border border-medical-cyan/20 animate-pulse">
                                Pulse Tracking
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {loadingAlerts && alerts.length === 0 ? (
                                <div className="py-20 text-center animate-pulse">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-4" />
                                    <span className="text-[10px] text-slate-600 font-black uppercase">Sincronizando Alertas...</span>
                                </div>
                            ) : alerts.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[40px] opacity-50">
                                    <ShieldCheck className="text-slate-700 mx-auto mb-4" size={48} />
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Sistema Nominal: Sin Alertas</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <AlertItem key={alert.id} alert={alert} />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Console & Stats */}
                    <div className="lg:col-span-1 space-y-8">
                         {/* Console Logger */}
                        <div className="rounded-[32px] bg-slate-950 border border-slate-800 p-6 font-mono text-[11px] overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-medical-violet opacity-30 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 flex items-center gap-2"><Terminal size={12} /> Live Trace Logs</span>
                                <span className={cn(
                                    "flex items-center gap-1.5 transition-colors",
                                    loadingLogs ? "text-slate-600" : "text-medical-emerald"
                                )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full bg-current", !loadingLogs && "animate-pulse")} />
                                    {loadingLogs ? 'Syncing...' : 'Live'}
                                </span>
                            </div>
                            <div className="space-y-1.5 h-[400px] overflow-y-auto no-scrollbar scroll-smooth">
                                {logs.map((log) => (
                                    <LogEntry 
                                        key={log.id} 
                                        time={new Date(log.created_at).toLocaleTimeString([], { hour12: false })} 
                                        msg={log.message} 
                                        type={log.severity || 'info'} 
                                        agent={log.agent}
                                    />
                                ))}
                                {!loadingLogs && logs.length === 0 && (
                                    <div className="py-8 text-center text-slate-700 italic">Esperando eventos...</div>
                                )}
                                <div className="text-medical-cyan animate-pulse">_</div>
                            </div>
                        </div>

                        {/* Capacity Stats (Static Mock for now, linked to Infra) */}
                        <div className="p-8 rounded-[32px] border border-slate-800 bg-slate-900/40 relative overflow-hidden">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Infra Health</h4>
                            <div className="space-y-6">
                                <LoadMetric label="DB Pool capacity" value={12} />
                                <LoadMetric label="n8n Worker Load" value={34} />
                                <LoadMetric label="AI Token Quota" value={89} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertItem({ alert }: { alert: any }) {
    const severityStyles = {
        critical: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
        warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
        info: 'bg-medical-cyan/10 border-medical-cyan/30 text-medical-cyan'
    };

    return (
        <div className={cn(
            "p-5 rounded-[24px] border transition-all hover:bg-slate-900/60",
            alert.status === 'firing' ? "bg-slate-900/80 border-slate-700" : "bg-slate-950/40 border-slate-800 opacity-60"
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "p-2.5 rounded-xl border shrink-0",
                    severityStyles[alert.severity as keyof typeof severityStyles] || severityStyles.info
                )}>
                    {alert.severity === 'critical' ? <AlertCircle size={20} /> : <Activity size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">{alert.title}</h3>
                        <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: es })}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {alert.payload?.message || alert.payload?.description || 'Sin descripción adicional.'}
                    </p>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            alert.status === 'firing' ? "bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        )}>
                            {alert.status === 'firing' ? 'DISPARADA' : 'RESUELTA'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tight">
                            ID: {alert.id.slice(0, 8)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogEntry({ time, msg, type, agent }: any) {
    const colors: any = {
        info: 'text-slate-500',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
        error: 'text-rose-500'
    };
    return (
        <div className="flex gap-2 leading-relaxed group/log">
            <span className="text-[10px] text-slate-700 shrink-0">{time}</span>
            <span className={cn("font-bold uppercase tracking-tighter shrink-0", colors[type])}>{`[${type.slice(0, 3)}]`}</span>
            <span className="text-slate-600 font-bold shrink-0 opacity-40 group-hover/log:opacity-100 transition-opacity">@{agent}:</span>
            <span className="text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">{msg}</span>
        </div>
    );
}

function LoadMetric({ label, value }: any) {
    return (
        <div>
            <div className="flex justify-between items-end mb-1.5 px-1 font-inter">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-slate-200">{value}%</span>
            </div>
            <div className={`h-1 w-full bg-slate-950 rounded-full border border-slate-800 flex items-center p-0`}>
                <div 
                    className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        value > 85 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                        value > 60 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                        'bg-medical-violet shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                    )} 
                    style={{ width: `${value}%` }} 
                />
            </div>
        </div>
    );
}
