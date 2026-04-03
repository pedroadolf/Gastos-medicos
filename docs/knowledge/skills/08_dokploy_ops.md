---
name: dokploy-ops
description: Gestiona el despliegue y la infraestructura en Dokploy. Permite desplegar aplicaciones, gestionar variables de entorno, configurar bases de datos y monitorear logs del sistema. Úsala cuando el usuario pida "despliega la app", "revisa los logs del servidor", "actualiza variables en dokploy" o "configura un nuevo dominio".
version: 1.0.0
author: Antigravity Master Skills
tags: [devops, dokploy, deploy, vps, docker]
triggers:
  - "despliega en dokploy"
  - "redeploy app"
  - "revisa logs de dokploy"
  - "configura ssl en dokploy"
dependencies: ["dokploy-mcp"]
outputs: [deployment_status, logs, config_update]
---

# 🚢 Dokploy Ops Skill

## 🎯 Objetivo
Automatizar y optimizar la gestión de la infraestructura del proyecto GMM utilizando la interfaz MCP de Dokploy.

## 🔧 Instrucciones de Uso

### Paso 1: Verificación de Estado
Antes de cualquier cambio, consulta el estado actual de la aplicación.
- Tool: `get_application(applicationId)`

### Paso 2: Despliegue (CI/CD)
Para subir cambios al servidor:
1. Asegúrate de que el código esté en el repositorio remoto configurado.
2. Tool: `deploy_application(applicationId)`

### Paso 3: Gestión de Variables
Si se actualiza el `.env.local` con nuevos secretos:
1. Tool: `update_application` con el nuevo `env` string.
2. Tool: `deploy_application` para forzar el reinicio con nuevas variables.

### Paso 4: Diagnóstico
Si la aplicación falla:
1. Tool: `get_application_logs(applicationId)`
2. Analiza los errores de build o de runtime.

## 📌 Cuándo Usarla

**✅ Usa esta skill cuando:**
- Necesites pasar cambios de desarrollo a producción.
- La aplicación gmm.pash.uno no responda.
- Necesites rotar secretos o actualizar dominios.

**❌ NO uses esta skill cuando:**
- Los cambios sean solo visuales en desarrollo local.
- Se trate de lógica interna de n8n (usa `n8n-specialist` en su lugar).

## 🚨 Restricciones
1. **Pausas:** Siempre pide confirmación antes de borrar cualquier recurso.
2. **PostgreSQL:** No abras el puerto 5432 a la IP pública (0.0.0.0).

---
*Configuración basada en Dokploy MCP v1.0*
