import api from './api'

// ==================== ENUMS ====================

export enum PositionCriticality {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RiskLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum PlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum PlanType {
  INDIVIDUAL = 'individual',
  DEPARTMENT = 'department',
  ORGANIZATION_WIDE = 'organization_wide',
  EMERGENCY = 'emergency'
}

export enum PlanScope {
  SINGLE_POSITION = 'single_position',
  MULTIPLE_POSITIONS = 'multiple_positions',
  LEADERSHIP_TIER = 'leadership_tier',
  CRITICAL_ROLES = 'critical_roles'
}

export enum ReviewCycle {
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  BIENNIAL = 'biennial'
}

export enum ReadinessLevel {
  READY_NOW = 'ready_now',
  READY_1_YEAR = 'ready_1_year',
  READY_2_YEARS = 'ready_2_years',
  READY_3_PLUS_YEARS = 'ready_3_plus_years',
  NOT_READY = 'not_ready'
}

export enum PerformanceRating {
  EXCEPTIONAL = 'exceptional',
  EXCEEDS = 'exceeds',
  MEETS = 'meets',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  UNSATISFACTORY = 'unsatisfactory'
}

export enum PotentialRating {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown'
}

export enum RetentionRisk {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUIRED = 'revision_required'
}

export enum TransferStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

export enum BenchStrengthScore {
  STRONG = 'strong',
  ADEQUATE = 'adequate',
  WEAK = 'weak',
  CRITICAL = 'critical'
}

export enum PartnerTrack {
  EQUITY = 'equity',
  NON_EQUITY = 'non_equity',
  COUNSEL = 'counsel',
  OF_COUNSEL = 'of_counsel'
}

// ==================== LABELS ====================

export const positionCriticalityLabels: Record<PositionCriticality, { ar: string; en: string }> = {
  [PositionCriticality.CRITICAL]: { ar: 'حرج', en: 'Critical' },
  [PositionCriticality.HIGH]: { ar: 'عالي', en: 'High' },
  [PositionCriticality.MEDIUM]: { ar: 'متوسط', en: 'Medium' },
  [PositionCriticality.LOW]: { ar: 'منخفض', en: 'Low' }
}

export const riskLevelLabels: Record<RiskLevel, { ar: string; en: string }> = {
  [RiskLevel.HIGH]: { ar: 'عالي', en: 'High' },
  [RiskLevel.MEDIUM]: { ar: 'متوسط', en: 'Medium' },
  [RiskLevel.LOW]: { ar: 'منخفض', en: 'Low' }
}

export const planStatusLabels: Record<PlanStatus, { ar: string; en: string }> = {
  [PlanStatus.DRAFT]: { ar: 'مسودة', en: 'Draft' },
  [PlanStatus.ACTIVE]: { ar: 'نشط', en: 'Active' },
  [PlanStatus.UNDER_REVIEW]: { ar: 'قيد المراجعة', en: 'Under Review' },
  [PlanStatus.APPROVED]: { ar: 'معتمد', en: 'Approved' },
  [PlanStatus.ON_HOLD]: { ar: 'معلق', en: 'On Hold' },
  [PlanStatus.COMPLETED]: { ar: 'مكتمل', en: 'Completed' },
  [PlanStatus.ARCHIVED]: { ar: 'مؤرشف', en: 'Archived' }
}

export const planTypeLabels: Record<PlanType, { ar: string; en: string }> = {
  [PlanType.INDIVIDUAL]: { ar: 'فردي', en: 'Individual' },
  [PlanType.DEPARTMENT]: { ar: 'قسم', en: 'Department' },
  [PlanType.ORGANIZATION_WIDE]: { ar: 'على مستوى المنظمة', en: 'Organization-Wide' },
  [PlanType.EMERGENCY]: { ar: 'طوارئ', en: 'Emergency' }
}

export const planScopeLabels: Record<PlanScope, { ar: string; en: string }> = {
  [PlanScope.SINGLE_POSITION]: { ar: 'منصب واحد', en: 'Single Position' },
  [PlanScope.MULTIPLE_POSITIONS]: { ar: 'مناصب متعددة', en: 'Multiple Positions' },
  [PlanScope.LEADERSHIP_TIER]: { ar: 'طبقة القيادة', en: 'Leadership Tier' },
  [PlanScope.CRITICAL_ROLES]: { ar: 'الأدوار الحرجة', en: 'Critical Roles' }
}

export const reviewCycleLabels: Record<ReviewCycle, { ar: string; en: string }> = {
  [ReviewCycle.QUARTERLY]: { ar: 'ربع سنوي', en: 'Quarterly' },
  [ReviewCycle.SEMI_ANNUAL]: { ar: 'نصف سنوي', en: 'Semi-Annual' },
  [ReviewCycle.ANNUAL]: { ar: 'سنوي', en: 'Annual' },
  [ReviewCycle.BIENNIAL]: { ar: 'كل سنتين', en: 'Biennial' }
}

export const readinessLevelLabels: Record<ReadinessLevel, { ar: string; en: string }> = {
  [ReadinessLevel.READY_NOW]: { ar: 'جاهز الآن', en: 'Ready Now' },
  [ReadinessLevel.READY_1_YEAR]: { ar: 'جاهز خلال سنة', en: 'Ready in 1 Year' },
  [ReadinessLevel.READY_2_YEARS]: { ar: 'جاهز خلال سنتين', en: 'Ready in 2 Years' },
  [ReadinessLevel.READY_3_PLUS_YEARS]: { ar: 'جاهز خلال 3+ سنوات', en: 'Ready in 3+ Years' },
  [ReadinessLevel.NOT_READY]: { ar: 'غير جاهز', en: 'Not Ready' }
}

export const performanceRatingLabels: Record<PerformanceRating, { ar: string; en: string }> = {
  [PerformanceRating.EXCEPTIONAL]: { ar: 'استثنائي', en: 'Exceptional' },
  [PerformanceRating.EXCEEDS]: { ar: 'يتجاوز التوقعات', en: 'Exceeds Expectations' },
  [PerformanceRating.MEETS]: { ar: 'يلبي التوقعات', en: 'Meets Expectations' },
  [PerformanceRating.NEEDS_IMPROVEMENT]: { ar: 'يحتاج تحسين', en: 'Needs Improvement' },
  [PerformanceRating.UNSATISFACTORY]: { ar: 'غير مرضي', en: 'Unsatisfactory' }
}

export const potentialRatingLabels: Record<PotentialRating, { ar: string; en: string }> = {
  [PotentialRating.HIGH]: { ar: 'عالي', en: 'High' },
  [PotentialRating.MEDIUM]: { ar: 'متوسط', en: 'Medium' },
  [PotentialRating.LOW]: { ar: 'منخفض', en: 'Low' },
  [PotentialRating.UNKNOWN]: { ar: 'غير معروف', en: 'Unknown' }
}

export const retentionRiskLabels: Record<RetentionRisk, { ar: string; en: string }> = {
  [RetentionRisk.HIGH]: { ar: 'عالي', en: 'High' },
  [RetentionRisk.MEDIUM]: { ar: 'متوسط', en: 'Medium' },
  [RetentionRisk.LOW]: { ar: 'منخفض', en: 'Low' }
}

export const approvalStatusLabels: Record<ApprovalStatus, { ar: string; en: string }> = {
  [ApprovalStatus.PENDING]: { ar: 'قيد الانتظار', en: 'Pending' },
  [ApprovalStatus.APPROVED]: { ar: 'معتمد', en: 'Approved' },
  [ApprovalStatus.REJECTED]: { ar: 'مرفوض', en: 'Rejected' },
  [ApprovalStatus.REVISION_REQUIRED]: { ar: 'يتطلب مراجعة', en: 'Revision Required' }
}

export const transferStatusLabels: Record<TransferStatus, { ar: string; en: string }> = {
  [TransferStatus.NOT_STARTED]: { ar: 'لم يبدأ', en: 'Not Started' },
  [TransferStatus.IN_PROGRESS]: { ar: 'قيد التنفيذ', en: 'In Progress' },
  [TransferStatus.COMPLETED]: { ar: 'مكتمل', en: 'Completed' },
  [TransferStatus.DELAYED]: { ar: 'متأخر', en: 'Delayed' }
}

export const benchStrengthScoreLabels: Record<BenchStrengthScore, { ar: string; en: string }> = {
  [BenchStrengthScore.STRONG]: { ar: 'قوي', en: 'Strong' },
  [BenchStrengthScore.ADEQUATE]: { ar: 'كافي', en: 'Adequate' },
  [BenchStrengthScore.WEAK]: { ar: 'ضعيف', en: 'Weak' },
  [BenchStrengthScore.CRITICAL]: { ar: 'حرج', en: 'Critical' }
}

export const partnerTrackLabels: Record<PartnerTrack, { ar: string; en: string }> = {
  [PartnerTrack.EQUITY]: { ar: 'شريك حصة', en: 'Equity Partner' },
  [PartnerTrack.NON_EQUITY]: { ar: 'شريك بدون حصة', en: 'Non-Equity Partner' },
  [PartnerTrack.COUNSEL]: { ar: 'مستشار', en: 'Counsel' },
  [PartnerTrack.OF_COUNSEL]: { ar: 'مستشار خارجي', en: 'Of Counsel' }
}

// ==================== INTERFACES ====================

export interface Successor {
  successorId: string
  name: string
  currentPosition: string
  currentDepartment?: string

  // Readiness Assessment
  readinessLevel: ReadinessLevel
  readyInMonths?: number
  overallReadinessScore?: number // 1-100
  readinessGaps?: string[]
  accelerators?: string[]

  // Ranking
  successorRanking: number
  isPrimarySuccessor: boolean

  // Qualifications Match
  qualificationsMatch?: {
    educationMatch: number // percentage
    experienceMatch: number
    skillsMatch: number
    certificationMatch: number
    overallMatch: number
  }

  // Performance & Potential
  performanceRating?: PerformanceRating
  potentialRating?: PotentialRating
  nineBoxPosition?: string // e.g., "High Performer / High Potential"

  // Development Plan
  developmentPlan?: {
    developmentGoals: string[]
    trainingRequired: string[]
    targetCompletionDate?: string
    progressPercentage: number
    developmentBudget?: number
    developmentStatus: 'not_started' | 'in_progress' | 'completed'
  }

  // Mentoring & Coaching
  mentoringCoaching?: {
    mentorAssigned: boolean
    mentorId?: string
    mentorName?: string
    coachingPlan?: string
    coachingSessions?: number
    lastSessionDate?: string
    feedbackProvided?: string
  }

  // Experience Building
  experienceBuilding?: {
    stretchAssignments: string[]
    projectLeadership: string[]
    crossFunctionalExposure: string[]
    clientExposure?: string[]
    leadershipOpportunities: string[]
  }
}

export interface CriticalPosition {
  // Criticality Assessment
  criticalityAssessment?: {
    strategicImportance: number // 1-10
    uniqueExpertise: number
    clientRelationships: number
    revenueImpact: number
    operationalCriticality: number
    overallCriticalityScore: number
    criticalityJustification?: string
  }

  // Impact of Vacancy
  impactOfVacancy?: {
    revenueAtRisk?: number
    clientsAtRisk?: number
    projectsImpacted?: string[]
    operationalImpact: 'severe' | 'high' | 'moderate' | 'low'
    reputationalRisk: 'high' | 'medium' | 'low'
    recoveryTimeMonths?: number
  }

  // Vacancy Risk
  vacancyRisk?: {
    retirementEligibilityDate?: string
    flightRisk: RiskLevel
    marketDemand: 'high' | 'medium' | 'low'
    replacementDifficulty: 'very_difficult' | 'difficult' | 'moderate' | 'easy'
    timeToFillMonths?: number
    recruitmentCostEstimate?: number
  }
}

export interface Incumbent {
  // Retirement Eligibility
  retirementEligibility?: {
    isEligible: boolean
    eligibilityDate?: string
    planningToRetire: boolean
    expectedRetirementDate?: string
    yearsToRetirement?: number
    retirementNoticeProvided?: boolean
  }

  // Current Assessments
  currentPerformance?: PerformanceRating
  currentPotential?: PotentialRating
  retentionRisk?: RetentionRisk
  yearsInRole?: number
  tenureYears?: number

  // Critical Knowledge
  criticalKnowledge?: {
    institutionalKnowledge: string[]
    technicalExpertise: string[]
    processKnowledge: string[]
    clientKnowledge?: string[]
    regulatoryKnowledge?: string[]
    documentationStatus: 'fully_documented' | 'partially_documented' | 'not_documented'
  }

  // Key Relationships
  keyRelationships?: {
    internalStakeholders: string[]
    externalClients: string[]
    vendors?: string[]
    regulators?: string[]
    industryContacts?: string[]
    relationshipTransferPlan?: string
  }

  // Unique Skills
  uniqueSkills?: string[]
  specializations?: string[]
  certifications?: string[]
}

export interface BenchStrength {
  readyNowCount: number
  readyIn1To2Years: number
  readyIn3To5Years: number
  benchStrengthScore: BenchStrengthScore
  diversityInPipeline?: {
    genderDiversity: boolean
    generationalDiversity: boolean
    backgroundDiversity: boolean
  }
  internalVsExternal: {
    internalCandidates: number
    externalPipelineActive: boolean
    externalCandidatesIdentified?: number
  }
}

export interface TalentPool {
  internalCandidates?: {
    totalInPool: number
    highPotentials: number
    emergingLeaders: number
    readyNowPercentage: number
  }
  externalPipeline?: {
    activeSearch: boolean
    candidatesInPipeline: number
    recruitmentPartners?: string[]
    sourceChannels?: string[]
  }
  talentAcquisitionStrategy?: string
  successionPoolHealth: 'healthy' | 'adequate' | 'at_risk' | 'critical'
}

export interface KnowledgeTransfer {
  knowledgeDocumentation?: {
    processDocumented: number // percentage
    proceduresDocumented: number
    clientKnowledgeDocumented: number
    systemsDocumented: number
  }
  crossTraining?: {
    crossTrainingPlan: boolean
    employeesCrossTrained: number
    areasConverted: string[]
    completionPercentage: number
  }
  shadowingPrograms?: {
    shadowingActive: boolean
    participantsCount: number
    durationWeeks: number
    areasIncluded: string[]
  }
  knowledgeGaps?: string[]
  transferStatus: TransferStatus
  estimatedCompletionDate?: string
}

export interface EmergencySuccession {
  interimSuccessorId?: string
  interimSuccessorName?: string
  interimReadiness: ReadinessLevel
  emergencyPlan?: {
    planDocumented: boolean
    lastUpdated?: string
    triggerConditions: string[]
    immediateActions: string[]
    communicationPlan?: string
  }
  contingencyContacts?: {
    primaryContactId: string
    primaryContactName: string
    secondaryContactId?: string
    secondaryContactName?: string
    escalationPath?: string[]
  }
}

export interface LawFirmSuccession {
  // Partner Succession
  partnerSuccession?: {
    partnerTrack: PartnerTrack
    partnershipTenure: number
    equityPercentage?: number
    capitalContribution?: number
    buyoutProvisions?: string
    transitionTimeline?: string
  }

  // Book of Business Transition
  bookOfBusinessTransition?: {
    totalBookValue: number
    clientsToTransition: number
    revenueAtRisk: number
    transitionPlan?: string
    clientRetentionStrategy?: string
    billingRelationshipTransfer?: string
    keyClientMeetings?: {
      clientName: string
      meetingDate?: string
      attendees?: string[]
      outcome?: string
    }[]
  }

  // Practice Area Continuity
  practiceAreaContinuity?: {
    primaryPracticeArea: string
    secondaryPracticeAreas?: string[]
    practiceAreaLeadership?: string
    nichExpertise?: string[]
    marketPosition?: string
    successorPracticeExperience?: string
  }

  // Rainmaking Development
  rainmakingDevelopment?: {
    businessDevelopmentTraining: boolean
    clientPitchParticipation: number
    networkingOpportunities?: string[]
    industryEventParticipation?: string[]
    thoughtLeadershipActivities?: string[]
    referralNetworkIntroductions?: number
  }

  // Client Transition Plan
  clientTransitionPlan?: {
    transitionPhases: {
      phase: string
      startDate?: string
      endDate?: string
      activities: string[]
      status: 'planned' | 'in_progress' | 'completed'
    }[]
    clientCommunicationStrategy?: string
    relationshipHandoverPlan?: string
  }
}

export interface ActionPlan {
  shortTermActions?: {
    action: string
    responsible: string
    dueDate?: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue'
    priority: 'high' | 'medium' | 'low'
  }[]
  longTermActions?: {
    action: string
    responsible: string
    targetQuarter?: string
    status: 'planned' | 'in_progress' | 'completed'
    dependencies?: string[]
  }[]
  mitigationStrategies?: string[]
  resourceRequirements?: {
    budget?: number
    headcount?: number
    trainingInvestment?: number
    externalResources?: string[]
  }
}

export interface Metrics {
  successorRetentionRate?: number // percentage
  averageTimeToReadiness?: number // months
  planEffectivenessScore?: number // 1-100
  talentMobilityRate?: number // percentage
  internalPromotionRate?: number
  successfulTransitionsCount?: number
  developmentGoalsAchieved?: number // percentage
}

export interface ReviewApproval {
  reviewedBy?: string
  reviewerName?: string
  reviewedAt?: string
  reviewComments?: string

  approvedBy?: string
  approverName?: string
  approvedAt?: string
  approvalStatus: ApprovalStatus
  approvalComments?: string

  lastReviewDate?: string
  nextReviewDate?: string
  reviewHistory?: {
    reviewDate: string
    reviewerName: string
    comments?: string
    recommendedActions?: string[]
  }[]
}

export interface Communications {
  stakeholdersNotified?: {
    stakeholderId: string
    stakeholderName: string
    role: string
    notifiedDate?: string
    acknowledgedDate?: string
  }[]
  communicationPlan?: {
    audience: string
    frequency: string
    channels: string[]
    keyMessages?: string[]
  }
  lastCommunicationDate?: string
  nextCommunicationDate?: string
}

export interface SuccessionDocument {
  documentId: string
  name: string
  type: 'plan' | 'assessment' | 'development' | 'transition' | 'other'
  url?: string
  uploadedAt: string
  uploadedBy: string
}

export interface SuccessionNote {
  noteId: string
  content: string
  createdAt: string
  createdBy: string
  isPrivate: boolean
}

// ==================== MAIN INTERFACE ====================

export interface SuccessionPlan {
  // Identifiers
  successionPlanId: string
  planNumber: string

  // Position Information
  positionId: string
  positionTitle: string
  departmentId?: string
  departmentName?: string

  // Incumbent Information
  incumbentId: string
  incumbentName: string

  // Summary Counts
  successorsCount: number
  readyNowCount: number

  // Risk Assessment
  positionCriticality: PositionCriticality
  riskLevel: RiskLevel

  // Status & Dates
  planStatus: PlanStatus
  effectiveDate: string
  reviewDate?: string
  nextReviewDate?: string

  // Office
  officeId: string

  // Audit Fields
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string

  // ==================== ADVANCED FIELDS ====================

  // Plan Details
  planDetails?: {
    planName: string
    planType: PlanType
    planScope: PlanScope
    targetTimeline?: string
    ownerDepartment?: string
    planOwner?: string
    reviewCycle: ReviewCycle
    governanceModel?: string
    strategicAlignment?: string
    objectives?: string[]
  }

  // Critical Position Assessment
  criticalPosition?: CriticalPosition

  // Incumbent Details
  incumbent?: Incumbent

  // Successors
  successors?: Successor[]

  // Bench Strength Analysis
  benchStrength?: BenchStrength

  // Talent Pool
  talentPool?: TalentPool

  // Knowledge Transfer
  knowledgeTransfer?: KnowledgeTransfer

  // Emergency Succession
  emergencySuccession?: EmergencySuccession

  // Law Firm Specific
  lawFirmSuccession?: LawFirmSuccession

  // Action Plan
  actionPlan?: ActionPlan

  // Metrics & KPIs
  metrics?: Metrics

  // Review & Approval
  reviewApproval?: ReviewApproval

  // Communications
  communications?: Communications

  // Documents & Notes
  documents?: SuccessionDocument[]
  notes?: SuccessionNote[]
}

// ==================== API FUNCTIONS ====================

export interface SuccessionPlanFilters {
  positionCriticality?: PositionCriticality
  riskLevel?: RiskLevel
  planStatus?: PlanStatus
  planType?: PlanType
  departmentId?: string
  officeId?: string
  hasReadyNowSuccessor?: boolean
  reviewDueBefore?: string
  search?: string
}

export interface CreateSuccessionPlanInput {
  // Required fields
  positionId: string
  positionTitle: string
  incumbentId: string
  incumbentName: string
  positionCriticality: PositionCriticality
  riskLevel: RiskLevel
  planStatus: PlanStatus
  effectiveDate: string
  officeId: string

  // Optional basic fields
  departmentId?: string
  departmentName?: string
  reviewDate?: string
  nextReviewDate?: string

  // Optional advanced fields
  planDetails?: SuccessionPlan['planDetails']
  criticalPosition?: CriticalPosition
  incumbent?: Incumbent
  successors?: Successor[]
  benchStrength?: BenchStrength
  talentPool?: TalentPool
  knowledgeTransfer?: KnowledgeTransfer
  emergencySuccession?: EmergencySuccession
  lawFirmSuccession?: LawFirmSuccession
  actionPlan?: ActionPlan
  metrics?: Metrics
  reviewApproval?: ReviewApproval
  communications?: Communications
  documents?: SuccessionDocument[]
  notes?: SuccessionNote[]
}

export type UpdateSuccessionPlanInput = Partial<CreateSuccessionPlanInput>

// API Functions
export const successionPlanningApi = {
  // Get all succession plans with optional filters
  getAll: async (filters?: SuccessionPlanFilters): Promise<SuccessionPlan[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/succession-plans?${queryString}` : '/succession-plans'
    const response = await api.get(url)
    return response.data
  },

  // Get a single succession plan by ID
  getById: async (id: string): Promise<SuccessionPlan> => {
    const response = await api.get(`/succession-plans/${id}`)
    return response.data
  },

  // Create a new succession plan
  create: async (data: CreateSuccessionPlanInput): Promise<SuccessionPlan> => {
    const response = await api.post('/succession-plans', data)
    return response.data
  },

  // Update an existing succession plan
  update: async (id: string, data: UpdateSuccessionPlanInput): Promise<SuccessionPlan> => {
    const response = await api.patch(`/succession-plans/${id}`, data)
    return response.data
  },

  // Delete a succession plan
  delete: async (id: string): Promise<void> => {
    await api.delete(`/succession-plans/${id}`)
  },

  // Bulk delete succession plans
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/succession-plans/bulk-delete', { ids })
  },

  // Get succession plans by position
  getByPosition: async (positionId: string): Promise<SuccessionPlan[]> => {
    const response = await api.get(`/succession-plans/by-position/${positionId}`)
    return response.data
  },

  // Get succession plans by incumbent
  getByIncumbent: async (incumbentId: string): Promise<SuccessionPlan[]> => {
    const response = await api.get(`/succession-plans/by-incumbent/${incumbentId}`)
    return response.data
  },

  // Get plans requiring review
  getReviewDue: async (): Promise<SuccessionPlan[]> => {
    const response = await api.get('/succession-plans/review-due')
    return response.data
  },

  // Get high-risk plans
  getHighRisk: async (): Promise<SuccessionPlan[]> => {
    const response = await api.get('/succession-plans/high-risk')
    return response.data
  },

  // Get critical position plans without ready successors
  getCriticalWithoutSuccessors: async (): Promise<SuccessionPlan[]> => {
    const response = await api.get('/succession-plans/critical-without-successors')
    return response.data
  },

  // Add a successor to a plan
  addSuccessor: async (planId: string, successor: Omit<Successor, 'successorId'>): Promise<SuccessionPlan> => {
    const response = await api.post(`/succession-plans/${planId}/successors`, successor)
    return response.data
  },

  // Update a successor
  updateSuccessor: async (planId: string, successorId: string, data: Partial<Successor>): Promise<SuccessionPlan> => {
    const response = await api.patch(`/succession-plans/${planId}/successors/${successorId}`, data)
    return response.data
  },

  // Remove a successor
  removeSuccessor: async (planId: string, successorId: string): Promise<SuccessionPlan> => {
    const response = await api.delete(`/succession-plans/${planId}/successors/${successorId}`)
    return response.data
  },

  // Submit for approval
  submitForApproval: async (id: string): Promise<SuccessionPlan> => {
    const response = await api.post(`/succession-plans/${id}/submit-for-approval`)
    return response.data
  },

  // Approve plan
  approve: async (id: string, comments?: string): Promise<SuccessionPlan> => {
    const response = await api.post(`/succession-plans/${id}/approve`, { comments })
    return response.data
  },

  // Reject plan
  reject: async (id: string, comments: string): Promise<SuccessionPlan> => {
    const response = await api.post(`/succession-plans/${id}/reject`, { comments })
    return response.data
  },

  // Get statistics
  getStats: async (officeId?: string): Promise<{
    totalPlans: number
    activePlans: number
    criticalPositions: number
    highRiskPlans: number
    withReadySuccessors: number
    withoutSuccessors: number
    reviewDue: number
    averageBenchStrength: number
  }> => {
    const url = officeId ? `/succession-plans/stats?officeId=${officeId}` : '/succession-plans/stats'
    const response = await api.get(url)
    return response.data
  }
}

export default successionPlanningApi
