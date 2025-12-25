/**
 * @traf3li/auth-react
 * React SDK for Traf3li Authentication
 */

// Context & Provider
export { TrafAuthProvider, useTrafAuthContext } from './provider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useUser } from './hooks/useUser';
export { useMFA } from './hooks/useMFA';
export { useSessions } from './hooks/useSessions';
export { usePasswordless } from './hooks/usePasswordless';
export { useOAuth } from './hooks/useOAuth';
export { usePassword } from './hooks/usePassword';

// Guards
export { AuthGuard } from './components/AuthGuard';
export { withAuth } from './hoc/withAuth';

// Re-export types from core
export type {
  User,
  UserRole,
  FirmRole,
  Plan,
  MfaMethod,
  Session,
  AuthResult,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  MfaSetupResult,
  MfaVerifyResult,
  MfaChallengeData,
  SSODetectionResult,
  OAuthProvider,
  OtpPurpose,
  SendOtpData,
  VerifyOtpData,
  MagicLinkData,
  PasswordStrength,
  TrafAuthConfig,
  TrafAuthError,
} from '@traf3li/auth-core';
