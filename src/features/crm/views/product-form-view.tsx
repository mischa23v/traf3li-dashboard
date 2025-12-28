import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, FileText, Package, DollarSign, Settings,
    Plus, X, ChevronDown, ChevronUp, Loader2, Tag,
    Barcode, Truck, Box, Layers, Image, Calculator,
    Warehouse, Scale, Ruler, Globe, Percent, Building2,
    Users, ShoppingCart, TrendingUp, Clock, Calendar,
    AlertTriangle, Info, Star, Target, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS - Enterprise ERP Standards (Odoo/ERPNext/SAP)
// ═══════════════════════════════════════════════════════════════

const PRODUCT_TYPES = [
    { value: 'service', labelAr: 'خدمة', labelEn: 'Service', icon: Users },
    { value: 'stockable', labelAr: 'منتج مخزني', labelEn: 'Stockable Product', icon: Warehouse },
    { value: 'consumable', labelAr: 'مستهلك', labelEn: 'Consumable', icon: Box },
    { value: 'digital', labelAr: 'رقمي', labelEn: 'Digital', icon: Globe },
    { value: 'subscription', labelAr: 'اشتراك', labelEn: 'Subscription', icon: Calendar },
    { value: 'bundle', labelAr: 'حزمة', labelEn: 'Bundle/Kit', icon: Layers },
]

const COSTING_METHODS = [
    { value: 'standard', labelAr: 'تكلفة معيارية', labelEn: 'Standard Cost' },
    { value: 'average', labelAr: 'متوسط التكلفة', labelEn: 'Average Cost (AVCO)' },
    { value: 'fifo', labelAr: 'الوارد أولاً صادر أولاً', labelEn: 'First In First Out (FIFO)' },
    { value: 'lifo', labelAr: 'الوارد أخيراً صادر أولاً', labelEn: 'Last In First Out (LIFO)' },
    { value: 'specific', labelAr: 'تكلفة محددة', labelEn: 'Specific Identification' },
]

const UNITS_OF_MEASURE = [
    { value: 'unit', labelAr: 'وحدة', labelEn: 'Unit' },
    { value: 'hour', labelAr: 'ساعة', labelEn: 'Hour' },
    { value: 'day', labelAr: 'يوم', labelEn: 'Day' },
    { value: 'week', labelAr: 'أسبوع', labelEn: 'Week' },
    { value: 'month', labelAr: 'شهر', labelEn: 'Month' },
    { value: 'piece', labelAr: 'قطعة', labelEn: 'Piece' },
    { value: 'kg', labelAr: 'كيلوجرام', labelEn: 'Kilogram' },
    { value: 'g', labelAr: 'جرام', labelEn: 'Gram' },
    { value: 'l', labelAr: 'لتر', labelEn: 'Liter' },
    { value: 'ml', labelAr: 'مليلتر', labelEn: 'Milliliter' },
    { value: 'm', labelAr: 'متر', labelEn: 'Meter' },
    { value: 'cm', labelAr: 'سنتيمتر', labelEn: 'Centimeter' },
    { value: 'sqm', labelAr: 'متر مربع', labelEn: 'Square Meter' },
    { value: 'box', labelAr: 'صندوق', labelEn: 'Box' },
    { value: 'pack', labelAr: 'عبوة', labelEn: 'Pack' },
    { value: 'dozen', labelAr: 'دزينة', labelEn: 'Dozen' },
]

const BARCODE_TYPES = [
    { value: 'ean13', labelAr: 'EAN-13', labelEn: 'EAN-13' },
    { value: 'ean8', labelAr: 'EAN-8', labelEn: 'EAN-8' },
    { value: 'upc', labelAr: 'UPC', labelEn: 'UPC' },
    { value: 'code128', labelAr: 'Code 128', labelEn: 'Code 128' },
    { value: 'code39', labelAr: 'Code 39', labelEn: 'Code 39' },
    { value: 'qr', labelAr: 'QR Code', labelEn: 'QR Code' },
    { value: 'internal', labelAr: 'رمز داخلي', labelEn: 'Internal' },
]

const WEIGHT_UNITS = [
    { value: 'kg', labelAr: 'كجم', labelEn: 'kg' },
    { value: 'g', labelAr: 'جم', labelEn: 'g' },
    { value: 'lb', labelAr: 'رطل', labelEn: 'lb' },
    { value: 'oz', labelAr: 'أونصة', labelEn: 'oz' },
]

const DIMENSION_UNITS = [
    { value: 'cm', labelAr: 'سم', labelEn: 'cm' },
    { value: 'm', labelAr: 'م', labelEn: 'm' },
    { value: 'in', labelAr: 'بوصة', labelEn: 'in' },
    { value: 'ft', labelAr: 'قدم', labelEn: 'ft' },
]

const TAX_CATEGORIES = [
    { value: 'standard', labelAr: 'ضريبة قياسية 15%', labelEn: 'Standard VAT 15%', rate: 15 },
    { value: 'reduced', labelAr: 'ضريبة مخفضة 5%', labelEn: 'Reduced VAT 5%', rate: 5 },
    { value: 'zero', labelAr: 'صفر ضريبة', labelEn: 'Zero Rated', rate: 0 },
    { value: 'exempt', labelAr: 'معفى', labelEn: 'Exempt', rate: 0 },
]

const OFFICE_TYPES = [
    { value: 'individual', labelAr: 'محامي فردي', labelEn: 'Individual Lawyer' },
    { value: 'small', labelAr: 'مكتب صغير', labelEn: 'Small Office' },
    { value: 'medium', labelAr: 'مكتب متوسط', labelEn: 'Medium Office' },
    { value: 'firm', labelAr: 'شركة محاماة', labelEn: 'Law Firm' },
]

interface ProductFormViewProps {
    editMode?: boolean
    productId?: string
    initialData?: any
}

export function ProductFormView({ editMode = false, productId, initialData }: ProductFormViewProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createProductMutation = useCreateProduct()
    const updateProductMutation = useUpdateProduct()

    const isArabic = i18n.language === 'ar'

    // Form state - Ultimate Enterprise Version (Odoo/ERPNext/SAP Compatible)
    const [formData, setFormData] = useState({
        // ═══ BASIC INFO ═══
        name: '',
        nameAr: '',
        sku: '',
        internalRef: '',
        category: '',
        subCategory: '',
        brand: '',
        description: '',
        descriptionAr: '',
        shortDescription: '',
        shortDescriptionAr: '',

        // ═══ PRODUCT TYPE ═══
        productType: 'service', // service, stockable, consumable, digital, subscription, bundle
        officeType: 'individual', // individual, small, medium, firm

        // ═══ PRICING - Multi-tier like Odoo/ERPNext ═══
        basePrice: 0,
        cost: 0,
        currency: 'SAR',
        minimumPrice: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        memberPrice: 0,
        msrp: 0, // Manufacturer's Suggested Retail Price
        costingMethod: 'average', // standard, average, fifo, lifo, specific
        marginPercent: 0,
        markupPercent: 0,

        // ═══ TAX ═══
        taxCategory: 'standard',
        taxRate: 15,
        isTaxable: true,
        hsCode: '', // Harmonized System code for customs

        // ═══ UNITS OF MEASURE - Like Odoo ═══
        baseUnit: 'unit',
        salesUnit: 'unit',
        purchaseUnit: 'unit',
        unitConversions: [] as { fromUnit: string; toUnit: string; factor: number }[],

        // ═══ BARCODES - Multiple like ERPNext ═══
        primaryBarcode: '',
        barcodeType: 'ean13',
        additionalBarcodes: [] as { code: string; type: string; description: string }[],

        // ═══ INVENTORY/STOCK - Like Odoo/ERPNext ═══
        trackStock: false,
        stockOnHand: 0,
        reservedStock: 0,
        reorderLevel: 0,
        reorderQuantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        safetyStock: 0,
        defaultWarehouse: '',
        stockValuation: 0,

        // ═══ PHYSICAL ATTRIBUTES - Like SAP ═══
        weight: 0,
        weightUnit: 'kg',
        length: 0,
        width: 0,
        height: 0,
        dimensionUnit: 'cm',
        volume: 0,
        volumeUnit: 'l',

        // ═══ SUPPLIERS - Multiple like ERPNext ═══
        suppliers: [] as {
            supplierId: string;
            supplierName: string;
            supplierCode: string;
            isPrimary: boolean;
            price: number;
            currency: string;
            leadTimeDays: number;
            minOrderQty: number;
        }[],
        defaultSupplier: '',

        // ═══ VARIANTS - Like Odoo ═══
        hasVariants: false,
        variantAttributes: [] as { name: string; nameAr: string; values: string[] }[],

        // ═══ IMAGES ═══
        images: [] as { url: string; isPrimary: boolean; alt: string }[],
        primaryImage: '',

        // ═══ SERVICE-SPECIFIC (for law firms) ═══
        practiceArea: '',
        serviceType: '', // consultation, representation, document, research
        estimatedDuration: 0,
        durationUnit: 'hour',
        requiresAppointment: false,
        allowOnlineBooking: false,

        // ═══ SUBSCRIPTION-SPECIFIC ═══
        subscriptionPeriod: 'monthly',
        subscriptionPrice: 0,
        trialDays: 0,
        autoRenew: true,

        // ═══ BUNDLE-SPECIFIC ═══
        bundleItems: [] as { productId: string; productName: string; quantity: number }[],

        // ═══ DATES & LIFECYCLE ═══
        launchDate: '',
        endOfLifeDate: '',
        warrantyPeriod: 0,
        warrantyUnit: 'month',
        shelfLife: 0,
        shelfLifeUnit: 'day',

        // ═══ SEO & WEB ═══
        seoTitle: '',
        seoDescription: '',
        slug: '',
        metaKeywords: [] as string[],

        // ═══ ACCOUNTING ═══
        revenueAccount: '',
        expenseAccount: '',
        inventoryAccount: '',

        // ═══ STATUS & FLAGS ═══
        isActive: true,
        isSellable: true,
        isPurchasable: true,
        isFeatured: false,
        isNewArrival: false,
        allowDiscount: true,
        allowReturn: true,
        requiresShipping: false,
        isDigitalDelivery: false,

        // ═══ NOTES & CUSTOM ═══
        tags: [] as string[],
        internalNotes: '',
        customerNotes: '',
        customFields: {} as Record<string, any>,
    })

    // Section toggles
    const [showSettings, setShowSettings] = useState(false)
    const [showAdditional, setShowAdditional] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')

    // Tags input
    const [tagInput, setTagInput] = useState('')
    const [barcodeInput, setBarcodeInput] = useState({ code: '', type: 'ean13', description: '' })

    // Calculate margin when cost/price changes
    useEffect(() => {
        if (formData.basePrice > 0 && formData.cost > 0) {
            const margin = ((formData.basePrice - formData.cost) / formData.basePrice) * 100
            const markup = ((formData.basePrice - formData.cost) / formData.cost) * 100
            setFormData(prev => ({
                ...prev,
                marginPercent: parseFloat(margin.toFixed(2)),
                markupPercent: parseFloat(markup.toFixed(2))
            }))
        }
    }, [formData.basePrice, formData.cost])

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Load initial data in edit mode
    useEffect(() => {
        if (editMode && initialData) {
            setFormData({
                name: initialData.name || '',
                nameAr: initialData.nameAr || '',
                sku: initialData.sku || '',
                category: initialData.category || '',
                description: initialData.description || '',
                descriptionAr: initialData.descriptionAr || '',
                basePrice: initialData.basePrice || 0,
                cost: initialData.cost || 0,
                currency: initialData.currency || 'SAR',
                taxRate: initialData.taxRate || 15,
                unit: initialData.unit || 'service',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                isTaxable: initialData.isTaxable !== undefined ? initialData.isTaxable : true,
                tags: initialData.tags || [],
            })
        }
    }, [editMode, initialData])

    // Validate a single field
    const validateField = (field: string, value: any): string => {
        if (field === 'name' && !value?.trim()) {
            return 'اسم المنتج مطلوب'
        }
        if (field === 'sku' && !value?.trim()) {
            return 'رمز المنتج مطلوب'
        }
        if (field === 'basePrice' && (!value || value <= 0)) {
            return 'السعر يجب أن يكون أكبر من صفر'
        }
        return ''
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        const nameError = validateField('name', formData.name)
        if (nameError) newErrors.name = nameError

        const skuError = validateField('sku', formData.sku)
        if (skuError) newErrors.sku = skuError

        const priceError = validateField('basePrice', formData.basePrice)
        if (priceError) newErrors.basePrice = priceError

        setErrors(newErrors)
        setTouched({
            name: true,
            sku: true,
            basePrice: true,
        })

        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (touched[field] && errors[field]) {
            const error = validateField(field, value)
            setErrors(prev => ({ ...prev, [field]: error }))
        }
    }

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleChange('tags', [...formData.tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        handleChange('tags', formData.tags.filter(t => t !== tag))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const productData = {
            name: formData.name,
            nameAr: formData.nameAr,
            sku: formData.sku,
            category: formData.category,
            description: formData.description,
            descriptionAr: formData.descriptionAr,
            basePrice: formData.basePrice,
            cost: formData.cost,
            currency: formData.currency,
            taxRate: formData.taxRate,
            unit: formData.unit,
            isActive: formData.isActive,
            isTaxable: formData.isTaxable,
            tags: formData.tags,
        }

        if (editMode && productId) {
            updateProductMutation.mutate({ id: productId, ...productData }, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.products.list })
                }
            })
        } else {
            createProductMutation.mutate(productData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.products.list })
                }
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
        { title: 'إدارة علاقات العملاء', href: ROUTES.dashboard.crm.products.list, isActive: true },
    ]

    const isLoading = createProductMutation.isPending || updateProductMutation.isPending

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
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge="إدارة المنتجات"
                    title={editMode ? "تعديل منتج" : "إضافة منتج جديد"}
                    type="crm"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* OFFICE TYPE SELECTOR - Like Invoice Module */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-emerald-500" />
                                        {isArabic ? 'نوع المكتب' : 'Office Type'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {OFFICE_TYPES.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => handleChange('officeType', type.value)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-center transition-all",
                                                    formData.officeType === type.value
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                                                )}
                                            >
                                                <Building2 className={cn(
                                                    "w-6 h-6 mx-auto mb-2",
                                                    formData.officeType === type.value ? "text-emerald-500" : "text-slate-400"
                                                )} />
                                                <span className="text-sm font-medium">
                                                    {isArabic ? type.labelAr : type.labelEn}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* PRODUCT TYPE SELECTOR */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-emerald-500" />
                                        {isArabic ? 'نوع المنتج' : 'Product Type'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {PRODUCT_TYPES.map((type) => {
                                            const Icon = type.icon
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handleChange('productType', type.value)}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 text-center transition-all",
                                                        formData.productType === type.value
                                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 mx-auto mb-1",
                                                        formData.productType === type.value ? "text-emerald-500" : "text-slate-400"
                                                    )} />
                                                    <span className="text-xs font-medium">
                                                        {isArabic ? type.labelAr : type.labelEn}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Separator />

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* TABBED SECTIONS - Enterprise ERP Style */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 bg-slate-100 rounded-xl p-1">
                                        <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white">
                                            <FileText className="w-4 h-4 me-2" />
                                            {isArabic ? 'أساسي' : 'Basic'}
                                        </TabsTrigger>
                                        <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-white">
                                            <DollarSign className="w-4 h-4 me-2" />
                                            {isArabic ? 'التسعير' : 'Pricing'}
                                        </TabsTrigger>
                                        <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-white">
                                            <Warehouse className="w-4 h-4 me-2" />
                                            {isArabic ? 'المخزون' : 'Inventory'}
                                        </TabsTrigger>
                                        <TabsTrigger value="attributes" className="rounded-lg data-[state=active]:bg-white">
                                            <Scale className="w-4 h-4 me-2" />
                                            {isArabic ? 'السمات' : 'Attributes'}
                                        </TabsTrigger>
                                        <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:bg-white">
                                            <Truck className="w-4 h-4 me-2" />
                                            {isArabic ? 'الموردين' : 'Suppliers'}
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* ═══ TAB 1: BASIC INFO ═══ */}
                                    <TabsContent value="basic" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: Legal Consultation" : "e.g., Legal Consultation"}
                                                    className={cn(
                                                        "rounded-xl border-slate-200 focus:border-emerald-500",
                                                        touched.name && errors.name && "border-red-500"
                                                    )}
                                                    value={formData.name}
                                                    onChange={(e) => handleChange('name', e.target.value)}
                                                    onBlur={() => handleBlur('name')}
                                                />
                                                {touched.name && errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: استشارة قانونية" : "e.g., استشارة قانونية"}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500"
                                                    value={formData.nameAr}
                                                    onChange={(e) => handleChange('nameAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'رمز المنتج (SKU)' : 'SKU'}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder="CONS-001"
                                                    className={cn(
                                                        "rounded-xl border-slate-200",
                                                        touched.sku && errors.sku && "border-red-500"
                                                    )}
                                                    value={formData.sku}
                                                    onChange={(e) => handleChange('sku', e.target.value)}
                                                    onBlur={() => handleBlur('sku')}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'المرجع الداخلي' : 'Internal Reference'}
                                                </label>
                                                <Input
                                                    placeholder="REF-001"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.internalRef}
                                                    onChange={(e) => handleChange('internalRef', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'العلامة التجارية' : 'Brand'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "اسم العلامة" : "Brand name"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.brand}
                                                    onChange={(e) => handleChange('brand', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'التصنيف الرئيسي' : 'Main Category'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "استشارات قانونية" : "Legal Services"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.category}
                                                    onChange={(e) => handleChange('category', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Tag className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'التصنيف الفرعي' : 'Sub-Category'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "قانون تجاري" : "Commercial Law"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.subCategory}
                                                    onChange={(e) => handleChange('subCategory', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Barcodes Section */}
                                        <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                                <Barcode className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'الباركود' : 'Barcodes'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الباركود الرئيسي' : 'Primary Barcode'}</label>
                                                    <Input
                                                        placeholder="123456789012"
                                                        value={formData.primaryBarcode}
                                                        onChange={(e) => handleChange('primaryBarcode', e.target.value)}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'نوع الباركود' : 'Barcode Type'}</label>
                                                    <Select value={formData.barcodeType} onValueChange={(v) => handleChange('barcodeType', v)}>
                                                        <SelectTrigger className="rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {BARCODE_TYPES.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {isArabic ? type.labelAr : type.labelEn}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'رمز الجمارك (HS)' : 'HS Code'}</label>
                                                    <Input
                                                        placeholder="8471.30"
                                                        value={formData.hsCode}
                                                        onChange={(e) => handleChange('hsCode', e.target.value)}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "وصف المنتج بالإنجليزية..." : "Product description..."}
                                                className="min-h-[100px] rounded-xl border-slate-200"
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "وصف المنتج بالعربية..." : "وصف المنتج..."}
                                                className="min-h-[100px] rounded-xl border-slate-200"
                                                value={formData.descriptionAr}
                                                onChange={(e) => handleChange('descriptionAr', e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 2: PRICING ═══ */}
                                    <TabsContent value="pricing" className="space-y-6 mt-6">
                                        {/* Primary Pricing */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'سعر البيع' : 'Selling Price'}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="number" min="0" step="0.01"
                                                    className={cn("rounded-xl", touched.basePrice && errors.basePrice && "border-red-500")}
                                                    value={formData.basePrice || ''}
                                                    onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calculator className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'التكلفة' : 'Cost'}
                                                </label>
                                                <Input
                                                    type="number" min="0" step="0.01"
                                                    className="rounded-xl"
                                                    value={formData.cost || ''}
                                                    onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'هامش الربح %' : 'Margin %'}
                                                </label>
                                                <Input
                                                    type="number" readOnly
                                                    className="rounded-xl bg-emerald-50 text-emerald-700 font-bold"
                                                    value={formData.marginPercent || 0}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'العملة' : 'Currency'}
                                                </label>
                                                <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Multi-tier Pricing - Like Odoo */}
                                        <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                {isArabic ? 'تسعير متعدد المستويات' : 'Multi-tier Pricing'}
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الحد الأدنى للسعر' : 'Minimum Price'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.minimumPrice || ''}
                                                        onChange={(e) => handleChange('minimumPrice', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'سعر الجملة' : 'Wholesale Price'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.wholesalePrice || ''}
                                                        onChange={(e) => handleChange('wholesalePrice', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'سعر التجزئة' : 'Retail Price'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.retailPrice || ''}
                                                        onChange={(e) => handleChange('retailPrice', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'سعر الأعضاء' : 'Member Price'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.memberPrice || ''}
                                                        onChange={(e) => handleChange('memberPrice', parseFloat(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Costing Method */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calculator className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'طريقة التكلفة' : 'Costing Method'}
                                                </label>
                                                <Select value={formData.costingMethod} onValueChange={(v) => handleChange('costingMethod', v)}>
                                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {COSTING_METHODS.map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {isArabic ? method.labelAr : method.labelEn}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Percent className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'فئة الضريبة' : 'Tax Category'}
                                                </label>
                                                <Select value={formData.taxCategory} onValueChange={(v) => {
                                                    const tax = TAX_CATEGORIES.find(t => t.value === v)
                                                    handleChange('taxCategory', v)
                                                    if (tax) handleChange('taxRate', tax.rate)
                                                }}>
                                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {TAX_CATEGORIES.map((tax) => (
                                                            <SelectItem key={tax.value} value={tax.value}>
                                                                {isArabic ? tax.labelAr : tax.labelEn}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 3: INVENTORY ═══ */}
                                    <TabsContent value="inventory" className="space-y-6 mt-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Warehouse className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <p className="font-medium">{isArabic ? 'تتبع المخزون' : 'Track Inventory'}</p>
                                                    <p className="text-xs text-slate-500">{isArabic ? 'تفعيل إدارة المخزون لهذا المنتج' : 'Enable stock management'}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.trackStock}
                                                onCheckedChange={(checked) => handleChange('trackStock', checked)}
                                            />
                                        </div>

                                        {formData.trackStock && (
                                            <>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الكمية الحالية' : 'Stock on Hand'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.stockOnHand || ''}
                                                            onChange={(e) => handleChange('stockOnHand', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حد إعادة الطلب' : 'Reorder Level'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.reorderLevel || ''}
                                                            onChange={(e) => handleChange('reorderLevel', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'كمية إعادة الطلب' : 'Reorder Quantity'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.reorderQuantity || ''}
                                                            onChange={(e) => handleChange('reorderQuantity', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'مخزون الأمان' : 'Safety Stock'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.safetyStock || ''}
                                                            onChange={(e) => handleChange('safetyStock', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الحد الأدنى للمخزون' : 'Min Stock Level'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.minStockLevel || ''}
                                                            onChange={(e) => handleChange('minStockLevel', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الحد الأقصى للمخزون' : 'Max Stock Level'}</label>
                                                        <Input type="number" min="0" className="rounded-lg"
                                                            value={formData.maxStockLevel || ''}
                                                            onChange={(e) => handleChange('maxStockLevel', parseInt(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'المستودع الافتراضي' : 'Default Warehouse'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "المستودع الرئيسي" : "Main Warehouse"}
                                                            value={formData.defaultWarehouse}
                                                            onChange={(e) => handleChange('defaultWarehouse', e.target.value)} />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Units of Measure */}
                                        <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-amber-800 flex items-center gap-2">
                                                <Scale className="w-4 h-4" />
                                                {isArabic ? 'وحدات القياس' : 'Units of Measure'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الوحدة الأساسية' : 'Base Unit'}</label>
                                                    <Select value={formData.baseUnit} onValueChange={(v) => handleChange('baseUnit', v)}>
                                                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {UNITS_OF_MEASURE.map((unit) => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {isArabic ? unit.labelAr : unit.labelEn}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'وحدة البيع' : 'Sales Unit'}</label>
                                                    <Select value={formData.salesUnit} onValueChange={(v) => handleChange('salesUnit', v)}>
                                                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {UNITS_OF_MEASURE.map((unit) => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {isArabic ? unit.labelAr : unit.labelEn}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'وحدة الشراء' : 'Purchase Unit'}</label>
                                                    <Select value={formData.purchaseUnit} onValueChange={(v) => handleChange('purchaseUnit', v)}>
                                                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {UNITS_OF_MEASURE.map((unit) => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {isArabic ? unit.labelAr : unit.labelEn}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 4: PHYSICAL ATTRIBUTES ═══ */}
                                    <TabsContent value="attributes" className="space-y-6 mt-6">
                                        {/* Weight & Dimensions */}
                                        <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'الوزن والأبعاد' : 'Weight & Dimensions'}
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الوزن' : 'Weight'}</label>
                                                    <div className="flex gap-2">
                                                        <Input type="number" min="0" step="0.01" className="rounded-lg flex-1"
                                                            value={formData.weight || ''}
                                                            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)} />
                                                        <Select value={formData.weightUnit} onValueChange={(v) => handleChange('weightUnit', v)}>
                                                            <SelectTrigger className="w-20 rounded-lg"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {WEIGHT_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.labelEn}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الطول' : 'Length'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.length || ''}
                                                        onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'العرض' : 'Width'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.width || ''}
                                                        onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الارتفاع' : 'Height'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.height || ''}
                                                        onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الوحدة' : 'Unit'}</label>
                                                    <Select value={formData.dimensionUnit} onValueChange={(v) => handleChange('dimensionUnit', v)}>
                                                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {DIMENSION_UNITS.map((u) => <SelectItem key={u.value} value={u.value}>{u.labelEn}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service-specific fields */}
                                        {formData.productType === 'service' && (
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    {isArabic ? 'تفاصيل الخدمة' : 'Service Details'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'مجال الممارسة' : 'Practice Area'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قانون تجاري" : "Commercial Law"}
                                                            value={formData.practiceArea}
                                                            onChange={(e) => handleChange('practiceArea', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'المدة المتوقعة' : 'Estimated Duration'}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="number" min="0" className="rounded-lg flex-1"
                                                                value={formData.estimatedDuration || ''}
                                                                onChange={(e) => handleChange('estimatedDuration', parseInt(e.target.value) || 0)} />
                                                            <Select value={formData.durationUnit} onValueChange={(v) => handleChange('durationUnit', v)}>
                                                                <SelectTrigger className="w-24 rounded-lg"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="hour">{isArabic ? 'ساعة' : 'Hour'}</SelectItem>
                                                                    <SelectItem value="day">{isArabic ? 'يوم' : 'Day'}</SelectItem>
                                                                    <SelectItem value="week">{isArabic ? 'أسبوع' : 'Week'}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4 pt-4">
                                                        <div className="flex items-center gap-2">
                                                            <Switch checked={formData.requiresAppointment}
                                                                onCheckedChange={(c) => handleChange('requiresAppointment', c)} />
                                                            <label className="text-xs">{isArabic ? 'يتطلب موعد' : 'Requires Appointment'}</label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Switch checked={formData.allowOnlineBooking}
                                                                onCheckedChange={(c) => handleChange('allowOnlineBooking', c)} />
                                                            <label className="text-xs">{isArabic ? 'حجز أونلاين' : 'Allow Online Booking'}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'الوسوم' : 'Tags'}
                                            </label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {formData.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="gap-1">
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input placeholder={isArabic ? "أضف وسم..." : "Add tag..."}
                                                    className="rounded-xl flex-1" value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                                                <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 5: SUPPLIERS ═══ */}
                                    <TabsContent value="suppliers" className="space-y-6 mt-6">
                                        <div className="text-center p-8 bg-slate-50 rounded-xl">
                                            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <h4 className="font-medium text-slate-600 mb-2">
                                                {isArabic ? 'إدارة الموردين' : 'Supplier Management'}
                                            </h4>
                                            <p className="text-sm text-slate-500 mb-4">
                                                {isArabic ? 'أضف موردين متعددين مع أسعارهم ومهل التسليم' : 'Add multiple suppliers with their prices and lead times'}
                                            </p>
                                            <Button type="button" variant="outline" className="rounded-xl">
                                                <Plus className="w-4 h-4 me-2" />
                                                {isArabic ? 'إضافة مورد' : 'Add Supplier'}
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* ADVANCED SECTION - Collapsible at Bottom */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                    <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-8">
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-xl border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Settings className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-lg font-semibold text-slate-800">
                                                            {isArabic ? 'الإعدادات المتقدمة' : 'Advanced Settings'}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            {isArabic ? 'إعدادات إضافية، SEO، المحاسبة، ودورة حياة المنتج' : 'Additional settings, SEO, accounting, and product lifecycle'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="mt-6 space-y-6">
                                            {/* Status Flags */}
                                            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                    {isArabic ? 'حالة المنتج' : 'Product Status'}
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.isActive} onCheckedChange={(c) => handleChange('isActive', c)} />
                                                        <label className="text-sm">{isArabic ? 'نشط' : 'Active'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.isSellable} onCheckedChange={(c) => handleChange('isSellable', c)} />
                                                        <label className="text-sm">{isArabic ? 'قابل للبيع' : 'Sellable'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.isPurchasable} onCheckedChange={(c) => handleChange('isPurchasable', c)} />
                                                        <label className="text-sm">{isArabic ? 'قابل للشراء' : 'Purchasable'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.isTaxable} onCheckedChange={(c) => handleChange('isTaxable', c)} />
                                                        <label className="text-sm">{isArabic ? 'خاضع للضريبة' : 'Taxable'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.isFeatured} onCheckedChange={(c) => handleChange('isFeatured', c)} />
                                                        <label className="text-sm">{isArabic ? 'مميز' : 'Featured'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.allowDiscount} onCheckedChange={(c) => handleChange('allowDiscount', c)} />
                                                        <label className="text-sm">{isArabic ? 'يسمح بالخصم' : 'Allow Discount'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.allowReturn} onCheckedChange={(c) => handleChange('allowReturn', c)} />
                                                        <label className="text-sm">{isArabic ? 'قابل للإرجاع' : 'Returnable'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.requiresShipping} onCheckedChange={(c) => handleChange('requiresShipping', c)} />
                                                        <label className="text-sm">{isArabic ? 'يتطلب شحن' : 'Requires Shipping'}</label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lifecycle Dates */}
                                            <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {isArabic ? 'دورة حياة المنتج' : 'Product Lifecycle'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'تاريخ الإطلاق' : 'Launch Date'}</label>
                                                        <Input type="date" className="rounded-lg"
                                                            value={formData.launchDate}
                                                            onChange={(e) => handleChange('launchDate', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'تاريخ انتهاء الصلاحية' : 'End of Life Date'}</label>
                                                        <Input type="date" className="rounded-lg"
                                                            value={formData.endOfLifeDate}
                                                            onChange={(e) => handleChange('endOfLifeDate', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'فترة الضمان' : 'Warranty Period'}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="number" min="0" className="rounded-lg flex-1"
                                                                value={formData.warrantyPeriod || ''}
                                                                onChange={(e) => handleChange('warrantyPeriod', parseInt(e.target.value) || 0)} />
                                                            <Select value={formData.warrantyUnit} onValueChange={(v) => handleChange('warrantyUnit', v)}>
                                                                <SelectTrigger className="w-24 rounded-lg"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="day">{isArabic ? 'يوم' : 'Day'}</SelectItem>
                                                                    <SelectItem value="month">{isArabic ? 'شهر' : 'Month'}</SelectItem>
                                                                    <SelectItem value="year">{isArabic ? 'سنة' : 'Year'}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'مدة الصلاحية' : 'Shelf Life'}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="number" min="0" className="rounded-lg flex-1"
                                                                value={formData.shelfLife || ''}
                                                                onChange={(e) => handleChange('shelfLife', parseInt(e.target.value) || 0)} />
                                                            <Select value={formData.shelfLifeUnit} onValueChange={(v) => handleChange('shelfLifeUnit', v)}>
                                                                <SelectTrigger className="w-24 rounded-lg"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="day">{isArabic ? 'يوم' : 'Day'}</SelectItem>
                                                                    <SelectItem value="month">{isArabic ? 'شهر' : 'Month'}</SelectItem>
                                                                    <SelectItem value="year">{isArabic ? 'سنة' : 'Year'}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SEO Settings */}
                                            <div className="p-4 bg-green-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-green-800 flex items-center gap-2">
                                                    <Globe className="w-4 h-4" />
                                                    {isArabic ? 'إعدادات SEO' : 'SEO Settings'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'عنوان SEO' : 'SEO Title'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "عنوان لمحركات البحث" : "Title for search engines"}
                                                            value={formData.seoTitle}
                                                            onChange={(e) => handleChange('seoTitle', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الرابط (Slug)' : 'URL Slug'}</label>
                                                        <Input className="rounded-lg" placeholder="product-name"
                                                            value={formData.slug}
                                                            onChange={(e) => handleChange('slug', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'وصف SEO' : 'SEO Description'}</label>
                                                    <Textarea className="rounded-lg min-h-[80px]" placeholder={isArabic ? "وصف مختصر للظهور في نتائج البحث" : "Short description for search results"}
                                                        value={formData.seoDescription}
                                                        onChange={(e) => handleChange('seoDescription', e.target.value)} />
                                                </div>
                                            </div>

                                            {/* Accounting */}
                                            <div className="p-4 bg-orange-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-orange-800 flex items-center gap-2">
                                                    <Calculator className="w-4 h-4" />
                                                    {isArabic ? 'حسابات المحاسبة' : 'Accounting Accounts'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حساب الإيرادات' : 'Revenue Account'}</label>
                                                        <Input className="rounded-lg" placeholder="4100"
                                                            value={formData.revenueAccount}
                                                            onChange={(e) => handleChange('revenueAccount', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حساب المصروفات' : 'Expense Account'}</label>
                                                        <Input className="rounded-lg" placeholder="5100"
                                                            value={formData.expenseAccount}
                                                            onChange={(e) => handleChange('expenseAccount', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حساب المخزون' : 'Inventory Account'}</label>
                                                        <Input className="rounded-lg" placeholder="1300"
                                                            value={formData.inventoryAccount}
                                                            onChange={(e) => handleChange('inventoryAccount', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'ملاحظات داخلية' : 'Internal Notes'}
                                                    </label>
                                                    <Textarea className="rounded-xl min-h-[100px]" placeholder={isArabic ? "ملاحظات للفريق الداخلي..." : "Notes for internal team..."}
                                                        value={formData.internalNotes}
                                                        onChange={(e) => handleChange('internalNotes', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'ملاحظات للعملاء' : 'Customer Notes'}
                                                    </label>
                                                    <Textarea className="rounded-xl min-h-[100px]" placeholder={isArabic ? "ملاحظات تظهر للعملاء..." : "Notes visible to customers..."}
                                                        value={formData.customerNotes}
                                                        onChange={(e) => handleChange('customerNotes', e.target.value)} />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.crm.products.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {editMode ? 'حفظ التعديلات' : 'حفظ المنتج'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - Placeholder for future widgets */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">إرشادات سريعة</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <p>• املأ جميع الحقول المطلوبة (*)</p>
                                <p>• تأكد من صحة رمز المنتج (SKU)</p>
                                <p>• حدد السعر والتكلفة بدقة</p>
                                <p>• اختر نسبة الضريبة المناسبة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

export default ProductFormView
