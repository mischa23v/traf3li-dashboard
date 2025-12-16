/**
 * Analytics Integration Module
 *
 * Provides a unified interface for analytics tracking across the application.
 * Supports Google Analytics 4 (GA4) and custom event tracking.
 *
 * Setup:
 * 1. Add VITE_GA_MEASUREMENT_ID to your .env file
 * 2. The GA script will be loaded automatically if the ID is provided
 *
 * Usage:
 * import { trackEvent, trackPageView } from '@/lib/analytics'
 *
 * trackEvent('button_click', { button_name: 'submit_form' })
 * trackPageView('/dashboard')
 */

// Type definitions
interface EventParams {
  [key: string]: string | number | boolean | undefined
}

interface GTag {
  (command: 'config', targetId: string, params?: EventParams): void
  (command: 'event', eventName: string, params?: EventParams): void
  (command: 'set', params: EventParams): void
}

declare global {
  interface Window {
    gtag?: GTag
    dataLayer?: unknown[]
  }
}

// Get measurement ID from environment
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

// Track if analytics has been initialized
let isInitialized = false

/**
 * Initialize Google Analytics
 * Call this once when the app starts (e.g., in main.tsx)
 */
export function initAnalytics(): void {
  if (isInitialized || !GA_MEASUREMENT_ID) {
    if (!GA_MEASUREMENT_ID && import.meta.env.DEV) {
      console.debug('[Analytics] No GA_MEASUREMENT_ID provided, analytics disabled')
    }
    return
  }

  // Create script element
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  } as GTag

  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll track page views manually for SPA
  })

  isInitialized = true

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Initialized with ID:', GA_MEASUREMENT_ID)
  }
}

/**
 * Track a page view
 * Call this on route changes
 *
 * @param path - The page path (e.g., '/dashboard')
 * @param title - Optional page title
 */
export function trackPageView(path: string, title?: string): void {
  if (!isInitialized || !window.gtag) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Page view:', path)
  }
}

/**
 * Track a custom event
 *
 * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param params - Optional event parameters
 *
 * @example
 * trackEvent('case_created', { case_type: 'litigation', client_type: 'corporate' })
 * trackEvent('invoice_sent', { amount: 5000, currency: 'SAR' })
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (!isInitialized || !window.gtag) return

  window.gtag('event', eventName, params)

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Event:', eventName, params)
  }
}

/**
 * Track user identification (after login)
 *
 * @param userId - Unique user identifier (use hashed ID, not email)
 * @param userProperties - Optional user properties
 */
export function identifyUser(
  userId: string,
  userProperties?: {
    role?: string
    firm_id?: string
    plan?: string
  }
): void {
  if (!isInitialized || !window.gtag) return

  window.gtag('set', {
    user_id: userId,
    ...userProperties,
  })

  if (import.meta.env.DEV) {
    console.debug('[Analytics] User identified:', userId)
  }
}

/**
 * Clear user identification (on logout)
 */
export function clearUser(): void {
  if (!isInitialized || !window.gtag) return

  window.gtag('set', {
    user_id: undefined,
  })
}

// Pre-defined event helpers for common actions
export const Analytics = {
  // ==================== AUTHENTICATION ====================
  login: (method: string) => trackEvent('login', { method }),
  logout: () => trackEvent('logout'),
  signUp: (method: string, userType?: string) =>
    trackEvent('sign_up', { method, user_type: userType }),

  // ==================== CASE MANAGEMENT (Key Metric: Case Throughput) ====================
  caseCreated: (caseType: string, clientType?: string) =>
    trackEvent('case_created', {
      case_type: caseType,
      client_type: clientType,
      timestamp: Date.now()
    }),
  caseUpdated: (caseId: string, fieldsChanged?: string[]) =>
    trackEvent('case_updated', {
      case_id: caseId,
      fields_changed: fieldsChanged?.join(',')
    }),
  caseClosed: (caseId: string, outcome?: string, daysOpen?: number) =>
    trackEvent('case_closed', {
      case_id: caseId,
      outcome,
      days_to_close: daysOpen, // KEY METRIC: Case cycle time
      timestamp: Date.now()
    }),
  caseStatusChanged: (caseId: string, fromStatus: string, toStatus: string) =>
    trackEvent('case_status_changed', {
      case_id: caseId,
      from_status: fromStatus,
      to_status: toStatus
    }),

  // ==================== FINANCE (Key Metric: Revenue Per Case) ====================
  invoiceCreated: (amount: number, currency: string, caseId?: string) =>
    trackEvent('invoice_created', {
      amount,
      currency,
      case_id: caseId,
      timestamp: Date.now()
    }),
  invoiceSent: (amount: number, invoiceId?: string) =>
    trackEvent('invoice_sent', { amount, invoice_id: invoiceId }),
  paymentReceived: (amount: number, method: string, invoiceId?: string) =>
    trackEvent('payment_received', {
      amount,
      method,
      invoice_id: invoiceId,
      timestamp: Date.now()
    }),
  revenueByCase: (caseId: string, totalRevenue: number) =>
    trackEvent('case_revenue', { case_id: caseId, total_revenue: totalRevenue }),

  // ==================== USER ACTIVATION (Key Metric: Feature Adoption) ====================
  // Core actions that indicate active usage
  timeEntryLogged: (hours: number, caseId?: string) =>
    trackEvent('time_entry_logged', { hours, case_id: caseId }),
  documentUploaded: (fileType: string, caseId?: string) =>
    trackEvent('document_uploaded', { file_type: fileType, case_id: caseId }),
  documentDownloaded: (fileType: string) =>
    trackEvent('document_downloaded', { file_type: fileType }),
  clientMessageSent: (clientId: string) =>
    trackEvent('client_message_sent', { client_id: clientId }),
  hearingScheduled: (caseId: string) =>
    trackEvent('hearing_scheduled', { case_id: caseId }),
  taskCompleted: (taskId: string) =>
    trackEvent('task_completed', { task_id: taskId }),

  // ==================== FEATURE USAGE ====================
  featureUsed: (featureName: string, module?: string) =>
    trackEvent('feature_used', { feature_name: featureName, module }),
  moduleVisited: (moduleName: string) =>
    trackEvent('module_visited', { module_name: moduleName }),
  reportGenerated: (reportType: string) =>
    trackEvent('report_generated', { report_type: reportType }),

  // ==================== CLIENT ENGAGEMENT ====================
  clientCreated: (clientType: string) =>
    trackEvent('client_created', { client_type: clientType }),
  clientRetained: (clientId: string, casesCount: number) =>
    trackEvent('client_retained', { client_id: clientId, cases_count: casesCount }),

  // ==================== SEARCH & NAVIGATION ====================
  search: (query: string, resultsCount: number, module?: string) =>
    trackEvent('search', { search_term: query, results_count: resultsCount, module }),

  // ==================== ERRORS & PERFORMANCE ====================
  error: (errorType: string, errorMessage: string, context?: string) =>
    trackEvent('error', { error_type: errorType, error_message: errorMessage, context }),

  // ==================== CUSTOM METRICS ====================
  // Track any custom business metric
  trackMetric: (metricName: string, value: number, dimensions?: EventParams) =>
    trackEvent(`metric_${metricName}`, { value, ...dimensions }),
}
