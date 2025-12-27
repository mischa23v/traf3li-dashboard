/**
 * PageAccessGuard Component
 * Protects routes by checking page access permissions and showing lock screen when denied
 */

'use client'

import React from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { usePageAccess } from '@/hooks/useUIAccess'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Lock, ArrowRight, Mail, Home, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface PageAccessGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  path?: string
}

interface LockScreenProps {
  title: string
  message: string
  showRequestAccess?: boolean
  redirectPath?: string
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function PageAccessSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-3 justify-center mt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOCK SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════

function LockScreen({ title, message, showRequestAccess, redirectPath }: LockScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleGoBack = () => {
    navigate({ to: '..', replace: true })
  }

  const handleGoHome = () => {
    navigate({ to: redirectPath || ROUTES.dashboard.overview, replace: true })
  }

  const handleRequestAccess = () => {
    // Could navigate to support page with context
    // TODO: Add ROUTES.dashboard.support.requestAccess to routes constant
    navigate({
      to: '/dashboard/support/request-access',
      search: { requestedPath: location.pathname },
    })
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 px-6 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {title || t('access.restricted')}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {message || t('access.noPermission')}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full"
            >
              <ArrowRight className="me-2 h-4 w-4 rotate-180" />
              {t('common.goBack')}
            </Button>

            {showRequestAccess && (
              <Button
                variant="default"
                onClick={handleRequestAccess}
                className="w-full"
              >
                <Mail className="me-2 h-4 w-4" />
                {t('access.requestAccess')}
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="w-full text-muted-foreground"
            >
              <Home className="me-2 h-4 w-4" />
              {t('access.goToDashboard')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT ACCESS DENIED COMPONENT
// ═══════════════════════════════════════════════════════════════

function AccessDenied() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <Lock className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">
        {t('access.denied')}
      </p>
      <Button
        variant="outline"
        onClick={() => navigate({ to: ROUTES.dashboard.overview })}
      >
        {t('access.goToDashboard')}
      </Button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE ACCESS GUARD COMPONENT
// ═══════════════════════════════════════════════════════════════

export function PageAccessGuard({
  children,
  fallback,
  path,
}: PageAccessGuardProps) {
  const location = useLocation()
  const { i18n } = useTranslation()

  const currentPath = path || location.pathname
  const { data: access, isLoading, error, refetch } = usePageAccess(currentPath)

  // Show loading state
  if (isLoading) {
    return fallback ? <>{fallback}</> : <PageAccessSkeleton />
  }

  // Handle error - allow access by default on error to avoid blocking users
  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[PageAccessGuard] Access check failed:', error)
    }
    // Return children on error to avoid blocking legitimate users
    return <>{children}</>
  }

  // Access granted
  if (access?.allowed) {
    return <>{children}</>
  }

  // Access denied - show lock screen if configured
  if (access?.lockScreen?.enabled) {
    const title = i18n.language === 'ar' ? access.lockScreen.title : access.lockScreen.titleEn
    const message = i18n.language === 'ar' ? access.lockScreen.message : access.lockScreen.messageEn

    return (
      <LockScreen
        title={title}
        message={message}
        showRequestAccess={access.lockScreen.showRequestAccess}
        redirectPath={access.redirectPath}
      />
    )
  }

  // Default access denied
  return <AccessDenied />
}

// ═══════════════════════════════════════════════════════════════
// HOC FOR ROUTE PROTECTION
// ═══════════════════════════════════════════════════════════════

export function withPageAccess<P extends object>(
  Component: React.ComponentType<P>,
  options?: { path?: string; fallback?: React.ReactNode }
) {
  return function WrappedComponent(props: P) {
    return (
      <PageAccessGuard path={options?.path} fallback={options?.fallback}>
        <Component {...props} />
      </PageAccessGuard>
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default PageAccessGuard
