/**
 * useCaptcha Hook
 * Manages CAPTCHA loading, execution, and token retrieval
 * Supports reCAPTCHA v2/v3 and hCaptcha
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CaptchaProvider,
  CaptchaConfig,
  getCaptchaScriptUrl,
} from '@/components/auth/captcha-config'

declare global {
  interface Window {
    grecaptcha?: any
    hcaptcha?: any
    onRecaptchaLoad?: () => void
    onHcaptchaLoad?: () => void
  }
}

export interface UseCaptchaOptions {
  provider: CaptchaProvider
  siteKey: string
  mode?: 'checkbox' | 'invisible'
  action?: string // For reCAPTCHA v3
  onSuccess?: (token: string) => void
  onError?: (error: Error) => void
  onExpired?: () => void
}

export interface UseCaptchaReturn {
  execute: () => Promise<string>
  reset: () => void
  isReady: boolean
  isLoading: boolean
  error: Error | null
  widgetId: string | null
}

/**
 * Load CAPTCHA script dynamically
 */
function loadCaptchaScript(
  provider: CaptchaProvider,
  siteKey: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (provider === 'recaptcha-v2' || provider === 'recaptcha-v3') {
      if (window.grecaptcha) {
        resolve()
        return
      }
    } else if (provider === 'hcaptcha') {
      if (window.hcaptcha) {
        resolve()
        return
      }
    }

    // Check if script already exists
    const scriptId = `${provider}-script`
    if (document.getElementById(scriptId)) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (
          (provider !== 'hcaptcha' && window.grecaptcha) ||
          (provider === 'hcaptcha' && window.hcaptcha)
        ) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error('CAPTCHA script load timeout'))
      }, 10000)
      return
    }

    // Create and append script
    const script = document.createElement('script')
    script.id = scriptId
    script.src = getCaptchaScriptUrl(provider, siteKey)
    script.async = true
    script.defer = true

    script.onload = () => {
      // Wait a bit for the CAPTCHA API to initialize
      setTimeout(() => {
        if (
          (provider !== 'hcaptcha' && window.grecaptcha) ||
          (provider === 'hcaptcha' && window.hcaptcha)
        ) {
          resolve()
        } else {
          reject(new Error('CAPTCHA API not available after script load'))
        }
      }, 500)
    }

    script.onerror = () => {
      reject(new Error('Failed to load CAPTCHA script'))
    }

    document.head.appendChild(script)
  })
}

/**
 * useCaptcha Hook
 */
export function useCaptcha(options: UseCaptchaOptions): UseCaptchaReturn {
  const { provider, siteKey, mode = 'invisible', action = 'login', onSuccess, onError, onExpired } = options

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)

  const widgetContainerRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)

  /**
   * Initialize CAPTCHA
   */
  useEffect(() => {
    if (provider === 'none' || !siteKey) {
      setIsReady(true)
      return
    }

    if (isLoadingRef.current) return
    isLoadingRef.current = true

    setIsLoading(true)
    setError(null)

    loadCaptchaScript(provider, siteKey)
      .then(() => {
        setIsReady(true)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
        onError?.(err)
      })

    return () => {
      // Cleanup on unmount
      if (widgetId !== null) {
        try {
          if (provider === 'hcaptcha' && window.hcaptcha) {
            window.hcaptcha.remove(widgetId)
          } else if (window.grecaptcha && provider === 'recaptcha-v2') {
            // reCAPTCHA v2 doesn't have a remove method, but we can reset
            window.grecaptcha.reset(widgetId)
          }
        } catch (err) {
          console.error('Error removing CAPTCHA widget:', err)
        }
      }
    }
  }, [provider, siteKey])

  /**
   * Render reCAPTCHA v2 widget
   */
  const renderRecaptchaV2 = useCallback(
    (container: HTMLElement): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          const wId = window.grecaptcha.render(container, {
            sitekey: siteKey,
            size: mode === 'invisible' ? 'invisible' : 'normal',
            callback: (token: string) => {
              onSuccess?.(token)
              resolve(token)
            },
            'error-callback': () => {
              const err = new Error('reCAPTCHA error')
              onError?.(err)
              reject(err)
            },
            'expired-callback': () => {
              onExpired?.()
              reject(new Error('reCAPTCHA expired'))
            },
          })

          setWidgetId(wId.toString())

          if (mode === 'invisible') {
            window.grecaptcha.execute(wId)
          }
        } catch (err: any) {
          reject(err)
        }
      })
    },
    [siteKey, mode, onSuccess, onError, onExpired]
  )

  /**
   * Execute reCAPTCHA v3
   */
  const executeRecaptchaV3 = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha || !window.grecaptcha.execute) {
        reject(new Error('reCAPTCHA v3 not ready'))
        return
      }

      window.grecaptcha
        .execute(siteKey, { action })
        .then((token: string) => {
          onSuccess?.(token)
          resolve(token)
        })
        .catch((err: any) => {
          onError?.(err)
          reject(err)
        })
    })
  }, [siteKey, action, onSuccess, onError])

  /**
   * Render hCaptcha widget
   */
  const renderHcaptcha = useCallback(
    (container: HTMLElement): Promise<string> => {
      return new Promise((resolve, reject) => {
        try {
          const wId = window.hcaptcha.render(container, {
            sitekey: siteKey,
            size: mode === 'invisible' ? 'invisible' : 'normal',
            callback: (token: string) => {
              onSuccess?.(token)
              resolve(token)
            },
            'error-callback': () => {
              const err = new Error('hCaptcha error')
              onError?.(err)
              reject(err)
            },
            'expired-callback': () => {
              onExpired?.()
              reject(new Error('hCaptcha expired'))
            },
          })

          setWidgetId(wId)

          if (mode === 'invisible') {
            window.hcaptcha.execute(wId)
          }
        } catch (err: any) {
          reject(err)
        }
      })
    },
    [siteKey, mode, onSuccess, onError, onExpired]
  )

  /**
   * Execute CAPTCHA challenge
   */
  const execute = useCallback(async (): Promise<string> => {
    if (provider === 'none' || !siteKey) {
      return ''
    }

    if (!isReady) {
      throw new Error('CAPTCHA not ready')
    }

    try {
      setError(null)

      // reCAPTCHA v3 doesn't need a container
      if (provider === 'recaptcha-v3') {
        return await executeRecaptchaV3()
      }

      // For v2 and hCaptcha, we need a container
      // Create a temporary container if needed
      let container = widgetContainerRef.current
      if (!container) {
        container = document.createElement('div')
        container.style.display = mode === 'invisible' ? 'none' : 'block'
        document.body.appendChild(container)
        widgetContainerRef.current = container
      }

      if (provider === 'recaptcha-v2') {
        return await renderRecaptchaV2(container)
      } else if (provider === 'hcaptcha') {
        return await renderHcaptcha(container)
      }

      throw new Error('Unknown CAPTCHA provider')
    } catch (err: any) {
      setError(err)
      throw err
    }
  }, [provider, siteKey, isReady, mode, executeRecaptchaV3, renderRecaptchaV2, renderHcaptcha])

  /**
   * Reset CAPTCHA
   */
  const reset = useCallback(() => {
    if (widgetId === null) return

    try {
      if (provider === 'recaptcha-v2' && window.grecaptcha) {
        window.grecaptcha.reset(widgetId)
      } else if (provider === 'hcaptcha' && window.hcaptcha) {
        window.hcaptcha.reset(widgetId)
      }
    } catch (err) {
      console.error('Error resetting CAPTCHA:', err)
    }
  }, [provider, widgetId])

  return {
    execute,
    reset,
    isReady,
    isLoading,
    error,
    widgetId,
  }
}

export default useCaptcha
