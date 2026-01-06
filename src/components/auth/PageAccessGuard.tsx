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
    // Navigate to support page with context about requested path
    navigate({
      to: ROUTES.dashboard.support.requestAccess,
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

  // SECURITY: Fail closed on error - deny access when we can't verify permissions
  // This prevents unauthorized access if the permission service is down
  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[PageAccessGuard] Access check failed:', error)
    }
    // Show error state with retry option
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-center max-w-md">
          <div className="mb-4 text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {i18n.language === 'ar' ? 'تعذر التحقق من الصلاحيات' : 'Unable to verify permissions'}
          </h3>
          <p className="text-slate-500 mb-4">
            {i18n.language === 'ar'
              ? 'حدث خطأ أثناء التحقق من صلاحيات الوصول. يرجى المحاولة مرة أخرى.'
              : 'An error occurred while checking access permissions. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    )
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
