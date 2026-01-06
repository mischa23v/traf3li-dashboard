/**
 * API Debug Utility
 * Traces API calls back to their source code location
 *
 * ENABLED BY DEFAULT - shows source location for every API call
 * Disable with: localStorage.setItem('API_DEBUG', 'false')
 * Re-enable with: localStorage.removeItem('API_DEBUG')
 *
 * Shows in console:
 * - Full URL being called
 * - HTTP method
 * - Source file and line number
 * - Stack trace (collapsed)
 */

export interface ApiCallTrace {
  method: string
  url: string
  fullUrl: string
  timestamp: string
  startTime: number
  endTime?: number
  duration?: number
  status?: number
  source: {
    file: string
    line: number
    column: number
    function: string
  } | null
  stack: string
}

// Track in-flight requests for timing
const pendingRequests: Map<string, ApiCallTrace> = new Map()

// Store recent API calls for debugging
const recentCalls: ApiCallTrace[] = []
const MAX_STORED_CALLS = 100

/**
 * Check if API debugging is enabled (ENABLED BY DEFAULT)
 */
export const isApiDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  // Enabled by default - only disabled if explicitly set to 'false'
  return localStorage.getItem('API_DEBUG') !== 'false'
}

/**
 * Enable API debugging
 */
export const enableApiDebug = () => {
  localStorage.removeItem('API_DEBUG')
  console.log('%c🔍 API Debug ENABLED', 'color: #00ff00; font-weight: bold; font-size: 14px')
  console.log('All API calls will now show their source location.')
  console.log('To disable: apiDebug.disable()')
}

/**
 * Disable API debugging
 */
export const disableApiDebug = () => {
  localStorage.setItem('API_DEBUG', 'false')
  console.log('%c🔍 API Debug DISABLED', 'color: #ff6600; font-weight: bold; font-size: 14px')
  console.log('To re-enable: apiDebug.enable()')
}

/**
 * Parse a stack trace line to extract source info
 */
const parseStackLine = (line: string): { file: string; line: number; column: number; function: string } | null => {
  // Chrome format: "    at functionName (http://localhost:5173/src/hooks/useTasks.ts:42:15)"
  // Firefox format: "functionName@http://localhost:5173/src/hooks/useTasks.ts:42:15"

  // Chrome format
  const chromeMatch = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
  if (chromeMatch) {
    return {
      function: chromeMatch[1],
      file: chromeMatch[2],
      line: parseInt(chromeMatch[3], 10),
      column: parseInt(chromeMatch[4], 10),
    }
  }

  // Chrome format without function name
  const chromeSimpleMatch = line.match(/at\s+(.+?):(\d+):(\d+)/)
  if (chromeSimpleMatch) {
    return {
      function: '<anonymous>',
      file: chromeSimpleMatch[1],
      line: parseInt(chromeSimpleMatch[2], 10),
      column: parseInt(chromeSimpleMatch[3], 10),
    }
  }

  // Firefox format
  const firefoxMatch = line.match(/(.+?)@(.+?):(\d+):(\d+)/)
  if (firefoxMatch) {
    return {
      function: firefoxMatch[1] || '<anonymous>',
      file: firefoxMatch[2],
      line: parseInt(firefoxMatch[3], 10),
      column: parseInt(firefoxMatch[4], 10),
    }
  }

  return null
}

/**
 * Find the user code that initiated the API call
 * Skips axios, api.ts, and other infrastructure code
 */
const findUserSource = (stack: string): { file: string; line: number; column: number; function: string } | null => {
  const lines = stack.split('\n')

  // Skip patterns for infrastructure code
  const skipPatterns = [
    '/node_modules/',
    '/lib/api.ts',
    '/lib/api-debug.ts',
    '/lib/axios',
    '/lib/request-',
    '/lib/circuit-',
    '/lib/idempotency',
    'axios',
    'XMLHttpRequest',
    'dispatchXhrRequest',
    'captureApiCall',
    'getApiCallSource',
  ]

  for (const line of lines) {
    // Skip lines that don't look like stack traces
    if (!line.includes('at ') && !line.includes('@')) continue

    // Skip infrastructure code
    const shouldSkip = skipPatterns.some(pattern => line.includes(pattern))
    if (shouldSkip) continue

    const parsed = parseStackLine(line)
    if (parsed && parsed.file.includes('/src/')) {
      return parsed
    }
  }

  return null
}

/**
 * Get a clean file path for display
 */
const cleanFilePath = (fullPath: string): string => {
  // Extract just the src/ relative path
  const match = fullPath.match(/\/src\/(.+)$/)
  if (match) {
    return `src/${match[1]}`
  }
  return fullPath
}

/**
 * Generate a unique key for tracking a request
 */
const getRequestKey = (method: string, url: string): string => {
  return `${method.toUpperCase()}:${url}:${Date.now()}`
}

/**
 * Capture and log an API call with its source (called at request start)
 */
export const captureApiCall = (method: string, url: string, baseUrl: string): string | null => {
  if (!isApiDebugEnabled()) return null

  const stack = new Error().stack || ''
  const source = findUserSource(stack)
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const startTime = performance.now()
  const requestKey = getRequestKey(method, url)

  const trace: ApiCallTrace = {
    method: method.toUpperCase(),
    url,
    fullUrl,
    timestamp: new Date().toISOString(),
    startTime,
    source,
    stack,
  }

  // Track this request for timing
  pendingRequests.set(requestKey, trace)

  // Log request start
  const methodColors: Record<string, string> = {
    GET: '#61affe',    // Blue
    POST: '#49cc90',   // Green
    PUT: '#fca130',    // Orange
    PATCH: '#50e3c2',  // Cyan
    DELETE: '#f93e3e', // Red
  }

  const color = methodColors[trace.method] || '#999999'

  console.log(
    `%c⏱️ ${trace.method}%c ${url} %c[STARTED]`,
    `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
    'color: inherit;',
    'color: #888; font-style: italic;'
  )

  return requestKey
}

/**
 * Complete an API call with timing (called when response received)
 */
export const completeApiCall = (method: string, url: string, status: number, requestKey?: string): void => {
  if (!isApiDebugEnabled()) return

  const endTime = performance.now()

  // Find the matching request
  let trace: ApiCallTrace | undefined
  let foundKey: string | undefined

  if (requestKey && pendingRequests.has(requestKey)) {
    trace = pendingRequests.get(requestKey)
    foundKey = requestKey
  } else {
    // Fallback: find by method + url (first match)
    for (const [key, t] of pendingRequests.entries()) {
      if (t.method === method.toUpperCase() && t.url === url) {
        trace = t
        foundKey = key
        break
      }
    }
  }

  if (!trace) {
    // No matching request found - create a new trace
    trace = {
      method: method.toUpperCase(),
      url,
      fullUrl: url,
      timestamp: new Date().toISOString(),
      startTime: endTime, // Use end time as fallback
      source: null,
      stack: '',
    }
  }

  // Update trace with timing info
  trace.endTime = endTime
  trace.duration = endTime - trace.startTime
  trace.status = status

  // Remove from pending
  if (foundKey) {
    pendingRequests.delete(foundKey)
  }

  // Store completed call
  recentCalls.push(trace)
  if (recentCalls.length > MAX_STORED_CALLS) {
    recentCalls.shift()
  }

  // Log completion with timing
  const methodColors: Record<string, string> = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    PATCH: '#50e3c2',
    DELETE: '#f93e3e',
  }

  const color = methodColors[trace.method] || '#999999'
  const durationMs = trace.duration.toFixed(0)
  const isSlowRequest = trace.duration > 1000

  // Color-code duration: green < 500ms, yellow < 1000ms, red >= 1000ms
  const durationColor = trace.duration < 500 ? '#49cc90' : trace.duration < 1000 ? '#fca130' : '#f93e3e'
  const statusColor = status >= 200 && status < 300 ? '#49cc90' : status >= 400 ? '#f93e3e' : '#fca130'

  console.log(
    `%c${trace.method}%c ${url} %c${status}%c %c${durationMs}ms%c${isSlowRequest ? ' ⚠️ SLOW' : ''}`,
    `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
    'color: inherit;',
    `background: ${statusColor}; color: white; padding: 2px 4px; border-radius: 3px; font-size: 11px;`,
    'color: inherit;',
    `color: ${durationColor}; font-weight: bold;`,
    'color: #f93e3e; font-weight: bold;'
  )

  // Show source for slow requests
  if (isSlowRequest && trace.source) {
    const cleanPath = cleanFilePath(trace.source.file)
    console.log(`   📍 ${cleanPath}:${trace.source.line} (${trace.source.function})`)
  }
}

/**
 * Get recent API calls for inspection
 */
export const getRecentApiCalls = (): ApiCallTrace[] => {
  return [...recentCalls]
}

/**
 * Clear stored API calls
 */
export const clearApiCallHistory = () => {
  recentCalls.length = 0
}

/**
 * Print a summary of recent API calls grouped by endpoint with timing
 */
export const printApiCallSummary = () => {
  const calls = getRecentApiCalls()
  if (calls.length === 0) {
    console.log('No API calls recorded. Enable debugging with: enableApiDebug()')
    return
  }

  // Calculate stats
  const completedCalls = calls.filter(c => c.duration !== undefined)
  const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
  const avgDuration = completedCalls.length > 0 ? totalDuration / completedCalls.length : 0
  const slowCalls = completedCalls.filter(c => (c.duration || 0) > 1000)
  const failedCalls = completedCalls.filter(c => c.status && c.status >= 400)

  console.log('')
  console.log('%c📊 API CALL SUMMARY', 'font-size: 18px; font-weight: bold; color: #61affe;')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  console.log(`%c📈 Total API Calls:%c ${calls.length}`, 'font-weight: bold;', 'color: #61affe; font-size: 14px;')
  console.log(`%c⏱️  Total Time:%c ${(totalDuration / 1000).toFixed(2)}s`, 'font-weight: bold;', 'color: inherit;')
  console.log(`%c📊 Avg Response:%c ${avgDuration.toFixed(0)}ms`, 'font-weight: bold;', avgDuration < 500 ? 'color: #49cc90;' : avgDuration < 1000 ? 'color: #fca130;' : 'color: #f93e3e;')
  console.log(`%c🐌 Slow (>1s):%c ${slowCalls.length}`, 'font-weight: bold;', slowCalls.length > 0 ? 'color: #f93e3e;' : 'color: #49cc90;')
  console.log(`%c❌ Failed:%c ${failedCalls.length}`, 'font-weight: bold;', failedCalls.length > 0 ? 'color: #f93e3e;' : 'color: #49cc90;')
  console.log(`%c⏳ Pending:%c ${pendingRequests.size}`, 'font-weight: bold;', 'color: #fca130;')
  console.log('')

  // Group by endpoint
  const byEndpoint: Record<string, ApiCallTrace[]> = {}
  calls.forEach(call => {
    const key = `${call.method} ${call.url}`
    if (!byEndpoint[key]) byEndpoint[key] = []
    byEndpoint[key].push(call)
  })

  // Sort by total time (slowest first)
  const sortedEndpoints = Object.entries(byEndpoint).sort((a, b) => {
    const totalA = a[1].reduce((sum, c) => sum + (c.duration || 0), 0)
    const totalB = b[1].reduce((sum, c) => sum + (c.duration || 0), 0)
    return totalB - totalA
  })

  console.log('%c📋 Endpoints (sorted by total time):', 'font-weight: bold; font-size: 14px;')
  console.log('')

  // Print grouped with timing
  sortedEndpoints.forEach(([endpoint, traces]) => {
    const totalTime = traces.reduce((sum, c) => sum + (c.duration || 0), 0)
    const avgTime = totalTime / traces.length
    const maxTime = Math.max(...traces.map(c => c.duration || 0))

    const timeColor = avgTime < 500 ? '#49cc90' : avgTime < 1000 ? '#fca130' : '#f93e3e'

    console.groupCollapsed(
      `%c${endpoint}%c × ${traces.length} %c(avg: ${avgTime.toFixed(0)}ms, max: ${maxTime.toFixed(0)}ms, total: ${(totalTime / 1000).toFixed(2)}s)`,
      'font-weight: bold;',
      'color: #888;',
      `color: ${timeColor};`
    )
    traces.forEach((trace, i) => {
      const source = trace.source
        ? `${cleanFilePath(trace.source.file)}:${trace.source.line}`
        : 'unknown'
      const duration = trace.duration ? `${trace.duration.toFixed(0)}ms` : 'pending...'
      const status = trace.status || '---'
      console.log(`${i + 1}. [${status}] ${duration} - ${source}`)
    })
    console.groupEnd()
  })

  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
}

/**
 * Get count of pending requests
 */
export const getPendingCount = (): number => {
  return pendingRequests.size
}

/**
 * Get API call statistics
 */
export const getApiStats = () => {
  const calls = getRecentApiCalls()
  const completedCalls = calls.filter(c => c.duration !== undefined)
  const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0)

  return {
    totalCalls: calls.length,
    completedCalls: completedCalls.length,
    pendingCalls: pendingRequests.size,
    totalDuration,
    avgDuration: completedCalls.length > 0 ? totalDuration / completedCalls.length : 0,
    slowCalls: completedCalls.filter(c => (c.duration || 0) > 1000).length,
    failedCalls: completedCalls.filter(c => c.status && c.status >= 400).length,
  }
}

/**
 * Print calls that resulted in errors
 * (Call this after errors occur to see which code made the failing requests)
 */
export const printFailedEndpoints = () => {
  console.log('%c❌ Backend Endpoints Returning 500 Errors', 'font-size: 16px; font-weight: bold; color: red;')
  console.log('')
  console.log('The following endpoints are failing on the backend.')
  console.log('Each endpoint shows which frontend code is calling it:')
  console.log('')

  const failingEndpoints = [
    { method: 'GET', url: '/api/auth/me', source: 'src/hooks/useAuth.ts (user session check)' },
    { method: 'GET', url: '/api/v1/dashboard/summary', source: 'src/hooks/useDashboard.ts:useDashboardSummary()' },
    { method: 'GET', url: '/api/v1/tasks/upcoming?days=14', source: 'src/hooks/useTasks.ts:useUpcomingTasks()' },
    { method: 'GET', url: '/api/v1/tasks/overdue', source: 'src/hooks/useTasks.ts:useOverdueTasks()' },
    { method: 'GET', url: '/api/v1/tasks/due-today', source: 'src/hooks/useTasks.ts:useTodayTasks()' },
    { method: 'GET', url: '/api/v1/tasks/stats', source: 'src/hooks/useTasks.ts:useTaskStats()' },
    { method: 'GET', url: '/api/v1/dashboard/today-events', source: 'src/hooks/useDashboard.ts:useTodayEvents()' },
    { method: 'GET', url: '/api/v1/dashboard/financial-summary', source: 'src/hooks/useDashboard.ts:useFinancialSummary()' },
  ]

  failingEndpoints.forEach(ep => {
    console.log(`%c${ep.method}%c ${ep.url}`,
      'background: #f93e3e; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      'color: inherit;'
    )
    console.log(`   Source: ${ep.source}`)
    console.log('')
  })

  console.log('%c📝 Backend Team Notes:', 'font-weight: bold; font-size: 14px;')
  console.log('These endpoints should return proper JSON responses.')
  console.log('Current behavior: 500 Internal Server Error')
  console.log('Expected: 200 OK with JSON data')
}

// Expose to window for easy console access
// Wrapped in try-catch to prevent debug code from crashing the app
if (typeof window !== 'undefined') {
  try {
    (window as any).apiDebug = {
      enable: enableApiDebug,
      disable: disableApiDebug,
      isEnabled: isApiDebugEnabled,
      getRecentCalls: getRecentApiCalls,
      clearHistory: clearApiCallHistory,
      printSummary: printApiCallSummary,
      printFailedEndpoints,
      getStats: getApiStats,
      getPending: getPendingCount,
    }

    // Auto-show help on page load (debug is enabled by default)
    setTimeout(() => {
      try {
        if (isApiDebugEnabled()) {
          console.log('')
          console.log('%c🔍 API DEBUG MODE ACTIVE', 'background: #61affe; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px')
          console.log('%cEvery API call shows timing and source location.', 'color: #888;')
          console.log('')
          console.log('%cCommands:', 'font-weight: bold;')
          console.log('  apiDebug.printSummary()  - Show all calls with timing stats')
          console.log('  apiDebug.getStats()      - Get { totalCalls, avgDuration, slowCalls, ... }')
          console.log('  apiDebug.getPending()    - Count of in-flight requests')
          console.log('  apiDebug.disable()       - Turn off debug mode')
          console.log('')
        }
      } catch {
        // Ignore console errors
      }
    }, 1000)
  } catch (e) {
    // Debug initialization failed - non-critical
    if (import.meta.env.DEV) {
      console.warn('[ApiDebug] Failed to initialize:', e)
    }
  }
}
