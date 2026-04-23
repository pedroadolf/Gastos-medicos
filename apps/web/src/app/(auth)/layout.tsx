"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Activity, Plus, Moon, Sun, User, FileText, Settings, 
  BarChart3, Search, Bell
} from 'lucide-react';
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Copilot } from "@/components/layout/Copilot";

const NAV_ITEMS = [
  { name: 'Dashboard',           path: '/dashboard',           icon: <BarChart3 size={15} /> },
  { name: 'Nuevo Trámite',       path: '/nuevo-tramite',       icon: <Plus size={15} /> },
  { name: 'Mis Trámites',        path: '/tramites',            icon: <Activity size={15} /> },
  { name: 'Reg. Documento',      path: '/registro-respuesta',  icon: <FileText size={15} /> },
  { name: 'Configuración',       path: '/configuracion',       icon: <Settings size={15} /> },
];

function GlobalTopNav({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  const pathname = usePathname();

  return (
    <header
      style={{ background: 'var(--gmm-topbar-bg)' }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-6 shadow-lg"
    >
      {/* ── Branding ── */}
      <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md
                     transition-transform duration-200 group-hover:scale-110"
          style={{ background: '#FFAA00' }}
        >
          <Activity size={18} style={{ color: '#343434' }} />
        </div>
        <div className="hidden sm:block leading-none">
          <p className="text-white font-black text-base tracking-tight leading-none">GMM</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] mt-0.5" style={{ color: '#D8D9D7', opacity: 0.6 }}>
            Platform v2
          </p>
        </div>
      </Link>

      {/* ── Divider ── */}
      <div className="w-px h-8 shrink-0" style={{ background: 'rgba(216,217,215,0.15)' }} />

      {/* ── Nav Items ── */}
      <nav className="hidden lg:flex items-center gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase
                         tracking-widest transition-all duration-200 relative"
              style={{
                color:      isActive ? '#343434'    : 'rgba(216,217,215,0.7)',
                background: isActive ? '#FFAA00'    : 'transparent',
                boxShadow:  isActive ? '0 2px 8px rgba(255,170,0,0.30)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#FFAA00';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,170,0,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(216,217,215,0.7)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ── Search ── */}
      <div
        className="hidden xl:flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-200
                   focus-within:ring-2 min-w-[240px]"
        style={{
          background: 'rgba(216,217,215,0.07)',
          border:     '1px solid rgba(216,217,215,0.10)',
          '--tw-ring-color': '#FFAA00',
        } as React.CSSProperties}
      >
        <Search size={14} style={{ color: '#D8D9D7', opacity: 0.4 }} className="shrink-0" />
        <input
          type="text"
          placeholder="Buscar siniestros, asegurados..."
          className="bg-transparent border-none outline-none text-[11px] font-semibold w-full
                     placeholder:opacity-40"
          style={{ color: '#D8D9D7' }}
        />
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                     hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(216,217,215,0.08)',
            border:     '1px solid rgba(216,217,215,0.12)',
            color:      '#D8D9D7',
          }}
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                     hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(216,217,215,0.08)',
            border:     '1px solid rgba(216,217,215,0.12)',
            color:      '#D8D9D7',
          }}
          aria-label="Notificaciones"
        >
          <Bell size={15} />
          {/* Punto rojo solo si hay alertas */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#B22B21', boxShadow: '0 0 6px rgba(178,43,33,0.7)' }}
          />
        </button>

        {/* User avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
                     duration-200 hover:scale-110 cursor-pointer"
          style={{ background: 'rgba(216,217,215,0.15)', border: '1px solid rgba(216,217,215,0.20)' }}
        >
          <User size={16} style={{ color: '#D8D9D7' }} />
        </div>
      </div>
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
    <div className="min-h-screen flex flex-col font-plus-jakarta transition-all duration-500"
         style={{ background: 'var(--gmm-bg)', color: 'var(--gmm-text)' }}>
      
      <GlobalTopNav theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content — offset for fixed topbar (h-16 = 64px) */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden pt-16">
        <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-8 custom-scrollbar">
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
