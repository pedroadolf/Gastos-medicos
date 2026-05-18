'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

import { GlobalPolicyCard } from '@/components/dashboard/GlobalPolicyCard';
import { ClaimsKanban } from '@/components/dashboard/ClaimsKanban';
import { FinancialAnalysis } from '@/components/dashboard/FinancialAnalysis';
import { InsuredSiniestrosSection } from '@/components/dashboard/InsuredSiniestrosSection';
import { getPoliciesCalculadas } from '@/app/actions/uma';
import { POLIZA_FALLBACK, type PolicyCalculada } from '@/lib/uma';
import { calcularTotalGrupo } from '@/lib/siniestros-data';

// ─── Internal Components ────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-6 px-2">
        <div className="flex flex-col">
          <h2 className="text-[22px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[14px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">
              {subtitle}
            </p>
          )}
        </div>
        <div className="h-[2px] flex-1 bg-slate-300/30 dark:bg-white/5 rounded-full" />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<PolicyCalculada>(POLIZA_FALLBACK);

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

  // Real totals from siniestros data
  const totalGrupo = calcularTotalGrupo();
  const consumedSum = totalGrupo.total_pagado;

  return (
    <div className="space-y-10 pb-24">

      {/* SECCIÓN 1: PANORAMA GLOBAL */}
      <Section
        title="1. Panorama de Póliza"
        subtitle="Estructura de suma asegurada y deducibles vigentes"
      >
        <GlobalPolicyCard
          policy={policy}
          consumedSum={consumedSum}
          claimsCount={totalGrupo.count_siniestros}
        />
      </Section>

      {/* SECCIÓN 2: ANÁLISIS FINANCIERO — datos reales */}
      <Section
        title="2. Análisis Financiero"
        subtitle="KPIs del grupo asegurado · datos reales de cartas de siniestralidad"
      >
        <FinancialAnalysis />
      </Section>

      {/* SECCIÓN 3: GESTIÓN OPERATIVA */}
      <Section
        title="3. Gestión Operativa"
        subtitle="Flujo de trámites y solicitudes activas"
      >
        <ClaimsKanban />
      </Section>

      {/* SECCIÓN 4: ASEGURADOS Y SINIESTROS */}
      <Section
        title="4. Asegurados y Siniestros"
        subtitle="Detalle por integrante · Inciso 4 · Subtotales y total consolidado"
      >
        <InsuredSiniestrosSection />
      </Section>

    </div>
  );
}
