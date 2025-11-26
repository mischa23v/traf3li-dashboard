'use client'

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react'
import type { Contact } from '../data/schema'

type ContactsDialogType = 'add' | 'edit' | 'delete' | 'view'

type ContactsContextType = {
  open: ContactsDialogType | null
  setOpen: (type: ContactsDialogType | null) => void
  currentRow: Contact | null
  setCurrentRow: Dispatch<SetStateAction<Contact | null>>
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ContactsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Contact | null>(null)

  return (
    <ContactsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ContactsContext.Provider>
  )
}

export function useContactsContext() {
  const context = useContext(ContactsContext)
  if (context === undefined) {
    throw new Error('useContactsContext must be used within a ContactsProvider')
  }
  return context
}
