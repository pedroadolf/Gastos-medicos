'use client';

import { motion } from 'framer-motion';
import { Shield, Clock, CheckCircle2, AlertCircle, HelpCircle, FileText, Wallet, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  ASEGURADOS_GRUPO,
  POLIZA_VIGENTE,
  calcularSubtotalAsegurado,
  calcularTotalGrupo,
  type Siniestro,
  type AseguradoGrupo,
} from '@/lib/siniestros-data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS: Record<string, string> = {
  'pedro-soto':      '#22C55E',
  'claudia-fonseca':  '#FFAA00',
  'emilio-soto':      '#38BDF8',
  'sebastian-soto':   '#A78BFA',
};

const ESTADO_BADGE: Record<string, { label: string; bg: string; border: string; color: string; icon: typeof CheckCircle2 }> = {
  liquidado:       { label: 'Liquidado',      bg: 'rgba(34,197,94,0.10)',    border: 'rgba(34,197,94,0.25)',    color: '#22C55E', icon: CheckCircle2 },
  carta_pase:      { label: 'Carta Pase',     bg: 'rgba(255,170,0,0.10)',   border: 'rgba(255,170,0,0.25)',   color: '#FFAA00', icon: Clock },
  revision:        { label: 'En Revisión',    bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)',   color: '#EF4444', icon: AlertCircle },
  sin_movimiento:  { label: 'Sin Movimiento', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.20)', color: '#94A3B8', icon: HelpCircle },
  pendiente_carta: { label: 'Pend. Carta',    bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.20)',  color: '#818CF8', icon: FileText },
};

// ─── Table row for a single siniestro ─────────────────────────────────────────

function SiniestroRow({ s }: { s: Siniestro }) {
  const cfg = ESTADO_BADGE[s.estado];
  const Icon = cfg.icon;
  const isPending = s.estado === 'pendiente_carta';

  return (
    <tr
      className="transition-colors group"
      style={{ opacity: isPending ? 0.5 : 1 }}
      onMouseEnter={(e) => {
        if (!isPending) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,170,0,0.03)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background = 'transparent';
      }}
    >
      {/* # Siniestro */}
      <td className="px-4 py-3 text-[11px] font-black font-mono whitespace-nowrap" style={{ color: 'var(--gmm-text)' }}>
        {isPending ? (
          <span className="italic" style={{ color: '#818CF8' }}>— Pendiente —</span>
        ) : (
          s.numero
        )}
      </td>
      {/* Padecimiento */}
      <td className="px-4 py-3 text-[11px] font-bold max-w-[200px]" style={{ color: 'var(--gmm-text)' }}>
        <div className="truncate" title={s.padecimiento}>{s.padecimiento}</div>
        {s.nota && (
          <p className="text-[9px] italic mt-0.5 truncate" style={{ color: '#EF4444' }} title={s.nota}>
            ⚠ {s.nota}
          </p>
        )}
      </td>
      {/* Póliza */}
      <td className="px-4 py-3 text-[10px] font-bold font-mono whitespace-nowrap" style={{ color: 'var(--gmm-text-muted)' }}>
        {isPending ? '—' : s.poliza}
      </td>
      {/* Pagado */}
      <td className="px-4 py-3 text-[11px] font-black text-right whitespace-nowrap" style={{ color: '#FFAA00' }}>
        {isPending ? '—' : `$${fmt(s.total_pagado)}`}
      </td>
      {/* Pendiente */}
      <td className="px-4 py-3 text-[11px] font-black text-right whitespace-nowrap" style={{ color: s.pendiente_carta_pase > 0 ? '#EF4444' : 'var(--gmm-text-muted)' }}>
        {isPending ? '—' : `$${fmt(s.pendiente_carta_pase)}`}
      </td>
      {/* SA Disponible */}
      <td className="px-4 py-3 text-[11px] font-black text-right whitespace-nowrap" style={{ color: '#22C55E' }}>
        {isPending ? '—' : `$${fmt(s.sa_disponible)}`}
      </td>
      {/* Estado */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
        >
          <Icon size={10} />
          {cfg.label}
        </span>
      </td>
    </tr>
  );
}

// ─── Subtotal row ────────────────────────────────────────────────────────────

function SubtotalRow({ label, color, pagado, pendiente }: { label: string; color: string; pagado: number; pendiente: number }) {
  return (
    <tr style={{ background: `${color}08`, borderTop: `2px solid ${color}30` }}>
      <td colSpan={3} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>
        Subtotal — {label}
      </td>
      <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: '#FFAA00' }}>
        ${fmt(pagado)}
      </td>
      <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: pendiente > 0 ? '#EF4444' : 'var(--gmm-text-muted)' }}>
        ${fmt(pendiente)}
      </td>
      <td colSpan={2} />
    </tr>
  );
}

// ─── Insured block (header + table) ──────────────────────────────────────────

function AseguradoTable({ asegurado, idx }: { asegurado: AseguradoGrupo; idx: number }) {
  const [expanded, setExpanded] = useState(true);
  const color = COLORS[asegurado.id] || '#94A3B8';
  const sub = calcularSubtotalAsegurado(asegurado);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, duration: 0.4 }}
      className="gmm-box p-0 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center gap-4 transition-colors text-left"
        style={{ background: `${color}06`, borderBottom: expanded ? `1px solid ${color}20` : 'none' }}
      >
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[13px] font-black shrink-0"
          style={{ background: `${color}18`, border: `2px solid ${color}35`, color }}
        >
          {asegurado.nombre.split(' ').map((w) => w[0]).join('').substring(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-black uppercase tracking-tight" style={{ color: 'var(--gmm-text)' }}>
            {asegurado.nombre}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md" style={{ background: `${color}15`, color }}>
              {asegurado.parentesco}
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
              {asegurado.edad} años · {sub.count_siniestros} siniestro{sub.count_siniestros !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Inline totals */}
        <div className="flex items-center gap-6 mr-2">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Pagado</p>
            <p className="text-[15px] font-black" style={{ color: '#FFAA00' }}>
              ${fmt(sub.total_pagado)}
            </p>
          </div>
          {sub.total_pendiente > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Pendiente</p>
              <p className="text-[15px] font-black" style={{ color: '#EF4444' }}>
                ${fmt(sub.total_pendiente)}
              </p>
            </div>
          )}
        </div>

        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-300"
          style={{ color: 'var(--gmm-text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Table */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--gmm-bg-panel)', borderBottom: '1px solid var(--gmm-border)' }}>
                {['# Siniestro', 'Padecimiento', 'Póliza', 'Pagado', 'Pendiente', 'SA Disponible', 'Estado'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${i >= 3 && i <= 5 ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--gmm-text-muted)', borderBottom: '1px solid var(--gmm-border)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {asegurado.siniestros.map((s) => (
                <SiniestroRow key={s.numero} s={s} />
              ))}
              <SubtotalRow
                label={asegurado.nombre.split(' ')[0]}
                color={color}
                pagado={sub.total_pagado}
                pendiente={sub.total_pendiente}
              />
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main section component ──────────────────────────────────────────────────

export function InsuredSiniestrosSection() {
  const total = calcularTotalGrupo();

  return (
    <div className="space-y-6">

      {/* ── Policy badge ── */}
      <div className="gmm-box p-0 overflow-hidden">
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          style={{ background: 'rgba(56,189,248,0.04)', borderBottom: '1px solid rgba(56,189,248,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <Shield size={16} style={{ color: '#38BDF8' }} />
            <p className="text-[11px] font-bold" style={{ color: 'var(--gmm-text)' }}>
              Póliza vigente <strong style={{ color: '#FFAA00' }}>{POLIZA_VIGENTE.numero}</strong> · {POLIZA_VIGENTE.nombre} · Inciso {POLIZA_VIGENTE.inciso}
            </p>
          </div>
          <p className="text-[10px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
            {total.count_siniestros} de 16 siniestros con carta
          </p>
        </div>
      </div>

      {/* ── Per-insured tables ── */}
      {ASEGURADOS_GRUPO.map((a, i) => (
        <AseguradoTable key={a.id} asegurado={a} idx={i} />
      ))}

      {/* ── GRAND TOTAL ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gmm-box p-0 overflow-hidden"
      >
        <div className="px-5 py-3" style={{ background: 'rgba(255,170,0,0.06)', borderBottom: '1px solid rgba(255,170,0,0.18)' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: '#FFAA00' }}>
            Total General — Grupo Asegurado PASH
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--gmm-bg-panel)' }}>
                {['Asegurado', 'Siniestros', 'Total Pagado', 'Pendiente', 'Deducibles', 'Coaseguro'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${i >= 2 ? 'text-right' : 'text-left'}`}
                    style={{ color: 'var(--gmm-text-muted)', borderBottom: '1px solid var(--gmm-border)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASEGURADOS_GRUPO.map((a) => {
                const sub = calcularSubtotalAsegurado(a);
                const color = COLORS[a.id] || '#94A3B8';
                return (
                  <tr key={a.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[11px] font-black" style={{ color: 'var(--gmm-text)' }}>{a.nombre.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>{a.parentesco}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>{sub.count_siniestros}</td>
                    <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: '#FFAA00' }}>${fmt(sub.total_pagado)}</td>
                    <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: sub.total_pendiente > 0 ? '#EF4444' : 'var(--gmm-text-muted)' }}>${fmt(sub.total_pendiente)}</td>
                    <td className="px-4 py-3 text-[11px] font-bold text-right" style={{ color: 'var(--gmm-text-muted)' }}>${fmt(sub.total_deducible)}</td>
                    <td className="px-4 py-3 text-[11px] font-bold text-right" style={{ color: 'var(--gmm-text-muted)' }}>${fmt(sub.total_coaseguro)}</td>
                  </tr>
                );
              })}
              {/* TOTAL ROW */}
              <tr style={{ background: 'rgba(255,170,0,0.06)', borderTop: '2px solid rgba(255,170,0,0.25)' }}>
                <td className="px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: '#FFAA00' }}>
                  Total Grupo
                </td>
                <td className="px-4 py-3 text-[11px] font-black" style={{ color: '#FFAA00' }}>{total.count_siniestros}</td>
                <td className="px-4 py-3 text-[14px] font-black text-right" style={{ color: '#FFAA00' }}>${fmt(total.total_pagado)}</td>
                <td className="px-4 py-3 text-[14px] font-black text-right" style={{ color: total.total_pendiente > 0 ? '#EF4444' : '#94A3B8' }}>${fmt(total.total_pendiente)}</td>
                <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: 'var(--gmm-text)' }}>${fmt(total.total_deducible)}</td>
                <td className="px-4 py-3 text-[12px] font-black text-right" style={{ color: 'var(--gmm-text)' }}>${fmt(total.total_coaseguro)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
