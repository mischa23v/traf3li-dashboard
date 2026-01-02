---
name: complete-phase
description: Execute ONE task at a time from tasks.md with verification
---

# Phase Execution: Single-Task Focus

Execute tasks from `tasks.md` ONE AT A TIME with verification after each.

---

## ✅ PRE-FLIGHT CHECKS (Do This First)

**MANDATORY**: Before executing ANY task, verify state is valid:

```markdown
## ✅ Pre-Flight Checks

### 1. Spec Files Exist
- [ ] `requirements.md` exists in `.claude/specs/{feature-name}/`
- [ ] `design.md` exists in `.claude/specs/{feature-name}/`
- [ ] `tasks.md` exists in `.claude/specs/{feature-name}/`

### 2. 🔒 Approval Markers Exist (CRITICAL)
- [ ] `.requirements-approved` exists
- [ ] `.design-approved` exists
- [ ] `.tasks-approved` exists

**Check command:**
```bash
ls -la .claude/specs/{feature-name}/.*-approved
```

### 3. No Unresolved Questions
- [ ] All "Open Questions" in requirements.md are answered
- [ ] No blocking dependencies

### 4. Environment Ready
- [ ] Git working tree is clean: `git status`
- [ ] On correct branch
- [ ] Build currently passes: `npm run build`

### 5. Context Loaded
- [ ] Read requirements.md - understand WHAT we're building
- [ ] Read design.md - understand HOW we're building it
- [ ] Read tasks.md - understand CURRENT STATE and next task
```

**If approval markers missing**:
```markdown
## ❌ Pre-Flight Failed - Missing Approvals

**Approval Status:**
- [ ] `.requirements-approved` - {EXISTS / MISSING}
- [ ] `.design-approved` - {EXISTS / MISSING}
- [ ] `.tasks-approved` - {EXISTS / MISSING}

**Required Action**:
{missing} marker is missing. This means the {phase} was not formally approved.

To fix:
1. Run `/plan` or `/implementation` to get missing approvals
2. Or manually create marker if approval was given verbally

Cannot proceed without all three approval markers.
```

**If other checks fail**:
```markdown
## ❌ Pre-Flight Failed

**Issue**: {describe what failed}

**Required Action**: {what user needs to do}

Cannot proceed until this is resolved.
```

---

## Your Task

1. **Run Pre-Flight Checks** ← NEW: Don't skip this
2. **Read all spec files** before starting
3. **Find current task**: First uncompleted task in tasks.md
4. **Execute ONE task**
5. **Verify task** works correctly
6. **Update tasks.md** with completion status
7. **STOP and report** to user
8. **Wait for approval** before next task

## CRITICAL: Single-Task Execution

```
❌ WRONG: Execute all tasks, then report
✅ RIGHT: Execute ONE task → Stop → Report → Wait → Next task
```

This prevents:
- Cascading errors across multiple files
- Difficult-to-debug issues
- Wasted work if requirements change

---

## Step 1: Read Spec Files

Before ANY implementation, read:

```
.claude/specs/{feature-name}/
├── requirements.md  → What are we building?
├── design.md        → How are we building it?
└── tasks.md         → What's the current task?
```

**Never skip this step.** You need context from all three files.

---

## Step 2: Find Current Task

In `tasks.md`, find the first task with:
```markdown
**Status**: [ ] Not Started
```

or

```markdown
**Status**: [ ] In Progress
```

---

## Step 3: Execute the Task

### Before Writing Code (from CLAUDE.md)

1. **Search for existing files** - Don't duplicate
2. **Read files you'll modify** - Understand current code
3. **Use centralized constants** - ROUTES, QueryKeys, CACHE_TIMES
4. **Check design.md** - Follow the specified patterns

### Implementation Checklist

- [ ] Read existing file (if modifying)
- [ ] Follow design.md architecture
- [ ] Use project constants (not hardcoded)
- [ ] Match existing code patterns
- [ ] Add proper TypeScript types

### Risk-Aware Execution

For **NEW** files (Low Risk):
- Create file in specified location
- Follow patterns from design.md
- Verify TypeScript compiles

For **MODIFY** files (Higher Risk):
- Read entire file first
- Identify exact lines to change
- Make minimal changes
- Verify existing functionality still works
- Check for side effects

---

## Step 4: Verify Task

After implementing, verify:

```markdown
### Verification Checklist
- [ ] TypeScript compiles (no red squiggles)
- [ ] File is in correct location
- [ ] Imports are correct
- [ ] Follows design.md specification
- [ ] Matches requirement refs
```

For UI tasks, also:
- [ ] Component renders without errors
- [ ] Console has no errors
- [ ] Basic functionality works

For MODIFY tasks, also:
- [ ] Existing functionality still works
- [ ] No regressions introduced

---

## Step 5: Update tasks.md

Change task status from:
```markdown
**Status**: [ ] Not Started
```

To:
```markdown
**Status**: [x] Complete
```

---

## Step 6: Report to User

After completing ONE task, report:

```markdown
## ✅ Task Completed: {Task Number} - {Task Name}

**File**: `path/to/file.ts` ({NEW} or {MODIFIED})

**What I did**:
- Created/Modified the file
- Added X, Y, Z

**Verification**:
- ✅ TypeScript compiles
- ✅ Follows design.md
- ✅ {Other checks}

**Risk Check**:
- ✅ No existing features broken
- ✅ No regressions

**Rollback if needed**:
`git checkout -- path/to/file.ts`

---

**Next task**: {Next task number} - {Next task name}
**Next task risk**: {Low/Medium/High}

Ready to proceed? (yes/no)
```

---

## Step 7: Wait for Approval

**DO NOT** automatically continue to the next task.

Wait for user to say:
- "yes", "continue", "next", "proceed"
- Or provide feedback/corrections

If user provides feedback:
1. Make corrections
2. Re-verify
3. Report again
4. Wait for approval

---

## 🔄 ROLLBACK STRATEGY

### If Task Fails During Implementation

```markdown
## ❌ Task Failed: {Task Number} - {Task Name}

**What went wrong**:
{describe the error}

**Files affected**:
- `path/to/file.ts` - {state: partially written / corrupted / ok}

**Recovery Options**:

1. **Quick Rollback** (recommended for single file):
   ```bash
   git checkout -- path/to/file.ts
   ```

2. **Full Task Rollback** (if multiple files):
   ```bash
   git stash
   ```

3. **Manual Fix** (if close to working):
   {describe what needs to be fixed}

**My recommendation**: {Option 1/2/3}

How would you like to proceed?
```

### If Phase Fails After Multiple Tasks

```markdown
## ❌ Phase {N} Has Issues

**Completed tasks**:
- [x] Task N.1 - Working ✅
- [x] Task N.2 - Working ✅
- [x] Task N.3 - Has issues ❌

**Issue in Task N.3**:
{describe problem}

**Recovery Options**:

1. **Rollback just Task N.3**:
   ```bash
   git checkout -- {files from N.3}
   ```
   Keep N.1 and N.2 progress.

2. **Rollback entire phase**:
   ```bash
   git revert HEAD~3..HEAD
   ```
   Start phase fresh.

3. **Fix forward**:
   {describe fix approach}

**My recommendation**: {Option with rationale}

How would you like to proceed?
```

### If Something Breaks Unexpectedly

```markdown
## ⚠️ Unexpected Issue Detected

**Symptom**: {what's broken}

**Likely cause**: {best guess based on recent changes}

**Investigation**:
1. Last task completed: {task N.X}
2. Files changed: {list}
3. Error message: {if any}

**Immediate Actions**:
1. **Stop** - Don't make more changes
2. **Preserve state** - Don't clear errors
3. **Report** - Share this with user

**Recovery Options**:
1. Revert last task: `git checkout -- {files}`
2. Full diagnostic: Check console, network, TypeScript
3. Ask user for guidance

How would you like to proceed?
```

---

## Phase Completion

When all tasks in a phase are complete:

```markdown
## ✅ Phase {N} Complete!

**Completed Tasks**:
- [x] Task N.1 - Description
- [x] Task N.2 - Description
- [x] Task N.3 - Description

**Phase Verification**:
- [x] All tasks marked complete in tasks.md
- [x] Phase goal achieved: "{goal from tasks.md}"
- [x] Testable outcome verified: "{testable from tasks.md}"
- [x] No regressions in existing features

**Rollback Point Saved**:
This phase is now stable. If Phase {N+1} fails, we can safely roll back to here.

---

**Next Phase**: Phase {N+1} - {Goal}
**Phase Risk**: {Low/Medium/High}

Ready to start Phase {N+1}? (yes/no)
```

---

## All Phases Complete

When ALL phases are done:

```markdown
## 🎉 Feature Complete!

**All phases completed**:
- [x] Phase 1: Data Layer
- [x] Phase 2: Core UI
- [x] Phase 3: Integration
- [x] Phase 4: Polish

**Final Verification**:
- [x] `npm run build` passes
- [x] No console errors
- [x] Arabic RTL works
- [x] English LTR works
- [x] All acceptance criteria from requirements.md met
- [x] Existing features still work (regression check)

**Files Created**:
| File | Lines | Purpose |
|------|-------|---------|
| `src/types/entity.ts` | 30 | Type definitions |
| ... | ... | ... |

**Files Modified**:
| File | Lines Changed | What Changed |
|------|---------------|--------------|
| `src/lib/query-keys.ts` | +5 | Added entity keys |
| ... | ... | ... |

---

**What's next?**
1. Additional features to add?
2. UI improvements needed?
3. Ready to create PR?
```

---

## Example: Executing Task 1.1

```markdown
## ✅ Pre-Flight Checks Passed

All spec files exist, approvals confirmed, build passes.

---

## Reading Spec Files...

Found current task in tasks.md:

### Task 1.1: Create TypeScript Types
**File**: `src/types/reminder.ts` (NEW)
**Refs**: Requirement 2.1, 2.2
**Details**:
- ReminderSettings interface
- UpdateReminderSettingsDto
- ReminderTiming type
**Risk**: Low (new file)
**Status**: [ ] Not Started

---

## Executing Task 1.1...

### Pre-Implementation Checks
- [x] Searched for existing reminder types → None found
- [x] Read design.md Data Models section
- [x] Identified required interfaces

### Implementation
Creating `src/types/reminder.ts`:

```typescript
export type ReminderTiming = 15 | 30 | 60 | 1440

export interface ReminderSettings {
  id: string
  userId: string
  defaultTiming: ReminderTiming
  emailEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateReminderSettingsDto {
  defaultTiming?: ReminderTiming
  emailEnabled?: boolean
}
```

---

## ✅ Task Completed: 1.1 - Create TypeScript Types

**File**: `src/types/reminder.ts` (NEW)

**What I did**:
- Created ReminderTiming type
- Created ReminderSettings interface
- Created UpdateReminderSettingsDto interface

**Verification**:
- ✅ TypeScript compiles
- ✅ Matches design.md Data Models
- ✅ Covers Requirement 2.1, 2.2

**Risk Check**:
- ✅ New file - no existing code affected
- ✅ No dependencies on this yet

**Rollback if needed**:
`rm src/types/reminder.ts`

---

**Updated tasks.md**: Status → [x] Complete

**Next task**: 1.2 - Add Query Keys
**Next task risk**: Low (additive change to existing file)

Ready to proceed? (yes/no)
```

---

## IMPORTANT Reminders

From CLAUDE.md - NEVER skip:
- [ ] Search for existing files first
- [ ] Read files before modifying
- [ ] Use ROUTES, QueryKeys, CACHE_TIMES constants
- [ ] Test RTL/LTR for UI components
- [ ] Check console for errors

From this workflow:
- [ ] Run pre-flight checks before starting
- [ ] ONE task at a time
- [ ] STOP after each task
- [ ] WAIT for approval
- [ ] Link back to requirements
- [ ] Provide rollback commands
- [ ] Report risks clearly
