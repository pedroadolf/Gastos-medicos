# 🤖 AGENT MANAGER - Squad de Orquestación

Este documento define la estructura del equipo de agentes (squad) que trabaja en el proyecto **Gastos Médicos Mayores (GMM)**.

---

## 👥 Equipo de Agentes (The Squad)

| Agente | Rol | Responsabilidades |
| :--- | :--- | :--- |
| **Manager (Lead)** | Orquestador | Coordina al equipo, lee el `PLAN.md` y delega tareas. |
| **Frontend dev** | UI / UX | Desarrollo de React/Next.js, Tailwind, shadcn/ui. |
| **Backend/DB** | Datos | Google Sheets, Supabase, PostgreSQL. |
| **Workflow Specialist (n8n)** | Automatización | Creación y mantenimiento de flujos en n8n. |
| **Dokploy Ops** | DevOps / Deploy | Gestión del VPS, contenedores, SSL y despliegues vía Dokploy. |
| **QA / Tester** | Calidad | Tests unitarios, integración y E2E (Playwright). |
| **Security Officer** | Seguridad | Auditoría de código, gestión de secretos y RLS. |
| **Knowledge Manager** | Documentación | Mantenimiento de KIs y reglas en `knowledge/`. |

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
**Herramientas:** MCP de Dokploy.

Este agente se encarga de:
- Desplegar nuevas versiones de la aplicación.
- Configurar variables de entorno en el servidor.
- Gestionar dominios y certificados SSL.
- Monitorear logs de contenedores y salud del VPS.

---

## 📚 SKILL REGISTRY

Todas las habilidades disponibles están mapeadas en `knowledge/skills/`.
Para este proyecto, es crítico el uso de:
- `analizador-proyectos`
- `frontend-design`
- `master-habilidades`
- `dokploy-ops` (Nueva)

---

*Versión 1.0 — 2026*
