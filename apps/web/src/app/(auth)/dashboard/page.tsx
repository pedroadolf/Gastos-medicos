'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Activity, Heart, Zap, Plus,
  TrendingDown, TrendingUp, Search, Calendar,
  Bell, Sun, Moon, ArrowRight, User, Pill,
  FileText, Settings, BarChart3, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Componentes de UI Soft Clinical (Imagen 1 & .NuevoMenu.md) ──────────────

function GlobalKPI({ title, value, subtext, color = 'accent', progress }: any) {
  return (
    <div className="gmm-pill-card flex flex-col justify-between min-h-[160px]">
      <div>
        <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">{title}</p>
        <h2 className={`text-3xl font-black tracking-tighter ${color === 'red' ? 'text-gmm-danger' : 'text-gmm-text'}`}>
          {value}
        </h2>
      </div>
      
      <div className="w-full">
        {progress !== undefined && (
          <div className="h-2 w-full bg-gmm-border/30 rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all duration-1000 ${color === 'red' ? 'bg-gmm-danger' : 'bg-gmm-accent'}`} style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="text-[10px] font-bold text-gmm-text-muted uppercase italic tracking-wider">{subtext}</p>
      </div>
    </div>
  );
}

function InsuredCard({ patient }: any) {
  const pct = Math.min((patient.consumed / patient.sublimit) * 100, 100);
  const statusColor = pct > 70 ? 'text-gmm-danger' : 'text-gmm-accent';

  return (
    <div className="gmm-pill-card group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-3xl bg-gmm-border/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {patient.role === 'Titular' ? '🧑' : patient.role === 'Esposo' ? '👨' : patient.role === 'Hijo' ? '👦' : '👧'}
        </div>
        <div>
          <h3 className="text-lg font-black text-gmm-text tracking-tighter uppercase italic">{patient.name}</h3>
          <p className="text-[10px] font-bold text-gmm-text-muted uppercase tracking-widest">{patient.age} y · {patient.role}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-[1.5rem] bg-gmm-bg/40 border border-gmm-border/50">
          <p className="text-[9px] font-black text-gmm-text-muted uppercase mb-1">Diagnóstico Activo</p>
          <p className="text-xs font-bold text-gmm-text uppercase truncate">{patient.padecimiento}</p>
        </div>

        <div>
          <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 tracking-tighter">
            <span className="text-gmm-text-muted">Consumo de Sub-límite</span>
            <span className={statusColor}>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gmm-border/30 overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${pct > 70 ? 'bg-gmm-danger' : 'bg-gmm-accent'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[9px] font-medium text-gmm-text-muted mt-1.5 uppercase tracking-wider">
            ${(patient.consumed/1000).toFixed(0)}k / ${(patient.sublimit/1000).toFixed(0)}k
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${patient.deducible ? 'bg-gmm-success' : 'bg-gmm-accent'}`} />
                <span className="text-[10px] font-black text-gmm-text uppercase">{patient.deducible ? 'Deducible Cumplido' : 'En Proceso'}</span>
            </div>
            <span className="text-[10px] font-bold text-gmm-text-muted uppercase border-l border-gmm-border pl-3">
              {patient.siniestrosCount} Siniestros
            </span>
        </div>
      </div>

      <button className="mt-6 w-full py-3 bg-gmm-text text-white text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-gmm-accent hover:text-gmm-text transition-all duration-300">
        Ver Detalle del Expediente
      </button>
    </div>
  );
}

function KanbanColumn({ title, items, isRejected }: any) {
  return (
    <div className={`flex-1 min-w-[300px] p-6 rounded-[2.5rem] ${isRejected ? 'bg-gmm-danger/5 border border-gmm-danger/20' : 'bg-gmm-border/20 border border-gmm-border'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${isRejected ? 'text-gmm-danger' : 'text-gmm-text-muted'}`}>{title}</h3>
        <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black shadow-sm">{items.length}</span>
      </div>

      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="bg-white border border-gmm-border p-4 rounded-3xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-gmm-text uppercase leading-tight group-hover:text-gmm-accent transition-colors">{item.nombre}</p>
                <ChevronRight size={14} className="text-gmm-border group-hover:text-gmm-accent" />
            </div>
            <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-wider">
              {item.tipo?.replace('_', ' ')} • {new Date(item.fecha).toLocaleDateString('es-MX', { month: 'short', day: '2-digit' })}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <div className="h-32 rounded-3xl border-2 border-dashed border-gmm-border/50 flex items-center justify-center text-[10px] font-black text-gmm-text-muted uppercase">
            Sin Siniestros
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────

export default function RedesignedDashboard() {
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
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 border-t-4 border-gmm-accent rounded-full"
          />
          <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.4em]">Cargando Expedientes...</p>
        </div>
      </div>
    );
  }

  const kpis = metrics?.data?.kpis;
  const cards = data?.insuredCards || [];
  const kanban = data?.kanban || {};

  return (
    <div className="min-h-screen bg-transparent text-gmm-text pb-24 font-plus-jakarta selection:bg-gmm-accent/30 overflow-x-hidden">
      
      <main className="max-w-[1500px] mx-auto pt-12 px-8 space-y-12">
        
        {/* ── Section 1: KPIs Globales ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlobalKPI 
            title="Suma Asegurada Total" 
            value={`$${(kpis?.baseLimit / 1_000_000).toFixed(1)}M`} 
            subtext="Límite por cobertura básica activo"
          />
          <GlobalKPI 
            title="Suma Consumida" 
            value={`$${(kpis?.consumed / 1_000_000).toFixed(2)}M`} 
            subtext={`${((kpis?.consumed / kpis?.baseLimit) * 100).toFixed(1)}% del límite utilizado`}
            color="red"
            progress={(kpis?.consumed / kpis?.baseLimit) * 100}
          />
          <GlobalKPI 
            title="Suma Disponible" 
            value={`$${((kpis?.baseLimit - kpis?.consumed) / 1_000_000).toFixed(1)}M`} 
            subtext="Monto restante disponible"
            color="accent"
            progress={100 - (kpis?.consumed / kpis?.baseLimit) * 100}
          />
        </section>

        {/* ── Section 2: Cards Individuales ── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gmm-text-muted">Estado Individual Asegurados</h2>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-gmm-text-muted">
                    <div className="w-2 h-2 rounded-full bg-gmm-accent" /> Consumo Normal
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-gmm-text-muted">
                    <div className="w-2 h-2 rounded-full bg-gmm-danger" /> Consumo Alto
                </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((patient: any, i: number) => (
              <InsuredCard key={i} patient={patient} />
            ))}
          </div>
        </section>

        {/* ── Section 3: Kanban ── */}
        <section className="space-y-6">
          <div className="px-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gmm-text-muted">Tubería de Siniestros Activos</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar no-scrollbar-at-mobile">
            <KanbanColumn title="📋 En Trámite" items={kanban.en_tramite || []} />
            <KanbanColumn title="✅ Pre-autorizados" items={kanban.pre_autorizados || []} />
            <KanbanColumn title="💰 En Pago" items={kanban.en_pago || []} />
            <KanbanColumn title="❌ Rechazados" items={kanban.rechazados || []} isRejected />
          </div>
        </section>

        {/* ── Section 4: Financiero & Alertas ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 gmm-pill-card">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gmm-text-muted mb-8">Desglose Financiero de Gasto</h2>
              <div className="space-y-8">
                  {['Hospitalización', 'Medicamentos', 'Honorarios', 'Estudios'].map((cat) => (
                    <div key={cat}>
                        <div className="flex justify-between items-baseline mb-2">
                             <p className="text-xs font-bold uppercase">{cat}</p>
                             <p className="text-[10px] font-black text-gmm-text-muted">$0.0k</p>
                        </div>
                        <div className="h-6 w-full bg-gmm-border/20 rounded-2xl overflow-hidden relative">
                            <div className="h-full bg-gmm-accent w-[0%]" />
                            <span className="absolute inset-0 flex items-center px-4 text-[9px] font-black text-gmm-text-muted uppercase">Sin Datos Consolidados</span>
                        </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="gmm-pill-card space-y-6">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gmm-text-muted mb-4 text-center">Centro de Control</h2>
              <div className="space-y-3">
                  <div className="p-4 rounded-3xl bg-gmm-danger/10 border-l-[6px] border-gmm-danger flex items-center gap-4">
                      <Bell size={18} className="text-gmm-danger shrink-0" />
                      <p className="text-[10px] font-bold uppercase leading-snug">Claudia: Consumo de Oncología al 75% del sub-límite</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-gmm-accent/10 border-l-[6px] border-gmm-accent flex items-center gap-4">
                      <Calendar size={18} className="text-gmm-accent shrink-0" />
                      <p className="text-[10px] font-bold uppercase leading-snug">Vencimiento Factura #4521 en 3 días</p>
                  </div>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-gmm-border rounded-3xl text-[9px] font-black uppercase tracking-widest text-gmm-text-muted hover:border-gmm-accent hover:text-gmm-accent transition-colors">
                  Generar Reporte Consolidado
              </button>
            </div>
        </section>

      </main>
    </div>
  );
}
