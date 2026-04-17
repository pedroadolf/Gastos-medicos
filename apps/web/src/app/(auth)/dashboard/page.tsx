'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Plus,
  TrendingUp, FileText, CreditCard, Users, Bell, Sun, Moon
} from 'lucide-react';

// ─── Sub-components ─────────────────────────────────────────────────────────

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sublabel, semaphore }: {
  label: string; value: string; sublabel?: string;
  semaphore?: 'green' | 'yellow' | 'red';
}) {
  const colors = { green: 'bg-gmm-success', yellow: 'bg-gmm-accent', red: 'bg-gmm-danger' };
  return (
    <div className="gmm-card flex flex-col gap-3">
      <p className="text-xs font-semibold text-gmm-text-muted uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-gmm-text">{value}</span>
        {semaphore && (
          <span className={`w-3 h-3 rounded-full mb-1.5 ${colors[semaphore]} shadow-sm`} />
        )}
      </div>
      {sublabel && <p className="text-[11px] text-gmm-text-muted">{sublabel}</p>}
    </div>
  );
}

// ─── Dona Chart (pure CSS/SVG) ───────────────────────────────────────────────
function DonaChart({ cards }: { cards: any[] }) {
  const COLORS = ['#FFAA00', '#B22B21', '#343434', '#D8D9D7'];
  const total = cards.reduce((s, c) => s + c.consumed, 0) || 1;
  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;

  return (
    <div className="gmm-card">
      <p className="text-xs font-semibold text-gmm-text-muted uppercase tracking-widest mb-4">Distribución por Asegurado</p>
      <div className="flex items-center gap-6">
        <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
          <circle r={r} cx="50" cy="50" fill="transparent" stroke="#D8D9D7" strokeWidth="18" />
          {cards.map((c, i) => {
            const pct = c.consumed / total;
            const dash = pct * circ;
            const gap = circ - dash;
            const rotate = (offset / total) * 360 - 90;
            offset += c.consumed;
            return (
              <circle
                key={i}
                r={r} cx="50" cy="50"
                fill="transparent"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                style={{ transform: `rotate(${rotate}deg)`, transformOrigin: '50% 50%', transition: 'stroke-dasharray 1s ease' }}
              />
            );
          })}
        </svg>
        <div className="space-y-2 text-xs">
          {cards.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="font-medium text-gmm-text">{c.name.split(' ')[0]}</span>
              <span className="text-gmm-text-muted">
                {total > 0 ? `${((c.consumed / total) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Insured Card ────────────────────────────────────────────────────────────
function InsuredCard({ card, onClick }: { card: any; onClick: () => void }) {
  const pct = Math.min((card.consumed / card.sublimit) * 100, 100);
  const barColor = pct > 85 ? '#B22B21' : pct > 50 ? '#FFAA00' : '#22c55e';
  const semaphore = pct > 85 ? '🔴' : pct > 50 ? '🟡' : '🟢';

  return (
    <div className="gmm-card hover:-translate-y-1 transition-transform cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gmm-accent/10 flex items-center justify-center shrink-0">
          <Users size={18} className="text-gmm-accent" />
        </div>
        <div>
          <h3 className="font-bold text-gmm-text text-sm">{card.name}</h3>
          <p className="text-[11px] text-gmm-text-muted capitalize">{card.role}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-gmm-text-muted uppercase mb-1">Padecimiento Activo</p>
        <p className="text-sm font-semibold text-gmm-text">{card.padecimiento}</p>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-gmm-text-muted font-medium">Sub-límite {semaphore}</span>
          <span className="font-bold text-gmm-text">{formatMXN(card.consumed)} / {formatMXN(card.sublimit)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-gmm-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className={`px-2 py-0.5 rounded-full font-semibold ${
          card.deducibleStatus === 'cumplido'
            ? 'bg-green-50 text-green-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          Deducible: {card.deducibleStatus === 'cumplido' ? 'Cumplido ✅' : 'En proceso ⏳'}
        </span>
        <span className="text-gmm-text-muted">{card.openSiniestrosCount} siniestros</span>
      </div>

      <button className="gmm-btn-outline mt-4 w-full">Ver detalle</button>
    </div>
  );
}

// ─── Kanban ──────────────────────────────────────────────────────────────────
function KanbanBoard({ kanban }: { kanban: any }) {
  const columns = [
    { key: 'en_tramite', label: '📋 En Trámite', accent: 'border-gmm-accent bg-amber-50/50 dark:bg-amber-900/10' },
    { key: 'pre_autorizados', label: '✅ Pre-autorizados', accent: 'border-green-400 bg-green-50/50 dark:bg-green-900/10' },
    { key: 'en_pago', label: '💰 En Pago', accent: 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' },
    { key: 'rechazados', label: '❌ Rechazados', accent: 'border-gmm-danger bg-red-50/50 dark:bg-red-900/10', danger: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(col => {
        const items: any[] = kanban?.[col.key] || [];
        return (
          <div key={col.key} className={`rounded-2xl border-2 p-4 ${col.accent}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${col.danger ? 'text-gmm-danger' : 'text-gmm-text'}`}>
                {col.label}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.danger ? 'bg-gmm-danger text-white' : 'bg-gmm-text text-white dark:bg-white dark:text-gmm-text'}`}>
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-[11px] text-gmm-text-muted italic text-center py-4">Sin elementos</p>
              ) : (
                items.slice(0, 4).map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gmm-border/50">
                    <p className="text-xs font-semibold text-gmm-text truncate">{item.nombre}</p>
                    <p className="text-[10px] text-gmm-text-muted capitalize mt-0.5">{item.tipo?.replace('_', ' ')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Financial Bars ───────────────────────────────────────────────────────────
function FinancialBars({ desglose }: { desglose: any }) {
  if (!desglose) return null;
  const total = Object.values(desglose).reduce((s: any, v: any) => s + v, 0) as number || 1;
  const bars = [
    { label: 'Hospitalización', value: desglose.hospitalizacion || 0, color: '#343434' },
    { label: 'Medicamentos', value: desglose.honorarios || 0, color: '#FFAA00' },
    { label: 'Honorarios', value: desglose.medicamentos || 0, color: '#B22B21' },
    { label: 'Otros', value: desglose.otros || 0, color: '#D8D9D7' },
  ];

  return (
    <div className="gmm-card">
      <p className="text-xs font-semibold text-gmm-text-muted uppercase tracking-widest mb-4">Desglose Financiero por Tipo de Gasto</p>
      <div className="space-y-3">
        {bars.map((b, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gmm-text">{b.label}</span>
              <span className="text-gmm-text-muted">{formatMXN(b.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-gmm-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(b.value / total) * 100}%`, background: b.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alert Center ─────────────────────────────────────────────────────────────
function AlertCenter({ cards, kanban }: { cards: any[]; kanban: any }) {
  const alerts: Array<{ type: 'danger' | 'warning' | 'success'; text: string }> = [];

  cards.forEach(c => {
    const pct = (c.consumed / c.sublimit) * 100;
    if (pct > 85) alerts.push({ type: 'danger', text: `${c.name.split(' ')[0]} ha consumido el ${pct.toFixed(0)}% de su sub-límite` });
    else if (pct > 50) alerts.push({ type: 'warning', text: `${c.name.split(' ')[0]}: ${pct.toFixed(0)}% del sub-límite consumido` });
  });

  const rechazados = kanban?.rechazados || [];
  if (rechazados.length > 0)
    alerts.push({ type: 'danger', text: `${rechazados.length} trámite(s) rechazado(s) pendiente(s) de revisión` });

  const preAuth = kanban?.pre_autorizados || [];
  if (preAuth.length > 0)
    alerts.push({ type: 'success', text: `${preAuth.length} trámite(s) pre-autorizado(s) listo(s)` });

  const icons = {
    danger: <span className="text-gmm-danger">🔴</span>,
    warning: <span className="text-gmm-accent">🟡</span>,
    success: <span className="text-green-500">🟢</span>,
  };

  const bgColors = {
    danger: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  };

  return (
    <div className="gmm-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gmm-accent/10 flex items-center justify-center">
          <Bell size={14} className="text-gmm-accent" />
        </div>
        <p className="text-xs font-bold text-gmm-text uppercase tracking-widest">Centro de Alertas & Próximos Pasos</p>
      </div>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Todos los trámites están en orden</p>
          </div>
        ) : (
          alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${bgColors[a.type]}`}>
              <span className="mt-0.5 shrink-0">{icons[a.type]}</span>
              <p className="text-xs font-medium text-gmm-text">{a.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardGMMPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/estado-cuenta').then(r => r.json()),
      fetch('/api/dashboard/metrics').then(r => r.json()),
    ]).then(([estadoCuenta, met]) => {
      setData(estadoCuenta);
      setMetrics(met);
    }).catch(e => console.error(e)).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gmm-bg">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gmm-accent/20 border-t-gmm-accent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gmm-text-muted">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  const cards: any[] = data?.insuredCards || [];
  const kanban = data?.kanban || {};
  const desglose = data?.gastoDesglose || {};

  const kpis = metrics?.data?.kpis;
  const totalConsumed = kpis?.consumed || 0;
  const totalLimit = kpis?.baseLimit || 5_000_000;
  const available = totalLimit - totalConsumed;
  const consumedPct = (totalConsumed / totalLimit) * 100;
  const semaphore = consumedPct > 85 ? 'red' : consumedPct > 50 ? 'yellow' : 'green';

  return (
    <div className="min-h-screen bg-gmm-bg dark:bg-gray-950 transition-colors">

      {/* Folder texture overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(0,0,0,0.015)_1%,transparent_1%)] bg-[length:20px_20px] z-0" />

      {/* ── Header ── */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gmm-border dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-gmm-accent rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-gmm-text dark:text-white leading-none">GMM Dashboard</h1>
              <p className="text-[10px] text-gmm-text-muted">Póliza #GMM-98765</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', href: '/dashboard', active: true },
              { label: 'Nuevo Trámite', href: '/tramites/nuevo' },
              { label: 'Mis Trámites', href: '/tramites' },
              { label: 'Observabilidad', href: '/observabilidad' },
              { label: 'Configuración', href: '/configuracion' },
            ].map(item => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  item.active
                    ? 'bg-gmm-accent text-white shadow-sm'
                    : 'text-gmm-text-muted hover:text-gmm-text hover:bg-gmm-border/50 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/tramites/nuevo')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gmm-accent text-white text-xs font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-sm"
            >
              <Plus size={14} /> Nuevo Trámite
            </button>
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg border border-gmm-border dark:border-gray-700 flex items-center justify-center hover:bg-gmm-border/50 transition-colors text-gmm-text-muted"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ─── */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-10">

        {/* Section title */}
        <div>
          <h2 className="text-2xl font-extrabold text-gmm-text dark:text-white">Estado de Cuenta</h2>
          <p className="text-sm text-gmm-text-muted mt-1">Póliza Gastos Médicos Mayores — Familia Soto</p>
        </div>

        {/* ─ 1. KPIs globales + Dona ─ */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <KPICard
            label="Suma Asegurada Total"
            value={formatMXN(totalLimit)}
            sublabel="Cobertura base activa"
          />
          <KPICard
            label="Suma Consumida"
            value={formatMXN(totalConsumed)}
            sublabel={`${consumedPct.toFixed(1)}% del límite utilizado`}
            semaphore={semaphore}
          />
          <KPICard
            label="Suma Disponible"
            value={formatMXN(available)}
            sublabel="Monto restante en póliza base"
            semaphore={available < totalLimit * 0.15 ? 'red' : 'green'}
          />
          <DonaChart cards={cards} />
        </section>

        {/* ─ 2. Tarjetas de asegurados ─ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} className="text-gmm-accent" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gmm-text-muted">Asegurados Activos</h2>
          </div>
          {cards.length === 0 ? (
            <div className="gmm-card text-center py-12">
              <p className="text-gmm-text-muted text-sm">No hay asegurados registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {cards.map((card, i) => (
                <InsuredCard
                  key={i}
                  card={card}
                  onClick={() => router.push(`/siniestros?user=${card.userId}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─ 3. Kanban de siniestros ─ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <FileText size={14} className="text-gmm-accent" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gmm-text-muted">Tubería de Siniestros</h2>
          </div>
          <KanbanBoard kanban={kanban} />
        </section>

        {/* ─ 4. Desglose Financiero + Gasto Bolsillo ─ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialBars desglose={desglose} />

          {/* Gasto de bolsillo */}
          <div className="gmm-card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={14} className="text-gmm-accent" />
              <p className="text-xs font-bold text-gmm-text-muted uppercase tracking-widest">Gasto de Bolsillo</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gmm-border">
                  <th className="text-left py-2 text-xs font-bold text-gmm-text-muted">Asegurado</th>
                  <th className="text-right py-2 text-xs font-bold text-gmm-text-muted">No cubierto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gmm-border/50">
                {cards.length === 0 ? (
                  <tr><td colSpan={2} className="py-6 text-center text-gmm-text-muted text-xs italic">Sin datos</td></tr>
                ) : (
                  cards.map((c, i) => {
                    const estimated = c.consumed * 0.05;
                    return (
                      <tr key={i}>
                        <td className="py-2.5 font-medium text-gmm-text">{c.name.split(' ')[0]}</td>
                        <td className={`py-2.5 text-right font-bold ${estimated > 0 ? 'text-gmm-danger' : 'text-green-600'}`}>
                          {formatMXN(estimated)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─ 5. Alertas ─ */}
        <section>
          <AlertCenter cards={cards} kanban={kanban} />
        </section>

      </main>
    </div>
  );
}
