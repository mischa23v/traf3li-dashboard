/**
 * Subcontracting Settings View
 * Configuration page for subcontracting module settings
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  Loader2,
  Package,
  ClipboardCheck,
  DollarSign,
  Bell,
  Warehouse,
  AlertCircle,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

import { useSubcontractingSettings, useUpdateSubcontractingSettings } from '@/hooks/use-subcontracting'
import { SubcontractingSidebar } from './subcontracting-sidebar'

export function SubcontractingSettingsView() {
  const { t } = useTranslation()
  const { data: settingsData, isLoading } = useSubcontractingSettings()
  const updateSettingsMutation = useUpdateSubcontractingSettings()

  const [formData, setFormData] = useState({
    // General Settings
    subcontractingOrderNamingSeries: 'SCO-',
    subcontractingReceiptNamingSeries: 'SCR-',
    defaultLeadTimeDays: 7,

    // Material Settings
    autoTransferMaterialsOnSubmit: true,
    defaultSourceWarehouse: '',
    trackMaterialAtSubcontractor: true,

    // Quality Control
    requireInspectionOnReceipt: false,
    defaultInspectionTemplate: '',
    autoRejectOnFailedInspection: false,

    // Costing
    includeMaterialCostInOrder: true,
    defaultMarkupPercentage: 0,
    costAllocationMethod: 'proportional' as 'proportional' | 'manual' | 'weighted',

    // Notifications
    notifyOnOrderSubmission: true,
    notifyOnReceipt: true,
    overdueReminderDays: 3,
  })

  useEffect(() => {
    if (settingsData) {
      setFormData({
        subcontractingOrderNamingSeries: settingsData.subcontractingOrderNamingSeries || 'SCO-',
        subcontractingReceiptNamingSeries: settingsData.subcontractingReceiptNamingSeries || 'SCR-',
        defaultLeadTimeDays: (settingsData as any).defaultLeadTimeDays || 7,
        autoTransferMaterialsOnSubmit: (settingsData as any).autoTransferMaterialsOnSubmit ?? true,
        defaultSourceWarehouse: (settingsData as any).defaultSourceWarehouse || '',
        trackMaterialAtSubcontractor: (settingsData as any).trackMaterialAtSubcontractor ?? true,
        requireInspectionOnReceipt: (settingsData as any).requireInspectionOnReceipt ?? false,
        defaultInspectionTemplate: (settingsData as any).defaultInspectionTemplate || '',
        autoRejectOnFailedInspection: (settingsData as any).autoRejectOnFailedInspection ?? false,
        includeMaterialCostInOrder: (settingsData as any).includeMaterialCostInOrder ?? true,
        defaultMarkupPercentage: (settingsData as any).defaultMarkupPercentage || 0,
        costAllocationMethod: (settingsData as any).costAllocationMethod || 'proportional',
        notifyOnOrderSubmission: (settingsData as any).notifyOnOrderSubmission ?? true,
        notifyOnReceipt: (settingsData as any).notifyOnReceipt ?? true,
        overdueReminderDays: (settingsData as any).overdueReminderDays || 3,
      })
    }
  }, [settingsData])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync(formData)
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-7xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
            <div>
              <Skeleton className="h-[400px] w-full rounded-3xl" />
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-7xl mx-auto">
          {/* Main Content */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy">
                {t('subcontracting.settings', 'إعدادات التصنيع الخارجي')}
              </h1>
              <p className="text-slate-500">
                {t(
                  'subcontracting.settingsDescription',
                  'تخصيص إعدادات التصنيع الخارجي والمخزون والجودة'
                )}
              </p>
            </div>

            {/* Backend Integration Notice */}
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="space-y-2">
                  <p dir="rtl">
                    <strong>[BACKEND-PENDING]</strong> هذه الصفحة قيد التطوير حالياً.
                    التغييرات التي تجريها سيتم حفظها محلياً ولن يتم إرسالها إلى الخادم حتى
                    يتم ربط واجهة برمجة التطبيقات (API).
                  </p>
                  <p dir="ltr" className="text-sm opacity-90">
                    <strong>[BACKEND-PENDING]</strong> This page is under development. Changes
                    will be saved locally and won't be sent to the server until the API is
                    connected.
                  </p>
                  <p className="text-xs mt-2 font-mono" dir="ltr">
                    Required endpoints: GET/PUT /api/subcontracting/settings
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    {t('subcontracting.generalSettings', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'subcontracting.generalSettingsDescription',
                      'إعدادات الترقيم والوقت الافتراضي'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderNamingSeries">
                        {t('subcontracting.orderNamingSeries', 'سلسلة ترقيم الأوامر')}
                      </Label>
                      <Input
                        id="orderNamingSeries"
                        value={formData.subcontractingOrderNamingSeries}
                        onChange={(e) =>
                          handleInputChange('subcontractingOrderNamingSeries', e.target.value)
                        }
                        placeholder="SCO-"
                        dir="ltr"
                      />
                      <p className="text-xs text-slate-500">
                        {t('subcontracting.orderNamingExample', 'مثال: SCO-2025-0001')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receiptNamingSeries">
                        {t('subcontracting.receiptNamingSeries', 'سلسلة ترقيم الإيصالات')}
                      </Label>
                      <Input
                        id="receiptNamingSeries"
                        value={formData.subcontractingReceiptNamingSeries}
                        onChange={(e) =>
                          handleInputChange('subcontractingReceiptNamingSeries', e.target.value)
                        }
                        placeholder="SCR-"
                        dir="ltr"
                      />
                      <p className="text-xs text-slate-500">
                        {t('subcontracting.receiptNamingExample', 'مثال: SCR-2025-0001')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultLeadTime">
                        {t('subcontracting.defaultLeadTime', 'المدة الافتراضية (أيام)')}
                      </Label>
                      <Input
                        id="defaultLeadTime"
                        type="number"
                        value={formData.defaultLeadTimeDays}
                        onChange={(e) =>
                          handleInputChange('defaultLeadTimeDays', parseInt(e.target.value) || 0)
                        }
                        min="0"
                      />
                      <p className="text-xs text-slate-500">
                        {t(
                          'subcontracting.defaultLeadTimeDescription',
                          'عدد الأيام المتوقعة لإنجاز العمل'
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Material Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    {t('subcontracting.materialSettings', 'إعدادات المواد')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'subcontracting.materialSettingsDescription',
                      'إدارة نقل المواد والمخازن'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t(
                          'subcontracting.autoTransferMaterials',
                          'نقل المواد تلقائياً عند التقديم'
                        )}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.autoTransferMaterialsDescription',
                          'نقل المواد الخام للمصنع تلقائياً عند تقديم الأمر'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoTransferMaterialsOnSubmit}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('autoTransferMaterialsOnSubmit', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultSourceWarehouse">
                      {t('subcontracting.defaultSourceWarehouse', 'المخزن المصدر الافتراضي')}
                    </Label>
                    <Input
                      id="defaultSourceWarehouse"
                      value={formData.defaultSourceWarehouse}
                      onChange={(e) => handleInputChange('defaultSourceWarehouse', e.target.value)}
                      placeholder={t('subcontracting.selectWarehouse', 'اختر المخزن')}
                    />
                    <p className="text-xs text-slate-500">
                      {t(
                        'subcontracting.defaultSourceWarehouseDescription',
                        'المخزن الافتراضي لنقل المواد منه'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t(
                          'subcontracting.trackMaterialAtSubcontractor',
                          'تتبع المواد لدى المصنع الخارجي'
                        )}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.trackMaterialDescription',
                          'حفظ سجل للمواد الموجودة عند المصنع الخارجي'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.trackMaterialAtSubcontractor}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('trackMaterialAtSubcontractor', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quality Control */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                    {t('subcontracting.qualityControl', 'مراقبة الجودة')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'subcontracting.qualityControlDescription',
                      'إعدادات الفحص والجودة للمنتجات المستلمة'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t(
                          'subcontracting.requireInspection',
                          'الفحص مطلوب عند الاستلام'
                        )}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.requireInspectionDescription',
                          'إلزامية فحص الجودة قبل قبول المنتجات'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.requireInspectionOnReceipt}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('requireInspectionOnReceipt', checked)
                      }
                    />
                  </div>

                  {formData.requireInspectionOnReceipt && (
                    <div className="space-y-2 ms-4">
                      <Label htmlFor="inspectionTemplate">
                        {t(
                          'subcontracting.defaultInspectionTemplate',
                          'نموذج الفحص الافتراضي'
                        )}
                      </Label>
                      <Input
                        id="inspectionTemplate"
                        value={formData.defaultInspectionTemplate}
                        onChange={(e) =>
                          handleInputChange('defaultInspectionTemplate', e.target.value)
                        }
                        placeholder={t(
                          'subcontracting.selectInspectionTemplate',
                          'اختر نموذج الفحص'
                        )}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t(
                          'subcontracting.autoRejectOnFailed',
                          'رفض تلقائي عند فشل الفحص'
                        )}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.autoRejectDescription',
                          'رفض المنتجات تلقائياً إذا فشلت في الفحص'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoRejectOnFailedInspection}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('autoRejectOnFailedInspection', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Costing */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    {t('subcontracting.costing', 'التكاليف')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'subcontracting.costingDescription',
                      'إعدادات احتساب التكاليف والأسعار'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t(
                          'subcontracting.includeMaterialCost',
                          'تضمين تكلفة المواد في الأمر'
                        )}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.includeMaterialCostDescription',
                          'احتساب تكلفة المواد الخام ضمن قيمة الأمر'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.includeMaterialCostInOrder}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('includeMaterialCostInOrder', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markupPercentage">
                      {t('subcontracting.defaultMarkup', 'نسبة الربح الافتراضية (%)')}
                    </Label>
                    <Input
                      id="markupPercentage"
                      type="number"
                      value={formData.defaultMarkupPercentage}
                      onChange={(e) =>
                        handleInputChange(
                          'defaultMarkupPercentage',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-slate-500">
                      {t(
                        'subcontracting.markupDescription',
                        'نسبة الربح المضافة على تكلفة التصنيع'
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costAllocation">
                      {t('subcontracting.costAllocationMethod', 'طريقة توزيع التكاليف')}
                    </Label>
                    <Select
                      value={formData.costAllocationMethod}
                      onValueChange={(value) => handleSelectChange('costAllocationMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proportional">
                          {t('subcontracting.proportional', 'توزيع نسبي')}
                        </SelectItem>
                        <SelectItem value="manual">
                          {t('subcontracting.manual', 'يدوي')}
                        </SelectItem>
                        <SelectItem value="weighted">
                          {t('subcontracting.weighted', 'موزون')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      {t(
                        'subcontracting.costAllocationDescription',
                        'كيفية توزيع التكاليف على المنتجات'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    {t('subcontracting.notifications', 'الإشعارات')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'subcontracting.notificationsDescription',
                      'إعدادات التنبيهات والتذكيرات'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('subcontracting.notifyOnSubmission', 'إشعار عند تقديم الأمر')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.notifyOnSubmissionDescription',
                          'إرسال إشعار عند تقديم أمر تصنيع خارجي'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.notifyOnOrderSubmission}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('notifyOnOrderSubmission', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('subcontracting.notifyOnReceipt', 'إشعار عند الاستلام')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'subcontracting.notifyOnReceiptDescription',
                          'إرسال إشعار عند استلام المنتجات'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.notifyOnReceipt}
                      onCheckedChange={(checked) => handleSwitchChange('notifyOnReceipt', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overdueReminder">
                      {t('subcontracting.overdueReminderDays', 'تذكير الأوامر المتأخرة (أيام)')}
                    </Label>
                    <Input
                      id="overdueReminder"
                      type="number"
                      value={formData.overdueReminderDays}
                      onChange={(e) =>
                        handleInputChange('overdueReminderDays', parseInt(e.target.value) || 0)
                      }
                      min="0"
                    />
                    <p className="text-xs text-slate-500">
                      {t(
                        'subcontracting.overdueReminderDescription',
                        'إرسال تذكير بالأوامر المتأخرة بعد عدد الأيام'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                  )}
                  {t('common.saveChanges', 'حفظ التغييرات')}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <SubcontractingSidebar />
          </aside>
        </div>
      </Main>
    </>
  )
}
