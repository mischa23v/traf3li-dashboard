import { type ColumnDef } from '@tanstack/react-table'
import { useMemo, memo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { BadgeCheck, AlertCircle } from 'lucide-react'
import { clientStatusColors, clientStatuses, contactMethods, identityTypes, verificationStatusColors } from '../data/data'
import { type Client } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useTranslation } from 'react-i18next'
import { maskPhone, maskEmail } from '@/utils/data-masking'

// Helper to get display name for a client
const getDisplayName = (client: Client): string => {
  // For individual clients, prefer fullNameArabic
  if (client.clientType === 'individual' || !client.clientType) {
    return client.fullNameArabic || client.fullNameEnglish ||
           [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
  }
  // For company clients, use companyName
  return client.companyName || client.companyNameEnglish || '-'
}

// Memoized cell components
const ContactMethodCell = memo(({ method, label }: { method: string; label: string }) => {
  const contactMethod = contactMethods.find((m) => m.value === method)
  return (
    <div className='flex items-center gap-2'>
      {contactMethod?.icon && (
        <contactMethod.icon size={16} className='text-muted-foreground' />
      )}
      <span className='text-sm'>{label}</span>
    </div>
  )
})

const IdentityTypeCell = memo(({ idType, label }: { idType: string; label: string }) => {
  const identityType = identityTypes.find((i) => i.value === idType)
  const IdIcon = identityType?.icon
  return (
    <div className='flex items-center gap-2'>
      {IdIcon && <IdIcon size={16} className='text-muted-foreground' />}
      <span className='text-sm'>{label}</span>
    </div>
  )
})

const VerificationCell = memo(({ isVerified, verifiedLabel, notVerifiedLabel }: { isVerified: boolean; verifiedLabel: string; notVerifiedLabel: string }) => {
  const badgeColor = verificationStatusColors.get(isVerified ? 'verified' : 'not_verified')
  return (
    <div className='flex items-center gap-2'>
      {isVerified ? (
        <BadgeCheck size={16} className='text-emerald-600' />
      ) : (
        <AlertCircle size={16} className='text-muted-foreground' />
      )}
      <Badge variant='outline' className={cn('text-xs', badgeColor)}>
        {isVerified ? verifiedLabel : notVerifiedLabel}
      </Badge>
    </div>
  )
})

const StatusCell = memo(({ status, label }: { status: string; label: string }) => {
  const badgeColor = clientStatusColors.get(status as any)
  return (
    <div className='flex gap-2'>
      <Badge variant='outline' className={cn('capitalize', badgeColor)}>
        {label}
      </Badge>
    </div>
  )
})

export const useClientsColumns = (): ColumnDef<Client>[] => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return useMemo(() => [
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
      accessorFn: (row) => getDisplayName(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.fullName')} />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-36 ps-3 font-medium'>
          {getDisplayName(row.original)}
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
          {maskPhone(row.getValue('phone'))}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.email')} />
      ),
      cell: ({ row }) => (
        <div className='w-fit ps-2 text-nowrap'>{maskEmail(row.getValue('email')) || '-'}</div>
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
      id: 'preferredContactMethod',
      accessorFn: (row) => row.preferredContactMethod || row.preferredContact || 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('clients.columns.contactMethod')}
        />
      ),
      cell: ({ row }) => {
        const method = (row.original.preferredContactMethod || row.original.preferredContact || 'phone') as string
        return (
          <ContactMethodCell
            method={method}
            label={t(`clients.contactMethods.${method}`)}
          />
        )
      },
      filterFn: (row, id, value) => {
        const method = row.original.preferredContactMethod || row.original.preferredContact || 'phone'
        return value.includes(method)
      },
      enableSorting: false,
    },
    {
      id: 'identityType',
      accessorFn: (row) => row.identityType || 'national_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.identityType')} />
      ),
      cell: ({ row }) => {
        const idType = row.original.identityType || 'national_id'
        const identityType = identityTypes.find((i) => i.value === idType)
        return (
          <IdentityTypeCell
            idType={idType}
            label={isArabic ? identityType?.label || '' : identityType?.labelEn || ''}
          />
        )
      },
      enableSorting: false,
    },
    {
      id: 'isVerified',
      accessorFn: (row) => row.isVerified,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.verified')} />
      ),
      cell: ({ row }) => (
        <VerificationCell
          isVerified={row.original.isVerified}
          verifiedLabel={t('clients.verified')}
          notVerifiedLabel={t('clients.notVerified')}
        />
      ),
      enableSorting: false,
    },
    {
      id: 'status',
      accessorFn: (row) => row.status || 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('clients.columns.status')} />
      ),
      cell: ({ row }) => {
        const status = (row.original.status || 'active') as string
        return (
          <StatusCell
            status={status}
            label={t(`clients.statuses.${status}`)}
          />
        )
      },
      filterFn: (row, id, value) => {
        const status = row.original.status || 'active'
        return value.includes(status)
      },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ], [t, isArabic])
}
