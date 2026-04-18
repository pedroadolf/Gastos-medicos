'use client';

import { 
  TrendingUp, TrendingDown, Activity, 
  BarChart3, PieChart, Info, ArrowUpRight, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

function MetricNode({ title, value, subtext, trend, isRight }: any) {
  return (
    <div className={`relative flex items-center justify-center gap-12 mb-24 ${isRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      
      {/* Floating Chart/Metric */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="w-full md:w-[48%]"
      >
        <div className="gmm-pill-card group border-gmm-border/30">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gmm-text-muted mb-1">{title}</p>
              <h3 className="text-3xl font-black text-gmm-text tracking-tighter">{value}</h3>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
              trend === 'up' ? 'bg-gmm-danger/10 text-gmm-danger' : 'bg-gmm-success/10 text-gmm-success'
            }`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend === 'up' ? 'Aumento' : 'Optimizado'}
            </div>
          </div>

          {/* SVG Area Chart (Clinical curve style) using theme variables */}
          <div className="h-40 w-full relative group">
            <svg viewBox="0 0 200 60" className="w-full h-full drop-shadow-sm overflow-visible">
                <defs>
                   <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--gmm-accent)', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--gmm-accent)', stopOpacity: 0 }} />
                   </linearGradient>
                </defs>
                <motion.path 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0 50 Q 25 45, 50 20 T 100 35 T 150 10 T 200 30" 
                  fill="none" 
                  stroke="var(--gmm-accent)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <path d="M0 50 Q 25 45, 50 20 T 100 35 T 150 10 T 200 30 V 60 H 0 Z" fill={`url(#grad-${title.replace(/\s+/g, '-')})`} />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest opacity-50">
              <span>Ago</span><span>Set</span><span>Oct</span><span>Nov</span><span>Dic</span>
            </div>
          </div>

          <p className="mt-6 text-[11px] font-medium text-gmm-text-muted uppercase tracking-widest leading-relaxed">
            {subtext}
          </p>
        </div>
      </motion.div>

      {/* Axis Connector */}
      <div className="hidden md:flex w-14 h-14 bg-gmm-card border-[8px] border-gmm-bg rounded-full z-10 items-center justify-center shadow-lg">
        <Activity size={18} className="text-gmm-accent animate-pulse" />
      </div>

      {/* Side Label */}
      <div className={`hidden md:block w-[48%] ${isRight ? 'text-left' : 'text-right'}`}>
         <h4 className="text-[12px] font-black text-gmm-text uppercase tracking-[0.4em] mb-3 italic">Indicador de Rendimiento</h4>
         <div className="w-12 h-1 bg-gmm-accent/20 rounded-full mb-4 inline-block"></div>
         <p className="text-[11px] font-bold text-gmm-text-muted uppercase tracking-[0.2em] max-w-xs ml-auto">
           Métrica analizada por el motor de gobernanza en tiempo real.
         </p>
      </div>
    </div>
  );
}

export default function ObservabilidadPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-20">
        <h2 className="text-4xl font-black tracking-tighter text-gmm-text uppercase italic leading-none">
          Métricas de Observabilidad
        </h2>
        <p className="text-[11px] font-bold text-gmm-text-muted uppercase tracking-widest mt-3">
          Monitoreo proactivo de siniestralidad y eficiencia del gasto médico en tiempo real.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
         {[
           { label: 'Siniestralidad Global', val: '24%', sub: '↓ 2% vs mes anterior', icon: Activity },
           { label: 'Tiempo de Pago Promedio', val: '8.5d', sub: 'Objetivo < 10d', icon: Clock },
           { label: 'Ahorro Negociado', val: '$124k', sub: 'Vía auditoría modular', icon: TrendingDown, color: 'text-gmm-danger' }
         ].map((stat, i) => (
           <div key={i} className="gmm-pill-card text-center py-10 shadow-lg border-gmm-border/50">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gmm-text-muted mb-3">{stat.label}</p>
              <h4 className={`text-5xl font-black tracking-tighter ${stat.color || 'text-gmm-text'}`}>{stat.val}</h4>
              <p className="text-[11px] font-black text-gmm-accent uppercase tracking-widest mt-4 italic">{stat.sub}</p>
           </div>
         ))}
      </div>

      <div className="relative">
        <MetricNode 
          title="Uso de Póliza Anual" 
          value="$1.2M MXN" 
          subtext="El consumo se estabilizó en Noviembre tras las intervenciones quirúrgicas del Q3."
          trend="down"
          isRight={true}
        />
        <MetricNode 
          title="Frecuencia de Siniestros" 
          value="1.4 Mensuales" 
          subtext="Se mantiene por debajo de la media histórica del grupo familiar."
          trend="down"
          isRight={false}
        />
        <MetricNode 
          title="Tasa de Rechazo de Facturas" 
          value="4.2%" 
          subtext="Principalmente por errores de timbrado fiscal ajenos al diagnóstico."
          trend="up"
          isRight={true}
        />
      </div>

      <div className="gmm-pill-card mt-20 text-center bg-gmm-card shadow-2xl border-gmm-border/20">
         <h4 className="text-sm font-black text-gmm-text uppercase tracking-[0.4em] mb-8">Estado del Motor de Gobernanza</h4>
         <div className="flex justify-center gap-3 mb-10">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`w-3 h-12 rounded-full transition-all duration-700 ${i < 7 ? 'bg-gmm-accent shadow-[0_0_15px_-5px_var(--gmm-accent)]' : 'bg-gmm-text/10'}`} />
            ))}
         </div>
         <div className="flex items-center justify-center gap-4 bg-gmm-bg/30 py-4 px-8 rounded-full border border-gmm-border/20 inline-flex">
           <div className="w-2.5 h-2.5 rounded-full bg-gmm-success animate-pulse shadow-[0_0_10px_var(--gmm-success)]" />
           <p className="text-[11px] font-black text-gmm-text-muted uppercase tracking-widest">
             Sistemas de Auditoría: Operativos y Saludables
           </p>
         </div>
      </div>
    </div>
  );
}
