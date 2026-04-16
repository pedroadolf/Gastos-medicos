'use client';

import React, { useEffect, useState } from 'react';
import { Search, Monitor } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Topbar() {
  const { data: session } = useSession();
  const [slo, setSlo] = useState(1);

  useEffect(() => {
    fetch('/api/slo')
      .then(res => res.json())
      .then(data => setSlo(data.success_rate || 1))
      .catch(err => console.error('Error fetching SLO:', err));
  }, []);

  const status = {
    label:
      slo >= 0.99 ? 'Stable' :
      slo >= 0.95 ? 'Degraded' :
      'Critical',
    color:
      slo >= 0.99 ? '#10B981' : // Emerald 500
      slo >= 0.95 ? '#FFD32C' : // GMM Yellow
      '#EF4444'                 // Red 500
  };

  return (
    <header className="h-16 border-b border-white/5 bg-gmm-black/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* 🔍 Search - SRE Minimalist */}
      <div className="relative group hidden sm:block">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gmm-yellow transition-colors" />
        <input
          placeholder="QUERY ENGINE: PATIENTS, CLAIMS..."
          className="bg-white/5 border border-white/5 focus:border-gmm-yellow/50 rounded-xl pl-12 pr-4 py-2 text-[10px] font-black tracking-widest w-64 md:w-96 text-white transition-all outline-none uppercase placeholder:text-slate-600"
        />
      </div>

      <div className="flex items-center gap-8 ml-auto">
        {/* 📊 Node Status (SLO) */}
        <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <div className="flex items-center gap-2">
            <Monitor size={12} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System:</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}` }}
            />
            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: status.color }}>
                {status.label} { (slo * 100).toFixed(1) }%
            </span>
          </div>
        </div>

        {/* 🔔 Notifications */}
        <div className="flex items-center justify-center">
          <NotificationCenter />
        </div>

        {/* 👤 Instance Key (User) */}
        <div className="flex items-center gap-4 cursor-pointer group hover:bg-white/5 p-1 pr-4 rounded-2xl transition-all border border-transparent hover:border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gmm-yellow flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-gmm-yellow/10">
            {session?.user?.image ? (
               <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
               <span className="text-black font-black text-xs uppercase italic">
                  {session?.user?.name?.charAt(0) || 'U'}
               </span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none group-hover:text-gmm-yellow transition-colors">
                {session?.user?.name ? session.user.name.split(' ')[0] : 'Operator'}
            </p>
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Admin Access</p>
          </div>
        </div>
      </div>
    </header>
  );
}
