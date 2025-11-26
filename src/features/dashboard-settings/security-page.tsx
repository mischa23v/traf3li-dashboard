import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield, Lock, Key, Smartphone, Eye, EyeOff,
  AlertTriangle, CheckCircle, Clock, MapPin, Monitor
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
import { Separator } from '@/components/ui/separator'
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

const recentSessions = [
  {
    id: '1',
    device: 'Chrome على Windows',
    deviceEn: 'Chrome on Windows',
    location: 'الرياض، السعودية',
    locationEn: 'Riyadh, Saudi Arabia',
    ip: '192.168.1.xxx',
    lastActive: 'الآن',
    lastActiveEn: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Safari على iPhone',
    deviceEn: 'Safari on iPhone',
    location: 'جدة، السعودية',
    locationEn: 'Jeddah, Saudi Arabia',
    ip: '192.168.2.xxx',
    lastActive: 'منذ ساعة',
    lastActiveEn: '1 hour ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Firefox على macOS',
    deviceEn: 'Firefox on macOS',
    location: 'الدمام، السعودية',
    locationEn: 'Dammam, Saudi Arabia',
    ip: '192.168.3.xxx',
    lastActive: 'منذ 3 أيام',
    lastActiveEn: '3 days ago',
    isCurrent: false,
  },
]

export function SecurityPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const topNav = [
    { title: isRTL ? 'الملف الشخصي' : 'Profile', href: '/dashboard/settings/profile', isActive: false },
    { title: isRTL ? 'الأمان' : 'Security', href: '/dashboard/settings/security', isActive: true },
    { title: isRTL ? 'التفضيلات' : 'Preferences', href: '/dashboard/settings/preferences', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
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
              {isRTL ? 'الأمان' : 'Security Settings'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'إدارة إعدادات الأمان وحماية حسابك' : 'Manage security settings and protect your account'}
            </p>
          </div>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'كلمة المرور' : 'Password'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'تم تغيير كلمة المرور منذ 30 يوماً' : 'Password changed 30 days ago'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="h-4 w-4 me-2" />
                    {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
                    <DialogDescription>
                      {isRTL ? 'أدخل كلمة المرور الحالية والجديدة' : 'Enter your current and new password'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                      <div className="relative">
                        <Input type={showCurrentPassword ? 'text' : 'password'} />
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
                      <Label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                      <div className="relative">
                        <Input type={showNewPassword ? 'text' : 'password'} />
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
                      <Label>{isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      {isRTL ? 'حفظ' : 'Save'}
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
                    <CardTitle>{isRTL ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'أضف طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account'}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
            </CardHeader>
            <CardContent>
              {twoFactorEnabled ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>{isRTL ? 'المصادقة الثنائية مفعلة' : 'Two-factor authentication is enabled'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{isRTL ? 'المصادقة الثنائية غير مفعلة' : 'Two-factor authentication is not enabled'}</span>
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
                    <CardTitle>{isRTL ? 'تنبيهات تسجيل الدخول' : 'Login Alerts'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'تلقي إشعارات عند تسجيل الدخول من جهاز جديد' : 'Get notified when logging in from a new device'}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
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
                    <CardTitle>{isRTL ? 'الجلسات النشطة' : 'Active Sessions'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'إدارة الأجهزة المتصلة بحسابك' : 'Manage devices connected to your account'}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  {isRTL ? 'تسجيل الخروج من الكل' : 'Sign Out All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border">
                        <Monitor className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">
                            {isRTL ? session.device : session.deviceEn}
                          </span>
                          {session.isCurrent && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              {isRTL ? 'الجهاز الحالي' : 'Current'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 me-1" />
                            {isRTL ? session.location : session.locationEn}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 me-1" />
                            {isRTL ? session.lastActive : session.lastActiveEn}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        {isRTL ? 'إنهاء' : 'End'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

export default SecurityPage
