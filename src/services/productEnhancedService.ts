/**
 * Product Enhanced Service
 * Handles all enhanced Product/Service catalog API calls
 * Includes variants, barcodes, UoM, brands, suppliers, and advanced features
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'
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
  ProductBarcode,
  BarcodeSearchResult,
  UnitOfMeasure,
  CreateUomData,
  UpdateUomData,
  UomFilters,
  Brand,
  CreateBrandData,
  UpdateBrandData,
  BrandFilters,
  PaginatedResponse,
  ApiResponse,
} from '@/types/product-enhanced'

// ═══════════════════════════════════════════════════════════════
// PRODUCT ENHANCED SERVICE
// ═══════════════════════════════════════════════════════════════

export const productEnhancedService = {
  // ═══════════════════════════════════════════════════════════════
  // PRODUCT CRUD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all products with optional filters
   */
  getProducts: async (
    params?: ProductEnhancedFilters
  ): Promise<PaginatedResponse<ProductEnhanced>> => {
    try {
      const response = await apiClient.get('/products/enhanced', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single product by ID
   */
  getProduct: async (productId: string): Promise<ProductEnhanced> => {
    try {
      const response = await apiClient.get(`/products/enhanced/${productId}`)
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_NOT_FOUND')
    }
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductEnhancedData): Promise<ProductEnhanced> => {
    try {
      const response = await apiClient.post('/products/enhanced', data)
      return response.data.data || response.data.product
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_CREATE_FAILED')
    }
  },

  /**
   * Update existing product
   */
  updateProduct: async (
    productId: string,
    data: UpdateProductEnhancedData
  ): Promise<ProductEnhanced> => {
    try {
      const response = await apiClient.put(`/products/enhanced/${productId}`, data)
      return response.data.data || response.data.product
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_UPDATE_FAILED')
    }
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      await apiClient.delete(`/products/enhanced/${productId}`)
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_DELETE_FAILED')
    }
  },

  /**
   * Update cost price and recalculate margins
   */
  updateCostPrice: async (
    productId: string,
    costPrice: number
  ): Promise<ProductEnhanced> => {
    try {
      const response = await apiClient.patch(`/products/enhanced/${productId}/cost-price`, {
        costPrice,
      })
      return response.data.data || response.data.product
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_UPDATE_FAILED')
    }
  },

  /**
   * Calculate margin for product
   */
  calculateMargin: async (productId: string): Promise<{
    costPrice: number
    salePrice: number
    marginPercent: number
    markupPercent: number
  }> => {
    try {
      const response = await apiClient.get(`/products/enhanced/${productId}/margin`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Bulk update prices
   */
  bulkUpdatePrices: async (updates: Array<{
    productId: string
    basePrice?: number
    costPrice?: number
  }>): Promise<{ updated: number }> => {
    try {
      const response = await apiClient.post('/products/enhanced/bulk-update-prices', {
        updates,
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_UPDATE_FAILED')
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // VARIANT OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all variants for a product
   */
  getVariants: async (productId: string): Promise<ProductVariant[]> => {
    try {
      const response = await apiClient.get(`/products/enhanced/${productId}/variants`)
      return response.data.data || response.data.variants || []
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single variant
   */
  getVariant: async (productId: string, variantId: string): Promise<ProductVariant> => {
    try {
      const response = await apiClient.get(
        `/products/enhanced/${productId}/variants/${variantId}`
      )
      return response.data.data || response.data.variant
    } catch (error: any) {
      throwBilingualError(error, 'VARIANT_NOT_FOUND')
    }
  },

  /**
   * Create new variant
   */
  createVariant: async (data: CreateVariantData): Promise<ProductVariant> => {
    try {
      const { productId, ...variantData } = data
      const response = await apiClient.post(
        `/products/enhanced/${productId}/variants`,
        variantData
      )
      return response.data.data || response.data.variant
    } catch (error: any) {
      throwBilingualError(error, 'VARIANT_CREATE_FAILED')
    }
  },

  /**
   * Update variant
   */
  updateVariant: async (
    productId: string,
    variantId: string,
    data: UpdateVariantData
  ): Promise<ProductVariant> => {
    try {
      const response = await apiClient.put(
        `/products/enhanced/${productId}/variants/${variantId}`,
        data
      )
      return response.data.data || response.data.variant
    } catch (error: any) {
      throwBilingualError(error, 'VARIANT_UPDATE_FAILED')
    }
  },

  /**
   * Delete variant
   */
  deleteVariant: async (productId: string, variantId: string): Promise<void> => {
    try {
      await apiClient.delete(`/products/enhanced/${productId}/variants/${variantId}`)
    } catch (error: any) {
      throwBilingualError(error, 'VARIANT_DELETE_FAILED')
    }
  },

  /**
   * Auto-generate all variant combinations from attributes
   */
  generateVariants: async (data: GenerateVariantsData): Promise<ProductVariant[]> => {
    try {
      const { productId, attributes } = data
      const response = await apiClient.post(
        `/products/enhanced/${productId}/variants/generate`,
        { attributes }
      )
      return response.data.data || response.data.variants || []
    } catch (error: any) {
      throwBilingualError(error, 'VARIANT_GENERATE_FAILED')
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // BARCODE OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all barcodes for a product
   */
  getBarcodes: async (productId: string): Promise<ProductBarcode[]> => {
    try {
      const response = await apiClient.get(`/products/enhanced/${productId}/barcodes`)
      return response.data.data || response.data.barcodes || []
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Add barcode to product
   */
  addBarcode: async (data: CreateBarcodeData): Promise<ProductBarcode> => {
    try {
      const { productId, ...barcodeData } = data
      const response = await apiClient.post(
        `/products/enhanced/${productId}/barcodes`,
        barcodeData
      )
      return response.data.data || response.data.barcode
    } catch (error: any) {
      throwBilingualError(error, 'BARCODE_CREATE_FAILED')
    }
  },

  /**
   * Remove barcode from product
   */
  removeBarcode: async (productId: string, barcodeId: string): Promise<void> => {
    try {
      await apiClient.delete(`/products/enhanced/${productId}/barcodes/${barcodeId}`)
    } catch (error: any) {
      throwBilingualError(error, 'BARCODE_DELETE_FAILED')
    }
  },

  /**
   * Lookup product by barcode
   */
  lookupByBarcode: async (barcode: string): Promise<BarcodeSearchResult> => {
    try {
      const response = await apiClient.get('/products/enhanced/lookup/barcode', {
        params: { barcode },
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'BARCODE_NOT_FOUND')
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // UNIT OF MEASURE (UOM) OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all units of measure
   */
  getUnitsOfMeasure: async (params?: UomFilters): Promise<PaginatedResponse<UnitOfMeasure>> => {
    try {
      const response = await apiClient.get('/uom', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single UOM
   */
  getUnitOfMeasure: async (uomId: string): Promise<UnitOfMeasure> => {
    try {
      const response = await apiClient.get(`/uom/${uomId}`)
      return response.data.data || response.data.uom
    } catch (error: any) {
      throwBilingualError(error, 'UOM_NOT_FOUND')
    }
  },

  /**
   * Create new unit of measure
   */
  createUnitOfMeasure: async (data: CreateUomData): Promise<UnitOfMeasure> => {
    try {
      const response = await apiClient.post('/uom', data)
      return response.data.data || response.data.uom
    } catch (error: any) {
      throwBilingualError(error, 'UOM_CREATE_FAILED')
    }
  },

  /**
   * Update unit of measure
   */
  updateUnitOfMeasure: async (
    uomId: string,
    data: UpdateUomData
  ): Promise<UnitOfMeasure> => {
    try {
      const response = await apiClient.put(`/uom/${uomId}`, data)
      return response.data.data || response.data.uom
    } catch (error: any) {
      throwBilingualError(error, 'UOM_UPDATE_FAILED')
    }
  },

  /**
   * Delete unit of measure
   */
  deleteUnitOfMeasure: async (uomId: string): Promise<void> => {
    try {
      await apiClient.delete(`/uom/${uomId}`)
    } catch (error: any) {
      throwBilingualError(error, 'UOM_DELETE_FAILED')
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // BRAND OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all brands
   */
  getBrands: async (params?: BrandFilters): Promise<PaginatedResponse<Brand>> => {
    try {
      const response = await apiClient.get('/brands', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single brand
   */
  getBrand: async (brandId: string): Promise<Brand> => {
    try {
      const response = await apiClient.get(`/brands/${brandId}`)
      return response.data.data || response.data.brand
    } catch (error: any) {
      throwBilingualError(error, 'BRAND_NOT_FOUND')
    }
  },

  /**
   * Create new brand
   */
  createBrand: async (data: CreateBrandData): Promise<Brand> => {
    try {
      const response = await apiClient.post('/brands', data)
      return response.data.data || response.data.brand
    } catch (error: any) {
      throwBilingualError(error, 'BRAND_CREATE_FAILED')
    }
  },

  /**
   * Update brand
   */
  updateBrand: async (brandId: string, data: UpdateBrandData): Promise<Brand> => {
    try {
      const response = await apiClient.put(`/brands/${brandId}`, data)
      return response.data.data || response.data.brand
    } catch (error: any) {
      throwBilingualError(error, 'BRAND_UPDATE_FAILED')
    }
  },

  /**
   * Delete brand
   */
  deleteBrand: async (brandId: string): Promise<void> => {
    try {
      await apiClient.delete(`/brands/${brandId}`)
    } catch (error: any) {
      throwBilingualError(error, 'BRAND_DELETE_FAILED')
    }
  },
}

export default productEnhancedService
