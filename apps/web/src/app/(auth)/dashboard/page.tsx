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

// ─── Componentes de UI Soft Clinical (Imagen 1) ──────────────

function InsuredCard({ patient, index }: any) {
  const pct = Math.min((patient.consumed / patient.sublimit) * 100, 100);
  const statusColor = pct > 80 ? 'bg-gmm-danger' : pct > 50 ? 'bg-gmm-accent' : 'bg-green-500';
  const textColor = pct > 80 ? 'text-gmm-danger' : pct > 50 ? 'text-gmm-accent' : 'text-green-600';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="gmm-pill-card relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-gmm-border/30"
    >
      {/* Role Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gmm-bg/50 flex items-center justify-center text-2xl shadow-inner">
            {patient.icon}
          </div>
          <div>
            <h3 className="text-lg font-black text-gmm-text tracking-tighter uppercase">{patient.name}</h3>
            <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-[0.2em]">{patient.role} · {patient.age} Años</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gmm-bg transition-colors">
          <ChevronRight size={18} className="text-gmm-text-muted" />
        </button>
      </div>

      {/* Diagnosis Section */}
      <div className="bg-gmm-bg/30 rounded-[2rem] p-5 mb-6 border border-gmm-border/20">
        <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">Padecimiento Crítico</p>
        <p className="text-xs font-black text-gmm-text uppercase truncate">{patient.padecimiento}</p>
      </div>

      {/* Sub-limit Tracker */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Sub-límite</p>
          <p className={`text-[10px] font-black ${textColor}`}>
            ${(patient.consumed / 1000).toFixed(0)}k / ${(patient.sublimit / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="h-2 w-full bg-gmm-text/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            className={`h-full rounded-full ${statusColor}`} 
          />
        </div>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gmm-bg/20 rounded-2xl border border-gmm-border/10">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Deducible</p>
          <p className="text-[10px] font-black text-gmm-text uppercase">{patient.deducible}</p>
        </div>
        <div className="p-3 bg-gmm-bg/20 rounded-2xl border border-gmm-border/10">
          <p className="text-[8px] font-black text-gmm-text-muted uppercase mb-1">Siniestros</p>
          <p className="text-[10px] font-black text-gmm-text uppercase">{patient.openClaims} Abiertos</p>
        </div>
      </div>

      {/* Action */}
      <button className="w-full mt-6 py-3 rounded-full bg-gmm-text text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gmm-accent transition-all">
        Ver Detalle Clínico
      </button>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Datos Mock basados en el requerimiento exacto para el efecto "WOW"
  const insuredData = [
    { name: 'Juan', role: 'Titular', age: 45, icon: '🧑', padecimiento: 'Tumor Cerebral', consumed: 750000, sublimit: 1000000, deducible: 'Cumplido', openClaims: 2 },
    { name: 'Ana', role: 'Esposa', age: 42, icon: '👩', padecimiento: 'Reemplazo Rodilla', consumed: 300000, sublimit: 500000, deducible: 'En proceso', openClaims: 1 },
    { name: 'Luis', role: 'Hijo 1', age: 12, icon: '👦', padecimiento: 'Asma Severo', consumed: 50000, sublimit: 200000, deducible: 'Cumplido', openClaims: 1 },
    { name: 'Mia', role: 'Hija 2', age: 8, icon: '👧', padecimiento: 'Preventivo', consumed: 0, sublimit: 1, deducible: 'N/A', openClaims: 0 },
  ];

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gmm-bg flex items-center justify-center">
         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4">
      
      {/* ── Section 0: Clinical Global View (Folder Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sumas Aseguradas (Main Monitor) */}
        <div className="lg:col-span-2 gmm-pill-card bg-white dark:bg-black/40 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gmm-accent/10 rounded-full border border-gmm-accent/20">
              <Zap size={14} className="text-gmm-accent anim-pulse" />
              <span className="text-[10px] font-black text-gmm-accent uppercase tracking-widest">Póliza Exceso: #EX-554 Active</span>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-black text-gmm-text tracking-tighter uppercase mb-1">Global Health Monitor</h2>
            <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.4em]">Poliza MetLife Platinum · V12 Series</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Suma Asegurada Total</p>
              <p className="text-3xl font-black text-gmm-text tracking-tighter">$5,000,000</p>
              <div className="h-1 w-20 bg-gmm-text/10 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Consumo Acumulado</p>
              <p className="text-3xl font-black text-gmm-danger tracking-tighter">$1,200,000</p>
              <div className="h-1 w-20 bg-gmm-danger/20 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Monto Disponible</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-green-500 tracking-tighter">$3,800,000</p>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="h-1 w-20 bg-green-500/20 rounded-full" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gmm-border/20 flex items-center justify-between">
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-gmm-bg rounded-xl border border-gmm-border/50 text-[9px] font-black uppercase tracking-widest text-gmm-text-muted">
                 Deducible: Cubierto
               </div>
               <div className="px-4 py-2 bg-gmm-bg rounded-xl border border-gmm-border/50 text-[9px] font-black uppercase tracking-widest text-gmm-text-muted">
                 Coaseguro: 10% Tope
               </div>
            </div>
            <button className="flex items-center gap-2 group-hover:text-gmm-accent transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest">Edo de Cuenta Detallado</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Expense Distribution (Donut Chart) */}
        <div className="gmm-pill-card flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-black text-gmm-text-muted uppercase tracking-widest mb-8">Distribución por Asegurado</h3>
            
            <div className="relative w-48 h-48 mb-8">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-bg" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-danger" strokeWidth="4" strokeDasharray="60 100" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-accent" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-60" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-85" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-green-500" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-95" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gmm-text">100%</span>
                  <span className="text-[8px] font-bold text-gmm-text-muted uppercase tracking-widest">Consumo</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
               {[
                 { name: 'Juan', color: 'bg-gmm-danger' },
                 { name: 'Ana', color: 'bg-gmm-accent' },
                 { name: 'Luis', color: 'bg-blue-500' },
                 { name: 'Mia', color: 'bg-green-500' }
               ].map(item => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                   <span className="text-[9px] font-black text-gmm-text uppercase tracking-widest">{item.name}</span>
                 </div>
               ))}
            </div>
        </div>

      </div>

      {/* ── Section 1: 4-Unit Insured Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insuredData.map((patient, i) => (
          <InsuredCard key={i} patient={patient} index={i} />
        ))}
      </div>

      {/* ── Section 2: Critical Alerts ── */}
      <div className="gmm-pill-card bg-gmm-white/50 backdrop-blur-md">
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-[10px] font-black text-gmm-text uppercase tracking-widest">Diagnóstico de Siniestros (Alertas del OS)</h3>
           <span className="px-3 py-1 bg-gmm-danger text-white text-[9px] font-black rounded-full">2 CRÍTICOS</span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ x: 10 }}
              className="p-6 rounded-[2.5rem] bg-gmm-danger/5 border border-gmm-danger/20 flex flex-wrap items-center justify-between gap-4 cursor-pointer group"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gmm-danger/10 flex items-center justify-center text-gmm-danger shadow-inner">
                     <FileText size={20} />
                  </div>
                  <div>
                     <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight group-hover:text-gmm-danger transition-colors">Factura Quimioterapia #FQ-991</p>
                     <p className="text-[9px] font-bold text-gmm-danger uppercase mt-1">Rechazada: Falta Sello Digital</p>
                  </div>
               </div>
               <button className="px-6 py-2 bg-gmm-danger text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gmm-danger/20">Subir XML</button>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="p-6 rounded-[2.5rem] bg-gmm-accent/5 border border-gmm-accent/20 flex items-center gap-4 cursor-pointer group"
            >
               <div className="w-12 h-12 rounded-full bg-gmm-accent/10 flex items-center justify-center text-gmm-accent shadow-inner">
                  <Calendar size={20} />
               </div>
               <div>
                  <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight group-hover:text-gmm-accent transition-colors">Vencimiento Vigencia Cirugía</p>
                  <p className="text-[9px] font-bold text-gmm-text-muted uppercase mt-1 italic">Vence en 48 horas · Hospital Ángeles</p>
               </div>
            </motion.div>
         </div>
      </div>

    </div>
  );
}
