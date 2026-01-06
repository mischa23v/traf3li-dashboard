import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { OfflineIndicator } from '@/components/offline-indicator'
import { SessionWarningModal } from '@/components/session-warning-modal'
import { useOnboardingWizardStatus, useSkipWizard } from '@/hooks/useOnboardingWizard'
import WelcomeScreen from '@/features/onboarding/components/welcome-screen'
import InitialSetupWizard from '@/features/onboarding/components/initial-setup-wizard'
import { WelcomeModal } from '@/features/onboarding/components/welcome-modal'
import { FeatureTour } from '@/features/onboarding/components/feature-tour'
import { QuickStartChecklist } from '@/features/onboarding/components/quick-start-checklist'
import { SetupReminderBanner } from '@/features/onboarding/components/setup-reminder-banner'
import { useWelcome } from '@/hooks/useWelcome'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  // Check onboarding status
  const { data: onboardingStatus, isLoading: isLoadingStatus } = useOnboardingWizardStatus()
  const skipWizardMutation = useSkipWizard()

  // New welcome modal state
  const { hasSeenWelcome, dontShowWelcomeAgain } = useWelcome()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  // Show welcome modal on first visit (after wizard is completed)
  useEffect(() => {
    if (!hasSeenWelcome && !dontShowWelcomeAgain && onboardingStatus?.completed) {
      // Delay showing the modal slightly for better UX
      const timer = setTimeout(() => {
        setShowWelcomeModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenWelcome, dontShowWelcomeAgain, onboardingStatus])

  const handleStartWizard = () => {
    setShowWelcome(false)
    setShowWizard(true)
  }

  const handleSkipWizard = async () => {
    await skipWizardMutation.mutateAsync()
    setShowWelcome(false)
    setShowWizard(false)
  }

  // Show welcome screen if onboarding is not completed
  if (showWelcome) {
    return (
      <WelcomeScreen
        onStartWizard={handleStartWizard}
        onSkipWizard={handleSkipWizard}
      />
    )
  }

  // Show wizard if user clicked start
  if (showWizard) {
    return <InitialSetupWizard />
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <OfflineIndicator />
          <SessionWarningModal />
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
              'bg-white text-[#0f172a]'
            )}
          >
            {/* Setup Reminder Banner */}
            {onboardingStatus?.completed && <SetupReminderBanner />}

            {children ?? <Outlet />}
          </SidebarInset>

          {/* New Onboarding Components */}
          <WelcomeModal open={showWelcomeModal} onOpenChange={setShowWelcomeModal} />
          <FeatureTour />
          {hasSeenWelcome && !dontShowWelcomeAgain && <QuickStartChecklist />}
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
