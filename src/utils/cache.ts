/**
 * Cache Strategy Utilities
 *
 * Provides comprehensive caching strategies for API responses and data management.
 * Features:
 * - In-memory cache with TTL (time-to-live)
 * - Optional localStorage persistence for non-sensitive data
 * - Cache invalidation by key pattern
 * - Size limits to prevent memory bloat
 * - React Query integration
 * - React hooks for component usage
 *
 * SECURITY NOTE:
 * - Never cache sensitive data (tokens, passwords, personal info)
 * - Use memory-only cache for sensitive temporary data
 * - Use localStorage persistence only for non-sensitive data
 */

import { useState, useEffect, useCallback } from 'react'
import { secureStorage } from './secure-storage'

/**
 * Cache entry with metadata
 */
interface CacheEntry<T = any> {
  /** The cached value */
  value: T
  /** Timestamp when entry was created */
  createdAt: number
  /** Timestamp when entry expires (0 = no expiry) */
  expiresAt: number
  /** Size of the entry in bytes (approximate) */
  size: number
  /** Number of times this entry has been accessed */
  accessCount: number
  /** Last access timestamp */
  lastAccessedAt: number
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Total number of entries */
  entries: number
  /** Total size in bytes */
  totalSize: number
  /** Number of hits */
  hits: number
  /** Number of misses */
  misses: number
  /** Hit rate percentage */
  hitRate: number
  /** Number of expired entries cleared */
  expiredCleared: number
  /** Number of evictions due to size limit */
  evictions: number
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Default TTL in milliseconds (0 = no expiry) */
  defaultTTL?: number
  /** Maximum cache size in bytes (0 = no limit) */
  maxSize?: number
  /** Enable localStorage persistence */
  persistToStorage?: boolean
  /** Storage namespace for persistence */
  storageNamespace?: string
  /** Enable automatic cleanup of expired entries */
  autoCleanup?: boolean
  /** Cleanup interval in milliseconds */
  cleanupInterval?: number
}

/**
 * CacheManager class for managing in-memory cache with optional persistence
 *
 * @example
 * ```ts
 * const cache = new CacheManager({
 *   defaultTTL: 5 * 60 * 1000, // 5 minutes
 *   maxSize: 10 * 1024 * 1024, // 10 MB
 *   persistToStorage: true
 * })
 *
 * // Set a value
 * cache.set('user:123', userData, 60000) // 1 minute TTL
 *
 * // Get a value
 * const user = cache.get<User>('user:123')
 *
 * // Invalidate by pattern
 * cache.invalidatePattern(/^user:/)
 * ```
 */
export class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private stats: CacheStats = {
    entries: 0,
    totalSize: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    expiredCleared: 0,
    evictions: 0,
  }
  private options: Required<CacheOptions>
  private cleanupTimer?: NodeJS.Timeout

  constructor(options: CacheOptions = {}) {
    this.options = {
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 50 * 1024 * 1024, // 50 MB default
      persistToStorage: options.persistToStorage ?? false,
      storageNamespace: options.storageNamespace ?? 'cache',
      autoCleanup: options.autoCleanup ?? true,
      cleanupInterval: options.cleanupInterval ?? 60 * 1000, // 1 minute
    }

    // Load from localStorage if persistence is enabled
    if (this.options.persistToStorage) {
      this.loadFromStorage()
    }

    // Start auto-cleanup if enabled
    if (this.options.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * Set a value in the cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (uses defaultTTL if not specified)
   */
  set(key: string, value: any, ttl?: number): void {
    try {
      const expiresAt = ttl ?? this.options.defaultTTL
      const entry: CacheEntry = {
        value,
        createdAt: Date.now(),
        expiresAt: expiresAt > 0 ? Date.now() + expiresAt : 0,
        size: this.estimateSize(value),
        accessCount: 0,
        lastAccessedAt: Date.now(),
      }

      // Check if adding this entry would exceed size limit
      if (this.options.maxSize > 0) {
        const existingEntry = this.cache.get(key)
        const existingSize = existingEntry?.size ?? 0
        const newTotalSize = this.stats.totalSize - existingSize + entry.size

        if (newTotalSize > this.options.maxSize) {
          // Evict least recently used entries until we have space
          this.evictLRU(entry.size)
        }
      }

      // Remove old entry if exists
      if (this.cache.has(key)) {
        const oldEntry = this.cache.get(key)!
        this.stats.totalSize -= oldEntry.size
        this.stats.entries--
      }

      // Add new entry
      this.cache.set(key, entry)
      this.stats.entries++
      this.stats.totalSize += entry.size

      // Persist to localStorage if enabled
      if (this.options.persistToStorage) {
        this.persistToStorage(key, entry)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[CacheManager] Failed to set key "${key}":`, error)
      }
    }
  }

  /**
   * Get a value from the cache
   *
   * @param key - Cache key
   * @returns The cached value or null if not found/expired
   */
  get<T = any>(key: string): T | null {
    try {
      const entry = this.cache.get(key)

      if (!entry) {
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      // Check if expired
      if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
        this.delete(key)
        this.stats.misses++
        this.stats.expiredCleared++
        this.updateHitRate()
        return null
      }

      // Update access metadata
      entry.accessCount++
      entry.lastAccessedAt = Date.now()

      this.stats.hits++
      this.updateHitRate()

      return entry.value as T
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[CacheManager] Failed to get key "${key}":`, error)
      }
      return null
    }
  }

  /**
   * Check if a key exists in the cache and is not expired
   *
   * @param key - Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a specific key from the cache
   *
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    try {
      const entry = this.cache.get(key)
      if (!entry) return

      this.cache.delete(key)
      this.stats.entries--
      this.stats.totalSize -= entry.size

      // Remove from localStorage if persistence is enabled
      if (this.options.persistToStorage) {
        secureStorage.removeItem(
          `${this.options.storageNamespace}:${key}`,
          false
        )
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[CacheManager] Failed to delete key "${key}":`, error)
      }
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   *
   * @param pattern - Regular expression pattern to match keys
   * @returns Number of entries invalidated
   *
   * @example
   * ```ts
   * // Invalidate all user-related cache
   * cache.invalidatePattern(/^user:/)
   *
   * // Invalidate all cache entries containing 'api'
   * cache.invalidatePattern(/api/)
   * ```
   */
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0

    try {
      const keysToDelete: string[] = []

      // Find all matching keys
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          keysToDelete.push(key)
        }
      }

      // Delete them
      keysToDelete.forEach((key) => {
        this.delete(key)
        invalidated++
      })

      if (import.meta.env.DEV) {
        console.log(
          `[CacheManager] Invalidated ${invalidated} entries matching pattern:`,
          pattern
        )
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CacheManager] Failed to invalidate pattern:', error)
      }
    }

    return invalidated
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      this.cache.clear()
      this.stats = {
        entries: 0,
        totalSize: 0,
        hits: 0,
        misses: 0,
        hitRate: 0,
        expiredCleared: 0,
        evictions: 0,
      }

      // Clear from localStorage if persistence is enabled
      if (this.options.persistToStorage) {
        const storage = new secureStorage.constructor(
          this.options.storageNamespace
        ) as typeof secureStorage
        storage.clear()
      }

      if (import.meta.env.DEV) {
        console.log('[CacheManager] Cache cleared')
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CacheManager] Failed to clear cache:', error)
      }
    }
  }

  /**
   * Get all cache keys
   *
   * @returns Array of all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Clean up expired entries
   *
   * @returns Number of entries cleaned up
   */
  cleanup(): number {
    let cleaned = 0

    try {
      const now = Date.now()
      const keysToDelete: string[] = []

      // Find expired entries
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt > 0 && now > entry.expiresAt) {
          keysToDelete.push(key)
        }
      }

      // Delete them
      keysToDelete.forEach((key) => {
        this.delete(key)
        cleaned++
      })

      if (cleaned > 0) {
        this.stats.expiredCleared += cleaned
        if (import.meta.env.DEV) {
          console.log(`[CacheManager] Cleaned up ${cleaned} expired entries`)
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CacheManager] Failed to cleanup expired entries:', error)
      }
    }

    return cleaned
  }

  /**
   * Destroy the cache manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }

  /**
   * Estimate the size of a value in bytes (approximate)
   */
  private estimateSize(value: any): number {
    try {
      const json = JSON.stringify(value)
      // Rough estimate: 2 bytes per character in UTF-16
      return json.length * 2
    } catch {
      // If JSON.stringify fails, return a conservative estimate
      return 1024 // 1 KB
    }
  }

  /**
   * Update hit rate percentage
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Evict least recently used entries to free up space
   */
  private evictLRU(requiredSize: number): void {
    try {
      // Sort entries by last accessed time (oldest first)
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt
      )

      let freedSize = 0

      // Evict until we have enough space
      for (const [key, entry] of entries) {
        if (freedSize >= requiredSize) break

        this.delete(key)
        freedSize += entry.size
        this.stats.evictions++
      }

      if (import.meta.env.DEV) {
        console.log(
          `[CacheManager] Evicted ${this.stats.evictions} entries to free ${freedSize} bytes`
        )
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CacheManager] Failed to evict LRU entries:', error)
      }
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  /**
   * Persist a cache entry to localStorage
   */
  private persistToStorage(key: string, entry: CacheEntry): void {
    try {
      secureStorage.setItem(
        `${this.options.storageNamespace}:${key}`,
        entry,
        {
          expiresIn: entry.expiresAt > 0 ? entry.expiresAt - Date.now() : 0,
          useSessionStorage: false,
          skipEncryption: false,
        }
      )
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          `[CacheManager] Failed to persist key "${key}" to storage:`,
          error
        )
      }
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storage = new secureStorage.constructor(
        this.options.storageNamespace
      ) as typeof secureStorage
      const keys = storage.getAllKeys()

      let loaded = 0
      for (const key of keys) {
        const entry = storage.getItem<CacheEntry>(key)
        if (entry && entry.value !== undefined) {
          // Remove namespace prefix
          const cacheKey = key.replace(`${this.options.storageNamespace}:`, '')
          this.cache.set(cacheKey, entry)
          this.stats.entries++
          this.stats.totalSize += entry.size
          loaded++
        }
      }

      if (loaded > 0 && import.meta.env.DEV) {
        console.log(`[CacheManager] Loaded ${loaded} entries from storage`)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[CacheManager] Failed to load from storage:', error)
      }
    }
  }
}

/**
 * Default cache manager instance
 */
export const cacheManager = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 50 * 1024 * 1024, // 50 MB
  persistToStorage: false, // Disabled by default for security
  storageNamespace: 'app-cache',
  autoCleanup: true,
  cleanupInterval: 60 * 1000, // 1 minute
})

/**
 * React Query cache configuration
 *
 * Provides consistent cache configuration for different types of data:
 * - Static: Data that rarely changes (e.g., configuration, lookup tables)
 * - Dynamic: Data that changes occasionally (e.g., user profiles, settings)
 * - Realtime: Data that changes frequently (e.g., notifications, live updates)
 *
 * @example
 * ```ts
 * import { useQuery } from '@tanstack/react-query'
 * import { cacheConfig } from '@/utils/cache'
 *
 * // For static data
 * const { data } = useQuery({
 *   queryKey: ['countries'],
 *   queryFn: fetchCountries,
 *   staleTime: cacheConfig.staleTime.static,
 *   gcTime: cacheConfig.cacheTime.default,
 * })
 *
 * // For dynamic data
 * const { data } = useQuery({
 *   queryKey: ['user', userId],
 *   queryFn: () => fetchUser(userId),
 *   staleTime: cacheConfig.staleTime.dynamic,
 * })
 *
 * // For realtime data
 * const { data } = useQuery({
 *   queryKey: ['notifications'],
 *   queryFn: fetchNotifications,
 *   staleTime: cacheConfig.staleTime.realtime,
 * })
 * ```
 */
export const cacheConfig = {
  /**
   * Stale time for different data types
   * Stale time determines how long data is considered fresh before refetching
   */
  staleTime: {
    /** 1 hour - for data that rarely changes (config, lookup tables, etc.) */
    static: 1000 * 60 * 60, // 1 hour
    /** 5 minutes - for data that changes occasionally (user profiles, settings, etc.) */
    dynamic: 1000 * 60 * 5, // 5 minutes
    /** 30 seconds - for data that changes frequently (notifications, live updates, etc.) */
    realtime: 1000 * 30, // 30 seconds
    /** 10 minutes - for lists and collections */
    list: 1000 * 60 * 10, // 10 minutes
    /** 15 minutes - for reports and analytics */
    report: 1000 * 60 * 15, // 15 minutes
  },

  /**
   * Cache time (garbage collection time)
   * How long to keep unused data in cache after it becomes unused
   */
  cacheTime: {
    /** Default cache time - 30 minutes */
    default: 1000 * 60 * 30, // 30 minutes
    /** Short cache time - 5 minutes for frequently changing data */
    short: 1000 * 60 * 5, // 5 minutes
    /** Long cache time - 1 hour for stable data */
    long: 1000 * 60 * 60, // 1 hour
  },

  /**
   * Refetch intervals for real-time data
   */
  refetchInterval: {
    /** Fast - 10 seconds for critical real-time data */
    fast: 1000 * 10, // 10 seconds
    /** Normal - 30 seconds for standard real-time updates */
    normal: 1000 * 30, // 30 seconds
    /** Slow - 1 minute for less critical updates */
    slow: 1000 * 60, // 1 minute
  },
} as const

/**
 * React hook for using the cache manager in components
 *
 * @param key - Cache key
 * @param options - Cache options
 * @returns Tuple of [value, setValue, deleteValue, hasValue]
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [userData, setUserData, deleteUserData, hasUserData] = useCache<User>('user:123')
 *
 *   useEffect(() => {
 *     if (!hasUserData) {
 *       fetchUser().then(setUserData)
 *     }
 *   }, [hasUserData])
 *
 *   return <div>{userData?.name}</div>
 * }
 * ```
 */
export function useCache<T>(
  key: string,
  options?: { ttl?: number; manager?: CacheManager }
): [T | null, (value: T) => void, () => void, boolean] {
  const manager = options?.manager ?? cacheManager
  const [value, setValue] = useState<T | null>(() => manager.get<T>(key))
  const [hasValue, setHasValue] = useState(() => manager.has(key))

  // Update value when key changes
  useEffect(() => {
    const cachedValue = manager.get<T>(key)
    setValue(cachedValue)
    setHasValue(cachedValue !== null)
  }, [key, manager])

  // Set value in cache
  const setCachedValue = useCallback(
    (newValue: T) => {
      manager.set(key, newValue, options?.ttl)
      setValue(newValue)
      setHasValue(true)
    },
    [key, options?.ttl, manager]
  )

  // Delete value from cache
  const deleteCachedValue = useCallback(() => {
    manager.delete(key)
    setValue(null)
    setHasValue(false)
  }, [key, manager])

  return [value, setCachedValue, deleteCachedValue, hasValue]
}

/**
 * React hook for cache statistics
 *
 * @param manager - Cache manager instance (uses default if not provided)
 * @returns Cache statistics
 *
 * @example
 * ```tsx
 * function CacheStats() {
 *   const stats = useCacheStats()
 *
 *   return (
 *     <div>
 *       <p>Entries: {stats.entries}</p>
 *       <p>Hit Rate: {stats.hitRate.toFixed(2)}%</p>
 *       <p>Total Size: {(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCacheStats(manager: CacheManager = cacheManager): CacheStats {
  const [stats, setStats] = useState<CacheStats>(() => manager.getStats())

  useEffect(() => {
    // Update stats every second
    const interval = setInterval(() => {
      setStats(manager.getStats())
    }, 1000)

    return () => clearInterval(interval)
  }, [manager])

  return stats
}

/**
 * Utility function to create a cache key from parts
 *
 * @param parts - Key parts to join
 * @returns Formatted cache key
 *
 * @example
 * ```ts
 * const key = createCacheKey('user', userId, 'profile')
 * // Returns: 'user:123:profile'
 * ```
 */
export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter((part) => part !== undefined).join(':')
}

/**
 * Utility to wrap an async function with caching
 *
 * @param fn - Async function to wrap
 * @param options - Cache options
 * @returns Wrapped function with caching
 *
 * @example
 * ```ts
 * const fetchUserWithCache = withCache(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`)
 *     return response.json()
 *   },
 *   {
 *     keyFn: (userId) => `user:${userId}`,
 *     ttl: 5 * 60 * 1000, // 5 minutes
 *   }
 * )
 *
 * // First call fetches from API
 * const user1 = await fetchUserWithCache('123')
 *
 * // Second call returns from cache
 * const user2 = await fetchUserWithCache('123')
 * ```
 */
export function withCache<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    keyFn: (...args: TArgs) => string
    ttl?: number
    manager?: CacheManager
  }
): (...args: TArgs) => Promise<TResult> {
  const manager = options.manager ?? cacheManager

  return async (...args: TArgs): Promise<TResult> => {
    const key = options.keyFn(...args)

    // Check cache first
    const cached = manager.get<TResult>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch and cache
    const result = await fn(...args)
    manager.set(key, result, options.ttl)

    return result
  }
}

// Export types
export type { CacheEntry, CacheOptions }
