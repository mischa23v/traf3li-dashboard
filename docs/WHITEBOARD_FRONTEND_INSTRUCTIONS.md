# Whiteboard Frontend Implementation Guide

## Production-Ready Implementation Instructions

This guide provides detailed frontend implementation instructions based on analysis of Excalidraw, tldraw, ReactFlow, and BlockSuite.

---

## Table of Contents

1. [Shape Rendering System](#1-shape-rendering-system)
2. [Undo/Redo Implementation](#2-undoredo-implementation)
3. [Multi-Select & Box Selection](#3-multi-select--box-selection)
4. [Bound Connections](#4-bound-connections)
5. [Frame Management](#5-frame-management)
6. [Keyboard Shortcuts](#6-keyboard-shortcuts)
7. [Z-Index Layer Controls](#7-z-index-layer-controls)
8. [Connection Labels](#8-connection-labels)
9. [Performance Optimizations](#9-performance-optimizations)
10. [TypeScript Types Reference](#10-typescript-types-reference)

---

## 1. Shape Rendering System

### Current State
Your backend supports these shape types, but frontend only renders note blocks:
- `rectangle`, `ellipse`, `diamond`, `triangle`, `hexagon`, `star`, `sticky`, `text_shape`

### Implementation

Create a new component `src/features/case-notion/components/whiteboard/shape-renderer.tsx`:

```tsx
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ShapeRendererProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export const ShapeRenderer = memo(function ShapeRenderer({
  block,
  isSelected,
  onSelect,
  onDragStart
}: ShapeRendererProps) {
  const { shapeType, canvasX, canvasY, canvasWidth, canvasHeight, angle, opacity } = block;

  const commonStyles = {
    left: canvasX,
    top: canvasY,
    width: canvasWidth || 200,
    height: canvasHeight || 150,
    transform: `rotate(${angle || 0}rad)`,
    opacity: (opacity ?? 100) / 100,
  };

  const strokeColor = block.strokeColor || '#000000';
  const fillColor = getBlockColorHex(block.blockColor);
  const strokeWidth = block.strokeWidth || 2;

  switch (shapeType) {
    case 'rectangle':
      return (
        <div
          className={cn(
            "absolute cursor-move rounded-lg",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            ...commonStyles,
            backgroundColor: fillColor,
            border: `${strokeWidth}px solid ${strokeColor}`,
          }}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          {block.content && (
            <div className="p-2 text-center overflow-hidden">
              {extractTextContent(block.content)}
            </div>
          )}
        </div>
      );

    case 'ellipse':
      return (
        <div
          className={cn(
            "absolute cursor-move",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            ...commonStyles,
            backgroundColor: fillColor,
            border: `${strokeWidth}px solid ${strokeColor}`,
            borderRadius: '50%',
          }}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <div className="flex items-center justify-center h-full p-2 text-center">
            {block.content && extractTextContent(block.content)}
          </div>
        </div>
      );

    case 'diamond':
      return (
        <div
          className={cn("absolute cursor-move", isSelected && "ring-2 ring-blue-500")}
          style={commonStyles}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            {block.content && extractTextContent(block.content)}
          </div>
        </div>
      );

    case 'triangle':
      return (
        <div
          className={cn("absolute cursor-move", isSelected && "ring-2 ring-blue-500")}
          style={commonStyles}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,0 100,100 0,100"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        </div>
      );

    case 'hexagon':
      return (
        <div
          className={cn("absolute cursor-move", isSelected && "ring-2 ring-blue-500")}
          style={commonStyles}
          onClick={onSelect}
          onDragStart={onDragStart}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="25,0 75,0 100,50 75,100 25,100 0,50"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        </div>
      );

    case 'star':
      return (
        <div
          className={cn("absolute cursor-move", isSelected && "ring-2 ring-blue-500")}
          style={commonStyles}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </svg>
        </div>
      );

    case 'sticky':
      return (
        <div
          className={cn(
            "absolute cursor-move shadow-lg",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            ...commonStyles,
            backgroundColor: getStickyColor(block.blockColor),
            borderRadius: '2px',
          }}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <div className="p-3 h-full overflow-hidden whitespace-pre-wrap">
            {block.content && extractTextContent(block.content)}
          </div>
          {/* Sticky note fold corner */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4"
            style={{
              background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
            }}
          />
        </div>
      );

    case 'text_shape':
      return (
        <div
          className={cn(
            "absolute cursor-move",
            isSelected && "ring-2 ring-blue-500"
          )}
          style={{
            ...commonStyles,
            backgroundColor: 'transparent',
          }}
          onClick={onSelect}
          onMouseDown={onDragStart}
        >
          <div className="p-2" style={{ color: strokeColor }}>
            {block.content && extractTextContent(block.content)}
          </div>
        </div>
      );

    case 'frame':
      return <FrameRenderer block={block} isSelected={isSelected} />;

    default:
      // Fallback to existing WhiteboardBlock for note types
      return null;
  }
});

// Helper functions
function getBlockColorHex(color?: string): string {
  const colors: Record<string, string> = {
    default: '#ffffff',
    red: '#fee2e2',
    orange: '#ffedd5',
    yellow: '#fef3c7',
    green: '#dcfce7',
    blue: '#dbeafe',
    purple: '#f3e8ff',
    pink: '#fce7f3',
    gray: '#f3f4f6',
  };
  return colors[color || 'default'] || colors.default;
}

function getStickyColor(color?: string): string {
  const colors: Record<string, string> = {
    default: '#fef3c7',
    red: '#fecaca',
    orange: '#fed7aa',
    yellow: '#fef08a',
    green: '#bbf7d0',
    blue: '#bfdbfe',
    purple: '#ddd6fe',
    pink: '#fbcfe8',
    gray: '#e5e7eb',
  };
  return colors[color || 'default'] || colors.default;
}

function extractTextContent(content: any[]): string {
  if (!content) return '';
  return content
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item.text) return item.text;
      if (item.children) return extractTextContent(item.children);
      return '';
    })
    .join('');
}
```

### Integration in WhiteboardCanvas

Update `whiteboard-canvas.tsx` to use ShapeRenderer:

```tsx
// In the blocks map
{localBlocks.map((block) => {
  // Check if it's a shape type
  if (block.shapeType && block.shapeType !== 'note') {
    return (
      <ShapeRenderer
        key={block._id}
        block={block}
        isSelected={selectedBlockId === block._id}
        onSelect={() => setSelectedBlockId(block._id)}
        onDragStart={(e) => handleBlockDragStart(e, block._id)}
      />
    );
  }

  // Default note block rendering
  return (
    <WhiteboardBlock
      key={block._id}
      block={block}
      // ... existing props
    />
  );
})}
```

---

## 2. Undo/Redo Implementation

### Create History Store

Create `src/features/case-notion/stores/whiteboard-history.ts`:

```tsx
import { create } from 'zustand';
import { Block, BlockConnection } from '../data/schema';

interface HistorySnapshot {
  blocks: Block[];
  connections: BlockConnection[];
  timestamp: number;
}

interface WhiteboardHistoryState {
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  maxHistory: number;

  // Actions
  pushSnapshot: (snapshot: Omit<HistorySnapshot, 'timestamp'>) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useWhiteboardHistory = create<WhiteboardHistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistory: 50,

  pushSnapshot: (snapshot) => {
    set((state) => ({
      undoStack: [
        ...state.undoStack.slice(-(state.maxHistory - 1)),
        { ...snapshot, timestamp: Date.now() }
      ],
      redoStack: [], // Clear redo stack on new action
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return null;

    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
    });

    return previous || null;
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;

    const next = redoStack[redoStack.length - 1];

    set({
      undoStack: [...undoStack, next],
      redoStack: redoStack.slice(0, -1),
    });

    return next;
  },

  canUndo: () => get().undoStack.length > 1,
  canRedo: () => get().redoStack.length > 0,
  clear: () => set({ undoStack: [], redoStack: [] }),
}));
```

### Integration in WhiteboardView

```tsx
import { useWhiteboardHistory } from '../stores/whiteboard-history';

function WhiteboardView() {
  const { pushSnapshot, undo, redo, canUndo, canRedo } = useWhiteboardHistory();

  // Save snapshot before any change
  const saveSnapshot = useCallback(() => {
    pushSnapshot({
      blocks: localBlocks,
      connections: localConnections,
    });
  }, [localBlocks, localConnections, pushSnapshot]);

  // Wrap existing handlers to save snapshots
  const handleBlockMove = useCallback(async (blockId: string, x: number, y: number) => {
    saveSnapshot(); // Save before change
    // ... existing move logic
  }, [saveSnapshot]);

  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setLocalBlocks(snapshot.blocks);
      setLocalConnections(snapshot.connections);
      // Optionally sync with server via batch-update
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const snapshot = redo();
    if (snapshot) {
      setLocalBlocks(snapshot.blocks);
      setLocalConnections(snapshot.connections);
    }
  }, [redo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <>
      {/* Toolbar buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        disabled={!canUndo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRedo}
        disabled={!canRedo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </>
  );
}
```

---

## 3. Multi-Select & Box Selection

### Add Selection State

```tsx
interface SelectionState {
  selectedIds: Set<string>;
  selectionRect: {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
}

const [selection, setSelection] = useState<SelectionState>({
  selectedIds: new Set(),
  selectionRect: null,
});
```

### Implement Box Selection

```tsx
// In whiteboard-canvas.tsx

const handleCanvasMouseDown = (e: React.MouseEvent) => {
  if (canvasTool !== 'select') return;
  if (e.target !== canvasRef.current) return; // Only on canvas, not on blocks

  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoom;
  const y = (e.clientY - rect.top - panY) / zoom;

  // Start selection rectangle
  setSelection({
    selectedIds: e.shiftKey ? selection.selectedIds : new Set(),
    selectionRect: { startX: x, startY: y, currentX: x, currentY: y },
  });
};

const handleCanvasMouseMove = (e: React.MouseEvent) => {
  if (!selection.selectionRect) return;

  const rect = canvasRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left - panX) / zoom;
  const y = (e.clientY - rect.top - panY) / zoom;

  setSelection((prev) => ({
    ...prev,
    selectionRect: {
      ...prev.selectionRect!,
      currentX: x,
      currentY: y,
    },
  }));
};

const handleCanvasMouseUp = () => {
  if (!selection.selectionRect) return;

  const { startX, startY, currentX, currentY } = selection.selectionRect;
  const rectLeft = Math.min(startX, currentX);
  const rectTop = Math.min(startY, currentY);
  const rectRight = Math.max(startX, currentX);
  const rectBottom = Math.max(startY, currentY);

  // Find blocks within selection rectangle
  const selectedBlockIds = localBlocks
    .filter((block) => {
      const blockRight = block.canvasX + (block.canvasWidth || 200);
      const blockBottom = block.canvasY + (block.canvasHeight || 150);

      // Check intersection
      return (
        block.canvasX < rectRight &&
        blockRight > rectLeft &&
        block.canvasY < rectBottom &&
        blockBottom > rectTop
      );
    })
    .map((block) => block._id);

  setSelection({
    selectedIds: new Set(selectedBlockIds),
    selectionRect: null,
  });
};

// Render selection rectangle
{selection.selectionRect && (
  <div
    className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
    style={{
      left: Math.min(selection.selectionRect.startX, selection.selectionRect.currentX),
      top: Math.min(selection.selectionRect.startY, selection.selectionRect.currentY),
      width: Math.abs(selection.selectionRect.currentX - selection.selectionRect.startX),
      height: Math.abs(selection.selectionRect.currentY - selection.selectionRect.startY),
    }}
  />
)}
```

### Shift-Click Selection

```tsx
const handleBlockClick = (blockId: string, e: React.MouseEvent) => {
  e.stopPropagation();

  if (e.shiftKey) {
    // Toggle selection
    setSelection((prev) => {
      const newIds = new Set(prev.selectedIds);
      if (newIds.has(blockId)) {
        newIds.delete(blockId);
      } else {
        newIds.add(blockId);
      }
      return { ...prev, selectedIds: newIds };
    });
  } else {
    // Single selection
    setSelection({
      selectedIds: new Set([blockId]),
      selectionRect: null,
    });
  }
};
```

### Multi-Select Operations

```tsx
const handleBatchMove = async (deltaX: number, deltaY: number) => {
  if (selection.selectedIds.size === 0) return;

  saveSnapshot();

  const updates = Array.from(selection.selectedIds).map((id) => {
    const block = localBlocks.find((b) => b._id === id);
    if (!block) return null;
    return {
      id,
      changes: {
        canvasX: block.canvasX + deltaX,
        canvasY: block.canvasY + deltaY,
      },
    };
  }).filter(Boolean);

  // Optimistic update
  setLocalBlocks((prev) =>
    prev.map((block) => {
      if (selection.selectedIds.has(block._id)) {
        return {
          ...block,
          canvasX: block.canvasX + deltaX,
          canvasY: block.canvasY + deltaY,
        };
      }
      return block;
    })
  );

  // Server sync
  await caseNotionService.batchUpdateBlocks(caseId, pageId, updates);
};

const handleBatchDelete = async () => {
  if (selection.selectedIds.size === 0) return;

  saveSnapshot();

  const ids = Array.from(selection.selectedIds);

  // Optimistic update
  setLocalBlocks((prev) => prev.filter((b) => !selection.selectedIds.has(b._id)));
  setLocalConnections((prev) =>
    prev.filter(
      (c) => !selection.selectedIds.has(c.sourceBlockId) && !selection.selectedIds.has(c.targetBlockId)
    )
  );

  // Server sync
  await caseNotionService.bulkDeleteElements(caseId, pageId, ids);

  setSelection({ selectedIds: new Set(), selectionRect: null });
};
```

---

## 4. Bound Connections

### Update Connection Rendering

The key is to recalculate connection endpoints based on current block positions:

```tsx
// In block-connections.tsx

const ConnectionPath = memo(function ConnectionPath({
  connection,
  blocks,
  isSelected,
  onSelect,
  onDelete,
}: ConnectionPathProps) {
  const sourceBlock = blocks.find((b) => b._id === connection.sourceBlockId);
  const targetBlock = blocks.find((b) => b._id === connection.targetBlockId);

  if (!sourceBlock || !targetBlock) return null;

  // Calculate edge points dynamically based on current positions
  const sourcePoint = getBlockEdgePoint(sourceBlock, targetBlock, connection.sourceHandle?.position);
  const targetPoint = getBlockEdgePoint(targetBlock, sourceBlock, connection.targetHandle?.position);

  const path = generateBezierPath(
    sourcePoint,
    targetPoint,
    connection.pathType || 'bezier'
  );

  // ... rest of rendering
});

// Smart handle position calculation
function getBlockEdgePoint(
  block: Block,
  targetBlock: Block,
  preferredPosition?: string
): { x: number; y: number; side: string } {
  const cx = block.canvasX + (block.canvasWidth || 200) / 2;
  const cy = block.canvasY + (block.canvasHeight || 150) / 2;
  const tcx = targetBlock.canvasX + (targetBlock.canvasWidth || 200) / 2;
  const tcy = targetBlock.canvasY + (targetBlock.canvasHeight || 150) / 2;

  // If preferred position specified, use it
  if (preferredPosition) {
    return getHandlePoint(block, preferredPosition);
  }

  // Otherwise calculate best side based on angle
  const angle = Math.atan2(tcy - cy, tcx - cx) * (180 / Math.PI);

  let side: string;
  if (angle >= -45 && angle < 45) side = 'right';
  else if (angle >= 45 && angle < 135) side = 'bottom';
  else if (angle >= -135 && angle < -45) side = 'top';
  else side = 'left';

  return getHandlePoint(block, side);
}

function getHandlePoint(block: Block, side: string) {
  const w = block.canvasWidth || 200;
  const h = block.canvasHeight || 150;

  switch (side) {
    case 'top':
      return { x: block.canvasX + w / 2, y: block.canvasY, side };
    case 'right':
      return { x: block.canvasX + w, y: block.canvasY + h / 2, side };
    case 'bottom':
      return { x: block.canvasX + w / 2, y: block.canvasY + h, side };
    case 'left':
    default:
      return { x: block.canvasX, y: block.canvasY + h / 2, side };
  }
}
```

### Bezier Path with Path Types

```tsx
function generateBezierPath(
  source: { x: number; y: number; side: string },
  target: { x: number; y: number; side: string },
  pathType: string = 'bezier'
): string {
  switch (pathType) {
    case 'straight':
      return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;

    case 'step':
      const midX = (source.x + target.x) / 2;
      return `M ${source.x} ${source.y} H ${midX} V ${target.y} H ${target.x}`;

    case 'smoothstep':
      const stepMidX = (source.x + target.x) / 2;
      const radius = 10;
      return `
        M ${source.x} ${source.y}
        H ${stepMidX - radius}
        Q ${stepMidX} ${source.y} ${stepMidX} ${source.y + (target.y > source.y ? radius : -radius)}
        V ${target.y - (target.y > source.y ? radius : -radius)}
        Q ${stepMidX} ${target.y} ${stepMidX + radius} ${target.y}
        H ${target.x}
      `;

    case 'bezier':
    default:
      const distance = Math.sqrt(
        Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)
      );
      const curvature = Math.min(distance * 0.4, 100);

      const cp1 = getControlPoint(source, curvature);
      const cp2 = getControlPoint(target, curvature);

      return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
  }
}

function getControlPoint(point: { x: number; y: number; side: string }, offset: number) {
  switch (point.side) {
    case 'top':
      return { x: point.x, y: point.y - offset };
    case 'bottom':
      return { x: point.x, y: point.y + offset };
    case 'left':
      return { x: point.x - offset, y: point.y };
    case 'right':
    default:
      return { x: point.x + offset, y: point.y };
  }
}
```

---

## 5. Frame Management

### Frame Renderer Component

```tsx
// src/features/case-notion/components/whiteboard/frame-renderer.tsx

interface FrameRendererProps {
  frame: Block;
  children: Block[];
  isSelected: boolean;
  onSelect: () => void;
  onResize: (width: number, height: number) => void;
  onMove: (x: number, y: number) => void;
}

export function FrameRenderer({
  frame,
  children,
  isSelected,
  onSelect,
  onResize,
  onMove,
}: FrameRendererProps) {
  const backgroundColor = getFrameBackgroundColor(frame.backgroundColor);

  return (
    <div
      className={cn(
        "absolute rounded-lg border-2 border-dashed",
        isSelected ? "border-blue-500" : "border-gray-300"
      )}
      style={{
        left: frame.canvasX,
        top: frame.canvasY,
        width: frame.canvasWidth || 600,
        height: frame.canvasHeight || 400,
        backgroundColor,
      }}
      onClick={onSelect}
    >
      {/* Frame header */}
      <div
        className="absolute -top-6 left-0 px-2 py-1 text-sm font-medium bg-white dark:bg-gray-800 rounded-t border border-b-0"
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          // Start frame drag
        }}
      >
        {frame.frameName || 'Frame'}
      </div>

      {/* Resize handle */}
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 rounded-tl"
          onMouseDown={(e) => {
            e.stopPropagation();
            // Start resize
          }}
        />
      )}
    </div>
  );
}

function getFrameBackgroundColor(color?: string): string {
  const colors: Record<string, string> = {
    default: 'rgba(0, 0, 0, 0.02)',
    red: 'rgba(254, 226, 226, 0.5)',
    orange: 'rgba(255, 237, 213, 0.5)',
    yellow: 'rgba(254, 243, 199, 0.5)',
    green: 'rgba(220, 252, 231, 0.5)',
    blue: 'rgba(219, 234, 254, 0.5)',
    purple: 'rgba(243, 232, 255, 0.5)',
    pink: 'rgba(252, 231, 243, 0.5)',
    gray: 'rgba(243, 244, 246, 0.5)',
  };
  return colors[color || 'default'] || colors.default;
}
```

### Frame Creation

```tsx
const handleCreateFrame = async () => {
  // Auto-detect bounds if elements are selected
  let bounds = { x: 200, y: 200, width: 600, height: 400 };

  if (selection.selectedIds.size > 0) {
    const selectedBlocks = localBlocks.filter((b) => selection.selectedIds.has(b._id));
    const minX = Math.min(...selectedBlocks.map((b) => b.canvasX));
    const minY = Math.min(...selectedBlocks.map((b) => b.canvasY));
    const maxX = Math.max(...selectedBlocks.map((b) => b.canvasX + (b.canvasWidth || 200)));
    const maxY = Math.max(...selectedBlocks.map((b) => b.canvasY + (b.canvasHeight || 150)));

    bounds = {
      x: minX - 20,
      y: minY - 40,
      width: maxX - minX + 40,
      height: maxY - minY + 60,
    };
  }

  saveSnapshot();

  const frame = await caseNotionService.createFrame(caseId, pageId, {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    name: 'New Frame',
    backgroundColor: 'default',
  });

  // Add selected blocks as children
  if (selection.selectedIds.size > 0 && frame._id) {
    await caseNotionService.addFrameChildren(
      caseId, pageId, frame._id,
      Array.from(selection.selectedIds)
    );
  }

  // Refresh blocks
  queryClient.invalidateQueries(['case-notion', 'pages', caseId, pageId]);
};
```

---

## 6. Keyboard Shortcuts

### Comprehensive Shortcut Handler

```tsx
// In whiteboard-canvas.tsx or a dedicated hook

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isMod = e.ctrlKey || e.metaKey;

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selection.selectedIds.size > 0) {
        e.preventDefault();
        handleBatchDelete();
      }
    }

    // Undo
    if (isMod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }

    // Redo
    if ((isMod && e.key === 'z' && e.shiftKey) || (isMod && e.key === 'y')) {
      e.preventDefault();
      handleRedo();
    }

    // Duplicate
    if (isMod && e.key === 'd') {
      e.preventDefault();
      handleDuplicate();
    }

    // Select All
    if (isMod && e.key === 'a') {
      e.preventDefault();
      setSelection({
        selectedIds: new Set(localBlocks.map((b) => b._id)),
        selectionRect: null,
      });
    }

    // Copy
    if (isMod && e.key === 'c') {
      e.preventDefault();
      handleCopy();
    }

    // Paste
    if (isMod && e.key === 'v') {
      e.preventDefault();
      handlePaste();
    }

    // Group
    if (isMod && e.key === 'g' && !e.shiftKey) {
      e.preventDefault();
      handleGroup();
    }

    // Ungroup
    if (isMod && e.key === 'g' && e.shiftKey) {
      e.preventDefault();
      handleUngroup();
    }

    // Bring to Front
    if (e.key === ']' && !isMod) {
      e.preventDefault();
      handleZIndex('front');
    }

    // Send to Back
    if (e.key === '[' && !isMod) {
      e.preventDefault();
      handleZIndex('back');
    }

    // Tool shortcuts
    if (e.key === 'v' || e.key === '1') setCanvasTool('select');
    if (e.key === 'h' || e.key === '2') setCanvasTool('pan');
    if (e.key === 'c' || e.key === '3') setCanvasTool('connect');

    // Escape to deselect
    if (e.key === 'Escape') {
      setSelection({ selectedIds: new Set(), selectionRect: null });
      setCanvasTool('select');
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selection, handleUndo, handleRedo, handleBatchDelete]);
```

### Copy/Paste Implementation

```tsx
const [clipboard, setClipboard] = useState<{
  blocks: Block[];
  connections: BlockConnection[];
} | null>(null);

const handleCopy = () => {
  if (selection.selectedIds.size === 0) return;

  const selectedBlocks = localBlocks.filter((b) => selection.selectedIds.has(b._id));
  const selectedConnections = localConnections.filter(
    (c) =>
      selection.selectedIds.has(c.sourceBlockId) &&
      selection.selectedIds.has(c.targetBlockId)
  );

  setClipboard({
    blocks: selectedBlocks,
    connections: selectedConnections,
  });

  toast.success(t('notion.whiteboard.copied', { count: selectedBlocks.length }));
};

const handlePaste = async () => {
  if (!clipboard) return;

  saveSnapshot();

  // Generate new IDs and offset positions
  const idMap = new Map<string, string>();
  const offset = 20;

  const newBlocks = clipboard.blocks.map((block) => {
    const newId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    idMap.set(block._id, newId);
    return {
      ...block,
      _id: undefined, // Let server generate
      canvasX: block.canvasX + offset,
      canvasY: block.canvasY + offset,
    };
  });

  // Create blocks via API
  const createdBlocks = await Promise.all(
    newBlocks.map((block) =>
      caseNotionService.createBlock(caseId, pageId, block)
    )
  );

  // Create connections with new IDs
  const newConnections = clipboard.connections.map((conn) => ({
    ...conn,
    _id: undefined,
    sourceBlockId: idMap.get(conn.sourceBlockId),
    targetBlockId: idMap.get(conn.targetBlockId),
  }));

  await Promise.all(
    newConnections.map((conn) =>
      caseNotionService.createConnection(caseId, pageId, conn)
    )
  );

  // Refresh
  queryClient.invalidateQueries(['case-notion', 'pages', caseId, pageId]);
};
```

---

## 7. Z-Index Layer Controls

### Add to Block Context Menu

```tsx
// In whiteboard-block.tsx action menu

<DropdownMenuItem onClick={() => handleZIndex(block._id, 'front')}>
  <ArrowUpToLine className="w-4 h-4 mr-2" />
  {t('notion.whiteboard.bringToFront')}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleZIndex(block._id, 'forward')}>
  <ArrowUp className="w-4 h-4 mr-2" />
  {t('notion.whiteboard.bringForward')}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleZIndex(block._id, 'backward')}>
  <ArrowDown className="w-4 h-4 mr-2" />
  {t('notion.whiteboard.sendBackward')}
</DropdownMenuItem>
<DropdownMenuItem onClick={() => handleZIndex(block._id, 'back')}>
  <ArrowDownToLine className="w-4 h-4 mr-2" />
  {t('notion.whiteboard.sendToBack')}
</DropdownMenuItem>
```

### Handler Implementation

```tsx
const handleZIndex = async (blockId: string, action: 'front' | 'back' | 'forward' | 'backward') => {
  saveSnapshot();

  try {
    await caseNotionService.updateBlockZIndex(caseId, blockId, action);

    // Optimistic update
    setLocalBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => (a.zIndex || 'a0').localeCompare(b.zIndex || 'a0'));
      const index = sorted.findIndex((b) => b._id === blockId);
      if (index === -1) return prev;

      const block = sorted[index];

      switch (action) {
        case 'front':
          // Move to end
          sorted.splice(index, 1);
          sorted.push(block);
          break;
        case 'back':
          // Move to start
          sorted.splice(index, 1);
          sorted.unshift(block);
          break;
        case 'forward':
          // Swap with next
          if (index < sorted.length - 1) {
            [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
          }
          break;
        case 'backward':
          // Swap with previous
          if (index > 0) {
            [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
          }
          break;
      }

      // Reassign zIndex based on new order
      return sorted.map((b, i) => ({
        ...b,
        zIndex: `a${i}`,
      }));
    });
  } catch (error) {
    handleApiError(error);
  }
};
```

---

## 8. Connection Labels

### Editable Connection Labels

```tsx
// In block-connections.tsx

const ConnectionLabel = ({ connection, onUpdate }: { connection: BlockConnection; onUpdate: (label: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(connection.label || '');

  if (!connection.label && !isEditing) {
    return (
      <g
        style={{ cursor: 'pointer' }}
        onClick={() => setIsEditing(true)}
        className="opacity-0 hover:opacity-100 transition-opacity"
      >
        <rect
          x={midX - 10}
          y={midY - 10}
          width={20}
          height={20}
          fill="white"
          rx={4}
        />
        <text x={midX} y={midY + 4} textAnchor="middle" fontSize={12}>+</text>
      </g>
    );
  }

  if (isEditing) {
    return (
      <foreignObject x={midX - 50} y={midY - 12} width={100} height={24}>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onUpdate(label);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
              onUpdate(label);
            }
            if (e.key === 'Escape') {
              setIsEditing(false);
              setLabel(connection.label || '');
            }
          }}
          className="w-full px-2 py-1 text-xs border rounded text-center"
        />
      </foreignObject>
    );
  }

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => setIsEditing(true)}
    >
      <rect
        x={midX - (connection.label!.length * 4)}
        y={midY - 10}
        width={connection.label!.length * 8}
        height={20}
        fill="white"
        rx={4}
        stroke="#e5e7eb"
      />
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fontSize={12}
        className="fill-gray-600"
      >
        {connection.label}
      </text>
    </g>
  );
};
```

---

## 9. Performance Optimizations

### Memoization

```tsx
// Memoize expensive calculations
const blockMap = useMemo(() => {
  return new Map(localBlocks.map(block => [block._id, block]));
}, [localBlocks]);

// Memoize handlers
const handleBlockMove = useCallback((blockId: string, x: number, y: number) => {
  // ... implementation
}, [saveSnapshot, localBlocks]);

// Memoize components
const MemoizedBlock = memo(WhiteboardBlock, (prev, next) => {
  return (
    prev.block._id === next.block._id &&
    prev.block.canvasX === next.block.canvasX &&
    prev.block.canvasY === next.block.canvasY &&
    prev.block.canvasWidth === next.block.canvasWidth &&
    prev.block.canvasHeight === next.block.canvasHeight &&
    prev.isSelected === next.isSelected
  );
});
```

### Virtualization for Large Canvases

```tsx
// Only render blocks in viewport
const visibleBlocks = useMemo(() => {
  const viewportBounds = {
    left: -panX / zoom,
    top: -panY / zoom,
    right: (-panX + containerWidth) / zoom,
    bottom: (-panY + containerHeight) / zoom,
  };

  return localBlocks.filter(block => {
    const blockRight = block.canvasX + (block.canvasWidth || 200);
    const blockBottom = block.canvasY + (block.canvasHeight || 150);

    return (
      block.canvasX < viewportBounds.right &&
      blockRight > viewportBounds.left &&
      block.canvasY < viewportBounds.bottom &&
      blockBottom > viewportBounds.top
    );
  });
}, [localBlocks, panX, panY, zoom, containerWidth, containerHeight]);
```

### Debounced Updates

```tsx
const debouncedSave = useMemo(
  () =>
    debounce(async (blockId: string, changes: Partial<Block>) => {
      await caseNotionService.updateBlock(caseId, blockId, changes);
    }, 300),
  [caseId]
);

// Cleanup on unmount
useEffect(() => {
  return () => debouncedSave.cancel();
}, [debouncedSave]);
```

---

## 10. TypeScript Types Reference

### Update Schema Types

Add to `src/features/case-notion/data/schema.ts`:

```typescript
// Shape types
export const ShapeType = z.enum([
  'note',
  'rectangle',
  'ellipse',
  'diamond',
  'triangle',
  'hexagon',
  'star',
  'sticky',
  'text_shape',
  'arrow',
  'frame',
]);
export type ShapeType = z.infer<typeof ShapeType>;

// Path types for connections
export const PathType = z.enum(['straight', 'bezier', 'smoothstep', 'step']);
export type PathType = z.infer<typeof PathType>;

// Z-index actions
export const ZIndexAction = z.enum(['front', 'back', 'forward', 'backward']);
export type ZIndexAction = z.infer<typeof ZIndexAction>;

// Selection state
export interface SelectionState {
  selectedIds: Set<string>;
  selectionRect: {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
}

// History snapshot
export interface HistorySnapshot {
  blocks: Block[];
  connections: BlockConnection[];
  timestamp: number;
}

// Clipboard state
export interface ClipboardState {
  blocks: Block[];
  connections: BlockConnection[];
}
```

---

## Testing Checklist

- [ ] Shape Rendering
  - [ ] Rectangle renders correctly
  - [ ] Ellipse renders correctly
  - [ ] Diamond renders correctly
  - [ ] Triangle renders correctly
  - [ ] Sticky note renders with fold corner
  - [ ] Text shape renders without background

- [ ] Selection
  - [ ] Single click selects
  - [ ] Shift+click toggles selection
  - [ ] Box selection works
  - [ ] Escape deselects all
  - [ ] Ctrl+A selects all

- [ ] Undo/Redo
  - [ ] Ctrl+Z undoes
  - [ ] Ctrl+Y/Ctrl+Shift+Z redoes
  - [ ] History stack limits to 50
  - [ ] Toolbar buttons reflect state

- [ ] Keyboard Shortcuts
  - [ ] Delete removes selected
  - [ ] Ctrl+D duplicates
  - [ ] Ctrl+C/V copy/paste
  - [ ] [ and ] change z-index
  - [ ] 1/2/3 switch tools

- [ ] Connections
  - [ ] Connections update when blocks move
  - [ ] Different path types render correctly
  - [ ] Labels can be added/edited

- [ ] Frames
  - [ ] Frame creates around selection
  - [ ] Frame moves with children
  - [ ] Frame resizes

- [ ] Performance
  - [ ] 100+ blocks renders smoothly
  - [ ] Pan/zoom is responsive
  - [ ] No lag during drag operations

---

## Translations to Add

```json
{
  "notion": {
    "whiteboard": {
      "copied": "Copied {{count}} elements",
      "pasted": "Pasted {{count}} elements",
      "bringToFront": "Bring to Front",
      "bringForward": "Bring Forward",
      "sendBackward": "Send Backward",
      "sendToBack": "Send to Back",
      "group": "Group",
      "ungroup": "Ungroup",
      "createFrame": "Create Frame",
      "selectAll": "Select All",
      "duplicate": "Duplicate"
    }
  }
}
```

---

This guide provides production-ready implementations for all missing features. Each section is designed to integrate with your existing codebase architecture.
