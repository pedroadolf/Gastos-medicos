# 🔍 Reporte de Auditoría: Conexión Dashboard <-> n8n (GMM)

He realizado una auditoría exhaustiva de los nodos involucrados en la arquitectura de Gastos Médicos (GMM). A continuación se detallan los hallazgos técnicos, errores detectados y sugerencias de solución. **No se realizó ningún cambio en el código ni en los flujos conforme a su instrucción.**

---

## 1. Auditoría n8n (Workflows & Webhooks)

| Workflow | ID | Webhook Path | Estado | Rol |
| :--- | :--- | :--- | :--- | :--- |
| **GMM-Agent-v2-Autonomous-Gemini** | `eLPePdBS1utfjed0` | `/gmm-new-request-prod` | ✅ Activo | Orquestador Actual |
| **GMM-Monitor-Auditado** | `Y0Ed5qmai3sDSbyi` | `/gmm-monitor-manual-v2` | ✅ Activo | Monitoreo |

### 🔴 Error 1: Fallo de n8n por falta de Respuesta Inmediata
El orquestador principal (`eLPePdBS1utfjed0`) **no tiene un nodo `Respond to Webhook`**. 
- **Error:** n8n mantiene la conexión abierta hasta que el Agente AI termina de procesar (puede tardar más de 30 segundos).
- **Consecuencia:** El Dashboard tiene un **timeout interno de 10 segundos**. El dashboard corta la conexión y reporta error al usuario, aunque n8n sigue trabajando en segundo plano.

---

## 2. Auditoría Dashboard (Frontend & Env)

### 🔴 Error 2: Script de Prueba Obsoleto (`test_webhook.js`)
El archivo de diagnóstico `frontend/test_webhook.js` está apuntando a una ruta inexistente:
`path: '/webhook/sgmm-new-request-modular'`
- **Error:** Esa ruta **no existe** en su configuración actual de n8n.
- **Resultado:** Cualquier desarrollador o agente que use este script verá un **404 Not Found**, lo que causa confusión y diagnósticos erróneos. Debe ser `/webhook/gmm-new-request-prod`.

### 🟠 Riesgo 1: Implementación de HTTP Manual
En `frontend/src/app/api/generar/route.ts`, se usa el módulo nativo `https` de Node.js en lugar de `fetch`.
- **Problema:** Al enviar payloads grandes (múltiples PDFs en Base64), esta implementación manual puede fallar silenciosamente si el buffer de red se llena o si el servidor cierra la conexión por tamaño.

---

## 3. Infraestructura (Docker / Proxy)

### 🟠 Riesgo 2: Límite de Tamaño de Body
El Dashboard envía un JSON que contiene PDFs base64. Si se seleccionan 2 o 3 plantillas y se adjuntan archivos manuales, el peso supera fácilmente los 5MB-10MB.
- **Sugerencia:** Verificar que el proxy (Traefik/Nginx) en su Dokploy tenga configurado el `client_max_body_size` en al menos **50MB**. Es muy probable que el proxy esté descartando la petición por "Request Entity Too Large".

---

## 💡 Sugerencias para Solucionar (Sin Cambios Realizados)

1. **n8n:** Insertar un nodo **`Respond to Webhook`** justo después del Webhook en `GMM-Agent-v2-Autonomous-Gemini`. Esto liberará al Dashboard en <1s.
2. **Dashboard:** Actualizar la variable `N8N_WEBHOOK_URL` en `.env.local` y corregir el path en `test_webhook.js`.
3. **Frontend:** Migrar la lógica de disparo en `route.ts` a `fetch` nativo para mejor manejo de errores de red y payloads grandes.
4. **Proxy:** Confirmar límites de subida en la configuración de Dokploy para evitar bloqueos por tamaño de archivo.

---
**Auditoría Finalizada.** Quedo a la espera de sus instrucciones para proceder con cualquiera de estos arreglos.
