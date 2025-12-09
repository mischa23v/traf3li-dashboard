import { useState } from 'react'
import {
    Save, DollarSign, ArrowRightLeft, Calendar, TrendingUp, RefreshCw,
    Globe, Euro, Coins, AlertCircle, X, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useSetExchangeRate } from '@/hooks/useFinanceAdvanced'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'

export function CurrencyCreateView() {
    const navigate = useNavigate()
    const setExchangeRateMutation = useSetExchangeRate()

    // Form state
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('SAR')
    const [rate, setRate] = useState('')
    const [isAutoUpdate, setIsAutoUpdate] = useState(false)
    const [source, setSource] = useState<'manual' | 'api'>('manual')

    // Calculate inverse rate
    const inverseRate = rate && parseFloat(rate) > 0 ? (1 / parseFloat(rate)).toFixed(4) : '0.0000'

    // Currency options
    const currencies = [
        { code: 'SAR', name: 'ريال سعودي', icon: Coins },
        { code: 'USD', name: 'دولار أمريكي', icon: DollarSign },
        { code: 'EUR', name: 'يورو', icon: Euro },
        { code: 'GBP', name: 'جنيه إسترليني', icon: Globe },
        { code: 'AED', name: 'درهم إماراتي', icon: Globe },
        { code: 'KWD', name: 'دينار كويتي', icon: Globe },
        { code: 'BHD', name: 'دينار بحريني', icon: Globe },
        { code: 'OMR', name: 'ريال عماني', icon: Globe },
        { code: 'QAR', name: 'ريال قطري', icon: Globe },
        { code: 'EGP', name: 'جنيه مصري', icon: Globe },
    ]

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!rate || parseFloat(rate) <= 0) {
            return
        }

        setExchangeRateMutation.mutate({
            fromCurrency,
            toCurrency,
            rate: parseFloat(rate),
        }, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/currency' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'العملات', href: '/dashboard/finance/currency', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD */}
                <ProductivityHero badge="العملات" title="إضافة سعر صرف جديد" type="currency" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* CURRENCY SELECTION */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <ArrowRightLeft className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        اختيار العملات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* From Currency */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                من العملة
                                            </Label>
                                            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                    <SelectValue placeholder="اختر العملة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies.map((currency) => (
                                                        <SelectItem key={currency.code} value={currency.code}>
                                                            <div className="flex items-center gap-2">
                                                                <currency.icon className="w-4 h-4" aria-hidden="true" />
                                                                {currency.code} - {currency.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* To Currency */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                إلى العملة
                                            </Label>
                                            <Select value={toCurrency} onValueChange={setToCurrency}>
                                                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                                                    <SelectValue placeholder="اختر العملة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies.map((currency) => (
                                                        <SelectItem
                                                            key={currency.code}
                                                            value={currency.code}
                                                            disabled={currency.code === fromCurrency}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <currency.icon className="w-4 h-4" aria-hidden="true" />
                                                                {currency.code} - {currency.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {fromCurrency === toCurrency && (
                                        <Alert className="mt-4 rounded-xl bg-amber-50 border-amber-200">
                                            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                                            <AlertDescription className="text-amber-700">
                                                لا يمكن تحويل العملة إلى نفسها
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* EXCHANGE RATE */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        سعر الصرف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Exchange Rate Input */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                السعر (1 {fromCurrency} = ? {toCurrency})
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                min="0"
                                                value={rate}
                                                onChange={(e) => setRate(e.target.value)}
                                                placeholder="3.7500"
                                                className="rounded-xl border-slate-200 h-12 text-lg font-mono"
                                                dir="ltr"
                                                required
                                            />
                                        </div>

                                        {/* Inverse Rate Display */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                السعر العكسي (1 {toCurrency} = ? {fromCurrency})
                                            </Label>
                                            <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200 text-lg font-mono text-slate-700">
                                                {inverseRate}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    {rate && parseFloat(rate) > 0 && (
                                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ArrowRightLeft className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                                <span className="font-medium text-emerald-800">معاينة التحويل</span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-700">100 {fromCurrency} =</span>
                                                    <span className="font-bold text-emerald-700">
                                                        {(100 * parseFloat(rate)).toFixed(2)} {toCurrency}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-700">1,000 {fromCurrency} =</span>
                                                    <span className="font-bold text-emerald-700">
                                                        {(1000 * parseFloat(rate)).toFixed(2)} {toCurrency}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* SETTINGS */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        إعدادات التحديث
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Source Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">مصدر السعر</Label>
                                        <Select value={source} onValueChange={(v: 'manual' | 'api') => setSource(v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">يدوي</SelectItem>
                                                <SelectItem value="api">واجهة برمجية (API)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Auto Update Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700">تحديث تلقائي</Label>
                                            <p className="text-xs text-slate-500 mt-1">
                                                سيتم تحديث السعر تلقائياً كل 24 ساعة
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isAutoUpdate}
                                            onCheckedChange={setIsAutoUpdate}
                                            disabled={source === 'manual'}
                                        />
                                    </div>

                                    {source === 'manual' && isAutoUpdate && (
                                        <Alert className="rounded-xl bg-blue-50 border-blue-200">
                                            <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                            <AlertDescription className="text-blue-700">
                                                التحديث التلقائي متاح فقط عند استخدام واجهة برمجية (API)
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <Link to="/dashboard/finance/currency">
                                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 rounded-xl">
                                        <X className="ms-2 h-4 w-4" aria-hidden="true" />
                                        إلغاء
                                    </Button>
                                </Link>

                                <Button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 px-8"
                                    disabled={setExchangeRateMutation.isPending || !rate || parseFloat(rate) <= 0 || fromCurrency === toCurrency}
                                >
                                    {setExchangeRateMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                            جاري الحفظ...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-4 h-4" aria-hidden="true" />
                                            حفظ سعر الصرف
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="currency" />
                </div>
            </Main>
        </>
    )
}
