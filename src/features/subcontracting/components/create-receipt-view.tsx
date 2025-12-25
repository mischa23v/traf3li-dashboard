/**
 * Create Subcontracting Receipt View
 * Form for creating subcontracting receipts from orders
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Save,
  X,
  Building2,
  Calendar,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
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
import { Skeleton } from '@/components/ui/skeleton'

import {
  useCreateSubcontractingReceipt,
  useSubcontractingOrders,
  useSubcontractingOrder,
} from '@/hooks/use-subcontracting'
import { useWarehouses } from '@/hooks/use-inventory'
import { SubcontractingSidebar } from './subcontracting-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'subcontracting.subcontracting', href: '/dashboard/subcontracting' },
  { title: 'subcontracting.receipts', href: '/dashboard/subcontracting/receipts' },
  { title: 'subcontracting.createReceipt', href: '/dashboard/subcontracting/receipts/create' },
]

interface ReceiptItemRow {
  itemId: string
  itemCode: string
  itemName: string
  orderedQty: number
  previouslyReceived: number
  qtyToReceive: number
  rejectedQty: number
  acceptedQty: number
  uom: string
  rate: number
  amount: number
  warehouse: string
  batchNo?: string
  serialNo?: string
}

interface ReceiptFormData {
  subcontractingOrderId: string
  orderNumber: string
  supplierId: string
  supplierName: string
  postingDate: string
  postingTime: string
  items: ReceiptItemRow[]
  remarks: string
}

export function CreateReceiptView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createReceiptMutation = useCreateSubcontractingReceipt()

  // Fetch submitted orders that can be received
  const { data: ordersData, isLoading: loadingOrders } = useSubcontractingOrders({
    status: 'submitted'
  })
  const { data: warehousesData, isLoading: loadingWarehouses } = useWarehouses()

  // Get current date and time
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5)

  // Form state
  const [formData, setFormData] = useState<ReceiptFormData>({
    subcontractingOrderId: '',
    orderNumber: '',
    supplierId: '',
    supplierName: '',
    postingDate: currentDate,
    postingTime: currentTime,
    items: [],
    remarks: '',
  })

  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch selected order details
  const { data: selectedOrderData, isLoading: loadingOrderDetails } = useSubcontractingOrder(
    selectedOrderId
  )

  // Extract data from responses
  const orders = ordersData?.orders || ordersData?.data || []
  const warehouses = warehousesData?.warehouses || warehousesData?.data || []
  const selectedOrder = selectedOrderData?.order || selectedOrderData

  // Auto-populate form when order is selected
  useEffect(() => {
    if (selectedOrder && selectedOrder._id === selectedOrderId) {
      // Map service items to receipt items
      const receiptItems: ReceiptItemRow[] = (selectedOrder.serviceItems || []).map((item: any) => {
        // Calculate previously received quantity (from finishedGoods if available)
        const finishedGood = selectedOrder.finishedGoods?.find(
          (fg: any) => fg.itemId === item.itemId
        )
        const previouslyReceived = finishedGood?.receivedQty || 0
        const orderedQty = item.qty || 0
        const remainingQty = Math.max(0, orderedQty - previouslyReceived)

        return {
          itemId: item.itemId,
          itemCode: item.itemCode || '',
          itemName: item.itemName || '',
          orderedQty: orderedQty,
          previouslyReceived: previouslyReceived,
          qtyToReceive: remainingQty, // Auto-fill with remaining quantity
          rejectedQty: 0,
          acceptedQty: remainingQty,
          uom: item.uom || 'Unit',
          rate: item.rate || 0,
          amount: remainingQty * (item.rate || 0),
          warehouse: selectedOrder.finishedGoodsWarehouse || '',
          batchNo: '',
          serialNo: '',
        }
      })

      setFormData({
        subcontractingOrderId: selectedOrder._id,
        orderNumber: selectedOrder.orderNumber || '',
        supplierId: selectedOrder.supplierId,
        supplierName: selectedOrder.supplierName || '',
        postingDate: currentDate,
        postingTime: currentTime,
        items: receiptItems,
        remarks: '',
      })
    }
  }, [selectedOrder, selectedOrderId, currentDate, currentTime])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subcontractingOrderId) {
      newErrors.subcontractingOrderId = t(
        'subcontracting.validation.orderRequired',
        'أمر التصنيع الخارجي مطلوب'
      )
    }
    if (!formData.postingDate) {
      newErrors.postingDate = t('subcontracting.validation.postingDateRequired', 'تاريخ الترحيل مطلوب')
    }
    if (formData.items.length === 0) {
      newErrors.items = t('subcontracting.validation.itemsRequired', 'لا توجد أصناف للاستلام')
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (item.qtyToReceive <= 0 && item.rejectedQty <= 0) {
        newErrors[`item_${index}_qty`] = t(
          'subcontracting.validation.qtyRequired',
          'يجب إدخال كمية الاستلام أو الرفض'
        )
      }
      if (item.qtyToReceive < 0) {
        newErrors[`item_${index}_qty`] = t(
          'subcontracting.validation.qtyPositive',
          'الكمية يجب أن تكون موجبة'
        )
      }
      if (!item.warehouse) {
        newErrors[`item_${index}_warehouse`] = t(
          'subcontracting.validation.warehouseRequired',
          'المستودع مطلوب'
        )
      }
      // Check if receiving more than ordered
      const totalReceiving = item.previouslyReceived + item.qtyToReceive + item.rejectedQty
      if (totalReceiving > item.orderedQty) {
        newErrors[`item_${index}_qty`] = t(
          'subcontracting.validation.qtyExceedsOrder',
          'الكمية المستلمة تتجاوز الكمية المطلوبة'
        )
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const submitData = {
        subcontractingOrderId: formData.subcontractingOrderId,
        postingDate: formData.postingDate,
        postingTime: formData.postingTime,
        items: formData.items.map((item) => ({
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          orderedQty: item.orderedQty,
          receivedQty: item.qtyToReceive,
          rejectedQty: item.rejectedQty,
          acceptedQty: item.acceptedQty,
          uom: item.uom,
          rate: item.rate,
          amount: item.amount,
          warehouse: item.warehouse,
          batchNo: item.batchNo,
          serialNo: item.serialNo,
        })),
        remarks: formData.remarks,
      }

      await createReceiptMutation.mutateAsync(submitData)
      navigate({ to: '/dashboard/subcontracting/receipts' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId)
    if (errors.subcontractingOrderId) {
      setErrors((prev) => ({ ...prev, subcontractingOrderId: '' }))
    }
  }

  const handleChange = (field: keyof ReceiptFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleItemChange = (index: number, field: keyof ReceiptItemRow, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-calculate accepted quantity and amount
    if (field === 'qtyToReceive' || field === 'rejectedQty') {
      const qtyToReceive = field === 'qtyToReceive' ? value : newItems[index].qtyToReceive
      const rejectedQty = field === 'rejectedQty' ? value : newItems[index].rejectedQty

      newItems[index].acceptedQty = Math.max(0, qtyToReceive - rejectedQty)
      newItems[index].amount = newItems[index].acceptedQty * newItems[index].rate
    }

    setFormData((prev) => ({ ...prev, items: newItems }))

    // Clear field-specific errors
    const errorKey = `item_${index}_${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
  }

  // Calculate totals
  const totalQtyToReceive = formData.items.reduce((sum, item) => sum + item.qtyToReceive, 0)
  const totalRejectedQty = formData.items.reduce((sum, item) => sum + item.rejectedQty, 0)
  const totalAcceptedQty = formData.items.reduce((sum, item) => sum + item.acceptedQty, 0)
  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0)

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
          title={t('subcontracting.createReceipt', 'إنشاء إيصال استلام')}
          type="subcontracting"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Order Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('subcontracting.orderSelection', 'اختيار الأمر')}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="subcontractingOrderId" className="text-sm font-medium text-slate-700">
                      {t('subcontracting.order', 'أمر التصنيع الخارجي')} <span className="text-red-500">*</span>
                    </Label>
                    {loadingOrders ? (
                      <Skeleton className="h-10 w-full rounded-xl" />
                    ) : (
                      <Select value={selectedOrderId} onValueChange={handleOrderChange}>
                        <SelectTrigger
                          className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                            errors.subcontractingOrderId ? 'border-red-500' : ''
                          }`}
                        >
                          <SelectValue placeholder={t('subcontracting.selectOrder', 'اختر أمر التصنيع الخارجي')} />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              {t('subcontracting.noOrdersAvailable', 'لا توجد أوامر متاحة للاستلام')}
                            </div>
                          ) : (
                            orders.map((order: any) => (
                              <SelectItem key={order._id} value={order._id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{order.orderNumber}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <span className="text-sm">{order.supplierName}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {order.percentReceived || 0}% {t('subcontracting.received', 'مستلم')}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.subcontractingOrderId && (
                      <p className="text-sm text-red-500">{errors.subcontractingOrderId}</p>
                    )}
                  </div>

                  {/* Auto-filled Supplier Info */}
                  {formData.supplierName && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.supplier', 'المورد (المصنع الخارجي)')}
                      </Label>
                      <Input
                        value={formData.supplierName}
                        readOnly
                        className="rounded-xl border-slate-200 bg-slate-50"
                      />
                    </div>
                  )}
                </div>

                {/* Posting Information */}
                {formData.subcontractingOrderId && (
                  <>
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.postingInfo', 'معلومات الترحيل')}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="postingDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                            {t('subcontracting.postingDate', 'تاريخ الترحيل')} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="postingDate"
                            type="date"
                            value={formData.postingDate}
                            onChange={(e) => handleChange('postingDate', e.target.value)}
                            className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                              errors.postingDate ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.postingDate && (
                            <p className="text-sm text-red-500">{errors.postingDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postingTime" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                            {t('subcontracting.postingTime', 'وقت الترحيل')}
                          </Label>
                          <Input
                            id="postingTime"
                            type="time"
                            value={formData.postingTime}
                            onChange={(e) => handleChange('postingTime', e.target.value)}
                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.itemsToReceive', 'الأصناف المستلمة')}
                      </h3>

                      {errors.items && (
                        <Alert variant="destructive" className="rounded-xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errors.items}</AlertDescription>
                        </Alert>
                      )}

                      {loadingOrderDetails ? (
                        <div className="space-y-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : formData.items.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="min-w-[180px]">
                                  {t('subcontracting.itemName', 'اسم الصنف')}
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  {t('subcontracting.orderedQty', 'الكمية المطلوبة')}
                                </TableHead>
                                <TableHead className="w-[120px]">
                                  {t('subcontracting.previouslyReceived', 'المستلم سابقاً')}
                                </TableHead>
                                <TableHead className="w-[120px]">
                                  {t('subcontracting.qtyToReceive', 'كمية الاستلام')} *
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  {t('subcontracting.rejectedQty', 'كمية مرفوضة')}
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  {t('subcontracting.acceptedQty', 'كمية مقبولة')}
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                  {t('subcontracting.warehouse', 'المستودع')} *
                                </TableHead>
                                <TableHead className="w-[120px]">
                                  {t('subcontracting.amount', 'المبلغ')}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.items.map((item, index) => {
                                const remainingQty = item.orderedQty - item.previouslyReceived
                                const isFullyReceived = remainingQty <= 0

                                return (
                                  <TableRow key={index} className={isFullyReceived ? 'bg-slate-50 opacity-60' : ''}>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium text-sm">{item.itemName}</span>
                                        <span className="text-xs text-muted-foreground">{item.itemCode}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-center">
                                        <div className="font-medium">{item.orderedQty.toFixed(3)}</div>
                                        <div className="text-xs text-muted-foreground">{item.uom}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-center">
                                        <Badge variant={item.previouslyReceived > 0 ? 'default' : 'outline'}>
                                          {item.previouslyReceived.toFixed(3)}
                                        </Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        max={remainingQty}
                                        value={item.qtyToReceive}
                                        onChange={(e) =>
                                          handleItemChange(index, 'qtyToReceive', parseFloat(e.target.value) || 0)
                                        }
                                        className={`rounded-lg ${
                                          errors[`item_${index}_qty`] ? 'border-red-500' : ''
                                        }`}
                                        disabled={isFullyReceived}
                                      />
                                      {remainingQty > 0 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {t('subcontracting.remaining', 'متبقي')}: {remainingQty.toFixed(3)}
                                        </div>
                                      )}
                                      {errors[`item_${index}_qty`] && (
                                        <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_qty`]}</p>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        value={item.rejectedQty}
                                        onChange={(e) =>
                                          handleItemChange(index, 'rejectedQty', parseFloat(e.target.value) || 0)
                                        }
                                        className="rounded-lg"
                                        disabled={isFullyReceived}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="font-medium text-emerald-600">
                                          {item.acceptedQty.toFixed(3)}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {loadingWarehouses ? (
                                        <Skeleton className="h-9 w-full" />
                                      ) : (
                                        <Select
                                          value={item.warehouse}
                                          onValueChange={(v) => handleItemChange(index, 'warehouse', v)}
                                          disabled={isFullyReceived}
                                        >
                                          <SelectTrigger
                                            className={`rounded-lg ${
                                              errors[`item_${index}_warehouse`] ? 'border-red-500' : ''
                                            }`}
                                          >
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
                                      )}
                                      {errors[`item_${index}_warehouse`] && (
                                        <p className="text-xs text-red-500 mt-1">
                                          {errors[`item_${index}_warehouse`]}
                                        </p>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={item.amount.toFixed(2)}
                                        className="rounded-lg bg-slate-50"
                                        readOnly
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>{t('subcontracting.selectOrderFirst', 'اختر أمر التصنيع الخارجي أولاً')}</p>
                        </div>
                      )}

                      {/* Totals Summary */}
                      {formData.items.length > 0 && (
                        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-navy mb-4">
                            {t('subcontracting.receiptSummary', 'ملخص الاستلام')}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1 p-3 bg-white rounded-xl">
                              <span className="text-xs text-muted-foreground">
                                {t('subcontracting.totalQtyToReceive', 'إجمالي كمية الاستلام')}
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                {totalQtyToReceive.toFixed(3)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-white rounded-xl">
                              <span className="text-xs text-muted-foreground">
                                {t('subcontracting.totalRejectedQty', 'إجمالي كمية مرفوضة')}
                              </span>
                              <span className="text-lg font-bold text-red-600">
                                {totalRejectedQty.toFixed(3)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-white rounded-xl">
                              <span className="text-xs text-muted-foreground">
                                {t('subcontracting.totalAcceptedQty', 'إجمالي كمية مقبولة')}
                              </span>
                              <span className="text-lg font-bold text-emerald-600">
                                {totalAcceptedQty.toFixed(3)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-white rounded-xl">
                              <span className="text-xs text-muted-foreground">
                                {t('subcontracting.totalAmount', 'المبلغ الإجمالي')}
                              </span>
                              <span className="text-lg font-bold text-emerald-600">
                                {totalAmount.toFixed(2)} {selectedOrder?.currency || 'SAR'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes/Remarks */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        {t('subcontracting.notes', 'ملاحظات')}
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="remarks">{t('subcontracting.remarks', 'ملاحظات')}</Label>
                        <Textarea
                          id="remarks"
                          value={formData.remarks}
                          onChange={(e) => handleChange('remarks', e.target.value)}
                          placeholder={t(
                            'subcontracting.remarksPlaceholder',
                            'أي ملاحظات حول الاستلام أو جودة الأصناف...'
                          )}
                          className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-slate-500 hover:text-navy rounded-xl"
                        onClick={() => navigate({ to: '/dashboard/subcontracting/receipts' })}
                      >
                        <X className="w-4 h-4 ml-2" />
                        {t('common.cancel', 'إلغاء')}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                        disabled={createReceiptMutation.isPending || formData.items.length === 0}
                      >
                        {createReceiptMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            {t('common.saving', 'جاري الحفظ...')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Save className="w-4 h-4" aria-hidden="true" />
                            {t('subcontracting.saveReceipt', 'حفظ الإيصال')}
                          </span>
                        )}
                      </Button>
                    </div>
                  </>
                )}
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
