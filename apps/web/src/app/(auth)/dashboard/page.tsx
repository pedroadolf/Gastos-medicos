'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Activity,
  Zap,
  TrendingUp,
  Brain,
  DollarSign,
  Plus,
  MonitorPlay,
  FileText,
  ChevronRight,
  FilePlus
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function GlobalDashboardPage() {
  const [data, setData] = useState<any>({ asegurados: [], siniestros: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/afectados")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const totalSiniestros = data.asegurados?.length || 0;
  const totalReembolsado = data.asegurados?.reduce((acc: number, curr: any) => 
    acc + parseFloat((curr.montoPagado || "0").replace(/[^0-9.]/g, "")), 0) || 0;
  
  const chartData = [
    { name: 'Lun', total: 12 },
    { name: 'Mar', total: 19 },
    { name: 'Mie', total: 15 },
    { name: 'Jue', total: 22 },
    { name: 'Vie', total: 30 },
    { name: 'Sab', total: 10 },
    { name: 'Dom', total: 5 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto border-b border-slate-900 pb-8 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">OS Dashboard</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Neural Intelligence Center</p>
          </div>
          <div className="flex gap-4">
             <Link href="/siniestros/nuevo" className="px-6 py-4 bg-medical-cyan text-slate-950 font-black rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-medical-cyan/20">
                <Plus size={20} strokeWidth={3} />
                NUEVO TRÁMITE
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            <div className="lg:col-span-2 p-10 bg-slate-900/40 rounded-[40px] border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-medical-cyan/5 blur-[100px]" />
                <h2 className="text-[10px] font-black text-medical-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Zap size={14} fill="currentColor" />
                     Métricas de Eficiencia
                </h2>
                <div className="text-7xl font-black text-white italic tracking-tighter mb-2">98.5<span className="text-3xl text-medical-cyan">%</span></div>
                <p className="text-slate-500 font-bold mb-8">Nivel de automatización en la última semana</p>
                <div className="flex gap-4">
                     <div className="flex-1 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Reembolsado</p>
                         <p className="text-2xl font-black text-white italic">${totalReembolsado.toLocaleString()}</p>
                     </div>
                     <div className="flex-1 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Ahorro Ops</p>
                         <p className="text-2xl font-black text-white italic">$4.2k</p>
                     </div>
                </div>
            </div>

            <div className="p-8 bg-slate-900/40 rounded-[40px] border border-slate-800 flex flex-col justify-between">
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Salud del Sistema</h3>
                    <div className="space-y-4">
                        <SystemStatus label="n8n Engine" status="Online" color="emerald" />
                        <SystemStatus label="Supabase DB" status="Online" color="emerald" />
                        <SystemStatus label="Agent Grid" status="Warning" color="amber" />
                    </div>
                </div>
                <button className="w-full py-3 bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-700 transition-all">Ver Logs</button>
            </div>

            <div className="p-8 bg-medical-cyan rounded-[40px] flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] -rotate-45" />
                <div>
                     <h3 className="text-slate-950 text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Siniestros Hoy</h3>
                     <div className="text-slate-950 text-7xl font-black italic tracking-tighter">{totalSiniestros}</div>
                </div>
                <Link href="/siniestros" className="w-full py-4 bg-slate-950 text-white font-black rounded-2xl text-center text-xs shadow-xl shadow-slate-950/20 hover:scale-105 transition-all">GESTIONAR</Link>
            </div>
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-bold text-white italic">Live Processing Stream</h3>
                     <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-medical-cyan animate-ping" />
                         <span className="text-[10px] font-black text-medical-cyan uppercase">Live</span>
                     </div>
                </div>
                <div className="space-y-4">
                    {data.asegurados?.slice(0, 4).map((claim: any, idx: number) => (
                        <div key={idx} className="p-5 bg-slate-900/30 border border-slate-800 rounded-[32px] hover:border-slate-700 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-medical-cyan">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Siniestro #{claim.siniestro_id || '772'+idx} - {claim.nombre || 'Asegurado'}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status: <span className="text-medical-cyan">Validando</span> • Hace {idx + 2} min</p>
                                </div>
                            </div>
                            <button className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-white transition-all">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                 <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800">
                     <div className="flex items-center gap-3 mb-6">
                         <MonitorPlay className="w-6 h-6 text-medical-amber" />
                         <h3 className="text-lg font-black text-white italic">AI Diagnóstico</h3>
                     </div>
                     <div className="p-4 bg-medical-amber/5 border border-medical-amber/10 rounded-2xl mb-6">
                         <p className="text-xs font-bold text-medical-amber flex items-center gap-2 mb-2">
                             <AlertCircle size={14} /> Anomalía Detectada
                         </p>
                         <p className="text-[11px] text-slate-400">Patrón de rechazos inusual en facturas de laboratorio (Hospital ABC).</p>
                     </div>
                     <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest transition-all">Ejecutar Corrección</button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <Link href="/agentes" className="p-6 bg-slate-900/40 rounded-[32px] border border-slate-800 hover:border-medical-cyan/50 transition-all text-center group">
                        <Brain className="w-6 h-6 text-slate-500 group-hover:text-medical-cyan mx-auto mb-2" />
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Agentes</span>
                     </Link>
                     <Link href="/auditoria" className="p-6 bg-slate-900/40 rounded-[32px] border border-slate-800 hover:border-medical-amber/50 transition-all text-center group">
                        <Activity className="w-6 h-6 text-slate-500 group-hover:text-medical-amber mx-auto mb-2" />
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Auditor</span>
                     </Link>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function SystemStatus({ label, status, color }: any) {
    const statusColors: any = {
        emerald: 'bg-medical-emerald shadow-[0_0_8px_#10b981]',
        amber: 'bg-medical-amber shadow-[0_0_8px_#f59e0b]',
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[color]}`} />
                <span className="text-xs font-bold text-slate-300">{label}</span>
            </div>
            <span className={`text-[10px] font-black uppercase ${color === 'emerald' ? 'text-medical-emerald' : 'text-medical-amber'}`}>{status}</span>
        </div>
    );
}
