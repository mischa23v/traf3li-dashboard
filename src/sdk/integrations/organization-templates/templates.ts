/**
 * Pre-defined Organization Templates
 */

import type { OrganizationTemplate } from './types';

/**
 * Startup Template
 * Simple, developer-friendly setup with modern auth methods
 */
export const startupTemplate: OrganizationTemplate = {
  id: 'startup',
  name: 'Startup',
  description: 'Simple and fast authentication for startups and small teams',
  type: 'startup',
  icon: '🚀',

  authMethods: {
    password: { enabled: true, priority: 1 },
    magicLink: { enabled: true, priority: 2 },
    otp: { enabled: false },
    social: { enabled: true, priority: 3 },
    sso: { enabled: false },
    passkey: { enabled: true, priority: 4 },
  },

  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventReuse: 3,
    lockoutThreshold: 5,
    lockoutDuration: 15,
  },

  mfaPolicy: {
    enabled: true,
    required: false,
    methods: ['totp', 'email'],
    rememberDevice: true,
    rememberDeviceDays: 30,
  },

  sessionPolicy: {
    maxConcurrentSessions: 5,
    sessionTimeout: 10080, // 7 days
    idleTimeout: 1440, // 24 hours
    extendOnActivity: true,
    singleSessionPerDevice: false,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: false,
    required: false,
    providers: ['google'],
    autoProvision: true,
    jitProvisioning: true,
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    auditLogging: true,
    sensitiveDataMasking: true,
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: false,
    hipaaEnabled: false,
    soc2Enabled: false,
    pdplEnabled: false,
    dataRetentionDays: 365,
    rightToBeDeleted: true,
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    securityAlerts: true,
    loginAlerts: false,
    sessionAlerts: false,
  },
};

/**
 * Enterprise Template
 * Full security features for large organizations
 */
export const enterpriseTemplate: OrganizationTemplate = {
  id: 'enterprise',
  name: 'Enterprise',
  description: 'Comprehensive security for large organizations with SSO and compliance',
  type: 'enterprise',
  icon: '🏢',

  authMethods: {
    password: { enabled: true, priority: 2 },
    magicLink: { enabled: true, priority: 3 },
    otp: { enabled: true, priority: 4 },
    social: { enabled: false },
    sso: { enabled: true, required: true, priority: 1 },
    passkey: { enabled: true, priority: 5 },
  },

  passwordPolicy: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 12,
    expirationDays: 90,
    lockoutThreshold: 3,
    lockoutDuration: 30,
  },

  mfaPolicy: {
    enabled: true,
    required: true,
    methods: ['totp', 'webauthn'],
    gracePeriodDays: 0,
    rememberDevice: true,
    rememberDeviceDays: 7,
  },

  sessionPolicy: {
    maxConcurrentSessions: 3,
    sessionTimeout: 480, // 8 hours
    idleTimeout: 60, // 1 hour
    extendOnActivity: false,
    singleSessionPerDevice: true,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: true,
    required: true,
    providers: ['saml', 'oidc', 'okta', 'microsoft'],
    autoProvision: true,
    jitProvisioning: true,
    defaultRole: 'member',
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    auditLogging: true,
    sensitiveDataMasking: true,
    ipWhitelist: [],
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    hipaaEnabled: false,
    soc2Enabled: true,
    pdplEnabled: false,
    dataRetentionDays: 2555, // 7 years
    rightToBeDeleted: true,
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    loginAlerts: true,
    sessionAlerts: true,
  },
};

/**
 * Healthcare Template
 * HIPAA-compliant authentication
 */
export const healthcareTemplate: OrganizationTemplate = {
  id: 'healthcare',
  name: 'Healthcare',
  description: 'HIPAA-compliant authentication for healthcare organizations',
  type: 'healthcare',
  icon: '🏥',

  authMethods: {
    password: { enabled: true, priority: 1 },
    magicLink: { enabled: false },
    otp: { enabled: true, priority: 3 },
    social: { enabled: false },
    sso: { enabled: true, priority: 2 },
    passkey: { enabled: true, priority: 4 },
  },

  passwordPolicy: {
    minLength: 14,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 24,
    expirationDays: 60,
    lockoutThreshold: 3,
    lockoutDuration: 60,
  },

  mfaPolicy: {
    enabled: true,
    required: true,
    methods: ['totp', 'webauthn'],
    gracePeriodDays: 0,
    rememberDevice: false,
  },

  sessionPolicy: {
    maxConcurrentSessions: 2,
    sessionTimeout: 240, // 4 hours
    idleTimeout: 15, // 15 minutes
    extendOnActivity: false,
    singleSessionPerDevice: true,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: true,
    required: false,
    providers: ['saml', 'oidc'],
    autoProvision: false,
    jitProvisioning: false,
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: true,
    auditLogging: true,
    sensitiveDataMasking: true,
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    hipaaEnabled: true,
    soc2Enabled: true,
    pdplEnabled: false,
    dataRetentionDays: 2555, // 7 years
    rightToBeDeleted: false, // Limited under HIPAA
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    loginAlerts: true,
    sessionAlerts: true,
  },
};

/**
 * Finance Template
 * High-security for financial institutions
 */
export const financeTemplate: OrganizationTemplate = {
  id: 'finance',
  name: 'Financial Services',
  description: 'High-security authentication for banks and financial institutions',
  type: 'finance',
  icon: '🏦',

  authMethods: {
    password: { enabled: true, priority: 2 },
    magicLink: { enabled: false },
    otp: { enabled: true, priority: 3 },
    social: { enabled: false },
    sso: { enabled: true, priority: 1 },
    passkey: { enabled: true, priority: 4 },
  },

  passwordPolicy: {
    minLength: 16,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 24,
    expirationDays: 45,
    lockoutThreshold: 3,
    lockoutDuration: 120,
  },

  mfaPolicy: {
    enabled: true,
    required: true,
    methods: ['totp', 'sms', 'webauthn'],
    gracePeriodDays: 0,
    rememberDevice: false,
  },

  sessionPolicy: {
    maxConcurrentSessions: 1,
    sessionTimeout: 120, // 2 hours
    idleTimeout: 10, // 10 minutes
    extendOnActivity: false,
    singleSessionPerDevice: true,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: true,
    required: true,
    providers: ['saml', 'oidc'],
    autoProvision: false,
    jitProvisioning: false,
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: true,
    auditLogging: true,
    sensitiveDataMasking: true,
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    hipaaEnabled: false,
    soc2Enabled: true,
    pdplEnabled: true,
    dataRetentionDays: 2555, // 7 years
    rightToBeDeleted: false, // Limited for financial records
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    loginAlerts: true,
    sessionAlerts: true,
  },
};

/**
 * Education Template
 * For schools and universities
 */
export const educationTemplate: OrganizationTemplate = {
  id: 'education',
  name: 'Education',
  description: 'Authentication for schools, universities, and educational institutions',
  type: 'education',
  icon: '🎓',

  authMethods: {
    password: { enabled: true, priority: 1 },
    magicLink: { enabled: true, priority: 3 },
    otp: { enabled: true, priority: 4 },
    social: { enabled: true, priority: 2 },
    sso: { enabled: true, priority: 5 },
    passkey: { enabled: false },
  },

  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventReuse: 6,
    expirationDays: 180,
    lockoutThreshold: 5,
    lockoutDuration: 15,
  },

  mfaPolicy: {
    enabled: true,
    required: false,
    methods: ['totp', 'email'],
    gracePeriodDays: 14,
    rememberDevice: true,
    rememberDeviceDays: 90,
  },

  sessionPolicy: {
    maxConcurrentSessions: 10,
    sessionTimeout: 10080, // 7 days
    idleTimeout: 1440, // 24 hours
    extendOnActivity: true,
    singleSessionPerDevice: false,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: true,
    required: false,
    providers: ['google', 'microsoft', 'saml'],
    autoProvision: true,
    jitProvisioning: true,
    defaultRole: 'student',
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    auditLogging: true,
    sensitiveDataMasking: true,
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: false,
    hipaaEnabled: false,
    soc2Enabled: false,
    pdplEnabled: false,
    dataRetentionDays: 2555, // 7 years
    rightToBeDeleted: true,
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    securityAlerts: true,
    loginAlerts: false,
    sessionAlerts: false,
  },
};

/**
 * SaaS Template
 * For B2B SaaS applications
 */
export const saasTemplate: OrganizationTemplate = {
  id: 'saas',
  name: 'SaaS',
  description: 'Multi-tenant authentication for B2B SaaS applications',
  type: 'saas',
  icon: '☁️',

  authMethods: {
    password: { enabled: true, priority: 1 },
    magicLink: { enabled: true, priority: 2 },
    otp: { enabled: true, priority: 4 },
    social: { enabled: true, priority: 3 },
    sso: { enabled: true, priority: 5 },
    passkey: { enabled: true, priority: 6 },
  },

  passwordPolicy: {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 6,
    lockoutThreshold: 5,
    lockoutDuration: 15,
  },

  mfaPolicy: {
    enabled: true,
    required: false,
    methods: ['totp', 'sms', 'email'],
    rememberDevice: true,
    rememberDeviceDays: 30,
  },

  sessionPolicy: {
    maxConcurrentSessions: 10,
    sessionTimeout: 10080, // 7 days
    idleTimeout: 480, // 8 hours
    extendOnActivity: true,
    singleSessionPerDevice: false,
    requireReauthForSensitive: true,
  },

  ssoPolicy: {
    enabled: true,
    required: false,
    providers: ['google', 'microsoft', 'saml', 'oidc', 'okta'],
    autoProvision: true,
    jitProvisioning: true,
    defaultRole: 'member',
  },

  securityPolicy: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    auditLogging: true,
    sensitiveDataMasking: true,
  },

  compliance: {
    gdprEnabled: true,
    ccpaEnabled: true,
    hipaaEnabled: false,
    soc2Enabled: true,
    pdplEnabled: false,
    dataRetentionDays: 1095, // 3 years
    rightToBeDeleted: true,
    dataPortability: true,
    consentTracking: true,
  },

  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    loginAlerts: true,
    sessionAlerts: false,
  },
};

/**
 * All available templates
 */
export const templates: Record<string, OrganizationTemplate> = {
  startup: startupTemplate,
  enterprise: enterpriseTemplate,
  healthcare: healthcareTemplate,
  finance: financeTemplate,
  education: educationTemplate,
  saas: saasTemplate,
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): OrganizationTemplate | undefined {
  return templates[id];
}

/**
 * Get all templates
 */
export function getAllTemplates(): OrganizationTemplate[] {
  return Object.values(templates);
}
