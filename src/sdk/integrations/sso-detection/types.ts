/**
 * Domain-Based SSO Detection Types
 */

export type SSOProviderType =
  | 'saml'
  | 'oidc'
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'auth0'
  | 'azure-ad'
  | 'onelogin'
  | 'ping'
  | 'custom';

export interface SSOProvider {
  /** Provider ID */
  id: string;
  /** Provider type */
  type: SSOProviderType;
  /** Display name */
  name: string;
  /** Provider icon URL */
  iconUrl?: string;
  /** SSO entry point URL */
  entryPoint?: string;
  /** Entity ID for SAML */
  entityId?: string;
  /** Client ID for OIDC */
  clientId?: string;
  /** Discovery URL for OIDC */
  discoveryUrl?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface SSODomainMapping {
  /** Domain pattern (e.g., "example.com", "*.example.com") */
  domain: string;
  /** Organization/tenant ID */
  organizationId: string;
  /** Organization name */
  organizationName?: string;
  /** SSO provider configuration */
  provider: SSOProvider;
  /** Whether SSO is required (no password login) */
  ssoRequired: boolean;
  /** Auto-redirect to SSO */
  autoRedirect: boolean;
  /** Custom login message */
  loginMessage?: string;
}

export interface SSODetectionConfig {
  /** API URL for domain lookup */
  apiUrl: string;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Default SSO provider if domain not found */
  defaultProvider?: SSOProvider;
  /** Domains to exclude from SSO detection */
  excludeDomains?: string[];
  /** Custom fetch function */
  fetch?: typeof fetch;
}

export interface SSODetectionResult {
  /** Whether SSO is available for the domain */
  hasSso: boolean;
  /** Domain mapping if found */
  mapping?: SSODomainMapping;
  /** Error if detection failed */
  error?: string;
  /** Whether password login is allowed */
  allowPassword: boolean;
  /** Redirect URL for SSO */
  redirectUrl?: string;
}

export interface SSOLoginOptions {
  /** Email address for domain detection */
  email: string;
  /** Redirect URL after SSO login */
  redirectUrl?: string;
  /** State parameter for OAuth */
  state?: string;
  /** Additional parameters */
  params?: Record<string, string>;
}

export interface SSOSession {
  /** Session ID */
  id: string;
  /** Provider ID */
  providerId: string;
  /** Provider type */
  providerType: SSOProviderType;
  /** Organization ID */
  organizationId: string;
  /** User ID */
  userId: string;
  /** User email */
  email: string;
  /** Session created at */
  createdAt: Date;
  /** Session expires at */
  expiresAt?: Date;
  /** SAML assertion (for SAML providers) */
  assertion?: string;
  /** ID token (for OIDC providers) */
  idToken?: string;
  /** Access token */
  accessToken?: string;
  /** Refresh token */
  refreshToken?: string;
}
