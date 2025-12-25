/**
 * Guest Banner Component
 * Shows a banner for anonymous/guest users prompting them to create an account
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { IconUser, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useAnonymousStatus, useConvertAccount } from '@/hooks/useAnonymousAuth'
import { usePasswordField } from '@/hooks/usePassword'

interface GuestBannerProps {
  className?: string
  variant?: 'banner' | 'compact'
}

export function GuestBanner({ className, variant = 'banner' }: GuestBannerProps) {
  const { t } = useTranslation()
  const { isAnonymous, daysRemaining, isAboutToExpire } = useAnonymousStatus()
  const convertAccount = useConvertAccount()
  const [showModal, setShowModal] = React.useState(false)

  // Form state
  const [email, setEmail] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const {
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    strength,
    validation,
  } = usePasswordField()
  const [confirmPassword, setConfirmPassword] = React.useState('')

  // Don't show if not anonymous
  if (!isAnonymous) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return
    }

    if (!validation.valid) {
      return
    }

    try {
      await convertAccount.mutateAsync({
        email,
        password,
        username: username || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })
      setShowModal(false)
    } catch {
      // Error handled by hook
    }
  }

  const progressPercent = daysRemaining
    ? Math.max(0, Math.min(100, (daysRemaining / 30) * 100))
    : 100

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm',
          isAboutToExpire && 'bg-destructive/10',
          className
        )}
      >
        <IconUser className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {t('auth.guestAccount', 'حساب ضيف')}
        </span>
        {daysRemaining !== null && (
          <span className="text-xs text-muted-foreground">
            ({daysRemaining} {t('common.days', 'يوم')})
          </span>
        )}
        <Button
          size="sm"
          variant="link"
          onClick={() => setShowModal(true)}
          className="mr-auto h-auto p-0"
        >
          {t('auth.createAccount', 'إنشاء حساب')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Alert
        className={cn(
          isAboutToExpire ? 'border-destructive' : 'border-warning',
          className
        )}
      >
        <div className="flex items-start gap-3">
          {isAboutToExpire ? (
            <IconAlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <IconUser className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1 space-y-2">
            <AlertTitle>
              {isAboutToExpire
                ? t('auth.guestExpiringSoon', 'جلستك على وشك الانتهاء!')
                : t('auth.guestSession', 'أنت تستخدم حساب ضيف')}
            </AlertTitle>
            <AlertDescription>
              {isAboutToExpire
                ? t(
                    'auth.guestExpiringDescription',
                    'أنشئ حساباً الآن للاحتفاظ ببياناتك قبل حذفها'
                  )
                : t(
                    'auth.guestDescription',
                    'بياناتك ستحذف تلقائياً بعد 30 يوماً. أنشئ حساباً للاحتفاظ بها'
                  )}
            </AlertDescription>

            {daysRemaining !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {t('auth.daysRemaining', 'الأيام المتبقية')}: {daysRemaining}
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-1" />
              </div>
            )}
          </div>
          <Button onClick={() => setShowModal(true)}>
            {t('auth.createAccount', 'إنشاء حساب')}
          </Button>
        </div>
      </Alert>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('auth.createFullAccount', 'إنشاء حساب كامل')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'auth.convertDescription',
                'احتفظ ببياناتك عن طريق إنشاء حساب كامل'
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t('auth.firstName', 'الاسم الأول')}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('auth.firstNamePlaceholder', 'أحمد')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t('auth.lastName', 'اسم العائلة')}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('auth.lastNamePlaceholder', 'محمد')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('auth.email', 'البريد الإلكتروني')} *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                {t('auth.username', 'اسم المستخدم')}
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.usernamePlaceholder', 'username')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t('auth.password', 'كلمة المرور')} *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${strength.score}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.labelAr}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('auth.confirmPassword', 'تأكيد كلمة المرور')} *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">
                  {t('auth.passwordMismatch', 'كلمتا المرور غير متطابقتين')}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={convertAccount.isPending}
              >
                {t('common.cancel', 'إلغاء')}
              </Button>
              <Button
                type="submit"
                disabled={
                  convertAccount.isPending ||
                  !email ||
                  !password ||
                  password !== confirmPassword ||
                  !validation.valid
                }
              >
                {convertAccount.isPending && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                {t('auth.createAccount', 'إنشاء حساب')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GuestBanner
