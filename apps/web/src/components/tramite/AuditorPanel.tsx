'use client';

import { useEffect, useState } from 'react';

/**
 * 🕵️ AUDITOR PANEL PRO v1.0
 * Premium SaaS interface with Glassmorphism and real-time audit feedback.
 */
export default function AuditorPanel({ tramiteId }: { tramiteId: string }) {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/audit/${tramiteId}`);
      if (!res.ok) throw new Error('Audit not found');
      const data = await res.json();
      setAudit(data);
    } catch (err) {
      console.error('[AUDITOR] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, [tramiteId]);

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      const res = await fetch(`/api/audit/autofix`, {
        method: 'POST',
        body: JSON.stringify({ tramite_id: tramiteId })
      });
      if (res.ok) fetchAudit(); // Refresh after fix
    } catch (err) {
      console.error('[AUTO-FIX] Fail:', err);
    } finally {
      setIsFixing(false);
    }
  };

  if (loading) return (
    <div className="p-10 animate-pulse bg-slate-100/30 rounded-3xl border border-slate-200 backdrop-blur-md">
      <div className="h-10 w-1/3 bg-slate-200 rounded-lg mb-4" />
      <div className="h-64 w-full bg-slate-200 rounded-3xl" />
    </div>
  );

  const scoreColor = audit.score >= 90 ? 'text-emerald-500' : (audit.score > 70 ? 'text-amber-500' : 'text-rose-500');
  const bgGradient = audit.score >= 90 ? 'from-emerald-50 to-white' : (audit.score > 70 ? 'from-amber-50 to-white' : 'from-rose-50 to-white');

  // 🧪 TIMELINE GLASS-CARD
  const Timeline = ({ steps }: { steps: any[] }) => (
    <div className="p-8 rounded-[2rem] bg-white/40 shadow-inner border border-slate-100/50 backdrop-blur-md mb-6">
      <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-400 mb-6 uppercase">FLUJO DE PROCESAMIENTO</h4>
      <div className="flex flex-col gap-4">
        {steps?.map((s, i) => (
          <div key={i} className="flex items-center gap-4 transition-all duration-500">
            <div className="relative flex flex-col items-center">
               <div className={`w-4 h-4 rounded-full border-2 transition-all duration-700 
                ${s.status === 'done' ? 'bg-emerald-500 border-emerald-200 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 
                  s.status === 'in_progress' ? 'bg-amber-400 border-amber-100 animate-pulse' : 'bg-slate-200 border-slate-100'}`} 
               />
               {i < steps.length - 1 && <div className={`w-0.5 h-6 transition-all duration-700 ${s.status === 'done' ? 'bg-emerald-200' : 'bg-slate-100'}`} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold tracking-tight ${s.status === 'done' ? 'text-slate-800' : (s.status === 'in_progress' ? 'text-amber-600' : 'text-slate-300')}`}>
                {s.label}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">{s.status === 'done' ? 'Completado' : (s.status === 'in_progress' ? 'En proceso...' : 'Pendiente')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      
      {/* 🧠 SCORE GLASS-CARD */}
      <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${bgGradient} shadow-xl border border-white/50 backdrop-blur-lg flex justify-between items-center transform hover:scale-[1.01] transition-all duration-300`}>
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">CALIDAD DEL EXPEDIENTE</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-6xl font-black ${scoreColor}`}>{audit.score}</h2>
            <span className="text-slate-400 text-xl font-medium">/100</span>
          </div>
        </div>
        <StatusBadge status={audit.status} />
      </div>

      {/* 📊 PROCESS TIMELINE */}
      {audit.timeline && <Timeline steps={audit.timeline} />}

      {/* ⚠️ FINDINGS PANEL */}
      <div className="p-8 rounded-[2rem] bg-white shadow-lg border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Hallazgos Críticos</h3>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
            {audit.issues?.length || 0} SEÑALADOS
          </span>
        </div>

        <div className="space-y-4">
          {(!audit.issues || audit.issues.length === 0) ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-700">
              <span className="text-2xl">🎉</span>
              <p className="font-medium italic">¡Expediente impecable! Todo listo para envío.</p>
            </div>
          ) : (
            audit.issues.map((issue: any, i: number) => (
              <div key={i} className="group p-4 bg-slate-50 hover:bg-white border hover:border-slate-300 rounded-2xl flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${issue.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-slate-600 font-medium">{issue.message}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${issue.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>
                  {issue.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🚀 ACTION CENTER */}
      <div className="flex flex-wrap gap-4 items-center">
        <button 
          onClick={handleAutoFix}
          disabled={isFixing}
          className={`flex-1 min-w-[200px] h-14 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 
            ${isFixing ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black hover:shadow-2xl'}`}
        >
          {isFixing ? (
            <>
              <span className="animate-spin text-xl">⏳</span>
              RECALCULANDO...
            </>
          ) : (
            <>
              <span>🔧</span>
              CORREGIR EXPEDIENTE
            </>
          )}
        </button>

        {audit.zip_url && (
          <a 
            href={audit.zip_url} 
            target="_blank" 
            className="flex-1 min-w-[200px] h-14 bg-white border-2 border-slate-900 rounded-2xl font-bold text-slate-900 hover:bg-slate-50 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>📦</span>
            DESCARGAR EXPEDIENTE ZIP
          </a>
        )}
      </div>

    </div>
  );
}

/** 📊 SUB-COMPONENT: BADGE */
function StatusBadge({ status }: { status: string }) {
  const map: any = {
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    error: 'bg-rose-100 text-rose-700 border-rose-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const labels: any = {
    approved: 'AUDITADO OK',
    error: 'ERRORES CRÍTICOS',
    pending: 'POR REVISAR'
  };

  return (
    <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest border border-dashed ${map[status] || map.pending}`}>
      {labels[status] || 'STBY'}
    </span>
  );
}
