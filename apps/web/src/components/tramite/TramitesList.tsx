'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  PlusCircle, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  RefreshCcw, 
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

/**
 * 📂 TRAMITES LIST COMPONENT (Dashboard Experience)
 * Display all insurance claims with a real-time 'Auditor Score' and self-healing action.
 */
export default function TramitesList() {
  const [tramites, setTramites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTramites = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tramites?filter=${filter}&search=${search}`)
      const data = await res.json()
      setTramites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading tramites:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTramites()
  }, [filter, search])

  // 🔥 Handler Auto-Fix: Re-trigger the whole audit pipeline
  const handleAutoFix = async (tramiteId: string) => {
    try {
      setIsRefreshing(true)
      await fetch('/api/audit/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tramite_id: tramiteId })
      })
      await fetchTramites()
    } catch (err) {
      console.error('Error fixing tramite:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 px-4">
      
      {/* 🚀 DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Trámites</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona y monitorea tus expedientes de Gastos Médicos.</p>
        </div>
        <a href="/tramite/nuevo">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Trámite
          </Button>
        </a>
      </div>

      {/* 🔎 CONTROLS: FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por ID..." 
            className="pl-9 rounded-xl border-slate-200 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {['all', 'reembolso', 'pendiente', 'completado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f 
                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 📄 LISTA DE TRÁMITES */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tramites.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aún no tienes trámites</h3>
            <p className="text-slate-500 text-sm">Comienza creando tu primer expediente para reembolsos.</p>
          </div>
        ) : (
          tramites.map((t) => (
            <Card key={t.id} className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* LEFT: Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          #{t.id.slice(0, 8).toUpperCase()}
                        </span>
                        <TypeBadge tipo={t.tipo} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        Expediente de {t.tipo === 'reembolso' ? 'Reembolso Médico' : 'Gastos Médicos'}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Creado el {new Date(t.created_at).toLocaleDateString('es-MX', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <StatusBadge status={t.status} />
                      <ScoreBadge score={t.score} />
                    </div>
                  </div>

                  {/* RIGHT: Actions */}
                  <div className="bg-slate-50/80 dark:bg-slate-900/80 p-6 md:w-80 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
                    <a href={`/tramites/${t.id}`} className="w-full">
                      <Button variant="outline" className="w-full justify-between group-hover:bg-white dark:group-hover:bg-slate-800 rounded-xl">
                        Ver Auditoría
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Button>
                    </a>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {t.status === 'error' || (t.score > 0 && t.score < 100) ? (
                        <Button 
                          onClick={() => handleAutoFix(t.id)}
                          disabled={isRefreshing}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/10"
                        >
                          {isRefreshing ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
                          Arreglar
                        </Button>
                      ) : (
                        <Button variant="secondary" className="rounded-xl opacity-50" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Correcto
                        </Button>
                      )}

                      {t.zip_url ? (
                        <a href={t.zip_url} target="_blank" className="w-full">
                          <Button variant="secondary" className="w-full rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 shadow-sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="ghost" disabled className="text-slate-400 rounded-xl">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

/** 🎨 UI HELPERS */

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Pendiente', icon: AlertCircle },
    processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'En Proceso', icon: RefreshCcw },
    completed: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Listo', icon: CheckCircle },
    error: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Con Errores', icon: AlertCircle }
  }

  const { color, label, icon: Icon } = configs[status] || configs.pending

  return (
    <Badge variant="outline" className={`${color} px-3 py-1 rounded-full border flex items-center gap-1.5 font-semibold`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}

function ScoreBadge({ score }: { score: number }) {
  let colorClass = 'text-slate-400 bg-slate-100'
  let label = 'N/A'

  if (score > 90) {
    colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-100'
    label = 'Excelente'
  } else if (score > 70) {
    colorClass = 'text-amber-600 bg-amber-50 border-amber-100'
    label = 'Mejorable'
  } else if (score > 0) {
    colorClass = 'text-red-600 bg-red-50 border-red-100'
    label = 'Crítico'
  } else if (score === 0) {
    label = 'Sin Medir'
  }

  return (
    <div className={`flex items-center gap-2 border px-3 py-1 rounded-full ${colorClass}`}>
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black">{score}/100</span>
    </div>
  )
}

function TypeBadge({ tipo }: { tipo: string }) {
  return (
    <Badge className="bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg text-[10px] font-bold tracking-widest uppercase">
      {tipo}
    </Badge>
  )
}
