import { useState } from 'react'
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    Briefcase, Building, Car, Coffee, FileText, Home,
    Receipt, TrendingUp,
    Clock, PieChart, AlertCircle, Loader2, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useExpenses, useExpenseStats } from '@/hooks/useFinance'

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
        'رسوم قانونية': Building,
        'اشتراكات': FileText,
        'استشارات': Briefcase,
        'مواصلات': Car,
        'ضيافة': Coffee,
        'خدمات': FileText,
        'إيجار': Home,
    }
    return iconMap[category] || FileText
}

export default function ExpensesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch expenses and stats from API
    const { data: expensesData, isLoading: isLoadingExpenses, error: expensesError } = useExpenses()
    const { data: statsData, isLoading: isLoadingStats, error: statsError } = useExpenseStats()

    // Extract data with fallbacks
    const expenses = expensesData?.expenses || []
    const stats = statsData || {}

    // Helper to get status color
    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'مدفوع': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            'paid': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            'معلق': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
            'pending': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
            'approved': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            'rejected': 'bg-red-100 text-red-700 hover:bg-red-200',
        }
        return colorMap[status] || 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }

    // Filter Logic
    const filteredExpenses = expenses.filter((exp: any) => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesDescription = exp.description?.toLowerCase().includes(query)
            const matchesVendor = exp.vendor?.toLowerCase().includes(query)
            if (!matchesDescription && !matchesVendor) return false
        }

        // Tab filter
        if (activeTab === 'all') return true
        if (activeTab === 'case') return exp.caseId !== null && exp.caseId !== undefined
        if (activeTab === 'general') return !exp.caseId
        if (activeTab === 'pending') return exp.status === 'pending' || exp.status === 'معلق'

        return true
    })

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    const caseExpenses = expenses.filter((exp: any) => exp.caseId).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    const generalExpenses = expenses.filter((exp: any) => !exp.caseId).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
    const pendingExpenses = expenses.filter((exp: any) => exp.status === 'معلق' || exp.status === 'pending').reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)

    const expensesByCategory = expenses.reduce((acc: any, exp: any) => {
        const category = exp.category || 'غير مصنف'
        if (!acc[category]) {
            acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += exp.amount || 0;
        acc[category].count += 1;
        return acc;
    }, {});

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    // Loading state
    if (isLoadingExpenses || isLoadingStats) {
        return (
            <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-3xl p-8">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-96" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                            </div>
                        </div>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                        <Skeleton className="h-48" />
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (expensesError || statsError) {
        return (
            <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Alert variant="destructive" className="rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>حدث خطأ في تحميل البيانات</AlertTitle>
                        <AlertDescription>
                            {expensesError?.message || statsError?.message || 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت أو المحاولة لاحقاً.'}
                        </AlertDescription>
                    </Alert>
                    <Card className="border-none shadow-sm bg-white rounded-3xl p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-navy mb-2">تعذر تحميل المصروفات</h3>
                        <p className="text-slate-500 mb-6">حدث خطأ أثناء الاتصال بالخادم. قد يكون هذا بسبب:</p>
                        <ul className="text-right text-slate-600 space-y-2 max-w-md mx-auto mb-6">
                            <li>• مشكلة في الاتصال بالإنترنت</li>
                            <li>• الخادم غير متاح حالياً</li>
                            <li>• عدم وجود صلاحيات الوصول</li>
                        </ul>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-navy hover:bg-navy/90 text-white rounded-xl"
                        >
                            إعادة المحاولة
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    // Empty state
    if (expenses.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                            <Receipt className="w-3 h-3 ml-2" />
                                            المصروفات
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        إدارة المصروفات
                                    </h1>
                                    <p className="text-blue-200/80">تتبع النفقات، الفواتير، والميزانية العامة</p>
                                </div>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl">
                                    <Plus className="w-4 h-4 ml-2" />
                                    مصروف جديد
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Card className="border-none shadow-sm bg-white rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Package className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-navy mb-2">لا توجد مصروفات بعد</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            ابدأ بإضافة مصروفاتك الأولى لتتبع نفقات مكتبك القانوني بشكل احترافي
                        </p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة مصروف جديد
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
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
                                        <Receipt className="w-3 h-3 ml-2" />
                                        المصروفات
                                    </Badge>
                                    <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    إدارة المصروفات
                                </h1>
                                <p className="text-blue-200/80">تتبع النفقات، الفواتير، والميزانية العامة</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                    <Download className="w-4 h-4 ml-2" />
                                    تصدير التقرير
                                </Button>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl">
                                    <Plus className="w-4 h-4 ml-2" />
                                    مصروف جديد
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-blue-200">إجمالي المصروفات</span>
                                    <span className="font-bold text-emerald-400">-2.5%</span>
                                </div>
                                <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
                                <Progress value={45} className="h-1.5 bg-white/10" indicatorClassName="bg-emerald-500" />
                            </div>
                            <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                <div>
                                    <div className="text-blue-200 text-sm mb-1">مصروفات القضايا</div>
                                    <div className="text-2xl font-bold">{formatCurrency(caseExpenses)}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-blue-200" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                <div>
                                    <div className="text-blue-200 text-sm mb-1">مصروفات عامة</div>
                                    <div className="text-2xl font-bold text-emerald-400">{formatCurrency(generalExpenses)}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Building className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Remaining Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pending Expenses */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                                    معلق
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm">مصروفات معلقة</h3>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(pendingExpenses)}</div>
                            </div>
                            <Progress value={(pendingExpenses / totalExpenses) * 100} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-amber-500" />
                        </CardContent>
                    </Card>

                    {/* Budget Status (Mock) */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <PieChart className="w-6 h-6 text-blue-600" />
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                    الميزانية
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm">المتبقي من الميزانية</h3>
                                <div className="text-2xl font-bold text-navy">45%</div>
                            </div>
                            <Progress value={55} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-blue-500" />
                        </CardContent>
                    </Card>

                    {/* Average Daily (Mock) */}
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100">
                                    يومي
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-sm">متوسط الصرف اليومي</h3>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(totalExpenses / 30)}</div>
                            </div>
                            <Progress value={30} className="h-1.5 mt-4 bg-slate-100" indicatorClassName="bg-purple-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Expenses List */}
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
                                        value="case"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        قضايا
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="general"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        عامة
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pending"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        معلقة
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="بحث في المصروفات..."
                                        className="pr-10 rounded-xl border-slate-200 focus:ring-navy focus:border-navy"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                        </div>

                        {/* Expenses List - Vertical Stack Cards */}
                        <div className="space-y-4">
                            {filteredExpenses.map((expense: any) => {
                                const Icon = getCategoryIcon(expense.category)
                                const statusColor = getStatusColor(expense.status)
                                const formattedDate = expense.date ? new Date(expense.date).toLocaleDateString('ar-SA', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'غير محدد'

                                return (
                                    <div key={expense._id || expense.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-600">
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{expense.description || 'بدون وصف'}</h4>
                                                        <Badge className={`${statusColor} border-0 px-2 rounded-md`}>
                                                            {expense.status || 'غير محدد'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-slate-500 text-sm">
                                                        {expense.vendor || 'غير محدد'} • {expense.category || 'غير مصنف'}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>تعديل</DropdownMenuItem>
                                                    <DropdownMenuItem>عرض الإيصال</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">المبلغ</div>
                                                    <div className="font-bold text-navy text-lg">{formatCurrency(expense.amount || 0)}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                    <div className="font-bold text-navy">{formattedDate}</div>
                                                </div>
                                                {expense.caseId && (
                                                    <div className="text-center hidden sm:block">
                                                        <div className="text-xs text-slate-400 mb-1">القضية</div>
                                                        <div className="font-bold text-navy text-sm">
                                                            {typeof expense.caseId === 'object' ? expense.caseId.caseNumber : expense.caseId}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                عرض التفاصيل
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Sidebar - Analytics */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Category Distribution */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-brand-blue" />
                                    توزيع المصروفات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {Object.entries(expensesByCategory)
                                    .sort((a: any, b: any) => b[1].total - a[1].total)
                                    .slice(0, 5)
                                    .map(([category, data]: any, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-navy">{category}</span>
                                                <span className="text-slate-500">{formatCurrency(data.total)}</span>
                                            </div>
                                            <Progress
                                                value={(data.total / totalExpenses) * 100}
                                                className="h-2 bg-slate-100"
                                                indicatorClassName="bg-brand-blue"
                                            />
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>

                        {/* Recent Activity (Simplified) */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    آخر النشاطات
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {expenses.slice(0, 3).map((exp, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                        <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-emerald-500"></div>
                                        <div>
                                            <div className="font-bold text-navy text-sm">تم دفع {exp.description}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{exp.date}</div>
                                        </div>
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
