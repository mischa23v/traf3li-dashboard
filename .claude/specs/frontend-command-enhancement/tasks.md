# Frontend Command Enhancement - Implementation Tasks

## Prerequisites
- [x] Requirements approved: `.claude/specs/frontend-command-enhancement/.requirements-approved`
- [x] Design approved: `.claude/specs/frontend-command-enhancement/.design-approved`

---

## Phase 1: Foundation (3 tasks)

### Task 1.1: Create tool-policy.yaml
**Status**: `pending`
**Risk**: Low
**Files**:
- CREATE: `.claude/tool-policy.yaml`

**Description**:
Create the centralized tool policy file with:
- Risk level definitions (A, B, C)
- 5 Senior Reviewer profiles (react_architect, design_systems_lead, accessibility_engineer, performance_engineer, i18n_expert)
- Command mappings for all 22 commands

**Acceptance Criteria**:
- [ ] File created at `.claude/tool-policy.yaml`
- [ ] All 22 commands mapped with risk levels
- [ ] 5 reviewer profiles defined with companies, focus areas, standards

**Rollback**: `git checkout HEAD~1 -- .claude/tool-policy.yaml`

---

### Task 1.2: Create COMMAND_STANDARDS.md
**Status**: `pending`
**Risk**: Low
**Files**:
- CREATE: `.claude/COMMAND_STANDARDS.md`

**Description**:
Create shared documentation with:
- Provenance template (versioning pattern)
- Senior Review framework
- Unknown scenario handling pattern
- Audit logging pattern
- Frontend-specific principles

**Acceptance Criteria**:
- [ ] File created at `.claude/COMMAND_STANDARDS.md`
- [ ] All 5 sections documented
- [ ] Copy-paste templates ready for commands

**Rollback**: `git checkout HEAD~1 -- .claude/COMMAND_STANDARDS.md`

---

### Task 1.3: Create /audit command
**Status**: `pending`
**Risk**: Low
**Files**:
- CREATE: `.claude/commands/audit.md`

**Description**:
Create new command to view audit trail:
- List recent audit entries
- Filter by date/command
- Show rollback commands
- Create `.claude/audit/` folder structure documentation

**Acceptance Criteria**:
- [ ] File created at `.claude/commands/audit.md`
- [ ] Frontmatter includes: name, description, version, risk (A)
- [ ] Usage examples for all modes

**Rollback**: `git checkout HEAD~1 -- .claude/commands/audit.md`

---

## Phase 2: Senior Dev Review Commands (5 tasks)

### Task 2.1: Update /bugs with Senior Review
**Status**: `pending`
**Risk**: Low
**Files**:
- MODIFY: `.claude/commands/bugs.md`

**Description**:
Add to existing command:
- Frontmatter: version 1.1.0, risk A, reviewer react_architect
- Senior Dev Review section with React Core Team persona
- Junior Thinking vs Senior Reality table
- Red flags that fail review instantly
- Unknown scenario handling

**Acceptance Criteria**:
- [ ] Frontmatter updated with version, risk, reviewer, last_updated
- [ ] "Senior Dev Review Mode" section added
- [ ] "Junior Thinking vs Senior Reality" table with 5+ entries
- [ ] "Unknown Scenario Handling" section added

**Rollback**: `git checkout HEAD~1 -- .claude/commands/bugs.md`

---

### Task 2.2: Update /verify with Senior Review
**Status**: `pending`
**Risk**: Low
**Files**:
- MODIFY: `.claude/commands/verify.md`

**Description**:
Add multi-reviewer section:
- Frontmatter: version 1.1.0, risk B, reviewers [react_architect, accessibility_engineer, performance_engineer]
- Three separate review perspectives
- Comprehensive checklist from all three domains

**Acceptance Criteria**:
- [ ] Frontmatter updated
- [ ] Three reviewer perspectives documented
- [ ] Combined standards checklist
- [ ] Unknown scenario handling

**Rollback**: `git checkout HEAD~1 -- .claude/commands/verify.md`

---

### Task 2.3: Update /arch-review with Senior Review
**Status**: `pending`
**Risk**: Low
**Files**:
- MODIFY: `.claude/commands/arch-review.md`

**Description**:
Enhance with React Core Team persona:
- Frontmatter: version 1.1.0, risk A, reviewer react_architect
- Senior Dev Review section
- Component architecture focus
- Unknown scenario handling

**Acceptance Criteria**:
- [ ] Frontmatter updated
- [ ] Senior review persona added
- [ ] Architecture-specific red flags
- [ ] Unknown scenario handling

**Rollback**: `git checkout HEAD~1 -- .claude/commands/arch-review.md`

---

### Task 2.4: Update /design-review with Senior Review
**Status**: `pending`
**Risk**: Low
**Files**:
- MODIFY: `.claude/commands/design-review.md`

**Description**:
Add dual-reviewer section:
- Frontmatter: version 1.1.0, risk A, reviewers [accessibility_engineer, i18n_expert]
- Accessibility standards (WCAG 2.1 AA)
- RTL/LTR standards
- Unknown scenario handling

**Acceptance Criteria**:
- [ ] Frontmatter updated
- [ ] Two reviewer perspectives (A11y + i18n)
- [ ] Combined checklist
- [ ] Unknown scenario handling

**Rollback**: `git checkout HEAD~1 -- .claude/commands/design-review.md`

---

### Task 2.5: Update /perf-check with Senior Review
**Status**: `pending`
**Risk**: Low
**Files**:
- MODIFY: `.claude/commands/perf-check.md`

**Description**:
Add Chrome Team Performance Engineer persona:
- Frontmatter: version 1.1.0, risk A, reviewer performance_engineer
- Core Web Vitals standards
- Bundle size thresholds
- Unknown scenario handling

**Acceptance Criteria**:
- [ ] Frontmatter updated
- [ ] Performance engineer persona
- [ ] Web Vitals checklist
- [ ] Unknown scenario handling

**Rollback**: `git checkout HEAD~1 -- .claude/commands/perf-check.md`

---

## Phase 3: Frontmatter Updates (17 tasks)

### Task 3.1: Update /plan frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/plan.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.2: Update /design frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/design.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: react_architect`, `last_updated: 2026-01-14`

---

### Task 3.3: Update /tasks frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/tasks.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.4: Update /complete-phase frontmatter + audit
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/complete-phase.md`
**Changes**:
- Add frontmatter: `version: 1.1.0`, `risk: B`, `reviewer: react_architect`
- Add audit logging section

---

### Task 3.5: Update /commit frontmatter + audit
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/commit.md`
**Changes**:
- Add `version: 1.1.0`, `risk: B`
- Add audit logging section

---

### Task 3.6: Update /docs frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/docs.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.7: Update /worktree frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/worktree.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.8: Update /rebase frontmatter + audit
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/rebase.md`
**Changes**:
- Add `version: 1.1.0`, `risk: C`, `requires_confirmation: true`
- Add audit logging section
- Add warning about git history

---

### Task 3.9: Update /issue frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/issue.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.10: Update /discover frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/discover.md`
**Changes**: Add `version: 1.1.0`, `risk: A`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.11: Update /research frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/research.md`
**Changes**: Add `version: 1.1.0`, `risk: A`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.12: Update /design-concept frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/design-concept.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: design_systems_lead`, `last_updated: 2026-01-14`

---

### Task 3.13: Update /match-design frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/match-design.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: design_systems_lead`, `last_updated: 2026-01-14`

---

### Task 3.14: Update /planform frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/planform.md`
**Changes**: Add `version: 1.1.0`, `risk: B`, `reviewer: design_systems_lead`, `last_updated: 2026-01-14`

---

### Task 3.15: Update /ui-review frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/ui-review.md`
**Changes**: Add `version: 1.1.0`, `risk: A`, `reviewer: [accessibility_engineer, design_systems_lead]`, `last_updated: 2026-01-14`

---

### Task 3.16: Update /test frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/test.md`
**Changes**: Add `version: 1.1.0`, `risk: A`, `reviewer: null`, `last_updated: 2026-01-14`

---

### Task 3.17: Update /arewedone frontmatter
**Status**: `pending` | **Risk**: Low
**File**: `.claude/commands/arewedone.md`
**Changes**: Add `version: 1.1.0`, `risk: A`, `reviewer: react_architect`, `last_updated: 2026-01-14`

---

## Summary

| Phase | Tasks | Files | Est. Time |
|-------|-------|-------|-----------|
| 1. Foundation | 3 | 3 new | 15 min |
| 2. Senior Reviews | 5 | 5 modify | 30 min |
| 3. Frontmatter | 17 | 17 modify | 20 min |
| **Total** | **25** | **25** | **~65 min** |

---

## Execution Order

```
Phase 1 (Foundation):
  1.1 → 1.2 → 1.3

Phase 2 (Senior Reviews):
  2.1 → 2.2 → 2.3 → 2.4 → 2.5

Phase 3 (Frontmatter - can batch):
  3.1-3.17 (can do multiple in parallel)
```

---

## Verification

After all tasks complete, run:
```bash
# Check all commands have risk levels
grep -l "risk:" .claude/commands/*.md | wc -l  # Should be 23 (22 existing + audit)

# Check all commands have versions
grep -l "version:" .claude/commands/*.md | wc -l  # Should be 23

# Check Senior Review sections
grep -l "Senior Dev Review" .claude/commands/*.md | wc -l  # Should be 5
```
