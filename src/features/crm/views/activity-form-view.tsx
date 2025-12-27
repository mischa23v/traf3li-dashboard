import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, Save, User, Users, FileText,
    Calendar, MapPin, Clock, Bell, CheckCircle2,
    AlertCircle, Loader2, Phone, Mail, MessageSquare,
    ClipboardList, Target, Flag, UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useCreateActivity } from '@/hooks/useActivities'
import { useLeads } from '@/hooks/useAccounting'
import { useClients } from '@/hooks/useCasesAndClients'
import { useContacts } from '@/hooks/useContacts'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

const activityFormSchema = z.object({
    // Basic Info
    type: z.enum(['call', 'meeting', 'email', 'task', 'note']),
    subject: z.string().min(1, 'Subject is required'),
    subjectAr: z.string().optional(),
    description: z.string().optional(),

    // Related To
    relatedToType: z.enum(['lead', 'client', 'contact']),
    relatedToId: z.string().min(1, 'Related entity is required'),

    // Scheduling
    date: z.date({ required_error: 'Date is required' }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    duration: z.number().optional(),
    location: z.string().optional(),
    isAllDayEvent: z.boolean().default(false),

    // Participants
    participants: z.array(z.string()).optional(),

    // Status & Priority
    status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),

    // Outcome
    outcome: z.string().optional(),
    nextSteps: z.string().optional(),
    reminderDate: z.date().optional(),
})

type ActivityFormData = z.infer<typeof activityFormSchema>

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPE CONFIG
// ═══════════════════════════════════════════════════════════════

const ACTIVITY_TYPES = [
    { value: 'call', label: 'مكالمة', labelEn: 'Call', icon: Phone, color: 'text-blue-500' },
    { value: 'meeting', label: 'اجتماع', labelEn: 'Meeting', icon: Users, color: 'text-purple-500' },
    { value: 'email', label: 'بريد إلكتروني', labelEn: 'Email', icon: Mail, color: 'text-green-500' },
    { value: 'task', label: 'مهمة', labelEn: 'Task', icon: CheckCircle2, color: 'text-orange-500' },
    { value: 'note', label: 'ملاحظة', labelEn: 'Note', icon: MessageSquare, color: 'text-gray-500' },
]

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'منخفضة', labelEn: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'متوسطة', labelEn: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'عالية', labelEn: 'High', color: 'text-red-600' },
]

const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'مجدول', labelEn: 'Scheduled', color: 'text-blue-600' },
    { value: 'completed', label: 'مكتمل', labelEn: 'Completed', color: 'text-green-600' },
    { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled', color: 'text-red-600' },
]

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ActivityFormViewProps {
    editMode?: boolean
}

export function ActivityFormView({ editMode = false }: ActivityFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [searchQuery, setSearchQuery] = useState('')

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createActivityMutation = useCreateActivity()
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: leadsData, isLoading: loadingLeads } = useLeads()
    const { data: contactsData, isLoading: loadingContacts } = useContacts()

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<ActivityFormData>({
        resolver: zodResolver(activityFormSchema),
        defaultValues: {
            type: 'call',
            subject: '',
            subjectAr: '',
            description: '',
            relatedToType: 'client',
            relatedToId: '',
            date: new Date(),
            startTime: '',
            endTime: '',
            duration: undefined,
            location: '',
            isAllDayEvent: false,
            participants: [],
            status: 'scheduled',
            priority: 'medium',
            outcome: '',
            nextSteps: '',
            reminderDate: undefined,
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // ═══════════════════════════════════════════════════════════════
    // DURATION CALCULATION
    // ═══════════════════════════════════════════════════════════════

    const startTime = form.watch('startTime')
    const endTime = form.watch('endTime')

    useEffect(() => {
        if (startTime && endTime) {
            const [startHour, startMin] = startTime.split(':').map(Number)
            const [endHour, endMin] = endTime.split(':').map(Number)

            const startMinutes = startHour * 60 + startMin
            const endMinutes = endHour * 60 + endMin

            if (endMinutes > startMinutes) {
                const durationMinutes = endMinutes - startMinutes
                form.setValue('duration', durationMinutes)
            }
        }
    }, [startTime, endTime, form])

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: ActivityFormData) => {
        const activityData = {
            type: data.type,
            subject: data.subject,
            subjectAr: data.subjectAr,
            description: data.description,
            relatedToType: data.relatedToType,
            relatedToId: data.relatedToId,
            date: data.date.toISOString(),
            startTime: data.startTime,
            endTime: data.endTime,
            duration: data.duration,
            location: data.location,
            isAllDayEvent: data.isAllDayEvent,
            participants: data.participants || [],
            status: data.status,
            priority: data.priority,
            outcome: data.outcome,
            nextSteps: data.nextSteps,
            reminderDate: data.reminderDate?.toISOString(),
        }

        createActivityMutation.mutate(activityData as any, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.crm.activities.list })
            }
        })
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════

    const relatedToType = form.watch('relatedToType')
    const relatedToId = form.watch('relatedToId')
    const activityType = form.watch('type')
    const priority = form.watch('priority')
    const status = form.watch('status')

    const relatedEntities = useMemo(() => {
        switch (relatedToType) {
            case 'client':
                return clientsData?.data || []
            case 'lead':
                return leadsData?.data || []
            case 'contact':
                return contactsData?.data || []
            default:
                return []
        }
    }, [relatedToType, clientsData, leadsData, contactsData])

    const filteredEntities = useMemo(() => {
        return relatedEntities.filter((entity: any) => {
            const name = entity.fullName || entity.name || `${entity.firstName || ''} ${entity.lastName || ''}`.trim()
            return name.toLowerCase().includes(searchQuery.toLowerCase())
        })
    }, [relatedEntities, searchQuery])

    const selectedEntity = relatedEntities.find((e: any) => e._id === relatedToId)

    const selectedActivityType = ACTIVITY_TYPES.find(t => t.value === activityType)
    const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority)
    const selectedStatus = STATUS_OPTIONS.find(s => s.value === status)

    const isLoading = loadingClients || loadingLeads || loadingContacts

    // ═══════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════

    if (editMode) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={[]} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </Main>
            </>
        )
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    const topNav = [
        { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: true },
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                {/* Hero */}
                <ProductivityHero
                    badge="الأنشطة"
                    title={editMode ? "تعديل النشاط" : "إنشاء نشاط جديد"}
                    type="crm"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.crm.activities.list })}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </ProductivityHero>

                {/* Form Card */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
                        {/* Form Content */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                    المعلومات الأساسية
                                </h2>

                                {/* Activity Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        نوع النشاط <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="type"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {ACTIVITY_TYPES.map((type) => {
                                                    const Icon = type.icon
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => field.onChange(type.value)}
                                                            className={cn(
                                                                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                                                field.value === type.value
                                                                    ? "border-blue-500 bg-blue-50"
                                                                    : "border-slate-200 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <Icon className={cn("w-6 h-6", type.color)} />
                                                            <span className="text-sm font-medium">
                                                                {isRTL ? type.label : type.labelEn}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Subject */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الموضوع <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="subject"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="مثال: مكالمة متابعة مع العميل"
                                                    className="rounded-xl"
                                                />
                                            )}
                                        />
                                        {form.formState.errors.subject && (
                                            <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الموضوع بالإنجليزية
                                        </label>
                                        <Controller
                                            name="subjectAr"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    placeholder="Follow-up call with client"
                                                    className="rounded-xl"
                                                    dir="ltr"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        الوصف
                                    </label>
                                    <Controller
                                        name="description"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="تفاصيل إضافية حول النشاط..."
                                                className="rounded-xl min-h-[100px]"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            {/* Related To Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                    <Target className="w-6 h-6 text-blue-500" />
                                    مرتبط بـ
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Controller
                                        name="relatedToType"
                                        control={form.control}
                                        render={({ field }) => (
                                            <div className="space-y-3">
                                                {[
                                                    { value: 'client', label: 'عميل', icon: User },
                                                    { value: 'lead', label: 'عميل محتمل', icon: Users },
                                                    { value: 'contact', label: 'جهة اتصال', icon: UserPlus },
                                                ].map((type) => {
                                                    const Icon = type.icon
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => {
                                                                field.onChange(type.value)
                                                                form.setValue('relatedToId', '')
                                                            }}
                                                            className={cn(
                                                                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                                                                field.value === type.value
                                                                    ? "border-blue-500 bg-blue-50"
                                                                    : "border-slate-200 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <Icon className="w-5 h-5 text-blue-500" />
                                                            <span className="font-medium">{type.label}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    />

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            اختيار {relatedToType === 'client' ? 'العميل' : relatedToType === 'lead' ? 'العميل المحتمل' : 'جهة الاتصال'}
                                            <span className="text-red-500 ms-1">*</span>
                                        </label>

                                        <Controller
                                            name="relatedToId"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder={
                                                            isLoading
                                                                ? "جاري التحميل..."
                                                                : "اختر من القائمة"
                                                        } />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredEntities.map((entity: any) => (
                                                            <SelectItem key={entity._id} value={entity._id}>
                                                                {entity.fullName || entity.name || `${entity.firstName || ''} ${entity.lastName || ''}`.trim()}
                                                                {entity.email && (
                                                                    <span className="text-xs text-slate-500 ms-2">({entity.email})</span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {form.formState.errors.relatedToId && (
                                            <p className="text-sm text-red-500">{form.formState.errors.relatedToId.message}</p>
                                        )}

                                        {selectedEntity && (
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-navy">
                                                            {selectedEntity.fullName || selectedEntity.name || `${selectedEntity.firstName || ''} ${selectedEntity.lastName || ''}`.trim()}
                                                        </h4>
                                                        {selectedEntity.email && (
                                                            <p className="text-sm text-slate-600">{selectedEntity.email}</p>
                                                        )}
                                                        {selectedEntity.phone && (
                                                            <p className="text-sm text-slate-600" dir="ltr">{selectedEntity.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            {/* Scheduling Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-blue-500" />
                                    الجدولة والتوقيت
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            التاريخ <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="date"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-right font-normal rounded-xl",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <Calendar className="ms-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: ar })
                                                            ) : (
                                                                <span>اختر التاريخ</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>

                                    {/* All Day Event */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            &nbsp;
                                        </label>
                                        <Controller
                                            name="isAllDayEvent"
                                            control={form.control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-3 h-10 px-4 bg-slate-50 rounded-xl">
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        id="isAllDayEvent"
                                                    />
                                                    <Label htmlFor="isAllDayEvent" className="text-sm font-medium cursor-pointer">
                                                        حدث طوال اليوم
                                                    </Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {!form.watch('isAllDayEvent') && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Start Time */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                وقت البداية
                                            </label>
                                            <Controller
                                                name="startTime"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="time"
                                                        className="rounded-xl"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* End Time */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                وقت النهاية
                                            </label>
                                            <Controller
                                                name="endTime"
                                                control={form.control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="time"
                                                        className="rounded-xl"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Duration */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                المدة (دقيقة)
                                            </label>
                                            <div className="h-10 flex items-center px-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium">
                                                {form.watch('duration') ? `${form.watch('duration')} دقيقة` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        الموقع
                                    </label>
                                    <Controller
                                        name="location"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="مثال: مكتب الرياض - قاعة الاجتماعات"
                                                className="rounded-xl"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            {/* Status & Priority Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                    <Flag className="w-6 h-6 text-blue-500" />
                                    الحالة والأولوية
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Status */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الحالة
                                        </label>
                                        <Controller
                                            name="status"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                <span className={status.color}>
                                                                    {isRTL ? status.label : status.labelEn}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الأولوية
                                        </label>
                                        <Controller
                                            name="priority"
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PRIORITY_OPTIONS.map((priority) => (
                                                            <SelectItem key={priority.value} value={priority.value}>
                                                                <span className={priority.color}>
                                                                    {isRTL ? priority.label : priority.labelEn}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-200" />

                            {/* Outcome Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                                    <ClipboardList className="w-6 h-6 text-blue-500" />
                                    النتيجة والخطوات التالية
                                </h2>

                                {/* Outcome */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        نتيجة النشاط
                                    </label>
                                    <Controller
                                        name="outcome"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="ما هي نتيجة هذا النشاط؟"
                                                className="rounded-xl min-h-[80px]"
                                            />
                                        )}
                                    />
                                </div>

                                {/* Next Steps */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        الخطوات التالية
                                    </label>
                                    <Controller
                                        name="nextSteps"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="ما هي الإجراءات المطلوبة بعد هذا النشاط؟"
                                                className="rounded-xl min-h-[80px]"
                                            />
                                        )}
                                    />
                                </div>

                                {/* Reminder Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-blue-500" />
                                        تاريخ التذكير
                                    </label>
                                    <Controller
                                        name="reminderDate"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full md:w-auto justify-start text-right font-normal rounded-xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <Bell className="ms-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: ar })
                                                        ) : (
                                                            <span>اختر تاريخ التذكير</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: ROUTES.dashboard.crm.activities.list })}
                                    className="rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    إلغاء
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 ms-2" />
                                            {editMode ? 'حفظ التغييرات' : 'إنشاء النشاط'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Main>

            {/* Unsaved Changes Dialog */}
            <Dialog open={blocker.state === 'blocked'} onOpenChange={() => {}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغييرات غير محفوظة</DialogTitle>
                        <DialogDescription>
                            لديك تغييرات غير محفوظة. هل تريد حقاً المغادرة؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => blocker.reset?.()}>
                            البقاء في الصفحة
                        </Button>
                        <Button variant="destructive" onClick={() => blocker.proceed?.()}>
                            المغادرة بدون حفظ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ActivityFormView
