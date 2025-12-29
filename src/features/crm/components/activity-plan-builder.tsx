/**
 * Activity Plan Builder Component
 * Create and manage activity sequences with recurring schedules
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Icons
import {
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  Clock,
  Mail,
  Phone,
  Video,
  Users,
  FileText,
  Repeat,
  Play,
  Pause,
  Copy,
  Save,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
} from 'lucide-react'

// Constants
import { ACTIVITY_TYPES, type ActivityType as ActivityTypeEnum } from '@/constants/crm-constants'

// Types
import type { ActivityPlan, ActivityPlanStep } from '@/types/crm-enhanced'

interface ActivityPlanBuilderProps {
  plan?: ActivityPlan
  onSave?: (plan: ActivityPlan) => Promise<void>
  onDelete?: (planId: string) => Promise<void>
  isLoading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY STEP CARD
// ═══════════════════════════════════════════════════════════════

const activityIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  video_call: Video,
  task: FileText,
}

function ActivityStepCard({
  step,
  index,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  step: ActivityPlanStep
  index: number
  isFirst: boolean
  isLast: boolean
  onUpdate: (step: ActivityPlanStep) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isExpanded, setIsExpanded] = useState(false)

  const activityType = ACTIVITY_TYPES.find(t => t.id === step.activity_type)
  const Icon = activityIcons[step.activity_type] || FileText

  return (
    <Card className={cn(
      'relative transition-all',
      step.is_required && 'ring-1 ring-primary/20'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <GripVertical className="w-4 h-4 cursor-grab" />
            <span className="text-xs font-medium">{index + 1}</span>
          </div>

          {/* Icon */}
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            activityType?.color || 'bg-gray-100 text-gray-600'
          )}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{step.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {isRTL
                      ? `بعد ${step.delay_days} يوم`
                      : `After ${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`}
                  </span>
                  {step.is_required && (
                    <Badge variant="secondary" className="text-xs">
                      {isRTL ? 'مطلوب' : 'Required'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveUp}
                        disabled={isFirst}
                      >
                        <ChevronRight className={cn(
                          'w-4 h-4 rotate-[-90deg]',
                          isFirst && 'opacity-30'
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRTL ? 'نقل للأعلى' : 'Move Up'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onMoveDown}
                        disabled={isLast}
                      >
                        <ChevronRight className={cn(
                          'w-4 h-4 rotate-90',
                          isLast && 'opacity-30'
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRTL ? 'نقل للأسفل' : 'Move Down'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={onDelete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRTL ? 'حذف' : 'Delete'}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Expandable Details */}
            {step.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {step.description}
              </p>
            )}

            {/* Template Info */}
            {step.template_id && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                <span>{isRTL ? 'يستخدم قالب' : 'Uses template'}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD STEP DIALOG
// ═══════════════════════════════════════════════════════════════

function AddStepDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (step: ActivityPlanStep) => void
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [formData, setFormData] = useState<Partial<ActivityPlanStep>>({
    activity_type: 'email',
    name: '',
    description: '',
    delay_days: 1,
    is_required: false,
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.activity_type) return

    onAdd({
      ...formData,
      id: `step_${Date.now()}`,
      order: 0,
    } as ActivityPlanStep)

    setFormData({
      activity_type: 'email',
      name: '',
      description: '',
      delay_days: 1,
      is_required: false,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isRTL ? 'إضافة خطوة' : 'Add Step'}</DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'إضافة خطوة جديدة لخطة النشاط'
              : 'Add a new step to the activity plan'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label>{isRTL ? 'نوع النشاط' : 'Activity Type'}</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(value) => setFormData({ ...formData, activity_type: value as ActivityTypeEnum })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {isRTL ? type.labelAr : type.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>{isRTL ? 'اسم الخطوة' : 'Step Name'}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isRTL ? 'مثال: إرسال بريد ترحيبي' : 'e.g., Send welcome email'}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isRTL ? 'وصف اختياري...' : 'Optional description...'}
              rows={3}
            />
          </div>

          {/* Delay Days */}
          <div className="space-y-2">
            <Label>{isRTL ? 'التأخير (أيام)' : 'Delay (days)'}</Label>
            <Input
              type="number"
              min={0}
              value={formData.delay_days}
              onChange={(e) => setFormData({ ...formData, delay_days: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              {isRTL
                ? 'عدد الأيام بعد الخطوة السابقة'
                : 'Days after the previous step'}
            </p>
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <Label>{isRTL ? 'خطوة مطلوبة' : 'Required Step'}</Label>
            <Switch
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name}>
            {isRTL ? 'إضافة' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// RECURRING SETTINGS
// ═══════════════════════════════════════════════════════════════

function RecurringSettings({
  isRecurring,
  frequency,
  dayOfWeek,
  dayOfMonth,
  onUpdate,
}: {
  isRecurring: boolean
  frequency?: 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  onUpdate: (settings: {
    is_recurring: boolean
    frequency?: 'daily' | 'weekly' | 'monthly'
    day_of_week?: number
    day_of_month?: number
  }) => void
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const weekDays = [
    { value: 0, labelAr: 'الأحد', labelEn: 'Sunday' },
    { value: 1, labelAr: 'الاثنين', labelEn: 'Monday' },
    { value: 2, labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
    { value: 3, labelAr: 'الأربعاء', labelEn: 'Wednesday' },
    { value: 4, labelAr: 'الخميس', labelEn: 'Thursday' },
    { value: 5, labelAr: 'الجمعة', labelEn: 'Friday' },
    { value: 6, labelAr: 'السبت', labelEn: 'Saturday' },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            <CardTitle className="text-base">
              {isRTL ? 'التكرار' : 'Recurring'}
            </CardTitle>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(checked) => onUpdate({ is_recurring: checked })}
          />
        </div>
      </CardHeader>

      {isRecurring && (
        <CardContent className="space-y-4 pt-0">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>{isRTL ? 'التكرار' : 'Frequency'}</Label>
            <Select
              value={frequency || 'weekly'}
              onValueChange={(value) => onUpdate({
                is_recurring: true,
                frequency: value as 'daily' | 'weekly' | 'monthly',
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{isRTL ? 'يومي' : 'Daily'}</SelectItem>
                <SelectItem value="weekly">{isRTL ? 'أسبوعي' : 'Weekly'}</SelectItem>
                <SelectItem value="monthly">{isRTL ? 'شهري' : 'Monthly'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly: Day of Week */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>{isRTL ? 'يوم الأسبوع' : 'Day of Week'}</Label>
              <Select
                value={String(dayOfWeek ?? 0)}
                onValueChange={(value) => onUpdate({
                  is_recurring: true,
                  frequency,
                  day_of_week: parseInt(value),
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {isRTL ? day.labelAr : day.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Monthly: Day of Month */}
          {frequency === 'monthly' && (
            <div className="space-y-2">
              <Label>{isRTL ? 'يوم الشهر' : 'Day of Month'}</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth ?? 1}
                onChange={(e) => onUpdate({
                  is_recurring: true,
                  frequency,
                  day_of_month: parseInt(e.target.value) || 1,
                })}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ActivityPlanBuilder({
  plan,
  onSave,
  onDelete,
  isLoading = false,
  className,
}: ActivityPlanBuilderProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isSaving, setIsSaving] = useState(false)
  const [isAddStepOpen, setIsAddStepOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<ActivityPlan>>({
    name: plan?.name || '',
    description: plan?.description || '',
    trigger_on: plan?.trigger_on || 'lead_created',
    is_active: plan?.is_active ?? true,
    is_recurring: plan?.is_recurring || false,
    recurrence_frequency: plan?.recurrence_frequency,
    recurrence_day_of_week: plan?.recurrence_day_of_week,
    recurrence_day_of_month: plan?.recurrence_day_of_month,
    steps: plan?.steps || [],
  })

  // Handle save
  const handleSave = async () => {
    if (!onSave || !formData.name) return

    setIsSaving(true)
    try {
      await onSave({
        ...formData,
        id: plan?.id || `plan_${Date.now()}`,
        created_at: plan?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ActivityPlan)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle step operations
  const handleAddStep = (step: ActivityPlanStep) => {
    const newSteps = [...(formData.steps || []), { ...step, order: formData.steps?.length || 0 }]
    setFormData({ ...formData, steps: newSteps })
  }

  const handleUpdateStep = (index: number, step: ActivityPlanStep) => {
    const newSteps = [...(formData.steps || [])]
    newSteps[index] = step
    setFormData({ ...formData, steps: newSteps })
  }

  const handleDeleteStep = (index: number) => {
    const newSteps = (formData.steps || []).filter((_, i) => i !== index)
    setFormData({ ...formData, steps: newSteps })
  }

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...(formData.steps || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSteps.length) return

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
    newSteps.forEach((step, i) => step.order = i)
    setFormData({ ...formData, steps: newSteps })
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const triggerOptions = [
    { id: 'lead_created', labelAr: 'عند إنشاء عميل محتمل', labelEn: 'When Lead Created' },
    { id: 'stage_changed', labelAr: 'عند تغيير المرحلة', labelEn: 'When Stage Changed' },
    { id: 'deal_won', labelAr: 'عند كسب الصفقة', labelEn: 'When Deal Won' },
    { id: 'deal_lost', labelAr: 'عند خسارة الصفقة', labelEn: 'When Deal Lost' },
    { id: 'manual', labelAr: 'يدوي', labelEn: 'Manual' },
  ]

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {plan ? (isRTL ? 'تعديل خطة النشاط' : 'Edit Activity Plan') : (isRTL ? 'إنشاء خطة نشاط' : 'Create Activity Plan')}
                </CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'أتمتة سلسلة من الأنشطة لمتابعة العملاء المحتملين'
                    : 'Automate a sequence of activities for lead follow-up'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {plan && onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => onDelete(plan.id)}
                    className="text-destructive"
                  >
                    <Trash2 className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'حذف' : 'Delete'}
                  </Button>
                )}
                <Button onClick={handleSave} disabled={isSaving || !formData.name}>
                  {isSaving && <Loader2 className={cn('w-4 h-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />}
                  <Save className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Plan Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم الخطة' : 'Plan Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: متابعة العميل الجديد' : 'e.g., New Client Follow-up'}
                />
              </div>

              {/* Trigger */}
              <div className="space-y-2">
                <Label>{isRTL ? 'مشغل الخطة' : 'Trigger On'}</Label>
                <Select
                  value={formData.trigger_on}
                  onValueChange={(value) => setFormData({ ...formData, trigger_on: value as ActivityPlan['trigger_on'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {isRTL ? option.labelAr : option.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isRTL ? 'وصف اختياري للخطة...' : 'Optional description...'}
                rows={2}
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>{isRTL ? 'الخطة نشطة' : 'Plan Active'}</Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تفعيل أو إيقاف الخطة' : 'Enable or disable this plan'}
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recurring Settings */}
        <RecurringSettings
          isRecurring={formData.is_recurring || false}
          frequency={formData.recurrence_frequency}
          dayOfWeek={formData.recurrence_day_of_week}
          dayOfMonth={formData.recurrence_day_of_month}
          onUpdate={(settings) => setFormData({
            ...formData,
            is_recurring: settings.is_recurring,
            recurrence_frequency: settings.frequency,
            recurrence_day_of_week: settings.day_of_week,
            recurrence_day_of_month: settings.day_of_month,
          })}
        />

        {/* Steps */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {isRTL ? 'خطوات الخطة' : 'Plan Steps'}
                {formData.steps && formData.steps.length > 0 && (
                  <Badge variant="secondary" className={cn('text-xs', isRTL ? 'mr-2' : 'ml-2')}>
                    {formData.steps.length}
                  </Badge>
                )}
              </CardTitle>
              <Button size="sm" onClick={() => setIsAddStepOpen(true)}>
                <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'إضافة خطوة' : 'Add Step'}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {formData.steps && formData.steps.length > 0 ? (
              <div className="space-y-3">
                {formData.steps.map((step, index) => (
                  <ActivityStepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === formData.steps!.length - 1}
                    onUpdate={(updatedStep) => handleUpdateStep(index, updatedStep)}
                    onDelete={() => handleDeleteStep(index)}
                    onMoveUp={() => handleMoveStep(index, 'up')}
                    onMoveDown={() => handleMoveStep(index, 'down')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {isRTL ? 'لا توجد خطوات' : 'No Steps Yet'}
                </p>
                <p className="text-sm mt-1">
                  {isRTL
                    ? 'أضف خطوات لبناء تسلسل النشاط'
                    : 'Add steps to build your activity sequence'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {formData.steps && formData.steps.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">
                    {isRTL ? 'إجمالي الخطوات:' : 'Total Steps:'}
                  </span>
                  <span className="font-medium">{formData.steps.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-muted-foreground">
                    {isRTL ? 'المدة الإجمالية:' : 'Total Duration:'}
                  </span>
                  <span className="font-medium">
                    {formData.steps.reduce((acc, step) => acc + (step.delay_days || 0), 0)}{' '}
                    {isRTL ? 'يوم' : 'days'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-muted-foreground">
                    {isRTL ? 'خطوات مطلوبة:' : 'Required Steps:'}
                  </span>
                  <span className="font-medium">
                    {formData.steps.filter(s => s.is_required).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Step Dialog */}
      <AddStepDialog
        isOpen={isAddStepOpen}
        onClose={() => setIsAddStepOpen(false)}
        onAdd={handleAddStep}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY PLANS LIST
// ═══════════════════════════════════════════════════════════════

interface ActivityPlansListProps {
  plans?: ActivityPlan[]
  isLoading?: boolean
  onSelect?: (plan: ActivityPlan) => void
  onCreateNew?: () => void
  onToggleActive?: (planId: string, isActive: boolean) => void
  className?: string
}

export function ActivityPlansList({
  plans = [],
  isLoading = false,
  onSelect,
  onCreateNew,
  onToggleActive,
  className,
}: ActivityPlansListProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-medium">
            {isRTL ? 'لا توجد خطط نشاط' : 'No Activity Plans'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? 'أنشئ خطة نشاط لأتمتة المتابعات'
              : 'Create an activity plan to automate follow-ups'}
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'إنشاء خطة' : 'Create Plan'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            !plan.is_active && 'opacity-60'
          )}
          onClick={() => onSelect?.(plan)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                plan.is_active ? 'bg-green-100' : 'bg-gray-100'
              )}>
                {plan.is_active ? (
                  <Play className="w-5 h-5 text-green-600" />
                ) : (
                  <Pause className="w-5 h-5 text-gray-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{plan.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{plan.steps.length} {isRTL ? 'خطوة' : 'steps'}</span>
                  {plan.is_recurring && (
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      {isRTL ? 'متكرر' : 'Recurring'}
                    </span>
                  )}
                </div>
              </div>

              {onToggleActive && (
                <Switch
                  checked={plan.is_active}
                  onCheckedChange={(checked) => {
                    // Prevent card click
                    onToggleActive(plan.id, checked)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ActivityPlanBuilder
