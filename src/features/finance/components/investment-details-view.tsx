import { useState } from 'react'
import {
    Search, Bell, ArrowLeft, Edit3, Trash2, Loader2,
    TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle,
    Calendar, Clock, FileText, Tag, Brain, Camera,
    Percent, BarChart3, Briefcase, CheckCircle2, XCircle,
    Activity, LineChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from '@/components/ui/progress'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock trade data - will be replaced with API
const mockTrade = {
    _id: '1',
    symbol: 'AAPL',
    assetType: 'stock',
    direction: 'long',
    status: 'closed',

    // Entry
    entryDate: '2024-01-15T10:30:00Z',
    entryPrice: 178.50,
    quantity: 100,
    entryCommission: 4.95,

    // Exit
    exitDate: '2024-01-18T14:45:00Z',
    exitPrice: 185.20,
    exitCommission: 4.95,

    // Calculated
    pnl: 660.10,
    pnlPercent: 3.75,
    rMultiple: 2.1,
    holdingDays: 3,

    // Risk Management
    stopLoss: 175.30,
    takeProfit: 188.00,
    riskAmount: 320,
    riskPercent: 1.5,
    riskReward: 2.97,

    // Analysis
    setup: 'breakout',
    timeframe: '1d',
    strategy: 'Momentum Breakout',
    marketCondition: 'trending_up',
    tags: ['breakout', 'earnings', 'momentum'],

    // Psychology
    emotionEntry: 'confident',
    emotionExit: 'satisfied',
    confidence: 8,
    notes: 'دخلت الصفقة بعد كسر مستوى المقاومة عند 178 مع حجم تداول قوي. الأرباح الفصلية كانت إيجابية وأعلى من التوقعات.',
    lessonsLearned: 'الانتظار للتأكيد من حجم التداول قبل الدخول كان قراراً صائباً.',
    mistakes: 'كان يمكنني الاحتفاظ بالصفقة لفترة أطول للوصول للهدف الكامل.',

    // Meta
    broker: 'Interactive Brokers',
    account: 'Main Trading Account',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T14:45:00Z',
}

const assetTypeLabels: Record<string, string> = {
    stock: 'أسهم',
    forex: 'فوركس',
    crypto: 'عملات رقمية',
    futures: 'عقود آجلة',
    options: 'خيارات',
}

const directionLabels: Record<string, string> = {
    long: 'شراء',
    short: 'بيع',
}

const statusLabels: Record<string, string> = {
    open: 'مفتوح',
    closed: 'مغلق',
    pending: 'معلق',
}

const setupLabels: Record<string, string> = {
    breakout: 'اختراق',
    breakdown: 'كسر',
    trend_following: 'تتبع الاتجاه',
    support_bounce: 'ارتداد من الدعم',
    resistance_rejection: 'رفض من المقاومة',
    reversal: 'انعكاس',
    pullback: 'تصحيح',
    gap_fill: 'ملء الفجوة',
    earnings_play: 'تداول الأرباح',
    scalp: 'سكالبينج',
    swing: 'سوينج',
}

const emotionLabels: Record<string, string> = {
    confident: 'واثق',
    calm: 'هادئ',
    focused: 'مركز',
    neutral: 'محايد',
    anxious: 'قلق',
    fearful: 'خائف',
    greedy: 'طماع',
    excited: 'متحمس',
    revenge: 'انتقامي',
    fomo: 'خوف من الفوات',
    satisfied: 'راضي',
    relieved: 'مرتاح',
    disappointed: 'محبط',
    frustrated: 'منزعج',
    regretful: 'نادم',
    proud: 'فخور',
}

const marketConditionLabels: Record<string, string> = {
    trending_up: 'اتجاه صاعد',
    trending_down: 'اتجاه هابط',
    ranging: 'نطاق عرضي',
    volatile: 'متقلب',
    choppy: 'مضطرب',
}

export default function InvestmentDetailsView() {
    const { investmentId } = useParams({ strict: false }) as { investmentId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [isLoading] = useState(false)
    const [isError] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Use mock data for now
    const trade = mockTrade

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'الاستثمارات', href: '/dashboard/finance/investments', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(amount)
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                        </div>
                    </div>
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل الصفقة</h3>
                        <p className="text-slate-500 mb-6">حدث خطأ أثناء تحميل البيانات</p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

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

                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/dashboard/finance/investments"
                        className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى سجل الصفقات
                    </Link>
                </div>

                {/* HERO CARD */}
                <ProductivityHero badge="سجل التداول" title={trade.symbol} type="investments" listMode={true} hideButtons={true}>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                        >
                            <Edit3 className="h-4 w-4 ml-2" />
                            تعديل
                        </Button>
                        {!showDeleteConfirm ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="border-white/10 text-white hover:bg-white/10"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    تأكيد
                                </Button>
                            </div>
                        )}
                    </div>
                </ProductivityHero>

                {/* P&L Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`rounded-2xl p-4 shadow-sm border ${trade.pnl >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trade.pnl >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {trade.pnl >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                            <span className="text-xs text-slate-600">الربح/الخسارة</span>
                        </div>
                        <p className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </p>
                        <p className={`text-sm ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Activity className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-xs text-slate-500">R-Multiple</span>
                        </div>
                        <p className={`text-2xl font-bold ${trade.rMultiple >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(1)}R
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Target className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-xs text-slate-500">نسبة المخاطرة/العائد</span>
                        </div>
                        <p className="text-2xl font-bold text-navy">1:{trade.riskReward.toFixed(1)}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-xs text-slate-500">مدة الاحتفاظ</span>
                        </div>
                        <p className="text-2xl font-bold text-navy">{trade.holdingDays} أيام</p>
                    </div>
                </div>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b border-slate-100 px-6 pt-4">
                                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                                        {['overview', 'analysis', 'psychology', 'notes'].map((tab) => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab}
                                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-base pb-4 rounded-none px-2"
                                            >
                                                {tab === 'overview' ? 'نظرة عامة' :
                                                    tab === 'analysis' ? 'التحليل' :
                                                        tab === 'psychology' ? 'السيكولوجيا' : 'الملاحظات'}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="p-6 bg-slate-50/50 min-h-[400px]">
                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        {/* Trade Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Entry Card */}
                                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        الدخول
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">التاريخ</span>
                                                        <span className="font-bold text-navy">{new Date(trade.entryDate).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">الوقت</span>
                                                        <span className="font-bold text-navy">{new Date(trade.entryDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">السعر</span>
                                                        <span className="font-bold text-navy text-lg">{trade.entryPrice.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">الكمية</span>
                                                        <span className="font-bold text-navy">{trade.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">العمولة</span>
                                                        <span className="font-bold text-slate-500">{formatCurrency(trade.entryCommission)}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Exit Card */}
                                            <Card className="border-none shadow-sm bg-white rounded-2xl">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                        </div>
                                                        الخروج
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">التاريخ</span>
                                                        <span className="font-bold text-navy">{new Date(trade.exitDate).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">الوقت</span>
                                                        <span className="font-bold text-navy">{new Date(trade.exitDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">السعر</span>
                                                        <span className="font-bold text-navy text-lg">{trade.exitPrice.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                        <span className="text-slate-600">العمولة</span>
                                                        <span className="font-bold text-slate-500">{formatCurrency(trade.exitCommission)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                                        <span className="text-emerald-700 font-medium">صافي الربح</span>
                                                        <span className="font-bold text-emerald-600 text-lg">{formatCurrency(trade.pnl)}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Risk Management */}
                                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                                    إدارة المخاطر
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-red-50 rounded-xl text-center">
                                                        <p className="text-xs text-red-600 mb-1">وقف الخسارة</p>
                                                        <p className="text-lg font-bold text-red-700">{trade.stopLoss.toLocaleString()}</p>
                                                    </div>
                                                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                                        <p className="text-xs text-emerald-600 mb-1">جني الأرباح</p>
                                                        <p className="text-lg font-bold text-emerald-700">{trade.takeProfit.toLocaleString()}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                                                        <p className="text-xs text-slate-600 mb-1">المخاطرة</p>
                                                        <p className="text-lg font-bold text-navy">{formatCurrency(trade.riskAmount)}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                                                        <p className="text-xs text-slate-600 mb-1">% من رأس المال</p>
                                                        <p className="text-lg font-bold text-navy">{trade.riskPercent}%</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Trade Info */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">نوع الأصل</p>
                                                <p className="font-bold text-navy">{assetTypeLabels[trade.assetType]}</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">الاتجاه</p>
                                                <Badge className={trade.direction === 'long' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                    {directionLabels[trade.direction]}
                                                </Badge>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                                <Badge className={trade.status === 'closed' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}>
                                                    {statusLabels[trade.status]}
                                                </Badge>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">الوسيط</p>
                                                <p className="font-bold text-navy">{trade.broker}</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Analysis Tab */}
                                    <TabsContent value="analysis" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <BarChart3 className="h-5 w-5 text-purple-500" />
                                                    <span className="font-bold text-navy">الإعداد</span>
                                                </div>
                                                <p className="text-lg">{setupLabels[trade.setup]}</p>
                                            </Card>
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Clock className="h-5 w-5 text-blue-500" />
                                                    <span className="font-bold text-navy">الإطار الزمني</span>
                                                </div>
                                                <p className="text-lg">{trade.timeframe}</p>
                                            </Card>
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Briefcase className="h-5 w-5 text-emerald-500" />
                                                    <span className="font-bold text-navy">الاستراتيجية</span>
                                                </div>
                                                <p className="text-lg">{trade.strategy}</p>
                                            </Card>
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <LineChart className="h-5 w-5 text-orange-500" />
                                                    <span className="font-bold text-navy">حالة السوق</span>
                                                </div>
                                                <p className="text-lg">{marketConditionLabels[trade.marketCondition]}</p>
                                            </Card>
                                        </div>

                                        {/* Tags */}
                                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <Tag className="h-5 w-5 text-slate-500" />
                                                    الوسوم
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {trade.tags.map((tag, index) => (
                                                        <Badge key={index} variant="secondary" className="rounded-full px-4 py-1">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Psychology Tab */}
                                    <TabsContent value="psychology" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                                                    <span className="font-bold text-navy">الحالة عند الدخول</span>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700">{emotionLabels[trade.emotionEntry]}</Badge>
                                            </Card>
                                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <ArrowDownRight className="h-5 w-5 text-blue-500" />
                                                    <span className="font-bold text-navy">الحالة عند الخروج</span>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700">{emotionLabels[trade.emotionExit]}</Badge>
                                            </Card>
                                        </div>

                                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold text-navy">مستوى الثقة</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-4">
                                                    <Progress value={trade.confidence * 10} className="flex-1 h-3" />
                                                    <span className="text-2xl font-bold text-navy">{trade.confidence}/10</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {trade.lessonsLearned && (
                                            <Card className="border-none shadow-sm bg-emerald-50 rounded-2xl">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        الدروس المستفادة
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-emerald-700 leading-relaxed">{trade.lessonsLearned}</p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {trade.mistakes && (
                                            <Card className="border-none shadow-sm bg-red-50 rounded-2xl">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                                                        <XCircle className="h-5 w-5" />
                                                        الأخطاء
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-red-700 leading-relaxed">{trade.mistakes}</p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    {/* Notes Tab */}
                                    <TabsContent value="notes" className="mt-0 space-y-6">
                                        <Card className="border-none shadow-sm bg-white rounded-2xl">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    ملاحظات الصفقة
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{trade.notes || 'لا توجد ملاحظات'}</p>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </Card>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
