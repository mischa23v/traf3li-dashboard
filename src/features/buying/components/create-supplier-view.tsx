/**
 * Create Supplier View
 * Form for creating new suppliers in the Buying module
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  CreditCard,
  FileText,
  Loader2,
  Globe,
  Lock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'

import { useCreateSupplier } from '@/hooks/use-buying'
import { BuyingSidebar } from './buying-sidebar'
import type { CreateSupplierData, SupplierType, SupplierStatus } from '@/types/buying'

// Extended form data to include additional fields
interface SupplierFormData extends CreateSupplierData {
  mobile?: string
  website?: string
  postalCode?: string
  bankName?: string
  bankAccountNo?: string
  iban?: string
}

export function CreateSupplierView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createSupplierMutation = useCreateSupplier()

  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    nameAr: '',
    supplierType: 'company',
    taxId: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    address: '',
    city: '',
    region: '',
    country: 'السعودية',
    postalCode: '',
    bankName: '',
    bankAccountNo: '',
    iban: '',
    paymentTerms: '',
    currency: 'SAR',
    status: 'active',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('buying.validation.nameRequired', 'اسم المورد مطلوب')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('buying.validation.invalidEmail', 'بريد إلكتروني غير صالح')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SupplierFormData, value: string | SupplierType | SupplierStatus) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Prepare data for API - remove extended fields not in CreateSupplierData
    const { mobile, website, postalCode, bankName, bankAccountNo, iban, ...apiData } = formData

    try {
      await createSupplierMutation.mutateAsync(apiData)
      navigate({ to: '/dashboard/buying' })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const topNav = [
    { title: t('buying.overview', 'نظرة عامة'), href: '/dashboard/buying', isActive: false },
    { title: t('buying.suppliers', 'الموردين'), href: '/dashboard/buying/suppliers', isActive: false },
    { title: t('buying.createSupplier', 'إضافة مورد جديد'), href: '/dashboard/buying/suppliers/create', isActive: true },
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
          badge={t('buying.badge', 'المشتريات')}
          title={t('buying.createSupplier', 'إضافة مورد جديد')}
          type="buying"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.basicInfo', 'المعلومات الأساسية')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.supplierNameEn', 'اسم المورد (إنجليزي)')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Supplier Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nameAr" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.supplierNameAr', 'اسم المورد (عربي)')}
                      </Label>
                      <Input
                        id="nameAr"
                        placeholder="اسم المورد"
                        value={formData.nameAr}
                        onChange={(e) => handleInputChange('nameAr', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplierType" className="text-sm font-medium text-slate-700">
                        {t('buying.supplierType', 'نوع المورد')}
                      </Label>
                      <Select
                        value={formData.supplierType}
                        onValueChange={(v) => handleInputChange('supplierType', v as SupplierType)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">{t('buying.company', 'شركة')}</SelectItem>
                          <SelectItem value="individual">{t('buying.individual', 'فرد')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.taxId', 'الرقم الضريبي')}
                      </Label>
                      <Input
                        id="taxId"
                        placeholder="300000000000003"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.contactInfo', 'معلومات الاتصال')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.email', 'البريد الإلكتروني')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="supplier@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                          errors.email ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.phone', 'رقم الهاتف')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+966 5xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.mobile', 'رقم الجوال')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                      </Label>
                      <Input
                        id="mobile"
                        placeholder="+966 5xxxxxxxx"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.website', 'الموقع الإلكتروني')}
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.addressInfo', 'معلومات العنوان')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                        {t('buying.address', 'العنوان')}
                      </Label>
                      <Input
                        id="address"
                        placeholder="الشارع، الحي، المبنى"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                        {t('buying.city', 'المدينة')}
                      </Label>
                      <Input
                        id="city"
                        placeholder="الرياض"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-medium text-slate-700">
                        {t('buying.region', 'المنطقة')}
                      </Label>
                      <Input
                        id="region"
                        placeholder="منطقة الرياض"
                        value={formData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                        {t('buying.country', 'الدولة')}
                      </Label>
                      <Input
                        id="country"
                        placeholder="السعودية"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700">
                        {t('buying.postalCode', 'الرمز البريدي')}
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder="12345"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.bankingInfo', 'المعلومات البنكية')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium text-slate-700">
                        {t('buying.bankName', 'اسم البنك')}
                      </Label>
                      <Input
                        id="bankName"
                        placeholder="مثال: البنك الأهلي"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNo" className="text-sm font-medium text-slate-700">
                        {t('buying.bankAccountNo', 'رقم الحساب البنكي')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                      </Label>
                      <Input
                        id="bankAccountNo"
                        placeholder="12345678"
                        value={formData.bankAccountNo}
                        onChange={(e) => handleInputChange('bankAccountNo', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="iban" className="text-sm font-medium text-slate-700">
                        {t('buying.iban', 'رقم الآيبان (IBAN)')}<Lock className="h-3 w-3 text-muted-foreground inline ms-1" />
                      </Label>
                      <Input
                        id="iban"
                        placeholder="SA00 0000 0000 0000 0000 0000"
                        value={formData.iban}
                        onChange={(e) => handleInputChange('iban', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Terms & Currency */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.termsAndCurrency', 'شروط الدفع والعملة')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms" className="text-sm font-medium text-slate-700">
                        {t('buying.paymentTerms', 'شروط الدفع')}
                      </Label>
                      <Input
                        id="paymentTerms"
                        placeholder="مثال: 30 يوم من تاريخ الفاتورة"
                        value={formData.paymentTerms}
                        onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                        {t('buying.currency', 'العملة')}
                      </Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => handleInputChange('currency', v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">{t('buying.currencySAR', 'ريال سعودي (SAR)')}</SelectItem>
                          <SelectItem value="USD">{t('buying.currencyUSD', 'دولار أمريكي (USD)')}</SelectItem>
                          <SelectItem value="EUR">{t('buying.currencyEUR', 'يورو (EUR)')}</SelectItem>
                          <SelectItem value="AED">{t('buying.currencyAED', 'درهم إماراتي (AED)')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                        {t('buying.status', 'الحالة')}
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => handleInputChange('status', v as SupplierStatus)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('buying.statusActive', 'نشط')}</SelectItem>
                          <SelectItem value="inactive">{t('buying.statusInactive', 'غير نشط')}</SelectItem>
                          <SelectItem value="blocked">{t('buying.statusBlocked', 'محظور')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.notes', 'ملاحظات')}
                  </h3>

                  <div className="space-y-2">
                    <Textarea
                      id="notes"
                      placeholder={t('buying.notesPlaceholder', 'أي ملاحظات إضافية حول المورد...')}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-500 hover:text-navy rounded-xl"
                    onClick={() => navigate({ to: '/dashboard/buying' })}
                  >
                    {t('common.cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={createSupplierMutation.isPending}
                  >
                    {createSupplierMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        {t('common.saving', 'جاري الحفظ...')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" aria-hidden="true" />
                        {t('buying.saveSupplier', 'حفظ المورد')}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <BuyingSidebar />
        </div>
      </Main>
    </>
  )
}
