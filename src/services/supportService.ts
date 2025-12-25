/**
 * Support Service
 * API client for Support/Helpdesk operations
 */

import api from '@/lib/api'
import type {
  Ticket,
  TicketCommunication,
  ServiceLevelAgreement,
  SupportSettings,
  TicketFilters,
  SupportStats,
  CreateTicketData,
} from '@/types/support'

// Tickets
export const getTickets = async (filters?: TicketFilters) => {
  const response = await api.get<{ tickets: Ticket[]; total: number; page: number; limit: number }>('/support/tickets', { params: filters })
  return response.data
}

export const getTicketById = async (id: string) => {
  const response = await api.get<Ticket>(`/support/tickets/${id}`)
  return response.data
}

export const createTicket = async (data: CreateTicketData) => {
  const response = await api.post<Ticket>('/support/tickets', data)
  return response.data
}

export const updateTicket = async (id: string, data: Partial<CreateTicketData>) => {
  const response = await api.put<Ticket>(`/support/tickets/${id}`, data)
  return response.data
}

export const deleteTicket = async (id: string) => {
  const response = await api.delete(`/support/tickets/${id}`)
  return response.data
}

export const updateTicketStatus = async (id: string, status: Ticket['status']) => {
  const response = await api.patch<Ticket>(`/support/tickets/${id}/status`, { status })
  return response.data
}

export const assignTicket = async (id: string, assignedTo: string) => {
  const response = await api.patch<Ticket>(`/support/tickets/${id}/assign`, { assignedTo })
  return response.data
}

// Ticket Communications
export const getTicketCommunications = async (ticketId: string) => {
  const response = await api.get<TicketCommunication[]>(`/support/tickets/${ticketId}/communications`)
  return response.data
}

export const addTicketCommunication = async (ticketId: string, data: { content: string; isInternal?: boolean }) => {
  const response = await api.post<TicketCommunication>(`/support/tickets/${ticketId}/communications`, data)
  return response.data
}

// SLAs
export const getSLAs = async () => {
  const response = await api.get<ServiceLevelAgreement[]>('/support/slas')
  return response.data
}

export const getSLAById = async (id: string) => {
  const response = await api.get<ServiceLevelAgreement>(`/support/slas/${id}`)
  return response.data
}

export const createSLA = async (data: Omit<ServiceLevelAgreement, '_id' | 'slaId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<ServiceLevelAgreement>('/support/slas', data)
  return response.data
}

export const updateSLA = async (id: string, data: Partial<ServiceLevelAgreement>) => {
  const response = await api.put<ServiceLevelAgreement>(`/support/slas/${id}`, data)
  return response.data
}

export const deleteSLA = async (id: string) => {
  const response = await api.delete(`/support/slas/${id}`)
  return response.data
}

// Stats
export const getSupportStats = async () => {
  const response = await api.get<SupportStats>('/support/stats')
  return response.data
}

// Settings
export const getSupportSettings = async () => {
  const response = await api.get<SupportSettings>('/support/settings')
  return response.data
}

export const updateSupportSettings = async (data: Partial<SupportSettings>) => {
  const response = await api.put<SupportSettings>('/support/settings', data)
  return response.data
}

export const supportService = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
  getTicketCommunications,
  addTicketCommunication,
  getSLAs,
  getSLAById,
  createSLA,
  updateSLA,
  deleteSLA,
  getSupportStats,
  getSupportSettings,
  updateSupportSettings,
}

export default supportService
