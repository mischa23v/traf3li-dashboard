import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary, ErrorFallback, withErrorBoundary } from '../error-boundary'
import { type ReactNode } from 'react'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that throws on render
const AlwaysThrowsError = () => {
  throw new Error('Component error')
}

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
    vi.clearAllMocks()
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should display error message in fallback', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    // Should show the default error message
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('should reset error state when reset button is clicked', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    // Error should be caught
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Change to not throw
    shouldThrow = false

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /try again/i })
    await user.click(resetButton)

    // Should show content now
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('should call onError callback when error is caught', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('should apply custom className to fallback', () => {
    const { container } = render(
      <ErrorBoundary className="custom-error-class">
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    const errorContainer = container.querySelector('.custom-error-class')
    expect(errorContainer).toBeInTheDocument()
  })

  it('should show home button by default', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
  })

  it('should hide home button when showHomeButton is false', () => {
    render(
      <ErrorBoundary showHomeButton={false}>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument()
  })

  it('should navigate to home when home button is clicked', async () => {
    const user = userEvent.setup()

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    const homeButton = screen.getByRole('button', { name: /go home/i })
    await user.click(homeButton)

    expect(window.location.href).toBe('/')
  })

  it('should have proper accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('should show error details in development mode', () => {
    // In test environment, DEV mode is already enabled
    // Skip this test as it's environment-dependent
    if (!import.meta.env.DEV) {
      return
    }

    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    // Should show error details in development
    const details = screen.queryByText('Error Details')
    if (import.meta.env.DEV) {
      expect(details).toBeInTheDocument()
    }
  })

  it('should send error to Sentry if available', () => {
    const mockSentry = {
      captureException: vi.fn(),
    }

    // Mock Sentry on window
    ;(window as any).Sentry = mockSentry

    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    expect(mockSentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          componentStack: expect.any(String),
        }),
      })
    )

    // Cleanup
    delete (window as any).Sentry
  })
})

describe('ErrorFallback', () => {
  it('should render error message', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should call onReset when Try Again button is clicked', async () => {
    const user = userEvent.setup()
    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    const resetButton = screen.getByRole('button', { name: /try again/i })
    await user.click(resetButton)

    expect(onReset).toHaveBeenCalledOnce()
  })

  it('should call onGoHome when Go Home button is clicked', async () => {
    const user = userEvent.setup()
    const error = new Error('Test error')
    const onReset = vi.fn()
    const onGoHome = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} onGoHome={onGoHome} />)

    const homeButton = screen.getByRole('button', { name: /go home/i })
    await user.click(homeButton)

    expect(onGoHome).toHaveBeenCalledOnce()
  })

  it('should display English text by default', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should display Arabic text when document dir is rtl', () => {
    // Set RTL direction
    document.documentElement.dir = 'rtl'

    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument()

    // Reset
    document.documentElement.dir = 'ltr'
  })

  it('should not show home button when showHomeButton is false', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} showHomeButton={false} />)

    expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    const { container } = render(
      <ErrorFallback error={error} onReset={onReset} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should show error details in development mode', () => {
    // In test environment, DEV mode is already enabled
    if (!import.meta.env.DEV) {
      return
    }

    const error = new Error('Test error message')
    error.stack = 'Error stack trace'
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    // Should show error details in development
    const details = screen.queryByText('Error Details')
    if (import.meta.env.DEV) {
      expect(details).toBeInTheDocument()
      // Should show error message and stack
      expect(screen.getByText(/Test error message/)).toBeInTheDocument()
    }
  })

  it('should have proper ARIA attributes for accessibility', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })

  it('should render icon with aria-hidden', () => {
    const error = new Error('Test error')
    const onReset = vi.fn()

    const { container } = render(<ErrorFallback error={error} onReset={onReset} />)

    const icons = container.querySelectorAll('[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
  })
})

describe('withErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('should wrap component with ErrorBoundary', () => {
    const TestComponent = () => <div>Test</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(AlwaysThrowsError)

    render(<WrappedComponent />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should pass props to wrapped component', () => {
    interface TestProps {
      message: string
    }

    const TestComponent = ({ message }: TestProps) => <div>{message}</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent message="Hello" />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should apply ErrorBoundary props from HOC', () => {
    const onError = vi.fn()
    const WrappedComponent = withErrorBoundary(AlwaysThrowsError, { onError })

    render(<WrappedComponent />)

    expect(onError).toHaveBeenCalled()
  })

  it('should use custom fallback from HOC props', () => {
    const customFallback = <div>HOC custom fallback</div>
    const WrappedComponent = withErrorBoundary(AlwaysThrowsError, {
      fallback: customFallback,
    })

    render(<WrappedComponent />)

    expect(screen.getByText('HOC custom fallback')).toBeInTheDocument()
  })
})

describe('Edge Cases', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('should handle null error gracefully', () => {
    const onReset = vi.fn()

    render(<ErrorFallback error={null} onReset={onReset} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should handle error without stack trace', () => {
    const error = new Error('Error without stack')
    delete (error as any).stack
    const onReset = vi.fn()

    render(<ErrorFallback error={error} onReset={onReset} />)

    // Should show error alert
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // In DEV mode, should show error message
    if (import.meta.env.DEV) {
      expect(screen.getByText('Error without stack')).toBeInTheDocument()
    }
  })

  it('should handle multiple errors in sequence', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    // Should still show error UI
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should not call Sentry if not available', () => {
    // Ensure Sentry is not available
    delete (window as any).Sentry

    render(
      <ErrorBoundary>
        <AlwaysThrowsError />
      </ErrorBoundary>
    )

    // Should not throw error
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
