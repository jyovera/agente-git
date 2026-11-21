#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILL_SOURCE = path.join(ROOT_DIR, 'skills', 'git-workflow-assistant', 'SKILL.md');

// ANSI Colors
const reset = '\x1b[0m';
const green = '\x1b[32m';
const cyan = '\x1b[36m';
const yellow = '\x1b[33m';
const bold = '\x1b[1m';
const dim = '\x1b[2m';

console.log(`\n${bold}${cyan}🚀 Git Workflow Assistant (AgenteGit) - Setup${reset}\n`);

// Helper to ask question in terminal
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim());
    }));
}

// Helper to detect Git user
function getGitUser() {
    try {
        const name = execSync('git config user.name', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        return name || 'developer';
    } catch {
        return 'developer';
    }
}

// Generate 3-letter prefix
function getPrefix(username) {
    const clean = username.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return clean.slice(0, 3) || 'DEV';
}

async function main() {
    const targetDir = process.cwd();

    // Verify if we are inside a Git repo
    if (!fs.existsSync(path.join(targetDir, '.git'))) {
        console.log(`${yellow}⚠️ Advertencia: No se detectó un repositorio Git en este directorio.${reset}`);
        console.log(`${dim}Es recomendable inicializar Git con 'git init' antes de instalar.${reset}\n`);
    }

    console.log(`¿En qué entorno de IA querés instalar la Skill?`);
    console.log(`  ${bold}1)${reset} OpenCode (.opencode/skills/)`);
    console.log(`  ${bold}2)${reset} AntiGravity (.agent/skills/)`);
    console.log(`  ${bold}3)${reset} Ambos (OpenCode + AntiGravity)`);

    let choice = await askQuestion(`\nElegí una opción [1-3] (por defecto 1): `);
    if (!choice) choice = '1';

    const installOpenCode = choice === '1' || choice === '3';
    const installAntiGravity = choice === '2' || choice === '3';

    if (!fs.existsSync(SKILL_SOURCE)) {
        console.error(`${yellow}❌ Error: No se encontró el archivo de la Skill en ${SKILL_SOURCE}${reset}`);
        process.exit(1);
    }

    const skillContent = fs.readFileSync(SKILL_SOURCE, 'utf-8');

    // Install in OpenCode
    if (installOpenCode) {
        const opencodeDir = path.join(targetDir, '.opencode', 'skills', 'git-workflow-assistant');
        fs.mkdirSync(opencodeDir, { recursive: true });
        fs.writeFileSync(path.join(opencodeDir, 'SKILL.md'), skillContent);
        console.log(`  ${green}✔${reset} Instalada en ${dim}.opencode/skills/git-workflow-assistant/SKILL.md${reset}`);
    }

    // Install in AntiGravity
    if (installAntiGravity) {
        const antigravityDir = path.join(targetDir, '.agent', 'skills', 'git-workflow-assistant');
        fs.mkdirSync(antigravityDir, { recursive: true });
        fs.writeFileSync(path.join(antigravityDir, 'SKILL.md'), skillContent);
        console.log(`  ${green}✔${reset} Instalada en ${dim}.agent/skills/git-workflow-assistant/SKILL.md${reset}`);
    }

    // Initialize ACTIVE_WORK.md if not present
    const activeWorkPath = path.join(targetDir, 'ACTIVE_WORK.md');
    if (!fs.existsSync(activeWorkPath)) {
        const user = getGitUser();
        const initialActiveWork = `# 📋 Registro de Trabajo Activo (Active Work Log)

> Cada desarrollador gestiona sus tareas en su propia sección para evitar colisiones de IDs y conflictos de merge en Git.

---

## 👤 @${user}

| Código | Título del Issue | Prioridad | Qué se corrigió / creó (Breve descripción) | Archivos afectados | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
`;
        fs.writeFileSync(activeWorkPath, initialActiveWork);
        console.log(`  ${green}✔${reset} Inicializado ${dim}ACTIVE_WORK.md${reset} con tu sección @${user}`);
    } else {
        console.log(`  ${dim}ℹ ACTIVE_WORK.md ya existe en el proyecto. No fue modificado.${reset}`);
    }

    console.log(`\n${bold}${green}🎉 ¡Instalación completada con éxito!${reset}`);
    console.log(`\n${dim}A partir de ahora podés pedirle a tu agente en lenguaje natural:${reset}`);
    console.log(`  • "${cyan}Quiero hacer el commit de mis cambios locales${reset}"`);
    console.log(`  • "${cyan}Quiero subir mis cambios a la rama dev${reset}"\n`);
}

main().catch(err => {
    console.error(`\n❌ Error durante la instalación:`, err);
    process.exit(1);
});
