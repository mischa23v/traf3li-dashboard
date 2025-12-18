# Route Prefetching Implementation

This document describes the route prefetching and lazy loading implementation for improved navigation performance.

## Overview

The application uses **TanStack Router** with comprehensive prefetching strategies to ensure fast navigation:

1. **Intent-based prefetching**: Routes are automatically prefetched when users hover over links
2. **Idle-time prefetching**: Common routes are prefetched during browser idle time
3. **Lazy loading**: Heavy components are code-split for faster initial load
4. **Manual prefetching**: Hooks available for custom prefetching logic

## Configuration

### Router Configuration (main.tsx)

```typescript
const router = createRouter({
  routeTree,
  context: { queryClient },
  // Preload routes when user hovers over links
  defaultPreload: 'intent',
  // Start prefetching after 50ms of hover
  defaultPreloadDelay: 50,
  // Always fetch fresh data (0) or cache (higher values)
  defaultPreloadStaleTime: 0,
  // Cache prefetched routes for 30 seconds
  defaultPreloadMaxAge: 30000,
})
```

### Prefetch Priority Configuration

High and low priority routes are configured in `/src/utils/route-prefetch-config.ts`:

```typescript
export const HIGH_PRIORITY_ROUTES = [
  '/dashboard/cases',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/calendar',
]

export const LOW_PRIORITY_ROUTES = [
  '/dashboard/billing-rates',
  '/dashboard/cases/pipeline',
  '/dashboard/cases/pipeline/board',
]
```

**When to update this:**
- Add frequently accessed routes to `HIGH_PRIORITY_ROUTES`
- Add less common but important routes to `LOW_PRIORITY_ROUTES`
- Group related routes in `ROUTE_GROUPS` for batch prefetching

## Usage

### 1. Automatic Hover Prefetching

All TanStack Router `<Link>` components automatically prefetch on hover:

```tsx
import { Link } from '@tanstack/react-router'

// Automatically prefetches after 50ms of hover
<Link to="/dashboard/cases">Cases</Link>
```

### 2. Manual Prefetching Hook

Use `useRoutePrefetch()` for custom prefetching logic:

```tsx
import { useRoutePrefetch } from '@/hooks/use-route-prefetch'

function NavigationMenu() {
  const prefetch = useRoutePrefetch()

  return (
    <div
      onMouseEnter={() => prefetch('/dashboard/cases')}
      onClick={() => navigate('/dashboard/cases')}
    >
      Cases
    </div>
  )
}
```

### 3. Batch Prefetching

Prefetch multiple routes at once:

```tsx
import { useBatchRoutePrefetch } from '@/hooks/use-route-prefetch'

function Dashboard() {
  const prefetchRoutes = useBatchRoutePrefetch()

  useEffect(() => {
    // Prefetch related routes when dashboard loads
    prefetchRoutes([
      '/dashboard/cases',
      '/dashboard/clients',
      '/dashboard/contacts'
    ])
  }, [])

  return <div>Dashboard</div>
}
```

### 4. Idle-Time Prefetching

The `RoutePrefetchLoader` component automatically prefetches common routes during idle time:

```tsx
// Already added in main.tsx
<RoutePrefetchLoader />
```

This component:
- Waits 2 seconds, then prefetches high-priority routes during idle time
- Waits 5 seconds, then prefetches low-priority routes during idle time
- Uses `requestIdleCallback` to avoid blocking main thread

## Lazy Loading Routes

### Converting a Route to Lazy Loading

**Before:**
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { CasesListView } from '@/features/cases/components/cases-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/')({
  component: CasesListView,
})
```

**After:**
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { lazyImport, TableSkeleton } from '@/utils/lazy-import'

// Lazy load with skeleton fallback
const CasesListView = lazyImport(
  () => import('@/features/cases/components/cases-list-view').then(
    mod => ({ default: mod.CasesListView })
  ),
  <TableSkeleton />
)

export const Route = createFileRoute('/_authenticated/dashboard/cases/')({
  component: CasesListView,
})
```

### Available Skeleton Components

Use appropriate skeletons from `/src/utils/lazy-import.tsx`:

- `<DashboardSkeleton />` - Full dashboard layouts
- `<TableSkeleton />` - Data tables and lists
- `<ChartSkeleton />` - Charts and analytics
- `<CalendarSkeleton />` - Calendar views
- `<MapSkeleton />` - Map components
- `<EditorSkeleton />` - Rich text editors
- `<FlowSkeleton />` - Flowcharts and diagrams

### Routes Already Using Lazy Loading

The following routes have been converted to lazy loading:

1. `/dashboard/cases` - Cases list (TableSkeleton)
2. `/dashboard/cases/$caseId` - Case details (DashboardSkeleton)
3. `/dashboard/cases/pipeline/board` - Pipeline board (DashboardSkeleton)
4. `/dashboard/clients` - Clients list (TableSkeleton)
5. `/dashboard/contacts` - Contacts list (TableSkeleton)
6. `/dashboard/billing-rates` - Billing rates (TableSkeleton)
7. `/dashboard/calendar` - Calendar view (CalendarSkeleton)

## Performance Monitoring

### Measuring Prefetch Performance

Use browser DevTools to monitor prefetching:

1. Open DevTools → Network tab
2. Filter by "JS" or "Fetch/XHR"
3. Look for requests with "(prefetch)" label
4. Monitor timing and size of prefetched resources

### Key Metrics to Track

- **Time to Interactive (TTI)**: How long until the app is interactive
- **Route Change Duration**: Time from click to new route rendering
- **Cache Hit Rate**: How often prefetched routes are used
- **Bundle Size**: Size of lazy-loaded chunks

### Optimizing Prefetch Strategy

If prefetching causes performance issues:

1. **Increase delays**: Adjust `defaultPreloadDelay` in router config
2. **Reduce priority routes**: Remove less-used routes from HIGH_PRIORITY_ROUTES
3. **Disable idle prefetch**: Remove or disable `RoutePrefetchLoader`
4. **Lazy load more**: Convert more heavy routes to lazy loading

## Best Practices

### When to Use Lazy Loading

✅ **DO lazy load:**
- Heavy components (tables, charts, editors)
- Routes with large dependencies
- Less frequently accessed routes
- Components with expensive initialization

❌ **DON'T lazy load:**
- Small, frequently used components
- Critical path components (auth, layouts)
- Components that need immediate rendering
- Routes with minimal JavaScript

### When to Prefetch

✅ **DO prefetch:**
- Routes user is likely to visit next
- Related routes in the same workflow
- Common navigation destinations
- Routes after user actions (on hover, on click)

❌ **DON'T prefetch:**
- Routes user may never visit
- Routes with large data requirements
- Routes behind authentication walls (if not authenticated)
- Too many routes at once (causes network congestion)

### Navigation Component Updates

All navigation components have been updated with prefetching:

- `/src/components/layout/nav-group.tsx` - Sidebar navigation
- Main navigation links automatically prefetch on hover
- Dropdown menu items prefetch when hovered

## Troubleshooting

### Routes Not Prefetching

1. Check browser console for errors
2. Verify route exists in router configuration
3. Check network tab for failed requests
4. Ensure `defaultPreload: 'intent'` is set in router config

### Lazy Loading Issues

1. Verify import path is correct
2. Check that component is exported correctly
3. Ensure skeleton component is imported
4. Look for Suspense boundary errors in console

### Performance Degradation

1. Reduce number of prefetched routes
2. Increase prefetch delays
3. Disable idle prefetching temporarily
4. Check bundle sizes of lazy-loaded chunks

## Future Enhancements

Potential improvements to consider:

1. **Viewport-based prefetching**: Prefetch routes for visible links
2. **Machine learning predictions**: Use analytics to predict next route
3. **Progressive prefetching**: Prefetch in waves based on priority
4. **Service Worker caching**: Cache prefetched routes in service worker
5. **Network-aware prefetching**: Adjust strategy based on connection speed

## Related Files

- `/src/main.tsx` - Router configuration
- `/src/hooks/use-route-prefetch.ts` - Prefetch hooks
- `/src/hooks/use-idle-prefetch.ts` - Idle prefetching logic
- `/src/utils/lazy-import.tsx` - Lazy loading utilities
- `/src/utils/route-prefetch-config.ts` - Prefetch configuration
- `/src/components/route-prefetch-loader.tsx` - Auto-prefetch component
- `/src/components/layout/nav-group.tsx` - Navigation with prefetching
