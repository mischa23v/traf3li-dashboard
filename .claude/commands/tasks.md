---
name: tasks
description: Create tasks.md (implementation plan) from approved design - Phase 3
---

# /tasks - Implementation Tasks (Phase 3)

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

## Prerequisites Check

Before starting, verify:
1. `.claude/specs/{feature-name}/requirements.md` exists
2. `.claude/specs/{feature-name}/.requirements-approved` exists
3. `.claude/specs/{feature-name}/design.md` exists
4. `.claude/specs/{feature-name}/.design-approved` exists

If missing, output:
```
Cannot proceed - design not approved.
Run `/design {feature-name}` first and get approval.
```

**Topic**: $ARGUMENTS

---

## Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    -> STOP -> Wait for approval -> Creates .requirements-approved

PHASE 2: DESIGN
/design {topic}
    -> STOP -> Wait for approval -> Creates .design-approved

PHASE 3: TASKS
/tasks {topic}  <- YOU ARE HERE
    -> STOP -> Wait for approval -> Creates .tasks-approved

PHASE 4: IMPLEMENTATION
/complete-phase
    -> STOP after EACH task -> Wait for "continue"

PHASE 5: STRUCTURAL REVIEW
/arewedone
    -> STOP -> Fix issues if any

PHASE 6: ARCHITECTURE REVIEW
/arch-review
    -> STOP -> Address recommendations

PHASE 7: FINAL VERIFICATION
/verify {topic}
    -> Confirm all checks pass

DONE -> Ready for PR
```

**DO NOT skip phases. Each approval gate is mandatory.**

---

## Step 1: Read Design
Read the approved design.md to understand the technical architecture.

## Step 2: Create tasks.md

**Location**: `.claude/specs/{feature-name}/tasks.md`

```markdown
# {Feature Name} - Implementation Tasks

## Phase Summary
| Phase | Goal | Tasks | Status |
|-------|------|-------|--------|
| 1 | Data Layer | 4 | Not Started |
| 2 | Core UI | 5 | Not Started |
| 3 | Integration | 3 | Not Started |
| 4 | Polish | 3 | Not Started |

---

## Phase 1: Data Layer
**Goal**: Types, services, hooks working
**Verify**: Can fetch/mutate data in console

### Task 1.1: Create Types
**File**: `src/types/{entity}.ts` (NEW)
**Details**: Define interfaces
**Status**: [ ] Not Started

### Task 1.2: Add Query Keys
**File**: `src/lib/query-keys.ts` (MODIFY)
**Details**: Add {entity} query keys
**Status**: [ ] Not Started

### Task 1.3: Create Service
**File**: `src/services/{entity}Service.ts` (NEW)
**Details**: API functions
**Status**: [ ] Not Started

### Task 1.4: Create Hook
**File**: `src/hooks/use{Entity}.ts` (NEW)
**Details**: React Query hooks
**Status**: [ ] Not Started

---

## Phase 2: Core UI
**Goal**: Main UI working
**Verify**: Can see list, forms work

### Task 2.1: Create List Component
**File**: `src/features/{feature}/components/{Entity}List.tsx` (NEW)
**Status**: [ ] Not Started

### Task 2.2: Create Form Component
**File**: `src/features/{feature}/components/{Entity}Form.tsx` (NEW)
**Status**: [ ] Not Started

---

## Phase 3: Integration
**Goal**: Feature connected to app
**Verify**: Full flow works

### Task 3.1: Add Routes
**File**: `src/constants/routes.ts` (MODIFY)
**Status**: [ ] Not Started

### Task 3.2: Add Navigation
**File**: Sidebar/menu (MODIFY)
**Status**: [ ] Not Started

---

## Phase 4: Polish
**Goal**: Production ready
**Verify**: RTL/LTR works, no errors

### Task 4.1: Add Translations
**File**: `src/locales/` (MODIFY)
**Status**: [ ] Not Started

### Task 4.2: RTL Testing
**Verify**: Arabic layout correct
**Status**: [ ] Not Started

### Task 4.3: Final Build
**Run**: `npm run build`
**Status**: [ ] Not Started
```

---

# MANDATORY STOP - TASKS APPROVAL

**THIS IS A BLOCKING CHECKPOINT. YOU MUST STOP HERE.**

After creating tasks.md, you MUST:

### Step 1: Output This EXACT Message
```markdown
---

## Tasks Created

**File**: `.claude/specs/{feature-name}/tasks.md`

### Phase Breakdown
| Phase | Tasks | Goal |
|-------|-------|------|
| 1. Data Layer | X tasks | Types, hooks, services |
| 2. Core UI | X tasks | Components working |
| 3. Integration | X tasks | Connected to app |
| 4. Polish | X tasks | Production ready |

**Total**: X tasks across 4 phases

---

**WAITING FOR YOUR APPROVAL**

Please review the tasks above and respond with:
- **"approved"** or **"yes"** - to proceed to `/complete-phase` (implementation)
- **"revise: [feedback]"** - to update the tasks
- **"questions"** - if you have questions before approving

I will NOT proceed until you explicitly approve.
---
```

### Step 2: STOP COMPLETELY
- **DO NOT** type anything after the message above
- **DO NOT** call `/complete-phase` automatically
- **DO NOT** start writing code
- **DO NOT** continue with "Let me also..." or "Now I'll..."

### Step 3: WAIT for User Response
- Only proceed when user says: "approved", "yes", "proceed", "looks good", "lgtm", or similar affirmative
- If user provides feedback, revise tasks.md and repeat Step 1
- If user asks questions, answer them and wait again

### Why This Matters
- User must validate task breakdown BEFORE implementation begins
- Wrong task order = wasted effort
- This is the "execution plan review" checkpoint

---

## NEXT STEP (Only After Approval)

**ONLY** after receiving explicit user approval:

### Step 4: Create Approval Marker
When user says "approved", "yes", "proceed", "looks good", or "lgtm":
1. Create the approval marker file:
   ```bash
   touch .claude/specs/{feature-name}/.tasks-approved
   ```
2. Output: "Tasks approved. Marker created."

### Step 5: Tell User Next Command
Output exactly:
```markdown
## All Approvals Complete

**Approval Status:**
- [x] `.requirements-approved`
- [x] `.design-approved`
- [x] `.tasks-approved`

**Ready for implementation!**

**Next Step**: Run `/complete-phase` to start Phase 1, Task 1.1
```

**NEVER auto-proceed to /complete-phase. User must invoke it explicitly.**

---

# Rules (from CLAUDE.md)

- Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
- Follow gold standard patterns from `src/features/tasks/`
- RTL/LTR support required for all UI
