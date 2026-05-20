'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { CompactPolicyCard } from '@/components/dashboard/CompactPolicyCard';
import { ClaimsKanban } from '@/components/dashboard/ClaimsKanban';
import { FinancialAnalysis } from '@/components/dashboard/FinancialAnalysis';
import { InsuredSiniestrosSection } from '@/components/dashboard/InsuredSiniestrosSection';
import { getPoliciesCalculadas } from '@/app/actions/uma';
import { POLIZA_FALLBACK, type PolicyCalculada } from '@/lib/uma';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyCalculada>(POLIZA_FALLBACK);
  const [showKanban, setShowKanban] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const policies = await getPoliciesCalculadas();
        if (policies && policies.length > 0) setPolicy(policies[0]);
      } catch (err) {
        console.error('Error loading policy data:', err);
      }
      setIsLoading(false);
    }
    loadData();
  }, [session]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gmm-bg flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-10 h-10 border-t-2 border-gmm-accent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── COLUMNA IZQUIERDA (65%) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Póliza Compacta */}
          <CompactPolicyCard policy={policy} />

          {/* Siniestros y Asegurados */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Gestión de Siniestros
              </h2>
            </div>
            <InsuredSiniestrosSection />
          </div>

          {/* Kanban Colapsable */}
          <div className="pt-6">
            <button 
              onClick={() => setShowKanban(!showKanban)}
              className="w-full gmm-box p-4 flex items-center justify-between hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Trámites en Curso</span>
              </div>
              {showKanban ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>
            {showKanban && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mt-4"
              >
                <ClaimsKanban />
              </motion.div>
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA (35%) ── */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-20">
            <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4">
              Finanzas
            </h2>
            <FinancialAnalysis policy={policy} />
          </div>
        </div>

      </div>
    </div>
  );
}
