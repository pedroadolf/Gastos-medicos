import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Copilot } from "@/components/layout/Copilot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-medical-cyan/30 text-slate-900 dark:text-slate-200 overflow-hidden">
            {/* 🆕 Modular Premium Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen md:pl-64 transition-all duration-300">
                {/* Modern Backdrop Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-medical-cyan/5 via-transparent to-transparent pointer-events-none z-0"></div>

                {/* Glass Header */}
                <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all">
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block">
                            <h1 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                                GMM Operation Surface
                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800/50">
                                  v2.0
                                </span>
                            </h1>
                            <div className="text-[10px] text-slate-500 font-medium tracking-tight items-center flex gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                NEURAL LINK ACTIVE // CLOUD PROD
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <NotificationCenter />
                    </div>
                </header>

                {/* Responsive Content Surface */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:p-10 relative z-10 pb-24 md:pb-10 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
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
