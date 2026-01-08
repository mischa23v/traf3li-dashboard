import { useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
    Search, Bell, AlertCircle, Calculator, Users, ChevronLeft, Shield,
    CheckCircle, XCircle, TrendingUp, FileText, Building2, Percent,
    DollarSign, AlertTriangle, Info, ArrowRight, RefreshCw, Calendar
} from 'lucide-react'
import {
    useCalculateGOSI,
    useCheckNitaqat,
    useCheckMinimumWage,
    useMudadCompliance,
    type NitaqatResult,
    type MinimumWageResult
} from '@/hooks/useSaudiBanking'
import {
    EmployeeNationality,
    GOSI_SALARY_CONSTRAINTS,
    GOSI_RATES_SAUDI_LEGACY,
    GOSI_RATES_SAUDI_REFORM,
    GOSI_RATES_NON_SAUDI,
    SANED_RATES,
    REGULATORY_DATES,
    calculateGosiContribution,
    type GosiContributionBreakdown,
} from '@/constants/saudi-banking'
import { ROUTES } from '@/constants/routes'

// Sidebar Component
function MudadSidebar() {
    return (
        <div className="space-y-6">
            {/* Quick Tools Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy">أدوات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-orange-50 hover:border-orange-200">
                        <Calculator className="h-5 w-5 text-orange-600" />
                        <span>حاسبة GOSI</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-emerald-50 hover:border-emerald-200">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <span>فحص نطاقات</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-blue-50 hover:border-blue-200">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        <span>فحص الحد الأدنى للأجور</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-purple-50 hover:border-purple-200">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <span>تقرير التأمينات</span>
                    </Button>
                </CardContent>
            </Card>

            {/* GOSI Rates Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Info className="h-5 w-5 text-orange-600" />
                        نسب التأمينات الاجتماعية
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Legacy Saudi rates */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">اشتراك الموظف السعودي</span>
                            <span className="font-bold text-navy">{(GOSI_RATES_SAUDI_LEGACY.employee * 100).toFixed(2)}%</span>
                        </div>
                        <p className="text-xs text-slate-500">للموظفين المعينين قبل 3 يوليو 2024</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">اشتراك صاحب العمل (سعودي)</span>
                            <span className="font-bold text-navy">{(GOSI_RATES_SAUDI_LEGACY.employer * 100).toFixed(2)}%</span>
                        </div>
                        <p className="text-xs text-slate-500">معاشات 9.75% + أخطار مهنية 2%</p>
                    </div>
                    {/* 2024 Reform rates */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-emerald-500 text-white text-xs">إصلاح 2024</Badge>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-emerald-700">الموظف السعودي الجديد</span>
                            <span className="font-bold text-emerald-700">0%</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-emerald-700">صاحب العمل</span>
                            <span className="font-bold text-emerald-700">{(GOSI_RATES_SAUDI_REFORM.employer * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-emerald-600">للمعينين من 3 يوليو 2024</p>
                    </div>
                    {/* Non-Saudi */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">غير السعودي</span>
                            <span className="font-bold text-navy">{(GOSI_RATES_NON_SAUDI.employer * 100)}%</span>
                        </div>
                        <p className="text-xs text-slate-500">أخطار مهنية فقط (صاحب العمل)</p>
                    </div>
                    {/* SANED */}
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-blue-700">ساند (للسعوديين)</span>
                            <span className="font-bold text-blue-700">{(SANED_RATES.total * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-blue-600">0.75% موظف + 0.75% صاحب عمل</p>
                    </div>
                    {/* Salary cap info */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-xs text-amber-700">
                            <strong>سقف الراتب:</strong> {GOSI_SALARY_CONSTRAINTS.MIN_BASE.toLocaleString()} - {GOSI_SALARY_CONSTRAINTS.MAX_BASE.toLocaleString()} ر.س
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-orange-500 to-orange-600">
                <CardContent className="p-6 text-white">
                    <Calculator className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">نظام مدد</h3>
                    <p className="text-sm text-white/80 mb-4">
                        منصة موحدة لإدارة الرواتب والتأمينات الاجتماعية للمنشآت الصغيرة والمتوسطة
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                        زيارة mudad.com.sa
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingMudadView() {
    const [activeTab, setActiveTab] = useState('gosi')

    // GOSI Calculator State
    const [nationality, setNationality] = useState<EmployeeNationality>(EmployeeNationality.SAUDI)
    const [basicSalary, setBasicSalary] = useState('')
    const [housingAllowance, setHousingAllowance] = useState('')
    const [isReformEmployee, setIsReformEmployee] = useState(false)
    const [employeeStartDate, setEmployeeStartDate] = useState('')
    const [gosiResult, setGosiResult] = useState<GosiContributionBreakdown | null>(null)

    // Mutations
    const calculateGOSIMutation = useCalculateGOSI()

    // Mock compliance data
    const complianceData = useMemo(() => ({
        nitaqat: {
            totalEmployees: 50,
            saudiCount: 23,
            nonSaudiCount: 27,
            saudizationPercentage: 46,
            requiredPercentage: 40,
            category: 'GREEN_MID' as const,
            isCompliant: true,
        },
        minimumWage: {
            totalChecked: 23,
            compliant: 23,
            nonCompliant: 0,
            isFullyCompliant: true,
        },
    }), [])

    // Hero stats
    const heroStats = useMemo(() => {
        return [
            { label: 'نسبة السعودة', value: `${complianceData.nitaqat.saudizationPercentage}%`, icon: Users, status: 'normal' as const },
            { label: 'تصنيف نطاقات', value: 'أخضر متوسط', icon: Shield, status: 'normal' as const },
            { label: 'الموظفين السعوديين', value: complianceData.nitaqat.saudiCount, icon: CheckCircle, status: 'normal' as const },
            { label: 'إجمالي الموظفين', value: complianceData.nitaqat.totalEmployees, icon: Building2, status: 'normal' as const },
        ]
    }, [complianceData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    const handleCalculateGOSI = useCallback(() => {
        if (!basicSalary) return

        const basic = parseFloat(basicSalary)
        const housing = housingAllowance ? parseFloat(housingAllowance) : undefined

        // Use the employee start date if provided, otherwise use isReformEmployee toggle
        const startDate = employeeStartDate
            ? employeeStartDate
            : (isReformEmployee ? REGULATORY_DATES.GOSI_REFORM_DATE : '2020-01-01')

        // Use the centralized calculation function from constants
        const result = calculateGosiContribution(
            basic,
            housing,
            nationality,
            nationality === EmployeeNationality.SAUDI ? startDate : undefined
        )

        setGosiResult(result)
    }, [basicSalary, housingAllowance, nationality, isReformEmployee, employeeStartDate])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
    }

    const getNitaqatCategoryColor = (category: string) => {
        const colors: Record<string, { bg: string; text: string; label: string }> = {
            'PLATINUM': { bg: 'bg-slate-100', text: 'text-slate-700', label: 'بلاتيني' },
            'GREEN_HIGH': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'أخضر مرتفع' },
            'GREEN_MID': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'أخضر متوسط' },
            'GREEN_LOW': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'أخضر منخفض' },
            'YELLOW': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'أصفر' },
            'RED': { bg: 'bg-red-100', text: 'text-red-700', label: 'أحمر' },
        }
        return colors[category] || colors.YELLOW
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to={ROUTES.dashboard.finance.saudiBanking.index} className="text-slate-500 hover:text-emerald-600">
                        الخدمات المصرفية
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">مدد - التأمينات والامتثال</span>
                </div>

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="Mudad" title="التأمينات الاجتماعية والامتثال" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tabs */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <CardHeader className="pb-0">
                                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                                        <TabsTrigger value="gosi" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                            حاسبة GOSI
                                        </TabsTrigger>
                                        <TabsTrigger value="nitaqat" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                            نطاقات
                                        </TabsTrigger>
                                        <TabsTrigger value="wages" className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6">
                                            الحد الأدنى للأجور
                                        </TabsTrigger>
                                    </TabsList>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {/* GOSI Calculator Tab */}
                                    <TabsContent value="gosi" className="m-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Calculator Form */}
                                            <div className="space-y-5">
                                                <div>
                                                    <Label className="text-navy font-medium mb-2 block">الجنسية</Label>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant={nationality === EmployeeNationality.SAUDI ? 'default' : 'outline'}
                                                            onClick={() => setNationality(EmployeeNationality.SAUDI)}
                                                            className={`flex-1 rounded-xl ${nationality === EmployeeNationality.SAUDI ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                                        >
                                                            سعودي
                                                        </Button>
                                                        <Button
                                                            variant={nationality === EmployeeNationality.EXPAT ? 'default' : 'outline'}
                                                            onClick={() => setNationality(EmployeeNationality.EXPAT)}
                                                            className={`flex-1 rounded-xl ${nationality === EmployeeNationality.EXPAT ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                                        >
                                                            غير سعودي
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-navy font-medium mb-2 block">الراتب الأساسي (ريال)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="مثال: 8000"
                                                        value={basicSalary}
                                                        onChange={(e) => setBasicSalary(e.target.value)}
                                                        className="rounded-xl h-11"
                                                        min={0}
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-navy font-medium mb-2 block">بدل السكن (ريال)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="مثال: 2000 (اختياري - افتراضي 25%)"
                                                        value={housingAllowance}
                                                        onChange={(e) => setHousingAllowance(e.target.value)}
                                                        className="rounded-xl h-11"
                                                        min={0}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        إذا تُرك فارغاً، سيُحسب كـ 25% من الراتب الأساسي
                                                    </p>
                                                </div>

                                                {/* 2024 Reform Toggle - Only for Saudis */}
                                                {nationality === EmployeeNationality.SAUDI && (
                                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-emerald-600" />
                                                                <Label className="text-emerald-700 font-medium">
                                                                    موظف جديد (إصلاح 2024)
                                                                </Label>
                                                            </div>
                                                            <Switch
                                                                checked={isReformEmployee}
                                                                onCheckedChange={setIsReformEmployee}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-emerald-600 mt-2">
                                                            للمعينين من 3 يوليو 2024 - صاحب العمل يتحمل كامل الاشتراك
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Salary Cap Warning */}
                                                {basicSalary && parseFloat(basicSalary) > 0 && (
                                                    (() => {
                                                        const basic = parseFloat(basicSalary)
                                                        const housing = housingAllowance ? parseFloat(housingAllowance) : basic * 0.25
                                                        const total = basic + housing
                                                        if (total > GOSI_SALARY_CONSTRAINTS.MAX_BASE) {
                                                            return (
                                                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                                    <p className="text-xs text-amber-700">
                                                                        <AlertTriangle className="h-3 w-3 inline me-1" />
                                                                        الراتب يتجاوز السقف ({GOSI_SALARY_CONSTRAINTS.MAX_BASE.toLocaleString()} ر.س). سيتم احتساب التأمينات على السقف.
                                                                    </p>
                                                                </div>
                                                            )
                                                        }
                                                        if (total < GOSI_SALARY_CONSTRAINTS.MIN_BASE) {
                                                            return (
                                                                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                                                                    <p className="text-xs text-red-700">
                                                                        <AlertTriangle className="h-3 w-3 inline me-1" />
                                                                        الراتب أقل من الحد الأدنى ({GOSI_SALARY_CONSTRAINTS.MIN_BASE.toLocaleString()} ر.س)
                                                                    </p>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    })()
                                                )}

                                                <Button
                                                    onClick={handleCalculateGOSI}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12 shadow-lg shadow-orange-500/20"
                                                    disabled={!basicSalary}
                                                >
                                                    <Calculator className="h-5 w-5 ms-2" />
                                                    احسب التأمينات
                                                </Button>
                                            </div>

                                            {/* Results */}
                                            <div className="bg-slate-50 rounded-2xl p-6">
                                                <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-orange-500" />
                                                    نتيجة الحساب
                                                </h4>

                                                {gosiResult ? (
                                                    <div className="space-y-3">
                                                        {/* Base Salary Used */}
                                                        <div className="bg-slate-100 rounded-xl p-3">
                                                            <p className="text-xs text-slate-500 mb-1">الراتب المحتسب (بعد السقف)</p>
                                                            <p className="text-lg font-bold text-slate-700">
                                                                {formatCurrency(gosiResult.baseSalary)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                        </div>

                                                        {/* Reform Badge */}
                                                        {gosiResult.isReformRate && (
                                                            <div className="flex items-center gap-2 p-2 bg-emerald-100 rounded-lg">
                                                                <Badge className="bg-emerald-500 text-white text-xs">إصلاح 2024</Badge>
                                                                <span className="text-xs text-emerald-700">صاحب العمل يتحمل كامل الاشتراك</span>
                                                            </div>
                                                        )}

                                                        {/* Employee Contribution */}
                                                        <div className="bg-white rounded-xl p-4">
                                                            <p className="text-sm text-slate-500 mb-1">اشتراك الموظف (معاشات)</p>
                                                            <p className="text-xl font-bold text-navy">
                                                                {formatCurrency(gosiResult.employeeContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                            {nationality === EmployeeNationality.SAUDI && !gosiResult.isReformRate && (
                                                                <p className="text-xs text-slate-500 mt-1">9.75% من الراتب</p>
                                                            )}
                                                            {gosiResult.isReformRate && (
                                                                <p className="text-xs text-emerald-600 mt-1">معفى (إصلاح 2024)</p>
                                                            )}
                                                        </div>

                                                        {/* Employer Contribution Breakdown */}
                                                        <div className="bg-white rounded-xl p-4">
                                                            <p className="text-sm text-slate-500 mb-2">اشتراك صاحب العمل</p>
                                                            <p className="text-xl font-bold text-emerald-600 mb-2">
                                                                {formatCurrency(gosiResult.employerTotalContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                            <div className="space-y-1 text-xs text-slate-500 border-t pt-2">
                                                                <div className="flex justify-between">
                                                                    <span>معاشات</span>
                                                                    <span>{formatCurrency(gosiResult.employerPensionContribution)} ر.س</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>أخطار مهنية (OHI)</span>
                                                                    <span>{formatCurrency(gosiResult.employerOhiContribution)} ر.س</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SANED Contribution - Saudi Only */}
                                                        {nationality === EmployeeNationality.SAUDI && (
                                                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                                <p className="text-sm text-blue-700 mb-2">اشتراك ساند (التعطل عن العمل)</p>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <div>
                                                                        <p className="text-xs text-blue-600">الموظف (0.75%)</p>
                                                                        <p className="font-bold text-blue-800">{formatCurrency(gosiResult.sanedEmployeeContribution)} ر.س</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-blue-600">صاحب العمل (0.75%)</p>
                                                                        <p className="font-bold text-blue-800">{formatCurrency(gosiResult.sanedEmployerContribution)} ر.س</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Total */}
                                                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                                            <p className="text-sm text-orange-600 mb-1">إجمالي الاشتراكات الشهرية</p>
                                                            <p className="text-2xl font-bold text-orange-600">
                                                                {formatCurrency(gosiResult.totalContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                            <div className="flex justify-between text-xs text-orange-500 mt-2 pt-2 border-t border-orange-200">
                                                                <span>على الموظف: {formatCurrency(gosiResult.employeeContribution + gosiResult.sanedEmployeeContribution)} ر.س</span>
                                                                <span>على صاحب العمل: {formatCurrency(gosiResult.employerTotalContribution + gosiResult.sanedEmployerContribution)} ر.س</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                                        <p className="text-slate-500">أدخل الراتب لحساب التأمينات</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Nitaqat Tab */}
                                    <TabsContent value="nitaqat" className="m-0">
                                        <div className="space-y-6">
                                            {/* Nitaqat Status Card */}
                                            <div className="bg-slate-50 rounded-2xl p-6">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h4 className="font-bold text-navy text-xl">حالة نطاقات المنشأة</h4>
                                                        <p className="text-sm text-slate-500">تصنيف السعودة الحالي</p>
                                                    </div>
                                                    {(() => {
                                                        const categoryStyle = getNitaqatCategoryColor(complianceData.nitaqat.category)
                                                        return (
                                                            <Badge className={`${categoryStyle.bg} ${categoryStyle.text} border-0 text-lg px-4 py-2`}>
                                                                {categoryStyle.label}
                                                            </Badge>
                                                        )
                                                    })()}
                                                </div>

                                                {/* Saudization Progress */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm text-slate-600">نسبة السعودة الحالية</span>
                                                        <span className="font-bold text-navy">{complianceData.nitaqat.saudizationPercentage}%</span>
                                                    </div>
                                                    <Progress value={complianceData.nitaqat.saudizationPercentage} className="h-3" />
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-xs text-slate-500">الحد الأدنى المطلوب: {complianceData.nitaqat.requiredPercentage}%</span>
                                                        <span className="text-xs text-emerald-600">
                                                            {complianceData.nitaqat.isCompliant ? '✓ متوافق' : '✗ غير متوافق'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Employee Breakdown */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-white rounded-xl p-4 text-center">
                                                        <p className="text-sm text-slate-500 mb-1">إجمالي الموظفين</p>
                                                        <p className="text-2xl font-bold text-navy">{complianceData.nitaqat.totalEmployees}</p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                                        <p className="text-sm text-emerald-600 mb-1">سعوديين</p>
                                                        <p className="text-2xl font-bold text-emerald-600">{complianceData.nitaqat.saudiCount}</p>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                                        <p className="text-sm text-blue-600 mb-1">غير سعوديين</p>
                                                        <p className="text-2xl font-bold text-blue-600">{complianceData.nitaqat.nonSaudiCount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Compliance Tips */}
                                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-bold text-emerald-800 mb-1">منشأتك متوافقة مع نظام نطاقات</h5>
                                                        <p className="text-sm text-emerald-700">
                                                            نسبة السعودة الحالية ({complianceData.nitaqat.saudizationPercentage}%) تتجاوز الحد الأدنى المطلوب ({complianceData.nitaqat.requiredPercentage}%)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Minimum Wage Tab */}
                                    <TabsContent value="wages" className="m-0">
                                        <div className="space-y-6">
                                            {/* Summary Card */}
                                            <div className="bg-slate-50 rounded-2xl p-6">
                                                <h4 className="font-bold text-navy text-xl mb-4">فحص الحد الأدنى للأجور</h4>

                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="bg-white rounded-xl p-4 text-center">
                                                        <p className="text-sm text-slate-500 mb-1">تم الفحص</p>
                                                        <p className="text-2xl font-bold text-navy">{complianceData.minimumWage.totalChecked}</p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                                        <p className="text-sm text-emerald-600 mb-1">متوافق</p>
                                                        <p className="text-2xl font-bold text-emerald-600">{complianceData.minimumWage.compliant}</p>
                                                    </div>
                                                    <div className="bg-red-50 rounded-xl p-4 text-center">
                                                        <p className="text-sm text-red-600 mb-1">غير متوافق</p>
                                                        <p className="text-2xl font-bold text-red-600">{complianceData.minimumWage.nonCompliant}</p>
                                                    </div>
                                                </div>

                                                {/* Info Box */}
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                    <div className="flex items-start gap-3">
                                                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h5 className="font-bold text-blue-800 mb-1">الحد الأدنى للأجور في السعودية</h5>
                                                            <ul className="text-sm text-blue-700 space-y-1">
                                                                <li>• السعوديين في القطاع الخاص: 4,000 ريال شهرياً</li>
                                                                <li>• للاحتساب في نطاقات: 4,000 ريال شهرياً</li>
                                                                <li>• الحد الأدنى للأجر بالساعة: 25 ريال</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Compliance Status */}
                                            {complianceData.minimumWage.isFullyCompliant ? (
                                                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h5 className="font-bold text-emerald-800 mb-1">جميع الموظفين السعوديين يستوفون الحد الأدنى للأجور</h5>
                                                            <p className="text-sm text-emerald-700">
                                                                منشأتك متوافقة بالكامل مع متطلبات الحد الأدنى للأجور
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h5 className="font-bold text-red-800 mb-1">يوجد موظفين دون الحد الأدنى للأجور</h5>
                                                            <p className="text-sm text-red-700">
                                                                يرجى مراجعة رواتب الموظفين السعوديين للتأكد من استيفاء الحد الأدنى
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <MudadSidebar />
                </div>
            </Main>
        </>
    )
}
