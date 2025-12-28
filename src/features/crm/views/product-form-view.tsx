import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import {
    Save, FileText, Package, DollarSign, Settings,
    Plus, X, ChevronDown, ChevronUp, Loader2, Tag,
    Barcode, Truck, Box, Layers, Image, Calculator,
    Warehouse, Scale, Ruler, Globe, Percent, Building2,
    Users, ShoppingCart, TrendingUp, Clock, Calendar,
    AlertTriangle, Info, Star, Target, Zap, Upload,
    File, Download, Briefcase, GraduationCap, FileCheck,
    Search, PenTool, Shield, BadgeCheck, ToggleLeft, ToggleRight
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

const PRODUCT_STATUS = [
    { value: 'active', labelAr: 'نشط', labelEn: 'Active', color: 'text-green-600 bg-green-50' },
    { value: 'inactive', labelAr: 'غير نشط', labelEn: 'Inactive', color: 'text-slate-600 bg-slate-50' },
    { value: 'discontinued', labelAr: 'متوقف', labelEn: 'Discontinued', color: 'text-red-600 bg-red-50' },
]

const SERVICE_TYPES = [
    { value: 'consultation', labelAr: 'استشارة قانونية', labelEn: 'Legal Consultation', icon: Briefcase },
    { value: 'representation', labelAr: 'تمثيل قانوني', labelEn: 'Legal Representation', icon: Shield },
    { value: 'document_review', labelAr: 'مراجعة مستندات', labelEn: 'Document Review', icon: FileCheck },
    { value: 'document_drafting', labelAr: 'صياغة عقود', labelEn: 'Contract Drafting', icon: PenTool },
    { value: 'research', labelAr: 'بحث قانوني', labelEn: 'Legal Research', icon: Search },
    { value: 'litigation', labelAr: 'تقاضي', labelEn: 'Litigation', icon: GraduationCap },
    { value: 'compliance', labelAr: 'امتثال', labelEn: 'Compliance Review', icon: BadgeCheck },
]

const PRACTICE_AREAS = [
    { value: 'commercial', labelAr: 'قانون تجاري', labelEn: 'Commercial Law' },
    { value: 'corporate', labelAr: 'قانون الشركات', labelEn: 'Corporate Law' },
    { value: 'labor', labelAr: 'قانون العمل', labelEn: 'Labor Law' },
    { value: 'real_estate', labelAr: 'قانون العقارات', labelEn: 'Real Estate Law' },
    { value: 'family', labelAr: 'قانون الأسرة', labelEn: 'Family Law' },
    { value: 'criminal', labelAr: 'قانون جنائي', labelEn: 'Criminal Law' },
    { value: 'intellectual_property', labelAr: 'الملكية الفكرية', labelEn: 'Intellectual Property' },
    { value: 'banking', labelAr: 'قانون مصرفي', labelEn: 'Banking & Finance' },
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

    // UI Mode state
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)

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
        status: 'active', // active, inactive, discontinued

        // ═══ PRICING - Multi-tier like Odoo/ERPNext ═══
        basePrice: 0,
        cost: 0,
        currency: 'SAR',
        minimumPrice: 0,
        maximumDiscountPercent: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        memberPrice: 0,
        msrp: 0, // Manufacturer's Suggested Retail Price
        costingMethod: 'average', // standard, average, fifo, lifo, specific
        marginPercent: 0,
        markupPercent: 0,

        // ═══ VOLUME PRICING TIERS ═══
        volumePricing: [] as { minQty: number; maxQty: number; price: number; discountPercent: number }[],

        // ═══ CUSTOMER TIER PRICING ═══
        customerTierPricing: [] as { tierName: string; tierNameAr: string; price: number; discountPercent: number }[],

        // ═══ TIME-BASED PRICING (PROMOTIONS) ═══
        promotionalPricing: [] as { name: string; nameAr: string; price: number; startDate: string; endDate: string; active: boolean }[],

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
        hourlyRate: 0,
        fixedFee: 0,
        estimatedHoursMin: 0,
        estimatedHoursMax: 0,
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
        availableOnline: true,

        // ═══ SALES SETTINGS ═══
        salesStartDate: '',
        salesEndDate: '',

        // ═══ MEDIA & DOCUMENTS ═══
        gallery: [] as { url: string; type: string; name: string }[],
        documents: [] as { url: string; type: string; name: string; description: string }[],

        // ═══ NOTES & CUSTOM ═══
        tags: [] as string[],
        internalNotes: '',
        customerNotes: '',
        customField1: '',
        customField2: '',
        customField3: '',
        customField4: '',
        customField5: '',
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
                                {/* BASIC/ADVANCED MODE TOGGLE */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                                    <div className="flex items-center gap-3">
                                        {isAdvancedMode ? (
                                            <ToggleRight className="w-6 h-6 text-purple-600" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-slate-500" />
                                        )}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-800">
                                                {isArabic ? 'وضع العرض' : 'Display Mode'}
                                            </h3>
                                            <p className="text-xs text-slate-600">
                                                {isAdvancedMode
                                                    ? (isArabic ? 'الوضع المتقدم - كل الحقول' : 'Advanced Mode - All Fields')
                                                    : (isArabic ? 'الوضع الأساسي - الحقول الضرورية فقط' : 'Basic Mode - Essential Fields Only')
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            !isAdvancedMode ? "text-emerald-600" : "text-slate-400"
                                        )}>
                                            {isArabic ? 'أساسي' : 'Basic'}
                                        </span>
                                        <Switch
                                            checked={isAdvancedMode}
                                            onCheckedChange={setIsAdvancedMode}
                                            className="data-[state=checked]:bg-purple-600"
                                        />
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isAdvancedMode ? "text-purple-600" : "text-slate-400"
                                        )}>
                                            {isArabic ? 'متقدم' : 'Advanced'}
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* TABBED SECTIONS - Enterprise ERP Style */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-slate-100 rounded-xl p-1">
                                        <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <FileText className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'أساسي' : 'Basic'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="pricing" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <DollarSign className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'التسعير' : 'Pricing'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <Warehouse className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'المخزون' : 'Inventory'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="attributes" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <Scale className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'السمات' : 'Attributes'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <Image className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'الوسائط' : 'Media'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="variants" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <Layers className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'الخيارات' : 'Variants'}</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:bg-white text-xs md:text-sm">
                                            <Truck className="w-3 h-3 md:w-4 md:h-4 md:me-2" />
                                            <span className="hidden md:inline">{isArabic ? 'الموردين' : 'Suppliers'}</span>
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

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'الحالة' : 'Status'}
                                                </label>
                                                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PRODUCT_STATUS.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                <span className={cn("px-2 py-1 rounded", status.color)}>
                                                                    {isArabic ? status.labelAr : status.labelEn}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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

                                        {/* Short Description */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'وصف مختصر (إنجليزي)' : 'Short Description (English)'}
                                                </label>
                                                <Textarea
                                                    placeholder={isArabic ? "وصف قصير للمنتج..." : "Brief product summary..."}
                                                    className="min-h-[80px] rounded-xl border-slate-200"
                                                    value={formData.shortDescription}
                                                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'وصف مختصر (عربي)' : 'Short Description (Arabic)'}
                                                </label>
                                                <Textarea
                                                    placeholder={isArabic ? "وصف قصير..." : "وصف قصير..."}
                                                    className="min-h-[80px] rounded-xl border-slate-200"
                                                    value={formData.shortDescriptionAr}
                                                    onChange={(e) => handleChange('shortDescriptionAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Long Description */}
                                        {isAdvancedMode && (
                                            <>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'الوصف الكامل (إنجليزي)' : 'Full Description (English)'}
                                                    </label>
                                                    <Textarea
                                                        placeholder={isArabic ? "وصف المنتج الكامل بالإنجليزية..." : "Complete product description..."}
                                                        className="min-h-[120px] rounded-xl border-slate-200"
                                                        value={formData.description}
                                                        onChange={(e) => handleChange('description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'الوصف الكامل (عربي)' : 'Full Description (Arabic)'}
                                                    </label>
                                                    <Textarea
                                                        placeholder={isArabic ? "وصف المنتج الكامل بالعربية..." : "وصف كامل..."}
                                                        className="min-h-[120px] rounded-xl border-slate-200"
                                                        value={formData.descriptionAr}
                                                        onChange={(e) => handleChange('descriptionAr', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}
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
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الحد الأدنى للسعر' : 'Minimum Price'}</label>
                                                    <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                        value={formData.minimumPrice || ''}
                                                        onChange={(e) => handleChange('minimumPrice', parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'أقصى خصم %' : 'Max Discount %'}</label>
                                                    <Input type="number" min="0" max="100" step="0.01" className="rounded-lg"
                                                        value={formData.maximumDiscountPercent || ''}
                                                        onChange={(e) => handleChange('maximumDiscountPercent', parseFloat(e.target.value) || 0)} />
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

                                        {/* Volume Pricing Tiers (Advanced Mode) */}
                                        {isAdvancedMode && (
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                        <Layers className="w-4 h-4" />
                                                        {isArabic ? 'تسعير حسب الكمية' : 'Volume Pricing Tiers'}
                                                    </h4>
                                                    <Button type="button" size="sm" variant="outline" className="rounded-lg">
                                                        <Plus className="w-3 h-3 me-1" />
                                                        {isArabic ? 'إضافة شريحة' : 'Add Tier'}
                                                    </Button>
                                                </div>
                                                {formData.volumePricing.length === 0 ? (
                                                    <p className="text-xs text-slate-500 text-center py-4">
                                                        {isArabic ? 'لا توجد شرائح أسعار بعد' : 'No volume pricing tiers yet'}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {formData.volumePricing.map((tier, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center p-2 bg-white rounded border">
                                                                <Input type="number" placeholder={isArabic ? 'من' : 'Min'} className="w-20" value={tier.minQty} readOnly />
                                                                <span>-</span>
                                                                <Input type="number" placeholder={isArabic ? 'إلى' : 'Max'} className="w-20" value={tier.maxQty} readOnly />
                                                                <Input type="number" placeholder={isArabic ? 'السعر' : 'Price'} className="flex-1" value={tier.price} readOnly />
                                                                <Input type="number" placeholder="%" className="w-20" value={tier.discountPercent} readOnly />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Customer Tier Pricing (Advanced Mode) */}
                                        {isAdvancedMode && (
                                            <div className="p-4 bg-green-50 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-green-800 flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        {isArabic ? 'تسعير حسب فئة العميل' : 'Customer Tier Pricing'}
                                                    </h4>
                                                    <Button type="button" size="sm" variant="outline" className="rounded-lg">
                                                        <Plus className="w-3 h-3 me-1" />
                                                        {isArabic ? 'إضافة فئة' : 'Add Tier'}
                                                    </Button>
                                                </div>
                                                {formData.customerTierPricing.length === 0 ? (
                                                    <p className="text-xs text-slate-500 text-center py-4">
                                                        {isArabic ? 'لا توجد فئات عملاء بعد' : 'No customer tier pricing yet'}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {formData.customerTierPricing.map((tier, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center p-2 bg-white rounded border">
                                                                <Input placeholder={isArabic ? 'اسم الفئة' : 'Tier Name'} className="flex-1" value={tier.tierName} readOnly />
                                                                <Input type="number" placeholder={isArabic ? 'السعر' : 'Price'} className="w-28" value={tier.price} readOnly />
                                                                <Input type="number" placeholder="%" className="w-20" value={tier.discountPercent} readOnly />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Time-based Pricing / Promotions (Advanced Mode) */}
                                        {isAdvancedMode && (
                                            <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-amber-800 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {isArabic ? 'تسعير ترويجي / موسمي' : 'Promotional Pricing'}
                                                    </h4>
                                                    <Button type="button" size="sm" variant="outline" className="rounded-lg">
                                                        <Plus className="w-3 h-3 me-1" />
                                                        {isArabic ? 'إضافة عرض' : 'Add Promo'}
                                                    </Button>
                                                </div>
                                                {formData.promotionalPricing.length === 0 ? (
                                                    <p className="text-xs text-slate-500 text-center py-4">
                                                        {isArabic ? 'لا توجد عروض ترويجية بعد' : 'No promotional pricing yet'}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {formData.promotionalPricing.map((promo, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center p-2 bg-white rounded border">
                                                                <Input placeholder={isArabic ? 'اسم العرض' : 'Promo Name'} className="flex-1" value={promo.name} readOnly />
                                                                <Input type="number" placeholder={isArabic ? 'السعر' : 'Price'} className="w-24" value={promo.price} readOnly />
                                                                <Input type="date" className="w-32" value={promo.startDate} readOnly />
                                                                <Input type="date" className="w-32" value={promo.endDate} readOnly />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

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

                                        {/* Legal Service-specific fields */}
                                        {formData.productType === 'service' && (
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" />
                                                    {isArabic ? 'تفاصيل الخدمة القانونية' : 'Legal Service Details'}
                                                </h4>

                                                {/* Service Type Selection */}
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600 font-medium">{isArabic ? 'نوع الخدمة' : 'Service Type'}</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                                        {SERVICE_TYPES.map((type) => {
                                                            const Icon = type.icon
                                                            return (
                                                                <button
                                                                    key={type.value}
                                                                    type="button"
                                                                    onClick={() => handleChange('serviceType', type.value)}
                                                                    className={cn(
                                                                        "p-2 rounded-lg border text-center transition-all",
                                                                        formData.serviceType === type.value
                                                                            ? "border-purple-500 bg-purple-100 text-purple-700"
                                                                            : "border-slate-200 hover:border-purple-300 hover:bg-slate-50"
                                                                    )}
                                                                >
                                                                    <Icon className={cn(
                                                                        "w-4 h-4 mx-auto mb-1",
                                                                        formData.serviceType === type.value ? "text-purple-600" : "text-slate-400"
                                                                    )} />
                                                                    <span className="text-[10px] font-medium block">
                                                                        {isArabic ? type.labelAr : type.labelEn}
                                                                    </span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Practice Area & Pricing */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'مجال الممارسة' : 'Practice Area'}</label>
                                                        <Select value={formData.practiceArea} onValueChange={(v) => handleChange('practiceArea', v)}>
                                                            <SelectTrigger className="rounded-lg"><SelectValue placeholder={isArabic ? "اختر المجال" : "Select area"} /></SelectTrigger>
                                                            <SelectContent>
                                                                {PRACTICE_AREAS.map((area) => (
                                                                    <SelectItem key={area.value} value={area.value}>
                                                                        {isArabic ? area.labelAr : area.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'سعر الساعة' : 'Hourly Rate'}</label>
                                                        <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                            value={formData.hourlyRate || ''}
                                                            onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'رسوم ثابتة' : 'Fixed Fee'}</label>
                                                        <Input type="number" min="0" step="0.01" className="rounded-lg"
                                                            value={formData.fixedFee || ''}
                                                            onChange={(e) => handleChange('fixedFee', parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'المدة المتوقعة' : 'Estimated Duration'}</label>
                                                        <div className="flex gap-2">
                                                            <Input type="number" min="0" className="rounded-lg flex-1"
                                                                value={formData.estimatedDuration || ''}
                                                                onChange={(e) => handleChange('estimatedDuration', parseInt(e.target.value) || 0)} />
                                                            <Select value={formData.durationUnit} onValueChange={(v) => handleChange('durationUnit', v)}>
                                                                <SelectTrigger className="w-20 rounded-lg"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="hour">{isArabic ? 'س' : 'h'}</SelectItem>
                                                                    <SelectItem value="day">{isArabic ? 'ي' : 'd'}</SelectItem>
                                                                    <SelectItem value="week">{isArabic ? 'أ' : 'w'}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Estimated Hours Range */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الحد الأدنى للساعات المتوقعة' : 'Minimum Estimated Hours'}</label>
                                                        <Input type="number" min="0" step="0.5" className="rounded-lg"
                                                            value={formData.estimatedHoursMin || ''}
                                                            onChange={(e) => handleChange('estimatedHoursMin', parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الحد الأقصى للساعات المتوقعة' : 'Maximum Estimated Hours'}</label>
                                                        <Input type="number" min="0" step="0.5" className="rounded-lg"
                                                            value={formData.estimatedHoursMax || ''}
                                                            onChange={(e) => handleChange('estimatedHoursMax', parseFloat(e.target.value) || 0)} />
                                                    </div>
                                                </div>

                                                {/* Service Flags */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.requiresAppointment}
                                                            onCheckedChange={(c) => handleChange('requiresAppointment', c)} />
                                                        <label className="text-xs">{isArabic ? 'يتطلب موعد' : 'Requires Appointment'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.allowOnlineBooking}
                                                            onCheckedChange={(c) => handleChange('allowOnlineBooking', c)} />
                                                        <label className="text-xs">{isArabic ? 'حجز أونلاين' : 'Allow Online Booking'}</label>
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

                                    {/* ═══ TAB 5: MEDIA & DOCUMENTS ═══ */}
                                    <TabsContent value="media" className="space-y-6 mt-6">
                                        {/* Product Images */}
                                        <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                <Image className="w-4 h-4" />
                                                {isArabic ? 'صور المنتج' : 'Product Images'}
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الصورة الرئيسية' : 'Primary Image'}</label>
                                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-600 mb-1">{isArabic ? 'انقر للرفع أو اسحب وأفلت' : 'Click to upload or drag and drop'}</p>
                                                        <p className="text-xs text-slate-400">PNG, JPG, WEBP {isArabic ? 'حتى' : 'up to'} 5MB</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'معرض الصور' : 'Image Gallery'}</label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <div key={i} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-300 transition-colors cursor-pointer aspect-square flex items-center justify-center">
                                                                <Plus className="w-6 h-6 text-slate-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documents & Attachments */}
                                        <div className="p-4 bg-green-50 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-green-800 flex items-center gap-2">
                                                    <File className="w-4 h-4" />
                                                    {isArabic ? 'المستندات والمرفقات' : 'Documents & Attachments'}
                                                </h4>
                                                <Button type="button" size="sm" variant="outline" className="rounded-lg">
                                                    <Upload className="w-3 h-3 me-1" />
                                                    {isArabic ? 'رفع مستند' : 'Upload Document'}
                                                </Button>
                                            </div>
                                            {formData.documents.length === 0 ? (
                                                <div className="text-center p-6 bg-white rounded-lg border-2 border-dashed border-slate-200">
                                                    <File className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500">{isArabic ? 'لا توجد مستندات مرفقة بعد' : 'No documents attached yet'}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{isArabic ? 'PDF, DOCX, XLSX حتى 10MB' : 'PDF, DOCX, XLSX up to 10MB'}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {formData.documents.map((doc, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                                            <File className="w-5 h-5 text-blue-500" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{doc.name}</p>
                                                                <p className="text-xs text-slate-500">{doc.description}</p>
                                                            </div>
                                                            <Button type="button" size="sm" variant="ghost" className="text-red-500">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 6: VARIANTS ═══ */}
                                    <TabsContent value="variants" className="space-y-6 mt-6">
                                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Layers className="w-5 h-5 text-purple-500" />
                                                <div>
                                                    <p className="font-medium">{isArabic ? 'هل المنتج له خيارات؟' : 'Does this product have variants?'}</p>
                                                    <p className="text-xs text-slate-500">{isArabic ? 'مثل الحجم، اللون، المقاس، إلخ' : 'Such as size, color, model, etc.'}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.hasVariants}
                                                onCheckedChange={(checked) => handleChange('hasVariants', checked)}
                                            />
                                        </div>

                                        {formData.hasVariants ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">{isArabic ? 'سمات الخيارات' : 'Variant Attributes'}</h4>
                                                    <Button type="button" size="sm" variant="outline" className="rounded-xl">
                                                        <Plus className="w-3 h-3 me-1" />
                                                        {isArabic ? 'إضافة سمة' : 'Add Attribute'}
                                                    </Button>
                                                </div>
                                                {formData.variantAttributes.length === 0 ? (
                                                    <div className="text-center p-8 bg-slate-50 rounded-xl">
                                                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                        <p className="text-sm text-slate-600 mb-1">{isArabic ? 'أضف سمات الخيارات' : 'Add variant attributes'}</p>
                                                        <p className="text-xs text-slate-400">{isArabic ? 'مثل: اللون (أحمر، أزرق) - الحجم (صغير، متوسط، كبير)' : 'e.g., Color (Red, Blue) - Size (S, M, L)'}</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {formData.variantAttributes.map((attr, idx) => (
                                                            <div key={idx} className="p-4 bg-white rounded-xl border">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="font-medium text-sm">{attr.name} / {attr.nameAr}</p>
                                                                    <Button type="button" size="sm" variant="ghost" className="text-red-500">
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {attr.values.map((val, vidx) => (
                                                                        <Badge key={vidx} variant="secondary">{val}</Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 bg-slate-50 rounded-xl">
                                                <Package className="w-16 h-16 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-500">{isArabic ? 'هذا منتج بسيط بدون خيارات' : 'This is a simple product without variants'}</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* ═══ TAB 7: SUPPLIERS ═══ */}
                                    <TabsContent value="suppliers" className="space-y-6 mt-6">
                                        <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-amber-800 flex items-center gap-2">
                                                    <Truck className="w-4 h-4" />
                                                    {isArabic ? 'الموردين' : 'Suppliers'}
                                                </h4>
                                                <Button type="button" size="sm" variant="outline" className="rounded-lg">
                                                    <Plus className="w-3 h-3 me-1" />
                                                    {isArabic ? 'إضافة مورد' : 'Add Supplier'}
                                                </Button>
                                            </div>
                                            {formData.suppliers.length === 0 ? (
                                                <div className="text-center p-8 bg-white rounded-xl border-2 border-dashed border-amber-200">
                                                    <Truck className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                                                    <h4 className="font-medium text-slate-600 mb-1">
                                                        {isArabic ? 'إدارة الموردين' : 'Supplier Management'}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {isArabic ? 'أضف موردين متعددين مع أسعارهم ومهل التسليم' : 'Add multiple suppliers with prices and lead times'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.suppliers.map((supplier, idx) => (
                                                        <div key={idx} className="p-4 bg-white rounded-lg border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium">{supplier.supplierName}</p>
                                                                    {supplier.isPrimary && (
                                                                        <Badge variant="default" className="bg-emerald-500">{isArabic ? 'أساسي' : 'Primary'}</Badge>
                                                                    )}
                                                                </div>
                                                                <Button type="button" size="sm" variant="ghost" className="text-red-500">
                                                                    <X className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3 text-xs">
                                                                <div>
                                                                    <span className="text-slate-500">{isArabic ? 'السعر:' : 'Price:'} </span>
                                                                    <span className="font-medium">{supplier.price} {supplier.currency}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">{isArabic ? 'مهلة التسليم:' : 'Lead Time:'} </span>
                                                                    <span className="font-medium">{supplier.leadTimeDays} {isArabic ? 'يوم' : 'days'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-500">{isArabic ? 'الحد الأدنى:' : 'Min Qty:'} </span>
                                                                    <span className="font-medium">{supplier.minOrderQty}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.availableOnline} onCheckedChange={(c) => handleChange('availableOnline', c)} />
                                                        <label className="text-sm">{isArabic ? 'متاح أونلاين' : 'Available Online'}</label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sales Settings */}
                                            <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-indigo-800 flex items-center gap-2">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    {isArabic ? 'إعدادات المبيعات' : 'Sales Settings'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'تاريخ بدء المبيعات' : 'Sales Start Date'}</label>
                                                        <Input type="date" className="rounded-lg"
                                                            value={formData.salesStartDate}
                                                            onChange={(e) => handleChange('salesStartDate', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'تاريخ انتهاء المبيعات' : 'Sales End Date'}</label>
                                                        <Input type="date" className="rounded-lg"
                                                            value={formData.salesEndDate}
                                                            onChange={(e) => handleChange('salesEndDate', e.target.value)} />
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

                                            {/* Custom Fields */}
                                            <div className="p-4 bg-rose-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-rose-800 flex items-center gap-2">
                                                    <Star className="w-4 h-4" />
                                                    {isArabic ? 'حقول مخصصة' : 'Custom Fields'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حقل مخصص 1' : 'Custom Field 1'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قيمة مخصصة..." : "Custom value..."}
                                                            value={formData.customField1}
                                                            onChange={(e) => handleChange('customField1', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حقل مخصص 2' : 'Custom Field 2'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قيمة مخصصة..." : "Custom value..."}
                                                            value={formData.customField2}
                                                            onChange={(e) => handleChange('customField2', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حقل مخصص 3' : 'Custom Field 3'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قيمة مخصصة..." : "Custom value..."}
                                                            value={formData.customField3}
                                                            onChange={(e) => handleChange('customField3', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حقل مخصص 4' : 'Custom Field 4'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قيمة مخصصة..." : "Custom value..."}
                                                            value={formData.customField4}
                                                            onChange={(e) => handleChange('customField4', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حقل مخصص 5' : 'Custom Field 5'}</label>
                                                        <Input className="rounded-lg" placeholder={isArabic ? "قيمة مخصصة..." : "Custom value..."}
                                                            value={formData.customField5}
                                                            onChange={(e) => handleChange('customField5', e.target.value)} />
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
