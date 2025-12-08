/**
 * ErrorModal Component
 * Displays error messages in a modal dialog
 */

import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ErrorModalProps {
  open: boolean
  onClose: () => void
  message: string
  requestId?: string
  status?: number
}

export const ErrorModal = ({
  open,
  onClose,
  message,
  requestId,
  status,
}: ErrorModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>خطأ</DialogTitle>
          </div>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        {(requestId || status) && (
          <div className="rounded-md bg-muted p-3 text-sm">
            {status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">رمز الحالة:</span>
                <span className="font-mono">{status}</span>
              </div>
            )}
            {requestId && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">معرّف الطلب:</span>
                <span className="font-mono text-xs">{requestId}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} variant="default">
            حسناً
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ErrorModal
