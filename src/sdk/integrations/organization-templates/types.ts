/**
 * Organization Templates Types
 */

export type TemplateType =
  | 'startup'
  | 'enterprise'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'government'
  | 'retail'
  | 'saas'
  | 'custom';

export interface AuthMethodConfig {
  enabled: boolean;
  required?: boolean;
  priority?: number;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength?: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays?: number;
  lockoutThreshold: number;
  lockoutDuration: number; // in minutes
}

export interface MFAPolicy {
  enabled: boolean;
  required: boolean;
  methods: ('totp' | 'sms' | 'email' | 'webauthn')[];
  gracePeriodDays?: number;
  rememberDevice?: boolean;
  rememberDeviceDays?: number;
}

export interface SessionPolicy {
  maxConcurrentSessions: number;
  sessionTimeout: number; // in minutes
  idleTimeout: number; // in minutes
  extendOnActivity: boolean;
  singleSessionPerDevice: boolean;
  requireReauthForSensitive: boolean;
}

export interface SSOPolicy {
  enabled: boolean;
  required: boolean;
  providers: ('google' | 'microsoft' | 'okta' | 'saml' | 'oidc')[];
  autoProvision: boolean;
  jitProvisioning: boolean;
  defaultRole?: string;
}

export interface SecurityPolicy {
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  geoRestrictions?: {
    allowedCountries?: string[];
    blockedCountries?: string[];
  };
  auditLogging: boolean;
  sensitiveDataMasking: boolean;
}

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  backgroundImage?: string;
  customCss?: string;
  darkMode?: boolean;
}

export interface ComplianceConfig {
  gdprEnabled: boolean;
  ccpaEnabled: boolean;
  hipaaEnabled: boolean;
  soc2Enabled: boolean;
  pdplEnabled: boolean; // Saudi PDPL
  dataRetentionDays: number;
  rightToBeDeleted: boolean;
  dataPortability: boolean;
  consentTracking: boolean;
}

export interface NotificationConfig {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
  loginAlerts: boolean;
  sessionAlerts: boolean;
}

export interface OrganizationTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  icon?: string;

  // Authentication methods
  authMethods: {
    password: AuthMethodConfig;
    magicLink: AuthMethodConfig;
    otp: AuthMethodConfig;
    social: AuthMethodConfig;
    sso: AuthMethodConfig;
    passkey: AuthMethodConfig;
  };

  // Policies
  passwordPolicy: PasswordPolicy;
  mfaPolicy: MFAPolicy;
  sessionPolicy: SessionPolicy;
  ssoPolicy: SSOPolicy;
  securityPolicy: SecurityPolicy;

  // Configuration
  branding?: BrandingConfig;
  compliance: ComplianceConfig;
  notifications: NotificationConfig;

  // Custom settings
  customSettings?: Record<string, unknown>;
}

export interface TemplateApplication {
  organizationId: string;
  templateId: string;
  appliedAt: Date;
  appliedBy: string;
  overrides?: Partial<OrganizationTemplate>;
}
