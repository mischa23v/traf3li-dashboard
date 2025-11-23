import { useState } from 'react'
import {
    Search, Filter, Download,
    Check, FileText, Receipt, AlertCircle,
    User, Calendar, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AccountActivityDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mock Data
    const activities = [
        {
            id: 'ACT-2025-001',
            date: '17 نوفمبر 2025',
            time: '2:30 مساءً',
            type: 'payment_received',
            title: 'دفعة مستلمة',
            description: 'تم استلام دفعة من مشاري الرابح',
            reference: 'INV-2025-001',
            amount: 52900,
            user: 'أحمد المحامي',
            status: 'مكتمل',
            icon: Check,
            color: 'emerald'
        },
        {
            id: 'ACT-2025-002',
            date: '17 نوفمبر 2025',
            time: '10:30 صباحاً',
            type: 'expense_new',
            title: 'مصروف جديد',
            description: 'تم إضافة مصروف: استئجار قاعة المحكمة',
            reference: 'EXP-2025-001',
            amount: -5652.17,
            user: 'أحمد المحامي',
            status: 'مكتمل',
            icon: Receipt,
            color: 'red'
        },
        {
            id: 'ACT-2025-003',
            date: '16 نوفمبر 2025',
            time: '4:15 مساءً',
            type: 'invoice_sent',
            title: 'فاتورة مرسلة',
            description: 'تم إرسال فاتورة إلى مشاري الرابح',
            reference: 'INV-2025-001',
            amount: 52900,
            user: 'سارة المحامية',
            status: 'معلق',
            icon: FileText,
            color: 'blue'
        },
        {
            id: 'ACT-2025-004',
            date: '15 نوفمبر 2025',
            time: '9:20 صباحاً',
            type: 'payment_received',
            title: 'دفعة مستلمة',
            description: 'تم استلام دفعة من عبدالله الغامدي',
            reference: 'INV-2025-002',
            amount: 38000,
            user: 'أحمد المحامي',
            status: 'مكتمل',
            icon: Check,
            color: 'emerald'
        },
        {
            id: 'ACT-2025-005',
            date: '15 نوفمبر 2025',
            time: '11:00 صباحاً',
            type: 'invoice_created',
            title: 'فاتورة منشأة',
            description: 'تم إنشاء فاتورة جديدة لعبدالله الغامدي',
            reference: 'INV-2025-002',
            amount: 38000,
            user: 'سارة المحامية',
            status: 'مسودة',
            icon: FileText,
            color: 'slate'
        },
        {
            id: 'ACT-2025-006',
            date: '14 نوفمبر 2025',
            time: '3:45 مساءً',
            type: 'expense_new',
            title: 'مصروف جديد',
            description: 'تم إضافة مصروف: اشتراك المكتبة القانونية',
            reference: 'EXP-2025-002',
            amount: -2500,
            user: 'محمد المحامي',
            status: 'مكتمل',
            icon: Receipt,
            color: 'red'
        },
        {
            id: 'ACT-2025-010',
            date: '12 نوفمبر 2025',
            time: '9:00 صباحاً',
            type: 'payment_reminder',
            title: 'تذكير دفع',
            description: 'تم إرسال تذكير دفع لعبدالله الغامدي',
            reference: 'INV-2025-002',
            amount: 0,
            user: 'النظام',
            status: 'مرسل',
            icon: AlertCircle,
            color: 'amber'
        }
    ]

    // Filter Logic
    const filteredActivities = activities.filter(act => {
        if (activeTab === 'all') return true
        if (activeTab === 'payments') return act.type === 'payment_received'
        if (activeTab === 'invoices') return act.type.includes('invoice')
        if (activeTab === 'expenses') return act.type === 'expense_new'
        if (searchQuery && !act.description.includes(searchQuery) && !act.reference.includes(searchQuery)) return false
        return true
    })

    // Group by Date
    const groupedActivities = filteredActivities.reduce((groups, activity) => {
        const date = activity.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(activity)
        return groups
    }, {} as Record<string, typeof activities>)

    // Stats
    const todayActivities = activities.filter(a => a.date === '17 نوفمبر 2025').length
    const totalIncome = activities.filter(a => a.amount > 0 && a.type === 'payment_received').reduce((sum, a) => sum + a.amount, 0)
    const totalExpenses = Math.abs(activities.filter(a => a.amount < 0).reduce((sum, a) => sum + a.amount, 0))

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount === 0) return '-'
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(Math.abs(amount))
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Section - Contained Navy Card */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
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
                                <Button className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                    <Filter className="w-4 h-4 ml-2" />
                                    تصفية متقدمة
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
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
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
                                        className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
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
                                            const Icon = activity.icon
                                            const isPositive = activity.amount > 0
                                            const isNegative = activity.amount < 0

                                            let iconBg = 'bg-slate-100 text-slate-600'
                                            if (activity.color === 'emerald') iconBg = 'bg-emerald-50 text-emerald-600'
                                            if (activity.color === 'red') iconBg = 'bg-red-50 text-red-600'
                                            if (activity.color === 'blue') iconBg = 'bg-blue-50 text-blue-600'
                                            if (activity.color === 'amber') iconBg = 'bg-amber-50 text-amber-600'

                                            return (
                                                <div key={activity.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>
                                                            <Icon className="h-6 w-6" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div>
                                                                    <h4 className="font-bold text-[#022c22] text-lg mb-1">{activity.title}</h4>
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
                                                                        {activity.user}
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
                                <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
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
                                    <span className="font-bold text-red-700">{activities.filter(a => a.type === 'expense_new').length}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Users */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-500" />
                                    المستخدمون النشطون
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {['أحمد المحامي', 'سارة المحامية', 'محمد المحامي'].map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                {user.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{user}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs text-slate-500">
                                            {activities.filter(a => a.user === user).length} نشاط
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
