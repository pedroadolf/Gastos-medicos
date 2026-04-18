'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Shield, Activity, Plus, Moon, Sun, User, FileText, Settings, BarChart3, Bell 
} from 'lucide-react';
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Copilot } from "@/components/layout/Copilot";

function GlobalTopNav({ theme, toggleTheme }: { theme: string, toggleTheme: () => void }) {
  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Nuevo Trámite', href: '/nuevo-tramite', icon: Plus },
    { name: 'Mis Trámites', href: '/tramites', icon: FileText },
    { name: 'Observabilidad', href: '/observabilidad', icon: Activity },
    { name: 'Configuración', href: '/settings', icon: Settings }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav className="gmm-header-nav flex justify-between items-center max-w-6xl mx-auto backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gmm-accent rounded-2xl flex items-center justify-center shadow-lg shadow-gmm-accent/20 text-gmm-text">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gmm-text">
              GMM <span className="text-gmm-text/40 tracking-tighter uppercase text-[9px] font-black block leading-[0.5]">MetLife</span>
            </h1>
          </div>
        </div>
        
        <ul className="hidden lg:flex gap-8 items-center text-[10px] font-black uppercase tracking-widest text-gmm-text/50">
          {navItems.map((item) => (
            <li key={item.name}>
              <a 
                href={item.href} 
                className={`transition-all duration-300 hover:text-gmm-accent ${
                  pathname === item.href ? 'text-gmm-accent border-b-2 border-gmm-accent pb-1' : ''
                }`}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gmm-bg border border-gmm-border/50 text-gmm-text hover:bg-gmm-accent hover:text-white transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button className="bg-gmm-text text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gmm-accent transition-all cursor-pointer shadow-lg shadow-gmm-text/10">
            Nuevo Trámite +
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gmm-bg border border-gmm-border/50 flex items-center justify-center text-gmm-text shadow-sm overflow-hidden">
             <User size={20} />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('gmm-theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('gmm-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={`min-h-screen bg-gmm-bg flex flex-col font-plus-jakarta selection:bg-gmm-accent/30 selection:text-white transition-all duration-500`}>
      
      <GlobalTopNav theme={theme} toggleTheme={toggleTheme} />

      {/* The Central Timeline Backbone (Cardiology Canvas style) */}
      <div className="timeline-line hidden lg:block"></div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden pt-20">
        <main className="flex-1 overflow-y-auto relative z-10 p-8 custom-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>

        <Copilot />
        <MobileBottomNav className="md:hidden fixed bottom-1 left-4 right-4 z-50 rounded-3xl" />
      </div>
    </div>
  );
}
