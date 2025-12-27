import { useState } from 'react'
import {
    ArrowRight, Save, Calendar, Activity,
    FileText, User, Shield, Loader2, DollarSign, Hash
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
import { useCreateActivity } from '@/hooks/useFinance'

type ActivityType = 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'expense_created' | 'expense_approved' | 'transaction_created'

export function CreateAccountActivityView() {
    const navigate = useNavigate()
    const { mutate: createActivity, isPending } = useCreateActivity()

    const [formData, setFormData] = useState({
        type: '' as ActivityType | '',
        title: '',
        description: '',
        reference: '',
        amount: 0,
        status: 'completed',
        metadata: {}
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.type) {
            return
        }

        createActivity({
            ...formData,
            type: formData.type as ActivityType
        }, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/activity' })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: true },
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Sidebar Widgets */}
                    <FinanceSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to={ROUTES.dashboard.finance.activity.list}>
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">تسجيل نشاط يدوي</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    قم بإضافة سجل نشاط يدوياً لأغراض التدقيق والمتابعة.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Activity className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <Shield className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                عنوان النشاط <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: استلام دفعة من العميل"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                نوع النشاط <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(value: ActivityType) => setFormData(prev => ({ ...prev, type: value }))}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="payment_received">دفعة مستلمة</SelectItem>
                                                    <SelectItem value="payment_sent">دفعة مرسلة</SelectItem>
                                                    <SelectItem value="invoice_created">فاتورة منشأة</SelectItem>
                                                    <SelectItem value="invoice_sent">فاتورة مرسلة</SelectItem>
                                                    <SelectItem value="invoice_paid">فاتورة مدفوعة</SelectItem>
                                                    <SelectItem value="expense_created">مصروف منشأ</SelectItem>
                                                    <SelectItem value="expense_approved">مصروف موافق عليه</SelectItem>
                                                    <SelectItem value="transaction_created">معاملة منشأة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                المرجع
                                            </label>
                                            <Input
                                                placeholder="مثال: INV-2025-001"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.reference}
                                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                المبلغ (ر.س)
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.amount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            تفاصيل النشاط
                                        </label>
                                        <Textarea
                                            placeholder="أدخل تفاصيل النشاط..."
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-500" />
                                            الحالة
                                        </label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر الحالة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="completed">مكتمل</SelectItem>
                                                <SelectItem value="pending">معلق</SelectItem>
                                                <SelectItem value="failed">فشل</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.finance.activity.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                تسجيل النشاط
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
