/**
 * Create Asset View
 * Form for creating new assets
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Save,
  X,
  Upload,
  AlertCircle,
  TrendingDown,
  ShieldCheck,
  DollarSign,
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

import { useCreateAsset, useAssetCategories } from '@/hooks/use-assets'
import { useSuppliers } from '@/hooks/use-buying'
import { useStaff } from '@/hooks/useStaff'
import { useItems } from '@/hooks/use-inventory'
import type { CreateAssetData, DepreciationMethod } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'assets.assets', href: '/dashboard/assets' },
  { title: 'assets.createAsset', href: '/dashboard/assets/create' },
]

const DEPRECIATION_METHODS: { value: DepreciationMethod; label: string; labelEn: string }[] = [
  { value: 'straight_line', label: 'القسط الثابت', labelEn: 'Straight Line' },
  { value: 'double_declining_balance', label: 'الرصيد المتناقص المزدوج', labelEn: 'Double Declining Balance' },
  { value: 'written_down_value', label: 'القيمة المخفضة', labelEn: 'Written Down Value' },
]

export function CreateAssetView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createAssetMutation = useCreateAsset()
  const { data: assetCategories } = useAssetCategories()
  const { data: suppliersData } = useSuppliers()
  const { data: staffData } = useStaff()
  const { data: itemsData } = useItems()

  // Form state
  const [formData, setFormData] = useState<CreateAssetData>({
    assetName: '',
    assetNameAr: '',
    assetCategory: '',
    itemId: '',
    location: '',
    custodian: '',
    department: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    grossPurchaseAmount: 0,
    currency: 'SAR',
    assetQuantity: 1,
    depreciationMethod: 'straight_line',
    totalNumberOfDepreciations: 5,
    frequencyOfDepreciation: 12,
    depreciationStartDate: new Date().toISOString().split('T')[0],
    serialNo: '',
    warrantyExpiryDate: '',
    description: '',
    image: '',
    tags: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warrantyProvider, setWarrantyProvider] = useState('')
  const [residualValue, setResidualValue] = useState(0)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.assetName.trim()) {
      newErrors.assetName = t('assets.validation.nameRequired', 'اسم الأصل مطلوب')
    }
    if (formData.grossPurchaseAmount <= 0) {
      newErrors.grossPurchaseAmount = t('assets.validation.pricePositive', 'سعر الشراء يجب أن يكون موجبًا')
    }
    if (!formData.depreciationMethod) {
      newErrors.depreciationMethod = t('assets.validation.methodRequired', 'طريقة الإهلاك مطلوبة')
    }
    if (formData.totalNumberOfDepreciations && formData.totalNumberOfDepreciations < 1) {
      newErrors.totalNumberOfDepreciations = t('assets.validation.usefulLifePositive', 'العمر الإنتاجي يجب أن يكون موجبًا')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await createAssetMutation.mutateAsync(formData)
      navigate({ to: '/dashboard/assets' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof CreateAssetData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const suppliers = suppliersData?.suppliers || suppliersData?.data || []
  const items = itemsData?.items || itemsData?.data || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('assets.badge', 'إدارة الأصول')}
          title={t('assets.createAsset', 'إنشاء أصل جديد')}
          type="assets"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    {t('assets.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetName">{t('assets.assetNameEn', 'اسم الأصل (إنجليزي)')} *</Label>
                      <Input
                        id="assetName"
                        value={formData.assetName}
                        onChange={(e) => handleChange('assetName', e.target.value)}
                        placeholder="Asset Name"
                        className={`rounded-xl ${errors.assetName ? 'border-red-500' : ''}`}
                      />
                      {errors.assetName && (
                        <p className="text-sm text-red-500">{errors.assetName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetNameAr">{t('assets.assetNameAr', 'اسم الأصل (عربي)')}</Label>
                      <Input
                        id="assetNameAr"
                        value={formData.assetNameAr}
                        onChange={(e) => handleChange('assetNameAr', e.target.value)}
                        placeholder="اسم الأصل"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetCategory">{t('assets.category', 'الفئة')}</Label>
                      <Select
                        value={formData.assetCategory}
                        onValueChange={(v) => handleChange('assetCategory', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('assets.selectCategory', 'اختر الفئة')} />
                        </SelectTrigger>
                        <SelectContent>
                          {assetCategories?.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.nameAr || category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemId">{t('assets.itemCode', 'رمز الصنف (اختياري)')}</Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(v) => handleChange('itemId', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('assets.selectItem', 'ربط بصنف')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t('assets.noItem', 'بدون صنف')}
                          </SelectItem>
                          {items.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.itemCode} - {item.nameAr || item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serialNo">{t('assets.serialNumber', 'الرقم التسلسلي')}</Label>
                      <Input
                        id="serialNo"
                        value={formData.serialNo}
                        onChange={(e) => handleChange('serialNo', e.target.value)}
                        placeholder="SN-001234"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assetQuantity">{t('assets.quantity', 'الكمية')}</Label>
                      <Input
                        id="assetQuantity"
                        type="number"
                        min="1"
                        value={formData.assetQuantity}
                        onChange={(e) => handleChange('assetQuantity', parseInt(e.target.value) || 1)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('assets.description', 'الوصف')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('assets.descriptionPlaceholder', 'وصف الأصل...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location & Assignment */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    {t('assets.locationAssignment', 'الموقع والتخصيص')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">{t('assets.location', 'الموقع')}</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder={t('assets.locationPlaceholder', 'المبنى - الدور - المكتب')}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">{t('assets.department', 'القسم')}</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        placeholder={t('assets.departmentPlaceholder', 'اسم القسم')}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custodian">{t('assets.custodian', 'المسؤول عن الأصل')}</Label>
                    <Select
                      value={formData.custodian}
                      onValueChange={(v) => handleChange('custodian', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('assets.selectCustodian', 'اختر الموظف')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {t('assets.noCustodian', 'بدون مسؤول')}
                        </SelectItem>
                        {staffData?.map((staff: any) => (
                          <SelectItem key={staff._id} value={staff._id}>
                            {staff.firstName} {staff.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('assets.purchaseInfo', 'معلومات الشراء')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchaseDate">{t('assets.purchaseDate', 'تاريخ الشراء')}</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => handleChange('purchaseDate', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierId">{t('assets.supplier', 'المورد')}</Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(v) => handleChange('supplierId', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('assets.selectSupplier', 'اختر المورد')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t('assets.noSupplier', 'بدون مورد')}
                          </SelectItem>
                          {suppliers.map((supplier: any) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.supplierName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grossPurchaseAmount">{t('assets.purchasePrice', 'سعر الشراء')} *</Label>
                      <Input
                        id="grossPurchaseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.grossPurchaseAmount}
                        onChange={(e) => handleChange('grossPurchaseAmount', parseFloat(e.target.value) || 0)}
                        className={`rounded-xl ${errors.grossPurchaseAmount ? 'border-red-500' : ''}`}
                      />
                      {errors.grossPurchaseAmount && (
                        <p className="text-sm text-red-500">{errors.grossPurchaseAmount}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('assets.currency', 'العملة')}</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => handleChange('currency', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                          <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                          <SelectItem value="EUR">يورو (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Depreciation */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    {t('assets.depreciation', 'الإهلاك')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="depreciationMethod">{t('assets.depreciationMethod', 'طريقة الإهلاك')} *</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="depreciationStartDate">{t('assets.depreciationStartDate', 'تاريخ بدء الإهلاك')}</Label>
                      <Input
                        id="depreciationStartDate"
                        type="date"
                        value={formData.depreciationStartDate}
                        onChange={(e) => handleChange('depreciationStartDate', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalNumberOfDepreciations">{t('assets.usefulLife', 'العمر الإنتاجي (سنوات)')}</Label>
                      <Input
                        id="totalNumberOfDepreciations"
                        type="number"
                        min="1"
                        value={formData.totalNumberOfDepreciations}
                        onChange={(e) => handleChange('totalNumberOfDepreciations', parseInt(e.target.value) || 1)}
                        className={`rounded-xl ${errors.totalNumberOfDepreciations ? 'border-red-500' : ''}`}
                      />
                      {errors.totalNumberOfDepreciations && (
                        <p className="text-sm text-red-500">{errors.totalNumberOfDepreciations}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequencyOfDepreciation">{t('assets.frequency', 'التكرار (شهور)')}</Label>
                      <Input
                        id="frequencyOfDepreciation"
                        type="number"
                        min="1"
                        value={formData.frequencyOfDepreciation}
                        onChange={(e) => handleChange('frequencyOfDepreciation', parseInt(e.target.value) || 12)}
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('assets.frequencyHint', '12 = سنوي، 6 = نصف سنوي، 3 = ربع سنوي')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="residualValue">{t('assets.residualValue', 'القيمة المتبقية')}</Label>
                      <Input
                        id="residualValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={residualValue}
                        onChange={(e) => setResidualValue(parseFloat(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <Alert className="rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {t('assets.depreciationNote', 'سيتم احتساب الإهلاك تلقائيًا بناءً على الطريقة والعمر الإنتاجي المحددين')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Warranty */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    {t('assets.warranty', 'الضمان')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warrantyExpiryDate">{t('assets.warrantyExpiry', 'تاريخ انتهاء الضمان')}</Label>
                      <Input
                        id="warrantyExpiryDate"
                        type="date"
                        value={formData.warrantyExpiryDate}
                        onChange={(e) => handleChange('warrantyExpiryDate', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warrantyProvider">{t('assets.warrantyProvider', 'مزود الضمان')}</Label>
                      <Input
                        id="warrantyProvider"
                        value={warrantyProvider}
                        onChange={(e) => setWarrantyProvider(e.target.value)}
                        placeholder={t('assets.warrantyProviderPlaceholder', 'اسم الشركة')}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    {t('assets.image', 'صورة الأصل')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{t('assets.clickToUpload', 'انقر للتحميل')}</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            // Handle file upload
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              handleChange('image', reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-4">
                      <img
                        src={formData.image}
                        alt="Asset preview"
                        className="w-32 h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('assets.notes', 'ملاحظات')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">{t('assets.tags', 'الوسوم')}</Label>
                    <Input
                      id="tags"
                      value={formData.tags?.join(', ')}
                      onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder={t('assets.tagsPlaceholder', 'أدخل الوسوم مفصولة بفواصل')}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/assets' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createAssetMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createAssetMutation.isPending
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
