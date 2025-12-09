/**
 * Lead Management Hooks
 * TanStack Query hooks for lead/prospect management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  Lead,
  LeadFilters,
  CreateLeadData,
  LeadStage,
  LeadActivity,
} from '@/services/accountingService'

// ==================== QUERY KEYS ====================

export const leadKeys = {
  all: ['accounting'] as const,
  leads: () => [...leadKeys.all, 'leads'] as const,
  leadsList: (filters?: LeadFilters) => [...leadKeys.leads(), 'list', filters] as const,
  lead: (id: string) => [...leadKeys.leads(), id] as const,
  leadStats: () => [...leadKeys.leads(), 'stats'] as const,
}

// ==================== LEAD QUERY HOOKS ====================

/**
 * Fetch leads with optional filtering
 * @param filters - Optional filters for leads
 * @returns Query result with leads data
 */
export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: leadKeys.leadsList(filters),
    queryFn: () => accountingService.getLeads(filters),
  })
}

/**
 * Fetch a single lead by ID
 * @param id - Lead ID
 * @returns Query result with lead data
 */
export const useLead = (id: string) => {
  return useQuery({
    queryKey: leadKeys.lead(id),
    queryFn: () => accountingService.getLead(id),
    enabled: !!id,
  })
}

/**
 * Fetch lead statistics and metrics
 * @returns Query result with lead statistics
 */
export const useLeadStats = () => {
  return useQuery({
    queryKey: leadKeys.leadStats(),
    queryFn: accountingService.getLeadStats,
  })
}

// ==================== LEAD MUTATION HOOKS ====================

/**
 * Create a new lead
 * @returns Mutation for creating a lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadData) => accountingService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم إنشاء العميل المحتمل بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء العميل المحتمل')
    },
  })
}

/**
 * Update an existing lead
 * @returns Mutation for updating a lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadData> }) =>
      accountingService.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم تحديث العميل المحتمل')
    },
    onError: () => {
      toast.error('فشل في تحديث العميل المحتمل')
    },
  })
}

/**
 * Delete a lead
 * @returns Mutation for deleting a lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم حذف العميل المحتمل')
    },
    onError: () => {
      toast.error('فشل في حذف العميل المحتمل')
    },
  })
}

/**
 * Convert a lead to a client
 * @returns Mutation for converting a lead
 */
export const useConvertLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { createCase?: boolean; caseType?: string } }) =>
      accountingService.convertLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم تحويل العميل المحتمل إلى عميل فعلي')
    },
    onError: () => {
      toast.error('فشل في تحويل العميل المحتمل')
    },
  })
}

/**
 * Update lead stage in the sales pipeline
 * @returns Mutation for updating lead stage
 */
export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      accountingService.updateLeadStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم تحديث مرحلة العميل المحتمل')
    },
    onError: () => {
      toast.error('فشل في تحديث مرحلة العميل المحتمل')
    },
  })
}

/**
 * Add an activity to a lead
 * @returns Mutation for adding lead activity
 */
export const useAddLeadActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activity }: { id: string; activity: Omit<LeadActivity, '_id' | 'createdBy'> }) =>
      accountingService.addLeadActivity(id, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.leads() })
      toast.success('تم إضافة النشاط')
    },
    onError: () => {
      toast.error('فشل في إضافة النشاط')
    },
  })
}
