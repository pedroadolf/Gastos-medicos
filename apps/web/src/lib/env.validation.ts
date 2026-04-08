/**
 * GMM Environment Validation
 * Previene que la aplicación se ejecute/compile con placeholders o variables faltantes.
 */

const REQUIRED_PUBLIC_ENVS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
}

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const key of REQUIRED_PUBLIC_ENVS) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
      continue;
    }

    // Detectar placeholders comunes de build o inyecciones fallidas
    if (
      value.includes("missing") || 
      value.includes("PLACEHOLDER") || 
      value === "undefined" ||
      value === "null"
    ) {
      invalid.push(key);
    }
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/**
 * Lanza un error fatal si la validación falla.
 * Útil para Next.js build y scripts de prebuild.
 */
export function ensureValidEnvironment() {
  const result = validateEnvironment();
  
  if (!result.isValid) {
    const errorMsg = [
      "🚨 FALLO CRÍTICO EN VARIABLES DE ENTORNO",
      result.missing.length > 0 ? `Faltantes: ${result.missing.join(", ")}` : null,
      result.invalid.length > 0 ? `Inválidas (Placeholders detectados): ${result.invalid.join(", ")}` : null,
      "👉 Asegúrate de configurar estas variables en Dokploy (Environment Y Build arguments).",
    ].filter(Boolean).join("\n");

    console.error(errorMsg);
    throw new Error("EnvValidationFailed");
  }

  console.log("✅ Configuración de entorno validada correctamente.");
}

// Ejecución automática si es llamado desde un script directamente
if (require.main === module) {
  try {
    ensureValidEnvironment();
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}
