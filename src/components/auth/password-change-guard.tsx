/**
 * Password Change Guard Component
 * Blocks access to protected routes when user must change their password
 * Redirects to security settings page with change password action
 */

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore, selectMustChangePassword, selectPasswordBreachWarning } from '@/stores/auth-store'
import { PasswordBreachWarning } from './password-breach-warning'
import { ROUTES } from '@/constants/routes'

// Paths that are allowed even when password change is required
const ALLOWED_PATHS = [
  ROUTES.dashboard.settings.security,
  '/logout',
  '/auth/logout',
  '/sign-out',
]

interface PasswordChangeGuardProps {
  children: React.ReactNode
}

export function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const mustChangePassword = useAuthStore(selectMustChangePassword)
  const passwordBreachWarning = useAuthStore(selectPasswordBreachWarning)
  const clearPasswordBreachWarning = useAuthStore((state) => state.clearPasswordBreachWarning)

  // State to control the breach warning modal
  const [showBreachWarning, setShowBreachWarning] = useState(false)

  // Show breach warning modal when there's a warning and password must be changed
  useEffect(() => {
    if (passwordBreachWarning && mustChangePassword) {
      setShowBreachWarning(true)
    }
  }, [passwordBreachWarning, mustChangePassword])

  // Redirect to security settings if password change is required
  // but only if not already on an allowed path
  useEffect(() => {
    if (!mustChangePassword) return

    const currentPath = location.pathname
    const isAllowedPath = ALLOWED_PATHS.some(
      (path) => currentPath.startsWith(path) || currentPath === path
    )

    // Check if already on change password page with correct params
    const searchParams = new URLSearchParams(location.search as string)
    const hasChangePasswordAction = searchParams.get('action') === 'change-password'
    const isOnSecurityPage = currentPath.startsWith(ROUTES.dashboard.settings.security)

    if (!isAllowedPath && !(isOnSecurityPage && hasChangePasswordAction)) {
      // Redirect to security settings with change password action
      navigate({
        to: ROUTES.dashboard.settings.security,
        search: { action: 'change-password', reason: 'breach' },
        replace: true,
      })
    }
  }, [mustChangePassword, location.pathname, location.search, navigate])

  // Handle modal close - still redirect to change password
  const handleWarningClose = (open: boolean) => {
    setShowBreachWarning(open)
    if (!open) {
      // Clear the warning from store but keep mustChangePassword flag
      // The user will still need to change their password
      clearPasswordBreachWarning()
    }
  }

  return (
    <>
      {children}

      {/* Password Breach Warning Modal */}
      {passwordBreachWarning && (
        <PasswordBreachWarning
          warning={passwordBreachWarning}
          open={showBreachWarning}
          onOpenChange={handleWarningClose}
        />
      )}
    </>
  )
}

export default PasswordChangeGuard
