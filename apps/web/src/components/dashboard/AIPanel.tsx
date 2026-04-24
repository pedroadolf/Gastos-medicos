import React from 'react';
import { Brain, Lightbulb, ChevronRight, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIPanelProps {
  ai: {
    probableCause: string;
    recommendation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
}

export function AIPanel({ ai }: AIPanelProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-gmm-danger/10 border-gmm-danger/20 text-gmm-danger';
      case 'high': return 'bg-gmm-warning/10 border-gmm-warning/20 text-gmm-warning';
      default: return 'bg-gmm-yellow/10 border-gmm-yellow/20 text-gmm-yellow';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-[20px] border ${getSeverityStyles(ai.severity)} relative overflow-hidden shadow-sm`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-black/20 rounded-xl">
           <Brain size={18} className="text-inherit" />
        </div>
        <div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">AI Decision Logic</h3>
           <div className="flex items-center gap-2">
              <p className="text-sm font-black italic uppercase tracking-tighter">Probable Root Cause</p>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
           </div>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex gap-4">
           <div className="pt-1"><Target size={14} className="opacity-40" /></div>
           <div>
              <p className="text-[9px] font-black uppercase opacity-40 mb-1">Diagnosis</p>
              <p className="text-sm font-bold text-white italic">{ai.probableCause}</p>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="pt-1"><Lightbulb size={14} className="opacity-40" /></div>
           <div className="flex-1">
              <p className="text-[9px] font-black uppercase opacity-40 mb-1">Remediation Path</p>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">{ai.recommendation}</p>
           </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between pt-6 border-t border-current/10">
          <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                  {[1,2,3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                  ))}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Reasoning Confidence</span>
          </div>
          <div className="flex items-baseline gap-1">
              <span className="text-lg font-black italic">{ai.confidence}</span>
              <span className="text-[10px] font-black opacity-30">%</span>
          </div>
      </div>

      {/* Decorative pulse */}
      <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <ShieldAlert size={80} />
      </div>
    </motion.div>
  );
}
