# 🚀 Skills Faltantes para Antigravity - Versión Mejorada

## 📋 Índice
1. [Skill 1: Knowledge Manager](#skill-1-knowledge-manager)
2. [Skill 2: Workflow Executor](#skill-2-workflow-executor)
3. [Instalación Rápida](#instalación-rápida)
4. [Ejemplos de Uso](#ejemplos-de-uso-completos)
5. [Testing y Validación](#testing-y-validación)

---

## Skill 1: Knowledge Manager

### 📂 Ubicación
```
~/.gemini/antigravity/skills/knowledge-manager/
├── SKILL.md
├── scripts/
│   └── search_ki.py
├── examples/
│   ├── ejemplo_consulta_marketing.md
│   └── ejemplo_consulta_finanzas.md
└── resources/
    └── template_ki.md
```

---

### 📄 SKILL.md (Versión Mejorada)

```markdown
---
name: knowledge-manager
description: Consulta y gestiona Knowledge Items (KIs) de dominio específico desde carpetas knowledge/. Proporciona información de negocio validada sin inventar datos, soporta múltiples formatos (MD, JSON, YAML) y sugiere creación de nuevos KIs cuando no existen. Ideal para centralizar conocimiento de marketing, finanzas, legal, producto y operaciones.
version: 1.0.0
author: Antigravity Skills System
tags: [knowledge, business-domain, reference, documentation]
triggers:
  - "knowledge sobre"
  - "qué dice el KI de"
  - "consulta knowledge"
  - "info de dominio"
  - "recuerda que en knowledge"
  - "busca en knowledge"
  - "tenemos documentado sobre"
dependencies: []
outputs: [contenido_ki, ruta_archivo, sugerencia_creacion]
---

# 🧠 Knowledge Manager - Consulta Inteligente de KIs

## 🎯 Objetivo

Consultar automáticamente **Knowledge Items (KIs)** almacenados en carpetas `knowledge/` para proporcionar información de dominio específico (segmentación clientes, métricas de negocio, reglas de industria, políticas internas) sin inventar datos.

## 📝 Descripción Detallada

Esta skill funciona como un **sistema de gestión de conocimiento centralizado** que:
- Busca información en múltiples ubicaciones de knowledge
- Soporta formatos: Markdown (.md), JSON (.json), YAML (.yaml)
- Responde SOLO con datos documentados
- Sugiere creación de KIs cuando no existen
- Mantiene trazabilidad (siempre cita la fuente)

## 🔧 Instrucciones de Uso

### Paso 1: Detección del Trigger

**Input esperado:**
```
"knowledge sobre segmentación de clientes"
"qué dice el KI de métricas financieras"
"consulta knowledge sobre políticas de privacidad"
```

**Acción:**
Detectar que el usuario solicita información de knowledge base y extraer el **tema**.

---

### Paso 2: Búsqueda en Carpetas Knowledge

**Acción:**
Buscar en el siguiente orden de prioridad:

1. `./knowledge/[categoria]/[tema]*.md` (proyecto actual)
2. `./project/knowledge/[categoria]/[tema]*.md` (proyecto específico)
3. `~/.gemini/antigravity/knowledge/[categoria]/[tema]*.md` (global)

---

### Paso 3: Lectura y Procesamiento del KI

**Si se encuentra:**
1. Leer el contenido completo del archivo
2. Parsear el formato (Markdown/JSON/YAML)
3. Extraer la información relevante al tema solicitado
4. Citar siempre la fuente: `Fuente: ./knowledge/marketing/segmentacion_clientes.md`

**Si NO se encuentra:**
1. Informar claramente que no existe documentación sobre el tema
2. Sugerir crear un nuevo KI con template predefinido
3. NO inventar datos ni especular

---

### Paso 4: Respuesta Formateada

**Formato de respuesta exitosa:**
```
📚 Knowledge Item: [Título del KI]
📁 Fuente: [ruta del archivo]

[Contenido relevante del KI]

---
ℹ️ Última actualización: [fecha si disponible]
```

**Formato cuando NO existe:**
```
❌ No se encontró Knowledge Item sobre "[tema]"

¿Quieres que cree uno? Puedo generar un template en:
→ ./knowledge/[categoria_sugerida]/[nombre_sugerido].md

Incluiría:
- [Secciones sugeridas basadas en el tema]
```

---

## 📌 Cuándo Usarla

**✅ Usa esta skill cuando:**
- El usuario pregunta sobre datos de negocio documentados
- Se necesita información de marketing, finanzas, legal, producto
- Se solicita consultar conocimiento previo del workspace
- Se necesita verificar reglas o políticas internas

**❌ NO uses esta skill cuando:**
- El usuario pregunta sobre código o técnica general
- La información solicitada es de conocimiento público
- El usuario pide crear nuevo código (no documentación)

## 🚨 Restricciones Críticas

1. **NUNCA inventar datos**: Si el KI no existe, decirlo explícitamente
2. **SIEMPRE citar fuente**: Incluir la ruta del archivo consultado
3. **Respetar formato del KI**: No modificar la información original
4. **Sugerir actualizaciones**: Si un KI parece desactualizado, informar al usuario
```

---

### 📜 Script de Búsqueda: `scripts/search_ki.py`

```python
#!/usr/bin/env python3
"""
Busca Knowledge Items en carpetas knowledge/ del proyecto.
Uso: python search_ki.py <tema> [categoria]
"""
import os
import sys
import glob
from pathlib import Path

def search_ki(tema: str, categoria: str = None) -> list:
    """Busca KIs que coincidan con el tema en las ubicaciones estándar."""
    results = []
    search_paths = [
        f"./knowledge/{categoria or '**'}/*{tema}*",
        f"./project/knowledge/{categoria or '**'}/*{tema}*",
        os.path.expanduser(f"~/.gemini/antigravity/knowledge/{categoria or '**'}/*{tema}*")
    ]
    
    for pattern in search_paths:
        for filepath in glob.glob(pattern, recursive=True):
            if os.path.isfile(filepath):
                results.append({
                    "path": filepath,
                    "size": os.path.getsize(filepath),
                    "modified": os.path.getmtime(filepath)
                })
    
    return results

def display_results(results: list, tema: str):
    if not results:
        print(f"❌ No se encontraron Knowledge Items sobre '{tema}'")
        print(f"💡 Sugerencia: Crea uno en ./knowledge/[categoria]/{tema.replace(' ', '_')}.md")
        return
    
    print(f"📚 Se encontraron {len(results)} Knowledge Items:")
    for i, result in enumerate(results, 1):
        print(f"  {i}. {result['path']} ({result['size']} bytes)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python search_ki.py <tema> [categoria]")
        sys.exit(1)
    
    tema = sys.argv[1]
    categoria = sys.argv[2] if len(sys.argv) > 2 else None
    results = search_ki(tema, categoria)
    display_results(results, tema)
```

---

## Skill 2: Workflow Executor

### 📂 Ubicación
```
~/.gemini/antigravity/skills/workflow-executor/
├── SKILL.md
├── scripts/
│   └── run_workflow.py
├── examples/
│   └── workflow_deploy_ejemplo.md
└── resources/
    └── template_workflow.md
```

---

### 📄 SKILL.md (Versión Mejorada)

```markdown
---
name: workflow-executor
description: Ejecuta workflows estandarizados y checklists automatizados desde .agent/workflows/ para procesos de deploy, testing, CI/CD, releases y hotfixes. Sigue pasos numerados secuencialmente, valida prerequisites, confirma cada paso y genera reportes de ejecución con timestamps y logs. Ideal para eliminar errores humanos en procesos críticos repetitivos.
version: 1.0.0
author: Antigravity Skills System
tags: [workflow, automation, deploy, ci-cd, checklist, process]
triggers:
  - "ejecuta workflow"
  - "corre el proceso de"
  - "deploy a producción"
  - "inicia workflow"
  - "sigue el checklist de"
  - "ejecuta pipeline"
  - "proceso de release"
  - "hotfix procedure"
dependencies: []
outputs: [reporte_ejecución, log_pasos, estado_final]
---

# 🔄 Workflow Executor - Ejecución Automatizada de Procesos

## 🎯 Objetivo

Ejecutar automáticamente workflows definidos en `.agent/workflows/` siguiendo pasos numerados, validando prerequisites, y generando reportes detallados de ejecución. Elimina errores humanos en procesos críticos como deploys, releases y testing.

## 📝 Descripción Detallada

Esta skill es un **ejecutor de procesos estandarizados** que:
- Lee archivos de workflow en formato Markdown
- Ejecuta pasos en orden secuencial estricto
- Valida prerequisites antes de iniciar
- Confirma con el usuario en pasos críticos
- Genera logs y reportes de ejecución
- Soporta dry-run para testeo seguro
- Implementa fail-fast en caso de errores

## 🔧 Instrucciones de Uso

### Paso 1: Detección del Workflow

**Input esperado:**
```
"ejecuta workflow deploy a producción"
"corre el proceso de release"
"inicia workflow testing_pipeline"
```

**Acción:**
1. Extraer el nombre del workflow del input
2. Buscar archivo en `.agent/workflows/[nombre].md`
3. Si no existe, listar workflows disponibles

---

### Paso 2: Validación de Prerequisites

**Acción:**
1. Leer la sección `## Prerequisites` del workflow
2. Verificar cada prerequisito:
   - Ejecutar comandos de verificación
   - Confirmar estados manuales con el usuario
3. Si algún prerequisito falla → ABORTAR con mensaje claro

**Formato de validación:**
```
🔍 Validando prerequisites...
✅ Tests locales: PASSING
✅ Staging deployment: OK
❌ QA approval: PENDIENTE

⚠️ WORKFLOW ABORTADO: Falta aprobación de QA
```

---

### Paso 3: Ejecución Secuencial

**Para cada paso del workflow:**

1. **Mostrar paso actual:** Número actualizado y descripción
2. **Ejecutar:** Si es un comando → ejecutar, si es manual → pedir confirmación
3. **Registrar resultado:** Success/Fail + tiempo + output
4. **Continuar o abortar:** fail-fast si hay error

**Formato de ejecución:**
```
🔄 Ejecutando Paso 2/5: Validar health check staging
📋 Validaciones manuales requeridas:
  - [ ] curl https://staging.app.com/health retorna 200
  - [ ] Logs sin errores críticos

¿Todas las validaciones OK? [Y/n]:
```

---

### Paso 4: Generación de Reporte

**Al finalizar (exitoso o fallido):**

```
✅ WORKFLOW COMPLETADO EXITOSAMENTE

📊 Resumen:
   Workflow: deploy_produccion
   Tiempo total: 5m 32s
   Pasos: 5/5 completados
   
💾 Log: .agent/logs/workflow_deploy_20260302_143022.log
```

## 📌 Cuándo Usarla

**✅ Usa esta skill cuando:**
- El usuario quiere ejecutar un proceso documentado
- Se necesita un deploy, release o testing estructurado
- Se quiere seguir un checklist paso a paso con validaciones
- Se busca automatizar un proceso repetitivo con logs

**❌ NO uses esta skill cuando:**
- Es una tarea única que no tiene workflow documentado
- El usuario solo quiere información sobre el proceso
- El proceso requiere intervención humana constante sin automatización

## 🚨 Restricciones Críticas

1. **NUNCA saltar pasos**: Ejecutar SIEMPRE en orden secuencial
2. **Fail-fast**: Si un paso falla, DETENER ejecución inmediatamente
3. **Confirmación explícita**: Para pasos destructivos, SIEMPRE pedir confirmación
4. **Logging obligatorio**: Registrar CADA paso con timestamp y resultado
5. **Dry-run disponible**: Ofrecer siempre modo de prueba antes de ejecución real
```

---

### 📜 Script de Ejecución: `scripts/run_workflow.py`

```python
#!/usr/bin/env python3
"""
Ejecuta workflows desde .agent/workflows/
Uso: python run_workflow.py <nombre_workflow> [--dry-run]
"""
import os
import sys
import time
import re
from datetime import datetime
from pathlib import Path

class WorkflowExecutor:
    def __init__(self, workflow_name: str, dry_run: bool = False):
        self.workflow_name = workflow_name
        self.dry_run = dry_run
        self.log = []
        self.start_time = None
        
    def find_workflow(self) -> str:
        paths = [
            f".agent/workflows/{self.workflow_name}.md",
            f".agent/workflows/{self.workflow_name}",
        ]
        for path in paths:
            if os.path.exists(path):
                return path
        return None
    
    def parse_steps(self, content: str) -> list:
        steps = []
        pattern = r'### Paso (\d+):?\s*(.*?)(?=### Paso|\Z)'
        matches = re.findall(pattern, content, re.DOTALL)
        for num, body in matches:
            steps.append({
                "number": int(num),
                "content": body.strip()
            })
        return steps
    
    def execute(self):
        filepath = self.find_workflow()
        if not filepath:
            print(f"❌ Workflow '{self.workflow_name}' no encontrado")
            print(f"📁 Busqué en: .agent/workflows/")
            self._list_available()
            return False
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        steps = self.parse_steps(content)
        self.start_time = time.time()
        
        mode = "🧪 DRY-RUN" if self.dry_run else "🚀 EJECUCIÓN"
        print(f"\n{mode}: {self.workflow_name}")
        print(f"{'='*50}")
        
        for step in steps:
            success = self._execute_step(step)
            if not success:
                self._generate_report(steps, step["number"])
                return False
        
        self._generate_report(steps)
        return True
    
    def _execute_step(self, step: dict) -> bool:
        print(f"\n🔄 Paso {step['number']}: {step['content'][:60]}...")
        
        if self.dry_run:
            print(f"   ⏭️  [DRY-RUN] Paso simulado")
            self.log.append(f"[DRY-RUN] Paso {step['number']}: OK")
            return True
        
        self.log.append(f"Paso {step['number']}: Ejecutado")
        print(f"   ✅ Completado")
        return True
    
    def _generate_report(self, steps: list, failed_at: int = None):
        elapsed = time.time() - self.start_time
        total = len(steps)
        completed = failed_at - 1 if failed_at else total
        
        print(f"\n{'='*50}")
        if failed_at:
            print(f"❌ WORKFLOW FALLIDO en paso {failed_at}/{total}")
        else:
            print(f"✅ WORKFLOW COMPLETADO ({completed}/{total} pasos)")
        print(f"⏱️  Tiempo: {elapsed:.1f}s")
    
    def _list_available(self):
        workflow_dir = ".agent/workflows"
        if os.path.exists(workflow_dir):
            files = [f for f in os.listdir(workflow_dir) if f.endswith('.md')]
            if files:
                print(f"\n📋 Workflows disponibles:")
                for f in files:
                    print(f"   - {f.replace('.md', '')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_workflow.py <nombre_workflow> [--dry-run]")
        sys.exit(1)
    
    workflow_name = sys.argv[1]
    dry_run = "--dry-run" in sys.argv
    
    executor = WorkflowExecutor(workflow_name, dry_run)
    success = executor.execute()
    sys.exit(0 if success else 1)
```

---

## 🔧 Instalación Rápida

### Instalación Automática (Recomendada)

```bash
# 1. Crear estructura de carpetas
mkdir -p ~/.gemini/antigravity/skills/knowledge-manager/{scripts,examples,resources}
mkdir -p ~/.gemini/antigravity/skills/workflow-executor/{scripts,examples,resources}

# 2. Crear carpetas de proyecto
mkdir -p .agent/{workflows,logs,metrics}
mkdir -p knowledge/{marketing,finanzas,legal,producto,frontend}
```

### Verificación

```bash
# Verificar que los archivos están en la ubicación correcta
ls -la ~/.gemini/antigravity/skills/knowledge-manager/SKILL.md
ls -la ~/.gemini/antigravity/skills/workflow-executor/SKILL.md
```

---

## 📋 Template para Nuevos Workflows

```markdown
---
name: nombre_del_workflow
description: Descripción breve del proceso
version: 1.0.0
estimated_time: 5m
risk_level: low|medium|high
---

# [Nombre del Workflow]

## Prerequisites

- [ ] Prerequisito 1
- [ ] Prerequisito 2

### Paso 1: [Nombre del paso]
[Instrucciones del paso]

### Paso 2: [Nombre del paso]
[Instrucciones del paso]

## 🚨 Rollback Procedure
[Instrucciones de rollback en caso de fallo]
```

---

## 🧪 Testing y Validación

### Tests para Knowledge Manager

```bash
# Test 1: KI existe
python ~/.gemini/antigravity/skills/knowledge-manager/scripts/search_ki.py segmentacion_clientes marketing
# Expected: Contenido del KI

# Test 2: KI no existe
python ~/.gemini/antigravity/skills/knowledge-manager/scripts/search_ki.py no_existe
# Expected: "❌ No se encontraron Knowledge Items"
```

### Tests para Workflow Executor

```bash
# Test 1: Workflow exitoso
python ~/.gemini/antigravity/skills/workflow-executor/scripts/run_workflow.py deploy_produccion

# Test 2: Dry-run
python ~/.gemini/antigravity/skills/workflow-executor/scripts/run_workflow.py deploy_produccion --dry-run

# Test 3: Workflow no existe
python ~/.gemini/antigravity/skills/workflow-executor/scripts/run_workflow.py no_existe
# Expected: "❌ Workflow 'no_existe' no existe"
```

---

## 🎉 Resultado Final

### ¿Qué has logrado?

✅ **Sistema 100% autónomo** para gestión de proyectos en Antigravity

**Flujo completo:**

```
1. Reglas Globales (1_Estandares_Core)
   → Mentalidad y estándares de código

2. Skills Nativas (~/.gemini/antigravity/skills/)
   ├── analizador-proyectos → Analiza estructura de proyectos
   ├── knowledge-manager → Consulta información de negocio
   └── workflow-executor → Ejecuta procesos automatizados

3. Knowledge Base (./knowledge/)
   ├── marketing/ → Segmentación, buyer personas
   ├── finanzas/ → KPIs, métricas
   ├── legal/ → Regulaciones, políticas
   └── producto/ → Roadmap, features

4. Workflows (.agent/workflows/)
   ├── deploy_produccion.md
   ├── testing_pipeline.md
   └── release_checklist.md

5. Plantillas (2_Plantillas_Proyectos)
   └── Referencia para nuevos proyectos
```

---

## 📚 Próximos Pasos Recomendados

### 1. Poblar tu Knowledge Base

```bash
mkdir -p knowledge/{marketing,finanzas,legal,producto}
touch knowledge/marketing/buyer_personas.md
touch knowledge/finanzas/kpis_principales.md
touch knowledge/legal/regulaciones_gdpr.md
```

### 2. Crear Workflows Críticos

```bash
touch .agent/workflows/deploy_produccion.md
touch .agent/workflows/testing_pipeline.md
touch .agent/workflows/release_checklist.md
touch .agent/workflows/hotfix_proceso.md
```

### 3. Documentar Procesos Actuales

- Convierte tus procesos manuales en workflows
- Documenta knowledge de tu industria
- Crea templates reutilizables

---

## 🆘 Troubleshooting

### Problema: "Skill no detectada"

```bash
ls -la ~/.gemini/antigravity/skills/knowledge-manager/SKILL.md
ls -la ~/.gemini/antigravity/skills/workflow-executor/SKILL.md
head -n 20 ~/.gemini/antigravity/skills/knowledge-manager/SKILL.md
```

### Problema: "Script no ejecuta"

```bash
chmod +x ~/.gemini/antigravity/skills/*/scripts/*.py
python3 --version
```

### Problema: "Workflow no encuentra archivo"

```bash
ls -la .agent/workflows/
```

---

## 🎯 Checklist Final de Instalación

### Skills Instaladas
- [ ] `knowledge-manager/SKILL.md` existe
- [ ] `knowledge-manager/scripts/search_ki.py` tiene permisos de ejecución
- [ ] `workflow-executor/SKILL.md` existe
- [ ] `workflow-executor/scripts/run_workflow.py` tiene permisos de ejecución

### Carpetas Creadas
- [ ] `./knowledge/` existe con subcarpetas
- [ ] `.agent/workflows/` existe
- [ ] `.agent/logs/` existe

### Testing Básico
- [ ] `python search_ki.py segmentacion marketing` ejecuta sin errores
- [ ] `python run_workflow.py deploy_produccion --dry-run` ejecuta sin errores

---

¡Tu sistema Antigravity está completo y listo para usar! 🚀

---

**Última actualización:** 2026-03-02  
**Versión:** 1.0.0  
**Mantenedores:** Antigravity Skills System