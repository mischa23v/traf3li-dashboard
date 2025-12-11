'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/data-table'
import { contactStatusColors, contactTypes, contactCategories } from '../data/data'
import { type Contact } from '../data/schema'
import { ContactsRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'

// Match clients-columns pattern exactly - NO useMemo
// The `t` function changes reference on every render, causing useMemo with [t] dependency to trigger infinite loops
export function useContactsColumns(): ColumnDef<Contact>[] {
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.name')} />
      ),
      cell: ({ row }) => {
        const firstName = row.original.firstName || ''
        const lastName = row.original.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || '-'
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='font-medium'>{fullName}</span>
              {row.original.company && (
                <span className='text-xs text-muted-foreground'>
                  {row.original.company}
                </span>
              )}
            </div>
          </div>
        )
      },
      enableSorting: true,
      filterFn: (row, _id, filterValue) => {
        const fullName = `${row.original.firstName || ''} ${row.original.lastName || ''}`.toLowerCase()
        return fullName.includes(filterValue.toLowerCase())
      },
    },
    {
      id: 'type',
      accessorFn: (row) => row.type || 'individual',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.type')} />
      ),
      cell: ({ row }) => {
        const typeValue = row.original.type || 'individual'
        const type = contactTypes.find((t) => t.value === typeValue)
        if (!type) return <span className='text-muted-foreground'>-</span>
        const Icon = type.icon
        return (
          <div className='flex items-center gap-2'>
            <Icon className='h-4 w-4 text-muted-foreground' />
            <span>{t(`contacts.types.${typeValue}`)}</span>
          </div>
        )
      },
      filterFn: (row, id, value: string[]) => {
        const typeValue = row.original.type || 'individual'
        return value.includes(typeValue)
      },
    },
    {
      id: 'category',
      accessorFn: (row) => row.category || row.primaryRole,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.category')} />
      ),
      cell: ({ row }) => {
        const categoryValue = row.original.category || row.original.primaryRole
        if (!categoryValue) return <span className='text-muted-foreground'>-</span>
        const category = contactCategories.find((c) => c.value === categoryValue)
        if (!category) return <span>{categoryValue}</span>
        return <span>{t(`contacts.categories.${categoryValue}`)}</span>
      },
      filterFn: (row, id, value: string[]) => {
        const categoryValue = row.original.category || row.original.primaryRole
        return categoryValue ? value.includes(categoryValue) : false
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.email')} />
      ),
      cell: ({ row }) => {
        const email = row.getValue('email') as string
        if (!email) return <span className='text-muted-foreground'>-</span>
        return (
          <span className='text-sm' dir='ltr'>
            {email}
          </span>
        )
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.phone')} />
      ),
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string
        if (!phone) return <span className='text-muted-foreground'>-</span>
        return (
          <span className='font-medium' dir='ltr'>
            {phone}
          </span>
        )
      },
    },
    {
      accessorKey: 'city',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.city')} />
      ),
      cell: ({ row }) => {
        const city = row.getValue('city') as string
        if (!city) return <span className='text-muted-foreground'>-</span>
        return <span>{city}</span>
      },
    },
    {
      id: 'status',
      accessorFn: (row) => row.status || 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('contacts.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = (row.original.status || 'active') as string
        return (
          <Badge
            variant='outline'
            className={cn('capitalize', contactStatusColors.get(status))}
          >
            {t(`contacts.statuses.${status}`)}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => {
        const status = row.original.status || 'active'
        return value.includes(status)
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <ContactsRowActions row={row} />,
    },
  ]
}
