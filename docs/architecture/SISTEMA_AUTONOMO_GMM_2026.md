# 🏗️ SISTEMA AUTÓNOMO GMM - ARQUITECTURA 2026
**Manual de Referencia para Sistemas de IA Auto-Evolutivos**

Este documento detalla los 5 pilares arquitectónicos implementados en GMM, diseñados para ser replicables en cualquier aplicación que requiera autonomía, diagnóstico y evolución automática.

---

## 🚀 1. AUTO-BUILDER (Constructor Autónomo)
**Objetivo**: Transformar requerimientos de negocio en código (n8n JSON) blindado y listo para producción.

*   **Pipeline**: `Input -> Planner -> Architect -> Builder -> Auditor`.
*   **Hardening (Blindaje)**: Cada workflow generado incluye automáticamente:
    *   Manejo de reintentos (Retries 3x).
    *   Logging estructurado en cada nodo.
    *   Validación de esquemas de entrada/salida.
    *   Optional chaining para evitar errores de null/undefined.
*   **Uso**: Generar automatizaciones dinámicas sin intervención humana.

---

## 🧠 2. MASTER ORCHESTRATOR (Orquestador Maestro)
**Objetivo**: Controlar el ciclo de vida de los procesos y coordinar múltiples agentes/workflows.

*   **Estado Centralizado**: Gestiona una tabla de `jobs` (Status: PENDING, RUNNING, COMPLETED, FAILED).
*   **Lógica de Reasignación**: Si un sub-proceso falla, el orquestador decide si reintenta, escala a un agente humano o aplica una ruta alternativa.
*   **Trazabilidad**: Todo proceso hereda un `trace_id` único que vincula logs, auditorías y resultados.

---

## 🧬 3. SYSTEM INTELLIGENCE (Inteligencia de Observabilidad)
**Objetivo**: El "Sistema Nervioso" que monitorea fallos y detecta patrones de inestabilidad.

*   **Error Fingerprinting**: Agrupa logs por firma de error (`AGENT_NODE_ERROR`).
*   **Fragility Detection**: Si un patrón se repite >N veces, el sistema lo marca como "Frágil".
*   **Trigger de Evolución**: Dispara propuestas de refactorización cuando la tasa de fallos supera el umbral de seguridad.

---

## 💠 4. SINGULARITY BRAIN (Debate Multi-Agente)
**Objetivo**: Añadir una capa de "pensamiento crítico" antes de realizar cambios estructurales.

*   **Debate Interno**:
    *   `Proposer`: Propone el cambio técnico.
    *   `Critic`: Actúa como auditor, buscando fallos en la propuesta.
    *   `Refiner`: Consolida el consenso en un plan de acción definitivo.
*   **Seguridad**: Evita que una automatización "pache" un sistema de forma errática mediante la validación dialéctica.

---

## 📚 5. PERSISTENT VECTOR MEMORY (Memoria de Experiencia)
**Objetivo**: Permitir que los agentes "recuerden" fallos pasados y soluciones exitosas.

*   **Embeddings (`pgvector`)**: Convierte logs y heurísticas en vectores matemáticos.
*   **Búsqueda Semántica**: Antes de resolver un problema, el sistema busca: *"¿Cómo resolvieron los agentes este problema antes?"*.
*   **Base de Conocimiento Evolutiva**: A medida que el sistema opera, la memoria se vuelve más rica, reduciendo el tiempo de resolución de incidentes.

---

## 🛠️ STACK RECOMENDADO PARA RÉPLICA
1.  **Orquestación**: n8n (o plataformas similares de workflows).
2.  **Base de Datos**: Supabase / PostgreSQL con extensión `pgvector`.
3.  **Motores de LLM**: Claude 3.5 Sonnet / GPT-4o.
4.  **Backend de Control**: Node.js (scripts de orquestación y debate).

---
*Este sistema marca el fin del software estático. Cualquier aplicación construida bajo esta arquitectura dejará de depender de mantenimiento humano constante para empezar a aprender y reparase sola.*
