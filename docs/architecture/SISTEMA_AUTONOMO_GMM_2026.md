# 🧠 ARQUITECTURA MAESTRA: SISTEMA AUTÓNOMO GMM 2026

Este documento detalla la arquitectura de agentes multi-capa diseñada para el proyecto Gastos Médicos (GMM). Sirve como plano maestro para la creación de sistemas autónomos, resilientes y auto-observables en n8n y Node.js.

---

## 🏗️ 1. CONTRATO UNIVERSAL DE AGENTES (EL PEGAMENTO)

Para que múltiples agentes (n8n, scripts, AI) se comuniquen sin errores, todos DEBEN seguir este esquema JSON estricto:

```json
{
  "jobId": "string (UUID)",
  "agent": "string (nombre-del-agente)",
  "status": "success | error | processing",
  "data": {
    "payload": {},
    "metadata": {}
  },
  "trace": {
    "parent_agent": "string",
    "timestamp": "ISO8601",
    "retry_count": 0
  },
  "errors": []
}
```

**Beneficio:** Elimina el "Mapping Hell" en n8n y permite auditoría automática de flujos.

---

## 🛡️ 2. AUDITOR-AGENT: EL INGENIERO SENIOR VIRTUAL

El Auditor analiza los workflows (JSON de n8n) ANTES de que se rompan en producción.

### 🔍 Puntos de Inspección Críticos:
1.  **Anti-patrón `.first()`**: Prohibido usar `$node["nombre"].json.first()`. Se debe usar `$json` para evitar errores cuando el nodo previo devuelve un array vacío.
2.  **Optional Chaining Obligatorio**: Todas las expresiones deben usar `?.` (ej: `$json.body?.id`).
3.  **Contrato de Entrada**: Validar que `jobId` exista en el primer nodo después del Webhook.
4.  **Error Handling**: Cada nodo crítico (HTTP, DB) debe tener habilitado "On Fail -> Continue" y estar conectado a un Error Handler.

---

## 💣 3. SIMULACIÓN DE CAOS (CHAOS ENGINEERING)

Antes de dar un workflow por "terminado", se somete a una batería de pruebas de estrés:

1.  **Prueba de Nulls**: Enviar un webhook con todos los campos opcionales en `null`.
2.  **Prueba de Esquema Roto**: Enviar `id_siniestro` en lugar de `jobId`.
3.  **Prueba de Latencia**: Simular una caída de Supabase o Google Sheets (timeout de 10s).
4.  **Prueba de Token Expirado**: Forzar un error 401 en la API de autenticación.

---

## 🧠 4. DECISION ENGINE & SELF-HEALING (REPARACIÓN AUTÓNOMA)

El sistema detecta el error y decide la mejor estrategia de recuperación sin intervención humana.

| Error Detectado | Estrategia de Recuperación |
| :--- | :--- |
| **401 Unauthorized** | `refresh_token` -> `retry_action` |
| **400 Bad Request** | `log_error` -> `notify_admin` -> `stop_flow` |
| **500 Server Error** | `exponential_backoff_retry` (3 intentos) |
| **Missing Data** | `fallback_lookup_db` -> `continue_if_found` |

---

## 📊 5. OBSERVABILIDAD Y GRAFO DINÁMICO

No solo son logs; es un organismo vivo que se visualiza en el Dashboard.

*   **Grafo de Calor**: Nodos rojos indican fallas frecuentes; verdes indican salud.
*   **Trace ID**: Un único ID que cruza n8n, Supabase, y el Frontend para ver la historia completa de un siniestro.
*   **Timeline de Incidentes**: Registro de cuándo un agente se autocorrigió (ej. "Auto-repair: Reintentado exitosamente tras error 500").

---

## ✈️ 6. WORKFLOW COPILOT (AI AGENT)

Un agente de IA (OpenAI/Anthropic) que reside en n8n como un nodo "Consultor".

*   **Prompt**: "Analiza este JSON de workflow y dime si cumple con el Contrato Universal y si tiene riesgos de seguridad o performance".
*   **Output**: Sugerencias de código listas para copiar y pegar.

---

## 📂 7. ESTRUCTURA DE ARCHIVOS RECOMENDADA

```text
/project
  ├── .agent/           # Prompts y lógica de agentes
  ├── docs/             # Arquitectura y manuales
  ├── scripts/          # Motores de auditoría y decisión (.js)
  ├── apps/             # Frontend (Dashboard) y Backend
  └── workflows/        # Exports de n8n validados
```

---

> **MEMORIA DEL PROYECTO GMM:** Esta arquitectura fue implementada para resolver la fragilidad de los workflows de seguros médicos, permitiendo procesar siniestros de forma 100% autónoma y segura.
