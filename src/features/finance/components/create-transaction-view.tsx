import { useState } from 'react'
import {
    ArrowRight, Save, Calendar, ArrowRightLeft,
    FileText, DollarSign, CreditCard, TrendingUp, Tag, Loader2
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
import { useCreateTransaction } from '@/hooks/useFinance'
import { ProductivityHero } from '@/components/productivity-hero'

export function CreateTransactionView() {
    const navigate = useNavigate()
    const createTransactionMutation = useCreateTransaction()

    const [formData, setFormData] = useState({
        description: '',
        type: '' as 'income' | 'expense' | 'transfer' | '',
        amount: '',
        category: '',
        paymentMethod: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.type) return

        const transactionData = {
            description: formData.description,
            type: formData.type as 'expense' | 'income' | 'transfer',
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            ...(formData.paymentMethod && { paymentMethod: formData.paymentMethod }),
            ...(formData.notes && { notes: formData.notes }),
        }

        createTransactionMutation.mutate(transactionData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/transactions' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: true },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

    // Categories based on transaction type
    const getCategoriesForType = (type: string) => {
        if (type === 'income') {
            return [
                { value: 'legal_fees', label: 'أتعاب قانونية' },
                { value: 'consultation', label: 'استشارات' },
                { value: 'retainer', label: 'مقدم أتعاب' },
                { value: 'court_fees', label: 'رسوم محكمة' },
                { value: 'other_income', label: 'إيرادات أخرى' },
            ]
        } else if (type === 'expense') {
            return [
                { value: 'office', label: 'مستلزمات مكتبية' },
                { value: 'transport', label: 'مواصلات' },
                { value: 'hospitality', label: 'ضيافة' },
                { value: 'government', label: 'رسوم حكومية' },
                { value: 'subscriptions', label: 'اشتراكات' },
                { value: 'rent', label: 'إيجار' },
                { value: 'utilities', label: 'خدمات' },
                { value: 'other_expense', label: 'مصروفات أخرى' },
            ]
        } else if (type === 'transfer') {
            return [
                { value: 'internal_transfer', label: 'تحويل داخلي' },
                { value: 'bank_transfer', label: 'تحويل بنكي' },
            ]
        }
        return []
    }

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
                            badge="المالية"
                            title="تسجيل معاملة جديدة"
                            type="finance"
                            hideButtons={true}
                        >
                            <Link to="/dashboard/finance/transactions">
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
                                                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                                                نوع المعاملة <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value) => setFormData({ ...formData, type: value as any, category: '' })}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="income">إيراد</SelectItem>
                                                    <SelectItem value="expense">مصروف</SelectItem>
                                                    <SelectItem value="transfer">تحويل داخلي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                التصنيف <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                                disabled={!formData.type}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={formData.type ? "اختر التصنيف" : "اختر النوع أولاً"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getCategoriesForType(formData.type).map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            وصف المعاملة <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="مثال: أتعاب قضية الشركة العقارية"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-500" />
                                            طريقة الدفع
                                        </label>
                                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر طريقة الدفع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">نقداً</SelectItem>
                                                <SelectItem value="card">بطاقة ائتمان</SelectItem>
                                                <SelectItem value="transfer">تحويل بنكي</SelectItem>
                                                <SelectItem value="check">شيك</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                    <Link to="/dashboard/finance/transactions">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createTransactionMutation.isPending}
                                    >
                                        {createTransactionMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ المعاملة
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
