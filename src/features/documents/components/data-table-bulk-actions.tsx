import { type Table } from '@tanstack/react-table'
import { Trash, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBulkDeleteDocuments } from '@/hooks/useDocuments'
import { useTranslation } from 'react-i18next'
import { type Document } from '../data/schema'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const bulkDelete = useBulkDeleteDocuments()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => (row.original as Document)._id)
    bulkDelete.mutate(ids, {
      onSuccess: () => {
        table.resetRowSelection()
      },
    })
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>
        {t('common.selectedCount', { count: selectedRows.length })}
      </span>
      <Button
        variant='outline'
        size='sm'
        className='h-8 text-destructive hover:text-destructive'
        onClick={handleBulkDelete}
        disabled={bulkDelete.isPending}
      >
        <Trash className='me-2 h-4 w-4' />
        {t('common.delete')}
      </Button>
    </div>
  )
}
