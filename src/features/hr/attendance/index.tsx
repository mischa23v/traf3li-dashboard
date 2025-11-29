import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    Users, UserCheck, UserX, Clock, ArrowRight, Home, Calendar
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HRSidebar } from '../components/hr-sidebar'
import { useTodayAttendance } from '@/hooks/useAttendance'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { attendanceStatuses } from './data/data'

const route = getRouteApi('/_authenticated/dashboard/hr/attendance/')

export function Attendance() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'

    const [activeStatusTab, setActiveStatusTab] = useState('all')

    const { data, isLoading, isError, error, refetch } = useTodayAttendance()

    const formatTime = (time: string | undefined) => {
        if (!time) return '-'
        return format(new Date(time), 'hh:mm a', {
            locale: isArabic ? ar : enUS,
        })
    }

    // Transform API data
    const records = useMemo(() => {
        if (!data?.attendance) return []

        let filtered = data.attendance
        if (activeStatusTab !== 'all') {
            filtered = filtered.filter((r: any) => r.status === activeStatusTab)
        }

        return filtered.map((record: any) => ({
            id: record._id,
            employeeName: record.employee?.fullName || `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim() || 'غير محدد',
            employeeAvatar: record.employee?.avatar || '',
            department: record.employee?.department || 'غير محدد',
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            workingHours: record.workingHours,
            status: record.status,
            _id: record._id,
        }))
    }, [data, activeStatusTab])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفون', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: true },
    ]

    const getStatusBadge = (status: string) => {
        const statusInfo = attendanceStatuses.find(s => s.value === status)
        switch (status) {
            case 'present':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 rounded-md px-2">حاضر</Badge>
            case 'absent':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2">غائب</Badge>
            case 'late':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 rounded-md px-2">متأخر</Badge>
            case 'half_day':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">نصف يوم</Badge>
            case 'on_leave':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-md px-2">في إجازة</Badge>
            case 'work_from_home':
                return <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-0 rounded-md px-2">عمل من المنزل</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 rounded-md px-2">{isArabic ? statusInfo?.label : statusInfo?.labelEn}</Badge>
        }
    }

    return (
        <>
            {/* Header */}
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
                            <Link to="/dashboard/hr/attendance">
                                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h2 className="text-3xl font-bold leading-tight">{t('hr.attendance.title', 'سجل الحضور')}</h2>
                        </div>
                        <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                            {t('hr.attendance.description', 'متابعة حضور وانصراف الموظفين وإدارة سجلات الدوام بكفاءة.')}
                        </p>
                        <p className="text-white/80 text-sm">
                            {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: isArabic ? ar : enUS })}
                        </p>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 min-w-[360px]">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <UserCheck className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.present || 0}</span>
                            <span className="text-emerald-200 text-xs">حاضر</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <Clock className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.late || 0}</span>
                            <span className="text-emerald-200 text-xs">متأخر</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <UserX className="h-6 w-6 text-red-400 mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.absent || 0}</span>
                            <span className="text-emerald-200 text-xs">غائب</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <Calendar className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.onLeave || 0}</span>
                            <span className="text-emerald-200 text-xs">في إجازة</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <Home className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.workFromHome || 0}</span>
                            <span className="text-emerald-200 text-xs">عن بعد</span>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm text-center">
                            <Users className="h-6 w-6 text-white mx-auto mb-2" />
                            <span className="text-2xl font-bold block">{data?.summary?.totalEmployees || 0}</span>
                            <span className="text-emerald-200 text-xs">إجمالي</span>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">سجل اليوم</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <Button size="sm" onClick={() => setActiveStatusTab('all')} className={activeStatusTab === 'all' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>الكل</Button>
                                    <Button size="sm" onClick={() => setActiveStatusTab('present')} className={activeStatusTab === 'present' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>حاضر</Button>
                                    <Button size="sm" onClick={() => setActiveStatusTab('late')} className={activeStatusTab === 'late' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>متأخر</Button>
                                    <Button size="sm" onClick={() => setActiveStatusTab('absent')} className={activeStatusTab === 'absent' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}>غائب</Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {isLoading && [1, 2, 3].map((i) => (
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

                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل السجلات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">إعادة المحاولة</Button>
                                    </div>
                                )}

                                {!isLoading && !isError && records.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Users className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات</h3>
                                        <p className="text-slate-500 mb-4">لم يتم تسجيل أي حضور اليوم</p>
                                    </div>
                                )}

                                {!isLoading && !isError && records.map((record) => (
                                    <div key={record.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={record.employeeAvatar} alt={record.employeeName} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                                        {record.employeeName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{record.employeeName}</h4>
                                                        {getStatusBadge(record.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{record.department}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-6 pt-4 border-t border-slate-200/50">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الحضور</div>
                                                <div className="font-medium text-navy text-sm" dir="ltr">{formatTime(record.checkInTime)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الانصراف</div>
                                                <div className="font-medium text-navy text-sm" dir="ltr">{formatTime(record.checkOutTime)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">ساعات العمل</div>
                                                <div className="font-bold text-navy">{record.workingHours ? `${record.workingHours.toFixed(1)} ساعة` : '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض السجل الكامل
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <HRSidebar context="attendance" />
                </div>
            </Main>
        </>
    )
}
