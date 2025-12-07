import { useState, useMemo, useEffect } from 'react'
import {
    Save, Calendar, Tag, FileText, DollarSign, User, Building, Loader2,
    RefreshCw, Plus, X
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
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import {
    useCreateRecurringTransaction,
    useUpdateRecurringTransaction,
    useRecurringTransaction
} from '@/hooks/useAccounting'
import { useClients } from '@/hooks/useCasesAndClients'
import { useVendors } from '@/hooks/useAccounting'
import { Card, CardContent } from '@/components/ui/card'

interface LineItem {
    description: string
    quantity: number
    unitPrice: number
}

interface CreateRecurringViewProps {
    mode?: 'create' | 'edit'
}

export function CreateRecurringView({ mode = 'create' }: CreateRecurringViewProps) {
    const navigate = useNavigate()
    const params = useParams({ strict: false }) as { recurringId?: string }
    const isEditMode = mode === 'edit' && params.recurringId

    const createMutation = useCreateRecurringTransaction()
    const updateMutation = useUpdateRecurringTransaction()

    // Fetch data for edit mode
    const { data: recurringData, isLoading: loadingRecurring } = useRecurringTransaction(
        params.recurringId || '',
        { enabled: isEditMode }
    )

    // Load clients and vendors from API
    const { data: clientsData, isLoading: loadingClients } = useClients()
    const { data: vendorsData, isLoading: loadingVendors } = useVendors()

    const [formData, setFormData] = useState({
        name: '',
        transactionType: 'invoice' as 'invoice' | 'bill' | 'expense',
        frequency: 'monthly' as 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual',
        dayOfWeek: undefined as number | undefined,
        dayOfMonth: 1,
        monthOfYear: undefined as number | undefined,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        maxRuns: '',
        clientId: '',
        vendorId: '',
        caseId: '',
        amount: '',
        category: '',
        paymentTerms: '30',
        autoSend: false,
        autoApprove: false,
        notes: '',
    })

    const [items, setItems] = useState<LineItem[]>([])

    // Populate form in edit mode
    useEffect(() => {
        if (isEditMode && recurringData) {
            setFormData({
                name: recurringData.name || '',
                transactionType: recurringData.transactionType || 'invoice',
                frequency: recurringData.frequency || 'monthly',
                dayOfWeek: recurringData.dayOfWeek,
                dayOfMonth: recurringData.dayOfMonth || 1,
                monthOfYear: recurringData.monthOfYear,
                startDate: recurringData.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                endDate: recurringData.endDate?.split('T')[0] || '',
                maxRuns: recurringData.maxRuns?.toString() || '',
                clientId: typeof recurringData.clientId === 'string' ? recurringData.clientId : recurringData.clientId?._id || '',
                vendorId: typeof recurringData.vendorId === 'string' ? recurringData.vendorId : recurringData.vendorId?._id || '',
                caseId: typeof recurringData.caseId === 'string' ? recurringData.caseId : recurringData.caseId?._id || '',
                amount: recurringData.amount?.toString() || '',
                category: recurringData.category || '',
                paymentTerms: recurringData.paymentTerms?.toString() || '30',
                autoSend: recurringData.autoSend || false,
                autoApprove: recurringData.autoApprove || false,
                notes: recurringData.notes || '',
            })
            if (recurringData.items) {
                setItems(recurringData.items)
            }
        }
    }, [isEditMode, recurringData])

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const calculateItemsTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const data = {
            name: formData.name,
            transactionType: formData.transactionType,
            frequency: formData.frequency,
            startDate: formData.startDate,
            ...(formData.endDate && { endDate: formData.endDate }),
            ...(formData.maxRuns && { maxRuns: Number(formData.maxRuns) }),
            ...(formData.dayOfWeek !== undefined && { dayOfWeek: formData.dayOfWeek }),
            ...(formData.dayOfMonth && { dayOfMonth: formData.dayOfMonth }),
            ...(formData.monthOfYear !== undefined && { monthOfYear: formData.monthOfYear }),
            ...(formData.clientId && { clientId: formData.clientId }),
            ...(formData.vendorId && { vendorId: formData.vendorId }),
            ...(formData.caseId && { caseId: formData.caseId }),
            ...(items.length > 0 ? { items } : { amount: Number(formData.amount) }),
            ...(formData.category && { category: formData.category }),
            ...(formData.paymentTerms && { paymentTerms: Number(formData.paymentTerms) }),
            autoSend: formData.autoSend,
            autoApprove: formData.autoApprove,
            ...(formData.notes && { notes: formData.notes }),
        }

        if (isEditMode && params.recurringId) {
            updateMutation.mutate(
                { id: params.recurringId, data },
                {
                    onSuccess: () => {
                        navigate({ to: `/dashboard/finance/recurring/${params.recurringId}` })
                    },
                }
            )
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    navigate({ to: '/dashboard/finance/recurring' })
                },
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات المتكررة', href: '/dashboard/finance/recurring', isActive: true },
    ]

    // Show loading state in edit mode
    if (isEditMode && loadingRecurring) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge="المعاملات المتكررة"
                    title={isEditMode ? 'تعديل معاملة متكررة' : 'إنشاء معاملة متكررة جديدة'}
                    type="recurring"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" />
                                            اسم المعاملة <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="مثال: اشتراك شهري - برنامج المحاسبة"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                نوع المعاملة <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.transactionType}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, transactionType: value as any })
                                                }
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="invoice">فاتورة</SelectItem>
                                                    <SelectItem value="bill">فاتورة مصروف</SelectItem>
                                                    <SelectItem value="expense">مصروف</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4 text-emerald-500" />
                                                التكرار <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.frequency}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, frequency: value as any })
                                                }
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر التكرار" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">يومياً</SelectItem>
                                                    <SelectItem value="weekly">أسبوعياً</SelectItem>
                                                    <SelectItem value="bi_weekly">كل أسبوعين</SelectItem>
                                                    <SelectItem value="monthly">شهرياً</SelectItem>
                                                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                                                    <SelectItem value="semi_annual">نصف سنوي</SelectItem>
                                                    <SelectItem value="annual">سنوي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Frequency Details */}
                                    {formData.frequency === 'weekly' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">يوم الأسبوع</label>
                                            <Select
                                                value={formData.dayOfWeek?.toString() || ''}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, dayOfWeek: Number(value) })
                                                }
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر اليوم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">الأحد</SelectItem>
                                                    <SelectItem value="1">الاثنين</SelectItem>
                                                    <SelectItem value="2">الثلاثاء</SelectItem>
                                                    <SelectItem value="3">الأربعاء</SelectItem>
                                                    <SelectItem value="4">الخميس</SelectItem>
                                                    <SelectItem value="5">الجمعة</SelectItem>
                                                    <SelectItem value="6">السبت</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {['monthly', 'quarterly', 'semi_annual'].includes(formData.frequency) && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">يوم من الشهر</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={formData.dayOfMonth}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, dayOfMonth: Number(e.target.value) })
                                                }
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    )}

                                    {formData.frequency === 'annual' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">الشهر</label>
                                                <Select
                                                    value={formData.monthOfYear?.toString() || ''}
                                                    onValueChange={(value) =>
                                                        setFormData({ ...formData, monthOfYear: Number(value) })
                                                    }
                                                >
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="اختر الشهر" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 12 }, (_, i) => (
                                                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                                {new Date(2000, i).toLocaleDateString('ar-SA', { month: 'long' })}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">اليوم</label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={formData.dayOfMonth}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, dayOfMonth: Number(e.target.value) })
                                                    }
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Date Range */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ البدء <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الانتهاء (اختياري)
                                            </label>
                                            <Input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">الحد الأقصى لعدد التشغيلات (اختياري)</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="اتركه فارغاً للتشغيل غير المحدود"
                                            value={formData.maxRuns}
                                            onChange={(e) => setFormData({ ...formData, maxRuns: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>

                                    {/* Client/Vendor Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {formData.transactionType === 'invoice' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-emerald-500" />
                                                    العميل
                                                </label>
                                                <Select
                                                    value={formData.clientId}
                                                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                                    disabled={loadingClients}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue
                                                            placeholder={loadingClients ? 'جاري التحميل...' : 'اختر العميل'}
                                                        />
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
                                        )}

                                        {(formData.transactionType === 'bill' || formData.transactionType === 'expense') && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-emerald-500" />
                                                    المورد
                                                </label>
                                                <Select
                                                    value={formData.vendorId}
                                                    onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                                                    disabled={loadingVendors}
                                                >
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue
                                                            placeholder={loadingVendors ? 'جاري التحميل...' : 'اختر المورد'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {vendorsData?.data?.map((vendor: any) => (
                                                            <SelectItem key={vendor._id} value={vendor._id}>
                                                                {vendor.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount or Items */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-slate-700">
                                                {items.length > 0 ? 'البنود' : 'المبلغ'}
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddItem}
                                                className="text-emerald-600 border-emerald-500"
                                            >
                                                <Plus className="h-4 w-4 ms-2" />
                                                إضافة بند
                                            </Button>
                                        </div>

                                        {items.length === 0 ? (
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
                                                    required={items.length === 0}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {items.map((item, index) => (
                                                    <Card key={index} className="p-4">
                                                        <div className="grid grid-cols-12 gap-3 items-end">
                                                            <div className="col-span-5">
                                                                <label className="text-xs text-slate-500">الوصف</label>
                                                                <Input
                                                                    placeholder="وصف البند"
                                                                    value={item.description}
                                                                    onChange={(e) =>
                                                                        handleItemChange(index, 'description', e.target.value)
                                                                    }
                                                                    className="rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-xs text-slate-500">الكمية</label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) =>
                                                                        handleItemChange(index, 'quantity', Number(e.target.value))
                                                                    }
                                                                    className="rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <label className="text-xs text-slate-500">السعر</label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={item.unitPrice}
                                                                    onChange={(e) =>
                                                                        handleItemChange(index, 'unitPrice', Number(e.target.value))
                                                                    }
                                                                    className="rounded-lg"
                                                                />
                                                            </div>
                                                            <div className="col-span-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                    className="text-red-500 hover:bg-red-50"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                                <div className="flex justify-end">
                                                    <div className="text-lg font-bold text-navy">
                                                        الإجمالي: {new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(calculateItemsTotal())} ر.س
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Options */}
                                    {formData.transactionType === 'expense' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الفئة</label>
                                            <Input
                                                placeholder="مثال: اشتراكات برمجية"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    )}

                                    {formData.transactionType === 'invoice' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">شروط الدفع (بالأيام)</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.paymentTerms}
                                                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    )}

                                    {/* Checkboxes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 gap-reverse p-4 bg-slate-50 rounded-xl">
                                            <Checkbox
                                                id="autoSend"
                                                checked={formData.autoSend}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, autoSend: checked as boolean })
                                                }
                                                className="data-[state=checked]:bg-emerald-500 border-slate-300"
                                            />
                                            <label
                                                htmlFor="autoSend"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                إرسال تلقائي
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2 gap-reverse p-4 bg-slate-50 rounded-xl">
                                            <Checkbox
                                                id="autoApprove"
                                                checked={formData.autoApprove}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, autoApprove: checked as boolean })
                                                }
                                                className="data-[state=checked]:bg-emerald-500 border-slate-300"
                                            />
                                            <label
                                                htmlFor="autoApprove"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                اعتماد تلقائي
                                            </label>
                                        </div>
                                    </div>

                                    {/* Notes */}
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
                                    <Link to="/dashboard/finance/recurring">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {createMutation.isPending || updateMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                {isEditMode ? 'حفظ التعديلات' : 'حفظ المعاملة'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="recurring" />
                </div>
            </Main>
        </>
    )
}
