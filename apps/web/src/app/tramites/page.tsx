import PowerDashboard from '@/components/tramite/PowerDashboard';
export const dynamic = 'force-dynamic';

/**
 * 📂 MI PANEL DE TRÁMITES (Dashboard Root)
 * Entry point for insurance claim management.
 */
export default function TramitesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-500">
      <div className="mx-auto">
        
        {/* 🏔️ TOP HERO SECTION (Subtle Gradient) */}
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-14">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 p-1 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full w-fit mx-auto md:mx-0 border border-blue-100 dark:border-blue-800/50">
                SaaS Intelligence v2.0
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                Centro de Operaciones <span className="text-blue-600">GMM</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                Monitorea tus trámites con tecnología de agentes autónomos y auditoría de IA en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* 📄 THE POWER ENGINE (Realtime Dashboard) */}
        <div className="relative pb-20">
          <PowerDashboard />
        </div>

      </div>
    </main>
  );
}
