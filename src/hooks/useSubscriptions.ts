/**
 * React Query hooks for Subscriptions
 *
 * @module hooks/useSubscriptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import subscriptionService from '@/services/subscriptionService';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
  SubscriptionPlanFilters,
  Subscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionFilters,
  ChangePlanData,
  ConsumeHoursData,
} from '@/features/subscriptions/types/subscription-types';
import { CACHE_TIMES } from '@/config/cache';

// ==================== QUERY KEYS ====================

export const subscriptionQueryKeys = {
  // Plans
  plans: {
    all: () => ['subscription-plans'] as const,
    lists: () => [...subscriptionQueryKeys.plans.all(), 'list'] as const,
    list: (filters?: SubscriptionPlanFilters) => [...subscriptionQueryKeys.plans.lists(), filters] as const,
    details: () => [...subscriptionQueryKeys.plans.all(), 'detail'] as const,
    detail: (id: string) => [...subscriptionQueryKeys.plans.details(), id] as const,
  },
  // Subscriptions
  subscriptions: {
    all: () => ['subscriptions'] as const,
    lists: () => [...subscriptionQueryKeys.subscriptions.all(), 'list'] as const,
    list: (filters?: SubscriptionFilters) => [...subscriptionQueryKeys.subscriptions.lists(), filters] as const,
    details: () => [...subscriptionQueryKeys.subscriptions.all(), 'detail'] as const,
    detail: (id: string) => [...subscriptionQueryKeys.subscriptions.details(), id] as const,
    hoursUsage: (id: string) => [...subscriptionQueryKeys.subscriptions.detail(id), 'hours-usage'] as const,
    invoices: (id: string) => [...subscriptionQueryKeys.subscriptions.detail(id), 'invoices'] as const,
    upcomingInvoice: (id: string) => [...subscriptionQueryKeys.subscriptions.detail(id), 'upcoming-invoice'] as const,
    renewalPreview: (id: string) => [...subscriptionQueryKeys.subscriptions.detail(id), 'renewal-preview'] as const,
    stats: () => [...subscriptionQueryKeys.subscriptions.all(), 'stats'] as const,
    upcomingRenewals: (days?: number) => [...subscriptionQueryKeys.subscriptions.all(), 'upcoming-renewals', days] as const,
    pastDue: () => [...subscriptionQueryKeys.subscriptions.all(), 'past-due'] as const,
    byClient: (clientId: string) => [...subscriptionQueryKeys.subscriptions.all(), 'client', clientId] as const,
    byCase: (caseId: string) => [...subscriptionQueryKeys.subscriptions.all(), 'case', caseId] as const,
  },
};

// ==================== SUBSCRIPTION PLANS HOOKS ====================

/**
 * Get all subscription plans
 */
export function useSubscriptionPlans(filters?: SubscriptionPlanFilters) {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans.list(filters),
    queryFn: () => subscriptionService.plans.getAll(filters),
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Get subscription plan by ID
 */
export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans.detail(id),
    queryFn: () => subscriptionService.plans.getById(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Create subscription plan
 */
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanData) => subscriptionService.plans.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.all() });
      toast.success('تم إنشاء الخطة بنجاح | Plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إنشاء الخطة | Failed to create plan');
    },
  });
}

/**
 * Update subscription plan
 */
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanData }) =>
      subscriptionService.plans.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.detail(id) });
      toast.success('تم تحديث الخطة بنجاح | Plan updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تحديث الخطة | Failed to update plan');
    },
  });
}

/**
 * Delete subscription plan
 */
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.plans.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.all() });
      toast.success('تم حذف الخطة بنجاح | Plan deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل حذف الخطة | Failed to delete plan');
    },
  });
}

/**
 * Duplicate subscription plan
 */
export function useDuplicateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, nameAr }: { id: string; name: string; nameAr?: string }) =>
      subscriptionService.plans.duplicate(id, name, nameAr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.all() });
      toast.success('تم نسخ الخطة بنجاح | Plan duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل نسخ الخطة | Failed to duplicate plan');
    },
  });
}

/**
 * Toggle plan active status
 */
export function useToggleSubscriptionPlanActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.plans.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.plans.detail(id) });
      toast.success('تم تحديث حالة الخطة | Plan status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تحديث حالة الخطة | Failed to update plan status');
    },
  });
}

// ==================== SUBSCRIPTIONS HOOKS ====================

/**
 * Get all subscriptions
 */
export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.list(filters),
    queryFn: () => subscriptionService.getAll(filters),
    staleTime: CACHE_TIMES.SHORT,
  });
}

/**
 * Get subscription by ID
 */
export function useSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.detail(id),
    queryFn: () => subscriptionService.getById(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.SHORT,
  });
}

/**
 * Create subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionData) => subscriptionService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      if (variables.clientId) {
        queryClient.invalidateQueries({
          queryKey: subscriptionQueryKeys.subscriptions.byClient(variables.clientId),
        });
      }
      toast.success('تم إنشاء الاشتراك بنجاح | Subscription created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إنشاء الاشتراك | Failed to create subscription');
    },
  });
}

/**
 * Update subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionData }) =>
      subscriptionService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم تحديث الاشتراك بنجاح | Subscription updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تحديث الاشتراك | Failed to update subscription');
    },
  });
}

/**
 * Delete subscription
 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم حذف الاشتراك بنجاح | Subscription deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل حذف الاشتراك | Failed to delete subscription');
    },
  });
}

// ==================== SUBSCRIPTION ACTIONS HOOKS ====================

/**
 * Activate subscription
 */
export function useActivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم تفعيل الاشتراك بنجاح | Subscription activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تفعيل الاشتراك | Failed to activate subscription');
    },
  });
}

/**
 * Pause subscription
 */
export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      subscriptionService.pause(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم إيقاف الاشتراك مؤقتاً | Subscription paused successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إيقاف الاشتراك | Failed to pause subscription');
    },
  });
}

/**
 * Resume subscription
 */
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم استئناف الاشتراك بنجاح | Subscription resumed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل استئناف الاشتراك | Failed to resume subscription');
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, atPeriodEnd }: { id: string; reason?: string; atPeriodEnd?: boolean }) =>
      subscriptionService.cancel(id, reason, atPeriodEnd),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم إلغاء الاشتراك بنجاح | Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إلغاء الاشتراك | Failed to cancel subscription');
    },
  });
}

/**
 * Renew subscription
 */
export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.renew(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم تجديد الاشتراك بنجاح | Subscription renewed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تجديد الاشتراك | Failed to renew subscription');
    },
  });
}

/**
 * Change subscription plan
 */
export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePlanData }) =>
      subscriptionService.changePlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.all() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.stats() });
      toast.success('تم تغيير الخطة بنجاح | Plan changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تغيير الخطة | Failed to change plan');
    },
  });
}

// ==================== HOURS TRACKING HOOKS ====================

/**
 * Get hours usage for subscription
 */
export function useSubscriptionHoursUsage(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.hoursUsage(id),
    queryFn: () => subscriptionService.getHoursUsage(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.SHORT,
  });
}

/**
 * Consume hours on subscription
 */
export function useConsumeSubscriptionHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConsumeHoursData }) =>
      subscriptionService.consumeHours(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.hoursUsage(id) });
      toast.success('تم تسجيل الساعات بنجاح | Hours recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تسجيل الساعات | Failed to record hours');
    },
  });
}

// ==================== INVOICING HOOKS ====================

/**
 * Get invoices for subscription
 */
export function useSubscriptionInvoices(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.invoices(id),
    queryFn: () => subscriptionService.getInvoices(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Generate invoice for subscription
 */
export function useGenerateSubscriptionInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.generateInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptions.invoices(id) });
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Also invalidate main invoices
      toast.success('تم إنشاء الفاتورة بنجاح | Invoice generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إنشاء الفاتورة | Failed to generate invoice');
    },
  });
}

/**
 * Get upcoming invoice preview
 */
export function useSubscriptionUpcomingInvoice(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.upcomingInvoice(id),
    queryFn: () => subscriptionService.getUpcomingInvoice(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.SHORT,
  });
}

/**
 * Get renewal preview
 */
export function useSubscriptionRenewalPreview(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.renewalPreview(id),
    queryFn: () => subscriptionService.getRenewalPreview(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.SHORT,
  });
}

// ==================== STATISTICS HOOKS ====================

/**
 * Get subscription statistics
 */
export function useSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.stats(),
    queryFn: () => subscriptionService.getStats(),
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Get upcoming renewals
 */
export function useUpcomingRenewals(days: number = 30) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.upcomingRenewals(days),
    queryFn: () => subscriptionService.getUpcomingRenewals(days),
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Get past due subscriptions
 */
export function usePastDueSubscriptions() {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.pastDue(),
    queryFn: () => subscriptionService.getPastDue(),
    staleTime: CACHE_TIMES.SHORT,
  });
}

/**
 * Get subscriptions by client
 */
export function useSubscriptionsByClient(clientId: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.byClient(clientId),
    queryFn: () => subscriptionService.getByClient(clientId),
    enabled: !!clientId,
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

/**
 * Get subscriptions by case
 */
export function useSubscriptionsByCase(caseId: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscriptions.byCase(caseId),
    queryFn: () => subscriptionService.getByCase(caseId),
    enabled: !!caseId,
    staleTime: CACHE_TIMES.MEDIUM,
  });
}

// Alias for shorter name
export const useTogglePlanActive = useToggleSubscriptionPlanActive;
