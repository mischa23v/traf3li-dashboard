# HR Service API Mismatch Fixes

**File:** `/home/user/traf3li-dashboard/src/services/hrService.ts`
**Date:** 2025-12-23
**Status:** ✅ Complete

---

## Summary

Fixed all API endpoint mismatches in hrService.ts. Based on backend gap analysis, **NONE of the HR endpoints exist in the backend**. The backend currently supports legal practice management (cases, clients, invoices) but has no HR module implementation.

## Changes Made

### 1. Added File Header Documentation ✅

Added comprehensive warning at the top of the file:
- ⚠️ Warning that ALL HR endpoints are [BACKEND-PENDING]
- Explanation that backend is for legal practice management, not HR
- List of expected endpoints that need to be implemented

### 2. Added Helper Functions ✅

**throwNotImplementedError()**
- Throws bilingual error messages for not-yet-implemented endpoints
- Format: English | Arabic
- Currently defined but not actively used (kept for future use)

**formatBilingualError()**
- Formats API error messages in both languages
- Extracts error messages from response or provides default
- Format: `فشلت العملية | Operation failed: {operation}`

### 3. Updated All Endpoints (13 total) ✅

Each endpoint now has:

#### a) JSDoc Documentation
```typescript
/**
 * Get all employees with optional filtering
 * GET /api/hr/employees
 *
 * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
 * @throws Error with bilingual message when API call fails
 */
```

#### b) TODO Comment
```typescript
// TODO: [BACKEND-PENDING] Backend needs to implement GET /hr/employees with filtering, pagination, sorting
```

#### c) Try-Catch Block with Bilingual Error Handling
```typescript
try {
  const response = await apiClient.get(`/hr/employees?${params.toString()}`)
  return response.data
} catch (error: any) {
  throw new Error(formatBilingualError(error, 'getEmployees'))
}
```

#### d) Bilingual Validation Messages
```typescript
if (!isValidObjectId(id)) {
  throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
}
```

---

## Endpoints Fixed

### Employee Management (7 endpoints)

1. ✅ **getEmployees** - `GET /hr/employees`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Filtering, pagination, sorting support documented

2. ✅ **getEmployee** - `GET /hr/employees/:id`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Validation with bilingual error message

3. ✅ **createEmployee** - `POST /hr/employees`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Handles different response structures

4. ✅ **updateEmployee** - `PUT /hr/employees/:id`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Validation with bilingual error message

5. ✅ **deleteEmployee** - `DELETE /hr/employees/:id`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Validation with bilingual error message

6. ✅ **getEmployeeStats** - `GET /hr/employees/stats`
   - Added: JSDoc, TODO, try-catch, bilingual errors

7. ✅ **bulkDeleteEmployees** - `POST /hr/employees/bulk-delete`
   - Added: JSDoc, TODO, try-catch, bilingual errors

### Form Options (1 endpoint)

8. ✅ **getFormOptions** - `GET /hr/options`
   - Added: JSDoc, TODO, try-catch, bilingual errors

### Allowances Management (2 endpoints)

9. ✅ **addAllowance** - `POST /hr/employees/:id/allowances`
   - Added: JSDoc, TODO, try-catch, bilingual errors
   - Validation with bilingual error message

10. ✅ **removeAllowance** - `DELETE /hr/employees/:id/allowances/:allowanceId`
    - Added: JSDoc, TODO, try-catch, bilingual errors
    - Validation with bilingual error message

### Document Management (3 endpoints)

11. ✅ **uploadDocument** - `POST /hr/employees/:id/documents`
    - Added: JSDoc, TODO, try-catch, bilingual errors
    - Validation with bilingual error message
    - File upload with FormData support

12. ✅ **deleteDocument** - `DELETE /hr/employees/:id/documents/:documentId`
    - Added: JSDoc, TODO, try-catch, bilingual errors
    - Validation with bilingual error message

13. ✅ **verifyDocument** - `PATCH /hr/employees/:id/documents/:documentId/verify`
    - Added: JSDoc, TODO, try-catch, bilingual errors
    - Validation with bilingual error message

---

## Statistics

### Code Changes
- **Total Lines:** 673 (was 473)
- **Lines Added:** 248
- **Lines Removed:** 47
- **Net Change:** +201 lines

### [BACKEND-PENDING] Tags
- **JSDoc Comments:** 14 occurrences (header + 13 endpoints)
- **TODO Comments:** 13 occurrences
- **Total Tags:** 27 occurrences

### Bilingual Error Messages
- **formatBilingualError calls:** 13 (one per endpoint)
- **Validation messages:** 8 (for ID validation)
- **Helper function definition:** 1
- **Total bilingual error handling:** 22 instances

---

## Error Message Format

### Pattern Used
All error messages follow the format: `Arabic | English`

### Examples

**Validation Errors:**
```
معرّف الموظف غير صالح | Invalid employee ID
```

**API Errors:**
```
فشلت العملية | Operation failed: getEmployees
```

**Not Implemented Errors (for future use):**
```
❌ Backend Not Implemented | الخلفية غير مطبقة

EN: The HR backend endpoint '/hr/employees' is not yet implemented.
This operation (getEmployees) cannot be performed until the backend endpoint is created.

AR: نقطة نهاية الموارد البشرية '/hr/employees' غير مطبقة بعد.
لا يمكن تنفيذ هذه العملية (getEmployees) حتى يتم إنشاء نقطة النهاية الخلفية.
```

---

## Backend Requirements

The following endpoints need to be implemented in the backend:

### Core Endpoints
```
GET    /api/hr/employees              - List employees with filters
GET    /api/hr/employees/:id          - Get single employee
POST   /api/hr/employees              - Create employee
PUT    /api/hr/employees/:id          - Update employee
DELETE /api/hr/employees/:id          - Delete employee
GET    /api/hr/employees/stats        - Get employee statistics
POST   /api/hr/employees/bulk-delete  - Bulk delete employees
```

### Supporting Endpoints
```
GET    /api/hr/options                              - Get form options
POST   /api/hr/employees/:id/allowances             - Add allowance
DELETE /api/hr/employees/:id/allowances/:allowanceId - Remove allowance
POST   /api/hr/employees/:id/documents              - Upload document
DELETE /api/hr/employees/:id/documents/:documentId   - Delete document
PATCH  /api/hr/employees/:id/documents/:documentId/verify - Verify document
```

### Features Required
- Employee filtering (status, department, type, nationality, etc.)
- Pagination and sorting
- Search functionality
- File upload support (multipart/form-data)
- GOSI and WPS integration data
- Leave management
- Compensation and allowances
- Document management with verification
- Audit trails (createdAt, createdBy, etc.)

---

## Testing Recommendations

When backend endpoints are implemented:

1. **Test bilingual error handling**
   - Verify Arabic and English messages display correctly
   - Test all validation scenarios

2. **Test each endpoint**
   - Verify proper error handling for 404, 401, 403, 500 errors
   - Test with invalid IDs
   - Test with missing required fields

3. **Test file uploads**
   - Verify FormData handling
   - Test different file types and sizes
   - Test upload failures

4. **Test filtering and pagination**
   - Verify all filter parameters work
   - Test pagination edge cases
   - Test sorting in both directions

---

## Related Files

These files may need updates when HR endpoints are implemented:
- `/src/hooks/useEmployees.ts` (if exists)
- `/src/features/hr/**/*.tsx` (HR feature components)
- `/src/services/hrSettingsService.ts`
- `/src/services/hrSetupWizardService.ts`
- `/src/services/hrAnalyticsService.ts`

---

## Compliance

✅ All error messages are bilingual (English | Arabic)
✅ All endpoints tagged with [BACKEND-PENDING]
✅ Proper error handling with try-catch blocks
✅ Input validation with bilingual messages
✅ JSDoc documentation for all endpoints
✅ TODO comments for backend developers

---

**END OF FIXES SUMMARY**
