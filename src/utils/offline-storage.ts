/**
 * Offline Storage Utilities
 * Provides functions for saving and syncing data when offline
 */

const OFFLINE_PREFIX = 'offline_'
const PENDING_SYNC_PREFIX = 'pending_sync_'

/**
 * Save data to localStorage for offline access
 * @param key - The key to store data under
 * @param data - The data to store (will be JSON stringified)
 */
export function saveOffline<T>(key: string, data: T): void {
  try {
    const storageKey = `${OFFLINE_PREFIX}${key}`
    localStorage.setItem(storageKey, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save offline data:', error)
  }
}

/**
 * Retrieve data from offline storage
 * @param key - The key to retrieve data from
 * @returns The parsed data or null if not found
 */
export function getOffline<T>(key: string): T | null {
  try {
    const storageKey = `${OFFLINE_PREFIX}${key}`
    const data = localStorage.getItem(storageKey)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to retrieve offline data:', error)
    return null
  }
}

/**
 * Clear offline data after successful sync
 * @param key - The key to clear
 */
export function clearOfflineData(key: string): void {
  try {
    const storageKey = `${OFFLINE_PREFIX}${key}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear offline data:', error)
  }
}

/**
 * Queue a sync operation to be executed when back online
 * @param key - Unique key for this sync operation
 * @param syncFn - Async function to execute when online
 */
export function syncWhenOnline(
  key: string,
  syncFn: () => Promise<void>
): void {
  const pendingKey = `${PENDING_SYNC_PREFIX}${key}`

  // Store the sync operation metadata
  try {
    const pendingOps = getPendingSyncOperations()
    pendingOps[key] = {
      timestamp: Date.now(),
      key,
    }
    localStorage.setItem(
      PENDING_SYNC_PREFIX + 'operations',
      JSON.stringify(pendingOps)
    )
  } catch (error) {
    console.error('Failed to queue sync operation:', error)
  }

  // Set up listener for online event
  const handleOnline = async () => {
    if (navigator.onLine) {
      try {
        await syncFn()
        // Remove from pending operations
        removePendingSyncOperation(key)
      } catch (error) {
        console.error('Sync operation failed:', error)
      }
    }
  }

  // Try to sync immediately if already online
  if (navigator.onLine) {
    handleOnline()
  } else {
    // Wait for online event
    window.addEventListener('online', handleOnline, { once: true })
  }
}

/**
 * Get all pending sync operations
 */
function getPendingSyncOperations(): Record<
  string,
  { timestamp: number; key: string }
> {
  try {
    const data = localStorage.getItem(PENDING_SYNC_PREFIX + 'operations')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

/**
 * Remove a specific pending sync operation
 */
function removePendingSyncOperation(key: string): void {
  try {
    const pendingOps = getPendingSyncOperations()
    delete pendingOps[key]
    localStorage.setItem(
      PENDING_SYNC_PREFIX + 'operations',
      JSON.stringify(pendingOps)
    )
  } catch (error) {
    console.error('Failed to remove pending sync operation:', error)
  }
}

/**
 * Get all offline data keys
 */
export function getAllOfflineKeys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(OFFLINE_PREFIX)) {
        keys.push(key.replace(OFFLINE_PREFIX, ''))
      }
    }
  } catch (error) {
    console.error('Failed to get offline keys:', error)
  }
  return keys
}

/**
 * Clear all offline data
 */
export function clearAllOfflineData(): void {
  try {
    const keys = getAllOfflineKeys()
    keys.forEach((key) => clearOfflineData(key))
  } catch (error) {
    console.error('Failed to clear all offline data:', error)
  }
}
