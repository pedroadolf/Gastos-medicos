"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Copilot } from "@/components/layout/Copilot";

function FolderCeja({ theme, toggleTheme }: { theme: string, toggleTheme: () => void }) {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-between items-center px-6 py-4 bg-white dark:bg-[#1E293B] border-b border-[#EFEDE8] dark:border-slate-700/50 gap-4">
      {/* Izquierda */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-[20px] font-bold text-[#1A2A3A] dark:text-white m-0">Dashboard GMM</h1>
        <span className="text-[13px] text-[#6B7280] dark:text-slate-400">Claudia • Titular, 57 años</span>
      </div>

      {/* Centro: Menú Pills */}
      <div className="flex-1 flex justify-center order-3 md:order-none w-full md:w-auto">
        <nav className="flex gap-1.5 bg-[#F8F7F4] dark:bg-slate-800 p-1 rounded-[48px]">
          {[
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Pólizas', path: '/polizas' },
            { name: 'Siniestros', path: '/tramites' },
            { name: 'Asegurados', path: '/asegurados' },
            { name: 'Reportes', path: '/reportes' },
            { name: 'Configuración', path: '/configuracion' },
          ].map(item => (
            <Link
              key={item.name}
              href={item.path}
              className={`px-4 py-1.5 rounded-[40px] text-[13px] font-medium transition-all ${
                pathname === item.path || (pathname === '/' && item.path === '/dashboard')
                  ? 'bg-[#2D6A4F] text-white'
                  : 'text-[#4B5563] dark:text-slate-300 hover:bg-[#E5E7EB] dark:hover:bg-slate-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#4B5563] dark:text-slate-300 cursor-pointer font-medium">Abr 2026 ▼</span>
        <button onClick={toggleTheme} className="bg-transparent border-none text-[18px] cursor-pointer p-1">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="w-8 h-8 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white text-[12px] font-semibold">
          C
        </div>
      </div>
    </div>
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
    <div className={`min-h-screen bg-gmm-bg flex justify-center items-start pt-10 pb-10 px-4 font-plus-jakarta selection:bg-gmm-accent/30 selection:text-white transition-all duration-500`}>
       
       {/* El Folder Contenedor Principal */}
       <div className="w-full max-w-[1200px] bg-white dark:bg-[#1E293B] rounded-[24px] shadow-[0px_12px_28px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
           
           <FolderCeja theme={theme} toggleTheme={toggleTheme} />
           
           <div className="p-6 md:p-8">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                {children}
              </div>
           </div>
       </div>

       <Copilot />
    </div>
  );
}
