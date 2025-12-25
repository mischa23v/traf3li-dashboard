/**
 * Create Warehouse View
 * Form for creating new warehouses
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Warehouse as WarehouseIcon,
  Save,
  X,
  MapPin,
  Building2,
  AlertCircle,
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

import { useCreateWarehouse, useWarehouses } from '@/hooks/use-inventory'
import type { CreateWarehouseData } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: '/dashboard/inventory' },
  { title: 'inventory.createWarehouse', href: '/dashboard/inventory/warehouses/create' },
]

type ExtendedWarehouseData = CreateWarehouseData & {
  latitude?: number
  longitude?: number
  defaultExpenseAccount?: string
  defaultIncomeAccount?: string
  disabled?: boolean
}

export function CreateWarehouseView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createWarehouseMutation = useCreateWarehouse()
  const { data: warehouses } = useWarehouses()

  // Form state
  const [formData, setFormData] = useState<ExtendedWarehouseData>({
    name: '',
    nameAr: '',
    warehouseType: 'warehouse',
    parentWarehouse: '',
    isGroup: false,
    address: '',
    city: '',
    region: '',
    country: 'Saudi Arabia',
    contactPerson: '',
    phone: '',
    email: '',
    latitude: undefined,
    longitude: undefined,
    defaultExpenseAccount: '',
    defaultIncomeAccount: '',
    isDefault: false,
    disabled: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('inventory.validation.warehouseNameRequired', 'اسم المستودع مطلوب')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('inventory.validation.invalidEmail', 'البريد الإلكتروني غير صحيح')
    }

    if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = t('inventory.validation.invalidLatitude', 'خط العرض يجب أن يكون بين -90 و 90')
    }

    if (formData.longitude !== undefined && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = t('inventory.validation.invalidLongitude', 'خط الطول يجب أن يكون بين -180 و 180')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Only send fields that exist in CreateWarehouseData type
      const { latitude, longitude, defaultExpenseAccount, defaultIncomeAccount, disabled, ...warehouseData } = formData

      await createWarehouseMutation.mutateAsync(warehouseData)
      navigate({ to: '/dashboard/inventory/warehouses' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof ExtendedWarehouseData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Get parent warehouse options (only group warehouses)
  const parentWarehouseOptions = warehouses?.filter((wh) => wh.isGroup) || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={t('inventory.createWarehouse', 'إنشاء مستودع جديد')}
          type="inventory"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WarehouseIcon className="w-5 h-5 text-emerald-600" />
                    {t('inventory.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('inventory.warehouseName', 'اسم المستودع (إنجليزي)')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Main Warehouse"
                        className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">{t('inventory.warehouseNameAr', 'اسم المستودع (عربي)')}</Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                        placeholder="المستودع الرئيسي"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouseType">{t('inventory.warehouseType', 'نوع المستودع')}</Label>
                      <Select
                        value={formData.warehouseType}
                        onValueChange={(v) => handleChange('warehouseType', v as 'warehouse' | 'store' | 'transit' | 'virtual')}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">{t('inventory.type.warehouse', 'مستودع')}</SelectItem>
                          <SelectItem value="store">{t('inventory.type.store', 'متجر')}</SelectItem>
                          <SelectItem value="transit">{t('inventory.type.transit', 'عبور')}</SelectItem>
                          <SelectItem value="virtual">{t('inventory.type.workInProgress', 'قيد التشغيل')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentWarehouse">{t('inventory.parentWarehouse', 'المستودع الرئيسي')}</Label>
                      <Select
                        value={formData.parentWarehouse}
                        onValueChange={(v) => handleChange('parentWarehouse', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('inventory.selectParentWarehouse', 'اختر المستودع الرئيسي')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('inventory.noParent', 'لا يوجد')}</SelectItem>
                          {parentWarehouseOptions.map((warehouse) => (
                            <SelectItem key={warehouse._id} value={warehouse._id}>
                              {warehouse.nameAr || warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t('inventory.parentWarehouseDesc', 'للتسلسل الهرمي للمستودعات')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <Label>{t('inventory.isGroup', 'مجموعة مستودعات')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('inventory.isGroupDesc', 'يمكن أن يحتوي على مستودعات فرعية')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.isGroup}
                      onCheckedChange={(v) => handleChange('isGroup', v)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location & Address */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    {t('inventory.location', 'الموقع والعنوان')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('inventory.address', 'العنوان')}</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder={t('inventory.addressPlaceholder', 'شارع، حي، مدينة...')}
                      className="rounded-xl min-h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('inventory.city', 'المدينة')}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder={t('inventory.cityPlaceholder', 'الرياض')}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">{t('inventory.region', 'المنطقة')}</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        placeholder={t('inventory.regionPlaceholder', 'منطقة الرياض')}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">{t('inventory.country', 'الدولة')}</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(v) => handleChange('country', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Saudi Arabia">المملكة العربية السعودية</SelectItem>
                        <SelectItem value="United Arab Emirates">الإمارات العربية المتحدة</SelectItem>
                        <SelectItem value="Kuwait">الكويت</SelectItem>
                        <SelectItem value="Bahrain">البحرين</SelectItem>
                        <SelectItem value="Qatar">قطر</SelectItem>
                        <SelectItem value="Oman">عُمان</SelectItem>
                        <SelectItem value="Egypt">مصر</SelectItem>
                        <SelectItem value="Jordan">الأردن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">{t('inventory.latitude', 'خط العرض')}</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={formData.latitude || ''}
                        onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="24.7136"
                        className={`rounded-xl ${errors.latitude ? 'border-red-500' : ''}`}
                      />
                      {errors.latitude && (
                        <p className="text-sm text-red-500">{errors.latitude}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">{t('inventory.longitude', 'خط الطول')}</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={formData.longitude || ''}
                        onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="46.6753"
                        className={`rounded-xl ${errors.longitude ? 'border-red-500' : ''}`}
                      />
                      {errors.longitude && (
                        <p className="text-sm text-red-500">{errors.longitude}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    {t('inventory.contactInfo', 'معلومات الاتصال')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">{t('inventory.contactPerson', 'جهة الاتصال')}</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      placeholder={t('inventory.contactPersonPlaceholder', 'اسم المسؤول')}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('inventory.phone', 'رقم الهاتف')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+966 50 000 0000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('inventory.email', 'البريد الإلكتروني')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="warehouse@example.com"
                        className={`rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accounting Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('inventory.accountingSettings', 'إعدادات المحاسبة')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="rounded-xl">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      {t('inventory.accountingNote', 'ملاحظة: إعدادات الحسابات المحاسبية ستكون متاحة في التحديثات القادمة')}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 opacity-50">
                      <Label htmlFor="defaultExpenseAccount">{t('inventory.defaultExpenseAccount', 'حساب المصروفات الافتراضي')}</Label>
                      <Input
                        id="defaultExpenseAccount"
                        value={formData.defaultExpenseAccount}
                        onChange={(e) => handleChange('defaultExpenseAccount', e.target.value)}
                        placeholder="5000 - مصروفات المستودع"
                        className="rounded-xl"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('inventory.expenseAccountDesc', 'قريبًا')}
                      </p>
                    </div>
                    <div className="space-y-2 opacity-50">
                      <Label htmlFor="defaultIncomeAccount">{t('inventory.defaultIncomeAccount', 'حساب الإيرادات الافتراضي')}</Label>
                      <Input
                        id="defaultIncomeAccount"
                        value={formData.defaultIncomeAccount}
                        onChange={(e) => handleChange('defaultIncomeAccount', e.target.value)}
                        placeholder="4000 - إيرادات المبيعات"
                        className="rounded-xl"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('inventory.incomeAccountDesc', 'قريبًا')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('inventory.statusSettings', 'إعدادات الحالة')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <Label>{t('inventory.isDefault', 'المستودع الافتراضي')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('inventory.isDefaultDesc', 'استخدام كمستودع افتراضي للمعاملات')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isDefault}
                        onCheckedChange={(v) => handleChange('isDefault', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <Label>{t('inventory.disabled', 'معطل')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('inventory.disabledDesc', 'تعطيل المستودع من الاستخدام')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.disabled}
                        onCheckedChange={(v) => handleChange('disabled', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/inventory/warehouses' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createWarehouseMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createWarehouseMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <InventorySidebar context="warehouses" />
          </div>
        </form>
      </Main>
    </>
  )
}
