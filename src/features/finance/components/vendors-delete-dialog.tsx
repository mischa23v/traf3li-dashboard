'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Vendor } from '@/services/accountingService'
import { useDeleteVendor } from '@/hooks/useAccounting'

type VendorsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Vendor
}

export function VendorsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: VendorsDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { mutate: deleteVendor, isPending } = useDeleteVendor()

  const vendorName = currentRow.nameAr || currentRow.name

  const handleDelete = () => {
    if (value.trim() !== vendorName) return

    deleteVendor(currentRow._id, {
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
      disabled={value.trim() !== vendorName || isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          حذف المورد
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            هل أنت متأكد من حذف المورد <strong>{vendorName}</strong>؟
          </p>

          <Label className='my-2'>
            اسم المورد:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`اكتب "${vendorName}" للتأكيد`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>تحذير</AlertTitle>
            <AlertDescription>
              سيتم حذف جميع البيانات المتعلقة بهذا المورد. لا يمكن التراجع عن هذا الإجراء.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="حذف"
      destructive
    />
  )
}
