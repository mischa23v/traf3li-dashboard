import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import type { WorkflowTemplate } from '../data/schema'
import { getCaseCategoryInfo } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export function useWorkflowsColumns(): ColumnDef<WorkflowTemplate>[] {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const dateLocale = isRTL ? ar : enUS

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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('caseWorkflows.name')} />,
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
      accessorKey: 'caseCategory',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('caseWorkflows.caseCategory')} />,
      cell: ({ row }) => {
        const category = getCaseCategoryInfo(row.original.caseCategory)
        const CategoryIcon = category.icon
        return (
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            <span>{isRTL ? category.labelAr : category.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'stages',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('caseWorkflows.stages')} />,
      cell: ({ row }) => {
        const stages = row.original.stages || []
        return (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {stages.slice(0, 5).map((stage, index) => (
                <div
                  key={stage._id || index}
                  className="w-3 h-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: stage.color }}
                  title={isRTL ? stage.nameAr : stage.name}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground ms-2">{stages.length}</span>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'isDefault',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('caseWorkflows.default')} />,
      cell: ({ row }) => {
        return row.original.isDefault ? (
          <Badge variant="default" className="bg-primary">
            {t('caseWorkflows.default')}
          </Badge>
        ) : null
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)?.toString()),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('caseWorkflows.status')} />,
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? t('caseWorkflows.active') : t('caseWorkflows.inactive')}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)?.toString()),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('common.createdAt')} />,
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.createdAt), 'PPP', { locale: dateLocale })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
