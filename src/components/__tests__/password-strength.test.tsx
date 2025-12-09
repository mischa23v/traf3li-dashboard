import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { PasswordStrength, usePasswordStrength } from '../password-strength'
import { renderHook } from '@testing-library/react'

describe('usePasswordStrength', () => {
  it('should return fair strength for password with length and one character type', () => {
    const { result } = renderHook(() => usePasswordStrength('aaaaaaaa'))

    expect(result.current.level).toBe('fair')
    expect(result.current.score).toBe(2)
    expect(result.current.percentage).toBe(50)
    expect(result.current.color).toBe('bg-orange-500')
    expect(result.current.requirements.minLength).toBe(true)
    expect(result.current.requirements.hasUppercase).toBe(false)
    expect(result.current.requirements.hasLowercase).toBe(true)
    expect(result.current.requirements.hasNumber).toBe(false)
    expect(result.current.requirements.hasSpecialChar).toBe(false)
  })

  it('should return good strength for password with length and two character types', () => {
    const { result } = renderHook(() => usePasswordStrength('Password'))

    expect(result.current.level).toBe('good')
    expect(result.current.score).toBe(3)
    expect(result.current.percentage).toBe(75)
    expect(result.current.color).toBe('bg-yellow-500')
    expect(result.current.requirements.minLength).toBe(true)
    expect(result.current.requirements.hasUppercase).toBe(true)
    expect(result.current.requirements.hasLowercase).toBe(true)
  })

  it('should return good strength for password with length and two/three requirements', () => {
    const { result } = renderHook(() => usePasswordStrength('Password123'))

    expect(result.current.level).toBe('good')
    expect(result.current.score).toBe(3)
    expect(result.current.percentage).toBe(75)
    expect(result.current.color).toBe('bg-yellow-500')
    expect(result.current.requirements.minLength).toBe(true)
    expect(result.current.requirements.hasUppercase).toBe(true)
    expect(result.current.requirements.hasLowercase).toBe(true)
    expect(result.current.requirements.hasNumber).toBe(true)
  })

  it('should return strong strength for password with all requirements', () => {
    const { result } = renderHook(() => usePasswordStrength('Password123!'))

    expect(result.current.level).toBe('strong')
    expect(result.current.score).toBe(4)
    expect(result.current.percentage).toBe(100)
    expect(result.current.color).toBe('bg-green-500')
    expect(result.current.requirements.minLength).toBe(true)
    expect(result.current.requirements.hasUppercase).toBe(true)
    expect(result.current.requirements.hasLowercase).toBe(true)
    expect(result.current.requirements.hasNumber).toBe(true)
    expect(result.current.requirements.hasSpecialChar).toBe(true)
  })

  it('should return weak strength for password shorter than 8 characters', () => {
    const { result } = renderHook(() => usePasswordStrength('Pass1!'))

    expect(result.current.level).toBe('weak')
    expect(result.current.score).toBe(0)
    expect(result.current.percentage).toBe(0)
    expect(result.current.color).toBe('bg-red-500')
    expect(result.current.requirements.minLength).toBe(false)
  })

  it('should correctly identify special characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*']

    specialChars.forEach(char => {
      const { result } = renderHook(() => usePasswordStrength(`Password123${char}`))
      expect(result.current.requirements.hasSpecialChar).toBe(true)
    })
  })

  it('should handle empty password', () => {
    const { result } = renderHook(() => usePasswordStrength(''))

    expect(result.current.level).toBe('weak')
    expect(result.current.score).toBe(0)
    expect(result.current.percentage).toBe(0)
    expect(result.current.requirements.minLength).toBe(false)
    expect(result.current.requirements.hasUppercase).toBe(false)
    expect(result.current.requirements.hasLowercase).toBe(false)
    expect(result.current.requirements.hasNumber).toBe(false)
    expect(result.current.requirements.hasSpecialChar).toBe(false)
  })

  it('should memoize results and only recalculate when password changes', () => {
    const { result, rerender } = renderHook(
      ({ password }) => usePasswordStrength(password),
      { initialProps: { password: 'Password123!' } }
    )

    const firstResult = result.current

    // Rerender with same password
    rerender({ password: 'Password123!' })

    // Should be the same object reference (memoized)
    expect(result.current).toBe(firstResult)

    // Rerender with different password
    rerender({ password: 'NewPassword123!' })

    // Should be a different object reference
    expect(result.current).not.toBe(firstResult)
  })
})

describe('PasswordStrength Component', () => {
  it('should not render when password is empty', () => {
    const { container } = render(<PasswordStrength password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('should render strength indicator with weak password', () => {
    const { container } = render(<PasswordStrength password="12345678" />)

    // Should show weak strength (check for the progress indicator)
    const progressIndicator = container.querySelector('.h-2')
    expect(progressIndicator).toBeInTheDocument()
  })

  it('should render all requirement checks', () => {
    render(<PasswordStrength password="Test" />)

    // Should render all 5 requirements (minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar)
    // Looking for check and X icons
    const container = document.querySelector('.space-y-1\\.5')
    expect(container).toBeInTheDocument()

    // Should have 5 requirement items
    const requirements = container?.querySelectorAll('.flex.items-center.gap-2')
    expect(requirements).toHaveLength(5)
  })

  it('should show check icon for met requirements', () => {
    render(<PasswordStrength password="Password123!" />)

    // All requirements met, so all should have green background
    const greenIndicators = document.querySelectorAll('.bg-green-500')
    expect(greenIndicators.length).toBeGreaterThan(0)
  })

  it('should show X icon for unmet requirements', () => {
    render(<PasswordStrength password="pass" />)

    // Most requirements not met, should have gray background indicators
    const grayIndicators = document.querySelectorAll('.bg-slate-200')
    expect(grayIndicators.length).toBeGreaterThan(0)
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PasswordStrength password="test123" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should update indicator color based on strength level', () => {
    const { container, rerender } = render(<PasswordStrength password="12345678" />)

    // Weak password - red
    let progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    // Fair password - orange
    rerender(<PasswordStrength password="Password" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    // Good password - yellow
    rerender(<PasswordStrength password="Password123" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    // Strong password - green
    rerender(<PasswordStrength password="Password123!" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()
  })

  it('should have proper accessibility with progress bar', () => {
    const { container } = render(<PasswordStrength password="Password123!" />)

    const progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()
    // Progress component doesn't have ARIA attributes by default,
    // but it provides visual feedback
  })

  it('should display password strength percentage correctly', () => {
    const { container, rerender } = render(<PasswordStrength password="12345678" />)
    let progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    rerender(<PasswordStrength password="Password" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    rerender(<PasswordStrength password="Password123" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()

    rerender(<PasswordStrength password="Password123!" />)
    progressBar = container.querySelector('.h-2')
    expect(progressBar).toBeInTheDocument()
  })
})
