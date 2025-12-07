/**
 * No Firm Page
 * Shown when user is authenticated but has no firm associated
 */

import { Building2, LogOut, RefreshCw, Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'

export function NoFirmPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const { logout, user } = useAuthStore()
  const { fetchPermissions, isLoading } = usePermissionsStore()

  const handleRefresh = async () => {
    await fetchPermissions()
    // If permissions are now available, the route guard will redirect
    window.location.reload()
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/sign-in'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-amber-600" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {t('noFirm.title')}
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            {t('noFirm.description', { name: user?.firstName || user?.username || t('noFirm.defaultName') })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t('noFirm.createFirm.title')}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t('noFirm.createFirm.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t('noFirm.joinFirm.title')}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t('noFirm.joinFirm.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <RefreshCw className={`w-4 h-4 ${isRtl ? 'ms-2' : 'me-2'} animate-spin`} />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isRtl ? 'ms-2' : 'me-2'}`} />
              )}
              {t('noFirm.refreshStatus')}
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className={`w-4 h-4 ${isRtl ? 'ms-2' : 'me-2'}`} />
              {t('noFirm.signOut')}
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-center text-slate-500">
            {t('noFirm.helpText')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default NoFirmPage
