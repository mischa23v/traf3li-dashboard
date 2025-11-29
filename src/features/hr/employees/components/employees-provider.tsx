import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Employee } from '@/types/hr'

type DialogType = 'create' | 'edit' | 'delete' | 'view' | null

interface EmployeesContextType {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentRow: Employee | null
  setCurrentRow: (row: Employee | null) => void
}

const EmployeesContext = createContext<EmployeesContextType | undefined>(
  undefined
)

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<Employee | null>(null)

  return (
    <EmployeesContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </EmployeesContext.Provider>
  )
}

export function useEmployeesContext() {
  const context = useContext(EmployeesContext)
  if (!context) {
    throw new Error(
      'useEmployeesContext must be used within an EmployeesProvider'
    )
  }
  return context
}
