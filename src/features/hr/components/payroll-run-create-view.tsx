import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useCreatePayrollRun } from '@/hooks/usePayrollRun'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Search, Bell, ArrowRight, Save, Calendar, Building2, Users, Briefcase,
    ChevronDown, Clock, Settings, FileText, Calculator, DollarSign, AlertTriangle
} from 'lucide-react'
import type { CalendarType, EmployeeType, EmploymentStatus, CreatePayrollRunData } from '@/services/payrollRunService'

const MONTHS = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
]

const EMPLOYEE_TYPES: { value: EmployeeType; label: string }[] = [
    { value: 'full_time', label: 'دوام كامل' },
    { value: 'part_time', label: 'دوام جزئي' },
    { value: 'contract', label: 'عقد' },
    { value: 'temporary', label: 'مؤقت' },
]

const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
    { value: 'active', label: 'نشط' },
    { value: 'on_leave', label: 'في إجازة' },
    { value: 'suspended', label: 'موقف' },
]

// Office type configuration
type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

interface OfficeConfig {
    id: OfficeType
    title: string
    subtitle: string
    icon: typeof Building2
    color: string
    bgColor: string
    borderColor: string
}

const OFFICE_TYPES: OfficeConfig[] = [
    {
        id: 'solo',
        title: 'محامي فردي',
        subtitle: 'أقل من 5 موظفين',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
    },
    {
        id: 'small',
        title: 'مكتب صغير',
        subtitle: '5-15 موظف',
        icon: Briefcase,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500',
    },
    {
        id: 'medium',
        title: 'مكتب متوسط',
        subtitle: '15-50 موظف',
        icon: Building2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
    },
    {
        id: 'firm',
        title: 'شركة محاماة',
        subtitle: 'أكثر من 50 موظف',
        icon: Building2,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500',
    },
]

export function PayrollRunCreateView() {
    const navigate = useNavigate()
    const createRunMutation = useCreatePayrollRun()

    // Current date for defaults
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Office type selection
    const [officeType, setOfficeType] = useState<OfficeType>('small')

    // Basic fields
    const [runName, setRunName] = useState('')
    const [runNameAr, setRunNameAr] = useState('')
    const [month, setMonth] = useState<number>(currentMonth)
    const [year, setYear] = useState<number>(currentYear)
    const [calendarType, setCalendarType] = useState<CalendarType>('gregorian')
    const [paymentDate, setPaymentDate] = useState('')
    const [cutoffDate, setCutoffDate] = useState('')

    // Configuration - Employee Inclusion
    const [includedEmployeeTypes, setIncludedEmployeeTypes] = useState<EmployeeType[]>(['full_time', 'part_time', 'contract'])
    const [includedEmploymentStatuses, setIncludedEmploymentStatuses] = useState<EmploymentStatus[]>(['active'])

    // Configuration - Processing Options
    const [processNewJoiners, setProcessNewJoiners] = useState(true)
    const [processSeparations, setProcessSeparations] = useState(true)
    const [processSuspensions, setProcessSuspensions] = useState(false)
    const [prorateSalaries, setProrateSalaries] = useState(true)
    const [prorateMethod, setProrateMethod] = useState<'calendar_days' | 'working_days'>('calendar_days')

    // Configuration - Variable Pay
    const [includeOvertime, setIncludeOvertime] = useState(true)
    const [overtimeCalculationMethod, setOvertimeCalculationMethod] = useState<'actual' | 'approved'>('approved')
    const [overtimeApprovalRequired, setOvertimeApprovalRequired] = useState(true)
    const [includeBonuses, setIncludeBonuses] = useState(true)
    const [includeCommissions, setIncludeCommissions] = useState(true)
    const [includeIncentives, setIncludeIncentives] = useState(true)

    // Configuration - Deductions
    const [processLoans, setProcessLoans] = useState(true)
    const [processAdvances, setProcessAdvances] = useState(true)
    const [processViolations, setProcessViolations] = useState(true)
    const [attendanceBasedDeductions, setAttendanceBasedDeductions] = useState(true)
    const [lateDeductions, setLateDeductions] = useState(true)
    const [absenceDeductions, setAbsenceDeductions] = useState(true)

    // Configuration - GOSI
    const [calculateGOSI, setCalculateGOSI] = useState(true)
    const [gosiRate, setGosiRate] = useState(9.75)

    // Configuration - Rounding
    const [roundingMethod, setRoundingMethod] = useState<'none' | 'nearest' | 'up' | 'down'>('nearest')
    const [roundingPrecision, setRoundingPrecision] = useState(2)

    // Notes
    const [internalNotes, setInternalNotes] = useState('')
    const [employeeMessage, setEmployeeMessage] = useState('')
    const [employeeMessageAr, setEmployeeMessageAr] = useState('')

    // Collapsible sections state
    const [openSections, setOpenSections] = useState({
        employeeInclusion: false,
        processingOptions: false,
        variablePay: false,
        deductions: false,
        gosiSettings: false,
        roundingSettings: false,
        notes: false,
    })

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    // Calculate period dates based on month/year
    const periodDates = useMemo(() => {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)
        const defaultPaymentDate = new Date(year, month, 1) // 1st of next month

        return {
            periodStart: startDate.toISOString().split('T')[0],
            periodEnd: endDate.toISOString().split('T')[0],
            defaultPaymentDate: defaultPaymentDate.toISOString().split('T')[0],
        }
    }, [month, year])

    // Auto-generate run name
    useMemo(() => {
        const monthName = MONTHS.find(m => m.value === month)?.label || ''
        if (!runNameAr) {
            setRunNameAr(`رواتب ${monthName} ${year}`)
        }
        if (!runName) {
            const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            setRunName(`${englishMonths[month - 1]} ${year} Payroll`)
        }
    }, [month, year])

    // Handle employee type toggle
    const handleEmployeeTypeToggle = (type: EmployeeType) => {
        setIncludedEmployeeTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    // Handle employment status toggle
    const handleEmploymentStatusToggle = (status: EmploymentStatus) => {
        setIncludedEmploymentStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        )
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const data: CreatePayrollRunData = {
            runName,
            runNameAr,
            payPeriod: {
                month,
                year,
                calendarType,
                periodStart: periodDates.periodStart,
                periodEnd: periodDates.periodEnd,
                paymentDate: paymentDate || periodDates.defaultPaymentDate,
                cutoffDate: cutoffDate || undefined,
            },
            configuration: {
                calendarType,
                fiscalYear: year,
                includedEmployeeTypes,
                includedEmploymentStatuses,
                processNewJoiners,
                processSeparations,
                processSuspensions,
                prorateSalaries,
                prorateMethod,
                includeOvertime,
                overtimeCalculationMethod,
                overtimeApprovalRequired,
                includeBonuses,
                includeCommissions,
                includeIncentives,
                processLoans,
                processAdvances,
                processViolations,
                attendanceBasedDeductions,
                lateDeductions,
                absenceDeductions,
                calculateGOSI,
                gosiRate,
                roundingMethod,
                roundingPrecision,
            },
            notes: {
                internalNotes: internalNotes || undefined,
                employeeMessage: employeeMessage || undefined,
                employeeMessageAr: employeeMessageAr || undefined,
            },
        }

        try {
            const result = await createRunMutation.mutateAsync(data)
            navigate({ to: '/dashboard/hr/payroll-runs/$runId', params: { runId: result._id } })
        } catch {
            // Error is handled by mutation's onError callback
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'قسائم الرواتب', href: '/dashboard/hr/payroll', isActive: false },
        { title: 'دورات الرواتب', href: '/dashboard/hr/payroll-runs', isActive: true },
    ]

    // Determine which advanced sections to show based on office type
    const showAdvancedSections = officeType !== 'solo'
    const showFullAdvanced = officeType === 'medium' || officeType === 'firm'

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <form onSubmit={handleSubmit}>
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-xl hover:bg-white"
                                onClick={() => navigate({ to: '/dashboard/hr/payroll-runs' })}
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-navy">إنشاء دورة رواتب جديدة</h1>
                                <p className="text-slate-500">قم بإعداد دورة رواتب لمعالجة رواتب الموظفين</p>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
                            disabled={createRunMutation.isPending}
                        >
                            <Save className="w-4 h-4 ms-2" aria-hidden="true" />
                            {createRunMutation.isPending ? 'جاري الحفظ...' : 'حفظ الدورة'}
                        </Button>
                    </div>

                    {/* Office Type Selection */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                نوع المكتب
                            </CardTitle>
                            <p className="text-sm text-slate-500">اختر نوع المكتب لتخصيص خيارات دورة الرواتب</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {OFFICE_TYPES.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = officeType === type.id
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setOfficeType(type.id)}
                                            className={`p-4 rounded-xl border-2 transition-all text-end ${
                                                isSelected
                                                    ? `${type.borderColor} ${type.bgColor}`
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                                                <Icon className={`w-5 h-5 ${type.color}`} />
                                            </div>
                                            <h3 className={`font-bold ${isSelected ? type.color : 'text-navy'}`}>
                                                {type.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">{type.subtitle}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information - Always Visible */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                بيانات الدورة الأساسية
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Run Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="runNameAr">اسم الدورة (عربي) *</Label>
                                    <Input
                                        id="runNameAr"
                                        value={runNameAr}
                                        onChange={(e) => setRunNameAr(e.target.value)}
                                        placeholder="رواتب يناير 2025"
                                        className="rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="runName">اسم الدورة (إنجليزي)</Label>
                                    <Input
                                        id="runName"
                                        value={runName}
                                        onChange={(e) => setRunName(e.target.value)}
                                        placeholder="January 2025 Payroll"
                                        className="rounded-xl"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Period Selection - Always Visible */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                فترة الرواتب
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>الشهر *</Label>
                                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="اختر الشهر" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m) => (
                                                <SelectItem key={m.value} value={String(m.value)}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>السنة *</Label>
                                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="اختر السنة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                                <SelectItem key={y} value={String(y)}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>نوع التقويم</Label>
                                    <Select value={calendarType} onValueChange={(v) => setCalendarType(v as CalendarType)}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gregorian">ميلادي</SelectItem>
                                            <SelectItem value="hijri">هجري</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ الدفع</Label>
                                    <Input
                                        type="date"
                                        value={paymentDate || periodDates.defaultPaymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Period Info */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">بداية الفترة:</span>
                                        <span className="font-medium text-navy me-2">{periodDates.periodStart}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">نهاية الفترة:</span>
                                        <span className="font-medium text-navy me-2">{periodDates.periodEnd}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">تاريخ الدفع:</span>
                                        <span className="font-medium text-emerald-600 me-2">{paymentDate || periodDates.defaultPaymentDate}</span>
                                    </div>
                                    {cutoffDate && (
                                        <div>
                                            <span className="text-slate-500">تاريخ القطع:</span>
                                            <span className="font-medium text-navy me-2">{cutoffDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* GOSI Settings - Always Visible */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-emerald-600" />
                                إعدادات التأمينات الاجتماعية (GOSI)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">حساب التأمينات تلقائياً</Label>
                                    <p className="text-sm text-slate-500">خصم 9.75% من الموظف السعودي + 12.75% من صاحب العمل</p>
                                </div>
                                <Switch
                                    checked={calculateGOSI}
                                    onCheckedChange={setCalculateGOSI}
                                />
                            </div>
                            {calculateGOSI && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                        <span className="text-sm font-medium text-blue-800">معدلات التأمينات حسب نظام العمل السعودي</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-600">الموظف السعودي:</span>
                                            <span className="font-bold text-blue-800 me-2">9.75%</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">صاحب العمل (سعودي):</span>
                                            <span className="font-bold text-blue-800 me-2">12.75%</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">الموظف غير السعودي:</span>
                                            <span className="font-bold text-blue-800 me-2">0%</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-600">صاحب العمل (غير سعودي):</span>
                                            <span className="font-bold text-blue-800 me-2">2%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Advanced Sections - Collapsible */}
                    {showAdvancedSections && (
                        <>
                            {/* Employee Inclusion Settings */}
                            <Collapsible
                                open={openSections.employeeInclusion}
                                onOpenChange={() => toggleSection('employeeInclusion')}
                                className="mb-4"
                            >
                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                                    إعدادات شمول الموظفين
                                                </CardTitle>
                                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.employeeInclusion ? 'rotate-180' : ''}`} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-6 pt-0">
                                            {/* Employee Types */}
                                            <div className="space-y-3">
                                                <Label className="text-base">أنواع الموظفين المشمولين</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {EMPLOYEE_TYPES.map((type) => (
                                                        <div
                                                            key={type.value}
                                                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                                                includedEmployeeTypes.includes(type.value)
                                                                    ? 'border-emerald-500 bg-emerald-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                            onClick={() => handleEmployeeTypeToggle(type.value)}
                                                        >
                                                            <Checkbox
                                                                checked={includedEmployeeTypes.includes(type.value)}
                                                                className="data-[state=checked]:bg-emerald-500"
                                                            />
                                                            <span className="text-sm">{type.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Employment Statuses */}
                                            <div className="space-y-3">
                                                <Label className="text-base">حالات التوظيف المشمولة</Label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {EMPLOYMENT_STATUSES.map((status) => (
                                                        <div
                                                            key={status.value}
                                                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                                                                includedEmploymentStatuses.includes(status.value)
                                                                    ? 'border-emerald-500 bg-emerald-50'
                                                                    : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                            onClick={() => handleEmploymentStatusToggle(status.value)}
                                                        >
                                                            <Checkbox
                                                                checked={includedEmploymentStatuses.includes(status.value)}
                                                                className="data-[state=checked]:bg-emerald-500"
                                                            />
                                                            <span className="text-sm">{status.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Processing Options */}
                            <Collapsible
                                open={openSections.processingOptions}
                                onOpenChange={() => toggleSection('processingOptions')}
                                className="mb-4"
                            >
                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <Settings className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                    خيارات المعالجة
                                                </CardTitle>
                                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.processingOptions ? 'rotate-180' : ''}`} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة الموظفين الجدد</Label>
                                                        <p className="text-xs text-slate-500">الموظفين الذين انضموا خلال الفترة</p>
                                                    </div>
                                                    <Switch checked={processNewJoiners} onCheckedChange={setProcessNewJoiners} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة المستقيلين</Label>
                                                        <p className="text-xs text-slate-500">الموظفين الذين غادروا خلال الفترة</p>
                                                    </div>
                                                    <Switch checked={processSeparations} onCheckedChange={setProcessSeparations} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة الموقوفين</Label>
                                                        <p className="text-xs text-slate-500">الموظفين الموقوفين عن العمل</p>
                                                    </div>
                                                    <Switch checked={processSuspensions} onCheckedChange={setProcessSuspensions} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>احتساب الرواتب النسبية</Label>
                                                        <p className="text-xs text-slate-500">للشهور الجزئية</p>
                                                    </div>
                                                    <Switch checked={prorateSalaries} onCheckedChange={setProrateSalaries} />
                                                </div>
                                            </div>
                                            {prorateSalaries && (
                                                <div className="space-y-2">
                                                    <Label>طريقة الاحتساب النسبي</Label>
                                                    <Select value={prorateMethod} onValueChange={(v) => setProrateMethod(v as 'calendar_days' | 'working_days')}>
                                                        <SelectTrigger className="rounded-xl max-w-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="calendar_days">أيام التقويم</SelectItem>
                                                            <SelectItem value="working_days">أيام العمل</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Variable Pay */}
                            {showFullAdvanced && (
                                <Collapsible
                                    open={openSections.variablePay}
                                    onOpenChange={() => toggleSection('variablePay')}
                                    className="mb-4"
                                >
                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                        <DollarSign className="w-5 h-5 text-amber-600" />
                                                        المتغيرات والإضافات
                                                    </CardTitle>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.variablePay ? 'rotate-180' : ''}`} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                        <div>
                                                            <Label>شمول الأوفرتايم</Label>
                                                            <p className="text-xs text-slate-500">ساعات العمل الإضافية</p>
                                                        </div>
                                                        <Switch checked={includeOvertime} onCheckedChange={setIncludeOvertime} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                        <div>
                                                            <Label>شمول المكافآت</Label>
                                                            <p className="text-xs text-slate-500">المكافآت الشهرية</p>
                                                        </div>
                                                        <Switch checked={includeBonuses} onCheckedChange={setIncludeBonuses} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                        <div>
                                                            <Label>شمول العمولات</Label>
                                                            <p className="text-xs text-slate-500">عمولات المبيعات</p>
                                                        </div>
                                                        <Switch checked={includeCommissions} onCheckedChange={setIncludeCommissions} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                        <div>
                                                            <Label>شمول الحوافز</Label>
                                                            <p className="text-xs text-slate-500">حوافز الأداء</p>
                                                        </div>
                                                        <Switch checked={includeIncentives} onCheckedChange={setIncludeIncentives} />
                                                    </div>
                                                </div>
                                                {includeOvertime && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                                        <div className="space-y-2">
                                                            <Label>طريقة حساب الأوفرتايم</Label>
                                                            <Select value={overtimeCalculationMethod} onValueChange={(v) => setOvertimeCalculationMethod(v as 'actual' | 'approved')}>
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="actual">الساعات الفعلية</SelectItem>
                                                                    <SelectItem value="approved">الساعات المعتمدة</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                            <Label>يتطلب موافقة</Label>
                                                            <Switch checked={overtimeApprovalRequired} onCheckedChange={setOvertimeApprovalRequired} />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* Deductions */}
                            <Collapsible
                                open={openSections.deductions}
                                onOpenChange={() => toggleSection('deductions')}
                                className="mb-4"
                            >
                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                                    الخصومات
                                                </CardTitle>
                                                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.deductions ? 'rotate-180' : ''}`} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة القروض</Label>
                                                        <p className="text-xs text-slate-500">أقساط القروض الشهرية</p>
                                                    </div>
                                                    <Switch checked={processLoans} onCheckedChange={setProcessLoans} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة السلف</Label>
                                                        <p className="text-xs text-slate-500">استرداد السلف</p>
                                                    </div>
                                                    <Switch checked={processAdvances} onCheckedChange={setProcessAdvances} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>معالجة المخالفات</Label>
                                                        <p className="text-xs text-slate-500">غرامات المخالفات</p>
                                                    </div>
                                                    <Switch checked={processViolations} onCheckedChange={setProcessViolations} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>خصومات الحضور</Label>
                                                        <p className="text-xs text-slate-500">بناءً على سجلات الحضور</p>
                                                    </div>
                                                    <Switch checked={attendanceBasedDeductions} onCheckedChange={setAttendanceBasedDeductions} />
                                                </div>
                                            </div>
                                            {attendanceBasedDeductions && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                                        <div>
                                                            <Label>خصم التأخير</Label>
                                                            <p className="text-xs text-red-600">خصم دقائق التأخير</p>
                                                        </div>
                                                        <Switch checked={lateDeductions} onCheckedChange={setLateDeductions} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                                        <div>
                                                            <Label>خصم الغياب</Label>
                                                            <p className="text-xs text-red-600">خصم أيام الغياب</p>
                                                        </div>
                                                        <Switch checked={absenceDeductions} onCheckedChange={setAbsenceDeductions} />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Rounding Settings */}
                            {showFullAdvanced && (
                                <Collapsible
                                    open={openSections.roundingSettings}
                                    onOpenChange={() => toggleSection('roundingSettings')}
                                    className="mb-4"
                                >
                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                        <Calculator className="w-5 h-5 text-slate-600" />
                                                        إعدادات التقريب
                                                    </CardTitle>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.roundingSettings ? 'rotate-180' : ''}`} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>طريقة التقريب</Label>
                                                        <Select value={roundingMethod} onValueChange={(v) => setRoundingMethod(v as any)}>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">بدون تقريب</SelectItem>
                                                                <SelectItem value="nearest">لأقرب قيمة</SelectItem>
                                                                <SelectItem value="up">للأعلى</SelectItem>
                                                                <SelectItem value="down">للأسفل</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>دقة التقريب (خانات عشرية)</Label>
                                                        <Select value={String(roundingPrecision)} onValueChange={(v) => setRoundingPrecision(Number(v))}>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="0">0 خانات</SelectItem>
                                                                <SelectItem value="1">1 خانة</SelectItem>
                                                                <SelectItem value="2">2 خانات</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}
                        </>
                    )}

                    {/* Notes - Collapsible */}
                    <Collapsible
                        open={openSections.notes}
                        onOpenChange={() => toggleSection('notes')}
                        className="mb-6"
                    >
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                            الملاحظات والرسائل
                                        </CardTitle>
                                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.notes ? 'rotate-180' : ''}`} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-4 pt-0">
                                    <div className="space-y-2">
                                        <Label>ملاحظات داخلية</Label>
                                        <Textarea
                                            value={internalNotes}
                                            onChange={(e) => setInternalNotes(e.target.value)}
                                            placeholder="ملاحظات للفريق الداخلي..."
                                            className="rounded-xl min-h-[80px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>رسالة للموظفين (عربي)</Label>
                                            <Textarea
                                                value={employeeMessageAr}
                                                onChange={(e) => setEmployeeMessageAr(e.target.value)}
                                                placeholder="رسالة تظهر في قسيمة الراتب..."
                                                className="rounded-xl min-h-[80px]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رسالة للموظفين (إنجليزي)</Label>
                                            <Textarea
                                                value={employeeMessage}
                                                onChange={(e) => setEmployeeMessage(e.target.value)}
                                                placeholder="Message shown in payslip..."
                                                className="rounded-xl min-h-[80px]"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl px-6"
                            onClick={() => navigate({ to: '/dashboard/hr/payroll-runs' })}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
                            disabled={createRunMutation.isPending}
                        >
                            <Save className="w-4 h-4 ms-2" aria-hidden="true" />
                            {createRunMutation.isPending ? 'جاري الحفظ...' : 'حفظ وإنشاء الدورة'}
                        </Button>
                    </div>
                </form>
            </Main>
        </>
    )
}
