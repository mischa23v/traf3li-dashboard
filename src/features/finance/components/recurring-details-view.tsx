import { useState, useMemo } from 'react'
import {
    FileText, Calendar, MoreHorizontal, ArrowLeft, Loader2,
    PlayCircle, PauseCircle, XCircle, RefreshCw, Edit, DollarSign,
    User, Building, CheckCircle2, AlertCircle, Clock, History,
    TrendingUp, Bell, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams } from '@tanstack/react-router'
import {
    useRecurringTransaction,
    usePauseRecurringTransaction,
    useResumeRecurringTransaction,
    useCancelRecurringTransaction,
    useGenerateRecurringTransaction
} from '@/hooks/useAccounting'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export function RecurringDetailsView() {
    const { recurringId } = useParams({ strict: false }) as { recurringId: string }
    const navigate = useNavigate()

    // Fetch recurring transaction data
    const { data: recurringData, isLoading, isError, error, refetch } = useRecurringTransaction(recurringId)

    // Mutations
    const pauseMutation = usePauseRecurringTransaction()
    const resumeMutation = useResumeRecurringTransaction()
    const cancelMutation = useCancelRecurringTransaction()
    const generateMutation = useGenerateRecurringTransaction()

    // Transform API data to component format
    const recurring = useMemo(() => {
        if (!recurringData) return null
        const rt = recurringData
        return {
            id: rt._id,
            name: rt.name,
            transactionType: rt.transactionType,
            frequency: rt.frequency,
            status: rt.status,
            startDate: rt.startDate,
            endDate: rt.endDate,
            nextRunDate: rt.nextRunDate,
            lastRunDate: rt.lastRunDate,
            timesRun: rt.timesRun,
            maxRuns: rt.maxRuns,
            clientId: rt.clientId,
            vendorId: rt.vendorId,
            caseId: rt.caseId,
            items: rt.items,
            amount: rt.amount,
            category: rt.category,
            paymentTerms: rt.paymentTerms,
            autoSend: rt.autoSend,
            autoApprove: rt.autoApprove,
            notes: rt.notes,
            generatedTransactionIds: rt.generatedTransactionIds || [],
            dayOfWeek: rt.dayOfWeek,
            dayOfMonth: rt.dayOfMonth,
            monthOfYear: rt.monthOfYear,
        }
    }, [recurringData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات المتكررة', href: '/dashboard/finance/recurring', isActive: true },
    ]

    // Helper functions
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
            paused: { label: 'متوقف مؤقتاً', color: 'bg-amber-100 text-amber-700' },
            cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
            completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-700' },
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
        return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
    }

    const getFrequencyLabel = (frequency: string) => {
        const labels = {
            daily: 'يومياً',
            weekly: 'أسبوعياً',
            bi_weekly: 'كل أسبوعين',
            monthly: 'شهرياً',
            quarterly: 'ربع سنوي',
            semi_annual: 'نصف سنوي',
            annual: 'سنوي',
        }
        return labels[frequency as keyof typeof labels] || frequency
    }

    const getTransactionTypeLabel = (type: string) => {
        const labels = {
            invoice: 'فاتورة',
            bill: 'مصروف',
            expense: 'مصروف',
        }
        return labels[type as keyof typeof labels] || type
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: arSA })
    }

    const formatAmount = (amount?: number) => {
        if (!amount) return '0.00'
        return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(amount)
    }

    // Action handlers
    const handlePause = () => {
        pauseMutation.mutate(recurringId, {
            onSuccess: () => refetch()
        })
    }

    const handleResume = () => {
        resumeMutation.mutate(recurringId, {
            onSuccess: () => refetch()
        })
    }

    const handleCancel = () => {
        if (!confirm('هل أنت متأكد من إلغاء هذه المعاملة المتكررة؟')) return
        cancelMutation.mutate(recurringId, {
            onSuccess: () => refetch()
        })
    }

    const handleGenerateNow = () => {
        if (!confirm('هل تريد إنشاء المعاملة الآن؟')) return
        generateMutation.mutate(recurringId, {
            onSuccess: () => refetch()
        })
    }

    const handleEdit = () => {
        navigate({ to: `/dashboard/finance/recurring/${recurringId}/edit` })
    }

    // LOADING STATE
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (isError) {
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/recurring" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" />
                            العودة إلى المعاملات المتكررة
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل تفاصيل المعاملة المتكررة</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // EMPTY STATE (not found)
    if (!recurring) {
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/recurring" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" />
                            العودة إلى المعاملات المتكررة
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">المعاملة المتكررة غير موجودة</h3>
                        <p className="text-slate-500 mb-6">لم نتمكن من العثور على المعاملة المتكررة المطلوبة</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to="/dashboard/finance/recurring">
                                <ArrowLeft className="ms-2 h-4 w-4" />
                                العودة إلى قائمة المعاملات المتكررة
                            </Link>
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // SUCCESS STATE
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/recurring" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" />
                        العودة إلى المعاملات المتكررة
                    </Link>
                </div>

                <ProductivityHero
                    badge="معاملة متكررة"
                    title={recurring.name}
                    type="recurring"
                    listMode={true}
                />

                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            {/* Overview Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy">معلومات عامة</CardTitle>
                                    {getStatusBadge(recurring.status)}
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">اسم المعاملة</label>
                                            <div className="font-medium text-navy">{recurring.name}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">نوع المعاملة</label>
                                            <div className="font-medium text-navy">{getTransactionTypeLabel(recurring.transactionType)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">التكرار</label>
                                            <div className="font-medium text-navy">{getFrequencyLabel(recurring.frequency)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">المبلغ</label>
                                            <div className="font-medium text-navy">{formatAmount(recurring.amount)} ر.س</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule Details */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-brand-blue" />
                                        تفاصيل الجدولة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">تاريخ البدء</label>
                                            <div className="font-medium text-navy">{formatDate(recurring.startDate)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">تاريخ الانتهاء</label>
                                            <div className="font-medium text-navy">{formatDate(recurring.endDate) || 'غير محدد'}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">التشغيل التالي</label>
                                            <div className="font-medium text-emerald-600">{formatDate(recurring.nextRunDate)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">آخر تشغيل</label>
                                            <div className="font-medium text-navy">{formatDate(recurring.lastRunDate) || 'لم يتم التشغيل بعد'}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">عدد مرات التشغيل</label>
                                            <div className="font-medium text-navy">{recurring.timesRun} {recurring.maxRuns ? `/ ${recurring.maxRuns}` : ''}</div>
                                        </div>
                                        {recurring.autoSend && (
                                            <div>
                                                <label className="text-sm text-slate-500 block mb-2">الإرسال التلقائي</label>
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0">مفعل</Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">الإجراءات</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={handleEdit}
                                            className="bg-brand-blue hover:bg-blue-600 text-white"
                                        >
                                            <Edit className="h-4 w-4 ms-2" />
                                            تعديل
                                        </Button>
                                        {recurring.status === 'active' && (
                                            <Button
                                                onClick={handlePause}
                                                disabled={pauseMutation.isPending}
                                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                            >
                                                <PauseCircle className="h-4 w-4 ms-2" />
                                                إيقاف مؤقت
                                            </Button>
                                        )}
                                        {recurring.status === 'paused' && (
                                            <Button
                                                onClick={handleResume}
                                                disabled={resumeMutation.isPending}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                            >
                                                <PlayCircle className="h-4 w-4 ms-2" />
                                                استئناف
                                            </Button>
                                        )}
                                        {(recurring.status === 'active' || recurring.status === 'paused') && (
                                            <>
                                                <Button
                                                    onClick={handleGenerateNow}
                                                    disabled={generateMutation.isPending}
                                                    variant="outline"
                                                    className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    <RefreshCw className="h-4 w-4 ms-2" />
                                                    إنشاء الآن
                                                </Button>
                                                <Button
                                                    onClick={handleCancel}
                                                    disabled={cancelMutation.isPending}
                                                    variant="outline"
                                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 ms-2" />
                                                    إلغاء
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {recurring.notes && (
                                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy">ملاحظات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-slate-700">{recurring.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Generated Transactions */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        المعاملات المنشأة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="p-6 space-y-3">
                                            {recurring.generatedTransactionIds.length === 0 ? (
                                                <div className="text-center text-slate-500 py-8">
                                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm">لا توجد معاملات منشأة بعد</p>
                                                </div>
                                            ) : (
                                                recurring.generatedTransactionIds.map((id, index) => (
                                                    <div key={id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-navy truncate">
                                                                {getTransactionTypeLabel(recurring.transactionType)} #{index + 1}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{id}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Statistics */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-brand-blue" />
                                        إحصائيات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">إجمالي المبلغ المنشأ</span>
                                        <span className="text-lg font-bold text-navy">
                                            {formatAmount((recurring.amount || 0) * recurring.timesRun)} ر.س
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500">عدد المعاملات</span>
                                        <span className="text-lg font-bold text-navy">{recurring.generatedTransactionIds.length}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
