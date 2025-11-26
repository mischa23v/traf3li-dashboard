import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { type Tag } from '../data/schema'
import { getEntityTypeInfo } from '../data/data'
import i18n from '@/i18n'

export const columns: ColumnDef<Tag>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('tags.tagName')}
      />
    ),
    cell: ({ row }) => {
      const tag = row.original
      const isArabic = i18n.language === 'ar'
      const displayName = isArabic && tag.nameAr ? tag.nameAr : tag.name

      return (
        <div className='flex items-center gap-2'>
          <div
            className='h-4 w-4 rounded-full shrink-0'
            style={{ backgroundColor: tag.color }}
          />
          <span className='font-medium'>{displayName}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('tags.entityType')}
      />
    ),
    cell: ({ row }) => {
      const entityType = row.getValue('entityType') as string
      const info = getEntityTypeInfo(entityType || 'all')
      const isArabic = i18n.language === 'ar'

      return (
        <Badge variant='outline'>
          {isArabic ? info.labelAr : info.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'usageCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('tags.usageCount')}
      />
    ),
    cell: ({ row }) => {
      const count = row.getValue('usageCount') as number
      return (
        <Badge variant='secondary'>
          {count || 0}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('common.description')}
      />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <span className='text-muted-foreground line-clamp-1'>
          {description || '-'}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
