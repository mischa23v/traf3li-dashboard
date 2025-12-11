import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { TemplateRowActions } from './template-row-actions'
import type { PdfmeTemplate } from '@/services/pdfmeService'
import { templateCategories, templateTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export function usePdfTemplateColumns(): ColumnDef<PdfmeTemplate>[] {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? ar : enUS

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
          <DataTableColumnHeader column={column} title={t('pdfTemplates.table.columns.name')} />
        ),
        cell: ({ row }) => {
          const name = isRTL ? row.original.nameAr : row.original.name
          const category = templateCategories.find((cat) => cat.value === row.original.category)
          const CategoryIcon = category?.icon

          return (
            <div className="flex items-center gap-3">
              {CategoryIcon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <CategoryIcon className="h-4 w-4" />
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
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('pdfTemplates.table.columns.category')} />
        ),
        cell: ({ row }) => {
          const category = templateCategories.find((cat) => cat.value === row.original.category)
          const CategoryIcon = category?.icon
          return (
            <Badge variant="outline" className="gap-1">
              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
              {isRTL ? category?.labelAr : category?.label}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('pdfTemplates.table.columns.type')} />
        ),
        cell: ({ row }) => {
          const templateType = templateTypes.find((type) => type.value === row.original.type)
          return (
            <Badge variant="secondary">
              {isRTL ? templateType?.labelAr : templateType?.label}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'isDefault',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('pdfTemplates.table.columns.isDefault')} />
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
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('common.createdAt')} />
        ),
        cell: ({ row }) => {
          return (
            <div className="text-sm text-muted-foreground">
              {format(new Date(row.original.createdAt), 'PPp', { locale })}
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        cell: ({ row }) => <TemplateRowActions row={row} />,
      },
    ],
    [t, isRTL, locale]
  )
}
