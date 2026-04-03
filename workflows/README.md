# Workflows n8n — GMM

Este directorio contiene todos los workflows de n8n del proyecto GMM, **versionados en git**.

## Estructura

### `auditoria/` — Monitoreo, Orquestación y Alertas
| Archivo | Descripción |
|---|---|
| `GMM-Agent-v2.json` | Orquestador principal (Claude AI agent) |
| `GMM-Monitor-Auditado.json` | Monitoreo de jobs y estados |
| `GMM-Error-Handler-Proactive.json` | Manejo proactivo de errores |
| `GMM-FailSafe-Alert.json` | Alertas de failsafe vía Telegram/email |

### `procesamiento-pdf/` — Generación de Documentos
| Archivo | Descripción |
|---|---|
| `GMM-PDF-Processor-Agente-Auditado.json` | Procesamiento y auditoría de PDFs con IA |
| `GMM-Package-ZIP-Email-v2.0-Direct-Download.json` | Empaquetado en ZIP y envío por email |

### `registro-datos/` — Registro y Trazabilidad
| Archivo | Descripción |
|---|---|
| `GMM-Data-Register-Auditado.json` | Registro de tramites en Google Sheets |

---

## ⚠️ Protocolo de Actualización

Después de cualquier cambio en n8n:

1. Abre el workflow en n8n UI
2. Menu `⋮` → **Download** → **Export as JSON**
3. Reemplaza el archivo JSON en este directorio
4. Commit con descripción clara:
   ```bash
   git add workflows/
   git commit -m "fix(workflows/auditoria): add retry logic to agent orchestrator"
   ```

## Restauración desde Git

Si n8n se cae o necesitas recrear un workflow:

1. Ve a n8n UI → Workflows
2. Click `+` → **Import from file**
3. Selecciona el JSON correspondiente

## Historial de Cambios

```bash
git log --oneline -- workflows/
```
