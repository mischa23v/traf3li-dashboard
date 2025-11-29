import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    Calendar, FileText, Clock, CheckCircle, XCircle, ArrowRight, Users
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
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HRSidebar } from '../components/hr-sidebar'
import { useLeaveRequests, useLeaveStats } from '@/hooks/useLeaves'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { leaveTypes, leaveStatuses } from './data/data'

const route = getRouteApi('/_authenticated/dashboard/hr/leaves/')

export function Leaves() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'
    const search = route.useSearch()

    const [activeStatusTab, setActiveStatusTab] = useState('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeStatusTab !== 'all') {
            f.status = activeStatusTab
        }
        return f
    }, [activeStatusTab])

    const { data, isLoading, isError, error, refetch } = useLeaveRequests(filters)
    const { data: stats } = useLeaveStats()

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd MMM yyyy', {
            locale: isArabic ? ar : enUS,
        })
    }

    // Transform API data
    const leaves = useMemo(() => {
        if (!data?.data) return []

        return data.data.map((leave: any) => ({
            id: leave._id,
            employeeName: leave.employee?.fullName || `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim() || 'غير محدد',
            employeeAvatar: leave.employee?.avatar || '',
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            totalDays: leave.totalDays,
            status: leave.status,
            reason: leave.reason || '',
            _id: leave._id,
        }))
    }, [data])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleDeleteSelected = () => {
        // TODO: Implement bulk delete
        console.log('Delete selected:', selectedIds)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفون', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: true },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
    ]

    const getStatusBadge = (status: string) => {
        const statusInfo = leaveStatuses.find(s => s.value === status)
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-md px-2">قيد الانتظار</Badge>
            case 'approved':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-2">معتمد</Badge>
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2">مرفوض</Badge>
            case 'cancelled':
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-2">ملغي</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-2">{isArabic ? statusInfo?.label : statusInfo?.labelEn}</Badge>
        }
    }

    const getLeaveTypeBadge = (type: string) => {
        const typeInfo = leaveTypes.find(t => t.value === type)
        const colors: Record<string, string> = {
            annual: 'bg-blue-100 text-blue-700',
            sick: 'bg-red-100 text-red-700',
            personal: 'bg-purple-100 text-purple-700',
            maternity: 'bg-pink-100 text-pink-700',
            paternity: 'bg-cyan-100 text-cyan-700',
            unpaid: 'bg-slate-100 text-slate-700',
            hajj: 'bg-emerald-100 text-emerald-700',
            bereavement: 'bg-gray-100 text-gray-700',
        }
        return (
            <Badge className={`${colors[type] || 'bg-slate-100 text-slate-600'} hover:opacity-80 border-0 rounded-md px-2`}>
                {isArabic ? typeInfo?.label : typeInfo?.labelEn}
            </Badge>
        )
    }

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
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="relative z-10 max-w-lg">
                        {/* Back Button */}
                        <div className="flex items-center gap-4 mb-4">
                            <Link to="/dashboard/hr/leaves">
                                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h2 className="text-3xl font-bold leading-tight">{t('hr.leaves.title', 'إدارة الإجازات')}</h2>
                        </div>
                        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                            {t('hr.leaves.description', 'إدارة طلبات الإجازات واعتمادها ومتابعة أرصدة الإجازات للموظفين.')}
                        </p>
                        <div className="flex gap-3">
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                <Link to="/dashboard/hr/leaves/new">
                                    <Plus className="ml-2 h-5 w-5" />
                                    طلب إجازة
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-amber-400" />
                                <span className="text-emerald-200 text-sm">قيد الانتظار</span>
                            </div>
                            <span className="text-3xl font-bold">{stats?.byStatus?.find((s: any) => s._id === 'pending')?.count || 0}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                                <span className="text-emerald-200 text-sm">معتمد</span>
                            </div>
                            <span className="text-3xl font-bold">{stats?.byStatus?.find((s: any) => s._id === 'approved')?.count || 0}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-5 w-5 text-red-400" />
                                <span className="text-emerald-200 text-sm">مرفوض</span>
                            </div>
                            <span className="text-3xl font-bold">{stats?.byStatus?.find((s: any) => s._id === 'rejected')?.count || 0}</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-blue-400" />
                                <span className="text-emerald-200 text-sm">في إجازة اليوم</span>
                            </div>
                            <span className="text-3xl font-bold">{stats?.onLeaveToday?.length || 0}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* MAIN LEAVES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">طلبات الإجازات</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveStatusTab('all')}
                                        className={activeStatusTab === 'all' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        الكل
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveStatusTab('pending')}
                                        className={activeStatusTab === 'pending' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        قيد الانتظار
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveStatusTab('approved')}
                                        className={activeStatusTab === 'approved' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        معتمد
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-full" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الإجازات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && leaves.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Calendar className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد طلبات إجازات</h3>
                                        <p className="text-slate-500 mb-4">لم يتم تقديم أي طلبات إجازة حتى الآن</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/leaves/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                طلب إجازة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Leaves List */}
                                {!isLoading && !isError && leaves.map((leave) => (
                                    <div key={leave.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(leave.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(leave.id)}
                                                        onCheckedChange={() => handleSelect(leave.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={leave.employeeAvatar} alt={leave.employeeName} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                        {leave.employeeName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{leave.employeeName}</h4>
                                                        {getStatusBadge(leave.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{getLeaveTypeBadge(leave.leaveType)}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">من</div>
                                                    <div className="font-medium text-navy text-sm">{formatDate(leave.startDate)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">إلى</div>
                                                    <div className="font-medium text-navy text-sm">{formatDate(leave.endDate)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">المدة</div>
                                                    <div className="font-bold text-navy">{leave.totalDays} يوم</div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/hr/leaves/${leave.id}` as any}>
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
                                    عرض جميع الطلبات
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="leaves"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
