import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    // Inyectar Correlation ID en la petición
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lógica de respuesta
    let response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Si no hay token, withAuth ya redirige al login
    if (!token && !path.startsWith('/api/health') && !path.startsWith('/api/metrics')) {
      // Dejar que withAuth maneje la redirección si es necesario
    } else if (token) {
      const userRole = (token as any)?.role || "asegurado";
      
      // 1. Protección de rutas de Administrador
      const adminRoutes = ["/agentes", "/observabilidad", "/auditoria", "/logs"];
      const isAdminRoute = adminRoutes.some(route => path.startsWith(route));

      if (isAdminRoute && userRole !== "admin") {
        response = NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        // 2. Protección de rutas de Operador
        const operatorRoutes = ["/gestion"];
        const isOperatorRoute = operatorRoutes.some(route => path.startsWith(route));

        if (isOperatorRoute && userRole !== "operator" && userRole !== "admin") {
          response = NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // Añadir headers de observabilidad a la respuesta
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-response-time", `${Date.now() - startTime}ms`);

    return response;
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
