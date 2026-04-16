import React from 'react';
import { Bot, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HealingActionProps {
  action: {
    type: 'INCREASE_TIMEOUT' | 'SWITCH_PROVIDER' | 'RETRY' | 'ESCALATE';
    params?: any;
    executedAt?: string;
  };
}

export function HealingActionPanel({ action }: HealingActionProps) {
  const getActionDetails = () => {
    switch (action.type) {
      case 'INCREASE_TIMEOUT':
        return {
          title: 'Infrastructure Optimization',
          desc: `Execution timeout increased to ${action.params?.ms || 10000}ms for stability.`,
          icon: <Zap className="text-gmm-yellow" size={18} />,
          status: 'Automated Correction Applied'
        };
      case 'SWITCH_PROVIDER':
        return {
          title: 'Dynamic Failover',
          desc: 'Primary OCR node unresponsive. Switched to secondary failover provider.',
          icon: <ShieldCheck className="text-gmm-success" size={18} />,
          status: 'Redundancy Layer Active'
        };
      case 'RETRY':
        return {
          title: 'Autonomous Recovery',
          desc: 'Transient glitch detected. Automated retry cycle engaged.',
          icon: <Zap className="text-gmm-yellow animate-pulse" size={18} />,
          status: 'Healing in Progress'
        };
      case 'ESCALATE':
        return {
          title: 'NOC Escalation',
          desc: 'Confidence threshold < 85%. Manual engineering audit requested.',
          icon: <AlertTriangle className="text-gmm-danger" size={18} />,
          status: 'Human Intervention Required'
        };
    }
  };

  const details = getActionDetails();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 p-6 bg-white/5 border border-white/10 rounded-[32px] overflow-hidden relative"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-black/40 rounded-xl">
           <Bot className="text-gmm-yellow" size={16} />
        </div>
        <div>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Self-Healing Protocol</p>
           <h4 className="text-sm font-black text-white italic tracking-tighter uppercase">{details.title}</h4>
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-2xl border border-white/5 mb-4">
          <p className="text-xs text-slate-300 font-medium leading-relaxed">{details.desc}</p>
      </div>

      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 bg-gmm-yellow/10 rounded-full">
                  <div className="w-2 h-2 bg-gmm-yellow rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-gmm-yellow uppercase italic tracking-widest">{details.status}</span>
              
              {/* Aggressiveness Badge */}
              <div className={`ml-2 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${
                  action.aggressiveness === 'CRITICAL' ? 'bg-gmm-danger/20 border-gmm-danger text-gmm-danger' :
                  action.aggressiveness === 'HIGH' ? 'bg-gmm-warning/20 border-gmm-warning text-gmm-warning' :
                  'bg-white/5 border-white/10 text-slate-400'
              }`}>
                  {action.aggressiveness} MODE
              </div>
          </div>
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
            {action.executedAt ? new Date(action.executedAt).toLocaleTimeString() : 'Real-time Signal'}
          </span>
      </div>

      {/* Background Decorative Bot */}
      <div className="absolute top-0 right-0 p-4 opacity-5 -mr-4 -mt-4">
          <Bot size={80} />
      </div>
    </motion.div>
  );
}
