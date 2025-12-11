import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, Star, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePdfTemplatesContext } from './template-provider'
import type { PdfmeTemplate } from '@/services/pdfmeService'
import { useTranslation } from 'react-i18next'
import pdfmeService from '@/services/pdfmeService'
import { toast } from 'sonner'

interface TemplateRowActionsProps {
  row: Row<PdfmeTemplate>
}

export function TemplateRowActions({ row }: TemplateRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentTemplate } = usePdfTemplatesContext()

  const handleAction = (action: 'view' | 'edit' | 'delete' | 'duplicate' | 'preview' | 'designer') => {
    setCurrentTemplate(row.original)
    setOpen(action)
  }

  const handleSetDefault = async () => {
    try {
      await pdfmeService.setDefaultTemplate(row.original._id)
      toast.success(t('pdfTemplates.setAsDefaultSuccess'))
      // Refresh the table data
      window.location.reload()
    } catch (error) {
      toast.error(t('pdfTemplates.setAsDefaultError'))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('common.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem onClick={() => handleAction('view')}>
          <Eye className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('preview')}>
          <FileSearch className="me-2 h-4 w-4" />
          {t('pdfTemplates.preview')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit')}>
          <Pencil className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('duplicate')}>
          <Copy className="me-2 h-4 w-4" aria-hidden="true" />
          {t('pdfTemplates.duplicate')}
        </DropdownMenuItem>
        {!row.original.isDefault && (
          <DropdownMenuItem onClick={handleSetDefault}>
            <Star className="me-2 h-4 w-4" />
            {t('pdfTemplates.setAsDefault')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className="text-destructive focus:text-destructive"
          disabled={row.original.isDefault}
        >
          <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
