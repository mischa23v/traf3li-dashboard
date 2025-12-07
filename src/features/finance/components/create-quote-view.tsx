import { useState, useMemo } from 'react'
import {
    ArrowRight, Save, Calendar, User,
    FileText, DollarSign, Plus, Trash2, Briefcase, Loader2, Percent, Send
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
import { useCreateQuote, useSendQuote } from '@/hooks/useQuotes'
import { useClients, useCases } from '@/hooks/useCasesAndClients'
import { ProductivityHero } from '@/components/productivity-hero'

export default function CreateQuoteView() {
    const navigate = useNavigate()
    const createQuoteMutation = useCreateQuote()
    const sendQuoteMutation = useSendQuote()

    // Load clients and cases from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: casesData, isLoading: loadingCases } = useCases()

    const [formData, setFormData] = useState({
        clientId: '',
        caseId: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiredDate: '',
        validityDays: '30',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        notes: '',
        terms: '',
        currency: 'SAR',
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

    // Set expiry date based on validity days
    const handleValidityChange = (days: string) => {
        setFormData({ ...formData, validityDays: days })
        if (days && formData.issueDate) {
            const issueDate = new Date(formData.issueDate)
            issueDate.setDate(issueDate.getDate() + parseInt(days))
            setFormData(prev => ({
                ...prev,
                validityDays: days,
                expiredDate: issueDate.toISOString().split('T')[0]
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const quoteData = {
            clientId: formData.clientId,
            ...(formData.caseId && { caseId: formData.caseId }),
            expiredDate: formData.expiredDate,
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.quantity * item.price,
            })),
            subtotal: calculations.subtotal,
            vatRate: calculations.vatRate,
            vatAmount: calculations.vatAmount,
            totalAmount: calculations.totalAmount,
            notes: formData.notes,
            terms: formData.terms,
            currency: formData.currency,
        }

        createQuoteMutation.mutate(quoteData, {
            onSuccess: (data) => {
                if (sendAfterCreate && data?._id) {
                    sendQuoteMutation.mutate(data._id, {
                        onSuccess: () => {
                            navigate({ to: '/dashboard/finance/quotes' })
                        },
                        onError: () => {
                            // Even if send fails, quote was created
                            navigate({ to: '/dashboard/finance/quotes' })
                        }
                    })
                } else {
                    navigate({ to: '/dashboard/finance/quotes' })
                }
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: true },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Sidebar Widgets */}
                    <FinanceSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <ProductivityHero
                            badge="عروض الأسعار"
                            title="إنشاء عرض سعر جديد"
                            type="finance"
                            hideButtons={true}
                        >
                            <Link to="/dashboard/finance/quotes">
                                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </ProductivityHero>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                العميل <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
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
                                                <Briefcase className="w-4 h-4 text-blue-500" />
                                                القضية (اختياري)
                                            </label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData({ ...formData, caseId: value })}
                                                disabled={loadingCases}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
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
                                                <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                فترة صلاحية العرض
                                            </label>
                                            <Select
                                                value={formData.validityDays}
                                                onValueChange={handleValidityChange}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue placeholder="اختر فترة الصلاحية" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="7">7 أيام</SelectItem>
                                                    <SelectItem value="14">14 يوم</SelectItem>
                                                    <SelectItem value="30">30 يوم</SelectItem>
                                                    <SelectItem value="45">45 يوم</SelectItem>
                                                    <SelectItem value="60">60 يوم</SelectItem>
                                                    <SelectItem value="90">90 يوم</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-blue-500" />
                                                العملة
                                            </label>
                                            <Select
                                                value={formData.currency}
                                                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                تاريخ الإصدار
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.issueDate}
                                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                تاريخ الانتهاء <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.expiredDate}
                                                onChange={(e) => setFormData({ ...formData, expiredDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Quote Items Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                بنود عرض السعر
                                            </label>
                                            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
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
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Discount Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-blue-500" />
                                                نوع الخصم
                                            </label>
                                            <Select
                                                value={formData.discountType}
                                                onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500 bg-white">
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
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                                    <div className="bg-blue-50 rounded-xl p-6 space-y-3">
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
                                        <hr className="border-blue-200" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-blue-800">الإجمالي</span>
                                            <span className="text-blue-600">{calculations.totalAmount.toLocaleString('ar-SA')} ر.س</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="min-h-[80px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                            الشروط والأحكام
                                        </label>
                                        <Textarea
                                            placeholder="أدخل الشروط والأحكام..."
                                            value={formData.terms}
                                            onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                            className="min-h-[80px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
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
                                            <Send className="w-4 h-4" aria-hidden="true" />
                                            إرسال عرض السعر للعميل بعد الإنشاء
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/finance/quotes">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={createQuoteMutation.isPending || sendQuoteMutation.isPending}
                                    >
                                        {createQuoteMutation.isPending || sendQuoteMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {sendAfterCreate ? 'حفظ وإرسال' : 'حفظ عرض السعر'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
