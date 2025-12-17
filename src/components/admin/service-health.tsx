import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useServiceHealth } from '@/hooks/use-service-health'
import { getStatusColor, getStatusBadgeVariant } from '@/services/health.service'
import { cn } from '@/lib/utils'

interface ServiceHealthProps {
  className?: string
  compact?: boolean
}

export function ServiceHealth({ className, compact = false }: ServiceHealthProps) {
  const { health, isLoading, error, refetch, isHealthy, isDegraded, degradedServices } = useServiceHealth({
    pollingInterval: 60000,
  })

  if (isLoading) {
    return <ServiceHealthSkeleton compact={compact} />
  }

  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p>تعذر تحميل حالة الخدمات</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const StatusIcon = isHealthy ? CheckCircle2 : isDegraded ? AlertTriangle : XCircle
  const statusText = isHealthy ? 'سليم' : isDegraded ? 'متدهور' : 'معطل'

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">الخدمات:</span>
          <Badge variant={getStatusBadgeVariant(health?.status || 'healthy')}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusText}
          </Badge>
        </div>
        {degradedServices.length > 0 && (
          <span className="text-sm text-yellow-600">
            ({degradedServices.length} متدهورة)
          </span>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              حالة الخدمات
            </CardTitle>
            <CardDescription>مراقبة حالة الخدمات الخلفية</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(health?.status || 'healthy')}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusText}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {health?.circuits?.services && Object.entries(health.circuits.services).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(health.circuits.services).map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-sm font-medium capitalize">{name}</span>
                <div className="flex items-center gap-2">
                  {status.isHealthy ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge
                    variant={status.isHealthy ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {status.isHealthy ? 'سليم' : 'معطل'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p>جميع الخدمات تعمل بشكل طبيعي</p>
          </div>
        )}

        {degradedServices.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-1">
              خدمات متدهورة ({degradedServices.length})
            </p>
            <p className="text-xs text-yellow-600">
              {degradedServices.join('، ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ServiceHealthSkeleton({ compact }: { compact?: boolean }) {
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
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  )
}

export default ServiceHealth
