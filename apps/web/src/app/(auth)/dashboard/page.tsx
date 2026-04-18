'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Activity, Zap, Plus,
  TrendingDown, TrendingUp, Search, Calendar,
  Bell, ArrowRight, User, Pill,
  FileText, Settings, BarChart3, ChevronRight,
  ArrowUpRight, Users, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Componentes de UI Soft Clinical (Imagen 1) ──────────────

function ClinicalTabs() {
  const tabs = ['Resumen', 'Tratamientos', 'Visitas', 'Medicamentos', 'Laboratorios', 'Genética'];
  return (
    <div className="flex flex-wrap gap-2 mb-12">
      {tabs.map((tab, i) => (
        <button key={tab} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          i === 0 ? 'bg-gmm-text text-white shadow-lg' : 'bg-gmm-card border border-gmm-border/40 text-gmm-text/40 hover:text-gmm-accent'
        }`}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function InsuredNode({ patient, index }: any) {
  const isRight = index % 2 === 0;
  const pct = Math.min((patient.consumed / patient.sublimit) * 100, 100);
  const statusColor = pct > 70 ? 'text-gmm-danger' : 'text-gmm-accent';

  return (
    <div className={`relative flex items-center justify-center gap-12 mb-24 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Targeta del Asegurado (Nivel Nodo "Cardiology" Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="w-full md:w-[48%]"
      >
        <div className="gmm-pill-card relative group flex items-center gap-8 py-6">
            <div className="w-24 h-24 rounded-full bg-gmm-bg/50 border-4 border-white shadow-inner flex items-center justify-center text-4xl shrink-0 overflow-hidden">
                {patient.role === 'Titular' ? '🧑' : patient.role === 'Esposo' ? '👨' : '👧'}
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="text-xl font-black text-gmm-text tracking-tighter leading-none">{patient.name}</h3>
                    <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-[0.2em] mt-1 italic">{patient.role}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Presión</p>
                    <p className="text-sm font-black text-gmm-text leading-none">120 / 80</p>
                 </div>
               </div>

               <div className="bg-gmm-bg/30 rounded-3xl p-4 border border-gmm-border/20 flex gap-6 items-center">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-gmm-text-muted uppercase mb-1">Padecimiento</p>
                    <p className="text-[11px] font-bold text-gmm-text uppercase truncate">{patient.padecimiento}</p>
                  </div>
                  <div className="w-px h-8 bg-gmm-border/30" />
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-gmm-text-muted uppercase mb-1">Consumo</p>
                    <p className={`text-[11px] font-black ${statusColor}`}>${(patient.consumed / 1000).toFixed(1)}k</p>
                  </div>
               </div>
            </div>
        </div>
      </motion.div>

      {/* Nodo Central (Amber junction) */}
      <div className="hidden md:flex w-14 h-14 bg-gmm-card border-[8px] border-gmm-bg rounded-full z-10 items-center justify-center shadow-lg">
        <div className="w-10 h-10 rounded-full bg-gmm-accent/10 flex items-center justify-center text-gmm-accent">
          <Pill size={16} />
        </div>
      </div>

      {/* Info Flotante Visual Indicator */}
      <div className={`hidden md:block w-[48%] ${isRight ? 'text-left' : 'text-right'}`}>
         <div className="inline-block p-4 bg-white/40 backdrop-blur-sm rounded-3xl border border-white shadow-sm">
           <svg width="120" height="30" viewBox="0 0 120 30" className="opacity-40">
              <path d="M0 15 L10 15 L15 5 L20 25 L25 15 L40 15 L45 5 L50 25 L55 15 L70 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gmm-accent animate-pulse" />
           </svg>
           <p className="text-[9px] font-bold text-gmm-text/30 uppercase tracking-[0.3em] mt-2">Monitoreo de Gasto Activo</p>
         </div>
      </div>

    </div>
  );
}

function GlobalKPI({ title, value, subtext, color = 'accent', progress }: any) {
  return (
    <div className="gmm-pill-card flex flex-col justify-between min-h-[160px]">
      <div>
        <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.3em] mb-1">{title}</p>
        <h2 className={`text-3xl font-black tracking-tighter ${color === 'red' ? 'text-gmm-danger' : 'text-gmm-text'}`}>
          {value}
        </h2>
      </div>
      
      <div className="w-full">
        {progress !== undefined && (
          <div className="h-2 w-full bg-gmm-text/5 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all duration-1000 ${color === 'red' ? 'bg-gmm-danger' : 'bg-gmm-accent'}`} style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="text-[10px] font-bold text-gmm-text-muted uppercase italic tracking-wider">{subtext}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/estado-cuenta').then(r => r.json()),
      fetch('/api/dashboard/metrics').then(r => r.json()),
    ]).then(([ec, met]) => {
      setData(ec);
      setMetrics(met);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gmm-bg flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
      </div>
    );
  }

  const kpis = metrics?.data?.kpis;
  const cards = data?.insuredCards || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-16 pb-20">
      
      {/* ── Section 0: Header & Tabs ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-gmm-text tracking-tighter mb-2">Timeline Clínico</h2>
          <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.4em]">Vista General de la Póliza MetLife</p>
        </div>
        <ClinicalTabs />
      </div>
      
      {/* ── Section 1: KPI Floating Nodes ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlobalKPI 
          title="Suma Asegurada Global" 
          value={`$${(kpis?.baseLimit / 1_000_000).toFixed(1)}M`} 
          subtext="Límite máximo por cobertura básica"
        />
        <GlobalKPI 
          title="Gasto Acumulado" 
          value={`$${(kpis?.consumed / 1_000_000).toFixed(2)}M`} 
          subtext={`${((kpis?.consumed / kpis?.baseLimit) * 100).toFixed(1)}% de la póliza`}
          color="red"
          progress={(kpis?.consumed / kpis?.baseLimit) * 100}
        />
        <GlobalKPI 
          title="Remanente" 
          value={`$${((kpis?.baseLimit - kpis?.consumed) / 1_000_000).toFixed(1)}M`} 
          subtext="Monto disponible para eventos"
          color="accent"
          progress={100 - (kpis?.consumed / kpis?.baseLimit) * 100}
        />
      </section>

      {/* ── Section 2: Timeline of Insured ── */}
      <section className="relative">
        <div className="text-center mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-gmm-text/30">Nodos de Asegurados</h2>
        </div>
        
        <div className="space-y-4">
          {cards.map((patient: any, i: number) => (
            <InsuredNode key={i} patient={patient} index={i} />
          ))}
        </div>
      </section>

      {/* ── Section 3: Summary & Control ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="gmm-pill-card">
          <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">Tendencia de Siniestros</h3>
          <div className="h-64 flex items-end gap-6 px-4">
             {[40, 60, 30, 90, 50, 70, 45].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    className="w-full bg-gmm-accent/20 rounded-full relative group overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-gmm-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <span className="text-[9px] font-bold text-gmm-text/20">M{i+1}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="gmm-pill-card">
           <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">Alertas de Gobernanza</h3>
           <div className="space-y-4">
              <div className="p-5 rounded-[2rem] bg-gmm-danger/10 border-l-[6px] border-gmm-danger flex items-center gap-4">
                 <Bell className="text-gmm-danger" size={20} />
                 <p className="text-[10px] font-black uppercase tracking-wider text-gmm-danger/80">
                   Alerta: Consumo crítico en el nodo 'Claudia Soto'
                 </p>
              </div>
              <div className="p-5 rounded-[2rem] bg-gmm-accent/10 border-l-[6px] border-gmm-accent flex items-center gap-4">
                 <Activity className="text-gmm-accent" size={20} />
                 <p className="text-[10px] font-black uppercase tracking-wider text-gmm-text/60">
                   Sistema de Auditoría Operativo: 4 trámites en validación
                 </p>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
