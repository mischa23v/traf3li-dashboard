import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
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
import { useSalarySlip, useDeleteSalarySlip, useApproveSalarySlip, useMarkAsPaid } from '@/hooks/usePayroll'
import {
    Search, Bell, AlertCircle, User, Wallet, Calendar, CreditCard, FileText,
    AlertTriangle, Trash2, Loader2, DollarSign, Clock, CheckCircle, XCircle,
    Download, Send, Edit3, TrendingDown, TrendingUp, Building2, Printer, Lock
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import type { PaymentStatus } from '@/services/payrollService'

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

export function PayrollDetailsView() {
    const { slipId } = useParams({ strict: false }) as { slipId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch salary slip data
    const { data: slipData, isLoading, isError, error, refetch } = useSalarySlip(slipId)

    // Mutations
    const deleteSlipMutation = useDeleteSalarySlip()
    const approveSlipMutation = useApproveSalarySlip()
    const markAsPaidMutation = useMarkAsPaid()

    // Handle delete
    const handleDelete = () => {
        deleteSlipMutation.mutate(slipId, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.hr.payroll.list })
            }
        })
    }

    // Handle approve
    const handleApprove = () => {
        approveSlipMutation.mutate(slipId)
    }

    // Handle mark as paid
    const handleMarkAsPaid = () => {
        markAsPaidMutation.mutate({ id: slipId })
    }

    // Format date helper
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'd MMMM yyyy', { locale: arSA })
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-SA') + ' ر.س'
    }

    // Status badge styling
    const getStatusBadge = (status: PaymentStatus) => {
        const styles: Record<PaymentStatus, string> = {
            draft: 'bg-slate-100 text-slate-700',
            approved: 'bg-blue-100 text-blue-700',
            processing: 'bg-amber-100 text-amber-700',
            paid: 'bg-emerald-100 text-emerald-700',
            failed: 'bg-red-100 text-red-700',
            cancelled: 'bg-slate-100 text-slate-500',
        }
        const labels: Record<PaymentStatus, string> = {
            draft: 'مسودة',
            approved: 'معتمد',
            processing: 'قيد المعالجة',
            paid: 'مدفوع',
            failed: 'فشل',
            cancelled: 'ملغي',
        }
        const icons: Record<PaymentStatus, React.ReactNode> = {
            draft: <FileText className="w-4 h-4" aria-hidden="true" />,
            approved: <CheckCircle className="w-4 h-4" />,
            processing: <Clock className="w-4 h-4" aria-hidden="true" />,
            paid: <CheckCircle className="w-4 h-4" />,
            failed: <XCircle className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />,
        }
        return (
            <Badge className={`${styles[status]} border-0 rounded-md px-3 py-1 flex items-center gap-1`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        )
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
        { title: 'قسائم الرواتب', href: ROUTES.dashboard.hr.payroll.list, isActive: true },
    ]

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
                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات القسيمة</h3>
                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !slipData && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">القسيمة غير موجودة</h3>
                        <p className="text-slate-500 mb-4">لم يتم العثور على قسيمة الراتب المطلوبة</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to={ROUTES.dashboard.hr.payroll.list}>
                                العودة إلى القائمة
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && slipData && (
                    <>
                        {/* HERO CARD */}
                        <ProductivityHero
                            badge="قسيمة راتب"
                            title={`${slipData.employeeNameAr || slipData.employeeName} - ${MONTHS.find(m => m.value === slipData.payPeriod.month)?.label} ${slipData.payPeriod.year}`}
                            type="payroll"
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
                                                {['overview', 'earnings', 'deductions', 'payment'].map((tab) => (
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
                                                            tab === 'earnings' ? 'الاستحقاقات' :
                                                            tab === 'deductions' ? 'الخصومات' : 'الدفع'}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                                            {/* Overview Tab */}
                                            <TabsContent value="overview" className="mt-0 space-y-6">
                                                {/* Slip Header Card */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                                                <Wallet className="w-10 h-10 text-emerald-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h2 className="text-2xl font-bold text-navy">{slipData.employeeNameAr || slipData.employeeName}</h2>
                                                                    {getStatusBadge(slipData.payment.status)}
                                                                </div>
                                                                <p className="text-lg text-slate-600">{slipData.jobTitle}</p>
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    رقم القسيمة: {slipData.slipNumber} • {slipData.employeeNumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Period & Net Pay Summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                                فترة الراتب
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الشهر</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {MONTHS.find(m => m.value === slipData.payPeriod.month)?.label} {slipData.payPeriod.year}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">أيام العمل</span>
                                                                <span className="font-medium text-slate-900">{slipData.payPeriod.workingDays} يوم</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">أيام الحضور</span>
                                                                <span className="font-medium text-slate-900">{slipData.payPeriod.daysWorked} يوم</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">تاريخ الدفع</span>
                                                                <span className="font-medium text-slate-900">{formatDate(slipData.payPeriod.paymentDate)}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100">
                                                        <CardContent className="p-6">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <span className="text-sm text-emerald-700 block">صافي الراتب</span>
                                                                    <span className="text-3xl font-bold text-emerald-800">
                                                                        {formatCurrency(slipData.netPay)}
                                                                    </span>
                                                                </div>
                                                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                                                    <DollarSign className="w-8 h-8 text-emerald-600" />
                                                                </div>
                                                            </div>
                                                            {slipData.netPayInWordsAr && (
                                                                <p className="text-sm text-emerald-600 mt-3">
                                                                    {slipData.netPayInWordsAr}
                                                                </p>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Quick Summary */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="grid grid-cols-3 gap-6 text-center">
                                                            <div className="bg-emerald-50 rounded-xl p-4">
                                                                <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" aria-hidden="true" />
                                                                <div className="text-2xl font-bold text-emerald-700">
                                                                    {formatCurrency(slipData.earnings.totalEarnings)}
                                                                </div>
                                                                <div className="text-xs text-emerald-600">إجمالي الاستحقاقات</div>
                                                            </div>
                                                            <div className="bg-red-50 rounded-xl p-4">
                                                                <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                                                <div className="text-2xl font-bold text-red-700">
                                                                    {formatCurrency(slipData.deductions.totalDeductions)}
                                                                </div>
                                                                <div className="text-xs text-red-600">إجمالي الخصومات</div>
                                                            </div>
                                                            <div className="bg-blue-50 rounded-xl p-4">
                                                                <Wallet className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                                                <div className="text-2xl font-bold text-blue-700">
                                                                    {formatCurrency(slipData.netPay)}
                                                                </div>
                                                                <div className="text-xs text-blue-600">صافي الراتب</div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Earnings Tab */}
                                            <TabsContent value="earnings" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                                            الراتب الأساسي<Lock className="h-3 w-3 text-foreground/70 inline ms-1" />
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl font-bold text-navy">
                                                            {formatCurrency(slipData.earnings.basicSalary)}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                            البدلات
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        {slipData.earnings.allowances?.map((allowance, idx) => (
                                                            <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                                                                <span className="text-slate-600">{allowance.nameAr || allowance.name}</span>
                                                                <span className="font-medium text-slate-900">{formatCurrency(allowance.amount)}</span>
                                                            </div>
                                                        ))}
                                                        {(!slipData.earnings.allowances || slipData.earnings.allowances.length === 0) && (
                                                            <p className="text-slate-500 text-center py-4">لا توجد بدلات</p>
                                                        )}
                                                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                                                            <span>إجمالي البدلات</span>
                                                            <span className="text-emerald-600">{formatCurrency(slipData.earnings.totalAllowances)}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {slipData.earnings.overtime && (
                                                    <Card className="border-none shadow-sm bg-purple-50 rounded-2xl overflow-hidden border border-purple-100">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-purple-800 flex items-center gap-2">
                                                                <Clock className="w-4 h-4" aria-hidden="true" />
                                                                العمل الإضافي
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                                <div>
                                                                    <div className="text-lg font-bold text-purple-700">{slipData.earnings.overtime.hours}</div>
                                                                    <div className="text-xs text-purple-600">ساعات</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-lg font-bold text-purple-700">{slipData.earnings.overtime.rate}x</div>
                                                                    <div className="text-xs text-purple-600">معامل</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-lg font-bold text-purple-700">{formatCurrency(slipData.earnings.overtime.amount)}</div>
                                                                    <div className="text-xs text-purple-600">المبلغ</div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-emerald-800">إجمالي الاستحقاقات</span>
                                                            <span className="text-2xl font-bold text-emerald-700">
                                                                {formatCurrency(slipData.earnings.totalEarnings)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Deductions Tab */}
                                            <TabsContent value="deductions" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-blue-50 rounded-2xl overflow-hidden border border-blue-100">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-blue-800 flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                                            التأمينات الاجتماعية (GOSI)
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl font-bold text-blue-700">
                                                            {formatCurrency(slipData.deductions.gosi)}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                                            خصومات أخرى
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2">
                                                        {slipData.deductions.loans && slipData.deductions.loans > 0 && (
                                                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                                                <span className="text-slate-600">سداد قرض</span>
                                                                <span className="font-medium text-red-600">{formatCurrency(slipData.deductions.loans)}</span>
                                                            </div>
                                                        )}
                                                        {slipData.deductions.advances && slipData.deductions.advances > 0 && (
                                                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                                                <span className="text-slate-600">استرداد سلفة</span>
                                                                <span className="font-medium text-red-600">{formatCurrency(slipData.deductions.advances)}</span>
                                                            </div>
                                                        )}
                                                        {slipData.deductions.absences && slipData.deductions.absences > 0 && (
                                                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                                                <span className="text-slate-600">خصم غياب</span>
                                                                <span className="font-medium text-red-600">{formatCurrency(slipData.deductions.absences)}</span>
                                                            </div>
                                                        )}
                                                        {slipData.deductions.lateDeductions && slipData.deductions.lateDeductions > 0 && (
                                                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                                                <span className="text-slate-600">خصم تأخير</span>
                                                                <span className="font-medium text-red-600">{formatCurrency(slipData.deductions.lateDeductions)}</span>
                                                            </div>
                                                        )}
                                                        {slipData.deductions.violations && slipData.deductions.violations > 0 && (
                                                            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                                                                <span className="text-slate-600">مخالفات</span>
                                                                <span className="font-medium text-red-600">{formatCurrency(slipData.deductions.violations)}</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-sm bg-red-50 rounded-2xl overflow-hidden border border-red-100">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-red-800">إجمالي الخصومات</span>
                                                            <span className="text-2xl font-bold text-red-700">
                                                                {formatCurrency(slipData.deductions.totalDeductions)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Payment Tab */}
                                            <TabsContent value="payment" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-purple-600" />
                                                            تفاصيل الدفع
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">الحالة</span>
                                                                {getStatusBadge(slipData.payment.status)}
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">طريقة الدفع</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {slipData.payment.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                                                                     slipData.payment.paymentMethod === 'cash' ? 'نقدي' : 'شيك'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {slipData.payment.bankName && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">اسم البنك</span>
                                                                    <span className="font-medium text-slate-900">{slipData.payment.bankName}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-slate-500 block">رقم الآيبان<Lock className="h-3 w-3 text-foreground/70 inline ms-1" /></span>
                                                                    <span className="font-medium text-slate-900" dir="ltr">{slipData.payment.iban}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {slipData.payment.paidOn && (
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">تاريخ الدفع</span>
                                                                <span className="font-medium text-slate-900">{formatDate(slipData.payment.paidOn)}</span>
                                                            </div>
                                                        )}
                                                        {slipData.payment.transactionReference && (
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">رقم المرجع</span>
                                                                <span className="font-medium text-slate-900">{slipData.payment.transactionReference}</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Action Buttons */}
                                                {slipData.payment.status !== 'paid' && slipData.payment.status !== 'cancelled' && (
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardContent className="p-6">
                                                            <h4 className="font-bold text-navy mb-4">الإجراءات</h4>
                                                            <div className="flex flex-wrap gap-3">
                                                                {slipData.payment.status === 'draft' && (
                                                                    <Button
                                                                        onClick={handleApprove}
                                                                        disabled={approveSlipMutation.isPending}
                                                                        className="bg-blue-500 hover:bg-blue-600"
                                                                    >
                                                                        {approveSlipMutation.isPending ? (
                                                                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle className="w-4 h-4 ms-2" />
                                                                        )}
                                                                        اعتماد
                                                                    </Button>
                                                                )}
                                                                {(slipData.payment.status === 'approved' || slipData.payment.status === 'processing') && (
                                                                    <Button
                                                                        onClick={handleMarkAsPaid}
                                                                        disabled={markAsPaidMutation.isPending}
                                                                        className="bg-emerald-500 hover:bg-emerald-600"
                                                                    >
                                                                        {markAsPaidMutation.isPending ? (
                                                                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                                                        ) : (
                                                                            <DollarSign className="w-4 h-4 ms-2" />
                                                                        )}
                                                                        تأكيد الدفع
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            </div>

                            {/* LEFT SIDEBAR */}
                            <HRSidebar
                                context="payroll"
                                slipId={slipId}
                                onDeleteSlip={() => setShowDeleteConfirm(true)}
                                isDeletePending={deleteSlipMutation.isPending}
                            />
                        </div>
                    </>
                )}
            </Main>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && slipData && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                            هل أنت متأكد من حذف هذه القسيمة؟
                        </h3>
                        <p className="text-slate-500 text-center mb-6">
                            سيتم حذف قسيمة راتب "{slipData.slipNumber}" نهائياً ولا يمكن استرجاعها.
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
                                disabled={deleteSlipMutation.isPending}
                                className="px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleteSlipMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حذف القسيمة
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
