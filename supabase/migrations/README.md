# Migraciones Supabase — GMM

Cada archivo SQL es una migración versionada. Se ejecutan en orden cronológico.

## Migraciones

| Archivo | Descripción | Fecha |
|---------|-------------|-------|
| `20260219_initial_schema.sql` | Schema inicial: tablas `customers`, `documents`, `jobs`, `processing_sessions` | 2026-02-19 |
| `20260219_storage_buckets.sql` | Configuración de buckets de almacenamiento (`gmm-uploads`, políticas RLS) | 2026-02-19 |
| `20260403_jobs_table.sql` | Extensión de tabla `jobs` con campos de tracking de auditoría | 2026-04-03 |

## ⚠️ Cómo Crear una Nueva Migración

1. Crea archivo con formato: `YYYYMMDD_descripcion.sql`
2. Escribe el SQL (preferiblemente idempotente con `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`)
3. Commit a git **antes** de ejecutar
4. Ejecuta en Supabase

## Cómo Aplicar Migraciones

### Desde Supabase UI (recomendado)

1. Ve a **SQL Editor**
2. New Query
3. Copia el contenido del archivo `.sql`
4. Click **Run**

### Vía psql (local)

```bash
psql -h [HOST] -U [USER] -d [DATABASE] < 20260219_initial_schema.sql
psql -h [HOST] -U [USER] -d [DATABASE] < 20260219_storage_buckets.sql
psql -h [HOST] -U [USER] -d [DATABASE] < 20260403_jobs_table.sql
```

## Historial

```bash
git log --oneline -- supabase/migrations/
```
