---
name: commit
description: Intelligent commit based on conversation context - stages and commits related files
argument-hint: [optional: description of what to commit]
---

# /commit - Smart Git Commit

Create intelligent git commits based on conversation context. Only commits files related to the recent work.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Current branch: !`git branch --show-current`

Git status: !`git status --porcelain`

Recent commits (for style reference):
!`git log --oneline -5`

Arguments: $ARGUMENTS

---

## Commit Behavior

### 1. No Arguments Provided
Commit only files that were discussed/modified in the recent conversation.

### 2. With Description
Filter changes to match the provided description and commit those.

### 3. Multi-Commit Request
If user asks for separate commits, create distinct commits for each change set.

---

## Critical Rules

**NEVER commit everything blindly.** Always:
1. Review the conversation to understand what was worked on
2. Stage files selectively based on context
3. Ask for clarification if ambiguous

---

## Commit Message Format

Use conventional commits:

```
type(scope): subject

[optional body]
```

**Types:**
| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `chore` | Maintenance tasks |
| `test` | Adding or updating tests |
| `style` | Formatting, no code change |
| `perf` | Performance improvement |

**Scope:** The area of code (e.g., `clients`, `forms`, `hooks`, `auth`)

**Subject Rules:**
- Imperative mood ("add" not "added")
- No capitalization at start
- No period at end
- Under 50 characters
- Describe what, not how

**Good Examples:**
```
feat(clients): add bulk delete functionality
fix(forms): reset form state after submission
refactor(hooks): extract shared validation logic
```

**Bad Examples:**
```
Updated files                    # Too vague
Fix the bug                      # Which bug?
feat: Add amazing new feature!   # Marketing speak
```

---

## Process

### Step 1: Analyze Context

From the conversation, identify:
- What files were created/modified
- What was the purpose of the changes
- Are there multiple logical change sets?

### Step 2: Selective Staging

```bash
# Stage only relevant files
git add src/features/clients/components/ClientForm.tsx
git add src/hooks/useClients.ts
```

### Step 3: Create Commit

```bash
git commit -m "$(cat <<'EOF'
feat(clients): add form validation for client creation

- Add Zod schema for client form
- Integrate with react-hook-form
- Add error message display
EOF
)"
```

### Step 4: Verify

```bash
git status
git log --oneline -1
```

---

## Handling Ambiguity

If unclear what to commit, ask:

```markdown
I found these changes in the working directory:

**Likely Related to Our Work:**
- `src/features/clients/ClientForm.tsx` (modified)
- `src/hooks/useClients.ts` (modified)

**Unclear:**
- `src/components/Button.tsx` (modified)

**Likely Unrelated:**
- `.env.local` (modified)

Should I commit:
1. Just the client-related changes
2. All changes except .env.local
3. Something else?
```

---

## Output Format

```markdown
## Commit Created

**Hash**: abc1234
**Branch**: feature/client-form
**Message**: feat(clients): add form validation for client creation

**Files Committed:**
- `src/features/clients/ClientForm.tsx`
- `src/hooks/useClients.ts`

**Remaining Unstaged:**
- `.env.local` (intentionally excluded)

---

Ready to push? Run: `git push -u origin {branch}`
```

---

## What NOT to Commit

- `.env` / `.env.local` files
- `node_modules/`
- Build artifacts (`dist/`)
- IDE settings (`.vscode/` unless shared)
- Debug console.logs (check first!)
- TODO/FIXME comments without actual fix
