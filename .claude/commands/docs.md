---
name: docs
description: Three-phase documentation workflow - review, implement, commit
argument-hint: [path/to/file or directory] (optional)
---

# /docs - Documentation Workflow

Orchestrates a comprehensive documentation review, implementation, and commit process.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Current directory: !`pwd`

Recent git commits: !`git log --oneline -5`

Markdown files: !`find . -name "*.md" -not -path "./node_modules/*" | head -20`

Arguments: $ARGUMENTS

---

## Three-Phase Workflow

### Phase 1: Review (doc-reviewer agent)

Launch the `doc-reviewer` agent to analyze documentation:

**Scope:**
- If arguments provided: Focus on `$ARGUMENTS`
- If no arguments: Analyze entire codebase

**The agent will:**
- Identify code changes needing documentation updates
- Find outdated content
- Suggest new documentation areas
- Assess quality and consistency

**Wait for review results before proceeding.**

---

### Phase 2: Implementation (doc-implementer agent)

After reviewing Phase 1 findings, launch `doc-implementer` agent to:

- Update files to fix outdated content
- Create new documentation where gaps exist
- Fix broken references
- Ensure consistent formatting

**Wait for implementation results before proceeding.**

---

### Phase 3: Commit

After implementation, create a conventional commit:

```bash
git add -A
git commit -m "$(cat <<'EOF'
docs: update documentation based on review findings

- Add JSDoc to exported functions in src/lib/
- Update outdated code examples
- Create missing hook documentation
EOF
)"
```

---

## Expected Output

```markdown
# Documentation Workflow Complete

## Phase 1: Review Summary
- Files scanned: X
- Issues found: Y
- Coverage: Z%

## Phase 2: Implementation Summary
- Files updated: X
- New files created: Y
- Issues resolved: Z

## Phase 3: Commit
- Hash: abc1234
- Files: X files changed

---

## Documentation Status
| Category | Before | After |
|----------|--------|-------|
| Utility Functions | 67% | 95% |
| Custom Hooks | 60% | 90% |
| API Services | 75% | 100% |

---

## Remaining Items
- {Any items that couldn't be auto-fixed}
```

---

## Priority Areas for TRAF3LI

| Priority | Location | What to Document |
|----------|----------|------------------|
| Critical | `src/lib/*.ts` | Utility functions |
| Critical | `src/hooks/*.ts` | Custom hooks |
| Critical | `src/services/*.ts` | API services |
| High | `src/constants/routes.ts` | Route constants |
| High | `src/lib/query-keys.ts` | Query key factory |
| Medium | `src/stores/*.ts` | Zustand stores |
| Medium | `src/types/*.ts` | Type definitions |

---

## When to Run This Command

- After completing a feature
- Before major releases
- During code review prep
- When onboarding suggests gaps
- Quarterly documentation audit
