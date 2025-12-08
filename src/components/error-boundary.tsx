/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Translation } from 'react-i18next'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Translation>
          {(t) => (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
              <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {t('errorBoundary.title')}
                </h1>

                <p className="text-slate-600 mb-6">
                  {t('errorBoundary.description')}
                </p>

                {/* Show request ID if available */}
                {this.state.error && 'requestId' in this.state.error && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-500 mb-1">
                      {t('errorBoundary.requestId')}
                    </p>
                    <p className="text-sm font-mono text-slate-700">
                      {(this.state.error as any).requestId}
                    </p>
                  </div>
                )}

                {import.meta.env.DEV && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-mono text-red-800 break-all">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs font-mono text-red-600 mt-2 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}

                <Button
                  onClick={this.handleReset}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                >
                  <RefreshCw className="ms-2 h-4 w-4" />
                  {t('errorBoundary.reload')}
                </Button>
              </div>
            </div>
          )}
        </Translation>
      )
    }

    return this.props.children
  }
}

/**
 * Hook to use error boundary in functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}

/**
 * Higher-Order Component (HOC) to wrap components with ErrorBoundary
 * @param Component - The component to wrap
 * @param fallback - Optional fallback UI to display on error
 * @returns A component wrapped with ErrorBoundary
 *
 * @example
 * const ProtectedComponent = withErrorBoundary(MyComponent)
 *
 * @example
 * const ProtectedComponent = withErrorBoundary(MyComponent, <CustomErrorPage />)
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  // Set display name for better debugging
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return ComponentWithErrorBoundary
}
