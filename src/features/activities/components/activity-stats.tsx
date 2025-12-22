/**
 * Activity Stats Component
 * Display activity statistics dashboard
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivityStats } from '@/hooks/useOdooActivities'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'red' | 'orange' | 'blue' | 'green'
  className?: string
}

function StatCard({ title, value, icon, color, className }: StatCardProps) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  }

  const iconBgClasses = {
    red: 'bg-red-100 dark:bg-red-900',
    orange: 'bg-orange-100 dark:bg-orange-900',
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
  }

  return (
    <Card className={cn(colorClasses[color], 'border-0', className)}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('p-3 rounded-lg', iconBgClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityStatsProps {
  className?: string
}

export function ActivityStats({ className }: ActivityStatsProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data: stats, isLoading } = useActivityStats()

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={isArabic ? 'متأخرة' : 'Overdue'}
          value={stats?.overdue_count || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title={isArabic ? 'اليوم' : 'Today'}
          value={stats?.today_count || 0}
          icon={<Clock className="h-5 w-5" />}
          color="orange"
        />
        <StatCard
          title={isArabic ? 'مخططة' : 'Planned'}
          value={stats?.planned_count || 0}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title={isArabic ? 'مكتملة (7 أيام)' : 'Done (7 days)'}
          value={stats?.done_count || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Activity Types Breakdown */}
      {stats?.by_type && stats.by_type.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {isArabic ? 'حسب النوع' : 'By Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.by_type.map((item) => {
                const total =
                  (stats.overdue_count || 0) +
                  (stats.today_count || 0) +
                  (stats.planned_count || 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0

                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{isArabic ? item.nameAr : item.name}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Breakdown */}
      {stats?.by_model && stats.by_model.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isArabic ? 'حسب النموذج' : 'By Model'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.by_model.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm"
                >
                  <span>{item._id}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ActivityStats
