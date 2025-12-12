# CaseNotion Backend Integration Guide

This document provides detailed backend implementation instructions for the CaseNotion (Case Brainstorm) feature - a Notion-like workspace for legal case documentation and strategy planning.

## ⚠️ CRITICAL: 403 Forbidden Error Troubleshooting

If the frontend is receiving **403 Forbidden** errors when accessing CaseNotion endpoints, check the following:

### Common 403 Error Causes

1. **Missing Authorization Header**
   - Frontend sends: `Authorization: Bearer <token>`
   - Verify token is being passed correctly

2. **Case Access Permission Check**
   - User must have access to the case itself before accessing CaseNotion
   - Check if user belongs to the same `firmId` as the case
   - Check if user is assigned to the case (lawyerId, teamMembers, or createdBy)

3. **Route Not Registered**
   - Ensure all CaseNotion routes are registered in Express
   - Routes must be at `/api/v1/cases/:caseId/notion/...`

4. **Middleware Order Issue**
   - `canAccessCase` middleware must run BEFORE route handlers
   - Check middleware chain order

### Quick Fix Checklist

```javascript
// 1. Ensure route is registered
app.use('/api/v1', require('./routes/caseNotion'));

// 2. Check auth middleware
router.get('/cases/:caseId/notion/pages', auth, canAccessCase, controller.listPages);

// 3. Check canAccessCase middleware allows admin override
exports.canAccessCase = async (req, res, next) => {
  const { caseId } = req.params;

  // Admin always has access
  if (req.user.role === 'admin') {
    return next();
  }

  const caseDoc = await Case.findOne({
    _id: caseId,
    firmId: req.user.firmId, // IMPORTANT: Same firm check
    $or: [
      { lawyerId: req.user._id },
      { teamMembers: req.user._id },
      { createdBy: req.user._id }
    ]
  });

  if (!caseDoc) {
    return res.status(403).json({
      error: true,
      message: 'Access denied to this case'
    });
  }

  next();
};
```

---

## Table of Contents
1. [Overview](#overview)
2. [COMPLETE API Endpoints Reference](#complete-api-endpoints-reference)
3. [List Page API](#list-page-api)
4. [Database Schemas](#database-schemas)
5. [API Endpoints Implementation](#api-endpoints-implementation)
6. [Real-time Features](#real-time-features)
7. [Security Considerations](#security-considerations)

---

## COMPLETE API Endpoints Reference

**IMPORTANT:** The frontend uses `/api/v1/` prefix. All endpoints below must be prefixed with `/api/v1`.

### Page Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/pages` | List all pages for a case |
| `GET` | `/cases/:caseId/notion/pages/:pageId` | Get single page with blocks |
| `POST` | `/cases/:caseId/notion/pages` | Create new page |
| `PATCH` | `/cases/:caseId/notion/pages/:pageId` | Update page |
| `DELETE` | `/cases/:caseId/notion/pages/:pageId` | Delete page (soft delete) |
| `POST` | `/cases/:caseId/notion/pages/:pageId/archive` | Archive page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/restore` | Restore archived page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/duplicate` | Duplicate page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/favorite` | Toggle favorite status |
| `POST` | `/cases/:caseId/notion/pages/merge` | Merge multiple pages |

### Block Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/pages/:pageId/blocks` | Get blocks for a page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/blocks` | Create new block |
| `PATCH` | `/cases/:caseId/notion/blocks/:blockId` | Update block |
| `DELETE` | `/cases/:caseId/notion/blocks/:blockId` | Delete block |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/move` | Move block |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/lock` | Lock block for editing |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/unlock` | Unlock block |

### Synced Blocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cases/:caseId/notion/synced-blocks` | Create synced block |
| `GET` | `/cases/:caseId/notion/synced-blocks/:blockId` | Get synced block info |
| `POST` | `/cases/:caseId/notion/synced-blocks/:blockId/unsync` | Unsync block |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/blocks/:blockId/comments` | Get block comments |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/comments` | Add comment |
| `POST` | `/cases/:caseId/notion/comments/:commentId/resolve` | Resolve comment |
| `DELETE` | `/cases/:caseId/notion/comments/:commentId` | Delete comment |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notion/templates` | Get available templates |
| `POST` | `/cases/:caseId/notion/pages/:pageId/apply-template` | Apply template to page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/save-as-template` | Save page as template |

### Activity & Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/pages/:pageId/activity` | Get page activity history |
| `GET` | `/cases/:caseId/notion/search?q=query` | Search within case's pages |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/pages/:pageId/export/pdf` | Export page as PDF |
| `GET` | `/cases/:caseId/notion/pages/:pageId/export/markdown` | Export as Markdown |
| `GET` | `/cases/:caseId/notion/pages/:pageId/export/html` | Export as HTML |

### Task Linking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cases/:caseId/notion/blocks/:blockId/link-task` | Link task to block |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/unlink-task` | Unlink task from block |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/create-task` | Create task from block |

---

## Overview

CaseNotion provides lawyers with a wiki-style documentation system for cases, featuring:
- Block-based editing (similar to Notion)
- Wiki-style pages with backlinks
- Legal-specific blocks (party statements, evidence, citations)
- Synced blocks across pages
- Comments and collaboration
- Templates for common case documentation
- Export to PDF/Markdown

---

## List Page API

The CaseNotion List Page (`/dashboard/notion`) shows all cases with their notion pages count. This requires an additional API endpoint and modification to the Cases API.

### 1. Add notionPagesCount to Case Model

```javascript
// In Case model or as virtual field
// Option 1: Virtual field (computed on-the-fly)
caseSchema.virtual('notionPagesCount', {
  ref: 'CaseNotionPage',
  localField: '_id',
  foreignField: 'caseId',
  count: true,
  match: { deletedAt: null, archivedAt: null }
});

// Make sure virtuals are included in JSON
caseSchema.set('toJSON', { virtuals: true });
caseSchema.set('toObject', { virtuals: true });
```

### 2. Update Cases List API

```javascript
// controllers/casesController.js
exports.listCases = async (req, res) => {
  try {
    const { search, status, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;

    const query = {
      firmId: req.user.firmId,
      deletedAt: null
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const cases = await Case.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('clientId', 'name')
      .populate('assignedTo', 'firstName lastName')
      .lean();

    // Get notion pages count for each case
    const caseIds = cases.map(c => c._id);
    const notionCounts = await CaseNotionPage.aggregate([
      {
        $match: {
          caseId: { $in: caseIds },
          deletedAt: null,
          archivedAt: null
        }
      },
      {
        $group: {
          _id: '$caseId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Map counts to cases
    const countsMap = {};
    notionCounts.forEach(n => {
      countsMap[n._id.toString()] = n.count;
    });

    const casesWithNotionCount = cases.map(c => ({
      ...c,
      notionPagesCount: countsMap[c._id.toString()] || 0
    }));

    const total = await Case.countDocuments(query);

    res.json({
      success: true,
      data: {
        cases: casesWithNotionCount,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### 3. Alternative: Dedicated Endpoint for CaseNotion List

```javascript
// routes/caseNotion.js
// Add new route for listing all cases with notion stats
router.get('/notion/cases', auth, caseNotionController.listCasesWithNotion);

// controllers/caseNotionController.js
exports.listCasesWithNotion = async (req, res) => {
  try {
    const { search, status, sortBy = 'updatedAt', page = 1, limit = 20 } = req.query;

    const matchStage = {
      firmId: new mongoose.Types.ObjectId(req.user.firmId),
      deletedAt: null
    };

    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      matchStage.status = status;
    }

    const sortStage = {};
    sortStage[sortBy] = sortBy === 'title' ? 1 : -1;

    const cases = await Case.aggregate([
      { $match: matchStage },
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'casenotionpages',
          let: { caseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$caseId', '$$caseId'] },
                deletedAt: null,
                archivedAt: null
              }
            },
            { $count: 'count' }
          ],
          as: 'notionStats'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          caseNumber: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          'clientId._id': '$client._id',
          'clientId.name': '$client.name',
          notionPagesCount: {
            $ifNull: [{ $arrayElemAt: ['$notionStats.count', 0] }, 0]
          }
        }
      }
    ]);

    const total = await Case.countDocuments(matchStage);

    res.json({
      success: true,
      data: {
        cases,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### 4. Frontend Service Update

```typescript
// services/caseNotionService.ts - Add this method
export const listCasesWithNotion = async (params?: {
  search?: string
  status?: string
  sortBy?: string
  page?: number
  limit?: number
}): Promise<{
  cases: Array<{
    _id: string
    title: string
    caseNumber: string
    status: string
    clientId: { _id: string; name: string }
    notionPagesCount: number
    createdAt: string
    updatedAt: string
  }>
  total: number
  page: number
  totalPages: number
}> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())

  const response = await apiClient.get(`/notion/cases?${queryParams}`)
  return response.data.data
}
```

### 5. React Query Hook

```typescript
// hooks/useCaseNotion.ts - Add this hook
export const useCasesWithNotion = (params?: {
  search?: string
  status?: string
  sortBy?: string
  page?: number
  limit?: number
}) => {
  return useQuery({
    queryKey: caseNotionKeys.casesWithNotion(params),
    queryFn: () => caseNotionService.listCasesWithNotion(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Add to query keys
export const caseNotionKeys = {
  // ... existing keys
  casesWithNotion: (params?: object) => ['caseNotion', 'cases', params] as const,
}
```

---

## Database Schemas

### 1. CaseNotionPage Schema

```javascript
// models/CaseNotionPage.js
const mongoose = require('mongoose');

const pageIconSchema = new mongoose.Schema({
  type: { type: String, enum: ['emoji', 'file', 'external'] },
  emoji: String,
  url: String
}, { _id: false });

const pageCoverSchema = new mongoose.Schema({
  type: { type: String, enum: ['external', 'file', 'gradient'] },
  url: String,
  gradient: String
}, { _id: false });

const backlinkSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionPage' },
  blockId: { type: mongoose.Schema.Types.ObjectId },
  pageTitle: String
}, { _id: false });

const shareSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permission: { type: String, enum: ['view', 'comment', 'edit'] }
}, { _id: false });

const databasePropertySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'multi_select', 'date', 'person', 'checkbox', 'url', 'email', 'phone', 'relation', 'formula', 'rollup']
  },
  options: [{
    value: String,
    color: String
  }]
}, { _id: false });

const databaseConfigSchema = new mongoose.Schema({
  viewType: {
    type: String,
    enum: ['table', 'board', 'timeline', 'calendar', 'gallery', 'list', 'chart']
  },
  properties: [databasePropertySchema],
  filters: [mongoose.Schema.Types.Mixed],
  sorts: [{
    property: String,
    direction: { type: String, enum: ['asc', 'desc'] }
  }],
  groupBy: String
}, { _id: false });

const caseNotionPageSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
    index: true
  },
  firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: true,
    index: true
  },

  title: { type: String, required: true },
  titleAr: String,

  pageType: {
    type: String,
    enum: [
      'general', 'strategy', 'timeline', 'evidence', 'arguments',
      'research', 'meeting_notes', 'correspondence', 'witnesses',
      'discovery', 'pleadings', 'settlement', 'brainstorm'
    ],
    default: 'general'
  },

  icon: pageIconSchema,
  cover: pageCoverSchema,

  // Wiki features
  parentPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionPage' },
  childPageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionPage' }],
  backlinks: [backlinkSchema],

  // Database views
  hasDatabase: { type: Boolean, default: false },
  databaseConfig: databaseConfigSchema,

  // Template
  isTemplate: { type: Boolean, default: false },
  templateCategory: String,

  // Favorites/Pins
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },

  // Sharing
  isPublic: { type: Boolean, default: false },
  sharedWith: [shareSchema],

  // Version control
  version: { type: Number, default: 1 },
  lastVersionAt: Date,

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  archivedAt: Date,
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
caseNotionPageSchema.index({ caseId: 1, pageType: 1 });
caseNotionPageSchema.index({ caseId: 1, isFavorite: 1 });
caseNotionPageSchema.index({ caseId: 1, isPinned: 1 });
caseNotionPageSchema.index({ caseId: 1, archivedAt: 1 });
caseNotionPageSchema.index({ firmId: 1, isTemplate: 1 });
caseNotionPageSchema.index({ title: 'text', titleAr: 'text' });

// Virtual for blocks
caseNotionPageSchema.virtual('blocks', {
  ref: 'CaseNotionBlock',
  localField: '_id',
  foreignField: 'pageId'
});

module.exports = mongoose.model('CaseNotionPage', caseNotionPageSchema);
```

### 2. CaseNotionBlock Schema

```javascript
// models/CaseNotionBlock.js
const mongoose = require('mongoose');

const richTextAnnotationSchema = new mongoose.Schema({
  bold: { type: Boolean, default: false },
  italic: { type: Boolean, default: false },
  strikethrough: { type: Boolean, default: false },
  underline: { type: Boolean, default: false },
  code: { type: Boolean, default: false },
  color: { type: String, default: 'default' }
}, { _id: false });

const richTextItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'mention', 'equation'], default: 'text' },
  text: {
    content: String,
    link: String
  },
  mention: {
    type: { type: String, enum: ['user', 'page', 'date', 'task', 'case', 'client'] },
    id: String,
    name: String
  },
  equation: {
    expression: String
  },
  annotations: richTextAnnotationSchema,
  plainText: String
}, { _id: false });

const tableDataSchema = new mongoose.Schema({
  headers: [String],
  rows: [[String]],
  hasHeaderRow: { type: Boolean, default: true },
  hasHeaderColumn: { type: Boolean, default: false }
}, { _id: false });

const blockTypes = [
  'text', 'heading_1', 'heading_2', 'heading_3',
  'bulleted_list', 'numbered_list', 'todo', 'toggle',
  'quote', 'callout', 'divider', 'code', 'table',
  'image', 'file', 'bookmark', 'embed', 'synced_block',
  'template', 'column_list', 'column', 'link_to_page',
  'mention', 'equation', 'timeline_entry', 'party_statement',
  'evidence_item', 'legal_citation'
];

const caseNotionBlockSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionPage',
    required: true,
    index: true
  },

  type: { type: String, enum: blockTypes, required: true },
  content: [richTextItemSchema],
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Hierarchy
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionBlock' },
  order: { type: Number, default: 0 },
  indent: { type: Number, default: 0 },
  isCollapsed: { type: Boolean, default: false },

  // Synced blocks
  isSyncedBlock: { type: Boolean, default: false },
  syncedFromBlockId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionBlock' },

  // Todo blocks
  checked: Boolean,

  // Code blocks
  language: String,

  // Callout/Quote blocks
  icon: String,
  color: String,

  // Table blocks
  tableData: tableDataSchema,

  // File/Image blocks
  fileUrl: String,
  fileName: String,
  caption: String,

  // Party statement blocks
  partyType: { type: String, enum: ['plaintiff', 'defendant', 'witness', 'expert', 'judge'] },
  statementDate: Date,

  // Evidence blocks
  evidenceType: { type: String, enum: ['document', 'testimony', 'physical', 'digital', 'expert_opinion'] },
  evidenceDate: Date,
  evidenceSource: String,

  // Legal citation blocks
  citationType: { type: String, enum: ['law', 'regulation', 'case_precedent', 'legal_principle'] },
  citationReference: String,

  // Timeline blocks
  eventDate: Date,
  eventType: String,

  // Linked tasks
  linkedTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

  // Collaboration
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: Date,
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastEditedAt: Date
}, { timestamps: true });

// Indexes
caseNotionBlockSchema.index({ pageId: 1, order: 1 });
caseNotionBlockSchema.index({ pageId: 1, parentId: 1 });
caseNotionBlockSchema.index({ syncedFromBlockId: 1 });
caseNotionBlockSchema.index({ 'content.plainText': 'text' });

module.exports = mongoose.model('CaseNotionBlock', caseNotionBlockSchema);
```

### 3. SyncedBlock Schema

```javascript
// models/SyncedBlock.js
const mongoose = require('mongoose');

const syncedBlockSchema = new mongoose.Schema({
  originalBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionBlock',
    required: true
  },
  originalPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionPage',
    required: true
  },
  syncedToPages: [{
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionPage' },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseNotionBlock' }
  }],
  content: [mongoose.Schema.Types.Mixed],
  properties: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SyncedBlock', syncedBlockSchema);
```

### 4. PageTemplate Schema

```javascript
// models/PageTemplate.js
const mongoose = require('mongoose');

const pageTemplateSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm' },

  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  category: {
    type: String,
    enum: [
      'case_strategy', 'client_meeting', 'court_hearing', 'legal_research',
      'evidence_analysis', 'witness_interview', 'settlement_negotiation',
      'case_timeline', 'brainstorming', 'custom'
    ],
    required: true
  },

  icon: {
    type: { type: String, enum: ['emoji', 'file', 'external'] },
    emoji: String,
    url: String
  },

  // Template content (stored as JSON blocks array)
  blocks: [mongoose.Schema.Types.Mixed],

  isGlobal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

pageTemplateSchema.index({ firmId: 1, category: 1 });
pageTemplateSchema.index({ isGlobal: 1, isActive: 1 });

module.exports = mongoose.model('PageTemplate', pageTemplateSchema);
```

### 5. BlockComment Schema

```javascript
// models/BlockComment.js
const mongoose = require('mongoose');

const blockCommentSchema = new mongoose.Schema({
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionBlock',
    required: true,
    index: true
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionPage',
    required: true,
    index: true
  },

  content: { type: String, required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlockComment' },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isResolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('BlockComment', blockCommentSchema);
```

### 6. PageActivity Schema

```javascript
// models/PageActivity.js
const mongoose = require('mongoose');

const pageActivitySchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionPage',
    required: true,
    index: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,

  action: {
    type: String,
    enum: [
      'created', 'edited', 'deleted', 'restored', 'shared', 'unshared',
      'commented', 'mentioned', 'block_added', 'block_deleted', 'block_moved',
      'template_applied'
    ],
    required: true
  },

  details: mongoose.Schema.Types.Mixed
}, { timestamps: { createdAt: true, updatedAt: false } });

pageActivitySchema.index({ pageId: 1, createdAt: -1 });

module.exports = mongoose.model('PageActivity', pageActivitySchema);
```

---

## API Endpoints

### Page Endpoints

```javascript
// routes/caseNotion.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const caseNotionController = require('../controllers/caseNotionController');

// Pages
router.get('/cases/:caseId/notion/pages', auth, caseNotionController.listPages);
router.get('/cases/:caseId/notion/pages/:pageId', auth, caseNotionController.getPage);
router.post('/cases/:caseId/notion/pages', auth, caseNotionController.createPage);
router.patch('/cases/:caseId/notion/pages/:pageId', auth, caseNotionController.updatePage);
router.delete('/cases/:caseId/notion/pages/:pageId', auth, caseNotionController.deletePage);
router.post('/cases/:caseId/notion/pages/:pageId/archive', auth, caseNotionController.archivePage);
router.post('/cases/:caseId/notion/pages/:pageId/restore', auth, caseNotionController.restorePage);
router.post('/cases/:caseId/notion/pages/:pageId/duplicate', auth, caseNotionController.duplicatePage);
router.post('/cases/:caseId/notion/pages/:pageId/favorite', auth, caseNotionController.toggleFavorite);
router.post('/cases/:caseId/notion/pages/merge', auth, caseNotionController.mergePages);

// Blocks
router.get('/cases/:caseId/notion/pages/:pageId/blocks', auth, caseNotionController.getBlocks);
router.post('/cases/:caseId/notion/pages/:pageId/blocks', auth, caseNotionController.createBlock);
router.patch('/cases/:caseId/notion/blocks/:blockId', auth, caseNotionController.updateBlock);
router.delete('/cases/:caseId/notion/blocks/:blockId', auth, caseNotionController.deleteBlock);
router.post('/cases/:caseId/notion/blocks/:blockId/move', auth, caseNotionController.moveBlock);
router.post('/cases/:caseId/notion/blocks/:blockId/lock', auth, caseNotionController.lockBlock);
router.post('/cases/:caseId/notion/blocks/:blockId/unlock', auth, caseNotionController.unlockBlock);

// Synced blocks
router.post('/cases/:caseId/notion/synced-blocks', auth, caseNotionController.createSyncedBlock);
router.get('/cases/:caseId/notion/synced-blocks/:blockId', auth, caseNotionController.getSyncedBlock);
router.post('/cases/:caseId/notion/synced-blocks/:blockId/unsync', auth, caseNotionController.unsyncBlock);

// Comments
router.get('/cases/:caseId/notion/blocks/:blockId/comments', auth, caseNotionController.getComments);
router.post('/cases/:caseId/notion/blocks/:blockId/comments', auth, caseNotionController.addComment);
router.post('/cases/:caseId/notion/comments/:commentId/resolve', auth, caseNotionController.resolveComment);
router.delete('/cases/:caseId/notion/comments/:commentId', auth, caseNotionController.deleteComment);

// Activity
router.get('/cases/:caseId/notion/pages/:pageId/activity', auth, caseNotionController.getPageActivity);

// Search
router.get('/cases/:caseId/notion/search', auth, caseNotionController.search);

// Export
router.get('/cases/:caseId/notion/pages/:pageId/export/pdf', auth, caseNotionController.exportPdf);
router.get('/cases/:caseId/notion/pages/:pageId/export/markdown', auth, caseNotionController.exportMarkdown);
router.get('/cases/:caseId/notion/pages/:pageId/export/html', auth, caseNotionController.exportHtml);

// Templates
router.get('/notion/templates', auth, caseNotionController.getTemplates);
router.post('/cases/:caseId/notion/pages/:pageId/apply-template', auth, caseNotionController.applyTemplate);
router.post('/cases/:caseId/notion/pages/:pageId/save-as-template', auth, caseNotionController.saveAsTemplate);

// Task linking
router.post('/cases/:caseId/notion/blocks/:blockId/link-task', auth, caseNotionController.linkTask);
router.post('/cases/:caseId/notion/blocks/:blockId/unlink-task', auth, caseNotionController.unlinkTask);
router.post('/cases/:caseId/notion/blocks/:blockId/create-task', auth, caseNotionController.createTaskFromBlock);

module.exports = router;
```

### Controller Implementation Examples

```javascript
// controllers/caseNotionController.js
const CaseNotionPage = require('../models/CaseNotionPage');
const CaseNotionBlock = require('../models/CaseNotionBlock');
const PageActivity = require('../models/PageActivity');

exports.listPages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { pageType, search, isFavorite, isPinned, isArchived, page = 1, limit = 50 } = req.query;

    const query = {
      caseId,
      firmId: req.user.firmId,
      deletedAt: null
    };

    if (pageType) query.pageType = pageType;
    if (isFavorite !== undefined) query.isFavorite = isFavorite === 'true';
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (isArchived !== undefined) {
      query.archivedAt = isArchived === 'true' ? { $ne: null } : null;
    } else {
      query.archivedAt = null; // Default: exclude archived
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pages = await CaseNotionPage.find(query)
      .sort({ isPinned: -1, isFavorite: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('lastEditedBy', 'firstName lastName');

    const count = await CaseNotionPage.countDocuments(query);

    res.json({
      success: true,
      data: { pages, count, totalPages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.getPage = async (req, res) => {
  try {
    const { caseId, pageId } = req.params;

    const page = await CaseNotionPage.findOne({
      _id: pageId,
      caseId,
      firmId: req.user.firmId,
      deletedAt: null
    })
    .populate('createdBy', 'firstName lastName')
    .populate('lastEditedBy', 'firstName lastName')
    .populate('parentPageId', 'title titleAr')
    .populate('childPageIds', 'title titleAr icon');

    if (!page) {
      return res.status(404).json({ error: true, message: 'Page not found' });
    }

    // Get blocks for this page
    const blocks = await CaseNotionBlock.find({ pageId })
      .sort({ order: 1 })
      .populate('lastEditedBy', 'firstName lastName');

    res.json({
      success: true,
      data: { ...page.toObject(), blocks }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { title, titleAr, pageType, icon, cover, parentPageId, templateId } = req.body;

    const page = new CaseNotionPage({
      caseId,
      firmId: req.user.firmId,
      title,
      titleAr,
      pageType: pageType || 'general',
      icon,
      cover,
      parentPageId,
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    });

    await page.save();

    // If templateId provided, apply template
    if (templateId) {
      await applyTemplateToPage(page._id, templateId, req.user._id);
    }

    // Update parent's childPageIds if has parent
    if (parentPageId) {
      await CaseNotionPage.findByIdAndUpdate(parentPageId, {
        $push: { childPageIds: page._id }
      });
    }

    // Log activity
    await PageActivity.create({
      pageId: page._id,
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      action: 'created'
    });

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const updateData = req.body;

    const block = await CaseNotionBlock.findById(blockId);
    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    // Check if block is locked by another user
    if (block.lockedBy && block.lockedBy.toString() !== req.user._id.toString()) {
      return res.status(423).json({
        error: true,
        message: 'Block is being edited by another user'
      });
    }

    // Update block
    Object.assign(block, updateData, {
      lastEditedBy: req.user._id,
      lastEditedAt: new Date()
    });

    await block.save();

    // If this is a synced block original, update all synced copies
    if (block.isSyncedBlock) {
      await updateSyncedBlocks(block._id, updateData);
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: { results: [], count: 0 } });
    }

    // Search in page titles
    const pageMatches = await CaseNotionPage.find({
      caseId,
      firmId: req.user.firmId,
      deletedAt: null,
      archivedAt: null,
      $text: { $search: q }
    }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .select('title titleAr');

    // Search in block content
    const blockMatches = await CaseNotionBlock.find({
      'content.plainText': { $regex: q, $options: 'i' }
    })
    .limit(20)
    .populate('pageId', 'title titleAr');

    const results = [
      ...pageMatches.map(p => ({
        pageId: p._id,
        pageTitle: p.title,
        matchType: 'title',
        score: p._doc.score || 1
      })),
      ...blockMatches
        .filter(b => b.pageId)
        .map(b => ({
          pageId: b.pageId._id,
          pageTitle: b.pageId.title,
          blockId: b._id,
          blockContent: b.content[0]?.plainText?.substring(0, 100),
          matchType: 'content',
          score: 0.5
        }))
    ];

    // Dedupe and sort
    const uniqueResults = [...new Map(results.map(r =>
      [r.pageId.toString() + (r.blockId || ''), r]
    )).values()].sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: { results: uniqueResults, count: uniqueResults.length }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.mergePages = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { sourcePageIds, targetTitle, deleteSourcePages } = req.body;

    // Create new merged page
    const mergedPage = new CaseNotionPage({
      caseId,
      firmId: req.user.firmId,
      title: targetTitle,
      pageType: 'general',
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    });

    await mergedPage.save();

    // Collect all blocks from source pages in order
    let blockOrder = 0;
    for (const sourcePageId of sourcePageIds) {
      const sourcePage = await CaseNotionPage.findById(sourcePageId);
      if (!sourcePage) continue;

      // Add page title as heading
      await CaseNotionBlock.create({
        pageId: mergedPage._id,
        type: 'heading_2',
        content: [{ type: 'text', text: { content: sourcePage.title }, plainText: sourcePage.title }],
        order: blockOrder++
      });

      // Copy blocks
      const blocks = await CaseNotionBlock.find({ pageId: sourcePageId }).sort({ order: 1 });
      for (const block of blocks) {
        const newBlock = block.toObject();
        delete newBlock._id;
        newBlock.pageId = mergedPage._id;
        newBlock.order = blockOrder++;
        await CaseNotionBlock.create(newBlock);
      }

      // Add divider between pages
      await CaseNotionBlock.create({
        pageId: mergedPage._id,
        type: 'divider',
        content: [],
        order: blockOrder++
      });
    }

    // Optionally delete source pages
    if (deleteSourcePages) {
      await CaseNotionPage.updateMany(
        { _id: { $in: sourcePageIds } },
        { deletedAt: new Date() }
      );
    }

    res.json({ success: true, data: mergedPage });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Helper function
async function updateSyncedBlocks(originalBlockId, updateData) {
  const SyncedBlock = require('../models/SyncedBlock');
  const syncedRecord = await SyncedBlock.findOne({ originalBlockId });

  if (syncedRecord) {
    // Update the synced record
    syncedRecord.content = updateData.content || syncedRecord.content;
    syncedRecord.properties = updateData.properties || syncedRecord.properties;
    await syncedRecord.save();

    // Update all synced copies
    for (const synced of syncedRecord.syncedToPages) {
      await CaseNotionBlock.findByIdAndUpdate(synced.blockId, {
        content: syncedRecord.content,
        properties: syncedRecord.properties,
        lastEditedAt: new Date()
      });
    }
  }
}

async function applyTemplateToPage(pageId, templateId, userId) {
  const PageTemplate = require('../models/PageTemplate');
  const template = await PageTemplate.findById(templateId);

  if (!template) return;

  // Create blocks from template
  let order = 0;
  for (const blockTemplate of template.blocks) {
    const block = { ...blockTemplate };
    delete block._id;
    block.pageId = pageId;
    block.order = order++;
    await CaseNotionBlock.create(block);
  }

  // Increment template usage count
  await PageTemplate.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } });
}
```

---

## Real-time Features

### Socket.io Integration

```javascript
// sockets/caseNotionSocket.js
const CaseNotionBlock = require('../models/CaseNotionBlock');

module.exports = (io) => {
  const notionNamespace = io.of('/notion');

  notionNamespace.on('connection', (socket) => {
    // Join page room
    socket.on('join-page', (pageId) => {
      socket.join(`page:${pageId}`);
      socket.pageId = pageId;
    });

    socket.on('leave-page', (pageId) => {
      socket.leave(`page:${pageId}`);
    });

    // Block editing events
    socket.on('block-focus', async (data) => {
      const { blockId, userId, userName } = data;

      // Lock the block
      await CaseNotionBlock.findByIdAndUpdate(blockId, {
        lockedBy: userId,
        lockedAt: new Date()
      });

      // Notify others
      socket.to(`page:${socket.pageId}`).emit('block-locked', {
        blockId,
        userId,
        userName
      });
    });

    socket.on('block-blur', async (data) => {
      const { blockId } = data;

      // Unlock the block
      await CaseNotionBlock.findByIdAndUpdate(blockId, {
        $unset: { lockedBy: '', lockedAt: '' }
      });

      socket.to(`page:${socket.pageId}`).emit('block-unlocked', { blockId });
    });

    socket.on('block-update', async (data) => {
      const { blockId, content, userId } = data;

      // Broadcast to others (real-time sync)
      socket.to(`page:${socket.pageId}`).emit('block-updated', {
        blockId,
        content,
        userId
      });
    });

    socket.on('cursor-move', (data) => {
      socket.to(`page:${socket.pageId}`).emit('cursor-moved', data);
    });

    socket.on('disconnect', async () => {
      // Unlock any blocks this user had locked
      if (socket.userId) {
        await CaseNotionBlock.updateMany(
          { lockedBy: socket.userId },
          { $unset: { lockedBy: '', lockedAt: '' } }
        );
      }
    });
  });
};
```

---

## Security Considerations

### Access Control

```javascript
// middleware/caseNotionAuth.js
const Case = require('../models/Case');
const CaseNotionPage = require('../models/CaseNotionPage');

exports.canAccessCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findOne({
      _id: caseId,
      firmId: req.user.firmId,
      $or: [
        { lawyerId: req.user._id },
        { teamMembers: req.user._id },
        { createdBy: req.user._id }
      ]
    });

    if (!caseDoc && req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied to this case'
      });
    }

    req.case = caseDoc;
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

exports.canEditPage = async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const page = await CaseNotionPage.findById(pageId);
    if (!page) {
      return res.status(404).json({ error: true, message: 'Page not found' });
    }

    // Check if user has edit permission
    const hasEditAccess = page.createdBy.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      page.sharedWith.some(s =>
        s.userId.toString() === req.user._id.toString() &&
        s.permission === 'edit'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        error: true,
        message: 'You do not have edit permission for this page'
      });
    }

    req.page = page;
    next();
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### Input Validation

```javascript
// validators/caseNotionValidator.js
const { body, param, query } = require('express-validator');

exports.createPage = [
  body('title').notEmpty().trim().isLength({ max: 500 }),
  body('titleAr').optional().trim().isLength({ max: 500 }),
  body('pageType').optional().isIn([
    'general', 'strategy', 'timeline', 'evidence', 'arguments',
    'research', 'meeting_notes', 'correspondence', 'witnesses',
    'discovery', 'pleadings', 'settlement', 'brainstorm'
  ]),
  body('icon.type').optional().isIn(['emoji', 'file', 'external']),
  body('icon.emoji').optional().isLength({ max: 10 }),
  body('parentPageId').optional().isMongoId()
];

exports.createBlock = [
  body('type').notEmpty().isIn([
    'text', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list',
    'numbered_list', 'todo', 'toggle', 'quote', 'callout', 'divider',
    'code', 'table', 'image', 'file', 'timeline_entry', 'party_statement',
    'evidence_item', 'legal_citation'
  ]),
  body('content').optional().isArray(),
  body('parentId').optional().isMongoId(),
  body('afterBlockId').optional().isMongoId()
];

exports.updateBlock = [
  body('content').optional().isArray(),
  body('type').optional().isIn([
    'text', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list',
    'numbered_list', 'todo', 'toggle', 'quote', 'callout', 'divider',
    'code', 'table', 'image', 'file', 'timeline_entry', 'party_statement',
    'evidence_item', 'legal_citation'
  ]),
  body('checked').optional().isBoolean()
];
```

---

## Export Functions

### PDF Export

```javascript
// services/pdfExporter.js
const puppeteer = require('puppeteer');

exports.exportPageToPdf = async (pageWithBlocks) => {
  const html = generateHtmlFromBlocks(pageWithBlocks);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
  });

  await browser.close();
  return pdfBuffer;
};

function generateHtmlFromBlocks(page) {
  let html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'IBM Plex Sans Arabic', sans-serif; line-height: 1.8; }
        h1 { font-size: 2em; margin-bottom: 0.5em; }
        h2 { font-size: 1.5em; margin-top: 1em; }
        h3 { font-size: 1.2em; margin-top: 1em; }
        blockquote { border-right: 4px solid #ccc; padding-right: 1em; margin: 1em 0; }
        .callout { background: #f5f5f5; padding: 1em; border-radius: 8px; margin: 1em 0; }
        .party-statement { border-right: 4px solid #3b82f6; padding: 1em; margin: 1em 0; }
        .evidence-item { border: 1px solid #10b981; padding: 1em; margin: 1em 0; border-radius: 8px; }
        .legal-citation { background: #eff6ff; padding: 1em; margin: 1em 0; border-radius: 8px; }
        ul, ol { padding-right: 2em; }
        code { background: #1e293b; color: #e2e8f0; padding: 0.2em 0.4em; border-radius: 4px; }
        pre { background: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 8px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>${page.title}</h1>
  `;

  for (const block of page.blocks || []) {
    html += blockToHtml(block);
  }

  html += '</body></html>';
  return html;
}

function blockToHtml(block) {
  const content = block.content?.map(c => c.plainText || c.text?.content || '').join('') || '';

  switch (block.type) {
    case 'heading_1': return `<h1>${content}</h1>`;
    case 'heading_2': return `<h2>${content}</h2>`;
    case 'heading_3': return `<h3>${content}</h3>`;
    case 'bulleted_list': return `<ul><li>${content}</li></ul>`;
    case 'numbered_list': return `<ol><li>${content}</li></ol>`;
    case 'quote': return `<blockquote>${content}</blockquote>`;
    case 'callout': return `<div class="callout">${block.icon || '💡'} ${content}</div>`;
    case 'code': return `<pre><code>${content}</code></pre>`;
    case 'divider': return '<hr>';
    case 'party_statement':
      return `<div class="party-statement"><strong>${block.partyType}</strong><br>${content}</div>`;
    case 'evidence_item':
      return `<div class="evidence-item"><strong>${block.evidenceType}</strong><br>${content}</div>`;
    case 'legal_citation':
      return `<div class="legal-citation"><strong>${block.citationType}: ${block.citationReference || ''}</strong><br>${content}</div>`;
    default: return `<p>${content}</p>`;
  }
}
```

### Markdown Export

```javascript
// services/markdownExporter.js
exports.exportPageToMarkdown = (pageWithBlocks) => {
  let md = `# ${pageWithBlocks.title}\n\n`;

  for (const block of pageWithBlocks.blocks || []) {
    md += blockToMarkdown(block);
  }

  return md;
};

function blockToMarkdown(block) {
  const content = block.content?.map(c => c.plainText || c.text?.content || '').join('') || '';

  switch (block.type) {
    case 'heading_1': return `# ${content}\n\n`;
    case 'heading_2': return `## ${content}\n\n`;
    case 'heading_3': return `### ${content}\n\n`;
    case 'bulleted_list': return `- ${content}\n`;
    case 'numbered_list': return `1. ${content}\n`;
    case 'todo': return `- [${block.checked ? 'x' : ' '}] ${content}\n`;
    case 'quote': return `> ${content}\n\n`;
    case 'callout': return `> ${block.icon || '💡'} **Note:** ${content}\n\n`;
    case 'code': return `\`\`\`${block.language || ''}\n${content}\n\`\`\`\n\n`;
    case 'divider': return `---\n\n`;
    case 'party_statement':
      return `**${block.partyType}** (${block.statementDate || 'No date'}):\n> ${content}\n\n`;
    case 'evidence_item':
      return `**Evidence (${block.evidenceType}):**\n${content}\n\n`;
    case 'legal_citation':
      return `**Citation (${block.citationType}):** ${block.citationReference || ''}\n${content}\n\n`;
    default: return `${content}\n\n`;
  }
}
```

---

## Default Templates

Create default templates for common legal use cases:

```javascript
// seeds/defaultTemplates.js
const templates = [
  {
    name: 'Case Strategy Template',
    nameAr: 'قالب استراتيجية القضية',
    category: 'case_strategy',
    icon: { type: 'emoji', emoji: '🎯' },
    isGlobal: true,
    blocks: [
      { type: 'heading_1', content: [{ type: 'text', text: { content: 'Case Strategy' }, plainText: 'Case Strategy' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Case Overview' }, plainText: 'Case Overview' }] },
      { type: 'text', content: [{ type: 'text', text: { content: 'Summarize the key facts and legal issues...' }, plainText: 'Summarize the key facts and legal issues...' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Strengths' }, plainText: 'Strengths' }] },
      { type: 'bulleted_list', content: [{ type: 'text', text: { content: 'List case strengths...' }, plainText: 'List case strengths...' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Weaknesses' }, plainText: 'Weaknesses' }] },
      { type: 'bulleted_list', content: [{ type: 'text', text: { content: 'List potential weaknesses...' }, plainText: 'List potential weaknesses...' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Action Plan' }, plainText: 'Action Plan' }] },
      { type: 'todo', content: [{ type: 'text', text: { content: 'First action item...' }, plainText: 'First action item...' }], checked: false }
    ]
  },
  {
    name: 'Court Hearing Notes',
    nameAr: 'محضر جلسة المحكمة',
    category: 'court_hearing',
    icon: { type: 'emoji', emoji: '⚖️' },
    isGlobal: true,
    blocks: [
      { type: 'heading_1', content: [{ type: 'text', text: { content: 'Hearing Notes' }, plainText: 'Hearing Notes' }] },
      { type: 'callout', icon: '📅', content: [{ type: 'text', text: { content: 'Date: [Enter date]' }, plainText: 'Date: [Enter date]' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Judge\'s Statements' }, plainText: "Judge's Statements" }] },
      { type: 'party_statement', partyType: 'judge', content: [] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Plaintiff\'s Arguments' }, plainText: "Plaintiff's Arguments" }] },
      { type: 'party_statement', partyType: 'plaintiff', content: [] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Defendant\'s Arguments' }, plainText: "Defendant's Arguments" }] },
      { type: 'party_statement', partyType: 'defendant', content: [] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Next Steps' }, plainText: 'Next Steps' }] },
      { type: 'todo', content: [{ type: 'text', text: { content: 'Follow up action...' }, plainText: 'Follow up action...' }], checked: false }
    ]
  },
  {
    name: 'Evidence Collection',
    nameAr: 'جمع الأدلة',
    category: 'evidence_analysis',
    icon: { type: 'emoji', emoji: '🔍' },
    isGlobal: true,
    blocks: [
      { type: 'heading_1', content: [{ type: 'text', text: { content: 'Evidence Collection' }, plainText: 'Evidence Collection' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Documentary Evidence' }, plainText: 'Documentary Evidence' }] },
      { type: 'evidence_item', evidenceType: 'document', content: [{ type: 'text', text: { content: 'Document description...' }, plainText: 'Document description...' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Witness Testimony' }, plainText: 'Witness Testimony' }] },
      { type: 'evidence_item', evidenceType: 'testimony', content: [{ type: 'text', text: { content: 'Testimony summary...' }, plainText: 'Testimony summary...' }] },
      { type: 'heading_2', content: [{ type: 'text', text: { content: 'Digital Evidence' }, plainText: 'Digital Evidence' }] },
      { type: 'evidence_item', evidenceType: 'digital', content: [{ type: 'text', text: { content: 'Digital evidence details...' }, plainText: 'Digital evidence details...' }] }
    ]
  }
];

module.exports = templates;
```

---

## Detailed Request/Response Examples

### List Pages - GET `/api/v1/cases/:caseId/notion/pages`

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pageType | string | No | Filter by page type |
| search | string | No | Search in title |
| isFavorite | boolean | No | Filter favorites only |
| isPinned | boolean | No | Filter pinned only |
| parentPageId | string | No | Filter by parent page |
| isArchived | boolean | No | Include archived (default: false) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 50) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "_id": "674a1b2c3d4e5f6g7h8i9j0k",
        "caseId": "6926b5d06fbe980abbc0465a",
        "title": "استراتيجية القضية",
        "titleAr": "استراتيجية القضية",
        "pageType": "strategy",
        "icon": { "type": "emoji", "emoji": "🎯" },
        "cover": null,
        "parentPageId": null,
        "childPageIds": [],
        "isFavorite": true,
        "isPinned": false,
        "isPublic": false,
        "version": 3,
        "createdBy": {
          "_id": "user123",
          "firstName": "محمد",
          "lastName": "أحمد"
        },
        "lastEditedBy": {
          "_id": "user123",
          "firstName": "محمد",
          "lastName": "أحمد"
        },
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-02-01T14:30:00.000Z"
      }
    ],
    "count": 5,
    "totalPages": 1
  }
}
```

**Error Response (403) - Access Denied:**
```json
{
  "error": true,
  "message": "Access denied to this case",
  "code": "FORBIDDEN"
}
```

---

### Get Single Page - GET `/api/v1/cases/:caseId/notion/pages/:pageId`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "caseId": "6926b5d06fbe980abbc0465a",
    "title": "استراتيجية القضية",
    "titleAr": "استراتيجية القضية",
    "pageType": "strategy",
    "icon": { "type": "emoji", "emoji": "🎯" },
    "cover": null,
    "blocks": [
      {
        "_id": "block123",
        "type": "heading_1",
        "content": [
          {
            "type": "text",
            "text": { "content": "النقاط الرئيسية" },
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            },
            "plainText": "النقاط الرئيسية"
          }
        ],
        "properties": {},
        "children": [],
        "order": 0,
        "indent": 0,
        "isCollapsed": false,
        "pageId": "674a1b2c3d4e5f6g7h8i9j0k"
      },
      {
        "_id": "block124",
        "type": "bulleted_list",
        "content": [
          {
            "type": "text",
            "text": { "content": "تقديم دعوى مطالبة بمستحقات نهاية الخدمة" },
            "plainText": "تقديم دعوى مطالبة بمستحقات نهاية الخدمة"
          }
        ],
        "order": 1,
        "indent": 0
      }
    ],
    "parentPageId": null,
    "childPageIds": [],
    "backlinks": [],
    "isFavorite": true,
    "isPinned": false,
    "sharedWith": [],
    "version": 3,
    "createdBy": { "_id": "user123", "firstName": "محمد", "lastName": "أحمد" },
    "lastEditedBy": { "_id": "user123", "firstName": "محمد", "lastName": "أحمد" },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-02-01T14:30:00.000Z"
  }
}
```

**Error Response (404) - Page Not Found:**
```json
{
  "error": true,
  "message": "Page not found",
  "code": "NOT_FOUND"
}
```

---

### Create Page - POST `/api/v1/cases/:caseId/notion/pages`

**Request Body:**
```json
{
  "title": "ملاحظات الجلسة الأولى",
  "titleAr": "ملاحظات الجلسة الأولى",
  "pageType": "meeting_notes",
  "icon": { "type": "emoji", "emoji": "📝" },
  "parentPageId": null,
  "templateId": "template123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "newpage123",
    "caseId": "6926b5d06fbe980abbc0465a",
    "title": "ملاحظات الجلسة الأولى",
    "pageType": "meeting_notes",
    "blocks": [],
    "createdBy": { "_id": "user123" },
    "createdAt": "2024-02-10T10:00:00.000Z"
  }
}
```

---

### Create Block - POST `/api/v1/cases/:caseId/notion/pages/:pageId/blocks`

**Request Body:**
```json
{
  "pageId": "674a1b2c3d4e5f6g7h8i9j0k",
  "type": "party_statement",
  "content": [
    {
      "type": "text",
      "text": { "content": "أقر المدعى عليه بوجود علاقة عمل" },
      "plainText": "أقر المدعى عليه بوجود علاقة عمل"
    }
  ],
  "partyType": "defendant",
  "statementDate": "2024-02-01",
  "afterBlockId": "block123",
  "indent": 0
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "newblock456",
    "type": "party_statement",
    "content": [...],
    "partyType": "defendant",
    "statementDate": "2024-02-01T00:00:00.000Z",
    "pageId": "674a1b2c3d4e5f6g7h8i9j0k",
    "order": 5
  }
}
```

---

### Update Block - PATCH `/api/v1/cases/:caseId/notion/blocks/:blockId`

**Request Body:**
```json
{
  "content": [
    {
      "type": "text",
      "text": { "content": "النص المحدث" },
      "plainText": "النص المحدث"
    }
  ],
  "checked": true
}
```

**Error Response (423) - Block Locked:**
```json
{
  "error": true,
  "message": "Block is being edited by another user",
  "code": "BLOCK_LOCKED",
  "lockedBy": {
    "userId": "user456",
    "userName": "أحمد محمد"
  }
}
```

---

## Block Types Reference

The frontend supports these block types:

| Block Type | Arabic | Description |
|------------|--------|-------------|
| `text` | نص | Plain text paragraph |
| `heading_1` | عنوان 1 | Large heading |
| `heading_2` | عنوان 2 | Medium heading |
| `heading_3` | عنوان 3 | Small heading |
| `bulleted_list` | قائمة نقطية | Bullet point |
| `numbered_list` | قائمة مرقمة | Numbered item |
| `todo` | مهمة | Checkbox item |
| `toggle` | قائمة قابلة للطي | Collapsible section |
| `quote` | اقتباس | Block quote |
| `callout` | تنبيه | Highlighted note |
| `divider` | فاصل | Horizontal line |
| `code` | كود | Code block |
| `table` | جدول | Table |
| `image` | صورة | Image |
| `file` | ملف | File attachment |
| `party_statement` | أقوال الطرف | Legal party statement |
| `evidence_item` | عنصر دليل | Evidence item |
| `legal_citation` | استشهاد قانوني | Legal citation |
| `timeline_entry` | حدث زمني | Timeline event |

---

## Page Types Reference

| Page Type | Arabic | English |
|-----------|--------|---------|
| `general` | ملاحظات عامة | General Notes |
| `strategy` | استراتيجية القضية | Case Strategy |
| `timeline` | الجدول الزمني | Timeline |
| `evidence` | الأدلة | Evidence |
| `arguments` | الحجج القانونية | Legal Arguments |
| `research` | البحث القانوني | Legal Research |
| `meeting_notes` | محاضر الاجتماعات | Meeting Notes |
| `correspondence` | المراسلات | Correspondence |
| `witnesses` | الشهود | Witnesses |
| `discovery` | الاكتشاف | Discovery |
| `pleadings` | المذكرات | Pleadings |
| `settlement` | التسوية | Settlement |
| `brainstorm` | العصف الذهني | Brainstorm |

---

## Summary

This CaseNotion backend provides:
1. **Flexible Schema** - Supports all block types including legal-specific ones
2. **Wiki Features** - Parent/child pages, backlinks, cross-page linking
3. **Real-time Collaboration** - Block locking, cursor sync, live updates
4. **Templates** - Pre-built templates for common legal workflows
5. **Search** - Full-text search across pages and blocks
6. **Export** - PDF and Markdown export with legal formatting
7. **Security** - Role-based access, page sharing, audit logging

The frontend is ready to use these endpoints - implement the backend following this guide to enable full CaseNotion functionality.

---

## Debugging 403 Errors Checklist

If you're getting 403 errors:

1. **Check if the case exists:**
   ```javascript
   // GET /api/v1/cases/:caseId should return the case
   const caseDoc = await Case.findById(caseId);
   console.log('Case exists:', !!caseDoc);
   ```

2. **Check user's firmId matches case's firmId:**
   ```javascript
   console.log('User firmId:', req.user.firmId);
   console.log('Case firmId:', caseDoc.firmId);
   console.log('Match:', req.user.firmId.toString() === caseDoc.firmId.toString());
   ```

3. **Check user has case access:**
   ```javascript
   const hasAccess =
     caseDoc.lawyerId?.toString() === req.user._id.toString() ||
     caseDoc.teamMembers?.includes(req.user._id) ||
     caseDoc.createdBy?.toString() === req.user._id.toString() ||
     req.user.role === 'admin';
   console.log('Has access:', hasAccess);
   ```

4. **Check route is registered:**
   ```javascript
   // In your routes/index.js or app.js
   app.use('/api/v1', require('./routes/caseNotion'));

   // Log all registered routes
   app._router.stack.forEach(r => {
     if (r.route) console.log(r.route.path, Object.keys(r.route.methods));
   });
   ```

5. **Test with admin user first:**
   - If admin works but regular user doesn't, it's a permission issue
   - If admin also fails, it's a route registration or middleware issue
