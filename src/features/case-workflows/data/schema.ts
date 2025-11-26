import { z } from 'zod'

/**
 * Stage Requirement Schema
 */
export const stageRequirementSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['document_upload', 'approval', 'payment', 'signature', 'review', 'task_completion']),
  name: z.string().min(1),
  description: z.string().optional(),
  isRequired: z.boolean(),
  order: z.number(),
})

export type StageRequirement = z.infer<typeof stageRequirementSchema>

/**
 * Workflow Stage Schema
 */
export const workflowStageSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  color: z.string(),
  order: z.number(),
  durationDays: z.number().optional(),
  requirements: z.array(stageRequirementSchema).default([]),
  autoTransition: z.boolean().default(false),
  notifyOnEntry: z.boolean().default(true),
  notifyOnExit: z.boolean().default(false),
  allowedActions: z.array(z.string()).default([]),
  isInitial: z.boolean().default(false),
  isFinal: z.boolean().default(false),
})

export type WorkflowStage = z.infer<typeof workflowStageSchema>

/**
 * Stage Transition Schema
 */
export const stageTransitionSchema = z.object({
  _id: z.string().optional(),
  fromStageId: z.string(),
  toStageId: z.string(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  requiresApproval: z.boolean().default(false),
  approverRoles: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
})

export type StageTransition = z.infer<typeof stageTransitionSchema>

/**
 * Workflow Template Schema
 */
export const workflowTemplateSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  caseCategory: z.string(),
  stages: z.array(workflowStageSchema).default([]),
  transitions: z.array(stageTransitionSchema).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WorkflowTemplate = z.infer<typeof workflowTemplateSchema>

/**
 * Stage History Entry Schema
 */
export const stageHistoryEntrySchema = z.object({
  _id: z.string().optional(),
  stageId: z.string(),
  stageName: z.string(),
  enteredAt: z.string(),
  exitedAt: z.string().optional(),
  completedBy: z.string().optional(),
  notes: z.string().optional(),
  duration: z.number().optional(),
})

export type StageHistoryEntry = z.infer<typeof stageHistoryEntrySchema>

/**
 * Completed Requirement Schema
 */
export const completedRequirementSchema = z.object({
  _id: z.string().optional(),
  stageId: z.string(),
  requirementId: z.string(),
  completedAt: z.string(),
  completedBy: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CompletedRequirement = z.infer<typeof completedRequirementSchema>

/**
 * Case Stage Progress Schema
 */
export const caseStageProgressSchema = z.object({
  _id: z.string(),
  caseId: z.string(),
  workflowId: z.string(),
  currentStageId: z.string(),
  stageHistory: z.array(stageHistoryEntrySchema).default([]),
  completedRequirements: z.array(completedRequirementSchema).default([]),
  startedAt: z.string(),
  completedAt: z.string().optional(),
})

export type CaseStageProgress = z.infer<typeof caseStageProgressSchema>
