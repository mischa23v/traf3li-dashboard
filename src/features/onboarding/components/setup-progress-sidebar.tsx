import { Check, ChevronRight, Clock, CheckCircle2, XCircle, Package, Briefcase } from 'lucide-react'
import { Users, TrendingUp, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSetupOrchestrationStatus, useNavigateToModuleSetup } from '@/hooks/useSetupOrchestration'
import { MODULE_CONFIGS, type ModuleSetupStatus } from '@/services/setupOrchestrationService'
import { useTranslation } from 'react-i18next'

const MODULE_ICONS = {
  Users,
  TrendingUp,
  Calculator,
  Package,
  Briefcase,
}

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  indigo: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
}

interface SetupProgressSidebarProps {
  currentModule?: ModuleSetupStatus['module'] | null
  onModuleClick?: (module: ModuleSetupStatus['module']) => void
}

export function SetupProgressSidebar({ currentModule, onModuleClick }: SetupProgressSidebarProps) {
  const { data: status } = useSetupOrchestrationStatus()
  const { goToModule } = useNavigateToModuleSetup()
  const { t } = useTranslation()

  if (!status) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleModuleClick = (module: ModuleSetupStatus) => {
    if (module.isComplete || module.isSkipped) return

    if (onModuleClick) {
      onModuleClick(module.module)
    } else {
      goToModule(module.module)
    }
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-navy mb-2">{t('onboarding.progressSidebar.title')}</h2>
        <p className="text-sm text-slate-600 mb-4">
          {t('onboarding.progressSidebar.modulesCompleted', { completed: status.completedModules, total: status.totalModules })}
        </p>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{t('onboarding.progressSidebar.overallProgress')}</span>
            <span className="font-medium text-emerald-600">
              {Math.round(status.overallProgress)}%
            </span>
          </div>
          <Progress
            value={status.overallProgress}
            className="h-2"
            indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-500"
          />
        </div>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {status.modules
          .sort((a, b) => a.order - b.order)
          .map((module, index) => {
            const config = MODULE_CONFIGS[module.module]
            const IconComponent = MODULE_ICONS[config.icon as keyof typeof MODULE_ICONS]
            const colorClass = COLOR_CLASSES[config.color as keyof typeof COLOR_CLASSES]
            const isActive = currentModule === module.module
            const isCurrent = !module.isComplete && !module.isSkipped && index === status.modules.findIndex(m => !m.isComplete && !m.isSkipped)

            return (
              <button
                key={module.module}
                onClick={() => handleModuleClick(module)}
                disabled={module.isComplete || module.isSkipped}
                className={cn(
                  'w-full text-right rounded-xl p-4 transition-all border-2',
                  isActive && 'border-emerald-500 bg-emerald-50',
                  !isActive && module.isComplete && 'border-green-200 bg-green-50',
                  !isActive && module.isSkipped && 'border-slate-200 bg-slate-50 opacity-60',
                  !isActive && !module.isComplete && !module.isSkipped && 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  (module.isComplete || module.isSkipped) && 'cursor-default'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      module.isComplete && 'bg-green-500',
                      module.isSkipped && 'bg-slate-300',
                      !module.isComplete && !module.isSkipped && colorClass.bg
                    )}
                  >
                    {module.isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : module.isSkipped ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : (
                      <IconComponent className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-navy text-sm">{config.name}</h3>
                      {config.isCritical && !module.isComplete && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {t('onboarding.progressSidebar.required')}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          {t('onboarding.progressSidebar.current')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{config.description}</p>

                    {/* Progress */}
                    {module.currentStep && module.totalSteps && !module.isComplete && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {t('onboarding.progressSidebar.stepOf', { current: module.currentStep, total: module.totalSteps })}
                          </span>
                          <span className="text-slate-600 font-medium">
                            {Math.round((module.currentStep / module.totalSteps) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(module.currentStep / module.totalSteps) * 100}
                          className="h-1"
                          indicatorClassName={colorClass.bg}
                        />
                      </div>
                    )}

                    {/* Status */}
                    {module.isComplete && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Check className="w-3 h-3" />
                        <span>{t('onboarding.progressSidebar.completed')}</span>
                      </div>
                    )}
                    {module.isSkipped && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <XCircle className="w-3 h-3" />
                        <span>{t('onboarding.progressSidebar.skipped')}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {!module.isComplete && !module.isSkipped && (
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>{t('onboarding.progressSidebar.completed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>{t('onboarding.progressSidebar.inProgress')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <span>{t('onboarding.progressSidebar.skipped')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
