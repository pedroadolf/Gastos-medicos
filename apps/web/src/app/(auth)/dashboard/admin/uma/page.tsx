'use client';

import { useState } from 'react';
import { upsertUMAConfig } from '@/app/actions/uma';
import { ShieldCheck, Calendar, DollarSign, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminUMA() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const year = Number(formData.get('year'));
    const uma = Number(formData.get('uma'));
    const fecha = String(formData.get('fecha'));
    const fuente = String(formData.get('fuente'));

    try {
      await upsertUMAConfig(year, uma, fecha, fuente);
      setStatus({ type: 'success', message: `UMA ${year} guardada correctamente.` });
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error al guardar UMA' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gmm-bg p-8">
      <div className="max-w-xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-gmm-accent transition-colors mb-8 uppercase tracking-widest">
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>

        <div className="gmm-box p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gmm-accent/10 rounded-2xl flex items-center justify-center text-gmm-accent">
                <Calendar size={24} />
              </div>
              <div>
                <h1 className="gmm-title-h1 text-slate-900 dark:text-white">Admin: Actualizar UMA</h1>
                <p className="gmm-text-small text-slate-400 dark:text-slate-300 font-bold uppercase tracking-widest mt-1">Configuración oficial DOF</p>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl mb-8 flex gap-4">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 font-bold">
                Solo se debe actualizar una vez al año cuando el Diario Oficial de la Federación publique el nuevo valor (normalmente en enero). Esto recalculará automáticamente todas las pólizas vigentes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Año Fiscal</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="year"
                      type="number"
                      placeholder="2027"
                      defaultValue={new Date().getFullYear()}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 pl-12 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gmm-accent/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Valor Diario (UMA)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      name="uma"
                      type="number"
                      step="0.01"
                      placeholder="117.31"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 pl-12 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gmm-accent/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vigente Desde</label>
                <input
                  name="fecha"
                  type="date"
                  defaultValue={`${new Date().getFullYear()}-01-01`}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gmm-accent/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fuente Oficial (DOF)</label>
                <input
                  name="fuente"
                  type="text"
                  placeholder="Ej: DOF 10/01/2026"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-gmm-accent/20 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-gmm-accent text-white dark:text-slate-900 p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-black/10 dark:shadow-gmm-accent/20"
              >
                {loading ? 'Guardando...' : 'Guardar Configuración UMA'}
              </button>
            </form>

            {status && (
              <div className={`mt-8 p-4 rounded-xl text-center text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${
                status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
