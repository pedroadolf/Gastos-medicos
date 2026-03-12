import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excluir estos binarios y liberías antiguas del bundler de Webpack/Turbopack
  serverExternalPackages: ["pdf-parse", "tesseract.js"],
  output: "standalone",
  typescript: {
    // !! ADVERTENCIA !!
    // Peligrosamente permite que los builds de producción se completen con éxito
    // incluso si tu proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Advertencia: esto permite que los builds de producción se completen con éxito
    // incluso si tu proyecto tiene errores de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
