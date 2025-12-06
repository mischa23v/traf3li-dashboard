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
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useCreateEmployee, useUpdateEmployee, useEmployee } from '@/hooks/useHR'
import {
    Search, Bell, User, Phone, Mail, MapPin, Building2, Calendar, Briefcase,
    CreditCard, Wallet, Loader2, CheckCircle, DollarSign, Clock, UserCog, FileText
} from 'lucide-react'
import type { CreateEmployeeData, NationalIdType, Gender, EmploymentType, ContractType, PaymentFrequency, PaymentMethod } from '@/services/hrService'

export function EmployeeCreateView() {
    const navigate = useNavigate()
    const searchParams = useSearch({ strict: false }) as { editId?: string }
    const editId = searchParams?.editId

    const isEditMode = !!editId

    // Fetch employee data if editing
    const { data: existingEmployee, isLoading: isLoadingEmployee } = useEmployee(editId || '')

    // Mutations
    const createMutation = useCreateEmployee()
    const updateMutation = useUpdateEmployee()

    // Form State - Personal Info
    const [fullNameArabic, setFullNameArabic] = useState('')
    const [fullNameEnglish, setFullNameEnglish] = useState('')
    const [nationalId, setNationalId] = useState('')
    const [nationalIdType, setNationalIdType] = useState<NationalIdType>('saudi_id')
    const [nationalIdExpiry, setNationalIdExpiry] = useState('')
    const [nationality, setNationality] = useState('Saudi Arabia')
    const [gender, setGender] = useState<Gender>('male')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    const [personalEmail, setPersonalEmail] = useState('')
    const [city, setCity] = useState('')
    const [region, setRegion] = useState('')
    const [maritalStatus, setMaritalStatus] = useState<string>('')
    const [numberOfDependents, setNumberOfDependents] = useState<number>(0)

    // Emergency Contact
    const [emergencyName, setEmergencyName] = useState('')
    const [emergencyRelationship, setEmergencyRelationship] = useState('')
    const [emergencyPhone, setEmergencyPhone] = useState('')

    // Form State - Employment
    const [employeeNumber, setEmployeeNumber] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [jobTitleArabic, setJobTitleArabic] = useState('')
    const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
    const [contractType, setContractType] = useState<ContractType>('indefinite')
    const [contractStartDate, setContractStartDate] = useState('')
    const [contractEndDate, setContractEndDate] = useState('')
    const [hireDate, setHireDate] = useState('')
    const [probationPeriod, setProbationPeriod] = useState<number>(90)
    const [reportsTo, setReportsTo] = useState('')
    const [departmentName, setDepartmentName] = useState('')

    // Work Schedule
    const [weeklyHours, setWeeklyHours] = useState<number>(48)
    const [dailyHours, setDailyHours] = useState<number>(8)
    const [workDays, setWorkDays] = useState<string[]>(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'])
    const [restDay, setRestDay] = useState('Friday')

    // Form State - Compensation
    const [basicSalary, setBasicSalary] = useState<number>(0)
    const [housingAllowance, setHousingAllowance] = useState<number>(0)
    const [transportationAllowance, setTransportationAllowance] = useState<number>(0)
    const [foodAllowance, setFoodAllowance] = useState<number>(0)
    const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
    const [bankName, setBankName] = useState('')
    const [iban, setIban] = useState('')

    // GOSI
    const [gosiRegistered, setGosiRegistered] = useState(false)
    const [gosiNumber, setGosiNumber] = useState('')

    // Populate form when editing
    useEffect(() => {
        if (existingEmployee && isEditMode) {
            // Personal Info
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

            // Emergency Contact
            setEmergencyName(existingEmployee.personalInfo?.emergencyContact?.name || '')
            setEmergencyRelationship(existingEmployee.personalInfo?.emergencyContact?.relationship || '')
            setEmergencyPhone(existingEmployee.personalInfo?.emergencyContact?.phone || '')

            // Employment
            setEmployeeNumber(existingEmployee.employeeNumber || '')
            setJobTitle(existingEmployee.employment?.jobTitle || '')
            setJobTitleArabic(existingEmployee.employment?.jobTitleArabic || '')
            setEmploymentType(existingEmployee.employment?.employmentType || 'full_time')
            setContractType(existingEmployee.employment?.contractType || 'indefinite')
            setContractStartDate(existingEmployee.employment?.contractStartDate?.split('T')[0] || '')
            setContractEndDate(existingEmployee.employment?.contractEndDate?.split('T')[0] || '')
            setHireDate(existingEmployee.employment?.hireDate?.split('T')[0] || '')
            setProbationPeriod(existingEmployee.employment?.probationPeriod || 90)
            setReportsTo(existingEmployee.employment?.reportsTo || '')
            setDepartmentName(existingEmployee.employment?.departmentName || '')

            // Work Schedule
            setWeeklyHours(existingEmployee.employment?.workSchedule?.weeklyHours || 48)
            setDailyHours(existingEmployee.employment?.workSchedule?.dailyHours || 8)
            setWorkDays(existingEmployee.employment?.workSchedule?.workDays || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'])
            setRestDay(existingEmployee.employment?.workSchedule?.restDay || 'Friday')

            // Compensation
            setBasicSalary(existingEmployee.compensation?.basicSalary || 0)
            setHousingAllowance(existingEmployee.compensation?.allowances?.housingAllowance || 0)
            setTransportationAllowance(existingEmployee.compensation?.allowances?.transportationAllowance || 0)
            setFoodAllowance(existingEmployee.compensation?.allowances?.foodAllowance || 0)
            setPaymentFrequency(existingEmployee.compensation?.paymentFrequency || 'monthly')
            setPaymentMethod(existingEmployee.compensation?.paymentMethod || 'bank_transfer')
            setBankName(existingEmployee.compensation?.bankDetails?.bankName || '')
            setIban(existingEmployee.compensation?.bankDetails?.iban || '')

            // GOSI
            setGosiRegistered(existingEmployee.gosi?.registered || false)
            setGosiNumber(existingEmployee.gosi?.gosiNumber || '')
        }
    }, [existingEmployee, isEditMode])

    // Calculate if Saudi
    const isSaudi = useMemo(() => {
        return nationalIdType === 'saudi_id' || nationality === 'Saudi Arabia'
    }, [nationalIdType, nationality])

    // Calculate total allowances
    const totalAllowances = useMemo(() => {
        return housingAllowance + transportationAllowance + foodAllowance
    }, [housingAllowance, transportationAllowance, foodAllowance])

    // Calculate gross salary
    const grossSalary = useMemo(() => {
        return basicSalary + totalAllowances
    }, [basicSalary, totalAllowances])

    // Handle Submit
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
                contractStartDate,
                contractEndDate: contractEndDate || undefined,
                hireDate,
                probationPeriod,
                onProbation: true,
                workSchedule: {
                    weeklyHours,
                    dailyHours,
                    workDays,
                    restDay,
                },
                reportsTo: reportsTo || undefined,
                departmentName: departmentName || undefined,
            },
            compensation: {
                basicSalary,
                currency: 'SAR',
                allowances: {
                    housingAllowance,
                    transportationAllowance,
                    foodAllowance,
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
        { title: 'الرواتب', href: '/dashboard/hr/salaries', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD */}
                <ProductivityHero
                    badge="الموارد البشرية"
                    title={isEditMode ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                    type="employees"
                    listMode={true}
                />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* PERSONAL INFORMATION SECTION */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        البيانات الشخصية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Names */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullNameArabic" className="text-navy font-medium">
                                                الاسم الكامل بالعربية <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="fullNameArabic"
                                                value={fullNameArabic}
                                                onChange={(e) => setFullNameArabic(e.target.value)}
                                                placeholder="محمد أحمد العمري"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fullNameEnglish" className="text-navy font-medium">
                                                الاسم الكامل بالإنجليزية
                                            </Label>
                                            <Input
                                                id="fullNameEnglish"
                                                value={fullNameEnglish}
                                                onChange={(e) => setFullNameEnglish(e.target.value)}
                                                placeholder="Mohammed Ahmed Al-Omari"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* National ID */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nationalIdType" className="text-navy font-medium">
                                                نوع الهوية <span className="text-red-500">*</span>
                                            </Label>
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
                                            <Label htmlFor="nationalId" className="text-navy font-medium">
                                                رقم الهوية <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="nationalId"
                                                value={nationalId}
                                                onChange={(e) => setNationalId(e.target.value)}
                                                placeholder="1234567890"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        {nationalIdType !== 'saudi_id' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="nationalIdExpiry" className="text-navy font-medium">
                                                    تاريخ انتهاء الهوية
                                                </Label>
                                                <Input
                                                    id="nationalIdExpiry"
                                                    type="date"
                                                    value={nationalIdExpiry}
                                                    onChange={(e) => setNationalIdExpiry(e.target.value)}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Demographics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nationality" className="text-navy font-medium">
                                                الجنسية <span className="text-red-500">*</span>
                                            </Label>
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
                                                    <SelectItem value="Sudan">سوداني</SelectItem>
                                                    <SelectItem value="Pakistan">باكستاني</SelectItem>
                                                    <SelectItem value="India">هندي</SelectItem>
                                                    <SelectItem value="Philippines">فلبيني</SelectItem>
                                                    <SelectItem value="Other">أخرى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-navy font-medium">
                                                الجنس <span className="text-red-500">*</span>
                                            </Label>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth" className="text-navy font-medium">
                                                تاريخ الميلاد <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile" className="text-navy font-medium">
                                                <Phone className="w-4 h-4 inline ml-1" />
                                                رقم الجوال <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="mobile"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="+966 5XXXXXXXX"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-navy font-medium">
                                                <Mail className="w-4 h-4 inline ml-1" />
                                                البريد الإلكتروني <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
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

                                    {/* Address */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-navy font-medium">
                                                <MapPin className="w-4 h-4 inline ml-1" />
                                                المدينة <span className="text-red-500">*</span>
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
                                                    <SelectItem value="Dhahran">الظهران</SelectItem>
                                                    <SelectItem value="Tabuk">تبوك</SelectItem>
                                                    <SelectItem value="Abha">أبها</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="region" className="text-navy font-medium">
                                                المنطقة <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={region} onValueChange={setRegion}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="اختر المنطقة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Riyadh Region">منطقة الرياض</SelectItem>
                                                    <SelectItem value="Makkah Region">منطقة مكة المكرمة</SelectItem>
                                                    <SelectItem value="Madinah Region">منطقة المدينة المنورة</SelectItem>
                                                    <SelectItem value="Eastern Province">المنطقة الشرقية</SelectItem>
                                                    <SelectItem value="Asir Region">منطقة عسير</SelectItem>
                                                    <SelectItem value="Tabuk Region">منطقة تبوك</SelectItem>
                                                    <SelectItem value="Qassim Region">منطقة القصيم</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Marital Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="maritalStatus" className="text-navy font-medium">
                                                الحالة الاجتماعية
                                            </Label>
                                            <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="اختر الحالة" />
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
                                            <Label htmlFor="numberOfDependents" className="text-navy font-medium">
                                                عدد المعالين
                                            </Label>
                                            <Input
                                                id="numberOfDependents"
                                                type="number"
                                                value={numberOfDependents}
                                                onChange={(e) => setNumberOfDependents(parseInt(e.target.value) || 0)}
                                                min={0}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EMERGENCY CONTACT SECTION */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-red-500" />
                                        جهة اتصال الطوارئ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergencyName" className="text-navy font-medium">
                                                الاسم <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="emergencyName"
                                                value={emergencyName}
                                                onChange={(e) => setEmergencyName(e.target.value)}
                                                placeholder="اسم جهة الاتصال"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emergencyRelationship" className="text-navy font-medium">
                                                صلة القرابة <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={emergencyRelationship} onValueChange={setEmergencyRelationship}>
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="اختر صلة القرابة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Father">الأب</SelectItem>
                                                    <SelectItem value="Mother">الأم</SelectItem>
                                                    <SelectItem value="Spouse">الزوج/الزوجة</SelectItem>
                                                    <SelectItem value="Brother">الأخ</SelectItem>
                                                    <SelectItem value="Sister">الأخت</SelectItem>
                                                    <SelectItem value="Son">الابن</SelectItem>
                                                    <SelectItem value="Daughter">الابنة</SelectItem>
                                                    <SelectItem value="Other">أخرى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="emergencyPhone" className="text-navy font-medium">
                                                رقم الهاتف <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="emergencyPhone"
                                                value={emergencyPhone}
                                                onChange={(e) => setEmergencyPhone(e.target.value)}
                                                placeholder="+966 5XXXXXXXX"
                                                required
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EMPLOYMENT SECTION */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        بيانات التوظيف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Basic Employment */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="employeeNumber" className="text-navy font-medium">
                                                الرقم الوظيفي
                                            </Label>
                                            <Input
                                                id="employeeNumber"
                                                value={employeeNumber}
                                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                                placeholder="EMP001"
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="departmentName" className="text-navy font-medium">
                                                القسم
                                            </Label>
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
                                                    <SelectItem value="Operations">العمليات</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Job Title */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="jobTitleArabic" className="text-navy font-medium">
                                                المسمى الوظيفي (عربي) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="jobTitleArabic"
                                                value={jobTitleArabic}
                                                onChange={(e) => setJobTitleArabic(e.target.value)}
                                                placeholder="محامي"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="jobTitle" className="text-navy font-medium">
                                                المسمى الوظيفي (إنجليزي)
                                            </Label>
                                            <Input
                                                id="jobTitle"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="Attorney"
                                                className="h-11 rounded-xl"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Employment Type & Contract */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="employmentType" className="text-navy font-medium">
                                                نوع التوظيف <span className="text-red-500">*</span>
                                            </Label>
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
                                            <Label htmlFor="contractType" className="text-navy font-medium">
                                                نوع العقد <span className="text-red-500">*</span>
                                            </Label>
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
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hireDate" className="text-navy font-medium">
                                                <Calendar className="w-4 h-4 inline ml-1" />
                                                تاريخ التعيين <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="hireDate"
                                                type="date"
                                                value={hireDate}
                                                onChange={(e) => setHireDate(e.target.value)}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contractStartDate" className="text-navy font-medium">
                                                تاريخ بداية العقد <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="contractStartDate"
                                                type="date"
                                                value={contractStartDate}
                                                onChange={(e) => setContractStartDate(e.target.value)}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        {contractType === 'fixed_term' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="contractEndDate" className="text-navy font-medium">
                                                    تاريخ نهاية العقد
                                                </Label>
                                                <Input
                                                    id="contractEndDate"
                                                    type="date"
                                                    value={contractEndDate}
                                                    onChange={(e) => setContractEndDate(e.target.value)}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Probation */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="probationPeriod" className="text-navy font-medium">
                                                فترة التجربة (بالأيام)
                                            </Label>
                                            <Input
                                                id="probationPeriod"
                                                type="number"
                                                value={probationPeriod}
                                                onChange={(e) => setProbationPeriod(parseInt(e.target.value) || 90)}
                                                min={0}
                                                max={180}
                                                className="h-11 rounded-xl"
                                            />
                                            <p className="text-xs text-slate-500">الحد الأقصى 90 يوم (180 للمناصب العليا)</p>
                                        </div>
                                    </div>

                                    {/* Work Schedule */}
                                    <div className="border-t border-slate-100 pt-4 mt-4">
                                        <h4 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            جدول العمل
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="weeklyHours" className="text-navy font-medium">
                                                    ساعات العمل الأسبوعية
                                                </Label>
                                                <Input
                                                    id="weeklyHours"
                                                    type="number"
                                                    value={weeklyHours}
                                                    onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 48)}
                                                    max={48}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dailyHours" className="text-navy font-medium">
                                                    ساعات العمل اليومية
                                                </Label>
                                                <Input
                                                    id="dailyHours"
                                                    type="number"
                                                    value={dailyHours}
                                                    onChange={(e) => setDailyHours(parseInt(e.target.value) || 8)}
                                                    max={8}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="restDay" className="text-navy font-medium">
                                                    يوم الراحة
                                                </Label>
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
                                    </div>
                                </CardContent>
                            </Card>

                            {/* COMPENSATION SECTION */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-amber-600" />
                                        الراتب والبدلات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Basic Salary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="basicSalary" className="text-navy font-medium">
                                                <DollarSign className="w-4 h-4 inline ml-1" />
                                                الراتب الأساسي (ر.س) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="basicSalary"
                                                type="number"
                                                value={basicSalary}
                                                onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                                                min={0}
                                                step={100}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Allowances */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-semibold text-navy mb-4">البدلات</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="housingAllowance" className="text-navy font-medium">
                                                    بدل السكن (ر.س)
                                                </Label>
                                                <Input
                                                    id="housingAllowance"
                                                    type="number"
                                                    value={housingAllowance}
                                                    onChange={(e) => setHousingAllowance(parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    step={100}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="transportationAllowance" className="text-navy font-medium">
                                                    بدل النقل (ر.س)
                                                </Label>
                                                <Input
                                                    id="transportationAllowance"
                                                    type="number"
                                                    value={transportationAllowance}
                                                    onChange={(e) => setTransportationAllowance(parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    step={100}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="foodAllowance" className="text-navy font-medium">
                                                    بدل الطعام (ر.س)
                                                </Label>
                                                <Input
                                                    id="foodAllowance"
                                                    type="number"
                                                    value={foodAllowance}
                                                    onChange={(e) => setFoodAllowance(parseFloat(e.target.value) || 0)}
                                                    min={0}
                                                    step={100}
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
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

                                    {/* Payment Details */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-semibold text-navy mb-4">تفاصيل الدفع</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="paymentFrequency" className="text-navy font-medium">
                                                    دورة الدفع
                                                </Label>
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
                                                <Label htmlFor="paymentMethod" className="text-navy font-medium">
                                                    طريقة الدفع
                                                </Label>
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
                                    </div>

                                    {/* Bank Details */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-slate-500" />
                                            البيانات البنكية
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="bankName" className="text-navy font-medium">
                                                    اسم البنك
                                                </Label>
                                                <Select value={bankName} onValueChange={setBankName}>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="اختر البنك" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Al Rajhi Bank">مصرف الراجحي</SelectItem>
                                                        <SelectItem value="National Commercial Bank">البنك الأهلي</SelectItem>
                                                        <SelectItem value="Riyad Bank">بنك الرياض</SelectItem>
                                                        <SelectItem value="Saudi British Bank">البنك السعودي البريطاني</SelectItem>
                                                        <SelectItem value="Banque Saudi Fransi">البنك السعودي الفرنسي</SelectItem>
                                                        <SelectItem value="Arab National Bank">البنك العربي الوطني</SelectItem>
                                                        <SelectItem value="Alinma Bank">مصرف الإنماء</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="iban" className="text-navy font-medium">
                                                    رقم الآيبان (IBAN)
                                                </Label>
                                                <Input
                                                    id="iban"
                                                    value={iban}
                                                    onChange={(e) => setIban(e.target.value)}
                                                    placeholder="SA0000000000000000000000"
                                                    className="h-11 rounded-xl"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* GOSI */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-semibold text-navy mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            التأمينات الاجتماعية (GOSI)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gosiRegistered" className="text-navy font-medium">
                                                    مسجل في التأمينات
                                                </Label>
                                                <Select value={gosiRegistered ? 'yes' : 'no'} onValueChange={(v) => setGosiRegistered(v === 'yes')}>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">نعم</SelectItem>
                                                        <SelectItem value="no">لا</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {gosiRegistered && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="gosiNumber" className="text-navy font-medium">
                                                        رقم التأمينات
                                                    </Label>
                                                    <Input
                                                        id="gosiNumber"
                                                        value={gosiNumber}
                                                        onChange={(e) => setGosiNumber(e.target.value)}
                                                        placeholder="رقم التأمينات الاجتماعية"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {isSaudi && (
                                            <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                                                <div className="text-sm text-blue-800">
                                                    <strong>نسبة الاستقطاع للموظف السعودي:</strong>
                                                    <ul className="mt-2 mr-4 list-disc">
                                                        <li>حصة الموظف: 9.75% من الراتب الأساسي</li>
                                                        <li>حصة صاحب العمل: 12.75% من الراتب الأساسي</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SUBMIT BUTTON */}
                            <div className="flex justify-end gap-4">
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

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar context="employees" />
                </div>
            </Main>
        </>
    )
}
