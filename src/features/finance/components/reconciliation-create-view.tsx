import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
    Building2, Plus, Upload, Link as LinkIcon, ArrowLeft, Search, Bell, Loader2,
    Calendar, CreditCard, DollarSign, Info, Globe, Key, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateBankFeed, useImportCSV, useImportOFX } from '@/hooks/useFinanceAdvanced'
import { Link } from '@tanstack/react-router'

export function ReconciliationCreateView() {
    const navigate = useNavigate()
    const createBankFeedMutation = useCreateBankFeed()
    const importCSVMutation = useImportCSV()
    const importOFXMutation = useImportOFX()

    // Form state
    const [connectionType, setConnectionType] = useState<'manual' | 'api' | 'csv'>('manual')
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [bankName, setBankName] = useState('')
    const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit' | 'loan'>('checking')
    const [currency, setCurrency] = useState('SAR')
    const [openingBalance, setOpeningBalance] = useState('')
    const [openingBalanceDate, setOpeningBalanceDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')

    // API connection state
    const [apiProvider, setApiProvider] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [apiSecret, setApiSecret] = useState('')
    const [apiUrl, setApiUrl] = useState('')

    // CSV import state
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const feedData = {
            accountName,
            accountNumber,
            bankName,
            accountType,
            currency,
            openingBalance: parseFloat(openingBalance) || 0,
            openingBalanceDate,
            notes,
            connectionType,
            ...(connectionType === 'api' && {
                apiConfig: {
                    provider: apiProvider,
                    apiKey,
                    apiSecret,
                    apiUrl,
                }
            }),
            isConnected: connectionType === 'api',
        }

        createBankFeedMutation.mutate(feedData, {
            onSuccess: (data) => {
                // If CSV file is selected, import it
                if (connectionType === 'csv' && csvFile && data._id) {
                    const columnMapping = {
                        date: 'date',
                        description: 'description',
                        amount: 'amount',
                        type: 'type',
                        balance: 'balance',
                    }
                    importCSVMutation.mutate({
                        id: data._id,
                        file: csvFile,
                        columnMapping,
                        dateFormat,
                    }, {
                        onSuccess: () => navigate({ to: '/dashboard/finance/reconciliation/$feedId', params: { feedId: data._id } }),
                        onError: () => navigate({ to: '/dashboard/finance/reconciliation' })
                    })
                } else {
                    navigate({ to: '/dashboard/finance/reconciliation' })
                }
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'التسوية البنكية', href: '/dashboard/finance/reconciliation', isActive: true },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/reconciliation" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى التسوية البنكية
                    </Link>
                </div>

                {/* HERO CARD */}
                <ProductivityHero badge="المالية" title="إضافة حساب بنكي جديد" type="reconciliation" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* CONNECTION TYPE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        طريقة الربط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={connectionType} onValueChange={(v) => setConnectionType(v as any)} className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                                            <TabsTrigger value="manual" className="rounded-lg">يدوي</TabsTrigger>
                                            <TabsTrigger value="csv" className="rounded-lg">استيراد CSV</TabsTrigger>
                                            <TabsTrigger value="api" className="rounded-lg">ربط API</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="manual" className="mt-4">
                                            <Alert className="rounded-xl">
                                                <Info className="h-4 w-4" aria-hidden="true" />
                                                <AlertDescription>
                                                    سيتم إدخال المعاملات البنكية يدوياً أو عبر ملفات CSV
                                                </AlertDescription>
                                            </Alert>
                                        </TabsContent>

                                        <TabsContent value="csv" className="mt-4 space-y-4">
                                            <Alert className="rounded-xl">
                                                <Upload className="h-4 w-4" aria-hidden="true" />
                                                <AlertDescription>
                                                    يمكنك استيراد المعاملات من ملف CSV بعد إنشاء الحساب
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">تنسيق التاريخ</Label>
                                                <Select value={dateFormat} onValueChange={setDateFormat}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="api" className="mt-4 space-y-4">
                                            <Alert className="rounded-xl bg-blue-50 border-blue-200">
                                                <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
                                                <AlertDescription className="text-blue-900">
                                                    الربط الآلي مع البنك عبر API (قريباً)
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-4 opacity-50 pointer-events-none">
                                                <div className="space-y-2">
                                                    <Label>مزود الخدمة</Label>
                                                    <Select value={apiProvider} onValueChange={setApiProvider}>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="اختر مزود الخدمة" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="plaid">Plaid</SelectItem>
                                                            <SelectItem value="yodlee">Yodlee</SelectItem>
                                                            <SelectItem value="finicity">Finicity</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>API Key</Label>
                                                    <Input
                                                        type="password"
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                        className="rounded-xl font-mono"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* ACCOUNT DETAILS */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الحساب البنكي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                اسم الحساب <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                placeholder="حساب المكتب الرئيسي"
                                                className="rounded-xl"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                رقم الحساب <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                placeholder="SA0000000000000000000000"
                                                className="rounded-xl font-mono"
                                                dir="ltr"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                اسم البنك <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={bankName} onValueChange={setBankName} required>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="اختر البنك" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="البنك الأهلي">البنك الأهلي</SelectItem>
                                                    <SelectItem value="مصرف الراجحي">مصرف الراجحي</SelectItem>
                                                    <SelectItem value="بنك الرياض">بنك الرياض</SelectItem>
                                                    <SelectItem value="البنك السعودي للاستثمار">البنك السعودي للاستثمار</SelectItem>
                                                    <SelectItem value="البنك العربي الوطني">البنك العربي الوطني</SelectItem>
                                                    <SelectItem value="بنك البلاد">بنك البلاد</SelectItem>
                                                    <SelectItem value="بنك الجزيرة">بنك الجزيرة</SelectItem>
                                                    <SelectItem value="بنك الإنماء">بنك الإنماء</SelectItem>
                                                    <SelectItem value="البنك الأول">البنك الأول</SelectItem>
                                                    <SelectItem value="بنك ساب">بنك ساب</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                نوع الحساب <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={accountType} onValueChange={(v: any) => setAccountType(v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="checking">حساب جاري</SelectItem>
                                                    <SelectItem value="savings">حساب توفير</SelectItem>
                                                    <SelectItem value="credit">بطاقة ائتمان</SelectItem>
                                                    <SelectItem value="loan">قرض</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                                العملة
                                            </Label>
                                            <Select value={currency} onValueChange={setCurrency}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                    <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                                                    <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الرصيد الافتتاحي
                                            </Label>
                                            <Input
                                                type="date"
                                                value={openingBalanceDate}
                                                onChange={(e) => setOpeningBalanceDate(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                            الرصيد الافتتاحي
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={openingBalance}
                                            onChange={(e) => setOpeningBalance(e.target.value)}
                                            placeholder="0.00"
                                            className="rounded-xl"
                                        />
                                        <p className="text-xs text-slate-500">
                                            أدخل الرصيد الحالي للحساب البنكي
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">ملاحظات</Label>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="ملاحظات إضافية عن الحساب..."
                                            className="rounded-xl min-h-[100px]"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <Link to="/dashboard/finance/reconciliation">
                                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 rounded-xl">
                                        إلغاء
                                    </Button>
                                </Link>

                                <Button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 px-8"
                                    disabled={createBankFeedMutation.isPending || importCSVMutation.isPending}
                                >
                                    {(createBankFeedMutation.isPending || importCSVMutation.isPending) ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                            جاري الحفظ...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" aria-hidden="true" />
                                            إضافة الحساب
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="reconciliation" />
                </div>
            </Main>
        </>
    )
}
