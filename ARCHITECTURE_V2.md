# 🚀 GMM Autonomous Platform - Architecture v2.0

Esta documentación detalla la evolución del sistema de tramitación de Gastos Médicos Mayores (GMM) hacia una plataforma SaaS completamente autónoma y de grado de producción.

## 🧠 Visión General
El sistema ha transicionado de una herramienta de llenado de formularios a un **Ecosistema de Agentes Autónomos** que colaboran para validar, corregir, generar y entregar expedientes médicos sin intervención humana constante.

---

## 🏗️ Componentes Core (V2.0)

### 1. 📊 Power Dashboard (SaaS UI)
Ubicación: `apps/web/src/components/tramite/PowerDashboard.tsx`
- **Realtime Monitoring**: Conexión nativa con Supabase Realtime para actualizaciones instantáneas de estatus y scores.
- **Dual View**: Soporte para vista de **Grid** (análisis detallado) y **Kanban** (flujo operativo).
- **Search Engine**: Motor de búsqueda reactivo por ID, Paciente o RFC.
- **Visual Score**: Indicadores dinámicos de calidad del expediente (0-100%).

### 2. 📑 Dynamic PDF Engine (v2.0)
Ubicación: `apps/web/src/services/pdfEngine.ts`
- **Zero-Code Mapping**: Se eliminó la lógica "hardcoded". Ahora los campos se mapean desde la tabla `pdf_field_mappings` en la base de datos.
- **Transformations**: Motor de reglas integrado (uppercase, date splitting, currency formatting, conditional checkboxes).
- **Multi-Template**: Soporta SRGMM, Carta Remesa y Programaciones de forma concurrente.

### 3. 🤖 AI-Fix Service (v1.1)
Ubicación: `apps/web/src/services/aiFixService.ts`
- **Autonomous Audit**: El auditor no solo detecta errores, sino que los resuelve (ej. recalculando montos de facturas).
- **Observability (Timeline)**: Cada acción de la IA se registra en `tramite_history` para alimentar la línea de tiempo del usuario.
- **Reputation Injection**: Ajusta el score de auditoría tras corregir hallazgos.

### 4. 📦 ZIP Orchestrator (v1.1)
Ubicación: `apps/web/src/services/zipEngine.ts`
- **Intelligent Routing**: Organiza automáticamente los archivos en carpetas estandarizadas para las aseguradoras (`Documentacion_Oficial`, `Facturas`, `Anexos`).
- **n8n Handshake**: Dispara un webhook final a n8n para iniciar el proceso de envío de email y notificación al bróker.

---

## 🗄️ Estructura de Base de Datos
Se implementaron nuevas tablas para soportar el dinamismo:
- `pdf_templates`: Registro de plantillas activas.
- `pdf_field_mappings`: El "cerebro" de la generación de documentos.
- `tramite_history`: Registro de eventos para la UI de Timeline.

---

## 🔗 Ciclo de Vida Autónomo
1. **Trigger**: El usuario sube documentos o completa un formulario.
2. **Audit**: `AiFixService` analiza el expediente y genera un Score.
3. **Correction**: Si hay errores de monto o formato, el sistema los corrige automáticamente.
4. **Generation**: `PdfEngine` genera los PDFs oficiales usando los mappings de la DB.
5. **Orchestration**: `ZipEngine` empaqueta todo y notifica a **n8n**.
6. **Delivery**: n8n entrega el expediente por correo y actualiza el estatus final en el Dashboard.

---

**Versión:** 2.0.0-PROD  
**Fecha:** Abril 2026  
**Status:** Autonomous Engine Validated ✅
