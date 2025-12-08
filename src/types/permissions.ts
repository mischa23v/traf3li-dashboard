/**
 * Enterprise Permission System Types
 * Policy-based access control with Casbin/Keto/OPA inspired design
 */

// ==================== POLICY CONDITIONS ====================

export type ConditionOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'regex'
  | 'between' | 'exists' | 'not_exists'

export interface PolicyCondition {
  field: string
  operator: ConditionOperator
  value: any
  caseSensitive?: boolean
}

export interface TimeCondition {
  type: 'time_range' | 'day_of_week' | 'date_range' | 'business_hours'
  startTime?: string // HH:mm format
  endTime?: string
  days?: number[] // 0=Sunday, 6=Saturday
  startDate?: string // ISO date
  endDate?: string
  timezone?: string
}

export interface LocationCondition {
  type: 'ip_range' | 'country' | 'region' | 'office'
  values: string[]
  mode: 'allow' | 'deny'
}

export interface DeviceCondition {
  type: 'device_type' | 'os' | 'browser' | 'trusted_device'
  values: string[]
  mode: 'allow' | 'deny'
}

// ==================== POLICIES ====================

export type PolicyEffect = 'allow' | 'deny'
export type PolicyPriority = 'low' | 'medium' | 'high' | 'critical'

export interface PermissionPolicy {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  effect: PolicyEffect
  priority: PolicyPriority
  priorityOrder: number

  // What this policy applies to
  subjects: PolicySubject[]
  resources: PolicyResource[]
  actions: string[]

  // Conditions that must be met
  conditions?: {
    all?: PolicyCondition[] // AND conditions
    any?: PolicyCondition[] // OR conditions
    none?: PolicyCondition[] // NOT conditions
    time?: TimeCondition
    location?: LocationCondition
    device?: DeviceCondition
  }

  // Metadata
  isEnabled: boolean
  isSystem: boolean // System policies cannot be modified
  createdBy: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface PolicySubject {
  type: 'user' | 'role' | 'group' | 'department' | 'everyone'
  id?: string
  value?: string
}

export interface PolicyResource {
  type: 'module' | 'entity' | 'field' | 'action'
  module?: string
  entityType?: string
  entityId?: string // Specific entity or '*' for all
  field?: string
}

// ==================== RELATION TUPLES (Zanzibar/Keto Style) ====================

export type RelationType =
  | 'owner' | 'editor' | 'viewer' | 'commenter'
  | 'member' | 'admin' | 'manager'
  | 'parent' | 'child' | 'related'

export interface RelationTuple {
  id: string
  namespace: string // e.g., 'cases', 'documents', 'clients'
  object: string // e.g., 'case:123', 'document:456'
  relation: RelationType
  subjectType: 'user' | 'group' | 'role' | 'relation'
  subjectId: string
  subjectRelation?: string // For relation-based subjects

  // Metadata
  createdBy: string
  createdAt: string
  expiresAt?: string
  reason?: string
}

export interface RelationCheck {
  namespace: string
  object: string
  relation: RelationType
  subjectType: 'user' | 'group' | 'role'
  subjectId: string
}

export interface RelationExpansion {
  tuple: RelationTuple
  children?: RelationExpansion[]
  computedVia?: string // Which relation rule led to this
}

// ==================== DECISION LOGS ====================

export type DecisionResult = 'allow' | 'deny' | 'not_applicable'
export type DecisionReason =
  | 'policy_match' | 'relation_match' | 'role_permission'
  | 'no_matching_policy' | 'explicit_deny' | 'condition_failed'
  | 'expired' | 'disabled' | 'system_error'

export interface PermissionDecision {
  id: string
  timestamp: string

  // Request details
  userId: string
  userName?: string
  action: string
  resource: PolicyResource
  context: Record<string, any>

  // Decision
  result: DecisionResult
  reason: DecisionReason
  matchedPolicies: string[] // Policy IDs that matched
  matchedRelations: string[] // Relation tuple IDs that matched

  // Performance
  evaluationTimeMs: number
  cachehit: boolean

  // Additional info
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export interface DecisionLogFilters {
  userId?: string
  action?: string
  resourceType?: string
  result?: DecisionResult
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

// ==================== API RESPONSES ====================

export interface PolicyListResponse {
  success: boolean
  data: {
    policies: PermissionPolicy[]
    total: number
    page: number
    pageSize: number
  }
}

export interface PolicyResponse {
  success: boolean
  data: PermissionPolicy
}

export interface RelationTupleListResponse {
  success: boolean
  data: {
    tuples: RelationTuple[]
    total: number
  }
}

export interface CheckPermissionRequest {
  action: string
  resource: PolicyResource
  context?: Record<string, any>
}

export interface CheckPermissionResponse {
  success: boolean
  data: {
    allowed: boolean
    reason: DecisionReason
    matchedPolicies: string[]
    evaluationTimeMs: number
  }
}

export interface DecisionLogListResponse {
  success: boolean
  data: {
    decisions: PermissionDecision[]
    total: number
    page: number
    pageSize: number
  }
}

// ==================== CREATE/UPDATE DTOs ====================

export interface CreatePolicyData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  effect: PolicyEffect
  priority: PolicyPriority
  subjects: PolicySubject[]
  resources: PolicyResource[]
  actions: string[]
  conditions?: PermissionPolicy['conditions']
  isEnabled?: boolean
  expiresAt?: string
}

export interface UpdatePolicyData extends Partial<CreatePolicyData> {}

export interface CreateRelationTupleData {
  namespace: string
  object: string
  relation: RelationType
  subjectType: 'user' | 'group' | 'role' | 'relation'
  subjectId: string
  subjectRelation?: string
  expiresAt?: string
  reason?: string
}

// ==================== RESOURCE ACCESS ====================

export interface ResourceAccess {
  resourceType: string
  resourceId: string
  resourceName: string
  accessLevel: 'owner' | 'full' | 'edit' | 'view' | 'none'
  grantedVia: 'policy' | 'relation' | 'role' | 'direct'
  grantedBy?: string
  grantedAt: string
  expiresAt?: string
}

export interface UserResourceAccess {
  userId: string
  userName: string
  userEmail: string
  access: ResourceAccess[]
}

// ==================== PERMISSION SUMMARY ====================

export interface PermissionSummary {
  userId: string
  effectivePermissions: {
    module: string
    actions: {
      action: string
      allowed: boolean
      grantedVia: string
    }[]
  }[]
  activePolicies: number
  activeRelations: number
  lastEvaluated: string
}
