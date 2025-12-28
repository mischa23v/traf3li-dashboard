/**
 * Aggressive Debug System
 * Captures EVERYTHING to help find and fix errors
 *
 * Features:
 * - Global window.onerror handler (catches uncaught errors)
 * - unhandledrejection handler (catches failed promises)
 * - Enhanced console.error interception
 * - Network request/response logging
 * - React error tracking
 * - Performance monitoring
 * - Full stack traces with source maps
 *
 * ENABLED BY DEFAULT in development
 * Disable with: localStorage.setItem('AGGRESSIVE_DEBUG', 'false')
 */

export interface DebugError {
  id: string
  type: 'uncaught' | 'promise' | 'api' | 'react' | 'network' | 'console'
  message: string
  stack?: string
  source?: string
  line?: number
  column?: number
  timestamp: string
  url?: string
  method?: string
  status?: number
  requestId?: string
  componentStack?: string
  extra?: Record<string, unknown>
}

// Store all captured errors
const capturedErrors: DebugError[] = []
const MAX_ERRORS = 200

// Store network requests for correlation
const networkRequests: Map<string, { url: string; method: string; timestamp: number }> = new Map()

/**
 * Check if aggressive debugging is enabled
 */
export const isAggressiveDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  // Enabled by default - only disabled if explicitly set to 'false'
  return localStorage.getItem('AGGRESSIVE_DEBUG') !== 'false'
}

/**
 * Generate unique error ID
 */
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Add error to store
 */
const storeError = (error: DebugError): void => {
  capturedErrors.unshift(error) // Add to front
  if (capturedErrors.length > MAX_ERRORS) {
    capturedErrors.pop() // Remove oldest
  }
}

/**
 * Parse stack trace to get useful info
 */
const parseStackTrace = (stack?: string): { file: string; line: number; column: number; function: string }[] => {
  if (!stack) return []

  const frames: { file: string; line: number; column: number; function: string }[] = []
  const lines = stack.split('\n')

  for (const line of lines) {
    // Chrome format: "    at functionName (http://localhost:5173/src/file.ts:42:15)"
    const chromeMatch = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/)
    if (chromeMatch) {
      frames.push({
        function: chromeMatch[1],
        file: chromeMatch[2],
        line: parseInt(chromeMatch[3], 10),
        column: parseInt(chromeMatch[4], 10),
      })
      continue
    }

    // Chrome format without function: "    at http://localhost:5173/src/file.ts:42:15"
    const chromeSimple = line.match(/at\s+(.+?):(\d+):(\d+)/)
    if (chromeSimple) {
      frames.push({
        function: '<anonymous>',
        file: chromeSimple[1],
        line: parseInt(chromeSimple[2], 10),
        column: parseInt(chromeSimple[3], 10),
      })
    }
  }

  return frames
}

/**
 * Clean file path for display
 */
const cleanPath = (path: string): string => {
  const match = path.match(/\/src\/(.+)$/)
  return match ? `src/${match[1]}` : path
}

/**
 * Log error with aggressive formatting
 */
const logAggressiveError = (error: DebugError): void => {
  const typeColors: Record<string, string> = {
    uncaught: '#ff0000',
    promise: '#ff6600',
    api: '#ff3366',
    react: '#cc00ff',
    network: '#0066ff',
    console: '#999999',
  }

  const typeEmojis: Record<string, string> = {
    uncaught: '💥',
    promise: '⚠️',
    api: '🔴',
    react: '⚛️',
    network: '🌐',
    console: '📝',
  }

  const color = typeColors[error.type] || '#ff0000'
  const emoji = typeEmojis[error.type] || '❌'

  console.group(
    `%c${emoji} ${error.type.toUpperCase()} ERROR%c [${error.id}]`,
    `background: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px;`,
    'color: #888; font-size: 11px;'
  )

  console.log('%c📍 Location:', 'font-weight: bold; color: #333;')
  if (error.source) {
    console.log(`   File: ${cleanPath(error.source)}`)
  }
  if (error.line !== undefined) {
    console.log(`   Line: ${error.line}${error.column !== undefined ? `:${error.column}` : ''}`)
  }
  if (error.url) {
    console.log(`   URL: ${error.url}`)
  }

  console.log('%c📝 Message:', 'font-weight: bold; color: #333;', error.message)

  if (error.status) {
    console.log('%c🔢 Status:', 'font-weight: bold; color: #333;', error.status)
  }

  if (error.method) {
    console.log('%c🔧 Method:', 'font-weight: bold; color: #333;', error.method)
  }

  if (error.requestId) {
    console.log('%c🆔 Request ID:', 'font-weight: bold; color: #333;', error.requestId)
  }

  if (error.stack) {
    console.log('%c📚 Stack Trace:', 'font-weight: bold; color: #333;')
    const frames = parseStackTrace(error.stack)
    if (frames.length > 0) {
      frames.slice(0, 10).forEach((frame, i) => {
        const path = cleanPath(frame.file)
        console.log(
          `   %c${i + 1}.%c ${frame.function} %c@ ${path}:${frame.line}:${frame.column}`,
          'color: #888;',
          'color: #333;',
          'color: #0066cc; text-decoration: underline; cursor: pointer;'
        )
      })
    } else {
      console.log(error.stack)
    }
  }

  if (error.componentStack) {
    console.log('%c⚛️ React Component Stack:', 'font-weight: bold; color: #cc00ff;')
    console.log(error.componentStack)
  }

  if (error.extra && Object.keys(error.extra).length > 0) {
    console.log('%c📦 Extra Data:', 'font-weight: bold; color: #333;', error.extra)
  }

  console.log('%c⏰ Time:', 'font-weight: bold; color: #333;', error.timestamp)

  console.groupEnd()
}

/**
 * Global window.onerror handler
 */
const setupGlobalErrorHandler = (): void => {
  const originalOnError = window.onerror

  window.onerror = (message, source, line, column, error) => {
    if (!isAggressiveDebugEnabled()) return

    const debugError: DebugError = {
      id: generateErrorId(),
      type: 'uncaught',
      message: typeof message === 'string' ? message : String(message),
      stack: error?.stack,
      source: source || undefined,
      line: line || undefined,
      column: column || undefined,
      timestamp: new Date().toISOString(),
    }

    storeError(debugError)
    logAggressiveError(debugError)

    // Call original handler if exists
    if (originalOnError) {
      return originalOnError.call(window, message, source, line, column, error)
    }

    return false
  }
}

/**
 * Unhandled promise rejection handler
 */
const setupUnhandledRejectionHandler = (): void => {
  window.addEventListener('unhandledrejection', (event) => {
    if (!isAggressiveDebugEnabled()) return

    const error = event.reason
    const message = error?.message || String(error)
    const stack = error?.stack

    const debugError: DebugError = {
      id: generateErrorId(),
      type: 'promise',
      message,
      stack,
      timestamp: new Date().toISOString(),
      extra: {
        reason: error,
        promiseState: 'rejected',
      },
    }

    storeError(debugError)
    logAggressiveError(debugError)
  })
}

/**
 * Intercept console.error for additional logging
 */
const setupConsoleInterceptor = (): void => {
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: unknown[]) => {
    if (isAggressiveDebugEnabled()) {
      const message = args.map(arg => {
        if (arg instanceof Error) return arg.message
        if (typeof arg === 'object') return JSON.stringify(arg, null, 2)
        return String(arg)
      }).join(' ')

      // Only log if not already an aggressive debug log
      if (!message.includes('AGGRESSIVE DEBUG') && !message.includes('[err_')) {
        const debugError: DebugError = {
          id: generateErrorId(),
          type: 'console',
          message,
          stack: new Error().stack,
          timestamp: new Date().toISOString(),
        }

        storeError(debugError)
        // Don't log again - just store
      }
    }

    originalError.apply(console, args)
  }

  // Also capture warnings
  console.warn = (...args: unknown[]) => {
    if (isAggressiveDebugEnabled()) {
      const message = args.map(arg => {
        if (arg instanceof Error) return arg.message
        if (typeof arg === 'object') return JSON.stringify(arg, null, 2)
        return String(arg)
      }).join(' ')

      // Store but don't log (too noisy)
      if (!message.includes('AGGRESSIVE DEBUG')) {
        const debugError: DebugError = {
          id: generateErrorId(),
          type: 'console',
          message: `[WARN] ${message}`,
          stack: new Error().stack,
          timestamp: new Date().toISOString(),
        }
        storeError(debugError)
      }
    }

    originalWarn.apply(console, args)
  }
}

/**
 * Intercept fetch for network logging
 */
const setupFetchInterceptor = (): void => {
  const originalFetch = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!isAggressiveDebugEnabled()) {
      return originalFetch(input, init)
    }

    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method || 'GET'
    const requestId = generateErrorId()
    const startTime = Date.now()

    networkRequests.set(requestId, { url, method, timestamp: startTime })

    try {
      const response = await originalFetch(input, init)

      // Log failed responses
      if (!response.ok) {
        const clonedResponse = response.clone()
        let responseBody: unknown
        try {
          responseBody = await clonedResponse.json()
        } catch {
          responseBody = await clonedResponse.text().catch(() => 'Unable to read body')
        }

        const debugError: DebugError = {
          id: requestId,
          type: 'network',
          message: `HTTP ${response.status} ${response.statusText}`,
          url,
          method,
          status: response.status,
          timestamp: new Date().toISOString(),
          requestId: (responseBody as any)?.requestId || (responseBody as any)?.meta?.requestId,
          extra: {
            responseTime: `${Date.now() - startTime}ms`,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
          },
        }

        storeError(debugError)
        logAggressiveError(debugError)
      }

      return response
    } catch (error) {
      const debugError: DebugError = {
        id: requestId,
        type: 'network',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url,
        method,
        timestamp: new Date().toISOString(),
        extra: {
          responseTime: `${Date.now() - startTime}ms`,
          errorType: error instanceof Error ? error.name : typeof error,
        },
      }

      storeError(debugError)
      logAggressiveError(debugError)

      throw error
    } finally {
      networkRequests.delete(requestId)
    }
  }
}

/**
 * Capture API errors (called from api.ts)
 */
export const captureApiError = (
  status: number,
  message: string,
  url: string,
  method: string,
  extra?: Record<string, unknown>
): void => {
  if (!isAggressiveDebugEnabled()) return

  const debugError: DebugError = {
    id: generateErrorId(),
    type: 'api',
    message,
    url,
    method,
    status,
    timestamp: new Date().toISOString(),
    requestId: extra?.requestId as string,
    stack: new Error().stack,
    extra,
  }

  storeError(debugError)
  logAggressiveError(debugError)
}

/**
 * Capture React errors (called from ErrorBoundary)
 */
export const captureReactError = (
  error: Error,
  componentStack: string,
  extra?: Record<string, unknown>
): void => {
  if (!isAggressiveDebugEnabled()) return

  const debugError: DebugError = {
    id: generateErrorId(),
    type: 'react',
    message: error.message,
    stack: error.stack,
    componentStack,
    timestamp: new Date().toISOString(),
    extra,
  }

  storeError(debugError)
  logAggressiveError(debugError)
}

/**
 * Get all captured errors
 */
export const getCapturedErrors = (): DebugError[] => {
  return [...capturedErrors]
}

/**
 * Get errors by type
 */
export const getErrorsByType = (type: DebugError['type']): DebugError[] => {
  return capturedErrors.filter(e => e.type === type)
}

/**
 * Clear all captured errors
 */
export const clearCapturedErrors = (): void => {
  capturedErrors.length = 0
  console.log('%c🧹 Error history cleared', 'color: green;')
}

/**
 * Print error summary
 */
export const printErrorSummary = (): void => {
  const errors = getCapturedErrors()

  if (errors.length === 0) {
    console.log('%c✅ No errors captured!', 'color: green; font-size: 14px; font-weight: bold;')
    return
  }

  console.group(
    `%c📊 ERROR SUMMARY (${errors.length} errors)`,
    'background: #ff3366; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;'
  )

  // Group by type
  const byType = errors.reduce((acc, err) => {
    acc[err.type] = (acc[err.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('%cBy Type:', 'font-weight: bold;')
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`)
  })

  // Group by status (for API errors)
  const apiErrors = errors.filter(e => e.type === 'api' || e.type === 'network')
  if (apiErrors.length > 0) {
    const byStatus = apiErrors.reduce((acc, err) => {
      const status = err.status || 0
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    console.log('%cBy HTTP Status:', 'font-weight: bold;')
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
  }

  // Show recent errors
  console.log('%cRecent Errors (last 10):', 'font-weight: bold;')
  errors.slice(0, 10).forEach((err, i) => {
    const location = err.url || err.source || 'unknown'
    console.log(
      `   ${i + 1}. [${err.type}] ${err.message.substring(0, 60)}${err.message.length > 60 ? '...' : ''}`,
      `(${cleanPath(location)})`
    )
  })

  console.groupEnd()

  console.log('')
  console.log('%cCommands:', 'font-weight: bold;')
  console.log('  errorDebug.getAll()       - Get all errors as array')
  console.log('  errorDebug.getByType(type) - Filter by type (api, react, network, promise, uncaught)')
  console.log('  errorDebug.clear()        - Clear error history')
  console.log('  errorDebug.export()       - Export errors as JSON')
}

/**
 * Export errors as JSON
 */
export const exportErrors = (): string => {
  return JSON.stringify(capturedErrors, null, 2)
}

/**
 * Download errors as file
 */
export const downloadErrors = (): void => {
  const json = exportErrors()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  console.log('%c📥 Errors downloaded!', 'color: green;')
}

/**
 * Enable aggressive debugging
 */
export const enableAggressiveDebug = (): void => {
  localStorage.removeItem('AGGRESSIVE_DEBUG')
  console.log(
    '%c🔥 AGGRESSIVE DEBUG ENABLED',
    'background: #ff3366; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 16px;'
  )
  console.log('All errors will now be captured and logged with full details.')
  console.log('Use errorDebug.printSummary() to see all captured errors.')
}

/**
 * Disable aggressive debugging
 */
export const disableAggressiveDebug = (): void => {
  localStorage.setItem('AGGRESSIVE_DEBUG', 'false')
  console.log('%c🔇 Aggressive Debug DISABLED', 'color: #888; font-weight: bold;')
}

/**
 * Initialize all debug handlers
 */
export const initAggressiveDebug = (): void => {
  if (typeof window === 'undefined') return

  setupGlobalErrorHandler()
  setupUnhandledRejectionHandler()
  setupConsoleInterceptor()
  setupFetchInterceptor()

  // Expose to window for console access
  ;(window as any).errorDebug = {
    enable: enableAggressiveDebug,
    disable: disableAggressiveDebug,
    isEnabled: isAggressiveDebugEnabled,
    getAll: getCapturedErrors,
    getByType: getErrorsByType,
    clear: clearCapturedErrors,
    printSummary: printErrorSummary,
    export: exportErrors,
    download: downloadErrors,
    captureApi: captureApiError,
    captureReact: captureReactError,
  }

  // Show startup message
  if (isAggressiveDebugEnabled()) {
    setTimeout(() => {
      console.log('')
      console.log(
        '%c🔥 AGGRESSIVE DEBUG MODE ACTIVE',
        'background: linear-gradient(135deg, #ff3366, #ff6600); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;'
      )
      console.log('%cAll errors are being captured with full details.', 'color: #ff3366;')
      console.log('')
      console.log('%cQuick Commands:', 'font-weight: bold; font-size: 12px;')
      console.log('  errorDebug.printSummary()  - Show all captured errors')
      console.log('  errorDebug.getAll()        - Get errors as array')
      console.log('  errorDebug.download()      - Download error log as JSON')
      console.log('  errorDebug.clear()         - Clear error history')
      console.log('  errorDebug.disable()       - Turn off aggressive debugging')
      console.log('')
      console.log('  apiDebug.printSummary()    - Show API call history')
      console.log('  apiDebug.printFailedEndpoints() - Show failing endpoints')
      console.log('')
    }, 500)
  }
}

export default initAggressiveDebug
