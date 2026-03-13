# 🏥 Sistema de Gestión de Siniestros GMM — Propuesta Final 2026

> Arquitectura enterprise de agentes IA para aseguradora de Gastos Médicos Mayores.  
> Stack base: **n8n · Dokploy · Google Cloud · FastAPI · PostgreSQL**

---

## 📐 Principio de diseño

El sistema se estructura en **cinco dominios funcionales**, cada uno con sus agentes especializados. Un agente no es solo un script — es un servicio con responsabilidad única, contrato de entrada/salida definido, logs auditables y métricas propias.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PORTAL / API GATEWAY                         │
│              (asegurado · médico · operador · broker)           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  ORQUESTADOR CENTRAL (n8n)                      │
│         gestión de flujos · reglas de negocio · errores         │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
DOMINIO 1  DOMINIO 2  DOMINIO 3  DOMINIO 4  DOMINIO 5
Ingesta    Médico     Decisión   Cliente    Ops & Data
```

---

## 🗂 DOMINIO 1 — Ingesta Documental

> Responsable de recibir, clasificar y extraer información de cualquier documento médico.

### Agente 1.1 — Captura Multicanal
Recibe documentos desde cualquier origen.

**Canales soportados:**
- Portal web del asegurado
- App móvil
- Email (parsing automático de adjuntos)
- WhatsApp Business API
- EDI (intercambio electrónico con hospitales)
- API directa desde proveedores médicos

**Salida:** documento en Cloud Storage + evento en queue para procesamiento

---

### Agente 1.2 — Clasificación Inteligente
Identifica el tipo de documento recibido.

**Tipos soportados:**
| Tipo | Descripción |
|------|-------------|
| `factura_hospital` | Factura de internación o urgencias |
| `factura_consulta` | Honorarios médicos ambulatorios |
| `receta` | Prescripción médica |
| `estudio_lab` | Resultados de laboratorio |
| `imagen_diagnostica` | Rayos X, TAC, resonancia |
| `xml_cfdi` | Comprobante fiscal digital (México) |
| `eob` | Explanation of Benefits |
| `poliza` | Documento de cobertura |
| `id_asegurado` | Identificación del paciente |
| `solicitud_preautorizacion` | Solicitud de autorización previa |

**Tecnología:** Google Document AI + modelo multimodal de visión  
**Precisión objetivo:** > 97%

---

### Agente 1.3 — OCR Médico Estructurado
Extrae campos estructurados de cada documento.

**Campos extraídos:**
```json
{
  "patient": {
    "name": "Juan Pérez",
    "policy_number": "GMM-2024-001234",
    "dob": "1985-04-12"
  },
  "provider": {
    "name": "Hospital Ángeles Metropolitano",
    "npi": "1234567890",
    "rfc": "HAM850412ABC"
  },
  "medical": {
    "diagnosis_icd10": ["J18.9"],
    "procedures_cpt": ["71046", "94640"],
    "admission_date": "2026-03-10",
    "discharge_date": "2026-03-12"
  },
  "financial": {
    "billed_amount": 48500.00,
    "copay": 3000.00,
    "currency": "MXN"
  }
}
```

**Estándares médicos:** ICD-10 · CPT · HCPCS · NPI · CFDI 4.0

---

### Agente 1.4 — Validación de Integridad Documental
Primera capa de validación antes de procesar.

**Verifica:**
- Campos obligatorios presentes
- Fechas coherentes (admisión ≤ alta ≤ factura)
- RFC / NPI válidos en catálogo
- Firma digital en XML CFDI
- Resolución mínima en imágenes para OCR

**Salida:** `VALID` / `NEEDS_REVIEW` / `REJECTED` con motivo

---

## 🩺 DOMINIO 2 — Inteligencia Médica

> Valida la coherencia clínica, detecta inconsistencias y evalúa riesgo.

### Agente 2.1 — Validación Clínica
Verifica que los procedimientos sean coherentes con el diagnóstico.

**Ejemplos de reglas:**
| Diagnóstico | Procedimiento esperado | Alerta si se factura |
|-------------|----------------------|----------------------|
| Neumonía (J18.9) | Radiografía tórax, antibióticos | Cirugía ortopédica |
| Fractura (S52.0) | Rx, inmovilización, ortopedia | Cardiología |
| Parto normal (O80) | Hospitalización ≤ 2 días | Hospitalización > 5 días |

**Fuente de conocimiento:** catálogo CIE-10 + CPT + reglas actuariales propias

---

### Agente 2.2 — Detección de Fraude y Abuso
Identifica patrones sospechosos antes de la liquidación.

**Señales de alerta:**
- Factura duplicada (mismo proveedor, paciente, fecha, monto)
- Unbundling: procedimientos facturados por separado cuando existe código conjunto
- Upcoding: código más costoso que el procedimiento real
- Proveedor con alta tasa de reclamaciones vs. promedio de su especialidad
- Asegurado con siniestros frecuentes de alto monto en período corto
- Proveedor no contratado en red facturando como si lo estuviera

**Técnicas:**
- Anomaly detection (Isolation Forest / AutoEncoder)
- Graph analysis (relaciones proveedor-paciente-diagnóstico)
- ML scoring con features históricas
- Reglas deterministas de negocio

**Salida:** score de riesgo 0–100 + features explicativas (SHAP)

---

### Agente 2.3 — Validación de Cobertura
Verifica que el evento reclamado esté cubierto por la póliza activa.

**Verifica:**
- Póliza vigente en fecha del evento
- Suma asegurada disponible (deducible, coaseguro, límite anual)
- Padecimientos preexistentes con periodo de espera
- Exclusiones específicas de la póliza
- Red de proveedores (en red / fuera de red)
- Beneficiario correcto

---

## ⚖️ DOMINIO 3 — Decisión y Liquidación

> Toma decisiones de aprobación y gestiona el pago al proveedor o reembolso al asegurado.

### Agente 3.1 — Motor de Reglas de Negocio
Aplica las reglas actuariales y operativas de la aseguradora.

**Reglas típicas:**
- Deducible acumulado en el año
- Coaseguro por tipo de servicio
- Topes por procedimiento
- Tarifas máximas por proveedor y región
- Descuentos por red contratada

**Plataforma:** motor de reglas configurable (no hardcoded), editable por operaciones sin deploy

---

### Agente 3.2 — Evaluación Automática de Siniestros
Decide el nivel de intervención humana requerido.

```
┌──────────────────────────────────────────────────┐
│           CRITERIOS DE DECISIÓN                  │
├──────────────────────────────────────────────────┤
│ APROBACIÓN AUTOMÁTICA                            │
│  · Monto < umbral configurado                    │
│  · Proveedor en red contratada                   │
│  · Score fraude < 30                             │
│  · Cobertura confirmada                          │
│  · Sin alertas médicas                           │
├──────────────────────────────────────────────────┤
│ REVISIÓN HUMANA                                  │
│  · Monto > umbral                                │
│  · Score fraude 30–70                            │
│  · Diagnóstico complejo o cirugía mayor          │
│  · Primera reclamación de proveedor nuevo        │
├──────────────────────────────────────────────────┤
│ RECHAZO AUTOMÁTICO                               │
│  · Póliza vencida en fecha del evento            │
│  · Duplicado confirmado                          │
│  · Exclusión explícita en póliza                 │
│  · Score fraude > 70                             │
└──────────────────────────────────────────────────┘
```

---

### Agente 3.3 — Cálculo de Liquidación
Calcula el monto exacto a pagar.

**Fórmula:**
```
Monto liquidable = 
  MIN(monto_facturado, tarifa_máxima_proveedor)
  - deducible_pendiente
  - coaseguro_aplicable
  - copago_fijo
  (sujeto a límite anual disponible)
```

**Salida:** breakdown detallado por línea de servicio, en formato para el asegurado y para contabilidad

---

### Agente 3.4 — Gestión de Pagos
Coordina el pago efectivo.

**Modalidades:**
- Pago directo al proveedor (hospital/médico)
- Reembolso al asegurado (transferencia / cheque)
- Nota de crédito para ajustes

**Integraciones:** SPEI · CLABE · APIs bancarias · SAT para CFDI de egreso

---

### Agente 3.5 — Preautorización
Gestiona solicitudes de autorización antes del evento (cirugías programadas, hospitalizaciones electivas).

**Flujo:**
```
Solicitud médico → Validación cobertura → Revisión médica → 
Autorización con número de caso → Notificación proveedor + asegurado
```

**SLA objetivo:** < 4 horas para cirugías electivas, < 30 minutos para urgencias

---

## 👤 DOMINIO 4 — Experiencia del Asegurado

> Gestiona toda la comunicación, el expediente y la relación con el cliente.

### Agente 4.1 — Comunicaciones Omnicanal
Envía notificaciones y actualizaciones al asegurado en cada paso.

**Canales:** Email · WhatsApp · SMS · Push notification · Portal web

**Eventos notificados:**
| Evento | Canal recomendado | SLA |
|--------|-------------------|-----|
| Recepción de documentos | WhatsApp + Email | Inmediato |
| Documentos faltantes | WhatsApp | < 1 hora |
| Siniestro en revisión | Email | Inmediato |
| Aprobación | WhatsApp + Email | Inmediato |
| Rechazo con motivo | Email + Portal | Inmediato |
| Pago procesado | WhatsApp + Email | Inmediato |

---

### Agente 4.2 — Asistente Conversacional (Copilot del Asegurado)
Chatbot inteligente para consultas del asegurado.

**Capacidades:**
- Consulta de estado de siniestros en tiempo real
- Guía para subir documentos correctamente
- Explicación de coberturas y exclusiones
- Solicitud de reembolsos y preautorizaciones
- Escalación a agente humano cuando sea necesario

**Tecnología:** Claude API / GPT-4 con RAG sobre pólizas y catálogos  
**Canales:** WhatsApp Business · Portal web · App móvil

---

### Agente 4.3 — Generación de Expediente Digital
Construye y mantiene el expediente completo del siniestro.

**Estructura:**
```
/siniestros/2026/GMM-SIN-000123/
├── documentos/
│   ├── factura_hospital.pdf
│   ├── factura_medico.pdf
│   ├── receta.pdf
│   ├── cfdi_xml.xml
│   └── estudios_lab.pdf
├── procesamiento/
│   ├── ocr_results.json
│   ├── fraud_score.json
│   └── coverage_validation.json
├── comunicaciones/
│   └── historial_notificaciones.json
├── liquidacion/
│   ├── calculo_detallado.json
│   └── comprobante_pago.pdf
└── metadata.json
```

**Almacenamiento:** Google Drive (expediente visible para asegurado) + Cloud Storage (procesamiento interno)

---

### Agente 4.4 — Gestión de Apelaciones
Maneja los casos donde el asegurado impugna una resolución.

**Flujo:**
```
Solicitud de apelación → Asignación a revisor senior →
Re-evaluación con documentación adicional → Resolución →
Notificación con fundamento legal
```

---

## 📊 DOMINIO 5 — Operaciones, Datos y Cumplimiento

> Garantiza la salud operativa del sistema, el cumplimiento normativo y la inteligencia de datos.

### Agente 5.1 — Auditoría y Compliance
Garantiza cumplimiento regulatorio y trazabilidad completa.

**Normativas:** CNSF (México) · HIPAA · GDPR · NOM-024-SSA3

**Capacidades:**
- Log inmutable de cada acción y decisión
- Trazabilidad de decisiones de IA (qué modelo, qué versión, qué input generó qué output)
- Retención de documentos según normativa
- Reportes regulatorios automáticos para CNSF
- Derecho al olvido (GDPR / LFPDPPP)

---

### Agente 5.2 — Observabilidad y Monitoreo
Monitorea la salud técnica y operativa del sistema en tiempo real.

**Métricas técnicas:**
- Latencia por agente (p50, p95, p99)
- Tasa de errores por servicio
- Costo de API (OCR, LLM, Cloud)
- Throughput de documentos procesados

**Métricas de negocio:**
- Tiempo promedio de resolución por tipo de siniestro
- Tasa de aprobación automática vs. revisión humana
- Tasa de detección de fraude
- NPS del asegurado

**Stack:** Prometheus · Grafana · Google Cloud Monitoring · Alertas PagerDuty

---

### Agente 5.3 — Data Engineering y Analytics
Construye la capa analítica para inteligencia de negocio.

**Pipelines:**
```
PostgreSQL (operacional) → Datastream → BigQuery (warehouse) →
Looker Studio / dbt → Dashboards ejecutivos
```

**Datasets clave:**
- Siniestralidad por póliza, edad, región, proveedor
- Tendencias de diagnósticos y procedimientos
- Proyección de reservas
- Análisis de rentabilidad por producto

---

### Agente 5.4 — Predicción y Actuaría IA
Modelos predictivos para la operación.

**Modelos:**
| Modelo | Input | Output |
|--------|-------|--------|
| Predicción de costo de siniestro | diagnóstico + edad + región | monto esperado |
| Riesgo de asegurado | historial + perfil | score de riesgo |
| Proyección de reservas | siniestros activos | reserva estimada |
| Propensión a fraude | perfil proveedor | score preventivo |

---

## 🏗 Arquitectura de Infraestructura

```yaml
# Stack tecnológico
api_gateway:
  - FastAPI (Python 3.12)
  - Kong / Traefik como proxy

orquestacion:
  - n8n (workflows y automatización)
  - Redis (queue y caché)

procesamiento_ia:
  - Google Document AI (OCR)
  - Vertex AI (modelos custom)
  - Claude API / GPT-4 (LLM tasks)

almacenamiento:
  - PostgreSQL 16 (base operacional)
  - Google BigQuery (warehouse)
  - Google Cloud Storage (documentos)
  - Google Drive (expedientes cliente)

infraestructura:
  - Docker + Dokploy (deployment)
  - Traefik (reverse proxy + SSL)
  - Google Cloud (cloud primario)

seguridad:
  - OAuth2 + JWT
  - Encriptación AES-256 en reposo
  - TLS 1.3 en tránsito
  - RBAC por rol (operador, médico, auditor, admin)
  - PII masking en logs
```

---

## 🔐 Seguridad y Gobierno de Datos

### Clasificación de datos
| Nivel | Datos | Controles |
|-------|-------|-----------|
| Crítico | Diagnósticos, resultados médicos | Encriptación + acceso auditado |
| Sensible | Nombre, póliza, RFC | Encriptación + RBAC |
| Interno | Métricas operativas | Acceso por rol |

### Gobierno de IA
- Versionado de modelos (MLflow)
- Explicabilidad de decisiones (SHAP / LIME)
- Human-in-the-loop para decisiones de alto impacto
- Revisión periódica de bias en modelos de fraude
- Registro de qué modelo tomó cada decisión

---

## 📈 KPIs Objetivo

| Métrica | Baseline actual | Objetivo 12 meses |
|---------|----------------|-------------------|
| Tiempo promedio de resolución | 5–10 días | < 2 horas (automático) |
| Tasa de automatización | ~20% | > 70% |
| Precisión OCR | Manual | > 97% |
| Detección de fraude | Reactiva | +40% detección temprana |
| Satisfacción asegurado (NPS) | — | > 60 |
| Costo por siniestro procesado | — | -45% |

---

## 🚀 Roadmap de Implementación

### Fase 1 — Fundación (Meses 1–3)
**Objetivo:** operaciones digitales básicas

- [ ] Portal de carga de documentos
- [ ] Agentes 1.1 a 1.4 (ingesta y OCR)
- [ ] Generación de expediente digital (4.3)
- [ ] Notificaciones básicas (4.1)
- [ ] Observabilidad técnica (5.2)

**Resultado:** siniestros 100% digitales, sin papel

---

### Fase 2 — Inteligencia (Meses 4–6)
**Objetivo:** decisiones automáticas en casos simples

- [ ] Validación clínica (2.1)
- [ ] Validación de cobertura (2.3)
- [ ] Motor de reglas (3.1)
- [ ] Evaluación automática (3.2)
- [ ] Cálculo de liquidación (3.3)
- [ ] Asistente conversacional (4.2)

**Resultado:** 40% de siniestros resueltos automáticamente

---

### Fase 3 — IA Avanzada (Meses 7–12)
**Objetivo:** sistema enterprise completo

- [ ] Detección de fraude ML (2.2)
- [ ] Gestión de pagos (3.4)
- [ ] Preautorizaciones (3.5)
- [ ] Analytics y BI (5.3)
- [ ] Modelos predictivos actuariales (5.4)
- [ ] Compliance automático CNSF (5.1)

**Resultado:** > 70% automatización, fraude detectado proactivamente

---

## 🔍 Gaps de la Propuesta Original — Resueltos

| Gap identificado | Solución añadida |
|-----------------|------------------|
| Sin gestión de preautorizaciones | Agente 3.5 |
| Sin canal de captura multicanal | Agente 1.1 |
| Sin gestión de pagos y liquidación | Agentes 3.3 y 3.4 |
| Sin asistente conversacional para el asegurado | Agente 4.2 |
| Sin gestión de apelaciones | Agente 4.4 |
| Sin modelos predictivos actuariales | Agente 5.4 |
| Sin gobierno de IA explícito | Sección de Gobierno de IA |
| Roadmap sin criterios de priorización | Roadmap por fases con objetivos medibles |
| KPIs sin baseline ni comparación | Tabla con baseline vs. objetivo |

---

## 📦 Resumen de Agentes

| # | Agente | Dominio | Fase |
|---|--------|---------|------|
| 1.1 | Captura Multicanal | Ingesta | 1 |
| 1.2 | Clasificación Inteligente | Ingesta | 1 |
| 1.3 | OCR Médico Estructurado | Ingesta | 1 |
| 1.4 | Validación de Integridad | Ingesta | 1 |
| 2.1 | Validación Clínica | Inteligencia Médica | 2 |
| 2.2 | Detección de Fraude | Inteligencia Médica | 3 |
| 2.3 | Validación de Cobertura | Inteligencia Médica | 2 |
| 3.1 | Motor de Reglas | Decisión | 2 |
| 3.2 | Evaluación Automática | Decisión | 2 |
| 3.3 | Cálculo de Liquidación | Decisión | 2 |
| 3.4 | Gestión de Pagos | Decisión | 3 |
| 3.5 | Preautorización | Decisión | 3 |
| 4.1 | Comunicaciones Omnicanal | Experiencia | 1 |
| 4.2 | Asistente Conversacional | Experiencia | 2 |
| 4.3 | Expediente Digital | Experiencia | 1 |
| 4.4 | Gestión de Apelaciones | Experiencia | 3 |
| 5.1 | Auditoría y Compliance | Operaciones | 2 |
| 5.2 | Observabilidad | Operaciones | 1 |
| 5.3 | Data Engineering | Operaciones | 3 |
| 5.4 | Predicción Actuarial | Operaciones | 3 |

**Total: 20 agentes especializados en 5 dominios funcionales**

---

*Propuesta generada para stack n8n · Dokploy · Google Cloud — Marzo 2026*
