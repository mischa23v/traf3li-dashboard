/**
 * Create Quality Inspection Template View
 * Form for creating new quality inspection templates
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Save,
  X,
  Plus,
  Trash2,
  ClipboardCheck,
  Settings,
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

import { useCreateTemplate } from '@/hooks/use-quality'
import { useItemGroups } from '@/hooks/use-inventory'
import type { InspectionType } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'quality.quality', href: '/dashboard/quality' },
  { title: 'quality.templates', href: '/dashboard/quality/templates' },
  { title: 'quality.createTemplate', href: '/dashboard/quality/templates/create' },
]

const INSPECTION_TYPES: { value: InspectionType; translationKey: string }[] = [
  { value: 'incoming', translationKey: 'quality.type.incoming' },
  { value: 'outgoing', translationKey: 'quality.type.outgoing' },
  { value: 'in_process', translationKey: 'quality.type.inProcess' },
]

interface TemplateParameter {
  parameterName: string
  parameterNameAr?: string
  specification?: string
  minValue?: number
  maxValue?: number
  isNumeric: boolean
  mandatory: boolean
  acceptanceCriteria?: string
}

interface TemplateFormData {
  name: string
  nameAr?: string
  inspectionType: InspectionType
  itemGroup?: string
  description?: string
  parameters: TemplateParameter[]
  status: 'active' | 'inactive'
}

export function CreateTemplateView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createTemplateMutation = useCreateTemplate()
  const { data: itemGroupsData } = useItemGroups()

  // Form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    nameAr: '',
    inspectionType: 'incoming',
    itemGroup: '',
    description: '',
    parameters: [],
    status: 'active',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('quality.validation.templateNameRequired', 'اسم القالب مطلوب')
    }
    if (!formData.inspectionType) {
      newErrors.inspectionType = t('quality.validation.inspectionTypeRequired', 'نوع الفحص مطلوب')
    }

    // Validate parameters
    if (formData.parameters.length > 0) {
      formData.parameters.forEach((param, index) => {
        if (!param.parameterName.trim() && !param.parameterNameAr?.trim()) {
          newErrors[`parameter_${index}`] = t('quality.validation.parameterNameRequired', 'اسم المعيار مطلوب')
        }
        if (param.isNumeric && param.minValue !== undefined && param.maxValue !== undefined) {
          if (param.minValue > param.maxValue) {
            newErrors[`parameter_range_${index}`] = t('quality.validation.invalidRange', 'الحد الأدنى يجب أن يكون أقل من الحد الأقصى')
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Transform data to match API expectations
      const templateData = {
        name: formData.name,
        nameAr: formData.nameAr,
        inspectionType: formData.inspectionType,
        itemGroup: formData.itemGroup,
        description: formData.description,
        readings: formData.parameters.map(param => ({
          parameterName: param.parameterName,
          parameterNameAr: param.parameterNameAr,
          specification: param.specification,
          minValue: param.isNumeric ? param.minValue : undefined,
          maxValue: param.isNumeric ? param.maxValue : undefined,
          acceptanceCriteria: param.acceptanceCriteria,
          mandatory: param.mandatory,
        })),
        status: formData.status,
      }

      await createTemplateMutation.mutateAsync(templateData as any)
      navigate({ to: '/dashboard/quality/templates' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof TemplateFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const addParameter = () => {
    const newParameter: TemplateParameter = {
      parameterName: '',
      parameterNameAr: '',
      specification: '',
      minValue: undefined,
      maxValue: undefined,
      isNumeric: false,
      mandatory: false,
      acceptanceCriteria: '',
    }
    setFormData((prev) => ({
      ...prev,
      parameters: [...prev.parameters, newParameter],
    }))
  }

  const removeParameter = (index: number) => {
    const newParameters = [...formData.parameters]
    newParameters.splice(index, 1)
    setFormData((prev) => ({ ...prev, parameters: newParameters }))

    // Clear related errors
    const newErrors = { ...errors }
    delete newErrors[`parameter_${index}`]
    delete newErrors[`parameter_range_${index}`]
    setErrors(newErrors)
  }

  const handleParameterChange = (index: number, field: keyof TemplateParameter, value: any) => {
    const newParameters = [...formData.parameters]
    newParameters[index] = { ...newParameters[index], [field]: value }

    // If changing to non-numeric, clear min/max values
    if (field === 'isNumeric' && value === false) {
      newParameters[index].minValue = undefined
      newParameters[index].maxValue = undefined
    }

    setFormData((prev) => ({ ...prev, parameters: newParameters }))

    // Clear related errors
    if (errors[`parameter_${index}`] || errors[`parameter_range_${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`parameter_${index}`]
      delete newErrors[`parameter_range_${index}`]
      setErrors(newErrors)
    }
  }

  const itemGroups = itemGroupsData?.itemGroups || itemGroupsData?.data || []

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.createTemplate', 'إنشاء قالب فحص جودة')}
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
                    <FileText className="w-5 h-5 text-emerald-600" />
                    {t('quality.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('quality.templateNameEn', 'اسم القالب (إنجليزي)')} *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Quality Inspection Template"
                        className={`rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">
                        {t('quality.templateNameAr', 'اسم القالب (عربي)')}
                      </Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                        placeholder="قالب فحص الجودة"
                        className="rounded-xl"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inspectionType">
                        {t('quality.inspectionType', 'نوع الفحص')} *
                      </Label>
                      <Select
                        value={formData.inspectionType}
                        onValueChange={(v) => handleChange('inspectionType', v as InspectionType)}
                      >
                        <SelectTrigger className={`rounded-xl ${errors.inspectionType ? 'border-red-500' : ''}`}>
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
                      {errors.inspectionType && (
                        <p className="text-sm text-red-500">{errors.inspectionType}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemGroup">
                        {t('quality.applyToItemGroup', 'تطبيق على مجموعة الأصناف')}
                      </Label>
                      <Select
                        value={formData.itemGroup}
                        onValueChange={(v) => handleChange('itemGroup', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('quality.selectItemGroup', 'اختر مجموعة (اختياري)')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t('quality.allItemGroups', 'جميع المجموعات')}
                          </SelectItem>
                          {itemGroups.map((group: any) => (
                            <SelectItem key={group._id} value={group._id}>
                              {group.nameAr || group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('quality.description', 'الوصف')}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('quality.descriptionPlaceholder', 'وصف القالب...')}
                      className="rounded-xl min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Parameters */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                      {t('quality.inspectionParameters', 'معايير الفحص')}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParameter}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      {t('quality.addParameter', 'إضافة معيار')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.parameters.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">
                              {t('quality.parameterName', 'اسم المعيار')}
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                              {t('quality.specification', 'المواصفة')}
                            </TableHead>
                            <TableHead className="w-[100px]">
                              {t('quality.minValue', 'الحد الأدنى')}
                            </TableHead>
                            <TableHead className="w-[100px]">
                              {t('quality.maxValue', 'الحد الأقصى')}
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                              {t('quality.isNumeric', 'رقمي')}
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                              {t('quality.isMandatory', 'إلزامي')}
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                              {t('quality.acceptanceFormula', 'معادلة القبول')}
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.parameters.map((parameter, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="space-y-1">
                                  <Input
                                    value={parameter.parameterName}
                                    onChange={(e) =>
                                      handleParameterChange(index, 'parameterName', e.target.value)
                                    }
                                    placeholder="Parameter Name"
                                    className={`rounded-lg ${errors[`parameter_${index}`] ? 'border-red-500' : ''}`}
                                  />
                                  <Input
                                    value={parameter.parameterNameAr || ''}
                                    onChange={(e) =>
                                      handleParameterChange(index, 'parameterNameAr', e.target.value)
                                    }
                                    placeholder="اسم المعيار"
                                    className="rounded-lg"
                                    dir="rtl"
                                  />
                                  {errors[`parameter_${index}`] && (
                                    <p className="text-xs text-red-500">{errors[`parameter_${index}`]}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={parameter.specification || ''}
                                  onChange={(e) =>
                                    handleParameterChange(index, 'specification', e.target.value)
                                  }
                                  placeholder={t('quality.specificationPlaceholder', 'المواصفة')}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={parameter.minValue ?? ''}
                                  onChange={(e) =>
                                    handleParameterChange(
                                      index,
                                      'minValue',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="0"
                                  disabled={!parameter.isNumeric}
                                  className={`rounded-lg ${errors[`parameter_range_${index}`] ? 'border-red-500' : ''}`}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={parameter.maxValue ?? ''}
                                  onChange={(e) =>
                                    handleParameterChange(
                                      index,
                                      'maxValue',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="100"
                                  disabled={!parameter.isNumeric}
                                  className={`rounded-lg ${errors[`parameter_range_${index}`] ? 'border-red-500' : ''}`}
                                />
                                {errors[`parameter_range_${index}`] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors[`parameter_range_${index}`]}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={parameter.isNumeric}
                                  onCheckedChange={(checked) =>
                                    handleParameterChange(index, 'isNumeric', checked)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={parameter.mandatory}
                                  onCheckedChange={(checked) =>
                                    handleParameterChange(index, 'mandatory', checked)
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={parameter.acceptanceCriteria || ''}
                                  onChange={(e) =>
                                    handleParameterChange(index, 'acceptanceCriteria', e.target.value)
                                  }
                                  placeholder={t('quality.formulaPlaceholder', 'مثال: >=90')}
                                  className="rounded-lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeParameter(index)}
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
                    <div className="text-center py-12 text-muted-foreground">
                      <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        {t('quality.noParameters', 'لا توجد معايير بعد')}
                      </p>
                      <p className="text-sm mb-4">
                        {t('quality.addParameterHint', 'اضغط "إضافة معيار" لإضافة معايير الفحص')}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addParameter}
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        {t('quality.addParameter', 'إضافة معيار')}
                      </Button>
                    </div>
                  )}

                  {formData.parameters.length > 0 && (
                    <Alert className="mt-4 rounded-xl border-blue-200 bg-blue-50">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {t('quality.parameterHint', 'المعايير الإلزامية يجب ملؤها عند استخدام هذا القالب. المعايير الرقمية تسمح بتحديد نطاق القيم المقبولة.')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Template Settings */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    {t('quality.templateSettings', 'إعدادات القالب')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="space-y-0.5">
                      <Label htmlFor="status" className="text-base font-medium">
                        {t('quality.activeStatus', 'حالة القالب')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.status === 'active'
                          ? t('quality.templateActive', 'القالب نشط ومتاح للاستخدام')
                          : t('quality.templateInactive', 'القالب غير نشط')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={formData.status === 'active' ? 'default' : 'secondary'} className="rounded-lg">
                        {formData.status === 'active'
                          ? t('quality.active', 'نشط')
                          : t('quality.inactive', 'غير نشط')}
                      </Badge>
                      <Switch
                        id="status"
                        checked={formData.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleChange('status', checked ? 'active' : 'inactive')
                        }
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
                  onClick={() => navigate({ to: '/dashboard/quality/templates' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createTemplateMutation.isPending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createTemplateMutation.isPending
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
