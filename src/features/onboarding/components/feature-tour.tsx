import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useWelcome } from '@/hooks/useWelcome'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeatureTour() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const {
    isTourActive,
    currentTourStep,
    tourSteps,
    nextTourStep,
    previousTourStep,
    skipTour,
    completeTour
  } = useWelcome()

  const currentStep = tourSteps[currentTourStep]
  const totalSteps = tourSteps.length
  const isLastStep = currentTourStep === totalSteps - 1
  const isFirstStep = currentTourStep === 0

  // Handle escape key to skip tour
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTourActive) {
        skipTour()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isTourActive, skipTour])

  if (!isTourActive || !currentStep) {
    return null
  }

  const handleNext = () => {
    if (isLastStep) {
      completeTour()
    } else {
      nextTourStep()
    }
  }

  return (
    <>
      {/* Backdrop with overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={skipTour}
      />

      {/* Tour Tooltip - Centered on screen for demonstration */}
      <div
        className="fixed top-1/2 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
      >
        <div className="relative mx-4 overflow-hidden rounded-lg border bg-card shadow-2xl">
          {/* Header with gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 pb-4">
            <div className="absolute top-0 right-0 size-32 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3
                    id="tour-title"
                    className="text-lg font-semibold leading-none"
                  >
                    {isRTL ? currentStep.titleAr : currentStep.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isRTL
                      ? `الخطوة ${currentTourStep + 1} من ${totalSteps}`
                      : `Step ${currentTourStep + 1} of ${totalSteps}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={skipTour}
                aria-label={isRTL ? 'إغلاق' : 'Close'}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            <p
              id="tour-description"
              className="mb-6 text-sm leading-relaxed text-muted-foreground"
            >
              {isRTL ? currentStep.descriptionAr : currentStep.description}
            </p>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="mb-2 flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      index <= currentTourStep
                        ? 'bg-primary'
                        : 'bg-primary/20'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={skipTour}
                className="flex-1"
              >
                {isRTL ? 'تخطي الجولة' : 'Skip Tour'}
              </Button>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTourStep}
                    disabled={isFirstStep}
                    aria-label={isRTL ? 'السابق' : 'Previous'}
                  >
                    {isRTL ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronLeft className="size-4" />
                    )}
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="min-w-24"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      {isRTL ? 'إنهاء' : 'Finish'}
                    </>
                  ) : (
                    <>
                      {isRTL ? 'التالي' : 'Next'}
                      {isRTL ? (
                        <ChevronLeft className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        </div>

        {/* Arrow pointer (optional - can be positioned based on target element) */}
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2">
          <div className="size-0 border-8 border-transparent border-b-card" />
        </div>
      </div>
    </>
  )
}
