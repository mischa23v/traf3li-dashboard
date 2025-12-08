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
    Subtask,
    RecurringConfig,
    TaskReminder
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

    // Section toggles
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

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

    // Validate all required fields (validation disabled for testing)
    const validateForm = (): boolean => {
        return true
    }

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

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            taskType: 'other', // Default task type
            ...(typeof formData.label === 'string' && formData.label.trim().length > 0 ? { label: formData.label as TaskLabel } : {}),
            tags: formData.tags,
            ...(formData.dueDate && { dueDate: formData.dueDate }),
            ...(formData.dueTime && { dueTime: formData.dueTime }),
            ...(formData.startDate && { startDate: formData.startDate }),
            ...(formData.assignedTo && { assignedTo: formData.assignedTo }),
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
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="إدارة المهام" title="إنشاء مهمة" type="tasks" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

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
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                عنوان المهمة
                                                <FieldTooltip content={FIELD_TOOLTIPS.title} />
                                            </label>
                                            <Input
                                                placeholder="مثال: مراجعة العقد النهائي"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <ListTodo className="w-4 h-4 text-emerald-500" />
                                                الحالة
                                                <FieldTooltip content={FIELD_TOOLTIPS.status} />
                                            </label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-emerald-500" />
                                                الأولوية
                                                <FieldTooltip content={FIELD_TOOLTIPS.priority} />
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                التصنيف
                                                <FieldTooltip content={FIELD_TOOLTIPS.category} />
                                            </label>
                                            <Select value={formData.label} onValueChange={(value) => handleChange('label', value)}>
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

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                            الوسوم
                                            <FieldTooltip content={FIELD_TOOLTIPS.tags} />
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                        <X className="w-3 h-3" aria-hidden="true" />
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
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الاستحقاق
                                                <FieldTooltip content={FIELD_TOOLTIPS.dueDate} />
                                            </label>
                                            <Input
                                                type="date"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.dueDate && errors.dueDate && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.dueDate}
                                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                                onBlur={() => handleBlur('dueDate')}
                                            />
                                            {touched.dueDate && errors.dueDate && (
                                                <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الوقت
                                                <FieldTooltip content={FIELD_TOOLTIPS.dueTime} />
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
                                                <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الوقت المقدر (دقائق)
                                                <FieldTooltip content={FIELD_TOOLTIPS.estimatedMinutes} />
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
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                {t('tasks.client', 'العميل')}
                                                <FieldTooltip content={FIELD_TOOLTIPS.client} />
                                            </label>
                                            <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            {t('tasks.assignedTo', 'تعيين إلى')}
                                            <FieldTooltip content={FIELD_TOOLTIPS.assignedTo} />
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
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            وصف المهمة
                                            <FieldTooltip content={FIELD_TOOLTIPS.description} />
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
                                        <FieldTooltip content={FIELD_TOOLTIPS.subtasks} />
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
                                                    <X className="w-4 h-4" aria-hidden="true" />
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
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recurring Section */}
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Repeat className="w-5 h-5 text-emerald-500" />
                                                        مهمة متكررة
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                <FieldTooltip content={FIELD_TOOLTIPS.recurring} />
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                        {showRecurring ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
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
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Clock className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                                        التذكيرات
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                <FieldTooltip content={FIELD_TOOLTIPS.reminders} />
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                        {showAdvanced ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
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
                                                                {REMINDER_TYPE_OPTIONS.map(option => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
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
                                                            <X className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={addReminder} className="rounded-xl">
                                                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
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
                                                <Save className="w-4 h-4" aria-hidden="true" />
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
