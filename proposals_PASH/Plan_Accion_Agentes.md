# Plan de Implementación de Reestructura GMM (v2.0)

**Análisis de la Propuesta (Reestructura_010426.md):**
Hemos recibido el documento técnico con las modificaciones urgentes a realizar debido a la superación de contexto en Claude y los bloqueos de proxy en Traefik.
La solución consiste en bifurcar el procesamiento de archivos y delegar la persistencia a Supabase Storage, enviando solo URLs por webhooks en lugar de Base64.

Los agentes del equipo ejecutarán simultánea y secuencialmente las siguientes labores:

## Secuencia de Activación y Responsabilidades de los Agentes

Para ejecutar la reestructura de forma ordenada, los agentes intervendrán en la siguiente secuencia:

### #3 Backend/DB (Supabase DBA)
- **Responsabilidad:** Crear el bucket `gmm-uploads` y configurar las políticas de seguridad (RLS) en Supabase para permitir la subida de archivos (Anexos y Facturas).
       ↓
### #2 Frontend Dev (React/Next.js)
- **Responsabilidad:** Modificar `storage.ts`, construir las zonas duales en `page.tsx` para separación de anexos/facturas, y actualizar `route.ts` para gestionar la comunicación basada en Signed URLs en vez de Base64. Opcionalmente integrar pautas de **accessibility** y **seo** en la interfaz.
       ↓
### #4 Workflow Builder (n8n MCP)
- **Responsabilidad:** Arreglar (Fix) de las 4 tools principales del agente n8n y actualizar el System Prompt para procesar mediante HTTP Download las URLs en lugar del payload Base64.
       ↓
### #6 QA (GMM Auditor)
- **Responsabilidad:** Realizar una Prueba Integral de flujo completo testeando con una muestra pequeña: 3 anexos (procesamiento pasivo) + 1 factura (análisis IA).
       ↓
### #10 Dokploy Ops (DevOps)
- **Responsabilidad:** Hacer un Redeploy del Dashboard en el servidor Dokploy y realizar una verificación estricta de las variables de entorno inyectadas (ej. `NEXT_PUBLIC_SUPABASE_URL`, webhooks).
       ↓
### #6 QA (GMM Auditor)
- **Responsabilidad:** Ejecutar una Prueba de Carga sometiendo el sistema a un escenario de alto volumen: procesamiento simultáneo de 15 PDFs reales para garantizar estabilidad.

---
**El equipo procede a ejecutar este plan inmediatamente.**
