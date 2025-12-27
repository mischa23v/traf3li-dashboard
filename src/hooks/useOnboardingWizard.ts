import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import onboardingWizardService, {
  type WizardData,
  type WizardCompanyInfo,
  type WizardUserProfile,
  type WizardModuleSelection,
  type OnboardingWizardStatus,
} from '@/services/onboardingWizardService'

// ==================== Cache Configuration ====================
const STATUS_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes
const STATUS_GC_TIME = 2 * CACHE_TIMES.MEDIUM // 10 minutes

// Query Keys
export const onboardingWizardKeys = {
  all: ['onboarding-wizard'] as const,
  status: () => [...onboardingWizardKeys.all, 'status'] as const,
}

// ==================== CHECK STATUS ====================

/**
 * Check if the current user has completed the onboarding wizard
 */
export const useOnboardingWizardStatus = () => {
  return useQuery({
    queryKey: onboardingWizardKeys.status(),
    queryFn: () => onboardingWizardService.checkOnboardingStatus(),
    staleTime: STATUS_STALE_TIME,
    gcTime: STATUS_GC_TIME,
    retry: 1, // Only retry once on failure
  })
}

// ==================== SAVE PROGRESS ====================

/**
 * Save wizard progress to the database
 */
export const useSaveWizardProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<WizardData>) => onboardingWizardService.saveWizardProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      console.error('Failed to save wizard progress:', error)
      // Silent failure - we don't want to interrupt the user experience
    },
  })
}

// ==================== COMPANY INFO ====================

/**
 * Save company information
 */
export const useSaveCompanyInfo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (companyInfo: WizardCompanyInfo) => onboardingWizardService.saveCompanyInfo(companyInfo),
    onSuccess: () => {
      toast.success('تم حفظ معلومات الشركة بنجاح', {
        description: 'Company information saved successfully'
      })
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      toast.error('فشل في حفظ معلومات الشركة', {
        description: error.message || 'Failed to save company information'
      })
    },
  })
}

/**
 * Upload company logo
 */
export const useUploadCompanyLogo = () => {
  return useMutation({
    mutationFn: (file: File) => onboardingWizardService.uploadCompanyLogo(file),
    onSuccess: () => {
      toast.success('تم رفع شعار الشركة بنجاح', {
        description: 'Company logo uploaded successfully'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل في رفع شعار الشركة', {
        description: error.message || 'Failed to upload company logo'
      })
    },
  })
}

// ==================== USER PROFILE ====================

/**
 * Save user profile information
 */
export const useSaveUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userProfile: WizardUserProfile) => onboardingWizardService.saveUserProfile(userProfile),
    onSuccess: () => {
      toast.success('تم حفظ الملف الشخصي بنجاح', {
        description: 'User profile saved successfully'
      })
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      toast.error('فشل في حفظ الملف الشخصي', {
        description: error.message || 'Failed to save user profile'
      })
    },
  })
}

/**
 * Upload user avatar
 */
export const useUploadUserAvatar = () => {
  return useMutation({
    mutationFn: (file: File) => onboardingWizardService.uploadUserAvatar(file),
    onSuccess: () => {
      toast.success('تم رفع الصورة الشخصية بنجاح', {
        description: 'User avatar uploaded successfully'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل في رفع الصورة الشخصية', {
        description: error.message || 'Failed to upload user avatar'
      })
    },
  })
}

// ==================== MODULE SELECTION ====================

/**
 * Save module selection
 */
export const useSaveModuleSelection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (modules: WizardModuleSelection) => onboardingWizardService.saveModuleSelection(modules),
    onSuccess: () => {
      toast.success('تم حفظ اختيار الوحدات بنجاح', {
        description: 'Module selection saved successfully'
      })
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      toast.error('فشل في حفظ اختيار الوحدات', {
        description: error.message || 'Failed to save module selection'
      })
    },
  })
}

// ==================== COMPLETE WIZARD ====================

/**
 * Complete the onboarding wizard
 */
export const useCompleteWizard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (wizardData: WizardData) => onboardingWizardService.completeWizard(wizardData),
    onSuccess: () => {
      toast.success('مرحباً بك في النظام!', {
        description: 'Welcome! Your account is ready to use.'
      })
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      toast.error('فشل في إكمال الإعداد', {
        description: error.message || 'Failed to complete onboarding'
      })
    },
  })
}

// ==================== SKIP WIZARD ====================

/**
 * Skip the onboarding wizard (mark as completed with minimal data)
 */
export const useSkipWizard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => onboardingWizardService.skipWizard(),
    onSuccess: () => {
      toast.info('تم تخطي معالج الإعداد', {
        description: 'You can complete your profile later from settings'
      })
      queryClient.invalidateQueries({ queryKey: onboardingWizardKeys.status() })
    },
    onError: (error: Error) => {
      toast.error('فشل في تخطي معالج الإعداد', {
        description: error.message || 'Failed to skip wizard'
      })
    },
  })
}
