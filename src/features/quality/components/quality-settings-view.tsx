/**
 * Quality Settings View
 * Comprehensive quality management settings page
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  ClipboardCheck,
  Bell,
  AlertTriangle,
  FileText,
  Save,
  Loader2,
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

import { useQualitySettings, useUpdateQualitySettings } from '@/hooks/use-quality'
import { QualitySidebar } from './quality-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.quality', href: ROUTES.dashboard.quality.list },
  { title: 'quality.settings', href: ROUTES.dashboard.quality.settings },
]

// Default settings structure
const DEFAULT_QUALITY_SETTINGS = {
  // General Settings
  inspectionNamingSeries: 'QI-.YYYY.-',
  defaultInspectionType: 'incoming' as const,
  autoCreateInspectionOnReceipt: true,
  autoCreateInspectionOnDelivery: false,

  // Acceptance Criteria
  defaultAcceptanceStatus: 'pending' as const,
  allowPartialAcceptance: true,
  rejectionWorkflow: 'return' as 'return' | 'scrap' | 'rework',

  // Notifications
  notifyOnInspectionFailure: true,
  failureNotificationRecipients: '',
  dailyQualitySummaryEmail: false,

  // Actions
  autoCreateCorrectiveActionOnFailure: true,
  defaultActionDueDays: 7,
  actionAssignee: '',

  // Documents
  qualityCertificateTemplate: '',
  inspectionReportTemplate: '',
}

export function QualitySettingsView() {
  const { t } = useTranslation()

  // Queries
  const { data: settingsData, isLoading } = useQualitySettings()
  const updateSettingsMutation = useUpdateQualitySettings()

  // Form state
  const [formData, setFormData] = useState(DEFAULT_QUALITY_SETTINGS)

  // Load settings data when available
  useEffect(() => {
    if (settingsData) {
      setFormData({
        inspectionNamingSeries: settingsData.inspectionNamingSeries || DEFAULT_QUALITY_SETTINGS.inspectionNamingSeries,
        defaultInspectionType: (settingsData as any).defaultInspectionType || DEFAULT_QUALITY_SETTINGS.defaultInspectionType,
        autoCreateInspectionOnReceipt: (settingsData as any).autoCreateInspectionOnReceipt ?? DEFAULT_QUALITY_SETTINGS.autoCreateInspectionOnReceipt,
        autoCreateInspectionOnDelivery: (settingsData as any).autoCreateInspectionOnDelivery ?? DEFAULT_QUALITY_SETTINGS.autoCreateInspectionOnDelivery,
        defaultAcceptanceStatus: (settingsData as any).defaultAcceptanceStatus || DEFAULT_QUALITY_SETTINGS.defaultAcceptanceStatus,
        allowPartialAcceptance: (settingsData as any).allowPartialAcceptance ?? DEFAULT_QUALITY_SETTINGS.allowPartialAcceptance,
        rejectionWorkflow: (settingsData as any).rejectionWorkflow || DEFAULT_QUALITY_SETTINGS.rejectionWorkflow,
        notifyOnInspectionFailure: (settingsData as any).notifyOnInspectionFailure ?? DEFAULT_QUALITY_SETTINGS.notifyOnInspectionFailure,
        failureNotificationRecipients: (settingsData as any).failureNotificationRecipients || DEFAULT_QUALITY_SETTINGS.failureNotificationRecipients,
        dailyQualitySummaryEmail: (settingsData as any).dailyQualitySummaryEmail ?? DEFAULT_QUALITY_SETTINGS.dailyQualitySummaryEmail,
        autoCreateCorrectiveActionOnFailure: (settingsData as any).autoCreateCorrectiveActionOnFailure ?? DEFAULT_QUALITY_SETTINGS.autoCreateCorrectiveActionOnFailure,
        defaultActionDueDays: (settingsData as any).defaultActionDueDays || DEFAULT_QUALITY_SETTINGS.defaultActionDueDays,
        actionAssignee: (settingsData as any).actionAssignee || DEFAULT_QUALITY_SETTINGS.actionAssignee,
        qualityCertificateTemplate: (settingsData as any).qualityCertificateTemplate || DEFAULT_QUALITY_SETTINGS.qualityCertificateTemplate,
        inspectionReportTemplate: (settingsData as any).inspectionReportTemplate || DEFAULT_QUALITY_SETTINGS.inspectionReportTemplate,
      })
    }
  }, [settingsData])

  // Event handlers
  const handleSwitchChange = (field: keyof typeof formData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSelectChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync(formData as any)
  }

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
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
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.settings', 'إعدادات الجودة')}
          type="quality"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    {t('quality.settings.general', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t('quality.settings.generalDesc', 'إعدادات الترقيم، النوع الافتراضي، والإنشاء التلقائي')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inspectionNamingSeries">
                      {t('quality.settings.inspectionNamingSeries', 'سلسلة ترقيم الفحوصات')}
                    </Label>
                    <Input
                      id="inspectionNamingSeries"
                      value={formData.inspectionNamingSeries}
                      onChange={(e) => handleInputChange('inspectionNamingSeries', e.target.value)}
                      placeholder="QI-.YYYY.-"
                      dir="ltr"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('quality.settings.namingSeriesHint', 'مثال: QI-.YYYY.- سينتج QI-2025-0001')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultInspectionType">
                      {t('quality.settings.defaultInspectionType', 'نوع الفحص الافتراضي')}
                    </Label>
                    <Select
                      value={formData.defaultInspectionType}
                      onValueChange={(value) => handleSelectChange('defaultInspectionType', value)}
                    >
                      <SelectTrigger id="defaultInspectionType" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming">{t('quality.type.incoming', 'وارد')}</SelectItem>
                        <SelectItem value="outgoing">{t('quality.type.outgoing', 'صادر')}</SelectItem>
                        <SelectItem value="in_process">{t('quality.type.inProcess', 'قيد التصنيع')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="autoCreateInspectionOnReceipt">
                        {t('quality.settings.autoCreateInspectionOnReceipt', 'إنشاء فحص تلقائي عند الاستلام')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.autoCreateReceiptDesc', 'إنشاء فحص جودة تلقائياً عند استلام البضائع')}
                      </p>
                    </div>
                    <Switch
                      id="autoCreateInspectionOnReceipt"
                      checked={formData.autoCreateInspectionOnReceipt}
                      onCheckedChange={(checked) => handleSwitchChange('autoCreateInspectionOnReceipt', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="autoCreateInspectionOnDelivery">
                        {t('quality.settings.autoCreateInspectionOnDelivery', 'إنشاء فحص تلقائي عند التسليم')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.autoCreateDeliveryDesc', 'إنشاء فحص جودة تلقائياً قبل تسليم البضائع')}
                      </p>
                    </div>
                    <Switch
                      id="autoCreateInspectionOnDelivery"
                      checked={formData.autoCreateInspectionOnDelivery}
                      onCheckedChange={(checked) => handleSwitchChange('autoCreateInspectionOnDelivery', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Criteria */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                    {t('quality.settings.acceptanceCriteria', 'معايير القبول')}
                  </CardTitle>
                  <CardDescription>
                    {t('quality.settings.acceptanceCriteriaDesc', 'إعدادات حالة القبول الافتراضية وسير العمل')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultAcceptanceStatus">
                      {t('quality.settings.defaultAcceptanceStatus', 'حالة القبول الافتراضية')}
                    </Label>
                    <Select
                      value={formData.defaultAcceptanceStatus}
                      onValueChange={(value) => handleSelectChange('defaultAcceptanceStatus', value)}
                    >
                      <SelectTrigger id="defaultAcceptanceStatus" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('quality.status.pending', 'قيد الانتظار')}</SelectItem>
                        <SelectItem value="accepted">{t('quality.status.accepted', 'مقبول')}</SelectItem>
                        <SelectItem value="rejected">{t('quality.status.rejected', 'مرفوض')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="allowPartialAcceptance">
                        {t('quality.settings.allowPartialAcceptance', 'السماح بالقبول الجزئي')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.allowPartialDesc', 'إمكانية قبول جزء من الكمية ورفض الجزء الآخر')}
                      </p>
                    </div>
                    <Switch
                      id="allowPartialAcceptance"
                      checked={formData.allowPartialAcceptance}
                      onCheckedChange={(checked) => handleSwitchChange('allowPartialAcceptance', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejectionWorkflow">
                      {t('quality.settings.rejectionWorkflow', 'سير عمل الرفض')}
                    </Label>
                    <Select
                      value={formData.rejectionWorkflow}
                      onValueChange={(value) => handleSelectChange('rejectionWorkflow', value)}
                    >
                      <SelectTrigger id="rejectionWorkflow" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="return">{t('quality.workflow.return', 'إرجاع للمورد')}</SelectItem>
                        <SelectItem value="scrap">{t('quality.workflow.scrap', 'إتلاف')}</SelectItem>
                        <SelectItem value="rework">{t('quality.workflow.rework', 'إعادة معالجة')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    {t('quality.settings.notifications', 'الإشعارات')}
                  </CardTitle>
                  <CardDescription>
                    {t('quality.settings.notificationsDesc', 'إعدادات التنبيهات والإشعارات البريدية')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="notifyOnInspectionFailure">
                        {t('quality.settings.notifyOnInspectionFailure', 'إشعار عند فشل الفحص')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.notifyFailureDesc', 'إرسال إشعار عند رفض فحص الجودة')}
                      </p>
                    </div>
                    <Switch
                      id="notifyOnInspectionFailure"
                      checked={formData.notifyOnInspectionFailure}
                      onCheckedChange={(checked) => handleSwitchChange('notifyOnInspectionFailure', checked)}
                    />
                  </div>

                  {formData.notifyOnInspectionFailure && (
                    <div className="space-y-2 ms-4">
                      <Label htmlFor="failureNotificationRecipients">
                        {t('quality.settings.failureNotificationRecipients', 'مستلمي إشعارات الفشل')}
                      </Label>
                      <Input
                        id="failureNotificationRecipients"
                        value={formData.failureNotificationRecipients}
                        onChange={(e) => handleInputChange('failureNotificationRecipients', e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        dir="ltr"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('quality.settings.recipientsHint', 'أدخل عناوين البريد الإلكتروني مفصولة بفواصل')}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="dailyQualitySummaryEmail">
                        {t('quality.settings.dailyQualitySummaryEmail', 'ملخص الجودة اليومي')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.dailySummaryDesc', 'إرسال تقرير يومي بملخص فحوصات الجودة')}
                      </p>
                    </div>
                    <Switch
                      id="dailyQualitySummaryEmail"
                      checked={formData.dailyQualitySummaryEmail}
                      onCheckedChange={(checked) => handleSwitchChange('dailyQualitySummaryEmail', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-emerald-600" />
                    {t('quality.settings.actions', 'الإجراءات التصحيحية')}
                  </CardTitle>
                  <CardDescription>
                    {t('quality.settings.actionsDesc', 'إعدادات الإجراءات التصحيحية والوقائية')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <Label htmlFor="autoCreateCorrectiveActionOnFailure">
                        {t('quality.settings.autoCreateCorrectiveAction', 'إنشاء إجراء تصحيحي تلقائي')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('quality.settings.autoCreateActionDesc', 'إنشاء إجراء تصحيحي تلقائياً عند فشل الفحص')}
                      </p>
                    </div>
                    <Switch
                      id="autoCreateCorrectiveActionOnFailure"
                      checked={formData.autoCreateCorrectiveActionOnFailure}
                      onCheckedChange={(checked) => handleSwitchChange('autoCreateCorrectiveActionOnFailure', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultActionDueDays">
                      {t('quality.settings.defaultActionDueDays', 'الأيام الافتراضية لاستحقاق الإجراء')}
                    </Label>
                    <Input
                      id="defaultActionDueDays"
                      type="number"
                      value={formData.defaultActionDueDays}
                      onChange={(e) => handleInputChange('defaultActionDueDays', parseInt(e.target.value) || 7)}
                      min="1"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('quality.settings.dueDaysHint', 'عدد الأيام قبل استحقاق الإجراء التصحيحي')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionAssignee">
                      {t('quality.settings.actionAssignee', 'المسؤول عن الإجراءات')}
                    </Label>
                    <Input
                      id="actionAssignee"
                      value={formData.actionAssignee}
                      onChange={(e) => handleInputChange('actionAssignee', e.target.value)}
                      placeholder={t('quality.settings.assigneePlaceholder', 'اختر المسؤول الافتراضي')}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('quality.settings.assigneeHint', 'المسؤول الافتراضي عن الإجراءات التصحيحية')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    {t('quality.settings.documents', 'المستندات والقوالب')}
                  </CardTitle>
                  <CardDescription>
                    {t('quality.settings.documentsDesc', 'قوالب الشهادات والتقارير')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualityCertificateTemplate">
                      {t('quality.settings.qualityCertificateTemplate', 'قالب شهادة الجودة')}
                    </Label>
                    <Select
                      value={formData.qualityCertificateTemplate}
                      onValueChange={(value) => handleSelectChange('qualityCertificateTemplate', value)}
                    >
                      <SelectTrigger id="qualityCertificateTemplate" className="rounded-xl">
                        <SelectValue placeholder={t('quality.settings.selectTemplate', 'اختر قالب')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('common.none', 'بدون')}</SelectItem>
                        <SelectItem value="standard">
                          {t('quality.templates.standard', 'القالب القياسي')}
                        </SelectItem>
                        <SelectItem value="iso">
                          {t('quality.templates.iso', 'قالب ISO')}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t('quality.templates.custom', 'قالب مخصص')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspectionReportTemplate">
                      {t('quality.settings.inspectionReportTemplate', 'قالب تقرير الفحص')}
                    </Label>
                    <Select
                      value={formData.inspectionReportTemplate}
                      onValueChange={(value) => handleSelectChange('inspectionReportTemplate', value)}
                    >
                      <SelectTrigger id="inspectionReportTemplate" className="rounded-xl">
                        <SelectValue placeholder={t('quality.settings.selectTemplate', 'اختر قالب')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('common.none', 'بدون')}</SelectItem>
                        <SelectItem value="detailed">
                          {t('quality.templates.detailed', 'التقرير التفصيلي')}
                        </SelectItem>
                        <SelectItem value="summary">
                          {t('quality.templates.summary', 'التقرير الملخص')}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t('quality.templates.custom', 'قالب مخصص')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ms-2" />
                  )}
                  {t('common.saveChanges', 'حفظ التغييرات')}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <QualitySidebar />
        </div>
      </Main>
    </>
  )
}
