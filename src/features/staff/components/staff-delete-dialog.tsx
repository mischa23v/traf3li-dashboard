'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Staff } from '../data/schema'
import { useDeleteStaff } from '@/hooks/useStaff'
import { useTranslation } from 'react-i18next'

type StaffDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Staff
}

export function StaffDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: StaffDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const { mutate: deleteStaff, isPending } = useDeleteStaff()

  const fullName = `${currentRow.firstName} ${currentRow.lastName}`

  const handleDelete = () => {
    if (value.trim() !== fullName) return

    deleteStaff(currentRow._id, {
      onSuccess: () => {
        setValue('')
        onOpenChange(false)
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        setValue('')
        onOpenChange(state)
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== fullName || isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('staff.deleteStaff')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('staff.deleteConfirmation', { name: fullName })}
          </p>

          <Label className='my-2'>
            {t('staff.columns.name')}:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('staff.deleteInputPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            <AlertDescription>
              {t('staff.deleteWarning')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete')}
      destructive
    />
  )
}
