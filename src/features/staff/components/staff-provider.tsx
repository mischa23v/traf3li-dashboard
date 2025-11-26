import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Staff } from '../data/schema'

type StaffDialogType = 'add' | 'edit' | 'delete' | 'view'

type StaffContextType = {
  open: StaffDialogType | null
  setOpen: (str: StaffDialogType | null) => void
  currentRow: Staff | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Staff | null>>
}

const StaffContext = React.createContext<StaffContextType | null>(null)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StaffDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Staff | null>(null)

  return (
    <StaffContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StaffContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStaffContext = () => {
  const staffContext = React.useContext(StaffContext)

  if (!staffContext) {
    throw new Error('useStaffContext has to be used within <StaffContext>')
  }

  return staffContext
}
