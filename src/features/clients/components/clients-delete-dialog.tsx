'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Client } from '../data/schema'
import { useDeleteClient } from '@/hooks/useClients'
import { useTranslation } from 'react-i18next'

// Helper to get display name for a client
const getClientDisplayName = (client: Client): string => {
  if (client.clientType === 'individual' || !client.clientType) {
    return client.fullNameArabic || client.fullNameEnglish ||
           [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
  }
  return client.companyName || client.companyNameEnglish || '-'
}

type ClientDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Client
}

export function ClientsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ClientDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const { mutate: deleteClient, isPending } = useDeleteClient()

  const displayName = getClientDisplayName(currentRow)

  const handleDelete = () => {
    if (value.trim() !== displayName) return

    deleteClient(currentRow._id, {
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
      disabled={value.trim() !== displayName || isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('clients.deleteClient')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t('clients.deleteConfirmation', { name: displayName })}
          </p>

          <Label className='my-2'>
            {t('clients.form.fullName')}:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('clients.deleteInputPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            <AlertDescription>
              {t('clients.deleteWarning')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete')}
      destructive
    />
  )
}
