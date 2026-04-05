// apps/web/src/app/tramites/page.tsx
'use client';

import { useState } from 'react';
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
import { DesktopTable } from '@/components/tramites/DesktopTable';
import { MobileTramiteList } from '@/components/tramites/MobileTramiteList';

export default function TramitesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 font-plus-jakarta tracking-tight">
              Mis Trámites
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
            <button className="flex items-center gap-2 px-5 py-2.5 bg-medical-cyan hover:bg-medical-cyan/90 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-medical-cyan/20">
              <Plus size={20} />
              <span>Nuevo Trámite</span>
            </button>
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
            <FilterButton label="Estado" />
            <FilterButton label="Tipo" />
            <FilterButton label="Fecha" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="hidden md:block">
          <DesktopTable />
        </div>
        <div className="md:hidden">
          <MobileTramiteList />
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

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
      <span>{label}</span>
      <Filter size={14} className="opacity-50" />
    </button>
  );
}
