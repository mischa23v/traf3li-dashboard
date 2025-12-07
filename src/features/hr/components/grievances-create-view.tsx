import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateGrievance, useUpdateGrievance, useGrievance } from '@/hooks/useGrievances'
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
  CheckCircle, ChevronDown, Users, AlertTriangle,
  Calendar, Shield, FileWarning, Scale, MessageSquare,
  UserX, Eye
} from 'lucide-react'
import {
  GRIEVANCE_TYPE_LABELS,
  GRIEVANCE_CATEGORY_LABELS,
  GRIEVANCE_PRIORITY_LABELS,
  GRIEVANCE_SEVERITY_LABELS,
  type GrievanceType,
  type GrievanceCategory,
  type GrievancePriority,
  type GrievanceSeverity,
  type CreateGrievanceData,
} from '@/services/grievancesService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function GrievancesCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingGrievance, isLoading: isLoadingGrievance } = useGrievance(editId || '')
  const createMutation = useCreateGrievance()
  const updateMutation = useUpdateGrievance()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Form State - Grievance Details
  const [grievanceType, setGrievanceType] = useState<GrievanceType>('unfair_treatment')
  const [grievanceCategory, setGrievanceCategory] = useState<GrievanceCategory>('individual')
  const [grievanceSubject, setGrievanceSubject] = useState('')
  const [grievanceSubjectAr, setGrievanceSubjectAr] = useState('')
  const [grievanceDescription, setGrievanceDescription] = useState('')
  const [grievanceDescriptionAr, setGrievanceDescriptionAr] = useState('')

  // Dates
  const [filedDate, setFiledDate] = useState(new Date().toISOString().split('T')[0])
  const [incidentDate, setIncidentDate] = useState('')

  // Priority & Severity
  const [priority, setPriority] = useState<GrievancePriority>('medium')
  const [severity, setSeverity] = useState<GrievanceSeverity>('moderate')

  // Confidentiality
  const [confidential, setConfidential] = useState(false)
  const [anonymousComplaint, setAnonymousComplaint] = useState(false)
  const [protectedDisclosure, setProtectedDisclosure] = useState(false)

  // Respondent
  const [respondentName, setRespondentName] = useState('')
  const [respondentNameAr, setRespondentNameAr] = useState('')
  const [respondentJobTitle, setRespondentJobTitle] = useState('')
  const [respondentDepartment, setRespondentDepartment] = useState('')
  const [respondentRelationship, setRespondentRelationship] = useState<'manager' | 'supervisor' | 'colleague' | 'subordinate' | 'hr' | 'senior_management' | 'other'>('manager')

  // Against Department/Policy
  const [againstDepartment, setAgainstDepartment] = useState('')
  const [againstPolicy, setAgainstPolicy] = useState('')

  // Desired Outcome
  const [desiredOutcome, setDesiredOutcome] = useState('')
  const [desiredOutcomeAr, setDesiredOutcomeAr] = useState('')

  // Notes
  const [complainantNotes, setComplainantNotes] = useState('')
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
    if (existingGrievance && isEditMode) {
      setEmployeeId(existingGrievance.employeeId || '')
      setEmployeeName(existingGrievance.employeeName || '')
      setEmployeeNameAr(existingGrievance.employeeNameAr || '')
      setEmployeeNumber(existingGrievance.employeeNumber || '')
      setDepartment(existingGrievance.department || '')
      setJobTitle(existingGrievance.jobTitle || '')
      setEmail(existingGrievance.email || '')
      setPhone(existingGrievance.phone || '')
      setGrievanceType(existingGrievance.grievanceType)
      setGrievanceCategory(existingGrievance.grievanceCategory || 'individual')
      setGrievanceSubject(existingGrievance.grievanceSubject || '')
      setGrievanceSubjectAr(existingGrievance.grievanceSubjectAr || '')
      setGrievanceDescription(existingGrievance.grievanceDescription || '')
      setGrievanceDescriptionAr(existingGrievance.grievanceDescriptionAr || '')
      setFiledDate(existingGrievance.filedDate?.split('T')[0] || '')
      setIncidentDate(existingGrievance.incidentDate?.split('T')[0] || '')
      setPriority(existingGrievance.priority)
      setSeverity(existingGrievance.severity || 'moderate')
      setConfidential(existingGrievance.confidential || false)
      setAnonymousComplaint(existingGrievance.anonymousComplaint || false)
      setProtectedDisclosure(existingGrievance.protectedDisclosure || false)

      if (existingGrievance.respondent) {
        setRespondentName(existingGrievance.respondent.employeeName || '')
        setRespondentNameAr(existingGrievance.respondent.employeeNameAr || '')
        setRespondentJobTitle(existingGrievance.respondent.jobTitle || '')
        setRespondentDepartment(existingGrievance.respondent.department || '')
        setRespondentRelationship(existingGrievance.respondent.relationshipToComplainant || 'manager')
      }

      setAgainstDepartment(existingGrievance.againstDepartment || '')
      setAgainstPolicy(existingGrievance.againstPolicy || '')
      setDesiredOutcome(existingGrievance.desiredOutcome || '')
      setDesiredOutcomeAr(existingGrievance.desiredOutcomeAr || '')
      setComplainantNotes(existingGrievance.notes?.complainantNotes || '')
      setHrNotes(existingGrievance.notes?.hrNotes || '')
    }
  }, [existingGrievance, isEditMode])

  // Handle employee selection
  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    setEmployeeId(selectedEmployeeId)
    const employee = employeesData?.employees?.find(e => e._id === selectedEmployeeId)
    if (employee) {
      setEmployeeName(employee.personalInfo?.fullNameEnglish || '')
      setEmployeeNameAr(employee.personalInfo?.fullNameArabic || '')
      setEmployeeNumber(employee.employeeId || '')
      setDepartment(employee.employment?.departmentName || '')
      setJobTitle(employee.employment?.jobTitle || '')
      setEmail(employee.contact?.workEmail || '')
      setPhone(employee.contact?.mobile || '')
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateGrievanceData = {
      employeeId,
      employeeName,
      employeeNameAr: employeeNameAr || undefined,
      employeeNumber: employeeNumber || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
      email: email || undefined,
      phone: phone || undefined,
      grievanceType,
      grievanceCategory,
      grievanceSubject,
      grievanceSubjectAr: grievanceSubjectAr || undefined,
      grievanceDescription,
      grievanceDescriptionAr: grievanceDescriptionAr || undefined,
      filedDate,
      incidentDate: incidentDate || undefined,
      priority,
      severity,
      confidential,
      anonymousComplaint,
      protectedDisclosure,
      respondent: respondentName ? {
        employeeName: respondentName,
        employeeNameAr: respondentNameAr || undefined,
        jobTitle: respondentJobTitle || undefined,
        department: respondentDepartment || undefined,
        relationshipToComplainant: respondentRelationship,
      } : undefined,
      againstDepartment: againstDepartment || undefined,
      againstPolicy: againstPolicy || undefined,
      desiredOutcome: desiredOutcome || undefined,
      desiredOutcomeAr: desiredOutcomeAr || undefined,
      notes: {
        complainantNotes: complainantNotes || undefined,
        hrNotes: hrNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        grievanceId: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/grievances' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الشكاوى', href: '/dashboard/hr/grievances', isActive: true },
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
          title={isEditMode ? 'تعديل الشكوى' : 'تقديم شكوى جديدة'}
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
                onClick={() => navigate({ to: '/dashboard/hr/grievances' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل الشكوى' : 'تقديم شكوى جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات الشكوى' : 'تقديم شكوى أو نزاع'}
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
                  بيانات مقدم الشكوى
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المسمى الوظيفي</Label>
                    <Input
                      value={jobTitle}
                      readOnly
                      placeholder="المسمى الوظيفي"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">البريد الإلكتروني</Label>
                    <Input
                      value={email}
                      readOnly
                      placeholder="البريد الإلكتروني"
                      className="h-11 rounded-xl bg-slate-50"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRIEVANCE TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-emerald-500" />
                  نوع الشكوى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    نوع الشكوى <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(GRIEVANCE_TYPE_LABELS).slice(0, 8).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setGrievanceType(key as GrievanceType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          grievanceType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {Object.entries(GRIEVANCE_TYPE_LABELS).slice(8, 16).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setGrievanceType(key as GrievanceType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          grievanceType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                  {Object.entries(GRIEVANCE_TYPE_LABELS).length > 16 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {Object.entries(GRIEVANCE_TYPE_LABELS).slice(16).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setGrievanceType(key as GrievanceType)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            grievanceType === key
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          <span className="text-sm font-medium">{label.ar}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">التصنيف</Label>
                    <Select value={grievanceCategory} onValueChange={(v) => setGrievanceCategory(v as GrievanceCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GRIEVANCE_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">الأولوية</Label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as GrievancePriority)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GRIEVANCE_PRIORITY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">الخطورة</Label>
                      <Select value={severity} onValueChange={(v) => setSeverity(v as GrievanceSeverity)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GRIEVANCE_SEVERITY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRIEVANCE DETAILS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  تفاصيل الشكوى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      موضوع الشكوى بالعربية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={grievanceSubjectAr}
                      onChange={(e) => setGrievanceSubjectAr(e.target.value)}
                      placeholder="موضوع الشكوى"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Grievance Subject</Label>
                    <Input
                      value={grievanceSubject}
                      onChange={(e) => setGrievanceSubject(e.target.value)}
                      placeholder="Subject in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    وصف الشكوى بالتفصيل <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={grievanceDescriptionAr}
                    onChange={(e) => setGrievanceDescriptionAr(e.target.value)}
                    placeholder="اشرح الشكوى بالتفصيل..."
                    className="rounded-xl min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">Description in English</Label>
                  <Textarea
                    value={grievanceDescription}
                    onChange={(e) => setGrievanceDescription(e.target.value)}
                    placeholder="Describe the grievance in detail..."
                    className="rounded-xl min-h-[100px]"
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            {/* DATES - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ تقديم الشكوى <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={filedDate}
                      onChange={(e) => setFiledDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ الحادثة</Label>
                    <Input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CONFIDENTIALITY - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  السرية والحماية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">شكوى سرية</span>
                    <Switch checked={confidential} onCheckedChange={setConfidential} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">شكوى مجهولة الهوية</span>
                    <Switch checked={anonymousComplaint} onCheckedChange={setAnonymousComplaint} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">طلب حماية المبلغين</span>
                    <Switch checked={protectedDisclosure} onCheckedChange={setProtectedDisclosure} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* RESPONDENT - Advanced */}
            <Collapsible open={openSections.includes('respondent')} onOpenChange={() => toggleSection('respondent')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UserX className="w-5 h-5 text-red-500" />
                        الشكوى ضد (شخص)
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {respondentName && (
                          <Badge className="bg-red-100 text-red-700">{respondentNameAr || respondentName}</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('respondent') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اسم الشخص بالعربية</Label>
                        <Input
                          value={respondentNameAr}
                          onChange={(e) => setRespondentNameAr(e.target.value)}
                          placeholder="اسم الشخص المشتكى عليه"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Person Name</Label>
                        <Input
                          value={respondentName}
                          onChange={(e) => setRespondentName(e.target.value)}
                          placeholder="Person name in English"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المسمى الوظيفي</Label>
                        <Input
                          value={respondentJobTitle}
                          onChange={(e) => setRespondentJobTitle(e.target.value)}
                          placeholder="المسمى الوظيفي"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">القسم</Label>
                        <Input
                          value={respondentDepartment}
                          onChange={(e) => setRespondentDepartment(e.target.value)}
                          placeholder="القسم"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">العلاقة بمقدم الشكوى</Label>
                        <Select value={respondentRelationship} onValueChange={(v) => setRespondentRelationship(v as typeof respondentRelationship)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">مدير</SelectItem>
                            <SelectItem value="supervisor">مشرف</SelectItem>
                            <SelectItem value="colleague">زميل</SelectItem>
                            <SelectItem value="subordinate">مرؤوس</SelectItem>
                            <SelectItem value="hr">الموارد البشرية</SelectItem>
                            <SelectItem value="senior_management">الإدارة العليا</SelectItem>
                            <SelectItem value="other">آخر</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* AGAINST DEPARTMENT/POLICY - Advanced */}
            <Collapsible open={openSections.includes('against')} onOpenChange={() => toggleSection('against')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-amber-500" />
                        الشكوى ضد (قسم/سياسة)
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('against') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">القسم أو الإدارة</Label>
                        <Input
                          value={againstDepartment}
                          onChange={(e) => setAgainstDepartment(e.target.value)}
                          placeholder="اسم القسم أو الإدارة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">السياسة أو الإجراء</Label>
                        <Input
                          value={againstPolicy}
                          onChange={(e) => setAgainstPolicy(e.target.value)}
                          placeholder="اسم السياسة أو الإجراء"
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* DESIRED OUTCOME - Advanced */}
            <Collapsible open={openSections.includes('outcome')} onOpenChange={() => toggleSection('outcome')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-500" />
                        النتيجة المرجوة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('outcome') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">النتيجة المرجوة بالعربية</Label>
                      <Textarea
                        value={desiredOutcomeAr}
                        onChange={(e) => setDesiredOutcomeAr(e.target.value)}
                        placeholder="ما هي النتيجة التي تأمل الحصول عليها من هذه الشكوى..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Desired Outcome</Label>
                      <Textarea
                        value={desiredOutcome}
                        onChange={(e) => setDesiredOutcome(e.target.value)}
                        placeholder="What outcome do you hope to achieve..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
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
                        <Eye className="w-5 h-5 text-purple-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات مقدم الشكوى</Label>
                      <Textarea
                        value={complainantNotes}
                        onChange={(e) => setComplainantNotes(e.target.value)}
                        placeholder="ملاحظات إضافية من مقدم الشكوى..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات الموارد البشرية</Label>
                      <Textarea
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="ملاحظات داخلية للموارد البشرية..."
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
                onClick={() => navigate({ to: '/dashboard/hr/grievances' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !grievanceType || !grievanceSubjectAr || !grievanceDescriptionAr || !filedDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تقديم الشكوى'}
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
