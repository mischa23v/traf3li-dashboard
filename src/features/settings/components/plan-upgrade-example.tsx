/**
 * Example Usage of Plan Upgrade Modal
 *
 * This file demonstrates how to use the plan upgrade modal system
 */

import { Button } from '@/components/ui/button'
import { useUpgradeStore } from '@/stores/upgrade-store'
import { PlanUpgradeModal } from './plan-upgrade-modal'
import { toast } from 'sonner'

export function PlanUpgradeExample() {
  const { openUpgradeModal } = useUpgradeStore()

  // Example 1: Open modal without context (general upgrade)
  const handleGeneralUpgrade = () => {
    openUpgradeModal()
  }

  // Example 2: Open modal with a specific feature and recommended plan
  const handleFeatureUpgrade = () => {
    openUpgradeModal('Advanced Reports', 'professional')
  }

  // Example 3: Handle upgrade selection
  const handleUpgrade = (plan: string) => {
    toast.success(`Upgrading to ${plan} plan...`)
    // Implement actual upgrade logic here:
    // - Navigate to checkout page
    // - Show payment form
    // - Process payment
    // - Update user plan
    console.log('Upgrade to:', plan)
  }

  // Example 4: Handle contact sales
  const handleContactSales = () => {
    toast.info('Redirecting to sales contact form...')
    // Implement contact sales logic:
    // - Open contact form
    // - Send email to sales team
    // - Or redirect to external sales page
    console.log('Contact sales')
  }

  // Example 5: Handle free trial
  const handleStartFreeTrial = (plan: string) => {
    toast.success(`Starting ${plan} trial...`)
    // Implement free trial logic:
    // - Create trial subscription
    // - Update user plan with trial flag
    // - Send confirmation email
    console.log('Start trial for:', plan)
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Plan Upgrade Modal Examples</h2>

      <div className="space-y-2">
        <Button onClick={handleGeneralUpgrade}>
          Open General Upgrade Modal
        </Button>

        <Button onClick={handleFeatureUpgrade} variant="outline">
          Open Feature-Specific Upgrade Modal
        </Button>
      </div>

      {/* The modal component - should be placed at app root level */}
      <PlanUpgradeModal
        onUpgrade={handleUpgrade}
        onContactSales={handleContactSales}
        onStartFreeTrial={handleStartFreeTrial}
      />

      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h3 className="font-semibold mb-2">How to Use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>Add PlanUpgradeModal to your app root</strong> (e.g., in App.tsx or layout component)
          </li>
          <li>
            <strong>Import useUpgradeStore</strong> wherever you need to trigger the modal
          </li>
          <li>
            <strong>Call openUpgradeModal()</strong> with optional feature name and recommended plan
          </li>
          <li>
            <strong>Handle upgrade callbacks</strong> to process payments and update user plans
          </li>
        </ol>

        <div className="mt-4 p-3 bg-background rounded border-l-4 border-primary">
          <p className="text-sm font-mono">
            {`import { useUpgradeStore } from '@/stores/upgrade-store'`}
            <br />
            <br />
            {`const { openUpgradeModal } = useUpgradeStore()`}
            <br />
            <br />
            {`// Trigger when user tries to access premium feature`}
            <br />
            {`openUpgradeModal('Feature Name', 'professional')`}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: Protecting a premium feature
 */
export function ProtectedFeatureExample() {
  const { openUpgradeModal } = useUpgradeStore()

  const handlePremiumAction = () => {
    // Check if user has access to this feature
    const userPlan = 'free' // Get from auth store
    const requiredPlan = 'professional'

    if (userPlan === 'free' || userPlan === 'starter') {
      // User doesn't have access, show upgrade modal
      openUpgradeModal('Advanced Analytics Dashboard', requiredPlan)
      return
    }

    // User has access, proceed with action
    console.log('Execute premium action')
  }

  return (
    <Button onClick={handlePremiumAction}>
      Access Premium Feature
    </Button>
  )
}
