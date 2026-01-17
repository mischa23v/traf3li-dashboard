# /security-audit - Security Pattern Compliance Check

Run this command before `/verify` to ensure no security vulnerabilities exist in the codebase.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Scans for OWASP Top 10 vulnerabilities
2. Checks authentication/authorization patterns
3. Validates input sanitization
4. Reviews sensitive data handling
5. Audits third-party dependencies

---

## Security Checks

### 1. XSS Prevention
```bash
# Check for dangerous innerHTML usage
Grep: "dangerouslySetInnerHTML" in src/
Grep: "innerHTML" in src/

# Check for unsanitized user input in JSX
Grep: "{.*userInput.*}" without sanitization
```

**Rules:**
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] All user inputs escaped before rendering
- [ ] Rich text uses DOMPurify or similar

### 2. Sensitive Data Exposure
```bash
# Check for hardcoded secrets
Grep: "password|secret|api_key|apiKey|token|auth" in src/ (case insensitive)
Grep: "Bearer " in src/
Grep: "eyJ" (JWT pattern) in src/

# Check for console logging sensitive data
Grep: "console.log.*token|password|secret" in src/
```

**Rules:**
- [ ] No hardcoded API keys or secrets
- [ ] No passwords in code or logs
- [ ] Tokens stored securely (httpOnly cookies preferred)
- [ ] Sensitive data not logged to console

### 3. Authentication Patterns
```bash
# Check auth token handling
Grep: "localStorage.setItem.*token" in src/
Grep: "sessionStorage.setItem.*token" in src/

# Check for auth bypass risks
Grep: "isAuthenticated.*false" in src/
Grep: "skipAuth|bypassAuth|noAuth" in src/
```

**Rules:**
- [ ] Auth tokens use httpOnly cookies (BFF pattern)
- [ ] No tokens in localStorage (XSS vulnerable)
- [ ] No auth bypass flags in production code
- [ ] Session management follows best practices

### 4. Input Validation
```bash
# Check form validation
Grep: "<input" without validation in src/
Grep: "onChange.*setState" without validation

# Check API input validation
Grep: "req.body" without validation in services
```

**Rules:**
- [ ] All forms have validation (Zod/Yup)
- [ ] Server-side validation for all inputs
- [ ] Type checking on API responses
- [ ] File upload validation (type, size)

### 5. CSRF Protection
```bash
# Check for form submissions without CSRF
Grep: "method=\"POST\"" without csrf token
Grep: "axios.post|fetch.*POST" for CSRF handling
```

**Rules:**
- [ ] All mutations use proper CSRF protection
- [ ] BFF pattern handles CSRF automatically
- [ ] No direct API calls bypassing BFF

### 6. Authorization (RBAC)
```bash
# Check permission checks
Grep: "hasPermission|canAccess|isAuthorized" in src/
Grep: "role.*admin|manager|user" in src/

# Check for missing auth checks
Grep: "useQuery|useMutation" without auth context
```

**Rules:**
- [ ] All routes have permission checks
- [ ] Role-based access properly enforced
- [ ] No privilege escalation paths
- [ ] Sensitive actions require re-authentication

### 7. Dependency Vulnerabilities
```bash
# Run npm audit
npm audit --json

# Check for known vulnerable packages
npm audit --audit-level=high
```

**Rules:**
- [ ] No high/critical vulnerabilities
- [ ] Dependencies regularly updated
- [ ] Lockfile integrity maintained

### 8. Multi-Tenancy Isolation
```bash
# Check for firmId/lawyerId in API calls
Grep: "firmId|lawyerId" in services/
Grep: "tenantId|organizationId" in src/

# Check for data leakage risks
Grep: "getAll|findAll" without tenant filter
```

**Rules:**
- [ ] All queries include tenant context (firmId)
- [ ] No cross-tenant data access possible
- [ ] User context properly validated
- [ ] API responses filtered by tenant

### 9. Error Handling Security
```bash
# Check for sensitive error exposure
Grep: "catch.*error.*message" in src/
Grep: "stack|stackTrace" in src/

# Check error boundaries
Grep: "ErrorBoundary" in src/
```

**Rules:**
- [ ] Error messages don't expose internals
- [ ] Stack traces not shown to users
- [ ] Error boundaries catch component errors
- [ ] Bilingual user-friendly error messages

### 10. API Security
```bash
# Check API endpoint patterns
Grep: "http://|https://" hardcoded URLs
Grep: "localhost|127.0.0.1" in production code

# Check request handling
Grep: "axios.create|fetch" for security headers
```

**Rules:**
- [ ] No hardcoded URLs (use env vars)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting considered

---

## Output Format

```markdown
# Security Audit Report

## Summary
| Check | Status | Severity | Issues |
|-------|--------|----------|--------|
| XSS Prevention | PASS/FAIL | High | X |
| Sensitive Data | PASS/FAIL | Critical | X |
| Authentication | PASS/FAIL | Critical | X |
| Input Validation | PASS/FAIL | High | X |
| CSRF Protection | PASS/FAIL | High | X |
| Authorization | PASS/FAIL | High | X |
| Dependencies | PASS/FAIL | Variable | X |
| Multi-Tenancy | PASS/FAIL | Critical | X |
| Error Handling | PASS/FAIL | Medium | X |
| API Security | PASS/FAIL | High | X |

## Critical Issues (Fix Immediately)
1. [Issue] - [Location] - [Fix]

## High Priority Issues
1. [Issue] - [Location] - [Fix]

## Medium Priority Issues
1. [Issue] - [Location] - [Fix]

## Recommendations
1. [Security enhancement suggestion]
```

---

## MANDATORY STOP

After audit, output:

```markdown
---

## Security Audit Complete

**Verdict**: PASS / FAIL

**Risk Level**: LOW / MEDIUM / HIGH / CRITICAL

### Summary
| Category | Status |
|----------|--------|
| XSS | PASS/FAIL |
| Auth | PASS/FAIL |
| Data | PASS/FAIL |
| Dependencies | PASS/FAIL |
| Tenancy | PASS/FAIL |

### Critical Issues (if any)
- {Issue 1}

### High Issues (if any)
- {Issue 1}

---

If PASS:
→ Proceed to `/verify`

If FAIL with CRITICAL:
→ STOP. Fix critical issues before ANY deployment.

If FAIL with HIGH:
→ Fix high issues, re-run `/security-audit`

Reply with `yes` or `continue` to proceed.
```

**WAIT FOR USER RESPONSE.**

---

## Workflow Position

```
/arewedone → /naming-check → /arch-review →
/security-audit ← YOU ARE HERE → /verify → PR
```

---

## OWASP Top 10 Reference (2021)

| # | Vulnerability | Frontend Relevance |
|---|--------------|-------------------|
| A01 | Broken Access Control | High - RBAC, routes |
| A02 | Cryptographic Failures | Medium - token handling |
| A03 | Injection | High - XSS, template injection |
| A04 | Insecure Design | High - architecture |
| A05 | Security Misconfiguration | Medium - headers, CORS |
| A06 | Vulnerable Components | High - npm packages |
| A07 | Auth Failures | High - session management |
| A08 | Data Integrity Failures | Medium - state management |
| A09 | Logging Failures | Low - console security |
| A10 | SSRF | Low - mainly backend |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Initial version (ported from backend) |
