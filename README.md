# AgenteGit: Git Workflow Assistant Skill

A portable, 100% stack-agnostic AI agent skill that automates Git and GitHub workflows with mandatory human approval, divergence safety checks, and full coexistence with repository hooks (such as Husky or native Git hooks).

Compatible with **OpenCode** and **AntiGravity**.

---

## 🎯 Key Capabilities

- **Human-in-the-Loop Approval**: The agent never executes `git commit` or `git push` without presenting the diff summary, proposing a message, and waiting for explicit user confirmation.
- **Pre-Push Divergence Detection**: Before pushing to shared branches (`dev`, `main`, etc.), the agent runs `git fetch` and evaluates `ahead` vs `behind` commit counts. If the remote has new commits, it warns you and guides synchronization (`rebase`/`merge`) to prevent rejected pushes.
- **Zero Runtime Dependencies**: Operates exclusively through native `git` CLI commands. Works seamlessly across any tech stack (Python, Go, Java, TypeScript, C#, GeneXus, PHP, Rust, etc.) without requiring `node_modules` or runtime installations.
- **Hook Coexistence**: Respects existing client safety mechanisms (Husky, Python `pre-commit`, native `.git/hooks`). Never runs with `--no-verify`.

---

## 📂 Repository Structure

```text
AgenteGit/
├── skills/
│   └── git-workflow-assistant/
│       └── SKILL.md            # The portable skill definition
├── .opencode/
│   └── skills/                 # Local workspace test registration
└── README.md                   # Installation & usage documentation
```

---

## 🚀 How to Install in Client Projects

### 1. In an OpenCode Project

You can install this skill locally for a specific client project, or globally across all your projects:

- **Per-Project (Recommended for clients)**:
  Copy the skill folder into the client repository's `.opencode/` folder:
  ```bash
  mkdir -p <client-repo>/.opencode/skills/git-workflow-assistant
  cp skills/git-workflow-assistant/SKILL.md <client-repo>/.opencode/skills/git-workflow-assistant/SKILL.md
  ```

- **Global (Available in all your OpenCode sessions)**:
  ```bash
  mkdir -p ~/.config/opencode/skills/git-workflow-assistant
  cp skills/git-workflow-assistant/SKILL.md ~/.config/opencode/skills/git-workflow-assistant/SKILL.md
  ```

### 2. In an AntiGravity Project

Copy `SKILL.md` into the agent instructions or skills directory of your AntiGravity workspace:
```bash
mkdir -p <client-repo>/.agent/skills/git-workflow-assistant
cp skills/git-workflow-assistant/SKILL.md <client-repo>/.agent/skills/git-workflow-assistant/SKILL.md
```

---

## 💬 Natural Language Interaction Examples

Once installed, simply talk to your agent in Spanish or English:

### Preparing a Local Commit
> **User**: *"Quiero hacer el commit de los cambios locales"*  
> **Agent**:
> 1. Runs `git status -s` and inspects `git diff`.
> 2. Formulates a Conventional Commit message (e.g. `feat(auth): add JWT token validation`).
> 3. Displays the file list and asks: *"¿Confirmás el commit con este mensaje?"*
> 4. Only commits after your approval.

### Pushing to `dev` with Divergence Verification
> **User**: *"Quiero subir los cambios a dev"*  
> **Agent**:
> 1. Runs `git fetch origin dev`.
> 2. Runs `git rev-list --left-right --count HEAD...origin/dev`.
> 3. **If clean**: *"Tu rama está 2 commits por delante de origin/dev y 0 por detrás. ¿Confirmás el push?"*
> 4. **If remote has new commits**: *"¡Atención! origin/dev tiene 3 commits nuevos que aún no tenés en local. Te recomiendo sincronizar con `git pull --rebase origin dev` antes de subir. ¿Cómo preferís proceder?"*

---

## 🛡️ License

MIT License.
