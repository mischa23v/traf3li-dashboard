import { api } from '@/lib/api'

// Conflict Check Types
export type ConflictType =
  | 'client'
  | 'adverse_party'
  | 'related_party'
  | 'witness'
  | 'previous_representation'
  | 'business_relationship'
  | 'family_relationship'

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low'

export type ConflictStatus = 'pending' | 'cleared' | 'flagged' | 'waived'

// Conflict Check Request
export interface ConflictCheckRequest {
  entityType: 'client' | 'case' | 'matter'
  entityId?: string
  parties: ConflictParty[]
  includeRelatedParties: boolean
  searchScope: {
    activeClients: boolean
    formerClients: boolean
    adverseParties: boolean
    relatedParties: boolean
    contacts: boolean
    organizations: boolean
  }
}

export interface ConflictParty {
  name: string
  type: 'individual' | 'organization'
  aliases?: string[]
  identifiers?: {
    type: string
    value: string
  }[]
  relatedParties?: string[]
}

// Conflict Check Result
export interface ConflictCheckResult {
  _id: string
  requestId: string
  checkedAt: string
  checkedBy: string
  status: ConflictStatus
  totalMatches: number
  matches: ConflictMatch[]
  clearanceNotes?: string
  waiverDetails?: ConflictWaiver
  createdAt: string
  updatedAt: string
}

export interface ConflictMatch {
  _id: string
  partySearched: string
  matchedEntity: {
    id: string
    name: string
    type: 'client' | 'contact' | 'organization' | 'case_party'
    entityType: string
  }
  matchScore: number
  matchType: ConflictType
  severity: ConflictSeverity
  details: string
  relatedCases?: {
    caseId: string
    caseNumber: string
    caseName: string
    role: string
    status: string
  }[]
  relatedMatters?: {
    matterId: string
    matterNumber: string
    description: string
  }[]
  notes?: string
  resolution?: {
    status: 'cleared' | 'flagged' | 'waived'
    resolvedBy: string
    resolvedAt: string
    notes: string
  }
}

export interface ConflictWaiver {
  waivedBy: string
  waivedAt: string
  reason: string
  clientConsent: boolean
  consentDetails?: string
  expiresAt?: string
  attachments?: string[]
}

// Conflict Check History
export interface ConflictCheckHistory {
  _id: string
  entityType: 'client' | 'case' | 'matter'
  entityId: string
  entityName: string
  checkDate: string
  checkedBy: string
  status: ConflictStatus
  matchCount: number
  severity: ConflictSeverity | null
}

// API Response Types
export interface ConflictCheckListResponse {
  data: ConflictCheckHistory[]
  total: number
  page: number
  pageSize: number
}

// API Functions
export const conflictCheckService = {
  // Run a new conflict check
  runConflictCheck: async (request: ConflictCheckRequest): Promise<ConflictCheckResult> => {
    const response = await api.post('/conflict-checks', request)
    return response.data
  },

  // Get conflict check result by ID
  getConflictCheckResult: async (id: string): Promise<ConflictCheckResult> => {
    const response = await api.get(`/conflict-checks/${id}`)
    return response.data
  },

  // Get conflict check history
  getConflictCheckHistory: async (params?: {
    entityType?: 'client' | 'case' | 'matter'
    entityId?: string
    status?: ConflictStatus
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  }): Promise<ConflictCheckListResponse> => {
    const response = await api.get('/conflict-checks', { params })
    return response.data
  },

  // Update conflict match resolution
  resolveConflictMatch: async (
    checkId: string,
    matchId: string,
    resolution: {
      status: 'cleared' | 'flagged' | 'waived'
      notes: string
    }
  ): Promise<ConflictMatch> => {
    const response = await api.put(
      `/conflict-checks/${checkId}/matches/${matchId}/resolve`,
      resolution
    )
    return response.data
  },

  // Add conflict waiver
  addConflictWaiver: async (
    checkId: string,
    waiver: Omit<ConflictWaiver, 'waivedBy' | 'waivedAt'>
  ): Promise<ConflictCheckResult> => {
    const response = await api.post(`/conflict-checks/${checkId}/waiver`, waiver)
    return response.data
  },

  // Clear all matches in a conflict check
  clearConflictCheck: async (
    checkId: string,
    notes: string
  ): Promise<ConflictCheckResult> => {
    const response = await api.put(`/conflict-checks/${checkId}/clear`, { notes })
    return response.data
  },

  // Quick search for potential conflicts
  quickConflictSearch: async (
    name: string,
    type?: 'individual' | 'organization'
  ): Promise<ConflictMatch[]> => {
    const response = await api.get('/conflict-checks/quick-search', {
      params: { name, type },
    })
    return response.data
  },

  // Get conflict check for a specific entity
  getEntityConflictChecks: async (
    entityType: 'client' | 'case' | 'matter',
    entityId: string
  ): Promise<ConflictCheckResult[]> => {
    const response = await api.get(`/conflict-checks/entity/${entityType}/${entityId}`)
    return response.data
  },

  // Export conflict check report
  exportConflictReport: async (
    checkId: string,
    format: 'pdf' | 'docx'
  ): Promise<Blob> => {
    const response = await api.get(`/conflict-checks/${checkId}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },
}
