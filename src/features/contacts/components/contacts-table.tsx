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
import { useState, useMemo } from 'react'
import { DataTable, DataTableToolbar } from '@/components/data-table'
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

  // Memoize filter options to prevent recreation on every render
  const filterOptions = useMemo(
    () => [
      {
        columnId: 'type',
        title: t('contacts.columns.type'),
        options: contactTypes.map((type) => ({
          label: t(`contacts.types.${type.value}`),
          value: type.value,
          icon: type.icon,
        })),
      },
      {
        columnId: 'category',
        title: t('contacts.columns.category'),
        options: contactCategories.map((category) => ({
          label: t(`contacts.categories.${category.value}`),
          value: category.value,
          icon: category.icon,
        })),
      },
      {
        columnId: 'status',
        title: t('contacts.columns.status'),
        options: Array.from(contactStatusColors.entries()).map(
          ([value, colorClass]) => ({
            label: t(`contacts.statuses.${value}`),
            value,
            colorClass,
          })
        ),
      },
    ],
    [t]
  )

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

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchKey='name'
        searchPlaceholder={t('contacts.searchPlaceholder')}
        filters={filterOptions}
      />
      <ContactsBulkActions table={table} />
      <DataTable table={table} />
    </div>
  )
}
