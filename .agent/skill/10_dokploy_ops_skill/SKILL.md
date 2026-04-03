---
name: 10_dokploy_ops_skill
description: Gestiona el despliegue y la infraestructura en Dokploy vía MCP.
triggers: ["despliega en dokploy", "redeploy app", "logs de dokploy"]
priority: 700
category: "devops"
---

# 🚢 Dokploy Ops

## 🎯 Objetivo
Automatizar la gestión de infraestructura utilizando la interfaz MCP de Dokploy.

## 🔧 Instrucciones de Uso
1. Verificación de estado: `get_application`.
2. Despliegue (CI/CD): `deploy_application`.
3. Gestión de variables: `update_application`.
4. Diagnóstico: `get_application_logs`.

## 🚨 Restricciones
- Siempre pide confirmación antes de borrar recursos.
- No abras puertos sensibles al público.
