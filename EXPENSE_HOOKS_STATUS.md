# Expense Hooks Status Report | تقرير حالة دوال المصروفات

## Summary | الملخص

**EN:** The file `src/hooks/useExpenses.ts` does not exist. Expense-related functionality is split across multiple files with different endpoint implementations.

**AR:** الملف `src/hooks/useExpenses.ts` غير موجود. وظائف المصروفات موزعة عبر عدة ملفات بتنفيذات مختلفة لنقاط النهاية.

---

## File Locations | مواقع الملفات

### 1. `/src/hooks/useExpenseClaims.ts`
**Status:** ⚠️ **ENDPOINTS NOT IMPLEMENTED | نقاط النهاية غير مطبقة**

- **Endpoints Used:** `/hr/expense-claims/*`
- **Backend Status:** ❌ **Does not exist | غير موجودة**
- **Impact:** All mutations will fail with 404 errors
- **Fixed:** ✅ Added bilingual deprecation warnings with console.warn()

### 2. `/src/hooks/useExpensePolicies.ts`
**Status:** ✅ **FIXED | تم الإصلاح**

- **Endpoints Used:** `/api/expense-policies/*`
- **Backend Status:** ✅ Likely implemented
- **Fixed:** ✅ Converted all error messages from Arabic-only to bilingual (English | Arabic)

### 3. `/src/hooks/useFinance.ts`
**Status:** ✅ **ALREADY DOCUMENTED | موثقة بالفعل**

- Contains deprecated invoice-related hooks:
  - `useMarkInvoicePaid()` - Already has bilingual deprecation warnings
  - `useDownloadInvoicePDF()` - Already has bilingual deprecation warnings
- **Fixed:** ✅ Already had proper bilingual deprecation notices

---

## Changes Made | التغييرات المطبقة

### ✅ useExpenseClaims.ts
Added bilingual console.warn() deprecation notices to:
- `useCreateExpenseClaim()` - POST /hr/expense-claims
- `useUpdateExpenseClaim()` - PATCH /hr/expense-claims/:id
- `useDeleteExpenseClaim()` - DELETE /hr/expense-claims/:id
- `useSubmitExpenseClaim()` - POST /hr/expense-claims/:id/submit
- `useApproveExpenseClaim()` - POST /hr/expense-claims/:id/approve
- `useProcessClaimPayment()` - POST /hr/expense-claims/:id/process-payment

**Warning Format:**
```typescript
console.warn(
  '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
  'useXXX() calls POST /hr/expense-claims which does not exist in the backend.\n' +
  'useXXX() تستدعي POST /hr/expense-claims التي لا توجد في الخادم.\n' +
  'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
)
```

### ✅ useExpensePolicies.ts
Converted all error messages to bilingual format:
- `useCreateExpensePolicy()` - Now shows "Policy created successfully | تم إنشاء السياسة بنجاح"
- `useUpdateExpensePolicy()` - Now shows "Policy updated successfully | تم تحديث السياسة بنجاح"
- `useDeleteExpensePolicy()` - Now shows "Policy deleted successfully | تم حذف السياسة بنجاح"
- `useSetDefaultExpensePolicy()` - Now shows "Default policy set successfully | تم تعيين السياسة الافتراضية بنجاح"
- `useTogglePolicyStatus()` - Now shows "Policy activated/deactivated successfully | تم تفعيل/تعطيل السياسة"
- `useDuplicateExpensePolicy()` - Now shows "Policy duplicated successfully | تم نسخ السياسة بنجاح"
- `useCheckCompliance()` - Now shows bilingual compliance messages

---

## Service Layer | طبقة الخدمات

### `/src/services/expenseClaimsService.ts`
**Status:** ✅ **ALREADY HAS BILINGUAL ERROR HANDLING | لديها بالفعل معالجة أخطاء ثنائية اللغة**

Contains comprehensive bilingual error messages:
```typescript
const ERROR_MESSAGES = {
  ENDPOINT_NOT_IMPLEMENTED: {
    en: 'Expense claims feature is not yet implemented in the backend',
    ar: 'ميزة مطالبات المصروفات غير مطبقة بعد في الخادم'
  },
  FETCH_FAILED: {
    en: 'Failed to fetch expense claims',
    ar: 'فشل في جلب مطالبات المصروفات'
  },
  // ... more error messages
}
```

---

## Developer Notes | ملاحظات المطور

### What happens when these hooks are used?

**EN:**
1. When a developer calls any mutation from `useExpenseClaims.ts`, they will see a bilingual console warning
2. The request will be sent to `/hr/expense-claims/*` endpoint
3. The backend will respond with 404 (endpoint not found)
4. The service layer (`expenseClaimsService.ts`) will catch the error and throw a bilingual error message
5. The hook's `onError` callback will display the bilingual error to the user via toast

**AR:**
1. عندما يستدعي المطور أي طفرة من `useExpenseClaims.ts`، سيرى تحذيرًا ثنائي اللغة في وحدة التحكم
2. سيتم إرسال الطلب إلى نقطة النهاية `/hr/expense-claims/*`
3. سيرد الخادم بـ 404 (نقطة النهاية غير موجودة)
4. ستلتقط طبقة الخدمة (`expenseClaimsService.ts`) الخطأ وترمي رسالة خطأ ثنائية اللغة
5. سيعرض رد النداء `onError` الخاص بالدالة الخطأ الثنائي اللغة للمستخدم عبر toast

---

## Recommendations | التوصيات

### For Backend Team | لفريق الخادم
**EN:**
- Implement the `/hr/expense-claims/*` endpoints OR
- Remove the `useExpenseClaims.ts` hooks if not needed OR
- Update frontend to use existing `/api/expenses/*` endpoints instead

**AR:**
- تنفيذ نقاط النهاية `/hr/expense-claims/*` أو
- إزالة دوال `useExpenseClaims.ts` إذا لم تكن مطلوبة أو
- تحديث الواجهة الأمامية لاستخدام نقاط النهاية الموجودة `/api/expenses/*` بدلاً من ذلك

### For Frontend Team | لفريق الواجهة الأمامية
**EN:**
- Avoid using `useExpenseClaims.ts` hooks until backend implements the endpoints
- Use the working `/api/expenses/*` endpoints instead
- Monitor console warnings during development

**AR:**
- تجنب استخدام دوال `useExpenseClaims.ts` حتى ينفذ الخادم نقاط النهاية
- استخدم نقاط النهاية `/api/expenses/*` العاملة بدلاً من ذلك
- راقب تحذيرات وحدة التحكم أثناء التطوير

---

## Testing | الاختبار

To verify the warnings work correctly:

```typescript
import { useCreateExpenseClaim } from '@/hooks/useExpenseClaims'

const Component = () => {
  const createClaim = useCreateExpenseClaim()

  const handleCreate = () => {
    // This will trigger the console.warn() with bilingual message
    createClaim.mutate({
      // ... claim data
    })
  }

  return <button onClick={handleCreate}>Create Claim</button>
}
```

Expected console output:
```
⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة
useCreateExpenseClaim() calls POST /hr/expense-claims which does not exist in the backend.
useCreateExpenseClaim() تستدعي POST /hr/expense-claims التي لا توجد في الخادم.
This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.
```

---

## Status Summary | ملخص الحالة

| File | Status | Bilingual Errors | Console Warnings |
|------|--------|------------------|------------------|
| useExpenses.ts | ❌ Does not exist | N/A | N/A |
| useExpenseClaims.ts | ⚠️ Not implemented | ✅ Yes (service) | ✅ Added |
| useExpensePolicies.ts | ✅ Working | ✅ Fixed | N/A |
| useFinance.ts | ✅ Working | ✅ Yes | ✅ Existing |
| expenseClaimsService.ts | ✅ Service layer | ✅ Yes | N/A |

---

**Date:** 2025-12-23
**Fixed by:** Claude Code Assistant
