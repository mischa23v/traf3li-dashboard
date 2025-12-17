import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, Zap, Clock, TrendingUp } from 'lucide-react'
import { useCacheStats } from '@/hooks/use-service-health'
import { cn } from '@/lib/utils'

interface CacheStatsProps {
  className?: string
  compact?: boolean
}

export function CacheStats({ className, compact = false }: CacheStatsProps) {
  const { stats, isLoading, error, refetch } = useCacheStats({
    pollingInterval: 30000,
  })

  if (isLoading) {
    return <CacheStatsSkeleton compact={compact} />
  }

  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل إحصائيات الذاكرة المؤقتة</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const hitRateValue = stats.hitRate * 100
  const hitRateColor = hitRateValue >= 80 ? 'text-green-600' : hitRateValue >= 60 ? 'text-yellow-600' : 'text-red-600'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Cache:</span>
          <Badge variant={hitRateValue >= 80 ? 'default' : 'secondary'}>
            {stats.hitRatePercent}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {stats.total.toLocaleString()} requests
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              إحصائيات الذاكرة المؤقتة
            </CardTitle>
            <CardDescription>أداء ذاكرة التخزين المؤقت للخادم</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hit Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              معدل الإصابة
            </span>
            <span className={cn('font-bold', hitRateColor)}>
              {stats.hitRatePercent}
            </span>
          </div>
          <Progress value={hitRateValue} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الإصابات</p>
            <p className="text-xl font-bold text-green-600">
              {stats.hits.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الإخفاقات</p>
            <p className="text-xl font-bold text-red-600">
              {stats.misses.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
            <p className="text-xl font-bold">
              {stats.total.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">نوع الذاكرة</p>
            <Badge variant="outline" className="mt-1">
              {stats.cacheType}
            </Badge>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            وقت التشغيل
          </span>
          <span className="text-sm font-medium">{stats.uptimeFormatted}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CacheStatsSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export default CacheStats
