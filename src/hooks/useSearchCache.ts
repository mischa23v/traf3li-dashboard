import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'
import { CACHE_TIMES } from '@/config/cache'

/**
 * Gold Standard Search Cache Hook
 *
 * Implements patterns from Algolia, AWS CloudSearch, and Elasticsearch:
 * - Prefix-based caching for instant autocomplete
 * - Stale-while-revalidate for perceived instant responses
 * - Cache warming on common prefixes
 * - Progressive cache invalidation
 *
 * @example
 * const { getCachedResults, setCachedResults, getPrefixResults } = useSearchCache('tasks')
 *
 * // Check cache before API call
 * const cached = getCachedResults(searchQuery)
 * if (cached) return cached
 *
 * // Use prefix results as placeholder
 * const prefixResults = getPrefixResults(searchQuery)
 */

interface SearchCacheEntry<T> {
  data: T
  timestamp: number
  query: string
}

interface UseSearchCacheOptions {
  /** Maximum entries per entity type (default: 50) */
  maxEntries?: number
  /** Cache entry TTL in ms (default: 60000 - 1 minute) */
  ttl?: number
  /** Prefix cache TTL in ms (default: 30000 - 30 seconds) */
  prefixTtl?: number
}

interface UseSearchCacheResult<T> {
  /** Get exact match from cache */
  getCachedResults: (query: string) => T | null
  /** Store results in cache */
  setCachedResults: (query: string, data: T) => void
  /** Get results from longest matching prefix (stale-while-revalidate) */
  getPrefixResults: (query: string) => T | null
  /** Clear all cache entries for this entity */
  clearCache: () => void
  /** Warm cache with common prefixes */
  warmCache: (prefixes: string[], fetchFn: (prefix: string) => Promise<T>) => void
  /** Get cache stats */
  getCacheStats: () => { size: number; hitRate: number; avgAge: number }
}

// In-memory cache store (singleton for persistence across renders)
const searchCacheStore = new Map<string, Map<string, SearchCacheEntry<any>>>()
const cacheStats = new Map<string, { hits: number; misses: number }>()

/**
 * Get or create cache for an entity type
 */
function getEntityCache<T>(entityType: string): Map<string, SearchCacheEntry<T>> {
  if (!searchCacheStore.has(entityType)) {
    searchCacheStore.set(entityType, new Map())
  }
  return searchCacheStore.get(entityType)!
}

/**
 * Record cache hit/miss for stats
 */
function recordCacheAccess(entityType: string, isHit: boolean) {
  if (!cacheStats.has(entityType)) {
    cacheStats.set(entityType, { hits: 0, misses: 0 })
  }
  const stats = cacheStats.get(entityType)!
  if (isHit) {
    stats.hits++
  } else {
    stats.misses++
  }
}

export function useSearchCache<T>(
  entityType: string,
  options: UseSearchCacheOptions = {}
): UseSearchCacheResult<T> {
  const {
    maxEntries = 50,
    ttl = CACHE_TIMES.SEARCH.STALE_TIME,
    prefixTtl = CACHE_TIMES.SEARCH.PREFIX_STALE,
  } = options

  const queryClient = useQueryClient()
  const cacheRef = useRef(getEntityCache<T>(entityType))

  /**
   * Clean expired entries and enforce max size
   */
  const cleanCache = useCallback(() => {
    const cache = cacheRef.current
    const now = Date.now()

    // Remove expired entries
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key)
      }
    }

    // Enforce max size (LRU - remove oldest)
    if (cache.size > maxEntries) {
      const sortedEntries = Array.from(cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)

      const toRemove = sortedEntries.slice(0, cache.size - maxEntries)
      for (const [key] of toRemove) {
        cache.delete(key)
      }
    }
  }, [maxEntries, ttl])

  /**
   * Normalize query for consistent cache keys
   */
  const normalizeQuery = useCallback((query: string): string => {
    return query.toLowerCase().trim()
  }, [])

  /**
   * Get exact match from cache
   */
  const getCachedResults = useCallback((query: string): T | null => {
    const normalizedQuery = normalizeQuery(query)
    if (!normalizedQuery) return null

    const cache = cacheRef.current
    const entry = cache.get(normalizedQuery)

    if (entry && Date.now() - entry.timestamp <= ttl) {
      recordCacheAccess(entityType, true)
      return entry.data
    }

    recordCacheAccess(entityType, false)
    return null
  }, [normalizeQuery, ttl, entityType])

  /**
   * Store results in cache
   */
  const setCachedResults = useCallback((query: string, data: T): void => {
    const normalizedQuery = normalizeQuery(query)
    if (!normalizedQuery) return

    const cache = cacheRef.current
    cache.set(normalizedQuery, {
      data,
      timestamp: Date.now(),
      query: normalizedQuery,
    })

    // Periodic cleanup
    if (cache.size > maxEntries * 1.2) {
      cleanCache()
    }
  }, [normalizeQuery, maxEntries, cleanCache])

  /**
   * Get results from longest matching prefix (Algolia pattern)
   * Returns stale data for instant perceived response
   */
  const getPrefixResults = useCallback((query: string): T | null => {
    const normalizedQuery = normalizeQuery(query)
    if (!normalizedQuery || normalizedQuery.length < 2) return null

    const cache = cacheRef.current
    const now = Date.now()

    // Try progressively shorter prefixes
    for (let len = normalizedQuery.length - 1; len >= 2; len--) {
      const prefix = normalizedQuery.substring(0, len)
      const entry = cache.get(prefix)

      // Use prefix cache with its own TTL (more permissive)
      if (entry && now - entry.timestamp <= prefixTtl) {
        return entry.data
      }
    }

    return null
  }, [normalizeQuery, prefixTtl])

  /**
   * Clear all cache entries for this entity
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    cacheStats.delete(entityType)
  }, [entityType])

  /**
   * Warm cache with common prefixes (AWS CloudSearch pattern)
   * Call this on component mount for frequently used searches
   */
  const warmCache = useCallback(async (
    prefixes: string[],
    fetchFn: (prefix: string) => Promise<T>
  ): Promise<void> => {
    for (const prefix of prefixes) {
      const normalizedPrefix = normalizeQuery(prefix)
      const existing = getCachedResults(normalizedPrefix)

      if (!existing) {
        try {
          const data = await fetchFn(normalizedPrefix)
          setCachedResults(normalizedPrefix, data)
        } catch {
          // Silently fail for warming - it's just optimization
        }
      }
    }
  }, [normalizeQuery, getCachedResults, setCachedResults])

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current
    const stats = cacheStats.get(entityType) || { hits: 0, misses: 0 }
    const totalAccess = stats.hits + stats.misses

    // Calculate average age of entries
    const entries = Array.from(cache.values())
    const now = Date.now()
    const avgAge = entries.length > 0
      ? entries.reduce((sum, e) => sum + (now - e.timestamp), 0) / entries.length
      : 0

    return {
      size: cache.size,
      hitRate: totalAccess > 0 ? stats.hits / totalAccess : 0,
      avgAge: Math.round(avgAge / 1000), // in seconds
    }
  }, [entityType])

  return {
    getCachedResults,
    setCachedResults,
    getPrefixResults,
    clearCache,
    warmCache,
    getCacheStats,
  }
}

/**
 * React Query integration - get search query options with caching
 */
export function getSearchQueryOptions<T>(
  entityType: string,
  query: string,
  queryFn: () => Promise<T>
) {
  return {
    queryKey: [entityType, 'search', query.toLowerCase().trim()] as const,
    queryFn,
    staleTime: CACHE_TIMES.SEARCH.STALE_TIME,
    gcTime: CACHE_TIMES.SEARCH.GC_TIME,
    // Stale-while-revalidate: show old data while fetching new
    placeholderData: (previousData: T | undefined) => previousData,
    // Keep previous results while loading new search
    keepPreviousData: true,
  }
}

export default useSearchCache
