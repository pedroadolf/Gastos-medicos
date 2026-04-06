// apps/web/src/app/(auth)/agentes/page.tsx
'use client';

import { 
    Users, 
    Shield, 
    Plus, 
    Search, 
    Building2, 
    UserPlus, 
    Brain, 
    Zap, 
    Activity, 
    ChevronRight, 
    AlertCircle,
    CheckCircle2,
    Play,
    Settings2,
    BarChart3,
    ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function AgentesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Datos simulados de agentes (esto luego vendrá de n8n/Supabase)
    const agents = [
        {
            id: 'agent-1',
            name: 'Orquestador GMM',
            role: 'Cerebro Central',
            status: 'online',
            uptime: '99.9%',
            successRate: 98,
            tasksToday: 42,
            lastProcessed: 'Hace 5 min',
            type: 'core'
        },
        {
            id: 'agent-2',
            name: 'Extractor Óptico',
            role: 'OCR & Data Extraction',
            status: 'busy',
            uptime: '98.5%',
            successRate: 95,
            tasksToday: 128,
            lastProcessed: 'En ejecución...',
            type: 'extraction'
        },
        {
            id: 'agent-3',
            name: 'Validador Médico',
            role: 'Business Rules Auditor',
            status: 'online',
            uptime: '99.2%',
            successRate: 99,
            tasksToday: 64,
            lastProcessed: 'Hace 12 min',
            type: 'audit'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-6">
            <Link 
                href="/tramites" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-medical-cyan bg-slate-900 border border-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
                <ChevronLeft size={16} />
                Regresar al Dashboard
            </Link>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="p-2 rounded-lg bg-medical-cyan/10 border border-medical-cyan/20">
                                <Brain className="w-5 h-5 text-medical-cyan" />
                             </div>
                             <span className="text-xs font-black text-medical-cyan uppercase tracking-widest">Neural Network OS</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-100 tracking-tighter">Gestión de Agentes</h1>
                        <p className="text-slate-500 mt-2 max-w-xl">
                            Monitoreo y orquestación de la fuerza laboral digital. Controla el rendimiento de tus agentes de IA en tiempo real.
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-95">
                            <BarChart3 size={20} />
                            <span className="text-sm font-bold">Reportes</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-medical-cyan hover:bg-medical-cyan/90 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-medical-cyan/20 active:scale-95">
                            <Plus size={20} strokeWidth={3} />
                            <span className="text-sm">Configurar Agente</span>
                        </button>
                    </div>
                </div>

                {/* Agent Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <SimpleStatCard label="Ejecuciones Totales" value="2,481" delta="+12%" icon={<Zap className="text-medical-cyan" />} />
                    <SimpleStatCard label="Tasa de Éxito Global" value="97.8%" delta="+2.5%" icon={<CheckCircle2 className="text-medical-emerald" />} />
                    <SimpleStatCard label="Latencia Promedio" value="1.2s" delta="-300ms" icon={<Activity className="text-medical-violet" />} />
                </div>

                {/* Filters */}
                <div className="flex border-b border-slate-800/50 mb-8 gap-8 overflow-x-auto no-scrollbar">
                    <FilterTab label="Todos los Agentes" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                    <FilterTab label="Core Workflows" active={selectedCategory === 'core'} onClick={() => setSelectedCategory('core')} />
                    <FilterTab label="Extracción" active={selectedCategory === 'extraction'} onClick={() => setSelectedCategory('extraction')} />
                    <FilterTab label="Auditoría" active={selectedCategory === 'audit'} onClick={() => setSelectedCategory('audit')} />
                </div>

                {/* Agents List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {agents.map((agent) => (
                        <div key={agent.id} className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-8 transition-all hover:bg-slate-900/60 hover:border-medical-cyan/30">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform`}>
                                        <Brain className={`w-8 h-8 ${agent.status === 'online' ? 'text-medical-cyan' : 'text-amber-500 animate-pulse'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white transition-colors group-hover:text-medical-cyan">{agent.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{agent.role}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${agent.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                    {agent.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Success Rate</p>
                                    <p className="text-lg font-black text-white">{agent.successRate}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Uptime</p>
                                    <p className="text-lg font-black text-white">{agent.uptime}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    Último: {agent.lastProcessed}
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                                        <Settings2 size={18} />
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            const btn = document.getElementById(`btn-${agent.id}`);
                                            if (btn) btn.classList.add('animate-pulse', 'opacity-50');
                                            
                                            try {
                                                const res = await fetch('/api/agentes', {
                                                    method: 'POST',
                                                    body: JSON.stringify({ action: 'diagnostic', agentId: agent.id })
                                                });
                                                const data = await res.json();
                                                alert(data.success ? `✅ Diagnóstico enviado para ${agent.name}` : `❌ Error: ${data.error}`);
                                            } catch (e) {
                                                alert('❌ Error de conexión con el OS');
                                            } finally {
                                                if (btn) btn.classList.remove('animate-pulse', 'opacity-50');
                                            }
                                        }}
                                        id={`btn-${agent.id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        <Play size={16} fill="currentColor" />
                                        <span className="text-xs">Run Diagnostic</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SimpleStatCard({ label, value, delta, icon }: any) {
    return (
        <div className="p-6 rounded-[32px] border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {icon}
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 ${delta.startsWith('+') ? 'text-emerald-500' : 'text-medical-cyan'}`}>
                    {delta}
                </span>
            </div>
            <div>
                <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
            </div>
        </div>
    );
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`pb-4 px-2 text-sm font-bold transition-all relative ${active ? 'text-medical-cyan' : 'text-slate-500 hover:text-slate-300'}`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-cyan animate-in fade-in duration-300" />}
        </button>
    );
}

const Clock = ({ className, size = 16 }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
