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
- [ ] .design-approved (run /implementation first)
- [ ] .tasks-approved (run /implementation first)
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
- "yes" or "continue" → I'll do the next task
- "no" or feedback → I'll wait or make changes
```

**WAIT FOR USER RESPONSE. DO NOT AUTO-CONTINUE.**

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

**Final Checklist**:
- [ ] `npm run build` passes
- [ ] No console errors
- [ ] Arabic RTL works
- [ ] English LTR works

---

**Next step**: Run `/arewedone` for structural review
```

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

# Workflow Reference

```
/plan {topic}
    ↓
/implementation {topic}
    ↓
/complete-phase          ← YOU ARE HERE (run multiple times)
    ↓ (after ALL tasks done)
/arewedone               ← structural review
    ↓
/verify {topic}          ← final verification
```

---

# Rules (from CLAUDE.md)

- ONE task at a time
- STOP and report after each task
- WAIT for user approval before next task
- Use centralized constants
- Test RTL/LTR for UI components
