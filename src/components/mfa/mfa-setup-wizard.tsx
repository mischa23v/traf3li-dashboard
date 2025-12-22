'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  Loader2,
  Smartphone,
  Mail,
  MessageSquare,
  Copy,
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
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
import { setupMFA, verifyMFASetup, type MFASetupResponse } from '@/services/mfa.service'
import { cn } from '@/lib/utils'

type MFAMethod = 'totp' | 'sms' | 'email'

interface MFASetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  onCancel?: () => void
}

export function MFASetupWizard({
  open,
  onOpenChange,
  onComplete,
  onCancel,
}: MFASetupWizardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [step, setStep] = React.useState<'method' | 'setup' | 'verify' | 'backup' | 'complete'>(
    'method'
  )
  const [method, setMethod] = React.useState<MFAMethod>('totp')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [setupData, setSetupData] = React.useState<MFASetupResponse['data'] | null>(null)
  const [code, setCode] = React.useState('')
  const [showSecret, setShowSecret] = React.useState(false)
  const [copiedCodes, setCopiedCodes] = React.useState(false)

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setStep('method')
      setMethod('totp')
      setCode('')
      setError(null)
      setSetupData(null)
      setShowSecret(false)
      setCopiedCodes(false)
    }
  }, [open])

  const handleMethodSelect = async (selectedMethod: MFAMethod) => {
    setMethod(selectedMethod)
    setIsLoading(true)
    setError(null)

    try {
      const response = await setupMFA(selectedMethod)
      if (response.success) {
        setSetupData(response.data)
        setStep('setup')
      } else {
        setError(t('mfa.errors.setupFailed'))
      }
    } catch (err: any) {
      setError(err.message || t('mfa.errors.setupFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t('mfa.verify.enterCode'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await verifyMFASetup(code)
      if (response.success && response.data.verified) {
        setStep('backup')
      } else {
        setError(t('mfa.verify.invalidCode'))
      }
    } catch (err: any) {
      if (err.code === 'INVALID_CODE' || err.status === 401) {
        setError(t('mfa.verify.invalidCode'))
      } else if (err.code === 'CODE_EXPIRED') {
        setError(t('mfa.verify.codeExpired'))
      } else {
        setError(t('mfa.errors.verificationFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyBackupCodes = async () => {
    if (!setupData?.backupCodes) return

    try {
      await navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    } catch (err) {
      console.error('Failed to copy backup codes:', err)
    }
  }

  const handleDownloadBackupCodes = () => {
    if (!setupData?.backupCodes) return

    const content = `Traf3li - MFA Backup Codes
==============================
${t('mfa.backup.warning')}

${setupData.backupCodes.join('\n')}

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

  const handleComplete = () => {
    setStep('complete')
    setTimeout(() => {
      onComplete()
      onOpenChange(false)
    }, 1500)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const renderMethodSelection = () => (
    <>
      <DialogHeader className="text-center sm:text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle>{t('mfa.setup.title')}</DialogTitle>
        <DialogDescription>{t('mfa.setup.selectMethod')}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 py-4">
        <button
          onClick={() => handleMethodSelect('totp')}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-4 rounded-lg border p-4 text-start transition-colors',
            'hover:bg-accent hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{t('mfa.setup.totp')}</p>
            <p className="text-sm text-muted-foreground">{t('mfa.setup.totpDescription')}</p>
          </div>
          {!isLoading && <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />}
          {isLoading && method === 'totp' && <Loader2 className="h-5 w-5 animate-spin" />}
        </button>

        <button
          onClick={() => handleMethodSelect('sms')}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-4 rounded-lg border p-4 text-start transition-colors',
            'hover:bg-accent hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{t('mfa.setup.sms')}</p>
            <p className="text-sm text-muted-foreground">{t('mfa.setup.smsDescription')}</p>
          </div>
          {!isLoading && <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />}
          {isLoading && method === 'sms' && <Loader2 className="h-5 w-5 animate-spin" />}
        </button>

        <button
          onClick={() => handleMethodSelect('email')}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-4 rounded-lg border p-4 text-start transition-colors',
            'hover:bg-accent hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{t('mfa.setup.email')}</p>
            <p className="text-sm text-muted-foreground">{t('mfa.setup.emailDescription')}</p>
          </div>
          {!isLoading && <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />}
          {isLoading && method === 'email' && <Loader2 className="h-5 w-5 animate-spin" />}
        </button>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
      </DialogFooter>
    </>
  )

  const renderSetup = () => (
    <>
      <DialogHeader className="text-center sm:text-center">
        <DialogTitle>{t('mfa.setup.qrCode')}</DialogTitle>
        <DialogDescription>{t('mfa.setup.scanInstructions')}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-4 py-4">
        {method === 'totp' && setupData?.qrCode && (
          <>
            <div className="rounded-lg border bg-white p-4">
              <img
                src={setupData.qrCode}
                alt="MFA QR Code"
                className="h-48 w-48"
              />
            </div>

            <Button
              variant="link"
              size="sm"
              onClick={() => setShowSecret(!showSecret)}
              className="text-muted-foreground"
            >
              {t('mfa.setup.cantScan')}
            </Button>

            {showSecret && setupData.secret && (
              <div className="w-full rounded-lg border bg-muted/50 p-4 text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  {t('mfa.setup.manualEntry')}
                </p>
                <code className="font-mono text-sm font-medium tracking-wider">
                  {setupData.secret}
                </code>
              </div>
            )}
          </>
        )}

        {(method === 'sms' || method === 'email') && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {method === 'sms'
                ? t('mfa.setup.smsDescription')
                : t('mfa.setup.emailDescription')}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={() => setStep('method')} disabled={isLoading}>
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')}
        </Button>
        <Button onClick={() => setStep('verify')} disabled={isLoading}>
          {t('common.next')}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </DialogFooter>
    </>
  )

  const renderVerify = () => (
    <>
      <DialogHeader className="text-center sm:text-center">
        <DialogTitle>{t('mfa.verify.title')}</DialogTitle>
        <DialogDescription>{t('mfa.setup.enterCode')}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center gap-4 py-4">
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
      </div>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={() => setStep('setup')} disabled={isLoading}>
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')}
        </Button>
        <Button onClick={handleVerify} disabled={isLoading || code.length !== 6}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('mfa.verify.verifying')}
            </>
          ) : (
            t('mfa.setup.verifySetup')
          )}
        </Button>
      </DialogFooter>
    </>
  )

  const renderBackupCodes = () => (
    <>
      <DialogHeader className="text-center sm:text-center">
        <DialogTitle>{t('mfa.backup.title')}</DialogTitle>
        <DialogDescription>{t('mfa.backup.description')}</DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="mb-4 rounded-lg border bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          {t('mfa.backup.warning')}
        </div>

        {setupData?.backupCodes && (
          <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
            {setupData.backupCodes.map((code, index) => (
              <code
                key={index}
                className="rounded bg-background px-2 py-1 text-center font-mono text-sm"
              >
                {code}
              </code>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyBackupCodes}
            disabled={!setupData?.backupCodes}
          >
            {copiedCodes ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copiedCodes ? t('mfa.backup.copied') : t('mfa.backup.copy')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadBackupCodes}
            disabled={!setupData?.backupCodes}
          >
            <Download className="h-4 w-4" />
            {t('mfa.backup.download')}
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleComplete}>
          {t('common.done')}
        </Button>
      </DialogFooter>
    </>
  )

  const renderComplete = () => (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{t('mfa.setup.setupComplete')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('mfa.setup.setupCompleteDescription')}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRTL ? 'rtl' : 'ltr'}
        showCloseButton={step !== 'complete'}
        className="sm:max-w-md"
      >
        {step === 'method' && renderMethodSelection()}
        {step === 'setup' && renderSetup()}
        {step === 'verify' && renderVerify()}
        {step === 'backup' && renderBackupCodes()}
        {step === 'complete' && renderComplete()}
      </DialogContent>
    </Dialog>
  )
}

export default MFASetupWizard
