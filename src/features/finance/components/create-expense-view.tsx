import { useState, useMemo } from 'react'
import {
    Save, Calendar, Tag, FileText, DollarSign, CreditCard, Upload, Briefcase, Building, Loader2,
    User, Receipt, Wallet, Building2, Plane, Hotel, Utensils, Car, Fuel, ParkingCircle,
    Scale, Gavel, Package, Laptop, HardDrive, Calculator, Paperclip, Download, Trash,
    Shield, Info, UserCheck, Clock, CheckCircle, XCircle, X, Send,
    GraduationCap, Presentation, Users, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateExpense } from '@/hooks/useFinance'
import { useCases, useClients } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'

// Expense categories matching the interface with icons
const expenseCategories = [
    // Office expenses
    { value: 'office_supplies', label: 'مستلزمات مكتبية', labelEn: 'Office Supplies', icon: Package, group: 'office' },
    { value: 'software', label: 'برمجيات واشتراكات', labelEn: 'Software & Subscriptions', icon: Laptop, group: 'office' },
    { value: 'hardware', label: 'معدات وأجهزة', labelEn: 'Equipment & Hardware', icon: HardDrive, group: 'office' },
    // Travel
    { value: 'travel', label: 'سفر', labelEn: 'Travel', icon: Plane, group: 'travel' },
    { value: 'accommodation', label: 'إقامة', labelEn: 'Accommodation', icon: Hotel, group: 'travel' },
    { value: 'meals', label: 'وجبات وضيافة', labelEn: 'Meals & Entertainment', icon: Utensils, group: 'travel' },
    { value: 'transportation', label: 'مواصلات', labelEn: 'Transportation', icon: Car, group: 'travel' },
    { value: 'fuel', label: 'وقود', labelEn: 'Fuel', icon: Fuel, group: 'travel' },
    { value: 'parking', label: 'مواقف', labelEn: 'Parking', icon: ParkingCircle, group: 'travel' },
    // Legal & Government
    { value: 'court_fees', label: 'رسوم محاكم', labelEn: 'Court Fees', icon: Scale, group: 'legal' },
    { value: 'government_fees', label: 'رسوم حكومية', labelEn: 'Government Fees', icon: Building2, group: 'legal' },
    { value: 'legal_fees', label: 'أتعاب قانونية', labelEn: 'Legal Fees', icon: Gavel, group: 'legal' },
    // Professional Services
    { value: 'professional_services', label: 'خدمات مهنية', labelEn: 'Professional Services', icon: Briefcase, group: 'professional' },
    { value: 'accounting', label: 'خدمات محاسبية', labelEn: 'Accounting Services', icon: Calculator, group: 'professional' },
    { value: 'consulting', label: 'استشارات', labelEn: 'Consulting', icon: Users, group: 'professional' },
    // Operational
    { value: 'rent', label: 'إيجار', labelEn: 'Rent', icon: Building, group: 'operational' },
    { value: 'utilities', label: 'مرافق (كهرباء، ماء، إنترنت)', labelEn: 'Utilities', icon: Building2, group: 'operational' },
    { value: 'telecommunications', label: 'اتصالات', labelEn: 'Telecommunications', icon: Building2, group: 'operational' },
    { value: 'maintenance', label: 'صيانة وإصلاح', labelEn: 'Maintenance & Repair', icon: Building2, group: 'operational' },
    { value: 'cleaning', label: 'نظافة', labelEn: 'Cleaning', icon: Building2, group: 'operational' },
    { value: 'security', label: 'أمن', labelEn: 'Security', icon: Shield, group: 'operational' },
    // Marketing & HR
    { value: 'marketing', label: 'تسويق وإعلان', labelEn: 'Marketing & Advertising', icon: Presentation, group: 'marketing' },
    { value: 'training', label: 'تدريب وتطوير', labelEn: 'Training & Development', icon: GraduationCap, group: 'marketing' },
    { value: 'recruitment', label: 'توظيف', labelEn: 'Recruitment', icon: Users, group: 'marketing' },
    // Other
    { value: 'insurance', label: 'تأمين', labelEn: 'Insurance', icon: Shield, group: 'other' },
    { value: 'bank_charges', label: 'رسوم بنكية', labelEn: 'Bank Charges', icon: Building2, group: 'other' },
    { value: 'postage', label: 'بريد وشحن', labelEn: 'Postage & Shipping', icon: Package, group: 'other' },
    { value: 'printing', label: 'طباعة ونشر', labelEn: 'Printing & Publishing', icon: FileText, group: 'other' },
    { value: 'subscriptions', label: 'اشتراكات', labelEn: 'Subscriptions', icon: Receipt, group: 'other' },
    { value: 'entertainment', label: 'ترفيه وضيافة', labelEn: 'Entertainment', icon: Users, group: 'other' },
    { value: 'donations', label: 'تبرعات', labelEn: 'Donations', icon: Building2, group: 'other' },
    { value: 'other', label: 'أخرى', labelEn: 'Other', icon: FileText, group: 'other' },
]

// Payment methods
const paymentMethods = [
    { value: 'cash', label: 'نقداً', labelEn: 'Cash' },
    { value: 'company_card', label: 'بطاقة الشركة الائتمانية', labelEn: 'Company Credit Card' },
    { value: 'personal_card', label: 'بطاقة شخصية (قابلة للسداد)', labelEn: 'Personal Card (Reimbursable)' },
    { value: 'debit_card', label: 'بطاقة مدى', labelEn: 'Debit Card' },
    { value: 'bank_transfer', label: 'تحويل بنكي', labelEn: 'Bank Transfer' },
    { value: 'check', label: 'شيك', labelEn: 'Check' },
    { value: 'petty_cash', label: 'عهدة نقدية', labelEn: 'Petty Cash' },
    { value: 'direct_billing', label: 'فوترة مباشرة', labelEn: 'Direct Billing' },
]

// Trip purposes
const tripPurposes = [
    { value: 'client_meeting', label: 'اجتماع عميل', labelEn: 'Client Meeting', icon: Users },
    { value: 'court_appearance', label: 'حضور جلسة محكمة', labelEn: 'Court Appearance', icon: Gavel },
    { value: 'conference', label: 'مؤتمر', labelEn: 'Conference', icon: Presentation },
    { value: 'training', label: 'تدريب', labelEn: 'Training', icon: GraduationCap },
    { value: 'business_development', label: 'تطوير أعمال', labelEn: 'Business Development', icon: Briefcase },
    { value: 'site_visit', label: 'زيارة موقع', labelEn: 'Site Visit', icon: MapPin },
    { value: 'other', label: 'أخرى', labelEn: 'Other', icon: FileText },
]

// Government entities
const governmentEntities = [
    { value: 'moj', label: 'وزارة العدل', labelEn: 'Ministry of Justice' },
    { value: 'moci', label: 'وزارة التجارة', labelEn: 'Ministry of Commerce' },
    { value: 'mol', label: 'وزارة العمل', labelEn: 'Ministry of Labor' },
    { value: 'moi', label: 'وزارة الداخلية', labelEn: 'Ministry of Interior' },
    { value: 'mof', label: 'وزارة المالية', labelEn: 'Ministry of Finance' },
    { value: 'zatca', label: 'هيئة الزكاة والضريبة', labelEn: 'ZATCA' },
    { value: 'sama', label: 'البنك المركزي السعودي', labelEn: 'SAMA' },
    { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

// Format currency helper
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(amount) + ' ر.س'
}

export function CreateExpenseView() {
    const navigate = useNavigate()
    const createExpenseMutation = useCreateExpense()

    // Load cases and clients from API
    const { data: casesData, isLoading: loadingCases } = useCases()
    const { data: clientsData, isLoading: loadingClients } = useClients()

    // Form state with comprehensive fields
    const [formData, setFormData] = useState({
        // Basic Info
        description: '',
        amount: '',
        taxAmount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        vendor: '',
        receiptNumber: '',
        notes: '',
        // Expense Type
        expenseType: 'non_reimbursable' as 'reimbursable' | 'non_reimbursable',
        employeeId: '',
        // Billable
        billable: false,
        clientId: '',
        caseId: '',
        markup: '0',
        // Tax
        taxRate: '15',
        taxReclaimable: false,
        vendorTaxNumber: '',
        // Travel Details
        travelPurpose: '',
        departureLocation: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        attendees: [] as string[],
        mileage: '',
        mileageRate: '0.50',
        vehicle: '',
        vehicleRegistration: '',
        applyPerDiem: false,
        perDiemRate: '500',
        perDiemDays: '',
        actualMealCost: '',
        // Government Reference
        governmentReference: '',
        courtCaseNumber: '',
        governmentEntity: '',
        // Organization (Firm Mode)
        departmentId: '',
        locationId: '',
        projectId: '',
        costCenterId: '',
    })

    // Attachments state
    const [attachments, setAttachments] = useState<Array<{
        type: string
        filename: string
        url: string
        size: number
    }>>([])

    // Receipt image state
    const [receiptImage, setReceiptImage] = useState<string | null>(null)

    // Get selected client
    const selectedClient = useMemo(() => {
        if (!formData.clientId || !clientsData?.data) return null
        return clientsData.data.find((c: any) => c._id === formData.clientId)
    }, [formData.clientId, clientsData])

    // Get filtered cases based on selected client
    const filteredCases = useMemo(() => {
        if (!casesData?.data) return []
        if (!formData.clientId) return casesData.data
        return casesData.data.filter((c: any) => c.clientId === formData.clientId)
    }, [formData.clientId, casesData])

    // Calculate amounts
    const calculations = useMemo(() => {
        const amount = Number(formData.amount) || 0
        const taxAmount = Number(formData.taxAmount) || 0
        const totalAmount = amount + taxAmount
        const markup = Number(formData.markup) || 0
        const billableAmount = formData.billable ? totalAmount * (1 + markup / 100) : 0

        // Travel calculations
        const mileage = Number(formData.mileage) || 0
        const mileageRate = Number(formData.mileageRate) || 0
        const mileageAmount = mileage * mileageRate

        const perDiemRate = Number(formData.perDiemRate) || 0
        const perDiemDays = Number(formData.perDiemDays) || 0
        const perDiemAmount = formData.applyPerDiem ? perDiemRate * perDiemDays : 0

        // Calculate number of days between departure and return
        let numberOfDays = 0
        if (formData.departureDate && formData.returnDate) {
            const dep = new Date(formData.departureDate)
            const ret = new Date(formData.returnDate)
            numberOfDays = Math.ceil((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24)) + 1
        }

        return {
            amount,
            taxAmount,
            totalAmount,
            billableAmount,
            mileageAmount,
            perDiemAmount,
            numberOfDays,
        }
    }, [formData])

    // Handle form field updates
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle receipt upload
    const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setReceiptImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle attachment upload
    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newAttachments = Array.from(files).map(file => ({
                type: 'other',
                filename: file.name,
                url: URL.createObjectURL(file),
                size: file.size,
            }))
            setAttachments(prev => [...prev, ...newAttachments])
        }
    }

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    // Check if travel category
    const isTravelCategory = formData.category === 'travel'

    // Check if government/legal category
    const isGovernmentCategory = ['court_fees', 'government_fees', 'legal_fees'].includes(formData.category)

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const expenseData = {
            description: formData.description,
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            expenseType: formData.expenseType,
            isBillable: formData.billable,
            ...(formData.vendor && { vendor: formData.vendor }),
            ...(formData.caseId && formData.caseId !== 'none' && { caseId: formData.caseId }),
            ...(formData.clientId && formData.clientId !== 'none' && { clientId: formData.clientId }),
            ...(formData.taxAmount && { taxAmount: Number(formData.taxAmount) }),
            ...(formData.receiptNumber && { receiptNumber: formData.receiptNumber }),
            ...(formData.notes && { notes: formData.notes }),
            ...(formData.billable && formData.markup && {
                markupType: 'percentage',
                markupValue: Number(formData.markup)
            }),
        }

        createExpenseMutation.mutate(expenseData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/expenses' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: true },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

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
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="المصروفات" title="تسجيل مصروف جديد" type="expenses" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* ========== EXPENSE TYPE SELECTION ========== */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium text-slate-700">نوع المصروف</Label>
                                    <RadioGroup
                                        value={formData.expenseType}
                                        onValueChange={(value) => updateField('expenseType', value)}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        <div className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition-all ${formData.expenseType === 'reimbursable' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="reimbursable" id="reimbursable" />
                                            <Label htmlFor="reimbursable" className="cursor-pointer flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${formData.expenseType === 'reimbursable' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                        <Wallet className={`h-5 w-5 ${formData.expenseType === 'reimbursable' ? 'text-blue-600' : 'text-slate-500'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">مصروف شخصي (قابل للسداد)</div>
                                                        <div className="text-xs text-slate-500">دفعه الموظف وسيُسدد له</div>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>

                                        <div className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer transition-all ${formData.expenseType === 'non_reimbursable' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="non_reimbursable" id="non_reimbursable" />
                                            <Label htmlFor="non_reimbursable" className="cursor-pointer flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${formData.expenseType === 'non_reimbursable' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                                        <Building className={`h-5 w-5 ${formData.expenseType === 'non_reimbursable' ? 'text-emerald-600' : 'text-slate-500'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">مصروف الشركة</div>
                                                        <div className="text-xs text-slate-500">دفعته الشركة مباشرة</div>
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Employee Selection (if reimbursable) */}
                                {formData.expenseType === 'reimbursable' && (
                                    <div className="space-y-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                            الموظف
                                        </Label>
                                        <Select value={formData.employeeId} onValueChange={(value) => updateField('employeeId', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500 bg-white">
                                                <SelectValue placeholder="اختر الموظف..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="emp1">أحمد محمد</SelectItem>
                                                <SelectItem value="emp2">فاطمة علي</SelectItem>
                                                <SelectItem value="emp3">محمد خالد</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* ========== DATE & AMOUNT SECTION ========== */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                وصف المصروف
                                            </Label>
                                            <Textarea
                                                placeholder="اكتب وصفاً تفصيلياً للمصروف..."
                                                value={formData.description}
                                                onChange={(e) => updateField('description', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px]"
                                            />
                                            <p className="text-xs text-slate-500">{formData.description.length}/500 حرف (الحد الأدنى: 10 أحرف)</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ المصروف
                                            </Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => updateField('date', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                المبلغ (ر.س)
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => updateField('amount', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                الضريبة (ر.س)
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                value={formData.taxAmount}
                                                onChange={(e) => updateField('taxAmount', e.target.value)}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                            <p className="text-xs text-slate-500">ضريبة القيمة المضافة 15%</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calculator className="w-4 h-4 text-emerald-500" />
                                                الإجمالي
                                            </Label>
                                            <div className="h-10 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center">
                                                <span className="text-emerald-700 font-bold text-lg">
                                                    {formatCurrency(calculations.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========== CATEGORY SECTION ========== */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                            التصنيف
                                        </Label>
                                        <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر التصنيف" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>مصروفات مكتبية</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'office').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>السفر والنقل</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'travel').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>رسوم قانونية وحكومية</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'legal').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>خدمات مهنية</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'professional').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>تشغيلية</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'operational').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>تسويق وموارد بشرية</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'marketing').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>

                                                <SelectGroup>
                                                    <SelectLabel>أخرى</SelectLabel>
                                                    {expenseCategories.filter(c => c.group === 'other').map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            طريقة الدفع
                                        </Label>
                                        <Select value={formData.paymentMethod} onValueChange={(value) => updateField('paymentMethod', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر طريقة الدفع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method.value} value={method.value}>
                                                        {method.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* ========== MERCHANT/VENDOR SECTION ========== */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            المورد / الجهة
                                        </Label>
                                        <Input
                                            placeholder="ابحث عن مورد أو اكتب اسم جديد..."
                                            value={formData.vendor}
                                            onChange={(e) => updateField('vendor', e.target.value)}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            رقم الإيصال / الفاتورة
                                        </Label>
                                        <Input
                                            placeholder="رقم الإيصال من المورد"
                                            value={formData.receiptNumber}
                                            onChange={(e) => updateField('receiptNumber', e.target.value)}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* ========== RECEIPT UPLOAD ========== */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                        إرفاق الإيصال
                                    </Label>
                                    <div className="space-y-4">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={handleReceiptUpload}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 file:text-emerald-600 file:bg-emerald-50 file:border-0 file:rounded-lg file:me-4 file:px-4 file:py-2 hover:file:bg-emerald-100"
                                        />
                                        <p className="text-xs text-slate-500">اسحب وأفلت صورة الإيصال أو PDF</p>

                                        {receiptImage && (
                                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <img
                                                    src={receiptImage}
                                                    alt="Receipt"
                                                    className="w-24 h-24 object-cover rounded-lg border"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-emerald-600">تم الرفع بنجاح</p>
                                                    <p className="text-xs text-slate-500 mt-1">يمكنك إزالة الصورة وإضافة أخرى</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReceiptImage(null)}
                                                    className="text-slate-600 hover:text-red-500"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ========== BILLABLE SECTION ========== */}
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-100">
                                                <DollarSign className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <Label className="text-base font-semibold">قابل للفوترة (تحميله على العميل)</Label>
                                                <p className="text-sm text-slate-500">سيتم إضافة هذا المصروف لفاتورة العميل</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.billable}
                                            onCheckedChange={(checked) => updateField('billable', checked)}
                                        />
                                    </div>

                                    {formData.billable && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-amber-500" aria-hidden="true" />
                                                    العميل
                                                </Label>
                                                <Select
                                                    value={formData.clientId}
                                                    onValueChange={(value) => updateField('clientId', value)}
                                                    disabled={loadingClients}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-amber-500 bg-white">
                                                        <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل..."} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {clientsData?.data?.map((client: any) => (
                                                            <SelectItem key={client._id} value={client._id}>
                                                                {client.name || client.fullName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-amber-500" />
                                                    القضية (اختياري)
                                                </Label>
                                                <Select
                                                    value={formData.caseId}
                                                    onValueChange={(value) => updateField('caseId', value)}
                                                    disabled={!formData.clientId || loadingCases}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-amber-500 bg-white">
                                                        <SelectValue placeholder="اختر القضية..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredCases.map((caseItem: any) => (
                                                            <SelectItem key={caseItem._id} value={caseItem._id}>
                                                                {caseItem.caseNumber} - {caseItem.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">نسبة الترميز (%)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.markup}
                                                    onChange={(e) => updateField('markup', e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    className="rounded-xl border-slate-200 focus:border-amber-500 focus:ring-amber-500 bg-white"
                                                />
                                                <p className="text-xs text-slate-500">النسبة المضافة عند فوترة العميل</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">المبلغ القابل للفوترة</Label>
                                                <div className="h-10 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center">
                                                    <span className="text-amber-700 font-bold">
                                                        {formatCurrency(calculations.billableAmount)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {formatCurrency(calculations.totalAmount)} + {formData.markup}% = {formatCurrency(calculations.billableAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ========== NOTES ========== */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                        ملاحظات إضافية
                                    </Label>
                                    <Textarea
                                        placeholder="أدخل أي تفاصيل إضافية..."
                                        value={formData.notes}
                                        onChange={(e) => updateField('notes', e.target.value)}
                                        className="min-h-[80px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* ========== ADVANCED SECTIONS (Accordion) ========== */}
                                <Accordion type="multiple" className="space-y-4">

                                    {/* Travel Details (if travel category) */}
                                    {isTravelCategory && (
                                        <AccordionItem value="travel" className="border rounded-xl overflow-hidden">
                                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <Plane className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium">تفاصيل السفر</span>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">غرض الرحلة</Label>
                                                        <Select value={formData.travelPurpose} onValueChange={(value) => updateField('travelPurpose', value)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                                <SelectValue placeholder="اختر غرض الرحلة..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tripPurposes.map((purpose) => (
                                                                    <SelectItem key={purpose.value} value={purpose.value}>
                                                                        <div className="flex items-center gap-2">
                                                                            <purpose.icon className="h-4 w-4" />
                                                                            {purpose.label}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">من</Label>
                                                            <Input
                                                                value={formData.departureLocation}
                                                                onChange={(e) => updateField('departureLocation', e.target.value)}
                                                                placeholder="مثال: الرياض"
                                                                className="rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">إلى</Label>
                                                            <Input
                                                                value={formData.destination}
                                                                onChange={(e) => updateField('destination', e.target.value)}
                                                                placeholder="مثال: جدة"
                                                                className="rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">تاريخ المغادرة</Label>
                                                            <Input
                                                                type="date"
                                                                value={formData.departureDate}
                                                                onChange={(e) => updateField('departureDate', e.target.value)}
                                                                className="rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">تاريخ العودة</Label>
                                                            <Input
                                                                type="date"
                                                                value={formData.returnDate}
                                                                onChange={(e) => updateField('returnDate', e.target.value)}
                                                                className="rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">عدد الأيام</Label>
                                                            <Input
                                                                type="number"
                                                                value={calculations.numberOfDays}
                                                                disabled
                                                                className="rounded-xl border-slate-200 bg-slate-100"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Mileage Section */}
                                                    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                                        <Label className="text-base font-semibold">المسافة المقطوعة</Label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">المسافة (كم)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.mileage}
                                                                    onChange={(e) => updateField('mileage', e.target.value)}
                                                                    step="0.1"
                                                                    className="rounded-xl border-slate-200 bg-white"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">السعر لكل كم</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.mileageRate}
                                                                    disabled
                                                                    className="rounded-xl border-slate-200 bg-slate-100"
                                                                />
                                                                <p className="text-xs text-slate-500">من سياسة الشركة</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">نوع المركبة</Label>
                                                                <Select value={formData.vehicle} onValueChange={(value) => updateField('vehicle', value)}>
                                                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                                                                        <SelectValue placeholder="اختر..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="company_car">سيارة الشركة</SelectItem>
                                                                        <SelectItem value="personal_car">سيارة شخصية</SelectItem>
                                                                        <SelectItem value="rental">سيارة مستأجرة</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm text-slate-600">رقم اللوحة</Label>
                                                                <Input
                                                                    value={formData.vehicleRegistration}
                                                                    onChange={(e) => updateField('vehicleRegistration', e.target.value)}
                                                                    className="rounded-xl border-slate-200 bg-white"
                                                                />
                                                            </div>
                                                        </div>

                                                        {Number(formData.mileage) > 0 && (
                                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-blue-700">تعويض المسافة:</span>
                                                                    <span className="font-bold text-blue-700">{formatCurrency(calculations.mileageAmount)}</span>
                                                                </div>
                                                                <p className="text-xs text-blue-600 mt-1">
                                                                    {formData.mileage} كم × {formatCurrency(Number(formData.mileageRate))} = {formatCurrency(calculations.mileageAmount)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Per Diem Section */}
                                                    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-base font-semibold">بدل يومي (Per Diem)</Label>
                                                            <Switch
                                                                checked={formData.applyPerDiem}
                                                                onCheckedChange={(checked) => updateField('applyPerDiem', checked)}
                                                            />
                                                        </div>

                                                        {formData.applyPerDiem && (
                                                            <>
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm text-slate-600">المعدل اليومي</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={formData.perDiemRate}
                                                                            disabled
                                                                            className="rounded-xl border-slate-200 bg-slate-100"
                                                                        />
                                                                        <p className="text-xs text-slate-500">من سياسة الشركة</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm text-slate-600">عدد الأيام</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={formData.perDiemDays}
                                                                            onChange={(e) => updateField('perDiemDays', e.target.value)}
                                                                            className="rounded-xl border-slate-200 bg-white"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm text-slate-600">إجمالي البدل</Label>
                                                                        <div className="h-10 px-3 py-2 rounded-xl bg-green-50 border border-green-200 flex items-center">
                                                                            <span className="text-green-700 font-bold">{formatCurrency(calculations.perDiemAmount)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label className="text-sm text-slate-600">التكلفة الفعلية للوجبات (إن تجاوزت البدل)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={formData.actualMealCost}
                                                                        onChange={(e) => updateField('actualMealCost', e.target.value)}
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        className="rounded-xl border-slate-200 bg-white"
                                                                    />
                                                                    <p className="text-xs text-slate-500">إذا كانت التكلفة الفعلية أعلى من البدل</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}

                                    {/* Government/Court Reference (if legal category) */}
                                    {isGovernmentCategory && (
                                        <AccordionItem value="government" className="border rounded-xl overflow-hidden">
                                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-purple-500" aria-hidden="true" />
                                                    <span className="font-medium">المرجع الحكومي / القضائي</span>
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">رقم المعاملة الحكومية</Label>
                                                        <Input
                                                            value={formData.governmentReference}
                                                            onChange={(e) => updateField('governmentReference', e.target.value)}
                                                            placeholder="رقم المعاملة أو الطلب"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">رقم الدعوى</Label>
                                                        <Input
                                                            value={formData.courtCaseNumber}
                                                            onChange={(e) => updateField('courtCaseNumber', e.target.value)}
                                                            placeholder="رقم الدعوى في المحكمة"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">الجهة الحكومية</Label>
                                                        <Select value={formData.governmentEntity} onValueChange={(value) => updateField('governmentEntity', value)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر الجهة..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {governmentEntities.map((entity) => (
                                                                    <SelectItem key={entity.value} value={entity.value}>
                                                                        {entity.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}

                                    {/* Tax Details */}
                                    <AccordionItem value="tax" className="border rounded-xl overflow-hidden">
                                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="h-4 w-4 text-green-500" aria-hidden="true" />
                                                <span className="font-medium">تفاصيل الضريبة</span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label className="font-medium">يمكن استرداد الضريبة</Label>
                                                        <p className="text-xs text-slate-500 mt-1">هل يمكن استرداد ضريبة القيمة المضافة المدفوعة؟</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.taxReclaimable}
                                                        onCheckedChange={(checked) => updateField('taxReclaimable', checked)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">الرقم الضريبي للمورد</Label>
                                                    <Input
                                                        value={formData.vendorTaxNumber}
                                                        onChange={(e) => updateField('vendorTaxNumber', e.target.value)}
                                                        pattern="[0-9]{15}"
                                                        placeholder="300000000000003"
                                                        className="rounded-xl border-slate-200 font-mono"
                                                    />
                                                    <p className="text-xs text-slate-500">15 رقم - مطلوب لاسترداد الضريبة</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">نسبة الضريبة (%)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.taxRate}
                                                            disabled
                                                            className="rounded-xl border-slate-200 bg-slate-100"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">مبلغ الضريبة</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.taxAmount}
                                                            onChange={(e) => updateField('taxAmount', e.target.value)}
                                                            step="0.01"
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Organization (Firm Mode) */}
                                    <AccordionItem value="organization" className="border rounded-xl overflow-hidden">
                                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                                                <span className="font-medium">معلومات تنظيمية</span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4 pb-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">القسم</Label>
                                                    <Select value={formData.departmentId} onValueChange={(value) => updateField('departmentId', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر القسم..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="commercial">القسم التجاري</SelectItem>
                                                            <SelectItem value="criminal">القسم الجنائي</SelectItem>
                                                            <SelectItem value="corporate">قسم الشركات</SelectItem>
                                                            <SelectItem value="admin">الإدارة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">الفرع</Label>
                                                    <Select value={formData.locationId} onValueChange={(value) => updateField('locationId', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر الفرع..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="riyadh">الرياض</SelectItem>
                                                            <SelectItem value="jeddah">جدة</SelectItem>
                                                            <SelectItem value="dammam">الدمام</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">المشروع</Label>
                                                    <Input
                                                        value={formData.projectId}
                                                        onChange={(e) => updateField('projectId', e.target.value)}
                                                        placeholder="اختر المشروع..."
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">مركز التكلفة</Label>
                                                    <Select value={formData.costCenterId} onValueChange={(value) => updateField('costCenterId', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر مركز التكلفة..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="legal_services">الخدمات القانونية</SelectItem>
                                                            <SelectItem value="admin">الإدارة العامة</SelectItem>
                                                            <SelectItem value="marketing">التسويق</SelectItem>
                                                            <SelectItem value="it">تقنية المعلومات</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Additional Attachments */}
                                    <AccordionItem value="attachments" className="border rounded-xl overflow-hidden">
                                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="h-4 w-4 text-slate-500" />
                                                <span className="font-medium">مرفقات إضافية</span>
                                                {attachments.length > 0 && (
                                                    <Badge variant="secondary" className="ms-2">{attachments.length}</Badge>
                                                )}
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-4">
                                                <p className="text-sm text-slate-500">أضف مستندات داعمة إضافية (فواتير، تفويضات، عروض أسعار، إلخ)</p>

                                                <Input
                                                    type="file"
                                                    accept="*"
                                                    multiple
                                                    onChange={handleAttachmentUpload}
                                                    className="rounded-xl border-slate-200 file:text-slate-600 file:bg-slate-50 file:border-0 file:rounded-lg file:me-4 file:px-4 file:py-2 hover:file:bg-slate-100"
                                                />

                                                {attachments.length > 0 && (
                                                    <div className="space-y-2">
                                                        {attachments.map((file, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="h-5 w-5 text-slate-600" aria-hidden="true" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-700">{file.filename}</p>
                                                                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button type="button" variant="ghost" size="sm" asChild>
                                                                        <a href={file.url} download={file.filename}>
                                                                            <Download className="h-4 w-4" aria-hidden="true" />
                                                                        </a>
                                                                    </Button>
                                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(i)}>
                                                                        <Trash className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                </Accordion>

                                {/* ========== ACTION BUTTONS ========== */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex gap-2">
                                        <Link to="/dashboard/finance/expenses">
                                            <Button type="button" variant="outline" className="rounded-xl">
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
                                        <Button
                                            type="submit"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                                            disabled={createExpenseMutation.isPending}
                                        >
                                            {createExpenseMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                    جاري الحفظ...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                                    حفظ واعتماد
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="expenses" />
                </div>
            </Main>
        </>
    )
}
