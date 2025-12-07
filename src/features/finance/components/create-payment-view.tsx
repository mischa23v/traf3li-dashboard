import { useState, useMemo } from 'react'
import {
    Save, Calendar, User, FileText, Plus, Trash2, Loader2, ChevronDown, Hash,
    Building2, Users, Receipt, MoreVertical, AlertCircle, Send, Download,
    Wallet, CreditCard, Landmark, Clock, Banknote, RefreshCw, CheckCircle,
    X, Mail, Eye, Printer, Paperclip, Check, Building, ArrowLeftRight,
    BadgePercent, Calculator, FileCheck, Link as LinkIcon, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreatePayment, useInvoices } from '@/hooks/useFinance'
import { useClients, useLawyers } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'

// Types
type PaymentType = 'customer_payment' | 'vendor_payment' | 'refund' | 'transfer' | 'advance' | 'retainer'
type PaymentMethod = 'cash' | 'bank_transfer' | 'sarie' | 'check' | 'credit_card' | 'mada' | 'tabby' | 'tamara' | 'stc_pay' | 'apple_pay'
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'reconciled'
type CheckStatus = 'received' | 'deposited' | 'cleared' | 'bounced' | 'cancelled'

interface InvoiceApplication {
    invoiceId: string
    invoiceNumber: string
    clientName: string
    totalAmount: number
    balanceDue: number
    applyAmount: number
    selected: boolean
}

// Generate payment number
const generatePaymentNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `PAY-${year}${month}-${random}`
}

// Payment type config
const paymentTypeConfig: Record<PaymentType, { label: string; icon: React.ElementType; color: string }> = {
    customer_payment: { label: 'دفعة من عميل', icon: User, color: 'text-green-500' },
    vendor_payment: { label: 'دفعة لمورد', icon: Building2, color: 'text-red-500' },
    refund: { label: 'استرداد', icon: RefreshCw, color: 'text-amber-500' },
    transfer: { label: 'تحويل داخلي', icon: ArrowLeftRight, color: 'text-blue-500' },
    advance: { label: 'دفعة مقدمة', icon: Wallet, color: 'text-purple-500' },
    retainer: { label: 'عربون', icon: Receipt, color: 'text-indigo-500' },
}

// Payment method config
const paymentMethodConfig: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
    cash: { label: 'نقداً', icon: Banknote },
    bank_transfer: { label: 'تحويل بنكي', icon: Landmark },
    sarie: { label: 'سريع', icon: Landmark },
    check: { label: 'شيك', icon: FileText },
    credit_card: { label: 'بطاقة ائتمان', icon: CreditCard },
    mada: { label: 'مدى', icon: CreditCard },
    tabby: { label: 'تابي', icon: CreditCard },
    tamara: { label: 'تمارا', icon: CreditCard },
    stc_pay: { label: 'STC Pay', icon: Wallet },
    apple_pay: { label: 'Apple Pay', icon: Wallet },
}

export function CreatePaymentView() {
    const navigate = useNavigate()
    const createPaymentMutation = useCreatePayment()

    // Load data from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: invoicesData, isLoading: loadingInvoices } = useInvoices()
    const { data: lawyersData, isLoading: loadingLawyers } = useLawyers()

    // Payment Type Selection
    const [paymentType, setPaymentType] = useState<PaymentType>('customer_payment')

    // Basic fields
    const [paymentNumber, setPaymentNumber] = useState(generatePaymentNumber())
    const [status] = useState<PaymentStatus>('pending')
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
    const [referenceNumber, setReferenceNumber] = useState('')
    const [memo, setMemo] = useState('')

    // Amount & Currency
    const [amount, setAmount] = useState<number>(0)
    const [currency, setCurrency] = useState('SAR')
    const [exchangeRate, setExchangeRate] = useState(1)
    const [amountInBaseCurrency, setAmountInBaseCurrency] = useState(0)

    // Customer/Vendor Selection
    const [customerId, setCustomerId] = useState('')
    const [vendorId, setVendorId] = useState('')

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
    const [bankAccountId, setBankAccountId] = useState('')

    // Check Details (when method = check)
    const [checkNumber, setCheckNumber] = useState('')
    const [checkDate, setCheckDate] = useState('')
    const [checkBank, setCheckBank] = useState('')
    const [checkBranch, setCheckBranch] = useState('')
    const [checkStatus, setCheckStatus] = useState<CheckStatus>('received')
    const [checkDepositDate, setCheckDepositDate] = useState('')

    // Card Details (when method = card)
    const [cardLastFour, setCardLastFour] = useState('')
    const [cardType, setCardType] = useState('')
    const [cardAuthCode, setCardAuthCode] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [terminalId, setTerminalId] = useState('')

    // Invoice Application
    const [applyToInvoices, setApplyToInvoices] = useState<InvoiceApplication[]>([])
    const [showUnpaidOnly, setShowUnpaidOnly] = useState(true)

    // Advanced - Fees
    const [bankFees, setBankFees] = useState(0)
    const [processingFees, setProcessingFees] = useState(0)
    const [otherFees, setOtherFees] = useState(0)
    const [feesPaidBy, setFeesPaidBy] = useState<'office' | 'client'>('office')

    // Advanced - Overpayment/Underpayment
    const [overpaymentAction, setOverpaymentAction] = useState<'credit' | 'refund' | 'hold'>('credit')
    const [underpaymentAction, setUnderpaymentAction] = useState<'write_off' | 'leave_open' | 'credit'>('leave_open')
    const [writeOffReason, setWriteOffReason] = useState('')

    // Advanced - Refund Details (when type = refund)
    const [originalPaymentId, setOriginalPaymentId] = useState('')
    const [refundReason, setRefundReason] = useState('')
    const [refundMethod, setRefundMethod] = useState<'original' | 'cash' | 'bank_transfer'>('original')

    // Advanced - Reconciliation
    const [isReconciled, setIsReconciled] = useState(false)
    const [reconciledDate, setReconciledDate] = useState('')
    const [reconciledBy, setReconciledBy] = useState('')
    const [bankStatementRef, setBankStatementRef] = useState('')

    // Advanced - Organization
    const [departmentId, setDepartmentId] = useState('')
    const [locationId, setLocationId] = useState('')
    const [receivedBy, setReceivedBy] = useState('')

    // Advanced - Attachments
    const [attachments, setAttachments] = useState<File[]>([])

    // Advanced - Notes
    const [customerNotes, setCustomerNotes] = useState('')
    const [internalNotes, setInternalNotes] = useState('')

    // Email
    const [sendReceipt, setSendReceipt] = useState(false)
    const [emailTemplate, setEmailTemplate] = useState('receipt')

    // Lawyers list
    const lawyers = useMemo(() => {
        if (!lawyersData) return []
        return Array.isArray(lawyersData) ? lawyersData : (lawyersData as any)?.data || []
    }, [lawyersData])

    // Update base currency amount when amount or exchange rate changes
    useMemo(() => {
        setAmountInBaseCurrency(amount * exchangeRate)
    }, [amount, exchangeRate])

    // Initialize invoices for application when client changes
    useMemo(() => {
        if (customerId && invoicesData?.data) {
            const clientInvoices = invoicesData.data
                .filter((inv: any) => inv.clientId === customerId && (showUnpaidOnly ? inv.status !== 'paid' : true))
                .map((inv: any) => ({
                    invoiceId: inv._id,
                    invoiceNumber: inv.invoiceNumber,
                    clientName: inv.clientName || 'عميل',
                    totalAmount: inv.totalAmount || 0,
                    balanceDue: inv.balanceDue || inv.totalAmount || 0,
                    applyAmount: 0,
                    selected: false,
                }))
            setApplyToInvoices(clientInvoices)
        }
    }, [customerId, invoicesData, showUnpaidOnly])

    // Calculate totals
    const calculations = useMemo(() => {
        const totalApplied = applyToInvoices.reduce((sum, inv) => sum + (inv.selected ? inv.applyAmount : 0), 0)
        const totalFees = bankFees + processingFees + otherFees
        const netAmount = amount - (feesPaidBy === 'office' ? totalFees : 0)
        const unapplied = amount - totalApplied

        return {
            totalApplied,
            totalFees,
            netAmount,
            unapplied,
            isOverpayment: unapplied > 0 && totalApplied > 0,
            isUnderpayment: unapplied < 0,
        }
    }, [applyToInvoices, amount, bankFees, processingFees, otherFees, feesPaidBy])

    // Toggle invoice selection
    const toggleInvoiceSelection = (invoiceId: string) => {
        setApplyToInvoices(prev => prev.map(inv => {
            if (inv.invoiceId === invoiceId) {
                return {
                    ...inv,
                    selected: !inv.selected,
                    applyAmount: !inv.selected ? Math.min(inv.balanceDue, amount - calculations.totalApplied + (inv.selected ? inv.applyAmount : 0)) : 0,
                }
            }
            return inv
        }))
    }

    // Update apply amount for an invoice
    const updateApplyAmount = (invoiceId: string, newAmount: number) => {
        setApplyToInvoices(prev => prev.map(inv => {
            if (inv.invoiceId === invoiceId) {
                return { ...inv, applyAmount: Math.min(newAmount, inv.balanceDue) }
            }
            return inv
        }))
    }

    // Auto-apply to oldest invoices
    const autoApplyToInvoices = () => {
        let remaining = amount
        setApplyToInvoices(prev => prev.map(inv => {
            if (remaining <= 0) {
                return { ...inv, selected: false, applyAmount: 0 }
            }
            const applyAmount = Math.min(inv.balanceDue, remaining)
            remaining -= applyAmount
            return { ...inv, selected: true, applyAmount }
        }))
    }

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const paymentData = {
            paymentNumber,
            paymentType,
            paymentDate,
            referenceNumber,
            amount,
            currency,
            exchangeRate,
            amountInBaseCurrency,
            paymentMethod,
            bankAccountId,
            // Customer/Vendor
            ...(paymentType === 'customer_payment' && { customerId }),
            ...(paymentType === 'vendor_payment' && { vendorId }),
            // Check details
            ...(paymentMethod === 'check' && {
                checkDetails: {
                    checkNumber,
                    checkDate,
                    checkBank,
                    checkBranch,
                    checkStatus,
                    checkDepositDate,
                },
            }),
            // Card details
            ...((paymentMethod === 'credit_card' || paymentMethod === 'mada') && {
                cardDetails: {
                    lastFour: cardLastFour,
                    cardType,
                    authCode: cardAuthCode,
                    transactionId,
                    terminalId,
                },
            }),
            // Invoice applications
            invoiceApplications: applyToInvoices
                .filter(inv => inv.selected && inv.applyAmount > 0)
                .map(inv => ({
                    invoiceId: inv.invoiceId,
                    amount: inv.applyAmount,
                })),
            // Fees
            fees: {
                bankFees,
                processingFees,
                otherFees,
                totalFees: calculations.totalFees,
                paidBy: feesPaidBy,
            },
            // Overpayment/Underpayment handling
            ...(calculations.isOverpayment && { overpaymentAction }),
            ...(calculations.isUnderpayment && {
                underpaymentAction,
                ...(underpaymentAction === 'write_off' && { writeOffReason }),
            }),
            // Refund details
            ...(paymentType === 'refund' && {
                refundDetails: {
                    originalPaymentId,
                    reason: refundReason,
                    method: refundMethod,
                },
            }),
            // Reconciliation
            ...(isReconciled && {
                reconciliation: {
                    isReconciled,
                    reconciledDate,
                    reconciledBy,
                    bankStatementRef,
                },
            }),
            // Organization
            departmentId,
            locationId,
            receivedBy,
            // Notes
            customerNotes,
            internalNotes,
            memo,
            // Metadata
            status: 'completed',
        }

        createPaymentMutation.mutate(paymentData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/payments' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
    ]

    // Format currency
    const formatCurrency = (value: number, curr: string = 'SAR') => {
        return value.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + (curr === 'SAR' ? ' ر.س' : ` ${curr}`)
    }

    // Status badge
    const getStatusBadge = (s: PaymentStatus) => {
        const variants: Record<PaymentStatus, { label: string; className: string }> = {
            pending: { label: 'معلق', className: 'bg-amber-100 text-amber-700' },
            completed: { label: 'مكتمل', className: 'bg-green-100 text-green-700' },
            failed: { label: 'فشل', className: 'bg-red-100 text-red-700' },
            cancelled: { label: 'ملغي', className: 'bg-gray-100 text-gray-700' },
            refunded: { label: 'مسترد', className: 'bg-purple-100 text-purple-700' },
            reconciled: { label: 'مطابق', className: 'bg-blue-100 text-blue-700' },
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
                <ProductivityHero badge="المدفوعات" title="تسجيل دفعة جديدة" type="payments" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* PAYMENT TYPE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Receipt className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        نوع الدفعة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(paymentTypeConfig).map(([key, config]) => {
                                            const Icon = config.icon
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setPaymentType(key as PaymentType)}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all text-center",
                                                        paymentType === key
                                                            ? "border-emerald-500 bg-emerald-50"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Icon className={cn("w-6 h-6 mx-auto mb-2", config.color)} />
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        paymentType === key ? "text-emerald-700" : "text-slate-600"
                                                    )}>
                                                        {config.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* HEADER & BASIC INFO */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold text-slate-800">
                                                {paymentTypeConfig[paymentType].label}
                                            </CardTitle>
                                            <Badge className={cn("rounded-full", statusInfo.className)}>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="text-left space-y-1">
                                            <Label className="text-xs text-slate-500">رقم الدفعة</Label>
                                            <Input
                                                value={paymentNumber}
                                                onChange={(e) => setPaymentNumber(e.target.value)}
                                                className="w-48 rounded-xl border-slate-200 text-left font-mono"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Amount & Currency */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-emerald-500" />
                                                المبلغ <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                                className="rounded-xl border-slate-200 text-xl font-bold"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">العملة</Label>
                                            <Select value={currency} onValueChange={setCurrency}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                    <SelectItem value="GBP">جنيه استرليني (GBP)</SelectItem>
                                                    <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {currency !== 'SAR' && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">سعر الصرف</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.0001"
                                                    value={exchangeRate}
                                                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                                                    className="rounded-xl border-slate-200"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    = {formatCurrency(amountInBaseCurrency, 'SAR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Date & Reference */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الدفع <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="date"
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="rounded-xl border-slate-200"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                رقم المرجع
                                            </Label>
                                            <Input
                                                value={referenceNumber}
                                                onChange={(e) => setReferenceNumber(e.target.value)}
                                                placeholder="رقم الحوالة / الإيصال..."
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Customer/Vendor Selection */}
                                    {paymentType === 'customer_payment' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                العميل <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={customerId} onValueChange={setCustomerId} disabled={loadingClients}>
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
                                    )}

                                    {paymentType === 'vendor_payment' && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                المورد <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={vendorId} onValueChange={setVendorId}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر المورد" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="vendor1">مورد 1</SelectItem>
                                                    <SelectItem value="vendor2">مورد 2</SelectItem>
                                                    <SelectItem value="vendor3">مورد 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* PAYMENT METHOD */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        طريقة الدفع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Method Selection */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {Object.entries(paymentMethodConfig).map(([key, config]) => {
                                            const Icon = config.icon
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(key as PaymentMethod)}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 transition-all text-center",
                                                        paymentMethod === key
                                                            ? "border-emerald-500 bg-emerald-50"
                                                            : "border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 mx-auto mb-1",
                                                        paymentMethod === key ? "text-emerald-600" : "text-slate-600"
                                                    )} />
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        paymentMethod === key ? "text-emerald-700" : "text-slate-600"
                                                    )}>
                                                        {config.label}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Bank Account (for bank transfer, check, card) */}
                                    {['bank_transfer', 'sarie', 'check', 'credit_card', 'mada'].includes(paymentMethod) && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Landmark className="w-4 h-4 text-emerald-500" />
                                                الحساب البنكي <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={bankAccountId} onValueChange={setBankAccountId}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الحساب البنكي" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bank1">البنك الأهلي - جاري - ****1234</SelectItem>
                                                    <SelectItem value="bank2">مصرف الراجحي - جاري - ****5678</SelectItem>
                                                    <SelectItem value="bank3">بنك الرياض - جاري - ****9012</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CHECK DETAILS (when method = check) */}
                            {paymentMethod === 'check' && (
                                <Card className="rounded-3xl shadow-sm border-amber-200 bg-amber-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-amber-500" aria-hidden="true" />
                                            تفاصيل الشيك
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    رقم الشيك <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    value={checkNumber}
                                                    onChange={(e) => setCheckNumber(e.target.value)}
                                                    placeholder="123456"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    تاريخ الشيك <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={checkDate}
                                                    onChange={(e) => setCheckDate(e.target.value)}
                                                    className="rounded-xl border-slate-200"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">حالة الشيك</Label>
                                                <Select value={checkStatus} onValueChange={(v) => setCheckStatus(v as CheckStatus)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="received">مستلم</SelectItem>
                                                        <SelectItem value="deposited">مودع</SelectItem>
                                                        <SelectItem value="cleared">تم تحصيله</SelectItem>
                                                        <SelectItem value="bounced">مرتجع</SelectItem>
                                                        <SelectItem value="cancelled">ملغي</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    البنك الساحب <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={checkBank} onValueChange={setCheckBank}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر البنك" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ncb">البنك الأهلي</SelectItem>
                                                        <SelectItem value="rajhi">مصرف الراجحي</SelectItem>
                                                        <SelectItem value="riyadh">بنك الرياض</SelectItem>
                                                        <SelectItem value="samba">سامبا</SelectItem>
                                                        <SelectItem value="albilad">بنك البلاد</SelectItem>
                                                        <SelectItem value="alinma">مصرف الإنماء</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">الفرع</Label>
                                                <Input
                                                    value={checkBranch}
                                                    onChange={(e) => setCheckBranch(e.target.value)}
                                                    placeholder="اسم الفرع"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">تاريخ الإيداع</Label>
                                                <Input
                                                    type="date"
                                                    value={checkDepositDate}
                                                    onChange={(e) => setCheckDepositDate(e.target.value)}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                        </div>

                                        {checkStatus === 'bounced' && (
                                            <Alert className="rounded-xl bg-red-50 border-red-200">
                                                <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                                                <AlertDescription className="text-red-700">
                                                    هذا الشيك مرتجع. يرجى متابعة العميل لتسوية المبلغ.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* CARD DETAILS (when method = card) */}
                            {['credit_card', 'mada'].includes(paymentMethod) && (
                                <Card className="rounded-3xl shadow-sm border-blue-200 bg-blue-50/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                            تفاصيل البطاقة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    آخر 4 أرقام <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    value={cardLastFour}
                                                    onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                    placeholder="1234"
                                                    maxLength={4}
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">نوع البطاقة</Label>
                                                <Select value={cardType} onValueChange={setCardType}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر النوع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="visa">Visa</SelectItem>
                                                        <SelectItem value="mastercard">Mastercard</SelectItem>
                                                        <SelectItem value="amex">American Express</SelectItem>
                                                        <SelectItem value="mada">مدى</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رمز التفويض</Label>
                                                <Input
                                                    value={cardAuthCode}
                                                    onChange={(e) => setCardAuthCode(e.target.value)}
                                                    placeholder="AUTH123"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رقم المعاملة</Label>
                                                <Input
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    placeholder="TXN123456789"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رقم نقطة البيع</Label>
                                                <Input
                                                    value={terminalId}
                                                    onChange={(e) => setTerminalId(e.target.value)}
                                                    placeholder="POS001"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* APPLY TO INVOICES (for customer payments) */}
                            {paymentType === 'customer_payment' && customerId && (
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <FileCheck className="w-5 h-5 text-emerald-500" />
                                                تطبيق على الفواتير
                                            </CardTitle>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={showUnpaidOnly}
                                                        onCheckedChange={setShowUnpaidOnly}
                                                        id="unpaid-only"
                                                    />
                                                    <Label htmlFor="unpaid-only" className="text-sm text-slate-600">
                                                        غير المسددة فقط
                                                    </Label>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={autoApplyToInvoices}
                                                    className="rounded-xl"
                                                >
                                                    <Calculator className="w-4 h-4 ms-2" />
                                                    تطبيق تلقائي
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {loadingInvoices ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" aria-hidden="true" />
                                                جاري تحميل الفواتير...
                                            </div>
                                        ) : applyToInvoices.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" aria-hidden="true" />
                                                <p>لا توجد فواتير لهذا العميل</p>
                                            </div>
                                        ) : (
                                            <div className="border rounded-xl overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50">
                                                            <TableHead className="w-12 text-right"></TableHead>
                                                            <TableHead className="text-right">رقم الفاتورة</TableHead>
                                                            <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                                                            <TableHead className="text-right">المتبقي</TableHead>
                                                            <TableHead className="text-right">المبلغ المطبق</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {applyToInvoices.map((inv) => (
                                                            <TableRow key={inv.invoiceId} className={inv.selected ? 'bg-emerald-50' : ''}>
                                                                <TableCell>
                                                                    <Checkbox
                                                                        checked={inv.selected}
                                                                        onCheckedChange={() => toggleInvoiceSelection(inv.invoiceId)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                                                                <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                                                                <TableCell className="text-amber-600 font-medium">
                                                                    {formatCurrency(inv.balanceDue)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max={inv.balanceDue}
                                                                        step="0.01"
                                                                        value={inv.applyAmount}
                                                                        onChange={(e) => updateApplyAmount(inv.invoiceId, parseFloat(e.target.value) || 0)}
                                                                        disabled={!inv.selected}
                                                                        className="w-32 rounded-lg text-sm"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {/* Application Summary */}
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">إجمالي الدفعة:</span>
                                                <span className="font-medium">{formatCurrency(amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">المبلغ المطبق:</span>
                                                <span className="font-medium text-emerald-600">{formatCurrency(calculations.totalApplied)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className={calculations.unapplied > 0 ? 'text-amber-600' : 'text-slate-800'}>
                                                    {calculations.unapplied > 0 ? 'غير مطبق:' : 'المتبقي:'}
                                                </span>
                                                <span className={calculations.unapplied > 0 ? 'text-amber-600' : 'text-slate-800'}>
                                                    {formatCurrency(calculations.unapplied)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Overpayment Alert */}
                                        {calculations.isOverpayment && (
                                            <Alert className="mt-4 rounded-xl bg-amber-50 border-amber-200">
                                                <Info className="h-4 w-4 text-amber-600" aria-hidden="true" />
                                                <AlertDescription className="text-amber-700">
                                                    يوجد مبلغ غير مطبق ({formatCurrency(calculations.unapplied)}). اختر كيفية التعامل معه:
                                                </AlertDescription>
                                                <div className="mt-3 flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={overpaymentAction === 'credit' ? 'default' : 'outline'}
                                                        onClick={() => setOverpaymentAction('credit')}
                                                        className="rounded-lg"
                                                    >
                                                        حفظ كرصيد
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={overpaymentAction === 'refund' ? 'default' : 'outline'}
                                                        onClick={() => setOverpaymentAction('refund')}
                                                        className="rounded-lg"
                                                    >
                                                        استرداد
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={overpaymentAction === 'hold' ? 'default' : 'outline'}
                                                        onClick={() => setOverpaymentAction('hold')}
                                                        className="rounded-lg"
                                                    >
                                                        تعليق
                                                    </Button>
                                                </div>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* MEMO/NOTES */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardContent className="p-6">
                                    <Tabs defaultValue="customer" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
                                            <TabsTrigger value="customer" className="rounded-lg">ملاحظات الإيصال</TabsTrigger>
                                            <TabsTrigger value="internal" className="rounded-lg">ملاحظات داخلية</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="customer" className="mt-4">
                                            <Textarea
                                                placeholder="ملاحظات تظهر في الإيصال..."
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
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTION */}
                            <Accordion type="multiple" className="space-y-4">

                                {/* Fees */}
                                <AccordionItem value="fees" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <BadgePercent className="h-5 w-5 text-red-500" />
                                            <span className="font-bold text-slate-800">الرسوم والعمولات</span>
                                            {calculations.totalFees > 0 && (
                                                <Badge className="rounded-full bg-red-100 text-red-700">
                                                    {formatCurrency(calculations.totalFees)}
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رسوم بنكية</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={bankFees}
                                                    onChange={(e) => setBankFees(parseFloat(e.target.value) || 0)}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رسوم المعالجة</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={processingFees}
                                                    onChange={(e) => setProcessingFees(parseFloat(e.target.value) || 0)}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رسوم أخرى</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={otherFees}
                                                    onChange={(e) => setOtherFees(parseFloat(e.target.value) || 0)}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">من يتحمل الرسوم؟</Label>
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant={feesPaidBy === 'office' ? 'default' : 'outline'}
                                                    onClick={() => setFeesPaidBy('office')}
                                                    className="rounded-xl"
                                                >
                                                    المكتب
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={feesPaidBy === 'client' ? 'default' : 'outline'}
                                                    onClick={() => setFeesPaidBy('client')}
                                                    className="rounded-xl"
                                                >
                                                    العميل
                                                </Button>
                                            </div>
                                        </div>

                                        {calculations.totalFees > 0 && (
                                            <div className="mt-4 p-4 bg-red-50 rounded-xl">
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span className="text-red-600">إجمالي الرسوم:</span>
                                                    <span className="text-red-600">{formatCurrency(calculations.totalFees)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-slate-600">صافي المبلغ:</span>
                                                    <span className="font-medium">{formatCurrency(calculations.netAmount)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Refund Details (when type = refund) */}
                                {paymentType === 'refund' && (
                                    <AccordionItem value="refund" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="h-5 w-5 text-amber-500" aria-hidden="true" />
                                                <span className="font-bold text-slate-800">تفاصيل الاسترداد</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        الدفعة الأصلية <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select value={originalPaymentId} onValueChange={setOriginalPaymentId}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر الدفعة الأصلية" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pay1">PAY-202412-0001 - 5,000 ر.س</SelectItem>
                                                            <SelectItem value="pay2">PAY-202412-0002 - 10,000 ر.س</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        سبب الاسترداد <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select value={refundReason} onValueChange={setRefundReason}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر السبب" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="duplicate">دفعة مكررة</SelectItem>
                                                            <SelectItem value="overpayment">دفعة زائدة</SelectItem>
                                                            <SelectItem value="service_cancelled">إلغاء الخدمة</SelectItem>
                                                            <SelectItem value="client_request">طلب العميل</SelectItem>
                                                            <SelectItem value="error">خطأ في الدفعة</SelectItem>
                                                            <SelectItem value="other">أخرى</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">طريقة الاسترداد</Label>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            type="button"
                                                            variant={refundMethod === 'original' ? 'default' : 'outline'}
                                                            onClick={() => setRefundMethod('original')}
                                                            className="rounded-xl"
                                                        >
                                                            نفس الطريقة الأصلية
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={refundMethod === 'bank_transfer' ? 'default' : 'outline'}
                                                            onClick={() => setRefundMethod('bank_transfer')}
                                                            className="rounded-xl"
                                                        >
                                                            تحويل بنكي
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant={refundMethod === 'cash' ? 'default' : 'outline'}
                                                            onClick={() => setRefundMethod('cash')}
                                                            className="rounded-xl"
                                                        >
                                                            نقداً
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Reconciliation */}
                                <AccordionItem value="reconciliation" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">المطابقة البنكية</span>
                                            {isReconciled && (
                                                <Badge className="rounded-full bg-blue-100 text-blue-700">مطابق</Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <Label>تم المطابقة مع كشف الحساب</Label>
                                                <Switch
                                                    checked={isReconciled}
                                                    onCheckedChange={setIsReconciled}
                                                />
                                            </div>

                                            {isReconciled && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">تاريخ المطابقة</Label>
                                                        <Input
                                                            type="date"
                                                            value={reconciledDate}
                                                            onChange={(e) => setReconciledDate(e.target.value)}
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">تمت بواسطة</Label>
                                                        <Select value={reconciledBy} onValueChange={setReconciledBy}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر الموظف" />
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
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">مرجع كشف الحساب</Label>
                                                        <Input
                                                            value={bankStatementRef}
                                                            onChange={(e) => setBankStatementRef(e.target.value)}
                                                            placeholder="رقم السطر في كشف الحساب"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Organization */}
                                <AccordionItem value="organization" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-5 w-5 text-purple-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">تفاصيل تنظيمية</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
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
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">مستلم الدفعة</Label>
                                                <Select value={receivedBy} onValueChange={setReceivedBy} disabled={loadingLawyers}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر الموظف" />
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
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Attachments */}
                                <AccordionItem value="attachments" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="h-5 w-5 text-gray-500" />
                                            <span className="font-bold text-slate-800">المرفقات</span>
                                            {attachments.length > 0 && (
                                                <Badge className="rounded-full bg-gray-100 text-gray-700">
                                                    {attachments.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
                                                <Paperclip className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                                                <p className="text-sm text-slate-600 mb-1">اسحب الملفات هنا أو اضغط للاختيار</p>
                                                <p className="text-xs text-slate-600">PDF, JPG, PNG (حد أقصى 10 ميغابايت)</p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setAttachments([...attachments, ...Array.from(e.target.files)])
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </div>

                                            {attachments.length > 0 && (
                                                <div className="space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                                <span className="text-sm font-medium">{file.name}</span>
                                                                <span className="text-xs text-slate-600">
                                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Email Settings */}
                                <AccordionItem value="email" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">إعدادات الإيصال الإلكتروني</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div>
                                                    <Label>إرسال إيصال للعميل</Label>
                                                    <p className="text-xs text-slate-500">سيتم إرسال الإيصال عبر البريد الإلكتروني</p>
                                                </div>
                                                <Switch
                                                    checked={sendReceipt}
                                                    onCheckedChange={setSendReceipt}
                                                />
                                            </div>

                                            {sendReceipt && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">قالب الإيصال</Label>
                                                    <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="receipt">إيصال قياسي</SelectItem>
                                                            <SelectItem value="thank_you">إيصال مع شكر</SelectItem>
                                                            <SelectItem value="detailed">إيصال تفصيلي</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>

                            {/* SEND OPTION */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="sendReceipt"
                                    checked={sendReceipt}
                                    onChange={(e) => setSendReceipt(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                                />
                                <label htmlFor="sendReceipt" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                    <Mail className="w-4 h-4" aria-hidden="true" />
                                    إرسال إيصال للعميل بعد الحفظ
                                </label>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <div className="flex gap-2">
                                    <Link to="/dashboard/finance/payments">
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
                                        معاينة الإيصال
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 min-w-[140px]"
                                                disabled={createPaymentMutation.isPending}
                                            >
                                                {createPaymentMutation.isPending ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                        جاري الحفظ...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        حفظ الدفعة
                                                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={(e) => { setSendReceipt(true); handleSubmit(e as any) }}>
                                                <Mail className="ms-2 h-4 w-4" aria-hidden="true" />
                                                حفظ و إرسال الإيصال
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
                                            <DropdownMenuItem onClick={(e) => { setSendReceipt(false); handleSubmit(e as any) }}>
                                                <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                                حفظ فقط
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <FinanceSidebar context="payments" />
                </div>
            </Main>
        </>
    )
}
