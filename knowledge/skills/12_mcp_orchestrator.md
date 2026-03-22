# SKILL: MCP Orchestrator (LastMile AI)

## Descripción
Define los patrones para integrar el SDK `mcp-agent` de LastMile AI en el orquestador principal. Permite la orquestación de múltiples servidores MCP como un swarm de agentes.

## Implementación
El orquestador debe usar la clase `McpAgent` para gestionar la conexión con los servidores definidos en `requirements.txt`.

## Patrones de Orquestación
- **Swarm Directo**: Un agente central con acceso a todas las herramientas.
- **Delegación**: El orquestador principal delega tareas específicas a "sub-agentes" MCP.

## Ejemplo de Código
```python
from mcp_agent import McpAgent

async def run_mcp_step(task):
    agent = McpAgent(name="MCP_Worker")
    await agent.connect_server("filesystem")
    result = await agent.execute(task)
    return result
```
