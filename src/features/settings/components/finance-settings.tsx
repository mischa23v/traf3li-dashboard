import { useState, useEffect } from 'react'
import {
    FileText, Save, Hash, Calendar, Loader2,
    DollarSign, Receipt, ClipboardList, Globe,
    Building2, Wallet, TrendingUp, TrendingDown,
    ChevronDown, Plus, Pencil, Trash2, Settings2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useFinanceSettings, useUpdateFinanceSettings } from '@/hooks/useBillingSettings'
import {
    useAccounts,
    useAccountTypes,
    useCreateAccount,
    useUpdateAccount,
    useDeleteAccount,
    usePriceLevels,
    useCreatePriceLevel,
    useUpdatePriceLevel,
    useDeletePriceLevel,
    useSetDefaultPriceLevel,
} from '@/hooks/useAccounting'
import { Account, AccountType, AccountSubType, PriceLevel } from '@/services/accountingService'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSAR } from '@/lib/currency'

const currencies = [
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
    { value: 'AED', label: 'درهم إماراتي (AED)' },
]

export default function FinanceSettings() {
    const { data: settingsData, isLoading } = useFinanceSettings()
    const updateSettingsMutation = useUpdateFinanceSettings()

    const [formData, setFormData] = useState({
        invoicePrefix: 'INV-',
        quotePrefix: 'QOT-',
        paymentPrefix: 'PAY-',
        lastInvoiceNumber: 1,
        lastQuoteNumber: 1,
        lastPaymentNumber: 1,
        defaultCurrency: 'SAR',
        currencySymbolPosition: 'before' as 'before' | 'after',
        decimalSeparator: '.',
        thousandSeparator: ',',
        decimalPlaces: 2,
        invoiceFooterText: '',
        invoiceFooterTextAr: '',
        quoteFooterText: '',
        quoteFooterTextAr: '',
        invoiceTerms: '',
        invoiceTermsAr: '',
        showProductTax: true,
        includeYearInNumber: true,
    })

    useEffect(() => {
        if (settingsData) {
            setFormData({
                invoicePrefix: settingsData.invoicePrefix || 'INV-',
                quotePrefix: settingsData.quotePrefix || 'QOT-',
                paymentPrefix: settingsData.paymentPrefix || 'PAY-',
                lastInvoiceNumber: settingsData.lastInvoiceNumber || 1,
                lastQuoteNumber: settingsData.lastQuoteNumber || 1,
                lastPaymentNumber: settingsData.lastPaymentNumber || 1,
                defaultCurrency: settingsData.defaultCurrency || 'SAR',
                currencySymbolPosition: settingsData.currencySymbolPosition || 'before',
                decimalSeparator: settingsData.decimalSeparator || '.',
                thousandSeparator: settingsData.thousandSeparator || ',',
                decimalPlaces: settingsData.decimalPlaces || 2,
                invoiceFooterText: settingsData.invoiceFooterText || '',
                invoiceFooterTextAr: settingsData.invoiceFooterTextAr || '',
                quoteFooterText: settingsData.quoteFooterText || '',
                quoteFooterTextAr: settingsData.quoteFooterTextAr || '',
                invoiceTerms: settingsData.invoiceTerms || '',
                invoiceTermsAr: settingsData.invoiceTermsAr || '',
                showProductTax: settingsData.showProductTax ?? true,
                includeYearInNumber: settingsData.includeYearInNumber ?? true,
            })
        }
    }, [settingsData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }))
    }

    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateSettingsMutation.mutateAsync(formData)
    }

    const getNextNumber = (prefix: string, lastNumber: number, includeYear: boolean) => {
        const year = includeYear ? new Date().getFullYear() + '-' : ''
        return `${prefix}${year}${String(lastNumber).padStart(4, '0')}`
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
                        <Skeleton className="h-[600px] w-full rounded-3xl" />
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
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-navy">إعدادات الفواتير والمالية</h1>
                        <p className="text-slate-500">تخصيص أرقام الفواتير والعملات والإعدادات المالية</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Document Numbering */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hash className="h-5 w-5 text-brand-blue" />
                                    ترقيم المستندات
                                </CardTitle>
                                <CardDescription>
                                    إعداد البادئة والترقيم التلقائي للفواتير وعروض الأسعار والمدفوعات
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>تضمين السنة في الرقم</Label>
                                        <p className="text-sm text-slate-500">مثال: INV-2025-0001</p>
                                    </div>
                                    <Switch
                                        checked={formData.includeYearInNumber}
                                        onCheckedChange={(checked) => handleSwitchChange('includeYearInNumber', checked)}
                                    />
                                </div>

                                {/* Invoice Numbering */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoicePrefix">بادئة الفاتورة</Label>
                                        <Input
                                            id="invoicePrefix"
                                            name="invoicePrefix"
                                            value={formData.invoicePrefix}
                                            onChange={handleChange}
                                            placeholder="INV-"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastInvoiceNumber">رقم آخر فاتورة</Label>
                                        <Input
                                            id="lastInvoiceNumber"
                                            name="lastInvoiceNumber"
                                            type="number"
                                            value={formData.lastInvoiceNumber}
                                            onChange={handleChange}
                                            min="1"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الفاتورة التالية</Label>
                                        <div className="h-10 px-3 py-2 bg-white rounded-md border text-sm flex items-center font-mono" dir="ltr">
                                            {getNextNumber(formData.invoicePrefix, formData.lastInvoiceNumber + 1, formData.includeYearInNumber)}
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Numbering */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="quotePrefix">بادئة عرض السعر</Label>
                                        <Input
                                            id="quotePrefix"
                                            name="quotePrefix"
                                            value={formData.quotePrefix}
                                            onChange={handleChange}
                                            placeholder="QOT-"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastQuoteNumber">رقم آخر عرض</Label>
                                        <Input
                                            id="lastQuoteNumber"
                                            name="lastQuoteNumber"
                                            type="number"
                                            value={formData.lastQuoteNumber}
                                            onChange={handleChange}
                                            min="1"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>عرض السعر التالي</Label>
                                        <div className="h-10 px-3 py-2 bg-white rounded-md border text-sm flex items-center font-mono" dir="ltr">
                                            {getNextNumber(formData.quotePrefix, formData.lastQuoteNumber + 1, formData.includeYearInNumber)}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Numbering */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentPrefix">بادئة المدفوعات</Label>
                                        <Input
                                            id="paymentPrefix"
                                            name="paymentPrefix"
                                            value={formData.paymentPrefix}
                                            onChange={handleChange}
                                            placeholder="PAY-"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastPaymentNumber">رقم آخر دفعة</Label>
                                        <Input
                                            id="lastPaymentNumber"
                                            name="lastPaymentNumber"
                                            type="number"
                                            value={formData.lastPaymentNumber}
                                            onChange={handleChange}
                                            min="1"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الدفعة التالية</Label>
                                        <div className="h-10 px-3 py-2 bg-white rounded-md border text-sm flex items-center font-mono" dir="ltr">
                                            {getNextNumber(formData.paymentPrefix, formData.lastPaymentNumber + 1, formData.includeYearInNumber)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Currency Settings */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-brand-blue" />
                                    إعدادات العملة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultCurrency">العملة الافتراضية</Label>
                                        <Select
                                            value={formData.defaultCurrency}
                                            onValueChange={(value) => handleSelectChange('defaultCurrency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر العملة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem key={currency.value} value={currency.value}>
                                                        {currency.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currencySymbolPosition">موضع رمز العملة</Label>
                                        <Select
                                            value={formData.currencySymbolPosition}
                                            onValueChange={(value) => handleSelectChange('currencySymbolPosition', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="before">قبل المبلغ (SAR 100)</SelectItem>
                                                <SelectItem value="after">بعد المبلغ (100 SAR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="decimalPlaces">عدد الخانات العشرية</Label>
                                        <Select
                                            value={String(formData.decimalPlaces)}
                                            onValueChange={(value) => handleSelectChange('decimalPlaces', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">بدون (100)</SelectItem>
                                                <SelectItem value="2">خانتين (100.00)</SelectItem>
                                                <SelectItem value="3">ثلاث خانات (100.000)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="thousandSeparator">فاصل الآلاف</Label>
                                        <Select
                                            value={formData.thousandSeparator}
                                            onValueChange={(value) => handleSelectChange('thousandSeparator', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=",">فاصلة (1,000)</SelectItem>
                                                <SelectItem value=".">نقطة (1.000)</SelectItem>
                                                <SelectItem value=" ">مسافة (1 000)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <Label>إظهار الضريبة لكل منتج</Label>
                                        <p className="text-sm text-slate-500">عرض مبلغ الضريبة بجانب كل بند</p>
                                    </div>
                                    <Switch
                                        checked={formData.showProductTax}
                                        onCheckedChange={(checked) => handleSwitchChange('showProductTax', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer Text */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-brand-blue" />
                                    نصوص تذييل المستندات
                                </CardTitle>
                                <CardDescription>
                                    النصوص التي تظهر أسفل الفواتير وعروض الأسعار
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceFooterText">تذييل الفاتورة (إنجليزي)</Label>
                                        <Textarea
                                            id="invoiceFooterText"
                                            name="invoiceFooterText"
                                            value={formData.invoiceFooterText}
                                            onChange={handleChange}
                                            placeholder="Thank you for your business"
                                            dir="ltr"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceFooterTextAr">تذييل الفاتورة (عربي)</Label>
                                        <Textarea
                                            id="invoiceFooterTextAr"
                                            name="invoiceFooterTextAr"
                                            value={formData.invoiceFooterTextAr}
                                            onChange={handleChange}
                                            placeholder="شكراً لتعاملكم معنا"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceTerms">شروط وأحكام (إنجليزي)</Label>
                                        <Textarea
                                            id="invoiceTerms"
                                            name="invoiceTerms"
                                            value={formData.invoiceTerms}
                                            onChange={handleChange}
                                            placeholder="Payment is due within 30 days"
                                            dir="ltr"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceTermsAr">شروط وأحكام (عربي)</Label>
                                        <Textarea
                                            id="invoiceTermsAr"
                                            name="invoiceTermsAr"
                                            value={formData.invoiceTermsAr}
                                            onChange={handleChange}
                                            placeholder="الدفع مستحق خلال 30 يوم"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-brand-blue hover:bg-brand-blue/90"
                                disabled={updateSettingsMutation.isPending}
                            >
                                {updateSettingsMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حفظ التغييرات
                            </Button>
                        </div>
                    </form>

                    {/* Advanced Settings (Hidden Accounting) */}
                    <Card className="border-0 shadow-sm rounded-3xl mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-brand-blue" />
                                الإعدادات المتقدمة
                            </CardTitle>
                            <CardDescription>
                                إعدادات دفتر الحسابات ومستويات الأسعار (للمحاسبين)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdvancedAccountingSettings />
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    )
}

// ==================== ADVANCED ACCOUNTING SETTINGS ====================

function AdvancedAccountingSettings() {
    const { data: accountTypesData } = useAccountTypes()
    const { data: bankAccounts, isLoading: loadingBanks } = useAccounts({ type: 'asset', subType: 'bank' })
    const { data: incomeAccounts, isLoading: loadingIncome } = useAccounts({ type: 'income' })
    const { data: expenseAccounts, isLoading: loadingExpenses } = useAccounts({ type: 'expense' })
    const { data: priceLevels, isLoading: loadingPriceLevels } = usePriceLevels()

    const typeLabels: Record<AccountType, string> = {
        asset: 'أصول',
        liability: 'خصوم',
        equity: 'حقوق ملكية',
        income: 'إيرادات',
        expense: 'مصروفات',
    }

    const subTypeLabels: Record<AccountSubType, string> = {
        current_asset: 'أصول متداولة',
        fixed_asset: 'أصول ثابتة',
        bank: 'حسابات بنكية',
        cash: 'نقدية',
        receivable: 'مدينون',
        current_liability: 'خصوم متداولة',
        long_term_liability: 'خصوم طويلة الأجل',
        payable: 'دائنون',
        operating_income: 'إيرادات تشغيلية',
        other_income: 'إيرادات أخرى',
        operating_expense: 'مصروفات تشغيلية',
        administrative: 'مصروفات إدارية',
        cost_of_sales: 'تكلفة المبيعات',
    }

    return (
        <Accordion type="multiple" className="w-full">
            {/* Bank Accounts */}
            <AccordionItem value="banks">
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>البنوك</span>
                        <Badge variant="secondary" className="me-2">
                            {bankAccounts?.accounts?.length || 0}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <AccountsList
                        accounts={bankAccounts?.accounts || []}
                        isLoading={loadingBanks}
                        accountType="asset"
                        defaultSubType="bank"
                        typeLabels={typeLabels}
                        subTypeLabels={subTypeLabels}
                    />
                </AccordionContent>
            </AccordionItem>

            {/* Income Types */}
            <AccordionItem value="income-types">
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>أنواع الدخل</span>
                        <Badge variant="secondary" className="me-2">
                            {incomeAccounts?.accounts?.length || 0}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <AccountsList
                        accounts={incomeAccounts?.accounts || []}
                        isLoading={loadingIncome}
                        accountType="income"
                        defaultSubType="operating_income"
                        typeLabels={typeLabels}
                        subTypeLabels={subTypeLabels}
                    />
                </AccordionContent>
            </AccordionItem>

            {/* Expense Types */}
            <AccordionItem value="expense-types">
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span>أنواع المصروفات</span>
                        <Badge variant="secondary" className="me-2">
                            {expenseAccounts?.accounts?.length || 0}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <AccountsList
                        accounts={expenseAccounts?.accounts || []}
                        isLoading={loadingExpenses}
                        accountType="expense"
                        defaultSubType="operating_expense"
                        typeLabels={typeLabels}
                        subTypeLabels={subTypeLabels}
                    />
                </AccordionContent>
            </AccordionItem>

            {/* Price Levels */}
            <AccordionItem value="price-levels">
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-purple-600" />
                        <span>مستويات الأسعار</span>
                        <Badge variant="secondary" className="me-2">
                            {priceLevels?.length || 0}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <PriceLevelsList
                        priceLevels={priceLevels || []}
                        isLoading={loadingPriceLevels}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

// ==================== ACCOUNTS LIST COMPONENT ====================

interface AccountsListProps {
    accounts: Account[]
    isLoading: boolean
    accountType: AccountType
    defaultSubType: AccountSubType
    typeLabels: Record<AccountType, string>
    subTypeLabels: Record<AccountSubType, string>
}

function AccountsList({ accounts, isLoading, accountType, defaultSubType, typeLabels, subTypeLabels }: AccountsListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameAr: '',
        type: accountType,
        subType: defaultSubType,
        description: '',
        isActive: true,
    })

    const createAccountMutation = useCreateAccount()
    const updateAccountMutation = useUpdateAccount()
    const deleteAccountMutation = useDeleteAccount()

    const handleOpenDialog = (account?: Account) => {
        if (account) {
            setEditingAccount(account)
            setFormData({
                code: account.code,
                name: account.name,
                nameAr: account.nameAr,
                type: account.type,
                subType: account.subType,
                description: account.description || '',
                isActive: account.isActive,
            })
        } else {
            setEditingAccount(null)
            setFormData({
                code: '',
                name: '',
                nameAr: '',
                type: accountType,
                subType: defaultSubType,
                description: '',
                isActive: true,
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (editingAccount) {
            await updateAccountMutation.mutateAsync({
                id: editingAccount._id,
                data: formData,
            })
        } else {
            await createAccountMutation.mutateAsync(formData)
        }
        setIsDialogOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            await deleteAccountMutation.mutateAsync(id)
        }
    }

    if (isLoading) {
        return <Skeleton className="h-32 w-full" />
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => handleOpenDialog()}>
                            <Plus className="h-4 w-4 ms-1" aria-hidden="true" />
                            إضافة حساب
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}
                            </DialogTitle>
                            <DialogDescription>
                                أدخل بيانات الحساب
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>رقم الحساب</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="1102"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>النوع الفرعي</Label>
                                    <Select
                                        value={formData.subType}
                                        onValueChange={(value) => setFormData({ ...formData, subType: value as AccountSubType })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(subTypeLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>الاسم (عربي)</Label>
                                <Input
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                    placeholder="الحساب البنكي الرئيسي"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>الاسم (إنجليزي)</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Main Bank Account"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>الوصف</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="وصف الحساب..."
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>حساب نشط</Label>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                            >
                                {(createAccountMutation.isPending || updateAccountMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 ms-1 animate-spin" />
                                )}
                                {editingAccount ? 'تحديث' : 'إضافة'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {accounts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    لا توجد حسابات
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الرقم</TableHead>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account._id}>
                                <TableCell className="font-mono" dir="ltr">{account.code}</TableCell>
                                <TableCell>{account.nameAr || account.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {subTypeLabels[account.subType] || account.subType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {account.isActive ? (
                                        <Badge className="bg-green-100 text-green-700">نشط</Badge>
                                    ) : (
                                        <Badge variant="secondary">غير نشط</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(account)}
                                            disabled={account.isSystemAccount}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(account._id)}
                                            disabled={account.isSystemAccount}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

// ==================== PRICE LEVELS LIST COMPONENT ====================

interface PriceLevelsListProps {
    priceLevels: PriceLevel[]
    isLoading: boolean
}

function PriceLevelsList({ priceLevels, isLoading }: PriceLevelsListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingLevel, setEditingLevel] = useState<PriceLevel | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameAr: '',
        pricingType: 'percentage' as 'percentage' | 'fixed',
        percentageAdjustment: 0,
        fixedAdjustment: 0,
        minimumRevenue: 0,
        minimumCases: 0,
        priority: 1,
    })

    const createMutation = useCreatePriceLevel()
    const updateMutation = useUpdatePriceLevel()
    const deleteMutation = useDeletePriceLevel()
    const setDefaultMutation = useSetDefaultPriceLevel()

    const handleOpenDialog = (level?: PriceLevel) => {
        if (level) {
            setEditingLevel(level)
            setFormData({
                code: level.code,
                name: level.name,
                nameAr: level.nameAr,
                pricingType: level.pricingType === 'rate_table' ? 'percentage' : level.pricingType,
                percentageAdjustment: level.percentageAdjustment || 0,
                fixedAdjustment: level.fixedAdjustment || 0,
                minimumRevenue: level.minimumRevenue || 0,
                minimumCases: level.minimumCases || 0,
                priority: level.priority,
            })
        } else {
            setEditingLevel(null)
            setFormData({
                code: '',
                name: '',
                nameAr: '',
                pricingType: 'percentage',
                percentageAdjustment: 0,
                fixedAdjustment: 0,
                minimumRevenue: 0,
                minimumCases: 0,
                priority: 1,
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        const data = {
            code: formData.code,
            name: formData.name,
            nameAr: formData.nameAr,
            pricingType: formData.pricingType,
            percentageAdjustment: formData.pricingType === 'percentage' ? formData.percentageAdjustment : undefined,
            fixedAdjustment: formData.pricingType === 'fixed' ? formData.fixedAdjustment : undefined,
            minimumRevenue: formData.minimumRevenue || undefined,
            minimumCases: formData.minimumCases || undefined,
            priority: formData.priority,
        }

        if (editingLevel) {
            await updateMutation.mutateAsync({ id: editingLevel._id, data })
        } else {
            await createMutation.mutateAsync(data)
        }
        setIsDialogOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المستوى؟')) {
            await deleteMutation.mutateAsync(id)
        }
    }

    const handleSetDefault = async (id: string) => {
        await setDefaultMutation.mutateAsync(id)
    }

    if (isLoading) {
        return <Skeleton className="h-32 w-full" />
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => handleOpenDialog()}>
                            <Plus className="h-4 w-4 ms-1" aria-hidden="true" />
                            إضافة مستوى
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLevel ? 'تعديل مستوى السعر' : 'إضافة مستوى سعر جديد'}
                            </DialogTitle>
                            <DialogDescription>
                                تحديد مستويات الأسعار للعملاء المميزين
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>الرمز</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="PREMIUM"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>الأولوية</Label>
                                    <Input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>الاسم (عربي)</Label>
                                <Input
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                    placeholder="العملاء المميزين"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>الاسم (إنجليزي)</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Premium Clients"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>نوع التعديل</Label>
                                <Select
                                    value={formData.pricingType}
                                    onValueChange={(value) => setFormData({ ...formData, pricingType: value as 'percentage' | 'fixed' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.pricingType === 'percentage' ? (
                                <div className="space-y-2">
                                    <Label>نسبة التعديل (%)</Label>
                                    <Input
                                        type="number"
                                        value={formData.percentageAdjustment}
                                        onChange={(e) => setFormData({ ...formData, percentageAdjustment: parseFloat(e.target.value) || 0 })}
                                        placeholder="-10 للخصم، 10 للزيادة"
                                    />
                                    <p className="text-xs text-slate-500">
                                        قيمة سالبة للخصم، موجبة للزيادة
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>مبلغ التعديل (ر.س)</Label>
                                    <Input
                                        type="number"
                                        value={formData.fixedAdjustment}
                                        onChange={(e) => setFormData({ ...formData, fixedAdjustment: parseFloat(e.target.value) || 0 })}
                                        placeholder="-50 للخصم، 50 للزيادة"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>الحد الأدنى للإيرادات (ر.س)</Label>
                                    <Input
                                        type="number"
                                        value={formData.minimumRevenue}
                                        onChange={(e) => setFormData({ ...formData, minimumRevenue: parseFloat(e.target.value) || 0 })}
                                        placeholder="100000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>الحد الأدنى للقضايا</Label>
                                    <Input
                                        type="number"
                                        value={formData.minimumCases}
                                        onChange={(e) => setFormData({ ...formData, minimumCases: parseInt(e.target.value) || 0 })}
                                        placeholder="3"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {(createMutation.isPending || updateMutation.isPending) && (
                                    <Loader2 className="h-4 w-4 ms-1 animate-spin" />
                                )}
                                {editingLevel ? 'تحديث' : 'إضافة'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {priceLevels.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    لا توجد مستويات أسعار
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الرمز</TableHead>
                            <TableHead className="text-right">الاسم</TableHead>
                            <TableHead className="text-right">التعديل</TableHead>
                            <TableHead className="text-right">الشروط</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {priceLevels.map((level) => (
                            <TableRow key={level._id}>
                                <TableCell className="font-mono" dir="ltr">
                                    {level.code}
                                    {level.isDefault && (
                                        <Badge className="me-2 bg-brand-blue">افتراضي</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{level.nameAr || level.name}</TableCell>
                                <TableCell>
                                    {level.pricingType === 'percentage' ? (
                                        <span className={level.percentageAdjustment && level.percentageAdjustment < 0 ? 'text-green-600' : 'text-red-600'}>
                                            {level.percentageAdjustment}%
                                        </span>
                                    ) : (
                                        <span className={level.fixedAdjustment && level.fixedAdjustment < 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatSAR(level.fixedAdjustment || 0)}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-slate-500">
                                        {level.minimumRevenue && `إيرادات: ${formatSAR(level.minimumRevenue)}`}
                                        {level.minimumRevenue && level.minimumCases && ' | '}
                                        {level.minimumCases && `قضايا: ${level.minimumCases}`}
                                        {!level.minimumRevenue && !level.minimumCases && '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {!level.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefault(level._id)}
                                            >
                                                تعيين افتراضي
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(level)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(level._id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
