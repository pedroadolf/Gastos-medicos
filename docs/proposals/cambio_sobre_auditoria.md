# Revisión de la Auditoría GMM — Sugerencias y Correcciones

## ✅ Lo que está bien hecho en la auditoría

El documento está estructurado de forma profesional y la priorización P0/P1/P2/P3 es correcta. El diagnóstico raíz es acertado: identificar que **todo colapsa por la tabla `jobs` faltante** es exactamente el tipo de análisis que ahorra horas de debugging en loops.

---

## 🔴 Correcciones a los críticos

### CRÍTICO-1 — La tabla `jobs` necesita más campos

El SQL propuesto es funcional pero mínimo. Te falta al menos `user_id` para multi-tenancy y un índice en `status` si vas a hacer polling:

```sql
CREATE TABLE IF NOT EXISTS public.jobs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'processing'
                            CHECK (status IN ('processing', 'completed', 'failed')),
  file_count    INTEGER     DEFAULT 0,
  error_message TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para polling por status (el Dashboard lo va a necesitar)
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);

-- Trigger para updated_at automático
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

También considera agregar `job_type TEXT` desde el inicio — si el sistema crece, vas a querer distinguir tipos de procesamiento sin migrar la tabla.

### CRÍTICO-2 — La solución propuesta sigue siendo frágil

La corrección sugerida:
```javascript
jobId: $json.jobId || $execution.id
```
El problema es que `$execution.id` es el ID de la ejecución de n8n, **no el jobId de Supabase**. Si el Dashboard busca ese ID en la tabla `jobs`, no va a encontrar nada. La solución más robusta es propagar el `jobId` desde el WebhookTrigger hacia el contexto de error usando un nodo `Set` al inicio del flujo:

```
WebhookTrigger → Set (guarda jobId en variable) → ... resto del flujo
```

Y en el Error Trigger leer esa variable guardada, no el nodo original.

### CRÍTICO-3 — Falta explicar el mecanismo exacto

La solución de "dos rutas paralelas" es correcta, pero la auditoría no menciona que en n8n esto requiere que el webhook esté en modo `responseMode: lastNode` o `onReceived` con una bifurcación real. Si no se configura bien, n8n puede ejecutar ambas ramas **secuencialmente**, no en paralelo. Hay que dejar documentado que la rama del agente debe configurarse como ejecución asíncrona usando un nodo `Execute Workflow` con la opción "Run without waiting".

---

## 🟠 Adiciones importantes que faltan en la auditoría

### ⚠️ No se audita el contrato del callback

La auditoría asume que `/api/gmm-callback` existe y funciona, pero nunca lo verifica. Antes de aplicar cualquier corrección, deberías confirmar:

- ¿Ese endpoint valida el header `x-callback-secret`?
- ¿Qué pasa si llega un `jobId` que no existe en `jobs`? ¿Falla silenciosamente?
- ¿Hay algún rate limiting que pueda bloquear callbacks de n8n en ráfaga?

### ⚠️ No hay estrategia de reintentos

Si n8n llama el callback y el Dashboard está caído momentáneamente, el job queda en `processing` para siempre. La auditoría menciona el problema en WARN-3 pero no propone una solución de fondo. Considera agregar a n8n un nodo de reintento con backoff exponencial, o una cola simple con `pg_cron` en Supabase que marque como `failed` los jobs con más de N minutos en `processing`.

### ⚠️ El secreto del callback está hardcodeado en el documento

```
x-callback-secret: gmm_secure_callback_2026_x1y2z3
```

Este secreto aparece **en texto plano** en el reporte de auditoría. Si este documento se comparte o versiona en git, ya está comprometido. Rótalos inmediatamente y guárdalos solo en variables de entorno.

---

## 🟡 Mejoras a los warnings

**WARN-4 (systemMessage del agente)** — La auditoría lo trata como menor pero no lo es. Sin system prompt, Claude en modo agente tiende a ser excesivamente verboso en sus razonamientos internos, lo que incrementa tokens y latencia. Para un agente que procesa PDFs fiscales, el system prompt debería definir explícitamente el formato de output esperado y los límites de lo que puede decidir autónomamente vs. escalar.

**WARN-7 (nodos muertos)** — `AuditorFiscal Tool`, `ValidadorMedico Tool` y `ResumenGenerador Tool` sin schema de input no son solo "código muerto": en n8n, un tool sin schema puede hacer que el agente intente usarlos de todas formas y falle de forma opaca. Recomendaría **eliminarlos** del workflow en lugar de solo desconectarlos, hasta que estén listos para usar.

---

## 📋 Ajuste al plan de priorización

Un cambio que haría al orden del plan:

| Cambio | Razón |
|:---|:---|
| Subir WARN-1 a P0 junto con los críticos | Si `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE` no está activo, aunque corrijas CRÍTICO-1 y CRÍTICO-2, el agente igualmente no ejecutará sus tools. El sistema aparecerá "funcionando" pero producirá resultados vacíos. |
| Agregar verificación del callback como P0.5 | Antes de conectar el Error Handler al callback, confirmar que el endpoint funciona correctamente. |

---

## 🏁 Conclusión

La auditoría es sólida y el diagnóstico raíz es correcto. Las correcciones P0 deberían aplicarse exactamente en este orden:

1. Crear tabla `jobs` (con los campos adicionales sugeridos)
2. Verificar `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`
3. Corregir propagación del `jobId` al contexto de error (con el Set node, no con `$execution.id`)
4. Separar el webhook en dos ramas con ejecución asíncrona real

Con eso, el sistema debería levantar y podrás observar el comportamiento real antes de atacar los P1 y P2.