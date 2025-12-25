/**
 * Create BOM (Bill of Materials) View
 * Form for creating new BOMs with raw materials and operations
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Layers,
  Save,
  X,
  Package,
  Plus,
  Trash2,
  Calculator,
  Cog,
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
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

import { useCreateBOM, useWorkstations } from '@/hooks/use-manufacturing'
import { useItems, useUnitsOfMeasure } from '@/hooks/use-inventory'
import type { CreateBomData, BomType, BomItem, BomOperation } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'manufacturing.boms', href: '/dashboard/manufacturing/bom' },
  { title: 'manufacturing.createBom', href: '/dashboard/manufacturing/bom/create' },
]

interface RawMaterialRow extends Omit<BomItem, '_id'> {
  id: string
  scrapPercentage?: number
}

interface OperationRow extends Omit<BomOperation, '_id'> {
  id: string
}

export function CreateBOMView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createBOMMutation = useCreateBOM()
  const { data: itemsResponse } = useItems()
  const { data: uomsResponse } = useUnitsOfMeasure()
  const { data: workstationsResponse } = useWorkstations({ status: 'active' })

  // Extract data from responses
  const items = itemsResponse?.items || []
  const uoms = uomsResponse?.uoms || []
  const workstations = workstationsResponse?.workstations || []

  // Form state
  const [formData, setFormData] = useState({
    itemId: '',
    bomType: 'standard' as BomType,
    quantity: 1,
    uom: '',
    isDefault: false,
    isActive: true,
    remarks: '',
  })

  const [rawMaterials, setRawMaterials] = useState<RawMaterialRow[]>([])
  const [operations, setOperations] = useState<OperationRow[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Auto-fill UOM when item is selected
  useEffect(() => {
    if (formData.itemId) {
      const item = items.find((i) => i._id === formData.itemId)
      setSelectedItem(item || null)
      if (item?.stockUom) {
        handleChange('uom', item.stockUom)
      }
    } else {
      setSelectedItem(null)
    }
  }, [formData.itemId, items])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // ==================== RAW MATERIALS MANAGEMENT ====================

  const addRawMaterial = () => {
    const newRow: RawMaterialRow = {
      id: `rm_${Date.now()}_${Math.random()}`,
      itemId: '',
      itemCode: '',
      itemName: '',
      qty: 1,
      uom: '',
      rate: 0,
      amount: 0,
      sourceWarehouse: '',
      scrapPercentage: 0,
      includeInManufacturing: true,
    }
    setRawMaterials([...rawMaterials, newRow])
  }

  const removeRawMaterial = (id: string) => {
    setRawMaterials(rawMaterials.filter((rm) => rm.id !== id))
  }

  const updateRawMaterial = (id: string, field: keyof RawMaterialRow, value: any) => {
    setRawMaterials((prev) =>
      prev.map((rm) => {
        if (rm.id !== id) return rm

        const updated = { ...rm, [field]: value }

        // Auto-fill item details when item is selected
        if (field === 'itemId') {
          const item = items.find((i) => i._id === value)
          if (item) {
            updated.itemCode = item.itemCode || ''
            updated.itemName = item.nameAr || item.name || ''
            updated.uom = item.stockUom || ''
            updated.rate = item.valuationRate || item.standardRate || 0
          }
        }

        // Auto-calculate amount
        if (field === 'qty' || field === 'rate') {
          updated.amount = (updated.qty || 0) * (updated.rate || 0)
        }

        return updated
      })
    )
  }

  const getTotalRawMaterialCost = () => {
    return rawMaterials.reduce((sum, rm) => sum + (rm.amount || 0), 0)
  }

  // ==================== OPERATIONS MANAGEMENT ====================

  const addOperation = () => {
    const newRow: OperationRow = {
      id: `op_${Date.now()}_${Math.random()}`,
      operation: '',
      operationAr: '',
      workstation: '',
      timeInMins: 0,
      operatingCost: 0,
      description: '',
      sequence: operations.length + 1,
    }
    setOperations([...operations, newRow])
  }

  const removeOperation = (id: string) => {
    setOperations((prev) => {
      const filtered = prev.filter((op) => op.id !== id)
      // Resequence
      return filtered.map((op, index) => ({ ...op, sequence: index + 1 }))
    })
  }

  const updateOperation = (id: string, field: keyof OperationRow, value: any) => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id !== id) return op

        const updated = { ...op, [field]: value }

        // Auto-calculate operating cost based on workstation hourly rate
        if (field === 'workstation' || field === 'timeInMins') {
          const workstation = workstations.find((w) => w._id === updated.workstation)
          if (workstation && workstation.hourRate) {
            updated.operatingCost = ((updated.timeInMins || 0) / 60) * workstation.hourRate
          }
        }

        return updated
      })
    )
  }

  const getTotalOperatingCost = () => {
    return operations.reduce((sum, op) => sum + (op.operatingCost || 0), 0)
  }

  const getTotalCostPerUnit = () => {
    const rawMaterialCost = getTotalRawMaterialCost()
    const operatingCost = getTotalOperatingCost()
    const totalCost = rawMaterialCost + operatingCost
    return formData.quantity > 0 ? totalCost / formData.quantity : 0
  }

  // ==================== VALIDATION & SUBMIT ====================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemId) {
      newErrors.itemId = t('manufacturing.validation.itemRequired', 'الصنف مطلوب')
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t('manufacturing.validation.qtyPositive', 'الكمية يجب أن تكون أكبر من صفر')
    }
    if (!formData.uom) {
      newErrors.uom = t('manufacturing.validation.uomRequired', 'وحدة القياس مطلوبة')
    }
    if (rawMaterials.length === 0) {
      newErrors.rawMaterials = t('manufacturing.validation.rawMaterialsRequired', 'يجب إضافة مادة خام واحدة على الأقل')
    }

    // Validate raw materials
    rawMaterials.forEach((rm, index) => {
      if (!rm.itemId) {
        newErrors[`rawMaterial_${index}_item`] = t('manufacturing.validation.itemRequired', 'الصنف مطلوب')
      }
      if (!rm.qty || rm.qty <= 0) {
        newErrors[`rawMaterial_${index}_qty`] = t('manufacturing.validation.qtyPositive', 'الكمية يجب أن تكون أكبر من صفر')
      }
    })

    // Validate operations
    operations.forEach((op, index) => {
      if (!op.operation) {
        newErrors[`operation_${index}_name`] = t('manufacturing.validation.operationNameRequired', 'اسم العملية مطلوب')
      }
      if (!op.timeInMins || op.timeInMins <= 0) {
        newErrors[`operation_${index}_time`] = t('manufacturing.validation.timeRequired', 'الوقت مطلوب')
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const bomData: CreateBomData = {
      itemId: formData.itemId,
      bomType: formData.bomType,
      quantity: formData.quantity,
      uom: formData.uom,
      items: rawMaterials.map(({ id, scrapPercentage, ...rest }) => rest),
      operations: operations.length > 0 ? operations.map(({ id, ...rest }) => rest) : undefined,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
      remarks: formData.remarks || undefined,
    }

    try {
      await createBOMMutation.mutateAsync(bomData)
      navigate({ to: '/dashboard/manufacturing/bom' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const getBomTypeBadge = (type: BomType) => {
    const variants = {
      standard: 'bg-emerald-100 text-emerald-700',
      template: 'bg-blue-100 text-blue-700',
      subcontract: 'bg-purple-100 text-purple-700',
    }
    const labels = {
      standard: t('manufacturing.bomType.standard', 'قياسي'),
      template: t('manufacturing.bomType.template', 'قالب'),
      subcontract: t('manufacturing.bomType.subcontract', 'مقاول باطن'),
    }
    return (
      <Badge className={variants[type]}>{labels[type]}</Badge>
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
          title={t('manufacturing.createBom', 'إنشاء قائمة مواد')}
          type="manufacturing"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Information */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    {t('manufacturing.bomHeader', 'معلومات القائمة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemId">
                        {t('manufacturing.itemToManufacture', 'الصنف المراد تصنيعه')} *
                      </Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(v) => handleChange('itemId', v)}
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
                      <Label htmlFor="bomType">
                        {t('manufacturing.bomType', 'نوع القائمة')}
                      </Label>
                      <Select
                        value={formData.bomType}
                        onValueChange={(v) => handleChange('bomType', v as BomType)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">
                            {t('manufacturing.bomType.standard', 'قياسي')}
                          </SelectItem>
                          <SelectItem value="template">
                            {t('manufacturing.bomType.template', 'قالب')}
                          </SelectItem>
                          <SelectItem value="subcontract">
                            {t('manufacturing.bomType.subcontract', 'مقاول باطن')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        {t('manufacturing.quantity', 'الكمية')} *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                        className={`rounded-xl ${errors.quantity ? 'border-red-500' : ''}`}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-500">{errors.quantity}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uom">
                        {t('manufacturing.uom', 'وحدة القياس')} *
                      </Label>
                      <Select
                        value={formData.uom}
                        onValueChange={(v) => handleChange('uom', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.uom ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('manufacturing.selectUom', 'اختر الوحدة')} />
                        </SelectTrigger>
                        <SelectContent>
                          {uoms.map((uom) => (
                            <SelectItem key={uom._id} value={uom.name}>
                              {uom.nameAr || uom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.uom && (
                        <p className="text-sm text-red-500">{errors.uom}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="space-y-0.5">
                        <Label htmlFor="isDefault">
                          {t('manufacturing.isDefaultBom', 'قائمة افتراضية')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('manufacturing.isDefaultBomDesc', 'استخدام كقائمة افتراضية للصنف')}
                        </p>
                      </div>
                      <Switch
                        id="isDefault"
                        checked={formData.isDefault}
                        onCheckedChange={(checked) => handleChange('isDefault', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive">
                          {t('manufacturing.isActive', 'نشط')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('manufacturing.isActiveDesc', 'القائمة متاحة للاستخدام')}
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleChange('isActive', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Materials Table */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-600" />
                      {t('manufacturing.rawMaterials', 'المواد الخام')}
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={addRawMaterial}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.addItem', 'إضافة مادة')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {errors.rawMaterials && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.rawMaterials}</AlertDescription>
                    </Alert>
                  )}
                  {rawMaterials.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('manufacturing.noRawMaterials', 'لم يتم إضافة مواد خام بعد')}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">{t('manufacturing.item', 'الصنف')}</TableHead>
                            <TableHead>{t('manufacturing.description', 'الوصف')}</TableHead>
                            <TableHead className="w-[100px] text-center">{t('manufacturing.qty', 'الكمية')}</TableHead>
                            <TableHead className="w-[100px]">{t('manufacturing.uom', 'الوحدة')}</TableHead>
                            <TableHead className="w-[100px] text-center">{t('manufacturing.rate', 'السعر')}</TableHead>
                            <TableHead className="w-[100px] text-center">{t('manufacturing.amount', 'المبلغ')}</TableHead>
                            <TableHead className="w-[100px] text-center">{t('manufacturing.scrap', 'التالف %')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rawMaterials.map((rm, index) => (
                            <TableRow key={rm.id}>
                              <TableCell>
                                <Select
                                  value={rm.itemId}
                                  onValueChange={(v) => updateRawMaterial(rm.id, 'itemId', v)}
                                >
                                  <SelectTrigger className={`rounded-lg h-9 ${errors[`rawMaterial_${index}_item`] ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder={t('common.select', 'اختر')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {items
                                      .filter((item) => item._id !== formData.itemId)
                                      .map((item) => (
                                        <SelectItem key={item._id} value={item._id}>
                                          {item.itemCode}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {rm.itemName || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0.001"
                                  step="0.001"
                                  value={rm.qty}
                                  onChange={(e) =>
                                    updateRawMaterial(rm.id, 'qty', parseFloat(e.target.value) || 0)
                                  }
                                  className={`rounded-lg h-9 text-center ${errors[`rawMaterial_${index}_qty`] ? 'border-red-500' : ''}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{rm.uom || '-'}</div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={rm.rate || 0}
                                  onChange={(e) =>
                                    updateRawMaterial(rm.id, 'rate', parseFloat(e.target.value) || 0)
                                  }
                                  className="rounded-lg h-9 text-center"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-center">
                                  {(rm.amount || 0).toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={rm.scrapPercentage || 0}
                                  onChange={(e) =>
                                    updateRawMaterial(rm.id, 'scrapPercentage', parseFloat(e.target.value) || 0)
                                  }
                                  className="rounded-lg h-9 text-center"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRawMaterial(rm.id)}
                                  className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Operations Table */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Cog className="w-5 h-5 text-emerald-600" />
                      {t('manufacturing.operations', 'العمليات')}
                      <Badge variant="outline" className="mr-2">
                        {t('manufacturing.optional', 'اختياري')}
                      </Badge>
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={addOperation}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('manufacturing.addOperation', 'إضافة عملية')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {operations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Cog className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('manufacturing.noOperations', 'لم يتم إضافة عمليات بعد')}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px] text-center">#</TableHead>
                            <TableHead className="w-[200px]">{t('manufacturing.operationName', 'اسم العملية')}</TableHead>
                            <TableHead className="w-[180px]">{t('manufacturing.workstation', 'محطة العمل')}</TableHead>
                            <TableHead className="w-[120px] text-center">{t('manufacturing.timeInMins', 'الوقت (دقيقة)')}</TableHead>
                            <TableHead className="w-[120px] text-center">{t('manufacturing.operatingCost', 'تكلفة العملية')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {operations.map((op, index) => (
                            <TableRow key={op.id}>
                              <TableCell className="text-center font-medium">
                                {op.sequence}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={op.operationAr || op.operation}
                                  onChange={(e) => {
                                    updateOperation(op.id, 'operationAr', e.target.value)
                                    updateOperation(op.id, 'operation', e.target.value)
                                  }}
                                  placeholder={t('manufacturing.operationNamePlaceholder', 'اسم العملية')}
                                  className={`rounded-lg h-9 ${errors[`operation_${index}_name`] ? 'border-red-500' : ''}`}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={op.workstation || ''}
                                  onValueChange={(v) => updateOperation(op.id, 'workstation', v)}
                                >
                                  <SelectTrigger className="rounded-lg h-9">
                                    <SelectValue placeholder={t('common.select', 'اختر')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workstations.map((ws) => (
                                      <SelectItem key={ws._id} value={ws._id}>
                                        {ws.nameAr || ws.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={op.timeInMins}
                                  onChange={(e) =>
                                    updateOperation(op.id, 'timeInMins', parseFloat(e.target.value) || 0)
                                  }
                                  className={`rounded-lg h-9 text-center ${errors[`operation_${index}_time`] ? 'border-red-500' : ''}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-center">
                                  {(op.operatingCost || 0).toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOperation(op.id)}
                                  className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Totals */}
              <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Calculator className="w-5 h-5" />
                    {t('manufacturing.costSummary', 'ملخص التكاليف')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('manufacturing.totalRawMaterialCost', 'تكلفة المواد الخام')}
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {getTotalRawMaterialCost().toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('common.sar', 'ريال سعودي')}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('manufacturing.totalOperatingCost', 'تكلفة العمليات')}
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {getTotalOperatingCost().toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('common.sar', 'ريال سعودي')}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white border-2 border-emerald-300">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('manufacturing.totalCostPerUnit', 'التكلفة الكلية للوحدة')}
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {getTotalCostPerUnit().toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('common.sar', 'ريال سعودي')} / {formData.uom || t('common.unit', 'وحدة')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remarks */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('manufacturing.remarks', 'ملاحظات')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    placeholder={t('manufacturing.remarksPlaceholder', 'أضف ملاحظات إضافية...')}
                    className="rounded-xl min-h-24"
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/manufacturing/bom' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createBOMMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createBOMMutation.isPending
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
