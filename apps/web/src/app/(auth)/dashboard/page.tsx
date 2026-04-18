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
      
      {/* ── Section 0: Clinical Header (Monitor Mode) ── */}
      <div className="gmm-pill-card bg-gmm-text border-none py-8 px-10 flex flex-wrap justify-between items-center gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gmm-accent rounded-2xl">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-white text-xl font-black tracking-tighter uppercase italic">Póliza #GMM-98765</h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Estatus: Activa · MetLife Platinum</p>
          </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-center">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Suma Total</p>
            <p className="text-white text-lg font-black">$5.0M</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Disponible</p>
            <p className="text-gmm-accent text-lg font-black">$3.8M</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Deducible Gral</p>
            <div className="flex items-center gap-2 text-green-400 font-black">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              CUMPLIDO
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1: 4-Unit Insured Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insuredData.map((patient, i) => (
          <InsuredCard key={i} patient={patient} index={i} />
        ))}
      </div>

      {/* ── Section 2: Critical Alerts & Expense Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Alerts Section (Siniestros en Peligro) */}
        <div className="lg:col-span-2 gmm-pill-card bg-gmm-white/50 backdrop-blur-md">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest">Siniestros en Peligro</h3>
             <span className="px-3 py-1 bg-gmm-danger text-white text-[9px] font-black rounded-full">2 CRÍTICOS</span>
           </div>
           
           <div className="space-y-4">
              <motion.div 
                whileHover={{ x: 10 }}
                className="p-5 rounded-[2rem] bg-gmm-danger/5 border border-gmm-danger/20 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gmm-danger/10 flex items-center justify-center text-gmm-danger">
                       <FileText size={18} />
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight">Factura Quimioterapia #FQ-991</p>
                       <p className="text-[9px] font-bold text-gmm-danger uppercase mt-1">Rechazada: Falta Sello Digital</p>
                    </div>
                 </div>
                 <button className="px-6 py-2 bg-gmm-danger text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all">Subir Documento</button>
              </motion.div>

              <motion.div 
                whileHover={{ x: 10 }}
                className="p-5 rounded-[2rem] bg-gmm-accent/5 border border-gmm-accent/20 flex items-center gap-4 cursor-pointer"
              >
                 <div className="w-10 h-10 rounded-full bg-gmm-accent/10 flex items-center justify-center text-gmm-accent">
                    <Calendar size={18} />
                 </div>
                 <div>
                    <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight">Vencimiento de Pre-autorización</p>
                    <p className="text-[9px] font-bold text-gmm-text-muted uppercase mt-1 italic">Vence en 48 horas · Cirugía Ana</p>
                 </div>
              </motion.div>
           </div>
        </div>

        {/* Expense Distribution Visualizer */}
        <div className="gmm-pill-card flex flex-col justify-between">
           <div>
              <h3 className="text-sm font-black text-gmm-text uppercase tracking-widest mb-8">Distribución de Gastos</h3>
              <div className="space-y-6">
                 {[
                   { name: 'Juan', pct: 60, color: 'bg-gmm-danger' },
                   { name: 'Ana', pct: 25, color: 'bg-gmm-accent' },
                   { name: 'Luis', pct: 10, color: 'bg-blue-500' },
                   { name: 'Mia', pct: 5, color: 'bg-green-500' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span>{item.name}</span>
                       <span className="text-gmm-text-muted">{item.pct}%</span>
                     </div>
                     <div className="h-4 w-full bg-gmm-bg rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          className={`h-full ${item.color} rounded-full`} 
                        />
                     </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="mt-8 p-4 bg-gmm-bg/30 rounded-3xl border border-gmm-border/10">
              <p className="text-[9px] font-bold text-gmm-text/40 leading-relaxed text-center uppercase tracking-widest">
                La distribución representa el impacto acumulado de siniestros sobre la póliza global.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
}

    </div>
  );
}
