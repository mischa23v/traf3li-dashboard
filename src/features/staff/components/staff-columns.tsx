import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { staffStatusColors, staffStatuses, staffRoles } from '../data/data'
import { type Staff } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'

export const useStaffColumns = (): ColumnDef<Staff>[] => {
  const { t } = useTranslation()

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('dataTable.selectAll')}
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('dataTable.selectRow')}
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.name')} />
      ),
      cell: ({ row }) => {
        const { firstName, lastName, avatar } = row.original
        const fullName = `${firstName || ''} ${lastName || ''}`.trim() || '-'
        const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatar} alt={fullName} />
              <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
            </Avatar>
            <LongText className='max-w-36 font-medium'>{fullName}</LongText>
          </div>
        )
      },
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.email')} />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap' dir='ltr'>
          {row.getValue('email')}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.phone')} />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap' dir='ltr'>
          {row.getValue('phone') || '-'}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.role')} />
      ),
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        const staffRole = staffRoles.find((r) => r.value === role)
        const RoleIcon = staffRole?.icon

        return (
          <div className='flex items-center gap-x-2'>
            {RoleIcon && (
              <RoleIcon size={16} className='text-muted-foreground' />
            )}
            <span className='text-sm'>
              {t(`staff.roles.${role}`)}
            </span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
    },
    {
      accessorKey: 'specialization',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.specialization')} />
      ),
      cell: ({ row }) => {
        const spec = row.getValue('specialization') as string
        return (
          <div className='text-sm'>
            {spec ? t(`staff.specializations.${spec}`) : '-'}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staff.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = staffStatusColors.get(status as any)
        return (
          <div className='flex space-x-2'>
            <Badge variant='outline' className={cn('capitalize', badgeColor)}>
              {t(`staff.statuses.${status}`)}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]
}
