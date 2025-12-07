import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Globe, Moon, Sun, Bell, Mail, MessageSquare,
  Calendar, Clock, Palette, Monitor, Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'

export function PreferencesPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState(i18n.language)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [caseReminders, setCaseReminders] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [weekStart, setWeekStart] = useState('sunday')
  const [dateFormat, setDateFormat] = useState('hijri')
  const [timeFormat, setTimeFormat] = useState('12')

  const topNav = [
    { title: isRTL ? 'الملف الشخصي' : 'Profile', href: '/dashboard/settings/profile', isActive: false },
    { title: isRTL ? 'الأمان' : 'Security', href: '/dashboard/settings/security', isActive: false },
    { title: isRTL ? 'التفضيلات' : 'Preferences', href: '/dashboard/settings/preferences', isActive: true },
  ]

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    i18n.changeLanguage(value)
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
              {isRTL ? 'التفضيلات' : 'Preferences'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'تخصيص تجربتك في النظام' : 'Customize your experience'}
            </p>
          </div>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'المظهر' : 'Appearance'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'تخصيص مظهر الواجهة' : 'Customize the interface appearance'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{isRTL ? 'السمة' : 'Theme'}</Label>
                <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="light"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <RadioGroupItem value="light" id="light" className="sr-only" />
                    <Sun className="h-6 w-6" />
                    <span className="text-sm">{isRTL ? 'فاتح' : 'Light'}</span>
                  </Label>
                  <Label
                    htmlFor="dark"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                    <Moon className="h-6 w-6" />
                    <span className="text-sm">{isRTL ? 'داكن' : 'Dark'}</span>
                  </Label>
                  <Label
                    htmlFor="system"
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${theme === 'system' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <RadioGroupItem value="system" id="system" className="sr-only" />
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm">{isRTL ? 'تلقائي' : 'System'}</span>
                  </Label>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <div>
                    <Label>{isRTL ? 'اللغة' : 'Language'}</Label>
                    <p className="text-sm text-slate-500">{isRTL ? 'اختر لغة الواجهة' : 'Choose interface language'}</p>
                  </div>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'الإشعارات' : 'Notifications'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'إدارة تفضيلات الإشعارات' : 'Manage notification preferences'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <div>
                    <Label>{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                    <p className="text-sm text-slate-500">{isRTL ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email'}</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-500" />
                  <div>
                    <Label>{isRTL ? 'إشعارات الويب' : 'Push Notifications'}</Label>
                    <p className="text-sm text-slate-500">{isRTL ? 'إشعارات المتصفح' : 'Browser notifications'}</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                  <div>
                    <Label>{isRTL ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</Label>
                    <p className="text-sm text-slate-500">{isRTL ? 'استلام رسائل نصية' : 'Receive text messages'}</p>
                  </div>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-slate-500" />
                  <div>
                    <Label>{isRTL ? 'الأصوات' : 'Sound'}</Label>
                    <p className="text-sm text-slate-500">{isRTL ? 'تشغيل صوت الإشعارات' : 'Play notification sounds'}</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'التذكيرات' : 'Reminders'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'إعدادات التذكيرات التلقائية' : 'Automatic reminder settings'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'تذكيرات القضايا' : 'Case Reminders'}</Label>
                  <p className="text-sm text-slate-500">{isRTL ? 'تنبيهات مواعيد الجلسات' : 'Court session alerts'}</p>
                </div>
                <Switch checked={caseReminders} onCheckedChange={setCaseReminders} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{isRTL ? 'تذكيرات المهام' : 'Task Reminders'}</Label>
                  <p className="text-sm text-slate-500">{isRTL ? 'تنبيهات المهام المستحقة' : 'Due task alerts'}</p>
                </div>
                <Switch checked={taskReminders} onCheckedChange={setTaskReminders} />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>{isRTL ? 'التاريخ والوقت' : 'Date & Time'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'تنسيق التاريخ والوقت' : 'Date and time format preferences'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'نظام التاريخ' : 'Date System'}</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hijri">{isRTL ? 'هجري' : 'Hijri'}</SelectItem>
                      <SelectItem value="gregorian">{isRTL ? 'ميلادي' : 'Gregorian'}</SelectItem>
                      <SelectItem value="both">{isRTL ? 'كلاهما' : 'Both'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'تنسيق الوقت' : 'Time Format'}</Label>
                  <Select value={timeFormat} onValueChange={setTimeFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">{isRTL ? '12 ساعة' : '12 Hour'}</SelectItem>
                      <SelectItem value="24">{isRTL ? '24 ساعة' : '24 Hour'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'بداية الأسبوع' : 'Week Starts On'}</Label>
                  <Select value={weekStart} onValueChange={setWeekStart}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">{isRTL ? 'الأحد' : 'Sunday'}</SelectItem>
                      <SelectItem value="saturday">{isRTL ? 'السبت' : 'Saturday'}</SelectItem>
                      <SelectItem value="monday">{isRTL ? 'الإثنين' : 'Monday'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              {isRTL ? 'حفظ التفضيلات' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}

export default PreferencesPage
