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
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { DesktopTable } from '@/components/tramites/DesktopTable';
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

  // Calculamos métricas reales
  const totalSiniestros = data.asegurados.length;
  const totalReembolsado = data.asegurados.reduce((acc: number, curr: any) => 
    acc + parseFloat((curr.montoPagado || "0").replace(/[^0-9.]/g, "")), 0);
  
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
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-3xl font-bold text-slate-100 font-plus-jakarta tracking-tight">
              Centro de Control
            </h1>
            <p className="text-slate-500 mt-2">
              Siniestros médicos, KPIs ejecutivos e inteligencia
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/siniestros/nuevo" className="flex items-center gap-2 px-5 py-2.5 bg-medical-cyan hover:bg-medical-cyan/90 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-medical-cyan/20 group">
              <Zap size={20} className="group-hover:animate-pulse" />
              <span>Ejecutar GMM Bot</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard 
            label="Total Siniestros"
            value={isLoading ? "..." : totalSiniestros}
            trend="+12% vs anterior"
            icon={<Activity className="text-medical-cyan" size={20} />}
            color="cyan"
          />
          <StatCard 
            label="Total Reembolsado"
            value={isLoading ? "..." : `$${totalReembolsado.toLocaleString()}`}
            trend="Monto acumulado"
            icon={<DollarSign className="text-medical-emerald" size={20} />}
            color="emerald"
          />
          <StatCard 
            label="Alertas Auditoría"
            value="3"
            trend="Requieren atención"
            icon={<AlertCircle className="text-medical-amber" size={20} />}
            color="amber"
            alert
          />
          <StatCard 
            label="Tiempo de Resolución"
            value="3.2m"
            trend="-80% vs original"
            icon={<Clock className="text-medical-violet" size={20} />}
            color="violet"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-12">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 backdrop-blur-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-white font-bold text-lg">Actividad por Día</h3>
              <p className="text-xs text-slate-500">Siniestros procesados última semana</p>
            </div>
            <TrendingUp size={20} className="text-medical-cyan opacity-50" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#2dd4bf', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#2dd4bf' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Health Score Section */}
        <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm group hover:border-medical-cyan/30 transition-all">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-medical-cyan/20 blur-2xl rounded-full group-hover:bg-medical-cyan/40 transition-all"></div>
                <Brain size={64} className="text-medical-cyan relative z-10" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">Salud del Sistema (Score)</h3>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-medical-emerald to-medical-cyan mb-4">
                92<span className="text-2xl text-slate-500 font-medium">/100</span>
            </div>
            <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed px-4">
                    Tus agentes de IA han mantenido una tasa de éxito del <span className="text-medical-emerald font-bold">100%</span> en las últimas 24 horas.
                </p>
                <div className="flex gap-2 justify-center">
                    <span className="w-2 h-2 rounded-full bg-medical-emerald animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-medical-emerald animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-medical-emerald animate-pulse delay-150"></span>
                </div>
            </div>
        </div>
      </div>

      {/* Siniestros Recientes */}
      <div className="max-w-7xl mx-auto mt-12 pb-12">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-medical-cyan rounded-full"></div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Siniestros Recientes</h2>
            </div>
            <Link href="/siniestros" className="px-4 py-2 text-sm font-bold text-medical-cyan bg-medical-cyan/10 hover:bg-medical-cyan/20 rounded-xl transition-all border border-medical-cyan/20">
                Ver todos los registros
            </Link>
        </div>

        <div className="hidden md:block">
          <DesktopTable items={data.asegurados?.slice(0, 5) || []} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, color, alert }: any) {
  const colors: any = {
    cyan: 'border-medical-cyan/20 group-hover:border-medical-cyan/50',
    emerald: 'border-medical-emerald/20 group-hover:border-medical-emerald/50',
    amber: 'border-medical-amber/20 group-hover:border-medical-amber/50',
    violet: 'border-medical-violet/20 group-hover:border-medical-violet/50',
  };

  return (
    <div className={`group p-6 bg-slate-900/40 rounded-3xl border transition-all hover:bg-slate-900/60 hover:-translate-y-1 ${colors[color]} ${alert ? 'ring-1 ring-medical-amber/40 shadow-xl shadow-medical-amber/5' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 tracking-wider shadow-sm`}>
          {trend}
        </span>
      </div>
      <div>
        <div className="text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</div>
      </div>
    </div>
  );
}
