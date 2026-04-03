# 🤖 AGENT MANAGER - Squad de Orquestación

Este documento define la estructura del equipo de agentes (squad) que trabaja en el proyecto **Gastos Médicos Mayores (GMM)**.

---

## 👥 Equipo de Agentes (The Squad)

| Agente | Rol | Responsabilidades | Definición (Brain) |
| :--- | :--- | :--- | :--- |
| Agente | Rol | Responsabilidades | Definición (Brain) |
| :--- | :--- | :--- | :--- |
| **Manager (#1)** | Orquestador | Coordina al equipo, lee el `PLAN.md` y delega tareas. | `/.agent/agent/01_manager_agent.md` |
| **Frontend dev (#2)** | UI / UX | Desarrollo de React/Next.js, Tailwind, shadcn/ui. | `/.agent/agent/02_frontend_agent.md` |
| **Backend/DB (#3)** | Datos | Google Sheets, Supabase, PostgreSQL. | `/.agent/agent/03_backend_agent.md` |
| **Workflow Specialist (#4)** | Automatización | Diseña nodos n8n (OCR -> Parser -> DB -> ZIP). | `/.agent/agent/04_workflow_agent.md` |
| **Auditor (#6)** | QA | Pruebas E2E, validación de procesos y reportes. | `/.agent/agent/06_auditor_agent.md` |
| **Filesystem (#9)** | Drive / Local | Maneja PDFs/recetas en Drive y sistema local. | `/.agent/agent/09_filesystem_agent.md` |
| **Dokploy Ops (#10)** | DevOps / MCP | Gestión del VPS, contenedores y n8n-MCP. | `/.agent/agent/10_dokploy_agent.md` |

---

## 🛠️ Protocolo de Delegación

1. **Análisis:** El Manager analiza la tarea solicitada.
2. **Dispatch:** Selecciona al agente o agentes necesarios basándose en sus especialidades.
3. **Ejecución:** Se cargan las instrucciones específicas del agente (vía include o prompt system).
4. **Validación:** El Manager revisa el resultado antes de reportar.

---

## 🛰️ Agente de Dokploy (Ops)

**Nombre:** `10_dokploy_agent`  
**Ubicación:** `/.agent/agent/10_dokploy_agent.md`  
**Herramientas:** MCP de Dokploy y n8n-MCP.

Este agente se encarga de:
- Desplegar nuevas versiones de la aplicación.
- Configurar variables de entorno en el servidor.
- Gestionar dominios y certificados SSL.
- Monitorear logs de contenedores.
- **n8n integration:** Descubrir, editar y ejecutar workflows.

---

## 📚 SKILL REGISTRY

Todas las habilidades disponibles están mapeadas en `.agent/skill/`.
Para este proyecto, es crítico el uso de:
- `00_system_blueprint_skill`: `.agent/skill/00_system_blueprint_skill/`
- `01_manager_analyzer_skill`: `.agent/skill/01_manager_analyzer_skill/`
- `01_manager_orchestrator_skill`: `.agent/skill/01_manager_orchestrator_skill/`
- `01_manager_skills_skill`: `.agent/skill/01_manager_skills_skill/`
- `02_frontend_accessibility_skill`: `.agent/skill/02_frontend_accessibility_skill/`
- `02_frontend_design_skill`: `.agent/skill/02_frontend_design_skill/`
- `02_frontend_seo_skill`: `.agent/skill/02_frontend_seo_skill/`
- `03_backend_knowledge_skill`: `.agent/skill/03_backend_knowledge_skill/`
- `04_workflow_builder_skill`: `.agent/skill/04_workflow_builder_skill/`
- `04_workflow_executor_skill`: `.agent/skill/04_workflow_executor_skill/`
- `06_auditor_qa_skill`: `.agent/skill/06_auditor_qa_skill/`
- `09_filesystem_manager_skill`: `.agent/skill/09_filesystem_manager_skill/`
- `10_dokploy_ops_skill`: `.agent/skill/10_dokploy_ops_skill/`


---

*Versión 1.0 — 2026*
