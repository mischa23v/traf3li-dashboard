import { type ColumnDef } from '@tanstack/react-table'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { maskPhone } from '@/utils/data-masking'

// Memoized cell components for better performance
const UsernameCell = memo(({ username }: { username: string }) => (
  <LongText className='max-w-36 ps-3'>{username}</LongText>
))

const FullNameCell = memo(({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const fullName = `${firstName} ${lastName}`
  return <LongText className='max-w-36'>{fullName}</LongText>
})

const StatusCell = memo(({ status }: { status: string }) => {
  const badgeColor = callTypes.get(status)
  return (
    <div className='flex gap-2'>
      <Badge variant='outline' className={cn('capitalize', badgeColor)}>
        {status}
      </Badge>
    </div>
  )
})

const RoleCell = memo(({ role }: { role: string }) => {
  const userType = roles.find(({ value }) => value === role)

  if (!userType) {
    return null
  }

  return (
    <div className='flex items-center gap-x-2'>
      {userType.icon && (
        <userType.icon size={16} className='text-muted-foreground' />
      )}
      <span className='text-sm capitalize'>{role}</span>
    </div>
  )
})

export const usersColumns: ColumnDef<User>[] = [
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
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
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
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => <UsernameCell username={row.getValue('username')} />,
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <FullNameCell firstName={row.original.firstName} lastName={row.original.lastName} />
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div dir='ltr'>{maskPhone(row.getValue('phoneNumber'))}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <StatusCell status={row.original.status} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => <RoleCell role={row.original.role} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
