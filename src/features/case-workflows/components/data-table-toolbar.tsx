import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions, DataTableFacetedFilter } from '@/components/data-table'
import type { WorkflowTemplate } from '../data/schema'
import { caseCategories } from '../data/data'
import { useTranslation } from 'react-i18next'

interface DataTableToolbarProps {
  table: Table<WorkflowTemplate>
}

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isFiltered = table.getState().columnFilters.length > 0

  const categoryOptions = caseCategories.map((category) => ({
    value: category.value,
    label: isRTL ? category.labelAr : category.label,
    icon: category.icon,
  }))

  const statusOptions = [
    { value: 'true', label: t('caseWorkflows.active') },
    { value: 'false', label: t('caseWorkflows.inactive') },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={t('caseWorkflows.searchPlaceholder')}
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('caseCategory') && (
          <DataTableFacetedFilter
            column={table.getColumn('caseCategory')}
            title={t('caseWorkflows.caseCategory')}
            options={categoryOptions}
          />
        )}
        {table.getColumn('isActive') && (
          <DataTableFacetedFilter
            column={table.getColumn('isActive')}
            title={t('caseWorkflows.status')}
            options={statusOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('common.reset')}
            <X className="ms-2 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
