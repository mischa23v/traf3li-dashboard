import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, ArrowRight, Loader2,
    Plus, X, Clock, Tag, Repeat, ListTodo, ChevronDown,
    Bell, Check, Users, Scale
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
import { Link, useNavigate } from '@tanstack/react-router'
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
        clientId: '',
        caseId: '',
        assignedTo: '',
        estimatedMinutes: 0,
    })

    // Visibility state for optional sections
    const [showDescription, setShowDescription] = useState(false)
    const [showDueDate, setShowDueDate] = useState(false)
    const [showAssignee, setShowAssignee] = useState(false)
    const [showPriority, setShowPriority] = useState(false)
    const [showTags, setShowTags] = useState(false)
    const [showClient, setShowClient] = useState(false)
    const [showSubtasks, setShowSubtasks] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)
    const [showReminders, setShowReminders] = useState(false)

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
        setReminders(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
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
            return
        }

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            taskType: 'other',
            ...(formData.label && { label: formData.label as TaskLabel }),
            tags: formData.tags,
            ...(formData.dueDate && { dueDate: formData.dueDate }),
            ...(formData.dueTime && { dueTime: formData.dueTime }),
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
            ...(isRecurring && { recurring: { ...recurringConfig, enabled: true } }),
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

    // Property pills that haven't been added yet
    const availableProperties = [
        { id: 'description', label: 'وصف', icon: <Tag className="w-3.5 h-3.5" />, show: showDescription, setShow: setShowDescription },
        { id: 'dueDate', label: 'تاريخ', icon: <Calendar className="w-3.5 h-3.5" />, show: showDueDate, setShow: setShowDueDate },
        { id: 'assignee', label: 'تعيين', icon: <User className="w-3.5 h-3.5" />, show: showAssignee, setShow: setShowAssignee },
        { id: 'priority', label: 'أولوية', icon: <Flag className="w-3.5 h-3.5" />, show: showPriority, setShow: setShowPriority },
        { id: 'tags', label: 'وسوم', icon: <Tag className="w-3.5 h-3.5" />, show: showTags, setShow: setShowTags },
        { id: 'client', label: 'عميل', icon: <Users className="w-3.5 h-3.5" />, show: showClient, setShow: setShowClient },
        { id: 'subtasks', label: 'مهام فرعية', icon: <ListTodo className="w-3.5 h-3.5" />, show: showSubtasks, setShow: setShowSubtasks },
        { id: 'recurring', label: 'تكرار', icon: <Repeat className="w-3.5 h-3.5" />, show: showRecurring, setShow: setShowRecurring },
        { id: 'reminders', label: 'تذكير', icon: <Bell className="w-3.5 h-3.5" />, show: showReminders, setShow: setShowReminders },
    ]

    const hiddenProperties = availableProperties.filter(p => !p.show)

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Minimal Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link to="/dashboard/tasks/list" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                        <span className="text-sm font-medium">المهام</span>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.title.trim() || createTaskMutation.isPending}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 h-9 text-sm font-medium shadow-sm"
                    >
                        {createTaskMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4 me-1.5" />
                                حفظ
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Templates - Compact */}
                    {templates && templates.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">من قالب:</span>
                            {templates.slice(0, 4).map((template) => (
                                <button
                                    key={template._id}
                                    type="button"
                                    onClick={() => handleUseTemplate(template._id)}
                                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                    disabled={createFromTemplateMutation.isPending}
                                >
                                    {template.title}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Title - The Hero */}
                    <div className="space-y-1">
                        <input
                            type="text"
                            placeholder="عنوان المهمة..."
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full text-2xl sm:text-3xl font-bold text-slate-900 placeholder:text-slate-300 bg-transparent border-0 outline-none focus:ring-0 p-0"
                            autoFocus
                        />
                    </div>

                    {/* Status - Always visible, minimal */}
                    <div className="flex items-center gap-2">
                        <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                            <SelectTrigger className="w-auto h-8 rounded-full border-slate-200 bg-white text-xs px-3 gap-1.5">
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

                    {/* Description - Expandable */}
                    {showDescription && (
                        <div className="relative group">
                            <Textarea
                                placeholder="أضف وصفاً..."
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="min-h-[100px] resize-none border-slate-200 rounded-xl bg-white text-sm focus:ring-1 focus:ring-slate-300"
                            />
                            <button
                                type="button"
                                onClick={() => { setShowDescription(false); handleChange('description', '') }}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Due Date - Expandable */}
                    {showDueDate && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 group relative">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div className="flex-1 flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => handleChange('dueDate', e.target.value)}
                                    className="border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent"
                                />
                                <Input
                                    type="time"
                                    value={formData.dueTime}
                                    onChange={(e) => handleChange('dueTime', e.target.value)}
                                    className="border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent w-24"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowDueDate(false); handleChange('dueDate', ''); handleChange('dueTime', '') }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Assignee - Expandable */}
                    {showAssignee && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 group relative">
                            <User className="w-4 h-4 text-slate-400" />
                            <Select value={formData.assignedTo} onValueChange={(v) => handleChange('assignedTo', v)}>
                                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent">
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
                                        <div className="text-center py-4 text-slate-500 text-sm">لا يوجد أعضاء</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <button
                                type="button"
                                onClick={() => { setShowAssignee(false); handleChange('assignedTo', '') }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Priority - Expandable */}
                    {showPriority && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 group relative">
                            <Flag className="w-4 h-4 text-slate-400" />
                            <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent">
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
                            <button
                                type="button"
                                onClick={() => { setShowPriority(false); handleChange('priority', 'medium') }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Tags - Expandable */}
                    {showTags && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 group relative">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Tag className="w-4 h-4 text-slate-400" />
                                {formData.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700 gap-1 text-xs">
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
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                                    className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowTags(false); handleChange('tags', []) }}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Client & Case - Expandable */}
                    {showClient && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 group relative">
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-slate-400" />
                                <Select value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                    <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent">
                                        <SelectValue placeholder="اختر العميل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientsLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : clients?.data?.length ? (
                                            clients.data.map((client) => (
                                                <SelectItem key={client._id} value={client._id}>{client.fullName}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-slate-500 text-sm">لا يوجد عملاء</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3">
                                <Scale className="w-4 h-4 text-slate-400" />
                                <Select value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                    <SelectTrigger className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent">
                                        <SelectValue placeholder="اختر القضية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {casesLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : cases?.cases?.length ? (
                                            cases.cases.map((c) => (
                                                <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-slate-500 text-sm">لا توجد قضايا</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowClient(false); handleChange('clientId', ''); handleChange('caseId', '') }}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Subtasks - Expandable */}
                    {showSubtasks && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 group relative">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <ListTodo className="w-4 h-4" />
                                المهام الفرعية
                                {subtasks.length > 0 && (
                                    <span className="text-xs text-slate-400">({subtasks.length})</span>
                                )}
                            </div>
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2 ps-6">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <span className="flex-1 text-sm text-slate-700">{subtask.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(subtask.id)}
                                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2 ps-6">
                                <Input
                                    placeholder="أضف مهمة فرعية..."
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                                    className="flex-1 border-0 p-0 h-auto text-sm focus:ring-0 bg-transparent"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowSubtasks(false); setSubtasks([]) }}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Recurring - Expandable */}
                    {showRecurring && (
                        <Collapsible open={isRecurring} onOpenChange={setIsRecurring}>
                            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 group relative">
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Repeat className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">تكرار المهمة</span>
                                        </div>
                                        <Checkbox
                                            checked={isRecurring}
                                            onCheckedChange={(checked) => setIsRecurring(checked === true)}
                                        />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-3 pt-2">
                                    <Select
                                        value={recurringConfig.frequency}
                                        onValueChange={(v: RecurrenceFrequency) => setRecurringConfig(prev => ({ ...prev, frequency: v }))}
                                    >
                                        <SelectTrigger className="w-full h-9 text-sm rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FREQUENCY_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {recurringConfig.frequency === 'weekly' && (
                                        <div className="flex flex-wrap gap-1">
                                            {DAYS_OF_WEEK.map(day => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => toggleDayOfWeek(day.value)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                                                        recurringConfig.daysOfWeek?.includes(day.value)
                                                            ? "bg-slate-900 text-white"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {day.label.charAt(0)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CollapsibleContent>
                                <button
                                    type="button"
                                    onClick={() => { setShowRecurring(false); setIsRecurring(false) }}
                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </Collapsible>
                    )}

                    {/* Reminders - Expandable */}
                    {showReminders && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 group relative">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <Bell className="w-4 h-4" />
                                التذكيرات
                            </div>
                            {reminders.map((reminder, index) => (
                                <div key={index} className="flex items-center gap-2 ps-6">
                                    <Select
                                        value={reminder.type}
                                        onValueChange={(v) => updateReminder(index, 'type', v)}
                                    >
                                        <SelectTrigger className="w-24 h-8 text-xs rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {REMINDER_TYPE_OPTIONS.map(option => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-xs text-slate-500">قبل</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={reminder.beforeMinutes}
                                        onChange={(e) => updateReminder(index, 'beforeMinutes', parseInt(e.target.value) || 30)}
                                        className="w-16 h-8 text-xs rounded-lg"
                                    />
                                    <span className="text-xs text-slate-500">دقيقة</span>
                                    <button
                                        type="button"
                                        onClick={() => removeReminder(index)}
                                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addReminder}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 ps-6"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                إضافة تذكير
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowReminders(false); setReminders([]) }}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Add Property Pills */}
                    {hiddenProperties.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap pt-2">
                            {hiddenProperties.map(prop => (
                                <button
                                    key={prop.id}
                                    type="button"
                                    onClick={() => prop.setShow(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    {prop.label}
                                </button>
                            ))}
                        </div>
                    )}

                </form>
            </main>
        </div>
    )
}
