'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const { t } = useTranslation()

  const CONFIRM_WORD = t('tasks.dialogs.confirmWord')
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(t('tasks.toast.pleaseTypeConfirm', { word: CONFIRM_WORD }))
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: t('tasks.toast.deletingTasks'),
      success: () => {
        table.resetRowSelection()
        return t('tasks.toast.tasksDeleted', { count: selectedRows.length })
      },
      error: t('tasks.toast.error'),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('tasks.dialogs.bulkDeleteTitle', { count: selectedRows.length })}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('tasks.dialogs.bulkDeleteDescription')}
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>{t('tasks.dialogs.confirmPrompt', { word: CONFIRM_WORD })}</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('tasks.dialogs.confirmPlaceholder', { word: CONFIRM_WORD })}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('tasks.dialogs.warning')}</AlertTitle>
            <AlertDescription>
              {t('tasks.dialogs.warningMessage')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('tasks.actions.delete')}
      destructive
    />
  )
}
