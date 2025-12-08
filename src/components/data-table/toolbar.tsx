import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'
import { useDebounce } from '@/hooks/useDebounce'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder,
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()

  // Local state for immediate input feedback
  const [localSearch, setLocalSearch] = useState(
    searchKey
      ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
      : table.getState().globalFilter ?? ''
  )

  // Debounced value for actual filtering (300ms delay)
  const debouncedSearch = useDebounce(localSearch, 300)

  // Apply debounced filter to table
  useState(() => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(debouncedSearch)
    } else {
      table.setGlobalFilter(debouncedSearch)
    }
  })

  // Update table when debounced value changes
  if (searchKey) {
    const currentValue = table.getColumn(searchKey)?.getFilterValue() as string
    if (currentValue !== debouncedSearch) {
      table.getColumn(searchKey)?.setFilterValue(debouncedSearch)
    }
  } else {
    if (table.getState().globalFilter !== debouncedSearch) {
      table.setGlobalFilter(debouncedSearch)
    }
  }

  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter

  const placeholder = searchPlaceholder || t('dataTable.toolbar.filterPlaceholder')

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:gap-2'>
        <Input
          placeholder={placeholder}
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
          aria-label={placeholder}
        />
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            {t('dataTable.toolbar.reset')}
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
