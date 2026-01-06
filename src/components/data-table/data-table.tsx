import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps<TData, TValue = unknown> {
  // Option 1: Pass external table instance
  table?: TanstackTable<TData>
  // Option 2: Pass columns and data to create table internally
  columns?: ColumnDef<TData, TValue>[]
  data?: TData[]
  totalCount?: number
  page?: number
  pageSize?: number
  isLoading?: boolean
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode
  showPagination?: boolean
}

// Memoized table row component for performance
const MemoizedTableRow = memo(({ row, cells }: { row: any; cells: any[] }) => (
  <TableRow
    data-state={row.getIsSelected() && 'selected'}
  >
    {cells.map((cell) => (
      <TableCell key={cell.id}>
        {flexRender(
          cell.column.columnDef.cell,
          cell.getContext()
        )}
      </TableCell>
    ))}
  </TableRow>
))

export function DataTable<TData, TValue = unknown>({
  table: externalTable,
  columns,
  data,
  totalCount,
  page: _page = 1,
  pageSize = 10,
  isLoading = false,
  toolbar,
  showPagination = true,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Memoize table configuration
  const tableConfig = useMemo(
    () => ({
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      manualPagination: !!totalCount,
      pageCount: totalCount ? Math.ceil(totalCount / pageSize) : undefined,
    }),
    [totalCount, pageSize]
  )

  // Always call useReactTable to follow Rules of Hooks
  // Use empty arrays as fallback when data/columns not provided
  const internalTable = useReactTable({
    data: data ?? [],
    columns: columns ?? [],
    ...tableConfig,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Use external table if provided, otherwise use internal table
  // Only use internal table if columns and data were actually provided
  const table = externalTable || (columns && data ? internalTable : null)

  // Memoize rows for performance - must be called before early returns
  const rowModel = table?.getRowModel()
  const rows = useMemo(() => rowModel?.rows || [], [rowModel])

  if (!table) {
    return null
  }

  if (isLoading && columns) {
    return (
      <div className='space-y-4'>
        {toolbar && toolbar(table)}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className='h-4 w-20' />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {toolbar && toolbar(table)}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => (
                <MemoizedTableRow
                  key={row.id}
                  row={row}
                  cells={row.getVisibleCells()}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className='h-24 text-center'
                >
                  {t('dataTable.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && <DataTablePagination table={table} />}
    </div>
  )
}
