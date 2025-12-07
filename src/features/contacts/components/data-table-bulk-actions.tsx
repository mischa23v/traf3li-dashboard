'use client'

import type { Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBulkDeleteContacts } from '@/hooks/useContacts'
import { type Contact } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface ContactsBulkActionsProps {
  table: Table<Contact>
}

export function ContactsBulkActions({ table }: ContactsBulkActionsProps) {
  const { t } = useTranslation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const { mutate: bulkDelete, isPending } = useBulkDeleteContacts()

  if (selectedRows.length === 0) return null

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => row.original._id)
    bulkDelete(ids, {
      onSuccess: () => {
        table.resetRowSelection()
      },
    })
  }

  return (
    <div className='flex items-center justify-between rounded-lg border bg-muted/50 p-2'>
      <span className='text-sm text-muted-foreground'>
        {t('contacts.selected', { count: selectedRows.length })}
      </span>
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.resetRowSelection()}
        >
          <X className='me-2 h-4 w-4' aria-hidden='true' />
          {t('common.cancel')}
        </Button>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleBulkDelete}
          disabled={isPending}
        >
          <Trash2 className='me-2 h-4 w-4' aria-hidden='true' />
          {t('common.delete')}
        </Button>
      </div>
    </div>
  )
}
