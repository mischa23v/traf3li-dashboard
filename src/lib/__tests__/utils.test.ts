import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility function', () => {
  it('should combine class names', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('should remove falsy classes', () => {
    const isActive = false
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).not.toContain('active')
  })

  it('should merge conflicting tailwind classes', () => {
    const result = cn('px-2', 'px-4')
    // tailwind-merge should keep the last one
    expect(result).toBe('px-4')
  })

  it('should handle object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'text-blue-500': false,
    })
    expect(result).toContain('text-red-500')
    expect(result).not.toContain('text-blue-500')
  })

  it('should handle arrays', () => {
    const result = cn(['px-2', 'py-1'])
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'other')
    expect(result).toContain('base')
    expect(result).toContain('other')
  })

  it('should return empty string for no input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle complex merging', () => {
    const result = cn(
      'text-sm font-medium',
      'bg-blue-500 hover:bg-blue-600',
      { 'opacity-50': false, 'cursor-pointer': true }
    )
    expect(result).toContain('text-sm')
    expect(result).toContain('font-medium')
    expect(result).toContain('bg-blue-500')
    expect(result).toContain('cursor-pointer')
    expect(result).not.toContain('opacity-50')
  })
})
