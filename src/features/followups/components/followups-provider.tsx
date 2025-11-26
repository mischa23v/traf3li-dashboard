import React, { createContext, useContext, useState } from 'react'
import { type Followup } from '../data/schema'

type FollowupsDialogType = 'add' | 'edit' | 'delete' | 'view' | 'complete' | 'reschedule' | null

interface FollowupsContextType {
  open: FollowupsDialogType
  setOpen: (type: FollowupsDialogType) => void
  currentRow: Followup | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Followup | null>>
}

const FollowupsContext = createContext<FollowupsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function FollowupsProvider({ children }: Props) {
  const [open, setOpen] = useState<FollowupsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Followup | null>(null)

  return (
    <FollowupsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </FollowupsContext.Provider>
  )
}

export function useFollowupsContext() {
  const context = useContext(FollowupsContext)
  if (!context) {
    throw new Error('useFollowupsContext must be used within a FollowupsProvider')
  }
  return context
}
