import { memo } from 'react'
import { Bell, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NotificationsTabProps } from '../types'

export const NotificationsTab = memo(function NotificationsTab({
  t,
}: NotificationsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notifications */}
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            {t('dashboard.notifications.title', 'الإشعارات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Bell className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {t('dashboard.notifications.noNotifications', 'لا توجد إشعارات جديدة')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            {t('dashboard.notifications.activityFeed', 'سجل النشاطات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Activity className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {t('dashboard.notifications.noActivity', 'لا توجد نشاطات حديثة')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
