/**
 * Support Hooks
 * React Query hooks for Support/Helpdesk operations
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import supportService from '@/services/supportService'
import type { TicketFilters, CreateTicketData, ServiceLevelAgreement, SupportSettings } from '@/types/support'
import { invalidateCache } from '@/lib/cache-invalidation'

// Query Keys
export const supportKeys = {
  all: ['support'] as const,
  tickets: () => [...supportKeys.all, 'tickets'] as const,
  ticketList: (filters?: TicketFilters) => [...supportKeys.tickets(), { filters }] as const,
  ticketDetail: (id: string) => [...supportKeys.tickets(), id] as const,
  ticketCommunications: (id: string) => [...supportKeys.tickets(), id, 'communications'] as const,
  slas: () => [...supportKeys.all, 'slas'] as const,
  slaDetail: (id: string) => [...supportKeys.slas(), id] as const,
  stats: () => [...supportKeys.all, 'stats'] as const,
  settings: () => [...supportKeys.all, 'settings'] as const,
}

// Tickets
export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: supportKeys.ticketList(filters),
    queryFn: () => supportService.getTickets(filters),
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: supportKeys.ticketDetail(id),
    queryFn: () => supportService.getTicketById(id),
    enabled: !!id,
  })
}

export function useCreateTicket() {
  return useMutation({
    mutationFn: (data: CreateTicketData) => supportService.createTicket(data),
    onSuccess: () => {
      invalidateCache.support.tickets()
      toast.success('تم إنشاء التذكرة بنجاح | Ticket created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء التذكرة | Failed to create ticket')
    },
  })
}

export function useUpdateTicket() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTicketData> }) => supportService.updateTicket(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.support.tickets()
      invalidateCache.support.ticketDetail(id)
      toast.success('تم تحديث التذكرة بنجاح | Ticket updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث التذكرة | Failed to update ticket')
    },
  })
}

export function useDeleteTicket() {
  return useMutation({
    mutationFn: (id: string) => supportService.deleteTicket(id),
    onSuccess: () => {
      invalidateCache.support.tickets()
      toast.success('تم حذف التذكرة بنجاح | Ticket deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف التذكرة | Failed to delete ticket')
    },
  })
}

export function useUpdateTicketStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => supportService.updateTicketStatus(id, status as any),
    onSuccess: (_, { id }) => {
      invalidateCache.support.tickets()
      invalidateCache.support.ticketDetail(id)
      toast.success('تم تحديث حالة التذكرة | Ticket status updated')
    },
    onError: () => {
      toast.error('فشل تحديث الحالة | Failed to update status')
    },
  })
}

export function useAssignTicket() {
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => supportService.assignTicket(id, assignedTo),
    onSuccess: (_, { id }) => {
      invalidateCache.support.tickets()
      invalidateCache.support.ticketDetail(id)
      toast.success('تم تعيين التذكرة بنجاح | Ticket assigned successfully')
    },
    onError: () => {
      toast.error('فشل تعيين التذكرة | Failed to assign ticket')
    },
  })
}

// Ticket Communications
export function useTicketCommunications(ticketId: string) {
  return useQuery({
    queryKey: supportKeys.ticketCommunications(ticketId),
    queryFn: () => supportService.getTicketCommunications(ticketId),
    enabled: !!ticketId,
  })
}

export function useAddCommunication() {
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: { content: string; isInternal?: boolean } }) =>
      supportService.addTicketCommunication(ticketId, data),
    onSuccess: (_, { ticketId }) => {
      invalidateCache.support.ticketCommunications(ticketId)
      invalidateCache.support.ticketDetail(ticketId)
      toast.success('تم إضافة الرد بنجاح | Reply added successfully')
    },
    onError: () => {
      toast.error('فشل إضافة الرد | Failed to add reply')
    },
  })
}

// SLAs
export function useSLAs() {
  return useQuery({
    queryKey: supportKeys.slas(),
    queryFn: () => supportService.getSLAs(),
  })
}

export function useSLA(id: string) {
  return useQuery({
    queryKey: supportKeys.slaDetail(id),
    queryFn: () => supportService.getSLAById(id),
    enabled: !!id,
  })
}

export function useCreateSLA() {
  return useMutation({
    mutationFn: (data: Omit<ServiceLevelAgreement, '_id' | 'slaId' | 'createdAt' | 'updatedAt'>) => supportService.createSLA(data),
    onSuccess: () => {
      invalidateCache.support.slas()
      toast.success('تم إنشاء SLA بنجاح | SLA created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء SLA | Failed to create SLA')
    },
  })
}

export function useUpdateSLA() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceLevelAgreement> }) => supportService.updateSLA(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.support.slas()
      invalidateCache.support.slaDetail(id)
      toast.success('تم تحديث SLA بنجاح | SLA updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث SLA | Failed to update SLA')
    },
  })
}

export function useDeleteSLA() {
  return useMutation({
    mutationFn: (id: string) => supportService.deleteSLA(id),
    onSuccess: () => {
      invalidateCache.support.slas()
      toast.success('تم حذف SLA بنجاح | SLA deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف SLA | Failed to delete SLA')
    },
  })
}

// Stats
export function useSupportStats() {
  return useQuery({
    queryKey: supportKeys.stats(),
    queryFn: () => supportService.getSupportStats(),
  })
}

// Settings
export function useSupportSettings() {
  return useQuery({
    queryKey: supportKeys.settings(),
    queryFn: () => supportService.getSupportSettings(),
  })
}

export function useUpdateSupportSettings() {
  return useMutation({
    mutationFn: (data: Partial<SupportSettings>) => supportService.updateSupportSettings(data),
    onSuccess: () => {
      invalidateCache.support.settings()
      toast.success('تم تحديث الإعدادات بنجاح | Settings updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات | Failed to update settings')
    },
  })
}
