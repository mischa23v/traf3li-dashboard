# Quick Reference: [BACKEND-PENDING] Time Tracking Endpoints

**Last Updated:** December 23, 2025

---

## 🚨 Missing Endpoints - Requires Backend Implementation

### 1. Time Entry Approval Workflow

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/time-tracking/entries/pending-approval` | GET | Get all time entries pending approval | ❌ Not Implemented |
| `/api/time-tracking/entries/bulk-approve` | POST | Approve multiple time entries | ❌ Not Implemented |
| `/api/time-tracking/entries/bulk-reject` | POST | Reject multiple time entries | ❌ Not Implemented |
| `/api/time-tracking/entries/:id/request-changes` | POST | Request changes to a time entry | ❌ Not Implemented |
| `/api/time-tracking/entries/:id/submit` | POST | Submit time entry for approval | ❌ Not Implemented |
| `/api/time-tracking/entries/bulk-submit` | POST | Submit multiple entries for approval | ❌ Not Implemented |

---

## ✅ Implemented Endpoints - Working Correctly

### Timer Operations
- ✅ GET `/api/time-tracking/timer/status`
- ✅ POST `/api/time-tracking/timer/start`
- ✅ POST `/api/time-tracking/timer/pause`
- ✅ POST `/api/time-tracking/timer/resume`
- ✅ POST `/api/time-tracking/timer/stop`

### Time Entries CRUD
- ✅ GET `/api/time-tracking/entries`
- ✅ POST `/api/time-tracking/entries`
- ✅ GET `/api/time-tracking/entries/:id`
- ✅ PUT `/api/time-tracking/entries/:id`
- ✅ DELETE `/api/time-tracking/entries/:id`

### Time Entry Management
- ✅ GET `/api/time-tracking/stats`
- ✅ GET `/api/time-tracking/unbilled`
- ✅ GET `/api/time-tracking/activity-codes`
- ✅ GET `/api/time-tracking/weekly`
- ✅ DELETE `/api/time-tracking/entries/bulk`
- ✅ POST `/api/time-tracking/entries/:id/approve` (basic implementation exists)
- ✅ POST `/api/time-tracking/entries/:id/reject` (basic implementation exists)
- ✅ POST `/api/time-tracking/entries/:id/write-off`
- ✅ POST `/api/time-tracking/entries/:id/write-down`

### Time Entry Locking
- ✅ POST `/api/time-tracking/entries/:id/lock`
- ✅ POST `/api/time-tracking/entries/:id/unlock`
- ✅ POST `/api/time-tracking/entries/bulk-lock`
- ✅ GET `/api/time-tracking/entries/:id/lock-status`
- ✅ POST `/api/time-tracking/entries/lock-by-date-range`

### Reports
- ✅ GET `/api/reports/time-entries`

---

## 📍 Where to Find [BACKEND-PENDING] Tags

### Frontend Components
```
/src/features/finance/components/time-entry-approvals-view.tsx
  - Lines 53-137: Mock hooks with [BACKEND-PENDING] tags
  - Lines 384-414: Alert banner warning users

/src/features/finance/components/reports/time-entries-report.tsx
  - Line 70-71: Mock data comment
  - Lines 103-119: Warning banner
```

### Service Layer
```
/src/services/financeService.approval-methods.ts
  - Contains approval methods ready to merge
  - Methods are implemented but backend endpoints don't exist
```

---

## 🎯 Priority Implementation Order

1. **High Priority:**
   - GET `/api/time-tracking/entries/pending-approval`
   - POST `/api/time-tracking/entries/:id/submit`

2. **Medium Priority:**
   - POST `/api/time-tracking/entries/bulk-submit`
   - POST `/api/time-tracking/entries/:id/request-changes`

3. **Low Priority:**
   - POST `/api/time-tracking/entries/bulk-approve` (basic approve exists)
   - POST `/api/time-tracking/entries/bulk-reject` (basic reject exists)

---

## 🔍 How to Search for Issues

### Find all [BACKEND-PENDING] tags:
```bash
grep -rn "BACKEND-PENDING" src/features/finance/components/
```

### Find all mock implementations:
```bash
grep -rn "Mock hook" src/features/finance/components/
```

### Find all bilingual error messages:
```bash
grep -rn "الميزة غير متاحة" src/features/finance/components/
```

---

## 📝 Component Status Summary

| Component | Status | Has Warnings | Bilingual Errors |
|-----------|--------|--------------|------------------|
| time-entry-approvals-view.tsx | ⚠️ Mock Implementation | ✅ Yes | ✅ Yes |
| time-entries-report.tsx | ⚠️ Mock Data | ✅ Yes | ✅ Yes |
| weekly-time-entries-view.tsx | ✅ Working | ❌ No | ✅ Yes |
| time-entries-dashboard.tsx | ✅ Working | ❌ No | ✅ Yes |
| create-time-entry-view.tsx | ✅ Working | ❌ No | ✅ Yes |
| edit-time-entry-view.tsx | ✅ Working | ❌ No | ✅ Yes |
| time-entry-details-view.tsx | ✅ Working | ❌ No | ✅ Yes |

---

## 🛠️ Example Error Message Format

```typescript
// When user tries to use unimplemented feature:
toast.error(
  'Feature not available | الميزة غير متاحة\n' +
  '[BACKEND-PENDING] Approval endpoint not implemented | نقطة نهاية الموافقة غير منفذة'
)

// When showing warnings:
<Alert className="border-amber-300 bg-amber-50">
  <AlertTitle>Feature Under Development | الميزة قيد التطوير</AlertTitle>
  <AlertDescription>
    [BACKEND-PENDING] Description in English
    [الخلفية معلقة] الوصف بالعربية
  </AlertDescription>
</Alert>
```

---

## 📚 Documentation Files

1. **TIME_TRACKING_ENDPOINT_FIXES.md** - Complete audit and fixes
2. **WORK_SUMMARY_TIME_TRACKING_FIXES.md** - Work summary
3. **QUICK_REFERENCE_BACKEND_PENDING.md** - This file

---

## ✅ Checklist for Backend Team

- [ ] Review missing endpoints list
- [ ] Prioritize implementation order
- [ ] Implement GET `/api/time-tracking/entries/pending-approval`
- [ ] Implement POST `/api/time-tracking/entries/:id/submit`
- [ ] Implement bulk approval operations
- [ ] Implement request-changes functionality
- [ ] Test all endpoints with frontend
- [ ] Update API documentation
- [ ] Notify frontend team when ready

---

## ✅ Checklist for Frontend Team

- [ ] Merge approval methods into financeService.ts
- [ ] Create hooks in useFinance.ts
- [ ] Remove mock implementations
- [ ] Remove warning banners
- [ ] Test with real backend
- [ ] Update documentation
- [ ] Deploy to production

---

**Quick Command to Check Status:**
```bash
# Count [BACKEND-PENDING] tags
grep -r "BACKEND-PENDING" src/features/finance/components/ | wc -l

# List files with warnings
grep -l "BACKEND-PENDING" src/features/finance/components/*.tsx
```
