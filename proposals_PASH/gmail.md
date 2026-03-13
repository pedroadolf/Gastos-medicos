

## 🎯 Diagnóstico Final: El problema es el "Real-time" + "Múltiples filas"

Tienes una tormenta perfecta:
- **Trigger:** Webhook en tiempo real
- **Datos:** Múltiples filas (5-20 por lote)
- **Procesamiento:** Paralelo por defecto en n8n
- **Resultado:** Múltiples ejecuciones → Múltiples correos

## 🔧 Solución Definitiva: "Patrón Buffer Time Window"

Como toleras retraso de 1-2 minutos, implementaremos un buffer que acumule TODAS las ejecuciones relacionadas con el mismo lote.

### **Workflow Modificado (Estructura Final):**

```
[Webhook] → [Set Buffer Window] → [Procesamiento Normal] → [Error Detected]
                ↓                                                 ↓
         [Wait: Acumulador] ←──────────────────────── [Enviar a Buffer]
                ↓
         [Aggregator Consolidado]
                ↓
         [Gmail: UN SOLO CORREO]
```

### **Implementación Paso a Paso:**

#### **Paso 1: Nodo "Set Buffer Window" (inmediato después del Webhook)**

Agrega un nodo **Function** justo después del Webhook:

```javascript
// Crear una ventana de tiempo única para ESTE lote de ejecuciones
const batchId = Math.floor(Date.now() / 60000); // Cambia cada minuto
const executionId = $execution.id;

// Guardar en datos estáticos del workflow para compartir entre ejecuciones
await $workflowStaticData.set(`batch_${batchId}`, {
  startTime: Date.now(),
  executions: [],
  errors: [],
  completedCount: 0,
  totalExpected: $input.first().json.totalRows || 0 // Si puedes pasar este dato
});

// Pasar el batchId a toda la ejecución
return [{
  json: {
    ...$input.first().json,
    batchId: batchId,
    executionId: executionId,
    timestamp: Date.now()
  }
}];
```

#### **Paso 2: Modificar los nodos de Error Handler**

En CADA punto donde detectes un error, reemplaza el envío directo a Gmail con este código:

```javascript
// Capturar error y enviarlo al buffer central
const errorData = {
  executionId: $execution.id,
  rowData: $input.first().json.row || 'Desconocido',
  fase: 'Fase X', // Cambia según dónde estés
  error: $input.first().json.error,
  details: $input.first().json.details,
  timestamp: Date.now(),
  binaryData: $binary // Si hay archivos adjuntos
};

// Obtener el batchId (debe venir desde el primer nodo)
const batchId = $input.first().json.batchId;

// Almacenar en workflowStaticData (compartido entre ejecuciones)
const batchData = await $workflowStaticData.get(`batch_${batchId}`) || { errors: [] };
batchData.errors.push(errorData);
await $workflowStaticData.set(`batch_${batchId}`, batchData);

// NO enviar correo aquí
return []; // Silencioso, solo acumula
```

#### **Paso 3: Nodo "Wait - Acumulador" (NUEVO)**

Agrega un workflow separado (sub-workflow) o un nodo al final:

```javascript
// Esperar 90 segundos para acumular TODOS los errores del lote
const batchId = $input.first().json.batchId;
const startTime = Date.now();

// Esperar 90 segundos
await $execution.wait(90000);

// Recoger TODOS los errores acumulados en este tiempo
const batchData = await $workflowStaticData.get(`batch_${batchId}`) || { errors: [] };
const allErrors = batchData.errors;

// Si no hay errores, terminar
if (allErrors.length === 0) {
  return [];
}

// Agrupar errores por tipo/fase para mejor reporte
const groupedErrors = allErrors.reduce((acc, error) => {
  if (!acc[error.fase]) acc[error.fase] = [];
  acc[error.fase].push(error);
  return acc;
}, {});

// Preparar reporte consolidado
const report = {
  totalErrors: allErrors.length,
  timestamp: new Date().toISOString(),
  batchId: batchId,
  executionCount: allErrors.length,
  errors: allErrors,
  groupedByFase: groupedErrors
};

// Limpiar el batch después de procesar
await $workflowStaticData.set(`batch_${batchId}`, null);

return [{
  json: report,
  binary: {
    // Si quieres adjuntar los archivos relacionados
    consolidatedZip: await createConsolidatedZip(allErrors) // Función helper
  }
}];
```

#### **Paso 4: Nodo Gmail Consolidado**

Configura el nodo Gmail para usar los datos del reporte:

```
Asunto: [ERROR] Reporte Consolidado - {{$json.totalErrors}} errores detectados
Cuerpo: 
Se procesaron {{$json.executionCount}} ejecuciones en el lote {{$json.batchId}}

DISTRIBUCIÓN POR FASE:
{{#each $json.groupedByFase}}
  {{@key}}: {{this.length}} errores
{{/each}}

DETALLE DE ERRORES:
{{#each $json.errors}}
  • Ejecución {{this.executionId}} - Fase {{this.fase}}
    Error: {{this.error}}
    Fila: {{this.rowData}}
    {{#if this.details}}Detalle: {{this.details}}{{/if}}
    {{#if this.timestamp}}Hora: {{new Date(this.timestamp).toLocaleTimeString()}}{{/if}}
{{/each}}

Este es un reporte consolidado que agrupa TODAS las ejecuciones relacionadas.
```

### **✅ Beneficios de esta solución:**

1. **UN SOLO CORREO** por lote (aunque hayan 20 ejecuciones)
2. **Reporte completo** con todos los errores detallados
3. **Agrupación por fase** para identificar dónde falla más
4. **Tolerancia a retraso** (configurable, ahora 90 segundos)
5. **No pierdes información** (todos los errores se consolidan)

### **⚙️ Ajustes según tu caso:**

- **Si procesas 5-20 filas:** 90 segundos es perfecto
- **Si quieres más rápido:** Reduce a 45-60 segundos
- **Si procesas lotes muy grandes:** Aumenta a 120-180 segundos

### **📝 Pasos para implementar:**

1. **Copia el workflow** (por seguridad)
2. **Agrega el nodo "Set Buffer Window"** después del Webhook
3. **Modifica CADA nodo de error** para que acumulen en lugar de enviar
4. **Crea el sub-workflow o nodo final** con el Wait de 90 segundos
5. **Configura el nodo Gmail** para usar el reporte consolidado
6. **Prueba con 3-5 filas** y verifica que solo llegue 1 correo

