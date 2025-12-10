import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Loader2, Scale,
    Plus, X, Repeat, ListTodo, ChevronDown, ChevronUp,
    Bell, Hash, ArrowRight, CheckSquare, Clock
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

    // Validation state
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

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
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field)
    }

    const validateField = (field: string) => {
        let error = ''
        if (field === 'title' && !formData.title.trim()) {
            error = 'عنوان المهمة مطلوب'
        }
        setErrors(prev => ({ ...prev, [field]: error }))
        return !error
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
            setTouched(prev => ({ ...prev, title: true }))
            setErrors(prev => ({ ...prev, title: 'عنوان المهمة مطلوب' }))
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
                    <div className="lg:col-span-2 space-y-4">
                        {/* Back Arrow Link - Styled like sidebar cards */}
                        <Link to="/dashboard/tasks/list" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <span className="text-base font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">العودة لقائمة المهام</span>
                        </Link>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <CheckSquare className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900">مهمة جديدة</h1>
                                            <p className="text-base text-slate-500">للحفظ السريع اضغط كنترول + إنتر</p>
                                        </div>
                                    </div>

                                    {/* Title input with label */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-600">عنوان المهمة</label>
                                        <Input
                                            ref={titleInputRef}
                                            placeholder="مثال: مراجعة عقد الشركة، إرسال تقرير القضية"
                                            className={cn(
                                                "text-lg font-semibold border border-slate-200 focus:border-emerald-500 rounded-xl shadow-none focus-visible:ring-0 px-4 h-12 placeholder:text-slate-400 placeholder:font-normal bg-slate-50/50",
                                                touched.title && errors.title && "border-red-500 focus:border-red-500"
                                            )}
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            onBlur={() => handleBlur('title')}
                                        />
                                        {touched.title && errors.title && (
                                            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div className="px-8 py-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Priority */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-emerald-500" />
                                                الأولوية
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
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

                                        {/* Status */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                                الحالة
                                            </label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
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

                                        {/* Due Date */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الاستحقاق
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:ring-emerald-500"
                                                value={formData.dueDate}
                                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                            />
                                        </div>

                                        {/* Due Time */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                الوقت
                                            </label>
                                            <Input
                                                type="time"
                                                className="rounded-xl border-slate-200 focus:ring-emerald-500"
                                                value={formData.dueTime}
                                                onChange={(e) => handleChange('dueTime', e.target.value)}
                                            />
                                        </div>

                                        {/* Assignee */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                المسؤول
                                            </label>
                                            <Select value={formData.assignedTo} onValueChange={(v) => handleChange('assignedTo', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر المسؤول" />
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
                                                        <div className="text-center py-4 text-slate-500 text-sm">لا يوجد أعضاء فريق</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                التصنيف
                                            </label>
                                            <Select value={formData.label} onValueChange={(v) => handleChange('label', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            الوصف
                                        </label>
                                        <Textarea
                                            placeholder="أضف وصفاً تفصيلياً للمهمة..."
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:ring-emerald-500 resize-none"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">الوسوم</label>
                                        <div className="flex flex-wrap items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                                    <Hash className="w-3 h-3" />
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 ms-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <Input
                                                list="tag-suggestions"
                                                placeholder="+ أضف وسم"
                                                className="border-0 shadow-none focus-visible:ring-0 w-32 h-8 text-sm px-2 bg-transparent"
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
                                </div>

                                {/* Client & Case Section */}
                                <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                                    <div className="border-t border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-6 h-auto hover:bg-slate-50 rounded-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                        <Scale className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-base font-semibold text-slate-800">ربط بعميل أو قضية</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {selectedClient || selectedCase
                                                                ? `${selectedClient?.fullName || ''}${selectedCase?.title ? ` - ${selectedCase.title}` : ''}`
                                                                : 'اختياري - ربط المهمة بعميل أو قضية'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {showMoreOptions ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-8 pb-6 space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">العميل</Label>
                                                        <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
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
                                                        <Label className="text-sm text-slate-600">القضية</Label>
                                                        <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
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
                                                    <Label className="text-sm text-slate-600">الوقت المقدر (دقائق)</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="60"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.estimatedMinutes || ''}
                                                        onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Subtasks Section */}
                                <Collapsible open={showSubtasks} onOpenChange={setShowSubtasks}>
                                    <div className="border-t border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-6 h-auto hover:bg-slate-50 rounded-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                        <ListTodo className="w-5 h-5 text-purple-500" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-base font-semibold text-slate-800">
                                                            المهام الفرعية
                                                            {subtasks.length > 0 && (
                                                                <Badge variant="secondary" className="ms-2 bg-purple-100 text-purple-700">
                                                                    {subtasks.length}
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">قسّم المهمة إلى خطوات أصغر</p>
                                                    </div>
                                                </div>
                                                {showSubtasks ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-8 pb-6 space-y-4">
                                                {subtasks.length > 0 && (
                                                    <div className="space-y-2">
                                                        {subtasks.map((subtask) => (
                                                            <div key={subtask.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                                                <span className="flex-1 text-slate-700 text-sm">{subtask.title}</span>
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
                                                        className="rounded-xl border-slate-200 flex-1"
                                                        value={newSubtask}
                                                        onChange={(e) => setNewSubtask(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addSubtask()
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" onClick={addSubtask} className="rounded-xl bg-emerald-500 hover:bg-emerald-600">
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Recurring Section */}
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-6 h-auto hover:bg-slate-50 rounded-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                        <Repeat className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-base font-semibold text-slate-800">
                                                            تكرار المهمة
                                                            {isRecurring && (
                                                                <Badge variant="secondary" className="ms-2 bg-amber-100 text-amber-700">
                                                                    مفعّل
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">جدولة المهمة للتكرار تلقائياً</p>
                                                    </div>
                                                </div>
                                                {showRecurring ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-8 pb-6 space-y-4">
                                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                                    <Checkbox
                                                        id="recurring-toggle"
                                                        checked={isRecurring}
                                                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                                        className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                    <label htmlFor="recurring-toggle" className="flex-1 cursor-pointer">
                                                        <span className="font-medium text-slate-700">تفعيل التكرار</span>
                                                        <p className="text-xs text-slate-500">ستتكرر المهمة تلقائياً حسب الجدول المحدد</p>
                                                    </label>
                                                </div>

                                                {isRecurring && (
                                                    <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">التكرار</Label>
                                                                <Select
                                                                    value={recurringConfig.frequency}
                                                                    onValueChange={(v: RecurrenceFrequency) => setRecurringConfig(prev => ({ ...prev, frequency: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
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
                                                                <Label className="text-sm text-slate-600">نوع التكرار</Label>
                                                                <Select
                                                                    value={recurringConfig.type}
                                                                    onValueChange={(v: RecurrenceType) => setRecurringConfig(prev => ({ ...prev, type: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
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
                                                                <Label className="text-sm text-slate-600">أيام الأسبوع</Label>
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
                                                                <Label className="text-sm text-slate-600">كل X أيام</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-xl w-32"
                                                                    value={recurringConfig.interval || 1}
                                                                    onChange={(e) => setRecurringConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">استراتيجية التعيين</Label>
                                                                <Select
                                                                    value={recurringConfig.assigneeStrategy}
                                                                    onValueChange={(v: AssigneeStrategy) => setRecurringConfig(prev => ({ ...prev, assigneeStrategy: v }))}
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
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
                                                                <Label className="text-sm text-slate-600">تاريخ الانتهاء</Label>
                                                                <Input
                                                                    type="date"
                                                                    className="rounded-xl"
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
                                    <div className="border-t border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-6 h-auto hover:bg-slate-50 rounded-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                                        <Bell className="w-5 h-5 text-rose-500" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-base font-semibold text-slate-800">
                                                            التذكيرات
                                                            {reminders.length > 0 && (
                                                                <Badge variant="secondary" className="ms-2 bg-rose-100 text-rose-700">
                                                                    {reminders.length}
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">إضافة تذكيرات للمهمة</p>
                                                    </div>
                                                </div>
                                                {showReminders ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-8 pb-6 space-y-4">
                                                {reminders.length > 0 && (
                                                    <div className="space-y-2">
                                                        {reminders.map((reminder, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                                <Select
                                                                    value={reminder.type}
                                                                    onValueChange={(v) => updateReminder(index, 'type', v)}
                                                                >
                                                                    <SelectTrigger className="rounded-lg w-32">
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
                                                                    className="rounded-lg w-20"
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
                                                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all text-sm"
                                                >
                                                    <Plus className="w-4 h-4 inline-block ms-2" />
                                                    إضافة تذكير
                                                </button>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Footer / Actions */}
                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 ms-auto">
                                        <Link to="/dashboard/tasks/list">
                                            <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 h-11 px-6">
                                                إلغاء
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 h-11 px-8 font-medium"
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
