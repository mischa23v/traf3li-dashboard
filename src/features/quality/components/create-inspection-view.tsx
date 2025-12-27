/**
 * Create Quality Inspection View
 * Form for creating new quality inspections
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Package,
  User,
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

import { useCreateInspection, useTemplates } from '@/hooks/use-quality'
import { useItems } from '@/hooks/use-inventory'
import { useStaff } from '@/hooks/useStaff'
import type {
  CreateQualityInspectionData,
  InspectionType,
  QualityInspectionReading,
  ReadingStatus
} from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'quality.quality', href: ROUTES.dashboard.quality.list },
  { title: 'quality.createInspection', href: ROUTES.dashboard.quality.create },
]

const REFERENCE_TYPES = [
  { value: 'purchase_receipt', translationKey: 'quality.referenceType.purchaseReceipt' },
  { value: 'delivery_note', translationKey: 'quality.referenceType.deliveryNote' },
  { value: 'stock_entry', translationKey: 'quality.referenceType.stockEntry' },
  { value: 'production', translationKey: 'quality.referenceType.production' },
] as const

const INSPECTION_TYPES: { value: InspectionType; translationKey: string }[] = [
  { value: 'incoming', translationKey: 'quality.type.incoming' },
  { value: 'outgoing', translationKey: 'quality.type.outgoing' },
  { value: 'in_process', translationKey: 'quality.type.inProcess' },
]

export function CreateInspectionView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createInspectionMutation = useCreateInspection()
  const { data: templates } = useTemplates()
  const { data: itemsData } = useItems()
  const { data: staffData } = useStaff()

  // Form state
  const [formData, setFormData] = useState<CreateQualityInspectionData>({
    referenceType: 'purchase_receipt',
    referenceId: '',
    itemId: '',
    batchNo: '',
    inspectionType: 'incoming',
    sampleSize: 1,
    templateId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    readings: [],
    remarks: '',
  })

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [inspectedBy, setInspectedBy] = useState('')

  // Load template readings when template is selected
  useEffect(() => {
    if (formData.templateId && templates) {
      const template = templates.find((t) => t._id === formData.templateId)
      if (template) {
        setSelectedTemplate(template)
        // Initialize readings from template
        const newReadings: Omit<QualityInspectionReading, '_id'>[] = template.readings.map((r) => ({
          parameterName: r.parameterName,
          parameterNameAr: r.parameterNameAr,
          specification: r.specification,
          acceptanceCriteria: r.acceptanceCriteria,
          minValue: r.minValue,
          maxValue: r.maxValue,
          value: undefined,
          status: 'accepted' as ReadingStatus,
          remarks: '',
        }))
        setFormData((prev) => ({ ...prev, readings: newReadings }))
      }
    } else {
      setSelectedTemplate(null)
      setFormData((prev) => ({ ...prev, readings: [] }))
    }
  }, [formData.templateId, templates])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.referenceId.trim()) {
      newErrors.referenceId = t('quality.validation.referenceRequired', 'رقم المرجع مطلوب')
    }
    if (!formData.itemId) {
      newErrors.itemId = t('quality.validation.itemRequired', 'الصنف مطلوب')
    }
    if (!formData.inspectionDate) {
      newErrors.inspectionDate = t('quality.validation.dateRequired', 'تاريخ الفحص مطلوب')
    }
    if (formData.sampleSize < 1) {
      newErrors.sampleSize = t('quality.validation.sampleSizePositive', 'حجم العينة يجب أن يكون موجبًا')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await createInspectionMutation.mutateAsync(formData)
      navigate({ to: ROUTES.dashboard.quality.list })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof CreateQualityInspectionData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleReadingChange = (index: number, field: keyof QualityInspectionReading, value: any) => {
    const newReadings = [...(formData.readings || [])]
    newReadings[index] = { ...newReadings[index], [field]: value }

    // Auto-calculate status based on min/max values
    if (field === 'value' && typeof value === 'number') {
      const reading = newReadings[index]
      if (reading.minValue !== undefined && value < reading.minValue) {
        newReadings[index].status = 'rejected'
      } else if (reading.maxValue !== undefined && value > reading.maxValue) {
        newReadings[index].status = 'rejected'
      } else {
        newReadings[index].status = 'accepted'
      }
    }

    setFormData((prev) => ({ ...prev, readings: newReadings }))
  }

  const addReading = () => {
    const newReading: Omit<QualityInspectionReading, '_id'> = {
      parameterName: '',
      parameterNameAr: '',
      specification: '',
      acceptanceCriteria: '',
      value: undefined,
      status: 'accepted',
      remarks: '',
    }
    setFormData((prev) => ({
      ...prev,
      readings: [...(prev.readings || []), newReading],
    }))
  }

  const removeReading = (index: number) => {
    const newReadings = [...(formData.readings || [])]
    newReadings.splice(index, 1)
    setFormData((prev) => ({ ...prev, readings: newReadings }))
  }

  const items = itemsData?.items || itemsData?.data || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.createInspection', 'إنشاء فحص جودة')}
          type="quality"
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    {t('quality.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referenceType">{t('quality.referenceType', 'نوع المرجع')} *</Label>
                      <Select
                        value={formData.referenceType}
                        onValueChange={(v) => handleChange('referenceType', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REFERENCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {t(type.translationKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referenceId">{t('quality.referenceNumber', 'رقم المرجع')} *</Label>
                      <Input
                        id="referenceId"
                        value={formData.referenceId}
                        onChange={(e) => handleChange('referenceId', e.target.value)}
                        placeholder="PR-00001"
                        className={`rounded-xl ${errors.referenceId ? 'border-red-500' : ''}`}
                      />
                      {errors.referenceId && (
                        <p className="text-sm text-red-500">{errors.referenceId}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemId">{t('quality.item', 'الصنف')} *</Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(v) => handleChange('itemId', v)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.itemId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder={t('quality.selectItem', 'اختر الصنف')} />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.itemCode} - {item.nameAr || item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.itemId && (
                        <p className="text-sm text-red-500">{errors.itemId}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchNo">{t('quality.batchNo', 'رقم الدفعة')}</Label>
                      <Input
                        id="batchNo"
                        value={formData.batchNo}
                        onChange={(e) => handleChange('batchNo', e.target.value)}
                        placeholder="BATCH-001"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inspectionType">{t('quality.inspectionType', 'نوع الفحص')} *</Label>
                      <Select
                        value={formData.inspectionType}
                        onValueChange={(v) => handleChange('inspectionType', v as InspectionType)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INSPECTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {t(type.translationKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sampleSize">{t('quality.sampleSize', 'حجم العينة')} *</Label>
                      <Input
                        id="sampleSize"
                        type="number"
                        min="1"
                        value={formData.sampleSize}
                        onChange={(e) => handleChange('sampleSize', parseInt(e.target.value) || 1)}
                        className={`rounded-xl ${errors.sampleSize ? 'border-red-500' : ''}`}
                      />
                      {errors.sampleSize && (
                        <p className="text-sm text-red-500">{errors.sampleSize}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inspectionDate">{t('quality.inspectionDate', 'تاريخ الفحص')} *</Label>
                      <Input
                        id="inspectionDate"
                        type="date"
                        value={formData.inspectionDate}
                        onChange={(e) => handleChange('inspectionDate', e.target.value)}
                        className={`rounded-xl ${errors.inspectionDate ? 'border-red-500' : ''}`}
                      />
                      {errors.inspectionDate && (
                        <p className="text-sm text-red-500">{errors.inspectionDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateId">{t('quality.inspectionTemplate', 'قالب الفحص')}</Label>
                      <Select
                        value={formData.templateId}
                        onValueChange={(v) => handleChange('templateId', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('quality.selectTemplate', 'اختر قالب (اختياري)')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t('quality.noTemplate', 'بدون قالب')}
                          </SelectItem>
                          {templates?.map((template) => (
                            <SelectItem key={template._id} value={template._id}>
                              {template.nameAr || template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inspectedBy">{t('quality.inspector', 'المفتش')}</Label>
                      <Select
                        value={inspectedBy}
                        onValueChange={(v) => setInspectedBy(v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('quality.selectInspector', 'اختر المفتش')} />
                        </SelectTrigger>
                        <SelectContent>
                          {staffData?.map((staff: any) => (
                            <SelectItem key={staff._id} value={staff._id}>
                              {staff.firstName} {staff.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Readings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      {t('quality.inspectionReadings', 'قراءات الفحص')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addReading}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('quality.addReading', 'إضافة قراءة')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate && (
                    <Alert className="mb-4 rounded-xl">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        {t('quality.templateApplied', 'تم تطبيق قالب')}: <strong>{selectedTemplate.nameAr || selectedTemplate.name}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {formData.readings && formData.readings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('quality.parameter', 'المعيار')}</TableHead>
                            <TableHead>{t('quality.specification', 'المواصفة')}</TableHead>
                            <TableHead>{t('quality.minValue', 'الحد الأدنى')}</TableHead>
                            <TableHead>{t('quality.maxValue', 'الحد الأقصى')}</TableHead>
                            <TableHead>{t('quality.actualReading', 'القراءة الفعلية')}</TableHead>
                            <TableHead>{t('quality.status', 'الحالة')}</TableHead>
                            <TableHead>{t('quality.remarks', 'ملاحظات')}</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.readings.map((reading, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  value={reading.parameterNameAr || reading.parameterName}
                                  onChange={(e) =>
                                    handleReadingChange(index, 'parameterNameAr', e.target.value)
                                  }
                                  placeholder={t('quality.parameterName', 'اسم المعيار')}
                                  className="rounded-lg min-w-[150px]"
                                  dir="rtl"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={reading.specification || ''}
                                  onChange={(e) =>
                                    handleReadingChange(index, 'specification', e.target.value)
                                  }
                                  placeholder={t('quality.specificationPlaceholder', 'المواصفة')}
                                  className="rounded-lg min-w-[120px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={reading.minValue ?? ''}
                                  onChange={(e) =>
                                    handleReadingChange(
                                      index,
                                      'minValue',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="0"
                                  className="rounded-lg w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={reading.maxValue ?? ''}
                                  onChange={(e) =>
                                    handleReadingChange(
                                      index,
                                      'maxValue',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="100"
                                  className="rounded-lg w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={typeof reading.value === 'number' ? reading.value : ''}
                                  onChange={(e) =>
                                    handleReadingChange(
                                      index,
                                      'value',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="0"
                                  className="rounded-lg w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={reading.status}
                                  onValueChange={(v: ReadingStatus) =>
                                    handleReadingChange(index, 'status', v)
                                  }
                                >
                                  <SelectTrigger className="rounded-lg w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="accepted">
                                      <Badge className="bg-emerald-500">
                                        {t('quality.accepted', 'مقبول')}
                                      </Badge>
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      <Badge className="bg-red-500">
                                        {t('quality.rejected', 'مرفوض')}
                                      </Badge>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={reading.remarks || ''}
                                  onChange={(e) =>
                                    handleReadingChange(index, 'remarks', e.target.value)
                                  }
                                  placeholder={t('quality.remarksPlaceholder', 'ملاحظات')}
                                  className="rounded-lg min-w-[120px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReading(index)}
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
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('quality.noReadings', 'لا توجد قراءات بعد')}</p>
                      <p className="text-sm">
                        {t('quality.addReadingHint', 'اضغط "إضافة قراءة" أو اختر قالب فحص')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle>{t('quality.notes', 'الملاحظات')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="remarks">{t('quality.remarks', 'ملاحظات')}</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      placeholder={t('quality.remarksPlaceholder', 'أي ملاحظات إضافية...')}
                      className="rounded-xl min-h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: ROUTES.dashboard.quality.list })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createInspectionMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createInspectionMutation.isPending
                    ? t('common.saving', 'جاري الحفظ...')
                    : t('common.save', 'حفظ')}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <QualitySidebar />
          </div>
        </form>
      </Main>
    </>
  )
}
