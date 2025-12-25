import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Building2, User, Briefcase, CheckCircle2, ChevronRight, ChevronLeft,
  Loader2, Check, Upload, X, Sparkles, Rocket, Target, Users,
  FileText, TrendingUp, Calculator, Scale, UserCog, Package,
  ShoppingCart, Factory, ClipboardCheck, Headphones, Building,
  GitBranch, Warehouse, Tags, Ruler, DollarSign, Calendar,
  Settings, AlertCircle, Shield, LifeBuoy, Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  useCompleteWizard,
  useSaveWizardProgress,
  useUploadCompanyLogo,
  useUploadUserAvatar,
} from '@/hooks/useOnboardingWizard'
import type { WizardData, WizardCompanyInfo, WizardUserProfile, WizardModuleSelection } from '@/services/onboardingWizardService'

// ==================== TYPES ====================

const STORAGE_KEY = 'initial-onboarding-wizard-progress'

interface ModuleConfig {
  [key: string]: any
}

// ==================== DEFAULT DATA ====================

const defaultWizardData: WizardData = {
  companyInfo: {
    companyName: '',
    companyNameAr: '',
    companyLogo: null,
    industry: '',
    industryAr: '',
    size: '',
    country: 'Saudi Arabia',
    city: '',
    address: '',
  },
  userProfile: {
    fullName: '',
    fullNameAr: '',
    phone: '',
    role: '',
    roleAr: '',
    avatar: null,
  },
  modules: {
    hr: true,
    finance: true,
    crm: true,
    cases: true,
    inventory: false,
    buying: false,
    manufacturing: false,
    quality: false,
    support: false,
    assets: false,
    subcontracting: false,
  },
  completed: false,
  currentStep: 1,
}

// Industry options
const INDUSTRIES = [
  { en: 'Legal Services', ar: 'الخدمات القانونية' },
  { en: 'Consulting', ar: 'الاستشارات' },
  { en: 'Accounting', ar: 'المحاسبة' },
  { en: 'Technology', ar: 'التقنية' },
  { en: 'Healthcare', ar: 'الرعاية الصحية' },
  { en: 'Education', ar: 'التعليم' },
  { en: 'Real Estate', ar: 'العقارات' },
  { en: 'Finance', ar: 'المالية' },
  { en: 'Retail', ar: 'التجزئة' },
  { en: 'Manufacturing', ar: 'التصنيع' },
  { en: 'Other', ar: 'أخرى' },
]

// Company size options
const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 موظفين' },
  { value: '11-50', label: '11-50 موظف' },
  { value: '51-200', label: '51-200 موظف' },
  { value: '201-500', label: '201-500 موظف' },
  { value: '500+', label: 'أكثر من 500 موظف' },
]

// Module configurations
const MODULES = [
  {
    key: 'hr' as const,
    icon: Users,
    nameAr: 'الموارد البشرية',
    nameEn: 'Human Resources',
    descriptionAr: 'إدارة الموظفين، الحضور، الإجازات، الرواتب والمزيد',
    descriptionEn: 'Manage employees, attendance, leaves, payroll and more',
    color: 'bg-blue-500',
    recommended: true,
  },
  {
    key: 'finance' as const,
    icon: Calculator,
    nameAr: 'المالية والمحاسبة',
    nameEn: 'Finance & Accounting',
    descriptionAr: 'إدارة الفواتير، المصروفات، الحسابات والتقارير المالية',
    descriptionEn: 'Manage invoices, expenses, accounts and financial reports',
    color: 'bg-green-500',
    recommended: true,
  },
  {
    key: 'crm' as const,
    icon: TrendingUp,
    nameAr: 'إدارة العملاء',
    nameEn: 'Customer Relationship',
    descriptionAr: 'إدارة العملاء المحتملين، الفرص، المبيعات والعروض',
    descriptionEn: 'Manage leads, opportunities, sales and proposals',
    color: 'bg-purple-500',
    recommended: true,
  },
  {
    key: 'cases' as const,
    icon: Scale,
    nameAr: 'إدارة القضايا',
    nameEn: 'Case Management',
    descriptionAr: 'إدارة القضايا القانونية، المهام، المستندات والجلسات',
    descriptionEn: 'Manage legal cases, tasks, documents and hearings',
    color: 'bg-amber-500',
    recommended: false,
  },
  {
    key: 'inventory' as const,
    icon: Package,
    nameAr: 'إدارة المخزون',
    nameEn: 'Inventory Management',
    descriptionAr: 'إدارة المستودعات، الأصناف، وحدات القياس والمخزون',
    descriptionEn: 'Manage warehouses, items, UOMs and stock',
    color: 'bg-indigo-500',
    recommended: false,
  },
  {
    key: 'buying' as const,
    icon: ShoppingCart,
    nameAr: 'المشتريات',
    nameEn: 'Buying',
    descriptionAr: 'إدارة الموردين، طلبات الشراء، الاستلام والدفع',
    descriptionEn: 'Manage suppliers, purchase orders, receipts and payments',
    color: 'bg-cyan-500',
    recommended: false,
  },
  {
    key: 'manufacturing' as const,
    icon: Factory,
    nameAr: 'التصنيع',
    nameEn: 'Manufacturing',
    descriptionAr: 'إدارة الإنتاج، محطات العمل، قوائم المواد وأوامر العمل',
    descriptionEn: 'Manage production, workstations, BOMs and work orders',
    color: 'bg-orange-500',
    recommended: false,
  },
  {
    key: 'quality' as const,
    icon: ClipboardCheck,
    nameAr: 'إدارة الجودة',
    nameEn: 'Quality Management',
    descriptionAr: 'إدارة الفحوصات، القوالب، المعايير ومراقبة الجودة',
    descriptionEn: 'Manage inspections, templates, parameters and QC',
    color: 'bg-teal-500',
    recommended: false,
  },
  {
    key: 'support' as const,
    icon: Headphones,
    nameAr: 'الدعم الفني',
    nameEn: 'Support',
    descriptionAr: 'إدارة التذاكر، اتفاقيات مستوى الخدمة والدعم الفني',
    descriptionEn: 'Manage tickets, SLAs and technical support',
    color: 'bg-pink-500',
    recommended: false,
  },
  {
    key: 'assets' as const,
    icon: Building,
    nameAr: 'إدارة الأصول',
    nameEn: 'Asset Management',
    descriptionAr: 'إدارة الأصول، الإهلاك، الصيانة والفئات',
    descriptionEn: 'Manage assets, depreciation, maintenance and categories',
    color: 'bg-slate-500',
    recommended: false,
  },
  {
    key: 'subcontracting' as const,
    icon: GitBranch,
    nameAr: 'التعاقد من الباطن',
    nameEn: 'Subcontracting',
    descriptionAr: 'إدارة التعاقدات من الباطن، المواد والعمليات الخارجية',
    descriptionEn: 'Manage subcontracting, materials and external processes',
    color: 'bg-violet-500',
    recommended: false,
  },
]

// ==================== COMPONENT ====================

export default function InitialSetupWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [moduleConfig, setModuleConfig] = useState<ModuleConfig>({})

  const totalSteps = 5

  // Mutations
  const completeWizardMutation = useCompleteWizard()
  const saveProgressMutation = useSaveWizardProgress()
  const uploadLogoMutation = useUploadCompanyLogo()
  const uploadAvatarMutation = useUploadUserAvatar()

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
        if (parsed.moduleConfig) {
          setModuleConfig(parsed.moduleConfig)
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage and database
  useEffect(() => {
    const dataToSave = { ...wizardData, currentStep, moduleConfig }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))

    // Debounce the database save
    const timeoutId = setTimeout(() => {
      saveProgressMutation.mutate(dataToSave)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [wizardData, currentStep, moduleConfig])

  const handleInputChange = <K extends keyof WizardData>(
    section: K,
    field: keyof WizardData[K],
    value: any
  ) => {
    setWizardData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleModuleConfigChange = (moduleKey: string, field: string, value: any) => {
    setModuleConfig(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [field]: value,
      },
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('companyInfo', 'companyLogo', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('userProfile', 'avatar', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleModuleToggle = (moduleKey: keyof WizardModuleSelection) => {
    setWizardData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey],
      },
    }))
  }

  const nextStep = () => {
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

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completeSetup = async () => {
    try {
      // Upload files if provided
      if (wizardData.companyInfo.companyLogo) {
        await uploadLogoMutation.mutateAsync(wizardData.companyInfo.companyLogo)
      }
      if (wizardData.userProfile.avatar) {
        await uploadAvatarMutation.mutateAsync(wizardData.userProfile.avatar)
      }

      // Complete wizard
      await completeWizardMutation.mutateAsync(wizardData)

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)

      // Navigate to dashboard
      setTimeout(() => {
        navigate({ to: '/dashboard' })
      }, 1500)
    } catch (error) {
      console.error('Setup failed:', error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      // ==================== STEP 1: WELCOME ====================
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-6">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-4">
              مرحباً بك في ترافلي!
              <br />
              <span className="text-xl font-normal text-slate-600">Welcome to Traf3li!</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              نحن متحمسون لانضمامك إلينا! دعنا نساعدك في إعداد حسابك في خطوات بسيطة.
              <br />
              <span className="text-base">We're excited to have you! Let's help you set up your account in a few simple steps.</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto text-right">
              <Card className="border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">معلومات الشركة</CardTitle>
                  </div>
                  <CardDescription>
                    أدخل معلومات شركتك أو مكتبك الأساسية
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">الملف الشخصي</CardTitle>
                  </div>
                  <CardDescription>
                    أكمل معلومات ملفك الشخصي
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">اختيار الوحدات</CardTitle>
                  </div>
                  <CardDescription>
                    اختر الوحدات التي تحتاجها لعملك
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-slate-100 hover:border-emerald-200 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-lg">جاهز للانطلاق!</CardTitle>
                  </div>
                  <CardDescription>
                    ابدأ في استخدام النظام بكامل قوته
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-12 max-w-2xl mx-auto text-center">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> يمكنك تخطي هذا المعالج والعودة إليه لاحقاً من الإعدادات
                <br />
                <span className="text-xs">You can skip this wizard and come back to it later from settings</span>
              </p>
            </div>
          </div>
        )

      // ==================== STEP 2: COMPANY INFORMATION ====================
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">
                معلومات الشركة / المكتب
                <br />
                <span className="text-lg font-normal text-slate-600">Company / Firm Information</span>
              </h2>
              <p className="text-slate-600">أدخل المعلومات الأساسية عن شركتك أو مكتبك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  اسم الشركة (إنجليزي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  value={wizardData.companyInfo.companyName}
                  onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
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
                  value={wizardData.companyInfo.companyNameAr}
                  onChange={(e) => handleInputChange('companyInfo', 'companyNameAr', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                  dir="rtl"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="logo" className="text-sm font-medium text-slate-700">
                  شعار الشركة
                </Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="w-20 h-20 object-contain rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null)
                          handleInputChange('companyInfo', 'companyLogo', null)
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">PNG, JPG, أو SVG (الحد الأقصى 2MB)</p>
                    <p className="text-xs text-slate-400">Recommended size: 200x200 pixels</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium text-slate-700">
                  المجال / الصناعة <span className="text-red-500">*</span>
                </Label>
                <select
                  id="industry"
                  value={wizardData.companyInfo.industry}
                  onChange={(e) => {
                    const selected = INDUSTRIES.find(i => i.en === e.target.value)
                    handleInputChange('companyInfo', 'industry', e.target.value)
                    handleInputChange('companyInfo', 'industryAr', selected?.ar || '')
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                >
                  <option value="">اختر المجال</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.en} value={industry.en}>
                      {industry.ar} - {industry.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size" className="text-sm font-medium text-slate-700">
                  حجم الشركة
                </Label>
                <select
                  id="size"
                  value={wizardData.companyInfo.size}
                  onChange={(e) => handleInputChange('companyInfo', 'size', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">اختر الحجم</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                  المدينة
                </Label>
                <Input
                  id="city"
                  placeholder="الرياض"
                  value={wizardData.companyInfo.city}
                  onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                  العنوان
                </Label>
                <Input
                  id="address"
                  placeholder="العنوان"
                  value={wizardData.companyInfo.address}
                  onChange={(e) => handleInputChange('companyInfo', 'address', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> يمكنك تعديل هذه المعلومات لاحقاً من إعدادات الشركة
              </p>
            </div>
          </div>
        )

      // ==================== STEP 3: USER PROFILE ====================
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">
                الملف الشخصي
                <br />
                <span className="text-lg font-normal text-slate-600">User Profile</span>
              </h2>
              <p className="text-slate-600">أكمل معلومات ملفك الشخصي</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 flex justify-center">
                <div className="space-y-2 text-center">
                  <Label htmlFor="avatar" className="text-sm font-medium text-slate-700">
                    الصورة الشخصية
                  </Label>
                  <div className="flex flex-col items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="User avatar preview"
                          className="w-32 h-32 object-cover rounded-full border-4 border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview(null)
                            handleInputChange('userProfile', 'avatar', null)
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-xs text-slate-500">PNG, JPG (الحد الأقصى 2MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  الاسم الكامل (إنجليزي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Full Name"
                  value={wizardData.userProfile.fullName}
                  onChange={(e) => handleInputChange('userProfile', 'fullName', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullNameAr" className="text-sm font-medium text-slate-700">
                  الاسم الكامل (عربي)
                </Label>
                <Input
                  id="fullNameAr"
                  placeholder="الاسم الكامل"
                  value={wizardData.userProfile.fullNameAr}
                  onChange={(e) => handleInputChange('userProfile', 'fullNameAr', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+966 50 123 4567"
                  value={wizardData.userProfile.phone}
                  onChange={(e) => handleInputChange('userProfile', 'phone', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                  المسمى الوظيفي (إنجليزي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role"
                  placeholder="Job Title"
                  value={wizardData.userProfile.role}
                  onChange={(e) => handleInputChange('userProfile', 'role', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="roleAr" className="text-sm font-medium text-slate-700">
                  المسمى الوظيفي (عربي)
                </Label>
                <Input
                  id="roleAr"
                  placeholder="المسمى الوظيفي"
                  value={wizardData.userProfile.roleAr}
                  onChange={(e) => handleInputChange('userProfile', 'roleAr', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-800">
                <strong>نصيحة:</strong> يمكنك تحديث معلوماتك الشخصية في أي وقت من صفحة الملف الشخصي
              </p>
            </div>
          </div>
        )

      // ==================== STEP 4: MODULE SELECTION ====================
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">
                اختيار الوحدات
                <br />
                <span className="text-lg font-normal text-slate-600">Module Selection</span>
              </h2>
              <p className="text-slate-600">اختر الوحدات التي تحتاجها لعملك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto px-2">
              {MODULES.map((module) => {
                const Icon = module.icon
                const isSelected = wizardData.modules[module.key]

                return (
                  <Card
                    key={module.key}
                    className={`cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleModuleToggle(module.key)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{module.nameAr}</CardTitle>
                              {module.recommended && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  موصى به
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{module.nameEn}</p>
                            <CardDescription className="text-sm leading-relaxed">
                              {module.descriptionAr}
                            </CardDescription>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>ملاحظة:</strong> يمكنك تفعيل أو إلغاء تفعيل الوحدات في أي وقت من إعدادات النظام
              </p>
            </div>
          </div>
        )

      // ==================== STEP 5: COMPLETION ====================
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-6">
                <Rocket className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                جاهز للانطلاق!
                <br />
                <span className="text-xl font-normal text-slate-600">Ready to Launch!</span>
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                رائع! لقد أكملت إعداد حسابك. دعنا نراجع المعلومات قبل البدء.
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Company Info Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle>معلومات الشركة</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                      تعديل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">الاسم:</span>
                      <span className="font-medium">
                        {wizardData.companyInfo.companyName} / {wizardData.companyInfo.companyNameAr}
                      </span>
                    </div>
                    {wizardData.companyInfo.industry && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">المجال:</span>
                        <span className="font-medium">{wizardData.companyInfo.industryAr}</span>
                      </div>
                    )}
                    {wizardData.companyInfo.size && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">الحجم:</span>
                        <span className="font-medium">
                          {COMPANY_SIZES.find(s => s.value === wizardData.companyInfo.size)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Profile Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <CardTitle>الملف الشخصي</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                      تعديل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">الاسم:</span>
                      <span className="font-medium">
                        {wizardData.userProfile.fullName}
                        {wizardData.userProfile.fullNameAr && ` / ${wizardData.userProfile.fullNameAr}`}
                      </span>
                    </div>
                    {wizardData.userProfile.role && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">المسمى الوظيفي:</span>
                        <span className="font-medium">
                          {wizardData.userProfile.role}
                          {wizardData.userProfile.roleAr && ` / ${wizardData.userProfile.roleAr}`}
                        </span>
                      </div>
                    )}
                    {wizardData.userProfile.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">الجوال:</span>
                        <span className="font-medium">{wizardData.userProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Modules Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>
                      <CardTitle>الوحدات المفعلة</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(4)}>
                      تعديل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {MODULES.filter(m => wizardData.modules[m.key]).map((module) => {
                      const Icon = module.icon
                      return (
                        <div
                          key={module.key}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
                        >
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">
                            {module.nameAr}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-2">الخطوات التالية</h3>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>استكشف لوحة التحكم والتقارير</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>قم بدعوة أعضاء فريقك</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>ابدأ في إضافة البيانات والمعلومات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>راجع الإعدادات وخصص النظام حسب احتياجاتك</span>
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

  const isSubmitting = completeWizardMutation.isPending || uploadLogoMutation.isPending || uploadAvatarMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
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
          <div className="mt-4 flex flex-wrap gap-2">
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

        {/* Wizard Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
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
                  disabled={isSubmitting}
                >
                  <ChevronRight className="w-4 h-4 ms-1" />
                  السابق
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={isSubmitting}
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
                      ابدأ الآن!
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
