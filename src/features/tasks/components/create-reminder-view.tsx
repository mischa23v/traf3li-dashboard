import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import {
    Save, Calendar, Clock,
    Bell, FileText, AlertCircle, Loader2,
    Plus, X, ChevronDown, ChevronUp, Repeat, Users,
    Scale, User, Briefcase, Mail, MessageSquare, Smartphone,
    LayoutGrid, Settings2, Tag
} from 'lucide-react'
import { useAuthStore, selectFirmId } from '@/stores/auth-store'
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
import { useCreateReminder } from '@/hooks/useRemindersAndEvents'
import { useClients, useCases, useTeamMembers } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type {
    ReminderPriority,
    ReminderTypeLegacy,
    RecurrenceFrequency,
    NotificationChannel,
    RecurringConfig,
} from '@/services/remindersService'

// Field tooltips for reminders (matching task-options pattern)
const REMINDER_FIELD_TOOLTIPS = {
    title: 'اكتب عنواناً واضحاً ومختصراً يصف التذكير',
    type: 'اختر نوع التذكير المناسب (موعد نهائي، جلسة، اجتماع، إلخ)',
    priority: 'اختر مستوى أهمية التذكير',
    reminderDate: 'حدد تاريخ التذكير',
    reminderTime: 'حدد وقت التذكير',
    assignedTo: 'اختر المحامي أو المسؤول الذي سيتلقى التذكير',
    relatedCase: 'اختر القضية المرتبطة بهذا التذكير إن وجدت',
    relatedClient: 'اختر العميل المرتبط بهذا التذكير',
    tags: 'أضف كلمات مفتاحية لتسهيل البحث والتصنيف',
    description: 'اكتب تفاصيل التذكير والملاحظات الإضافية',
    notifications: 'اختر قنوات الإشعارات وأوقات التنبيه المسبق',
    recurring: 'فعّل هذا الخيار إذا كان التذكير يتكرر بشكل دوري',
    maxSnoozeCount: 'حدد عدد مرات التأجيل المسموح بها',
}

const PRIORITY_OPTIONS: { value: ReminderPriority; label: string; color: string; tooltip: string }[] = [
    { value: 'critical', label: 'عاجل جداً', color: 'bg-red-500', tooltip: 'تذكير عاجل جداً يتطلب إجراءً فورياً ولا يحتمل أي تأخير' },
    { value: 'high', label: 'عاجل', color: 'bg-orange-500', tooltip: 'تذكير عاجل يجب الانتباه له في أقرب وقت ممكن' },
    { value: 'medium', label: 'متوسطة', color: 'bg-yellow-500', tooltip: 'تذكير ذو أهمية متوسطة ضمن الجدول الزمني المعتاد' },
    { value: 'low', label: 'عادية', color: 'bg-emerald-500', tooltip: 'تذكير عادي يمكن التعامل معه ضمن المواعيد الاعتيادية' },
]

const TYPE_OPTIONS: { value: ReminderTypeLegacy; label: string }[] = [
    { value: 'deadline', label: 'موعد نهائي' },
    { value: 'hearing', label: 'جلسة محكمة' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'payment', label: 'دفع مالي' },
    { value: 'task_due', label: 'مهمة' },
    { value: 'follow_up', label: 'متابعة' },
    { value: 'contract_renewal', label: 'تجديد عقد' },
    { value: 'statute_limitation', label: 'مدة التقادم' },
    { value: 'general', label: 'عام' },
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

const NOTIFICATION_CHANNELS: { value: NotificationChannel; label: string; icon: any }[] = [
    { value: 'in_app', label: 'داخل التطبيق', icon: Bell },
    { value: 'push', label: 'إشعار فوري', icon: Smartphone },
    { value: 'email', label: 'بريد إلكتروني', icon: Mail },
    { value: 'sms', label: 'رسالة نصية', icon: MessageSquare },
    { value: 'whatsapp', label: 'واتساب', icon: MessageSquare },
]

const ADVANCE_NOTIFICATION_OPTIONS = [
    { value: 5, label: '5 دقائق' },
    { value: 10, label: '10 دقائق' },
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 120, label: 'ساعتين' },
    { value: 1440, label: 'يوم واحد' },
    { value: 2880, label: 'يومين' },
    { value: 10080, label: 'أسبوع' },
]

export function CreateReminderView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createReminderMutation = useCreateReminder()

    // Check if user is part of a firm (solo lawyers don't have firmId)
    const firmId = useAuthStore(selectFirmId)
    const isFirmMember = !!firmId

    // Fetch real data from APIs
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: cases, isLoading: casesLoading } = useCases()
    // Only fetch team members if user is part of a firm
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers(isFirmMember)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reminderDate: '',
        reminderTime: '',
        priority: 'medium' as ReminderPriority,
        type: 'general' as ReminderTypeLegacy,
        assignedTo: '',
        relatedCase: '',
        relatedClient: '',
        maxSnoozeCount: 3,
        tags: [] as string[],
    })

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Recurring config state
    const [isRecurring, setIsRecurring] = useState(false)
    const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({
        enabled: false,
        frequency: 'weekly',
        endType: 'never',
        daysOfWeek: [],
        interval: 1,
        skipWeekends: false,
        skipHolidays: false,
    })

    // Notification config state
    const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>(['in_app'])
    const [advanceNotifications, setAdvanceNotifications] = useState<number[]>([30])
    const [escalationEnabled, setEscalationEnabled] = useState(false)
    const [escalationDelay, setEscalationDelay] = useState(60)

    // Section toggles
    const [showRecurring, setShowRecurring] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)

    // Form mode: basic (required fields only) or advanced (all fields)
    const [formMode, setFormMode] = useState<'basic' | 'advanced'>('basic')

    // Form ref for programmatic submission
    const formRef = useRef<HTMLFormElement>(null)

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Clear form handler
    const handleClearForm = () => {
        setFormData({
            title: '',
            description: '',
            reminderDate: '',
            reminderTime: '',
            priority: 'medium' as ReminderPriority,
            type: 'general' as ReminderTypeLegacy,
            assignedTo: '',
            relatedCase: '',
            relatedClient: '',
            maxSnoozeCount: 3,
            tags: [],
        })
        setTagInput('')
        setIsRecurring(false)
        setRecurringConfig({
            enabled: false,
            frequency: 'weekly',
            endType: 'never',
            daysOfWeek: [],
            interval: 1,
            skipWeekends: false,
            skipHolidays: false,
        })
        setNotificationChannels(['in_app'])
        setAdvanceNotifications([30])
        setEscalationEnabled(false)
        setEscalationDelay(60)
        setErrors({})
        setTouched({})
    }

    // Save form handler (triggers form submit)
    const handleSaveForm = () => {
        formRef.current?.requestSubmit()
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

    // Validate all required fields (validation disabled for testing)
    const validateForm = (): boolean => {
        return true
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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

    const toggleChannel = (channel: NotificationChannel) => {
        setNotificationChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        )
    }

    const toggleAdvanceNotification = (minutes: number) => {
        setAdvanceNotifications(prev =>
            prev.includes(minutes)
                ? prev.filter(m => m !== minutes)
                : [...prev, minutes]
        )
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

        const reminderData = {
            title: formData.title,
            description: formData.description,
            // Backend expects separate date/time fields
            reminderDate: formData.reminderDate,
            reminderTime: formData.reminderTime,
            priority: formData.priority,
            type: formData.type, // Backend expects 'type' not 'reminderType'
            notes: formData.description, // Also send as notes
            ...(formData.assignedTo && { assignedTo: formData.assignedTo }),
            ...(formData.relatedCase && { relatedCase: formData.relatedCase }),
            ...(formData.relatedClient && { clientId: formData.relatedClient }),
            ...(formData.tags.length > 0 && { tags: formData.tags }),
            ...(notificationChannels.length > 0 && {
                notification: {
                    channels: notificationChannels,
                    advanceNotifications: advanceNotifications.map(m => ({
                        beforeMinutes: m,
                        channels: notificationChannels,
                        sent: false
                    })),
                    ...(escalationEnabled && {
                        escalation: {
                            enabled: true,
                            escalateAfterMinutes: escalationDelay,
                            escalated: false,
                            escalationLevel: 0
                        }
                    })
                }
            }),
            ...(isRecurring && {
                recurring: {
                    enabled: true,
                    frequency: recurringConfig.frequency,
                    endDate: recurringConfig.endDate,
                }
            }),
        }

        createReminderMutation.mutate(reminderData, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.tasks.reminders.list })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
        { title: 'المهام', href: ROUTES.dashboard.tasks.list, isActive: false },
        { title: 'التذكيرات', href: ROUTES.dashboard.tasks.reminders.list, isActive: true },
        { title: 'الأحداث', href: ROUTES.dashboard.tasks.events.list, isActive: false },
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
                {/* HERO CARD - Full width (matching tasks) */}
                <ProductivityHero badge="إدارة التذكيرات" title="إنشاء تذكير" type="reminders" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            {/* Mode Toggle + Reminder Name Preview */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                {/* Reminder Name Preview - shows on left in RTL */}
                                <div className="flex-1 min-w-0 me-4">
                                    {formData.title && (
                                        <h2 className="text-lg font-semibold text-slate-800 truncate">
                                            {formData.title}
                                        </h2>
                                    )}
                                </div>
                                {/* Mode Toggle - Segmented Control */}
                                <div className="relative inline-flex p-1 bg-slate-100/80 rounded-full flex-shrink-0">
                                    {/* Sliding Background Indicator - RTL aware */}
                                    <div
                                        className={cn(
                                            "absolute top-1 bottom-1 bg-white rounded-full shadow-sm border border-slate-200/50 transition-all duration-300 ease-out",
                                            formMode === 'basic'
                                                ? "end-[calc(50%+2px)]"
                                                : "end-1"
                                        )}
                                        style={{ width: 'calc(50% - 4px)' }}
                                    />
                                    {/* Basic Button (first) */}
                                    <button
                                        type="button"
                                        onClick={() => setFormMode('basic')}
                                        className={cn(
                                            "relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200",
                                            formMode === 'basic'
                                                ? "text-emerald-600"
                                                : "text-slate-500 hover:text-slate-600"
                                        )}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        أساسي
                                    </button>
                                    {/* Advanced Button (second) */}
                                    <button
                                        type="button"
                                        onClick={() => setFormMode('advanced')}
                                        className={cn(
                                            "relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200",
                                            formMode === 'advanced'
                                                ? "text-emerald-600"
                                                : "text-slate-500 hover:text-slate-600"
                                        )}
                                    >
                                        <Settings2 className="w-4 h-4" />
                                        متقدم
                                    </button>
                                </div>
                            </div>

                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    {/* Title - Full width */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            عنوان التذكير
                                            <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.title} />
                                        </label>
                                        <Input
                                            placeholder=""
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

                                    {/* Type, Priority, Date - flexible grid (matching tasks layout) */}
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.5fr] gap-4">
                                        {/* Type */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-emerald-500" />
                                                نوع التذكير
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.type} />
                                            </label>
                                            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TYPE_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Priority */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-emerald-500" />
                                                الأهمية
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.priority} />
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الأهمية" />
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

                                        {/* Date */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                التاريخ
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.reminderDate} />
                                            </label>
                                            <Input
                                                type="date"
                                                data-field="reminderDate"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:opacity-100",
                                                    touched.reminderDate && errors.reminderDate && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.reminderDate}
                                                onChange={(e) => handleChange('reminderDate', e.target.value)}
                                                onBlur={() => handleBlur('reminderDate')}
                                            />
                                            {touched.reminderDate && errors.reminderDate && (
                                                <p className="text-sm text-red-500 mt-1">{errors.reminderDate}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Advanced Mode Fields */}
                                    {formMode === 'advanced' && (
                                        <>
                                            {/* Row 1: Client (1fr), Case (1fr), Time (0.5fr) - matching tasks pattern */}
                                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.5fr] gap-4">
                                                {/* Client */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        العميل المرتبط
                                                        <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.relatedClient} />
                                                    </label>
                                                    <Select value={formData.relatedClient} onValueChange={(value) => handleChange('relatedClient', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                                                        {client.companyName && ` - ${client.companyName}`}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-center py-4 text-slate-500 text-sm">
                                                                    لا يوجد عملاء
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Case */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Scale className="w-4 h-4 text-emerald-500" />
                                                        القضية المرتبطة
                                                        <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.relatedCase} />
                                                    </label>
                                                    <Select value={formData.relatedCase} onValueChange={(value) => handleChange('relatedCase', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
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
                                                                        {caseItem.caseNumber ? `${caseItem.caseNumber} - ` : ''}
                                                                        {caseItem.title}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-center py-4 text-slate-500 text-sm">
                                                                    لا توجد قضايا
                                                                </div>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Time - 0.5fr to match Due Date size */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        الوقت
                                                        <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.reminderTime} />
                                                    </label>
                                                    <Input
                                                        type="time"
                                                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:opacity-100"
                                                        value={formData.reminderTime}
                                                        onChange={(e) => handleChange('reminderTime', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Assigned To (only for firm members) - same pattern as tasks */}
                                            {isFirmMember && (
                                                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_0.5fr] gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                            تعيين إلى
                                                            <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.assignedTo} />
                                                        </label>
                                                        <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                                <SelectValue placeholder="اختر المسؤول (اختياري)" />
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
                                                                        لا يوجد أعضاء فريق
                                                                    </div>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {/* Empty slots to maintain grid alignment */}
                                                    <div />
                                                    <div />
                                                </div>
                                            )}

                                            {/* Tags - Full width */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500" />
                                                    الوسوم
                                                    <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.tags} />
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

                                            {/* Description - Full width */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                    ملاحظات إضافية
                                                    <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.description} />
                                                </label>
                                                <Textarea
                                                    className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                    value={formData.description}
                                                    onChange={(e) => handleChange('description', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Notification Channels Section - Advanced only */}
                                {formMode === 'advanced' && (
                                <Collapsible open={showNotifications} onOpenChange={setShowNotifications}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Bell className="w-5 h-5 text-emerald-500" />
                                                        قنوات الإشعارات
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.notifications} />
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                        {showNotifications ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <p className="text-sm text-slate-500 mb-3">اختر قنوات الإشعارات:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {NOTIFICATION_CHANNELS.map(channel => {
                                                        const Icon = channel.icon
                                                        return (
                                                            <Button
                                                                key={channel.value}
                                                                type="button"
                                                                variant={notificationChannels.includes(channel.value) ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => toggleChannel(channel.value)}
                                                                className="rounded-full"
                                                            >
                                                                <Icon className="w-4 h-4 ms-1" />
                                                                {channel.label}
                                                            </Button>
                                                        )
                                                    })}
                                                </div>

                                                <div className="pt-4 border-t border-slate-200">
                                                    <p className="text-sm text-slate-500 mb-3">إشعار مسبق قبل:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ADVANCE_NOTIFICATION_OPTIONS.map(option => (
                                                            <Button
                                                                key={option.value}
                                                                type="button"
                                                                variant={advanceNotifications.includes(option.value) ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => toggleAdvanceNotification(option.value)}
                                                                className="rounded-full"
                                                            >
                                                                {option.label}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                                                    <Checkbox
                                                        id="escalation"
                                                        checked={escalationEnabled}
                                                        onCheckedChange={(checked) => setEscalationEnabled(checked === true)}
                                                    />
                                                    <label htmlFor="escalation" className="text-sm text-slate-700">
                                                        تفعيل التصعيد في حالة عدم الاستجابة
                                                    </label>
                                                    {escalationEnabled && (
                                                        <Input
                                                            type="number"
                                                            min="5"
                                                            className="rounded-xl w-24"
                                                            value={escalationDelay}
                                                            onChange={(e) => setEscalationDelay(parseInt(e.target.value) || 60)}
                                                        />
                                                    )}
                                                    {escalationEnabled && <span className="text-sm text-slate-500">دقيقة</span>}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                                )}

                                {/* Recurring Section - Advanced only */}
                                {formMode === 'advanced' && (
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Repeat className="w-5 h-5 text-emerald-500" />
                                                        تذكير متكرر
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.recurring} />
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
                                                                <label className="text-sm font-medium text-slate-700">نهاية التكرار</label>
                                                                <Select
                                                                    value={recurringConfig.endType}
                                                                    onValueChange={(value: 'never' | 'after_occurrences' | 'on_date') =>
                                                                        setRecurringConfig(prev => ({ ...prev, endType: value }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="never">بدون انتهاء</SelectItem>
                                                                        <SelectItem value="after_occurrences">بعد عدد مرات</SelectItem>
                                                                        <SelectItem value="on_date">في تاريخ محدد</SelectItem>
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

                                                        {recurringConfig.endType === 'after_occurrences' && (
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">عدد المرات</label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    className="rounded-xl w-32"
                                                                    value={recurringConfig.maxOccurrences || 10}
                                                                    onChange={(e) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        maxOccurrences: parseInt(e.target.value) || 10
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}

                                                        {recurringConfig.endType === 'on_date' && (
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">تاريخ الانتهاء</label>
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
                                                        )}

                                                        <div className="flex gap-6">
                                                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Checkbox
                                                                    checked={recurringConfig.skipWeekends}
                                                                    onCheckedChange={(checked) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        skipWeekends: checked === true
                                                                    }))}
                                                                />
                                                                تجاوز عطلة نهاية الأسبوع
                                                            </label>
                                                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Checkbox
                                                                    checked={recurringConfig.skipHolidays}
                                                                    onCheckedChange={(checked) => setRecurringConfig(prev => ({
                                                                        ...prev,
                                                                        skipHolidays: checked === true
                                                                    }))}
                                                                />
                                                                تجاوز الإجازات الرسمية
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                                )}

                                {/* Advanced Settings - Advanced only */}
                                {formMode === 'advanced' && (
                                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                                        إعدادات متقدمة
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-2">
                                                <FieldTooltip content={REMINDER_FIELD_TOOLTIPS.maxSnoozeCount} />
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                        {showAdvanced ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الحد الأقصى للتأجيل</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        className="rounded-xl w-32"
                                                        value={formData.maxSnoozeCount}
                                                        onChange={(e) => handleChange('maxSnoozeCount', parseInt(e.target.value) || 3)}
                                                    />
                                                    <p className="text-xs text-slate-500">عدد مرات التأجيل المسموح بها (0 = غير محدود)</p>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                                )}

                                {/* Submit */}
                                <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">للحفظ السريع اضغط كنترول + إنتر</span>
                                    <div className="flex items-center gap-4">
                                        <Link to={ROUTES.dashboard.tasks.reminders.list}>
                                            <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                                إلغاء
                                            </Button>
                                        </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createReminderMutation.isPending}
                                    >
                                        {createReminderMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                حفظ التذكير
                                            </span>
                                        )}
                                    </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <TasksSidebar
                        context="reminders"
                        mode="create"
                        onClearForm={handleClearForm}
                        onSaveForm={handleSaveForm}
                        isSaving={createReminderMutation.isPending}
                    />
                </div>
            </Main>
        </>
    )
}
