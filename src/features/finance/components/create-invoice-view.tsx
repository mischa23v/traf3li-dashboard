import { useState, useMemo } from 'react'
import {
    Save, Calendar, User,
    FileText, Plus, Trash2, Briefcase, Loader2, Percent, Hash, Send
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useCreateInvoice, useSendInvoice } from '@/hooks/useFinance'
import { useClients, useCases } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'

export function CreateInvoiceView() {
    const navigate = useNavigate()
    const createInvoiceMutation = useCreateInvoice()
    const sendInvoiceMutation = useSendInvoice()

    // Load clients and cases from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: casesData, isLoading: loadingCases } = useCases()

    const [formData, setFormData] = useState({
        clientId: '',
        caseId: '',
        reference: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        paymentTerms: '30',
        notes: '',
    })

    const [items, setItems] = useState([{ id: 1, description: '', quantity: 1, price: 0 }])
    const [sendAfterCreate, setSendAfterCreate] = useState(false)

    const handleAddItem = () => {
        setItems([...items, { id: items.length + 1, description: '', quantity: 1, price: 0 }])
    }

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const handleItemChange = (id: number, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
    }

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

        // Calculate discount
        let discountAmount = 0
        if (formData.discountType === 'percentage') {
            discountAmount = subtotal * (formData.discountValue / 100)
        } else {
            discountAmount = formData.discountValue
        }

        const afterDiscount = subtotal - discountAmount
        const vatRate = 0.15 // 15% Saudi VAT
        const vatAmount = afterDiscount * vatRate
        const totalAmount = afterDiscount + vatAmount

        return {
            subtotal,
            discountAmount,
            afterDiscount,
            vatRate,
            vatAmount,
            totalAmount,
        }
    }, [items, formData.discountType, formData.discountValue])

    // Set due date based on payment terms
    const handlePaymentTermsChange = (terms: string) => {
        setFormData({ ...formData, paymentTerms: terms })
        if (terms && formData.issueDate) {
            const issueDate = new Date(formData.issueDate)
            issueDate.setDate(issueDate.getDate() + parseInt(terms))
            setFormData(prev => ({
                ...prev,
                paymentTerms: terms,
                dueDate: issueDate.toISOString().split('T')[0]
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const invoiceData = {
            clientId: formData.clientId,
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(formData.reference && { reference: formData.reference }),
            dueDate: formData.dueDate,
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.quantity * item.price,
            })),
            subtotal: calculations.subtotal,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            discountAmount: calculations.discountAmount,
            vatRate: calculations.vatRate,
            vatAmount: calculations.vatAmount,
            totalAmount: calculations.totalAmount,
            notes: formData.notes,
        }

        createInvoiceMutation.mutate(invoiceData, {
            onSuccess: (data) => {
                if (sendAfterCreate && data?._id) {
                    sendInvoiceMutation.mutate(data._id, {
                        onSuccess: () => {
                            navigate({ to: '/dashboard/finance/invoices' })
                        },
                        onError: () => {
                            // Even if send fails, invoice was created
                            navigate({ to: '/dashboard/finance/invoices' })
                        }
                    })
                } else {
                    navigate({ to: '/dashboard/finance/invoices' })
                }
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
                <ProductivityHero badge="الفواتير" title="إنشاء فاتورة جديدة" type="invoices" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                العميل <span className="text-red-500">*</span>
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
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                القضية (اختياري)
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                رقم المرجع (اختياري)
                                            </label>
                                            <Input
                                                placeholder="مثال: PO-12345"
                                                value={formData.reference}
                                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                شروط الدفع
                                            </label>
                                            <Select
                                                value={formData.paymentTerms}
                                                onValueChange={handlePaymentTermsChange}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر شروط الدفع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">فوري (عند الاستلام)</SelectItem>
                                                    <SelectItem value="7">7 أيام</SelectItem>
                                                    <SelectItem value="15">15 يوم</SelectItem>
                                                    <SelectItem value="30">30 يوم</SelectItem>
                                                    <SelectItem value="45">45 يوم</SelectItem>
                                                    <SelectItem value="60">60 يوم</SelectItem>
                                                    <SelectItem value="90">90 يوم</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الإصدار
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.issueDate}
                                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الاستحقاق <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Invoice Items Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                بنود الفاتورة
                                            </label>
                                            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                                <Plus className="w-4 h-4 ml-2" />
                                                إضافة بند
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div className="flex gap-4 items-center text-xs font-medium text-slate-500 px-1">
                                                <div className="flex-1">الوصف</div>
                                                <div className="w-24 text-center">الكمية</div>
                                                <div className="w-32 text-center">السعر (ر.س)</div>
                                                <div className="w-32 text-center">الإجمالي</div>
                                                <div className="w-10"></div>
                                            </div>
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-4 items-start">
                                                    <div className="flex-1">
                                                        <Input
                                                            placeholder="وصف الخدمة / المنتج"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            placeholder="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                                            className="rounded-xl border-slate-200 text-center"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                                                            className="rounded-xl border-slate-200 text-center"
                                                        />
                                                    </div>
                                                    <div className="w-32 flex items-center justify-center h-10 bg-slate-50 rounded-xl text-sm font-medium">
                                                        {(item.quantity * item.price).toLocaleString('ar-SA')} ر.س
                                                    </div>
                                                    <Button type="button" onClick={() => handleRemoveItem(item.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Discount Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-emerald-500" />
                                                نوع الخصم
                                            </label>
                                            <Select
                                                value={formData.discountType}
                                                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                                                    <SelectItem value="fixed">مبلغ ثابت (ر.س)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                قيمة الخصم
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0"
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">مبلغ الخصم</label>
                                            <div className="h-10 flex items-center px-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-red-600">
                                                -{calculations.discountAmount.toLocaleString('ar-SA')} ر.س
                                            </div>
                                        </div>
                                    </div>

                                    {/* Totals Section */}
                                    <div className="bg-emerald-50 rounded-xl p-6 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">المجموع الفرعي</span>
                                            <span className="font-medium">{calculations.subtotal.toLocaleString('ar-SA')} ر.س</span>
                                        </div>
                                        {calculations.discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-red-600">
                                                <span>الخصم ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'مبلغ ثابت'})</span>
                                                <span>-{calculations.discountAmount.toLocaleString('ar-SA')} ر.س</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">ضريبة القيمة المضافة (15%)</span>
                                            <span className="font-medium">{calculations.vatAmount.toLocaleString('ar-SA')} ر.س</span>
                                        </div>
                                        <hr className="border-emerald-200" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-emerald-800">الإجمالي</span>
                                            <span className="text-emerald-600">{calculations.totalAmount.toLocaleString('ar-SA')} ر.س</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            ملاحظات وشروط
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية أو شروط للدفع..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>

                                    {/* Send after create option */}
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="sendAfterCreate"
                                            checked={sendAfterCreate}
                                            onChange={(e) => setSendAfterCreate(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 rounded border-slate-300"
                                        />
                                        <label htmlFor="sendAfterCreate" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                            <Send className="w-4 h-4" />
                                            إرسال الفاتورة للعميل بعد الإنشاء
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/invoices">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createInvoiceMutation.isPending || sendInvoiceMutation.isPending}
                                    >
                                        {createInvoiceMutation.isPending || sendInvoiceMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                {sendAfterCreate ? 'حفظ وإرسال' : 'حفظ الفاتورة'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="invoices" />
                </div>
            </Main>
        </>
    )
}
