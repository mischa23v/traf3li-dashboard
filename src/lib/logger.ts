/**
 * Centralized Logging Utility
 *
 * SECURITY: This logger prevents sensitive data from leaking to production console
 *
 * FEATURES:
 * - Automatic suppression in production (unless explicitly enabled)
 * - Log levels (debug, info, warn, error)
 * - Structured logging with context
 * - Sensitive data redaction
 * - Integration with external logging services (Sentry, etc.)
 *
 * USAGE:
 * import { logger } from '@/lib/logger'
 * logger.info('User logged in', { userId: '123' })
 * logger.error('API call failed', error, { endpoint: '/api/users' })
 */

// ==================== TYPES ====================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

export interface LoggerConfig {
  /**
   * Minimum log level to output
   * 'none' disables all logging
   */
  level: LogLevel

  /**
   * Enable logging in production (use with caution!)
   */
  enableInProduction: boolean

  /**
   * Patterns for sensitive data that should be redacted
   */
  sensitivePatterns: RegExp[]

  /**
   * Keys that should always be redacted
   */
  sensitiveKeys: string[]

  /**
   * Custom log handler (e.g., send to external service)
   */
  onLog?: (entry: LogEntry) => void

  /**
   * Prefix for all log messages
   */
  prefix?: string
}

// ==================== LOG LEVEL HIERARCHY ====================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
}

// ==================== DEFAULT CONFIG ====================

const DEFAULT_CONFIG: LoggerConfig = {
  level: import.meta.env.DEV ? 'debug' : 'error',
  enableInProduction: false,
  sensitivePatterns: [
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /authorization/i,
    /bearer/i,
    /cookie/i,
    /session/i,
    /credit[_-]?card/i,
    /ssn/i,
    /national[_-]?id/i,
  ],
  sensitiveKeys: [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'sessionId',
    'creditCard',
    'ssn',
    'nationalId',
    'plaidAccessToken',
    'smtpPassword',
  ],
}

// ==================== LOGGER CLASS ====================

class Logger {
  private config: LoggerConfig
  private isProduction: boolean

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.isProduction = !import.meta.env.DEV
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    // Never log in production unless explicitly enabled
    if (this.isProduction && !this.config.enableInProduction) {
      // Always allow errors in production for critical issues
      return level === 'error'
    }

    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  /**
   * Redact sensitive data from context
   */
  private redactSensitive(context: LogContext): LogContext {
    const redacted: LogContext = {}

    for (const [key, value] of Object.entries(context)) {
      // Check if key is sensitive
      const isSensitiveKey = this.config.sensitiveKeys.some(
        (sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase())
      )

      // Check if key matches sensitive patterns
      const matchesPattern = this.config.sensitivePatterns.some(
        (pattern) => pattern.test(key)
      )

      if (isSensitiveKey || matchesPattern) {
        redacted[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        redacted[key] = this.redactSensitive(value as LogContext)
      } else if (typeof value === 'string') {
        // Check if value looks like a token or sensitive data
        if (value.length > 20 && /^[A-Za-z0-9+/=_-]+$/.test(value)) {
          // Looks like a token/hash - show only first/last few chars
          redacted[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        } else {
          redacted[key] = value
        }
      } else {
        redacted[key] = value
      }
    }

    return redacted
  }

  /**
   * Format message with prefix
   */
  private formatMessage(message: string): string {
    if (this.config.prefix) {
      return `[${this.config.prefix}] ${message}`
    }
    return message
  }

  /**
   * Create log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message: this.formatMessage(message),
      timestamp: new Date().toISOString(),
      context: context ? this.redactSensitive(context) : undefined,
      error,
    }
  }

  /**
   * Output log to console
   */
  private output(entry: LogEntry): void {
    const { level, message, context, error } = entry

    const consoleMethod = level === 'debug' ? 'log' : level

    if (context && error) {
      console[consoleMethod](message, context, error)
    } else if (context) {
      console[consoleMethod](message, context)
    } else if (error) {
      console[consoleMethod](message, error)
    } else {
      console[consoleMethod](message)
    }
  }

  /**
   * Log at specified level
   */
  private log(
    level: LogLevel,
    message: string,
    contextOrError?: LogContext | Error,
    maybeContext?: LogContext
  ): void {
    if (!this.shouldLog(level)) {
      return
    }

    let context: LogContext | undefined
    let error: Error | undefined

    // Handle overloaded arguments
    if (contextOrError instanceof Error) {
      error = contextOrError
      context = maybeContext
    } else {
      context = contextOrError
    }

    const entry = this.createEntry(level, message, context, error)

    // Output to console
    this.output(entry)

    // Call custom handler if configured
    this.config.onLog?.(entry)
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void
  warn(message: string, error: Error, context?: LogContext): void
  warn(message: string, contextOrError?: LogContext | Error, maybeContext?: LogContext): void {
    this.log('warn', message, contextOrError, maybeContext)
  }

  /**
   * Error level logging (always output, even in production)
   */
  error(message: string, context?: LogContext): void
  error(message: string, error: Error, context?: LogContext): void
  error(message: string, contextOrError?: LogContext | Error, maybeContext?: LogContext): void {
    this.log('error', message, contextOrError, maybeContext)
  }

  /**
   * Create a child logger with additional context
   */
  child(prefix: string): Logger {
    const childConfig: Partial<LoggerConfig> = {
      ...this.config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    }
    return new Logger(childConfig)
  }

  /**
   * Create a logger that captures all logs to an array (useful for testing)
   */
  static createTestLogger(): { logger: Logger; logs: LogEntry[] } {
    const logs: LogEntry[] = []
    const logger = new Logger({
      level: 'debug',
      enableInProduction: true,
      onLog: (entry) => logs.push(entry),
    })
    return { logger, logs }
  }
}

// ==================== SINGLETON INSTANCE ====================

export const logger = new Logger()

// ==================== NAMESPACE LOGGERS ====================

/**
 * Pre-configured loggers for different namespaces
 */
export const loggers = {
  auth: logger.child('Auth'),
  api: logger.child('API'),
  permission: logger.child('Permission'),
  socket: logger.child('Socket'),
  ui: logger.child('UI'),
  finance: logger.child('Finance'),
  cache: logger.child('Cache'),
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Create a logger for a specific module/feature
 */
export function createLogger(namespace: string): Logger {
  return logger.child(namespace)
}

/**
 * Configure the global logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  logger.configure(config)
}

/**
 * Integration with Sentry or other error tracking
 */
export function setupErrorTracking(
  captureException: (error: Error, context?: Record<string, unknown>) => void
): void {
  logger.configure({
    onLog: (entry) => {
      if (entry.level === 'error' && entry.error) {
        captureException(entry.error, {
          message: entry.message,
          ...entry.context,
        })
      }
    },
  })
}

export default logger
