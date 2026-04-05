'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  MoreVertical,
  ExternalLink,
  ChevronRight,
  MonitorPlay,
  Zap,
  TrendingUp,
  Brain,
  DollarSign,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function DocumentosPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/afectados")
      .then(res => res.json())
      .then(d => {
        if (d.asegurados) setData(d.asegurados);
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
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Vault de Documentos</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.3em]">Centralized Document Repository // Neural Grid</p>
          </div>
          <div className="flex gap-4">
             <button className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl flex items-center gap-2 hover:text-white transition-all text-xs">
                <RefreshCw size={18} />
                SINCRONIZAR DRIVE
             </button>
             <button className="px-6 py-3 bg-medical-cyan text-slate-950 font-black rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-medical-cyan/20 text-xs">
                <Plus size={18} strokeWidth={3} />
                NUEVO ARCHIVO
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Statistics Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 flex flex-col md:flex-row gap-4 p-2 bg-slate-900/40 rounded-[32px] border border-slate-800 backdrop-blur-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar documentos por siniestro, asegurado o tipo..."
                        className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 p-1">
                    <FilterButton label="Tipo" />
                    <FilterButton label="Siniestro" />
                </div>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-[32px] flex items-center justify-between px-8">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Vault</p>
                    <p className="text-xl font-black text-white italic tracking-tighter">{data.length * 5}+ <span className="text-medical-cyan text-xs">Docs</span></p>
                </div>
                <div className="w-10 h-10 rounded-full bg-medical-cyan/10 border border-medical-cyan/20 flex items-center justify-center text-medical-cyan">
                    <TrendingUp size={20} />
                </div>
            </div>
        </div>

        {/* Categories / Recents */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <CategoryCard title="Facturas XML/PDF" count={data.length * 2} icon={<DollarSign className="text-medical-cyan" />} color="cyan" />
            <CategoryCard title="Informes Médicos" count={data.length} icon={<FileText className="text-medical-emerald" />} color="emerald" />
            <CategoryCard title="Identificaciones" count={data.length} icon={<ShieldCheck className="text-medical-amber" />} color="amber" />
            <CategoryCard title="Expedientes ZIP" count={data.length} icon={<FolderOpen className="text-medical-violet" />} color="violet" />
        </div>

        {/* Document List Table */}
        <div className="bg-slate-900/40 rounded-[40px] border border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white italic">Stream de Documentos Recientes</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">Cloud Sync (OK)</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/40 border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Nombre Archivo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Siniestro / Asegurado</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Tipo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Fecha</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-20 text-center italic text-slate-500">Accediendo al servidor de almacenamiento...</td></tr>
                        ) : data.slice(0, 8).map((doc, idx) => (
                            <tr key={idx} className="group hover:bg-slate-900/60 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-medical-cyan group-hover:scale-110 transition-transform">
                                            {idx % 2 === 0 ? <FileText size={20} /> : <FolderOpen size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-medical-cyan transition-colors">factura_GMM_{doc.siniestroNum || '772'+idx}.pdf</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">3.2 MB // PDF-VERSION-V1</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[11px] font-black text-slate-400 uppercase group-hover:text-white transition-all">{doc.siniestroNum || 'SIN-NUEVO'}</p>
                                    <p className="text-xs text-slate-600 truncate max-w-[200px]">{doc.nombre}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[9px] font-black px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-500 rounded-lg group-hover:text-medical-cyan group-hover:border-medical-cyan/30 transition-all uppercase tracking-tighter">FACTURA</span>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-[11px] font-black text-slate-400 italic">Abril 04, 2026</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase">10:45 AM</p>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition-all">
                                            <Download size={16} />
                                        </button>
                                        <button className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-medical-cyan hover:bg-medical-cyan/10 transition-all">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-6 bg-slate-950/40 text-center">
                <button className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-medical-cyan transition-all">Ver todos los archivos de este mes →</button>
            </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, count, icon, color }: any) {
    const colors: any = {
        cyan: 'border-medical-cyan/20 bg-medical-cyan/5 group-hover:border-medical-cyan/50',
        emerald: 'border-medical-emerald/20 bg-medical-emerald/5 group-hover:border-medical-emerald/50',
        amber: 'border-medical-amber/20 bg-medical-amber/5 group-hover:border-medical-amber/50',
        violet: 'border-medical-violet/20 bg-medical-violet/5 group-hover:border-medical-violet/50',
    };

    return (
        <div className={`p-8 rounded-[40px] border transition-all hover:scale-[1.02] cursor-pointer group ${colors[color]}`}>
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{title}</h4>
            <div className="text-3xl font-black text-white italic tracking-tighter">{count} <span className="text-xs text-slate-600">ITEMS</span></div>
        </div>
    );
}

function FilterButton({ label }: { label: string }) {
    return (
        <button className="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2">
            {label}
            <ChevronRight size={14} className="rotate-90 opacity-40" />
        </button>
    );
}
