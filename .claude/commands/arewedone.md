---
name: arewedone
description: Run structural completeness review after implementation
---

# /arewedone - Structural Completeness Check

Run this command after completing implementation tasks to check for technical debt and incomplete changes.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Launches the `structural-completeness-reviewer` agent
2. Reviews all recent changes for:
   - Dead code (unused imports, functions, files)
   - Change completeness (all layers updated?)
   - Development artifacts (console.log, TODO, etc.)
   - Dependency hygiene
   - Configuration consistency
   - Centralized constants usage
3. Reports findings with severity levels
4. Recommends fixes

---

## Step 1: Run the Agent

Launch the `structural-completeness-reviewer` agent to analyze recent changes.

The agent will:
- Search for common issues
- Cross-reference changes across layers
- Flag violations of project standards

---

## Step 2: Review Findings

The agent will return a report with:

| Severity | Action |
|----------|--------|
| Critical | MUST fix before proceeding |
| High | Should fix before proceeding |
| Medium | Fix soon, can proceed |
| Low | Nice to have |

---

## Step 3: Address Issues

For each issue found:
1. Read the recommendation
2. Make the fix
3. Verify the fix worked

---

## Step 4: Re-run if Needed

If critical or high issues were found and fixed:
- Run `/arewedone` again to verify
- Continue only when review passes

---

# MANDATORY STOP

After the agent completes, output:

```markdown
---

## Structural Review Complete

**Verdict**: PASS / PASS WITH WARNINGS / FAIL

### Issues Summary
| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | X | X |
| High | X | X |
| Medium | X | X |
| Low | X | - |

### Remaining Issues (if any)
- {Issue 1}
- {Issue 2}

---

## MANDATORY NEXT STEP

If PASS or PASS WITH WARNINGS:
→ You MUST now run `/arch-review` for architecture review.

If FAIL:
→ Fix critical/high issues first, then re-run `/arewedone`

**Run `/arch-review` now?** (yes to continue)
```

**DO NOT skip /arch-review. It's part of the required workflow chain.**

---

# Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    ↓ STOP → Wait for approval

PHASE 2-3: DESIGN & TASKS
/implementation {topic}
    ↓ STOP → Wait for design approval
    ↓ STOP → Wait for tasks approval

PHASE 4: IMPLEMENTATION
/complete-phase
    ↓ STOP after EACH task → Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone              ← YOU ARE HERE
    ↓ Fix any issues found
    ↓ STOP → Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review            ← NEXT STEP
    ↓ Review recommendations
    ↓ STOP → Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}
    ↓ Confirm all checks pass

DONE → Ready for PR
```

**You MUST complete ALL phases in order. No skipping.**

---

## When to Run This Command

- After completing all `/complete-phase` tasks
- Before creating a PR
- After any significant refactoring
- When you suspect technical debt

---

## Common Issues It Catches

| Issue | Why It Matters |
|-------|----------------|
| console.log left in | Noise in production |
| Unused imports | Bundle size, confusion |
| Hardcoded routes | Maintenance nightmare |
| Missing translations | Broken Arabic UI |
| TODO comments | Forgotten work |
| Incomplete layer updates | Runtime errors |
