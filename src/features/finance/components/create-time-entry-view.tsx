import { useState, useMemo } from 'react'
import {
    ArrowRight, Save, Calendar, Clock,
    FileText, Briefcase, DollarSign, Loader2, CheckSquare,
    User, Tag, Timer
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateTimeEntry } from '@/hooks/useFinance'
import { useCases, useClients, useTeamMembers } from '@/hooks/useCasesAndClients'

// Task types matching miru-web / legal work types
const taskTypes = [
    { value: 'consultation', label: 'استشارة قانونية', labelEn: 'Legal Consultation' },
    { value: 'research', label: 'بحث قانوني', labelEn: 'Legal Research' },
    { value: 'document_review', label: 'مراجعة مستندات', labelEn: 'Document Review' },
    { value: 'document_drafting', label: 'صياغة مستندات', labelEn: 'Document Drafting' },
    { value: 'court_appearance', label: 'حضور جلسة', labelEn: 'Court Appearance' },
    { value: 'meeting', label: 'اجتماع', labelEn: 'Meeting' },
    { value: 'phone_call', label: 'مكالمة هاتفية', labelEn: 'Phone Call' },
    { value: 'email_correspondence', label: 'مراسلات بريدية', labelEn: 'Email Correspondence' },
    { value: 'negotiation', label: 'تفاوض', labelEn: 'Negotiation' },
    { value: 'contract_review', label: 'مراجعة عقود', labelEn: 'Contract Review' },
    { value: 'filing', label: 'إيداع مستندات', labelEn: 'Filing' },
    { value: 'travel', label: 'سفر وانتقال', labelEn: 'Travel' },
    { value: 'administrative', label: 'إداري', labelEn: 'Administrative' },
    { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

// Bill status options matching miru-web
const billStatusOptions = [
    { value: 'unbilled', label: 'غير مفوتر', labelEn: 'Unbilled' },
    { value: 'billed', label: 'مفوتر', labelEn: 'Billed' },
    { value: 'non_billable', label: 'غير قابل للفوترة', labelEn: 'Non-billable' },
]

export function CreateTimeEntryView() {
    const navigate = useNavigate()
    const createTimeEntryMutation = useCreateTimeEntry()

    // Load cases, clients and team members from API
    const { data: casesData, isLoading: loadingCases } = useCases()
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: teamData, isLoading: loadingTeam } = useTeamMembers()

    // Duration input mode: 'time' (start/end) or 'manual' (direct input)
    const [durationMode, setDurationMode] = useState<'time' | 'manual'>('time')

    const [formData, setFormData] = useState({
        description: '',
        caseId: '',
        clientId: '',
        assigneeId: '',
        taskType: '',
        billStatus: 'unbilled' as 'unbilled' | 'billed' | 'non_billable',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        manualHours: '',
        manualMinutes: '',
        hourlyRate: '500',
        isBillable: true,
        notes: '',
    })

    // Get selected case details
    const selectedCase = useMemo(() => {
        if (!formData.caseId || !casesData?.data) return null
        return casesData.data.find((c: any) => c._id === formData.caseId)
    }, [formData.caseId, casesData])

    // Get selected client details
    const selectedClient = useMemo(() => {
        if (!formData.clientId || !clientsData?.data) return null
        return clientsData.data.find((c: any) => c._id === formData.clientId)
    }, [formData.clientId, clientsData])

    // Calculate duration in minutes (handles both time mode and manual mode)
    const calculatedDuration = useMemo(() => {
        if (durationMode === 'time') {
            if (!formData.startTime || !formData.endTime) return 0
            const start = new Date(`2000-01-01T${formData.startTime}`)
            const end = new Date(`2000-01-01T${formData.endTime}`)
            const diffMs = end.getTime() - start.getTime()
            if (diffMs < 0) return 0
            return Math.round(diffMs / (1000 * 60)) // Duration in minutes
        } else {
            // Manual mode: convert hours and minutes to total minutes
            const hours = parseInt(formData.manualHours) || 0
            const minutes = parseInt(formData.manualMinutes) || 0
            return (hours * 60) + minutes
        }
    }, [durationMode, formData.startTime, formData.endTime, formData.manualHours, formData.manualMinutes])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.caseId || calculatedDuration <= 0 || !formData.taskType) return

        // Determine clientId: prefer direct selection, fall back to case's client
        const resolvedClientId = formData.clientId || selectedCase?.clientId?._id || selectedCase?.clientId || ''

        const timeEntryData = {
            description: formData.description,
            caseId: formData.caseId,
            clientId: resolvedClientId,
            taskType: formData.taskType,
            billStatus: formData.billStatus,
            date: formData.date,
            duration: calculatedDuration, // Duration in minutes
            hourlyRate: Number(formData.hourlyRate),
            isBillable: formData.isBillable,
            ...(formData.assigneeId && { assigneeId: formData.assigneeId }),
            ...(formData.notes && { notes: formData.notes }),
            // Include time info for reference
            ...(durationMode === 'time' && formData.startTime && { startTime: formData.startTime }),
            ...(durationMode === 'time' && formData.endTime && { endTime: formData.endTime }),
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
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

    // Format duration for display
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours === 0) return `${mins} دقيقة`
        if (mins === 0) return `${hours} ساعة`
        return `${hours} ساعة و ${mins} دقيقة`
    }

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
                    {/* Sidebar Widgets */}
                    <FinanceSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/finance/time-tracking">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">تسجيل وقت جديد</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    قم بتسجيل ساعات العمل على القضايا والمشاريع لفوترتها لاحقاً.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Clock className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <Briefcase className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية / المشروع <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                                                disabled={loadingCases}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingCases ? "جاري التحميل..." : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {casesData?.data?.map((caseItem: any) => (
                                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                                            {caseItem.caseNumber} - {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedCase && (
                                                <p className="text-xs text-slate-500">
                                                    العميل: {selectedCase.clientId?.name || selectedCase.clientId?.fullName || 'غير محدد'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                العميل (مباشر)
                                            </label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل (اختياري)"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">بدون عميل محدد</SelectItem>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedClient && (
                                                <p className="text-xs text-slate-500">
                                                    {selectedClient.email || selectedClient.phone || ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                نوع المهمة <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.taskType}
                                                onValueChange={(value) => setFormData({ ...formData, taskType: value })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر نوع المهمة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taskTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                المسؤول عن المهمة
                                            </label>
                                            <Select
                                                value={formData.assigneeId}
                                                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
                                                disabled={loadingTeam}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingTeam ? "جاري التحميل..." : "اختر عضو الفريق"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">المستخدم الحالي</SelectItem>
                                                    {teamData?.data?.map((member: any) => (
                                                        <SelectItem key={member._id} value={member._id}>
                                                            {member.fullName || member.name || member.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                التاريخ <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                حالة الفوترة <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.billStatus}
                                                onValueChange={(value: 'unbilled' | 'billed' | 'non_billable') => setFormData({ ...formData, billStatus: value, isBillable: value !== 'non_billable' })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر حالة الفوترة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {billStatusOptions.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            وصف العمل <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="مثال: مراجعة مستندات القضية وإعداد المذكرة"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>

                                    {/* Duration Mode Toggle */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Timer className="w-5 h-5 text-emerald-500" />
                                            <span className="text-sm font-medium text-slate-700">طريقة إدخال المدة</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={durationMode === 'time' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setDurationMode('time')}
                                                className={durationMode === 'time' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                            >
                                                <Clock className="w-4 h-4 ml-2" />
                                                وقت البدء والانتهاء
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={durationMode === 'manual' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setDurationMode('manual')}
                                                className={durationMode === 'manual' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                            >
                                                <Timer className="w-4 h-4 ml-2" />
                                                إدخال المدة يدوياً
                                            </Button>
                                        </div>
                                    </div>

                                    {durationMode === 'time' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-emerald-500" />
                                                    وقت البدء <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                    required={durationMode === 'time'}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-emerald-500" />
                                                    وقت الانتهاء <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                    required={durationMode === 'time'}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                                    سعر الساعة (ر.س)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="500"
                                                    min="0"
                                                    value={formData.hourlyRate}
                                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Timer className="w-4 h-4 text-emerald-500" />
                                                    الساعات <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    max="24"
                                                    value={formData.manualHours}
                                                    onChange={(e) => setFormData({ ...formData, manualHours: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                    required={durationMode === 'manual'}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Timer className="w-4 h-4 text-emerald-500" />
                                                    الدقائق
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    max="59"
                                                    value={formData.manualMinutes}
                                                    onChange={(e) => setFormData({ ...formData, manualMinutes: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                                    سعر الساعة (ر.س)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="500"
                                                    min="0"
                                                    value={formData.hourlyRate}
                                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {calculatedDuration > 0 && (
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-emerald-700 font-medium">المدة المحسوبة</p>
                                                    <p className="text-lg font-bold text-emerald-800">{formatDuration(calculatedDuration)}</p>
                                                </div>
                                                {formData.isBillable && Number(formData.hourlyRate) > 0 && (
                                                    <div className="text-left">
                                                        <p className="text-sm text-emerald-700 font-medium">القيمة التقديرية</p>
                                                        <p className="text-lg font-bold text-emerald-800">
                                                            {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 0 }).format(
                                                                (calculatedDuration / 60) * Number(formData.hourlyRate)
                                                            )} ر.س
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}


                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            ملاحظات إضافية
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي تفاصيل إضافية..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/time-tracking">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createTimeEntryMutation.isPending || calculatedDuration <= 0 || !formData.taskType}
                                    >
                                        {createTimeEntryMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ الوقت
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
