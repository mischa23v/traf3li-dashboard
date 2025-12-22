'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Download, Check, RefreshCw, Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { regenerateBackupCodes } from '@/services/mfa.service'

interface BackupCodesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  backupCodes: string[]
  onRegenerate?: (newCodes: string[]) => void
}

export function BackupCodesModal({
  open,
  onOpenChange,
  backupCodes,
  onRegenerate,
}: BackupCodesModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [copied, setCopied] = React.useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = React.useState(false)
  const [isRegenerating, setIsRegenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [codes, setCodes] = React.useState<string[]>(backupCodes)

  // Update codes when prop changes
  React.useEffect(() => {
    setCodes(backupCodes)
  }, [backupCodes])

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setCopied(false)
      setError(null)
    }
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy backup codes:', err)
    }
  }

  const handleDownload = () => {
    const content = `Traf3li - MFA Backup Codes
==============================
${t('mfa.backup.warning')}

${codes.join('\n')}

Generated: ${new Date().toISOString()}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'traf3li-mfa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true)
  }

  const handleRegenerate = async () => {
    setShowRegenerateConfirm(false)
    setIsRegenerating(true)
    setError(null)

    try {
      // Backend: POST /api/auth/mfa/backup-codes/regenerate - no body needed
      const response = await regenerateBackupCodes()
      if (!response.error && response.codes) {
        setCodes(response.codes)
        onRegenerate?.(response.codes)
      } else {
        setError(t('mfa.errors.verificationFailed'))
      }
    } catch (err: any) {
      const message = err.response?.data?.messageEn || err.response?.data?.message
      setError(message || t('mfa.errors.verificationFailed'))
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('mfa.backup.title')}</DialogTitle>
            <DialogDescription>{t('mfa.backup.description')}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('mfa.backup.warning')}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {codes.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
                {codes.map((code, index) => (
                  <code
                    key={index}
                    className="rounded bg-background px-2 py-1 text-center font-mono text-sm"
                  >
                    {code}
                  </code>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('mfa.backup.codesRemaining', { count: 0 })}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={codes.length === 0}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? t('mfa.backup.copied') : t('mfa.backup.copy')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={codes.length === 0}
              >
                <Download className="h-4 w-4" />
                {t('mfa.backup.download')}
              </Button>
              {onRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateClick}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {t('mfa.backup.regenerate')}
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              {t('common.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('mfa.backup.regenerate')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('mfa.backup.regenerateWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              {t('common.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BackupCodesModal
