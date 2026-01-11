/**
 * Safe Toast Utilities
 *
 * ENTERPRISE PATTERN: Graceful degradation
 * Dynamic imports can fail (network error, CDN issue).
 * This utility handles failures gracefully with console fallback.
 */

import { AUTH_TIMING } from '@/constants/storage-keys'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  description?: string
  duration?: number
}

/**
 * Show a toast notification with graceful fallback
 * If sonner fails to load, falls back to console logging
 */
export const showToast = async (
  type: ToastType,
  message: string,
  options?: ToastOptions
): Promise<void> => {
  const duration = options?.duration ?? (type === 'error' ? AUTH_TIMING.TOAST_DURATION_ERROR : AUTH_TIMING.TOAST_DURATION_INFO)

  try {
    const { toast } = await import('sonner')
    toast[type](message, {
      description: options?.description,
      duration,
    })
  } catch (error) {
    // Fallback to console if toast library fails to load
    const logMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'
    console[logMethod](`[TOAST:${type.toUpperCase()}] ${message}`, options?.description || '')
  }
}

/**
 * Show error toast
 */
export const showErrorToast = (message: string, description?: string): Promise<void> => {
  return showToast('error', message, { description })
}

/**
 * Show info toast
 */
export const showInfoToast = (message: string, description?: string): Promise<void> => {
  return showToast('info', message, { description })
}

/**
 * Show warning toast
 */
export const showWarningToast = (message: string, description?: string): Promise<void> => {
  return showToast('warning', message, { description })
}

/**
 * Show success toast
 */
export const showSuccessToast = (message: string, description?: string): Promise<void> => {
  return showToast('success', message, { description })
}
