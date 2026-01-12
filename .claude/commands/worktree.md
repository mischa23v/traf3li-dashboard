---
name: worktree
description: Create a new git worktree with sequential numbering for parallel work
argument-hint: (no arguments needed)
---

# /worktree - Git Worktree Creator

Automatically create git worktrees with sequential numbering for working on multiple branches simultaneously.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Current directory: !`pwd`

Current branch: !`git branch --show-current`

Existing worktrees: !`git worktree list`

Existing worktree branches: !`git branch --list 'worktree*'`

Default branch: !`git remote show origin 2>/dev/null | grep 'HEAD branch' | cut -d: -f2 | tr -d ' '`

---

## What This Command Does

1. Determines the default remote branch (main/master)
2. Finds the next sequential worktree number
3. Creates a new branch named `worktreeN`
4. Creates a worktree directory at `/worktreeN`
5. Sets up tracking to the default branch

---

## Process

### Step 1: Find Default Branch

```bash
# Try to get default branch from remote
DEFAULT_BRANCH=$(git remote show origin 2>/dev/null | grep 'HEAD branch' | cut -d: -f2 | tr -d ' ')

# Fallback to main or master
if [ -z "$DEFAULT_BRANCH" ]; then
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    DEFAULT_BRANCH="main"
  elif git rev-parse --verify origin/master >/dev/null 2>&1; then
    DEFAULT_BRANCH="master"
  else
    echo "Error: Unable to determine default branch"
    exit 1
  fi
fi
```

### Step 2: Find Next Number

```bash
# Get highest existing worktree number
LAST_NUM=$(git branch --list 'worktree*' | sed 's/.*worktree//' | sort -n | tail -1)
NEXT_NUM=$((${LAST_NUM:-0} + 1))
```

### Step 3: Create Worktree

```bash
# Create the worktree with tracking branch
git worktree add --track -b "worktree$NEXT_NUM" "/worktree$NEXT_NUM" "origin/$DEFAULT_BRANCH"
```

---

## Output Format

```markdown
## Worktree Created

**Branch**: worktree{N}
**Path**: /worktree{N}
**Tracking**: origin/{default-branch}

### Quick Start
```bash
# Navigate to worktree
cd /worktree{N}

# Install dependencies (if needed)
npm install

# Start development
npm run dev
```

### Managing Worktrees
```bash
# List all worktrees
git worktree list

# Remove when done
git worktree remove /worktree{N}

# Or force remove
git worktree remove --force /worktree{N}
```
```

---

## Use Cases

| Scenario | Benefit |
|----------|---------|
| Hotfix while on feature | Work on fix without stashing |
| Review PR locally | Check out PR branch separately |
| Compare implementations | Side-by-side different approaches |
| Long-running tasks | Keep main work uninterrupted |

---

## Notes

- Worktrees share the same `.git` directory (space efficient)
- Each worktree has its own working directory and index
- You cannot have the same branch checked out in multiple worktrees
- Remember to run `npm install` in new worktrees if dependencies changed

---

## Cleanup

When done with a worktree:

```bash
# Remove the worktree
git worktree remove /worktree{N}

# Delete the branch if no longer needed
git branch -d worktree{N}
```
