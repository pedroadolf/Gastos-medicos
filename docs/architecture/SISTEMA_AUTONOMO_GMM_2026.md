# 🏗️ SISTEMA AUTÓNOMO GMM - ARQUITECTURA INTEGRAL 2026
**Manual de Referencia para Sistemas de IA Auto-Evolutivos**

Este documento es la recopilación definitiva de la arquitectura GMM, diseñada para ser replicable en cualquier sistema que requiera resiliencia, diagnosis y autonomía total.

---

## 🏛️ PARTE 1: CIMIENTOS DE LA ARQUITECTURA (Foundation)

Antes de la autonomía, construimos la base de control y validación:

### ✈️ 1. WORKFLOW COPILOT (AI AGENT)
Un agente de IA (OpenAI/Anthropic) que reside en n8n como un nodo "Consultor".
*   **Prompt**: "Analiza este JSON de workflow y dime si cumple con el Contrato Universal y si tiene riesgos de seguridad o performance".
*   **Output**: Sugerencias de código listas para copiar y pegar.

### 🛡️ 2. CONTRATO UNIVERSAL DE DATOS
Protocolo estricto donde cada nodo de n8n DEBE recibir y entregar un esquema JSON estandarizado. 
*   **Ventaja**: Permite cambiar cualquier nodo sin romper los siguientes.

### 📊 3. MONITORIZACIÓN DE SALUD (Health Check)
Sistema que reporta el estado de salud de cada workflow en tiempo real al Dashboard.
*   **Métrica**: Tiempo de respuesta, tasa de error y memoria consumida.

---

## 🚀 PARTE 2: MOTORES DE AUTONOMÍA (The Evolution)

Estos son los 5 motores que permiten que el sistema opere y evolucione sin intervención humana:

### 🧬 1. AUTO-BUILDER (Constructor Autónomo)
*   **Función**: Transforma requerimientos de negocio en workflows n8n JSON blindados.
*   **Hardening**: Incluye automáticamente reintentos (3x), logging y validación de esquemas.

### 🧠 2. MASTER ORCHESTRATOR (Orquestador Maestro)
*   **Función**: Controla el ciclo de vida de los procesos (`jobs`) y coordina agentes.
*   **Estado**: Gestiona la tabla centralizada de estados (PENDING -> RUNNING -> DONE).

### 🔍 3. SYSTEM INTELLIGENCE (Inteligencia de Observabilidad)
*   **Función**: El "Sistema Nervioso" que detecta patrones de error (`fingerprinting`) y fragilidad.
*   **Evolución**: Propone mejoras al detectar fallos recurrentes.

### 💠 4. SINGULARITY BRAIN (Debate Multi-Agente)
*   **Función**: Añade una capa de "pensamiento crítico" mediante el debate (Proposer vs Critic vs Refiner) antes de ejecutar cambios estructurales.

### 📚 5. PERSISTENT VECTOR MEMORY (Memoria de Experiencia)
*   **Función**: Usa `pgvector` para que los agentes "recuerden" soluciones exitosas a problemas pasados mediante búsqueda semántica.

---

## 📂 PARTE 3: ESTRUCTURA DE ARCHIVOS Y STACK

```text
/project
  ├── .agent/           # Prompts y lógica de agentes
  ├── docs/             # Arquitectura y manuales
  ├── scripts/          # Motores de auditoría, decisión y autonomía (.js)
  ├── apps/             # Frontend (Dashboard) y Backend
  └── workflows/        # Exports de n8n validados y endurecidos
```

### 🛠️ STACK RECOMENDADO PARA RÉPLICA
1.  **Orquestación**: n8n.io
2.  **Base de Datos**: Supabase (PostgreSQL + pgvector).
3.  **Motores de IA**: Claude 3.5 Sonnet / GPT-4o.
4.  **Capa Lógica**: Node.js scripts coordinando el "Debate" y "Auto-Builder".

---

> **MEMORIA DEL PROYECTO GMM:** Esta arquitectura fue implementada para resolver la fragilidad de los workflows de seguros médicos, permitiendo procesar siniestros de forma 100% autónoma y segura. Este manual es ahora el estándar para cualquier aplicación de la "Era de la Autonomía".
