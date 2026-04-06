# 🦾 GMM: SISTEMA AUTÓNOMO DE PROCESAMIENTO
## Visión de Inteligencia Sistémica v1.0

Este documento detalla la evolución técnica de la plataforma hacia una **arquitectura de agentes autónomos**, transitando desde la simple corrección de errores hacia un ecosistema resiliente capaz de auto-repararse y rediseñarse independientemente.

---

## 🧠 🎯 FILOSOFÍA DEL PROYECTO
El software ya no es una herramienta estática; es un ecosistema donde agentes especializados —como el **Auditor** o el **Master Orchestrator**— colaboran para:
1.  **Validar Datos**: Asegurar integridad total (Audit Engine).
2.  **Gestionar Archivos**: Producción de entregables dinámicos (PDF/ZIP Engine).
3.  **Garantizar Despliegues**: Eliminación de errores humanos mediante automatización.

---

## 🏗️ 📂 COMPONENTES DEL ECOSISTEMA

### 1. 📄 PDF Engine (El Generador)
Transforma la *Inferencia de Datos* (desde Supabase) en documentos oficiales de las aseguradoras.
*   **Enfoque**: Plantilla base + Mapeo dinámico + Flattening de formularios.

### 2. 🕵️ Auditor Inteligente (El Validador)
Actúa como la conciencia del sistema. Identifica inconsistencias antes del envío.
*   **Métricas**: Score de calidad (0-100), reglas de negocio (CLABE, Montos, Folios).

### 3. 🤖 AI Fix Engine (La Auto-reparación)
El puente entre la detección y la resolución. 
*   **Autónomo**: Recalcula totales, limpia formatos y regenera expedientes.
*   **Guiado**: Notifica al usuario EXACTAMENTE qué necesita cargar para llegar al 100%.

### 4. 📦 ZIP Engine (El Empaquetador)
Prepara el "Producto Final" listo para entrega.
*   **Estructura**: Documentos Generados, Facturas Originales, Anexos.

---

## 📊 🧭 OBSERVABILIDAD Y RESILIENCIA
Se ha implementado una capa de control visual que permite ver la "vida" del sistema:
*   **Timeline UI**: Visibilidad paso-a-paso del ciclo del trámite.
*   **Tracing ID**: Seguimiento end-to-end desde el Dashboard hasta n8n.
*   **Simulaciones de Caos**: Auditorías forzadas para encontrar puntos de falla en el flujo.

---

## 🚀 🚀 RESUMEN DE HITOS ALCANZADOS
✅ **Transición Backend-Core**: Las operaciones críticas ya no viven en el cliente.
✅ **Sistema Autónomo Integrado**: PDF -> Audit -> AI Fix -> ZIP.
✅ **Ecosistema n8n-READY**: Webhooks enriquecidos con estatus de auditoría y URLs finales.

*“El sistema ahora es capaz de simular escenarios de caos, aprender de sus errores y rediseñarse de forma independiente.”* 🌌
