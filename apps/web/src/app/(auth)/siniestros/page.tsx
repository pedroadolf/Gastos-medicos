// apps/web/src/app/tramites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import Link from 'next/link';
import { DesktopTable } from '@/components/tramites/DesktopTable';
import { MobileTramiteList } from '@/components/tramites/MobileTramiteList';

export default function SiniestrosPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [aseguradosBD, setAseguradosBD] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/afectados")
      .then(res => res.json())
      .then(data => {
        if (data.asegurados) setAseguradosBD(data.asegurados);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 font-plus-jakarta tracking-tight">
              Siniestros
            </h1>
            <p className="text-slate-500 mt-2">
              Gestiona tus solicitudes de Gastos Médicos Mayores
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {viewMode === 'table' ? <LayoutGrid size={20} /> : <List size={20} />}
            </button>
            <Link href="/siniestros/nuevo" className="flex items-center gap-2 px-5 py-2.5 bg-medical-cyan hover:bg-medical-cyan/90 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-medical-cyan/20">
              <Plus size={20} />
              <span>Nuevo Trámite</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard 
            label="Activos"
            value="12"
            trend="+2 esta semana"
            icon={<Clock className="text-medical-cyan" size={20} />}
            color="cyan"
          />
          <StatCard 
            label="Completados"
            value="48"
            trend="98% éxito"
            icon={<CheckCircle2 className="text-medical-emerald" size={20} />}
            color="emerald"
          />
          <StatCard 
            label="Pendientes"
            value="3"
            trend="Requieren acción"
            icon={<AlertCircle className="text-medical-amber" size={20} />}
            color="amber"
            alert
          />
          <StatCard 
            label="Tiempo Promedio"
            value="2.4d"
            trend="-15% vs mes pasado"
            icon={<ArrowUpRight className="text-medical-violet" size={20} />}
            color="violet"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por folio, asegurado o RFC..."
              className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <Link href="/auditoria" className="flex items-center gap-3 px-6 py-4 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-medical-amber/40 rounded-2xl transition-all shadow-xl active:scale-95 group overflow-hidden relative">
                         <div className="absolute inset-0 bg-medical-amber/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <AlertCircle size={20} className="text-medical-amber" />
                         <div className="text-left flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Fix Engine</p>
                            <p className="text-sm font-bold truncate">Auditar Errores</p>
                         </div>
                         <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all text-medical-amber" />
                    </Link>
            <FilterButton label="Estado" />
            <FilterButton label="Tipo" />
            <FilterButton label="Fecha" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 italic">Cargando siniestros...</div>
        ) : (
          <>
            <div className="hidden md:block">
              <DesktopTable items={aseguradosBD} />
            </div>
            <div className="md:hidden">
              <MobileTramiteList items={aseguradosBD} />
            </div>
          </>
        )}
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
    <div className={`group p-6 bg-slate-900/40 rounded-[32px] border transition-all hover:bg-slate-900/60 ${colors[color]} ${alert ? 'ring-1 ring-medical-amber/40 shadow-lg shadow-medical-amber/5' : ''} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 uppercase tracking-widest`}>
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-white tracking-tighter mb-1 font-inter">{value}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.22em] italic">{label}</div>
      </div>
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
      <span>{label}</span>
      <Filter size={14} className="opacity-50" />
    </button>
  );
}
