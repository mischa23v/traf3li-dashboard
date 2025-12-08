import { memo } from 'react'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRatesContext } from './rates-provider'
import type { RateGroup } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface GroupsRowActionsProps {
  row: Row<RateGroup>
}

export const GroupsRowActions = memo(function GroupsRowActions({ row }: GroupsRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentGroup } = useRatesContext()

  const handleAction = (action: 'view-group' | 'edit-group' | 'delete-group') => {
    setCurrentGroup(row.original)
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
        <DropdownMenuItem onClick={() => handleAction('view-group')}>
          <Eye className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('edit-group')}>
          <Pencil className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction('delete-group')}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
