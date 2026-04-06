'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { menuItems, Role } from './sidebar.config';
import { SidebarItem } from './SidebarItem';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { role, user, isAuthenticated } = useUserRole();

  // Filter items based on user role
  const filteredItems = menuItems.filter((item) => 
    item.roles.includes(role as Role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col">
      {/* 🏙️ Branding */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/20">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">GMM PLATFORM</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">Management</span>
          </div>
        </div>
      </div>

      {/* 🧭 Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <div className="space-y-1.5">
          {filteredItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
            />
          ))}
        </div>

        {/* 🛠️ Admin quick access visual hint if applicable */}
        {role === 'admin' && (
          <div className="mt-8 px-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Power Control</span>
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          </div>
        )}
      </nav>

      {/* 👤 User Profile Section */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm">
        {isAuthenticated ? (
          <div className="flex items-center justify-between gap-2 group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-800/50">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none mb-1">
                  {user?.name || 'Usuario'}
                </p>
                <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-500 leading-none flex items-center">
                  <span className={cn(
                    "inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0",
                    role === 'admin' ? "bg-red-400" : role === 'operator' ? "bg-amber-400" : "bg-emerald-400"
                  )} />
                  {role.toUpperCase()}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all duration-200"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
             <div className="h-9 w-full bg-slate-200 animate-pulse rounded-lg" />
          </div>
        )}
      </div>
    </aside>
  );
}
