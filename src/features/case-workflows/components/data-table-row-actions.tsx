import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2, Copy, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkflowsContext } from './workflows-provider'
import type { WorkflowTemplate } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface DataTableRowActionsProps {
  row: Row<WorkflowTemplate>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useWorkflowsContext()

  const handleAction = (action: 'view' | 'edit' | 'delete' | 'duplicate' | 'stages') => {
    setCurrentRow(row.original)
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
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => handleAction('view')}>
          <Eye className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('stages')}>
          <GitBranch className="me-2 h-4 w-4" />
          {t('caseWorkflows.manageStages')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit')}>
          <Pencil className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('duplicate')}>
          <Copy className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.duplicate')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
