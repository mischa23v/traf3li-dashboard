# CaseNotion Whiteboard/Brainstorm Backend Implementation Guide

This document provides detailed backend implementation instructions for the **Whiteboard/Brainstorm** feature in CaseNotion - enabling users to arrange blocks freely on a canvas, create visual connections, and link to case entities (events, tasks, hearings, documents).

---

## Table of Contents
1. [Overview](#overview)
2. [**GitHub Repos to Study**](#github-repos-to-study) ⭐ **START HERE**
3. [Schema Updates Required](#schema-updates-required)
4. [New API Endpoints](#new-api-endpoints)
5. [Controller Implementation](#controller-implementation)
6. [Request/Response Examples](#requestresponse-examples)
7. [Migration Guide](#migration-guide)
8. [Critical Implementation Notes](#critical-implementation-notes)

---

## Overview

The Whiteboard feature transforms CaseNotion from a document-style editor to a visual brainstorming tool where:
- **Blocks can be positioned anywhere** on a canvas (x, y coordinates)
- **Blocks can be resized** (width, height)
- **Blocks can be connected** with visual arrows/lines
- **Blocks can be linked** to case entities (events, tasks, hearings, documents)
- **Blocks can be color-coded** and prioritized
- **Pages can switch** between document and whiteboard views

---

## GitHub Repos to Study

**IMPORTANT**: Before implementing, study these production-grade whiteboard/canvas implementations to understand best practices:

### 1. **Excalidraw** ⭐ (89k+ Stars) - TOP PRIORITY
- **Repo**: https://github.com/excalidraw/excalidraw
- **Why Study**: Industry-leading open-source whiteboard
- **Key Files to Examine**:
  - `/packages/excalidraw/data/` - Data structures for elements
  - `/packages/excalidraw/element/` - Element types and operations
  - `/packages/excalidraw/actions/` - Action system for mutations
  - `/packages/excalidraw/scene/` - Scene management
- **Key Concepts**:
  - `BoundElements` for connection management
  - Immutable element updates
  - Efficient collision detection
  - Undo/redo with history stack

### 2. **tldraw** ⭐ (44k+ Stars) - EXCELLENT FOR ARCHITECTURE
- **Repo**: https://github.com/tldraw/tldraw
- **Why Study**: Modern TypeScript architecture, excellent documentation
- **Key Files to Examine**:
  - `/packages/tldraw/src/lib/shapes/` - Shape definitions
  - `/packages/editor/src/lib/editor/` - Core editor logic
  - `/packages/store/` - State management patterns
- **Key Concepts**:
  - Shape system with `TLShape` base type
  - Geometry-based collision detection
  - Transaction batching for performance
  - Record-based store architecture

### 3. **ReactFlow** ⭐ (34k+ Stars) - BEST FOR NODE/EDGE PATTERNS
- **Repo**: https://github.com/xyflow/xyflow
- **Why Study**: Production-ready node/edge system (exactly what we need)
- **Key Files to Examine**:
  - `/packages/core/src/store/` - Zustand store patterns
  - `/packages/core/src/types/` - TypeScript type definitions
  - `/packages/core/src/hooks/` - Custom hooks
- **Key Concepts**:
  - Node and Edge data structures
  - Handle positions (connection points)
  - `nodrag` class for interactive elements inside draggable nodes
  - Viewport transformation (zoom/pan)

### 4. **AFFiNE** (60k+ Stars) - NOTION-LIKE WITH WHITEBOARD
- **Repo**: https://github.com/toeverything/AFFiNE
- **Why Study**: Notion competitor with whiteboard mode
- **Key Files to Examine**:
  - `/packages/blocksuite/` - Block system
  - `/packages/blocksuite/blocks/surface-block/` - Canvas/surface block
- **Key Concepts**:
  - XYWH positioning (x, y, width, height)
  - Fractional indexing for z-order
  - CRDT for real-time sync
  - Block-based architecture

### 5. **BlockSuite** (7k+ Stars) - BLOCK EDITOR ENGINE
- **Repo**: https://github.com/toeverything/blocksuite
- **Why Study**: Core engine behind AFFiNE
- **Key Concepts**:
  - Rich block type system
  - Canvas rendering
  - Collaborative editing

### Key Architectural Patterns to Adopt

From these repos, implement these patterns:

```javascript
// 1. ELEMENT STRUCTURE (from Excalidraw/tldraw)
// Store position at TOP LEVEL, not nested in properties
{
  _id: "block123",
  type: "text",
  // Canvas positioning - TOP LEVEL (not in properties!)
  x: 350,           // or canvasX
  y: 200,           // or canvasY
  width: 200,       // or canvasWidth
  height: 150,      // or canvasHeight
  // Other fields...
}

// 2. CONNECTION STRUCTURE (from ReactFlow)
{
  _id: "conn123",
  source: "block1",      // sourceBlockId
  target: "block2",      // targetBlockId
  sourceHandle: "right", // which side of source block
  targetHandle: "left",  // which side of target block
  type: "arrow",
}

// 3. VIEWPORT STATE (from tldraw)
{
  zoom: 1.0,
  panX: 0,
  panY: 0,
}
```

---

## Schema Updates Required

### 1. Update CaseNotionBlock Schema

Add these fields to the existing `CaseNotionBlock` model:

```javascript
// models/CaseNotionBlock.js - ADD these fields

const caseNotionBlockSchema = new mongoose.Schema({
  // ... existing fields ...

  // ═══════════════════════════════════════════════════════════════
  // WHITEBOARD/CANVAS POSITIONING (NEW)
  // ═══════════════════════════════════════════════════════════════

  /**
   * X position on canvas (pixels from left edge)
   * Default: 0 - blocks start at origin
   */
  canvasX: {
    type: Number,
    default: 0,
    min: 0,
    max: 10000 // Prevent extreme values
  },

  /**
   * Y position on canvas (pixels from top edge)
   * Default: 0 - blocks start at origin
   */
  canvasY: {
    type: Number,
    default: 0,
    min: 0,
    max: 10000
  },

  /**
   * Width of block on canvas (pixels)
   * Min: 150, Default: 200, Max: 800
   */
  canvasWidth: {
    type: Number,
    default: 200,
    min: 150,
    max: 800
  },

  /**
   * Height of block on canvas (pixels)
   * Min: 100, Default: 150, Max: 600
   */
  canvasHeight: {
    type: Number,
    default: 150,
    min: 100,
    max: 600
  },

  // ═══════════════════════════════════════════════════════════════
  // VISUAL STYLING (NEW)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Block background color for visual categorization
   */
  blockColor: {
    type: String,
    enum: ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'],
    default: 'default'
  },

  /**
   * Priority level for the block
   */
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: null
  },

  // ═══════════════════════════════════════════════════════════════
  // ENTITY LINKING (NEW)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Link to a case timeline event
   */
  linkedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimelineEvent',
    default: null
  },

  /**
   * Link to a case task
   */
  linkedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },

  /**
   * Link to a case hearing
   */
  linkedHearingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hearing',
    default: null
  },

  /**
   * Link to a case document
   */
  linkedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },

  // ═══════════════════════════════════════════════════════════════
  // GROUPING (NEW)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Group ID for visually grouping related blocks
   */
  groupId: {
    type: String,
    default: null
  },

  /**
   * Group name for display
   */
  groupName: {
    type: String,
    default: null
  }
});

// Add index for canvas queries
caseNotionBlockSchema.index({ pageId: 1, canvasX: 1, canvasY: 1 });
caseNotionBlockSchema.index({ linkedEventId: 1 });
caseNotionBlockSchema.index({ linkedTaskId: 1 });
caseNotionBlockSchema.index({ linkedHearingId: 1 });
caseNotionBlockSchema.index({ linkedDocumentId: 1 });
```

### 2. Create BlockConnection Schema (NEW MODEL)

Create a new model for visual connections between blocks:

```javascript
// models/BlockConnection.js (NEW FILE)
const mongoose = require('mongoose');

const blockConnectionSchema = new mongoose.Schema({
  /**
   * The page this connection belongs to
   */
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionPage',
    required: true,
    index: true
  },

  /**
   * Source block (where the arrow starts)
   */
  sourceBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionBlock',
    required: true,
    index: true
  },

  /**
   * Target block (where the arrow points to)
   */
  targetBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseNotionBlock',
    required: true,
    index: true
  },

  /**
   * Type of connection line
   */
  connectionType: {
    type: String,
    enum: ['arrow', 'line', 'dashed', 'bidirectional'],
    default: 'arrow'
  },

  /**
   * Optional label displayed on the connection line
   */
  label: {
    type: String,
    maxlength: 100
  },

  /**
   * Color of the connection line (CSS color)
   */
  color: {
    type: String,
    default: '#6b7280' // Gray-500
  },

  /**
   * User who created this connection
   */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure unique connections (no duplicates)
blockConnectionSchema.index(
  { pageId: 1, sourceBlockId: 1, targetBlockId: 1 },
  { unique: true }
);

// Prevent self-referencing connections
blockConnectionSchema.pre('save', function(next) {
  if (this.sourceBlockId.toString() === this.targetBlockId.toString()) {
    return next(new Error('Cannot create connection from a block to itself'));
  }
  next();
});

module.exports = mongoose.model('BlockConnection', blockConnectionSchema);
```

### 3. Update CaseNotionPage Schema

Add whiteboard configuration to the page:

```javascript
// models/CaseNotionPage.js - ADD these fields

// Add this sub-schema for whiteboard configuration
const whiteboardConfigSchema = new mongoose.Schema({
  /**
   * Total canvas width (default 5000px)
   */
  canvasWidth: { type: Number, default: 5000 },

  /**
   * Total canvas height (default 5000px)
   */
  canvasHeight: { type: Number, default: 5000 },

  /**
   * Current zoom level (0.25 to 2.0)
   */
  zoom: { type: Number, default: 1, min: 0.25, max: 2 },

  /**
   * Current horizontal pan position
   */
  panX: { type: Number, default: 0 },

  /**
   * Current vertical pan position
   */
  panY: { type: Number, default: 0 },

  /**
   * Whether grid is visible
   */
  gridEnabled: { type: Boolean, default: true },

  /**
   * Whether blocks snap to grid
   */
  snapToGrid: { type: Boolean, default: true },

  /**
   * Grid cell size in pixels
   */
  gridSize: { type: Number, default: 20 }
}, { _id: false });

const caseNotionPageSchema = new mongoose.Schema({
  // ... existing fields ...

  // ═══════════════════════════════════════════════════════════════
  // WHITEBOARD CONFIGURATION (NEW)
  // ═══════════════════════════════════════════════════════════════

  /**
   * View mode: document (traditional) or whiteboard (canvas)
   */
  viewMode: {
    type: String,
    enum: ['document', 'whiteboard'],
    default: 'document'
  },

  /**
   * Whiteboard canvas configuration
   */
  whiteboardConfig: {
    type: whiteboardConfigSchema,
    default: () => ({})
  }
});
```

---

## New API Endpoints

### Block Position & Properties Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/cases/:caseId/notion/blocks/:blockId/position` | Update block position |
| `PATCH` | `/cases/:caseId/notion/blocks/:blockId/size` | Update block size |
| `PATCH` | `/cases/:caseId/notion/blocks/:blockId/color` | Update block color |
| `PATCH` | `/cases/:caseId/notion/blocks/:blockId/priority` | Update block priority |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/link-event` | Link block to event |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/link-hearing` | Link block to hearing |
| `POST` | `/cases/:caseId/notion/blocks/:blockId/link-document` | Link block to document |
| `DELETE` | `/cases/:caseId/notion/blocks/:blockId/unlink` | Remove all entity links |

### Connection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cases/:caseId/notion/pages/:pageId/connections` | Get all connections for page |
| `POST` | `/cases/:caseId/notion/pages/:pageId/connections` | Create new connection |
| `PATCH` | `/cases/:caseId/notion/connections/:connectionId` | Update connection |
| `DELETE` | `/cases/:caseId/notion/connections/:connectionId` | Delete connection |

### Page View Mode Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/cases/:caseId/notion/pages/:pageId/view-mode` | Toggle view mode |
| `PATCH` | `/cases/:caseId/notion/pages/:pageId/whiteboard-config` | Update whiteboard config |

---

## Controller Implementation

### Block Position/Properties Controller

```javascript
// controllers/caseNotionController.js - ADD these methods

/**
 * Update block canvas position
 * PATCH /api/v1/cases/:caseId/notion/blocks/:blockId/position
 */
exports.updateBlockPosition = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { canvasX, canvasY } = req.body;

    // Validate coordinates
    if (canvasX < 0 || canvasX > 10000 || canvasY < 0 || canvasY > 10000) {
      return res.status(400).json({
        error: true,
        message: 'Invalid position coordinates. Must be between 0 and 10000.'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        canvasX: Math.round(canvasX),
        canvasY: Math.round(canvasY),
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Update block canvas size
 * PATCH /api/v1/cases/:caseId/notion/blocks/:blockId/size
 */
exports.updateBlockSize = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { canvasWidth, canvasHeight } = req.body;

    // Validate dimensions
    if (canvasWidth < 150 || canvasWidth > 800) {
      return res.status(400).json({
        error: true,
        message: 'Width must be between 150 and 800 pixels'
      });
    }
    if (canvasHeight < 100 || canvasHeight > 600) {
      return res.status(400).json({
        error: true,
        message: 'Height must be between 100 and 600 pixels'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        canvasWidth: Math.round(canvasWidth),
        canvasHeight: Math.round(canvasHeight),
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Update block color
 * PATCH /api/v1/cases/:caseId/notion/blocks/:blockId/color
 */
exports.updateBlockColor = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { blockColor } = req.body;

    const validColors = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];
    if (!validColors.includes(blockColor)) {
      return res.status(400).json({
        error: true,
        message: `Invalid color. Must be one of: ${validColors.join(', ')}`
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        blockColor,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Update block priority
 * PATCH /api/v1/cases/:caseId/notion/blocks/:blockId/priority
 */
exports.updateBlockPriority = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent', null];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid priority. Must be one of: low, medium, high, urgent, or null'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        priority,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Link block to a case event
 * POST /api/v1/cases/:caseId/notion/blocks/:blockId/link-event
 */
exports.linkBlockToEvent = async (req, res) => {
  try {
    const { caseId, blockId } = req.params;
    const { eventId } = req.body;

    // Verify event belongs to this case
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: true, message: 'Case not found' });
    }

    const eventExists = caseDoc.timeline?.some(e => e._id.toString() === eventId);
    if (!eventExists) {
      return res.status(400).json({
        error: true,
        message: 'Event not found in this case'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        linkedEventId: eventId,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Link block to a case task
 * POST /api/v1/cases/:caseId/notion/blocks/:blockId/link-task
 * (Already exists - ensure it sets linkedTaskId field)
 */

/**
 * Link block to a case hearing
 * POST /api/v1/cases/:caseId/notion/blocks/:blockId/link-hearing
 */
exports.linkBlockToHearing = async (req, res) => {
  try {
    const { caseId, blockId } = req.params;
    const { hearingId } = req.body;

    // Verify hearing belongs to this case
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: true, message: 'Case not found' });
    }

    const hearingExists = caseDoc.hearings?.some(h => h._id.toString() === hearingId);
    if (!hearingExists) {
      return res.status(400).json({
        error: true,
        message: 'Hearing not found in this case'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        linkedHearingId: hearingId,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Link block to a case document
 * POST /api/v1/cases/:caseId/notion/blocks/:blockId/link-document
 */
exports.linkBlockToDocument = async (req, res) => {
  try {
    const { caseId, blockId } = req.params;
    const { documentId } = req.body;

    // Verify document belongs to this case
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: true, message: 'Case not found' });
    }

    const documentExists = caseDoc.documents?.some(d => d._id.toString() === documentId);
    if (!documentExists) {
      return res.status(400).json({
        error: true,
        message: 'Document not found in this case'
      });
    }

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        linkedDocumentId: documentId,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Remove all entity links from a block
 * DELETE /api/v1/cases/:caseId/notion/blocks/:blockId/unlink
 */
exports.unlinkBlock = async (req, res) => {
  try {
    const { blockId } = req.params;

    const block = await CaseNotionBlock.findByIdAndUpdate(
      blockId,
      {
        linkedEventId: null,
        linkedTaskId: null,
        linkedHearingId: null,
        linkedDocumentId: null,
        lastEditedBy: req.user._id,
        lastEditedAt: new Date()
      },
      { new: true }
    );

    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### Connection Controller

```javascript
// controllers/caseNotionController.js - ADD these methods

const BlockConnection = require('../models/BlockConnection');

/**
 * Get all connections for a page
 * GET /api/v1/cases/:caseId/notion/pages/:pageId/connections
 */
exports.getConnections = async (req, res) => {
  try {
    const { pageId } = req.params;

    const connections = await BlockConnection.find({ pageId })
      .populate('sourceBlockId', 'type content')
      .populate('targetBlockId', 'type content')
      .populate('createdBy', 'firstName lastName');

    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Create a new connection between blocks
 * POST /api/v1/cases/:caseId/notion/pages/:pageId/connections
 */
exports.createConnection = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { sourceBlockId, targetBlockId, connectionType, label, color } = req.body;

    // Validate required fields
    if (!sourceBlockId || !targetBlockId) {
      return res.status(400).json({
        error: true,
        message: 'sourceBlockId and targetBlockId are required'
      });
    }

    // Prevent self-referencing
    if (sourceBlockId === targetBlockId) {
      return res.status(400).json({
        error: true,
        message: 'Cannot create connection from a block to itself'
      });
    }

    // Check if both blocks exist and belong to this page
    const [sourceBlock, targetBlock] = await Promise.all([
      CaseNotionBlock.findOne({ _id: sourceBlockId, pageId }),
      CaseNotionBlock.findOne({ _id: targetBlockId, pageId })
    ]);

    if (!sourceBlock || !targetBlock) {
      return res.status(400).json({
        error: true,
        message: 'Both blocks must exist and belong to this page'
      });
    }

    // Check for existing connection (in either direction)
    const existingConnection = await BlockConnection.findOne({
      pageId,
      $or: [
        { sourceBlockId, targetBlockId },
        { sourceBlockId: targetBlockId, targetBlockId: sourceBlockId }
      ]
    });

    if (existingConnection) {
      return res.status(409).json({
        error: true,
        message: 'Connection already exists between these blocks'
      });
    }

    const connection = new BlockConnection({
      pageId,
      sourceBlockId,
      targetBlockId,
      connectionType: connectionType || 'arrow',
      label,
      color,
      createdBy: req.user._id
    });

    await connection.save();

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: true,
        message: 'Connection already exists'
      });
    }
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Update a connection
 * PATCH /api/v1/cases/:caseId/notion/connections/:connectionId
 */
exports.updateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { connectionType, label, color } = req.body;

    const updateData = {};
    if (connectionType !== undefined) updateData.connectionType = connectionType;
    if (label !== undefined) updateData.label = label;
    if (color !== undefined) updateData.color = color;

    const connection = await BlockConnection.findByIdAndUpdate(
      connectionId,
      updateData,
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ error: true, message: 'Connection not found' });
    }

    res.json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Delete a connection
 * DELETE /api/v1/cases/:caseId/notion/connections/:connectionId
 */
exports.deleteConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await BlockConnection.findByIdAndDelete(connectionId);

    if (!connection) {
      return res.status(404).json({ error: true, message: 'Connection not found' });
    }

    res.json({ success: true, message: 'Connection deleted' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Delete all connections for a block (called when block is deleted)
 */
exports.deleteBlockConnections = async (blockId) => {
  await BlockConnection.deleteMany({
    $or: [
      { sourceBlockId: blockId },
      { targetBlockId: blockId }
    ]
  });
};
```

### Page View Mode Controller

```javascript
// controllers/caseNotionController.js - ADD these methods

/**
 * Update page view mode
 * PATCH /api/v1/cases/:caseId/notion/pages/:pageId/view-mode
 */
exports.updateViewMode = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { viewMode } = req.body;

    if (!['document', 'whiteboard'].includes(viewMode)) {
      return res.status(400).json({
        error: true,
        message: 'viewMode must be either "document" or "whiteboard"'
      });
    }

    const page = await CaseNotionPage.findByIdAndUpdate(
      pageId,
      {
        viewMode,
        lastEditedBy: req.user._id
      },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({ error: true, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

/**
 * Update whiteboard configuration
 * PATCH /api/v1/cases/:caseId/notion/pages/:pageId/whiteboard-config
 */
exports.updateWhiteboardConfig = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { canvasWidth, canvasHeight, zoom, panX, panY, gridEnabled, snapToGrid, gridSize } = req.body;

    const page = await CaseNotionPage.findById(pageId);
    if (!page) {
      return res.status(404).json({ error: true, message: 'Page not found' });
    }

    // Merge with existing config
    const whiteboardConfig = {
      ...page.whiteboardConfig?.toObject?.() || {},
    };

    if (canvasWidth !== undefined) whiteboardConfig.canvasWidth = canvasWidth;
    if (canvasHeight !== undefined) whiteboardConfig.canvasHeight = canvasHeight;
    if (zoom !== undefined) whiteboardConfig.zoom = Math.max(0.25, Math.min(2, zoom));
    if (panX !== undefined) whiteboardConfig.panX = panX;
    if (panY !== undefined) whiteboardConfig.panY = panY;
    if (gridEnabled !== undefined) whiteboardConfig.gridEnabled = gridEnabled;
    if (snapToGrid !== undefined) whiteboardConfig.snapToGrid = snapToGrid;
    if (gridSize !== undefined) whiteboardConfig.gridSize = Math.max(10, Math.min(50, gridSize));

    page.whiteboardConfig = whiteboardConfig;
    page.lastEditedBy = req.user._id;
    await page.save();

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

### Update Routes

```javascript
// routes/caseNotion.js - ADD these routes

// Block position/properties
router.patch('/cases/:caseId/notion/blocks/:blockId/position', auth, canAccessCase, caseNotionController.updateBlockPosition);
router.patch('/cases/:caseId/notion/blocks/:blockId/size', auth, canAccessCase, caseNotionController.updateBlockSize);
router.patch('/cases/:caseId/notion/blocks/:blockId/color', auth, canAccessCase, caseNotionController.updateBlockColor);
router.patch('/cases/:caseId/notion/blocks/:blockId/priority', auth, canAccessCase, caseNotionController.updateBlockPriority);

// Block entity linking
router.post('/cases/:caseId/notion/blocks/:blockId/link-event', auth, canAccessCase, caseNotionController.linkBlockToEvent);
router.post('/cases/:caseId/notion/blocks/:blockId/link-hearing', auth, canAccessCase, caseNotionController.linkBlockToHearing);
router.post('/cases/:caseId/notion/blocks/:blockId/link-document', auth, canAccessCase, caseNotionController.linkBlockToDocument);
router.delete('/cases/:caseId/notion/blocks/:blockId/unlink', auth, canAccessCase, caseNotionController.unlinkBlock);

// Connections
router.get('/cases/:caseId/notion/pages/:pageId/connections', auth, canAccessCase, caseNotionController.getConnections);
router.post('/cases/:caseId/notion/pages/:pageId/connections', auth, canAccessCase, caseNotionController.createConnection);
router.patch('/cases/:caseId/notion/connections/:connectionId', auth, canAccessCase, caseNotionController.updateConnection);
router.delete('/cases/:caseId/notion/connections/:connectionId', auth, canAccessCase, caseNotionController.deleteConnection);

// Page view mode
router.patch('/cases/:caseId/notion/pages/:pageId/view-mode', auth, canAccessCase, caseNotionController.updateViewMode);
router.patch('/cases/:caseId/notion/pages/:pageId/whiteboard-config', auth, canAccessCase, caseNotionController.updateWhiteboardConfig);
```

---

## Update Existing Block Endpoint

**IMPORTANT**: Update the existing `updateBlock` endpoint to handle the new properties:

```javascript
// In updateBlock method - handle whiteboard properties in the 'properties' field
exports.updateBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { content, type, properties } = req.body;

    const block = await CaseNotionBlock.findById(blockId);
    if (!block) {
      return res.status(404).json({ error: true, message: 'Block not found' });
    }

    // Build update object
    const updateData = {
      lastEditedBy: req.user._id,
      lastEditedAt: new Date()
    };

    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;

    // Handle whiteboard properties from 'properties' field
    if (properties) {
      if (properties.canvasX !== undefined) updateData.canvasX = properties.canvasX;
      if (properties.canvasY !== undefined) updateData.canvasY = properties.canvasY;
      if (properties.canvasWidth !== undefined) updateData.canvasWidth = properties.canvasWidth;
      if (properties.canvasHeight !== undefined) updateData.canvasHeight = properties.canvasHeight;
      if (properties.blockColor !== undefined) updateData.blockColor = properties.blockColor;
      if (properties.priority !== undefined) updateData.priority = properties.priority;
      if (properties.linkedEventId !== undefined) updateData.linkedEventId = properties.linkedEventId;
      if (properties.linkedTaskId !== undefined) updateData.linkedTaskId = properties.linkedTaskId;
      if (properties.linkedHearingId !== undefined) updateData.linkedHearingId = properties.linkedHearingId;
      if (properties.linkedDocumentId !== undefined) updateData.linkedDocumentId = properties.linkedDocumentId;
      if (properties.eventDate !== undefined) updateData.eventDate = properties.eventDate;
      if (properties.partyType !== undefined) updateData.partyType = properties.partyType;
      if (properties.evidenceType !== undefined) updateData.evidenceType = properties.evidenceType;
    }

    Object.assign(block, updateData);
    await block.save();

    res.json({ success: true, data: block });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

---

## Request/Response Examples

### Update Block Position

**Request:**
```http
PATCH /api/v1/cases/6926b5d06fbe980abbc0465a/notion/blocks/674a1b2c3d4e5f6g7h8i9j0k/position
Authorization: Bearer <token>
Content-Type: application/json

{
  "canvasX": 350,
  "canvasY": 200
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "type": "text",
    "content": [...],
    "canvasX": 350,
    "canvasY": 200,
    "canvasWidth": 200,
    "canvasHeight": 150,
    "blockColor": "default"
  }
}
```

### Create Connection

**Request:**
```http
POST /api/v1/cases/6926b5d06fbe980abbc0465a/notion/pages/674a1b2c3d4e5f/connections
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceBlockId": "674a1b2c3d4e5f6g7h8i9j0k",
  "targetBlockId": "674a1b2c3d4e5f6g7h8i9j0l",
  "connectionType": "arrow",
  "label": "leads to"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "conn123abc",
    "pageId": "674a1b2c3d4e5f",
    "sourceBlockId": "674a1b2c3d4e5f6g7h8i9j0k",
    "targetBlockId": "674a1b2c3d4e5f6g7h8i9j0l",
    "connectionType": "arrow",
    "label": "leads to",
    "color": "#6b7280",
    "createdAt": "2024-02-10T10:00:00.000Z"
  }
}
```

### Link Block to Event

**Request:**
```http
POST /api/v1/cases/6926b5d06fbe980abbc0465a/notion/blocks/674a1b2c3d4e5f6g7h8i9j0k/link-event
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event123abc"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6g7h8i9j0k",
    "type": "text",
    "linkedEventId": "event123abc",
    "linkedTaskId": null,
    "linkedHearingId": null,
    "linkedDocumentId": null
  }
}
```

### Update Whiteboard Config

**Request:**
```http
PATCH /api/v1/cases/6926b5d06fbe980abbc0465a/notion/pages/674a1b2c3d4e5f/whiteboard-config
Authorization: Bearer <token>
Content-Type: application/json

{
  "zoom": 0.75,
  "panX": -200,
  "panY": -100,
  "snapToGrid": true,
  "gridSize": 20
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f",
    "viewMode": "whiteboard",
    "whiteboardConfig": {
      "canvasWidth": 5000,
      "canvasHeight": 5000,
      "zoom": 0.75,
      "panX": -200,
      "panY": -100,
      "gridEnabled": true,
      "snapToGrid": true,
      "gridSize": 20
    }
  }
}
```

---

## Update getPage Endpoint

**IMPORTANT**: Update `getPage` to include connections:

```javascript
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
      .populate('lastEditedBy', 'firstName lastName')
      .populate('linkedEventId')
      .populate('linkedTaskId')
      .populate('linkedHearingId')
      .populate('linkedDocumentId');

    // Get connections for this page (NEW)
    const connections = await BlockConnection.find({ pageId });

    res.json({
      success: true,
      data: {
        ...page.toObject(),
        blocks,
        connections // Include connections in response
      }
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
```

---

## Migration Guide

### Database Migration Script

Run this script to add default values to existing blocks:

```javascript
// migrations/add-whiteboard-fields.js
const mongoose = require('mongoose');
const CaseNotionBlock = require('../models/CaseNotionBlock');

async function migrate() {
  console.log('Starting whiteboard fields migration...');

  // Add default canvas values to existing blocks
  const result = await CaseNotionBlock.updateMany(
    { canvasX: { $exists: false } },
    {
      $set: {
        canvasX: 0,
        canvasY: 0,
        canvasWidth: 200,
        canvasHeight: 150,
        blockColor: 'default',
        priority: null,
        linkedEventId: null,
        linkedTaskId: null,
        linkedHearingId: null,
        linkedDocumentId: null
      }
    }
  );

  console.log(`Updated ${result.modifiedCount} blocks with whiteboard fields`);

  // Add default viewMode to existing pages
  const CaseNotionPage = require('../models/CaseNotionPage');
  const pageResult = await CaseNotionPage.updateMany(
    { viewMode: { $exists: false } },
    {
      $set: {
        viewMode: 'document',
        whiteboardConfig: {
          canvasWidth: 5000,
          canvasHeight: 5000,
          zoom: 1,
          panX: 0,
          panY: 0,
          gridEnabled: true,
          snapToGrid: true,
          gridSize: 20
        }
      }
    }
  );

  console.log(`Updated ${pageResult.modifiedCount} pages with viewMode fields`);
  console.log('Migration complete!');
}

migrate().catch(console.error);
```

---

## Summary Checklist

### Backend Developer Checklist

- [ ] Update `CaseNotionBlock` model with canvas/whiteboard fields
- [ ] Create `BlockConnection` model
- [ ] Update `CaseNotionPage` model with viewMode and whiteboardConfig
- [ ] Add position/size/color/priority endpoints
- [ ] Add entity linking endpoints
- [ ] Add connection CRUD endpoints
- [ ] Add view mode and whiteboard config endpoints
- [ ] Update `getPage` to include connections
- [ ] Update `updateBlock` to handle properties object
- [ ] Update `deleteBlock` to cascade delete connections
- [ ] Run migration script for existing data
- [ ] Add indexes for performance

### Color Reference

The frontend expects these color values:

| Color | Background Class | Border Class |
|-------|------------------|--------------|
| `default` | bg-white | border-slate-200 |
| `red` | bg-red-50 | border-red-200 |
| `orange` | bg-orange-50 | border-orange-200 |
| `yellow` | bg-yellow-50 | border-yellow-200 |
| `green` | bg-green-50 | border-green-200 |
| `blue` | bg-blue-50 | border-blue-200 |
| `purple` | bg-purple-50 | border-purple-200 |
| `pink` | bg-pink-50 | border-pink-200 |
| `gray` | bg-gray-100 | border-gray-300 |

### Priority Reference

| Priority | Color |
|----------|-------|
| `low` | Green |
| `medium` | Yellow |
| `high` | Orange |
| `urgent` | Red |

---

## Frontend Service Methods Used

The frontend makes these API calls (ensure backend supports them):

```typescript
// Block operations
caseNotionService.createBlock(caseId, pageId, data)
// data includes: pageId, type, content, properties: { canvasX, canvasY, canvasWidth, canvasHeight, linkedEventId, ... }

caseNotionService.updateBlock(caseId, blockId, data)
// data includes: content, type, properties: { canvasX, canvasY, canvasWidth, canvasHeight, blockColor, priority, linkedEventId, ... }

caseNotionService.deleteBlock(caseId, blockId)
// Should cascade delete all connections

// Page operations
caseNotionService.updatePage(caseId, pageId, data)
// data can include: viewMode, whiteboardConfig, connections (array)
```

The frontend is ready - implement these backend changes to enable the full whiteboard functionality!

---

## Critical Implementation Notes

### ⚠️ IMPORTANT: Data Structure for Position Updates

The frontend sends position updates in two formats. Your backend MUST handle both:

**Format 1: Direct top-level fields (PREFERRED)**
```javascript
// PATCH /api/v1/cases/:caseId/notion/blocks/:blockId
{
  "canvasX": 350,
  "canvasY": 200
}
```

**Format 2: Nested in data object**
```javascript
// This is how the frontend mutation sends it
{
  "data": {
    "canvasX": 350,
    "canvasY": 200
  }
}
```

**Backend Handler Must Support Both:**
```javascript
exports.updateBlock = async (req, res) => {
  const { blockId } = req.params;

  // Handle both formats
  const data = req.body.data || req.body;

  const updateData = {
    lastEditedBy: req.user._id,
    lastEditedAt: new Date()
  };

  // Extract whiteboard fields from wherever they are
  if (data.canvasX !== undefined) updateData.canvasX = data.canvasX;
  if (data.canvasY !== undefined) updateData.canvasY = data.canvasY;
  if (data.canvasWidth !== undefined) updateData.canvasWidth = data.canvasWidth;
  if (data.canvasHeight !== undefined) updateData.canvasHeight = data.canvasHeight;
  if (data.blockColor !== undefined) updateData.blockColor = data.blockColor;
  if (data.priority !== undefined) updateData.priority = data.priority;

  // Also check nested 'properties' for backwards compatibility
  if (data.properties) {
    if (data.properties.canvasX !== undefined) updateData.canvasX = data.properties.canvasX;
    if (data.properties.canvasY !== undefined) updateData.canvasY = data.properties.canvasY;
    if (data.properties.canvasWidth !== undefined) updateData.canvasWidth = data.properties.canvasWidth;
    if (data.properties.canvasHeight !== undefined) updateData.canvasHeight = data.properties.canvasHeight;
  }

  const block = await CaseNotionBlock.findByIdAndUpdate(blockId, updateData, { new: true });
  res.json({ success: true, data: block });
};
```

### ⚠️ Frontend Debounces Position Updates

The frontend debounces drag operations (300ms delay). This means:
- During a drag, you'll receive ONE update at the end, not continuous updates
- This reduces server load significantly
- Don't implement rate limiting that would reject these updates

### ⚠️ Connection Cascade Delete

When a block is deleted, ALL its connections must be deleted too:

```javascript
exports.deleteBlock = async (req, res) => {
  const { blockId } = req.params;

  // First, delete all connections involving this block
  await BlockConnection.deleteMany({
    $or: [
      { sourceBlockId: blockId },
      { targetBlockId: blockId }
    ]
  });

  // Then delete the block
  const block = await CaseNotionBlock.findByIdAndDelete(blockId);

  res.json({ success: true, message: 'Block and connections deleted' });
};
```

### ⚠️ Include Connections in Page Response

When fetching a page, ALWAYS include its connections:

```javascript
exports.getPage = async (req, res) => {
  const { pageId } = req.params;

  const page = await CaseNotionPage.findById(pageId);
  const blocks = await CaseNotionBlock.find({ pageId });
  const connections = await BlockConnection.find({ pageId }); // CRITICAL!

  res.json({
    success: true,
    data: {
      ...page.toObject(),
      blocks,
      connections  // Frontend expects this!
    }
  });
};
```

### Performance Optimization Tips

From studying the GitHub repos, here are performance tips:

1. **Batch Updates**: Allow batch position updates for moving multiple blocks
2. **Minimal Responses**: Only return changed fields, not entire objects
3. **Indexed Queries**: Add indexes on `pageId`, `canvasX`, `canvasY`
4. **WebSocket for Real-time**: Consider WebSocket for live collaboration (like tldraw)

### Testing the Implementation

After implementing, test these scenarios:

1. **Create block** → Verify it has default `canvasX: 0, canvasY: 0`
2. **Move block** → Verify position updates persist
3. **Resize block** → Verify width/height updates persist
4. **Create connection** → Verify it links two blocks
5. **Delete block** → Verify associated connections are deleted
6. **Fetch page** → Verify blocks AND connections are returned

### API Summary Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `PUT /blocks/:blockId` | PATCH | Update block (position, size, color, etc.) |
| `GET /pages/:pageId` | GET | Get page with blocks AND connections |
| `POST /pages/:pageId/connections` | POST | Create connection between blocks |
| `DELETE /connections/:connectionId` | DELETE | Delete a connection |
| `DELETE /blocks/:blockId` | DELETE | Delete block (cascade delete connections!) |
| `PATCH /pages/:pageId/whiteboard-config` | PATCH | Update viewport (zoom, pan) |

---

## Questions?

If you have questions about the implementation, refer to the GitHub repos listed above. They contain production-tested solutions for every scenario you'll encounter.
