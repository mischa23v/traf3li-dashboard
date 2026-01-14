# Command Standards

Shared patterns and templates for all frontend commands.

---

## 1. Provenance Template

Every command file MUST include this frontmatter:

```yaml
---
name: command-name
description: Short description (shown in /help)
argument-hint: [optional arguments hint]
version: 1.1.0
risk: A | B | C
reviewer: reviewer_key | [reviewer_key1, reviewer_key2] | null
last_updated: 2026-01-14
---
```

### Version History Table

At the bottom of each command file:

```markdown
---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-14 | Added risk level, Senior Dev Review |
| 1.0.0 | 2026-01-12 | Initial version |
```

---

## 2. Senior Dev Review Framework

For review commands (`/bugs`, `/verify`, `/arch-review`, `/design-review`, `/perf-check`):

### Section Template

```markdown
## Senior Dev Review Mode

When analyzing code, review as a **{Reviewer Name}** from {Companies} who has zero tolerance for junior mistakes.

### Reviewer Persona

> "I've spent {X} years at {Company}. I've reviewed thousands of PRs and seen every anti-pattern.
> I have zero tolerance for code that will break in production.
> If I see these patterns, the code fails review immediately."

### Junior Thinking vs Senior Reality

| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "{naive assumption}" | "{expert reality}" | "{consequence}" |
| "{naive assumption}" | "{expert reality}" | "{consequence}" |
| "{naive assumption}" | "{expert reality}" | "{consequence}" |
| "{naive assumption}" | "{expert reality}" | "{consequence}" |
| "{naive assumption}" | "{expert reality}" | "{consequence}" |

### Company Standards Applied

**{Company 1} Standards:**
- [ ] {Standard 1}
- [ ] {Standard 2}
- [ ] {Standard 3}

**{Company 2} Standards:**
- [ ] {Standard 1}
- [ ] {Standard 2}
- [ ] {Standard 3}

### Red Flags That Fail Review Instantly

\`\`\`
{Pattern 1}
{Pattern 2}
{Pattern 3}
{Pattern 4}
{Pattern 5}
\`\`\`
```

### Reviewer Keys Reference

| Key | Name | Used By |
|-----|------|---------|
| `react_architect` | React Core Team Engineer | /bugs, /arch-review, /arewedone |
| `design_systems_lead` | Design Systems Architect | /ui-review, /match-design, /design-concept |
| `accessibility_engineer` | Accessibility Staff Engineer | /design-review, /ui-review, /verify |
| `performance_engineer` | Web Performance Engineer | /perf-check, /verify |
| `i18n_expert` | Internationalization Architect | /design-review |

---

## 3. Unknown Scenario Handling

Every command MUST include guidance for edge cases.

### Section Template

```markdown
## Unknown Scenario Handling

**STOP and ASK the user if you encounter:**

- [ ] {Unknown scenario specific to this command}
- [ ] {Unknown scenario specific to this command}
- [ ] {Unknown scenario specific to this command}
- [ ] Code patterns you haven't seen before
- [ ] Files or folders that don't match expected structure
- [ ] API responses that differ from documentation

**DO NOT:**
- Assume what the user wants
- Guess at missing information
- Skip files because you're unsure
- Make up placeholder values

**{Domain} Principle:** *"{Safe-mode principle for this domain}"*

### Examples of When to Stop

| Situation | Wrong Response | Right Response |
|-----------|---------------|----------------|
| Unknown file type | Skip it | Ask: "How should I analyze .xyz files?" |
| Missing dependency | Assume it exists | Ask: "I don't see X installed, should I proceed?" |
| Ambiguous requirement | Pick one interpretation | Ask: "This could mean A or B, which do you want?" |
```

### Domain-Specific Principles

| Domain | Principle |
|--------|-----------|
| Security | "Assume vulnerable until proven safe" |
| Performance | "Measure first, optimize second" |
| Accessibility | "If unsure, test with screen reader" |
| i18n/RTL | "If text can expand, it will break" |
| State Management | "Assume stale data unless invalidated" |
| React Patterns | "Assume re-renders happen constantly" |

---

## 4. Audit Logging Pattern

For commands that modify files (Risk B/C), include audit trail guidance.

### Section Template

```markdown
## Audit Trail

After completing this command, an audit entry will be created:

**Location:** `.claude/audit/{date}-{command}-{hash}.yaml`

**Entry Format:**
\`\`\`yaml
timestamp: {ISO datetime}
command: /{command-name}
risk_level: {A|B|C}
arguments: "{arguments}"
files_changed:
  - path: "{file path}"
    action: created | modified | deleted
    lines: "+{added}/-{removed}"
approval:
  required: {true|false}
  approved_by: user
  message: "{approval message}"
duration_seconds: {number}
status: completed | failed | cancelled
rollback_command: "{git command to undo}"
\`\`\`

**Rollback:** If you need to undo this command:
\`\`\`bash
{specific rollback command}
\`\`\`
```

### When to Create Audit Entries

| Risk Level | Create Entry? | Include Rollback? |
|------------|---------------|-------------------|
| A (Safe) | No | No |
| B (Mutating) | Yes | Yes |
| C (Destructive) | Yes | Yes (detailed) |

---

## 5. Frontend-Specific Principles

These principles apply to ALL frontend commands.

### React/TypeScript

1. **Never trust component props** - Always validate or provide defaults
2. **Effects must clean up** - Subscriptions, timers, abort controllers
3. **Memoization is last resort** - Profile before adding useMemo/useCallback
4. **State updates may batch** - Don't rely on immediate state after setState

### Design System

1. **Use design tokens** - Never hardcode colors, spacing, typography
2. **Components should be composable** - Prefer composition over configuration
3. **Accessibility is not optional** - Every feature must be keyboard accessible

### Internationalization

1. **Use logical properties** - `ms-4` not `ml-4`, `text-start` not `text-left`
2. **No hardcoded strings** - Everything through translation function
3. **Numbers follow locale** - Use `Intl.NumberFormat`, not string concatenation

### Performance

1. **Measure before optimizing** - Use React DevTools Profiler
2. **Lazy load below fold** - Images, components, routes
3. **Bundle size matters** - Check imports with bundle analyzer

---

## 6. Command Categories

Commands are organized by purpose:

### Workflow Commands (Require Sequential Execution)
`/plan` → `/design` → `/tasks` → `/complete-phase` → `/arewedone` → `/arch-review` → `/verify`

### Review Commands (Can Run Anytime)
`/bugs`, `/perf-check`, `/ui-review`, `/design-review`, `/arch-review`

### Git Commands (Standalone)
`/commit`, `/rebase`, `/worktree`, `/issue`

### Research Commands (Before Planning)
`/discover`, `/research`, `/design-concept`

### Documentation Commands
`/docs`, `/planform`, `/match-design`

---

## Quick Reference

### Risk Levels
| Level | Name | Approval | Color |
|-------|------|----------|-------|
| A | Safe | Auto | Green |
| B | Mutating | Explicit | Yellow |
| C | Destructive | Explicit + Reason | Red |

### Required Sections by Risk

| Section | Risk A | Risk B | Risk C |
|---------|--------|--------|--------|
| Frontmatter | Yes | Yes | Yes |
| Unknown Scenario | Yes | Yes | Yes |
| Senior Review | If reviewer | If reviewer | If reviewer |
| Audit Trail | No | Yes | Yes |
| Warning Banner | No | No | Yes |
