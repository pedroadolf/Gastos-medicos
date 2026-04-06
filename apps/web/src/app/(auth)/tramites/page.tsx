import PowerDashboard from '@/components/tramite/PowerDashboard';
export const dynamic = 'force-dynamic';

/**
 * 📂 MI PANEL DE TRÁMITES (Authenticated)
 * Relocated to (auth) group to include Sidebar and Auth layout.
 */
export default function TramitesPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)]">
      {/* 🚀 TOP HERO SECTION (Custom for this view) */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900/40 p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 backdrop-blur-2xl shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100 dark:border-blue-800/50">
                Gestión de Expedientes
              </span>
              <span className="text-slate-300 dark:text-white/20 text-[10px] uppercase font-black tracking-widest">•</span>
              <span className="text-emerald-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                Real-time Sync
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter sm:text-5xl">
              Mis <span className="text-blue-600">Trámites</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg font-medium">
              Panel centralizado para el seguimiento de reclamaciones y reembolsos médicos.
            </p>
          </div>
        </div>
      </div>

      {/* 📄 THE POWER ENGINE (Realtime Dashboard) */}
      <div className="relative pb-20">
        <PowerDashboard />
      </div>
    </main>
  );
}
