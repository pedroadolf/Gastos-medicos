# Squad de Auditoría - Proyecto GMM

Este documento define la estructura y responsabilidades del squad encargado de la validación continua de los workflows de Gastos Médicos.

## Estructura del Squad

| Agente | Rol | Responsabilidad | Herramientas Clave |
| :--- | :--- | :--- | :--- |
| **QA (#6)** | **Lead Auditor** | Coordinación de auditorías, pruebas E2E, validación visual en Dashboard. | Playwright, Browser Subagent |
| **Workflow Specialist (#4)** | **Logic Guard** | Validación de lógica n8n, manejo de errores, nombrado de nodos y performance. | n8n-MCP, Validator MCP |
| **Filesystem (#9)** | **Data Auditor** | Verificación de integridad en Drive, Sheets y estructura de archivos ZIP. | Drive/Sheets API, FS tools |
| **Backend (#3)** | **Sync Monitor** | Monitoreo de logs en Supabase y sincronización de estados de tareas. | Supabase MCP |
| **Manager (#1)** | **Quality Control** | Revisión final de best practices y reporte de cumplimiento. | Communication, Artifacts |

## Protocolo de Auditoría (Skill: GMM Auditor)

Cada vez que se active el trigger **"Audita GMM workflows"**, el squad realizará los siguientes pasos:

1. **Chequeo de Infraestructura (Workflow Specialist)**:
   - Verificar que el `webhookId` es `ae284c21-41b5-4c35-8378-85e1422b35de-mod`.
   - Confirmar que los 4 workflows core están activos.
2. **Chequeo de Flujo de Datos (Workflow Specialist & Filesystem)**:
   - Validar la existencia y conexión del nodo `MergeZipData`.
   - Revisar que la sintaxis de Google Sheets en `GMM-Data-Register` sea correcta.
3. **Prueba End-to-End (QA)**:
   - Simular un siniestro (disparo de webhook).
   - Verificar la creación de carpeta en Drive.
   - Verificar el registro en Sheets.
   - Verificar la generación del ZIP.
4. **Verificación de Notificaciones (QA & Backend)**:
   - Confirmar envío de correos vía Gmail.
   - Validar logs de éxito en Supabase (si aplica).

## Configuración MCP Requerida

Para habilitar el validador automático, se recomienda añadir este servidor MCP a la configuración de Antigravity/Claude. He extraído esta configuración de PulseMCP:

```json
{
  "mcpServers": {
    "n8n-workflow-validator": {
      "command": "npx",
      "args": ["-y", "github:lowprofix/n8n-mcp-server"],
      "env": {
        "N8N_API_URL": "https://n8n.pash.uno/api/v1",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    }
  }
}
```
