/**
 * Pricing Table Component
 * Reusable pricing comparison component for plan selection
 */

import { useTranslation } from 'react-i18next'
import { CheckIcon, XIcon, SparklesIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlanType } from '@/stores/upgrade-store'

export interface PlanFeature {
  id: string
  labelKey: string // Translation key
  free: boolean | string | number
  starter: boolean | string | number
  professional: boolean | string | number
  enterprise: boolean | string | number
}

interface PlanDetails {
  id: PlanType
  nameKey: string
  descriptionKey: string
  monthlyPrice: number | null // null for Enterprise (contact sales)
  annualPrice: number | null // null for Enterprise
  popular?: boolean
  recommended?: boolean
}

interface PricingTableProps {
  currentPlan?: PlanType
  recommendedPlan?: PlanType
  billingCycle: 'monthly' | 'annual'
  onSelectPlan: (plan: PlanType) => void
  onContactSales?: () => void
  className?: string
}

export function PricingTable({
  currentPlan = 'free',
  recommendedPlan,
  billingCycle = 'monthly',
  onSelectPlan,
  onContactSales,
  className,
}: PricingTableProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Plan configurations
  const plans: PlanDetails[] = [
    {
      id: 'free',
      nameKey: 'pricing.plans.free.name',
      descriptionKey: 'pricing.plans.free.description',
      monthlyPrice: 0,
      annualPrice: 0,
    },
    {
      id: 'starter',
      nameKey: 'pricing.plans.starter.name',
      descriptionKey: 'pricing.plans.starter.description',
      monthlyPrice: 299,
      annualPrice: 2990, // ~17% discount
      popular: true,
    },
    {
      id: 'professional',
      nameKey: 'pricing.plans.professional.name',
      descriptionKey: 'pricing.plans.professional.description',
      monthlyPrice: 699,
      annualPrice: 6990, // ~17% discount
    },
    {
      id: 'enterprise',
      nameKey: 'pricing.plans.enterprise.name',
      descriptionKey: 'pricing.plans.enterprise.description',
      monthlyPrice: null,
      annualPrice: null,
    },
  ]

  // Feature comparison matrix
  const features: PlanFeature[] = [
    // Core Features
    {
      id: 'cases',
      labelKey: 'pricing.features.cases',
      free: '5',
      starter: '50',
      professional: t('pricing.unlimited'),
      enterprise: t('pricing.unlimited'),
    },
    {
      id: 'clients',
      labelKey: 'pricing.features.clients',
      free: '10',
      starter: '100',
      professional: t('pricing.unlimited'),
      enterprise: t('pricing.unlimited'),
    },
    {
      id: 'storage',
      labelKey: 'pricing.features.storage',
      free: '1 GB',
      starter: '10 GB',
      professional: '100 GB',
      enterprise: t('pricing.unlimited'),
    },
    {
      id: 'users',
      labelKey: 'pricing.features.users',
      free: '1',
      starter: '3',
      professional: '10',
      enterprise: t('pricing.unlimited'),
    },
    // Advanced Features
    {
      id: 'invoicing',
      labelKey: 'pricing.features.invoicing',
      free: false,
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      id: 'timeTracking',
      labelKey: 'pricing.features.timeTracking',
      free: false,
      starter: true,
      professional: true,
      enterprise: true,
    },
    {
      id: 'reports',
      labelKey: 'pricing.features.reports',
      free: false,
      starter: t('pricing.basic'),
      professional: t('pricing.advanced'),
      enterprise: t('pricing.advanced'),
    },
    {
      id: 'automation',
      labelKey: 'pricing.features.automation',
      free: false,
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      id: 'apiAccess',
      labelKey: 'pricing.features.apiAccess',
      free: false,
      starter: false,
      professional: true,
      enterprise: true,
    },
    {
      id: 'whiteLabel',
      labelKey: 'pricing.features.whiteLabel',
      free: false,
      starter: false,
      professional: false,
      enterprise: true,
    },
    {
      id: 'support',
      labelKey: 'pricing.features.support',
      free: t('pricing.community'),
      starter: t('pricing.email'),
      professional: t('pricing.priority'),
      enterprise: t('pricing.dedicated'),
    },
  ]

  const getPrice = (plan: PlanDetails) => {
    if (plan.monthlyPrice === null) return null
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
  }

  const getButtonLabel = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return t('pricing.currentPlan')
    if (plan.id === 'enterprise') return t('pricing.contactSales')
    if (plan.id === 'free') return t('pricing.downgrade')
    return t('pricing.upgrade')
  }

  const getButtonVariant = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return 'outline'
    if (plan.id === recommendedPlan) return 'default'
    return 'outline'
  }

  const handlePlanSelect = (plan: PlanDetails) => {
    if (plan.id === currentPlan) return
    if (plan.id === 'enterprise' && onContactSales) {
      onContactSales()
    } else {
      onSelectPlan(plan.id)
    }
  }

  const renderFeatureValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="size-5 text-green-600 dark:text-green-500 mx-auto" />
      ) : (
        <XIcon className="size-5 text-muted-foreground/40 mx-auto" />
      )
    }
    return <span className="text-sm font-medium">{value}</span>
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile View - Stacked Cards */}
      <div className="block lg:hidden space-y-4">
        {plans.map((plan) => {
          const price = getPrice(plan)
          const isRecommended = plan.id === recommendedPlan
          const isCurrent = plan.id === currentPlan

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                isRecommended && 'border-primary shadow-lg',
                isCurrent && 'border-2'
              )}
            >
              {(plan.popular || isRecommended) && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                  <Badge variant="default" className="gap-1">
                    {isRecommended ? (
                      <>
                        <SparklesIcon className="size-3" />
                        {t('pricing.recommended')}
                      </>
                    ) : (
                      t('pricing.popular')
                    )}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{t(plan.nameKey)}</CardTitle>
                <CardDescription className="text-sm">
                  {t(plan.descriptionKey)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1">
                  {price !== null ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          {price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {t('pricing.sar')}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {billingCycle === 'monthly'
                          ? t('pricing.perMonth')
                          : t('pricing.perYear')}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">
                      {t('pricing.custom')}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-semibold text-sm">
                    {t('pricing.featuresIncluded')}
                  </p>
                  {features.map((feature) => {
                    const value = feature[plan.id]
                    return (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {typeof value === 'boolean' ? (
                          value ? (
                            <CheckIcon className="size-4 text-green-600 dark:text-green-500 shrink-0" />
                          ) : (
                            <XIcon className="size-4 text-muted-foreground/40 shrink-0" />
                          )
                        ) : (
                          <CheckIcon className="size-4 text-green-600 dark:text-green-500 shrink-0" />
                        )}
                        <span className={cn(typeof value === 'boolean' && !value && 'text-muted-foreground')}>
                          {t(feature.labelKey)}
                          {typeof value !== 'boolean' && `: ${value}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  variant={getButtonVariant(plan)}
                  disabled={isCurrent}
                  className="w-full"
                  size="lg"
                >
                  {getButtonLabel(plan)}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Desktop View - Comparison Table */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Plan Headers */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="col-span-1">
              {/* Empty space for feature labels */}
            </div>
            {plans.map((plan) => {
              const price = getPrice(plan)
              const isRecommended = plan.id === recommendedPlan
              const isCurrent = plan.id === currentPlan

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative col-span-1',
                    isRecommended && 'border-primary shadow-lg',
                    isCurrent && 'border-2'
                  )}
                >
                  {(plan.popular || isRecommended) && (
                    <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                      <Badge variant="default" className="gap-1 text-xs">
                        {isRecommended ? (
                          <>
                            <SparklesIcon className="size-3" />
                            {t('pricing.recommended')}
                          </>
                        ) : (
                          t('pricing.popular')
                        )}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">
                      {t(plan.nameKey)}
                    </CardTitle>
                    <CardDescription className="text-xs min-h-[2.5rem]">
                      {t(plan.descriptionKey)}
                    </CardDescription>

                    <div className="pt-2">
                      {price !== null ? (
                        <>
                          <div className="flex items-baseline gap-1 justify-center">
                            <span className="text-2xl font-bold">
                              {price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {t('pricing.sar')}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs text-center mt-1">
                            {billingCycle === 'monthly'
                              ? t('pricing.perMonth')
                              : t('pricing.perYear')}
                          </p>
                        </>
                      ) : (
                        <div className="text-xl font-bold text-center">
                          {t('pricing.custom')}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardFooter className="pt-0">
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      variant={getButtonVariant(plan)}
                      disabled={isCurrent}
                      className="w-full"
                      size="sm"
                    >
                      {getButtonLabel(plan)}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Feature Comparison Rows */}
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={cn(
                  'grid grid-cols-5 gap-4 py-3 px-2 rounded-lg',
                  index % 2 === 0 && 'bg-muted/30'
                )}
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium">
                    {t(feature.labelKey)}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {renderFeatureValue(feature.free)}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {renderFeatureValue(feature.starter)}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {renderFeatureValue(feature.professional)}
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {renderFeatureValue(feature.enterprise)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
