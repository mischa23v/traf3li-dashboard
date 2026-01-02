---
name: complete-phase
description: Execute ONE task at a time from tasks.md with verification
---

# Phase Execution: Single-Task Focus

Execute tasks from `tasks.md` ONE AT A TIME with verification after each.

## Prerequisites

- [ ] `requirements.md` exists and is approved
- [ ] `design.md` exists and is approved
- [ ] `tasks.md` exists and is approved

## Your Task

1. **Read all spec files** before starting
2. **Find current task**: First uncompleted task in tasks.md
3. **Execute ONE task**
4. **Verify task** works correctly
5. **Update tasks.md** with completion status
6. **STOP and report** to user
7. **Wait for approval** before next task

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
## Task Completed: {Task Number} - {Task Name}

**File**: `path/to/file.ts`

**What I did**:
- Created/Modified the file
- Added X, Y, Z

**Verification**:
- ✅ TypeScript compiles
- ✅ Follows design.md
- ✅ [Other checks]

**Next task**: {Next task number} - {Next task name}

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

## Phase Completion

When all tasks in a phase are complete:

```markdown
## Phase {N} Complete!

**Completed Tasks**:
- [x] Task N.1 - Description
- [x] Task N.2 - Description
- [x] Task N.3 - Description

**Phase Verification**:
- [ ] All tasks marked complete in tasks.md
- [ ] Phase goal achieved: "{goal from tasks.md}"
- [ ] Testable outcome verified: "{testable from tasks.md}"

**Next Phase**: Phase {N+1} - {Goal}

Ready to start Phase {N+1}? (yes/no)
```

---

## All Phases Complete

When ALL phases are done:

```markdown
## Feature Complete!

**All phases completed**:
- [x] Phase 1: Data Layer
- [x] Phase 2: Core UI
- [x] Phase 3: Integration
- [x] Phase 4: Polish

**Final Verification**:
- [ ] `npm run build` passes
- [ ] No console errors
- [ ] Arabic RTL works
- [ ] English LTR works
- [ ] All acceptance criteria from requirements.md met

**What's next?**
1. Additional features to add?
2. UI improvements needed?
3. Ready to create PR?
```

---

## Example: Executing Task 1.1

```markdown
## Reading Spec Files...

Found current task in tasks.md:

### Task 1.1: Create TypeScript Types
**File**: `src/types/reminder.ts`
**Refs**: Requirement 2.1, 2.2
**Details**:
- ReminderSettings interface
- UpdateReminderSettingsDto
- ReminderTiming type
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

## Task Completed: 1.1 - Create TypeScript Types

**File**: `src/types/reminder.ts`

**What I did**:
- Created ReminderTiming type
- Created ReminderSettings interface
- Created UpdateReminderSettingsDto interface

**Verification**:
- ✅ TypeScript compiles
- ✅ Matches design.md Data Models
- ✅ Covers Requirement 2.1, 2.2

**Updated tasks.md**: Status → [x] Complete

**Next task**: 1.2 - Add Query Keys

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

From Kiro workflow:
- [ ] ONE task at a time
- [ ] STOP after each task
- [ ] WAIT for approval
- [ ] Link back to requirements
