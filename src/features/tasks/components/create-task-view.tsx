import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Loader2, Scale,
    Plus, X, Repeat, ListTodo, ChevronDown, ChevronUp,
    Bell, ArrowRight, Sparkles, Clock, Briefcase, AlertCircle, Users, CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// Gosi Design System Components
import {
    GosiCard,
    GosiInput,
    GosiTextarea,
    GosiLabel,
    GosiSelect,
    GosiSelectItem,
    GosiButton,
} from '@/components/ui/gosi-ui'
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
    const [tagInput, setTagInput] = useState('')
    const [showSubtasks, setShowSubtasks] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)
    const [showReminders, setShowReminders] = useState(false)
    const [showClientCase, setShowClientCase] = useState(false)

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

        const taskData = {
            // Required API fields with defaults for testing
            title: formData.title || 'مهمة جديدة',
            status: formData.status || 'todo',
            priority: formData.priority || 'medium',
            taskType: 'other',
            // Optional fields
            description: formData.description,
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
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Back Arrow Link */}
                        <Link to="/dashboard/tasks/list" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <span className="text-base font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">العودة لقائمة المهام</span>
                        </Link>

                        {/* Form Card - Gosi Premium Design */}
                        <GosiCard className="p-0">
                            <form onSubmit={handleSubmit}>
                                {/* NO HEADER - Start directly with Title (Gosi Pattern) */}
                                <div className="px-8 pt-8 pb-6">
                                    {/* Title input - Large & Prominent */}
                                    <div className="space-y-3">
                                        <GosiLabel icon={<CheckSquare className="w-4 h-4" />}>
                                            عنوان المهمة
                                        </GosiLabel>
                                        <GosiInput
                                            ref={titleInputRef}
                                            placeholder="اكتب عنوان المهمة هنا..."
                                            className="text-lg font-semibold"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* Basic Info - Gosi Premium Fields */}
                                <div className="px-8 py-6 space-y-6 border-t border-slate-100/50">
                                    {/* Row 1: Status & Priority */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <GosiLabel icon={<AlertCircle className="w-4 h-4" />}>
                                                الحالة
                                            </GosiLabel>
                                            <GosiSelect
                                                value={formData.status}
                                                onValueChange={(value) => handleChange('status', value)}
                                                placeholder="اختر الحالة"
                                            >
                                                {ACTIVE_STATUS_OPTIONS.map(option => (
                                                    <GosiSelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("w-2 h-2 rounded-full", option.bgColor)} />
                                                            {option.label}
                                                        </div>
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelect>
                                        </div>
                                        <div className="space-y-3">
                                            <GosiLabel icon={<Flag className="w-4 h-4" />}>
                                                الأولوية
                                            </GosiLabel>
                                            <GosiSelect
                                                value={formData.priority}
                                                onValueChange={(value) => handleChange('priority', value)}
                                                placeholder="اختر الأولوية"
                                            >
                                                {MAIN_PRIORITY_OPTIONS.map(option => (
                                                    <GosiSelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("w-2 h-2 rounded-full", option.dotColor)} />
                                                            {option.label}
                                                        </div>
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelect>
                                        </div>
                                    </div>

                                    {/* Row 2: COMPACT DATE ROW (Critical Gosi Pattern!) */}
                                    {/* Date: 180px fixed, Time: 130px fixed, Assignee: flex-1 */}
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="space-y-3 w-full md:w-auto">
                                            <GosiLabel icon={<Calendar className="w-4 h-4" />}>
                                                التاريخ
                                            </GosiLabel>
                                            <GosiInput
                                                type="date"
                                                variant="compact"
                                                className="w-full md:w-[180px] text-center text-sm font-bold"
                                                value={formData.dueDate}
                                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3 w-full md:w-auto">
                                            <GosiLabel icon={<Clock className="w-4 h-4" />}>
                                                الوقت
                                            </GosiLabel>
                                            <GosiInput
                                                type="time"
                                                variant="compact"
                                                className="w-full md:w-[130px] text-center text-sm font-bold"
                                                value={formData.dueTime}
                                                onChange={(e) => handleChange('dueTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <GosiLabel icon={<Users className="w-4 h-4" />}>
                                                تعيين إلى
                                            </GosiLabel>
                                            <GosiSelect
                                                value={formData.assignedTo}
                                                onValueChange={(value) => handleChange('assignedTo', value)}
                                                placeholder="اختر المسؤول (اختياري)"
                                            >
                                                {teamLoading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : teamMembers && teamMembers.length > 0 ? (
                                                    teamMembers.map((member) => (
                                                        <GosiSelectItem key={member._id} value={member._id}>
                                                            {member.firstName} {member.lastName}
                                                        </GosiSelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-slate-500 text-sm">لا يوجد أعضاء فريق</div>
                                                )}
                                            </GosiSelect>
                                        </div>
                                    </div>

                                    {/* Row 3: Category */}
                                    <div className="space-y-3">
                                        <GosiLabel icon={<Briefcase className="w-4 h-4" />}>
                                            التصنيف
                                        </GosiLabel>
                                        <GosiSelect
                                            value={formData.label}
                                            onValueChange={(value) => handleChange('label', value)}
                                            placeholder="اختر التصنيف (اختياري)"
                                            className="max-w-md"
                                        >
                                            {CATEGORY_OPTIONS.map(option => (
                                                <GosiSelectItem key={option.value} value={option.value}>
                                                    <Badge variant="secondary" className={cn("text-xs", option.bgColor, option.color)}>
                                                        {option.label}
                                                    </Badge>
                                                </GosiSelectItem>
                                            ))}
                                        </GosiSelect>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-3">
                                        <GosiLabel>الوسوم</GosiLabel>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1 rounded-full px-3 py-1">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                        <X className="w-3 h-3" aria-hidden="true" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <GosiInput
                                                placeholder="أضف وسم..."
                                                variant="compact"
                                                className="flex-1"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addTag()
                                                    }
                                                }}
                                            />
                                            <GosiButton type="button" variant="secondary" size="sm" onClick={addTag}>
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                            </GosiButton>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <GosiLabel icon={<FileText className="w-4 h-4" />}>
                                            الوصف
                                        </GosiLabel>
                                        <GosiTextarea
                                            placeholder="أدخل وصف المهمة..."
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Client & Case Section */}
                                <Collapsible open={showClientCase} onOpenChange={setShowClientCase}>
                                    <div className="border-t border-slate-100 px-8 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Scale className="w-5 h-5 text-emerald-500" />
                                                    ربط بعميل أو قضية
                                                </h3>
                                                {showClientCase ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">العميل</label>
                                                        <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر العميل (اختياري)" />
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
                                                        <label className="text-sm font-medium text-slate-700">القضية</label>
                                                        <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر القضية (اختياري)" />
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
                                                    <label className="text-sm font-medium text-slate-700">الوقت المقدر (دقائق)</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="60"
                                                        className="rounded-xl border-slate-200 w-32"
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
                                    <div className="border-t border-slate-100 px-8 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <ListTodo className="w-5 h-5 text-emerald-500" />
                                                    المهام الفرعية
                                                    {subtasks.length > 0 && (
                                                        <Badge variant="secondary" className="ms-2">{subtasks.length}</Badge>
                                                    )}
                                                </h3>
                                                {showSubtasks ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                                {subtasks.length > 0 && (
                                                    <div className="space-y-2">
                                                        {subtasks.map((subtask) => (
                                                            <div key={subtask.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
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
                                                    <Button type="button" variant="outline" onClick={addSubtask} className="rounded-xl">
                                                        <Plus className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Recurring Section */}
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100 px-8 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Repeat className="w-5 h-5 text-emerald-500" />
                                                    تكرار المهمة
                                                </h3>
                                                {showRecurring ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="recurring"
                                                        checked={isRecurring}
                                                        onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                                    />
                                                    <label htmlFor="recurring" className="text-sm font-medium text-slate-700">
                                                        تفعيل التكرار
                                                    </label>
                                                </div>

                                                {isRecurring && (
                                                    <div className="space-y-4 pt-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">التكرار</label>
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
                                                                <label className="text-sm font-medium text-slate-700">نوع التكرار</label>
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
                                                                <label className="text-sm font-medium text-slate-700">أيام الأسبوع</label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {DAYS_OF_WEEK.map(day => (
                                                                        <Button
                                                                            key={day.value}
                                                                            type="button"
                                                                            variant={recurringConfig.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => toggleDayOfWeek(day.value)}
                                                                            className="rounded-full"
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
                                                                    className="rounded-xl w-32"
                                                                    value={recurringConfig.interval || 1}
                                                                    onChange={(e) => setRecurringConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">استراتيجية التعيين</label>
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
                                                                <label className="text-sm font-medium text-slate-700">تاريخ الانتهاء</label>
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
                                    <div className="border-t border-slate-100 px-8 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Bell className="w-5 h-5 text-emerald-500" />
                                                    التذكيرات
                                                    {reminders.length > 0 && (
                                                        <Badge variant="secondary" className="ms-2">{reminders.length}</Badge>
                                                    )}
                                                </h3>
                                                {showReminders ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                                {reminders.length > 0 && (
                                                    <div className="space-y-2">
                                                        {reminders.map((reminder, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                                <Select
                                                                    value={reminder.type}
                                                                    onValueChange={(v) => updateReminder(index, 'type', v)}
                                                                >
                                                                    <SelectTrigger className="rounded-lg w-32 text-sm">
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
                                                                    className="rounded-lg w-20 text-sm"
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
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addReminder}
                                                    className="w-full rounded-xl"
                                                >
                                                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                    إضافة تذكير
                                                </Button>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Footer / Actions - Gosi Pattern: justify-end, only Cancel/Save */}
                                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-end gap-3">
                                    <Link to="/dashboard/tasks/list">
                                        <GosiButton type="button" variant="ghost">
                                            إلغاء
                                        </GosiButton>
                                    </Link>
                                    <GosiButton
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        isLoading={createTaskMutation.isPending}
                                    >
                                        <Save className="w-4 h-4" aria-hidden="true" />
                                        حفظ المهمة
                                    </GosiButton>
                                </div>
                            </form>
                        </GosiCard>
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
