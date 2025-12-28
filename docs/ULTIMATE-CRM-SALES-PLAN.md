# Ultimate CRM/Sales Enhancement Plan
## Making CRM/Sales Match Finance Module Excellence

**Goal**: Solo lawyers see simple → Large firms see advanced → Everyone is happy

---

## Executive Summary

### The Problem
| Module | Solo Lawyer Experience | Large Firm Experience |
|--------|----------------------|----------------------|
| **Finance** ✅ | Simple 5-field invoice | Full approval workflows |
| **CRM/Sales** ❌ | Overwhelmed by 40+ fields | Missing enterprise features |

### The Solution: 4-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER DETECTION                           │
│  Solo Lawyer → Simple │ Team Lead → Manager │ Owner → Exec │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Heavy Lifting)                     │
│  • Single consolidated endpoints (10 calls → 1)             │
│  • Tier-aware data aggregation                              │
│  • 5-minute response caching                                │
│  • Role-based data filtering                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (Smart Display)                    │
│  • Office Type Selector (solo/small/medium/large)           │
│  • Progressive Disclosure (collapsible sections)            │
│  • Aggregated Hooks (useLeadsWithAnalytics)                 │
│  • Conditional Field Rendering                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend Implementation

### Phase B1: Consolidated Dashboard Controllers

#### File: `src/controllers/salesDashboard.controller.js`

```javascript
const SalesDashboardService = require('../services/salesDashboard.service');

/**
 * Single endpoint replaces 10+ separate API calls
 * Returns tier-appropriate data based on user role
 */
exports.getSalesOverview = async (req, res) => {
  try {
    const tier = determineTier(req.user, req.firmQuery);
    const period = req.query.period || 'this_month';
    const teamId = req.query.teamId || null;

    // One Promise.all replaces multiple frontend calls
    const [pipeline, quota, team, alerts, forecast] = await Promise.all([
      SalesDashboardService.getPipelineData(req.firmQuery, tier, period),
      SalesDashboardService.getQuotaProgress(req.firmQuery, tier, period),
      tier !== 'simple' ? SalesDashboardService.getTeamStats(req.firmQuery, tier, teamId) : null,
      SalesDashboardService.getAlerts(req.firmQuery, tier),
      tier === 'executive' ? SalesDashboardService.getForecast(req.firmQuery, period) : null,
    ]);

    res.json({
      success: true,
      data: {
        tier,
        period,
        pipeline,
        quota,
        team,
        alerts,
        forecast,
        // Metadata for frontend
        availableTiers: getAvailableTiers(req.user),
        canSwitchTier: true,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Smart tier detection based on user role and firm structure
 */
function determineTier(user, firmQuery) {
  // Solo lawyer = always simple by default
  if (firmQuery.lawyerId && !firmQuery.firmId) return 'simple';

  // Check user's role in firm
  const role = user.firmRole || 'member';

  switch(role) {
    case 'owner':
    case 'partner':
    case 'managing_partner':
      return 'executive';
    case 'admin':
    case 'operations_manager':
      return 'operations';
    case 'team_lead':
    case 'senior_associate':
    case 'manager':
      return 'manager';
    default:
      return 'simple';
  }
}
```

#### File: `src/controllers/crmDashboard.controller.js`

```javascript
const CrmDashboardService = require('../services/crmDashboard.service');

exports.getCrmOverview = async (req, res) => {
  try {
    const tier = determineTier(req.user, req.firmQuery);
    const period = req.query.period || 'this_month';

    const [leads, deals, activities, conversion, dataQuality] = await Promise.all([
      CrmDashboardService.getLeadStats(req.firmQuery, tier, period),
      CrmDashboardService.getDealHealth(req.firmQuery, tier, period),
      CrmDashboardService.getActivitySummary(req.firmQuery, tier, period),
      CrmDashboardService.getConversionMetrics(req.firmQuery, tier, period),
      tier === 'operations' ? CrmDashboardService.getDataQuality(req.firmQuery) : null,
    ]);

    res.json({
      success: true,
      data: {
        tier,
        period,
        leads,
        deals,
        activities,
        conversion,
        dataQuality,
        availableTiers: getAvailableTiers(req.user),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

### Phase B2: Tiered Aggregation Services

#### File: `src/services/salesDashboard.service.js`

```javascript
const Lead = require('../models/lead.model');
const Quote = require('../models/quote.model');
const Order = require('../models/order.model');

class SalesDashboardService {

  /**
   * Pipeline data - complexity varies by tier
   */
  static async getPipelineData(firmQuery, tier, period) {
    const dateFilter = getDateFilter(period);

    // Base aggregation for all tiers
    const basePipeline = [
      { $match: { ...firmQuery, ...dateFilter } },
      { $group: {
        _id: '$stage',
        count: { $sum: 1 },
        value: { $sum: '$estimatedValue' }
      }}
    ];

    const stageData = await Lead.aggregate(basePipeline);

    // SIMPLE tier: Just counts and total
    if (tier === 'simple') {
      return {
        stages: stageData,
        total: stageData.reduce((sum, s) => sum + s.count, 0),
        totalValue: stageData.reduce((sum, s) => sum + s.value, 0),
      };
    }

    // MANAGER tier: Add team breakdown
    if (tier === 'manager') {
      const teamBreakdown = await Lead.aggregate([
        { $match: { ...firmQuery, ...dateFilter } },
        { $group: {
          _id: { stage: '$stage', assignedTo: '$assignedTo' },
          count: { $sum: 1 },
          value: { $sum: '$estimatedValue' }
        }},
        { $lookup: {
          from: 'users',
          localField: '_id.assignedTo',
          foreignField: '_id',
          as: 'assignee'
        }}
      ]);

      return {
        stages: stageData,
        total: stageData.reduce((sum, s) => sum + s.count, 0),
        totalValue: stageData.reduce((sum, s) => sum + s.value, 0),
        byTeamMember: teamBreakdown,
        stuckDeals: await this.getStuckDeals(firmQuery, 14), // Deals stuck > 14 days
      };
    }

    // EXECUTIVE tier: Add forecasting, comparison, trends
    if (tier === 'executive') {
      const [teamComparison, forecast, trends] = await Promise.all([
        this.getTeamComparison(firmQuery, period),
        this.getForecast(firmQuery, period),
        this.getTrends(firmQuery, period),
      ]);

      return {
        stages: stageData,
        total: stageData.reduce((sum, s) => sum + s.count, 0),
        totalValue: stageData.reduce((sum, s) => sum + s.value, 0),
        teamComparison,
        forecast,
        trends,
        winRate: await this.calculateWinRate(firmQuery, period),
        avgDealCycle: await this.calculateAvgCycle(firmQuery, period),
      };
    }

    // OPERATIONS tier: Add data quality metrics
    return {
      stages: stageData,
      total: stageData.reduce((sum, s) => sum + s.count, 0),
      totalValue: stageData.reduce((sum, s) => sum + s.value, 0),
      dataQuality: await this.getDataQualityMetrics(firmQuery),
      staleRecords: await this.getStaleRecords(firmQuery, 30),
      duplicates: await this.getPotentialDuplicates(firmQuery),
    };
  }

  /**
   * Quota progress - varies by tier
   */
  static async getQuotaProgress(firmQuery, tier, period) {
    // SIMPLE: Just my personal progress
    if (tier === 'simple') {
      return {
        target: 50000,  // From user settings
        achieved: await this.getAchieved(firmQuery, period),
        percentage: 0,  // Calculated
      };
    }

    // MANAGER: Team quota progress
    if (tier === 'manager') {
      const teamMembers = await this.getTeamMembers(firmQuery);
      const memberProgress = await Promise.all(
        teamMembers.map(m => this.getMemberQuotaProgress(m._id, period))
      );

      return {
        teamTarget: teamMembers.reduce((sum, m) => sum + (m.quota || 0), 0),
        teamAchieved: memberProgress.reduce((sum, p) => sum + p.achieved, 0),
        members: memberProgress,
        behindTarget: memberProgress.filter(p => p.percentage < 50),
      };
    }

    // EXECUTIVE: All teams comparison
    const teams = await this.getAllTeams(firmQuery);
    const teamProgress = await Promise.all(
      teams.map(t => this.getTeamQuotaProgress(t._id, period))
    );

    return {
      firmTarget: teams.reduce((sum, t) => sum + (t.quota || 0), 0),
      firmAchieved: teamProgress.reduce((sum, p) => sum + p.achieved, 0),
      teams: teamProgress,
      forecastAccuracy: await this.getForecastAccuracy(firmQuery, period),
    };
  }

  // ... Additional service methods
}

module.exports = SalesDashboardService;
```

---

### Phase B3: Models for Configuration

#### File: `src/models/dashboardSettings.model.js`

```javascript
const mongoose = require('mongoose');

const dashboardSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm' },
  module: { type: String, enum: ['sales', 'crm'], required: true },

  // Tier configuration
  tier: {
    type: String,
    enum: ['simple', 'manager', 'executive', 'operations'],
    default: 'simple'
  },
  autoDetectTier: { type: Boolean, default: true },

  // Office type for form complexity
  officeType: {
    type: String,
    enum: ['solo', 'small', 'medium', 'large'],
    default: 'solo'
  },

  // Widget preferences
  widgets: [{
    id: String,
    position: Number,
    visible: { type: Boolean, default: true },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  }],

  // Default filters
  defaultPeriod: { type: String, default: 'this_month' },
  defaultTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },

  // Feature toggles (for progressive disclosure)
  features: {
    showAdvancedFilters: { type: Boolean, default: false },
    showTeamMetrics: { type: Boolean, default: false },
    showForecasting: { type: Boolean, default: false },
    showDataQuality: { type: Boolean, default: false },
  }
}, { timestamps: true });

// Index for quick lookups
dashboardSettingsSchema.index({ userId: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('DashboardSettings', dashboardSettingsSchema);
```

#### File: `src/models/salesSetup.model.js`

```javascript
const mongoose = require('mongoose');

const salesSetupSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firm' },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Wizard completion status
  setupCompleted: { type: Boolean, default: false },
  currentStep: { type: Number, default: 1 },

  // Step 1: Practice Type
  practiceType: {
    type: String,
    enum: ['solo', 'small_firm', 'medium_firm', 'large_firm'],
    default: 'solo'
  },

  // Step 2: Team Configuration
  hasTeams: { type: Boolean, default: false },
  teams: [{
    name: String,
    leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    quota: Number,
  }],

  // Step 3: Pipeline Configuration
  pipelineStages: [{
    name: String,
    nameAr: String,
    order: Number,
    probability: Number,  // Win probability at this stage
    autoActions: [{
      type: String,
      config: mongoose.Schema.Types.Mixed
    }]
  }],

  // Step 4: Quota Configuration
  quotaEnabled: { type: Boolean, default: false },
  quotaPeriod: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  quotaTargets: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target: Number,
    currency: { type: String, default: 'SAR' }
  }],

  // Step 5: Approval Workflows
  approvalWorkflows: {
    quoteApproval: {
      enabled: { type: Boolean, default: false },
      thresholds: [{
        minAmount: Number,
        maxAmount: Number,
        approverRole: String,
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }]
    },
    discountApproval: {
      enabled: { type: Boolean, default: false },
      maxDiscountPercent: { type: Number, default: 10 },
      approverRole: String
    }
  },

  // Step 6: Integration Settings
  integrations: {
    invoiceAutoCreate: { type: Boolean, default: true },  // Auto-create invoice on deal won
    emailTracking: { type: Boolean, default: true },
    calendarSync: { type: Boolean, default: true }
  }

}, { timestamps: true });

module.exports = mongoose.model('SalesSetup', salesSetupSchema);
```

---

### Phase B4: API Routes with Caching

#### File: `src/routes/salesDashboard.route.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, firmQuery } = require('../middleware/auth');
const { cacheResponse } = require('../middleware/cache');
const SalesDashboardController = require('../controllers/salesDashboard.controller');

// Cache key generator
const dashboardCacheKey = (type) => (req) =>
  `sales:dashboard:${type}:${req.firmQuery.firmId || req.firmQuery.lawyerId}:${req.query.period || 'this_month'}`;

// Main overview endpoint (replaces 10+ calls)
router.get('/overview',
  protect,
  firmQuery,
  cacheResponse(300, dashboardCacheKey('overview')),  // 5 min cache
  SalesDashboardController.getSalesOverview
);

// Individual endpoints for specific needs
router.get('/pipeline',
  protect,
  firmQuery,
  cacheResponse(300, dashboardCacheKey('pipeline')),
  SalesDashboardController.getPipelineData
);

router.get('/quota',
  protect,
  firmQuery,
  cacheResponse(300, dashboardCacheKey('quota')),
  SalesDashboardController.getQuotaProgress
);

router.get('/alerts',
  protect,
  firmQuery,
  cacheResponse(60, dashboardCacheKey('alerts')),  // 1 min cache for alerts
  SalesDashboardController.getAlerts
);

router.get('/forecast',
  protect,
  firmQuery,
  cacheResponse(900, dashboardCacheKey('forecast')),  // 15 min cache for forecast
  SalesDashboardController.getForecast
);

// Settings endpoints
router.get('/settings',
  protect,
  firmQuery,
  SalesDashboardController.getDashboardSettings
);

router.put('/settings',
  protect,
  firmQuery,
  SalesDashboardController.updateDashboardSettings
);

// Setup wizard
router.get('/setup',
  protect,
  firmQuery,
  SalesDashboardController.getSetupStatus
);

router.put('/setup',
  protect,
  firmQuery,
  SalesDashboardController.updateSetup
);

module.exports = router;
```

---

## Part 2: Frontend Implementation

### Phase F1: New Aggregated Hooks

#### File: `src/hooks/useSalesDashboard.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type DashboardTier = 'simple' | 'manager' | 'executive' | 'operations';
export type OfficeType = 'solo' | 'small' | 'medium' | 'large';

export interface SalesOverviewData {
  tier: DashboardTier;
  period: string;
  pipeline: PipelineData;
  quota: QuotaData;
  team: TeamData | null;
  alerts: AlertData[];
  forecast: ForecastData | null;
  availableTiers: DashboardTier[];
  canSwitchTier: boolean;
}

export interface PipelineData {
  stages: { _id: string; count: number; value: number }[];
  total: number;
  totalValue: number;
  byTeamMember?: any[];  // Manager tier
  teamComparison?: any[];  // Executive tier
  winRate?: number;
  avgDealCycle?: number;
}

export interface QuotaData {
  target: number;
  achieved: number;
  percentage: number;
  // Manager tier
  teamTarget?: number;
  teamAchieved?: number;
  members?: any[];
  behindTarget?: any[];
  // Executive tier
  firmTarget?: number;
  firmAchieved?: number;
  teams?: any[];
}

export interface DashboardSettings {
  tier: DashboardTier;
  autoDetectTier: boolean;
  officeType: OfficeType;
  widgets: WidgetConfig[];
  defaultPeriod: string;
  features: {
    showAdvancedFilters: boolean;
    showTeamMetrics: boolean;
    showForecasting: boolean;
    showDataQuality: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN HOOK: Single call for entire dashboard
// ═══════════════════════════════════════════════════════════════

/**
 * Main dashboard hook - replaces 10+ separate API calls
 * Returns tier-appropriate data based on user role
 */
export const useSalesOverview = (options?: {
  period?: string;
  tier?: DashboardTier;  // Override auto-detection
  teamId?: string;
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<SalesOverviewData>({
    queryKey: ['sales', 'dashboard', 'overview', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.period) params.append('period', options.period);
      if (options?.tier) params.append('tier', options.tier);
      if (options?.teamId) params.append('teamId', options.teamId);

      const response = await apiClient.get(`/sales/dashboard/overview?${params}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes (matches backend cache)
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
  });
};

// ═══════════════════════════════════════════════════════════════
// DASHBOARD SETTINGS HOOKS
// ═══════════════════════════════════════════════════════════════

export const useDashboardSettings = (module: 'sales' | 'crm') => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<DashboardSettings>({
    queryKey: ['dashboard', 'settings', module],
    queryFn: async () => {
      const response = await apiClient.get(`/${module}/dashboard/settings`);
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000,  // 30 minutes
    enabled: isAuthenticated,
  });
};

export const useUpdateDashboardSettings = (module: 'sales' | 'crm') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<DashboardSettings>) => {
      const response = await apiClient.put(`/${module}/dashboard/settings`, settings);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'settings', module] });
      queryClient.invalidateQueries({ queryKey: [module, 'dashboard'] });
    },
  });
};

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE HOOKS (use main hook internally)
// ═══════════════════════════════════════════════════════════════

/**
 * Just pipeline data - extracts from main overview
 */
export const usePipelineData = (period?: string) => {
  const { data, ...rest } = useSalesOverview({ period });
  return { data: data?.pipeline, ...rest };
};

/**
 * Just quota data - extracts from main overview
 */
export const useQuotaProgress = (period?: string) => {
  const { data, ...rest } = useSalesOverview({ period });
  return { data: data?.quota, ...rest };
};

/**
 * Just alerts - extracts from main overview
 */
export const useSalesAlerts = () => {
  const { data, ...rest } = useSalesOverview();
  return { data: data?.alerts, ...rest };
};
```

#### File: `src/hooks/useCrmDashboard.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export interface CrmOverviewData {
  tier: DashboardTier;
  period: string;
  leads: LeadStatsData;
  deals: DealHealthData;
  activities: ActivitySummaryData;
  conversion: ConversionData;
  dataQuality: DataQualityData | null;  // Operations tier only
  availableTiers: DashboardTier[];
}

export interface LeadStatsData {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  newThisPeriod: number;
  // Manager tier
  byAssignee?: { userId: string; name: string; count: number }[];
  // Executive tier
  trends?: { date: string; count: number }[];
}

export interface DealHealthData {
  active: number;
  closingSoon: number;  // Within 7 days
  stuck: number;  // No activity > 14 days
  atRisk: number;  // Probability dropped
  // Executive tier
  byTeam?: { teamId: string; name: string; count: number; value: number }[];
}

/**
 * Main CRM dashboard hook - replaces multiple API calls
 */
export const useCrmOverview = (options?: {
  period?: string;
  tier?: DashboardTier;
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<CrmOverviewData>({
    queryKey: ['crm', 'dashboard', 'overview', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.period) params.append('period', options.period);
      if (options?.tier) params.append('tier', options.tier);

      const response = await apiClient.get(`/crm/dashboard/overview?${params}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
  });
};

// Convenience hooks
export const useLeadStats = (period?: string) => {
  const { data, ...rest } = useCrmOverview({ period });
  return { data: data?.leads, ...rest };
};

export const useDealHealth = (period?: string) => {
  const { data, ...rest } = useCrmOverview({ period });
  return { data: data?.deals, ...rest };
};

export const useActivitySummary = (period?: string) => {
  const { data, ...rest } = useCrmOverview({ period });
  return { data: data?.activities, ...rest };
};
```

---

### Phase F2: Office Type Selector Component

#### File: `src/components/office-type-selector.tsx`

```typescript
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { User, Users, Building, Building2 } from 'lucide-react';

export type OfficeType = 'solo' | 'small' | 'medium' | 'large';

interface OfficeTypeSelectorProps {
  value: OfficeType;
  onChange: (value: OfficeType) => void;
  className?: string;
}

const officeTypes = [
  {
    value: 'solo' as const,
    labelAr: 'محامي فردي',
    labelEn: 'Solo Lawyer',
    descriptionAr: 'ممارسة فردية',
    descriptionEn: 'Individual practice',
    icon: User,
  },
  {
    value: 'small' as const,
    labelAr: 'مكتب صغير',
    labelEn: 'Small Office',
    descriptionAr: '2-10 موظفين',
    descriptionEn: '2-10 employees',
    icon: Users,
  },
  {
    value: 'medium' as const,
    labelAr: 'شركة متوسطة',
    labelEn: 'Medium Firm',
    descriptionAr: '11-50 موظفاً',
    descriptionEn: '11-50 employees',
    icon: Building,
  },
  {
    value: 'large' as const,
    labelAr: 'شركة كبيرة',
    labelEn: 'Large Firm',
    descriptionAr: '50+ موظفاً',
    descriptionEn: '50+ employees',
    icon: Building2,
  },
];

export function OfficeTypeSelector({ value, onChange, className }: OfficeTypeSelectorProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {officeTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
              isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-3',
              isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm">
              {isRTL ? type.labelAr : type.labelEn}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              {isRTL ? type.descriptionAr : type.descriptionEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

---

### Phase F3: Tiered Dashboard Views

#### File: `src/features/sales/views/sales-dashboard-view.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSalesOverview, useDashboardSettings } from '@/hooks/useSalesDashboard';

// Import tier-specific components
import { SimpleDashboard } from './tiers/simple-dashboard';
import { ManagerDashboard } from './tiers/manager-dashboard';
import { ExecutiveDashboard } from './tiers/executive-dashboard';
import { OperationsDashboard } from './tiers/operations-dashboard';

// Import common components
import { DashboardHeader } from '../components/dashboard-header';
import { TierSwitcher } from '../components/tier-switcher';
import { PeriodSelector } from '../components/period-selector';
import { DashboardSkeleton } from '../components/dashboard-skeleton';

export default function SalesDashboardView() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [period, setPeriod] = useState('this_month');
  const [overrideTier, setOverrideTier] = useState<DashboardTier | null>(null);

  const { data: settings } = useDashboardSettings('sales');
  const { data, isLoading, error } = useSalesOverview({
    period,
    tier: overrideTier || undefined
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div>Error loading dashboard</div>;
  if (!data) return null;

  const { tier, availableTiers, canSwitchTier } = data;

  // Render tier-appropriate dashboard
  const renderDashboard = () => {
    switch (tier) {
      case 'simple':
        return <SimpleDashboard data={data} period={period} />;
      case 'manager':
        return <ManagerDashboard data={data} period={period} />;
      case 'executive':
        return <ExecutiveDashboard data={data} period={period} />;
      case 'operations':
        return <OperationsDashboard data={data} period={period} />;
      default:
        return <SimpleDashboard data={data} period={period} />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title={isRTL ? 'لوحة المبيعات' : 'Sales Dashboard'}
        subtitle={isRTL ? 'نظرة عامة على أداء المبيعات' : 'Overview of sales performance'}
      >
        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} />
          {canSwitchTier && (
            <TierSwitcher
              currentTier={tier}
              availableTiers={availableTiers}
              onChange={setOverrideTier}
            />
          )}
        </div>
      </DashboardHeader>

      {renderDashboard()}
    </div>
  );
}
```

#### File: `src/features/sales/views/tiers/simple-dashboard.tsx`

```typescript
/**
 * SIMPLE TIER DASHBOARD
 * For: Solo lawyers, new users, small practices
 * Shows: 4 key stats, simple kanban, today's tasks
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, DollarSign, CheckSquare } from 'lucide-react';
import { SalesOverviewData } from '@/hooks/useSalesDashboard';
import { SimplePipelineKanban } from '../../components/simple-pipeline-kanban';
import { TodaysTasks } from '../../components/todays-tasks';

interface SimpleDashboardProps {
  data: SalesOverviewData;
  period: string;
}

export function SimpleDashboard({ data, period }: SimpleDashboardProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats = [
    {
      label: isRTL ? 'العملاء المحتملين' : 'Active Leads',
      value: data.pipeline.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: isRTL ? 'في المسار' : 'In Pipeline',
      value: data.pipeline.stages.filter(s => s._id !== 'won' && s._id !== 'lost').length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: isRTL ? 'القيمة المتوقعة' : 'Expected Revenue',
      value: new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
        style: 'currency',
        currency: 'SAR',
        notation: 'compact',
      }).format(data.pipeline.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: isRTL ? 'مهام اليوم' : 'Tasks Today',
      value: data.alerts.filter(a => a.type === 'task_due').length,
      icon: CheckSquare,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats - 4 cards only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Pipeline View */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'مسار المبيعات' : 'My Pipeline'}</CardTitle>
        </CardHeader>
        <CardContent>
          <SimplePipelineKanban stages={data.pipeline.stages} />
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'مهام اليوم' : "Today's Tasks"}</CardTitle>
        </CardHeader>
        <CardContent>
          <TodaysTasks alerts={data.alerts} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### File: `src/features/sales/views/tiers/manager-dashboard.tsx`

```typescript
/**
 * MANAGER TIER DASHBOARD
 * For: Team leads, practice managers
 * Shows: Team performance, quota progress, leaderboard, attention alerts
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { SalesOverviewData } from '@/hooks/useSalesDashboard';
import { TeamPipelineChart } from '../../components/team-pipeline-chart';
import { QuotaProgressBar } from '../../components/quota-progress-bar';
import { TeamLeaderboard } from '../../components/team-leaderboard';
import { AttentionAlerts } from '../../components/attention-alerts';

interface ManagerDashboardProps {
  data: SalesOverviewData;
  period: string;
}

export function ManagerDashboard({ data, period }: ManagerDashboardProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      {/* Team Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'مسار الفريق' : 'Team Pipeline'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
                style: 'currency',
                currency: 'SAR',
                notation: 'compact',
              }).format(data.pipeline.totalValue)}
            </div>
            <p className="text-sm text-muted-foreground">
              {data.pipeline.total} {isRTL ? 'صفقة نشطة' : 'active deals'}
            </p>
            <TeamPipelineChart data={data.pipeline.byTeamMember} />
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'ترتيب الفريق' : 'Team Leaderboard'}</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamLeaderboard members={data.quota?.members || []} />
          </CardContent>
        </Card>
      </div>

      {/* Quota Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'تقدم الحصة' : 'Quota Progress'}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotaProgressBar
            target={data.quota?.teamTarget || 0}
            achieved={data.quota?.teamAchieved || 0}
            members={data.quota?.members || []}
          />
        </CardContent>
      </Card>

      {/* Attention Needed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {isRTL ? 'يحتاج انتباه' : 'Attention Needed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttentionAlerts
            stuckDeals={data.pipeline.stuckDeals}
            behindTarget={data.quota?.behindTarget}
            alerts={data.alerts}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### File: `src/features/sales/views/tiers/executive-dashboard.tsx`

```typescript
/**
 * EXECUTIVE TIER DASHBOARD
 * For: Firm owners, partners, C-level
 * Shows: Firm overview, team comparison, forecast, top performers
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { SalesOverviewData } from '@/hooks/useSalesDashboard';
import { FirmOverviewStats } from '../../components/firm-overview-stats';
import { TeamComparisonChart } from '../../components/team-comparison-chart';
import { ForecastChart } from '../../components/forecast-chart';
import { TopPerformersWidget } from '../../components/top-performers-widget';
import { AtRiskWidget } from '../../components/at-risk-widget';

interface ExecutiveDashboardProps {
  data: SalesOverviewData;
  period: string;
}

export function ExecutiveDashboard({ data, period }: ExecutiveDashboardProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      {/* Firm Overview */}
      <FirmOverviewStats
        revenue={data.pipeline.totalValue}
        winRate={data.pipeline.winRate}
        avgDealCycle={data.pipeline.avgDealCycle}
        pipeline={data.pipeline}
      />

      {/* Team Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'مقارنة الفرق' : 'Team Comparison'}</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamComparisonChart teams={data.quota?.teams || []} />
        </CardContent>
      </Card>

      {/* Forecast vs Actual */}
      {data.forecast && (
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'التوقعات مقابل الفعلي' : 'Forecast vs Actual'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart
              forecast={data.forecast.predicted}
              actual={data.forecast.actual}
              accuracy={data.forecast.accuracy}
            />
          </CardContent>
        </Card>
      )}

      {/* Top Performers & At Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopPerformersWidget data={data.quota?.teams || []} />
        <AtRiskWidget alerts={data.alerts} />
      </div>
    </div>
  );
}
```

---

### Phase F4: Progressive Disclosure in Forms

#### File: `src/features/crm/views/create-lead-view-tiered.tsx`

```typescript
/**
 * TIERED LEAD CREATION FORM
 * Adapts complexity based on office type
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Components
import { OfficeTypeSelector, OfficeType } from '@/components/office-type-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronDown } from 'lucide-react';

// Schema adapts based on office type
const getSchema = (officeType: OfficeType) => {
  const base = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(1),
    source: z.string().optional(),
    notes: z.string().optional(),
  });

  if (officeType === 'solo') return base;

  // Add firm-specific fields
  return base.extend({
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    ...(officeType !== 'small' && {
      territoryId: z.string().optional(),
      teamId: z.string().optional(),
    }),
    ...(officeType === 'large' && {
      accountValue: z.number().optional(),
      salesRepId: z.string().optional(),
      departmentId: z.string().optional(),
    }),
  });
};

export default function CreateLeadViewTiered() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Office type controls form complexity
  const [officeType, setOfficeType] = useState<OfficeType>('solo');

  // Collapsible section states
  const [showCompany, setShowCompany] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const schema = getSchema(officeType);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      source: '',
      notes: '',
    },
  });

  const onSubmit = (data: any) => {
    // Payload changes based on office type
    const payload = {
      ...data,
      // Only include firm-specific fields if not solo
      ...(officeType !== 'solo' && {
        company: data.company,
        jobTitle: data.jobTitle,
      }),
      // Only include team fields for medium+ firms
      ...(officeType !== 'solo' && officeType !== 'small' && {
        territoryId: data.territoryId,
        teamId: data.teamId,
      }),
      // Only include enterprise fields for large firms
      ...(officeType === 'large' && {
        accountValue: data.accountValue,
        salesRepId: data.salesRepId,
        departmentId: data.departmentId,
      }),
    };

    console.log('Submitting:', payload);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Office Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isRTL ? 'نوع المكتب' : 'Office Type'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OfficeTypeSelector value={officeType} onChange={setOfficeType} />
          <p className="text-sm text-muted-foreground mt-4">
            {isRTL
              ? 'اختيار نوع المكتب يحدد الحقول المعروضة. يمكنك تغييره لاحقاً.'
              : 'Office type determines which fields are shown. You can change this later.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Main Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 space-y-6">

            {/* ALWAYS VISIBLE: Core Fields */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={isRTL ? 'الاسم الأول' : 'First Name'}
                  {...form.register('firstName')}
                  required
                />
                <Input
                  label={isRTL ? 'اسم العائلة' : 'Last Name'}
                  {...form.register('lastName')}
                  required
                />
                <Input
                  label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  type="email"
                  {...form.register('email')}
                />
                <Input
                  label={isRTL ? 'رقم الهاتف' : 'Phone'}
                  {...form.register('phone')}
                  required
                />
              </div>
            </div>

            {/* COLLAPSIBLE: Company Details (not for solo) */}
            {officeType !== 'solo' && (
              <Collapsible open={showCompany} onOpenChange={setShowCompany}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b">
                  <span className="font-semibold">
                    {isRTL ? 'معلومات الشركة' : 'Company Details'}
                  </span>
                  <ChevronDown className={cn(
                    'w-5 h-5 transition-transform',
                    showCompany && 'rotate-180'
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={isRTL ? 'اسم الشركة' : 'Company Name'}
                      {...form.register('company')}
                    />
                    <Input
                      label={isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                      {...form.register('jobTitle')}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* COLLAPSIBLE: Team Assignment (medium+ firms) */}
            {(officeType === 'medium' || officeType === 'large') && (
              <Collapsible open={showTeam} onOpenChange={setShowTeam}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b">
                  <span className="font-semibold">
                    {isRTL ? 'تعيين الفريق' : 'Team Assignment'}
                  </span>
                  <ChevronDown className={cn(
                    'w-5 h-5 transition-transform',
                    showTeam && 'rotate-180'
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={isRTL ? 'المنطقة' : 'Territory'}
                      {...form.register('territoryId')}
                    />
                    <Input
                      label={isRTL ? 'الفريق' : 'Team'}
                      {...form.register('teamId')}
                    />
                    {officeType === 'large' && (
                      <>
                        <Input
                          label={isRTL ? 'مندوب المبيعات' : 'Sales Rep'}
                          {...form.register('salesRepId')}
                        />
                        <Input
                          label={isRTL ? 'القسم' : 'Department'}
                          {...form.register('departmentId')}
                        />
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* ACCORDION: Advanced Settings */}
            <Accordion type="single" collapsible>
              <AccordionItem value="qualification">
                <AccordionTrigger>
                  {isRTL ? 'التأهيل (BANT)' : 'Qualification (BANT)'}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* BANT fields here */}
                </AccordionContent>
              </AccordionItem>

              {officeType === 'large' && (
                <AccordionItem value="enterprise">
                  <AccordionTrigger>
                    {isRTL ? 'إعدادات المؤسسة' : 'Enterprise Settings'}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <Input
                      label={isRTL ? 'قيمة الحساب' : 'Account Value'}
                      type="number"
                      {...form.register('accountValue')}
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" size="lg">
                {isRTL ? 'إنشاء العميل المحتمل' : 'Create Lead'}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
```

---

## Part 3: Implementation Checklist

### Backend Tasks

| Phase | Task | Priority | Status |
|-------|------|----------|--------|
| B1 | Create `salesDashboard.controller.js` | P1 | ⬜ |
| B1 | Create `crmDashboard.controller.js` | P1 | ⬜ |
| B2 | Create `salesDashboard.service.js` with tiered aggregation | P1 | ⬜ |
| B2 | Create `crmDashboard.service.js` with tiered aggregation | P1 | ⬜ |
| B3 | Create `dashboardSettings.model.js` | P2 | ⬜ |
| B3 | Create `salesSetup.model.js` | P2 | ⬜ |
| B3 | Create `crmSetup.model.js` | P2 | ⬜ |
| B4 | Create routes with caching middleware | P1 | ⬜ |
| B4 | Implement `determineTier()` function | P1 | ⬜ |
| B5 | Add response caching (5-min TTL) | P2 | ⬜ |
| B6 | Create setup wizard endpoints | P3 | ⬜ |

### Frontend Tasks

| Phase | Task | Priority | Status |
|-------|------|----------|--------|
| F1 | Create `useSalesDashboard.ts` hook | P1 | ⬜ |
| F1 | Create `useCrmDashboard.ts` hook | P1 | ⬜ |
| F2 | Create `OfficeTypeSelector` component | P1 | ⬜ |
| F3 | Create `SimpleDashboard` view | P1 | ⬜ |
| F3 | Create `ManagerDashboard` view | P1 | ⬜ |
| F3 | Create `ExecutiveDashboard` view | P2 | ⬜ |
| F3 | Create `OperationsDashboard` view | P2 | ⬜ |
| F4 | Update Create Lead form with office type | P1 | ⬜ |
| F4 | Update Create Quote form with office type | P1 | ⬜ |
| F4 | Update Create Campaign form with office type | P2 | ⬜ |
| F5 | Add progressive disclosure to all forms | P2 | ⬜ |
| F6 | Create tier switcher component | P2 | ⬜ |
| F6 | Create dashboard settings panel | P3 | ⬜ |

---

## API Endpoints Summary

### New Sales Dashboard Endpoints

```
GET  /api/sales/dashboard/overview     → Tiered overview (auto-detects)
GET  /api/sales/dashboard/overview?tier=simple  → Force tier
GET  /api/sales/dashboard/pipeline     → Pipeline data only
GET  /api/sales/dashboard/quota        → Quota progress only
GET  /api/sales/dashboard/alerts       → Alerts only
GET  /api/sales/dashboard/forecast     → Executive-only forecast
GET  /api/sales/dashboard/settings     → User's dashboard preferences
PUT  /api/sales/dashboard/settings     → Update preferences
GET  /api/sales/setup                  → Setup wizard status
PUT  /api/sales/setup                  → Update setup
```

### New CRM Dashboard Endpoints

```
GET  /api/crm/dashboard/overview       → Tiered overview
GET  /api/crm/dashboard/leads          → Lead stats only
GET  /api/crm/dashboard/deals          → Deal health only
GET  /api/crm/dashboard/activities     → Activity summary only
GET  /api/crm/dashboard/conversion     → Conversion metrics only
GET  /api/crm/dashboard/settings       → User's preferences
PUT  /api/crm/dashboard/settings       → Update preferences
GET  /api/crm/setup                    → Setup wizard status
PUT  /api/crm/setup                    → Update setup
```

---

## Expected Outcomes

### Before (Current State)

| User Type | Experience |
|-----------|-----------|
| Solo Lawyer | Sees 40+ fields, overwhelmed |
| New Employee | Confused by enterprise features |
| Team Lead | Has to make 10+ API calls |
| Firm Owner | Missing executive insights |

### After (With This Plan)

| User Type | Experience |
|-----------|-----------|
| Solo Lawyer | Sees 5 core fields, clean UI |
| New Employee | Simple view auto-detected |
| Team Lead | 1 API call, team insights |
| Firm Owner | Executive dashboard with forecasts |

---

## Timeline Estimate

- **Phase 1 (Backend Controllers + Services)**: Core foundation
- **Phase 2 (Frontend Hooks + Components)**: UI implementation
- **Phase 3 (Forms with Office Type)**: Form optimization
- **Phase 4 (Dashboard Tiers)**: Full dashboard system
- **Phase 5 (Setup Wizards)**: Guided configuration

---

*This plan ensures CRM/Sales reaches Finance-level excellence, serving everyone from solo lawyers to large law firms.*
