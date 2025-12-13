import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    Save, Calendar, User, Flag, FileText, Loader2, Scale,
    Plus, X, Repeat, ListTodo, ChevronDown, ChevronUp,
    Bell, ArrowRight, Sparkles, Clock, Briefcase, AlertCircle, Users, CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    GosiCard,
    GosiCardContent,
    GosiCardHeader,
    GosiCardTitle,
    GosiInput,
    GosiLabel,
    GosiTextarea,
    GosiSelect,
    GosiSelectContent,
    GosiSelectItem,
    GosiSelectTrigger,
    GosiSelectValue,
    GosiButton
} from '@/components/ui/gosi-ui'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
    const [showRecurring, setShowRecurring] = useState(false)
    const [showReminders, setShowReminders] = useState(false)


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
            return
        }

        const taskData = {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            taskType: 'other' as const,
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
                    <ProductivityHero badge="إدارة المهام" title="إنشاء مهمة" type="tasks" listMode={true}>
                        <div className="flex gap-2">
                            <GosiButton variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border-0" onClick={() => navigate({ to: '/dashboard/tasks/list' })}>
                                <ListTodo className="h-4 w-4 ms-2" />
                                القائمة
                            </GosiButton>
                            <GosiButton onClick={(e) => handleSubmit(e as any)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
                                <Save className="h-4 w-4 ms-2" />
                                حفظ المهمة
                            </GosiButton>
                        </div>
                    </ProductivityHero>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* MAIN FORM COLUMN */}
                    <div className="xl:col-span-9 space-y-6">
                        <Link to="/dashboard/tasks/list" className="md:hidden flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <ArrowRight className="w-5 h-5 text-slate-500" />
                            <span className="text-base font-medium text-slate-700">العودة</span>
                        </Link>

                        <form onSubmit={handleSubmit}>
                            <GosiCard className="overflow-visible">
                                <GosiCardContent className="pt-10">
                                    {/* Task Title Input */}
                                    <div className="space-y-2">
                                        <GosiLabel htmlFor="title" className="text-lg text-emerald-950">عنوان المهمة</GosiLabel>
                                        <GosiInput
                                            id="title"
                                            placeholder="اكتب عنوان المهمة هنا..."
                                            className="h-16 text-lg font-bold"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                        />
                                    </div>

                                    {/* Two Columns: Status & Priority */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Flag className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الحالة
                                            </GosiLabel>
                                            <GosiSelect value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <GosiSelectTrigger>
                                                    <GosiSelectValue placeholder="اختر الحالة" />
                                                </GosiSelectTrigger>
                                                <GosiSelectContent>
                                                    {ACTIVE_STATUS_OPTIONS.map(option => (
                                                        <GosiSelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("w-2 h-2 rounded-full", option.bgColor)} />
                                                                {option.label}
                                                            </div>
                                                        </GosiSelectItem>
                                                    ))}
                                                </GosiSelectContent>
                                            </GosiSelect>
                                        </div>

                                        <div className="space-y-2">
                                            <GosiLabel className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الأولوية
                                            </GosiLabel>
                                            <GosiSelect value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <GosiSelectTrigger>
                                                    <GosiSelectValue placeholder="اختر الأولوية" />
                                                </GosiSelectTrigger>
                                                <GosiSelectContent>
                                                    {MAIN_PRIORITY_OPTIONS.map(option => (
                                                        <GosiSelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("w-2 h-2 rounded-full", option.dotColor)} />
                                                                {option.label}
                                                            </div>
                                                        </GosiSelectItem>
                                                    ))}
                                                </GosiSelectContent>
                                            </GosiSelect>
                                        </div>
                                    </div>

                                    {/* COMPACT ROW: Date/Time + Assignee */}
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Date Fixed Width */}
                                        <div className="space-y-2 w-full md:w-auto">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                التاريخ
                                            </GosiLabel>
                                            <GosiInput
                                                type="date"
                                                className="cursor-pointer font-bold text-center h-12 text-sm w-full md:w-[180px]"
                                                value={formData.dueDate}
                                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                            />
                                        </div>

                                        {/* Time Fixed Width */}
                                        <div className="space-y-2 w-full md:w-auto">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الوقت
                                            </GosiLabel>
                                            <GosiInput
                                                type="time"
                                                className="cursor-pointer font-bold text-center h-12 text-sm w-full md:w-[130px]"
                                                value={formData.dueTime}
                                                onChange={(e) => handleChange('dueTime', e.target.value)}
                                            />
                                        </div>

                                        {/* Assigned To - Takes remaining space */}
                                        <div className="space-y-2 flex-1">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تعيين إلى
                                            </GosiLabel>
                                            <GosiSelect value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                                                <GosiSelectTrigger>
                                                    <GosiSelectValue placeholder="اختر المسؤول (اختياري)" />
                                                </GosiSelectTrigger>
                                                <GosiSelectContent>
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
                                                </GosiSelectContent>
                                            </GosiSelect>
                                        </div>
                                    </div>

                                    {/* Classification Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                التصنيف
                                            </GosiLabel>
                                            <GosiSelect value={formData.label} onValueChange={(value) => handleChange('label', value)}>
                                                <GosiSelectTrigger>
                                                    <GosiSelectValue placeholder="اختر التصنيف (اختياري)" />
                                                </GosiSelectTrigger>
                                                <GosiSelectContent>
                                                    {CATEGORY_OPTIONS.map(option => (
                                                        <GosiSelectItem key={option.value} value={option.value}>
                                                            <Badge variant="secondary" className={cn("text-xs", option.bgColor, option.color)}>
                                                                {option.label}
                                                            </Badge>
                                                        </GosiSelectItem>
                                                    ))}
                                                </GosiSelectContent>
                                            </GosiSelect>
                                        </div>
                                        <div className="space-y-2">
                                            <GosiLabel className="flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                العميل / القضية
                                            </GosiLabel>
                                            <div className="grid grid-cols-2 gap-2">
                                                <GosiSelect value={formData.clientId} onValueChange={(v) => handleChange('clientId', v)}>
                                                    <GosiSelectTrigger><GosiSelectValue placeholder="العميل" /></GosiSelectTrigger>
                                                    <GosiSelectContent>
                                                        {clients?.data?.map((client) => (
                                                            <GosiSelectItem key={client._id} value={client._id}>{client.fullName}</GosiSelectItem>
                                                        ))}
                                                    </GosiSelectContent>
                                                </GosiSelect>
                                                <GosiSelect value={formData.caseId} onValueChange={(v) => handleChange('caseId', v)}>
                                                    <GosiSelectTrigger><GosiSelectValue placeholder="القضية" /></GosiSelectTrigger>
                                                    <GosiSelectContent>
                                                        {cases?.cases?.map((c) => (
                                                            <GosiSelectItem key={c._id} value={c._id}>{c.title}</GosiSelectItem>
                                                        ))}
                                                    </GosiSelectContent>
                                                </GosiSelect>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <GosiLabel className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            تفاصيل المهمة
                                        </GosiLabel>
                                        <GosiTextarea
                                            placeholder="أضف وصفاً تفصيلياً للمهمة..."
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            className="min-h-[150px]"
                                        />
                                    </div>

                                    {/* Subtasks */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <GosiLabel className="text-base text-emerald-900">المهام الفرعية</GosiLabel>
                                            <Button type="button" variant="ghost" size="sm" onClick={addSubtask} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                <Plus className="w-4 h-4 me-1" /> إضافة مهمة فرعية
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <GosiInput
                                                    placeholder="أدخل عنوان المهمة الفرعية ثم اضغط Enter..."
                                                    value={newSubtask}
                                                    onChange={(e) => setNewSubtask(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addSubtask()
                                                        }
                                                    }}
                                                    className="flex-1"
                                                />
                                                <GosiButton type="button" onClick={addSubtask} size="icon" className="shrink-0 w-12 rounded-xl">
                                                    <Plus className="w-5 h-5" />
                                                </GosiButton>
                                            </div>

                                            {subtasks.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    {subtasks.map((subtask) => (
                                                        <div key={subtask.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all text-right">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-400 ms-2" />
                                                            <span className="flex-1 font-medium text-slate-700">{subtask.title}</span>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(subtask.id)} className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-lg">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="p-8 bg-slate-50 flex gap-4 border-t border-slate-100 items-center justify-end rounded-b-[2rem] -mx-8 -mb-8 mt-8">
                                        <div className="flex gap-4 w-full sm:w-auto">
                                            <GosiButton variant="outline" type="button" onClick={() => navigate({ to: '/dashboard/tasks/list' })} className="flex-1 sm:flex-none">
                                                إلغاء
                                            </GosiButton>
                                            <GosiButton type="submit" disabled={createTaskMutation.isPending} className="flex-1 sm:flex-none min-w-[140px]">
                                                {createTaskMutation.isPending ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</>
                                                ) : (
                                                    <><Save className="mr-2 h-4 w-4" /> حفظ المهمة</>
                                                )}
                                            </GosiButton>
                                        </div>
                                    </div>

                                </GosiCardContent>
                            </GosiCard>
                        </form>
                    </div>

                    {/* SIDEBAR COLUMN */}
                    <div className="xl:col-span-3">
                        <TasksSidebar context="tasks" />
                    </div>

                </div>
            </Main>
        </>
    )
}
