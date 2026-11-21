---
name: git-workflow-assistant
description: "Human-in-the-loop Git and GitHub assistant with multi-developer change traceability. Trigger: commit changes, push to dev/main, branch sync checks, divergence analysis, active work tracking, or safe Git operations across any stack."
license: MIT
metadata:
  version: "1.5.0"
  stack: "agnostic"
---

# Git Workflow Assistant

A portable, stack-agnostic skill that automates Git operations with mandatory human-in-the-loop approval, safe divergence checks, coexistence with existing repository hooks (such as Husky or native pre-commit), and collision-free multi-developer atomic change traceability through `ACTIVE_WORK.md`.

## Core Principles

1. **Human-in-the-Loop Gate (MANDATORY)**: Never execute `git commit` or `git push` without presenting the plan, diff summary, and receiving explicit human confirmation.
2. **Atomic Traceability via Namespaced Sections**: To prevent merge conflicts and duplicate issue IDs in collaborative teams, `ACTIVE_WORK.md` is partitioned into dedicated sections per developer (`## 👤 @username`). Issue codes use user-specific prefixes (e.g. `JYO-001`, `CAR-001`), guaranteeing zero ID collisions. All traceability updates are committed **atomically** in the same transaction as code changes (`git add <files> ACTIVE_WORK.md`), preventing dirty working trees and ensuring remote sync.
3. **Stack Agnostic**: Rely solely on standard `git` CLI commands. Never introduce runtime dependencies (Node.js, Python, etc.) into the target repository.
4. **Never Bypass Client Hooks**: Never append `--no-verify` or `-n`. If a client hook (Husky, pre-commit, linters) fails, inspect the error output, present it to the user, and fix the root cause.
5. **Divergence-First Pushing**: Before pushing to any branch (especially shared branches like `dev` or `main`), inspect remote state with `git fetch` and evaluate how many commits ahead and behind the local branch is.
6. **Mandatory Functional Verification**: Never push unverified or newly-rebased code without executing the project's verification/test checks.

---

## Workflow 0: Namespaced Traceability (`ACTIVE_WORK.md`)

Whenever work begins on a fix, improvement, or feature:

### 0.1 Initialization & Structure of `ACTIVE_WORK.md`
Check if `ACTIVE_WORK.md` exists in the repository root. If not, initialize it with a top-level header:

```markdown
# 📋 Registro de Trabajo Activo (Active Work Log)
```

### 0.2 Developer Detection & Prefix Generation
1. Extract current developer identity:
   ```bash
   git config user.name
   ```
2. Derive a 3-letter uppercase prefix based on the developer handle or name:
   - `@worker` -> Prefix: `WRK`
   - `@carlos` -> Prefix: `CAR`
   - `@maria` -> Prefix: `MAR`

3. Check if the developer section `## 👤 @<user>` already exists in `ACTIVE_WORK.md`.
   If it does NOT exist, create the section and its dedicated table:

```markdown
## 👤 @[usuario]
| Código | Título del Issue | Prioridad | Qué se corrigió / creó (Breve descripción) | Archivos afectados | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
```

*(Nota de compatibilidad: Si un repositorio ya cuenta con una tabla de 8 columnas que incluye `Commit Local` y `Enviado a Dev`, mantener compatibilidad llenando `Commit Local: (#[PREFIX]-XXX)` y `Enviado a Dev: ✅ En entrega` sin romper el formato existente).*

### 0.3 Issue Registration Interaction
Before modifying code:
1. **Assign Namespaced ID**: Look at the developer's table and calculate the next sequential code (`WRK-001`, `WRK-002`, `WRK-003`, etc.).
2. **Recommend Title**: Analyze user request and propose a concise, descriptive title.
3. **Prompt for Priority**: Present the standardized Issue Registration Template:

```text
🎯 Nuevo Issue para ACTIVE_WORK.md:
- Código: [PREFIX]-XXX
- Título recomendado: [Título propuesto]
- Responsable: @[usuario]

❓ ¿Qué nivel de prioridad le asignamos?
1. Alta (High)
2. Media (Medium)
3. Baja (Low)
```

**Wait for the user's priority selection.** Once confirmed, register the new row inside that developer's dedicated table with `Qué se corrigió / creó: En desarrollo...`, `Archivos afectados: (en edición)`, and `Estado: 🟡 En progreso`.

### 0.4 Lifecycle Updates
- As code is written: update `Archivos afectados` (remains `🟡 En progreso`).
- Incremental commits (WIP / progress checkpoint): update `Qué se corrigió / creó` with progress and keep `Estado: 🟡 En progreso`.
- Task delivery commit: update `Qué se corrigió / creó` with the definitive technical summary and set `Estado: 🔵 En revisión`.
- Stage and commit atomically: `git add <target-files> ACTIVE_WORK.md && git commit -m "..."`.
- When pushed to remote: `git push origin <branch>`. No files are touched after push; the working tree remains 100% clean.
- When formally approved / verified (QA, Lead, or merge to main): update row to `Estado: 🟢 Completado`.

---

## Workflow 1: Safe Local Commit

When the user asks to create or prepare a commit:

### Step 1.1: Working Directory Inspection
Inspect repository status:
```bash
git status --short
```
Identify modified tracked files (`M`), untracked files (`??`), and staged/unstaged diffs. Never run `git add .` blindly when unknown untracked files exist (`.env`, secrets, build artifacts).

### Step 1.2: Craft Conventional Commit with Namespaced Reference
Format commit messages following Conventional Commits, linking the namespaced issue code from the user's table in `ACTIVE_WORK.md`:
- `feat(<scope>): <description> (#[PREFIX]-XXX)`
- `fix(<scope>): <description> (#[PREFIX]-XXX)`
- `refactor(<scope>): <description> (#[PREFIX]-XXX)`
- `chore(<scope>): <description> (#[PREFIX]-XXX)`
- `test(<scope>): <description> (#[PREFIX]-XXX)`
- `docs(<scope>): <description> (#[PREFIX]-XXX)`

Do NOT add AI co-author trailers or attribution.

### Step 1.3: Present Local Commit Plan (Standardized Template)
Present to the user using this structured response template:

```text
📋 Inspección de cambios locales:
- Issue: [PREFIX]-XXX ([Título del Issue])
- Prioridad: [Alta / Media / Baja]
- Responsable: @[usuario]
- ¿Completa la tarea?: [ Sí (🔵 En revisión) / No, es avance parcial (🟡 En progreso) ]
- Qué se corrigió / creó: [Breve descripción técnica de lo que se resolvió o implementó]
- Archivos a incluir: [lista de archivos de código], ACTIVE_WORK.md

📝 Propuesta de commit (Conventional Commits):
> tipo(alcance): descripción del cambio (#[PREFIX]-XXX)

⚠️ ¿Aprobás realizar este commit en tu máquina local?
```

**STOP and wait for the user's explicit confirmation.** Do not proceed without approval.

### Step 1.4: Atomic Table Update & Commit Execution
Once approved:
1. Update `ACTIVE_WORK.md` under the user's table:
   - Insert the exact technical summary under `Qué se corrigió / creó`.
   - Update `Archivos afectados` with the final file list.
   - Set `Estado: 🔵 En revisión` if the commit completes the task, or keep `Estado: 🟡 En progreso` if it is an incremental progress checkpoint.
2. Stage modified files and the updated log together:
   ```bash
   git add <target-files> ACTIVE_WORK.md
   ```
3. Execute the atomic commit:
   ```bash
   git commit -m "<approved-message>"
   ```
*(Crucial: updating `ACTIVE_WORK.md` BEFORE `git commit` guarantees that code and documentation travel in the exact same Git tree snapshot. It avoids leaving dirty uncommitted files in local and guarantees GitHub receives the updated status synchronously in the subsequent push).*

### Step 1.5: Hook Failure Handling
If `git commit` fails due to a pre-commit hook (e.g. Husky, ESLint, Prettier, pytest):
- Do NOT run with `--no-verify`.
- Present the error using the standardized template:

```text
❌ El hook pre-commit del proyecto bloqueó el commit:
Detalle del error:
  > [salida del linter/test/hook]

⚠️ Regla de seguridad: No se utilizará --no-verify.
¿Querés que corrija el error antes de volver a intentar el commit?
```

---

## Workflow 2: Safe Push with Divergence Evaluation

When the user asks to push changes to a remote branch (e.g., `dev` or `main`):

### Step 2.1: Target Branch Identification
Determine the current branch and verify the remote:
```bash
git branch --show-current
git remote -v
```

### Step 2.2: Fetch Remote State
Update local tracking references without altering working files:
```bash
git fetch origin <target-branch>
```

### Step 2.3: Calculate Branch Divergence
Calculate exactly how many commits ahead and behind local is compared to the remote branch:
```bash
git rev-list --left-right --count HEAD...origin/<target-branch>
```
*Output: `<ahead-count>\t<behind-count>`*

### Step 2.4: Evaluate Divergence & Advise

#### Case A: Divergence Detected (`Behind > 0`)
If remote has new commits from teammates, **STOP IMMEDIATELY**. Present the alert template:

```text
🚨 ¡FRENO DE MANO! Divergencia detectada en origin/<target-branch>:
- Tus commits locales (Ahead): <Ahead> commit(s) listo(s) para subir.
- Commits nuevos en GitHub (Behind): <Behind> commit(s) de compañeros.

Últimos commits en GitHub:
[salida de git log HEAD..origin/<target-branch> --oneline -n 5]

⚠️ ¿Por qué se frena?
Si intentamos hacer push directo, GitHub rechazará los cambios por conflicto de avance.

💡 Solución recomendada:
Sincronizar e integrar con: `git pull --rebase origin <target-branch>`

¿Querés que sincronice tu rama ahora?
```

If the user approves, run `git pull --rebase origin <target-branch>`. If conflicts arise, resolve them cleanly, preserve both feature intents, continue the rebase, and proceed to Step 2.5.

#### Case B: Up-to-date (`Ahead == 0`, `Behind == 0`)
```text
ℹ️ Tu rama local ya está 100% al día con origin/<target-branch>. No hay commits pendientes de subir.
```

#### Case C: Clean Push (`Ahead > 0`, `Behind == 0`)
Proceed directly to Step 2.5.

### Step 2.5: Mandatory Pre-Push Functional Verification Gate
Never push unverified code to shared branches:
1. Detect project verification/test command (e.g., `npm test`, `pytest`, `go test ./...`, `cargo test`, `dotnet test`, or syntax smoke test).
2. Execute the test command.
3. Present the pre-push evaluation template:

```text
✅ Evaluación pre-push para origin/<target-branch>:
- Tu rama está <Ahead> commit(s) por delante y 0 por detrás (100% sincronizada).
- Commits a subir:
[salida de git log origin/<target-branch>..HEAD --oneline]

🧪 Validación funcional previa:
- Comando: [comando de test o ejecución]
- Resultado: OK (0 errores)

🚀 ¿Confirmás hacer el push definitivo a origin/<target-branch>?
```

4. Once confirmed:
```bash
git push origin <current-branch>:<target-branch>
```
5. Verify clean working directory:
Do NOT modify `ACTIVE_WORK.md` or any file after the push. The issue log was already updated and committed atomically in Step 1.4. Verify with `git status --short` that the working tree remains 100% clean (`working tree clean`).

---

## Workflow 3: Repository & Hook Inspection

Before initial operations in a client repository, quickly detect existing safety mechanisms:
- Check for Husky: Inspect `.husky/` directory or `git config core.hooksPath`.
- Check for native hooks: Inspect `.git/hooks/`.
- Check for branch protection rules or git config.

When hooks exist, reassure the user that all operations will run cleanly through their established project checks without bypassing anything.
