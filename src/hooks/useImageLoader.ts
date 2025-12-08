import { useEffect, useState, useCallback } from 'react'
import { preloadImage, preloadImages } from '@/utils/image-utils'

interface ImageLoadState {
  loading: boolean
  error: Error | null
  loaded: boolean
}

interface UseImageLoaderResult extends ImageLoadState {
  load: () => void
  reset: () => void
}

/**
 * Hook to preload a single image and track its loading state
 *
 * @param src - Image URL to preload
 * @param options - Configuration options
 * @returns Object with loading state and control functions
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { loading, error, loaded, load } = useImageLoader('/images/hero.jpg', {
 *     loadOnMount: true
 *   })
 *
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error loading image</div>
 *   return <img src="/images/hero.jpg" alt="Hero" />
 * }
 * ```
 */
export function useImageLoader(
  src: string,
  options: {
    loadOnMount?: boolean
  } = {}
): UseImageLoaderResult {
  const { loadOnMount = false } = options

  const [state, setState] = useState<ImageLoadState>({
    loading: false,
    error: null,
    loaded: false,
  })

  const load = useCallback(() => {
    if (!src || state.loaded) return

    setState({ loading: true, error: null, loaded: false })

    preloadImage(src)
      .then(() => {
        setState({ loading: false, error: null, loaded: true })
      })
      .catch((error) => {
        setState({ loading: false, error, loaded: false })
      })
  }, [src, state.loaded])

  const reset = useCallback(() => {
    setState({ loading: false, error: null, loaded: false })
  }, [])

  useEffect(() => {
    if (loadOnMount && src) {
      load()
    }
  }, [loadOnMount, src, load])

  return {
    ...state,
    load,
    reset,
  }
}

interface UseImagesLoaderResult {
  loading: boolean
  errors: Map<string, Error>
  loadedCount: number
  totalCount: number
  allLoaded: boolean
  load: () => void
  reset: () => void
}

/**
 * Hook to preload multiple images and track their loading state
 *
 * @param srcs - Array of image URLs to preload
 * @param options - Configuration options
 * @returns Object with loading state and control functions
 *
 * @example
 * ```tsx
 * function Gallery() {
 *   const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']
 *   const { loading, loadedCount, totalCount, allLoaded } = useImagesLoader(images, {
 *     loadOnMount: true
 *   })
 *
 *   return (
 *     <div>
 *       {loading && <div>Loading {loadedCount}/{totalCount} images...</div>}
 *       {allLoaded && <div>All images loaded!</div>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useImagesLoader(
  srcs: string[],
  options: {
    loadOnMount?: boolean
  } = {}
): UseImagesLoaderResult {
  const { loadOnMount = false } = options

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Map<string, Error>>(new Map())
  const [loadedCount, setLoadedCount] = useState(0)

  const load = useCallback(() => {
    if (!srcs || srcs.length === 0) return

    setLoading(true)
    setErrors(new Map())
    setLoadedCount(0)

    preloadImages(srcs)
      .then((results) => {
        const newErrors = new Map<string, Error>()
        let successCount = 0

        results.forEach((result) => {
          if (result.status === 'success') {
            successCount++
          } else if (result.error) {
            newErrors.set(result.src, result.error)
          }
        })

        setLoadedCount(successCount)
        setErrors(newErrors)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [srcs])

  const reset = useCallback(() => {
    setLoading(false)
    setErrors(new Map())
    setLoadedCount(0)
  }, [])

  useEffect(() => {
    if (loadOnMount && srcs && srcs.length > 0) {
      load()
    }
  }, [loadOnMount, srcs, load])

  return {
    loading,
    errors,
    loadedCount,
    totalCount: srcs.length,
    allLoaded: !loading && loadedCount === srcs.length && errors.size === 0,
    load,
    reset,
  }
}

/**
 * Hook to track if an image is in viewport using Intersection Observer
 *
 * @param ref - React ref to the element to observe
 * @param options - Intersection Observer options
 * @returns Boolean indicating if element is in viewport
 *
 * @example
 * ```tsx
 * function LazyImage({ src }) {
 *   const ref = useRef<HTMLImageElement>(null)
 *   const isInView = useInViewport(ref)
 *
 *   return <img ref={ref} src={isInView ? src : placeholder} />
 * }
 * ```
 */
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isInView
}
