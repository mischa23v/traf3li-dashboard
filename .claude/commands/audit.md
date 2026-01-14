---
name: audit
description: View command execution history and audit trail
argument-hint: [today|command-name|--rollback] (optional)
version: 1.0.0
risk: A
reviewer: null
last_updated: 2026-01-14
---

# /audit - View Audit Trail

View the history of command executions, file changes, and rollback options.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Usage

```bash
/audit              # Show last 10 audit entries
/audit today        # Show today's entries only
/audit complete-phase  # Filter by command name
/audit --rollback   # Show rollback commands for all entries
```

---

## Audit Location

Audit entries are stored in: `.claude/audit/`

**File naming**: `{YYYY-MM-DD}-{command}-{short-hash}.yaml`

**Example**: `2026-01-14-complete-phase-a3f2.yaml`

---

## Output Format

### Default View (Last 10 Entries)

```markdown
# Audit Trail

| # | Date | Command | Risk | Files | Status | Duration |
|---|------|---------|------|-------|--------|----------|
| 1 | 2026-01-14 10:30 | /complete-phase | B | 2 | completed | 4m |
| 2 | 2026-01-14 10:15 | /commit | B | 5 | completed | 1m |
| 3 | 2026-01-14 09:00 | /rebase | C | 0 | completed | 2m |

**Total**: 10 entries | **Period**: Last 7 days
```

### With --rollback Flag

```markdown
# Audit Trail (with Rollback Commands)

## Entry 1: /complete-phase (2026-01-14 10:30)
**Files Changed**:
- `src/components/Button.tsx` (+45/-12)
- `src/lib/utils.ts` (+3/-0)

**Rollback**:
\`\`\`bash
git checkout HEAD~1 -- src/components/Button.tsx src/lib/utils.ts
\`\`\`

---

## Entry 2: /commit (2026-01-14 10:15)
**Commit**: a3f2b1c "feat: add Button component"

**Rollback**:
\`\`\`bash
git reset --soft HEAD~1
\`\`\`
```

### Filter by Command

```bash
/audit complete-phase
```

Shows only `/complete-phase` entries.

### Filter by Date

```bash
/audit today
/audit 2026-01-14
```

Shows entries from specified date.

---

## Audit Entry Schema

Each audit file follows this YAML structure:

```yaml
timestamp: 2026-01-14T10:30:00Z
command: /complete-phase
arguments: "Task 1.1"
risk_level: B
files_changed:
  - path: src/components/Button.tsx
    action: created
    lines: "+145/-0"
  - path: src/lib/utils.ts
    action: modified
    lines: "+3/-0"
approval:
  required: true
  approved_by: user
  message: "yes"
duration_seconds: 240
status: completed
git_commit: a3f2b1c
rollback_command: "git checkout HEAD~1 -- src/components/Button.tsx src/lib/utils.ts"
```

---

## When Audit Entries Are Created

| Command | Risk | Creates Audit? |
|---------|------|----------------|
| /bugs | A | No |
| /perf-check | A | No |
| /design-review | A | No |
| /plan | B | Yes |
| /design | B | Yes |
| /tasks | B | Yes |
| /complete-phase | B | Yes |
| /commit | B | Yes |
| /rebase | C | Yes |

---

## Managing Audit Logs

### Retention

By default, audit logs are retained for **30 days**.

To clean old entries:
```bash
find .claude/audit -mtime +30 -delete
```

### Git Tracking

Audit logs should be **gitignored** (personal dev history):

```gitignore
# .gitignore
.claude/audit/
```

Or **committed** (team visibility):
- Useful for shared branches
- Shows who approved what

---

## Unknown Scenario Handling

**STOP and ASK if:**

- [ ] Audit folder doesn't exist and you need to create it
- [ ] Audit entry is malformed or unparseable
- [ ] User asks for entries older than retention period
- [ ] Rollback command seems risky (e.g., force operations)

**DO NOT:**
- Delete audit entries without confirmation
- Execute rollback commands automatically
- Modify existing audit entries

**Audit Principle:** *"Audit logs are append-only. Never modify, only add."*

---

## Examples

### Example 1: Quick Check

```bash
/audit
```

Output:
```
Last 10 audit entries:

| Date | Command | Risk | Status |
|------|---------|------|--------|
| Today 10:30 | /complete-phase | B | completed |
| Today 09:15 | /commit | B | completed |
| Yesterday | /plan | B | completed |
```

### Example 2: Find What Changed

```bash
/audit complete-phase
```

Shows all `/complete-phase` runs with files changed.

### Example 3: Prepare Rollback

```bash
/audit --rollback
```

Shows all entries with their rollback commands ready to copy.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial version |
