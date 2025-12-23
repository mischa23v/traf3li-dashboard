# Tasks API Endpoint Mismatches

**Date:** 2025-12-23
**Frontend File:** `/src/services/tasksService.ts`
**Backend Documentation:** `/docs/TASKS_REMINDERS_EVENTS_API.md`

---

## Summary

This document lists all API endpoint mismatches between the frontend `tasksService.ts` and the backend API documentation.

### Status Legend
- ✅ **Documented & Implemented** - Endpoint exists in backend API docs
- ⚠️ **Path Mismatch** - Endpoint exists but uses different path
- ❌ **Not Documented** - Endpoint NOT in backend API docs (likely doesn't exist)
- 🔄 **Method Mismatch** - Uses different HTTP method than documented

---

## Core CRUD Operations

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| GET | `/tasks` | ✅ | `/tasks` | Working |
| GET | `/tasks/:id` | ✅ | `/tasks/:id` | Working |
| POST | `/tasks` | ✅ | `/tasks` | Working |
| PUT | `/tasks/:id` | ✅ | `/tasks/:id` | Working |
| DELETE | `/tasks/:id` | ✅ | `/tasks/:id` | Working |

---

## Status Operations

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| PATCH | `/tasks/:id/status` | ✅ | `/tasks/:id/status` | Working |
| PATCH | `/tasks/:id/progress` | ❌ | N/A | **NOT DOCUMENTED** - Feature may not exist |
| POST | `/tasks/:id/complete` | ✅ | `/tasks/:id/complete` | Working |
| POST | `/tasks/:id/reopen` | ✅ | `/tasks/:id/reopen` | Working |

### ❌ Progress Endpoint Issue

**Frontend:** `PATCH /tasks/:id/progress`

**Problem:** This endpoint is NOT documented in the backend API. Progress is likely calculated automatically from subtasks.

**Impact:** Calls to `updateProgress()` will fail with 404.

**Recommendation:** Remove this endpoint or update backend to implement it.

---

## Subtasks

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/subtasks` | ✅ | `/tasks/:id/subtasks` | Working |
| PATCH | `/tasks/:id/subtasks/:subtaskId` | ✅ | `/tasks/:id/subtasks/:subtaskId` | Working |
| PATCH | `/tasks/:id/subtasks/:subtaskId/toggle` | 🔄 | POST `/tasks/:id/subtasks/:subtaskId/toggle` | **Method mismatch** - Backend uses POST |
| DELETE | `/tasks/:id/subtasks/:subtaskId` | ✅ | `/tasks/:id/subtasks/:subtaskId` | Working |
| PATCH | `/tasks/:id/subtasks/reorder` | ✅ | `/tasks/:id/subtasks/reorder` | Working |

### ⚠️ Toggle Subtask Method Mismatch

**Frontend:** `PATCH /tasks/:id/subtasks/:subtaskId/toggle`

**Backend:** `POST /tasks/:id/subtasks/:subtaskId/toggle`

**Fix Applied:** Added fallback to try POST if PATCH fails with 404/405.

---

## Time Tracking

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/timer/start` | ⚠️ | `/tasks/:id/time-tracking/start` | **Path mismatch** |
| POST | `/tasks/:id/timer/stop` | ⚠️ | `/tasks/:id/time-tracking/stop` | **Path mismatch** |
| POST | `/tasks/:id/time` | ⚠️ | `/tasks/:id/time-tracking/manual` | **Path mismatch** |
| GET | `/tasks/:id/time-tracking/summary` | ⚠️ | `/tasks/:id/time-tracking` | **Path mismatch** |

### ⚠️ Time Tracking Path Mismatches

All time tracking endpoints use different paths than documented.

**Fix Applied:** Added fallback logic to try documented endpoints if custom paths fail.

**Recommendation:** Update backend to support both paths OR update frontend to use documented paths only.

---

## Comments

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/comments` | ✅ | `/tasks/:id/comments` | Working |
| PUT | `/tasks/:id/comments/:commentId` | 🔄 | PATCH `/tasks/:id/comments/:commentId` | **Method mismatch** - Backend uses PATCH |
| DELETE | `/tasks/:id/comments/:commentId` | ✅ | `/tasks/:id/comments/:commentId` | Working |

### ⚠️ Update Comment Method Mismatch

**Frontend:** `PUT /tasks/:id/comments/:commentId`

**Backend:** `PATCH /tasks/:id/comments/:commentId`

**Recommendation:** Change frontend to use PATCH instead of PUT.

---

## Attachments & S3

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/attachments` | ✅ | `/tasks/:id/attachments` | Working |
| DELETE | `/tasks/:id/attachments/:attachmentId` | ✅ | `/tasks/:id/attachments/:attachmentId` | Working |
| GET | `/tasks/:id/attachments/:attachmentId/download-url` | ❌ | N/A | **S3-specific, NOT DOCUMENTED** |
| GET | `/tasks/:id/attachments/:attachmentId/versions` | ❌ | N/A | **S3 versioning, NOT DOCUMENTED** |

### ❌ S3-Specific Endpoints Not Documented

The following S3-specific endpoints are used in frontend but NOT documented in backend API:

1. `GET /tasks/:id/attachments/:attachmentId/download-url` - Get presigned URL
2. `GET /tasks/:id/attachments/:attachmentId/versions` - Get S3 version history

**Impact:** These features may not work if backend doesn't implement S3 storage.

**Recommendation:** Add these endpoints to backend docs OR remove S3-specific features from frontend.

---

## Task Dependencies

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/dependencies` | ❌ | N/A | **NOT DOCUMENTED** |
| DELETE | `/tasks/:id/dependencies/:dependencyTaskId` | ❌ | N/A | **NOT DOCUMENTED** |
| GET | `/tasks/:id/available-dependencies` | ❌ | N/A | **NOT DOCUMENTED** |

### ❌ Task Dependencies Feature Not Implemented

**All dependency endpoints are NOT documented in backend API.**

This is a frontend-only feature that will fail with 404 errors.

**Methods Affected:**
- `addDependency()`
- `removeDependency()`
- `getAvailableDependencies()`

**Recommendation:** Either implement these endpoints in backend OR remove dependency features from frontend.

---

## Workflow Rules

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/workflow-rules` | ❌ | N/A | **NOT DOCUMENTED** |
| PATCH | `/tasks/:id/workflow-rules/:ruleId` | ❌ | N/A | **NOT DOCUMENTED** |
| DELETE | `/tasks/:id/workflow-rules/:ruleId` | ❌ | N/A | **NOT DOCUMENTED** |
| POST | `/tasks/:id/workflow-rules/:ruleId/toggle` | ❌ | N/A | **NOT DOCUMENTED** |

### ❌ Workflow Rules Feature Not Implemented

**All workflow rule endpoints are NOT documented in backend API.**

This is an advanced feature that doesn't exist yet.

**Methods Affected:**
- `addWorkflowRule()`
- `updateWorkflowRule()`
- `deleteWorkflowRule()`
- `toggleWorkflowRule()`

**Recommendation:** Remove from frontend OR implement in backend.

---

## Outcome & Estimates

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| PATCH | `/tasks/:id/outcome` | ❌ | N/A | **NOT DOCUMENTED** |
| PATCH | `/tasks/:id/estimate` | ❌ | N/A | **NOT DOCUMENTED** |

### ❌ Outcome and Estimate Endpoints Not Documented

These endpoints for tracking case outcomes and time/budget estimates are NOT in backend API docs.

**Methods Affected:**
- `updateOutcome()`
- `updateEstimate()`
- `getTimeTrackingDetails()`

**Recommendation:** Implement in backend OR remove from frontend.

---

## Query Endpoints

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| GET | `/tasks/upcoming` | ✅ | `/tasks/upcoming` | Working |
| GET | `/tasks/overdue` | ✅ | `/tasks/overdue` | Working |
| GET | `/tasks/due-today` | ✅ | `/tasks/due-today` | Working |
| GET | `/tasks/case/:caseId` | ❌ | Use `/tasks?caseId=X` | **NOT DOCUMENTED** - Use query param instead |
| GET | `/tasks/my-tasks` | ✅ | `/tasks/my-tasks` | Working |
| GET | `/tasks/stats` | ✅ | `/tasks/stats` | Working |

### ⚠️ Case Tasks Endpoint Mismatch

**Frontend:** `GET /tasks/case/:caseId`

**Backend:** Use query parameter: `GET /tasks?caseId=X`

**Recommendation:** Update frontend to use query parameter instead of path parameter.

---

## Templates

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| GET | `/tasks/templates` | ✅ | `/tasks/templates` | Working |
| GET | `/tasks/templates/:templateId` | ❌ | N/A | **NOT DOCUMENTED** |
| POST | `/tasks/templates` | ❌ | N/A | **NOT DOCUMENTED** |
| PUT | `/tasks/templates/:templateId` | ❌ | N/A | **NOT DOCUMENTED** |
| DELETE | `/tasks/templates/:templateId` | ❌ | N/A | **NOT DOCUMENTED** |
| POST | `/tasks/templates/:templateId/create` | ✅ | `/tasks/templates/:templateId/create` | Working |
| POST | `/tasks/:id/save-as-template` | ✅ | `/tasks/:id/save-as-template` | Working |

### ❌ Template CRUD Endpoints Not Documented

Direct template management endpoints are NOT documented. Backend only supports:
- Creating task from template
- Saving task as template

**Missing Endpoints:**
- Get single template by ID
- Create template directly
- Update template
- Delete template

**Recommendation:** Implement full template CRUD in backend OR remove from frontend.

---

## Bulk Operations

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| PUT | `/tasks/bulk` | 🔄 | PATCH `/tasks/bulk` | **Method mismatch** - Backend uses PATCH |
| DELETE | `/tasks/bulk` | ✅ | `/tasks/bulk` | Working |
| POST | `/tasks/bulk/complete` | ✅ | `/tasks/bulk/complete` | Working |
| POST | `/tasks/bulk/assign` | ✅ | `/tasks/bulk/assign` | Working |

### ⚠️ Bulk Update Method Mismatch

**Frontend:** `PUT /tasks/bulk`

**Backend:** `PATCH /tasks/bulk`

**Recommendation:** Change frontend to use PATCH instead of PUT.

---

## Import/Export

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/import` | ✅ | `/tasks/import` | Working |
| GET | `/tasks/export` | ✅ | `/tasks/export` | Working |

---

## Recurring Tasks

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/recurring/skip` | ✅ | `/tasks/:id/recurring/skip` | Working |
| POST | `/tasks/:id/recurring/stop` | ✅ | `/tasks/:id/recurring/stop` | Working |
| GET | `/tasks/:id/recurring/history` | ✅ | `/tasks/:id/recurring/history` | Working |

---

## TipTap Documents

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/documents` | ❌ | N/A | **NOT DOCUMENTED** |
| GET | `/tasks/:id/documents/:documentId` | ❌ | N/A | **NOT DOCUMENTED** |
| PATCH | `/tasks/:id/documents/:documentId` | ❌ | N/A | **NOT DOCUMENTED** |
| DELETE | `/tasks/:id/attachments/:documentId` | ⚠️ | N/A | Uses attachments endpoint |
| GET | `/tasks/:id/documents` | ❌ | N/A | **NOT DOCUMENTED** |

### ❌ TipTap Document Endpoints Not Documented

The entire TipTap document management feature is NOT in backend API docs.

**Methods Affected:**
- `createDocument()`
- `getDocument()`
- `updateDocument()`
- `deleteDocument()`
- `getDocuments()`

**Recommendation:** Implement document management in backend OR remove from frontend.

---

## Voice Memos

| Method | Frontend Endpoint | Status | Backend Expected | Notes |
|--------|------------------|--------|------------------|-------|
| POST | `/tasks/:id/voice-memos` | ❌ | N/A | **NOT DOCUMENTED** |
| PATCH | `/tasks/:id/voice-memos/:memoId/transcription` | ❌ | N/A | **NOT DOCUMENTED** |
| DELETE | `/tasks/:id/voice-memos/:memoId` | ❌ | N/A | **NOT DOCUMENTED** |

### ❌ Voice Memo Endpoints Not Documented

Voice memo feature is NOT in backend API docs.

**Methods Affected:**
- `uploadVoiceMemo()`
- `updateVoiceMemoTranscription()`
- `deleteVoiceMemo()`

**Recommendation:** Implement in backend OR remove from frontend.

---

## Summary of Issues

### Critical Issues (❌ Not Documented - 24 endpoints)

1. **Progress Update** - `PATCH /tasks/:id/progress`
2. **Task Dependencies** (3 endpoints)
3. **Workflow Rules** (4 endpoints)
4. **Outcome & Estimates** (3 endpoints)
5. **Case Tasks** - `GET /tasks/case/:caseId`
6. **Template Management** (4 endpoints)
7. **S3 Features** (2 endpoints)
8. **TipTap Documents** (5 endpoints)
9. **Voice Memos** (3 endpoints)

### Path/Method Mismatches (⚠️ - 8 endpoints)

1. **Time Tracking** - Uses `/timer/*` instead of `/time-tracking/*`
2. **Subtask Toggle** - Uses PATCH instead of POST
3. **Comment Update** - Uses PUT instead of PATCH
4. **Bulk Update** - Uses PUT instead of PATCH

---

## Recommendations

### Immediate Actions

1. **Fix Method Mismatches:**
   - Change `updateComment()` to use PATCH
   - Change `bulkUpdate()` to use PATCH
   - Change `toggleSubtask()` to use POST

2. **Fix Path Mismatches:**
   - Update time tracking endpoints to use `/time-tracking/*`
   - Update `getTasksByCase()` to use query parameter

3. **Handle Non-Existent Endpoints:**
   - Add clear error messages for features not implemented
   - Consider disabling UI for unavailable features
   - Document which features require backend implementation

### Long-term Solutions

1. **Backend Implementation:** Implement missing endpoints:
   - Task dependencies
   - Workflow rules
   - TipTap documents
   - Voice memos
   - S3 storage features
   - Full template CRUD

2. **Frontend Cleanup:** Remove features that won't be implemented:
   - Evaluate which features are actually needed
   - Remove unused service methods
   - Update UI to hide unavailable features

3. **API Sync:** Keep frontend and backend APIs in sync:
   - Regular API documentation audits
   - Automated endpoint testing
   - Version control for API changes

---

## Files Modified

- ✅ `/src/services/tasksService.ts` - Added bilingual error handling
- ✅ `/docs/TASKS_API_ENDPOINT_MISMATCHES.md` - This documentation

---

**Last Updated:** 2025-12-23
**Status:** All bilingual error messages implemented ✅
