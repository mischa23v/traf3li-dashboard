import { useState } from 'react'
import {
    ArrowRight, Save, Calendar, User,
    FileText, DollarSign, Hash, Plus, Trash2
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
import { useCreateInvoice } from '@/hooks/useFinance'

export function CreateInvoiceView() {
    const navigate = useNavigate()
    const createInvoiceMutation = useCreateInvoice()

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        clientId: '',
        issueDate: '',
        dueDate: '',
        notes: '',
    })

    const [items, setItems] = useState([{ id: 1, description: '', quantity: 1, price: 0 }])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        const vatRate = 0.15
        const vatAmount = subtotal * vatRate
        const totalAmount = subtotal + vatAmount

        const invoiceData = {
            invoiceNumber: formData.invoiceNumber,
            clientId: formData.clientId,
            issueDate: formData.issueDate,
            dueDate: formData.dueDate,
            items: items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.quantity * item.price,
            })),
            subtotal,
            vatRate,
            vatAmount,
            totalAmount,
            notes: formData.notes,
        }

        createInvoiceMutation.mutate(invoiceData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/finance/invoices' })
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Sidebar Widgets */}
                    <FinanceSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/finance/invoices">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">إنشاء فاتورة جديدة</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    قم بإنشاء فاتورة جديدة للعميل، أضف البنود والخدمات، وحدد شروط الدفع.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <FileText className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <DollarSign className="h-24 w-24 text-teal-400" />
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
                                                <Hash className="w-4 h-4 text-emerald-500" />
                                                رقم الفاتورة
                                            </label>
                                            <Input
                                                placeholder="INV-2025-001"
                                                value={formData.invoiceNumber}
                                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" />
                                                العميل
                                            </label>
                                            <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر العميل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="client1">شركة الإنشاءات</SelectItem>
                                                    <SelectItem value="client2">مجموعة العقارية</SelectItem>
                                                    <SelectItem value="client3">مؤسسة النور</SelectItem>
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
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الاستحقاق
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
                                            {items.map((item, index) => (
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
                                                            placeholder="الكمية"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            placeholder="السعر"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                    <Button type="button" onClick={() => handleRemoveItem(item.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
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
                                        disabled={createInvoiceMutation.isPending}
                                    >
                                        {createInvoiceMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ الفاتورة
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
