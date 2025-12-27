/**
 * Create Quality Action View
 * Form for creating corrective and preventive quality actions
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Save,
  X,
  FileText,
  User,
  Calendar,
  Flag,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  Target,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useCreateAction, useInspections } from '@/hooks/use-quality'
import { useStaff } from '@/hooks/useStaff'
import type { QualityAction, ActionType, ActionStatus } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'quality.quality', href: '/dashboard/quality' },
  { title: 'quality.actions', href: '/dashboard/quality/actions' },
  { title: 'quality.createAction', href: '/dashboard/quality/actions/create' },
]

const ACTION_TYPES: { value: ActionType; translationKey: string; icon: any }[] = [
  {
    value: 'corrective',
    translationKey: 'quality.actionType.corrective',
    icon: AlertTriangle,
  },
  {
    value: 'preventive',
    translationKey: 'quality.actionType.preventive',
    icon: CheckCircle2,
  },
]

const PRIORITY_LEVELS: {
  value: 'low' | 'medium' | 'high' | 'urgent'
  translationKey: string
  color: string
}[] = [
  { value: 'low', translationKey: 'quality.priority.low', color: 'bg-gray-500' },
  { value: 'medium', translationKey: 'quality.priority.medium', color: 'bg-blue-500' },
  { value: 'high', translationKey: 'quality.priority.high', color: 'bg-orange-500' },
  { value: 'urgent', translationKey: 'quality.priority.urgent', color: 'bg-red-500' },
]

const STATUS_OPTIONS: { value: ActionStatus; translationKey: string }[] = [
  { value: 'open', translationKey: 'quality.status.open' },
  { value: 'in_progress', translationKey: 'quality.status.inProgress' },
  { value: 'resolved', translationKey: 'quality.status.resolved' },
  { value: 'closed', translationKey: 'quality.status.closed' },
]

type FormData = Omit<
  QualityAction,
  '_id' | 'actionId' | 'actionNumber' | 'createdAt' | 'updatedAt' | 'assignedToName'
>

export function CreateActionView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createActionMutation = useCreateAction()
  const { data: inspectionsData } = useInspections()
  const { data: staffData } = useStaff()

  // Form state
  const [formData, setFormData] = useState<FormData>({
    type: 'corrective',
    description: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    assignedTo: '',
    targetDate: '',
    completedDate: '',
    status: 'open',
    priority: 'medium',
    remarks: '',
    inspectionId: '',
  })

  const [subject, setSubject] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResolutionNotes, setShowResolutionNotes] = useState(false)

  // Show resolution notes when status is resolved or closed
  useEffect(() => {
    setShowResolutionNotes(formData.status === 'resolved' || formData.status === 'closed')
  }, [formData.status])

  // Auto-set completed date when status is resolved or closed
  useEffect(() => {
    if (formData.status === 'resolved' || formData.status === 'closed') {
      if (!formData.completedDate) {
        setFormData((prev) => ({
          ...prev,
          completedDate: new Date().toISOString().split('T')[0],
        }))
      }
    }
  }, [formData.status, formData.completedDate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = t('quality.validation.actionTypeRequired', 'نوع الإجراء مطلوب')
    }
    if (!subject.trim()) {
      newErrors.subject = t('quality.validation.subjectRequired', 'الموضوع مطلوب')
    }
    if (!formData.description.trim()) {
      newErrors.description = t('quality.validation.descriptionRequired', 'الوصف مطلوب')
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = t('quality.validation.assignedToRequired', 'المسؤول مطلوب')
    }
    if (!formData.targetDate) {
      newErrors.targetDate = t('quality.validation.dueDateRequired', 'تاريخ الاستحقاق مطلوب')
    } else {
      const targetDate = new Date(formData.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (targetDate < today) {
        newErrors.targetDate = t(
          'quality.validation.dueDateFuture',
          'تاريخ الاستحقاق يجب أن يكون في المستقبل'
        )
      }
    }

    // Validate resolution notes are provided when status is resolved or closed
    if (formData.status === 'resolved' || formData.status === 'closed') {
      if (formData.type === 'corrective' && !formData.correctiveAction?.trim()) {
        newErrors.correctiveAction = t(
          'quality.validation.correctiveActionRequired',
          'الإجراء التصحيحي مطلوب عند الحل'
        )
      }
      if (formData.type === 'preventive' && !formData.preventiveAction?.trim()) {
        newErrors.preventiveAction = t(
          'quality.validation.preventiveActionRequired',
          'الإجراء الوقائي مطلوب عند الحل'
        )
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      // Merge subject into description
      const dataToSubmit = {
        ...formData,
        description: `${subject}${formData.description ? '\n\n' + formData.description : ''}`,
        // Remove empty optional fields
        inspectionId: formData.inspectionId || undefined,
        rootCause: formData.rootCause || undefined,
        correctiveAction: formData.correctiveAction || undefined,
        preventiveAction: formData.preventiveAction || undefined,
        completedDate: formData.completedDate || undefined,
        remarks: formData.remarks || undefined,
      }

      await createActionMutation.mutateAsync(dataToSubmit)
      navigate({ to: '/dashboard/quality/actions' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubjectChange = (value: string) => {
    setSubject(value)
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: '' }))
    }
  }

  const inspections = inspectionsData?.data || inspectionsData || []
  const selectedActionType = ACTION_TYPES.find((t) => t.value === formData.type)
  const ActionTypeIcon = selectedActionType?.icon || AlertTriangle

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <ProductivityHero
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.createAction', 'إنشاء إجراء جودة')}
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
                    <ActionTypeIcon className="w-5 h-5 text-amber-600" />
                    {t('quality.basicInfo', 'المعلومات الأساسية')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'quality.actionFormDescription',
                      'أنشئ إجراء تصحيحي أو وقائي لمعالجة مشاكل الجودة'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="actionType">
                        {t('quality.actionType', 'نوع الإجراء')} *
                      </Label>
                      <Select value={formData.type} onValueChange={(v) => handleChange('type', v as ActionType)}>
                        <SelectTrigger
                          className={`rounded-xl ${errors.type ? 'border-red-500' : ''}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map((type) => {
                            const Icon = type.icon
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  <span>
                                    {t(type.translationKey)}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        {t('quality.priority', 'الأولوية')} *
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => handleChange('priority', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <Flag className={`w-4 h-4 text-white ${level.color}`} />
                                <span>
                                  {t(level.translationKey)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('quality.subject', 'الموضوع')} *</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      placeholder={t(
                        'quality.subjectPlaceholder',
                        'مثال: ضبط جودة المنتج X'
                      )}
                      className={`rounded-xl ${errors.subject ? 'border-red-500' : ''}`}
                      dir="rtl"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t('quality.description', 'الوصف')} *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t(
                        'quality.descriptionPlaceholder',
                        'وصف تفصيلي للمشكلة أو الإجراء المطلوب...'
                      )}
                      className={`rounded-xl min-h-32 ${errors.description ? 'border-red-500' : ''}`}
                      dir="rtl"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inspectionId">
                      {t('quality.referenceInspection', 'فحص مرجعي')}
                      <span className="text-muted-foreground text-xs mr-2">
                        ({t('common.optional', 'اختياري')})
                      </span>
                    </Label>
                    <Select
                      value={formData.inspectionId}
                      onValueChange={(v) => handleChange('inspectionId', v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue
                          placeholder={t(
                            'quality.selectInspection',
                            'اختر فحص مرجعي (اختياري)'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {t('quality.noInspection', 'بدون فحص مرجعي')}
                        </SelectItem>
                        {inspections.map((inspection: any) => (
                          <SelectItem key={inspection._id} value={inspection._id}>
                            {inspection.inspectionNumber} - {inspection.itemCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Root Cause & Analysis */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    {t('quality.rootCauseAnalysis', 'تحليل السبب الجذري')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'quality.rootCauseDescription',
                      'حدد السبب الجذري للمشكلة لمنع تكرارها'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rootCause">
                      {t('quality.rootCause', 'السبب الجذري')}
                      <span className="text-muted-foreground text-xs mr-2">
                        ({t('common.optional', 'اختياري')})
                      </span>
                    </Label>
                    <Textarea
                      id="rootCause"
                      value={formData.rootCause}
                      onChange={(e) => handleChange('rootCause', e.target.value)}
                      placeholder={t(
                        'quality.rootCausePlaceholder',
                        'ما هو السبب الأساسي لهذه المشكلة؟'
                      )}
                      className="rounded-xl min-h-24"
                      dir="rtl"
                    />
                  </div>

                  <Alert className="rounded-xl border-blue-200 bg-blue-50">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {t(
                        'quality.rootCauseHint',
                        'استخدم تقنيات مثل "5 لماذا" أو "مخطط إيشيكاوا" لتحديد السبب الجذري'
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Assignment & Dates */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    {t('quality.assignmentAndSchedule', 'التكليف والجدولة')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">
                        {t('quality.assignedTo', 'المسؤول')} *
                      </Label>
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(v) => handleChange('assignedTo', v)}
                      >
                        <SelectTrigger
                          className={`rounded-xl ${errors.assignedTo ? 'border-red-500' : ''}`}
                        >
                          <SelectValue
                            placeholder={t('quality.selectAssignee', 'اختر المسؤول')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {staffData?.map((staff: any) => (
                            <SelectItem key={staff._id} value={staff._id}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {staff.firstName} {staff.lastName}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assignedTo && (
                        <p className="text-sm text-red-500">{errors.assignedTo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">{t('quality.status', 'الحالة')} *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => handleChange('status', v as ActionStatus)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(status.translationKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetDate">
                        {t('quality.dueDate', 'تاريخ الاستحقاق')} *
                      </Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => handleChange('targetDate', e.target.value)}
                        className={`rounded-xl ${errors.targetDate ? 'border-red-500' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.targetDate && (
                        <p className="text-sm text-red-500">{errors.targetDate}</p>
                      )}
                    </div>

                    {showResolutionNotes && (
                      <div className="space-y-2">
                        <Label htmlFor="completedDate">
                          {t('quality.completedDate', 'تاريخ الإنجاز')}
                        </Label>
                        <Input
                          id="completedDate"
                          type="date"
                          value={formData.completedDate}
                          onChange={(e) => handleChange('completedDate', e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resolution Notes */}
              {showResolutionNotes && (
                <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      {t('quality.resolutionNotes', 'ملاحظات الحل')}
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      {t(
                        'quality.resolutionDescription',
                        'وثق الإجراءات المتخذة لحل هذه المشكلة'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.type === 'corrective' && (
                      <div className="space-y-2">
                        <Label htmlFor="correctiveAction" className="text-emerald-700">
                          {t('quality.correctiveAction', 'الإجراء التصحيحي')} *
                        </Label>
                        <Textarea
                          id="correctiveAction"
                          value={formData.correctiveAction}
                          onChange={(e) => handleChange('correctiveAction', e.target.value)}
                          placeholder={t(
                            'quality.correctiveActionPlaceholder',
                            'ما هي الإجراءات التي تم اتخاذها لتصحيح المشكلة؟'
                          )}
                          className={`rounded-xl min-h-24 bg-white ${errors.correctiveAction ? 'border-red-500' : ''}`}
                          dir="rtl"
                        />
                        {errors.correctiveAction && (
                          <p className="text-sm text-red-500">{errors.correctiveAction}</p>
                        )}
                      </div>
                    )}

                    {formData.type === 'preventive' && (
                      <div className="space-y-2">
                        <Label htmlFor="preventiveAction" className="text-emerald-700">
                          {t('quality.preventiveAction', 'الإجراء الوقائي')} *
                        </Label>
                        <Textarea
                          id="preventiveAction"
                          value={formData.preventiveAction}
                          onChange={(e) => handleChange('preventiveAction', e.target.value)}
                          placeholder={t(
                            'quality.preventiveActionPlaceholder',
                            'ما هي الإجراءات الوقائية لمنع تكرار المشكلة؟'
                          )}
                          className={`rounded-xl min-h-24 bg-white ${errors.preventiveAction ? 'border-red-500' : ''}`}
                          dir="rtl"
                        />
                        {errors.preventiveAction && (
                          <p className="text-sm text-red-500">{errors.preventiveAction}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes */}
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    {t('quality.additionalNotes', 'ملاحظات إضافية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="remarks">
                      {t('quality.remarks', 'ملاحظات')}
                      <span className="text-muted-foreground text-xs mr-2">
                        ({t('common.optional', 'اختياري')})
                      </span>
                    </Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      placeholder={t(
                        'quality.remarksPlaceholder',
                        'أي ملاحظات أو معلومات إضافية...'
                      )}
                      className="rounded-xl min-h-24"
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/quality/actions' })}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 ml-2" />
                  {t('common.cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={createActionMutation.isPending}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {createActionMutation.isPending
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
