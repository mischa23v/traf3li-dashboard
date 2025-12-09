import { onCLS, onFID, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

type ReportHandler = (metric: Metric) => void

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals'

function getConnectionSpeed(): string {
  const nav = navigator as any
  return nav?.connection?.effectiveType || ''
}

function sendToAnalytics(metric: Metric, options?: { debug?: boolean }) {
  const body = {
    dsn: import.meta.env.VITE_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  }

  if (options?.debug) {
    console.log('[Web Vitals]', metric.name, metric.value)
  }

  // Send to Sentry if available
  if ((window as any).Sentry) {
    (window as any).Sentry.setMeasurement(metric.name, metric.value, metric.rating === 'good' ? 'none' : 'ratio')
  }

  // Could also send to custom analytics endpoint
  if (import.meta.env.VITE_ANALYTICS_ID) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, blob)
    }
  }
}

export function reportWebVitals(onReport?: ReportHandler) {
  const handler: ReportHandler = onReport || ((metric) => sendToAnalytics(metric, { debug: import.meta.env.DEV }))

  onCLS(handler)
  onFID(handler)
  onFCP(handler)
  onINP(handler)
  onLCP(handler)
  onTTFB(handler)
}

export function initWebVitals() {
  if (typeof window !== 'undefined') {
    reportWebVitals()
  }
}
