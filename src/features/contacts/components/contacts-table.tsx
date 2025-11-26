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
import { type Contact } from '../data/schema'
import { contactStatusColors, contactTypes, contactCategories } from '../data/data'
import { useContactsColumns } from './contacts-columns'
import { ContactsBulkActions } from './data-table-bulk-actions'
import { useTranslation } from 'react-i18next'

interface ContactsTableProps {
  data: Contact[]
  search: Record<string, unknown>
  navigate: (opts: { search: (prev: Record<string, unknown>) => Record<string, unknown> }) => void
}

export function ContactsTable({ data, search, navigate }: ContactsTableProps) {
  const { t } = useTranslation()
  const columns = useContactsColumns()
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
  const typeOptions = contactTypes.map((type) => ({
    label: t(`contacts.types.${type.value}`),
    value: type.value,
    icon: type.icon,
  }))

  const categoryOptions = contactCategories.map((category) => ({
    label: t(`contacts.categories.${category.value}`),
    value: category.value,
    icon: category.icon,
  }))

  const statusOptions = Array.from(contactStatusColors.entries()).map(
    ([value, colorClass]) => ({
      label: t(`contacts.statuses.${value}`),
      value,
      colorClass,
    })
  )

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        filterColumn='name'
        filterPlaceholder={t('contacts.searchPlaceholder')}
        facetedFilters={[
          {
            column: 'type',
            title: t('contacts.columns.type'),
            options: typeOptions,
          },
          {
            column: 'category',
            title: t('contacts.columns.category'),
            options: categoryOptions,
          },
          {
            column: 'status',
            title: t('contacts.columns.status'),
            options: statusOptions,
          },
        ]}
      />
      <ContactsBulkActions table={table} />
      <DataTable table={table} />
    </div>
  )
}
