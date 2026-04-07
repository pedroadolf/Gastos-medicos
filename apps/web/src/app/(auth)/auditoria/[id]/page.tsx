// apps/web/src/app/(auth)/auditoria/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTramite } from '@/hooks/useTramites';
import { useWorkflowLogs } from '@/hooks/useWorkflowLogs';
import { TramiteStatusBadge } from '@/components/tramites/TramiteStatusBadge';
import { ScoreBadge } from '@/components/tramites/ScoreBadge';
import { TramiteActions } from '@/components/tramites/TramiteActions';
import { 
  ChevronLeft, 
  AlertCircle, 
  FileText, 
  History, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WorkflowTimeline } from '@/components/tramites/WorkflowTimeline';

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { tramite, isLoading, refetch } = useTramite(id);
  const { logs, loading: loadingLogs } = useWorkflowLogs(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-medical-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Analizando expediente...</p>
        </div>
      </div>
    );
  }

  if (!tramite) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800">
          <XCircle size={48} className="text-medical-red mx-auto mb-4" />
          <h2 className="text-xl font-black text-white">Expediente no encontrado</h2>
          <Link href="/auditoria" className="mt-4 inline-block text-medical-cyan hover:underline">Regresar al auditor</Link>
        </div>
      </div>
    );
  }

  const issues = tramite.issues || [];

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/auditoria" 
            className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-medical-cyan transition-colors"
          >
            <ChevronLeft size={16} />
            HACIENDO AUDITORÍA
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-medical-cyan/10 border border-medical-cyan/20 rounded-full">
            <ShieldCheck size={14} className="text-medical-cyan" />
            <span className="text-[10px] font-black text-medical-cyan uppercase tracking-tighter">Sesión de Auditoría Activa</span>
          </div>
        </div>

        {/* 🧩 4. HEADER PRO */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-medical-cyan/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Master Audit ID: {tramite.id.split('-')[0]}</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic">
                Folio: {tramite.folio}
              </h1>
              <p className="text-lg text-slate-400 font-bold mt-1">
                {tramite.paciente_nombre}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
               <div className="flex flex-col items-center px-4 border-r border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Status</span>
                  <TramiteStatusBadge status={tramite.estado} />
               </div>
               <div className="flex flex-col items-center px-4 border-r border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Score IA</span>
                  <ScoreBadge score={tramite.score} />
               </div>
               <div className="flex flex-col items-center px-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Acciones</span>
                  <TramiteActions tramite={tramite} onRetry={refetch} />
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls & Issues */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 🚨 5. LISTA DE ERRORES */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                  <AlertCircle className="text-medical-amber" size={20} />
                  <h3 className="text-lg font-black text-white italic tracking-tight">Hallazgos & Discrepancias</h3>
                  <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-widest">{issues.length} Issues</span>
               </div>
               
               <div className="space-y-3">
                {issues.length > 0 ? issues.map((issue: any, idx: number) => (
                  <div
                    key={idx}
                    className="group relative bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-medical-amber/40 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-medical-amber/40 group-hover:bg-medical-amber transition-colors" />
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-xl bg-medical-amber/10 border border-medical-amber/20">
                         <AlertCircle size={18} className="text-medical-amber" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-[10px] font-black text-medical-amber uppercase tracking-widest italic">{issue.type || 'Error de Validación'}</span>
                           <span className="text-[10px] font-mono text-slate-600">ID: #{idx + 1}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-relaxed">
                          {issue.message || issue.observacion || "Sin descripción detallada del error."}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-3xl opacity-60">
                    <CheckCircle2 size={32} className="text-medical-emerald mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Sin errores críticos detectados</p>
                  </div>
                )}
               </div>
            </section>

            {/* 📄 DOCUMENTOS */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 px-2">
                  <FileText className="text-medical-cyan" size={20} />
                  <h3 className="text-lg font-black text-white italic tracking-tight">Expediente Digital</h3>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tramite.adjuntos?.map((adj: any) => (
                    <div key={adj.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between group hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 rounded-lg text-medical-cyan">
                           <FileText size={16} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-300 truncate max-w-[150px]">{adj.file_name}</span>
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{adj.tipo_documento}</span>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-slate-600 group-hover:text-medical-cyan cursor-pointer transition-colors" />
                    </div>
                  ))}
               </div>
            </section>
          </div>

          {/* Sidebar: Decision Center Control */}
          <div className="space-y-8">
            
            {/* 🧠 6. BOTÓN AUTO-FIX */}
            <div className="bg-gradient-to-br from-medical-cyan/20 to-slate-900 border border-medical-cyan/30 rounded-[32px] p-8 shadow-2xl shadow-medical-cyan/5">
              <div className="flex items-center gap-3 mb-4">
                 <Zap size={24} className="text-medical-cyan" fill="currentColor" />
                 <h3 className="text-xl font-black text-white italic tracking-tighter">Decision Engine</h3>
              </div>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed italic">
                El motor de IA sugiere que el <span className="text-medical-cyan font-bold">90%</span> de los hallazgos pueden ser corregidos automáticamente ajustando los metadatos fiscales.
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = '<div class="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>';
                    
                    try {
                      const res = await fetch(`/api/tramites/${id}/autofix`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`✅ Auto-Fix solicitado para ${tramite.folio}. El proceso se ejecutará en segundo plano.`);
                        refetch();
                      } else {
                        alert(`❌ Error: ${data.error}`);
                      }
                    } catch (error) {
                      alert('❌ Error de conexión con el motor de decisiones.');
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = originalContent;
                    }
                  }}
                  className="w-full py-4 bg-medical-cyan hover:bg-white text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-medical-cyan/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  <Zap size={18} fill="currentColor" />
                  <span>EJECUTAR AUTO-FIX</span>
                </button>
                
                <button 
                  className="w-full py-4 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Aprobación Manual
                </button>
              </div>
            </div>


            {/* 🧭 SECCIÓN DE OBSERVABILIDAD V4.0 */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-medical-cyan/10 border border-medical-cyan/20 rounded-xl text-medical-cyan">
                      <History size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">Workflow Engine</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trazabilidad en Tiempo Real</p>
                   </div>
                </div>
              </div>
              
              <WorkflowTimeline tramiteId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


