import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateCompensation, useUpdateCompensation, useCompensationRecord } from '@/hooks/useCompensation'
import { useEmployees } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Search, Bell, ArrowRight, User, Building2, CheckCircle,
  ChevronDown, Briefcase, Calendar, DollarSign, Wallet,
  Percent, Receipt, Award, TrendingUp, Clock, Shield,
  FileText, MessageSquare, Scale, Users, Plus, Trash2
} from 'lucide-react'
import {
  compensationStatusLabels,
  paymentFrequencyLabels,
  salaryBasisLabels,
  paymentMethodLabels,
  allowanceTypeLabels,
  calculationTypeLabels,
  bonusTypeLabels,
  changeTypeLabels,
  reviewStatusLabels,
  compaRatioCategoryLabels,
  compensationModelLabels,
  partnershipTierLabels,
  employmentTypeLabels,
  CompensationStatus,
  PaymentFrequency,
  SalaryBasis,
  PaymentMethod,
  AllowanceType,
  CalculationType,
  BonusType,
  ChangeType,
  ReviewStatus,
  CompaRatioCategory,
  CompensationModel,
  PartnershipTier,
  EmploymentType,
  type CreateCompensationInput,
  type Allowance,
} from '@/services/compensationService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function CompensationCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingRecord, isLoading: isLoadingRecord } = useCompensationRecord(editId || '')
  const createMutation = useCreateCompensation()
  const updateMutation = useUpdateCompensation()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({})

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Basic Fields
  const [employeeId, setEmployeeId] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [department, setDepartment] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobTitleAr, setJobTitleAr] = useState('')

  // Current Compensation
  const [basicSalary, setBasicSalary] = useState<number>(0)
  const [totalAllowances, setTotalAllowances] = useState<number>(0)
  const [grossSalary, setGrossSalary] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')

  // Pay Grade
  const [payGrade, setPayGrade] = useState('')
  const [salaryRangeMin, setSalaryRangeMin] = useState<number>(0)
  const [salaryRangeMid, setSalaryRangeMid] = useState<number>(0)
  const [salaryRangeMax, setSalaryRangeMax] = useState<number>(0)

  // Position in Range
  const [compaRatio, setCompaRatio] = useState<number>(1)
  const [compaRatioCategory, setCompaRatioCategory] = useState<CompaRatioCategory>(CompaRatioCategory.IN_RANGE_MID)
  const [rangePenetration, setRangePenetration] = useState<number>(0.5)

  // Status & Dates
  const [status, setStatus] = useState<CompensationStatus>(CompensationStatus.ACTIVE)
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])
  const [reviewDate, setReviewDate] = useState('')
  const [nextReviewDate, setNextReviewDate] = useState('')

  // Payment Details
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(PaymentFrequency.MONTHLY)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER)
  const [salaryBasis, setSalaryBasis] = useState<SalaryBasis>(SalaryBasis.MONTHLY)

  // Employee Details (Advanced)
  const [employmentType, setEmploymentType] = useState<EmploymentType>(EmploymentType.FULL_TIME)
  const [isSaudi, setIsSaudi] = useState(true)
  const [nationality, setNationality] = useState('سعودي')
  const [numberOfDependents, setNumberOfDependents] = useState<number>(0)

  // Allowances
  const [allowances, setAllowances] = useState<Partial<Allowance>[]>([])

  // Housing Allowance
  const [housingProvided, setHousingProvided] = useState(true)
  const [housingAmount, setHousingAmount] = useState<number>(0)
  const [housingCalculationType, setHousingCalculationType] = useState<CalculationType>(CalculationType.PERCENTAGE_OF_BASIC)
  const [housingPercentage, setHousingPercentage] = useState<number>(25)
  const [housingTaxable, setHousingTaxable] = useState(false)
  const [housingIncludedInGOSI, setHousingIncludedInGOSI] = useState(true)
  const [housingIncludedInEOSB, setHousingIncludedInEOSB] = useState(true)

  // Transportation Allowance
  const [transportationProvided, setTransportationProvided] = useState(true)
  const [transportationAmount, setTransportationAmount] = useState<number>(0)
  const [transportationCalculationType, setTransportationCalculationType] = useState<CalculationType>(CalculationType.PERCENTAGE_OF_BASIC)
  const [transportationPercentage, setTransportationPercentage] = useState<number>(10)

  // Variable Compensation
  const [eligibleForVariablePay, setEligibleForVariablePay] = useState(false)
  const [eligibleForBonus, setEligibleForBonus] = useState(false)
  const [bonusType, setBonusType] = useState<BonusType>(BonusType.DISCRETIONARY)
  const [targetBonusPercentage, setTargetBonusPercentage] = useState<number>(10)
  const [eligibleForCommission, setEligibleForCommission] = useState(false)
  const [commissionRate, setCommissionRate] = useState<number>(0)

  // Attorney Compensation
  const [isAttorney, setIsAttorney] = useState(false)
  const [compensationModel, setCompensationModel] = useState<CompensationModel>(CompensationModel.SALARY_PLUS_BONUS)
  const [partnershipTier, setPartnershipTier] = useState<PartnershipTier | ''>('')
  const [equityPercentage, setEquityPercentage] = useState<number>(0)
  const [billableHoursTarget, setBillableHoursTarget] = useState<number>(0)
  const [averageHourlyRate, setAverageHourlyRate] = useState<number>(0)

  // Salary Review
  const [eligibleForReview, setEligibleForReview] = useState(true)
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(ReviewStatus.NOT_STARTED)
  const [recommendedIncrease, setRecommendedIncrease] = useState<number>(0)
  const [recommendedPercentage, setRecommendedPercentage] = useState<number>(0)

  // Deductions
  const [gosiEmployeeContribution, setGosiEmployeeContribution] = useState<number>(0)
  const [gosiEmployerContribution, setGosiEmployerContribution] = useState<number>(0)

  // Compliance
  const [saudiLaborLawCompliant, setSaudiLaborLawCompliant] = useState(true)
  const [minimumWageCompliant, setMinimumWageCompliant] = useState(true)
  const [eosbCompliant, setEosbCompliant] = useState(true)

  // Notes
  const [notes, setNotes] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Calculate derived values
  useEffect(() => {
    // Calculate housing amount if percentage-based
    if (housingCalculationType === CalculationType.PERCENTAGE_OF_BASIC) {
      setHousingAmount(basicSalary * (housingPercentage / 100))
    }

    // Calculate transportation amount if percentage-based
    if (transportationCalculationType === CalculationType.PERCENTAGE_OF_BASIC) {
      setTransportationAmount(basicSalary * (transportationPercentage / 100))
    }
  }, [basicSalary, housingCalculationType, housingPercentage, transportationCalculationType, transportationPercentage])

  // Calculate total allowances and gross salary
  useEffect(() => {
    let total = 0
    if (housingProvided) total += housingAmount
    if (transportationProvided) total += transportationAmount
    allowances.forEach(a => {
      if (a.amount) total += a.amount
    })
    setTotalAllowances(total)
    setGrossSalary(basicSalary + total)
  }, [basicSalary, housingProvided, housingAmount, transportationProvided, transportationAmount, allowances])

  // Calculate compa-ratio and range penetration
  useEffect(() => {
    if (salaryRangeMid > 0) {
      setCompaRatio(basicSalary / salaryRangeMid)
    }
    if (salaryRangeMax > salaryRangeMin) {
      setRangePenetration((basicSalary - salaryRangeMin) / (salaryRangeMax - salaryRangeMin))
    }
  }, [basicSalary, salaryRangeMid, salaryRangeMin, salaryRangeMax])

  // Handle employee selection
  const handleEmployeeSelect = (empId: string) => {
    setEmployeeId(empId)
    const employee = employeesData?.data?.find((e: any) => e._id === empId)
    if (employee) {
      setEmployeeName(`${employee.firstName} ${employee.lastName}`)
      setEmployeeNameAr(`${employee.firstNameAr || employee.firstName} ${employee.lastNameAr || employee.lastName}`)
      setEmployeeNumber(employee.employeeNumber || '')
      setDepartment(employee.departmentName || '')
      setDepartmentId(employee.departmentId || '')
      setJobTitle(employee.jobTitle || '')
      setJobTitleAr(employee.jobTitleAr || '')
    }
  }

  // Add a new allowance
  const addAllowance = () => {
    setAllowances([...allowances, {
      allowanceType: AllowanceType.OTHER,
      allowanceName: '',
      amount: 0,
      calculationType: CalculationType.FIXED,
      frequency: 'monthly',
      taxable: false,
      includedInGOSI: false,
      includedInEOSB: false,
      startDate: effectiveDate,
      temporary: false,
    }])
  }

  // Remove an allowance
  const removeAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index))
  }

  // Update allowance field
  const updateAllowance = (index: number, field: keyof Allowance, value: any) => {
    const updated = [...allowances]
    updated[index] = { ...updated[index], [field]: value }
    setAllowances(updated)
  }

  // Populate form when editing
  useEffect(() => {
    if (existingRecord && isEditMode) {
      setEmployeeId(existingRecord.employeeId || '')
      setEmployeeNumber(existingRecord.employeeNumber || '')
      setEmployeeName(existingRecord.employeeName || '')
      setEmployeeNameAr(existingRecord.employeeNameAr || '')
      setDepartment(existingRecord.department || '')
      setDepartmentId(existingRecord.departmentId || '')
      setJobTitle(existingRecord.jobTitle || '')
      setJobTitleAr(existingRecord.jobTitleAr || '')
      setBasicSalary(existingRecord.basicSalary || 0)
      setTotalAllowances(existingRecord.totalAllowances || 0)
      setGrossSalary(existingRecord.grossSalary || 0)
      setCurrency(existingRecord.currency || 'SAR')
      setPayGrade(existingRecord.payGrade || '')
      setSalaryRangeMin(existingRecord.salaryRangeMin || 0)
      setSalaryRangeMid(existingRecord.salaryRangeMid || 0)
      setSalaryRangeMax(existingRecord.salaryRangeMax || 0)
      setCompaRatio(existingRecord.compaRatio || 1)
      setCompaRatioCategory(existingRecord.compaRatioCategory || CompaRatioCategory.IN_RANGE_MID)
      setRangePenetration(existingRecord.rangePenetration || 0.5)
      setStatus(existingRecord.status)
      setEffectiveDate(existingRecord.effectiveDate?.split('T')[0] || '')
      setReviewDate(existingRecord.reviewDate?.split('T')[0] || '')
      setNextReviewDate(existingRecord.nextReviewDate?.split('T')[0] || '')
      setPaymentFrequency(existingRecord.paymentFrequency || PaymentFrequency.MONTHLY)
      setPaymentMethod(existingRecord.paymentMethod || PaymentMethod.BANK_TRANSFER)
      setSalaryBasis(existingRecord.salaryBasis || SalaryBasis.MONTHLY)

      if (existingRecord.employeeDetails) {
        setEmploymentType(existingRecord.employeeDetails.employmentType || EmploymentType.FULL_TIME)
        setIsSaudi(existingRecord.employeeDetails.isSaudi ?? true)
        setNationality(existingRecord.employeeDetails.nationality || 'سعودي')
        setNumberOfDependents(existingRecord.employeeDetails.numberOfDependents || 0)
      }

      if (existingRecord.housingAllowance) {
        setHousingProvided(existingRecord.housingAllowance.provided)
        setHousingAmount(existingRecord.housingAllowance.amount)
        setHousingCalculationType(existingRecord.housingAllowance.calculationType)
        setHousingPercentage(existingRecord.housingAllowance.percentage || 25)
        setHousingTaxable(existingRecord.housingAllowance.taxable)
        setHousingIncludedInGOSI(existingRecord.housingAllowance.includedInGOSI)
        setHousingIncludedInEOSB(existingRecord.housingAllowance.includedInEOSB)
      }

      if (existingRecord.transportationAllowance) {
        setTransportationProvided(existingRecord.transportationAllowance.provided)
        setTransportationAmount(existingRecord.transportationAllowance.amount)
        setTransportationCalculationType(existingRecord.transportationAllowance.calculationType)
        setTransportationPercentage(existingRecord.transportationAllowance.percentage || 10)
      }

      if (existingRecord.variableCompensation) {
        setEligibleForVariablePay(existingRecord.variableCompensation.eligibleForVariablePay)
        if (existingRecord.variableCompensation.annualBonus) {
          setEligibleForBonus(existingRecord.variableCompensation.annualBonus.eligible || false)
          setBonusType(existingRecord.variableCompensation.annualBonus.bonusType || BonusType.DISCRETIONARY)
          setTargetBonusPercentage(existingRecord.variableCompensation.annualBonus.targetPercentage || 10)
        }
        if (existingRecord.variableCompensation.commission) {
          setEligibleForCommission(existingRecord.variableCompensation.commission.eligible || false)
          setCommissionRate(existingRecord.variableCompensation.commission.commissionRate || 0)
        }
      }

      if (existingRecord.attorneyCompensation) {
        setIsAttorney(existingRecord.attorneyCompensation.isAttorney)
        setCompensationModel(existingRecord.attorneyCompensation.compensationModel || CompensationModel.SALARY_PLUS_BONUS)
        setPartnershipTier(existingRecord.attorneyCompensation.partnershipTier || '')
        setEquityPercentage(existingRecord.attorneyCompensation.equityPercentage || 0)
        setBillableHoursTarget(existingRecord.attorneyCompensation.billableHoursTarget || 0)
        setAverageHourlyRate(existingRecord.attorneyCompensation.averageHourlyRate || 0)
      }

      if (existingRecord.salaryReview) {
        setEligibleForReview(existingRecord.salaryReview.eligibleForReview)
        setReviewStatus(existingRecord.salaryReview.reviewStatus || ReviewStatus.NOT_STARTED)
        setRecommendedIncrease(existingRecord.salaryReview.recommendedIncrease || 0)
        setRecommendedPercentage(existingRecord.salaryReview.recommendedPercentage || 0)
      }

      if (existingRecord.deductions) {
        setGosiEmployeeContribution(existingRecord.deductions.gosiEmployeeContribution || 0)
        setGosiEmployerContribution(existingRecord.deductions.gosiEmployerContribution || 0)
      }

      if (existingRecord.compliance) {
        setSaudiLaborLawCompliant(existingRecord.compliance.saudiLaborLawCompliant)
        setMinimumWageCompliant(existingRecord.compliance.minimumWageCompliant ?? true)
        setEosbCompliant(existingRecord.compliance.eosbCompliant ?? true)
      }

      if (existingRecord.allowances) {
        setAllowances(existingRecord.allowances)
      }

      if (existingRecord.notes?.compensationNotes) {
        setNotes(existingRecord.notes.compensationNotes)
      }
    }
  }, [existingRecord, isEditMode])

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateCompensationInput = {
      employeeId,
      employeeNumber,
      employeeName,
      basicSalary,
      totalAllowances,
      grossSalary,
      currency,
      payGrade,
      salaryRangeMin,
      salaryRangeMax,
      compaRatio,
      status,
      effectiveDate,
      officeId: 'default', // TODO: Get from context

      employeeNameAr: employeeNameAr || undefined,
      department: department || undefined,
      departmentId: departmentId || undefined,
      jobTitle: jobTitle || undefined,
      jobTitleAr: jobTitleAr || undefined,
      salaryRangeMid: salaryRangeMid || undefined,
      compaRatioCategory,
      rangePenetration,
      reviewDate: reviewDate || undefined,
      nextReviewDate: nextReviewDate || undefined,
      paymentFrequency,
      paymentMethod,
      salaryBasis,

      employeeDetails: {
        employmentType,
        isSaudi,
        nationality,
        numberOfDependents,
      },

      housingAllowance: {
        provided: housingProvided,
        amount: housingAmount,
        calculationType: housingCalculationType,
        percentage: housingPercentage,
        taxable: housingTaxable,
        includedInGOSI: housingIncludedInGOSI,
        includedInEOSB: housingIncludedInEOSB,
      },

      transportationAllowance: {
        provided: transportationProvided,
        amount: transportationAmount,
        calculationType: transportationCalculationType,
        percentage: transportationPercentage,
      },

      allowances: allowances.filter(a => a.allowanceName).map(a => ({
        allowanceType: a.allowanceType || AllowanceType.OTHER,
        allowanceName: a.allowanceName || '',
        amount: a.amount || 0,
        calculationType: a.calculationType || CalculationType.FIXED,
        frequency: a.frequency || 'monthly',
        taxable: a.taxable || false,
        includedInGOSI: a.includedInGOSI || false,
        includedInEOSB: a.includedInEOSB || false,
        startDate: a.startDate || effectiveDate,
        temporary: a.temporary || false,
      })) as Allowance[],

      variableCompensation: {
        eligibleForVariablePay,
        annualBonus: {
          eligible: eligibleForBonus,
          bonusType,
          targetPercentage: targetBonusPercentage,
          targetAmount: basicSalary * (targetBonusPercentage / 100),
        },
        commission: {
          eligible: eligibleForCommission,
          commissionRate,
        },
      },

      attorneyCompensation: isAttorney ? {
        isAttorney: true,
        compensationModel,
        partnershipTier: partnershipTier as PartnershipTier || undefined,
        equityPercentage: equityPercentage || undefined,
        billableHoursTarget,
        averageHourlyRate,
      } : undefined,

      salaryReview: {
        eligibleForReview,
        reviewStatus,
        recommendedIncrease: recommendedIncrease || undefined,
        recommendedPercentage: recommendedPercentage || undefined,
      },

      deductions: {
        gosiEmployeeContribution,
        gosiEmployerContribution,
        gosiContributionBase: basicSalary + housingAmount,
      },

      compliance: {
        saudiLaborLawCompliant,
        minimumWageCompliant,
        eosbCompliant,
      },

      notes: notes ? {
        compensationNotes: notes,
      } : undefined,
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        id: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/compensation' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التعويضات', href: '/dashboard/hr/compensation', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل سجل التعويضات' : 'إنشاء سجل تعويضات'}
          type="compensation"
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
                onClick={() => navigate({ to: '/dashboard/hr/compensation' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل سجل التعويضات' : 'إنشاء سجل تعويضات جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات التعويضات' : 'إضافة سجل تعويضات جديد للموظف'}
                </p>
              </div>
            </div>

            {/* OFFICE TYPE SELECTOR */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
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

            {/* EMPLOYEE SELECTION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  بيانات الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Select value={employeeId} onValueChange={handleEmployeeSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesData?.data?.map((employee: any) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.firstNameAr || employee.firstName} {employee.lastNameAr || employee.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رقم الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      placeholder="مثال: EMP001"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                {employeeName && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600">
                      <strong>الموظف:</strong> {employeeNameAr || employeeName}
                      {jobTitle && <span className="me-4"><strong>المسمى:</strong> {jobTitleAr || jobTitle}</span>}
                      {department && <span className="me-4"><strong>القسم:</strong> {department}</span>}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* BASIC SALARY & COMPENSATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  الراتب الأساسي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الراتب الأساسي <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl"
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
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الحالة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as CompensationStatus)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(compensationStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Salary Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">الراتب الأساسي</p>
                    <p className="text-lg font-bold text-navy">{formatCurrency(basicSalary)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">إجمالي البدلات</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(totalAllowances)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">الراتب الإجمالي</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(grossSalary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PAY GRADE & RANGE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  الدرجة الوظيفية ونطاق الراتب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الدرجة الوظيفية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={payGrade}
                      onChange={(e) => setPayGrade(e.target.value)}
                      placeholder="مثال: G5"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الحد الأدنى <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={salaryRangeMin}
                      onChange={(e) => setSalaryRangeMin(parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نقطة المنتصف</Label>
                    <Input
                      type="number"
                      value={salaryRangeMid}
                      onChange={(e) => setSalaryRangeMid(parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الحد الأقصى <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={salaryRangeMax}
                      onChange={(e) => setSalaryRangeMax(parseFloat(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* Compa-Ratio Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Compa-Ratio</span>
                      <span className={cn(
                        "text-lg font-bold",
                        compaRatio < 0.8 ? 'text-red-600' :
                        compaRatio > 1.2 ? 'text-purple-600' : 'text-emerald-600'
                      )}>
                        {(compaRatio * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تصنيف الموقع</Label>
                    <Select value={compaRatioCategory} onValueChange={(v) => setCompaRatioCategory(v as CompaRatioCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(compaRatioCategoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Range Visualization */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{formatCurrency(salaryRangeMin)}</span>
                    <span>موقع الراتب في النطاق</span>
                    <span>{formatCurrency(salaryRangeMax)}</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                      style={{ width: `${Math.min(rangePenetration * 100, 100)}%` }}
                    />
                    <div
                      className="absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full -top-0.5"
                      style={{ left: `calc(${Math.min(Math.max(rangePenetration * 100, 0), 100)}% - 8px)` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HOUSING ALLOWANCE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    بدل السكن
                  </CardTitle>
                  <Switch checked={housingProvided} onCheckedChange={setHousingProvided} />
                </div>
              </CardHeader>
              {housingProvided && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">طريقة الحساب</Label>
                      <Select value={housingCalculationType} onValueChange={(v) => setHousingCalculationType(v as CalculationType)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(calculationTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {housingCalculationType === CalculationType.PERCENTAGE_OF_BASIC ? (
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">النسبة (%)</Label>
                        <Input
                          type="number"
                          value={housingPercentage}
                          onChange={(e) => setHousingPercentage(parseFloat(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المبلغ</Label>
                        <Input
                          type="number"
                          value={housingAmount}
                          onChange={(e) => setHousingAmount(parseFloat(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    )}
                    <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-slate-600">المبلغ المحسوب</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(housingAmount)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">خاضع للضريبة</span>
                      <Switch checked={housingTaxable} onCheckedChange={setHousingTaxable} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">يشمل GOSI</span>
                      <Switch checked={housingIncludedInGOSI} onCheckedChange={setHousingIncludedInGOSI} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">يشمل EOSB</span>
                      <Switch checked={housingIncludedInEOSB} onCheckedChange={setHousingIncludedInEOSB} />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* TRANSPORTATION ALLOWANCE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-amber-500" />
                    بدل المواصلات
                  </CardTitle>
                  <Switch checked={transportationProvided} onCheckedChange={setTransportationProvided} />
                </div>
              </CardHeader>
              {transportationProvided && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">طريقة الحساب</Label>
                      <Select value={transportationCalculationType} onValueChange={(v) => setTransportationCalculationType(v as CalculationType)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(calculationTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {transportationCalculationType === CalculationType.PERCENTAGE_OF_BASIC ? (
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">النسبة (%)</Label>
                        <Input
                          type="number"
                          value={transportationPercentage}
                          onChange={(e) => setTransportationPercentage(parseFloat(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المبلغ</Label>
                        <Input
                          type="number"
                          value={transportationAmount}
                          onChange={(e) => setTransportationAmount(parseFloat(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    )}
                    <div className="p-4 bg-amber-50 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-slate-600">المبلغ المحسوب</span>
                      <span className="text-lg font-bold text-amber-600">{formatCurrency(transportationAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* PAYMENT DETAILS */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-500" />
                  تفاصيل الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تكرار الدفع</Label>
                    <Select value={paymentFrequency} onValueChange={(v) => setPaymentFrequency(v as PaymentFrequency)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentFrequencyLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">طريقة الدفع</Label>
                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentMethodLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">أساس الراتب</Label>
                    <Select value={salaryBasis} onValueChange={(v) => setSalaryBasis(v as SalaryBasis)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(salaryBasisLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATES */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label className="text-navy font-medium">تاريخ المراجعة</Label>
                    <Input
                      type="date"
                      value={reviewDate}
                      onChange={(e) => setReviewDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المراجعة القادمة</Label>
                    <Input
                      type="date"
                      value={nextReviewDate}
                      onChange={(e) => setNextReviewDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* ADDITIONAL ALLOWANCES - Advanced */}
            <Collapsible open={openSections.includes('allowances')} onOpenChange={() => toggleSection('allowances')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-green-500" />
                        بدلات إضافية
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('allowances') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {allowances.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>لم تتم إضافة بدلات إضافية</p>
                      </div>
                    ) : (
                      allowances.map((allowance, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">بدل {index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAllowance(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">نوع البدل</Label>
                              <Select
                                value={allowance.allowanceType}
                                onValueChange={(v) => updateAllowance(index, 'allowanceType', v)}
                              >
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(allowanceTypeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">اسم البدل</Label>
                              <Input
                                value={allowance.allowanceName || ''}
                                onChange={(e) => updateAllowance(index, 'allowanceName', e.target.value)}
                                placeholder="اسم البدل"
                                className="h-11 rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">المبلغ</Label>
                              <Input
                                type="number"
                                value={allowance.amount || 0}
                                onChange={(e) => updateAllowance(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-11 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAllowance}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 ms-1" />
                      إضافة بدل
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* VARIABLE COMPENSATION - Advanced */}
            <Collapsible open={openSections.includes('variable')} onOpenChange={() => toggleSection('variable')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        التعويضات المتغيرة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('variable') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">مؤهل للتعويضات المتغيرة</span>
                      <Switch checked={eligibleForVariablePay} onCheckedChange={setEligibleForVariablePay} />
                    </div>

                    {eligibleForVariablePay && (
                      <>
                        {/* Annual Bonus */}
                        <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-amber-800">المكافأة السنوية</span>
                            <Switch checked={eligibleForBonus} onCheckedChange={setEligibleForBonus} />
                          </div>
                          {eligibleForBonus && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-navy font-medium">نوع المكافأة</Label>
                                <Select value={bonusType} onValueChange={(v) => setBonusType(v as BonusType)}>
                                  <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(bonusTypeLabels).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-navy font-medium">النسبة المستهدفة (%)</Label>
                                <Input
                                  type="number"
                                  value={targetBonusPercentage}
                                  onChange={(e) => setTargetBonusPercentage(parseFloat(e.target.value) || 0)}
                                  className="h-11 rounded-xl"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Commission */}
                        <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-800">العمولة</span>
                            <Switch checked={eligibleForCommission} onCheckedChange={setEligibleForCommission} />
                          </div>
                          {eligibleForCommission && (
                            <div className="space-y-2">
                              <Label className="text-navy font-medium">نسبة العمولة (%)</Label>
                              <Input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                                className="h-11 rounded-xl max-w-xs"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* ATTORNEY COMPENSATION - Advanced */}
            <Collapsible open={openSections.includes('attorney')} onOpenChange={() => toggleSection('attorney')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-indigo-500" />
                        تعويضات المحامي
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('attorney') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">الموظف محامي</span>
                      <Switch checked={isAttorney} onCheckedChange={setIsAttorney} />
                    </div>

                    {isAttorney && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">نموذج التعويض</Label>
                            <Select value={compensationModel} onValueChange={(v) => setCompensationModel(v as CompensationModel)}>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(compensationModelLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">مستوى الشراكة</Label>
                            <Select value={partnershipTier} onValueChange={(v) => setPartnershipTier(v as PartnershipTier)}>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(partnershipTierLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">نسبة الحصة (%)</Label>
                            <Input
                              type="number"
                              value={equityPercentage}
                              onChange={(e) => setEquityPercentage(parseFloat(e.target.value) || 0)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">ساعات العمل المستهدفة</Label>
                            <Input
                              type="number"
                              value={billableHoursTarget}
                              onChange={(e) => setBillableHoursTarget(parseInt(e.target.value) || 0)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">متوسط سعر الساعة</Label>
                            <Input
                              type="number"
                              value={averageHourlyRate}
                              onChange={(e) => setAverageHourlyRate(parseFloat(e.target.value) || 0)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* SALARY REVIEW - Advanced */}
            <Collapsible open={openSections.includes('review')} onOpenChange={() => toggleSection('review')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500" />
                        مراجعة الراتب
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('review') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">مؤهل للمراجعة</span>
                      <Switch checked={eligibleForReview} onCheckedChange={setEligibleForReview} />
                    </div>

                    {eligibleForReview && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">حالة المراجعة</Label>
                          <Select value={reviewStatus} onValueChange={(v) => setReviewStatus(v as ReviewStatus)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(reviewStatusLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">الزيادة الموصى بها</Label>
                          <Input
                            type="number"
                            value={recommendedIncrease}
                            onChange={(e) => setRecommendedIncrease(parseFloat(e.target.value) || 0)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">النسبة الموصى بها (%)</Label>
                          <Input
                            type="number"
                            value={recommendedPercentage}
                            onChange={(e) => setRecommendedPercentage(parseFloat(e.target.value) || 0)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* COMPLIANCE - Advanced */}
            <Collapsible open={openSections.includes('compliance')} onOpenChange={() => toggleSection('compliance')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        الامتثال والتوافق
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('compliance') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">متوافق مع نظام العمل</span>
                        <Switch checked={saudiLaborLawCompliant} onCheckedChange={setSaudiLaborLawCompliant} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">الحد الأدنى للأجور</span>
                        <Switch checked={minimumWageCompliant} onCheckedChange={setMinimumWageCompliant} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">مستحقات نهاية الخدمة</span>
                        <Switch checked={eosbCompliant} onCheckedChange={setEosbCompliant} />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* NOTES - Advanced */}
            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        ملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات إضافية</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أي ملاحظات إضافية حول التعويضات..."
                        className="rounded-xl min-h-[100px]"
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
                onClick={() => navigate({ to: '/dashboard/hr/compensation' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !employeeNumber || !basicSalary || !payGrade || !effectiveDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء السجل'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="compensation" />
        </div>
      </Main>
    </>
  )
}
