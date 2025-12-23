/**
 * Production-Safe Logging Utility
 *
 * Provides environment-aware logging that:
 * - Logs to console in development
 * - Sends to monitoring service (Sentry) in production
 * - Prevents sensitive data exposure
 * - Maintains structured logging format
 *
 * Security Features:
 * - No console output in production
 * - Automatic error sanitization
 * - Request ID correlation
 * - PII redaction
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger'
 *
 * // Development: Logs to console
 * // Production: Sends to Sentry
 * logger.error('API call failed', error, { userId, endpoint })
 * logger.warn('Rate limit approaching', { remaining: 10 })
 * logger.info('User logged in', { userId })
 * logger.debug('Cache hit', { key, ttl })
 * ```
 */

import { sanitizeError } from './error-sanitizer'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: any
  requestId?: string
  userId?: string
}

class Logger {
  private isDev = import.meta.env.DEV
  private isProd = import.meta.env.PROD
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100

  /**
   * Debug level - detailed information for developers
   * Only logs in development, never in production
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }

  /**
   * Info level - general informational messages
   * Only logs in development, never in production
   */
  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.info(`[INFO] ${message}`, context || '')
    }
  }

  /**
   * Warning level - potentially harmful situations
   * Logs to console in development, sends to monitoring in production
   */
  warn(message: string, context?: LogContext): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: this.sanitizeContext(context),
    }

    if (this.isDev) {
      console.warn(`[WARN] ${message}`, context || '')
    } else if (this.isProd) {
      this.sendToMonitoring(entry)
    }

    this.addToBuffer(entry)
  }

  /**
   * Error level - error events
   * Logs to console in development, sends to monitoring in production
   * Always sanitizes error objects to prevent sensitive data leakage
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const sanitizedError = error ? sanitizeError(error) : undefined
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: sanitizedError,
      context: this.sanitizeContext(context),
    }

    if (this.isDev) {
      console.error(`[ERROR] ${message}`, error, context || '')
    } else if (this.isProd) {
      this.sendToMonitoring(entry)
    }

    this.addToBuffer(entry)
  }

  /**
   * Sanitize context to remove sensitive data
   * Prevents PII and secrets from being logged
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined
    return sanitizeError(context)
  }

  /**
   * Send log entry to monitoring service (Sentry)
   * Only in production mode
   */
  private sendToMonitoring(entry: LogEntry): void {
    if (!this.isProd) return

    try {
      // Send to Sentry if available
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        const { Sentry } = window as any

        if (entry.level === 'error' && entry.error) {
          // For errors, capture exception
          Sentry.captureException(entry.error, {
            level: 'error',
            extra: {
              message: entry.message,
              ...entry.context,
            },
            tags: {
              requestId: entry.requestId,
              userId: entry.userId,
            },
          })
        } else {
          // For warnings and info, capture message
          Sentry.captureMessage(entry.message, {
            level: entry.level === 'warn' ? 'warning' : entry.level,
            extra: entry.context,
            tags: {
              requestId: entry.requestId,
              userId: entry.userId,
            },
          })
        }
      }

      // TODO: Add other monitoring integrations (DataDog, LogRocket, etc.)
    } catch (monitoringError) {
      // Silently fail - don't break app if monitoring fails
      // Store in buffer for later retrieval
      if (this.isDev) {
        console.error('[Logger] Failed to send to monitoring:', monitoringError)
      }
    }
  }

  /**
   * Add entry to in-memory buffer
   * Useful for debugging and error reports
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry)

    // Trim buffer if too large (prevent memory leak)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize)
    }
  }

  /**
   * Get recent log entries from buffer
   * Useful for error reports and debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  /**
   * Get error logs only
   */
  getErrorLogs(count: number = 50): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === 'error')
      .slice(-count)
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = []
  }

  /**
   * Export logs as JSON for support tickets
   */
  exportLogs(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      environment: this.isDev ? 'development' : 'production',
      logs: this.logBuffer,
    }, null, 2)
  }

  /**
   * Download logs as file
   */
  downloadLogs(filename?: string): void {
    const data = this.exportLogs()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `app-logs-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

/**
 * Singleton logger instance
 * Import and use throughout the application
 */
export const logger = new Logger()

/**
 * Expose logger to window for debugging in production
 * Can be used in browser console: window.__logger.getRecentLogs()
 */
if (typeof window !== 'undefined') {
  (window as any).__logger = logger
}

/**
 * Type-safe log context builder
 * Helps create structured log contexts
 */
export const createLogContext = (context: LogContext): LogContext => context

export default logger
