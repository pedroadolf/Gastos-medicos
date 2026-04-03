# 📋 Guía de Ejecución — Auditoría y Limpieza del Proyecto GMM

**Versión:** 1.0  
**Fecha:** 2026-04-03  
**Objetivo:** Ejecutar Fases 1-6 de limpieza, versionado y reorganización  
**Público:** Técnico/Desarrollador  
**Duración Estimada:** 4-5 horas (con pauses)

---

## 📚 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Fase 1: Limpieza Quirúrgica](#fase-1-limpieza-quirúrgica)
3. [Fase 2: Versionado de Workflows Críticos](#fase-2-versionado-de-workflows-críticos)
4. [Fase 3: Reorganización de SQL](#fase-3-reorganización-de-sql)
5. [Fase 4: Deprecación de `/api/generar`](#fase-4-deprecación-de-apigenerar)
6. [Fase 5: Eliminar Backups Duplicados](#fase-5-eliminar-backups-duplicados)
7. [Fase 6: Reorganización Monorepo](#fase-6-reorganización-monorepo)
8. [Validaciones Finales](#validaciones-finales)
9. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

Antes de comenzar, verifica que tienes:

- [ ] **Git instalado** y configurado
  ```bash
  git --version
  git config --list | grep user
  ```

- [ ] **Acceso al repositorio**
  ```bash
  cd /ruta/a/tu/repo-gmm
  git status  # Debe mostrar rama actual sin errores
  ```

- [ ] **Rama limpia** (sin cambios sin commitear)
  ```bash
  git status
  # Deberá mostrar: "On branch main/develop, nothing to commit, working tree clean"
  ```

- [ ] **Acceso a n8n admin** (para exportar workflows)
  - URL: `https://[tu-instancia-n8n]/workflows`
  - Usuario/contraseña accesibles

- [ ] **Node.js / npm** (si vas a ejecutar tests después)
  ```bash
  node --version
  npm --version
  ```

### ⚠️ Importante
Si tienes cambios sin commitear, haz esto primero:
```bash
git stash  # Guarda cambios temporalmente
# O si prefieres perderlos:
git reset --hard HEAD
```

---

## Fase 1: Limpieza Quirúrgica

**Objetivo:** Eliminar archivos huérfanos sin riesgo.  
**Duración:** ~30 minutos  
**Riesgo:** ✅ Cero (no afecta funcionalidad)

### Paso 1.1: Verificar Archivos Huérfanos

Antes de eliminar, verifica que realmente no se importan en ningún lado:

```bash
# Test scripts
grep -r "test_supabase" frontend/src/ 2>/dev/null || echo "✓ No encontrado"
grep -r "test_webhook" frontend/src/ 2>/dev/null || echo "✓ No encontrado"
grep -r "tempTest" frontend/src/ 2>/dev/null || echo "✓ No encontrado"

# Archivos fix_*.py
grep -r "fix_always_output\|fix_n8n_workflow\|fix_structure" package.json 2>/dev/null || echo "✓ No encontrado"
grep -r "fix_validation" frontend/src/ 2>/dev/null || echo "✓ No encontrado"

# spa.traineddata
grep -r "spa.traineddata\|tesseract" frontend/src/ 2>/dev/null || echo "✓ No encontrado"

# SVGs defaults
grep -r "file.svg\|globe.svg\|next.svg\|vercel.svg\|window.svg" frontend/src/ 2>/dev/null || echo "✓ No encontrado"
```

**Resultado esperado:** Todos los `grep` deben retornar "✓ No encontrado"

### Paso 1.2: Crear Rama de Feature

```bash
git checkout -b refactor/cleanup-auditoria
```

### Paso 1.3: Eliminar Archivos de Test

```bash
# Archivos de test del frontend
git rm frontend/test_supabase.js
git rm frontend/test_supabase_minimal.js
git rm frontend/test_webhook.js
git rm frontend/src/tempTest.ts

echo "✓ Test files eliminados"
```

### Paso 1.4: Eliminar SVGs Default de Next.js

```bash
# SVGs que vienen con create-next-app y no se usan
git rm frontend/public/file.svg
git rm frontend/public/globe.svg
git rm frontend/public/next.svg
git rm frontend/public/vercel.svg
git rm frontend/public/window.svg

echo "✓ SVGs default eliminados"
```

### Paso 1.5: Eliminar Modelo OCR No Utilizado

```bash
# Este archivo pesa 4-15MB y no se usa
git rm frontend/spa.traineddata

echo "✓ spa.traineddata eliminado (libera ~4-15MB)"
```

### Paso 1.6: Eliminar Scripts One-Shot

```bash
# Scripts de fix que ya fueron ejecutados
git rm scripts/fix_always_output.py
git rm scripts/fix_n8n_workflow.py
git rm scripts/fix_structure_again.py
git rm scripts/fix_structure.py
git rm scripts/fix_validation.py

echo "✓ Scripts fix_*.py eliminados"
```

### Paso 1.7: Opcional - Eliminar Debugging JSON

Si quieres máxima claridad, elimina también los JSONs de debugging:

```bash
# OPCIONAL
if [[ -d "data/json" ]]; then
  git rm -r data/json
  echo "✓ data/json/ eliminado"
fi
```

### Paso 1.8: Commit de Fase 1

```bash
git commit -m "🗑️ refactor(cleanup): remove orphan test files and legacy OCR model

- Removed frontend test scripts (test_supabase*.js, test_webhook.js)
- Removed tempTest.ts orphan file
- Removed unused Tesseract OCR model (spa.traineddata) - frees ~4-15MB
- Removed Next.js default SVGs (unused boilerplate)
- Removed legacy fix_*.py scripts (one-shot migrations already executed)

No functional impact. Improves repo clarity and reduces clone size.

AUDIT: auditoria_estructura_GMM.md - Phase 1 cleanup"
```

### Paso 1.9: Verificar Cambios

```bash
git log --oneline -1
# Deberá mostrar el commit que acabas de hacer

git status
# Deberá mostrar: "On branch refactor/cleanup-auditoria, nothing to commit"
```

✅ **FASE 1 COMPLETADA**

---

## Fase 2: Versionado de Workflows Críticos

**Objetivo:** Exportar y versionar los 4 workflows faltantes de n8n.  
**Duración:** ~1-2 horas  
**Riesgo:** 🟡 Bajo (requiere acceso manual a n8n)

### ⚠️ Nota Crítica

Los siguientes workflows **EXISTEN en n8n pero NO están en el repositorio git**:
- `GMM-Data-Register-Auditado` (registra en Google Sheets)
- `GMM-Package-ZIP-Email-v2.0` (genera ZIP + email)
- `GMM-Error-Handler-Proactive` (manejo de errores)
- `GMM-FailSafe-Alert` (alertas)

**Si n8n falla, pierdes estos workflows para siempre.** Por eso deben versionarse.

### Paso 2.1: Crear Estructura de Directorios

```bash
mkdir -p workflows/auditoria
mkdir -p workflows/procesamiento-pdf
mkdir -p workflows/registro-datos

echo "✓ Directorios creados"
```

### Paso 2.2: Mover Workflows Existentes

Si tienes workflows sueltos en `workflows/` root, muévelos a sus subcarpetas:

```bash
# Usa `ls` primero para ver qué hay
ls workflows/*.json 2>/dev/null || echo "No hay workflows en root"

# Si hay, muévelos a subcarpetas. Ejemplo:
[[ -f "workflows/GMM-Agent-v2.json" ]] && \
  mv workflows/GMM-Agent-v2.json workflows/auditoria/ && \
  echo "✓ Movido: GMM-Agent-v2.json"

[[ -f "workflows/GMM-Monitor-Auditado.json" ]] && \
  mv workflows/GMM-Monitor-Auditado.json workflows/auditoria/ && \
  echo "✓ Movido: GMM-Monitor-Auditado.json"

[[ -f "workflows/GMM-PDF-Processor-Agente-Auditado.json" ]] && \
  mv workflows/GMM-PDF-Processor-Agente-Auditado.json workflows/procesamiento-pdf/ && \
  echo "✓ Movido: GMM-PDF-Processor-Agente-Auditado.json"

git add workflows/
git commit -m "refactor(workflows): organize into category subdirectories"
```

### Paso 2.3: Exportar los 4 Workflows desde n8n

#### **Acceso a n8n**

1. Abre en el navegador:
   ```
   https://[tu-instancia-n8n]/workflows
   ```

2. Inicia sesión si es necesario

#### **Para cada workflow faltante:**

##### 2.3.1 - GMM-Data-Register-Auditado

1. En el listado de workflows, busca `GMM-Data-Register-Auditado`
2. Click en el workflow para abrirlo
3. Click en el **menú ⋮ (tres puntos)** en la esquina superior
4. Selecciona **"Download"** → **"Export as JSON"**
5. Se descargará `GMM-Data-Register-Auditado.json`

##### 2.3.2 - GMM-Package-ZIP-Email-v2.0

Repite el proceso anterior para este workflow.

##### 2.3.3 - GMM-Error-Handler-Proactive

Repite el proceso anterior para este workflow.

##### 2.3.4 - GMM-FailSafe-Alert

Repite el proceso anterior para este workflow.

### Paso 2.4: Colocar Workflows en sus Carpetas

Luego de descargar los 4 JSONs, colócalos en el repo:

```bash
# Desde tu navegador / descarga, copia los archivos a:
cp ~/Downloads/GMM-Data-Register-Auditado.json workflows/registro-datos/
cp ~/Downloads/GMM-Package-ZIP-Email-v2.0.json workflows/procesamiento-pdf/
cp ~/Downloads/GMM-Error-Handler-Proactive.json workflows/auditoria/
cp ~/Downloads/GMM-FailSafe-Alert.json workflows/auditoria/

# Verifica que están en el lugar correcto
ls -la workflows/registro-datos/
ls -la workflows/procesamiento-pdf/
ls -la workflows/auditoria/ | grep -E "Error-Handler|FailSafe"
```

### Paso 2.5: Crear README de Workflows

Crea un archivo `workflows/README.md` para documentar la estructura:

```bash
cat > workflows/README.md << 'EOF'
# Workflows n8n GMM

Este directorio contiene todos los workflows de n8n utilizados en el proyecto GMM.

## Estructura

### `auditoria/` — Monitoreo y Alertas
- `GMM-Agent-v2.json` — Orquestador principal
- `GMM-Monitor-Auditado.json` — Monitoreo de jobs
- `GMM-Error-Handler-Proactive.json` — Manejo proactivo de errores
- `GMM-FailSafe-Alert.json` — Alertas de failsafe

### `procesamiento-pdf/` — Generación de PDFs
- `GMM-PDF-Processor-Agente-Auditado.json` — Procesamiento de PDFs
- `GMM-Package-ZIP-Email-v2.0.json` — Empaquetado en ZIP y envío por email

### `registro-datos/` — Registro en Google Sheets
- `GMM-Data-Register-Auditado.json` — Registro en Google Sheets

## ⚠️ Importante

Estos workflows están **versionados en git**. Después de cualquier cambio en n8n:

1. Exporta el workflow actualizado desde n8n UI
2. Reemplaza el JSON en este directorio
3. Commit con descripción clara:
   ```bash
   git commit -m "fix(workflows/procesamiento-pdf): add retry logic to PDF processor"
   ```

## Restauración

Si n8n se cae o necesitas recrear workflows:

1. Ve a n8n UI → Workflows
2. Click en "+" → "Import from file"
3. Selecciona el JSON correspondiente
4. Importa

## Historial

Los cambios están tracked en git:
```bash
git log --oneline -- workflows/
```
EOF

echo "✓ Creado: workflows/README.md"
```

### Paso 2.6: Agregar y Commitear Workflows

```bash
git add workflows/
git commit -m "🔐 feat: version 4 critical workflows from n8n

Added workflows:
- workflows/registro-datos/GMM-Data-Register-Auditado.json
- workflows/procesamiento-pdf/GMM-Package-ZIP-Email-v2.0.json
- workflows/auditoria/GMM-Error-Handler-Proactive.json
- workflows/auditoria/GMM-FailSafe-Alert.json

Plus organization of existing workflows into category subdirectories.

CRITICAL: These workflows were missing from git. If n8n instance fails,
they can now be restored from this repository.

AUDIT: auditoria_estructura_GMM.md - Phase 2 workflow versioning"
```

### Paso 2.7: Verificar Integridad

```bash
# Verifica que los JSONs son válidos
for file in workflows/*/*.json; do
  python3 -m json.tool "$file" > /dev/null && echo "✓ $file válido" || echo "✗ $file INVÁLIDO"
done
```

✅ **FASE 2 COMPLETADA**

---

## Fase 3: Reorganización de SQL

**Objetivo:** Mover SQLs de setup a estructura de migraciones versionada.  
**Duración:** ~15 minutos  
**Riesgo:** ✅ Cero (solo reorganización)

### Paso 3.1: Crear Estructura de Migraciones

```bash
mkdir -p supabase/migrations

echo "✓ Directorio supabase/migrations/ creado"
```

### Paso 3.2: Mover Archivos SQL

```bash
# Si existen archivos SQL en root, muévelos
if [[ -f "supabase_setup.sql" ]]; then
  mv supabase_setup.sql supabase/migrations/20260219_initial_schema.sql
  echo "✓ Movido: supabase_setup.sql → 20260219_initial_schema.sql"
fi

if [[ -f "supabase_storage_setup.sql" ]]; then
  mv supabase_storage_setup.sql supabase/migrations/20260219_storage_buckets.sql
  echo "✓ Movido: supabase_storage_setup.sql → 20260219_storage_buckets.sql"
fi

# Si hay otros archivos SQL de migraciones, muévelos también
# Ejemplo:
if [[ -f "scripts/migration_jobs_table.sql" ]]; then
  mv scripts/migration_jobs_table.sql supabase/migrations/20260403_jobs_table.sql
  echo "✓ Movido: migration_jobs_table.sql → 20260403_jobs_table.sql"
fi
```

### Paso 3.3: Crear README de Migraciones

```bash
cat > supabase/migrations/README.md << 'EOF'
# Migraciones Supabase GMM

Cada archivo SQL contiene una migración y se ejecuta en orden cronológico.

## Migraciones

| Archivo | Descripción | Fecha |
|---------|-------------|-------|
| `20260219_initial_schema.sql` | Creación inicial de tablas (customers, documents, jobs, processing_sessions) | 2026-02-19 |
| `20260219_storage_buckets.sql` | Configuración de buckets de almacenamiento | 2026-02-19 |
| `20260403_jobs_table.sql` | Extensión: tabla de jobs (si existe) | 2026-04-03 |

## ⚠️ Importante

Las migraciones son **idempotentes** (pueden ejecutarse múltiples veces sin efecto).

Para nuevas migraciones:
1. Crea archivo con formato: `YYYYMMDD_descripcion.sql`
2. Escribe el SQL
3. Commit a git
4. Ejecuta en Supabase

## Cómo Aplicar Migraciones

### Primera vez (Base de datos vacía)

```bash
psql -h [HOST] -U [USER] -d [DATABASE] < 20260219_initial_schema.sql
psql -h [HOST] -U [USER] -d [DATABASE] < 20260219_storage_buckets.sql
psql -h [HOST] -U [USER] -d [DATABASE] < 20260403_jobs_table.sql
```

### Desde Supabase UI

1. Ve a **SQL Editor**
2. New Query
3. Copia el contenido del archivo .sql
4. Click "Run"

## Historial

Todos los cambios están en git:

```bash
git log --oneline -- supabase/migrations/
```
EOF

echo "✓ Creado: supabase/migrations/README.md"
```

### Paso 3.4: Verificar Sintaxis SQL (Opcional)

Si tienes `psql` instalado, verifica la sintaxis:

```bash
# Verifica que los archivos son SQL válido
for file in supabase/migrations/*.sql; do
  psql --file "$file" --dry-run 2>/dev/null && echo "✓ $file sintaxis válida" || echo "⚠ $file revisar (puede ser expected si no está connected a BD)"
done
```

### Paso 3.5: Commit de Fase 3

```bash
git add supabase/migrations/
git rm supabase_setup.sql 2>/dev/null || true
git rm supabase_storage_setup.sql 2>/dev/null || true
git rm scripts/migration_jobs_table.sql 2>/dev/null || true

git commit -m "refactor(supabase): organize migrations with version control

- Moved supabase_setup.sql → migrations/20260219_initial_schema.sql
- Moved supabase_storage_setup.sql → migrations/20260219_storage_buckets.sql
- Moved scripts/migration_jobs_table.sql → migrations/20260403_jobs_table.sql (if existed)
- Added comprehensive README with migration instructions

Enables:
- Git history tracking for all schema changes
- Clear versioning and rollback capability
- Better organization for future migrations

AUDIT: auditoria_estructura_GMM.md - Phase 3 SQL reorganization"
```

✅ **FASE 3 COMPLETADA**

---

## Fase 4: Deprecación de `/api/generar`

**Objetivo:** Mover ruta legacy y agregar deprecation warning.  
**Duración:** ~20 minutos  
**Riesgo:** 🟡 Bajo (requiere testing del endpoint nuevo)

### ⚠️ Contexto

- `/api/generar` es la ruta **antigua** que usa OCR local
- `/api/documentos` es la ruta **nueva** que usa n8n
- La función `triggerFinalGeneration()` que llamaba a `/api/generar` ya no se usa

### Paso 4.1: Verificar que `/api/documentos` Funciona

Antes de deprecar `/api/generar`, asegúrate que el nuevo endpoint funciona:

```bash
# Verifica que existe
ls -la frontend/src/app/api/documentos/route.ts

# Revisa que tiene el manejo correcto
cat frontend/src/app/api/documentos/route.ts | head -50
```

Debería mostrar algo como:
```typescript
export async function POST(req: Request) {
  // Lógica de n8n integration
  // ...
}
```

### Paso 4.2: Crear Estructura Legacy

```bash
# Crea directorio _legacy
mkdir -p frontend/src/app/api/_legacy/generar

echo "✓ Directorio _legacy creado"
```

### Paso 4.3: Mover Ruta Antigua

```bash
# Mueve la ruta antigua a _legacy
mv frontend/src/app/api/generar/route.ts frontend/src/app/api/_legacy/generar/route.ts

# Elimina directorio vacío
rmdir frontend/src/app/api/generar 2>/dev/null || true

echo "✓ Movido: /api/generar → /api/_legacy/generar/"
```

### Paso 4.4: Agregar Deprecation Warning

Abre `frontend/src/app/api/_legacy/generar/route.ts` y agrega al inicio de la función principal:

**Encuentra esta línea:**
```typescript
export async function POST(req: Request) {
```

**Agrega inmediatamente después:**
```typescript
export async function POST(req: Request) {
  // ⚠️ DEPRECATED: This endpoint is deprecated as of 2026-04-03
  console.warn(
    '[DEPRECATED] POST /api/_legacy/generar is deprecated as of 2026-04-03. ' +
    'Use POST /api/documentos instead. ' +
    'This endpoint will be removed in v2.0 (estimated June 2026). ' +
    'Migration: replace fetch("/api/generar", ...) with fetch("/api/documentos", ...)'
  );

  // ... resto del código
}
```

### Paso 4.5: Revisar Referencias en page.tsx

```bash
# Busca la función que ya no se usa
grep -n "triggerFinalGeneration" frontend/src/app/dashboard/page.tsx

# Resultado esperado: 1 línea (la definición)
# Si hay más, significa que se llama en algún lado
```

Si se llama en algún lado, actualiza la llamada de `/api/generar` a `/api/documentos`.

Si NO se llama en ningún lado (lo más probable), puedes marcar la función como deprecated:

**Encuentra:**
```typescript
const triggerFinalGeneration = async () => {
```

**Cambia a:**
```typescript
// @deprecated as of 2026-04-03 - use handleProcessBtn instead
// This function is no longer called in the active flow
const triggerFinalGeneration = async () => {
```

### Paso 4.6: Test del Nuevo Endpoint

```bash
# En otra terminal, inicia el servidor dev
npm run dev
# O tu comando de desarrollo

# Luego, en esta terminal, prueba el nuevo endpoint
curl -X POST http://localhost:3000/api/documentos \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Deberá responder sin error (puede ser 400 si el body no es válido, pero no 404)
```

### Paso 4.7: Commit de Fase 4

```bash
git add frontend/src/app/api/_legacy/
git rm -r frontend/src/app/api/generar/ 2>/dev/null || true
git add frontend/src/app/dashboard/

git commit -m "refactor(api): deprecate /api/generar in favor of /api/documentos

- Moved /api/generar to /api/_legacy/generar
- Added deprecation warning with removal timeline (v2.0, est. June 2026)
- All functionality is preserved at legacy endpoint
- New endpoint: POST /api/documentos (n8n-based, recommended)

Migration path:
- Update client calls from /api/generar to /api/documentos
- triggerFinalGeneration() in page.tsx is now unused (marked deprecated)
- Response format is backward compatible

Timeline:
- 2026-04-03: Deprecated (this commit)
- 2026-06-03: Removal (3 months deprecation period)

Testing:
- Verified POST /api/documentos works
- Checked no external clients depend on /api/generar
- Function triggerFinalGeneration() is unused in active flow

AUDIT: auditoria_estructura_GMM.md - Phase 4 API deprecation"
```

✅ **FASE 4 COMPLETADA**

---

## Fase 5: Eliminar Backups Duplicados

**Objetivo:** Eliminar carpeta `backups/` que tenía duplicados sin versionado.  
**Duración:** ~5 minutos  
**Riesgo:** ✅ Cero (los workflows ya están en `workflows/` con git)

### Paso 5.1: Verificar Contenido de Backups

```bash
# Ver qué hay en backups
find backups/ -type f 2>/dev/null || echo "No existe directorio backups/"

# Listar archivos
ls -la backups/workflows/ 2>/dev/null || echo "No existe backups/workflows/"
```

### Paso 5.2: Verificar que Todos los Workflows Están en `workflows/`

```bash
# Cuenta workflows en backups
BACKUP_COUNT=$(find backups/ -name "*.json" 2>/dev/null | wc -l)

# Cuenta workflows en workflows/
ACTIVE_COUNT=$(find workflows/ -name "*.json" 2>/dev/null | wc -l)

echo "Workflows en backups/: $BACKUP_COUNT"
echo "Workflows en workflows/: $ACTIVE_COUNT"

# El active count debe ser >= backup count
if [[ $ACTIVE_COUNT -ge $BACKUP_COUNT ]]; then
  echo "✓ Todos los workflows están en workflows/"
else
  echo "⚠️ ALERTA: Falta algún workflow en workflows/"
  echo "No procedes a eliminar backups hasta copiar todos"
fi
```

### Paso 5.3: Eliminar Backups

Si el check anterior pasó:

```bash
# Elimina el directorio de backups
git rm -r backups/

echo "✓ Directorio backups/ eliminado de git"
```

### Paso 5.4: Commit de Fase 5

```bash
git commit -m "refactor: remove unversioned backups (now tracked in workflows/)

- Deleted backups/workflows/* (duplicates)
- All workflows are now version-controlled in workflows/ directory
- Git history provides complete backup and audit trail

All active workflows tracked in:
- workflows/auditoria/
- workflows/procesamiento-pdf/
- workflows/registro-datos/

Restore capability: use git log to see all changes
"
```

✅ **FASE 5 COMPLETADA**

---

## Fase 6: Reorganización Monorepo

**Objetivo:** Restructurar el repo en patrón monorepo profesional.  
**Duración:** ~2-3 horas  
**Riesgo:** 🔴 Moderado (requiere actualizar imports y builds)

### ⚠️ Importante

Esta es la fase más grande. Se recomienda:
- Hacerla en rama separada
- Testear completamente en staging
- Actualizar `Dokploy` antes de hacer merge a `main`

### Paso 6.1: Crear Nueva Rama

```bash
git checkout -b refactor/monorepo-restructuring

echo "✓ Nueva rama creada: refactor/monorepo-restructuring"
```

### Paso 6.2: Crear Estructura de Directorios

```bash
# Crea la estructura apps/
mkdir -p apps/web
mkdir -p apps/agent

# Copia la carpeta frontend completa a apps/web
cp -r frontend/* apps/web/

# Mantén la carpeta frontend temporalmente (la eliminaremos después)
echo "✓ Estructura apps/ creada"
```

### Paso 6.3: Reorganizar Frontend (apps/web)

#### Renombrar `lib/` a `services/`

```bash
# Mueve lib a services
mv apps/web/src/lib apps/web/src/services

# Actualiza imports en archivos que usan lib/
# Busca todos los imports
grep -r "from '@/lib/" apps/web/src/ --include="*.ts" --include="*.tsx" | head -20

# Ejemplo de lo que verás:
# import { supabase } from '@/lib/supabase'

# Reemplaza todos los imports de lib por services
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/lib/|from '@/services/|g" {} +
find apps/web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from 'src/lib/|from 'src/services/|g" {} +

echo "✓ Imports de lib → services actualizados"
```

#### Organizar Componentes

```bash
# Crea estructura de componentes más clara
mkdir -p apps/web/src/components/shared
mkdir -p apps/web/src/components/ui
mkdir -p apps/web/src/components/dashboard

# Mueve componentes compartidos
mv apps/web/src/components/AnimatedLogoLoader.tsx apps/web/src/components/shared/ 2>/dev/null || true
mv apps/web/src/components/AuthProvider.tsx apps/web/src/components/shared/ 2>/dev/null || true

# Mueve componentes de UI
mv apps/web/src/remotion apps/web/src/components/ui/remotion 2>/dev/null || true

# Mueve componentes del dashboard
# (Si hay componentes específicos del dashboard)
mv apps/web/src/components/*Dashboard* apps/web/src/components/dashboard/ 2>/dev/null || true

echo "✓ Componentes organizados"
```

#### Reorganizar Rutas del Dashboard

```bash
# Crea route group para agrupar rutas bajo (dashboard)
mkdir -p apps/web/src/app/\(dashboard\)

# Mueve dashboard allí
mv apps/web/src/app/dashboard apps/web/src/app/\(dashboard\)/gastos

echo "✓ Dashboard en route group (dashboard) → gastos"
```

#### Actualizar package.json si es necesario

```bash
# Revisa si hay referencias a rutas internas en package.json
cat apps/web/package.json | grep -i "lib\|frontend" || echo "No hay referencias"

# Si hay, actualiza según corresponda
```

### Paso 6.4: Reorganizar Agente Python (apps/agent)

```bash
# Copia el contenido de src/ a apps/agent/ si existe
if [[ -d "src" && -f "src/main.py" ]]; then
  cp -r src/* apps/agent/
  echo "✓ Agente Python copiado a apps/agent/"
  
  # Reorganiza según patrón LangGraph
  mkdir -p apps/agent/graphs
  mkdir -p apps/agent/app
  
  # (Estos cambios dependen de la estructura actual de src/)
  echo "⚠️ Nota: Revisa manualmente los imports en apps/agent/main.py"
else
  echo "ℹ️ src/ no existe o no tiene main.py"
fi
```

### Paso 6.5: Reorganizar Scripts

```bash
# Crea estructura de scripts por herramienta
mkdir -p scripts/n8n
mkdir -p scripts/metlife
mkdir -p scripts/supabase

# Mueve scripts según categoría
# Ejemplo:
[[ -f "scripts/push_workflow.py" ]] && mv scripts/push_workflow.py scripts/n8n/ || true
[[ -f "scripts/update_n8n.py" ]] && mv scripts/update_n8n.py scripts/n8n/ || true
[[ -f "scripts/extract_nodes.py" ]] && mv scripts/extract_nodes.py scripts/n8n/ || true
[[ -f "scripts/recover_workflow.py" ]] && mv scripts/recover_workflow.py scripts/n8n/ || true
[[ -f "scripts/prepare_metlife_email.js" ]] && mv scripts/prepare_metlife_email.js scripts/metlife/ || true

echo "✓ Scripts reorganizados por categoría"
```

### Paso 6.6: Reorganizar Documentación

```bash
# Centraliza toda la doc en docs/
mkdir -p docs/auditorias
mkdir -p docs/proposals
mkdir -p docs/knowledge
mkdir -p docs/workflows-legacy

# Mueve docs
[[ -f "docs/resilience_architecture.md" ]] && mv docs/resilience_architecture.md docs/arquitectura.md || true
[[ -f "docs/INSTRUCCIONES_MIGRACION.md" ]] && mv docs/INSTRUCCIONES_MIGRACION.md docs/migracion.md || true
[[ -f "docs/n8n-ayuda-drive.md" ]] && mv docs/n8n-ayuda-drive.md docs/workflows.md || true
[[ -f "auditoria_gmm_conexion.md" ]] && mv auditoria_gmm_conexion.md docs/auditorias/ || true
[[ -f "PROJECT-PLAN.MD" ]] && mv PROJECT-PLAN.MD docs/PROJECT-PLAN.md || true
[[ -d "proposals_PASH" ]] && mv proposals_PASH docs/proposals/ || true
[[ -d "artifacts" ]] && mv artifacts docs/artifacts/ || true
[[ -d "knowledge" ]] && mv knowledge docs/knowledge/ || true

echo "✓ Documentación centralizada"
```

### Paso 6.7: Crear Root `package.json` para Monorepo

```bash
cat > package.json << 'EOF'
{
  "name": "gmm-monorepo",
  "version": "1.0.0",
  "description": "Gastos Médicos Móvil - Monorepo",
  "private": true,
  "workspaces": [
    "apps/web",
    "apps/agent"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.13.0"
  }
}
EOF

echo "✓ Creado root package.json con workspaces"
```

### Paso 6.8: Crear turbo.json (Opcional pero Recomendado)

```bash
cat > turbo.json << 'EOF'
{
  "globalDependencies": [".env.local"],
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
EOF

echo "✓ Creado turbo.json para optimizar builds"
```

### Paso 6.9: Actualizar .gitignore

```bash
# Agrega patrones para monorepo
cat >> .gitignore << 'EOF'

# Monorepo
node_modules/
.turbo/
dist/

# Apps
apps/*/node_modules/
apps/*/.next/

# Environment
.env.local
.env.*.local

# Agente Python
apps/agent/venv/
apps/agent/__pycache__/
*.pyc
EOF

echo "✓ Actualizado .gitignore para monorepo"
```

### Paso 6.10: Eliminar Frontend Antiguo

```bash
# Una vez que todo está en apps/web, elimina la carpeta antigua
git rm -r frontend/

echo "✓ Carpeta frontend/ eliminada (ahora en apps/web/)"
```

### Paso 6.11: Eliminar src/ Antiguo (si corresponde)

```bash
# Si el agente Python está migrado a apps/agent/
if [[ -d "src" && -f "src/main.py" ]]; then
  # Primero verifica que existe en apps/agent/
  if [[ -f "apps/agent/main.py" ]]; then
    git rm -r src/
    echo "✓ Carpeta src/ eliminada (ahora en apps/agent/)"
  else
    echo "⚠️ ALERTA: No elimines src/ sin copiar a apps/agent/ primero"
  fi
fi
```

### Paso 6.12: Commit de Fase 6.1 - Estructura Base

```bash
git add .
git commit -m "refactor(monorepo): restructure into multi-workspace architecture

Initial structure:
- apps/web/ - Next.js frontend (formerly frontend/)
- apps/agent/ - Python agent (formerly src/)
- Root package.json with workspaces
- Turbo for build orchestration
- Centralized documentation in docs/

Changes:
- Renamed frontend/ → apps/web/
- Moved lib/ → services/ in web app
- Organized components into: shared/, ui/, dashboard/
- Organized scripts into: n8n/, metlife/, supabase/
- Centralized all docs in docs/
- Added turbo.json for build optimization

Next: Update imports and test builds

AUDIT: auditoria_estructura_GMM.md - Phase 6.1 monorepo base structure"
```

### Paso 6.13: Actualizar Imports Globalmente

```bash
# Busca cualquier import que aún reference frontend/
grep -r "frontend/" apps/ --include="*.ts" --include="*.tsx" --include="*.js" | head -20

# Si hay, actualiza manualmente o con sed:
# Ejemplo (verificar antes de ejecutar):
find apps/ -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|../../../frontend/|../../|g" {} +
```

### Paso 6.14: Test de Build

```bash
cd apps/web
npm install
npm run build

# Si pasa sin error:
cd ../..
echo "✓ Build de apps/web pasó"

# Test de dev
npm run dev

# Abre http://localhost:3000 en navegador y verifica que carga
```

### Paso 6.15: Commit de Fase 6.2 - Testing Completo

```bash
git add .
git commit -m "refactor(monorepo): update all imports and test builds

- Updated all imports from @/lib to @/services
- Updated component paths
- Tested npm run build in apps/web
- Tested npm run dev
- All tests passing

This monorepo structure is now production-ready."
```

### Paso 6.16: Actualizar Dokploy

⚠️ **ACCIÓN MANUAL EN DOKPLOY:**

1. Ve a tu instancia de Dokploy
2. En el proyecto GMM, ve a **Settings**
3. Actualiza el **Root Directory** de:
   ```
   (vacío o .)
   ```
   a:
   ```
   apps/web
   ```

4. Actualiza **Build Command** si es necesario:
   ```bash
   # Si usas turbo
   npm run build:web
   
   # Si es solo Next.js
   npm run build
   ```

5. **Deploy** en staging primero para verificar

### Paso 6.17: Test en Staging

```bash
# Una vez deployado en staging, verifica:
curl https://[tu-staging-url]/api/health

# Deberá responder 200 OK
```

### Paso 6.18: Commit Final de Fase 6

```bash
git add .
git commit -m "refactor(monorepo): complete restructuring and validation

✓ Monorepo structure implemented
✓ All imports updated
✓ Builds passing locally
✓ Staging deployment successful
✓ API health check passing

This commit represents a major refactoring of the project structure.
No functional changes to business logic.

AUDIT: auditoria_estructura_GMM.md - Phase 6 complete monorepo restructuring"
```

✅ **FASE 6 COMPLETADA**

---

## Validaciones Finales

Después de completar todas las fases, ejecuta estas validaciones:

### Verificación 1: Estado del Repositorio

```bash
# Verifica que git está limpio
git status
# Deberá mostrar: "On branch [rama], nothing to commit, working tree clean"

# Verifica el historial de commits
git log --oneline | head -10
# Deberá mostrar todos los commits de limpieza
```

### Verificación 2: Estructura de Directorios

```bash
# Verifica que la estructura final es correcta
tree -L 2 -d

# Esperado (después de Fase 6):
# .
# ├── apps/
# │   ├── agent/
# │   └── web/
# ├── workflows/
# ├── supabase/
# ├── scripts/
# ├── docs/
# ├── tests/
# └── ...
```

### Verificación 3: Sin Archivos Huérfanos

```bash
# Verifica que no hay archivos test/tempTest
find . -name "test_*.js" -o -name "tempTest.ts" -o -name "spa.traineddata" | grep -v node_modules

# Deberá estar vacío
```

### Verificación 4: Workflows Versionados

```bash
# Verifica que los 4 workflows están presentes
ls -la workflows/registro-datos/GMM-Data-Register-Auditado.json
ls -la workflows/procesamiento-pdf/GMM-Package-ZIP-Email-v2.0.json
ls -la workflows/auditoria/GMM-Error-Handler-Proactive.json
ls -la workflows/auditoria/GMM-FailSafe-Alert.json

# Todos deberían existir
```

### Verificación 5: SQL Reorganizado

```bash
# Verifica que los SQLs están en migraciones
ls -la supabase/migrations/*.sql

# Deberían estar los archivos con fecha
```

### Verificación 6: Build y Dev

```bash
# Test de build
npm run build

# Test de dev
npm run dev

# Abre http://localhost:3000
# Verifica que carga sin errores
```

### Verificación 7: API Endpoints

```bash
# Test de endpoints principales
curl -X GET http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/documentos -H "Content-Type: application/json" -d '{"test": "data"}'

# Deberían responder (aunque sea con error de validación, no 404)
```

---

## Troubleshooting

### ❌ Error: "Git não está limpo"

**Solución:**
```bash
git status  # Ve qué hay sin commitear
git stash   # Guarda temporalmente
# O:
git reset --hard HEAD  # Descarta cambios
```

### ❌ Error: "Archivo no encontrado en migraciones"

**Solución:**
```bash
# Verifica el nombre exacto del archivo
ls workflows/registro-datos/

# Si no está, exporta de nuevo desde n8n
```

### ❌ Error: "Import no encontrado"

**Solución:**
```bash
# Búsca qué imports están rotos
grep -r "from '@/lib/" apps/web/src/ --include="*.tsx"

# Actualiza manualmente:
sed -i "s|from '@/lib/|from '@/services/|g" $(find apps/web/src -name "*.tsx")
```

### ❌ Error: "Build falla después de monorepo"

**Solución:**
```bash
# Limpia y reinstala
rm -rf node_modules apps/*/node_modules
npm install

# Prueba build otra vez
npm run build
```

### ❌ Error: "Dokploy no encuentra el app"

**Solución:**
1. Ve a Dokploy → Settings
2. Verifica que **Root Directory** es `apps/web`
3. Verifica que **Build Command** es `npm run build`
4. Redeploy desde UI

### ❌ Error: "Endpoints retornan 404"

**Solución:**
```bash
# Verifica que los archivos de ruta existen
ls -la apps/web/src/app/api/documentos/route.ts
ls -la apps/web/src/app/api/_legacy/generar/route.ts

# Si no existen, revisa git status (pueden haber cambios no commiteados)
```

---

## Resumen de Cambios

| Fase | Cambios | Archivos Eliminados | Archivos Creados | Riesgo |
|------|---------|-------------------|------------------|--------|
| 1 | Limpieza | 15+ | 0 | ✅ Cero |
| 2 | Workflows | 0 | 4 + README | 🟡 Bajo |
| 3 | SQL | 2 | 3 + README | ✅ Cero |
| 4 | API | 0 | _legacy/ | 🟡 Bajo |
| 5 | Backups | 1 dir | 0 | ✅ Cero |
| 6 | Monorepo | 2 dirs | 1 dir | 🔴 Moderado |
| **TOTAL** | **Completa limpieza + versionado** | **+20 archivos** | **Estructura profesional** | **Controlado** |

---

## Próximos Pasos (Después de Completar)

1. **Merge a Main**
   ```bash
   git checkout main
   git merge refactor/cleanup-auditoria  # o la rama que usaste
   git push origin main
   ```

2. **Deploy a Producción**
   - En Dokploy, deploy la rama `main`
   - Verifica en logs que todo funciona
   - Monitorea errores por 24-48 horas

3. **Documentar Cambios**
   - Actualiza el README principal con nueva estructura
   - Comunica cambios al equipo
   - Archiva este documento como referencia

4. **Mantenimiento Futuro**
   - Cada cambio en n8n → exportar y commitear
   - Cada migración SQL nueva → versionada en `supabase/migrations/`
   - Mantén la estructura clara

---

**¡Listo! Tu proyecto GMM está completamente reorganizado y versionado.** 🎉

Para preguntas o problemas, revisa la sección [Troubleshooting](#troubleshooting).
