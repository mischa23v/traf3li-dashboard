import { type ColumnDef } from '@tanstack/react-table'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { labels, priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Calendar } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

// Memoized cell components
const TitleCell = memo(({ title, label, linkedEventId }: { title: string; label?: { label: string; value: string }; linkedEventId?: string }) => (
  <div className='flex gap-2 items-center'>
    {label && <Badge variant='outline'>{label.label}</Badge>}
    <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
      {title}
    </span>
    {linkedEventId && (
      <Badge
        className='bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-md px-2 flex items-center gap-1 cursor-pointer transition-all'
        onClick={(e) => {
          e.stopPropagation()
          window.location.href = ROUTES.dashboard.tasks.events.detail(linkedEventId)
        }}
      >
        <Calendar className='h-3 w-3' />
        حدث
      </Badge>
    )}
  </div>
))

const StatusCell = memo(({ status }: { status: { value: string; label: string; icon?: any } | null }) => {
  if (!status) return null

  return (
    <div className='flex w-[100px] items-center gap-2'>
      {status.icon && (
        <status.icon className='text-slate-500 size-4' />
      )}
      <span>{status.label}</span>
    </div>
  )
})

const PriorityCell = memo(({ priority }: { priority: { value: string; label: string; icon?: any } | null }) => {
  if (!priority) return null

  return (
    <div className='flex items-center gap-2'>
      {priority.icon && (
        <priority.icon className='text-slate-500 size-4' />
      )}
      <span>{priority.label}</span>
    </div>
  )
})

export const tasksColumns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='تحديد الكل'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='تحديد الصف'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='المهمة' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='العنوان' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label)
      const linkedEventId = row.original.linkedEventId || row.original.eventId

      return (
        <TitleCell
          title={row.getValue('title')}
          label={label}
          linkedEventId={linkedEventId}
        />
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='الحالة' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )
      return <StatusCell status={status || null} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='الأولوية' />
    ),
    meta: { className: 'ps-1', tdClassName: 'ps-3' },
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )
      return <PriorityCell priority={priority || null} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
