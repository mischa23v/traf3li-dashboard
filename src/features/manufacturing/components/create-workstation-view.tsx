/**
 * Create Workstation View
 * Form for creating new workstations
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Save,
  X,
  Cog,
  AlertCircle,
  Clock,
  DollarSign,
  Gauge,
  FileText,
  Calendar,
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

import { useCreateWorkstation } from '@/hooks/use-manufacturing'
import type { Workstation } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'manufacturing.createWorkstation', href: '/dashboard/manufacturing/workstations/create' },
]

type WorkstationType = 'assembly' | 'machining' | 'welding' | 'painting' | 'packaging' | 'testing' | 'other'

type ExtendedWorkstationData = Omit<Workstation, '_id' | 'workstationId' | 'createdAt' | 'updatedAt'> & {
  workingHoursPerDay?: number
  holidayList?: string
}

export function CreateWorkstationView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createWorkstationMutation = useCreateWorkstation()

  // Form state
  const [formData, setFormData] = useState<ExtendedWorkstationData>({
    name: '',
    nameAr: '',
    workstationType: 'assembly',
    productionCapacity: undefined,
    hourRate: undefined,
    electricityCost: 0,
    consumableCost: 0,
    rentCost: 0,
    workingHoursPerDay: 8,
    description: '',
    holidayList: '',
    status: 'active',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('manufacturing.validation.workstationNameRequired', 'اسم محطة العمل مطلوب')
    }

    if (!formData.workstationType) {
      newErrors.workstationType = t('manufacturing.validation.workstationTypeRequired', 'نوع محطة العمل مطلوب')
    }

    if (formData.productionCapacity !== undefined && formData.productionCapacity < 0) {
      newErrors.productionCapacity = t('manufacturing.validation.productionCapacityPositive', 'الطاقة الإنتاجية يجب أن تكون موجبة')
    }

    if (formData.hourRate !== undefined && formData.hourRate < 0) {
      newErrors.hourRate = t('manufacturing.validation.hourRatePositive', 'التكلفة بالساعة يجب أن تكون موجبة')
    }

    if (formData.workingHoursPerDay !== undefined && (formData.workingHoursPerDay <= 0 || formData.workingHoursPerDay > 24)) {
      newErrors.workingHoursPerDay = t('manufacturing.validation.workingHoursValid', 'ساعات العمل يجب أن تكون بين 1 و 24')
    }

    if (formData.electricityCost !== undefined && formData.electricityCost < 0) {
      newErrors.electricityCost = t('manufacturing.validation.costPositive', 'التكلفة يجب أن تكون موجبة')
    }

    if (formData.consumableCost !== undefined && formData.consumableCost < 0) {
      newErrors.consumableCost = t('manufacturing.validation.costPositive', 'التكلفة يجب أن تكون موجبة')
    }

    if (formData.rentCost !== undefined && formData.rentCost < 0) {
      newErrors.rentCost = t('manufacturing.validation.costPositive', 'التكلفة يجب أن تكون موجبة')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Remove fields not in the Workstation type
      const { workingHoursPerDay, holidayList, ...workstationData } = formData

      await createWorkstationMutation.mutateAsync(workstationData)
      navigate({ to: '/dashboard/manufacturing/workstations' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof ExtendedWorkstationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const getWorkstationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      assembly: t('manufacturing.workstationType.assembly', 'تجميع'),
      machining: t('manufacturing.workstationType.machining', 'تشغيل'),
      welding: t('manufacturing.workstationType.welding', 'لحام'),
      painting: t('manufacturing.workstationType.painting', 'طلاء'),
      packaging: t('manufacturing.workstationType.packaging', 'تعبئة'),
      testing: t('manufacturing.workstationType.testing', 'اختبار'),
      other: t('manufacturing.workstationType.other', 'أخرى'),
    }
    return labels[type] || type
  }

  // Calculate total operating cost per hour
  const calculateTotalCost = () => {
    const hourRate = formData.hourRate || 0
    const electricityCost = formData.electricityCost || 0
    const consumableCost = formData.consumableCost || 0
    const rentCost = formData.rentCost || 0
    return hourRate + electricityCost + consumableCost + rentCost
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
          title={t('manufacturing.createWorkstation', 'إنشاء محطة عمل جديدة')}
          type="manufacturing"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('manufacturing.workstationName', 'اسم محطة العمل (إنجليزي)')} *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Assembly Line 01"
                        className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">
                        {t('manufacturing.workstationNameAr', 'اسم محطة العمل (عربي)')}
                      </Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                        placeholder="خط التجميع 01"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workstationType">
                      {t('manufacturing.workstationType', 'نوع محطة العمل')} *
                    </Label>
                    <Select
                      value={formData.workstationType}
                      onValueChange={(v) => handleChange('workstationType', v as WorkstationType)}
                    >
                      <SelectTrigger className={`rounded-xl ${errors.workstationType ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assembly">{getWorkstationTypeLabel('assembly')}</SelectItem>
                        <SelectItem value="machining">{getWorkstationTypeLabel('machining')}</SelectItem>
                        <SelectItem value="welding">{getWorkstationTypeLabel('welding')}</SelectItem>
                        <SelectItem value="painting">{getWorkstationTypeLabel('painting')}</SelectItem>
                        <SelectItem value="packaging">{getWorkstationTypeLabel('packaging')}</SelectItem>
                        <SelectItem value="testing">{getWorkstationTypeLabel('testing')}</SelectItem>
                        <SelectItem value="other">{getWorkstationTypeLabel('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.workstationType && (
                      <p className="text-sm text-red-500">{errors.workstationType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('manufacturing.description', 'الوصف')}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('manufacturing.descriptionPlaceholder', 'وصف محطة العمل والعمليات التي تقوم بها...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Capacity & Performance */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.capacityPerformance', 'الطاقة الإنتاجية والأداء')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productionCapacity">
                        {t('manufacturing.productionCapacity', 'الطاقة الإنتاجية (وحدة/ساعة)')}
                      </Label>
                      <Input
                        id="productionCapacity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.productionCapacity || ''}
                        onChange={(e) => handleChange('productionCapacity', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="100"
                        className={`rounded-xl ${errors.productionCapacity ? 'border-red-500' : ''}`}
                      />
                      {errors.productionCapacity && (
                        <p className="text-sm text-red-500">{errors.productionCapacity}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.productionCapacityDesc', 'عدد الوحدات التي يمكن إنتاجها في الساعة')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workingHoursPerDay">
                        {t('manufacturing.workingHoursPerDay', 'ساعات العمل في اليوم')}
                      </Label>
                      <Input
                        id="workingHoursPerDay"
                        type="number"
                        min="1"
                        max="24"
                        step="0.5"
                        value={formData.workingHoursPerDay || ''}
                        onChange={(e) => handleChange('workingHoursPerDay', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="8"
                        className={`rounded-xl ${errors.workingHoursPerDay ? 'border-red-500' : ''}`}
                      />
                      {errors.workingHoursPerDay && (
                        <p className="text-sm text-red-500">{errors.workingHoursPerDay}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.workingHoursDesc', 'عدد ساعات التشغيل في اليوم الواحد')}
                      </p>
                    </div>
                  </div>

                  {formData.productionCapacity && formData.workingHoursPerDay && (
                    <Alert className="rounded-xl bg-emerald-50 border-emerald-200">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      <AlertDescription className="text-emerald-800">
                        {t('manufacturing.dailyCapacity', 'الطاقة الإنتاجية اليومية')}:{' '}
                        <strong>{(formData.productionCapacity * formData.workingHoursPerDay).toFixed(2)}</strong>{' '}
                        {t('manufacturing.unitsPerDay', 'وحدة/يوم')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Operating Costs */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.operatingCosts', 'تكاليف التشغيل')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourRate">
                        {t('manufacturing.hourRate', 'التكلفة بالساعة (ريال)')}
                      </Label>
                      <Input
                        id="hourRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.hourRate || ''}
                        onChange={(e) => handleChange('hourRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="50.00"
                        className={`rounded-xl ${errors.hourRate ? 'border-red-500' : ''}`}
                      />
                      {errors.hourRate && (
                        <p className="text-sm text-red-500">{errors.hourRate}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.hourRateDesc', 'تكلفة العمالة والتشغيل بالساعة')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="electricityCost">
                        {t('manufacturing.electricityCost', 'تكلفة الكهرباء (ريال/ساعة)')}
                      </Label>
                      <Input
                        id="electricityCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.electricityCost || ''}
                        onChange={(e) => handleChange('electricityCost', e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder="10.00"
                        className={`rounded-xl ${errors.electricityCost ? 'border-red-500' : ''}`}
                      />
                      {errors.electricityCost && (
                        <p className="text-sm text-red-500">{errors.electricityCost}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.electricityCostDesc', 'تكلفة استهلاك الكهرباء بالساعة')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consumableCost">
                        {t('manufacturing.consumableCost', 'تكلفة المواد الاستهلاكية (ريال/ساعة)')}
                      </Label>
                      <Input
                        id="consumableCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.consumableCost || ''}
                        onChange={(e) => handleChange('consumableCost', e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder="5.00"
                        className={`rounded-xl ${errors.consumableCost ? 'border-red-500' : ''}`}
                      />
                      {errors.consumableCost && (
                        <p className="text-sm text-red-500">{errors.consumableCost}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.consumableCostDesc', 'تكلفة المواد المستهلكة في التشغيل')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rentCost">
                        {t('manufacturing.rentCost', 'تكلفة الإيجار (ريال/ساعة)')}
                      </Label>
                      <Input
                        id="rentCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rentCost || ''}
                        onChange={(e) => handleChange('rentCost', e.target.value ? parseFloat(e.target.value) : 0)}
                        placeholder="15.00"
                        className={`rounded-xl ${errors.rentCost ? 'border-red-500' : ''}`}
                      />
                      {errors.rentCost && (
                        <p className="text-sm text-red-500">{errors.rentCost}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('manufacturing.rentCostDesc', 'تكلفة الإيجار أو الإهلاك بالساعة')}
                      </p>
                    </div>
                  </div>

                  {calculateTotalCost() > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {t('manufacturing.totalOperatingCost', 'إجمالي تكلفة التشغيل')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('manufacturing.perHour', 'لكل ساعة')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">
                            {calculateTotalCost().toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('manufacturing.sar', 'ريال سعودي')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Schedule Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.scheduleSettings', 'إعدادات الجدولة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="holidayList">
                      {t('manufacturing.holidayList', 'قائمة العطلات')}
                    </Label>
                    <Select
                      value={formData.holidayList}
                      onValueChange={(v) => handleChange('holidayList', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('manufacturing.selectHolidayList', 'اختر قائمة العطلات')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('manufacturing.noHolidayList', 'بدون قائمة عطلات')}</SelectItem>
                        <SelectItem value="saudi-national-holidays">{t('manufacturing.saudiNationalHolidays', 'العطلات الوطنية السعودية')}</SelectItem>
                        <SelectItem value="custom-holidays">{t('manufacturing.customHolidays', 'عطلات مخصصة')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {t('manufacturing.holidayListDesc', 'قائمة العطلات الرسمية التي ستؤثر على جدولة الإنتاج')}
                    </p>
                  </div>

                  <Alert className="rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {t('manufacturing.holidayListNote', 'ملاحظة: إدارة قوائم العطلات ستكون متاحة في التحديثات القادمة')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Status Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.statusSettings', 'إعدادات الحالة')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <Label>{t('manufacturing.isActive', 'محطة عمل نشطة')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('manufacturing.isActiveDesc', 'تفعيل محطة العمل للاستخدام في الإنتاج')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.status === 'active'}
                      onCheckedChange={(checked) => handleChange('status', checked ? 'active' : 'inactive')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/manufacturing/workstations' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createWorkstationMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createWorkstationMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <ManufacturingSidebar />
          </div>
        </form>
      </Main>
    </>
  )
}
