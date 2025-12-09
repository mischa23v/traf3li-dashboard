import { useState, useMemo } from 'react'
import {
    Save, Calendar, User, FileText, Plus, Trash2, Briefcase, Loader2, Percent, Hash, Send,
    Building2, Users, Clock, Receipt, MoreVertical, ChevronDown, Shield, AlertCircle,
    Wallet, CalendarDays, CreditCard, UserCheck, Paperclip, Mail, Eye, Download, Printer,
    X, Copy, Bell, DollarSign, Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateInvoice, useSendInvoice } from '@/hooks/useFinance'
import { useClients, useCases, useLawyers } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'
import { useApiError } from '@/hooks/useApiError'
import { ValidationErrors } from '@/components/validation-errors'
import { isValidVatNumber, errorMessages } from '@/utils/validation-patterns'

// Types
type FirmSize = 'solo' | 'small' | 'medium' | 'large'
type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'void' | 'written_off'
type PaymentTerms = 'due_on_receipt' | 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'eom' | 'custom'
type BillingArrangement = 'hourly' | 'flat_fee' | 'contingency' | 'blended' | 'monthly_retainer' | 'percentage'
type LineItemType = 'time' | 'expense' | 'flat_fee' | 'product' | 'discount' | 'subtotal' | 'comment'

interface LineItem {
    id: string
    type: LineItemType
    date?: string
    description: string
    quantity: number
    unitPrice: number
    discountType?: 'percentage' | 'fixed'
    discountValue?: number
    lineTotal: number
    taxable: boolean
    attorneyId?: string
    activityCode?: string
    billableHours?: number
    hourlyRate?: number
}

// Generate invoice number
const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}${month}-${random}`
}

// Convert number to Arabic words (simplified)
const numberToArabicWords = (num: number): string => {
    if (num === 0) return 'صفر ريال سعودي'
    const formatted = num.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${formatted} ريال سعودي فقط لا غير`
}

export function CreateInvoiceView() {
    const navigate = useNavigate()
    const createInvoiceMutation = useCreateInvoice()
    const sendInvoiceMutation = useSendInvoice()

    // API Error handling
    const { handleApiError, validationErrors, clearError } = useApiError()

    // Load data from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: casesData, isLoading: loadingCases } = useCases()
    const { data: lawyersData, isLoading: loadingLawyers } = useLawyers()

    // Firm size selection - controls visibility of organizational fields
    const [firmSize, setFirmSize] = useState<FirmSize>('solo')
    const [showDetailedTracking, setShowDetailedTracking] = useState(false)
    const [showOrgFields, setShowOrgFields] = useState(false)

    // Header section state
    const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber())
    const [status] = useState<InvoiceStatus>('draft')
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState('')
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30')
    const [currency] = useState('SAR')

    // Client & Case
    const [clientId, setClientId] = useState('')
    const [clientType, setClientType] = useState<'individual' | 'corporate' | 'government'>('individual')
    const [caseId, setCaseId] = useState('')

    // Organization fields (for firms)
    const [departmentId, setDepartmentId] = useState('')
    const [locationId, setLocationId] = useState('')
    const [responsibleAttorneyId, setResponsibleAttorneyId] = useState('')
    const [billingArrangement, setBillingArrangement] = useState<BillingArrangement>('hourly')
    const [customerPONumber, setCustomerPONumber] = useState('')
    const [matterNumber, setMatterNumber] = useState('')

    // Line items
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            id: '1',
            type: 'time',
            date: new Date().toISOString().split('T')[0],
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxable: true,
            lineTotal: 0,
        }
    ])

    // Discount
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
    const [discountValue, setDiscountValue] = useState(0)

    // Notes
    const [customerNotes, setCustomerNotes] = useState('')
    const [internalNotes, setInternalNotes] = useState('')
    const [termsAndConditions, setTermsAndConditions] = useState('')
    const [termsTemplate, setTermsTemplate] = useState('standard')

    // Advanced - ZATCA
    const [officeVATNumber] = useState('300000000000003')
    const [officeCR] = useState('1010000000')
    const [clientVATNumber, setClientVATNumber] = useState('')
    const [clientCR, setClientCR] = useState('')
    const [invoiceSubtype, setInvoiceSubtype] = useState<'0100000' | '0200000'>('0200000')

    // Advanced - WIP & Budget (for firms)
    const [wipAmount] = useState(0)
    const [writeOffAmount, setWriteOffAmount] = useState(0)
    const [writeDownAmount, setWriteDownAmount] = useState(0)
    const [adjustmentReason, setAdjustmentReason] = useState('')
    const [projectBudget] = useState(50000)
    const [budgetConsumed] = useState(35000)
    const [percentComplete] = useState(70)

    // Advanced - Retainer
    const [retainerBalanceAvailable] = useState(10000)
    const [applyFromRetainer, setApplyFromRetainer] = useState(0)

    // Advanced - Payment Plan
    const [enablePaymentPlan, setEnablePaymentPlan] = useState(false)
    const [installments, setInstallments] = useState('3')
    const [installmentFrequency, setInstallmentFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')

    // Advanced - Payment Settings
    const [bankAccountId, setBankAccountId] = useState('')
    const [paymentInstructions, setPaymentInstructions] = useState('')
    const [enableOnlinePayment, setEnableOnlinePayment] = useState(false)

    // Advanced - Approval (for large firms)
    const [requiresApproval, setRequiresApproval] = useState(false)

    // Advanced - Email
    const [emailTemplate, setEmailTemplate] = useState('standard')
    const [emailSubject, setEmailSubject] = useState('')
    const [autoSendOnApproval, setAutoSendOnApproval] = useState(false)

    // Send options
    const [sendAfterCreate, setSendAfterCreate] = useState(false)

    // Lawyers list
    const lawyers = useMemo(() => {
        if (!lawyersData) return []
        return Array.isArray(lawyersData) ? lawyersData : (lawyersData as any)?.data || []
    }, [lawyersData])

    // Handle payment terms change
    const handlePaymentTermsChange = (terms: PaymentTerms) => {
        setPaymentTerms(terms)
        if (terms && issueDate) {
            const issue = new Date(issueDate)
            let days = 30
            switch (terms) {
                case 'due_on_receipt': days = 0; break
                case 'net_7': days = 7; break
                case 'net_15': days = 15; break
                case 'net_30': days = 30; break
                case 'net_45': days = 45; break
                case 'net_60': days = 60; break
                case 'net_90': days = 90; break
                case 'eom':
                    issue.setMonth(issue.getMonth() + 1)
                    issue.setDate(0)
                    setDueDate(issue.toISOString().split('T')[0])
                    return
            }
            issue.setDate(issue.getDate() + days)
            setDueDate(issue.toISOString().split('T')[0])
        }
    }

    // Line item handlers
    const addLineItem = (type: LineItemType = 'time') => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            type,
            date: new Date().toISOString().split('T')[0],
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxable: true,
            lineTotal: 0,
        }
        setLineItems([...lineItems, newItem])
    }

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id))
        }
    }

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value }
                // Recalculate line total
                let lineTotal = updated.quantity * updated.unitPrice
                if (updated.discountValue) {
                    if (updated.discountType === 'percentage') {
                        lineTotal -= lineTotal * (updated.discountValue / 100)
                    } else {
                        lineTotal -= updated.discountValue
                    }
                }
                updated.lineTotal = lineTotal
                return updated
            }
            return item
        }))
    }

    const duplicateLineItem = (id: string) => {
        const item = lineItems.find(i => i.id === id)
        if (item) {
            const newItem = { ...item, id: Date.now().toString() }
            const index = lineItems.findIndex(i => i.id === id)
            const newItems = [...lineItems]
            newItems.splice(index + 1, 0, newItem)
            setLineItems(newItems)
        }
    }

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = lineItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice)
        }, 0)

        // Calculate item-level discounts
        const itemDiscounts = lineItems.reduce((sum, item) => {
            if (!item.discountValue) return sum
            const lineSubtotal = item.quantity * item.unitPrice
            if (item.discountType === 'percentage') {
                return sum + (lineSubtotal * (item.discountValue / 100))
            }
            return sum + item.discountValue
        }, 0)

        // Invoice-level discount
        let invoiceDiscount = 0
        if (discountType === 'percentage') {
            invoiceDiscount = (subtotal - itemDiscounts) * (discountValue / 100)
        } else {
            invoiceDiscount = discountValue
        }

        const totalDiscount = itemDiscounts + invoiceDiscount
        const taxableAmount = subtotal - totalDiscount
        const vatAmount = taxableAmount * 0.15 // 15% Saudi VAT
        const total = taxableAmount + vatAmount

        // Apply retainer
        const afterRetainer = total - applyFromRetainer
        const balanceDue = Math.max(0, afterRetainer)

        return {
            subtotal,
            itemDiscounts,
            invoiceDiscount,
            totalDiscount,
            taxableAmount,
            vatAmount,
            total,
            balanceDue,
            totalInWords: numberToArabicWords(total),
        }
    }, [lineItems, discountType, discountValue, applyFromRetainer])

    // Generate installment schedule
    const installmentSchedule = useMemo(() => {
        if (!enablePaymentPlan) return []
        const numInstallments = parseInt(installments)
        const amount = calculations.balanceDue / numInstallments
        const schedule = []
        let currentDate = new Date(dueDate || issueDate)

        for (let i = 0; i < numInstallments; i++) {
            schedule.push({
                dueDate: currentDate.toISOString().split('T')[0],
                amount,
            })
            if (installmentFrequency === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7)
            } else if (installmentFrequency === 'biweekly') {
                currentDate.setDate(currentDate.getDate() + 14)
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1)
            }
        }
        return schedule
    }, [enablePaymentPlan, installments, installmentFrequency, calculations.balanceDue, dueDate, issueDate])

    // Validation function
    const validateForm = () => {
        clearError()
        const errors: Array<{ field: string; message: string }> = []

        // Validate client selection
        if (!clientId) {
            errors.push({
                field: 'العميل',
                message: 'يرجى اختيار العميل'
            })
        }

        // Validate invoice items - at least one item required
        if (lineItems.length === 0) {
            errors.push({
                field: 'بنود الفاتورة',
                message: 'يجب إضافة بند واحد على الأقل'
            })
        }

        // Validate line items have description and positive amounts
        lineItems.forEach((item, index) => {
            if (!item.description.trim()) {
                errors.push({
                    field: `البند ${index + 1}`,
                    message: 'يرجى إدخال وصف للبند'
                })
            }
            if (item.quantity <= 0) {
                errors.push({
                    field: `البند ${index + 1} - الكمية`,
                    message: 'الكمية يجب أن تكون أكبر من صفر'
                })
            }
            if (item.unitPrice < 0) {
                errors.push({
                    field: `البند ${index + 1} - السعر`,
                    message: 'السعر يجب أن يكون موجباً'
                })
            }
        })

        // Validate VAT number if B2B invoice (invoiceSubtype === '0100000')
        if (invoiceSubtype === '0100000' && clientType !== 'individual') {
            if (!clientVATNumber) {
                errors.push({
                    field: 'الرقم الضريبي للعميل',
                    message: 'الرقم الضريبي مطلوب للفواتير بين المنشآت (B2B)'
                })
            } else if (!isValidVatNumber(clientVATNumber)) {
                errors.push({
                    field: 'الرقم الضريبي للعميل',
                    message: errorMessages.vatNumber.ar
                })
            }
        }

        // Return validation result
        if (errors.length > 0) {
            handleApiError({
                status: 400,
                message: 'يرجى تصحيح الأخطاء التالية',
                error: true,
                errors
            })
            return false
        }

        return true
    }

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            // Scroll to top to show validation errors
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        const invoiceData = {
            invoiceNumber,
            clientId,
            clientType,
            ...(caseId && { caseId }),
            issueDate,
            dueDate,
            paymentTerms,
            currency,
            // Organization fields
            ...(firmSize !== 'solo' && {
                departmentId,
                locationId,
                responsibleAttorneyId,
                billingArrangement,
                customerPONumber,
                matterNumber,
            }),
            // Line items
            items: lineItems.map(item => ({
                type: item.type,
                date: item.date,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountType: item.discountType,
                discountValue: item.discountValue,
                lineTotal: item.lineTotal,
                taxable: item.taxable,
                ...(item.attorneyId && { attorneyId: item.attorneyId }),
                ...(item.activityCode && { activityCode: item.activityCode }),
            })),
            // Totals
            subtotal: calculations.subtotal,
            discountType,
            discountValue,
            discountAmount: calculations.totalDiscount,
            vatRate: 0.15,
            vatAmount: calculations.vatAmount,
            totalAmount: calculations.total,
            // Notes
            customerNotes,
            internalNotes,
            termsAndConditions,
            // Advanced
            ...(invoiceSubtype === '0100000' && {
                clientVATNumber,
                clientCR,
            }),
            ...(applyFromRetainer > 0 && { applyFromRetainer }),
            ...(enablePaymentPlan && {
                enablePaymentPlan,
                installments: parseInt(installments),
                installmentFrequency,
                installmentSchedule,
            }),
            bankAccountId,
            paymentInstructions,
            enableOnlinePayment,
            ...(requiresApproval && { requiresApproval }),
        }

        createInvoiceMutation.mutate(invoiceData, {
            onSuccess: (data) => {
                clearError()
                if (sendAfterCreate && data?._id) {
                    sendInvoiceMutation.mutate(data._id, {
                        onSuccess: () => navigate({ to: '/dashboard/finance/invoices' }),
                        onError: (error) => {
                            handleApiError(error)
                            navigate({ to: '/dashboard/finance/invoices' })
                        }
                    })
                } else {
                    navigate({ to: '/dashboard/finance/invoices' })
                }
            },
            onError: (error) => {
                handleApiError(error)
                // Scroll to top to show error
                window.scrollTo({ top: 0, behavior: 'smooth' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س'
    }

    // Status badge variant
    const getStatusBadge = (s: InvoiceStatus) => {
        const variants: Record<InvoiceStatus, { label: string; className: string }> = {
            draft: { label: 'مسودة', className: 'bg-slate-100 text-slate-700' },
            sent: { label: 'مرسلة', className: 'bg-blue-100 text-blue-700' },
            viewed: { label: 'تم الاطلاع', className: 'bg-purple-100 text-purple-700' },
            partial: { label: 'مدفوعة جزئياً', className: 'bg-amber-100 text-amber-700' },
            paid: { label: 'مدفوعة', className: 'bg-green-100 text-green-700' },
            overdue: { label: 'متأخرة', className: 'bg-red-100 text-red-700' },
            void: { label: 'ملغاة', className: 'bg-gray-100 text-gray-700' },
            written_off: { label: 'شُطبت', className: 'bg-gray-100 text-gray-700' },
        }
        return variants[s]
    }

    const statusInfo = getStatusBadge(status)

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD */}
                <ProductivityHero badge="الفواتير" title="إنشاء فاتورة جديدة" type="invoices" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* VALIDATION ERRORS */}
                            {validationErrors && validationErrors.length > 0 && (
                                <ValidationErrors errors={validationErrors} />
                            )}

                            {/* FIRM SIZE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        نوع المكتب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { value: 'solo', label: 'محامي فردي', icon: User },
                                            { value: 'small', label: 'مكتب صغير', icon: Users },
                                            { value: 'medium', label: 'مكتب متوسط', icon: Building2 },
                                            { value: 'large', label: 'شركة محاماة', icon: Building2 },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFirmSize(option.value as FirmSize)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-center",
                                                    firmSize === option.value
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                )}
                                            >
                                                <option.icon className="w-6 h-6 mx-auto mb-2" />
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {firmSize !== 'solo' && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <Switch
                                                checked={showDetailedTracking}
                                                onCheckedChange={setShowDetailedTracking}
                                            />
                                            <Label className="text-sm text-slate-600">تفعيل التتبع التفصيلي (UTBMS)</Label>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* HEADER SECTION */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold text-slate-800">فاتورة جديدة</CardTitle>
                                            <Badge className={cn("rounded-full", statusInfo.className)}>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="text-start space-y-1">
                                            <Label className="text-xs text-slate-500">رقم الفاتورة</Label>
                                            <Input
                                                value={invoiceNumber}
                                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                                className="w-48 rounded-xl border-slate-200 text-start font-mono"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Client Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                العميل
                                            </Label>
                                            <Select value={clientId} onValueChange={setClientId} disabled={loadingClients}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية (اختياري)
                                            </Label>
                                            <Select value={caseId} onValueChange={setCaseId} disabled={loadingCases || !clientId}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={!clientId ? "اختر العميل أولاً" : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون قضية</SelectItem>
                                                    {casesData?.data
                                                        ?.filter((c: any) => !clientId || c.clientId === clientId)
                                                        .map((caseItem: any) => (
                                                            <SelectItem key={caseItem._id} value={caseItem._id}>
                                                                {caseItem.caseNumber} - {caseItem.title}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Client Type */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">نوع العميل</Label>
                                        <div className="flex gap-3">
                                            {[
                                                { value: 'individual', label: 'فرد' },
                                                { value: 'corporate', label: 'شركة' },
                                                { value: 'government', label: 'جهة حكومية' },
                                            ].map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => setClientType(type.value as typeof clientType)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                                        clientType === type.value
                                                            ? "bg-emerald-500 text-white"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الإصدار
                                            </Label>
                                            <Input
                                                type="date"
                                                value={issueDate}
                                                onChange={(e) => setIssueDate(e.target.value)}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                شروط الدفع
                                            </Label>
                                            <Select value={paymentTerms} onValueChange={(v) => handlePaymentTermsChange(v as PaymentTerms)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="due_on_receipt">فوري</SelectItem>
                                                    <SelectItem value="net_7">7 أيام (Net 7)</SelectItem>
                                                    <SelectItem value="net_15">15 يوم (Net 15)</SelectItem>
                                                    <SelectItem value="net_30">30 يوم (Net 30)</SelectItem>
                                                    <SelectItem value="net_45">45 يوم (Net 45)</SelectItem>
                                                    <SelectItem value="net_60">60 يوم (Net 60)</SelectItem>
                                                    <SelectItem value="net_90">90 يوم (Net 90)</SelectItem>
                                                    <SelectItem value="eom">نهاية الشهر</SelectItem>
                                                    <SelectItem value="custom">مخصص</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الاستحقاق
                                            </Label>
                                            <Input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                min={issueDate}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ORGANIZATION FIELDS (for firms only) */}
                            {firmSize !== 'solo' && (
                                <Collapsible open={showOrgFields} onOpenChange={setShowOrgFields}>
                                    <Card className="rounded-3xl shadow-sm border-slate-100">
                                        <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                        <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                                        تفاصيل تنظيمية
                                                    </CardTitle>
                                                    <ChevronDown className={cn("w-5 h-5 text-slate-600 transition-transform", showOrgFields && "rotate-180")} />
                                                </div>
                                            </CardHeader>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">القسم</Label>
                                                        <Select value={departmentId} onValueChange={setDepartmentId}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر القسم" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="commercial">القسم التجاري</SelectItem>
                                                                <SelectItem value="criminal">القسم الجنائي</SelectItem>
                                                                <SelectItem value="corporate">قسم الشركات</SelectItem>
                                                                <SelectItem value="real_estate">قسم العقارات</SelectItem>
                                                                <SelectItem value="labor">قسم العمل</SelectItem>
                                                                <SelectItem value="family">قسم الأحوال الشخصية</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">الفرع</Label>
                                                        <Select value={locationId} onValueChange={setLocationId}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر الفرع" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="riyadh">الرياض</SelectItem>
                                                                <SelectItem value="jeddah">جدة</SelectItem>
                                                                <SelectItem value="dammam">الدمام</SelectItem>
                                                                <SelectItem value="makkah">مكة المكرمة</SelectItem>
                                                                <SelectItem value="madinah">المدينة المنورة</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">
                                                            المحامي المسؤول
                                                        </Label>
                                                        <Select value={responsibleAttorneyId} onValueChange={setResponsibleAttorneyId} disabled={loadingLawyers}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر المحامي" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {lawyers.map((lawyer: any) => (
                                                                    <SelectItem key={lawyer._id} value={lawyer._id}>
                                                                        {lawyer.firstName} {lawyer.lastName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">ترتيب الفوترة</Label>
                                                        <Select value={billingArrangement} onValueChange={(v) => setBillingArrangement(v as BillingArrangement)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="hourly">بالساعة</SelectItem>
                                                                <SelectItem value="flat_fee">مبلغ مقطوع</SelectItem>
                                                                <SelectItem value="contingency">نسبة من النتيجة</SelectItem>
                                                                <SelectItem value="blended">مختلط</SelectItem>
                                                                <SelectItem value="monthly_retainer">اشتراك شهري</SelectItem>
                                                                <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">رقم أمر الشراء</Label>
                                                        <Input
                                                            value={customerPONumber}
                                                            onChange={(e) => setCustomerPONumber(e.target.value)}
                                                            placeholder="PO-12345"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">رقم الملف الداخلي</Label>
                                                        <Input
                                                            value={matterNumber}
                                                            onChange={(e) => setMatterNumber(e.target.value)}
                                                            placeholder="M-2024-001"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                            )}

                            {/* LINE ITEMS TABLE */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                            بنود الفاتورة
                                        </CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Table Header */}
                                    <div className={cn(
                                        "flex gap-2 items-center text-xs font-medium text-slate-500 px-2",
                                        "border-b border-slate-100 pb-2"
                                    )}>
                                        <div className="w-8 text-center">#</div>
                                        <div className="w-24">التاريخ</div>
                                        {firmSize !== 'solo' && <div className="w-28">المحامي</div>}
                                        {showDetailedTracking && <div className="w-28">نوع النشاط</div>}
                                        <div className="flex-1">الوصف</div>
                                        <div className="w-16 text-center">الكمية</div>
                                        <div className="w-24 text-center">السعر</div>
                                        <div className="w-20 text-center">خصم</div>
                                        <div className="w-24 text-center">الإجمالي</div>
                                        <div className="w-10"></div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="space-y-2">
                                        {lineItems.map((item, index) => (
                                            <div key={item.id} className="flex gap-2 items-start p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="w-8 text-center text-sm text-slate-500 pt-2">
                                                    {index + 1}
                                                </div>

                                                <div className="w-24">
                                                    <Input
                                                        type="date"
                                                        value={item.date}
                                                        onChange={(e) => updateLineItem(item.id, 'date', e.target.value)}
                                                        className="rounded-lg border-slate-200 text-xs h-9"
                                                    />
                                                </div>

                                                {firmSize !== 'solo' && (
                                                    <div className="w-28">
                                                        <Select
                                                            value={item.attorneyId || ''}
                                                            onValueChange={(v) => updateLineItem(item.id, 'attorneyId', v)}
                                                        >
                                                            <SelectTrigger className="rounded-lg border-slate-200 h-9 text-xs">
                                                                <SelectValue placeholder="اختر" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {lawyers.map((lawyer: any) => (
                                                                    <SelectItem key={lawyer._id} value={lawyer._id}>
                                                                        {lawyer.firstName} {lawyer.lastName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {showDetailedTracking && (
                                                    <div className="w-28">
                                                        <Select
                                                            value={item.activityCode || ''}
                                                            onValueChange={(v) => updateLineItem(item.id, 'activityCode', v)}
                                                        >
                                                            <SelectTrigger className="rounded-lg border-slate-200 h-9 text-xs">
                                                                <SelectValue placeholder="اختر" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="L110">استشارة قانونية</SelectItem>
                                                                <SelectItem value="L120">بحث قانوني</SelectItem>
                                                                <SelectItem value="L130">صياغة مستندات</SelectItem>
                                                                <SelectItem value="L140">مراجعة مستندات</SelectItem>
                                                                <SelectItem value="L210">حضور جلسة</SelectItem>
                                                                <SelectItem value="L220">اجتماع عميل</SelectItem>
                                                                <SelectItem value="L230">مكالمة هاتفية</SelectItem>
                                                                <SelectItem value="L240">مراسلات</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <Textarea
                                                        value={item.description}
                                                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                        placeholder="وصف الخدمة..."
                                                        className="rounded-lg border-slate-200 min-h-[36px] resize-none text-sm"
                                                        rows={1}
                                                    />
                                                </div>

                                                <div className="w-16">
                                                    <Input
                                                        type="number"
                                                        min="0.25"
                                                        step="0.25"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg border-slate-200 text-center h-9 text-sm"
                                                    />
                                                </div>

                                                <div className="w-24">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg border-slate-200 text-center h-9 text-sm"
                                                    />
                                                </div>

                                                <div className="w-20 flex gap-1">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.discountValue || ''}
                                                        onChange={(e) => updateLineItem(item.id, 'discountValue', parseFloat(e.target.value) || 0)}
                                                        className="rounded-lg border-slate-200 h-9 text-xs w-12"
                                                        placeholder="0"
                                                    />
                                                    <Select
                                                        value={item.discountType || 'percentage'}
                                                        onValueChange={(v) => updateLineItem(item.id, 'discountType', v)}
                                                    >
                                                        <SelectTrigger className="rounded-lg border-slate-200 h-9 w-8 px-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">%</SelectItem>
                                                            <SelectItem value="fixed">ر.س</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="w-24 flex items-center justify-center h-9 bg-slate-50 rounded-lg text-sm font-medium">
                                                    {formatCurrency(item.quantity * item.unitPrice - (item.discountValue || 0) * (item.discountType === 'percentage' ? item.quantity * item.unitPrice / 100 : 1))}
                                                </div>

                                                <div className="w-10">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="خيارات">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => duplicateLineItem(item.id)}>
                                                                <Copy className="h-4 w-4 ms-2" aria-hidden="true" />
                                                                نسخ
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => removeLineItem(item.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Line Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => addLineItem('time')} className="rounded-xl">
                                            <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                            إضافة بند
                                        </Button>

                                        {firmSize !== 'solo' && (
                                            <>
                                                <Button type="button" variant="outline" className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
                                                    <Clock className="h-4 w-4 ms-2" aria-hidden="true" />
                                                    استيراد من الساعات
                                                </Button>
                                                <Button type="button" variant="outline" className="rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50">
                                                    <Receipt className="h-4 w-4 ms-2" aria-hidden="true" />
                                                    استيراد من المصروفات
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* DISCOUNT SECTION */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-emerald-500" />
                                                نوع الخصم
                                            </Label>
                                            <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                                                    <SelectItem value="fixed">مبلغ ثابت (ر.س)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">قيمة الخصم</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">مبلغ الخصم</Label>
                                            <div className="h-10 flex items-center px-3 bg-red-50 rounded-xl border border-red-200 text-sm font-medium text-red-600">
                                                -{formatCurrency(calculations.invoiceDiscount)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* TOTALS SECTION */}
                            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50">
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">المجموع الفرعي</span>
                                        <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                                    </div>

                                    {calculations.totalDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-red-600">
                                            <span>الخصم ({discountType === 'percentage' ? `${discountValue}%` : 'مبلغ ثابت'})</span>
                                            <span>-{formatCurrency(calculations.totalDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">ضريبة القيمة المضافة (15%)</span>
                                        <span className="font-medium">{formatCurrency(calculations.vatAmount)}</span>
                                    </div>

                                    <Separator className="bg-emerald-200" />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-emerald-800">الإجمالي</span>
                                        <span className="text-emerald-600">{formatCurrency(calculations.total)}</span>
                                    </div>

                                    <p className="text-xs text-slate-500 text-center pt-2">
                                        {calculations.totalInWords}
                                    </p>

                                    {applyFromRetainer > 0 && (
                                        <>
                                            <Separator className="bg-emerald-200 my-4" />
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>العربون المطبق</span>
                                                <span>-{formatCurrency(applyFromRetainer)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>المتبقي</span>
                                                <span className={calculations.balanceDue > 0 ? 'text-amber-600' : 'text-green-600'}>
                                                    {formatCurrency(calculations.balanceDue)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* NOTES SECTION */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardContent className="p-6">
                                    <Tabs defaultValue="customer" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                                            <TabsTrigger value="customer" className="rounded-lg">ملاحظات للعميل</TabsTrigger>
                                            <TabsTrigger value="internal" className="rounded-lg">ملاحظات داخلية</TabsTrigger>
                                            <TabsTrigger value="terms" className="rounded-lg">الشروط والأحكام</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="customer" className="mt-4">
                                            <Textarea
                                                placeholder="ملاحظات تظهر في الفاتورة..."
                                                value={customerNotes}
                                                onChange={(e) => setCustomerNotes(e.target.value)}
                                                className="rounded-xl border-slate-200 min-h-[100px]"
                                            />
                                        </TabsContent>

                                        <TabsContent value="internal" className="mt-4">
                                            <Textarea
                                                placeholder="ملاحظات داخلية (لن تظهر للعميل)..."
                                                value={internalNotes}
                                                onChange={(e) => setInternalNotes(e.target.value)}
                                                className="rounded-xl border-slate-200 min-h-[100px]"
                                            />
                                        </TabsContent>

                                        <TabsContent value="terms" className="mt-4 space-y-3">
                                            <Select value={termsTemplate} onValueChange={setTermsTemplate}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">الشروط القياسية</SelectItem>
                                                    <SelectItem value="corporate">شروط الشركات</SelectItem>
                                                    <SelectItem value="government">شروط حكومية</SelectItem>
                                                    <SelectItem value="custom">مخصص</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Textarea
                                                value={termsAndConditions}
                                                onChange={(e) => setTermsAndConditions(e.target.value)}
                                                className="rounded-xl border-slate-200 min-h-[150px]"
                                                placeholder="الشروط والأحكام..."
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTION */}
                            <Accordion type="multiple" className="space-y-4">

                                {/* ZATCA Compliance */}
                                <AccordionItem value="zatca" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-emerald-500" />
                                            <span className="font-bold text-slate-800">متطلبات ZATCA (هيئة الزكاة والضريبة)</span>
                                            {clientType !== 'individual' && !clientVATNumber && (
                                                <Badge variant="destructive" className="rounded-full">مطلوب</Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <Alert className="mb-4 rounded-xl">
                                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                            <AlertDescription>
                                                هذه المعلومات مطلوبة للفواتير الضريبية حسب نظام ZATCA
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Office Info */}
                                            <Card className="rounded-xl">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm">معلومات المكتب</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">الرقم الضريبي</Label>
                                                        <Input
                                                            value={officeVATNumber}
                                                            disabled
                                                            className="rounded-lg bg-slate-50 text-xs font-mono"
                                                            dir="ltr"
                                                        />
                                                        <p className="text-xs text-slate-600">يتم جلبه من الإعدادات</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">السجل التجاري</Label>
                                                        <Input
                                                            value={officeCR}
                                                            disabled
                                                            className="rounded-lg bg-slate-50 text-xs font-mono"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Client Info */}
                                            <Card className="rounded-xl">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm">معلومات العميل</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">
                                                            نوع الفاتورة
                                                        </Label>
                                                        <Select value={invoiceSubtype} onValueChange={(v: '0100000' | '0200000') => setInvoiceSubtype(v)}>
                                                            <SelectTrigger className="rounded-lg text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="0100000">B2B (منشأة لمنشأة)</SelectItem>
                                                                <SelectItem value="0200000">B2C (منشأة لفرد)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">
                                                            الرقم الضريبي للعميل {invoiceSubtype === '0100000' && <span className="text-red-500">*</span>}
                                                        </Label>
                                                        <Input
                                                            value={clientVATNumber}
                                                            onChange={(e) => setClientVATNumber(e.target.value)}
                                                            placeholder="300000000000003"
                                                            className={cn(
                                                                "rounded-lg text-xs font-mono",
                                                                clientVATNumber && !isValidVatNumber(clientVATNumber) && "border-red-500"
                                                            )}
                                                            dir="ltr"
                                                            pattern="[0-9]{15}"
                                                            maxLength={15}
                                                        />
                                                        {clientVATNumber && !isValidVatNumber(clientVATNumber) && (
                                                            <p className="text-xs text-red-600">{errorMessages.vatNumber.ar}</p>
                                                        )}
                                                        <p className="text-xs text-slate-600">15 رقماً يبدأ بـ 3</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-slate-500">السجل التجاري للعميل</Label>
                                                        <Input
                                                            value={clientCR}
                                                            onChange={(e) => setClientCR(e.target.value)}
                                                            className="rounded-lg text-xs font-mono"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* WIP & Budget (for firms) */}
                                {firmSize !== 'solo' && (
                                    <AccordionItem value="wip" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                                <span className="font-bold text-slate-800">WIP & ميزانية المشروع</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card className="rounded-xl">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">WIP (العمل غير المفوتر)</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">إجمالي WIP:</span>
                                                            <span className="font-semibold">{formatCurrency(wipAmount)}</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-slate-500">مبلغ الشطب (Write-Off)</Label>
                                                            <Input
                                                                type="number"
                                                                value={writeOffAmount}
                                                                onChange={(e) => setWriteOffAmount(parseFloat(e.target.value) || 0)}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-slate-500">مبلغ التخفيض (Write-Down)</Label>
                                                            <Input
                                                                type="number"
                                                                value={writeDownAmount}
                                                                onChange={(e) => setWriteDownAmount(parseFloat(e.target.value) || 0)}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        {(writeOffAmount > 0 || writeDownAmount > 0) && (
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-slate-500">سبب التعديل <span className="text-red-500">*</span></Label>
                                                                <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                                                                    <SelectTrigger className="rounded-lg">
                                                                        <SelectValue placeholder="اختر السبب" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="client_relationship">علاقة مع العميل</SelectItem>
                                                                        <SelectItem value="collection_risk">مخاطر تحصيل</SelectItem>
                                                                        <SelectItem value="quality_issue">مشكلة جودة</SelectItem>
                                                                        <SelectItem value="competitive_pricing">أسعار تنافسية</SelectItem>
                                                                        <SelectItem value="pro_bono">خدمات مجانية</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="rounded-xl">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">ميزانية المشروع</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">الميزانية:</span>
                                                                <span className="font-semibold">{formatCurrency(projectBudget)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">المستهلك:</span>
                                                                <span className="text-red-600">{formatCurrency(budgetConsumed)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">المتبقي:</span>
                                                                <span className="text-green-600">{formatCurrency(projectBudget - budgetConsumed)}</span>
                                                            </div>
                                                        </div>
                                                        <Separator />
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-slate-500">نسبة الإنجاز</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={percentComplete} className="flex-1" />
                                                                <span className="text-sm font-medium">{percentComplete}%</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Retainer */}
                                {retainerBalanceAvailable > 0 && (
                                    <AccordionItem value="retainer" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="h-5 w-5 text-purple-500" />
                                                <span className="font-bold text-slate-800">تطبيق من العربون</span>
                                                <Badge className="rounded-full bg-purple-100 text-purple-700">
                                                    {formatCurrency(retainerBalanceAvailable)} متاح
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <Card className="rounded-xl">
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-slate-600">الرصيد المتوفر:</span>
                                                        <span className="text-lg font-bold text-green-600">
                                                            {formatCurrency(retainerBalanceAvailable)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">المبلغ المطبق من العربون</Label>
                                                        <Input
                                                            type="number"
                                                            value={applyFromRetainer}
                                                            onChange={(e) => setApplyFromRetainer(Math.min(parseFloat(e.target.value) || 0, Math.min(retainerBalanceAvailable, calculations.total)))}
                                                            max={Math.min(retainerBalanceAvailable, calculations.total)}
                                                            className="rounded-xl"
                                                        />
                                                        <p className="text-xs text-slate-600">
                                                            الحد الأقصى: {formatCurrency(Math.min(retainerBalanceAvailable, calculations.total))}
                                                        </p>
                                                    </div>
                                                    {applyFromRetainer > 0 && (
                                                        <Alert className="rounded-xl bg-green-50 border-green-200">
                                                            <AlertCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                                                            <AlertDescription className="text-green-700">
                                                                سيتم خصم {formatCurrency(applyFromRetainer)} من رصيد العربون
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Payment Plan */}
                                <AccordionItem value="payment-plan" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-amber-500" />
                                            <span className="font-bold text-slate-800">خطة الدفع (الأقساط)</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <Card className="rounded-xl">
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>تفعيل الدفع على أقساط</Label>
                                                    <Switch
                                                        checked={enablePaymentPlan}
                                                        onCheckedChange={setEnablePaymentPlan}
                                                    />
                                                </div>

                                                {enablePaymentPlan && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm">عدد الأقساط</Label>
                                                                <Select value={installments} onValueChange={setInstallments}>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="2">قسطين</SelectItem>
                                                                        <SelectItem value="3">3 أقساط</SelectItem>
                                                                        <SelectItem value="4">4 أقساط</SelectItem>
                                                                        <SelectItem value="6">6 أقساط</SelectItem>
                                                                        <SelectItem value="12">12 قسط</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm">التكرار</Label>
                                                                <Select value={installmentFrequency} onValueChange={(v: 'weekly' | 'biweekly' | 'monthly') => setInstallmentFrequency(v)}>
                                                                    <SelectTrigger className="rounded-xl">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="weekly">أسبوعياً</SelectItem>
                                                                        <SelectItem value="biweekly">كل أسبوعين</SelectItem>
                                                                        <SelectItem value="monthly">شهرياً</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {installmentSchedule.length > 0 && (
                                                            <div className="space-y-2">
                                                                <Label className="text-sm">جدول الأقساط</Label>
                                                                <div className="border rounded-xl overflow-hidden">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="bg-slate-50">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-start">القسط</th>
                                                                                <th className="px-4 py-2 text-start">تاريخ الاستحقاق</th>
                                                                                <th className="px-4 py-2 text-start">المبلغ</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {installmentSchedule.map((inst, i) => (
                                                                                <tr key={i} className="border-t">
                                                                                    <td className="px-4 py-2">القسط {i + 1}</td>
                                                                                    <td className="px-4 py-2">{inst.dueDate}</td>
                                                                                    <td className="px-4 py-2 font-medium">{formatCurrency(inst.amount)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Payment Settings */}
                                <AccordionItem value="payment" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-green-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">إعدادات الدفع</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">الحساب البنكي المستلم</Label>
                                                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="اختر الحساب البنكي" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bank1">البنك الأهلي - جاري - ****1234</SelectItem>
                                                        <SelectItem value="bank2">مصرف الراجحي - جاري - ****5678</SelectItem>
                                                        <SelectItem value="bank3">بنك الرياض - جاري - ****9012</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm">تعليمات الدفع</Label>
                                                <Textarea
                                                    value={paymentInstructions}
                                                    onChange={(e) => setPaymentInstructions(e.target.value)}
                                                    placeholder="سيتم عرض هذه التعليمات في الفاتورة..."
                                                    className="rounded-xl min-h-[100px]"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <Label>تفعيل الدفع الإلكتروني</Label>
                                                    <p className="text-xs text-slate-500">عبر Stripe / HyperPay / Moyasar</p>
                                                </div>
                                                <Switch
                                                    checked={enableOnlinePayment}
                                                    onCheckedChange={setEnableOnlinePayment}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Approval Workflow (Large Firms Only) */}
                                {firmSize === 'large' && (
                                    <AccordionItem value="approval" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-5 w-5 text-indigo-500" />
                                                <span className="font-bold text-slate-800">سير الموافقات</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <Card className="rounded-xl">
                                                <CardContent className="pt-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label>يتطلب موافقة قبل الإرسال</Label>
                                                        <Switch
                                                            checked={requiresApproval}
                                                            onCheckedChange={setRequiresApproval}
                                                        />
                                                    </div>
                                                    {requiresApproval && (
                                                        <div className="space-y-2">
                                                            <Label className="text-sm">سلسلة الموافقات</Label>
                                                            <Select>
                                                                <SelectTrigger className="rounded-xl">
                                                                    <SelectValue placeholder="اختر المعتمدين" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {lawyers.filter((l: any) => l.role === 'admin').map((lawyer: any) => (
                                                                        <SelectItem key={lawyer._id} value={lawyer._id}>
                                                                            {lawyer.firstName} {lawyer.lastName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Email Settings */}
                                <AccordionItem value="email" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">إعدادات البريد الإلكتروني</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">قالب البريد</Label>
                                                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="standard">قياسي</SelectItem>
                                                        <SelectItem value="reminder">تذكير</SelectItem>
                                                        <SelectItem value="final_notice">إشعار نهائي</SelectItem>
                                                        <SelectItem value="thank_you">شكر</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm">الموضوع</Label>
                                                <Input
                                                    value={emailSubject}
                                                    onChange={(e) => setEmailSubject(e.target.value)}
                                                    placeholder="فاتورة رقم {invoice_number} من {company_name}"
                                                    className="rounded-xl"
                                                />
                                                <p className="text-xs text-slate-600">
                                                    يمكنك استخدام: {'{invoice_number}'}, {'{client_name}'}, {'{amount}'}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <Label>إرسال تلقائي بعد الموافقة</Label>
                                                <Switch
                                                    checked={autoSendOnApproval}
                                                    onCheckedChange={setAutoSendOnApproval}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>

                            {/* SEND OPTION */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="sendAfterCreate"
                                    checked={sendAfterCreate}
                                    onChange={(e) => setSendAfterCreate(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                                />
                                <label htmlFor="sendAfterCreate" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                    <Send className="w-4 h-4" aria-hidden="true" />
                                    إرسال الفاتورة للعميل بعد الإنشاء
                                </label>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <Link to="/dashboard/finance/invoices">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 rounded-xl">
                                            <X className="ms-2 h-4 w-4" aria-hidden="true" />
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button type="button" variant="outline" className="rounded-xl">
                                        <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                        حفظ كمسودة
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="rounded-xl">
                                        <Eye className="ms-2 h-4 w-4" aria-hidden="true" />
                                        معاينة PDF
                                    </Button>

                                    {requiresApproval ? (
                                        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                            {createInvoiceMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                    جاري الإرسال...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Send className="w-4 h-4" aria-hidden="true" />
                                                    إرسال للموافقة
                                                </span>
                                            )}
                                        </Button>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 min-w-[140px]"
                                                    disabled={createInvoiceMutation.isPending || sendInvoiceMutation.isPending}
                                                >
                                                    {createInvoiceMutation.isPending || sendInvoiceMutation.isPending ? (
                                                        <span className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                            جاري الحفظ...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            حفظ و إرسال
                                                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={(e) => { setSendAfterCreate(true); handleSubmit(e as any) }}>
                                                    <Mail className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    حفظ و إرسال بالبريد
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    حفظ و تحميل PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Printer className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    حفظ و طباعة
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => { setSendAfterCreate(false); handleSubmit(e as any) }}>
                                                    <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                                    حفظ فقط
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="invoices" />
                </div>
            </Main>
        </>
    )
}
