# Walkthrough: Sistema de Manejo de Errores Proactivo GMM

Hemos implementado un sistema centralizado de monitoreo y alertas para estabilizar la tubería de n8n de Gastos Médicos.

## 🏗️ Arquitectura del Error Handler

El workflow `GMM-Error-Handler-Proactive` (ID: `BqCVGVZqSbmaJMfq`) actúa como el receptor global de fallos:

1.  **Error Trigger**: Captura cualquier error en los workflows vinculados.
2.  **Format Data**: Normaliza los datos del error (`workflow_name`, `execution_id`, `error_message`, `execution_url`).
3.  **If Critical**: Lógica de decisión que escala fallos del Orquestador a Gmail, mientras envía alertas de Slack para todos los errores.
4.  **Slack Alert**: Notificación inmediata a Slack (vía API v2.4+).
5.  **Gmail Alert**: Alerta crítica por correo (vía OAuth2 v2.1+).

## 🔗 Integración en Cascada

Se ha configurado la propiedad `errorWorkflow` en todos los flujos críticos de GMM para heredar este manejador:

*   **SGMM-Main-Orchestrator-Modularizado** (Orquestador principal)
*   **GMM-PDF-Processor** (Procesamiento de facturas)
*   **GMM-Data-Register** (Registro en Google Sheets)
*   **GMM-Package-ZIP-Email** (Generación de ZIP y envío)
*   **GMM-Monitor** (Flujo de supervisión)

## 🛡️ Resiliencia y Autocuración (Self-healing)

Para minimizar el impacto de fallos transitorios y optimizar el rendimiento, hemos implementado:

1.  **Políticas de Reintento (`Retry on Fail`)**: Configurado en todos los nodos de Drive y Gmail (3 reintentos, 5 min intervalo). Esto absorbe "glitches" de red o API sin generar alertas falsas.
2.  **Orquestación No Bloqueante**: El nodo de ejecución de sub-workflow en el Orquestador ahora está en modo `No Esperar`, permitiendo que el flujo continúe sin detenerse por errores en el envío de correos o generación de ZIPs paralelos.

## 📁 Dead Letter Office (DLO)

Se ha creado una pestaña dedicada en la `DB_GMM` para respaldar cualquier siniestro que falle tras los reintentos automáticos.

- **Pestaña:** `DB_GMM_LOG_ERRORES`
- **Evidencia Visual:**
![Pestaña DLO creada](/Users/pash/.gemini/antigravity/brain/d01c7426-f12d-41d5-951b-895de39c3069/db_gmm_log_errores_tab_final_1774580223087.png)

## ✅ Resultado Final

*   **Estabilidad**: El sistema es ahora robusto contra fallos de API.
*   **Trazabilidad**: Todo error queda registrado con su JSON crudo para re-procesamiento manual si fuera necesario.
*   **Velocidad**: La orquestación es más fluida al no ser síncrona en pasos de salida.

---
**Entrega completa por Antigravity v3.0**
