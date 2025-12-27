import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions, DataTableFacetedFilter } from '@/components/data-table'
import { categoryOptions } from '../data/data'
import { useTranslation } from 'react-i18next'
import { DataTableBulkActions } from './data-table-bulk-actions'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()
  const isFiltered = table.getState().columnFilters.length > 0

  const categoryFilterOptions = categoryOptions.map((option) => ({
    value: option.value,
    label: t(`documents.categories.${option.value}`),
    icon: option.icon,
  }))

  const confidentialOptions = [
    { value: 'true', label: t('documents.confidentialOptions.confidential') },
    { value: 'false', label: t('documents.confidentialOptions.public') },
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder={t('documents.searchDocuments')}
          value={(table.getColumn('originalName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('originalName')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('category') && (
          <DataTableFacetedFilter
            column={table.getColumn('category')}
            title={t('documents.category')}
            options={categoryFilterOptions}
          />
        )}
        {table.getColumn('isConfidential') && (
          <DataTableFacetedFilter
            column={table.getColumn('isConfidential')}
            title={t('documents.confidential')}
            options={confidentialOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            {t('common.reset')}
            <X className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center justify-between'>
        <DataTableBulkActions table={table} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
