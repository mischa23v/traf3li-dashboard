/**
 * Case Pipeline Types and Configuration
 * Defines stages for different case types in the legal workflow
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
}

// Case Pipeline Configuration by Case Type
export interface CasePipelineConfig {
  caseType: string
  caseTypeAr: string
  stages: CasePipelineStage[]
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
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

// ==================== LABOR CASE PIPELINE ====================
export const laborCasePipeline: CasePipelineConfig = {
  caseType: 'labor',
  caseTypeAr: 'قضايا عمالية',
  stages: [
    {
      id: 'filing',
      name: 'Filing',
      nameAr: 'تقديم الدعوى',
      color: '#6366F1', // Indigo
      order: 1,
      description: 'Case filing and initial documentation',
      descriptionAr: 'تقديم الدعوى والوثائق الأولية',
      canEnd: true,
    },
    {
      id: 'friendly_settlement_1',
      name: 'Friendly Settlement - First Hearing',
      nameAr: 'التسوية الودية - الجلسة الأولى',
      color: '#8B5CF6', // Purple
      order: 2,
      description: 'First friendly settlement hearing',
      descriptionAr: 'الجلسة الأولى للتسوية الودية',
      canEnd: true,
    },
    {
      id: 'friendly_settlement_2',
      name: 'Friendly Settlement - Second Hearing',
      nameAr: 'التسوية الودية - الجلسة الثانية',
      color: '#A855F7', // Violet
      order: 3,
      description: 'Second friendly settlement hearing',
      descriptionAr: 'الجلسة الثانية للتسوية الودية',
      canEnd: true,
    },
    {
      id: 'first_instance',
      name: 'First Instance Court',
      nameAr: 'المحكمة الابتدائية',
      color: '#F59E0B', // Amber
      order: 4,
      description: 'Labor court first instance hearing',
      descriptionAr: 'المحكمة العمالية الابتدائية',
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444', // Red
      order: 5,
      description: 'Appeal court proceedings',
      descriptionAr: 'إجراءات محكمة الاستئناف',
      canEnd: true,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626', // Dark Red
      order: 6,
      description: 'Supreme court final ruling',
      descriptionAr: 'الحكم النهائي للمحكمة العليا',
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== COMMERCIAL CASE PIPELINE ====================
export const commercialCasePipeline: CasePipelineConfig = {
  caseType: 'commercial',
  caseTypeAr: 'قضايا تجارية',
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
      id: 'mediation',
      name: 'Mediation',
      nameAr: 'الوساطة',
      color: '#8B5CF6',
      order: 2,
      canEnd: true,
    },
    {
      id: 'first_instance',
      name: 'Commercial Court',
      nameAr: 'المحكمة التجارية',
      color: '#F59E0B',
      order: 3,
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      canEnd: true,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== CIVIL CASE PIPELINE ====================
export const civilCasePipeline: CasePipelineConfig = {
  caseType: 'civil',
  caseTypeAr: 'قضايا مدنية',
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
      id: 'reconciliation',
      name: 'Reconciliation',
      nameAr: 'مكتب المصالحة',
      color: '#8B5CF6',
      order: 2,
      canEnd: true,
    },
    {
      id: 'first_instance',
      name: 'General Court',
      nameAr: 'المحكمة العامة',
      color: '#F59E0B',
      order: 3,
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      canEnd: true,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== FAMILY CASE PIPELINE ====================
export const familyCasePipeline: CasePipelineConfig = {
  caseType: 'family',
  caseTypeAr: 'قضايا أسرية',
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
      id: 'reconciliation',
      name: 'Reconciliation Committee',
      nameAr: 'لجنة الإصلاح',
      color: '#EC4899', // Pink
      order: 2,
      canEnd: true,
    },
    {
      id: 'family_court',
      name: 'Family Court',
      nameAr: 'محكمة الأحوال الشخصية',
      color: '#F59E0B',
      order: 3,
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      canEnd: true,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== CRIMINAL CASE PIPELINE ====================
export const criminalCasePipeline: CasePipelineConfig = {
  caseType: 'criminal',
  caseTypeAr: 'قضايا جنائية',
  stages: [
    {
      id: 'investigation',
      name: 'Investigation',
      nameAr: 'التحقيق',
      color: '#6366F1',
      order: 1,
      canEnd: true,
    },
    {
      id: 'prosecution',
      name: 'Prosecution',
      nameAr: 'النيابة العامة',
      color: '#8B5CF6',
      order: 2,
      canEnd: true,
    },
    {
      id: 'criminal_court',
      name: 'Criminal Court',
      nameAr: 'المحكمة الجزائية',
      color: '#F59E0B',
      order: 3,
      canEnd: true,
    },
    {
      id: 'appeal',
      name: 'Appeal Court',
      nameAr: 'محكمة الاستئناف',
      color: '#EF4444',
      order: 4,
      canEnd: true,
    },
    {
      id: 'supreme',
      name: 'Supreme Court',
      nameAr: 'المحكمة العليا',
      color: '#DC2626',
      order: 5,
      isFinal: true,
      canEnd: true,
    },
  ],
}

// ==================== ADMINISTRATIVE CASE PIPELINE ====================
export const administrativeCasePipeline: CasePipelineConfig = {
  caseType: 'administrative',
  caseTypeAr: 'قضايا إدارية',
  stages: [
    {
      id: 'grievance',
      name: 'Grievance',
      nameAr: 'التظلم',
      color: '#6366F1',
      order: 1,
      canEnd: true,
    },
    {
      id: 'administrative_court',
      name: 'Administrative Court',
      nameAr: 'المحكمة الإدارية',
      color: '#F59E0B',
      order: 2,
      canEnd: true,
    },
    {
      id: 'admin_appeal',
      name: 'Administrative Appeal Court',
      nameAr: 'محكمة الاستئناف الإدارية',
      color: '#EF4444',
      order: 3,
      canEnd: true,
    },
    {
      id: 'supreme_admin',
      name: 'Supreme Administrative Court',
      nameAr: 'المحكمة الإدارية العليا',
      color: '#DC2626',
      order: 4,
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
