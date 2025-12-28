/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a fallback UI
 * Enhanced with aggressive debugging support
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { captureReactError } from '@/lib/aggressive-debug'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
  showHomeButton?: boolean
  componentName?: string // Optional name for better error tracking
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, errorId: `react_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })

    // Always log with aggressive debug (it checks if enabled internally)
    captureReactError(error, errorInfo.componentStack || '', {
      componentName: this.props.componentName,
      url: window.location.href,
      pathname: window.location.pathname,
      errorId: this.state.errorId,
    })

    // Enhanced console logging in dev
    if (import.meta.env.DEV) {
      console.group('%c⚛️ React Error Boundary Caught Error', 'background: #cc00ff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;')
      console.log('%cError ID:', 'font-weight: bold;', this.state.errorId)
      console.log('%cError:', 'font-weight: bold;', error.message)
      console.log('%cComponent:', 'font-weight: bold;', this.props.componentName || 'Unknown')
      console.log('%cURL:', 'font-weight: bold;', window.location.href)
      if (error.stack) {
        console.log('%cStack Trace:', 'font-weight: bold;')
        console.log(error.stack)
      }
      if (errorInfo.componentStack) {
        console.log('%cComponent Stack:', 'font-weight: bold; color: #cc00ff;')
        console.log(errorInfo.componentStack)
      }
      console.groupEnd()
    }

    // Sentry integration
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          componentName: this.props.componentName,
          errorId: this.state.errorId,
        }
      })
    }

    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => this.setState({ hasError: false, error: null, errorInfo: null, errorId: null })
  handleGoHome = () => { window.location.href = '/' }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
          showHomeButton={this.props.showHomeButton}
          className={this.props.className}
          errorId={this.state.errorId}
          componentStack={this.state.errorInfo?.componentStack}
        />
      )
    }
    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
  onGoHome?: () => void
  showHomeButton?: boolean
  className?: string
  errorId?: string | null
  componentStack?: string | null
}

export function ErrorFallback({ error, onReset, onGoHome, showHomeButton = true, className, errorId, componentStack }: ErrorFallbackProps) {
  // Determine language from document dir since this might be used before React context is available
  const isArabic = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  // Fallback texts if i18n is not available
  const texts = {
    title: isArabic ? 'حدث خطأ غير متوقع' : 'Something went wrong',
    description: isArabic ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.' : "We're sorry. Please try again.",
    tryAgain: isArabic ? 'إعادة المحاولة' : 'Try Again',
    goHome: isArabic ? 'الصفحة الرئيسية' : 'Go Home',
    copyError: isArabic ? 'نسخ التفاصيل' : 'Copy Details',
    copied: isArabic ? 'تم النسخ!' : 'Copied!',
  }

  const copyErrorDetails = async () => {
    const details = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }
    await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
    // Show a brief visual feedback
    const btn = document.querySelector('[data-copy-btn]') as HTMLButtonElement
    if (btn) {
      const originalText = btn.textContent
      btn.textContent = texts.copied
      setTimeout(() => { btn.textContent = originalText }, 2000)
    }
  }

  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center p-8 text-center', className)} role="alert" aria-live="assertive">
      <div className="mb-6 rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-12 w-12 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">{texts.title}</h2>
      <p className="mb-6 max-w-md text-slate-600">{texts.description}</p>
      {errorId && (
        <p className="mb-4 text-xs text-slate-400 font-mono">Error ID: {errorId}</p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onReset} className="gap-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />{texts.tryAgain}</Button>
        {showHomeButton && onGoHome && <Button onClick={onGoHome} variant="outline" className="gap-2"><Home className="h-4 w-4" aria-hidden="true" />{texts.goHome}</Button>}
        {import.meta.env.DEV && error && (
          <Button onClick={copyErrorDetails} variant="outline" className="gap-2" data-copy-btn>
            <Copy className="h-4 w-4" aria-hidden="true" />{texts.copyError}
          </Button>
        )}
      </div>
      {import.meta.env.DEV && error && (
        <details className="mt-8 w-full max-w-2xl text-start">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2">
            <span>Error Details (Dev Mode)</span>
          </summary>
          <div className="mt-2 space-y-3">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <h4 className="font-semibold text-red-800 mb-2">Error Message:</h4>
              <pre className="text-sm text-red-600 whitespace-pre-wrap break-words">{error.message}</pre>
            </div>
            {error.stack && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Stack Trace:</h4>
                <pre className="text-xs text-slate-600 overflow-auto max-h-60 whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
            {componentStack && (
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Component Stack:</h4>
                <pre className="text-xs text-purple-600 overflow-auto max-h-60 whitespace-pre-wrap">{componentStack}</pre>
              </div>
            )}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Debug Info:</h4>
              <div className="text-xs text-blue-600 space-y-1">
                <p><strong>Error ID:</strong> {errorId || 'N/A'}</p>
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>Time:</strong> {new Date().toISOString()}</p>
              </div>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}

export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, props?: Omit<ErrorBoundaryProps, 'children'>) {
  return function WithErrorBoundary(componentProps: P) {
    return <ErrorBoundary {...props}><Component {...componentProps} /></ErrorBoundary>
  }
}
