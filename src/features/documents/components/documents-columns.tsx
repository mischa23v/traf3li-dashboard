import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { type Document } from '../data/schema'
import { getCategoryInfo, formatFileSize, getFileIcon } from '../data/data'
import { Lock, History, Link as LinkIcon } from 'lucide-react'
import i18n from '@/i18n'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export const columns: ColumnDef<Document>[] = [
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
    accessorKey: 'originalName',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('documents.fileName')}
      />
    ),
    cell: ({ row }) => {
      const doc = row.original
      const fileIcon = getFileIcon(doc.fileType)

      return (
        <div className='flex items-center gap-2 max-w-[300px]'>
          <span className='text-xl'>{fileIcon}</span>
          <div className='flex flex-col min-w-0'>
            <span className='font-medium truncate'>{doc.originalName}</span>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{formatFileSize(doc.fileSize)}</span>
              {doc.version > 1 && (
                <Badge variant='outline' className='h-4 px-1 text-[10px]'>
                  <History className='h-2.5 w-2.5 me-0.5' />
                  v{doc.version}
                </Badge>
              )}
              {doc.isEncrypted && (
                <Lock className='h-3 w-3 text-amber-500' />
              )}
              {doc.shareToken && (
                <LinkIcon className='h-3 w-3 text-blue-500' />
              )}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('documents.category')}
      />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      const info = getCategoryInfo(category)
      const isArabic = i18n.language === 'ar'

      return (
        <Badge
          variant='outline'
          style={{ borderColor: info.color, color: info.color }}
        >
          {isArabic ? info.labelAr : info.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'caseId',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('documents.linkedCase')}
      />
    ),
    cell: ({ row }) => {
      const caseId = row.original.caseId
      if (!caseId) return <span className='text-muted-foreground'>-</span>

      if (typeof caseId === 'object') {
        return (
          <div className='flex flex-col'>
            <span className='text-xs font-medium'>{caseId.caseNumber}</span>
            <span className='text-xs text-muted-foreground truncate max-w-[150px]'>
              {caseId.title}
            </span>
          </div>
        )
      }

      return <span className='text-xs'>{caseId}</span>
    },
  },
  {
    accessorKey: 'isConfidential',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('documents.confidential')}
      />
    ),
    cell: ({ row }) => {
      const isConfidential = row.getValue('isConfidential') as boolean
      return isConfidential ? (
        <Badge variant='destructive' className='gap-1'>
          <Lock className='h-3 w-3' />
          {i18n.t('documents.confidential')}
        </Badge>
      ) : null
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={i18n.t('common.createdAt')}
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      const isArabic = i18n.language === 'ar'
      try {
        return format(new Date(date), 'PPp', {
          locale: isArabic ? ar : enUS,
        })
      } catch {
        return date
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
