import { type Row } from '@tanstack/react-table'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash,
  Check,
  Calendar,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFollowupsContext } from './followups-provider'
import { type Followup } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface DataTableRowActionsProps {
  row: Row<Followup>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useFollowupsContext()
  const followup = row.original
  const isPending = followup.status === 'pending'

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
            setCurrentRow(followup)
            setOpen('view')
          }}
        >
          <Eye className='me-2 h-4 w-4' />
          {t('common.view')}
        </DropdownMenuItem>
        {isPending && (
          <>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(followup)
                setOpen('complete')
              }}
            >
              <Check className='me-2 h-4 w-4' />
              {t('followups.markComplete')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(followup)
                setOpen('reschedule')
              }}
            >
              <Calendar className='me-2 h-4 w-4' />
              {t('followups.reschedule')}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(followup)
            setOpen('edit')
          }}
        >
          <Pencil className='me-2 h-4 w-4' />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(followup)
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
