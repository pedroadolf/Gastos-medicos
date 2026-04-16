'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';

interface TrustBarProps {
  trust: {
    status: 'LIVE' | 'DELAYED' | 'STALE';
    confidenceScore: number;
    issues: string[];
  };
  meta: {
    generatedAt: string;
  };
}

export function TrustBar({ trust, meta }: TrustBarProps) {
  const statusColor =
    trust.status === 'LIVE'
      ? 'bg-gmm-success shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      : trust.status === 'DELAYED'
      ? 'bg-gmm-warning shadow-[0_0_10px_rgba(234,179,8,0.3)]'
      : 'bg-gmm-danger shadow-[0_0_10px_rgba(239,68,68,0.3)]';

  const statusText =
    trust.status === 'LIVE' ? 'LIVE SYNC' : 
    trust.status === 'DELAYED' ? 'SYNC DELAYED' : 'SYSTEM STALE';

  return (
    <div className="w-full bg-gmm-black/40 backdrop-blur-md border-b border-white/5 px-8 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase italic">
            {statusText}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence Index:</span>
            <span className={`text-[10px] font-black ${trust.confidenceScore > 80 ? 'text-gmm-success' : 'text-gmm-warning'}`}>
                {trust.confidenceScore}%
            </span>
        </div>
        
        {trust.issues.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gmm-danger/10 rounded-full border border-gmm-danger/20">
                <ShieldAlert size={10} className="text-gmm-danger" />
                <span className="text-[8px] font-black text-gmm-danger uppercase tracking-tighter">
                   {trust.issues[0]}
                </span>
            </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
        <Activity size={12} className="text-slate-700" />
        Last Node Sync: {formatDistanceToNow(new Date(meta.generatedAt), { addSuffix: true })}
      </div>
    </div>
  );
}
