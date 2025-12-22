/**
 * SSO Provider Card Component
 * Displays SSO provider information with configure/remove actions
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SSOProviderConfig } from '@/services/ssoService'

interface SSOProviderCardProps {
  provider: SSOProviderConfig
  onConfigure: (provider: SSOProviderConfig) => void
  onRemove: (providerId: string) => void
  isRemoving?: boolean
}

/**
 * Get provider logo component
 */
const getProviderLogo = (provider: string) => {
  switch (provider) {
    case 'google':
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    case 'microsoft':
      return (
        <svg className="w-10 h-10" viewBox="0 0 24 24">
          <path fill="#f25022" d="M1 1h10v10H1z"/>
          <path fill="#00a4ef" d="M13 1h10v10H13z"/>
          <path fill="#7fba00" d="M1 13h10v10H1z"/>
          <path fill="#ffb900" d="M13 13h10v10H13z"/>
        </svg>
      )
    default:
      return (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
          {provider.charAt(0).toUpperCase()}
        </div>
      )
  }
}

/**
 * Get status badge
 */
const getStatusBadge = (status: string, enabled: boolean) => {
  if (!enabled) {
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        معطل
      </Badge>
    )
  }

  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          نشط
        </Badge>
      )
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          خطأ
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          غير نشط
        </Badge>
      )
  }
}

export function SSOProviderCard({
  provider,
  onConfigure,
  onRemove,
  isRemoving = false
}: SSOProviderCardProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <Card className="border-0 shadow-sm rounded-3xl hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {provider.logo ? (
                <img
                  src={provider.logo}
                  alt={isRTL ? provider.displayNameAr : provider.displayName}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                getProviderLogo(provider.provider)
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-navy">
                    {isRTL ? provider.displayNameAr : provider.displayName}
                  </h3>
                  <p className="text-sm text-slate-500" dir="ltr">
                    {provider.clientId ? `Client ID: ${provider.clientId.slice(0, 20)}...` : 'Not configured'}
                  </p>
                </div>
                {getStatusBadge(provider.status, provider.enabled)}
              </div>

              {/* Test Status */}
              {provider.lastTestedAt && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500">
                    {isRTL ? 'آخر اختبار: ' : 'Last tested: '}
                    {new Date(provider.lastTestedAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </p>
                  {provider.lastTestStatus === 'failed' && provider.lastTestError && (
                    <p className="text-xs text-red-500 mt-1">
                      {isRTL ? 'خطأ: ' : 'Error: '}
                      {provider.lastTestError}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(provider)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {isRTL ? 'تكوين' : 'Configure'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isRemoving}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isRTL ? 'حذف' : 'Remove'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? `هل أنت متأكد من حذف مزود SSO "${provider.displayNameAr}"؟ لن يتمكن المستخدمون من تسجيل الدخول باستخدام هذا المزود بعد الحذف.`
                : `Are you sure you want to remove the SSO provider "${provider.displayName}"? Users will no longer be able to sign in using this provider.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (provider._id) {
                  onRemove(provider._id)
                }
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRTL ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
