/**
 * Create Subcontracting Order View
 * Form for creating new subcontracting orders
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  Save,
  X,
  Plus,
  Trash2,
  Package,
  FileText,
  Building2,
  Calendar,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

import { useCreateSubcontractingOrder } from '@/hooks/use-subcontracting'
import { useSuppliers } from '@/hooks/use-buying'
import { useItems, useWarehouses } from '@/hooks/use-inventory'
import type { CreateSubcontractingOrderData, SubcontractingServiceItem, SubcontractingRawMaterial } from '@/types/subcontracting'
import { SubcontractingSidebar } from './subcontracting-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'subcontracting.subcontracting', href: ROUTES.dashboard.subcontracting.list },
  { title: 'subcontracting.createOrder', href: ROUTES.dashboard.subcontracting.create },
]

type ServiceItemRow = Omit<SubcontractingServiceItem, '_id'>
type RawMaterialRow = Omit<SubcontractingRawMaterial, '_id' | 'transferredQty' | 'consumedQty' | 'returnedQty'>

export function CreateSubcontractingOrderView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createOrderMutation = useCreateSubcontractingOrder()
  const { data: suppliersData } = useSuppliers()
  const { data: itemsData } = useItems()
  const { data: warehousesData } = useWarehouses()

  // Form state
  const [formData, setFormData] = useState<CreateSubcontractingOrderData>({
    supplierId: '',
    serviceItems: [],
    rawMaterials: [],
    finishedGoods: [],
    orderDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    supplierWarehouse: '',
    rawMaterialWarehouse: '',
    finishedGoodsWarehouse: '',
    currency: 'SAR',
    remarks: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Extract items and warehouses from data
  const items = itemsData?.items || itemsData?.data || []
  const suppliers = suppliersData?.suppliers || suppliersData?.data || []
  const warehouses = warehousesData?.warehouses || warehousesData?.data || []

  // Calculate totals
  const totalServiceCost = formData.serviceItems.reduce((sum, item) => sum + item.amount, 0)
  const totalMaterialCost = formData.rawMaterials.reduce((sum, item) => sum + item.amount, 0)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierId) {
      newErrors.supplierId = t('subcontracting.validation.supplierRequired', 'المورد مطلوب')
    }
    if (!formData.orderDate) {
      newErrors.orderDate = t('subcontracting.validation.orderDateRequired', 'تاريخ الطلب مطلوب')
    }
    if (formData.serviceItems.length === 0) {
      newErrors.serviceItems = t('subcontracting.validation.serviceItemsRequired', 'يجب إضافة خدمة واحدة على الأقل')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await createOrderMutation.mutateAsync(formData)
      navigate({ to: ROUTES.dashboard.subcontracting.list })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof CreateSubcontractingOrderData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Service Items handlers
  const addServiceItem = () => {
    const newItem: ServiceItemRow = {
      itemId: '',
      itemCode: '',
      itemName: '',
      description: '',
      qty: 1,
      uom: 'Unit',
      rate: 0,
      amount: 0,
    }
    setFormData((prev) => ({
      ...prev,
      serviceItems: [...prev.serviceItems, newItem],
    }))
  }

  const removeServiceItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.filter((_, i) => i !== index),
    }))
  }

  const handleServiceItemChange = (index: number, field: keyof ServiceItemRow, value: any) => {
    const newItems = [...formData.serviceItems]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-fill item details when item is selected
    if (field === 'itemId' && value) {
      const selectedItem = items.find((item: any) => item._id === value)
      if (selectedItem) {
        newItems[index].itemCode = selectedItem.itemCode || ''
        newItems[index].itemName = selectedItem.nameAr || selectedItem.name || ''
        newItems[index].uom = selectedItem.stockUom || 'Unit'
        newItems[index].rate = selectedItem.standardRate || 0
      }
    }

    // Auto-calculate amount
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = newItems[index].qty * newItems[index].rate
    }

    setFormData((prev) => ({ ...prev, serviceItems: newItems }))
  }

  // Raw Materials handlers
  const addRawMaterial = () => {
    const newMaterial: RawMaterialRow = {
      itemId: '',
      itemCode: '',
      itemName: '',
      requiredQty: 1,
      uom: 'Unit',
      rate: 0,
      amount: 0,
      sourceWarehouse: '',
    }
    setFormData((prev) => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, newMaterial],
    }))
  }

  const removeRawMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((_, i) => i !== index),
    }))
  }

  const handleRawMaterialChange = (index: number, field: keyof RawMaterialRow, value: any) => {
    const newMaterials = [...formData.rawMaterials]
    newMaterials[index] = { ...newMaterials[index], [field]: value }

    // Auto-fill item details when item is selected
    if (field === 'itemId' && value) {
      const selectedItem = items.find((item: any) => item._id === value)
      if (selectedItem) {
        newMaterials[index].itemCode = selectedItem.itemCode || ''
        newMaterials[index].itemName = selectedItem.nameAr || selectedItem.name || ''
        newMaterials[index].uom = selectedItem.stockUom || 'Unit'
        newMaterials[index].rate = selectedItem.standardRate || 0
      }
    }

    // Auto-calculate amount
    if (field === 'requiredQty' || field === 'rate') {
      newMaterials[index].amount = newMaterials[index].requiredQty * newMaterials[index].rate
    }

    setFormData((prev) => ({ ...prev, rawMaterials: newMaterials }))
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge={t('subcontracting.badge', 'التصنيع الخارجي')}
          title={t('subcontracting.createOrder', 'إنشاء أمر تصنيع خارجي')}
          type="subcontracting"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('subcontracting.basicInfo', 'المعلومات الأساسية')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="supplierId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.supplier', 'المورد (المصنع الخارجي)')} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(v) => handleChange('supplierId', v)}
                      >
                        <SelectTrigger className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.supplierId ? 'border-red-500' : ''
                        }`}>
                          <SelectValue placeholder={t('subcontracting.selectSupplier', 'اختر المورد')} />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier: any) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.nameAr || supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.supplierId && (
                        <p className="text-sm text-red-500">{errors.supplierId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.orderDate', 'تاريخ الطلب')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => handleChange('orderDate', e.target.value)}
                        className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.orderDate ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.orderDate && (
                        <p className="text-sm text-red-500">{errors.orderDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requiredDate" className="text-sm font-medium text-slate-700">
                        {t('subcontracting.requiredDate', 'تاريخ التسليم المطلوب')}
                      </Label>
                      <Input
                        id="requiredDate"
                        type="date"
                        value={formData.requiredDate}
                        onChange={(e) => handleChange('requiredDate', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                        {t('subcontracting.currency', 'العملة')}
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => handleChange('currency', v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">{t('subcontracting.currencySAR', 'ريال سعودي (SAR)')}</SelectItem>
                          <SelectItem value="USD">{t('subcontracting.currencyUSD', 'دولار أمريكي (USD)')}</SelectItem>
                          <SelectItem value="EUR">{t('subcontracting.currencyEUR', 'يورو (EUR)')}</SelectItem>
                          <SelectItem value="AED">{t('subcontracting.currencyAED', 'درهم إماراتي (AED)')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Service Items */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      {t('subcontracting.serviceItems', 'الخدمات / العمليات')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addServiceItem}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('subcontracting.addService', 'إضافة خدمة')}
                    </Button>
                  </h3>

                  {errors.serviceItems && (
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertDescription>{errors.serviceItems}</AlertDescription>
                    </Alert>
                  )}

                  {formData.serviceItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">{t('subcontracting.service', 'الخدمة')}</TableHead>
                            <TableHead className="min-w-[150px]">{t('subcontracting.description', 'الوصف')}</TableHead>
                            <TableHead className="w-[100px]">{t('subcontracting.quantity', 'الكمية')}</TableHead>
                            <TableHead className="w-[80px]">{t('subcontracting.uom', 'الوحدة')}</TableHead>
                            <TableHead className="w-[120px]">{t('subcontracting.rate', 'السعر')}</TableHead>
                            <TableHead className="w-[120px]">{t('subcontracting.amount', 'المبلغ')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.serviceItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select
                                  value={item.itemId}
                                  onValueChange={(v) => handleServiceItemChange(index, 'itemId', v)}
                                >
                                  <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder={t('subcontracting.selectItem', 'اختر الصنف')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items.map((itm: any) => (
                                      <SelectItem key={itm._id} value={itm._id}>
                                        {itm.itemCode} - {itm.nameAr || itm.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.description || ''}
                                  onChange={(e) => handleServiceItemChange(index, 'description', e.target.value)}
                                  placeholder={t('subcontracting.descriptionPlaceholder', 'وصف الخدمة')}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0.001"
                                  step="0.001"
                                  value={item.qty}
                                  onChange={(e) => handleServiceItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.uom}
                                  onChange={(e) => handleServiceItemChange(index, 'uom', e.target.value)}
                                  className="rounded-lg"
                                  readOnly
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => handleServiceItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.amount.toFixed(2)}
                                  className="rounded-lg bg-slate-50"
                                  readOnly
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeServiceItem(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('subcontracting.noServices', 'لا توجد خدمات بعد')}</p>
                      <p className="text-sm">
                        {t('subcontracting.addServiceHint', 'اضغط "إضافة خدمة" لإضافة خدمة جديدة')}
                      </p>
                    </div>
                  )}

                  {/* Service Total */}
                  {formData.serviceItems.length > 0 && (
                    <div className="flex justify-end">
                      <div className="bg-emerald-50 rounded-xl p-4 min-w-[300px]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-emerald-900">
                            {t('subcontracting.totalServiceCost', 'إجمالي تكلفة الخدمات')}:
                          </span>
                          <span className="text-lg font-bold text-emerald-600">
                            {totalServiceCost.toFixed(2)} {formData.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Raw Materials to Provide */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      {t('subcontracting.rawMaterials', 'المواد الخام المقدمة للمورد')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRawMaterial}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('subcontracting.addMaterial', 'إضافة مادة')}
                    </Button>
                  </h3>

                  {formData.rawMaterials.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">{t('subcontracting.item', 'الصنف')}</TableHead>
                            <TableHead className="w-[100px]">{t('subcontracting.quantity', 'الكمية')}</TableHead>
                            <TableHead className="w-[80px]">{t('subcontracting.uom', 'الوحدة')}</TableHead>
                            <TableHead className="min-w-[150px]">{t('subcontracting.sourceWarehouse', 'المستودع')}</TableHead>
                            <TableHead className="w-[120px]">{t('subcontracting.rate', 'السعر')}</TableHead>
                            <TableHead className="w-[120px]">{t('subcontracting.amount', 'المبلغ')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.rawMaterials.map((material, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select
                                  value={material.itemId}
                                  onValueChange={(v) => handleRawMaterialChange(index, 'itemId', v)}
                                >
                                  <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder={t('subcontracting.selectItem', 'اختر الصنف')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items.map((itm: any) => (
                                      <SelectItem key={itm._id} value={itm._id}>
                                        {itm.itemCode} - {itm.nameAr || itm.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0.001"
                                  step="0.001"
                                  value={material.requiredQty}
                                  onChange={(e) => handleRawMaterialChange(index, 'requiredQty', parseFloat(e.target.value) || 0)}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={material.uom}
                                  onChange={(e) => handleRawMaterialChange(index, 'uom', e.target.value)}
                                  className="rounded-lg"
                                  readOnly
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={material.sourceWarehouse || ''}
                                  onValueChange={(v) => handleRawMaterialChange(index, 'sourceWarehouse', v)}
                                >
                                  <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder={t('subcontracting.selectWarehouse', 'اختر المستودع')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {warehouses.map((wh: any) => (
                                      <SelectItem key={wh._id} value={wh._id}>
                                        {wh.nameAr || wh.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={material.rate}
                                  onChange={(e) => handleRawMaterialChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={material.amount.toFixed(2)}
                                  className="rounded-lg bg-slate-50"
                                  readOnly
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRawMaterial(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('subcontracting.noMaterials', 'لا توجد مواد خام بعد')}</p>
                      <p className="text-sm">
                        {t('subcontracting.addMaterialHint', 'اضغط "إضافة مادة" لإضافة مادة خام جديدة')}
                      </p>
                    </div>
                  )}

                  {/* Material Total */}
                  {formData.rawMaterials.length > 0 && (
                    <div className="flex justify-end">
                      <div className="bg-blue-50 rounded-xl p-4 min-w-[300px]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-900">
                            {t('subcontracting.totalMaterialCost', 'إجمالي تكلفة المواد')}:
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {totalMaterialCost.toFixed(2)} {formData.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Notes */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('subcontracting.termsAndNotes', 'الشروط والملاحظات')}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">{t('subcontracting.remarks', 'ملاحظات')}</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      placeholder={t('subcontracting.remarksPlaceholder', 'أي ملاحظات أو شروط إضافية...')}
                      className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Summary */}
                {(formData.serviceItems.length > 0 || formData.rawMaterials.length > 0) && (
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 space-y-3">
                    <h4 className="text-lg font-bold text-navy mb-4">
                      {t('subcontracting.orderSummary', 'ملخص الطلب')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-sm font-medium text-slate-700">
                          {t('subcontracting.totalServiceCost', 'إجمالي تكلفة الخدمات')}:
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          {totalServiceCost.toFixed(2)} {formData.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-sm font-medium text-slate-700">
                          {t('subcontracting.totalMaterialCost', 'إجمالي تكلفة المواد')}:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {totalMaterialCost.toFixed(2)} {formData.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-500 hover:text-navy rounded-xl"
                    onClick={() => navigate({ to: ROUTES.dashboard.subcontracting.list })}
                  >
                    <X className="w-4 h-4 ml-2" />
                    {t('common.cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        {t('common.saving', 'جاري الحفظ...')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" aria-hidden="true" />
                        {t('subcontracting.saveOrder', 'حفظ الطلب')}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <SubcontractingSidebar />
        </div>
      </Main>
    </>
  )
}
