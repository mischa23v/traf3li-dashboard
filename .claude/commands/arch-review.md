---
name: arch-review
description: Deep architecture review for scalability and maintainability
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

**Health Score**: X/10

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

### Patterns to Follow
- {Pattern from codebase to replicate}

### Anti-patterns to Fix
- {Anti-pattern to refactor}

---

## MANDATORY NEXT STEP

If Health Score >= 7:
→ You MUST now run `/verify {feature}` for final verification.

If Health Score < 7:
→ Address critical items first, then re-run `/arch-review`

**Run `/verify {feature}` now?** (yes to continue)
```

**DO NOT skip /verify. It's the final step before PR.**

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
/arewedone
    ↓ Fix any issues found
    ↓ STOP → Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review            ← YOU ARE HERE
    ↓ Review recommendations
    ↓ STOP → Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}         ← NEXT STEP
    ↓ Confirm all checks pass

DONE → Ready for PR
```

**You MUST complete ALL phases in order. No skipping.**

---

## TRAF3LI Architecture Goals

The reviewer checks against these goals:

### Code Organization
```
src/
├── components/      # Shared UI components
├── features/        # Feature modules (tasks, clients, etc.)
│   └── {feature}/
│       ├── components/
│       ├── hooks/
│       └── types/
├── hooks/           # Shared hooks
├── services/        # API services
├── types/           # Shared types
├── lib/             # Utilities
├── constants/       # App constants
└── config/          # Configuration
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
