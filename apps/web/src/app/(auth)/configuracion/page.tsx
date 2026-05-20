'use client';

import {
  Settings,
  Key,
  Database,
  User,
  Save,
  RefreshCw,
  Cpu,
  Shield,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const TABS = [
  { id: 'profile', label: 'Perfil de Usuario', icon: User },
  { id: 'agent',   label: 'Agentes & Modelos', icon: Cpu },
  { id: 'api',     label: 'Seguridad & API',   icon: Key },
  { id: 'db',      label: 'Base de Datos',      icon: Database },
];

export default function ConfigPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving]   = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  const userInitials = session?.user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('') ?? 'U';

  return (
    <div className="pb-24">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gmm-accent)', opacity: 0.9 }}>
            <Settings size={14} style={{ color: '#1a1a1a' }} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>Configuración del Sistema</span>
        </div>
        <h1 className="text-[26px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>Configuración</h1>
        <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--gmm-text-muted)' }}>Administra tu perfil, preferencias y conexiones del sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border"
                style={{
                  background:   isActive ? `var(--gmm-accent)15` : 'transparent',
                  borderColor:  isActive ? `var(--gmm-accent)40` : 'transparent',
                  color:        isActive ? 'var(--gmm-accent)'   : 'var(--gmm-text-muted)',
                  boxShadow:    isActive ? `0 4px 14px -4px var(--gmm-accent)20` : 'none',
                }}
              >
                <Icon size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gmm-accent)' }} />}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="lg:col-span-3">
          <div className="gmm-box p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none" style={{ background: 'var(--gmm-accent)', opacity: 0.03, filter: 'blur(60px)' }} />

            <div className="relative z-10">

              {/* ── Perfil de Usuario ── */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionHeader title="Perfil de Usuario" subtitle="Información de tu cuenta Google conectada." />

                  <div className="flex items-center gap-5">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Avatar"
                        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gmm-accent"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
                        style={{ background: 'var(--gmm-accent)', color: '#1a1a1a' }}
                      >
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <p className="text-[18px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>
                        {session?.user?.name ?? 'Usuario'}
                      </p>
                      <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>
                        {session?.user?.email ?? '—'}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest mt-2"
                        style={{ background: 'var(--gmm-accent)15', color: 'var(--gmm-accent)', border: '1px solid var(--gmm-accent)30' }}
                      >
                        <Shield size={10} /> {(session?.user as any)?.role === 'admin' ? 'Administrador' : 'Asegurado'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Nombre" value={session?.user?.name ?? '—'} />
                    <InfoField label="Correo Electrónico" value={session?.user?.email ?? '—'} />
                    <InfoField label="Rol en el Sistema" value={(session?.user as any)?.role === 'admin' ? 'Administrador (acceso total)' : 'Asegurado'} />
                    <InfoField label="Proveedor de Identidad" value="Google OAuth 2.0" />
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: 'var(--gmm-border)' }}>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                      style={{ background: '#EF444415', color: '#EF4444', border: '1px solid #EF444430' }}
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}

              {/* ── Agentes & Modelos ── */}
              {activeTab === 'agent' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionHeader title="Orquestación de IA" subtitle="Configura los modelos para los agentes de procesamiento de trámites." />
                  <div className="space-y-4">
                    <ToggleRow label="Modelo Principal (Orquestador)" description="Gemini 2.0 Flash — Recomendado para precisión" defaultOn={true} />
                    <ToggleRow label="Modo de Alta Velocidad" description="Gemini Flash-8B para extracciones rápidas" defaultOn={false} />
                    <div className="gmm-box p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>Límite de Tokens Mensual</p>
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>Uso actual: 1.2M de 5.0M</p>
                      </div>
                      <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--gmm-border)' }}>
                        <div className="h-full rounded-full w-[24%]" style={{ background: 'var(--gmm-accent)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Seguridad & API ── */}
              {activeTab === 'api' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionHeader title="Seguridad & Conexiones" subtitle="Administra los secretos del sistema y las integraciones externas." />
                  <div className="space-y-4">
                    <InputField label="Supabase URL" placeholder="https://xxx.supabase.co" />
                    <InputField label="Supabase Anon Key" placeholder="sb_publishable_..." type="password" />
                    <InputField label="Google Client ID" placeholder="xxx.apps.googleusercontent.com" type="password" />
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-80" style={{ color: 'var(--gmm-accent)' }}>
                    <RefreshCw size={12} /> Rotar Llaves de Acceso
                  </button>
                </div>
              )}

              {/* ── Base de Datos ── */}
              {activeTab === 'db' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SectionHeader title="Base de Datos" subtitle="Estado de la conexión con Supabase PostgreSQL." />
                  <div className="space-y-4">
                    <StatusRow label="Supabase PostgreSQL"    status="connected" />
                    <StatusRow label="Google Sheets Sync"    status="connected" />
                    <StatusRow label="Storage (PDF Bucket)"  status="connected" />
                    <StatusRow label="Auth (NextAuth)"       status="connected" />
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              {activeTab !== 'profile' && (
                <div className="mt-10 pt-6 border-t flex justify-end gap-3" style={{ borderColor: 'var(--gmm-border)' }}>
                  <button
                    className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: 'var(--gmm-border)', color: 'var(--gmm-text-muted)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    style={{ background: 'var(--gmm-accent)', color: '#1a1a1a' }}
                  >
                    {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                    Guardar Configuración
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-[16px] font-black tracking-tight" style={{ color: 'var(--gmm-text)' }}>{title}</h2>
      <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{subtitle}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="gmm-box p-4">
      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--gmm-text-muted)' }}>{label}</p>
      <p className="text-[13px] font-black" style={{ color: 'var(--gmm-text)' }}>{value}</p>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--gmm-text-muted)' }}>{label}</label>
      <input
        type={type}
        defaultValue={placeholder}
        className="w-full rounded-xl px-4 py-3 text-[12px] font-semibold outline-none transition-all"
        style={{
          background:   'var(--gmm-bg)',
          border:       '1px solid var(--gmm-border)',
          color:        'var(--gmm-text)',
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--gmm-accent)'; }}
        onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = 'var(--gmm-border)'; }}
      />
    </div>
  );
}

function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="gmm-box p-5 flex items-center justify-between">
      <div>
        <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>{label}</p>
        <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--gmm-text-muted)' }}>{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="w-11 h-6 rounded-full transition-all flex items-center px-0.5"
        style={{ background: on ? 'var(--gmm-accent)' : 'var(--gmm-border)' }}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: 'connected' | 'error' | 'pending' }) {
  const colors = { connected: '#10B981', error: '#EF4444', pending: '#F59E0B' };
  const labels = { connected: 'Conectado', error: 'Error', pending: 'Pendiente' };
  const color  = colors[status];
  return (
    <div className="gmm-box p-4 flex items-center justify-between">
      <p className="text-[12px] font-black" style={{ color: 'var(--gmm-text)' }}>{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{labels[status]}</span>
      </div>
    </div>
  );
}
