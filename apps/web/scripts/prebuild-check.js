/**
 * Script de validación pre-build
 * Detiene el proceso si no detecta las variables de entorno necesarias.
 */

const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

console.log("🔍 Iniciando validación de variables de entorno (Prebuild)...");

const missing = [];
const placeholders = [];

requiredEnvs.forEach(key => {
  const val = process.env[key];
  if (!val) {
    missing.push(key);
  } else if (val.includes("missing") || val === "undefined") {
    placeholders.push(key);
  }
});

if (missing.length > 0 || placeholders.length > 0) {
  console.error("\n❌ ERROR DE CONFIGURACIÓN DETECTADO");
  
  if (missing.length > 0) {
    console.error("- Faltan estas variables:", missing.join(", "));
  }
  
  if (placeholders.length > 0) {
    console.error("- Estas variables tienen valores inválidos (placeholders):", placeholders.join(", "));
  }
  
  console.error("\n👉 CONSEJO: Revisa los 'Build Arguments' en Dokploy.");
  console.error("👉 Next.js necesita estas variables EN TIEMPO DE COMPILACIÓN para ser inyectadas en el bundle.");
  
  process.exit(1); // Rompe el build
}

console.log("✅ Validación exitosa. Procediendo con el build...\n");
process.exit(0);
