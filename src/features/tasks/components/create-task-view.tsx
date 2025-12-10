import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    ArrowRight, Save, Calendar, User,
    Flag, FileText, Briefcase, Users, Loader2, Scale,
    Plus, X, Clock, Tag, Repeat, ListTodo, ChevronDown,
    Check, Zap, CalendarClock, UserPlus, AlignLeft, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
        <div className="flex items-center justify-between w-full mb-8 px-4">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                    <button
                        type="button"
                        onClick={() => onStepClick(step.id)}
                        className={cn(
                            "flex flex-col items-center gap-2 transition-all duration-300 group",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-lg p-2"
                        )}
                    >
                        <div
                            className={cn(
                                "stepper-dot w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                completedSteps.includes(step.id)
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : activeStep === step.id
                                        ? "border-emerald-500 text-emerald-500 bg-emerald-50"
                                        : "border-slate-300 text-slate-400 bg-white group-hover:border-emerald-300 group-hover:text-emerald-400"
                            )}
                        >
                            {completedSteps.includes(step.id) ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                step.icon
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium text-center transition-colors hidden sm:block",
                                completedSteps.includes(step.id)
                                    ? "text-emerald-600"
                                    : activeStep === step.id
                                        ? "text-emerald-600"
                                        : "text-slate-500 group-hover:text-emerald-500"
                            )}
                        >
                            {step.label}
                        </span>
                    </button>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "stepper-line flex-1 h-0.5 mx-2 rounded transition-colors duration-300",
                                completedSteps.includes(step.id)
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

// Collapsible Section Header Component
interface SectionHeaderProps {
    icon: React.ReactNode
    title: string
    subtitle?: string
    badge?: string
    badgeVariant?: 'optional' | 'advanced'
    isOpen: boolean
    onToggle: () => void
}

function SectionHeader({ icon, title, subtitle, badge, badgeVariant = 'optional', isOpen, onToggle }: SectionHeaderProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "section-header w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200",
                isOpen
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-slate-50/50 hover:bg-slate-100/50 border-transparent"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isOpen ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                )}>
                    {icon}
                </div>
                <div className="text-start">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-semibold transition-colors",
                            isOpen ? "text-emerald-700" : "text-slate-700"
                        )}>
                            {title}
                        </span>
                        {badge && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] px-2 py-0",
                                    badgeVariant === 'optional'
                                        ? "bg-slate-100 text-slate-500"
                                        : "bg-amber-100 text-amber-700"
                                )}
                            >
                                {badge}
                            </Badge>
                        )}
                    </div>
                    {subtitle && (
                        <span className="text-xs text-slate-500">{subtitle}</span>
                    )}
                </div>
            </div>
            <ChevronDown
                className={cn(
                    "chevron-rotate w-5 h-5 text-slate-400 transition-transform duration-300",
                    isOpen && "rotate-180"
                )}
            />
        </button>
    )
}

export function CreateTaskView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createTaskMutation = useCreateTask()
    const { data: templates } = useTaskTemplates()
    const createFromTemplateMutation = useCreateFromTemplate()

    // Section refs for scrolling
    const schedulingRef = useRef<HTMLDivElement>(null)
    const assignmentRef = useRef<HTMLDivElement>(null)
    const descriptionRef = useRef<HTMLDivElement>(null)
    const subtasksRef = useRef<HTMLDivElement>(null)

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

    // Section toggles for progressive disclosure
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        scheduling: false,
        assignment: false,
        description: false,
        subtasks: false,
    })

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Stepper configuration
    const steps = [
        { id: 'essential', label: 'المعلومات الأساسية', icon: <Zap className="w-5 h-5" /> },
        { id: 'scheduling', label: 'الجدولة', icon: <CalendarClock className="w-5 h-5" /> },
        { id: 'assignment', label: 'التعيين', icon: <UserPlus className="w-5 h-5" /> },
        { id: 'details', label: 'التفاصيل', icon: <AlignLeft className="w-5 h-5" /> },
    ]

    // Calculate completed steps based on filled sections
    const getCompletedSteps = (): string[] => {
        const completed: string[] = []
        if (formData.title.trim()) {
            completed.push('essential')
        }
        if (formData.dueDate || formData.dueTime || formData.estimatedMinutes > 0) {
            completed.push('scheduling')
        }
        if (formData.assignedTo || formData.clientId || formData.caseId || formData.tags.length > 0) {
            completed.push('assignment')
        }
        if (formData.description.trim() || subtasks.length > 0 || reminders.length > 0) {
            completed.push('details')
        }
        return completed
    }

    // Get active step based on open sections
    const getActiveStep = (): string => {
        if (openSections.subtasks || openSections.description) return 'details'
        if (openSections.assignment) return 'assignment'
        if (openSections.scheduling) return 'scheduling'
        return 'essential'
    }

    // Handle step click - scroll to section
    const handleStepClick = (stepId: string) => {
        switch (stepId) {
            case 'scheduling':
                setOpenSections(prev => ({ ...prev, scheduling: true }))
                schedulingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                break
            case 'assignment':
                setOpenSections(prev => ({ ...prev, assignment: true }))
                assignmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                break
            case 'details':
                setOpenSections(prev => ({ ...prev, description: true, subtasks: true }))
                descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                break
            default:
                window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    // Validate a single field (validation disabled for testing)
    const validateField = (_field: string, _value: any): string => {
        return ''
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields
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

        if (!validateForm()) {
            return
        }

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
                recurring: {
                    ...recurringConfig,
                    enabled: true,
                }
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

    // Quick save - just saves with essential info
    const handleQuickSave = async () => {
        if (!validateForm()) {
            return
        }

        const taskData = {
            title: formData.title,
            status: formData.status,
            priority: formData.priority,
            taskType: 'other',
            ...(typeof formData.label === 'string' && formData.label.trim().length > 0 ? { label: formData.label as TaskLabel } : {}),
            tags: [],
        }

        createTaskMutation.mutate(taskData, {
            onSuccess: () => {
                toast.success('تم حفظ المهمة بنجاح')
                navigate({ to: '/dashboard/tasks/list' })
            },
            onError: () => {
                toast.error('حدث خطأ أثناء حفظ المهمة')
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Hidden on mobile */}
                <div className="hidden md:block">
                    <ProductivityHero badge="إدارة المهام" title="إنشاء مهمة" type="tasks" listMode={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Templates Section - Hidden on mobile */}
                        {templates && templates.length > 0 && (
                            <div className="hidden md:block bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-fade-in-up">
                                <p className="text-sm text-slate-600 mb-3">إنشاء من قالب:</p>
                                <div className="flex flex-wrap gap-2">
                                    {templates.slice(0, 5).map((template) => (
                                        <Button
                                            key={template._id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleUseTemplate(template._id)}
                                            className="rounded-full"
                                            disabled={createFromTemplateMutation.isPending}
                                        >
                                            {template.title}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up">
                            {/* Progress Stepper */}
                            <ProgressStepper
                                steps={steps}
                                completedSteps={getCompletedSteps()}
                                activeStep={getActiveStep()}
                                onStepClick={handleStepClick}
                            />

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* ===== STEP 1: Essential Info (Always Visible) ===== */}
                                <div className="space-y-5 pb-6 border-b border-slate-100">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h3>

                                    {/* Task Title */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            عنوان المهمة
                                            <span className="text-red-500">*</span>
                                            <FieldTooltip content={FIELD_TOOLTIPS.title} />
                                        </label>
                                        <Input
                                            placeholder="مثال: مراجعة العقد النهائي"
                                            className={cn(
                                                "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 touch-target",
                                                touched.title && errors.title && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            )}
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            onBlur={() => handleBlur('title')}
                                        />
                                        {touched.title && errors.title && (
                                            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Status & Priority Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                                الحالة
                                                <FieldTooltip content={FIELD_TOOLTIPS.status} />
                                            </label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-emerald-500" />
                                                الأولوية
                                                <FieldTooltip content={FIELD_TOOLTIPS.priority} />
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                            التصنيف
                                            <FieldTooltip content={FIELD_TOOLTIPS.category} />
                                        </label>
                                        <Select value={formData.label} onValueChange={(value) => handleChange('label', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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

                                    {/* Action Buttons for Step 1 */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setOpenSections({ scheduling: true, assignment: false, description: false, subtasks: false })
                                                schedulingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 touch-target shadow-lg shadow-emerald-500/20"
                                        >
                                            <span className="flex items-center gap-2">
                                                متابعة
                                                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                            </span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleQuickSave}
                                            disabled={createTaskMutation.isPending}
                                            className="flex-1 rounded-xl h-12 touch-target border-slate-200 hover:bg-slate-50"
                                        >
                                            {createTaskMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    جاري الحفظ...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4" />
                                                    حفظ سريع
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* ===== SECTION 2: Scheduling ===== */}
                                <div ref={schedulingRef} className="space-y-4">
                                    <Collapsible open={openSections.scheduling} onOpenChange={() => toggleSection('scheduling')}>
                                        <CollapsibleTrigger asChild>
                                            <div>
                                                <SectionHeader
                                                    icon={<CalendarClock className="w-5 h-5" />}
                                                    title="الجدولة والوقت"
                                                    subtitle="حدد موعد الاستحقاق والوقت المتوقع"
                                                    badge="اختياري"
                                                    isOpen={openSections.scheduling}
                                                    onToggle={() => toggleSection('scheduling')}
                                                />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="collapsible-section">
                                            <div className="pt-4 space-y-4 px-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                            تاريخ الاستحقاق
                                                            <FieldTooltip content={FIELD_TOOLTIPS.dueDate} />
                                                        </label>
                                                        <Input
                                                            type="date"
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 touch-target"
                                                            value={formData.dueDate}
                                                            onChange={(e) => handleChange('dueDate', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                            الوقت
                                                            <FieldTooltip content={FIELD_TOOLTIPS.dueTime} />
                                                        </label>
                                                        <Input
                                                            type="time"
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 touch-target"
                                                            value={formData.dueTime}
                                                            onChange={(e) => handleChange('dueTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        الوقت المقدر (دقائق)
                                                        <FieldTooltip content={FIELD_TOOLTIPS.estimatedMinutes} />
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="60"
                                                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 touch-target"
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
                                                    <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 animate-fade-in-up">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">التكرار</label>
                                                                <Select
                                                                    value={recurringConfig.frequency}
                                                                    onValueChange={(value: RecurrenceFrequency) =>
                                                                        setRecurringConfig(prev => ({ ...prev, frequency: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12 touch-target">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {FREQUENCY_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">نوع التكرار</label>
                                                                <Select
                                                                    value={recurringConfig.type}
                                                                    onValueChange={(value: RecurrenceType) =>
                                                                        setRecurringConfig(prev => ({ ...prev, type: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12 touch-target">
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
                                                                <label className="text-sm font-medium text-slate-700">أيام الأسبوع</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {DAYS_OF_WEEK.map(day => (
                                                                        <Button
                                                                            key={day.value}
                                                                            type="button"
                                                                            variant={recurringConfig.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => toggleDayOfWeek(day.value)}
                                                                            className={cn(
                                                                                "rounded-full h-10 min-w-10 touch-target",
                                                                                recurringConfig.daysOfWeek?.includes(day.value) && "bg-emerald-500 hover:bg-emerald-600"
                                                                            )}
                                                                        >
                                                                            {day.label}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {recurringConfig.frequency === 'custom' && (
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">كل X أيام</label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-xl w-32 h-12 touch-target"
                                                                    value={recurringConfig.interval || 1}
                                                                    onChange={(e) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        interval: parseInt(e.target.value) || 1
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">استراتيجية التعيين</label>
                                                                <Select
                                                                    value={recurringConfig.assigneeStrategy}
                                                                    onValueChange={(value: AssigneeStrategy) =>
                                                                        setRecurringConfig(prev => ({ ...prev, assigneeStrategy: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-12 touch-target">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ASSIGNEE_STRATEGY_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                <div>
                                                                                    <p>{option.label}</p>
                                                                                    <p className="text-xs text-slate-500">{option.description}</p>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">تاريخ الانتهاء (اختياري)</label>
                                                                <Input
                                                                    type="date"
                                                                    className="rounded-xl h-12 touch-target"
                                                                    value={recurringConfig.endDate || ''}
                                                                    onChange={(e) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        endDate: e.target.value
                                                                    }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* ===== SECTION 3: Assignment ===== */}
                                <div ref={assignmentRef} className="space-y-4">
                                    <Collapsible open={openSections.assignment} onOpenChange={() => toggleSection('assignment')}>
                                        <CollapsibleTrigger asChild>
                                            <div>
                                                <SectionHeader
                                                    icon={<UserPlus className="w-5 h-5" />}
                                                    title="التعيين والربط"
                                                    subtitle="حدد المسؤول والعميل والقضية"
                                                    badge="اختياري"
                                                    isOpen={openSections.assignment}
                                                    onToggle={() => toggleSection('assignment')}
                                                />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="collapsible-section">
                                            <div className="pt-4 space-y-4 px-1">
                                                {/* Assign To */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        {t('tasks.assignedTo', 'تعيين إلى')}
                                                        <FieldTooltip content={FIELD_TOOLTIPS.assignedTo} />
                                                    </label>
                                                    <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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
                                                                        {member.role && ` (${member.role})`}
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

                                                {/* Client & Case Row */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                            {t('tasks.client', 'العميل')}
                                                            <FieldTooltip content={FIELD_TOOLTIPS.client} />
                                                        </label>
                                                        <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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
                                                                            {client.companyName && ` - ${client.companyName}`}
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
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Scale className="w-4 h-4 text-emerald-500" />
                                                            {t('tasks.linkedCase', 'القضية المرتبطة')}
                                                            <FieldTooltip content={FIELD_TOOLTIPS.case} />
                                                        </label>
                                                        <Select value={formData.caseId} onValueChange={(value) => handleChange('caseId', value)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-12 touch-target">
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
                                                                            {caseItem.caseNumber ? `${caseItem.caseNumber} - ` : ''}
                                                                            {caseItem.title}
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
                                                </div>

                                                {/* Tags */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-emerald-500" />
                                                        الوسوم
                                                        <FieldTooltip content={FIELD_TOOLTIPS.tags} />
                                                    </label>
                                                    <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                                                        {formData.tags.map(tag => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                                className="tag-pill gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
                                                            >
                                                                {tag}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="hover:text-red-500 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" aria-hidden="true" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="اكتب وسم واضغط Enter..."
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1 h-12 touch-target"
                                                            value={tagInput}
                                                            onChange={(e) => setTagInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    addTag()
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={addTag}
                                                            className="rounded-xl h-12 touch-target px-4"
                                                        >
                                                            <Plus className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* ===== SECTION 4: Description ===== */}
                                <div ref={descriptionRef} className="space-y-4">
                                    <Collapsible open={openSections.description} onOpenChange={() => toggleSection('description')}>
                                        <CollapsibleTrigger asChild>
                                            <div>
                                                <SectionHeader
                                                    icon={<AlignLeft className="w-5 h-5" />}
                                                    title="وصف المهمة"
                                                    subtitle="أضف تفاصيل إضافية عن المهمة"
                                                    badge="اختياري"
                                                    isOpen={openSections.description}
                                                    onToggle={() => toggleSection('description')}
                                                />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="collapsible-section">
                                            <div className="pt-4 px-1">
                                                <Textarea
                                                    placeholder="أدخل تفاصيل إضافية عن المهمة..."
                                                    className="min-h-[150px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                                                    value={formData.description}
                                                    onChange={(e) => handleChange('description', e.target.value)}
                                                />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* ===== SECTION 5: Subtasks & Reminders ===== */}
                                <div ref={subtasksRef} className="space-y-4">
                                    <Collapsible open={openSections.subtasks} onOpenChange={() => toggleSection('subtasks')}>
                                        <CollapsibleTrigger asChild>
                                            <div>
                                                <SectionHeader
                                                    icon={<ListTodo className="w-5 h-5" />}
                                                    title="المهام الفرعية والتذكيرات"
                                                    subtitle="أضف مهام فرعية وتذكيرات"
                                                    badge="خيارات متقدمة"
                                                    badgeVariant="advanced"
                                                    isOpen={openSections.subtasks}
                                                    onToggle={() => toggleSection('subtasks')}
                                                />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="collapsible-section">
                                            <div className="pt-4 space-y-6 px-1">
                                                {/* Subtasks */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <ListTodo className="w-4 h-4 text-emerald-500" />
                                                        المهام الفرعية
                                                        <FieldTooltip content={FIELD_TOOLTIPS.subtasks} />
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {subtasks.map((subtask, index) => (
                                                            <div
                                                                key={subtask.id}
                                                                className="animate-slide-in-right flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                                                                style={{ animationDelay: `${index * 0.05}s` }}
                                                            >
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
                                                                    <X className="w-4 h-4" aria-hidden="true" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('new-subtask-input')?.focus()}
                                                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        إضافة مهمة فرعية
                                                    </button>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="new-subtask-input"
                                                            placeholder="عنوان المهمة الفرعية..."
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1 h-12 touch-target"
                                                            value={newSubtask}
                                                            onChange={(e) => setNewSubtask(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    addSubtask()
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={addSubtask}
                                                            className="rounded-xl h-12 touch-target bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                            إضافة
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Reminders */}
                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <Bell className="w-4 h-4 text-emerald-500" />
                                                        التذكيرات
                                                        <FieldTooltip content={FIELD_TOOLTIPS.reminders} />
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {reminders.map((reminder, index) => (
                                                            <div
                                                                key={index}
                                                                className="animate-slide-in-right flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                                                                style={{ animationDelay: `${index * 0.05}s` }}
                                                            >
                                                                <Select
                                                                    value={reminder.type}
                                                                    onValueChange={(value) => updateReminder(index, 'type', value)}
                                                                >
                                                                    <SelectTrigger className="rounded-xl w-36 h-10">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {REMINDER_TYPE_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-slate-500 text-sm">قبل</span>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-xl w-20 h-10"
                                                                    value={reminder.beforeMinutes}
                                                                    onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                                                />
                                                                <span className="text-slate-500 text-sm">دقيقة</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeReminder(index)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 ms-auto"
                                                                >
                                                                    <X className="w-4 h-4" aria-hidden="true" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={addReminder}
                                                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        إضافة تذكير
                                                    </button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>

                                {/* ===== Submit Buttons ===== */}
                                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/tasks/list" className="w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full text-slate-500 hover:text-navy h-12 touch-target"
                                        >
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20 h-12 touch-target"
                                        disabled={createTaskMutation.isPending}
                                    >
                                        {createTaskMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                حفظ المهمة
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
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
