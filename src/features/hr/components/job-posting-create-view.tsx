import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useNavigate } from '@tanstack/react-router'
import { useCreateJobPosting } from '@/hooks/useRecruitment'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, ArrowRight, User, Building, Users, Briefcase,
  Calendar, ChevronDown, FileText, Star, MapPin, Plus, Trash2,
  Info, CheckCircle, DollarSign, GraduationCap, Globe, Clock,
  Target, Scale, Languages, Award, Zap
} from 'lucide-react'
import type {
  EmploymentType,
  ContractType,
  SeniorityLevel,
  Urgency,
  WorkLocation,
  EducationLevel,
  JobPosting,
} from '@/services/recruitmentService'
import {
  EMPLOYMENT_TYPE_LABELS,
  SENIORITY_LABELS,
  EDUCATION_LABELS,
} from '@/services/recruitmentService'

// Office types
const OFFICE_TYPES = [
  {
    id: 'solo',
    icon: User,
    title: 'فردي',
    titleEn: 'Solo',
    description: 'محامي مستقل',
    fields: ['basic', 'requirements'],
  },
  {
    id: 'small',
    icon: Building,
    title: 'مكتب صغير',
    titleEn: 'Small Office',
    description: '2-5 موظفين',
    fields: ['basic', 'requirements', 'salary'],
  },
  {
    id: 'medium',
    icon: Users,
    title: 'مكتب متوسط',
    titleEn: 'Medium Office',
    description: '6-20 موظف',
    fields: ['basic', 'requirements', 'salary', 'benefits', 'hiringProcess'],
  },
  {
    id: 'firm',
    icon: Briefcase,
    title: 'شركة محاماة',
    titleEn: 'Law Firm',
    description: '20+ موظف',
    fields: ['basic', 'requirements', 'salary', 'benefits', 'hiringProcess', 'attorneyRequirements', 'approvals'],
  },
]

// Urgency labels
const URGENCY_OPTIONS: Array<{ value: Urgency; label: string; color: string }> = [
  { value: 'low', label: 'منخفضة', color: 'slate' },
  { value: 'medium', label: 'متوسطة', color: 'blue' },
  { value: 'high', label: 'عالية', color: 'amber' },
  { value: 'critical', label: 'حرجة', color: 'red' },
]

// Work location labels
const WORK_LOCATION_LABELS: Record<WorkLocation, string> = {
  office: 'من المكتب',
  remote: 'عن بُعد',
  hybrid: 'هجين',
}

// Contract type labels
const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  indefinite: 'غير محدد المدة',
  fixed_term: 'محدد المدة',
}

// Default skills categories
const DEFAULT_SKILLS = [
  { id: 'legal_research', name: 'البحث القانوني', category: 'legal' as const },
  { id: 'contract_drafting', name: 'صياغة العقود', category: 'legal' as const },
  { id: 'litigation', name: 'التقاضي', category: 'legal' as const },
  { id: 'negotiation', name: 'التفاوض', category: 'soft_skill' as const },
  { id: 'communication', name: 'التواصل', category: 'soft_skill' as const },
  { id: 'arabic', name: 'اللغة العربية', category: 'language' as const },
  { id: 'english', name: 'اللغة الإنجليزية', category: 'language' as const },
  { id: 'ms_office', name: 'مايكروسوفت أوفيس', category: 'software' as const },
]

export function JobPostingCreateView() {
  const navigate = useNavigate()
  const createMutation = useCreateJobPosting()

  // Form state
  const [officeType, setOfficeType] = useState<string>('medium')

  // Basic fields
  const [jobTitle, setJobTitle] = useState('')
  const [jobTitleAr, setJobTitleAr] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
  const [contractType, setContractType] = useState<ContractType>('indefinite')
  const [contractDuration, setContractDuration] = useState<number | undefined>()
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>('mid')
  const [positions, setPositions] = useState(1)
  const [urgency, setUrgency] = useState<Urgency>('medium')
  const [workLocation, setWorkLocation] = useState<WorkLocation>('office')
  const [jobSummary, setJobSummary] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>([''])

  // Requirements
  const [minimumEducation, setMinimumEducation] = useState<EducationLevel>('bachelor')
  const [minimumExperience, setMinimumExperience] = useState(0)
  const [maximumExperience, setMaximumExperience] = useState<number | undefined>()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['communication', 'arabic'])

  // Salary
  const [showSalary, setShowSalary] = useState(false)
  const [salaryMin, setSalaryMin] = useState<number | undefined>()
  const [salaryMax, setSalaryMax] = useState<number | undefined>()
  const [salaryNegotiable, setSalaryNegotiable] = useState(true)
  const [housingAllowance, setHousingAllowance] = useState<number | undefined>()
  const [transportAllowance, setTransportAllowance] = useState<number | undefined>()

  // Benefits
  const [benefits, setBenefits] = useState<Array<{ benefit: string; category: string }>>([])
  const [newBenefit, setNewBenefit] = useState('')
  const [newBenefitCategory, setNewBenefitCategory] = useState('health')
  const [annualLeave, setAnnualLeave] = useState(21)
  const [hajjLeave, setHajjLeave] = useState(true)

  // Hiring process
  const [hiringStages, setHiringStages] = useState<Array<{ stageName: string; stageType: string }>>([
    { stageName: 'مراجعة السيرة الذاتية', stageType: 'screening' },
    { stageName: 'المقابلة الأولى', stageType: 'interview' },
  ])

  // Attorney requirements
  const [barAdmissionRequired, setBarAdmissionRequired] = useState(false)
  const [jurisdiction, setJurisdiction] = useState('')
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])

  // Collapsible states
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true)
  const [isSalaryOpen, setIsSalaryOpen] = useState(false)
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false)
  const [isHiringProcessOpen, setIsHiringProcessOpen] = useState(false)
  const [isAttorneyReqOpen, setIsAttorneyReqOpen] = useState(false)

  const selectedOffice = OFFICE_TYPES.find((o) => o.id === officeType)
  const hasField = (field: string) => selectedOffice?.fields.includes(field)

  // Toggle skill
  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId))
    } else {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  // Add responsibility
  const addResponsibility = () => {
    setResponsibilities([...responsibilities, ''])
  }

  // Update responsibility
  const updateResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities]
    updated[index] = value
    setResponsibilities(updated)
  }

  // Remove responsibility
  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index))
  }

  // Add benefit
  const addBenefit = () => {
    if (!newBenefit) return
    setBenefits([...benefits, { benefit: newBenefit, category: newBenefitCategory }])
    setNewBenefit('')
  }

  // Remove benefit
  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  // Add hiring stage
  const addHiringStage = () => {
    setHiringStages([...hiringStages, { stageName: '', stageType: 'interview' }])
  }

  // Update hiring stage
  const updateHiringStage = (index: number, field: 'stageName' | 'stageType', value: string) => {
    const updated = [...hiringStages]
    updated[index][field] = value
    setHiringStages(updated)
  }

  // Remove hiring stage
  const removeHiringStage = (index: number) => {
    setHiringStages(hiringStages.filter((_, i) => i !== index))
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      const jobData: Partial<JobPosting> = {
        jobTitle,
        jobTitleAr,
        department,
        location,
        employmentType,
        contractType,
        contractDuration: contractType === 'fixed_term' ? contractDuration : undefined,
        seniorityLevel,
        positions,
        urgency,
        workLocation,
        travelRequired: false,
        jobDescription: {
          summary: jobSummary,
          summaryAr: jobSummary,
          responsibilities: responsibilities.filter(r => r).map(r => ({
            responsibility: r,
            responsibilityAr: r,
            priority: 'primary' as const,
          })),
        },
        requirements: {
          minimumEducation,
          minimumExperience,
          maximumExperience,
          skills: selectedSkills.map(skillId => {
            const skill = DEFAULT_SKILLS.find(s => s.id === skillId)
            return {
              skillId,
              name: skill?.name || skillId,
              nameAr: skill?.name || skillId,
              category: skill?.category || 'technical',
              proficiencyLevel: 'intermediate' as const,
              required: true,
            }
          }),
          attorneyRequirements: hasField('attorneyRequirements') && barAdmissionRequired ? {
            barAdmissionRequired,
            jurisdiction,
            practiceAreas: practiceAreas.map(area => ({
              practiceArea: area,
              required: true,
            })),
          } : undefined,
        },
        salary: {
          showSalary,
          salaryMin,
          salaryMax,
          salaryCurrency: 'SAR',
          salaryPeriod: 'monthly',
          salaryNegotiable,
          allowances: {
            housing: housingAllowance,
            transportation: transportAllowance,
          },
        },
        benefits: benefits.map(b => ({
          benefit: b.benefit,
          benefitAr: b.benefit,
          category: b.category as 'health' | 'insurance' | 'leave' | 'financial' | 'work_life' | 'other',
        })),
        leaveEntitlements: {
          annualLeave,
          sickLeave: 'حسب نظام العمل',
          hajjLeave,
        },
        hiringStages: hiringStages.filter(s => s.stageName).map((stage, index) => ({
          stageNumber: index + 1,
          stageName: stage.stageName,
          stageType: stage.stageType as 'screening' | 'phone_screening' | 'assessment' | 'interview' | 'background_check' | 'offer' | 'onboarding',
          automated: false,
        })),
        recruitmentTeam: {
          hiringManager: {
            employeeId: '',
            employeeName: '',
            title: '',
          },
        },
        postingChannels: {
          internal: true,
          external: true,
          channels: [],
        },
        status: 'draft',
        applicationsCount: 0,
      }

      await createMutation.mutateAsync(jobData)
      navigate({ to: '/dashboard/hr/recruitment/jobs' })
    } catch (error) {
      console.error('Failed to create job posting:', error)
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'التوظيف', href: '/dashboard/hr/recruitment/jobs', isActive: true },
  ]

  return (
    <>
      {/* Header */}
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
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-white"
            onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs' })}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">وظيفة جديدة</h1>
            <p className="text-slate-500">إنشاء إعلان وظيفة جديد</p>
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

        {/* Basic Information */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              المعلومات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">المسمى الوظيفي (بالإنجليزية) *</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Attorney"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitleAr">المسمى الوظيفي (بالعربية) *</Label>
                <Input
                  id="jobTitleAr"
                  value={jobTitleAr}
                  onChange={(e) => setJobTitleAr(e.target.value)}
                  placeholder="محامي أول"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">القسم *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">القانونية</SelectItem>
                    <SelectItem value="litigation">التقاضي</SelectItem>
                    <SelectItem value="corporate">الشركات</SelectItem>
                    <SelectItem value="hr">الموارد البشرية</SelectItem>
                    <SelectItem value="admin">الإدارة</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع *</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">الرياض</SelectItem>
                    <SelectItem value="jeddah">جدة</SelectItem>
                    <SelectItem value="dammam">الدمام</SelectItem>
                    <SelectItem value="makkah">مكة المكرمة</SelectItem>
                    <SelectItem value="madinah">المدينة المنورة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positions">عدد الشواغر *</Label>
                <Input
                  id="positions"
                  type="number"
                  min={1}
                  value={positions}
                  onChange={(e) => setPositions(parseInt(e.target.value) || 1)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>نوع التوظيف *</Label>
                <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="نوع التوظيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نوع العقد *</Label>
                <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="نوع العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المستوى الوظيفي *</Label>
                <Select value={seniorityLevel} onValueChange={(v) => setSeniorityLevel(v as SeniorityLevel)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مكان العمل *</Label>
                <Select value={workLocation} onValueChange={(v) => setWorkLocation(v as WorkLocation)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="مكان العمل" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORK_LOCATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {contractType === 'fixed_term' && (
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="contractDuration">مدة العقد (بالأشهر)</Label>
                <Input
                  id="contractDuration"
                  type="number"
                  min={1}
                  value={contractDuration || ''}
                  onChange={(e) => setContractDuration(parseInt(e.target.value) || undefined)}
                  placeholder="12"
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Urgency */}
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <div className="flex gap-3">
                {URGENCY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUrgency(option.value)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      urgency === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${
                      option.color === 'red' ? 'text-red-500' :
                      option.color === 'amber' ? 'text-amber-500' :
                      option.color === 'blue' ? 'text-blue-500' :
                      'text-slate-400'
                    }`} />
                    <span className={urgency === option.value ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Job Summary */}
            <div className="space-y-2">
              <Label htmlFor="jobSummary">ملخص الوظيفة *</Label>
              <Textarea
                id="jobSummary"
                value={jobSummary}
                onChange={(e) => setJobSummary(e.target.value)}
                placeholder="وصف موجز للوظيفة ومتطلباتها الأساسية..."
                className="rounded-xl min-h-[100px]"
              />
            </div>

            {/* Responsibilities */}
            <div className="space-y-3">
              <Label>المسؤوليات *</Label>
              {responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={resp}
                    onChange={(e) => updateResponsibility(index, e.target.value)}
                    placeholder={`المسؤولية ${index + 1}`}
                    className="rounded-xl"
                  />
                  {responsibilities.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeResponsibility(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addResponsibility}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة مسؤولية
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Section */}
        {hasField('requirements') && (
          <Collapsible open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      المتطلبات والمؤهلات
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isRequirementsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>الحد الأدنى للتعليم *</Label>
                      <Select value={minimumEducation} onValueChange={(v) => setMinimumEducation(v as EducationLevel)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="المؤهل" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EDUCATION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minExp">الحد الأدنى للخبرة (سنوات)</Label>
                      <Input
                        id="minExp"
                        type="number"
                        min={0}
                        value={minimumExperience}
                        onChange={(e) => setMinimumExperience(parseInt(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxExp">الحد الأقصى للخبرة (سنوات)</Label>
                      <Input
                        id="maxExp"
                        type="number"
                        min={0}
                        value={maximumExperience || ''}
                        onChange={(e) => setMaximumExperience(parseInt(e.target.value) || undefined)}
                        placeholder="غير محدد"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <Label>المهارات المطلوبة</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DEFAULT_SKILLS.map((skill) => {
                        const isSelected = selectedSkills.includes(skill.id)
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`p-3 rounded-xl border-2 transition-all text-right ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-emerald-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {skill.name}
                              </span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <span className={`text-xs ${
                              skill.category === 'legal' ? 'text-purple-600' :
                              skill.category === 'soft_skill' ? 'text-blue-600' :
                              skill.category === 'language' ? 'text-amber-600' :
                              'text-slate-500'
                            }`}>
                              {skill.category === 'legal' ? 'قانونية' :
                               skill.category === 'soft_skill' ? 'مهارات شخصية' :
                               skill.category === 'language' ? 'لغات' :
                               'برامج'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Salary Section */}
        {hasField('salary') && (
          <Collapsible open={isSalaryOpen} onOpenChange={setIsSalaryOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      الراتب والبدلات
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSalaryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">إظهار نطاق الراتب</p>
                      <p className="text-sm text-slate-500">عرض نطاق الراتب في إعلان الوظيفة</p>
                    </div>
                    <Switch
                      checked={showSalary}
                      onCheckedChange={setShowSalary}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">الحد الأدنى (ر.س)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min={0}
                        value={salaryMin || ''}
                        onChange={(e) => setSalaryMin(parseInt(e.target.value) || undefined)}
                        placeholder="8000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">الحد الأقصى (ر.س)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min={0}
                        value={salaryMax || ''}
                        onChange={(e) => setSalaryMax(parseInt(e.target.value) || undefined)}
                        placeholder="15000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={salaryNegotiable}
                          onChange={(e) => setSalaryNegotiable(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">قابل للتفاوض</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="housingAllowance">بدل السكن (ر.س)</Label>
                      <Input
                        id="housingAllowance"
                        type="number"
                        min={0}
                        value={housingAllowance || ''}
                        onChange={(e) => setHousingAllowance(parseInt(e.target.value) || undefined)}
                        placeholder="اختياري"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transportAllowance">بدل النقل (ر.س)</Label>
                      <Input
                        id="transportAllowance"
                        type="number"
                        min={0}
                        value={transportAllowance || ''}
                        onChange={(e) => setTransportAllowance(parseInt(e.target.value) || undefined)}
                        placeholder="اختياري"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Benefits Section */}
        {hasField('benefits') && (
          <Collapsible open={isBenefitsOpen} onOpenChange={setIsBenefitsOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      المزايا والإجازات
                      {benefits.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {benefits.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isBenefitsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Leave */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualLeave">الإجازة السنوية (أيام)</Label>
                      <Input
                        id="annualLeave"
                        type="number"
                        min={21}
                        value={annualLeave}
                        onChange={(e) => setAnnualLeave(parseInt(e.target.value) || 21)}
                        className="rounded-xl"
                      />
                      <p className="text-xs text-slate-500">الحد الأدنى حسب نظام العمل: 21 يوم</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-navy">إجازة الحج</p>
                        <p className="text-sm text-slate-500">15 يوم مرة واحدة خلال الخدمة</p>
                      </div>
                      <Switch
                        checked={hajjLeave}
                        onCheckedChange={setHajjLeave}
                      />
                    </div>
                  </div>

                  {/* Benefits List */}
                  {benefits.length > 0 && (
                    <div className="space-y-2">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-navy">{benefit.benefit}</span>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                              {benefit.category === 'health' ? 'صحي' :
                               benefit.category === 'insurance' ? 'تأمين' :
                               benefit.category === 'leave' ? 'إجازات' :
                               benefit.category === 'financial' ? 'مالي' :
                               benefit.category === 'work_life' ? 'توازن' : 'أخرى'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBenefit(index)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Benefit */}
                  <div className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="أضف ميزة جديدة..."
                      className="rounded-xl"
                    />
                    <Select value={newBenefitCategory} onValueChange={setNewBenefitCategory}>
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health">صحي</SelectItem>
                        <SelectItem value="insurance">تأمين</SelectItem>
                        <SelectItem value="leave">إجازات</SelectItem>
                        <SelectItem value="financial">مالي</SelectItem>
                        <SelectItem value="work_life">توازن</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={addBenefit}
                      disabled={!newBenefit}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Hiring Process Section */}
        {hasField('hiringProcess') && (
          <Collapsible open={isHiringProcessOpen} onOpenChange={setIsHiringProcessOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      مراحل التوظيف
                      {hiringStages.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {hiringStages.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isHiringProcessOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  {hiringStages.map((stage, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <Input
                        value={stage.stageName}
                        onChange={(e) => updateHiringStage(index, 'stageName', e.target.value)}
                        placeholder="اسم المرحلة"
                        className="rounded-xl flex-1"
                      />
                      <Select
                        value={stage.stageType}
                        onValueChange={(v) => updateHiringStage(index, 'stageType', v)}
                      >
                        <SelectTrigger className="w-40 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="screening">فرز</SelectItem>
                          <SelectItem value="phone_screening">مكالمة هاتفية</SelectItem>
                          <SelectItem value="interview">مقابلة</SelectItem>
                          <SelectItem value="assessment">اختبار</SelectItem>
                          <SelectItem value="background_check">فحص الخلفية</SelectItem>
                          <SelectItem value="offer">عرض وظيفي</SelectItem>
                        </SelectContent>
                      </Select>
                      {hiringStages.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHiringStage(index)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addHiringStage}
                    className="rounded-xl w-full"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مرحلة
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Attorney Requirements Section */}
        {hasField('attorneyRequirements') && (
          <Collapsible open={isAttorneyReqOpen} onOpenChange={setIsAttorneyReqOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      متطلبات المحامين
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isAttorneyReqOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">ترخيص مزاولة المهنة</p>
                      <p className="text-sm text-slate-500">يجب أن يكون المتقدم محامي مرخص</p>
                    </div>
                    <Switch
                      checked={barAdmissionRequired}
                      onCheckedChange={setBarAdmissionRequired}
                    />
                  </div>

                  {barAdmissionRequired && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jurisdiction">جهة الترخيص</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر جهة الترخيص" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saudi_bar">الهيئة السعودية للمحامين</SelectItem>
                            <SelectItem value="moj">وزارة العدل</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm text-purple-700">
                          <Info className="w-4 h-4 inline ml-1" />
                          سيتم التحقق من ترخيص المحامي من الهيئة السعودية للمحامين
                        </p>
                      </div>
                    </div>
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
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1">نظام العمل السعودي - التوظيف</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• المادة 26: يجب أن يكون عقد العمل مكتوباً ومحدداً للأجر ونوع العمل</li>
                  <li>• المادة 53: فترة التجربة لا تتجاوز 90 يوماً قابلة للتمديد حتى 180 يوماً</li>
                  <li>• المادة 109: الإجازة السنوية لا تقل عن 21 يوماً وتزيد إلى 30 يوماً بعد 5 سنوات</li>
                  <li>• نظام العمل يتطلب الالتزام بنسب السعودة حسب حجم المنشأة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard/hr/recruitment/jobs' })}
            className="rounded-xl"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!jobTitle || !jobTitleAr || !department || !location || !jobSummary || createMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
          >
            {createMutation.isPending ? (
              <>جاري الإنشاء...</>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 ml-2" />
                إنشاء الوظيفة
              </>
            )}
          </Button>
        </div>
      </Main>
    </>
  )
}
