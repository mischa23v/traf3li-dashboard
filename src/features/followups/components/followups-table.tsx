import { DataTable } from '@/components/data-table/data-table'
import { columns } from './followups-columns'
import { DataTableToolbar } from './data-table-toolbar'
import { type Followup } from '../data/schema'

interface FollowupsTableProps {
  data: Followup[]
  totalCount: number
  page: number
  pageSize: number
  isLoading?: boolean
}

export function FollowupsTable({
  data,
  totalCount,
  page,
  pageSize,
  isLoading,
}: FollowupsTableProps) {
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
