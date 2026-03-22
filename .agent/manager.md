# 🤖 AGENT MANAGER - Squad de Orquestación

Este documento define la estructura del equipo de agentes (squad) que trabaja en el proyecto **Gastos Médicos Mayores (GMM)**.

---

## 👥 Equipo de Agentes (The Squad)

| Agente | Rol | Responsabilidades |
| :--- | :--- | :--- |
| **Manager (#1)** | Orquestador | Coordina al equipo, lee el `PLAN.md` y delega tareas. |
| **Frontend dev (#2)** | UI / UX | Desarrollo de React/Next.js, Tailwind, shadcn/ui. |
| **Backend/DB (#3)** | Datos | Google Sheets, Supabase, PostgreSQL. Valida e inserta datos del workflow. |
| **Workflow Specialist (#4)** | Automatización | Diseña nodos n8n (Drive Trigger -> OCR -> Parse XML -> Sheets/DB -> ZIP -> Email). |
| **Filesystem (#9)** | Drive / Local | Maneja PDFs/recetas en Drive y sistema de archivos local. |
| **Dokploy Ops (#10)** | DevOps / MCP | Gestión del VPS, contenedores y n8n-MCP como puente principal. |

---

## 🛠️ Protocolo de Delegación

1. **Análisis:** El Manager analiza la tarea solicitada.
2. **Dispatch:** Selecciona al agente o agentes necesarios basándose en sus especialidades.
3. **Ejecución:** Se cargan las instrucciones específicas del agente (vía include o prompt system).
4. **Validación:** El Manager revisa el resultado antes de reportar.

---

## 🚀 Agente de Dokploy (Ops)

**Nombre:** `dokploy-agent`  
**Ubicación:** `/.agent/agents/dokploy_agent.md`  
**Herramientas:** MCP de Dokploy y n8n-MCP.

Este agente se encarga de:
- Desplegar nuevas versiones de la aplicación.
- Configurar variables de entorno en el servidor.
- Gestionar dominios y certificados SSL.
- Monitorear logs de contenedores.
- **n8n integration:** Descubrir, editar y ejecutar workflows.

---

## 📚 SKILL REGISTRY

Todas las habilidades disponibles están mapeadas en `.agent/skills/`.
Para este proyecto, es crítico el uso de:
- `analizador-proyectos`: `.agent/skills/analizador-proyectos/`
- `frontend-design`: (Global o local)
- `master-habilidades`: `.agent/skills/master-habilidades/`
- `dokploy-ops`: `.agent/skills/dokploy-ops/`
- `filesystem-manager`: `.agent/skills/filesystem-manager/`
- `knowledge-manager`: `.agent/skills/knowledge-manager/`
- `workflow-executor`: `.agent/skills/workflow-executor/`
- `gmm-workflow-builder`: `.agent/skills/gmm-workflow-builder/`


---

*Versión 1.0 — 2026*
