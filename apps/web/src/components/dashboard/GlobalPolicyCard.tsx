'use client';

import { Shield, ShieldAlert, Users, FolderOpen, DollarSign, Activity } from 'lucide-react';

interface GlobalPolicyCardProps {
  totalSum: number;
  consumedSum: number;
  policyNumber: string;
}

export function GlobalPolicyCard({ totalSum, consumedSum, policyNumber }: GlobalPolicyCardProps) {
  return (
    <div className="gmm-box relative overflow-hidden group">
      {/* Removed background decals for cleaner UI */}

      <div className="flex flex-col lg:flex-row border-b border-slate-100 dark:border-zinc-800">
        {/* Left Panel: Primary Policy */}
        <div className="flex-1 p-10 lg:border-r border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              Póliza Principal — MetLife GMM Colectivo
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-4">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">No. de Póliza</p>
                 <p className="text-[14px] font-black text-slate-900 dark:text-white uppercase">{policyNumber}</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Contratante</p>
                 <p className="text-[12px] font-black text-slate-900 dark:text-white">Colgate Palmolive, S.A. de C.V.</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Certificado</p>
                 <p className="text-[12px] font-black text-slate-900 dark:text-white">2001</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Vigencia</p>
                 <p className="text-[12px] font-black text-emerald-500">En vigor</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Suma Asegurada</p>
                 <p className="text-[14px] font-black text-slate-900 dark:text-white">${(totalSum/1000000).toFixed(0)},000,000 MXN</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Deducible</p>
                 <p className="text-[12px] font-black text-slate-900 dark:text-white">$15,000 MXN / siniestro</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Coaseguro</p>
                 <p className="text-[12px] font-black text-slate-900 dark:text-white">10% <span className="text-[10px] text-slate-400 dark:text-slate-300">(tope $17,500 MXN)</span></p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Asegurado Titular</p>
                 <p className="text-[12px] font-black text-slate-900 dark:text-white">Fonseca Aguilar, Claudia</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Excess Policy */}
        <div className="lg:w-[400px] bg-slate-100/30 dark:bg-black/20 p-10 relative">
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
              Póliza de Excesos — Aplica por Siniestro
            </h2>
          </div>

          <div className="space-y-4 relative z-10">
             <div className="grid grid-cols-1 gap-y-4">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">No. de Póliza</p>
                 <p className="text-[14px] font-black text-slate-900 dark:text-white">M172 1011</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Inicio Vigencia</p>
                    <p className="text-[12px] font-black text-slate-900 dark:text-white">1 Oct 2025</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Suma Asegurada</p>
                    <p className="text-[12px] font-black text-slate-900 dark:text-white">Sin límite</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Deducible Excesos</p>
                    <p className="text-[12px] font-black text-slate-900 dark:text-white">$2,000,000 MXN</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest mb-1">Coaseguro Excesos</p>
                    <p className="text-[12px] font-black text-slate-900 dark:text-white">10%</p>
                  </div>
               </div>
            </div>

            <div className="mt-6 p-4 bg-white/50 dark:bg-black/30 rounded-[20px] border border-slate-100 dark:border-white/5">
              <p className="text-[10px] leading-relaxed font-bold text-slate-400 dark:text-slate-300">
                La póliza de excesos entra en vigor cuando el gasto acumulado de un mismo siniestro supera <strong className="text-slate-900 dark:text-white">$2,000,000</strong>. A partir de ese punto cubre el excedente con 10% de coaseguro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-black/40">
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-[16px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
             <Users size={16} className="text-slate-900 dark:text-white" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Asegurados</p>
             <p className="text-[16px] font-black tracking-tighter text-slate-900 dark:text-white">4 <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">En la póliza</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-[16px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
             <FolderOpen size={16} className="text-red-500" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Siniestros Activos</p>
             <p className="text-[16px] font-black tracking-tighter text-slate-900 dark:text-white">3 <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">Con trámites</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-[16px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
             <DollarSign size={16} className="text-blue-500" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Coaseg. Acumulado</p>
             <p className="text-[16px] font-black tracking-tighter text-slate-900 dark:text-white">$42k <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">Pagado este año</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-[16px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
             <Activity size={16} className="text-slate-900 dark:text-white" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Excesos Activos</p>
             <p className="text-[16px] font-black tracking-tighter text-slate-900 dark:text-white">0 <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">Siniestros &gt;$2M</span></p>
           </div>
        </div>
      </div>
    </div>
  );
}
