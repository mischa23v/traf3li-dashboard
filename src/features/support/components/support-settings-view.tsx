/**
 * Support Settings View
 * Comprehensive settings page for support/helpdesk configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Clock,
  Mail,
  Users,
  AlertTriangle,
  Save,
  Loader2,
  Hash,
  CheckCircle2,
  MessageSquare,
  Globe,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { useSupportSettings, useUpdateSupportSettings } from '@/hooks/use-support'
import { SupportSidebar } from './support-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.support', href: '/dashboard/support' },
]

// Default settings structure
const DEFAULT_SETTINGS = {
  // General Settings
  ticketNamingSeries: 'SUP-YYYY-####',
  defaultPriority: 'medium' as const,
  defaultTicketType: 'question' as const,
  autoAssignTickets: false,
  defaultAssignee: '',

  // SLA Settings
  enableSlaTracking: false,
  defaultResponseTime: 2,
  defaultResolutionTime: 24,
  businessHoursStart: '09:00',
  businessHoursEnd: '17:00',
  workingDays: [0, 1, 2, 3, 4], // Sunday to Thursday

  // Email Settings
  enableEmailToTicket: false,
  supportEmailAddress: '',
  emailNotificationTemplates: true,
  autoReplyTemplate: '',
  sendEmailOnTicketCreation: true,
  sendEmailOnStatusChange: true,

  // Customer Portal
  enableCustomerPortal: false,
  allowCustomersToViewTickets: true,
  allowCustomersToCreateTickets: true,

  // Escalation Rules
  enableEscalation: false,
  escalationAfterHours: 24,
  escalateTo: '',

  // Auto-close settings
  autoCloseIfNoResponse: false,
  closeAfterDays: 7,
}

export function SupportSettingsView() {
  const { t } = useTranslation()

  // Queries
  const { data: settingsData, isLoading } = useSupportSettings()
  const updateSettingsMutation = useUpdateSupportSettings()

  // Form state
  const [formData, setFormData] = useState(DEFAULT_SETTINGS)

  // Load settings from API
  useEffect(() => {
    if (settingsData) {
      setFormData({
        ...DEFAULT_SETTINGS,
        ticketNamingSeries: settingsData.ticketNamingSeries || DEFAULT_SETTINGS.ticketNamingSeries,
        defaultAssignee: settingsData.defaultAssignee || DEFAULT_SETTINGS.defaultAssignee,
        autoCloseIfNoResponse: settingsData.autoCloseIfNoResponse || DEFAULT_SETTINGS.autoCloseIfNoResponse,
        closeAfterDays: settingsData.closeAfterDays || DEFAULT_SETTINGS.closeAfterDays,
        sendEmailOnTicketCreation: settingsData.sendEmailOnTicketCreation ?? DEFAULT_SETTINGS.sendEmailOnTicketCreation,
        sendEmailOnStatusChange: settingsData.sendEmailOnStatusChange ?? DEFAULT_SETTINGS.sendEmailOnStatusChange,
      })
    }
  }, [settingsData])

  // Handlers
  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleWorkingDaysChange = (day: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: checked
        ? [...prev.workingDays, day].sort()
        : prev.workingDays.filter((d) => d !== day),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync({
      ticketNamingSeries: formData.ticketNamingSeries,
      defaultAssignee: formData.defaultAssignee,
      closeAfterDays: formData.closeAfterDays,
      autoCloseIfNoResponse: formData.autoCloseIfNoResponse,
      sendEmailOnTicketCreation: formData.sendEmailOnTicketCreation,
      sendEmailOnStatusChange: formData.sendEmailOnStatusChange,
    })
  }

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('support.settings.badge', 'إعدادات الدعم')}
          title={t('support.settings.title', 'إعدادات الدعم الفني')}
          type="support"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.general', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.generalDesc', 'إعدادات الترقيم والأولوية والتعيين التلقائي')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketNamingSeries">
                      <Hash className="w-4 h-4 inline ml-1" />
                      {t('support.settings.ticketNamingSeries', 'سلسلة ترقيم التذاكر')}
                    </Label>
                    <Input
                      id="ticketNamingSeries"
                      value={formData.ticketNamingSeries}
                      onChange={(e) => handleInputChange('ticketNamingSeries', e.target.value)}
                      placeholder="SUP-YYYY-####"
                      className="rounded-xl"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('support.settings.namingSeriesHint', 'استخدم YYYY للسنة و #### للأرقام المتسلسلة')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultPriority">
                        {t('support.settings.defaultPriority', 'الأولوية الافتراضية')}
                      </Label>
                      <Select
                        value={formData.defaultPriority}
                        onValueChange={(value) => handleSelectChange('defaultPriority', value)}
                      >
                        <SelectTrigger id="defaultPriority" className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('support.priority.low', 'منخفض')}</SelectItem>
                          <SelectItem value="medium">{t('support.priority.medium', 'متوسط')}</SelectItem>
                          <SelectItem value="high">{t('support.priority.high', 'عالي')}</SelectItem>
                          <SelectItem value="urgent">{t('support.priority.urgent', 'عاجل')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultTicketType">
                        {t('support.settings.defaultTicketType', 'نوع التذكرة الافتراضي')}
                      </Label>
                      <Select
                        value={formData.defaultTicketType}
                        onValueChange={(value) => handleSelectChange('defaultTicketType', value)}
                      >
                        <SelectTrigger id="defaultTicketType" className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="question">{t('support.type.question', 'سؤال')}</SelectItem>
                          <SelectItem value="problem">{t('support.type.problem', 'مشكلة')}</SelectItem>
                          <SelectItem value="feature_request">{t('support.type.featureRequest', 'طلب ميزة')}</SelectItem>
                          <SelectItem value="incident">{t('support.type.incident', 'حادث')}</SelectItem>
                          <SelectItem value="service_request">{t('support.type.serviceRequest', 'طلب خدمة')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="autoAssignTickets">
                        {t('support.settings.autoAssignTickets', 'تعيين التذاكر تلقائياً')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.autoAssignTicketsDesc', 'تعيين التذاكر الجديدة تلقائياً للمسؤول الافتراضي')}
                      </p>
                    </div>
                    <Switch
                      id="autoAssignTickets"
                      checked={formData.autoAssignTickets}
                      onCheckedChange={(checked) => handleSwitchChange('autoAssignTickets', checked)}
                    />
                  </div>

                  {formData.autoAssignTickets && (
                    <div className="space-y-2 ms-4">
                      <Label htmlFor="defaultAssignee">
                        {t('support.settings.defaultAssignee', 'المسؤول الافتراضي')}
                      </Label>
                      <Input
                        id="defaultAssignee"
                        value={formData.defaultAssignee}
                        onChange={(e) => handleInputChange('defaultAssignee', e.target.value)}
                        placeholder={t('support.settings.selectUser', 'اختر المستخدم')}
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SLA Settings */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.sla', 'إعدادات SLA')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.slaDesc', 'أوقات الاستجابة والحل وساعات العمل')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="enableSlaTracking">
                        {t('support.settings.enableSlaTracking', 'تفعيل تتبع SLA')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.enableSlaTrackingDesc', 'تتبع أوقات الاستجابة والحل')}
                      </p>
                    </div>
                    <Switch
                      id="enableSlaTracking"
                      checked={formData.enableSlaTracking}
                      onCheckedChange={(checked) => handleSwitchChange('enableSlaTracking', checked)}
                    />
                  </div>

                  {formData.enableSlaTracking && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="defaultResponseTime">
                            {t('support.settings.defaultResponseTime', 'وقت الرد الافتراضي (ساعات)')}
                          </Label>
                          <Input
                            id="defaultResponseTime"
                            type="number"
                            min="0"
                            value={formData.defaultResponseTime}
                            onChange={(e) => handleInputChange('defaultResponseTime', parseInt(e.target.value) || 0)}
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="defaultResolutionTime">
                            {t('support.settings.defaultResolutionTime', 'وقت الحل الافتراضي (ساعات)')}
                          </Label>
                          <Input
                            id="defaultResolutionTime"
                            type="number"
                            min="0"
                            value={formData.defaultResolutionTime}
                            onChange={(e) => handleInputChange('defaultResolutionTime', parseInt(e.target.value) || 0)}
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessHoursStart">
                            {t('support.settings.businessHoursStart', 'بداية ساعات العمل')}
                          </Label>
                          <Input
                            id="businessHoursStart"
                            type="time"
                            value={formData.businessHoursStart}
                            onChange={(e) => handleInputChange('businessHoursStart', e.target.value)}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="businessHoursEnd">
                            {t('support.settings.businessHoursEnd', 'نهاية ساعات العمل')}
                          </Label>
                          <Input
                            id="businessHoursEnd"
                            type="time"
                            value={formData.businessHoursEnd}
                            onChange={(e) => handleInputChange('businessHoursEnd', e.target.value)}
                            className="rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('support.settings.workingDays', 'أيام العمل')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { day: 0, label: t('days.sunday', 'الأحد') },
                            { day: 1, label: t('days.monday', 'الإثنين') },
                            { day: 2, label: t('days.tuesday', 'الثلاثاء') },
                            { day: 3, label: t('days.wednesday', 'الأربعاء') },
                            { day: 4, label: t('days.thursday', 'الخميس') },
                            { day: 5, label: t('days.friday', 'الجمعة') },
                            { day: 6, label: t('days.saturday', 'السبت') },
                          ].map(({ day, label }) => (
                            <div key={day} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                              <Switch
                                id={`workingDay-${day}`}
                                checked={formData.workingDays.includes(day)}
                                onCheckedChange={(checked) => handleWorkingDaysChange(day, checked)}
                              />
                              <Label htmlFor={`workingDay-${day}`} className="text-sm cursor-pointer">
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.email', 'إعدادات البريد الإلكتروني')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.emailDesc', 'البريد الإلكتروني للتذاكر والإشعارات والردود التلقائية')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="enableEmailToTicket">
                        {t('support.settings.enableEmailToTicket', 'تفعيل البريد الإلكتروني إلى تذكرة')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.enableEmailToTicketDesc', 'إنشاء تذاكر تلقائياً من رسائل البريد الإلكتروني')}
                      </p>
                    </div>
                    <Switch
                      id="enableEmailToTicket"
                      checked={formData.enableEmailToTicket}
                      onCheckedChange={(checked) => handleSwitchChange('enableEmailToTicket', checked)}
                    />
                  </div>

                  {formData.enableEmailToTicket && (
                    <div className="space-y-2 ms-4">
                      <Label htmlFor="supportEmailAddress">
                        {t('support.settings.supportEmailAddress', 'عنوان البريد الإلكتروني للدعم')}
                      </Label>
                      <Input
                        id="supportEmailAddress"
                        type="email"
                        value={formData.supportEmailAddress}
                        onChange={(e) => handleInputChange('supportEmailAddress', e.target.value)}
                        placeholder="support@company.com"
                        className="rounded-xl"
                        dir="ltr"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="emailNotificationTemplates">
                        {t('support.settings.emailNotificationTemplates', 'قوالب الإشعارات')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.emailNotificationTemplatesDesc', 'استخدام قوالب مخصصة للإشعارات')}
                      </p>
                    </div>
                    <Switch
                      id="emailNotificationTemplates"
                      checked={formData.emailNotificationTemplates}
                      onCheckedChange={(checked) => handleSwitchChange('emailNotificationTemplates', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoReplyTemplate">
                      {t('support.settings.autoReplyTemplate', 'قالب الرد التلقائي')}
                    </Label>
                    <Input
                      id="autoReplyTemplate"
                      value={formData.autoReplyTemplate}
                      onChange={(e) => handleInputChange('autoReplyTemplate', e.target.value)}
                      placeholder={t('support.settings.selectTemplate', 'اختر القالب')}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Portal */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.customerPortal', 'بوابة العملاء')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.customerPortalDesc', 'السماح للعملاء بعرض وإنشاء التذاكر')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="enableCustomerPortal">
                        {t('support.settings.enableCustomerPortal', 'تفعيل بوابة العملاء')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.enableCustomerPortalDesc', 'السماح للعملاء بالوصول إلى البوابة')}
                      </p>
                    </div>
                    <Switch
                      id="enableCustomerPortal"
                      checked={formData.enableCustomerPortal}
                      onCheckedChange={(checked) => handleSwitchChange('enableCustomerPortal', checked)}
                    />
                  </div>

                  {formData.enableCustomerPortal && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl ms-4">
                        <div>
                          <Label htmlFor="allowCustomersToViewTickets">
                            {t('support.settings.allowCustomersToViewTickets', 'السماح للعملاء بعرض التذاكر')}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t('support.settings.allowCustomersToViewTicketsDesc', 'العملاء يمكنهم عرض تذاكرهم')}
                          </p>
                        </div>
                        <Switch
                          id="allowCustomersToViewTickets"
                          checked={formData.allowCustomersToViewTickets}
                          onCheckedChange={(checked) => handleSwitchChange('allowCustomersToViewTickets', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl ms-4">
                        <div>
                          <Label htmlFor="allowCustomersToCreateTickets">
                            {t('support.settings.allowCustomersToCreateTickets', 'السماح للعملاء بإنشاء التذاكر')}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t('support.settings.allowCustomersToCreateTicketsDesc', 'العملاء يمكنهم إنشاء تذاكر جديدة')}
                          </p>
                        </div>
                        <Switch
                          id="allowCustomersToCreateTickets"
                          checked={formData.allowCustomersToCreateTickets}
                          onCheckedChange={(checked) => handleSwitchChange('allowCustomersToCreateTickets', checked)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Escalation Rules */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.escalation', 'قواعد التصعيد')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.escalationDesc', 'تصعيد التذاكر تلقائياً عند تجاوز المدة')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="enableEscalation">
                        {t('support.settings.enableEscalation', 'تفعيل التصعيد')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.enableEscalationDesc', 'تصعيد التذاكر غير المحلولة تلقائياً')}
                      </p>
                    </div>
                    <Switch
                      id="enableEscalation"
                      checked={formData.enableEscalation}
                      onCheckedChange={(checked) => handleSwitchChange('enableEscalation', checked)}
                    />
                  </div>

                  {formData.enableEscalation && (
                    <>
                      <div className="space-y-2 ms-4">
                        <Label htmlFor="escalationAfterHours">
                          {t('support.settings.escalationAfterHours', 'التصعيد بعد (ساعات)')}
                        </Label>
                        <Input
                          id="escalationAfterHours"
                          type="number"
                          min="1"
                          value={formData.escalationAfterHours}
                          onChange={(e) => handleInputChange('escalationAfterHours', parseInt(e.target.value) || 24)}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2 ms-4">
                        <Label htmlFor="escalateTo">
                          {t('support.settings.escalateTo', 'التصعيد إلى')}
                        </Label>
                        <Input
                          id="escalateTo"
                          value={formData.escalateTo}
                          onChange={(e) => handleInputChange('escalateTo', e.target.value)}
                          placeholder={t('support.settings.selectUser', 'اختر المستخدم')}
                          className="rounded-xl"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Auto-close Settings */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    {t('support.settings.autoClose', 'الإغلاق التلقائي')}
                  </CardTitle>
                  <CardDescription>
                    {t('support.settings.autoCloseDesc', 'إغلاق التذاكر القديمة تلقائياً')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label htmlFor="autoCloseIfNoResponse">
                        {t('support.settings.autoCloseIfNoResponse', 'الإغلاق التلقائي عند عدم الرد')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('support.settings.autoCloseIfNoResponseDesc', 'إغلاق التذاكر بدون رد تلقائياً')}
                      </p>
                    </div>
                    <Switch
                      id="autoCloseIfNoResponse"
                      checked={formData.autoCloseIfNoResponse}
                      onCheckedChange={(checked) => handleSwitchChange('autoCloseIfNoResponse', checked)}
                    />
                  </div>

                  {formData.autoCloseIfNoResponse && (
                    <div className="space-y-2 ms-4">
                      <Label htmlFor="closeAfterDays">
                        {t('support.settings.closeAfterDays', 'الإغلاق بعد (أيام)')}
                      </Label>
                      <Input
                        id="closeAfterDays"
                        type="number"
                        min="1"
                        value={formData.closeAfterDays}
                        onChange={(e) => handleInputChange('closeAfterDays', parseInt(e.target.value) || 7)}
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      {t('common.saving', 'جاري الحفظ...')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      {t('common.saveChanges', 'حفظ التغييرات')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <SupportSidebar />
        </div>
      </Main>
    </>
  )
}
