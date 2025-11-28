import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ArrowRight, Save, Calendar, User,
    Flag, FileText, Briefcase, Users, Loader2, Scale,
    Plus, X, Clock, Tag, Repeat, ListTodo, ChevronDown, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
import { useCreateTask, useTaskTemplates, useCreateFromTemplate } from '@/hooks/useTasks'
import { useClients, useCases, useTeamMembers } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type {
    TaskPriority,
    TaskStatus,
    TaskLabel,
    RecurrenceFrequency,
    RecurrenceType,
    AssigneeStrategy,
    Subtask,
    RecurringConfig,
    TaskReminder
} from '@/services/tasksService'

interface SubtaskInput {
    id: string
    title: string
    autoReset?: boolean
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'critical', label: 'حرج', color: 'bg-red-500' },
    { value: 'high', label: 'عالية', color: 'bg-orange-500' },
    { value: 'medium', label: 'متوسطة', color: 'bg-yellow-500' },
    { value: 'low', label: 'منخفضة', color: 'bg-blue-500' },
    { value: 'none', label: 'بدون', color: 'bg-slate-300' },
]

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'backlog', label: 'قائمة الانتظار' },
    { value: 'todo', label: 'للعمل' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
]

const LABEL_OPTIONS: { value: TaskLabel; label: string; color: string }[] = [
    { value: 'urgent', label: 'عاجل', color: 'bg-red-100 text-red-800' },
    { value: 'legal', label: 'قانوني', color: 'bg-purple-100 text-purple-800' },
    { value: 'administrative', label: 'إداري', color: 'bg-blue-100 text-blue-800' },
    { value: 'bug', label: 'خطأ', color: 'bg-red-100 text-red-800' },
    { value: 'feature', label: 'ميزة', color: 'bg-green-100 text-green-800' },
    { value: 'documentation', label: 'توثيق', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'enhancement', label: 'تحسين', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'question', label: 'استفسار', color: 'bg-cyan-100 text-cyan-800' },
]

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'biweekly', label: 'كل أسبوعين' },
    { value: 'monthly', label: 'شهرياً' },
    { value: 'quarterly', label: 'ربع سنوي' },
    { value: 'yearly', label: 'سنوياً' },
    { value: 'custom', label: 'مخصص' },
]

const DAYS_OF_WEEK = [
    { value: 0, label: 'أحد' },
    { value: 1, label: 'إثنين' },
    { value: 2, label: 'ثلاثاء' },
    { value: 3, label: 'أربعاء' },
    { value: 4, label: 'خميس' },
    { value: 5, label: 'جمعة' },
    { value: 6, label: 'سبت' },
]

const ASSIGNEE_STRATEGY_OPTIONS: { value: AssigneeStrategy; label: string; description: string }[] = [
    { value: 'fixed', label: 'ثابت', description: 'نفس الشخص دائماً' },
    { value: 'round_robin', label: 'بالتناوب', description: 'توزيع تناوبي على الفريق' },
    { value: 'random', label: 'عشوائي', description: 'اختيار عشوائي' },
    { value: 'least_assigned', label: 'الأقل مهام', description: 'للشخص الأقل انشغالاً' },
]

export function CreateTaskView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createTaskMutation = useCreateTask()
    const { data: templates } = useTaskTemplates()
    const createFromTemplateMutation = useCreateFromTemplate()

    // Fetch real data from APIs
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: cases, isLoading: casesLoading } = useCases()
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers()

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo' as TaskStatus,
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

    // Section toggles
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks(prev => [...prev, {
                id: crypto.randomUUID(),
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

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            ...(formData.label && { label: formData.label as TaskLabel }),
            tags: formData.tags,
            dueDate: formData.dueDate,
            ...(formData.dueTime && { dueTime: formData.dueTime }),
            ...(formData.startDate && { startDate: formData.startDate }),
            assignedTo: formData.assignedTo,
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.estimatedMinutes > 0 && { estimatedMinutes: formData.estimatedMinutes }),
            // Subtasks
            ...(subtasks.length > 0 && {
                subtasks: subtasks.map((s, index) => ({
                    title: s.title,
                    completed: false,
                    order: index,
                    autoReset: s.autoReset
                }))
            }),
            // Recurring
            ...(isRecurring && {
                recurring: {
                    ...recurringConfig,
                    enabled: true,
                }
            }),
            // Reminders
            ...(reminders.length > 0 && {
                reminders: reminders.map(r => ({
                    type: r.type as 'notification' | 'email' | 'sms' | 'push',
                    beforeMinutes: r.beforeMinutes,
                }))
            }),
        }

        createTaskMutation.mutate(taskData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/list' })
            }
        })
    }

    const handleUseTemplate = (templateId: string) => {
        createFromTemplateMutation.mutate({ templateId }, {
            onSuccess: () => {
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/tasks/list">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">إنشاء مهمة جديدة</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    أدخل تفاصيل المهمة الجديدة لإضافتها إلى النظام ومتابعتها مع الفريق.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <FileText className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <Briefcase className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Templates Section */}
                        {templates && templates.length > 0 && (
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
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
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                عنوان المهمة <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: مراجعة العقد النهائي"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                                الحالة
                                            </label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الحالة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-emerald-500" />
                                                الأولوية
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الأولوية" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITY_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("w-2 h-2 rounded-full", option.color)} />
                                                                {option.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                التصنيف
                                            </label>
                                            <Select value={formData.label} onValueChange={(value) => handleChange('label', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر التصنيف (اختياري)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LABEL_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <Badge variant="secondary" className={cn("text-xs", option.color)}>
                                                                {option.label}
                                                            </Badge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                            الوسوم
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="أضف وسم..."
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addTag()
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الاستحقاق <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.dueDate}
                                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                الوقت
                                            </label>
                                            <Input
                                                type="time"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.dueTime}
                                                onChange={(e) => handleChange('dueTime', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                الوقت المقدر (دقائق)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="60"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.estimatedMinutes || ''}
                                                onChange={(e) => handleChange('estimatedMinutes', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                {t('tasks.client', 'العميل')}
                                            </label>
                                            <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={t('tasks.selectClient', 'اختر العميل (اختياري)')} />
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
                                            </label>
                                            <Select value={formData.caseId} onValueChange={(value) => handleChange('caseId', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={t('tasks.selectCase', 'اختر القضية (اختياري)')} />
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-500" />
                                            {t('tasks.assignedTo', 'تعيين إلى')}
                                        </label>
                                        <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            وصف المهمة
                                        </label>
                                        <Textarea
                                            placeholder="أدخل تفاصيل إضافية عن المهمة..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Subtasks Section */}
                                <div className="border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                        <ListTodo className="w-5 h-5 text-emerald-500" />
                                        المهام الفرعية
                                    </h3>
                                    <div className="space-y-3">
                                        {subtasks.map((subtask) => (
                                            <div key={subtask.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                <span className="flex-1 text-slate-700">{subtask.title}</span>
                                                {isRecurring && (
                                                    <label className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Checkbox
                                                            checked={subtask.autoReset}
                                                            onCheckedChange={() => toggleSubtaskAutoReset(subtask.id)}
                                                        />
                                                        إعادة تعيين تلقائي
                                                    </label>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSubtask(subtask.id)}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="أضف مهمة فرعية..."
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1"
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
                                                <Plus className="w-4 h-4 ml-2" />
                                                إضافة
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recurring Section */}
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Repeat className="w-5 h-5 text-emerald-500" />
                                                    مهمة متكررة
                                                </h3>
                                                {showRecurring ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                                                                    onValueChange={(value: RecurrenceFrequency) =>
                                                                        setRecurringConfig(prev => ({ ...prev, frequency: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
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
                                                                    onChange={(e) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        interval: parseInt(e.target.value) || 1
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">استراتيجية التعيين</label>
                                                                <Select
                                                                    value={recurringConfig.assigneeStrategy}
                                                                    onValueChange={(value: AssigneeStrategy) =>
                                                                        setRecurringConfig(prev => ({ ...prev, assigneeStrategy: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
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
                                                                    className="rounded-xl"
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
                                    </div>
                                </Collapsible>

                                {/* Reminders Section */}
                                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-emerald-500" />
                                                    التذكيرات
                                                </h3>
                                                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                                {reminders.map((reminder, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <Select
                                                            value={reminder.type}
                                                            onValueChange={(value) => updateReminder(index, 'type', value)}
                                                        >
                                                            <SelectTrigger className="rounded-xl w-36">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="notification">إشعار</SelectItem>
                                                                <SelectItem value="email">بريد إلكتروني</SelectItem>
                                                                <SelectItem value="sms">رسالة نصية</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <span className="text-slate-500">قبل</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="rounded-xl w-20"
                                                            value={reminder.beforeMinutes}
                                                            onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                                        />
                                                        <span className="text-slate-500">دقيقة</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeReminder(index)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={addReminder} className="rounded-xl">
                                                    <Plus className="w-4 h-4 ml-2" />
                                                    إضافة تذكير
                                                </Button>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/tasks/list">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
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
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <TasksSidebar context="tasks" />
                </div>
            </Main>
        </>
    )
}
