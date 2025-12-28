/**
 * ULTIMATE ENTERPRISE QUOTE FORM
 *
 * Features:
 * - Tab-based interface (like Product form, not wizard)
 * - Office Type selector at top
 * - Multi-tier pricing (volume, customer tier, time-based)
 * - Approval workflow with toggle + assignee selector
 * - Status change action buttons
 * - Auto-expiry based on validity date
 * - Full bilingual support (Arabic/English)
 * - Collapsible Advanced Settings
 */

import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, Save, Send, User, FileText,
    Calendar, DollarSign, Plus, Trash2, Copy,
    Building, Search, Loader2, Check, X, Package, Percent,
    FileSignature, AlertCircle, ChevronDown, ChevronUp,
    Settings, Users, Receipt, Clock, Target, TrendingUp,
    Shield, CheckCircle2, XCircle, Pause, PlayCircle, Zap
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { OfficeTypeSelector } from '@/features/crm/components/office-type-selector'
import { useCreateQuote, useUpdateQuote, useQuote } from '@/hooks/useQuotes'
import { useClients } from '@/hooks/useCasesAndClients'
import { useLeads } from '@/hooks/useAccounting'
import { useProducts } from '@/hooks/useProducts'
import { TAX_CONFIG } from '@/config'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { QuoteCustomerType, QuoteItem, QuoteStatus } from '@/services/quoteService'
import type { OfficeType } from '@/constants/crm-constants'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

interface LineItem {
    id: string
    productId?: string
    productName: string
    productNameAr?: string
    description: string
    descriptionAr?: string
    quantity: number
    unit: string
    unitPrice: number
    discount: number
    taxRate: number
    isOptional: boolean
    total: number
}

interface TierPrice {
    minQuantity: number
    maxQuantity?: number
    price: number
}

interface CustomerTierPrice {
    officeType: OfficeType
    price: number
    discount?: number
}

interface TimeBasedPrice {
    startDate: Date
    endDate: Date
    price: number
    label: string
}

const quoteFormSchema = z.object({
    // Office Type
    officeType: z.enum(['solo', 'small', 'medium', 'firm']),

    // Customer Selection
    customerType: z.enum(['lead', 'client']),
    customerId: z.string().min(1, 'Customer is required'),

    // Basic Info
    title: z.string().min(1, 'Title is required'),
    titleAr: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    validUntil: z.date({ required_error: 'Valid until date is required' }),
    currency: z.string().default('SAR'),

    // Line Items
    items: z.array(z.any()).min(1, 'At least one item is required'),

    // Pricing & Discount
    discountType: z.enum(['percentage', 'fixed']).default('percentage'),
    discountValue: z.number().min(0).default(0),

    // Multi-tier pricing settings
    enableVolumePricing: z.boolean().default(false),
    enableCustomerTierPricing: z.boolean().default(false),
    enableTimeBasedPricing: z.boolean().default(false),

    // Terms
    paymentTerms: z.string().optional(),
    paymentTermsAr: z.string().optional(),
    termsAndConditions: z.string().optional(),
    termsAndConditionsAr: z.string().optional(),
    requireSignature: z.boolean().default(false),

    // Advanced Settings
    internalNotes: z.string().optional(),
    validityPeriodDays: z.number().default(30),

    // Approval Workflow
    requireApproval: z.boolean().default(false),
    approvalAssigneeId: z.string().optional(),

    // Status (will be managed via action buttons)
    status: z.enum(['draft', 'pending', 'sent', 'accepted', 'declined', 'cancelled', 'on_hold', 'expired']).default('draft'),
})

type QuoteFormData = z.infer<typeof quoteFormSchema>

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STATUS_ACTIONS = [
    { status: 'draft', label: 'مسودة', labelEn: 'Draft', icon: FileText, color: 'bg-slate-500' },
    { status: 'pending', label: 'قيد المراجعة', labelEn: 'Pending', icon: Clock, color: 'bg-amber-500' },
    { status: 'sent', label: 'مرسل', labelEn: 'Sent', icon: Send, color: 'bg-blue-500' },
    { status: 'accepted', label: 'مقبول', labelEn: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-500' },
    { status: 'declined', label: 'مرفوض', labelEn: 'Declined', icon: XCircle, color: 'bg-red-500' },
    { status: 'on_hold', label: 'معلق', labelEn: 'On Hold', icon: Pause, color: 'bg-orange-500' },
    { status: 'cancelled', label: 'ملغي', labelEn: 'Cancelled', icon: X, color: 'bg-slate-600' },
] as const

interface QuoteFormViewProps {
    editMode?: boolean
}

export function QuoteFormView({ editMode = false }: QuoteFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/crm/quotes/$quoteId/edit' }) : null
    const quoteId = params?.quoteId

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [activeTab, setActiveTab] = useState('basic')
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [showProductCatalog, setShowProductCatalog] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)

    // Multi-tier pricing state
    const [volumePriceTiers, setVolumePriceTiers] = useState<TierPrice[]>([])
    const [customerTierPrices, setCustomerTierPrices] = useState<CustomerTierPrice[]>([])
    const [timeBasedPrices, setTimeBasedPrices] = useState<TimeBasedPrice[]>([])

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createQuoteMutation = useCreateQuote()
    const updateQuoteMutation = useUpdateQuote()
    const { data: quoteData, isLoading: isLoadingQuote } = useQuote(quoteId || '', editMode && !!quoteId)
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: leadsData, isLoading: loadingLeads } = useLeads()
    const { data: productsData, isLoading: loadingProducts } = useProducts({ isActive: true })

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<QuoteFormData>({
        resolver: zodResolver(quoteFormSchema),
        defaultValues: {
            officeType: 'solo',
            customerType: 'client',
            customerId: '',
            title: '',
            titleAr: '',
            description: '',
            descriptionAr: '',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currency: 'SAR',
            items: [],
            discountType: 'percentage',
            discountValue: 0,
            paymentTerms: '',
            paymentTermsAr: '',
            termsAndConditions: '',
            termsAndConditionsAr: '',
            requireSignature: false,
            internalNotes: '',
            validityPeriodDays: 30,
            enableVolumePricing: false,
            enableCustomerTierPricing: false,
            enableTimeBasedPricing: false,
            requireApproval: false,
            approvalAssigneeId: '',
            status: 'draft',
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // Load existing quote data in edit mode
    useEffect(() => {
        if (editMode && quoteData) {
            const quote = quoteData
            form.reset({
                officeType: (quote as any).officeType || 'solo',
                customerType: quote.customerType,
                customerId: quote.customerType === 'client'
                    ? (typeof quote.clientId === 'object' ? quote.clientId._id : quote.clientId)
                    : (typeof quote.leadId === 'object' ? quote.leadId?._id : quote.leadId) || '',
                title: quote.notes || '',
                titleAr: quote.termsAr || '',
                description: quote.notes || '',
                validUntil: new Date(quote.validUntil || quote.expiryDate),
                currency: quote.currency,
                discountType: quote.discount ? 'percentage' : 'fixed',
                discountValue: quote.discountAmount || 0,
                paymentTerms: quote.terms || '',
                termsAndConditions: quote.terms || '',
                requireSignature: !!quote.signature,
                internalNotes: quote.notes || '',
                status: quote.status || 'draft',
            })

            if (quote.items && quote.items.length > 0) {
                setLineItems(quote.items.map((item: any, index: number) => ({
                    id: item._id || `item-${index}`,
                    productName: item.description || '',
                    description: item.description || '',
                    quantity: item.quantity || 1,
                    unit: 'خدمة',
                    unitPrice: item.unitPrice || 0,
                    discount: item.discount || 0,
                    taxRate: item.taxRate || TAX_CONFIG.SAUDI_VAT_RATE,
                    isOptional: false,
                    total: item.total || 0,
                })))
            }
        }
    }, [editMode, quoteData, form])

    // Initialize with one empty line item
    useEffect(() => {
        if (!editMode && lineItems.length === 0) {
            addLineItem()
        }
    }, [editMode])

    // Auto-update expiry status
    useEffect(() => {
        const validUntil = form.watch('validUntil')
        if (validUntil && new Date(validUntil) < new Date()) {
            form.setValue('status', 'expired')
        }
    }, [form.watch('validUntil')])

    // ═══════════════════════════════════════════════════════════════
    // LINE ITEM MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const addLineItem = (fromProduct?: any) => {
        const newItem: LineItem = {
            id: `item-${Date.now()}`,
            productId: fromProduct?.id,
            productName: fromProduct?.name || '',
            productNameAr: fromProduct?.nameAr || '',
            description: fromProduct?.description || '',
            descriptionAr: fromProduct?.descriptionAr || '',
            quantity: 1,
            unit: fromProduct?.unit || 'خدمة',
            unitPrice: fromProduct?.pricing?.basePrice || 0,
            discount: 0,
            taxRate: fromProduct?.taxRate || TAX_CONFIG.SAUDI_VAT_RATE,
            isOptional: false,
            total: 0,
        }
        setLineItems([...lineItems, newItem])
    }

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id))
        }
    }

    const duplicateLineItem = (id: string) => {
        const item = lineItems.find(i => i.id === id)
        if (item) {
            const newItem = { ...item, id: `item-${Date.now()}` }
            const index = lineItems.findIndex(i => i.id === id)
            const newItems = [...lineItems]
            newItems.splice(index + 1, 0, newItem)
            setLineItems(newItems)
        }
    }

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value }

                // Apply multi-tier pricing if enabled
                let finalPrice = updated.unitPrice

                // Volume pricing
                if (form.watch('enableVolumePricing') && volumePriceTiers.length > 0) {
                    const tier = volumePriceTiers.find(t =>
                        updated.quantity >= t.minQuantity &&
                        (!t.maxQuantity || updated.quantity <= t.maxQuantity)
                    )
                    if (tier) finalPrice = tier.price
                }

                // Customer tier pricing
                if (form.watch('enableCustomerTierPricing') && customerTierPrices.length > 0) {
                    const officeType = form.watch('officeType')
                    const tierPrice = customerTierPrices.find(t => t.officeType === officeType)
                    if (tierPrice) {
                        finalPrice = tierPrice.price
                        if (tierPrice.discount) {
                            updated.discount = tierPrice.discount
                        }
                    }
                }

                // Time-based pricing
                if (form.watch('enableTimeBasedPricing') && timeBasedPrices.length > 0) {
                    const now = new Date()
                    const activeTimePrice = timeBasedPrices.find(t =>
                        now >= t.startDate && now <= t.endDate
                    )
                    if (activeTimePrice) finalPrice = activeTimePrice.price
                }

                updated.unitPrice = finalPrice

                // Recalculate total
                const subtotal = updated.quantity * updated.unitPrice
                const discountAmount = updated.discount
                const afterDiscount = subtotal - discountAmount
                updated.total = afterDiscount
                return updated
            }
            return item
        }))
    }

    // ═══════════════════════════════════════════════════════════════
    // CALCULATIONS
    // ═══════════════════════════════════════════════════════════════

    const calculations = useMemo(() => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

        const discountValue = form.watch('discountValue') || 0
        const discountType = form.watch('discountType') || 'percentage'

        let discountAmount = 0
        if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100)
        } else {
            discountAmount = discountValue
        }

        const afterDiscount = subtotal - discountAmount
        const taxAmount = lineItems.reduce((sum, item) => {
            const itemSubtotal = item.quantity * item.unitPrice - (item.discount || 0)
            return sum + (itemSubtotal * item.taxRate)
        }, 0)

        const totalAmount = afterDiscount + taxAmount

        return {
            subtotal,
            discountAmount,
            afterDiscount,
            taxAmount,
            totalAmount,
        }
    }, [lineItems, form.watch('discountValue'), form.watch('discountType')])

    // ═══════════════════════════════════════════════════════════════
    // STATUS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const handleStatusChange = (newStatus: QuoteStatus) => {
        form.setValue('status', newStatus, { shouldDirty: true })
    }

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: QuoteFormData) => {
        if (lineItems.length === 0) {
            return
        }

        const quoteData = {
            customerType: data.customerType,
            ...(data.customerType === 'client' ? { clientId: data.customerId } : { leadId: data.customerId }),
            items: lineItems.map(item => ({
                description: item.productName || item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                taxRate: item.taxRate,
                discount: item.discount,
            })),
            subtotal: calculations.subtotal,
            vatRate: TAX_CONFIG.SAUDI_VAT_RATE,
            vatAmount: calculations.taxAmount,
            discount: data.discountType === 'percentage' ? data.discountValue : undefined,
            discountAmount: calculations.discountAmount,
            totalAmount: calculations.totalAmount,
            expiryDate: data.validUntil.toISOString(),
            notes: data.internalNotes || data.description,
            terms: data.termsAndConditions || data.paymentTerms,
            termsAr: data.termsAndConditionsAr || data.paymentTermsAr,
            currency: data.currency,
            status: data.status,
            // Extended fields (backend will support)
            officeType: data.officeType,
            requireApproval: data.requireApproval,
            approvalAssigneeId: data.approvalAssigneeId,
            multiTierPricing: {
                volumePricing: data.enableVolumePricing ? volumePriceTiers : undefined,
                customerTierPricing: data.enableCustomerTierPricing ? customerTierPrices : undefined,
                timeBasedPricing: data.enableTimeBasedPricing ? timeBasedPrices : undefined,
            }
        }

        if (editMode && quoteId) {
            updateQuoteMutation.mutate(
                { quoteId, data: quoteData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.finance.quotes.list })
                    }
                }
            )
        } else {
            createQuoteMutation.mutate(quoteData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.finance.quotes.list })
                }
            })
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════

    const customerType = form.watch('customerType')
    const customerId = form.watch('customerId')
    const currentStatus = form.watch('status')

    const customers = customerType === 'client'
        ? (clientsData?.data || [])
        : (leadsData?.data || [])

    const filteredCustomers = customers.filter((customer: any) => {
        const name = customer.fullName || customer.name || `${customer.firstName} ${customer.lastName}`.trim()
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const selectedCustomer = customers.find((c: any) => c._id === customerId)

    // ═══════════════════════════════════════════════════════════════
    // TAB CONTENT RENDERS
    // ═══════════════════════════════════════════════════════════════

    const renderBasicInfoTab = () => (
        <div className="space-y-6">
            {/* Customer Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-blue-500" />
                        العميل / Client
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Controller
                        name="customerType"
                        control={form.control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="client" id="client" />
                                    <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                                        <Building className="w-4 h-4 text-blue-500" />
                                        عميل موجود
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="lead" id="lead" />
                                    <Label htmlFor="lead" className="flex items-center gap-2 cursor-pointer">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                        عميل محتمل (Lead)
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            بحث واختيار {customerType === 'client' ? 'العميل' : 'العميل المحتمل'}
                            <span className="text-red-500 ms-1">*</span>
                        </label>

                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="ابحث بالاسم..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pe-10 rounded-xl"
                            />
                        </div>

                        <Controller
                            name="customerId"
                            control={form.control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="rounded-xl border-slate-200">
                                        <SelectValue placeholder={
                                            loadingClients || loadingLeads
                                                ? "جاري التحميل..."
                                                : `اختر ${customerType === 'client' ? 'العميل' : 'العميل المحتمل'}`
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCustomers.map((customer: any) => (
                                            <SelectItem key={customer._id} value={customer._id}>
                                                {customer.fullName || customer.name || `${customer.firstName} ${customer.lastName}`.trim()}
                                                {customer.email && (
                                                    <span className="text-xs text-slate-500 ms-2">({customer.email})</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {selectedCustomer && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-navy">
                                        {selectedCustomer.fullName || selectedCustomer.name || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim()}
                                    </h4>
                                    {selectedCustomer.email && (
                                        <p className="text-sm text-slate-600">{selectedCustomer.email}</p>
                                    )}
                                    {selectedCustomer.phone && (
                                        <p className="text-sm text-slate-600" dir="ltr">{selectedCustomer.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quote Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        تفاصيل العرض / Quote Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                عنوان العرض <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="مثال: عرض خدمات قانونية"
                                        className="rounded-xl"
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                العنوان بالإنجليزية
                            </label>
                            <Controller
                                name="titleAr"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Legal Services Quotation"
                                        className="rounded-xl"
                                        dir="ltr"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            الوصف (عربي)
                        </label>
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="وصف مختصر للعرض..."
                                    className="rounded-xl min-h-[100px]"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            الوصف (إنجليزي)
                        </label>
                        <Controller
                            name="descriptionAr"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Brief quote description..."
                                    className="rounded-xl min-h-[100px]"
                                    dir="ltr"
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                صالح حتى تاريخ <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="validUntil"
                                control={form.control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-right font-normal rounded-xl",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <Calendar className="ms-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: ar })
                                                ) : (
                                                    <span>اختر التاريخ</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-blue-500" />
                                العملة
                            </label>
                            <Controller
                                name="currency"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                            <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderLineItemsTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-500" />
                    بنود العرض / Line Items
                </h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => setShowProductCatalog(true)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        <Package className="w-4 h-4 ms-2" />
                        من الكتالوج
                    </Button>
                    <Button
                        type="button"
                        onClick={() => addLineItem()}
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                        <Plus className="w-4 h-4 ms-2" />
                        بند مخصص
                    </Button>
                </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
                {lineItems.map((item, index) => (
                    <Card key={item.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <Input
                                    placeholder="اسم الخدمة / المنتج"
                                    value={item.productName}
                                    onChange={(e) => updateLineItem(item.id, 'productName', e.target.value)}
                                    className="rounded-lg font-medium"
                                />
                                <Textarea
                                    placeholder="الوصف..."
                                    value={item.description}
                                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                    className="rounded-lg text-sm min-h-[60px]"
                                />
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={item.isOptional}
                                        onCheckedChange={(checked) => updateLineItem(item.id, 'isOptional', checked)}
                                        id={`optional-${item.id}`}
                                    />
                                    <Label htmlFor={`optional-${item.id}`} className="text-xs text-slate-600">
                                        بند اختياري
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">الكمية</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">السعر</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">الخصم</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.discount}
                                    onChange={(e) => updateLineItem(item.id, 'discount', Number(e.target.value))}
                                    className="rounded-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500">الإجمالي</label>
                                <div className="h-10 flex items-center justify-center bg-slate-50 rounded-lg font-medium">
                                    {item.total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button
                                type="button"
                                onClick={() => duplicateLineItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:bg-blue-50"
                            >
                                <Copy className="w-4 h-4 ms-1" />
                                نسخ
                            </Button>
                            <Button
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                                disabled={lineItems.length === 1}
                            >
                                <Trash2 className="w-4 h-4 ms-1" />
                                حذف
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Totals */}
            <Card className="bg-blue-50">
                <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">المجموع الفرعي</span>
                        <span className="font-medium">{calculations.subtotal.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                    {calculations.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                            <span>الخصم</span>
                            <span>-{calculations.discountAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">ضريبة القيمة المضافة</span>
                        <span className="font-medium">{calculations.taxAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                    <hr className="border-blue-200" />
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-blue-800">الإجمالي النهائي</span>
                        <span className="text-blue-600">{calculations.totalAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderPricingTab = () => (
        <div className="space-y-6">
            {/* Discount Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Percent className="w-5 h-5 text-blue-500" />
                        الخصم العام / General Discount
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">نوع الخصم</label>
                        <Controller
                            name="discountType"
                            control={form.control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                                        <SelectItem value="fixed">مبلغ ثابت (ر.س)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">قيمة الخصم</label>
                        <Controller
                            name="discountValue"
                            control={form.control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="rounded-xl"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">مبلغ الخصم</label>
                        <div className="h-10 flex items-center px-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-red-600">
                            -{calculations.discountAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Multi-Tier Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        التسعير متعدد المستويات / Multi-Tier Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Volume Pricing */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Controller
                                    name="enableVolumePricing"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <span className="font-semibold">تسعير حسب الكمية (Volume Pricing)</span>
                            </Label>
                            {form.watch('enableVolumePricing') && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setVolumePriceTiers([...volumePriceTiers, { minQuantity: 1, price: 0 }])}
                                >
                                    <Plus className="w-3 h-3 ms-1" />
                                    إضافة مستوى
                                </Button>
                            )}
                        </div>
                        {form.watch('enableVolumePricing') && (
                            <div className="space-y-2 ps-6">
                                {volumePriceTiers.map((tier, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="من كمية"
                                            value={tier.minQuantity}
                                            onChange={(e) => {
                                                const updated = [...volumePriceTiers]
                                                updated[index].minQuantity = Number(e.target.value)
                                                setVolumePriceTiers(updated)
                                            }}
                                            className="rounded-lg"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="إلى كمية"
                                            value={tier.maxQuantity || ''}
                                            onChange={(e) => {
                                                const updated = [...volumePriceTiers]
                                                updated[index].maxQuantity = Number(e.target.value) || undefined
                                                setVolumePriceTiers(updated)
                                            }}
                                            className="rounded-lg"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="السعر"
                                            value={tier.price}
                                            onChange={(e) => {
                                                const updated = [...volumePriceTiers]
                                                updated[index].price = Number(e.target.value)
                                                setVolumePriceTiers(updated)
                                            }}
                                            className="rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setVolumePriceTiers(volumePriceTiers.filter((_, i) => i !== index))}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Tier Pricing */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Controller
                                    name="enableCustomerTierPricing"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <span className="font-semibold">تسعير حسب نوع المكتب (Customer Tier)</span>
                            </Label>
                        </div>
                        {form.watch('enableCustomerTierPricing') && (
                            <div className="space-y-2 ps-6">
                                <p className="text-sm text-slate-600">
                                    سيتم تطبيق السعر تلقائياً بناءً على نوع المكتب المختار في الأعلى
                                </p>
                                {['solo', 'small', 'medium', 'firm'].map((type) => (
                                    <div key={type} className="grid grid-cols-3 gap-2 items-center">
                                        <Badge variant="outline" className="justify-center">
                                            {type === 'solo' ? 'محامي فردي' : type === 'small' ? 'مكتب صغير' : type === 'medium' ? 'مكتب متوسط' : 'شركة محاماة'}
                                        </Badge>
                                        <Input
                                            type="number"
                                            placeholder="السعر"
                                            value={customerTierPrices.find(t => t.officeType === type)?.price || ''}
                                            onChange={(e) => {
                                                const existing = customerTierPrices.filter(t => t.officeType !== type)
                                                setCustomerTierPrices([...existing, { officeType: type as OfficeType, price: Number(e.target.value) }])
                                            }}
                                            className="rounded-lg"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="خصم إضافي"
                                            value={customerTierPrices.find(t => t.officeType === type)?.discount || ''}
                                            onChange={(e) => {
                                                const existing = customerTierPrices.filter(t => t.officeType !== type)
                                                const current = customerTierPrices.find(t => t.officeType === type)
                                                setCustomerTierPrices([...existing, { officeType: type as OfficeType, price: current?.price || 0, discount: Number(e.target.value) }])
                                            }}
                                            className="rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Time-Based Pricing */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Controller
                                    name="enableTimeBasedPricing"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <span className="font-semibold">تسعير حسب الفترة الزمنية (Time-Based)</span>
                            </Label>
                            {form.watch('enableTimeBasedPricing') && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setTimeBasedPrices([...timeBasedPrices, { startDate: new Date(), endDate: new Date(), price: 0, label: '' }])}
                                >
                                    <Plus className="w-3 h-3 ms-1" />
                                    إضافة فترة
                                </Button>
                            )}
                        </div>
                        {form.watch('enableTimeBasedPricing') && timeBasedPrices.length > 0 && (
                            <div className="space-y-2 ps-6">
                                {timeBasedPrices.map((period, index) => (
                                    <div key={index} className="grid grid-cols-5 gap-2 items-end">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">التسمية</label>
                                            <Input
                                                placeholder="عرض الصيف"
                                                value={period.label}
                                                onChange={(e) => {
                                                    const updated = [...timeBasedPrices]
                                                    updated[index].label = e.target.value
                                                    setTimeBasedPrices(updated)
                                                }}
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">من تاريخ</label>
                                            <Input
                                                type="date"
                                                value={period.startDate.toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    const updated = [...timeBasedPrices]
                                                    updated[index].startDate = new Date(e.target.value)
                                                    setTimeBasedPrices(updated)
                                                }}
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">إلى تاريخ</label>
                                            <Input
                                                type="date"
                                                value={period.endDate.toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    const updated = [...timeBasedPrices]
                                                    updated[index].endDate = new Date(e.target.value)
                                                    setTimeBasedPrices(updated)
                                                }}
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">السعر</label>
                                            <Input
                                                type="number"
                                                placeholder="السعر"
                                                value={period.price}
                                                onChange={(e) => {
                                                    const updated = [...timeBasedPrices]
                                                    updated[index].price = Number(e.target.value)
                                                    setTimeBasedPrices(updated)
                                                }}
                                                className="rounded-lg"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTimeBasedPrices(timeBasedPrices.filter((_, i) => i !== index))}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderTermsTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileSignature className="w-5 h-5 text-blue-500" />
                        الشروط والأحكام / Terms & Conditions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            شروط الدفع (عربي)
                        </label>
                        <Controller
                            name="paymentTermsAr"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="مثال: الدفع خلال 30 يوم من تاريخ الفاتورة..."
                                    className="rounded-xl min-h-[100px]"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            شروط الدفع (إنجليزي)
                        </label>
                        <Controller
                            name="paymentTerms"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Payment within 30 days from invoice date..."
                                    className="rounded-xl min-h-[100px]"
                                    dir="ltr"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            الشروط والأحكام (عربي)
                        </label>
                        <Controller
                            name="termsAndConditionsAr"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="أدخل الشروط والأحكام..."
                                    className="rounded-xl min-h-[120px]"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            الشروط والأحكام (إنجليزي)
                        </label>
                        <Controller
                            name="termsAndConditions"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Enter terms and conditions..."
                                    className="rounded-xl min-h-[120px]"
                                    dir="ltr"
                                />
                            )}
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                        <Controller
                            name="requireSignature"
                            control={form.control}
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="requireSignature"
                                    />
                                    <Label htmlFor="requireSignature" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                        <FileSignature className="w-4 h-4" />
                                        يتطلب توقيع العميل على العرض
                                    </Label>
                                </div>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Approval Workflow */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-purple-500" />
                        سير عمل الموافقات / Approval Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <Controller
                            name="requireApproval"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="requireApproval"
                                />
                            )}
                        />
                        <Label htmlFor="requireApproval" className="text-sm font-medium text-purple-800">
                            يتطلب موافقة من مدير قبل الإرسال
                        </Label>
                    </div>

                    {form.watch('requireApproval') && (
                        <div className="space-y-2 ps-8">
                            <label className="text-sm font-medium text-slate-700">
                                اختر المسؤول عن الموافقة
                            </label>
                            <Controller
                                name="approvalAssigneeId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="اختر الموظف..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager1">أحمد محمد - مدير المبيعات</SelectItem>
                                            <SelectItem value="manager2">سارة أحمد - مديرة العمليات</SelectItem>
                                            <SelectItem value="manager3">محمد علي - الرئيس التنفيذي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )

    const renderAdvancedTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="w-5 h-5 text-slate-500" />
                        الإعدادات المتقدمة / Advanced Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            ملاحظات داخلية (لن تظهر للعميل)
                        </label>
                        <Controller
                            name="internalNotes"
                            control={form.control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="ملاحظات للاستخدام الداخلي فقط..."
                                    className="rounded-xl min-h-[100px] bg-amber-50 border-amber-200"
                                />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            فترة الصلاحية (بالأيام)
                        </label>
                        <Controller
                            name="validityPeriodDays"
                            control={form.control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="rounded-xl"
                                />
                            )}
                        />
                        <p className="text-xs text-slate-500">
                            سيتم تحديث تاريخ الصلاحية تلقائياً بناءً على هذا العدد من الأيام
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    // ═══════════════════════════════════════════════════════════════
    // PRODUCT CATALOG DIALOG
    // ═══════════════════════════════════════════════════════════════

    const renderProductCatalog = () => (
        <Dialog open={showProductCatalog} onOpenChange={setShowProductCatalog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>كتالوج المنتجات والخدمات</DialogTitle>
                    <DialogDescription>
                        اختر من الخدمات الموجودة لإضافتها للعرض
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {loadingProducts ? (
                        <div className="col-span-2 flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        productsData?.data?.map((product: any) => (
                            <div
                                key={product.id}
                                className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                                onClick={() => {
                                    addLineItem(product)
                                    setShowProductCatalog(false)
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-navy">{product.name}</h4>
                                        {product.nameAr && (
                                            <p className="text-sm text-slate-600">{product.nameAr}</p>
                                        )}
                                        {product.description && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-left ms-4">
                                        <p className="text-lg font-bold text-blue-600">
                                            {product.pricing?.basePrice?.toLocaleString('ar-SA')} ر.س
                                        </p>
                                        <p className="text-xs text-slate-500">{product.unit}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowProductCatalog(false)}>
                        إغلاق
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    if (editMode && isLoadingQuote) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={[]} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </Main>
            </>
        )
    }

    const topNav = [
        { title: 'عروض الأسعار', href: ROUTES.dashboard.finance.quotes.list, isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                {/* Hero */}
                <ProductivityHero
                    badge="عروض الأسعار"
                    title={editMode ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}
                    type="finance"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.finance.quotes.list })}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </ProductivityHero>

                {/* Form Card */}
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
                        {/* Header with Office Type, Mode Toggle, and Status */}
                        <div className="p-6 border-b border-slate-100 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Office Type Selector */}
                                <div>
                                    <Controller
                                        name="officeType"
                                        control={form.control}
                                        render={({ field }) => (
                                            <OfficeTypeSelector
                                                value={field.value}
                                                onChange={field.onChange}
                                                variant="compact"
                                                required={true}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Status Action Buttons */}
                                <div>
                                    <Label>الحالة / Status</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {STATUS_ACTIONS.map((action) => (
                                            <Button
                                                key={action.status}
                                                type="button"
                                                variant={currentStatus === action.status ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleStatusChange(action.status as QuoteStatus)}
                                                className={cn(
                                                    "flex items-center gap-2",
                                                    currentStatus === action.status && action.color
                                                )}
                                            >
                                                <action.icon className="w-3 h-3" />
                                                {isRTL ? action.label : action.labelEn}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Basic/Advanced Mode Toggle */}
                            <div className="flex items-center justify-center">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <Label
                                            htmlFor="mode-toggle"
                                            className={cn(
                                                "text-sm font-semibold transition-colors cursor-pointer",
                                                !isAdvancedMode ? "text-blue-700" : "text-slate-500"
                                            )}
                                        >
                                            وضع أساسي
                                        </Label>
                                        <span className="text-slate-400">|</span>
                                        <Label
                                            htmlFor="mode-toggle"
                                            className={cn(
                                                "text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1",
                                                isAdvancedMode ? "text-purple-700" : "text-slate-500"
                                            )}
                                        >
                                            <Zap className="w-4 h-4" />
                                            وضع متقدم
                                        </Label>
                                    </div>
                                    <div className="relative">
                                        <Checkbox
                                            id="mode-toggle"
                                            checked={isAdvancedMode}
                                            onCheckedChange={(checked) => {
                                                setIsAdvancedMode(!!checked)
                                                // Reset to basic tab when switching to basic mode
                                                if (!checked && activeTab !== 'basic' && activeTab !== 'items') {
                                                    setActiveTab('basic')
                                                }
                                            }}
                                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mode Description */}
                            <div className="text-center">
                                <p className="text-xs text-slate-500">
                                    {isAdvancedMode
                                        ? "الوضع المتقدم: الوصول إلى جميع الخيارات المتقدمة (التسعير متعدد المستويات، الموافقات، الشروط)"
                                        : "الوضع الأساسي: إنشاء عرض سعر سريع بالحقول الأساسية فقط"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className={cn(
                                    "grid w-full mb-6",
                                    isAdvancedMode ? "grid-cols-5" : "grid-cols-2"
                                )}>
                                    <TabsTrigger value="basic">
                                        <FileText className="w-4 h-4 me-2" />
                                        معلومات أساسية
                                    </TabsTrigger>
                                    <TabsTrigger value="items">
                                        <Package className="w-4 h-4 me-2" />
                                        البنود
                                    </TabsTrigger>
                                    {isAdvancedMode && (
                                        <>
                                            <TabsTrigger value="pricing">
                                                <DollarSign className="w-4 h-4 me-2" />
                                                التسعير والخصم
                                            </TabsTrigger>
                                            <TabsTrigger value="terms">
                                                <FileSignature className="w-4 h-4 me-2" />
                                                الشروط
                                            </TabsTrigger>
                                            <TabsTrigger value="advanced">
                                                <Settings className="w-4 h-4 me-2" />
                                                متقدم
                                            </TabsTrigger>
                                        </>
                                    )}
                                </TabsList>

                                <TabsContent value="basic">{renderBasicInfoTab()}</TabsContent>
                                <TabsContent value="items">{renderLineItemsTab()}</TabsContent>
                                {isAdvancedMode && (
                                    <>
                                        <TabsContent value="pricing">{renderPricingTab()}</TabsContent>
                                        <TabsContent value="terms">{renderTermsTab()}</TabsContent>
                                        <TabsContent value="advanced">{renderAdvancedTab()}</TabsContent>
                                    </>
                                )}
                            </Tabs>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: ROUTES.dashboard.finance.quotes.list })}
                                    className="rounded-xl"
                                >
                                    إلغاء
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            form.setValue('status', 'draft')
                                            form.handleSubmit(onSubmit)()
                                        }}
                                        disabled={isSubmitting}
                                        className="rounded-xl"
                                    >
                                        <Save className="w-4 h-4 ms-2" />
                                        حفظ كمسودة
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4 ms-2" />
                                        )}
                                        {editMode ? 'حفظ التغييرات' : 'حفظ وإرسال'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </Main>

            {/* Product Catalog Dialog */}
            {renderProductCatalog()}

            {/* Unsaved Changes Dialog */}
            <Dialog open={blocker.state === 'blocked'} onOpenChange={() => {}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغييرات غير محفوظة</DialogTitle>
                        <DialogDescription>
                            لديك تغييرات غير محفوظة. هل تريد حقاً المغادرة؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => blocker.reset?.()}>
                            البقاء في الصفحة
                        </Button>
                        <Button variant="destructive" onClick={() => blocker.proceed?.()}>
                            المغادرة بدون حفظ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default QuoteFormView
