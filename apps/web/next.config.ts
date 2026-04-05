import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excluir estos binarios y liberías antiguas del bundler de Webpack/Turbopack
  serverExternalPackages: ["tesseract.js"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  typescript: {
    // !! ADVERTENCIA !!
    // Peligrosamente permite que los builds de producción se completen con éxito
    // incluso si tu proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/expedientes/:path*',
        destination: '/tramites/:path*',
        permanent: true,
      },
      {
        source: '/siniestros/:path*',
        destination: '/tramites/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

