/**
 * Password Breach Warning Component
 * Displays a modal warning when user's password has been found in data breaches
 */

import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Shield, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import type { PasswordBreachWarning as PasswordBreachWarningType } from '@/services/authService'

interface PasswordBreachWarningProps {
  warning: PasswordBreachWarningType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordBreachWarning({
  warning,
  open,
  onOpenChange,
}: PasswordBreachWarningProps) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleChangePassword = () => {
    onOpenChange(false)
    navigate({
      to: ROUTES.dashboard.settings.security,
      search: { action: 'change-password', reason: 'breach' },
    })
  }

  // Format breach count with locale
  // Backend returns 'count' field from HaveIBeenPwned API
  const formattedBreachCount = warning.count.toLocaleString(
    isRTL ? 'ar-SA' : 'en-US'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        dir={isRTL ? 'rtl' : 'ltr'}
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing on escape
      >
        <DialogHeader className="text-center sm:text-center">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-center">
            {isRTL ? 'تحذير أمني' : 'Security Warning'}
          </DialogTitle>

          <DialogDescription className="text-center">
            {/* Backend provides localized message based on user's Accept-Language header */}
            {warning.message}
          </DialogDescription>
        </DialogHeader>

        {/* Breach Count Badge */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 my-4">
          <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">
              {isRTL
                ? `تم العثور على كلمة المرور في ${formattedBreachCount} تسريب`
                : `Found in ${formattedBreachCount} data breaches`}
            </span>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-sm text-muted-foreground text-center mb-4">
          {isRTL
            ? 'يجب عليك تغيير كلمة المرور فوراً لحماية حسابك. كلمات المرور المسربة قد تستخدم من قبل المهاجمين للوصول إلى حسابك.'
            : 'You must change your password immediately to protect your account. Leaked passwords can be used by attackers to access your account.'}
        </p>

        {/* Action Button */}
        <Button
          onClick={handleChangePassword}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {isRTL ? 'تغيير كلمة المرور الآن' : 'Change Password Now'}
        </Button>

        {/* Learn More Link */}
        <a
          href="https://haveibeenpwned.com/FAQs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRTL ? 'ما هي قاعدة بيانات التسريبات؟' : 'What is a data breach?'}
          <ExternalLink className="w-3 h-3" />
        </a>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordBreachWarning
