---
name: 04_workflow_builder_skill
description: "Construye/optimiza workflows n8n para gastos médicos: PDFs → Drive/Sheets/Supabase → ZIP/email"
triggers: ["workflow n8n gastos", "automatiza facturas médicas", "n8n gmm", "procesa siniestros"]
priority: 950
category: "n8n-gmm"
---

# GMM Workflow Builder

Esta habilidad orquesta la creación y optimización de flujos de trabajo en n8n específicamente para el dominio de Gastos Médicos Mayores (GMM).

## Objetivo
Automatizar el ciclo de vida de un siniestro médico: desde la recepción de documentos (PDF/Recetas) hasta el registro en bases de datos y la preparación de paquetes para aseguradoras.

## Roles del Squad involucrados
- **Workflow Specialist (#4):** Diseña la lógica de los nodos.
- **Filesystem (#9):** Gestiona la estructura de carpetas en Google Drive.
- **Backend/DB (#3):** Asegura la integridad de los datos en Supabase y Google Sheets.

## Paso a Paso para la Creación de Workflows

1. **Trigger de Entrada:**
   - Configurar `Google Drive Trigger` (Folder 'siniestros') o `WhatsApp/Email Webhook`.
2. **Procesamiento de Documentos:**
   - Usar nodos de OCR para extraer texto de recetas y estudios.
   - Parsear XML de facturas (CFDI) para obtener montos, RFC y conceptos.
3. **Persistencia de Datos:**
   - Registro inicial en `Google Sheets` para trazabilidad operativa.
   - Inserción/Upsert en `Supabase` para el dashboard de la aplicación.
4. **Empaquetado y Notificación:**
   - Agrupar archivos relacionados en un `.zip`.
   - Enviar correo de confirmación vía `SendGrid` con el paquete adjunto.

## Herramientas MCP Clave
- `n8n-mcp`: Para el descubrimiento y edición en runtime de los workflows.
- `supabase-mcp-server`: Para validación de esquemas y queries.

## Restricciones
- Siempre usar el manejo de errores (Error Triggers) en cada flujo.
- No hardcodear IDs de carpetas o documentos; usar variables de entorno o parámetros dinámicos.
