Never Log in to playwright let me log in because of rate limit. never close dev server or plaseright or chrome browser I will
#  REQUIREMENT: ENTERPRISE-LEVEL CODE QUALITY

**Make sure all code is enterprise-level, production-level, and meets gold standard. Be honest - review your own code like you're a senior dev doing a code review and you HATE this implementation. What would you criticize? What edge cases am I missing? Make sure you take care of ALL edge cases and corner cases. also Do a git diff and review your own code like you're a senior dev doing a code review and you HATE this implementation. What would you criticize? What edge cases am I missing? Make sure you take care of ALL edge cases and corner cases.**

---

##  TL;DR - Quick Reference

| # | Task | Command | Approval Required? |
|---|------|---------|-------------------|
| 1 | **Plan a feature** | `/plan {topic}` |  YES - creates `.requirements-approved` |
| 2 | **Create design** | `/design {topic}` |  YES - creates `.design-approved` |
| 3 | **Create tasks** | `/tasks {topic}` |  YES - creates `.tasks-approved` |
| 4 | **Execute tasks** | `/complete-phase` |  YES - Per task |
| 5 | **Check if done** | `/arewedone` |  YES - Before arch-review |
| 6 | **Architecture review** | `/arch-review` |  YES - Before verify |
| 7 | **Final verification** | `/verify {topic}` |  YES - Before PR |
| - | **UI/RTL review** | `/design-review` | After UI changes |

### Workflow Chain (MANDATORY)

```
/plan → approval → /design → approval → /tasks → approval →
/complete-phase (one task at a time) → /arewedone → /arch-review → /verify → PR
```

**Every step has a HARD STOP. Claude MUST wait for your approval.**

---

#  STOP. READ THIS FIRST.

**MANDATORY: Before writing ANY code, you MUST complete these steps:**

##  Pre-Work Checklist (REQUIRED)

| # | Step | Action |
|---|------|--------|
| 1 | **INVESTIGATE** | Search for existing files related to the task |
| 2 | **LIST** | Show user what EXISTS vs what's MISSING |
| 3 | **ASK** | If unsure about backend/API/data - ASK USER |
| 4 | **PLAN** | Create todo list of changes needed |
| 5 | **CONFIRM** | Get user approval before writing code |

**DO NOT SKIP ANY STEP. If you skip, you will create bugs and duplicate code.**

---

## NEVER Rewrite Entire Files

**ALWAYS use Edit tool to change specific lines. NEVER use Write tool to replace entire files unless:**
- Creating a NEW file that doesn't exist
- User explicitly asks for full rewrite
- File is < 20 lines

**Why:** Rewriting wastes tokens, risks breaking working code, and loses context.

```
WRONG: Write tool to replace 200-line file to change 3 lines
RIGHT: Edit tool to change only the 3 lines that need changing
```

---

##  The #1 Rule: ASK, DON'T ASSUME

If you need information about:
- Backend API structure or responses
- How existing features work
- What the user expects

**→ ASK THE USER. Don't guess. Don't assume.**

---

##  Before Creating ANY Files

```
1. Search: Glob/Grep for existing components
2. Read: Check what's in the existing files
3. List: Show "EXISTS vs MISSING" to user
4. Confirm: Wait for user approval
5. Then: Write code
```

**NEVER create files without showing your analysis first.**

---

##  Use Centralized Constants (MANDATORY)

| Type | Import From | Example |
|------|-------------|---------|
| Routes | `@/constants/routes` | `ROUTES.dashboard.clients.list` |
| Query Keys | `@/lib/query-keys` | `QueryKeys.clients.detail(id)` |
| Cache Times | `@/config/cache` | `CACHE_TIMES.MEDIUM` |
| Invalidation | `@/lib/cache-invalidation` | `invalidateCache.clients.all()` |

**NEVER hardcode routes, query keys, or magic numbers.**

---

##  After EVERY UI Change

1. Navigate to the page
2. Test Arabic (RTL) - take screenshot
3. Test English (LTR) - take screenshot
4. Check console for errors
5. Test mobile viewport if applicable

For major changes: Run `/design-review`

---

##  After Every Push

Provide PR link:
```
https://github.com/mischa23v/traf3li-dashboard/pull/new/{branch-name}
```

---

##  Completion Checklist

Before saying "done", verify:

- [ ] Used centralized constants (not hardcoded values)
- [ ] Tested in browser (both languages if UI)
- [ ] No console errors
- [ ] Created PR link if pushed

---

##  Key Files Reference

| Purpose | Location |
|---------|----------|
| Routes | `src/constants/routes.ts` |
| Query Keys | `src/lib/query-keys.ts` |
| Cache Config | `src/config/cache.ts` |
| Cache Invalidation | `src/lib/cache-invalidation.ts` |
| Design Principles | `/context/design-principles.md` |

---

##  Available Commands Reference

### Planning & Implementation Workflow

| # | Command | Purpose | Approval? | Output |
|---|---------|---------|-----------|--------|
| 1 | `/plan {topic}` | Create EARS requirements | HARD STOP | `.claude/specs/{topic}/requirements.md` |
| 2 | `/design {topic}` | Create technical design | HARD STOP | `.claude/specs/{topic}/design.md` |
| 3 | `/tasks {topic}` | Create implementation tasks | HARD STOP | `.claude/specs/{topic}/tasks.md` |
| 4 | `/complete-phase` | Execute one task at a time | Per task | Code changes |

### Quality Assurance

| Command | Purpose | When to Use | Output |
|---------|---------|-------------|--------|
| `/arewedone` | Structural completeness check | After all tasks done | Score (0-100) |
| `/arch-review` | Architecture quality review | Before major features | Grade (A-F) |
| `/verify {topic}` | Final verification | Before PR | Pass/Fail |
| `/design-review` | RTL/LTR accessibility check | After UI changes | Report |

### Research & Discovery

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/research {topic}` | Research enterprise patterns | Before planning |
| `/discover {topic}` | Analyze existing codebase | Before planning |
| `/design-concept {topic}` | UI/UX specifications | Before UI features |

### Code Quality & Testing

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/bugs [path]` | Find bugs, race conditions, edge cases | After writing code |
| `/test [mode]` | Run tests (unit/coverage/e2e/all) | Before committing |
| `/perf-check [path]` | Analyze performance issues | When app feels slow |
| `/ui-review [path]` | Review UI/UX and RTL support | After UI changes |

### Documentation

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/docs [path]` | 3-phase doc workflow (review, implement, commit) | After feature complete |

### Git Operations

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/commit [desc]` | Smart commit based on context | When ready to commit |
| `/rebase [branch]` | Rebase with smart stash handling | When syncing with upstream |
| `/worktree` | Create numbered worktree for parallel work | When working on multiple features |
| `/issue [desc]` | Create GitHub issue | When bugs/tasks identified |

---

##  Workflow Diagram

```
+-------------------------------------------------------------------+
| PHASE 1: PLANNING                                                  |
| /plan {topic} -> requirements.md -> WAIT FOR APPROVAL              |
+-------------------------------------------------------------------+
                              | "approved"
                              v
+-------------------------------------------------------------------+
| PHASE 2: DESIGN                                                    |
| /design {topic} -> design.md -> WAIT FOR APPROVAL                  |
+-------------------------------------------------------------------+
                              | "approved"
                              v
+-------------------------------------------------------------------+
| PHASE 3: TASKS                                                     |
| /tasks {topic} -> tasks.md -> WAIT FOR APPROVAL                    |
+-------------------------------------------------------------------+
                              | "approved"
                              v
+-------------------------------------------------------------------+
| PHASE 4: IMPLEMENTATION                                            |
| /complete-phase -> ONE task -> WAIT -> repeat until done           |
+-------------------------------------------------------------------+
                              | all tasks complete
                              v
+-------------------------------------------------------------------+
| PHASE 5: STRUCTURAL REVIEW                                         |
| /arewedone -> Score (0-100) -> WAIT FOR APPROVAL                   |
+-------------------------------------------------------------------+
                              | score >= 80
                              v
+-------------------------------------------------------------------+
| PHASE 6: ARCHITECTURE REVIEW                                       |
| /arch-review -> Grade (A-F) -> WAIT FOR APPROVAL                   |
+-------------------------------------------------------------------+
                              | grade >= C
                              v
+-------------------------------------------------------------------+
| PHASE 7: FINAL VERIFICATION                                        |
| /verify {topic} -> Pass/Fail -> WAIT FOR APPROVAL                  |
+-------------------------------------------------------------------+
                              | "approved"
                              v
                         CREATE PR

