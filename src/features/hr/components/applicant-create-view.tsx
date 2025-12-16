import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateApplicant, useJobPostings } from '@/hooks/useRecruitment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, ArrowRight, User, Building, Users, Briefcase,
  ChevronDown, Mail, Phone, MapPin, Plus, Trash2, Upload,
  Info, CheckCircle, GraduationCap, FileText, Languages,
  DollarSign, Calendar, Globe, Scale, Lock
} from 'lucide-react'
import type {
  EducationLevel,
  ApplicationSource,
  Applicant,
} from '@/services/recruitmentService'
import {
  EDUCATION_LABELS,
  SOURCE_LABELS,
} from '@/services/recruitmentService'
import { isValidEmail, isValidPhone, errorMessages } from '@/utils/validation-patterns'

// Office types
const OFFICE_TYPES = [
  {
    id: 'solo',
    icon: User,
    title: 'فردي',
    titleEn: 'Solo',
    description: 'محامي مستقل',
    fields: ['basic', 'contact', 'job'],
  },
  {
    id: 'small',
    icon: Building,
    title: 'مكتب صغير',
    titleEn: 'Small Office',
    description: '2-5 موظفين',
    fields: ['basic', 'contact', 'job', 'education', 'experience'],
  },
  {
    id: 'medium',
    icon: Users,
    title: 'مكتب متوسط',
    titleEn: 'Medium Office',
    description: '6-20 موظف',
    fields: ['basic', 'contact', 'job', 'education', 'experience', 'skills', 'compensation'],
  },
  {
    id: 'firm',
    icon: Briefcase,
    title: 'شركة محاماة',
    titleEn: 'Law Firm',
    description: '20+ موظف',
    fields: ['basic', 'contact', 'job', 'education', 'experience', 'skills', 'compensation', 'attorney', 'references'],
  },
]

export function ApplicantCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { jobId?: string }
  const createMutation = useCreateApplicant()
  const { data: jobsData, isLoading: isLoadingJobs } = useJobPostings({ status: 'published' })

  // Form state
  const [officeType, setOfficeType] = useState<string>('medium')

  // Personal Info
  const [fullName, setFullName] = useState('')
  const [fullNameAr, setFullNameAr] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('SA')
  const [isSaudi, setIsSaudi] = useState(true)
  const [currentLocation, setCurrentLocation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  const [requiresVisa, setRequiresVisa] = useState(false)

  // Application
  const [jobPostingId, setJobPostingId] = useState(searchParams.jobId || '')
  const [applicationSource, setApplicationSource] = useState<ApplicationSource>('company_website')
  const [referredByName, setReferredByName] = useState('')

  // Education
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('bachelor')
  const [degree, setDegree] = useState('')
  const [major, setMajor] = useState('')
  const [institution, setInstitution] = useState('')
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear())

  // Experience
  const [totalExperience, setTotalExperience] = useState(0)
  const [currentlyEmployed, setCurrentlyEmployed] = useState(false)
  const [currentCompany, setCurrentCompany] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // Skills
  const [skills, setSkills] = useState<Array<{ skillName: string; proficiencyLevel: string }>>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate')
  const [languages, setLanguages] = useState<Array<{ language: string; level: string }>>([
    { language: 'العربية', level: 'native' },
  ])
  const [newLanguage, setNewLanguage] = useState('')
  const [newLanguageLevel, setNewLanguageLevel] = useState('fluent')

  // Compensation
  const [expectedSalary, setExpectedSalary] = useState<number | undefined>()
  const [salaryNegotiable, setSalaryNegotiable] = useState(true)
  const [noticePeriod, setNoticePeriod] = useState<number | undefined>()
  const [availableToStart, setAvailableToStart] = useState('')

  // Attorney
  const [isAttorney, setIsAttorney] = useState(false)
  const [barAdmission, setBarAdmission] = useState(false)
  const [totalYearsAsAttorney, setTotalYearsAsAttorney] = useState(0)
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])

  // Collapsible states
  const [isEducationOpen, setIsEducationOpen] = useState(true)
  const [isExperienceOpen, setIsExperienceOpen] = useState(false)
  const [isSkillsOpen, setIsSkillsOpen] = useState(false)
  const [isCompensationOpen, setIsCompensationOpen] = useState(false)
  const [isAttorneyOpen, setIsAttorneyOpen] = useState(false)

  // Validation errors
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const selectedOffice = OFFICE_TYPES.find((o) => o.id === officeType)
  const hasField = (field: string) => selectedOffice?.fields.includes(field)

  const selectedJob = jobsData?.data?.find(j => j._id === jobPostingId)

  // Add skill
  const addSkill = () => {
    if (!newSkillName) return
    setSkills([...skills, { skillName: newSkillName, proficiencyLevel: newSkillLevel }])
    setNewSkillName('')
  }

  // Remove skill
  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  // Add language
  const addLanguage = () => {
    if (!newLanguage) return
    setLanguages([...languages, { language: newLanguage, level: newLanguageLevel }])
    setNewLanguage('')
  }

  // Remove language
  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  // Handle submit
  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError('')
    setPhoneError('')

    // Validate email
    if (!isValidEmail(email)) {
      setEmailError(errorMessages.email.ar)
      return
    }

    // Validate phone
    if (!isValidPhone(phone)) {
      setPhoneError(errorMessages.phone.ar)
      return
    }

    try {
      const applicantData: Partial<Applicant> = {
        personalInfo: {
          fullName,
          fullNameAr,
          email,
          phone,
          nationality,
          isSaudi,
          currentLocation,
          willingToRelocate,
          requiresVisa,
        },
        application: {
          jobPostingId,
          jobTitle: selectedJob?.jobTitle || '',
          applicationDate: new Date().toISOString(),
          applicationSource,
          referredBy: applicationSource === 'referral' && referredByName ? {
            employeeName: referredByName,
          } : undefined,
          applicationMaterials: {
            coverLetterProvided: false,
          },
        },
        qualifications: {
          education: [{
            educationId: '1',
            level: educationLevel,
            degree,
            major,
            institution,
            institutionCountry: 'SA',
            graduationYear,
            verified: false,
          }],
          skills: skills.map(s => ({
            skillName: s.skillName,
            skillCategory: 'technical' as const,
            proficiencyLevel: s.proficiencyLevel as 'basic' | 'intermediate' | 'advanced' | 'expert',
          })),
          languages: languages.map(l => ({
            language: l.language,
            nativeLanguage: l.level === 'native',
            reading: l.level as 'basic' | 'intermediate' | 'fluent' | 'native',
            writing: l.level as 'basic' | 'intermediate' | 'fluent' | 'native',
            speaking: l.level as 'basic' | 'intermediate' | 'fluent' | 'native',
          })),
        },
        workExperience: {
          totalExperience,
          currentlyEmployed,
          workHistory: currentlyEmployed ? [{
            experienceId: '1',
            company: currentCompany,
            jobTitle: currentTitle,
            startDate: '',
            currentlyWorking: true,
            canContact: false,
            verified: false,
          }] : [],
          attorneyExperience: hasField('attorney') && isAttorney ? {
            totalYearsAsAttorney,
            practiceAreas: practiceAreas.map(area => ({
              practiceArea: area,
              yearsOfExperience: 0,
              expertise: 'intermediate' as const,
            })),
          } : undefined,
        },
        expectedCompensation: {
          expectedSalary: expectedSalary || 0,
          expectedCurrency: 'SAR',
          salaryPeriod: 'monthly',
          salaryNegotiable,
          noticePeriod,
        },
        availability: {
          currentEmploymentStatus: currentlyEmployed ? 'employed' : 'available',
          availableToStart: availableToStart || new Date().toISOString(),
          noticePeriod,
          immediatelyAvailable: !noticePeriod,
          workAuthorization: isSaudi ? 'citizen' : requiresVisa ? 'requires_visa' : 'work_permit',
        },
        interviews: [],
        status: 'applied',
      }

      await createMutation.mutateAsync(applicantData)
      navigate({ to: '/dashboard/hr/recruitment/applicants' })
    } catch {
      // Error is handled by mutation's onError callback
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التوظيف', href: '/dashboard/hr/recruitment/applicants', isActive: true },
  ]

  // Loading state
  if (isLoadingJobs) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center gap-4'>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden">
          {/* ProductivityHero Skeleton */}
          <Skeleton className="h-24 w-full rounded-2xl" />

          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Page Header Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              {/* Office Type Selector Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>

              {/* Job Selection Skeleton */}
              <Skeleton className="h-48 rounded-2xl" />

              {/* Personal Information Skeleton */}
              <Skeleton className="h-96 rounded-2xl" />

              {/* Additional Sections Skeleton */}
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />

              {/* Submit Button Skeleton */}
              <div className="flex items-center justify-end gap-4">
                <Skeleton className="h-12 w-24 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
              </div>
            </div>

            {/* RIGHT COLUMN (Widgets) Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      {/* Header */}
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
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* ProductivityHero */}
        <ProductivityHero
          badge="التوظيف"
          title="إضافة متقدم جديد"
          type="recruitment"
          listMode={true}
        />

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white"
                onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">متقدم جديد</h1>
                <p className="text-slate-500">إضافة متقدم جديد للوظيفة</p>
              </div>
            </div>

            {/* Office Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {OFFICE_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = officeType === type.id
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-transparent bg-white hover:border-emerald-200'
                } rounded-2xl`}
                onClick={() => setOfficeType(type.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-navy'}`}>
                    {type.title}
                  </h3>
                  <p className="text-sm text-slate-500">{type.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Job Selection */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              الوظيفة المتقدم لها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الوظيفة *</Label>
                <Select value={jobPostingId} onValueChange={setJobPostingId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر الوظيفة" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobsData?.data?.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.jobTitleAr || job.jobTitle} - {job.departmentNameAr || job.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مصدر التقديم *</Label>
                <Select value={applicationSource} onValueChange={(v) => setApplicationSource(v as ApplicationSource)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="مصدر التقديم" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {applicationSource === 'referral' && (
              <div className="space-y-2">
                <Label htmlFor="referredBy">اسم المُوصي</Label>
                <Input
                  id="referredBy"
                  value={referredByName}
                  onChange={(e) => setReferredByName(e.target.value)}
                  placeholder="اسم الموظف الذي أوصى بالمتقدم"
                  className="rounded-xl"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل (بالإنجليزية) *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullNameAr">الاسم الكامل (بالعربية) *</Label>
                <Input
                  id="fullNameAr"
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></Label>
                <div className="relative">
                  <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError('')
                    }}
                    placeholder="email@example.com"
                    className={`rounded-xl pe-10 ${emailError ? 'border-red-500' : ''}`}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *<Lock className="h-3 w-3 text-slate-500 inline ms-1" /></Label>
                <div className="relative">
                  <Phone className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setPhoneError('')
                    }}
                    placeholder="+966 5X XXX XXXX"
                    className={`rounded-xl pe-10 ${phoneError ? 'border-red-500' : ''}`}
                    dir="ltr"
                  />
                </div>
                {phoneError && (
                  <p className="text-sm text-red-500">{phoneError}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الجنسية *</Label>
                <Select value={nationality} onValueChange={(v) => {
                  setNationality(v)
                  setIsSaudi(v === 'SA')
                }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="الجنسية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SA">سعودي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLocation">الموقع الحالي *</Label>
                <div className="relative">
                  <MapPin className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    id="currentLocation"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="المدينة"
                    className="rounded-xl pe-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={willingToRelocate}
                    onChange={(e) => setWillingToRelocate(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">مستعد للانتقال</span>
                </label>
              </div>
            </div>
            {!isSaudi && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div>
                  <p className="font-bold text-amber-800">يحتاج تأشيرة عمل</p>
                  <p className="text-sm text-amber-700">المتقدم غير سعودي ويحتاج كفالة</p>
                </div>
                <Switch
                  checked={requiresVisa}
                  onCheckedChange={setRequiresVisa}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Section */}
        {hasField('education') && (
          <Collapsible open={isEducationOpen} onOpenChange={setIsEducationOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      التعليم
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isEducationOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>المستوى التعليمي *</Label>
                      <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v as EducationLevel)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EDUCATION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">الدرجة العلمية</Label>
                      <Input
                        id="degree"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="بكالوريوس القانون"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">التخصص</Label>
                      <Input
                        id="major"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="القانون"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution">الجامعة / المؤسسة</Label>
                      <Input
                        id="institution"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="جامعة الملك سعود"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">سنة التخرج</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        min={1980}
                        max={new Date().getFullYear()}
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(parseInt(e.target.value))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Experience Section */}
        {hasField('experience') && (
          <Collapsible open={isExperienceOpen} onOpenChange={setIsExperienceOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      الخبرة العملية
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isExperienceOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalExperience">إجمالي سنوات الخبرة *</Label>
                      <Input
                        id="totalExperience"
                        type="number"
                        min={0}
                        value={totalExperience}
                        onChange={(e) => setTotalExperience(parseInt(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-navy">يعمل حالياً</p>
                        <p className="text-sm text-slate-500">المتقدم يعمل حالياً في وظيفة أخرى</p>
                      </div>
                      <Switch
                        checked={currentlyEmployed}
                        onCheckedChange={setCurrentlyEmployed}
                      />
                    </div>
                  </div>
                  {currentlyEmployed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentCompany">الشركة الحالية</Label>
                        <Input
                          id="currentCompany"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="اسم الشركة"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentTitle">المسمى الوظيفي الحالي</Label>
                        <Input
                          id="currentTitle"
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          placeholder="المسمى الوظيفي"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Skills Section */}
        {hasField('skills') && (
          <Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Languages className="w-4 h-4 text-emerald-600" />
                      المهارات واللغات
                      {(skills.length > 0 || languages.length > 0) && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {skills.length + languages.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isSkillsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Skills */}
                  <div className="space-y-3">
                    <Label>المهارات</Label>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                            <span className="text-sm font-medium text-navy">{skill.skillName}</span>
                            <span className="text-xs text-slate-500">({skill.proficiencyLevel})</span>
                            <button
                              onClick={() => removeSkill(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Input
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="اسم المهارة"
                        className="rounded-xl"
                      />
                      <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">مبتدئ</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="advanced">متقدم</SelectItem>
                          <SelectItem value="expert">خبير</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={addSkill}
                        disabled={!newSkillName}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-3">
                    <Label>اللغات</Label>
                    {languages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-100 rounded-lg px-3 py-1.5">
                            <Globe className="w-3 h-3 text-blue-600" aria-hidden="true" />
                            <span className="text-sm font-medium text-blue-700">{lang.language}</span>
                            <span className="text-xs text-blue-500">({lang.level})</span>
                            {index > 0 && (
                              <button
                                onClick={() => removeLanguage(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="اسم اللغة"
                        className="rounded-xl"
                      />
                      <Select value={newLanguageLevel} onValueChange={setNewLanguageLevel}>
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">مبتدئ</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="fluent">طلاقة</SelectItem>
                          <SelectItem value="native">لغة أم</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={addLanguage}
                        disabled={!newLanguage}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Compensation Section */}
        {hasField('compensation') && (
          <Collapsible open={isCompensationOpen} onOpenChange={setIsCompensationOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      التعويضات والتوفر
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isCompensationOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedSalary">الراتب المتوقع (ر.س)</Label>
                      <Input
                        id="expectedSalary"
                        type="number"
                        min={0}
                        value={expectedSalary || ''}
                        onChange={(e) => setExpectedSalary(parseInt(e.target.value) || undefined)}
                        placeholder="10000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noticePeriod">فترة الإشعار (أيام)</Label>
                      <Input
                        id="noticePeriod"
                        type="number"
                        min={0}
                        value={noticePeriod || ''}
                        onChange={(e) => setNoticePeriod(parseInt(e.target.value) || undefined)}
                        placeholder="30"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availableToStart">تاريخ البدء المتوقع</Label>
                      <Input
                        id="availableToStart"
                        type="date"
                        value={availableToStart}
                        onChange={(e) => setAvailableToStart(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">الراتب قابل للتفاوض</p>
                      <p className="text-sm text-slate-500">المتقدم مستعد للتفاوض على الراتب</p>
                    </div>
                    <Switch
                      checked={salaryNegotiable}
                      onCheckedChange={setSalaryNegotiable}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Attorney Section */}
        {hasField('attorney') && (
          <Collapsible open={isAttorneyOpen} onOpenChange={setIsAttorneyOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      معلومات المحامي
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isAttorneyOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">المتقدم محامي</p>
                      <p className="text-sm text-slate-500">المتقدم يحمل رخصة مزاولة مهنة المحاماة</p>
                    </div>
                    <Switch
                      checked={isAttorney}
                      onCheckedChange={setIsAttorney}
                    />
                  </div>
                  {isAttorney && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                          <div>
                            <p className="font-bold text-purple-800">مسجل بالهيئة السعودية للمحامين</p>
                            <p className="text-sm text-purple-700">لديه ترخيص ساري</p>
                          </div>
                          <Switch
                            checked={barAdmission}
                            onCheckedChange={setBarAdmission}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attorneyYears">سنوات الخبرة كمحامي</Label>
                          <Input
                            id="attorneyYears"
                            type="number"
                            min={0}
                            value={totalYearsAsAttorney}
                            onChange={(e) => setTotalYearsAsAttorney(parseInt(e.target.value) || 0)}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Saudi Labor Law Info */}
        <Card className="border-none shadow-sm bg-blue-50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1">نظام العمل السعودي - التوظيف</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• المادة 26: أولوية التوظيف للمواطنين السعوديين</li>
                  <li>• نظام نطاقات: يجب الالتزام بنسب السعودة المحددة لكل نشاط</li>
                  <li>• توظيف غير السعوديين يتطلب رخصة عمل وتأشيرة عمل سارية</li>
                  <li>• يجب التحقق من صلاحية رخصة المحامي قبل التعيين</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/hr/recruitment/applicants' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {createMutation.isPending ? (
                  <>جاري الإضافة...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    إضافة المتقدم
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
