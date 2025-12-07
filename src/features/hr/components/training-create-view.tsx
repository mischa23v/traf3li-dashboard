import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateTraining, useUpdateTraining, useTraining } from '@/hooks/useTraining'
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
  CheckCircle, ChevronDown, Users, GraduationCap,
  Calendar, Clock, MapPin, Monitor, Globe,
  Award, BookOpen, Scale, FileText, DollarSign, AlertTriangle
} from 'lucide-react'
import {
  TRAINING_TYPE_LABELS,
  TRAINING_CATEGORY_LABELS,
  DELIVERY_METHOD_LABELS,
  DIFFICULTY_LABELS,
  URGENCY_LABELS,
  CLE_CATEGORY_LABELS,
  type TrainingType,
  type TrainingCategory,
  type DeliveryMethod,
  type DifficultyLevel,
  type UrgencyLevel,
  type ProviderType,
  type LocationType,
  type CLECategory,
  type CreateTrainingData,
} from '@/services/trainingService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function TrainingCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingTraining, isLoading: isLoadingTraining } = useTraining(editId || '')
  const createMutation = useCreateTraining()
  const updateMutation = useUpdateTraining()

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
  const [jobTitle, setJobTitle] = useState('')

  // Form State - Training Details
  const [trainingTitle, setTrainingTitle] = useState('')
  const [trainingTitleAr, setTrainingTitleAr] = useState('')
  const [trainingDescription, setTrainingDescription] = useState('')
  const [trainingDescriptionAr, setTrainingDescriptionAr] = useState('')
  const [trainingType, setTrainingType] = useState<TrainingType>('internal')
  const [trainingCategory, setTrainingCategory] = useState<TrainingCategory>('technical')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('classroom')
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediate')
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium')

  // Dates & Duration
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalHours, setTotalHours] = useState<number>(0)
  const [totalDays, setTotalDays] = useState<number>(0)

  // Location
  const [locationType, setLocationType] = useState<LocationType>('on_site')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('المملكة العربية السعودية')

  // Virtual Details
  const [platform, setPlatform] = useState('')
  const [meetingLink, setMeetingLink] = useState('')

  // Provider
  const [providerType, setProviderType] = useState<ProviderType>('internal')
  const [providerName, setProviderName] = useState('')
  const [providerNameAr, setProviderNameAr] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [platformName, setPlatformName] = useState('')

  // CLE (Continuing Legal Education) - Attorney Training
  const [isCLE, setIsCLE] = useState(false)
  const [cleCredits, setCleCredits] = useState<number>(0)
  const [cleCategory, setCleCategory] = useState<CLECategory>('general')
  const [ethicsCredits, setEthicsCredits] = useState<number>(0)

  // Costs
  const [baseFee, setBaseFee] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')

  // Compliance
  const [isMandatory, setIsMandatory] = useState(false)
  const [mandatoryReason, setMandatoryReason] = useState('')
  const [complianceDeadline, setComplianceDeadline] = useState('')

  // Business Justification
  const [businessJustification, setBusinessJustification] = useState('')
  const [businessJustificationAr, setBusinessJustificationAr] = useState('')

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
    if (existingTraining && isEditMode) {
      setEmployeeId(existingTraining.employeeId || '')
      setEmployeeName(existingTraining.employeeName || '')
      setEmployeeNameAr(existingTraining.employeeNameAr || '')
      setEmployeeNumber(existingTraining.employeeNumber || '')
      setDepartment(existingTraining.department || '')
      setJobTitle(existingTraining.jobTitle || '')
      setTrainingTitle(existingTraining.trainingTitle || '')
      setTrainingTitleAr(existingTraining.trainingTitleAr || '')
      setTrainingDescription(existingTraining.trainingDescription || '')
      setTrainingDescriptionAr(existingTraining.trainingDescriptionAr || '')
      setTrainingType(existingTraining.trainingType)
      setTrainingCategory(existingTraining.trainingCategory)
      setDeliveryMethod(existingTraining.deliveryMethod)
      setDifficultyLevel(existingTraining.difficultyLevel)
      setUrgency(existingTraining.urgency || 'medium')
      setStartDate(existingTraining.startDate?.split('T')[0] || '')
      setEndDate(existingTraining.endDate?.split('T')[0] || '')
      setTotalHours(existingTraining.duration?.totalHours || 0)
      setTotalDays(existingTraining.duration?.totalDays || 0)
      setLocationType(existingTraining.locationType)
      setVenueName(existingTraining.venue?.venueName || '')
      setVenueAddress(existingTraining.venue?.venueAddress || '')
      setCity(existingTraining.venue?.city || '')
      setCountry(existingTraining.venue?.country || 'المملكة العربية السعودية')
      setPlatform(existingTraining.virtualDetails?.platform || '')
      setMeetingLink(existingTraining.virtualDetails?.meetingLink || '')
      setProviderType(existingTraining.provider?.providerType || 'internal')
      setProviderName(existingTraining.provider?.providerName || '')
      setProviderNameAr(existingTraining.provider?.providerNameAr || '')
      setContactEmail(existingTraining.provider?.contactEmail || '')
      setPlatformName(existingTraining.provider?.platformName || '')
      setIsCLE(existingTraining.cleDetails?.isCLE || false)
      setCleCredits(existingTraining.cleDetails?.cleCredits || 0)
      setCleCategory(existingTraining.cleDetails?.cleCategory || 'general')
      setEthicsCredits(existingTraining.cleDetails?.ethicsCredits || 0)
      setBaseFee(existingTraining.costs?.trainingFee?.baseFee || 0)
      setIsMandatory(existingTraining.complianceTracking?.isMandatory || false)
      setMandatoryReason(existingTraining.complianceTracking?.mandatoryReason || '')
      setComplianceDeadline(existingTraining.complianceTracking?.complianceDeadline?.split('T')[0] || '')
      setBusinessJustification(existingTraining.businessJustification || '')
      setBusinessJustificationAr(existingTraining.businessJustificationAr || '')
      setEmployeeNotes(existingTraining.notes?.employeeNotes || '')
      setHrNotes(existingTraining.notes?.hrNotes || '')
    }
  }, [existingTraining, isEditMode])

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
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateTrainingData = {
      employeeId,
      employeeName,
      employeeNameAr: employeeNameAr || undefined,
      employeeNumber: employeeNumber || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
      trainingTitle,
      trainingTitleAr: trainingTitleAr || undefined,
      trainingDescription: trainingDescription || undefined,
      trainingDescriptionAr: trainingDescriptionAr || undefined,
      trainingType,
      trainingCategory,
      deliveryMethod,
      difficultyLevel,
      urgency,
      businessJustification: businessJustification || undefined,
      businessJustificationAr: businessJustificationAr || undefined,
      startDate,
      endDate,
      totalHours,
      totalDays: totalDays || undefined,
      locationType,
      venue: (locationType === 'on_site' || locationType === 'off_site' || locationType === 'hybrid') ? {
        venueName: venueName || undefined,
        venueAddress: venueAddress || undefined,
        city: city || undefined,
        country: country || undefined,
      } : undefined,
      virtualDetails: (locationType === 'virtual' || locationType === 'hybrid') ? {
        platform: platform || undefined,
        meetingLink: meetingLink || undefined,
      } : undefined,
      provider: {
        providerType,
        providerName: providerName || undefined,
        providerNameAr: providerNameAr || undefined,
        contactEmail: contactEmail || undefined,
        platformName: platformName || undefined,
      },
      cleDetails: isCLE ? {
        isCLE: true,
        cleCredits: cleCredits || undefined,
        cleCategory,
        ethicsCredits: ethicsCredits || undefined,
      } : undefined,
      costs: baseFee > 0 ? {
        baseFee,
        currency,
      } : undefined,
      isMandatory,
      mandatoryReason: isMandatory ? mandatoryReason : undefined,
      complianceDeadline: isMandatory && complianceDeadline ? complianceDeadline : undefined,
      notes: {
        employeeNotes: employeeNotes || undefined,
        hrNotes: hrNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        trainingId: editId,
        data: {
          trainingTitle,
          trainingTitleAr,
          trainingDescription,
          trainingDescriptionAr,
          trainingType,
          trainingCategory,
          deliveryMethod,
          difficultyLevel,
          urgency,
          businessJustification,
          businessJustificationAr,
          startDate,
          endDate,
          totalHours,
          locationType,
          venue: { venueName, venueAddress, city },
          virtualDetails: { platform, meetingLink },
          provider: { providerType, providerName, contactEmail },
          cleDetails: isCLE ? { isCLE: true, cleCredits, cleCategory } : undefined,
          costs: baseFee > 0 ? { baseFee } : undefined,
          notes: { employeeNotes, hrNotes },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/training' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التدريب', href: '/dashboard/hr/training', isActive: true },
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
          title={isEditMode ? 'تعديل التدريب' : 'طلب تدريب جديد'}
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
                onClick={() => navigate({ to: '/dashboard/hr/training' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل التدريب' : 'طلب تدريب جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات التدريب' : 'تسجيل طلب تدريب للموظف'}
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
                    <Label className="text-navy font-medium">رقم الموظف</Label>
                    <Input
                      value={employeeNumber}
                      readOnly
                      placeholder="رقم الموظف"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TRAINING DETAILS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  تفاصيل التدريب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      عنوان التدريب <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={trainingTitleAr}
                      onChange={(e) => setTrainingTitleAr(e.target.value)}
                      placeholder="عنوان التدريب بالعربية"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Training Title</Label>
                    <Input
                      value={trainingTitle}
                      onChange={(e) => setTrainingTitle(e.target.value)}
                      placeholder="Training title in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    نوع التدريب <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(TRAINING_TYPE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setTrainingType(key as TrainingType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          trainingType === key
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
                    <Label className="text-navy font-medium">التصنيف</Label>
                    <Select value={trainingCategory} onValueChange={(v) => setTrainingCategory(v as TrainingCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TRAINING_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المستوى</Label>
                    <Select value={difficultyLevel} onValueChange={(v) => setDifficultyLevel(v as DifficultyLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">طريقة التقديم</Label>
                    <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DELIVERY_METHOD_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">درجة الأولوية</Label>
                    <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATE & DURATION - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  التاريخ والمدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ البداية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      تاريخ النهاية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      إجمالي الساعات <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={totalHours || ''}
                      onChange={(e) => setTotalHours(Number(e.target.value))}
                      placeholder="0"
                      className="h-11 rounded-xl"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">عدد الأيام</Label>
                    <Input
                      type="number"
                      value={totalDays || ''}
                      onChange={(e) => setTotalDays(Number(e.target.value))}
                      placeholder="0"
                      className="h-11 rounded-xl"
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LOCATION - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">نوع الموقع</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'on_site', labelAr: 'في المقر', icon: Building2 },
                      { value: 'off_site', labelAr: 'خارج المقر', icon: MapPin },
                      { value: 'virtual', labelAr: 'افتراضي', icon: Monitor },
                      { value: 'hybrid', labelAr: 'مدمج', icon: Globe },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocationType(option.value as LocationType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          locationType === option.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{option.labelAr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(locationType === 'on_site' || locationType === 'off_site' || locationType === 'hybrid') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">اسم المكان</Label>
                      <Input
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="اسم قاعة التدريب أو المركز"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">المدينة</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="المدينة"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {(locationType === 'virtual' || locationType === 'hybrid') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">المنصة</Label>
                      <Input
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        placeholder="مثال: Zoom, Teams, Webex"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">رابط الاجتماع</Label>
                      <Input
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="رابط الاجتماع الافتراضي"
                        className="h-11 rounded-xl"
                        dir="ltr"
                      />
                    </div>
                  </div>
                )}
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
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        مقدم التدريب
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
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">نوع المقدم</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { value: 'internal', labelAr: 'داخلي' },
                          { value: 'external', labelAr: 'خارجي' },
                          { value: 'online_platform', labelAr: 'منصة إلكترونية' },
                          { value: 'university', labelAr: 'جامعة' },
                          { value: 'professional_association', labelAr: 'جمعية مهنية' },
                          { value: 'consultant', labelAr: 'مستشار' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setProviderType(option.value as ProviderType)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-center",
                              providerType === option.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                            )}
                          >
                            <span className="text-sm font-medium">{option.labelAr}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اسم المقدم بالعربية</Label>
                        <Input
                          value={providerNameAr}
                          onChange={(e) => setProviderNameAr(e.target.value)}
                          placeholder="اسم مقدم التدريب"
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
                        <Label className="text-navy font-medium">البريد الإلكتروني للتواصل</Label>
                        <Input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="email@provider.com"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      {providerType === 'online_platform' && (
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">اسم المنصة</Label>
                          <Input
                            value={platformName}
                            onChange={(e) => setPlatformName(e.target.value)}
                            placeholder="مثال: LinkedIn Learning, Coursera"
                            className="h-11 rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* CLE (Attorney Training) - Advanced */}
            <Collapsible open={openSections.includes('cle')} onOpenChange={() => toggleSection('cle')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-500" />
                        التعليم القانوني المستمر (CLE)
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isCLE && (
                          <Badge className="bg-amber-100 text-amber-700">{cleCredits} ساعة</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('cle') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3">
                        <Scale className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-amber-700">تدريب معتمد للتعليم القانوني المستمر</p>
                          <p className="text-xs text-amber-600">للمحامين والمستشارين القانونيين</p>
                        </div>
                      </div>
                      <Switch
                        checked={isCLE}
                        onCheckedChange={setIsCLE}
                      />
                    </div>

                    {isCLE && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">عدد ساعات CLE</Label>
                            <Input
                              type="number"
                              value={cleCredits || ''}
                              onChange={(e) => setCleCredits(Number(e.target.value))}
                              placeholder="0"
                              className="h-11 rounded-xl"
                              min={0}
                              step={0.5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">ساعات الأخلاقيات</Label>
                            <Input
                              type="number"
                              value={ethicsCredits || ''}
                              onChange={(e) => setEthicsCredits(Number(e.target.value))}
                              placeholder="0"
                              className="h-11 rounded-xl"
                              min={0}
                              step={0.5}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">فئة CLE</Label>
                          <Select value={cleCategory} onValueChange={(v) => setCleCategory(v as CLECategory)}>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CLE_CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* COSTS - Advanced */}
            <Collapsible open={openSections.includes('costs')} onOpenChange={() => toggleSection('costs')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-500" />
                        التكاليف
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {baseFee > 0 && (
                          <Badge className="bg-teal-100 text-teal-700">{baseFee.toLocaleString('ar-SA')} ر.س</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('costs') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">رسوم التدريب</Label>
                        <Input
                          type="number"
                          value={baseFee || ''}
                          onChange={(e) => setBaseFee(Number(e.target.value))}
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
                            <SelectItem value="GBP">جنيه إسترليني (GBP)</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
                        الامتثال والتدريب الإلزامي
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isMandatory && (
                          <Badge className="bg-red-100 text-red-700">إلزامي</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('compliance') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
                        <div>
                          <p className="font-medium text-red-700">تدريب إلزامي</p>
                          <p className="text-xs text-red-600">يجب إكماله قبل الموعد المحدد</p>
                        </div>
                      </div>
                      <Switch
                        checked={isMandatory}
                        onCheckedChange={setIsMandatory}
                      />
                    </div>

                    {isMandatory && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">سبب الإلزام</Label>
                          <Input
                            value={mandatoryReason}
                            onChange={(e) => setMandatoryReason(e.target.value)}
                            placeholder="مثال: متطلب تنظيمي، سياسة الشركة..."
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">الموعد النهائي للامتثال</Label>
                          <Input
                            type="date"
                            value={complianceDeadline}
                            onChange={(e) => setComplianceDeadline(e.target.value)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* JUSTIFICATION & NOTES - Advanced */}
            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" aria-hidden="true" />
                        المبررات والملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">وصف التدريب بالعربية</Label>
                      <Textarea
                        value={trainingDescriptionAr}
                        onChange={(e) => setTrainingDescriptionAr(e.target.value)}
                        placeholder="وصف مختصر للتدريب..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Training Description</Label>
                      <Textarea
                        value={trainingDescription}
                        onChange={(e) => setTrainingDescription(e.target.value)}
                        placeholder="Brief training description..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">المبرر العملي</Label>
                      <Textarea
                        value={businessJustificationAr}
                        onChange={(e) => setBusinessJustificationAr(e.target.value)}
                        placeholder="لماذا هذا التدريب مهم للموظف والمنظمة..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Business Justification</Label>
                      <Textarea
                        value={businessJustification}
                        onChange={(e) => setBusinessJustification(e.target.value)}
                        placeholder="Why is this training important..."
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
                onClick={() => navigate({ to: '/dashboard/hr/training' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !trainingTitle || !startDate || !endDate || !totalHours || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تقديم الطلب'}
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
