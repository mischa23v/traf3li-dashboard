/**
 * Whiteboard History Store
 * Manages undo/redo functionality for whiteboard changes
 */

import { create } from 'zustand'
import type { Block, BlockConnection } from '../data/schema'

/**
 * Snapshot of the whiteboard state at a specific point in time
 */
export interface HistorySnapshot {
  blocks: Block[]
  connections: BlockConnection[]
  timestamp: number
}

interface WhiteboardHistoryState {
  // State
  undoStack: HistorySnapshot[]
  redoStack: HistorySnapshot[]
  maxHistorySize: number

  // Actions
  pushSnapshot: (blocks: Block[], connections: BlockConnection[]) => void
  undo: () => HistorySnapshot | null
  redo: () => HistorySnapshot | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

export const useWhiteboardHistory = create<WhiteboardHistoryState>((set, get) => ({
  // Initial State
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  /**
   * Push a new snapshot onto the undo stack
   * Clears the redo stack as we're creating a new branch
   */
  pushSnapshot: (blocks: Block[], connections: BlockConnection[]) => {
    const { undoStack, maxHistorySize } = get()

    // Create deep copies to avoid reference issues
    const snapshot: HistorySnapshot = {
      blocks: JSON.parse(JSON.stringify(blocks)),
      connections: JSON.parse(JSON.stringify(connections)),
      timestamp: Date.now(),
    }

    // Add to undo stack
    const newUndoStack = [...undoStack, snapshot]

    // Limit stack size (keep most recent entries)
    if (newUndoStack.length > maxHistorySize) {
      newUndoStack.shift()
    }

    set({
      undoStack: newUndoStack,
      redoStack: [], // Clear redo stack when making new changes
    })
  },

  /**
   * Undo the last action
   * Returns the previous state or null if nothing to undo
   */
  undo: () => {
    const { undoStack, redoStack } = get()

    if (undoStack.length === 0) {
      return null
    }

    // Pop the last snapshot from undo stack
    const newUndoStack = [...undoStack]
    const snapshot = newUndoStack.pop()!

    // Push current state to redo stack (the state we're undoing FROM)
    // This would be the NEXT state in the undo stack, or the last state if no more undos
    const currentSnapshot = newUndoStack[newUndoStack.length - 1] || snapshot

    set({
      undoStack: newUndoStack,
      redoStack: [...redoStack, snapshot],
    })

    // Return the previous snapshot to restore
    return currentSnapshot
  },

  /**
   * Redo the last undone action
   * Returns the next state or null if nothing to redo
   */
  redo: () => {
    const { undoStack, redoStack } = get()

    if (redoStack.length === 0) {
      return null
    }

    // Pop from redo stack
    const newRedoStack = [...redoStack]
    const snapshot = newRedoStack.pop()!

    // Push back to undo stack
    set({
      undoStack: [...undoStack, snapshot],
      redoStack: newRedoStack,
    })

    // Return the snapshot to restore
    return snapshot
  },

  /**
   * Check if undo is available
   */
  canUndo: () => {
    return get().undoStack.length > 0
  },

  /**
   * Check if redo is available
   */
  canRedo: () => {
    return get().redoStack.length > 0
  },

  /**
   * Clear all history
   */
  clear: () => {
    set({
      undoStack: [],
      redoStack: [],
    })
  },
}))

/**
 * Selectors for easy access to specific state
 */
export const selectCanUndo = (state: WhiteboardHistoryState) => state.canUndo()
export const selectCanRedo = (state: WhiteboardHistoryState) => state.canRedo()
export const selectUndoStackSize = (state: WhiteboardHistoryState) => state.undoStack.length
export const selectRedoStackSize = (state: WhiteboardHistoryState) => state.redoStack.length
