/**
 * Create Work Order View
 * Form for creating new work orders
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Save,
  X,
  Package,
  Calendar,
  Warehouse,
  AlertCircle,
  ClipboardList,
  Cog,
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

import { useCreateWorkOrder, useBOMs } from '@/hooks/use-manufacturing'
import { useItems, useWarehouses } from '@/hooks/use-inventory'
import type { CreateWorkOrderData } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'manufacturing.createWorkOrder', href: '/dashboard/manufacturing/work-orders/create' },
]

type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'
type WorkOrderDraftStatus = 'draft' | 'submitted'

export function CreateWorkOrderView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createWorkOrderMutation = useCreateWorkOrder()
  const { data: bomsResponse } = useBOMs({ isActive: true })
  const { data: itemsResponse } = useItems({ itemType: 'product' })
  const { data: warehousesResponse } = useWarehouses()

  // Extract data from responses
  const boms = bomsResponse?.boms || []
  const items = itemsResponse?.items || []
  const warehouses = warehousesResponse?.warehouses || []

  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    bomId: '',
    qty: 1,
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: '',
    targetWarehouse: '',
    sourceWarehouse: '',
    priority: 'medium' as WorkOrderPriority,
    status: 'draft' as WorkOrderDraftStatus,
    remarks: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedBom, setSelectedBom] = useState<any>(null)

  // Get available BOMs for selected item
  const availableBoms = formData.itemId
    ? boms.filter((bom) => bom.itemId === formData.itemId)
    : []

  // Auto-select BOM if there's only one or a default
  useEffect(() => {
    if (availableBoms.length === 1) {
      handleChange('bomId', availableBoms[0]._id)
    } else if (availableBoms.length > 1) {
      const defaultBom = availableBoms.find((bom) => bom.isDefault)
      if (defaultBom) {
        handleChange('bomId', defaultBom._id)
      }
    }
  }, [formData.itemId, availableBoms.length])

  // Load selected BOM details
  useEffect(() => {
    if (formData.bomId) {
      const bom = boms.find((b) => b._id === formData.bomId)
      setSelectedBom(bom || null)
    } else {
      setSelectedBom(null)
    }
  }, [formData.bomId, boms])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemId) {
      newErrors.itemId = t('manufacturing.validation.itemRequired', 'صنف الإنتاج مطلوب')
    }
    if (!formData.bomId) {
      newErrors.bomId = t('manufacturing.validation.bomRequired', 'قائمة المواد مطلوبة')
    }
    if (!formData.qty || formData.qty <= 0) {
      newErrors.qty = t('manufacturing.validation.qtyPositive', 'الكمية يجب أن تكون أكبر من صفر')
    }
    if (!formData.plannedStartDate) {
      newErrors.plannedStartDate = t('manufacturing.validation.startDateRequired', 'تاريخ البدء مطلوب')
    }
    if (!formData.targetWarehouse) {
      newErrors.targetWarehouse = t('manufacturing.validation.warehouseRequired', 'المستودع المستهدف مطلوب')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const workOrderData: CreateWorkOrderData = {
      itemId: formData.itemId,
      bomId: formData.bomId,
      qty: formData.qty,
      plannedStartDate: formData.plannedStartDate,
      plannedEndDate: formData.plannedEndDate || undefined,
      targetWarehouse: formData.targetWarehouse,
      sourceWarehouse: formData.sourceWarehouse || undefined,
      remarks: formData.remarks || undefined,
    }

    try {
      await createWorkOrderMutation.mutateAsync(workOrderData)
      navigate({ to: '/dashboard/manufacturing' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Calculate required quantities based on BOM and quantity
  const calculateRequiredQty = (bomItemQty: number) => {
    return bomItemQty * formData.qty
  }

  const getPriorityBadge = (priority: WorkOrderPriority) => {
    const variants = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    }
    const labels = {
      low: t('manufacturing.priority.low', 'منخفضة'),
      medium: t('manufacturing.priority.medium', 'متوسطة'),
      high: t('manufacturing.priority.high', 'عالية'),
      urgent: t('manufacturing.priority.urgent', 'عاجلة'),
    }
    return (
      <Badge className={variants[priority]}>{labels[priority]}</Badge>
    )
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
          title={t('manufacturing.createWorkOrder', 'إنشاء أمر عمل')}
          type="manufacturing"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Production Item & BOM */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.productionItem', 'صنف الإنتاج')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemId">
                        {t('manufacturing.item', 'الصنف')} *
                      </Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(v) => {
                          handleChange('itemId', v)
                          handleChange('bomId', '') // Reset BOM when item changes
                        }}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.itemId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('manufacturing.selectItem', 'اختر الصنف')} />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.nameAr || item.name} ({item.itemCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.itemId && (
                        <p className="text-sm text-red-500">{errors.itemId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bomId">
                        {t('manufacturing.bom', 'قائمة المواد')} *
                      </Label>
                      <Select
                        value={formData.bomId}
                        onValueChange={(v) => handleChange('bomId', v)}
                        disabled={!formData.itemId || availableBoms.length === 0}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.bomId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('manufacturing.selectBom', 'اختر قائمة المواد')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBoms.map((bom) => (
                            <SelectItem key={bom._id} value={bom._id}>
                              {bom.bomNumber} {bom.isDefault && `(${t('manufacturing.default', 'افتراضي')})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.bomId && (
                        <p className="text-sm text-red-500">{errors.bomId}</p>
                      )}
                      {formData.itemId && availableBoms.length === 0 && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {t('manufacturing.noBomAvailable', 'لا توجد قائمة مواد متاحة لهذا الصنف')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qty">
                      {t('manufacturing.quantity', 'الكمية المطلوب تصنيعها')} *
                    </Label>
                    <Input
                      id="qty"
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={formData.qty}
                      onChange={(e) => handleChange('qty', parseFloat(e.target.value) || 0)}
                      className={`rounded-xl ${errors.qty ? 'border-red-500' : ''}`}
                    />
                    {errors.qty && (
                      <p className="text-sm text-red-500">{errors.qty}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.schedule', 'الجدولة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plannedStartDate">
                        {t('manufacturing.startDate', 'تاريخ البدء')} *
                      </Label>
                      <Input
                        id="plannedStartDate"
                        type="date"
                        value={formData.plannedStartDate}
                        onChange={(e) => handleChange('plannedStartDate', e.target.value)}
                        className={`rounded-xl ${errors.plannedStartDate ? 'border-red-500' : ''}`}
                      />
                      {errors.plannedStartDate && (
                        <p className="text-sm text-red-500">{errors.plannedStartDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plannedEndDate">
                        {t('manufacturing.endDate', 'تاريخ الانتهاء')}
                      </Label>
                      <Input
                        id="plannedEndDate"
                        type="date"
                        value={formData.plannedEndDate}
                        onChange={(e) => handleChange('plannedEndDate', e.target.value)}
                        min={formData.plannedStartDate}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        {t('manufacturing.priority', 'الأولوية')}
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => handleChange('priority', v as WorkOrderPriority)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('manufacturing.priority.low', 'منخفضة')}</SelectItem>
                          <SelectItem value="medium">{t('manufacturing.priority.medium', 'متوسطة')}</SelectItem>
                          <SelectItem value="high">{t('manufacturing.priority.high', 'عالية')}</SelectItem>
                          <SelectItem value="urgent">{t('manufacturing.priority.urgent', 'عاجلة')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">
                        {t('manufacturing.status', 'الحالة')}
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => handleChange('status', v as WorkOrderDraftStatus)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{t('manufacturing.status.draft', 'مسودة')}</SelectItem>
                          <SelectItem value="submitted">{t('manufacturing.status.submitted', 'مقدم')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouses */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.warehouses', 'المستودعات')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetWarehouse">
                        {t('manufacturing.targetWarehouse', 'المستودع المستهدف')} *
                      </Label>
                      <Select
                        value={formData.targetWarehouse}
                        onValueChange={(v) => handleChange('targetWarehouse', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.targetWarehouse ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('manufacturing.selectWarehouse', 'اختر المستودع')} />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse._id} value={warehouse._id}>
                              {warehouse.nameAr || warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.targetWarehouse && (
                        <p className="text-sm text-red-500">{errors.targetWarehouse}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sourceWarehouse">
                        {t('manufacturing.sourceWarehouse', 'مستودع المواد الخام')}
                      </Label>
                      <Select
                        value={formData.sourceWarehouse}
                        onValueChange={(v) => handleChange('sourceWarehouse', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('manufacturing.selectWarehouse', 'اختر المستودع')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('common.none', 'بدون')}</SelectItem>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse._id} value={warehouse._id}>
                              {warehouse.nameAr || warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BOM Items */}
              {selectedBom && selectedBom.items && selectedBom.items.length > 0 && (
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-emerald-600" />
                      {t('manufacturing.bomItems', 'مكونات قائمة المواد')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('manufacturing.itemCode', 'رمز الصنف')}</TableHead>
                            <TableHead>{t('manufacturing.itemName', 'اسم الصنف')}</TableHead>
                            <TableHead className="text-center">{t('manufacturing.bomQty', 'كمية القائمة')}</TableHead>
                            <TableHead className="text-center">{t('manufacturing.requiredQty', 'الكمية المطلوبة')}</TableHead>
                            <TableHead>{t('manufacturing.uom', 'الوحدة')}</TableHead>
                            <TableHead>{t('manufacturing.sourceWarehouse', 'المستودع')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBom.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell className="text-center font-medium">{item.qty}</TableCell>
                              <TableCell className="text-center font-bold text-emerald-600">
                                {calculateRequiredQty(item.qty)}
                              </TableCell>
                              <TableCell>{item.uom}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.sourceWarehouse || formData.sourceWarehouse || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operations */}
              {selectedBom && selectedBom.operations && selectedBom.operations.length > 0 && (
                <Card className="rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="w-5 h-5 text-emerald-600" />
                      {t('manufacturing.operations', 'العمليات')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('manufacturing.sequence', 'التسلسل')}</TableHead>
                            <TableHead>{t('manufacturing.operation', 'العملية')}</TableHead>
                            <TableHead>{t('manufacturing.workstation', 'محطة العمل')}</TableHead>
                            <TableHead className="text-center">{t('manufacturing.estimatedTime', 'الوقت المقدر (دقيقة)')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBom.operations
                            .sort((a: any, b: any) => a.sequence - b.sequence)
                            .map((operation: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{operation.sequence}</TableCell>
                                <TableCell>
                                  {operation.operationAr || operation.operation}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {operation.workstation || '-'}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  {operation.timeInMins}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('manufacturing.notes', 'ملاحظات')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    placeholder={t('manufacturing.notesPlaceholder', 'أضف ملاحظات إضافية...')}
                    className="rounded-xl min-h-24"
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/manufacturing' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createWorkOrderMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createWorkOrderMutation.isPending
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
