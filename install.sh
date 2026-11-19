#!/usr/bin/env bash
set -e

# ANSI Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "\n${BOLD}${CYAN}🚀 Git Workflow Assistant (AgenteGit) - Bash Installer${NC}\n"

REPO_RAW_URL="https://raw.githubusercontent.com/jyovera/agente-git/main"

# Check Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️ Advertencia: No se detectó un repositorio Git en este directorio.${NC}"
    echo -e "Es recomendable ejecutar 'git init' antes de instalar.\n"
fi

echo -e "¿En qué entorno de IA querés instalar la Skill?"
echo -e "  ${BOLD}1)${NC} OpenCode (.opencode/skills/)"
echo -e "  ${BOLD}2)${NC} AntiGravity (.agent/skills/)"
echo -e "  ${BOLD}3)${NC} Ambos (OpenCode + AntiGravity)"
read -p "Elegí una opción [1-3] (por defecto 1): " CHOICE
CHOICE=${CHOICE:-1}

# Download Skill content
TEMP_SKILL=$(mktemp)
curl -sSL "${REPO_RAW_URL}/skills/git-workflow-assistant/SKILL.md" -o "$TEMP_SKILL"

if [ "$CHOICE" == "1" ] || [ "$CHOICE" == "3" ]; then
    mkdir -p .opencode/skills/git-workflow-assistant
    cp "$TEMP_SKILL" .opencode/skills/git-workflow-assistant/SKILL.md
    echo -e "  ${GREEN}✔${NC} Instalada en .opencode/skills/git-workflow-assistant/SKILL.md"
fi

if [ "$CHOICE" == "2" ] || [ "$CHOICE" == "3" ]; then
    mkdir -p .agent/skills/git-workflow-assistant
    cp "$TEMP_SKILL" .agent/skills/git-workflow-assistant/SKILL.md
    echo -e "  ${GREEN}✔${NC} Instalada en .agent/skills/git-workflow-assistant/SKILL.md"
fi

rm -f "$TEMP_SKILL"

# Initialize ACTIVE_WORK.md if not exists
if [ ! -f "ACTIVE_WORK.md" ]; then
    GIT_USER=$(git config user.name || echo "developer")
    cat <<EOF > ACTIVE_WORK.md
# 📋 Registro de Trabajo Activo (Active Work Log)

> Cada desarrollador gestiona sus tareas en su propia sección para evitar colisiones de IDs y conflictos de merge en Git.

---

## 👤 @${GIT_USER}

| Código | Título del Issue | Prioridad | Qué se corrigió / creó (Breve descripción) | Archivos afectados | Commit Local | Enviado a Dev | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
EOF
    echo -e "  ${GREEN}✔${NC} Inicializado ACTIVE_WORK.md con la sección @${GIT_USER}"
else
    echo -e "  ℹ ACTIVE_WORK.md ya existe en el proyecto. No fue modificado."
fi

echo -e "\n${BOLD}${GREEN}🎉 ¡Instalación completada con éxito!${NC}\n"
