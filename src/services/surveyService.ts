import api from './api'

// ==================== TYPES & ENUMS ====================

// Survey Type
export type SurveyType =
  | 'engagement'
  | 'pulse'
  | 'onboarding'
  | 'exit'
  | '360_feedback'
  | 'satisfaction'
  | 'culture'
  | 'custom'

// Survey Status
export type SurveyStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'closed' | 'archived'

// Question Type
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'likert'
  | 'nps'
  | 'text_short'
  | 'text_long'
  | 'matrix'
  | 'ranking'
  | 'date'
  | 'file_upload'

// Rating Scale
export type RatingScale = '1-5' | '1-7' | '1-10' | 'custom'

// Anonymity Level
export type AnonymityLevel = 'anonymous' | 'confidential' | 'identified'

// Frequency
export type SurveyFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'

// ==================== LABELS ====================

export const SURVEY_TYPE_LABELS: Record<SurveyType, { ar: string; en: string; icon: string; color: string }> = {
  engagement: { ar: 'استبيان التفاعل', en: 'Engagement', icon: 'Heart', color: 'pink' },
  pulse: { ar: 'استبيان سريع', en: 'Pulse', icon: 'Activity', color: 'blue' },
  onboarding: { ar: 'استبيان التعيين', en: 'Onboarding', icon: 'UserPlus', color: 'green' },
  exit: { ar: 'استبيان الخروج', en: 'Exit', icon: 'UserMinus', color: 'orange' },
  '360_feedback': { ar: 'تقييم 360', en: '360 Feedback', icon: 'RefreshCw', color: 'purple' },
  satisfaction: { ar: 'استبيان الرضا', en: 'Satisfaction', icon: 'ThumbsUp', color: 'cyan' },
  culture: { ar: 'استبيان الثقافة', en: 'Culture', icon: 'Users', color: 'indigo' },
  custom: { ar: 'مخصص', en: 'Custom', icon: 'Settings', color: 'gray' },
}

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'blue' },
  active: { ar: 'نشط', en: 'Active', color: 'green' },
  paused: { ar: 'متوقف', en: 'Paused', color: 'yellow' },
  closed: { ar: 'مغلق', en: 'Closed', color: 'red' },
  archived: { ar: 'مؤرشف', en: 'Archived', color: 'slate' },
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, { ar: string; en: string }> = {
  single_choice: { ar: 'اختيار واحد', en: 'Single Choice' },
  multiple_choice: { ar: 'اختيار متعدد', en: 'Multiple Choice' },
  rating: { ar: 'تقييم', en: 'Rating' },
  likert: { ar: 'مقياس ليكرت', en: 'Likert Scale' },
  nps: { ar: 'صافي نقاط الترويج', en: 'NPS' },
  text_short: { ar: 'نص قصير', en: 'Short Text' },
  text_long: { ar: 'نص طويل', en: 'Long Text' },
  matrix: { ar: 'مصفوفة', en: 'Matrix' },
  ranking: { ar: 'ترتيب', en: 'Ranking' },
  date: { ar: 'تاريخ', en: 'Date' },
  file_upload: { ar: 'رفع ملف', en: 'File Upload' },
}

export const ANONYMITY_LEVEL_LABELS: Record<AnonymityLevel, { ar: string; en: string; description: string }> = {
  anonymous: {
    ar: 'مجهول',
    en: 'Anonymous',
    description: 'Responses cannot be linked to individuals',
  },
  confidential: {
    ar: 'سري',
    en: 'Confidential',
    description: 'Identity known to system but hidden in reports',
  },
  identified: {
    ar: 'معرف',
    en: 'Identified',
    description: 'Responses linked to respondent',
  },
}

export const SURVEY_FREQUENCY_LABELS: Record<SurveyFrequency, { ar: string; en: string }> = {
  one_time: { ar: 'مرة واحدة', en: 'One Time' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
  semi_annual: { ar: 'نصف سنوي', en: 'Semi-Annual' },
  annual: { ar: 'سنوي', en: 'Annual' },
}

// ==================== INTERFACES ====================

// Question Option
export interface QuestionOption {
  optionId: string
  text: string
  textAr?: string
  value: string | number
  order: number
  isOther?: boolean
}

// Likert Scale Configuration
export interface LikertConfig {
  levels: number
  labels: Array<{
    value: number
    label: string
    labelAr?: string
  }>
  includeNA?: boolean
}

// Matrix Row/Column
export interface MatrixConfig {
  rows: Array<{
    rowId: string
    text: string
    textAr?: string
  }>
  columns: Array<{
    colId: string
    text: string
    textAr?: string
    value: string | number
  }>
}

// Question
export interface SurveyQuestion {
  questionId: string
  sectionId?: string
  type: QuestionType
  text: string
  textAr?: string
  description?: string
  descriptionAr?: string
  order: number
  required: boolean

  // Configuration based on type
  options?: QuestionOption[]
  ratingScale?: RatingScale
  ratingLabels?: { min: string; max: string; minAr?: string; maxAr?: string }
  likertConfig?: LikertConfig
  matrixConfig?: MatrixConfig
  maxSelections?: number
  minLength?: number
  maxLength?: number
  placeholder?: string
  placeholderAr?: string

  // Conditional Logic
  conditionalLogic?: {
    enabled: boolean
    conditions: Array<{
      questionId: string
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
      value: string | number
    }>
    action: 'show' | 'hide'
  }

  // Scoring
  scoring?: {
    enabled: boolean
    weights: Record<string, number>
    category?: string
  }

  // Metadata
  tags?: string[]
  isCore?: boolean
}

// Survey Section
export interface SurveySection {
  sectionId: string
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  order: number
  questions: SurveyQuestion[]
}

// Target Audience
export interface SurveyAudience {
  type: 'all' | 'department' | 'location' | 'job_level' | 'tenure' | 'custom'
  filters?: {
    departments?: string[]
    locations?: string[]
    jobLevels?: string[]
    tenureMin?: number
    tenureMax?: number
    employeeIds?: string[]
    excludeEmployeeIds?: string[]
  }
  totalRecipients?: number
}

// Survey Schedule
export interface SurveySchedule {
  frequency: SurveyFrequency
  startDate: string
  endDate?: string
  dueDate?: string
  reminderDays?: number[]
  autoClose: boolean
  autoCloseAfterDays?: number
}

// Survey Branding
export interface SurveyBranding {
  logoUrl?: string
  primaryColor?: string
  backgroundColor?: string
  headerText?: string
  headerTextAr?: string
  footerText?: string
  footerTextAr?: string
  showProgressBar: boolean
  showQuestionNumbers: boolean
}

// Survey Template
export interface SurveyTemplate {
  _id: string
  templateId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: SurveyType
  sections: SurveySection[]
  totalQuestions: number
  estimatedMinutes: number
  isDefault: boolean
  isActive: boolean
  category?: string
  tags?: string[]
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Survey
export interface Survey {
  _id: string
  surveyId: string
  surveyNumber: string

  // Basic Info
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  type: SurveyType
  status: SurveyStatus

  // Configuration
  anonymityLevel: AnonymityLevel
  allowPartialResponses: boolean
  showResults: boolean
  resultsVisibility: 'admin_only' | 'managers' | 'all_respondents'

  // Content
  sections: SurveySection[]
  totalQuestions: number
  estimatedMinutes: number

  // Audience
  audience: SurveyAudience

  // Schedule
  schedule: SurveySchedule

  // Branding
  branding?: SurveyBranding

  // Welcome & Thank You
  welcomeMessage?: string
  welcomeMessageAr?: string
  thankYouMessage?: string
  thankYouMessageAr?: string

  // Metrics
  metrics: {
    totalInvited: number
    totalStarted: number
    totalCompleted: number
    completionRate: number
    averageCompletionTime: number
    responseRate: number
  }

  // Notifications
  notifications: {
    sendInvitation: boolean
    sendReminders: boolean
    reminderFrequency?: 'daily' | 'every_other_day' | 'weekly'
    sendCompletionConfirmation: boolean
    notifyOnComplete?: string[]
  }

  // Based on Template
  templateId?: string
  templateName?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
  publishedAt?: string
  closedAt?: string
}

// Survey Response
export interface SurveyResponse {
  _id: string
  responseId: string
  surveyId: string
  surveyTitle: string

  // Respondent
  respondentId?: string
  respondentName?: string
  respondentDepartment?: string
  isAnonymous: boolean

  // Status
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  completedAt?: string
  lastUpdatedAt: string
  completionTime?: number

  // Answers
  answers: Array<{
    questionId: string
    questionText?: string
    questionType: QuestionType
    answer: string | number | string[] | Record<string, string | number>
    score?: number
  }>

  // Metrics
  questionsAnswered: number
  totalQuestions: number
  completionPercentage: number

  // Metadata
  ipAddress?: string
  userAgent?: string
  device?: 'desktop' | 'mobile' | 'tablet'

  // Audit
  createdAt: string
}

// Survey Analytics
export interface SurveyAnalytics {
  surveyId: string
  surveyTitle: string
  surveyType: SurveyType

  // Overview
  overview: {
    totalInvited: number
    totalResponses: number
    completedResponses: number
    inProgressResponses: number
    responseRate: number
    completionRate: number
    averageCompletionTime: number
  }

  // Response Trend
  responseTrend: Array<{
    date: string
    responses: number
    completed: number
  }>

  // Question Analytics
  questionAnalytics: Array<{
    questionId: string
    questionText: string
    questionType: QuestionType
    responseCount: number
    skipCount: number
    distribution: Array<{
      answer: string
      count: number
      percentage: number
    }>
    averageRating?: number
    npsScore?: number
    textResponses?: string[]
  }>

  // Scores
  scores?: {
    overallScore: number
    categoryScores: Array<{
      category: string
      score: number
      questionCount: number
    }>
    benchmarks?: Array<{
      category: string
      score: number
      industryBenchmark: number
      previousScore?: number
    }>
  }

  // NPS Analysis (for NPS surveys)
  npsAnalysis?: {
    npsScore: number
    promoters: number
    passives: number
    detractors: number
    promoterPercentage: number
    passivePercentage: number
    detractorPercentage: number
    trend: Array<{
      date: string
      npsScore: number
    }>
  }

  // eNPS Analysis (Employee NPS)
  enpsAnalysis?: {
    enpsScore: number
    promoters: number
    passives: number
    detractors: number
  }

  // Demographics (if not anonymous)
  demographicBreakdown?: {
    byDepartment: Array<{
      department: string
      responses: number
      completionRate: number
      averageScore?: number
    }>
    byTenure: Array<{
      tenureRange: string
      responses: number
      completionRate: number
      averageScore?: number
    }>
    byLocation: Array<{
      location: string
      responses: number
      completionRate: number
      averageScore?: number
    }>
  }

  // Insights
  insights?: Array<{
    type: 'strength' | 'concern' | 'trend' | 'recommendation'
    title: string
    description: string
    metric?: string
    value?: number
  }>

  // Generated At
  generatedAt: string
}

// Create Survey Data
export interface CreateSurveyData {
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  type: SurveyType
  templateId?: string
  anonymityLevel?: AnonymityLevel
  sections?: SurveySection[]
  audience?: SurveyAudience
  schedule?: Partial<SurveySchedule>
  branding?: SurveyBranding
  welcomeMessage?: string
  welcomeMessageAr?: string
  thankYouMessage?: string
  thankYouMessageAr?: string
  notifications?: Survey['notifications']
}

// Update Survey Data
export interface UpdateSurveyData extends Partial<CreateSurveyData> {
  status?: SurveyStatus
}

// Survey Filters
export interface SurveyFilters {
  status?: SurveyStatus
  type?: SurveyType
  createdBy?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Response Filters
export interface ResponseFilters {
  surveyId: string
  status?: SurveyResponse['status']
  departmentId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// Response Types
export interface SurveyListResponse {
  data: Survey[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ResponseListResponse {
  data: SurveyResponse[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface TemplateListResponse {
  data: SurveyTemplate[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Survey Statistics
export interface SurveyStatistics {
  totalSurveys: number
  activeSurveys: number
  completedSurveys: number
  totalResponses: number
  averageResponseRate: number
  averageCompletionRate: number
  byType: Array<{
    type: SurveyType
    count: number
    avgResponseRate: number
  }>
  byStatus: Array<{
    status: SurveyStatus
    count: number
  }>
  recentSurveys: Survey[]
  topPerforming: Array<{
    surveyId: string
    surveyTitle: string
    responseRate: number
    completionRate: number
  }>
}

// ==================== API FUNCTIONS ====================

// ----- Surveys -----

/**
 * Get all surveys with filters
 * GET /hr/surveys
 */
export const getSurveys = async (filters?: SurveyFilters): Promise<SurveyListResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.createdBy) params.append('createdBy', filters.createdBy)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/hr/surveys?${params.toString()}`)
  return response.data
}

/**
 * Get single survey
 * GET /hr/surveys/:id
 */
export const getSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.get(`/hr/surveys/${surveyId}`)
  return response.data
}

/**
 * Create survey
 * POST /hr/surveys
 */
export const createSurvey = async (data: CreateSurveyData): Promise<Survey> => {
  const response = await api.post('/hr/surveys', data)
  return response.data
}

/**
 * Update survey
 * PATCH /hr/surveys/:id
 */
export const updateSurvey = async (surveyId: string, data: UpdateSurveyData): Promise<Survey> => {
  const response = await api.patch(`/hr/surveys/${surveyId}`, data)
  return response.data
}

/**
 * Delete survey
 * DELETE /hr/surveys/:id
 */
export const deleteSurvey = async (surveyId: string): Promise<void> => {
  await api.delete(`/hr/surveys/${surveyId}`)
}

/**
 * Publish survey
 * POST /hr/surveys/:id/publish
 */
export const publishSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/publish`)
  return response.data
}

/**
 * Pause survey
 * POST /hr/surveys/:id/pause
 */
export const pauseSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/pause`)
  return response.data
}

/**
 * Resume survey
 * POST /hr/surveys/:id/resume
 */
export const resumeSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/resume`)
  return response.data
}

/**
 * Close survey
 * POST /hr/surveys/:id/close
 */
export const closeSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/close`)
  return response.data
}

/**
 * Archive survey
 * POST /hr/surveys/:id/archive
 */
export const archiveSurvey = async (surveyId: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/archive`)
  return response.data
}

/**
 * Clone survey
 * POST /hr/surveys/:id/clone
 */
export const cloneSurvey = async (surveyId: string, newTitle?: string): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/clone`, { title: newTitle })
  return response.data
}

/**
 * Preview survey
 * GET /hr/surveys/:id/preview
 */
export const previewSurvey = async (surveyId: string): Promise<{ previewUrl: string; expiresAt: string }> => {
  const response = await api.get(`/hr/surveys/${surveyId}/preview`)
  return response.data
}

/**
 * Send survey invitations
 * POST /hr/surveys/:id/send-invitations
 */
export const sendSurveyInvitations = async (surveyId: string): Promise<{ sent: number; failed: number }> => {
  const response = await api.post(`/hr/surveys/${surveyId}/send-invitations`)
  return response.data
}

/**
 * Send survey reminders
 * POST /hr/surveys/:id/send-reminders
 */
export const sendSurveyReminders = async (surveyId: string): Promise<{ sent: number }> => {
  const response = await api.post(`/hr/surveys/${surveyId}/send-reminders`)
  return response.data
}

// ----- Sections & Questions -----

/**
 * Add section to survey
 * POST /hr/surveys/:id/sections
 */
export const addSurveySection = async (surveyId: string, section: Partial<SurveySection>): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/sections`, section)
  return response.data
}

/**
 * Update section
 * PATCH /hr/surveys/:id/sections/:sectionId
 */
export const updateSurveySection = async (
  surveyId: string,
  sectionId: string,
  data: Partial<SurveySection>
): Promise<Survey> => {
  const response = await api.patch(`/hr/surveys/${surveyId}/sections/${sectionId}`, data)
  return response.data
}

/**
 * Delete section
 * DELETE /hr/surveys/:id/sections/:sectionId
 */
export const deleteSurveySection = async (surveyId: string, sectionId: string): Promise<Survey> => {
  const response = await api.delete(`/hr/surveys/${surveyId}/sections/${sectionId}`)
  return response.data
}

/**
 * Add question to survey
 * POST /hr/surveys/:id/questions
 */
export const addSurveyQuestion = async (
  surveyId: string,
  question: Partial<SurveyQuestion>,
  sectionId?: string
): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/questions`, { ...question, sectionId })
  return response.data
}

/**
 * Update question
 * PATCH /hr/surveys/:id/questions/:questionId
 */
export const updateSurveyQuestion = async (
  surveyId: string,
  questionId: string,
  data: Partial<SurveyQuestion>
): Promise<Survey> => {
  const response = await api.patch(`/hr/surveys/${surveyId}/questions/${questionId}`, data)
  return response.data
}

/**
 * Delete question
 * DELETE /hr/surveys/:id/questions/:questionId
 */
export const deleteSurveyQuestion = async (surveyId: string, questionId: string): Promise<Survey> => {
  const response = await api.delete(`/hr/surveys/${surveyId}/questions/${questionId}`)
  return response.data
}

/**
 * Reorder questions
 * POST /hr/surveys/:id/questions/reorder
 */
export const reorderSurveyQuestions = async (
  surveyId: string,
  orderedQuestionIds: string[]
): Promise<Survey> => {
  const response = await api.post(`/hr/surveys/${surveyId}/questions/reorder`, { questionIds: orderedQuestionIds })
  return response.data
}

// ----- Responses -----

/**
 * Get survey responses
 * GET /hr/surveys/:id/responses
 */
export const getSurveyResponses = async (filters: ResponseFilters): Promise<ResponseListResponse> => {
  const params = new URLSearchParams()
  params.append('surveyId', filters.surveyId)
  if (filters.status) params.append('status', filters.status)
  if (filters.departmentId) params.append('departmentId', filters.departmentId)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/surveys/${filters.surveyId}/responses?${params.toString()}`)
  return response.data
}

/**
 * Get single response
 * GET /hr/surveys/:surveyId/responses/:responseId
 */
export const getSurveyResponse = async (surveyId: string, responseId: string): Promise<SurveyResponse> => {
  const response = await api.get(`/hr/surveys/${surveyId}/responses/${responseId}`)
  return response.data
}

/**
 * Submit survey response
 * POST /hr/surveys/:id/responses
 */
export const submitSurveyResponse = async (
  surveyId: string,
  answers: SurveyResponse['answers'],
  respondentId?: string
): Promise<SurveyResponse> => {
  const response = await api.post(`/hr/surveys/${surveyId}/responses`, { answers, respondentId })
  return response.data
}

/**
 * Save partial response
 * POST /hr/surveys/:id/responses/save-partial
 */
export const savePartialResponse = async (
  surveyId: string,
  responseId: string,
  answers: SurveyResponse['answers']
): Promise<SurveyResponse> => {
  const response = await api.post(`/hr/surveys/${surveyId}/responses/${responseId}/save-partial`, { answers })
  return response.data
}

/**
 * Export responses
 * GET /hr/surveys/:id/responses/export
 */
export const exportSurveyResponses = async (
  surveyId: string,
  format?: 'excel' | 'csv' | 'pdf'
): Promise<Blob> => {
  const params = new URLSearchParams()
  if (format) params.append('format', format)

  const response = await api.get(`/hr/surveys/${surveyId}/responses/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// ----- Analytics -----

/**
 * Get survey analytics
 * GET /hr/surveys/:id/analytics
 */
export const getSurveyAnalytics = async (surveyId: string): Promise<SurveyAnalytics> => {
  const response = await api.get(`/hr/surveys/${surveyId}/analytics`)
  return response.data
}

/**
 * Get question analytics
 * GET /hr/surveys/:id/questions/:questionId/analytics
 */
export const getQuestionAnalytics = async (
  surveyId: string,
  questionId: string
): Promise<SurveyAnalytics['questionAnalytics'][0]> => {
  const response = await api.get(`/hr/surveys/${surveyId}/questions/${questionId}/analytics`)
  return response.data
}

/**
 * Get NPS trend
 * GET /hr/surveys/nps-trend
 */
export const getNpsTrend = async (params: {
  surveyType?: SurveyType
  dateFrom?: string
  dateTo?: string
}): Promise<Array<{ date: string; npsScore: number; responseCount: number }>> => {
  const queryParams = new URLSearchParams()
  if (params.surveyType) queryParams.append('surveyType', params.surveyType)
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) queryParams.append('dateTo', params.dateTo)

  const response = await api.get(`/hr/surveys/nps-trend?${queryParams.toString()}`)
  return response.data
}

/**
 * Get engagement trend
 * GET /hr/surveys/engagement-trend
 */
export const getEngagementTrend = async (params: {
  dateFrom?: string
  dateTo?: string
}): Promise<Array<{ date: string; engagementScore: number; responseRate: number }>> => {
  const queryParams = new URLSearchParams()
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) queryParams.append('dateTo', params.dateTo)

  const response = await api.get(`/hr/surveys/engagement-trend?${queryParams.toString()}`)
  return response.data
}

// ----- Templates -----

/**
 * Get survey templates
 * GET /hr/surveys/templates
 */
export const getSurveyTemplates = async (filters?: {
  type?: SurveyType
  category?: string
  search?: string
  page?: number
  limit?: number
}): Promise<TemplateListResponse> => {
  const params = new URLSearchParams()
  if (filters?.type) params.append('type', filters.type)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/surveys/templates?${params.toString()}`)
  return response.data
}

/**
 * Get single template
 * GET /hr/surveys/templates/:id
 */
export const getSurveyTemplate = async (templateId: string): Promise<SurveyTemplate> => {
  const response = await api.get(`/hr/surveys/templates/${templateId}`)
  return response.data
}

/**
 * Create template from survey
 * POST /hr/surveys/:id/create-template
 */
export const createTemplateFromSurvey = async (
  surveyId: string,
  templateData: { name: string; nameAr?: string; description?: string }
): Promise<SurveyTemplate> => {
  const response = await api.post(`/hr/surveys/${surveyId}/create-template`, templateData)
  return response.data
}

/**
 * Create template
 * POST /hr/surveys/templates
 */
export const createSurveyTemplate = async (data: Partial<SurveyTemplate>): Promise<SurveyTemplate> => {
  const response = await api.post('/hr/surveys/templates', data)
  return response.data
}

/**
 * Update template
 * PATCH /hr/surveys/templates/:id
 */
export const updateSurveyTemplate = async (
  templateId: string,
  data: Partial<SurveyTemplate>
): Promise<SurveyTemplate> => {
  const response = await api.patch(`/hr/surveys/templates/${templateId}`, data)
  return response.data
}

/**
 * Delete template
 * DELETE /hr/surveys/templates/:id
 */
export const deleteSurveyTemplate = async (templateId: string): Promise<void> => {
  await api.delete(`/hr/surveys/templates/${templateId}`)
}

// ----- Statistics -----

/**
 * Get survey statistics
 * GET /hr/surveys/stats
 */
export const getSurveyStats = async (): Promise<SurveyStatistics> => {
  const response = await api.get('/hr/surveys/stats')
  return response.data
}

/**
 * Get my surveys (for respondent)
 * GET /hr/surveys/my-surveys
 */
export const getMySurveys = async (): Promise<{
  pending: Array<{ surveyId: string; title: string; dueDate: string }>
  completed: Array<{ surveyId: string; title: string; completedAt: string }>
}> => {
  const response = await api.get('/hr/surveys/my-surveys')
  return response.data
}

/**
 * Get survey for respondent (public endpoint)
 * GET /hr/surveys/:id/take
 */
export const getSurveyForRespondent = async (
  surveyId: string,
  token?: string
): Promise<{
  survey: Survey
  previousAnswers?: SurveyResponse['answers']
  responseId?: string
}> => {
  const params = new URLSearchParams()
  if (token) params.append('token', token)

  const response = await api.get(`/hr/surveys/${surveyId}/take?${params.toString()}`)
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const surveyService = {
  // Surveys
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  pauseSurvey,
  resumeSurvey,
  closeSurvey,
  archiveSurvey,
  cloneSurvey,
  previewSurvey,
  sendSurveyInvitations,
  sendSurveyReminders,

  // Sections & Questions
  addSurveySection,
  updateSurveySection,
  deleteSurveySection,
  addSurveyQuestion,
  updateSurveyQuestion,
  deleteSurveyQuestion,
  reorderSurveyQuestions,

  // Responses
  getSurveyResponses,
  getSurveyResponse,
  submitSurveyResponse,
  savePartialResponse,
  exportSurveyResponses,

  // Analytics
  getSurveyAnalytics,
  getQuestionAnalytics,
  getNpsTrend,
  getEngagementTrend,

  // Templates
  getSurveyTemplates,
  getSurveyTemplate,
  createTemplateFromSurvey,
  createSurveyTemplate,
  updateSurveyTemplate,
  deleteSurveyTemplate,

  // Statistics & Respondent
  getSurveyStats,
  getMySurveys,
  getSurveyForRespondent,

  // Labels
  SURVEY_TYPE_LABELS,
  SURVEY_STATUS_LABELS,
  QUESTION_TYPE_LABELS,
  ANONYMITY_LEVEL_LABELS,
  SURVEY_FREQUENCY_LABELS,
}

export default surveyService
