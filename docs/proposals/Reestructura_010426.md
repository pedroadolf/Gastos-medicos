¡Hola! Como tu **Ingeniero de Prompts Senior**, he analizado tu solicitud y el documento técnico de la reestructura del sistema GMM.


Para un agente de IA (como el que estás configurando en n8n con Claude), el formato Markdown es superior al texto plano o tablas de Word por tres razones clave:
1. **Jerarquía Clara:** Los encabezados (`#`, `##`) ayudan al modelo a entender la estructura lógica del proyecto.
2. **Delimitación de Datos:** Las tablas y bloques de código en Markdown permiten que la IA extraiga variables (como URLs de Supabase o IDs de procesos) con muchísima más precisión.
3. **Eficiencia de Tokens:** Markdown es ligero y estructurado, lo que optimiza el consumo de contexto que precisamente quieres reducir.

---

### Documento Reestructurado: Sistema GMM (v2.0)

```markdown
# REESTRUCTURA TÉCNICA GMM
**Sistema de Gastos Médicos Mayores**
*Dashboard | n8n | Supabase Storage | Claude AI*

---

## 1. Resumen Ejecutivo
Este documento define la reestructura técnica para resolver tres problemas críticos:
1. **Contexto excedido:** 2.2M tokens superan el límite de Claude.
2. **Payload bloqueado:** Archivos de 6MB en Base64 bloqueados por el proxy Traefik (límite 1MB).
3. **Falta de clasificación:** Procesamiento innecesario de anexos con IA.

**Solución:** Implementación de zonas de carga duales, almacenamiento en Supabase Storage y flujo n8n bifurcado.

---

## 2. Diagnóstico de Problemas Actuales

| # | Problema | Causa Raíz | Impacto |
| :--- | :--- | :--- | :--- |
| 1 | Contexto excedido | Conversión de todos los PDFs a Base64. | El request es rechazado por Claude. |
| 2 | Payload bloqueado | Límite de Traefik (1MB) vs archivos Base64 (6MB). | Descarte silencioso del request antes de llegar a n8n. |
| 3 | Procesamiento ineficiente | No hay distinción entre anexos y facturas. | Costo alto, lentitud y errores de contexto. |

---

## 3. Clasificación y Procesamiento de Documentos

### GRUPO A: Anexos Generales
*   **Documentos:** INE, Estados de cuenta, Comprobantes, Recetas, Informes.
*   **Flujo:** Subida a Supabase -> Descarga directa al ZIP en n8n.
*   **IA:** **No pasa por Claude.**
*   **Costo:** $0 tokens.

### GRUPO B: Facturas y Honorarios
*   **Documentos:** Facturas médicas, honorarios, medicamentos.
*   **Flujo:** Subida a Supabase -> Análisis OCR con Claude -> Llenado de formato 4_SRGMM.
*   **IA:** **Procesado por Claude.**
*   **Costo:** ~50K tokens.

---

## 4. Nuevo Flujo de Trabajo (Workflow)

1.  **Dashboard:** El usuario sube archivos en dos zonas independientes (A y B).
2.  **Storage:** Los archivos se suben a `gmm-uploads` en Supabase; se generan **URLs firmadas** (24h).
3.  **n8n Webhook:** Recibe un JSON liviano (~2KB) con metadatos y URLs. **No se envía Base64.**
4.  **Agente IA:** Claude recibe las URLs. Ejecuta `ToolPDFProcessor` solo para el Grupo B.
5.  **Generación:** Se consultan datos en Google Sheets vía `siniestroId`.
6.  **Cierre:** `ToolZIPEmail` descarga los anexos del Grupo A, los junta con los PDFs generados y envía el correo.

---

## 5. Especificaciones de Implementación

### Cambios en Frontend (React)
```javascript
// Nuevo estado para zonas divididas
const [anexosFiles, setAnexosFiles] = useState([]);
const [facturasFiles, setFacturasFiles] = useState([]);

// Ejemplo de componente de carga
<FileUploadZone 
  label="Facturas y Honorarios" 
  onFilesChange={setFacturasFiles} 
  accept="application/pdf" 
/>
```

### Configuración de Supabase (RLS)
```sql
-- Política para subida de archivos
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gmm-uploads');
```

---

## 6. Variables de Entorno Críticas
*   `NEXT_PUBLIC_SUPABASE_URL`: Endpoint de Supabase.
*   `N8N_WEBHOOK_URL`: Endpoint de producción en n8n.
*   `GMM_CALLBACK_SECRET`: Token de seguridad para comunicación entre sistemas.

---

**Estado del Documento:** Confidencial | **Versión:** 2.0 (Abril 2026)
```

---

### Traducción al Español (Spanish Translation)

He convertido tu documento técnico al formato **Markdown**. Este formato es ideal para tu proyecto porque permite que el agente de IA entienda mejor la jerarquía de la información, gestione las tablas de problemas de forma eficiente y consuma menos "tokens", resolviendo uno de los problemas principales que mencionaste (el límite de 2.2M de tokens). He incluido secciones claras para el diagnóstico, la clasificación de archivos y los cambios necesarios en el código JavaScript.

