import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si no hay token, withAuth ya redirige al login
    if (!token) return;

    const userRole = (token as any)?.role || "asegurado";

    // 1. Protección de rutas de Administrador
    const adminRoutes = ["/agentes", "/observabilidad", "/auditoria", "/logs"];
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Protección de rutas de Operador
    const operatorRoutes = ["/gestion"];
    const isOperatorRoute = operatorRoutes.some(route => path.startsWith(route));

    if (isOperatorRoute && userRole !== "operator" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Definimos qué rutas deben pasar por el middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/siniestros/:path*",
    "/asegurados/:path*",
    "/documentos/:path*",
    "/agentes/:path*",
    "/observabilidad/:path*",
    "/auditoria/:path*",
    "/logs/:path*",
    "/configuracion/:path*",
    "/gestion/:path*",
  ],
};
