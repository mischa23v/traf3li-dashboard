import React, { createContext, useContext, useState } from 'react'
import { type Document } from '../data/schema'

type DocumentsDialogType = 'upload' | 'edit' | 'delete' | 'view' | 'versions' | 'share' | null

interface DocumentsContextType {
  open: DocumentsDialogType
  setOpen: (type: DocumentsDialogType) => void
  currentRow: Document | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Document | null>>
}

const DocumentsContext = createContext<DocumentsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function DocumentsProvider({ children }: Props) {
  const [open, setOpen] = useState<DocumentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Document | null>(null)

  return (
    <DocumentsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocumentsContext() {
  const context = useContext(DocumentsContext)
  if (!context) {
    throw new Error('useDocumentsContext must be used within a DocumentsProvider')
  }
  return context
}
