---
name: complete-phase
description: Execute ONE task at a time from tasks.md with verification
---

# /complete-phase - Execute Tasks One at a Time

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

## Prerequisites Check

Verify ALL exist before starting:
1. `.claude/specs/{feature-name}/.requirements-approved`
2. `.claude/specs/{feature-name}/.design-approved`
3. `.claude/specs/{feature-name}/.tasks-approved`

If ANY missing:
```
Cannot proceed - missing approvals.

Missing:
- [ ] .requirements-approved (run /plan first)
- [ ] .design-approved (run /design first)
- [ ] .tasks-approved (run /tasks first)
```

---

## The ONE TASK Rule

```
EXECUTE ONE TASK → STOP → REPORT → WAIT FOR APPROVAL → NEXT TASK
```

**NEVER** execute multiple tasks without approval between each.

---

## Step 1: Read Spec Files

Read these files to understand context:
- `requirements.md` - What we're building
- `design.md` - How we're building it
- `tasks.md` - Current task status

---

## Step 2: Find Current Task

In `tasks.md`, find the first task with:
- `**Status**: [ ] Not Started` OR
- `**Status**: [ ] In Progress`

---

## Step 3: Execute ONE Task

### Before Writing Code
1. Search for existing files (don't duplicate)
2. Read files you'll modify
3. Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
4. Follow patterns from design.md

### For NEW Files
- Create in specified location
- Follow design.md architecture
- Add proper types

### For MODIFY Files
- Read entire file first
- Make minimal changes
- Verify existing code still works

---

## Step 4: Verify Task

After implementing:
- [ ] TypeScript compiles (no errors)
- [ ] File in correct location
- [ ] Follows design.md specification
- [ ] Existing code still works (if modified)

---

## Step 5: Update tasks.md

Change task status:
```markdown
**Status**: [x] Complete
```

---

# MANDATORY STOP

**YOU MUST STOP AFTER EACH TASK.**

Output exactly this:

```markdown
---

## Task Completed: {Task Number} - {Task Name}

**File**: `{path}` ({NEW} or {MODIFIED})

**What I did**:
- {Change 1}
- {Change 2}

**Verification**:
- [ ] TypeScript compiles
- [ ] Follows design.md
- [ ] No regressions

**Rollback if needed**:
```bash
git checkout -- {path}
```

---

**Progress**: {X}/{Total} tasks complete

**Next task**: {Next task number} - {Next task name}

---

**Continue to next task?**

Reply with one of: `yes`, `continue`, `next`, `proceed`
→ I'll do the next task

Or provide feedback → I'll wait or make changes
```

**WAIT FOR USER RESPONSE.**

**DO NOT** auto-continue to next task.
**DO NOT** batch multiple tasks.
**DO NOT** assume approval.

---

## Phase Completion

When all tasks in a phase are done:

```markdown
---

## Phase {N} Complete

**Completed Tasks**:
- [x] Task N.1 - {name}
- [x] Task N.2 - {name}
- [x] Task N.3 - {name}

**Phase Goal**: {goal from tasks.md}
**Verified**: {testable outcome}

---

**Next Phase**: Phase {N+1} - {goal}

**Continue to Phase {N+1}?**
```

---

## All Tasks Complete

When ALL phases done:

```markdown
---

## Implementation Complete

**All Phases Done**:
- [x] Phase 1: Data Layer
- [x] Phase 2: Core UI
- [x] Phase 3: Integration
- [x] Phase 4: Polish

**Quick Check**:
- [ ] `npm run build` passes
- [ ] No console errors

---

## MANDATORY NEXT STEP

You MUST now run `/arewedone` for structural review.

This is NOT optional - it's part of the required workflow chain.

**Run `/arewedone` now?** (yes to continue)
```

**DO NOT skip /arewedone. It catches issues before PR.**

---

## If Something Breaks

```markdown
## Task Failed: {Task Number}

**Error**: {description}

**Recovery Options**:
1. Rollback: `git checkout -- {file}`
2. Fix forward: {describe fix}

**Recommendation**: {option}

How to proceed?
```

---

# Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    -> STOP -> Wait for approval -> Creates .requirements-approved

PHASE 2: DESIGN
/design {topic}
    -> STOP -> Wait for approval -> Creates .design-approved

PHASE 3: TASKS
/tasks {topic}
    -> STOP -> Wait for approval -> Creates .tasks-approved

PHASE 4: IMPLEMENTATION
/complete-phase          <- YOU ARE HERE (run multiple times)
    -> STOP after EACH task -> Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone               <- NEXT AFTER ALL TASKS DONE
    -> Fix any issues found
    -> STOP -> Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review
    -> Review recommendations
    -> STOP -> Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}
    -> Confirm all checks pass

DONE -> Ready for PR
```

**You MUST complete ALL phases in order. No skipping.**

---

# Rules (from CLAUDE.md)

- ONE task at a time
- STOP and report after each task
- WAIT for user approval before next task
- Use centralized constants
- Test RTL/LTR for UI components
