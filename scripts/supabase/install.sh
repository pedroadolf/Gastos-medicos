#!/bin/zsh
# 🚀 SETUP SECUENCIAL - Antigravity Migración Ecosistema

echo "📦 Paso 1/4: Entorno virtual..."
python3.11 -m venv venv  # Python 3.11+ para LangGraph/ChromaDB
source venv/bin/activate

echo "📦 Paso 2/4: Dependencias..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔧 Paso 3/4: Playwright browsers..."
playwright install --with-deps

echo "⚙️  Paso 4/4: Git config + .env..."
cp .env.example .env 2>/dev/null || touch .env
git config core.hooksPath .githooks 2>/dev/null || true

echo "✅ ¡Workspace listo! Ejecuta: make run"
