'use client';

import { DollarSign, ShieldAlert, Target, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoverageKPIProps {
  kpis: {
    baseLimit: number;
    consumed: number;
    effectiveAvailable: number;
    baseRemaining: number;
    excessRemaining: number;
    riskMode: string;
    layer: string;
    healthRate: number;
    effectiveness: number;
    forecast?: {
      dailyBurn: number;
      runwayDays: number;
    };
    intelligence?: any;
  };
}

export function CoverageKPIs({ kpis }: CoverageKPIProps) {
  if (!kpis) return null;

  const { baseLimit, consumed, effectiveAvailable, riskMode, layer, effectiveness } = kpis;
  const forecast = kpis.forecast;

  const basePercentage = baseLimit > 0 ? Math.min((consumed / baseLimit) * 100, 100) : 0;
  const inExcess = consumed > baseLimit;

  return (
    <div className="space-y-8 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Suma Base */}
        <KPICard
          label="Cobertura Primaria"
          value={`$${(baseLimit / 1_000_000).toFixed(1)}M`}
          icon={<Target className="text-slate-400" size={20} />}
          subtext={riskMode === 'BASE' ? 'Dentro de límites' : 'Límite Agotado'}
          status={riskMode === 'BASE' ? 'ok' : 'danger'}
        />

        {/* Exceso Layer */}
        <KPICard
          label="Capa de Excesos"
          value="INF"
          icon={<ShieldAlert className={inExcess ? 'text-gmm-yellow' : 'text-slate-500'} size={20} />}
          subtext={inExcess ? 'Exceso activo' : 'Sin activar'}
          status={inExcess ? 'warning' : 'ok'}
        />

        {/* Effective Available */}
        <div className="bg-gmm-yellow p-8 rounded-[40px] shadow-2xl shadow-gmm-yellow/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl -rotate-45" />
          <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-mono">Effective Available</p>
          <div className="text-black text-5xl font-black italic tracking-tighter">
            ${(effectiveAvailable / 1_000_000).toFixed(1)}<span className="text-2xl ml-1">M</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-6 w-px bg-black/10" />
            <span className="text-[10px] font-black text-black uppercase tracking-widest italic">{layer || riskMode} MODE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 📊 Coverage Progress Bar */}
      <div className="bg-gmm-gray-dark border border-white/5 p-10 rounded-[48px] overflow-hidden relative">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-white font-black italic text-xl uppercase tracking-tighter mb-1">Layered Coverage Timeline</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time depletion across policy layers</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-1">System Consumption</p>
            <p className="text-2xl font-black text-white italic tracking-tighter">${(consumed / 1_000_000).toFixed(2)}M</p>
          </div>
        </div>

        <div className="relative h-12 flex gap-1 bg-white/5 rounded-2xl p-1 overflow-hidden">
          {/* Base Progress */}
          <div className="relative flex-[1] h-full bg-white/5 rounded-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${basePercentage}%` }}
              transition={{ duration: 1 }}
              className={`h-full ${basePercentage > 85 ? 'bg-gmm-danger' : 'bg-slate-700'}`}
            />
            <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Base Layer ($5M)</span>
            </div>
          </div>

          {/* Excess Progress */}
          <div className="relative flex-[2] h-full bg-white/5 rounded-xl overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: inExcess ? '40%' : '0%' }}
              transition={{ duration: 1 }}
              className="h-full bg-gmm-yellow"
            />
            <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${inExcess ? 'text-black' : 'text-white/20'}`}>
                Excess Layer (Ilimitado)
              </span>
            </div>
          </div>
        </div>

        {riskMode === 'TRANSITION' && (
          <div className="mt-4 flex items-center gap-2 text-gmm-danger bg-gmm-danger/10 p-3 rounded-xl">
            <ShieldAlert size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Critical: Nearing Excess Activation Threshold</p>
          </div>
        )}
      </div>

      {/* 🔮 Forecast & Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gmm-gray-dark border border-white/5 p-8 rounded-[40px] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gmm-yellow/10 rounded-xl">
              <Clock className="text-gmm-yellow" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">Exhaustion Forecast</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Daily burn rate (last 7 days)</p>
            </div>
          </div>

          {forecast ? (
            <div className="flex gap-12">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Runway</p>
                <div className={`text-3xl font-black italic tracking-tighter ${
                  forecast.runwayDays < 15 ? 'text-gmm-danger' :
                  forecast.runwayDays < 30 ? 'text-gmm-warning' :
                  'text-gmm-yellow'
                }`}>
                  {forecast.runwayDays}<span className="text-sm ml-1 text-slate-500 uppercase">Days</span>
                </div>
              </div>
              <div className="h-12 w-px bg-white/5" />
              <div className="ml-auto text-right">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Velocity</p>
                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-[10px] font-black text-slate-400">$</span>
                  <span className="text-xs font-black text-white ml-0.5">{Math.round((forecast.dailyBurn || 0) / 1000)}k</span>
                  <span className="text-[8px] font-bold text-slate-600 ml-1">/DAY</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">Sin datos de consumo reciente.</p>
          )}
        </div>

        <div className="bg-gmm-gray-dark border border-white/5 p-8 rounded-[40px] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gmm-success/10 rounded-xl">
              <ShieldCheck className="text-gmm-success" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white italic tracking-tighter uppercase">Healing Loop Yield</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Self-correction success rate</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-black text-gmm-success italic tracking-tighter">
              {(effectiveness || 0).toFixed(0)}<span className="text-xl ml-1">%</span>
            </div>
            <div className="px-3 py-1 bg-gmm-success/10 border border-gmm-success/20 rounded-full">
              <span className="text-[8px] font-black text-gmm-success uppercase tracking-widest">Optimized Signal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, subtext, status }: any) {
  return (
    <div className="bg-gmm-gray-dark p-8 rounded-[40px] border border-white/5 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
        {icon}
      </div>
      <div className="flex justify-between items-start mb-6">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      </div>
      <div className={`text-4xl lg:text-5xl font-black italic tracking-tighter ${
        status === 'danger' ? 'text-gmm-danger' :
        status === 'warning' ? 'text-gmm-yellow' : 'text-white'
      }`}>
        {value}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1 h-3 rounded-full ${
          status === 'danger' ? 'bg-gmm-danger' :
          status === 'warning' ? 'bg-gmm-yellow' : 'bg-slate-700'
        }`} />
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">{subtext}</p>
      </div>
    </div>
  );
}
