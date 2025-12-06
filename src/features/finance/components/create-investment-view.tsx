import { useState } from 'react'
import {
    ArrowLeft, Save, Loader2, Search,
    TrendingUp, Building2, Landmark, PieChart,
    Calendar, DollarSign, Hash, FileText, AlertCircle,
    AlertTriangle, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { StockSymbolSearch } from './stock-symbol-search'
import type { StockSymbol } from '../data/saudi-stocks'
import { useCreateInvestment } from '@/hooks/useFinance'
import { CreateInvestmentData } from '@/services/financeService'

// Investment types
const investmentTypes = [
    { value: 'stock', label: 'أسهم', icon: TrendingUp },
    { value: 'mutual_fund', label: 'صندوق استثماري', icon: PieChart },
    { value: 'etf', label: 'صندوق مؤشر', icon: PieChart },
    { value: 'reit', label: 'صندوق ريت', icon: Building2 },
    { value: 'sukuk', label: 'صكوك', icon: Landmark },
    { value: 'bond', label: 'سندات', icon: Landmark },
]

// Investment categories for reporting
const categories = [
    { value: 'equities', label: 'أسهم' },
    { value: 'fixed_income', label: 'دخل ثابت' },
    { value: 'real_estate', label: 'عقارات' },
    { value: 'mutual_funds', label: 'صناديق استثمارية' },
    { value: 'alternative', label: 'استثمارات بديلة' },
]

export default function CreateInvestmentView() {
    const navigate = useNavigate()
    const [selectedStock, setSelectedStock] = useState<StockSymbol | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // API mutation hook
    const createInvestment = useCreateInvestment()

    // Form state
    const [formData, setFormData] = useState({
        // Investment Info
        symbol: '',
        name: '',
        nameEn: '',
        type: 'stock',
        market: 'tadawul',
        category: 'equities',

        // Purchase Details
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',  // Price per unit
        quantity: '',       // Number of units
        fees: '',           // Purchase fees

        // Sector
        sector: '',
        sectorEn: '',

        // Notes
        notes: '',
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleStockSelect = (stock: StockSymbol) => {
        setSelectedStock(stock)
        setFormData(prev => ({
            ...prev,
            symbol: stock.symbol,
            name: stock.nameAr,
            nameEn: stock.nameEn,
            sector: stock.sectorAr,
            sectorEn: stock.sector,
            type: stock.type === 'reit' ? 'reit' : stock.type === 'etf' ? 'etf' : 'stock',
            category: stock.type === 'reit' ? 'real_estate' : stock.type === 'etf' ? 'mutual_funds' : 'equities',
        }))
    }

    // Calculate totals
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    const quantity = parseFloat(formData.quantity) || 0
    const fees = parseFloat(formData.fees) || 0
    const subtotal = purchasePrice * quantity
    const totalCost = subtotal + fees

    const handleSubmit = () => {
        if (!formData.symbol || !formData.purchasePrice || !formData.quantity) {
            setSubmitError('يرجى ملء جميع الحقول المطلوبة')
            return
        }

        setSubmitError(null)

        // Convert to halalas and prepare data for API
        const investmentData: CreateInvestmentData = {
            symbol: formData.symbol,
            name: formData.name,
            nameEn: formData.nameEn,
            type: formData.type as CreateInvestmentData['type'],
            market: formData.market as CreateInvestmentData['market'],
            category: formData.category,
            purchaseDate: formData.purchaseDate,
            purchasePrice: Math.round(purchasePrice * 100),   // Convert SAR to halalas
            quantity: quantity,
            fees: Math.round(fees * 100),                      // Convert SAR to halalas
            totalCost: Math.round(totalCost * 100),            // Convert SAR to halalas
            sector: formData.sector,
            sectorEn: formData.sectorEn,
            notes: formData.notes,
        }

        createInvestment.mutate(investmentData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/investments' })
            },
            onError: (error) => {
                setSubmitError(error.message || 'حدث خطأ أثناء إنشاء الاستثمار')
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'الاستثمارات', href: '/dashboard/finance/investments', isActive: true },
    ]

    return (
        <>
            {/* Header - Matches Tasks Layout */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
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

                {/* HERO CARD - Same as create task */}
                <ProductivityHero badge="المحفظة الاستثمارية" title="إضافة استثمار جديد" type="investments" listMode={true} />

                {/* MAIN GRID LAYOUT - Same as create task */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <div className="space-y-8">

                                {/* Investment Selection Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
                                        <Search className="w-5 h-5 text-emerald-500" />
                                        اختيار الاستثمار
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            البحث عن السهم أو الصندوق <span className="text-red-500">*</span>
                                        </label>
                                        <StockSymbolSearch
                                            value={formData.symbol}
                                            onChange={(symbol) => handleInputChange('symbol', symbol)}
                                            onSelectStock={handleStockSelect}
                                            placeholder="ابحث برقم السهم أو الاسم..."
                                        />
                                        <p className="text-sm text-slate-500">
                                            اختر من القائمة أو أدخل الرمز يدوياً
                                        </p>
                                    </div>

                                    {selectedStock && (
                                        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3 border border-emerald-100">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-navy">{selectedStock.symbol} - {selectedStock.nameAr}</p>
                                                <p className="text-sm text-slate-600">{selectedStock.nameEn} • {selectedStock.sectorAr}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <PieChart className="w-4 h-4 text-emerald-500" />
                                                نوع الاستثمار <span className="text-red-500">*</span>
                                            </label>
                                            <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {investmentTypes.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div className="flex items-center gap-2">
                                                                <type.icon className="h-4 w-4" />
                                                                {type.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-500" />
                                                التصنيف للتقارير
                                            </label>
                                            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {!selectedStock && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">اسم الاستثمار (عربي)</label>
                                                <Input
                                                    placeholder="مثال: مصرف الراجحي"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">القطاع</label>
                                                <Input
                                                    placeholder="مثال: البنوك"
                                                    value={formData.sector}
                                                    onChange={(e) => handleInputChange('sector', e.target.value)}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Purchase Details Section */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        تفاصيل الشراء
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الشراء <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.purchaseDate}
                                                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                سعر الوحدة (ر.س) <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.purchasePrice}
                                                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                الكمية <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.quantity}
                                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">رسوم الشراء (ر.س)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.fees}
                                                onChange={(e) => handleInputChange('fees', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                            <p className="text-xs text-slate-500">عمولة الوسيط + رسوم أخرى</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Landmark className="w-4 h-4 text-emerald-500" />
                                                السوق
                                            </label>
                                            <Select value={formData.market} onValueChange={(v) => handleInputChange('market', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tadawul">السوق السعودي (تداول)</SelectItem>
                                                    <SelectItem value="international">الأسواق العالمية</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Cost Summary */}
                                    {(purchasePrice > 0 || quantity > 0) && (
                                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">القيمة الإجمالية ({quantity} × {purchasePrice.toFixed(2)})</span>
                                                <span className="font-medium text-slate-900">{subtotal.toFixed(2)} ر.س</span>
                                            </div>
                                            {fees > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">الرسوم</span>
                                                    <span className="font-medium text-slate-900">{fees.toFixed(2)} ر.س</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between font-bold">
                                                <span className="text-navy">إجمالي التكلفة</span>
                                                <span className="text-emerald-600">{totalCost.toFixed(2)} ر.س</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div className="border-t border-slate-100 pt-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        ملاحظات
                                    </h3>
                                    <Textarea
                                        placeholder="أي ملاحظات إضافية عن هذا الاستثمار..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Error Alert */}
                                {submitError && (
                                    <Alert className="bg-red-50 border-red-200 rounded-xl">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            {submitError}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Info Alert */}
                                <Alert className="bg-blue-50 border-blue-200 rounded-xl">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        سيتم تحديث أسعار الاستثمارات تلقائياً من السوق. يمكنك لاحقاً تسجيل التوزيعات والمبيعات.
                                    </AlertDescription>
                                </Alert>

                                {/* Submit Button */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/investments">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={createInvestment.isPending || !formData.symbol || !formData.purchasePrice || !formData.quantity}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                    >
                                        {createInvestment.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ الاستثمار
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="investments" />
                </div>
            </Main>
        </>
    )
}
