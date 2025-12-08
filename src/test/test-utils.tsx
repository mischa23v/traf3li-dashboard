import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'

// Create a custom render function that includes providers
interface WrapperProps {
  children: ReactNode
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

function AllTheProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock API response helpers
export function mockApiResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export function mockApiError(message: string, status = 400): Promise<never> {
  return Promise.reject({
    response: {
      status,
      data: { message },
    },
  })
}

// Test data factories
export const createMockUser = (overrides = {}) => ({
  _id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  role: 'admin',
  phone: '+966500000000',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockCase = (overrides = {}) => ({
  _id: 'test-case-id',
  title: 'Test Case',
  caseNumber: 'CASE-001',
  status: 'active',
  clientId: 'client-1',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockClient = (overrides = {}) => ({
  _id: 'test-client-id',
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+966500000001',
  type: 'individual',
  createdAt: new Date().toISOString(),
  ...overrides,
})

// Wait helpers
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

// Accessibility helpers
export const getByAriaLabel = (container: HTMLElement, label: string) =>
  container.querySelector(`[aria-label="${label}"]`)

export const getAllByAriaLabel = (container: HTMLElement, label: string) =>
  container.querySelectorAll(`[aria-label="${label}"]`)

// Form helpers
export const fillInput = async (
  input: HTMLElement,
  value: string,
  userEvent: typeof import('@testing-library/user-event').default
) => {
  await userEvent.clear(input)
  await userEvent.type(input, value)
}
