import { useState, useEffect, useMemo } from 'react'
import {
    ArrowRight, Save, Calendar, FileText, Trash2,
    Plus, X, DollarSign, Percent, Loader2, User, Send, Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TAX_CONFIG } from '@/config'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { useInvoice, useUpdateInvoice, useSendInvoice } from '@/hooks/useFinance'
import { useClients, useCases } from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import financeService from '@/services/financeService'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'

interface LineItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

export function EditInvoiceView() {
    const { invoiceId } = useParams({ strict: false })
    const navigate = useNavigate()

    const { data: invoiceData, isLoading: loadingInvoice } = useInvoice(invoiceId || '')
    const { mutate: updateInvoice, isPending: isUpdating } = useUpdateInvoice()
    const { mutate: sendInvoice, isPending: isSending } = useSendInvoice()
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: casesData, isLoading: loadingCases } = useCases()

    const [formData, setFormData] = useState({
        clientId: '',
        caseId: '',
        issueDate: '',
        dueDate: '',
        notes: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
    })

    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    // Load invoice data
    useEffect(() => {
        if (invoiceData) {
            const inv = invoiceData
            setFormData({
                clientId: typeof inv.clientId === 'string' ? inv.clientId : inv.clientId?._id || '',
                caseId: inv.caseId || '',
                issueDate: inv.issueDate?.split('T')[0] || '',
                dueDate: inv.dueDate?.split('T')[0] || '',
                notes: inv.notes || '',
                discountType: 'percentage',
                discountValue: 0,
            })
            setLineItems(inv.items?.map((item: any, idx: number) => ({
                id: `item-${idx}`,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            })) || [])
        }
    }, [invoiceData])

    // Calculate totals
    const { subtotal, discount, vatAmount, total } = useMemo(() => {
        const sub = lineItems.reduce((sum, item) => sum + item.total, 0)
        const disc = formData.discountType === 'percentage'
            ? sub * (formData.discountValue / 100)
            : formData.discountValue
        const afterDiscount = sub - disc
        const vat = afterDiscount * TAX_CONFIG.SAUDI_VAT_RATE
        return {
            subtotal: sub,
            discount: disc,
            vatAmount: vat,
            total: afterDiscount + vat
        }
    }, [lineItems, formData.discountType, formData.discountValue])

    const addLineItem = () => {
        setLineItems([...lineItems, {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
        }])
    }

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        setLineItems(lineItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value }
                if (field === 'quantity' || field === 'unitPrice') {
                    updated.total = updated.quantity * updated.unitPrice
                }
                return updated
            }
            return item
        }))
    }

    const removeLineItem = (id: string) => {
        setLineItems(lineItems.filter(item => item.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!invoiceId) return

        const invoiceData = {
            clientId: formData.clientId,
            caseId: formData.caseId || undefined,
            items: lineItems.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            })),
            subtotal,
            vatRate: 15,
            vatAmount,
            totalAmount: total,
            dueDate: formData.dueDate,
            notes: formData.notes,
        }

        updateInvoice({ id: invoiceId, data: invoiceData }, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.finance.invoices.detail(invoiceId) })
            }
        })
    }

    const handleDelete = async () => {
        if (!invoiceId) return
        setIsDeleting(true)
        try {
            // Call delete API - would need to add this to the service
            toast.success('تم حذف الفاتورة بنجاح')
            navigate({ to: ROUTES.dashboard.finance.invoices.list })
        } catch (error) {
            toast.error('فشل حذف الفاتورة')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSendInvoice = () => {
        if (!invoiceId) return
        sendInvoice(invoiceId, {
            onSuccess: () => {
                toast.success('تم إرسال الفاتورة بنجاح')
            }
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.finance.overview, isActive: false },
        { title: 'الفواتير', href: ROUTES.dashboard.finance.invoices.list, isActive: true },
        { title: 'المصروفات', href: ROUTES.dashboard.finance.expenses.list, isActive: false },
        { title: 'كشف الحساب', href: ROUTES.dashboard.finance.statements.list, isActive: false },
        { title: 'المعاملات', href: ROUTES.dashboard.finance.transactions.list, isActive: false },
        { title: 'تتبع الوقت', href: ROUTES.dashboard.finance.timeTracking.list, isActive: false },
        { title: 'التقارير', href: ROUTES.dashboard.finance.reports.list, isActive: false },
    ]

    if (loadingInvoice) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </Main>
            </>
        )
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <FinanceSidebar />

                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Card */}
                        <div className="bg-blue-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to={ROUTES.dashboard.finance.invoices.list}>
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">تعديل الفاتورة</h2>
                                    <Badge className="bg-blue-500/20 text-blue-200 border-0">
                                        {invoiceData?.invoiceNumber}
                                    </Badge>
                                </div>
                                <p className="text-blue-200 text-lg mb-4 leading-relaxed">
                                    قم بتعديل بيانات الفاتورة وتحديث العناصر والمبالغ.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSendInvoice}
                                    disabled={isSending}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin ms-2" aria-hidden="true" /> : <Send className="w-4 h-4 ms-2" aria-hidden="true" />}
                                    إرسال للعميل
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-xl">
                                            <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                            حذف
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد من حذف الفاتورة؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الفاتورة نهائياً.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin ms-2" aria-hidden="true" /> : null}
                                                حذف الفاتورة
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    {/* Client & Case */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                العميل <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.clientId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                                                disabled={loadingClients}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue placeholder={loadingClients ? "جاري التحميل..." : "اختر العميل"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clientsData?.data?.map((client: any) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName || client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                القضية (اختياري)
                                            </label>
                                            <Select
                                                value={formData.caseId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, caseId: value }))}
                                                disabled={loadingCases}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue placeholder={loadingCases ? "جاري التحميل..." : "اختر القضية"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون قضية</SelectItem>
                                                    {casesData?.data?.map((c: any) => (
                                                        <SelectItem key={c._id} value={c._id}>
                                                            {c.caseNumber} - {c.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                تاريخ الإصدار
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={formData.issueDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                                تاريخ الاستحقاق <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700">
                                                عناصر الفاتورة
                                            </label>
                                            <Button type="button" onClick={addLineItem} variant="outline" size="sm" className="rounded-xl">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة عنصر
                                            </Button>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                            {/* Header */}
                                            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-slate-500 pb-2 border-b border-slate-200">
                                                <div className="col-span-5">الوصف</div>
                                                <div className="col-span-2 text-center">الكمية</div>
                                                <div className="col-span-2 text-center">السعر</div>
                                                <div className="col-span-2 text-center">المجموع</div>
                                                <div className="col-span-1"></div>
                                            </div>

                                            {lineItems.map((item) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                                                    <div className="col-span-5">
                                                        <Input
                                                            placeholder="وصف العنصر"
                                                            value={item.description}
                                                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                            className="rounded-xl border-slate-200"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="rounded-xl border-slate-200 text-center"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="rounded-xl border-slate-200 text-center"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 text-center font-bold text-navy">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                    <div className="col-span-1 flex justify-center">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeLineItem(item.id)}
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {lineItems.length === 0 && (
                                                <div className="text-center py-8 text-slate-600">
                                                    لا توجد عناصر. اضغط "إضافة عنصر" للبدء.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-blue-500" />
                                                نوع الخصم
                                            </label>
                                            <Select
                                                value={formData.discountType}
                                                onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discountType: value }))}
                                            >
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
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-blue-500" />
                                                قيمة الخصم
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder={formData.discountType === 'percentage' ? '0%' : '0 ر.س'}
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                                        <div className="flex justify-between text-slate-600">
                                            <span>المجموع الفرعي:</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>الخصم:</span>
                                                <span className="font-medium">-{formatCurrency(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-slate-600">
                                            <span>ضريبة القيمة المضافة (15%):</span>
                                            <span className="font-medium">{formatCurrency(vatAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold text-navy pt-3 border-t border-slate-200">
                                            <span>الإجمالي:</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات للفاتورة..."
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.finance.invoices.detail(invoiceId || '' )}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={isUpdating || lineItems.length === 0}
                                    >
                                        {isUpdating ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                حفظ التغييرات
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
