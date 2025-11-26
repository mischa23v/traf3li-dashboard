import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { type Followup } from '../data/schema'
import { getTypeInfo, getStatusInfo, getPriorityInfo, getEntityTypeInfo } from '../data/data'
import { Clock, User, AlertTriangle } from 'lucide-react'
import i18n from '@/i18n'
import { format, isPast, isToday } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export const columns: ColumnDef<Followup>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('followups.title')}
      />
    ),
    cell: ({ row }) => {
      const followup = row.original
      const typeInfo = getTypeInfo(followup.type)
      const TypeIcon = typeInfo.icon
      const isArabic = i18n.language === 'ar'

      return (
        <div className='flex items-center gap-2'>
          <div
            className='p-1.5 rounded-lg'
            style={{ backgroundColor: `${typeInfo.color}20` }}
          >
            <TypeIcon className='h-4 w-4' style={{ color: typeInfo.color }} />
          </div>
          <div className='flex flex-col'>
            <span className='font-medium'>{followup.title}</span>
            <span className='text-xs text-muted-foreground'>
              {isArabic ? typeInfo.labelAr : typeInfo.label}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('common.status')}
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const info = getStatusInfo(status)
      const isArabic = i18n.language === 'ar'

      return (
        <Badge
          variant='outline'
          style={{ borderColor: info.color, color: info.color }}
        >
          {isArabic ? info.labelAr : info.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('followups.priority')}
      />
    ),
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const info = getPriorityInfo(priority)
      const isArabic = i18n.language === 'ar'

      return (
        <Badge
          variant={priority === 'urgent' ? 'destructive' : 'secondary'}
          style={priority !== 'urgent' ? { backgroundColor: `${info.color}20`, color: info.color } : {}}
        >
          {isArabic ? info.labelAr : info.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('followups.dueDate')}
      />
    ),
    cell: ({ row }) => {
      const followup = row.original
      const dueDate = new Date(followup.dueDate)
      const isOverdue = isPast(dueDate) && followup.status === 'pending'
      const isDueToday = isToday(dueDate)
      const isArabic = i18n.language === 'ar'

      let formattedDate
      try {
        formattedDate = format(dueDate, 'PP', {
          locale: isArabic ? ar : enUS,
        })
      } catch {
        formattedDate = followup.dueDate
      }

      return (
        <div className='flex items-center gap-1'>
          {isOverdue && <AlertTriangle className='h-4 w-4 text-destructive' />}
          <span
            className={`${isOverdue ? 'text-destructive font-medium' : ''} ${
              isDueToday ? 'text-amber-600 font-medium' : ''
            }`}
          >
            {formattedDate}
          </span>
          {followup.dueTime && (
            <span className='text-muted-foreground text-xs'>
              {followup.dueTime}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'entity',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('followups.linkedEntity')}
      />
    ),
    cell: ({ row }) => {
      const followup = row.original
      const entityTypeInfo = getEntityTypeInfo(followup.entityType)
      const isArabic = i18n.language === 'ar'

      const entityName =
        followup.entity?.fullName ||
        followup.entity?.name ||
        followup.entity?.title ||
        followup.entity?.caseNumber ||
        '-'

      return (
        <div className='flex flex-col'>
          <span className='text-xs text-muted-foreground'>
            {isArabic ? entityTypeInfo.labelAr : entityTypeInfo.label}
          </span>
          <span className='text-sm truncate max-w-[150px]'>{entityName}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('followups.assignedTo')}
      />
    ),
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo
      if (!assignedTo) return <span className='text-muted-foreground'>-</span>

      if (typeof assignedTo === 'object') {
        return (
          <div className='flex items-center gap-1'>
            <User className='h-3 w-3 text-muted-foreground' />
            <span className='text-sm'>
              {assignedTo.firstName} {assignedTo.lastName}
            </span>
          </div>
        )
      }

      return <span className='text-sm'>{assignedTo}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
