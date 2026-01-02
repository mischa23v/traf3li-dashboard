---
name: plan
description: Create requirements.md with EARS format user stories and acceptance criteria
---

# Phase 1: Requirements Gathering

Transform the user's feature request into structured requirements using EARS format with enterprise-grade standards.

---

## 📏 SCALE ASSESSMENT (Do This First)

Before deep planning, determine the scope:

| Scale | Criteria | Process | Time |
|-------|----------|---------|------|
| **Quick Fix** | Bug fix, typo, < 3 files | Minimal spec | < 5 min |
| **Standard** | Feature, 3-10 files | Full spec workflow | < 15 min |
| **Enterprise** | Major feature, 10+ files, compliance | Full spec + extra reviews | < 30 min |

### Quick Fix Template (Use for bugs, typos, small changes)

If this is a Quick Fix, create this minimal spec instead:

```markdown
# Quick Fix: {Title}

## Problem
{One sentence describing the issue}

## Solution
{One sentence describing the fix}

## Files to Change
| File | Change | Risk |
|------|--------|------|
| `path/to/file.ts` | {what changes} | Low/Med/High |

## Verification
- [ ] Build passes (`npm run build`)
- [ ] Original issue fixed
- [ ] No console errors
- [ ] RTL/LTR still works (if UI)

## Rollback
If something breaks: `git checkout -- {files}`

**Approve this fix? (yes/no)**
```

For Standard/Enterprise features, continue with full process below.

---

## Your Task

1. **Assess Scale**: Quick Fix, Standard, or Enterprise?
2. **Understand the Request**: What does the user want to build?
3. **Research Codebase**: Search for existing related files
4. **Create requirements.md**: User stories + EARS acceptance criteria + Enterprise standards
5. **Get Approval**: Do NOT proceed until user approves

## File Location

```
.claude/specs/{feature-name}/requirements.md
```

Use kebab-case for feature name (e.g., `appointment-scheduling`, `client-portal`).

---

## 🧠 REASONING SECTION (Thinking Out Loud)

**MANDATORY**: Before proposing any solution, show your reasoning:

```markdown
## 🧠 Reasoning (My Analysis)

### What I Searched
| Search | Results | Relevance |
|--------|---------|-----------|
| `**/*appointment*.tsx` | Found 3 files | Existing UI to extend |
| `useAppointment` in hooks | Found `src/hooks/useAppointments.ts` | Existing hook to extend |
| `ROUTES.*appointment` | Found route exists | No new route needed |

### What Already Exists (Reuse These)
| Component/File | Location | Can Reuse For |
|----------------|----------|---------------|
| `AppointmentDialog` | `src/components/` | Base dialog pattern |
| `useAppointments` | `src/hooks/` | Query patterns |
| `appointmentService` | `src/services/` | API patterns |

### What's Missing (Need to Create)
| Component/File | Purpose | Depends On |
|----------------|---------|------------|
| `ReminderSettings` | New UI component | Design approval |
| `useReminders` | New hook | API endpoint |

### Decisions Made
| Decision | Why | Alternatives Rejected |
|----------|-----|----------------------|
| Extend existing hook | Less code, consistent | New hook (duplication) |
| Use existing Dialog | Already accessible | Custom modal (inconsistent) |
| Add to settings page | Logical location | New page (fragmentation) |

### Risks Identified
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Query key collision | Low | High | Check existing keys |
| Breaking existing tests | Medium | Medium | Run tests after each change |
| Performance impact | Low | Low | Use existing caching |

### Open Questions (Need User Input)
- [ ] Should reminders be per-appointment or global?
- [ ] Email template - use existing or new design?
```

**Why this matters**: User sees your thought process, catches mistakes early, understands trade-offs.

---

## 🏆 ENTERPRISE GOLD STANDARD CHECKLIST

Every plan MUST meet these enterprise-grade requirements before approval.

### 🔐 Security Standards (AWS/Microsoft/SAP)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Authentication | OAuth 2.0 / JWT with refresh tokens | [ ] Specified |
| Authorization | RBAC with least privilege principle | [ ] Specified |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit | [ ] Specified |
| Input Validation | Server-side validation, sanitization | [ ] Specified |
| Audit Logging | Who, what, when, where for all actions | [ ] Specified |
| Secret Management | No hardcoded secrets, use env vars | [ ] Specified |
| CORS Policy | Whitelist-based, no wildcards in prod | [ ] Specified |
| Rate Limiting | Per-user, per-endpoint throttling | [ ] Specified |

### ⚡ Performance Standards (AWS Well-Architected)

| Requirement | Target | Validation |
|-------------|--------|------------|
| API Response Time | < 200ms (p95) | [ ] Specified |
| Page Load Time | < 3s (First Contentful Paint) | [ ] Specified |
| Database Queries | < 100ms per query | [ ] Specified |
| Bundle Size | < 250KB gzipped (initial load) | [ ] Specified |
| Caching Strategy | CDN + Browser + API cache defined | [ ] Specified |
| Lazy Loading | Non-critical components deferred | [ ] Specified |

### 📈 Scalability Standards (AWS/Microsoft)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Stateless Design | No server-side session dependency | [ ] Specified |
| Horizontal Scaling | Can add instances without code change | [ ] Specified |
| Database Indexing | Indexes defined for query patterns | [ ] Specified |
| Pagination | Cursor-based for large datasets | [ ] Specified |
| Background Jobs | Long tasks moved to async workers | [ ] Specified |

### ♿ Accessibility Standards (Apple HIG/WCAG 2.1 AA)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Keyboard Navigation | Full keyboard operability | [ ] Specified |
| Screen Reader | ARIA labels on interactive elements | [ ] Specified |
| Color Contrast | 4.5:1 minimum ratio | [ ] Specified |
| Focus Indicators | Visible focus states | [ ] Specified |
| RTL Support | Full Arabic/RTL layout support | [ ] Specified |
| Touch Targets | 44x44px minimum (mobile) | [ ] Specified |

### 🌍 Internationalization Standards (SAP/Microsoft)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| i18n Ready | All strings externalized | [ ] Specified |
| RTL/LTR | Direction-aware layouts | [ ] Specified |
| Date/Time | Locale-aware formatting | [ ] Specified |
| Currency | Locale-aware with symbol placement | [ ] Specified |
| Number Format | Locale-aware decimal/thousand separators | [ ] Specified |

### 🛡️ Reliability Standards (AWS Well-Architected)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Error Handling | Graceful degradation, user-friendly messages | [ ] Specified |
| Retry Logic | Exponential backoff for transient failures | [ ] Specified |
| Circuit Breaker | Prevent cascade failures | [ ] Specified |
| Health Checks | Liveness + readiness probes | [ ] Specified |
| Monitoring | Metrics, logs, traces defined | [ ] Specified |
| Backup/Recovery | Data recovery strategy defined | [ ] Specified |

### 📋 Compliance Standards (PDPL/GDPR/SOC2)

| Requirement | Standard | Validation |
|-------------|----------|------------|
| Data Privacy | PDPL/GDPR compliant data handling | [ ] Specified |
| Consent Management | User consent tracked and honored | [ ] Specified |
| Data Retention | Retention policies defined | [ ] Specified |
| Right to Deletion | User data deletion capability | [ ] Specified |
| Audit Trail | Immutable action logs | [ ] Specified |

---

## requirements.md Structure (MANDATORY)

```markdown
# {Feature Name} - Requirements

## Scale Assessment
**Type**: [ ] Quick Fix  [ ] Standard  [x] Enterprise
**Estimated Files**: X new, Y modified
**Risk Level**: Low / Medium / High

## Problem Statement
What problem are we solving? Why is this needed?

## Target Users
- Primary: [Who will use this most?]
- Secondary: [Other stakeholders]

---

## 🧠 Reasoning (Analysis Done)

### Codebase Research
| Searched For | Found | Decision |
|--------------|-------|----------|
| Existing components | {list} | Reuse X, extend Y |
| Similar patterns | {list} | Follow pattern from Z |
| Potential conflicts | {list} | Avoid by doing A |

### Architecture Decision
**Chosen approach**: {description}
**Why**: {rationale}
**Rejected alternatives**: {list with reasons}

---

## 🏆 Enterprise Standards Compliance

### Security
- [ ] Authentication: {method}
- [ ] Authorization: {RBAC roles needed}
- [ ] Data sensitivity: {PII/PHI/Financial data?}
- [ ] Audit requirements: {what actions logged?}

### Performance
- [ ] Expected load: {users/requests per second}
- [ ] Response time SLA: {target ms}
- [ ] Caching strategy: {browser/CDN/API}

### Accessibility
- [ ] WCAG 2.1 AA compliance required
- [ ] RTL/Arabic support required
- [ ] Keyboard navigation required

### Compliance
- [ ] PDPL requirements: {applicable?}
- [ ] Data retention: {policy}
- [ ] Consent required: {yes/no}

---

## User Stories

### 1. {Story Title}
As a {role}, I want {feature} so that {benefit}.

**Acceptance Criteria (EARS Format):**
1. WHEN {condition/event} THEN the system SHALL {expected behavior}
2. WHEN {condition} AND {additional condition} THEN the system SHALL {behavior}
3. WHEN {error condition} THEN the system SHALL {error handling}
4. IF {precondition} THEN the system SHALL {behavior}

**Non-Functional Requirements:**
- Performance: {specific target}
- Security: {specific requirement}
- Accessibility: {specific requirement}

### 2. {Story Title}
As a {role}, I want {feature} so that {benefit}.

**Acceptance Criteria (EARS Format):**
1. WHEN ... THEN the system SHALL ...
2. WHEN ... THEN the system SHALL ...

**Non-Functional Requirements:**
- Performance: {specific target}
- Security: {specific requirement}
- Accessibility: {specific requirement}

---

## Edge Cases & Error Handling

| Scenario | Expected Behavior | Recovery Action |
|----------|-------------------|-----------------|
| Network timeout | Show retry button, cached data if available | Exponential backoff retry |
| Invalid input | Show inline validation error | Highlight field, show message |
| Unauthorized access | Redirect to login, clear tokens | Log security event |
| Server error (5xx) | Show friendly error, report option | Auto-retry with backoff |
| Concurrent edit | Show conflict resolution UI | Merge or overwrite options |

---

## API Contract (if applicable)

### Endpoints Required

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | /api/v1/{resource} | JWT | 100/min | List resources |
| POST | /api/v1/{resource} | JWT | 20/min | Create resource |
| PUT | /api/v1/{resource}/:id | JWT | 20/min | Update resource |
| DELETE | /api/v1/{resource}/:id | JWT | 10/min | Delete resource |

### Request/Response Schema
```json
{
  "request": {},
  "response": {},
  "errors": {}
}
```

---

## Testing Requirements

### Unit Tests
- [ ] Business logic coverage > 80%
- [ ] Edge cases covered
- [ ] Error scenarios covered

### Integration Tests
- [ ] API contract validation
- [ ] Database operations
- [ ] External service mocks

### E2E Tests
- [ ] Critical user flows
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing
- [ ] RTL layout testing

### Accessibility Tests
- [ ] axe-core automated scan
- [ ] Screen reader manual testing
- [ ] Keyboard navigation testing

---

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

---

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
# ❌ BAD - Vague (Non-Enterprise)
- The system should be user-friendly
- Display error message
- Load quickly

# ✅ GOOD - Enterprise Grade (Specific & Testable)
- WHEN form has validation errors THEN the system SHALL display red border on invalid fields AND focus the first invalid field
- WHEN user submits invalid email THEN the system SHALL display "Invalid email format" below the field within 100ms
- WHEN loading appointments THEN the system SHALL complete within 200ms (p95) AND show skeleton loader during fetch
- WHEN API returns 5xx error THEN the system SHALL retry 3 times with exponential backoff AND show "Service temporarily unavailable" after all retries fail
```

---

## 🏢 Enterprise Architecture Patterns

### AWS Well-Architected Pillars to Consider

1. **Operational Excellence**
   - Runbook for common issues defined
   - Deployment rollback procedure documented
   - Monitoring and alerting configured

2. **Security**
   - Defense in depth approach
   - Principle of least privilege
   - Security events logged and alertable

3. **Reliability**
   - Single points of failure eliminated
   - Graceful degradation implemented
   - Recovery procedures tested

4. **Performance Efficiency**
   - Right-sized resources
   - Caching layers defined
   - Performance benchmarks established

5. **Cost Optimization**
   - Resource utilization monitored
   - Unused resources identified
   - Cost allocation tags applied

### Microsoft Azure Well-Architected Considerations

- **Zero Trust Security Model**: Verify explicitly, least privilege, assume breach
- **Microservices Readiness**: Services independently deployable
- **DevOps Integration**: CI/CD pipeline compatible

### SAP Enterprise Patterns

- **Separation of Concerns**: Clear boundaries between UI, business logic, data
- **Extensibility**: Hook points for customization without core changes
- **Multi-tenancy Ready**: Data isolation patterns defined

---

## 🍎 Apple Human Interface Guidelines (UI/UX)

### Design Principles to Apply

- **Clarity**: UI elements clearly communicate purpose
- **Deference**: Content is the focus, not chrome
- **Depth**: Visual layers and motion convey hierarchy

### Interaction Guidelines

- **Direct Manipulation**: Users feel in control
- **Feedback**: Every action has visible response
- **User Control**: Undo/redo, cancel operations supported

---

## After Creating requirements.md

1. **Show Reasoning section first** - Let user validate your analysis
2. **Run Enterprise Checklist** - Verify all gold standard items checked
3. **Show requirements to user** in chat
4. **Ask for feedback**: "Do these requirements capture what you need?"
5. **Iterate** based on feedback until user says "approved" or "looks good"
6. **Create approval marker** when user approves (see below)
7. **Do NOT proceed** to design until explicit approval
8. **Next step**: Run `/implementation` to create design + tasks

---

## 🔒 APPROVAL GATE: Requirements

When user says "approved", "looks good", "yes", or similar:

**Create the approval marker file:**
```
.claude/specs/{feature-name}/.requirements-approved
```

**File content:**
```markdown
# Requirements Approved

**Approved by**: User
**Approved at**: {timestamp}
**Requirements file**: requirements.md

## Approval Confirmation
User confirmed requirements with: "{user's approval message}"

## What was approved
- Problem statement
- User stories with EARS criteria
- Enterprise standards compliance
- Edge cases and error handling

## Next Step
Run `/implementation` to create design.md and tasks.md
```

**After creating marker, confirm:**
```markdown
✅ Requirements approved and locked.

Created: `.claude/specs/{feature-name}/.requirements-approved`

Requirements are now frozen. To make changes:
1. Delete the `.requirements-approved` file
2. Update requirements.md
3. Get re-approval

**Next step**: Run `/implementation` to create design + tasks
```

---

## IMPORTANT Reminders (from CLAUDE.md)

- [ ] ASK if unclear about backend/API - don't assume
- [ ] Search for existing files before proposing new ones
- [ ] Use centralized constants (ROUTES, QueryKeys)
- [ ] Consider RTL/LTR for any UI requirements
- [ ] Security review for any data handling
- [ ] Performance targets defined for all features
- [ ] Accessibility requirements specified
