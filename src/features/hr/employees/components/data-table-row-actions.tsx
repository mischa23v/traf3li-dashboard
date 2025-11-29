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
import { useEmployeesContext } from './employees-provider'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@/types/hr'

interface DataTableRowActionsProps {
  row: Row<Employee>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useEmployeesContext()

  const handleView = () => {
    setCurrentRow(row.original)
    setOpen('view')
  }

  const handleEdit = () => {
    setCurrentRow(row.original)
    setOpen('edit')
  }

  const handleDelete = () => {
    setCurrentRow(row.original)
    setOpen('delete')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>{t('common.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          <Eye className='me-2 h-4 w-4' />
          {t('common.view')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='me-2 h-4 w-4' />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
          <Trash2 className='me-2 h-4 w-4' />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
