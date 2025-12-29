/**
 * Password Strength Indicator Component
 * Visual indicator for password strength with requirements checklist
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconCheck, IconX } from '@tabler/icons-react'
import { usePasswordStrength } from '@/hooks/usePassword'
import type { PasswordStrength } from '@/services/passwordService'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
  showFeedback?: boolean
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
  /** Auto-hide when all requirements are met (default: true) */
  autoHide?: boolean
  /** Delay in ms before auto-hiding (default: 1500) */
  autoHideDelay?: number
  className?: string
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  showFeedback = true,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  requireSpecialChars = true,
  autoHide = true,
  autoHideDelay = 1500,
  className,
}: PasswordStrengthIndicatorProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const strength = usePasswordStrength(password)
  const [isHidden, setIsHidden] = useState(false)

  // Check individual requirements inline first to use in useEffect
  const meetsMinLength = password.length >= minLength
  const meetsUppercase = !requireUppercase || /[A-Z]/.test(password)
  const meetsLowercase = !requireLowercase || /[a-z]/.test(password)
  const meetsNumbers = !requireNumbers || /\d/.test(password)
  const meetsSpecialChars = !requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const allRequirementsMet = meetsMinLength && meetsUppercase && meetsLowercase && meetsNumbers && meetsSpecialChars

  // Auto-hide when all requirements are met
  useEffect(() => {
    if (autoHide && allRequirementsMet && password) {
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    } else {
      setIsHidden(false)
    }
  }, [autoHide, allRequirementsMet, autoHideDelay, password])

  if (!password || isHidden) return null

  // Check individual requirements
  const requirements = [
    {
      met: password.length >= minLength,
      label: t('auth.requirements.minLength', `على الأقل ${minLength} أحرف`),
      labelEn: `At least ${minLength} characters`,
    },
    ...(requireUppercase
      ? [
          {
            met: /[A-Z]/.test(password),
            label: t('auth.requirements.uppercase', 'حرف كبير واحد على الأقل'),
            labelEn: 'At least one uppercase letter',
          },
        ]
      : []),
    ...(requireLowercase
      ? [
          {
            met: /[a-z]/.test(password),
            label: t('auth.requirements.lowercase', 'حرف صغير واحد على الأقل'),
            labelEn: 'At least one lowercase letter',
          },
        ]
      : []),
    ...(requireNumbers
      ? [
          {
            met: /\d/.test(password),
            label: t('auth.requirements.number', 'رقم واحد على الأقل'),
            labelEn: 'At least one number',
          },
        ]
      : []),
    ...(requireSpecialChars
      ? [
          {
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            label: t('auth.requirements.special', 'رمز خاص واحد على الأقل'),
            labelEn: 'At least one special character',
          },
        ]
      : []),
  ]

  return (
    <div className={cn('space-y-2 transition-all duration-300', allRequirementsMet && 'opacity-80', className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((segment) => {
            const isActive = strength.score >= (segment + 1) * 20
            return (
              <div
                key={segment}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  isActive ? '' : 'bg-muted'
                )}
                style={{
                  backgroundColor: isActive ? strength.color : undefined,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: strength.color }}>
            {isRTL ? strength.labelAr : strength.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {strength.score}%
          </span>
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <ul className="space-y-1 text-xs">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center gap-1.5',
                req.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <IconCheck className="h-3 w-3" />
              ) : (
                <IconX className="h-3 w-3" />
              )}
              {isRTL ? req.label : req.labelEn}
            </li>
          ))}
        </ul>
      )}

      {/* Feedback */}
      {showFeedback && strength.feedbackAr.length > 0 && !allRequirementsMet && (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {(isRTL ? strength.feedbackAr : strength.feedback).map(
            (feedback, index) => (
              <li key={index}>• {feedback}</li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

export default PasswordStrengthIndicator
