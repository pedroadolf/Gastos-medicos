'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  ShieldCheck, 
  History,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AseguradosPage() {
  const router = useRouter();
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/afectados")
      .then(res => res.json())
      .then(data => {
        if (data.asegurados) setAsegurados(data.asegurados);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Directorio de Asegurados</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Master Patient Index // Secure Grid</p>
          </div>
          <button className="px-6 py-3 bg-medical-cyan text-slate-950 font-black rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-medical-cyan/20 text-xs">
            <Plus size={18} strokeWidth={3} />
            REGISTRAR ASEGURADO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/40 rounded-[32px] border border-slate-800 backdrop-blur-sm">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar asegurado por nombre, póliza o RFC..."
                    className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
            </div>
            <div className="flex gap-2 p-1">
                <button className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">Empresa</button>
                <button className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">Plan</button>
                <button className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-medical-cyan transition-all">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
            <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-medical-cyan/20 border-t-medical-cyan rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 italic font-medium">Accediendo al registro maestro...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {asegurados.map((person, idx) => (
                    <div key={idx} className="group bg-slate-900/30 border border-slate-800 rounded-[40px] p-8 hover:border-slate-700 hover:bg-slate-900/50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-medical-cyan/5 blur-[60px] group-hover:bg-medical-cyan/10 transition-all" />
                        
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-medical-cyan group-hover:scale-110 transition-transform">
                                <ShieldCheck size={28} strokeWidth={1.5} />
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black px-2 py-1 bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 rounded-lg uppercase tracking-tighter">Plan {person.plan || 'Platinum'}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white tracking-tight mb-1 group-hover:text-medical-cyan transition-colors">{person.nombre}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{person.empresa || 'Empresa Privada'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/50">
                                <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Póliza</p>
                                <p className="text-xs font-bold text-slate-300 truncate">{person.poliza || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/50">
                                <p className="text-[9px] text-slate-600 font-black uppercase mb-1">RFC</p>
                                <p className="text-xs font-bold text-slate-300 truncate">{person.rfc || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:border-slate-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                                <History size={14} />
                                Historial
                            </button>
                            <button 
                                onClick={() => router.push('/siniestros')}
                                className="p-3 bg-slate-800 hover:bg-medical-cyan hover:text-slate-950 rounded-xl transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
