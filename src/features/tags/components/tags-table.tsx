import { DataTable } from '@/components/data-table/data-table'
import { columns } from './tags-columns'
import { DataTableToolbar } from './data-table-toolbar'
import { type Tag } from '../data/schema'

interface TagsTableProps {
  data: Tag[]
  totalCount: number
  page: number
  pageSize: number
  isLoading?: boolean
}

export function TagsTable({
  data,
  totalCount,
  page,
  pageSize,
  isLoading,
}: TagsTableProps) {
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
