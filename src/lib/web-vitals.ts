/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals metrics for performance monitoring:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Integrates with Google Analytics and Sentry for reporting.
 */

import { trackEvent } from './analytics'
import { captureException } from './sentry'

// Web Vitals metric types
interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender'
}

// Thresholds for Core Web Vitals (Google's recommendations)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

/**
 * Get the rating for a metric value
 */
function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = THRESHOLDS[name]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report a Web Vitals metric to analytics
 */
function reportMetric(metric: WebVitalsMetric): void {
  const { name, value, rating, delta, id, navigationType } = metric

  // Track to Google Analytics
  trackEvent('web_vitals', {
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value), // CLS is unitless, others are ms
    metric_rating: rating,
    metric_delta: Math.round(delta),
    metric_id: id,
    navigation_type: navigationType,
  })

  // Log poor metrics to Sentry for investigation
  if (rating === 'poor') {
    captureException(new Error(`Poor Web Vital: ${name}`), {
      tags: { webVital: name, rating },
      extra: { value, delta, navigationType },
    })
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    const style = rating === 'good'
      ? 'color: green'
      : rating === 'needs-improvement'
        ? 'color: orange'
        : 'color: red'
    console.log(`%c[Web Vitals] ${name}: ${value.toFixed(2)} (${rating})`, style)
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once when the app starts (in main.tsx)
 */
export async function initWebVitals(): Promise<void> {
  try {
    // Dynamically import web-vitals library
    const { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } = await import('web-vitals')

    // Create handler that adds rating
    const handleMetric = (metric: { name: string; value: number; delta: number; id: string; navigationType?: string }) => {
      const name = metric.name as WebVitalsMetric['name']
      reportMetric({
        name,
        value: metric.value,
        rating: getRating(name, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: (metric.navigationType || 'navigate') as WebVitalsMetric['navigationType'],
      })
    }

    // Register all Core Web Vitals
    onCLS(handleMetric)
    onFCP(handleMetric)
    onFID(handleMetric)
    onINP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)

    if (import.meta.env.DEV) {
      console.log('[Web Vitals] Monitoring initialized')
    }
  } catch (error) {
    // web-vitals library might not be installed
    if (import.meta.env.DEV) {
      console.warn('[Web Vitals] Could not initialize monitoring:', error)
    }
  }
}

/**
 * Get current performance metrics
 * Useful for displaying in a performance dashboard
 */
export function getPerformanceMetrics(): Record<string, number> {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const paint = performance.getEntriesByType('paint')

  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')

  return {
    // Navigation timing
    dns: navigation?.domainLookupEnd ? navigation.domainLookupEnd - navigation.domainLookupStart : 0,
    tcp: navigation?.connectEnd ? navigation.connectEnd - navigation.connectStart : 0,
    ttfb: navigation?.responseStart ? navigation.responseStart - navigation.requestStart : 0,
    download: navigation?.responseEnd ? navigation.responseEnd - navigation.responseStart : 0,
    domParse: navigation?.domContentLoadedEventEnd ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
    domReady: navigation?.domContentLoadedEventEnd ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
    load: navigation?.loadEventEnd ? navigation.loadEventEnd - navigation.fetchStart : 0,

    // Paint timing
    fcp: fcp?.startTime || 0,

    // Memory (if available)
    jsHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
    jsHeapLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
  }
}

export default { initWebVitals, getPerformanceMetrics }
