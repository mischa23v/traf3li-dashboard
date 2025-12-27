import { useNavigate } from '@tanstack/react-router'
import { Sparkles, CheckCircle2, TrendingUp, Users, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useTranslation } from 'react-i18next'

interface SetupCelebrationProps {
  completedModules?: string[]
  onContinue?: () => void
}

export function SetupCelebration({ completedModules = [], onContinue }: SetupCelebrationProps) {
  const navigate = useNavigate()
  const { width, height } = useWindowSize()
  const { t } = useTranslation()

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      navigate({ to: '/dashboard' as any })
    }
  }

  const nextSteps = [
    {
      icon: Users,
      title: t('onboarding.celebration.inviteTeam'),
      description: t('onboarding.celebration.inviteTeamDesc'),
      action: t('onboarding.celebration.invite'),
      route: '/dashboard/settings/team',
    },
    {
      icon: FileText,
      title: t('onboarding.celebration.addData'),
      description: t('onboarding.celebration.addDataDesc'),
      action: t('onboarding.celebration.add'),
    },
    {
      icon: TrendingUp,
      title: t('onboarding.celebration.exploreReports'),
      description: t('onboarding.celebration.exploreReportsDesc'),
      action: t('onboarding.celebration.viewReports'),
      route: '/dashboard/reports',
    },
    {
      icon: Settings,
      title: t('onboarding.celebration.customizeSettings'),
      description: t('onboarding.celebration.customizeSettingsDesc'),
      action: t('onboarding.celebration.settings'),
      route: '/dashboard/settings',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 relative overflow-hidden">
      {/* Confetti */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-8 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-navy mb-4">
          🎉 {t('onboarding.celebration.congratulations')}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-600 mb-8">
          {t('onboarding.celebration.completed')}
        </p>

        {/* Completed Modules */}
        {completedModules.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 text-right">
            <h3 className="font-bold text-navy mb-4 text-center">{t('onboarding.celebration.completedModules')}</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {completedModules.map((module, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">{module}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6">{t('onboarding.celebration.nextSteps')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card
                  key={index}
                  className="text-right hover:shadow-lg transition-all border-2 border-slate-100 hover:border-emerald-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-navy mb-1">{step.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                        {step.route && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ to: step.route as any })}
                            className="rounded-lg text-xs"
                          >
                            {step.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Main CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            onClick={handleContinue}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-2xl shadow-emerald-500/20 px-8 py-6 text-lg"
          >
            <Sparkles className="w-6 h-6 me-2" />
            {t('onboarding.celebration.goToDashboard')}
          </Button>
          <p className="text-sm text-slate-500">
            {t('onboarding.celebration.returnToSettings')}
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
    </div>
  )
}
