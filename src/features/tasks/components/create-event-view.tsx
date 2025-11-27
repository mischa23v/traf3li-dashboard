import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ArrowRight, Save, Calendar, Clock,
    MapPin, Users, FileText, Briefcase, Loader2,
    Plus, X, ChevronDown, ChevronUp, Repeat, Video,
    Scale, User, Bell, DollarSign, ListOrdered
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
import { useCreateEvent } from '@/hooks/useRemindersAndEvents'
import { useClients, useCases, useTeamMembers } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type {
    EventType,
    EventPriority,
    EventStatus,
    RecurrenceFrequency,
    RecurrenceConfig,
    EventReminder,
    EventLocation
} from '@/services/eventsService'

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
    { value: 'hearing', label: 'جلسة محكمة', color: 'bg-red-100 text-red-700' },
    { value: 'court_session', label: 'جلسة قضائية', color: 'bg-red-100 text-red-700' },
    { value: 'meeting', label: 'اجتماع', color: 'bg-purple-100 text-purple-700' },
    { value: 'conference', label: 'مؤتمر', color: 'bg-blue-100 text-blue-700' },
    { value: 'consultation', label: 'استشارة', color: 'bg-green-100 text-green-700' },
    { value: 'document_review', label: 'مراجعة مستندات', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'training', label: 'تدريب', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'deadline', label: 'موعد نهائي', color: 'bg-orange-100 text-orange-700' },
    { value: 'task', label: 'مهمة', color: 'bg-slate-100 text-slate-700' },
    { value: 'other', label: 'أخرى', color: 'bg-gray-100 text-gray-700' },
]

const PRIORITY_OPTIONS: { value: EventPriority; label: string; color: string }[] = [
    { value: 'critical', label: 'حرج', color: 'bg-red-500' },
    { value: 'high', label: 'عالية', color: 'bg-orange-500' },
    { value: 'medium', label: 'متوسطة', color: 'bg-yellow-500' },
    { value: 'low', label: 'منخفضة', color: 'bg-blue-500' },
]

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
    { value: 'scheduled', label: 'مجدول' },
    { value: 'in_progress', label: 'قيد التنفيذ' },
    { value: 'postponed', label: 'مؤجل' },
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

const LOCATION_TYPES = [
    { value: 'physical', label: 'مكان فعلي' },
    { value: 'virtual', label: 'افتراضي' },
    { value: 'hybrid', label: 'مختلط' },
]

const VIRTUAL_PLATFORMS = [
    { value: 'zoom', label: 'Zoom' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'meet', label: 'Google Meet' },
    { value: 'webex', label: 'Webex' },
    { value: 'custom', label: 'رابط مخصص' },
]

const REMINDER_OPTIONS = [
    { value: 5, label: '5 دقائق قبل' },
    { value: 10, label: '10 دقائق قبل' },
    { value: 15, label: '15 دقيقة قبل' },
    { value: 30, label: '30 دقيقة قبل' },
    { value: 60, label: 'ساعة قبل' },
    { value: 120, label: 'ساعتين قبل' },
    { value: 1440, label: 'يوم قبل' },
    { value: 2880, label: 'يومين قبل' },
]

const EVENT_COLORS = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
]

interface AgendaItem {
    id: string
    title: string
    duration: number
    presenter: string
    notes: string
}

interface AttendeeInput {
    id: string
    name: string
    email: string
    role: 'organizer' | 'required' | 'optional'
}

export function CreateEventView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createEventMutation = useCreateEvent()

    // Fetch real data from APIs
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: cases, isLoading: casesLoading } = useCases()
    const { data: teamMembers, isLoading: teamLoading } = useTeamMembers()

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'meeting' as EventType,
        status: 'scheduled' as EventStatus,
        priority: 'medium' as EventPriority,
        color: '#3B82F6',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        allDay: false,
        duration: 60,
        caseId: '',
        clientId: '',
        billable: false,
        billingRate: 0,
        tags: [] as string[],
    })

    // Location state
    const [locationType, setLocationType] = useState<'physical' | 'virtual' | 'hybrid'>('physical')
    const [locationData, setLocationData] = useState({
        address: '',
        room: '',
        building: '',
        platform: '' as 'zoom' | 'teams' | 'meet' | 'webex' | 'custom' | '',
        meetingUrl: '',
        meetingId: '',
        password: '',
    })

    // Attendees state
    const [attendees, setAttendees] = useState<AttendeeInput[]>([])
    const [newAttendee, setNewAttendee] = useState({ name: '', email: '', role: 'required' as const })

    // Agenda state
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
    const [newAgendaItem, setNewAgendaItem] = useState({ title: '', duration: 15, presenter: '', notes: '' })

    // Reminders state
    const [selectedReminders, setSelectedReminders] = useState<number[]>([30])

    // Recurring config state
    const [isRecurring, setIsRecurring] = useState(false)
    const [recurringConfig, setRecurringConfig] = useState<RecurrenceConfig>({
        enabled: false,
        frequency: 'weekly',
        daysOfWeek: [],
        interval: 1,
    })

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Section toggles
    const [showLocation, setShowLocation] = useState(true)
    const [showAttendees, setShowAttendees] = useState(false)
    const [showAgenda, setShowAgenda] = useState(false)
    const [showRecurring, setShowRecurring] = useState(false)
    const [showReminders, setShowReminders] = useState(false)
    const [showBilling, setShowBilling] = useState(false)

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

    const addAttendee = () => {
        if (newAttendee.name.trim()) {
            setAttendees(prev => [...prev, {
                id: crypto.randomUUID(),
                ...newAttendee
            }])
            setNewAttendee({ name: '', email: '', role: 'required' })
        }
    }

    const removeAttendee = (id: string) => {
        setAttendees(prev => prev.filter(a => a.id !== id))
    }

    const addAgendaItem = () => {
        if (newAgendaItem.title.trim()) {
            setAgendaItems(prev => [...prev, {
                id: crypto.randomUUID(),
                ...newAgendaItem
            }])
            setNewAgendaItem({ title: '', duration: 15, presenter: '', notes: '' })
        }
    }

    const removeAgendaItem = (id: string) => {
        setAgendaItems(prev => prev.filter(a => a.id !== id))
    }

    const toggleReminder = (minutes: number) => {
        setSelectedReminders(prev =>
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

        // Build location object
        const location: string | EventLocation = locationType === 'physical' ? {
            type: 'physical',
            address: locationData.address,
            room: locationData.room,
            building: locationData.building,
        } : locationType === 'virtual' ? {
            type: 'virtual',
            platform: locationData.platform as any,
            meetingUrl: locationData.meetingUrl,
            meetingId: locationData.meetingId,
            password: locationData.password,
        } : {
            type: 'hybrid',
            address: locationData.address,
            room: locationData.room,
            platform: locationData.platform as any,
            meetingUrl: locationData.meetingUrl,
        }

        // Build reminders array
        const reminders: Omit<EventReminder, '_id' | 'sent' | 'sentAt'>[] = selectedReminders.map(minutes => ({
            type: 'notification' as const,
            beforeMinutes: minutes,
        }))

        // Build attendees array
        const attendeesData = attendees.map(a => ({
            name: a.name,
            email: a.email,
            role: a.role,
            rsvpStatus: 'pending' as const,
        }))

        // Build agenda array
        const agendaData = agendaItems.map((item, index) => ({
            order: index + 1,
            title: item.title,
            duration: item.duration,
            presenter: item.presenter,
            notes: item.notes,
        }))

        const eventData = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            status: formData.status,
            priority: formData.priority,
            color: formData.color,
            tags: formData.tags,
            startDate: formData.startDate,
            startTime: formData.startTime,
            endDate: formData.endDate || formData.startDate,
            endTime: formData.endTime,
            allDay: formData.allDay,
            duration: formData.duration,
            location,
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(attendeesData.length > 0 && { attendees: attendeesData }),
            ...(reminders.length > 0 && { reminders }),
            ...(agendaData.length > 0 && { agenda: agendaData }),
            ...(isRecurring && {
                recurrence: {
                    ...recurringConfig,
                    enabled: true,
                }
            }),
            billable: formData.billable,
            ...(formData.billable && formData.billingRate > 0 && { billingRate: formData.billingRate }),
        }

        createEventMutation.mutate(eventData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/events' })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: false },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Sidebar Widgets */}
                    <TasksSidebar />

                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/tasks/events">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">إنشاء فعالية جديدة</h2>
                                </div>
                                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                                    أضف جلسة، اجتماع، أو فعالية جديدة إلى الجدول لتنظيم وقتك بكفاءة.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-navy rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Calendar className="h-24 w-24 text-blue-400" />
                                </div>
                                <div className="absolute inset-4 bg-navy/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <MapPin className="h-24 w-24 text-purple-400" />
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                عنوان الفعالية <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: جلسة مرافعة"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-blue-500" />
                                                نوع الفعالية <span className="text-red-500">*</span>
                                            </label>
                                            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_TYPES.map(option => (
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                الأولوية
                                            </label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue />
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
                                                الحالة
                                            </label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue />
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">اللون</label>
                                            <div className="flex gap-2">
                                                {EVENT_COLORS.map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className={cn(
                                                            "w-8 h-8 rounded-full transition-all",
                                                            formData.color === color && "ring-2 ring-offset-2 ring-slate-400"
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => handleChange('color', color)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="allDay"
                                                checked={formData.allDay}
                                                onCheckedChange={(checked) => handleChange('allDay', checked === true)}
                                            />
                                            <label htmlFor="allDay" className="text-sm font-medium text-slate-700">
                                                طوال اليوم
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    تاريخ البداية <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                    required
                                                    value={formData.startDate}
                                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                                />
                                            </div>
                                            {!formData.allDay && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                        وقت البداية <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input
                                                        type="time"
                                                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                        required
                                                        value={formData.startTime}
                                                        onChange={(e) => handleChange('startTime', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    تاريخ النهاية
                                                </label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                    value={formData.endDate}
                                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                                />
                                            </div>
                                            {!formData.allDay && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                        وقت النهاية
                                                    </label>
                                                    <Input
                                                        type="time"
                                                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                        value={formData.endTime}
                                                        onChange={(e) => handleChange('endTime', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {!formData.allDay && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">المدة (دقائق)</label>
                                                <Input
                                                    type="number"
                                                    min="5"
                                                    step="5"
                                                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 w-32"
                                                    value={formData.duration}
                                                    onChange={(e) => handleChange('duration', parseInt(e.target.value) || 60)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Relations */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-blue-500" />
                                                القضية المرتبطة
                                            </label>
                                            <Select value={formData.caseId} onValueChange={(value) => handleChange('caseId', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                                العميل
                                            </label>
                                            <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
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
                                                        <div className="text-center py-4 text-slate-500 text-sm">
                                                            لا يوجد عملاء
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
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
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 flex-1"
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            تفاصيل إضافية
                                        </label>
                                        <Textarea
                                            placeholder="أدخل جدول الأعمال أو ملاحظات..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Location Section */}
                                <Collapsible open={showLocation} onOpenChange={setShowLocation}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-blue-500" />
                                                    الموقع
                                                </h3>
                                                {showLocation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="flex gap-2">
                                                    {LOCATION_TYPES.map(type => (
                                                        <Button
                                                            key={type.value}
                                                            type="button"
                                                            variant={locationType === type.value ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setLocationType(type.value as any)}
                                                            className="rounded-full"
                                                        >
                                                            {type.value === 'physical' && <MapPin className="w-4 h-4 ml-1" />}
                                                            {type.value === 'virtual' && <Video className="w-4 h-4 ml-1" />}
                                                            {type.label}
                                                        </Button>
                                                    ))}
                                                </div>

                                                {(locationType === 'physical' || locationType === 'hybrid') && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">العنوان</label>
                                                            <Input
                                                                placeholder="مثال: المحكمة العامة"
                                                                className="rounded-xl"
                                                                value={locationData.address}
                                                                onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">المبنى</label>
                                                            <Input
                                                                placeholder="مثال: المبنى الرئيسي"
                                                                className="rounded-xl"
                                                                value={locationData.building}
                                                                onChange={(e) => setLocationData(prev => ({ ...prev, building: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">القاعة/الغرفة</label>
                                                            <Input
                                                                placeholder="مثال: القاعة 4"
                                                                className="rounded-xl"
                                                                value={locationData.room}
                                                                onChange={(e) => setLocationData(prev => ({ ...prev, room: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {(locationType === 'virtual' || locationType === 'hybrid') && (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">المنصة</label>
                                                            <Select
                                                                value={locationData.platform}
                                                                onValueChange={(value) => setLocationData(prev => ({ ...prev, platform: value as any }))}
                                                            >
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue placeholder="اختر المنصة" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {VIRTUAL_PLATFORMS.map(platform => (
                                                                        <SelectItem key={platform.value} value={platform.value}>
                                                                            {platform.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">رابط الاجتماع</label>
                                                                <Input
                                                                    placeholder="https://..."
                                                                    className="rounded-xl"
                                                                    value={locationData.meetingUrl}
                                                                    onChange={(e) => setLocationData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">معرف الاجتماع</label>
                                                                <Input
                                                                    placeholder="Meeting ID"
                                                                    className="rounded-xl"
                                                                    value={locationData.meetingId}
                                                                    onChange={(e) => setLocationData(prev => ({ ...prev, meetingId: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
                                                            <Input
                                                                placeholder="Password"
                                                                className="rounded-xl w-48"
                                                                value={locationData.password}
                                                                onChange={(e) => setLocationData(prev => ({ ...prev, password: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Attendees Section */}
                                <Collapsible open={showAttendees} onOpenChange={setShowAttendees}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-blue-500" />
                                                    الحضور
                                                </h3>
                                                {showAttendees ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                {attendees.map((attendee) => (
                                                    <div key={attendee.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {attendee.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="font-medium text-slate-700">{attendee.name}</span>
                                                            {attendee.email && <span className="text-sm text-slate-500 block">{attendee.email}</span>}
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {attendee.role === 'organizer' ? 'منظم' : attendee.role === 'required' ? 'مطلوب' : 'اختياري'}
                                                        </Badge>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeAttendee(attendee.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <Input
                                                        placeholder="الاسم"
                                                        className="rounded-xl"
                                                        value={newAttendee.name}
                                                        onChange={(e) => setNewAttendee(prev => ({ ...prev, name: e.target.value }))}
                                                    />
                                                    <Input
                                                        placeholder="البريد الإلكتروني"
                                                        className="rounded-xl"
                                                        value={newAttendee.email}
                                                        onChange={(e) => setNewAttendee(prev => ({ ...prev, email: e.target.value }))}
                                                    />
                                                    <Select
                                                        value={newAttendee.role}
                                                        onValueChange={(value: 'organizer' | 'required' | 'optional') =>
                                                            setNewAttendee(prev => ({ ...prev, role: value }))
                                                        }
                                                    >
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="required">مطلوب</SelectItem>
                                                            <SelectItem value="optional">اختياري</SelectItem>
                                                            <SelectItem value="organizer">منظم</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button type="button" variant="outline" onClick={addAttendee} className="rounded-xl">
                                                        <Plus className="w-4 h-4 ml-2" />
                                                        إضافة
                                                    </Button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Agenda Section */}
                                <Collapsible open={showAgenda} onOpenChange={setShowAgenda}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <ListOrdered className="w-5 h-5 text-blue-500" />
                                                    جدول الأعمال
                                                </h3>
                                                {showAgenda ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                {agendaItems.map((item, index) => (
                                                    <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="font-medium text-slate-700">{item.title}</span>
                                                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                                                                <span>{item.duration} دقيقة</span>
                                                                {item.presenter && <span>المقدم: {item.presenter}</span>}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeAgendaItem(item.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    <Input
                                                        placeholder="عنوان البند"
                                                        className="rounded-xl"
                                                        value={newAgendaItem.title}
                                                        onChange={(e) => setNewAgendaItem(prev => ({ ...prev, title: e.target.value }))}
                                                    />
                                                    <Input
                                                        type="number"
                                                        min="5"
                                                        placeholder="المدة (دقائق)"
                                                        className="rounded-xl"
                                                        value={newAgendaItem.duration}
                                                        onChange={(e) => setNewAgendaItem(prev => ({ ...prev, duration: parseInt(e.target.value) || 15 }))}
                                                    />
                                                    <Input
                                                        placeholder="المقدم (اختياري)"
                                                        className="rounded-xl"
                                                        value={newAgendaItem.presenter}
                                                        onChange={(e) => setNewAgendaItem(prev => ({ ...prev, presenter: e.target.value }))}
                                                    />
                                                    <Button type="button" variant="outline" onClick={addAgendaItem} className="rounded-xl">
                                                        <Plus className="w-4 h-4 ml-2" />
                                                        إضافة
                                                    </Button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Reminders Section */}
                                <Collapsible open={showReminders} onOpenChange={setShowReminders}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Bell className="w-5 h-5 text-blue-500" />
                                                    التذكيرات
                                                </h3>
                                                {showReminders ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <p className="text-sm text-slate-500">إرسال تذكير:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {REMINDER_OPTIONS.map(option => (
                                                        <Button
                                                            key={option.value}
                                                            type="button"
                                                            variant={selectedReminders.includes(option.value) ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => toggleReminder(option.value)}
                                                            className="rounded-full"
                                                        >
                                                            {option.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Recurring Section */}
                                <Collapsible open={showRecurring} onOpenChange={setShowRecurring}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <Repeat className="w-5 h-5 text-blue-500" />
                                                    فعالية متكررة
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
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Billing Section */}
                                <Collapsible open={showBilling} onOpenChange={setShowBilling}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-blue-500" />
                                                    الفوترة
                                                </h3>
                                                {showBilling ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="billable"
                                                        checked={formData.billable}
                                                        onCheckedChange={(checked) => handleChange('billable', checked === true)}
                                                    />
                                                    <label htmlFor="billable" className="text-sm font-medium text-slate-700">
                                                        قابل للفوترة
                                                    </label>
                                                </div>

                                                {formData.billable && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">معدل الساعة (ريال)</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="rounded-xl w-48"
                                                            value={formData.billingRate}
                                                            onChange={(e) => handleChange('billingRate', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/tasks/events">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={createEventMutation.isPending}
                                    >
                                        {createEventMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ الفعالية
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
