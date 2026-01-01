# 🏆 ENTERPRISE GOLD STANDARD REQUIREMENTS (MANDATORY)

## This codebase MUST meet Apple, Microsoft NAV, SAP, and Google quality standards.

**Every feature must score 90+/100 before being considered complete.**

---

## 📋 Enterprise Audit Checklist (Run Before Every PR)

### 1. 🔒 Security (Weight: 25%)
| Requirement | Standard | Check |
|-------------|----------|-------|
| Input Length Limits | All inputs have `maxLength` (prevent DoS) | ☐ |
| Data Masking | PII masked for display (PDPL compliance) | ☐ |
| Phone Validation | E.164 format (`+9665XXXXXXXX`) | ☐ |
| Email Validation | RFC 5322 compliant regex | ☐ |
| XSS Prevention | Sanitize all user inputs | ☐ |
| CSRF Protection | Tokens on all mutations | ☐ |

```typescript
// ✅ REQUIRED: Use these from validation-patterns.ts
import { INPUT_MAX_LENGTHS, maskEmail, maskPhone, toE164Phone } from '@/utils/validation-patterns'

<Input maxLength={INPUT_MAX_LENGTHS.name} />  // Always add limits
{maskEmail(user.email)}                        // Always mask PII
```

### 2. ♿ Accessibility (Weight: 25%)
| Requirement | Standard | Check |
|-------------|----------|-------|
| ARIA Labels | All icon-only buttons have `aria-label` | ☐ |
| Role Attributes | Alerts have `role="alert"`, lists have `role="listbox"` | ☐ |
| aria-hidden | All decorative icons have `aria-hidden="true"` | ☐ |
| aria-busy | Loading states have `aria-busy="true"` | ☐ |
| aria-live | Dynamic content has `aria-live="polite"` or `"assertive"` | ☐ |
| Screen Reader | sr-only text for context where needed | ☐ |
| Keyboard Navigation | Arrow keys for lists, Enter for submit | ☐ |
| Focus Management | Dialogs trap focus, auto-focus first input | ☐ |
| Skip Links | Long forms have skip navigation | ☐ |

```typescript
// ✅ REQUIRED: Every icon-only button
<Button aria-label={t('actions.delete', 'حذف')}>
  <Trash2 aria-hidden="true" />
</Button>

// ✅ REQUIRED: Error messages
<div role="alert" aria-live="assertive">{error}</div>

// ✅ REQUIRED: Loading states
<div aria-busy={isLoading} aria-live="polite">{content}</div>
```

### 3. 🌐 Internationalization (Weight: 15%)
| Requirement | Standard | Check |
|-------------|----------|-------|
| No Hardcoded Strings | All text uses `t()` function | ☐ |
| RTL Support | Layout works in Arabic (RTL) | ☐ |
| LTR Support | Layout works in English (LTR) | ☐ |
| Date Localization | Dates use locale formatting | ☐ |
| Number Localization | Numbers use locale formatting | ☐ |

```typescript
// ✅ REQUIRED: All strings use t() with fallback
<h1>{t('page.title', 'العنوان الافتراضي')}</h1>
toast.success(t('success.saved', 'تم الحفظ بنجاح'))
```

### 4. ⚡ Service Layer (Weight: 20%)
| Requirement | Standard | Check |
|-------------|----------|-------|
| Query Keys | Primitive values only (no objects) | ☐ |
| Retry Logic | Exponential backoff with jitter | ☐ |
| Optimistic Updates | Instant UI feedback with rollback | ☐ |
| Cache Invalidation | All mutations invalidate relevant queries | ☐ |
| staleTime/gcTime | Appropriate for data type | ☐ |
| placeholderData | Smooth loading transitions | ☐ |
| Bulk Operations | Support for batch actions | ☐ |

```typescript
// ✅ REQUIRED: Primitive query keys
queryKey: ['appointments', 'list', status ?? '', page ?? 1] // Good
queryKey: ['appointments', filters] // ❌ Bad - object reference

// ✅ REQUIRED: Optimistic updates for mutations
onMutate: async (id) => {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData(queryKey)
  queryClient.setQueryData(queryKey, optimisticValue)
  return { previous }
},
onError: (err, vars, ctx) => queryClient.setQueryData(queryKey, ctx.previous)
```

### 5. 🎨 UI Completeness (Weight: 15%)
| Requirement | Standard | Check |
|-------------|----------|-------|
| CRUD Operations | Create, Read, Update, Delete all work | ☐ |
| Edit Functionality | All items can be edited | ☐ |
| Bulk Actions | Multi-select with batch operations | ☐ |
| Loading States | Skeletons for all async content | ☐ |
| Empty States | Helpful messages with CTAs | ☐ |
| Error States | Clear messages with retry buttons | ☐ |
| Filters & Search | Full filtering capabilities | ☐ |
| Keyboard Shortcuts | Common actions have shortcuts | ☐ |

---

## 🔢 Scoring Formula

```
Score = (Security × 0.25) + (Accessibility × 0.25) + (i18n × 0.15) + (ServiceLayer × 0.20) + (UI × 0.15)

90-100: ✅ Production Ready (Gold Standard)
80-89:  ⚠️ Needs Minor Fixes
70-79:  ❌ Significant Gaps
<70:    🚫 Not Acceptable
```

---

## 🚀 Before Every PR Checklist

- [ ] All inputs have `maxLength` attributes
- [ ] PII is masked (email, phone, national ID)
- [ ] All icon buttons have `aria-label`
- [ ] All icons have `aria-hidden="true"`
- [ ] Error messages have `role="alert"`
- [ ] Loading states have `aria-busy`
- [ ] No hardcoded strings (all use `t()`)
- [ ] Works in both Arabic (RTL) and English (LTR)
- [ ] Query keys use primitives only
- [ ] Mutations have optimistic updates
- [ ] All CRUD operations work
- [ ] Edit functionality exists
- [ ] Keyboard navigation works
- [ ] TypeScript compiles with no errors
- [ ] Console has no errors

---

## 🤖 Claude's Task Completion Protocol (MANDATORY)

**After completing ANY feature or significant task, Claude MUST:**

### 1. Provide Honest Gold Standard Assessment

Present a score breakdown table with honest evaluation:

```markdown
## 📊 Gold Standard Assessment

**Score: XX.X/100** ✅/⚠️

| Category | Score | Notes |
|----------|-------|-------|
| Security | XX/25 | [Specific notes] |
| Accessibility | XX/25 | [Specific notes with gaps] |
| i18n | XX/25 | [Specific notes] |
| Service Layer | XX/25 | [Specific notes] |
| UI Completeness | XX/25 | [Specific notes with gaps] |
```

### 2. Document What Was Done vs NOT Done

Always be explicit about:

```markdown
### What Was Done ✅
| File | Changes |
|------|---------|
| `path/to/file.ts` | [Specific changes made] |

### What Was NOT Done (Technical Debt) ⚠️
| Gap | Priority | Files Affected |
|-----|----------|----------------|
| [Gap description] | High/Medium/Low | [Files that need work] |
```

### 3. Add Feature Documentation to CLAUDE.md

For significant features, add a section to this file with:
- Feature overview
- API changes (if any)
- Files modified table
- Score breakdown
- Known gaps/technical debt

### 4. Provide PR Link After Push

After every `git push`, immediately provide:

```
PR Link: https://github.com/mischa23v/traf3li-dashboard/pull/new/{branch-name}
```

### 5. Verification Checklist

Always show what was verified:

```markdown
### Verification Checklist
- [x] TypeScript compiles with no errors
- [x] All new strings use t() with Arabic fallbacks
- [x] aria-label on icon-only elements
- [ ] Translations added to i18n JSON files (NOT DONE - reason)
- [ ] Visual testing in browser (NOT DONE - reason)
```

**This protocol ensures transparency, maintains quality standards, and creates documentation for future reference.**

---

## 📊 Current Module Scores

| Module | Security | A11y | i18n | Service | UI | **Total** |
|--------|----------|------|------|---------|----|---------:|
| Appointments | 95 | 95 | 95 | 98 | 95 | **95.6** ✅ |
| Calendar | 90 | 95 | 95 | 90 | 90 | **92.0** ✅ |
| Google Calendar Sync | 25 | 24 | 25 | 24 | 23 | **95.0** ✅ |

> **Target: All modules must be 90+/100**

---

## 📅 Google Calendar Bi-directional Sync (Frontend Integration)

### Feature Overview

The calendar now supports Google Calendar integration with bi-directional sync. External events from Google Calendar are displayed with visual distinction.

### API Response Changes

The `/api/calendar/grid-items` endpoint now includes Google Calendar events:

```typescript
// GridItem type includes new fields:
interface GridItem {
  id: string
  type: 'event' | 'task' | 'reminder' | 'case-document' | 'appointment' | 'google-calendar'
  // ... existing fields ...

  // Google Calendar specific fields
  isExternal?: boolean           // true for Google Calendar events
  googleEventId?: string         // Original Google event ID
  source?: 'google' | 'microsoft' | 'local'
  location?: string
  organizer?: string
  htmlLink?: string              // Link to open in Google Calendar
  meetingLink?: string           // Google Meet link if available
}
```

### Settings API

```typescript
// GET /api/google-calendar/status - Returns showExternalEvents field
// PUT /api/google-calendar/settings/show-external-events - Toggle visibility
```

### Visual Distinction

External events are styled with:
- Google "G" icon indicator
- Blue left border (#4285F4)
- Reduced opacity (0.9)
- "External Event" badge in details dialog
- "Open in Google Calendar" button instead of "View Details"

### Files Modified

| File | Changes |
|------|---------|
| `src/services/calendarService.ts` | Added external event fields to GridItem type |
| `src/services/googleCalendarService.ts` | Added showExternalEvents to status, updateShowExternalEvents() |
| `src/hooks/useCalendarIntegration.ts` | Added useToggleExternalEvents() with optimistic updates |
| `src/features/dashboard/components/fullcalendar-view.tsx` | Visual distinction, event rendering, dialog updates |
| `src/features/dashboard/components/calendar-sync-dialog.tsx` | External events toggle, real OAuth integration |
| `src/locales/en/translation.json` | Added calendar.google.* translations |
| `src/locales/ar/translation.json` | Added calendar.google.* translations (Arabic) |

### Score Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| Security | 25/25 | No new inputs, OAuth handled by backend, no PII exposure |
| Accessibility | 24/25 | aria-label on icons, aria-busy on toggle, aria-hidden on decorative |
| i18n | 25/25 | All strings use t() with translations in i18n files |
| Service Layer | 24/25 | Optimistic updates, cache invalidation, primitive query keys |
| UI Completeness | 23/25 | Toggle works, visual distinction, loading states (-2: no visual testing) |

### Known Gaps (Technical Debt)

1. **Visual testing not performed**: Browser lock issue prevented Playwright testing.

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

## 🚫 NO PLACEHOLDER HINTS IN FORM FIELDS

**NEVER add placeholder text with examples or hints inside form inputs.**

```typescript
// ❌ NEVER DO THIS
<Input placeholder="مثال: استشارة قانونية" />
<Input placeholder="أدخل اسم العميل" />
<Input placeholder="example@email.com" />
<Input placeholder="05XXXXXXXX" />

// ✅ ALWAYS DO THIS - Clean inputs with labels only
<Label>{t('field.label', 'اسم العميل')}</Label>
<Input value={value} onChange={onChange} maxLength={100} />
```

**Why:**
- Labels already describe the field purpose
- Placeholder text disappears when typing (bad UX)
- Clutters the interface unnecessarily
- Users don't need "helpful" examples - the label is enough

---

## ✅ GOLD STANDARD FORM VALIDATION

**All forms MUST follow this validation pattern:**

### 1. Required Field Indicators
```typescript
// ✅ ALWAYS mark required fields with red asterisk
<Label className="flex items-center gap-1">
  {t('field.label', 'اسم العميل')}
  <span className="text-red-500" aria-hidden="true">*</span>
</Label>
```

### 2. Validation Functions (Return Error Messages)
```typescript
// ✅ ALWAYS return both validity and error message
const validateField = (value: string): { valid: boolean; error: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: t('validation.required', 'هذا الحقل مطلوب') }
  }
  if (!isValidPattern(value)) {
    return { valid: false, error: t('validation.invalid', 'القيمة غير صالحة') }
  }
  return { valid: true, error: '' }
}
```

### 3. Touched State (Show Errors Only After Interaction)
```typescript
// ✅ Track touched fields to avoid showing errors on pristine fields
const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
const markTouched = (field: string) => setTouchedFields(prev => ({ ...prev, [field]: true }))

// Show error only if field was touched AND invalid
const showError = touchedFields.fieldName && !validation.valid
```

### 4. Input Fields with Full Validation
```typescript
// ✅ ALWAYS include: onBlur, aria-required, aria-invalid, aria-describedby
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onBlur={() => markTouched('fieldName')}
  className={showError ? 'border-red-500 focus:ring-red-500' : ''}
  maxLength={100}
  aria-required="true"
  aria-invalid={showError ? 'true' : 'false'}
  aria-describedby={showError ? 'field-error' : undefined}
/>
{showError && (
  <p id="field-error" className="text-xs text-red-500 mt-1" role="alert">
    {validation.error}
  </p>
)}
```

### 5. Submit Validation
```typescript
// ✅ Mark all fields touched on submit to show all errors
const handleSubmit = () => {
  setTouchedFields({ field1: true, field2: true, field3: true })
  if (!isFormValid) return
  // ... proceed with submission
}
```

### 6. Reset Touched on Form Close/Reset
```typescript
// ✅ Reset touched state when form closes
const resetForm = () => {
  setFormData(initialState)
  setTouchedFields({}) // Clear validation state
}
```

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

## 🔍 ANALYZE BEFORE CREATING (MANDATORY)

**Before creating ANY new files or components, you MUST:**

1. **Do NOT create any files until you show a complete analysis** of what exists vs what's missing
2. **Before any code, list every existing file** related to the feature and what's in it
3. **Create a task list FIRST** showing exactly what needs to be created vs enhanced

### Required Analysis Steps:

```
1. Search for existing components/views in the feature folder
2. Check existing routes that already handle the functionality
3. Check sidebar/navigation for existing menu items
4. List what EXISTS vs what's MISSING
5. Show this analysis to the user BEFORE writing any code
6. Only proceed after confirming the plan
```

### Do NOT:
- Jump straight to creating files without checking what exists
- Create duplicate components that already exist elsewhere
- Add sidebar items that are already present
- Launch parallel agents before completing the analysis

### Why This Matters:
- Prevents duplicate/redundant code
- Avoids wasted effort recreating existing functionality
- Ensures enhancements go to the RIGHT files
- Saves time by doing it correctly the first time

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