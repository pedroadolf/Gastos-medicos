import React from 'react';
import { Folder, Search, FileText, Download, Filter, MoreHorizontal, ExternalLink } from 'lucide-react';

export default function DocumentosPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 📂 HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900/40 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 backdrop-blur-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-100 dark:border-emerald-800/50">
              Gestión Documental
            </span>
            <span className="text-slate-300 dark:text-white/20 text-[10px] uppercase font-black tracking-widest">•</span>
            <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
              Cloud Storage Enabled
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter sm:text-5xl">
            Repositorio de <span className="text-emerald-500">Documentos</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg font-medium">
            Accede a tus pólizas, facturas y dictámenes médicos procesados por el motor de IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group/search">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-emerald-500 transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Buscar documento..." 
               className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all w-64"
             />
           </div>
        </div>
      </div>

      {/* 📋 DOCUMENTS TABLE (Mock State for now) */}
      <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {[1, 2, 3].map((doc) => (
                <tr key={doc} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">Factura_Medica_{doc}0422.pdf</div>
                        <div className="text-xs text-slate-500">2.4 MB</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-md">
                      FACTURA
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium tracking-tight">
                    Oct 12, 2023
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE HELPER IF NO DATA */}
        <div className="p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
             <Folder size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sin documentos recientes</h3>
           <p className="text-slate-500 text-sm max-w-sm mx-auto">
             Tus documentos aparecerán aquí una vez que subas expedientes en el módulo de Nuevo Trámite.
           </p>
        </div>
      </div>
    </div>
  );
}
