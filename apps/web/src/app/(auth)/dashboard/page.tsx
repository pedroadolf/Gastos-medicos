'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Activity, Zap, Plus,
  TrendingDown, TrendingUp, Search, Calendar,
  Bell, ArrowRight, User, Pill,
  FileText, Settings, BarChart3, ChevronRight,
  ArrowUpRight, Users, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Componentes de UI Soft Clinical (Event-Based Monitor) ──────────────

function EventMonitorCard({ event, index }: any) {
  const pct = Math.min((event.consumed / event.sublimit) * 100, 100);
  const statusColor = event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger' : 
                      pct > 80 ? 'bg-gmm-danger' : 
                      pct > 50 ? 'bg-gmm-accent' : 'bg-green-500';
  
  const textColor = event.status === 'REQUERIMIENTO' ? 'text-gmm-danger' :
                    pct > 80 ? 'text-gmm-danger' : 
                    pct > 50 ? 'text-gmm-accent' : 'text-green-600';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="gmm-pill-card relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-gmm-border/30 bg-white dark:bg-zinc-900/40"
    >
      {/* Siniestro ID Badge */}
      <div className="absolute top-4 right-4">
        <div className={`px-2 py-1 rounded-lg text-[8px] font-black tracking-widest border ${event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger/10 border-gmm-danger text-gmm-danger' : 'bg-gmm-accent/10 border-gmm-accent/30 text-gmm-accent'}`}>
          #{event.claimId}
        </div>
      </div>

      {/* Main Diagnosis Title */}
      <div className="mb-6 mt-2">
        <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-[0.3em] mb-1">Diagnostic Monitor</p>
        <h3 className="text-sm xl:text-base font-black text-gmm-text tracking-tighter uppercase leading-tight min-h-[2.5rem]">
          {event.diagnosis}
        </h3>
      </div>

      {/* Patient Identity Badge (Tiffany Woodward Style Context) */}
      <div className="flex items-center gap-3 mb-6 p-2 bg-gmm-bg/30 rounded-2xl border border-gmm-border/10">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-white dark:border-zinc-800 bg-gmm-bg shrink-0">
          <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gmm-text uppercase tracking-tight truncate">{event.patientName}</p>
          <p className="text-[7px] font-black text-gmm-text-muted uppercase tracking-widest">{event.role}</p>
        </div>
        <div className="ml-auto flex gap-1">
           <div className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`} />
        </div>
      </div>

      {/* Consumption Tracker */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
           <div className="space-y-1">
             <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest">Suma Asegurada</p>
             <p className="text-xs font-black text-gmm-text">${event.sublimit.toLocaleString()}</p>
           </div>
           <div className="text-right space-y-1">
             <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest">Consumo</p>
             <p className={`text-xs font-black ${textColor}`}>${event.consumed.toLocaleString()}</p>
           </div>
        </div>
        <div className="h-1.5 w-full bg-gmm-text/5 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            className={`h-full rounded-full ${statusColor}`} 
          />
        </div>
      </div>

      {/* Technical Specs Footer */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gmm-border/10">
        <div>
          <p className="text-[7px] font-black text-gmm-text-muted uppercase mb-1">Deducible</p>
          <p className="text-[9px] font-black text-gmm-text uppercase">${event.deducible.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[7px] font-black text-gmm-text-muted uppercase mb-1">Status</p>
          <p className={`text-[9px] font-black uppercase ${textColor}`}>{event.status}</p>
        </div>
      </div>

      {/* Action */}
      <Link href={`/tramites?id=${event.claimId}`} className="w-full mt-6 py-2.5 rounded-xl bg-gmm-text text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gmm-accent transition-all flex items-center justify-center gap-2 group">
        Analizar Expediente
        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  // ─── Real Clinical Events Data (Extracted from PDFs) ───
  const clinicalEvents = [
    {
      claimId: '01210200485-018',
      diagnosis: 'Enfermedad respiratoria aguda por 2019_nCoV',
      patientName: 'Pedro',
      patientPhoto: '/patients/pedro.png',
      role: 'Titular',
      consumed: 1250000,
      sublimit: 3961725,
      deducible: 6602,
      status: 'OPERATIVO'
    },
    {
      claimId: '03230261780-009',
      diagnosis: 'Diabetes mellitus no insulinodependiente',
      patientName: 'Pedro',
      patientPhoto: '/patients/pedro.png',
      role: 'Titular',
      consumed: 450000,
      sublimit: 1651380,
      deducible: 3692,
      status: 'EN PROCESO'
    },
    {
      claimId: '02250211464-000',
      diagnosis: 'Seguimiento General / Requerimiento Info',
      patientName: 'Claudia',
      patientPhoto: '/patients/claudia.png',
      role: 'Esposa',
      consumed: 9300,
      sublimit: 500000,
      deducible: 15000,
      status: 'REQUERIMIENTO'
    },
    {
      claimId: '042024-PED-001',
      diagnosis: 'Tratamiento Pediátrico / Respiratorias',
      patientName: 'Sebastian',
      patientPhoto: '/patients/sebastian.png',
      role: 'Hijo',
      consumed: 85000,
      sublimit: 1000000,
      deducible: 10000,
      status: 'OPERATIVO'
    },
    {
      claimId: 'PREV-2024-MIA',
      diagnosis: 'Control Preventivo Anual',
      patientName: 'Mia',
      patientPhoto: '/patients/mia.png',
      role: 'Hija',
      consumed: 0,
      sublimit: 200000,
      deducible: 0,
      status: 'N/A'
    }
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

  // Calculate Aggregates for Charts
  const totalSA = 5000000; // Póliza Base
  const totalConsumed = clinicalEvents.reduce((acc, curr) => acc + curr.consumed, 0);
  
  const distribution = clinicalEvents.reduce((acc: any, curr) => {
    acc[curr.patientName] = (acc[curr.patientName] || 0) + curr.consumed;
    return acc;
  }, {});

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4">
      
      {/* ── Section 0: Clinical Global View (Folder Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sumas Aseguradas (Main Monitor) */}
        <div className="lg:col-span-2 gmm-pill-card bg-white dark:bg-zinc-900/40 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gmm-accent/10 rounded-full border border-gmm-accent/20">
              <Zap size={14} className="text-gmm-accent anim-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gmm-accent uppercase tracking-widest leading-none">Póliza Exceso: M172 1011</span>
                <span className="text-[7px] font-bold text-gmm-accent/60 uppercase tracking-widest mt-1">Deducible: $2,000,000 · SA: Sin Límite</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-4 mb-2">
               <div className="w-2 h-8 bg-gmm-accent rounded-full" />
               <h2 className="text-3xl font-black text-gmm-text tracking-tighter uppercase">Clinical Event Monitor</h2>
            </div>
            <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.4em] ml-6">Póliza MetLife Platinum · Multi-Event Architecture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ml-6">
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Capacidad Póliza Base</p>
              <p className="text-3xl font-black text-gmm-text tracking-tighter">${totalSA.toLocaleString()}</p>
              <div className="h-1 w-20 bg-gmm-text/10 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Consumo Global Ejecutado</p>
              <p className="text-3xl font-black text-gmm-danger tracking-tighter">${totalConsumed.toLocaleString()}</p>
              <div className="h-1 w-20 bg-gmm-danger/20 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-widest">Saldo Disponible</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-green-500 tracking-tighter">${(totalSA - totalConsumed).toLocaleString()}</p>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="h-1 w-20 bg-green-500/20 rounded-full" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gmm-border/20 flex items-center justify-between ml-6">
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-gmm-bg rounded-xl border border-gmm-border/50 text-[9px] font-black uppercase tracking-widest text-gmm-text-muted">
                 Deducible Base: Cubierto
               </div>
               <div className="px-4 py-2 bg-gmm-bg rounded-xl border border-gmm-border/50 text-[9px] font-black uppercase tracking-widest text-gmm-text-muted">
                 Coaseguro: 10% Tope
               </div>
            </div>
            <Link href="/tramites" className="flex items-center gap-2 group-hover:text-gmm-accent transition-colors">
              <span className="text-[10px] font-black uppercase tracking-widest">Estado de Cuenta Siniestros</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Expense Distribution (Donut Chart) */}
        <div className="gmm-pill-card flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-black text-gmm-text-muted uppercase tracking-widest mb-8">Relevancia por Asegurado</h3>
            
            <div className="relative w-48 h-48 mb-8">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-bg" strokeWidth="4" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-danger" strokeWidth="4" strokeDasharray="70 100" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-gmm-accent" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-70" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray="8 100" strokeDashoffset="-90" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-green-500" strokeWidth="4" strokeDasharray="2 100" strokeDashoffset="-98" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gmm-text">100%</span>
                  <span className="text-[8px] font-bold text-gmm-text-muted uppercase tracking-widest">Analizado</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
               {[
                 { name: 'Pedro', color: 'bg-gmm-danger' },
                 { name: 'Claudia', color: 'bg-gmm-accent' },
                 { name: 'Sebastian', color: 'bg-blue-500' },
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

      {/* ── Section 1: Event-Based Grid ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em] flex items-center gap-3">
             <Activity size={18} className="text-gmm-accent" />
             Active Clinical Monitors
           </h3>
           <Link href="/nuevo-tramite" className="px-6 py-2 bg-gmm-accent text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gmm-accent/20 flex items-center gap-2">
             <Plus size={14} />
             Registrar Siniestro
           </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clinicalEvents.map((event, i) => (
            <EventMonitorCard key={i} event={event} index={i} />
          ))}
        </div>
      </div>

      {/* ── Section 2: Critical Alerts (Clinical OS) ── */}
      <div className="gmm-pill-card bg-gmm-white/50 backdrop-blur-md">
         <div className="flex justify-between items-center mb-8">
           <h3 className="text-[10px] font-black text-gmm-text uppercase tracking-widest">Central de Diagnóstico (Alertas del Sistema)</h3>
           <span className="px-3 py-1 bg-gmm-danger text-white text-[9px] font-black rounded-full">1 CRÍTICO · 1 PENDIENTE</span>
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
                     <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight group-hover:text-gmm-danger transition-colors">Siniestro #02250211464-000</p>
                     <p className="text-[9px] font-bold text-gmm-danger uppercase mt-1">Requerimiento: Información Clínica Pendiente</p>
                  </div>
               </div>
               <Link href="/nuevo-tramite" className="px-6 py-2 bg-gmm-danger text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gmm-danger/20">Responder</Link>
            </motion.div>

            <motion.div 
              whileHover={{ x: 10 }}
              className="p-6 rounded-[2.5rem] bg-gmm-accent/5 border border-gmm-accent/20 flex items-center gap-4 cursor-pointer group"
            >
               <div className="w-12 h-12 rounded-full bg-gmm-accent/10 flex items-center justify-center text-gmm-accent shadow-inner">
                  <Zap size={20} />
               </div>
               <div>
                  <p className="text-[11px] font-black text-gmm-text uppercase tracking-tight group-hover:text-gmm-accent transition-colors">Cruce de Póliza Exceso M172 1011</p>
                  <p className="text-[9px] font-bold text-gmm-text-muted uppercase mt-1 italic">Vínculo Automático: Operativo para Siniestro #01210200485</p>
               </div>
            </motion.div>
         </div>
      </div>

    </div>
  );
}
