import { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, ArrowLeft, Save, Send, User, Users, FileText,
    Calendar, DollarSign, Plus, Trash2, Copy, GripVertical,
    Building, Search, Loader2, Check, X, Package, Percent,
    FileSignature, AlertCircle, ChevronLeft, ChevronRight
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import TipTapEditor from '@/components/tiptap-editor'
import { useCreateQuote, useUpdateQuote, useQuote } from '@/hooks/useQuotes'
import { useClients } from '@/hooks/useCasesAndClients'
import { useLeads } from '@/hooks/useAccounting'
import { useProducts } from '@/hooks/useProducts'
import { TAX_CONFIG } from '@/config'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { QuoteCustomerType, QuoteItem } from '@/services/quoteService'

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

const quoteFormSchema = z.object({
    // Step 1: Customer Selection
    customerType: z.enum(['lead', 'client']),
    customerId: z.string().min(1, 'Customer is required'),

    // Step 2: Quote Details
    title: z.string().min(1, 'Title is required'),
    titleAr: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    validUntil: z.date({ required_error: 'Valid until date is required' }),
    currency: z.string().default('SAR'),

    // Step 3: Line Items (validated separately)
    items: z.array(z.any()).min(1, 'At least one item is required'),
    discountType: z.enum(['percentage', 'fixed']).default('percentage'),
    discountValue: z.number().min(0).default(0),

    // Step 4: Terms & Signatures
    paymentTerms: z.string().optional(),
    paymentTermsAr: z.string().optional(),
    termsAndConditions: z.string().optional(),
    termsAndConditionsAr: z.string().optional(),
    requireSignature: z.boolean().default(false),
    internalNotes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteFormSchema>

// ═══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, name: 'Customer', nameAr: 'العميل', icon: User },
    { id: 2, name: 'Details', nameAr: 'التفاصيل', icon: FileText },
    { id: 3, name: 'Items', nameAr: 'البنود', icon: Package },
    { id: 4, name: 'Terms', nameAr: 'الشروط', icon: FileSignature },
]

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

    const [currentStep, setCurrentStep] = useState(1)
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [showProductCatalog, setShowProductCatalog] = useState(false)
    const [showNewLeadDialog, setShowNewLeadDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sendAfterSave, setSendAfterSave] = useState(false)

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
            customerType: 'client',
            customerId: '',
            title: '',
            titleAr: '',
            description: '',
            descriptionAr: '',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
                customerType: quote.customerType,
                customerId: quote.customerType === 'client'
                    ? (typeof quote.clientId === 'object' ? quote.clientId._id : quote.clientId)
                    : (typeof quote.leadId === 'object' ? quote.leadId?._id : quote.leadId) || '',
                title: quote.notes || '', // Using notes as title since API doesn't have title
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
            })

            // Load line items
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

    const moveLineItem = (id: string, direction: 'up' | 'down') => {
        const index = lineItems.findIndex(item => item.id === id)
        if (
            (direction === 'up' && index > 0) ||
            (direction === 'down' && index < lineItems.length - 1)
        ) {
            const newItems = [...lineItems]
            const newIndex = direction === 'up' ? index - 1 : index + 1
            ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
            setLineItems(newItems)
        }
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
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: QuoteFormData, saveAsDraft = false) => {
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
            status: saveAsDraft ? 'draft' : 'pending',
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
    // STEP NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    const canGoToNextStep = () => {
        switch (currentStep) {
            case 1:
                return form.watch('customerId') !== ''
            case 2:
                return form.watch('title') !== '' && form.watch('validUntil') !== undefined
            case 3:
                return lineItems.length > 0
            case 4:
                return true
            default:
                return false
        }
    }

    const nextStep = () => {
        if (canGoToNextStep() && currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════

    const customerType = form.watch('customerType')
    const customerId = form.watch('customerId')

    const customers = customerType === 'client'
        ? (clientsData?.data || [])
        : (leadsData?.data || [])

    const filteredCustomers = customers.filter((customer: any) => {
        const name = customer.fullName || customer.name || `${customer.firstName} ${customer.lastName}`.trim()
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const selectedCustomer = customers.find((c: any) => c._id === customerId)

    // ═══════════════════════════════════════════════════════════════
    // STEP RENDERS
    // ═══════════════════════════════════════════════════════════════

    const renderStepIndicators = () => (
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        disabled={step.id > currentStep && !canGoToNextStep()}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                            currentStep === step.id
                                ? "bg-blue-500 text-white shadow-lg"
                                : currentStep > step.id
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <step.icon className="w-4 h-4" />
                        <span className="hidden md:inline text-sm font-medium">
                            {isRTL ? step.nameAr : step.name}
                        </span>
                        <span className="md:hidden text-sm font-bold">{step.id}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                        <div className={cn(
                            "w-8 md:w-12 h-0.5 mx-1",
                            currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                        )} />
                    )}
                </div>
            ))}
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                اختيار العميل
            </h2>

            <div className="space-y-4">
                <Controller
                    name="customerType"
                    control={form.control}
                    render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
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

                {customerType === 'lead' && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewLeadDialog(true)}
                        className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                        <Plus className="w-4 h-4 ms-2" />
                        إنشاء عميل محتمل جديد
                    </Button>
                )}
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                تفاصيل العرض
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    الوصف
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-500" />
                    بنود العرض
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
                {/* Header */}
                <div className="hidden md:flex gap-2 items-center text-xs font-medium text-slate-500 px-2">
                    <div className="w-8"></div>
                    <div className="flex-1">الخدمة / المنتج</div>
                    <div className="w-20 text-center">الكمية</div>
                    <div className="w-24 text-center">السعر</div>
                    <div className="w-24 text-center">الخصم</div>
                    <div className="w-20 text-center">الضريبة</div>
                    <div className="w-24 text-center">الإجمالي</div>
                    <div className="w-32 text-center">إجراءات</div>
                </div>

                {/* Items */}
                {lineItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex flex-col md:flex-row gap-2 items-start md:items-center p-4 md:p-2 bg-white rounded-xl border border-slate-200"
                    >
                        {/* Drag Handle */}
                        <div className="hidden md:flex flex-col gap-1 w-8">
                            <button
                                type="button"
                                onClick={() => moveLineItem(item.id, 'up')}
                                disabled={index === 0}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4 rotate-90" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveLineItem(item.id, 'down')}
                                disabled={index === lineItems.length - 1}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </button>
                        </div>

                        {/* Product/Service Name */}
                        <div className="flex-1 w-full md:w-auto space-y-1">
                            <Input
                                placeholder="اسم الخدمة / المنتج"
                                value={item.productName}
                                onChange={(e) => updateLineItem(item.id, 'productName', e.target.value)}
                                className="rounded-lg text-sm font-medium"
                            />
                            <Textarea
                                placeholder="الوصف..."
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                className="rounded-lg text-xs min-h-[60px]"
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

                        {/* Quantity */}
                        <div className="w-full md:w-20">
                            <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                                className="rounded-lg text-center text-sm"
                            />
                        </div>

                        {/* Unit Price */}
                        <div className="w-full md:w-24">
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                                className="rounded-lg text-center text-sm"
                            />
                        </div>

                        {/* Discount */}
                        <div className="w-full md:w-24">
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) => updateLineItem(item.id, 'discount', Number(e.target.value))}
                                className="rounded-lg text-center text-sm"
                            />
                        </div>

                        {/* Tax Rate */}
                        <div className="w-full md:w-20">
                            <Select
                                value={item.taxRate.toString()}
                                onValueChange={(value) => updateLineItem(item.id, 'taxRate', Number(value))}
                            >
                                <SelectTrigger className="rounded-lg text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="0.05">5%</SelectItem>
                                    <SelectItem value="0.15">15%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Total */}
                        <div className="w-full md:w-24 flex items-center justify-center h-10 bg-slate-50 rounded-lg text-sm font-medium">
                            {item.total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </div>

                        {/* Actions */}
                        <div className="w-full md:w-32 flex gap-1 justify-end">
                            <Button
                                type="button"
                                onClick={() => duplicateLineItem(item.id)}
                                variant="ghost"
                                size="icon"
                                className="text-blue-500 hover:bg-blue-50 rounded-lg h-8 w-8"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:bg-red-50 rounded-lg h-8 w-8"
                                disabled={lineItems.length === 1}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-500" />
                        نوع الخصم العام
                    </label>
                    <Controller
                        name="discountType"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl bg-white">
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
                                className="rounded-xl bg-white"
                            />
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">مبلغ الخصم</label>
                    <div className="h-10 flex items-center px-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-red-600">
                        -{calculations.discountAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </div>
                </div>
            </div>

            {/* Totals */}
            <div className="bg-blue-50 rounded-xl p-6 space-y-3">
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
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileSignature className="w-6 h-6 text-blue-500" />
                الشروط والأحكام
            </h2>

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
                            className="rounded-xl min-h-[80px] bg-amber-50 border-amber-200"
                        />
                    )}
                />
            </div>
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
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl p-6">
                            {renderStepIndicators()}

                            <div className="flex items-center justify-between mt-4">
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
                                        onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
                                        disabled={isSubmitting || !canGoToNextStep()}
                                        className="rounded-xl"
                                    >
                                        <Save className="w-4 h-4 ms-2" />
                                        حفظ كمسودة
                                    </Button>

                                    {currentStep === 4 ? (
                                        <Button
                                            type="button"
                                            onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
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
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canGoToNextStep()}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                        >
                                            التالي
                                            <ArrowLeft className="w-4 h-4 me-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form className="p-8">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                    disabled={currentStep === 1}
                                    className="rounded-xl"
                                >
                                    <ArrowRight className="w-4 h-4 ms-2" />
                                    السابق
                                </Button>

                                {currentStep < 4 && (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canGoToNextStep()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                    >
                                        التالي
                                        <ArrowLeft className="w-4 h-4 me-2" />
                                    </Button>
                                )}
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
