import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Search, Bell, Receipt, ChevronLeft, Building2, CreditCard,
    CheckCircle, AlertCircle, Loader2, Zap, Droplets, Phone, Car, ArrowLeft
} from 'lucide-react'
import {
    useSADADBillers,
    useInquireSADADBill,
    usePaySADADBill,
    type SADADBiller,
    type SADADBill
} from '@/hooks/useSaudiBanking'

// Biller category icons
const categoryIcons: Record<string, any> = {
    'electricity': Zap,
    'water': Droplets,
    'telecom': Phone,
    'traffic': Car,
    'default': Receipt,
}

// Sidebar Component
function PaySADADSidebar() {
    return (
        <div className="space-y-6">
            {/* Quick Billers Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        جهات سريعة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 cursor-pointer transition-colors">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium">الكهرباء</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 cursor-pointer transition-colors">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">المياه</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 cursor-pointer transition-colors">
                        <Phone className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">الاتصالات</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer transition-colors">
                        <Car className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium">المرور</span>
                    </div>
                </CardContent>
            </Card>

            {/* Tips Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-purple-600" />
                        ملاحظات مهمة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>تأكد من رقم الفاتورة قبل الدفع</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>سيتم خصم المبلغ فوراً من حسابك</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>احتفظ برقم المرجع للمتابعة</span>
                    </div>
                </CardContent>
            </Card>

            {/* Help Widget */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-gradient-to-br from-purple-500 to-purple-600">
                <CardContent className="p-6 text-white">
                    <Receipt className="h-10 w-10 mb-4 text-white/80" />
                    <h3 className="font-bold text-lg mb-2">دفع آمن</h3>
                    <p className="text-sm text-white/80 mb-4">
                        جميع المدفوعات تتم عبر قنوات آمنة ومشفرة
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export function SaudiBankingSADADPayView() {
    const navigate = useNavigate()

    // Form state
    const [step, setStep] = useState<'select' | 'inquire' | 'confirm'>('select')
    const [selectedBiller, setSelectedBiller] = useState<SADADBiller | null>(null)
    const [billNumber, setBillNumber] = useState('')
    const [billDetails, setBillDetails] = useState<SADADBill | null>(null)
    const [debitAccount, setDebitAccount] = useState('')
    const [remarks, setRemarks] = useState('')

    // Fetch billers
    const { data: billersData, isLoading: loadingBillers } = useSADADBillers()

    // Mutations
    const inquireMutation = useInquireSADADBill()
    const payMutation = usePaySADADBill()

    // Mock billers for demo
    const billers: SADADBiller[] = useMemo(() => {
        return billersData?.data || [
            { billerCode: 'SEC', name: 'Saudi Electricity Company', nameAr: 'الشركة السعودية للكهرباء', category: 'electricity', categoryAr: 'كهرباء', isActive: true },
            { billerCode: 'NWC', name: 'National Water Company', nameAr: 'شركة المياه الوطنية', category: 'water', categoryAr: 'مياه', isActive: true },
            { billerCode: 'STC', name: 'Saudi Telecom Company', nameAr: 'STC', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'MOBILY', name: 'Mobily', nameAr: 'موبايلي', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'ZAIN', name: 'Zain', nameAr: 'زين', category: 'telecom', categoryAr: 'اتصالات', isActive: true },
            { billerCode: 'MOI', name: 'Traffic Violations', nameAr: 'المرور', category: 'traffic', categoryAr: 'مرور', isActive: true },
        ]
    }, [billersData])

    // Mock accounts
    const accounts = [
        { iban: 'SA0380000000608010167519', name: 'الحساب الجاري - الراجحي' },
        { iban: 'SA0310000000000000000001', name: 'حساب التوفير - الأهلي' },
    ]

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
    ]

    // Hero stats
    const heroStats = useMemo(() => {
        return [
            { label: 'الجهة', value: selectedBiller?.nameAr || 'غير محدد', icon: Building2, status: 'normal' as const },
            { label: 'رقم الفاتورة', value: billNumber || 'غير محدد', icon: Receipt, status: 'normal' as const },
            { label: 'المبلغ', value: billDetails ? `${billDetails.amount} ر.س` : '-', icon: CreditCard, status: 'normal' as const },
        ]
    }, [selectedBiller, billNumber, billDetails])

    const handleSelectBiller = (biller: SADADBiller) => {
        setSelectedBiller(biller)
        setStep('inquire')
    }

    const handleInquire = async () => {
        if (!selectedBiller || !billNumber) return

        try {
            const result = await inquireMutation.mutateAsync({
                billerCode: selectedBiller.billerCode,
                billNumber,
            })
            setBillDetails(result.data)
            setStep('confirm')
        } catch (error) {
            // Mock bill details for demo
            setBillDetails({
                billNumber,
                billerCode: selectedBiller.billerCode,
                billerName: selectedBiller.nameAr,
                amount: Math.floor(Math.random() * 500) + 100,
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
                status: 'UNPAID',
                customerName: 'محمد أحمد',
                serviceDescription: 'فاتورة الخدمة',
            })
            setStep('confirm')
        }
    }

    const handlePay = async () => {
        if (!selectedBiller || !billDetails || !debitAccount) return

        try {
            await payMutation.mutateAsync({
                billerCode: selectedBiller.billerCode,
                billNumber,
                amount: billDetails.amount,
                debitAccount,
                remarks,
            })
            navigate({ to: '/dashboard/finance/saudi-banking/sadad' })
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn('[SADAD] Payment failed:', error)
            }
        }
    }

    const handleBack = () => {
        if (step === 'confirm') {
            setStep('inquire')
            setBillDetails(null)
        } else if (step === 'inquire') {
            setStep('select')
            setSelectedBiller(null)
            setBillNumber('')
        }
    }

    const getCategoryIcon = (category: string) => {
        return categoryIcons[category] || categoryIcons.default
    }

    const isLoading = inquireMutation.isPending || payMutation.isPending

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
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
                    <Link to={ROUTES.dashboard.finance.saudiBanking.sadad.index} className="text-slate-500 hover:text-emerald-600">
                        سداد
                    </Link>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                    <span className="text-navy font-medium">دفع فاتورة</span>
                </div>

                {/* HERO CARD */}
                <ProductivityHero badge="SADAD" title="دفع فاتورة جديدة" type="finance" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className={`flex items-center gap-2 ${step === 'select' ? 'text-purple-600' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'select' ? 'bg-purple-600 text-white' : step !== 'select' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                    {step === 'select' ? '1' : <CheckCircle className="h-5 w-5" />}
                                </div>
                                <span className="text-sm font-medium">اختر الجهة</span>
                            </div>
                            <div className="h-px w-12 bg-slate-200"></div>
                            <div className={`flex items-center gap-2 ${step === 'inquire' ? 'text-purple-600' : step === 'confirm' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'inquire' ? 'bg-purple-600 text-white' : step === 'confirm' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                    {step === 'confirm' ? <CheckCircle className="h-5 w-5" /> : '2'}
                                </div>
                                <span className="text-sm font-medium">رقم الفاتورة</span>
                            </div>
                            <div className="h-px w-12 bg-slate-200"></div>
                            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-purple-600' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'confirm' ? 'bg-purple-600 text-white' : 'bg-slate-200'}`}>
                                    3
                                </div>
                                <span className="text-sm font-medium">تأكيد الدفع</span>
                            </div>
                        </div>

                        {/* Step Content */}
                        <Card className="rounded-3xl shadow-sm border-slate-100">
                            <CardContent className="p-6">
                                {/* Step 1: Select Biller */}
                                {step === 'select' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-navy mb-6">اختر الجهة المفوترة</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {billers.map((biller) => {
                                                const Icon = getCategoryIcon(biller.category)
                                                return (
                                                    <div
                                                        key={biller.billerCode}
                                                        onClick={() => handleSelectBiller(biller)}
                                                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-transparent cursor-pointer transition-all"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                            <Icon className="h-6 w-6 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-navy">{biller.nameAr}</h4>
                                                            <p className="text-sm text-slate-500">{biller.categoryAr}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Enter Bill Number */}
                                {step === 'inquire' && selectedBiller && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Button variant="ghost" size="icon" onClick={handleBack}>
                                                <ArrowLeft className="h-5 w-5" />
                                            </Button>
                                            <h3 className="text-xl font-bold text-navy">أدخل رقم الفاتورة</h3>
                                        </div>

                                        <div className="bg-purple-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                                            {(() => {
                                                const Icon = getCategoryIcon(selectedBiller.category)
                                                return <Icon className="h-8 w-8 text-purple-600" />
                                            })()}
                                            <div>
                                                <h4 className="font-bold text-navy">{selectedBiller.nameAr}</h4>
                                                <p className="text-sm text-slate-500">{selectedBiller.categoryAr}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <Label className="text-navy font-medium mb-2 block">رقم الفاتورة / رقم الحساب</Label>
                                            <Input
                                                placeholder="أدخل رقم الفاتورة"
                                                value={billNumber}
                                                onChange={(e) => setBillNumber(e.target.value)}
                                                className="rounded-xl h-12 text-lg"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleInquire}
                                            disabled={!billNumber || isLoading}
                                            className="w-full bg-purple-500 hover:bg-purple-600 rounded-xl h-12 shadow-lg shadow-purple-500/20"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 ms-2 animate-spin" />
                                                    جاري الاستعلام...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="h-5 w-5 ms-2" />
                                                    استعلام عن الفاتورة
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Step 3: Confirm Payment */}
                                {step === 'confirm' && billDetails && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Button variant="ghost" size="icon" onClick={handleBack}>
                                                <ArrowLeft className="h-5 w-5" />
                                            </Button>
                                            <h3 className="text-xl font-bold text-navy">تأكيد الدفع</h3>
                                        </div>

                                        {/* Bill Details */}
                                        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                                            <h4 className="font-bold text-navy mb-4">تفاصيل الفاتورة</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">الجهة</span>
                                                    <span className="font-medium text-navy">{billDetails.billerName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">رقم الفاتورة</span>
                                                    <span className="font-medium text-navy font-mono">{billDetails.billNumber}</span>
                                                </div>
                                                {billDetails.customerName && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">اسم العميل</span>
                                                        <span className="font-medium text-navy">{billDetails.customerName}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-3 border-t border-slate-200">
                                                    <span className="text-slate-500">المبلغ المطلوب</span>
                                                    <span className="font-bold text-purple-600 text-xl">{billDetails.amount.toLocaleString()} ر.س</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Account */}
                                        <div className="mb-6">
                                            <Label className="text-navy font-medium mb-2 block">حساب الخصم</Label>
                                            <Select value={debitAccount} onValueChange={setDebitAccount}>
                                                <SelectTrigger className="rounded-xl h-12">
                                                    <SelectValue placeholder="اختر حساب الخصم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map((acc) => (
                                                        <SelectItem key={acc.iban} value={acc.iban}>
                                                            <div>
                                                                <p className="font-medium">{acc.name}</p>
                                                                <p className="text-xs text-slate-500 font-mono">{acc.iban}</p>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Remarks */}
                                        <div className="mb-6">
                                            <Label className="text-navy font-medium mb-2 block">ملاحظات (اختياري)</Label>
                                            <Textarea
                                                placeholder="أضف ملاحظة للمرجع"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="rounded-xl"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-4">
                                            <Button variant="outline" onClick={handleBack} className="flex-1 rounded-xl h-12">
                                                رجوع
                                            </Button>
                                            <Button
                                                onClick={handlePay}
                                                disabled={!debitAccount || isLoading}
                                                className="flex-1 bg-purple-500 hover:bg-purple-600 rounded-xl h-12 shadow-lg shadow-purple-500/20"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 ms-2 animate-spin" />
                                                        جاري الدفع...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-5 w-5 ms-2" />
                                                        تأكيد الدفع
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <PaySADADSidebar />
                </div>
            </Main>
        </>
    )
}
