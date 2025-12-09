/**
 * Secure Storage Utility
 *
 * SECURITY WARNINGS:
 * ==================
 * ⚠️ NEVER store these client-side (not even encrypted):
 * - JWT tokens (access/refresh) → Use httpOnly cookies only
 * - API keys or secrets
 * - Passwords or password hashes
 * - Credit card numbers or CVV
 * - Social Security Numbers or National IDs
 * - Private encryption keys
 * - Sensitive personal health information
 *
 * ✅ Safe to store (with encryption):
 * - User preferences (theme, language)
 * - UI state (collapsed sidebars, selected tabs)
 * - Non-sensitive user profile data (name, email for display)
 * - Draft form data (non-sensitive)
 * - Cache keys and timestamps
 *
 * STORAGE STRATEGY:
 * =================
 * - sessionStorage: Data cleared when tab/window closes (more secure)
 * - localStorage: Data persists across sessions (less secure, use sparingly)
 * - Memory: Data cleared on page reload (most secure for sensitive temp data)
 *
 * This utility provides:
 * 1. Simple obfuscation (NOT cryptographic encryption)
 * 2. Automatic expiry support
 * 3. Type-safe getters/setters
 * 4. Namespace isolation
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Storage options
 */
export interface SecureStorageOptions {
  /** Expiry time in milliseconds (0 = no expiry) */
  expiresIn?: number
  /** Use sessionStorage instead of localStorage (recommended for sensitive data) */
  useSessionStorage?: boolean
  /** Skip encryption/obfuscation (for non-sensitive data like preferences) */
  skipEncryption?: boolean
}

/**
 * Stored item wrapper with metadata
 */
interface StoredItem<T = any> {
  /** The stored value (obfuscated if encryption enabled) */
  value: T
  /** Timestamp when item was created */
  createdAt: number
  /** Timestamp when item expires (0 = no expiry) */
  expiresAt: number
  /** Version for migration support */
  version: string
}

/**
 * Simple obfuscation (NOT secure encryption!)
 * This is just to prevent casual inspection in devtools
 * DO NOT use this for actually sensitive data
 */
class SimpleObfuscator {
  private static key = 'traf3li-2024' // Simple key for obfuscation

  /**
   * Obfuscate a string using base64 + simple XOR
   */
  static obfuscate(data: string): string {
    try {
      // XOR each character with repeating key
      const keyChars = this.key.split('')
      const obfuscated = data
        .split('')
        .map((char, i) => {
          const keyChar = keyChars[i % keyChars.length]
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
        })
        .join('')

      // Base64 encode
      return btoa(obfuscated)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SecureStorage] Obfuscation failed:', error)
      }
      return data // Return plain data if obfuscation fails
    }
  }

  /**
   * De-obfuscate a string
   */
  static deobfuscate(data: string): string {
    try {
      // Base64 decode
      const decoded = atob(data)

      // XOR to reverse obfuscation
      const keyChars = this.key.split('')
      return decoded
        .split('')
        .map((char, i) => {
          const keyChar = keyChars[i % keyChars.length]
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
        })
        .join('')
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SecureStorage] De-obfuscation failed:', error)
      }
      return data // Return as-is if de-obfuscation fails
    }
  }
}

/**
 * SecureStorage Class
 *
 * Usage:
 * ```ts
 * const storage = new SecureStorage('myApp')
 *
 * // Store with expiry
 * storage.setItem('theme', 'dark', { expiresIn: 7 * 24 * 60 * 60 * 1000 }) // 7 days
 *
 * // Store in sessionStorage (cleared on tab close)
 * storage.setItem('sessionData', data, { useSessionStorage: true })
 *
 * // Retrieve
 * const theme = storage.getItem<string>('theme')
 *
 * // Remove
 * storage.removeItem('theme')
 *
 * // Clear all in namespace
 * storage.clear()
 * ```
 */
export class SecureStorage {
  private namespace: string
  private version: string = '1.0.0'

  /**
   * @param namespace - Unique namespace to prevent key collisions
   */
  constructor(namespace: string = 'app') {
    this.namespace = namespace
  }

  /**
   * Get full storage key with namespace
   */
  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  /**
   * Get the appropriate storage (session or local)
   */
  private getStorage(useSessionStorage: boolean = false): Storage {
    return useSessionStorage ? sessionStorage : localStorage
  }

  /**
   * Store an item
   *
   * @param key - Storage key
   * @param value - Value to store (will be JSON serialized)
   * @param options - Storage options
   */
  setItem<T = any>(
    key: string,
    value: T,
    options: SecureStorageOptions = {}
  ): void {
    try {
      const {
        expiresIn = 0,
        useSessionStorage = false,
        skipEncryption = false,
      } = options

      const storage = this.getStorage(useSessionStorage)
      const storageKey = this.getKey(key)

      const item: StoredItem<T> = {
        value,
        createdAt: Date.now(),
        expiresAt: expiresIn > 0 ? Date.now() + expiresIn : 0,
        version: this.version,
      }

      // Serialize to JSON
      let serialized = JSON.stringify(item)

      // Obfuscate if not skipped
      if (!skipEncryption) {
        serialized = SimpleObfuscator.obfuscate(serialized)
      }

      storage.setItem(storageKey, serialized)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[SecureStorage] Failed to set item "${key}":`, error)
      }
      throw new Error(`Failed to store item: ${error}`)
    }
  }

  /**
   * Retrieve an item
   *
   * @param key - Storage key
   * @param useSessionStorage - Check sessionStorage instead of localStorage
   * @returns The stored value or null if not found/expired
   */
  getItem<T = any>(
    key: string,
    useSessionStorage: boolean = false
  ): T | null {
    try {
      const storage = this.getStorage(useSessionStorage)
      const storageKey = this.getKey(key)
      const data = storage.getItem(storageKey)

      if (!data) {
        return null
      }

      // Try to de-obfuscate (fallback to plain if it fails)
      let deobfuscated: string
      try {
        deobfuscated = SimpleObfuscator.deobfuscate(data)
      } catch {
        // Might be plain JSON (skipEncryption was used)
        deobfuscated = data
      }

      // Parse JSON
      const item: StoredItem<T> = JSON.parse(deobfuscated)

      // Check expiry
      if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
        // Expired - remove it
        this.removeItem(key, useSessionStorage)
        return null
      }

      return item.value
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[SecureStorage] Failed to get item "${key}":`, error)
      }
      // Clean up corrupted data
      this.removeItem(key, useSessionStorage)
      return null
    }
  }

  /**
   * Remove an item
   *
   * @param key - Storage key
   * @param useSessionStorage - Remove from sessionStorage instead of localStorage
   */
  removeItem(key: string, useSessionStorage: boolean = false): void {
    try {
      const storage = this.getStorage(useSessionStorage)
      const storageKey = this.getKey(key)
      storage.removeItem(storageKey)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[SecureStorage] Failed to remove item "${key}":`, error)
      }
    }
  }

  /**
   * Clear all items in this namespace
   *
   * @param clearBoth - Clear both localStorage and sessionStorage (default: false)
   */
  clear(clearBoth: boolean = false): void {
    try {
      const storages = clearBoth
        ? [localStorage, sessionStorage]
        : [localStorage]

      storages.forEach(storage => {
        const keysToRemove: string[] = []

        // Find all keys in this namespace
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && key.startsWith(`${this.namespace}:`)) {
            keysToRemove.push(key)
          }
        }

        // Remove them
        keysToRemove.forEach(key => storage.removeItem(key))
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SecureStorage] Failed to clear storage:', error)
      }
    }
  }

  /**
   * Get all keys in this namespace
   */
  getAllKeys(useSessionStorage: boolean = false): string[] {
    try {
      const storage = this.getStorage(useSessionStorage)
      const keys: string[] = []
      const prefix = `${this.namespace}:`

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(prefix)) {
          // Remove namespace prefix
          keys.push(key.substring(prefix.length))
        }
      }

      return keys
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[SecureStorage] Failed to get all keys:', error)
      }
      return []
    }
  }

  /**
   * Check if an item exists and is not expired
   */
  hasItem(key: string, useSessionStorage: boolean = false): boolean {
    return this.getItem(key, useSessionStorage) !== null
  }

  /**
   * Get item metadata without retrieving the value
   */
  getMetadata(key: string, useSessionStorage: boolean = false): {
    createdAt: number
    expiresAt: number
    version: string
  } | null {
    try {
      const storage = this.getStorage(useSessionStorage)
      const storageKey = this.getKey(key)
      const data = storage.getItem(storageKey)

      if (!data) {
        return null
      }

      // De-obfuscate and parse
      let deobfuscated: string
      try {
        deobfuscated = SimpleObfuscator.deobfuscate(data)
      } catch {
        deobfuscated = data
      }

      const item: StoredItem = JSON.parse(deobfuscated)

      return {
        createdAt: item.createdAt,
        expiresAt: item.expiresAt,
        version: item.version,
      }
    } catch (error) {
      return null
    }
  }
}

/**
 * Default storage instance for the app
 */
export const secureStorage = new SecureStorage('traf3li')

/**
 * React Hook for secure storage
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const [theme, setTheme] = useSecureStorage<string>('theme', 'light')
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Toggle Theme
 *     </button>
 *   )
 * }
 * ```
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Storage options
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  options: SecureStorageOptions = {}
): [T, (value: T) => void, () => void] {
  const storage = secureStorage

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem<T>(key, options.useSessionStorage)
      return item !== null ? item : initialValue
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[useSecureStorage] Error reading "${key}":`, error)
      }
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to storage
  const setValue = useCallback((value: T) => {
    try {
      // Save state
      setStoredValue(value)
      // Save to storage
      storage.setItem(key, value, options)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[useSecureStorage] Error setting "${key}":`, error)
      }
    }
  }, [key, options])

  // Function to remove the item
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      storage.removeItem(key, options.useSessionStorage)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[useSecureStorage] Error removing "${key}":`, error)
      }
    }
  }, [key, initialValue, options.useSessionStorage])

  return [storedValue, setValue, removeValue]
}

/**
 * Utility to migrate data from regular localStorage to SecureStorage
 *
 * @param oldKey - Old localStorage key
 * @param newKey - New SecureStorage key
 * @param options - Storage options for new key
 */
export function migrateToSecureStorage(
  oldKey: string,
  newKey: string,
  options: SecureStorageOptions = {}
): boolean {
  try {
    const oldData = localStorage.getItem(oldKey)
    if (!oldData) {
      return false
    }

    // Try to parse as JSON
    let parsedData: any
    try {
      parsedData = JSON.parse(oldData)
    } catch {
      // Not JSON, store as string
      parsedData = oldData
    }

    // Store in SecureStorage
    secureStorage.setItem(newKey, parsedData, options)

    // Remove old key
    localStorage.removeItem(oldKey)

    if (import.meta.env.DEV) {
      console.log(`[Migration] Migrated "${oldKey}" → "${newKey}"`)
    }
    return true
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[Migration] Failed to migrate "${oldKey}":`, error)
    }
    return false
  }
}

/**
 * SECURITY AUDIT HELPER
 * Run this in production to check for sensitive data in localStorage
 */
export function auditLocalStorage(): {
  warnings: string[]
  safe: string[]
  total: number
} {
  const warnings: string[] = []
  const safe: string[] = []

  // Patterns that might indicate sensitive data
  const sensitivePatterns = [
    /token/i,
    /jwt/i,
    /auth/i,
    /password/i,
    /secret/i,
    /api[_-]?key/i,
    /credit[_-]?card/i,
    /ssn/i,
    /national[_-]?id/i,
  ]

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key))

    if (isSensitive) {
      warnings.push(key)
    } else {
      safe.push(key)
    }
  }

  return {
    warnings,
    safe,
    total: localStorage.length,
  }
}

/**
 * Clear all expired items across all storage
 */
export function clearExpiredItems(): number {
  let cleared = 0
  const storages = [localStorage, sessionStorage]

  storages.forEach(storage => {
    const keysToCheck: string[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) keysToCheck.push(key)
    }

    keysToCheck.forEach(key => {
      try {
        const data = storage.getItem(key)
        if (!data) return

        // Try to parse as StoredItem
        const item: StoredItem = JSON.parse(SimpleObfuscator.deobfuscate(data))

        // Check expiry
        if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
          storage.removeItem(key)
          cleared++
        }
      } catch {
        // Not a SecureStorage item, skip
      }
    })
  })

  return cleared
}

export default secureStorage
