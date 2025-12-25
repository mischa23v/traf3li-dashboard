/**
 * @traf3li/auth-react
 * React SDK for Traf3li Authentication
 */

// Context & Provider
export { TrafAuthProvider, useTrafAuthContext } from './provider';

// Core Hooks
export { useAuth } from './hooks/useAuth';
export { useUser } from './hooks/useUser';
export { useMFA } from './hooks/useMFA';
export { useSessions } from './hooks/useSessions';
export { usePasswordless } from './hooks/usePasswordless';
export { useOAuth } from './hooks/useOAuth';
export { usePassword } from './hooks/usePassword';

// Advanced Authentication Hooks
export { useWebAuthn } from './hooks/useWebAuthn';
export type {
  WebAuthnCredential,
  WebAuthnRegistrationOptions,
  UseWebAuthnReturn,
} from './hooks/useWebAuthn';

export { useBackupCodes } from './hooks/useBackupCodes';
export type { BackupCodesStatus, UseBackupCodesReturn } from './hooks/useBackupCodes';

export { useAccountLinking } from './hooks/useAccountLinking';
export type { LinkedAccount, UseAccountLinkingReturn } from './hooks/useAccountLinking';

export { useAnonymousSession } from './hooks/useAnonymousSession';
export type {
  AnonymousSession,
  ConvertToAccountData,
  UseAnonymousSessionReturn,
} from './hooks/useAnonymousSession';

// Security & Audit Hooks
export { useSecurityLogs } from './hooks/useSecurityLogs';
export type {
  LoginHistoryEntry,
  SecurityEvent,
  SecurityStats,
  UseSecurityLogsReturn,
} from './hooks/useSecurityLogs';

export { useApiKeys } from './hooks/useApiKeys';
export type {
  ApiKey,
  CreateApiKeyData,
  CreateApiKeyResult,
  UseApiKeysReturn,
} from './hooks/useApiKeys';

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
