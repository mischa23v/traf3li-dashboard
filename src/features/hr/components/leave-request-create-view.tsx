import { useState, useMemo, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useCreateLeaveRequest, useLeaveBalance, useCheckConflicts } from '@/hooks/useLeave'
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
import {
    Search, Bell, ArrowRight, Save, Calendar, Building2, Users, Briefcase,
    ChevronDown, FileText, Palmtree, Stethoscope, Heart, Baby, Plane,
    GraduationCap, AlertTriangle, Phone, Mail, User, Clock, CheckCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LeaveType, CreateLeaveRequestData } from '@/services/leaveService'
import { useApiError } from '@/hooks/useApiError'
import { isValidPhone, isValidEmail, errorMessages } from '@/utils/validation-patterns'

// Leave type configuration
interface LeaveTypeConfig {
    value: LeaveType
    label: string
    labelAr: string
    icon: typeof Palmtree
    color: string
    bgColor: string
    borderColor: string
    maxDays?: number
    article?: string
    requiresDoc: boolean
    docType?: string
}

const LEAVE_TYPE_CONFIG: LeaveTypeConfig[] = [
    {
        value: 'annual',
        label: 'Annual Leave',
        labelAr: 'إجازة سنوية',
        icon: Palmtree,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500',
        maxDays: 30,
        article: 'المادة 109',
        requiresDoc: false,
    },
    {
        value: 'sick',
        label: 'Sick Leave',
        labelAr: 'إجازة مرضية',
        icon: Stethoscope,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        maxDays: 120,
        article: 'المادة 117',
        requiresDoc: true,
        docType: 'شهادة طبية',
    },
    {
        value: 'hajj',
        label: 'Hajj Leave',
        labelAr: 'إجازة حج',
        icon: Plane,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        maxDays: 15,
        article: 'المادة 114',
        requiresDoc: true,
        docType: 'تصريح الحج',
    },
    {
        value: 'marriage',
        label: 'Marriage Leave',
        labelAr: 'إجازة زواج',
        icon: Heart,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-500',
        maxDays: 3,
        article: 'المادة 113',
        requiresDoc: true,
        docType: 'عقد الزواج',
    },
    {
        value: 'birth',
        label: 'Birth Leave',
        labelAr: 'إجازة ولادة',
        icon: Baby,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        maxDays: 1,
        article: 'المادة 113',
        requiresDoc: true,
        docType: 'شهادة الميلاد',
    },
    {
        value: 'death',
        label: 'Death Leave',
        labelAr: 'إجازة وفاة',
        icon: Heart,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-500',
        maxDays: 3,
        article: 'المادة 113',
        requiresDoc: true,
        docType: 'شهادة الوفاة',
    },
    {
        value: 'maternity',
        label: 'Maternity Leave',
        labelAr: 'إجازة وضع',
        icon: Baby,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-500',
        maxDays: 70,
        article: 'المادة 151',
        requiresDoc: true,
        docType: 'شهادة طبية',
    },
    {
        value: 'exam',
        label: 'Exam Leave',
        labelAr: 'إجازة امتحان',
        icon: GraduationCap,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-500',
        article: 'المادة 115',
        requiresDoc: true,
        docType: 'جدول الامتحانات',
    },
    {
        value: 'unpaid',
        label: 'Unpaid Leave',
        labelAr: 'إجازة بدون راتب',
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        requiresDoc: false,
    },
]

// Office type configuration (same pattern)
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

// Relationship options for death leave
const RELATIONSHIPS = [
    { value: 'spouse', label: 'الزوج/الزوجة' },
    { value: 'parent', label: 'الوالد/الوالدة' },
    { value: 'child', label: 'الابن/الابنة' },
    { value: 'sibling', label: 'الأخ/الأخت' },
    { value: 'grandparent', label: 'الجد/الجدة' },
    { value: 'other', label: 'آخر' },
]

export function LeaveRequestCreateView() {
    const navigate = useNavigate()
    const createRequestMutation = useCreateLeaveRequest()
    const checkConflictsMutation = useCheckConflicts()

    // API Error handling
    const { handleApiError, ErrorDisplay, clearError } = useApiError()

    // Office type selection
    const [officeType, setOfficeType] = useState<OfficeType>('small')

    // Basic fields
    const [employeeId, setEmployeeId] = useState('')
    const [leaveType, setLeaveType] = useState<LeaveType>('annual')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [halfDay, setHalfDay] = useState(false)
    const [halfDayPeriod, setHalfDayPeriod] = useState<'first_half' | 'second_half'>('first_half')
    const [reason, setReason] = useState('')
    const [reasonAr, setReasonAr] = useState('')

    // Emergency
    const [isEmergency, setIsEmergency] = useState(false)
    const [emergencyReason, setEmergencyReason] = useState('')

    // Contact during leave
    const [availableDuringLeave, setAvailableDuringLeave] = useState(true)
    const [contactNumber, setContactNumber] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [emergencyContactName, setEmergencyContactName] = useState('')
    const [emergencyContactRelation, setEmergencyContactRelation] = useState('')
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

    // Type-specific fields
    // Sick leave
    const [hospitalized, setHospitalized] = useState(false)
    const [hospitalName, setHospitalName] = useState('')

    // Hajj leave
    const [hajjPermitNumber, setHajjPermitNumber] = useState('')

    // Maternity leave
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')

    // Marriage leave
    const [marriageDate, setMarriageDate] = useState('')

    // Death leave
    const [deceasedName, setDeceasedName] = useState('')
    const [relationship, setRelationship] = useState('')
    const [dateOfDeath, setDateOfDeath] = useState('')

    // Exam leave
    const [examType, setExamType] = useState('')
    const [institution, setInstitution] = useState('')
    const [examDate, setExamDate] = useState('')

    // Unpaid leave
    const [unpaidReasonCategory, setUnpaidReasonCategory] = useState('')
    const [detailedReason, setDetailedReason] = useState('')

    // Work handover
    const [delegateToEmployeeId, setDelegateToEmployeeId] = useState('')
    const [handoverTasks, setHandoverTasks] = useState<Array<{
        taskName: string
        taskDescription: string
        priority: 'low' | 'medium' | 'high' | 'urgent'
        dueDate: string
        instructions: string
    }>>([])

    // Notes
    const [employeeNotes, setEmployeeNotes] = useState('')

    // Collapsible sections state
    const [openSections, setOpenSections] = useState({
        typeSpecific: true,
        contact: false,
        handover: false,
        notes: false,
    })

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    // Get leave balance
    const { data: leaveBalance } = useLeaveBalance(employeeId)

    // Calculate total days
    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 0
        if (halfDay) return 0.5
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }, [startDate, endDate, halfDay])

    // Get selected leave type config
    const selectedLeaveType = useMemo(() => {
        return LEAVE_TYPE_CONFIG.find(t => t.value === leaveType)
    }, [leaveType])

    // Check conflicts when dates change
    useEffect(() => {
        if (employeeId && startDate && endDate) {
            checkConflictsMutation.mutate({
                employeeId,
                startDate,
                endDate,
            })
        }
    }, [employeeId, startDate, endDate])

    // Add handover task
    const addHandoverTask = () => {
        setHandoverTasks([...handoverTasks, {
            taskName: '',
            taskDescription: '',
            priority: 'medium',
            dueDate: '',
            instructions: '',
        }])
    }

    // Remove handover task
    const removeHandoverTask = (index: number) => {
        setHandoverTasks(handoverTasks.filter((_, i) => i !== index))
    }

    // Update handover task
    const updateHandoverTask = (index: number, field: string, value: string) => {
        const updated = [...handoverTasks]
        updated[index] = { ...updated[index], [field]: value }
        setHandoverTasks(updated)
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        // Validation
        const errors: Array<{ field: string; message: string }> = []

        // Validate employee selection
        if (!employeeId) {
            errors.push({
                field: 'الموظف',
                message: 'يرجى اختيار الموظف'
            })
        }

        // Validate dates are provided
        if (!startDate) {
            errors.push({
                field: 'تاريخ البداية',
                message: 'يرجى تحديد تاريخ بداية الإجازة'
            })
        }

        if (!endDate) {
            errors.push({
                field: 'تاريخ النهاية',
                message: 'يرجى تحديد تاريخ نهاية الإجازة'
            })
        }

        // Validate start date is before or equal to end date
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            if (start > end) {
                errors.push({
                    field: 'تواريخ الإجازة',
                    message: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية'
                })
            }
        }

        // Validate contact phone if provided
        if (contactNumber && !isValidPhone(contactNumber)) {
            errors.push({
                field: 'رقم الاتصال',
                message: errorMessages.phone.ar
            })
        }

        // Validate contact email if provided
        if (contactEmail && !isValidEmail(contactEmail)) {
            errors.push({
                field: 'البريد الإلكتروني للاتصال',
                message: errorMessages.email.ar
            })
        }

        // Validate emergency contact phone if provided
        if (emergencyContactPhone && !isValidPhone(emergencyContactPhone)) {
            errors.push({
                field: 'هاتف جهة الاتصال للطوارئ',
                message: errorMessages.phone.ar
            })
        }

        // Validate reason is provided
        if (!reason && !reasonAr) {
            errors.push({
                field: 'السبب',
                message: 'يرجى إدخال سبب الإجازة'
            })
        }

        // If there are validation errors, display them
        if (errors.length > 0) {
            handleApiError({
                status: 400,
                message: 'يرجى تصحيح الأخطاء التالية',
                error: true,
                errors
            })
            return
        }

        const data: CreateLeaveRequestData = {
            employeeId,
            leaveType,
            dates: {
                startDate,
                endDate,
                halfDay,
                halfDayPeriod: halfDay ? halfDayPeriod : undefined,
            },
            reason,
            reasonAr: reasonAr || undefined,
            leaveDetails: {
                isEmergency,
                emergencyReason: isEmergency ? emergencyReason : undefined,
                contactDuringLeave: {
                    available: availableDuringLeave,
                    contactNumber: contactNumber || undefined,
                    email: contactEmail || undefined,
                    emergencyContact: emergencyContactName ? {
                        name: emergencyContactName,
                        relationship: emergencyContactRelation,
                        phone: emergencyContactPhone,
                    } : undefined,
                },
                // Type-specific
                sickLeave: leaveType === 'sick' ? {
                    hospitalized,
                    hospitalName: hospitalized ? hospitalName : undefined,
                } : undefined,
                hajjLeave: leaveType === 'hajj' ? {
                    hajjPermitNumber,
                } : undefined,
                maternityLeave: leaveType === 'maternity' ? {
                    expectedDeliveryDate,
                } : undefined,
                marriageLeave: leaveType === 'marriage' ? {
                    marriageDate,
                } : undefined,
                deathLeave: leaveType === 'death' ? {
                    relationship,
                    deceasedName,
                    dateOfDeath,
                } : undefined,
                examLeave: leaveType === 'exam' ? {
                    examType,
                    institution,
                    examDate,
                } : undefined,
                unpaidLeave: leaveType === 'unpaid' ? {
                    reasonCategory: unpaidReasonCategory,
                    detailedReason,
                } : undefined,
            },
            workHandover: delegateToEmployeeId || handoverTasks.length > 0 ? {
                delegateToEmployeeId: delegateToEmployeeId || undefined,
                tasks: handoverTasks.length > 0 ? handoverTasks : undefined,
            } : undefined,
            notes: employeeNotes ? {
                employeeNotes,
            } : undefined,
        }

        try {
            const result = await createRequestMutation.mutateAsync(data)
            navigate({ to: '/dashboard/hr/leave/$requestId', params: { requestId: result._id } })
        } catch (error) {
            handleApiError(error)
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leave', isActive: true },
    ]

    // Determine which advanced sections to show based on office type
    const showAdvancedSections = officeType !== 'solo'

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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <form onSubmit={handleSubmit}>
                    {/* Error Display */}
                    <ErrorDisplay />

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-xl hover:bg-white"
                                onClick={() => navigate({ to: '/dashboard/hr/leave' })}
                            >
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-navy">طلب إجازة جديد</h1>
                                <p className="text-slate-500">قدم طلب إجازة وفقاً لنظام العمل السعودي</p>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
                            disabled={createRequestMutation.isPending}
                        >
                            <Save className="w-4 h-4 ms-2" aria-hidden="true" />
                            {createRequestMutation.isPending ? 'جاري الحفظ...' : 'تقديم الطلب'}
                        </Button>
                    </div>

                    {/* Office Type Selection */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                نوع المكتب
                            </CardTitle>
                            <p className="text-sm text-slate-500">اختر نوع المكتب لتخصيص خيارات الإجازة</p>
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
                                            className={`p-4 rounded-xl border-2 transition-all text-right ${
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

                    {/* Leave Type Selection */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Palmtree className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                نوع الإجازة
                            </CardTitle>
                            <p className="text-sm text-slate-500">اختر نوع الإجازة حسب نظام العمل السعودي</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {LEAVE_TYPE_CONFIG.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = leaveType === type.value
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setLeaveType(type.value)}
                                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                                                isSelected
                                                    ? `${type.borderColor} ${type.bgColor}`
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${type.bgColor} flex items-center justify-center mx-auto mb-2`}>
                                                <Icon className={`w-5 h-5 ${type.color}`} />
                                            </div>
                                            <h3 className={`font-bold text-sm ${isSelected ? type.color : 'text-navy'}`}>
                                                {type.labelAr}
                                            </h3>
                                            {type.maxDays && (
                                                <p className="text-xs text-slate-500 mt-1">{type.maxDays} يوم</p>
                                            )}
                                            {type.article && (
                                                <p className="text-xs text-slate-600">{type.article}</p>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Dates - Always Visible */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                تواريخ الإجازة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>تاريخ البدء *</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ الانتهاء *</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="rounded-xl"
                                        required
                                        min={startDate}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>نصف يوم</Label>
                                    <div className="flex items-center gap-3 h-10">
                                        <Switch checked={halfDay} onCheckedChange={setHalfDay} />
                                        {halfDay && (
                                            <Select value={halfDayPeriod} onValueChange={(v) => setHalfDayPeriod(v as 'first_half' | 'second_half')}>
                                                <SelectTrigger className="w-32 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="first_half">النصف الأول</SelectItem>
                                                    <SelectItem value="second_half">النصف الثاني</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>عدد الأيام</Label>
                                    <div className="h-10 flex items-center">
                                        <span className="text-2xl font-bold text-emerald-600">{totalDays}</span>
                                        <span className="text-slate-500 me-2">يوم</span>
                                    </div>
                                </div>
                            </div>

                            {/* Conflicts Warning */}
                            {checkConflictsMutation.data?.hasConflicts && (
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                        <span className="font-medium text-amber-800">تحذير: يوجد تعارض</span>
                                    </div>
                                    {checkConflictsMutation.data.conflicts.map((conflict, idx) => (
                                        <p key={idx} className="text-sm text-amber-700">{conflict.conflictDetails}</p>
                                    ))}
                                </div>
                            )}

                            {/* Leave Balance Info */}
                            {leaveBalance && leaveType === 'annual' && (
                                <div className="bg-emerald-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            <span className="text-sm text-emerald-700">رصيد الإجازة السنوية</span>
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-emerald-800 text-lg">{leaveBalance.annualLeave.remaining}</span>
                                            <span className="text-emerald-600 me-1">يوم متبقي</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reason - Always Visible */}
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mb-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                سبب الإجازة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>السبب (عربي) *</Label>
                                <Textarea
                                    value={reasonAr}
                                    onChange={(e) => setReasonAr(e.target.value)}
                                    placeholder="اكتب سبب طلب الإجازة..."
                                    className="rounded-xl min-h-[100px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>السبب (إنجليزي)</Label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Leave reason in English..."
                                    className="rounded-xl min-h-[80px]"
                                    dir="ltr"
                                />
                            </div>

                            {/* Emergency Toggle */}
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                    <div>
                                        <Label className="text-red-700">إجازة طارئة</Label>
                                        <p className="text-xs text-red-600">في حالة الطوارئ فقط</p>
                                    </div>
                                </div>
                                <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
                            </div>
                            {isEmergency && (
                                <div className="space-y-2">
                                    <Label>سبب الطوارئ *</Label>
                                    <Textarea
                                        value={emergencyReason}
                                        onChange={(e) => setEmergencyReason(e.target.value)}
                                        placeholder="وضح سبب الطوارئ..."
                                        className="rounded-xl border-red-200"
                                        required
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Type-Specific Fields */}
                    {selectedLeaveType && (
                        <Collapsible
                            open={openSections.typeSpecific}
                            onOpenChange={() => toggleSection('typeSpecific')}
                            className="mb-4"
                        >
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                {(() => {
                                                    const Icon = selectedLeaveType.icon
                                                    return <Icon className={`w-5 h-5 ${selectedLeaveType.color}`} />
                                                })()}
                                                تفاصيل {selectedLeaveType.labelAr}
                                                {selectedLeaveType.requiresDoc && (
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 me-2">
                                                        يتطلب مستند
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.typeSpecific ? 'rotate-180' : ''}`} />
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="space-y-4 pt-0">
                                        {/* Sick Leave Fields */}
                                        {leaveType === 'sick' && (
                                            <>
                                                <div className="bg-red-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-red-700">
                                                        <strong>حسب المادة 117:</strong> يستحق العامل إجازة مرضية بأجر كامل لأول 30 يوماً،
                                                        ثم 75% للـ 60 يوماً التالية، ثم بدون أجر لآخر 30 يوماً.
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>دخول المستشفى</Label>
                                                        <p className="text-xs text-slate-500">هل تحتاج للإقامة في المستشفى؟</p>
                                                    </div>
                                                    <Switch checked={hospitalized} onCheckedChange={setHospitalized} />
                                                </div>
                                                {hospitalized && (
                                                    <div className="space-y-2">
                                                        <Label>اسم المستشفى</Label>
                                                        <Input
                                                            value={hospitalName}
                                                            onChange={(e) => setHospitalName(e.target.value)}
                                                            placeholder="اسم المستشفى..."
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Hajj Leave Fields */}
                                        {leaveType === 'hajj' && (
                                            <>
                                                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-purple-700">
                                                        <strong>حسب المادة 114:</strong> يستحق العامل إجازة حج لمدة 10-15 يوماً بأجر كامل
                                                        لمرة واحدة طوال فترة خدمته، بشرط إكمال سنتين من الخدمة.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>رقم تصريح الحج</Label>
                                                    <Input
                                                        value={hajjPermitNumber}
                                                        onChange={(e) => setHajjPermitNumber(e.target.value)}
                                                        placeholder="رقم التصريح..."
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Maternity Leave Fields */}
                                        {leaveType === 'maternity' && (
                                            <>
                                                <div className="bg-rose-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-rose-700">
                                                        <strong>حسب المادة 151:</strong> تستحق المرأة العاملة إجازة وضع لمدة 10 أسابيع،
                                                        يمكن أن تبدأ قبل الولادة بـ 4 أسابيع.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تاريخ الولادة المتوقع *</Label>
                                                    <Input
                                                        type="date"
                                                        value={expectedDeliveryDate}
                                                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                                        className="rounded-xl"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Marriage Leave Fields */}
                                        {leaveType === 'marriage' && (
                                            <>
                                                <div className="bg-pink-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-pink-700">
                                                        <strong>حسب المادة 113:</strong> يستحق العامل إجازة 3 أيام بأجر كامل عند الزواج.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تاريخ الزواج *</Label>
                                                    <Input
                                                        type="date"
                                                        value={marriageDate}
                                                        onChange={(e) => setMarriageDate(e.target.value)}
                                                        className="rounded-xl"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Death Leave Fields */}
                                        {leaveType === 'death' && (
                                            <>
                                                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-slate-700">
                                                        <strong>حسب المادة 113:</strong> يستحق العامل إجازة 3 أيام بأجر كامل عند وفاة أحد أقاربه.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>اسم المتوفى *</Label>
                                                        <Input
                                                            value={deceasedName}
                                                            onChange={(e) => setDeceasedName(e.target.value)}
                                                            placeholder="اسم المتوفى..."
                                                            className="rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>صلة القرابة *</Label>
                                                        <Select value={relationship} onValueChange={setRelationship}>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue placeholder="اختر صلة القرابة" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {RELATIONSHIPS.map((rel) => (
                                                                    <SelectItem key={rel.value} value={rel.value}>
                                                                        {rel.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تاريخ الوفاة *</Label>
                                                    <Input
                                                        type="date"
                                                        value={dateOfDeath}
                                                        onChange={(e) => setDateOfDeath(e.target.value)}
                                                        className="rounded-xl"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Exam Leave Fields */}
                                        {leaveType === 'exam' && (
                                            <>
                                                <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-indigo-700">
                                                        <strong>حسب المادة 115:</strong> يحق للعامل الحصول على إجازة بأجر كامل لأداء الامتحانات.
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>نوع الامتحان *</Label>
                                                        <Input
                                                            value={examType}
                                                            onChange={(e) => setExamType(e.target.value)}
                                                            placeholder="مثال: امتحان جامعي، شهادة مهنية..."
                                                            className="rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>المؤسسة التعليمية *</Label>
                                                        <Input
                                                            value={institution}
                                                            onChange={(e) => setInstitution(e.target.value)}
                                                            placeholder="اسم الجامعة أو المعهد..."
                                                            className="rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تاريخ الامتحان *</Label>
                                                    <Input
                                                        type="date"
                                                        value={examDate}
                                                        onChange={(e) => setExamDate(e.target.value)}
                                                        className="rounded-xl"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Unpaid Leave Fields */}
                                        {leaveType === 'unpaid' && (
                                            <>
                                                <div className="bg-orange-50 rounded-xl p-4 mb-4">
                                                    <p className="text-sm text-orange-700">
                                                        <strong>تنبيه:</strong> الإجازة بدون راتب تؤثر على الراتب والتأمينات وحساب مكافأة نهاية الخدمة.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تصنيف السبب *</Label>
                                                    <Select value={unpaidReasonCategory} onValueChange={setUnpaidReasonCategory}>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="اختر التصنيف" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="personal">شخصي</SelectItem>
                                                            <SelectItem value="family">عائلي</SelectItem>
                                                            <SelectItem value="health">صحي</SelectItem>
                                                            <SelectItem value="education">تعليمي</SelectItem>
                                                            <SelectItem value="other">آخر</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>السبب التفصيلي *</Label>
                                                    <Textarea
                                                        value={detailedReason}
                                                        onChange={(e) => setDetailedReason(e.target.value)}
                                                        placeholder="اشرح سبب طلب الإجازة بدون راتب بالتفصيل..."
                                                        className="rounded-xl min-h-[100px]"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Required Document Notice */}
                                        {selectedLeaveType.requiresDoc && (
                                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                                    <span className="font-medium text-amber-800">
                                                        مستند مطلوب: {selectedLeaveType.docType}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    يرجى رفع المستند بعد تقديم الطلب
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    )}

                    {/* Contact During Leave - Collapsible */}
                    {showAdvancedSections && (
                        <Collapsible
                            open={openSections.contact}
                            onOpenChange={() => toggleSection('contact')}
                            className="mb-4"
                        >
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                <CollapsibleTrigger asChild>
                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                <Phone className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                التواصل أثناء الإجازة
                                            </CardTitle>
                                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>متاح للتواصل</Label>
                                                <p className="text-xs text-slate-500">هل يمكن التواصل معك أثناء الإجازة؟</p>
                                            </div>
                                            <Switch checked={availableDuringLeave} onCheckedChange={setAvailableDuringLeave} />
                                        </div>
                                        {availableDuringLeave && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>رقم الهاتف</Label>
                                                    <Input
                                                        type="tel"
                                                        value={contactNumber}
                                                        onChange={(e) => setContactNumber(e.target.value)}
                                                        placeholder="05XXXXXXXX"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>البريد الإلكتروني</Label>
                                                    <Input
                                                        type="email"
                                                        value={contactEmail}
                                                        onChange={(e) => setContactEmail(e.target.value)}
                                                        placeholder="email@example.com"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Emergency Contact */}
                                        <div className="border-t pt-4">
                                            <Label className="text-base mb-3 block">جهة اتصال للطوارئ</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm">الاسم</Label>
                                                    <Input
                                                        value={emergencyContactName}
                                                        onChange={(e) => setEmergencyContactName(e.target.value)}
                                                        placeholder="اسم جهة الاتصال..."
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm">صلة القرابة</Label>
                                                    <Input
                                                        value={emergencyContactRelation}
                                                        onChange={(e) => setEmergencyContactRelation(e.target.value)}
                                                        placeholder="مثال: أخ، صديق..."
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm">رقم الهاتف</Label>
                                                    <Input
                                                        type="tel"
                                                        value={emergencyContactPhone}
                                                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                                                        placeholder="05XXXXXXXX"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
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
                                            ملاحظات إضافية
                                        </CardTitle>
                                        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openSections.notes ? 'rotate-180' : ''}`} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        <Label>ملاحظات الموظف</Label>
                                        <Textarea
                                            value={employeeNotes}
                                            onChange={(e) => setEmployeeNotes(e.target.value)}
                                            placeholder="أي ملاحظات إضافية تريد إضافتها..."
                                            className="rounded-xl min-h-[100px]"
                                        />
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
                            onClick={() => navigate({ to: '/dashboard/hr/leave' })}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
                            disabled={createRequestMutation.isPending}
                        >
                            <Save className="w-4 h-4 ms-2" aria-hidden="true" />
                            {createRequestMutation.isPending ? 'جاري الحفظ...' : 'تقديم طلب الإجازة'}
                        </Button>
                    </div>
                </form>
            </Main>
        </>
    )
}
