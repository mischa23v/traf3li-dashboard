/**
 * Create Material Request View
 * Form for creating new material requests in the Buying module
 * Supports: Purchase, Transfer, Material Issue, and Manufacture request types
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Plus,
  Trash2,
  Package,
  Calendar,
  FileText,
  Loader2,
  ShoppingCart,
  ArrowRightLeft,
  Factory,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'

import { useCreateMaterialRequest } from '@/hooks/use-buying'
import { useItems } from '@/hooks/use-inventory'
import { useWarehouses } from '@/hooks/use-inventory'
import { BuyingSidebar } from './buying-sidebar'
import type { CreateMaterialRequestData, MaterialRequestType, MaterialRequestItem } from '@/types/buying'
import { ROUTES } from '@/constants/routes'

// Extended item type for form state
interface FormMaterialRequestItem extends Omit<MaterialRequestItem, '_id' | 'orderedQty' | 'receivedQty'> {
  tempId: string
  sourceWarehouse?: string
  targetWarehouse?: string
}

interface MaterialRequestFormData {
  requestType: MaterialRequestType
  purpose: string
  transactionDate: string
  requiredDate: string
  items: FormMaterialRequestItem[]
  remarks: string
}

const REQUEST_TYPE_ICONS: Record<MaterialRequestType, typeof ShoppingCart> = {
  purchase: ShoppingCart,
  transfer: ArrowRightLeft,
  material_issue: Package,
  manufacture: Factory,
}

export function CreateMaterialRequestView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMaterialRequestMutation = useCreateMaterialRequest()

  // Fetch items and warehouses
  const { data: itemsData, isLoading: isLoadingItems } = useItems()
  const { data: warehousesData, isLoading: isLoadingWarehouses } = useWarehouses()

  const items = itemsData?.data || []
  const warehouses = warehousesData?.data || []

  const [formData, setFormData] = useState<MaterialRequestFormData>({
    requestType: 'purchase',
    purpose: '',
    transactionDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    items: [],
    remarks: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedItemId, setSelectedItemId] = useState<string>('')

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.transactionDate) {
      newErrors.transactionDate = t('buying.validation.transactionDateRequired', 'تاريخ الطلب مطلوب')
    }

    if (formData.items.length === 0) {
      newErrors.items = t('buying.validation.itemsRequired', 'يجب إضافة صنف واحد على الأقل')
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = t('buying.validation.itemRequired', 'الصنف مطلوب')
      }
      if (!item.qty || item.qty <= 0) {
        newErrors[`item_${index}_qty`] = t('buying.validation.qtyRequired', 'الكمية يجب أن تكون أكبر من صفر')
      }
      if (!item.uom) {
        newErrors[`item_${index}_uom`] = t('buying.validation.uomRequired', 'وحدة القياس مطلوبة')
      }

      // Validate warehouses based on request type
      if (formData.requestType === 'transfer') {
        if (!item.sourceWarehouse) {
          newErrors[`item_${index}_source`] = t('buying.validation.sourceWarehouseRequired', 'المستودع المصدر مطلوب')
        }
        if (!item.targetWarehouse) {
          newErrors[`item_${index}_target`] = t('buying.validation.targetWarehouseRequired', 'المستودع الهدف مطلوب')
        }
        if (item.sourceWarehouse === item.targetWarehouse) {
          newErrors[`item_${index}_warehouse`] = t('buying.validation.warehousesMustDiffer', 'المستودعات يجب أن تكون مختلفة')
        }
      }

      if (formData.requestType === 'material_issue' && !item.sourceWarehouse) {
        newErrors[`item_${index}_source`] = t('buying.validation.sourceWarehouseRequired', 'المستودع المصدر مطلوب')
      }

      if ((formData.requestType === 'purchase' || formData.requestType === 'manufacture') && !item.warehouse) {
        newErrors[`item_${index}_warehouse`] = t('buying.validation.warehouseRequired', 'المستودع مطلوب')
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form field changes
  const handleFieldChange = (field: keyof MaterialRequestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Add new item row
  const handleAddItem = () => {
    if (!selectedItemId) {
      return
    }

    const selectedItem = items.find((item) => item._id === selectedItemId)
    if (!selectedItem) return

    const newItem: FormMaterialRequestItem = {
      tempId: `temp_${Date.now()}`,
      itemId: selectedItem._id,
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.name,
      qty: 1,
      uom: selectedItem.stockUom,
      warehouse: '',
      sourceWarehouse: '',
      targetWarehouse: '',
      requiredDate: formData.requiredDate,
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
    setSelectedItemId('')

    // Clear items error
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: '' }))
    }
  }

  // Update item field
  const handleUpdateItem = (tempId: string, field: keyof FormMaterialRequestItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      ),
    }))

    // Clear related errors
    const itemIndex = formData.items.findIndex((item) => item.tempId === tempId)
    if (itemIndex >= 0) {
      const errorKey = `item_${itemIndex}_${field}`
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: '' }))
      }
    }
  }

  // Remove item
  const handleRemoveItem = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.tempId !== tempId),
    }))
  }

  // Handle item selection change
  const handleItemChange = (tempId: string, itemId: string) => {
    const selectedItem = items.find((item) => item._id === itemId)
    if (!selectedItem) return

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.tempId === tempId
          ? {
              ...item,
              itemId: selectedItem._id,
              itemCode: selectedItem.itemCode,
              itemName: selectedItem.name,
              uom: selectedItem.stockUom,
            }
          : item
      ),
    }))
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Prepare data for API
    const apiData: CreateMaterialRequestData = {
      requestType: formData.requestType,
      purpose: formData.purpose,
      transactionDate: formData.transactionDate,
      requiredDate: formData.requiredDate || undefined,
      items: formData.items.map((item) => {
        const baseItem = {
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          qty: item.qty,
          uom: item.uom,
          requiredDate: item.requiredDate,
        }

        // Add warehouse field based on request type
        if (formData.requestType === 'transfer') {
          return {
            ...baseItem,
            warehouse: item.targetWarehouse,
          }
        } else if (formData.requestType === 'material_issue') {
          return {
            ...baseItem,
            warehouse: item.sourceWarehouse,
          }
        } else {
          return {
            ...baseItem,
            warehouse: item.warehouse,
          }
        }
      }),
      remarks: formData.remarks || undefined,
    }

    try {
      await createMaterialRequestMutation.mutateAsync(apiData)
      navigate({ to: ROUTES.dashboard.buying.materialRequests.list })
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Get request type icon and label
  const getRequestTypeIcon = (type: MaterialRequestType) => {
    const Icon = REQUEST_TYPE_ICONS[type]
    return <Icon className="h-4 w-4" aria-hidden="true" />
  }

  const getRequestTypeLabel = (type: MaterialRequestType) => {
    const labels: Record<MaterialRequestType, string> = {
      purchase: t('buying.requestTypePurchase', 'شراء'),
      transfer: t('buying.requestTypeTransfer', 'نقل'),
      material_issue: t('buying.requestTypeIssue', 'صرف'),
      manufacture: t('buying.requestTypeManufacture', 'تصنيع'),
    }
    return labels[type]
  }

  const topNav = [
    { title: t('buying.overview', 'نظرة عامة'), href: ROUTES.dashboard.buying.list, isActive: false },
    { title: t('buying.materialRequests', 'طلبات المواد'), href: ROUTES.dashboard.buying.materialRequests.list, isActive: false },
    {
      title: t('buying.createMaterialRequest', 'إنشاء طلب مواد'),
      href: ROUTES.dashboard.buying.materialRequests.create,
      isActive: true
    },
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
        {/* HERO CARD */}
        <ProductivityHero
          badge={t('buying.badge', 'المشتريات')}
          title={t('buying.createMaterialRequest', 'إنشاء طلب مواد')}
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
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.requestDetails', 'تفاصيل الطلب')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Request Type */}
                    <div className="space-y-2">
                      <Label htmlFor="requestType" className="text-sm font-medium text-slate-700">
                        {t('buying.requestType', 'نوع الطلب')} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.requestType}
                        onValueChange={(v) => handleFieldChange('requestType', v as MaterialRequestType)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">
                            <div className="flex items-center gap-2">
                              {getRequestTypeIcon('purchase')}
                              {getRequestTypeLabel('purchase')}
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer">
                            <div className="flex items-center gap-2">
                              {getRequestTypeIcon('transfer')}
                              {getRequestTypeLabel('transfer')}
                            </div>
                          </SelectItem>
                          <SelectItem value="material_issue">
                            <div className="flex items-center gap-2">
                              {getRequestTypeIcon('material_issue')}
                              {getRequestTypeLabel('material_issue')}
                            </div>
                          </SelectItem>
                          <SelectItem value="manufacture">
                            <div className="flex items-center gap-2">
                              {getRequestTypeIcon('manufacture')}
                              {getRequestTypeLabel('manufacture')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transaction Date */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.transactionDate', 'تاريخ الطلب')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={formData.transactionDate}
                        onChange={(e) => handleFieldChange('transactionDate', e.target.value)}
                        className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.transactionDate ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.transactionDate && (
                        <p className="text-sm text-red-500">{errors.transactionDate}</p>
                      )}
                    </div>

                    {/* Required By Date */}
                    <div className="space-y-2">
                      <Label htmlFor="requiredDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.requiredByDate', 'مطلوب بتاريخ')}
                      </Label>
                      <Input
                        id="requiredDate"
                        type="date"
                        value={formData.requiredDate}
                        onChange={(e) => handleFieldChange('requiredDate', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-medium text-slate-700">
                        {t('buying.purpose', 'الغرض')}
                      </Label>
                      <Input
                        id="purpose"
                        placeholder={t('buying.purposePlaceholder', 'الغرض من الطلب')}
                        value={formData.purpose}
                        onChange={(e) => handleFieldChange('purpose', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      {t('buying.items', 'الأصناف')}
                    </h3>
                  </div>

                  {/* Add Item Section */}
                  <Card className="p-4 bg-slate-50 border-slate-200">
                    <div className="flex items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="selectItem" className="text-sm font-medium text-slate-700">
                          {t('buying.selectItem', 'اختر الصنف')}
                        </Label>
                        <Select
                          value={selectedItemId}
                          onValueChange={setSelectedItemId}
                          disabled={isLoadingItems}
                        >
                          <SelectTrigger
                            id="selectItem"
                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                          >
                            <SelectValue placeholder={t('buying.selectItemPlaceholder', 'اختر صنف...')} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.itemCode} - {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedItemId}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <Plus className="w-4 h-4 me-2" aria-hidden="true" />
                        {t('buying.addItem', 'إضافة صنف')}
                      </Button>
                    </div>
                  </Card>

                  {/* Items Table */}
                  {formData.items.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-bold text-navy">{t('buying.item', 'الصنف')}</TableHead>
                            <TableHead className="font-bold text-navy">{t('buying.quantity', 'الكمية')}</TableHead>
                            <TableHead className="font-bold text-navy">{t('buying.uom', 'الوحدة')}</TableHead>
                            {formData.requestType === 'transfer' && (
                              <>
                                <TableHead className="font-bold text-navy">{t('buying.sourceWarehouse', 'المستودع المصدر')}</TableHead>
                                <TableHead className="font-bold text-navy">{t('buying.targetWarehouse', 'المستودع الهدف')}</TableHead>
                              </>
                            )}
                            {formData.requestType === 'material_issue' && (
                              <TableHead className="font-bold text-navy">{t('buying.sourceWarehouse', 'المستودع المصدر')}</TableHead>
                            )}
                            {(formData.requestType === 'purchase' || formData.requestType === 'manufacture') && (
                              <TableHead className="font-bold text-navy">{t('buying.warehouse', 'المستودع')}</TableHead>
                            )}
                            <TableHead className="font-bold text-navy">{t('buying.requiredDate', 'التاريخ المطلوب')}</TableHead>
                            <TableHead className="font-bold text-navy w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={item.tempId}>
                              {/* Item */}
                              <TableCell className="min-w-[200px]">
                                <Select
                                  value={item.itemId}
                                  onValueChange={(v) => handleItemChange(item.tempId, v)}
                                >
                                  <SelectTrigger className="rounded-lg border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items.map((i) => (
                                      <SelectItem key={i._id} value={i._id}>
                                        {i.itemCode} - {i.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {errors[`item_${index}_itemId`] && (
                                  <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_itemId`]}</p>
                                )}
                              </TableCell>

                              {/* Quantity */}
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.qty}
                                  onChange={(e) =>
                                    handleUpdateItem(item.tempId, 'qty', parseFloat(e.target.value) || 0)
                                  }
                                  className={`rounded-lg border-slate-200 w-24 ${
                                    errors[`item_${index}_qty`] ? 'border-red-500' : ''
                                  }`}
                                />
                                {errors[`item_${index}_qty`] && (
                                  <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_qty`]}</p>
                                )}
                              </TableCell>

                              {/* UOM */}
                              <TableCell>
                                <Input
                                  value={item.uom}
                                  onChange={(e) => handleUpdateItem(item.tempId, 'uom', e.target.value)}
                                  className="rounded-lg border-slate-200 w-20"
                                />
                              </TableCell>

                              {/* Warehouses based on request type */}
                              {formData.requestType === 'transfer' && (
                                <>
                                  <TableCell>
                                    <Select
                                      value={item.sourceWarehouse}
                                      onValueChange={(v) => handleUpdateItem(item.tempId, 'sourceWarehouse', v)}
                                    >
                                      <SelectTrigger className={`rounded-lg border-slate-200 min-w-[150px] ${
                                        errors[`item_${index}_source`] ? 'border-red-500' : ''
                                      }`}>
                                        <SelectValue placeholder={t('buying.select', 'اختر...')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {warehouses.map((wh) => (
                                          <SelectItem key={wh._id} value={wh._id}>
                                            {wh.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {errors[`item_${index}_source`] && (
                                      <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_source`]}</p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={item.targetWarehouse}
                                      onValueChange={(v) => handleUpdateItem(item.tempId, 'targetWarehouse', v)}
                                    >
                                      <SelectTrigger className={`rounded-lg border-slate-200 min-w-[150px] ${
                                        errors[`item_${index}_target`] ? 'border-red-500' : ''
                                      }`}>
                                        <SelectValue placeholder={t('buying.select', 'اختر...')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {warehouses.map((wh) => (
                                          <SelectItem key={wh._id} value={wh._id}>
                                            {wh.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {errors[`item_${index}_target`] && (
                                      <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_target`]}</p>
                                    )}
                                    {errors[`item_${index}_warehouse`] && (
                                      <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_warehouse`]}</p>
                                    )}
                                  </TableCell>
                                </>
                              )}

                              {formData.requestType === 'material_issue' && (
                                <TableCell>
                                  <Select
                                    value={item.sourceWarehouse}
                                    onValueChange={(v) => handleUpdateItem(item.tempId, 'sourceWarehouse', v)}
                                  >
                                    <SelectTrigger className={`rounded-lg border-slate-200 min-w-[150px] ${
                                      errors[`item_${index}_source`] ? 'border-red-500' : ''
                                    }`}>
                                      <SelectValue placeholder={t('buying.select', 'اختر...')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {warehouses.map((wh) => (
                                        <SelectItem key={wh._id} value={wh._id}>
                                          {wh.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {errors[`item_${index}_source`] && (
                                    <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_source`]}</p>
                                  )}
                                </TableCell>
                              )}

                              {(formData.requestType === 'purchase' || formData.requestType === 'manufacture') && (
                                <TableCell>
                                  <Select
                                    value={item.warehouse}
                                    onValueChange={(v) => handleUpdateItem(item.tempId, 'warehouse', v)}
                                  >
                                    <SelectTrigger className={`rounded-lg border-slate-200 min-w-[150px] ${
                                      errors[`item_${index}_warehouse`] ? 'border-red-500' : ''
                                    }`}>
                                      <SelectValue placeholder={t('buying.select', 'اختر...')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {warehouses.map((wh) => (
                                        <SelectItem key={wh._id} value={wh._id}>
                                          {wh.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {errors[`item_${index}_warehouse`] && (
                                    <p className="text-xs text-red-500 mt-1">{errors[`item_${index}_warehouse`]}</p>
                                  )}
                                </TableCell>
                              )}

                              {/* Required Date */}
                              <TableCell>
                                <Input
                                  type="date"
                                  value={item.requiredDate || ''}
                                  onChange={(e) => handleUpdateItem(item.tempId, 'requiredDate', e.target.value)}
                                  className="rounded-lg border-slate-200 min-w-[140px]"
                                />
                              </TableCell>

                              {/* Delete Button */}
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.tempId)}
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
                  ) : (
                    <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-slate-500">{t('buying.noItemsAdded', 'لم يتم إضافة أصناف بعد')}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {t('buying.addItemsHint', 'اختر صنفًا من القائمة أعلاه وانقر على "إضافة صنف"')}
                      </p>
                    </div>
                  )}

                  {errors.items && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      {errors.items}
                    </p>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.additionalInfo', 'معلومات إضافية')}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-slate-700">
                      {t('buying.remarks', 'ملاحظات')}
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder={t('buying.remarksPlaceholder', 'أي ملاحظات إضافية...')}
                      value={formData.remarks}
                      onChange={(e) => handleFieldChange('remarks', e.target.value)}
                      className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-500 hover:text-navy rounded-xl"
                    onClick={() => navigate({ to: '/dashboard/buying/material-requests' })}
                  >
                    {t('common.cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={createMaterialRequestMutation.isPending}
                  >
                    {createMaterialRequestMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        {t('common.saving', 'جاري الحفظ...')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" aria-hidden="true" />
                        {t('buying.saveMaterialRequest', 'حفظ الطلب')}
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
