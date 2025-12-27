/**
 * Product Service
 * Handles all Product/Service catalog API calls
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

interface ProductPricing {
  priceType: 'fixed' | 'range' | 'custom'
  basePrice: number
  minPrice?: number
  maxPrice?: number
  currency: string
}

interface ProductRecurring {
  interval: 'monthly' | 'quarterly' | 'yearly'
  trialDays?: number
  setupFee?: number
}

interface Product {
  id: string
  code: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: 'service' | 'product' | 'subscription' | 'retainer' | 'hourly'
  category?: string
  practiceArea?: string
  pricing: ProductPricing
  unit: string
  taxRate: number
  taxInclusive: boolean
  recurring?: ProductRecurring
  isActive: boolean
  tags: string[]
  statistics: {
    timesSold: number
    totalRevenue: number
  }
  createdAt: string
  updatedAt: string
}

interface ProductFilters {
  type?: string
  category?: string
  practiceArea?: string
  isActive?: boolean
  search?: string
  tags?: string
  priceType?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface CreateProductData {
  code: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: 'service' | 'product' | 'subscription' | 'retainer' | 'hourly'
  category?: string
  practiceArea?: string
  pricing: ProductPricing
  unit: string
  taxRate: number
  taxInclusive: boolean
  recurring?: ProductRecurring
  tags?: string[]
}

interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  totalRevenue: number
  topSellingProducts: Array<{
    productId: string
    productName: string
    timesSold: number
    revenue: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT SERVICE
// ═══════════════════════════════════════════════════════════════

export const productService = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (
    params?: ProductFilters
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get('/products', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single product by ID
   */
  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${productId}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_NOT_FOUND')
    }
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductData): Promise<Product> => {
    try {
      const response = await apiClient.post('/products', data)
      // Backend returns: { success, message, data: product }
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
    data: Partial<Product>
  ): Promise<Product> => {
    try {
      const response = await apiClient.put(`/products/${productId}`, data)
      // Backend returns: { success, message, data: product }
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
      await apiClient.delete(`/products/${productId}`)
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_DELETE_FAILED')
    }
  },

  /**
   * Duplicate product
   */
  duplicateProduct: async (
    productId: string,
    data?: { name?: string; nameAr?: string; code?: string }
  ): Promise<Product> => {
    try {
      const response = await apiClient.post(
        `/products/${productId}/duplicate`,
        data
      )
      // Backend returns: { success, message, data: product }
      return response.data.data || response.data.product
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_CREATE_FAILED')
    }
  },

  /**
   * Toggle product active status
   */
  toggleActive: async (productId: string): Promise<Product> => {
    try {
      const response = await apiClient.post(`/products/${productId}/toggle-active`)
      // Backend returns: { success, message, data: product }
      return response.data.data || response.data.product
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_UPDATE_FAILED')
    }
  },

  /**
   * Get available product categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/products/categories')
      return response.data.data || response.data.categories || []
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get product statistics
   */
  getProductStats: async (productId: string): Promise<{
    timesSold: number
    totalRevenue: number
    recentSales: Array<{
      date: string
      amount: number
      clientName: string
    }>
  }> => {
    try {
      const response = await apiClient.get(`/products/${productId}/stats`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'PRODUCT_NOT_FOUND')
    }
  },

  /**
   * Get overall product catalog statistics
   */
  getStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<ProductStats> => {
    try {
      const response = await apiClient.get('/products/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

export default productService
