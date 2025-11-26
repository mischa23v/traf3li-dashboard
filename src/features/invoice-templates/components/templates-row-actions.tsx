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
import { useTemplatesContext } from './templates-provider'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { useTranslation } from 'react-i18next'

interface TemplatesRowActionsProps {
  row: Row<InvoiceTemplate>
}

export function TemplatesRowActions({ row }: TemplatesRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentTemplate } = useTemplatesContext()

  const handleAction = (action: 'view' | 'edit' | 'delete' | 'duplicate' | 'preview') => {
    setCurrentTemplate(row.original)
    setOpen(action)
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
          <Eye className="me-2 h-4 w-4" />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('preview')}>
          <FileSearch className="me-2 h-4 w-4" />
          {t('invoiceTemplates.preview')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit')}>
          <Pencil className="me-2 h-4 w-4" />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('duplicate')}>
          <Copy className="me-2 h-4 w-4" />
          {t('invoiceTemplates.duplicate')}
        </DropdownMenuItem>
        {!row.original.isDefault && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentTemplate(row.original)
              setOpen('settings')
            }}
          >
            <Star className="me-2 h-4 w-4" />
            {t('invoiceTemplates.setAsDefault')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className="text-destructive focus:text-destructive"
          disabled={row.original.isDefault}
        >
          <Trash2 className="me-2 h-4 w-4" />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
