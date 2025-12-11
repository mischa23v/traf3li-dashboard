import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PdfmeTemplate } from '@/services/pdfmeService'

type DialogType =
  | 'add'
  | 'edit'
  | 'delete'
  | 'view'
  | 'duplicate'
  | 'preview'
  | 'designer'
  | null

interface PdfTemplatesContextType {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentTemplate: PdfmeTemplate | null
  setCurrentTemplate: (template: PdfmeTemplate | null) => void
  designerMode: 'create' | 'edit' | null
  setDesignerMode: (mode: 'create' | 'edit' | null) => void
}

const PdfTemplatesContext = createContext<PdfTemplatesContextType | undefined>(undefined)

export function PdfTemplatesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentTemplate, setCurrentTemplate] = useState<PdfmeTemplate | null>(null)
  const [designerMode, setDesignerMode] = useState<'create' | 'edit' | null>(null)

  return (
    <PdfTemplatesContext.Provider
      value={{
        open,
        setOpen,
        currentTemplate,
        setCurrentTemplate,
        designerMode,
        setDesignerMode,
      }}
    >
      {children}
    </PdfTemplatesContext.Provider>
  )
}

export function usePdfTemplatesContext() {
  const context = useContext(PdfTemplatesContext)
  if (!context) {
    throw new Error('usePdfTemplatesContext must be used within PdfTemplatesProvider')
  }
  return context
}
