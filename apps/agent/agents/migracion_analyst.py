"""
🧠 MIGRANT ANALYST AGENT - Analiza proyectos legacy → blueprints
"""

from typing import TypedDict, Annotated
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from pathlib import Path

class AnalystState(TypedDict):
    repo_path: str
    files_analyzed: Annotated[list, add_messages]
    tech_stack: list
    migration_plan: str
    blueprint: str

@tool
def scan_repo(repo_path: str) -> str:
    """Escanea repo legacy y detecta stack tecnológico"""
    files = list(Path(repo_path).rglob("*"))
    tech_detected = []
    
    for f in files[:20]:  # Top 20 files
        if f.suffix == ".py" and "django" in f.read_text()[:1000].lower():
            tech_detected.append("Django")
        elif f.name == "package.json":
            tech_detected.append("React/Node")
        elif f.name == "Cargo.toml":
            tech_detected.append("Rust")
    
    return f"Tech stack: {tech_detected}\nFiles: {len(files)} total"

@tool
def generate_blueprint(stack: str, target: str = "FastAPI + React") -> str:
    """Genera blueprint de migración"""
    blueprints = {
        "Django": "1. Models → Pydantic\n2. Views → FastAPI routers\n3. Templates → React components",
        "React/Node": "1. Components → Next.js App Router\n2. API → tRPC + Prisma"
    }
    return blueprints.get(stack, f"Migrar {stack} → {target}")

def analyst_node(state: AnalystState):
    """Nodo principal del analista"""
    print("🔍 Analizando repo legacy...")
    
    # Usa tools
    scan_result = scan_repo(state["repo_path"])
    stack = "Django"  # Parse de scan_result
    blueprint = generate_blueprint(stack)
    
    return {
        "files_analyzed": [scan_result],
        "tech_stack": [stack],
        "blueprint": blueprint,
        "migration_plan": f"Plan para {state['repo_path']}: {blueprint}"
    }
