/**
 * Password Strength Indicator Component
 * Visual indicator for password strength with requirements checklist
 */

import * as React from 'react'
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
  className,
}: PasswordStrengthIndicatorProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const strength = usePasswordStrength(password)

  if (!password) return null

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

  const allMet = requirements.every((r) => r.met)

  return (
    <div className={cn('space-y-2', className)}>
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
      {showFeedback && strength.feedbackAr.length > 0 && !allMet && (
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
