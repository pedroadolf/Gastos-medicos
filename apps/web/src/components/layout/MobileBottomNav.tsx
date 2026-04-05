// apps/web/src/components/layout/MobileBottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  User, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists given package.json dependencies

export function MobileBottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Inicio', icon: Home, href: '/dashboard' },
    { label: 'Siniestros', icon: FileText, href: '/siniestros' },
    { label: 'Nuevo', icon: PlusCircle, href: '/siniestros/nuevo', primary: true },
    { label: 'Agentes', icon: User, href: '/agentes' }, 
    { label: 'Ajustes', icon: Settings, href: '/configuracion' },
  ];

  return (
    <nav className={cn(
      "h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-40 safe-bottom",
      className
    )}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.primary) {
          return (
            <Link 
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-8"
            >
              <div className="w-14 h-14 rounded-full bg-medical-cyan flex items-center justify-center shadow-lg shadow-medical-cyan/30 text-slate-950 scale-110 active:scale-95 transition-all">
                <Icon size={24} strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2 lowercase tracking-wide">
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
              isActive ? "text-medical-cyan" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn(
              "text-[10px] font-medium",
              isActive ? "text-medical-cyan" : "text-slate-500"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
