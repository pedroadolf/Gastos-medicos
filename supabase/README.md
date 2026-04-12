# 🏦 GMM - Supabase CLI Governance (Pro Setup)

Esta base de datos sigue el flujo de **Infraestructura como Código (IaC)**. No dependas del editor SQL del navegador; utiliza el CLI para mantener la paridad entre tu código y Dokploy.

## 🏗️ Flujo de Trabajo (Git-Based)

1.  **Migraciones**: Ubicadas en `supabase/migrations/`. Aquí vive el esquema oficial.
2.  **Seeding**: Ubicado en `supabase/seed.sql`. Aquí viven los datos de prueba E2E.
3.  **Config**: `supabase/config.toml` define la identidad de tu proyecto en Dokploy.

---

## 🚀 Comandos de Despliegue (Tu Terminal Local)

Para sincronizar tu repositorio con Dokploy, ejecuta estos comandos desde la raíz del proyecto en tu máquina local:

### 1. Enlazar con Dokploy (Una sola vez)
Sustituye la URL por la de tu base de datos de Dokploy:
```bash
supabase link --project-ref default --db-url "postgresql://postgres:TU_PASSWORD@supabase.pash.uno:5432/postgres"
```

### 2. Sincronizar Cambios (Push)
Esto aplicará todas las migraciones pendientes en `supabase/migrations/`:
```bash
supabase db push
```

### 3. Inyectar Datos de Prueba (Seed)
Para ejecutar el **Paso 1** de nuestras pruebas E2E:
```bash
# Método 1: Vía SQL Editor (Copia el contenido de supabase/seed.sql)
# Método 2: Vía CLI (Si lo tienes conectado)
supabase db execute --file supabase/seed.sql
```

---

## 🧪 Pruebas E2E de Resiliencia
Una vez que el **Seeding** esté listo (Paso 1), puedes disparar la batería de pruebas desde este chat ejecutando:
`./scripts/test_e2e_resilience.sh`

---

> [!IMPORTANT]
> **Adios al "Erase"**: Al usar este flujo, aunque el editor de Supabase "borre" los tabs, tu base de datos y tu código siempre estarán sincronizados. **Tu repositorio es la Fuente de Verdad.**
