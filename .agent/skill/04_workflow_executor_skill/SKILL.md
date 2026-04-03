---
name: 04_workflow_executor_skill
description: Ejecuta workflows estandarizados y checklists automatizados desde .agent/workflows/.
triggers: ["ejecuta workflow", "corre el proceso de", "deploy a producción"]
priority: 800
category: "automation"
---

# 🔄 Workflow Executor

## 🎯 Objetivo
Ejecutar automáticamente workflows definidos en `.agent/workflows/` siguiendo pasos secuenciales y validando requisitos.

## 🔧 Instrucciones de Uso
1. Buscar el archivo en `.agent/workflows/[nombre].md`.
2. Validar pre-requisitos.
3. Ejecutar pasos en orden secuencial.
4. Generar reporte al finalizar.

## 🚨 Restricciones Críticas
1. NUNCA saltar pasos.
2. Fail-fast en caso de error.
3. Registrar cada paso con timestamp.
