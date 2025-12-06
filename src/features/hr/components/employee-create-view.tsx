import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useCreateEmployee, useUpdateEmployee, useEmployee } from '@/hooks/useHR'
import { cn } from '@/lib/utils'
import {
    Search, Bell, User, Phone, Mail, MapPin, Building2, Calendar, Briefcase,
    CreditCard, Wallet, Loader2, CheckCircle, DollarSign, Clock, FileText,
    Building, Users, ChevronDown, Plus, Trash2, AlertCircle, Shield
} from 'lucide-react'
import type { CreateEmployeeData, NationalIdType, Gender, EmploymentType, ContractType, PaymentFrequency, PaymentMethod } from '@/services/hrService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

interface Allowance {
    id: string
    name: string
    nameAr: string
    amount: number
}

const COMMON_ALLOWANCES = [
    { name: 'Housing Allowance', nameAr: 'بدل سكن' },
    { name: 'Transportation Allowance', nameAr: 'بدل نقل' },
    { name: 'Food Allowance', nameAr: 'بدل طعام' },
    { name: 'Phone Allowance', nameAr: 'بدل هاتف' },
    { name: 'Medical Allowance', nameAr: 'بدل طبي' },
    { name: 'Education Allowance', nameAr: 'بدل تعليم' },
    { name: 'Fuel Allowance', nameAr: 'بدل وقود' },
    { name: 'Remote Work Allowance', nameAr: 'بدل عمل عن بعد' },
]

const OFFICE_TYPES = [
    { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
    { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
    { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building },
    { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function EmployeeCreateView() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { editId?: string }
    const editId = searchParams?.editId
    const isEditMode = !!editId

    const { data: existingEmployee, isLoading: isLoadingEmployee } = useEmployee(editId || '')
    const createMutation = useCreateEmployee()
    const updateMutation = useUpdateEmployee()

    // Office Type
    const [officeType, setOfficeType] = useState<OfficeType>('solo')

    // Collapsible sections state
    const [openSections, setOpenSections] = useState<string[]>([])

    // Form State - Personal Info (Basic)
    const [fullNameArabic, setFullNameArabic] = useState('')
    const [fullNameEnglish, setFullNameEnglish] = useState('')
    const [nationalId, setNationalId] = useState('')
    const [nationalIdType, setNationalIdType] = useState<NationalIdType>('saudi_id')
    const [nationality, setNationality] = useState('Saudi Arabia')
    const [gender, setGender] = useState<Gender>('male')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')

    // Form State - Employment (Basic)
    const [jobTitleArabic, setJobTitleArabic] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
    const [hireDate, setHireDate] = useState('')

    // Form State - Salary (Basic)
    const [basicSalary, setBasicSalary] = useState<number>(0)
    const [allowances, setAllowances] = useState<Allowance[]>([])

    // Advanced - Personal Info Extended
    const [nationalIdExpiry, setNationalIdExpiry] = useState('')
    const [personalEmail, setPersonalEmail] = useState('')
    const [city, setCity] = useState('')
    const [region, setRegion] = useState('')
    const [maritalStatus, setMaritalStatus] = useState<string>('')
    const [numberOfDependents, setNumberOfDependents] = useState<number>(0)

    // Advanced - Emergency Contact
    const [emergencyName, setEmergencyName] = useState('')
    const [emergencyRelationship, setEmergencyRelationship] = useState('')
    const [emergencyPhone, setEmergencyPhone] = useState('')

    // Advanced - Contract Details
    const [employeeNumber, setEmployeeNumber] = useState('')
    const [contractType, setContractType] = useState<ContractType>('indefinite')
    const [contractStartDate, setContractStartDate] = useState('')
    const [contractEndDate, setContractEndDate] = useState('')
    const [probationPeriod, setProbationPeriod] = useState<number>(90)

    // Advanced - Work Schedule
    const [weeklyHours, setWeeklyHours] = useState<number>(48)
    const [dailyHours, setDailyHours] = useState<number>(8)
    const [restDay, setRestDay] = useState('Friday')

    // Advanced - Payment Details
    const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
    const [bankName, setBankName] = useState('')
    const [iban, setIban] = useState('')

    // Advanced - GOSI
    const [gosiRegistered, setGosiRegistered] = useState(false)
    const [gosiNumber, setGosiNumber] = useState('')

    // Advanced - Organization (medium/firm only)
    const [departmentName, setDepartmentName] = useState('')
    const [branchId, setBranchId] = useState('')
    const [teamId, setTeamId] = useState('')
    const [supervisorId, setSupervisorId] = useState('')
    const [costCenter, setCostCenter] = useState('')

    // Advanced - Leave Balance
    const [annualLeaveEntitlement, setAnnualLeaveEntitlement] = useState<number>(21)

    // Populate form when editing
    useEffect(() => {
        if (existingEmployee && isEditMode) {
            setFullNameArabic(existingEmployee.personalInfo?.fullNameArabic || '')
            setFullNameEnglish(existingEmployee.personalInfo?.fullNameEnglish || '')
            setNationalId(existingEmployee.personalInfo?.nationalId || '')
            setNationalIdType(existingEmployee.personalInfo?.nationalIdType || 'saudi_id')
            setNationalIdExpiry(existingEmployee.personalInfo?.nationalIdExpiry || '')
            setNationality(existingEmployee.personalInfo?.nationality || 'Saudi Arabia')
            setGender(existingEmployee.personalInfo?.gender || 'male')
            setDateOfBirth(existingEmployee.personalInfo?.dateOfBirth?.split('T')[0] || '')
            setMobile(existingEmployee.personalInfo?.mobile || '')
            setEmail(existingEmployee.personalInfo?.email || '')
            setPersonalEmail(existingEmployee.personalInfo?.personalEmail || '')
            setCity(existingEmployee.personalInfo?.currentAddress?.city || '')
            setRegion(existingEmployee.personalInfo?.currentAddress?.region || '')
            setMaritalStatus(existingEmployee.personalInfo?.maritalStatus || '')
            setNumberOfDependents(existingEmployee.personalInfo?.numberOfDependents || 0)
            setEmergencyName(existingEmployee.personalInfo?.emergencyContact?.name || '')
            setEmergencyRelationship(existingEmployee.personalInfo?.emergencyContact?.relationship || '')
            setEmergencyPhone(existingEmployee.personalInfo?.emergencyContact?.phone || '')
            setEmployeeNumber(existingEmployee.employeeNumber || '')
            setJobTitle(existingEmployee.employment?.jobTitle || '')
            setJobTitleArabic(existingEmployee.employment?.jobTitleArabic || '')
            setEmploymentType(existingEmployee.employment?.employmentType || 'full_time')
            setContractType(existingEmployee.employment?.contractType || 'indefinite')
            setContractStartDate(existingEmployee.employment?.contractStartDate?.split('T')[0] || '')
            setContractEndDate(existingEmployee.employment?.contractEndDate?.split('T')[0] || '')
            setHireDate(existingEmployee.employment?.hireDate?.split('T')[0] || '')
            setProbationPeriod(existingEmployee.employment?.probationPeriod || 90)
            setWeeklyHours(existingEmployee.employment?.workSchedule?.weeklyHours || 48)
            setDailyHours(existingEmployee.employment?.workSchedule?.dailyHours || 8)
            setRestDay(existingEmployee.employment?.workSchedule?.restDay || 'Friday')
            setBasicSalary(existingEmployee.compensation?.basicSalary || 0)
            setPaymentFrequency(existingEmployee.compensation?.paymentFrequency || 'monthly')
            setPaymentMethod(existingEmployee.compensation?.paymentMethod || 'bank_transfer')
            setBankName(existingEmployee.compensation?.bankDetails?.bankName || '')
            setIban(existingEmployee.compensation?.bankDetails?.iban || '')
            setGosiRegistered(existingEmployee.gosi?.registered || false)
            setGosiNumber(existingEmployee.gosi?.gosiNumber || '')
            setDepartmentName(existingEmployee.employment?.departmentName || '')
        }
    }, [existingEmployee, isEditMode])

    const isSaudi = useMemo(() => {
        return nationalIdType === 'saudi_id' || nationality === 'Saudi Arabia'
    }, [nationalIdType, nationality])

    const totalAllowances = useMemo(() => {
        return allowances.reduce((sum, a) => sum + a.amount, 0)
    }, [allowances])

    const grossSalary = useMemo(() => {
        return basicSalary + totalAllowances
    }, [basicSalary, totalAllowances])

    // Allowance handlers
    const addAllowance = () => {
        setAllowances([...allowances, { id: Date.now().toString(), name: '', nameAr: '', amount: 0 }])
    }

    const removeAllowance = (id: string) => {
        setAllowances(allowances.filter(a => a.id !== id))
    }

    const updateAllowance = (id: string, field: keyof Allowance, value: string | number) => {
        setAllowances(allowances.map(a => {
            if (a.id === id) {
                if (field === 'name') {
                    const preset = COMMON_ALLOWANCES.find(c => c.name === value)
                    if (preset) {
                        return { ...a, name: preset.name, nameAr: preset.nameAr }
                    }
                }
                return { ...a, [field]: value }
            }
            return a
        }))
    }

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        )
    }

    // Field visibility based on office type
    const shouldHideField = (fieldName: string) => {
        if (officeType === 'solo') {
            const hiddenForSolo = ['branch', 'team', 'supervisor', 'costCenter', 'department']
            return hiddenForSolo.includes(fieldName)
        }
        return false
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const employeeData: CreateEmployeeData = {
            employeeNumber: employeeNumber || undefined,
            personalInfo: {
                fullNameArabic,
                fullNameEnglish: fullNameEnglish || undefined,
                nationalId,
                nationalIdType,
                nationalIdExpiry: nationalIdExpiry || undefined,
                nationality,
                isSaudi,
                gender,
                dateOfBirth,
                mobile,
                email,
                personalEmail: personalEmail || undefined,
                currentAddress: {
                    city,
                    region,
                    country: 'Saudi Arabia',
                },
                emergencyContact: {
                    name: emergencyName,
                    relationship: emergencyRelationship,
                    phone: emergencyPhone,
                },
                maritalStatus: maritalStatus as any || undefined,
                numberOfDependents: numberOfDependents || undefined,
            },
            employment: {
                employmentStatus: 'active',
                jobTitle,
                jobTitleArabic: jobTitleArabic || undefined,
                employmentType,
                contractType,
                contractStartDate: contractStartDate || hireDate,
                contractEndDate: contractEndDate || undefined,
                hireDate,
                probationPeriod,
                onProbation: true,
                workSchedule: {
                    weeklyHours,
                    dailyHours,
                    workDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                    restDay,
                },
                reportsTo: supervisorId || undefined,
                departmentName: departmentName || undefined,
            },
            compensation: {
                basicSalary,
                currency: 'SAR',
                allowances: {
                    housingAllowance: allowances.find(a => a.name === 'Housing Allowance')?.amount || 0,
                    transportationAllowance: allowances.find(a => a.name === 'Transportation Allowance')?.amount || 0,
                    foodAllowance: allowances.find(a => a.name === 'Food Allowance')?.amount || 0,
                    otherAllowances: allowances.filter(a => !['Housing Allowance', 'Transportation Allowance', 'Food Allowance'].includes(a.name)).map(a => ({
                        allowanceName: a.name,
                        allowanceNameAr: a.nameAr,
                        amount: a.amount,
                        taxable: true,
                        includedInEOSB: true,
                        includedInGOSI: false,
                    })),
                    totalAllowances,
                },
                grossSalary,
                paymentFrequency,
                paymentMethod,
                bankDetails: {
                    bankName,
                    iban,
                },
                wps: {
                    registered: false,
                },
            },
            gosi: {
                registered: gosiRegistered,
                gosiNumber: gosiNumber || undefined,
                employeeContribution: isSaudi ? 9.75 : 0,
                employerContribution: isSaudi ? 12.75 : 2,
            },
        }

        if (isEditMode && editId) {
            updateMutation.mutate(
                { id: editId, data: employeeData },
                {
                    onSuccess: () => {
                        navigate({ to: '/dashboard/hr/employees/$employeeId', params: { employeeId: editId } })
                    }
                }
            )
        } else {
            createMutation.mutate(employeeData, {
                onSuccess: (data) => {
                    navigate({ to: '/dashboard/hr/employees/$employeeId', params: { employeeId: data._id } })
                }
            })
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
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
                <ProductivityHero
                    badge="الموارد البشرية"
                    title={isEditMode ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                    type="employees"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* OFFICE TYPE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        نوع المكتب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {OFFICE_TYPES.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setOfficeType(option.value as OfficeType)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-center",
                                                    officeType === option.value
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                )}
                                            >
                                                <option.icon className="w-6 h-6 mx-auto mb-2" />
                                                <span className="text-sm font-medium block">{option.labelAr}</span>
                                                <span className="text-xs opacity-75">{option.descriptionAr}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ===================== BASIC SECTIONS (Always Visible) ===================== */}

                            {/* PERSONAL INFO - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        البيانات الشخصية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">
                                                الاسم الكامل بالعربية <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={fullNameArabic}
                                                onChange={(e) => setFullNameArabic(e.target.value)}
                                                placeholder="محمد أحمد العمري"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الاسم بالإنجليزية</Label>
                                            <Input
                                                value={fullNameEnglish}
                                                onChange={(e) => setFullNameEnglish(e.target.value)}
                                                placeholder="Mohammed Ahmed Al-Omari"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">نوع الهوية <span className="text-red-500">*</span></Label>
                                            <Select value={nationalIdType} onValueChange={(v) => setNationalIdType(v as NationalIdType)}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="saudi_id">هوية وطنية</SelectItem>
                                                    <SelectItem value="iqama">إقامة</SelectItem>
                                                    <SelectItem value="gcc_id">هوية خليجية</SelectItem>
                                                    <SelectItem value="passport">جواز سفر</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">رقم الهوية <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={nationalId}
                                                onChange={(e) => setNationalId(e.target.value)}
                                                placeholder="1234567890"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">الجنس <span className="text-red-500">*</span></Label>
                                            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">ذكر</SelectItem>
                                                    <SelectItem value="female">أنثى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                رقم الجوال <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="+966 5XXXXXXXX"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                البريد الإلكتروني <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="employee@company.com"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EMPLOYMENT - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-500" />
                                        بيانات التوظيف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">المسمى الوظيفي (عربي) <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={jobTitleArabic}
                                                onChange={(e) => setJobTitleArabic(e.target.value)}
                                                placeholder="محامي"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">المسمى الوظيفي (إنجليزي)</Label>
                                            <Input
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="Attorney"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium">نوع التوظيف <span className="text-red-500">*</span></Label>
                                            <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full_time">دوام كامل</SelectItem>
                                                    <SelectItem value="part_time">دوام جزئي</SelectItem>
                                                    <SelectItem value="contract">عقد</SelectItem>
                                                    <SelectItem value="temporary">مؤقت</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-navy font-medium flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                تاريخ التعيين <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="date"
                                                value={hireDate}
                                                onChange={(e) => setHireDate(e.target.value)}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SALARY & ALLOWANCES - Basic */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-amber-500" />
                                        الراتب والبدلات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-medium flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            الراتب الأساسي (ر.س) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={basicSalary}
                                            onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                                            min={0}
                                            step={100}
                                            required
                                            className="h-11 rounded-xl max-w-xs"
                                        />
                                    </div>

                                    {/* Dynamic Allowances */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-navy">البدلات</h4>
                                            <Button type="button" variant="outline" size="sm" onClick={addAllowance} className="rounded-xl">
                                                <Plus className="w-4 h-4 ml-1" />
                                                إضافة بدل
                                            </Button>
                                        </div>

                                        {allowances.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>لا توجد بدلات</p>
                                                <p className="text-sm">اضغط على "إضافة بدل" لإضافة بدلات للموظف</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {allowances.map((allowance) => (
                                                    <div key={allowance.id} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                                                        <div className="flex-1">
                                                            <Select
                                                                value={allowance.name}
                                                                onValueChange={(v) => updateAllowance(allowance.id, 'name', v)}
                                                            >
                                                                <SelectTrigger className="h-10 rounded-lg">
                                                                    <SelectValue placeholder="اختر البدل" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {COMMON_ALLOWANCES.map((a) => (
                                                                        <SelectItem key={a.name} value={a.name}>
                                                                            {a.nameAr}
                                                                        </SelectItem>
                                                                    ))}
                                                                    <SelectItem value="custom">مخصص...</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {allowance.name === 'custom' && (
                                                            <div className="flex-1">
                                                                <Input
                                                                    value={allowance.nameAr}
                                                                    onChange={(e) => updateAllowance(allowance.id, 'nameAr', e.target.value)}
                                                                    placeholder="اسم البدل"
                                                                    className="h-10 rounded-lg"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="w-32">
                                                            <Input
                                                                type="number"
                                                                value={allowance.amount}
                                                                onChange={(e) => updateAllowance(allowance.id, 'amount', parseFloat(e.target.value) || 0)}
                                                                min={0}
                                                                placeholder="المبلغ"
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeAllowance(allowance.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {allowances.length > 0 && (
                                            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">إجمالي البدلات:</span>
                                                    <span className="font-bold text-emerald-600">{totalAllowances.toLocaleString('ar-SA')} ر.س</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total Salary Summary */}
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-navy">إجمالي الراتب الشهري</span>
                                            <span className="text-2xl font-bold text-emerald-600">
                                                {grossSalary.toLocaleString('ar-SA')} ر.س
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-2">
                                            = الراتب الأساسي ({basicSalary.toLocaleString('ar-SA')}) + البدلات ({totalAllowances.toLocaleString('ar-SA')})
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

                            {/* Extended Personal Info */}
                            <Collapsible open={openSections.includes('personal_advanced')} onOpenChange={() => toggleSection('personal_advanced')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <User className="w-5 h-5 text-purple-500" />
                                                    معلومات شخصية إضافية
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('personal_advanced') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">الجنسية</Label>
                                                    <Select value={nationality} onValueChange={setNationality}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Saudi Arabia">سعودي</SelectItem>
                                                            <SelectItem value="Egypt">مصري</SelectItem>
                                                            <SelectItem value="Jordan">أردني</SelectItem>
                                                            <SelectItem value="Syria">سوري</SelectItem>
                                                            <SelectItem value="Yemen">يمني</SelectItem>
                                                            <SelectItem value="Pakistan">باكستاني</SelectItem>
                                                            <SelectItem value="India">هندي</SelectItem>
                                                            <SelectItem value="Philippines">فلبيني</SelectItem>
                                                            <SelectItem value="Other">أخرى</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">تاريخ الميلاد</Label>
                                                    <Input
                                                        type="date"
                                                        value={dateOfBirth}
                                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                {nationalIdType !== 'saudi_id' && (
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">تاريخ انتهاء الهوية</Label>
                                                        <Input
                                                            type="date"
                                                            value={nationalIdExpiry}
                                                            onChange={(e) => setNationalIdExpiry(e.target.value)}
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        المدينة
                                                    </Label>
                                                    <Select value={city} onValueChange={setCity}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="اختر المدينة" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Riyadh">الرياض</SelectItem>
                                                            <SelectItem value="Jeddah">جدة</SelectItem>
                                                            <SelectItem value="Makkah">مكة المكرمة</SelectItem>
                                                            <SelectItem value="Madinah">المدينة المنورة</SelectItem>
                                                            <SelectItem value="Dammam">الدمام</SelectItem>
                                                            <SelectItem value="Khobar">الخبر</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">المنطقة</Label>
                                                    <Select value={region} onValueChange={setRegion}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="اختر المنطقة" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Riyadh Region">منطقة الرياض</SelectItem>
                                                            <SelectItem value="Makkah Region">منطقة مكة المكرمة</SelectItem>
                                                            <SelectItem value="Eastern Province">المنطقة الشرقية</SelectItem>
                                                            <SelectItem value="Madinah Region">منطقة المدينة المنورة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">البريد الشخصي</Label>
                                                    <Input
                                                        type="email"
                                                        value={personalEmail}
                                                        onChange={(e) => setPersonalEmail(e.target.value)}
                                                        placeholder="personal@email.com"
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">الحالة الاجتماعية</Label>
                                                    <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="اختر" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="single">أعزب</SelectItem>
                                                            <SelectItem value="married">متزوج</SelectItem>
                                                            <SelectItem value="divorced">مطلق</SelectItem>
                                                            <SelectItem value="widowed">أرمل</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">عدد المعالين</Label>
                                                    <Input
                                                        type="number"
                                                        value={numberOfDependents}
                                                        onChange={(e) => setNumberOfDependents(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Emergency Contact */}
                            <Collapsible open={openSections.includes('emergency')} onOpenChange={() => toggleSection('emergency')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Phone className="w-5 h-5 text-red-500" />
                                                    جهة اتصال الطوارئ
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('emergency') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">الاسم</Label>
                                                    <Input
                                                        value={emergencyName}
                                                        onChange={(e) => setEmergencyName(e.target.value)}
                                                        placeholder="اسم جهة الاتصال"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">صلة القرابة</Label>
                                                    <Select value={emergencyRelationship} onValueChange={setEmergencyRelationship}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="اختر" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Father">الأب</SelectItem>
                                                            <SelectItem value="Mother">الأم</SelectItem>
                                                            <SelectItem value="Spouse">الزوج/الزوجة</SelectItem>
                                                            <SelectItem value="Brother">الأخ</SelectItem>
                                                            <SelectItem value="Sister">الأخت</SelectItem>
                                                            <SelectItem value="Other">أخرى</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">رقم الهاتف</Label>
                                                    <Input
                                                        value={emergencyPhone}
                                                        onChange={(e) => setEmergencyPhone(e.target.value)}
                                                        placeholder="+966 5XXXXXXXX"
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Contract Details */}
                            <Collapsible open={openSections.includes('contract')} onOpenChange={() => toggleSection('contract')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                    تفاصيل العقد
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('contract') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">الرقم الوظيفي</Label>
                                                    <Input
                                                        value={employeeNumber}
                                                        onChange={(e) => setEmployeeNumber(e.target.value)}
                                                        placeholder="EMP001"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">نوع العقد</Label>
                                                    <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="indefinite">غير محدد المدة</SelectItem>
                                                            <SelectItem value="fixed_term">محدد المدة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">فترة التجربة (أيام)</Label>
                                                    <Input
                                                        type="number"
                                                        value={probationPeriod}
                                                        onChange={(e) => setProbationPeriod(parseInt(e.target.value) || 90)}
                                                        min={0}
                                                        max={180}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">تاريخ بداية العقد</Label>
                                                    <Input
                                                        type="date"
                                                        value={contractStartDate}
                                                        onChange={(e) => setContractStartDate(e.target.value)}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                {contractType === 'fixed_term' && (
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">تاريخ نهاية العقد</Label>
                                                        <Input
                                                            type="date"
                                                            value={contractEndDate}
                                                            onChange={(e) => setContractEndDate(e.target.value)}
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Work Schedule */}
                            <Collapsible open={openSections.includes('schedule')} onOpenChange={() => toggleSection('schedule')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-indigo-500" />
                                                    جدول العمل
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('schedule') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">ساعات العمل الأسبوعية</Label>
                                                    <Input
                                                        type="number"
                                                        value={weeklyHours}
                                                        onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 48)}
                                                        max={48}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">ساعات العمل اليومية</Label>
                                                    <Input
                                                        type="number"
                                                        value={dailyHours}
                                                        onChange={(e) => setDailyHours(parseInt(e.target.value) || 8)}
                                                        max={8}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">يوم الراحة</Label>
                                                    <Select value={restDay} onValueChange={setRestDay}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Friday">الجمعة</SelectItem>
                                                            <SelectItem value="Saturday">السبت</SelectItem>
                                                            <SelectItem value="Sunday">الأحد</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Payment Details */}
                            <Collapsible open={openSections.includes('payment')} onOpenChange={() => toggleSection('payment')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-green-500" />
                                                    تفاصيل الدفع
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('payment') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">دورة الدفع</Label>
                                                    <Select value={paymentFrequency} onValueChange={(v) => setPaymentFrequency(v as PaymentFrequency)}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="monthly">شهري</SelectItem>
                                                            <SelectItem value="bi_weekly">كل أسبوعين</SelectItem>
                                                            <SelectItem value="weekly">أسبوعي</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">طريقة الدفع</Label>
                                                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                                                            <SelectItem value="cash">نقدي</SelectItem>
                                                            <SelectItem value="check">شيك</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">اسم البنك</Label>
                                                    <Select value={bankName} onValueChange={setBankName}>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="اختر البنك" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Al Rajhi Bank">مصرف الراجحي</SelectItem>
                                                            <SelectItem value="National Commercial Bank">البنك الأهلي</SelectItem>
                                                            <SelectItem value="Riyad Bank">بنك الرياض</SelectItem>
                                                            <SelectItem value="Alinma Bank">مصرف الإنماء</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">رقم الآيبان (IBAN)</Label>
                                                    <Input
                                                        value={iban}
                                                        onChange={(e) => setIban(e.target.value)}
                                                        placeholder="SA0000000000000000000000"
                                                        className="h-11 rounded-xl"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* GOSI */}
                            <Collapsible open={openSections.includes('gosi')} onOpenChange={() => toggleSection('gosi')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-cyan-500" />
                                                    التأمينات الاجتماعية
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('gosi') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <Label className="text-navy font-medium">مسجل في التأمينات</Label>
                                                    <Switch
                                                        checked={gosiRegistered}
                                                        onCheckedChange={setGosiRegistered}
                                                    />
                                                </div>
                                                {gosiRegistered && (
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">رقم التأمينات</Label>
                                                        <Input
                                                            value={gosiNumber}
                                                            onChange={(e) => setGosiNumber(e.target.value)}
                                                            placeholder="رقم التأمينات"
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {isSaudi && (
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                                        <div className="text-sm text-blue-800">
                                                            <strong>نسبة الاستقطاع للموظف السعودي:</strong>
                                                            <ul className="mt-2 mr-4 list-disc">
                                                                <li>حصة الموظف: 9.75% من الراتب الأساسي</li>
                                                                <li>حصة صاحب العمل: 12.75% من الراتب الأساسي</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* Organization Structure - Only for medium/firm */}
                            {(officeType === 'medium' || officeType === 'firm') && (
                                <Collapsible open={openSections.includes('organization')} onOpenChange={() => toggleSection('organization')}>
                                    <Card className="rounded-3xl shadow-sm border-blue-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-blue-50/50 transition-colors rounded-t-3xl bg-blue-50/30">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Building2 className="w-5 h-5 text-blue-500" />
                                                        الهيكل التنظيمي
                                                        <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded-full">للمكاتب المتوسطة والكبيرة</span>
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('organization') && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">الفرع</Label>
                                                        <Select value={branchId} onValueChange={setBranchId}>
                                                            <SelectTrigger className="h-11 rounded-xl">
                                                                <SelectValue placeholder="اختر الفرع" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="main">المقر الرئيسي</SelectItem>
                                                                <SelectItem value="riyadh">فرع الرياض</SelectItem>
                                                                <SelectItem value="jeddah">فرع جدة</SelectItem>
                                                                <SelectItem value="dammam">فرع الدمام</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">القسم</Label>
                                                        <Select value={departmentName} onValueChange={setDepartmentName}>
                                                            <SelectTrigger className="h-11 rounded-xl">
                                                                <SelectValue placeholder="اختر القسم" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Legal">الشؤون القانونية</SelectItem>
                                                                <SelectItem value="Finance">المالية</SelectItem>
                                                                <SelectItem value="HR">الموارد البشرية</SelectItem>
                                                                <SelectItem value="IT">تقنية المعلومات</SelectItem>
                                                                <SelectItem value="Administration">الإدارة</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">الفريق</Label>
                                                        <Select value={teamId} onValueChange={setTeamId}>
                                                            <SelectTrigger className="h-11 rounded-xl">
                                                                <SelectValue placeholder="اختر الفريق" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="team1">فريق القضايا التجارية</SelectItem>
                                                                <SelectItem value="team2">فريق القضايا الجنائية</SelectItem>
                                                                <SelectItem value="team3">فريق العقود</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-navy font-medium">المشرف المباشر</Label>
                                                        <Select value={supervisorId} onValueChange={setSupervisorId}>
                                                            <SelectTrigger className="h-11 rounded-xl">
                                                                <SelectValue placeholder="اختر المشرف" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">بدون مشرف</SelectItem>
                                                                <SelectItem value="manager1">أ. محمد العمري</SelectItem>
                                                                <SelectItem value="manager2">أ. أحمد السعيد</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-medium">مركز التكلفة</Label>
                                                    <Input
                                                        value={costCenter}
                                                        onChange={(e) => setCostCenter(e.target.value)}
                                                        placeholder="CC-001"
                                                        className="h-11 rounded-xl max-w-xs"
                                                    />
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* Leave Balance */}
                            <Collapsible open={openSections.includes('leave')} onOpenChange={() => toggleSection('leave')}>
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-orange-500" />
                                                    رصيد الإجازات
                                                </CardTitle>
                                                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('leave') && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="space-y-2">
                                                <Label className="text-navy font-medium">رصيد الإجازة السنوية (أيام)</Label>
                                                <Input
                                                    type="number"
                                                    value={annualLeaveEntitlement}
                                                    onChange={(e) => setAnnualLeaveEntitlement(parseInt(e.target.value) || 21)}
                                                    min={21}
                                                    max={30}
                                                    className="h-11 rounded-xl max-w-xs"
                                                />
                                                <p className="text-xs text-slate-500">21 يوم (أقل من 5 سنوات) أو 30 يوم (5 سنوات فأكثر)</p>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            {/* SUBMIT BUTTONS */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/dashboard/hr/employees' })}
                                    className="h-12 px-8 rounded-xl"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5 ml-2" />
                                            {isEditMode ? 'حفظ التغييرات' : 'إضافة الموظف'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <HRSidebar context="employees" />
                </div>
            </Main>
        </>
    )
}
