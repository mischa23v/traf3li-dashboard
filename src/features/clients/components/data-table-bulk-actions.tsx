import { type Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Client } from '../data/schema'
import { useBulkDeleteClients } from '@/hooks/useClients'
import { useTranslation } from 'react-i18next'

type DataTableBulkActionsProps = {
  table: Table<Client>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const { t } = useTranslation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const { mutate: bulkDelete, isPending } = useBulkDeleteClients()

  if (selectedRows.length === 0) return null

  const handleBulkDelete = () => {
    const clientIds = selectedRows.map((row) => row.original._id)
    bulkDelete(clientIds, {
      onSuccess: () => {
        table.resetRowSelection()
      },
    })
  }

  return (
    <div
      role='toolbar'
      className='bg-background fixed inset-x-0 bottom-4 z-10 mx-auto flex w-fit items-center gap-2 rounded-lg border p-2 shadow-lg sm:bottom-8'
    >
      <span className='text-muted-foreground text-sm'>
        {t('clients.selected', { count: selectedRows.length })}
      </span>
      <Button
        variant='destructive'
        size='sm'
        onClick={handleBulkDelete}
        disabled={isPending}
      >
        <Trash2 className='me-2 h-4 w-4' aria-hidden='true' />
        {t('common.delete')}
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => table.resetRowSelection()}
      >
        <X className='me-2 h-4 w-4' aria-hidden='true' />
        {t('common.cancel')}
      </Button>
    </div>
  )
}
