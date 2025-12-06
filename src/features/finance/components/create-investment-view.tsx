import { useState } from 'react'
import {
    Search, Bell, ArrowLeft, Save, Loader2,
    TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle,
    Calendar, Clock, FileText, Tag, Brain, Camera, Calculator,
    Percent, BarChart3, Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from '@/components/ui/switch'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

export default function CreateInvestmentView() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')

    // Form state
    const [formData, setFormData] = useState({
        // Basic Trade Info
        symbol: '',
        assetType: 'stock',
        direction: 'long',
        status: 'open',

        // Entry Details
        entryDate: new Date().toISOString().split('T')[0],
        entryTime: new Date().toTimeString().slice(0, 5),
        entryPrice: '',
        quantity: '',
        entryCommission: '',

        // Exit Details (optional for open trades)
        exitDate: '',
        exitTime: '',
        exitPrice: '',
        exitCommission: '',

        // Risk Management
        stopLoss: '',
        takeProfit: '',
        riskAmount: '',
        riskPercent: '',
        positionSize: '',

        // Analysis & Setup
        setup: '',
        timeframe: '',
        strategy: '',
        marketCondition: '',

        // Psychology & Notes
        emotionEntry: '',
        emotionExit: '',
        confidence: '5',
        notes: '',
        lessonsLearned: '',
        mistakes: '',

        // Tags
        tags: [] as string[],

        // Attachments
        screenshotEntry: '',
        screenshotExit: '',

        // Broker/Account
        broker: '',
        account: '',
    })

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const calculateRiskReward = () => {
        if (!formData.entryPrice || !formData.stopLoss || !formData.takeProfit) return null
        const entry = parseFloat(formData.entryPrice)
        const stop = parseFloat(formData.stopLoss)
        const target = parseFloat(formData.takeProfit)

        if (formData.direction === 'long') {
            const risk = entry - stop
            const reward = target - entry
            return risk > 0 ? (reward / risk).toFixed(2) : null
        } else {
            const risk = stop - entry
            const reward = entry - target
            return risk > 0 ? (reward / risk).toFixed(2) : null
        }
    }

    const calculatePnL = () => {
        if (!formData.entryPrice || !formData.exitPrice || !formData.quantity) return null
        const entry = parseFloat(formData.entryPrice)
        const exit = parseFloat(formData.exitPrice)
        const qty = parseFloat(formData.quantity)
        const entryComm = parseFloat(formData.entryCommission || '0')
        const exitComm = parseFloat(formData.exitCommission || '0')

        let pnl = 0
        if (formData.direction === 'long') {
            pnl = (exit - entry) * qty - entryComm - exitComm
        } else {
            pnl = (entry - exit) * qty - entryComm - exitComm
        }
        return pnl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // TODO: API call to save trade
            await new Promise(resolve => setTimeout(resolve, 1000))
            navigate({ to: '/dashboard/finance/investments' })
        } catch (error) {
            console.error('Error saving trade:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'الاستثمارات', href: '/dashboard/finance/investments', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
    ]

    const riskReward = calculateRiskReward()
    const pnl = calculatePnL()

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
                <ProductivityHero badge="سجل التداول" title="تسجيل صفقة جديدة" type="investments" listMode={true} hideButtons={true}>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.symbol || !formData.entryPrice}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0"
                    >
                        {isSubmitting ? (
                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="ml-2 h-5 w-5" />
                        )}
                        حفظ الصفقة
                    </Button>
                </ProductivityHero>

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="border-b border-slate-100 px-6 pt-4">
                                        <TabsList className="bg-transparent h-auto p-0 gap-4">
                                            {[
                                                { id: 'basic', label: 'معلومات أساسية', icon: Briefcase },
                                                { id: 'entry', label: 'الدخول', icon: TrendingUp },
                                                { id: 'exit', label: 'الخروج', icon: TrendingDown },
                                                { id: 'risk', label: 'إدارة المخاطر', icon: AlertTriangle },
                                                { id: 'analysis', label: 'التحليل', icon: BarChart3 },
                                                { id: 'psychology', label: 'السيكولوجيا', icon: Brain },
                                            ].map(tab => (
                                                <TabsTrigger
                                                    key={tab.id}
                                                    value={tab.id}
                                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-sm pb-4 rounded-none px-2 flex items-center gap-2"
                                                >
                                                    <tab.icon className="w-4 h-4" />
                                                    {tab.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 min-h-[400px]">
                                        {/* Basic Info Tab */}
                                        <TabsContent value="basic" className="mt-0 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الرمز *</Label>
                                                    <Input
                                                        placeholder="مثال: AAPL, EUR/USD, BTC"
                                                        value={formData.symbol}
                                                        onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                                                        className="rounded-xl h-12 text-lg font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">نوع الأصل *</Label>
                                                    <Select value={formData.assetType} onValueChange={(v) => handleInputChange('assetType', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="stock">أسهم</SelectItem>
                                                            <SelectItem value="forex">فوركس</SelectItem>
                                                            <SelectItem value="crypto">عملات رقمية</SelectItem>
                                                            <SelectItem value="futures">عقود آجلة</SelectItem>
                                                            <SelectItem value="options">خيارات</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الاتجاه *</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Button
                                                            type="button"
                                                            variant={formData.direction === 'long' ? 'default' : 'outline'}
                                                            className={`h-12 rounded-xl ${formData.direction === 'long' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                                            onClick={() => handleInputChange('direction', 'long')}
                                                        >
                                                            <TrendingUp className="w-5 h-5 ml-2" />
                                                            شراء (Long)
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={formData.direction === 'short' ? 'default' : 'outline'}
                                                            className={`h-12 rounded-xl ${formData.direction === 'short' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                                                            onClick={() => handleInputChange('direction', 'short')}
                                                        >
                                                            <TrendingDown className="w-5 h-5 ml-2" />
                                                            بيع (Short)
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">حالة الصفقة</Label>
                                                    <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="open">مفتوحة</SelectItem>
                                                            <SelectItem value="closed">مغلقة</SelectItem>
                                                            <SelectItem value="pending">معلقة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الوسيط</Label>
                                                    <Input
                                                        placeholder="اسم الوسيط"
                                                        value={formData.broker}
                                                        onChange={(e) => handleInputChange('broker', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الحساب</Label>
                                                    <Input
                                                        placeholder="رقم أو اسم الحساب"
                                                        value={formData.account}
                                                        onChange={(e) => handleInputChange('account', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Entry Tab */}
                                        <TabsContent value="entry" className="mt-0 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        تاريخ الدخول *
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.entryDate}
                                                        onChange={(e) => handleInputChange('entryDate', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        وقت الدخول
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={formData.entryTime}
                                                        onChange={(e) => handleInputChange('entryTime', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        سعر الدخول *
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="0.00"
                                                        value={formData.entryPrice}
                                                        onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                                                        className="rounded-xl h-12 text-lg font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الكمية *</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0"
                                                        value={formData.quantity}
                                                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">عمولة الدخول</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={formData.entryCommission}
                                                        onChange={(e) => handleInputChange('entryCommission', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />
                                                    لقطة شاشة الدخول
                                                </Label>
                                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                                                    <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-500">اسحب وأفلت أو انقر لرفع صورة</p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Exit Tab */}
                                        <TabsContent value="exit" className="mt-0 space-y-6">
                                            {formData.status === 'open' && (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                                    <p className="text-amber-800">الصفقة مفتوحة حالياً. يمكنك تعبئة بيانات الخروج عند إغلاق الصفقة.</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        تاريخ الخروج
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.exitDate}
                                                        onChange={(e) => handleInputChange('exitDate', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        وقت الخروج
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={formData.exitTime}
                                                        onChange={(e) => handleInputChange('exitTime', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        سعر الخروج
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="0.00"
                                                        value={formData.exitPrice}
                                                        onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                                                        className="rounded-xl h-12 text-lg font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">عمولة الخروج</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={formData.exitCommission}
                                                        onChange={(e) => handleInputChange('exitCommission', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>

                                            {pnl !== null && (
                                                <div className={`rounded-xl p-6 ${pnl >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                                    <div className="text-center">
                                                        <p className="text-sm text-slate-600 mb-1">الربح/الخسارة المحسوب</p>
                                                        <p className={`text-3xl font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ر.س
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />
                                                    لقطة شاشة الخروج
                                                </Label>
                                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                                                    <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-500">اسحب وأفلت أو انقر لرفع صورة</p>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Risk Management Tab */}
                                        <TabsContent value="risk" className="mt-0 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                        وقف الخسارة
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="0.00"
                                                        value={formData.stopLoss}
                                                        onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                                                        className="rounded-xl h-12 border-red-200 focus:border-red-400"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-emerald-500" />
                                                        جني الأرباح
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        placeholder="0.00"
                                                        value={formData.takeProfit}
                                                        onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                                                        className="rounded-xl h-12 border-emerald-200 focus:border-emerald-400"
                                                    />
                                                </div>
                                            </div>

                                            {riskReward && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-blue-800 font-medium">نسبة المخاطرة للعائد</span>
                                                        <span className="text-blue-600 font-bold text-xl">1:{riskReward}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        المخاطرة (مبلغ)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={formData.riskAmount}
                                                        onChange={(e) => handleInputChange('riskAmount', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                    <p className="text-xs text-slate-500">هذا هو قيمة R الخاصة بك</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Percent className="w-4 h-4" />
                                                        المخاطرة (%)
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="1.0"
                                                        value={formData.riskPercent}
                                                        onChange={(e) => handleInputChange('riskPercent', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                    <p className="text-xs text-slate-500">نسبة من رأس المال</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold flex items-center gap-2">
                                                        <Calculator className="w-4 h-4" />
                                                        حجم المركز
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={formData.positionSize}
                                                        onChange={(e) => handleInputChange('positionSize', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Analysis Tab */}
                                        <TabsContent value="analysis" className="mt-0 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الإعداد / النمط</Label>
                                                    <Select value={formData.setup} onValueChange={(v) => handleInputChange('setup', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue placeholder="اختر نوع الإعداد" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="breakout">اختراق</SelectItem>
                                                            <SelectItem value="breakdown">كسر</SelectItem>
                                                            <SelectItem value="trend_following">تتبع الاتجاه</SelectItem>
                                                            <SelectItem value="support_bounce">ارتداد من الدعم</SelectItem>
                                                            <SelectItem value="resistance_rejection">رفض من المقاومة</SelectItem>
                                                            <SelectItem value="reversal">انعكاس</SelectItem>
                                                            <SelectItem value="pullback">تصحيح</SelectItem>
                                                            <SelectItem value="gap_fill">ملء الفجوة</SelectItem>
                                                            <SelectItem value="earnings_play">تداول الأرباح</SelectItem>
                                                            <SelectItem value="scalp">سكالبينج</SelectItem>
                                                            <SelectItem value="swing">سوينج</SelectItem>
                                                            <SelectItem value="position">مركز طويل</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الإطار الزمني</Label>
                                                    <Select value={formData.timeframe} onValueChange={(v) => handleInputChange('timeframe', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue placeholder="اختر الإطار الزمني" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1m">1 دقيقة</SelectItem>
                                                            <SelectItem value="5m">5 دقائق</SelectItem>
                                                            <SelectItem value="15m">15 دقيقة</SelectItem>
                                                            <SelectItem value="30m">30 دقيقة</SelectItem>
                                                            <SelectItem value="1h">1 ساعة</SelectItem>
                                                            <SelectItem value="4h">4 ساعات</SelectItem>
                                                            <SelectItem value="1d">يومي</SelectItem>
                                                            <SelectItem value="1w">أسبوعي</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الاستراتيجية</Label>
                                                    <Input
                                                        placeholder="اسم الاستراتيجية المستخدمة"
                                                        value={formData.strategy}
                                                        onChange={(e) => handleInputChange('strategy', e.target.value)}
                                                        className="rounded-xl h-12"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">حالة السوق</Label>
                                                    <Select value={formData.marketCondition} onValueChange={(v) => handleInputChange('marketCondition', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue placeholder="اختر حالة السوق" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="trending_up">اتجاه صاعد</SelectItem>
                                                            <SelectItem value="trending_down">اتجاه هابط</SelectItem>
                                                            <SelectItem value="ranging">نطاق عرضي</SelectItem>
                                                            <SelectItem value="volatile">متقلب</SelectItem>
                                                            <SelectItem value="choppy">مضطرب</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold flex items-center gap-2">
                                                    <Tag className="w-4 h-4" />
                                                    الوسوم
                                                </Label>
                                                <Input
                                                    placeholder="أضف وسوم مفصولة بفواصل..."
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </TabsContent>

                                        {/* Psychology Tab */}
                                        <TabsContent value="psychology" className="mt-0 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الحالة النفسية عند الدخول</Label>
                                                    <Select value={formData.emotionEntry} onValueChange={(v) => handleInputChange('emotionEntry', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue placeholder="كيف كنت تشعر؟" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="confident">واثق</SelectItem>
                                                            <SelectItem value="calm">هادئ</SelectItem>
                                                            <SelectItem value="focused">مركز</SelectItem>
                                                            <SelectItem value="neutral">محايد</SelectItem>
                                                            <SelectItem value="anxious">قلق</SelectItem>
                                                            <SelectItem value="fearful">خائف</SelectItem>
                                                            <SelectItem value="greedy">طماع</SelectItem>
                                                            <SelectItem value="excited">متحمس</SelectItem>
                                                            <SelectItem value="revenge">انتقامي</SelectItem>
                                                            <SelectItem value="fomo">خوف من الفوات</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-navy font-bold">الحالة النفسية عند الخروج</Label>
                                                    <Select value={formData.emotionExit} onValueChange={(v) => handleInputChange('emotionExit', v)}>
                                                        <SelectTrigger className="rounded-xl h-12">
                                                            <SelectValue placeholder="كيف كنت تشعر؟" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="satisfied">راضي</SelectItem>
                                                            <SelectItem value="relieved">مرتاح</SelectItem>
                                                            <SelectItem value="disappointed">محبط</SelectItem>
                                                            <SelectItem value="frustrated">منزعج</SelectItem>
                                                            <SelectItem value="regretful">نادم</SelectItem>
                                                            <SelectItem value="proud">فخور</SelectItem>
                                                            <SelectItem value="neutral">محايد</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold">مستوى الثقة (1-10)</Label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="range"
                                                        min="1"
                                                        max="10"
                                                        value={formData.confidence}
                                                        onChange={(e) => handleInputChange('confidence', e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-xl font-bold text-navy w-10 text-center">{formData.confidence}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    ملاحظات الصفقة
                                                </Label>
                                                <Textarea
                                                    placeholder="اكتب ملاحظاتك حول الصفقة..."
                                                    value={formData.notes}
                                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                                    className="rounded-xl min-h-[120px]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold">الدروس المستفادة</Label>
                                                <Textarea
                                                    placeholder="ما الذي تعلمته من هذه الصفقة؟"
                                                    value={formData.lessonsLearned}
                                                    onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                                                    className="rounded-xl min-h-[100px]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold">الأخطاء (إن وجدت)</Label>
                                                <Textarea
                                                    placeholder="ما الأخطاء التي ارتكبتها؟"
                                                    value={formData.mistakes}
                                                    onChange={(e) => handleInputChange('mistakes', e.target.value)}
                                                    className="rounded-xl min-h-[100px]"
                                                />
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </Card>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
