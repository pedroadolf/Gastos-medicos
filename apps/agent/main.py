#!/usr/bin/env python3
"""
🚀 ORQUESTADOR MAESTRO - Migración Ecosistema
Lee .antigravity/rules.md → Ejecuta secuencia → Swarm de agentes
"""

import os
import sys
# import yaml  # Removido si no se requiere por el momento
from pathlib import Path
from typing import List, Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
# from langchain_core.prompts import PromptTemplate
# from langchain_openai import ChatOpenAI  # Cambia por tu LLM
# from dotenv import load_dotenv

# # Carga entorno (descomentar si la instalas)
# load_dotenv()

# Cambiar contexto al root
os.chdir(Path(__file__).parent.parent)

class ProjectState(TypedDict):
    """Estado compartido entre nodos"""
    plan: str
    skills_loaded: List[str]
    artifacts: List[str]
    current_step: int
    knowledge: Dict[str, Dict[str, str]]

def _load_knowledge() -> Dict[str, Dict[str, str]]:
    """Carga knowledge/ automáticamente"""
    knowledge = {}
    for domain in ["frontend", "marketing", "skills", "rules"]:
        path = Path("knowledge") / domain
        if path.exists():
            knowledge[domain] = {
                f.name: Path(f).read_text() 
                for f in path.rglob("*") if f.suffix in [".md", ".css", ".ts"]
            }
    return knowledge

def load_rules() -> List[Dict[str, str]]:
    """Parsea .antigravity/rules.md → Secuencia ejecutable"""
    rules_path = Path(".antigravity/rules.md")
    if not rules_path.exists():
        return [{"step": "error", "action": "Crear .antigravity/rules.md"}]
    
    content = rules_path.read_text()
    steps = []
    
    # Parsea secciones Markdown ## → Pasos numerados
    lines = content.split("\n")
    current_step = {}
    
    for line in lines:
        if line.startswith("## ") and ":" in line:
            if current_step:
                steps.append(current_step)
            current_step = {"step": line.split(":")[0][3:], "action": ""}
        elif line.strip() and current_step:
            current_step["action"] += line + "\n"
    
    if current_step:
        steps.append(current_step)
    
    return steps

# Nodos del grafo
def planning_node(state: ProjectState) -> ProjectState:
    """Nodo 1: Genera PLAN.md"""
    print("📋 PASO 1: PLANIFICACIÓN...")
    
    rules = load_rules()
    knowledge_summary = "\n".join([f"{k}: {len(v)} files" for k, v in state.get("knowledge", {}).items()])
    
    prompt = f"""
    Basado en estas REGLAS: {rules[0]['action'] if len(rules)>0 else ''}
    Conocimiento disponible: {knowledge_summary}
    """
    
    # Aquí tu LLM (Gemini/Antigravity)
    plan = "PLAN EJECUTABLE: Paso 1 → Skills → Code → Test"  # Placeholder
    
    Path("artifacts").mkdir(exist_ok=True)
    Path("artifacts/PLAN.md").write_text(plan)
    
    artifacts = state.get("artifacts", []) + ["PLAN.md"]
    return {"plan": plan, "artifacts": artifacts}

def skills_node(state: ProjectState) -> ProjectState:
    """Nodo 2: Carga skills del conocimiento"""
    print("🛠️ PASO 2: SKILLS SETUP...")
    
    # Lee master skills
    skills_dict = state.get("knowledge", {}).get("skills", {})
    master_skills = skills_dict.get("02_master_habilidades.md", "")
    skills_loaded = ["analizador", "blueprint"]  # Parse real aquí
    
    print(f"✅ Cargadas {len(skills_loaded)} skills")
    return {"skills_loaded": skills_loaded}

def execution_node(state: ProjectState) -> ProjectState:
    """Nodo 3: Ejecuta agentes según rules"""
    print("🚀 PASO 3: EJECUCIÓN...")
    
    rules = load_rules()
    rules_dict = state.get("knowledge", {}).get("rules", {})
    agent_prompt = rules_dict.get("03_agent_prompt.md", "")
    
    # Aquí spawneas agents/ según el plan
    print(f"🧠 Ejecutando con prompt: {agent_prompt[:100] if agent_prompt else 'No prompt found'}...")
    
    # Placeholder para tu lógica de agents
    artifacts = state.get("artifacts", []) + ["agent_output.json"]
    return {"artifacts": artifacts}

def artifacts_node(state: ProjectState) -> ProjectState:
    """Nodo 4: Tests + Report final"""
    print("✅ PASO 4: TESTING & ARTIFACTS...")
    
    # Playwright tests, screenshots, etc.
    report = f"""
    # RESULTADO FINAL
    Plan: {state.get('plan', '')[:100]}...
    Skills: {state.get('skills_loaded', [])}
    Artifacts: {state.get('artifacts', [])}
    """
    
    Path("artifacts/RESULTADO.md").write_text(report)
    print("🎉 Workspace completo!")
    
    return state # state passed is merged and returns fully modified here for typed-dict

# Construye grafo
def build_orchestrator():
    workflow = StateGraph(ProjectState)
    
    workflow.add_node("planning", planning_node)
    workflow.add_node("skills", skills_node)
    workflow.add_node("execution", execution_node)
    workflow.add_node("artifacts", artifacts_node)
    
    # Secuencia fija desde rules.md
    workflow.set_entry_point("planning")
    workflow.add_edge("planning", "skills")
    workflow.add_edge("skills", "execution")
    workflow.add_edge("execution", "artifacts")
    workflow.add_edge("artifacts", END)
    
    return workflow.compile()

def main():
    """Entry point universal"""
    print("🚀 Iniciando Orquestador Migración Ecosistema...")
    
    app = build_orchestrator()
    initial_state = {
        "plan": "",
        "skills_loaded": [],
        "artifacts": [],
        "current_step": 0,
        "knowledge": _load_knowledge()
    }
    
    # Ejecuta secuencia completa
    final_state = app.invoke(initial_state)
    
    print("\n✅ SECUENCIA COMPLETA:")
    print(f"Plan generado: artifacts/PLAN.md")
    print(f"Skills cargadas: {final_state.get('skills_loaded', [])}")
    print(f"Artifacts: {final_state.get('artifacts', [])}")
    print("\nPróximo: git add . && git commit -m 'feat: $(cat artifacts/PLAN.md | head -1)'")

if __name__ == "__main__":
    main()
