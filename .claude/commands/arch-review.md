---
name: arch-review
description: Deep architecture review for scalability and maintainability
version: 1.1.0
risk: A
reviewer: react_architect
last_updated: 2026-01-14
---

# /arch-review - Architecture Review

Run this command for a deep-dive analysis of project architecture. Best used after getting an initial prototype working or before major feature development.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Launches the `architecture-reviewer` agent
2. Analyzes the codebase for:
   - Separation of concerns
   - SOLID principles adherence
   - Scalability patterns
   - Maintainability factors
   - Code organization
3. Returns recommendations for improvement

---

## When to Use This Command

| Scenario | Recommendation |
|----------|----------------|
| After initial prototype | Strongly recommended |
| Before major feature | Recommended |
| Quarterly review | Good practice |
| Onboarding new dev | Helpful context |
| After large refactor | Verify improvements |

---

## Step 1: Run the Agent

Launch the `architecture-reviewer` agent to analyze the codebase.

The agent will:
- Map the folder structure
- Analyze patterns and anti-patterns
- Check SOLID principles
- Assess scalability readiness
- Review code organization

---

## Step 2: Review the Report

The agent returns:

### Health Score (X/10)
- 9-10: Excellent, minor tweaks only
- 7-8: Good, some improvements needed
- 5-6: Acceptable, significant work needed
- < 5: Poor, major refactoring required

### Priority Levels
| Priority | Meaning |
|----------|---------|
| Critical | Architecture will break at scale |
| High | Major pain point, fix soon |
| Medium | Improvement opportunity |
| Low | Nice to have |

---

## Step 3: Create Action Items

From the report, create tickets for:

1. **Immediate** - Critical risks, current sprint
2. **Short-term** - High priority, next sprint
3. **Long-term** - Medium/low, add to backlog

---

# MANDATORY STOP

After the agent completes, output:

```markdown
---

## Architecture Review Complete

**Architecture Score**: X/100 → Grade: A/B/C/D/F

| Category | Score | Max |
|----------|-------|-----|
| Separation of Concerns | X | 20 |
| SOLID Principles | X | 20 |
| Scalability | X | 20 |
| Maintainability | X | 20 |
| Code Organization | X | 20 |

**Grade Scale**:
- A (90-100): Excellent architecture
- B (80-89): Good, minor improvements
- C (70-79): Acceptable, some work needed
- D (60-69): Poor, significant refactoring needed
- F (<60): Critical, major overhaul required

### Key Findings
1. {Finding 1}
2. {Finding 2}
3. {Finding 3}

### Recommended Actions
| Priority | Action | Effort |
|----------|--------|--------|
| Critical | {action} | {effort} |
| High | {action} | {effort} |
| Medium | {action} | {effort} |

### Patterns to Follow (Replicate These)
- {Pattern from codebase}

### Anti-patterns Found (Fix These)
- {Anti-pattern to refactor}

---

## MANDATORY NEXT STEP

If Grade C or better (≥70):
→ You MUST now run `/verify {feature}` for final verification.

If Grade D or F (<70):
→ Address critical items first, then re-run `/arch-review`

Reply with one of: `yes`, `proceed`, `continue`
→ I'll run `/verify {feature}`

Or provide feedback → I'll address concerns first
```

**WAIT FOR USER RESPONSE.**

**DO NOT** skip /verify.
**DO NOT** create PR without verification.

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
/complete-phase
    -> STOP after EACH task -> Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone
    -> Fix any issues found
    -> STOP -> Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review            <- YOU ARE HERE
    -> Review recommendations
    -> STOP -> Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}         <- NEXT STEP
    -> Confirm all checks pass

DONE -> Ready for PR
```

**You MUST complete ALL phases in order. No skipping.**

---

## TRAF3LI Architecture Goals

The reviewer checks against these goals:

### Code Organization
```
src/
 components/      # Shared UI components
 features/        # Feature modules (tasks, clients, etc.)
    {feature}/
        components/
        hooks/
        types/
 hooks/           # Shared hooks
 services/        # API services
 types/           # Shared types
 lib/             # Utilities
 constants/       # App constants
 config/          # Configuration
```

### Key Files
| File | Purpose | Must Use |
|------|---------|----------|
| `src/constants/routes.ts` | Route constants | Always |
| `src/lib/query-keys.ts` | Query keys | Always |
| `src/config/cache.ts` | Cache times | Always |
| `src/lib/cache-invalidation.ts` | Invalidation | Always |

### Gold Standards
- List views: `src/features/tasks/`
- Hooks: `src/hooks/useTasks.ts`
- Design: `.claude/commands/planform.md`

---

## Senior Dev Review Mode

When reviewing architecture, analyze as a **React Core Team Engineer** from Meta/Vercel who has built systems serving billions of users.

### Reviewer Persona

> "I've spent 8 years building React applications at Meta scale. I've seen startups crumble under technical debt because they didn't get architecture right early.
> If I see these patterns, the architecture fails review."

### Junior Thinking vs Senior Reality

| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "We can refactor later" | Tech debt compounds exponentially | Later never comes, costs 10x |
| "It's just one component" | Components multiply, patterns spread | Bad patterns become the norm |
| "Performance isn't our focus yet" | Architecture determines performance ceiling | Can't optimize bad architecture |
| "We'll add tests when stable" | Untested code is unstable code | No tests = no confidence |
| "It works for our current data" | Data grows, edge cases appear | 10x data breaks naive code |

### Meta/Vercel Standards Applied

- [ ] Feature modules are self-contained
- [ ] Shared code is truly reusable
- [ ] No circular dependencies
- [ ] Clear public API for each module
- [ ] Types are strict, not `any`

### Red Flags That Fail Review Instantly

```
God components (>300 lines)
Business logic in UI components
Prop drilling more than 3 levels
Circular imports between modules
Hardcoded configuration
Missing error boundaries
No loading states
Direct API calls in components (should be hooks)
```

---

## Unknown Scenario Handling

**STOP and ASK if:**
- [ ] Architecture doesn't match expected patterns
- [ ] Circular dependencies are unavoidable
- [ ] Module boundaries are unclear
- [ ] Performance vs maintainability tradeoff needed

**Architecture Principle:** *"When in doubt, prefer simplicity over cleverness."*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-14 | Added risk level, Senior Dev Review, Unknown Scenario Handling |
| 1.0.0 | 2026-01-12 | Initial version |
