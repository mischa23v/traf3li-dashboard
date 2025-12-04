import { useState, useMemo } from 'react'
import {
    Save, Calendar, Tag,
    FileText, DollarSign, CreditCard, Upload, Briefcase, Building, Loader2, CheckSquare,
    User, RotateCcw, Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateExpense } from '@/hooks/useFinance'
import { useCases, useClients } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'

// Expense categories matching miru-web
const expenseCategories = [
    { value: 'office_supplies', label: 'مستلزمات مكتبية', labelEn: 'Office Supplies' },
    { value: 'travel', label: 'سفر وانتقالات', labelEn: 'Travel' },
    { value: 'transport', label: 'مواصلات', labelEn: 'Transportation' },
    { value: 'meals', label: 'وجبات وضيافة', labelEn: 'Meals & Entertainment' },
    { value: 'software', label: 'برمجيات واشتراكات', labelEn: 'Software & Subscriptions' },
    { value: 'equipment', label: 'معدات وأجهزة', labelEn: 'Equipment' },
    { value: 'communication', label: 'اتصالات', labelEn: 'Communication' },
    { value: 'government_fees', label: 'رسوم حكومية', labelEn: 'Government Fees' },
    { value: 'professional_services', label: 'خدمات مهنية', labelEn: 'Professional Services' },
    { value: 'marketing', label: 'تسويق وإعلان', labelEn: 'Marketing' },
    { value: 'training', label: 'تدريب وتطوير', labelEn: 'Training' },
    { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

export function CreateExpenseView() {
    const navigate = useNavigate()
    const createExpenseMutation = useCreateExpense()

    // Load cases and clients from API
    const { data: casesData, isLoading: loadingCases } = useCases()
    const { data: clientsData, isLoading: loadingClients } = useClients()

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        vendor: '',
        caseId: '',
        clientId: '',
        expenseType: 'company' as 'company' | 'personal',
        isBillable: false,
        isReimbursable: false,
        taxAmount: '',
        receiptNumber: '',
        notes: '',
    })

    // Get selected client
    const selectedClient = useMemo(() => {
        if (!formData.clientId || !clientsData?.data) return null
        return clientsData.data.find((c: any) => c._id === formData.clientId)
    }, [formData.clientId, clientsData])

    // Calculate total with tax
    const totalAmount = useMemo(() => {
        const amount = Number(formData.amount) || 0
        const tax = Number(formData.taxAmount) || 0
        return amount + tax
    }, [formData.amount, formData.taxAmount])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const expenseData = {
            description: formData.description,
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            expenseType: formData.expenseType,
            isBillable: formData.isBillable,
            isReimbursable: formData.isReimbursable,
            ...(formData.vendor && { vendor: formData.vendor }),
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(formData.taxAmount && { taxAmount: Number(formData.taxAmount) }),
            ...(formData.receiptNumber && { receiptNumber: formData.receiptNumber }),
            ...(formData.notes && { notes: formData.notes }),
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
                                <div className="space-y-6">
                                    {/* Expense Type Selector */}
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <label className="text-sm font-medium text-slate-700 mb-3 block">نوع المصروف</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="expenseType"
                                                    value="company"
                                                    checked={formData.expenseType === 'company'}
                                                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value as 'company' | 'personal' })}
                                                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">مصروف الشركة</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="expenseType"
                                                    value="personal"
                                                    checked={formData.expenseType === 'personal'}
                                                    onChange={(e) => setFormData({ ...formData, expenseType: e.target.value as 'company' | 'personal' })}
                                                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                                                />
                                                <span className="text-sm font-medium text-slate-700">مصروف شخصي (قابل للسداد)</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                وصف المصروف <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: شراء قرطاسية للمكتب"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                التاريخ <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                المبلغ (ر.س) <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                الضريبة (ر.س)
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                value={formData.taxAmount}
                                                onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                الإجمالي
                                            </label>
                                            <div className="h-10 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center">
                                                <span className="text-emerald-700 font-bold">
                                                    {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(totalAmount)} ر.س
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                التصنيف <span className="text-red-500">*</span>
                                            </label>
                                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseCategories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                                طريقة الدفع <span className="text-red-500">*</span>
                                            </label>
                                            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر طريقة الدفع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">نقداً</SelectItem>
                                                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
                                                    <SelectItem value="debit">بطاقة خصم</SelectItem>
                                                    <SelectItem value="transfer">تحويل بنكي</SelectItem>
                                                    <SelectItem value="check">شيك</SelectItem>
                                                    <SelectItem value="petty_cash">صندوق النثريات</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building className="w-4 h-4 text-emerald-500" />
                                                المورد / الجهة
                                            </label>
                                            <Input
                                                placeholder="مثال: مكتبة الرياض"
                                                value={formData.vendor}
                                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-emerald-500" />
                                                رقم الإيصال / الفاتورة
                                            </label>
                                            <Input
                                                placeholder="مثال: INV-001"
                                                value={formData.receiptNumber}
                                                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                العميل (اختياري)
                                            </label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون عميل (مصروف عام)</SelectItem>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.name || client.fullName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedClient && (
                                                <p className="text-xs text-slate-500">
                                                    البريد: {selectedClient.email || 'غير محدد'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية / المشروع (اختياري)
                                            </label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                                                disabled={loadingCases}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingCases ? "جاري التحميل..." : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون قضية</SelectItem>
                                                    {casesData?.data?.map((caseItem: any) => (
                                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                                            {caseItem.caseNumber} - {caseItem.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-emerald-500" />
                                            إرفاق الإيصال
                                        </label>
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 file:text-emerald-600 file:bg-emerald-50 file:border-0 file:rounded-lg file:mr-4 file:px-4 file:py-2 hover:file:bg-emerald-100"
                                        />
                                        <p className="text-xs text-slate-500">يمكنك إرفاق صورة أو ملف PDF للإيصال</p>
                                    </div>

                                    {/* Checkboxes Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-50 rounded-xl">
                                            <Checkbox
                                                id="billable"
                                                checked={formData.isBillable}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isBillable: checked as boolean })}
                                                className="data-[state=checked]:bg-emerald-500 border-slate-300"
                                            />
                                            <label
                                                htmlFor="billable"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                            >
                                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                قابل للفوترة (تحميله على العميل)
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse p-4 bg-slate-50 rounded-xl">
                                            <Checkbox
                                                id="reimbursable"
                                                checked={formData.isReimbursable}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isReimbursable: checked as boolean })}
                                                className="data-[state=checked]:bg-blue-500 border-slate-300"
                                                disabled={formData.expenseType !== 'personal'}
                                            />
                                            <label
                                                htmlFor="reimbursable"
                                                className={`text-sm font-medium leading-none flex items-center gap-2 ${formData.expenseType !== 'personal' ? 'opacity-50' : ''}`}
                                            >
                                                <RotateCcw className="w-4 h-4 text-blue-500" />
                                                قابل للسداد (رد المبلغ للموظف)
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            ملاحظات إضافية
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي تفاصيل إضافية..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/expenses">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createExpenseMutation.isPending}
                                    >
                                        {createExpenseMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ المصروف
                                            </span>
                                        )}
                                    </Button>
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
