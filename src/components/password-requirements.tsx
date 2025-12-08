import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordRequirementsProps {
  password: string
  className?: string
}

interface Requirement {
  label: string
  labelAr: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    labelAr: '8 أحرف على الأقل',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One lowercase letter',
    labelAr: 'حرف صغير واحد',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'One uppercase letter',
    labelAr: 'حرف كبير واحد',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One number',
    labelAr: 'رقم واحد',
    test: (password) => /\d/.test(password),
  },
]

/**
 * Password Requirements Component
 * Shows real-time password validation feedback
 */
export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const isRTL = document.documentElement.dir === 'rtl'

  return (
    <ul className={cn('space-y-1 text-sm', className)}>
      {requirements.map((req, index) => {
        const passed = req.test(password)
        return (
          <li
            key={index}
            className={cn(
              'flex items-center gap-2 transition-colors duration-200',
              passed ? 'text-emerald-600' : 'text-slate-500'
            )}
          >
            {passed ? (
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
            )}
            <span>{isRTL ? req.labelAr : req.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  return requirements.every((req) => req.test(password))
}

/**
 * Password validation regex pattern
 * Must contain: lowercase, uppercase, and number
 * Minimum 8 characters, maximum 128 characters
 */
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/

export default PasswordRequirements
