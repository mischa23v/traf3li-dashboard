---
name: design
description: Create design.md (technical architecture) from approved requirements - Phase 2
---

# /design - Technical Design (Phase 2)

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

## Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    -> STOP -> Wait for approval -> Creates .requirements-approved

PHASE 2: DESIGN
/design {topic}  <- YOU ARE HERE
    -> STOP -> Wait for approval -> Creates .design-approved

PHASE 3: TASKS
/tasks {topic}
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

## Step 1: Read Requirements
Read the approved requirements.md to understand what we're building.

## Step 2: Research Codebase
Search for:
- Existing components to reuse
- Patterns to follow (gold standard: `src/features/tasks/`)
- API endpoints available
- Types that exist

## Step 3: Create design.md

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
+-- ChildComponent1
+-- ChildComponent2
```

### Data Flow
User -> Component -> Hook -> Service -> API

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

**THIS IS A BLOCKING CHECKPOINT. YOU MUST STOP HERE.**

After creating design.md, you MUST:

### Step 1: Output This EXACT Message
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

**WAITING FOR YOUR APPROVAL**

Please review the design above and respond with:
- **"approved"** or **"yes"** - to proceed to `/tasks` (task planning)
- **"revise: [feedback]"** - to update the design
- **"questions"** - if you have questions before approving

I will NOT proceed until you explicitly approve.
---
```

### Step 2: STOP COMPLETELY
- **DO NOT** type anything after the message above
- **DO NOT** call `/tasks` automatically
- **DO NOT** create tasks.md yourself
- **DO NOT** continue with "Let me also..." or "Now I'll..."

### Step 3: WAIT for User Response
- Only proceed when user says: "approved", "yes", "proceed", "looks good", "lgtm", or similar affirmative
- If user provides feedback, revise design.md and repeat Step 1
- If user asks questions, answer them and wait again

### Why This Matters
- User must validate technical approach BEFORE task planning begins
- Wrong architecture = expensive refactoring later
- This is the "blueprint review" checkpoint

---

## NEXT STEP (Only After Approval)

**ONLY** after receiving explicit user approval:

### Step 4: Create Approval Marker
When user says "approved", "yes", "proceed", "looks good", or "lgtm":
1. Create the approval marker file:
   ```bash
   touch .claude/specs/{feature-name}/.design-approved
   ```
2. Output: "Design approved. Marker created."

### Step 5: Tell User Next Command
Output exactly:
```
**Next Step**: Run `/tasks {feature-name}` to create the implementation task list.
```

**NEVER auto-proceed to /tasks. User must invoke it explicitly.**

---

# Rules (from CLAUDE.md)

- Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
- Follow gold standard patterns from `src/features/tasks/`
- RTL/LTR support required for all UI
