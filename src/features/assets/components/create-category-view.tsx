/**
 * Create Asset Category View
 * Form for creating new asset categories with depreciation settings
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FolderOpen,
  Save,
  X,
  TrendingDown,
  DollarSign,
  Settings,
  AlertCircle,
  BarChart3,
  Building2,
  FolderTree,
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
import { Separator } from '@/components/ui/separator'

import { useCreateAssetCategory, useAssetCategories } from '@/hooks/use-assets'
import type { DepreciationMethod } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'assets.assets', href: ROUTES.dashboard.assets.list },
  { title: 'assets.categories', href: ROUTES.dashboard.assets.categories.list },
  { title: 'assets.createCategory', href: ROUTES.dashboard.assets.categories.create },
]

const DEPRECIATION_METHODS: { value: DepreciationMethod; label: string; labelEn: string }[] = [
  { value: 'straight_line', label: 'القسط الثابت', labelEn: 'Straight Line' },
  { value: 'double_declining_balance', label: 'الرصيد المتناقص المزدوج', labelEn: 'Double Declining Balance' },
  { value: 'written_down_value', label: 'القيمة المخفضة', labelEn: 'Written Down Value' },
]

const DEPRECIATION_FREQUENCY_OPTIONS = [
  { value: 1, label: 'شهري', labelEn: 'Monthly' },
  { value: 3, label: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 12, label: 'سنوي', labelEn: 'Yearly' },
]

interface CreateCategoryFormData {
  name: string
  nameAr: string
  parentCategory: string
  depreciationMethod: DepreciationMethod
  totalNumberOfDepreciations: number
  frequencyOfDepreciation: number
  accumulatedDepreciationAccount: string
  depreciationExpenseAccount: string
  capitalWorkInProgressAccount: string
  fixedAssetAccount: string
  isGroup: boolean
  isActive: boolean
  description: string
}

export function CreateCategoryView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createCategoryMutation = useCreateAssetCategory()
  const { data: categoriesData } = useAssetCategories()

  // Form state
  const [formData, setFormData] = useState<CreateCategoryFormData>({
    name: '',
    nameAr: '',
    parentCategory: '',
    depreciationMethod: 'straight_line',
    totalNumberOfDepreciations: 5,
    frequencyOfDepreciation: 12,
    accumulatedDepreciationAccount: '',
    depreciationExpenseAccount: '',
    capitalWorkInProgressAccount: '',
    fixedAssetAccount: '',
    isGroup: false,
    isActive: true,
    description: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('assets.validation.categoryNameRequired', 'اسم الفئة (إنجليزي) مطلوب')
    }

    if (!formData.depreciationMethod) {
      newErrors.depreciationMethod = t('assets.validation.methodRequired', 'طريقة الإهلاك مطلوبة')
    }

    if (!formData.totalNumberOfDepreciations || formData.totalNumberOfDepreciations < 1) {
      newErrors.totalNumberOfDepreciations = t('assets.validation.usefulLifeRequired', 'العمر الإنتاجي مطلوب ويجب أن يكون موجبًا')
    }

    if (!formData.frequencyOfDepreciation || formData.frequencyOfDepreciation < 1) {
      newErrors.frequencyOfDepreciation = t('assets.validation.frequencyRequired', 'تكرار الإهلاك مطلوب')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Prepare data for submission
      const categoryData = {
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        parentCategory: formData.parentCategory || undefined,
        depreciationMethod: formData.depreciationMethod,
        totalNumberOfDepreciations: formData.totalNumberOfDepreciations,
        frequencyOfDepreciation: formData.frequencyOfDepreciation,
        accounts: {
          fixedAssetAccount: formData.fixedAssetAccount || undefined,
          accumulatedDepreciationAccount: formData.accumulatedDepreciationAccount || undefined,
          depreciationExpenseAccount: formData.depreciationExpenseAccount || undefined,
        },
        // Additional fields that might be on the backend
        ...(formData.capitalWorkInProgressAccount && {
          capitalWorkInProgressAccount: formData.capitalWorkInProgressAccount,
        }),
        ...(formData.description && { description: formData.description }),
        isGroup: formData.isGroup,
        isActive: formData.isActive,
      }

      await createCategoryMutation.mutateAsync(categoryData as any)
      navigate({ to: ROUTES.dashboard.assets.categories.list })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof CreateCategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Filter out the current category and its children to prevent circular references
  const availableParentCategories = categoriesData?.filter((cat: any) => !cat.isGroup || cat._id !== formData.parentCategory) || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('assets.badge', 'إدارة الأصول')}
          title={t('assets.createCategory', 'إنشاء فئة أصول جديدة')}
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
                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                    {t('assets.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('assets.categoryNameEn', 'اسم الفئة (إنجليزي)')} *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Category Name"
                        className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">
                        {t('assets.categoryNameAr', 'اسم الفئة (عربي)')}
                      </Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                        placeholder="اسم الفئة"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentCategory">
                      {t('assets.parentCategory', 'الفئة الأم')}
                    </Label>
                    <Select
                      value={formData.parentCategory}
                      onValueChange={(v) => handleChange('parentCategory', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('assets.selectParentCategory', 'اختر الفئة الأم (اختياري)')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {t('assets.noParent', 'لا يوجد - فئة رئيسية')}
                        </SelectItem>
                        {availableParentCategories.map((category: any) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.nameAr || category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {t('assets.parentCategoryHint', 'لتنظيم الفئات في شجرة هرمية')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('assets.description', 'الوصف')}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('assets.categoryDescriptionPlaceholder', 'وصف الفئة...')}
                      className="rounded-xl min-h-20"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="isGroup" className="cursor-pointer">
                          {t('assets.isGroup', 'فئة مجموعة')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('assets.isGroupHint', 'هل هذه فئة تحتوي على فئات فرعية؟')}
                        </p>
                      </div>
                      <Switch
                        id="isGroup"
                        checked={formData.isGroup}
                        onCheckedChange={(v) => handleChange('isGroup', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/50">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="cursor-pointer">
                          {t('assets.isActive', 'نشط')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('assets.isActiveHint', 'هل يمكن استخدام هذه الفئة؟')}
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(v) => handleChange('isActive', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Depreciation Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    {t('assets.depreciationSettings', 'إعدادات الإهلاك')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {t('assets.depreciationSettingsNote', 'ستُطبق هذه الإعدادات افتراضيًا على جميع الأصول في هذه الفئة')}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="depreciationMethod">
                      {t('assets.depreciationMethod', 'طريقة الإهلاك')} *
                    </Label>
                    <Select
                      value={formData.depreciationMethod}
                      onValueChange={(v) => handleChange('depreciationMethod', v as DepreciationMethod)}
                    >
                      <SelectTrigger className={`rounded-xl ${errors.depreciationMethod ? 'border-red-500' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPRECIATION_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label} ({method.labelEn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.depreciationMethod && (
                      <p className="text-sm text-red-500">{errors.depreciationMethod}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalNumberOfDepreciations">
                        {t('assets.usefulLife', 'العمر الإنتاجي (سنوات)')} *
                      </Label>
                      <Input
                        id="totalNumberOfDepreciations"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.totalNumberOfDepreciations}
                        onChange={(e) => handleChange('totalNumberOfDepreciations', parseInt(e.target.value) || 1)}
                        className={`rounded-xl ${errors.totalNumberOfDepreciations ? 'border-red-500' : ''}`}
                      />
                      {errors.totalNumberOfDepreciations && (
                        <p className="text-sm text-red-500">{errors.totalNumberOfDepreciations}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('assets.usefulLifeHint', 'عدد السنوات المتوقعة لاستخدام الأصل')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequencyOfDepreciation">
                        {t('assets.depreciationFrequency', 'تكرار الإهلاك')} *
                      </Label>
                      <Select
                        value={formData.frequencyOfDepreciation.toString()}
                        onValueChange={(v) => handleChange('frequencyOfDepreciation', parseInt(v))}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.frequencyOfDepreciation ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPRECIATION_FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label} ({option.labelEn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.frequencyOfDepreciation && (
                        <p className="text-sm text-red-500">{errors.frequencyOfDepreciation}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('assets.frequencyHint', 'كم مرة في السنة يتم احتساب الإهلاك')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">
                          {t('assets.depreciationCalculation', 'حساب الإهلاك')}
                        </p>
                        <p className="text-xs text-blue-700">
                          {t('assets.depreciationExample', `مثال: أصل بقيمة ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(100000)} مع عمر إنتاجي ${formData.totalNumberOfDepreciations} سنوات`)}
                        </p>
                        <p className="text-xs text-blue-700">
                          {formData.depreciationMethod === 'straight_line' &&
                            `${t('assets.straightLineExample', 'إهلاك سنوي')}: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(100000 / formData.totalNumberOfDepreciations)}`
                          }
                          {formData.depreciationMethod === 'double_declining_balance' &&
                            `${t('assets.doubleDecliningExample', 'إهلاك السنة الأولى')}: ${new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format((100000 * 2) / formData.totalNumberOfDepreciations)}`
                          }
                          {formData.depreciationMethod === 'written_down_value' &&
                            `${t('assets.writtenDownExample', 'إهلاك متناقص بناءً على القيمة الدفترية')}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('assets.accountSettings', 'إعدادات الحسابات')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="rounded-xl">
                    <Building2 className="w-4 h-4" />
                    <AlertDescription>
                      {t('assets.accountSettingsNote', 'ربط الفئة بحسابات دليل الحسابات للقيود المحاسبية التلقائية')}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="fixedAssetAccount">
                      {t('assets.assetAccount', 'حساب الأصل الثابت')}
                    </Label>
                    <Input
                      id="fixedAssetAccount"
                      value={formData.fixedAssetAccount}
                      onChange={(e) => handleChange('fixedAssetAccount', e.target.value)}
                      placeholder={t('assets.assetAccountPlaceholder', 'مثال: 1510 - أصول ثابتة')}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.assetAccountHint', 'الحساب الذي يظهر به الأصل في الميزانية العمومية')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accumulatedDepreciationAccount">
                      {t('assets.accumulatedDepreciationAccount', 'حساب الإهلاك المتراكم')}
                    </Label>
                    <Input
                      id="accumulatedDepreciationAccount"
                      value={formData.accumulatedDepreciationAccount}
                      onChange={(e) => handleChange('accumulatedDepreciationAccount', e.target.value)}
                      placeholder={t('assets.accumulatedDepreciationPlaceholder', 'مثال: 1519 - إهلاك متراكم')}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.accumulatedDepreciationHint', 'حساب مجمع الإهلاك المقابل للأصل')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depreciationExpenseAccount">
                      {t('assets.depreciationExpenseAccount', 'حساب مصروف الإهلاك')}
                    </Label>
                    <Input
                      id="depreciationExpenseAccount"
                      value={formData.depreciationExpenseAccount}
                      onChange={(e) => handleChange('depreciationExpenseAccount', e.target.value)}
                      placeholder={t('assets.depreciationExpensePlaceholder', 'مثال: 5210 - مصروف إهلاك')}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.depreciationExpenseHint', 'حساب المصروف في قائمة الدخل')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capitalWorkInProgressAccount">
                      {t('assets.capitalWorkInProgressAccount', 'حساب الأصول تحت التنفيذ')}
                    </Label>
                    <Input
                      id="capitalWorkInProgressAccount"
                      value={formData.capitalWorkInProgressAccount}
                      onChange={(e) => handleChange('capitalWorkInProgressAccount', e.target.value)}
                      placeholder={t('assets.capitalWorkInProgressPlaceholder', 'مثال: 1520 - مشاريع تحت التنفيذ')}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.capitalWorkInProgressHint', 'للأصول التي لم تبدأ في الإهلاك بعد')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="rounded-3xl border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                    <FolderTree className="w-5 h-5" />
                    {t('assets.categoryHierarchy', 'التسلسل الهرمي للفئات')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-amber-800">
                    {t('assets.categoryHierarchyExplanation', 'يمكنك تنظيم فئات الأصول في شجرة هرمية لتسهيل الإدارة:')}
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 mr-4">
                    <li>• {t('assets.hierarchyExample1', 'مثال: مركبات → سيارات → سيارات الأجرة')}</li>
                    <li>• {t('assets.hierarchyExample2', 'أو: معدات → حواسيب → أجهزة محمولة')}</li>
                    <li>• {t('assets.hierarchyExample3', 'الفئات المجموعة لا يمكن تخصيصها مباشرة للأصول')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: ROUTES.dashboard.assets.categories.list })}
                  className="rounded-xl order-2 sm:order-1"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 order-1 sm:order-2"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createCategoryMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
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
