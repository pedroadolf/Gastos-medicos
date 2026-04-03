
# 🚀 GASTOS-MEDICOS-AUTOMATION - PLAN MAESTRO UNIFICADO

## 🎯 OBJETIVO PRINCIPAL
App/plataforma para automatizar solicitudes de Gastos Médicos Mayores (GMM) en México. El sistema permite: gestión de asegurados/siniestros, captura de documentos (manual/automática), extracción de datos (OCR/XML), llenado automático de formatos PDF, y generación/entrega de expedientes listos para envío.

## 🏗️ ARQUITECTURA DE ALTO NIVEL
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Base de Datos**: Google Sheets (5 pestañas) como fuente de verdad inicial, escalable a PostgreSQL en VPS
- **Almacenamiento**: Google Drive (organizado por asegurado/siniestro)
- **Procesamiento de Documentos**: OCR (Tesseract.js) + Parsing de XML (CFDI) + Extracción de texto de PDFs (pdf-parse)
- **Generación de PDFs**: pdf-lib (para formularios) + docxtemplater (para cartas tipo Marsh)
- **Automatización de Flujos (Workflows)**: n8n (self-hosted) para tareas como: monitoreo de email/WhatsApp, generación de ZIPs, envío de notificaciones.
- **Despliegue (Hosting)**: Dokploy (PaaS self-hosted) en VPS (ej. https://pash.uno)
- **Extras**: Remotion para animaciones del logo en UI/correos

## 📚 MODELO DE DATOS (GOOGLE SHEETS - 5 PESTAÑAS)

### Pestaña 1: `Contratantes`
| ID_Contratante | Nombre_RazonSocial | RFC | Domicilio | Email | Telefono | Estatus |
|----------------|---------------------|-----|-----------|-------|----------|---------|

### Pestaña 2: `Polizas`
| ID_Poliza | ID_Contratante | Numero_Poliza | Aseguradora | Fecha_Inicio | Fecha_Fin | Plan | Suma_Asegurada | Deducible |
|-----------|----------------|---------------|-------------|--------------|-----------|------|----------------|-----------|

### Pestaña 3: `Asegurados`
| ID_Asegurado | ID_Poliza | Tipo | Nombre | ApellidoP | ApellidoM | FechaNac | RFC | Certificado | Parentesco | Genero | Docs_Personales (JSON) |
|--------------|-----------|------|--------|-----------|-----------|----------|-----|-------------|------------|--------|------------------------|

### Pestaña 4: `Siniestros`
| ID_Siniestro | ID_Asegurado | Numero_Siniestro | Tipo_Evento | Fecha_Inicio_Sintomas | Fecha_Atencion | Diagnostico | Estado | Fecha_Creacion | ID_ZIP_Generado |
|--------------|--------------|-------------------|-------------|----------------------|----------------|-------------|--------|----------------|-----------------|

### Pestaña 5: `Detalles_Siniestros` (Facturas/Estudios)
| ID_Detalle | ID_Siniestro | Tipo_Doc | Numero_Factura | Monto | UUID (de XML) | Fecha_Factura | Proveedor | Resultados_Estudios | Archivo_Path |
|------------|--------------|----------|----------------|-------|---------------|---------------|-----------|---------------------|--------------|

## 📁 ESTRUCTURA DE DOCUMENTOS EN GOOGLE DRIVE

```
/sgmm-automation/
├── plantillas_fijas/              # Respaldos (no se usan directamente en producción)
│   └── v1/                        # Versiones de respaldo
├── documentos_personales/          # Categoría C: Documentos estáticos del asegurado
│   └── ASE001_CLAUDIA/
│       ├── INE_frente.jpg (expira: nunca)
│       ├── INE_reverso.jpg
│       ├── comprobante_domicilio_mar2024.pdf (expira: 2024-06-30)
│       └── estado_cuenta_bbva.pdf
└── siniestros/                     # Categoría B: Documentos de cada evento
│    └── SIN001_INFECCION_RESPIRATORIA/
│        ├── facturas/
│        │   ├── factura_hospital_001.pdf
│        │   ├── factura_hospital_001.xml
│        │   └── ocr_log_fact001.json   # Log del proceso de extracción
│        ├── estudios/
│        │   ├── rayos_x_torax.pdf
│        │   └── interpretacion_rayos_x.txt
│        ├── recetas/
│        │   └── receta_medica_001.jpg
│        ├── informes_medicos/
│        │   └── informe_ingreso.pdf
│        └── logs/
│            └── procesamiento_20241006.log
```

## 🔄 FLUJO COMPLETO DEL SISTEMA

### Diagrama de Flujo Unificado
```
INICIO
  ↓
[Usuario] Login (Google OAuth)
  ↓
[UI] Selecciona Asegurado de la lista (desde Sheets)
  ↓
[UI] Selecciona Siniestro existente o crea uno nuevo
  ↓
[UI] Carga de Documentos Base (automática desde Drive) → Confirmación de vigencia
  ↓
¿Subida de documentos del evento?
  ├──➤ [MANUAL] Drag-and-drop en UI (con preview y categorización)
  └──➤ [AUTOMÁTICO] n8n detecta nuevo email en siniestros@tudominio.com o mensaje de WhatsApp
           → Descarga adjuntos y los guarda en la carpeta del siniestro en Drive
  ↓
[SISTEMA] Procesa cada documento subido:
  ├──➤ Si es XML (CFDI): Extrae monto, RFC, UUID, proveedor (xml2js)
  ├──➤ Si es imagen/PDF escaneado: Aplica OCR (Tesseract.js + post-procesamiento regex)
  └──➤ Si es PDF con texto: Extrae texto con pdf-parse (para informes, recetas)
  ↓
[UI] Muestra preview de datos extraídos al usuario para confirmación/edición
  ↓
[SISTEMA] Toma las plantillas correspondientes (pdf-lib para formularios, docxtemplater para carta Marsh)
  ↓
[SISTEMA] Llena los PDFs mapeando los datos (de Sheets + OCR/XML) a los campos de los formularios
  ↓
[SISTEMA] (Opcional) Aplica firma digital (node-forge o e.firma local)
  ↓
[SISTEMA] Dispara workflow en n8n:
  ├──➤ n8n empaqueta todos los archivos (PDFs llenos + documentos originales) en un ZIP
  ├──➤ n8n envía un email a la dirección registrada con el ZIP adjunto
  │      (HTML del email incluye logo animado generado con Remotion)
  └──➤ n8n actualiza la pestaña `Siniestros` con el ID del ZIP y cambia el estado a "Completado"
  ↓
[UI] Muestra confirmación al usuario y enlace de descarga directa del ZIP
  ↓
FIN
```

## 🎯 MAPEO DE CAMPOS (Ejemplo SRGMM)
*Lista parcial de los campos mapeados para el PDF más importante. La lista completa se usará para configurar el llenado automático.*

| Campo Técnico (Field Name) | Etiqueta Visual (Label) | Fuente de Datos (Origen) |
| :--- | :--- | :--- |
| `txtApellidoPaternoTitular` | Apellido paterno (titular) | `Asegurados.ApellidoP` |
| `txtNombresTitular` | Nombre(s) (titular) | `Asegurados.Nombre` |
| `txtRFCTitular` | Registro Federal de Contribuyentes (RFC) | `Asegurados.RFC` |
| `txtPoliza` | Póliza | `Polizas.Numero_Poliza` |
| `txtNumeroSiniestroSubsecuente` | ¿Cuál es el número de siniestro? | `Siniestros.Numero_Siniestro` |
| `txtFechaInicioSintomas` | Fecha de inicio de síntomas | `Siniestros.Fecha_Inicio_Sintomas` |
| `txtDescripcion` | Descripción de síntomas/accidente | `Siniestros.Diagnostico` |
| `txtImporte` | Importe (en tabla de facturas) | `Detalles_Siniestros.Monto` (sumado) |
| `txtTotalReclamado` | Total reclamado $ | Suma de `Detalles_Siniestros.Monto` |
| `txtCLABE` | CLABE | `Documentos_Personales` o input manual |

## 🛠️ MEJORAS TÉCNICAS Y DECISIONES CLAVE

- **Dokploy para Deploy**: Se instalará en el VPS (`pash.uno`). Gestiona contenedores, SSL, dominios. Comando: `curl -sSL https://dokploy.com/install.sh | sh`.
- **n8n para Automatización**: Se alojará en el mismo VPS (vía Docker). Manejará los workflows de:
    - **Email Entrante**: Nodo IMAP para leer `siniestros@tudominio.com` y procesar adjuntos.
    - **WhatsApp Entrante**: Webhook para recibir imágenes/PDFs.
    - **Workflow de Salida**: Tomar archivos, crear ZIP, enviar email con SendGrid, actualizar Sheets.
- **Remotion para Branding**: Se usará para crear una animación sutil del logo (ej. fade-in, rotación). El componente React se integrará en la pantalla de carga del dashboard y se exportará como GIF/MP4 para incluirlo en los correos electrónicos.
- **Procesamiento de Documentos**:
    - **Prioridad al XML**: Si se sube un XML, se parsea con `xml2js` para obtener datos 100% precisos.
    - **OCR con Tesseract.js**: Configurar con español y post-procesamiento con regex para números de factura, montos (buscar "$", "total", "importe").
    - **Text PDFs**: Usar `pdf-parse` para extraer texto de informes médicos y alimentar el campo `Resultados_Estudios`.
- **Seguridad y Logs**:
    - Usar variables de entorno para todas las claves API.
    - Encriptar datos sensibles en las celdas de Sheets si es necesario.
    - n8n y la app generarán logs detallados en la carpeta `logs/` de cada siniestro para auditoría.

## ✅ CHECKLIST DE IMPLEMENTACIÓN (PASO A PASO)

### Fase 0: Preparación del Entorno
- [ ] Contratar/Preparar VPS (ej. DigitalOcean, AWS Lightsail) con dominio apuntando a `pash.uno`.
- [ ] Instalar Dokploy en el VPS.
- [ ] Crear cuenta de Google Cloud Platform, habilitar APIs de Sheets y Drive, generar credenciales.
- [ ] Crear cuenta de SendGrid (o similar) para envío de correos.
- [ ] (Opcional) Configurar número de WhatsApp Business API o cuenta de Twilio.

### Fase 1: Configuración de Datos y Almacenamiento
- [ ] Crear el archivo de Google Sheets con las 5 pestañas y los encabezados definidos.
- [ ] Poblar con datos de prueba (al menos 1 contratante, 1 póliza, 2 asegurados, 1 siniestro).
- [ ] Crear la estructura de carpetas en Google Drive (`sgmm-automation/`) con las subcarpetas base.
- [ ] Compartir el Sheet y las carpetas de Drive con el "usuario" de la cuenta de servicio de Google.

### Fase 2: Desarrollo de la App Principal (Next.js)
- [ ] Inicializar proyecto Next.js 15 con TypeScript, Tailwind.
- [ ] Instalar dependencias clave: `googleapis`, `next-auth`, `pdf-lib`, `docxtemplater`, `pizzip`, `tesseract.js`, `xml2js`, `pdf-parse`, `jszip`, `archiver`, `@sendgrid/mail`, `node-forge`, `remotion`.
- [ ] Implementar autenticación con Google (next-auth).
- [ ] Crear UI para seleccionar Asegurado (dropdown desde API `/api/afectados`).
- [ ] Crear UI para seleccionar/crear Siniestro.
- [ ] Crear UI para drag-and-drop de documentos (react-dropzone) con preview.
- [ ] Construir APIs:
    - `POST /api/documentos`: Recibe archivo, lo guarda temporalmente, llama a OCR/XML parser, guarda en Drive y registra en `Detalles_Siniestros`.
    - `GET /api/siniestros/[id]`: Obtiene todos los detalles de un siniestro (incluyendo docs).
    - `POST /api/generar`: Orquesta el llenado de PDFs, llama a n8n y devuelve estado.
- [ ] Integrar componente de logo animado con Remotion.

### Fase 3: Configuración de Automatización (n8n)
- [ ] Instalar n8n en el VPS (Docker).
- [ ] Configurar workflows:
    - **Workflow A (Entrada - Email)**: Nodo IMAP para revisar bandeja. Por cada correo con asunto que incluya el `ID_Siniestro`, descargar adjuntos, y llamar a una API de Next.js (`/api/ingesta`) para que los procese.
    - **Workflow B (Entrada - WhatsApp)**: Endpoint webhook público. Recibir mensaje, identificar `ID_Siniestro` del texto, descargar media, llamar a `POST /api/documentos`.
    - **Workflow C (Salida - ZIP y Email)**: Workflow que recibe un webhook de la app con los paths de los archivos. Usa nodos para crear ZIP (o llama a un script), lo guarda, envía email con SendGrid (incluyendo GIF animado de Remotion), y actualiza Sheets.

### Fase 4: Integración y Pruebas
- [ ] Conectar Next.js con n8n: Desde `POST /api/generar`, hacer un `fetch` al webhook del Workflow C de n8n.
- [ ] Probar flujo completo de un siniestro "Nuevo" con documentos subidos manualmente.
- [ ] Probar flujo de ingesta automática por email/WhatsApp.
- [ ] Probar la generación de ZIP y envío de correo.
- [ ] Probar la actualización de Sheets.

### Fase 5: Despliegue Final
- [ ] Configurar variables de entorno en Dokploy.
- [ ] Hacer deploy de la app Next.js desde el repositorio Git a través de Dokploy.
- [ ] Asegurar que n8n esté corriendo y accesible.
- [ ] Configurar dominio y SSL.
- [ ] Monitoreo inicial.

## 🚀 COMANDO ÚNICO PARA ANTIGRAVITY

```markdown
Crea una plataforma integral de automatización de solicitudes de Gastos Médicos Mayores (GMM) con Next.js 15, Google Sheets/Drive como backend, y n8n para workflows. La app permite gestionar contratantes, pólizas, asegurados y siniestros. Los documentos se suben manualmente (UI drag-drop) o automáticamente (n8n lee email/WhatsApp). Usa OCR (Tesseract.js) y parsing de XML para extraer datos de facturas. Genera PDFs automáticamente (pdf-lib, docxtemplater) llenando los campos de plantillas oficiales (SRGMM, Marsh, etc.) con los datos de Sheets y OCR. Dispara un workflow en n8n para empaquetar todo en ZIP, enviar por email (con logo animado de Remotion) y actualizar Sheets. El despliegue es con Dokploy en un VPS (pash.uno). Incluye modelo de datos completo en Sheets (5 pestañas) y estructura de carpetas en Drive.
```