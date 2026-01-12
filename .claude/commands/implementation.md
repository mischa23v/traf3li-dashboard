---
name: implementation
description: Create design.md (architecture) and tasks.md (implementation plan) from requirements
---

# /implementation - Design & Task Planning (Phase 2 & 3)

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

## Prerequisites Check

Before starting, verify:
1. `.claude/specs/{feature-name}/requirements.md` exists
2. `.claude/specs/{feature-name}/.requirements-approved` exists

If missing, output:
```
Cannot proceed - requirements not approved.
Run `/plan {feature-name}` first and get approval.
```

**Topic**: $ARGUMENTS

---

## PHASE 2: Design (design.md)

### Step 1: Read Requirements
Read the approved requirements.md to understand what we're building.

### Step 2: Research Codebase
Search for:
- Existing components to reuse
- Patterns to follow (gold standard: `src/features/tasks/`)
- API endpoints available
- Types that exist

### Step 3: Create design.md

**Location**: `.claude/specs/{feature-name}/design.md`

```markdown
# {Feature Name} - Technical Design

## Overview
{1-2 sentences from requirements}

## Impact Summary
| Type | Count | Risk |
|------|-------|------|
| New files | X | Low |
| Modified files | Y | Low/Med |
| Total tasks | Z | - |

## Architecture

### Component Hierarchy
```
ParentComponent
├── ChildComponent1
└── ChildComponent2
```

### Data Flow
User → Component → Hook → Service → API

## Data Models

### TypeScript Interfaces
```typescript
interface Entity {
  id: string
  // fields
}
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/... | List |
| POST | /api/v1/... | Create |

## Components
| Component | Location | Purpose |
|-----------|----------|---------|
| {Name} | `src/features/{feature}/` | {purpose} |

## State Management
| Hook | Purpose | Cache |
|------|---------|-------|
| use{Entity} | Fetch data | CACHE_TIMES.MEDIUM |

## Error Handling
| Error | User Message | Action |
|-------|--------------|--------|
| 401 | Redirect to login | Clear tokens |
| 404 | "Not found" | Show message |

## RTL/LTR Notes
- Text alignment: use `text-start`
- Flex direction: use logical properties
- Icons: mirror directional icons
```

---

# MANDATORY STOP - DESIGN APPROVAL

**YOU MUST STOP HERE. DO NOT CREATE tasks.md YET.**

Output exactly this:

```markdown
---

## Design Created

**File**: `.claude/specs/{feature-name}/design.md`

### Architecture Summary
{Brief description of the technical approach}

### Impact
- New files: X
- Modified files: Y
- Risk level: Low/Medium/High

### Key Decisions
1. {Decision 1}
2. {Decision 2}

---

**Do you approve this design?**

Reply with one of: `approved`, `yes`, `proceed`, `lgtm`, `looks good`
→ I'll create the approval marker and continue to tasks.md

Or provide feedback → I'll revise the design
```

**WAIT FOR USER RESPONSE.**

**DO NOT** continue until user responds.
**DO NOT** create tasks.md yourself.
**DO NOT** start implementation.

---

## After Design Approved

When user approves design:

1. Create marker:
   ```
   .claude/specs/{feature-name}/.design-approved
   ```

2. Continue to Phase 3 (tasks.md)

---

## PHASE 3: Tasks (tasks.md)

### Create tasks.md

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

**YOU MUST STOP HERE. DO NOT START IMPLEMENTATION.**

Output exactly this:

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

**Do you approve this task breakdown?**

Reply with one of: `approved`, `yes`, `proceed`, `lgtm`, `looks good`
→ I'll create the approval marker and tell you to run `/complete-phase`

Or provide feedback → I'll revise the tasks
```

**WAIT FOR USER RESPONSE.**

**DO NOT** continue until user responds.
**DO NOT** start `/complete-phase` yourself.
**DO NOT** write any code yet.

---

## After Tasks Approved

When user approves tasks:

1. Create marker:
   ```
   .claude/specs/{feature-name}/.tasks-approved
   ```

2. Output:
   ```markdown
   ## All Approvals Complete

   **Approval Status:**
   - [x] `.requirements-approved`
   - [x] `.design-approved`
   - [x] `.tasks-approved`

   **Ready for implementation!**

   Run `/complete-phase` to start Phase 1, Task 1.1
   ```

---

# Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    ↓ STOP → Wait for approval

PHASE 2-3: DESIGN & TASKS
/implementation {topic}  ← YOU ARE HERE
    ↓ STOP → Wait for design approval
    ↓ STOP → Wait for tasks approval

PHASE 4: IMPLEMENTATION
/complete-phase
    ↓ STOP after EACH task → Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone
    ↓ Fix any issues found
    ↓ STOP → Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review
    ↓ Review recommendations
    ↓ STOP → Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}
    ↓ Confirm all checks pass

DONE → Ready for PR
```

**You MUST complete ALL phases in order. No skipping.**

---

# Rules (from CLAUDE.md)

- Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
- Follow gold standard patterns from `src/features/tasks/`
- RTL/LTR support required for all UI
