/**
 * Authentication Services Index
 * Exports all authentication-related services
 */

// Main auth service
export { default as authService } from '../authService'
export type { User, LoginCredentials, RegisterData } from '../authService'

// OAuth/Social login
export { default as oauthService, OAUTH_PROVIDERS } from '../oauthService'
export type { OAuthProvider, OAuthProviderConfig } from '../oauthService'

// MFA (Multi-Factor Authentication)
export { default as mfaService } from '../mfaService'
export type { MFAMethod, MFAStatus, TOTPSetupResponse } from '../mfaService'

// Session management
export { default as sessionService } from '../sessionService'
export type { Session, SessionStats, SessionLocation, SessionDevice } from '../sessionService'

// Step-up authentication (reauthentication)
export { default as stepUpAuthService } from '../stepUpAuthService'
export type { ReauthMethod, ReauthStatus, ReauthChallenge } from '../stepUpAuthService'

// Anonymous/Guest authentication
export { default as anonymousAuthService } from '../anonymousAuthService'
export type { AnonymousUser, ConvertAccountData } from '../anonymousAuthService'

// Password management
export { default as passwordService } from '../passwordService'
export type { PasswordStrength, PasswordStrengthLevel, PasswordStatus } from '../passwordService'

// Phone/SMS OTP authentication
export { default as phoneAuthService, formatPhoneNumber } from '../phoneAuthService'
export type { OTPPurpose, PhoneOTPResponse, OTPStatusResponse } from '../phoneAuthService'
