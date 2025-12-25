/**
 * Manufacturing Settings View
 * Comprehensive settings page for manufacturing module configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Settings,
  Loader2,
  Save,
  Package,
  Calendar,
  Cog,
  CheckCircle2,
  Warehouse,
  FileText,
  ClipboardCheck,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useManufacturingSettings, useUpdateManufacturingSettings } from '@/hooks/use-manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'manufacturing.settings', href: '/dashboard/settings/manufacturing' },
]

interface SettingsFormData {
  // General Settings
  workOrderNamingSeries: string
  jobCardNamingSeries: string
  defaultWorkInProgressWarehouse: string
  defaultFinishedGoodsWarehouse: string

  // Production Planning
  enableCapacityPlanning: boolean
  defaultPlanningHorizon: number
  allowOvertime: boolean
  overtimeRateMultiplier: number

  // Material Consumption
  autoConsumeOnStart: boolean
  backflushRawMaterials: boolean
  materialTransferBasedOn: 'BOM' | 'Actual'

  // Quality Control
  enableInProcessQC: boolean
  enableFinalQC: boolean
  qcTemplate: string

  // Workstations
  defaultWorkstation: string
  enableWorkstationScheduling: boolean
  timeTrackingMethod: 'Manual' | 'Automatic'

  // Legacy fields (from existing ManufacturingSettings type)
  capacityPlanningForDays?: number
  disableCapacityPlanning?: boolean
  allowOverproduction?: boolean
  overproductionPercentage?: number
}

export function ManufacturingSettingsView() {
  const { t } = useTranslation()
  const { data: settings, isLoading } = useManufacturingSettings()
  const updateMutation = useUpdateManufacturingSettings()

  const [formData, setFormData] = useState<SettingsFormData>({
    // General Settings
    workOrderNamingSeries: 'MFG-WO-.YYYY.-',
    jobCardNamingSeries: 'MFG-JC-.YYYY.-',
    defaultWorkInProgressWarehouse: '',
    defaultFinishedGoodsWarehouse: '',

    // Production Planning
    enableCapacityPlanning: true,
    defaultPlanningHorizon: 30,
    allowOvertime: false,
    overtimeRateMultiplier: 1.5,

    // Material Consumption
    autoConsumeOnStart: false,
    backflushRawMaterials: true,
    materialTransferBasedOn: 'BOM',

    // Quality Control
    enableInProcessQC: false,
    enableFinalQC: true,
    qcTemplate: '',

    // Workstations
    defaultWorkstation: '',
    enableWorkstationScheduling: true,
    timeTrackingMethod: 'Manual',

    // Legacy
    capacityPlanningForDays: 30,
    disableCapacityPlanning: false,
    allowOverproduction: false,
    overproductionPercentage: 10,
  })

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        workOrderNamingSeries: settings.workOrderNamingSeries || prev.workOrderNamingSeries,
        jobCardNamingSeries: settings.jobCardNamingSeries || prev.jobCardNamingSeries,
        defaultWorkInProgressWarehouse: settings.defaultWorkInProgressWarehouse || prev.defaultWorkInProgressWarehouse,
        defaultFinishedGoodsWarehouse: settings.defaultFinishedGoodsWarehouse || prev.defaultFinishedGoodsWarehouse,
        enableCapacityPlanning: !settings.disableCapacityPlanning,
        defaultPlanningHorizon: settings.capacityPlanningForDays || prev.defaultPlanningHorizon,
        capacityPlanningForDays: settings.capacityPlanningForDays || prev.capacityPlanningForDays,
        disableCapacityPlanning: settings.disableCapacityPlanning || prev.disableCapacityPlanning,
        allowOverproduction: settings.allowOverproduction || prev.allowOverproduction,
        overproductionPercentage: settings.overproductionPercentage || prev.overproductionPercentage,
      }))
    }
  }, [settings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSwitchChange = (name: keyof SettingsFormData, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSelectChange = (name: keyof SettingsFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Map to the actual API format
    const dataToSubmit = {
      workOrderNamingSeries: formData.workOrderNamingSeries,
      jobCardNamingSeries: formData.jobCardNamingSeries,
      defaultWorkInProgressWarehouse: formData.defaultWorkInProgressWarehouse,
      defaultFinishedGoodsWarehouse: formData.defaultFinishedGoodsWarehouse,
      capacityPlanningForDays: formData.defaultPlanningHorizon,
      disableCapacityPlanning: !formData.enableCapacityPlanning,
      allowOverproduction: formData.allowOverproduction,
      overproductionPercentage: formData.overproductionPercentage,
    }

    await updateMutation.mutateAsync(dataToSubmit)
  }

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <ProductivityHero
            badge={t('manufacturing.badge', 'إدارة التصنيع')}
            title={t('manufacturing.settings', 'إعدادات التصنيع')}
            type="manufacturing"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-3xl" />
              <Skeleton className="h-[400px] w-full rounded-3xl" />
            </div>
            <ManufacturingSidebar />
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
          badge={t('manufacturing.badge', 'إدارة التصنيع')}
          title={t('manufacturing.settings', 'إعدادات التصنيع')}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-600" />
                    {t('manufacturing.settings.general', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t('manufacturing.settings.generalDesc', 'إعدادات أساسية للتصنيع والترقيم')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workOrderNamingSeries">
                        {t('manufacturing.settings.workOrderNaming', 'سلسلة ترقيم أوامر العمل')}
                      </Label>
                      <div className="relative">
                        <FileText className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="workOrderNamingSeries"
                          name="workOrderNamingSeries"
                          value={formData.workOrderNamingSeries}
                          onChange={handleInputChange}
                          placeholder="MFG-WO-.YYYY.-"
                          dir="ltr"
                          className="pe-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobCardNamingSeries">
                        {t('manufacturing.settings.jobCardNaming', 'سلسلة ترقيم بطاقات العمل')}
                      </Label>
                      <div className="relative">
                        <FileText className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="jobCardNamingSeries"
                          name="jobCardNamingSeries"
                          value={formData.jobCardNamingSeries}
                          onChange={handleInputChange}
                          placeholder="MFG-JC-.YYYY.-"
                          dir="ltr"
                          className="pe-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultWorkInProgressWarehouse">
                        {t('manufacturing.settings.defaultWIPWarehouse', 'مستودع العمل قيد التنفيذ الافتراضي')}
                      </Label>
                      <div className="relative">
                        <Warehouse className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="defaultWorkInProgressWarehouse"
                          name="defaultWorkInProgressWarehouse"
                          value={formData.defaultWorkInProgressWarehouse}
                          onChange={handleInputChange}
                          placeholder={t('manufacturing.settings.selectWarehouse', 'حدد المستودع')}
                          className="pe-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultFinishedGoodsWarehouse">
                        {t('manufacturing.settings.defaultFGWarehouse', 'مستودع البضائع الجاهزة الافتراضي')}
                      </Label>
                      <div className="relative">
                        <Warehouse className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          id="defaultFinishedGoodsWarehouse"
                          name="defaultFinishedGoodsWarehouse"
                          value={formData.defaultFinishedGoodsWarehouse}
                          onChange={handleInputChange}
                          placeholder={t('manufacturing.settings.selectWarehouse', 'حدد المستودع')}
                          className="pe-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Production Planning */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {t('manufacturing.settings.productionPlanning', 'تخطيط الإنتاج')}
                  </CardTitle>
                  <CardDescription>
                    {t('manufacturing.settings.productionPlanningDesc', 'إعدادات التخطيط وجدولة الإنتاج')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableCapacityPlanning">
                        {t('manufacturing.settings.enableCapacityPlanning', 'تفعيل تخطيط القدرة الإنتاجية')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.enableCapacityPlanningDesc', 'تمكين التخطيط بناءً على قدرة محطات العمل')}
                      </p>
                    </div>
                    <Switch
                      id="enableCapacityPlanning"
                      checked={formData.enableCapacityPlanning}
                      onCheckedChange={(checked) => handleSwitchChange('enableCapacityPlanning', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultPlanningHorizon">
                        {t('manufacturing.settings.planningHorizon', 'أفق التخطيط الافتراضي (أيام)')}
                      </Label>
                      <Input
                        id="defaultPlanningHorizon"
                        name="defaultPlanningHorizon"
                        type="number"
                        value={formData.defaultPlanningHorizon}
                        onChange={handleInputChange}
                        min="1"
                        max="365"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtimeRateMultiplier">
                        {t('manufacturing.settings.overtimeMultiplier', 'معامل سعر العمل الإضافي')}
                      </Label>
                      <Input
                        id="overtimeRateMultiplier"
                        name="overtimeRateMultiplier"
                        type="number"
                        step="0.1"
                        value={formData.overtimeRateMultiplier}
                        onChange={handleInputChange}
                        min="1"
                        max="5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowOvertime">
                        {t('manufacturing.settings.allowOvertime', 'السماح بالعمل الإضافي')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.allowOvertimeDesc', 'السماح بجدولة ساعات عمل إضافية')}
                      </p>
                    </div>
                    <Switch
                      id="allowOvertime"
                      checked={formData.allowOvertime}
                      onCheckedChange={(checked) => handleSwitchChange('allowOvertime', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowOverproduction">
                        {t('manufacturing.settings.allowOverproduction', 'السماح بالإنتاج الزائد')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.allowOverproductionDesc', 'إنتاج كمية أكبر من المطلوب')}
                      </p>
                    </div>
                    <Switch
                      id="allowOverproduction"
                      checked={formData.allowOverproduction}
                      onCheckedChange={(checked) => handleSwitchChange('allowOverproduction', checked)}
                    />
                  </div>

                  {formData.allowOverproduction && (
                    <div className="space-y-2">
                      <Label htmlFor="overproductionPercentage">
                        {t('manufacturing.settings.overproductionPercentage', 'نسبة الإنتاج الزائد المسموح (%)')}
                      </Label>
                      <Input
                        id="overproductionPercentage"
                        name="overproductionPercentage"
                        type="number"
                        value={formData.overproductionPercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Material Consumption */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    {t('manufacturing.settings.materialConsumption', 'استهلاك المواد')}
                  </CardTitle>
                  <CardDescription>
                    {t('manufacturing.settings.materialConsumptionDesc', 'كيفية تتبع ونقل المواد الخام')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoConsumeOnStart">
                        {t('manufacturing.settings.autoConsume', 'استهلاك تلقائي عند البدء')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.autoConsumeDesc', 'استهلاك المواد تلقائياً عند بدء أمر العمل')}
                      </p>
                    </div>
                    <Switch
                      id="autoConsumeOnStart"
                      checked={formData.autoConsumeOnStart}
                      onCheckedChange={(checked) => handleSwitchChange('autoConsumeOnStart', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="backflushRawMaterials">
                        {t('manufacturing.settings.backflush', 'الاستهلاك العكسي للمواد الخام')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.backflushDesc', 'احتساب المواد المستهلكة بناءً على الإنتاج الفعلي')}
                      </p>
                    </div>
                    <Switch
                      id="backflushRawMaterials"
                      checked={formData.backflushRawMaterials}
                      onCheckedChange={(checked) => handleSwitchChange('backflushRawMaterials', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="materialTransferBasedOn">
                      {t('manufacturing.settings.materialTransferBasis', 'نقل المواد بناءً على')}
                    </Label>
                    <Select
                      value={formData.materialTransferBasedOn}
                      onValueChange={(value) => handleSelectChange('materialTransferBasedOn', value)}
                    >
                      <SelectTrigger id="materialTransferBasedOn">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOM">
                          {t('manufacturing.settings.basedOnBOM', 'قائمة المواد (BOM)')}
                        </SelectItem>
                        <SelectItem value="Actual">
                          {t('manufacturing.settings.basedOnActual', 'الاستهلاك الفعلي')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Control */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    {t('manufacturing.settings.qualityControl', 'مراقبة الجودة')}
                  </CardTitle>
                  <CardDescription>
                    {t('manufacturing.settings.qualityControlDesc', 'إعدادات الفحص والجودة أثناء وبعد الإنتاج')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableInProcessQC">
                        {t('manufacturing.settings.enableInProcessQC', 'تفعيل فحص الجودة أثناء العملية')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.enableInProcessQCDesc', 'إجراء فحوصات جودة خلال مراحل الإنتاج')}
                      </p>
                    </div>
                    <Switch
                      id="enableInProcessQC"
                      checked={formData.enableInProcessQC}
                      onCheckedChange={(checked) => handleSwitchChange('enableInProcessQC', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableFinalQC">
                        {t('manufacturing.settings.enableFinalQC', 'تفعيل فحص الجودة النهائي')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.enableFinalQCDesc', 'فحص جودة المنتجات النهائية قبل التخزين')}
                      </p>
                    </div>
                    <Switch
                      id="enableFinalQC"
                      checked={formData.enableFinalQC}
                      onCheckedChange={(checked) => handleSwitchChange('enableFinalQC', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="qcTemplate">
                      {t('manufacturing.settings.qcTemplate', 'قالب فحص الجودة')}
                    </Label>
                    <div className="relative">
                      <ClipboardCheck className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="qcTemplate"
                        name="qcTemplate"
                        value={formData.qcTemplate}
                        onChange={handleInputChange}
                        placeholder={t('manufacturing.settings.selectQCTemplate', 'حدد قالب الفحص')}
                        className="pe-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workstations */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="h-5 w-5 text-indigo-600" />
                    {t('manufacturing.settings.workstations', 'محطات العمل')}
                  </CardTitle>
                  <CardDescription>
                    {t('manufacturing.settings.workstationsDesc', 'إعدادات محطات العمل والجدولة')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultWorkstation">
                      {t('manufacturing.settings.defaultWorkstation', 'محطة العمل الافتراضية')}
                    </Label>
                    <div className="relative">
                      <Cog className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="defaultWorkstation"
                        name="defaultWorkstation"
                        value={formData.defaultWorkstation}
                        onChange={handleInputChange}
                        placeholder={t('manufacturing.settings.selectWorkstation', 'حدد محطة العمل')}
                        className="pe-10"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableWorkstationScheduling">
                        {t('manufacturing.settings.enableScheduling', 'تفعيل جدولة محطات العمل')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('manufacturing.settings.enableSchedulingDesc', 'جدولة العمليات تلقائياً على محطات العمل')}
                      </p>
                    </div>
                    <Switch
                      id="enableWorkstationScheduling"
                      checked={formData.enableWorkstationScheduling}
                      onCheckedChange={(checked) => handleSwitchChange('enableWorkstationScheduling', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="timeTrackingMethod">
                      {t('manufacturing.settings.timeTracking', 'طريقة تتبع الوقت')}
                    </Label>
                    <Select
                      value={formData.timeTrackingMethod}
                      onValueChange={(value) => handleSelectChange('timeTrackingMethod', value)}
                    >
                      <SelectTrigger id="timeTrackingMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">
                          {t('manufacturing.settings.manualTracking', 'يدوي')}
                        </SelectItem>
                        <SelectItem value="Automatic">
                          {t('manufacturing.settings.automaticTracking', 'تلقائي')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ms-2" />
                  )}
                  {t('common.save', 'حفظ الإعدادات')}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <ManufacturingSidebar />
        </div>
      </Main>
    </>
  )
}
