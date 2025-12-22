/**
 * Dashboard Types
 * Type definitions for dashboard components
 */

import type { TFunction } from 'i18next'
import type {
  DashboardSummary,
  DashboardEvent,
  DashboardFinancialSummary,
  CRMStats,
  FinanceStats,
  CasesChartData,
  RevenueChartData,
  TasksChartData,
  ChartResponse,
} from '@/services/dashboardService'

// Re-export service types for convenience
export type {
  DashboardSummary,
  DashboardEvent,
  DashboardFinancialSummary,
  CRMStats,
  FinanceStats,
  CasesChartData,
  RevenueChartData,
  TasksChartData,
  ChartResponse,
}

/** Dashboard tab types */
export type TabType = 'overview' | 'analytics' | 'reports' | 'notifications'

/** Case statistics from dashboard summary */
export interface CaseStats {
  total: number
  active: number
  closed: number
  pending: number
}

/** Task statistics from dashboard summary */
export interface TaskStats {
  total: number
  byStatus: {
    todo: number
    in_progress: number
    completed: number
    cancelled: number
  }
}

/** Reminder statistics from dashboard summary */
export interface ReminderStats {
  total: number
  byStatus: {
    pending: number
    completed: number
    snoozed: number
  }
}

/** Hero stats for the dashboard banner - passed from parent to avoid extra API calls */
export interface HeroStats {
  tasksDueTodayCount: number
  overdueTasksCount: number
  upcomingEventsCount: number
  pendingRemindersCount: number
}

/** Overview tab props */
export interface OverviewTabProps {
  t: TFunction
  todayEvents: DashboardEvent[] | undefined
  eventsLoading: boolean
  financialSummary: DashboardFinancialSummary | undefined
  financialLoading: boolean
}

/** Analytics tab props */
export interface AnalyticsTabProps {
  t: TFunction
  crmStats: CRMStats | undefined
  crmLoading: boolean
  financeStats: FinanceStats | undefined
  financeStatsLoading: boolean
  caseStats: CaseStats | undefined
}

/** Reports tab props */
export interface ReportsTabProps {
  t: TFunction
  casesChart: ChartResponse<CasesChartData> | undefined
  casesChartLoading: boolean
  revenueChart: ChartResponse<RevenueChartData> | undefined
  revenueChartLoading: boolean
  tasksChart: ChartResponse<TasksChartData> | undefined
  tasksChartLoading: boolean
}

/** Notifications tab props */
export interface NotificationsTabProps {
  t: TFunction
}

/** Hero banner props */
export interface HeroBannerProps {
  t: TFunction
  heroStats?: HeroStats  // Optional - will fetch own data if not provided
  greeting: string
  userName: string
}
