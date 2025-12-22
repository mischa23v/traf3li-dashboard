/**
 * Plan Comparison Component
 * Displays plan comparison table with upgrade/downgrade options
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PricingTable } from './pricing-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Info } from 'lucide-react'
import { useChangePlan, useUpcomingInvoice } from '@/hooks/useBilling'
import type { PlanType } from '@/stores/upgrade-store'
import type { PlanId } from '@/config/plans'

interface PlanComparisonProps {
  currentPlan: PlanId
}

export function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const { t } = useTranslation()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const changePlanMutation = useChangePlan()
  const { data: upcomingInvoice, isLoading: invoiceLoading } = useUpcomingInvoice(
    showConfirmation && selectedPlan ? selectedPlan : undefined
  )

  const handleSelectPlan = (plan: PlanType) => {
    if (plan === currentPlan) return
    setSelectedPlan(plan)
    setShowConfirmation(true)
  }

  const handleConfirmChange = async () => {
    if (!selectedPlan) return

    await changePlanMutation.mutateAsync({
      plan: selectedPlan as PlanId,
      billingCycle,
    })

    setShowConfirmation(false)
    setSelectedPlan(null)
  }

  const handleCancelChange = () => {
    setShowConfirmation(false)
    setSelectedPlan(null)
  }

  const handleContactSales = () => {
    // Open contact sales modal or redirect to contact page
    window.location.href = 'mailto:sales@traf3li.com?subject=Enterprise Plan Inquiry'
  }

  if (showConfirmation && selectedPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.confirmPlanChange')}</CardTitle>
          <CardDescription>{t('billing.confirmPlanChangeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Change Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('billing.currentPlan')}:</span>
              <span className="font-medium">{currentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('billing.newPlan')}:</span>
              <span className="font-medium">{selectedPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('billing.billingCycle')}:</span>
              <span className="font-medium">
                {billingCycle === 'monthly' ? t('billing.monthly') : t('billing.annual')}
              </span>
            </div>
          </div>

          {/* Upcoming Invoice Preview */}
          {invoiceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : upcomingInvoice ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('billing.upcomingInvoice')}</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>{t('billing.amount')}:</span>
                    <span className="font-medium">
                      {upcomingInvoice.amount.toLocaleString()} {upcomingInvoice.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('billing.dueDate')}:</span>
                    <span className="font-medium">
                      {new Date(upcomingInvoice.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {upcomingInvoice.prorationAmount && upcomingInvoice.prorationAmount !== 0 && (
                    <div className="flex justify-between">
                      <span>{t('billing.proration')}:</span>
                      <span className="font-medium">
                        {upcomingInvoice.prorationAmount > 0 ? '+' : ''}
                        {upcomingInvoice.prorationAmount.toLocaleString()}{' '}
                        {upcomingInvoice.currency}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{upcomingInvoice.description}</p>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleConfirmChange}
              disabled={changePlanMutation.isPending}
              className="flex-1"
            >
              {changePlanMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {t('billing.confirmChange')}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelChange}
              disabled={changePlanMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.selectBillingCycle')}</CardTitle>
          <CardDescription>{t('billing.selectBillingCycleDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as any)}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly" className="font-normal cursor-pointer">
                {t('billing.monthly')} - {t('billing.monthlyDescription')}
              </Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="annual" id="annual" />
              <Label htmlFor="annual" className="font-normal cursor-pointer">
                {t('billing.annual')} - {t('billing.annualDescription')}{' '}
                <span className="text-green-600 font-medium">({t('billing.save17')})</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <PricingTable
        currentPlan={currentPlan as PlanType}
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        onContactSales={handleContactSales}
      />
    </div>
  )
}
