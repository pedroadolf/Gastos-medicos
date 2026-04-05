import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  Zap, 
  Activity, 
  FolderOpen, 
  Terminal,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SidebarLink } from "@/components/layout/SidebarLink";
import { Copilot } from "@/components/layout/Copilot";

// Removed local SidebarLink as we now use the imported client component version


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    const userName = session?.user?.name || "Juan Diego";
    const userEmail = session?.user?.email || "jd.gmm@pash.ai";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "JD";

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-medical-cyan/30 text-slate-200 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0 relative z-30 transition-all duration-300">
                <div className="p-8 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center space-x-3 group animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-medical-cyan/10 p-2 rounded-xl group-hover:bg-medical-cyan/20 transition-all border border-medical-cyan/20">
                            <ShieldCheck className="w-8 h-8 text-medical-cyan transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter leading-none">GMM<span className="text-medical-cyan mx-0.5">OS</span></h2>
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 block">v2.0 Enterprise</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 mt-2 px-3 opacity-50 italic">Core Systems</p>
                    
                    <SidebarLink href="/dashboard" icon={<LayoutDashboard />} label="Centro de Control" />
                    <SidebarLink href="/siniestros" icon={<FileText />} label="Mis Trámites" />
                    <SidebarLink href="/asegurados" icon={<Users />} label="Asegurados" />
                    <SidebarLink href="/documentos" icon={<FolderOpen />} label="Documentos" />

                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 mt-8 px-3 opacity-50 italic">AI Engineering</p>
                    
                    <SidebarLink href="/agentes" icon={<Zap />} label="Agentes & Workflows" />
                    <SidebarLink href="/observabilidad" icon={<Activity />} label="Observabilidad" />
                    <SidebarLink href="/auditoria" icon={<ShieldCheck />} label="Auditoría & Fix" />

                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 mt-8 px-3 opacity-50 italic">Preferences</p>

                    <SidebarLink href="/configuracion" icon={<Settings />} label="Configuración" />
                </nav>

                <div className="p-6 border-t border-white/5 relative bg-slate-900/50">
                    <div className="flex items-center space-x-3 px-4 py-4 bg-slate-950/40 rounded-2xl border border-white/5 hover:bg-slate-950 transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-cyan to-blue-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-xl shadow-medical-cyan/20 border border-white/10 group-hover:scale-105 transition-transform">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-medical-cyan transition-colors">{userName}</p>
                            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen">
                {/* Modern Backdrop Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-medical-cyan/5 via-transparent to-transparent pointer-events-none z-0"></div>

                {/* Glass Header */}
                <header className="h-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden flex items-center space-x-3">
                            <div className="bg-medical-cyan/10 p-1.5 rounded-lg border border-medical-cyan/20">
                                <ShieldCheck className="w-6 h-6 text-medical-cyan" />
                            </div>
                        </div>
                        
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black text-slate-200 tracking-tighter uppercase italic">GMM Operation Surface</h1>
                            <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em] items-center flex gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-medical-cyan animate-pulse"></span>
                                NEURAL LINK ACTIVE // CLOUD PROD
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <NotificationCenter />
                    </div>
                </header>

                {/* Responsive Content Surface */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:p-10 relative z-10 pb-24 md:pb-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {children}
                    </div>
                </main>
                
                <Copilot />

                <MobileBottomNav className="md:hidden fixed bottom-0 left-0 right-0 z-50" />
            </div>
        </div>
    );
}
