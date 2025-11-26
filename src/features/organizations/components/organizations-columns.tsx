'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { organizationStatusColors, organizationTypes, organizationSizes } from '../data/data'
import { type Organization } from '../data/schema'
import { OrganizationsRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'

export function useOrganizationsColumns(): ColumnDef<Organization>[] {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

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
        <DataTableColumnHeader column={column} title={t('organizations.columns.name')} />
      ),
      cell: ({ row }) => {
        const name = isArabic && row.original.nameAr ? row.original.nameAr : row.original.name
        const type = organizationTypes.find((t) => t.value === row.original.type)
        const Icon = type?.icon
        return (
          <div className='flex items-center gap-3'>
            {Icon && (
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted'>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </div>
            )}
            <div className='flex flex-col'>
              <span className='font-medium'>{name}</span>
              {row.original.registrationNumber && (
                <span className='text-xs text-muted-foreground' dir='ltr'>
                  CR: {row.original.registrationNumber}
                </span>
              )}
            </div>
          </div>
        )
      },
      enableSorting: true,
      filterFn: (row, _id, filterValue) => {
        const name = row.original.name.toLowerCase()
        const nameAr = row.original.nameAr?.toLowerCase() || ''
        return name.includes(filterValue.toLowerCase()) || nameAr.includes(filterValue.toLowerCase())
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.type')} />
      ),
      cell: ({ row }) => {
        const type = organizationTypes.find((t) => t.value === row.getValue('type'))
        if (!type) return null
        return <span>{t(`organizations.types.${row.getValue('type')}`)}</span>
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.phone')} />
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
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.email')} />
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
      accessorKey: 'city',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.city')} />
      ),
      cell: ({ row }) => {
        const city = row.getValue('city') as string
        if (!city) return <span className='text-muted-foreground'>-</span>
        return <span>{city}</span>
      },
    },
    {
      accessorKey: 'size',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.size')} />
      ),
      cell: ({ row }) => {
        const sizeValue = row.getValue('size') as string
        if (!sizeValue) return <span className='text-muted-foreground'>-</span>
        return <span>{t(`organizations.sizes.${sizeValue}`)}</span>
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('organizations.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant='outline'
            className={cn('capitalize', organizationStatusColors.get(status))}
          >
            {t(`organizations.statuses.${status}`)}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <OrganizationsRowActions row={row} />,
    },
  ]
}
