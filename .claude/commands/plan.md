---
name: plan
description: Create requirements.md with EARS format user stories and acceptance criteria
version: 1.1.0
risk: B
reviewer: null
last_updated: 2026-01-14
---

# /plan - Requirements Gathering (Phase 1)

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

## Your Task

Transform the user's feature request into structured requirements.

**Topic**: $ARGUMENTS

---

## Step 1: Assess Scale

| Scale | Criteria | Action |
|-------|----------|--------|
| **Quick Fix** | Bug, typo, < 3 files | Use Quick Fix template below |
| **Standard** | Feature, 3-10 files | Full requirements.md |
| **Enterprise** | Major feature, 10+ files | Full requirements.md + extra review |

---

## Step 2: Research Codebase

Before writing requirements, search for existing related code:

```
Search patterns:
- Glob: src/**/*{topic}*.tsx
- Glob: src/**/*{topic}*.ts
- Grep: "{topic}" in src/
- Check: src/features/{topic}/ exists?
- Check: src/hooks/use{Topic}.ts exists?
```

Document what you find.

---

## Step 3: Create requirements.md

**Location**: `.claude/specs/{feature-name}/requirements.md`

### Quick Fix Template (for bugs/small changes)

```markdown
# Quick Fix: {Title}

## Problem
{One sentence}

## Solution
{One sentence}

## Files to Change
| File | Change | Risk |
|------|--------|------|
| `path/file.ts` | {what} | Low/Med/High |

## Verification
- [ ] Build passes
- [ ] Issue fixed
- [ ] No console errors

**Approve this fix? (yes/no)**
```

### Standard/Enterprise Template

```markdown
# {Feature Name} - Requirements

## Scale Assessment
**Type**: [ ] Quick Fix  [ ] Standard  [ ] Enterprise
**Estimated Files**: X new, Y modified
**Risk Level**: Low / Medium / High

## Problem Statement
{What problem are we solving?}

## Codebase Research
| Searched For | Found | Decision |
|--------------|-------|----------|
| Existing components | {list} | Reuse/Extend/Create new |
| Similar patterns | {list} | Follow pattern from X |
| API endpoints | {list} | Exists/Needs creation |

## User Stories

### Story 1: {Title}
As a {role}, I want {feature} so that {benefit}.

**Acceptance Criteria (EARS Format):**
1. WHEN {event} THEN the system SHALL {behavior}
2. WHEN {condition} AND {condition} THEN the system SHALL {behavior}
3. WHEN {error} THEN the system SHALL {error handling}

### Story 2: {Title}
...

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Network timeout | Show retry button |
| Empty data | Show empty state |
| Invalid input | Show validation error |

## Out of Scope
- {Feature for later}

## Open Questions
- [ ] {Question needing user input}

## Technical Notes
- Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
- RTL/LTR support required
- Follow patterns from gold standard: `src/features/tasks/`
```

---

## Step 4: Show Requirements to User

After creating requirements.md, display a summary to the user.

---

# MANDATORY STOP

**YOU MUST STOP HERE. DO NOT CONTINUE TO NEXT PHASE.**

Output exactly this:

```markdown
---

## Requirements Created

**File**: `.claude/specs/{feature-name}/requirements.md`

### Summary
{2-3 sentence summary of what the requirements cover}

### User Stories
1. {Story 1 title}
2. {Story 2 title}
...

### Open Questions (if any)
- {List any questions that need user input}

---

**Do you approve these requirements?**

Reply with one of: `approved`, `yes`, `proceed`, `lgtm`, `looks good`
→ I'll create the approval marker and tell you to run `/design`

Or provide feedback → I'll revise the requirements
```

**WAIT FOR USER RESPONSE.**

**DO NOT** continue until user responds.
**DO NOT** call `/implementation` yourself.
**DO NOT** start writing code.
**DO NOT** proceed to design phase.

---

# After User Approves

Only when user explicitly says "yes", "approved", "looks good", or similar:

1. Create approval marker:
   ```
   .claude/specs/{feature-name}/.requirements-approved
   ```

   Content:
   ```markdown
   # Requirements Approved
   **Approved at**: {timestamp}
   **User said**: "{user's approval message}"
   ```

2. Output:
   ```markdown
   ## Requirements Approved

   Created: `.claude/specs/{feature-name}/.requirements-approved`

   **Next step**: Run `/design {feature-name}` to create the technical design.
   ```

---

# Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}          <- YOU ARE HERE
    -> STOP -> Wait for approval -> Creates .requirements-approved

PHASE 2: DESIGN
/design {topic}
    -> STOP -> Wait for approval -> Creates .design-approved

PHASE 3: TASKS
/tasks {topic}
    -> STOP -> Wait for approval -> Creates .tasks-approved

PHASE 4: IMPLEMENTATION
/complete-phase
    -> STOP after EACH task -> Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone
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

- ASK if unclear about backend/API - don't assume
- Search for existing files before creating new ones
- Use centralized constants (ROUTES, QueryKeys, CACHE_TIMES)
- Consider RTL/LTR for any UI requirements
