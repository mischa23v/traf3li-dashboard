import { useState, useEffect } from 'react'
import {
    FileText, Save, Hash, Calendar, Loader2,
    DollarSign, Receipt, ClipboardList, Globe
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useFinanceSettings, useUpdateFinanceSettings } from '@/hooks/useBillingSettings'
import { Skeleton } from '@/components/ui/skeleton'

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
                    <div className='ms-auto flex items-center space-x-4'>
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
                <div className='ms-auto flex items-center space-x-4'>
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
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 ml-2" />
                                )}
                                حفظ التغييرات
                            </Button>
                        </div>
                    </form>
                </div>
            </Main>
        </>
    )
}
