import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  featureName?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  showRetryButton?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// Error boundary class component (required for componentDidCatch)
class FeatureErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Report to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        featureName: this.props.featureName,
      },
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log for debugging
    console.error('Feature Error:', {
      feature: this.props.featureName,
      error,
      componentStack: errorInfo.componentStack,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleGoBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallbackUI
          error={this.state.error}
          featureName={this.props.featureName}
          onRetry={this.props.showRetryButton !== false ? this.handleRetry : undefined}
          onGoHome={this.props.showHomeButton !== false ? this.handleGoHome : undefined}
          onGoBack={this.props.showBackButton ? this.handleGoBack : undefined}
        />
      )
    }

    return this.props.children
  }
}

// Functional component for the error UI (can use hooks)
function ErrorFallbackUI({
  error,
  featureName,
  onRetry,
  onGoHome,
  onGoBack,
}: {
  error: Error | null
  featureName?: string
  onRetry?: () => void
  onGoHome?: () => void
  onGoBack?: () => void
}) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        {t('common.somethingWentWrong')}
      </h2>

      <p className="text-muted-foreground mb-2 max-w-md">
        {t('common.errorApology')}
      </p>

      {featureName && (
        <p className="text-sm text-muted-foreground mb-4">
          {t('common.feature')}: {featureName}
        </p>
      )}

      {import.meta.env.DEV && error && (
        <details className="mb-6 max-w-lg text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            {t('common.errorDetailsForDevelopers')}
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('common.goBack')}
          </Button>
        )}

        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.tryAgain')}
          </Button>
        )}

        {onGoHome && (
          <Button onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            {t('common.goHome')}
          </Button>
        )}
      </div>
    </div>
  )
}

// HOC for wrapping components
export function withFeatureErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <FeatureErrorBoundaryClass {...options}>
        <Component {...props} />
      </FeatureErrorBoundaryClass>
    )
  }
}

// Hook-friendly wrapper component
export function FeatureErrorBoundary(props: Props) {
  return <FeatureErrorBoundaryClass {...props} />
}

// Pre-configured boundaries for specific features
export const CasesErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="Cases" {...props} />
)

export const FinanceErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="Finance" {...props} />
)

export const HRErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="HR" {...props} />
)

export const AssetsErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="Assets" {...props} />
)

export const InventoryErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="Inventory" {...props} />
)

export const CRMErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="CRM" {...props} />
)

export const SettingsErrorBoundary = (props: Omit<Props, 'featureName'>) => (
  <FeatureErrorBoundaryClass featureName="Settings" {...props} />
)

export { ErrorFallbackUI }
