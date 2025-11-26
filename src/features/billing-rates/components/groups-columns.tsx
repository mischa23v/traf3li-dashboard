import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { GroupsRowActions } from './groups-row-actions'
import type { RateGroup } from '../data/schema'
import { applicableToOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

export function useGroupsColumns(): ColumnDef<RateGroup>[] {
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.groupName')} />,
      cell: ({ row }) => {
        const name = isRTL ? row.original.nameAr : row.original.name
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: row.original.color }}
            />
            <div className="flex flex-col gap-1">
              <span className="font-medium">{name}</span>
              {row.original.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {isRTL ? row.original.descriptionAr : row.original.description}
                </span>
              )}
            </div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'rates',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.ratesCount')} />,
      cell: ({ row }) => {
        const ratesCount = row.original.rates?.length || 0
        return (
          <span className="text-muted-foreground">
            {ratesCount} {isRTL ? 'أسعار' : 'rates'}
          </span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'discount',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.discount')} />,
      cell: ({ row }) => {
        const discount = row.original.discount
        if (!discount) return <span className="text-muted-foreground">-</span>
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {discount}%
          </Badge>
        )
      },
    },
    {
      accessorKey: 'applicableTo',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.applicableTo')} />,
      cell: ({ row }) => {
        const applicableTo = row.original.applicableTo || []
        return (
          <div className="flex flex-wrap gap-1">
            {applicableTo.map((type) => {
              const option = applicableToOptions.find((o) => o.value === type)
              return (
                <Badge key={type} variant="outline" className="text-xs">
                  {isRTL ? option?.labelAr : option?.label}
                </Badge>
              )
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'isDefault',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('billingRates.default')} />,
      cell: ({ row }) => {
        return row.original.isDefault ? (
          <Badge variant="default">{t('billingRates.default')}</Badge>
        ) : null
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
      cell: ({ row }) => <GroupsRowActions row={row} />,
    },
  ]
}
