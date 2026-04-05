"use client";

import { signIn, useSession } from "next-auth/react";
import { ArrowRight, ShieldCheck, Mail, FileText, Zap } from "lucide-react";
import dynamic from "next/dynamic";

const AnimatedLogoLoader = dynamic(
  () => import("@/components/AnimatedLogoLoader"),
  { ssr: false }
);

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-fintech-navy flex items-center justify-center">
        <AnimatedLogoLoader />
      </div>
    );
  }

  // Si ya tiene sesión, mostrar panel inicial
  if (session) {
    return (
      <div className="min-h-screen bg-fintech-navy text-slate-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fintech-emerald/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="text-center relative z-10 p-10 bg-fintech-navy-light/80 border border-slate-800 shadow-2xl rounded-2xl backdrop-blur-md">
          <ShieldCheck className="w-16 h-16 text-fintech-emerald mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-bold mb-2">Bienvenido, {session.user?.name}</h1>
          <p className="text-fintech-cyan mb-8 font-medium">{session.user?.email}</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-3 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all font-bold shadow-lg shadow-white/10 flex items-center mx-auto space-x-2"
          >
            <span>Ir al Centro de Operaciones</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-fintech-navy relative overflow-hidden flex flex-col">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-10"></div>
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-fintech-emerald/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-fintech-cyan/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full border-b border-transparent">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Copy & Value Proposition */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-fintech-navy-light border border-fintech-emerald/30 px-3 py-1.5 rounded-full mb-2">
              <ShieldCheck className="w-4 h-4 text-fintech-emerald" />
              <span className="text-xs font-semibold text-fintech-emerald tracking-wide uppercase">Plataforma Institucional Segura</span>
            </div>

            <div className="relative w-full max-w-sm ml-[-30px]">
              <AnimatedLogoLoader />
            </div>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-light">
              El motor inteligente y seguro para automatizar flujos de pólizas, extraer datos de facturas mediante inteligencia artificial y procesar expedientes en minutos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-slate-800/60 w-full max-w-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-fintech-navy-light rounded-lg border border-slate-700/50">
                  <FileText className="w-5 h-5 text-fintech-cyan" />
                </div>
                <span className="text-sm text-slate-300 font-medium">Extracción OCR y XML</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-fintech-navy-light rounded-lg border border-slate-700/50">
                  <Zap className="w-5 h-5 text-fintech-emerald" />
                </div>
                <span className="text-sm text-slate-300 font-medium">Auto-llenado de PDFs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="relative lg:ml-auto w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-fintech-cyan to-fintech-emerald rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-[#0d1630] border border-slate-800 p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Acceso a la Plataforma</h2>
                <p className="text-sm text-slate-400">Autentícate de forma segura con tu cuenta G-Suite / Workspace autorizada.</p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => signIn('google')}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-slate-100 text-slate-900 px-6 py-4 rounded-xl transition-all focus:ring-4 focus:ring-fintech-emerald/30 font-semibold shadow-lg group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-center text-slate-500 max-w-xs mx-auto mt-4 leading-relaxed">
                  Al iniciar sesión, confirmas que tienes autorización explícita para acceder y procesar PII (Personal Identifiable Information) de asegurados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="py-6 border-t border-slate-800/50 relative z-10 w-full bg-fintech-navy/50 backdrop-blur-md text-center shrink-0">
        <p className="text-xs text-slate-500 tracking-wide uppercase font-semibold">
          Confidencial &bull; Acceso Restringido &bull; PASH Automation v2.0
        </p>
      </div>
    </main>
  );
}
