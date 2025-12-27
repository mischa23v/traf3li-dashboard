/**
 * CRM Extended Types
 * Types for Quotes, Products, Campaigns, Clients, Sales Teams, Territories, and Analytics
 * Extends the base CRM types with advanced features
 */

import type { Lead, CrmActivity } from './crm'

// ═══════════════════════════════════════════════════════════════
// QUOTE TYPES
// ═══════════════════════════════════════════════════════════════

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'revised'

export type CustomerType = 'lead' | 'client'

export type DiscountType = 'percentage' | 'amount'

export interface QuoteSignature {
  signedAt: string
  signedBy: string
}

export interface QuoteLineItem {
  id: string
  productId?: string
  name: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  discountType: DiscountType
  taxRate: number
  total: number
  isOptional: boolean
  sortOrder: number
}

export interface Quote {
  id: string
  quoteId: string
  title: string
  titleAr?: string
  description?: string
  customerType: CustomerType
  customerId: string
  customerName: string
  status: QuoteStatus
  lineItems: QuoteLineItem[]
  subtotal: number
  discount: number
  discountType: DiscountType
  taxableAmount: number
  taxRate: number
  taxAmount: number
  grandTotal: number
  currency: string
  validUntil: string
  paymentTerms?: string
  termsAndConditions?: string
  internalNotes?: string
  requireSignature: boolean
  firmSignature?: QuoteSignature
  customerSignature?: QuoteSignature
  viewCount: number
  createdBy: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateQuoteData {
  title: string
  titleAr?: string
  description?: string
  customerType: CustomerType
  customerId: string
  lineItems: Omit<QuoteLineItem, 'id' | 'total'>[]
  discount?: number
  discountType?: DiscountType
  taxRate?: number
  currency?: string
  validUntil?: string
  paymentTerms?: string
  termsAndConditions?: string
  internalNotes?: string
  requireSignature?: boolean
}

export interface UpdateQuoteData extends Partial<CreateQuoteData> {
  status?: QuoteStatus
}

export interface QuoteFilters {
  status?: QuoteStatus
  customerType?: CustomerType
  customerId?: string
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT TYPES
// ═══════════════════════════════════════════════════════════════

export type ProductType =
  | 'service'
  | 'product'
  | 'subscription'
  | 'retainer'
  | 'hourly'

export type PriceType = 'fixed' | 'range' | 'custom'

export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly'

export interface ProductPricing {
  priceType: PriceType
  basePrice: number
  minPrice?: number
  maxPrice?: number
  currency: string
}

export interface ProductRecurring {
  interval: RecurringInterval
  trialDays?: number
  setupFee?: number
}

export interface ProductStatistics {
  timesSold: number
  totalRevenue: number
}

export interface Product {
  id: string
  code: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: ProductType
  category?: string
  practiceArea?: string
  pricing: ProductPricing
  unit: string
  taxRate: number
  taxInclusive: boolean
  recurring?: ProductRecurring
  isActive: boolean
  tags: string[]
  statistics: ProductStatistics
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  code?: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: ProductType
  category?: string
  practiceArea?: string
  pricing: ProductPricing
  unit: string
  taxRate?: number
  taxInclusive?: boolean
  recurring?: ProductRecurring
  isActive?: boolean
  tags?: string[]
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  type?: ProductType
  category?: string
  practiceArea?: string
  isActive?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN TYPES
// ═══════════════════════════════════════════════════════════════

export type CampaignType =
  | 'email'
  | 'social'
  | 'event'
  | 'referral'
  | 'ads'
  | 'other'

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'

export interface CampaignSchedule {
  startDate: string
  endDate?: string
  isRecurring?: boolean
}

export interface CampaignBudget {
  planned: number
  spent: number
  currency: string
}

export interface CampaignTargets {
  leads?: number
  conversions?: number
  revenue?: number
}

export interface CampaignTargetAudience {
  industries?: string[]
  regions?: string[]
  companySize?: string[]
}

export interface CampaignUtmParameters {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export interface CampaignStatistics {
  leadsGenerated: number
  leadsConverted: number
  revenueGenerated: number
  emailsSent?: number
  emailsOpened?: number
  emailsClicked?: number
  emailsBounced?: number
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  channel: string
  status: CampaignStatus
  description?: string
  schedule: CampaignSchedule
  budget: CampaignBudget
  targets: CampaignTargets
  targetAudience: CampaignTargetAudience
  utmParameters: CampaignUtmParameters
  statistics: CampaignStatistics
  ownerId: string
  owner: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignData {
  name: string
  type: CampaignType
  channel: string
  status?: CampaignStatus
  description?: string
  schedule: CampaignSchedule
  budget: CampaignBudget
  targets?: CampaignTargets
  targetAudience?: CampaignTargetAudience
  utmParameters?: CampaignUtmParameters
  ownerId?: string
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {}

export interface CampaignFilters {
  type?: CampaignType
  status?: CampaignStatus
  ownerId?: string
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// CONTACT EXTENDED TYPES
// ═══════════════════════════════════════════════════════════════

export type ConflictCheckStatus =
  | 'not_checked'
  | 'clear'
  | 'potential_conflict'
  | 'confirmed_conflict'

export type StakeholderInfluence = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type StakeholderSentiment = 'positive' | 'neutral' | 'negative'

export interface ContactConflictCheck {
  status: ConflictCheckStatus
  checkedAt?: string
  checkedBy?: {
    id: string
    name: string
  }
  notes?: string
}

export interface Stakeholder {
  id: string
  contactId: string
  contact: {
    id: string
    name: string
    email?: string
  }
  role: string
  influence: StakeholderInfluence
  sentiment: StakeholderSentiment
  lastEngagement?: string
}

export interface CreateStakeholderData {
  contactId: string
  role: string
  influence: StakeholderInfluence
  sentiment: StakeholderSentiment
  lastEngagement?: string
}

export interface UpdateStakeholderData extends Partial<CreateStakeholderData> {}

// ═══════════════════════════════════════════════════════════════
// CLIENT EXTENDED TYPES
// ═══════════════════════════════════════════════════════════════

export type ClientType = 'individual' | 'company'

export type ClientStatus = 'active' | 'inactive' | 'suspended'

export type BillingType = 'hourly' | 'flat_fee' | 'contingency' | 'retainer'

export type PaymentTerms =
  | 'immediate'
  | 'net_15'
  | 'net_30'
  | 'net_45'
  | 'net_60'

export type CreditStatus = 'good' | 'warning' | 'hold' | 'blacklisted'

export type InvoiceDelivery = 'email' | 'mail' | 'hand'

export type InvoiceLanguage = 'ar' | 'en' | 'both'

export interface ClientBilling {
  type: BillingType
  hourlyRate?: number
  currency: string
  paymentTerms: PaymentTerms
  creditLimit?: number
  creditUsed: number
  creditStatus: CreditStatus
}

export interface ClientDiscount {
  hasDiscount: boolean
  percent?: number
  reason?: string
}

export interface ClientInvoicePreferences {
  delivery: InvoiceDelivery
  language: InvoiceLanguage
}

export interface ClientVat {
  isRegistered: boolean
  vatNumber?: string
}

export interface ClientPowerOfAttorney {
  hasPOA: boolean
  poaNumber?: string
  attorneyName?: string
  issueDate?: string
  expiryDate?: string
  powers?: string[]
}

export interface ClientRelationship {
  source?: string
  territoryId?: string
  salesTeamId?: string
  accountManagerId?: string
  referredBy?: string
  acquisitionCost?: number
  firstPurchaseDate?: string
}

export interface Client {
  id: string
  clientNumber: string
  displayName: string
  clientType: ClientType
  status: ClientStatus
  email?: string
  phone?: string

  // Billing
  billing: ClientBilling
  discount?: ClientDiscount
  invoicePreferences: ClientInvoicePreferences
  vat?: ClientVat
  powerOfAttorney?: ClientPowerOfAttorney

  // Relationship
  relationship: ClientRelationship

  // VIP & Value
  isVIP: boolean
  lifetimeValue: number
  totalOutstanding: number

  // Cases
  totalCases: number
  activeCases: number

  // Meta
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  displayName: string
  clientType: ClientType
  email?: string
  phone?: string
  billing: ClientBilling
  discount?: ClientDiscount
  invoicePreferences: ClientInvoicePreferences
  vat?: ClientVat
  powerOfAttorney?: ClientPowerOfAttorney
  relationship?: Partial<ClientRelationship>
  isVIP?: boolean
  tags?: string[]
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: ClientStatus
}

export interface ClientFilters {
  clientType?: ClientType
  status?: ClientStatus
  isVIP?: boolean
  creditStatus?: CreditStatus
  territoryId?: string
  salesTeamId?: string
  accountManagerId?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// SALES TEAM & TERRITORY TYPES
// ═══════════════════════════════════════════════════════════════

export type TeamMemberRole = 'leader' | 'member'

export interface SalesTeamMember {
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  role: TeamMemberRole
  capacity?: number
}

export interface SalesTeamPerformance {
  totalRevenue: number
  totalDeals: number
}

export interface SalesTeam {
  id: string
  name: string
  description?: string
  members: SalesTeamMember[]
  leadCount: number
  performance?: SalesTeamPerformance
  isActive: boolean
}

export interface CreateSalesTeamData {
  name: string
  description?: string
  members?: Omit<SalesTeamMember, 'user'>[]
  isActive?: boolean
}

export interface UpdateSalesTeamData extends Partial<CreateSalesTeamData> {}

export interface Territory {
  id: string
  name: string
  nameAr?: string
  code: string
  parentId?: string
  children?: Territory[]
  regions?: string[]
  cities?: string[]
  assignedUserId?: string
  assignedTeamId?: string
  isActive: boolean
}

export interface CreateTerritoryData {
  name: string
  nameAr?: string
  code: string
  parentId?: string
  regions?: string[]
  cities?: string[]
  assignedUserId?: string
  assignedTeamId?: string
  isActive?: boolean
}

export interface UpdateTerritoryData extends Partial<CreateTerritoryData> {}

// ═══════════════════════════════════════════════════════════════
// LOST REASON & TAG TYPES
// ═══════════════════════════════════════════════════════════════

export interface LostReason {
  id: string
  name: string
  nameAr?: string
  category: string
  usageCount: number
  sortOrder: number
  isActive: boolean
}

export interface CreateLostReasonData {
  name: string
  nameAr?: string
  category: string
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateLostReasonData extends Partial<CreateLostReasonData> {}

export type CrmTagEntityType = 'lead' | 'contact' | 'client' | 'campaign' | 'all'

export interface CrmTag {
  id: string
  name: string
  color: string
  entityType: CrmTagEntityType
  usageCount: number
}

export interface CreateCrmTagData {
  name: string
  color: string
  entityType: CrmTagEntityType
}

export interface UpdateCrmTagData extends Partial<CreateCrmTagData> {}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════

export interface LeadDashboardStats {
  total: number
  won: number
  lost: number
  bySource: Array<{
    source: string
    count: number
  }>
  recent: Lead[]
}

export interface PipelineDashboardStats {
  totalValue: number
  weightedValue: number
  avgDealSize: number
  byStage: Array<{
    stage: string
    value: number
    count: number
    color: string
  }>
}

export interface ConversionStats {
  conversionRate: number
  avgSalesCycleDays: number
}

export interface ActivityStats {
  dueToday: CrmActivity[]
  overdue: number
}

export interface CrmDashboardData {
  leads: LeadDashboardStats
  pipeline: PipelineDashboardStats
  conversion: ConversionStats
  activities: ActivityStats
}

export interface SalesFunnelStage {
  name: string
  count: number
  value: number
  conversionRate: number
}

export interface SalesFunnel {
  stages: SalesFunnelStage[]
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  deals: number
}

export interface TopPerformer {
  userId: string
  userName: string
  revenue: number
  deals: number
  conversionRate: number
}

export interface CrmAnalytics {
  funnel: SalesFunnel
  revenueByPeriod: RevenueByPeriod[]
  topPerformers: TopPerformer[]
  leadsBySource: Array<{
    source: string
    count: number
    conversionRate: number
  }>
  campaignPerformance: Array<{
    campaignId: string
    campaignName: string
    leads: number
    conversions: number
    roi: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ═══════════════════════════════════════════════════════════════
// RE-EXPORTS
// ═══════════════════════════════════════════════════════════════

export type {
  Lead,
  CrmActivity,
} from './crm'
