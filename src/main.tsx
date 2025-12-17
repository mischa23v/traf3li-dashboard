import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { smartRetry, smartRetryDelay } from '@/lib/query-retry-config'
import { ErrorBoundary } from '@/components/error-boundary'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
import { initSentry } from '@/lib/sentry'
import { initAnalytics, trackPageView } from '@/lib/analytics'
import { initWebVitals } from '@/lib/web-vitals'
import { consoleLogger } from '@/utils/console-logger'
// Import i18n configuration
import './i18n'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

// Initialize Sentry before app renders
initSentry()

// Initialize console logger in development
if (import.meta.env.DEV) {
  consoleLogger.init()
}

// Initialize analytics
initAnalytics()

// Initialize Web Vitals monitoring
initWebVitals()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Gold Standard: Smart retry with exponential backoff + jitter
      // - Never retries 4xx errors (except 429 with backoff)
      // - Uses Retry-After header when available
      // - Prevents thundering herd with jitter
      retry: smartRetry,
      retryDelay: smartRetryDelay,
      refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
      refetchIntervalInBackground: false, // Stop polling when tab is hidden (saves API calls)
      staleTime: 2 * 60 * 1000, // 2 minutes (increased from 10s for better caching)
      gcTime: 5 * 60 * 1000, // 5 minutes in cache (renamed from cacheTime in React Query v5)
    },
    mutations: {
      // More conservative retry for mutations - only network errors
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false
        // Only retry on network errors or 429 for mutations
        if (error instanceof AxiosError) {
          return !error.response || error.response.status === 429
        }
        return false
      },
      retryDelay: smartRetryDelay,
      onError: (error) => {
        handleServerError(error)
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        // DON'T auto-logout on 401 here - this triggers on ANY query failure
        // The auth check in _authenticated route handles session expiry properly
        // Calling logout() here causes loops when Redis/backend has issues
        if (error.response?.status === 401) {
          // Just show toast, don't logout - let the route guard handle it
          toast.error('Session expired!')
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Track page views on route changes
router.subscribe('onResolved', ({ toLocation }) => {
  trackPageView(toLocation.pathname, document.title)
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <RouterProvider router={router} />
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}