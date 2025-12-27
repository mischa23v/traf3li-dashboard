# Config Constants Migration Examples

This document shows specific examples of where to replace magic numbers with the new centralized config constants.

## Tax Configuration

### Example 1: Invoice VAT Calculation
**File:** `src/lib/currency.ts`

```typescript
// BEFORE
export const calculateVAT = (amount: number, vatRate: number = 15): number => {
  return Math.round(amount * (vatRate / 100))
}

// AFTER
import { TAX_CONFIG } from '@/config'

export const calculateVAT = (amount: number, vatRate: number = TAX_CONFIG.SAUDI_VAT_RATE_PERCENT): number => {
  return Math.round(amount * (vatRate / 100))
}
```

### Example 2: Backend Invoice Controller
**Files:** Backend invoice calculations

```typescript
// BEFORE
const vatAmount = subtotal * 0.15

// AFTER
import { TAX_CONFIG } from '@/config'
const vatAmount = subtotal * TAX_CONFIG.SAUDI_VAT_RATE
```

---

## Cache Configuration

### Example 1: Main Query Client
**File:** `src/main.tsx`

```typescript
// BEFORE
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
})

// AFTER
import { CACHE_TIMES } from '@/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.SHORT,
      gcTime: CACHE_TIMES.GC_SHORT,
    },
  },
})
```

### Example 2: Custom Hooks
**File:** `src/hooks/useAdvances.ts`

```typescript
// BEFORE
const STATS_STALE_TIME = 30 * 60 * 1000
const STATS_GC_TIME = 60 * 60 * 1000
const LIST_STALE_TIME = 5 * 60 * 1000

// AFTER
import { CACHE_TIMES } from '@/config'

const STATS_STALE_TIME = CACHE_TIMES.LONG
const STATS_GC_TIME = CACHE_TIMES.GC_LONG
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM
```

### Example 3: Pre-configured Cache Settings
**File:** Any hook using React Query

```typescript
// BEFORE
useQuery({
  queryKey: ['stats'],
  queryFn: getStats,
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
})

// AFTER
import { CACHE_CONFIG } from '@/config'

useQuery({
  queryKey: ['stats'],
  queryFn: getStats,
  ...CACHE_CONFIG.queries.stats,
})
```

---

## Pagination Configuration

### Example 1: Data Tables
**File:** `src/components/data-table/data-table.tsx`

```typescript
// BEFORE
pageSize = 10,

// AFTER
import { PAGINATION } from '@/config'
pageSize = PAGINATION.MEDIUM,
```

### Example 2: Feature-Specific Pagination
**File:** `src/features/clients/index.tsx`

```typescript
// BEFORE
limit: search.pageSize || 12,

// AFTER
import { PAGINATION } from '@/config'
limit: search.pageSize || PAGINATION.FEATURES.CLIENTS,
```

### Example 3: Page Size Dropdown
**File:** `src/components/data-table/pagination.tsx`

```typescript
// BEFORE
{[10, 20, 30, 40, 50].map((pageSize) => (
  <SelectItem key={pageSize} value={`${pageSize}`}>
    {pageSize}
  </SelectItem>
))}

// AFTER
import { PAGINATION } from '@/config'

{PAGINATION.OPTIONS.map((pageSize) => (
  <SelectItem key={pageSize} value={`${pageSize}`}>
    {pageSize}
  </SelectItem>
))}
```

---

## UI Constants

### Example 1: Whiteboard Canvas
**File:** `src/features/case-notion/components/whiteboard/whiteboard-block.tsx`

```typescript
// BEFORE
const MIN_WIDTH = 150
const MIN_HEIGHT = 100
const DEFAULT_WIDTH = 200
const DEFAULT_HEIGHT = 150

// AFTER
import { CANVAS } from '@/config'

const MIN_WIDTH = CANVAS.BLOCK.MIN_WIDTH
const MIN_HEIGHT = CANVAS.BLOCK.MIN_HEIGHT
const DEFAULT_WIDTH = CANVAS.BLOCK.DEFAULT_WIDTH
const DEFAULT_HEIGHT = CANVAS.BLOCK.DEFAULT_HEIGHT
```

### Example 2: Map/Geofencing
**File:** `src/features/hr/components/geofencing-create-view.tsx`

```typescript
// BEFORE
const [radius, setRadius] = useState<number>(500)

// AFTER
import { MAP } from '@/config'
const [radius, setRadius] = useState<number>(MAP.DEFAULT_RADIUS)
```

### Example 3: File Upload Limits
**File:** Any file upload component

```typescript
// BEFORE
const MAX_FILE_SIZE = 10 * 1024 * 1024

// AFTER
import { FILE_LIMITS } from '@/config'
const MAX_FILE_SIZE = FILE_LIMITS.RECOMMENDED.DOCUMENTS
```

### Example 4: Session Timeouts
**File:** Authentication/session management

```typescript
// BEFORE
const warningTime = 5 * 60 * 1000
const accessTokenExpiry = 15 * 60 * 1000

// AFTER
import { TIMEOUTS } from '@/config'
const warningTime = TIMEOUTS.SESSION_WARNING
const accessTokenExpiry = TIMEOUTS.ACCESS_TOKEN
```

---

## Business Rules

### Example 1: Mileage Calculations
**File:** `src/features/hr/components/expense-claims-create-view.tsx`

```typescript
// BEFORE
const mileageRate = mileageRates?.[vehicleType] || 0.5

// AFTER
import { MILEAGE_RATES } from '@/config'
const mileageRate = mileageRates?.[vehicleType] || MILEAGE_RATES.DEFAULT
```

### Example 2: Score Thresholds
**File:** ML scoring, performance reviews

```typescript
// BEFORE
const isHighScore = score >= 70
const isMediumScore = score >= 50

// AFTER
import { SCORE_THRESHOLDS } from '@/config'
const isHighScore = score >= SCORE_THRESHOLDS.HIGH
const isMediumScore = score >= SCORE_THRESHOLDS.MEDIUM
```

### Example 3: Working Hours
**File:** Attendance, scheduling

```typescript
// BEFORE
const workStart = 9
const workEnd = 17

// AFTER
import { WORK_HOURS } from '@/config'
const workStart = WORK_HOURS.START
const workEnd = WORK_HOURS.END
```

### Example 4: Validation
**File:** Saudi validators

```typescript
// BEFORE
const VAT_NUMBER_LENGTH = 15
const isValidLength = vatNumber.length === 15

// AFTER
import { VALIDATION } from '@/config'
const VAT_NUMBER_LENGTH = VALIDATION.SAUDI.VAT_NUMBER_LENGTH
const isValidLength = vatNumber.length === VALIDATION.SAUDI.VAT_NUMBER_LENGTH
```

---

## Search and Replace Patterns

Use these patterns to find magic numbers in your codebase:

### VAT/Tax (15% or 0.15)
```bash
# Search for VAT calculations
grep -r "0\.15\|15%" src/

# Common patterns:
* 0.15
* 15%
* vatRate: 15
```

### Cache Times (minutes × 60 × 1000)
```bash
# Search for cache time calculations
grep -r "\d\+ \* 60 \* 1000" src/

# Common patterns:
* 2 * 60 * 1000  -> CACHE_TIMES.SHORT
* 5 * 60 * 1000  -> CACHE_TIMES.MEDIUM
* 30 * 60 * 1000 -> CACHE_TIMES.LONG
* 60 * 60 * 1000 -> CACHE_TIMES.HOUR
```

### File Sizes (MB × 1024 × 1024)
```bash
# Search for file size calculations
grep -r "\d\+ \* 1024 \* 1024" src/

# Common patterns:
* 5 * 1024 * 1024   -> FILE_LIMITS.RECOMMENDED.IMAGES
* 10 * 1024 * 1024  -> FILE_LIMITS.RECOMMENDED.DOCUMENTS
* 50 * 1024 * 1024  -> FILE_LIMITS.MAX_SIZE
* 100 * 1024 * 1024 -> FILE_LIMITS.MAX_UPLOAD_SIZE
```

### Pagination Limits
```bash
# Search for pagination defaults
grep -r "pageSize.*=.*\d\+\|limit.*=.*\d\+" src/

# Common patterns:
* pageSize = 10  -> PAGINATION.MEDIUM
* pageSize = 20  -> PAGINATION.DEFAULT
* limit = 50     -> PAGINATION.LARGE
```

---

## Migration Priority

1. **High Priority** (Business Critical):
   - Tax calculations (0.15, 15%)
   - File size limits
   - Session timeouts
   - VAT number validation

2. **Medium Priority** (Performance):
   - Cache times
   - Pagination sizes
   - Rate limiting

3. **Low Priority** (UI/UX):
   - Canvas dimensions
   - Map defaults
   - Animation delays

---

## Testing After Migration

After replacing magic numbers:

1. Run TypeScript compiler: `npm run type-check`
2. Run tests: `npm test`
3. Test affected features manually
4. Verify calculations produce the same results
5. Check that no functionality broke

---

## Notes

- Replace magic numbers gradually, one file or feature at a time
- Always test after changes
- Use git to track changes and revert if needed
- Update tests to use constants too
- Document any business rule changes in the config files
