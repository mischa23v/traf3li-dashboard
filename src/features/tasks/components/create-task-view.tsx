import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Users, Loader2, Scale,
    Plus, X, Clock, Tag, Repeat, ListTodo, ChevronDown, Check,
    Zap, CalendarClock, Bell, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FieldTooltip } from '@/components/ui/field-tooltip'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { TasksSidebar } from './tasks-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateTask, useTaskTemplates, useCreateFromTemplate } from '@/hooks/useTasks'
import { useClients, useCases, useTeamMembers } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import {
    ACTIVE_STATUS_OPTIONS,
    MAIN_PRIORITY_OPTIONS,
    CATEGORY_OPTIONS,
    FREQUENCY_OPTIONS,
    DAYS_OF_WEEK,
    ASSIGNEE_STRATEGY_OPTIONS,
    REMINDER_TYPE_OPTIONS,
    FIELD_TOOLTIPS,
} from '../constants/task-options'
import type {
    TaskPriority,
    TaskStatus,
    TaskLabel,
    RecurrenceFrequency,
    RecurrenceType,
    AssigneeStrategy,
    RecurringConfig,
} from '@/services/tasksService'

interface SubtaskInput {
    id: string
    title: string
    autoReset?: boolean
}

// Progress Stepper Component
interface StepperProps {
    steps: { id: string; label: string; icon: React.ReactNode }[]
    completedSteps: string[]
    activeStep: string
    onStepClick: (stepId: string) => void
}

function ProgressStepper({ steps, completedSteps, activeStep, onStepClick }: StepperProps) {
    return (
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-4">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <button
                        type="button"
                        onClick={() => onStepClick(step.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                            completedSteps.includes(step.id)
                                ? "bg-emerald-100 text-emerald-700"
                                : activeStep === step.id
                                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        )}
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            completedSteps.includes(step.id)
                                ? "bg-emerald-500 text-white"
                                : activeStep === step.id
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                        )}>
                            {completedSteps.includes(step.id) ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                        <ArrowRight className={cn(
                            "w-4 h-4 mx-1 sm:mx-2 rtl:rotate-180",
                            completedSteps.includes(step.id) ? "text-emerald-400" : "text-slate-300"
                        )} />
                    )}
                </div>
            ))}
        </div>
    )
}

export function CreateTaskView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createTaskMutation = useCreateTask()
    const { data: templates } = useTaskTemplates()
    const createFromTemplateMutation = useCreateFromTemplate()

    // Section refs for scrolling
    const basicRef = useRef<HTMLDivElement>(null)
    const schedulingRef = useRef<HTMLDivElement>(null)
    const subtasksRef = useRef<HTMLDivElement>(null)
    const remindersRef = useRef<HTMLDivElement>(null)

    // Fetch real data from APIs
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: cases, isLoading: casesLoading } = useCases()
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers()

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'backlog' as TaskStatus,
        priority: 'medium' as TaskPriority,
        label: '' as TaskLabel | '',
        tags: [] as string[],
        dueDate: '',
        dueTime: '',
        startDate: '',
        clientId: '',
        caseId: '',
        assignedTo: '',
        estimatedMinutes: 0,
    })

    // Subtasks state
    const [subtasks, setSubtasks] = useState<SubtaskInput[]>([])
    const [newSubtask, setNewSubtask] = useState('')

    // Recurring config state
    const [isRecurring, setIsRecurring] = useState(false)
    const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
        enabled: false,
        frequency: 'weekly',
        type: 'due_date' as RecurrenceType,
        daysOfWeek: [],
        interval: 1,
        assigneeStrategy: 'fixed' as AssigneeStrategy,
        assigneePool: [],
    })

    // Reminders state
    const [reminders, setReminders] = useState<{ type: string; beforeMinutes: number }[]>([])

    // Collapsible section states
    const [showScheduling, setShowScheduling] = useState(true)
    const [showSubtasks, setShowSubtasks] = useState(true)
    const [showReminders, setShowReminders] = useState(true)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Stepper configuration
    const steps = [
        { id: 'basic', label: 'الأساسيات', icon: <Zap className="w-4 h-4" /> },
        { id: 'scheduling', label: 'الجدولة', icon: <CalendarClock className="w-4 h-4" /> },
        { id: 'subtasks', label: 'المهام الفرعية', icon: <ListTodo className="w-4 h-4" /> },
        { id: 'reminders', label: 'التذكيرات', icon: <Bell className="w-4 h-4" /> },
    ]

    // Calculate completed steps
    const getCompletedSteps = (): string[] => {
        const completed: string[] = []
        if (formData.title.trim()) completed.push('basic')
        if (formData.dueDate || formData.dueTime || formData.estimatedMinutes > 0 || isRecurring) completed.push('scheduling')
        if (subtasks.length > 0) completed.push('subtasks')
        if (reminders.length > 0) completed.push('reminders')
        return completed
    }

    // Get active step
    const getActiveStep = (): string => {
        if (!formData.title.trim()) return 'basic'
        if (showScheduling && !getCompletedSteps().includes('scheduling')) return 'scheduling'
        if (showSubtasks && !getCompletedSteps().includes('subtasks')) return 'subtasks'
        if (showReminders && !getCompletedSteps().includes('reminders')) return 'reminders'
        return 'basic'
    }

    // Handle step click
    const handleStepClick = (stepId: string) => {
        const refs: Record<string, React.RefObject<HTMLDivElement>> = {
            basic: basicRef,
            scheduling: schedulingRef,
            subtasks: subtasksRef,
            reminders: remindersRef,
        }
        const ref = refs[stepId]
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        // Open the section if it's collapsed
        if (stepId === 'scheduling') setShowScheduling(true)
        if (stepId === 'subtasks') setShowSubtasks(true)
        if (stepId === 'reminders') setShowReminders(true)
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    // Validate form
    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error('عنوان المهمة مطلوب')
            return false
        }
        return true
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks(prev => [...prev, {
                id: typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: newSubtask.trim(),
                autoReset: isRecurring
            }])
            setNewSubtask('')
        }
    }

    const removeSubtask = (id: string) => {
        setSubtasks(prev => prev.filter(s => s.id !== id))
    }

    const toggleSubtaskAutoReset = (id: string) => {
        setSubtasks(prev => prev.map(s =>
            s.id === id ? { ...s, autoReset: !s.autoReset } : s
        ))
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleChange('tags', [...formData.tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        handleChange('tags', formData.tags.filter(t => t !== tag))
    }

    const addReminder = () => {
        setReminders(prev => [...prev, { type: 'notification', beforeMinutes: 30 }])
    }

    const updateReminder = (index: number, field: string, value: any) => {
        setReminders(prev => prev.map((r, i) =>
            i === index ? { ...r, [field]: value } : r
        ))
    }

    const removeReminder = (index: number) => {
        setReminders(prev => prev.filter((_, i) => i !== index))
    }

    const toggleDayOfWeek = (day: number) => {
        setRecurringConfig(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek?.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...(prev.daysOfWeek || []), day]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            taskType: 'other',
            ...(typeof formData.label === 'string' && formData.label.trim().length > 0 ? { label: formData.label as TaskLabel } : {}),
            tags: formData.tags,
            ...(formData.dueDate && { dueDate: formData.dueDate }),
            ...(formData.dueTime && { dueTime: formData.dueTime }),
            ...(formData.startDate && { startDate: formData.startDate }),
            ...(formData.assignedTo && { assignedTo: formData.assignedTo }),
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.estimatedMinutes > 0 && { estimatedMinutes: formData.estimatedMinutes }),
            ...(subtasks.length > 0 && {
                subtasks: subtasks.map((s, index) => ({
                    title: s.title,
                    completed: false,
                    order: index,
                    autoReset: s.autoReset
                }))
            }),
            ...(isRecurring && {
                recurring: { ...recurringConfig, enabled: true }
            }),
            ...(reminders.length > 0 && {
                reminders: reminders.map(r => ({
                    type: r.type as 'notification' | 'email' | 'sms' | 'push',
                    beforeMinutes: r.beforeMinutes,
                }))
            }),
        }

        createTaskMutation.mutate(taskData, {
            onSuccess: () => {
                toast.success('تم إنشاء المهمة بنجاح')
                navigate({ to: '/dashboard/tasks/list' })
            },
            onError: () => {
                toast.error('حدث خطأ أثناء إنشاء المهمة')
            }
        })
    }

    const handleUseTemplate = (templateId: string) => {
        createFromTemplateMutation.mutate({ templateId }, {
            onSuccess: () => {
                toast.success('تم إنشاء المهمة من القالب')
                navigate({ to: '/dashboard/tasks/list' })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Hidden on mobile */}
                <div className="hidden md:block">
                    <ProductivityHero badge="إدارة المهام" title="إنشاء مهمة" type="tasks" listMode={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Title Card with Stepper */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    إنشاء مهمة
                                </CardTitle>
                                <p className="text-sm text-slate-500 mt-1">ابدأ بعنوان مختصر ثم أضف التفاصيل</p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <ProgressStepper
                                    steps={steps}
                                    completedSteps={getCompletedSteps()}
                                    activeStep={getActiveStep()}
                                    onStepClick={handleStepClick}
                                />
                            </CardContent>
                        </Card>

                        {/* Templates Section */}
                        {templates && templates.length > 0 && (
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardContent className="py-4">
                                    <p className="text-sm text-slate-600 mb-3">إنشاء سريع من قالب:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {templates.slice(0, 5).map((template) => (
                                            <Button
                                                key={template._id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUseTemplate(template._id)}
                                                className="rounded-full text-xs"
                                                disabled={createFromTemplateMutation.isPending}
                                            >
                                                {template.title}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* CARD 1: Basic Details */}
                            <div ref={basicRef}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CardHeader className="bg-slate-50/50 rounded-t-3xl border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-emerald-500" />
                                            المعلومات الأساسية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pt-6">
                                        {/* Task Title */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                عنوان المهمة
                                                <span className="text-red-500">*</span>
                                                <FieldTooltip content={FIELD_TOOLTIPS.title} />
                                            </Label>
                                            <Input
                                                placeholder="مثال: مراجعة العقد النهائي"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12",
                                                    touched.title && errors.title && "border-red-500"
                                                )}
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                onBlur={() => handleBlur('title')}
                                            />
                                        </div>

                                        {/* Status & Priority */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <ListTodo className="w-4 h-4 text-slate-400" />
                                                    الحالة
                                                    <FieldTooltip content={FIELD_TOOLTIPS.status} />
                                                </Label>
                                                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                        <SelectValue placeholder="اختر الحالة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ACTIVE_STATUS_OPTIONS.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn("w-2 h-2 rounded-full", option.bgColor)} />
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Flag className="w-4 h-4 text-slate-400" />
                                                    الأولوية
                                                    <FieldTooltip content={FIELD_TOOLTIPS.priority} />
                                                </Label>
                                                <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                        <SelectValue placeholder="اختر الأولوية" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MAIN_PRIORITY_OPTIONS.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn("w-2 h-2 rounded-full", option.dotColor)} />
                                                                    {option.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Classification */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-slate-400" />
                                                التصنيف
                                                <FieldTooltip content={FIELD_TOOLTIPS.category} />
                                            </Label>
                                            <Select value={formData.label} onValueChange={(v) => handleChange('label', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORY_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <Badge variant="secondary" className={cn("text-xs", option.bgColor, option.color)}>
                                                                {option.label}
                                                            </Badge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Tags */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-slate-400" />
                                                الوسوم
                                                <FieldTooltip content={FIELD_TOOLTIPS.tags} />
                                            </Label>
                                            {formData.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {formData.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700">
                                                            {tag}
                                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="اكتب وسم واضغط Enter"
                                                    className="rounded-xl border-slate-200 flex-1 h-12"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addTag()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={addTag} className="rounded-xl h-12 px-4">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Assignment Fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    {t('tasks.assignedTo', 'تعيين إلى')}
                                                    <FieldTooltip content={FIELD_TOOLTIPS.assignedTo} />
                                                </Label>
                                                <Select value={formData.assignedTo} onValueChange={(v) => handleChange('assignedTo', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                        <SelectValue placeholder={t('tasks.selectAssignee', 'اختر المسؤول')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {teamLoading ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            </div>
                                                        ) : teamMembers && teamMembers.length > 0 ? (
                                                            teamMembers.map((member) => (
                                                                <SelectItem key={member._id} value={member._id}>
                                                                    {member.firstName} {member.lastName}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                                {t('tasks.noTeamMembers', 'لا يوجد أعضاء فريق')}
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    {t('tasks.client', 'العميل')}
                                                    <FieldTooltip content={FIELD_TOOLTIPS.client} />
                                                </Label>
                                                <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                        <SelectValue placeholder={t('tasks.selectClient', 'اختر العميل')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {clientsLoading ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            </div>
                                                        ) : clients?.data && clients.data.length > 0 ? (
                                                            clients.data.map((client) => (
                                                                <SelectItem key={client._id} value={client._id}>
                                                                    {client.fullName}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                                {t('tasks.noClients', 'لا يوجد عملاء')}
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Case */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-slate-400" />
                                                {t('tasks.linkedCase', 'القضية المرتبطة')}
                                                <FieldTooltip content={FIELD_TOOLTIPS.case} />
                                            </Label>
                                            <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                    <SelectValue placeholder={t('tasks.selectCase', 'اختر القضية')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {casesLoading ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : cases?.cases && cases.cases.length > 0 ? (
                                                        cases.cases.map((caseItem) => (
                                                            <SelectItem key={caseItem._id} value={caseItem._id}>
                                                                {caseItem.caseNumber ? `${caseItem.caseNumber} - ` : ''}{caseItem.title}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 text-slate-500 text-sm">
                                                            {t('tasks.noCases', 'لا توجد قضايا')}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                وصف المهمة
                                                <FieldTooltip content={FIELD_TOOLTIPS.description} />
                                            </Label>
                                            <Textarea
                                                placeholder="أدخل تفاصيل إضافية عن المهمة..."
                                                className="min-h-[100px] rounded-xl border-slate-200 resize-none"
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* CARD 2: Scheduling */}
                            <div ref={schedulingRef}>
                                <Collapsible open={showScheduling} onOpenChange={setShowScheduling}>
                                    <Card className="rounded-3xl shadow-sm border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <CalendarClock className="w-5 h-5 text-emerald-500" />
                                                        الجدولة والوقت
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", showScheduling && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-5 pt-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            تاريخ الاستحقاق
                                                            <FieldTooltip content={FIELD_TOOLTIPS.dueDate} />
                                                        </Label>
                                                        <Input
                                                            type="date"
                                                            className="rounded-xl border-slate-200 h-12"
                                                            value={formData.dueDate}
                                                            onChange={(e) => handleChange('dueDate', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            الوقت
                                                            <FieldTooltip content={FIELD_TOOLTIPS.dueTime} />
                                                        </Label>
                                                        <Input
                                                            type="time"
                                                            className="rounded-xl border-slate-200 h-12"
                                                            value={formData.dueTime}
                                                            onChange={(e) => handleChange('dueTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        الوقت المقدر (دقائق)
                                                        <FieldTooltip content={FIELD_TOOLTIPS.estimatedMinutes} />
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="60"
                                                        className="rounded-xl border-slate-200 h-12"
                                                        value={formData.estimatedMinutes || ''}
                                                        onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>

                                                {/* Recurring Toggle */}
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Repeat className="w-5 h-5 text-emerald-500" />
                                                        <div>
                                                            <p className="font-medium text-slate-700">مهمة متكررة</p>
                                                            <p className="text-xs text-slate-500">تكرار المهمة بشكل دوري</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={isRecurring}
                                                        onCheckedChange={setIsRecurring}
                                                        className="data-[state=checked]:bg-emerald-500"
                                                    />
                                                </div>

                                                {/* Recurring Options */}
                                                {isRecurring && (
                                                    <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">التكرار</Label>
                                                                <Select
                                                                    value={recurringConfig.frequency}
                                                                    onValueChange={(v: RecurrenceFrequency) => setRecurringConfig(prev => ({ ...prev, frequency: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {FREQUENCY_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">نوع التكرار</Label>
                                                                <Select
                                                                    value={recurringConfig.type}
                                                                    onValueChange={(v: RecurrenceType) => setRecurringConfig(prev => ({ ...prev, type: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="due_date">بناءً على تاريخ الاستحقاق</SelectItem>
                                                                        <SelectItem value="completion_date">بناءً على تاريخ الإكمال</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {recurringConfig.frequency === 'weekly' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">أيام الأسبوع</Label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {DAYS_OF_WEEK.map(day => (
                                                                        <Button
                                                                            key={day.value}
                                                                            type="button"
                                                                            variant={recurringConfig.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => toggleDayOfWeek(day.value)}
                                                                            className={cn("rounded-full h-10 min-w-10", recurringConfig.daysOfWeek?.includes(day.value) && "bg-emerald-500 hover:bg-emerald-600")}
                                                                        >
                                                                            {day.label}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {recurringConfig.frequency === 'custom' && (
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">كل X أيام</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-xl w-32 h-12"
                                                                    value={recurringConfig.interval || 1}
                                                                    onChange={(e) => setRecurringConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">استراتيجية التعيين</Label>
                                                                <Select
                                                                    value={recurringConfig.assigneeStrategy}
                                                                    onValueChange={(v: AssigneeStrategy) => setRecurringConfig(prev => ({ ...prev, assigneeStrategy: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ASSIGNEE_STRATEGY_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">تاريخ الانتهاء (اختياري)</Label>
                                                                <Input
                                                                    type="date"
                                                                    className="rounded-xl h-12"
                                                                    value={recurringConfig.endDate || ''}
                                                                    onChange={(e) => setRecurringConfig(prev => ({ ...prev, endDate: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            </div>

                            {/* CARD 3: Subtasks */}
                            <div ref={subtasksRef}>
                                <Collapsible open={showSubtasks} onOpenChange={setShowSubtasks}>
                                    <Card className="rounded-3xl shadow-sm border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <ListTodo className="w-5 h-5 text-emerald-500" />
                                                        المهام الفرعية
                                                        {subtasks.length > 0 && (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                                                                {subtasks.length}
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", showSubtasks && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-6">
                                                {subtasks.length > 0 && (
                                                    <div className="space-y-2">
                                                        {subtasks.map((subtask) => (
                                                            <div key={subtask.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                                <span className="flex-1 text-slate-700">{subtask.title}</span>
                                                                {isRecurring && (
                                                                    <label className="flex items-center gap-2 text-sm text-slate-500">
                                                                        <Checkbox
                                                                            checked={subtask.autoReset}
                                                                            onCheckedChange={() => toggleSubtaskAutoReset(subtask.id)}
                                                                        />
                                                                        إعادة تعيين
                                                                    </label>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeSubtask(subtask.id)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">إضافة مهمة فرعية</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="عنوان المهمة الفرعية"
                                                            className="rounded-xl border-slate-200 flex-1 h-12"
                                                            value={newSubtask}
                                                            onChange={(e) => setNewSubtask(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    addSubtask()
                                                                }
                                                            }}
                                                        />
                                                        <Button type="button" onClick={addSubtask} className="rounded-xl h-12 bg-emerald-500 hover:bg-emerald-600">
                                                            <Plus className="w-4 h-4 ms-2" />
                                                            إضافة
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            </div>

                            {/* CARD 4: Reminders */}
                            <div ref={remindersRef}>
                                <Collapsible open={showReminders} onOpenChange={setShowReminders}>
                                    <Card className="rounded-3xl shadow-sm border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Bell className="w-5 h-5 text-emerald-500" />
                                                        التذكيرات
                                                        {reminders.length > 0 && (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                                                                {reminders.length}
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", showReminders && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-6">
                                                {reminders.length > 0 && (
                                                    <div className="space-y-2">
                                                        {reminders.map((reminder, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl flex-wrap">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">نوع التذكير</Label>
                                                                    <Select
                                                                        value={reminder.type}
                                                                        onValueChange={(v) => updateReminder(index, 'type', v)}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl w-32 h-10">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {REMINDER_TYPE_OPTIONS.map(option => (
                                                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">قبل (دقائق)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        className="rounded-xl w-24 h-10"
                                                                        value={reminder.beforeMinutes}
                                                                        onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeReminder(index)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 w-10 mt-auto"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addReminder}
                                                    className="w-full rounded-xl h-12 border-dashed border-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50"
                                                >
                                                    <Plus className="w-4 h-4 ms-2" />
                                                    إضافة تذكير
                                                </Button>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            </div>

                            {/* Submit Buttons */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardContent className="py-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                                        <Link to="/dashboard/tasks/list" className="w-full sm:w-auto">
                                            <Button type="button" variant="ghost" className="w-full text-slate-500 hover:text-slate-700 h-12">
                                                إلغاء
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20 h-12"
                                            disabled={createTaskMutation.isPending}
                                        >
                                            {createTaskMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    جاري الحفظ...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    حفظ المهمة
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Sidebar Widgets - Hidden on mobile */}
                    <div className="hidden lg:block">
                        <TasksSidebar context="tasks" />
                    </div>
                </div>
            </Main>
        </>
    )
}
