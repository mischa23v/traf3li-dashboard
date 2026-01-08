/**
 * Create Purchase Order View
 * Form for creating new purchase orders in the Buying module
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Save,
  ShoppingCart,
  User,
  Calendar,
  FileText,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Warehouse,
  AlertCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useCreatePurchaseOrder, useSuppliers, useSupplier } from '@/hooks/use-buying'
import { useItems, useWarehouses } from '@/hooks/use-inventory'
import { BuyingSidebar } from './buying-sidebar'
import type { CreatePurchaseOrderData, PurchaseOrderItem } from '@/types/buying'

// Form item structure
interface POFormItem {
  itemId: string
  itemCode?: string
  itemName?: string
  description?: string
  qty: number
  uom: string
  rate: number
  amount: number
  discount?: number
  taxRate?: number
  taxAmount?: number
  netAmount: number
  warehouse?: string
  requiredDate?: string
}

export function CreatePurchaseOrderView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createPOMutation = useCreatePurchaseOrder()

  // Fetch data
  const { data: suppliersResponse } = useSuppliers({ status: 'active' })
  const { data: itemsResponse } = useItems()
  const { data: warehousesResponse } = useWarehouses()

  const suppliers = suppliersResponse?.suppliers || []
  const items = itemsResponse?.items || []
  const warehouses = warehousesResponse?.warehouses || []

  const [formData, setFormData] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    currency: 'SAR',
    taxTemplateId: '',
    paymentTerms: '',
    termsAndConditions: '',
    remarks: '',
  })

  const [poItems, setPoItems] = useState<POFormItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)

  // Totals state
  const [totals, setTotals] = useState({
    netTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
  })

  // Fetch selected supplier details
  const { data: supplierData } = useSupplier(formData.supplierId)

  // Auto-fill supplier details
  useEffect(() => {
    if (supplierData) {
      setSelectedSupplier(supplierData)
      setFormData((prev) => ({
        ...prev,
        currency: supplierData.currency || 'SAR',
        paymentTerms: supplierData.paymentTerms || '',
      }))
    }
  }, [supplierData])

  // Calculate totals when items change
  useEffect(() => {
    const netTotal = poItems.reduce((sum, item) => sum + item.amount, 0)
    const discountAmount = poItems.reduce((sum, item) => sum + (item.discount || 0), 0)
    const taxAmount = poItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
    const grandTotal = netTotal - discountAmount + taxAmount

    setTotals({
      netTotal,
      taxAmount,
      discountAmount,
      grandTotal,
    })
  }, [poItems])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplierId) {
      newErrors.supplierId = t('buying.validation.supplierRequired', 'المورد مطلوب')
    }

    if (!formData.orderDate) {
      newErrors.orderDate = t('buying.validation.orderDateRequired', 'تاريخ الطلب مطلوب')
    }

    if (poItems.length === 0) {
      newErrors.items = t('buying.validation.itemsRequired', 'يجب إضافة صنف واحد على الأقل')
    }

    // Validate each item
    poItems.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = t('buying.validation.itemRequired', 'الصنف مطلوب')
      }
      if (!item.qty || item.qty <= 0) {
        newErrors[`item_${index}_qty`] = t('buying.validation.qtyRequired', 'الكمية مطلوبة')
      }
      if (!item.rate || item.rate < 0) {
        newErrors[`item_${index}_rate`] = t('buying.validation.rateRequired', 'السعر مطلوب')
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddItem = () => {
    const newItem: POFormItem = {
      itemId: '',
      itemCode: '',
      itemName: '',
      description: '',
      qty: 1,
      uom: 'Nos',
      rate: 0,
      amount: 0,
      discount: 0,
      taxRate: 15,
      taxAmount: 0,
      netAmount: 0,
      warehouse: '',
      requiredDate: formData.requiredDate,
    }
    setPoItems((prev) => [...prev, newItem])
  }

  const handleRemoveItem = (index: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof POFormItem, value: any) => {
    setPoItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index] }

      // Update the field
      item[field] = value as never

      // If item is selected, auto-fill details
      if (field === 'itemId' && value) {
        const selectedItem = items.find((i) => i._id === value)
        if (selectedItem) {
          item.itemCode = selectedItem.itemCode
          item.itemName = selectedItem.name
          item.description = selectedItem.description || ''
          item.uom = selectedItem.stockUom
          item.rate = selectedItem.lastPurchaseRate || selectedItem.standardRate || 0
          item.taxRate = selectedItem.taxRate || 15
        }
      }

      // Recalculate amounts
      if (field === 'qty' || field === 'rate' || field === 'discount' || field === 'taxRate') {
        const qty = Number(item.qty) || 0
        const rate = Number(item.rate) || 0
        const discount = Number(item.discount) || 0
        const taxRate = Number(item.taxRate) || 0

        item.amount = qty * rate
        const amountAfterDiscount = item.amount - discount
        item.taxAmount = (amountAfterDiscount * taxRate) / 100
        item.netAmount = amountAfterDiscount + item.taxAmount
      }

      updated[index] = item
      return updated
    })

    // Clear error for this field
    const errorKey = `item_${index}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Prepare items for API
    const apiItems: Omit<PurchaseOrderItem, '_id' | 'receivedQty' | 'billedQty'>[] = poItems.map((item) => ({
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      description: item.description,
      qty: Number(item.qty),
      uom: item.uom,
      rate: Number(item.rate),
      amount: Number(item.amount),
      discount: Number(item.discount) || 0,
      taxRate: Number(item.taxRate) || 0,
      taxAmount: Number(item.taxAmount) || 0,
      netAmount: Number(item.netAmount),
      warehouse: item.warehouse,
      requiredDate: item.requiredDate,
    }))

    const poData: CreatePurchaseOrderData = {
      supplierId: formData.supplierId,
      items: apiItems,
      orderDate: formData.orderDate,
      requiredDate: formData.requiredDate || undefined,
      currency: formData.currency,
      taxTemplateId: formData.taxTemplateId || undefined,
      paymentTerms: formData.paymentTerms || undefined,
      termsAndConditions: formData.termsAndConditions || undefined,
      remarks: formData.remarks || undefined,
    }

    try {
      await createPOMutation.mutateAsync(poData)
      navigate({ to: '/dashboard/buying/purchase-orders' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const topNav = [
    { title: t('buying.overview', 'نظرة عامة'), href: '/dashboard/buying', isActive: false },
    { title: t('buying.purchaseOrders', 'أوامر الشراء'), href: '/dashboard/buying/purchase-orders', isActive: false },
    { title: t('buying.createPO', 'إنشاء أمر شراء'), href: '/dashboard/buying/purchase-orders/create', isActive: true },
  ]

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
        {/* HERO CARD - Full width */}
        <ProductivityHero
          badge={t('buying.badge', 'المشتريات')}
          title={t('buying.createPO', 'إنشاء أمر شراء')}
          type="buying"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.headerInfo', 'معلومات الطلب')}
                  </h3>

                  {errors.items && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.items}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="supplierId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.supplier', 'المورد')} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.supplierId}
                        onValueChange={(v) => handleInputChange('supplierId', v)}
                      >
                        <SelectTrigger className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.supplierId ? 'border-red-500' : ''
                        }`}>
                          <SelectValue placeholder={t('buying.selectSupplier', 'اختر المورد')} />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
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
                        {t('buying.orderDate', 'تاريخ الطلب')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => handleInputChange('orderDate', e.target.value)}
                        className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.orderDate ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.orderDate && (
                        <p className="text-sm text-red-500">{errors.orderDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requiredDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.requiredDate', 'تاريخ الاستلام المطلوب')}
                      </Label>
                      <Input
                        id="requiredDate"
                        type="date"
                        value={formData.requiredDate}
                        onChange={(e) => handleInputChange('requiredDate', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.currency', 'العملة')}
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => handleInputChange('currency', v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">{t('buying.currencySAR', 'ريال سعودي (SAR)')}</SelectItem>
                          <SelectItem value="USD">{t('buying.currencyUSD', 'دولار أمريكي (USD)')}</SelectItem>
                          <SelectItem value="EUR">{t('buying.currencyEUR', 'يورو (EUR)')}</SelectItem>
                          <SelectItem value="AED">{t('buying.currencyAED', 'درهم إماراتي (AED)')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Supplier Info Display */}
                  {selectedSupplier && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">{t('buying.email', 'البريد الإلكتروني')}</p>
                          <p className="font-medium text-navy">{selectedSupplier.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{t('buying.phone', 'رقم الهاتف')}</p>
                          <p className="font-medium text-navy">{selectedSupplier.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{t('buying.currency', 'العملة')}</p>
                          <p className="font-medium text-navy">{selectedSupplier.currency || 'SAR'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{t('buying.paymentTerms', 'شروط الدفع')}</p>
                          <p className="font-medium text-navy">{selectedSupplier.paymentTerms || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      {t('buying.items', 'الأصناف')}
                    </h3>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 me-2" aria-hidden="true" />
                      {t('buying.addItem', 'إضافة صنف')}
                    </Button>
                  </div>

                  {poItems.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="text-navy font-bold">{t('buying.item', 'الصنف')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.description', 'الوصف')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.qty', 'الكمية')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.uom', 'الوحدة')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.rate', 'السعر')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.amount', 'المبلغ')}</TableHead>
                              <TableHead className="text-navy font-bold">{t('buying.warehouse', 'المستودع')}</TableHead>
                              <TableHead className="text-navy font-bold w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {poItems.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="min-w-[200px]">
                                  <Select
                                    value={item.itemId}
                                    onValueChange={(v) => handleItemChange(index, 'itemId', v)}
                                  >
                                    <SelectTrigger className={`rounded-lg ${
                                      errors[`item_${index}_itemId`] ? 'border-red-500' : ''
                                    }`}>
                                      <SelectValue placeholder={t('buying.selectItem', 'اختر الصنف')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {items.map((itm) => (
                                        <SelectItem key={itm._id} value={itm._id}>
                                          {itm.name} ({itm.itemCode})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="min-w-[150px]">
                                  <Input
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    className="rounded-lg"
                                    placeholder={t('buying.itemDescription', 'الوصف')}
                                  />
                                </TableCell>
                                <TableCell className="min-w-[100px]">
                                  <Input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                                    className={`rounded-lg ${
                                      errors[`item_${index}_qty`] ? 'border-red-500' : ''
                                    }`}
                                    min="0.001"
                                    step="0.001"
                                  />
                                </TableCell>
                                <TableCell className="min-w-[80px]">
                                  <Input
                                    value={item.uom}
                                    onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                                    className="rounded-lg"
                                  />
                                </TableCell>
                                <TableCell className="min-w-[120px]">
                                  <Input
                                    type="number"
                                    value={item.rate}
                                    onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                                    className={`rounded-lg ${
                                      errors[`item_${index}_rate`] ? 'border-red-500' : ''
                                    }`}
                                    min="0"
                                    step="0.01"
                                  />
                                </TableCell>
                                <TableCell className="min-w-[120px]">
                                  <div className="font-medium text-navy">
                                    {item.amount.toFixed(2)}
                                  </div>
                                </TableCell>
                                <TableCell className="min-w-[150px]">
                                  <Select
                                    value={item.warehouse}
                                    onValueChange={(v) => handleItemChange(index, 'warehouse', v)}
                                  >
                                    <SelectTrigger className="rounded-lg">
                                      <SelectValue placeholder={t('buying.selectWarehouse', 'اختر المستودع')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {warehouses.map((wh) => (
                                        <SelectItem key={wh._id} value={wh._id}>
                                          {wh.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                      <p className="text-slate-500 mb-4">{t('buying.noItemsAdded', 'لم يتم إضافة أصناف بعد')}</p>
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <Plus className="w-4 h-4 me-2" aria-hidden="true" />
                        {t('buying.addFirstItem', 'إضافة أول صنف')}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals Section */}
                {poItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      {t('buying.totals', 'الإجماليات')}
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">{t('buying.netTotal', 'الإجمالي الصافي')}</span>
                          <span className="text-lg font-semibold text-navy">
                            {totals.netTotal.toFixed(2)} {formData.currency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">{t('buying.taxAmount', 'مبلغ الضريبة')}</span>
                          <span className="text-lg font-semibold text-navy">
                            {totals.taxAmount.toFixed(2)} {formData.currency}
                          </span>
                        </div>
                        {totals.discountAmount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">{t('buying.discount', 'الخصم')}</span>
                            <span className="text-lg font-semibold text-red-600">
                              -{totals.discountAmount.toFixed(2)} {formData.currency}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-slate-300 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-navy font-bold text-lg">{t('buying.grandTotal', 'الإجمالي النهائي')}</span>
                            <span className="text-2xl font-bold text-emerald-600">
                              {totals.grandTotal.toFixed(2)} {formData.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.additionalInfo', 'معلومات إضافية')}
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms" className="text-sm font-medium text-slate-700">
                        {t('buying.paymentTerms', 'شروط الدفع')}
                      </Label>
                      <Input
                        id="paymentTerms"
                        placeholder={t('buying.paymentTermsPlaceholder', 'مثال: 30 يوم من تاريخ الفاتورة')}
                        value={formData.paymentTerms}
                        onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="termsAndConditions" className="text-sm font-medium text-slate-700">
                        {t('buying.termsAndConditions', 'الشروط والأحكام')}
                      </Label>
                      <Textarea
                        id="termsAndConditions"
                        placeholder={t('buying.termsPlaceholder', 'أدخل الشروط والأحكام...')}
                        value={formData.termsAndConditions}
                        onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                        className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="remarks" className="text-sm font-medium text-slate-700">
                        {t('buying.remarks', 'ملاحظات')}
                      </Label>
                      <Textarea
                        id="remarks"
                        placeholder={t('buying.remarksPlaceholder', 'أي ملاحظات إضافية...')}
                        value={formData.remarks}
                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                        className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-500 hover:text-navy rounded-xl"
                    onClick={() => navigate({ to: '/dashboard/buying/purchase-orders' })}
                  >
                    {t('common.cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={createPOMutation.isPending}
                  >
                    {createPOMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        {t('common.saving', 'جاري الحفظ...')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" aria-hidden="true" />
                        {t('buying.savePO', 'حفظ أمر الشراء')}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <BuyingSidebar />
        </div>
      </Main>
    </>
  )
}
