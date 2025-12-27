---

## 🔒 CENTRALIZED CONFIGURATION RULES (MANDATORY)

**NEVER hardcode these values. ALWAYS use centralized constants:**

### 1. Routes - Use `ROUTES` Constants
```typescript
// ❌ NEVER DO THIS
navigate('/dashboard/clients')
<Link to="/dashboard/cases/new">

// ✅ ALWAYS DO THIS
import { ROUTES } from '@/constants/routes'
navigate(ROUTES.dashboard.clients.list)
<Link to={ROUTES.dashboard.cases.new}>

// For dynamic routes:
navigate(ROUTES.dashboard.clients.detail(clientId))
```

### 2. Query Keys - Use `QueryKeys` Factory
```typescript
// ❌ NEVER DO THIS
queryKey: ['clients', clientId]
queryKey: ['invoices', 'list', filters]

// ✅ ALWAYS DO THIS
import { QueryKeys } from '@/lib/query-keys'
queryKey: QueryKeys.clients.detail(clientId)
queryKey: QueryKeys.invoices.list(filters)

// If a key doesn't exist, ADD IT to query-keys.ts first
```

### 3. Cache Times - Use `CACHE_TIMES` Constants
```typescript
// ❌ NEVER DO THIS
staleTime: 300000
staleTime: 5 * 60 * 1000
gcTime: 1800000

// ✅ ALWAYS DO THIS
import { CACHE_TIMES } from '@/config/cache'
staleTime: CACHE_TIMES.MEDIUM      // 5 minutes
staleTime: CACHE_TIMES.LONG        // 30 minutes
gcTime: CACHE_TIMES.GC_MEDIUM      // 30 minutes
```

### 4. Cache Invalidation - Use `invalidateCache` Helper
```typescript
// ❌ NEVER DO THIS
queryClient.invalidateQueries({ queryKey: ['clients'] })
queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] })

// ✅ ALWAYS DO THIS
import { invalidateCache } from '@/lib/cache-invalidation'
invalidateCache.clients.all()
invalidateCache.invoices.lists()
invalidateCache.all()  // For global invalidation
```

### 5. API Endpoints - Use Centralized API Config
```typescript
// ❌ NEVER DO THIS
fetch('/api/v1/clients')
axios.get('/api/v1/invoices')

// ✅ ALWAYS DO THIS
import { API_ENDPOINTS } from '@/config/api'
fetch(API_ENDPOINTS.clients.list)
```

### When Adding New Features:

1. **New Route?** → Add to `src/constants/routes.ts` first
2. **New Query?** → Add key to `src/lib/query-keys.ts` first
3. **New Cache Pattern?** → Add to `src/config/cache.ts` if needed
4. **New Invalidation?** → Add to `src/lib/cache-invalidation.ts` first

### Why This Matters:
- **Type Safety**: Autocomplete and compile-time checking
- **Maintainability**: Change once, update everywhere
- **Consistency**: Same patterns across entire codebase
- **Refactoring**: Easy to rename/restructure
- **Debugging**: Single source of truth

---

## ⚠️ MOST IMPORTANT RULE - ASK BEFORE ASSUMING

**THIS RULE MUST NEVER BE BROKEN:**

If you need more information about:
- Backend API structure, endpoints, or responses
- Frontend component behavior or data flow
- Database schema or data relationships
- How existing features work
- What the user expects from a feature

**YOU MUST ASK THE USER BEFORE PROCEEDING.**

Do NOT:
- Assume how the backend works
- Guess API response structures
- Make up endpoints that may not exist
- Implement features based on assumptions

This prevents wasted effort and bugs caused by incorrect assumptions. When in doubt, ASK FIRST.

---

## 🎨 Visual Development & Testing

### Design Principles
Follow: `/context/design-principles.md`

### Quick Visual Check

**After EVERY front-end change, you MUST:**

1. Navigate to the changed page: `mcp__playwright__browser_navigate("http://localhost:5173/your-page")`
2. Test Arabic (RTL): Switch language → Take screenshot
3. Test English (LTR): Switch language → Take screenshot
4. Test mobile: `mcp__playwright__browser_resize(375, 667)` → Take screenshot
5. Check console: `mcp__playwright__browser_console_messages()`

### Comprehensive Review

For major changes or before PRs, run:
```
/design-review
```

This will:
- Test both languages (Arabic/English)
- Test all viewports (mobile/tablet/desktop)
- Check accessibility (WCAG AA)
- Verify PDPL compliance
- Check console for errors
- Provide detailed report with screenshots

### When to Use

**Quick Check**: Every small UI change
**Full Review**: Before PRs, major features, production deployment

---

## 🔀 Git & Pull Request Rules

### After Every Push

**MANDATORY: After pushing changes, you MUST:**

1. Create a pull request using the GitHub PR creation URL
2. Provide the PR link to the user

Since `gh` CLI may not be available, use the push output URL format:
```
https://github.com/mischa23v/traf3li-dashboard/pull/new/{branch-name}
```

### Example Workflow
```
git push -u origin claude/feature-branch-xyz
# Then immediately provide:
# "PR can be created here: https://github.com/mischa23v/traf3li-dashboard/pull/new/claude/feature-branch-xyz"
```