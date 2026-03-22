---
name: "GMM Auditor"
description: "Verifica implementación completa workflows GMM: webhook, data flow, Sheets, ZIP, Drive"
triggers: ["audita gmm", "verifica workflows", "testea n8n gmm", "qa siniestros"]
priority: 920
category: "qa-n8n"
---
## Checklist Automático
1. ✅ **Webhook ID restaurado**: `ae284c21-41b5-4c35-8378-85e1422b35de-mod`
2. ✅ **MergeZipData**: Preserva metadatos antes del ZIP
3. ✅ **SheetsLogHistorial**: Syntax `={{$node.ExecuteWorkflowTrigger.json.SHEETS_GMM_ID}}`
4. ✅ **Sub-workflows activos**: 
   - Orchestrator (`3Silaf5Sjtzt4NLk`)
   - Data-Register (`iWDi0Oizh4tpnihN`)
   - ZIP (`niTxNaK2iazIV6Ku`)
   - PDF (`M5yz5irHURXv0wl0`)
5. **Test end-to-end**: Simula siniestro → ZIP/email

## 🚀 Pasos de Ejecución
- **QA/Tester**: Ejecuta tests Playwright en dashboard para verificar disparo del webhook.
- **Workflow Specialist**: Usa `n8n-mcp` para listar ejecuciones y errores recientes.
- **n8n Validator**: (Si está disponible) Corre auditoría de best practices sobre los 4 workflows.
- **Filesystem**: Verifica la creación de carpetas en Drive (vía log) e integridad en Sheets.

## 🤝 Squad de Auditoría
| Agente | Responsabilidad | Herramientas |
| :--- | :--- | :--- |
| **QA (#6)** | Lead / End-to-end | Playwright, Browser |
| **Workflow Specialist (#4)** | n8n Health & Logic | n8n-MCP, Validator MCP |
| **Filesystem (#9)** | Data Integrity | Drive/Sheets API, FS |
| **Backend (#3)** | Supabase Sync | PostgREST / Supabase |
| **Manager (#1)** | Reporte Final | Markdown Artifacts |
