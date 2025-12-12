# Case Pipeline Backend Implementation Guide

This document provides detailed backend implementation instructions for the **Case Pipeline** feature - enabling lawyers to track cases through Saudi court stages with accurate timelines from Najiz and official MOJ sources.

---

## Table of Contents
1. [Overview](#overview)
2. [**GitHub Repos to Study**](#github-repos-to-study)
3. [Saudi Court Pipeline Stages](#saudi-court-pipeline-stages)
4. [Schema Updates Required](#schema-updates-required)
5. [API Endpoints](#api-endpoints)
6. [Controller Implementation](#controller-implementation)
7. [Request/Response Examples](#requestresponse-examples)
8. [Critical Implementation Notes](#critical-implementation-notes)

---

## Overview

The Case Pipeline feature tracks cases through Saudi court stages:
- **Cases move through defined stages** (filing → settlement → court → appeal → execution)
- **Different pipelines for different case types** (labor, commercial, civil, criminal, family, administrative)
- **Track time in each stage** with alerts for overdue cases
- **Display case notes** on pipeline cards
- **Kanban board view** showing cases organized by stage columns

---

## GitHub Repos to Study

**For Kanban/Board patterns, study these repos:**

### 1. **ReactFlow** ⭐ (34k+ Stars) - BEST FOR BOARD LAYOUTS
- **Repo**: https://github.com/xyflow/xyflow
- **Why Study**: Production-ready node positioning and drag-drop
- **Key Concepts**:
  - Node positioning in columns
  - Drag-drop between columns
  - Viewport management

### 2. **react-beautiful-dnd** (33k+ Stars) - KANBAN DRAG-DROP
- **Repo**: https://github.com/atlassian/react-beautiful-dnd
- **Why Study**: Industry standard for Kanban boards
- **Key Concepts**:
  - Droppable columns (stages)
  - Draggable cards (cases)
  - Optimistic updates

### 3. **Trello Clone Examples**
- Search GitHub for "trello clone react" for Kanban implementations
- Key patterns: column-based layout, card ordering, drag-drop state management

---

## Saudi Court Pipeline Stages

### Research Sources (OFFICIAL)
- **hrsd.gov.sa** - Ministry of Human Resources (labor complaints)
- **najiz.sa** - Ministry of Justice electronic services
- **moj.gov.sa** - Ministry of Justice official site
- **bog.gov.sa** - Board of Grievances (administrative courts)

---

### 1. Labor Cases (قضايا عمالية)

**MANDATORY: Friendly settlement MUST be completed before court filing**

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `filing` | تقديم الدعوى | Filing | - | Via hrsd.gov.sa portal |
| `friendly_settlement_1` | التسوية الودية - الجلسة الأولى | Friendly Settlement 1 | 10 working days | **MANDATORY** - First hearing |
| `friendly_settlement_2` | التسوية الودية - الجلسة الثانية | Friendly Settlement 2 | 21 days total | **MANDATORY** - Must exhaust |
| `labor_court` | المحكمة العمالية | Labor Court | Hearing in 4 days | First instance |
| `appeal` | محكمة الاستئناف العمالية | Labor Appeals | 30 days to appeal | Review: 20 days (10 urgent) |
| `supreme` | المحكمة العليا | Supreme Court | - | Legal review only |
| `execution` | التنفيذ | Execution | - | Via Najiz enforcement |

**Key Timelines:**
- First settlement hearing: Within 10 working days of filing
- Total settlement period: 21 working days maximum
- Court hearing: Scheduled 4 days after filing (if settlement fails)
- Appeal deadline: 30 days from judgment
- Appeal review: 20 days (10 days for urgent matters)

---

### 2. Commercial Cases (قضايا تجارية)

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `filing` | رفع الدعوى | Filing | - | Via Najiz |
| `mediation` | الوساطة | Mediation | Optional | Via Taraadi platform |
| `commercial_court` | المحكمة التجارية | Commercial Court | 180 days target | First instance |
| `appeal` | محكمة الاستئناف التجارية | Commercial Appeal | 30 days | 3-judge panel |
| `supreme` | المحكمة العليا | Supreme Court | - | Cassation review |
| `execution` | التنفيذ | Execution | - | Enforcement court |

**Key Timelines:**
- Target first instance judgment: 180 days
- Urgent applications (injunctions): 3 business days
- Appeal deadline: 30 days

---

### 3. Civil Cases (قضايا مدنية)

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `filing` | رفع الدعوى | Filing | - | Via Najiz |
| `reconciliation` | مكتب المصالحة | Reconciliation | Optional | Court reconciliation office |
| `general_court` | المحكمة العامة | General Court | - | First instance |
| `appeal` | محكمة الاستئناف | Appeal Court | 30 days | 3-judge panel |
| `supreme` | المحكمة العليا | Supreme Court | - | Legal review |
| `execution` | التنفيذ | Execution | - | Enforcement |

---

### 4. Family Cases (قضايا أسرية)

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `filing` | رفع الدعوى | Filing | - | Via Najiz |
| `reconciliation_committee` | لجنة الإصلاح | Reconciliation Committee | - | Family counseling |
| `family_court` | محكمة الأحوال الشخصية | Family Court | - | Personal status court |
| `appeal` | محكمة الاستئناف | Appeal Court | 30 days | |
| `supreme` | المحكمة العليا | Supreme Court | - | |
| `execution` | التنفيذ | Execution | - | |

**Special Note:** Women can file in their location or defendant's location for custody/marital cases.

---

### 5. Criminal Cases (قضايا جنائية)

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `investigation` | التحقيق | Investigation | - | Bureau of Investigation |
| `prosecution` | النيابة العامة | Prosecution | - | Charging decision |
| `criminal_court` | المحكمة الجزائية | Criminal Court | - | 3-judge panel for serious crimes |
| `appeal` | محكمة الاستئناف الجزائية | Criminal Appeal | 30 days | 5-judge panel |
| `supreme` | المحكمة العليا | Supreme Court | - | Mandatory for death/hudud |
| `execution` | تنفيذ العقوبة | Sentence Execution | - | |

**Auto-Appeal:** Death, stoning, amputation sentences automatically go to Appeal Court.

---

### 6. Administrative Cases (قضايا إدارية)

| Stage ID | Arabic | English | Duration | Notes |
|----------|--------|---------|----------|-------|
| `grievance` | التظلم الإداري | Administrative Grievance | 60 days to file, 90 days response | **MANDATORY** |
| `administrative_court` | المحكمة الإدارية | Administrative Court | - | Board of Grievances |
| `admin_appeal` | محكمة الاستئناف الإدارية | Admin Appeal Court | 30 days | 3-judge panel |
| `supreme_admin` | المحكمة الإدارية العليا | High Administrative Court | - | Riyadh only |
| `execution` | التنفيذ | Execution | - | |

---

## Schema Updates Required

### 1. Case Model Updates

Add/update these fields in the Case model:

```javascript
// models/Case.js - ADD/UPDATE these fields

const caseSchema = new mongoose.Schema({
  // ... existing fields ...

  // Pipeline tracking
  currentStage: {
    type: String,
    enum: [
      'filing',
      'friendly_settlement_1',
      'friendly_settlement_2',
      'mediation',
      'reconciliation',
      'reconciliation_committee',
      'grievance',
      'investigation',
      'prosecution',
      'labor_court',
      'commercial_court',
      'general_court',
      'family_court',
      'criminal_court',
      'administrative_court',
      'appeal',
      'admin_appeal',
      'supreme',
      'supreme_admin',
      'execution',
      'first_hearing',
      'ongoing_hearings',
      'final'
    ],
    default: 'filing'
  },

  // Alias for backwards compatibility
  pipelineStage: {
    type: String,
    // Same enum as currentStage
  },

  // When case entered current stage
  stageEnteredAt: {
    type: Date,
    default: Date.now
  },

  // Stage history for audit trail
  stageHistory: [{
    stageId: String,
    enteredAt: Date,
    exitedAt: Date,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Case outcome
  outcome: {
    type: String,
    enum: ['ongoing', 'won', 'lost', 'settled'],
    default: 'ongoing'
  },

  // End case details
  endReason: {
    type: String,
    enum: [
      'final_judgment',
      'settlement',
      'withdrawal',
      'dismissal',
      'reconciliation',
      'execution_complete',
      'other'
    ]
  },
  endNotes: String,
  endDate: Date,
  finalAmount: Number, // Final awarded/settled amount

  // Notes array for case notes
  notes: [{
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],

  // ... existing fields ...
});

// Virtual for days in current stage
caseSchema.virtual('daysInCurrentStage').get(function() {
  if (!this.stageEnteredAt) return 0;
  const now = new Date();
  const entered = new Date(this.stageEnteredAt);
  const diffTime = Math.abs(now - entered);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for performance
caseSchema.index({ currentStage: 1, category: 1 });
caseSchema.index({ stageEnteredAt: 1 });
caseSchema.index({ outcome: 1 });
```

---

### 2. Case Notes Sub-Schema

Notes are stored as an array within the Case document:

```javascript
// Notes schema (embedded in Case)
const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 5000
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  // Optional: link note to a specific stage
  stageId: String,
  // Optional: attachments
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }]
}, { timestamps: true });
```

---

## API Endpoints

### Pipeline Stage Operations

```
PATCH /api/v1/cases/:caseId/stage
- Move case to a different stage
- Body: { stageId: string, notes?: string }

GET /api/v1/cases/pipeline
- Get cases grouped by stage for Kanban board
- Query params: category (case type), status (active/closed)

GET /api/v1/cases/pipeline/stats
- Get statistics for pipeline dashboard
- Returns: counts by stage, overdue cases, win rate
```

### Case Notes Operations

```
POST /api/v1/cases/:caseId/notes
- Add a note to a case
- Body: { text: string, isPrivate?: boolean }

GET /api/v1/cases/:caseId/notes
- Get all notes for a case
- Query params: limit, offset, sort

PUT /api/v1/cases/:caseId/notes/:noteId
- Update a note
- Body: { text: string }

DELETE /api/v1/cases/:caseId/notes/:noteId
- Delete a note
```

### End Case Operations

```
POST /api/v1/cases/:caseId/end
- End/close a case
- Body: { outcome, endReason, endNotes?, finalAmount? }
```

---

## Controller Implementation

### Move Case to Stage

```javascript
// controllers/caseController.js

exports.moveToStage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { stageId, notes } = req.body;

    // Get the case
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Record stage exit in history
    if (caseDoc.currentStage) {
      caseDoc.stageHistory.push({
        stageId: caseDoc.currentStage,
        enteredAt: caseDoc.stageEnteredAt,
        exitedAt: new Date(),
        notes: notes,
        updatedBy: req.user._id
      });
    }

    // Update to new stage
    caseDoc.currentStage = stageId;
    caseDoc.pipelineStage = stageId; // Sync alias
    caseDoc.stageEnteredAt = new Date();
    caseDoc.updatedAt = new Date();

    await caseDoc.save();

    res.json({
      success: true,
      data: caseDoc
    });
  } catch (error) {
    console.error('Error moving case to stage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move case to stage'
    });
  }
};
```

### Get Cases Grouped by Stage (for Kanban Board)

```javascript
exports.getCasesByStage = async (req, res) => {
  try {
    const { category, status = 'active' } = req.query;

    // Build query
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status === 'active') {
      query.status = { $nin: ['closed', 'completed', 'archived'] };
      query.outcome = { $nin: ['won', 'lost', 'settled'] };
    } else if (status === 'closed') {
      query.$or = [
        { status: { $in: ['closed', 'completed'] } },
        { outcome: { $in: ['won', 'lost', 'settled'] } }
      ];
    }

    // Get cases with latest note
    const cases = await Case.find(query)
      .populate('clientId', 'name phone')
      .select({
        title: 1,
        caseNumber: 1,
        category: 1,
        status: 1,
        priority: 1,
        plaintiffName: 1,
        defendantName: 1,
        'laborCaseDetails.plaintiff.name': 1,
        'laborCaseDetails.company.name': 1,
        court: 1,
        claimAmount: 1,
        currentStage: 1,
        pipelineStage: 1,
        stageEnteredAt: 1,
        nextHearing: 1,
        outcome: 1,
        notes: { $slice: -1 }, // Get only latest note
        updatedAt: 1,
        createdAt: 1
      })
      .sort({ updatedAt: -1 });

    // Group by stage
    const grouped = {};
    cases.forEach(caseDoc => {
      const stageId = caseDoc.currentStage || caseDoc.pipelineStage || 'filing';
      if (!grouped[stageId]) {
        grouped[stageId] = [];
      }

      // Calculate days in stage
      const daysInStage = caseDoc.stageEnteredAt
        ? Math.floor((new Date() - new Date(caseDoc.stageEnteredAt)) / (1000 * 60 * 60 * 24))
        : 0;

      grouped[stageId].push({
        ...caseDoc.toObject(),
        daysInStage,
        latestNote: caseDoc.notes?.[0]?.text || null
      });
    });

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Error getting cases by stage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cases'
    });
  }
};
```

### Add Note to Case

```javascript
exports.addNote = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { text, isPrivate = false, stageId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Add note to beginning of array (newest first)
    caseDoc.notes.unshift({
      text: text.trim(),
      date: new Date(),
      createdBy: req.user._id,
      isPrivate,
      stageId: stageId || caseDoc.currentStage
    });

    caseDoc.updatedAt = new Date();
    await caseDoc.save();

    res.json({
      success: true,
      data: caseDoc.notes[0]
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
};
```

### End Case

```javascript
exports.endCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { outcome, endReason, endNotes, finalAmount } = req.body;

    if (!outcome || !endReason) {
      return res.status(400).json({
        success: false,
        message: 'Outcome and end reason are required'
      });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Record final stage in history
    if (caseDoc.currentStage) {
      caseDoc.stageHistory.push({
        stageId: caseDoc.currentStage,
        enteredAt: caseDoc.stageEnteredAt,
        exitedAt: new Date(),
        notes: `Case ended: ${outcome}`,
        updatedBy: req.user._id
      });
    }

    // Update case
    caseDoc.status = 'closed';
    caseDoc.outcome = outcome;
    caseDoc.endReason = endReason;
    caseDoc.endNotes = endNotes;
    caseDoc.endDate = new Date();
    if (finalAmount !== undefined) {
      caseDoc.finalAmount = finalAmount;
    }
    caseDoc.updatedAt = new Date();

    await caseDoc.save();

    res.json({
      success: true,
      data: caseDoc
    });
  } catch (error) {
    console.error('Error ending case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end case'
    });
  }
};
```

### Get Pipeline Statistics

```javascript
exports.getPipelineStats = async (req, res) => {
  try {
    const { category } = req.query;

    const matchStage = {};
    if (category && category !== 'all') {
      matchStage.category = category;
    }

    const stats = await Case.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCases: { $sum: 1 },
          wonCases: {
            $sum: { $cond: [{ $eq: ['$outcome', 'won'] }, 1, 0] }
          },
          lostCases: {
            $sum: { $cond: [{ $eq: ['$outcome', 'lost'] }, 1, 0] }
          },
          settledCases: {
            $sum: { $cond: [{ $eq: ['$outcome', 'settled'] }, 1, 0] }
          },
          ongoingCases: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'closed'] },
                    { $ne: ['$status', 'completed'] },
                    { $nin: ['$outcome', ['won', 'lost', 'settled']] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalClaimAmount: { $sum: '$claimAmount' },
          criticalCases: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
          },
          highPriorityCases: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCases: 0,
      wonCases: 0,
      lostCases: 0,
      settledCases: 0,
      ongoingCases: 0,
      totalClaimAmount: 0,
      criticalCases: 0,
      highPriorityCases: 0
    };

    // Calculate win rate
    const completedCases = result.wonCases + result.lostCases + result.settledCases;
    const winRate = completedCases > 0
      ? ((result.wonCases + result.settledCases) / completedCases * 100).toFixed(0)
      : 0;

    res.json({
      success: true,
      data: {
        ...result,
        winRate: `${winRate}%`,
        urgentCases: result.criticalCases + result.highPriorityCases
      }
    });
  } catch (error) {
    console.error('Error getting pipeline stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};
```

---

## Request/Response Examples

### Move Case to Stage

**Request:**
```http
PATCH /api/v1/cases/64abc123def/stage
Content-Type: application/json
Authorization: Bearer <token>

{
  "stageId": "labor_court",
  "notes": "Settlement failed, proceeding to court"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123def",
    "title": "دعوى حقوق عمالية",
    "currentStage": "labor_court",
    "stageEnteredAt": "2025-12-12T10:30:00.000Z",
    "stageHistory": [
      {
        "stageId": "friendly_settlement_2",
        "enteredAt": "2025-11-20T08:00:00.000Z",
        "exitedAt": "2025-12-12T10:30:00.000Z",
        "notes": "Settlement failed, proceeding to court"
      }
    ]
  }
}
```

### Get Cases Grouped by Stage (Kanban Board)

**Request:**
```http
GET /api/v1/cases/pipeline?category=labor&status=active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filing": [
      {
        "_id": "64abc111",
        "title": "Case 1",
        "caseNumber": "1442525145",
        "currentStage": "filing",
        "daysInStage": 2,
        "latestNote": "تواصل مع الشركة للتأكد من المطلوب",
        "priority": "medium",
        "plaintiffName": "أحمد سعيد",
        "defendantName": "أملاك",
        "claimAmount": 50000
      }
    ],
    "friendly_settlement_1": [
      {
        "_id": "64abc222",
        "title": "Case 2",
        "daysInStage": 5,
        "latestNote": "الجلسة الأولى يوم الأحد"
      }
    ],
    "labor_court": [],
    "appeal": [],
    "execution": []
  }
}
```

### Add Note to Case

**Request:**
```http
POST /api/v1/cases/64abc123def/notes
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "تم التواصل مع المدعى عليه وتحديد موعد للجلسة",
  "isPrivate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64note123",
    "text": "تم التواصل مع المدعى عليه وتحديد موعد للجلسة",
    "date": "2025-12-12T10:30:00.000Z",
    "createdBy": "64user123",
    "isPrivate": false,
    "stageId": "friendly_settlement_1"
  }
}
```

---

## Critical Implementation Notes

### ⚠️ Always Return Notes with Cases

When fetching cases for the pipeline/board view, ALWAYS include the latest note:

```javascript
// CORRECT - Include latest note
const cases = await Case.find(query)
  .select({
    // ... other fields
    notes: { $slice: -1 } // Get only the latest note
  });

// Transform to include latestNote
const casesWithNotes = cases.map(c => ({
  ...c.toObject(),
  latestNote: c.notes?.[0]?.text || null
}));
```

### ⚠️ Always Update stageEnteredAt

When moving a case to a new stage, ALWAYS update `stageEnteredAt`:

```javascript
// CORRECT
caseDoc.currentStage = newStageId;
caseDoc.pipelineStage = newStageId; // Keep in sync
caseDoc.stageEnteredAt = new Date(); // CRITICAL!
```

### ⚠️ Sync currentStage and pipelineStage

The frontend may use either field. Always keep them in sync:

```javascript
// When updating stage
caseDoc.currentStage = stageId;
caseDoc.pipelineStage = stageId; // SYNC!

// When reading stage (handle both)
const stageId = caseDoc.currentStage || caseDoc.pipelineStage || 'filing';
```

### ⚠️ Days in Stage Calculation

Frontend expects `daysInStage` or calculates it from `stageEnteredAt`:

```javascript
// Option 1: Calculate on server
const daysInStage = caseDoc.stageEnteredAt
  ? Math.floor((Date.now() - new Date(caseDoc.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24))
  : 0;

// Option 2: Let frontend calculate from stageEnteredAt
// Just ensure stageEnteredAt is always returned
```

### ⚠️ Filter Active Cases Correctly

Active cases must exclude closed AND cases with final outcomes:

```javascript
// CORRECT filter for active cases
const activeCases = {
  status: { $nin: ['closed', 'completed', 'archived'] },
  outcome: { $nin: ['won', 'lost', 'settled'] }
};
```

### ⚠️ Notes Array Order

Notes should be stored newest first (unshift) so `notes[0]` is always the latest:

```javascript
// Add note to beginning (newest first)
caseDoc.notes.unshift({
  text,
  date: new Date(),
  createdBy: req.user._id
});

// Latest note is always notes[0]
const latestNote = caseDoc.notes[0]?.text;
```

---

## API Summary Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `PATCH /cases/:caseId/stage` | PATCH | Move case to new stage |
| `GET /cases/pipeline` | GET | Get cases grouped by stage (Kanban) |
| `GET /cases/pipeline/stats` | GET | Get pipeline statistics |
| `POST /cases/:caseId/notes` | POST | Add note to case |
| `GET /cases/:caseId/notes` | GET | Get case notes |
| `PUT /cases/:caseId/notes/:noteId` | PUT | Update note |
| `DELETE /cases/:caseId/notes/:noteId` | DELETE | Delete note |
| `POST /cases/:caseId/end` | POST | End/close case |

---

## Frontend Service Expectations

The frontend expects these methods from your API service:

```javascript
// casesService.js (frontend expectations)

// Get cases for Kanban board
getCasesByStage(category?: string, status?: string)
// Returns: { [stageId]: CaseCard[] }

// Move case to stage
moveToStage(caseId: string, stageId: string, notes?: string)
// Returns: Updated case

// Add note
addNote(caseId: string, text: string, isPrivate?: boolean)
// Returns: Created note

// End case
endCase(caseId: string, outcome: string, endReason: string, endNotes?: string, finalAmount?: number)
// Returns: Updated case
```

---

## Testing Checklist

After implementing, verify these scenarios work:

1. ✅ **Move case to stage** → `stageEnteredAt` updates, history recorded
2. ✅ **Get cases by stage** → Cases grouped correctly, `daysInStage` calculated
3. ✅ **Add note** → Note appears in case, `latestNote` shows on card
4. ✅ **End case** → Status changes to closed, outcome recorded
5. ✅ **Filter active cases** → Excludes closed AND final outcomes
6. ✅ **Get pipeline stats** → Correct counts, win rate calculated

---

## Questions?

Refer to the official sources:
- **hrsd.gov.sa** - Labor case procedures
- **najiz.sa** - MOJ electronic services
- **moj.gov.sa** - Ministry of Justice
- **bog.gov.sa** - Board of Grievances
