'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { 
  PlusCircle, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Download, 
  RefreshCcw, 
  ChevronRight,
  MoreVertical,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type ViewType = 'table' | 'kanban'

/**
 * ⚡ POWER DASHBOARD v1.1 (No-Dependency Version)
 * The ultimate SaaS control center for insurance claims.
 * Optimized with Vanilla Tailwind to ensure zero-error rendering.
 */
export default function PowerDashboard() {
  const [view, setView] = useState<ViewType>('table')
  const [tramites, setTramites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTramites = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tramites?filter=${filter}&search=${search}`)
      if (!res.ok) throw new Error('Backend failure')
      const data = await res.json()
      setTramites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading tramites:', err)
    } finally {
      setLoading(false)
    }
  }

  // 📡 REALTIME SUBSCRIPTION
  useEffect(() => {
    fetchTramites()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tramites' },
        () => {
          console.log('🔄 Realtime update detected!')
          fetchTramites() 
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter, search])

  // 🧠 KANBAN LOGIC
  const kanbanColumns = useMemo(() => {
    const columns: Record<string, any[]> = {
      pending: [],
      processing: [],
      completed: [],
      error: []
    }
    
    tramites.forEach(t => {
      const status = t.status || 'pending'
      if (columns[status]) columns[status].push(t)
      else columns.pending.push(t)
    })

    return columns
  }, [tramites])

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-10 px-6 sm:px-8">
      
      {/* 🚀 HEADER & VIEW SWITCHER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 py-1 px-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100 dark:border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Realtime Monitoring Active
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Gestión de <span className="text-blue-600 italic">Expedientes</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button 
            onClick={() => setView('table')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-300 ${
              view === 'table' 
              ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400 scale-105' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <List className="h-4 w-4" />
            Grid View
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-300 ${
              view === 'kanban' 
              ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600 dark:text-blue-400 scale-105' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban Board
          </button>
        </div>
      </div>

      {/* 🔍 SEARCH & FILTERS ENGINE */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por ID de trámite, paciente o RFC..." 
            className="w-full pl-12 pr-4 h-14 rounded-3xl border-2 border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 dark:text-white font-medium"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'reembolso', 'pendiente', 'completado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-8 py-3.5 rounded-[1.4rem] font-black text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                filter === f 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl shadow-slate-900/10' 
                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'Ver Todos' : f}
            </button>
          ))}
        </div>
      </div>

      {/* 🖼️ DYNAMIC VIEWPORT (TABLE OR KANBAN) */}
      <div className="relative min-h-[600px]">
        {loading && !isRefreshing ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 animate-spin" />
                <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <div className="text-center">
                <p className="text-slate-900 dark:text-white font-black text-lg">Sincronizando Nucleo GMM</p>
                <p className="text-slate-500 text-sm italic font-medium">Buscando cambios en Supabase Realtime...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === 'table' ? (
              <motion.div
                key="table"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-950/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl"
              >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">IDENTIFICADOR</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TIPO TRÁMITE</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">SCORE AUDITORÍA</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">ESTADO OPERATIVO</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                            {tramites.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-blue-900/5 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold border border-blue-100 dark:border-blue-800">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-mono font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">#{t.id.slice(0, 8)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                                            {t.tipo}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className={`h-3 w-3 ${t.score > 85 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                <span className={`text-xl font-black ${t.score > 85 ? 'text-emerald-500' : (t.score > 60 ? 'text-amber-500' : 'text-rose-500')}`}>
                                                    {t.score || '--'}
                                                </span>
                                            </div>
                                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${t.score || 0}%` }}
                                                    className={`h-full transition-all duration-1000 ${t.score > 85 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} 
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <StatusCircle status={t.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            <a href={`/tramites/${t.id}`}>
                                                <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm">
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </a>
                                            <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {['pending', 'processing', 'completed', 'error'].map(status => (
                  <div key={status} className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : (status === 'error' ? 'bg-rose-500' : 'bg-blue-500')}`} />
                            <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em]">
                                {status === 'processing' ? 'EN AUDITORÍA' : status}
                            </h3>
                        </div>
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">
                            {kanbanColumns[status].length}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-4 min-h-[600px] p-2 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        {kanbanColumns[status].map(t => (
                            <motion.div 
                              layoutId={t.id}
                              key={t.id} 
                              className="group p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Active Glow for high scores */}
                                {t.score > 90 && <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-2xl rounded-full" />}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-slate-300 font-mono tracking-widest uppercase">#{t.id.slice(0, 8)}</span>
                                        <h4 className="font-black text-slate-800 dark:text-white leading-tight">Expediente Médico</h4>
                                    </div>
                                    <span className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 my-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">CALIDAD</span>
                                        <span className={`text-lg font-black ${t.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{t.score || '--'}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase">TIPO</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{t.tipo}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-5 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex -space-x-2">
                                        <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">AI</div>
                                        <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">🕵️</div>
                                    </div>
                                    <a href={`/tramites/${t.id}`}>
                                        <button className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/** 🎨 UI HELPERS */

function StatusCircle({ status }: { status: string }) {
  const configs: any = {
    pending: { color: 'text-amber-500 bg-amber-50', label: 'Pendiente', icon: Clock },
    processing: { color: 'text-blue-500 bg-blue-50', label: 'Auditoría', icon: RefreshCcw },
    completed: { color: 'text-emerald-500 bg-emerald-50', label: 'Completado', icon: CheckCircle2 },
    error: { color: 'text-rose-500 bg-rose-50', label: 'Revisión', icon: AlertCircle }
  }

  const { color, label, icon: Icon } = configs[status] || configs.pending

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider ${color} border border-current opacity-80 backdrop-blur-sm`}>
      <Icon className={`h-3.5 w-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {label}
    </div>
  )
}
