---
name: rebase
description: Rebase current branch onto remote upstream with smart stash handling
argument-hint: [optional: target-branch-name]
version: 1.1.0
risk: C
reviewer: null
last_updated: 2026-01-14
---

# /rebase - Smart Git Rebase

Rebase the current branch onto the specified remote upstream branch with automatic stash management.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Current git status: !`git status --porcelain`

Current branch: !`git branch --show-current`

Current commit: !`git rev-parse HEAD`

Remote tracking branch: !`git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "No upstream branch"`

Recent commits: !`git log --oneline -5`

Arguments: $ARGUMENTS

---

## Behavior

**Expected format:**
- `[target-branch]`: Optional target branch name (e.g., "main", "develop")

**Rules:**
1. If no arguments: rebase onto remote tracking branch of current branch
2. If branch name provided: rebase onto `origin/[branch-name]`
3. Always stash uncommitted changes if working directory is dirty
4. Always fetch remote before rebasing
5. Pop stash after successful rebase

---

## Process

### Step 1: Check for Existing Rebase

```bash
# Abort if already rebasing
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "Rebase already in progress. Run 'git rebase --continue' or 'git rebase --abort'"
  exit 1
fi
```

### Step 2: Stash Changes (if needed)

```bash
# Check for uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
  git stash push -m "auto-stash before rebase"
  STASHED=true
fi
```

### Step 3: Fetch Latest

```bash
git fetch origin
```

### Step 4: Determine Target Branch

```bash
# If argument provided, use it
TARGET="${ARGUMENTS:-$(git rev-parse --abbrev-ref @{upstream} | sed 's/origin\///')}"

# Validate target exists
git rev-parse --verify "origin/$TARGET" > /dev/null 2>&1
```

### Step 5: Execute Rebase

```bash
git rebase "origin/$TARGET"
```

### Step 6: Handle Result

**On Success:**
```bash
# Pop stash if we stashed
if [ "$STASHED" = true ]; then
  git stash pop
fi

echo "Rebase successful!"
```

**On Conflict:**
```markdown
## Rebase Conflict Detected

**Conflicting files:**
{list of files}

### Resolution Steps:
1. Open conflicting files and resolve conflicts
2. Stage resolved files: `git add <file>`
3. Continue rebase: `git rebase --continue`

Or abort: `git rebase --abort`

### After Resolution:
If stash was created, run: `git stash pop`
```

---

## Output Format

### Successful Rebase:

```markdown
## Rebase Complete

**Branch**: feature/client-form
**Rebased onto**: origin/main
**New HEAD**: abc1234

**Commits rebased**: 3
- def456 feat(clients): add form
- ghi789 fix(clients): validation
- jkl012 test(clients): add tests

**Stash**: Restored successfully

---

Ready to push? Run:
```bash
git push --force-with-lease origin feature/client-form
```
```

### Failed/Conflict:

```markdown
## Rebase Paused - Conflicts Detected

**Conflict in**: `src/features/clients/ClientForm.tsx`

### To Resolve:
1. Edit the file to resolve conflicts
2. `git add src/features/clients/ClientForm.tsx`
3. `git rebase --continue`

### To Abort:
`git rebase --abort`

**Note**: Stash was created and will need to be restored after resolution.
```

---

## Examples

```bash
# Rebase onto current upstream
/rebase

# Rebase onto main
/rebase main

# Rebase onto specific feature branch
/rebase feature/shared-components
```

---

## Safety Rules

1. **Never rebase shared branches** (main, develop)
2. **Always use --force-with-lease** when pushing rebased branch
3. **Stash changes** before rebase to prevent loss
4. **Check for existing rebase** before starting new one
5. **Verify remote exists** before attempting rebase
