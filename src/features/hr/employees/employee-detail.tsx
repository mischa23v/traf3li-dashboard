import { useState, useMemo } from 'react'
import {
    FileText, Calendar, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Trash2, Edit3, Loader2, ArrowRight,
    History, Link as LinkIcon, Send, Eye, Download, Search, Bell, AlertCircle,
    Users, Building2, Mail, Phone, Briefcase, Award, DollarSign, MapPin
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployee, useDeleteEmployee, useUpdateEmployeeStatus } from '@/hooks/useEmployees'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HRSidebar } from '../components/hr-sidebar'

export function EmployeeDetail() {
    const { employeeId } = useParams({ strict: false }) as { employeeId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch employee data
    const { data: employeeData, isLoading, isError, error, refetch } = useEmployee(employeeId)

    // Mutations
    const deleteEmployeeMutation = useDeleteEmployee()
    const updateStatusMutation = useUpdateEmployeeStatus()

    const handleDelete = () => {
        deleteEmployeeMutation.mutate(employeeId, {
            onSuccess: () => {
                navigate({ to: '/dashboard/hr/employees' })
            }
        })
    }

    const handleStatusChange = (status: 'active' | 'inactive' | 'on_leave' | 'probation' | 'terminated') => {
        updateStatusMutation.mutate({ employeeId, status })
    }

    // Transform API data
    const employee = useMemo(() => {
        if (!employeeData?.data) return null
        const e = employeeData.data

        return {
            id: e._id,
            employeeId: e.employeeId || `EMP-${e._id?.slice(-6)}`,
            firstName: e.firstName || '',
            lastName: e.lastName || '',
            fullName: `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'غير محدد',
            email: e.email || '',
            phone: e.phone || '',
            department: e.department || 'غير محدد',
            position: e.position || 'غير محدد',
            status: e.status || 'active',
            hireDate: e.hireDate ? new Date(e.hireDate).toLocaleDateString('ar-SA') : 'غير محدد',
            salary: e.salary?.amount || 0,
            salaryCurrency: e.salary?.currency || 'SAR',
            avatar: e.avatar || '',
            manager: e.manager || null,
            address: e.address || {},
            nationalId: e.nationalId || '',
            dateOfBirth: e.dateOfBirth ? new Date(e.dateOfBirth).toLocaleDateString('ar-SA') : 'غير محدد',
            gender: e.gender || 'غير محدد',
            maritalStatus: e.maritalStatus || 'غير محدد',
            nationality: e.nationality || 'غير محدد',
            emergencyContact: e.emergencyContact || {},
            leaveBalance: e.leaveBalance || {},
            documents: e.documents || [],
            notes: e.notes || '',
        }
    }, [employeeData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفون', href: '/dashboard/hr/employees', isActive: true },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-3 py-1">نشط</Badge>
            case 'inactive':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-3 py-1">غير نشط</Badge>
            case 'on_leave':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-md px-3 py-1">في إجازة</Badge>
            case 'probation':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-3 py-1">تحت التجربة</Badge>
            case 'terminated':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-3 py-1">منتهي</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-3 py-1">{status}</Badge>
        }
    }

    return (
        <>
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

                {/* Loading State */}
                {isLoading && (
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات الموظف</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !employee && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-emerald-500" />
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
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && employee && (
                    <>
                        {/* Employee Hero Content */}
                        <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                                <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                                {/* Back Button and Main Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/employees">
                                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                            {employee.employeeId}
                                        </Badge>
                                        {getStatusBadge(employee.status)}
                                    </div>

                                    <div className="flex items-center gap-6 mb-6">
                                        <Avatar className="h-24 w-24 border-4 border-white/20">
                                            <AvatarImage src={employee.avatar} alt={employee.fullName} />
                                            <AvatarFallback className="bg-emerald-500 text-white text-2xl font-bold">
                                                {employee.fullName.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2 leading-tight text-white">
                                                {employee.fullName}
                                            </h1>
                                            <p className="text-emerald-200 text-lg">{employee.position} - {employee.department}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-emerald-400" />
                                            <span>{employee.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-emerald-400" />
                                            <span>{employee.phone || 'غير محدد'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-emerald-400" />
                                            <span>تاريخ التعيين: <span className="text-white font-medium">{employee.hireDate}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-4 min-w-[250px]">
                                    <div className="flex gap-3">
                                        <Link to={`/dashboard/hr/employees/${employeeId}/edit` as any}>
                                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                                <Edit3 className="h-4 w-4 ml-2" />
                                                تعديل
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-0">
                                                    تغيير الحالة
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                                                    نشط
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange('inactive')}>
                                                    غير نشط
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange('on_leave')}>
                                                    في إجازة
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange('probation')}>
                                                    تحت التجربة
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                            <LinkIcon className="h-4 w-4 ml-2" />
                                            نسخ الرابط
                                        </Button>
                                        {!showDeleteConfirm ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                                            >
                                                <Trash2 className="h-4 w-4 ml-2" />
                                                حذف
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="border-white/10 text-white hover:bg-white/10"
                                                >
                                                    إلغاء
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleDelete}
                                                    disabled={deleteEmployeeMutation.isPending}
                                                    className="bg-red-500 hover:bg-red-600"
                                                >
                                                    {deleteEmployeeMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'تأكيد الحذف'
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Salary Info Card */}
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-300">الراتب الأساسي</span>
                                            <DollarSign className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-400">
                                            {employee.salary.toLocaleString()} {employee.salaryCurrency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAIN CONTENT GRID */}
                        <div className="max-w-[1600px] mx-auto pb-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Main Content */}
                                <div className="lg:col-span-2">
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="border-b border-slate-100 px-6 pt-4">
                                                <TabsList className="bg-transparent h-auto p-0 gap-6">
                                                    {['overview', 'leaves', 'documents', 'notes'].map((tab) => (
                                                        <TabsTrigger
                                                            key={tab}
                                                            value={tab}
                                                            className="
                                                                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                                                data-[state=active]:border-b-2 data-[state=active]:border-emerald-500
                                                                data-[state=active]:text-emerald-600
                                                                text-slate-500 font-medium text-base pb-4 rounded-none px-2
                                                            "
                                                        >
                                                            {tab === 'overview' ? 'نظرة عامة' :
                                                                tab === 'leaves' ? 'الإجازات' :
                                                                    tab === 'documents' ? 'المستندات' : 'ملاحظات'}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                            </div>

                                            <div className="p-6 bg-slate-50/50 min-h-[500px]">
                                                <TabsContent value="overview" className="mt-0 space-y-6">
                                                    {/* Personal Info */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                                <User className="w-5 h-5 text-emerald-500" />
                                                                المعلومات الشخصية
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الاسم الأول</span>
                                                                    <p className="font-medium text-slate-900">{employee.firstName}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الاسم الأخير</span>
                                                                    <p className="font-medium text-slate-900">{employee.lastName}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">تاريخ الميلاد</span>
                                                                    <p className="font-medium text-slate-900">{employee.dateOfBirth}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الجنس</span>
                                                                    <p className="font-medium text-slate-900">{employee.gender === 'male' ? 'ذكر' : employee.gender === 'female' ? 'أنثى' : employee.gender}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الجنسية</span>
                                                                    <p className="font-medium text-slate-900">{employee.nationality}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الحالة الاجتماعية</span>
                                                                    <p className="font-medium text-slate-900">{employee.maritalStatus}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">رقم الهوية الوطنية</span>
                                                                    <p className="font-medium text-slate-900">{employee.nationalId || 'غير محدد'}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Work Info */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                                                معلومات العمل
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <span className="text-sm text-slate-500">القسم</span>
                                                                    <p className="font-medium text-slate-900">{employee.department}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">المسمى الوظيفي</span>
                                                                    <p className="font-medium text-slate-900">{employee.position}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">تاريخ التعيين</span>
                                                                    <p className="font-medium text-slate-900">{employee.hireDate}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">المدير المباشر</span>
                                                                    <p className="font-medium text-slate-900">{employee.manager?.name || 'غير محدد'}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Emergency Contact */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                                <Phone className="w-5 h-5 text-emerald-500" />
                                                                جهة الاتصال في حالات الطوارئ
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <span className="text-sm text-slate-500">الاسم</span>
                                                                    <p className="font-medium text-slate-900">{employee.emergencyContact?.name || 'غير محدد'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">صلة القرابة</span>
                                                                    <p className="font-medium text-slate-900">{employee.emergencyContact?.relationship || 'غير محدد'}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500">رقم الهاتف</span>
                                                                    <p className="font-medium text-slate-900">{employee.emergencyContact?.phone || 'غير محدد'}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="leaves" className="mt-0">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg font-bold text-navy">رصيد الإجازات</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                                                    <p className="text-sm text-emerald-600 mb-1">إجازة سنوية</p>
                                                                    <p className="text-2xl font-bold text-emerald-700">{employee.leaveBalance?.annual || 0} يوم</p>
                                                                </div>
                                                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                                                    <p className="text-sm text-blue-600 mb-1">إجازة مرضية</p>
                                                                    <p className="text-2xl font-bold text-blue-700">{employee.leaveBalance?.sick || 0} يوم</p>
                                                                </div>
                                                                <div className="bg-amber-50 rounded-xl p-4 text-center">
                                                                    <p className="text-sm text-amber-600 mb-1">إجازة شخصية</p>
                                                                    <p className="text-2xl font-bold text-amber-700">{employee.leaveBalance?.personal || 0} يوم</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="documents" className="mt-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {/* Upload New Card */}
                                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group h-[180px]">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 mb-3 transition-colors">
                                                                <Upload className="h-6 w-6" />
                                                            </div>
                                                            <span className="font-bold text-slate-600 group-hover:text-emerald-600">رفع مستند جديد</span>
                                                            <span className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG</span>
                                                        </div>

                                                        {/* Document Cards */}
                                                        {employee.documents.map((doc: any, i: number) => (
                                                            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-100">
                                                                        {doc.type?.toUpperCase() || 'DOC'}
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>
                                                                                <Eye className="h-4 w-4 ml-2" /> معاينة
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Download className="h-4 w-4 ml-2" /> تحميل
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-navy text-sm mb-1 line-clamp-1" title={doc.name}>{doc.name}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                        <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ar-SA') : ''}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="pt-3 border-t border-slate-50 flex gap-2">
                                                                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">معاينة</Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600">
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {employee.documents.length === 0 && (
                                                            <div className="col-span-2 bg-slate-50 rounded-2xl p-8 text-center">
                                                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                                <p className="text-slate-500">لا توجد مستندات مرفقة</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="notes" className="mt-0">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardContent className="p-6">
                                                            <p className="text-slate-600 leading-relaxed">
                                                                {employee.notes || 'لا توجد ملاحظات'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <HRSidebar context="employees" />
                            </div>
                        </div>
                    </>
                )}
            </Main>
        </>
    )
}
