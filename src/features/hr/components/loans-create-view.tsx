import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateLoan, useUpdateLoan, useLoan, useCheckEligibility } from '@/hooks/useLoans'
import { useEmployees } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
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
  AlertTriangle, Shield, Wallet, CreditCard, Calculator, Clock
} from 'lucide-react'
import {
  LOAN_TYPE_LABELS,
  type LoanType,
  type CreateLoanData,
  type PaymentMethod
} from '@/services/loansService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { ar: string; en: string }> = {
  payroll_deduction: { ar: 'خصم من الراتب', en: 'Payroll Deduction' },
  bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  cash: { ar: 'نقداً', en: 'Cash' },
  check: { ar: 'شيك', en: 'Check' },
}

export function LoansCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingLoan, isLoading: isLoadingLoan } = useLoan(editId || '')
  const createMutation = useCreateLoan()
  const updateMutation = useUpdateLoan()
  const checkEligibilityMutation = useCheckEligibility()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Eligibility result
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean
    creditLimit: number
    availableCredit: number
    ineligibilityReasons?: string[]
  } | null>(null)

  // Form State - Basic Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Form State - Loan Details
  const [loanType, setLoanType] = useState<LoanType>('personal')
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [currency] = useState('SAR')
  const [purpose, setPurpose] = useState('')
  const [purposeAr, setPurposeAr] = useState('')

  // Form State - Repayment
  const [installments, setInstallments] = useState<number>(12)
  const [installmentAmount, setInstallmentAmount] = useState<number>(0)
  const [firstInstallmentDate, setFirstInstallmentDate] = useState('')
  const [deductionMethod, setDeductionMethod] = useState<PaymentMethod>('payroll_deduction')

  // Form State - Notes
  const [employeeNotes, setEmployeeNotes] = useState('')
  const [hrNotes, setHrNotes] = useState('')

  // Calculate installment amount
  useEffect(() => {
    if (loanAmount > 0 && installments > 0) {
      setInstallmentAmount(Math.ceil(loanAmount / installments))
    }
  }, [loanAmount, installments])

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
    if (existingLoan && isEditMode) {
      setEmployeeId(existingLoan.employeeId || '')
      setEmployeeName(existingLoan.employeeName || '')
      setEmployeeNameAr(existingLoan.employeeNameAr || '')
      setEmployeeNumber(existingLoan.employeeNumber || '')
      setDepartment(existingLoan.department || '')
      setJobTitle(existingLoan.jobTitle || '')
      setLoanType(existingLoan.loanType)
      setLoanAmount(existingLoan.loanAmount || 0)
      setPurpose(existingLoan.purpose || '')
      setPurposeAr(existingLoan.purposeAr || '')
      setInstallments(existingLoan.repayment?.installments || 12)
      setInstallmentAmount(existingLoan.repayment?.installmentAmount || 0)
      setFirstInstallmentDate(existingLoan.repayment?.firstInstallmentDate?.split('T')[0] || '')
      setDeductionMethod(existingLoan.repayment?.deductionMethod || 'payroll_deduction')
      setEmployeeNotes(existingLoan.notes?.employeeNotes || '')
      setHrNotes(existingLoan.notes?.hrNotes || '')
    }
  }, [existingLoan, isEditMode])

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
    if (!employeeId || loanAmount <= 0) return
    try {
      const result = await checkEligibilityMutation.mutateAsync({
        employeeId,
        amount: loanAmount,
      })
      setEligibilityResult(result)
    } catch {
      // Error handled by mutation
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateLoanData = {
      employeeId,
      employeeName,
      employeeNameAr,
      employeeNumber,
      department,
      jobTitle,
      loanType,
      loanAmount,
      currency,
      purpose: purpose || undefined,
      purposeAr: purposeAr || undefined,
      installments,
      installmentAmount,
      firstInstallmentDate,
      deductionMethod,
      notes: {
        employeeNotes: employeeNotes || undefined,
        hrNotes: hrNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        loanId: editId,
        data: {
          loanType,
          loanAmount,
          purpose,
          purposeAr,
          repayment: {
            installments,
            installmentAmount,
            deductionMethod,
          },
          notes: { employeeNotes, hrNotes },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/loans' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'القروض', href: '/dashboard/hr/loans', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
          title={isEditMode ? 'تعديل طلب القرض' : 'طلب قرض جديد'}
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
                onClick={() => navigate({ to: '/dashboard/hr/loans' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل طلب القرض' : 'طلب قرض جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات طلب القرض' : 'إنشاء طلب قرض للموظف'}
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

            {/* EMPLOYEE SELECTION - Basic */}
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

                <div className="space-y-2">
                  <Label className="text-navy font-medium">المسمى الوظيفي</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="المسمى الوظيفي"
                    className="h-11 rounded-xl"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            {/* LOAN TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  نوع القرض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(LOAN_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLoanType(key as LoanType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        loanType === key
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

            {/* LOAN AMOUNT & REPAYMENT - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  مبلغ القرض والسداد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      مبلغ القرض (ريال) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={loanAmount || ''}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      placeholder="أدخل مبلغ القرض"
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
                        {[3, 6, 9, 12, 18, 24, 36, 48, 60].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} شهر
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
                      تاريخ أول قسط <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={firstInstallmentDate}
                      onChange={(e) => setFirstInstallmentDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    طريقة السداد <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={deductionMethod}
                    onValueChange={(v) => setDeductionMethod(v as PaymentMethod)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Eligibility Check */}
                {employeeId && loanAmount > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCheckEligibility}
                      disabled={checkEligibilityMutation.isPending}
                      className="rounded-xl"
                    >
                      <Calculator className="w-4 h-4 ml-2" />
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
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={cn(
                            "font-bold",
                            eligibilityResult.eligible ? "text-emerald-700" : "text-red-700"
                          )}>
                            {eligibilityResult.eligible ? 'الموظف مؤهل للقرض' : 'الموظف غير مؤهل'}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>الحد الائتماني: <span className="font-bold">{eligibilityResult.creditLimit.toLocaleString('ar-SA')} ريال</span></p>
                          <p>المتاح: <span className="font-bold">{eligibilityResult.availableCredit.toLocaleString('ar-SA')} ريال</span></p>
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

            {/* PURPOSE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  الغرض من القرض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">الغرض بالعربية</Label>
                  <Textarea
                    value={purposeAr}
                    onChange={(e) => setPurposeAr(e.target.value)}
                    placeholder="وصف الغرض من القرض بالعربية..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Purpose (English)</Label>
                  <Textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Loan purpose description in English..."
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
                        <FileText className="w-5 h-5 text-blue-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('notes') && "rotate-180")} />
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
                  سياسة القروض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">شروط الأهلية:</p>
                      <ul className="list-disc list-inside mr-4 mt-1 space-y-1">
                        <li>اجتياز فترة التجربة (180 يوم)</li>
                        <li>عدم وجود إجراءات تأديبية نشطة</li>
                        <li>عدم تجاوز الحد الائتماني المسموح</li>
                        <li>سداد أي قروض سابقة مستحقة</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">آلية السداد:</p>
                      <ul className="list-disc list-inside mr-4 mt-1 space-y-1">
                        <li>الخصم التلقائي من الراتب (الطريقة المفضلة)</li>
                        <li>يجب ألا يتجاوز القسط 30% من صافي الراتب</li>
                        <li>يمكن السداد المبكر بدون غرامة</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">في حالة إنهاء الخدمة:</p>
                      <ul className="list-disc list-inside mr-4 mt-1 space-y-1">
                        <li>يتم خصم الرصيد المتبقي من مستحقات نهاية الخدمة</li>
                        <li>إذا لم تكف المستحقات، يتم ترتيب خطة سداد</li>
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
                onClick={() => navigate({ to: '/dashboard/hr/loans' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || loanAmount <= 0 || !firstInstallmentDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تقديم طلب القرض'}
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
