import api from './api'

// ==================== ENUMS & TYPES ====================

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship' | 'apprenticeship'
export type ContractType = 'indefinite' | 'fixed_term'
export type SeniorityLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive'
export type EducationLevel = 'high_school' | 'diploma' | 'bachelor' | 'master' | 'phd' | 'professional'
export type JobPostingStatus = 'draft' | 'published' | 'closed' | 'on_hold' | 'filled'
export type ApplicantStatus = 'applied' | 'screening' | 'phone_screen' | 'interviewing' | 'assessment' | 'background_check' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
export type InterviewType = 'phone' | 'video' | 'in_person' | 'panel' | 'case_study' | 'presentation'
export type AssessmentType = 'skills_test' | 'aptitude_test' | 'personality_test' | 'case_study' | 'writing_sample' | 'coding_test' | 'legal_writing'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'expired'
export type WorkLocation = 'office' | 'remote' | 'hybrid'
export type ApplicationSource = 'company_website' | 'job_board' | 'linkedin' | 'referral' | 'recruitment_agency' | 'university' | 'walk_in' | 'other'
export type ProficiencyLevel = 'basic' | 'intermediate' | 'advanced' | 'expert'
export type LanguageLevel = 'basic' | 'intermediate' | 'fluent' | 'native'
export type Recommendation = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
export type Urgency = 'low' | 'medium' | 'high' | 'critical'

// ==================== JOB POSTING INTERFACES ====================

export interface JobRequirement {
  requirementId: string
  type: 'education' | 'experience' | 'skill' | 'certification' | 'license' | 'language'
  name: string
  nameAr?: string
  level?: string
  yearsRequired?: number
  required: boolean
  preferred?: boolean
}

export interface Skill {
  skillId: string
  name: string
  nameAr?: string
  category: 'technical' | 'legal' | 'soft_skill' | 'software'
  proficiencyLevel: ProficiencyLevel
  required: boolean
}

export interface LanguageRequirement {
  language: string
  reading: LanguageLevel
  writing: LanguageLevel
  speaking: LanguageLevel
  required: boolean
}

export interface SalaryRange {
  showSalary: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryPeriod: 'monthly' | 'annual'
  salaryNegotiable: boolean
  allowances?: {
    housing?: number
    transportation?: number
    food?: number
    mobile?: number
  }
}

export interface HiringStage {
  stageNumber: number
  stageName: string
  stageNameAr?: string
  stageType: 'screening' | 'phone_screening' | 'assessment' | 'interview' | 'background_check' | 'offer' | 'onboarding'
  duration?: number
  responsible?: string
  responsibleRole?: string
  passingCriteria?: string
  automated: boolean
}

export interface InterviewPanel {
  interviewerId?: string
  interviewerName: string
  interviewerTitle?: string
  interviewType: InterviewType
  interviewRound: number
  duration?: number
}

export interface PostingChannel {
  channelType: 'company_website' | 'job_board' | 'linkedin' | 'social_media' | 'university' | 'recruitment_agency' | 'referral' | 'other'
  channelName?: string
  posted: boolean
  postedDate?: string
  jobUrl?: string
  applicationsReceived?: number
  costPerPosting?: number
}

export interface JobPosting {
  _id: string
  jobPostingId: string
  jobPostingNumber: string

  // Basic Info
  jobTitle: string
  jobTitleAr?: string
  jobCode?: string
  department?: string
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  location: string
  locationId?: string

  // Employment Details
  employmentType: EmploymentType
  contractType: ContractType
  contractDuration?: number
  probationPeriod?: number
  seniorityLevel: SeniorityLevel
  jobLevel?: number
  jobGrade?: string
  positions: number
  urgency: Urgency
  workLocation: WorkLocation
  remoteWorkPercentage?: number

  // Reporting
  reportsTo?: string
  reportingTitle?: string
  directReports?: number

  // Work Schedule
  workSchedule?: {
    weeklyHours: number
    workDays: string[]
    shiftBased: boolean
    shiftType?: string
    ramadanHours?: number
  }
  travelRequired: boolean
  travelPercentage?: number

  // Job Description
  jobDescription: {
    summary: string
    summaryAr?: string
    responsibilities: Array<{
      responsibility: string
      responsibilityAr?: string
      priority: 'primary' | 'secondary'
    }>
    kpis?: Array<{
      kpi: string
      target?: string
    }>
    keyChallenges?: string[]
    successFactors?: string[]
  }

  // Requirements
  requirements: {
    minimumEducation: EducationLevel
    requiredDegree?: string
    minimumExperience: number
    maximumExperience?: number
    education?: Array<{
      level: EducationLevel
      field?: string
      required: boolean
    }>
    skills?: Skill[]
    languages?: LanguageRequirement[]
    certifications?: Array<{
      certification: string
      certificationAr?: string
      issuingOrganization?: string
      required: boolean
    }>
    licenses?: Array<{
      licenseType: string
      issuingAuthority: string
      required: boolean
    }>
    attorneyRequirements?: {
      barAdmissionRequired: boolean
      jurisdiction?: string
      practiceAreas?: Array<{
        practiceArea: string
        yearsRequired?: number
        required: boolean
      }>
      courtExperience?: Array<{
        courtType: string
        required: boolean
      }>
      caseTypes?: string[]
      minimumCasesHandled?: number
      winRateRequired?: number
    }
    otherRequirements?: {
      drivingLicense?: boolean
      ownVehicle?: boolean
      willingToRelocate?: boolean
      securityClearance?: string
      backgroundCheckRequired?: boolean
    }
  }

  // Compensation
  salary: SalaryRange
  benefits?: Array<{
    benefit: string
    benefitAr?: string
    category: 'health' | 'insurance' | 'leave' | 'financial' | 'work_life' | 'other'
  }>
  leaveEntitlements?: {
    annualLeave: number
    sickLeave: string
    hajjLeave: boolean
    otherLeaves?: string
  }
  bonusStructure?: {
    performanceBonus: boolean
    annualBonus: boolean
    commissionBased: boolean
    details?: string
  }

  // Hiring Process
  hiringStages: HiringStage[]
  targetTimeline?: {
    timeToFirstInterview?: number
    timeToOffer?: number
    timeToHire?: number
  }
  assessments?: Array<{
    assessmentType: AssessmentType
    assessmentName: string
    provider?: string
    duration?: number
    passingScore?: number
    mandatory: boolean
  }>
  interviewPanel?: InterviewPanel[]

  // Recruitment Team
  recruitmentTeam: {
    hiringManager: {
      employeeId: string
      employeeName: string
      employeeNameAr?: string
      title: string
    }
    recruiter?: {
      employeeId?: string
      employeeName?: string
      external?: boolean
      agency?: string
    }
    panelMembers?: Array<{
      employeeId: string
      employeeName: string
      role: string
      interviewRound?: number
    }>
  }

  // Posting Channels
  postingChannels: {
    internal: boolean
    external: boolean
    channels: PostingChannel[]
  }

  // Approvals
  approvals?: {
    required: boolean
    budgetApproval?: {
      required: boolean
      approved?: boolean
      approvedBy?: string
      approvalDate?: string
    }
    headcountApproval?: {
      required: boolean
      approved?: boolean
      approvedBy?: string
      approvalDate?: string
    }
    finalApproval?: {
      status: 'pending' | 'approved' | 'rejected'
      approvedBy?: string
      approvalDate?: string
    }
  }

  // Status & Tracking
  status: JobPostingStatus
  postedDate?: string
  closingDate?: string
  applicationsCount: number
  applicationsByStage?: {
    applied: number
    screening: number
    interviewing: number
    offer: number
    hired: number
    rejected: number
  }
  applicationsBySource?: Record<string, number>
  metrics?: {
    timeToFill?: number
    timeToHire?: number
    offerAcceptanceRate?: number
    costPerHire?: number
    qualityOfHire?: number
  }

  // Documents
  documents?: Array<{
    documentType: 'job_description' | 'interview_guide' | 'assessment' | 'offer_template' | 'other'
    documentName: string
    fileUrl: string
    uploadedOn: string
  }>

  // Notes
  internalNotes?: string
  screeningNotes?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt: string
  lastModifiedBy?: string
}

// ==================== APPLICANT INTERFACES ====================

export interface Education {
  educationId: string
  level: EducationLevel
  degree: string
  major: string
  institution: string
  institutionCountry: string
  startDate?: string
  endDate?: string
  graduationYear: number
  gpa?: number
  gpaScale?: number
  honors?: string
  verified: boolean
  verificationDate?: string
}

export interface WorkHistory {
  experienceId: string
  company: string
  companyIndustry?: string
  jobTitle: string
  startDate: string
  endDate?: string
  currentlyWorking: boolean
  duration?: number
  location?: string
  responsibilities?: string
  achievements?: string
  reasonForLeaving?: string
  startingSalary?: number
  endingSalary?: number
  currency?: string
  supervisorName?: string
  supervisorTitle?: string
  supervisorContact?: string
  canContact: boolean
  verified: boolean
}

export interface Interview {
  interviewId: string
  interviewNumber: number
  interviewType: InterviewType
  interviewRound: number
  scheduledDate?: string
  scheduledTime?: string
  duration?: number
  location?: string
  videoMeetingLink?: string
  interviewers: Array<{
    interviewerId?: string
    interviewerName: string
    interviewerTitle: string
    attended: boolean
    rating?: number
    feedback?: string
    recommendation: Recommendation
    strengths?: string[]
    concerns?: string[]
  }>
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  completedOn?: string
  overallRating?: number
  technicalAssessment?: number
  culturalFit?: number
  communication?: number
  problemSolving?: number
  competencyRatings?: Array<{
    competency: string
    rating: number
  }>
  interviewNotes?: string
  overallRecommendation: Recommendation
  nextSteps?: string
  rescheduledFrom?: string
  rescheduledTo?: string
  reschedulingReason?: string
  noShowReason?: string
}

export interface Assessment {
  assessmentId: string
  assessmentType: AssessmentType
  assessmentName: string
  provider?: string
  assignedDate?: string
  dueDate?: string
  completedDate?: string
  status: 'assigned' | 'in_progress' | 'completed' | 'expired'
  score?: number
  maxScore?: number
  percentageScore?: number
  passed: boolean
  passingScore?: number
  resultsUrl?: string
  reportUrl?: string
  strengths?: string[]
  weaknesses?: string[]
  evaluatorComments?: string
  recommendation?: string
}

export interface BackgroundCheck {
  required: boolean
  initiated: boolean
  initiatedDate?: string
  provider?: string
  checksPerformed: Array<{
    checkType: 'employment' | 'education' | 'criminal' | 'credit' | 'reference' | 'license' | 'bar_admission' | 'social_media'
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    result?: 'clear' | 'issue_found' | 'unable_to_verify'
    completedDate?: string
    notes?: string
  }>
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'issues_found'
  overallResult?: 'cleared' | 'cleared_with_conditions' | 'not_cleared'
  completedDate?: string
  reportUrl?: string
  issues?: Array<{
    issueType: string
    description: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
    resolution?: string
  }>
  approvedBy?: string
  approvalDate?: string
}

export interface Offer {
  offerExtended: boolean
  offerDate?: string
  jobTitle: string
  department?: string
  location?: string
  employmentType: EmploymentType
  contractType: ContractType
  contractDuration?: number
  startDate?: string
  basicSalary: number
  currency: string
  allowances?: {
    housing?: number
    transportation?: number
    food?: number
    mobile?: number
    other?: number
  }
  totalCompensation: number
  bonus?: {
    annualBonus?: number
    performanceBonus?: boolean
    signingBonus?: number
  }
  benefits?: string[]
  probationPeriod?: number
  noticePeriod?: number
  offerLetterUrl?: string
  offerLetterSent: boolean
  offerLetterSentDate?: string
  offerExpiryDate?: string
  offerStatus: OfferStatus
  responseDate?: string
  acceptedDate?: string
  signedOfferUrl?: string
  rejectionDate?: string
  rejectionReason?: string
  negotiationNotes?: string
  counterOffer?: {
    salary?: number
    allowances?: Record<string, number>
    startDate?: string
    otherTerms?: string
    status: 'pending' | 'accepted' | 'rejected'
  }
  contingencies?: Array<{
    contingencyType: 'background_check' | 'reference_check' | 'medical' | 'visa' | 'other'
    status: 'pending' | 'satisfied' | 'failed'
    completedDate?: string
  }>
}

export interface Reference {
  referenceNumber: number
  referenceName: string
  relationship: string
  company?: string
  title?: string
  email?: string
  phone?: string
  contacted: boolean
  contactDate?: string
  feedback?: string
  rating?: number
  wouldRehire?: boolean
}

export interface Communication {
  communicationId: string
  communicationType: 'email' | 'phone' | 'sms' | 'whatsapp' | 'in_person'
  direction: 'inbound' | 'outbound'
  date: string
  from?: string
  to?: string
  subject?: string
  message?: string
  purpose: 'application_received' | 'screening_update' | 'interview_invitation' | 'interview_reminder' | 'rejection' | 'offer' | 'follow_up' | 'other'
  attachments?: string[]
  sentBy?: string
  responseReceived?: boolean
  responseDate?: string
}

export interface Applicant {
  _id: string
  applicantId: string
  applicantNumber: string

  // Personal Info
  personalInfo: {
    fullName: string
    fullNameAr?: string
    firstName?: string
    middleName?: string
    lastName?: string
    email: string
    alternateEmail?: string
    phone: string
    alternatePhone?: string
    whatsappNumber?: string
    nationalId?: string
    nationalIdType?: 'saudi_id' | 'iqama' | 'passport' | 'gcc_id'
    nationality: string
    isSaudi?: boolean
    dateOfBirth?: string
    age?: number
    gender?: 'male' | 'female'
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
    currentLocation: string
    city?: string
    country?: string
    willingToRelocate: boolean
    address?: {
      streetAddress?: string
      district?: string
      city: string
      postalCode?: string
      country: string
    }
    requiresVisa: boolean
    hasWorkPermit?: boolean
    workPermitExpiry?: string
    visaSponsorship?: 'required' | 'not_required' | 'has_valid'
  }

  // Application
  application: {
    jobPostingId: string
    jobPostingNumber?: string
    jobTitle: string
    department?: string
    location?: string
    applicationDate: string
    applicationSource: ApplicationSource
    sourceDetails?: string
    referredBy?: {
      employeeId?: string
      employeeName?: string
      relationship?: string
      externalReferrer?: string
    }
    howHeardAboutUs?: string
    applicationMaterials: {
      resumeUrl?: string
      resumeFileName?: string
      resumeParsed?: boolean
      coverLetterUrl?: string
      coverLetterProvided: boolean
      portfolioUrl?: string
      portfolioProvided?: boolean
      otherDocuments?: Array<{
        documentType: string
        documentName: string
        fileUrl: string
      }>
    }
    references?: Reference[]
  }

  // Qualifications
  qualifications: {
    education: Education[]
    certifications?: Array<{
      certificationId: string
      certificationName: string
      issuingOrganization: string
      issueDate?: string
      expiryDate?: string
      certificateNumber?: string
      verified: boolean
    }>
    barAdmissions?: Array<{
      admissionId: string
      jurisdiction: string
      barNumber: string
      admissionDate: string
      status: 'active' | 'suspended' | 'inactive'
      specializations?: string[]
      verified: boolean
      verificationDate?: string
    }>
    licenses?: Array<{
      licenseId: string
      licenseType: string
      licenseNumber: string
      issuingAuthority: string
      issueDate?: string
      expiryDate?: string
      verified: boolean
    }>
    skills: Array<{
      skillName: string
      skillCategory: 'technical' | 'legal' | 'soft_skill' | 'language' | 'software'
      proficiencyLevel: ProficiencyLevel
      yearsOfExperience?: number
      selfAssessed?: boolean
      tested?: boolean
      testScore?: number
    }>
    languages: Array<{
      language: string
      nativeLanguage: boolean
      reading: LanguageLevel
      writing: LanguageLevel
      speaking: LanguageLevel
      certifications?: Array<{
        certificationName: string
        score?: string
        date?: string
      }>
      tested?: boolean
      testResult?: string
    }>
  }

  // Work Experience
  workExperience: {
    totalExperience: number
    relevantExperience?: number
    currentlyEmployed: boolean
    workHistory: WorkHistory[]
    attorneyExperience?: {
      totalYearsAsAttorney: number
      practiceAreas: Array<{
        practiceArea: string
        yearsOfExperience: number
        expertise: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      }>
      caseExperience?: {
        totalCasesHandled?: number
        casesWon?: number
        casesLost?: number
        winRate?: number
        casesByType?: Array<{
          caseType: string
          count: number
        }>
      }
      courtExperience?: Array<{
        courtType: string
        courtLevel: string
        yearsOfExperience: number
        appearances?: number
      }>
      notableCases?: Array<{
        caseName?: string
        caseType: string
        year: number
        outcome: string
        role: string
      }>
    }
  }

  // Expected Compensation
  expectedCompensation: {
    currentSalary?: number
    currentCurrency?: string
    expectedSalary: number
    expectedCurrency: string
    salaryPeriod: 'monthly' | 'annual'
    salaryNegotiable: boolean
    minimumAcceptable?: number
    currentBenefits?: string[]
    expectedBenefits?: string[]
    currentAllowances?: {
      housing?: number
      transportation?: number
      other?: number
    }
    noticePeriod?: number
    noticePeriodNegotiable?: boolean
  }

  // Availability
  availability: {
    currentEmploymentStatus: 'employed' | 'unemployed' | 'student' | 'notice_period' | 'available'
    availableToStart: string
    noticePeriod?: number
    canBuyOut?: boolean
    immediatelyAvailable: boolean
    workAuthorization: 'citizen' | 'permanent_resident' | 'work_permit' | 'requires_visa'
    travelRestrictions?: string
  }

  // Screening
  screening?: {
    screened: boolean
    screenedBy?: string
    screenedOn?: string
    screeningMethod?: 'resume_review' | 'phone_screen' | 'automated' | 'ai_matching'
    screeningScore?: number
    screeningNotes?: string
    knockoutQuestions?: Array<{
      question: string
      answer: string
      passed: boolean
    }>
    matchingScore?: {
      overall: number
      education: number
      experience: number
      skills: number
      location: number
      salary: number
      strengths?: string[]
      gaps?: string[]
    }
    screeningDecision: 'passed' | 'rejected' | 'on_hold'
    screeningRejectReason?: string
    aiScreening?: {
      performed: boolean
      score: number
      recommendation: Recommendation
      keyStrengths?: string[]
      concerns?: string[]
    }
  }

  // Interviews
  interviews: Interview[]

  // Assessments
  assessments?: Assessment[]

  // Background Check
  backgroundCheck?: BackgroundCheck

  // Offer
  offer?: Offer

  // Hiring
  hiring?: {
    hired: boolean
    hireDate?: string
    employeeId?: string
    employeeNumber?: string
    actualStartDate?: string
    hiringApproval: {
      required: boolean
      approvedBy?: string
      approvalDate?: string
    }
    onboardingInitiated: boolean
    onboardingId?: string
  }

  // Rejection
  rejection?: {
    rejected: boolean
    rejectionDate: string
    rejectionStage: 'screening' | 'interview' | 'assessment' | 'background_check' | 'offer'
    rejectionReason: string
    rejectionCategory: 'not_qualified' | 'failed_interview' | 'failed_assessment' | 'salary_mismatch' | 'location' | 'background_check' | 'position_filled' | 'withdrew' | 'other'
    rejectionNotes?: string
    rejectedBy?: string
    feedbackProvided: boolean
    feedbackSentDate?: string
    keepInTalentPool: boolean
    reapplicationEligible: boolean
    reapplicationDate?: string
  }

  // Status
  status: ApplicantStatus
  currentStage?: string
  currentStageStartDate?: string
  statusHistory?: Array<{
    status: string
    startDate: string
    endDate?: string
    duration?: number
    changedBy?: string
    notes?: string
  }>
  daysInProcess?: number
  nextAction?: string
  nextActionDueDate?: string
  nextActionOwner?: string

  // Communications
  communications?: Communication[]

  // Notes
  notes?: {
    recruiterNotes?: string
    hiringManagerNotes?: string
    interviewerNotes?: string
    internalNotes?: string
    flagged: boolean
    flagReason?: string
    flaggedBy?: string
    flaggedDate?: string
  }

  // Compliance
  compliance?: {
    dataConsent: {
      consentGiven: boolean
      consentDate?: string
      consentVersion?: string
      dataRetentionPeriod?: number
      dataRetentionExpiry?: string
    }
    rightToWork: {
      verified: boolean
      verificationDate?: string
      verificationMethod?: string
      documentType?: string
      documentNumber?: string
      documentExpiry?: string
    }
  }

  // Audit
  createdAt: string
  createdBy?: string
  updatedAt: string
}

// ==================== FILTER INTERFACES ====================

export interface JobPostingFilters {
  status?: JobPostingStatus
  department?: string
  location?: string
  employmentType?: EmploymentType
  seniorityLevel?: SeniorityLevel
  urgency?: Urgency
  search?: string
  page?: number
  limit?: number
}

export interface ApplicantFilters {
  jobPostingId?: string
  status?: ApplicantStatus
  source?: ApplicationSource
  screeningDecision?: 'passed' | 'rejected' | 'on_hold'
  minExperience?: number
  maxExperience?: number
  education?: EducationLevel
  isSaudi?: boolean
  search?: string
  page?: number
  limit?: number
}

// ==================== LABELS ====================

export const JOB_STATUS_LABELS: Record<JobPostingStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'slate' },
  published: { ar: 'منشور', en: 'Published', color: 'emerald' },
  closed: { ar: 'مغلق', en: 'Closed', color: 'red' },
  on_hold: { ar: 'معلق', en: 'On Hold', color: 'amber' },
  filled: { ar: 'تم التعيين', en: 'Filled', color: 'blue' },
}

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, { ar: string; en: string; color: string }> = {
  applied: { ar: 'مقدم', en: 'Applied', color: 'slate' },
  screening: { ar: 'فرز', en: 'Screening', color: 'blue' },
  phone_screen: { ar: 'مكالمة هاتفية', en: 'Phone Screen', color: 'cyan' },
  interviewing: { ar: 'مقابلة', en: 'Interviewing', color: 'purple' },
  assessment: { ar: 'اختبار', en: 'Assessment', color: 'amber' },
  background_check: { ar: 'فحص الخلفية', en: 'Background Check', color: 'orange' },
  offer: { ar: 'عرض وظيفي', en: 'Offer', color: 'emerald' },
  hired: { ar: 'تم التعيين', en: 'Hired', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  withdrawn: { ar: 'انسحب', en: 'Withdrawn', color: 'slate' },
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, { ar: string; en: string }> = {
  full_time: { ar: 'دوام كامل', en: 'Full Time' },
  part_time: { ar: 'دوام جزئي', en: 'Part Time' },
  contract: { ar: 'عقد', en: 'Contract' },
  temporary: { ar: 'مؤقت', en: 'Temporary' },
  internship: { ar: 'تدريب', en: 'Internship' },
  apprenticeship: { ar: 'تدريب مهني', en: 'Apprenticeship' },
}

export const SENIORITY_LABELS: Record<SeniorityLevel, { ar: string; en: string }> = {
  entry: { ar: 'مبتدئ', en: 'Entry' },
  junior: { ar: 'مبتدئ', en: 'Junior' },
  mid: { ar: 'متوسط', en: 'Mid-Level' },
  senior: { ar: 'خبير', en: 'Senior' },
  lead: { ar: 'قائد', en: 'Lead' },
  manager: { ar: 'مدير', en: 'Manager' },
  director: { ar: 'مدير تنفيذي', en: 'Director' },
  executive: { ar: 'تنفيذي', en: 'Executive' },
}

export const EDUCATION_LABELS: Record<EducationLevel, { ar: string; en: string }> = {
  high_school: { ar: 'ثانوية', en: 'High School' },
  diploma: { ar: 'دبلوم', en: 'Diploma' },
  bachelor: { ar: 'بكالوريوس', en: 'Bachelor' },
  master: { ar: 'ماجستير', en: 'Master' },
  phd: { ar: 'دكتوراه', en: 'PhD' },
  professional: { ar: 'شهادة مهنية', en: 'Professional' },
}

export const SOURCE_LABELS: Record<ApplicationSource, { ar: string; en: string }> = {
  company_website: { ar: 'موقع الشركة', en: 'Company Website' },
  job_board: { ar: 'موقع توظيف', en: 'Job Board' },
  linkedin: { ar: 'لينكد إن', en: 'LinkedIn' },
  referral: { ar: 'ترشيح', en: 'Referral' },
  recruitment_agency: { ar: 'وكالة توظيف', en: 'Recruitment Agency' },
  university: { ar: 'جامعة', en: 'University' },
  walk_in: { ar: 'حضور مباشر', en: 'Walk-in' },
  other: { ar: 'أخرى', en: 'Other' },
}

// ==================== API FUNCTIONS ====================

export const recruitmentService = {
  // ==================== JOB POSTINGS ====================

  // Get all job postings
  getJobPostings: async (filters?: JobPostingFilters) => {
    const response = await api.get<{ data: JobPosting[]; total: number; page: number; limit: number }>(
      '/hr/recruitment/jobs',
      { params: filters }
    )
    return response.data
  },

  // Get single job posting
  getJobPosting: async (jobId: string) => {
    const response = await api.get<JobPosting>(`/hr/recruitment/jobs/${jobId}`)
    return response.data
  },

  // Create job posting
  createJobPosting: async (data: Partial<JobPosting>) => {
    const response = await api.post<JobPosting>('/hr/recruitment/jobs', data)
    return response.data
  },

  // Update job posting
  updateJobPosting: async (jobId: string, data: Partial<JobPosting>) => {
    const response = await api.patch<JobPosting>(`/hr/recruitment/jobs/${jobId}`, data)
    return response.data
  },

  // Delete job posting
  deleteJobPosting: async (jobId: string) => {
    const response = await api.delete(`/hr/recruitment/jobs/${jobId}`)
    return response.data
  },

  // Publish job posting
  publishJobPosting: async (jobId: string) => {
    const response = await api.post<JobPosting>(`/hr/recruitment/jobs/${jobId}/publish`)
    return response.data
  },

  // Close job posting
  closeJobPosting: async (jobId: string, reason?: string) => {
    const response = await api.post<JobPosting>(`/hr/recruitment/jobs/${jobId}/close`, { reason })
    return response.data
  },

  // Put on hold
  holdJobPosting: async (jobId: string, reason?: string) => {
    const response = await api.post<JobPosting>(`/hr/recruitment/jobs/${jobId}/hold`, { reason })
    return response.data
  },

  // Duplicate job posting
  duplicateJobPosting: async (jobId: string) => {
    const response = await api.post<JobPosting>(`/hr/recruitment/jobs/${jobId}/duplicate`)
    return response.data
  },

  // Get job posting stats
  getJobPostingStats: async () => {
    const response = await api.get<{
      totalJobs: number
      byStatus: { status: JobPostingStatus; count: number }[]
      totalApplications: number
      avgTimeToFill: number
      avgCostPerHire: number
    }>('/hr/recruitment/jobs/stats')
    return response.data
  },

  // ==================== APPLICANTS ====================

  // Get all applicants
  getApplicants: async (filters?: ApplicantFilters) => {
    const response = await api.get<{ data: Applicant[]; total: number; page: number; limit: number }>(
      '/hr/recruitment/applicants',
      { params: filters }
    )
    return response.data
  },

  // Get applicants for a job
  getJobApplicants: async (jobId: string, filters?: ApplicantFilters) => {
    const response = await api.get<{ data: Applicant[]; total: number; page: number; limit: number }>(
      `/hr/recruitment/jobs/${jobId}/applicants`,
      { params: filters }
    )
    return response.data
  },

  // Get single applicant
  getApplicant: async (applicantId: string) => {
    const response = await api.get<Applicant>(`/hr/recruitment/applicants/${applicantId}`)
    return response.data
  },

  // Create applicant
  createApplicant: async (data: Partial<Applicant>) => {
    const response = await api.post<Applicant>('/hr/recruitment/applicants', data)
    return response.data
  },

  // Update applicant
  updateApplicant: async (applicantId: string, data: Partial<Applicant>) => {
    const response = await api.patch<Applicant>(`/hr/recruitment/applicants/${applicantId}`, data)
    return response.data
  },

  // Update applicant status
  updateApplicantStatus: async (applicantId: string, status: ApplicantStatus, notes?: string) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/status`, { status, notes })
    return response.data
  },

  // Screen applicant
  screenApplicant: async (applicantId: string, data: {
    screeningScore: number
    screeningNotes?: string
    screeningDecision: 'passed' | 'rejected' | 'on_hold'
    screeningRejectReason?: string
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/screen`, data)
    return response.data
  },

  // Schedule interview
  scheduleInterview: async (applicantId: string, data: Omit<Interview, 'interviewId' | 'interviewNumber' | 'status' | 'overallRecommendation'>) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/interviews`, data)
    return response.data
  },

  // Update interview
  updateInterview: async (applicantId: string, interviewId: string, data: Partial<Interview>) => {
    const response = await api.patch<Applicant>(`/hr/recruitment/applicants/${applicantId}/interviews/${interviewId}`, data)
    return response.data
  },

  // Complete interview
  completeInterview: async (applicantId: string, interviewId: string, data: {
    overallRating: number
    technicalAssessment?: number
    culturalFit?: number
    communication?: number
    problemSolving?: number
    competencyRatings?: Array<{ competency: string; rating: number }>
    interviewNotes?: string
    overallRecommendation: Recommendation
    nextSteps?: string
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/interviews/${interviewId}/complete`, data)
    return response.data
  },

  // Assign assessment
  assignAssessment: async (applicantId: string, data: Omit<Assessment, 'assessmentId' | 'status' | 'passed'>) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/assessments`, data)
    return response.data
  },

  // Complete assessment
  completeAssessment: async (applicantId: string, assessmentId: string, data: {
    score: number
    maxScore: number
    passed: boolean
    strengths?: string[]
    weaknesses?: string[]
    evaluatorComments?: string
    recommendation?: string
    resultsUrl?: string
    reportUrl?: string
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/assessments/${assessmentId}/complete`, data)
    return response.data
  },

  // Initiate background check
  initiateBackgroundCheck: async (applicantId: string, data: {
    provider?: string
    checksRequired: Array<'employment' | 'education' | 'criminal' | 'credit' | 'reference' | 'license' | 'bar_admission'>
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/background-check`, data)
    return response.data
  },

  // Update background check
  updateBackgroundCheck: async (applicantId: string, data: Partial<BackgroundCheck>) => {
    const response = await api.patch<Applicant>(`/hr/recruitment/applicants/${applicantId}/background-check`, data)
    return response.data
  },

  // Extend offer
  extendOffer: async (applicantId: string, data: Omit<Offer, 'offerStatus' | 'offerExtended'>) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/offer`, data)
    return response.data
  },

  // Update offer
  updateOffer: async (applicantId: string, data: Partial<Offer>) => {
    const response = await api.patch<Applicant>(`/hr/recruitment/applicants/${applicantId}/offer`, data)
    return response.data
  },

  // Accept offer
  acceptOffer: async (applicantId: string, data: { acceptedDate: string; signedOfferUrl?: string }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/offer/accept`, data)
    return response.data
  },

  // Reject offer
  rejectOffer: async (applicantId: string, data: { rejectionDate: string; rejectionReason: string }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/offer/reject`, data)
    return response.data
  },

  // Hire applicant
  hireApplicant: async (applicantId: string, data: {
    hireDate: string
    actualStartDate: string
    employeeNumber?: string
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/hire`, data)
    return response.data
  },

  // Reject applicant
  rejectApplicant: async (applicantId: string, data: {
    rejectionStage: 'screening' | 'interview' | 'assessment' | 'background_check' | 'offer'
    rejectionReason: string
    rejectionCategory: string
    rejectionNotes?: string
    keepInTalentPool?: boolean
    feedbackProvided?: boolean
  }) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/reject`, data)
    return response.data
  },

  // Add communication
  addCommunication: async (applicantId: string, data: Omit<Communication, 'communicationId'>) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/communications`, data)
    return response.data
  },

  // Add note
  addNote: async (applicantId: string, noteType: 'recruiter' | 'hiring_manager' | 'interviewer' | 'internal', note: string) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/notes`, { noteType, note })
    return response.data
  },

  // Flag applicant
  flagApplicant: async (applicantId: string, flagReason: string) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/flag`, { flagReason })
    return response.data
  },

  // Unflag applicant
  unflagApplicant: async (applicantId: string) => {
    const response = await api.post<Applicant>(`/hr/recruitment/applicants/${applicantId}/unflag`)
    return response.data
  },

  // Get applicant stats
  getApplicantStats: async (jobId?: string) => {
    const response = await api.get<{
      totalApplicants: number
      byStatus: { status: ApplicantStatus; count: number }[]
      bySource: { source: ApplicationSource; count: number }[]
      avgTimeToHire: number
      offerAcceptanceRate: number
      screeningPassRate: number
      interviewToOfferRate: number
    }>('/hr/recruitment/applicants/stats', { params: { jobId } })
    return response.data
  },

  // Bulk update applicants
  bulkUpdateApplicants: async (applicantIds: string[], data: { status?: ApplicantStatus; notes?: string }) => {
    const response = await api.post<{ updated: number }>('/hr/recruitment/applicants/bulk-update', {
      applicantIds,
      ...data
    })
    return response.data
  },

  // Export applicants
  exportApplicants: async (filters?: ApplicantFilters, format: 'pdf' | 'excel' = 'excel') => {
    const response = await api.get('/hr/recruitment/applicants/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  },

  // Parse resume
  parseResume: async (fileUrl: string) => {
    const response = await api.post<{
      name?: string
      email?: string
      phone?: string
      education?: Education[]
      workHistory?: WorkHistory[]
      skills?: string[]
      languages?: string[]
    }>('/hr/recruitment/parse-resume', { fileUrl })
    return response.data
  },
}

export default recruitmentService
