'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Loader2, KeyRound } from 'lucide-react'
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { verifyMFA, verifyBackupCode } from '@/services/mfa.service'
import { cn } from '@/lib/utils'

export interface MFAVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
  onCancel?: () => void
  action?: string
  title?: string
  description?: string
}

export function MFAVerificationModal({
  open,
  onOpenChange,
  onVerified,
  onCancel,
  action,
  title,
  description,
}: MFAVerificationModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [useBackupCode, setUseBackupCode] = React.useState(false)
  const [backupCode, setBackupCode] = React.useState('')

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setCode('')
      setBackupCode('')
      setError(null)
      setUseBackupCode(false)
    }
  }, [open])

  const handleVerify = async () => {
    if (useBackupCode) {
      if (!backupCode.trim()) {
        setError(t('mfa.backup.enterBackupCode'))
        return
      }
    } else {
      if (code.length !== 6) {
        setError(t('mfa.verify.enterCode'))
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      let response
      if (useBackupCode) {
        response = await verifyBackupCode(backupCode.trim())
      } else {
        response = await verifyMFA(code, action)
      }

      if (response.success && response.data.verified) {
        onVerified()
        onOpenChange(false)
      } else {
        setError(t('mfa.verify.invalidCode'))
      }
    } catch (err: any) {
      if (err.code === 'INVALID_CODE' || err.status === 401) {
        setError(t('mfa.verify.invalidCode'))
      } else if (err.code === 'TOO_MANY_ATTEMPTS' || err.status === 429) {
        setError(t('mfa.verify.tooManyAttempts'))
      } else if (err.code === 'CODE_EXPIRED') {
        setError(t('mfa.verify.codeExpired'))
      } else if (err.code === 'BACKUP_CODE_USED') {
        setError(t('mfa.errors.backupCodeUsed'))
      } else {
        setError(t('mfa.errors.verificationFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode)
    setError(null)
    setCode('')
    setBackupCode('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRTL ? 'rtl' : 'ltr'}
        showCloseButton={false}
        className="sm:max-w-md"
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>
            {title || t('mfa.verify.title')}
          </DialogTitle>
          <DialogDescription>
            {description || t('mfa.verify.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {!useBackupCode ? (
            <>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value)
                  setError(null)
                }}
                disabled={isLoading}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-sm text-muted-foreground">
                {t('mfa.setup.enterCode')}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{t('mfa.backup.title')}</span>
              </div>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => {
                  setBackupCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                placeholder={t('mfa.backup.enterBackupCode')}
                disabled={isLoading}
                autoFocus
                className={cn(
                  'w-full rounded-md border px-3 py-2 text-center font-mono text-lg tracking-widest',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  error && 'border-destructive'
                )}
              />
              <p className="text-sm text-muted-foreground">
                {t('mfa.backup.warning')}
              </p>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            variant="link"
            size="sm"
            onClick={toggleBackupCode}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            {useBackupCode ? t('mfa.verify.enterCode') : t('mfa.verify.useBackupCode')}
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading || (!useBackupCode && code.length !== 6) || (useBackupCode && !backupCode.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('mfa.verify.verifying')}
              </>
            ) : (
              t('mfa.verify.verify')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MFAVerificationModal
