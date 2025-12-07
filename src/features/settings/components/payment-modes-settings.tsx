import { useState } from 'react'
import {
    CreditCard, Plus, MoreHorizontal, Trash2,
    Edit, Loader2, Star, Wallet, Building2, Banknote
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { usePaymentModes, useCreatePaymentMode, useUpdatePaymentMode, useDeletePaymentMode, useSetDefaultPaymentMode } from '@/hooks/useBillingSettings'
import { Skeleton } from '@/components/ui/skeleton'
import type { PaymentMode } from '@/services/billingSettingsService'

const iconOptions = [
    { value: 'credit-card', label: 'بطاقة ائتمان', icon: CreditCard },
    { value: 'wallet', label: 'محفظة', icon: Wallet },
    { value: 'building', label: 'بنك', icon: Building2 },
    { value: 'banknote', label: 'نقدي', icon: Banknote },
]

const getIcon = (iconName?: string) => {
    const found = iconOptions.find(i => i.value === iconName)
    return found?.icon || CreditCard
}

export default function PaymentModesSettings() {
    const { data: modesData, isLoading } = usePaymentModes()
    const createModeMutation = useCreatePaymentMode()
    const updateModeMutation = useUpdatePaymentMode()
    const deleteModeMutation = useDeletePaymentMode()
    const setDefaultMutation = useSetDefaultPaymentMode()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMode, setEditingMode] = useState<PaymentMode | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        icon: 'credit-card',
        isEnabled: true,
    })

    const modes = modesData?.paymentModes || []

    const handleOpenDialog = (mode?: PaymentMode) => {
        if (mode) {
            setEditingMode(mode)
            setFormData({
                name: mode.name,
                nameAr: mode.nameAr,
                description: mode.description || '',
                descriptionAr: mode.descriptionAr || '',
                icon: mode.icon || 'credit-card',
                isEnabled: mode.isEnabled,
            })
        } else {
            setEditingMode(null)
            setFormData({
                name: '',
                nameAr: '',
                description: '',
                descriptionAr: '',
                icon: 'credit-card',
                isEnabled: true,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingMode(null)
        setFormData({
            name: '',
            nameAr: '',
            description: '',
            descriptionAr: '',
            icon: 'credit-card',
            isEnabled: true,
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingMode) {
            await updateModeMutation.mutateAsync({
                id: editingMode._id,
                data: formData
            })
        } else {
            await createModeMutation.mutateAsync(formData)
        }
        handleCloseDialog()
    }

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟')) {
            await deleteModeMutation.mutateAsync(id)
        }
    }

    const handleSetDefault = async (id: string) => {
        await setDefaultMutation.mutateAsync(id)
    }

    const handleToggleEnabled = async (mode: PaymentMode) => {
        await updateModeMutation.mutateAsync({
            id: mode._id,
            data: { isEnabled: !mode.isEnabled }
        })
    }

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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-32 rounded-3xl" />
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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-navy">طرق الدفع</h1>
                            <p className="text-slate-500">إدارة طرق الدفع المتاحة للعملاء</p>
                        </div>
                        <Button onClick={() => handleOpenDialog()} className="bg-brand-blue hover:bg-brand-blue/90">
                            <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                            إضافة طريقة دفع
                        </Button>
                    </div>

                    {/* Payment Modes Grid */}
                    {modes.length === 0 ? (
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardContent className="p-12 text-center">
                                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-navy mb-2">لا توجد طرق دفع</h3>
                                <p className="text-slate-500 mb-4">قم بإضافة طريقة دفع للبدء</p>
                                <Button onClick={() => handleOpenDialog()} variant="outline">
                                    <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                                    إضافة طريقة دفع
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modes.map((mode) => {
                                const IconComponent = getIcon(mode.icon)
                                return (
                                    <Card
                                        key={mode._id}
                                        className={`border-0 shadow-sm rounded-3xl transition-all ${
                                            !mode.isEnabled ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                                        mode.isDefault ? 'bg-emerald-100' : 'bg-slate-100'
                                                    }`}>
                                                        <IconComponent className={`h-6 w-6 ${
                                                            mode.isDefault ? 'text-emerald-600' : 'text-slate-600'
                                                        }`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-navy">{mode.nameAr}</h3>
                                                            {mode.isDefault && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                                                    <Star className="h-3 w-3 ms-1 fill-current" />
                                                                    افتراضي
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-500" dir="ltr">{mode.name}</p>
                                                        {mode.descriptionAr && (
                                                            <p className="text-sm text-slate-500 mt-1">{mode.descriptionAr}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={mode.isEnabled}
                                                        onCheckedChange={() => handleToggleEnabled(mode)}
                                                        disabled={updateModeMutation.isPending}
                                                    />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(mode)}>
                                                                <Edit className="h-4 w-4 ms-2" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            {!mode.isDefault && (
                                                                <DropdownMenuItem onClick={() => handleSetDefault(mode._id)}>
                                                                    <Star className="h-4 w-4 ms-2" />
                                                                    تعيين كافتراضي
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(mode._id)}
                                                                className="text-red-600"
                                                                disabled={mode.isDefault}
                                                            >
                                                                <Trash2 className="h-4 w-4 ms-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {/* Common Payment Methods Info */}
                    <Card className="border-0 shadow-sm rounded-3xl mt-6 bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-base">طرق الدفع الشائعة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Banknote className="h-4 w-4" />
                                    <span>نقدي</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Building2 className="h-4 w-4" />
                                    <span>تحويل بنكي</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <CreditCard className="h-4 w-4" />
                                    <span>بطاقة ائتمان</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Wallet className="h-4 w-4" />
                                    <span>شيك</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Main>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMode ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMode ? 'تعديل بيانات طريقة الدفع' : 'أدخل بيانات طريقة الدفع الجديدة'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">الاسم (إنجليزي)</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Bank Transfer"
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
                                        placeholder="تحويل بنكي"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">الأيقونة</Label>
                                <Select
                                    value={formData.icon}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {iconOptions.map((option) => {
                                            const Icon = option.icon
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" />
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">الوصف (إنجليزي)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Transfer to company bank account"
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
                                        placeholder="تحويل إلى حساب الشركة البنكي"
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="isEnabled">مفعّلة</Label>
                                <Switch
                                    id="isEnabled"
                                    checked={formData.isEnabled}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-blue hover:bg-brand-blue/90"
                                disabled={createModeMutation.isPending || updateModeMutation.isPending}
                            >
                                {(createModeMutation.isPending || updateModeMutation.isPending) ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : null}
                                {editingMode ? 'حفظ التغييرات' : 'إضافة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
