'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
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

const CONFIRM_WORD = 'حذف'

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`يرجى كتابة "${CONFIRM_WORD}" للتأكيد.`)
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: 'جاري حذف المهام...',
      success: () => {
        table.resetRowSelection()
        return `تم حذف ${selectedRows.length} ${
          selectedRows.length > 1 ? 'مهام' : 'مهمة'
        }`
      },
      error: 'خطأ',
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
          حذف {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'مهام' : 'مهمة'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            هل أنت متأكد من حذف المهام المحددة؟ <br />
            لا يمكن التراجع عن هذا الإجراء.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>أكد بكتابة "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`اكتب "${CONFIRM_WORD}" للتأكيد.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>تحذير!</AlertTitle>
            <AlertDescription>
              يرجى الانتباه، لا يمكن التراجع عن هذه العملية.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='حذف'
      destructive
    />
  )
}
