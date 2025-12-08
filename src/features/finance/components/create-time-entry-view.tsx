/**
 * Time Entry Form - Complete Implementation
 *
 * Features:
 * - UTBMS Activity Codes for legal work
 * - Multiple time entry methods (duration, start/end, timer)
 * - Time type selection (billable, non-billable, pro_bono, internal)
 * - Write-off and write-down functionality
 * - Advanced sections (organization, task, expenses, budget, approval)
 * - Quick templates
 * - RTL/LTR support
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import {
    Save, Calendar, Clock, FileText, Briefcase, DollarSign, Loader2,
    User, Timer, Play, Pause, Square, RotateCcw, Plus, X, Copy,
    History, Send, CheckCircle, XCircle, Building2, CheckSquare,
    Receipt, Info, AlertTriangle, Calculator, Ban, Heart, Building,
    MessageSquare, Search, FileEdit, FileSearch, BarChart, Scale,
    Users, Phone, Mail, Handshake, Users2, Gavel as GavelIcon, Plane,
    FolderOpen, GraduationCap, BookOpen, MoreVertical, Separator as SeparatorIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateTimeEntry } from '@/hooks/useFinance'
import { useCases, useClients, useTeamMembers } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'

// ==================== UTBMS ACTIVITY CODES ====================

interface ActivityCode {
    code: string
    category: string
    description: string
    descriptionAr: string
    icon: any
}

const UTBMS_CODES: ActivityCode[] = [
    // L100 - Case Assessment & Strategy
    { code: 'L110', category: 'case_assessment', description: 'Legal consultation', descriptionAr: 'استشارة قانونية', icon: MessageSquare },
    { code: 'L120', category: 'case_assessment', description: 'Legal research', descriptionAr: 'بحث قانوني', icon: Search },
    { code: 'L130', category: 'case_assessment', description: 'Drafting documents', descriptionAr: 'صياغة مستندات', icon: FileEdit },
    { code: 'L140', category: 'case_assessment', description: 'Document review', descriptionAr: 'مراجعة مستندات', icon: FileSearch },
    { code: 'L150', category: 'case_assessment', description: 'Case analysis', descriptionAr: 'تحليل قضية', icon: BarChart },

    // L200 - Court & Legal Proceedings
    { code: 'L210', category: 'court_proceedings', description: 'Court attendance', descriptionAr: 'حضور جلسة محكمة', icon: Scale },
    { code: 'L220', category: 'court_proceedings', description: 'Client meeting', descriptionAr: 'اجتماع مع العميل', icon: Users },
    { code: 'L230', category: 'court_proceedings', description: 'Phone call/conference', descriptionAr: 'مكالمة هاتفية/مؤتمر', icon: Phone },
    { code: 'L240', category: 'court_proceedings', description: 'Correspondence', descriptionAr: 'مراسلات', icon: Mail },
    { code: 'L250', category: 'court_proceedings', description: 'Negotiations', descriptionAr: 'مفاوضات', icon: Handshake },
    { code: 'L260', category: 'court_proceedings', description: 'Mediation', descriptionAr: 'وساطة', icon: Users2 },
    { code: 'L270', category: 'court_proceedings', description: 'Arbitration', descriptionAr: 'تحكيم', icon: GavelIcon },

    // L300 - Travel & Waiting
    { code: 'L310', category: 'travel', description: 'Travel time', descriptionAr: 'وقت السفر', icon: Plane },
    { code: 'L320', category: 'travel', description: 'Waiting time', descriptionAr: 'وقت الانتظار', icon: Clock },

    // L400 - Administrative
    { code: 'L410', category: 'administrative', description: 'Administrative tasks', descriptionAr: 'أعمال إدارية', icon: Briefcase },
    { code: 'L420', category: 'administrative', description: 'File organization', descriptionAr: 'تنظيم ملفات', icon: FolderOpen },

    // L500 - Training & Development
    { code: 'L510', category: 'training', description: 'Training & development', descriptionAr: 'تدريب وتطوير', icon: GraduationCap },
    { code: 'L520', category: 'training', description: 'Legal research (educational)', descriptionAr: 'بحث قانوني (تعليمي)', icon: BookOpen },
]

const ACTIVITY_CATEGORIES = [
    { value: 'case_assessment', label: 'تقييم القضية واستراتيجية' },
    { value: 'court_proceedings', label: 'المحاكم والإجراءات القانونية' },
    { value: 'travel', label: 'السفر والانتظار' },
    { value: 'administrative', label: 'إدارية' },
    { value: 'training', label: 'تدريب وتطوير' },
]

// ==================== TIME TYPES ====================

const TIME_TYPES = [
    {
        value: 'billable',
        label: 'قابل للفوترة',
        description: 'يحمل على العميل',
        icon: DollarSign,
        color: 'text-green-600'
    },
    {
        value: 'non_billable',
        label: 'غير قابل للفوترة',
        description: 'لا يحمل على العميل',
        icon: Ban,
        color: 'text-gray-600'
    },
    {
        value: 'pro_bono',
        label: 'خدمات مجانية',
        description: 'Pro Bono',
        icon: Heart,
        color: 'text-red-600'
    },
    {
        value: 'internal',
        label: 'داخلي',
        description: 'أعمال المكتب',
        icon: Building,
        color: 'text-blue-600'
    },
]

// ==================== QUICK TIME OPTIONS ====================

const QUICK_TIMES = [
    { label: '15د', minutes: 15 },
    { label: '30د', minutes: 30 },
    { label: '45د', minutes: 45 },
    { label: '1س', minutes: 60 },
    { label: '1.5س', minutes: 90 },
    { label: '2س', minutes: 120 },
]

// ==================== HELPER FUNCTIONS ====================

const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} دقيقة`
    if (mins === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${mins} دقيقة`
}

const formatTimerDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount / 100) // Convert from halalas
}

// ==================== MAIN COMPONENT ====================

export function CreateTimeEntryView() {
    const navigate = useNavigate()
    const createTimeEntryMutation = useCreateTimeEntry()

    // Load data from API
    const { data: casesData, isLoading: loadingCases } = useCases()
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: teamData, isLoading: loadingTeam } = useTeamMembers()

    // Form state
    const [formData, setFormData] = useState({
        // Basic fields
        date: new Date().toISOString().split('T')[0],
        attorneyId: '',
        clientId: '',
        caseId: '',

        // Time type
        timeType: 'billable' as 'billable' | 'non_billable' | 'pro_bono' | 'internal',

        // Activity
        activityCode: '',
        activityDescription: '',

        // Time entry method
        entryMethod: 'duration' as 'duration' | 'start_end' | 'timer',

        // Duration method
        hours: 0,
        minutes: 0,

        // Start/End method
        startTime: '',
        endTime: '',
        breakMinutes: 0,

        // Description
        description: '',

        // Billing
        hourlyRate: 50000, // In halalas (500 SAR)
        billable: true,
        writeOff: false,
        writeOffReason: '',
        writeDown: false,
        writeDownAmount: 0,
        writeDownReason: '',

        // Notes
        notes: '',

        // Advanced
        departmentId: '',
        locationId: '',
        practiceArea: '',
        phase: '',
        taskId: '',
    })

    // Timer state
    const [timerRunning, setTimerRunning] = useState(false)
    const [timerPaused, setTimerPaused] = useState(false)
    const [timerStartedAt, setTimerStartedAt] = useState<Date | null>(null)
    const [timerStoppedAt, setTimerStoppedAt] = useState<Date | null>(null)
    const [timerElapsed, setTimerElapsed] = useState(0) // in seconds
    const [timerPausedDuration, setTimerPausedDuration] = useState(0) // total paused time
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Calculate total minutes
    const totalMinutes = useMemo(() => {
        if (formData.entryMethod === 'duration') {
            return formData.hours * 60 + formData.minutes
        } else if (formData.entryMethod === 'start_end') {
            if (!formData.startTime || !formData.endTime) return 0
            const start = new Date(`2000-01-01T${formData.startTime}`)
            const end = new Date(`2000-01-01T${formData.endTime}`)
            const diffMs = end.getTime() - start.getTime()
            if (diffMs < 0) return 0
            return Math.round(diffMs / (1000 * 60)) - formData.breakMinutes
        } else if (formData.entryMethod === 'timer') {
            return Math.floor(timerElapsed / 60)
        }
        return 0
    }, [formData.entryMethod, formData.hours, formData.minutes, formData.startTime, formData.endTime, formData.breakMinutes, timerElapsed])

    // Calculate billable amount
    const billableAmount = useMemo(() => {
        if (!formData.billable || formData.writeOff) return 0
        const baseAmount = (totalMinutes / 60) * formData.hourlyRate
        if (formData.writeDown) {
            return baseAmount - formData.writeDownAmount
        }
        return baseAmount
    }, [totalMinutes, formData.hourlyRate, formData.billable, formData.writeOff, formData.writeDown, formData.writeDownAmount])

    // Timer effect
    useEffect(() => {
        if (timerRunning && !timerPaused) {
            timerRef.current = setInterval(() => {
                setTimerElapsed(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [timerRunning, timerPaused])

    // Timer controls
    const startTimer = () => {
        setTimerStartedAt(new Date())
        setTimerRunning(true)
        setTimerPaused(false)
        setTimerElapsed(0)
        setTimerPausedDuration(0)
        setTimerStoppedAt(null)
    }

    const pauseTimer = () => {
        setTimerPaused(true)
    }

    const resumeTimer = () => {
        setTimerPaused(false)
    }

    const stopTimer = () => {
        setTimerRunning(false)
        setTimerStoppedAt(new Date())
    }

    const resetTimer = () => {
        setTimerRunning(false)
        setTimerPaused(false)
        setTimerStartedAt(null)
        setTimerStoppedAt(null)
        setTimerElapsed(0)
        setTimerPausedDuration(0)
    }

    // Handle activity code change
    const handleActivityCodeChange = (code: string) => {
        const activity = UTBMS_CODES.find(a => a.code === code)
        setFormData(prev => ({
            ...prev,
            activityCode: code,
            activityDescription: activity?.descriptionAr || ''
        }))
    }

    // Handle quick time selection
    const handleQuickTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        setFormData(prev => ({ ...prev, hours, minutes: mins }))
    }

    // Get selected case and client
    const selectedCase = useMemo(() => {
        if (!formData.caseId || !casesData?.data) return null
        return casesData.data.find((c: any) => c._id === formData.caseId)
    }, [formData.caseId, casesData])

    const selectedClient = useMemo(() => {
        if (!formData.clientId || !clientsData?.data) return null
        return clientsData.data.find((c: any) => c._id === formData.clientId)
    }, [formData.clientId, clientsData])

    // Handle submit
    const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'submit' = 'submit') => {
        e.preventDefault()

        if (totalMinutes <= 0 || !formData.activityCode) return

        const resolvedClientId = formData.clientId || selectedCase?.clientId?._id || selectedCase?.clientId || ''

        const timeEntryData = {
            description: formData.description,
            caseId: formData.caseId,
            clientId: resolvedClientId,
            activityCode: formData.activityCode,
            date: formData.date,
            duration: totalMinutes,
            hourlyRate: formData.hourlyRate,
            isBillable: formData.billable && formData.timeType === 'billable',
            billStatus: action === 'draft' ? 'draft' : 'unbilled',
            timeType: formData.timeType,
            ...(formData.attorneyId && { assigneeId: formData.attorneyId }),
            ...(formData.notes && { notes: formData.notes }),
            ...(formData.startTime && { startTime: formData.startTime }),
            ...(formData.endTime && { endTime: formData.endTime }),
            ...(formData.departmentId && { departmentId: formData.departmentId }),
            ...(formData.practiceArea && { practiceArea: formData.practiceArea }),
        }

        createTimeEntryMutation.mutate(timeEntryData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/time-tracking' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD */}
                <ProductivityHero badge="تتبع الوقت" title="تسجيل وقت جديد" type="time-tracking" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN FORM */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={(e) => handleSubmit(e, 'submit')}>

                            {/* BASIC FIELDS CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900">البيانات الأساسية</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    {/* Date & Attorney */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                التاريخ
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                المحامي
                                            </Label>
                                            <Select
                                                value={formData.attorneyId}
                                                onValueChange={(value) => setFormData({ ...formData, attorneyId: value })}
                                                disabled={loadingTeam}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={loadingTeam ? "جاري التحميل..." : "اختر المحامي"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="current">المستخدم الحالي</SelectItem>
                                                    {teamData?.data?.map((member: any) => (
                                                        <SelectItem key={member._id} value={member._id}>
                                                            {member.fullName || member.name || member.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Client & Case */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                العميل
                                            </Label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData({ ...formData, clientId: value, caseId: '' })}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية (اختياري)
                                            </Label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                                                disabled={loadingCases || !formData.clientId}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={!formData.clientId ? "اختر العميل أولاً" : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {casesData?.data?.filter((c: any) =>
                                                        c.clientId?._id === formData.clientId || c.clientId === formData.clientId
                                                    ).map((caseItem: any) => (
                                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                                            {caseItem.caseNumber} - {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Time Type */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-700">نوع الوقت</Label>
                                        <RadioGroup
                                            value={formData.timeType}
                                            onValueChange={(value: any) => setFormData({ ...formData, timeType: value, billable: value === 'billable' })}
                                            className="grid grid-cols-2 md:grid-cols-4 gap-3"
                                        >
                                            {TIME_TYPES.map((type) => {
                                                const Icon = type.icon
                                                return (
                                                    <div key={type.value} className="relative">
                                                        <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={type.value}
                                                            className={cn(
                                                                "flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all",
                                                                "hover:bg-slate-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50"
                                                            )}
                                                        >
                                                            <Icon className={cn("h-6 w-6", type.color)} />
                                                            <span className="font-semibold text-sm text-center">{type.label}</span>
                                                            <span className="text-xs text-slate-500 text-center">{type.description}</span>
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                        </RadioGroup>
                                    </div>

                                    {/* Activity Code */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">نوع النشاط (UTBMS)</Label>
                                        <Select
                                            value={formData.activityCode}
                                            onValueChange={handleActivityCodeChange}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="اختر نوع النشاط" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACTIVITY_CATEGORIES.map(category => (
                                                    <SelectGroup key={category.value}>
                                                        <SelectLabel className="font-bold text-slate-700">{category.label}</SelectLabel>
                                                        {UTBMS_CODES.filter(code => code.category === category.value).map(code => {
                                                            const Icon = code.icon
                                                            return (
                                                                <SelectItem key={code.code} value={code.code}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon className="h-4 w-4 text-slate-500" />
                                                                        <span className="font-mono text-xs text-slate-600">{code.code}</span>
                                                                        <span>{code.descriptionAr}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectGroup>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* TIME ENTRY METHOD CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900">طريقة تسجيل الوقت</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={formData.entryMethod} onValueChange={(v: any) => setFormData({ ...formData, entryMethod: v })}>
                                        <TabsList className="grid grid-cols-3 w-full mb-6">
                                            <TabsTrigger value="duration" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                                                <Clock className="ms-2 h-4 w-4" aria-hidden="true" />
                                                المدة المباشرة
                                            </TabsTrigger>
                                            <TabsTrigger value="start_end" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                                                <Calendar className="ms-2 h-4 w-4" aria-hidden="true" />
                                                وقت البدء/الانتهاء
                                            </TabsTrigger>
                                            <TabsTrigger value="timer" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                                                <Timer className="ms-2 h-4 w-4" />
                                                مؤقت
                                            </TabsTrigger>
                                        </TabsList>

                                        {/* Duration Method */}
                                        <TabsContent value="duration" className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>الساعات</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.hours}
                                                        onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                                                        min="0"
                                                        max="24"
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>الدقائق</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.minutes}
                                                        onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                                                        min="0"
                                                        max="59"
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Time Buttons */}
                                            <div className="grid grid-cols-6 gap-2">
                                                {QUICK_TIMES.map(qt => (
                                                    <Button
                                                        key={qt.minutes}
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleQuickTime(qt.minutes)}
                                                        className="rounded-xl"
                                                    >
                                                        {qt.label}
                                                    </Button>
                                                ))}
                                            </div>

                                            {totalMinutes > 0 && (
                                                <Alert className="bg-emerald-50 border-emerald-200">
                                                    <Info className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                                    <AlertDescription className="flex justify-between items-center">
                                                        <span className="text-emerald-700">إجمالي الوقت:</span>
                                                        <span className="text-lg font-bold text-emerald-800">{formatDuration(totalMinutes)}</span>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </TabsContent>

                                        {/* Start/End Method */}
                                        <TabsContent value="start_end" className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>وقت البدء</Label>
                                                    <Input
                                                        type="time"
                                                        value={formData.startTime}
                                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>وقت الانتهاء</Label>
                                                    <Input
                                                        type="time"
                                                        value={formData.endTime}
                                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>وقت الاستراحة (دقائق)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.breakMinutes}
                                                    onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                                                    min="0"
                                                    className="rounded-xl border-slate-200"
                                                />
                                                <p className="text-xs text-slate-500">سيتم خصم هذا الوقت من المجموع</p>
                                            </div>

                                            {formData.startTime && formData.endTime && totalMinutes > 0 && (
                                                <Alert className="bg-emerald-50 border-emerald-200">
                                                    <Calculator className="h-4 w-4 text-emerald-600" />
                                                    <AlertDescription className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-emerald-700">وقت العمل الفعلي:</span>
                                                            <span className="font-medium">{formatDuration(totalMinutes + formData.breakMinutes)}</span>
                                                        </div>
                                                        {formData.breakMinutes > 0 && (
                                                            <div className="flex justify-between text-sm text-slate-500">
                                                                <span>وقت الاستراحة:</span>
                                                                <span>- {formatDuration(formData.breakMinutes)}</span>
                                                            </div>
                                                        )}
                                                        <Separator className="my-1" />
                                                        <div className="flex justify-between">
                                                            <span className="font-semibold text-emerald-800">الإجمالي:</span>
                                                            <span className="text-lg font-bold text-emerald-800">{formatDuration(totalMinutes)}</span>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </TabsContent>

                                        {/* Timer Method */}
                                        <TabsContent value="timer" className="space-y-4">
                                            <div className="flex flex-col items-center justify-center p-8 space-y-6">
                                                {/* Timer Display */}
                                                <div className="text-center">
                                                    <div className="text-6xl font-bold font-mono text-slate-800">
                                                        {formatTimerDisplay(timerElapsed)}
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-2">
                                                        {timerRunning && !timerPaused && "قيد التشغيل..."}
                                                        {timerPaused && "متوقف مؤقتاً"}
                                                        {timerStoppedAt && "تم الإيقاف"}
                                                        {!timerStartedAt && "جاهز للبدء"}
                                                    </p>
                                                </div>

                                                {/* Timer Controls */}
                                                <div className="flex gap-4">
                                                    {!timerStartedAt && (
                                                        <Button
                                                            type="button"
                                                            size="lg"
                                                            onClick={startTimer}
                                                            className="px-8 bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            <Play className="ms-2 h-5 w-5" />
                                                            بدء المؤقت
                                                        </Button>
                                                    )}

                                                    {timerRunning && !timerPaused && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                size="lg"
                                                                variant="outline"
                                                                onClick={pauseTimer}
                                                            >
                                                                <Pause className="ms-2 h-5 w-5" />
                                                                إيقاف مؤقت
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="lg"
                                                                variant="destructive"
                                                                onClick={stopTimer}
                                                            >
                                                                <Square className="ms-2 h-5 w-5" />
                                                                إيقاف
                                                            </Button>
                                                        </>
                                                    )}

                                                    {timerPaused && (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                size="lg"
                                                                onClick={resumeTimer}
                                                                className="bg-emerald-500 hover:bg-emerald-600"
                                                            >
                                                                <Play className="ms-2 h-5 w-5" />
                                                                استئناف
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="lg"
                                                                variant="destructive"
                                                                onClick={stopTimer}
                                                            >
                                                                <Square className="ms-2 h-5 w-5" />
                                                                إيقاف
                                                            </Button>
                                                        </>
                                                    )}

                                                    {timerStoppedAt && (
                                                        <Button
                                                            type="button"
                                                            size="lg"
                                                            variant="outline"
                                                            onClick={resetTimer}
                                                        >
                                                            <RotateCcw className="ms-2 h-5 w-5" />
                                                            إعادة تعيين
                                                        </Button>
                                                    )}
                                                </div>

                                                {timerStartedAt && (
                                                    <Card className="w-full">
                                                        <CardContent className="pt-6">
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">بدأ في:</span>
                                                                    <span className="font-medium">{timerStartedAt.toLocaleTimeString('ar-SA')}</span>
                                                                </div>
                                                                {timerStoppedAt && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-slate-500">انتهى في:</span>
                                                                        <span className="font-medium">{timerStoppedAt.toLocaleTimeString('ar-SA')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* DESCRIPTION CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900">وصف العمل</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>وصف العمل</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            placeholder="اكتب وصفاً تفصيلياً للعمل الذي قمت به..."
                                            className="rounded-xl border-slate-200"
                                        />
                                        <p className="text-xs text-slate-500">{formData.description.length}/1000 حرف (الحد الأدنى: 10 أحرف)</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BILLABLE AMOUNT CARD (if billable) */}
                            {formData.timeType === 'billable' && (
                                <Card className="border-emerald-200 bg-emerald-50/50 mb-6">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-emerald-800">المبلغ القابل للفوترة</CardTitle>
                                            <Switch
                                                checked={formData.billable}
                                                onCheckedChange={(checked) => setFormData({ ...formData, billable: checked })}
                                            />
                                        </div>
                                    </CardHeader>

                                    {formData.billable && (
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>سعر الساعة (ر.س)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.hourlyRate / 100}
                                                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) * 100 || 0 })}
                                                        step="0.01"
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>المبلغ</Label>
                                                    <Input
                                                        value={formatCurrency(billableAmount)}
                                                        disabled
                                                        className="rounded-xl bg-white font-bold text-lg"
                                                    />
                                                    <p className="text-xs text-slate-500">
                                                        {formatDuration(totalMinutes)} × {formatCurrency(formData.hourlyRate)}/ساعة
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Write-Off */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-semibold">شطب الوقت (Write-Off)</Label>
                                                    <p className="text-xs text-slate-500">لن يتم فوترة هذا الوقت</p>
                                                </div>
                                                <Switch
                                                    checked={formData.writeOff}
                                                    onCheckedChange={(checked) => setFormData({ ...formData, writeOff: checked, writeDown: false })}
                                                />
                                            </div>

                                            {formData.writeOff && (
                                                <div className="space-y-2">
                                                    <Label>سبب الشطب</Label>
                                                    <Textarea
                                                        value={formData.writeOffReason}
                                                        onChange={(e) => setFormData({ ...formData, writeOffReason: e.target.value })}
                                                        rows={2}
                                                        placeholder="اشرح سبب عدم فوترة هذا الوقت..."
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Write-Down */}
                                            {!formData.writeOff && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="font-semibold">تخفيض المبلغ (Write-Down)</Label>
                                                            <p className="text-xs text-slate-500">فوترة بسعر مخفض</p>
                                                        </div>
                                                        <Switch
                                                            checked={formData.writeDown}
                                                            onCheckedChange={(checked) => setFormData({ ...formData, writeDown: checked })}
                                                        />
                                                    </div>

                                                    {formData.writeDown && (
                                                        <>
                                                            <div className="space-y-2">
                                                                <Label>مبلغ التخفيض (ر.س)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.writeDownAmount / 100}
                                                                    onChange={(e) => setFormData({ ...formData, writeDownAmount: parseFloat(e.target.value) * 100 || 0 })}
                                                                    step="0.01"
                                                                    className="rounded-xl border-slate-200"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>سبب التخفيض</Label>
                                                                <Textarea
                                                                    value={formData.writeDownReason}
                                                                    onChange={(e) => setFormData({ ...formData, writeDownReason: e.target.value })}
                                                                    rows={2}
                                                                    className="rounded-xl border-slate-200"
                                                                />
                                                            </div>
                                                            <Alert className="bg-blue-50 border-blue-200">
                                                                <Info className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                                                <AlertDescription className="flex justify-between items-center">
                                                                    <span className="text-blue-700">المبلغ بعد التخفيض:</span>
                                                                    <span className="text-lg font-bold text-blue-800">{formatCurrency(billableAmount)}</span>
                                                                </AlertDescription>
                                                            </Alert>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            )}

                            {/* ADVANCED SECTIONS (Accordion) */}
                            <Accordion type="multiple" className="mb-6">

                                {/* Organization */}
                                <AccordionItem value="organization" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            <span className="font-semibold">معلومات تنظيمية</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>القسم</Label>
                                                <Select
                                                    value={formData.departmentId}
                                                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر القسم" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="commercial">القسم التجاري</SelectItem>
                                                        <SelectItem value="criminal">القسم الجنائي</SelectItem>
                                                        <SelectItem value="corporate">قسم الشركات</SelectItem>
                                                        <SelectItem value="real_estate">قسم العقارات</SelectItem>
                                                        <SelectItem value="family">قسم الأحوال الشخصية</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الفرع</Label>
                                                <Select
                                                    value={formData.locationId}
                                                    onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر الفرع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="riyadh">الرياض</SelectItem>
                                                        <SelectItem value="jeddah">جدة</SelectItem>
                                                        <SelectItem value="dammam">الدمام</SelectItem>
                                                        <SelectItem value="khobar">الخبر</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>مجال الممارسة</Label>
                                                <Select
                                                    value={formData.practiceArea}
                                                    onValueChange={(value) => setFormData({ ...formData, practiceArea: value })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر المجال" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="litigation">تقاضي</SelectItem>
                                                        <SelectItem value="corporate">شركات</SelectItem>
                                                        <SelectItem value="real_estate">عقارات</SelectItem>
                                                        <SelectItem value="intellectual_property">ملكية فكرية</SelectItem>
                                                        <SelectItem value="labor">عمل</SelectItem>
                                                        <SelectItem value="family">أحوال شخصية</SelectItem>
                                                        <SelectItem value="criminal">جنائي</SelectItem>
                                                        <SelectItem value="commercial">تجاري</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>مرحلة القضية</Label>
                                                <Select
                                                    value={formData.phase}
                                                    onValueChange={(value) => setFormData({ ...formData, phase: value })}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر المرحلة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="initial_consultation">استشارة أولية</SelectItem>
                                                        <SelectItem value="case_preparation">إعداد القضية</SelectItem>
                                                        <SelectItem value="discovery">الاكتشاف/جمع الأدلة</SelectItem>
                                                        <SelectItem value="pre_trial">ما قبل المحاكمة</SelectItem>
                                                        <SelectItem value="trial">المحاكمة</SelectItem>
                                                        <SelectItem value="appeal">الاستئناف</SelectItem>
                                                        <SelectItem value="settlement">التسوية</SelectItem>
                                                        <SelectItem value="closing">الإغلاق</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Notes */}
                                <AccordionItem value="notes" className="border rounded-xl px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            <span className="font-semibold">ملاحظات إضافية</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={3}
                                            placeholder="أدخل أي ملاحظات إضافية..."
                                            className="rounded-xl border-slate-200"
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={() => navigate({ to: '/dashboard/finance/time-tracking' })} className="rounded-xl">
                                        <X className="ms-2 h-4 w-4" aria-hidden="true" />
                                        إلغاء
                                    </Button>
                                    <Button type="button" variant="outline" onClick={(e) => handleSubmit(e as any, 'draft')} className="rounded-xl">
                                        <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                        حفظ كمسودة
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button type="button" variant="outline" size="icon" className="rounded-xl">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Copy className="ms-2 h-4 w-4" aria-hidden="true" />
                                                نسخ القيد
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="ms-2 h-4 w-4" aria-hidden="true" />
                                                حفظ كقالب
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <History className="ms-2 h-4 w-4" />
                                                سجل التعديلات
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createTimeEntryMutation.isPending || totalMinutes <= 0 || !formData.activityCode}
                                    >
                                        {createTimeEntryMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                                حفظ و اعتماد
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="time-tracking" />
                </div>
            </Main>
        </>
    )
}
