/**
 * SoloLawyerLockScreen Component
 * Shows a friendly message for solo lawyers who don't have a firm yet
 */

'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Home, Users } from 'lucide-react'

interface SoloLawyerLockScreenProps {
  /** Optional title override */
  title?: string
  /** Optional message override */
  message?: string
  /** Show create firm button */
  showCreateFirm?: boolean
  /** Custom redirect path for dashboard button */
  dashboardPath?: string
}

export function SoloLawyerLockScreen({
  title,
  message,
  showCreateFirm = true,
  dashboardPath = '/dashboard',
}: SoloLawyerLockScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleGoToDashboard = () => {
    navigate({ to: dashboardPath, replace: true })
  }

  const handleCreateFirm = () => {
    // Navigate to firm creation page when available
    // TODO: Add ROUTES.dashboard.settings.firm to routes constant
    navigate({ to: '/dashboard/settings/firm', replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 px-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {title || t('staff.soloLawyer.title', 'إدارة فريق العمل')}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {message || t('staff.soloLawyer.message', 'قم بإنشاء مكتب لإدارة فريق العمل وإضافة موظفين')}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {showCreateFirm && (
              <Button
                variant="default"
                onClick={handleCreateFirm}
                className="w-full"
              >
                <Building2 className="me-2 h-4 w-4" />
                {t('staff.soloLawyer.createFirm', 'إنشاء مكتب')}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleGoToDashboard}
              className="w-full"
            >
              <Home className="me-2 h-4 w-4" />
              {t('common.goToDashboard', 'العودة للرئيسية')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SoloLawyerLockScreen
