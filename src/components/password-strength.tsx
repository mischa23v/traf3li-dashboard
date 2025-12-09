import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export interface PasswordStrengthResult {
  score: number
  percentage: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  color: string
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export function usePasswordStrength(password: string): PasswordStrengthResult {
  return useMemo(() => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
    }

    // Count met requirements (excluding length as it's mandatory)
    const metRequirements = [
      requirements.hasUppercase,
      requirements.hasLowercase,
      requirements.hasNumber,
      requirements.hasSpecialChar,
    ].filter(Boolean).length

    // Calculate score and level
    let score = 0
    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
    let color = 'bg-red-500'

    if (requirements.minLength) {
      if (metRequirements === 0) {
        score = 1
        level = 'weak'
        color = 'bg-red-500'
      } else if (metRequirements === 1) {
        score = 2
        level = 'fair'
        color = 'bg-orange-500'
      } else if (metRequirements === 2 || metRequirements === 3) {
        score = 3
        level = 'good'
        color = 'bg-yellow-500'
      } else if (metRequirements === 4) {
        score = 4
        level = 'strong'
        color = 'bg-green-500'
      }
    }

    const percentage = (score / 4) * 100

    return {
      score,
      percentage,
      level,
      color,
      requirements,
    }
  }, [password])
}

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const { t } = useTranslation()
  const strength = usePasswordStrength(password)

  if (!password) return null

  const requirementsList = [
    {
      key: 'minLength',
      met: strength.requirements.minLength,
      label: t('passwordStrength.requirements.minLength'),
    },
    {
      key: 'hasUppercase',
      met: strength.requirements.hasUppercase,
      label: t('passwordStrength.requirements.hasUppercase'),
    },
    {
      key: 'hasLowercase',
      met: strength.requirements.hasLowercase,
      label: t('passwordStrength.requirements.hasLowercase'),
    },
    {
      key: 'hasNumber',
      met: strength.requirements.hasNumber,
      label: t('passwordStrength.requirements.hasNumber'),
    },
    {
      key: 'hasSpecialChar',
      met: strength.requirements.hasSpecialChar,
      label: t('passwordStrength.requirements.hasSpecialChar'),
    },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            {t('passwordStrength.label')}
          </span>
          <span
            className={cn(
              'font-medium',
              strength.level === 'weak' && 'text-red-600',
              strength.level === 'fair' && 'text-orange-600',
              strength.level === 'good' && 'text-yellow-600',
              strength.level === 'strong' && 'text-green-600'
            )}
          >
            {t(`passwordStrength.levels.${strength.level}`)}
          </span>
        </div>
        <Progress
          value={strength.percentage}
          className="h-2"
          indicatorClassName={strength.color}
        />
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        {requirementsList.map((requirement) => (
          <div
            key={requirement.key}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full',
                requirement.met
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              )}
            >
              {requirement.met ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-2.5 w-2.5" />
              )}
            </div>
            <span
              className={cn(
                requirement.met ? 'text-slate-700' : 'text-slate-500'
              )}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
