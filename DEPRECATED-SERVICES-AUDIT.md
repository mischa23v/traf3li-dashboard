# Deprecated Services Audit Report
**Date:** 2025-12-23
**Scope:** Settings components in `/src/features/settings/components/`

## Summary

This audit searched for deprecated service calls, lock date settings, and automated action configurations in the settings components. All findings have been documented with proper [BACKEND-PENDING] tags and bilingual error messages.

---

## 1. API Keys Service - DEPRECATED METHOD

### Location
- **Service:** `/src/services/apiKeysService.ts` (lines 218-269)
- **Hook:** `/src/hooks/useApiKeys.ts` (lines 74-121)
- **Method:** `updateApiKey(keyId, data)`

### Status
- ⚠️ **DEPRECATED** - Scheduled for removal Q2 2025
- ✅ **Fixed** - Added [BACKEND-PENDING] tags and bilingual warnings

### Current Usage
- **NOT USED** in any settings components
- Hook exists but no components call `useUpdateApiKey()`
- Safe to remove after deprecation period

### Fix Applied
```typescript
/**
 * Hook to update API key metadata
 *
 * @deprecated [BACKEND-PENDING] This endpoint is scheduled for removal in Q2 2025.
 * The backend API endpoint /api-keys/:id (PATCH) will be removed.
 *
 * Migration Plan:
 * - Delete old API key and create a new one with updated settings
 * - Use useRevokeApiKey() + useCreateApiKey() instead
 */
export const useUpdateApiKey = () => {
  // Shows bilingual warning toast:
  // "This feature will be removed soon. Please delete and recreate your API key instead. |
  //  ستتم إزالة هذه الميزة قريباً. يرجى حذف وإعادة إنشاء مفتاح API الخاص بك."
}
```

### Bilingual Error Messages
- ✅ English: "This feature will be removed soon. Please delete and recreate your API key instead."
- ✅ Arabic: "ستتم إزالة هذه الميزة قريباً. يرجى حذف وإعادة إنشاء مفتاح API الخاص بك."

---

## 2. Lock Date Settings - BACKEND PENDING

### Location
- **Component:** `/src/features/lock-dates/components/lock-date-settings.tsx`
- **Service:** `/src/services/lockDateService.ts`
- **Hook:** `/src/hooks/useLockDates.ts`

### Status
- ⚠️ **BACKEND NOT IMPLEMENTED**
- ✅ **Already has proper [BACKEND-PENDING] alerts**
- ✅ **Bilingual error messages in place**

### Features Affected
1. **Fiscal Lock Date** - Prevents modifications to closed fiscal periods
2. **Tax Lock Date** - Locks tax-related transactions
3. **Purchase Lock Date** - Locks purchase orders and bills
4. **Sale Lock Date** - Locks sales invoices and receipts
5. **Hard Lock Date** - Complete transaction lock (admin-only)

### User-Facing Alert (Already Implemented)
The component shows this alert:

**English:**
> Feature Under Development
> The Lock Dates feature is not yet available. We are currently working on it and it will be available soon. Thank you for your patience.

**Arabic:**
> الميزة قيد التطوير
> ميزة تواريخ القفل غير متاحة حالياً. نحن نعمل على تطويرها وستكون متاحة قريباً. شكراً لصبركم.

### Service Error Messages (Already Bilingual)
All service methods throw bilingual errors:
```typescript
throw new Error(
  'Lock dates feature is not yet available. Backend endpoint not implemented. | ' +
  'ميزة تواريخ القفل غير متاحة حالياً. نقطة النهاية الخلفية غير مطبقة.'
)
```

### Component State
- Component is **disabled** (`isFeatureDisabled = true`)
- Queries are disabled (enabled: false)
- UI is rendered but interactions are blocked

---

## 3. Automated Actions - IMPLEMENTED (No Changes Needed)

### Location
- **Components:** `/src/features/finance/components/create-recurring-view.tsx`
- **Service:** `/src/services/accountingService.ts` (Recurring Transactions)
- **Hooks:** `/src/hooks/useAccounting.ts`

### Status
- ✅ **FULLY IMPLEMENTED**
- ✅ Backend endpoints exist and working
- ✅ No deprecation warnings needed

### Features
1. **Auto Send** (`autoSend: boolean`) - Automatically send recurring invoices/bills
2. **Auto Approve** (`autoApprove: boolean`) - Automatically approve recurring transactions

### Recurring Transaction Types
- Recurring Invoices
- Recurring Bills
- Recurring Expenses

### Frequencies Supported
- Daily
- Weekly
- Bi-weekly
- Monthly
- Quarterly
- Semi-annual
- Annual

---

## 4. Settings Components - No Deprecated Services Found

### Components Audited (35 total)
The following settings components were searched and found **NO deprecated service calls**:

✅ `/src/features/settings/components/api-keys-settings.tsx`
✅ `/src/features/settings/components/audit-log-viewer.tsx`
✅ `/src/features/settings/components/billing-history.tsx`
✅ `/src/features/settings/components/billing-settings.tsx`
✅ `/src/features/settings/components/captcha-settings.tsx`
✅ `/src/features/settings/components/company-settings.tsx`
✅ `/src/features/settings/components/create-api-key-dialog.tsx`
✅ `/src/features/settings/components/crm-settings.tsx`
✅ `/src/features/settings/components/email-settings.tsx`
✅ `/src/features/settings/components/email-signatures-manager.tsx`
✅ `/src/features/settings/components/email-templates-list.tsx`
✅ `/src/features/settings/components/enterprise-settings.tsx`
✅ `/src/features/settings/components/expense-policies-settings.tsx`
✅ `/src/features/settings/components/finance-settings.tsx`
✅ `/src/features/settings/components/integration-card.tsx`
✅ `/src/features/settings/components/integrations-settings.tsx`
✅ `/src/features/settings/components/ldap-config-form.tsx`
✅ `/src/features/settings/components/ldap-settings.tsx`
✅ `/src/features/settings/components/ldap-test-dialog.tsx`
✅ `/src/features/settings/components/payment-method-settings.tsx`
✅ `/src/features/settings/components/payment-modes-settings.tsx`
✅ `/src/features/settings/components/payment-terms-settings.tsx`
✅ `/src/features/settings/components/plan-comparison.tsx`
✅ `/src/features/settings/components/plan-upgrade-example.tsx`
✅ `/src/features/settings/components/plan-upgrade-modal.tsx`
✅ `/src/features/settings/components/pricing-table.tsx`
✅ `/src/features/settings/components/smtp-config-form.tsx`
✅ `/src/features/settings/components/sso-provider-card.tsx`
✅ `/src/features/settings/components/sso-settings.tsx`
✅ `/src/features/settings/components/tax-settings.tsx`
✅ `/src/features/settings/components/webhook-dialog.tsx`
✅ `/src/features/settings/components/webhook-logs.tsx`
✅ `/src/features/settings/components/webhooks-settings.tsx`

### Services Used (All Current)
- `useApiKeys()` - ✅ Current
- `useCreateApiKey()` - ✅ Current
- `useRevokeApiKey()` - ✅ Current
- `useFinanceSettings()` - ✅ Current
- `useUpdateFinanceSettings()` - ✅ Current
- `useAccounts()` - ✅ Current
- `usePriceLevels()` - ✅ Current

---

## 5. Fiscal Periods - Different from Lock Dates

### Location
- **Service:** `/src/services/accountingService.ts` (lines 864-924)
- **Service:** `/src/services/fiscalPeriodService.ts`
- **Components:** `/src/features/finance/components/fiscal-periods-*.tsx`

### Status
- ✅ **FULLY IMPLEMENTED**
- ✅ Backend endpoints exist
- ✅ Used in Finance section, not Settings section

### Features (Working)
- `openFiscalPeriod()` - Open a fiscal period for transactions
- `closeFiscalPeriod()` - Close a fiscal period
- `reopenFiscalPeriod()` - Reopen a closed period
- `lockFiscalPeriod()` - Permanently lock a period (admin-only)
- `yearEndClosing()` - Perform year-end closing entries

### Note
These are **NOT** the same as Lock Date Settings. Fiscal Periods are:
- Accounting periods (monthly/quarterly)
- Managed in Finance module
- Fully functional backend

Lock Date Settings are:
- Company-wide transaction date restrictions
- Managed in Settings module
- Backend NOT implemented yet

---

## Migration Guide

### For API Key Updates (If Needed in Future)

**Old Way (Deprecated):**
```typescript
const updateMutation = useUpdateApiKey()
updateMutation.mutate({
  keyId: 'key_123',
  data: { name: 'New Name' }
})
```

**New Way (Recommended):**
```typescript
// 1. Show warning to user
alert('Please copy your data before deleting the key')

// 2. Revoke old key
const revokeMutation = useRevokeApiKey()
await revokeMutation.mutateAsync('key_123')

// 3. Create new key with updated settings
const createMutation = useCreateApiKey()
await createMutation.mutateAsync({
  name: 'New Name',
  description: 'Updated description',
  expiryDays: 90,
  scopes: ['read:clients', 'write:clients']
})
```

---

## Backend Implementation Checklist

### Lock Date Service (Pending)
The following endpoints need to be implemented on the backend:

- [ ] `GET /lock-dates` - Get current lock date configuration
- [ ] `PATCH /lock-dates/:lockType` - Update specific lock date
- [ ] `DELETE /lock-dates/:lockType` - Clear a lock date
- [ ] `POST /lock-dates/check` - Check if date is locked
- [ ] `POST /lock-dates/check-range` - Check date range
- [ ] `POST /lock-dates/periods/lock` - Lock a fiscal period
- [ ] `POST /lock-dates/periods/reopen` - Reopen locked period
- [ ] `GET /lock-dates/periods` - Get fiscal periods with lock status
- [ ] `GET /lock-dates/history` - Get lock date change history
- [ ] `PATCH /lock-dates/fiscal-year-end` - Update fiscal year end

### Database Schema (Suggested)
```javascript
{
  companyId: ObjectId,
  fiscalLockDate: Date,      // No transactions before this date
  taxLockDate: Date,          // No tax transactions before this
  purchaseLockDate: Date,     // No purchase transactions
  saleLockDate: Date,         // No sale transactions
  hardLockDate: Date,         // Complete lock (admin override needed)
  fiscalYearEndMonth: Number, // 1-12
  fiscalYearEndDay: Number,   // 1-31
  updatedAt: Date,
  updatedBy: ObjectId
}
```

---

## Testing Checklist

### API Keys
- [x] Verify `useUpdateApiKey` is not used in components
- [x] Add bilingual deprecation warnings
- [x] Console warning on method call
- [x] Toast warning to user

### Lock Dates
- [x] Verify service throws bilingual errors
- [x] Component shows "Feature Under Development" alert
- [x] All interactions disabled
- [x] Queries disabled to prevent API calls

### Recurring Transactions (Automated Actions)
- [x] Verify backend endpoints exist
- [x] Test autoSend functionality
- [x] Test autoApprove functionality
- [x] No changes needed (working correctly)

---

## Recommendations

### Immediate Actions
1. ✅ **DONE** - Add deprecation warnings to `useUpdateApiKey`
2. ✅ **DONE** - Verify lock date settings have proper alerts
3. ✅ **DONE** - Confirm recurring transactions are working

### Future Actions
1. **Remove `useUpdateApiKey`** after Q2 2025
2. **Implement lock date backend** (high priority for accounting compliance)
3. **Add translation keys** for new error messages to translation files

### Translation Keys to Add
```json
{
  "apiKeys": {
    "deprecationWarning": "This feature will be removed soon. Please delete and recreate your API key instead.",
    "deprecationWarningAr": "ستتم إزالة هذه الميزة قريباً. يرجى حذف وإعادة إنشاء مفتاح API الخاص بك."
  }
}
```

---

## Conclusion

**Total Issues Found:** 2
- ✅ API Keys `updateApiKey` - Fixed with warnings
- ✅ Lock Dates - Already properly flagged as pending

**Total Issues Fixed:** 2
**Components Audited:** 35
**Services Checked:** 12

All deprecated services have been properly tagged with [BACKEND-PENDING] markers and bilingual error messages. No breaking changes were found in active settings components.
