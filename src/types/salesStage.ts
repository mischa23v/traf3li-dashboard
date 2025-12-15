/**
 * Sales Stage Type Definitions
 *
 * Defines the CRM pipeline stages for case/opportunity management.
 * Based on ERPNext CRM Sales Stage with law firm-specific enhancements.
 */

/**
 * Sales Stage Interface
 *
 * Represents a stage in the CRM pipeline (e.g., Intake, Qualified, Won)
 */
export interface SalesStage {
  _id: string
  name: string
  nameAr: string

  /**
   * Order of stage in pipeline (1, 2, 3, ...)
   * Lower numbers appear earlier in the pipeline
   */
  order: number

  /**
   * Default probability of winning at this stage (0-100)
   * Used for weighted pipeline calculations
   */
  defaultProbability: number

  /**
   * Stage type classification
   * - open: Active stage in pipeline
   * - won: Final success stage
   * - lost: Final failure stage
   */
  type: 'open' | 'won' | 'lost'

  /**
   * Color for UI display (hex format)
   * Used in pipeline visualizations, charts, and stage badges
   */
  color: string

  /**
   * Requires conflict check before moving to this stage
   * Ensures no conflicts of interest before proceeding
   */
  requiresConflictCheck?: boolean

  /**
   * Requires BANT qualification before moving to this stage
   * Ensures case is properly qualified (Budget, Authority, Need, Timeline)
   */
  requiresQualification?: boolean

  /**
   * Automatically create quote when case enters this stage
   * Streamlines proposal process
   */
  autoCreateQuote?: boolean

  /**
   * Stage is active and available for use
   */
  enabled: boolean

  createdAt: Date
  updatedAt: Date
}

/**
 * Default Sales Stages for Law Firm CRM
 *
 * Pre-configured pipeline stages following legal industry best practices:
 * 1. Intake - Initial case review
 * 2. Conflict Check - Verify no conflicts of interest
 * 3. Qualified - Case meets BANT criteria
 * 4. Proposal Sent - Quote/engagement letter sent
 * 5. Negotiation - Terms discussion
 * 6. Won - Case accepted, client onboarded
 * 7. Lost - Case declined or lost
 */
export const DEFAULT_SALES_STAGES: Omit<SalesStage, '_id' | 'enabled' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Intake',
    nameAr: 'الاستقبال',
    order: 1,
    defaultProbability: 10,
    color: '#6B7280', // gray-500
    type: 'open',
  },
  {
    name: 'Conflict Check',
    nameAr: 'فحص التعارض',
    order: 2,
    defaultProbability: 20,
    color: '#F59E0B', // amber-500
    type: 'open',
    requiresConflictCheck: true,
  },
  {
    name: 'Qualified',
    nameAr: 'مؤهل',
    order: 3,
    defaultProbability: 40,
    color: '#3B82F6', // blue-500
    type: 'open',
    requiresQualification: true,
  },
  {
    name: 'Proposal Sent',
    nameAr: 'تم إرسال العرض',
    order: 4,
    defaultProbability: 60,
    color: '#8B5CF6', // violet-500
    type: 'open',
  },
  {
    name: 'Negotiation',
    nameAr: 'التفاوض',
    order: 5,
    defaultProbability: 80,
    color: '#EC4899', // pink-500
    type: 'open',
  },
  {
    name: 'Won',
    nameAr: 'تم الفوز',
    order: 6,
    defaultProbability: 100,
    color: '#10B981', // green-500
    type: 'won',
  },
  {
    name: 'Lost',
    nameAr: 'خسارة',
    order: 7,
    defaultProbability: 0,
    color: '#EF4444', // red-500
    type: 'lost',
  },
]

/**
 * Type guard to check if a stage is an open/active stage
 */
export function isOpenStage(stage: SalesStage): boolean {
  return stage.type === 'open'
}

/**
 * Type guard to check if a stage is a won stage
 */
export function isWonStage(stage: SalesStage): boolean {
  return stage.type === 'won'
}

/**
 * Type guard to check if a stage is a lost stage
 */
export function isLostStage(stage: SalesStage): boolean {
  return stage.type === 'lost'
}

/**
 * Type guard to check if a stage is a final stage (won or lost)
 */
export function isFinalStage(stage: SalesStage): boolean {
  return stage.type === 'won' || stage.type === 'lost'
}
