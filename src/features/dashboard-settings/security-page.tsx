import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
  Shield, Lock, Key, Smartphone, Eye, EyeOff,
  AlertTriangle, CheckCircle, Clock, MapPin, Monitor,
  Loader2, KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { MFASetupWizard, BackupCodesModal } from '@/components/mfa'
import { useMFAStatus, useMFARoleRequirement, useDisableMFA } from '@/hooks/useMFA'
import { useActiveSessions, useRevokeSession, useRevokeAllSessions } from '@/hooks/useSessions'
import { formatLastActive, formatDevice, formatLocation } from '@/services/sessions.service'
import { useAuthStore, selectMustChangePassword } from '@/stores/auth-store'
import { useChangePassword } from '@/hooks/usePassword'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'

export function SecurityPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const mustChangePassword = useAuthStore(selectMustChangePassword)
  const clearPasswordBreachWarning = useAuthStore((state) => state.clearPasswordBreachWarning)

  // Get URL search params
  const searchParams = useSearch({ strict: false }) as { action?: string; reason?: string }
  const actionParam = searchParams?.action
  const reasonParam = searchParams?.reason
  const isBreachReason = reasonParam === 'breach'
  const isPasswordChangeRequired = actionParam === 'change-password'

  // Password dialog state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Password change mutation
  const changePasswordMutation = useChangePassword()

  // MFA state
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showDisableMFA, setShowDisableMFA] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  // Login alerts state
  const [loginAlerts, setLoginAlerts] = useState(true)

  // Auto-open password change dialog when action=change-password
  useEffect(() => {
    if (isPasswordChangeRequired) {
      setChangePasswordOpen(true)
    }
  }, [isPasswordChangeRequired])

  // Fetch MFA status
  const { data: mfaStatus, isLoading: isMFALoading, refetch: refetchMFA } = useMFAStatus()
  const mfaEnabled = mfaStatus?.data?.enabled ?? false
  const mfaMethod = mfaStatus?.data?.method

  // Check if MFA is required for user's role
  const { isRequired: isMFARequired, isRecommended: isMFARecommended } = useMFARoleRequirement(
    user?.firmRole || user?.role
  )

  // Disable MFA mutation
  const disableMFAMutation = useDisableMFA()

  // Sessions hooks
  const { data: sessions, isLoading: isSessionsLoading } = useActiveSessions()
  const revokeSessionMutation = useRevokeSession()
  const revokeAllSessionsMutation = useRevokeAllSessions()

  const topNav = [
    { title: isRTL ? 'الملف الشخصي' : 'Profile', href: ROUTES.dashboard.settings.profile, isActive: false },
    { title: isRTL ? 'الأمان' : 'Security', href: ROUTES.dashboard.settings.security, isActive: true },
    { title: isRTL ? 'التفضيلات' : 'Preferences', href: ROUTES.dashboard.settings.preferences, isActive: false },
  ]

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('common.fillAllFields'))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('auth.signUp.passwordMismatch'))
      return
    }

    if (newPassword.length < 8) {
      toast.error(t('security.password.requirements'))
      return
    }

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword })

      // Clear breach warning flags after successful password change
      clearPasswordBreachWarning()

      // Close dialog and clear form
      setChangePasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Clear URL params and navigate to clean security page
      if (isPasswordChangeRequired) {
        navigate({ to: ROUTES.dashboard.settings.security, replace: true })
      }
    } catch (error: any) {
      // Error is already handled by the mutation hook (shows toast)
    }
  }

  const handleMFASetupComplete = () => {
    refetchMFA()
    toast.success(t('mfa.setup.setupComplete'))
  }

  const handleMFAToggle = (checked: boolean) => {
    if (checked) {
      setShowMFASetup(true)
    } else {
      if (isMFARequired) {
        toast.error(t('mfa.status.required'))
        return
      }
      setShowDisableMFA(true)
    }
  }

  const handleDisableMFA = async () => {
    if (!disableCode || !disablePassword) {
      toast.error(t('common.fillAllFields'))
      return
    }

    try {
      await disableMFAMutation.mutateAsync({ code: disableCode, password: disablePassword })
      setShowDisableMFA(false)
      setDisableCode('')
      setDisablePassword('')
      refetchMFA()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleViewBackupCodes = () => {
    // TODO: Fetch backup codes from API
    // For now, show empty state
    setBackupCodes([])
    setShowBackupCodes(true)
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main className="bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {t('security.title')}
            </h1>
            <p className="text-slate-500 mt-1">
              {t('security.description')}
            </p>
          </div>

          {/* MFA Required/Recommended Banner */}
          {(isMFARequired || isMFARecommended) && !mfaEnabled && (
            <Card className={isMFARequired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${isMFARequired ? 'text-red-600' : 'text-amber-600'}`} />
                  <div>
                    <p className={`font-medium ${isMFARequired ? 'text-red-800' : 'text-amber-800'}`}>
                      {isMFARequired ? t('mfa.status.required') : t('mfa.status.recommended')}
                    </p>
                    {mfaStatus?.data?.gracePeriodEndsAt && (
                      <p className={`text-sm ${isMFARequired ? 'text-red-600' : 'text-amber-600'}`}>
                        {t('mfa.status.gracePeriod', {
                          days: Math.ceil(
                            (new Date(mfaStatus.data.gracePeriodEndsAt).getTime() - Date.now()) /
                              (24 * 60 * 60 * 1000)
                          ),
                        })}
                      </p>
                    )}
                  </div>
                  <Button
                    className="ms-auto"
                    onClick={() => setShowMFASetup(true)}
                  >
                    {t('mfa.setup.title')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Breach Warning Banner */}
          {(isBreachReason || mustChangePassword) && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      {isRTL
                        ? 'تحذير أمني: يجب تغيير كلمة المرور'
                        : 'Security Warning: Password Change Required'}
                    </p>
                    <p className="text-sm text-red-600">
                      {isBreachReason
                        ? (isRTL
                            ? 'تم العثور على كلمة المرور الخاصة بك في تسريبات بيانات. يرجى تغييرها فوراً لحماية حسابك.'
                            : 'Your password was found in data breaches. Please change it immediately to protect your account.')
                        : (isRTL
                            ? 'يجب عليك تغيير كلمة المرور للمتابعة.'
                            : 'You must change your password to continue.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Section */}
          <Card className={mustChangePassword ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${mustChangePassword ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Lock className={`h-5 w-5 ${mustChangePassword ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <CardTitle>{t('security.password.title')}</CardTitle>
                  <CardDescription>
                    {mustChangePassword
                      ? (isRTL ? 'يجب تغيير كلمة المرور الآن' : 'Password change required')
                      : t('security.password.lastChanged', { date: '30 days' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={changePasswordOpen} onOpenChange={(open) => {
                // Don't allow closing if password change is required
                if (!open && mustChangePassword) {
                  toast.error(isRTL ? 'يجب تغيير كلمة المرور أولاً' : 'You must change your password first')
                  return
                }
                setChangePasswordOpen(open)
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="h-4 w-4 me-2" />
                    {t('security.password.change')}
                  </Button>
                </DialogTrigger>
                <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <DialogHeader>
                    <DialogTitle>{t('security.password.change')}</DialogTitle>
                    <DialogDescription>
                      {t('security.password.requirements')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('security.password.current')}</Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-0 top-0 h-full"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('security.password.new')}</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-0 top-0 h-full"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('security.password.confirm')}</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    {!mustChangePassword && (
                      <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                        {t('common.cancel')}
                      </Button>
                    )}
                    <Button
                      className={mustChangePassword ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-500 hover:bg-emerald-600'}
                      onClick={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                      {mustChangePassword
                        ? (isRTL ? 'تغيير كلمة المرور الآن' : 'Change Password Now')
                        : t('common.save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>{t('mfa.title')}</CardTitle>
                    <CardDescription>{t('mfa.description')}</CardDescription>
                  </div>
                </div>
                {isMFALoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Switch
                    checked={mfaEnabled}
                    onCheckedChange={handleMFAToggle}
                    disabled={isMFARequired && mfaEnabled}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {mfaEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>{t('mfa.status.enabled')}</span>
                    {mfaMethod && (
                      <Badge variant="secondary" className="ms-auto">
                        {mfaMethod === 'totp'
                          ? t('mfa.setup.totp')
                          : mfaMethod === 'sms'
                            ? t('mfa.setup.sms')
                            : t('mfa.setup.email')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleViewBackupCodes}>
                      <KeyRound className="h-4 w-4 me-2" />
                      {t('mfa.backup.title')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  <span>{t('mfa.status.disabled')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>{t('security.loginAlerts.title')}</CardTitle>
                    <CardDescription>{t('security.loginAlerts.description')}</CardDescription>
                  </div>
                </div>
                <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
              </div>
            </CardHeader>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>{t('security.sessions.title')}</CardTitle>
                    <CardDescription>{t('security.sessions.description')}</CardDescription>
                  </div>
                </div>
                {sessions && sessions.filter(s => !s.isCurrent).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => revokeAllSessionsMutation.mutate()}
                    disabled={revokeAllSessionsMutation.isPending}
                  >
                    {revokeAllSessionsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : null}
                    {t('security.sessions.endAllSessions')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isSessionsLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin me-2" />
                    {t('security.sessions.loading')}
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border">
                          <Monitor className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">
                              {formatDevice(session, isRTL)}
                            </span>
                            {session.isCurrent && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                {t('security.sessions.current')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 me-1" aria-hidden="true" />
                              {formatLocation(session, isRTL)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 me-1" aria-hidden="true" />
                              {formatLastActive(session.lastActiveAt, isRTL)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => revokeSessionMutation.mutate(session.id)}
                          disabled={revokeSessionMutation.isPending}
                        >
                          {revokeSessionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin me-2" />
                          ) : null}
                          {t('security.sessions.endSession')}
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('security.sessions.noOtherSessions')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* MFA Setup Wizard */}
      <MFASetupWizard
        open={showMFASetup}
        onOpenChange={setShowMFASetup}
        onComplete={handleMFASetupComplete}
        onCancel={() => setShowMFASetup(false)}
      />

      {/* Backup Codes Modal */}
      <BackupCodesModal
        open={showBackupCodes}
        onOpenChange={setShowBackupCodes}
        backupCodes={backupCodes}
        onRegenerate={(codes) => setBackupCodes(codes)}
      />

      {/* Disable MFA Dialog */}
      <Dialog open={showDisableMFA} onOpenChange={setShowDisableMFA}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('mfa.disable.title')}</DialogTitle>
            <DialogDescription>{t('mfa.disable.warning')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('mfa.disable.confirmCode')}</Label>
              <Input
                type="text"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('mfa.disable.confirmPassword')}</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableMFA(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMFA}
              disabled={disableMFAMutation.isPending || !disableCode || !disablePassword}
            >
              {disableMFAMutation.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {t('mfa.disable.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SecurityPage
