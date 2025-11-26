import { DataTable } from '@/components/data-table/data-table'
import { columns } from './documents-columns'
import { DataTableToolbar } from './data-table-toolbar'
import { type Document } from '../data/schema'

interface DocumentsTableProps {
  data: Document[]
  totalCount: number
  page: number
  pageSize: number
  isLoading?: boolean
}

export function DocumentsTable({
  data,
  totalCount,
  page,
  pageSize,
  isLoading,
}: DocumentsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      isLoading={isLoading}
      toolbar={(table) => <DataTableToolbar table={table} />}
    />
  )
}
