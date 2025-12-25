/**
 * Authentication Hooks Index
 * Exports all authentication-related hooks
 */

// OAuth hooks
export {
  useOAuthLogin,
  useOAuthCallback,
  useAvailableProviders,
  useLinkedProviders,
  useLinkProvider,
  useUnlinkProvider,
} from '../useOAuth'

// Step-up authentication hooks
export {
  useReauthStatus,
  useReauthMethods,
  useReauthWithPassword,
  useReauthWithTOTP,
  useRequestReauthChallenge,
  useVerifyReauthChallenge,
  useStepUpAuth,
} from '../useStepUpAuth'

// Anonymous/Guest authentication hooks
export {
  useLoginAsGuest,
  useConvertAccount,
  useExtendAnonymousSession,
  useDeleteAnonymousSession,
  useAnonymousStatus,
} from '../useAnonymousAuth'

// Password management hooks
export {
  usePasswordStatus,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useValidateResetToken,
  useCheckPasswordBreach,
  usePasswordStrength,
  usePasswordField,
} from '../usePassword'

// Phone/SMS OTP hooks
export {
  useSendPhoneOTP,
  useVerifyPhoneOTP,
  useResendPhoneOTP,
  useCheckPhoneOTPStatus,
  useVerifyPhone,
  useCheckPhoneAvailability,
  usePhoneOTPLogin,
} from '../usePhoneAuth'
