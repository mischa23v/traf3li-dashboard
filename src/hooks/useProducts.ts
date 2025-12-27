/**
 * Product Hooks
 * React Query hooks for Product/Service catalog management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { productService } from '@/services/productService'
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
} from '@/types/crm-extended'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all products with optional filters
 */
export const useProducts = (params?: ProductFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.products.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single product by ID
 */
export const useProduct = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.products.detail(productId),
    queryFn: () => productService.getProduct(productId),
    enabled: !!productId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get available product categories
 */
export const useProductCategories = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.products.categories(),
    queryFn: () => productService.getCategories(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get product statistics
 */
export const useProductStats = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.products.stats(productId),
    queryFn: () => productService.getProductStats(productId),
    enabled: !!productId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductData) => productService.createProduct(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء المنتج بنجاح')

      // Manually update the cache with the REAL product from server
      queryClient.setQueriesData({ queryKey: ['products'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total, page, limit } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المنتج')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.products.all()
    },
  })
}

/**
 * Update product
 */
export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<Product> }) =>
      productService.updateProduct(productId, data),
    onSuccess: () => {
      toast.success('تم تحديث المنتج بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المنتج')
    },
    onSettled: async (_, __, { productId }) => {
      await invalidateCache.products.all()
      return await invalidateCache.products.detail(productId)
    },
  })
}

/**
 * Delete product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, productId) => {
      toast.success('تم حذف المنتج بنجاح')

      // Optimistically remove product from all lists
      queryClient.setQueriesData({ queryKey: ['products'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total, page, limit } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item.id !== productId),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item.id !== productId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المنتج')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.products.all()
    },
  })
}

/**
 * Duplicate product
 */
export const useDuplicateProduct = () => {
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string
      data?: { name?: string; nameAr?: string; code?: string }
    }) => productService.duplicateProduct(productId, data),
    onSuccess: () => {
      toast.success('تم نسخ المنتج بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ المنتج')
    },
    onSettled: async () => {
      return await invalidateCache.products.all()
    },
  })
}

/**
 * Toggle product active status
 */
export const useToggleProductActive = () => {
  return useMutation({
    mutationFn: (productId: string) => productService.toggleActive(productId),
    onSuccess: () => {
      toast.success('تم تحديث حالة المنتج بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة المنتج')
    },
    onSettled: async (_, __, productId) => {
      await invalidateCache.products.all()
      return await invalidateCache.products.detail(productId)
    },
  })
}
