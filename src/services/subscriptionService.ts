/**
 * Subscription Service
 * Handles subscription plans and client subscriptions for legal services
 *
 * API Endpoints:
 *
 * Subscription Plans:
 * - GET    /subscription-plans              - List all plans with filters
 * - GET    /subscription-plans/:id          - Get plan by ID
 * - POST   /subscription-plans              - Create new plan
 * - PATCH  /subscription-plans/:id          - Update plan
 * - DELETE /subscription-plans/:id          - Delete plan (soft delete)
 * - POST   /subscription-plans/:id/duplicate - Duplicate a plan
 *
 * Subscriptions:
 * - GET    /subscriptions                   - List all subscriptions with filters
 * - GET    /subscriptions/:id               - Get subscription by ID
 * - POST   /subscriptions                   - Create new subscription
 * - PATCH  /subscriptions/:id               - Update subscription
 * - DELETE /subscriptions/:id               - Delete subscription (soft delete)
 * - POST   /subscriptions/:id/activate      - Activate a draft subscription
 * - POST   /subscriptions/:id/pause         - Pause subscription
 * - POST   /subscriptions/:id/resume        - Resume paused subscription
 * - POST   /subscriptions/:id/cancel        - Cancel subscription
 * - POST   /subscriptions/:id/renew         - Manually renew subscription
 * - POST   /subscriptions/:id/change-plan   - Change to different plan
 * - POST   /subscriptions/:id/consume-hours - Record hours consumption
 * - GET    /subscriptions/:id/hours-usage   - Get hours usage summary
 * - GET    /subscriptions/:id/invoices      - Get related invoices
 * - POST   /subscriptions/:id/generate-invoice - Generate next invoice manually
 * - GET    /subscriptions/:id/upcoming-invoice - Preview upcoming invoice
 * - GET    /subscriptions/:id/renewal-preview - Preview renewal details
 * - GET    /subscriptions/stats             - Get subscription statistics
 * - GET    /subscriptions/upcoming-renewals - Get subscriptions due for renewal
 * - GET    /subscriptions/past-due          - Get past due subscriptions
 *
 * @module services/subscriptionService
 */

import api from '@/lib/axios';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
  SubscriptionPlanFilters,
  SubscriptionPlanListResponse,
  Subscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionFilters,
  SubscriptionListResponse,
  SubscriptionStats,
  ChangePlanData,
  ConsumeHoursData,
  HoursUsageSummary,
  UpcomingInvoicePreview,
  RenewalPreview,
  BillingPeriod,
  SubscriptionStatus,
  SubscriptionPlanType,
} from '@/features/subscriptions/types/subscription-types';

// ==================== SUBSCRIPTION PLANS ====================

const subscriptionPlanService = {
  /**
   * Get all subscription plans with filters
   */
  getAll: async (filters?: SubscriptionPlanFilters): Promise<SubscriptionPlanListResponse> => {
    const response = await api.get('/subscription-plans', { params: filters });
    return response.data;
  },

  /**
   * Get subscription plan by ID
   */
  getById: async (id: string): Promise<SubscriptionPlan> => {
    const response = await api.get(`/subscription-plans/${id}`);
    return response.data;
  },

  /**
   * Create new subscription plan
   */
  create: async (data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    const response = await api.post('/subscription-plans', data);
    return response.data;
  },

  /**
   * Update subscription plan
   */
  update: async (id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    const response = await api.patch(`/subscription-plans/${id}`, data);
    return response.data;
  },

  /**
   * Delete subscription plan (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscription-plans/${id}`);
  },

  /**
   * Duplicate subscription plan
   */
  duplicate: async (id: string, name: string, nameAr?: string): Promise<SubscriptionPlan> => {
    const response = await api.post(`/subscription-plans/${id}/duplicate`, { name, nameAr });
    return response.data;
  },

  /**
   * Toggle plan active status
   */
  toggleActive: async (id: string): Promise<SubscriptionPlan> => {
    const response = await api.post(`/subscription-plans/${id}/toggle-active`);
    return response.data;
  },
};

// ==================== SUBSCRIPTIONS ====================

const subscriptionService = {
  // ==================== PLAN METHODS ====================
  plans: subscriptionPlanService,

  // ==================== SUBSCRIPTION CRUD ====================

  /**
   * Get all subscriptions with filters
   */
  getAll: async (filters?: SubscriptionFilters): Promise<SubscriptionListResponse> => {
    const response = await api.get('/subscriptions', { params: filters });
    return response.data;
  },

  /**
   * Get subscription by ID
   */
  getById: async (id: string): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Create new subscription
   */
  create: async (data: CreateSubscriptionData): Promise<Subscription> => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  /**
   * Update subscription
   */
  update: async (id: string, data: UpdateSubscriptionData): Promise<Subscription> => {
    const response = await api.patch(`/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Delete subscription (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/${id}`);
  },

  // ==================== SUBSCRIPTION ACTIONS ====================

  /**
   * Activate a draft subscription
   */
  activate: async (id: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/activate`);
    return response.data;
  },

  /**
   * Pause subscription
   */
  pause: async (id: string, reason?: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/pause`, { reason });
    return response.data;
  },

  /**
   * Resume paused subscription
   */
  resume: async (id: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/resume`);
    return response.data;
  },

  /**
   * Cancel subscription
   * @param atPeriodEnd - If true, cancel at end of current period; if false, cancel immediately
   */
  cancel: async (id: string, reason?: string, atPeriodEnd: boolean = true): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/cancel`, { reason, atPeriodEnd });
    return response.data;
  },

  /**
   * Manually renew subscription
   */
  renew: async (id: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/renew`);
    return response.data;
  },

  /**
   * Change subscription to different plan
   */
  changePlan: async (id: string, data: ChangePlanData): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/change-plan`, data);
    return response.data;
  },

  // ==================== HOURS TRACKING ====================

  /**
   * Record hours consumption for subscription
   */
  consumeHours: async (id: string, data: ConsumeHoursData): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/consume-hours`, data);
    return response.data;
  },

  /**
   * Get hours usage summary for current period
   */
  getHoursUsage: async (id: string): Promise<HoursUsageSummary> => {
    const response = await api.get(`/subscriptions/${id}/hours-usage`);
    return response.data;
  },

  /**
   * Reset hours usage (for new billing period)
   */
  resetHoursUsage: async (id: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${id}/reset-hours`);
    return response.data;
  },

  // ==================== INVOICING ====================

  /**
   * Get invoices related to subscription
   */
  getInvoices: async (id: string): Promise<any[]> => {
    const response = await api.get(`/subscriptions/${id}/invoices`);
    return response.data;
  },

  /**
   * Generate next invoice manually
   */
  generateInvoice: async (id: string): Promise<{ invoice: any; subscription: Subscription }> => {
    const response = await api.post(`/subscriptions/${id}/generate-invoice`);
    return response.data;
  },

  /**
   * Preview upcoming invoice
   */
  getUpcomingInvoice: async (id: string): Promise<UpcomingInvoicePreview> => {
    const response = await api.get(`/subscriptions/${id}/upcoming-invoice`);
    return response.data;
  },

  /**
   * Preview renewal details
   */
  getRenewalPreview: async (id: string): Promise<RenewalPreview> => {
    const response = await api.get(`/subscriptions/${id}/renewal-preview`);
    return response.data;
  },

  // ==================== STATISTICS & REPORTS ====================

  /**
   * Get subscription statistics
   */
  getStats: async (): Promise<SubscriptionStats> => {
    const response = await api.get('/subscriptions/stats');
    return response.data;
  },

  /**
   * Get subscriptions due for renewal
   */
  getUpcomingRenewals: async (days: number = 30): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions/upcoming-renewals', { params: { days } });
    return response.data;
  },

  /**
   * Get past due subscriptions
   */
  getPastDue: async (): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions/past-due');
    return response.data;
  },

  /**
   * Get subscriptions by client
   */
  getByClient: async (clientId: string): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions', { params: { clientId } });
    return response.data.data || response.data;
  },

  /**
   * Get subscriptions by case
   */
  getByCase: async (caseId: string): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions', { params: { caseId } });
    return response.data.data || response.data;
  },
};

export default subscriptionService;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get billing period label
 */
export const getBillingPeriodLabel = (period: BillingPeriod, lang: 'ar' | 'en' = 'ar'): string => {
  const labels: Record<'ar' | 'en', Record<BillingPeriod, string>> = {
    ar: {
      weekly: 'أسبوعياً',
      biweekly: 'كل أسبوعين',
      monthly: 'شهرياً',
      quarterly: 'ربع سنوي',
      semi_annually: 'نصف سنوي',
      annually: 'سنوياً',
    },
    en: {
      weekly: 'Weekly',
      biweekly: 'Biweekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      semi_annually: 'Semi-Annually',
      annually: 'Annually',
    },
  };
  return labels[lang][period];
};

/**
 * Get subscription status label
 */
export const getStatusLabel = (status: SubscriptionStatus, lang: 'ar' | 'en' = 'ar'): string => {
  const labels: Record<'ar' | 'en', Record<SubscriptionStatus, string>> = {
    ar: {
      draft: 'مسودة',
      trial: 'فترة تجريبية',
      active: 'نشط',
      paused: 'متوقف مؤقتاً',
      past_due: 'متأخر السداد',
      cancelled: 'ملغي',
      expired: 'منتهي',
      completed: 'مكتمل',
    },
    en: {
      draft: 'Draft',
      trial: 'Trial',
      active: 'Active',
      paused: 'Paused',
      past_due: 'Past Due',
      cancelled: 'Cancelled',
      expired: 'Expired',
      completed: 'Completed',
    },
  };
  return labels[lang][status];
};

/**
 * Get subscription status color
 */
export const getStatusColor = (status: SubscriptionStatus): string => {
  const colors: Record<SubscriptionStatus, string> = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
    trial: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    past_due: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };
  return colors[status];
};

/**
 * Get plan type label
 */
export const getPlanTypeLabel = (type: SubscriptionPlanType, lang: 'ar' | 'en' = 'ar'): string => {
  const labels: Record<'ar' | 'en', Record<SubscriptionPlanType, string>> = {
    ar: {
      retainer: 'توكيل شهري',
      hourly_package: 'باقة ساعات',
      flat_fee: 'رسوم ثابتة',
      hybrid: 'مختلط',
      compliance: 'امتثال',
      document_review: 'مراجعة مستندات',
      advisory: 'استشاري',
    },
    en: {
      retainer: 'Monthly Retainer',
      hourly_package: 'Hourly Package',
      flat_fee: 'Flat Fee',
      hybrid: 'Hybrid',
      compliance: 'Compliance',
      document_review: 'Document Review',
      advisory: 'Advisory',
    },
  };
  return labels[lang][type];
};

/**
 * Get plan type color
 */
export const getPlanTypeColor = (type: SubscriptionPlanType): string => {
  const colors: Record<SubscriptionPlanType, string> = {
    retainer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    hourly_package: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    flat_fee: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    hybrid: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    compliance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    document_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advisory: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  };
  return colors[type];
};

/**
 * Calculate MRR from subscription amount and billing period
 */
export const calculateMRR = (amount: number, billingPeriod: BillingPeriod): number => {
  const multipliers: Record<BillingPeriod, number> = {
    weekly: 4.33, // ~4.33 weeks per month
    biweekly: 2.17,
    monthly: 1,
    quarterly: 1 / 3,
    semi_annually: 1 / 6,
    annually: 1 / 12,
  };
  return amount * multipliers[billingPeriod];
};

/**
 * Format currency amount
 */
export const formatSubscriptionAmount = (
  amount: number,
  currency: string,
  lang: 'ar' | 'en' = 'ar'
): string => {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get days until next billing
 */
export const getDaysUntilBilling = (nextBillingDate: string): number => {
  const next = new Date(nextBillingDate);
  const now = new Date();
  const diffTime = next.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if subscription is in warning state (needs attention)
 */
export const needsAttention = (subscription: Subscription): boolean => {
  const warningStatuses: SubscriptionStatus[] = ['past_due', 'paused'];
  if (warningStatuses.includes(subscription.status)) return true;

  // Check if ending soon and not auto-renewing
  if (!subscription.autoRenew && subscription.endDate) {
    const daysUntilEnd = getDaysUntilBilling(subscription.endDate);
    if (daysUntilEnd <= 30 && daysUntilEnd > 0) return true;
  }

  // Check if hours nearly exhausted
  if (subscription.includedHours && subscription.usedHours >= subscription.includedHours * 0.9) {
    return true;
  }

  return false;
};
