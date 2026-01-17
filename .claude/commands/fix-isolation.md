# /fix-isolation - Tenant Isolation Validation & Repair

Run this command to scan and repair tenant isolation violations ensuring proper firmId/lawyerId patterns across the codebase.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Scans all API calls for tenant context (firmId/lawyerId)
2. Identifies missing tenant isolation in queries
3. Detects potential cross-tenant data access
4. Reports violations with suggested fixes
5. Can auto-fix simple violations

---

## Why Tenant Isolation Matters

**CRITICAL**: This is a legal SaaS platform. Each law firm (tenant) must ONLY see their own data.

**Violations can cause:**
- Data breaches between law firms
- Confidentiality violations
- Legal liability
- Regulatory non-compliance (PDPL)
- Loss of customer trust

---

## Tenant Context in TRAF3LI

### Primary Identifiers
| Field | Purpose | Required In |
|-------|---------|-------------|
| `firmId` | Law firm identifier | ALL queries |
| `lawyerId` | Individual lawyer | User-specific queries |
| `userId` | Authenticated user | Session context |

### Context Flow
```
User Login → Session (firmId, lawyerId, userId) → API Calls → Backend Filter
```

---

## Isolation Checks

### 1. Service Layer - API Calls
```bash
# Check for API calls without tenant context
Grep: "apiClient.get|apiClient.post|apiClient.patch|apiClient.delete" in src/services/

# These endpoints should include firmId context
Grep: "/clients|/cases|/invoices|/tasks|/documents" without "firmId" param
```

**Expected Pattern:**
```typescript
// GOOD: Tenant context included
const response = await apiClient.get('/clients', {
  params: { firmId: context.firmId, ...filters }
})

// BAD: No tenant context
const response = await apiClient.get('/clients')
```

### 2. React Query Hooks
```bash
# Check query keys include tenant context
Grep: "useQuery|queryKey" in src/hooks/

# Query keys should include firmId for proper cache isolation
Grep: "QueryKeys\." without firmId in key
```

**Expected Pattern:**
```typescript
// GOOD: Tenant-scoped query key
queryKey: QueryKeys.clients.list({ firmId, ...filters })

// BAD: Global query key (cache collision between tenants)
queryKey: ['clients', filters]
```

### 3. Component Data Fetching
```bash
# Check components don't bypass service layer
Grep: "fetch|axios" directly in src/components/ or src/features/

# All data should come through hooks
Grep: "apiClient" in component files
```

**Expected Pattern:**
```typescript
// GOOD: Use hook with implicit tenant context
const { data: clients } = useClients(filters)

// BAD: Direct API call without tenant context
const clients = await apiClient.get('/clients')
```

### 4. Cache Invalidation
```bash
# Check cache invalidation includes tenant scope
Grep: "invalidateQueries|invalidateCache" in src/hooks/
```

**Expected Pattern:**
```typescript
// GOOD: Tenant-scoped invalidation
invalidateCache.clients.all(firmId)

// BAD: Global invalidation (affects all tenants)
queryClient.invalidateQueries(['clients'])
```

### 5. State Management
```bash
# Check global state doesn't leak tenant data
Grep: "createContext|useContext" in src/

# Check for potential cross-tenant state
Grep: "globalState|appState" without tenant scope
```

### 6. Local Storage / Session Storage
```bash
# Check storage keys include tenant context
Grep: "localStorage|sessionStorage" in src/

# Storage should be tenant-scoped
Grep: "setItem|getItem" patterns
```

**Expected Pattern:**
```typescript
// GOOD: Tenant-scoped storage
localStorage.setItem(`${firmId}:preferences`, data)

// BAD: Global storage (data leaks on tenant switch)
localStorage.setItem('preferences', data)
```

---

## Common Violations

### Violation 1: Missing firmId in API Calls
```typescript
// VIOLATION
const getClients = async () => {
  return apiClient.get('/clients')
}

// FIX
const getClients = async (firmId: string) => {
  return apiClient.get('/clients', { params: { firmId } })
}
```

### Violation 2: Global Query Keys
```typescript
// VIOLATION
const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients()
  })
}

// FIX
const useClients = (firmId: string) => {
  return useQuery({
    queryKey: QueryKeys.clients.list({ firmId }),
    queryFn: () => clientService.getClients(firmId)
  })
}
```

### Violation 3: Unscoped Cache Invalidation
```typescript
// VIOLATION
queryClient.invalidateQueries(['clients'])

// FIX
queryClient.invalidateQueries(QueryKeys.clients.all(firmId))
```

### Violation 4: Global Storage
```typescript
// VIOLATION
localStorage.setItem('selectedClient', clientId)

// FIX
localStorage.setItem(`${firmId}:selectedClient`, clientId)
```

---

## Auto-Fix Capabilities

The following can be auto-fixed:
- [ ] Add firmId parameter to service functions
- [ ] Update query keys to include firmId
- [ ] Scope localStorage keys with firmId
- [ ] Add tenant context to cache invalidation

**Cannot auto-fix (manual required):**
- Complex conditional tenant logic
- Multi-tenant aggregation queries
- Cross-tenant admin functions
- Legacy code with deep coupling

---

## Output Format

```markdown
# Tenant Isolation Report

## Summary
| Check | Files Scanned | Violations | Auto-Fixable |
|-------|---------------|------------|--------------|
| API Calls | X | X | X |
| Query Keys | X | X | X |
| Components | X | X | X |
| Cache | X | X | X |
| Storage | X | X | X |

## Critical Violations (Data Breach Risk)
1. **[File:Line]** - [Description] - [Fix]

## High Priority Violations
1. **[File:Line]** - [Description] - [Fix]

## Medium Priority Violations
1. **[File:Line]** - [Description] - [Fix]

## Auto-Fix Applied
1. [File] - [Change made]

## Manual Fixes Required
1. [File:Line] - [What needs to be done]

## Verification Commands
```bash
# Verify no remaining violations
grep -r "apiClient.get\|apiClient.post" src/services/ | grep -v "firmId"
```
```

---

## MANDATORY STOP

After scan, output:

```markdown
---

## Isolation Check Complete

**Verdict**: PASS / FAIL

**Risk Level**: NONE / LOW / MEDIUM / HIGH / CRITICAL

### Summary
| Category | Status |
|----------|--------|
| API Calls | PASS/FAIL |
| Query Keys | PASS/FAIL |
| Components | PASS/FAIL |
| Cache | PASS/FAIL |
| Storage | PASS/FAIL |

### Critical Violations (if any)
- {Violation 1}

### Files Fixed
- {File 1}

---

If PASS:
→ Tenant isolation verified, proceed to `/security-audit`

If FAIL with CRITICAL:
→ STOP. Fix critical violations before ANY deployment.
→ Data breach risk exists.

If FAIL with HIGH/MEDIUM:
→ Fix violations, re-run `/fix-isolation`

Reply with `yes` to apply auto-fixes, or `manual` to skip auto-fix.
```

**WAIT FOR USER RESPONSE.**

---

## Workflow Position

```
/arewedone → /naming-check → /arch-review →
/fix-isolation ← YOU ARE HERE → /security-audit → /verify → PR
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Initial version (ported from backend) |
