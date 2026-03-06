#!/bin/zsh
# 🚀 CREATE NEW PROJECT FROM TEMPLATE - 2026 Edition

PROJECT_NAME=${1:-"nuevo-proyecto"}
TEMPLATE_URL="https://github.com/pedroadolf/ecosistema-migracion.git"

echo "🚀 Creando $PROJECT_NAME desde template elite..."

# 1. Clone + rename
git clone $TEMPLATE_URL $PROJECT_NAME
cd $PROJECT_NAME

# 2. Rompe vínculo + nuevo git (TU GENIAL IDEA)
rm -rf .git
git init
git add .
git commit -m "🎉 initial: Antigravity Ecosystem v1.0.0 - $PROJECT_NAME"

# 3. Setup automático
chmod +x install.sh
./install.sh

echo "✅ Proyecto '$PROJECT_NAME' listo!"
echo "📁 cd $PROJECT_NAME"
echo "🔑 nano .env     # API keys"
echo "🚀 make run      # Agentes ON"
echo ""
echo "💡 Para GitHub nuevo:"
echo "   gh repo create $PROJECT_NAME --public --push"
