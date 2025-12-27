import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import setupOrchestrationService, {
  type SetupOrchestrationStatus,
  type ModuleSetupStatus,
  type SetupProgress,
  MODULE_CONFIGS,
} from '@/services/setupOrchestrationService'

// Query keys
export const setupOrchestrationKeys = {
  all: ['setup-orchestration'] as const,
  status: () => [...setupOrchestrationKeys.all, 'status'] as const,
  module: (module: string) => [...setupOrchestrationKeys.all, 'module', module] as const,
  progress: (module: string) => [...setupOrchestrationKeys.all, 'progress', module] as const,
  nextIncomplete: () => [...setupOrchestrationKeys.all, 'next-incomplete'] as const,
}

/**
 * Hook to get overall setup orchestration status
 */
export function useSetupOrchestrationStatus() {
  return useQuery({
    queryKey: setupOrchestrationKeys.status(),
    queryFn: () => setupOrchestrationService.getSetupStatus(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: 2,
  })
}

/**
 * Hook to get module progress
 */
export function useModuleProgress(module: ModuleSetupStatus['module']) {
  return useQuery({
    queryKey: setupOrchestrationKeys.progress(module),
    queryFn: () => setupOrchestrationService.getModuleProgress(module),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

/**
 * Hook to get next incomplete module
 */
export function useNextIncompleteModule() {
  return useQuery({
    queryKey: setupOrchestrationKeys.nextIncomplete(),
    queryFn: () => setupOrchestrationService.getNextIncompleteModule(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to mark module as complete
 */
export function useMarkModuleComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (module: ModuleSetupStatus['module']) =>
      setupOrchestrationService.markModuleComplete(module),
    onSuccess: (_, module) => {
      // Invalidate and refetch setup status
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.status() })
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.nextIncomplete() })

      const config = MODULE_CONFIGS[module]
      toast.success('تم إكمال الإعداد بنجاح!', {
        description: `تم إكمال إعداد ${config.name}`,
      })
    },
    onError: (error, module) => {
      const config = MODULE_CONFIGS[module]
      toast.error('فشل حفظ الإعداد', {
        description: `حدث خطأ أثناء حفظ إعداد ${config.name}`,
      })
      console.error('Failed to mark module as complete:', error)
    },
  })
}

/**
 * Hook to mark module as skipped
 */
export function useMarkModuleSkipped() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (module: ModuleSetupStatus['module']) =>
      setupOrchestrationService.markModuleSkipped(module),
    onSuccess: (_, module) => {
      // Invalidate and refetch setup status
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.status() })
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.nextIncomplete() })

      const config = MODULE_CONFIGS[module]
      toast.info('تم تخطي الإعداد', {
        description: `يمكنك إعداد ${config.name} لاحقاً من الإعدادات`,
      })
    },
    onError: (error, module) => {
      const config = MODULE_CONFIGS[module]
      toast.error('فشل تخطي الإعداد', {
        description: `حدث خطأ أثناء تخطي إعداد ${config.name}`,
      })
      console.error('Failed to mark module as skipped:', error)
    },
  })
}

/**
 * Hook to save module progress
 */
export function useSaveModuleProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (progress: SetupProgress) =>
      setupOrchestrationService.saveModuleProgress(progress),
    onSuccess: (_, progress) => {
      // Invalidate and refetch progress
      queryClient.invalidateQueries({
        queryKey: setupOrchestrationKeys.progress(progress.module),
      })
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.status() })
    },
    onError: (error, progress) => {
      console.error('Failed to save module progress:', error)
    },
  })
}

/**
 * Hook to check if any setup is pending
 */
export function useHasSetupPending() {
  const { data: status } = useSetupOrchestrationStatus()
  return {
    hasAnyPending: status?.hasAnySetupPending ?? false,
    hasCriticalPending: status?.hasCriticalSetupPending ?? false,
    isLoading: !status,
  }
}

/**
 * Hook to get current setup step (for orchestrator)
 */
export function useCurrentSetupStep() {
  const { data: nextModule } = useNextIncompleteModule()
  const { data: status } = useSetupOrchestrationStatus()

  return {
    currentModule: nextModule,
    allModules: status?.modules ?? [],
    overallProgress: status?.overallProgress ?? 0,
    isLoading: !status || !nextModule,
  }
}

/**
 * Hook to navigate between module setups
 */
export function useNavigateToModuleSetup() {
  const navigate = useNavigate()

  return {
    goToModule: (module: ModuleSetupStatus['module']) => {
      const config = MODULE_CONFIGS[module]
      navigate({ to: config.route as any })
    },
    goToOrchestrator: () => {
      navigate({ to: '/dashboard/setup-orchestrator' as any })
    },
  }
}

/**
 * Hook to check if user should see setup reminder
 */
export function useShouldShowSetupReminder() {
  return useQuery({
    queryKey: [...setupOrchestrationKeys.all, 'should-show-reminder'],
    queryFn: () => setupOrchestrationService.shouldShowSetupReminder(),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
  })
}

/**
 * Hook to reset all setup progress (admin only)
 */
export function useResetSetupProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => setupOrchestrationService.resetAllProgress(),
    onSuccess: () => {
      // Invalidate all setup queries
      queryClient.invalidateQueries({ queryKey: setupOrchestrationKeys.all })

      toast.success('تم إعادة تعيين التقدم', {
        description: 'تم إعادة تعيين جميع تقدم الإعداد بنجاح',
      })
    },
    onError: (error) => {
      toast.error('فشلت إعادة التعيين', {
        description: 'حدث خطأ أثناء إعادة تعيين التقدم',
      })
      console.error('Failed to reset setup progress:', error)
    },
  })
}
