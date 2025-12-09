import { useState, useMemo } from 'react'
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
import {
    Search, Bell, AlertCircle, Calculator, Users, ChevronLeft, Shield,
    CheckCircle, XCircle, TrendingUp, FileText, Building2, Percent,
    DollarSign, AlertTriangle, Info, ArrowRight, RefreshCw
} from 'lucide-react'
import {
    useCalculateGOSI,
    useCheckNitaqat,
    useCheckMinimumWage,
    useMudadCompliance,
    type GOSICalculation,
    type NitaqatResult,
    type MinimumWageResult
} from '@/hooks/useSaudiBanking'

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
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">اشتراك الموظف السعودي</span>
                            <span className="font-bold text-navy">9.75%</span>
                        </div>
                        <p className="text-xs text-slate-500">من الراتب الأساسي + بدل السكن</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">اشتراك صاحب العمل (سعودي)</span>
                            <span className="font-bold text-navy">11.75%</span>
                        </div>
                        <p className="text-xs text-slate-500">معاشات + أخطار مهنية</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-600">اشتراك غير السعودي</span>
                            <span className="font-bold text-navy">2%</span>
                        </div>
                        <p className="text-xs text-slate-500">أخطار مهنية فقط (صاحب العمل)</p>
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
    const [nationality, setNationality] = useState('SA')
    const [basicSalary, setBasicSalary] = useState('')
    const [gosiResult, setGosiResult] = useState<GOSICalculation | null>(null)

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

    const handleCalculateGOSI = () => {
        if (!basicSalary) return

        const salary = parseFloat(basicSalary)

        // Calculate GOSI based on nationality
        if (nationality === 'SA') {
            // Saudi: Employee 9.75%, Employer 11.75%
            const employeeContribution = salary * 0.0975
            const pensionContribution = salary * 0.09 // Part of employer contribution
            const hazardContribution = salary * 0.02 // Part of employer contribution
            const employerContribution = pensionContribution + hazardContribution + (salary * 0.0075)

            setGosiResult({
                employeeContribution,
                employerContribution,
                totalContribution: employeeContribution + employerContribution,
                pensionContribution,
                hazardContribution,
            })
        } else {
            // Non-Saudi: Only 2% hazard contribution from employer
            const hazardContribution = salary * 0.02

            setGosiResult({
                employeeContribution: 0,
                employerContribution: hazardContribution,
                totalContribution: hazardContribution,
                pensionContribution: 0,
                hazardContribution,
            })
        }
    }

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
                    <Link to="/dashboard/finance/saudi-banking" className="text-slate-500 hover:text-emerald-600">
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
                                            <div className="space-y-6">
                                                <div>
                                                    <Label className="text-navy font-medium mb-2 block">الجنسية</Label>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant={nationality === 'SA' ? 'default' : 'outline'}
                                                            onClick={() => setNationality('SA')}
                                                            className={`flex-1 rounded-xl ${nationality === 'SA' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                                        >
                                                            سعودي
                                                        </Button>
                                                        <Button
                                                            variant={nationality !== 'SA' ? 'default' : 'outline'}
                                                            onClick={() => setNationality('OTHER')}
                                                            className={`flex-1 rounded-xl ${nationality !== 'SA' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                                                        >
                                                            غير سعودي
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-navy font-medium mb-2 block">الراتب الأساسي + بدل السكن (ريال)</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="مثال: 10000"
                                                        value={basicSalary}
                                                        onChange={(e) => setBasicSalary(e.target.value)}
                                                        className="rounded-xl h-12 text-lg"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={handleCalculateGOSI}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-12 shadow-lg shadow-orange-500/20"
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
                                                    <div className="space-y-4">
                                                        <div className="bg-white rounded-xl p-4">
                                                            <p className="text-sm text-slate-500 mb-1">اشتراك الموظف</p>
                                                            <p className="text-2xl font-bold text-navy">
                                                                {formatCurrency(gosiResult.employeeContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                            {nationality === 'SA' && (
                                                                <p className="text-xs text-slate-500 mt-1">9.75% من الراتب</p>
                                                            )}
                                                        </div>

                                                        <div className="bg-white rounded-xl p-4">
                                                            <p className="text-sm text-slate-500 mb-1">اشتراك صاحب العمل</p>
                                                            <p className="text-2xl font-bold text-emerald-600">
                                                                {formatCurrency(gosiResult.employerContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
                                                            {nationality === 'SA' ? (
                                                                <p className="text-xs text-slate-500 mt-1">11.75% من الراتب</p>
                                                            ) : (
                                                                <p className="text-xs text-slate-500 mt-1">2% أخطار مهنية</p>
                                                            )}
                                                        </div>

                                                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                                            <p className="text-sm text-orange-600 mb-1">إجمالي الاشتراكات</p>
                                                            <p className="text-3xl font-bold text-orange-600">
                                                                {formatCurrency(gosiResult.totalContribution)} <span className="text-sm font-normal">ر.س</span>
                                                            </p>
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
