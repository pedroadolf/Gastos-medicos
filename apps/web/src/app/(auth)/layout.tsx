"use client";

import Link from 'next/link';
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
    <header className="fixed top-4 left-6 right-6 z-50">
      <nav className="flex justify-between items-center max-w-[1500px] mx-auto p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-xl">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
           <Link href="/dashboard" className="flex items-center gap-6 group">
             <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-xl group-hover:scale-110 transition-transform">
               <Activity size={20} />
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Diagnostic</h1>
               <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">GMM PLATFORM V12</p>
             </div>
           </Link>
        </div>

        {/* Center: Search / Ops Monitor */}
        <div className="hidden xl:flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl px-6 py-2 border border-slate-200 dark:border-white/10 w-[400px] group transition-all focus-within:w-[500px] focus-within:border-blue-500">
           <Search size={16} className="text-slate-400 group-focus-within:text-blue-500" />
           <input 
             type="text" 
             placeholder="Buscar Siniestros, Asegurados o Facturas..." 
             className="bg-transparent border-none outline-none px-4 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white w-full placeholder:text-slate-400"
           />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-4">
            {[
              { name: 'Dashboard', path: '/dashboard', icon: <BarChart3 size={16} /> },
              { name: 'Nuevo Trámite', path: '/nuevo-tramite', icon: <Plus size={16} /> },
              { name: 'Registrar Documento', path: '/registro-respuesta', icon: <FileText size={16} /> },
              { name: 'Mis Trámites', path: '/tramites', icon: <Activity size={16} /> },
              { name: 'Configuración', path: '/configuracion', icon: <Settings size={16} /> },
            ].map(item => (
              <Link
                key={item.name} 
                href={item.path}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest transition-all border border-transparent
                  ${pathname === item.path 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <div className="w-10 h-10 rounded-full border-2 border-white dark:border-white/10 shadow-md overflow-hidden bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
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
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('gmm-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={`min-h-screen bg-gmm-bg flex flex-col font-plus-jakarta transition-all duration-500`}>
      
      <GlobalTopNav theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden pt-28">
        <main className="flex-1 overflow-y-auto relative z-10 p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>

        <Copilot />
        <MobileBottomNav className="md:hidden fixed bottom-1 left-4 right-4 z-50 rounded-3xl" />
      </div>
    </div>
  );
}
