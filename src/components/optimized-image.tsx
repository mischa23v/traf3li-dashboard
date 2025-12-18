import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useInViewport } from '@/hooks/useImageLoader'
import { generateSrcSet, getOptimizedUrl } from '@/utils/image-utils'

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  lazy?: boolean
  quality?: number
  sizes?: string
  responsiveWidths?: number[]
  blurDataUrl?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * Optimized image component with lazy loading, blur placeholder, and responsive srcset
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blur placeholder while loading
 * - Error fallback image
 * - Responsive srcset support
 * - WebP format preference
 * - Automatic image optimization
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={1920}
 *   height={1080}
 *   lazy={true}
 *   responsiveWidths={[320, 640, 1024, 1920]}
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fallback = '/images/placeholder.png',
  lazy = true,
  quality = 80,
  sizes,
  responsiveWidths = [320, 640, 1024, 1920],
  blurDataUrl,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>(blurDataUrl || '')

  const isInView = useInViewport(imgRef, {
    threshold: 0.1,
    rootMargin: '100px',
  })

  const shouldLoad = !lazy || isInView

  // Memoize container style to prevent re-creating object
  const containerStyle = useMemo(() => ({ width, height }), [width, height])

  // Memoize image background style
  const imageBackgroundStyle = useMemo(() => ({
    backgroundColor: isLoading ? '#f1f5f9' : 'transparent',
  }), [isLoading])

  useEffect(() => {
    if (!shouldLoad || !src) return

    setIsLoading(true)
    setHasError(false)

    const img = new Image()

    img.onload = () => {
      setCurrentSrc(src)
      setIsLoading(false)
      onLoad?.()
    }

    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
      setCurrentSrc(fallback)
      onError?.(new Error(`Failed to load image: ${src}`))
    }

    // Use optimized URL if width or quality is specified
    const optimizedSrc = getOptimizedUrl(src, width, quality)
    img.src = optimizedSrc
  }, [shouldLoad, src, width, quality, fallback, onLoad, onError])

  // Generate srcset for responsive images
  const srcSet = responsiveWidths.length > 0
    ? generateSrcSet(src, responsiveWidths)
    : undefined

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={containerStyle}
    >
      <img
        ref={imgRef}
        src={currentSrc || fallback}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        className={cn(
          'h-full w-full transition-all duration-300',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isLoading && 'blur-sm scale-105',
          !isLoading && 'blur-0 scale-100'
        )}
        style={imageBackgroundStyle}
      />

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse"
          aria-label="Loading image"
        >
          <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-slate-600 animate-spin" />
        </div>
      )}

      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-sm"
          aria-label="Failed to load image"
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Avatar variant of OptimizedImage with circular shape
 */
export function OptimizedAvatar({
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      className={cn('rounded-full', className)}
      objectFit="cover"
    />
  )
}

/**
 * Background image variant for hero sections
 */
export function OptimizedBackground({
  children,
  className,
  overlayClassName,
  ...props
}: OptimizedImageProps & {
  children?: React.ReactNode
  overlayClassName?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        {...props}
        className="absolute inset-0 h-full w-full"
        objectFit="cover"
      />
      {children && (
        <div className={cn('relative z-10', overlayClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
