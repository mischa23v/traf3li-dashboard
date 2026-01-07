/**
 * Subscription Types for Legal Practice Management
 *
 * Based on research from:
 * - Odoo Subscription Module (sale.subscription)
 * - Dolibarr Membership/Subscription Module
 * - Legal industry requirements (retainer packages, hourly allocations)
 *
 * @module features/subscriptions/types
 */

// ==================== ENUMS ====================

/**
 * Billing period options
 * Based on Odoo's billing_period concept
 */
export type BillingPeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

/**
 * Subscription status lifecycle
 * Based on Odoo's stage_id concept with legal industry additions
 */
export type SubscriptionStatus =
  | 'draft'           // Not yet activated
  | 'trial'           // In trial period (if applicable)
  | 'active'          // Currently active and billing
  | 'paused'          // Temporarily suspended (client request)
  | 'past_due'        // Payment overdue
  | 'cancelled'       // Cancelled by client or firm
  | 'expired'         // End date reached
  | 'completed';      // Successfully completed (for fixed-term)

/**
 * Subscription plan type for legal services
 */
export type SubscriptionPlanType =
  | 'retainer'        // Monthly retainer package
  | 'hourly_package'  // Prepaid hours package
  | 'flat_fee'        // Fixed monthly fee for services
  | 'hybrid'          // Combination of flat fee + hourly
  | 'compliance'      // Ongoing compliance monitoring
  | 'document_review' // Regular document review service
  | 'advisory';       // Advisory/consultation package

/**
 * Proration behavior when changing plans
 */
export type ProrationBehavior =
  | 'create_prorations'    // Calculate prorated amounts
  | 'none'                 // No proration, start next period
  | 'always_invoice';      // Invoice immediately

/**
 * Currency codes supported
 */
export type SubscriptionCurrency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED';

/**
 * Actions available for subscriptions
 */
export type SubscriptionAction =
  | 'activate'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'renew'
  | 'upgrade'
  | 'downgrade'
  | 'generate_invoice';

// ==================== SUBSCRIPTION PLAN ====================

/**
 * Subscription Plan - Defines the template/product for subscriptions
 * Similar to Odoo's sale.subscription.plan / recurring.plan
 */
export interface SubscriptionPlan {
  _id: string;
  firmId: string;

  // Basic info
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  planType: SubscriptionPlanType;
  code?: string; // Internal reference code

  // Pricing
  billingPeriod: BillingPeriod;
  amount: number;
  currency: SubscriptionCurrency;
  setupFee?: number; // One-time setup fee

  // Legal-specific: Included services
  includedHours?: number; // Hours included per billing period
  hourlyRateAfter?: number; // Rate after included hours exhausted
  includedServices?: string[]; // List of included service types
  serviceCategories?: string[]; // Categories this plan covers

  // Trial
  trialDays?: number;
  trialAmount?: number; // Special trial pricing (0 for free trial)

  // Automation
  autoRenew: boolean;
  autoInvoice: boolean;
  invoiceDaysBefore: number; // Generate invoice X days before billing
  reminderDays?: number[]; // [7, 3, 1] days before due
  autoCloseDays?: number; // Days until auto-close if unpaid (Odoo concept)

  // Proration
  prorationBehavior: ProrationBehavior;
  alignToPeriodStart?: boolean; // Bill on 1st of period (Odoo concept)

  // Limits
  maxClients?: number; // Max clients per subscription (for firm plans)
  maxCases?: number; // Max cases covered

  // Status
  isActive: boolean;
  isPublic: boolean; // Show in client portal
  sortOrder?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Data for creating a subscription plan
 */
export interface CreateSubscriptionPlanData {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  planType: SubscriptionPlanType;
  code?: string;
  billingPeriod: BillingPeriod;
  amount: number;
  currency: SubscriptionCurrency;
  setupFee?: number;
  includedHours?: number;
  hourlyRateAfter?: number;
  includedServices?: string[];
  serviceCategories?: string[];
  trialDays?: number;
  trialAmount?: number;
  autoRenew?: boolean;
  autoInvoice?: boolean;
  invoiceDaysBefore?: number;
  reminderDays?: number[];
  autoCloseDays?: number;
  prorationBehavior?: ProrationBehavior;
  alignToPeriodStart?: boolean;
  maxClients?: number;
  maxCases?: number;
  isActive?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
}

/**
 * Data for updating a subscription plan
 */
export interface UpdateSubscriptionPlanData extends Partial<CreateSubscriptionPlanData> {}

// ==================== SUBSCRIPTION (Client Subscription) ====================

/**
 * Subscription - An active subscription for a client
 * Similar to Odoo's sale.subscription / sale.order with recurring
 */
export interface Subscription {
  _id: string;
  firmId: string;

  // Reference
  subscriptionNumber: string; // Auto-generated: SUB-YYYY-XXXX
  externalRef?: string; // External reference (Dolibarr: ref_ext)

  // Plan reference
  planId: string | SubscriptionPlan;
  planSnapshot?: Partial<SubscriptionPlan>; // Snapshot of plan at subscription time

  // Client/Case association
  clientId: string | { _id: string; fullName?: string; name?: string; email?: string };
  caseId?: string | { _id: string; caseNumber: string; title: string };

  // Dates (Dolibarr: dateh, datef)
  startDate: string;
  endDate?: string; // For fixed-term subscriptions
  nextBillingDate: string; // Odoo: date_next_invoice
  lastBillingDate?: string; // Odoo: last_invoiced_date
  trialEndDate?: string;

  // Billing
  billingPeriod: BillingPeriod;
  amount: number; // May differ from plan if custom pricing
  currency: SubscriptionCurrency;
  setupFee?: number;
  setupFeeInvoiced?: boolean;

  // Legal-specific usage tracking
  includedHours?: number;
  usedHours: number; // Hours used this period
  hourlyRateAfter?: number;
  totalHoursUsed: number; // Lifetime hours used

  // Status
  status: SubscriptionStatus;
  pausedAt?: string;
  pauseReason?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelAtPeriodEnd?: boolean; // Odoo concept - cancel at end of current period

  // Automation
  autoRenew: boolean;
  autoInvoice: boolean;

  // Metrics (Odoo: recurring_monthly for MRR)
  mrr: number; // Monthly Recurring Revenue (normalized)

  // Invoice history
  generatedInvoiceIds: string[];
  totalInvoiced: number;
  totalPaid: number;
  balanceDue: number;

  // Notes (Dolibarr: note, note_private)
  notes?: string;
  notesAr?: string;
  internalNotes?: string;

  // Activity log
  history: SubscriptionHistoryEntry[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * History entry for subscription changes
 */
export interface SubscriptionHistoryEntry {
  _id?: string;
  action: SubscriptionAction | 'created' | 'updated' | 'payment_received' | 'hours_consumed';
  timestamp: string;
  userId?: string;
  userName?: string;
  details?: string;
  previousStatus?: SubscriptionStatus;
  newStatus?: SubscriptionStatus;
  previousAmount?: number;
  newAmount?: number;
  metadata?: Record<string, any>;
}

/**
 * Data for creating a subscription
 */
export interface CreateSubscriptionData {
  planId: string;
  clientId: string;
  caseId?: string;
  startDate: string;
  endDate?: string;
  amount?: number; // Override plan amount if custom pricing
  currency?: SubscriptionCurrency;
  setupFee?: number;
  includedHours?: number;
  hourlyRateAfter?: number;
  autoRenew?: boolean;
  autoInvoice?: boolean;
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  skipTrial?: boolean; // Skip trial period
}

/**
 * Data for updating a subscription
 */
export interface UpdateSubscriptionData {
  amount?: number;
  endDate?: string;
  autoRenew?: boolean;
  autoInvoice?: boolean;
  notes?: string;
  notesAr?: string;
  internalNotes?: string;
  includedHours?: number;
  hourlyRateAfter?: number;
}

/**
 * Data for changing a subscription's plan
 */
export interface ChangePlanData {
  newPlanId: string;
  prorationBehavior?: ProrationBehavior;
  effectiveDate?: string; // When to apply change (default: immediately)
}

/**
 * Data for recording hours consumption
 */
export interface ConsumeHoursData {
  hours: number;
  description: string;
  descriptionAr?: string;
  taskId?: string;
  timeEntryId?: string;
  date: string;
}

// ==================== FILTERING & PAGINATION ====================

/**
 * Filters for subscription plans list
 */
export interface SubscriptionPlanFilters {
  search?: string;
  planType?: SubscriptionPlanType;
  billingPeriod?: BillingPeriod;
  isActive?: boolean;
  isPublic?: boolean;
  minAmount?: number;
  maxAmount?: number;
  currency?: SubscriptionCurrency;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filters for subscriptions list
 */
export interface SubscriptionFilters {
  search?: string;
  status?: SubscriptionStatus | SubscriptionStatus[];
  planId?: string;
  clientId?: string;
  caseId?: string;
  billingPeriod?: BillingPeriod;
  startDateFrom?: string;
  startDateTo?: string;
  nextBillingDateFrom?: string;
  nextBillingDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  autoRenew?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== API RESPONSES ====================

/**
 * Paginated response for subscription plans
 */
export interface SubscriptionPlanListResponse {
  data: SubscriptionPlan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Paginated response for subscriptions
 */
export interface SubscriptionListResponse {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Subscription statistics
 */
export interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  paused: number;
  pastDue: number;
  cancelled: number;
  expired: number;
  mrr: number; // Total Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue (MRR * 12)
  averageSubscriptionValue: number;
  churnRate: number; // Percentage of cancelled/expired this period
  renewalRate: number; // Percentage of renewed subscriptions
  byPlanType: Record<SubscriptionPlanType, number>;
  byBillingPeriod: Record<BillingPeriod, number>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    newSubscriptions: number;
    churned: number;
  }>;
}

/**
 * Upcoming invoice preview
 */
export interface UpcomingInvoicePreview {
  subscriptionId: string;
  subscriptionNumber: string;
  clientId: string;
  clientName: string;
  planName: string;
  billingPeriod: BillingPeriod;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currency: SubscriptionCurrency;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

// ==================== HELPER TYPES ====================

/**
 * Hours usage summary for a subscription
 */
export interface HoursUsageSummary {
  subscriptionId: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  includedHours: number;
  usedHours: number;
  remainingHours: number;
  overageHours: number;
  overageRate: number;
  overageAmount: number;
  entries: Array<{
    date: string;
    hours: number;
    description: string;
    taskId?: string;
    timeEntryId?: string;
  }>;
}

/**
 * Subscription renewal preview
 */
export interface RenewalPreview {
  subscriptionId: string;
  currentPeriodEnd: string;
  newPeriodStart: string;
  newPeriodEnd: string;
  amount: number;
  currency: SubscriptionCurrency;
  willAutoRenew: boolean;
  daysUntilRenewal: number;
}
