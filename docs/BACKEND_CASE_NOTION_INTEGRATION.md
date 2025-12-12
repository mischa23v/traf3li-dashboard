# CaseNotion Backend Integration Guide

This document provides detailed backend implementation instructions for the CaseNotion (Case Brainstorm) feature - a Notion-like workspace for legal case documentation and strategy planning.

## Table of Contents
1. [Overview](#overview)
2. [Database Schemas](#database-schemas)
3. [API Endpoints](#api-endpoints)
4. [Real-time Features](#real-time-features)
5. [Security Considerations](#security-considerations)

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
