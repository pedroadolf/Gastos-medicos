'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}

export function SidebarLink({ href, icon, label }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                isActive 
                    ? "bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20 shadow-lg shadow-medical-cyan/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] hover:border-white/5"
            )}
        >
            <div className="flex items-center space-x-3">
                <span className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-medical-cyan" : "group-hover:text-medical-cyan"
                )}>
                    {icon}
                </span>
                <span className={cn(
                    "text-sm tracking-tight",
                    isActive ? "font-bold" : "font-medium"
                )}>{label}</span>
            </div>
            {isActive ? (
                <div className="w-1.5 h-1.5 rounded-full bg-medical-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all text-medical-cyan" />
            )}
        </Link>
    );
}
