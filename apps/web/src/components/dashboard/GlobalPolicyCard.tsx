'use client';

import { Shield, ShieldAlert, Users, FolderOpen, DollarSign, Activity } from 'lucide-react';

interface GlobalPolicyCardProps {
  totalSum: number;
  consumedSum: number;
  policyNumber: string;
}

export function GlobalPolicyCard({ totalSum, consumedSum, policyNumber }: GlobalPolicyCardProps) {
  return (
    <div className="gmm-box relative overflow-hidden group border-none">
      {/* Contenido Principal */}
      <div className="flex flex-col lg:flex-row border-b border-slate-100 dark:border-white/5">
        {/* Panel Izquierdo: Póliza Primaria */}
        <div className="flex-1 p-12 lg:border-r border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white leading-none">
              Póliza Colectiva <span className="text-blue-600 dark:text-blue-400">— MetLife 2026</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">No. de Póliza</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{policyNumber}</p>
            </div>
            <div>
              <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Contratante</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Colgate Palmolive, S.A. de C.V.</p>
            </div>
            <div>
              <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Certificado / Vigencia</p>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-black text-slate-900 dark:text-white">2001</p>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase rounded-lg border border-emerald-500/20">Vigente</span>
              </div>
            </div>
            <div>
              <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Asegurado Titular</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">Fonseca Aguilar, Claudia</p>
            </div>
            <div className="md:col-span-2 pt-8 border-t border-slate-50 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                  <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Suma Asegurada</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">${(totalSum).toLocaleString()} <span className="text-sm font-bold text-slate-400 uppercase">MXN</span></p>
                </div>
                <div>
                  <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Deducible Base</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">$6,602.88 <span className="text-sm font-bold text-slate-400 uppercase">/ Año</span></p>
                </div>
                <div>
                  <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Coaseguro</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">10% <span className="text-[11px] font-bold text-slate-400 uppercase">(Tope $17,500)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Excesos con fondo distinguido */}
        <div className="lg:w-[480px] bg-slate-50/50 dark:bg-black/40 p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={120} className="text-slate-900 dark:text-white" />
          </div>
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="h-10 w-2 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white leading-none">
              Capa de Excesos <span className="text-emerald-500">— M172</span>
            </h2>
          </div>

          <div className="space-y-10 relative z-10">
            <div>
              <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Póliza Individual de Respaldo</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">M172 1011</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Suma Excesos</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">Sin límite</p>
              </div>
              <div>
                <p className="text-[14px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Deducible Exceso</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">$2,000,000</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 p-8 rounded-[30px] border border-slate-200/50 dark:border-white/5 shadow-sm">
              <p className="text-[15px] leading-relaxed font-bold text-slate-700 dark:text-slate-300">
                La cobertura de excesos activa automáticamente al superar <strong className="text-slate-900 dark:text-white font-black">$2.0M</strong> en un solo evento, eliminando el riesgo de ruina financiera.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer KPI Cards: Más grandes y claros */}
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5 bg-white dark:bg-zinc-900/50">
        {[
          { icon: <Users size={24} />, label: 'Integrantes', value: '4', sub: 'Claudia + Familia', color: 'text-blue-600' },
          { icon: <FolderOpen size={24} />, label: 'Siniestros', value: '3', sub: 'Trámites en curso', color: 'text-orange-500' },
          { icon: <DollarSign size={24} />, label: 'Coaseguro', value: '$42k', sub: 'Pagado este año', color: 'text-emerald-500' },
          { icon: <Activity size={24} />, label: 'Alertas', value: '0', sub: 'Eventos críticos', color: 'text-slate-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-10 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className={`w-16 h-16 rounded-[22px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-lg ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
              <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">{kpi.value}</p>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-2">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
