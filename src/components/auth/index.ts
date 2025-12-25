/**
 * Auth Components
 * Authentication and authorization related components
 */

// Access control
export { PageAccessGuard, withPageAccess } from './PageAccessGuard'

// SSO/OAuth
export { LDAPLoginButton } from './ldap-login-button'
export { SSOLoginButtons } from './sso-login-buttons'
export { SocialLoginButtons } from './social-login-buttons'

// Reauthentication
export { ReauthModal } from './reauth-modal'

// Guest/Anonymous
export { GuestBanner } from './guest-banner'

// Password
export { PasswordStrengthIndicator } from './password-strength-indicator'

// CAPTCHA
export {
  CaptchaChallenge,
  InvisibleCaptcha,
  CheckboxCaptcha,
} from './captcha-challenge'
export type {
  CaptchaChallengeProps,
  CaptchaChallengeRef,
} from './captcha-challenge'
