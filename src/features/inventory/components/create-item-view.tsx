/**
 * Create Item View
 * Form for creating new inventory items
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Save,
  X,
  Upload,
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

import { useCreateItem, useItemGroups, useUnitsOfMeasure } from '@/hooks/use-inventory'
import type { CreateItemData, ItemType, ItemStatus, ValuationMethod } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: '/dashboard/inventory' },
  { title: 'inventory.createItem', href: '/dashboard/inventory/create' },
]

export function CreateItemView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createItemMutation = useCreateItem()
  const { data: itemGroups } = useItemGroups()
  const { data: uoms } = useUnitsOfMeasure()

  // Form state
  const [formData, setFormData] = useState<CreateItemData>({
    itemCode: '',
    name: '',
    nameAr: '',
    description: '',
    itemType: 'product',
    itemGroup: '',
    sku: '',
    barcode: '',
    stockUom: 'Unit',
    standardRate: 0,
    currency: 'SAR',
    taxRate: 15,
    isStockItem: true,
    hasBatchNo: false,
    hasSerialNo: false,
    valuationMethod: 'fifo',
    safetyStock: 0,
    reorderLevel: 0,
    reorderQty: 0,
    status: 'active',
    tags: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemCode.trim()) {
      newErrors.itemCode = t('inventory.validation.itemCodeRequired', 'رمز الصنف مطلوب')
    }
    if (!formData.name.trim()) {
      newErrors.name = t('inventory.validation.nameRequired', 'اسم الصنف مطلوب')
    }
    if (!formData.stockUom) {
      newErrors.stockUom = t('inventory.validation.uomRequired', 'وحدة القياس مطلوبة')
    }
    if (formData.standardRate < 0) {
      newErrors.standardRate = t('inventory.validation.pricePositive', 'السعر يجب أن يكون موجبًا')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await createItemMutation.mutateAsync(formData)
      navigate({ to: '/dashboard/inventory' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof CreateItemData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={t('inventory.createItem', 'إنشاء صنف جديد')}
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
                    <Package className="w-5 h-5 text-emerald-600" />
                    {t('inventory.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemCode">{t('inventory.itemCode', 'رمز الصنف')} *</Label>
                      <Input
                        id="itemCode"
                        value={formData.itemCode}
                        onChange={(e) => handleChange('itemCode', e.target.value)}
                        placeholder="ITM-00001"
                        className={`rounded-xl ${errors.itemCode ? 'border-red-500' : ''}`}
                      />
                      {errors.itemCode && (
                        <p className="text-sm text-red-500">{errors.itemCode}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemType">{t('inventory.itemType', 'نوع الصنف')}</Label>
                      <Select
                        value={formData.itemType}
                        onValueChange={(v) => handleChange('itemType', v as ItemType)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">{t('inventory.type.product', 'منتج')}</SelectItem>
                          <SelectItem value="service">{t('inventory.type.service', 'خدمة')}</SelectItem>
                          <SelectItem value="consumable">{t('inventory.type.consumable', 'مستهلك')}</SelectItem>
                          <SelectItem value="fixed_asset">{t('inventory.type.fixedAsset', 'أصل ثابت')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('inventory.nameEn', 'الاسم (إنجليزي)')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Item Name"
                        className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">{t('inventory.nameAr', 'الاسم (عربي)')}</Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                        placeholder="اسم الصنف"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('inventory.description', 'الوصف')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('inventory.descriptionPlaceholder', 'وصف الصنف...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemGroup">{t('inventory.itemGroup', 'مجموعة الأصناف')}</Label>
                      <Select
                        value={formData.itemGroup}
                        onValueChange={(v) => handleChange('itemGroup', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('inventory.selectGroup', 'اختر المجموعة')} />
                        </SelectTrigger>
                        <SelectContent>
                          {itemGroups?.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                              {group.nameAr || group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stockUom">{t('inventory.uom', 'وحدة القياس')} *</Label>
                      <Select
                        value={formData.stockUom}
                        onValueChange={(v) => handleChange('stockUom', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.stockUom ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('inventory.selectUom', 'اختر الوحدة')} />
                        </SelectTrigger>
                        <SelectContent>
                          {uoms?.map((uom) => (
                            <SelectItem key={uom._id} value={uom.name}>
                              {uom.nameAr || uom.name}
                            </SelectItem>
                          )) || (
                            <>
                              <SelectItem value="Unit">وحدة</SelectItem>
                              <SelectItem value="Kg">كيلوجرام</SelectItem>
                              <SelectItem value="Liter">لتر</SelectItem>
                              <SelectItem value="Meter">متر</SelectItem>
                              <SelectItem value="Box">صندوق</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.stockUom && (
                        <p className="text-sm text-red-500">{errors.stockUom}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">{t('inventory.sku', 'رمز SKU')}</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleChange('sku', e.target.value)}
                        placeholder="SKU-001"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">{t('inventory.barcode', 'الباركود')}</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => handleChange('barcode', e.target.value)}
                        placeholder="1234567890123"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('inventory.pricing', 'التسعير')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="standardRate">{t('inventory.standardRate', 'السعر القياسي')}</Label>
                      <Input
                        id="standardRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.standardRate}
                        onChange={(e) => handleChange('standardRate', parseFloat(e.target.value) || 0)}
                        className={`rounded-xl ${errors.standardRate ? 'border-red-500' : ''}`}
                      />
                      {errors.standardRate && (
                        <p className="text-sm text-red-500">{errors.standardRate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('inventory.currency', 'العملة')}</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">{t('inventory.taxRate', 'نسبة الضريبة %')}</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.taxRate}
                        onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('inventory.stockSettings', 'إعدادات المخزون')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <Label>{t('inventory.isStockItem', 'صنف مخزني')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('inventory.isStockItemDesc', 'تتبع المخزون لهذا الصنف')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isStockItem}
                        onCheckedChange={(v) => handleChange('isStockItem', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <Label>{t('inventory.hasBatchNo', 'رقم الدفعة')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('inventory.hasBatchNoDesc', 'تتبع الأصناف بأرقام الدفعات')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.hasBatchNo}
                        onCheckedChange={(v) => handleChange('hasBatchNo', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <Label>{t('inventory.hasSerialNo', 'رقم تسلسلي')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('inventory.hasSerialNoDesc', 'تتبع الأصناف بأرقام تسلسلية')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.hasSerialNo}
                        onCheckedChange={(v) => handleChange('hasSerialNo', v)}
                      />
                    </div>
                    <div className="space-y-2 p-4 rounded-xl bg-muted/50">
                      <Label>{t('inventory.valuationMethod', 'طريقة التقييم')}</Label>
                      <Select
                        value={formData.valuationMethod}
                        onValueChange={(v) => handleChange('valuationMethod', v as ValuationMethod)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fifo">FIFO - الوارد أولاً صادر أولاً</SelectItem>
                          <SelectItem value="moving_average">المتوسط المتحرك</SelectItem>
                          <SelectItem value="lifo">LIFO - الوارد أخيراً صادر أولاً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="safetyStock">{t('inventory.safetyStock', 'مخزون الأمان')}</Label>
                      <Input
                        id="safetyStock"
                        type="number"
                        min="0"
                        value={formData.safetyStock}
                        onChange={(e) => handleChange('safetyStock', parseInt(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">{t('inventory.reorderLevel', 'حد إعادة الطلب')}</Label>
                      <Input
                        id="reorderLevel"
                        type="number"
                        min="0"
                        value={formData.reorderLevel}
                        onChange={(e) => handleChange('reorderLevel', parseInt(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderQty">{t('inventory.reorderQty', 'كمية إعادة الطلب')}</Label>
                      <Input
                        id="reorderQty"
                        type="number"
                        min="0"
                        value={formData.reorderQty}
                        onChange={(e) => handleChange('reorderQty', parseInt(e.target.value) || 0)}
                        className="rounded-xl"
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
                  onClick={() => navigate({ to: '/dashboard/inventory' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createItemMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <InventorySidebar context="items" />
          </div>
        </form>
      </Main>
    </>
  )
}
