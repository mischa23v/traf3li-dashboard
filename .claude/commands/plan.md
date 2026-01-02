---
name: plan
description: Create requirements.md with EARS format user stories and acceptance criteria
---

# Phase 1: Requirements Gathering

Transform the user's feature request into structured requirements using EARS format.

## Your Task

1. **Understand the Request**: What does the user want to build?
2. **Research Codebase**: Search for existing related files
3. **Create requirements.md**: User stories + EARS acceptance criteria
4. **Get Approval**: Do NOT proceed until user approves

## File Location

```
.claude/specs/{feature-name}/requirements.md
```

Use kebab-case for feature name (e.g., `appointment-scheduling`, `client-portal`).

## requirements.md Structure (MANDATORY)

```markdown
# {Feature Name} - Requirements

## Problem Statement
What problem are we solving? Why is this needed for the lawyer dashboard?

## Target Users
- Primary: [Who will use this most?]
- Secondary: [Other stakeholders]

## User Stories

### 1. {Story Title}
As a {role}, I want {feature} so that {benefit}.

**Acceptance Criteria:**
1. WHEN {condition/event} THEN the system SHALL {expected behavior}
2. WHEN {condition} AND {additional condition} THEN the system SHALL {behavior}
3. WHEN {error condition} THEN the system SHALL {error handling}
4. IF {precondition} THEN the system SHALL {behavior}

### 2. {Story Title}
As a {role}, I want {feature} so that {benefit}.

**Acceptance Criteria:**
1. WHEN ... THEN the system SHALL ...
2. WHEN ... THEN the system SHALL ...

## Edge Cases
- WHEN {edge case 1} THEN the system SHALL {handling}
- WHEN {edge case 2} THEN the system SHALL {handling}

## Out of Scope (Future)
- {Feature 1} - Why it can wait
- {Feature 2} - Why it can wait

## Open Questions
- [ ] {Question needing clarification}
- [ ] {Question for backend team}

## Dependencies
- Existing: {What we can reuse}
- New: {What needs to be created}
- Backend: {API requirements - ASK if unclear!}
```

## EARS Format Guide

**EARS = Easy Approach to Requirements Syntax**

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `WHEN [event] THEN SHALL` | Event triggers action | WHEN user clicks submit THEN the system SHALL save the form |
| `IF [condition] THEN SHALL` | State-based behavior | IF user is admin THEN the system SHALL show delete button |
| `WHEN [event] AND [condition]` | Combined conditions | WHEN user submits AND fields are empty THEN the system SHALL show validation errors |
| `WHILE [state] THE SHALL` | Ongoing behavior | WHILE uploading THE system SHALL display progress bar |

### Good vs Bad Requirements

```markdown
# ❌ BAD - Vague
- The system should be user-friendly
- Display error message
- Load quickly

# ✅ GOOD - Specific & Testable
- WHEN form has validation errors THEN the system SHALL display red border on invalid fields
- WHEN user submits invalid email THEN the system SHALL display "Invalid email format" below the field
- WHEN loading appointments THEN the system SHALL complete within 2 seconds
```

## Example: Appointment Reminders Feature

```markdown
# Appointment Reminders - Requirements

## Problem Statement
Lawyers miss appointments because there's no automated reminder system.
They currently rely on manual calendar checks which is error-prone.

## Target Users
- Primary: Lawyers who need reminders before appointments
- Secondary: Clients who receive reminder notifications

## User Stories

### 1. View Upcoming Reminders
As a lawyer, I want to see my upcoming appointment reminders so that I can prepare in advance.

**Acceptance Criteria:**
1. WHEN lawyer opens dashboard THEN the system SHALL display appointments within next 24 hours
2. WHEN appointment is within 1 hour THEN the system SHALL highlight it with warning color
3. WHEN no upcoming appointments exist THEN the system SHALL display "No upcoming appointments"
4. WHEN clicking an appointment THEN the system SHALL navigate to appointment details

### 2. Configure Reminder Timing
As a lawyer, I want to set when I receive reminders so that I get notified at useful times.

**Acceptance Criteria:**
1. WHEN lawyer opens settings THEN the system SHALL display reminder timing options
2. WHEN lawyer selects reminder time THEN the system SHALL save preference (15min, 30min, 1hr, 1day)
3. WHEN lawyer has no preference set THEN the system SHALL default to 30 minutes
4. IF reminder time is changed THEN the system SHALL apply to all future appointments

### 3. Receive Email Reminders
As a lawyer, I want email reminders so that I'm notified even when not in the dashboard.

**Acceptance Criteria:**
1. WHEN reminder time is reached THEN the system SHALL send email to lawyer
2. WHEN email is sent THEN the system SHALL include appointment details (client, time, type)
3. WHEN email fails to send THEN the system SHALL retry up to 3 times
4. IF lawyer has disabled email reminders THEN the system SHALL NOT send emails

## Edge Cases
- WHEN appointment is cancelled after reminder scheduled THEN the system SHALL cancel the reminder
- WHEN appointment time is changed THEN the system SHALL update reminder time accordingly
- WHEN lawyer has multiple appointments at same time THEN the system SHALL send single combined reminder

## Out of Scope (Future)
- SMS reminders - Requires SMS provider integration
- Client reminders - Needs client notification preferences
- Custom reminder messages - Keep MVP simple

## Open Questions
- [ ] Should reminders be per-appointment or global setting?
- [ ] What email template should be used? (Ask design team)
- [ ] Does backend support scheduled jobs for reminders?

## Dependencies
- Existing: Appointment hooks, Email service (verify with backend)
- New: Reminder settings UI, Reminder preferences API
- Backend: GET/POST /api/v1/reminder-settings, Email trigger endpoint
```

## After Creating requirements.md

1. **Show requirements to user** in chat
2. **Ask for feedback**: "Do these requirements capture what you need?"
3. **Iterate** based on feedback until user says "approved" or "looks good"
4. **Do NOT proceed** to design until explicit approval
5. **Next step**: Run `/implementation` to create design + tasks

## IMPORTANT Reminders (from CLAUDE.md)

- [ ] ASK if unclear about backend/API - don't assume
- [ ] Search for existing files before proposing new ones
- [ ] Use centralized constants (ROUTES, QueryKeys)
- [ ] Consider RTL/LTR for any UI requirements
