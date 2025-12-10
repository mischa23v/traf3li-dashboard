import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Loader2, Scale,
    Plus, X, Repeat, ListTodo, ChevronDown,
    Bell, Hash, ArrowRight, Sparkles, Clock, Briefcase
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

// Priority pill colors - using emerald theme to match hero card
const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-emerald-500 text-white',
    low: 'bg-emerald-400 text-white',
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

    // UI state for expanded sections
    const [showDescription, setShowDescription] = useState(false)
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const [showSubtasks, setShowSubtasks] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)
    const [showReminders, setShowReminders] = useState(false)
    const [tagInput, setTagInput] = useState('')

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
                id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        setShowReminders(true)
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
    const selectedClient = clients?.data?.find(c => c._id === formData.clientId)
    const selectedCase = cases?.cases?.find(c => c._id === formData.caseId)
    const selectedAssignee = teamMembers?.find(m => m._id === formData.assignedTo)

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
                    <div className="lg:col-span-2 space-y-5">
                        {/* Back Arrow Link */}
                        <Link to="/dashboard/tasks/list" className="inline-flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700 transition-colors">العودة لقائمة المهام</span>
                        </Link>

                        {/* Main Form Card - Redesigned */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <form onSubmit={handleSubmit}>
                                {/* Form Header with Title Input */}
                                <div className="p-6 sm:p-8 pb-0">
                                    {/* Section Label */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <ListTodo className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">معلومات المهمة</span>
                                    </div>

                                    {/* Title Input - Hero of the form */}
                                    <div className="space-y-2">
                                        <Input
                                            ref={titleInputRef}
                                            placeholder="ما المهمة التي تريد إنجازها؟"
                                            className="text-xl sm:text-2xl font-bold border-0 border-b-2 border-slate-100 focus:border-emerald-500 rounded-none shadow-none focus-visible:ring-0 px-0 h-auto py-4 placeholder:text-slate-300 placeholder:font-normal bg-transparent transition-all"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            required
                                            autoComplete="off"
                                        />
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            مثال: مراجعة عقد الشركة، إرسال تقرير القضية، الاتصال بالعميل
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Options Bar - Pill Style */}
                                <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Due Date Pill */}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        formData.dueDate
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' }) : 'موعد التسليم'}
                                                    {formData.dueDate && (
                                                        <X
                                                            className="w-3.5 h-3.5 hover:text-red-500 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleChange('dueDate', ''); handleChange('dueTime', ''); }}
                                                        />
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72 p-0 rounded-2xl shadow-xl border-0" align="start">
                                                {/* Quick date shortcuts */}
                                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                                    <p className="text-xs font-medium text-slate-500 mb-2">اختيار سريع</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleChange('dueDate', new Date().toISOString().split('T')[0])}
                                                            className="px-3 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                                                        >
                                                            اليوم
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const tomorrow = new Date();
                                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                                handleChange('dueDate', tomorrow.toISOString().split('T')[0]);
                                                            }}
                                                            className="px-3 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                                                        >
                                                            غداً
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const nextWeek = new Date();
                                                                nextWeek.setDate(nextWeek.getDate() + 7);
                                                                handleChange('dueDate', nextWeek.toISOString().split('T')[0]);
                                                            }}
                                                            className="px-3 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                                                        >
                                                            أسبوع
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">التاريخ</Label>
                                                        <Input
                                                            type="date"
                                                            className="rounded-xl h-11 border-slate-200"
                                                            value={formData.dueDate}
                                                            onChange={(e) => handleChange('dueDate', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">الوقت (اختياري)</Label>
                                                        <Input
                                                            type="time"
                                                            className="rounded-xl h-11 border-slate-200"
                                                            value={formData.dueTime}
                                                            onChange={(e) => handleChange('dueTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        {/* Priority Pill */}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        formData.priority !== 'medium'
                                                            ? formData.priority === 'urgent' ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                            : formData.priority === 'high' ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Flag className="w-4 h-4" />
                                                    {priorityLabels[formData.priority]}
                                                    {formData.priority !== 'medium' && (
                                                        <X
                                                            className="w-3.5 h-3.5 hover:text-red-500 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleChange('priority', 'medium'); }}
                                                        />
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-2 rounded-2xl shadow-xl border-0" align="start">
                                                {MAIN_PRIORITY_OPTIONS.map(option => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleChange('priority', option.value)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                            formData.priority === option.value ? "bg-slate-100" : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <span className={cn("w-3 h-3 rounded-full", option.dotColor)} />
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
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        selectedAssignee
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                    )}
                                                >
                                                    <User className="w-4 h-4" />
                                                    {selectedAssignee ? `${selectedAssignee.firstName} ${selectedAssignee.lastName}` : 'تعيين مسؤول'}
                                                    {selectedAssignee && (
                                                        <X
                                                            className="w-3.5 h-3.5 hover:text-red-500 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleChange('assignedTo', ''); }}
                                                        />
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72 p-2 rounded-2xl shadow-xl border-0" align="start">
                                                {teamLoading ? (
                                                    <div className="flex items-center justify-center py-6">
                                                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                                    </div>
                                                ) : teamMembers && teamMembers.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {teamMembers.map((member) => (
                                                            <button
                                                                key={member._id}
                                                                type="button"
                                                                onClick={() => handleChange('assignedTo', member._id)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all",
                                                                    formData.assignedTo === member._id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                                                    {member.firstName?.[0]}
                                                                </div>
                                                                <span className="font-medium">{member.firstName} {member.lastName}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 text-center py-6">لا يوجد أعضاء فريق</p>
                                                )}
                                            </PopoverContent>
                                        </Popover>

                                        {/* Status Pill */}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                                        formData.status !== 'backlog'
                                                            ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                    )}
                                                >
                                                    <ListTodo className="w-4 h-4" />
                                                    {ACTIVE_STATUS_OPTIONS.find(s => s.value === formData.status)?.label || 'الحالة'}
                                                    {formData.status !== 'backlog' && (
                                                        <X
                                                            className="w-3.5 h-3.5 hover:text-red-500 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleChange('status', 'backlog'); }}
                                                        />
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-56 p-2 rounded-2xl shadow-xl border-0" align="start">
                                                {ACTIVE_STATUS_OPTIONS.map(option => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => handleChange('status', option.value)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                                            formData.status === option.value ? "bg-slate-100" : "hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <span className={cn("w-3 h-3 rounded-full", option.bgColor)} />
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>

                                        {/* Add Description Toggle */}
                                        {!showDescription && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDescription(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-600 border border-dashed border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                                            >
                                                <FileText className="w-4 h-4" />
                                                + إضافة وصف
                                            </button>
                                        )}
                                    </div>

                                    {/* Description (expandable) */}
                                    {showDescription && (
                                        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                                            <Textarea
                                                placeholder="أضف وصفاً تفصيلياً للمهمة..."
                                                className="min-h-[100px] rounded-2xl border-slate-200 resize-none focus:border-emerald-500 text-base"
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Tags Section */}
                                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/30">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-500">الوسوم</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {formData.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                                                    <Hash className="w-3 h-3" />
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                            <div className="relative">
                                                <Input
                                                    list="tag-suggestions"
                                                    placeholder="+ أضف وسم"
                                                    className="border-0 shadow-none focus-visible:ring-0 w-28 h-8 text-sm px-2 bg-transparent placeholder:text-slate-400"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addTag()
                                                        }
                                                    }}
                                                />
                                                <datalist id="tag-suggestions">
                                                    {['عاجل', 'مهم', 'متابعة', 'مراجعة', 'قانوني', 'مالي', 'إداري', 'محكمة', 'عقد', 'استشارة'].filter(t => !formData.tags.includes(t)).map(suggestion => (
                                                        <option key={suggestion} value={suggestion} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>
                                        {/* Quick suggestions */}
                                        {formData.tags.length === 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <span className="text-xs text-slate-400">اقتراحات:</span>
                                                {['عاجل', 'متابعة', 'مراجعة', 'محكمة', 'عقد'].map(suggestion => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => handleChange('tags', [...formData.tags, suggestion])}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                                                    >
                                                        + {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Sections */}
                                <div className="divide-y divide-slate-100">
                                    {/* Client & Case Section */}
                                    <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                                        <div className="px-6 sm:px-8">
                                            <CollapsibleTrigger asChild>
                                                <button type="button" className="flex items-center justify-between w-full py-4 text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div className="text-start">
                                                            <span className="font-medium text-slate-700">ربط بعميل أو قضية</span>
                                                            {(selectedClient || selectedCase) && (
                                                                <p className="text-xs text-emerald-600 mt-0.5">
                                                                    {selectedClient?.fullName || ''}{selectedCase?.title ? ` • ${selectedCase.title}` : ''}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showMoreOptions && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pb-5">
                                                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-600">العميل</Label>
                                                            <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                                                            <Label className="text-sm font-medium text-slate-600">القضية</Label>
                                                            <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-600">التصنيف</Label>
                                                            <Select value={formData.label} onValueChange={(v) => handleChange('label', v)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-600">الوقت المقدر</Label>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="60"
                                                                    className="rounded-xl border-slate-200 h-12 bg-white pe-16"
                                                                    value={formData.estimatedMinutes || ''}
                                                                    onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value) || 0)}
                                                                />
                                                                <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">دقيقة</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>

                                    {/* Subtasks Section */}
                                    <Collapsible open={showSubtasks} onOpenChange={setShowSubtasks}>
                                        <div className="px-6 sm:px-8">
                                            <CollapsibleTrigger asChild>
                                                <button type="button" className="flex items-center justify-between w-full py-4 text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                                            <ListTodo className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div className="text-start">
                                                            <span className="font-medium text-slate-700">المهام الفرعية</span>
                                                            {subtasks.length > 0 && (
                                                                <span className="ms-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                                                    {subtasks.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showSubtasks && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pb-5">
                                                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    {subtasks.length > 0 && (
                                                        <div className="space-y-2">
                                                            {subtasks.map((subtask) => (
                                                                <div key={subtask.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
                                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                                    <span className="flex-1 text-slate-700">{subtask.title}</span>
                                                                    {isRecurring && (
                                                                        <label className="flex items-center gap-2 text-xs text-slate-500">
                                                                            <Checkbox
                                                                                checked={subtask.autoReset}
                                                                                onCheckedChange={() => toggleSubtaskAutoReset(subtask.id)}
                                                                                className="h-4 w-4"
                                                                            />
                                                                            إعادة تعيين
                                                                        </label>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSubtask(subtask.id)}
                                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="أضف مهمة فرعية..."
                                                            className="rounded-xl border-slate-200 flex-1 h-12 bg-white"
                                                            value={newSubtask}
                                                            onChange={(e) => setNewSubtask(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    addSubtask()
                                                                }
                                                            }}
                                                        />
                                                        <Button type="button" onClick={addSubtask} className="rounded-xl h-12 px-5 bg-purple-500 hover:bg-purple-600">
                                                            <Plus className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>

                                    {/* Recurring Section */}
                                    <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                        <div className="px-6 sm:px-8">
                                            <CollapsibleTrigger asChild>
                                                <button type="button" className="flex items-center justify-between w-full py-4 text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                                            <Repeat className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div className="text-start">
                                                            <span className="font-medium text-slate-700">تكرار المهمة</span>
                                                            {isRecurring && (
                                                                <span className="ms-2 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                                    مفعّل
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showRecurring && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pb-5">
                                                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                                                        <Checkbox
                                                            id="recurring-toggle"
                                                            checked={isRecurring}
                                                            onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                                            className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                        <label htmlFor="recurring-toggle" className="flex-1 cursor-pointer">
                                                            <span className="font-medium text-slate-700">تفعيل التكرار</span>
                                                            <p className="text-xs text-slate-500 mt-0.5">ستتكرر المهمة تلقائياً حسب الجدول المحدد</p>
                                                        </label>
                                                    </div>

                                                    {isRecurring && (
                                                        <div className="space-y-4 p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium text-slate-600">التكرار</Label>
                                                                    <Select
                                                                        value={recurringConfig.frequency}
                                                                        onValueChange={(v: RecurrenceFrequency) => setRecurringConfig(prev => ({ ...prev, frequency: v }))}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl h-12 bg-white">
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
                                                                    <Label className="text-sm font-medium text-slate-600">نوع التكرار</Label>
                                                                    <Select
                                                                        value={recurringConfig.type}
                                                                        onValueChange={(v: RecurrenceType) => setRecurringConfig(prev => ({ ...prev, type: v }))}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl h-12 bg-white">
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
                                                                    <Label className="text-sm font-medium text-slate-600">أيام الأسبوع</Label>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {DAYS_OF_WEEK.map(day => (
                                                                            <button
                                                                                key={day.value}
                                                                                type="button"
                                                                                onClick={() => toggleDayOfWeek(day.value)}
                                                                                className={cn(
                                                                                    "w-11 h-11 rounded-xl text-sm font-medium transition-all",
                                                                                    recurringConfig.daysOfWeek?.includes(day.value)
                                                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
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
                                                                    <Label className="text-sm font-medium text-slate-600">كل X أيام</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        className="rounded-xl w-32 h-12 bg-white"
                                                                        value={recurringConfig.interval || 1}
                                                                        onChange={(e) => setRecurringConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                                                                    />
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium text-slate-600">استراتيجية التعيين</Label>
                                                                    <Select
                                                                        value={recurringConfig.assigneeStrategy}
                                                                        onValueChange={(v: AssigneeStrategy) => setRecurringConfig(prev => ({ ...prev, assigneeStrategy: v }))}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl h-12 bg-white">
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
                                                                    <Label className="text-sm font-medium text-slate-600">تاريخ الانتهاء</Label>
                                                                    <Input
                                                                        type="date"
                                                                        className="rounded-xl h-12 bg-white"
                                                                        value={recurringConfig.endDate || ''}
                                                                        onChange={(e) => setRecurringConfig(prev => ({ ...prev, endDate: e.target.value }))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>

                                    {/* Reminders Section */}
                                    <Collapsible open={showReminders} onOpenChange={setShowReminders}>
                                        <div className="px-6 sm:px-8">
                                            <CollapsibleTrigger asChild>
                                                <button type="button" className="flex items-center justify-between w-full py-4 text-sm group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                                                            <Bell className="w-4 h-4 text-rose-600" />
                                                        </div>
                                                        <div className="text-start">
                                                            <span className="font-medium text-slate-700">التذكيرات</span>
                                                            {reminders.length > 0 && (
                                                                <span className="ms-2 px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700">
                                                                    {reminders.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showReminders && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pb-5">
                                                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                                    {reminders.length > 0 && (
                                                        <div className="space-y-2">
                                                            {reminders.map((reminder, index) => (
                                                                <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
                                                                    <Select
                                                                        value={reminder.type}
                                                                        onValueChange={(v) => updateReminder(index, 'type', v)}
                                                                    >
                                                                        <SelectTrigger className="rounded-xl w-36 h-10 text-sm bg-white">
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
                                                                        className="rounded-xl w-20 h-10 text-sm bg-white"
                                                                        value={reminder.beforeMinutes}
                                                                        onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                                                    />
                                                                    <span className="text-sm text-slate-500">دقيقة</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeReminder(index)}
                                                                        className="text-slate-400 hover:text-red-500 transition-colors ms-auto"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={addReminder}
                                                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition-all text-sm font-medium"
                                                    >
                                                        <Plus className="w-4 h-4 inline-block ms-2" />
                                                        إضافة تذكير
                                                    </button>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                </div>

                                {/* Footer / Actions */}
                                <div className="px-6 sm:px-8 py-5 bg-slate-50/50 border-t border-slate-100">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Templates */}
                                        <div className="flex-1">
                                            {templates && templates.length > 0 && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button type="button" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2 transition-colors">
                                                            <Sparkles className="w-4 h-4" />
                                                            استخدم قالب
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-2 rounded-2xl shadow-xl border-0" align="start">
                                                        {templates.slice(0, 5).map((template) => (
                                                            <button
                                                                key={template._id}
                                                                type="button"
                                                                onClick={() => handleUseTemplate(template._id)}
                                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors text-start"
                                                                disabled={createFromTemplateMutation.isPending}
                                                            >
                                                                <FileText className="w-4 h-4 text-slate-400" />
                                                                <span className="flex-1 truncate text-slate-600">{template.title}</span>
                                                            </button>
                                                        ))}
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-3">
                                            <Link to="/dashboard/tasks/list">
                                                <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 rounded-xl h-11 px-5">
                                                    إلغاء
                                                </Button>
                                            </Link>
                                            <Button
                                                type="submit"
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-8 shadow-lg shadow-emerald-500/20 font-medium"
                                                disabled={createTaskMutation.isPending}
                                            >
                                                {createTaskMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin ms-2" />
                                                        جاري الحفظ
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 ms-2" />
                                                        حفظ المهمة
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Helpful hint */}
                                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        اضغط <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Enter</kbd> للحفظ السريع
                                    </p>
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
