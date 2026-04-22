"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Copilot } from "@/components/layout/Copilot";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    <div className={`min-h-screen bg-[#A1A4A6] flex justify-center items-start py-10 px-4 font-plus-jakarta`}>
       
       <div className="w-full max-w-[1300px] relative">
          
          {/* FOLDER SHAPE BACKGROUND */}
          <div className="absolute top-0 left-0 w-[380px] h-[180px] bg-[#F2F2F2] rounded-t-[32px] shadow-sm"></div>
          <div className="absolute top-[60px] left-[380px] right-0 h-[120px] bg-[#F2F2F2] rounded-tr-[32px] rounded-tl-[24px] shadow-sm">
             {/* Smooth inverse curve */}
             <div className="absolute top-0 -left-[24px] w-[24px] h-[24px] bg-transparent" style={{ borderTopRightRadius: '24px', boxShadow: '12px -12px 0 0 #F2F2F2' }}></div>
          </div>

          {/* CONTENT LAYER */}
          <div className="relative z-10 pt-[24px] px-6">
              
              {/* HEADER ROW */}
              <div className="flex flex-col md:flex-row">
                 
                 {/* Left Tab Content */}
                 <div className="w-full md:w-[340px] pl-6 pt-2">
                    <h1 className="text-[26px] font-medium text-[#1A2A3A] tracking-tight mb-6">Dashboard GMM</h1>
                 </div>

                 {/* Right Area (Pills Menu) */}
                 <div className="flex-1 md:pl-12 pt-[50px] flex justify-between items-center pr-6">
                    <nav className="flex gap-2">
                      {[
                        { name: 'Dashboard', path: '/dashboard' },
                        { name: 'Pólizas', path: '/polizas' },
                        { name: 'Siniestros', path: '/tramites' },
                        { name: 'Asegurados', path: '/asegurados' },
                        { name: 'Reportes', path: '/reportes' },
                      ].map(item => {
                        const isActive = pathname === item.path || (pathname === '/' && item.path === '/dashboard');
                        return (
                          <Link key={item.name} href={item.path} 
                                className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2
                                ${isActive ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:bg-white/40'}`}>
                            {item.name}
                          </Link>
                        )
                      })}
                    </nav>

                    <div className="flex items-center gap-4">
                       <span className="text-sm text-gray-600 font-medium cursor-pointer">Abr 2026 ▼</span>
                       <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white/60 hover:bg-white shadow-sm flex items-center justify-center text-gray-600 transition-all">🌙</button>
                    </div>
                 </div>
              </div>

              {/* INNER CANVAS */}
              <div className="mt-8 bg-[#F2F2F2] rounded-[32px] p-8 shadow-inner min-h-[700px] border border-white">
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                 </div>
              </div>

          </div>
       </div>

       <Copilot />
    </div>
  );
}
