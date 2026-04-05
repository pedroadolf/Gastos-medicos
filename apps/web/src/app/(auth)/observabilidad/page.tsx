// apps/web/src/app/(auth)/observabilidad/page.tsx
'use client';

import { Activity, Terminal, Zap, ShieldCheck, Search, Filter, RefreshCcw, Brain, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { SiniestroTimeline } from '@/components/tramites/SiniestroTimeline';
import { useState, useEffect } from 'react';

export default function ObservabilidadPage() {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const liveTimeline = [
        {
            id: 'step-1',
            title: 'Recepción Documental',
            agent: 'Orquestador GMM',
            status: 'completed' as const,
            time: '14:32:01',
            description: 'Paquete de 3 archivos (2 PDF, 1 JPG) detectado en el canal de entrada.',
            metrics: '4MB processed'
        },
        {
            id: 'step-2',
            title: 'Extracción Óptica de Datos',
            agent: 'Extractor Óptico',
            status: 'completed' as const,
            time: '14:32:15',
            description: 'OCR finalizado. Se extrajeron 42 campos clave de facturas y anexos.',
            metrics: '98% confidence'
        },
        {
            id: 'step-3',
            title: 'Validación de Integridad',
            agent: 'Validador Médico',
            status: 'in-progress' as const,
            time: 'Ejecutando...',
            description: 'Cruzando datos con póliza vigente y validando catálogo de procedimientos médicos.',
            metrics: 'Checking rule R-22-3'
        },
        {
            id: 'step-4',
            title: 'Registro en Base de Datos',
            agent: 'Database Sync',
            status: 'pending' as const,
            description: 'Actualización de tabla siniestros y generación de folio oficial.',
        }
    ];

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
                    {/* Living Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-white italic tracking-tight">Active Stream S-7724</h2>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-medical-cyan bg-medical-cyan/10 px-3 py-1 rounded-full border border-medical-cyan/20 animate-pulse">
                                Live Tracking
                            </div>
                        </div>
                        <SiniestroTimeline steps={liveTimeline} />
                    </div>

                    {/* Console & Stats */}
                    <div className="lg:col-span-1 space-y-8">
                         {/* Console Logger */}
                        <div className="rounded-[32px] bg-slate-950 border border-slate-800 p-6 font-mono text-[11px] overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-medical-violet opacity-30 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 flex items-center gap-2"><Terminal size={12} /> System Logs</span>
                                <span className="text-medical-emerald">● Running</span>
                            </div>
                            <div className="space-y-1.5 h-64 overflow-y-auto no-scrollbar scroll-smooth">
                                <LogEntry time="14:32:01" msg="WEBHOOK_RCV: /api/documentos" type="info" />
                                <LogEntry time="14:32:05" msg="TOKEN_AUTH: User juan.diego verified" type="success" />
                                <LogEntry time="14:32:15" msg="EXTRACTOR: OCR engine dispatching..." type="info" />
                                <LogEntry time="14:32:30" msg="DB_POOL: Pushing session tokens" type="info" />
                                <LogEntry time="14:33:05" msg="VALIDATOR: Checking PROCEDURES_MATCH" type="warning" />
                                <LogEntry time="14:33:42" msg="AWAIT: Syncing n8n node 422..." type="info" />
                                <div className="text-medical-cyan animate-pulse">_</div>
                            </div>
                        </div>

                        {/* Capacity Stats */}
                        <div className="p-8 rounded-[32px] border border-slate-800 bg-slate-900/40 relative overflow-hidden">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Load Balance</h4>
                            <div className="space-y-6">
                                <LoadMetric label="CPU Clusters" value={42} />
                                <LoadMetric label="AI Memory Pool" value={78} />
                                <LoadMetric label="Network Throuput" value={24} />
                            </div>
                            <div className="mt-8 flex items-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <div className="p-2 rounded-lg bg-medical-cyan/10">
                                    <Zap className="w-4 h-4 text-medical-cyan" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status</p>
                                    <p className="text-xs font-black text-white">OPTIMIZED</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogEntry({ time, msg, type }: any) {
    const colors: any = {
        info: 'text-slate-500',
        success: 'text-emerald-500',
        warning: 'text-amber-500',
        error: 'text-rose-500'
    };
    return (
        <div className="flex gap-2 leading-relaxed">
            <span className="text-[10px] text-slate-700">{time}</span>
            <span className={`font-bold ${colors[type]}`}>{`[${type.toUpperCase()}]`}</span>
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
            <div className={`h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 flex items-center p-0.5`}>
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${value > 80 ? 'bg-rose-500' : 'bg-medical-violet shadow-[0_0_10px_rgba(139,92,246,0.3)]'}`} 
                    style={{ width: `${value}%` }} 
                />
            </div>
        </div>
    );
}
