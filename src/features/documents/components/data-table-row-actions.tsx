import { Row } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash,
  Download,
  History,
  Share2,
  Lock,
  Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDocumentsContext } from './documents-provider'
import { useDownloadDocument } from '@/hooks/useDocuments'
import { type Document } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface DataTableRowActionsProps {
  row: Row<Document>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useDocumentsContext()
  const downloadDocument = useDownloadDocument()

  const handleDownload = () => {
    downloadDocument.mutate({
      id: row.original._id,
      fileName: row.original.originalName,
    })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>{t('common.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('view')
          }}
        >
          <Eye className='me-2 h-4 w-4' />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className='me-2 h-4 w-4' />
          {t('common.download')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('versions')
          }}
        >
          <History className='me-2 h-4 w-4' />
          {t('documents.versions')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('share')
          }}
        >
          <Share2 className='me-2 h-4 w-4' />
          {t('documents.share')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('edit')
          }}
        >
          <Pencil className='me-2 h-4 w-4' />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash className='me-2 h-4 w-4' />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
