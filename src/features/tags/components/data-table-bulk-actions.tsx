import { type Table } from '@tanstack/react-table'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
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
        onClick={() => {
          // TODO: Implement bulk delete
          console.log('Delete selected:', selectedRows.map((r) => r.original))
        }}
      >
        <Trash className='me-2 h-4 w-4' />
        {t('common.delete')}
      </Button>
    </div>
  )
}
