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
import { useCreateAdvance, useUpdateAdvance, useAdvance, useCheckAdvanceEligibility } from '@/hooks/useAdvances'
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
  Search, Bell, ArrowRight, User, Building2, Calendar,
  CheckCircle, ChevronDown, Users, DollarSign, FileText,
  AlertTriangle, Shield, Wallet, Calculator, Clock, Zap
} from 'lucide-react'
import {
  ADVANCE_TYPE_LABELS,
  URGENCY_LABELS,
  type AdvanceType,
  type AdvanceCategory,
  type UrgencyLevel,
  type CreateAdvanceData,
} from '@/services/advancesService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function AdvancesCreateView() {
  const getColorClasses = (color: string) => {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        pink: 'bg-pink-100 text-pink-700 border-pink-200',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        violet: 'bg-violet-100 text-violet-700 border-violet-200',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        teal: 'bg-teal-100 text-teal-700 border-teal-200',
        cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
}

const getBorderBgTextClasses = (color: string) => {
    const colorMap = {
        blue: 'border-blue-500 bg-blue-50 text-blue-700',
        green: 'border-green-500 bg-green-50 text-green-700',
        emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
        red: 'border-red-500 bg-red-50 text-red-700',
        amber: 'border-amber-500 bg-amber-50 text-amber-700',
        yellow: 'border-yellow-500 bg-yellow-50 text-yellow-700',
        orange: 'border-orange-500 bg-orange-50 text-orange-700',
        purple: 'border-purple-500 bg-purple-50 text-purple-700',
        pink: 'border-pink-500 bg-pink-50 text-pink-700',
        indigo: 'border-indigo-500 bg-indigo-50 text-indigo-700',
        slate: 'border-slate-500 bg-slate-50 text-slate-700',
        gray: 'border-gray-500 bg-gray-50 text-gray-700',
    }
    return colorMap[color] || 'border-gray-500 bg-gray-50 text-gray-700'
}

const getBgClasses = (color: string) => {
    const colorMap = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        emerald: 'bg-emerald-100',
        red: 'bg-red-100',
        amber: 'bg-amber-100',
        yellow: 'bg-yellow-100',
        orange: 'bg-orange-100',
        purple: 'bg-purple-100',
        pink: 'bg-pink-100',
        indigo: 'bg-indigo-100',
        slate: 'bg-slate-100',
        gray: 'bg-gray-100',
        teal: 'bg-teal-100',
    }
    return colorMap[color] || 'bg-gray-100'
}

  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingAdvance, isLoading: isLoadingAdvance } = useAdvance(editId || '')
  const createMutation = useCreateAdvance()
  const updateMutation = useUpdateAdvance()
  const checkEligibilityMutation = useCheckAdvanceEligibility()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Eligibility result
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean
    maxAdvanceLimit: number
    availableLimit: number
    ineligibilityReasons?: string[]
  } | null>(null)

  // Form State - Basic Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Form State - Advance Details
  const [advanceType, setAdvanceType] = useState<AdvanceType>('salary')
  const [advanceCategory, setAdvanceCategory] = useState<AdvanceCategory>('regular')
  const [advanceAmount, setAdvanceAmount] = useState<number>(0)
  const [currency] = useState('SAR')
  const [reason, setReason] = useState('')
  const [reasonAr, setReasonAr] = useState('')
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium')
  const [isEmergency, setIsEmergency] = useState(false)

  // Form State - Repayment
  const [installments, setInstallments] = useState<number>(1)
  const [installmentAmount, setInstallmentAmount] = useState<number>(0)
  const [startDate, setStartDate] = useState('')

  // Form State - Notes
  const [employeeNotes, setEmployeeNotes] = useState('')
  const [hrNotes, setHrNotes] = useState('')

  // Calculate installment amount
  useEffect(() => {
    if (advanceAmount > 0 && installments > 0) {
      setInstallmentAmount(Math.ceil(advanceAmount / installments))
    }
  }, [advanceAmount, installments])

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
    if (existingAdvance && isEditMode) {
      setEmployeeId(existingAdvance.employeeId || '')
      setEmployeeName(existingAdvance.employeeName || '')
      setEmployeeNameAr(existingAdvance.employeeNameAr || '')
      setEmployeeNumber(existingAdvance.employeeNumber || '')
      setDepartment(existingAdvance.department || '')
      setJobTitle(existingAdvance.jobTitle || '')
      setAdvanceType(existingAdvance.advanceType)
      setAdvanceCategory(existingAdvance.advanceCategory || 'regular')
      setAdvanceAmount(existingAdvance.advanceAmount || 0)
      setReason(existingAdvance.reason || '')
      setReasonAr(existingAdvance.reasonAr || '')
      setUrgency(existingAdvance.urgency || 'medium')
      setIsEmergency(existingAdvance.isEmergency || false)
      setInstallments(existingAdvance.repayment?.installments || 1)
      setStartDate(existingAdvance.repayment?.startDate?.split('T')[0] || '')
      setEmployeeNotes(existingAdvance.notes?.employeeNotes || '')
      setHrNotes(existingAdvance.notes?.hrNotes || '')
    }
  }, [existingAdvance, isEditMode])

  // Handle employee selection
  const handleEmployeeSelect = async (selectedEmployeeId: string) => {
    setEmployeeId(selectedEmployeeId)
    const employee = employeesData?.employees?.find(e => e._id === selectedEmployeeId)
    if (employee) {
      setEmployeeName(employee.personalInfo?.fullNameEnglish || '')
      setEmployeeNameAr(employee.personalInfo?.fullNameArabic || '')
      setEmployeeNumber(employee.employeeId || '')
      setDepartment(employee.employment?.departmentName || '')
      setJobTitle(employee.employment?.jobTitle || '')
    }
  }

  // Check eligibility
  const handleCheckEligibility = async () => {
    if (!employeeId || advanceAmount <= 0) return
    try {
      const result = await checkEligibilityMutation.mutateAsync({
        employeeId,
        amount: advanceAmount,
      })
      setEligibilityResult(result)
    } catch {
      // Error handled by mutation
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateAdvanceData = {
      employeeId,
      employeeName,
      employeeNameAr,
      employeeNumber,
      department,
      jobTitle,
      advanceType,
      advanceCategory,
      advanceAmount,
      currency,
      reason: reason || undefined,
      reasonAr: reasonAr || undefined,
      urgency,
      isEmergency,
      installments,
      startDate,
      notes: {
        employeeNotes: employeeNotes || undefined,
        hrNotes: hrNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        advanceId: editId,
        data: {
          advanceType,
          advanceAmount,
          reason,
          reasonAr,
          urgency,
          repayment: {
            installments,
            startDate,
          },
          notes: { employeeNotes, hrNotes },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: ROUTES.dashboard.hr.advances.list })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'السلف', href: ROUTES.dashboard.hr.advances.list, isActive: true },
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
          title={isEditMode ? 'تعديل طلب السلفة' : 'طلب سلفة جديدة'}
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
                onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.list })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل طلب السلفة' : 'طلب سلفة جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات طلب السلفة' : 'إنشاء طلب سلفة للموظف'}
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
                    <Label className="text-navy font-medium">الاسم بالعربية</Label>
                    <Input
                      value={employeeNameAr}
                      onChange={(e) => setEmployeeNameAr(e.target.value)}
                      placeholder="اسم الموظف بالعربية"
                      className="h-11 rounded-xl"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">رقم الموظف</Label>
                    <Input
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      placeholder="رقم الموظف"
                      className="h-11 rounded-xl"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">القسم</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="اسم القسم"
                      className="h-11 rounded-xl"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ADVANCE TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  نوع السلفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(ADVANCE_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAdvanceType(key as AdvanceType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        advanceType === key
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <span className="text-sm font-medium block">{label.ar}</span>
                      <span className="text-xs opacity-75">{label.en}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* EMERGENCY & URGENCY - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  الأولوية والطوارئ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">سلفة طوارئ</p>
                      <p className="text-xs text-red-600">تفعيل المسار السريع للموافقة</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEmergency}
                    onCheckedChange={setIsEmergency}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">مستوى الأولوية</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setUrgency(key as UrgencyLevel)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          urgency === key
                            ? getBorderBgTextClasses(label.color)
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ADVANCE AMOUNT & REPAYMENT - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  مبلغ السلفة والسداد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      مبلغ السلفة (ريال) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={advanceAmount || ''}
                      onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                      placeholder="أدخل مبلغ السلفة"
                      className="h-11 rounded-xl"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      عدد الأقساط <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={installments.toString()}
                      onValueChange={(v) => setInstallments(parseInt(v))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'شهر (مرة واحدة)' : 'أشهر'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      قيمة القسط الشهري (تقريبي)
                    </Label>
                    <div className="h-11 rounded-xl bg-slate-100 flex items-center px-4 text-lg font-bold text-emerald-600">
                      {installmentAmount.toLocaleString('ar-SA')} ريال
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ بداية السداد <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* Eligibility Check */}
                {employeeId && advanceAmount > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCheckEligibility}
                      disabled={checkEligibilityMutation.isPending}
                      className="rounded-xl"
                    >
                      <Calculator className="w-4 h-4 ms-2" />
                      {checkEligibilityMutation.isPending ? 'جاري الفحص...' : 'فحص الأهلية'}
                    </Button>

                    {eligibilityResult && (
                      <div className={cn(
                        "mt-4 p-4 rounded-xl border-2",
                        eligibilityResult.eligible
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                      )}>
                        <div className="flex items-center gap-2 mb-2">
                          {eligibilityResult.eligible ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                          )}
                          <span className={cn(
                            "font-bold",
                            eligibilityResult.eligible ? "text-emerald-700" : "text-red-700"
                          )}>
                            {eligibilityResult.eligible ? 'الموظف مؤهل للسلفة' : 'الموظف غير مؤهل'}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>الحد الأقصى للسلفة: <span className="font-bold">{eligibilityResult.maxAdvanceLimit.toLocaleString('ar-SA')} ريال</span></p>
                          <p>المتاح: <span className="font-bold">{eligibilityResult.availableLimit.toLocaleString('ar-SA')} ريال</span></p>
                          {eligibilityResult.ineligibilityReasons && eligibilityResult.ineligibilityReasons.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <p className="font-medium text-red-700 mb-1">أسباب عدم الأهلية:</p>
                              <ul className="list-disc list-inside text-red-600">
                                {eligibilityResult.ineligibilityReasons.map((reason, i) => (
                                  <li key={i}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* REASON - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  سبب السلفة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">السبب بالعربية</Label>
                  <Textarea
                    value={reasonAr}
                    onChange={(e) => setReasonAr(e.target.value)}
                    placeholder="وصف سبب طلب السلفة بالعربية..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Reason (English)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Advance reason description in English..."
                    className="rounded-xl min-h-[80px]"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* NOTES - Advanced */}
            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" aria-hidden="true" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات الموظف</Label>
                      <Textarea
                        value={employeeNotes}
                        onChange={(e) => setEmployeeNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالموظف..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات الموارد البشرية</Label>
                      <Textarea
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالموارد البشرية..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* POLICY INFO */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-blue-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  سياسة السلف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">شروط الأهلية:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>الحد الأدنى للخدمة: 3 أشهر</li>
                        <li>لا يوجد سلف نشطة أخرى</li>
                        <li>الحد الأقصى للسلفة: 50% من صافي الراتب</li>
                        <li>لا توجد إجراءات تأديبية نشطة</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">السداد:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>الخصم من الراتب شهرياً</li>
                        <li>الحد الأقصى للأقساط: 3-6 أشهر</li>
                        <li>بدون فوائد (متوافق مع الشريعة)</li>
                        <li>السداد المبكر متاح بدون غرامة</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">في حالة إنهاء الخدمة:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>يتم خصم الرصيد المتبقي من التسوية النهائية</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.hr.advances.list })}
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
                    {isEditMode ? 'حفظ التعديلات' : 'تقديم طلب السلفة'}
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
