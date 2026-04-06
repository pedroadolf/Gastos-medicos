'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Role } from './sidebar.config';

type Props = {
  label: string;
  href: string;
  icon: any;
  badge?: 'NEW' | 'AI' | 'BETA';
  destructive?: boolean;
  roles?: Role[];
  variant?: 'default' | 'destructive';
};

export function SidebarItem({ 
  label, 
  href, 
  icon: Icon, 
  badge, 
  destructive 
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center justify-between group px-4 py-2.5 rounded-xl cursor-pointer transition-all border border-transparent",
          isActive
            ? "bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20 shadow-lg shadow-medical-cyan/5"
            : "text-slate-400 hover:text-white hover:bg-white/[0.03] hover:border-white/5",
          destructive && "hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon 
              size={18} 
              className={cn(
                "transition-all",
                isActive ? "text-medical-cyan scale-110" : "group-hover:text-medical-cyan",
                destructive && !isActive && "group-hover:text-red-400"
              )} 
            />
          )}
          <span className={cn(
            "text-sm tracking-tight",
            isActive ? "font-bold" : "font-medium"
          )}>
            {label}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {badge && (
            <span className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded-md border",
              badge === 'NEW' ? "bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20" : 
              badge === 'AI' ? "bg-purple-950/30 text-purple-400 border-purple-900/50" :
              "bg-amber-950/30 text-amber-500 border-amber-900/50"
            )}>
              {badge}
            </span>
          )}
          {isActive && (
            <motion.div 
               layoutId="active-indicator"
               className="w-1.5 h-1.5 rounded-full bg-medical-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
            />
          )}
        </div>
      </motion.div>
    </Link>
  );
}
