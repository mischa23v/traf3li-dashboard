import { useState } from 'react'
import {
    ArrowLeft, Save, Loader2, Search,
    TrendingUp, Building2, Landmark, PieChart,
    Calendar, DollarSign, Hash, FileText, AlertCircle
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedStock, setSelectedStock] = useState<StockSymbol | null>(null)

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

    const handleSubmit = async () => {
        if (!formData.symbol || !formData.purchasePrice || !formData.quantity) {
            return
        }

        setIsSubmitting(true)
        try {
            // TODO: API call to create investment
            // POST /api/investments with formData
            console.log('Creating investment:', {
                ...formData,
                purchasePriceHalalas: Math.round(purchasePrice * 100),
                totalCostHalalas: Math.round(totalCost * 100),
                feesHalalas: Math.round(fees * 100),
            })

            // Navigate back to investments list
            await new Promise(resolve => setTimeout(resolve, 1000))
            navigate({ to: '/dashboard/finance/investments' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <Header>
                <TopNav>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <ThemeSwitch />
                        <ConfigDrawer />
                        <DynamicIsland />
                        <ProfileDropdown />
                    </div>
                </TopNav>
            </Header>

            <Main>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <FinanceSidebar context="investments" />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
                        {/* Hero Card */}
                        <ProductivityHero
                            badge="المحفظة الاستثمارية"
                            title="إضافة استثمار جديد"
                            type="investments"
                            listMode={true}
                            hideButtons={true}
                        >
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.symbol || !formData.purchasePrice || !formData.quantity}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save className="ml-2 h-5 w-5" />
                                        حفظ الاستثمار
                                    </>
                                )}
                            </Button>
                        </ProductivityHero>

                        {/* Back Link */}
                        <Link
                            to="/dashboard/finance/investments"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            العودة إلى المحفظة
                        </Link>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Investment Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        اختيار الاستثمار
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-navy font-bold">البحث عن السهم أو الصندوق *</Label>
                                        <StockSymbolSearch
                                            value={formData.symbol}
                                            onChange={(symbol) => handleInputChange('symbol', symbol)}
                                            onSelectStock={handleStockSelect}
                                            placeholder="ابحث برقم السهم أو الاسم..."
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            اختر من القائمة أو أدخل الرمز يدوياً
                                        </p>
                                    </div>

                                    {selectedStock && (
                                        <Alert className="bg-navy/5 border-navy/20">
                                            <AlertDescription className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
                                                    <TrendingUp className="h-5 w-5 text-navy" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-navy">{selectedStock.symbol} - {selectedStock.nameAr}</p>
                                                    <p className="text-sm text-muted-foreground">{selectedStock.nameEn} • {selectedStock.sectorAr}</p>
                                                </div>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">نوع الاستثمار *</Label>
                                            <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                                                <SelectTrigger className="rounded-xl h-12">
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
                                            <Label className="text-navy font-bold">التصنيف للتقارير</Label>
                                            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                                                <SelectTrigger className="rounded-xl h-12">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold">اسم الاستثمار (عربي)</Label>
                                                <Input
                                                    placeholder="مثال: مصرف الراجحي"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-navy font-bold">القطاع</Label>
                                                <Input
                                                    placeholder="مثال: البنوك"
                                                    value={formData.sector}
                                                    onChange={(e) => handleInputChange('sector', e.target.value)}
                                                    className="rounded-xl h-12"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Purchase Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        تفاصيل الشراء
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">تاريخ الشراء *</Label>
                                            <div className="relative">
                                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    value={formData.purchaseDate}
                                                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                                                    className="rounded-xl h-12 pr-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">سعر الوحدة (ر.س) *</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.purchasePrice}
                                                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                                    className="rounded-xl h-12 pr-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">الكمية *</Label>
                                            <div className="relative">
                                                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={formData.quantity}
                                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                    className="rounded-xl h-12 pr-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">رسوم الشراء (ر.س)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.fees}
                                                onChange={(e) => handleInputChange('fees', e.target.value)}
                                                className="rounded-xl h-12"
                                            />
                                            <p className="text-xs text-muted-foreground">عمولة الوسيط + رسوم أخرى</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-navy font-bold">السوق</Label>
                                            <Select value={formData.market} onValueChange={(v) => handleInputChange('market', v)}>
                                                <SelectTrigger className="rounded-xl h-12">
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
                                                <span>القيمة الإجمالية ({quantity} × {purchasePrice.toFixed(2)})</span>
                                                <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
                                            </div>
                                            {fees > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>الرسوم</span>
                                                    <span className="font-medium">{fees.toFixed(2)} ر.س</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between font-bold text-navy">
                                                <span>إجمالي التكلفة</span>
                                                <span>{totalCost.toFixed(2)} ر.س</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        ملاحظات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="أي ملاحظات إضافية عن هذا الاستثمار..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className="rounded-xl min-h-[100px]"
                                    />
                                </CardContent>
                            </Card>

                            {/* Info Alert */}
                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    سيتم تحديث أسعار الاستثمارات تلقائياً من السوق. يمكنك لاحقاً تسجيل التوزيعات والمبيعات.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
