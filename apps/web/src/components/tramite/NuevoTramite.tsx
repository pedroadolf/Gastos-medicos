'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, ShieldCheck, Sparkles, AlertCircle, ChevronLeft,
  Check, ArrowRight, ArrowLeft, Loader2, FileText,
  Receipt, Building2, Scissors, ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import Stepper from './Stepper';
import StepTipo from './StepTipo';
import FacturasTable from './FacturasTable';
import UploadDocs from './UploadDocs';

// Services & Types
import { claimsService } from '@/services/claimsService';
import { Siniestro, FacturaRow, TramiteType } from '@/types/claims';
import { ASEGURADOS_GRUPO } from '@/lib/siniestros-data';

// ── Tramite display metadata ───────────────────────────────────────────────────
const TRAMITE_META: Record<TramiteType, { label: string; desc: string; color: string; icon: React.ElementType }> = {
  reembolso:         { label: 'Reembolso de Gastos',       desc: 'Solicita el reembolso de facturas médicas ya pagadas.',          color: '#38BDF8', icon: Receipt },
  pago_directo:      { label: 'Pago Directo / Hosp.',       desc: 'Carta pase para pago directo a hospital o médico.',             color: '#10B981', icon: Building2 },
  cirugia_programada:{ label: 'Cirugía Programada',         desc: 'Pre-autorización y documentación para cirugía programada.',     color: '#A78BFA', icon: Scissors },
  carta_remanente:   { label: 'Carta de Siniestralidad',    desc: 'Solicita la carta de remanente de suma asegurada disponible.',  color: '#FFAA00', icon: ScrollText },
};

// ── Insured config (same colors as dashboard) ─────────────────────────────────
const INSURED_CONFIG: Record<string, { label: string; fullName: string; color: string; initials: string }> = {
  'pedro-soto':      { label: 'PASH',    fullName: 'Pedro Adolfo Soto Hernández',  color: '#38BDF8', initials: 'PA' },
  'claudia-fonseca': { label: 'Claudia', fullName: 'Claudia Fonseca Aguilar',      color: '#FFAA00', initials: 'CF' },
  'emilio-soto':     { label: 'Emilio',  fullName: 'Emilio Soto Fonseca',          color: '#10B981', initials: 'ES' },
  'sebastian-soto':  { label: 'Chari',   fullName: 'Pedro Sebastián Soto Fonseca', color: '#A78BFA', initials: 'SS' },
};

// ── Status badge config ────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  carta_pase:       { label: 'Carta Pase',      color: '#F59E0B' },
  liquidado:        { label: 'Liquidado',        color: '#10B981' },
  sin_movimiento:   { label: 'Sin movimiento',  color: '#6B7280' },
  revision:         { label: 'En Revisión',     color: '#A78BFA' },
  pendiente_carta:  { label: 'Pendiente',       color: '#EF4444' },
};

// ── Fallback: build siniestros list from static data ─────────────────────────
function buildFallbackSiniestros() {
  const list: any[] = [];
  ASEGURADOS_GRUPO.forEach(asegurado => {
    asegurado.siniestros.forEach((s: any) => {
      // Skip placeholder pendientes
      if (s.numero?.startsWith('PENDIENTE')) return;
      list.push({
        id: `${asegurado.id}-${s.numero}`,
        user_id: asegurado.id,
        nombre_siniestro: s.padecimiento,
        numero_siniestro: s.numero,
        fecha_apertura: s.primer_gasto || '',
        estado: s.estado,
        total_pagado: s.total_pagado || 0,
        pendiente: s.pendiente_carta_pase || 0,
        asegurado: asegurado.nombre,
      });
    });
  });
  return list;
}

function fmtK(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function NuevoTramite({ initialTipo }: { initialTipo?: TramiteType }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [siniestros, setSiniestros] = useState<any[]>([]);
  const [selectedSiniestroId, setSelectedSiniestroId] = useState<string>('');
  const [selectedAseguradoId, setSelectedAseguradoId] = useState<string>('pedro-soto'); // default: PASH
  const [tipo, setTipo] = useState<TramiteType>(initialTipo || 'reembolso');
  const [invoices, setInvoices] = useState<FacturaRow[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFinancial = tipo === 'reembolso' || tipo === 'cirugia_programada';
  const STEPS = [
    { id: 1, label: 'Asociar', signal: 'VINCULACIÓN' },
    ...(!initialTipo ? [{ id: 2, label: 'Propósito', signal: 'CONFIGURACIÓN' }] : []),
    ...(isFinancial ? [{ id: 3, label: 'Detalle', signal: 'FINANZAS' }] : []),
    { id: 4, label: 'Archivos', signal: 'DOCUMENTACIÓN' },
  ];

  const getNextStep = (current: number) => {
    const idx = STEPS.findIndex(s => s.id === current);
    return STEPS[idx + 1]?.id || current;
  };
  const getPrevStep = (current: number) => {
    const idx = STEPS.findIndex(s => s.id === current);
    return STEPS[idx - 1]?.id || current;
  };

  // Load siniestros — API first, fallback to static data
  useEffect(() => {
    fetch('/api/afectados')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.siniestros?.length > 0) {
          setSiniestros(data.siniestros);
        } else {
          // API returned empty — use static group data
          setSiniestros(buildFallbackSiniestros());
        }
      })
      .catch(() => {
        // Network error — use static group data
        setSiniestros(buildFallbackSiniestros());
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleFinalSubmit = async () => {
    if (!selectedSiniestroId) return;
    setIsSubmitting(true);
    try {
      const selectedSiniestro = siniestros.find(s => s.id === selectedSiniestroId);
      await claimsService.createFullTramite({
        siniestro_id: selectedSiniestroId,
        nombre_siniestro: selectedSiniestro?.nombre_siniestro,
        tipo,
        facturas: isFinancial ? invoices : [],
        files,
      });
      setStep(5);
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (error: any) {
      alert(`Error al procesar el trámite: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSiniestro = siniestros.find(s => s.id === selectedSiniestroId);
  const meta = TRAMITE_META[tipo];
  const TipoIcon = meta.icon;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">

      {/* ── Header ── */}
      <div className="gmm-box p-6 relative overflow-hidden"
           style={{ borderColor: step === 5 ? '#10B98130' : undefined,
                    background: step === 5 ? '#10B98108' : undefined }}>
        <div className="absolute right-0 top-0 bottom-0 w-48 pointer-events-none"
             style={{ background: meta.color, opacity: 0.04, filter: 'blur(60px)' }} />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Back button */}
          <button
            onClick={() => router.push('/nuevo-tramite')}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors w-fit"
            style={{ color: 'var(--gmm-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = meta.color)}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--gmm-text-muted)')}
          >
            <ChevronLeft size={12} /> Regresar al Menú de Trámites
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                   style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                <TipoIcon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest"
                        style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}>
                    Tipo de Trámite
                  </span>
                  {selectedSiniestroId && (
                    <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck size={9} strokeWidth={3} /> Siniestro Vinculado
                    </span>
                  )}
                </div>
                <h1 className="text-[20px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
                  {meta.label}
                </h1>
                <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                  {meta.desc}
                </p>
              </div>
            </div>

            {/* Siniestro badge */}
            {selectedSiniestroId && step < 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="gmm-box px-5 py-3 flex items-center gap-3 shrink-0"
                style={{ borderColor: `${meta.color}25` }}
              >
                <ShieldCheck size={18} style={{ color: meta.color }} />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                    Siniestro
                  </p>
                  <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>
                    {currentSiniestro?.numero_siniestro || '—'}
                  </p>
                  <p className="text-[9px] font-semibold truncate max-w-[180px]" style={{ color: 'var(--gmm-text-muted)' }}>
                    {currentSiniestro?.nombre_siniestro || currentSiniestro?.asegurado}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stepper ── */}
      {step < 5 && (
        <div className="max-w-3xl mx-auto">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      )}

      {/* ── Main Card ── */}
      <main className={cn(
        'gmm-box p-8 md:p-10 min-h-[480px] relative overflow-hidden transition-all duration-700',
        step === 5 && 'border-emerald-500/20'
      )}>
        <div className="relative z-10">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Vincular siniestro (insured tabs + siniestro cards) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Title */}
                <div>
                  <h2 className="text-[18px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
                    Seleccionar Expediente
                  </h2>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--gmm-text-muted)' }}>
                    Elige el asegurado y el siniestro al que pertenece este trámite.
                  </p>
                </div>

                {/* ── Insured Tabs (same style as dashboard) */}
                {isLoading ? (
                  <div className="flex items-center gap-3" style={{ color: 'var(--gmm-text-muted)' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Cargando expedientes...</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(INSURED_CONFIG).map(([id, cfg]) => {
                      const isActive = selectedAseguradoId === id;
                      const hasData = siniestros.some(s => (s.user_id === id));
                      if (!hasData) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => { setSelectedAseguradoId(id); setSelectedSiniestroId(''); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 border"
                          style={{
                            background:  isActive ? cfg.color : 'var(--gmm-bg)',
                            color:       isActive ? '#1a1a1a' : 'var(--gmm-text-muted)',
                            borderColor: isActive ? cfg.color  : 'var(--gmm-border)',
                            boxShadow:   isActive ? `0 4px 14px -4px ${cfg.color}60` : 'none',
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded-md text-[9px] flex items-center justify-center font-black shrink-0"
                            style={{ background: isActive ? 'rgba(0,0,0,0.15)' : `${cfg.color}25`, color: isActive ? '#1a1a1a' : cfg.color }}
                          >
                            {cfg.initials}
                          </span>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── Siniestros of selected insured */}
                {!isLoading && selectedAseguradoId && (() => {
                  const insuredSiniestros = siniestros.filter(s => s.user_id === selectedAseguradoId);
                  const cfg = INSURED_CONFIG[selectedAseguradoId];
                  if (!insuredSiniestros.length) return (
                    <p className="text-[11px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
                      Sin siniestros registrados para {cfg?.label}.
                    </p>
                  );
                  return (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: cfg?.color }}>
                        {cfg?.fullName} — {insuredSiniestros.length} expediente{insuredSiniestros.length !== 1 ? 's' : ''}
                      </p>
                      {insuredSiniestros.map(s => {
                        const isSelected = selectedSiniestroId === s.id;
                        const estadoCfg = ESTADO_CONFIG[s.estado] || { label: s.estado, color: '#6B7280' };
                        return (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSiniestroId(isSelected ? '' : s.id)}
                            className="w-full text-left rounded-2xl p-4 transition-all duration-200 border relative overflow-hidden"
                            style={{
                              background:   isSelected ? `${cfg?.color}10` : 'var(--gmm-bg)',
                              borderColor:  isSelected ? `${cfg?.color}50` : 'var(--gmm-border)',
                              boxShadow:    isSelected ? `0 4px 20px -8px ${cfg?.color}40` : 'none',
                            }}
                          >
                            {/* Selected glow */}
                            {isSelected && (
                              <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none"
                                   style={{ background: cfg?.color, opacity: 0.06, filter: 'blur(20px)' }} />
                            )}
                            <div className="relative z-10 flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Radio circle */}
                                <div
                                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                                  style={{
                                    borderColor: isSelected ? cfg?.color : 'var(--gmm-border)',
                                    background:  isSelected ? cfg?.color : 'transparent',
                                  }}
                                >
                                  {isSelected && <Check size={10} strokeWidth={4} style={{ color: '#1a1a1a' }} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-black leading-tight" style={{ color: 'var(--gmm-text)' }}>
                                    {s.nombre_siniestro || s.padecimiento || 'Trámite médico'}
                                  </p>
                                  <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--gmm-text-muted)' }}>
                                    {s.numero_siniestro}
                                  </p>
                                  {s.fecha_apertura && (
                                    <p className="text-[9px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)', opacity: 0.7 }}>
                                      Primer gasto: {s.fecha_apertura}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right col: amounts + status */}
                              <div className="text-right shrink-0">
                                {s.total_pagado > 0 && (
                                  <p className="text-[11px] font-black" style={{ color: cfg?.color }}>
                                    Pagado: {fmtK(s.total_pagado)}
                                  </p>
                                )}
                                {s.pendiente > 0 && (
                                  <p className="text-[9px] font-bold" style={{ color: '#F59E0B' }}>
                                    Pend: {fmtK(s.pendiente)}
                                  </p>
                                )}
                                <span
                                  className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest"
                                  style={{ background: `${estadoCfg.color}18`, color: estadoCfg.color, border: `1px solid ${estadoCfg.color}25` }}
                                >
                                  {estadoCfg.label}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Continue button */}
                <div className="pt-2">
                  <button
                    onClick={() => setStep(getNextStep(1))}
                    disabled={!selectedSiniestroId}
                    className="w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: selectedSiniestroId ? meta.color : 'var(--gmm-border)',
                      color:      selectedSiniestroId ? '#1a1a1a' : 'var(--gmm-text-muted)',
                      boxShadow:  selectedSiniestroId ? `0 8px 24px -8px ${meta.color}60` : 'none',
                    }}
                  >
                    Continuar con este Siniestro <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Seleccionar tipo (solo si no viene de submenu) */}
            {step === 2 && !initialTipo && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <StepHeader n={2} title="Seleccionar Propósito" color={meta.color} />
                <StepTipo value={tipo} onChange={setTipo} onNext={() => setStep(getNextStep(2))} />
                <BackButton onClick={() => setStep(getPrevStep(2))} />
              </motion.div>
            )}

            {/* STEP 3 — Detalle económico */}
            {step === 3 && isFinancial && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <StepHeader n={STEPS.findIndex(s => s.id === 3) + 1} title="Detalle Económico" color={meta.color} />
                <FacturasTable
                  invoices={invoices}
                  onChange={setInvoices}
                  onBack={() => setStep(getPrevStep(3))}
                  onNext={() => setStep(getNextStep(3))}
                />
              </motion.div>
            )}

            {/* STEP 4 — Cargar documentos */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <StepHeader n={STEPS.findIndex(s => s.id === 4) + 1} title="Cargar Documentos" color={meta.color} />
                  {Object.keys(files).length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                      <Check size={13} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{Object.keys(files).length} Archivos</span>
                    </div>
                  )}
                </div>

                {/* Context banners per tipo */}
                {tipo === 'carta_remanente' && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <p className="text-[11px] font-bold mb-2">Descarga el formato, llénalo y adjúntalo firmado.</p>
                    <a href="/plantillas/6_Carta-Siniestralidad-Mar26.pdf" download
                       className="inline-block px-4 py-2 bg-amber-500 text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                      Descargar Formato
                    </a>
                  </div>
                )}
                {tipo === 'pago_directo' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-semibold space-y-1">
                    <p className="font-bold text-[12px]">Para Pago Directo adjunta:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      <li>Identificación oficial</li>
                      <li>Credencial MetLife (física y/o digital)</li>
                      <li>Consentimiento informado (si no hay carta pase)</li>
                      <li>Presupuesto de honorarios y/u hospital</li>
                    </ul>
                  </div>
                )}

                <UploadDocs
                  files={files}
                  setFiles={setFiles}
                  onBack={() => setStep(getPrevStep(4))}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            )}

            {/* STEP 5 — Éxito */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/15">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <Check size={48} strokeWidth={3} />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-[28px] font-black tracking-tight text-emerald-500">¡Trámite Enviado!</h2>
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--gmm-text-muted)' }}>
                    Tu solicitud de <strong style={{ color: 'var(--gmm-text)' }}>{meta.label}</strong> fue ingresada correctamente.
                  </p>
                </div>
                <div className="gmm-box px-8 py-4 inline-block">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Folio de Seguimiento</p>
                  <p className="text-[20px] font-mono font-black" style={{ color: meta.color }}>
                    {Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse" style={{ color: 'var(--gmm-text-muted)' }}>
                  Redirigiendo al Dashboard...
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <div className="flex justify-center items-center gap-3 py-6 opacity-30">
        <div className="h-px w-10" style={{ background: 'var(--gmm-border)' }} />
        <FileText size={14} style={{ color: 'var(--gmm-text-muted)' }} />
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
          GMM Platform v2 · MetLife México
        </p>
        <div className="h-px w-10" style={{ background: 'var(--gmm-border)' }} />
      </div>
    </div>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────
function StepHeader({ n, title, color }: { n: number; title: string; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[14px] shrink-0"
           style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
        {n}
      </div>
      <h2 className="text-[20px] font-black uppercase tracking-tight" style={{ color: 'var(--gmm-text)' }}>{title}</h2>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors"
      style={{ color: 'var(--gmm-text-muted)' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--gmm-text)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--gmm-text-muted)')}
    >
      <ArrowLeft size={12} /> Volver
    </button>
  );
}
