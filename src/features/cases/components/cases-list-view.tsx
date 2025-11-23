import { Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    Briefcase,
    Filter,
    Plus,
    Search,
    Scale,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Bell,
    Users,
    MapPin,
    User,
    Eye,
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useCases } from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CasesListView() {
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filters = useMemo(() => {
        const f: any = {}
        if (statusFilter !== 'all') {
            f.status = statusFilter
        }
        return f
    }, [statusFilter])

    const { data: casesData, isLoading, isError, error, refetch } = useCases(filters)

    const cases = useMemo(() => {
        if (!casesData?.data) return []

        return casesData.data.map((caseItem: any) => ({
            id: caseItem.caseNumber || caseItem._id,
            title: caseItem.title || 'قضية غير محددة',
            plaintiff: caseItem.clientId?.name || 'غير محدد',
            defendant: caseItem.opposingParty || 'غير محدد',
            type: caseItem.caseType || 'عامة',
            status: caseItem.status || 'active',
            statusLabel: caseItem.status === 'active' ? 'قيد النظر' : caseItem.status === 'closed' ? 'مغلقة' : 'قيد النظر',
            nextHearing: caseItem.nextHearingDate ? new Date(caseItem.nextHearingDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }) : 'غير محدد',
            court: caseItem.court || 'غير محدد',
            lawyer: caseItem.assignedTo?.firstName + ' ' + caseItem.assignedTo?.lastName || 'غير محدد',
            claimAmount: caseItem.claimAmount || 0,
            priority: caseItem.priority || 'medium',
            progress: caseItem.progress || 0,
            lastUpdate: caseItem.updatedAt ? new Date(caseItem.updatedAt).toLocaleDateString('ar-SA') : 'غير محدد',
            _id: caseItem._id,
        }))
    }, [casesData])

    const recentActivities = [
        { title: 'تم إيداع مذكرة الرد', case: 'مشاري بن ناهد', time: 'منذ ساعتين', type: 'success' },
        { title: 'موعد جلسة جديد', case: 'شركة الأفق', time: 'منذ 5 ساعات', type: 'info' },
        { title: 'تحديث حالة القضية', case: 'دعوى تعويض', time: 'أمس', type: 'warning' },
    ]

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'القضايا', href: '/dashboard/cases', isActive: true },
    ]

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-50 text-red-500 border-red-100'
            case 'high': return 'bg-orange-50 text-orange-500 border-orange-100'
            case 'medium': return 'bg-blue-50 text-blue-500 border-blue-100'
            default: return 'bg-slate-50 text-slate-500 border-slate-100'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-500'
            case 'settlement': return 'bg-amber-500'
            case 'appeal': return 'bg-purple-500'
            case 'closed': return 'bg-green-500'
            default: return 'bg-slate-500'
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

                {/* HERO BANNER - Matching ImprovedCalendarDashboard */}
                <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                                    <Scale className="w-3 h-3 ml-2" />
                                    إدارة القضايا
                                </Badge>
                                <span className="text-slate-400 text-sm">نوفمبر 2025</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight mb-2">ملفات القضايا والمرافعات</h1>
                            <p className="text-slate-300 text-lg max-w-xl">
                                لديك <span className="text-white font-bold border-b-2 border-brand-blue">{cases.filter(c => c.status === 'active').length} قضايا نشطة</span> و <span className="text-white font-bold border-b-2 border-orange-500">جلسة واحدة</span> قادمة هذا الأسبوع.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base">
                                <Plus className="ml-2 h-5 w-5" />
                                قضية جديدة
                            </Button>
                            <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                                <Filter className="ml-2 h-5 w-5" />
                                تصفية
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- Left Sidebar (Quick Stats & Activity) --- */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Stats Card */}
                        <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden">
                            <div className="bg-navy p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 blur-[40px] opacity-20"></div>
                                <h3 className="text-lg font-bold relative z-10 mb-1">ملخص الأداء</h3>
                                <p className="text-emerald-200 text-sm relative z-10">إحصائيات الشهر الحالي</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">الكل</div>
                                            <div className="font-bold text-navy">24</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">ناجحة</div>
                                            <div className="font-bold text-navy">18</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">نسبة النجاح</span>
                                        <span className="font-bold text-navy">85%</span>
                                    </div>
                                    <Progress value={85} className="h-2" indicatorClassName="bg-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="rounded-3xl border-0 shadow-lg bg-white flex-1 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-navy text-lg">آخر التحديثات</h3>
                            </div>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px] p-4">
                                    <div className="space-y-3">
                                        {recentActivities.map((activity, i) => (
                                            <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                                <div>
                                                    <div className="font-bold text-navy text-sm group-hover:text-brand-blue transition-colors">{activity.title}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{activity.case}</div>
                                                    <div className="text-[10px] text-slate-400 mt-1">{activity.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Main Content (Cases List - Custom Design) --- */}
                    <div className="lg:col-span-9 flex flex-col gap-6">

                        {/* Filters Toolbar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 pr-4 rounded-[20px] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Search className="w-5 h-5 text-slate-400" />
                                <Input
                                    placeholder="بحث في القضايا..."
                                    className="border-0 focus-visible:ring-0 text-navy placeholder:text-slate-400 h-9 w-full sm:w-64"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium">{cases.length} قضية</span>
                            </div>
                        </div>

                        {/* Custom Cases List Design */}
                        <div className="space-y-4">
                            {/* Loading State */}
                            {isLoading && (
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                                            <div className="flex gap-4 mb-4">
                                                <Skeleton className="w-12 h-12 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-6 w-3/4" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Error State */}
                            {isError && !isLoading && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <div className="flex items-center justify-between">
                                            <span>حدث خطأ أثناء تحميل القضايا: {error?.message || 'خطأ غير معروف'}</span>
                                            <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                                إعادة المحاولة
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && cases.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-2xl">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                                        <Briefcase className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-navy mb-2">لا توجد قضايا</h4>
                                    <p className="text-slate-500 mb-4">لم يتم العثور على قضايا</p>
                                    <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                                        <Link to="/dashboard/cases/new">
                                            <Plus className="ml-2 h-4 w-4" />
                                            إنشاء قضية جديدة
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {/* Success State */}
                            {!isLoading && !isError && cases.length > 0 && cases.map((case_) => (
                                <div key={case_.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-start flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border ${getPriorityColor(case_.priority)}`}>
                                                {case_.priority === 'critical' ? (
                                                    <AlertCircle className="h-6 w-6" />
                                                ) : (
                                                    <Scale className="h-6 w-6" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <Link to="/dashboard/cases/$caseId" params={{ caseId: case_.id }} className="hover:underline decoration-brand-blue underline-offset-4">
                                                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">{case_.title}</h4>
                                                    </Link>
                                                    <span className={`px-3 py-1 ${getStatusColor(case_.status)} text-white rounded-full text-xs font-medium`}>
                                                        {case_.statusLabel}
                                                    </span>
                                                    {case_.priority === 'critical' && (
                                                        <span className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2 py-1 text-xs font-medium">عاجل جداً</span>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Users className="h-4 w-4 text-slate-400" />
                                                        <span className="text-green-600 font-medium">المدعي:</span>
                                                        <span>{case_.plaintiff}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Users className="h-4 w-4 text-slate-400" />
                                                        <span className="text-amber-600 font-medium">المدعى عليه:</span>
                                                        <span>{case_.defendant}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            <span>{case_.court}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span>{case_.lawyer}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                                            <span>التقدم</span>
                                            <span className="font-bold text-blue-600">{case_.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${case_.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-6 flex-wrap">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">النوع</div>
                                                <div className="font-bold text-slate-900">{case_.type}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الجلسة القادمة</div>
                                                <div className={`font-bold ${case_.priority === 'critical' ? 'text-red-600' : 'text-slate-900'}`}>
                                                    {case_.nextHearing}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">قيمة المطالبة</div>
                                                <div className="font-bold text-green-600">{case_.claimAmount.toLocaleString('ar-SA')} ر.س</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">آخر تحديث</div>
                                                <div className="text-xs text-slate-600">{case_.lastUpdate}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Link to="/dashboard/cases/$caseId" params={{ caseId: case_.id }}>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-lg shadow-blue-600/20 font-medium text-sm transition-colors">
                                                    التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 pt-0 text-center">
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full rounded-xl py-6 font-medium transition-colors flex items-center justify-center gap-2">
                                عرض جميع القضايا
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </Main>
        </>
    )
}
