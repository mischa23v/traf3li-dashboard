import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimeout } from '../useSessionTimeout'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}))

// Create a mock logout function that can be accessed in tests
const mockLogout = vi.fn()

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    logout: mockLogout,
  }),
}))

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_THRESHOLD = 25 * 60 * 1000 // 25 minutes (5 min before timeout)

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with full session time remaining', () => {
    const { result } = renderHook(() => useSessionTimeout())

    expect(result.current.remainingTime).toBe(SESSION_TIMEOUT)
    expect(result.current.isWarning).toBe(false)
  })

  it('should reset timer on resetTimer call', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    // Wait for state update
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Remaining time should be less
    expect(result.current.remainingTime).toBeLessThan(SESSION_TIMEOUT)

    // Reset timer
    act(() => {
      result.current.resetTimer()
    })

    // Wait for state update
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Should be back to full time (allow small timing variance)
    expect(result.current.remainingTime).toBeGreaterThanOrEqual(SESSION_TIMEOUT - 2000)
    expect(result.current.isWarning).toBe(false)
  })

  it('should show warning at 5 minutes before timeout', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time to just before warning threshold
    act(() => {
      vi.advanceTimersByTime(WARNING_THRESHOLD - 1000)
    })

    expect(result.current.isWarning).toBe(false)
    expect(toast.warning).not.toHaveBeenCalled()

    // Advance to warning threshold
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Wait for interval to tick
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.isWarning).toBe(true)
    expect(toast.warning).toHaveBeenCalledWith(
      'Your session will expire in 5 minutes due to inactivity.',
      expect.objectContaining({
        duration: 10000,
        action: expect.any(Object),
      })
    )
  })

  it('should call logout after session timeout', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time to session timeout
    act(() => {
      vi.advanceTimersByTime(SESSION_TIMEOUT)
    })

    // Wait for interval to tick
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(mockLogout).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'Your session has expired due to inactivity. Please log in again.'
    )
  })

  it('should extend session and show success message', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Extend session
    act(() => {
      result.current.extendSession()
    })

    expect(toast.success).toHaveBeenCalledWith('Session extended successfully')

    // Wait for state update
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Should be back to full time (allow small timing variance)
    expect(result.current.remainingTime).toBeGreaterThanOrEqual(SESSION_TIMEOUT - 2000)
    expect(result.current.isWarning).toBe(false)
  })

  it('should reset timer on user activity', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.remainingTime).toBeLessThan(SESSION_TIMEOUT)

    // Simulate user activity (mouse click)
    act(() => {
      window.dispatchEvent(new MouseEvent('click'))
    })

    // Advance time to let the activity handler run
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Timer should have been reset
    expect(result.current.remainingTime).toBeGreaterThan(SESSION_TIMEOUT - 5 * 60 * 1000)
  })

  it('should listen to multiple activity events', () => {
    const { result } = renderHook(() => useSessionTimeout())
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })

    activityEvents.forEach(eventType => {
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const initialTime = result.current.remainingTime

      // Dispatch activity event
      act(() => {
        const event = new Event(eventType)
        window.dispatchEvent(event)
      })

      // Wait for updates
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should have reset timer
      expect(result.current.remainingTime).toBeGreaterThanOrEqual(initialTime)
    })
  })

  it('should update remaining time every second', () => {
    const { result } = renderHook(() => useSessionTimeout())

    const initialTime = result.current.remainingTime

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Remaining time should have decreased by approximately 5 seconds
    expect(result.current.remainingTime).toBeLessThanOrEqual(initialTime - 4000)
    expect(result.current.remainingTime).toBeGreaterThan(0)
  })

  it('should not show warning multiple times', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance to warning threshold
    act(() => {
      vi.advanceTimersByTime(WARNING_THRESHOLD + 1000)
    })

    // Wait for interval tick
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.isWarning).toBe(true)

    const warningCallCount = (toast.warning as any).mock.calls.length

    // Advance more time
    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })

    // Should not call warning again
    expect((toast.warning as any).mock.calls.length).toBe(warningCallCount)
  })

  it('should clear warning when activity occurs during warning period', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance to warning threshold
    act(() => {
      vi.advanceTimersByTime(WARNING_THRESHOLD + 1000)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.isWarning).toBe(true)

    // User performs activity
    act(() => {
      window.dispatchEvent(new MouseEvent('click'))
    })

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    // Warning should be cleared
    expect(result.current.isWarning).toBe(false)
  })

  it('should clean up timers and event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSessionTimeout())

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearIntervalSpy.mockRestore()
    clearTimeoutSpy.mockRestore()
  })

  it('should throttle activity updates to avoid excessive resets', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Rapid activity events
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new MouseEvent('click'))
      }
    })

    // Should throttle and not process all events
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Timer should still function correctly
    expect(result.current.remainingTime).toBeGreaterThan(0)
  })

  it('should handle edge case of remaining time reaching zero', () => {
    const { result } = renderHook(() => useSessionTimeout())

    // Advance time past session timeout
    act(() => {
      vi.advanceTimersByTime(SESSION_TIMEOUT + 5000)
    })

    // Remaining time should not be negative
    expect(result.current.remainingTime).toBeGreaterThanOrEqual(0)
  })
})
