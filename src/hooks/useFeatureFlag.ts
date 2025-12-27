/**
 * useFeatureFlag Hook
 *
 * React hook for checking feature availability based on backend implementation status.
 * Use this to conditionally render UI elements for features that may not be available.
 *
 * @example
 * ```tsx
 * import { useFeatureFlag } from '@/hooks/useFeatureFlag'
 *
 * function SettingsPage() {
 *   const { isEnabled: mfaEnabled, status: mfaStatus } = useFeatureFlag('MFA')
 *
 *   return (
 *     <div>
 *       {mfaEnabled ? (
 *         <MFASettings />
 *       ) : (
 *         <ComingSoonBadge status={mfaStatus} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */

import { useMemo } from 'react'
import {
  isFeatureEnabled,
  getFeatureDetails,
  type FeatureName,
  type FeatureFlag,
  type FeatureStatusType,
} from '@/config/feature-flags'

export interface UseFeatureFlagResult {
  /** Whether the feature is enabled */
  isEnabled: boolean
  /** The feature's implementation status */
  status: FeatureStatusType
  /** Feature description in English */
  description: string
  /** Feature description in Arabic */
  descriptionAr: string
  /** Full feature details */
  details: FeatureFlag | undefined
}

/**
 * Hook to check if a feature is enabled
 *
 * @param featureName - The feature to check
 * @returns Feature flag information
 */
export function useFeatureFlag(featureName: FeatureName): UseFeatureFlagResult {
  return useMemo(() => {
    const details = getFeatureDetails(featureName)

    return {
      isEnabled: isFeatureEnabled(featureName),
      status: details?.status ?? 'not_implemented',
      description: details?.description ?? 'Unknown feature',
      descriptionAr: details?.descriptionAr ?? 'ميزة غير معروفة',
      details,
    }
  }, [featureName])
}

/**
 * Hook to check multiple features at once
 *
 * @param featureNames - Array of features to check
 * @returns Object with feature names as keys and boolean enabled status as values
 *
 * @example
 * ```tsx
 * const features = useFeatureFlags(['MFA', 'SSO', 'OTP'])
 * // { MFA: false, SSO: false, OTP: false }
 * ```
 */
export function useFeatureFlags<T extends FeatureName>(
  featureNames: T[]
): Record<T, boolean> {
  return useMemo(() => {
    return featureNames.reduce(
      (acc, name) => {
        acc[name] = isFeatureEnabled(name)
        return acc
      },
      {} as Record<T, boolean>
    )
  }, [featureNames])
}

/**
 * Hook specifically for auth features
 *
 * @returns Object with all auth feature flags
 */
export function useAuthFeatures() {
  return useMemo(
    () => ({
      basicAuth: isFeatureEnabled('BASIC_AUTH'),
      otp: isFeatureEnabled('OTP'),
      passwordReset: isFeatureEnabled('PASSWORD_RESET'),
      mfa: isFeatureEnabled('MFA'),
      sso: isFeatureEnabled('SSO'),
      magicLink: isFeatureEnabled('MAGIC_LINK'),
      sessions: isFeatureEnabled('SESSIONS'),
      refreshToken: isFeatureEnabled('REFRESH_TOKEN'),
    }),
    []
  )
}

/**
 * Hook specifically for settings features
 *
 * @returns Object with all settings feature flags
 */
export function useSettingsFeatures() {
  return useMemo(
    () => ({
      general: isFeatureEnabled('SETTINGS'),
      hr: isFeatureEnabled('HR_SETTINGS'),
      email: isFeatureEnabled('EMAIL_SETTINGS'),
      billing: isFeatureEnabled('BILLING_SETTINGS'),
      crm: isFeatureEnabled('CRM_SETTINGS'),
    }),
    []
  )
}

export default useFeatureFlag
