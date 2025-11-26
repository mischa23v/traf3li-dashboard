import React, { createContext, useContext, useState } from 'react'
import type { WorkflowTemplate } from '../data/schema'

type DialogType = 'add' | 'edit' | 'view' | 'delete' | 'duplicate' | 'stages' | null

interface WorkflowsContextType {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentRow: WorkflowTemplate | null
  setCurrentRow: (row: WorkflowTemplate | null) => void
}

const WorkflowsContext = createContext<WorkflowsContextType | null>(null)

interface WorkflowsProviderProps {
  children: React.ReactNode
}

export function WorkflowsProvider({ children }: WorkflowsProviderProps) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<WorkflowTemplate | null>(null)

  return (
    <WorkflowsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </WorkflowsContext.Provider>
  )
}

export function useWorkflowsContext() {
  const context = useContext(WorkflowsContext)
  if (!context) {
    throw new Error('useWorkflowsContext must be used within a WorkflowsProvider')
  }
  return context
}
