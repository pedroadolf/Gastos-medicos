import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Copilot } from "@/components/layout/Copilot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <div className="min-h-screen bg-gmm-bg dark:bg-gray-950 flex font-plus-jakarta selection:bg-gmm-accent/30 transition-colors overflow-hidden">
            {/* Sidebar — hidden on dashboard (dashboard has its own header nav) */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen md:pl-20 transition-all duration-300 overflow-hidden">

                {/* Responsive Content Surface */}
                <main className="flex-1 overflow-y-auto relative z-10 pb-24 md:pb-8 custom-scrollbar bg-transparent">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>

                <Copilot />
                <MobileBottomNav className="md:hidden fixed bottom-0 left-0 right-0 z-50" />
            </div>
        </div>
    );
}
