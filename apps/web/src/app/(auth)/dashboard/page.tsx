'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Activity,
  Zap,
  TrendingUp,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { DesktopTable } from '@/components/tramites/DesktopTable';

export default function GlobalDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 font-plus-jakarta tracking-tight">
              Centro de Control
            </h1>
            <p className="text-slate-500 mt-2">
              Siniestros médicos, KPIs ejecutivos e inteligencia
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/siniestros/nuevo" className="flex items-center gap-2 px-5 py-2.5 bg-medical-cyan hover:bg-medical-cyan/90 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-medical-cyan/20">
              <Zap size={20} />
              <span>Ejecutar GMM Bot</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard 
            label="Total Siniestros (Mes)"
            value="142"
            trend="+12% vs anterior"
            icon={<Activity className="text-medical-cyan" size={20} />}
            color="cyan"
          />
          <StatCard 
            label="Tasa de Éxito AI"
            value="98.5%"
            trend="Sin intervención manual"
            icon={<CheckCircle2 className="text-medical-emerald" size={20} />}
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-12">
        <div className="col-span-2 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-slate-500">
            <TrendingUp size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="font-bold text-lg mb-1">Gráfica de Tendencias</p>
            <p className="text-sm">En desarrollo: Integración con Recharts</p>
          </div>
        </div>
        

        <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
            <Brain size={48} className="text-medical-cyan mb-4 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
            <h3 className="font-bold text-white text-lg mb-2">Salud del Sistema (Score)</h3>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-medical-emerald to-medical-cyan mb-4">
                92<span className="text-2xl text-slate-500">/100</span>
            </div>
            <p className="text-sm text-slate-400">
                Los agentes de extracción N8N han resuelto 139 siniestros con éxito.
            </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Siniestros Recientes</h2>
            <Link href="/siniestros" className="text-sm text-medical-cyan hover:underline">Ver todos →</Link>
        </div>

        <div className="hidden md:block">
          <DesktopTable items={[]} />
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
    <div className={`group p-5 bg-slate-900/40 rounded-2xl border transition-all hover:bg-slate-900/60 ${colors[color]} ${alert ? 'ring-1 ring-medical-amber/40 shadow-lg shadow-medical-amber/5' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-500`}>
          {trend}
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100 mb-1">{value}</div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}
