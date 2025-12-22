/**
 * Billing Settings Component
 * Main billing page showing current plan, usage, and quick actions
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  TrendingUp,
  Users,
  Database,
  FolderOpen,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowUpCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSubscription, useUsageMetrics, useCancelSubscription, useReactivateSubscription } from '@/hooks/useBilling'
import { getPlanConfig, formatLimit } from '@/config/plans'
import { PlanComparison } from './plan-comparison'
import { PaymentMethodSettings } from './payment-method-settings'
import { BillingHistory } from './billing-history'

export function BillingSettings() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [showPlanComparison, setShowPlanComparison] = useState(false)

  const { data: subscription, isLoading: subscriptionLoading } = useSubscription()
  const { data: usage, isLoading: usageLoading } = useUsageMetrics()
  const cancelMutation = useCancelSubscription()
  const reactivateMutation = useReactivateSubscription()

  const isLoading = subscriptionLoading || usageLoading

  if (isLoading) {
    return <BillingSettingsSkeleton />
  }

  if (!subscription) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('billing.errors.noSubscription')}</AlertTitle>
        <AlertDescription>{t('billing.errors.noSubscriptionDescription')}</AlertDescription>
      </Alert>
    )
  }

  const planConfig = getPlanConfig(subscription.plan)
  const statusColor = {
    active: 'bg-green-500',
    trialing: 'bg-blue-500',
    past_due: 'bg-yellow-500',
    canceled: 'bg-red-500',
  }[subscription.status]

  const statusLabel = {
    active: t('billing.status.active'),
    trialing: t('billing.status.trialing'),
    past_due: t('billing.status.pastDue'),
    canceled: t('billing.status.canceled'),
  }[subscription.status]

  const handleCancelSubscription = async () => {
    if (confirm(t('billing.confirmCancel'))) {
      await cancelMutation.mutateAsync()
    }
  }

  const handleReactivateSubscription = async () => {
    await reactivateMutation.mutateAsync()
  }

  if (showPlanComparison) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('billing.comparePlans')}</h2>
            <p className="text-muted-foreground">{t('billing.comparePlansDescription')}</p>
          </div>
          <Button variant="outline" onClick={() => setShowPlanComparison(false)}>
            {t('common.back')}
          </Button>
        </div>
        <PlanComparison currentPlan={subscription.plan} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('billing.title')}</h2>
        <p className="text-muted-foreground">{t('billing.description')}</p>
      </div>

      {/* Cancellation Warning */}
      {subscription.cancelAtPeriodEnd && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('billing.cancelScheduled')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t('billing.cancelScheduledDescription', {
                date: new Date(subscription.currentPeriodEnd).toLocaleDateString(
                  isRTL ? 'ar-SA' : 'en-US'
                ),
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivateSubscription}
              disabled={reactivateMutation.isPending}
            >
              {t('billing.reactivate')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('billing.currentPlan')}
              </CardTitle>
              <CardDescription>{t('billing.currentPlanDescription')}</CardDescription>
            </div>
            <Badge className={cn('text-white', statusColor)}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Details */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold">{isRTL ? planConfig.nameAr : planConfig.name}</h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? planConfig.descriptionAr : planConfig.description}
              </p>
            </div>
            <div className="text-end">
              {planConfig.price === 'custom' ? (
                <p className="text-2xl font-bold">{isRTL ? planConfig.priceAr : 'Custom'}</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">
                    {subscription.amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.currency} /{' '}
                    {subscription.billingCycle === 'monthly'
                      ? t('billing.monthly')
                      : t('billing.annual')}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Billing Period */}
          <div className="flex items-center gap-4 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('billing.currentPeriod')}:</span>
            <span className="font-medium">
              {new Date(subscription.currentPeriodStart).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}{' '}
              - {new Date(subscription.currentPeriodEnd).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => setShowPlanComparison(true)} className="flex-1">
            <ArrowUpCircle className="h-4 w-4 me-2" />
            {t('billing.upgradePlan')}
          </Button>
          {!subscription.cancelAtPeriodEnd && subscription.plan !== 'free' && (
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {t('billing.cancelSubscription')}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Usage Metrics */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('billing.usage.title')}
            </CardTitle>
            <CardDescription>{t('billing.usage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Users */}
              <UsageMetricCard
                icon={Users}
                label={t('billing.usage.users')}
                current={usage.users.current}
                limit={usage.users.limit}
                percentage={usage.users.percentage}
                isRTL={isRTL}
              />

              {/* Storage */}
              <UsageMetricCard
                icon={Database}
                label={t('billing.usage.storage')}
                current={usage.storage.current}
                limit={usage.storage.limit}
                percentage={usage.storage.percentage}
                unit="MB"
                isRTL={isRTL}
              />

              {/* Cases */}
              <UsageMetricCard
                icon={FolderOpen}
                label={t('billing.usage.cases')}
                current={usage.cases.current}
                limit={usage.cases.limit}
                percentage={usage.cases.percentage}
                isRTL={isRTL}
              />

              {/* Clients */}
              <UsageMetricCard
                icon={Users}
                label={t('billing.usage.clients')}
                current={usage.clients.current}
                limit={usage.clients.limit}
                percentage={usage.clients.percentage}
                isRTL={isRTL}
              />

              {/* Documents */}
              <UsageMetricCard
                icon={FileText}
                label={t('billing.usage.documents')}
                current={usage.documents.current}
                limit={usage.documents.limit}
                percentage={usage.documents.percentage}
                isRTL={isRTL}
              />

              {/* API Calls */}
              <UsageMetricCard
                icon={Activity}
                label={t('billing.usage.apiCalls')}
                current={usage.apiCalls.current}
                limit={usage.apiCalls.limit}
                percentage={usage.apiCalls.percentage}
                isRTL={isRTL}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Payment Methods */}
      <PaymentMethodSettings />

      <Separator />

      {/* Billing History */}
      <BillingHistory />
    </div>
  )
}

interface UsageMetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current: number
  limit: number
  percentage: number
  unit?: string
  isRTL: boolean
}

function UsageMetricCard({ icon: Icon, label, current, limit, percentage, unit, isRTL }: UsageMetricCardProps) {
  const isUnlimited = limit === -1
  const isNearLimit = percentage >= 80 && !isUnlimited
  const isOverLimit = percentage >= 100 && !isUnlimited

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isOverLimit ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : isNearLimit ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {current.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
            {unit && ` ${unit}`}
          </span>
          <span className="text-sm text-muted-foreground">
            / {isUnlimited ? (isRTL ? 'غير محدود' : 'Unlimited') : `${limit.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}${unit ? ` ${unit}` : ''}`}
          </span>
        </div>

        {!isUnlimited && (
          <>
            <Progress
              value={Math.min(percentage, 100)}
              className={cn(
                'h-2',
                isOverLimit && '[&>div]:bg-destructive',
                isNearLimit && !isOverLimit && '[&>div]:bg-yellow-500'
              )}
            />
            <p className="text-xs text-muted-foreground">{percentage}% {isRTL ? 'مستخدم' : 'used'}</p>
          </>
        )}
      </div>
    </div>
  )
}

function BillingSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
