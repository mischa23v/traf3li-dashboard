import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'
import { EmptyState, NoResultsState, NoDataState, ErrorState } from '../empty-state'

describe('EmptyState', () => {
  it('should render with title', () => {
    render(<EmptyState title="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(
      <EmptyState
        title="No items"
        description="Add some items to get started"
      />
    )
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument()
  })

  it('should render action button and handle click', async () => {
    const handleAction = vi.fn()
    const user = userEvent.setup()

    render(
      <EmptyState
        title="No items"
        actionLabel="Add Item"
        onAction={handleAction}
      />
    )

    const button = screen.getByRole('button', { name: /add item/i })
    await user.click(button)

    expect(handleAction).toHaveBeenCalledOnce()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<EmptyState title="Test" size="sm" />)
    expect(screen.getByText('Test')).toBeInTheDocument()

    rerender(<EmptyState title="Test" size="lg" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('NoResultsState', () => {
  it('should render no results message', () => {
    render(<NoResultsState />)
    // Check for translated text
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should show search query when provided', () => {
    render(<NoResultsState searchQuery="test query" />)
    expect(screen.getByText(/test query/i)).toBeInTheDocument()
  })

  it('should handle clear action', async () => {
    const handleClear = vi.fn()
    const user = userEvent.setup()

    render(<NoResultsState searchQuery="test" onClear={handleClear} />)

    const clearButton = screen.getByRole('button')
    await user.click(clearButton)

    expect(handleClear).toHaveBeenCalledOnce()
  })
})

describe('NoDataState', () => {
  it('should render with entity name', () => {
    render(<NoDataState entityName="clients" />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should handle add action', async () => {
    const handleAdd = vi.fn()
    const user = userEvent.setup()

    render(<NoDataState entityName="items" onAdd={handleAdd} />)

    const addButton = screen.getByRole('button')
    await user.click(addButton)

    expect(handleAdd).toHaveBeenCalledOnce()
  })
})

describe('ErrorState', () => {
  it('should render error message', () => {
    render(<ErrorState />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    render(<ErrorState message="Custom error" />)
    expect(screen.getByText('Custom error')).toBeInTheDocument()
  })

  it('should handle retry action', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()

    render(<ErrorState onRetry={handleRetry} />)

    const retryButton = screen.getByRole('button')
    await user.click(retryButton)

    expect(handleRetry).toHaveBeenCalledOnce()
  })
})
