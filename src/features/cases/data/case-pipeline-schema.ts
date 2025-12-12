/**
 * Case Pipeline Types and Configuration
 * Defines stages for different case types in the Saudi Arabian legal workflow
 * Based on Ministry of Justice (وزارة العدل) and Najiz platform procedures
 */

import { z } from 'zod'

// Case Pipeline Stage
export interface CasePipelineStage {
  id: string
  name: string
  nameAr: string
  color: string
  order: number
  description?: string
  descriptionAr?: string
  isFinal?: boolean
  canEnd?: boolean // Can case end at this stage (settlement, judgment)
  isMandatory?: boolean // Is this stage mandatory (e.g., friendly settlement for labor)
  maxDurationDays?: number // Expected max duration in days
}

// Case Pipeline Configuration by Case Type
export interface CasePipelineConfig {
  caseType: string
  caseTypeAr: string
  stages: CasePipelineStage[]
  notes?: string // Important notes about this pipeline
  notesAr?: string
}

// Case Card Data for Pipeline View
export interface CasePipelineCard {
  _id: string
  caseNumber: string
  title: string
  category: string
  status: string
  priority: string

  // Parties
  plaintiffName?: string
  defendantName?: string
  clientId?: {
    _id: string
    name: string
    phone?: string
  }

  // Court Info
  court?: string
  judge?: string
  nextHearing?: string

  // Financial
  claimAmount: number
  expectedWinAmount: number

  // Progress
  currentStage: string
  stageEnteredAt: string
  outcome?: 'won' | 'lost' | 'settled' | 'ongoing'

  // Related Items Count
  tasksCount: number
  notionPagesCount: number
  remindersCount: number
  eventsCount: number
  notesCount: number

  // Metadata
  createdAt: string
  updatedAt: string
  daysInCurrentStage: number

  // Notes preview
  latestNote?: {
    text: string
    date: string
  }
}

// Case Outcome Options
export const caseOutcomes = [
  { value: 'ongoing', label: 'جاري', labelEn: 'Ongoing', color: 'blue' },
  { value: 'won', label: 'كسب', labelEn: 'Won', color: 'emerald' },
  { value: 'lost', label: 'خسارة', labelEn: 'Lost', color: 'red' },
  { value: 'settled', label: 'تسوية', labelEn: 'Settled', color: 'purple' },
] as const

// Case End Reasons
export const caseEndReasons = [
  { value: 'final_judgment', label: 'حكم نهائي', labelEn: 'Final Judgment' },
  { value: 'settlement', label: 'تسوية ودية', labelEn: 'Settlement' },
  { value: 'withdrawal', label: 'سحب الدعوى', labelEn: 'Withdrawal' },
  { value: 'dismissal', label: 'رفض الدعوى', labelEn: 'Dismissal' },
  { value: 'reconciliation', label: 'صلح', labelEn: 'Reconciliation' },
  { value: 'execution_complete', label: 'اكتمال التنفيذ', labelEn: 'Execution Complete' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

// ==================== LABOR CASE PIPELINE ====================
// Based on Saudi Labor Law and MHRSD procedures
// Friendly settlement is MANDATORY before court filing
export const laborCasePipeline: CasePipelineConfig = {
  caseType: 'labor',
  caseTypeAr: 'قضايا عمالية',
  notes: 'Friendly settlement is mandatory. Must exhaust within 21 working days before court filing.',
  notesAr: 'التسوية الودية إلزامية. يجب استنفادها خلال 21 يوم عمل قبل رفع الدعوى',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'تقديم الدعوى',
      color: '#6366F1', // Indigo
      order: 1,
      description: 'Initial complaint filed via MHRSD portal',
      descriptionAr: 'تقديم الشكوى عبر بوابة وزارة الموارد البشرية',
      canEnd: true,
    },
    {
      id: 'friendly_settlement_1',
      name: 'Friendly Settlement - First Session',
      nameAr: 'التسوية الودية - الجلسة الأولى',
      color: '#8B5CF6', // Purple
      order: 2,
      description: 'First amicable settlement hearing (MANDATORY)',
      descriptionAr: 'الجلسة الأولى للتسوية الودية (إلزامي)',
      canEnd: true,
      isMandatory: true,
      maxDurationDays: 7,
    },
    {
      id: 'friendly_settlement_2',
      name: 'Friendly Settlement - Second Session',
      nameAr: 'التسوية الودية - الجلسة الثانية',
      color: '#A855F7', // Violet
      order: 3,
      description: 'Second amicable settlement hearing within 21 days',
      descriptionAr: 'الجلسة الثانية للتسوية الودية خلال 21 يوم',
      canEnd: true,
      isMandatory: true,
      maxDurationDays: 14,
    },
    {
      id: 'labor_court',
      name: 'Labor Court',
      nameAr: 'المحكمة العمالية',
      color: '#F59E0B', // Amber
      order: 4,
      description: 'Labor court first instance hearing',
      descriptionAr: 'المحكمة العمالية الابتدائية',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف العمالية',
      color: '#EF4444', // Red
      order: 5,
      description: 'Appeal within 30 days of judgment',
      descriptionAr: 'الاستئناف خلال 30 يوم من الحكم',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'execution',
      name: 'Execution',
      nameAr: 'التنفيذ',
      color: '#10B981', // Emerald
      order: 6,
      description: 'Enforcement of judgment via Najiz',
      descriptionAr: 'تنفيذ الحكم عبر ناجز',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== COMMERCIAL CASE PIPELINE ====================
// Based on Commercial Courts Law and Najiz procedures
export const commercialCasePipeline: CasePipelineConfig = {
  caseType: 'commercial',
  caseTypeAr: 'قضايا تجارية',
  notes: 'Mediation is encouraged but not always mandatory. Commercial courts in Riyadh, Jeddah, and Dammam.',
  notesAr: 'الوساطة مستحسنة ولكنها ليست إلزامية دائماً. المحاكم التجارية في الرياض وجدة والدمام',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'رفع الدعوى',
      color: '#6366F1',
      order: 1,
      description: 'Statement of claim filed via Najiz',
      descriptionAr: 'تقديم صحيفة الدعوى عبر ناجز',
      canEnd: true,
    },
    {
      id: 'mediation',
      name: 'Mediation',
      nameAr: 'الوساطة',
      color: '#8B5CF6',
      order: 2,
      description: 'Optional mediation/conciliation via Taraadi',
      descriptionAr: 'الوساطة الاختيارية عبر منصة تراضي',
      canEnd: true,
    },
    {
      id: 'commercial_court',
      name: 'Commercial Court',
      nameAr: 'المحكمة التجارية',
      color: '#F59E0B',
      order: 3,
      description: 'Commercial court first instance',
      descriptionAr: 'المحكمة التجارية الابتدائية',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Commercial Appeal Court',
      nameAr: 'محكمة الاستئناف التجارية',
      color: '#EF4444',
      order: 4,
      description: 'Appeal within 30 days',
      descriptionAr: 'الاستئناف خلال 30 يوم',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      description: 'Cassation review on legal matters',
      descriptionAr: 'النقض في المسائل القانونية',
      canEnd: true,
    },
    {
      id: 'execution',
      name: 'Execution',
      nameAr: 'التنفيذ',
      color: '#10B981',
      order: 6,
      description: 'Enforcement court execution',
      descriptionAr: 'تنفيذ الحكم عبر محكمة التنفيذ',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== CIVIL CASE PIPELINE ====================
// Based on Law of Procedure before Sharia Courts
export const civilCasePipeline: CasePipelineConfig = {
  caseType: 'civil',
  caseTypeAr: 'قضايا مدنية',
  notes: 'General courts handle civil matters. Reconciliation offices available in courts.',
  notesAr: 'المحاكم العامة تنظر في القضايا المدنية. مكاتب المصالحة متوفرة في المحاكم',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'رفع الدعوى',
      color: '#6366F1',
      order: 1,
      description: 'Statement of claim via Najiz',
      descriptionAr: 'صحيفة الدعوى عبر ناجز',
      canEnd: true,
    },
    {
      id: 'reconciliation',
      name: 'Reconciliation Office',
      nameAr: 'مكتب المصالحة',
      color: '#8B5CF6',
      order: 2,
      description: 'Optional reconciliation attempt',
      descriptionAr: 'محاولة المصالحة الاختيارية',
      canEnd: true,
    },
    {
      id: 'general_court',
      name: 'General Court',
      nameAr: 'المحكمة العامة',
      color: '#F59E0B',
      order: 3,
      description: 'General court first instance',
      descriptionAr: 'المحكمة العامة الابتدائية',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      description: 'Appeal within 30 days',
      descriptionAr: 'الاستئناف خلال 30 يوم',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      description: 'Supreme court review',
      descriptionAr: 'مراجعة المحكمة العليا',
      canEnd: true,
    },
    {
      id: 'execution',
      name: 'Execution',
      nameAr: 'التنفيذ',
      color: '#10B981',
      order: 6,
      description: 'Enforcement court execution',
      descriptionAr: 'تنفيذ الحكم',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== FAMILY CASE PIPELINE ====================
// Based on Personal Status Law and Family Courts procedures
export const familyCasePipeline: CasePipelineConfig = {
  caseType: 'family',
  caseTypeAr: 'قضايا أسرية',
  notes: 'Handles marriage, divorce, custody, alimony, inheritance. Reconciliation encouraged.',
  notesAr: 'تنظر في الزواج والطلاق والحضانة والنفقة والميراث. الإصلاح مستحسن',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'رفع الدعوى',
      color: '#6366F1',
      order: 1,
      description: 'Family case filing via Najiz',
      descriptionAr: 'رفع الدعوى الأسرية عبر ناجز',
      canEnd: true,
    },
    {
      id: 'reconciliation_committee',
      name: 'Reconciliation Committee',
      nameAr: 'لجنة الإصلاح',
      color: '#EC4899', // Pink
      order: 2,
      description: 'Family reconciliation attempt',
      descriptionAr: 'محاولة الإصلاح الأسري',
      canEnd: true,
    },
    {
      id: 'family_court',
      name: 'Family Court',
      nameAr: 'محكمة الأحوال الشخصية',
      color: '#F59E0B',
      order: 3,
      description: 'Personal status court hearing',
      descriptionAr: 'جلسة محكمة الأحوال الشخصية',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      description: 'Appeal within 30 days',
      descriptionAr: 'الاستئناف خلال 30 يوم',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      description: 'Supreme court review',
      descriptionAr: 'مراجعة المحكمة العليا',
      canEnd: true,
    },
    {
      id: 'execution',
      name: 'Execution',
      nameAr: 'التنفيذ',
      color: '#10B981',
      order: 6,
      description: 'Enforcement of family court orders',
      descriptionAr: 'تنفيذ أحكام المحكمة الأسرية',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== CRIMINAL CASE PIPELINE ====================
// Based on Law of Criminal Procedure
export const criminalCasePipeline: CasePipelineConfig = {
  caseType: 'criminal',
  caseTypeAr: 'قضايا جنائية',
  notes: 'Three panels: Qisas/Hudud, Ta\'zir, and Juvenile. Death sentences require Supreme Court review.',
  notesAr: 'ثلاث دوائر: القصاص والحدود، التعزير، والأحداث. أحكام الإعدام تحتاج مراجعة المحكمة العليا',
  stages: [
    {
      id: 'investigation',
      name: 'Investigation',
      nameAr: 'التحقيق',
      color: '#6366F1',
      order: 1,
      description: 'Bureau of Investigation and Prosecution',
      descriptionAr: 'هيئة التحقيق والادعاء العام',
      canEnd: true,
    },
    {
      id: 'prosecution',
      name: 'Prosecution',
      nameAr: 'النيابة العامة',
      color: '#8B5CF6',
      order: 2,
      description: 'Prosecution decision and charging',
      descriptionAr: 'قرار النيابة وتوجيه الاتهام',
      canEnd: true,
    },
    {
      id: 'criminal_court',
      name: 'Criminal Court',
      nameAr: 'المحكمة الجزائية',
      color: '#F59E0B',
      order: 3,
      description: 'Criminal court first instance (3-judge panel)',
      descriptionAr: 'المحكمة الجزائية الابتدائية (دائرة ثلاثية)',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Criminal Appeal Court',
      nameAr: 'محكمة الاستئناف الجزائية',
      color: '#EF4444',
      order: 4,
      description: 'Appeal within 30 days (5-judge panel)',
      descriptionAr: 'الاستئناف خلال 30 يوم (دائرة خماسية)',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      description: 'Mandatory for death/hudud sentences',
      descriptionAr: 'إلزامي لأحكام الإعدام والحدود',
      canEnd: true,
    },
    {
      id: 'execution',
      name: 'Sentence Execution',
      nameAr: 'تنفيذ العقوبة',
      color: '#10B981',
      order: 6,
      description: 'Criminal sentence enforcement',
      descriptionAr: 'تنفيذ العقوبة الجزائية',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== ADMINISTRATIVE CASE PIPELINE ====================
// Based on Board of Grievances (ديوان المظالم) procedures
export const administrativeCasePipeline: CasePipelineConfig = {
  caseType: 'administrative',
  caseTypeAr: 'قضايا إدارية',
  notes: 'Board of Grievances handles government disputes. Pre-litigation grievance is mandatory (60 days to file, 90 days response).',
  notesAr: 'ديوان المظالم ينظر في النزاعات الحكومية. التظلم الإداري إلزامي (60 يوم للتقديم، 90 يوم للرد)',
  stages: [
    {
      id: 'grievance',
      name: 'Administrative Grievance',
      nameAr: 'التظلم الإداري',
      color: '#6366F1',
      order: 1,
      description: 'Mandatory pre-litigation grievance (60 days)',
      descriptionAr: 'التظلم الإداري الإلزامي (60 يوم)',
      canEnd: true,
      isMandatory: true,
      maxDurationDays: 90,
    },
    {
      id: 'administrative_court',
      name: 'Administrative Court',
      nameAr: 'المحكمة الإدارية',
      color: '#F59E0B',
      order: 2,
      description: 'Board of Grievances first instance',
      descriptionAr: 'ديوان المظالم الدرجة الأولى',
      canEnd: true,
    },
    {
      id: 'admin_appeal',
      name: 'Administrative Appeal Court',
      nameAr: 'محكمة الاستئناف الإدارية',
      color: '#EF4444',
      order: 3,
      description: 'Administrative appeal within 30 days',
      descriptionAr: 'الاستئناف الإداري خلال 30 يوم',
      canEnd: true,
      maxDurationDays: 30,
    },
    {
      id: 'supreme_admin',
      name: 'High Administrative Court',
      nameAr: 'المحكمة الإدارية العليا',
      color: '#DC2626',
      order: 4,
      description: 'Highest administrative court',
      descriptionAr: 'أعلى محكمة إدارية',
      canEnd: true,
    },
    {
      id: 'execution',
      name: 'Execution',
      nameAr: 'التنفيذ',
      color: '#10B981',
      order: 5,
      description: 'Enforcement of administrative judgment',
      descriptionAr: 'تنفيذ الحكم الإداري',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== GENERIC CASE PIPELINE ====================
export const genericCasePipeline: CasePipelineConfig = {
  caseType: 'other',
  caseTypeAr: 'قضايا أخرى',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'تقديم الدعوى',
      color: '#6366F1',
      order: 1,
      canEnd: true,
    },
    {
      id: 'first_hearing',
      name: 'First Hearing',
      nameAr: 'الجلسة الأولى',
      color: '#8B5CF6',
      order: 2,
      canEnd: true,
    },
    {
      id: 'ongoing_hearings',
      name: 'Ongoing Hearings',
      nameAr: 'الجلسات المستمرة',
      color: '#F59E0B',
      order: 3,
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal',
      nameAr: 'الاستئناف',
      color: '#EF4444',
      order: 4,
      canEnd: true,
    },
    {
      id: 'final',
      name: 'Final Decision',
      nameAr: 'القرار النهائي',
      color: '#10B981',
      order: 5,
      isFinal: true,
      canEnd: true,
    },
  ],
}

// All pipelines by case type
export const casePipelines: Record<string, CasePipelineConfig> = {
  labor: laborCasePipeline,
  commercial: commercialCasePipeline,
  civil: civilCasePipeline,
  family: familyCasePipeline,
  criminal: criminalCasePipeline,
  administrative: administrativeCasePipeline,
  other: genericCasePipeline,
}

// Get pipeline for a case type
export function getCasePipeline(caseType: string): CasePipelineConfig {
  return casePipelines[caseType] || genericCasePipeline
}

// Get all case types with Arabic labels
export const caseTypes = [
  { value: 'labor', label: 'عمالي', labelEn: 'Labor' },
  { value: 'commercial', label: 'تجاري', labelEn: 'Commercial' },
  { value: 'civil', label: 'مدني', labelEn: 'Civil' },
  { value: 'family', label: 'أسري', labelEn: 'Family' },
  { value: 'criminal', label: 'جنائي', labelEn: 'Criminal' },
  { value: 'administrative', label: 'إداري', labelEn: 'Administrative' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

// Move case to next stage mutation data
export const moveCaseToStageSchema = z.object({
  caseId: z.string(),
  newStage: z.string(),
  notes: z.string().optional(),
})

export type MoveCaseToStageData = z.infer<typeof moveCaseToStageSchema>

// End case schema
export const endCaseSchema = z.object({
  caseId: z.string(),
  outcome: z.enum(['won', 'lost', 'settled']),
  endReason: z.string(),
  finalAmount: z.number().optional(),
  notes: z.string().optional(),
  endDate: z.string().optional(),
})

export type EndCaseData = z.infer<typeof endCaseSchema>
