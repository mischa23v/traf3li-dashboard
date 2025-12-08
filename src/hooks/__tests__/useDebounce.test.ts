import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback, useThrottle } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    // Initial value
    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated' })

    // Should still be initial immediately
    expect(result.current).toBe('initial')

    // Fast forward 299ms - should still be initial
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('initial')

    // Fast forward 1 more ms (total 300ms) - should be updated
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    // Rapid changes
    rerender({ value: 'b' })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'c' })
    act(() => { vi.advanceTimersByTime(100) })

    rerender({ value: 'd' })
    act(() => { vi.advanceTimersByTime(100) })

    // Should still be 'a' because timer keeps resetting
    expect(result.current).toBe('a')

    // Wait full 300ms from last change
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('d')
  })

  it('should work with different data types', () => {
    // Number
    const { result: numberResult } = renderHook(() => useDebounce(42, 300))
    expect(numberResult.current).toBe(42)

    // Object
    const obj = { foo: 'bar' }
    const { result: objectResult } = renderHook(() => useDebounce(obj, 300))
    expect(objectResult.current).toBe(obj)

    // Array
    const arr = [1, 2, 3]
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 300))
    expect(arrayResult.current).toBe(arr)
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce callback execution', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    // Call multiple times rapidly
    act(() => {
      result.current('a')
      result.current('b')
      result.current('c')
    })

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled()

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should only be called once with last value
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('c')
  })

  it('should pass all arguments to callback', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, 300)
    )

    act(() => {
      result.current('arg1', 'arg2', 'arg3')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
  })
})

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 'a' } }
    )

    expect(result.current).toBe('a')

    // Change value immediately - throttle prevents immediate update
    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    // Wait for interval - should now be 'b'
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('b')

    // Change value again before interval - should not update immediately
    rerender({ value: 'c' })
    expect(result.current).toBe('b')

    // Wait for interval
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('c')
  })
})
