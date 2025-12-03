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
import { ProductivityHero } from '@/components/productivity-hero'
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

const PRIORITY_OPTIONS: { value: EventPriority; label: string; color: string; tooltip: string }[] = [
    { value: 'critical', label: 'عاجل جداً', color: 'bg-red-500', tooltip: 'حدث عاجل جداً يتطلب حضوراً فورياً ولا يحتمل أي تأخير' },
    { value: 'high', label: 'عاجل', color: 'bg-orange-500', tooltip: 'حدث عاجل يجب الانتباه له في أقرب وقت ممكن' },
    { value: 'medium', label: 'متوسطة', color: 'bg-yellow-500', tooltip: 'حدث ذو أهمية متوسطة ضمن الجدول الزمني المعتاد' },
    { value: 'low', label: 'عادية', color: 'bg-emerald-500', tooltip: 'حدث عادي يمكن جدولته ضمن المواعيد الاعتيادية' },
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

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Validate a single field
    const validateField = (field: string, value: any): string => {
        switch (field) {
            case 'title':
                if (!value || !value.trim()) return 'عنوان الحدث مطلوب'
                if (value.length < 3) return 'يجب أن يكون العنوان 3 أحرف على الأقل'
                return ''
            case 'startDate':
                if (!value) return 'تاريخ البداية مطلوب'
                return ''
            case 'startTime':
                if (!formData.allDay && !value) return 'وقت البداية مطلوب'
                return ''
            default:
                return ''
        }
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const requiredFields = ['title', 'startDate']
        if (!formData.allDay) requiredFields.push('startTime')

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field as keyof typeof formData])
            if (error) newErrors[field] = error
        })

        setErrors(newErrors)
        setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}))
        return Object.keys(newErrors).length === 0
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

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        // Combine date and time into ISO 8601 datetime
        const startDateTime = formData.startDate && formData.startTime
            ? new Date(`${formData.startDate}T${formData.startTime}:00`).toISOString()
            : undefined

        const endDateTime = (formData.endDate || formData.startDate) && formData.endTime
            ? new Date(`${formData.endDate || formData.startDate}T${formData.endTime}:00`).toISOString()
            : undefined

        // Build reminders array per API spec: { type: 'email', beforeMinutes: 60 }
        const reminders = selectedReminders.map(minutes => ({
            type: 'email' as const,
            beforeMinutes: minutes,
        }))

        // Build attendees array
        const attendeesData = attendees.map(a => ({
            name: a.name,
            email: a.email,
            role: a.role,
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
            priority: formData.priority,
            color: formData.color,
            startDateTime,
            endDateTime,
            location: locationType === 'physical' ? {
                name: locationData.room || locationData.building || 'Office',
                address: locationData.address,
            } : locationType === 'virtual' ? {
                name: locationData.platform || 'Virtual Meeting',
                meetingUrl: locationData.meetingUrl,
            } : {
                name: locationData.room || 'Hybrid Meeting',
                address: locationData.address,
                meetingUrl: locationData.meetingUrl,
            },
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(attendeesData.length > 0 && { attendees: attendeesData }),
            ...(reminders.length > 0 && { reminders }),
            ...(isRecurring && {
                recurrence: {
                    ...recurringConfig,
                    enabled: true,
                }
            }),
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
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="الأحداث" title="إضافة حدث جديد" type="events" hideButtons={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            عنوان الحدث <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="مثال: اجتماع مراجعة العقد"
                                            className={cn(
                                                "rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500",
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">نوع الحدث</label>
                                            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_TYPES.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("w-2 h-2 rounded-full", option.color.split(' ')[0])} />
                                                                {option.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الحالة</label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl">
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                تاريخ البداية <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                className={cn(
                                                    "rounded-xl",
                                                    touched.startDate && errors.startDate && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.startDate}
                                                onChange={(e) => handleChange('startDate', e.target.value)}
                                                onBlur={() => handleBlur('startDate')}
                                            />
                                            {touched.startDate && errors.startDate && (
                                                <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                وقت البداية {!formData.allDay && <span className="text-red-500">*</span>}
                                            </label>
                                            <Input
                                                type="time"
                                                className={cn(
                                                    "rounded-xl",
                                                    touched.startTime && errors.startTime && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                disabled={formData.allDay}
                                                value={formData.startTime}
                                                onChange={(e) => handleChange('startTime', e.target.value)}
                                                onBlur={() => handleBlur('startTime')}
                                            />
                                            {touched.startTime && errors.startTime && (
                                                <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="allDay"
                                            checked={formData.allDay}
                                            onCheckedChange={(checked) => handleChange('allDay', checked === true)}
                                        />
                                        <label htmlFor="allDay" className="text-sm font-medium text-slate-700">
                                            طوال اليوم
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">الوصف</label>
                                        <Textarea
                                            placeholder="تفاصيل إضافية..."
                                            className="min-h-[100px] rounded-xl"
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
                                                <div className="flex gap-4">
                                                    {LOCATION_TYPES.map(type => (
                                                        <div key={type.value} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="locationType"
                                                                id={`loc-${type.value}`}
                                                                checked={locationType === type.value}
                                                                onChange={() => setLocationType(type.value as any)}
                                                                className="text-blue-500 focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={`loc-${type.value}`} className="text-sm text-slate-700">{type.label}</label>
                                                        </div>
                                                    ))}
                                                </div>

                                                {(locationType === 'physical' || locationType === 'hybrid') && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Input
                                                            placeholder="العنوان"
                                                            className="rounded-xl"
                                                            value={locationData.address}
                                                            onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                                                        />
                                                        <Input
                                                            placeholder="الغرفة / القاعة"
                                                            className="rounded-xl"
                                                            value={locationData.room}
                                                            onChange={(e) => setLocationData(prev => ({ ...prev, room: e.target.value }))}
                                                        />
                                                    </div>
                                                )}

                                                {(locationType === 'virtual' || locationType === 'hybrid') && (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <Select
                                                                value={locationData.platform}
                                                                onValueChange={(value: any) => setLocationData(prev => ({ ...prev, platform: value }))}
                                                            >
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue placeholder="اختر المنصة" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {VIRTUAL_PLATFORMS.map(p => (
                                                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Input
                                                                placeholder="رابط الاجتماع"
                                                                className="rounded-xl"
                                                                value={locationData.meetingUrl}
                                                                onChange={(e) => setLocationData(prev => ({ ...prev, meetingUrl: e.target.value }))}
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
                                                    المشاركون
                                                </h3>
                                                {showAttendees ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                {attendees.map((attendee) => (
                                                    <div key={attendee.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {attendee.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-slate-700">{attendee.name}</div>
                                                            <div className="text-xs text-slate-500">{attendee.email}</div>
                                                        </div>
                                                        <Badge variant="outline">{attendee.role}</Badge>
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
                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar context="events" />
                </div>
            </Main>
        </>
    )
}
