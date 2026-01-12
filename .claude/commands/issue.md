---
name: issue
description: Create a GitHub issue for bugs, tasks, or future work items
argument-hint: [optional: brief description of the issue]
---

# /issue - GitHub Issue Creator

Launch the github-issue-creator agent to create well-structured GitHub issues.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Repository: !`git remote get-url origin 2>/dev/null`

Recent issues: !`gh issue list --limit 5 2>/dev/null || echo "gh CLI not available"`

Available labels: !`gh label list 2>/dev/null | head -10 || echo "gh CLI not available"`

Arguments: $ARGUMENTS

---

## When to Use This Command

- Found a bug that needs tracking
- Identified future enhancement
- Technical debt to address later
- Task to delegate or schedule
- Feature request to document

---

## Process

### Step 1: Gather Context

The agent will analyze:
- Recent conversation for bugs/tasks mentioned
- Code context (file locations, line numbers)
- User requirements

### Step 2: Draft Issue

The agent will create a draft with:
- Clear, actionable title
- Structured description
- Appropriate labels
- Acceptance criteria

### Step 3: Review & Confirm

**The agent will ALWAYS present the issue for your approval before creating.**

```markdown
## Proposed GitHub Issue

**Title**: Fix: Client form doesn't reset after submission

**Labels**: bug, enhancement

**Description**:
## Summary
...

## Acceptance Criteria
- [ ] ...

---

**Create this issue?** (yes/no)
```

---

## Issue Templates

### Bug Report
```markdown
## Summary
{1-2 sentence description}

## Current Behavior
{What happens now}

## Expected Behavior
{What should happen}

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Technical Details
- **File(s)**: `{paths}`
- **Component(s)**: `{names}`

## Acceptance Criteria
- [ ] Bug is fixed
- [ ] Tests added
- [ ] No regression
```

### Feature Request
```markdown
## Summary
{What feature is needed}

## User Story
As a {role}, I want {feature} so that {benefit}.

## Proposed Solution
{How it could be implemented}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}

## Design Considerations
- RTL support needed?
- Accessibility requirements?
```

### Technical Debt
```markdown
## Summary
{What needs improvement}

## Current State
{How it works now}

## Desired State
{How it should work}

## Impact
- Performance: {High/Medium/Low}
- Maintainability: {High/Medium/Low}
- Developer Experience: {High/Medium/Low}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
```

---

## Common Labels for TRAF3LI

| Label | When to Use |
|-------|-------------|
| `bug` | Something is broken |
| `enhancement` | New feature |
| `refactor` | Code improvement |
| `documentation` | Doc updates |
| `performance` | Speed/memory |
| `accessibility` | A11y improvements |
| `rtl` | Arabic/RTL issues |
| `tech-debt` | Technical debt |
| `good-first-issue` | Simple tasks |
| `priority:high` | Urgent items |
| `priority:low` | Backlog items |

---

## Output Format

```markdown
## Issue Created

**Issue**: #123
**URL**: https://github.com/mischa23v/traf3li-dashboard/issues/123
**Title**: Fix: Client form doesn't reset after submission
**Labels**: bug, enhancement

The issue has been created and is ready for prioritization.
```

---

## Examples

```bash
# Create issue from conversation context
/issue

# Create issue with description
/issue Form validation not working for Arabic names

# Create feature request
/issue Add dark mode support
```
