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
  error: {
    message: string
    requestId?: string
  }
  open: boolean
  onClose: () => void
}

export function ErrorModal({ error, open, onClose }: ErrorModalProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [copied, setCopied] = useState(false)

  const handleCopyRequestId = async () => {
    if (error.requestId) {
      await navigator.clipboard.writeText(error.requestId)
      setCopied(true)
      toast({
        title: isArabic ? 'تم النسخ بنجاح' : 'Copied successfully',
        description: isArabic
          ? 'تم نسخ رقم المرجع إلى الحافظة'
          : 'Reference ID copied to clipboard',
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
              {isArabic ? 'حدث خطأ' : 'Error Occurred'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-destructive/90 pt-2">
            {error.message}
          </DialogDescription>
        </DialogHeader>

        {error.requestId && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {isArabic ? 'رقم المرجع' : 'Reference ID'}
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
                {error.requestId}
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
                      {isArabic ? 'تم النسخ' : 'Copied'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span className="ms-1">{isArabic ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic
                ? 'استخدم رقم المرجع هذا عند التواصل مع الدعم الفني'
                : 'Use this reference ID when contacting support'}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
