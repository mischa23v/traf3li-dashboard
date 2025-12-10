import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Users, Loader2, Scale,
    Plus, X, Clock, Tag, Repeat, ListTodo, ChevronDown,
    Zap, Bell, Check, Hash, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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

// Priority pill colors
const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-slate-400 text-white',
}

const priorityLabels: Record<string, string> = {
    urgent: 'عاجل',
    high: 'مرتفع',
    medium: 'متوسط',
    low: 'منخفض',
}

export function CreateTaskView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createTaskMutation = useCreateTask()
    const { data: templates } = useTaskTemplates()
    const createFromTemplateMutation = useCreateFromTemplate()
    const titleInputRef = useRef<HTMLInputElement>(null)

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

    // Collapsible section states (start closed by default)
    const [showScheduling, setShowScheduling] = useState(false)
    const [showSubtasks, setShowSubtasks] = useState(false)
    const [showReminders, setShowReminders] = useState(false)
    const [showMoreDetails, setShowMoreDetails] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Check if basic info is complete
    const isBasicComplete = formData.title.trim().length > 0

    // Auto-focus title on mount
    useEffect(() => {
        titleInputRef.current?.focus()
    }, [])

    // Keyboard shortcut: CMD+Enter to save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                const form = document.querySelector('form')
                if (form) form.requestSubmit()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

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

        if (!formData.title.trim()) {
            toast.error('عنوان المهمة مطلوب')
            titleInputRef.current?.focus()
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

    // Get display values
    const selectedAssignee = teamMembers?.find(m => m._id === formData.assignedTo)
    const selectedClient = clients?.data?.find(c => c._id === formData.clientId)
    const selectedCase = cases?.cases?.find(c => c._id === formData.caseId)

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
                    <div className="lg:col-span-2 space-y-4">

                        {/* Templates Section */}
                        {templates && templates.length > 0 && (
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardContent className="py-4">
                                    <p className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        إنشاء سريع من قالب:
                                    </p>
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* CARD 1: Basic Details - Minimal Style */}
                            <div ref={basicRef}>
                                <Card className="rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                                المعلومات الأساسية
                                            </CardTitle>
                                            {isBasicComplete && (
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-xs font-medium">مكتمل</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">اضغط ⌘+Enter للحفظ السريع</p>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-5">
                                        {/* Title Input - Hero Style */}
                                        <div className="space-y-2">
                                            <Input
                                                ref={titleInputRef}
                                                placeholder="ما المهمة التي تريد إنجازها؟"
                                                className="text-lg font-medium border-0 shadow-none focus-visible:ring-0 px-0 h-auto py-2 placeholder:text-slate-300 bg-transparent"
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                            />
                                            <div className="h-px bg-slate-200" />
                                        </div>

                                        {/* Quick Action Pills */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Due Date Pill */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                                                            formData.dueDate
                                                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('ar-SA') : 'تاريخ'}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-3" align="start">
                                                    <div className="space-y-3">
                                                        <Label className="text-xs text-slate-500">تاريخ الاستحقاق</Label>
                                                        <Input
                                                            type="date"
                                                            className="rounded-lg h-10"
                                                            value={formData.dueDate}
                                                            onChange={(e) => handleChange('dueDate', e.target.value)}
                                                        />
                                                        <Label className="text-xs text-slate-500">الوقت</Label>
                                                        <Input
                                                            type="time"
                                                            className="rounded-lg h-10"
                                                            value={formData.dueTime}
                                                            onChange={(e) => handleChange('dueTime', e.target.value)}
                                                        />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Priority Pill */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                                                            priorityColors[formData.priority]
                                                        )}
                                                    >
                                                        <Flag className="w-3.5 h-3.5" />
                                                        {priorityLabels[formData.priority]}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-40 p-2" align="start">
                                                    {MAIN_PRIORITY_OPTIONS.map(option => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => handleChange('priority', option.value)}
                                                            className={cn(
                                                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                                                formData.priority === option.value ? "bg-slate-100" : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <span className={cn("w-2 h-2 rounded-full", option.dotColor)} />
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </PopoverContent>
                                            </Popover>

                                            {/* Assignee Pill */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                                                            selectedAssignee
                                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        <User className="w-3.5 h-3.5" />
                                                        {selectedAssignee ? `${selectedAssignee.firstName} ${selectedAssignee.lastName}` : 'تعيين'}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-2" align="start">
                                                    {teamLoading ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : teamMembers && teamMembers.length > 0 ? (
                                                        teamMembers.map((member) => (
                                                            <button
                                                                key={member._id}
                                                                type="button"
                                                                onClick={() => handleChange('assignedTo', member._id)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                                                    formData.assignedTo === member._id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                                                                    {member.firstName?.[0]}
                                                                </div>
                                                                {member.firstName} {member.lastName}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-500 text-center py-4">لا يوجد أعضاء فريق</p>
                                                    )}
                                                </PopoverContent>
                                            </Popover>

                                            {/* Status Pill */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                                                    >
                                                        <ListTodo className="w-3.5 h-3.5" />
                                                        {ACTIVE_STATUS_OPTIONS.find(s => s.value === formData.status)?.label || 'الحالة'}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 p-2" align="start">
                                                    {ACTIVE_STATUS_OPTIONS.map(option => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => handleChange('status', option.value)}
                                                            className={cn(
                                                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                                                formData.status === option.value ? "bg-slate-100" : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <span className={cn("w-2 h-2 rounded-full", option.bgColor)} />
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </PopoverContent>
                                            </Popover>

                                            {/* Category Pill */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                                                            formData.label
                                                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        <Tag className="w-3.5 h-3.5" />
                                                        {CATEGORY_OPTIONS.find(c => c.value === formData.label)?.label || 'التصنيف'}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 p-2" align="start">
                                                    {CATEGORY_OPTIONS.map(option => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => handleChange('label', option.value)}
                                                            className={cn(
                                                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                                                formData.label === option.value ? "bg-slate-100" : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <Badge variant="secondary" className={cn("text-xs", option.bgColor, option.color)}>
                                                                {option.label}
                                                            </Badge>
                                                        </button>
                                                    ))}
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Tags - Inline Style */}
                                        <div className="flex flex-wrap items-center gap-2 py-2">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                    <Hash className="w-3 h-3" />
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 ms-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <Input
                                                placeholder="+ أضف وسم"
                                                className="border-0 shadow-none focus-visible:ring-0 w-28 h-8 text-sm px-2 bg-transparent"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addTag()
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Textarea
                                                placeholder="أضف وصفاً للمهمة... (اختياري)"
                                                className="min-h-[80px] rounded-xl border-slate-200 resize-none focus:border-emerald-500"
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                            />
                                        </div>

                                        {/* More Details - Collapsible */}
                                        <Collapsible open={showMoreDetails} onOpenChange={setShowMoreDetails}>
                                            <CollapsibleTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center justify-between py-3 text-slate-600 hover:text-slate-800 transition-colors border-t border-slate-100"
                                                >
                                                    <span className="flex items-center gap-2 text-sm font-medium">
                                                        <Scale className="w-4 h-4" />
                                                        تفاصيل إضافية
                                                        {(selectedClient || selectedCase || formData.estimatedMinutes > 0) && (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                                                                معبأ
                                                            </Badge>
                                                        )}
                                                    </span>
                                                    <ChevronDown className={cn("w-4 h-4 transition-transform", showMoreDetails && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-slate-500">العميل</Label>
                                                            <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                                                                    <SelectValue placeholder="اختر العميل" />
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
                                                                        <div className="text-center py-4 text-slate-500 text-sm">لا يوجد عملاء</div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-slate-500">القضية المرتبطة</Label>
                                                            <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                                                                    <SelectValue placeholder="اختر القضية" />
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
                                                                        <div className="text-center py-4 text-slate-500 text-sm">لا توجد قضايا</div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">الوقت المقدر (دقائق)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="60"
                                                            className="rounded-xl border-slate-200 h-11 w-32"
                                                            value={formData.estimatedMinutes || ''}
                                                            onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* CARD 2: Recurring Task */}
                            <div ref={schedulingRef}>
                                <Collapsible open={showScheduling} onOpenChange={setShowScheduling}>
                                    <Card className="rounded-3xl shadow-sm border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100 py-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                        <Repeat className="w-5 h-5 text-emerald-500" />
                                                        مهمة متكررة
                                                        {isRecurring && (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                                                                مفعّل
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", showScheduling && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-5 pt-6">
                                                {/* Recurring Toggle */}
                                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                                    <Checkbox
                                                        id="recurring-toggle"
                                                        checked={isRecurring}
                                                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                                        className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                    <label htmlFor="recurring-toggle" className="flex-1 cursor-pointer">
                                                        <span className="font-medium text-slate-700">تفعيل التكرار</span>
                                                        <p className="text-xs text-slate-500">ستتكرر المهمة تلقائياً حسب الجدول المحدد</p>
                                                    </label>
                                                </div>

                                                {/* Recurring Options */}
                                                {isRecurring && (
                                                    <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium text-slate-700">التكرار</Label>
                                                                <Select
                                                                    value={recurringConfig.frequency}
                                                                    onValueChange={(v: RecurrenceFrequency) => setRecurringConfig(prev => ({ ...prev, frequency: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl h-11">
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
                                                                    <SelectTrigger className="rounded-xl h-11">
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
                                                                        <button
                                                                            key={day.value}
                                                                            type="button"
                                                                            onClick={() => toggleDayOfWeek(day.value)}
                                                                            className={cn(
                                                                                "w-10 h-10 rounded-full text-sm font-medium transition-all",
                                                                                recurringConfig.daysOfWeek?.includes(day.value)
                                                                                    ? "bg-emerald-500 text-white"
                                                                                    : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300"
                                                                            )}
                                                                        >
                                                                            {day.label}
                                                                        </button>
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
                                                                    className="rounded-xl w-32 h-11"
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
                                                                    <SelectTrigger className="rounded-xl h-11">
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
                                                                    className="rounded-xl h-11"
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
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100 py-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
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
                                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
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
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="أضف مهمة فرعية..."
                                                        className="rounded-xl border-slate-200 flex-1 h-11"
                                                        value={newSubtask}
                                                        onChange={(e) => setNewSubtask(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addSubtask()
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" onClick={addSubtask} size="sm" className="rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600">
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
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
                                            <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-3xl bg-slate-50/50 border-b border-slate-100 py-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
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
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                                <Select
                                                                    value={reminder.type}
                                                                    onValueChange={(v) => updateReminder(index, 'type', v)}
                                                                >
                                                                    <SelectTrigger className="rounded-lg w-32 h-9 text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {REMINDER_TYPE_OPTIONS.map(option => (
                                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-sm text-slate-500">قبل</span>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-lg w-20 h-9 text-sm"
                                                                    value={reminder.beforeMinutes}
                                                                    onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                                                />
                                                                <span className="text-sm text-slate-500">دقيقة</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeReminder(index)}
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 ms-auto"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={addReminder}
                                                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all text-sm"
                                                >
                                                    <Plus className="w-4 h-4 inline-block ms-2" />
                                                    إضافة تذكير
                                                </button>
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
                                            <Button type="button" variant="ghost" className="w-full text-slate-500 hover:text-slate-700 h-11">
                                                إلغاء
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20 h-11"
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
