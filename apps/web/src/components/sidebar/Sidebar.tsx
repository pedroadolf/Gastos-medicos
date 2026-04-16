'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GitBranch, Settings, ShieldCheck, Database, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Sidebar() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useUserRole();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflow', href: '/workflows', icon: GitBranch },
    { label: 'Siniestros', href: '/siniestros', icon: ShieldCheck },
    { label: 'Observabilidad', href: '/observabilidad', icon: Database },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 bg-gmm-black border-r border-white/5 flex flex-col items-center py-8">
      
      {/* ⚡ Branding - SRE Minimalist */}
      <div className="mb-12">
        <div className="w-10 h-10 bg-gmm-yellow rounded-xl flex items-center justify-center shadow-lg shadow-gmm-yellow/20">
          <Layers className="text-black w-6 h-6" />
        </div>
      </div>

      {/* 🧭 Navigation */}
      <nav className="flex-1 flex flex-col gap-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} title={item.label}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-3 rounded-2xl cursor-pointer transition-all duration-300 relative group",
                  isActive 
                    ? "bg-gmm-yellow text-black" 
                    : "text-slate-500 hover:text-white"
                )}
              >
                <item.icon className="w-6 h-6" strokeWidth={2.5} />
                
                {/* Tooltip hint */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-gmm-gray border border-white/10 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest shadow-2xl">
                    {item.label}
                </div>

                {/* Active indicator bar */}
                {isActive && (
                    <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-1 h-8 bg-gmm-yellow rounded-r-full blur-[2px]" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ⚙️ Footer Config */}
      <div className="mt-auto">
        <Link href="/configuracion" title="Configuración">
          <motion.div
            whileHover={{ rotate: 90 }}
            className={cn(
                "p-3 rounded-2xl cursor-pointer transition-all duration-300 text-slate-500 hover:text-white",
                pathname === '/configuracion' && "bg-white/10 text-white"
            )}
          >
            <Settings className="w-6 h-6" />
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
