'use client'

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'
import type { Organization } from '../data/schema'

type OrganizationsDialogType = 'add' | 'edit' | 'delete' | 'view'

type OrganizationsContextType = {
  open: OrganizationsDialogType | null
  setOpen: (type: OrganizationsDialogType | null) => void
  currentRow: Organization | null
  setCurrentRow: Dispatch<SetStateAction<Organization | null>>
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined)

export function OrganizationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OrganizationsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Organization | null>(null)

  return (
    <OrganizationsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </OrganizationsContext.Provider>
  )
}

export function useOrganizationsContext() {
  const context = useContext(OrganizationsContext)
  if (context === undefined) {
    throw new Error('useOrganizationsContext must be used within an OrganizationsProvider')
  }
  return context
}
