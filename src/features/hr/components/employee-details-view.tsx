import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useEmployee, useDeleteEmployee } from '@/hooks/useHR'
import {
    Search, Bell, AlertCircle, User, Phone, Mail, MapPin, Briefcase, Calendar,
    CreditCard, Wallet, FileText, AlertTriangle, Trash2, Loader2, Building2,
    Clock, DollarSign, Shield, Heart, UserCog
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import type { EmploymentStatus, EmploymentType, ContractType } from '@/services/hrService'

export function EmployeeDetailsView() {
    const { employeeId } = useParams({ strict: false }) as { employeeId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch employee data
    const { data: employeeData, isLoading, isError, error, refetch } = useEmployee(employeeId)

    // Delete mutation
    const deleteEmployeeMutation = useDeleteEmployee()

    // Handle delete
    const handleDelete = () => {
        deleteEmployeeMutation.mutate(employeeId, {
            onSuccess: () => {
                navigate({ to: '/dashboard/hr/employees' })
            }
        })
    }

    // Format date helper
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'd MMMM yyyy', { locale: arSA })
    }

    // Status badge styling
    const getStatusBadge = (status: EmploymentStatus) => {
        const styles: Record<EmploymentStatus, string> = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            on_leave: 'bg-amber-100 text-amber-700 border-amber-200',
            suspended: 'bg-red-100 text-red-700 border-red-200',
            terminated: 'bg-slate-100 text-slate-700 border-slate-200',
        }
        const labels: Record<EmploymentStatus, string> = {
            active: 'نشط',
            on_leave: 'في إجازة',
            suspended: 'موقوف',
            terminated: 'منتهي',
        }
        return <Badge className={`${styles[status]} border-0 rounded-md px-3 py-1`}>{labels[status]}</Badge>
    }

    // Employment type label
    const getTypeLabel = (type: EmploymentType) => {
        const labels: Record<EmploymentType, string> = {
            full_time: 'دوام كامل',
            part_time: 'دوام جزئي',
            contract: 'عقد',
            temporary: 'مؤقت',
        }
        return labels[type] || type
    }

    // Contract type label
    const getContractLabel = (type: ContractType) => {
        const labels: Record<ContractType, string> = {
            indefinite: 'غير محدد المدة',
            fixed_term: 'محدد المدة',
        }
        return labels[type] || type
    }

    // Transform data for display
    const employee = useMemo(() => {
        if (!employeeData) return null
        return {
            ...employeeData,
            fullName: employeeData.personalInfo?.fullNameArabic || 'غير محدد',
            fullNameEnglish: employeeData.personalInfo?.fullNameEnglish || '',
            status: employeeData.employment?.employmentStatus || 'active',
        }
    }, [employeeData])

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
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div>
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات الموظف</h3>
                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !employee && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <User className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">الموظف غير موجود</h3>
                        <p className="text-slate-500 mb-4">لم يتم العثور على الموظف المطلوب</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to="/dashboard/hr/employees">
                                العودة إلى القائمة
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && employee && (
                    <>
                        {/* HERO CARD */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title={employee.fullName}
                            type="employees"
                            listMode={true}
                        />

                        {/* MAIN GRID LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* RIGHT COLUMN (Main Content) */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                                            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                                {['overview', 'employment', 'compensation', 'leave', 'documents'].map((tab) => (
                                                    <TabsTrigger
                                                        key={tab}
                                                        value={tab}
                                                        className="
                                                            inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all
                                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                                            disabled:pointer-events-none disabled:opacity-50
                                                            data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm
                                                            data-[state=inactive]:hover:bg-slate-200
                                                            flex-1 sm:flex-initial
                                                        "
                                                    >
                                                        {tab === 'overview' ? 'نظرة عامة' :
                                                            tab === 'employment' ? 'التوظيف' :
                                                            tab === 'compensation' ? 'الراتب' :
                                                            tab === 'leave' ? 'الإجازات' : 'المستندات'}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                                            {/* Overview Tab */}
                                            <TabsContent value="overview" className="mt-0 space-y-6">
                                                {/* Employee Header Card */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                                                                {employee.avatar ? (
                                                                    <img src={employee.avatar} alt={employee.fullName} className="w-full h-full rounded-2xl object-cover" />
                                                                ) : (
                                                                    employee.fullName.charAt(0)
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h2 className="text-2xl font-bold text-navy">{employee.fullName}</h2>
                                                                    {getStatusBadge(employee.status)}
                                                                </div>
                                                                {employee.fullNameEnglish && (
                                                                    <p className="text-slate-500 mb-2" dir="ltr">{employee.fullNameEnglish}</p>
                                                                )}
                                                                <p className="text-lg text-slate-600">
                                                                    {employee.employment?.jobTitleArabic || employee.employment?.jobTitle || 'غير محدد'}
                                                                </p>
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    الرقم الوظيفي: {employee.employeeNumber || employee.employeeId}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Personal Info & Contact */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                                البيانات الشخصية
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">رقم الهوية<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.nationalId || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الجنسية</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {employee.personalInfo?.nationality || 'غير محدد'}
                                                                    {employee.personalInfo?.isSaudi && (
                                                                        <Badge className="ms-2 bg-green-100 text-green-700 text-xs">سعودي</Badge>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">تاريخ الميلاد</span>
                                                                <span className="font-medium text-slate-900">{formatDate(employee.personalInfo?.dateOfBirth)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الجنس</span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الحالة الاجتماعية</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {employee.personalInfo?.maritalStatus === 'single' ? 'أعزب' :
                                                                     employee.personalInfo?.maritalStatus === 'married' ? 'متزوج' :
                                                                     employee.personalInfo?.maritalStatus === 'divorced' ? 'مطلق' :
                                                                     employee.personalInfo?.maritalStatus === 'widowed' ? 'أرمل' : 'غير محدد'}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                                معلومات الاتصال
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الجوال<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{employee.personalInfo?.mobile || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">البريد الإلكتروني<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{employee.personalInfo?.email || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">المدينة</span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.currentAddress?.city || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">المنطقة</span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.currentAddress?.region || 'غير محدد'}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Emergency Contact */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Heart className="w-4 h-4 text-red-500" />
                                                            جهة اتصال الطوارئ
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">الاسم</span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.emergencyContact?.name || 'غير محدد'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">صلة القرابة</span>
                                                                <span className="font-medium text-slate-900">{employee.personalInfo?.emergencyContact?.relationship || 'غير محدد'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">رقم الهاتف<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{employee.personalInfo?.emergencyContact?.phone || 'غير محدد'}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Employment Tab */}
                                            <TabsContent value="employment" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                            تفاصيل التوظيف
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">المسمى الوظيفي</span>
                                                                <span className="font-medium text-slate-900">{employee.employment?.jobTitleArabic || employee.employment?.jobTitle || 'غير محدد'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">القسم</span>
                                                                <span className="font-medium text-slate-900">{employee.employment?.departmentName || 'غير محدد'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">نوع التوظيف</span>
                                                                <span className="font-medium text-slate-900">{getTypeLabel(employee.employment?.employmentType || 'full_time')}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">نوع العقد</span>
                                                                <span className="font-medium text-slate-900">{getContractLabel(employee.employment?.contractType || 'indefinite')}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">تاريخ التعيين</span>
                                                                <span className="font-medium text-slate-900">{formatDate(employee.employment?.hireDate)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">تاريخ بداية العقد</span>
                                                                <span className="font-medium text-slate-900">{formatDate(employee.employment?.contractStartDate)}</span>
                                                            </div>
                                                            {employee.employment?.contractEndDate && (
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">تاريخ نهاية العقد</span>
                                                                    <span className="font-medium text-slate-900">{formatDate(employee.employment?.contractEndDate)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Probation Info */}
                                                {employee.employment?.onProbation && (
                                                    <Card className="border-none shadow-sm bg-amber-50 rounded-2xl overflow-hidden border border-amber-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                                                <div>
                                                                    <span className="font-bold text-amber-800">فترة التجربة</span>
                                                                    <p className="text-sm text-amber-700">
                                                                        الموظف في فترة تجربة ({employee.employment?.probationPeriod || 90} يوم)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Work Schedule */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                            جدول العمل
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">ساعات العمل الأسبوعية</span>
                                                                <span className="font-medium text-slate-900">{employee.employment?.workSchedule?.weeklyHours || 48} ساعة</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">ساعات العمل اليومية</span>
                                                                <span className="font-medium text-slate-900">{employee.employment?.workSchedule?.dailyHours || 8} ساعات</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">يوم الراحة</span>
                                                                <span className="font-medium text-slate-900">{employee.employment?.workSchedule?.restDay || 'الجمعة'}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Compensation Tab */}
                                            <TabsContent value="compensation" className="mt-0 space-y-6">
                                                {/* Salary Summary */}
                                                <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100">
                                                    <CardContent className="p-6">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="text-sm text-emerald-700 block">إجمالي الراتب الشهري</span>
                                                                <span className="text-3xl font-bold text-emerald-800">
                                                                    {(employee.compensation?.grossSalary || 0).toLocaleString('ar-SA')} ر.س
                                                                </span>
                                                            </div>
                                                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                                                <Wallet className="w-8 h-8 text-emerald-600" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Basic Salary */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-amber-600" />
                                                                الراتب الأساسي
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="text-2xl font-bold text-navy">
                                                                {(employee.compensation?.basicSalary || 0).toLocaleString('ar-SA')} ر.س
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Allowances */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                                البدلات
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-2">
                                                            {employee.compensation?.allowances?.housingAllowance && (
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">بدل السكن</span>
                                                                    <span className="font-medium">{employee.compensation.allowances.housingAllowance.toLocaleString('ar-SA')} ر.س</span>
                                                                </div>
                                                            )}
                                                            {employee.compensation?.allowances?.transportationAllowance && (
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">بدل النقل</span>
                                                                    <span className="font-medium">{employee.compensation.allowances.transportationAllowance.toLocaleString('ar-SA')} ر.س</span>
                                                                </div>
                                                            )}
                                                            {employee.compensation?.allowances?.foodAllowance && (
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">بدل الطعام</span>
                                                                    <span className="font-medium">{employee.compensation.allowances.foodAllowance.toLocaleString('ar-SA')} ر.س</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-sm font-bold pt-2 border-t">
                                                                <span>إجمالي البدلات</span>
                                                                <span>{(employee.compensation?.allowances?.totalAllowances || 0).toLocaleString('ar-SA')} ر.س</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Bank Details */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-purple-600" />
                                                            البيانات البنكية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">اسم البنك</span>
                                                                <span className="font-medium text-slate-900">{employee.compensation?.bankDetails?.bankName || 'غير محدد'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">رقم الآيبان (IBAN)<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{employee.compensation?.bankDetails?.iban || 'غير محدد'}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* GOSI */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Shield className="w-4 h-4 text-green-600" />
                                                            التأمينات الاجتماعية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">الحالة</span>
                                                                <Badge className={employee.gosi?.registered ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                                                                    {employee.gosi?.registered ? 'مسجل' : 'غير مسجل'}
                                                                </Badge>
                                                            </div>
                                                            {employee.gosi?.gosiNumber && (
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">رقم التأمينات<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></span>
                                                                    <span className="font-medium text-slate-900">{employee.gosi.gosiNumber}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {employee.gosi?.registered && (
                                                            <div className="pt-3 mt-3 border-t grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">حصة الموظف</span>
                                                                    <span className="font-medium text-slate-900">{employee.gosi?.employeeContribution || 0}%</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">حصة صاحب العمل</span>
                                                                    <span className="font-medium text-slate-900">{employee.gosi?.employerContribution || 0}%</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Leave Tab */}
                                            <TabsContent value="leave" className="mt-0 space-y-6">
                                                {/* Years of Service Info */}
                                                {(employee as any).yearsOfService !== undefined && (
                                                    <Card className="border-none shadow-sm bg-blue-50 rounded-2xl overflow-hidden border border-blue-100">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                                    <div>
                                                                        <span className="text-sm text-blue-700">سنوات الخدمة</span>
                                                                        <span className="font-bold text-blue-800 text-lg ms-2">{(employee as any).yearsOfService} سنة</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-start">
                                                                    <span className="text-sm text-blue-600">الحد الأدنى للإجازة</span>
                                                                    <span className="font-bold text-blue-800 text-lg ms-2">{(employee as any).minAnnualLeave || 21} يوم</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Annual Leave */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            الإجازة السنوية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-4 gap-4 text-center">
                                                            <div className="bg-blue-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-blue-700">{employee.leave?.annualLeave?.entitlement || (employee as any).minAnnualLeave || 21}</div>
                                                                <div className="text-xs text-blue-600">الاستحقاق</div>
                                                            </div>
                                                            <div className="bg-amber-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-amber-700">{employee.leave?.annualLeave?.used || 0}</div>
                                                                <div className="text-xs text-amber-600">مستخدم</div>
                                                            </div>
                                                            <div className="bg-purple-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-purple-700">{employee.leave?.annualLeave?.pending || 0}</div>
                                                                <div className="text-xs text-purple-600">معلق</div>
                                                            </div>
                                                            <div className="bg-emerald-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-emerald-700">{employee.leave?.annualLeave?.remaining || (employee as any).minAnnualLeave || 21}</div>
                                                                <div className="text-xs text-emerald-600">متبقي</div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Sick Leave */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Heart className="w-4 h-4 text-red-500" />
                                                            الإجازة المرضية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-3 gap-4 text-center">
                                                            <div className="bg-slate-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-slate-700">{employee.leave?.sickLeave?.fullPayDaysUsed || 0}</div>
                                                                <div className="text-xs text-slate-600">100% (30 يوم)</div>
                                                            </div>
                                                            <div className="bg-slate-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-slate-700">{employee.leave?.sickLeave?.partialPayDaysUsed || 0}</div>
                                                                <div className="text-xs text-slate-600">75% (60 يوم)</div>
                                                            </div>
                                                            <div className="bg-slate-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-slate-700">{employee.leave?.sickLeave?.unpaidDaysUsed || 0}</div>
                                                                <div className="text-xs text-slate-600">بدون راتب (30 يوم)</div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 text-center">
                                                            <span className="text-sm text-slate-500">المتبقي من 120 يوم: </span>
                                                            <span className="font-bold text-navy">{employee.leave?.sickLeave?.remaining || 120} يوم</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Hajj Leave */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                                            إجازة الحج
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center gap-4">
                                                            <Badge className={employee.leave?.hajjLeave?.eligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                                                                {employee.leave?.hajjLeave?.eligible ? 'مستحق' : 'غير مستحق (بعد سنتين خدمة)'}
                                                            </Badge>
                                                            {employee.leave?.hajjLeave?.taken && (
                                                                <span className="text-sm text-slate-500">
                                                                    تم الاستخدام في {formatDate(employee.leave.hajjLeave.takenDate)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Documents Tab */}
                                            <TabsContent value="documents" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        {employee.documents && employee.documents.length > 0 ? (
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                {employee.documents.map((doc, idx) => (
                                                                    <div key={doc._id || idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                                                                <FileText className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="font-medium text-navy text-sm truncate">{doc.documentName}</div>
                                                                                <div className="text-xs text-slate-500">{doc.documentType}</div>
                                                                            </div>
                                                                        </div>
                                                                        {doc.verified && (
                                                                            <Badge className="mt-2 bg-green-100 text-green-700 text-xs">موثق</Badge>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-slate-500">
                                                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                                                <p>لا توجد مستندات</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            </div>

                            {/* LEFT SIDEBAR - Quick Actions & Calendar */}
                            <HRSidebar
                                context="employees"
                                employeeId={employeeId}
                                onDeleteEmployee={() => setShowDeleteConfirm(true)}
                                isDeletePending={deleteEmployeeMutation.isPending}
                            />
                        </div>
                    </>
                )}
            </Main>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && employee && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                            هل أنت متأكد من حذف هذا الموظف؟
                        </h3>
                        <p className="text-slate-500 text-center mb-6">
                            سيتم حذف الموظف "{employee.fullName}" نهائياً ولا يمكن استرجاعه.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 rounded-xl"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    handleDelete()
                                }}
                                disabled={deleteEmployeeMutation.isPending}
                                className="px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleteEmployeeMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حذف الموظف
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
