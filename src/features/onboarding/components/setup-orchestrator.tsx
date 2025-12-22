import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Sparkles, ArrowLeft, SkipForward, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SetupProgressSidebar } from './setup-progress-sidebar'
import {
  useSetupOrchestrationStatus,
  useNextIncompleteModule,
  useMarkModuleComplete,
  useMarkModuleSkipped,
} from '@/hooks/useSetupOrchestration'
import { MODULE_CONFIGS, type ModuleSetupStatus } from '@/services/setupOrchestrationService'

// Import individual wizards
import HRSetupWizard from '@/features/hr/components/hr-setup-wizard'
import CRMSetupWizard from '@/features/crm/components/crm-setup-wizard'
import { FinanceSetupWizard } from '@/features/finance/components/finance-setup-wizard'

interface SetupOrchestratorProps {
  initialModule?: ModuleSetupStatus['module']
}

export default function SetupOrchestrator({ initialModule }: SetupOrchestratorProps) {
  const navigate = useNavigate()
  const [currentModule, setCurrentModule] = useState<ModuleSetupStatus['module'] | null>(initialModule || null)
  const [showCelebration, setShowCelebration] = useState(false)

  const { data: status, isLoading } = useSetupOrchestrationStatus()
  const { data: nextModule } = useNextIncompleteModule()
  const markCompleteM = useMarkModuleComplete()
  const markSkippedMutation = useMarkModuleSkipped()

  // Set current module to next incomplete on mount
  useEffect(() => {
    if (!currentModule && nextModule) {
      setCurrentModule(nextModule.module)
    }
  }, [nextModule, currentModule])

  // Check if all modules are complete
  useEffect(() => {
    if (status && !status.hasAnySetupPending) {
      setShowCelebration(true)
    }
  }, [status])

  const handleModuleComplete = async (module: ModuleSetupStatus['module']) => {
    try {
      await markCompleteM.mutateAsync(module)

      // Move to next module or show celebration
      const nextIncomplete = status?.modules
        .filter(m => !m.isComplete && !m.isSkipped && m.module !== module)
        .sort((a, b) => a.order - b.order)[0]

      if (nextIncomplete) {
        setCurrentModule(nextIncomplete.module)
      } else {
        setShowCelebration(true)
      }
    } catch (error) {
      console.error('Failed to mark module as complete:', error)
    }
  }

  const handleSkipModule = async (module: ModuleSetupStatus['module']) => {
    try {
      await markSkippedMutation.mutateAsync(module)

      // Move to next module or show celebration
      const nextIncomplete = status?.modules
        .filter(m => !m.isComplete && !m.isSkipped && m.module !== module)
        .sort((a, b) => a.order - b.order)[0]

      if (nextIncomplete) {
        setCurrentModule(nextIncomplete.module)
      } else {
        setShowCelebration(true)
      }
    } catch (error) {
      console.error('Failed to skip module:', error)
    }
  }

  const handleModuleClick = (module: ModuleSetupStatus['module']) => {
    setCurrentModule(module)
  }

  const handleExitOrchestrator = () => {
    navigate({ to: '/dashboard' as any })
  }

  const renderModuleWizard = () => {
    if (!currentModule) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-navy mb-2">اختر وحدة للبدء</h2>
            <p className="text-slate-600">
              اختر وحدة من القائمة الجانبية لبدء الإعداد
            </p>
          </div>
        </div>
      )
    }

    const config = MODULE_CONFIGS[currentModule]

    // Render the appropriate wizard based on module
    switch (currentModule) {
      case 'hr':
        return (
          <div className="flex-1 overflow-y-auto">
            <HRSetupWizard />
          </div>
        )
      case 'crm':
        return (
          <div className="flex-1 overflow-y-auto">
            <CRMSetupWizard />
          </div>
        )
      case 'finance':
        return (
          <div className="flex-1 overflow-y-auto">
            <FinanceSetupWizard />
          </div>
        )
      case 'inventory':
      case 'projects':
        // These wizards don't exist yet
        return (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">قريباً</h2>
              <p className="text-slate-600 mb-6">
                معالج إعداد {config.name} قيد التطوير. يمكنك تخطي هذه الوحدة والعودة إليها لاحقاً.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleSkipModule(currentModule)}
                  className="rounded-xl"
                >
                  <SkipForward className="w-4 h-4 me-2" />
                  تخطي
                </Button>
                <Button
                  onClick={handleExitOrchestrator}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  العودة للوحة التحكم
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (showCelebration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center p-8 max-w-2xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            🎉 تهانينا!
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            لقد أكملت إعداد جميع الوحدات بنجاح!
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <h3 className="font-bold text-navy mb-4">ماذا بعد؟</h3>
            <ul className="space-y-3 text-right">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">ابدأ في إضافة البيانات والموظفين</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">قم بدعوة أعضاء فريقك</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">استكشف التقارير والتحليلات</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">خصص الإعدادات حسب احتياجاتك</span>
              </li>
            </ul>
          </div>
          <Button
            size="lg"
            onClick={handleExitOrchestrator}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg"
          >
            <Sparkles className="w-5 h-5 me-2" />
            الانتقال إلى لوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitOrchestrator}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 me-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-xl font-bold text-navy">معالج الإعداد الشامل</h1>
                <p className="text-sm text-slate-600">
                  أكمل إعداد جميع الوحدات من مكان واحد
                </p>
              </div>
            </div>
            {currentModule && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSkipModule(currentModule)}
                  className="rounded-xl"
                >
                  <SkipForward className="w-4 h-4 me-2" />
                  تخطي هذه الوحدة
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Wizard Content */}
        {renderModuleWizard()}
      </div>

      {/* Progress Sidebar */}
      <SetupProgressSidebar
        currentModule={currentModule}
        onModuleClick={handleModuleClick}
      />
    </div>
  )
}
