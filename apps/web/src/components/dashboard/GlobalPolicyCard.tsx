'use client';

import { Shield, ShieldAlert, Users, FolderOpen, DollarSign, Activity } from 'lucide-react';

interface GlobalPolicyCardProps {
  totalSum: number;
  consumedSum: number;
  policyNumber: string;
}

export function GlobalPolicyCard({ totalSum, consumedSum, policyNumber }: GlobalPolicyCardProps) {
  return (
    <div className="gmm-card-premium relative overflow-hidden group">
      {/* Background Decals */}
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Shield size={180} />
      </div>

      <div className="flex flex-col lg:flex-row border-b border-gmm-text/5">
        {/* Left Panel: Primary Policy */}
        <div className="flex-1 p-8 lg:p-10 lg:border-r border-gmm-text/5">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gmm-text">
              Póliza Principal — MetLife GMM Colectivo
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-y-4">
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">No. de Póliza</p>
                 <p className="text-[14px] font-black text-gmm-text uppercase">{policyNumber}</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Contratante</p>
                 <p className="text-[12px] font-black text-gmm-text">Colgate Palmolive, S.A. de C.V.</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Certificado</p>
                 <p className="text-[12px] font-black text-gmm-text">2001</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Vigencia</p>
                 <p className="text-[12px] font-black text-gmm-success">En vigor</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Suma Asegurada</p>
                 <p className="text-[14px] font-black text-gmm-text">${(totalSum/1000000).toFixed(0)},000,000 MXN</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Deducible</p>
                 <p className="text-[12px] font-black text-gmm-text">$15,000 MXN / siniestro</p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Coaseguro</p>
                 <p className="text-[12px] font-black text-gmm-text">10% <span className="text-[10px] text-gmm-text-muted">(tope $17,500 MXN)</span></p>
               </div>
               <div>
                 <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Asegurado Titular</p>
                 <p className="text-[12px] font-black text-gmm-text">Fonseca Aguilar, Claudia</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Excess Policy */}
        <div className="lg:w-[400px] bg-blue-50/50 dark:bg-blue-900/10 p-8 lg:p-10 relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
            <ShieldAlert size={120} />
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-900 dark:text-blue-400">
              Póliza de Excesos — Aplica por Siniestro
            </h2>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 gap-y-4">
               <div>
                 <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest mb-1">No. de Póliza</p>
                 <p className="text-[14px] font-black text-blue-950 dark:text-blue-300">M172 1011</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest mb-1">Inicio Vigencia</p>
                    <p className="text-[12px] font-black text-blue-950 dark:text-blue-300">1 Oct 2025</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest mb-1">Suma Asegurada</p>
                    <p className="text-[12px] font-black text-blue-950 dark:text-blue-300">Sin límite</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest mb-1">Deducible Excesos</p>
                    <p className="text-[12px] font-black text-blue-950 dark:text-blue-300">$2,000,000 MXN</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-blue-800/60 dark:text-blue-400/60 uppercase tracking-widest mb-1">Coaseguro Excesos</p>
                    <p className="text-[12px] font-black text-blue-950 dark:text-blue-300">10%</p>
                  </div>
               </div>
            </div>

            <div className="mt-6 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-blue-100 dark:border-white/5">
              <p className="text-[10px] leading-relaxed font-bold text-blue-900/80 dark:text-blue-200/80">
                La póliza de excesos entra en vigor cuando el gasto acumulado de un mismo siniestro supera <strong className="text-blue-950 dark:text-blue-100">$2,000,000</strong>. A partir de ese punto cubre el excedente con 10% de coaseguro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gmm-text/5 bg-gmm-bg/50">
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gmm-text/5 flex items-center justify-center shrink-0">
             <Users size={16} className="text-gmm-text" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Total Asegurados</p>
             <p className="text-[16px] font-black tracking-tighter text-gmm-text">4 <span className="text-[9px] font-bold text-gmm-text-muted">En la póliza</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gmm-danger/10 flex items-center justify-center shrink-0">
             <FolderOpen size={16} className="text-gmm-danger" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Siniestros Activos</p>
             <p className="text-[16px] font-black tracking-tighter text-gmm-text">3 <span className="text-[9px] font-bold text-gmm-text-muted">Con trámites</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-gmm-accent/10 flex items-center justify-center shrink-0">
             <DollarSign size={16} className="text-gmm-accent" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Coaseg. Acumulado</p>
             <p className="text-[16px] font-black tracking-tighter text-gmm-text">$42k <span className="text-[9px] font-bold text-gmm-text-muted">Pagado este año</span></p>
           </div>
        </div>
        <div className="p-6 flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
             <Activity size={16} className="text-blue-500" />
           </div>
           <div>
             <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest mb-1">Excesos Activos</p>
             <p className="text-[16px] font-black tracking-tighter text-gmm-text">0 <span className="text-[9px] font-bold text-gmm-text-muted">Siniestros >$2M</span></p>
           </div>
        </div>
      </div>
    </div>
  );
}
