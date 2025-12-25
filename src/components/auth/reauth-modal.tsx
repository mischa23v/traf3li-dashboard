/**
 * Reauthentication Modal Component
 * Step-up authentication modal for sensitive operations
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconLoader2, IconLock, IconKey, IconMail } from '@tabler/icons-react'
import {
  useReauthWithPassword,
  useReauthWithTOTP,
  useRequestReauthChallenge,
  useVerifyReauthChallenge,
  useReauthMethods,
} from '@/hooks/useStepUpAuth'
import { useMFAStatus } from '@/hooks/useMFA'

interface ReauthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onCancel?: () => void
  purpose?: string
  title?: string
  description?: string
}

export function ReauthModal({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
  purpose = 'sensitive_operation',
  title,
  description,
}: ReauthModalProps) {
  const { t } = useTranslation()
  const [method, setMethod] = React.useState<'password' | 'totp' | 'email'>('password')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [otpSent, setOtpSent] = React.useState(false)

  // Hooks
  const { data: mfaStatus } = useMFAStatus()
  const { data: availableMethods = ['password'] } = useReauthMethods()
  const reauthPassword = useReauthWithPassword()
  const reauthTOTP = useReauthWithTOTP()
  const requestChallenge = useRequestReauthChallenge()
  const verifyChallenge = useVerifyReauthChallenge()

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setPassword('')
      setCode('')
      setOtpSent(false)
    }
  }, [open])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reauthPassword.mutateAsync(password)
      onSuccess()
    } catch {
      // Error handled by hook
    }
  }

  const handleTOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reauthTOTP.mutateAsync(code)
      onSuccess()
    } catch {
      // Error handled by hook
    }
  }

  const handleRequestEmailOTP = async () => {
    try {
      await requestChallenge.mutateAsync({ method: 'email', purpose })
      setOtpSent(true)
    } catch {
      // Error handled by hook
    }
  }

  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyChallenge.mutateAsync(code)
      onSuccess()
    } catch {
      // Error handled by hook
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    onCancel?.()
  }

  const isLoading =
    reauthPassword.isPending ||
    reauthTOTP.isPending ||
    requestChallenge.isPending ||
    verifyChallenge.isPending

  // Determine available tabs
  const hasMFA = mfaStatus?.enabled
  const showTOTPTab = hasMFA && availableMethods.includes('totp')
  const showEmailTab = availableMethods.includes('email')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconLock className="h-5 w-5" />
            {title || t('auth.confirmIdentity', 'تأكيد الهوية')}
          </DialogTitle>
          <DialogDescription>
            {description ||
              t(
                'auth.reauthDescription',
                'لإتمام هذا الإجراء، يرجى تأكيد هويتك'
              )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">
              <IconLock className="h-4 w-4 ml-1" />
              {t('auth.password', 'كلمة المرور')}
            </TabsTrigger>
            {showTOTPTab && (
              <TabsTrigger value="totp">
                <IconKey className="h-4 w-4 ml-1" />
                {t('auth.authenticator', 'المصادقة')}
              </TabsTrigger>
            )}
            {showEmailTab && (
              <TabsTrigger value="email">
                <IconMail className="h-4 w-4 ml-1" />
                {t('auth.email', 'البريد')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="password" className="mt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('auth.currentPassword', 'كلمة المرور الحالية')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button type="submit" disabled={isLoading || !password}>
                  {isLoading && (
                    <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {t('common.confirm', 'تأكيد')}
                </Button>
              </div>
            </form>
          </TabsContent>

          {showTOTPTab && (
            <TabsContent value="totp" className="mt-4">
              <form onSubmit={handleTOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totp">
                    {t('mfa.enterCode', 'أدخل رمز المصادقة')}
                  </Label>
                  <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    {t('common.cancel', 'إلغاء')}
                  </Button>
                  <Button type="submit" disabled={isLoading || code.length !== 6}>
                    {isLoading && (
                      <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    {t('common.confirm', 'تأكيد')}
                  </Button>
                </div>
              </form>
            </TabsContent>
          )}

          {showEmailTab && (
            <TabsContent value="email" className="mt-4">
              {!otpSent ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'auth.emailOTPDescription',
                      'سنرسل رمز تحقق إلى بريدك الإلكتروني'
                    )}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {t('common.cancel', 'إلغاء')}
                    </Button>
                    <Button
                      onClick={handleRequestEmailOTP}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {t('auth.sendCode', 'إرسال الرمز')}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'auth.emailOTPSent',
                        'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
                      )}
                    </p>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                      disabled={isLoading}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {t('common.cancel', 'إلغاء')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || code.length !== 6}
                    >
                      {isLoading && (
                        <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {t('common.confirm', 'تأكيد')}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ReauthModal
