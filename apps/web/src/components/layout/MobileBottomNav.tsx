// apps/web/src/components/layout/MobileBottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Activity, 
  PlusCircle, 
  FileCheck, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Inicio', icon: Home, href: '/dashboard' },
    { label: 'Trámites', icon: Activity, href: '/tramites' },
    { label: 'Trámite', icon: PlusCircle, href: '/nuevo-tramite', primary: true },
    { label: 'Conciliar', icon: FileCheck, href: '/registro-respuesta' }, 
    { label: 'Ajustes', icon: Settings, href: '/configuracion' },
  ];

  return (
    <nav className={cn(
      "h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40 safe-bottom",
      className
    )}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.primary 
          ? pathname.startsWith(item.href) 
          : pathname === item.href;
        const Icon = item.icon;

        if (item.primary) {
          return (
            <Link 
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-8"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFAA00] flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 scale-110 active:scale-95 transition-all">
                <Icon size={24} strokeWidth={3} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link 
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              isActive ? "text-[#FFAA00]" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              isActive ? "text-[#FFAA00]" : "text-slate-500"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
