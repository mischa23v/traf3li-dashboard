/**
 * Activity Plans Settings View
 * Configure and manage activity plan templates
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Loader2,
  Plus,
  Calendar,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  MoreVertical,
  ChevronRight,
  Info,
  Clock,
  Mail,
  Phone,
  Video,
  Users,
  FileText,
  Repeat,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { ROUTES } from '@/constants/routes'
import { ActivityPlanBuilder, ActivityPlansList } from '@/features/crm/components/activity-plan-builder'
import type { ActivityPlan, ActivityPlanStep } from '@/types/crm-enhanced'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.activityPlans', href: '/dashboard/crm/settings/activity-plans' },
]

// Mock activity plans data
const MOCK_PLANS: ActivityPlan[] = [
  {
    id: '1',
    name: 'متابعة العميل الجديد',
    name_en: 'New Client Follow-up',
    description: 'سلسلة من الأنشطة لمتابعة العملاء الجدد',
    trigger_on: 'lead_created',
    is_active: true,
    is_recurring: false,
    steps: [
      {
        id: 's1',
        order: 0,
        activity_type: 'email',
        name: 'بريد ترحيبي',
        delay_days: 0,
        is_required: true,
      },
      {
        id: 's2',
        order: 1,
        activity_type: 'call',
        name: 'اتصال تعريفي',
        delay_days: 1,
        is_required: true,
      },
      {
        id: 's3',
        order: 2,
        activity_type: 'meeting',
        name: 'اجتماع أولي',
        delay_days: 3,
        is_required: false,
      },
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'متابعة الصفقة',
    name_en: 'Deal Follow-up',
    description: 'متابعة دورية للصفقات المفتوحة',
    trigger_on: 'stage_changed',
    is_active: true,
    is_recurring: true,
    recurrence_frequency: 'weekly',
    recurrence_day_of_week: 1,
    steps: [
      {
        id: 's4',
        order: 0,
        activity_type: 'call',
        name: 'اتصال متابعة',
        delay_days: 0,
        is_required: true,
      },
      {
        id: 's5',
        order: 1,
        activity_type: 'email',
        name: 'تحديث الحالة',
        delay_days: 2,
        is_required: false,
      },
    ],
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'تقييم ما بعد البيع',
    name_en: 'Post-Sale Evaluation',
    description: 'تقييم رضا العميل بعد إغلاق الصفقة',
    trigger_on: 'deal_won',
    is_active: false,
    is_recurring: false,
    steps: [
      {
        id: 's6',
        order: 0,
        activity_type: 'email',
        name: 'شكر على الثقة',
        delay_days: 1,
        is_required: true,
      },
      {
        id: 's7',
        order: 1,
        activity_type: 'call',
        name: 'استبيان الرضا',
        delay_days: 7,
        is_required: true,
      },
    ],
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
]

const activityIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Users,
  video_call: Video,
  task: FileText,
}

const triggerLabels = {
  lead_created: { ar: 'عند إنشاء عميل محتمل', en: 'When Lead Created' },
  stage_changed: { ar: 'عند تغيير المرحلة', en: 'When Stage Changed' },
  deal_won: { ar: 'عند كسب الصفقة', en: 'When Deal Won' },
  deal_lost: { ar: 'عند خسارة الصفقة', en: 'When Deal Lost' },
  manual: { ar: 'يدوي', en: 'Manual' },
}

export function ActivityPlansSettingsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [isLoading, setIsLoading] = useState(true)
  const [plans, setPlans] = useState<ActivityPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<ActivityPlan | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  // Load plans
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlans(MOCK_PLANS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Toggle plan active status
  const togglePlanActive = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, is_active: !plan.is_active } : plan
      )
    )
    toast.success(isRTL ? 'تم تحديث حالة الخطة' : 'Plan status updated')
  }

  // Duplicate plan
  const duplicatePlan = (plan: ActivityPlan) => {
    const newPlan: ActivityPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      name: `${plan.name} (${isRTL ? 'نسخة' : 'Copy'})`,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setPlans((prev) => [...prev, newPlan])
    toast.success(isRTL ? 'تم نسخ الخطة بنجاح' : 'Plan duplicated successfully')
  }

  // Delete plan
  const deletePlan = () => {
    if (!planToDelete) return
    setPlans((prev) => prev.filter((plan) => plan.id !== planToDelete))
    setPlanToDelete(null)
    setIsDeleteDialogOpen(false)
    toast.success(isRTL ? 'تم حذف الخطة بنجاح' : 'Plan deleted successfully')
  }

  // Save plan
  const savePlan = async (plan: ActivityPlan) => {
    const existingIndex = plans.findIndex((p) => p.id === plan.id)
    if (existingIndex >= 0) {
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...plan, updated_at: new Date().toISOString() } : p))
      )
    } else {
      setPlans((prev) => [...prev, plan])
    }
    setSelectedPlan(null)
    setIsEditorOpen(false)
    toast.success(isRTL ? 'تم حفظ الخطة بنجاح' : 'Plan saved successfully')
  }

  // Create new plan
  const createNewPlan = () => {
    setSelectedPlan(null)
    setIsEditorOpen(true)
  }

  if (isLoading) {
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
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-3xl" />
              ))}
            </div>
          </div>
        </Main>
      </>
    )
  }

  // Show editor
  if (isEditorOpen) {
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
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditorOpen(false)
                setSelectedPlan(null)
              }}
            >
              <ChevronRight className={cn('w-4 h-4', isRTL ? '' : 'rotate-180')} />
              {isRTL ? 'العودة' : 'Back'}
            </Button>
          </div>

          <ActivityPlanBuilder
            plan={selectedPlan || undefined}
            onSave={savePlan}
            onDelete={(id) => {
              setPlanToDelete(id)
              setIsDeleteDialogOpen(true)
            }}
            className="max-w-4xl"
          />
        </Main>
      </>
    )
  }

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
          badge={isRTL ? 'إدارة العملاء' : 'CRM'}
          title={isRTL ? 'خطط النشاط' : 'Activity Plans'}
          type="crm"
          hideButtons
        />

        <div className="space-y-6 max-w-5xl">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isRTL ? 'قوالب خطط النشاط' : 'Activity Plan Templates'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL
                  ? 'أنشئ وأدر قوالب تسلسل الأنشطة للمتابعة الآلية'
                  : 'Create and manage activity sequence templates for automated follow-ups'}
              </p>
            </div>
            <Button onClick={createNewPlan} className="rounded-xl">
              <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            </Button>
          </div>

          {/* Plans List */}
          {plans.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {isRTL ? 'لا توجد خطط نشاط' : 'No Activity Plans'}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  {isRTL
                    ? 'أنشئ خطة نشاط لأتمتة سلسلة من المتابعات للعملاء المحتملين'
                    : 'Create an activity plan to automate a sequence of follow-ups for your leads'}
                </p>
                <Button onClick={createNewPlan} className="mt-6 rounded-xl">
                  <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'إنشاء أول خطة' : 'Create First Plan'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => {
                const trigger = triggerLabels[plan.trigger_on] || triggerLabels.manual
                const totalDays = plan.steps.reduce((sum, step) => sum + (step.delay_days || 0), 0)

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      'rounded-3xl border-0 shadow-sm transition-all hover:shadow-md cursor-pointer',
                      !plan.is_active && 'opacity-70'
                    )}
                    onClick={() => {
                      setSelectedPlan(plan)
                      setIsEditorOpen(true)
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                            plan.is_active ? 'bg-green-100' : 'bg-gray-100'
                          )}
                        >
                          {plan.is_active ? (
                            <Play className="w-6 h-6 text-green-600" />
                          ) : (
                            <Pause className="w-6 h-6 text-gray-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {isRTL && plan.name ? plan.name : plan.name_en || plan.name}
                              </h3>
                              {plan.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {plan.description}
                                </p>
                              )}
                            </div>

                            {/* Actions Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPlan(plan)
                                    setIsEditorOpen(true)
                                  }}
                                >
                                  <Edit className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {isRTL ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    duplicatePlan(plan)
                                  }}
                                >
                                  <Copy className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {isRTL ? 'نسخ' : 'Duplicate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPlanToDelete(plan.id)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {isRTL ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <Badge variant="secondary" className="rounded-lg">
                              {isRTL ? trigger.ar : trigger.en}
                            </Badge>

                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="w-3.5 h-3.5" />
                              {plan.steps.length} {isRTL ? 'خطوة' : 'steps'}
                            </span>

                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {totalDays} {isRTL ? 'يوم' : 'days'}
                            </span>

                            {plan.is_recurring && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Repeat className="w-3.5 h-3.5" />
                                {isRTL ? 'متكرر' : 'Recurring'}
                              </span>
                            )}
                          </div>

                          {/* Steps Preview */}
                          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                            {plan.steps.slice(0, 5).map((step, index) => {
                              const Icon = activityIcons[step.activity_type] || FileText
                              return (
                                <div key={step.id} className="flex items-center">
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                      step.is_required ? 'bg-primary/10' : 'bg-slate-100'
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        'w-4 h-4',
                                        step.is_required ? 'text-primary' : 'text-slate-600'
                                      )}
                                    />
                                  </div>
                                  {index < plan.steps.length - 1 && index < 4 && (
                                    <div className="w-4 h-0.5 bg-slate-200 mx-1" />
                                  )}
                                </div>
                              )
                            })}
                            {plan.steps.length > 5 && (
                              <Badge variant="outline" className="ml-2">
                                +{plan.steps.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Toggle */}
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={() => togglePlanActive(plan.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Info Alert */}
          <Alert className="rounded-xl border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              {isRTL
                ? 'خطط النشاط النشطة ستبدأ تلقائياً عند تحقق شرط التشغيل. يمكنك أيضاً تشغيل الخطط يدوياً على العملاء المحتملين.'
                : 'Active plans will start automatically when their trigger condition is met. You can also manually start plans on leads.'}
            </AlertDescription>
          </Alert>
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this plan? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={deletePlan}>
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ActivityPlansSettingsView
