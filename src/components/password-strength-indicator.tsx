/**
 * Password Strength Indicator Component
 *
 * Displays visual feedback for password strength based on multiple criteria:
 * - Length (min 8 characters)
 * - Uppercase letters
 * - Lowercase letters
 * - Numbers
 * - Special characters
 */

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  showRequirements?: boolean
}

interface PasswordCriteria {
  label: string
  labelAr: string
  met: boolean
}

function calculateStrength(password: string): {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  criteria: PasswordCriteria[]
} {
  const criteria: PasswordCriteria[] = [
    {
      label: 'At least 8 characters',
      labelAr: '8 أحرف على الأقل',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      labelAr: 'يحتوي على حرف كبير',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      labelAr: 'يحتوي على حرف صغير',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      labelAr: 'يحتوي على رقم',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      labelAr: 'يحتوي على رمز خاص',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ]

  const metCount = criteria.filter(c => c.met).length
  const score = (metCount / criteria.length) * 100

  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  if (score >= 80) level = 'strong'
  else if (score >= 60) level = 'good'
  else if (score >= 40) level = 'fair'

  return { score, level, criteria }
}

const strengthColors = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
}

const strengthLabels = {
  weak: { en: 'Weak', ar: 'ضعيف' },
  fair: { en: 'Fair', ar: 'مقبول' },
  good: { en: 'Good', ar: 'جيد' },
  strong: { en: 'Strong', ar: 'قوي' },
}

export const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const { score, level, criteria } = useMemo(
    () => calculateStrength(password),
    [password]
  )

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">
            {isRtl ? 'قوة كلمة المرور' : 'Password strength'}
          </span>
          <span
            className={cn(
              'font-medium',
              level === 'weak' && 'text-red-600',
              level === 'fair' && 'text-orange-600',
              level === 'good' && 'text-yellow-600',
              level === 'strong' && 'text-green-600'
            )}
          >
            {isRtl ? strengthLabels[level].ar : strengthLabels[level].en}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              strengthColors[level]
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <ul className="space-y-1 text-xs">
          {criteria.map((criterion, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                criterion.met ? 'text-green-600' : 'text-slate-400'
              )}
            >
              {criterion.met ? (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isRtl ? criterion.labelAr : criterion.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

export default PasswordStrengthIndicator
