import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Topbar } from "@/components/layout/Topbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Copilot } from "@/components/layout/Copilot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    
    return (
        <div className="min-h-screen bg-gmm-black flex font-plus-jakarta selection:bg-gmm-yellow/30 text-slate-100 overflow-hidden">
            {/* 🆕 Modular SRE Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen md:pl-20 transition-all duration-300">
                {/* Modern SRE Backdrop Pattern */}
                <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-10"></div>
                <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-gmm-yellow/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* SaaS Topbar SRE-Grade */}
                <Topbar />

                {/* Responsive Content Surface */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 relative z-10 pb-24 md:pb-8 custom-scrollbar bg-transparent">
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
