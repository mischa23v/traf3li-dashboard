/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a fallback UI
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  className?: string
  showHomeButton?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    if (import.meta.env.DEV) {
      console.warn('[ErrorBoundary] Caught:', error, errorInfo.componentStack)
    }
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
    }
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => this.setState({ hasError: false, error: null, errorInfo: null })
  handleGoHome = () => { window.location.href = '/' }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} onGoHome={this.handleGoHome} showHomeButton={this.props.showHomeButton} className={this.props.className} />
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
}

export function ErrorFallback({ error, onReset, onGoHome, showHomeButton = true, className }: ErrorFallbackProps) {
  const isArabic = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const texts = {
    title: isArabic ? 'حدث خطأ غير متوقع' : 'Something went wrong',
    description: isArabic ? 'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.' : "We're sorry. Please try again.",
    tryAgain: isArabic ? 'حاول مرة أخرى' : 'Try Again',
    goHome: isArabic ? 'الصفحة الرئيسية' : 'Go Home',
  }

  return (
    <div className={cn('flex min-h-[400px] flex-col items-center justify-center p-8 text-center', className)} role="alert" aria-live="assertive">
      <div className="mb-6 rounded-full bg-red-100 p-4">
        <AlertTriangle className="h-12 w-12 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-900">{texts.title}</h2>
      <p className="mb-6 max-w-md text-slate-600">{texts.description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onReset} className="gap-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />{texts.tryAgain}</Button>
        {showHomeButton && onGoHome && <Button onClick={onGoHome} variant="outline" className="gap-2"><Home className="h-4 w-4" aria-hidden="true" />{texts.goHome}</Button>}
      </div>
      {import.meta.env.DEV && error && (
        <details className="mt-8 w-full max-w-2xl text-start">
          <summary className="cursor-pointer text-sm text-slate-500">Error Details</summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-slate-100 p-4 text-xs text-red-600">{error.message}{error.stack && `\n\n${error.stack}`}</pre>
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
