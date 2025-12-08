import { memo } from 'react'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Trash2, UserMinus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Staff } from '../data/schema'
import { useStaffContext } from './staff-provider'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableRowActionsProps = {
  row: Row<Staff>
}

export const DataTableRowActions = memo(function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useStaffContext()
  const { isAdminOrOwner, canEdit, canDelete } = usePermissions()

  const isDeparted = row.original.status === 'departed' || row.original.role === 'departed'
  const canManage = isAdminOrOwner()
  const hasEditPermission = canEdit('team')
  const hasDeletePermission = canDelete('team')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>{t('common.actions')}</span>
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

        {hasEditPermission && !isDeparted && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            <Pencil className='me-2 h-4 w-4' />
            {t('common.edit')}
          </DropdownMenuItem>
        )}

        {/* Departure option for active employees (Admin only) */}
        {canManage && !isDeparted && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('depart')
              }}
              className='text-amber-600 focus:text-amber-600'
            >
              <UserMinus className='me-2 h-4 w-4' />
              معالجة المغادرة
            </DropdownMenuItem>
          </>
        )}

        {/* Reinstate option for departed employees (Admin only) */}
        {canManage && isDeparted && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('reinstate')
              }}
              className='text-teal-600 focus:text-teal-600'
            >
              <UserPlus className='me-2 h-4 w-4' />
              إعادة التفعيل
            </DropdownMenuItem>
          </>
        )}

        {hasDeletePermission && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
              className='text-destructive focus:text-destructive'
            >
              <Trash2 className='me-2 h-4 w-4' />
              {t('common.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
