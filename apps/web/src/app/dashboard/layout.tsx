import { ShieldCheck, LayoutDashboard, Users, HeartPulse, Settings, FileText, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-fintech-navy flex">
            {/* Sidebar */}
            <aside className="w-64 bg-fintech-navy-light border-r border-slate-800/80 flex flex-col hidden md:flex shrink-0 relative z-20">
                <div className="p-6 border-b border-slate-800/80">
                    <Link href="/dashboard" className="flex items-center space-x-3 group">
                        <ShieldCheck className="w-8 h-8 text-fintech-emerald transition-transform group-hover:scale-110" />
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PASH</h2>
                            <span className="text-[10px] text-fintech-cyan font-bold uppercase tracking-widest">Automation</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2 px-3">Principal</p>
                    <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2.5 bg-fintech-emerald/10 text-fintech-emerald rounded-lg font-medium border border-fintech-emerald/20">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Centro de Control</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium">
                        <FileText className="w-5 h-5" />
                        <span>Expedientes</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium">
                        <HeartPulse className="w-5 h-5" />
                        <span>Siniestros</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium">
                        <Users className="w-5 h-5" />
                        <span>Asegurados</span>
                    </Link>

                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-3">Configuración</p>
                    <Link href="#" className="flex items-center space-x-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors font-medium">
                        <Settings className="w-5 h-5" />
                        <span>Parámetros</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800/80">
                    <div className="flex items-center space-x-3 px-3 py-3 bg-slate-800/30 rounded-lg border border-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fintech-emerald to-fintech-cyan flex items-center justify-center text-fintech-navy font-bold text-sm">
                            UX
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Usuario Demo</p>
                            <p className="text-xs text-slate-400 truncate">demo@pash.uno</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-5 z-0"></div>

                {/* Top Header */}
                <header className="h-16 border-b border-slate-800/80 bg-fintech-navy/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-lg font-semibold text-white">Procesamiento GMM</h1>
                        <div className="h-5 w-px bg-slate-700"></div>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">Entorno Seguro</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fintech-emerald rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
