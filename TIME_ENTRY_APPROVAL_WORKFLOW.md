# Time Entry Approval Workflow - Complete Implementation Guide

This document provides a comprehensive overview of the Time Entry Approval Workflow implementation for the Traf3li Dashboard.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Files Created](#files-created)
5. [Integration Steps](#integration-steps)
6. [API Endpoints Required](#api-endpoints-required)
7. [Database Schema Updates](#database-schema-updates)
8. [User Flows](#user-flows)
9. [Testing Guide](#testing-guide)

---

## Overview

The Time Entry Approval Workflow enables a two-tier system where employees submit their time entries for approval before they can be billed. Managers can review, approve, reject, or request changes on submitted entries.

### Approval States

1. **draft** - Initial state, entry can be edited by employee
2. **submitted** - Sent for approval, awaiting manager review
3. **approved** - Approved by manager, ready for billing
4. **rejected** - Rejected by manager with reason, can be resubmitted
5. **billed** - Final state, entry has been invoiced

---

## Features

### For Employees

- ✅ Submit time entries for approval
- ✅ View approval status on each entry
- ✅ See rejection reasons with detailed feedback
- ✅ View requested changes from managers
- ✅ Resubmit rejected or modified entries
- ✅ Visual status badges (Draft, Pending, Approved, Rejected)
- ✅ Locked editing after approval

### For Managers/Approvers

- ✅ View pending time entries from team members
- ✅ Filter by employee, date range, case
- ✅ Bulk approve selected entries
- ✅ Bulk reject with reason
- ✅ Request changes with comments
- ✅ View entry details before approval
- ✅ Summary statistics (pending count, hours, value)
- ✅ Employee filter dropdown
- ✅ Date range picker

### Notifications

- 🔔 Notify manager when entries submitted
- 🔔 Notify employee when approved
- 🔔 Notify employee when rejected
- 🔔 Notify employee when changes requested

---

## Architecture

### Component Structure

```
src/
├── features/finance/components/
│   ├── time-entries-dashboard.tsx           (Employee view - enhanced)
│   ├── time-entry-approvals-view.tsx        (Manager approval queue)
│   ├── time-entries-dashboard-enhancements.md (Enhancement guide)
│   └── finance-sidebar.tsx                  (Shared sidebar)
│
├── routes/_authenticated/
│   └── dashboard.finance.time-tracking.approvals.tsx (Route for approval queue)
│
├── services/
│   ├── financeService.ts                    (Main service - needs updates)
│   └── financeService.approval-methods.ts   (Approval methods to merge)
│
└── hooks/
    ├── useFinance.ts                        (Main hooks - needs updates)
    └── useFinance.approval-hooks.ts         (Approval hooks to merge)
```

### Data Flow

```
Employee submits entry
        ↓
Backend updates status to 'submitted'
        ↓
Notification sent to manager
        ↓
Manager views in approval queue
        ↓
Manager takes action (approve/reject/request changes)
        ↓
Backend updates entry status
        ↓
Notification sent to employee
        ↓
Entry reflects new status
```

---

## Files Created

### 1. Main Components

#### `/src/features/finance/components/time-entry-approvals-view.tsx`
Complete approval queue dashboard for managers with:
- Pending entries list
- Bulk selection and actions
- Approve/reject/request changes dialogs
- Employee and date range filters
- Summary statistics cards
- Real-time updates

#### `/src/routes/_authenticated/dashboard.finance.time-tracking.approvals.tsx`
Route definition for approval queue:
- Path: `/dashboard/finance/time-tracking/approvals`
- Component: TimeEntryApprovalsView

### 2. Service Layer

#### `/src/services/financeService.approval-methods.ts`
Contains 5 new service methods to add to `financeService.ts`:
- `submitTimeEntryForApproval(id)` - Submit single entry
- `bulkSubmitTimeEntries(entryIds)` - Submit multiple entries
- `bulkRejectTimeEntries(entryIds, reason)` - Reject multiple entries
- `getPendingTimeEntries(filters)` - Fetch pending entries for approval
- `requestTimeEntryChanges(id, comments)` - Request modifications

### 3. Hooks Layer

#### `/src/hooks/useFinance.approval-hooks.ts`
Contains 8 new React Query hooks to add to `useFinance.ts`:
- `useSubmitTimeEntryForApproval()` - Submit for approval mutation
- `useApproveTimeEntry()` - Approve mutation
- `useRejectTimeEntry()` - Reject mutation
- `useRequestTimeEntryChanges()` - Request changes mutation
- `useBulkSubmitTimeEntries()` - Bulk submit mutation
- `useBulkApproveTimeEntries()` - Bulk approve mutation
- `useBulkRejectTimeEntries()` - Bulk reject mutation
- `usePendingTimeEntries(filters)` - Query pending entries

### 4. Enhancement Guide

#### `/src/features/finance/components/time-entries-dashboard-enhancements.md`
Step-by-step guide to enhance existing time entries dashboard with:
- Approval status display
- Submit for approval button
- Rejection reason display
- Changes requested display
- Conditional editing based on status

---

## Integration Steps

### Step 1: Update Service Layer

1. Open `/src/services/financeService.ts`
2. Navigate to line ~1308 (after `rejectTimeEntry` method)
3. Copy all methods from `/src/services/financeService.approval-methods.ts`
4. Paste them before the `// ==================== PAYMENTS` comment
5. Save the file

### Step 2: Update Hooks Layer

1. Open `/src/hooks/useFinance.ts`
2. Navigate to line ~850 (after existing time tracking hooks)
3. Copy all hooks from `/src/hooks/useFinance.approval-hooks.ts`
4. Paste them in the TIME TRACKING section
5. Ensure all imports are present (they should already be there)
6. Save the file

### Step 3: Enhance Time Entries Dashboard

1. Open `/src/features/finance/components/time-entries-dashboard.tsx`
2. Follow the 8 steps in `/src/features/finance/components/time-entries-dashboard-enhancements.md`
3. Test each enhancement after implementation
4. Save the file

### Step 4: Update Navigation

Add a link to the approval queue in the finance navigation:

```typescript
// In FinanceSidebar or TopNav component
{
  title: 'موافقات الوقت',
  href: '/dashboard/finance/time-tracking/approvals',
  icon: CheckCircle2,
  badge: pendingCount > 0 ? pendingCount : undefined
}
```

### Step 5: Update Approvals View Hooks

1. Open `/src/features/finance/components/time-entry-approvals-view.tsx`
2. Replace the mock hooks (lines 53-76) with real imports:

```typescript
import {
    usePendingTimeEntries,
    useApproveTimeEntry,
    useRejectTimeEntry,
    useBulkApproveTimeEntries,
    useBulkRejectTimeEntries,
    useRequestTimeEntryChanges,
} from '@/hooks/useFinance'
```

3. Remove the mock hook definitions
4. Save the file

---

## API Endpoints Required

The backend must implement these endpoints:

### Time Entry Submission

```
POST /api/time-tracking/entries/:id/submit
Body: { notes?: string }
Response: { success: true, timeEntry: TimeEntry }
```

### Approval Actions

```
POST /api/time-tracking/entries/:id/approve
Body: { comments?: string }
Response: { success: true, timeEntry: TimeEntry }
```

```
POST /api/time-tracking/entries/:id/reject
Body: { reason: string }
Response: { success: true, timeEntry: TimeEntry }
```

```
POST /api/time-tracking/entries/:id/request-changes
Body: { comments: string }
Response: { success: true, timeEntry: TimeEntry }
```

### Bulk Operations

```
POST /api/time-tracking/entries/bulk-submit
Body: { entryIds: string[] }
Response: { success: true, data: { submitted: number, failed: number } }
```

```
POST /api/time-tracking/entries/bulk-approve
Body: { entryIds: string[], comments?: string }
Response: { success: true, data: { approved: number, failed: number } }
```

```
POST /api/time-tracking/entries/bulk-reject
Body: { entryIds: string[], reason: string }
Response: { success: true, data: { rejected: number, failed: number } }
```

### Query Endpoints

```
GET /api/time-tracking/entries/pending?userId=&startDate=&endDate=&caseId=
Response: {
  success: true,
  data: TimeEntry[],
  pagination: { total, page, totalPages }
}
```

---

## Database Schema Updates

Add these fields to the TimeEntry model:

```typescript
interface TimeEntry {
  // ... existing fields ...

  // Approval workflow fields
  approvalStatus: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed'
  submittedAt?: Date
  submittedBy?: ObjectId // ref: User
  approvedAt?: Date
  approvedBy?: ObjectId // ref: User
  rejectedAt?: Date
  rejectedBy?: ObjectId // ref: User
  rejectionReason?: string
  changesRequested?: string
  changesRequestedBy?: ObjectId // ref: User
  changesRequestedAt?: Date
  approvalHistory?: [{
    action: 'submitted' | 'approved' | 'rejected' | 'changes_requested'
    performedBy: ObjectId // ref: User
    timestamp: Date
    notes?: string
  }]
}
```

### Migration Script

```javascript
// MongoDB migration
db.timeEntries.updateMany(
  { approvalStatus: { $exists: false } },
  {
    $set: {
      approvalStatus: 'draft',
      approvalHistory: []
    }
  }
)
```

---

## User Flows

### Employee Flow: Submit Time Entry

1. Employee creates/edits time entry
2. Entry is saved as 'draft' status
3. Employee clicks "إرسال للموافقة" (Submit for Approval)
4. Optional: Add notes in dialog
5. Click "إرسال للموافقة" to confirm
6. Entry status changes to 'submitted'
7. Entry becomes read-only for employee
8. Manager receives notification
9. Employee sees "معلق" (Pending) badge on entry

### Employee Flow: Handle Rejection

1. Employee receives notification of rejection
2. Views time entries dashboard
3. Sees red "مرفوض" (Rejected) badge
4. Expands entry to see rejection reason
5. Clicks dropdown → "إعادة الإرسال للموافقة" (Resubmit)
6. Makes necessary corrections
7. Resubmits for approval

### Manager Flow: Approve Entries

1. Manager navigates to `/dashboard/finance/time-tracking/approvals`
2. Views list of pending entries
3. Can filter by employee, date, case
4. Reviews entry details (description, hours, rate, amount)
5. Option 1: Click "موافقة" (Approve) on individual entry
6. Option 2: Select multiple entries with checkboxes
7. Option 2: Click "الموافقة على الكل" (Approve All)
8. Entries status changes to 'approved'
9. Employees receive approval notifications
10. Entries can now be billed

### Manager Flow: Reject with Reason

1. Manager reviews entry in approval queue
2. Clicks dropdown → "رفض" (Reject)
3. Dialog opens requesting rejection reason
4. Manager enters detailed reason
5. Clicks "رفض" to confirm
6. Entry status changes to 'rejected'
7. Employee receives notification with reason
8. Entry returns to employee for corrections

### Manager Flow: Request Changes

1. Manager reviews entry
2. Notices minor issues that need correction
3. Clicks dropdown → "طلب تعديلات" (Request Changes)
4. Enters specific change requests
5. Clicks "إرسال" to send
6. Entry status updated with change request
7. Employee receives notification
8. Employee sees amber banner with requested changes
9. Employee makes changes and resubmits

---

## Testing Guide

### Unit Tests

Test the service methods:

```typescript
describe('Time Entry Approval Service', () => {
  it('should submit entry for approval', async () => {
    const result = await financeService.submitTimeEntryForApproval('entry-id')
    expect(result.approvalStatus).toBe('submitted')
  })

  it('should approve entry', async () => {
    const result = await financeService.approveTimeEntry('entry-id')
    expect(result.approvalStatus).toBe('approved')
  })

  it('should reject entry with reason', async () => {
    const result = await financeService.rejectTimeEntry('entry-id', 'Invalid hours')
    expect(result.approvalStatus).toBe('rejected')
    expect(result.rejectionReason).toBe('Invalid hours')
  })

  it('should bulk approve entries', async () => {
    const result = await financeService.bulkApproveTimeEntries(['id1', 'id2'])
    expect(result.approved).toBeGreaterThan(0)
  })
})
```

### Integration Tests

1. **Submit Flow**
   - Create draft entry
   - Submit for approval
   - Verify status change
   - Verify notification sent

2. **Approval Flow**
   - Submit entry
   - Login as manager
   - Approve entry
   - Verify status change
   - Verify employee notification

3. **Rejection Flow**
   - Submit entry
   - Login as manager
   - Reject with reason
   - Verify status and reason saved
   - Verify employee notification

4. **Bulk Operations**
   - Create multiple entries
   - Submit all
   - Bulk approve some
   - Bulk reject others
   - Verify counts and statuses

### Manual Testing Checklist

#### Employee View
- [ ] Can submit draft entry
- [ ] Sees pending status after submission
- [ ] Cannot edit submitted entry
- [ ] Receives approval notification
- [ ] Receives rejection notification
- [ ] Can view rejection reason
- [ ] Can resubmit rejected entry
- [ ] Sees changes requested banner
- [ ] Can resubmit after making requested changes

#### Manager View
- [ ] Sees all pending entries
- [ ] Can filter by employee
- [ ] Can filter by date range
- [ ] Can filter by case
- [ ] Can search entries
- [ ] Can approve individual entry
- [ ] Can reject individual entry with reason
- [ ] Can request changes with comments
- [ ] Can bulk select entries
- [ ] Can bulk approve selected entries
- [ ] Can bulk reject selected entries
- [ ] Statistics update correctly
- [ ] Empty state shows when no pending entries

#### Notifications
- [ ] Manager notified on submission
- [ ] Employee notified on approval
- [ ] Employee notified on rejection
- [ ] Employee notified on change request
- [ ] Notifications link to correct entry
- [ ] Notification count badge updates

---

## Visual Design

### Status Colors

| Status | Badge Color | Background | Border | Text |
|--------|------------|------------|--------|------|
| Draft | Slate | `bg-slate-50` | `border-slate-200` | `text-slate-600` |
| Submitted | Blue | `bg-blue-50` | `border-blue-200` | `text-blue-600` |
| Approved | Emerald | `bg-emerald-50` | `border-emerald-200` | `text-emerald-600` |
| Rejected | Red | `bg-red-50` | `border-red-200` | `text-red-600` |
| Billed | Emerald | `bg-emerald-50` | `border-emerald-200` | `text-emerald-600` |

### Arabic Labels

| English | Arabic |
|---------|--------|
| Draft | مسودة |
| Pending | معلق |
| Approved | تمت الموافقة |
| Rejected | مرفوض |
| Submit for Approval | إرسال للموافقة |
| Approve | موافقة |
| Reject | رفض |
| Request Changes | طلب تعديلات |
| Rejection Reason | سبب الرفض |
| Changes Requested | تعديلات مطلوبة |
| Resubmit | إعادة الإرسال |
| Bulk Approve | الموافقة على الكل |
| Bulk Reject | رفض الكل |
| Pending Approvals | الموافقات المعلقة |

---

## Performance Considerations

1. **Query Optimization**
   - Index on `approvalStatus` field
   - Index on `submittedAt` for sorting
   - Composite index on `(approvalStatus, submittedAt)`

2. **Real-time Updates**
   - Consider WebSocket for live updates
   - Or polling every 30-60 seconds for approval queue

3. **Caching**
   - Cache pending entries count for badge
   - Invalidate on approval/rejection
   - Stale time: 1 minute for approval queue

4. **Pagination**
   - Implement server-side pagination for large approval queues
   - Default page size: 20-50 entries

---

## Security Considerations

1. **Authorization**
   - Only managers/approvers can access approval queue
   - Implement role-based access control (RBAC)
   - Verify permissions on backend

2. **Validation**
   - Validate entry ownership before submission
   - Prevent approving own entries
   - Validate rejection reason is not empty

3. **Audit Trail**
   - Log all approval actions
   - Store in `approvalHistory` array
   - Include user ID, timestamp, action type

4. **Data Integrity**
   - Prevent editing approved entries
   - Prevent billing non-approved entries
   - Atomic status updates

---

## Future Enhancements

1. **Multi-level Approval**
   - Support approval chains
   - Different approval levels based on amount

2. **Approval Rules**
   - Auto-approve entries under certain amount
   - Auto-approve for trusted employees

3. **Approval Templates**
   - Pre-defined rejection reasons
   - Common change request templates

4. **Analytics**
   - Approval rate per manager
   - Average approval time
   - Most common rejection reasons

5. **Mobile Support**
   - Mobile-optimized approval queue
   - Push notifications for mobile app

6. **Delegation**
   - Assign approval to another manager
   - Temporary approval delegation during absence

---

## Support & Documentation

### Related Files
- `/src/features/finance/components/time-entry-approvals-view.tsx`
- `/src/features/finance/components/time-entries-dashboard.tsx`
- `/src/features/finance/components/time-entries-dashboard-enhancements.md`
- `/src/services/financeService.approval-methods.ts`
- `/src/hooks/useFinance.approval-hooks.ts`
- `/src/routes/_authenticated/dashboard.finance.time-tracking.approvals.tsx`

### API Documentation
Backend API documentation should be updated to include all approval endpoints and their request/response schemas.

### User Guide
Create user documentation with:
- Employee guide for submitting entries
- Manager guide for approval queue
- Screenshots of each step
- Video walkthrough

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Complete approval workflow UI
- ✅ Employee submission interface
- ✅ Manager approval queue
- ✅ Bulk operations support
- ✅ Status badges and visual feedback
- ✅ Rejection reasons
- ✅ Change requests
- ✅ Filter and search functionality
- ✅ Summary statistics
- ✅ Responsive design
- ✅ Arabic localization

---

## Contributors

- Claude AI Assistant - Complete implementation
- Traf3li Development Team - Integration and testing

---

## License

This implementation is part of the Traf3li Dashboard project and follows the project's license.
