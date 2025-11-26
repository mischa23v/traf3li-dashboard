'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Contact } from '../data/schema'
import { useDeleteContact } from '@/hooks/useContacts'
import { useTranslation } from 'react-i18next'

type ContactsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Contact
}

export function ContactsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ContactsDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const { mutate: deleteContact, isPending } = useDeleteContact()

  const fullName = `${currentRow.firstName} ${currentRow.lastName}`

  const handleDelete = () => {
    if (value.trim() !== fullName) return

    deleteContact(currentRow._id, {
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
          {t('contacts.deleteContact')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('contacts.deleteConfirmation', { name: fullName })}
          </p>

          <Label className='my-2'>
            {t('contacts.columns.name')}:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('contacts.deleteInputPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            <AlertDescription>
              {t('contacts.deleteWarning')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete')}
      destructive
    />
  )
}
