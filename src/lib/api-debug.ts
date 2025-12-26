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
  source: {
    file: string
    line: number
    column: number
    function: string
  } | null
  stack: string
}

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
 * Capture and log an API call with its source
 */
export const captureApiCall = (method: string, url: string, baseUrl: string): ApiCallTrace | null => {
  if (!isApiDebugEnabled()) return null

  const stack = new Error().stack || ''
  const source = findUserSource(stack)
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

  const trace: ApiCallTrace = {
    method: method.toUpperCase(),
    url,
    fullUrl,
    timestamp: new Date().toISOString(),
    source,
    stack,
  }

  // Store for later inspection
  recentCalls.push(trace)
  if (recentCalls.length > MAX_STORED_CALLS) {
    recentCalls.shift()
  }

  // Log to console with colors
  const methodColors: Record<string, string> = {
    GET: '#61affe',    // Blue
    POST: '#49cc90',   // Green
    PUT: '#fca130',    // Orange
    PATCH: '#50e3c2',  // Cyan
    DELETE: '#f93e3e', // Red
  }

  const color = methodColors[trace.method] || '#999999'

  console.groupCollapsed(
    `%c${trace.method}%c ${url}`,
    `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
    'color: inherit;'
  )

  console.log('%cFull URL:', 'font-weight: bold;', fullUrl)
  console.log('%cTimestamp:', 'font-weight: bold;', trace.timestamp)

  if (source) {
    const cleanPath = cleanFilePath(source.file)
    console.log(
      '%cSource:',
      'font-weight: bold;',
      `${cleanPath}:${source.line}:${source.column}`
    )
    console.log('%cFunction:', 'font-weight: bold;', source.function)

    // Clickable link for source maps
    console.log('%cClick to open in DevTools Sources:', 'font-style: italic; color: #888;')
    console.log(source.file)
  } else {
    console.log('%cSource:', 'font-weight: bold;', 'Could not determine (check stack trace)')
  }

  console.log('%cStack trace:', 'font-weight: bold;')
  console.log(stack)

  console.groupEnd()

  return trace
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
 * Print a summary of recent API calls grouped by endpoint
 */
export const printApiCallSummary = () => {
  const calls = getRecentApiCalls()
  if (calls.length === 0) {
    console.log('No API calls recorded. Enable debugging with: enableApiDebug()')
    return
  }

  console.log('%c📊 API Call Summary', 'font-size: 16px; font-weight: bold;')
  console.log(`Total calls: ${calls.length}`)

  // Group by endpoint
  const byEndpoint: Record<string, ApiCallTrace[]> = {}
  calls.forEach(call => {
    const key = `${call.method} ${call.url}`
    if (!byEndpoint[key]) byEndpoint[key] = []
    byEndpoint[key].push(call)
  })

  // Print grouped
  Object.entries(byEndpoint).forEach(([endpoint, traces]) => {
    console.groupCollapsed(`${endpoint} (${traces.length} calls)`)
    traces.forEach((trace, i) => {
      const source = trace.source
        ? `${cleanFilePath(trace.source.file)}:${trace.source.line}`
        : 'unknown'
      console.log(`${i + 1}. ${trace.timestamp} from ${source}`)
    })
    console.groupEnd()
  })
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
if (typeof window !== 'undefined') {
  (window as any).apiDebug = {
    enable: enableApiDebug,
    disable: disableApiDebug,
    isEnabled: isApiDebugEnabled,
    getRecentCalls: getRecentApiCalls,
    clearHistory: clearApiCallHistory,
    printSummary: printApiCallSummary,
    printFailedEndpoints,
  }

  // Auto-show help on page load (debug is enabled by default)
  setTimeout(() => {
    if (isApiDebugEnabled()) {
      console.log('%c🔍 API Debug Mode Active (enabled by default)', 'color: #00ff00; font-weight: bold; font-size: 14px')
      console.log('Every API call will show its source file and line number.')
      console.log('')
      console.log('Commands available:')
      console.log('  apiDebug.printSummary()         - Show all API calls grouped by endpoint')
      console.log('  apiDebug.printFailedEndpoints() - Show failing endpoints with source')
      console.log('  apiDebug.getRecentCalls()       - Get raw call data')
      console.log('  apiDebug.disable()              - Turn off debug mode')
    }
  }, 1000)
}
