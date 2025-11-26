import React, { createContext, useContext, useState } from 'react'
import { type Tag } from '../data/schema'

type TagsDialogType = 'add' | 'edit' | 'delete' | 'view' | null

interface TagsContextType {
  open: TagsDialogType
  setOpen: (type: TagsDialogType) => void
  currentRow: Tag | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Tag | null>>
}

const TagsContext = createContext<TagsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function TagsProvider({ children }: Props) {
  const [open, setOpen] = useState<TagsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Tag | null>(null)

  return (
    <TagsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TagsContext.Provider>
  )
}

export function useTagsContext() {
  const context = useContext(TagsContext)
  if (!context) {
    throw new Error('useTagsContext must be used within a TagsProvider')
  }
  return context
}
