/**
 * LDAP Login Button Component
 * Displays LDAP login option if LDAP is configured and enabled
 */

import { useTranslation } from 'react-i18next'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLDAPConfig } from '@/hooks/useLDAP'

interface LDAPLoginButtonProps {
  disabled?: boolean
  isLoading?: boolean
  onLDAPLogin: () => void
  className?: string
}

export function LDAPLoginButton({
  disabled = false,
  isLoading = false,
  onLDAPLogin,
  className = '',
}: LDAPLoginButtonProps) {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch LDAP configuration to check if enabled
  const { data: ldapConfig, isLoading: isConfigLoading } = useLDAPConfig()

  // Don't render anything if loading or LDAP not configured/enabled
  if (isConfigLoading || !ldapConfig || !ldapConfig.enabled) {
    return null
  }

  const buttonText = isRTL ? 'تسجيل الدخول باستخدام LDAP' : 'Sign in with LDAP'

  return (
    <>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-500">
            {isRTL ? 'أو استخدم' : 'Or use'}
          </span>
        </div>
      </div>

      <div className={className}>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={onLDAPLogin}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
          {buttonText}
        </Button>
      </div>
    </>
  )
}

export default LDAPLoginButton
