# Configuration Constants

This directory contains centralized configuration files to replace magic numbers scattered throughout the codebase.

## Files

### 1. `tax.ts` - Tax Configuration
Contains tax rates and tax-related constants.

```typescript
import { TAX_CONFIG } from '@/config'

// Saudi VAT (15%)
const vatAmount = subtotal * TAX_CONFIG.SAUDI_VAT_RATE

// VAT number validation
const isValidLength = vatNumber.length === TAX_CONFIG.VAT_NUMBER_LENGTH
const isValidPrefix = vatNumber.startsWith(TAX_CONFIG.VAT_NUMBER_PREFIX)
```

**Constants:**
- `SAUDI_VAT_RATE`: 0.15 (15%)
- `SAUDI_VAT_RATE_PERCENT`: 15
- `DEFAULT_TAX_RATE`: 0.15
- `ZERO_RATED`: 0
- `VAT_NUMBER_LENGTH`: 15
- `VAT_NUMBER_PREFIX`: '3'

---

### 2. `pagination.ts` - Pagination Configuration
Contains pagination sizes for tables, lists, and data grids.

```typescript
import { PAGINATION } from '@/config'

// Default pagination
const pageSize = PAGINATION.DEFAULT // 20

// Feature-specific pagination
const clientsPageSize = PAGINATION.FEATURES.CLIENTS // 12

// Page size options for dropdown
<Select>
  {PAGINATION.OPTIONS.map(size => (
    <option value={size}>{size}</option>
  ))}
</Select>
```

**Constants:**
- `DEFAULT`: 20
- `SMALL`: 5
- `MEDIUM`: 10
- `LARGE`: 50
- `EXTRA_LARGE`: 100
- `MAX`: 1000
- `OPTIONS`: [10, 20, 30, 40, 50]
- `FEATURES`: Object with feature-specific defaults

---

### 3. `cache.ts` - Cache Configuration
Contains cache times for React Query and other caching mechanisms.

```typescript
import { CACHE_TIMES, CACHE_CONFIG } from '@/config'

// React Query configuration
useQuery({
  queryKey: ['stats'],
  queryFn: getStats,
  staleTime: CACHE_TIMES.LONG,      // 30 minutes
  gcTime: CACHE_TIMES.GC_LONG,       // 1 hour
})

// Or use pre-configured settings
useQuery({
  queryKey: ['list'],
  queryFn: getList,
  ...CACHE_CONFIG.queries.lists,
})
```

**Constants:**
- Stale times: `INSTANT`, `SHORT`, `MEDIUM`, `LONG`, `HOUR`, `TWO_HOURS`
- GC times: `GC_SHORT`, `GC_MEDIUM`, `GC_LONG`, `GC_EXTENDED`
- Specific use cases: `AUTH`, `REALTIME`, `LISTS`, `STATS`, `CONFIG`, `AUDIT`, `CALENDAR`
- Pre-configured: `CACHE_CONFIG.queries.stats`, `.lists`, `.details`, `.realtime`, `.config`, `.auth`
- Memory cache: `MEMORY_CACHE.DEFAULT_TTL`, `MEMORY_CACHE.MAX_SIZE`

---

### 4. `ui-constants.ts` - UI Constants
Contains UI-related constants and dimensions.

```typescript
import { CANVAS, MAP, FILE_LIMITS, TIMEOUTS } from '@/config'

// Canvas/Whiteboard dimensions
const width = block.width || CANVAS.BLOCK.DEFAULT_WIDTH
const minWidth = CANVAS.BLOCK.MIN_WIDTH

// Map defaults
const [radius, setRadius] = useState(MAP.DEFAULT_RADIUS) // 500 meters

// File upload limits
const maxSize = FILE_LIMITS.RECOMMENDED.DOCUMENTS // 10MB

// Session timeout
const warningTime = TIMEOUTS.SESSION_WARNING // 5 minutes
```

**Constants:**
- `CANVAS`: Block, Frame, Shape dimensions and Grid layout
- `MAP`: Default radius (500m), zoom level (15), radius options
- `FILE_LIMITS`: Max sizes, recommended sizes, storage quotas
- `TIMEOUTS`: OTP cooldown, session warnings, token expiry
- `CALENDAR`: Grid cells, default ranges
- `RETENTION`: Data retention periods
- `RATE_LIMITS`: Window durations for rate limiting
- `EXPORT`: Page sizes, orientations, report expiry
- `ANIMATION`: Stagger delays

---

### 5. `business.ts` - Business Rules
Contains business logic constants that shouldn't be hardcoded.

```typescript
import { MILEAGE_RATES, SCORE_THRESHOLDS, WORK_HOURS } from '@/config'

// Mileage calculations
const amount = distance * MILEAGE_RATES.DEFAULT // 0.5 SAR/km

// Score classification
const isHighScore = score >= SCORE_THRESHOLDS.HIGH // 70

// Working hours
const workDay = {
  start: WORK_HOURS.START,  // 9
  end: WORK_HOURS.END,      // 17
}
```

**Constants:**
- `MILEAGE_RATES`: Default rate (0.5 SAR/km), rates by vehicle type
- `SCORE_THRESHOLDS`: High (70), Medium (50), Low (30), Lead scoring, Performance
- `WORK_HOURS`: Start (9), End (17), hours per day/week
- `FINANCIAL`: Currency decimals, halalas, discount limits, credit terms
- `COMPLIANCE`: GDPR/PDPL deadlines, retention periods, consent validity
- `LEAVE`: Annual days, sick days, notice period, probation
- `PERFORMANCE`: Health score weights, experience weight
- `MATCHING`: Bank reconciliation tolerance
- `NOTIFICATIONS`: Email delays, activity freshness
- `INVENTORY`: Stock thresholds, depreciation rates
- `VALIDATION`: Saudi ID/VAT/IBAN lengths, password requirements

---

## Usage Examples

### Import Individual Constants
```typescript
import { TAX_CONFIG } from '@/config'
import { PAGINATION } from '@/config'
import { CACHE_TIMES } from '@/config'
```

### Import Multiple Constants
```typescript
import { TAX_CONFIG, PAGINATION, CACHE_TIMES } from '@/config'
```

### Import Everything
```typescript
import CONFIG from '@/config'

const vatRate = CONFIG.TAX.SAUDI_VAT_RATE
const pageSize = CONFIG.PAGINATION.DEFAULT
const cacheTime = CONFIG.CACHE.TIMES.MEDIUM
```

---

## Migration Guide

### Before (Magic Numbers)
```typescript
// ❌ Hard to understand, maintain, and find
const vatAmount = subtotal * 0.15
const pageSize = 20
const staleTime = 5 * 60 * 1000
const radius = 500
const maxFileSize = 10 * 1024 * 1024
```

### After (Centralized Constants)
```typescript
// ✅ Clear, maintainable, single source of truth
import { TAX_CONFIG, PAGINATION, CACHE_TIMES, MAP, FILE_LIMITS } from '@/config'

const vatAmount = subtotal * TAX_CONFIG.SAUDI_VAT_RATE
const pageSize = PAGINATION.DEFAULT
const staleTime = CACHE_TIMES.MEDIUM
const radius = MAP.DEFAULT_RADIUS
const maxFileSize = FILE_LIMITS.RECOMMENDED.DOCUMENTS
```

---

## Benefits

1. **Single Source of Truth**: Change a value once, apply everywhere
2. **Type Safety**: TypeScript ensures correct usage
3. **Discoverability**: Autocomplete shows all available constants
4. **Documentation**: Clear comments explain each constant
5. **Consistency**: Same values used across the codebase
6. **Maintainability**: Easy to find and update business rules
7. **Readability**: `TAX_CONFIG.SAUDI_VAT_RATE` is clearer than `0.15`

---

## Adding New Constants

When adding new constants:

1. Choose the appropriate file based on the constant's purpose
2. Add the constant with a descriptive name in SCREAMING_SNAKE_CASE
3. Add a JSDoc comment explaining what it's for
4. Export from the file and `index.ts`
5. Update this README with usage examples

```typescript
// Example: Adding a new constant to business.ts
export const BUSINESS_RULES = {
  // ... existing constants

  /**
   * New business rule constant
   */
  NEW_RULE: 42,
} as const
```

---

## Notes

- All constants are `as const` for maximum type safety
- Values are immutable - they cannot be changed at runtime
- Use these constants instead of hardcoding values throughout the codebase
- When you find a magic number, move it here and import it
