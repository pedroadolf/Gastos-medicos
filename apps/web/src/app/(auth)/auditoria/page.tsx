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
    Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AuditoriaPage() {
    const [failedClaims, setFailedClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // En un caso real, esto consultaría siniestros con estatus 'error'
    useEffect(() => {
        // Simulación de carga de errores
        setTimeout(() => {
            setFailedClaims([
                {
                    id: 'S-7721',
                    asegurado: 'Pash Tech Systems',
                    error: 'Factura con RFC incorrecto',
                    ai_suggestion: 'Reemplazar RFC por PASE880101XYZ',
                    confidence: 94,
                    date: '2026-04-05',
                    severity: 'high'
                },
                {
                    id: 'S-7725',
                    asegurado: 'Juan Diego G.',
                    error: 'Falta firma en Anexo 2',
                    ai_suggestion: 'Notificar al asegurado para firma digital',
                    confidence: 88,
                    date: '2026-04-05',
                    severity: 'medium'
                }
            ]);
            setIsLoading(false);
        }, 800);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="p-2 rounded-lg bg-medical-amber/10 border border-medical-amber/20">
                            <ShieldCheck className="w-5 h-5 text-medical-amber" />
                         </div>
                         <span className="text-xs font-black text-medical-amber uppercase tracking-widest">Quality Assurance AI</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-100 tracking-tighter italic">Auditoría & Auto-Fix</h1>
                    <p className="text-slate-500 mt-2 max-w-xl">
                        Monitor de integridad del sistema. Localiza inconsistencias documentales y permite correcciones automatizadas mediante IA.
                    </p>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Errores */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                             <div className="flex items-center gap-2 px-3 py-1 bg-medical-amber/10 text-medical-amber rounded-full border border-medical-amber/20 opacity-80">
                                <AlertTriangle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{failedClaims.length} Errores Críticos</span>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-2 text-slate-500 hover:text-white transition-colors"><RefreshCcw size={18} /></button>
                             </div>
                        </div>

                        {isLoading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500 text-sm italic font-medium">Buscando discrepancias en la red...</p>
                            </div>
                        ) : failedClaims.length > 0 ? (
                            failedClaims.map((claim) => (
                                <AuditItem key={claim.id} claim={claim} />
                            ))
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-[32px] bg-slate-900/20">
                                <CheckCircle2 className="w-12 h-12 text-medical-emerald mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-slate-400">Sistema Limpio</h3>
                                <p className="text-sm text-slate-600 mt-1">No se detectaron errores de integridad en los trámites recientes.</p>
                            </div>
                        )}
                    </div>

                    {/* Resumen de IA */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[32px] border border-medical-cyan/20 bg-medical-cyan/5 p-8 backdrop-blur-xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-medical-cyan/10 blur-[80px] group-hover:bg-medical-cyan/20 transition-all" />
                           <div className="relative z-10">
                               <div className="flex items-center gap-3 mb-6">
                                   <Sparkles className="w-6 h-6 text-medical-cyan" />
                                   <h3 className="text-xl font-black text-white italic">AI Diagnóstico</h3>
                               </div>
                               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                   Basado en el historial de rechazos, la IA estima que un <span className="text-medical-cyan font-bold">85%</span> de los errores actuales pueden resolverse mediante el motor de <span className="text-white font-bold">Auto-Fix</span>.
                               </p>
                               <button className="w-full py-4 bg-medical-cyan hover:bg-white text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-medical-cyan/20 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95">
                                   <Zap size={18} fill="currentColor" />
                                   <span>Reparar Todo (Auto-Fix)</span>
                               </button>
                               <p className="text-[10px] text-slate-500 mt-4 text-center uppercase tracking-widest font-black opacity-50">Sujeto a validación humana final</p>
                           </div>
                        </div>

                        <div className="p-6 rounded-[32px] border border-slate-800 bg-slate-900/40">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Integridad Reciente</h4>
                            <div className="space-y-4">
                                <IntegrityMetric label="Metadatos" value={99} />
                                <IntegrityMetric label="Validez Fiscal" value={92} />
                                <IntegrityMetric label="Firma Digital" value={88} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuditItem({ claim }: { claim: any }) {
    return (
        <div className="p-6 rounded-[32px] border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all border-l-4 border-l-medical-amber group">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-black text-white">{claim.id}</span>
                        <span className="text-xs text-slate-500 font-medium tracking-tight">| {claim.asegurado}</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            <Clock size={10} />
                            {claim.date}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-medical-amber mb-4">
                         <AlertTriangle size={16} />
                         <span className="text-sm font-bold">{claim.error}</span>
                    </div>
                    
                    {/* IA Suggestion */}
                    <div className="p-4 rounded-2xl bg-medical-cyan/5 border border-medical-cyan/10 flex items-start gap-4">
                        <div className="mt-1"><Sparkles className="w-4 h-4 text-medical-cyan" /></div>
                        <div>
                            <p className="text-[10px] font-black text-medical-cyan uppercase tracking-widest mb-1 opacity-70 italic">Sugerencia AI ({claim.confidence}% confianza)</p>
                            <p className="text-[13px] text-slate-300 font-semibold">{claim.ai_suggestion}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex md:flex-col justify-end gap-2">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all text-xs font-bold">
                        <Eye size={14} />
                        <span>Detalles</span>
                    </button>
                    <button 
                        onClick={async () => {
                            const btn = document.getElementById(`fix-${claim.id}`);
                            if (btn) btn.classList.add('animate-pulse', 'opacity-50');
                            
                            try {
                                const res = await fetch('/api/agentes', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        action: 'autofix', 
                                        claimId: claim.id,
                                        agentId: 'validator-agent'
                                    })
                                });
                                const data = await res.json();
                                alert(data.success ? `✅ Auto-Fix iniciado para ${claim.id}` : `❌ Error: ${data.error}`);
                            } catch (e) {
                                alert('❌ Error de conexión con el OS');
                            } finally {
                                if (btn) btn.classList.remove('animate-pulse', 'opacity-50');
                            }
                        }}
                        id={`fix-${claim.id}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-medical-cyan text-slate-950 font-black rounded-xl hover:bg-white transition-all shadow-lg shadow-medical-cyan/10 active:scale-95 disabled:opacity-50"
                    >
                        <Zap size={14} fill="currentColor" />
                        <span>Auto-Fix</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function IntegrityMetric({ label, value }: any) {
    return (
        <div>
            <div className="flex justify-between items-end mb-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-black text-white">{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 flex items-center p-0.5 overflow-hidden">
                <div 
                    className="h-full bg-medical-cyan rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                    style={{ width: `${value}%` }} 
                />
            </div>
        </div>
    );
}
