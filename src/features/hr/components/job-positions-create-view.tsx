import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateJobPosition, useUpdateJobPosition, useJobPosition, useJobPositions } from '@/hooks/useJobPositions'
import { useOrganizationalUnits } from '@/hooks/useOrganizationalStructure'
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
  CheckCircle, ChevronDown, Users, Briefcase,
  Calendar, MapPin, TrendingUp, Wallet,
  Target, GraduationCap, FileText, Clock,
  Network, Settings, Lock
} from 'lucide-react'
import {
  JOB_LEVEL_LABELS,
  JOB_FAMILY_LABELS,
  POSITION_TYPE_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  OCCUPATIONAL_CATEGORY_LABELS,
  WORK_ENVIRONMENT_LABELS,
  type JobLevel,
  type JobFamily,
  type PositionType,
  type EmploymentType,
  type OccupationalCategory,
  type WorkEnvironmentType,
  type CreateJobPositionData,
} from '@/services/jobPositionsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function JobPositionsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingPosition, isLoading: isLoadingPosition } = useJobPosition(editId || '')
  const createMutation = useCreateJobPosition()
  const updateMutation = useUpdateJobPosition()

  // Fetch departments for selection
  const { data: unitsData } = useOrganizationalUnits({ status: 'active' })
  // Fetch positions for reporting hierarchy
  const { data: positionsData } = useJobPositions({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Basic Info
  const [positionNumber, setPositionNumber] = useState('')
  const [positionCode, setPositionCode] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobTitleAr, setJobTitleAr] = useState('')
  const [workingTitle, setWorkingTitle] = useState('')
  const [workingTitleAr, setWorkingTitleAr] = useState('')

  // Classification
  const [jobFamily, setJobFamily] = useState<JobFamily>('legal')
  const [jobSubFamily, setJobSubFamily] = useState('')
  const [occupationalCategory, setOccupationalCategory] = useState<OccupationalCategory>('professional')
  const [jobLevel, setJobLevel] = useState<JobLevel>('mid')
  const [jobGrade, setJobGrade] = useState('')
  const [gradeNumber, setGradeNumber] = useState<number>(0)

  // Position Type
  const [positionType, setPositionType] = useState<PositionType>('regular')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')

  // Organization
  const [departmentId, setDepartmentId] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [departmentNameAr, setDepartmentNameAr] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [divisionName, setDivisionName] = useState('')
  const [costCenter, setCostCenter] = useState('')

  // Location
  const [location, setLocation] = useState('')
  const [locationAr, setLocationAr] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Saudi Arabia')
  const [remoteEligible, setRemoteEligible] = useState(false)
  const [remoteWorkType, setRemoteWorkType] = useState<'fully_remote' | 'hybrid' | 'on_site'>('on_site')
  const [travelRequired, setTravelRequired] = useState(false)
  const [travelPercentage, setTravelPercentage] = useState<number>(0)

  // Reporting
  const [reportsToPositionId, setReportsToPositionId] = useState('')
  const [supervisoryPosition, setSupervisoryPosition] = useState(false)

  // Job Description
  const [jobSummary, setJobSummary] = useState('')
  const [jobSummaryAr, setJobSummaryAr] = useState('')
  const [jobPurpose, setJobPurpose] = useState('')
  const [jobPurposeAr, setJobPurposeAr] = useState('')

  // Qualifications
  const [minimumEducation, setMinimumEducation] = useState<'high_school' | 'diploma' | 'bachelors' | 'masters' | 'doctorate' | 'professional'>('bachelors')
  const [minimumYearsExperience, setMinimumYearsExperience] = useState<number>(0)
  const [preferredYearsExperience, setPreferredYearsExperience] = useState<number>(0)

  // Compensation
  const [salaryGrade, setSalaryGrade] = useState('')
  const [salaryMinimum, setSalaryMinimum] = useState<number>(0)
  const [salaryMidpoint, setSalaryMidpoint] = useState<number>(0)
  const [salaryMaximum, setSalaryMaximum] = useState<number>(0)
  const [salaryCurrency, setSalaryCurrency] = useState('SAR')

  // Working Conditions
  const [workEnvironment, setWorkEnvironment] = useState<WorkEnvironmentType>('office')
  const [standardHours, setStandardHours] = useState<number>(40)
  const [scheduleType, setScheduleType] = useState<'standard' | 'flexible' | 'shift' | 'compressed' | 'variable'>('standard')
  const [overtimeExpected, setOvertimeExpected] = useState(false)
  const [onCallRequired, setOnCallRequired] = useState(false)

  // Status
  const [fte, setFte] = useState<number>(1.0)
  const [budgeted, setBudgeted] = useState(true)
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear())

  // Compliance
  const [saudiOnly, setSaudiOnly] = useState(false)
  const [saudiPreferred, setSaudiPreferred] = useState(false)

  // Dates
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])

  // Notes
  const [notes, setNotes] = useState('')
  const [notesAr, setNotesAr] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Handle department selection
  const handleDepartmentSelect = (unitId: string) => {
    setDepartmentId(unitId)
    const unit = unitsData?.data?.find(u => u._id === unitId)
    if (unit) {
      setDepartmentName(unit.unitName || '')
      setDepartmentNameAr(unit.unitNameAr || '')
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (existingPosition && isEditMode) {
      setPositionNumber(existingPosition.positionNumber || '')
      setPositionCode(existingPosition.positionCode || '')
      setJobTitle(existingPosition.jobTitle || '')
      setJobTitleAr(existingPosition.jobTitleAr || '')
      setWorkingTitle(existingPosition.workingTitle || '')
      setWorkingTitleAr(existingPosition.workingTitleAr || '')
      setJobFamily(existingPosition.jobFamily)
      setJobSubFamily(existingPosition.jobSubFamily || '')
      setOccupationalCategory(existingPosition.occupationalCategory)
      setJobLevel(existingPosition.jobLevel)
      setJobGrade(existingPosition.jobGrade || '')
      setGradeNumber(existingPosition.gradeNumber || 0)
      setPositionType(existingPosition.positionType)
      setEmploymentType(existingPosition.employmentType)
      setDepartmentId(existingPosition.departmentId || '')
      setDepartmentName(existingPosition.departmentName || '')
      setDepartmentNameAr(existingPosition.departmentNameAr || '')
      setDivisionId(existingPosition.divisionId || '')
      setDivisionName(existingPosition.divisionName || '')
      setCostCenter(existingPosition.costCenter || '')
      setLocation(existingPosition.location || '')
      setLocationAr(existingPosition.locationAr || '')
      setCity(existingPosition.city || '')
      setCountry(existingPosition.country || 'Saudi Arabia')
      setRemoteEligible(existingPosition.remoteEligible || false)
      setRemoteWorkType(existingPosition.remoteWorkType || 'on_site')
      setTravelRequired(existingPosition.travelRequired || false)
      setTravelPercentage(existingPosition.travelPercentage || 0)
      setReportsToPositionId(existingPosition.reportsToPositionId || '')
      setSupervisoryPosition(existingPosition.supervisoryPosition || false)
      setJobSummary(existingPosition.jobSummary || '')
      setJobSummaryAr(existingPosition.jobSummaryAr || '')
      setJobPurpose(existingPosition.jobPurpose || '')
      setJobPurposeAr(existingPosition.jobPurposeAr || '')

      if (existingPosition.qualifications) {
        setMinimumEducation(existingPosition.qualifications.minimumEducation || 'bachelors')
        setMinimumYearsExperience(existingPosition.qualifications.minimumYearsExperience || 0)
        setPreferredYearsExperience(existingPosition.qualifications.preferredYearsExperience || 0)
      }

      setSalaryGrade(existingPosition.salaryGrade || '')
      if (existingPosition.salaryRange) {
        setSalaryMinimum(existingPosition.salaryRange.minimum || 0)
        setSalaryMidpoint(existingPosition.salaryRange.midpoint || 0)
        setSalaryMaximum(existingPosition.salaryRange.maximum || 0)
        setSalaryCurrency(existingPosition.salaryRange.currency || 'SAR')
      }

      setWorkEnvironment(existingPosition.workEnvironment || 'office')
      setStandardHours(existingPosition.standardHours || 40)
      setScheduleType(existingPosition.scheduleType || 'standard')
      setOvertimeExpected(existingPosition.overtimeExpected || false)
      setOnCallRequired(existingPosition.onCallRequired || false)
      setFte(existingPosition.fte || 1.0)
      setBudgeted(existingPosition.budgeted || true)
      setFiscalYear(existingPosition.fiscalYear || new Date().getFullYear())
      setSaudiOnly(existingPosition.saudiOnly || false)
      setSaudiPreferred(existingPosition.saudiPreferred || false)
      setEffectiveDate(existingPosition.effectiveDate?.split('T')[0] || '')
      setNotes(existingPosition.notes || '')
      setNotesAr(existingPosition.notesAr || '')
    }
  }, [existingPosition, isEditMode])

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateJobPositionData = {
      positionNumber: positionNumber || undefined,
      positionCode: positionCode || undefined,
      jobTitle,
      jobTitleAr: jobTitleAr || undefined,
      workingTitle: workingTitle || undefined,
      workingTitleAr: workingTitleAr || undefined,
      jobFamily,
      jobSubFamily: jobSubFamily || undefined,
      occupationalCategory,
      jobLevel,
      jobGrade,
      gradeNumber: gradeNumber || undefined,
      positionType,
      employmentType,
      departmentId: departmentId || undefined,
      departmentName: departmentName || undefined,
      departmentNameAr: departmentNameAr || undefined,
      divisionId: divisionId || undefined,
      divisionName: divisionName || undefined,
      costCenter: costCenter || undefined,
      location: location || undefined,
      locationAr: locationAr || undefined,
      city: city || undefined,
      country: country || undefined,
      remoteEligible,
      remoteWorkType: remoteEligible ? remoteWorkType : undefined,
      travelRequired,
      travelPercentage: travelRequired ? travelPercentage : undefined,
      reportsToPositionId: reportsToPositionId || undefined,
      supervisoryPosition,
      jobSummary: jobSummary || undefined,
      jobSummaryAr: jobSummaryAr || undefined,
      jobPurpose: jobPurpose || undefined,
      jobPurposeAr: jobPurposeAr || undefined,
      qualifications: {
        minimumEducation,
        minimumYearsExperience,
        preferredYearsExperience: preferredYearsExperience || undefined,
      },
      salaryGrade,
      salaryRange: salaryMinimum > 0 || salaryMaximum > 0 ? {
        minimum: salaryMinimum,
        midpoint: salaryMidpoint,
        maximum: salaryMaximum,
        currency: salaryCurrency,
        period: 'monthly',
      } : undefined,
      workEnvironment,
      standardHours,
      scheduleType,
      overtimeExpected,
      onCallRequired,
      fte,
      budgeted,
      fiscalYear,
      saudiOnly,
      saudiPreferred,
      effectiveDate: effectiveDate || undefined,
      notes: notes || undefined,
      notesAr: notesAr || undefined,
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        positionId: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/job-positions' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'المناصب الوظيفية', href: '/dashboard/hr/job-positions', isActive: true },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
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
          title={isEditMode ? 'تعديل المنصب الوظيفي' : 'إنشاء منصب وظيفي'}
          type="job-positions"
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
                onClick={() => navigate({ to: '/dashboard/hr/job-positions' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل المنصب الوظيفي' : 'إنشاء منصب وظيفي جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات المنصب' : 'إضافة منصب وظيفي جديد'}
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

            {/* BASIC INFO */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  البيانات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رقم المنصب
                    </Label>
                    <Input
                      value={positionNumber}
                      onChange={(e) => setPositionNumber(e.target.value)}
                      placeholder="مثال: POS-001"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رمز المنصب
                    </Label>
                    <Input
                      value={positionCode}
                      onChange={(e) => setPositionCode(e.target.value)}
                      placeholder="مثال: SR-ATT"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      المسمى الوظيفي بالعربية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={jobTitleAr}
                      onChange={(e) => setJobTitleAr(e.target.value)}
                      placeholder="المسمى الوظيفي"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Job Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Job title in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المسمى الوظيفي العملي</Label>
                    <Input
                      value={workingTitleAr}
                      onChange={(e) => setWorkingTitleAr(e.target.value)}
                      placeholder="المسمى العملي (اختياري)"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Working Title</Label>
                    <Input
                      value={workingTitle}
                      onChange={(e) => setWorkingTitle(e.target.value)}
                      placeholder="Working title (optional)"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JOB CLASSIFICATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-500" />
                  التصنيف الوظيفي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    العائلة الوظيفية <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(JOB_FAMILY_LABELS).slice(0, 8).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setJobFamily(key as JobFamily)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          jobFamily === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المستوى الوظيفي <span className="text-red-500">*</span></Label>
                    <Select value={jobLevel} onValueChange={(v) => setJobLevel(v as JobLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(JOB_LEVEL_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الفئة المهنية <span className="text-red-500">*</span></Label>
                    <Select value={occupationalCategory} onValueChange={(v) => setOccupationalCategory(v as OccupationalCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OCCUPATIONAL_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الدرجة الوظيفية <span className="text-red-500">*</span></Label>
                    <Input
                      value={jobGrade}
                      onChange={(e) => setJobGrade(e.target.value)}
                      placeholder="مثال: G5"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* POSITION TYPE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-500" />
                  نوع المنصب والتوظيف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع المنصب <span className="text-red-500">*</span></Label>
                    <Select value={positionType} onValueChange={(v) => setPositionType(v as PositionType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POSITION_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع التوظيف <span className="text-red-500">*</span></Label>
                    <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ORGANIZATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  الانتماء التنظيمي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">القسم</Label>
                    <Select value={departmentId} onValueChange={handleDepartmentSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitsData?.data?.map((unit) => (
                          <SelectItem key={unit._id} value={unit._id}>
                            {unit.unitNameAr || unit.unitName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">مركز التكلفة</Label>
                    <Input
                      value={costCenter}
                      onChange={(e) => setCostCenter(e.target.value)}
                      placeholder="رمز مركز التكلفة"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">يرفع تقاريره إلى</Label>
                    <Select value={reportsToPositionId} onValueChange={setReportsToPositionId}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر المنصب" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionsData?.data?.filter(p => p._id !== editId).map((position) => (
                          <SelectItem key={position._id} value={position._id}>
                            {position.jobTitleAr || position.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">منصب إشرافي</span>
                    <Switch checked={supervisoryPosition} onCheckedChange={setSupervisoryPosition} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* COMPENSATION */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                  التعويضات والراتب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">درجة الراتب<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /> <span className="text-red-500">*</span></Label>
                    <Input
                      value={salaryGrade}
                      onChange={(e) => setSalaryGrade(e.target.value)}
                      placeholder="مثال: S5"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الحد الأدنى<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                    <Input
                      type="number"
                      value={salaryMinimum}
                      onChange={(e) => setSalaryMinimum(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المنتصف<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                    <Input
                      type="number"
                      value={salaryMidpoint}
                      onChange={(e) => setSalaryMidpoint(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الحد الأقصى<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                    <Input
                      type="number"
                      value={salaryMaximum}
                      onChange={(e) => setSalaryMaximum(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATES & FTE */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  التواريخ والميزانية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ السريان</Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نسبة التوظيف (FTE)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={fte}
                      onChange={(e) => setFte(parseFloat(e.target.value) || 1.0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">السنة المالية</Label>
                    <Input
                      type="number"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">معتمد في الميزانية</span>
                    <Switch checked={budgeted} onCheckedChange={setBudgeted} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* JOB DESCRIPTION - Advanced */}
            <Collapsible open={openSections.includes('description')} onOpenChange={() => toggleSection('description')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        الوصف الوظيفي
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('description') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملخص الوظيفة بالعربية</Label>
                      <Textarea
                        value={jobSummaryAr}
                        onChange={(e) => setJobSummaryAr(e.target.value)}
                        placeholder="ملخص مختصر للوظيفة..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Job Summary</Label>
                      <Textarea
                        value={jobSummary}
                        onChange={(e) => setJobSummary(e.target.value)}
                        placeholder="Brief job summary..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الهدف من الوظيفة</Label>
                        <Textarea
                          value={jobPurposeAr}
                          onChange={(e) => setJobPurposeAr(e.target.value)}
                          placeholder="الهدف الرئيسي من الوظيفة..."
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Job Purpose</Label>
                        <Textarea
                          value={jobPurpose}
                          onChange={(e) => setJobPurpose(e.target.value)}
                          placeholder="Main purpose of the job..."
                          className="rounded-xl min-h-[60px]"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* QUALIFICATIONS - Advanced */}
            <Collapsible open={openSections.includes('qualifications')} onOpenChange={() => toggleSection('qualifications')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-500" />
                        المؤهلات المطلوبة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('qualifications') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الحد الأدنى للتعليم</Label>
                        <Select value={minimumEducation} onValueChange={(v) => setMinimumEducation(v as any)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high_school">ثانوية عامة</SelectItem>
                            <SelectItem value="diploma">دبلوم</SelectItem>
                            <SelectItem value="bachelors">بكالوريوس</SelectItem>
                            <SelectItem value="masters">ماجستير</SelectItem>
                            <SelectItem value="doctorate">دكتوراه</SelectItem>
                            <SelectItem value="professional">مهني</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">سنوات الخبرة المطلوبة</Label>
                        <Input
                          type="number"
                          value={minimumYearsExperience}
                          onChange={(e) => setMinimumYearsExperience(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">سنوات الخبرة المفضلة</Label>
                        <Input
                          type="number"
                          value={preferredYearsExperience}
                          onChange={(e) => setPreferredYearsExperience(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* LOCATION - Advanced */}
            <Collapsible open={openSections.includes('location')} onOpenChange={() => toggleSection('location')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" aria-hidden="true" />
                        الموقع وظروف العمل
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('location') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الموقع بالعربية</Label>
                        <Input
                          value={locationAr}
                          onChange={(e) => setLocationAr(e.target.value)}
                          placeholder="اسم الموقع"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Location</Label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location name"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المدينة</Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="المدينة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الدولة</Label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="الدولة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">بيئة العمل</Label>
                        <Select value={workEnvironment} onValueChange={(v) => setWorkEnvironment(v as WorkEnvironmentType)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(WORK_ENVIRONMENT_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">إمكانية العمل عن بعد</span>
                        <Switch checked={remoteEligible} onCheckedChange={setRemoteEligible} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">يتطلب سفر</span>
                        <Switch checked={travelRequired} onCheckedChange={setTravelRequired} />
                      </div>
                      {travelRequired && (
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">نسبة السفر %</Label>
                          <Input
                            type="number"
                            value={travelPercentage}
                            onChange={(e) => setTravelPercentage(parseInt(e.target.value) || 0)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* WORKING CONDITIONS - Advanced */}
            <Collapsible open={openSections.includes('workConditions')} onOpenChange={() => toggleSection('workConditions')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500" />
                        ظروف العمل
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('workConditions') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">ساعات العمل الأسبوعية</Label>
                        <Input
                          type="number"
                          value={standardHours}
                          onChange={(e) => setStandardHours(parseInt(e.target.value) || 40)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">نوع الجدول</Label>
                        <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as any)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">قياسي</SelectItem>
                            <SelectItem value="flexible">مرن</SelectItem>
                            <SelectItem value="shift">نوبات</SelectItem>
                            <SelectItem value="compressed">مضغوط</SelectItem>
                            <SelectItem value="variable">متغير</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">عمل إضافي متوقع</span>
                        <Switch checked={overtimeExpected} onCheckedChange={setOvertimeExpected} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">مناوبة تحت الطلب</span>
                        <Switch checked={onCallRequired} onCheckedChange={setOnCallRequired} />
                      </div>
                    </div>
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
                        <Target className="w-5 h-5 text-emerald-500" />
                        متطلبات السعودة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('compliance') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">للسعوديين فقط</span>
                        <Switch checked={saudiOnly} onCheckedChange={setSaudiOnly} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">يُفضل سعودي</span>
                        <Switch checked={saudiPreferred} onCheckedChange={setSaudiPreferred} />
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
                        <FileText className="w-5 h-5 text-gray-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات بالعربية</Label>
                      <Textarea
                        value={notesAr}
                        onChange={(e) => setNotesAr(e.target.value)}
                        placeholder="ملاحظات إضافية..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
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
                onClick={() => navigate({ to: '/dashboard/hr/job-positions' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!jobTitle || !jobTitleAr || !jobGrade || !salaryGrade || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء المنصب'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="job-positions" />
        </div>
      </Main>
    </>
  )
}
