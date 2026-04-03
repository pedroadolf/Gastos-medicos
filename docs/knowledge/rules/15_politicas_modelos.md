# ⛽ POLÍTICAS DE MODELOS IA - Protocolo "Gasolina"

Este documento establece las reglas obligatorias para la selección y uso de modelos de IA en el proyecto Antigravity, optimizando costo, latencia y eficiencia de cuota.

## 🏗️ Jerarquía de Tiers (Model Pool — 12 Combinaciones)

| Tier | Modelo | Modo | Cuándo usar |
|------|--------|------|-------------|
| **T1** | `Gemini 3 Flash` | **Fast** | Tareas directas <1000 líneas. |
| **T1** | `Gemini 3 Flash` | **Planning** | Chunking de archivos grandes. |
| **T1** | `GPT-OSS 120B` | **Fast/Plan** | Scripts medianos / Refactorización. |
| **T2** | `Gemini 3.1 Pro (Low)` | **Fast/Plan** | Auditorías / Cambios estructurales. |
| **T2** | `Gemini 3.1 Pro (High)` | **Fast/Plan** | Código complejo / Re-arquitectura. |
| **T3** | `Claude 4.6 (Sonnet/Opus)`| **Fast/Plan** | Razonamiento profundo / Decisiones críticas. |

## 🚨 Reglas de Oro (Mandatos v4)

1.  **Flash First:** `Gemini 3 Flash` para el 85% de tareas. Sin diseño → Fast. Con diseño o multi-paso → Planning.
2.  **GPT-OSS Step:** Si Flash es insuficiente por capacidad, usar `GPT-OSS 120B` antes de escalar a T2.
3.  **Cascada de Failover Ordenada:**
    *   Flash (429) → GPT-OSS.
    *   GPT-OSS → Pro Low Planning.
    *   Pro Low (quota) → Claude Sonnet 4.6 Thinking Planning.
4.  **Tanque Familiar:** Pro Low y Pro High comparten cuota (Google). Si falla por quota, saltar a Claude.
5.  **Válvula 25 (ADN Checkpoint):** Obligatorio al llegar a 25 mensajes. Debe incluir Objetivo, Decisiones y Estado.
6.  **Thinking = Último Recurso:** Solo si T1 y T2 fallan. Preferir Sonnet antes que Opus.

## 🤖 El Rol del Orquestador

Cada solicitud debe ser pre-procesada por un componente de orquestación que genere un JSON/XML con la ruta de ejecución óptima, siguiendo los patrones definidos en el skill `resource-manager`.

---
*Versión 1.0 — Marzo 2026*
