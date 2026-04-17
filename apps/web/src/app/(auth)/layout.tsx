'use client';

import { usePathname } from 'next/navigation';
import {
  Shield, Activity, Plus, Moon, User, FileText, Settings, BarChart3, Bell
} from 'lucide-react';
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Copilot } from "@/components/layout/Copilot";

function GlobalTopNav() {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Nuevo Trámite', href: '/nuevo-tramite', icon: Plus },
    { name: 'Mis Trámites', href: '/tramites', icon: FileText },
    { name: 'Observabilidad', href: '/observabilidad', icon: Activity },
    { name: 'Configuración', href: '/settings', icon: Settings }
  ];

  return (
    <header className="gmm-header-nav fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gmm-accent rounded-2xl flex items-center justify-center shadow-lg shadow-gmm-accent/20 text-gmm-text">
            <Shield size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-gmm-text tracking-tighter uppercase italic">GMM App</h1>
          <p className="text-[9px] font-bold text-gmm-text-muted uppercase tracking-widest">MetLife #GMM-98765</p>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-2">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              pathname.includes(item.href) || (item.href === '/dashboard' && pathname === '/dashboard')
                ? 'bg-gmm-accent text-gmm-text shadow-lg shadow-gmm-accent/10' 
                : 'text-gmm-text-muted hover:text-gmm-text hover:bg-gmm-border/30'
            }`}
          >
            {item.name}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-gmm-border/30 flex items-center justify-center text-gmm-text hover:bg-gmm-border transition-colors">
          <Moon size={18} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gmm-border">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gmm-text uppercase">Claudia Soto</p>
            <p className="text-[9px] font-bold text-gmm-text-muted uppercase italic">Titular</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gmm-border flex items-center justify-center text-gmm-text-muted font-bold overflow-hidden border-2 border-white shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-folder flex flex-col font-plus-jakarta selection:bg-gmm-accent/30 transition-colors overflow-x-hidden">
            
            <GlobalTopNav />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">

                {/* Content Surface */}
                <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pt-24">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>

                <Copilot />
                <MobileBottomNav className="md:hidden fixed bottom-0 left-0 right-0 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gmm-border bg-white" />
            </div>
        </div>
    );
}
