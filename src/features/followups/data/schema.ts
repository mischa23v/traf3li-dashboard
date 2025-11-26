import { z } from 'zod'

// Follow-up types
export const followupTypes = [
  'call',
  'email',
  'meeting',
  'court_date',
  'document_deadline',
  'payment_reminder',
  'general',
] as const

export type FollowupType = (typeof followupTypes)[number]

// Follow-up statuses
export const followupStatuses = ['pending', 'completed', 'cancelled', 'rescheduled'] as const

export type FollowupStatus = (typeof followupStatuses)[number]

// Follow-up priorities
export const followupPriorities = ['low', 'medium', 'high', 'urgent'] as const

export type FollowupPriority = (typeof followupPriorities)[number]

// Entity types
export const followupEntityTypes = ['case', 'client', 'contact', 'organization'] as const

export type FollowupEntityType = (typeof followupEntityTypes)[number]

// History entry schema
export const followupHistoryEntrySchema = z.object({
  _id: z.string(),
  action: z.enum(['created', 'updated', 'completed', 'cancelled', 'rescheduled', 'note_added']),
  note: z.string().optional(),
  previousDueDate: z.string().optional(),
  newDueDate: z.string().optional(),
  performedBy: z.union([
    z.string(),
    z.object({
      _id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    }),
  ]),
  performedAt: z.string(),
})

export type FollowupHistoryEntry = z.infer<typeof followupHistoryEntrySchema>

// Follow-up schema
export const followupSchema = z.object({
  _id: z.string(),
  lawyerId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(followupTypes),
  status: z.enum(followupStatuses).default('pending'),
  priority: z.enum(followupPriorities).default('medium'),
  dueDate: z.string(),
  dueTime: z.string().optional(),
  entityType: z.enum(followupEntityTypes),
  entityId: z.string(),
  entity: z
    .object({
      _id: z.string(),
      name: z.string().optional(),
      fullName: z.string().optional(),
      caseNumber: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
  assignedTo: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        avatar: z.string().optional(),
      }),
    ])
    .optional(),
  completedAt: z.string().optional(),
  completedBy: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      }),
    ])
    .optional(),
  completionNotes: z.string().optional(),
  recurring: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']),
      endDate: z.string().optional(),
    })
    .optional(),
  remindBefore: z.number().optional(),
  history: z.array(followupHistoryEntrySchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Followup = z.infer<typeof followupSchema>

// Create follow-up schema
export const createFollowupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(followupTypes),
  priority: z.enum(followupPriorities).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().optional(),
  entityType: z.enum(followupEntityTypes),
  entityId: z.string().min(1, 'Entity is required'),
  assignedTo: z.string().optional(),
  recurring: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly']),
      endDate: z.string().optional(),
    })
    .optional(),
  remindBefore: z.number().optional(),
})

export type CreateFollowupData = z.infer<typeof createFollowupSchema>

// Update follow-up schema
export const updateFollowupSchema = createFollowupSchema.partial().extend({
  status: z.enum(followupStatuses).optional(),
  completionNotes: z.string().optional(),
})

export type UpdateFollowupData = z.infer<typeof updateFollowupSchema>
