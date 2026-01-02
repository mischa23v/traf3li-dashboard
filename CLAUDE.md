# 🛑 STOP. READ THIS FIRST.

**MANDATORY: Before writing ANY code, you MUST complete these steps:**

## ✅ Pre-Work Checklist (REQUIRED)

| # | Step | Action |
|---|------|--------|
| 1 | **INVESTIGATE** | Search for existing files related to the task |
| 2 | **LIST** | Show user what EXISTS vs what's MISSING |
| 3 | **ASK** | If unsure about backend/API/data - ASK USER |
| 4 | **PLAN** | Create todo list of changes needed |
| 5 | **CONFIRM** | Get user approval before writing code |

**DO NOT SKIP ANY STEP. If you skip, you will create bugs and duplicate code.**

---

## ⚠️ The #1 Rule: ASK, DON'T ASSUME

If you need information about:
- Backend API structure or responses
- How existing features work
- What the user expects

**→ ASK THE USER. Don't guess. Don't assume.**

---

## 🔍 Before Creating ANY Files

```
1. Search: Glob/Grep for existing components
2. Read: Check what's in the existing files
3. List: Show "EXISTS vs MISSING" to user
4. Confirm: Wait for user approval
5. Then: Write code
```

**NEVER create files without showing your analysis first.**

---

## 🔒 Use Centralized Constants (MANDATORY)

| Type | Import From | Example |
|------|-------------|---------|
| Routes | `@/constants/routes` | `ROUTES.dashboard.clients.list` |
| Query Keys | `@/lib/query-keys` | `QueryKeys.clients.detail(id)` |
| Cache Times | `@/config/cache` | `CACHE_TIMES.MEDIUM` |
| Invalidation | `@/lib/cache-invalidation` | `invalidateCache.clients.all()` |

**NEVER hardcode routes, query keys, or magic numbers.**

---

## 🎨 After EVERY UI Change

1. Navigate to the page
2. Test Arabic (RTL) - take screenshot
3. Test English (LTR) - take screenshot
4. Check console for errors
5. Test mobile viewport if applicable

For major changes: Run `/design-review`

---

## 🔀 After Every Push

Provide PR link:
```
https://github.com/mischa23v/traf3li-dashboard/pull/new/{branch-name}
```

---

## ✅ Completion Checklist

Before saying "done", verify:

- [ ] No TypeScript errors (`npm run build`)
- [ ] Used centralized constants (not hardcoded values)
- [ ] Tested in browser (both languages if UI)
- [ ] No console errors
- [ ] Created PR link if pushed

---

## 📁 Key Files Reference

| Purpose | Location |
|---------|----------|
| Routes | `src/constants/routes.ts` |
| Query Keys | `src/lib/query-keys.ts` |
| Cache Config | `src/config/cache.ts` |
| Cache Invalidation | `src/lib/cache-invalidation.ts` |
| Design Principles | `/context/design-principles.md` |
