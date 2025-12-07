import { useState, useEffect } from 'react'
import {
    Building2, Save, Upload, Phone, Mail,
    MapPin, Globe, FileText, CreditCard, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useCompanySettings, useUpdateCompanySettings, useUpdateCompanyLogo } from '@/hooks/useBillingSettings'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function CompanySettings() {
    const { data: companyData, isLoading, isError } = useCompanySettings()
    const updateSettingsMutation = useUpdateCompanySettings()
    const updateLogoMutation = useUpdateCompanyLogo()

    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        email: '',
        phone: '',
        mobile: '',
        fax: '',
        website: '',
        address: '',
        addressAr: '',
        city: '',
        state: '',
        country: 'SA',
        postalCode: '',
        taxNumber: '',
        vatNumber: '',
        crNumber: '',
        bankName: '',
        bankNameAr: '',
        bankAccountNumber: '',
        iban: '',
        swiftCode: '',
    })

    useEffect(() => {
        if (companyData) {
            setFormData({
                name: companyData.name || '',
                nameAr: companyData.nameAr || '',
                email: companyData.email || '',
                phone: companyData.phone || '',
                mobile: companyData.mobile || '',
                fax: companyData.fax || '',
                website: companyData.website || '',
                address: companyData.address || '',
                addressAr: companyData.addressAr || '',
                city: companyData.city || '',
                state: companyData.state || '',
                country: companyData.country || 'SA',
                postalCode: companyData.postalCode || '',
                taxNumber: companyData.taxNumber || '',
                vatNumber: companyData.vatNumber || '',
                crNumber: companyData.crNumber || '',
                bankName: companyData.bankName || '',
                bankNameAr: companyData.bankNameAr || '',
                bankAccountNumber: companyData.bankAccountNumber || '',
                iban: companyData.iban || '',
                swiftCode: companyData.swiftCode || '',
            })
        }
    }, [companyData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateSettingsMutation.mutateAsync(formData)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            await updateLogoMutation.mutateAsync(file)
        }
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
                        <h1 className="text-2xl font-bold text-navy">بيانات الشركة</h1>
                        <p className="text-slate-500">إدارة معلومات الشركة التي تظهر في الفواتير والمستندات</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Logo */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                    شعار الشركة
                                </CardTitle>
                                <CardDescription>
                                    الشعار الذي يظهر في الفواتير والمستندات
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                        {companyData?.logo ? (
                                            <img
                                                src={companyData.logo}
                                                alt="Company Logo"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Building2 className="h-12 w-12 text-slate-500" />
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                            disabled={updateLogoMutation.isPending}
                                        >
                                            {updateLogoMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4 ms-2" aria-hidden="true" />
                                            )}
                                            رفع شعار جديد
                                        </Button>
                                        <p className="text-sm text-slate-500 mt-2">
                                            PNG, JPG حتى 2 ميجابايت
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Info */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-brand-blue" />
                                    المعلومات الأساسية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">اسم الشركة (إنجليزي)</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Company Name"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nameAr">اسم الشركة (عربي)</Label>
                                        <Input
                                            id="nameAr"
                                            name="nameAr"
                                            value={formData.nameAr}
                                            onChange={handleChange}
                                            placeholder="اسم الشركة"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-brand-blue" />
                                    معلومات الاتصال
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">البريد الإلكتروني</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="info@company.com"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">الهاتف</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+966 11 XXX XXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">الجوال</Label>
                                        <Input
                                            id="mobile"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="+966 5X XXX XXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">الموقع الإلكتروني</Label>
                                        <Input
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            placeholder="https://www.company.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-brand-blue" />
                                    العنوان
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">العنوان (إنجليزي)</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Street address"
                                            dir="ltr"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="addressAr">العنوان (عربي)</Label>
                                        <Textarea
                                            id="addressAr"
                                            name="addressAr"
                                            value={formData.addressAr}
                                            onChange={handleChange}
                                            placeholder="عنوان الشارع"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">المدينة</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="الرياض"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">الرمز البريدي</Label>
                                        <Input
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            placeholder="12345"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tax & Registration */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-brand-blue" />
                                    الأرقام الضريبية والتسجيل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vatNumber">الرقم الضريبي (VAT)</Label>
                                        <Input
                                            id="vatNumber"
                                            name="vatNumber"
                                            value={formData.vatNumber}
                                            onChange={handleChange}
                                            placeholder="300000000000003"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="crNumber">السجل التجاري</Label>
                                        <Input
                                            id="crNumber"
                                            name="crNumber"
                                            value={formData.crNumber}
                                            onChange={handleChange}
                                            placeholder="1010000000"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="taxNumber">رقم الملف الضريبي</Label>
                                        <Input
                                            id="taxNumber"
                                            name="taxNumber"
                                            value={formData.taxNumber}
                                            onChange={handleChange}
                                            placeholder="000000000"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bank Details */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-brand-blue" />
                                    معلومات البنك
                                </CardTitle>
                                <CardDescription>
                                    تظهر في الفواتير لتسهيل عملية الدفع
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bankName">اسم البنك (إنجليزي)</Label>
                                        <Input
                                            id="bankName"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            placeholder="Al Rajhi Bank"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankNameAr">اسم البنك (عربي)</Label>
                                        <Input
                                            id="bankNameAr"
                                            name="bankNameAr"
                                            value={formData.bankNameAr}
                                            onChange={handleChange}
                                            placeholder="بنك الراجحي"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                                        <Input
                                            id="iban"
                                            name="iban"
                                            value={formData.iban}
                                            onChange={handleChange}
                                            placeholder="SA0000000000000000000000"
                                            dir="ltr"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bankAccountNumber">رقم الحساب</Label>
                                        <Input
                                            id="bankAccountNumber"
                                            name="bankAccountNumber"
                                            value={formData.bankAccountNumber}
                                            onChange={handleChange}
                                            placeholder="0000000000"
                                            dir="ltr"
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
                </div>
            </Main>
        </>
    )
}
