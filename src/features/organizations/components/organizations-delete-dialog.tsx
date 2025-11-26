'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Organization } from '../data/schema'
import { useDeleteOrganization } from '@/hooks/useOrganizations'
import { useTranslation } from 'react-i18next'

type OrganizationsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Organization
}

export function OrganizationsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: OrganizationsDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const { mutate: deleteOrganization, isPending } = useDeleteOrganization()

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return

    deleteOrganization(currentRow._id, {
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
      disabled={value.trim() !== currentRow.name || isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('organizations.deleteOrganization')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('organizations.deleteConfirmation', { name: currentRow.name })}
          </p>

          <Label className='my-2'>
            {t('organizations.columns.name')}:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('organizations.deleteInputPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            <AlertDescription>
              {t('organizations.deleteWarning')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete')}
      destructive
    />
  )
}
