import { lazy, Suspense, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Utility for lazy loading React components with better error handling and loading states
 *
 * @example
 * ```tsx
 * const Chart = lazyImport(() => import('./chart'), <ChartSkeleton />)
 *
 * function Page() {
 *   return <Chart data={data} />
 * }
 * ```
 */

// Default loading skeleton
const DefaultLoadingSkeleton = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px] p-6">
    <div className="w-full space-y-4">
      <Skeleton className="h-8 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-8 w-3/4 rounded-xl" />
    </div>
  </div>
)

/**
 * Lazy import utility with automatic Suspense wrapper
 *
 * @param factory - The import() function that returns a component
 * @param fallback - Optional custom loading fallback (defaults to Skeleton)
 * @returns A wrapped component that can be used directly
 */
export function lazyImport<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(factory)

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultLoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Lazy import for named exports
 *
 * @example
 * ```tsx
 * const AnalyticsChart = lazyNamedImport(
 *   () => import('./charts'),
 *   'AnalyticsChart',
 *   <ChartSkeleton />
 * )
 * ```
 */
export function lazyNamedImport<T extends ComponentType<any>>(
  factory: () => Promise<any>,
  name: string,
  fallback?: React.ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(() =>
    factory().then((module) => ({ default: module[name] }))
  )

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultLoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Custom skeleton components for specific heavy components
 */
export const ChartSkeleton = () => (
  <div className="w-full space-y-3 p-4">
    <Skeleton className="h-6 w-32 rounded-xl" />
    <Skeleton className="h-64 w-full rounded-xl" />
    <div className="flex justify-between gap-4">
      <Skeleton className="h-4 w-20 rounded-xl" />
      <Skeleton className="h-4 w-20 rounded-xl" />
      <Skeleton className="h-4 w-20 rounded-xl" />
    </div>
  </div>
)

export const CalendarSkeleton = () => (
  <div className="w-full space-y-4 p-6">
    <Skeleton className="h-12 w-full rounded-xl mb-6" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  </div>
)

export const MapSkeleton = () => (
  <div className="w-full h-[400px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
    <div className="text-slate-400 text-sm">Loading map...</div>
  </div>
)

export const EditorSkeleton = () => (
  <div className="w-full space-y-3 p-4 border border-slate-200 rounded-xl">
    <div className="flex gap-2 pb-3 border-b border-slate-200">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-8 rounded" />
      ))}
    </div>
    <Skeleton className="h-48 w-full rounded" />
  </div>
)

export const TableSkeleton = () => (
  <div className="w-full space-y-3 p-4">
    <Skeleton className="h-10 w-full rounded-xl" />
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-xl" />
    ))}
  </div>
)

export const FlowSkeleton = () => (
  <div className="w-full h-[600px] bg-slate-50 rounded-xl animate-pulse flex items-center justify-center border border-slate-200">
    <div className="text-slate-400 text-sm">Loading diagram...</div>
  </div>
)

export const DashboardSkeleton = () => (
  <div className="w-full min-h-screen bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
    {/* Hero Banner Skeleton */}
    <Skeleton className="h-48 w-full rounded-3xl" />
    {/* Tabs Skeleton */}
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-xl" />
      ))}
    </div>
    {/* Content Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    </div>
  </div>
)
