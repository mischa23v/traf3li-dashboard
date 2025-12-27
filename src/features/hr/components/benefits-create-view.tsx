import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { useCreateBenefit, useUpdateBenefit, useBenefit } from '@/hooks/useBenefits'
import { useEmployees } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  Search, Bell, ArrowRight, User, Building2,
  CheckCircle, ChevronDown, Users, Heart,
  Calendar, Shield, Wallet, Home, Car, DollarSign,
  FileText, Phone
} from 'lucide-react'
import { isValidEmail, isValidPhone, errorMessages } from '@/utils/validation-patterns'
import {
  BENEFIT_TYPE_LABELS,
  BENEFIT_CATEGORY_LABELS,
  ENROLLMENT_TYPE_LABELS,
  COVERAGE_LEVEL_LABELS,
  PAYMENT_FREQUENCY_LABELS,
  type BenefitType,
  type BenefitCategory,
  type EnrollmentType,
  type CoverageLevel,
  type ProviderType,
  type PaymentFrequency,
  type CreateBenefitData,
} from '@/services/benefitsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function BenefitsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingBenefit, isLoading: isLoadingBenefit } = useBenefit(editId || '')
  const createMutation = useCreateBenefit()
  const updateMutation = useUpdateBenefit()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Basic Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')

  // Form State - Benefit Details
  const [benefitType, setBenefitType] = useState<BenefitType>('health_insurance')
  const [benefitCategory, setBenefitCategory] = useState<BenefitCategory>('insurance')
  const [benefitName, setBenefitName] = useState('')
  const [benefitNameAr, setBenefitNameAr] = useState('')
  const [benefitDescription, setBenefitDescription] = useState('')
  const [benefitDescriptionAr, setBenefitDescriptionAr] = useState('')

  // Plan Details
  const [planName, setPlanName] = useState('')
  const [planNameAr, setPlanNameAr] = useState('')

  // Enrollment
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('new_hire')
  const [enrollmentDate, setEnrollmentDate] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [coverageEndDate, setCoverageEndDate] = useState('')
  const [coverageLevel, setCoverageLevel] = useState<CoverageLevel>('employee_only')

  // Provider
  const [providerType, setProviderType] = useState<ProviderType>('insurance_company')
  const [providerName, setProviderName] = useState('')
  const [providerNameAr, setProviderNameAr] = useState('')
  const [providerEmail, setProviderEmail] = useState('')
  const [providerPhone, setProviderPhone] = useState('')

  // Validation errors
  const [providerEmailError, setProviderEmailError] = useState('')
  const [providerPhoneError, setProviderPhoneError] = useState('')

  // Costs
  const [employerCost, setEmployerCost] = useState<number>(0)
  const [employeeCost, setEmployeeCost] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')

  // Health Insurance
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [memberNumber, setMemberNumber] = useState('')
  const [planType, setPlanType] = useState<'basic' | 'standard' | 'premium' | 'executive'>('standard')
  const [inpatientCoverage, setInpatientCoverage] = useState(true)
  const [outpatientCoverage, setOutpatientCoverage] = useState(true)
  const [dentalCoverage, setDentalCoverage] = useState(false)
  const [maternityCoverage, setMaternityCoverage] = useState(false)
  const [annualMaximum, setAnnualMaximum] = useState<number>(0)

  // Life Insurance
  const [coverageAmount, setCoverageAmount] = useState<number>(0)
  const [coverageType, setCoverageType] = useState<'term' | 'whole_life' | 'group_term'>('group_term')
  const [accidentalDeath, setAccidentalDeath] = useState(false)
  const [criticalIllness, setCriticalIllness] = useState(false)

  // Allowance
  const [allowanceAmount, setAllowanceAmount] = useState<number>(0)
  const [calculationType, setCalculationType] = useState<'fixed' | 'percentage_of_salary' | 'tiered' | 'reimbursement'>('fixed')
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly')
  const [annualLimit, setAnnualLimit] = useState<number>(0)
  const [taxable, setTaxable] = useState(false)
  const [includedInGOSI, setIncludedInGOSI] = useState(false)
  const [includedInEOSB, setIncludedInEOSB] = useState(false)

  // Notes
  const [employeeNotes, setEmployeeNotes] = useState('')
  const [hrNotes, setHrNotes] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (existingBenefit && isEditMode) {
      setEmployeeId(existingBenefit.employeeId || '')
      setEmployeeName(existingBenefit.employeeName || '')
      setEmployeeNameAr(existingBenefit.employeeNameAr || '')
      setEmployeeNumber(existingBenefit.employeeNumber || '')
      setDepartment(existingBenefit.department || '')
      setBenefitType(existingBenefit.benefitType)
      setBenefitCategory(existingBenefit.benefitCategory)
      setBenefitName(existingBenefit.benefitName || '')
      setBenefitNameAr(existingBenefit.benefitNameAr || '')
      setBenefitDescription(existingBenefit.benefitDescription || '')
      setBenefitDescriptionAr(existingBenefit.benefitDescriptionAr || '')
      setPlanName(existingBenefit.planName || '')
      setPlanNameAr(existingBenefit.planNameAr || '')
      setEnrollmentType(existingBenefit.enrollmentType)
      setEnrollmentDate(existingBenefit.enrollmentDate?.split('T')[0] || '')
      setEffectiveDate(existingBenefit.effectiveDate?.split('T')[0] || '')
      setCoverageEndDate(existingBenefit.coverageEndDate?.split('T')[0] || '')
      setCoverageLevel(existingBenefit.coverageLevel || 'employee_only')
      setProviderType(existingBenefit.providerType || 'insurance_company')
      setProviderName(existingBenefit.providerName || '')
      setProviderNameAr(existingBenefit.providerNameAr || '')
      setProviderEmail(existingBenefit.providerContact?.email || '')
      setProviderPhone(existingBenefit.providerContact?.phone || '')
      setEmployerCost(existingBenefit.employerCost || 0)
      setEmployeeCost(existingBenefit.employeeCost || 0)
      setCurrency(existingBenefit.currency || 'SAR')

      // Health Insurance
      if (existingBenefit.healthInsurance) {
        setInsuranceProvider(existingBenefit.healthInsurance.insuranceProvider || '')
        setPolicyNumber(existingBenefit.healthInsurance.policyNumber || '')
        setMemberNumber(existingBenefit.healthInsurance.memberNumber || '')
        setPlanType(existingBenefit.healthInsurance.planType || 'standard')
        setInpatientCoverage(existingBenefit.healthInsurance.inpatientCoverage || false)
        setOutpatientCoverage(existingBenefit.healthInsurance.outpatientCoverage || false)
        setDentalCoverage(existingBenefit.healthInsurance.dentalCoverage || false)
        setMaternityCoverage(existingBenefit.healthInsurance.maternityCoverage || false)
        setAnnualMaximum(existingBenefit.healthInsurance.annualMaximum || 0)
      }

      // Life Insurance
      if (existingBenefit.lifeInsurance) {
        setCoverageAmount(existingBenefit.lifeInsurance.coverageAmount || 0)
        setCoverageType(existingBenefit.lifeInsurance.coverageType || 'group_term')
        setAccidentalDeath(existingBenefit.lifeInsurance.accidentalDeath || false)
        setCriticalIllness(existingBenefit.lifeInsurance.criticalIllness || false)
      }

      // Allowance
      if (existingBenefit.allowance) {
        setAllowanceAmount(existingBenefit.allowance.allowanceAmount || 0)
        setCalculationType(existingBenefit.allowance.calculationType || 'fixed')
        setPaymentFrequency(existingBenefit.allowance.paymentFrequency || 'monthly')
        setAnnualLimit(existingBenefit.allowance.annualLimit || 0)
        setTaxable(existingBenefit.allowance.taxable || false)
        setIncludedInGOSI(existingBenefit.allowance.includedInGOSI || false)
        setIncludedInEOSB(existingBenefit.allowance.includedInEOSB || false)
      }

      setEmployeeNotes(existingBenefit.notes?.employeeNotes || '')
      setHrNotes(existingBenefit.notes?.hrNotes || '')
    }
  }, [existingBenefit, isEditMode])

  // Handle employee selection
  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    setEmployeeId(selectedEmployeeId)
    const employee = employeesData?.employees?.find(e => e._id === selectedEmployeeId)
    if (employee) {
      setEmployeeName(employee.personalInfo?.fullNameEnglish || '')
      setEmployeeNameAr(employee.personalInfo?.fullNameArabic || '')
      setEmployeeNumber(employee.employeeId || '')
      setDepartment(employee.employment?.departmentName || '')
    }
  }

  // Get category based on benefit type
  const getCategoryFromType = (type: BenefitType): BenefitCategory => {
    if (['health_insurance', 'life_insurance', 'disability_insurance', 'dental_insurance', 'vision_insurance'].includes(type)) {
      return 'insurance'
    }
    if (['pension', 'savings_plan'].includes(type)) {
      return 'retirement'
    }
    if (['education_allowance', 'transportation', 'housing', 'meal_allowance', 'mobile_allowance'].includes(type)) {
      return 'allowance'
    }
    if (['gym_membership', 'professional_membership'].includes(type)) {
      return 'perks'
    }
    return 'voluntary'
  }

  // Handle benefit type change
  const handleBenefitTypeChange = (type: BenefitType) => {
    setBenefitType(type)
    setBenefitCategory(getCategoryFromType(type))
    // Set default benefit name
    setBenefitNameAr(BENEFIT_TYPE_LABELS[type]?.ar || '')
    setBenefitName(BENEFIT_TYPE_LABELS[type]?.en || '')
  }

  // Handle submit
  const handleSubmit = async () => {
    // Clear previous errors
    setProviderEmailError('')
    setProviderPhoneError('')

    // Validate email if provided
    if (providerEmail && !isValidEmail(providerEmail)) {
      setProviderEmailError(errorMessages.email.ar)
      return
    }

    // Validate phone if provided
    if (providerPhone && !isValidPhone(providerPhone)) {
      setProviderPhoneError(errorMessages.phone.ar)
      return
    }

    const data: CreateBenefitData = {
      employeeId,
      employeeName,
      employeeNameAr: employeeNameAr || undefined,
      employeeNumber: employeeNumber || undefined,
      department: department || undefined,
      benefitType,
      benefitCategory,
      benefitName: benefitName || BENEFIT_TYPE_LABELS[benefitType]?.en,
      benefitNameAr: benefitNameAr || BENEFIT_TYPE_LABELS[benefitType]?.ar,
      benefitDescription: benefitDescription || undefined,
      benefitDescriptionAr: benefitDescriptionAr || undefined,
      planName: planName || undefined,
      planNameAr: planNameAr || undefined,
      providerType,
      providerName: providerName || undefined,
      providerNameAr: providerNameAr || undefined,
      providerContact: (providerEmail || providerPhone) ? {
        email: providerEmail || undefined,
        phone: providerPhone || undefined,
      } : undefined,
      enrollmentType,
      enrollmentDate,
      effectiveDate,
      coverageEndDate: coverageEndDate || undefined,
      coverageLevel,
      employerCost,
      employeeCost,
      currency,
      healthInsurance: benefitType === 'health_insurance' ? {
        insuranceProvider: insuranceProvider || providerName,
        policyNumber,
        memberNumber,
        memberId: memberNumber,
        coverageType: coverageLevel === 'employee_only' ? 'individual' : 'family',
        planType,
        networkType: 'both',
        inpatientCoverage,
        outpatientCoverage,
        dentalCoverage,
        maternityCoverage,
        visionCoverage: false,
        preAuthRequired: true,
        geographicCoverage: 'saudi_only',
        annualMaximum: annualMaximum || undefined,
      } : undefined,
      lifeInsurance: benefitType === 'life_insurance' ? {
        insuranceProvider: insuranceProvider || providerName,
        policyNumber,
        coverageAmount,
        coverageType,
        accidentalDeath,
        criticalIllness,
        primaryBeneficiaries: 0,
        contingentBeneficiaries: 0,
      } : undefined,
      allowance: ['education_allowance', 'transportation', 'housing', 'meal_allowance', 'mobile_allowance'].includes(benefitType) ? {
        allowanceType: benefitType,
        allowanceName: benefitName || BENEFIT_TYPE_LABELS[benefitType]?.en,
        allowanceNameAr: benefitNameAr || BENEFIT_TYPE_LABELS[benefitType]?.ar,
        allowanceAmount: allowanceAmount || employerCost,
        calculationType,
        paymentFrequency,
        annualLimit: annualLimit || undefined,
        usedToDate: 0,
        taxable,
        includedInGOSI,
        includedInEOSB,
      } : undefined,
      notes: {
        employeeNotes: employeeNotes || undefined,
        hrNotes: hrNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        benefitId: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: ROUTES.dashboard.hr.benefits.list })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'المزايا', href: ROUTES.dashboard.hr.benefits.list, isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  // Check if benefit type is insurance
  const isInsuranceType = ['health_insurance', 'life_insurance', 'disability_insurance', 'dental_insurance', 'vision_insurance'].includes(benefitType)
  // Check if benefit type is allowance
  const isAllowanceType = ['education_allowance', 'transportation', 'housing', 'meal_allowance', 'mobile_allowance'].includes(benefitType)

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل الميزة' : 'تسجيل ميزة جديدة'}
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white"
                onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.list })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل الميزة' : 'تسجيل ميزة جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات الميزة' : 'تسجيل ميزة للموظف'}
                </p>
              </div>
            </div>

            {/* OFFICE TYPE SELECTOR */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  نوع المكتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OFFICE_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOfficeType(option.value as OfficeType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        officeType === option.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium block">{option.labelAr}</span>
                      <span className="text-xs opacity-75">{option.descriptionAr}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* EMPLOYEE SELECTION - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  بيانات الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اختر الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Select value={employeeId} onValueChange={handleEmployeeSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesData?.employees?.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.personalInfo?.fullNameArabic || emp.personalInfo?.fullNameEnglish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">القسم</Label>
                    <Input
                      value={department}
                      readOnly
                      placeholder="القسم"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BENEFIT TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-500" />
                  نوع الميزة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    نوع الميزة <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(BENEFIT_TYPE_LABELS).slice(0, 8).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleBenefitTypeChange(key as BenefitType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          benefitType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {Object.entries(BENEFIT_TYPE_LABELS).slice(8).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleBenefitTypeChange(key as BenefitType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          benefitType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">اسم الميزة بالعربية</Label>
                    <Input
                      value={benefitNameAr}
                      onChange={(e) => setBenefitNameAr(e.target.value)}
                      placeholder="اسم الميزة بالعربية"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Benefit Name</Label>
                    <Input
                      value={benefitName}
                      onChange={(e) => setBenefitName(e.target.value)}
                      placeholder="Benefit name in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">التصنيف</Label>
                    <Select value={benefitCategory} onValueChange={(v) => setBenefitCategory(v as BenefitCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BENEFIT_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">مستوى التغطية</Label>
                    <Select value={coverageLevel} onValueChange={(v) => setCoverageLevel(v as CoverageLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COVERAGE_LEVEL_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ENROLLMENT DATES - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  تفاصيل التسجيل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع التسجيل</Label>
                    <Select value={enrollmentType} onValueChange={(v) => setEnrollmentType(v as EnrollmentType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ENROLLMENT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ التسجيل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={enrollmentDate}
                      onChange={(e) => setEnrollmentDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ السريان <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ انتهاء التغطية</Label>
                    <Input
                      type="date"
                      value={coverageEndDate}
                      onChange={(e) => setCoverageEndDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COSTS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  التكاليف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تكلفة صاحب العمل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={employerCost || ''}
                      onChange={(e) => setEmployerCost(Number(e.target.value))}
                      placeholder="0.00"
                      className="h-11 rounded-xl"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تكلفة الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={employeeCost || ''}
                      onChange={(e) => setEmployeeCost(Number(e.target.value))}
                      placeholder="0.00"
                      className="h-11 rounded-xl"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">العملة</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* PROVIDER - Advanced */}
            <Collapsible open={openSections.includes('provider')} onOpenChange={() => toggleSection('provider')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                        مقدم الخدمة
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {providerName && (
                          <Badge className="bg-blue-100 text-blue-700">{providerName}</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('provider') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اسم مقدم الخدمة بالعربية</Label>
                        <Input
                          value={providerNameAr}
                          onChange={(e) => setProviderNameAr(e.target.value)}
                          placeholder="اسم مقدم الخدمة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Provider Name</Label>
                        <Input
                          value={providerName}
                          onChange={(e) => setProviderName(e.target.value)}
                          placeholder="Provider name in English"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">البريد الإلكتروني</Label>
                        <Input
                          type="email"
                          value={providerEmail}
                          onChange={(e) => {
                            setProviderEmail(e.target.value)
                            setProviderEmailError('')
                          }}
                          placeholder="provider@example.com"
                          className={`h-11 rounded-xl ${providerEmailError ? 'border-red-500' : ''}`}
                          dir="ltr"
                        />
                        {providerEmailError && (
                          <p className="text-sm text-red-500">{providerEmailError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">رقم الهاتف</Label>
                        <Input
                          value={providerPhone}
                          onChange={(e) => {
                            setProviderPhone(e.target.value)
                            setProviderPhoneError('')
                          }}
                          placeholder="+966"
                          className={`h-11 rounded-xl ${providerPhoneError ? 'border-red-500' : ''}`}
                          dir="ltr"
                        />
                        {providerPhoneError && (
                          <p className="text-sm text-red-500">{providerPhoneError}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* HEALTH INSURANCE DETAILS - Advanced (Only for health insurance) */}
            {benefitType === 'health_insurance' && (
              <Collapsible open={openSections.includes('health')} onOpenChange={() => toggleSection('health')}>
                <Card className="rounded-3xl shadow-sm border-slate-100">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-blue-500" />
                          تفاصيل التأمين الصحي
                        </CardTitle>
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('health') && "rotate-180")} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم البوليصة</Label>
                          <Input
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            placeholder="رقم البوليصة"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم العضوية</Label>
                          <Input
                            value={memberNumber}
                            onChange={(e) => setMemberNumber(e.target.value)}
                            placeholder="رقم العضوية"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">نوع الخطة</Label>
                          <Select value={planType} onValueChange={(v) => setPlanType(v as typeof planType)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">أساسي</SelectItem>
                              <SelectItem value="standard">قياسي</SelectItem>
                              <SelectItem value="premium">ممتاز</SelectItem>
                              <SelectItem value="executive">تنفيذي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">تغطية داخلية</span>
                          <Switch checked={inpatientCoverage} onCheckedChange={setInpatientCoverage} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">تغطية خارجية</span>
                          <Switch checked={outpatientCoverage} onCheckedChange={setOutpatientCoverage} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">تغطية أسنان</span>
                          <Switch checked={dentalCoverage} onCheckedChange={setDentalCoverage} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">تغطية أمومة</span>
                          <Switch checked={maternityCoverage} onCheckedChange={setMaternityCoverage} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الحد الأقصى السنوي</Label>
                        <Input
                          type="number"
                          value={annualMaximum || ''}
                          onChange={(e) => setAnnualMaximum(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl"
                          min={0}
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* LIFE INSURANCE DETAILS - Advanced (Only for life insurance) */}
            {benefitType === 'life_insurance' && (
              <Collapsible open={openSections.includes('life')} onOpenChange={() => toggleSection('life')}>
                <Card className="rounded-3xl shadow-sm border-slate-100">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-500" />
                          تفاصيل التأمين على الحياة
                        </CardTitle>
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('life') && "rotate-180")} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">مبلغ التغطية</Label>
                          <Input
                            type="number"
                            value={coverageAmount || ''}
                            onChange={(e) => setCoverageAmount(Number(e.target.value))}
                            placeholder="0"
                            className="h-11 rounded-xl"
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">نوع التغطية</Label>
                          <Select value={coverageType} onValueChange={(v) => setCoverageType(v as typeof coverageType)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="term">محدد المدة</SelectItem>
                              <SelectItem value="whole_life">مدى الحياة</SelectItem>
                              <SelectItem value="group_term">جماعي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">وفاة عرضية</span>
                          <Switch checked={accidentalDeath} onCheckedChange={setAccidentalDeath} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">أمراض خطيرة</span>
                          <Switch checked={criticalIllness} onCheckedChange={setCriticalIllness} />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* ALLOWANCE DETAILS - Advanced (Only for allowance types) */}
            {isAllowanceType && (
              <Collapsible open={openSections.includes('allowance')} onOpenChange={() => toggleSection('allowance')}>
                <Card className="rounded-3xl shadow-sm border-slate-100">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-emerald-500" />
                          تفاصيل البدل
                        </CardTitle>
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('allowance') && "rotate-180")} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">قيمة البدل</Label>
                          <Input
                            type="number"
                            value={allowanceAmount || ''}
                            onChange={(e) => setAllowanceAmount(Number(e.target.value))}
                            placeholder="0"
                            className="h-11 rounded-xl"
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">طريقة الحساب</Label>
                          <Select value={calculationType} onValueChange={(v) => setCalculationType(v as typeof calculationType)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">ثابت</SelectItem>
                              <SelectItem value="percentage_of_salary">نسبة من الراتب</SelectItem>
                              <SelectItem value="tiered">متدرج</SelectItem>
                              <SelectItem value="reimbursement">استرداد</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">تكرار الدفع</Label>
                          <Select value={paymentFrequency} onValueChange={(v) => setPaymentFrequency(v as PaymentFrequency)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PAYMENT_FREQUENCY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الحد السنوي</Label>
                        <Input
                          type="number"
                          value={annualLimit || ''}
                          onChange={(e) => setAnnualLimit(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl"
                          min={0}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">خاضع للضريبة</span>
                          <Switch checked={taxable} onCheckedChange={setTaxable} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">مشمول في GOSI</span>
                          <Switch checked={includedInGOSI} onCheckedChange={setIncludedInGOSI} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-700">مشمول في EOSB</span>
                          <Switch checked={includedInEOSB} onCheckedChange={setIncludedInEOSB} />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* NOTES - Advanced */}
            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" aria-hidden="true" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">وصف الميزة بالعربية</Label>
                      <Textarea
                        value={benefitDescriptionAr}
                        onChange={(e) => setBenefitDescriptionAr(e.target.value)}
                        placeholder="وصف مختصر للميزة..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Benefit Description</Label>
                      <Textarea
                        value={benefitDescription}
                        onChange={(e) => setBenefitDescription(e.target.value)}
                        placeholder="Brief benefit description..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات الموظف</Label>
                      <Textarea
                        value={employeeNotes}
                        onChange={(e) => setEmployeeNotes(e.target.value)}
                        placeholder="ملاحظات إضافية من الموظف..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات الموارد البشرية</Label>
                      <Textarea
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="ملاحظات داخلية..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.hr.benefits.list })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تسجيل الميزة'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
