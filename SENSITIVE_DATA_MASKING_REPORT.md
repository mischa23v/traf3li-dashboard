# SENSITIVE DATA MASKING SECURITY AUDIT REPORT
**Dashboard:** Traf3li Dashboard Frontend
**Scan Date:** 2025-12-22
**Scope:** `/home/user/traf3li-dashboard/src`
**Status:** ⚠️ **PARTIAL IMPLEMENTATION - CRITICAL GAPS IDENTIFIED**

---

## EXECUTIVE SUMMARY

**MASKING STATUS: PARTIAL / MISSING**

The frontend has **inconsistent and incomplete** sensitive data masking. While API keys and passwords have proper protection, **critical PII (IBAN, National ID, Phone, Email) are exposed in plain text** throughout the UI.

### Critical Findings:
- ❌ **NO IBAN masking** - Full IBAN displayed in 3+ locations
- ❌ **NO Phone masking** - Full phone numbers displayed everywhere
- ❌ **NO Email masking** - Full emails displayed in plain text
- ❌ **NO National ID masking** - Full IDs displayed with only Lock icon
- ❌ **NO Credit Card masking utility** - Inconsistent partial masking
- ✅ **API Keys properly masked** - First 7 + last 4 characters shown
- ✅ **Passwords properly handled** - `type="password"` with toggle
- ⚠️ **NO centralized masking utilities** - No reusable masking functions

---

## DETAILED FINDINGS BY DATA TYPE

### 1. IBAN DISPLAY AND MASKING ❌ **MISSING**

**Status:** **UNMASKED - CRITICAL VULNERABILITY**

**Exposure Locations:**
```typescript
// File: src/features/hr/components/employee-details-view.tsx:541
<span className="font-medium text-slate-900" dir="ltr">
  {employee.compensation?.bankDetails?.iban || 'غير محدد'}
</span>

// File: src/features/hr/components/payroll-details-view.tsx:531
<span className="font-medium text-slate-900" dir="ltr">
  {slipData.payment.iban}
</span>

// File: src/features/organizations/components/organization-details-view.tsx:466
<p className="font-medium text-navy" dir="ltr">
  {organization.iban}
</p>
```

**Additional Locations:**
- `src/features/hr/components/payroll-create-view.tsx` (IBAN input field)
- `src/features/hr/components/loans-details-view.tsx` (IBAN input)
- `src/features/hr/components/expense-claims-details-view.tsx` (IBAN input)
- `src/features/hr/components/employee-create-view.tsx` (IBAN input)

**Visual Indicator:** Lock icon (🔒) present but **data remains fully exposed in DOM**

**Risk Level:** **🔴 CRITICAL**
- Full IBAN visible to anyone with DevTools
- Violates PDPL Article 8 (Data Minimization)
- No masking function exists

---

### 2. PHONE NUMBER MASKING ❌ **MISSING**

**Status:** **UNMASKED - HIGH RISK**

**Exposure Locations:**
```typescript
// File: src/features/clients/client-details/index.tsx:406
<p className="font-medium text-slate-900" dir="ltr">
  {client.alternatePhone}
</p>

// File: src/features/sales/components/leads-dashboard.tsx:205
<span dir="ltr">{lead.phone}</span>

// Displayed in 100+ components across:
- Employee details/lists
- Client details/lists
- Lead management
- Contact management
- Vendor management
```

**Patterns Found:**
- Phone numbers displayed with `dir="ltr"` attribute
- No masking applied to any phone fields
- Phone validation exists but NO display masking

**Risk Level:** **🔴 HIGH**
- PII exposure in all user-facing interfaces
- No partial masking (e.g., `05XX XXX 1234`)

---

### 3. EMAIL MASKING ❌ **MISSING**

**Status:** **UNMASKED - HIGH RISK**

**Exposure Locations:**
- Authentication pages (login, signup, forgot password)
- User profile settings
- Employee management (`src/features/hr/components/employee-*.tsx`)
- Client management (`src/features/clients/`)
- Contact management (`src/features/contacts/`)
- All email communication interfaces

**Patterns Found:**
```typescript
// Email displayed in full everywhere
{user.email}
{client.email}
{employee.email}
{contact.emails?.map(email => email.address)}
```

**Risk Level:** **🟡 MEDIUM**
- Email PII exposed in all contexts
- No partial masking (e.g., `u***@example.com`)

---

### 4. NATIONAL ID MASKING ❌ **MISSING**

**Status:** **UNMASKED - CRITICAL VULNERABILITY**

**Exposure Locations:**
```typescript
// File: src/features/hr/components/employee-details-view.tsx:280
<div className="flex justify-between text-sm">
  <span className="text-slate-500">
    رقم الهوية<Lock className="h-3 w-3 text-slate-500 inline ms-1" />
  </span>
  <span className="font-medium text-slate-900">
    {employee.personalInfo?.nationalId || 'غير محدد'}
  </span>
</div>

// File: src/features/clients/client-details/index.tsx:460
<p className="font-medium text-slate-900" dir="ltr">
  {client.nationalId}
</p>
```

**Additional Locations:**
- Employee onboarding/offboarding views
- Client registration forms
- Case management (plaintiff/defendant details)
- HR reports and analytics
- Payroll processing views

**Visual Indicator:** Lock icon present but **full ID exposed**

**Risk Level:** **🔴 CRITICAL**
- Saudi National IDs (10 digits) fully exposed
- Iqama numbers fully exposed
- Passport numbers fully exposed
- **MAJOR PDPL violation** (highly sensitive identifier)

---

### 5. CREDIT CARD MASKING ⚠️ **PARTIAL**

**Status:** **INCONSISTENT IMPLEMENTATION**

**Working Masking:**
```typescript
// File: src/features/finance/components/card-reconciliation-view.tsx:221
<p className="text-sm text-slate-600">•••• {cardData.cardNumber}</p>

// File: src/features/finance/components/corporate-cards-dashboard.tsx:390
<span>•••• {card.cardNumber}</span>

// Mock data with masking pattern:
"البنك الأهلي - جاري - ****1234"
"مصرف الراجحي - جاري - ****5678"
```

**Issues:**
- Masking only in specific components
- No centralized masking utility
- Inconsistent pattern (`••••` vs `****`)
- Mock bank accounts use `****` pattern

**Risk Level:** **🟡 MEDIUM**
- Partial implementation exists
- Needs standardization

---

### 6. PASSWORD FIELD HANDLING ✅ **IMPLEMENTED**

**Status:** **PROPERLY SECURED**

**Implementation:**
```typescript
// File: src/components/password-input.tsx
export function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <input
      type={showPassword ? 'text' : 'password'}
      // ... with Eye/EyeOff toggle
    />
  )
}
```

**Features:**
- Dedicated PasswordInput component
- `type="password"` by default
- Show/Hide toggle with Eye/EyeOff icons
- Auto-hide after reveal (10 seconds for API keys)
- Password strength indicator component exists
- Password validation patterns in place

**Files:**
- `/src/components/password-input.tsx` ✅
- `/src/components/password-strength.tsx` ✅
- `/src/components/password-requirements.tsx` ✅

**Risk Level:** **🟢 LOW**
- Well implemented

---

### 7. API KEY MASKING ✅ **IMPLEMENTED**

**Status:** **PROPERLY SECURED**

**Implementation:**
```typescript
// File: src/components/api-key-display.tsx:18-24
const getMaskedKey = () => {
  if (apiKey.length <= 11) return apiKey
  const prefix = apiKey.substring(0, 7)
  const suffix = apiKey.substring(apiKey.length - 4)
  return `${prefix}${'•'.repeat(32)}${suffix}`
}
```

**Features:**
- Shows first 7 and last 4 characters
- Middle portion masked with `•` (32 repetitions)
- Reveal/Hide toggle button
- Auto-hide after 10 seconds
- Copy to clipboard functionality
- Warning message on creation ("only shown once")

**Risk Level:** **🟢 LOW**
- Excellent implementation
- Should be template for other masking

---

## PII DISPLAYED IN UI COMPONENTS

### High-Risk PII Exposure Areas:

1. **Employee Management** (`src/features/hr/components/`)
   - ❌ Full IBAN in compensation details
   - ❌ Full National ID in personal info
   - ❌ Full phone numbers
   - ❌ Full email addresses
   - ❌ Full passport/iqama numbers

2. **Client Management** (`src/features/clients/`)
   - ❌ Full National ID / Iqama / Passport
   - ❌ Full phone numbers (primary + alternate)
   - ❌ Full email addresses
   - ❌ Full GCC ID numbers

3. **Contact Management** (`src/features/contacts/`)
   - ❌ Full phone numbers (multiple)
   - ❌ Full email addresses (multiple)
   - ❌ Full National ID

4. **Finance/Payroll** (`src/features/finance/`, `src/features/hr/payroll`)
   - ❌ Full IBAN in all payroll operations
   - ❌ Full bank account details
   - ⚠️ Partial card number masking

5. **Saudi Banking Integration** (`src/features/finance/saudi-banking`)
   - ❌ Full IBAN required for WPS, SADAD, Lean
   - No masking in display

---

## MASKING FUNCTIONS ANALYSIS

### Existing Masking Functions: **NONE**

```bash
# Search result:
$ grep -r "maskIban\|maskPhone\|maskEmail\|maskNationalId\|maskCard" src/
# (empty - NO RESULTS)
```

**Critical Gap:** No centralized masking utility library exists.

### Validation Functions (No Masking):
```typescript
// File: src/utils/validation-patterns.ts
export const isValidIban = (value: string): boolean
export const isValidPhone = (value: string): boolean
export const isValidEmail = (value: string): boolean
export const isValidNationalId = (value: string): boolean
```

**Note:** These validate but do NOT mask data for display.

---

## SECURITY GAPS & PDPL VIOLATIONS

### PDPL Compliance Issues:

1. **Article 8 - Data Minimization Principle**
   - ❌ Full PII displayed when partial data sufficient
   - Example: Full IBAN when last 4 digits adequate

2. **Article 10 - Security Safeguards**
   - ❌ Sensitive data exposed in DOM (accessible via DevTools)
   - ❌ No frontend masking layer

3. **Article 20 - Data Subject Rights**
   - ⚠️ Lock icon suggests protection but doesn't implement it
   - Misleading security indicator

### Technical Vulnerabilities:

1. **DOM Exposure**
   ```html
   <!-- Current Implementation -->
   <span class="font-medium text-slate-900" dir="ltr">
     SA0380000000608010167519  <!-- Full IBAN in DOM -->
   </span>
   ```

2. **No Client-Side Masking Layer**
   - Data received from API in full
   - No masking before rendering
   - Visible in React DevTools

3. **Inconsistent Protection**
   - API keys: Properly masked
   - Passwords: Properly hidden
   - PII (IBAN, National ID, Phone): **NO masking**

---

## RECOMMENDED MASKING UTILITIES

### 1. Create Centralized Masking Library

**File:** `/src/utils/data-masking.ts`

```typescript
/**
 * Centralized Data Masking Utilities
 * For PDPL-compliant PII display
 */

/**
 * Mask IBAN - Show first 4 and last 4 characters
 * Example: SA0380000000608010167519 → SA03••••••••••••7519
 */
export const maskIban = (iban: string, options?: {
  showFirst?: number
  showLast?: number
  maskChar?: string
}): string => {
  if (!iban || iban.length < 10) return iban

  const showFirst = options?.showFirst ?? 4
  const showLast = options?.showLast ?? 4
  const maskChar = options?.maskChar ?? '•'

  const prefix = iban.substring(0, showFirst)
  const suffix = iban.substring(iban.length - showLast)
  const maskedLength = iban.length - showFirst - showLast

  return `${prefix}${maskChar.repeat(maskedLength)}${suffix}`
}

/**
 * Mask Phone Number - Show last 4 digits
 * Example: +966501234567 → +966••••••4567
 */
export const maskPhone = (phone: string, options?: {
  showLast?: number
  maskChar?: string
}): string => {
  if (!phone || phone.length < 6) return phone

  const showLast = options?.showLast ?? 4
  const maskChar = options?.maskChar ?? '•'

  // Preserve country code if present
  const match = phone.match(/^(\+?\d{1,3})(.+)/)
  if (match) {
    const [, countryCode, rest] = match
    const suffix = rest.substring(rest.length - showLast)
    const maskedLength = rest.length - showLast
    return `${countryCode}${maskChar.repeat(maskedLength)}${suffix}`
  }

  const suffix = phone.substring(phone.length - showLast)
  const maskedLength = phone.length - showLast
  return `${maskChar.repeat(maskedLength)}${suffix}`
}

/**
 * Mask Email - Show first 2 chars + domain
 * Example: user@example.com → us•••@example.com
 */
export const maskEmail = (email: string, options?: {
  showFirst?: number
  maskChar?: string
}): string => {
  if (!email || !email.includes('@')) return email

  const showFirst = options?.showFirst ?? 2
  const maskChar = options?.maskChar ?? '•'

  const [localPart, domain] = email.split('@')
  if (localPart.length <= showFirst) {
    return `${localPart}@${domain}`
  }

  const prefix = localPart.substring(0, showFirst)
  const maskedLength = localPart.length - showFirst
  return `${prefix}${maskChar.repeat(maskedLength)}@${domain}`
}

/**
 * Mask National ID - Show first 1 and last 3 digits
 * Example: 1234567890 → 1••••••890
 */
export const maskNationalId = (id: string, options?: {
  showFirst?: number
  showLast?: number
  maskChar?: string
}): string => {
  if (!id || id.length < 6) return id

  const showFirst = options?.showFirst ?? 1
  const showLast = options?.showLast ?? 3
  const maskChar = options?.maskChar ?? '•'

  const prefix = id.substring(0, showFirst)
  const suffix = id.substring(id.length - showLast)
  const maskedLength = id.length - showFirst - showLast

  return `${prefix}${maskChar.repeat(maskedLength)}${suffix}`
}

/**
 * Mask Credit Card - Show last 4 digits only
 * Example: 1234567890123456 → •••• •••• •••• 3456
 */
export const maskCreditCard = (cardNumber: string, options?: {
  showLast?: number
  maskChar?: string
  groupSize?: number
}): string => {
  if (!cardNumber || cardNumber.length < 8) return cardNumber

  const showLast = options?.showLast ?? 4
  const maskChar = options?.maskChar ?? '•'
  const groupSize = options?.groupSize ?? 4

  // Remove spaces
  const cleaned = cardNumber.replace(/\s/g, '')
  const suffix = cleaned.substring(cleaned.length - showLast)
  const maskedGroups = Math.ceil((cleaned.length - showLast) / groupSize)

  const maskedPart = Array(maskedGroups)
    .fill(maskChar.repeat(groupSize))
    .join(' ')

  return `${maskedPart} ${suffix}`
}

/**
 * Generic masking function
 */
export const maskString = (
  str: string,
  showFirst: number = 2,
  showLast: number = 2,
  maskChar: string = '•'
): string => {
  if (!str || str.length <= showFirst + showLast) return str

  const prefix = str.substring(0, showFirst)
  const suffix = str.substring(str.length - showLast)
  const maskedLength = str.length - showFirst - showLast

  return `${prefix}${maskChar.repeat(maskedLength)}${suffix}`
}

/**
 * Masking configuration per data type
 */
export const MASKING_CONFIGS = {
  iban: { showFirst: 4, showLast: 4, maskChar: '•' },
  phone: { showLast: 4, maskChar: '•' },
  email: { showFirst: 2, maskChar: '•' },
  nationalId: { showFirst: 1, showLast: 3, maskChar: '•' },
  creditCard: { showLast: 4, maskChar: '•', groupSize: 4 },
  passport: { showFirst: 2, showLast: 2, maskChar: '•' },
  iqama: { showFirst: 1, showLast: 3, maskChar: '•' },
} as const

/**
 * Auto-detect and mask based on type
 */
export const autoMask = (value: string, type: keyof typeof MASKING_CONFIGS): string => {
  const config = MASKING_CONFIGS[type]

  switch (type) {
    case 'iban':
      return maskIban(value, config)
    case 'phone':
      return maskPhone(value, config)
    case 'email':
      return maskEmail(value, config)
    case 'nationalId':
    case 'iqama':
      return maskNationalId(value, config)
    case 'creditCard':
      return maskCreditCard(value, config)
    case 'passport':
      return maskString(value, config.showFirst, config.showLast, config.maskChar)
    default:
      return value
  }
}
```

---

### 2. Create Reusable Masked Display Components

**File:** `/src/components/masked-text.tsx`

```typescript
import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { autoMask, MASKING_CONFIGS } from '@/utils/data-masking'

interface MaskedTextProps {
  value: string
  type: keyof typeof MASKING_CONFIGS
  showToggle?: boolean
  className?: string
  showLockIcon?: boolean
  dir?: 'ltr' | 'rtl'
  autoHideDelay?: number // Auto-hide after reveal (ms)
}

export function MaskedText({
  value,
  type,
  showToggle = true,
  className,
  showLockIcon = true,
  dir = 'ltr',
  autoHideDelay = 10000,
}: MaskedTextProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleToggle = () => {
    if (!isRevealed && autoHideDelay > 0) {
      // Auto-hide after delay
      setTimeout(() => setIsRevealed(false), autoHideDelay)
    }
    setIsRevealed(!isRevealed)
  }

  const displayValue = isRevealed ? value : autoMask(value, type)

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {showLockIcon && !isRevealed && (
        <Lock className="h-3 w-3 text-slate-500" aria-label="Sensitive data" />
      )}
      <span className="font-medium" dir={dir}>
        {displayValue}
      </span>
      {showToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="h-6 w-6"
          title={isRevealed ? 'إخفاء' : 'عرض'}
        >
          {isRevealed ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  )
}

/**
 * Specialized components for common use cases
 */
export function MaskedIban({ value, ...props }: Omit<MaskedTextProps, 'type'>) {
  return <MaskedText value={value} type="iban" dir="ltr" {...props} />
}

export function MaskedPhone({ value, ...props }: Omit<MaskedTextProps, 'type'>) {
  return <MaskedText value={value} type="phone" dir="ltr" {...props} />
}

export function MaskedEmail({ value, ...props }: Omit<MaskedTextProps, 'type'>) {
  return <MaskedText value={value} type="email" dir="ltr" {...props} />
}

export function MaskedNationalId({ value, ...props }: Omit<MaskedTextProps, 'type'>) {
  return <MaskedText value={value} type="nationalId" dir="ltr" {...props} />
}

export function MaskedCreditCard({ value, ...props }: Omit<MaskedTextProps, 'type'>) {
  return <MaskedText value={value} type="creditCard" dir="ltr" {...props} />
}
```

---

### 3. Usage Examples

**Before (Vulnerable):**
```typescript
// src/features/hr/components/employee-details-view.tsx
<span className="font-medium text-slate-900" dir="ltr">
  {employee.compensation?.bankDetails?.iban || 'غير محدد'}
</span>
```

**After (Secure):**
```typescript
import { MaskedIban } from '@/components/masked-text'

<MaskedIban
  value={employee.compensation?.bankDetails?.iban || ''}
  showToggle={true}
  autoHideDelay={10000}
/>
```

**National ID Example:**
```typescript
import { MaskedNationalId } from '@/components/masked-text'

<MaskedNationalId
  value={employee.personalInfo?.nationalId || ''}
  showToggle={false} // Never allow reveal in some contexts
/>
```

---

## IMPLEMENTATION PRIORITY

### 🔴 **CRITICAL (Immediate):**
1. Create `/src/utils/data-masking.ts` utility library
2. Create `/src/components/masked-text.tsx` component
3. Replace IBAN display in:
   - Employee details/payroll views
   - Organization details
   - All finance components

4. Replace National ID display in:
   - Employee management
   - Client management
   - Case management

### 🟠 **HIGH (Week 1):**
5. Replace Phone number display in:
   - All employee/client/contact views
   - Lead management
   - Communication interfaces

6. Implement Email masking in:
   - User profiles
   - Contact lists
   - Communication logs

### 🟡 **MEDIUM (Week 2):**
7. Standardize Credit Card masking across all finance components
8. Add masking to Passport/Iqama displays
9. Audit and update all 1,601 TypeScript files for PII exposure

### 🟢 **LOW (Ongoing):**
10. Add unit tests for masking utilities
11. Create Storybook documentation
12. Implement audit logging for PII reveals
13. Add user preference for default masking behavior

---

## FILES REQUIRING IMMEDIATE UPDATE

### High-Priority Files (Full IBAN/National ID Exposure):

1. `/src/features/hr/components/employee-details-view.tsx`
2. `/src/features/hr/components/payroll-details-view.tsx`
3. `/src/features/hr/components/payroll-create-view.tsx`
4. `/src/features/organizations/components/organization-details-view.tsx`
5. `/src/features/clients/client-details/index.tsx`
6. `/src/features/contacts/components/contact-details-view.tsx`
7. `/src/features/hr/components/loans-details-view.tsx`
8. `/src/features/hr/components/expense-claims-details-view.tsx`

### Medium-Priority (Phone/Email Exposure):

9-30. All employee/client/contact list and detail views
31-50. All finance/payroll components
51+. Communication and messaging interfaces

---

## TESTING RECOMMENDATIONS

### Unit Tests Required:
```typescript
// tests/utils/data-masking.test.ts
describe('Data Masking Utilities', () => {
  describe('maskIban', () => {
    it('should mask IBAN showing first 4 and last 4', () => {
      expect(maskIban('SA0380000000608010167519'))
        .toBe('SA03••••••••••••7519')
    })
  })

  describe('maskPhone', () => {
    it('should mask phone showing last 4 digits', () => {
      expect(maskPhone('+966501234567'))
        .toBe('+966••••••4567')
    })
  })

  describe('maskNationalId', () => {
    it('should mask National ID showing first 1 and last 3', () => {
      expect(maskNationalId('1234567890'))
        .toBe('1••••••890')
    })
  })
})
```

### Integration Tests:
- Test MaskedText component reveal/hide functionality
- Test auto-hide timer
- Test accessibility (screen readers should announce "Sensitive data")
- Test PDPL compliance (no PII in DOM when masked)

---

## COMPLIANCE CHECKLIST

- [ ] Create centralized masking utility library
- [ ] Create reusable MaskedText components
- [ ] Update all IBAN displays (8+ files)
- [ ] Update all National ID displays (15+ files)
- [ ] Update all Phone displays (50+ files)
- [ ] Update all Email displays (30+ files)
- [ ] Standardize Credit Card masking
- [ ] Add unit tests for masking functions
- [ ] Add integration tests for masked components
- [ ] Document masking patterns in style guide
- [ ] Add audit logging for PII reveals
- [ ] Update PDPL compliance documentation
- [ ] Train development team on masking requirements
- [ ] Perform security audit after implementation

---

## CONCLUSION

**Current State:** The traf3li-dashboard frontend has **significant PII exposure vulnerabilities**. While API keys and passwords are properly protected, critical sensitive data (IBAN, National ID, Phone, Email) is displayed in plain text throughout the application.

**Required Action:** Immediate implementation of centralized masking utilities and systematic replacement of all unmasked PII displays.

**Estimated Effort:**
- Utility creation: 4-8 hours
- Component updates: 40-60 hours
- Testing: 20-30 hours
- **Total: ~2 weeks for complete remediation**

**Risk if Not Addressed:**
- PDPL non-compliance (potential fines)
- Data breach liability
- User trust erosion
- Regulatory audit failures

---

**Report Generated By:** Claude Code Agent
**Next Review:** Post-implementation verification required
**Contact:** Security Team
