'use client';

import { useState, useEffect } from 'react';
import { 
  Zap,
  Plus,
  Activity,
  ShieldCheck,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// SRE-Grade Dashboard Components
import { CoverageKPIs } from '@/components/dashboard/CoverageKPIs';
import { InsuredCards } from '@/components/dashboard/InsuredCards';
import { AlertCenter } from '@/components/dashboard/AlertCenter';
import { ClaimsKanban } from '@/components/dashboard/ClaimsKanban';
import { ExecutionDrillDown } from '@/components/dashboard/ExecutionDrillDown';
import { TrustBar } from '@/components/dashboard/TrustBar';
import { AICopilot, AnomalyClusters, GovernanceBadge, PreventivePanel } from '@/components/dashboard/IntelligenceHub';

export default function GlobalDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/dashboard/metrics");
      const d = await res.json();
      if (d.data) {
        setData(d);
        setErrorCount(0);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (e) {
      setErrorCount(prev => prev + 1);
      console.error("Fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Live feel: 5s
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !data) {
    return (
        <div className="min-h-screen bg-gmm-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gmm-yellow/10 border-t-gmm-yellow rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-gmm-yellow w-6 h-6" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-gmm-yellow uppercase tracking-[0.4em] animate-pulse">Initializing NOC Layer...</p>
            </div>
        </div>
    );
  }

  const { kpis, meta, trust, insuredUsers, alerts, kanban } = data;
  const isStale = (trust?.status === 'STALE') || errorCount > 0;
  const intelligence = kpis?.intelligence;

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <TrustBar trust={trust || { status: 'LIVE', confidenceScore: 100 }} meta={meta || {}} />

      <div className="p-10 lg:p-16">
          {/* 🚀 Header SRE-Grade */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
            <div className="relative">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gmm-yellow rounded-full shadow-[0_0_20px_#FFD32C]" />
              <div className="flex items-center gap-6">
                  <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                    Command Center
                  </h1>
                  {intelligence && <GovernanceBadge mode={intelligence.governanceMode} />}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <Activity className={`w-3 h-3 ${isStale ? 'text-gmm-danger animate-pulse' : 'text-gmm-yellow animate-pulse'}`} />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Node Cluster: MX-NORTH-01</p>
                </div>
                <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AIOps Engine Active</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
                 <button 
                    onClick={() => router.push('/tramites/nuevo')}
                    className="px-8 py-5 bg-gmm-yellow text-black font-black rounded-[24px] flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-gmm-yellow/20 group uppercase text-xs tracking-widest"
                 >
                    <div className="bg-black/10 p-1.5 rounded-xl">
                       <Plus size={20} strokeWidth={4} />
                    </div>
                    NEW TRANSACTION
                 </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto space-y-20">
            
            {/* 🧠 Intelligence Hub Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white/[0.01] p-8 rounded-[40px] border border-white/5">
                <div className="lg:col-span-12 flex items-center gap-2 mb-4">
                    <Zap className="text-yellow-400" size={14} />
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Intelligence Hub Layer</h2>
                </div>
                <div className="lg:col-span-5">
                    <AICopilot insight={intelligence?.copilot} />
                </div>
                <div className="lg:col-span-4">
                    <AnomalyClusters clusters={intelligence?.clusters} />
                </div>
                <div className="lg:col-span-3">
                    <PreventivePanel actions={intelligence?.preventive} />
                </div>
            </section>

            {/* Layer 1: Context (KPIs) */}
            <section>
                <div className="flex items-center gap-2 mb-8 ml-2">
                    <TrendingUp className="text-gmm-yellow" size={14} />
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Resource Utilization</h2>
                </div>
                <CoverageKPIs kpis={kpis} />
            </section>

            {/* Layer 2: Operación (Insured Cards) */}
            <section>
                 <div className="flex items-center gap-2 mb-8 ml-2">
                    <LayoutGrid className="text-gmm-yellow" size={14} />
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Asegurados Active Quotas</h2>
                </div>
                <InsuredCards users={insuredUsers || []} />
            </section>

            {/* Layer 3: SRE Visibility */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
                <div className="lg:col-span-8">
                    <div className="flex items-center gap-2 mb-8 ml-2">
                        <Zap className="text-gmm-yellow" size={14} />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">NOC Alert Stack</h2>
                    </div>
                    <AlertCenter 
                        alerts={data.alerts || []} 
                        onAlertClick={(id) => setSelectedExecutionId(id)} 
                    />
                </div>
                <div className="lg:col-span-4">
                     <div className="flex items-center gap-2 mb-8 ml-2">
                        <ShieldCheck className="text-gmm-yellow" size={14} />
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pipeline Execution State</h2>
                    </div>
                    <ClaimsKanban kanban={data.kanban || {}} />
                </div>
            </section>
          </div>
      </div>

      <ExecutionDrillDown 
        executionId={selectedExecutionId} 
        onClose={() => setSelectedExecutionId(null)} 
      />
    </div>
  );
}
