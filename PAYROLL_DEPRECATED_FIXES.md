# Payroll Deprecated Functions - Fix Summary

## Overview
Fixed payroll-related components that call deprecated payrollRunService and payrollService functions. Added proper user-facing bilingual error alerts and [BACKEND-PENDING] tags in TODO comments.

## Files Modified

### 1. `/home/user/traf3li-dashboard/src/hooks/usePayrollRun.ts`
**Changes:**
- Added `import { toast } from 'sonner'` for user-facing error alerts
- Updated `useExcludeEmployee` hook:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Added bilingual toast.error in onError handler
  - Message: "Feature not available | الميزة غير متاحة"
  - Description: "Employee exclusion is not yet implemented. Please contact support. | استبعاد الموظف غير مطبق حالياً. يرجى التواصل مع الدعم الفني."

- Updated `useIncludeEmployee` hook:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Added bilingual toast.error in onError handler
  - Message: "Feature not available | الميزة غير متاحة"
  - Description: "Employee inclusion is not yet implemented. Please contact support. | تضمين الموظف غير مطبق حالياً. يرجى التواصل مع الدعم الفني."

- Updated `useRecalculateEmployee` hook:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Added bilingual toast.error in onError handler
  - Message: "Feature not available | الميزة غير متاحة"
  - Description: "Individual employee recalculation is not yet implemented. Please recalculate the entire payroll run instead. | إعادة حساب الموظف الفردي غير مطبق حالياً. يرجى إعادة حساب دورة الرواتب بالكامل."

- Updated `useExportPayrollRunReport` hook:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Added bilingual toast.error in onError handler
  - Message: "Export not available | التصدير غير متاح"
  - Description: "Payroll report export is not yet implemented. Please contact support. | تصدير تقرير الرواتب غير مطبق حالياً. يرجى التواصل مع الدعم الفني."

### 2. `/home/user/traf3li-dashboard/src/services/payrollRunService.ts`
**Changes:**
- Updated `excludeEmployee` function:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Improved error message with bilingual text
  - Error: "Feature not available: Employee exclusion is not yet implemented. | الميزة غير متاحة: استبعاد الموظف غير مطبق حالياً."

- Updated `includeEmployee` function:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Improved error message with bilingual text
  - Error: "Feature not available: Employee inclusion is not yet implemented. | الميزة غير متاحة: تضمين الموظف غير مطبق حالياً."

- Updated `recalculateEmployee` function:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Improved error message with bilingual text
  - Error: "Feature not available: Individual employee recalculation is not yet implemented. Please recalculate the entire payroll run. | الميزة غير متاحة: إعادة حساب الموظف الفردي غير مطبق حالياً. يرجى إعادة حساب دورة الرواتب بالكامل."

- Updated `exportPayrollRunReport` function:
  - Added `TODO: [BACKEND-PENDING]` tag
  - Improved error message with bilingual text
  - Error: "Export not available: Payroll report export is not yet implemented. | التصدير غير متاح: تصدير تقرير الرواتب غير مطبق حالياً."

### 3. `/home/user/traf3li-dashboard/src/services/payrollService.ts`
**Changes:**
- Updated `downloadSalarySlipPDF` function:
  - Added JSDoc comment block with @deprecated and @throws tags
  - Added `TODO: [BACKEND-PENDING]` tag
  - Improved error message with bilingual text
  - Error: "PDF download not available: Salary slip PDF generation is not yet implemented. | تنزيل PDF غير متاح: إنشاء PDF لقسيمة الراتب غير مطبق حالياً."
  - Includes alternative suggestion to use PDFme service

### 4. `/home/user/traf3li-dashboard/src/hooks/usePayroll.ts`
**Changes:**
- Added `import { toast } from 'sonner'` for user-facing error alerts
- Created new `useDownloadSalarySlipPDF` hook:
  - Full JSDoc documentation with @deprecated tag
  - Added `TODO: [BACKEND-PENDING]` tag
  - Console warning with bilingual text
  - Bilingual toast.error in onError handler
  - Message: "PDF download not available | تنزيل PDF غير متاح"
  - Description: "Salary slip PDF generation is not yet implemented. Please use the print function or contact support. | إنشاء PDF لقسيمة الراتب غير مطبق حالياً. يرجى استخدام وظيفة الطباعة أو التواصل مع الدعم الفني."

## Deprecated Functions Fixed

### Payroll Run Service Functions:
1. ✅ `excludeEmployee` - POST /payroll-runs/:id/employees/:empId/exclude
2. ✅ `includeEmployee` - POST /payroll-runs/:id/employees/:empId/include
3. ✅ `recalculateEmployee` - POST /payroll-runs/:id/employees/:empId/recalculate
4. ✅ `exportPayrollRunReport` - GET /payroll-runs/:id/export

### Payroll Service Functions:
5. ✅ `downloadSalarySlipPDF` - GET /payroll/:id/pdf

## Error Handling Implementation

All deprecated functions now have:
1. ✅ **[BACKEND-PENDING] tags** in TODO comments
2. ✅ **Bilingual error messages** (English | Arabic)
3. ✅ **User-facing toast alerts** using Sonner
4. ✅ **Console warnings** for developers
5. ✅ **Proper JSDoc documentation** with @deprecated tags

## Error Message Format

All error messages follow this bilingual pattern:
```typescript
toast.error(
  'Title in English | العنوان بالعربية',
  {
    description: 'Description in English. | الوصف بالعربية.',
  }
)
```

## Backend Endpoints Needed

The following endpoints need to be implemented:
1. `POST /payroll-runs/:id/employees/:empId/exclude` - Exclude employee from payroll run
2. `POST /payroll-runs/:id/employees/:empId/include` - Include employee back in payroll run
3. `POST /payroll-runs/:id/employees/:empId/recalculate` - Recalculate single employee
4. `GET /payroll-runs/:id/export` - Export payroll run report (multiple formats: pdf, excel, csv)
5. `GET /payroll/:id/pdf` - Download salary slip PDF (or implement client-side with PDFme)

## Testing Recommendations

1. Test each deprecated function to verify toast alerts appear correctly
2. Verify bilingual messages display properly in both English and Arabic
3. Ensure console warnings are logged for developers
4. Check that error messages are user-friendly and actionable

## Next Steps

1. ✅ All deprecated functions have been documented
2. ✅ All user-facing error alerts are bilingual
3. ✅ All [BACKEND-PENDING] tags are in place
4. 🔲 Backend team needs to implement the missing endpoints
5. 🔲 Consider implementing client-side PDF generation using PDFme service

## Date Completed
December 23, 2025
