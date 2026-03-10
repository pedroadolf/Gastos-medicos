import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excluir estos binarios y liberías antiguas del bundler de Webpack/Turbopack
  serverExternalPackages: ["pdf-parse", "tesseract.js"],
  output: "standalone",
};

export default nextConfig;
