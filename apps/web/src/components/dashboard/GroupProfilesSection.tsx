'use client';

import { motion } from 'framer-motion';
import { FileText, AlertCircle, Clock, CheckCircle2, HelpCircle, TrendingDown, Wallet, Receipt, Shield } from 'lucide-react';
import { ASEGURADOS_GRUPO, POLIZA_VIGENTE, calcularSubtotalAsegurado, calcularTotalGrupo, type Siniestro, type AseguradoGrupo } from '@/lib/siniestros-data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1_000).toFixed(1)}k`;

const ESTADO_CONFIG = {
  liquidado:      { label: 'Liquidado',          bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  color: '#22C55E', icon: CheckCircle2 },
  carta_pase:     { label: 'Carta Pase Pend.',   bg: 'rgba(255,170,0,0.10)', border: 'rgba(255,170,0,0.25)', color: '#FFAA00', icon: Clock },
  revision:       { label: 'En Revisión',         bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', color: '#EF4444', icon: AlertCircle },
  sin_movimiento: { label: 'Sin Movimiento',      bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.20)', color: '#94A3B8', icon: HelpCircle },
  pendiente_carta:{ label: 'Pendiente de Carta',  bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)', color: '#818CF8', icon: FileText },
};

const PARENTESCO_COLOR: Record<string, string> = {
  Titular: '#FFAA00',
  Cónyuge: '#22C55E',
  Hijo:    '#38BDF8',
  Hija:    '#F472B6',
};

const PARENTESCO_INITIALS: Record<string, string> = {
  'Pedro Adolfo Soto Hernández':      'PA',
  'Claudia Fonseca Aguilar':          'CF',
  'Emilio Soto Fonseca':              'ES',
  'Pedro Sebastián Soto Fonseca':     'PS',
};

// ─── Tarjeta individual de siniestro ─────────────────────────────────────────

function SiniestroCard({ s, idx }: { s: Siniestro; idx: number }) {
  const cfg = ESTADO_CONFIG[s.estado];
  const Icon = cfg.icon;

  if (s.estado === 'pendiente_carta') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 min-h-[160px]"
        style={{ borderColor: cfg.border, background: cfg.bg }}
      >
        <FileText size={28} style={{ color: cfg.color, opacity: 0.6 }} />
        <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: cfg.color }}>
          Pendiente de Carta
        </p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
          MetLife enviará la carta<br />de siniestralidad próximamente
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="rounded-[20px] overflow-hidden group transition-all duration-300 hover:shadow-xl"
      style={{ background: 'var(--gmm-card)', border: `1px solid var(--gmm-border)` }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,170,0,0.3)'}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gmm-border)'}
    >
      {/* Header de la card */}
      <div className="px-5 py-4 flex items-center justify-between gap-4" style={{ background: 'var(--gmm-bg-panel)', borderBottom: '1px solid var(--gmm-border)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <Icon size={13} style={{ color: cfg.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Siniestro</p>
            <p className="text-[13px] font-black font-mono truncate" style={{ color: 'var(--gmm-text)' }}>{s.numero}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Inciso badge */}
          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest" style={{ background: 'rgba(255,170,0,0.10)', border: '1px solid rgba(255,170,0,0.25)', color: '#FFAA00' }}>
            Inciso 4
          </span>
          {/* Estado badge */}
          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Padecimiento */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>Padecimiento</p>
          <p className="text-[13px] font-bold leading-snug" style={{ color: 'var(--gmm-text)' }}>{s.padecimiento}</p>
        </div>

        {/* Póliza */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Póliza</p>
            <p className="text-[12px] font-black font-mono" style={{ color: 'var(--gmm-text)' }}>{s.poliza}</p>
          </div>
          {s.primer_gasto && (
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Primer Gasto</p>
              <p className="text-[11px] font-bold" style={{ color: 'var(--gmm-text)' }}>{s.primer_gasto}</p>
            </div>
          )}
        </div>

        {/* Grid financiero */}
        <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: '1px solid var(--gmm-border)' }}>
          {[
            { label: 'Suma Asegurada', value: s.suma_asegurada, color: 'var(--gmm-text)' },
            { label: 'SA Disponible',  value: s.sa_disponible,  color: '#22C55E' },
            { label: 'Total Pagado',   value: s.total_pagado,   color: '#FFAA00' },
            { label: 'Pend. Carta Pase', value: s.pendiente_carta_pase, color: s.pendiente_carta_pase > 0 ? '#FFAA00' : 'var(--gmm-text-muted)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
              <p className="text-[13px] font-black" style={{ color }}>{fmtK(value)}</p>
            </div>
          ))}
        </div>

        {/* Deducible / Coaseguro */}
        {(s.deducible_aplicado > 0 || s.coaseguro_aplicado > 0) && (
          <div className="flex gap-4 px-4 py-3 rounded-[12px]" style={{ background: 'var(--gmm-bg-panel)', border: '1px solid var(--gmm-border)' }}>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--gmm-text-muted)' }}>Deducible</p>
              <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>${fmt(s.deducible_aplicado)}</p>
            </div>
            <div className="w-px" style={{ background: 'var(--gmm-border)' }} />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--gmm-text-muted)' }}>Coaseguro {s.coaseguro_pct}%</p>
              <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>${fmt(s.coaseguro_aplicado)}</p>
            </div>
          </div>
        )}

        {/* Nota */}
        {s.nota && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-[10px]" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold italic leading-relaxed" style={{ color: 'var(--gmm-text-muted)' }}>{s.nota}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Bloque de asegurado (nombre + sus siniestros + subtotal) ─────────────────

function AseguradoBlock({ asegurado, blockIdx }: { asegurado: AseguradoGrupo; blockIdx: number }) {
  const color = PARENTESCO_COLOR[asegurado.parentesco] || '#FFAA00';
  const initials = PARENTESCO_INITIALS[asegurado.nombre] || asegurado.nombre.substring(0, 2).toUpperCase();
  const sub = calcularSubtotalAsegurado(asegurado);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: blockIdx * 0.1, duration: 0.5 }}
      className="space-y-5"
    >
      {/* Header asegurado */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-lg font-black shrink-0"
          style={{ background: `${color}18`, border: `2px solid ${color}40`, color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-black uppercase tracking-tight" style={{ color: 'var(--gmm-text)' }}>
            {asegurado.nombre}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md" style={{ background: `${color}18`, color }}>
              {asegurado.parentesco}
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--gmm-text-muted)' }}>
              {asegurado.edad} años · {sub.count_siniestros} siniestro{sub.count_siniestros !== 1 ? 's' : ''} registrado{sub.count_siniestros !== 1 ? 's' : ''}
              {sub.count_pendientes_carta > 0 && ` · ${sub.count_pendientes_carta} pendiente${sub.count_pendientes_carta > 1 ? 's' : ''} de carta`}
            </span>
          </div>
        </div>

        {/* Mini-subtotal inline */}
        <div className="flex items-center gap-6">
          {[
            { label: 'Pagado', value: sub.total_pagado, color: '#FFAA00' },
            { label: 'Pendiente', value: sub.total_pendiente, color: sub.total_pendiente > 0 ? '#EF4444' : 'var(--gmm-text-muted)' },
          ].map(({ label, value, color: c }) => (
            <div key={label} className="text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
              <p className="text-[14px] font-black" style={{ color: c }}>{fmtK(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de siniestros */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {asegurado.siniestros.map((s, i) => (
          <SiniestroCard key={s.numero} s={s} idx={i} />
        ))}
      </div>

      {/* Subtotal asegurado */}
      <div className="rounded-[20px] p-5" style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-4" style={{ color }}>
          Subtotal — {asegurado.nombre.split(' ')[0]} {asegurado.nombre.split(' ')[1]}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Pagado',      value: sub.total_pagado,    icon: Wallet,       color: '#FFAA00' },
            { label: 'Pend. Carta Pase',  value: sub.total_pendiente, icon: Clock,        color: sub.total_pendiente > 0 ? '#EF4444' : '#94A3B8' },
            { label: 'Deducibles',        value: sub.total_deducible, icon: TrendingDown, color: 'var(--gmm-text)' },
            { label: 'Coaseguro',         value: sub.total_coaseguro, icon: Receipt,      color: 'var(--gmm-text)' },
          ].map(({ label, value, icon: Icon, color: c }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--gmm-card)', border: '1px solid var(--gmm-border)' }}>
                <Icon size={15} style={{ color: c }} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
                <p className="text-[14px] font-black" style={{ color: c }}>{fmtK(value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function GroupProfilesSection() {
  const total = calcularTotalGrupo();
  // Póliza vigente SA referencia (30,298 UMA × $117.31 = ~$3,554,258 — se expone como referencia)
  // Para el gauge usamos el total pagado vs suma de todas las SA de siniestros activos con póliza vigente
  const totalSAVigente = 3_961_725; // COVID póliza principal 2012432 como referencia base
  const consumoPct = Math.min((total.total_pagado / totalSAVigente) * 100, 100);

  return (
    <div className="space-y-14">

      {/* ── Header sección ── */}
      <div className="gmm-box p-0 overflow-hidden">
        {/* Banner top */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 px-6 py-5" style={{ background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <Shield size={15} style={{ color: '#38BDF8' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#38BDF8' }}>Póliza Vigente</p>
              <p className="text-[11px] font-bold" style={{ color: 'var(--gmm-text)' }}>
                {POLIZA_VIGENTE.numero} · {POLIZA_VIGENTE.nombre} · <span style={{ color: '#FFAA00' }}>Inciso {POLIZA_VIGENTE.inciso}</span>
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Siniestros con Carta</p>
              <p className="text-[18px] font-black" style={{ color: 'var(--gmm-text)' }}>{total.count_siniestros} <span className="text-[10px] font-bold text-slate-400">de 16</span></p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Total Pagado Grupo</p>
              <p className="text-[18px] font-black" style={{ color: '#FFAA00' }}>{fmtK(total.total_pagado)}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Pendiente Carta Pase</p>
              <p className="text-[18px] font-black" style={{ color: total.total_pendiente > 0 ? '#EF4444' : '#94A3B8' }}>{fmtK(total.total_pendiente)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bloques por asegurado ── */}
      {ASEGURADOS_GRUPO.map((asegurado, i) => (
        <AseguradoBlock key={asegurado.id} asegurado={asegurado} blockIdx={i} />
      ))}

      {/* ── TOTAL GENERAL ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gmm-box p-0 overflow-hidden"
      >
        {/* Label */}
        <div className="px-6 py-4" style={{ background: 'rgba(255,170,0,0.06)', borderBottom: '1px solid rgba(255,170,0,0.18)' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: '#FFAA00' }}>
            Total General — Grupo Asegurado PASH
          </p>
          <p className="text-[9px] font-bold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
            Acumulado histórico de todos los siniestros con carta de siniestralidad emitida
          </p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Pagado Grupo',      value: total.total_pagado,    icon: Wallet,       color: '#FFAA00', sub: `${total.count_siniestros} siniestros` },
            { label: 'Total Pend. Carta Pase',  value: total.total_pendiente, icon: Clock,        color: '#EF4444', sub: 'En trámite' },
            { label: 'Total Deducibles',        value: total.total_deducible, icon: TrendingDown, color: 'var(--gmm-text)', sub: 'Aplicados' },
            { label: 'Total Coaseguro',         value: total.total_coaseguro, icon: Receipt,      color: 'var(--gmm-text)', sub: '10% contratado' },
          ].map(({ label, value, icon: Icon, color, sub }, idx) => (
            <div
              key={label}
              className="p-6 flex items-center gap-4"
              style={{ borderRight: idx < 3 ? '1px solid var(--gmm-border)' : 'none' }}
            >
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                style={{ background: `${color === 'var(--gmm-text)' ? 'rgba(255,255,255' : color.replace('#', 'rgba(').replace('A', ',').replace('B', ',')}0.12)`, border: '1px solid var(--gmm-border)' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
                <p className="text-[20px] font-black" style={{ color }}>{fmtK(value)}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Barra de consumo vs póliza principal */}
        <div className="px-6 py-5" style={{ borderTop: '1px solid var(--gmm-border)', background: 'var(--gmm-bg-panel)' }}>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>
                Consumo vs Suma Asegurada Principal (COVID — Póliza Vigente)
              </p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--gmm-text)' }}>
                ${fmt(total.total_pagado)} pagado de ${fmt(totalSAVigente)} SA
              </p>
            </div>
            <span className="text-[22px] font-black" style={{ color: consumoPct > 80 ? '#EF4444' : '#FFAA00' }}>
              {consumoPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 w-full rounded-full overflow-hidden" style={{ background: 'var(--gmm-border)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${consumoPct}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: consumoPct > 80 ? '#EF4444' : '#FFAA00' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
