# 🚀 SECUENCIA UNIVERSAL - Migración Ecosistema
## 1. PLANIFICACIÓN (30s)
- Lee knowledge/rules/01_reglas_globales.md
- Lee knowledge/rules/06_guia_para_Proyecto.md  
- Genera PLAN.md en artifacts/ con: objetivos, skills necesarias, timeline

## 2. SKILLS SETUP (1min)
- Analiza knowledge/skills/ para cargar habilidades base
- Usa knowledge/skills/07_blueprint_skills_base.md como template
- Crea agents/ personalizados según proyecto

## 3. EJECUCIÓN (Variable)
```
python src/main.py
```
- Sigue prompts de knowledge/rules/03_agent_prompt.md
- Aplica estilo: knowledge/rules/04_estilo.css
- Seguridad: knowledge/rules/05_logica_seguridad.config.ts

## 4. TESTING & ARTIFACTS
- Tests en browser (Playwright)
- Guarda screenshots, logs en artifacts/
- Report final: artifacts/RESULTADO.md

## ESTÁNDARES OBLIGATORIOS
- Siempre incremental: nunca borres código existente
- Commits frecuentes con git commit -m "step X: descripción"
- Usa conocimiento de knowledge/ por dominio (frontend, marketing)

## 5. RECURSOS EXTERNOS
- Siempre consulta knowledge/external-resources.md antes de crear skills
- Importa workflows desde antigravity.codes/workflows según proyecto
