/**
 * Console Logger Utility
 * Captures all console output (log, warn, error, info) and writes to localStorage
 * Can be exported to a file for debugging
 *
 * Usage:
 * - Automatically initializes in development mode
 * - Call `consoleLogger.download()` to download logs as JSON
 * - Call `consoleLogger.clear()` to clear stored logs
 * - Access `consoleLogger.getLogs()` to get all logs programmatically
 */

export interface ConsoleLogEntry {
  timestamp: string
  type: 'log' | 'warn' | 'error' | 'info' | 'debug'
  message: string
  stack?: string
  url: string
  userAgent: string
}

class ConsoleLogger {
  private logs: ConsoleLogEntry[] = []
  private maxLogs = 1000 // Prevent memory bloat
  private isInitialized = false
  private originalConsole: {
    log: typeof console.log
    warn: typeof console.warn
    error: typeof console.error
    info: typeof console.info
    debug: typeof console.debug
  } | null = null

  /**
   * Initialize the console logger
   * Intercepts all console methods and stores logs
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    }

    // Load existing logs from sessionStorage
    this.loadFromStorage()

    // Override console methods
    console.log = (...args) => this.capture('log', args)
    console.warn = (...args) => this.capture('warn', args)
    console.error = (...args) => this.capture('error', args)
    console.info = (...args) => this.capture('info', args)
    console.debug = (...args) => this.capture('debug', args)

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.addEntry({
        type: 'error',
        message: `Uncaught Error: ${event.message}`,
        stack: event.error?.stack,
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addEntry({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      })
    })

    this.isInitialized = true
    this.originalConsole?.info('[ConsoleLogger] Initialized - capturing all console output')
  }

  /**
   * Capture console output
   */
  private capture(type: ConsoleLogEntry['type'], args: any[]): void {
    // Call original console method
    this.originalConsole?.[type]?.(...args)

    // Format message
    const message = args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}`
        }
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')

    // Get stack trace for errors
    let stack: string | undefined
    if (type === 'error') {
      const errorArg = args.find((arg) => arg instanceof Error)
      stack = errorArg?.stack || new Error().stack
    }

    this.addEntry({ type, message, stack })
  }

  /**
   * Add a log entry
   */
  private addEntry(entry: Partial<ConsoleLogEntry>): void {
    const fullEntry: ConsoleLogEntry = {
      timestamp: new Date().toISOString(),
      type: entry.type || 'log',
      message: entry.message || '',
      stack: entry.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }

    this.logs.push(fullEntry)

    // Trim old logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Save to sessionStorage
    this.saveToStorage()
  }

  /**
   * Save logs to sessionStorage
   */
  private saveToStorage(): void {
    try {
      sessionStorage.setItem('console_logs', JSON.stringify(this.logs))
    } catch {
      // Storage full - trim logs
      this.logs = this.logs.slice(-100)
      try {
        sessionStorage.setItem('console_logs', JSON.stringify(this.logs))
      } catch {
        // Give up on storage
      }
    }
  }

  /**
   * Load logs from sessionStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('console_logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch {
      this.logs = []
    }
  }

  /**
   * Get all captured logs
   */
  getLogs(): ConsoleLogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs filtered by type
   */
  getLogsByType(type: ConsoleLogEntry['type']): ConsoleLogEntry[] {
    return this.logs.filter((log) => log.type === type)
  }

  /**
   * Get only errors and warnings
   */
  getErrorsAndWarnings(): ConsoleLogEntry[] {
    return this.logs.filter((log) => log.type === 'error' || log.type === 'warn')
  }

  /**
   * Get log summary
   */
  getSummary(): { total: number; errors: number; warnings: number; logs: number; info: number } {
    return {
      total: this.logs.length,
      errors: this.logs.filter((l) => l.type === 'error').length,
      warnings: this.logs.filter((l) => l.type === 'warn').length,
      logs: this.logs.filter((l) => l.type === 'log').length,
      info: this.logs.filter((l) => l.type === 'info').length,
    }
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
    sessionStorage.removeItem('console_logs')
    this.originalConsole?.info('[ConsoleLogger] Logs cleared')
  }

  /**
   * Download logs as JSON file
   */
  download(filename?: string): void {
    const data = {
      exportedAt: new Date().toISOString(),
      summary: this.getSummary(),
      logs: this.logs,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `console-logs-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.originalConsole?.info('[ConsoleLogger] Logs downloaded')
  }

  /**
   * Download only errors and warnings
   */
  downloadErrorsOnly(filename?: string): void {
    const errorsAndWarnings = this.getErrorsAndWarnings()
    const data = {
      exportedAt: new Date().toISOString(),
      summary: {
        total: errorsAndWarnings.length,
        errors: errorsAndWarnings.filter((l) => l.type === 'error').length,
        warnings: errorsAndWarnings.filter((l) => l.type === 'warn').length,
      },
      logs: errorsAndWarnings,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `console-errors-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.originalConsole?.info('[ConsoleLogger] Errors downloaded')
  }

  /**
   * Print summary to console
   */
  printSummary(): void {
    const summary = this.getSummary()
    this.originalConsole?.log('=== Console Log Summary ===')
    this.originalConsole?.log(`Total: ${summary.total}`)
    this.originalConsole?.log(`Errors: ${summary.errors}`)
    this.originalConsole?.log(`Warnings: ${summary.warnings}`)
    this.originalConsole?.log(`Info: ${summary.info}`)
    this.originalConsole?.log(`Logs: ${summary.logs}`)
    this.originalConsole?.log('===========================')
  }

  /**
   * Restore original console methods
   */
  destroy(): void {
    if (this.originalConsole) {
      console.log = this.originalConsole.log
      console.warn = this.originalConsole.warn
      console.error = this.originalConsole.error
      console.info = this.originalConsole.info
      console.debug = this.originalConsole.debug
    }
    this.isInitialized = false
    this.originalConsole?.info('[ConsoleLogger] Destroyed - original console restored')
  }
}

// Create singleton instance
export const consoleLogger = new ConsoleLogger()

// Auto-initialize in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Initialize on next tick to ensure DOM is ready
  setTimeout(() => {
    consoleLogger.init()
  }, 0)
}

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  ;(window as any).consoleLogger = consoleLogger
}

export default consoleLogger
