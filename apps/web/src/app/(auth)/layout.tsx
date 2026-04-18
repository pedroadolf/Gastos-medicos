'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Shield, Activity, Plus, Moon, Sun, User, FileText, Settings, BarChart3, Bell, Search 
} from 'lucide-react';
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Copilot } from "@/components/layout/Copilot";

function GlobalTopNav({ theme, toggleTheme }: { theme: string, toggleTheme: () => void }) {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <nav className="gmm-header-nav flex justify-between items-center max-w-[1500px] mx-auto backdrop-blur-3xl bg-white/70 dark:bg-black/40">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
           <div className="w-10 h-10 bg-gmm-text rounded-2xl flex items-center justify-center text-gmm-accent shadow-xl">
             <Activity size={20} />
           </div>
           <div>
             <h1 className="text-xl font-black tracking-tighter text-gmm-text leading-none">Diagnostic</h1>
             <p className="text-[9px] font-black text-gmm-text-muted uppercase tracking-[0.3em] mt-1">GMM PLATFORM V12</p>
           </div>
        </div>

        {/* Center: Search / Ops Monitor */}
        <div className="hidden xl:flex items-center bg-gmm-bg/50 rounded-2xl px-6 py-2 border border-gmm-border/30 w-[400px] group transition-all focus-within:w-[500px] focus-within:border-gmm-accent">
           <Search size={16} className="text-gmm-text/40 group-focus-within:text-gmm-accent" />
           <input 
             type="text" 
             placeholder="Buscar Siniestros, Asegurados o Facturas..." 
             className="bg-transparent border-none outline-none px-4 text-[10px] font-black uppercase tracking-widest text-gmm-text w-full placeholder:text-gmm-text/20"
           />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex gap-2">
            {['Visitas', 'Medicamentos', 'Labs', 'Genética'].map(item => (
              <button key={item} className="px-4 py-2 rounded-xl bg-gmm-bg/30 text-[9px] font-black uppercase tracking-widest text-gmm-text-muted hover:bg-white hover:text-gmm-text transition-all border border-transparent hover:border-gmm-border/50">
                {item}
              </button>
            ))}
          </div>
          
          <div className="w-px h-8 bg-gmm-border/30 mx-2" />

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gmm-card border border-gmm-border/50 text-gmm-text hover:bg-gmm-accent hover:text-white transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <button className="bg-gmm-danger text-white p-2.5 rounded-xl hover:scale-105 transition-all shadow-lg shadow-gmm-danger/20">
            <Plus size={18} />
          </button>

          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gmm-bg flex items-center justify-center text-gmm-text">
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
