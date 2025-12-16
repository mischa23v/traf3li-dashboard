/**
 * Plan Upgrade Modal Component
 * Shows when users try to access features above their plan
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XIcon, SparklesIcon, CheckCircle2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUpgradeStore, type PlanType } from '@/stores/upgrade-store'
import { useAuthStore } from '@/stores/auth-store'
import { PricingTable } from './pricing-table'

interface PlanUpgradeModalProps {
  onUpgrade?: (plan: PlanType) => void
  onContactSales?: () => void
  onStartFreeTrial?: (plan: PlanType) => void
}

export function PlanUpgradeModal({
  onUpgrade,
  onContactSales,
  onStartFreeTrial,
}: PlanUpgradeModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Store state
  const { isOpen, triggerFeature, recommendedPlan, closeUpgradeModal } =
    useUpgradeStore()
  const user = useAuthStore((state) => state.user)

  // Local state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  )
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)

  const currentPlan = (user?.plan || 'free') as PlanType

  // Calculate annual savings
  const annualSavings = {
    starter: Math.round(((299 * 12 - 2990) / (299 * 12)) * 100),
    professional: Math.round(((699 * 12 - 6990) / (699 * 12)) * 100),
  }

  const handleClose = () => {
    closeUpgradeModal()
    setSelectedPlan(null)
  }

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan)
    if (onUpgrade) {
      onUpgrade(plan)
    }
    // In a real implementation, this would navigate to checkout or trigger payment flow
  }

  const handleContactSales = () => {
    if (onContactSales) {
      onContactSales()
    }
    // In a real implementation, this would open a contact form or redirect to sales page
  }

  const handleStartFreeTrial = (plan: PlanType) => {
    if (onStartFreeTrial) {
      onStartFreeTrial(plan)
    }
    // In a real implementation, this would start a free trial
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-7xl max-h-[90vh] overflow-y-auto p-0"
        showCloseButton={false}
      >
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-6">
            <DialogHeader className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-2xl font-bold">
                  {triggerFeature
                    ? t('pricing.upgradeToAccess')
                    : t('pricing.upgradeYourPlan')}
                </DialogTitle>
                {recommendedPlan && (
                  <Badge variant="default" className="gap-1">
                    <SparklesIcon className="size-3" />
                    {t('pricing.recommended')}
                  </Badge>
                )}
              </div>

              {triggerFeature && (
                <DialogDescription className="text-base">
                  {t('pricing.upgradeMessage', { feature: triggerFeature })}
                </DialogDescription>
              )}

              {!triggerFeature && (
                <DialogDescription className="text-base">
                  {t('pricing.chooseThePlanThatFitsYourNeeds')}
                </DialogDescription>
              )}
            </DialogHeader>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0"
            >
              <XIcon className="size-5" />
              <span className="sr-only">{t('common.close')}</span>
            </Button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
              <Label
                htmlFor="billing-cycle"
                className={cn(
                  'text-sm font-medium cursor-pointer',
                  billingCycle === 'monthly' && 'text-foreground',
                  billingCycle === 'annual' && 'text-muted-foreground'
                )}
              >
                {t('pricing.monthly')}
              </Label>

              <Switch
                id="billing-cycle"
                checked={billingCycle === 'annual'}
                onCheckedChange={(checked) =>
                  setBillingCycle(checked ? 'annual' : 'monthly')
                }
              />

              <div className="flex items-center gap-2">
                <Label
                  htmlFor="billing-cycle"
                  className={cn(
                    'text-sm font-medium cursor-pointer',
                    billingCycle === 'annual' && 'text-foreground',
                    billingCycle === 'monthly' && 'text-muted-foreground'
                  )}
                >
                  {t('pricing.annual')}
                </Label>
                {billingCycle === 'annual' && (
                  <Badge variant="secondary" className="text-xs">
                    {t('pricing.saveUpTo', { percent: annualSavings.professional })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table Section */}
        <div className="p-6">
          <PricingTable
            currentPlan={currentPlan}
            recommendedPlan={recommendedPlan || undefined}
            billingCycle={billingCycle}
            onSelectPlan={handlePlanSelect}
            onContactSales={handleContactSales}
          />
        </div>

        {/* Free Trial Banner */}
        {currentPlan === 'free' && (
          <div className="mx-6 mb-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {t('pricing.startFreeTrial')}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('pricing.freeTrialDescription')}
                  </p>
                </div>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleStartFreeTrial('professional')}
                  className="shrink-0"
                >
                  {t('pricing.start14DayTrial')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="border-t bg-muted/30 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Money Back Guarantee */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <CheckCircle2Icon className="size-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">
                  {t('pricing.moneyBackGuarantee')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('pricing.moneyBackDescription')}
                </p>
              </div>

              {/* 24/7 Support */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-primary"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-sm">
                  {t('pricing.support247')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('pricing.support247Description')}
                </p>
              </div>

              {/* Secure Payment */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 text-primary"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h4 className="font-semibold text-sm">
                  {t('pricing.securePayment')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('pricing.securePaymentDescription')}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Additional Info */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>{t('pricing.allPricesInSAR')}</p>
              <p>{t('pricing.cancelAnytime')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
