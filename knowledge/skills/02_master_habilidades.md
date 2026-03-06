# Master-Habilidades - Documentación Mejorada

---
**name:** master-habilidades  
**description:** Crea nuevas habilidades (skills) para Antigravity en español con estructura completa: YAML frontmatter válido, instrucciones paso a paso, ejemplos de uso y assets opcionales (scripts, plantillas, casos de prueba). Úsala cuando el usuario pida "crea una skill para [tarea]", "genera habilidad [nombre]", "automatiza [proceso]" o "necesito una herramienta que haga [x]".

---

## 🎯 Objetivo Principal

Generar skills nuevas en español de forma automática, completa y siguiendo los estándares de Antigravity:

- ✅ YAML frontmatter preciso y semánticamente rico
- ✅ Instrucciones claras, numeradas y accionables
- ✅ Casos de uso concretos con ejemplos
- ✅ Assets opcionales (scripts, plantillas, ejemplos)
- ✅ Validación y testing de la skill generada

---

## 📋 Instrucciones Paso a Paso

### **Paso 1: Análisis de la Solicitud**

**Objetivo:** Determinar si realmente se necesita una nueva skill o es una petición puntual.

**Preguntas clave:**
- ¿Es una tarea repetitiva que se hará múltiples veces?
- ¿Tiene pasos claros y definidos que pueden automatizarse?
- ¿El usuario necesita reutilizar este proceso en el futuro?
- ¿Ya existe una skill similar en el sistema?

**Acción:**
- Si la respuesta a las primeras 3 preguntas es **SÍ** → Continúa con la creación
- Si la respuesta es **NO** → Ejecuta la tarea directamente sin crear skill
- Si existe una skill similar → Pregunta al usuario si prefiere modificar la existente o crear una nueva

**Ejemplo:**
```
❌ Petición puntual: "Traduce este texto al inglés"
   → No crear skill, ejecutar traducción directamente

✅ Requiere skill: "Crea una herramienta que traduzca documentos técnicos del español al inglés manteniendo formato"
   → Crear skill 'traductor-tecnico-es-en'
```

---

### **Paso 2: Identificación del Tipo de Skill**

**Objetivo:** Clasificar la skill según su naturaleza para estructurarla correctamente.

**Tipos de Skills:**

| Tipo | Indicadores | Carpetas Requeridas |
|------|-------------|---------------------|
| **Automatización** | "script", "automatizar", "ejecutar" | `scripts/` + `SKILL.md` |
| **Transformación** | "convertir", "formatear", "procesar" | `examples/` + `resources/` + `SKILL.md` |
| **Generación** | "crear", "generar", "producir" | `templates/` + `examples/` + `SKILL.md` |
| **Análisis** | "analizar", "validar", "revisar" | `tests/` + `examples/` + `SKILL.md` |
| **Integración** | "conectar", "integrar", "sincronizar" | `scripts/` + `config/` + `SKILL.md` |

**Acción:** Selecciona el tipo más adecuado y prepara las carpetas necesarias.

---

### **Paso 3: Generación del Frontmatter YAML**

**Objetivo:** Crear metadatos precisos y semánticamente ricos para el matching automático.

**Estructura obligatoria:**

```yaml
---
name: nombre-de-la-skill
description: Descripción clara y semántica de la skill (mínimo 15 palabras)
version: 1.0.0
author: Antigravity Master Skills
tags: [categoría, tipo, dominio]
triggers: 
  - "frase que activa la skill"
  - "otra frase de activación"
dependencies: []
outputs: [tipo de output esperado]
---
```

**Reglas de `name`:**
- Minúsculas con guiones (kebab-case)
- Descriptivo y único
- Máximo 3 palabras
- Evitar genéricos como "helper", "utils"

**Reglas de `description`:**
- Mínimo 15 palabras para mejor matching semántico
- Incluir verbos de acción específicos
- Mencionar casos de uso concretos
- Formato: "[Verbo] [objeto] [contexto/restricción]"

**Ejemplo:**
```yaml
---
name: validador-commits-conventional
description: Valida mensajes de commits Git siguiendo la especificación Conventional Commits (feat, fix, docs, etc.), verifica el formato correcto del header, scope y breaking changes, y sugiere correcciones si el formato es inválido
version: 1.0.0
author: Antigravity Master Skills
tags: [git, commits, validación, conventional-commits]
triggers:
  - "valida este commit"
  - "verifica formato conventional commits"
  - "revisa mi mensaje de commit"
dependencies: []
outputs: [validación_resultado, sugerencias_corrección]
---
```

---

### **Paso 4: Escritura del Cuerpo del SKILL.md**

**Objetivo:** Crear documentación clara, estructurada y accionable.

**Estructura recomendada:**

```markdown
# [Nombre de la Skill en Título]

## 🎯 Objetivo
[Explicación clara de qué hace la skill en 2-3 líneas]

## 📝 Descripción Detallada
[Contexto adicional, casos de uso principales, problemas que resuelve]

## 🔧 Instrucciones de Uso

### Paso 1: [Nombre del paso]
[Descripción clara y específica]

## 📌 Cuándo Usarla

**✅ Usa esta skill cuando:**
- [Caso de uso 1]
- [Caso de uso 2]

**❌ NO uses esta skill cuando:**
- [Caso que no aplica 1]
- [Caso que no aplica 2]

## 🚨 Restricciones y Validaciones
1. **[Restricción 1]**: [Explicación y razón]
2. **[Restricción 2]**: [Explicación y razón]

## 💡 Ejemplos de Uso

### Ejemplo 1: [Caso común]
**Input:** [Input del usuario]
**Proceso:** [Pasos que sigue el agente]
**Output:** [Resultado generado]

## 🔗 Assets Relacionados
- `scripts/nombre_script.py` - [Descripción]
- `examples/caso_1.json` - [Descripción]

## 📊 Testing y Validación
**Criterios de éxito:**
- [ ] [Criterio 1]
- [ ] [Criterio 2]

## 🔄 Changelog
### v1.0.0 (YYYY-MM-DD)
- Versión inicial
```

---

### **Paso 5: Generación de Assets Opcionales**

**Objetivo:** Crear archivos de soporte según el tipo de skill.

#### **5.1 Scripts (`scripts/`)**

**Cuándo crear:** Si la skill ejecuta comandos, procesa archivos o requiere lógica compleja.

```python
# scripts/ejecutar_skill.py
"""
Descripción: Script de ejecución para [nombre-skill]
Autor: Antigravity Master Skills
Versión: 1.0.0
"""
import sys
import json
from typing import Dict, Any

def main(input_data: Dict[str, Any]) -> Dict[str, Any]:
    if not validate_input(input_data):
        return {"error": "Input inválido"}
    result = process(input_data)
    if not validate_output(result):
        return {"error": "Output inválido"}
    return result

def validate_input(data: Dict[str, Any]) -> bool:
    required_keys = ["key1", "key2"]
    return all(key in data for key in required_keys)

def process(data: Dict[str, Any]) -> Dict[str, Any]:
    pass

def validate_output(result: Dict[str, Any]) -> bool:
    return "result" in result and result["result"] is not None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python ejecutar_skill.py <input.json>")
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    output = main(input_data)
    print(json.dumps(output, indent=2, ensure_ascii=False))
```

#### **5.2 Ejemplos (`examples/`)**

**Cuándo crear:** Siempre. Ayuda al agente a entender el comportamiento esperado.

```
examples/
├── input_basico.json
├── input_complejo.json
├── input_edge_case.json
├── output_esperado_basico.json
├── output_esperado_complejo.json
└── README.md
```

#### **5.3 Plantillas (`templates/`)**

**Cuándo crear:** Si la skill genera documentos o archivos con estructura fija.

#### **5.4 Tests (`tests/`)**

**Cuándo crear:** Para skills críticas o complejas.

---

### **Paso 6: Ejecución del Script Generador (Opcional)**

```bash
python scripts/generar_skill.py "nombre-de-la-skill" --tipo automatizacion
```

### **Paso 7: Confirmación y Preview**

**Objetivo:** Mostrar al usuario un resumen de lo creado antes de finalizar.

---

## 💡 Ejemplos de Uso Completos

### **Ejemplo 1: Skill de Automatización**

**Input del usuario:**
```
"Crea una skill para generar commits siguiendo Conventional Commits"
```

**Output generado:**

```yaml
---
name: commits-conventional-generator
description: Genera mensajes de commits Git siguiendo la especificación Conventional Commits con validación automática del formato (type, scope, subject), sugerencias contextuales basadas en archivos modificados y verificación de breaking changes. Ideal para mantener un historial de commits limpio y semántico en proyectos profesionales.
version: 1.0.0
author: Antigravity Master Skills
tags: [git, commits, conventional-commits, automatización, validación]
triggers:
  - "genera commit conventional"
  - "crea mensaje de commit"
  - "valida mi commit"
  - "conventional commit para estos cambios"
dependencies: ["git"]
outputs: [mensaje_commit_validado, sugerencias_tipo, breaking_changes]
---
```

### **Ejemplo 2: Skill de Transformación**

**Input del usuario:**
```
"Necesito automatizar la conversión de CSVs a formato JSON con validación de esquema"
```

---

## 🚨 Restricciones y Mejores Prácticas

### **Restricciones Obligatorias**

1. **Idioma:** Todo en español
2. **No Sobrescritura:** Verificar si existe una skill con el mismo nombre antes de crear
3. **Simplicidad:** Máximo 3 subcarpetas por skill
4. **Validación YAML:** Verificar que el frontmatter YAML sea válido
5. **Semántica:** La `description` debe ser suficientemente específica para matching automático

### **Mejores Prácticas Adicionales**

#### **1. Naming Conventions**
```
✅ Buenos nombres: validador-commits-conventional, generador-reportes-pdf
❌ Malos nombres: helper, utils-tool, my-skill
```

#### **2. Descriptions Efectivas**
- Mínimo 15 palabras para mejor matching semántico
- Incluir verbos de acción específicos

#### **3. Triggers Comprehensivos**
- Cubrir variaciones del lenguaje natural

#### **4. Ejemplos Realistas**
- Casos reales, edge cases comunes, errores típicos

---

## 📊 Checklist de Validación Pre-Entrega

### **Estructura y Formato**
- [ ] El `name` sigue kebab-case y es único
- [ ] La `description` tiene mínimo 15 palabras
- [ ] El YAML es válido
- [ ] Existen al menos 3 `triggers` con variaciones

### **Contenido del SKILL.md**
- [ ] El objetivo está claramente definido
- [ ] Las instrucciones son numeradas y accionables
- [ ] Incluye sección "Cuándo usarla" con ejemplos concretos
- [ ] Incluye sección "Cuándo NO usarla"
- [ ] Las restricciones están documentadas

### **Assets (si aplica)**
- [ ] Los scripts tienen docstrings y comments en español
- [ ] Los ejemplos incluyen pares input/output
- [ ] Las plantillas tienen variables claramente marcadas
- [ ] Los tests cubren casos básicos y edge cases

### **Calidad General**
- [ ] Todo está en español consistentemente
- [ ] No hay errores de ortografía o gramática
- [ ] Los paths de archivos son válidos
- [ ] La estructura de carpetas es simple y clara

---

## 🔄 Workflow de Creación (Diagrama)

```
┌─────────────────────────────────────────────┐
│ 1. Usuario solicita crear skill            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. Analizar: ¿Es repetitiva/automatizable? │
└─────────────────┬───────────────────────────┘
                  │
           ┌──────┴──────┐
           │             │
          SÍ            NO
           │             │
           ▼             ▼
┌──────────────────┐  ┌────────────────────┐
│ 3. Identificar   │  │ Ejecutar tarea     │
│    tipo de skill │  │ directamente       │
└────────┬─────────┘  └────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ 4. Generar frontmatter YAML                  │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ 5. Escribir SKILL.md                         │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ 6. Generar assets (scripts, examples, etc.) │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ 7. Validar con checklist                    │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ 8. Mostrar preview y confirmar con usuario  │
└──────────────────────────────────────────────┘
```

---

## 🎓 Casos de Uso Avanzados

### **Caso 1: Skill con Múltiples Sub-Skills**
Cuando una tarea es muy compleja, considera crear una skill "orquestadora" que llame a otras skills.

### **Caso 2: Skill con Configuración Personalizable**
Para skills que necesitan adaptarse a diferentes contextos.

### **Caso 3: Skill con Integración Externa**
Skills que conectan con APIs o servicios externos.

---

## 📚 Recursos y Referencias

### **Documentación Oficial de Antigravity**
- Skills Documentation
- Best Practices
- Skill Examples

### **Herramientas Útiles**
- **YAML Validator**: https://www.yamllint.com/
- **Markdown Preview**: VSCode extension "Markdown All in One"
- **JSON Schema Validator**: https://www.jsonschemavalidator.net/

---

## 🔄 Changelog

### v2.0.0 (2026-03-02)
- ✨ Refactorización completa del documento
- ➕ Agregado: Checklist de validación pre-entrega
- ➕ Agregado: Casos de uso avanzados
- ➕ Agregado: Ejemplos completos con código
- ➕ Agregado: Mejores prácticas detalladas
- ➕ Agregado: Workflow visual de creación
- 📝 Mejorado: Estructura de instrucciones más clara
- 📝 Mejorado: Ejemplos de frontmatter YAML más ricos
- 📝 Mejorado: Sección de assets con templates de código

### v1.0.0 (Original)
- 🎉 Versión inicial

---

## 💬 Feedback y Mejoras

Si encuentras áreas de mejora en esta skill o tienes sugerencias, considera:

1. **Documentar el caso de uso específico** que no está cubierto
2. **Proponer mejoras al formato** de SKILL.md o assets
3. **Compartir ejemplos reales** que podrían agregarse
4. **Sugerir nuevas validaciones** para el checklist

---

**Última actualización:** 2026-03-02  
**Versión:** 2.0.0  
**Mantenedor:** Antigravity Master Skills System