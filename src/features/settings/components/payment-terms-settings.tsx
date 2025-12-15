import { useState, useMemo } from 'react'
import {
    Calendar, Plus, MoreHorizontal, Trash2, Edit, Loader2, Star,
    Clock, AlertCircle, CalendarCheck, Percent, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
    usePaymentTerms,
    useCreatePaymentTerms,
    useUpdatePaymentTerms,
    useDeletePaymentTerms,
    useSetDefaultPaymentTerms,
    useInitializePaymentTermsTemplates
} from '@/hooks/useBillingSettings'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaymentTerms } from '@/services/paymentTermsService'

export default function PaymentTermsSettings() {
    const { data: termsData, isLoading } = usePaymentTerms()
    const createTermsMutation = useCreatePaymentTerms()
    const updateTermsMutation = useUpdatePaymentTerms()
    const deleteTermsMutation = useDeletePaymentTerms()
    const setDefaultMutation = useSetDefaultPaymentTerms()
    const initializeTemplatesMutation = useInitializePaymentTermsTemplates()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTerms, setEditingTerms] = useState<PaymentTerms | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        dueDays: 30,
        discountDays: 0,
        discountPercent: 0,
        isActive: true,
    })

    const terms = termsData?.paymentTerms || []

    // Calculate due date preview
    const calculateDueDate = (days: number) => {
        const date = new Date()
        date.setDate(date.getDate() + days)
        return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    // Calculate discount deadline
    const calculateDiscountDeadline = (days: number) => {
        if (!days) return null
        const date = new Date()
        date.setDate(date.getDate() + days)
        return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const handleOpenDialog = (term?: PaymentTerms) => {
        if (term) {
            setEditingTerms(term)
            setFormData({
                name: term.name,
                nameAr: term.nameAr,
                description: term.description || '',
                descriptionAr: term.descriptionAr || '',
                dueDays: term.dueDays,
                discountDays: term.discountDays || 0,
                discountPercent: term.discountPercent || 0,
                isActive: term.isActive,
            })
        } else {
            setEditingTerms(null)
            setFormData({
                name: '',
                nameAr: '',
                description: '',
                descriptionAr: '',
                dueDays: 30,
                discountDays: 0,
                discountPercent: 0,
                isActive: true,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingTerms(null)
        setFormData({
            name: '',
            nameAr: '',
            description: '',
            descriptionAr: '',
            dueDays: 30,
            discountDays: 0,
            discountPercent: 0,
            isActive: true,
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingTerms) {
            await updateTermsMutation.mutateAsync({
                id: editingTerms._id,
                data: formData
            })
        } else {
            await createTermsMutation.mutateAsync(formData)
        }
        handleCloseDialog()
    }

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف شروط الدفع هذه؟')) {
            await deleteTermsMutation.mutateAsync(id)
        }
    }

    const handleSetDefault = async (id: string) => {
        await setDefaultMutation.mutateAsync(id)
    }

    const handleToggleActive = async (term: PaymentTerms) => {
        await updateTermsMutation.mutateAsync({
            id: term._id,
            data: { isActive: !term.isActive }
        })
    }

    const handleInitializeTemplates = async () => {
        if (confirm('هل تريد تهيئة القوالب الافتراضية؟ سيتم إضافة شروط الدفع الشائعة.')) {
            await initializeTemplatesMutation.mutateAsync()
        }
    }

    // Group terms by category
    const groupedTerms = useMemo(() => {
        const standard: PaymentTerms[] = []
        const earlyPayment: PaymentTerms[] = []
        const extended: PaymentTerms[] = []

        terms.forEach((term: PaymentTerms) => {
            if (term.discountPercent && term.discountPercent > 0) {
                earlyPayment.push(term)
            } else if (term.dueDays <= 30) {
                standard.push(term)
            } else {
                extended.push(term)
            }
        })

        return { standard, earlyPayment, extended }
    }, [terms])

    if (isLoading) {
        return (
            <>
                <Header>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher />
                        <ThemeSwitch />
                        <ProfileDropdown />
                    </div>
                </Header>
                <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-40 rounded-3xl" />
                            ))}
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-navy">شروط الدفع</h1>
                            <p className="text-slate-500">إدارة شروط وآجال الدفع للفواتير وعروض الأسعار</p>
                        </div>
                        <div className="flex gap-2">
                            {terms.length === 0 && (
                                <Button
                                    onClick={handleInitializeTemplates}
                                    variant="outline"
                                    disabled={initializeTemplatesMutation.isPending}
                                >
                                    {initializeTemplatesMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 ms-2" />
                                    )}
                                    تهيئة القوالب الافتراضية
                                </Button>
                            )}
                            <Button onClick={() => handleOpenDialog()} className="bg-brand-blue hover:bg-brand-blue/90">
                                <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                إضافة شروط دفع
                            </Button>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <Alert className="mb-6 border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            شروط الدفع تحدد موعد استحقاق الفاتورة وشروط الخصم للدفع المبكر. يمكنك استخدامها في الفواتير وعروض الأسعار.
                        </AlertDescription>
                    </Alert>

                    {/* Payment Terms Grid */}
                    {terms.length === 0 ? (
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-navy mb-2">لا توجد شروط دفع</h3>
                                <p className="text-slate-500 mb-4">قم بإضافة شروط دفع أو استخدم القوالب الافتراضية للبدء</p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        onClick={handleInitializeTemplates}
                                        variant="outline"
                                        disabled={initializeTemplatesMutation.isPending}
                                    >
                                        {initializeTemplatesMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4 ms-2" />
                                        )}
                                        تهيئة القوالب الافتراضية
                                    </Button>
                                    <Button onClick={() => handleOpenDialog()}>
                                        <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                        إضافة شروط دفع
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            {/* Standard Terms */}
                            {groupedTerms.standard.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        شروط الدفع القياسية
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedTerms.standard.map((term) => (
                                            <PaymentTermCard
                                                key={term._id}
                                                term={term}
                                                onEdit={handleOpenDialog}
                                                onDelete={handleDelete}
                                                onSetDefault={handleSetDefault}
                                                onToggleActive={handleToggleActive}
                                                calculateDueDate={calculateDueDate}
                                                calculateDiscountDeadline={calculateDiscountDeadline}
                                                isUpdating={updateTermsMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Early Payment Discount Terms */}
                            {groupedTerms.earlyPayment.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-green-600" />
                                        شروط الدفع المبكر (خصومات)
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedTerms.earlyPayment.map((term) => (
                                            <PaymentTermCard
                                                key={term._id}
                                                term={term}
                                                onEdit={handleOpenDialog}
                                                onDelete={handleDelete}
                                                onSetDefault={handleSetDefault}
                                                onToggleActive={handleToggleActive}
                                                calculateDueDate={calculateDueDate}
                                                calculateDiscountDeadline={calculateDiscountDeadline}
                                                isUpdating={updateTermsMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Extended Terms */}
                            {groupedTerms.extended.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                                        <CalendarCheck className="h-5 w-5 text-purple-600" />
                                        شروط الدفع الممتدة
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedTerms.extended.map((term) => (
                                            <PaymentTermCard
                                                key={term._id}
                                                term={term}
                                                onEdit={handleOpenDialog}
                                                onDelete={handleDelete}
                                                onSetDefault={handleSetDefault}
                                                onToggleActive={handleToggleActive}
                                                calculateDueDate={calculateDueDate}
                                                calculateDiscountDeadline={calculateDiscountDeadline}
                                                isUpdating={updateTermsMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Common Templates Info */}
                    <Card className="border-0 shadow-sm rounded-3xl mt-6 bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-base">شروط الدفع الشائعة</CardTitle>
                            <CardDescription>
                                القوالب الافتراضية التي يمكن تهيئتها بنقرة واحدة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <p className="font-medium text-navy">شروط قياسية:</p>
                                    <ul className="space-y-1 text-slate-600">
                                        <li>• استحقاق عند الاستلام (0 أيام)</li>
                                        <li>• صافي 7 أيام</li>
                                        <li>• صافي 15 يوم</li>
                                        <li>• صافي 30 يوم</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium text-navy">شروط ممتدة:</p>
                                    <ul className="space-y-1 text-slate-600">
                                        <li>• صافي 45 يوم</li>
                                        <li>• صافي 60 يوم</li>
                                        <li>• صافي 90 يوم</li>
                                        <li>• نهاية الشهر</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Main>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTerms ? 'تعديل شروط الدفع' : 'إضافة شروط دفع جديدة'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTerms ? 'تعديل بيانات شروط الدفع' : 'أدخل بيانات شروط الدفع الجديدة'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">الاسم (إنجليزي)</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Net 30"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nameAr">الاسم (عربي)</Label>
                                    <Input
                                        id="nameAr"
                                        name="nameAr"
                                        value={formData.nameAr}
                                        onChange={handleChange}
                                        placeholder="صافي 30 يوم"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Due Days */}
                            <div className="space-y-2">
                                <Label htmlFor="dueDays">عدد أيام الاستحقاق</Label>
                                <Input
                                    id="dueDays"
                                    name="dueDays"
                                    type="number"
                                    value={formData.dueDays}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                                <p className="text-xs text-slate-500">
                                    مثال: إذا كانت الفاتورة اليوم، تاريخ الاستحقاق سيكون: {calculateDueDate(formData.dueDays)}
                                </p>
                            </div>

                            {/* Early Payment Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discountDays">أيام الخصم (اختياري)</Label>
                                    <Input
                                        id="discountDays"
                                        name="discountDays"
                                        type="number"
                                        value={formData.discountDays}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="10"
                                    />
                                    <p className="text-xs text-slate-500">
                                        الدفع قبل هذا التاريخ يحصل على خصم
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountPercent">نسبة الخصم (%)</Label>
                                    <Input
                                        id="discountPercent"
                                        name="discountPercent"
                                        type="number"
                                        value={formData.discountPercent}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="2"
                                    />
                                    <p className="text-xs text-slate-500">
                                        مثال: 2/10 Net 30
                                    </p>
                                </div>
                            </div>

                            {/* Description Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">الوصف (إنجليزي)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Payment due within 30 days"
                                        dir="ltr"
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descriptionAr">الوصف (عربي)</Label>
                                    <Textarea
                                        id="descriptionAr"
                                        name="descriptionAr"
                                        value={formData.descriptionAr}
                                        onChange={handleChange}
                                        placeholder="الدفع مستحق خلال 30 يوم"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <Label htmlFor="isActive">مفعّلة</Label>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                                />
                            </div>

                            {/* Preview */}
                            {formData.discountDays > 0 && formData.discountPercent > 0 && (
                                <Alert className="border-green-200 bg-green-50">
                                    <Percent className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-900">
                                        <strong>خصم الدفع المبكر:</strong> {formData.discountPercent}% خصم إذا تم الدفع خلال {formData.discountDays} يوم،
                                        وإلا المبلغ الكامل مستحق خلال {formData.dueDays} يوم
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-blue hover:bg-brand-blue/90"
                                disabled={createTermsMutation.isPending || updateTermsMutation.isPending}
                            >
                                {(createTermsMutation.isPending || updateTermsMutation.isPending) ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : null}
                                {editingTerms ? 'حفظ التغييرات' : 'إضافة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ==================== PAYMENT TERM CARD COMPONENT ====================

interface PaymentTermCardProps {
    term: PaymentTerms
    onEdit: (term: PaymentTerms) => void
    onDelete: (id: string) => void
    onSetDefault: (id: string) => void
    onToggleActive: (term: PaymentTerms) => void
    calculateDueDate: (days: number) => string
    calculateDiscountDeadline: (days: number) => string | null
    isUpdating: boolean
}

function PaymentTermCard({
    term,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    calculateDueDate,
    calculateDiscountDeadline,
    isUpdating
}: PaymentTermCardProps) {
    const hasDiscount = term.discountDays && term.discountPercent && term.discountPercent > 0

    return (
        <Card
            className={`border-0 shadow-sm rounded-3xl transition-all ${
                !term.isActive ? 'opacity-60' : ''
            }`}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            term.isDefault ? 'bg-emerald-100' : 'bg-blue-100'
                        }`}>
                            {hasDiscount ? (
                                <Percent className={`h-6 w-6 ${
                                    term.isDefault ? 'text-emerald-600' : 'text-blue-600'
                                }`} />
                            ) : (
                                <Calendar className={`h-6 w-6 ${
                                    term.isDefault ? 'text-emerald-600' : 'text-blue-600'
                                }`} />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">{term.nameAr}</h3>
                                {term.isDefault && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                        <Star className="h-3 w-3 ms-1 fill-current" />
                                        افتراضي
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-500" dir="ltr">{term.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Switch
                            checked={term.isActive}
                            onCheckedChange={() => onToggleActive(term)}
                            disabled={isUpdating}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(term)}>
                                    <Edit className="h-4 w-4 ms-2" aria-hidden="true" />
                                    تعديل
                                </DropdownMenuItem>
                                {!term.isDefault && (
                                    <DropdownMenuItem onClick={() => onSetDefault(term._id)}>
                                        <Star className="h-4 w-4 ms-2" />
                                        تعيين كافتراضي
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => onDelete(term._id)}
                                    className="text-red-600"
                                    disabled={term.isDefault}
                                >
                                    <Trash2 className="h-4 w-4 ms-2" />
                                    حذف
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Due Days */}
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                            الاستحقاق بعد <strong className="text-navy">{term.dueDays}</strong> يوم
                        </span>
                    </div>

                    {/* Early Payment Discount */}
                    {hasDiscount && (
                        <div className="flex items-center gap-2 text-sm">
                            <Percent className="h-4 w-4 text-green-600" />
                            <span className="text-slate-600">
                                خصم <strong className="text-green-600">{term.discountPercent}%</strong> للدفع خلال {term.discountDays} يوم
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    {term.descriptionAr && (
                        <p className="text-sm text-slate-500 pt-2 border-t">
                            {term.descriptionAr}
                        </p>
                    )}

                    {/* Preview */}
                    <div className="pt-3 mt-3 border-t">
                        <p className="text-xs text-slate-500 mb-1">معاينة:</p>
                        <div className="space-y-1">
                            {hasDiscount && (
                                <p className="text-xs text-green-600">
                                    • خصم حتى: {calculateDiscountDeadline(term.discountDays!)}
                                </p>
                            )}
                            <p className="text-xs text-slate-600">
                                • الاستحقاق: {calculateDueDate(term.dueDays)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
