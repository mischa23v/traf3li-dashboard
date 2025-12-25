/**
 * Create Stock Entry View
 * Form for creating new stock entries (Receipt, Issue, Transfer, etc.)
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Clock,
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  useCreateStockEntry,
  useItems,
  useWarehouses,
  useUnitsOfMeasure,
} from '@/hooks/use-inventory'
import type {
  CreateStockEntryData,
  StockEntryType,
  StockEntryItem,
} from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: '/dashboard/inventory' },
  { title: 'inventory.stockEntries', href: '/dashboard/inventory/stock-entries' },
  { title: 'inventory.createStockEntry', href: '/dashboard/inventory/stock-entries/create' },
]

interface StockEntryItemRow extends Omit<StockEntryItem, '_id'> {
  id: string
  itemCode?: string
  itemName?: string
}

export function CreateStockEntryView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createStockEntryMutation = useCreateStockEntry()
  const { data: items } = useItems()
  const { data: warehouses } = useWarehouses()
  const { data: uoms } = useUnitsOfMeasure()

  // Get current date and time
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5)

  // Form state
  const [formData, setFormData] = useState<
    Omit<CreateStockEntryData, 'items'> & { items: StockEntryItemRow[] }
  >({
    entryType: 'receipt',
    postingDate: currentDate,
    postingTime: currentTime,
    fromWarehouse: '',
    toWarehouse: '',
    items: [],
    remarks: '',
    referenceType: '',
    referenceId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update warehouse requirements when entry type changes
  useEffect(() => {
    const { entryType } = formData

    // Clear warehouses when type changes
    if (entryType === 'receipt') {
      setFormData((prev) => ({ ...prev, fromWarehouse: '' }))
    } else if (entryType === 'issue') {
      setFormData((prev) => ({ ...prev, toWarehouse: '' }))
    }
  }, [formData.entryType])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.entryType) {
      newErrors.entryType = t('inventory.validation.entryTypeRequired', 'نوع الحركة مطلوب')
    }

    if (!formData.postingDate) {
      newErrors.postingDate = t('inventory.validation.postingDateRequired', 'تاريخ الترحيل مطلوب')
    }

    // Warehouse validation based on entry type
    if (
      ['issue', 'transfer', 'material_consumption'].includes(formData.entryType) &&
      !formData.fromWarehouse
    ) {
      newErrors.fromWarehouse = t('inventory.validation.fromWarehouseRequired', 'المستودع المصدر مطلوب')
    }

    if (
      ['receipt', 'transfer', 'manufacture', 'repack'].includes(formData.entryType) &&
      !formData.toWarehouse
    ) {
      newErrors.toWarehouse = t('inventory.validation.toWarehouseRequired', 'المستودع الهدف مطلوب')
    }

    if (formData.entryType === 'transfer' && formData.fromWarehouse === formData.toWarehouse) {
      newErrors.toWarehouse = t(
        'inventory.validation.warehousesSame',
        'لا يمكن أن يكون المستودع المصدر والهدف نفس المستودع'
      )
    }

    if (formData.items.length === 0) {
      newErrors.items = t('inventory.validation.itemsRequired', 'يجب إضافة صنف واحد على الأقل')
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = t('inventory.validation.itemRequired', 'الصنف مطلوب')
      }
      if (!item.qty || item.qty <= 0) {
        newErrors[`item_${index}_qty`] = t(
          'inventory.validation.qtyPositive',
          'الكمية يجب أن تكون أكبر من صفر'
        )
      }
      if (!item.uom) {
        newErrors[`item_${index}_uom`] = t('inventory.validation.uomRequired', 'وحدة القياس مطلوبة')
      }
      if (item.rate < 0) {
        newErrors[`item_${index}_rate`] = t('inventory.validation.ratePositive', 'السعر يجب أن يكون موجبًا')
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Convert items to the correct format
      const submitData: CreateStockEntryData = {
        entryType: formData.entryType,
        postingDate: formData.postingDate,
        postingTime: formData.postingTime,
        fromWarehouse: formData.fromWarehouse || undefined,
        toWarehouse: formData.toWarehouse || undefined,
        items: formData.items.map(({ id, itemCode, itemName, ...item }) => item),
        remarks: formData.remarks || undefined,
        referenceType: formData.referenceType || undefined,
        referenceId: formData.referenceId || undefined,
      }

      await createStockEntryMutation.mutateAsync(submitData)
      navigate({ to: '/dashboard/inventory/stock-entries' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const addItem = () => {
    const newItem: StockEntryItemRow = {
      id: crypto.randomUUID(),
      itemId: '',
      itemCode: '',
      itemName: '',
      qty: 1,
      uom: 'Unit',
      rate: 0,
      amount: 0,
      sourceWarehouse: formData.fromWarehouse || undefined,
      targetWarehouse: formData.toWarehouse || undefined,
      batchNo: '',
      serialNo: '',
    }
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const removeItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
    // Clear item-specific errors
    setErrors((prev) => {
      const newErrors = { ...prev }
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(id)) {
          delete newErrors[key]
        }
      })
      return newErrors
    })
  }

  const updateItem = (id: string, field: keyof StockEntryItemRow, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item

        const updatedItem = { ...item, [field]: value }

        // Auto-update item details when item is selected
        if (field === 'itemId' && value) {
          const selectedItem = items?.data.find((i) => i._id === value)
          if (selectedItem) {
            updatedItem.itemCode = selectedItem.itemCode
            updatedItem.itemName = selectedItem.name
            updatedItem.uom = selectedItem.stockUom
            updatedItem.rate = selectedItem.standardRate
          }
        }

        // Auto-calculate amount when qty or rate changes
        if (field === 'qty' || field === 'rate') {
          updatedItem.amount = updatedItem.qty * updatedItem.rate
        }

        return updatedItem
      }),
    }))

    // Clear field-specific errors
    const index = formData.items.findIndex((item) => item.id === id)
    const errorKey = `item_${index}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  const calculateTotals = () => {
    const totalQty = formData.items.reduce((sum, item) => sum + item.qty, 0)
    const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0)
    return { totalQty, totalAmount }
  }

  const { totalQty, totalAmount } = calculateTotals()

  // Get warehouse label based on entry type
  const getWarehouseLabel = () => {
    const { entryType } = formData
    const requiresFromWarehouse = ['issue', 'transfer', 'material_consumption'].includes(entryType)
    const requiresToWarehouse = ['receipt', 'transfer', 'manufacture', 'repack'].includes(entryType)

    return { requiresFromWarehouse, requiresToWarehouse }
  }

  const { requiresFromWarehouse, requiresToWarehouse } = getWarehouseLabel()

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={t('inventory.createStockEntry', 'إنشاء حركة مخزون جديدة')}
          type="inventory"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    {t('inventory.headerInfo', 'معلومات الترحيل')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="entryType">
                        {t('inventory.stockEntryType', 'نوع حركة المخزون')} *
                      </Label>
                      <Select
                        value={formData.entryType}
                        onValueChange={(v) => handleChange('entryType', v as StockEntryType)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.entryType ? 'border-red-500' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receipt">
                            {t('inventory.entryType.receipt', 'إيصال استلام - Receipt')}
                          </SelectItem>
                          <SelectItem value="issue">
                            {t('inventory.entryType.issue', 'إصدار - Issue')}
                          </SelectItem>
                          <SelectItem value="transfer">
                            {t('inventory.entryType.transfer', 'نقل - Transfer')}
                          </SelectItem>
                          <SelectItem value="manufacture">
                            {t('inventory.entryType.manufacture', 'تصنيع - Manufacture')}
                          </SelectItem>
                          <SelectItem value="repack">
                            {t('inventory.entryType.repack', 'إعادة تعبئة - Repack')}
                          </SelectItem>
                          <SelectItem value="material_consumption">
                            {t('inventory.entryType.materialConsumption', 'استهلاك مواد - Material Consumption')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.entryType && (
                        <p className="text-sm text-red-500">{errors.entryType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postingDate">
                        {t('inventory.postingDate', 'تاريخ الترحيل')} *
                      </Label>
                      <Input
                        id="postingDate"
                        type="date"
                        value={formData.postingDate}
                        onChange={(e) => handleChange('postingDate', e.target.value)}
                        className={`rounded-xl ${errors.postingDate ? 'border-red-500' : ''}`}
                      />
                      {errors.postingDate && (
                        <p className="text-sm text-red-500">{errors.postingDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postingTime">{t('inventory.postingTime', 'وقت الترحيل')}</Label>
                      <Input
                        id="postingTime"
                        type="time"
                        value={formData.postingTime}
                        onChange={(e) => handleChange('postingTime', e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                    {t('inventory.warehouseInfo', 'معلومات المستودعات')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiresFromWarehouse && (
                      <div className="space-y-2">
                        <Label htmlFor="fromWarehouse">
                          {t('inventory.fromWarehouse', 'من مستودع')} *
                        </Label>
                        <Select
                          value={formData.fromWarehouse}
                          onValueChange={(v) => handleChange('fromWarehouse', v)}
                        >
                          <SelectTrigger className={`rounded-xl ${errors.fromWarehouse ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={t('inventory.selectWarehouse', 'اختر المستودع')} />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses?.data.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse._id}>
                                {warehouse.nameAr || warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.fromWarehouse && (
                          <p className="text-sm text-red-500">{errors.fromWarehouse}</p>
                        )}
                      </div>
                    )}

                    {requiresToWarehouse && (
                      <div className="space-y-2">
                        <Label htmlFor="toWarehouse">
                          {t('inventory.toWarehouse', 'إلى مستودع')} *
                        </Label>
                        <Select
                          value={formData.toWarehouse}
                          onValueChange={(v) => handleChange('toWarehouse', v)}
                        >
                          <SelectTrigger className={`rounded-xl ${errors.toWarehouse ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={t('inventory.selectWarehouse', 'اختر المستودع')} />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses?.data.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse._id}>
                                {warehouse.nameAr || warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.toWarehouse && (
                          <p className="text-sm text-red-500">{errors.toWarehouse}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {!requiresFromWarehouse && !requiresToWarehouse && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t(
                          'inventory.selectEntryTypeFirst',
                          'اختر نوع حركة المخزون أولاً لتحديد المستودعات المطلوبة'
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      {t('inventory.items', 'الأصناف')}
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={addItem}
                      variant="outline"
                      className="rounded-xl"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('inventory.addItem', 'إضافة صنف')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {errors.items && (
                    <Alert className="mb-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.items}</AlertDescription>
                    </Alert>
                  )}

                  <div className="overflow-x-auto rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="min-w-[200px]">
                            {t('inventory.item', 'الصنف')}
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            {t('inventory.quantity', 'الكمية')}
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            {t('inventory.uom', 'الوحدة')}
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            {t('inventory.basicRate', 'السعر الأساسي')}
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            {t('inventory.amount', 'المبلغ')}
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            {t('inventory.batchNo', 'رقم الدفعة')}
                          </TableHead>
                          <TableHead className="min-w-[120px]">
                            {t('inventory.serialNo', 'رقم تسلسلي')}
                          </TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              {t('inventory.noItems', 'لا توجد أصناف. انقر على "إضافة صنف" للبدء.')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          formData.items.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Select
                                  value={item.itemId}
                                  onValueChange={(v) => updateItem(item.id, 'itemId', v)}
                                >
                                  <SelectTrigger
                                    className={`rounded-xl ${
                                      errors[`item_${index}_itemId`] ? 'border-red-500' : ''
                                    }`}
                                  >
                                    <SelectValue placeholder={t('inventory.selectItem', 'اختر الصنف')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items?.data.map((itm) => (
                                      <SelectItem key={itm._id} value={itm._id}>
                                        {itm.nameAr || itm.name} ({itm.itemCode})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.001"
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)
                                  }
                                  className={`rounded-xl ${
                                    errors[`item_${index}_qty`] ? 'border-red-500' : ''
                                  }`}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.uom}
                                  onValueChange={(v) => updateItem(item.id, 'uom', v)}
                                >
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
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
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) =>
                                    updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                                  }
                                  className={`rounded-xl ${
                                    errors[`item_${index}_rate`] ? 'border-red-500' : ''
                                  }`}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.amount.toFixed(2)}
                                  disabled
                                  className="rounded-xl bg-muted"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  value={item.batchNo || ''}
                                  onChange={(e) => updateItem(item.id, 'batchNo', e.target.value)}
                                  placeholder="BATCH-001"
                                  className="rounded-xl"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  value={item.serialNo || ''}
                                  onChange={(e) => updateItem(item.id, 'serialNo', e.target.value)}
                                  placeholder="SN-001"
                                  className="rounded-xl"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals */}
                  {formData.items.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <div className="space-y-2 min-w-[300px]">
                        <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-muted/50">
                          <span className="font-medium">
                            {t('inventory.totalQuantity', 'إجمالي الكمية')}:
                          </span>
                          <span className="font-bold text-emerald-600">
                            {totalQty.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-4 rounded-xl bg-emerald-50">
                          <span className="font-medium">
                            {t('inventory.totalAmount', 'المبلغ الإجمالي')}:
                          </span>
                          <span className="font-bold text-emerald-600 text-lg">
                            {totalAmount.toFixed(2)} {t('common.sar', 'ريال')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('inventory.additionalInfo', 'معلومات إضافية')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referenceType">
                        {t('inventory.referenceDocType', 'نوع المستند المرجعي')}
                      </Label>
                      <Select
                        value={formData.referenceType}
                        onValueChange={(v) => handleChange('referenceType', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('inventory.selectDocType', 'اختر النوع')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase_order">
                            {t('inventory.purchaseOrder', 'أمر شراء')}
                          </SelectItem>
                          <SelectItem value="sales_order">
                            {t('inventory.salesOrder', 'أمر بيع')}
                          </SelectItem>
                          <SelectItem value="delivery_note">
                            {t('inventory.deliveryNote', 'سند تسليم')}
                          </SelectItem>
                          <SelectItem value="purchase_receipt">
                            {t('inventory.purchaseReceipt', 'إيصال شراء')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referenceId">
                        {t('inventory.referenceDocNumber', 'رقم المستند المرجعي')}
                      </Label>
                      <Input
                        id="referenceId"
                        value={formData.referenceId}
                        onChange={(e) => handleChange('referenceId', e.target.value)}
                        placeholder="PO-00001"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">{t('inventory.remarks', 'ملاحظات')}</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      placeholder={t('inventory.remarksPlaceholder', 'أضف ملاحظات...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/inventory/stock-entries' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createStockEntryMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createStockEntryMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <InventorySidebar context="stock-entries" />
          </div>
        </form>
      </Main>
    </>
  )
}
