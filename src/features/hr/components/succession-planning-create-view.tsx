import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateSuccessionPlan, useUpdateSuccessionPlan, useSuccessionPlan } from '@/hooks/useSuccessionPlanning'
import { useJobPositions } from '@/hooks/useJobPositions'
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
  ChevronDown, Users, Briefcase, Calendar, Target,
  AlertTriangle, Shield, TrendingUp, UserCheck, Clock,
  BookOpen, Lightbulb, FileText, MessageSquare, Award, BarChart3
} from 'lucide-react'
import {
  positionCriticalityLabels,
  riskLevelLabels,
  planStatusLabels,
  planTypeLabels,
  planScopeLabels,
  reviewCycleLabels,
  readinessLevelLabels,
  performanceRatingLabels,
  potentialRatingLabels,
  retentionRiskLabels,
  transferStatusLabels,
  benchStrengthScoreLabels,
  partnerTrackLabels,
  PositionCriticality,
  RiskLevel,
  PlanStatus,
  PlanType,
  PlanScope,
  ReviewCycle,
  ReadinessLevel,
  PerformanceRating,
  PotentialRating,
  RetentionRisk,
  TransferStatus,
  BenchStrengthScore,
  PartnerTrack,
  type CreateSuccessionPlanInput,
  type Successor,
} from '@/services/successionPlanningService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function SuccessionPlanningCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingPlan, isLoading: isLoadingPlan } = useSuccessionPlan(editId || '')
  const createMutation = useCreateSuccessionPlan()
  const updateMutation = useUpdateSuccessionPlan()

  // Fetch positions and employees for selection
  const { data: positionsData } = useJobPositions({ status: 'active' })
  const { data: employeesData } = useEmployees({})

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Basic Fields
  const [positionId, setPositionId] = useState('')
  const [positionTitle, setPositionTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [incumbentId, setIncumbentId] = useState('')
  const [incumbentName, setIncumbentName] = useState('')
  const [positionCriticality, setPositionCriticality] = useState<PositionCriticality>(PositionCriticality.MEDIUM)
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.MEDIUM)
  const [planStatus, setPlanStatus] = useState<PlanStatus>(PlanStatus.DRAFT)
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])
  const [reviewDate, setReviewDate] = useState('')
  const [nextReviewDate, setNextReviewDate] = useState('')

  // Plan Details
  const [planName, setPlanName] = useState('')
  const [planType, setPlanType] = useState<PlanType>(PlanType.INDIVIDUAL)
  const [planScope, setPlanScope] = useState<PlanScope>(PlanScope.SINGLE_POSITION)
  const [targetTimeline, setTargetTimeline] = useState('')
  const [reviewCycle, setReviewCycle] = useState<ReviewCycle>(ReviewCycle.ANNUAL)
  const [strategicAlignment, setStrategicAlignment] = useState('')

  // Critical Position Assessment
  const [strategicImportance, setStrategicImportance] = useState<number>(5)
  const [uniqueExpertise, setUniqueExpertise] = useState<number>(5)
  const [clientRelationships, setClientRelationships] = useState<number>(5)
  const [revenueImpact, setRevenueImpact] = useState<number>(5)
  const [criticalityJustification, setCriticalityJustification] = useState('')

  // Incumbent Details
  const [incumbentRetirementEligible, setIncumbentRetirementEligible] = useState(false)
  const [incumbentRetirementDate, setIncumbentRetirementDate] = useState('')
  const [incumbentPerformance, setIncumbentPerformance] = useState<PerformanceRating>(PerformanceRating.MEETS)
  const [incumbentPotential, setIncumbentPotential] = useState<PotentialRating>(PotentialRating.MEDIUM)
  const [incumbentRetentionRisk, setIncumbentRetentionRisk] = useState<RetentionRisk>(RetentionRisk.LOW)
  const [yearsInRole, setYearsInRole] = useState<number>(0)

  // Successors (simplified for initial entry)
  const [successors, setSuccessors] = useState<Partial<Successor>[]>([])

  // Bench Strength
  const [benchReadyNow, setBenchReadyNow] = useState<number>(0)
  const [benchReady1To2, setBenchReady1To2] = useState<number>(0)
  const [benchReady3To5, setBenchReady3To5] = useState<number>(0)
  const [benchStrengthScore, setBenchStrengthScore] = useState<BenchStrengthScore>(BenchStrengthScore.ADEQUATE)

  // Knowledge Transfer
  const [knowledgeTransferStatus, setKnowledgeTransferStatus] = useState<TransferStatus>(TransferStatus.NOT_STARTED)
  const [knowledgeDocumentationPercent, setKnowledgeDocumentationPercent] = useState<number>(0)

  // Emergency Succession
  const [interimSuccessorId, setInterimSuccessorId] = useState('')
  const [interimSuccessorName, setInterimSuccessorName] = useState('')
  const [interimReadiness, setInterimReadiness] = useState<ReadinessLevel>(ReadinessLevel.NOT_READY)
  const [emergencyPlanDocumented, setEmergencyPlanDocumented] = useState(false)

  // Law Firm Succession
  const [partnerTrack, setPartnerTrack] = useState<PartnerTrack>(PartnerTrack.EQUITY)
  const [bookOfBusinessValue, setBookOfBusinessValue] = useState<number>(0)
  const [clientsToTransition, setClientsToTransition] = useState<number>(0)
  const [primaryPracticeArea, setPrimaryPracticeArea] = useState('')

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

  // Handle position selection
  const handlePositionSelect = (posId: string) => {
    setPositionId(posId)
    const position = positionsData?.data?.find((p: any) => p._id === posId)
    if (position) {
      setPositionTitle(position.jobTitleAr || position.jobTitle)
      setDepartmentId(position.departmentId || '')
      setDepartmentName(position.departmentNameAr || position.departmentName || '')
    }
  }

  // Handle incumbent selection
  const handleIncumbentSelect = (empId: string) => {
    setIncumbentId(empId)
    const employee = employeesData?.data?.find((e: any) => e._id === empId)
    if (employee) {
      setIncumbentName(`${employee.firstNameAr || employee.firstName} ${employee.lastNameAr || employee.lastName}`)
    }
  }

  // Add a new successor slot
  const addSuccessor = () => {
    setSuccessors([...successors, {
      name: '',
      currentPosition: '',
      readinessLevel: ReadinessLevel.NOT_READY,
      successorRanking: successors.length + 1,
      isPrimarySuccessor: successors.length === 0,
    }])
  }

  // Remove a successor
  const removeSuccessor = (index: number) => {
    setSuccessors(successors.filter((_, i) => i !== index))
  }

  // Update successor field
  const updateSuccessor = (index: number, field: keyof Successor, value: any) => {
    const updated = [...successors]
    updated[index] = { ...updated[index], [field]: value }
    setSuccessors(updated)
  }

  // Populate form when editing
  useEffect(() => {
    if (existingPlan && isEditMode) {
      setPositionId(existingPlan.positionId || '')
      setPositionTitle(existingPlan.positionTitle || '')
      setDepartmentId(existingPlan.departmentId || '')
      setDepartmentName(existingPlan.departmentName || '')
      setIncumbentId(existingPlan.incumbentId || '')
      setIncumbentName(existingPlan.incumbentName || '')
      setPositionCriticality(existingPlan.positionCriticality)
      setRiskLevel(existingPlan.riskLevel)
      setPlanStatus(existingPlan.planStatus)
      setEffectiveDate(existingPlan.effectiveDate?.split('T')[0] || '')
      setReviewDate(existingPlan.reviewDate?.split('T')[0] || '')
      setNextReviewDate(existingPlan.nextReviewDate?.split('T')[0] || '')

      if (existingPlan.planDetails) {
        setPlanName(existingPlan.planDetails.planName || '')
        setPlanType(existingPlan.planDetails.planType || PlanType.INDIVIDUAL)
        setPlanScope(existingPlan.planDetails.planScope || PlanScope.SINGLE_POSITION)
        setTargetTimeline(existingPlan.planDetails.targetTimeline || '')
        setReviewCycle(existingPlan.planDetails.reviewCycle || ReviewCycle.ANNUAL)
        setStrategicAlignment(existingPlan.planDetails.strategicAlignment || '')
      }

      if (existingPlan.criticalPosition?.criticalityAssessment) {
        setStrategicImportance(existingPlan.criticalPosition.criticalityAssessment.strategicImportance || 5)
        setUniqueExpertise(existingPlan.criticalPosition.criticalityAssessment.uniqueExpertise || 5)
        setClientRelationships(existingPlan.criticalPosition.criticalityAssessment.clientRelationships || 5)
        setRevenueImpact(existingPlan.criticalPosition.criticalityAssessment.revenueImpact || 5)
        setCriticalityJustification(existingPlan.criticalPosition.criticalityAssessment.criticalityJustification || '')
      }

      if (existingPlan.incumbent) {
        if (existingPlan.incumbent.retirementEligibility) {
          setIncumbentRetirementEligible(existingPlan.incumbent.retirementEligibility.isEligible || false)
          setIncumbentRetirementDate(existingPlan.incumbent.retirementEligibility.eligibilityDate?.split('T')[0] || '')
        }
        setIncumbentPerformance(existingPlan.incumbent.currentPerformance || PerformanceRating.MEETS)
        setIncumbentPotential(existingPlan.incumbent.currentPotential || PotentialRating.MEDIUM)
        setIncumbentRetentionRisk(existingPlan.incumbent.retentionRisk || RetentionRisk.LOW)
        setYearsInRole(existingPlan.incumbent.yearsInRole || 0)
      }

      if (existingPlan.successors) {
        setSuccessors(existingPlan.successors)
      }

      if (existingPlan.benchStrength) {
        setBenchReadyNow(existingPlan.benchStrength.readyNowCount || 0)
        setBenchReady1To2(existingPlan.benchStrength.readyIn1To2Years || 0)
        setBenchReady3To5(existingPlan.benchStrength.readyIn3To5Years || 0)
        setBenchStrengthScore(existingPlan.benchStrength.benchStrengthScore || BenchStrengthScore.ADEQUATE)
      }

      if (existingPlan.knowledgeTransfer) {
        setKnowledgeTransferStatus(existingPlan.knowledgeTransfer.transferStatus || TransferStatus.NOT_STARTED)
        if (existingPlan.knowledgeTransfer.knowledgeDocumentation) {
          setKnowledgeDocumentationPercent(existingPlan.knowledgeTransfer.knowledgeDocumentation.processDocumented || 0)
        }
      }

      if (existingPlan.emergencySuccession) {
        setInterimSuccessorId(existingPlan.emergencySuccession.interimSuccessorId || '')
        setInterimSuccessorName(existingPlan.emergencySuccession.interimSuccessorName || '')
        setInterimReadiness(existingPlan.emergencySuccession.interimReadiness || ReadinessLevel.NOT_READY)
        setEmergencyPlanDocumented(existingPlan.emergencySuccession.emergencyPlan?.planDocumented || false)
      }

      if (existingPlan.lawFirmSuccession?.partnerSuccession) {
        setPartnerTrack(existingPlan.lawFirmSuccession.partnerSuccession.partnerTrack || PartnerTrack.EQUITY)
      }
      if (existingPlan.lawFirmSuccession?.bookOfBusinessTransition) {
        setBookOfBusinessValue(existingPlan.lawFirmSuccession.bookOfBusinessTransition.totalBookValue || 0)
        setClientsToTransition(existingPlan.lawFirmSuccession.bookOfBusinessTransition.clientsToTransition || 0)
      }
      if (existingPlan.lawFirmSuccession?.practiceAreaContinuity) {
        setPrimaryPracticeArea(existingPlan.lawFirmSuccession.practiceAreaContinuity.primaryPracticeArea || '')
      }

      if (existingPlan.notes && existingPlan.notes.length > 0) {
        setNotes(existingPlan.notes[0].content || '')
      }
    }
  }, [existingPlan, isEditMode])

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateSuccessionPlanInput = {
      positionId,
      positionTitle,
      incumbentId,
      incumbentName,
      positionCriticality,
      riskLevel,
      planStatus,
      effectiveDate,
      officeId: 'default', // TODO: Get from context
      departmentId: departmentId || undefined,
      departmentName: departmentName || undefined,
      reviewDate: reviewDate || undefined,
      nextReviewDate: nextReviewDate || undefined,

      planDetails: {
        planName: planName || `خطة تعاقب - ${positionTitle}`,
        planType,
        planScope,
        targetTimeline: targetTimeline || undefined,
        reviewCycle,
        strategicAlignment: strategicAlignment || undefined,
      },

      criticalPosition: {
        criticalityAssessment: {
          strategicImportance,
          uniqueExpertise,
          clientRelationships,
          revenueImpact,
          operationalCriticality: 5,
          overallCriticalityScore: Math.round((strategicImportance + uniqueExpertise + clientRelationships + revenueImpact) / 4),
          criticalityJustification: criticalityJustification || undefined,
        },
      },

      incumbent: {
        retirementEligibility: {
          isEligible: incumbentRetirementEligible,
          eligibilityDate: incumbentRetirementDate || undefined,
          planningToRetire: false,
        },
        currentPerformance: incumbentPerformance,
        currentPotential: incumbentPotential,
        retentionRisk: incumbentRetentionRisk,
        yearsInRole,
      },

      successors: successors.filter(s => s.name).map((s, idx) => ({
        successorId: s.successorId || `temp-${idx}`,
        name: s.name || '',
        currentPosition: s.currentPosition || '',
        readinessLevel: s.readinessLevel || ReadinessLevel.NOT_READY,
        successorRanking: s.successorRanking || idx + 1,
        isPrimarySuccessor: s.isPrimarySuccessor || idx === 0,
      })) as Successor[],

      benchStrength: {
        readyNowCount: benchReadyNow,
        readyIn1To2Years: benchReady1To2,
        readyIn3To5Years: benchReady3To5,
        benchStrengthScore,
        internalVsExternal: {
          internalCandidates: successors.length,
          externalPipelineActive: false,
        },
      },

      knowledgeTransfer: {
        knowledgeDocumentation: {
          processDocumented: knowledgeDocumentationPercent,
          proceduresDocumented: 0,
          clientKnowledgeDocumented: 0,
          systemsDocumented: 0,
        },
        transferStatus: knowledgeTransferStatus,
      },

      emergencySuccession: {
        interimSuccessorId: interimSuccessorId || undefined,
        interimSuccessorName: interimSuccessorName || undefined,
        interimReadiness,
        emergencyPlan: {
          planDocumented: emergencyPlanDocumented,
          triggerConditions: [],
          immediateActions: [],
        },
      },

      lawFirmSuccession: {
        partnerSuccession: {
          partnerTrack,
          partnershipTenure: yearsInRole,
        },
        bookOfBusinessTransition: {
          totalBookValue: bookOfBusinessValue,
          clientsToTransition,
          revenueAtRisk: bookOfBusinessValue * 0.2,
        },
        practiceAreaContinuity: {
          primaryPracticeArea,
        },
      },

      notes: notes ? [{
        noteId: 'note-1',
        content: notes,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user',
        isPrivate: false,
      }] : undefined,
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        id: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/succession-planning' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تخطيط التعاقب', href: '/dashboard/hr/succession-planning', isActive: true },
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
          title={isEditMode ? 'تعديل خطة التعاقب' : 'إنشاء خطة تعاقب'}
          type="succession-planning"
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
                onClick={() => navigate({ to: '/dashboard/hr/succession-planning' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل خطة التعاقب' : 'إنشاء خطة تعاقب جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات الخطة' : 'إضافة خطة تعاقب جديدة للمنصب'}
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

            {/* POSITION & INCUMBENT */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  المنصب والشاغل الحالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      المنصب <span className="text-red-500">*</span>
                    </Label>
                    <Select value={positionId} onValueChange={handlePositionSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر المنصب" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionsData?.data?.map((position: any) => (
                          <SelectItem key={position._id} value={position._id}>
                            {position.jobTitleAr || position.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الشاغل الحالي <span className="text-red-500">*</span>
                    </Label>
                    <Select value={incumbentId} onValueChange={handleIncumbentSelect}>
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
                </div>
                {positionTitle && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600">
                      <strong>المنصب:</strong> {positionTitle}
                      {departmentName && <span className="mr-4"><strong>القسم:</strong> {departmentName}</span>}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CRITICALITY & RISK */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  تقييم الأهمية والمخاطر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      أهمية المنصب <span className="text-red-500">*</span>
                    </Label>
                    <Select value={positionCriticality} onValueChange={(v) => setPositionCriticality(v as PositionCriticality)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(positionCriticalityLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      مستوى المخاطر <span className="text-red-500">*</span>
                    </Label>
                    <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as RiskLevel)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(riskLevelLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      حالة الخطة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={planStatus} onValueChange={(v) => setPlanStatus(v as PlanStatus)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(planStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PLAN DETAILS */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  تفاصيل الخطة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">اسم الخطة</Label>
                    <Input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="مثال: خطة تعاقب مدير القانونية"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع الخطة</Label>
                    <Select value={planType} onValueChange={(v) => setPlanType(v as PlanType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(planTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نطاق الخطة</Label>
                    <Select value={planScope} onValueChange={(v) => setPlanScope(v as PlanScope)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(planScopeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">دورة المراجعة</Label>
                    <Select value={reviewCycle} onValueChange={(v) => setReviewCycle(v as ReviewCycle)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reviewCycleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الجدول الزمني المستهدف</Label>
                    <Input
                      value={targetTimeline}
                      onChange={(e) => setTargetTimeline(e.target.value)}
                      placeholder="مثال: 2-3 سنوات"
                      className="h-11 rounded-xl"
                    />
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

            {/* SUCCESSORS */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    الخلفاء المحتملون
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSuccessor}
                    className="rounded-xl"
                  >
                    <UserCheck className="w-4 h-4 ml-1" />
                    إضافة خليفة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {successors.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لم تتم إضافة خلفاء بعد</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSuccessor}
                      className="mt-4 rounded-xl"
                    >
                      إضافة خليفة محتمل
                    </Button>
                  </div>
                ) : (
                  successors.map((successor, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-slate-700">
                            {successor.isPrimarySuccessor ? 'الخليفة الأساسي' : `الخليفة ${index + 1}`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSuccessor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          حذف
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">الاسم</Label>
                          <Input
                            value={successor.name || ''}
                            onChange={(e) => updateSuccessor(index, 'name', e.target.value)}
                            placeholder="اسم الخليفة"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">المنصب الحالي</Label>
                          <Input
                            value={successor.currentPosition || ''}
                            onChange={(e) => updateSuccessor(index, 'currentPosition', e.target.value)}
                            placeholder="منصبه الحالي"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">مستوى الجاهزية</Label>
                          <Select
                            value={successor.readinessLevel || ReadinessLevel.NOT_READY}
                            onValueChange={(v) => updateSuccessor(index, 'readinessLevel', v)}
                          >
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(readinessLevelLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* INCUMBENT DETAILS - Advanced */}
            <Collapsible open={openSections.includes('incumbent')} onOpenChange={() => toggleSection('incumbent')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-500" />
                        تفاصيل الشاغل الحالي
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('incumbent') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">سنوات في المنصب</Label>
                        <Input
                          type="number"
                          value={yearsInRole}
                          onChange={(e) => setYearsInRole(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">مستوى الأداء</Label>
                        <Select value={incumbentPerformance} onValueChange={(v) => setIncumbentPerformance(v as PerformanceRating)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(performanceRatingLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الإمكانات</Label>
                        <Select value={incumbentPotential} onValueChange={(v) => setIncumbentPotential(v as PotentialRating)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(potentialRatingLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">مخاطر الاستبقاء</Label>
                        <Select value={incumbentRetentionRisk} onValueChange={(v) => setIncumbentRetentionRisk(v as RetentionRisk)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(retentionRiskLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">مؤهل للتقاعد</span>
                        <Switch checked={incumbentRetirementEligible} onCheckedChange={setIncumbentRetirementEligible} />
                      </div>
                    </div>
                    {incumbentRetirementEligible && (
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">تاريخ أهلية التقاعد</Label>
                        <Input
                          type="date"
                          value={incumbentRetirementDate}
                          onChange={(e) => setIncumbentRetirementDate(e.target.value)}
                          className="h-11 rounded-xl max-w-xs"
                        />
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* CRITICALITY ASSESSMENT - Advanced */}
            <Collapsible open={openSections.includes('criticality')} onOpenChange={() => toggleSection('criticality')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-red-500" />
                        تقييم الأهمية التفصيلي
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('criticality') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الأهمية الاستراتيجية (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={strategicImportance}
                          onChange={(e) => setStrategicImportance(parseInt(e.target.value) || 5)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الخبرة الفريدة (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={uniqueExpertise}
                          onChange={(e) => setUniqueExpertise(parseInt(e.target.value) || 5)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">علاقات العملاء (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={clientRelationships}
                          onChange={(e) => setClientRelationships(parseInt(e.target.value) || 5)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">تأثير الإيرادات (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={revenueImpact}
                          onChange={(e) => setRevenueImpact(parseInt(e.target.value) || 5)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">مبررات الأهمية</Label>
                      <Textarea
                        value={criticalityJustification}
                        onChange={(e) => setCriticalityJustification(e.target.value)}
                        placeholder="اشرح لماذا هذا المنصب حرج..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* BENCH STRENGTH - Advanced */}
            <Collapsible open={openSections.includes('bench')} onOpenChange={() => toggleSection('bench')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        قوة البدلاء
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('bench') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">جاهزون الآن</Label>
                        <Input
                          type="number"
                          value={benchReadyNow}
                          onChange={(e) => setBenchReadyNow(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">جاهزون خلال 1-2 سنة</Label>
                        <Input
                          type="number"
                          value={benchReady1To2}
                          onChange={(e) => setBenchReady1To2(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">جاهزون خلال 3-5 سنوات</Label>
                        <Input
                          type="number"
                          value={benchReady3To5}
                          onChange={(e) => setBenchReady3To5(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">تقييم القوة</Label>
                        <Select value={benchStrengthScore} onValueChange={(v) => setBenchStrengthScore(v as BenchStrengthScore)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(benchStrengthScoreLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* KNOWLEDGE TRANSFER - Advanced */}
            <Collapsible open={openSections.includes('knowledge')} onOpenChange={() => toggleSection('knowledge')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-500" />
                        نقل المعرفة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('knowledge') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">حالة النقل</Label>
                        <Select value={knowledgeTransferStatus} onValueChange={(v) => setKnowledgeTransferStatus(v as TransferStatus)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(transferStatusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">نسبة التوثيق (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={knowledgeDocumentationPercent}
                          onChange={(e) => setKnowledgeDocumentationPercent(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* EMERGENCY SUCCESSION - Advanced */}
            <Collapsible open={openSections.includes('emergency')} onOpenChange={() => toggleSection('emergency')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        خطة الطوارئ
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('emergency') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الخليفة المؤقت</Label>
                        <Input
                          value={interimSuccessorName}
                          onChange={(e) => setInterimSuccessorName(e.target.value)}
                          placeholder="اسم الخليفة المؤقت"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">جاهزية الخليفة المؤقت</Label>
                        <Select value={interimReadiness} onValueChange={(v) => setInterimReadiness(v as ReadinessLevel)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(readinessLevelLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-700">خطة الطوارئ موثقة</span>
                      <Switch checked={emergencyPlanDocumented} onCheckedChange={setEmergencyPlanDocumented} />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* LAW FIRM SUCCESSION - Advanced */}
            <Collapsible open={openSections.includes('lawFirm')} onOpenChange={() => toggleSection('lawFirm')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        تعاقب مكتب المحاماة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('lawFirm') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">مسار الشراكة</Label>
                        <Select value={partnerTrack} onValueChange={(v) => setPartnerTrack(v as PartnerTrack)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(partnerTrackLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">قيمة محفظة العملاء (ر.س)</Label>
                        <Input
                          type="number"
                          value={bookOfBusinessValue}
                          onChange={(e) => setBookOfBusinessValue(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">عدد العملاء للنقل</Label>
                        <Input
                          type="number"
                          value={clientsToTransition}
                          onChange={(e) => setClientsToTransition(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">مجال الممارسة الرئيسي</Label>
                      <Input
                        value={primaryPracticeArea}
                        onChange={(e) => setPrimaryPracticeArea(e.target.value)}
                        placeholder="مثال: القانون التجاري"
                        className="h-11 rounded-xl"
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
                        placeholder="أي ملاحظات إضافية حول خطة التعاقب..."
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
                onClick={() => navigate({ to: '/dashboard/hr/succession-planning' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!positionId || !incumbentId || !effectiveDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء الخطة'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="succession-planning" />
        </div>
      </Main>
    </>
  )
}
