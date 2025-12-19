# Case Pipeline - Backend API Requirements

## ⚠️ CRITICAL: What the Frontend Needs

The Case Pipeline feature has TWO views:

1. **List View** (`/dashboard/cases/pipeline`) - Shows all cases with progress bars
2. **Detail View** (`/dashboard/cases/:caseId/pipeline`) - Shows single case pipeline

### What Endpoints Are Actually Being Called

The frontend currently uses these endpoints:

```
GET  /api/v1/cases              → List all cases (used by list view)
GET  /api/v1/cases/:id          → Get single case (used by detail view)
PATCH /api/v1/cases/:id         → Update case (for stage changes)
```

### Minimum Required Fields in Casefdsfs Response

```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "caseNumber": "1446/labor/001",
  "title": "دعوى مطالبة بمستحقات نهاية الخدمة",
  "category": "labor",              // REQUIRED: labor, commercial, civil, family, criminal, administrative
  "status": "active",               // REQUIRED: active, closed, completed, archived
  "priority": "high",               // Optional: low, medium, high, critical
  "outcome": "ongoing",             // Optional: ongoing, won, lost, settled

  "currentStage": "labor_court",    // REQUIRED: Stage ID (see valid stages below)
  "pipelineStage": "labor_court",   // ALIAS: Same as currentStage
  "stageEnteredAt": "2024-01-20T10:00:00Z",  // REQUIRED: When entered current stage

  "plaintiffName": "محمد أحمد",     // Optional but displayed
  "defendantName": "شركة ABC",      // Optional but displayed
  "court": "محكمة العمل بالرياض",   // Optional but displayed
  "claimAmount": 150000,            // Optional but displayed
  "nextHearing": "2024-02-15T09:00:00Z", // Optional but displayed

  "clientId": {                     // Optional
    "_id": "client123",
    "name": "محمد أحمد"
  },

  "tasksCount": 5,                  // Optional: linked tasks count
  "notionPagesCount": 3,            // Optional: linked notion pages count
  "eventsCount": 1,                 // Optional: linked events count
  "notes": [],                      // Optional: case notes array

  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-02-01T10:00:00Z"
}
```

---

## Overview

This document provides complete backend API specifications for:
1. **Case Pipeline** - Visual tracker for individual case progression through legal stages

### How Case Pipeline Works (Frontend)

The Case Pipeline view allows lawyers to:
1. **Select Case Type** (Labor, Commercial, Civil, Family, Criminal, Administrative)
2. **Select a Specific Case** from a dropdown filtered by type
3. **View the case's journey** through legal stages as a visual timeline
4. **Move the case** to the next/previous stage or click on any stage to jump to it
5. **End the case** with outcome (Won/Lost/Settled) and reason

The pipeline stages are specific to Saudi Arabian legal procedures:
- **Labor Cases**: Filing → Friendly Settlement (2 sessions) → Labor Court → Appeal → Execution
- **Commercial Cases**: Filing → Mediation → Commercial Court → Appeal → Supreme → Execution
- **Administrative Cases**: Grievance (mandatory) → Admin Court → Admin Appeal → High Admin Court → Execution

---

## 1. Database Schema Changes

### Case Model - New Fields Required

Add these fields to the existing Case model:

```javascript
// Case Schema (MongoDB/Mongoose)
const caseSchema = new Schema({
  // ... existing fields ...

  // ==================== NEW PIPELINE FIELDS ====================

  // Current stage in the pipeline (e.g., 'filing', 'friendly_settlement_1', 'labor_court')
  currentStage: {
    type: String,
    default: 'filing',
    index: true
  },

  // When the case entered the current stage
  stageEnteredAt: {
    type: Date,
    default: Date.now
  },

  // Stage history for tracking progression
  stageHistory: [{
    stage: String,
    enteredAt: Date,
    exitedAt: Date,
    notes: String,
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],

  // Case end details
  endDetails: {
    endDate: Date,
    endReason: {
      type: String,
      enum: ['final_judgment', 'settlement', 'withdrawal', 'dismissal', 'reconciliation', 'execution_complete', 'other']
    },
    finalAmount: Number,
    notes: String,
    endedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  // Parties (for display on pipeline cards)
  plaintiffName: String,
  defendantName: String,

  // Linked items counts (can be computed or stored)
  linkedCounts: {
    tasks: { type: Number, default: 0 },
    notionPages: { type: Number, default: 0 },
    reminders: { type: Number, default: 0 },
    events: { type: Number, default: 0 }
  }
});

// Indexes for pipeline queries
caseSchema.index({ category: 1, currentStage: 1 });
caseSchema.index({ category: 1, outcome: 1 });
caseSchema.index({ stageEnteredAt: 1 });
```

### Valid Stage IDs by Category

```javascript
const VALID_STAGES = {
  labor: ['filing', 'friendly_settlement_1', 'friendly_settlement_2', 'labor_court', 'appeal', 'execution'],
  commercial: ['filing', 'mediation', 'commercial_court', 'appeal', 'supreme', 'execution'],
  civil: ['filing', 'reconciliation', 'general_court', 'appeal', 'supreme', 'execution'],
  family: ['filing', 'reconciliation_committee', 'family_court', 'appeal', 'supreme', 'execution'],
  criminal: ['investigation', 'prosecution', 'criminal_court', 'appeal', 'supreme', 'execution'],
  administrative: ['grievance', 'administrative_court', 'admin_appeal', 'supreme_admin', 'execution'],
  other: ['filing', 'first_hearing', 'ongoing_hearings', 'appeal', 'final']
};
```

---

## 2. API Endpoints

### 2.1 Get Cases for Pipeline View

**GET** `/api/v1/cases/pipeline`

Returns cases formatted for pipeline kanban view with linked item counts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by case type (labor, commercial, civil, etc.) |
| outcome | string | Filter by outcome (ongoing, won, lost, settled) |
| priority | string | Filter by priority (low, medium, high, critical) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 100) |

**Response:**
```json
{
  "error": false,
  "cases": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "caseNumber": "1446/labor/001",
      "title": "دعوى مطالبة بمستحقات نهاية الخدمة",
      "category": "labor",
      "status": "active",
      "priority": "high",

      "plaintiffName": "محمد أحمد",
      "defendantName": "شركة ABC المحدودة",
      "clientId": {
        "_id": "client123",
        "name": "محمد أحمد",
        "phone": "+966501234567"
      },

      "court": "محكمة العمل بالرياض",
      "judge": "القاضي عبدالله",
      "nextHearing": "2024-02-15T09:00:00Z",

      "claimAmount": 150000,
      "expectedWinAmount": 120000,

      "currentStage": "labor_court",
      "stageEnteredAt": "2024-01-20T10:00:00Z",
      "outcome": "ongoing",

      "tasksCount": 5,
      "notionPagesCount": 3,
      "remindersCount": 2,
      "eventsCount": 1,
      "notesCount": 8,

      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-02-01T10:00:00Z",
      "daysInCurrentStage": 15,

      "latestNote": {
        "text": "تم تقديم المذكرة الختامية",
        "date": "2024-02-01T10:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 45,
    "pages": 1
  },
  "statistics": {
    "total": 45,
    "byStage": {
      "filing": 5,
      "friendly_settlement_1": 8,
      "friendly_settlement_2": 4,
      "labor_court": 15,
      "appeal": 10,
      "execution": 3
    },
    "byOutcome": {
      "ongoing": 32,
      "won": 8,
      "lost": 2,
      "settled": 3
    }
  }
}
```

### 2.2 Move Case to Stage

**PATCH** `/api/v1/cases/:id/stage`

Move a case to a different stage in the pipeline.

**Request Body:**
```json
{
  "newStage": "labor_court",
  "notes": "انتهت مرحلة التسوية الودية بدون اتفاق"
}
```

**Validation Rules:**
1. `newStage` must be valid for the case's category
2. Record the stage change in `stageHistory`
3. Update `stageEnteredAt` to current timestamp
4. Create an audit log entry

**Response:**
```json
{
  "error": false,
  "message": "تم نقل القضية إلى المرحلة الجديدة",
  "case": {
    "_id": "...",
    "currentStage": "labor_court",
    "stageEnteredAt": "2024-02-10T14:30:00Z",
    "stageHistory": [...]
  }
}
```

### 2.3 End Case

**PATCH** `/api/v1/cases/:id/end`

End a case with final outcome.

**Request Body:**
```json
{
  "outcome": "won",
  "endReason": "final_judgment",
  "finalAmount": 125000,
  "notes": "صدر الحكم لصالح الموكل",
  "endDate": "2024-02-10"
}
```

**Validation Rules:**
1. `outcome` must be one of: 'won', 'lost', 'settled'
2. `endReason` must be valid enum value
3. `finalAmount` should be positive number if provided
4. Update case `status` to 'closed' or 'completed'
5. Create audit log entry

**Response:**
```json
{
  "error": false,
  "message": "تم إنهاء القضية بنجاح",
  "case": {
    "_id": "...",
    "status": "closed",
    "outcome": "won",
    "endDetails": {
      "endDate": "2024-02-10T00:00:00Z",
      "endReason": "final_judgment",
      "finalAmount": 125000,
      "notes": "صدر الحكم لصالح الموكل"
    }
  }
}
```

### 2.4 Get Pipeline Statistics

**GET** `/api/v1/cases/pipeline/statistics`

Get aggregated statistics for pipeline view.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by case type |
| dateFrom | string | Start date filter |
| dateTo | string | End date filter |

**Response:**
```json
{
  "error": false,
  "statistics": {
    "totalCases": 150,
    "activeCases": 120,
    "wonCases": 18,
    "lostCases": 5,
    "settledCases": 7,

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
      "labor": {
        "filing": 5,
        "friendly_settlement_1": 8,
        "friendly_settlement_2": 4,
        "labor_court": 15,
        "appeal": 10,
        "execution": 3
      }
    },

    "avgDaysInStage": {
      "labor": {
        "filing": 5,
        "friendly_settlement_1": 7,
        "friendly_settlement_2": 10,
        "labor_court": 45,
        "appeal": 30,
        "execution": 15
      }
    },

    "totalClaimAmount": 5000000,
    "totalWonAmount": 2500000,
    "successRate": 0.78
  }
}
```

---

## 3. Case Notion API Endpoints

These endpoints support the case brainstorming/documentation feature.

### 3.1 Get Notion Pages for Case

**GET** `/api/v1/cases/:caseId/notion`

**Response:**
```json
{
  "error": false,
  "pages": [
    {
      "_id": "page123",
      "caseId": "case456",
      "title": "استراتيجية الدفاع",
      "type": "strategy",
      "content": [...],
      "isFavorite": true,
      "isPinned": false,
      "isArchived": false,
      "createdBy": { "_id": "...", "name": "..." },
      "lastEditedBy": { "_id": "...", "name": "..." },
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-02-01T10:00:00Z"
    }
  ],
  "total": 5
}
```

### 3.2 Create Notion Page

**POST** `/api/v1/cases/:caseId/notion`

**Request Body:**
```json
{
  "title": "استراتيجية الدفاع",
  "type": "strategy",
  "content": [
    {
      "type": "heading_1",
      "content": "النقاط الرئيسية"
    },
    {
      "type": "bulleted_list",
      "content": "النقطة الأولى"
    }
  ]
}
```

**Page Types:**
- `general` - General Notes
- `strategy` - Case Strategy
- `timeline` - Timeline
- `evidence` - Evidence
- `arguments` - Legal Arguments
- `research` - Legal Research
- `meeting_notes` - Meeting Notes
- `correspondence` - Correspondence
- `witnesses` - Witnesses
- `discovery` - Discovery
- `pleadings` - Pleadings
- `settlement` - Settlement
- `brainstorm` - Brainstorm

### 3.3 Update Notion Page

**PATCH** `/api/v1/cases/:caseId/notion/:pageId`

**Request Body:**
```json
{
  "title": "استراتيجية الدفاع المحدثة",
  "content": [...],
  "isFavorite": true,
  "isPinned": true
}
```

### 3.4 Delete/Archive Notion Page

**DELETE** `/api/v1/cases/:caseId/notion/:pageId`

Or to archive:

**PATCH** `/api/v1/cases/:caseId/notion/:pageId`
```json
{
  "isArchived": true
}
```

---

## 4. Linked Items Aggregation

The frontend displays counts of items linked to each case. You can either:

### Option A: Compute on-the-fly (simpler)

```javascript
// In get cases pipeline endpoint
const getCasesForPipeline = async (filters) => {
  const cases = await Case.find(filters).lean();

  // Get linked counts for each case
  const casesWithCounts = await Promise.all(cases.map(async (c) => {
    const [tasksCount, remindersCount, eventsCount, notionPagesCount] = await Promise.all([
      Task.countDocuments({ caseId: c._id }),
      Reminder.countDocuments({ caseId: c._id }),
      Event.countDocuments({ caseId: c._id }),
      NotionPage.countDocuments({ caseId: c._id })
    ]);

    return {
      ...c,
      tasksCount,
      remindersCount,
      eventsCount,
      notionPagesCount,
      notesCount: c.notes?.length || 0,
      daysInCurrentStage: Math.floor((Date.now() - new Date(c.stageEnteredAt)) / (1000 * 60 * 60 * 24)),
      latestNote: c.notes?.length > 0 ? c.notes[c.notes.length - 1] : null
    };
  }));

  return casesWithCounts;
};
```

### Option B: Store counts (better performance)

Update counts when items are created/deleted:

```javascript
// When creating a task linked to a case
await Case.findByIdAndUpdate(caseId, {
  $inc: { 'linkedCounts.tasks': 1 }
});

// When deleting a task
await Case.findByIdAndUpdate(caseId, {
  $inc: { 'linkedCounts.tasks': -1 }
});
```

---

## 5. Permissions

Ensure proper RBAC checks for:

| Action | Required Permission |
|--------|-------------------|
| View pipeline | `cases:read` |
| Move case stage | `cases:update` |
| End case | `cases:update` |
| View notion pages | `cases:read` |
| Create notion page | `cases:update` |
| Edit notion page | `cases:update` |
| Delete notion page | `cases:delete` |

---

## 6. Error Responses

Use consistent error format:

```json
{
  "error": true,
  "message": "Invalid stage for case category",
  "code": "INVALID_STAGE",
  "details": {
    "category": "labor",
    "requestedStage": "administrative_court",
    "validStages": ["filing", "friendly_settlement_1", "friendly_settlement_2", "labor_court", "appeal", "execution"]
  }
}
```

**Common Error Codes:**
- `CASE_NOT_FOUND` - Case with given ID doesn't exist
- `INVALID_STAGE` - Stage is not valid for case category
- `CASE_ALREADY_ENDED` - Cannot modify ended case
- `UNAUTHORIZED` - User lacks permission
- `VALIDATION_ERROR` - Request body validation failed

---

## 7. Frontend Service Updates Needed

The frontend `casesService.ts` needs these methods:

```typescript
// In src/services/casesService.ts

// Get cases for pipeline view
getCasesForPipeline: async (filters?: PipelineFilters): Promise<PipelineResponse> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.outcome) params.append('outcome', filters.outcome);
  if (filters?.priority) params.append('priority', filters.priority);

  const url = `/cases/pipeline${params.toString() ? `?${params}` : ''}`;
  const response = await apiClient.get<PipelineResponse>(url);
  return response.data;
};

// Move case to new stage
moveCaseToStage: async (caseId: string, data: MoveCaseToStageData): Promise<Case> => {
  const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/stage`, data);
  return response.data.case;
};

// End case
endCase: async (caseId: string, data: EndCaseData): Promise<Case> => {
  const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/end`, data);
  return response.data.case;
};

// Get pipeline statistics
getPipelineStatistics: async (filters?: StatisticsFilters): Promise<PipelineStatistics> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);

  const response = await apiClient.get<StatisticsResponse>(`/cases/pipeline/statistics?${params}`);
  return response.data.statistics;
};
```

---

## 8. Testing Checklist

- [ ] Create case with default stage 'filing'
- [ ] Move case through all valid stages for each category
- [ ] Verify stage history is recorded
- [ ] Test ending case with each outcome type
- [ ] Verify linked item counts are accurate
- [ ] Test filtering by category, outcome, priority
- [ ] Verify statistics aggregation
- [ ] Test permission restrictions
- [ ] Test Arabic content in all fields

---

## 9. Saudi Legal Pipeline Reference

### Labor Cases (قضايا عمالية)
1. **Filing (تقديم الدعوى)** - Via MHRSD portal
2. **Friendly Settlement 1 (التسوية الودية - الجلسة الأولى)** - MANDATORY
3. **Friendly Settlement 2 (التسوية الودية - الجلسة الثانية)** - Within 21 days
4. **Labor Court (المحكمة العمالية)** - 7 courts + 27 circuits
5. **Appeal (محكمة الاستئناف العمالية)** - Within 30 days
6. **Execution (التنفيذ)** - Via Najiz

### Commercial Cases (قضايا تجارية)
1. **Filing (رفع الدعوى)** - Via Najiz
2. **Mediation (الوساطة)** - Optional via Taraadi
3. **Commercial Court (المحكمة التجارية)** - Riyadh, Jeddah, Dammam
4. **Appeal (محكمة الاستئناف التجارية)** - Within 30 days
5. **Supreme Court (المحكمة العليا)** - Cassation review
6. **Execution (التنفيذ)** - Enforcement court

### Civil Cases (قضايا مدنية)
1. **Filing (رفع الدعوى)** - Via Najiz
2. **Reconciliation (مكتب المصالحة)** - Optional
3. **General Court (المحكمة العامة)** - First instance
4. **Appeal (محكمة الاستئناف)** - Within 30 days
5. **Supreme Court (المحكمة العليا)** - Final review
6. **Execution (التنفيذ)** - Enforcement

### Family Cases (قضايا أسرية)
1. **Filing (رفع الدعوى)** - Via Najiz
2. **Reconciliation Committee (لجنة الإصلاح)** - Family reconciliation
3. **Family Court (محكمة الأحوال الشخصية)** - Personal status
4. **Appeal (محكمة الاستئناف)** - Within 30 days
5. **Supreme Court (المحكمة العليا)** - Final review
6. **Execution (التنفيذ)** - Enforcement

### Criminal Cases (قضايا جنائية)
1. **Investigation (التحقيق)** - Bureau of Investigation
2. **Prosecution (النيابة العامة)** - Charging decision
3. **Criminal Court (المحكمة الجزائية)** - 3-judge panel
4. **Appeal (محكمة الاستئناف الجزائية)** - 5-judge panel
5. **Supreme Court (المحكمة العليا)** - Required for death/hudud
6. **Execution (تنفيذ العقوبة)** - Sentence enforcement

### Administrative Cases (قضايا إدارية)
1. **Grievance (التظلم الإداري)** - MANDATORY (60 days to file)
2. **Administrative Court (المحكمة الإدارية)** - Board of Grievances
3. **Admin Appeal (محكمة الاستئناف الإدارية)** - Within 30 days
4. **High Admin Court (المحكمة الإدارية العليا)** - Final
5. **Execution (التنفيذ)** - Enforcement

---

## 10. Frontend Integration Details

### How the Frontend Moves Case Stage

When user clicks a stage or "Next Stage" button, the frontend sends:

**Request:**
```
PATCH /api/v1/cases/:caseId
```

**Request Body:**
```json
{
  "currentStage": "labor_court",
  "pipelineStage": "labor_court",
  "stageEnteredAt": "2024-02-10T14:30:00.000Z"
}
```

**Backend Implementation:**
```javascript
// In caseController.js
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If stage is being changed, record in history
    if (updateData.currentStage || updateData.pipelineStage) {
      const currentCase = await Case.findById(id);

      if (currentCase && currentCase.currentStage !== (updateData.currentStage || updateData.pipelineStage)) {
        // Add to stage history
        if (!currentCase.stageHistory) currentCase.stageHistory = [];
        currentCase.stageHistory.push({
          stage: currentCase.currentStage,
          enteredAt: currentCase.stageEnteredAt,
          exitedAt: new Date(),
          changedBy: req.user._id
        });

        // Set new stage timestamp
        updateData.stageEnteredAt = new Date();

        // Ensure both fields are synced
        if (updateData.currentStage) updateData.pipelineStage = updateData.currentStage;
        if (updateData.pipelineStage) updateData.currentStage = updateData.pipelineStage;

        updateData.stageHistory = currentCase.stageHistory;
      }
    }

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name phone');

    res.json({ error: false, case: updatedCase });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### How the Frontend Ends a Case

When user clicks "End Case" and fills the dialog:

**Request:**
```
PATCH /api/v1/cases/:caseId
```

**Request Body:**
```json
{
  "status": "closed",
  "outcome": "won",
  "endReason": "final_judgment",
  "endNotes": "صدر الحكم لصالح الموكل",
  "finalAmount": 125000,
  "endDate": "2024-02-10T00:00:00.000Z"
}
```

**Expected Response:**
```json
{
  "error": false,
  "case": {
    "_id": "...",
    "status": "closed",
    "outcome": "won",
    "endReason": "final_judgment",
    "endNotes": "صدر الحكم لصالح الموكل",
    "finalAmount": 125000,
    "endDate": "2024-02-10T00:00:00.000Z",
    // ... other fields
  }
}
```

---

## 11. Case Model Schema (Complete)

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const caseSchema = new Schema({
  // Basic Info
  caseNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleAr: String,
  description: String,

  // Category & Status
  category: {
    type: String,
    enum: ['labor', 'commercial', 'civil', 'family', 'criminal', 'administrative', 'other'],
    default: 'other',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'on_hold', 'closed', 'completed', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  outcome: {
    type: String,
    enum: ['ongoing', 'won', 'lost', 'settled'],
    default: 'ongoing'
  },

  // ============ PIPELINE FIELDS (REQUIRED) ============
  currentStage: {
    type: String,
    default: 'filing'
  },
  pipelineStage: {  // Alias for currentStage
    type: String,
    default: 'filing'
  },
  stageEnteredAt: {
    type: Date,
    default: Date.now
  },
  stageHistory: [{
    stage: String,
    enteredAt: Date,
    exitedAt: Date,
    notes: String,
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],

  // Case End Details
  endDate: Date,
  endReason: {
    type: String,
    enum: ['final_judgment', 'settlement', 'withdrawal', 'dismissal', 'reconciliation', 'execution_complete', 'other']
  },
  endNotes: String,
  finalAmount: Number,

  // Parties
  plaintiffName: String,
  plaintiffNameAr: String,
  defendantName: String,
  defendantNameAr: String,

  // Court Info
  court: String,
  courtAr: String,
  judge: String,
  nextHearing: Date,

  // Financial
  claimAmount: { type: Number, default: 0 },
  expectedWinAmount: Number,

  // Relations
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  lawyerId: { type: Schema.Types.ObjectId, ref: 'User' },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

  // Linked Items Counts (computed or stored)
  tasksCount: { type: Number, default: 0 },
  notionPagesCount: { type: Number, default: 0 },
  eventsCount: { type: Number, default: 0 },
  remindersCount: { type: Number, default: 0 },

  // Notes
  notes: [{
    text: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Labor Case Specific
  laborCaseDetails: {
    plaintiff: {
      name: String,
      idNumber: String,
      phone: String
    },
    company: {
      name: String,
      crNumber: String
    }
  }

}, {
  timestamps: true
});

// Indexes
caseSchema.index({ category: 1, currentStage: 1 });
caseSchema.index({ firmId: 1, status: 1 });
caseSchema.index({ lawyerId: 1, status: 1 });
caseSchema.index({ createdBy: 1 });

// Pre-save: sync pipelineStage with currentStage
caseSchema.pre('save', function(next) {
  if (this.currentStage) this.pipelineStage = this.currentStage;
  if (this.pipelineStage) this.currentStage = this.pipelineStage;
  next();
});

module.exports = mongoose.model('Case', caseSchema);
```

---

## 12. Quick Start Checklist for Backend Team

### Step 1: Update Case Model
Add these fields if not present:
- [ ] `currentStage` (String, default: 'filing')
- [ ] `pipelineStage` (String, default: 'filing')
- [ ] `stageEnteredAt` (Date, default: Date.now)
- [ ] `stageHistory` (Array)
- [ ] `outcome` (String, enum: ongoing/won/lost/settled)
- [ ] `endDate` (Date)
- [ ] `endReason` (String)
- [ ] `endNotes` (String)
- [ ] `finalAmount` (Number)

### Step 2: Verify GET /api/v1/cases Returns Required Fields
Make sure each case in the response includes:
- [ ] `category`
- [ ] `status`
- [ ] `currentStage` OR `pipelineStage`
- [ ] `stageEnteredAt`

### Step 3: Verify PATCH /api/v1/cases/:id Accepts These Fields
- [ ] `currentStage`
- [ ] `pipelineStage`
- [ ] `stageEnteredAt`
- [ ] `status`
- [ ] `outcome`
- [ ] `endReason`
- [ ] `endNotes`
- [ ] `finalAmount`
- [ ] `endDate`

### Step 4: Test the Pipeline
1. Create a case with `category: 'labor'`
2. Verify `currentStage` defaults to `'filing'`
3. PATCH to change `currentStage` to `'labor_court'`
4. Verify response includes updated fields
5. PATCH to end case with `status: 'closed'`, `outcome: 'won'`

---

## Valid Stage IDs by Category

**These are the ONLY valid stage IDs for each category:**

| Category | Valid Stage IDs |
|----------|-----------------|
| `labor` | `filing`, `friendly_settlement_1`, `friendly_settlement_2`, `labor_court`, `appeal`, `execution` |
| `commercial` | `filing`, `mediation`, `commercial_court`, `appeal`, `supreme`, `execution` |
| `civil` | `filing`, `reconciliation`, `general_court`, `appeal`, `supreme`, `execution` |
| `family` | `filing`, `reconciliation_committee`, `family_court`, `appeal`, `supreme`, `execution` |
| `criminal` | `investigation`, `prosecution`, `criminal_court`, `appeal`, `supreme`, `execution` |
| `administrative` | `grievance`, `administrative_court`, `admin_appeal`, `supreme_admin`, `execution` |
| `other` | `filing`, `first_hearing`, `ongoing_hearings`, `appeal`, `final` |

---

## Contact

For questions about this API specification, contact the frontend team.
