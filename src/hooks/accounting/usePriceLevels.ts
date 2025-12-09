/**
 * Price Level Hooks
 * TanStack Query hooks for price level and billing rate management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  PriceLevel,
  CreatePriceLevelData,
} from '@/services/accountingService'

// ==================== QUERY KEYS ====================

export const priceLevelKeys = {
  all: ['accounting'] as const,
  priceLevels: () => [...priceLevelKeys.all, 'price-levels'] as const,
  priceLevelsList: () => [...priceLevelKeys.priceLevels(), 'list'] as const,
  priceLevel: (id: string) => [...priceLevelKeys.priceLevels(), id] as const,
  clientRate: (clientId: string, baseRate: number, serviceType?: string) =>
    [...priceLevelKeys.priceLevels(), 'client-rate', clientId, baseRate, serviceType] as const,
}

// ==================== PRICE LEVEL QUERY HOOKS ====================

/**
 * Fetch all price levels
 * @returns Query result with price levels data
 */
export const usePriceLevels = () => {
  return useQuery({
    queryKey: priceLevelKeys.priceLevelsList(),
    queryFn: accountingService.getPriceLevels,
  })
}

/**
 * Fetch a single price level by ID
 * @param id - Price Level ID
 * @returns Query result with price level data
 */
export const usePriceLevel = (id: string) => {
  return useQuery({
    queryKey: priceLevelKeys.priceLevel(id),
    queryFn: () => accountingService.getPriceLevel(id),
    enabled: !!id,
  })
}

/**
 * Calculate client rate based on price level
 * @param clientId - Client ID
 * @param baseRate - Base rate amount
 * @param serviceType - Optional service type
 * @returns Query result with calculated client rate
 */
export const useClientRate = (clientId: string, baseRate: number, serviceType?: string) => {
  return useQuery({
    queryKey: priceLevelKeys.clientRate(clientId, baseRate, serviceType),
    queryFn: () => accountingService.getClientRate(clientId, baseRate, serviceType),
    enabled: !!clientId && baseRate > 0,
  })
}

// ==================== PRICE LEVEL MUTATION HOOKS ====================

/**
 * Create a new price level
 * @returns Mutation for creating a price level
 */
export const useCreatePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePriceLevelData) => accountingService.createPriceLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceLevelKeys.priceLevels() })
      toast.success('تم إنشاء مستوى السعر بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء مستوى السعر')
    },
  })
}

/**
 * Update an existing price level
 * @returns Mutation for updating a price level
 */
export const useUpdatePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePriceLevelData> }) =>
      accountingService.updatePriceLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceLevelKeys.priceLevels() })
      toast.success('تم تحديث مستوى السعر')
    },
    onError: () => {
      toast.error('فشل في تحديث مستوى السعر')
    },
  })
}

/**
 * Delete a price level
 * @returns Mutation for deleting a price level
 */
export const useDeletePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deletePriceLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceLevelKeys.priceLevels() })
      toast.success('تم حذف مستوى السعر')
    },
    onError: () => {
      toast.error('فشل في حذف مستوى السعر')
    },
  })
}

/**
 * Set a price level as the default
 * @returns Mutation for setting default price level
 */
export const useSetDefaultPriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.setDefaultPriceLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceLevelKeys.priceLevels() })
      toast.success('تم تعيين المستوى الافتراضي')
    },
    onError: () => {
      toast.error('فشل في تعيين المستوى الافتراضي')
    },
  })
}
