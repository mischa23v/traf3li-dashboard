/**
 * Support/Helpdesk Types
 * Types for Tickets, SLAs, and Support Management
 */

import { z } from 'zod'

export type TicketStatus = 'open' | 'replied' | 'resolved' | 'closed' | 'on_hold'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketType = 'question' | 'problem' | 'feature_request' | 'incident' | 'service_request'
export type SlaStatus = 'within_sla' | 'warning' | 'breached'

export interface Ticket {
  _id: string
  ticketId: string
  ticketNumber: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  ticketType: TicketType
  raisedBy: string
  raisedByName?: string
  raisedByEmail?: string
  assignedTo?: string
  assignedToName?: string
  clientId?: string
  clientName?: string
  slaId?: string
  slaStatus?: SlaStatus
  firstResponseTime?: string
  resolutionTime?: string
  firstResponseDue?: string
  resolutionDue?: string
  communications?: TicketCommunication[]
  attachments?: { fileName: string; fileUrl: string; uploadedAt: string }[]
  tags?: string[]
  customFields?: Record<string, any>
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TicketCommunication {
  _id?: string
  communicationId: string
  ticketId: string
  sender: string
  senderName?: string
  senderType: 'customer' | 'agent' | 'system'
  content: string
  contentType?: 'text' | 'html'
  attachments?: { fileName: string; fileUrl: string }[]
  sentVia: 'email' | 'portal' | 'phone' | 'chat'
  isInternal?: boolean
  timestamp: string
}

export interface ServiceLevelAgreement {
  _id: string
  slaId: string
  name: string
  nameAr?: string
  priority: TicketPriority
  supportType?: string
  firstResponseMinutes: number
  resolutionMinutes: number
  workingHours?: { start: string; end: string }
  workingDays?: number[]
  holidays?: string[]
  isDefault: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface SupportSettings {
  _id: string
  defaultAssignee?: string
  ticketNamingSeries?: string
  closeAfterDays?: number
  autoCloseIfNoResponse?: boolean
  sendEmailOnTicketCreation?: boolean
  sendEmailOnStatusChange?: boolean
  defaultSlaId?: string
  updatedAt: string
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  ticketType?: TicketType
  assignedTo?: string
  raisedBy?: string
  clientId?: string
  slaStatus?: SlaStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SupportStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  averageResponseTime: number
  averageResolutionTime: number
  slaComplianceRate: number
  byStatus: Record<TicketStatus, number>
  byPriority: Record<TicketPriority, number>
}

export interface CreateTicketData {
  subject: string
  description: string
  priority?: TicketPriority
  ticketType?: TicketType
  clientId?: string
  assignedTo?: string
  slaId?: string
  tags?: string[]
}

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'الموضوع مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  ticketType: z.enum(['question', 'problem', 'feature_request', 'incident', 'service_request']).default('question'),
  clientId: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
