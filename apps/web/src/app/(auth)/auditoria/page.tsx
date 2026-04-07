// apps/web/src/app/(auth)/auditoria/page.tsx
'use client';

import { 
    ShieldCheck, 
    AlertTriangle, 
    RefreshCcw, 
    Search, 
    Filter, 
    FileWarning, 
    ChevronRight,
    Sparkles,
    Zap,
    Clock,
    CheckCircle2,
    Eye,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useTramites, Tramite } from '@/hooks/useTramites';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AuditoriaPage() {
    const { tramites, loading, refetch } = useTramites();
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrar trámites que requieren atención (estado 'error' o 'manual_review')
    const failedClaims = useMemo(() => {
        return tramites.filter(t => 
            (t.estado === 'error' || t.estado === 'audited') &&
            (t.folio.toLowerCase().includes(searchQuery.toLowerCase()) || 
             t.paciente_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [tramites, searchQuery]);

    // Estadísticas rápidas para el dashboard de auditoría
    const stats = useMemo(() => {
        const total = tramites.length;
        const errors = tramites.filter(t => t.estado === 'error').length;
        const reviews = tramites.filter(t => t.estado === 'audited').length;
        const integrity = total > 0 ? Math.round(((total - errors) / total) * 100) : 100;
        
        return { total, errors, reviews, integrity };
    }, [tramites]);

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-6">
            <div className="max-w-7xl mx-auto">
                <Link 
                    href="/siniestros" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-medical-cyan bg-slate-900 border border-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm mb-6"
                >
                    <ChevronLeft size={16} />
                    Regresar al Dashboard
                </Link>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 rounded-lg bg-medical-amber/10 border border-medical-amber/20">
                            <ShieldCheck className="w-5 h-5 text-medical-amber" />
                         </div>
                         <span className="text-xs font-black text-medical-amber uppercase tracking-widest">Quality Assurance AI</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-100 tracking-tighter italic">Auditoría & Auto-Fix</h1>
                            <p className="text-slate-500 mt-2 max-w-xl">
                                Monitor de integridad centralizado. Detecta inconsistencias críticas y permite reparaciones automáticas en tiempo real.
                            </p>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-medical-cyan transition-colors" />
                            <input 
                                type="text"
                                placeholder="Buscar por Folio o Paciente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm text-slate-300 w-full md:w-80 focus:outline-none focus:border-medical-cyan/50 focus:ring-4 focus:ring-medical-cyan/5 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Errores */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-r from-medical-amber/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-30" />
                             <div className="flex items-center gap-2 px-3 py-1 bg-medical-amber/10 text-medical-amber rounded-full border border-medical-amber/20 relative z-10">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{failedClaims.length} Incidencias Pendientes</span>
                             </div>
                             <div className="flex gap-2 relative z-10">
                                <button 
                                    onClick={() => refetch()}
                                    className="p-2 text-slate-500 hover:text-white transition-colors" 
                                    title="Refrescar datos"
                                >
                                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                                </button>
                             </div>
                        </div>

                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                                <p className="text-slate-500 text-sm italic font-black uppercase tracking-widest animate-pulse">Escaneando red de siniestros...</p>
                            </div>
                        ) : failedClaims.length > 0 ? (
                            <div className="space-y-4">
                                {failedClaims.map((claim) => (
                                    <AuditItem key={claim.id} claim={claim} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/10 backdrop-blur-sm">
                                <div className="w-20 h-20 bg-medical-emerald/5 border border-medical-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-medical-emerald opacity-60" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-200">Integridad Total</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">No se encontraron discrepancias criticas que requieran intervención manual.</p>
                            </div>
                        )}
                    </div>

                    {/* Resumen de IA y Métricas */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[40px] border border-medical-cyan/20 bg-medical-cyan/5 p-8 backdrop-blur-xl relative overflow-hidden group">
                           <div className="absolute -top-12 -right-12 w-48 h-48 bg-medical-cyan/10 blur-[80px] group-hover:bg-medical-cyan/20 transition-all duration-700" />
                           <div className="relative z-10">
                               <div className="flex items-center gap-3 mb-6">
                                   <div className="p-2 rounded-xl bg-medical-cyan/20">
                                       <Sparkles className="w-5 h-5 text-medical-cyan" />
                                   </div>
                                   <h3 className="text-xl font-black text-white italic tracking-tight">AI Diagnóstico</h3>
                               </div>
                               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                   El motor predictivo sugiere que el <span className="text-medical-cyan font-bold">94%</span> de los errores de formato y falta de firmas pueden ser autosubstancados.
                               </p>
                               <div className="space-y-4 mb-8">
                                   <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                                       <span className="text-xs text-slate-400">Estado Promedio</span>
                                       <span className="text-xs font-black text-white uppercase px-2 py-0.5 rounded-md bg-medical-amber/20 border border-medical-amber/40">{stats.integrity}% OK</span>
                                   </div>
                               </div>
                               <button 
                                  className="w-full py-4 bg-medical-cyan hover:bg-white text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-medical-cyan/20 flex items-center justify-center gap-2 group-hover:translate-y-[-2px] active:translate-y-[1px]"
                                  disabled={failedClaims.length === 0}
                               >
                                   <Zap size={18} fill="currentColor" />
                                   <span>Ejecutar Reparación Masiva</span>
                               </button>
                               <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
                                   <ShieldCheck size={12} className="text-slate-500" />
                                   <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Certificado por Pash Protocol v3</p>
                               </div>
                           </div>
                        </div>

                        <div className="p-8 rounded-[40px] border border-slate-800 bg-slate-900/40 backdrop-blur-md">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Métricas de Calidad</h4>
                            <div className="space-y-6">
                                <IntegrityMetric label="Metadatos Fiscales" value={98} />
                                <IntegrityMetric label="Validación Documental" value={stats.integrity} />
                                <IntegrityMetric label="SLA de Respuesta" value={85} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuditItem({ claim }: { claim: Tramite }) {
    const isError = claim.estado === 'error';
    
    return (
        <div className={`p-6 rounded-[32px] border transition-all relative overflow-hidden group ${
            isError ? 'bg-medical-amber/5 border-medical-amber/20 hover:bg-medical-amber/10' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
        }`}>
            {/* Lado selector visual */}
            <div className={`absolute inset-y-0 left-0 w-1.5 ${isError ? 'bg-medical-amber' : 'bg-medical-cyan/40'}`} />
            
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-sm font-black text-white px-2 py-1 bg-white/5 rounded-lg border border-white/10 uppercase">{claim.folio}</span>
                        <span className="text-xs text-slate-400 font-bold">| {claim.paciente_nombre}</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/50 border border-slate-800 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-widest">
                            <Clock size={10} />
                            {format(new Date(claim.updated_at), 'dd MMM, HH:mm', { locale: es })}
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                            isError ? 'bg-medical-amber/20 text-medical-amber' : 'bg-medical-cyan/20 text-medical-cyan'
                        }`}>
                            {claim.estado === 'error' ? 'Acción Requerida' : 'Auditado'}
                        </span>
                    </div>

                    <div className="flex items-start gap-2 text-medical-amber mb-4">
                         <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                         <span className="text-[13px] font-bold leading-tight">Discrepancia detectada en proceso de auditoría automática. Verifique documentos.</span>
                    </div>
                    
                    {/* IA Suggestion Preview */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                        <div className="mt-1 p-1 bg-medical-cyan/20 rounded-md"><Sparkles className="w-3.5 h-3.5 text-medical-cyan" /></div>
                        <div>
                            <p className="text-[9px] font-black text-medical-cyan/70 uppercase tracking-[0.1em] mb-1 italic">Sugerencia AI Predictiva (94%)</p>
                            <p className="text-[12px] text-slate-300 font-semibold italic">"Detectado error de integridad documental. Iniciar flujo de corrección para completar trámite."</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                    <Link 
                        href={`/auditoria/${claim.id}`}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-medical-cyan/50 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <Eye size={14} />
                        <span>Abrir Detalle</span>
                    </Link>
                    <button 
                        onClick={async (e) => {
                            e.preventDefault();
                            const btn = e.currentTarget;
                            btn.disabled = true;
                            btn.innerHTML = '<div class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>';
                            
                            try {
                                const res = await fetch(`/api/tramites/${claim.id}/autofix`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                });
                                const data = await res.json();
                                if (data.success) {
                                    alert(`✅ Auto-Fix solicitado para ${claim.folio}`);
                                } else {
                                    alert(`❌ Error: ${data.error}`);
                                }
                            } catch (error) {
                                alert('❌ Error de conexión con el agente central.');
                            } finally {
                                btn.disabled = false;
                                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg><span>Auto-Fix</span>';
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-cyan text-slate-950 font-black rounded-2xl hover:bg-white transition-all shadow-lg shadow-medical-cyan/10 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
                    >
                        <Zap size={14} fill="currentColor" />
                        <span>Auto-Fix</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function IntegrityMetric({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className="flex justify-between items-end mb-2.5 px-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{label}</span>
                <span className="text-xs font-black text-medical-cyan">{value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800/50 flex items-center p-0.5 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-medical-cyan via-medical-cyan to-white rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-1000 ease-out" 
                    style={{ width: `${value}%` }} 
                />
            </div>
        </div>
    );
}
