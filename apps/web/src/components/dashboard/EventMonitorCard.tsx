'use client';

import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle } from 'lucide-react';

interface EventMonitorCardProps {
  event: {
    claimId: string;
    diagnosis: string;
    chronic?: boolean;
    patientName: string;
    patientPhoto?: string;
    role: string;
    age: string;
    consumed: number;
    pendingAmount?: number;
    sublimit: number;
    deductibleAmount?: number;
    deductibleStatus?: string;
    coaseguroPagado?: number;
    coaseguroLimit?: number;
    coaseguroPercentage?: number;
    lastUpdate?: string;
    status: string;
    observations?: string;
    policyNumber?: string;
    affectedName?: string;
    firstExpenseDate?: string;
    medications?: { name: string; period: string; status: string }[];
  };
  index: number;
  onPhotoUpload: (patientName: string, file: File) => void;
}

export function EventMonitorCard({ event, index, onPhotoUpload }: EventMonitorCardProps) {
  const consumed   = event.consumed;
  const pending    = event.pendingAmount || 0;
  const available  = event.sublimit - consumed;
  const sublimit   = event.sublimit;
  const consumedPct = (consumed / sublimit) * 100;
  const initials   = (event.patientName || 'Asegurado').split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      className="gmm-box p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500"
    >
      {/* ── HEADER ── */}
      <div
        className="px-8 py-8 border-b flex flex-wrap items-center gap-x-12 gap-y-6"
        style={{ background: 'var(--gmm-bg-panel)', borderColor: 'var(--gmm-border)' }}
      >
        {/* Avatar + nombre */}
        <div className="flex items-center gap-6">
          <div className="relative group/photo shrink-0">
            <div
              className="h-16 w-16 rounded-[22px] overflow-hidden shadow-xl flex items-center justify-center
                         transition-all duration-500 group-hover/photo:scale-110 group-hover/photo:rotate-3"
              style={{ background: 'var(--gmm-card)', border: '3px solid rgba(255,170,0,0.25)' }}
            >
              {event.patientPhoto ? (
                <img src={event.patientPhoto} alt={event.patientName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black uppercase" style={{ color: 'var(--gmm-text-muted)' }}>
                  {initials}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>
              Asegurado / Afectado
            </p>
            <h3 className="text-2xl font-black uppercase tracking-tight leading-none" style={{ color: 'var(--gmm-text)' }}>
              {event.patientName}{' '}
              <span style={{ fontWeight: 300, margin: '0 8px', color: 'var(--gmm-text-muted)' }}>|</span>{' '}
              <span style={{ color: '#FFAA00' }}>{event.affectedName || event.patientName}</span>
            </h3>
          </div>
        </div>

        {/* Metadata fields */}
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <div className="space-y-1">
            <p className="text-[13px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Póliza</p>
            <p className="text-lg font-black" style={{ color: 'var(--gmm-text)' }}>{event.policyNumber || '02001-2012432'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Siniestro</p>
            <p className="text-lg font-black" style={{ color: 'var(--gmm-text)' }}>{event.claimId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[13px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--gmm-text-muted)' }}>Primer Gasto</p>
            <p className="text-lg font-black" style={{ color: 'var(--gmm-text)' }}>{event.firstExpenseDate || 'N/A'}</p>
          </div>
        </div>

        {/* Status badge + chevron */}
        <div className="ml-auto flex items-center gap-4">
          <div
            className="px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest"
            style={
              event.status === 'ACTIVO'
                ? { background: 'rgba(34,197,94,0.10)', border: '2px solid rgba(34,197,94,0.20)', color: '#22C55E' }
                : { background: 'rgba(255,170,0,0.08)', border: '2px solid rgba(255,170,0,0.15)', color: '#FFAA00' }
            }
          >
            {event.status}
          </div>
          <button
            className="h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-md active:scale-95"
            style={{ background: 'var(--gmm-card)', border: '1px solid var(--gmm-border)', color: 'var(--gmm-text)' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = '#FFAA00';
              el.style.color = '#343434';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--gmm-card)';
              el.style.color = 'var(--gmm-text)';
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="p-6 flex flex-col xl:flex-row gap-10">

        {/* LEFT: Saldo disponible + barra de progreso */}
        <div className="flex-1 space-y-8">
          <div className="p-8 rounded-[32px]" style={{ background: 'var(--gmm-bg-panel)', border: '1px solid var(--gmm-border)' }}>
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="gmm-text-small font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--gmm-text-muted)' }}>
                  Saldo Disponible del Seguro
                </p>
                <h4 className="text-5xl font-black tracking-tighter" style={{ color: 'var(--gmm-text)' }}>
                  ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black" style={{ color: '#FFAA00' }}>{consumedPct.toFixed(1)}%</span>
                <p className="gmm-text-small font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Consumido</p>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="h-7 w-full rounded-full overflow-hidden"
              style={{ background: 'var(--gmm-border)', border: '3px solid var(--gmm-card)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${consumedPct}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full relative"
                style={{ background: consumedPct > 80 ? '#B22B21' : '#FFAA00' }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[progress-bar-stripes_2s_linear_infinite]" />
              </motion.div>
            </div>

            <div className="flex justify-between mt-5 px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#FFAA00' }} />
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                  Suma Inicial: ${(sublimit / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gmm-text-muted)' }} />
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                  Deducible Aplicado: ${(event.deductibleAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Nota aclaratoria */}
          <div
            className="flex items-start gap-4 px-6 p-4 rounded-2xl"
            style={{ background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.12)' }}
          >
            <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[12px] font-bold italic leading-relaxed" style={{ color: 'var(--gmm-text-muted)' }}>
              Nota aclaratoria: &ldquo;Información sujeta a cambios por flujo de facturación y procesos de auditoría médica en curso.&rdquo;
            </p>
          </div>
        </div>

        {/* RIGHT: Grid de métricas */}
        <div className="xl:w-[540px] grid grid-cols-2 gap-6">
          {[
            { label: 'Total Pagado',         value: consumed,               color: 'var(--gmm-text)', sub: 'Monto liquidado' },
            { label: 'Pendiente Carta Pase', value: pending,                color: '#FFAA00',         sub: 'En proceso' },
            { label: 'Coaseguro Pagado',     value: event.coaseguroPagado,  color: '#FFAA00',         sub: `${event.coaseguroPercentage || 10}% contratado` },
            { label: 'Deducible Total',      value: event.deductibleAmount, color: 'var(--gmm-text)', sub: 'Cuota fija' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-8 rounded-[24px] transition-all duration-300"
              style={{ background: 'var(--gmm-card)', border: '1px solid var(--gmm-border)' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,170,0,0.35)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--gmm-border)';
                el.style.transform = 'none';
              }}
            >
              <p className="gmm-text-small font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--gmm-text-muted)' }}>
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tight mb-1" style={{ color: stat.color }}>
                ${(stat.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
