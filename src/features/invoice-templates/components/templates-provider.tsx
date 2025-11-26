import { createContext, useContext, useState, type ReactNode } from 'react'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'

type DialogType =
  | 'add'
  | 'edit'
  | 'delete'
  | 'view'
  | 'duplicate'
  | 'preview'
  | 'settings'
  | null

interface TemplatesContextType {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentTemplate: InvoiceTemplate | null
  setCurrentTemplate: (template: InvoiceTemplate | null) => void
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined)

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(null)

  return (
    <TemplatesContext.Provider
      value={{
        open,
        setOpen,
        currentTemplate,
        setCurrentTemplate,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  )
}

export function useTemplatesContext() {
  const context = useContext(TemplatesContext)
  if (!context) {
    throw new Error('useTemplatesContext must be used within TemplatesProvider')
  }
  return context
}
