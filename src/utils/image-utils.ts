/**
 * Image optimization utilities for better performance
 *
 * @example
 * ```tsx
 * const optimizedUrl = getOptimizedUrl('/images/photo.jpg', 800, 85)
 * const isSupported = isWebPSupported()
 * await preloadImage('/images/hero.jpg')
 * await preloadImages(['/images/1.jpg', '/images/2.jpg'])
 * ```
 */

/**
 * Generate optimized image URL with width and quality parameters
 *
 * @param url - Original image URL
 * @param width - Desired width in pixels
 * @param quality - Image quality (0-100, default: 80)
 * @returns Optimized image URL
 *
 * @example
 * ```tsx
 * const url = getOptimizedUrl('/images/photo.jpg', 800, 85)
 * // Returns: '/images/photo.jpg?w=800&q=85'
 * ```
 */
export function getOptimizedUrl(
  url: string,
  width?: number,
  quality: number = 80
): string {
  if (!url) return url

  // Skip optimization for external URLs (different origin)
  try {
    const urlObj = new URL(url, window.location.origin)
    const isExternal = urlObj.origin !== window.location.origin

    if (isExternal) {
      return url
    }
  } catch {
    // If URL parsing fails, return as-is
    return url
  }

  const params = new URLSearchParams()

  if (width) {
    params.set('w', width.toString())
  }

  if (quality !== 80) {
    params.set('q', quality.toString())
  }

  const queryString = params.toString()
  if (!queryString) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}

/**
 * Check if the browser supports WebP format
 *
 * @returns Promise that resolves to true if WebP is supported
 *
 * @example
 * ```tsx
 * const supported = await isWebPSupported()
 * if (supported) {
 *   // Use WebP images
 * }
 * ```
 */
export function isWebPSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if we've already cached the result
    const cached = sessionStorage.getItem('webp-support')
    if (cached !== null) {
      resolve(cached === 'true')
      return
    }

    const webP = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    const img = new Image()

    img.onload = () => {
      const isSupported = img.width === 1 && img.height === 1
      sessionStorage.setItem('webp-support', String(isSupported))
      resolve(isSupported)
    }

    img.onerror = () => {
      sessionStorage.setItem('webp-support', 'false')
      resolve(false)
    }

    img.src = webP
  })
}

/**
 * Preload a single image
 *
 * @param src - Image URL to preload
 * @returns Promise that resolves when image is loaded, rejects on error
 *
 * @example
 * ```tsx
 * try {
 *   await preloadImage('/images/hero.jpg')
 *   console.log('Image preloaded successfully')
 * } catch (error) {
 *   console.error('Failed to preload image')
 * }
 * ```
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))

    img.src = src
  })
}

/**
 * Preload multiple images in parallel
 *
 * @param srcs - Array of image URLs to preload
 * @returns Promise that resolves with array of results (successful loads and errors)
 *
 * @example
 * ```tsx
 * const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']
 * const results = await preloadImages(images)
 * console.log(`Loaded ${results.filter(r => r.status === 'success').length} images`)
 * ```
 */
export function preloadImages(
  srcs: string[]
): Promise<Array<{ status: 'success' | 'error'; src: string; image?: HTMLImageElement; error?: Error }>> {
  return Promise.all(
    srcs.map((src) =>
      preloadImage(src)
        .then((image) => ({ status: 'success' as const, src, image }))
        .catch((error) => ({ status: 'error' as const, src, error }))
    )
  )
}

/**
 * Convert image URL to WebP format if supported
 *
 * @param url - Original image URL
 * @returns URL with .webp extension or original URL
 *
 * @example
 * ```tsx
 * const webpUrl = await getWebPUrl('/images/photo.jpg')
 * // Returns: '/images/photo.webp' if supported, '/images/photo.jpg' otherwise
 * ```
 */
export async function getWebPUrl(url: string): Promise<string> {
  const supported = await isWebPSupported()
  if (!supported) return url

  // Only convert common image formats
  const imageExtensions = /\.(jpg|jpeg|png)$/i
  if (!imageExtensions.test(url)) return url

  return url.replace(imageExtensions, '.webp')
}

/**
 * Generate responsive srcset string for different screen sizes
 *
 * @param baseUrl - Base image URL
 * @param widths - Array of widths for different screen sizes
 * @returns srcset string for use in img tag
 *
 * @example
 * ```tsx
 * const srcset = generateSrcSet('/images/photo.jpg', [320, 640, 1024, 1920])
 * // <img srcset={srcset} />
 * ```
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map((width) => `${getOptimizedUrl(baseUrl, width)} ${width}w`)
    .join(', ')
}
