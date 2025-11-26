import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { clientStatusColors, clientStatuses, contactMethods } from '../data/data'
import { type Client } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'

export const useClientsColumns = (): ColumnDef<Client>[] => {
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
      accessorKey: 'fullName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.fullName')} />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-36 ps-3 font-medium'>
          {row.getValue('fullName')}
        </LongText>
      ),
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.phone')} />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap' dir='ltr'>
          {row.getValue('phone')}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.email')} />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap'>{row.getValue('email') || '-'}</div>
      ),
    },
    {
      accessorKey: 'city',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.city')} />
      ),
      cell: ({ row }) => <div>{row.getValue('city') || '-'}</div>,
      enableSorting: false,
    },
    {
      accessorKey: 'companyName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.companyName')} />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-32'>{row.getValue('companyName') || '-'}</LongText>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'preferredContactMethod',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('clients.columns.contactMethod')}
        />
      ),
      cell: ({ row }) => {
        const method = row.getValue('preferredContactMethod') as string
        const contactMethod = contactMethods.find((m) => m.value === method)
        return (
          <div className='flex items-center gap-x-2'>
            {contactMethod?.icon && (
              <contactMethod.icon size={16} className='text-muted-foreground' />
            )}
            <span className='text-sm'>
              {t(`clients.contactMethods.${method}`)}
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const badgeColor = clientStatusColors.get(status as any)
        return (
          <div className='flex space-x-2'>
            <Badge variant='outline' className={cn('capitalize', badgeColor)}>
              {t(`clients.statuses.${status}`)}
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
