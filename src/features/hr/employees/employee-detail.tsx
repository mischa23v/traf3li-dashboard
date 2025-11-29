import { useState } from 'react'
import {
    ArrowRight, Edit3, Trash2, Loader2, Mail, Phone,
    Building2, Calendar, DollarSign, User, Briefcase,
    MapPin, CreditCard, Clock, FileText, Award, Bell, AlertCircle
} from 'lucide-react'
import { useEmployee, useDeleteEmployee, useUpdateEmployeeStatus } from '@/hooks/useHR'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HRSidebar } from '../components/hr-sidebar'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

function EmployeeDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-emerald-950 rounded-3xl p-8">
                <div className="flex items-start gap-6">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
            </div>
        </div>
    )
}

export function EmployeeDetail() {
    const { employeeId } = useParams({ from: '/_authenticated/dashboard/hr/employees/$employeeId' })
    const navigate = useNavigate()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: employee, isLoading, error } = useEmployee(employeeId)
    const deleteMutation = useDeleteEmployee()
    const updateStatusMutation = useUpdateEmployeeStatus()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(employeeId)
            toast({ title: 'تم حذف الموظف بنجاح' })
            navigate({ to: '/dashboard/hr/employees' })
        } catch {
            toast({ title: 'فشل في حذف الموظف', variant: 'destructive' })
        }
    }

    const handleStatusChange = async (status: 'active' | 'inactive' | 'on_leave' | 'terminated') => {
        try {
            await updateStatusMutation.mutateAsync({ id: employeeId, status })
            toast({ title: 'تم تحديث حالة الموظف' })
        } catch {
            toast({ title: 'فشل في تحديث الحالة', variant: 'destructive' })
        }
    }

    const statusConfig = {
        active: { label: 'نشط', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        inactive: { label: 'غير نشط', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        on_leave: { label: 'في إجازة', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        terminated: { label: 'منتهي', color: 'bg-red-500/10 text-red-600 border-red-200' },
        probation: { label: 'تحت التجربة', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    return (
        <>
            <Header>
                <TopNav links={topLinks} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <DynamicIsland>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-600">تفاصيل الموظف</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {isLoading ? (
                        <EmployeeDetailSkeleton />
                    ) : error || !employee ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                            <p className="text-red-600 mt-1">لم يتم العثور على الموظف</p>
                            <Link to="/dashboard/hr/employees">
                                <Button className="mt-4">العودة للقائمة</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Hero Card */}
                            <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-transparent to-teal-900/30" />
                                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/employees">
                                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-20 h-20 ring-4 ring-white/20 shadow-xl">
                                                    <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold">
                                                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h2 className="text-3xl font-bold">{employee.firstName} {employee.lastName}</h2>
                                                    <p className="text-white/60 mt-1">{employee.position}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className={cn("font-medium border-white/20 text-white", statusConfig[employee.status]?.color)}>
                                                            {statusConfig[employee.status]?.label}
                                                        </Badge>
                                                        <span className="text-white/50 text-sm">{employee.employeeId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/dashboard/hr/employees/${employeeId}/edit`}>
                                                <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2">
                                                    <Edit3 className="w-4 h-4" />
                                                    تعديل
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white rounded-xl">
                                                        المزيد
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                                                        تعيين كنشط
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('on_leave')}>
                                                        تعيين في إجازة
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange('inactive')}>
                                                        تعيين غير نشط
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setShowDeleteDialog(true)}
                                                    >
                                                        <Trash2 className="w-4 h-4 ml-2" />
                                                        حذف الموظف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-4 gap-4 mt-6">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/60">القسم</p>
                                                    <p className="font-semibold text-white">{employee.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/60">تاريخ التعيين</p>
                                                    <p className="font-semibold text-white">
                                                        {employee.hireDate ? format(parseISO(employee.hireDate), 'd MMM yyyy', { locale: ar }) : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/60">الراتب الأساسي</p>
                                                    <p className="font-semibold text-white">{formatCurrency(employee.baseSalary || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white/60">رصيد الإجازات</p>
                                                    <p className="font-semibold text-white">{employee.annualLeaveBalance || 0} يوم</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                <div className="lg:col-span-2">
                                    <Tabs defaultValue="info" className="w-full">
                                        <TabsList className="bg-white/10 rounded-xl p-1 mb-4">
                                            <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-900">
                                                المعلومات الشخصية
                                            </TabsTrigger>
                                            <TabsTrigger value="employment" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-900">
                                                بيانات التوظيف
                                            </TabsTrigger>
                                            <TabsTrigger value="salary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-900">
                                                البيانات المالية
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="info" className="space-y-4">
                                            <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <User className="w-5 h-5 text-emerald-600" />
                                                        المعلومات الشخصية
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500">الاسم الكامل</p>
                                                        <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">البريد الإلكتروني</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            {employee.email}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">رقم الهاتف</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-slate-400" />
                                                            {employee.phone || employee.mobile || '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">رقم الهوية</p>
                                                        <p className="font-medium">{employee.nationalId || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">تاريخ الميلاد</p>
                                                        <p className="font-medium">
                                                            {employee.dateOfBirth ? format(parseISO(employee.dateOfBirth), 'd MMM yyyy', { locale: ar }) : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">الجنسية</p>
                                                        <p className="font-medium">{employee.nationality || '-'}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-sm text-slate-500">العنوان</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-slate-400" />
                                                            {employee.address || '-'} {employee.city && `, ${employee.city}`}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="employment" className="space-y-4">
                                            <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Briefcase className="w-5 h-5 text-emerald-600" />
                                                        بيانات التوظيف
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500">رقم الموظف</p>
                                                        <p className="font-medium">{employee.employeeId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">القسم</p>
                                                        <p className="font-medium">{employee.department}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">المسمى الوظيفي</p>
                                                        <p className="font-medium">{employee.position}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">نوع التوظيف</p>
                                                        <p className="font-medium">
                                                            {employee.employeeType === 'full_time' && 'دوام كامل'}
                                                            {employee.employeeType === 'part_time' && 'دوام جزئي'}
                                                            {employee.employeeType === 'contractor' && 'متعاقد'}
                                                            {employee.employeeType === 'intern' && 'متدرب'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">تاريخ التعيين</p>
                                                        <p className="font-medium">
                                                            {employee.hireDate ? format(parseISO(employee.hireDate), 'd MMM yyyy', { locale: ar }) : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">المدير المباشر</p>
                                                        <p className="font-medium">{employee.manager || '-'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="salary" className="space-y-4">
                                            <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                                        البيانات المالية
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500">الراتب الأساسي</p>
                                                        <p className="font-medium text-lg">{formatCurrency(employee.baseSalary || 0)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">بدل السكن</p>
                                                        <p className="font-medium">{formatCurrency(employee.housingAllowance || 0)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">بدل المواصلات</p>
                                                        <p className="font-medium">{formatCurrency(employee.transportAllowance || 0)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">بدلات أخرى</p>
                                                        <p className="font-medium">{formatCurrency(employee.otherAllowances || 0)}</p>
                                                    </div>
                                                    <div className="col-span-2 border-t pt-4">
                                                        <p className="text-sm text-slate-500">البيانات البنكية</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <CreditCard className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium">{employee.bankName || '-'}</span>
                                                            {employee.iban && <span className="text-slate-500">({employee.iban})</span>}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="lg:col-span-1">
                                    <HRSidebar context="employees" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Main>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا الموظف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف جميع بيانات الموظف بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
