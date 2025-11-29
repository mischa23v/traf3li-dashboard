import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    DollarSign, FileText, CheckCircle, Clock, ArrowRight, Users
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HRSidebar } from '../components/hr-sidebar'
import { usePayrolls } from '@/hooks/usePayroll'
import { useTranslation } from 'react-i18next'
import { months } from './data/data'

const route = getRouteApi('/_authenticated/dashboard/hr/payroll/')

export function Payroll() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'

    const [activeStatusTab, setActiveStatusTab] = useState('all')

    const { data, isLoading, isError, error, refetch } = usePayrolls()

    const getMonthName = (month: number) => {
        const monthData = months.find((m) => m.value === month)
        return isArabic ? monthData?.label : monthData?.labelEn
    }

    // Transform API data
    const payrolls = useMemo(() => {
        if (!data?.data) return []

        let filtered = data.data
        if (activeStatusTab !== 'all') {
            filtered = filtered.filter((p: any) => p.status === activeStatusTab)
        }

        return filtered.map((payroll: any) => ({
            id: payroll._id,
            payrollId: payroll.payrollId,
            periodMonth: payroll.periodMonth,
            periodYear: payroll.periodYear,
            employeeCount: payroll.items?.length || 0,
            totalGross: payroll.totalGross || 0,
            totalNet: payroll.totalNet || 0,
            totalDeductions: payroll.totalDeductions || 0,
            status: payroll.status,
            currency: 'SAR',
            _id: payroll._id,
        }))
    }, [data, activeStatusTab])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفون', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الرواتب', href: '/dashboard/hr/salaries', isActive: false },
        { title: 'مسيرات الرواتب', href: '/dashboard/hr/payroll', isActive: true },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-2">مسودة</Badge>
            case 'pending_approval':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-md px-2">بانتظار الموافقة</Badge>
            case 'approved':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">معتمد</Badge>
            case 'processing':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-md px-2">قيد المعالجة</Badge>
            case 'completed':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-2">مكتمل</Badge>
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2">ملغي</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-2">{status}</Badge>
        }
    }

    const formatCurrency = (amount: number, currency: string = 'SAR') => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
    }

    // Calculate stats
    const stats = useMemo(() => {
        if (!data?.data) return { total: 0, pending: 0, completed: 0, totalPaid: 0 }
        const pending = data.data.filter((p: any) => p.status === 'pending_approval').length
        const completed = data.data.filter((p: any) => p.status === 'completed').length
        const totalPaid = data.data.filter((p: any) => p.status === 'completed').reduce((acc: number, p: any) => acc + (p.totalNet || 0), 0)
        return { total: data.data.length, pending, completed, totalPaid }
    }, [data])

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
                {/* HERO CARD */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="relative z-10 max-w-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <Link to="/dashboard/hr/payroll">
                                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h2 className="text-3xl font-bold leading-tight">{t('hr.payroll.title', 'مسيرات الرواتب')}</h2>
                        </div>
                        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                            {t('hr.payroll.description', 'إنشاء وإدارة مسيرات الرواتب الشهرية ومتابعة عمليات الصرف.')}
                        </p>
                        <div className="flex gap-3">
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                <Link to="/dashboard/hr/payroll/new">
                                    <Plus className="ml-2 h-5 w-5" />
                                    إنشاء مسير
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-white" />
                                <span className="text-emerald-200 text-sm">إجمالي المسيرات</span>
                            </div>
                            <span className="text-3xl font-bold">{stats.total}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-amber-400" />
                                <span className="text-emerald-200 text-sm">بانتظار الموافقة</span>
                            </div>
                            <span className="text-3xl font-bold">{stats.pending}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span className="text-emerald-200 text-sm">مكتمل</span>
                            </div>
                            <span className="text-3xl font-bold">{stats.completed}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-400" />
                                <span className="text-emerald-200 text-sm">إجمالي المصروف</span>
                            </div>
                            <span className="text-xl font-bold">{formatCurrency(stats.totalPaid)}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">سجل المسيرات</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <Button size="sm" onClick={() => setActiveStatusTab('all')} className={activeStatusTab === 'all' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>الكل</Button>
                                    <Button size="sm" onClick={() => setActiveStatusTab('pending_approval')} className={activeStatusTab === 'pending_approval' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>بانتظار الموافقة</Button>
                                    <Button size="sm" onClick={() => setActiveStatusTab('completed')} className={activeStatusTab === 'completed' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>مكتمل</Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {isLoading && [1, 2, 3].map((i) => (
                                    <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                        <Skeleton className="h-6 w-3/4 mb-4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}

                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المسيرات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">إعادة المحاولة</Button>
                                    </div>
                                )}

                                {!isLoading && !isError && payrolls.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <FileText className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد مسيرات رواتب</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإنشاء مسير جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/payroll/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                إنشاء مسير
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {!isLoading && !isError && payrolls.map((payroll) => (
                                    <div key={payroll.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-navy text-lg">{getMonthName(payroll.periodMonth)} {payroll.periodYear}</h4>
                                                    {getStatusBadge(payroll.status)}
                                                </div>
                                                <p className="text-slate-500 text-sm font-mono">{payroll.payrollId}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الموظفون</div>
                                                    <div className="font-bold text-navy flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {payroll.employeeCount}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الإجمالي</div>
                                                    <div className="font-medium text-navy text-sm">{formatCurrency(payroll.totalGross, payroll.currency)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الاستقطاعات</div>
                                                    <div className="font-medium text-red-600 text-sm">-{formatCurrency(payroll.totalDeductions, payroll.currency)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الصافي</div>
                                                    <div className="font-bold text-navy">{formatCurrency(payroll.totalNet, payroll.currency)}</div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/hr/payroll/${payroll.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع المسيرات
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <HRSidebar context="payroll" />
                </div>
            </Main>
        </>
    )
}
