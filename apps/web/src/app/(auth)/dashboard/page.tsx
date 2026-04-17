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

function InsuredNode({ patient, index }: any) {
  const isRight = index % 2 === 0;
  const pct = Math.min((patient.consumed / patient.sublimit) * 100, 100);
  const statusColor = pct > 70 ? 'text-gmm-danger' : 'text-gmm-accent';

  return (
    <div className={`relative flex items-center justify-center gap-12 mb-20 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Targeta del Asegurado (Nivel Nodo) */}
      <motion.div 
        initial={{ opacity: 0, x: isRight ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="w-full md:w-[45%]"
      >
        <div className="gmm-pill-card group">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-3xl bg-gmm-text/5 flex items-center justify-center text-3xl">
                    {patient.role === 'Titular' ? '🧑' : patient.role === 'Esposo' ? '👨' : '👧'}
                </div>
                <div>
                   <h3 className="text-xl font-black text-gmm-text tracking-tighter uppercase italic">{patient.name}</h3>
                   <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-widest">{patient.role} · Póliza VIP</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-gmm-bg/30 border border-gmm-text/5">
                    <p className="text-[9px] font-black text-gmm-text-muted uppercase mb-1">Diagnóstico en Seguimiento</p>
                    <p className="text-xs font-bold text-gmm-text uppercase">{patient.padecimiento}</p>
                </div>

                <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span className="text-gmm-text-muted">Desgaste de Sub-límite</span>
                        <span className={statusColor}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gmm-text/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${pct > 70 ? 'bg-gmm-danger' : 'bg-gmm-accent'}`} style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>

            <button className="mt-8 w-full py-4 bg-gmm-text text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gmm-accent transition-all duration-300">
                Ver Historial Clínico
            </button>
        </div>
      </motion.div>

      {/* Nodo Central (Eje Timeline) */}
      <div className="hidden md:flex w-14 h-14 bg-white border-[10px] border-gmm-bg rounded-full z-10 items-center justify-center shadow-lg">
        <div className={`w-3 h-3 rounded-full ${pct > 70 ? 'bg-gmm-danger' : 'bg-gmm-accent'}`} />
      </div>

      {/* Info Flotante Complementaria */}
      <div className={`hidden md:block w-[45%] ${isRight ? 'text-left' : 'text-right'}`}>
         <h4 className="text-[11px] font-black text-gmm-text uppercase tracking-[0.4em] mb-3">Resumen del Estado</h4>
         <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gmm-text-muted">
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${patient.deducibleStatus === 'cumplido' ? 'bg-gmm-success' : 'bg-gmm-accent'}`} />
                Deducible {patient.deducibleStatus === 'cumplido' ? 'Ok' : 'En proceso'}
            </div>
            <span>•</span>
            <span>{patient.openSiniestrosCount} Siniestros Abiertos</span>
         </div>
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
      <div className="min-h-screen bg-folder flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
      </div>
    );
  }

  const kpis = metrics?.data?.kpis;
  const cards = data?.insuredCards || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-24 pb-20">
      
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
