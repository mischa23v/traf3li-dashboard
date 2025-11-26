import { Table } from '@tanstack/react-table'
import { Trash, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBulkCompleteFollowups, useBulkDeleteFollowups } from '@/hooks/useFollowups'
import { useTranslation } from 'react-i18next'
import { type Followup } from '../data/schema'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const bulkComplete = useBulkCompleteFollowups()
  const bulkDelete = useBulkDeleteFollowups()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  const pendingRows = selectedRows.filter(
    (row) => (row.original as Followup).status === 'pending'
  )

  const handleBulkComplete = () => {
    const ids = pendingRows.map((row) => (row.original as Followup)._id)
    bulkComplete.mutate(ids, {
      onSuccess: () => {
        table.resetRowSelection()
      },
    })
  }

  const handleBulkDelete = () => {
    const ids = selectedRows.map((row) => (row.original as Followup)._id)
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
      {pendingRows.length > 0 && (
        <Button
          variant='outline'
          size='sm'
          className='h-8'
          onClick={handleBulkComplete}
          disabled={bulkComplete.isPending}
        >
          <Check className='me-2 h-4 w-4' />
          {t('followups.markComplete')} ({pendingRows.length})
        </Button>
      )}
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
