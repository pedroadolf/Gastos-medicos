'use client';

import { Shield, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalPolicyCardProps {
  totalSum: number;
  consumedSum: number;
  policyNumber: string;
}

export function GlobalPolicyCard({ totalSum, consumedSum, policyNumber }: GlobalPolicyCardProps) {
  const availableSum = totalSum - consumedSum;
  const availablePercentage = totalSum > 0 ? (availableSum / totalSum) * 100 : 0;

  // Semaphore Logic
  const getStatusColor = () => {
    if (availablePercentage > 30) return 'text-gmm-success bg-gmm-success/10';
    if (availablePercentage > 10) return 'text-gmm-yellow bg-gmm-yellow/10';
    return 'text-gmm-danger bg-gmm-danger/10';
  };

  const getBarColor = () => {
    if (availablePercentage > 30) return 'bg-gmm-success';
    if (availablePercentage > 10) return 'bg-gmm-yellow';
    return 'bg-gmm-danger';
  };

  return (
    <div className="gmm-card-premium p-8 relative overflow-hidden group">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Shield size={120} />
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
        <div className="space-y-6 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gmm-text-muted">Estado Global de Póliza</span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest animate-pulse ${getStatusColor()}`}>
                Activa / Bajo Control
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase text-gmm-text">
              Póliza {policyNumber}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gmm-text-muted tracking-widest">Suma Asegurada Total</p>
              <p className="text-3xl font-black tracking-tighter italic text-gmm-text">
                ${(totalSum / 1_000_000).toFixed(0)}M <span className="text-xs font-bold text-gmm-text-muted">MXN</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gmm-text-muted tracking-widest">Suma Consumida</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter italic text-gmm-text">
                  ${(consumedSum / 1_000).toLocaleString()}k
                </p>
                <TrendingDown className="text-gmm-danger" size={14} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gmm-text-muted tracking-widest">Suma Disponible</p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-black tracking-tighter italic ${availablePercentage < 10 ? 'text-gmm-danger' : 'text-gmm-text'}`}>
                  ${(availableSum / 1_000).toLocaleString()}k
                </p>
                <TrendingUp className="text-gmm-success" size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black uppercase text-gmm-text-muted tracking-[0.2em]">Disponibilidad</p>
              <p className="text-xl font-black italic tracking-tighter text-gmm-text">
                {availablePercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-4 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${availablePercentage}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className={`h-full rounded-full ${getBarColor()} shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
               />
            </div>
            <div className="flex items-center gap-2 text-gmm-text-muted">
               <Info size={12} />
               <p className="text-[9px] font-bold uppercase tracking-widest">Protección de Excesos Activada (Ilimitado tras $5M)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
