'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Sidebar() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useUserRole();

  // Simplificamos la navegación SaaS a lo mínimo esencial dictado por SRE
  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workflows', href: '/dashboard/workflows', icon: GitBranch },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0B0F14] border-r border-[#1F2A37] text-[#E5E7EB] flex flex-col p-5">
      
      {/* ⚡ Branding Logo Minimalista */}
      <div className="font-semibold mb-8 text-base tracking-wide flex items-center gap-2 pl-3">
        <span className="text-yellow-500">⚡</span> GMM Platform
      </div>

      {/* 🧭 Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-[#121821] text-white" 
                    : "text-[#9CA3AF] hover:bg-[#0F172A] hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-500" : "text-[#9CA3AF]")} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* 👤 Config Bottom */}
      <div className="mt-auto pt-4 border-t border-[#1F2A37]/50">
        <Link href="/dashboard/settings">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-[#0F172A] text-[#9CA3AF] hover:text-white text-sm font-medium"
          >
            Cuenta
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
