# Frontend Command Enhancement - Technical Design

## Overview
Enhance the 22 frontend commands with risk-tiered classification, audit logging, Senior Dev Review personas, and unknown scenario handling - matching the backend team's implementation.

## Impact Summary
| Type | Count | Risk |
|------|-------|------|
| New files | 3 | Low |
| Modified commands | 22 | Low |
| Modified agents | 5 | Low |
| Total tasks | ~30 | Low |

---

## Architecture

### File Structure
```
.claude/
 tool-policy.yaml          # NEW - Centralized risk levels & reviewer profiles
 COMMAND_STANDARDS.md      # NEW - Shared patterns documentation
 audit/                    # NEW - Audit log entries
    {date}-{command}-{hash}.yaml
 commands/
    audit.md              # NEW - View audit trail command
    bugs.md               # MODIFY - Add Senior Review
    verify.md             # MODIFY - Add Senior Review
    arch-review.md        # MODIFY - Add Senior Review
    design-review.md      # MODIFY - Add Senior Review
    perf-check.md         # MODIFY - Add Senior Review
    ... (17 more)         # MODIFY - Add frontmatter
 agents/
    ... (unchanged)
 settings.json             # UNCHANGED
```

---

## Data Models

### Command Frontmatter Schema
```yaml
---
name: string              # Command name (existing)
description: string       # Short description (existing)
argument-hint: string     # Optional args hint (existing)
version: string           # NEW - Semantic version (e.g., "1.1.0")
risk: enum[A, B, C]       # NEW - Risk classification
reviewer: string | null   # NEW - Senior reviewer persona key
last_updated: date        # NEW - ISO date string
---
```

### Tool Policy Schema (tool-policy.yaml)
```yaml
version: string
updated: date

risk_levels:
  A:
    name: string
    description: string
    approval: enum[auto, explicit, explicit_with_reason]
    examples: string[]
  B: ...
  C: ...

reviewer_profiles:
  react_architect:
    name: string
    background: string
    companies: string[]
    focus: string[]
    standards: string[]
  design_systems_lead: ...
  accessibility_engineer: ...
  performance_engineer: ...
  i18n_expert: ...

commands:
  {command_name}:
    risk: enum[A, B, C]
    reviewer: string | string[] | null
    auto_approve: boolean
    requires_approval: boolean
    requires_confirmation: boolean
```

### Audit Entry Schema
```yaml
# .claude/audit/{date}-{command}-{hash}.yaml
timestamp: datetime
command: string
risk_level: enum[A, B, C]
arguments: string
files_changed:
  - path: string
    action: enum[created, modified, deleted]
    lines: string  # e.g., "+45/-12"
approval:
  required: boolean
  approved_by: string
  message: string
duration_seconds: number
status: enum[completed, failed, cancelled]
rollback_command: string
```

---

## Component Specifications

### 1. tool-policy.yaml

**Purpose**: Single source of truth for risk levels and reviewer profiles.

**Structure**:
```yaml
# .claude/tool-policy.yaml
version: 1.0.0
updated: 2026-01-14

# 
# RISK LEVELS
# 
risk_levels:
  A:
    name: Safe
    description: Read-only analysis, no file changes
    approval: auto
    examples:
      - /bugs
      - /perf-check
      - /ui-review
      - /design-review
      - /arch-review
      - /arewedone
      - /discover
      - /research
  B:
    name: Mutating
    description: Creates or modifies files, but reversible
    approval: explicit
    examples:
      - /plan
      - /design
      - /tasks
      - /complete-phase
      - /verify
      - /commit
      - /docs
  C:
    name: Destructive
    description: Hard to reverse, affects git history or deletes data
    approval: explicit_with_reason
    examples:
      - /rebase

# 
# SENIOR REVIEWER PROFILES (Frontend-Specific)
# 
reviewer_profiles:
  react_architect:
    name: "React Core Team Engineer"
    background: "8+ years on React Core Team, reviewed thousands of PRs"
    companies: ["Meta/Facebook", "Vercel", "Remix"]
    focus:
      - Component architecture patterns
      - Hook composition and dependencies
      - State management anti-patterns
      - Re-render optimization
      - Concurrent rendering considerations
    standards:
      - "If useState has >3 related pieces, use useReducer"
      - "Custom hooks must have single responsibility"
      - "Never mutate state directly, even in event handlers"
      - "Memoization is last resort, not first"
    red_flags:
      - "useEffect without cleanup for subscriptions"
      - "setState inside useEffect without dependencies"
      - "Inline objects in dependency arrays"
      - "async function directly in useEffect"
      - "Direct mutation of state/props"
      - "Missing key prop in lists"

  design_systems_lead:
    name: "Design Systems Architect"
    background: "Principal Design Systems Engineer, built systems used by 500+ engineers"
    companies: ["Airbnb", "Stripe", "Uber", "Shopify"]
    focus:
      - Component API design
      - Design token usage
      - Variant and composition patterns
      - Accessibility by default
      - Theme architecture
    standards:
      - "Components should be composable, not configurable"
      - "Props should be declarative, not imperative"
      - "Every interactive element needs visible focus state"
      - "Color should never be only differentiator"

  accessibility_engineer:
    name: "Accessibility Staff Engineer"
    background: "Led accessibility programs for products with 1B+ users"
    companies: ["Microsoft", "Apple", "Google"]
    focus:
      - WCAG 2.1 AA compliance
      - Screen reader compatibility
      - Keyboard navigation
      - Focus management
      - ARIA patterns
    standards:
      - "Every image needs alt text, even if empty"
      - "Custom controls must match native behavior"
      - "Focus must never be trapped"
      - "Status messages need live regions"

  performance_engineer:
    name: "Web Performance Engineer"
    background: "Chrome Team, optimized Core Web Vitals for top 1000 sites"
    companies: ["Google Chrome", "Cloudflare", "Vercel"]
    focus:
      - Core Web Vitals (LCP, CLS, INP)
      - Bundle size optimization
      - React render optimization
      - Memory leak detection
    standards:
      - "Initial bundle under 200KB compressed"
      - "No layout shifts above 0.1 CLS"
      - "Interactive within 3.8s on 4G"
      - "No memory growth over time"

  i18n_expert:
    name: "Internationalization Architect"
    background: "Built i18n systems supporting 100+ locales"
    companies: ["Google", "Notion", "Figma"]
    focus:
      - RTL/LTR layout mirroring
      - Text expansion handling
      - Number/date/currency formatting
      - Bidirectional text
    standards:
      - "Use logical properties (start/end), never physical (left/right)"
      - "Text must expand 200% without breaking"
      - "Numbers follow locale conventions"
      - "No hardcoded strings in components"

# 
# COMMAND MAPPINGS
# 
commands:
  # Level A - Safe (Auto-approve)
  bugs:
    risk: A
    reviewer: react_architect
    auto_approve: true
  perf-check:
    risk: A
    reviewer: performance_engineer
    auto_approve: true
  ui-review:
    risk: A
    reviewer: [accessibility_engineer, design_systems_lead]
    auto_approve: true
  design-review:
    risk: A
    reviewer: [accessibility_engineer, i18n_expert]
    auto_approve: true
  arch-review:
    risk: A
    reviewer: react_architect
    auto_approve: true
  arewedone:
    risk: A
    reviewer: react_architect
    auto_approve: true
  discover:
    risk: A
    reviewer: null
    auto_approve: true
  research:
    risk: A
    reviewer: null
    auto_approve: true
  test:
    risk: A
    reviewer: null
    auto_approve: true

  # Level B - Mutating (Requires approval)
  plan:
    risk: B
    reviewer: null
    requires_approval: true
  design:
    risk: B
    reviewer: react_architect
    requires_approval: true
  tasks:
    risk: B
    reviewer: null
    requires_approval: true
  complete-phase:
    risk: B
    reviewer: react_architect
    requires_approval: per_task
  verify:
    risk: B
    reviewer: [react_architect, accessibility_engineer, performance_engineer]
    requires_approval: true
  commit:
    risk: B
    reviewer: null
    requires_approval: false
  docs:
    risk: B
    reviewer: null
    requires_approval: true
  worktree:
    risk: B
    reviewer: null
    requires_approval: false
  match-design:
    risk: B
    reviewer: design_systems_lead
    requires_approval: true
  design-concept:
    risk: B
    reviewer: design_systems_lead
    requires_approval: true
  planform:
    risk: B
    reviewer: design_systems_lead
    requires_approval: false
  issue:
    risk: B
    reviewer: null
    requires_approval: true

  # Level C - Destructive (Requires confirmation + reason)
  rebase:
    risk: C
    reviewer: null
    requires_confirmation: true
    warning: "This rewrites git history and may affect shared branches"
```

### 2. COMMAND_STANDARDS.md

**Purpose**: Shared documentation for command patterns.

**Sections**:
1. Provenance Template (versioning)
2. Senior Review Framework
3. Unknown Scenario Handling
4. Audit Logging Pattern
5. Frontend-Specific Principles

### 3. audit.md Command

**Purpose**: View and manage audit trail.

**Usage**:
```bash
/audit              # Show last 10 entries
/audit today        # Today's entries
/audit complete-phase  # Filter by command
/audit --rollback   # Show rollback commands
```

### 4. Senior Dev Review Section Template

**For**: `/bugs`, `/verify`, `/arch-review`, `/design-review`, `/perf-check`

```markdown
## Senior Dev Review Mode

### Reviewer Persona
> "{Quote from reviewer persona expressing zero tolerance for junior mistakes}"

### Junior Thinking vs Senior Reality
| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "{naive assumption}" | "{expert reality}" | "{consequence}" |

### Company Standards Applied
**{Company} Standards:**
- [ ] {Standard 1}
- [ ] {Standard 2}

### Red Flags That Fail Review Instantly
```
 {Pattern 1}
 {Pattern 2}
```

### Unknown Scenario Handling
**STOP and ASK if you encounter:**
- [ ] {Unknown scenario 1}
- [ ] {Unknown scenario 2}

**{Domain} Principle:** *"{Safe-mode principle}"*
```

---

## Implementation Phases

### Phase 1: Foundation (3 files)
1. Create `.claude/tool-policy.yaml`
2. Create `.claude/COMMAND_STANDARDS.md`
3. Create `.claude/commands/audit.md`

### Phase 2: High-Priority Commands (5 files)
Add Senior Dev Review sections to:
1. `/bugs` - React Core Team reviewer
2. `/verify` - Multi-reviewer (React + A11y + Perf)
3. `/arch-review` - React Core Team reviewer
4. `/design-review` - A11y + i18n reviewer
5. `/perf-check` - Performance Engineer reviewer

### Phase 3: Frontmatter Updates (22 files)
Add to all commands:
- `version: 1.1.0`
- `risk: A|B|C`
- `reviewer: {key}|null`
- `last_updated: 2026-01-14`

### Phase 4: Audit Integration (3 files)
Add audit logging pattern to:
1. `/complete-phase`
2. `/commit`
3. `/rebase`

---

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Missing risk level | "Command {name} has no risk level, defaulting to B" | Use Level B |
| Invalid reviewer key | "Unknown reviewer: {key}" | Skip reviewer section |
| Audit folder missing | (silent) | Create `.claude/audit/` |
| Audit write fails | "Warning: Could not write audit entry" | Continue execution |

---

## RTL/LTR Notes
- Not applicable (command files are markdown, not UI)

---

## Dependencies

| Dependency | Used For | Already Exists |
|------------|----------|----------------|
| YAML parsing | tool-policy.yaml | Claude Code native |
| Markdown frontmatter | Command metadata | Claude Code native |
| Git commands | Audit rollback | Yes |

---

## Testing Strategy

| Test | Method |
|------|--------|
| Risk levels assigned | Grep all commands for `risk:` |
| Senior review sections | Grep for "Junior Thinking vs Senior Reality" |
| Audit entries created | Run `/complete-phase`, check `.claude/audit/` |
| Unknown scenario blocks | Manual test with edge case |

---

## Rollback Plan

All changes are to `.claude/` folder only:
```bash
# Full rollback
git checkout HEAD~{n} -- .claude/

# Partial rollback (single command)
git checkout HEAD~1 -- .claude/commands/{command}.md
```
