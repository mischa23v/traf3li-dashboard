/**
 * Expense Policies Hooks
 * TanStack Query hooks for expense policies operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import expensePoliciesService, {
  CreateExpensePolicyData,
  UpdateExpensePolicyData,
} from '@/services/expensePoliciesService'

// ==================== QUERIES ====================

export const useExpensePolicies = () => {
  return useQuery({
    queryKey: ['expense-policies'],
    queryFn: () => expensePoliciesService.getExpensePolicies(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useExpensePolicy = (id: string) => {
  return useQuery({
    queryKey: ['expense-policy', id],
    queryFn: () => expensePoliciesService.getExpensePolicy(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useDefaultExpensePolicy = () => {
  return useQuery({
    queryKey: ['expense-policy', 'default'],
    queryFn: () => expensePoliciesService.getDefaultPolicy(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

// ==================== MUTATIONS ====================

export const useCreateExpensePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpensePolicyData) =>
      expensePoliciesService.createExpensePolicy(data),
    onSuccess: (data) => {
      toast.success('Policy created successfully | تم إنشاء السياسة بنجاح')

      // Update cache
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: [data, ...old.policies],
            total: old.total + 1
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create policy | فشل إنشاء السياسة')
    },
    onSettled: async () => {
      await invalidateCache.expenses.policies()
    },
  })
}

export const useUpdateExpensePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePolicyData }) =>
      expensePoliciesService.updateExpensePolicy(id, data),
    onSuccess: (data, variables) => {
      toast.success('Policy updated successfully | تم تحديث السياسة بنجاح')

      // Update cache
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: old.policies.map((policy: any) =>
              policy._id === variables.id ? data : policy
            )
          }
        }
        return old
      })

      // Update single policy cache
      queryClient.setQueryData(['expense-policy', variables.id], data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update policy | فشل تحديث السياسة')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.expenses.policies()
      await invalidateCache.expenses.policy(variables.id)
    },
  })
}

export const useDeleteExpensePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expensePoliciesService.deleteExpensePolicy(id),
    onSuccess: (_, id) => {
      toast.success('Policy deleted successfully | تم حذف السياسة بنجاح')

      // Update cache
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: old.policies.filter((policy: any) => policy._id !== id),
            total: old.total - 1
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete policy | فشل حذف السياسة')
    },
    onSettled: async () => {
      await invalidateCache.expenses.policies()
    },
  })
}

export const useSetDefaultExpensePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expensePoliciesService.setDefaultPolicy(id),
    onSuccess: (data) => {
      toast.success('Default policy set successfully | تم تعيين السياسة الافتراضية بنجاح')

      // Update cache - set all to non-default except the selected one
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: old.policies.map((policy: any) => ({
              ...policy,
              isDefault: policy._id === data._id
            }))
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default policy | فشل تعيين السياسة الافتراضية')
    },
    onSettled: async () => {
      await invalidateCache.expenses.policies()
      await invalidateCache.expenses.defaultPolicy()
    },
  })
}

export const useTogglePolicyStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expensePoliciesService.togglePolicyStatus(id),
    onSuccess: (data) => {
      toast.success(
        data.isActive
          ? 'Policy activated successfully | تم تفعيل السياسة'
          : 'Policy deactivated successfully | تم تعطيل السياسة'
      )

      // Update cache
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: old.policies.map((policy: any) =>
              policy._id === data._id ? data : policy
            )
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle policy status | فشل تغيير حالة السياسة')
    },
    onSettled: async () => {
      await invalidateCache.expenses.policies()
    },
  })
}

export const useDuplicateExpensePolicy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName, newNameAr }: { id: string; newName: string; newNameAr: string }) =>
      expensePoliciesService.duplicatePolicy(id, newName, newNameAr),
    onSuccess: (data) => {
      toast.success('Policy duplicated successfully | تم نسخ السياسة بنجاح')

      // Update cache
      queryClient.setQueriesData({ queryKey: ['expense-policies'] }, (old: any) => {
        if (!old) return old
        if (old.policies && Array.isArray(old.policies)) {
          return {
            ...old,
            policies: [data, ...old.policies],
            total: old.total + 1
          }
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to duplicate policy | فشل نسخ السياسة')
    },
    onSettled: async () => {
      await invalidateCache.expenses.policies()
    },
  })
}

export const useCheckCompliance = () => {
  return useMutation({
    mutationFn: (claimId: string) => expensePoliciesService.checkCompliance(claimId),
    onSuccess: (data) => {
      if (data.compliant) {
        toast.success('Claim is compliant with policy | المطالبة متوافقة مع السياسة')
      } else {
        toast.warning(
          `Found ${data.violations.length} violations | تم العثور على ${data.violations.length} مخالفة`
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check compliance | فشل التحقق من التوافق')
    },
  })
}
