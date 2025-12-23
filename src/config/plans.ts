/**
 * Plan and Feature Configuration System
 * Defines subscription tiers, limits, and feature access for Traf3li
 */

// ===========================
// Type Definitions
// ===========================

export type PlanId = 'free' | 'starter' | 'professional' | 'enterprise';

export type FeatureId =
  | 'basic_cases'
  | 'basic_clients'
  | 'basic_invoices'
  | 'reports'
  | 'calendar_sync'
  | 'advanced_reports'
  | 'api_access'
  | 'custom_fields'
  | 'bulk_operations'
  | 'audit_logs'
  | 'sso'
  | 'custom_branding'
  | 'dedicated_support'
  | 'sla_guarantee'
  | 'advanced_permissions'
  | 'document_templates'
  | 'email_notifications'
  | 'sms_notifications'
  | 'team_collaboration'
  | 'client_portal'
  | 'payment_processing'
  | 'multi_currency'
  | 'webhooks'
  | 'data_export'
  | 'backup_restore';

export interface PlanConfig {
  id: PlanId;
  name: string;
  nameAr: string;
  maxUsers: number; // -1 for unlimited
  maxCases: number; // -1 for unlimited
  maxStorage: number; // MB, -1 for unlimited
  maxDocumentsPerCase: number; // -1 for unlimited
  maxClientsPerCase: number; // -1 for unlimited
  features: FeatureId[];
  price: number | 'custom';
  priceAr?: string; // For display purposes (e.g., "حسب الطلب")
  billingPeriod?: 'monthly' | 'yearly';
  popular?: boolean;
  description?: string;
  descriptionAr?: string;
}

export interface FeatureConfig {
  id: FeatureId;
  plans: PlanId[];
  label: string;
  labelAr: string;
  category: 'core' | 'productivity' | 'advanced' | 'enterprise' | 'integration';
  description?: string;
  descriptionAr?: string;
}

export interface PlanLimits {
  maxUsers: number;
  maxCases: number;
  maxStorage: number;
  maxDocumentsPerCase: number;
  maxClientsPerCase: number;
}

export interface UpgradePath {
  from: PlanId;
  to: PlanId | null;
  benefits: string[];
  benefitsAr: string[];
}

// ===========================
// Plan Configurations
// ===========================

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    nameAr: 'مجاني',
    maxUsers: 2,
    maxCases: 10,
    maxStorage: 100, // 100 MB
    maxDocumentsPerCase: 5,
    maxClientsPerCase: 2,
    features: [
      'basic_cases',
      'basic_clients',
      'basic_invoices',
      'email_notifications',
      'data_export',
    ],
    price: 0,
    description: 'Perfect for solo practitioners starting out',
    descriptionAr: 'مثالي للممارسين الفرديين المبتدئين',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    nameAr: 'المبتدئ',
    maxUsers: 5,
    maxCases: 50,
    maxStorage: 1000, // 1 GB
    maxDocumentsPerCase: 20,
    maxClientsPerCase: 5,
    features: [
      'basic_cases',
      'basic_clients',
      'basic_invoices',
      'reports',
      'calendar_sync',
      'email_notifications',
      'sms_notifications',
      'document_templates',
      'team_collaboration',
      'data_export',
      'backup_restore',
    ],
    price: 99,
    billingPeriod: 'monthly',
    description: 'Ideal for small law firms growing their practice',
    descriptionAr: 'مثالي لمكاتب المحاماة الصغيرة النامية',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    nameAr: 'المحترف',
    maxUsers: 20,
    maxCases: 500,
    maxStorage: 10000, // 10 GB
    maxDocumentsPerCase: 100,
    maxClientsPerCase: 20,
    features: [
      'basic_cases',
      'basic_clients',
      'basic_invoices',
      'reports',
      'calendar_sync',
      'advanced_reports',
      'api_access',
      'custom_fields',
      'bulk_operations',
      'email_notifications',
      'sms_notifications',
      'document_templates',
      'team_collaboration',
      'client_portal',
      'payment_processing',
      'multi_currency',
      'webhooks',
      'data_export',
      'backup_restore',
    ],
    price: 299,
    billingPeriod: 'monthly',
    popular: true,
    description: 'Complete solution for established law firms',
    descriptionAr: 'الحل الكامل لمكاتب المحاماة المتقدمة',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'المؤسسات',
    maxUsers: -1, // unlimited
    maxCases: -1, // unlimited
    maxStorage: -1, // unlimited
    maxDocumentsPerCase: -1, // unlimited
    maxClientsPerCase: -1, // unlimited
    features: [
      'basic_cases',
      'basic_clients',
      'basic_invoices',
      'reports',
      'calendar_sync',
      'advanced_reports',
      'api_access',
      'custom_fields',
      'bulk_operations',
      'audit_logs',
      'sso',
      'custom_branding',
      'dedicated_support',
      'sla_guarantee',
      'advanced_permissions',
      'email_notifications',
      'sms_notifications',
      'document_templates',
      'team_collaboration',
      'client_portal',
      'payment_processing',
      'multi_currency',
      'webhooks',
      'data_export',
      'backup_restore',
    ],
    price: 'custom',
    priceAr: 'حسب الطلب',
    description: 'Tailored for large organizations with custom needs',
    descriptionAr: 'مصمم للمؤسسات الكبيرة ذات الاحتياجات المخصصة',
  },
};

// ===========================
// Feature Configurations
// ===========================

export const FEATURES: Record<FeatureId, FeatureConfig> = {
  // Core Features
  basic_cases: {
    id: 'basic_cases',
    plans: ['free', 'starter', 'professional', 'enterprise'],
    label: 'Case Management',
    labelAr: 'إدارة القضايا',
    category: 'core',
    description: 'Create and manage legal cases',
    descriptionAr: 'إنشاء وإدارة القضايا القانونية',
  },
  basic_clients: {
    id: 'basic_clients',
    plans: ['free', 'starter', 'professional', 'enterprise'],
    label: 'Client Management',
    labelAr: 'إدارة العملاء',
    category: 'core',
    description: 'Manage client information and contacts',
    descriptionAr: 'إدارة معلومات العملاء وجهات الاتصال',
  },
  basic_invoices: {
    id: 'basic_invoices',
    plans: ['free', 'starter', 'professional', 'enterprise'],
    label: 'Basic Invoicing',
    labelAr: 'الفواتير الأساسية',
    category: 'core',
    description: 'Create and send invoices',
    descriptionAr: 'إنشاء وإرسال الفواتير',
  },

  // Productivity Features
  reports: {
    id: 'reports',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Reports',
    labelAr: 'التقارير',
    category: 'productivity',
    description: 'Generate basic reports and analytics',
    descriptionAr: 'إنشاء التقارير والتحليلات الأساسية',
  },
  calendar_sync: {
    id: 'calendar_sync',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Calendar Integration',
    labelAr: 'تكامل التقويم',
    category: 'productivity',
    description: 'Sync with Google Calendar and Outlook',
    descriptionAr: 'المزامنة مع تقويم جوجل وأوتلوك',
  },
  document_templates: {
    id: 'document_templates',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Document Templates',
    labelAr: 'قوالب المستندات',
    category: 'productivity',
    description: 'Use pre-built legal document templates',
    descriptionAr: 'استخدام قوالب المستندات القانونية الجاهزة',
  },
  team_collaboration: {
    id: 'team_collaboration',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Team Collaboration',
    labelAr: 'التعاون الجماعي',
    category: 'productivity',
    description: 'Collaborate with team members on cases',
    descriptionAr: 'التعاون مع أعضاء الفريق على القضايا',
  },
  email_notifications: {
    id: 'email_notifications',
    plans: ['free', 'starter', 'professional', 'enterprise'],
    label: 'Email Notifications',
    labelAr: 'إشعارات البريد الإلكتروني',
    category: 'productivity',
    description: 'Receive email notifications for important events',
    descriptionAr: 'تلقي إشعارات البريد الإلكتروني للأحداث المهمة',
  },
  sms_notifications: {
    id: 'sms_notifications',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'SMS Notifications',
    labelAr: 'إشعارات الرسائل النصية',
    category: 'productivity',
    description: 'Send SMS notifications to clients',
    descriptionAr: 'إرسال إشعارات الرسائل النصية للعملاء',
  },

  // Advanced Features
  advanced_reports: {
    id: 'advanced_reports',
    plans: ['professional', 'enterprise'],
    label: 'Advanced Analytics',
    labelAr: 'التحليلات المتقدمة',
    category: 'advanced',
    description: 'Detailed analytics and custom reports',
    descriptionAr: 'التحليلات التفصيلية والتقارير المخصصة',
  },
  api_access: {
    id: 'api_access',
    plans: ['professional', 'enterprise'],
    label: 'API Access',
    labelAr: 'الوصول إلى API',
    category: 'advanced',
    description: 'Integrate with third-party applications',
    descriptionAr: 'التكامل مع التطبيقات الخارجية',
  },
  custom_fields: {
    id: 'custom_fields',
    plans: ['professional', 'enterprise'],
    label: 'Custom Fields',
    labelAr: 'الحقول المخصصة',
    category: 'advanced',
    description: 'Add custom fields to cases and clients',
    descriptionAr: 'إضافة حقول مخصصة للقضايا والعملاء',
  },
  bulk_operations: {
    id: 'bulk_operations',
    plans: ['professional', 'enterprise'],
    label: 'Bulk Operations',
    labelAr: 'العمليات المجمعة',
    category: 'advanced',
    description: 'Perform actions on multiple items at once',
    descriptionAr: 'تنفيذ الإجراءات على عناصر متعددة دفعة واحدة',
  },
  client_portal: {
    id: 'client_portal',
    plans: ['professional', 'enterprise'],
    label: 'Client Portal',
    labelAr: 'بوابة العملاء',
    category: 'advanced',
    description: 'Give clients access to their case information',
    descriptionAr: 'منح العملاء الوصول إلى معلومات قضاياهم',
  },
  payment_processing: {
    id: 'payment_processing',
    plans: ['professional', 'enterprise'],
    label: 'Payment Processing',
    labelAr: 'معالجة المدفوعات',
    category: 'advanced',
    description: 'Accept online payments from clients',
    descriptionAr: 'قبول المدفوعات عبر الإنترنت من العملاء',
  },
  multi_currency: {
    id: 'multi_currency',
    plans: ['professional', 'enterprise'],
    label: 'Multi-Currency',
    labelAr: 'العملات المتعددة',
    category: 'advanced',
    description: 'Support multiple currencies in invoices',
    descriptionAr: 'دعم العملات المتعددة في الفواتير',
  },
  data_export: {
    id: 'data_export',
    plans: ['free', 'starter', 'professional', 'enterprise'],
    label: 'Data Export',
    labelAr: 'تصدير البيانات',
    category: 'advanced',
    description: 'Export your data in various formats',
    descriptionAr: 'تصدير بياناتك بتنسيقات مختلفة',
  },
  backup_restore: {
    id: 'backup_restore',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Backup & Restore',
    labelAr: 'النسخ الاحتياطي والاستعادة',
    category: 'advanced',
    description: 'Automatic backups and data restoration',
    descriptionAr: 'النسخ الاحتياطية التلقائية واستعادة البيانات',
  },

  // Enterprise Features
  audit_logs: {
    id: 'audit_logs',
    plans: ['enterprise'],
    label: 'Audit Logs',
    labelAr: 'سجلات التدقيق',
    category: 'enterprise',
    description: 'Complete audit trail of all system activities',
    descriptionAr: 'سجل تدقيق كامل لجميع أنشطة النظام',
  },
  sso: {
    id: 'sso',
    plans: ['enterprise'],
    label: 'Single Sign-On (SSO)',
    labelAr: 'تسجيل الدخول الموحد',
    category: 'enterprise',
    description: 'SAML/OAuth integration for enterprise authentication',
    descriptionAr: 'تكامل SAML/OAuth للمصادقة المؤسسية',
  },
  custom_branding: {
    id: 'custom_branding',
    plans: ['enterprise'],
    label: 'Custom Branding',
    labelAr: 'العلامة التجارية المخصصة',
    category: 'enterprise',
    description: 'White-label the platform with your branding',
    descriptionAr: 'تخصيص المنصة بعلامتك التجارية',
  },
  dedicated_support: {
    id: 'dedicated_support',
    plans: ['enterprise'],
    label: 'Dedicated Support',
    labelAr: 'الدعم المخصص',
    category: 'enterprise',
    description: '24/7 priority support with dedicated account manager',
    descriptionAr: 'دعم أولوية على مدار الساعة مع مدير حساب مخصص',
  },
  sla_guarantee: {
    id: 'sla_guarantee',
    plans: ['enterprise'],
    label: 'SLA Guarantee',
    labelAr: 'ضمان اتفاقية مستوى الخدمة',
    category: 'enterprise',
    description: '99.9% uptime guarantee with SLA',
    descriptionAr: 'ضمان توفر 99.9٪ مع اتفاقية مستوى الخدمة',
  },
  advanced_permissions: {
    id: 'advanced_permissions',
    plans: ['enterprise'],
    label: 'Advanced Permissions',
    labelAr: 'الأذونات المتقدمة',
    category: 'enterprise',
    description: 'Granular role-based access control',
    descriptionAr: 'التحكم الدقيق في الوصول على أساس الأدوار',
  },

  // Integration Features
  webhooks: {
    id: 'webhooks',
    plans: ['professional', 'enterprise'],
    label: 'Webhooks',
    labelAr: 'روابط الويب',
    category: 'integration',
    description: 'Real-time event notifications to external systems',
    descriptionAr: 'إشعارات الأحداث في الوقت الفعلي للأنظمة الخارجية',
  },
};

// ===========================
// Helper Functions
// ===========================

/**
 * Get plan configuration by plan ID
 */
export function getPlanConfig(plan: PlanId): PlanConfig {
  return PLANS[plan];
}

/**
 * Get all available plans as an array
 */
export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

/**
 * Check if a plan has access to a specific feature
 */
export function hasFeature(userPlan: PlanId, feature: FeatureId): boolean {
  const featureConfig = FEATURES[feature];
  if (!featureConfig) {
    if (import.meta.env.DEV) {
      console.warn(`Unknown feature: ${feature}`);
    }
    return false;
  }
  return featureConfig.plans.includes(userPlan);
}

/**
 * Get all features available for a plan
 */
export function getPlanFeatures(plan: PlanId): FeatureConfig[] {
  const planConfig = PLANS[plan];
  return planConfig.features.map((featureId) => FEATURES[featureId]);
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: PlanId): PlanLimits {
  const planConfig = PLANS[plan];
  return {
    maxUsers: planConfig.maxUsers,
    maxCases: planConfig.maxCases,
    maxStorage: planConfig.maxStorage,
    maxDocumentsPerCase: planConfig.maxDocumentsPerCase,
    maxClientsPerCase: planConfig.maxClientsPerCase,
  };
}

/**
 * Check if a limit value is unlimited (-1)
 */
export function isUnlimited(value: number): boolean {
  return value === -1;
}

/**
 * Format limit for display (returns "Unlimited" for -1)
 */
export function formatLimit(
  value: number,
  unit?: string,
  isArabic: boolean = false
): string {
  if (isUnlimited(value)) {
    return isArabic ? 'غير محدود' : 'Unlimited';
  }
  return unit ? `${value} ${unit}` : value.toString();
}

/**
 * Get upgrade path for a plan (next tier to upgrade to)
 */
export function getUpgradePath(currentPlan: PlanId): UpgradePath {
  const upgradePaths: Record<PlanId, UpgradePath> = {
    free: {
      from: 'free',
      to: 'starter',
      benefits: [
        'Increase case limit from 10 to 50',
        'Add up to 5 team members',
        'Access to reports and analytics',
        'Calendar synchronization',
        'SMS notifications',
      ],
      benefitsAr: [
        'زيادة حد القضايا من 10 إلى 50',
        'إضافة ما يصل إلى 5 أعضاء في الفريق',
        'الوصول إلى التقارير والتحليلات',
        'مزامنة التقويم',
        'إشعارات الرسائل النصية',
      ],
    },
    starter: {
      from: 'starter',
      to: 'professional',
      benefits: [
        'Increase case limit from 50 to 500',
        'Add up to 20 team members',
        'Advanced analytics and custom reports',
        'API access for integrations',
        'Client portal',
        'Payment processing',
      ],
      benefitsAr: [
        'زيادة حد القضايا من 50 إلى 500',
        'إضافة ما يصل إلى 20 عضوًا في الفريق',
        'التحليلات المتقدمة والتقارير المخصصة',
        'الوصول إلى API للتكاملات',
        'بوابة العملاء',
        'معالجة المدفوعات',
      ],
    },
    professional: {
      from: 'professional',
      to: 'enterprise',
      benefits: [
        'Unlimited users, cases, and storage',
        'Complete audit logs',
        'Single Sign-On (SSO)',
        'Custom branding',
        'Dedicated support',
        '99.9% SLA guarantee',
        'Advanced permissions',
      ],
      benefitsAr: [
        'مستخدمون وقضايا وتخزين غير محدودة',
        'سجلات تدقيق كاملة',
        'تسجيل الدخول الموحد',
        'العلامة التجارية المخصصة',
        'الدعم المخصص',
        'ضمان SLA بنسبة 99.9٪',
        'الأذونات المتقدمة',
      ],
    },
    enterprise: {
      from: 'enterprise',
      to: null,
      benefits: ['You are on the highest tier!'],
      benefitsAr: ['أنت على أعلى مستوى!'],
    },
  };

  return upgradePaths[currentPlan];
}

/**
 * Get all features grouped by category
 */
export function getFeaturesByCategory(): Record<
  FeatureConfig['category'],
  FeatureConfig[]
> {
  const grouped: Record<FeatureConfig['category'], FeatureConfig[]> = {
    core: [],
    productivity: [],
    advanced: [],
    enterprise: [],
    integration: [],
  };

  Object.values(FEATURES).forEach((feature) => {
    grouped[feature.category].push(feature);
  });

  return grouped;
}

/**
 * Compare two plans and get the differences
 */
export function comparePlans(planA: PlanId, planB: PlanId): {
  additionalFeatures: FeatureConfig[];
  limitDifferences: Record<string, { planA: number; planB: number }>;
} {
  const configA = PLANS[planA];
  const configB = PLANS[planB];

  // Find additional features in planB
  const additionalFeatures = configB.features
    .filter((feature) => !configA.features.includes(feature))
    .map((featureId) => FEATURES[featureId]);

  // Compare limits
  const limitDifferences: Record<string, { planA: number; planB: number }> = {};
  const limitKeys: (keyof PlanLimits)[] = [
    'maxUsers',
    'maxCases',
    'maxStorage',
    'maxDocumentsPerCase',
    'maxClientsPerCase',
  ];

  limitKeys.forEach((key) => {
    if (configA[key] !== configB[key]) {
      limitDifferences[key] = {
        planA: configA[key],
        planB: configB[key],
      };
    }
  });

  return { additionalFeatures, limitDifferences };
}

/**
 * Check if user has reached a specific limit
 */
export function hasReachedLimit(
  currentValue: number,
  limit: number
): boolean {
  if (isUnlimited(limit)) {
    return false;
  }
  return currentValue >= limit;
}

/**
 * Calculate usage percentage for a limit
 */
export function getUsagePercentage(
  currentValue: number,
  limit: number
): number {
  if (isUnlimited(limit)) {
    return 0; // No limit means no percentage can be calculated
  }
  return Math.min(100, Math.round((currentValue / limit) * 100));
}

/**
 * Get plan price in formatted string
 */
export function formatPlanPrice(
  plan: PlanId,
  isArabic: boolean = false
): string {
  const config = PLANS[plan];

  if (config.price === 'custom') {
    return isArabic ? 'حسب الطلب' : 'Custom';
  }

  if (config.price === 0) {
    return isArabic ? 'مجاني' : 'Free';
  }

  const currency = isArabic ? 'ر.س' : 'SAR';
  const priceStr = config.price.toString();

  return isArabic ? `${currency} ${priceStr}` : `${priceStr} ${currency}`;
}

/**
 * Get recommended plan based on usage requirements
 */
export function getRecommendedPlan(requirements: {
  users?: number;
  cases?: number;
  storage?: number;
  features?: FeatureId[];
}): PlanId {
  const plans: PlanId[] = ['free', 'starter', 'professional', 'enterprise'];

  for (const planId of plans) {
    const config = PLANS[planId];

    // Check user limit
    if (requirements.users && !isUnlimited(config.maxUsers)) {
      if (requirements.users > config.maxUsers) continue;
    }

    // Check case limit
    if (requirements.cases && !isUnlimited(config.maxCases)) {
      if (requirements.cases > config.maxCases) continue;
    }

    // Check storage limit
    if (requirements.storage && !isUnlimited(config.maxStorage)) {
      if (requirements.storage > config.maxStorage) continue;
    }

    // Check features
    if (requirements.features) {
      const hasAllFeatures = requirements.features.every((feature) =>
        hasFeature(planId, feature)
      );
      if (!hasAllFeatures) continue;
    }

    // This plan meets all requirements
    return planId;
  }

  // If no plan found, recommend enterprise
  return 'enterprise';
}

/**
 * Get features unique to a specific plan (not available in lower tiers)
 */
export function getUniquePlanFeatures(plan: PlanId): FeatureConfig[] {
  const planIndex = ['free', 'starter', 'professional', 'enterprise'].indexOf(plan);
  const lowerPlans = ['free', 'starter', 'professional', 'enterprise'].slice(0, planIndex);

  const planFeatures = PLANS[plan].features;
  const lowerPlanFeatures = new Set(
    lowerPlans.flatMap((p) => PLANS[p as PlanId].features)
  );

  return planFeatures
    .filter((feature) => !lowerPlanFeatures.has(feature))
    .map((featureId) => FEATURES[featureId]);
}

// ===========================
// Constants for easy access
// ===========================

export const PLAN_IDS: PlanId[] = ['free', 'starter', 'professional', 'enterprise'];

export const DEFAULT_PLAN: PlanId = 'free';
