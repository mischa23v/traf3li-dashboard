'use client'

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { type Organization } from '../data/schema'
import { organizationStatusColors, organizationTypes } from '../data/data'
import { useOrganizationsColumns } from './organizations-columns'
import { OrganizationsBulkActions } from './data-table-bulk-actions'
import { useTranslation } from 'react-i18next'

interface OrganizationsTableProps {
  data: Organization[]
  search: Record<string, unknown>
  navigate: (opts: { search: (prev: Record<string, unknown>) => Record<string, unknown> }) => void
}

export function OrganizationsTable({ data, search, navigate }: OrganizationsTableProps) {
  const { t } = useTranslation()
  const columns = useOrganizationsColumns()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Create filter options from data constants
  const typeOptions = organizationTypes.map((type) => ({
    label: t(`organizations.types.${type.value}`),
    value: type.value,
    icon: type.icon,
  }))

  const statusOptions = Array.from(organizationStatusColors.entries()).map(
    ([value, colorClass]) => ({
      label: t(`organizations.statuses.${value}`),
      value,
      colorClass,
    })
  )

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        filterColumn='name'
        filterPlaceholder={t('organizations.searchPlaceholder')}
        facetedFilters={[
          {
            column: 'type',
            title: t('organizations.columns.type'),
            options: typeOptions,
          },
          {
            column: 'status',
            title: t('organizations.columns.status'),
            options: statusOptions,
          },
        ]}
      />
      <OrganizationsBulkActions table={table} />
      <DataTable table={table} />
    </div>
  )
}
