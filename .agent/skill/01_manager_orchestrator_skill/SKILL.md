---
name: 01_manager_orchestrator_skill
description: Patrones para orquestar múltiples servidores MCP integrando el SDK mcp-agent.
triggers: ["orquestar mcp", "mcp swarm", "mcp worker"]
priority: 600
category: "orchestration"
---

# 🛠️ MCP Orchestrator

## Descripción
Define patrones de integración para gestionar servidores MCP como un swarm de agentes.

## Implementación
Uso de la clase `McpAgent` para gestionar conexiones y ejecución de tareas delegadas.

## Patrones
- **Swarm Directo**: Agente central con todas las herramientas.
- **Delegación**: Sub-agentes específicos por tarea.
