import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Topbar } from "@/components/layout/Topbar";
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

                {/* SaaS Topbar Premium */}
                <Topbar />

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
