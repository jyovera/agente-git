# AgenteGit: Git Workflow Assistant Skill

A portable, 100% stack-agnostic AI agent skill that automates Git and GitHub workflows with mandatory human approval, divergence safety checks, client hook coexistence (Husky, pre-commit), and collision-free change traceability.

Compatible with **OpenCode** and **AntiGravity**.

---

## 🚀 Quick Start & Installation

Install the skill in any client project with a single command:

### Option A: Using `npx` (Recommended for Node.js environments)
Open a terminal in your project repository and run:
```bash
npx github:jyovera/agente-git init
```

### Option B: Using `curl` & Bash (Stack-agnostic, zero dependencies)
Ideal for Python, Go, Java, C#, PHP, Rust, or any environment without Node.js:
```bash
curl -sSL https://raw.githubusercontent.com/jyovera/agente-git/main/install.sh | bash
```

Both options will:
1. Prompt you to select your target AI environment: **OpenCode**, **AntiGravity**, or **Both**.
2. Install `SKILL.md` in the proper directory (`.opencode/skills/` or `.agent/skills/`).
3. Initialize `ACTIVE_WORK.md` in your repository with your personal developer section.

---

## 🎯 Key Capabilities

- **Human-in-the-Loop Approval (MANDATORY)**: The agent never executes `git commit` or `git push` without presenting the diff summary, proposing a message, and waiting for explicit user confirmation.
- **Pre-Push Divergence Detection**: Before pushing to shared branches (`dev`, `main`, etc.), the agent runs `git fetch` and evaluates `ahead` vs `behind` commit counts. If the remote has new commits, it warns you and guides synchronization (`rebase`/`merge`) to prevent rejected pushes.
- **Collision-Free Change Traceability (`ACTIVE_WORK.md`)**: Tasks are registered before code modification with a recommended title, user-selected priority (`Alta` / `Media` / `Baja`), and namespaced IDs (e.g. `JYO-001`, `CAR-001`). Dedicated tables per developer prevent Git merge conflicts.
- **Pre-Push Functional Verification Gate**: The agent executes the project's tests/build checks after rebase before offering push confirmation.
- **Zero Runtime Dependencies**: The skill itself uses pure native `git` CLI commands.
- **Hook Coexistence**: Respects existing client safety mechanisms (Husky, Python `pre-commit`, native `.git/hooks`). Never runs with `--no-verify`.

---

## 📂 Repository Structure

```text
AgenteGit/
├── bin/
│   └── cli.js                  # npx scaffolding runner
├── skills/
│   └── git-workflow-assistant/
│       └── SKILL.md            # The portable, stack-agnostic skill definition
├── install.sh                  # One-line Bash installer
├── package.json                # npm manifest for npx execution
├── .gitignore                  # Ignores local IDE setups (.opencode, .agent, etc.)
└── README.md                   # Installation & usage documentation
```

---

## 📋 Example: `ACTIVE_WORK.md`

```markdown
# 📋 Registro de Trabajo Activo (Active Work Log)

## 👤 @jyovera

| Código | Título del Issue | Prioridad | Qué se corrigió / creó (Breve descripción) | Archivos afectados | Commit Local | Enviado a Dev | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **JYO-001** | Inicializar app base y skill | Alta | Estructura base de app.js y configuración inicial de skill | `app.js`, `.gitignore` | `72c8ebd` | ✅ Enviado | Completado |
| **JYO-002** | Agregar función despedir | Media | Se implementó despedir() y se resolvió conflicto de rebase | `app.js` | `ad8dcfc` | ✅ Enviado | Completado |
| **JYO-003** | Validar parámetro de nombre | Media | Se implementó validarNombre() para evitar valores vacíos | `app.js` | `bacfbe5` | ✅ Enviado | Completado |
```

---

## 💬 Natural Language Interaction Examples

Once installed, talk to your agent in Spanish or English:

### 1. Registering an Issue
> **User**: *"Quiero agregar validación de email en el login"*  
> **Agent**:
> ```text
> 🎯 Nuevo Issue para ACTIVE_WORK.md:
> - Código: JYO-004
> - Título recomendado: Validar formato de email en login
> - Responsable: @jyovera
> 
> ❓ ¿Qué nivel de prioridad le asignamos? (1: Alta, 2: Media, 3: Baja)
> ```

### 2. Preparing a Local Commit
> **User**: *"Quiero hacer el commit de los cambios locales"*  
> **Agent**:
> ```text
> 📋 Inspección de cambios locales:
> - Issue: JYO-004 (Validar formato de email en login)
> - Prioridad: Alta
> - Responsable: @jyovera
> - Qué se corrigió / creó: Se implementó expresión regular para validar emails
> - Archivos: src/auth.js, ACTIVE_WORK.md
> 
> 📝 Propuesta de commit (Conventional Commits):
> > feat(auth): validate email format in login (#JYO-004)
> 
> ⚠️ ¿Aprobás realizar este commit en tu máquina local?
> ```

### 3. Pushing to `dev` with Divergence Verification
> **User**: *"Quiero subir los cambios a dev"*  
> **Agent**:
> Runs `git fetch origin dev` and `git rev-list --left-right --count HEAD...origin/dev`.
> - **If Divergence (`Behind > 0`)**: Warns you that teammates pushed commits, displays remote commit log, and suggests `git pull --rebase origin dev`.
> - **If Clean (`Behind == 0`)**: Runs tests/smoke checks (`Step 2.5`), reports green results, and requests final push authorization.

---

## 🛡️ License

MIT License.
