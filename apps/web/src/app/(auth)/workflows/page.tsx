'use client';

import React from 'react';
import { Network, Plus, Search, ChevronLeft, Zap, Play, Settings2, BarChart3, Lock } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href="/tramites" 
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-medical-cyan bg-slate-900 border border-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
      >
        <ChevronLeft size={16} />
        Regresar al Dashboard
      </Link>

      {/* 📂 HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 backdrop-blur-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
              Automation Engine
            </span>
            <span className="text-white/20 text-[10px] uppercase font-black tracking-widest">•</span>
            <span className="text-emerald-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
              v1.0-alpha
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
            Flujos de <span className="text-blue-500">Trabajo</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-medium">
            Gestiona la orquestación de tus agentes y procesos automatizados de reembolsos.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-95 opacity-50 cursor-not-allowed">
            <BarChart3 size={20} />
            <span className="text-sm font-bold">Monitor</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 font-bold rounded-2xl border border-blue-500/30 opacity-50 cursor-not-allowed">
            <Plus size={20} />
            <span className="text-sm">Nuevo Workflow</span>
          </button>
        </div>
      </div>

      {/* 🚧 COMING SOON PLATE */}
      <div className="relative group overflow-hidden bg-slate-900/40 rounded-[3rem] border border-slate-800 p-20 flex flex-col items-center justify-center text-center space-y-6">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[120px] -z-10" />

        <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl scale-110 group-hover:rotate-12 transition-transform duration-500">
           <Network size={48} strokeWidth={1} />
        </div>

        <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">Módulo en Construcción</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Estamos afinando los motores de orquestación n8n y LangChain. Este módulo estará disponible para control total de workflows próximamente.
            </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 border border-slate-800/50 rounded-full text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            <Lock size={12} className="text-medical-cyan" />
            Acceso Restringido • Dev Mode
        </div>
      </div>

      {/* FOOTER STATS MOCK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-30 grayscale">
         {[1,2,3,4].map(i => (
           <div key={i} className="p-6 bg-slate-900/20 border border-slate-800/50 rounded-2xl h-24 shrink-0" />
         ))}
      </div>
    </div>
  );
}
