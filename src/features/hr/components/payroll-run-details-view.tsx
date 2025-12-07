import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
    usePayrollRun,
    useCalculatePayrollRun,
    useValidatePayrollRun,
    useApprovePayrollRun,
    useProcessPayments,
    useCancelPayrollRun,
    useGenerateWPSFile,
    useSendPayslipNotifications,
} from '@/hooks/usePayrollRun'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
    Search, Bell, ArrowRight, AlertCircle, Calendar, Building2, Users,
    ChevronDown, Clock, FileText, Calculator, DollarSign, CheckCircle, XCircle,
    Play, RefreshCw, CreditCard, Download, Send, Trash2, MoreHorizontal,
    TrendingUp, TrendingDown, Minus, Eye, PauseCircle, Ban, Wallet,
    FileSpreadsheet, Building, Banknote
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PayrollRunStatus, PayrollRunEmployee } from '@/services/payrollRunService'

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

export function PayrollRunDetailsView() {
    const navigate = useNavigate()
    const { runId } = useParams({ from: '/_authenticated/dashboard/hr/payroll-runs/$runId' })

    // Fetch payroll run
    const { data: run, isLoading, isError, error } = usePayrollRun(runId)

    // Mutations
    const calculateMutation = useCalculatePayrollRun()
    const validateMutation = useValidatePayrollRun()
    const approveMutation = useApprovePayrollRun()
    const processPaymentsMutation = useProcessPayments()
    const cancelMutation = useCancelPayrollRun()
    const generateWPSMutation = useGenerateWPSFile()
    const sendNotificationsMutation = useSendPayslipNotifications()

    // Dialog states
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [approveComments, setApproveComments] = useState('')

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount?.toLocaleString('ar-SA') + ' ر.س'
    }

    // Status badge styling
    const getStatusBadge = (status: PayrollRunStatus) => {
        const styles: Record<PayrollRunStatus, string> = {
            draft: 'bg-slate-100 text-slate-700',
            calculating: 'bg-blue-100 text-blue-700',
            calculated: 'bg-purple-100 text-purple-700',
            approved: 'bg-emerald-100 text-emerald-700',
            processing_payment: 'bg-amber-100 text-amber-700',
            paid: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-500',
        }
        const labels: Record<PayrollRunStatus, string> = {
            draft: 'مسودة',
            calculating: 'جاري الحساب',
            calculated: 'تم الحساب',
            approved: 'معتمد',
            processing_payment: 'جاري الدفع',
            paid: 'مدفوع',
            cancelled: 'ملغي',
        }
        const icons: Record<PayrollRunStatus, React.ReactNode> = {
            draft: <FileText className="w-3 h-3" />,
            calculating: <RefreshCw className="w-3 h-3 animate-spin" />,
            calculated: <CheckCircle className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            processing_payment: <Clock className="w-3 h-3" />,
            paid: <CreditCard className="w-3 h-3" />,
            cancelled: <XCircle className="w-3 h-3" />,
        }
        return (
            <Badge className={`${styles[status]} border-0 rounded-lg px-3 py-1 flex items-center gap-1 text-sm`}>
                {icons[status]}
                {labels[status]}
            </Badge>
        )
    }

    // Employee status badge
    const getEmployeeStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-slate-100 text-slate-600',
            calculating: 'bg-blue-100 text-blue-600',
            calculated: 'bg-purple-100 text-purple-600',
            approved: 'bg-emerald-100 text-emerald-600',
            paid: 'bg-green-100 text-green-600',
            failed: 'bg-red-100 text-red-600',
            on_hold: 'bg-amber-100 text-amber-600',
        }
        const labels: Record<string, string> = {
            pending: 'معلق',
            calculating: 'جاري الحساب',
            calculated: 'تم الحساب',
            approved: 'معتمد',
            paid: 'مدفوع',
            failed: 'فشل',
            on_hold: 'موقف',
        }
        return (
            <Badge className={`${styles[status] || 'bg-slate-100 text-slate-600'} border-0 rounded-md px-2 text-xs`}>
                {labels[status] || status}
            </Badge>
        )
    }

    // Action handlers
    const handleCalculate = () => {
        calculateMutation.mutate(runId)
    }

    const handleValidate = () => {
        validateMutation.mutate(runId)
    }

    const handleApprove = () => {
        approveMutation.mutate({ runId, comments: approveComments }, {
            onSuccess: () => {
                setShowApproveDialog(false)
                setApproveComments('')
            }
        })
    }

    const handleProcessPayments = () => {
        processPaymentsMutation.mutate(runId)
    }

    const handleCancel = () => {
        cancelMutation.mutate({ runId, reason: cancelReason }, {
            onSuccess: () => {
                setShowCancelDialog(false)
                setCancelReason('')
            }
        })
    }

    const handleGenerateWPS = () => {
        generateWPSMutation.mutate(runId)
    }

    const handleSendNotifications = () => {
        sendNotificationsMutation.mutate(runId)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'قسائم الرواتب', href: '/dashboard/hr/payroll', isActive: false },
        { title: 'دورات الرواتب', href: '/dashboard/hr/payroll-runs', isActive: true },
    ]

    // Loading state
    if (isLoading) {
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
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32 rounded-2xl" />
                            ))}
                        </div>
                        <Skeleton className="h-96 rounded-2xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error state
    if (isError || !run) {
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
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">لم يتم العثور على الدورة</h2>
                        <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل بيانات الدورة'}</p>
                        <Button onClick={() => navigate({ to: '/dashboard/hr/payroll-runs' })} className="bg-emerald-500 hover:bg-emerald-600">
                            العودة للقائمة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // Calculate progress percentage
    const progressPercentage = run.employees.totalEmployees > 0
        ? (run.employees.processedEmployees / run.employees.totalEmployees) * 100
        : 0

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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-white"
                            onClick={() => navigate({ to: '/dashboard/hr/payroll-runs' })}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-navy">{run.runNameAr || run.runName}</h1>
                                {getStatusBadge(run.status)}
                            </div>
                            <p className="text-slate-500">
                                {run.runNumber} • {MONTHS.find(m => m.value === run.payPeriod.month)?.label} {run.payPeriod.year}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Action buttons based on status */}
                        {run.status === 'draft' && (
                            <Button
                                onClick={handleCalculate}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                disabled={calculateMutation.isPending}
                            >
                                <Calculator className="w-4 h-4 ms-2" />
                                {calculateMutation.isPending ? 'جاري الحساب...' : 'حساب الرواتب'}
                            </Button>
                        )}
                        {run.status === 'calculated' && (
                            <>
                                <Button
                                    onClick={handleValidate}
                                    variant="outline"
                                    className="rounded-xl"
                                    disabled={validateMutation.isPending}
                                >
                                    <CheckCircle className="w-4 h-4 ms-2" />
                                    تحقق
                                </Button>
                                <Button
                                    onClick={() => setShowApproveDialog(true)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                >
                                    <CheckCircle className="w-4 h-4 ms-2" />
                                    اعتماد
                                </Button>
                            </>
                        )}
                        {run.status === 'approved' && (
                            <>
                                <Button
                                    onClick={handleGenerateWPS}
                                    variant="outline"
                                    className="rounded-xl"
                                    disabled={generateWPSMutation.isPending}
                                >
                                    <FileSpreadsheet className="w-4 h-4 ms-2" />
                                    إنشاء ملف WPS
                                </Button>
                                <Button
                                    onClick={handleProcessPayments}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                    disabled={processPaymentsMutation.isPending}
                                >
                                    <CreditCard className="w-4 h-4 ms-2" />
                                    {processPaymentsMutation.isPending ? 'جاري المعالجة...' : 'معالجة الدفع'}
                                </Button>
                            </>
                        )}
                        {run.status === 'paid' && (
                            <Button
                                onClick={handleSendNotifications}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                disabled={sendNotificationsMutation.isPending}
                            >
                                <Send className="w-4 h-4 ms-2" />
                                {sendNotificationsMutation.isPending ? 'جاري الإرسال...' : 'إرسال القسائم'}
                            </Button>
                        )}

                        {/* More actions dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 ms-2" />
                                    تصدير التقرير
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileSpreadsheet className="h-4 w-4 ms-2" />
                                    تصدير Excel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {run.status !== 'paid' && run.status !== 'cancelled' && (
                                    <DropdownMenuItem
                                        onClick={() => setShowCancelDialog(true)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Ban className="h-4 w-4 ms-2" />
                                        إلغاء الدورة
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">الموظفين</p>
                                    <p className="text-2xl font-bold text-navy">{run.employees.totalEmployees}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">إجمالي الرواتب</p>
                                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(run.financialSummary.totalGrossPay)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                    <Minus className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">الخصومات</p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(run.financialSummary.totalDeductions)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">صافي الرواتب</p>
                                    <p className="text-xl font-bold text-purple-600">{formatCurrency(run.financialSummary.totalNetPay)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                {run.employees.totalEmployees > 0 && (
                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">تقدم المعالجة</span>
                                <span className="text-sm text-slate-500">
                                    {run.employees.processedEmployees} / {run.employees.totalEmployees} موظف
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="flex items-center gap-6 mt-3 text-xs">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    تم المعالجة: {run.employees.processedEmployees}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    معلق: {run.employees.pendingEmployees}
                                </span>
                                {run.employees.failedEmployees > 0 && (
                                    <span className="flex items-center gap-1 text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        فشل: {run.employees.failedEmployees}
                                    </span>
                                )}
                                {run.employees.onHoldEmployees > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600">
                                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                        موقف: {run.employees.onHoldEmployees}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white rounded-xl p-1 shadow-sm">
                        <TabsTrigger value="overview" className="rounded-lg">نظرة عامة</TabsTrigger>
                        <TabsTrigger value="employees" className="rounded-lg">الموظفين</TabsTrigger>
                        <TabsTrigger value="financial" className="rounded-lg">التفاصيل المالية</TabsTrigger>
                        <TabsTrigger value="breakdown" className="rounded-lg">التوزيع</TabsTrigger>
                        {run.wps && <TabsTrigger value="wps" className="rounded-lg">WPS</TabsTrigger>}
                        {run.paymentProcessing && <TabsTrigger value="payment" className="rounded-lg">الدفع</TabsTrigger>}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Period Info */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        معلومات الفترة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">الفترة</span>
                                        <span className="font-medium text-navy">
                                            {MONTHS.find(m => m.value === run.payPeriod.month)?.label} {run.payPeriod.year}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">بداية الفترة</span>
                                        <span className="font-medium text-navy">
                                            {new Date(run.payPeriod.periodStart).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">نهاية الفترة</span>
                                        <span className="font-medium text-navy">
                                            {new Date(run.payPeriod.periodEnd).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">تاريخ الدفع</span>
                                        <span className="font-medium text-emerald-600">
                                            {new Date(run.payPeriod.paymentDate).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-500">نوع التقويم</span>
                                        <span className="font-medium text-navy">
                                            {run.payPeriod.calendarType === 'hijri' ? 'هجري' : 'ميلادي'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Employee Summary */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-600" />
                                        ملخص الموظفين
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500">إجمالي الموظفين</span>
                                        <span className="font-bold text-navy text-lg">{run.employees.totalEmployees}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            تم المعالجة
                                        </span>
                                        <span className="font-medium text-emerald-600">{run.employees.processedEmployees}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            معلق
                                        </span>
                                        <span className="font-medium text-amber-600">{run.employees.pendingEmployees}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-slate-500 flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            فشل
                                        </span>
                                        <span className="font-medium text-red-600">{run.employees.failedEmployees}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate-500 flex items-center gap-2">
                                            <PauseCircle className="w-4 h-4 text-slate-500" />
                                            موقف
                                        </span>
                                        <span className="font-medium text-slate-600">{run.employees.onHoldEmployees}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Summary */}
                            <Card className="border-none shadow-sm bg-white rounded-2xl md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                        الملخص المالي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <div className="text-sm text-blue-600 mb-1">الراتب الأساسي</div>
                                            <div className="text-xl font-bold text-blue-800">
                                                {formatCurrency(run.financialSummary.totalBasicSalary)}
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                            <div className="text-sm text-emerald-600 mb-1">البدلات</div>
                                            <div className="text-xl font-bold text-emerald-800">
                                                {formatCurrency(run.financialSummary.totalAllowances)}
                                            </div>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-4 text-center">
                                            <div className="text-sm text-red-600 mb-1">التأمينات (موظف)</div>
                                            <div className="text-xl font-bold text-red-800">
                                                {formatCurrency(run.financialSummary.totalGOSI)}
                                            </div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                                            <div className="text-sm text-purple-600 mb-1">صافي الرواتب</div>
                                            <div className="text-xl font-bold text-purple-800">
                                                {formatCurrency(run.financialSummary.totalNetPay)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="text-amber-700">تكلفة صاحب العمل (تأمينات)</span>
                                            <span className="text-xl font-bold text-amber-800">
                                                {formatCurrency(run.financialSummary.totalEmployerGOSI)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Comparison with previous run */}
                        {run.comparison && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        مقارنة مع الدورة السابقة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-sm text-slate-500 mb-2">تغيير عدد الموظفين</div>
                                            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${run.comparison.employeeCountChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {run.comparison.employeeCountChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {run.comparison.employeeCountChange > 0 ? '+' : ''}{run.comparison.employeeCountChange}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-slate-500 mb-2">تغيير إجمالي الرواتب</div>
                                            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${run.comparison.grossPayChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {run.comparison.grossPayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {run.comparison.grossPayChangePercentage.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-slate-500 mb-2">تغيير صافي الرواتب</div>
                                            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${run.comparison.netPayChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {run.comparison.netPayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {run.comparison.netPayChangePercentage.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-slate-500 mb-2">الدورة السابقة</div>
                                            <div className="text-lg font-medium text-navy">{run.comparison.previousRunName}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Employees Tab */}
                    <TabsContent value="employees" className="space-y-4">
                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-600" />
                                        قائمة الموظفين
                                    </CardTitle>
                                    <Badge className="bg-slate-100 text-slate-600 border-0">
                                        {run.employeeList?.length || 0} موظف
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!run.employeeList || run.employeeList.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد موظفين بعد</h3>
                                        <p className="text-slate-500">قم بحساب الرواتب لعرض قائمة الموظفين</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {run.employeeList.map((employee) => (
                                            <div key={employee.employeeId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                        <span className="text-emerald-700 font-bold text-sm">
                                                            {(employee.employeeNameAr || employee.employeeName).charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-navy">
                                                                {employee.employeeNameAr || employee.employeeName}
                                                            </span>
                                                            {getEmployeeStatusBadge(employee.status)}
                                                            {employee.isNewJoiner && (
                                                                <Badge className="bg-blue-100 text-blue-600 border-0 text-xs">جديد</Badge>
                                                            )}
                                                            {employee.isProrated && (
                                                                <Badge className="bg-amber-100 text-amber-600 border-0 text-xs">نسبي</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-500">
                                                            {employee.employeeNumber} • {employee.department || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-start">
                                                        <div className="text-xs text-slate-400">إجمالي</div>
                                                        <div className="font-medium text-navy">{formatCurrency(employee.earnings.grossPay)}</div>
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-xs text-slate-400">خصومات</div>
                                                        <div className="font-medium text-red-600">{formatCurrency(employee.deductions.totalDeductions)}</div>
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-xs text-slate-400">صافي</div>
                                                        <div className="font-bold text-emerald-600">{formatCurrency(employee.netPay)}</div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Financial Details Tab */}
                    <TabsContent value="financial" className="space-y-6">
                        {run.financialBreakdown ? (
                            <>
                                {/* Earnings Breakdown */}
                                <Card className="border-none shadow-sm bg-white rounded-2xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                                            تفاصيل الأرباح
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-500">الراتب الأساسي</div>
                                                    <div className="text-lg font-bold text-navy">
                                                        {formatCurrency(run.financialBreakdown.earnings.totalBasicSalary)}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-500">بدل السكن</div>
                                                    <div className="text-lg font-bold text-navy">
                                                        {formatCurrency(run.financialBreakdown.earnings.allowancesBreakdown.housingAllowance)}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-500">بدل المواصلات</div>
                                                    <div className="text-lg font-bold text-navy">
                                                        {formatCurrency(run.financialBreakdown.earnings.allowancesBreakdown.transportationAllowance)}
                                                    </div>
                                                </div>
                                            </div>
                                            {run.financialBreakdown.earnings.variablePayBreakdown.totalOvertime > 0 && (
                                                <div className="p-4 bg-emerald-50 rounded-xl">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm text-emerald-600">الأوفرتايم</div>
                                                            <div className="text-xs text-emerald-500">
                                                                {run.financialBreakdown.earnings.variablePayBreakdown.overtimeHours} ساعة
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-bold text-emerald-700">
                                                            {formatCurrency(run.financialBreakdown.earnings.variablePayBreakdown.totalOvertime)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Deductions Breakdown */}
                                <Card className="border-none shadow-sm bg-white rounded-2xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                            تفاصيل الخصومات
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* GOSI */}
                                            <div className="p-4 bg-red-50 rounded-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-red-700">التأمينات الاجتماعية (GOSI)</span>
                                                    <span className="text-lg font-bold text-red-700">
                                                        {formatCurrency(run.financialBreakdown.deductions.statutory.totalGOSI)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-red-600">حصة الموظف</span>
                                                        <span className="font-medium">{formatCurrency(run.financialBreakdown.deductions.statutory.totalEmployeeGOSI)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-red-600">حصة صاحب العمل</span>
                                                        <span className="font-medium">{formatCurrency(run.financialBreakdown.deductions.statutory.totalEmployerGOSI)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Other deductions */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {run.financialBreakdown.deductions.loans.totalLoanRepayments > 0 && (
                                                    <div className="p-4 bg-slate-50 rounded-xl">
                                                        <div className="text-sm text-slate-500">القروض</div>
                                                        <div className="text-lg font-bold text-navy">
                                                            {formatCurrency(run.financialBreakdown.deductions.loans.totalLoanRepayments)}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {run.financialBreakdown.deductions.loans.employeesWithLoans} موظف
                                                        </div>
                                                    </div>
                                                )}
                                                {run.financialBreakdown.deductions.advances.totalAdvanceRecoveries > 0 && (
                                                    <div className="p-4 bg-slate-50 rounded-xl">
                                                        <div className="text-sm text-slate-500">السلف</div>
                                                        <div className="text-lg font-bold text-navy">
                                                            {formatCurrency(run.financialBreakdown.deductions.advances.totalAdvanceRecoveries)}
                                                        </div>
                                                    </div>
                                                )}
                                                {run.financialBreakdown.deductions.attendance.totalAttendanceDeductions > 0 && (
                                                    <div className="p-4 bg-slate-50 rounded-xl">
                                                        <div className="text-sm text-slate-500">الحضور</div>
                                                        <div className="text-lg font-bold text-navy">
                                                            {formatCurrency(run.financialBreakdown.deductions.attendance.totalAttendanceDeductions)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Cost to Company */}
                                <Card className="border-none shadow-sm bg-amber-50 rounded-2xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-amber-600" />
                                            التكلفة على الشركة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-sm text-amber-600">إجمالي الرواتب</div>
                                                <div className="text-lg font-bold text-amber-800">
                                                    {formatCurrency(run.financialBreakdown.costToCompany.totalSalaries)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-amber-600">تأمينات صاحب العمل</div>
                                                <div className="text-lg font-bold text-amber-800">
                                                    {formatCurrency(run.financialBreakdown.costToCompany.totalEmployerGOSI)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-amber-600">المزايا</div>
                                                <div className="text-lg font-bold text-amber-800">
                                                    {formatCurrency(run.financialBreakdown.costToCompany.totalBenefits)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-amber-600">إجمالي التكلفة</div>
                                                <div className="text-xl font-bold text-amber-900">
                                                    {formatCurrency(run.financialBreakdown.costToCompany.totalCost)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                                            <span className="text-sm text-amber-600">متوسط التكلفة لكل موظف: </span>
                                            <span className="font-bold text-amber-800">
                                                {formatCurrency(run.financialBreakdown.costToCompany.averageCostPerEmployee)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد تفاصيل مالية</h3>
                                <p className="text-slate-500">قم بحساب الرواتب لعرض التفاصيل المالية</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Breakdown Tab */}
                    <TabsContent value="breakdown" className="space-y-6">
                        {run.breakdowns ? (
                            <>
                                {/* By Department */}
                                {run.breakdowns.byDepartment && run.breakdowns.byDepartment.length > 0 && (
                                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-600" />
                                                حسب القسم
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {run.breakdowns.byDepartment.map((dept) => (
                                                    <div key={dept.departmentId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                        <div>
                                                            <div className="font-medium text-navy">{dept.departmentName}</div>
                                                            <div className="text-sm text-slate-500">{dept.employeeCount} موظف</div>
                                                        </div>
                                                        <div className="flex items-center gap-6 text-start">
                                                            <div>
                                                                <div className="text-xs text-slate-400">إجمالي</div>
                                                                <div className="font-medium">{formatCurrency(dept.totalGrossPay)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-slate-400">صافي</div>
                                                                <div className="font-medium text-emerald-600">{formatCurrency(dept.totalNetPay)}</div>
                                                            </div>
                                                            <div className="w-16">
                                                                <div className="text-xs text-slate-400">نسبة</div>
                                                                <div className="font-bold text-navy">{dept.percentOfTotalPayroll.toFixed(1)}%</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* By Payment Method */}
                                {run.breakdowns.byPaymentMethod && run.breakdowns.byPaymentMethod.length > 0 && (
                                    <Card className="border-none shadow-sm bg-white rounded-2xl">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                                حسب طريقة الدفع
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                {run.breakdowns.byPaymentMethod.map((method) => (
                                                    <div key={method.paymentMethod} className="p-4 bg-slate-50 rounded-xl text-center">
                                                        <div className="w-10 h-10 rounded-full bg-white mx-auto mb-2 flex items-center justify-center">
                                                            {method.paymentMethod === 'bank_transfer' ? (
                                                                <Banknote className="w-5 h-5 text-blue-600" />
                                                            ) : method.paymentMethod === 'cash' ? (
                                                                <Wallet className="w-5 h-5 text-emerald-600" />
                                                            ) : (
                                                                <FileText className="w-5 h-5 text-purple-600" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {method.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                                                             method.paymentMethod === 'cash' ? 'نقداً' : 'شيك'}
                                                        </div>
                                                        <div className="text-lg font-bold text-navy">{method.employeeCount}</div>
                                                        <div className="text-sm text-slate-400">موظف</div>
                                                        <div className="mt-2 pt-2 border-t">
                                                            <div className="text-emerald-600 font-medium">{formatCurrency(method.totalAmount)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد بيانات توزيع</h3>
                                <p className="text-slate-500">قم بحساب الرواتب لعرض التوزيع</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* WPS Tab */}
                    {run.wps && (
                        <TabsContent value="wps" className="space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                        نظام حماية الأجور (WPS)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="text-sm text-slate-500 mb-1">حالة الملف</div>
                                            <div className="font-medium text-navy">
                                                {run.wps.sifFile.generated ? (
                                                    <span className="text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" />
                                                        تم إنشاء الملف
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">لم يتم إنشاء الملف</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="text-sm text-slate-500 mb-1">حالة التقديم</div>
                                            <Badge className={`${
                                                run.wps.submission.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                                                run.wps.submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                run.wps.submission.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {run.wps.submission.status === 'accepted' ? 'مقبول' :
                                                 run.wps.submission.status === 'rejected' ? 'مرفوض' :
                                                 run.wps.submission.status === 'pending' ? 'قيد المراجعة' :
                                                 'مقبول جزئياً'}
                                            </Badge>
                                        </div>
                                    </div>
                                    {run.wps.sifFile.generated && (
                                        <div className="flex gap-3">
                                            <Button variant="outline" className="rounded-xl">
                                                <Download className="w-4 h-4 ms-2" />
                                                تحميل ملف SIF
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Payment Tab */}
                    {run.paymentProcessing && (
                        <TabsContent value="payment" className="space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-emerald-600" />
                                        معالجة الدفع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Payment Progress */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">تقدم الدفع</span>
                                            <span className="text-sm text-slate-500">
                                                {run.paymentProcessing.paymentCompletionPercentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        <Progress value={run.paymentProcessing.paymentCompletionPercentage} className="h-2" />
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                            <div className="text-sm text-emerald-600">مدفوع</div>
                                            <div className="text-xl font-bold text-emerald-700">{run.paymentProcessing.paidEmployees}</div>
                                            <div className="text-sm text-emerald-600 mt-1">
                                                {formatCurrency(run.paymentProcessing.totalPaid)}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-xl text-center">
                                            <div className="text-sm text-amber-600">معلق</div>
                                            <div className="text-xl font-bold text-amber-700">{run.paymentProcessing.pendingPayments}</div>
                                            <div className="text-sm text-amber-600 mt-1">
                                                {formatCurrency(run.paymentProcessing.totalPending)}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-xl text-center">
                                            <div className="text-sm text-red-600">فشل</div>
                                            <div className="text-xl font-bold text-red-700">{run.paymentProcessing.failedPayments}</div>
                                            <div className="text-sm text-red-600 mt-1">
                                                {formatCurrency(run.paymentProcessing.totalFailed)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Methods Breakdown */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Banknote className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium">تحويل بنكي</span>
                                            </div>
                                            <div className="text-sm text-slate-500">{run.paymentProcessing.bankTransfer.employeeCount} موظف</div>
                                            <div className="font-bold text-navy mt-1">{formatCurrency(run.paymentProcessing.bankTransfer.totalAmount)}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet className="w-4 h-4 text-emerald-600" />
                                                <span className="font-medium">نقداً</span>
                                            </div>
                                            <div className="text-sm text-slate-500">{run.paymentProcessing.cash.employeeCount} موظف</div>
                                            <div className="font-bold text-navy mt-1">{formatCurrency(run.paymentProcessing.cash.totalAmount)}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-purple-600" />
                                                <span className="font-medium">شيك</span>
                                            </div>
                                            <div className="text-sm text-slate-500">{run.paymentProcessing.check.employeeCount} موظف</div>
                                            <div className="font-bold text-navy mt-1">{formatCurrency(run.paymentProcessing.check.totalAmount)}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </Main>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إلغاء دورة الرواتب</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من إلغاء هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancelReason">سبب الإلغاء *</Label>
                            <Textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="أدخل سبب الإلغاء..."
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl">
                            تراجع
                        </Button>
                        <Button
                            onClick={handleCancel}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
                            disabled={!cancelReason.trim() || cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? 'جاري الإلغاء...' : 'إلغاء الدورة'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>اعتماد دورة الرواتب</DialogTitle>
                        <DialogDescription>
                            بعد الاعتماد، سيتم تأكيد الرواتب ويمكن معالجة الدفع.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-emerald-50 rounded-xl">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-emerald-600">عدد الموظفين:</span>
                                    <span className="font-bold text-emerald-800 ms-2">{run.employees.totalEmployees}</span>
                                </div>
                                <div>
                                    <span className="text-emerald-600">إجمالي صافي:</span>
                                    <span className="font-bold text-emerald-800 ms-2">{formatCurrency(run.financialSummary.totalNetPay)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="approveComments">ملاحظات (اختياري)</Label>
                            <Textarea
                                id="approveComments"
                                value={approveComments}
                                onChange={(e) => setApproveComments(e.target.value)}
                                placeholder="أي ملاحظات على الاعتماد..."
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} className="rounded-xl">
                            تراجع
                        </Button>
                        <Button
                            onClick={handleApprove}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending ? 'جاري الاعتماد...' : 'اعتماد الدورة'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
