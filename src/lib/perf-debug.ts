/**
 * Performance Debugging Utilities
 * Enable detailed console logging to identify performance bottlenecks
 *
 * PERF_DEBUG is automatically enabled in development mode.
 * To enable in production, set VITE_PERF_DEBUG=true in environment.
 *
 * When enabled, you'll see:
 * - Component mount/unmount times
 * - API call start/completion times
 * - Render counts
 * - Active fetch status
 */

// Master switch for performance debugging
// Automatically enabled in development, disabled in production unless explicitly set
export const PERF_DEBUG = import.meta.env.DEV || import.meta.env.VITE_PERF_DEBUG === 'true'

/**
 * Log a performance event with timestamp
 */
export const perfLog = (label: string, data?: any) => {
  if (!PERF_DEBUG) return
  const time = performance.now().toFixed(2)
  console.log(`%c[PERF ${time}ms] ${label}`, 'color: #10b981; font-weight: bold', data || '')
}

/**
 * Log a warning-level performance event
 */
export const perfWarn = (label: string, data?: any) => {
  if (!PERF_DEBUG) return
  const time = performance.now().toFixed(2)
  console.log(`%c[PERF ${time}ms] ⚠️ ${label}`, 'color: #f59e0b; font-weight: bold', data || '')
}

/**
 * Log an error-level performance event
 */
export const perfError = (label: string, data?: any) => {
  if (!PERF_DEBUG) return
  const time = performance.now().toFixed(2)
  console.log(`%c[PERF ${time}ms] ❌ ${label}`, 'color: #ef4444; font-weight: bold', data || '')
}

/**
 * Create a performance mark
 */
export const perfMark = (name: string) => {
  if (!PERF_DEBUG) return
  performance.mark(name)
}

/**
 * Measure time between a mark and now
 */
export const perfMeasure = (name: string, startMark: string) => {
  if (!PERF_DEBUG) return
  try {
    performance.measure(name, startMark)
    const measure = performance.getEntriesByName(name, 'measure')[0]
    console.log(`%c[PERF] ⏱️ ${name}: ${measure.duration.toFixed(2)}ms`, 'color: #8b5cf6; font-weight: bold')
    performance.clearMeasures(name)
    performance.clearMarks(startMark)
  } catch (e) {
    // Ignore if marks don't exist
  }
}

/**
 * Track component lifecycle
 */
export const useComponentPerf = (componentName: string) => {
  if (!PERF_DEBUG) return { renderCount: { current: 0 }, mountTime: { current: 0 } }

  const renderCount = { current: 0 }
  const mountTime = { current: performance.now() }

  return { renderCount, mountTime, componentName }
}

/**
 * Log API response time from network tab
 * Call this to remind user to check Network tab
 */
export const perfCheckNetwork = () => {
  if (!PERF_DEBUG) return
  console.log(
    '%c[PERF] 📡 Check Network tab for actual API response times (filter by XHR/Fetch)',
    'color: #3b82f6; font-weight: bold'
  )
}
