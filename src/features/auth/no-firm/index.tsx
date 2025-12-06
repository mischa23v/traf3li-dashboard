/**
 * No Firm Page
 * Shown when user is authenticated but has no firm associated
 */

import { Building2, LogOut, RefreshCw, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'

export function NoFirmPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            لا يوجد مكتب مرتبط بحسابك
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            مرحباً {user?.firstName || user?.username || 'بك'}، يبدو أن حسابك غير مرتبط بأي مكتب محاماة حالياً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Options */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">إنشاء مكتب جديد</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    إذا كنت محامياً مرخصاً، يمكنك إنشاء مكتب جديد وبدء استخدام النظام
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">الانضمام لمكتب موجود</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    إذا كنت موظفاً، تواصل مع مدير المكتب لإرسال دعوة إليك للانضمام
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
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              تحديث حالة الحساب
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-center text-slate-400">
            إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default NoFirmPage
