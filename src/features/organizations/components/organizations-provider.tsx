import React, { useState, createContext, useContext } from 'react'
import type { Organization } from '../data/schema'

type OrganizationsDialogType = 'create' | 'edit' | 'delete' | 'view'

interface OrganizationsContextType {
  open: OrganizationsDialogType | null
  setOpen: (dialog: OrganizationsDialogType | null) => void
  currentOrganization: Organization | null
  setCurrentOrganization: (organization: Organization | null) => void
}

const OrganizationsContext = createContext<OrganizationsContextType | null>(null)

interface OrganizationsProviderProps {
  children: React.ReactNode
}

export function OrganizationsProvider({ children }: OrganizationsProviderProps) {
  const [open, setOpen] = useState<OrganizationsDialogType | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)

  return (
    <OrganizationsContext.Provider
      value={{
        open,
        setOpen,
        currentOrganization,
        setCurrentOrganization,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  )
}

export function useOrganizationsContext() {
  const context = useContext(OrganizationsContext)
  if (!context) {
    throw new Error('useOrganizationsContext must be used within OrganizationsProvider')
  }
  return context
}
