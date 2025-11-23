import { useState, useMemo } from 'react'
import {
    Search, Filter, Download,
    Check, FileText, Receipt, AlertCircle,
    User, Calendar, ArrowUpRight, ArrowDownRight, Activity, Bell, Plus, Loader2, CreditCard, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivities } from '@/hooks/useFinance'

export default function AccountActivityDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const { data, isLoading, isError, error } = useActivities()
    const activities = data?.data || []

    // Helper function to get icon and color based on activity type
    const getActivityStyle = (type: string) => {
        const styles: Record<string, { icon: any; color: string; iconBg: string }> = {
            payment_received: { icon: Check, color: 'emerald', iconBg: 'bg-emerald-50 text-emerald-600' },
            payment_sent: { icon: ArrowDownRight, color: 'red', iconBg: 'bg-red-50 text-red-600' },
            invoice_created: { icon: FileText, color: 'slate', iconBg: 'bg-slate-50 text-slate-600' },
            invoice_sent: { icon: Send, color: 'blue', iconBg: 'bg-blue-50 text-blue-600' },
            invoice_paid: { icon: Check, color: 'emerald', iconBg: 'bg-emerald-50 text-emerald-600' },
            expense_created: { icon: Receipt, color: 'red', iconBg: 'bg-red-50 text-red-600' },
            expense_approved: { icon: Check, color: 'emerald', iconBg: 'bg-emerald-50 text-emerald-600' },
            transaction_created: { icon: CreditCard, color: 'blue', iconBg: 'bg-blue-50 text-blue-600' },
        }
        return styles[type] || { icon: AlertCircle, color: 'amber', iconBg: 'bg-amber-50 text-amber-600' }
    }

    // Filter Logic using useMemo for performance
    const filteredActivities = useMemo(() => {
        return activities.filter(act => {
            // Tab filter
            if (activeTab === 'payments') {
                if (act.type !== 'payment_received' && act.type !== 'payment_sent') return false
            }
            if (activeTab === 'invoices') {
                if (!act.type.includes('invoice')) return false
            }
            if (activeTab === 'expenses') {
                if (!act.type.includes('expense')) return false
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                if (!act.description.toLowerCase().includes(query) &&
                    !act.reference.toLowerCase().includes(query) &&
                    !act.title.toLowerCase().includes(query)) {
                    return false
                }
            }

            return true
        })
    }, [activities, activeTab, searchQuery])

    // Group by Date
    const groupedActivities = useMemo(() => {
        return filteredActivities.reduce((groups, activity) => {
            const date = new Date(activity.date).toLocaleDateString('ar-SA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(activity)
            return groups
        }, {} as Record<string, typeof filteredActivities>)
    }, [filteredActivities])

    // Stats
    const todayActivities = useMemo(() => {
        const today = new Date().toDateString()
        return activities.filter(a => new Date(a.date).toDateString() === today).length
    }, [activities])

    const totalIncome = useMemo(() => {
        return activities
            .filter(a => a.type === 'payment_received')
            .reduce((sum, a) => sum + a.amount, 0)
    }, [activities])

    const totalExpenses = useMemo(() => {
        return Math.abs(activities
            .filter(a => a.type === 'payment_sent' || a.type.includes('expense'))
            .reduce((sum, a) => sum + Math.abs(a.amount), 0))
    }, [activities])

    // Get unique active users
    const activeUsers = useMemo(() => {
        const userMap = new Map<string, number>()
        activities.forEach(act => {
            userMap.set(act.userName, (userMap.get(act.userName) || 0) + 1)
        })
        return Array.from(userMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
    }, [activities])

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount === 0) return '-'
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(Math.abs(amount))
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: true },
    ]

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
                {isLoading ? (
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="bg-white rounded-3xl p-8">
                            <Skeleton className="h-8 w-64 mb-4" />
                            <Skeleton className="h-6 w-96 mb-8" />
                            <div className="grid grid-cols-3 gap-6">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                                ))}
                            </div>
                            <div className="lg:col-span-4 space-y-4">
                                <Skeleton className="h-64 w-full rounded-3xl" />
                                <Skeleton className="h-64 w-full rounded-3xl" />
                            </div>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-3xl p-12 text-center border border-red-100">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900">فشل تحميل سجل النشاط</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
                        </div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-slate-900">لا يوجد نشاط مالي</h3>
                            <p className="text-slate-500 mb-4">لم يتم تسجيل أي نشاط مالي بعد</p>
                            <Button asChild>
                                <Link to="/dashboard/finance/activity/new">تسجيل نشاط جديد</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Section - Contained Navy Card */}
                    <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 mb-8">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                            <Activity className="w-3 h-3 ml-2" />
                                            سجل النشاط
                                        </Badge>
                                        <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        المعاملات والنشاط
                                    </h1>
                                    <p className="text-blue-200/80">سجل كامل لجميع الحركات المالية والإجراءات</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                        <Download className="w-4 h-4 ml-2" />
                                        تصدير السجل
                                    </Button>
                                    <Button className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm rounded-xl">
                                        <Filter className="w-4 h-4 ml-2" />
                                        تصفية متقدمة
                                    </Button>
                                    <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                        <Link to="/dashboard/finance/activity/new">
                                            <Plus className="w-4 h-4 ml-2" />
                                            تسجيل نشاط
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">نشاط اليوم</span>
                                        <span className="font-bold text-white">{todayActivities} حركات</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">نشط</div>
                                    <Progress value={65} className="h-1.5 bg-white/10" indicatorClassName="bg-brand-blue" />
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">إجمالي المقبوضات</div>
                                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">إجمالي المصروفات</div>
                                        <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Activity Feed */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Filters Bar */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                    <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-navy data-[state=active]:text-white transition-all duration-300"
                                        >
                                            الكل
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="payments"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            الدفعات
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="invoices"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            الفواتير
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="expenses"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            المصروفات
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="بحث في السجل..."
                                            className="pr-10 rounded-xl border-slate-200 focus:ring-navy focus:border-navy"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Grouped Activities */}
                            <div className="space-y-8">
                                {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                                                <Calendar className="h-4 w-4 text-slate-600" />
                                                <span className="text-sm font-bold text-slate-700">{date}</span>
                                            </div>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>

                                        <div className="space-y-3">
                                            {dateActivities.map((activity) => {
                                                const style = getActivityStyle(activity.type)
                                                const Icon = style.icon
                                                const isPositive = activity.amount > 0
                                                const isNegative = activity.amount < 0

                                                return (
                                                    <div key={activity._id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${style.iconBg}`}>
                                                                <Icon className="h-6 w-6" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div>
                                                                        <Link to="/dashboard/finance/activity/$activityId" params={{ activityId: activity._id }}>
                                                                            <h4 className="font-bold text-navy text-lg mb-1 hover:text-emerald-600 transition-colors">{activity.title}</h4>
                                                                        </Link>
                                                                        <p className="text-slate-600 text-sm">{activity.description}</p>
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{activity.time}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <User className="h-3 w-3" />
                                                                            {activity.userName}
                                                                        </span>
                                                                        <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">{activity.reference}</span>
                                                                        <Badge variant="secondary" className="text-[10px] h-5">{activity.status}</Badge>
                                                                    </div>

                                                                    {activity.amount !== 0 && (
                                                                        <div className={`font-bold text-lg ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'}`}>
                                                                            {isPositive ? '+' : ''}{formatCurrency(activity.amount)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Analytics */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Activity Summary */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-brand-blue" />
                                        ملخص النشاط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-emerald-900">دفعات مكتملة</span>
                                        </div>
                                        <span className="font-bold text-emerald-700">{activities.filter(a => a.type === 'payment_received').length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-blue-900">فواتير مرسلة</span>
                                        </div>
                                        <span className="font-bold text-blue-700">{activities.filter(a => a.type === 'invoice_sent').length}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-red-900">مصروفات</span>
                                        </div>
                                        <span className="font-bold text-red-700">{activities.filter(a => a.type === 'expense_created').length}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Users */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-500" />
                                        المستخدمون النشطون
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {activeUsers.length > 0 ? (
                                        activeUsers.map((user, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                                                </div>
                                                <Badge variant="outline" className="text-xs text-slate-500">
                                                    {user.count} نشاط
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-slate-400 py-4">
                                            <p className="text-sm">لا يوجد مستخدمون نشطون</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    </div>
                )}
            </Main>
        </>
    )
}
