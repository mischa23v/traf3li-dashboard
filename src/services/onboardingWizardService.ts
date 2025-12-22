import api from './api'

// ==================== TYPES ====================

export interface WizardCompanyInfo {
  companyName: string
  companyNameAr: string
  companyLogo?: File | null
  industry: string
  industryAr?: string
  size?: string
  country?: string
  city?: string
  address?: string
}

export interface WizardUserProfile {
  fullName: string
  fullNameAr?: string
  phone?: string
  role: string
  roleAr?: string
  avatar?: File | null
}

export interface WizardModuleSelection {
  hr: boolean
  finance: boolean
  crm: boolean
  cases: boolean
}

export interface WizardData {
  companyInfo: WizardCompanyInfo
  userProfile: WizardUserProfile
  modules: WizardModuleSelection
  completed: boolean
  currentStep: number
}

export interface OnboardingWizardStatus {
  completed: boolean
  completedAt?: string
  currentStep?: number
  wizardData?: Partial<WizardData>
}

// ==================== SERVICE ====================

const onboardingWizardService = {
  // ==================== CHECK STATUS ====================

  /**
   * Check if the current user has completed the onboarding wizard
   */
  checkOnboardingStatus: async (): Promise<OnboardingWizardStatus> => {
    const response = await api.get('/auth/onboarding-status')
    return response.data
  },

  // ==================== SAVE PROGRESS ====================

  /**
   * Save wizard progress to the database
   */
  saveWizardProgress: async (data: Partial<WizardData>): Promise<OnboardingWizardStatus> => {
    const response = await api.post('/auth/onboarding-progress', data)
    return response.data
  },

  // ==================== COMPANY INFO ====================

  /**
   * Save company information
   */
  saveCompanyInfo: async (companyInfo: WizardCompanyInfo): Promise<any> => {
    const response = await api.post('/auth/onboarding/company-info', companyInfo)
    return response.data
  },

  /**
   * Upload company logo
   */
  uploadCompanyLogo: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await api.post('/auth/onboarding/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.logoUrl
  },

  // ==================== USER PROFILE ====================

  /**
   * Save user profile information
   */
  saveUserProfile: async (userProfile: WizardUserProfile): Promise<any> => {
    const response = await api.post('/auth/onboarding/user-profile', userProfile)
    return response.data
  },

  /**
   * Upload user avatar
   */
  uploadUserAvatar: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.post('/auth/onboarding/user-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.avatarUrl
  },

  // ==================== MODULE SELECTION ====================

  /**
   * Save module selection
   */
  saveModuleSelection: async (modules: WizardModuleSelection): Promise<any> => {
    const response = await api.post('/auth/onboarding/modules', modules)
    return response.data
  },

  // ==================== COMPLETE WIZARD ====================

  /**
   * Complete the onboarding wizard
   */
  completeWizard: async (wizardData: WizardData): Promise<OnboardingWizardStatus> => {
    const response = await api.post('/auth/onboarding/complete', wizardData)
    return response.data
  },

  // ==================== SKIP WIZARD ====================

  /**
   * Skip the onboarding wizard (mark as completed with minimal data)
   */
  skipWizard: async (): Promise<OnboardingWizardStatus> => {
    const response = await api.post('/auth/onboarding/skip')
    return response.data
  },
}

export default onboardingWizardService
