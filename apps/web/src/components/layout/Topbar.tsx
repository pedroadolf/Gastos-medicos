'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
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
      slo >= 0.99 ? 'Estable' :
      slo >= 0.95 ? 'Degradado' :
      'Inestable',
    color:
      slo >= 0.99 ? '#22C55E' : // Emerald 500
      slo >= 0.95 ? '#F59E0B' : // Amber 500
      '#EF4444'                 // Red 500
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/50 bg-white/70 dark:bg-[#0B0F14]/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-all">
      {/* 🔍 Search */}
      <div className="relative group hidden sm:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          placeholder="Buscar expedientes, pólizas..."
          className="bg-slate-100 dark:bg-[#121821] border border-transparent dark:border-[#1F2A37] focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-10 pr-4 py-1.5 text-sm w-64 md:w-80 text-slate-800 dark:text-white transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-6 ml-auto">
        {/* 📊 Status (UX SLO) */}
        <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-slate-500 dark:text-[#9CA3AF]">
          <span 
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}60` }}
          />
          {status.label}
        </div>

        {/* 🔔 Notifications */}
        <div className="flex items-center justify-center">
          <NotificationCenter />
        </div>

        {/* 👤 User Account Minimal */}
        <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-[#121821] p-1.5 pr-3 rounded-full transition-colors border border-transparent dark:border-[#1F2A37]">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center overflow-hidden shrink-0">
            {session?.user?.image ? (
               <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
               <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {session?.user?.name?.charAt(0) || 'U'}
               </span>
            )}
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-[#E5E7EB] group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
            {session?.user?.name ? session.user.name.split(' ')[0] : 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  );
}
