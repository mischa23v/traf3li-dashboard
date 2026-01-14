# Frontend Command Enhancement - Requirements

## Scale Assessment
**Type**: [x] Enterprise
**Estimated Files**: 3 new, 22 modified (commands), 11 modified (agents)
**Risk Level**: Medium (affects tooling, not production code)

## Problem Statement

The frontend command system lacks:
1. **Risk classification** - No way to distinguish safe (read-only) from destructive operations
2. **Audit trail** - No logging of command executions and approvals
3. **Auto-approval** - All commands require manual approval even when safe
4. **Senior expertise** - Review commands don't invoke expert-level analysis personas
5. **Unknown scenario handling** - No fail-safe guidance when commands hit edge cases

The backend team has implemented these patterns (see `traf3li-backend/.claude/`). Frontend should match for consistency.

## Codebase Research

| Searched For | Found | Decision |
|--------------|-------|----------|
| `.claude/tool-policy.yaml` | NOT FOUND | Create new |
| `.claude/COMMAND_STANDARDS.md` | NOT FOUND | Create new |
| `.claude/commands/audit.md` | NOT FOUND | Create new |
| `.claude/audit/` folder | NOT FOUND | Create new |
| Command frontmatter | Basic (name, description, argument-hint) | Extend with risk, version, reviewer |
| Agent files | 11 agents exist | Update with personas |

---

## User Stories

### Story 1: Risk-Tiered Command Classification
As a developer, I want commands classified by risk level so that safe operations can auto-execute while dangerous ones require confirmation.

**Acceptance Criteria (EARS Format):**
1. WHEN a Level A (safe) command is invoked THEN the system SHALL execute without approval prompt
2. WHEN a Level B (mutating) command is invoked THEN the system SHALL require explicit user approval
3. WHEN a Level C (destructive) command is invoked THEN the system SHALL require approval AND confirmation reason
4. WHEN any command executes THEN the system SHALL display its risk level in output

### Story 2: Audit Logging
As a developer, I want command executions logged so that I can review what changes were made and rollback if needed.

**Acceptance Criteria (EARS Format):**
1. WHEN a Level B or C command completes THEN the system SHALL create an audit entry
2. WHEN viewing audit trail THEN the system SHALL show timestamp, command, files changed, and rollback instructions
3. WHEN `/audit` is invoked THEN the system SHALL display recent command executions
4. WHEN `/audit --rollback` is invoked THEN the system SHALL show rollback commands for recent changes

### Story 3: Senior Dev Review Personas
As a developer, I want review commands to invoke expert personas so that code is analyzed with enterprise-grade rigor.

**Acceptance Criteria (EARS Format):**
1. WHEN `/bugs` analyzes code THEN the system SHALL review as a "React Core Team Engineer from Meta"
2. WHEN `/perf-check` analyzes code THEN the system SHALL review as a "Chrome Team Performance Engineer"
3. WHEN `/design-review` runs THEN the system SHALL review as an "Accessibility Engineer from Microsoft/Apple"
4. WHEN `/arch-review` runs THEN the system SHALL review as a "Principal Architect from Google/Meta"
5. WHEN review completes THEN the system SHALL include "Junior Thinking vs Senior Reality" comparisons

### Story 4: Unknown Scenario Handling
As a developer, I want commands to fail safely when encountering unknown situations so that they don't make incorrect assumptions.

**Acceptance Criteria (EARS Format):**
1. WHEN a command encounters an unexpected pattern THEN the system SHALL STOP and ask the user
2. WHEN a command is uncertain about a decision THEN the system SHALL NOT assume or guess
3. WHEN presenting unknown scenarios THEN the system SHALL list specific questions needing answers
4. WHEN a safe-mode principle applies THEN the system SHALL state it explicitly (e.g., "Security principle: Assume vulnerable")

### Story 5: Version Tracking
As a developer, I want commands versioned so that I can track changes to command behavior over time.

**Acceptance Criteria (EARS Format):**
1. WHEN any command file is read THEN the system SHALL display its version number
2. WHEN a command is updated THEN the system SHALL increment its version
3. WHEN version history is viewed THEN the system SHALL show changelog entries

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Command has no risk level defined | Default to Level B (mutating) for safety |
| Audit folder doesn't exist | Create it automatically on first audit entry |
| User overrides auto-approval | Respect user preference in settings.json |
| Review command finds no issues | Still output "Senior Review Complete" with clean bill |
| Unknown file type in `/bugs` | Stop and ask user how to analyze |

---

## Out of Scope
- Automated testing of command changes (future enhancement)
- UI for viewing audit logs (CLI-only for now)
- Integration with external logging services

---

## Open Questions
- [ ] Should Level A commands show a brief "auto-approved" message or be silent?
- [ ] Should audit logs be committed to git or gitignored?
- [ ] Maximum audit log retention (e.g., last 30 days)?

---

## Technical Notes

### Risk Level Classification

| Level | Name | Behavior | Commands |
|-------|------|----------|----------|
| **A** | Safe | Auto-approve | `/bugs`, `/perf-check`, `/ui-review`, `/design-review`, `/arch-review`, `/arewedone`, `/discover`, `/research` |
| **B** | Mutating | Require approval | `/plan`, `/design`, `/tasks`, `/complete-phase`, `/verify`, `/commit`, `/docs`, `/worktree`, `/match-design`, `/design-concept`, `/planform` |
| **C** | Destructive | Approval + reason | `/rebase` |

### Senior Reviewer Personas (Frontend-Specific)

| Persona | Companies | Focus Areas |
|---------|-----------|-------------|
| React Core Team Engineer | Meta, Vercel, Remix | Hooks, state, effects, rendering |
| Design Systems Architect | Airbnb, Stripe, Uber | Component API, tokens, variants |
| Accessibility Engineer | Microsoft, Apple | WCAG, ARIA, keyboard, screen readers |
| Performance Engineer | Google Chrome, Cloudflare | Web Vitals, bundle, memory |
| i18n Expert | Google, Notion | RTL/LTR, locale, translations |

### Files to Create

| File | Purpose |
|------|---------|
| `.claude/tool-policy.yaml` | Centralized risk levels, reviewer profiles, command mappings |
| `.claude/COMMAND_STANDARDS.md` | Shared patterns (provenance, audit, senior review) |
| `.claude/commands/audit.md` | New command to view audit trail |

### Files to Modify

| File | Changes |
|------|---------|
| All 22 commands | Add frontmatter: `version`, `risk`, `reviewer`, `last_updated` |
| `/bugs`, `/verify`, `/arch-review`, `/design-review`, `/perf-check` | Add Senior Dev Review section |
| `/complete-phase`, `/commit`, `/rebase` | Add audit logging pattern |

---

## Success Metrics

- [ ] All 22 commands have risk levels assigned
- [ ] 5 review commands have Senior Dev personas
- [ ] Audit system creates entries for Level B/C commands
- [ ] `/audit` command shows execution history
- [ ] Unknown scenario handling in all commands
