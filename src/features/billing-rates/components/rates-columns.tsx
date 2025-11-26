import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { RatesRowActions } from './rates-row-actions'
import type { BillingRate } from '../data/schema'
import { getRateTypeInfo, getRateCategoryInfo, formatAmount } from '../data/data'
import { useTranslation } from 'react-i18next'

export function useRatesColumns(): ColumnDef<BillingRate>[] {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('common.selectAll')}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('common.selectRow')}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.rateName')} />,
      cell: ({ row }) => {
        const name = isRTL ? row.original.nameAr : row.original.name
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{name}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {isRTL ? row.original.descriptionAr : row.original.description}
              </span>
            )}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.type')} />,
      cell: ({ row }) => {
        const typeInfo = getRateTypeInfo(row.original.type)
        const TypeIcon = typeInfo.icon
        return (
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span>{isRTL ? typeInfo.labelAr : typeInfo.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.category')} />,
      cell: ({ row }) => {
        const categoryInfo = getRateCategoryInfo(row.original.category)
        return (
          <Badge variant="outline">
            {isRTL ? categoryInfo.labelAr : categoryInfo.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.amount')} />,
      cell: ({ row }) => {
        const amount = row.original.amount
        const currency = row.original.currency
        const unit = row.original.unit
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {formatAmount(amount, currency, isRTL)}
            </span>
            {unit && (
              <span className="text-xs text-muted-foreground">
                / {isRTL ? (unit === 'hour' ? 'ساعة' : unit) : unit}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.status')} />,
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? t('common.active') : t('common.inactive')}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)?.toString()),
    },
    {
      id: 'actions',
      cell: ({ row }) => <RatesRowActions row={row} />,
    },
  ]
}
