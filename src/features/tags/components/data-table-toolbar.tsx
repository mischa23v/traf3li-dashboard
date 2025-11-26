import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions, DataTableFacetedFilter } from '@/components/data-table'
import { entityTypeOptions } from '../data/data'
import { useTranslation } from 'react-i18next'
import { DataTableBulkActions } from './data-table-bulk-actions'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t, i18n } = useTranslation()
  const isFiltered = table.getState().columnFilters.length > 0
  const isArabic = i18n.language === 'ar'

  const entityTypeFilterOptions = entityTypeOptions.map((option) => ({
    value: option.value,
    label: isArabic ? option.labelAr : option.label,
    icon: option.icon,
  }))

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder={t('tags.searchTags')}
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('entityType') && (
          <DataTableFacetedFilter
            column={table.getColumn('entityType')}
            title={t('tags.entityType')}
            options={entityTypeFilterOptions}
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
