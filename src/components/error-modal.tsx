import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Copy, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ErrorModalProps {
  error?: {
    message: string
    requestId?: string
  }
  message?: string
  requestId?: string
  status?: number
  open: boolean
  onClose: () => void
}

export function ErrorModal({ error, message, requestId, status, open, onClose }: ErrorModalProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [copied, setCopied] = useState(false)

  // Support both prop structures: error object or flat props
  const errorMessage = error?.message || message || ''
  const errorRequestId = error?.requestId || requestId

  const handleCopyRequestId = async () => {
    if (errorRequestId) {
      await navigator.clipboard.writeText(errorRequestId)
      setCopied(true)
      toast({
        title: t('common.copiedSuccessfully'),
        description: t('common.referenceIdCopiedToClipboard'),
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
            <DialogTitle className="text-destructive">
              {t('common.errorOccurred')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-destructive/90 pt-2">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>

        {status && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('common.statusCode')}:
              </span>
              <span className="font-mono">{status}</span>
            </div>
          </div>
        )}

        {errorRequestId && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {t('common.referenceId')}
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
                {errorRequestId}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyRequestId}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">
                      {t('common.copied')}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span className="ms-1">{t('common.copy')}</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('common.useReferenceIdWhenContactingSupport')}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
