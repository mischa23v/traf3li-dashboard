import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Building2, Calendar, BookOpen, DollarSign, Receipt, Landmark,
  Wallet, FileText, CreditCard, CheckCircle2, ChevronRight, ChevronLeft,
  Upload, Loader2, Check, Edit, ArrowRight, Sparkles, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import billingSettingsService from '@/services/billingSettingsService'
import { accountingService } from '@/services/accountingService'
import fiscalPeriodService from '@/services/fiscalPeriodService'
import currencyService from '@/services/currencyService'
import bankAccountService from '@/services/bankAccountService'
import { toast } from 'sonner'
import { isValidIban, isValidVatNumber, isValidCrNumber, errorMessages } from '@/utils/validation-patterns'

// Types for wizard data
interface WizardData {
  // Step 1: Company Info
  companyName: string
  companyNameAr: string
  crNumber: string
  vatNumber: string
  logo?: File | null

  // Step 2: Fiscal Year
  fiscalYearStart: string
  fiscalYearEnd: string
  currentPeriod: string

  // Step 3: Chart of Accounts
  accountTemplate: 'saudi' | 'ifrs' | 'custom'
  customizeAccounts: boolean

  // Step 4: Currency
  defaultCurrency: string
  enableMultiCurrency: boolean
  additionalCurrencies: string[]

  // Step 5: Tax Settings
  vatRate: number
  taxCalculation: 'inclusive' | 'exclusive'
  zatcaCompliance: boolean

  // Step 6: Bank Accounts
  bankName: string
  accountNumber: string
  iban: string
  addMoreLater: boolean

  // Step 7: Opening Balances
  asOfDate: string
  cashBalance: number
  bankBalance: number
  receivables: number
  payables: number
  detailedEntryLater: boolean

  // Step 8: Invoice Settings
  invoicePrefix: string
  invoiceStartNumber: number
  paymentTerms: number
  invoiceTemplate: string

  // Step 9: Payment Methods
  enableBankTransfer: boolean
  enableCash: boolean
  enableCreditCard: boolean
  enableOnlinePayments: boolean
  bankTransferDetails: string

  // Step 10: Review & Complete
  completed: boolean
}

const STORAGE_KEY = 'finance-setup-wizard-progress'

const defaultWizardData: WizardData = {
  companyName: '',
  companyNameAr: '',
  crNumber: '',
  vatNumber: '',
  logo: null,
  fiscalYearStart: '',
  fiscalYearEnd: '',
  currentPeriod: '',
  accountTemplate: 'saudi',
  customizeAccounts: false,
  defaultCurrency: 'SAR',
  enableMultiCurrency: false,
  additionalCurrencies: [],
  vatRate: 15,
  taxCalculation: 'inclusive',
  zatcaCompliance: true,
  bankName: '',
  accountNumber: '',
  iban: '',
  addMoreLater: true,
  asOfDate: new Date().toISOString().split('T')[0],
  cashBalance: 0,
  bankBalance: 0,
  receivables: 0,
  payables: 0,
  detailedEntryLater: true,
  invoicePrefix: 'INV',
  invoiceStartNumber: 1000,
  paymentTerms: 30,
  invoiceTemplate: 'standard',
  enableBankTransfer: true,
  enableCash: true,
  enableCreditCard: false,
  enableOnlinePayments: false,
  bankTransferDetails: '',
  completed: false,
}

export function FinanceSetupWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const totalSteps = 10

  // Validation function for step 1 (Company Info)
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate CR Number if provided
    if (wizardData.crNumber && !isValidCrNumber(wizardData.crNumber)) {
      errors.crNumber = errorMessages.crNumber.ar
    }

    // Validate VAT Number if provided
    if (wizardData.vatNumber && !isValidVatNumber(wizardData.vatNumber)) {
      errors.vatNumber = errorMessages.vatNumber.ar
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validation function for step 6 (Bank Accounts)
  const validateStep6 = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate IBAN if provided
    if (wizardData.iban && !isValidIban(wizardData.iban)) {
      errors.iban = errorMessages.iban.ar
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWizardData({ ...defaultWizardData, ...parsed })
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep)
        }
        toast.info('تم استعادة التقدم السابق', {
          description: 'يمكنك متابعة الإعداد من حيث توقفت'
        })
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...wizardData, currentStep }))
  }, [wizardData, currentStep])

  const handleInputChange = (field: keyof WizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('logo', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !validateStep1()) {
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة')
      return
    }
    if (currentStep === 6 && !validateStep6()) {
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة')
      return
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const skipStep = () => {
    toast.info('تم تخطي الخطوة', {
      description: 'يمكنك إعداد هذا لاحقاً من الإعدادات'
    })
    nextStep()
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completeSetup = async () => {
    setIsSubmitting(true)
    try {
      // Step 1: Update company settings
      await billingSettingsService.updateCompanySettings({
        name: wizardData.companyName,
        commercialRegister: wizardData.crNumber,
        taxNumber: wizardData.vatNumber,
      })

      // Upload logo if provided
      if (wizardData.logo) {
        await billingSettingsService.updateCompanyLogo(wizardData.logo)
      }

      // Step 2: Create fiscal year
      const yearStart = new Date(wizardData.fiscalYearStart)
      await fiscalPeriodService.createFiscalYear({
        fiscalYear: yearStart.getFullYear(),
        startMonth: yearStart.getMonth() + 1
      })

      // Step 4: Update currency settings (if multi-currency enabled)
      // Note: Currency settings might need custom implementation

      // Step 5: Create tax settings
      await billingSettingsService.createTax({
        name: `ضريبة القيمة المضافة (${wizardData.vatRate}%)`,
        rate: wizardData.vatRate,
        isDefault: true
      })

      // Step 6: Create bank account
      if (wizardData.bankName && wizardData.accountNumber) {
        await bankAccountService.createBankAccount({
          accountName: wizardData.bankName,
          accountNumber: wizardData.accountNumber,
          bankName: wizardData.bankName,
          accountType: 'checking',
          currency: wizardData.defaultCurrency,
          currentBalance: wizardData.bankBalance,
          isDefault: true,
          isActive: true
        })
      }

      // Step 8: Update finance settings
      await billingSettingsService.updateFinanceSettings({
        defaultCurrency: wizardData.defaultCurrency,
        invoicePrefix: wizardData.invoicePrefix,
        invoiceStartNumber: wizardData.invoiceStartNumber,
        paymentTerms: wizardData.paymentTerms,
      })

      // Step 9: Create payment methods
      if (wizardData.enableBankTransfer) {
        await billingSettingsService.createPaymentMode({
          name: 'تحويل بنكي',
          description: wizardData.bankTransferDetails,
          isDefault: true
        })
      }
      if (wizardData.enableCash) {
        await billingSettingsService.createPaymentMode({
          name: 'نقدي',
          description: 'دفع نقدي'
        })
      }
      if (wizardData.enableCreditCard) {
        await billingSettingsService.createPaymentMode({
          name: 'بطاقة ائتمانية',
          description: 'دفع بالبطاقة'
        })
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)

      toast.success('تم إكمال الإعداد بنجاح!', {
        description: 'يمكنك الآن البدء في استخدام النظام المالي'
      })

      // Navigate to finance overview
      setTimeout(() => {
        navigate({ to: '/dashboard/finance/overview' })
      }, 1500)

    } catch (error: any) {
      console.error('Setup failed:', error)
      toast.error('فشل إكمال الإعداد', {
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
    { title: 'معالج الإعداد', href: '/dashboard/finance/setup-wizard', isActive: true },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مرحباً بك في معالج الإعداد المالي</h2>
              <p className="text-slate-600">دعنا نبدأ بإعداد معلومات شركتك الأساسية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  اسم الشركة (إنجليزي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  value={wizardData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNameAr" className="text-sm font-medium text-slate-700">
                  اسم الشركة (عربي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyNameAr"
                  placeholder="اسم الشركة"
                  value={wizardData.companyNameAr}
                  onChange={(e) => handleInputChange('companyNameAr', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crNumber" className="text-sm font-medium text-slate-700">
                  رقم السجل التجاري (CR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="crNumber"
                  placeholder="1010123456"
                  value={wizardData.crNumber}
                  onChange={(e) => handleInputChange('crNumber', e.target.value)}
                  className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${validationErrors.crNumber ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.crNumber && (
                  <p className="text-xs text-red-600">{validationErrors.crNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber" className="text-sm font-medium text-slate-700">
                  الرقم الضريبي (VAT) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vatNumber"
                  placeholder="300000000000003"
                  value={wizardData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${validationErrors.vatNumber ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.vatNumber && (
                  <p className="text-xs text-red-600">{validationErrors.vatNumber}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="logo" className="text-sm font-medium text-slate-700">
                  شعار الشركة
                </Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img src={logoPreview} alt="Company logo preview" className="w-20 h-20 object-contain rounded-lg border border-slate-200" width="80" height="80" />
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, أو SVG (الحد الأقصى 2MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعداد السنة المالية</h2>
              <p className="text-slate-600">حدد بداية ونهاية السنة المالية لشركتك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fiscalYearStart" className="text-sm font-medium text-slate-700">
                  تاريخ بداية السنة المالية <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fiscalYearStart"
                  type="date"
                  value={wizardData.fiscalYearStart}
                  onChange={(e) => handleInputChange('fiscalYearStart', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500">عادة 1 يناير أو 1 يوليو</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYearEnd" className="text-sm font-medium text-slate-700">
                  تاريخ نهاية السنة المالية <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fiscalYearEnd"
                  type="date"
                  value={wizardData.fiscalYearEnd}
                  onChange={(e) => handleInputChange('fiscalYearEnd', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500">عادة 31 ديسمبر أو 30 يونيو</p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="currentPeriod" className="text-sm font-medium text-slate-700">
                  الفترة الحالية
                </Label>
                <select
                  id="currentPeriod"
                  value={wizardData.currentPeriod}
                  onChange={(e) => handleInputChange('currentPeriod', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">اختر الفترة الحالية</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={`period-${i + 1}`}>
                      الفترة {i + 1} - {new Date(0, i).toLocaleString('ar-SA', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> سيتم إنشاء 12 فترة محاسبية تلقائياً بناءً على السنة المالية المحددة
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">دليل الحسابات</h2>
              <p className="text-slate-600">اختر النموذج المناسب لدليل حساباتك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('accountTemplate', 'saudi')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  wizardData.accountTemplate === 'saudi'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy">النموذج السعودي</h3>
                  {wizardData.accountTemplate === 'saudi' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 text-right">
                  دليل حسابات قياسي متوافق مع المعايير السعودية
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('accountTemplate', 'ifrs')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  wizardData.accountTemplate === 'ifrs'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy">IFRS الدولي</h3>
                  {wizardData.accountTemplate === 'ifrs' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 text-right">
                  متوافق مع المعايير الدولية لإعداد التقارير المالية
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('accountTemplate', 'custom')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  wizardData.accountTemplate === 'custom'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy">مخصص</h3>
                  {wizardData.accountTemplate === 'custom' && (
                    <Check className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 text-right">
                  ابدأ بدليل حسابات فارغ وأنشئه بنفسك
                </p>
              </button>
            </div>

            {wizardData.accountTemplate !== 'custom' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-navy mb-4">معاينة شجرة الحسابات</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 ps-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>الأصول (Assets)</span>
                  </div>
                  <div className="flex items-center gap-2 ps-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    <span>الأصول المتداولة</span>
                  </div>
                  <div className="flex items-center gap-2 ps-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    <span>الأصول الثابتة</span>
                  </div>
                  <div className="flex items-center gap-2 ps-4 mt-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>الخصوم (Liabilities)</span>
                  </div>
                  <div className="flex items-center gap-2 ps-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    <span>الخصوم المتداولة</span>
                  </div>
                  <div className="flex items-center gap-2 ps-4 mt-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>حقوق الملكية (Equity)</span>
                  </div>
                  <div className="flex items-center gap-2 ps-4 mt-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>الإيرادات (Income)</span>
                  </div>
                  <div className="flex items-center gap-2 ps-4 mt-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>المصروفات (Expenses)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <Label htmlFor="customizeAccounts" className="text-sm font-medium text-slate-700">
                تخصيص الحسابات لاحقاً
              </Label>
              <Switch
                id="customizeAccounts"
                checked={wizardData.customizeAccounts}
                onCheckedChange={(checked) => handleInputChange('customizeAccounts', checked)}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعداد العملات</h2>
              <p className="text-slate-600">حدد العملة الافتراضية وفعّل العملات المتعددة إذا لزم الأمر</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency" className="text-sm font-medium text-slate-700">
                  العملة الافتراضية <span className="text-red-500">*</span>
                </Label>
                <select
                  id="defaultCurrency"
                  value={wizardData.defaultCurrency}
                  onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="GBP">جنيه إسترليني (GBP)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="KWD">دينار كويتي (KWD)</option>
                  <option value="BHD">دينار بحريني (BHD)</option>
                  <option value="QAR">ريال قطري (QAR)</option>
                  <option value="OMR">ريال عماني (OMR)</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <div>
                  <Label htmlFor="enableMultiCurrency" className="text-sm font-medium text-slate-700">
                    تفعيل العملات المتعددة
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكنك التعامل بعملات متعددة وتحويل المبالغ تلقائياً
                  </p>
                </div>
                <Switch
                  id="enableMultiCurrency"
                  checked={wizardData.enableMultiCurrency}
                  onCheckedChange={(checked) => handleInputChange('enableMultiCurrency', checked)}
                />
              </div>

              {wizardData.enableMultiCurrency && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    عملات إضافية
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['USD', 'EUR', 'GBP', 'AED', 'KWD', 'BHD'].map((currency) => (
                      <button
                        key={currency}
                        type="button"
                        onClick={() => {
                          const current = wizardData.additionalCurrencies
                          if (current.includes(currency)) {
                            handleInputChange('additionalCurrencies', current.filter(c => c !== currency))
                          } else {
                            handleInputChange('additionalCurrencies', [...current, currency])
                          }
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          wizardData.additionalCurrencies.includes(currency)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-navy">{currency}</span>
                          {wizardData.additionalCurrencies.includes(currency) && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>ملاحظة:</strong> سيتم تحديث أسعار الصرف تلقائياً، ويمكنك تعديلها يدوياً إذا لزم الأمر
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Receipt className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات الضرائب</h2>
              <p className="text-slate-600">قم بإعداد ضريبة القيمة المضافة ومتطلبات الامتثال</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vatRate" className="text-sm font-medium text-slate-700">
                  معدل ضريبة القيمة المضافة (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vatRate"
                  type="number"
                  step="0.01"
                  value={wizardData.vatRate}
                  onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value))}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500">المعدل القياسي في السعودية هو 15%</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  طريقة حساب الضريبة
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('taxCalculation', 'inclusive')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.taxCalculation === 'inclusive'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy">شاملة</h3>
                      {wizardData.taxCalculation === 'inclusive' && (
                        <Check className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 text-right">
                      السعر يشمل الضريبة
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('taxCalculation', 'exclusive')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.taxCalculation === 'exclusive'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy">إضافية</h3>
                      {wizardData.taxCalculation === 'exclusive' && (
                        <Check className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 text-right">
                      الضريبة تضاف للسعر
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <div>
                  <Label htmlFor="zatcaCompliance" className="text-sm font-medium text-slate-700">
                    تفعيل الامتثال لهيئة الزكاة والضريبة (ZATCA)
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    الفواتير الإلكترونية والتكامل مع منصة فاتورة
                  </p>
                </div>
                <Switch
                  id="zatcaCompliance"
                  checked={wizardData.zatcaCompliance}
                  onCheckedChange={(checked) => handleInputChange('zatcaCompliance', checked)}
                />
              </div>

              {wizardData.zatcaCompliance && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">الامتثال للمرحلة الثانية</h4>
                      <p className="text-sm text-green-800">
                        سيتم إصدار الفواتير متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                <Landmark className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">الحسابات البنكية</h2>
              <p className="text-slate-600">أضف حسابك البنكي الرئيسي</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium text-slate-700">
                  اسم البنك
                </Label>
                <Input
                  id="bankName"
                  placeholder="مثال: البنك الأهلي السعودي"
                  value={wizardData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium text-slate-700">
                  رقم الحساب
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="12345678"
                  value={wizardData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban" className="text-sm font-medium text-slate-700">
                  رقم الآيبان (IBAN)
                </Label>
                <Input
                  id="iban"
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  value={wizardData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  className={`rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${validationErrors.iban ? 'border-red-500' : ''}`}
                />
                {validationErrors.iban && (
                  <p className="text-xs text-red-600">{validationErrors.iban}</p>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <Label htmlFor="addMoreLater" className="text-sm font-medium text-slate-700">
                  إضافة المزيد من الحسابات لاحقاً
                </Label>
                <Switch
                  id="addMoreLater"
                  checked={wizardData.addMoreLater}
                  onCheckedChange={(checked) => handleInputChange('addMoreLater', checked)}
                />
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-indigo-800">
                <strong>نصيحة:</strong> يمكنك إضافة حسابات بنكية متعددة من صفحة الإعدادات بعد إكمال المعالج
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
                <Wallet className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">الأرصدة الافتتاحية</h2>
              <p className="text-slate-600">أدخل أرصدتك الافتتاحية اعتباراً من تاريخ محدد</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="asOfDate" className="text-sm font-medium text-slate-700">
                  اعتباراً من تاريخ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="asOfDate"
                  type="date"
                  value={wizardData.asOfDate}
                  onChange={(e) => handleInputChange('asOfDate', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cashBalance" className="text-sm font-medium text-slate-700">
                    الرصيد النقدي ({wizardData.defaultCurrency})
                  </Label>
                  <Input
                    id="cashBalance"
                    type="number"
                    step="0.01"
                    value={wizardData.cashBalance}
                    onChange={(e) => handleInputChange('cashBalance', parseFloat(e.target.value) || 0)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankBalance" className="text-sm font-medium text-slate-700">
                    الرصيد البنكي ({wizardData.defaultCurrency})
                  </Label>
                  <Input
                    id="bankBalance"
                    type="number"
                    step="0.01"
                    value={wizardData.bankBalance}
                    onChange={(e) => handleInputChange('bankBalance', parseFloat(e.target.value) || 0)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receivables" className="text-sm font-medium text-slate-700">
                    المستحقات ({wizardData.defaultCurrency})
                  </Label>
                  <Input
                    id="receivables"
                    type="number"
                    step="0.01"
                    value={wizardData.receivables}
                    onChange={(e) => handleInputChange('receivables', parseFloat(e.target.value) || 0)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">المبالغ المستحقة من العملاء</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payables" className="text-sm font-medium text-slate-700">
                    الذمم ({wizardData.defaultCurrency})
                  </Label>
                  <Input
                    id="payables"
                    type="number"
                    step="0.01"
                    value={wizardData.payables}
                    onChange={(e) => handleInputChange('payables', parseFloat(e.target.value) || 0)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500">المبالغ المستحقة للموردين</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <div>
                  <Label htmlFor="detailedEntryLater" className="text-sm font-medium text-slate-700">
                    إدخال تفصيلي لاحقاً
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    يمكنك إدخال تفاصيل الأرصدة لاحقاً من قائمة الحسابات
                  </p>
                </div>
                <Switch
                  id="detailedEntryLater"
                  checked={wizardData.detailedEntryLater}
                  onCheckedChange={(checked) => handleInputChange('detailedEntryLater', checked)}
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-medium text-navy mb-3">ملخص الأرصدة</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">إجمالي الأصول:</span>
                    <span className="font-medium text-navy">
                      {(wizardData.cashBalance + wizardData.bankBalance + wizardData.receivables).toLocaleString()} {wizardData.defaultCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">إجمالي الخصوم:</span>
                    <span className="font-medium text-navy">
                      {wizardData.payables.toLocaleString()} {wizardData.defaultCurrency}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">حقوق الملكية:</span>
                    <span className="font-bold text-emerald-600">
                      {(wizardData.cashBalance + wizardData.bankBalance + wizardData.receivables - wizardData.payables).toLocaleString()} {wizardData.defaultCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                <FileText className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات الفواتير</h2>
              <p className="text-slate-600">قم بإعداد تنسيق وترقيم الفواتير</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix" className="text-sm font-medium text-slate-700">
                    بادئة الفاتورة <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoicePrefix"
                    placeholder="INV"
                    value={wizardData.invoicePrefix}
                    onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-xs text-slate-500">مثال: INV, FAT, FW</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceStartNumber" className="text-sm font-medium text-slate-700">
                    رقم البداية <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoiceStartNumber"
                    type="number"
                    value={wizardData.invoiceStartNumber}
                    onChange={(e) => handleInputChange('invoiceStartNumber', parseInt(e.target.value) || 1)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-xs text-slate-500">مثال: 1000, 1</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="font-medium text-navy mb-2">معاينة رقم الفاتورة</h4>
                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg">
                  <span className="text-2xl font-bold text-emerald-600">
                    {wizardData.invoicePrefix}-{wizardData.invoiceStartNumber.toString().padStart(4, '0')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-sm font-medium text-slate-700">
                  شروط الدفع (بالأيام) <span className="text-red-500">*</span>
                </Label>
                <select
                  id="paymentTerms"
                  value={wizardData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', parseInt(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="0">عند الاستلام</option>
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                  <option value="45">45 يوم</option>
                  <option value="60">60 يوم</option>
                  <option value="90">90 يوم</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceTemplate" className="text-sm font-medium text-slate-700">
                  قالب الفاتورة الافتراضي
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('invoiceTemplate', 'standard')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.invoiceTemplate === 'standard'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy text-sm">قياسي</h3>
                      {wizardData.invoiceTemplate === 'standard' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('invoiceTemplate', 'professional')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.invoiceTemplate === 'professional'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy text-sm">احترافي</h3>
                      {wizardData.invoiceTemplate === 'professional' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('invoiceTemplate', 'minimal')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      wizardData.invoiceTemplate === 'minimal'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy text-sm">بسيط</h3>
                      {wizardData.invoiceTemplate === 'minimal' && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                <CreditCard className="w-8 h-8 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">طرق الدفع</h2>
              <p className="text-slate-600">فعّل وقم بإعداد طرق الدفع المتاحة</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <Label htmlFor="enableBankTransfer" className="text-sm font-medium text-slate-700">
                      تحويل بنكي
                    </Label>
                    <p className="text-xs text-slate-500">قبول المدفوعات عبر التحويل البنكي</p>
                  </div>
                </div>
                <Switch
                  id="enableBankTransfer"
                  checked={wizardData.enableBankTransfer}
                  onCheckedChange={(checked) => handleInputChange('enableBankTransfer', checked)}
                />
              </div>

              {wizardData.enableBankTransfer && (
                <div className="ms-12 space-y-2">
                  <Label htmlFor="bankTransferDetails" className="text-sm font-medium text-slate-700">
                    تفاصيل التحويل البنكي
                  </Label>
                  <Textarea
                    id="bankTransferDetails"
                    placeholder="أدخل تفاصيل حسابك البنكي للعرض على الفاتورة..."
                    value={wizardData.bankTransferDetails}
                    onChange={(e) => handleInputChange('bankTransferDetails', e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="enableCash" className="text-sm font-medium text-slate-700">
                      نقدي
                    </Label>
                    <p className="text-xs text-slate-500">قبول المدفوعات النقدية</p>
                  </div>
                </div>
                <Switch
                  id="enableCash"
                  checked={wizardData.enableCash}
                  onCheckedChange={(checked) => handleInputChange('enableCash', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="enableCreditCard" className="text-sm font-medium text-slate-700">
                      بطاقة ائتمانية
                    </Label>
                    <p className="text-xs text-slate-500">قبول المدفوعات بالبطاقة</p>
                  </div>
                </div>
                <Switch
                  id="enableCreditCard"
                  checked={wizardData.enableCreditCard}
                  onCheckedChange={(checked) => handleInputChange('enableCreditCard', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <Label htmlFor="enableOnlinePayments" className="text-sm font-medium text-slate-700">
                      الدفع الإلكتروني
                    </Label>
                    <p className="text-xs text-slate-500">تكامل مع بوابات الدفع (مدى، آبل باي، إلخ)</p>
                  </div>
                </div>
                <Switch
                  id="enableOnlinePayments"
                  checked={wizardData.enableOnlinePayments}
                  onCheckedChange={(checked) => handleInputChange('enableOnlinePayments', checked)}
                />
              </div>

              {wizardData.enableOnlinePayments && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>ملاحظة:</strong> ستحتاج إلى إعداد التكامل مع بوابة الدفع من إعدادات النظام بعد إكمال المعالج
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مراجعة وإكمال الإعداد</h2>
              <p className="text-slate-600">راجع جميع الإعدادات قبل إكمال المعالج</p>
            </div>

            <div className="space-y-4">
              {/* Step 1 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      <CardTitle>معلومات الشركة</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">اسم الشركة:</span>
                      <span className="font-medium">{wizardData.companyName} / {wizardData.companyNameAr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">السجل التجاري:</span>
                      <span className="font-medium">{wizardData.crNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">الرقم الضريبي:</span>
                      <span className="font-medium">{wizardData.vatNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <CardTitle>السنة المالية</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">من:</span>
                      <span className="font-medium">{wizardData.fiscalYearStart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">إلى:</span>
                      <span className="font-medium">{wizardData.fiscalYearEnd}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      <CardTitle>دليل الحسابات</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">القالب:</span>
                      <span className="font-medium">
                        {wizardData.accountTemplate === 'saudi' && 'النموذج السعودي'}
                        {wizardData.accountTemplate === 'ifrs' && 'IFRS الدولي'}
                        {wizardData.accountTemplate === 'custom' && 'مخصص'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                      <CardTitle>العملات</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(4)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">العملة الافتراضية:</span>
                      <span className="font-medium">{wizardData.defaultCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">عملات متعددة:</span>
                      <span className="font-medium">{wizardData.enableMultiCurrency ? 'مفعّل' : 'غير مفعّل'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-red-500" />
                      <CardTitle>الضرائب</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(5)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">معدل الضريبة:</span>
                      <span className="font-medium">{wizardData.vatRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">امتثال ZATCA:</span>
                      <span className="font-medium">{wizardData.zatcaCompliance ? 'مفعّل' : 'غير مفعّل'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 8 Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-pink-500" />
                      <CardTitle>الفواتير</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(8)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">تنسيق الرقم:</span>
                      <span className="font-medium">{wizardData.invoicePrefix}-{wizardData.invoiceStartNumber.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">شروط الدفع:</span>
                      <span className="font-medium">{wizardData.paymentTerms} يوم</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-2">جاهز للانطلاق!</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    لقد أكملت جميع الإعدادات الأساسية. عند النقر على "إكمال الإعداد"، سيتم تطبيق جميع الإعدادات وسيكون النظام المالي جاهزاً للاستخدام.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إنشاء دليل الحسابات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إعداد الفترات المالية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تكوين إعدادات الضرائب والفواتير</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إضافة الحسابات البنكية وطرق الدفع</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">
                الخطوة {currentStep} من {totalSteps}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-3"
              indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-500"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[...Array(totalSteps)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i + 1)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    currentStep === i + 1
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : currentStep > i + 1
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  aria-label={`الانتقال إلى الخطوة ${i + 1}`}
                >
                  {currentStep > i + 1 ? <Check className="w-4 h-4 mx-auto" /> : i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-slate-100">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4 ms-1" />
                    السابق
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < totalSteps && currentStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={skipStep}
                    className="text-slate-500 hover:text-navy rounded-xl"
                  >
                    تخطي
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4 me-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={completeSetup}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإكمال...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        إكمال الإعداد
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
