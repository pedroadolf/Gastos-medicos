'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Activity, Zap, Plus,
  TrendingDown, TrendingUp, Search, Calendar,
  Bell, ArrowRight, User, Pill,
  FileText, Settings, BarChart3, ChevronRight,
  ArrowUpRight, Users, CreditCard, Clock, CheckCircle2, AlertCircle, Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

// ─── Data Helpers ──────────────

const historicalData = [
  { month: 'Oct', consumed: 150000 },
  { month: 'Nov', consumed: 280000 },
  { month: 'Dic', consumed: 400000 },
  { month: 'Ene', consumed: 750000 },
  { month: 'Feb', consumed: 980000 },
  { month: 'Mar', consumed: 1250000 },
];

// ─── Componentes de UI Soft Clinical (Refined) ──────────────

function EventMonitorCard({ event, index }: any) {
  const pct = Math.min((event.consumed / event.sublimit) * 100, 100);
  const statusColor = event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger' : 
                      pct > 80 ? 'bg-gmm-danger' : 
                      pct > 50 ? 'bg-gmm-accent' : 'bg-green-500';
  
  const textColor = event.status === 'REQUERIMIENTO' ? 'text-gmm-danger' :
                    pct > 80 ? 'text-gmm-danger' : 
                    pct > 50 ? 'text-gmm-accent' : 'text-green-600';

  const initials = event.patientName.substring(0, 1) + (event.patientName === 'Sebastian' ? 'S' : event.patientName === 'Claudia' ? 'C' : 'G');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="gmm-pill-card relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-gmm-border/30 bg-white dark:bg-[#1A1A1A]"
    >
      {/* Patient Header (Image 1 Style) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gmm-bg flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm shrink-0">
          {event.patientPhoto ? (
            <img src={event.patientPhoto} alt={event.patientName} className="w-full h-full object-cover rounded-full" />
          ) : (
             <span className="text-xs font-black text-gmm-text uppercase">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
           <h3 className="text-sm font-black text-gmm-text truncate uppercase tracking-tight">{event.patientName} {event.patientName.charAt(0)}.</h3>
           <p className="text-[8px] font-black text-gmm-text-muted uppercase tracking-widest">{event.role} · {event.age || '45'} años</p>
        </div>
      </div>

      {/* Diagnosis Pill (Image 1 Style) */}
      <div className={`inline-flex px-4 py-1.5 rounded-full ${event.status === 'REQUERIMIENTO' ? 'bg-gmm-danger/10 text-gmm-danger' : 'bg-gmm-accent/10 text-gmm-accent'} mb-6 border border-current/20`}>
         <span className="text-[9px] font-black uppercase tracking-tight truncate max-w-[180px]">{event.diagnosis}</span>
      </div>

      {/* Numerical Data Monitor */}
      <div className="space-y-4 mb-6">
         <div className="flex justify-between items-end">
            <div>
               <p className="text-[7px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">Sub-límite {event.patientName === 'Pedro' ? 'Oncología' : 'General'}</p>
               <p className="text-xs font-black text-gmm-text tracking-tighter">${(event.consumed / 1000).toFixed(0)}k / ${(event.sublimit / 1000000).toFixed(1)}M</p>
            </div>
         </div>
         <div className="h-1.5 w-full bg-gmm-text/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              className={`h-full rounded-full ${statusColor}`} 
            />
         </div>
      </div>

      {/* Footer Status (Solid Green Bar logic from Image 1) */}
      <div className="space-y-3">
         <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
            <span className="text-gmm-text">Deducible Anual Cumplido</span>
            <span className="text-green-500">Full</span>
         </div>
         <div className="h-1 w-full bg-green-500 rounded-full" />
         
         <div className="flex justify-between items-center pt-2">
            <div className="flex flex-col">
               <span className="text-[7px] font-bold text-gmm-text-muted uppercase">Siniestros</span>
               <span className="text-[10px] font-black">{event.openClaims || 1} Abiertos</span>
            </div>
            <div className="flex flex-col text-right">
               <span className="text-[7px] font-bold text-gmm-text-muted uppercase">Coaseguro</span>
               <span className="text-[10px] font-black">$0</span>
            </div>
         </div>
      </div>

      <Link href={`/tramites?id=${event.claimId}`} className="w-full mt-6 py-2 rounded-xl border border-gmm-text/20 text-gmm-text text-[9px] font-black uppercase tracking-widest hover:bg-gmm-text hover:text-white transition-all flex items-center justify-center">
        Ver Detalle
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

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

  // Clinical Data Architecture
  const clinicalEvents = [
    {
      claimId: '01210200485-018',
      diagnosis: 'Enfermedad respiratoria aguda por 2019_nCoV',
      patientName: 'Pedro', patientPhoto: '/patients/pedro.png', role: 'Titular', age: '48',
      consumed: 1250000, sublimit: 3961725, deducible: 6602, status: 'OPERATIVO', openClaims: 2
    },
    {
      claimId: '03230261780-009',
      diagnosis: 'Diabetes mellitus no insulinodependiente',
      patientName: 'Pedro', patientPhoto: '/patients/pedro.png', role: 'Titular', age: '48',
      consumed: 450000, sublimit: 1651380, deducible: 3692, status: 'EN PROCESO'
    },
    {
      claimId: '02250211464-000',
      diagnosis: 'Seguimiento General / Requerimiento Info',
      patientName: 'Claudia', patientPhoto: '/patients/claudia.png', role: 'Esposa', age: '45',
      consumed: 9300, sublimit: 500000, deducible: 15000, status: 'REQUERIMIENTO'
    },
    {
      claimId: '042024-PED-001',
      diagnosis: 'Tratamiento Pediátrico / Respiratorias',
      patientName: 'Sebastian', patientPhoto: '/patients/sebastian.png', role: 'Hijo', age: '14',
      consumed: 85000, sublimit: 1000000, deducible: 10000, status: 'OPERATIVO'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 px-4">
      
      {/* ── Section 0: Main Clinical KPI Monitor ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Suma Asegurada', val: '$5.0M', sub: 'MXN total póliza', color: 'text-gmm-text' },
          { label: 'Consumido', val: '$1.2M', sub: '24% del total', color: 'text-gmm-danger' },
          { label: 'Disponible', val: '$3.8M', sub: '76% restante', color: 'text-green-500' },
          { label: 'Pendiente Reembolso', val: '$87k', sub: 'Trámites activos', color: 'text-gmm-text' },
        ].map((kpi, i) => (
          <div key={i} className="gmm-pill-card bg-white dark:bg-[#1A1A1A] p-6 border-none shadow-xl">
             <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-widest mb-1">{kpi.label}</p>
             <p className={`text-3xl font-black ${kpi.color} tracking-tighter`}>{kpi.val}</p>
             <p className="text-[9px] font-bold text-gmm-text-muted/60 uppercase mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Section 1: Consumption Anticipation Monitor ── */}
      <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] border-none shadow-2xl p-8">
         <div className="flex justify-between items-start mb-10">
            <div>
               <h2 className="text-2xl font-black text-gmm-text tracking-tighter uppercase mb-1">Consumption Velocity Monitor</h2>
               <p className="text-[10px] font-black text-gmm-text-muted uppercase tracking-[0.4em]">Predictive exhaustion analysis · Real-time slope</p>
            </div>
            <div className="bg-gmm-danger/10 border border-gmm-danger/20 px-4 py-2 rounded-2xl flex items-center gap-2">
               <TrendingUp size={16} className="text-gmm-danger" />
               <span className="text-[10px] font-black text-gmm-danger uppercase">Aceleración Detectada: +15% mensual</span>
            </div>
         </div>

         <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B22B21" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#B22B21" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#FFF' }}
                    itemStyle={{ color: '#FFAA00' }}
                  />
                  <Area type="monotone" dataKey="consumed" stroke="#B22B21" strokeWidth={4} fillOpacity={1} fill="url(#colorCons)" />
                  <XAxis dataKey="month" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* ── Section 2: Event-Based Monitor Grid ── */}
      <div className="space-y-6">
        <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em] flex items-center gap-3">ASEGURADOS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinicalEvents.map((event, i) => (
            <EventMonitorCard key={i} event={event} index={i} />
          ))}
        </div>
      </div>

      {/* ── Section 3: Alert Center 2.0 (Iconized) ── */}
      <div className="space-y-6">
         <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">ALERTAS Y ACCIÓN REQUERIDA</h3>
         <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gmm-danger/10 border border-gmm-danger/20 rounded-[2rem] text-gmm-danger">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-tight">
                 <span className="font-black">Pedro:</span> ha consumido el 75% del sub-límite oncológico. Quedan $250,000. **Riesgo de agotamiento en 2 ciclos más**.
               </p>
               <button className="ml-auto px-6 py-2 bg-gmm-danger text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all">Priorizar</button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gmm-accent/10 border border-gmm-accent/20 rounded-[2rem] text-gmm-accent">
               <Clock size={20} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-tight">
                 <span className="font-black">Siniestro #4521 (Ana):</span> vence plazo para subir facturación de fisioterapia en 3 días.
               </p>
               <button className="ml-auto px-6 py-2 bg-gmm-accent text-white text-[9px] font-black rounded-full uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
                 <Upload size={12} /> Subir Documento
               </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-green-600">
               <CheckCircle2 size={20} className="shrink-0" />
               <p className="text-[11px] font-black uppercase tracking-tight">
                 <span className="font-black">Sebastian:</span> se aprobó la pre-autorización para nebulizaciones ambulatorias del próximo trimestre.
               </p>
               <div className="ml-auto px-4 py-1.5 border border-green-500/30 rounded-full text-[8px] font-black">DETALLE</div>
            </div>
         </div>
      </div>

      {/* ── Section 4: Simplified Clinical Kanban (3 Columns) ── */}
      <div className="space-y-6">
         <h3 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.3em]">FLUJO DE SINIESTROS</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: Pendiente de tu parte */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gmm-danger uppercase mb-4 tracking-[0.2em] border-l-4 border-gmm-danger pl-3">Pendiente de tu parte</p>
               <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] p-5 border-l-4 border-gmm-danger">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-[9px] font-black text-gmm-text uppercase">Factura Lab X</p>
                     <span className="text-[7px] font-bold text-gmm-danger">RECHAZADO</span>
                  </div>
                  <p className="text-[8px] text-gmm-text-muted uppercase mb-4">Sin sello del hospital</p>
                  <button className="w-full py-2 bg-gmm-danger text-white text-[8px] font-black rounded-lg uppercase tracking-widest flex items-center justify-center gap-2">
                     <Upload size={10} /> Corregir y Subir
                  </button>
               </div>
            </div>

            {/* Col 2: En proceso Aseguradora */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gmm-accent uppercase mb-4 tracking-[0.2em] border-l-4 border-gmm-accent pl-3">En Proceso (MetLife)</p>
               <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] p-5 border-l-4 border-gmm-accent">
                  <p className="text-[9px] font-black text-gmm-text uppercase mb-1">Radioterapia Quimio</p>
                  <p className="text-[8px] text-gmm-text-muted uppercase">5 sesiones aprobadas · Verificando facturas</p>
                  <div className="mt-4 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-gmm-accent animate-pulse" />
                     <span className="text-[7px] font-bold uppercase text-gmm-text">Auditando</span>
                  </div>
               </div>
            </div>

            {/* Col 3: Resuelto */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-green-600 uppercase mb-4 tracking-[0.2em] border-l-4 border-green-600 pl-3">Resuelto</p>
               <div className="gmm-pill-card bg-white dark:bg-[#1A1A1A] p-5 border-l-4 border-green-600">
                  <p className="text-[9px] font-black text-gmm-text uppercase mb-1">Rehab Rodilla (Ana)</p>
                  <p className="text-[8px] text-green-600 uppercase font-black">¡Pagado! · $28,500</p>
                  <div className="mt-4 flex gap-2">
                     <div className="px-3 py-1 bg-green-500/10 text-green-600 text-[6px] font-black rounded-md">COMPROBANTE</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
