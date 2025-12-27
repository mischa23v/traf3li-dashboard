import { useState, useMemo } from 'react'
import {
    Save, Calendar, FileText, Plus, Trash2, Loader2, Percent, Hash, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TAX_CONFIG } from '@/config'
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { ROUTES } from '@/constants/routes'

// Placeholder hooks - will be implemented in useFinance.ts
const useCreateBill = () => {
    return {
        mutate: (data: any, options?: any) => {
            // Placeholder implementation
        },
        isPending: false
    }
}

const useUpdateBill = () => {
    return {
        mutate: (params: { id: string; data: any }, options?: any) => {
            // Placeholder implementation
        },
        isPending: false
    }
}

const useBill = (id?: string) => {
    return {
        data: null,
        isLoading: false
    }
}

const useVendors = () => {
    return {
        data: { data: [] },
        isLoading: false
    }
}

interface CreateBillViewProps {
    mode?: 'create' | 'edit'
}

export function CreateBillView({ mode = 'create' }: CreateBillViewProps) {
    const navigate = useNavigate()
    const { billId } = useParams({ strict: false }) as { billId?: string }

    const createBillMutation = useCreateBill()
    const updateBillMutation = useUpdateBill()

    // Load vendors from API
    const { data: vendorsData, isLoading: loadingVendors } = useVendors()

    // Load existing bill data if editing
    const { data: existingBill, isLoading: loadingBill } = useBill(mode === 'edit' ? billId : undefined)

    const [formData, setFormData] = useState({
        vendorId: '',
        reference: '',
        billDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        paymentTerms: '30',
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

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        const vatRate = TAX_CONFIG.SAUDI_VAT_RATE // 15% Saudi VAT
        const vatAmount = subtotal * vatRate
        const totalAmount = subtotal + vatAmount

        return {
            subtotal,
            vatRate,
            vatAmount,
            totalAmount,
        }
    }, [items])

    // Set due date based on payment terms
    const handlePaymentTermsChange = (terms: string) => {
        setFormData({ ...formData, paymentTerms: terms })
        if (terms && formData.billDate) {
            const billDate = new Date(formData.billDate)
            billDate.setDate(billDate.getDate() + parseInt(terms))
            setFormData(prev => ({
                ...prev,
                paymentTerms: terms,
                dueDate: billDate.toISOString().split('T')[0]
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const billData = {
            vendorId: formData.vendorId,
            ...(formData.reference && { reference: formData.reference }),
            billDate: formData.billDate,
            dueDate: formData.dueDate,
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
        }

        if (mode === 'edit' && billId) {
            updateBillMutation.mutate({ id: billId, data: billData }, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.finance.bills.list })
                },
            })
        } else {
            createBillMutation.mutate(billData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.finance.bills.list })
                },
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.finance.overview, isActive: false },
        { title: 'الفواتير', href: ROUTES.dashboard.finance.bills.list, isActive: true },
        { title: 'المصروفات', href: ROUTES.dashboard.finance.expenses.list, isActive: false },
        { title: 'كشف الحساب', href: ROUTES.dashboard.finance.statements.list, isActive: false },
        { title: 'المعاملات', href: ROUTES.dashboard.finance.transactions.list, isActive: false },
        { title: 'تتبع الوقت', href: ROUTES.dashboard.finance.timeTracking.list, isActive: false },
        { title: 'نشاط الحساب', href: ROUTES.dashboard.finance.activity.list, isActive: false },
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
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge="فواتير الموردين"
                    title={mode === 'edit' ? 'تعديل فاتورة مورد' : 'إنشاء فاتورة مورد جديدة'}
                    type="bills"
                    listMode={true}
                />

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
                                                <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                المورد <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.vendorId}
                                                onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                                                disabled={loadingVendors}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder={loadingVendors ? "جاري التحميل..." : "اختر المورد"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vendorsData?.data?.map((vendor: any) => (
                                                        <SelectItem key={vendor._id} value={vendor._id}>
                                                            {vendor.name || vendor.companyName || 'مورد غير محدد'}
                                                        </SelectItem>
                                                    ))}
                                                    {(!vendorsData?.data || vendorsData.data.length === 0) && (
                                                        <SelectItem value="placeholder" disabled>
                                                            لا توجد موردين - <Link to={ROUTES.dashboard.finance.vendors.new} className="text-emerald-500">إضافة مورد</Link>
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الفاتورة
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.billDate}
                                                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
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
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
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

                                    {/* Bill Items Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                بنود الفاتورة
                                            </label>
                                            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
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
                                                    <Button type="button" onClick={() => handleRemoveItem(item.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" aria-label="حذف البند">
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Totals Section */}
                                    <div className="bg-emerald-50 rounded-xl p-6 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">المجموع الفرعي</span>
                                            <span className="font-medium">{calculations.subtotal.toLocaleString('ar-SA')} ر.س</span>
                                        </div>
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
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
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
                                    <Link to={ROUTES.dashboard.finance.bills.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createBillMutation.isPending || updateBillMutation.isPending}
                                    >
                                        {createBillMutation.isPending || updateBillMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {mode === 'edit' ? 'حفظ التعديلات' : 'حفظ الفاتورة'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="bills" />
                </div>
            </Main>
        </>
    )
}
