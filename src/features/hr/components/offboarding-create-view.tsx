import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateOffboarding, useUpdateOffboarding, useOffboarding } from '@/hooks/useOffboarding'
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
  CheckCircle, ChevronDown, Users, Clock, FileText,
  AlertTriangle, Shield, UserMinus, Briefcase, Lock
} from 'lucide-react'
import { EXIT_TYPE_LABELS, type ExitType, type CreateOffboardingData } from '@/services/offboardingService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function OffboardingCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingOffboarding, isLoading: isLoadingOffboarding } = useOffboarding(editId || '')
  const createMutation = useCreateOffboarding()
  const updateMutation = useUpdateOffboarding()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Basic
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobTitleAr, setJobTitleAr] = useState('')
  const [department, setDepartment] = useState('')
  const [managerId, setManagerId] = useState('')
  const [managerName, setManagerName] = useState('')

  // Form State - Exit Details
  const [exitType, setExitType] = useState<ExitType>('resignation')
  const [noticeDate, setNoticeDate] = useState('')
  const [lastWorkingDay, setLastWorkingDay] = useState('')
  const [exitEffectiveDate, setExitEffectiveDate] = useState('')

  // Form State - Notice Period
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30)

  // Form State - Notes
  const [hrNotes, setHrNotes] = useState('')
  const [managerNotes, setManagerNotes] = useState('')

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
    if (existingOffboarding && isEditMode) {
      setEmployeeId(existingOffboarding.employeeId || '')
      setEmployeeName(existingOffboarding.employeeName || '')
      setEmployeeNameAr(existingOffboarding.employeeNameAr || '')
      setNationalId(existingOffboarding.nationalId || '')
      setJobTitle(existingOffboarding.jobTitle || '')
      setJobTitleAr(existingOffboarding.jobTitleAr || '')
      setDepartment(existingOffboarding.department || '')
      setManagerId(existingOffboarding.managerId || '')
      setManagerName(existingOffboarding.managerName || '')
      setExitType(existingOffboarding.exitType)
      setNoticeDate(existingOffboarding.dates?.noticeDate?.split('T')[0] || '')
      setLastWorkingDay(existingOffboarding.dates?.lastWorkingDay?.split('T')[0] || '')
      setExitEffectiveDate(existingOffboarding.dates?.exitEffectiveDate?.split('T')[0] || '')
      setNoticePeriodDays(existingOffboarding.noticePeriod?.requiredDays || 30)
      setHrNotes(existingOffboarding.notes?.hrNotes || '')
      setManagerNotes(existingOffboarding.notes?.managerNotes || '')
    }
  }, [existingOffboarding, isEditMode])

  // Handle employee selection
  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    setEmployeeId(selectedEmployeeId)
    const employee = employeesData?.employees?.find(e => e._id === selectedEmployeeId)
    if (employee) {
      setEmployeeName(employee.personalInfo?.fullNameEnglish || '')
      setEmployeeNameAr(employee.personalInfo?.fullNameArabic || '')
      setNationalId(employee.personalInfo?.nationalId || '')
      setJobTitle(employee.employment?.jobTitle || '')
      setJobTitleAr(employee.employment?.jobTitleArabic || '')
      setDepartment(employee.employment?.departmentName || '')
    }
  }

  // Handle manager selection
  const handleManagerSelect = (selectedManagerId: string) => {
    setManagerId(selectedManagerId)
    const manager = employeesData?.employees?.find(e => e._id === selectedManagerId)
    if (manager) {
      setManagerName(manager.personalInfo?.fullNameArabic || manager.personalInfo?.fullNameEnglish || '')
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateOffboardingData = {
      employeeId,
      employeeName,
      employeeNameAr,
      nationalId,
      jobTitle,
      jobTitleAr,
      department,
      managerId,
      managerName,
      exitType,
      noticeDate: noticeDate || undefined,
      lastWorkingDay,
      exitEffectiveDate: exitEffectiveDate || undefined,
      noticePeriodDays,
      notes: {
        hrNotes: hrNotes || undefined,
        managerNotes: managerNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        offboardingId: editId,
        data: {
          employeeName,
          employeeNameAr,
          jobTitle,
          jobTitleAr,
          department,
          managerId,
          managerName,
          exitType,
          dates: {
            noticeDate,
            lastWorkingDay,
            exitEffectiveDate,
          },
          noticePeriod: { requiredDays: noticePeriodDays },
          notes: { hrNotes, managerNotes },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/offboarding' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'إنهاء الخدمة', href: '/dashboard/hr/offboarding', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل سجل إنهاء الخدمة' : 'إضافة سجل إنهاء خدمة جديد'}
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
                onClick={() => navigate({ to: '/dashboard/hr/offboarding' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل سجل إنهاء الخدمة' : 'سجل إنهاء خدمة جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات سجل إنهاء الخدمة' : 'إنشاء سجل إنهاء خدمة لموظف'}
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رقم الهوية<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /> <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="رقم الهوية الوطنية أو الإقامة"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">القسم</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="اسم القسم"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المسمى الوظيفي</Label>
                    <Input
                      value={jobTitleAr}
                      onChange={(e) => setJobTitleAr(e.target.value)}
                      placeholder="المسمى الوظيفي بالعربية"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المدير المباشر</Label>
                    <Select value={managerId} onValueChange={handleManagerSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر المدير" />
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
                </div>
              </CardContent>
            </Card>

            {/* EXIT TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserMinus className="w-5 h-5 text-emerald-500" />
                  نوع إنهاء الخدمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(EXIT_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setExitType(key as ExitType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        exitType === key
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

            {/* DATES - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ الإشعار</Label>
                    <Input
                      type="date"
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      آخر يوم عمل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={lastWorkingDay}
                      onChange={(e) => setLastWorkingDay(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ سريان الإنهاء</Label>
                    <Input
                      type="date"
                      value={exitEffectiveDate}
                      onChange={(e) => setExitEffectiveDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NOTICE PERIOD - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  فترة الإشعار (المادة 75)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      مدة فترة الإشعار (أيام) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={noticePeriodDays.toString()}
                      onValueChange={(v) => setNoticePeriodDays(parseInt(v))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 يوم (للموظفين)</SelectItem>
                        <SelectItem value="60">60 يوم (للمناصب القيادية)</SelectItem>
                        <SelectItem value="0">بدون فترة إشعار</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      وفقاً للمادة 75 من نظام العمل السعودي
                    </p>
                  </div>
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
                      <Label className="text-navy font-medium">ملاحظات الموارد البشرية</Label>
                      <Textarea
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالموارد البشرية..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات المدير</Label>
                      <Textarea
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                        placeholder="ملاحظات خاصة بالمدير المباشر..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* COMPLIANCE INFO */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-amber-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  معلومات الامتثال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">المادة 75 - فترة الإشعار:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>يجب على الطرف الراغب في إنهاء العقد إشعار الطرف الآخر كتابياً</li>
                        <li>فترة الإشعار 60 يوماً للموظفين بأجر شهري، 30 يوماً لغيرهم</li>
                        <li>يستحق العامل أجره عن فترة الإشعار</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">المادة 84-87 - مكافأة نهاية الخدمة:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>نصف راتب شهر عن كل سنة من السنوات الخمس الأولى</li>
                        <li>راتب شهر كامل عن كل سنة تالية</li>
                        <li>تحسب المكافأة على أساس آخر راتب</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium">شهادة الخبرة:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>يلتزم صاحب العمل بإعطاء العامل شهادة خدمة مجاناً</li>
                        <li>يجب أن تتضمن تاريخ بداية ونهاية الخدمة</li>
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
                onClick={() => navigate({ to: '/dashboard/hr/offboarding' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !nationalId || !lastWorkingDay || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء سجل إنهاء الخدمة'}
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
