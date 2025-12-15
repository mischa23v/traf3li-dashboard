import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Loader2, Hash } from 'lucide-react'
import { useCreateAccount, useUpdateAccount, useAccountTypes } from '@/hooks/useAccounting'
import { type Account, type AccountType, type AccountSubType } from '@/services/accountingService'
import { cn } from '@/lib/utils'

interface AccountFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    account?: Account
    accounts: Account[]
}

interface AccountFormData {
    code: string
    name: string
    nameAr: string
    type: AccountType
    subType: AccountSubType
    parentAccountId?: string
    description?: string
    isActive: boolean
    openingBalance?: number
}

export function AccountFormDialog({
    open,
    onOpenChange,
    account,
    accounts = []
}: AccountFormDialogProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const [autoGenerateCode, setAutoGenerateCode] = useState(!account)

    const createAccountMutation = useCreateAccount()
    const updateAccountMutation = useUpdateAccount()
    const { data: accountTypesData } = useAccountTypes()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<AccountFormData>({
        defaultValues: {
            code: account?.code || '',
            name: account?.name || '',
            nameAr: account?.nameAr || '',
            type: account?.type || 'asset',
            subType: account?.subType || 'current_asset',
            parentAccountId: account?.parentAccountId || '',
            description: account?.description || '',
            isActive: account?.isActive ?? true,
            openingBalance: 0
        }
    })

    const selectedType = watch('type')
    const selectedParentId = watch('parentAccountId')

    // Auto-generate account code
    useEffect(() => {
        if (autoGenerateCode && !account) {
            const type = watch('type')
            const subType = watch('subType')
            const existingCodes = accounts
                .filter(acc => acc.type === type)
                .map(acc => acc.code)
                .filter(Boolean)

            // Generate code based on type
            const typePrefix = {
                asset: '1',
                liability: '2',
                equity: '3',
                income: '4',
                expense: '5'
            }[type] || '1'

            // Find next available code
            let nextNumber = 1000
            let newCode = `${typePrefix}${nextNumber}`
            while (existingCodes.includes(newCode)) {
                nextNumber++
                newCode = `${typePrefix}${nextNumber}`
            }

            setValue('code', newCode)
        }
    }, [selectedType, autoGenerateCode, account, accounts, watch, setValue])

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            if (account) {
                reset({
                    code: account.code,
                    name: account.name,
                    nameAr: account.nameAr,
                    type: account.type,
                    subType: account.subType,
                    parentAccountId: account.parentAccountId || '',
                    description: account.description || '',
                    isActive: account.isActive,
                    openingBalance: 0
                })
                setAutoGenerateCode(false)
            } else {
                reset({
                    code: '',
                    name: '',
                    nameAr: '',
                    type: 'asset',
                    subType: 'current_asset',
                    parentAccountId: '',
                    description: '',
                    isActive: true,
                    openingBalance: 0
                })
                setAutoGenerateCode(true)
            }
        }
    }, [open, account, reset])

    // Get available subtypes based on selected type
    const availableSubTypes = useMemo(() => {
        if (!accountTypesData?.subTypes) return []
        return accountTypesData.subTypes[selectedType] || []
    }, [selectedType, accountTypesData])

    // Update subType when type changes
    useEffect(() => {
        if (availableSubTypes.length > 0 && !account) {
            setValue('subType', availableSubTypes[0])
        }
    }, [availableSubTypes, account, setValue])

    // Get available parent accounts (same type, excluding current account if editing)
    const availableParentAccounts = useMemo(() => {
        return accounts.filter(acc =>
            acc.type === selectedType &&
            acc._id !== account?._id &&
            !acc.parentAccountId // Only show root accounts as potential parents
        )
    }, [accounts, selectedType, account])

    const onSubmit = async (data: AccountFormData) => {
        try {
            const payload = {
                code: data.code,
                name: data.name,
                nameAr: data.nameAr,
                type: data.type,
                subType: data.subType,
                parentAccountId: data.parentAccountId || undefined,
                description: data.description,
                isActive: data.isActive,
            }

            if (account) {
                await updateAccountMutation.mutateAsync({
                    id: account._id,
                    data: payload
                })
            } else {
                await createAccountMutation.mutateAsync({
                    ...payload,
                    // Opening balance would be handled separately via journal entry
                })
            }

            onOpenChange(false)
        } catch (error) {
            console.error('Failed to save account:', error)
        }
    }

    // Get subtype label
    const getSubTypeLabel = (subType: AccountSubType) => {
        const labels: Record<AccountSubType, { ar: string; en: string }> = {
            current_asset: { ar: 'أصول متداولة', en: 'Current Asset' },
            fixed_asset: { ar: 'أصول ثابتة', en: 'Fixed Asset' },
            bank: { ar: 'بنك', en: 'Bank' },
            cash: { ar: 'نقدية', en: 'Cash' },
            receivable: { ar: 'ذمم مدينة', en: 'Receivable' },
            current_liability: { ar: 'التزامات متداولة', en: 'Current Liability' },
            long_term_liability: { ar: 'التزامات طويلة الأجل', en: 'Long-term Liability' },
            payable: { ar: 'ذمم دائنة', en: 'Payable' },
            operating_income: { ar: 'إيرادات تشغيلية', en: 'Operating Income' },
            other_income: { ar: 'إيرادات أخرى', en: 'Other Income' },
            operating_expense: { ar: 'مصروفات تشغيلية', en: 'Operating Expense' },
            administrative: { ar: 'مصروفات إدارية', en: 'Administrative' },
            cost_of_sales: { ar: 'تكلفة المبيعات', en: 'Cost of Sales' },
        }
        return isRTL ? labels[subType]?.ar : labels[subType]?.en
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {account
                            ? (isRTL ? 'تعديل الحساب' : 'Edit Account')
                            : (isRTL ? 'حساب جديد' : 'New Account')
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {account
                            ? (isRTL ? 'تعديل بيانات الحساب' : 'Modify account details')
                            : (isRTL ? 'إضافة حساب جديد إلى دليل الحسابات' : 'Add a new account to the chart of accounts')
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Account Code */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="code">
                                {isRTL ? 'رمز الحساب' : 'Account Code'}
                                <span className="text-red-500 ms-1">*</span>
                            </Label>
                            {!account && (
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="auto-generate"
                                        checked={autoGenerateCode}
                                        onCheckedChange={setAutoGenerateCode}
                                    />
                                    <Label htmlFor="auto-generate" className="text-xs text-slate-600 cursor-pointer">
                                        {isRTL ? 'توليد تلقائي' : 'Auto-generate'}
                                    </Label>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="code"
                                {...register('code', { required: isRTL ? 'رمز الحساب مطلوب' : 'Account code is required' })}
                                placeholder={isRTL ? 'مثال: 1000' : 'e.g., 1000'}
                                className="ps-9 font-mono"
                                disabled={autoGenerateCode && !account}
                            />
                        </div>
                        {errors.code && (
                            <p className="text-sm text-red-500">{errors.code.message}</p>
                        )}
                    </div>

                    {/* Account Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {isRTL ? 'اسم الحساب (إنجليزي)' : 'Account Name (English)'}
                                <span className="text-red-500 ms-1">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name', { required: isRTL ? 'اسم الحساب مطلوب' : 'Account name is required' })}
                                placeholder={isRTL ? 'اسم الحساب بالإنجليزية' : 'Account name in English'}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nameAr">
                                {isRTL ? 'اسم الحساب (عربي)' : 'Account Name (Arabic)'}
                                <span className="text-red-500 ms-1">*</span>
                            </Label>
                            <Input
                                id="nameAr"
                                {...register('nameAr', { required: isRTL ? 'اسم الحساب بالعربية مطلوب' : 'Arabic account name is required' })}
                                placeholder={isRTL ? 'اسم الحساب بالعربية' : 'Account name in Arabic'}
                                dir="rtl"
                            />
                            {errors.nameAr && (
                                <p className="text-sm text-red-500">{errors.nameAr.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Account Type and SubType */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">
                                {isRTL ? 'نوع الحساب' : 'Account Type'}
                                <span className="text-red-500 ms-1">*</span>
                            </Label>
                            <Select
                                value={watch('type')}
                                onValueChange={(value) => setValue('type', value as AccountType)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asset">
                                        {isRTL ? 'أصول' : 'Asset'}
                                    </SelectItem>
                                    <SelectItem value="liability">
                                        {isRTL ? 'التزامات' : 'Liability'}
                                    </SelectItem>
                                    <SelectItem value="equity">
                                        {isRTL ? 'حقوق ملكية' : 'Equity'}
                                    </SelectItem>
                                    <SelectItem value="income">
                                        {isRTL ? 'إيرادات' : 'Income'}
                                    </SelectItem>
                                    <SelectItem value="expense">
                                        {isRTL ? 'مصروفات' : 'Expense'}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subType">
                                {isRTL ? 'نوع فرعي' : 'Sub Type'}
                                <span className="text-red-500 ms-1">*</span>
                            </Label>
                            <Select
                                value={watch('subType')}
                                onValueChange={(value) => setValue('subType', value as AccountSubType)}
                            >
                                <SelectTrigger id="subType">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSubTypes.map((subType) => (
                                        <SelectItem key={subType} value={subType}>
                                            {getSubTypeLabel(subType)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Parent Account */}
                    <div className="space-y-2">
                        <Label htmlFor="parentAccountId">
                            {isRTL ? 'الحساب الرئيسي' : 'Parent Account'}
                        </Label>
                        <Select
                            value={watch('parentAccountId') || 'none'}
                            onValueChange={(value) => setValue('parentAccountId', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="parentAccountId">
                                <SelectValue placeholder={isRTL ? 'لا يوجد (حساب رئيسي)' : 'None (Root Account)'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    {isRTL ? 'لا يوجد (حساب رئيسي)' : 'None (Root Account)'}
                                </SelectItem>
                                {availableParentAccounts.map((acc) => (
                                    <SelectItem key={acc._id} value={acc._id}>
                                        <span className="font-mono text-xs text-slate-500 me-2">{acc.code}</span>
                                        {isRTL ? acc.nameAr : acc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                            {isRTL
                                ? 'اختر حساباً رئيسياً لإنشاء حساب فرعي'
                                : 'Select a parent account to create a sub-account'
                            }
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {isRTL ? 'الوصف' : 'Description'}
                        </Label>
                        <Input
                            id="description"
                            {...register('description')}
                            placeholder={isRTL ? 'وصف اختياري للحساب' : 'Optional account description'}
                        />
                    </div>

                    {/* Opening Balance (only for new accounts) */}
                    {!account && (
                        <div className="space-y-2">
                            <Label htmlFor="openingBalance">
                                {isRTL ? 'الرصيد الافتتاحي' : 'Opening Balance'}
                            </Label>
                            <Input
                                id="openingBalance"
                                type="number"
                                step="0.01"
                                {...register('openingBalance', { valueAsNumber: true })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-slate-500">
                                {isRTL
                                    ? 'سيتم إنشاء قيد يومية للرصيد الافتتاحي إذا كان أكبر من صفر'
                                    : 'A journal entry will be created for the opening balance if greater than zero'
                                }
                            </p>
                        </div>
                    )}

                    {/* Is Active */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                            <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
                                {isRTL ? 'حساب نشط' : 'Active Account'}
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">
                                {isRTL
                                    ? 'الحسابات غير النشطة لن تظهر في القوائم الافتراضية'
                                    : 'Inactive accounts will not appear in default lists'
                                }
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={watch('isActive')}
                            onCheckedChange={(checked) => setValue('isActive', checked)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    {account
                                        ? (isRTL ? 'تحديث' : 'Update')
                                        : (isRTL ? 'إنشاء' : 'Create')
                                    }
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
