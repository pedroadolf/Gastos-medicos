import { ShieldCheck, LayoutDashboard, Users, HeartPulse, Settings, FileText, Bell, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name || "Invitado";
    const userEmail = session?.user?.email || "sin-sesion@gmm-pro.com";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-medical-cyan/30 text-slate-200">
            {/* Desktop Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0 relative z-30 transition-all duration-300">
                <div className="p-8 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center space-x-3 group animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-medical-cyan/10 p-2 rounded-xl group-hover:bg-medical-cyan/20 transition-all">
                            <ShieldCheck className="w-8 h-8 text-medical-cyan transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">GMM PRO</h2>
                            <span className="text-[10px] text-medical-cyan font-bold uppercase tracking-widest mt-1 block">Panel Médico</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 mt-2 px-3">Gestión</p>
                    
                    <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-medical-cyan/10 text-medical-cyan rounded-xl font-semibold border border-medical-cyan/20 transition-all hover:bg-medical-cyan/15 group">
                        <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Centro de Control</span>
                    </Link>
                    
                    <Link href="/tramites" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium group">
                        <FileText className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Mis Trámites</span>
                    </Link>

                    <Link href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium group">
                        <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Asegurados</span>
                    </Link>

                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 mt-8 px-3">Herramientas</p>
                    
                    <Link href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium group">
                        <HeartPulse className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Directorio Médico</span>
                    </Link>
                    
                    <Link href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium group">
                        <Settings className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Configuración</span>
                    </Link>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center space-x-3 px-4 py-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-cyan to-blue-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-lg shadow-medical-cyan/20">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userName}</p>
                            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen">
                {/* Modern Backdrop Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-medical-cyan/5 via-transparent to-transparent pointer-events-none z-0"></div>

                {/* Glass Header */}
                <header className="h-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all">
                    <div className="flex items-center space-x-4">
                        {/* Mobile Logo/Menu Toggle Placeholder */}
                        <div className="md:hidden flex items-center space-x-3">
                            <div className="bg-medical-cyan/10 p-1.5 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-medical-cyan" />
                            </div>
                        </div>
                        
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-white tracking-tight">GMM Dashboard</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide items-center flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Sistema en Línea v2.0
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-5">
                        <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full border border-white/10 transition-all text-sm font-medium">
                            <Plus className="w-4 h-4" />
                            <span>Solicitud</span>
                        </button>
                        
                        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                        
                        <NotificationCenter />
                    </div>
                </header>

                {/* Responsive Content Surface */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:p-10 relative z-10 pb-24 md:pb-10">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 delay-150">
                        {children}
                    </div>
                </main>

                {/* Strategy A: Reemplazo condicional */}
                <MobileBottomNav className="md:hidden fixed bottom-0 left-0 right-0" />
            </div>
        </div>
    );
}

