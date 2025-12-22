import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles, X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSetupOrchestrationStatus } from '@/hooks/useSetupOrchestration'
import { cn } from '@/lib/utils'

export function SetupReminderBanner() {
  const navigate = useNavigate()
  const [isDismissed, setIsDismissed] = useState(false)
  const { data: status } = useSetupOrchestrationStatus()

  // Don't show if:
  // - Banner is dismissed
  // - No status data
  // - No critical setups pending
  // - User is already on setup pages
  const isOnSetupPage = window.location.pathname.includes('/setup')

  if (isDismissed || !status || !status.hasCriticalSetupPending || isOnSetupPage) {
    return null
  }

  const incompleteCriticalModules = status.modules.filter(
    m => m.isCritical && !m.isComplete && !m.isSkipped
  )

  const handleStartSetup = () => {
    navigate({ to: '/dashboard/setup-orchestrator' as any })
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal in localStorage (optional)
    localStorage.setItem('setup-reminder-dismissed', 'true')
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-emerald-500 to-blue-500 text-white',
        'border-b border-emerald-600/20 relative overflow-hidden'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>

            {/* Text & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-sm">
                  أكمل إعداد النظام ({incompleteCriticalModules.length} وحدات مطلوبة)
                </h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {Math.round(status.overallProgress)}%
                </span>
              </div>
              <div className="max-w-md">
                <Progress
                  value={status.overallProgress}
                  className="h-1.5 bg-white/20"
                  indicatorClassName="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartSetup}
              className="text-white hover:bg-white/20 rounded-lg"
            >
              متابعة الإعداد
              <ArrowLeft className="w-4 h-4 ms-1" />
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
