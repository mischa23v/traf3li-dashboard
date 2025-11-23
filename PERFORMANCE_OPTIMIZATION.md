# Performance Optimization Guide

## Summary of Optimizations Applied

### ✅ 1. API Client Optimizations

**Added:**
- Request caching (2-minute cache for GET requests)
- Automatic retry logic with exponential backoff
- Reduced timeout from 30s to 15s
- Better error handling for network issues

**Benefits:**
- Fewer API calls = faster page loads
- Automatic recovery from transient network errors
- Better user experience during network issues

### ✅ 2. TanStack Query Configuration

Your app already uses TanStack Query with `staleTime: 2 * 60 * 1000` (2 minutes), which is excellent for caching.

### ✅ 3. Error Boundary Added

Added global error boundary to gracefully handle React errors without crashing the entire app.

---

## Additional Optimizations to Apply

### 1. Image Optimization

**Problem:** Missing images causing 404 errors

```
01.png: 1 Failed to load resource: the server responded with a status of 404
shadcn.jpg: 1 Failed to load resource: the server responded with a status of 404
```

**Solutions:**

#### a) Add placeholder images

```typescript
// src/lib/utils.ts
export const getImageUrl = (path: string | undefined) => {
  if (!path) return '/placeholder-avatar.png';

  // Handle external URLs
  if (path.startsWith('http')) return path;

  // Handle local paths with fallback
  return path || '/placeholder-avatar.png';
};

// Usage in components
<img
  src={getImageUrl(user.image)}
  alt={user.username}
  onError={(e) => {
    e.currentTarget.src = '/placeholder-avatar.png';
  }}
/>
```

#### b) Lazy load images

```typescript
<img
  src={imageUrl}
  loading="lazy"  // ✅ Native lazy loading
  alt="..."
/>
```

#### c) Use WebP format with fallback

```tsx
<picture>
  <source srcSet="/images/avatar.webp" type="image/webp" />
  <img src="/images/avatar.png" alt="Avatar" />
</picture>
```

### 2. Code Splitting & Lazy Loading

**Current:** All components load immediately

**Optimized:** Load components only when needed

```typescript
// Before
import { CalendarView } from '@/features/dashboard/components/calendar-view'

// After - Lazy load
import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const CalendarView = lazy(() =>
  import('@/features/dashboard/components/calendar-view').then(module => ({
    default: module.CalendarView
  }))
)

export const Route = createFileRoute('/_authenticated/dashboard/calendar')({
  component: () => (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarView />
    </Suspense>
  ),
})

// Skeleton component for better UX
const CalendarSkeleton = () => (
  <div className="p-6">
    <Skeleton className="h-48 w-full rounded-3xl mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Skeleton className="lg:col-span-3 h-[700px] rounded-3xl" />
      <Skeleton className="lg:col-span-9 h-[700px] rounded-3xl" />
    </div>
  </div>
)
```

### 3. Optimize React Query Configuration

**Create optimized query client:**

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,        // 2 minutes (already set)
      cacheTime: 5 * 60 * 1000,        // 5 minutes in cache
      refetchOnWindowFocus: false,     // Don't refetch on window focus
      refetchOnReconnect: true,        // Refetch when internet reconnects
      retry: 2,                        // Retry failed requests 2 times
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 4000);
      },
    },
    mutations: {
      retry: 1,  // Retry mutations once
    },
  },
})
```

### 4. Prefetch Data for Better Navigation

**Prefetch calendar data when user hovers over calendar link:**

```typescript
import { useQueryClient } from '@tanstack/react-query'
import calendarService from '@/services/calendarService'

function NavigationLink() {
  const queryClient = useQueryClient()

  const prefetchCalendar = () => {
    const dateRange = {
      startDate: '...',
      endDate: '...',
    }

    queryClient.prefetchQuery({
      queryKey: ['calendar', dateRange],
      queryFn: () => calendarService.getCalendar(dateRange),
    })
  }

  return (
    <a
      href="/dashboard/calendar"
      onMouseEnter={prefetchCalendar}  // Prefetch on hover
    >
      التقويم
    </a>
  )
}
```

### 5. Optimize Calendar Rendering

**Use virtualization for large lists:**

```bash
npm install react-window
# or
yarn add react-window
```

```typescript
import { FixedSizeList } from 'react-window'

// For the daily agenda sidebar with many items
function DailyAgenda({ items }: { items: CalendarItem[] }) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <CalendarItemCard item={items[index]} />
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

### 6. Debounce Search Inputs

**Prevent excessive API calls during typing:**

```typescript
import { useMemo, useState } from 'react'
import { debounce } from 'lodash-es'  // or write your own

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search API call
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      // Make API call
      searchAPI(term)
    }, 500),  // Wait 500ms after user stops typing
    []
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  return (
    <input
      value={searchTerm}
      onChange={handleSearch}
      placeholder="بحث..."
    />
  )
}
```

### 7. Optimize Bundle Size

**Analyze your bundle:**

```bash
npm run build -- --analyze
```

**Install bundle analyzer:**

```bash
npm install -D rollup-plugin-visualizer
# or
yarn add -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,  // Open report in browser after build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

### 8. Add Service Worker for Offline Support

```bash
npm install vite-plugin-pwa
# or
yarn add vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Traf3li Dashboard',
        short_name: 'Traf3li',
        theme_color: '#1e40af',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.traf3li\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
})
```

### 9. Optimize TanStack Router

**Use router prefetching:**

```typescript
import { Link } from '@tanstack/react-router'

<Link
  to="/dashboard/calendar"
  preload="intent"  // Prefetch on hover
>
  التقويم
</Link>
```

### 10. Add Loading Skeletons Everywhere

Replace generic spinners with content-aware skeletons:

```typescript
// src/components/skeletons/calendar-skeleton.tsx
export function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// Usage in calendar
if (isLoading) {
  return <CalendarSkeleton />
}
```

---

## Environment-Specific Optimizations

### Production Build

```json
// package.json
{
  "scripts": {
    "build": "vite build --mode production",
    "build:analyze": "vite build --mode production && vite-bundle-analyzer"
  }
}
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Monitoring & Debugging

### 1. Add Performance Monitoring

```typescript
// src/lib/performance.ts
export const measurePerformance = (name: string) => {
  const start = performance.now()

  return () => {
    const duration = performance.now() - start
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      })
    }
  }
}

// Usage
const done = measurePerformance('Calendar Load')
await loadCalendar()
done()
```

### 2. Add Error Tracking

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### 3. Monitor API Calls

Add logging to track slow requests:

```typescript
// In api.ts response interceptor
if (import.meta.env.DEV) {
  const duration = Date.now() - (config as any)._startTime
  if (duration > 2000) {
    console.warn(`🐢 Slow API call: ${config.url} (${duration}ms)`)
  }
}
```

---

## Performance Checklist

### Backend Requirements
- [ ] CORS configured (see BACKEND_CORS_CONFIG.md)
- [ ] API responses are gzipped
- [ ] API uses HTTP/2
- [ ] Database queries optimized
- [ ] Caching layer (Redis) for frequently accessed data

### Frontend Optimizations Applied
- [x] Request caching in API client
- [x] Retry logic with exponential backoff
- [x] TanStack Query for data caching
- [x] Error boundary added
- [ ] Code splitting (to be applied)
- [ ] Image optimization (to be applied)
- [ ] Bundle size analysis (to be applied)
- [ ] Service worker for offline support (optional)

### Vercel Deployment
- [ ] Environment variables set correctly
- [ ] Custom domain configured
- [ ] Vercel Analytics enabled
- [ ] Edge caching enabled

---

## Expected Results

After applying these optimizations:

**Before:**
- Initial load: 5-10 seconds
- Slow navigation between pages
- Multiple failed API requests
- No offline support

**After:**
- Initial load: 1-2 seconds
- Instant navigation (prefetching)
- Cached data = faster subsequent loads
- Graceful error handling
- Better mobile performance

---

## Next Steps

1. **Immediate:** Fix CORS on backend (required)
2. **Quick wins:** Add image error handlers, optimize TanStack Query
3. **Medium term:** Code splitting, lazy loading
4. **Long term:** Service worker, advanced caching strategies

---

## Need Help?

If performance is still slow after CORS fix:

1. Check Network tab in DevTools
2. Use Lighthouse audit (Chrome DevTools)
3. Check Vercel Analytics for real-world metrics
4. Profile with React DevTools Profiler

**Common bottlenecks:**
- Backend response time (not frontend issue)
- Large images not optimized
- Too many API calls
- Unoptimized database queries (backend)
