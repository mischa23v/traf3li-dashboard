/**
 * Create Maintenance Schedule View
 * Form for scheduling asset maintenance
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Wrench,
  Save,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useCreateMaintenanceSchedule, useAssets } from '@/hooks/use-assets'
import { useStaff } from '@/hooks/useStaff'
import type { MaintenanceStatus } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'assets.assets', href: ROUTES.dashboard.assets.list },
  { title: 'assets.maintenance', href: ROUTES.dashboard.assets.maintenance.list },
  { title: 'assets.scheduleMaintenance', href: ROUTES.dashboard.assets.maintenance.create },
]

const MAINTENANCE_TYPES = [
  { value: 'scheduled', label: 'صيانة مجدولة', labelEn: 'Scheduled Maintenance' },
  { value: 'preventive', label: 'صيانة وقائية', labelEn: 'Preventive Maintenance' },
  { value: 'breakdown', label: 'صيانة طارئة', labelEn: 'Breakdown Maintenance' },
  { value: 'corrective', label: 'صيانة تصحيحية', labelEn: 'Corrective Maintenance' },
  { value: 'predictive', label: 'صيانة تنبؤية', labelEn: 'Predictive Maintenance' },
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'منخفضة', labelEn: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'متوسطة', labelEn: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'عالية', labelEn: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'عاجلة', labelEn: 'Urgent', color: 'text-red-600' },
]

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'يومي', labelEn: 'Daily' },
  { value: 'weekly', label: 'أسبوعي', labelEn: 'Weekly' },
  { value: 'monthly', label: 'شهري', labelEn: 'Monthly' },
  { value: 'quarterly', label: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 'yearly', label: 'سنوي', labelEn: 'Yearly' },
]

interface MaintenanceFormData {
  assetId: string
  maintenanceType: string
  dueDate: string
  priority: string
  assignedTo: string
  description: string
  estimatedCost: number
  estimatedDuration: number
  recurring: boolean
  recurrencePattern: string
  notes: string
  status: MaintenanceStatus
}

// Create an alias for useCreateMaintenance to match the requirement
export const useCreateMaintenance = useCreateMaintenanceSchedule

export function CreateMaintenanceView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMaintenanceMutation = useCreateMaintenance()
  const { data: assetsData } = useAssets({ status: 'submitted' })
  const { data: staffData } = useStaff()

  // Form state
  const [formData, setFormData] = useState<MaintenanceFormData>({
    assetId: '',
    maintenanceType: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    assignedTo: '',
    description: '',
    estimatedCost: 0,
    estimatedDuration: 0,
    recurring: false,
    recurrencePattern: '',
    notes: '',
    status: 'planned',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.assetId) {
      newErrors.assetId = t('assets.validation.assetRequired', 'الأصل مطلوب')
    }
    if (!formData.maintenanceType) {
      newErrors.maintenanceType = t('assets.validation.maintenanceTypeRequired', 'نوع الصيانة مطلوب')
    }
    if (!formData.dueDate) {
      newErrors.dueDate = t('assets.validation.dueDateRequired', 'تاريخ الاستحقاق مطلوب')
    }
    if (formData.recurring && !formData.recurrencePattern) {
      newErrors.recurrencePattern = t('assets.validation.recurrenceRequired', 'نمط التكرار مطلوب للصيانة المتكررة')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Prepare maintenance data with all custom fields in description/remarks
      const maintenanceData = {
        maintenanceType: formData.maintenanceType,
        dueDate: formData.dueDate,
        maintenanceDate: formData.dueDate,
        assignedTo: formData.assignedTo || undefined,
        description: formData.description
          ? `${formData.description}\n\n--- تفاصيل إضافية / Additional Details ---\nالأولوية / Priority: ${formData.priority}\nمدة التنفيذ المتوقعة / Estimated Duration: ${formData.estimatedDuration} ساعة / hours${formData.recurring ? `\nمتكرر / Recurring: نعم / Yes\nنمط التكرار / Pattern: ${formData.recurrencePattern}` : ''}`
          : `الأولوية / Priority: ${formData.priority}\nمدة التنفيذ المتوقعة / Estimated Duration: ${formData.estimatedDuration} ساعة / hours${formData.recurring ? `\nمتكرر / Recurring: نعم / Yes\nنمط التكرار / Pattern: ${formData.recurrencePattern}` : ''}`,
        status: formData.status,
        cost: formData.estimatedCost > 0 ? formData.estimatedCost : undefined,
        remarks: formData.notes || undefined,
      }

      await createMaintenanceMutation.mutateAsync({
        assetId: formData.assetId,
        data: maintenanceData,
      })

      navigate({ to: ROUTES.dashboard.assets.maintenance.list })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const assets = assetsData?.assets || assetsData?.data || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('assets.maintenance', 'صيانة الأصول')}
          title={t('assets.scheduleMaintenance', 'جدولة صيانة')}
          type="assets"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-emerald-600" />
                    {t('assets.maintenanceInfo', 'معلومات الصيانة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetId">{t('assets.asset', 'الأصل')} *</Label>
                      <Select
                        value={formData.assetId}
                        onValueChange={(v) => handleChange('assetId', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.assetId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('assets.selectAsset', 'اختر الأصل')} />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map((asset: any) => (
                            <SelectItem key={asset._id} value={asset._id}>
                              {asset.assetNumber} - {asset.assetNameAr || asset.assetName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assetId && (
                        <p className="text-sm text-red-500">{errors.assetId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenanceType">{t('assets.maintenanceType', 'نوع الصيانة')} *</Label>
                      <Select
                        value={formData.maintenanceType}
                        onValueChange={(v) => handleChange('maintenanceType', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.maintenanceType ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('assets.selectMaintenanceType', 'اختر نوع الصيانة')} />
                        </SelectTrigger>
                        <SelectContent>
                          {MAINTENANCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label} ({type.labelEn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.maintenanceType && (
                        <p className="text-sm text-red-500">{errors.maintenanceType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">{t('assets.dueDate', 'تاريخ الاستحقاق')} *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                        className={`rounded-xl ${errors.dueDate ? 'border-red-500' : ''}`}
                      />
                      {errors.dueDate && (
                        <p className="text-sm text-red-500">{errors.dueDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">{t('assets.priority', 'الأولوية')}</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => handleChange('priority', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <span className={priority.color}>
                                {priority.label} ({priority.labelEn})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">{t('assets.assignedTo', 'المكلف بالصيانة')}</Label>
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(v) => handleChange('assignedTo', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('assets.selectEmployee', 'اختر الموظف')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {t('assets.noAssignment', 'بدون تخصيص')}
                        </SelectItem>
                        {staffData?.map((staff: any) => (
                          <SelectItem key={staff._id} value={staff._id}>
                            {staff.firstName} {staff.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('assets.description', 'الوصف')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('assets.maintenanceDescriptionPlaceholder', 'وصف أعمال الصيانة المطلوبة...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cost & Duration */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('assets.costDuration', 'التكلفة والمدة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCost">{t('assets.estimatedCost', 'التكلفة المتوقعة')}</Label>
                      <Input
                        id="estimatedCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.estimatedCost}
                        onChange={(e) => handleChange('estimatedCost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('assets.costCurrency', 'بالريال السعودي (SAR)')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">{t('assets.estimatedDuration', 'المدة المتوقعة (ساعات)')}</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleChange('estimatedDuration', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('assets.durationHint', 'مدة تنفيذ الصيانة بالساعات')}
                      </p>
                    </div>
                  </div>

                  {formData.estimatedCost > 0 && formData.estimatedDuration > 0 && (
                    <Alert className="rounded-xl bg-blue-50 border-blue-200">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        {t('assets.costPerHour', 'متوسط التكلفة بالساعة')}: {' '}
                        <span className="font-bold">
                          {new Intl.NumberFormat('ar-SA', {
                            style: 'currency',
                            currency: 'SAR'
                          }).format(formData.estimatedCost / formData.estimatedDuration)}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Recurrence Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                    {t('assets.recurrence', 'التكرار')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="recurring">{t('assets.recurringMaintenance', 'صيانة متكررة')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('assets.recurringHint', 'تفعيل الجدولة التلقائية للصيانة الدورية')}
                      </p>
                    </div>
                    <Switch
                      id="recurring"
                      checked={formData.recurring}
                      onCheckedChange={(checked) => handleChange('recurring', checked)}
                    />
                  </div>

                  {formData.recurring && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="recurrencePattern">{t('assets.recurrencePattern', 'نمط التكرار')} *</Label>
                        <Select
                          value={formData.recurrencePattern}
                          onValueChange={(v) => handleChange('recurrencePattern', v)}
                        >
                          <SelectTrigger className={`rounded-xl ${errors.recurrencePattern ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={t('assets.selectPattern', 'اختر نمط التكرار')} />
                          </SelectTrigger>
                          <SelectContent>
                            {RECURRENCE_PATTERNS.map((pattern) => (
                              <SelectItem key={pattern.value} value={pattern.value}>
                                {pattern.label} ({pattern.labelEn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.recurrencePattern && (
                          <p className="text-sm text-red-500">{errors.recurrencePattern}</p>
                        )}
                      </div>

                      <Alert className="rounded-xl bg-amber-50 border-amber-200">
                        <RefreshCw className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-700">
                          {t('assets.recurrenceNote', 'سيتم إنشاء جدول صيانة متكرر تلقائيًا بناءً على النمط المحدد')}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    {t('assets.additionalNotes', 'ملاحظات إضافية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('assets.notes', 'الملاحظات')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder={t('assets.notesPlaceholder', 'أي ملاحظات أو تعليمات خاصة...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary Alert */}
              {formData.assetId && formData.maintenanceType && formData.dueDate && (
                <Alert className="rounded-xl border-emerald-200 bg-emerald-50">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {t('assets.maintenanceSummary', 'ملخص جدولة الصيانة')}
                      </p>
                      <p className="text-sm">
                        {t('assets.type', 'النوع')}: <span className="font-medium">{MAINTENANCE_TYPES.find(t => t.value === formData.maintenanceType)?.label}</span>
                      </p>
                      <p className="text-sm">
                        {t('assets.scheduledFor', 'موعد التنفيذ')}: <span className="font-medium">{new Date(formData.dueDate).toLocaleDateString('ar-SA')}</span>
                      </p>
                      {formData.estimatedCost > 0 && (
                        <p className="text-sm">
                          {t('assets.estimatedCost', 'التكلفة المتوقعة')}: <span className="font-medium">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(formData.estimatedCost)}</span>
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: ROUTES.dashboard.assets.maintenance.list })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMaintenanceMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createMaintenanceMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('assets.scheduleMaintenance', 'جدولة الصيانة')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <AssetsSidebar />
          </div>
        </form>
      </Main>
    </>
  )
}
