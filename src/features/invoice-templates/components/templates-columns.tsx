import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { TemplatesRowActions } from './templates-row-actions'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { templateTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

export function useTemplatesColumns(): ColumnDef<InvoiceTemplate>[] {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('invoiceTemplates.name')} />
        ),
        cell: ({ row }) => {
          const name = isRTL ? row.original.nameAr : row.original.name
          const templateType = templateTypes.find((type) => type.value === row.original.type)
          const TypeIcon = templateType?.icon

          return (
            <div className="flex items-center gap-3">
              {TypeIcon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <TypeIcon className="h-4 w-4" />
                </div>
              )}
              <div>
                <div className="font-medium">{name}</div>
                {row.original.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {isRTL ? row.original.descriptionAr : row.original.description}
                  </div>
                )}
              </div>
            </div>
          )
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('invoiceTemplates.type')} />
        ),
        cell: ({ row }) => {
          const templateType = templateTypes.find((type) => type.value === row.original.type)
          return (
            <Badge variant="outline">
              {isRTL ? templateType?.labelAr : templateType?.label}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'styling',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('invoiceTemplates.style')} />
        ),
        cell: ({ row }) => {
          const styling = row.original.styling
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: styling.primaryColor }}
              />
              <span className="text-sm capitalize">{styling.tableStyle}</span>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'isDefault',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('invoiceTemplates.default')} />
        ),
        cell: ({ row }) => {
          if (row.original.isDefault) {
            return (
              <Badge variant="default" className="bg-green-500">
                {t('common.default')}
              </Badge>
            )
          }
          return null
        },
      },
      {
        accessorKey: 'isActive',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('common.status')} />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
              {row.original.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id) ? 'active' : 'inactive')
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <TemplatesRowActions row={row} />,
      },
    ],
    [t, isRTL]
  )
}
