// apps/web/src/app/(auth)/siniestros/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LayoutGrid,
  List,
  ChevronLeft,
  Sparkles,
  Zap,
  Filter,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { TramitesTable } from '@/components/tramites/TramitesTable';
import { MobileTramiteList } from '@/components/tramites/MobileTramiteList';
import { TramiteFilters } from '@/components/tramites/TramiteFilters';
import { useTramites } from '@/hooks/useTramites';
import { cn } from '@/lib/utils';

interface Tramite {
  id: string;
  folio: string;
  paciente_nombre: string;
  aseguradora?: string;
  estado: string;
  score?: number;
}



export default function SiniestrosPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { tramites, isLoading, refetch } = useTramites() as any;
  const [filteredTramites, setFilteredTramites] = useState<any[]>([]);
  const [selectedTramite, setSelectedTramite] = useState<any | null>(null);

  useEffect(() => {
    if (tramites) {
      setFilteredTramites(tramites);
    }
  }, [tramites]);

  const handleSearch = (query: string) => {
    const q = query.toLowerCase();
    const filtered = tramites.filter((t: Tramite) => 
      t.folio.toLowerCase().includes(q) || 
      t.paciente_nombre.toLowerCase().includes(q) ||
      (t.aseguradora && t.aseguradora.toLowerCase().includes(q))
    );
    setFilteredTramites(filtered);
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...tramites];
    if (filters.estado) {
      filtered = filtered.filter((t: Tramite) => t.estado === filters.estado);
    }
    if (filters.aseguradora) {
      filtered = filtered.filter((t: Tramite) => t.aseguradora && t.aseguradora.includes(filters.aseguradora));
    }
    setFilteredTramites(filtered);
  };

  return (
    <div className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-medical-cyan/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-medical-violet/5 blur-[100px] rounded-full" />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10 space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-medical-cyan transition-colors"
            >
              <ChevronLeft size={14} />
              Regresar al Dashboard
            </Link>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              Mis Trámites
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-medical-emerald animate-pulse" />
              Central de Gestión de Siniestros
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'table' ? "bg-medical-cyan text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-medical-cyan text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            
            <Link 
              href="/siniestros/nuevo" 
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-tr from-medical-cyan to-medical-cyan/80 hover:scale-[1.05] active:scale-95 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_rgba(34,211,238,0.2)] group"
            >
              <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Nuevo Trámite</span>
            </Link>
          </div>
        </div>

        {/* Stats Section with Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="En Proceso"
            value={tramites.filter((t: Tramite) => t.estado === 'processing' || t.estado === 'audited').length.toString()}
            trend="Activos"
            icon={<Clock className="text-medical-cyan" size={20} />}
            color="cyan"
          />
          <StatCard 
            label="Completados"
            value={tramites.filter((t: Tramite) => t.estado === 'completed').length.toString()}
            trend="Finalizados"
            icon={<CheckCircle2 className="text-medical-emerald" size={20} />}
            color="emerald"
          />
          <StatCard 
            label="Auditoría"
            value={tramites.filter((t: Tramite) => t.estado === 'error').length.toString()}
            trend="Bloqueados"
            icon={<Zap className="text-medical-amber" size={20} />}
            color="amber"
            alert={tramites.some((t: Tramite) => t.estado === 'error')}
          />
          <StatCard 
            label="Pacientes"
            value={new Set(tramites.map((t: Tramite) => t.paciente_nombre)).size.toString()}
            trend="Registrados"
            icon={<Users className="text-medical-violet" size={20} />}
            color="violet"
          />
        </div>

        {/* Advanced Filters */}
        <TramiteFilters 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {/* Main Content: Table or Grid View */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando con Supabase...</p>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <TramitesTable 
                  items={filteredTramites} 
                  onSelect={(item) => setSelectedTramite(item)}
                  selectedId={selectedTramite?.id}
                  onDownload={(item) => window.open(`/api/tramites/${item.id}/download`, '_blank')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* Mobile Cards Reuse or Specific Grid Component */}
                   <MobileTramiteList items={filteredTramites} />
                 </div>
              )}
            </>
          )}
        </div>

        {/* Quick Audit Access Banner */}
        <Link 
          href="/auditoria"
          className="group block p-1 rounded-3xl bg-gradient-to-r from-medical-amber/40 via-transparent to-transparent hover:from-medical-amber transition-all duration-500"
        >
          <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-[22px] flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-medical-amber/10 flex items-center justify-center border border-medical-amber/20 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-8 h-8 text-medical-amber" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic">Centro de Auditoría AI</h3>
                <p className="text-slate-500 text-sm font-bold">Resuelve {tramites.filter((t: Tramite) => t.estado === 'error').length} errores detectados automáticamente.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pr-4">
               <span className="text-[10px] font-black text-medical-amber uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Iniciar Auto-Fix</span>
               <div className="p-3 bg-medical-amber rounded-xl text-slate-950 group-hover:translate-x-2 transition-transform">
                 <ArrowUpRight size={20} />
               </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Side Detail Panel (Conditional) */}
      {selectedTramite && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[500px] z-[100] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500 flex flex-col">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-medical-cyan uppercase tracking-widest">Detalle del Trámite</span>
              <h2 className="text-3xl font-black text-white italic leading-none">{selectedTramite.folio}</h2>
            </div>
            <button 
              onClick={() => setSelectedTramite(null)}
              className="p-3 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
               <InfoTile label="Paciente" value={selectedTramite.paciente_nombre} />
               <InfoTile label="Aseguradora" value={selectedTramite.aseguradora} />
               <InfoTile label="Tipo" value={selectedTramite.tipo_tramite.toUpperCase()} />
               <InfoTile label="Score Auditor" value={`${selectedTramite.score}%`} highlight={selectedTramite.score > 90} />
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Archivos Adjuntos ({selectedTramite.adjuntos.length})</h4>
               <div className="grid grid-cols-1 gap-2">
                  {selectedTramite.adjuntos.map((adj: any) => (
                    <div key={adj.id} className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-xl text-[11px]">
                      <span className="text-slate-300 truncate w-32 font-medium">{adj.file_name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[9px] font-black uppercase">{adj.tipo_documento}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Análisis de Facturas ({selectedTramite.facturas.length})</h4>
               <div className="grid grid-cols-1 gap-2">
                  {selectedTramite.facturas.map((fac: any) => (
                    <div key={fac.id} className="flex items-center justify-between p-3 bg-medical-cyan/5 border border-medical-cyan/10 rounded-xl text-[11px]">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{fac.numero_factura || 'REF-8822'}</span>
                        <span className="text-slate-500 text-[9px] uppercase font-black">{fac.tipo_gasto === 'H' ? 'Hospital' : 'Médicos'}</span>
                      </div>
                      <span className="text-medical-cyan font-black">${new Intl.NumberFormat().format(fac.importe)}</span>
                    </div>
                  ))}
               </div>
            </div>

            {selectedTramite.estado === 'completed' && (
              <button 
                onClick={() => window.open(`/api/tramites/${selectedTramite.id}/download`, '_blank')}
                className="flex items-center justify-center gap-4 w-full py-5 bg-medical-emerald text-slate-950 font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-medical-emerald/20"
              >
                <ArrowUpRight size={20} />
                DESCARGAR EXPEDIENTE ZIP
              </button>
            )}
            
            {selectedTramite.estado === 'error' && (
              <button 
                onClick={async () => {
                  if (confirm("¿Deseas iniciar el proceso de Auto-Fix para este trámite?")) {
                    try {
                      const res = await fetch('/api/agentes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          action: 'autofix', 
                          claimId: selectedTramite.id,
                          agentId: 'validator-agent'
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("🚀 Auto-Fix iniciado. El trámite se re-procesará en breve.");
                        setSelectedTramite(null);
                      } else {
                        alert(`❌ Error: ${data.error}`);
                      }
                    } catch (e) {
                      alert("❌ Error de conexión al iniciar Auto-Fix.");
                    }
                  }
                }}
                className="flex items-center justify-center gap-4 w-full py-5 bg-medical-amber text-slate-950 font-black rounded-2xl hover:bg-white transition-all shadow-xl shadow-medical-amber/20"
              >
                <Zap size={20} fill="currentColor" />
                CORREGIR CON AUTO-FIX
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, trend, icon, color, alert }: any) {
  const colors: any = {
    cyan: 'border-medical-cyan/20 group-hover:border-medical-cyan shadow-medical-cyan/5',
    emerald: 'border-medical-emerald/20 group-hover:border-medical-emerald shadow-medical-emerald/5',
    amber: 'border-medical-amber/20 group-hover:border-medical-amber shadow-medical-amber/5',
    violet: 'border-medical-violet/20 group-hover:border-medical-violet shadow-medical-violet/5',
  };

  return (
    <div className={cn(
      "group p-6 bg-slate-900/40 rounded-[32px] border transition-all duration-500 hover:bg-slate-900/60 relative overflow-hidden",
      colors[color],
      alert && "animate-pulse"
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner group-hover:scale-110 group-hover:border-white/10 transition-transform duration-500">
          {icon}
        </div>
        <span className="text-[9px] font-black px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-4xl font-black text-white tracking-tighter mb-1 font-inter group-hover:scale-105 transition-transform origin-left">{value}</div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic group-hover:text-slate-300 transition-colors">{label}</div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, highlight }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-1">
       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
       <p className={cn("text-xs font-bold truncate", highlight ? "text-medical-cyan" : "text-white")}>{value}</p>
    </div>
  );
}

function TimelineEvent({ label, date, active }: any) {
  return (
    <div className={cn("relative transition-opacity", !active && "opacity-30")}>
       <div className={cn(
         "absolute left-[-23px] top-1 w-3 h-3 rounded-full border-2",
         active ? "bg-medical-cyan border-medical-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "bg-slate-950 border-slate-800"
       )} />
       <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{label}</p>
       <p className="text-[10px] text-slate-500 font-mono mt-1">{date || "Procesando"}</p>
    </div>
  );
}

function Download({ size }: { size: number }) {
  return <ArrowUpRight size={size} />;
}
