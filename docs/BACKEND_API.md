# Backend API Documentation

## Overview

This document describes the complete backend API for the Traf3li Dashboard, focusing on **CaseNotion** (wiki-style case documentation) and **CasePipeline** (case workflow management) features.

## Base URL

- **Production**: `https://api.traf3li.com/api/v1`
- **Development**: `http://localhost:5000/api/v1`

## Authentication

All endpoints require authentication via HttpOnly cookies. CSRF token is required for mutating requests (POST, PATCH, DELETE).

---

# CaseNotion API

Wiki-style documentation system for legal cases with rich block-based editing.

## Page Types

```typescript
type PageType =
  | 'general'           // General notes
  | 'strategy'          // Case strategy and planning
  | 'timeline'          // Case timeline/chronology
  | 'evidence'          // Evidence collection
  | 'arguments'         // Legal arguments
  | 'research'          // Legal research
  | 'meeting_notes'     // Meeting/hearing notes
  | 'correspondence'    // Client correspondence
  | 'witnesses'         // Witness information
  | 'discovery'         // Discovery documents
  | 'pleadings'         // Pleading drafts
  | 'settlement'        // Settlement discussions
  | 'brainstorm'        // Brainstorming sessions
```

## Block Types

```typescript
type BlockType =
  | 'text' | 'heading_1' | 'heading_2' | 'heading_3'
  | 'bulleted_list' | 'numbered_list' | 'todo' | 'toggle'
  | 'quote' | 'callout' | 'divider' | 'code' | 'table'
  | 'image' | 'file' | 'bookmark' | 'embed' | 'synced_block'
  | 'template' | 'column_list' | 'column' | 'link_to_page'
  | 'mention' | 'equation'
  // Legal-specific blocks:
  | 'timeline_entry' | 'party_statement' | 'evidence_item' | 'legal_citation'
```

## Page Endpoints

### List Pages
```
GET /api/v1/cases/:caseId/notion/pages
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| pageType | string | Filter by page type |
| search | string | Search in title/content |
| isFavorite | boolean | Filter favorites |
| isPinned | boolean | Filter pinned pages |
| parentPageId | string | Filter by parent page |
| isArchived | boolean | Include archived pages |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [...],
    "count": 15,
    "totalPages": 1
  }
}
```

### Get Single Page
```
GET /api/v1/cases/:caseId/notion/pages/:pageId
```

Returns page with all blocks included.

### Create Page
```
POST /api/v1/cases/:caseId/notion/pages
```

**Body:**
```json
{
  "title": "Case Strategy",
  "titleAr": "استراتيجية القضية",
  "pageType": "strategy",
  "icon": { "type": "emoji", "emoji": "⚖️" },
  "cover": { "type": "gradient", "gradient": "bg-gradient-to-r from-emerald-500 to-teal-600" },
  "parentPageId": "optional-parent-id",
  "templateId": "optional-template-id"
}
```

### Update Page
```
PATCH /api/v1/cases/:caseId/notion/pages/:pageId
```

### Delete Page
```
DELETE /api/v1/cases/:caseId/notion/pages/:pageId
```

### Archive Page
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/archive
```

### Restore Page
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/restore
```

### Duplicate Page
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/duplicate
```

### Toggle Favorite
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/favorite
```

### Toggle Pin
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/pin
```

### Merge Pages
```
POST /api/v1/cases/:caseId/notion/pages/merge
```

**Body:**
```json
{
  "sourcePageIds": ["page-1", "page-2"],
  "targetTitle": "Merged Notes",
  "deleteSourcePages": true
}
```

## Block Endpoints

### Get Blocks
```
GET /api/v1/cases/:caseId/notion/pages/:pageId/blocks
```

### Create Block
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/blocks
```

**Body:**
```json
{
  "type": "heading_1",
  "content": [{ "type": "text", "text": { "content": "Introduction" } }],
  "afterBlockId": "optional-block-id",
  "parentId": "optional-parent-for-nesting",
  "indent": 0
}
```

### Update Block
```
PATCH /api/v1/cases/:caseId/notion/blocks/:blockId
```

### Delete Block
```
DELETE /api/v1/cases/:caseId/notion/blocks/:blockId
```

### Move Block
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/move
```

**Body:**
```json
{
  "targetPageId": "optional-new-page",
  "afterBlockId": "position-after-block",
  "parentId": "new-parent-block",
  "indent": 1
}
```

### Lock Block (for collaboration)
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/lock
```

### Unlock Block
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/unlock
```

## Synced Blocks

### Create Synced Block
```
POST /api/v1/cases/:caseId/notion/synced-blocks
```

**Body:**
```json
{
  "originalBlockId": "source-block-id",
  "targetPageId": "destination-page-id"
}
```

### Get Synced Block
```
GET /api/v1/cases/:caseId/notion/synced-blocks/:blockId
```

### Unsync Block
```
POST /api/v1/cases/:caseId/notion/synced-blocks/:blockId/unsync
```

## Comments

### Get Comments
```
GET /api/v1/cases/:caseId/notion/blocks/:blockId/comments
```

### Add Comment
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/comments
```

**Body:**
```json
{
  "content": "Comment text",
  "parentCommentId": "optional-for-threads"
}
```

### Resolve Comment
```
POST /api/v1/cases/:caseId/notion/comments/:commentId/resolve
```

### Delete Comment
```
DELETE /api/v1/cases/:caseId/notion/comments/:commentId
```

## Activity & History

### Get Page Activity
```
GET /api/v1/cases/:caseId/notion/pages/:pageId/activity?limit=20
```

## Search

### Search Within Case
```
GET /api/v1/cases/:caseId/notion/search?q=search-term
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "pageId": "page-id",
        "pageTitle": "Page Title",
        "blockId": "block-id",
        "blockContent": "Matched content...",
        "matchType": "title|content",
        "score": 0.95
      }
    ],
    "count": 5
  }
}
```

## Export

### Export to PDF
```
GET /api/v1/cases/:caseId/notion/pages/:pageId/export/pdf
```
Returns: `application/pdf`

### Export to Markdown
```
GET /api/v1/cases/:caseId/notion/pages/:pageId/export/markdown
```

### Export to HTML
```
GET /api/v1/cases/:caseId/notion/pages/:pageId/export/html
```

## Templates

### Get Templates
```
GET /api/v1/notion/templates?category=case_strategy
```

### Apply Template
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/apply-template
```

**Body:**
```json
{
  "templateId": "template-id"
}
```

### Save as Template
```
POST /api/v1/cases/:caseId/notion/pages/:pageId/save-as-template
```

**Body:**
```json
{
  "name": "My Template",
  "nameAr": "قالبي",
  "category": "case_strategy",
  "description": "Template description"
}
```

## Task Integration

### Link Task to Block
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/link-task
```

**Body:**
```json
{
  "taskId": "task-id"
}
```

### Unlink Task
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/unlink-task
```

### Create Task from Block
```
POST /api/v1/cases/:caseId/notion/blocks/:blockId/create-task
```

**Body:**
```json
{
  "title": "Task title",
  "dueDate": "2024-12-31",
  "assigneeId": "user-id",
  "priority": "high"
}
```

---

# CasePipeline API

Workflow management for legal cases through Saudi Arabian legal system stages.

## Valid Pipeline Stages by Category

```javascript
const VALID_STAGES = {
  labor: ['filing', 'friendly_settlement_1', 'friendly_settlement_2', 'labor_court', 'appeal', 'execution'],
  commercial: ['filing', 'mediation', 'commercial_court', 'appeal', 'supreme', 'execution'],
  civil: ['filing', 'reconciliation', 'general_court', 'appeal', 'supreme', 'execution'],
  family: ['filing', 'reconciliation_committee', 'family_court', 'appeal', 'supreme', 'execution'],
  criminal: ['investigation', 'prosecution', 'criminal_court', 'appeal', 'supreme', 'execution'],
  administrative: ['grievance', 'administrative_court', 'admin_appeal', 'supreme_admin', 'execution'],
  other: ['filing', 'first_hearing', 'ongoing_hearings', 'appeal', 'final']
}
```

## Pipeline Endpoints

### Get Cases for Pipeline View
```
GET /api/v1/cases/pipeline
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by case category |
| status | string | Filter by status (active, closed, etc.) |
| stage | string | Filter by current stage |
| lawyerId | string | Filter by assigned lawyer |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "_id": "case-id",
        "caseNumber": "2024-001",
        "title": "Labor Dispute",
        "category": "labor",
        "status": "active",
        "priority": "high",
        "currentStage": "labor_court",
        "stageEnteredAt": "2024-01-15T10:00:00Z",
        "plaintiffName": "أحمد محمد",
        "defendantName": "شركة النور",
        "court": "محكمة العمل بالرياض",
        "claimAmount": 150000,
        "nextHearing": "2024-02-01T09:00:00Z",
        "tasksCount": 5,
        "notionPagesCount": 3,
        "daysInCurrentStage": 15
      }
    ],
    "count": 25,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### Get Pipeline Statistics
```
GET /api/v1/cases/pipeline/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCases": 150,
    "activeCases": 85,
    "byCategory": {
      "labor": 45,
      "commercial": 30,
      "civil": 25,
      "family": 20,
      "criminal": 15,
      "administrative": 10,
      "other": 5
    },
    "byStage": {
      "filing": 20,
      "hearing": 35,
      "appeal": 15,
      "execution": 10
    },
    "avgDaysInStage": 21,
    "casesOverdue": 8,
    "successRate": 72
  }
}
```

### Get Valid Stages for Category
```
GET /api/v1/cases/pipeline/stages/:category
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "labor",
    "stages": [
      {
        "id": "filing",
        "name": "Filing",
        "nameAr": "تقديم الدعوى",
        "order": 1
      },
      {
        "id": "friendly_settlement_1",
        "name": "Friendly Settlement - First Session",
        "nameAr": "التسوية الودية - الجلسة الأولى",
        "order": 2,
        "isMandatory": true
      }
    ]
  }
}
```

### Move Case to Stage
```
PATCH /api/v1/cases/:caseId/stage
```

**Body:**
```json
{
  "newStage": "labor_court",
  "notes": "Settlement failed, proceeding to court"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "case": {
      "_id": "case-id",
      "currentStage": "labor_court",
      "stageEnteredAt": "2024-01-20T10:00:00Z",
      "stageHistory": [
        {
          "stage": "friendly_settlement_2",
          "enteredAt": "2024-01-10T10:00:00Z",
          "exitedAt": "2024-01-20T10:00:00Z",
          "notes": "Settlement failed"
        }
      ]
    }
  }
}
```

### End Case with Outcome
```
PATCH /api/v1/cases/:caseId/end
```

**Body:**
```json
{
  "outcome": "won",
  "endReason": "final_judgment",
  "finalAmount": 125000,
  "notes": "Full claim awarded by court",
  "endDate": "2024-02-15"
}
```

**Outcome Values:**
- `won` - Case won
- `lost` - Case lost
- `settled` - Settled out of court

**End Reason Values:**
- `final_judgment` - Final court judgment
- `settlement` - Amicable settlement
- `withdrawal` - Case withdrawn
- `dismissal` - Case dismissed
- `reconciliation` - Parties reconciled
- `execution_complete` - Enforcement completed
- `other` - Other reason

---

# Case API (Core CRUD)

## Endpoints

### List Cases
```
GET /api/v1/cases
```

### Get Single Case
```
GET /api/v1/cases/:id
```

### Create Case
```
POST /api/v1/cases
```

### Update Case
```
PATCH /api/v1/cases/:id
```

### Delete Case
```
DELETE /api/v1/cases/:id
```

### Get Case Statistics
```
GET /api/v1/cases/statistics
```

## Sub-resources

### Notes
- `POST /api/v1/cases/:id/note` - Add note
- `PATCH /api/v1/cases/:id/notes/:noteId` - Update note
- `DELETE /api/v1/cases/:id/notes/:noteId` - Delete note

### Hearings
- `POST /api/v1/cases/:id/hearing` - Add hearing
- `PATCH /api/v1/cases/:id/hearings/:hearingId` - Update hearing
- `DELETE /api/v1/cases/:id/hearings/:hearingId` - Delete hearing

### Claims
- `POST /api/v1/cases/:id/claim` - Add claim
- `PATCH /api/v1/cases/:id/claims/:claimId` - Update claim
- `DELETE /api/v1/cases/:id/claims/:claimId` - Delete claim

### Timeline Events
- `POST /api/v1/cases/:id/timeline` - Add event
- `PATCH /api/v1/cases/:id/timeline/:eventId` - Update event
- `DELETE /api/v1/cases/:id/timeline/:eventId` - Delete event

### Documents (S3)
- `POST /api/v1/cases/:id/documents/upload-url` - Get presigned upload URL
- `POST /api/v1/cases/:id/documents/confirm` - Confirm upload
- `GET /api/v1/cases/:id/documents/:docId/download` - Get download URL
- `DELETE /api/v1/cases/:id/documents/:docId` - Delete document

### Rich Documents (CKEditor)
- `POST /api/v1/cases/:id/rich-documents` - Create
- `GET /api/v1/cases/:id/rich-documents` - List all
- `GET /api/v1/cases/:id/rich-documents/:docId` - Get single
- `PATCH /api/v1/cases/:id/rich-documents/:docId` - Update
- `DELETE /api/v1/cases/:id/rich-documents/:docId` - Delete
- `GET /api/v1/cases/:id/rich-documents/:docId/versions` - Get versions
- `POST /api/v1/cases/:id/rich-documents/:docId/versions/:versionNumber/restore` - Restore version
- `GET /api/v1/cases/:id/rich-documents/:docId/export/pdf` - Export PDF
- `GET /api/v1/cases/:id/rich-documents/:docId/export/latex` - Export LaTeX
- `GET /api/v1/cases/:id/rich-documents/:docId/export/markdown` - Export Markdown

### Audit History
- `GET /api/v1/cases/:id/audit` - Get audit log

### Status & Progress
- `PATCH /api/v1/cases/:id/status` - Update status
- `PATCH /api/v1/cases/:id/outcome` - Update outcome
- `PATCH /api/v1/cases/:id/progress` - Update progress

---

# Error Responses

All endpoints return errors in this format:

```json
{
  "error": true,
  "message": "Error message in Arabic",
  "code": "ERROR_CODE",
  "requestId": "uuid-for-debugging",
  "errors": [
    { "field": "fieldName", "message": "Field-specific error" }
  ]
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden / Permission Denied |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

# Database View Types (for CaseNotion)

```typescript
type ViewType = 'table' | 'board' | 'timeline' | 'calendar' | 'gallery' | 'list' | 'chart'

type DataSourceType =
  | 'tasks' | 'documents' | 'events' | 'reminders' | 'custom'
  | 'cases' | 'contacts' | 'invoices' | 'expenses' | 'time_entries'
```
