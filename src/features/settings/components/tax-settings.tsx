import { useState } from 'react'
import {
    Percent, Plus, MoreHorizontal, Trash2,
    Edit, CheckCircle, XCircle, Loader2, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useTaxes, useCreateTax, useUpdateTax, useDeleteTax, useSetDefaultTax } from '@/hooks/useBillingSettings'
import { Skeleton } from '@/components/ui/skeleton'
import type { Tax } from '@/services/billingSettingsService'

export default function TaxSettings() {
    const { data: taxesData, isLoading } = useTaxes()
    const createTaxMutation = useCreateTax()
    const updateTaxMutation = useUpdateTax()
    const deleteTaxMutation = useDeleteTax()
    const setDefaultMutation = useSetDefaultTax()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTax, setEditingTax] = useState<Tax | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        value: 15,
        isEnabled: true,
    })

    const taxes = taxesData?.taxes || []

    const handleOpenDialog = (tax?: Tax) => {
        if (tax) {
            setEditingTax(tax)
            setFormData({
                name: tax.name,
                nameAr: tax.nameAr,
                value: tax.value,
                isEnabled: tax.isEnabled,
            })
        } else {
            setEditingTax(null)
            setFormData({
                name: '',
                nameAr: '',
                value: 15,
                isEnabled: true,
            })
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingTax(null)
        setFormData({
            name: '',
            nameAr: '',
            value: 15,
            isEnabled: true,
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingTax) {
            await updateTaxMutation.mutateAsync({
                id: editingTax._id,
                data: formData
            })
        } else {
            await createTaxMutation.mutateAsync(formData)
        }
        handleCloseDialog()
    }

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذه الضريبة؟')) {
            await deleteTaxMutation.mutateAsync(id)
        }
    }

    const handleSetDefault = async (id: string) => {
        await setDefaultMutation.mutateAsync(id)
    }

    const handleToggleEnabled = async (tax: Tax) => {
        await updateTaxMutation.mutateAsync({
            id: tax._id,
            data: { isEnabled: !tax.isEnabled }
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
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
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
                            <h1 className="text-2xl font-bold text-navy">إعدادات الضرائب</h1>
                            <p className="text-slate-500">إدارة معدلات الضرائب المطبقة على الفواتير</p>
                        </div>
                        <Button onClick={() => handleOpenDialog()} className="bg-brand-blue hover:bg-brand-blue/90">
                            <Plus className="h-4 w-4 ms-2" />
                            إضافة ضريبة
                        </Button>
                    </div>

                    {/* Info Card */}
                    <Card className="border-0 shadow-sm rounded-3xl mb-6 bg-blue-50 border-blue-100">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Percent className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">ضريبة القيمة المضافة (VAT)</p>
                                    <p className="text-sm text-blue-700">
                                        معدل ضريبة القيمة المضافة في المملكة العربية السعودية هو 15%.
                                        يتم تطبيق الضريبة الافتراضية على جميع الفواتير تلقائياً.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Taxes Table */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Percent className="h-5 w-5 text-brand-blue" />
                                معدلات الضرائب
                            </CardTitle>
                            <CardDescription>
                                قائمة بجميع معدلات الضرائب المتاحة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {taxes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Percent className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-navy mb-2">لا توجد ضرائب</h3>
                                    <p className="text-slate-500 mb-4">قم بإضافة معدل ضريبة للبدء</p>
                                    <Button onClick={() => handleOpenDialog()} variant="outline">
                                        <Plus className="h-4 w-4 ms-2" />
                                        إضافة ضريبة
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>الاسم (عربي)</TableHead>
                                            <TableHead>الاسم (إنجليزي)</TableHead>
                                            <TableHead className="text-center">النسبة</TableHead>
                                            <TableHead className="text-center">الحالة</TableHead>
                                            <TableHead className="text-center">افتراضي</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {taxes.map((tax) => (
                                            <TableRow key={tax._id}>
                                                <TableCell className="font-medium">{tax.nameAr}</TableCell>
                                                <TableCell dir="ltr">{tax.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-mono">
                                                        {tax.value}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={tax.isEnabled}
                                                        onCheckedChange={() => handleToggleEnabled(tax)}
                                                        disabled={updateTaxMutation.isPending}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {tax.isDefault ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                            <Star className="h-3 w-3 ms-1 fill-current" />
                                                            افتراضي
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSetDefault(tax._id)}
                                                            disabled={setDefaultMutation.isPending}
                                                            className="text-xs"
                                                        >
                                                            تعيين كافتراضي
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(tax)}>
                                                                <Edit className="h-4 w-4 ms-2" />
                                                                تعديل
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(tax._id)}
                                                                className="text-red-600"
                                                                disabled={tax.isDefault}
                                                            >
                                                                <Trash2 className="h-4 w-4 ms-2" />
                                                                حذف
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTax ? 'تعديل الضريبة' : 'إضافة ضريبة جديدة'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTax ? 'تعديل بيانات الضريبة' : 'أدخل بيانات الضريبة الجديدة'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">الاسم (إنجليزي)</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="VAT"
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
                                    placeholder="ضريبة القيمة المضافة"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">نسبة الضريبة (%)</Label>
                                <Input
                                    id="value"
                                    name="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    dir="ltr"
                                    required
                                />
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
                                disabled={createTaxMutation.isPending || updateTaxMutation.isPending}
                            >
                                {(createTaxMutation.isPending || updateTaxMutation.isPending) ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : null}
                                {editingTax ? 'حفظ التغييرات' : 'إضافة'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
