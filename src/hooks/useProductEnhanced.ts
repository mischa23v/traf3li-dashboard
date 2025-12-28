/**
 * Product Enhanced Hooks
 * React Query hooks for enhanced Product/Service catalog management
 * Includes variants, barcodes, UoM, brands, and advanced features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { productEnhancedService } from '@/services/productEnhancedService'
import type {
  ProductEnhanced,
  CreateProductEnhancedData,
  UpdateProductEnhancedData,
  ProductEnhancedFilters,
  ProductVariant,
  CreateVariantData,
  UpdateVariantData,
  GenerateVariantsData,
  CreateBarcodeData,
  UnitOfMeasure,
  CreateUomData,
  UpdateUomData,
  UomFilters,
  Brand,
  CreateBrandData,
  UpdateBrandData,
  BrandFilters,
} from '@/types/product-enhanced'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes

// ═══════════════════════════════════════════════════════════════
// PRODUCT QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all enhanced products with optional filters
 */
export const useProductsEnhanced = (
  params?: ProductEnhancedFilters,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['products-enhanced', 'list', params],
    queryFn: () => productEnhancedService.getProducts(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single enhanced product by ID
 */
export const useProductEnhanced = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products-enhanced', 'detail', productId],
    queryFn: () => productEnhancedService.getProduct(productId),
    enabled: !!productId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Calculate margin for product
 */
export const useProductMargin = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products-enhanced', 'margin', productId],
    queryFn: () => productEnhancedService.calculateMargin(productId),
    enabled: !!productId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new enhanced product
 */
export const useCreateProductEnhanced = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductEnhancedData) =>
      productEnhancedService.createProduct(data),
    onSuccess: () => {
      toast.success('تم إنشاء المنتج بنجاح | Product created successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المنتج | Failed to create product')
    },
  })
}

/**
 * Update enhanced product
 */
export const useUpdateProductEnhanced = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string
      data: UpdateProductEnhancedData
    }) => productEnhancedService.updateProduct(productId, data),
    onSuccess: (_, { productId }) => {
      toast.success('تم تحديث المنتج بنجاح | Product updated successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced'] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المنتج | Failed to update product')
    },
  })
}

/**
 * Delete enhanced product
 */
export const useDeleteProductEnhanced = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productEnhancedService.deleteProduct(productId),
    onSuccess: () => {
      toast.success('تم حذف المنتج بنجاح | Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المنتج | Failed to delete product')
    },
  })
}

/**
 * Update cost price
 */
export const useUpdateCostPrice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, costPrice }: { productId: string; costPrice: number }) =>
      productEnhancedService.updateCostPrice(productId, costPrice),
    onSuccess: (_, { productId }) => {
      toast.success('تم تحديث سعر التكلفة | Cost price updated successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'margin', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث سعر التكلفة | Failed to update cost price')
    },
  })
}

/**
 * Bulk update prices
 */
export const useBulkUpdatePrices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      updates: Array<{ productId: string; basePrice?: number; costPrice?: number }>
    ) => productEnhancedService.bulkUpdatePrices(updates),
    onSuccess: (result) => {
      toast.success(`تم تحديث ${result.updated} منتج | ${result.updated} products updated`)
      queryClient.invalidateQueries({ queryKey: ['products-enhanced'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الأسعار | Failed to update prices')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// VARIANT QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all variants for a product
 */
export const useProductVariants = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products-enhanced', 'variants', productId],
    queryFn: () => productEnhancedService.getVariants(productId),
    enabled: !!productId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get single variant
 */
export const useProductVariant = (
  productId: string,
  variantId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['products-enhanced', 'variants', productId, variantId],
    queryFn: () => productEnhancedService.getVariant(productId, variantId),
    enabled: !!productId && !!variantId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// VARIANT MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new variant
 */
export const useCreateVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVariantData) => productEnhancedService.createVariant(data),
    onSuccess: (_, { productId }) => {
      toast.success('تم إنشاء المتغير بنجاح | Variant created successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'variants', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المتغير | Failed to create variant')
    },
  })
}

/**
 * Update variant
 */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string
      variantId: string
      data: UpdateVariantData
    }) => productEnhancedService.updateVariant(productId, variantId, data),
    onSuccess: (_, { productId, variantId }) => {
      toast.success('تم تحديث المتغير بنجاح | Variant updated successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'variants', productId] })
      queryClient.invalidateQueries({
        queryKey: ['products-enhanced', 'variants', productId, variantId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المتغير | Failed to update variant')
    },
  })
}

/**
 * Delete variant
 */
export const useDeleteVariant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productEnhancedService.deleteVariant(productId, variantId),
    onSuccess: (_, { productId }) => {
      toast.success('تم حذف المتغير بنجاح | Variant deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'variants', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المتغير | Failed to delete variant')
    },
  })
}

/**
 * Generate all variant combinations
 */
export const useGenerateVariants = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GenerateVariantsData) => productEnhancedService.generateVariants(data),
    onSuccess: (variants, { productId }) => {
      toast.success(
        `تم إنشاء ${variants.length} متغير بنجاح | ${variants.length} variants generated successfully`
      )
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'variants', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المتغيرات | Failed to generate variants')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// BARCODE QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all barcodes for a product
 */
export const useProductBarcodes = (productId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products-enhanced', 'barcodes', productId],
    queryFn: () => productEnhancedService.getBarcodes(productId),
    enabled: !!productId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Lookup product by barcode
 */
export const useLookupByBarcode = (barcode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['products-enhanced', 'barcode-lookup', barcode],
    queryFn: () => productEnhancedService.lookupByBarcode(barcode),
    enabled: !!barcode && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// BARCODE MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Add barcode to product
 */
export const useAddBarcode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBarcodeData) => productEnhancedService.addBarcode(data),
    onSuccess: (_, { productId }) => {
      toast.success('تم إضافة الباركود بنجاح | Barcode added successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'barcodes', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الباركود | Failed to add barcode')
    },
  })
}

/**
 * Remove barcode from product
 */
export const useRemoveBarcode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, barcodeId }: { productId: string; barcodeId: string }) =>
      productEnhancedService.removeBarcode(productId, barcodeId),
    onSuccess: (_, { productId }) => {
      toast.success('تم حذف الباركود بنجاح | Barcode removed successfully')
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'barcodes', productId] })
      queryClient.invalidateQueries({ queryKey: ['products-enhanced', 'detail', productId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الباركود | Failed to remove barcode')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// UOM QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all units of measure
 */
export const useUnitsOfMeasure = (params?: UomFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['uom', 'list', params],
    queryFn: () => productEnhancedService.getUnitsOfMeasure(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single unit of measure
 */
export const useUnitOfMeasure = (uomId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['uom', 'detail', uomId],
    queryFn: () => productEnhancedService.getUnitOfMeasure(uomId),
    enabled: !!uomId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// UOM MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new unit of measure
 */
export const useCreateUom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUomData) => productEnhancedService.createUnitOfMeasure(data),
    onSuccess: () => {
      toast.success('تم إنشاء وحدة القياس بنجاح | Unit of measure created successfully')
      queryClient.invalidateQueries({ queryKey: ['uom'] })
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'فشل إنشاء وحدة القياس | Failed to create unit of measure'
      )
    },
  })
}

/**
 * Update unit of measure
 */
export const useUpdateUom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uomId, data }: { uomId: string; data: UpdateUomData }) =>
      productEnhancedService.updateUnitOfMeasure(uomId, data),
    onSuccess: (_, { uomId }) => {
      toast.success('تم تحديث وحدة القياس بنجاح | Unit of measure updated successfully')
      queryClient.invalidateQueries({ queryKey: ['uom'] })
      queryClient.invalidateQueries({ queryKey: ['uom', 'detail', uomId] })
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'فشل تحديث وحدة القياس | Failed to update unit of measure'
      )
    },
  })
}

/**
 * Delete unit of measure
 */
export const useDeleteUom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uomId: string) => productEnhancedService.deleteUnitOfMeasure(uomId),
    onSuccess: () => {
      toast.success('تم حذف وحدة القياس بنجاح | Unit of measure deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['uom'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف وحدة القياس | Failed to delete unit of measure')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// BRAND QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all brands
 */
export const useBrands = (params?: BrandFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['brands', 'list', params],
    queryFn: () => productEnhancedService.getBrands(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single brand
 */
export const useBrand = (brandId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['brands', 'detail', brandId],
    queryFn: () => productEnhancedService.getBrand(brandId),
    enabled: !!brandId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// BRAND MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new brand
 */
export const useCreateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandData) => productEnhancedService.createBrand(data),
    onSuccess: () => {
      toast.success('تم إنشاء العلامة التجارية بنجاح | Brand created successfully')
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العلامة التجارية | Failed to create brand')
    },
  })
}

/**
 * Update brand
 */
export const useUpdateBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ brandId, data }: { brandId: string; data: UpdateBrandData }) =>
      productEnhancedService.updateBrand(brandId, data),
    onSuccess: (_, { brandId }) => {
      toast.success('تم تحديث العلامة التجارية بنجاح | Brand updated successfully')
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands', 'detail', brandId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العلامة التجارية | Failed to update brand')
    },
  })
}

/**
 * Delete brand
 */
export const useDeleteBrand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (brandId: string) => productEnhancedService.deleteBrand(brandId),
    onSuccess: () => {
      toast.success('تم حذف العلامة التجارية بنجاح | Brand deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العلامة التجارية | Failed to delete brand')
    },
  })
}
