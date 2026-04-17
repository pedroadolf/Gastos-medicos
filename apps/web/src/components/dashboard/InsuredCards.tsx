'use client';

import { User, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsuredCardProps {
  name: string;
  consumed: number;
  total: number;
}

export function InsuredCards({ users }: { users: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {users.map((user, idx) => (
        <Card key={idx} name={user.name} consumed={user.consumed} total={user.totalLimit || user.total || 1_000_000} />
      ))}
      
      {/* Empty Slot for adding more (Simulation) */}
      <div className="border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center p-8 opacity-30 hover:opacity-50 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 text-2xl">+</div>
          <span className="text-[10px] font-black uppercase tracking-widest">Añadir Dependiente</span>
      </div>
    </div>
  );
}

function Card({ name, consumed, total }: InsuredCardProps) {
  const percentage = (consumed / total) * 100;
  
  // Semaphore Logic
  let statusColor = 'bg-gmm-success';
  if (percentage > 50) statusColor = 'bg-gmm-warning';
  if (percentage > 85) statusColor = 'bg-gmm-danger';

  return (
    <div className="bg-gmm-gray p-6 rounded-[32px] border border-white/5 hover:border-gmm-yellow/20 transition-all group overflow-hidden relative">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gmm-black flex items-center justify-center text-slate-400 group-hover:text-gmm-yellow transition-colors">
          <User size={24} />
        </div>
        <div>
          <h4 className="text-white font-black italic uppercase text-lg tracking-tighter">{name}</h4>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">ID: 00{Math.floor(Math.random()*900)}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consumo Póliza</span>
          <span className="text-sm font-black text-white italic">{percentage.toFixed(0)}%</span>
        </div>
        
        <div className="h-1.5 w-full bg-gmm-black rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${statusColor}`}
          />
        </div>
        
        <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse shadow-[0_0_8px] ${statusColor === 'bg-gmm-success' ? 'shadow-gmm-success' : statusColor === 'bg-gmm-warning' ? 'shadow-gmm-warning' : 'shadow-gmm-danger'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estatus Cobertura</span>
            </div>
            <button className="text-[10px] font-black text-gmm-yellow uppercase hover:underline">Detalle</button>
        </div>
      </div>
    </div>
  );
}
