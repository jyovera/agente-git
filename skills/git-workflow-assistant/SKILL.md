---
name: git-workflow-assistant
description: "Human-in-the-loop Git and GitHub assistant. Trigger: commit changes, push to dev/main, branch sync checks, divergence analysis, or safe Git operations across any stack."
license: MIT
metadata:
  version: "1.0.0"
  stack: "agnostic"
---

# Git Workflow Assistant

A portable, stack-agnostic skill that automates Git operations with mandatory human-in-the-loop approval, safe divergence checks, and seamless coexistence with existing repository hooks (such as Husky or native pre-commit).

## Core Principles

1. **Human-in-the-Loop Gate (MANDATORY)**: Never execute `git commit` or `git push` without presenting the plan, diff summary, and receiving explicit human confirmation.
2. **Stack Agnostic**: Rely solely on standard `git` CLI commands. Never introduce runtime dependencies (Node.js, Python, etc.) into the target repository.
3. **Never Bypass Client Hooks**: Never append `--no-verify` or `-n`. If a client hook (Husky, pre-commit, linters) fails, inspect the error output, present it to the user, and fix the root cause.
4. **Divergence-First Pushing**: Before pushing to any branch (especially shared branches like `dev` or `main`), inspect remote state with `git fetch` and evaluate how many commits ahead and behind the local branch is.

---

## Workflow 1: Safe Local Commit

When the user asks to create or prepare a commit:

### Step 1.1: Working Directory Inspection
Inspect the state of the repository:
```bash
git status --short
```
Check what changes exist:
- Modified tracked files (`M`)
- Untracked files (`??`)
- Staged changes (`git diff --staged --stat`)
- Unstaged changes (`git diff --stat`)

Never run `git add .` blindly when there are unknown untracked files (such as `.env`, temporary files, credentials, or build outputs).

### Step 1.2: Craft Conventional Commit Proposal
Formulate a concise, clear commit message using Conventional Commits format:
- `feat(<scope>): <description>`
- `fix(<scope>): <description>`
- `refactor(<scope>): <description>`
- `chore(<scope>): <description>`
- `test(<scope>): <description>`
- `docs(<scope>): <description>`

Do NOT add AI co-author trailers or attribution.

### Step 1.3: Present Plan and Wait for Approval
Present to the user:
- List of files to be staged
- Summary of changes
- Proposed commit message

**STOP and wait for the user's explicit confirmation.** Do not proceed without approval.

### Step 1.4: Execution & Verification
Once approved:
```bash
git add <target-files>
git commit -m "<approved-message>"
```

### Step 1.5: Hook Failure Handling
If `git commit` fails due to a pre-commit hook (e.g. Husky, ESLint, Prettier, pytest):
- Do NOT run with `--no-verify`.
- Display the exact failure message from the hook.
- Offer to fix the specific issues identified by the hook.

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
Update the local tracking references without altering working files:
```bash
git fetch origin <target-branch>
```

### Step 2.3: Calculate Branch Divergence
Calculate exactly how many commits ahead and behind local is compared to the remote branch:
```bash
git rev-list --left-right --count HEAD...origin/<target-branch>
```
*Output format: `<ahead-count>\t<behind-count>`*
- **Left (Ahead)**: Number of local commits not yet on the remote.
- **Right (Behind)**: Number of remote commits not yet in local.

### Step 2.4: Evaluate Divergence & Advise

- **Case A: Clean Push (`Ahead > 0`, `Behind == 0`)**
  - Proceed to **Step 2.5 (Pre-Push Functional Verification Gate)** before asking for final push confirmation.

- **Case B: Remote is Ahead (`Behind > 0`)**
  - **STOP and WARN the user**: *"Remote `origin/<target-branch>` has `<Behind>` new commit(s) that you do not have locally."*
  - Display the incoming remote commits:
    ```bash
    git log HEAD..origin/<target-branch> --oneline -n 5
    ```
  - Propose safe synchronization:
    - Option 1 (Recommended): `git pull --rebase origin <target-branch>` to replay local commits on top of latest remote commits.
    - Option 2: `git pull origin <target-branch>` for a merge commit.
  - After rebase/merge and resolving any conflicts, proceed to **Step 2.5 (Pre-Push Functional Verification Gate)**.
  - Do NOT force push (`--force` is strictly forbidden unless explicitly requested for a personal feature branch with user understanding).

- **Case C: Up-to-date (`Ahead == 0`, `Behind == 0`)**
  - Inform the user that the branch is already synchronized with remote. No push needed.

### Step 2.5: Mandatory Pre-Push Functional Verification Gate
Never push unverified code to shared branches (`dev`, `main`):
1. **Identify Project Verification Command**: Detect the project's test, build, or syntax check command (e.g. `npm test` / `node <entry>`, `pytest`, `go test ./...`, `cargo test`, `dotnet test`).
2. **Execute Validation**: Run the check to ensure incoming changes and integrated commits didn't break runtime functionality.
3. **Report Outcome**: Present test/validation output to the user alongside the commit summary.
4. **Final Approval**: Only ask for the final push authorization once verification passes cleanly.
5. **Execution**:
   ```bash
   git push origin <current-branch>:<target-branch>
   ```

---

## Workflow 3: Repository & Hook Inspection

Before initial operations in a client repository, quickly detect existing safety mechanisms:
- Check for Husky: Inspect `.husky/` directory or `git config core.hooksPath`.
- Check for native hooks: Inspect `.git/hooks/`.
- Check for branch protection rules or git config.

When hooks exist, reassure the user that all operations will run cleanly through their established project checks.
