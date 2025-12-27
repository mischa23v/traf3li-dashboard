# Centralization Tracking - Complete Task List

> **Created:** 2025-12-27
> **Status:** IN PROGRESS
> **Goal:** Fix ALL remaining centralization gaps

---

## Summary

| Category | Total | Done | Remaining |
|----------|-------|------|-----------|
| Cache Invalidations | 34 | 0 | 34 |
| Hardcoded Routes | 657 | 0 | 657 |
| Hardcoded Cache Times | 79 | 0 | 79 |
| Hardcoded Query Keys | 434 | 0 | 434 |

---

## 🔴 PRIORITY 1: Cache Invalidations (34 remaining in 18 files)

### Batch A - Cache Invalidations (8 files)
- [ ] `src/hooks/useAnonymousAuth.ts` (3 occurrences)
- [ ] `src/hooks/useIntegrations.ts` (3 occurrences)
- [ ] `src/features/staff/components/staff-reinstate-dialog.tsx` (3 occurrences)
- [ ] `src/hooks/useReceipt.ts` (2 occurrences)
- [ ] `src/hooks/usePhoneAuth.ts` (2 occurrences)
- [ ] `src/hooks/useApps.ts` (2 occurrences)
- [ ] `src/hooks/useOAuth.ts` (2 occurrences)
- [ ] `src/features/staff/components/staff-departure-dialog.tsx` (2 occurrences)

### Batch B - Cache Invalidations (8 files)
- [ ] `src/features/buying/components/material-request-details-view.tsx` (2 occurrences)
- [ ] `src/hooks/useAuth.ts` (1 occurrence)
- [ ] `src/hooks/useStepUpAuth.ts` (1 occurrence)
- [ ] `src/hooks/usePasswordReset.ts` (1 occurrence)
- [ ] `src/hooks/useEmailVerification.ts` (1 occurrence)
- [ ] `src/contexts/AuthContext.tsx` (1 occurrence)
- [ ] `src/features/buying/components/purchase-order-details-view.tsx` (1 occurrence)
- [ ] `src/features/buying/components/rfq-details-view.tsx` (1 occurrence)

**Note:** `src/lib/api.ts` (3 occurrences) - These are comments/documentation, SKIP

---

## 🟡 PRIORITY 2: Hardcoded Routes (657 in 242 files, excluding routeTree.gen.ts)

### Finance Routes Batch 1 (8 files)
- [ ] `src/features/finance/components/saudi-banking-list-view.tsx` (8 occurrences)
- [ ] `src/features/finance/components/reconciliation-create-view.tsx` (7 occurrences)
- [ ] `src/features/finance/components/create-time-entry-view.tsx` (7 occurrences)
- [ ] `src/features/finance/components/opening-balances-view.tsx` (7 occurrences)
- [ ] `src/features/finance/components/weekly-time-entries-view.tsx` (7 occurrences)
- [ ] `src/features/finance/components/fiscal-periods-dashboard.tsx` (7 occurrences)
- [ ] `src/features/finance/components/reports/accounts-aging-report.tsx` (7 occurrences)
- [ ] `src/features/finance/components/reports/revenue-by-client-report.tsx` (7 occurrences)

### Finance Routes Batch 2 (8 files)
- [ ] `src/features/finance/components/time-tracking-list-view.tsx` (6 occurrences)
- [ ] `src/features/finance/components/inter-company-dashboard.tsx` (6 occurrences)
- [ ] `src/features/finance/components/invoice-details-view.tsx` (6 occurrences)
- [ ] `src/features/finance/components/credit-note-details-view.tsx` (6 occurrences)
- [ ] `src/features/finance/components/bank-feed-dashboard.tsx` (6 occurrences)
- [ ] `src/features/finance/components/billing-rates-dashboard.tsx` (5 occurrences)
- [ ] `src/features/finance/components/trust-accounting-dashboard.tsx` (5 occurrences)
- [ ] `src/features/finance/components/create-invoice-view.tsx` (5 occurrences)

### Clients/CRM Routes Batch (8 files)
- [ ] `src/features/clients/components/clients-sidebar.tsx` (8 occurrences)
- [ ] `src/features/crm/components/crm-sidebar.tsx` (6 occurrences)
- [ ] `src/features/leads/components/leads-sidebar.tsx` (5 occurrences)
- [ ] `src/features/clients/components/client-details-view.tsx` (5 occurrences)
- [ ] `src/features/crm/components/lead-details-view.tsx` (4 occurrences)
- [ ] `src/features/crm/components/pipeline-view.tsx` (4 occurrences)
- [ ] `src/features/crm/components/lead-scoring-dashboard.tsx` (3 occurrences)
- [ ] `src/features/crm/components/email-marketing-list-view.tsx` (3 occurrences)

### HR Routes Batch 1 (8 files)
- [ ] `src/features/hr/components/hr-sidebar.tsx` (6 occurrences)
- [ ] `src/features/hr/components/employees-list-view.tsx` (5 occurrences)
- [ ] `src/features/hr/components/payroll-dashboard.tsx` (5 occurrences)
- [ ] `src/features/hr/components/attendance-dashboard.tsx` (4 occurrences)
- [ ] `src/features/hr/components/leave-management-view.tsx` (4 occurrences)
- [ ] `src/features/hr/components/recruitment-dashboard.tsx` (4 occurrences)
- [ ] `src/features/hr/components/performance-reviews-list-view.tsx` (3 occurrences)
- [ ] `src/features/hr/components/training-dashboard.tsx` (3 occurrences)

### HR Routes Batch 2 (8 files)
- [ ] `src/features/hr/components/benefits-dashboard.tsx` (3 occurrences)
- [ ] `src/features/hr/components/compensation-dashboard.tsx` (3 occurrences)
- [ ] `src/features/hr/components/employee-details-view.tsx` (3 occurrences)
- [ ] `src/pages/dashboard/hr/employees/EmployeeDetail.tsx` (3 occurrences)
- [ ] `src/pages/dashboard/hr/vehicles/VehicleDetail.tsx` (3 occurrences)
- [ ] `src/features/hr/components/onboarding-list-view.tsx` (2 occurrences)
- [ ] `src/features/hr/components/offboarding-list-view.tsx` (2 occurrences)
- [ ] `src/features/hr/components/succession-planning-view.tsx` (2 occurrences)

### Cases/Legal Routes Batch (8 files)
- [ ] `src/features/cases/components/cases-sidebar.tsx` (6 occurrences)
- [ ] `src/features/cases/components/case-details-view.tsx` (5 occurrences)
- [ ] `src/features/cases/components/create-case-view.tsx` (4 occurrences)
- [ ] `src/features/case-notion/components/case-notion-sidebar.tsx` (3 occurrences)
- [ ] `src/features/case-notion/components/document-view.tsx` (2 occurrences)
- [ ] `src/features/case-notion/components/whiteboard/whiteboard-view.tsx` (2 occurrences)
- [ ] `src/features/cases/components/case-timeline-view.tsx` (2 occurrences)
- [ ] `src/features/cases/components/case-documents-view.tsx` (2 occurrences)

### Dashboard/Settings Routes Batch (8 files)
- [ ] `src/components/productivity-hero.tsx` (10 occurrences)
- [ ] `src/services/dashboardService.ts` (15 occurrences)
- [ ] `src/utils/route-prefetch-config.ts` (13 occurrences)
- [ ] `src/features/settings/components/settings-sidebar.tsx` (5 occurrences)
- [ ] `src/features/dashboard/components/dashboard-sidebar.tsx` (4 occurrences)
- [ ] `src/features/onboarding/components/setup-wizard.tsx` (3 occurrences)
- [ ] `src/features/onboarding/components/setup-reminder-banner.tsx` (2 occurrences)
- [ ] `src/features/dashboard/components/quick-actions.tsx` (2 occurrences)

### Buying/Inventory Routes Batch (8 files)
- [ ] `src/features/buying/components/buying-sidebar.tsx` (5 occurrences)
- [ ] `src/features/buying/components/supplier-details-view.tsx` (4 occurrences)
- [ ] `src/features/buying/components/purchase-order-list-view.tsx` (3 occurrences)
- [ ] `src/features/buying/components/material-request-list-view.tsx` (3 occurrences)
- [ ] `src/features/inventory/components/inventory-sidebar.tsx` (4 occurrences)
- [ ] `src/features/inventory/components/stock-list-view.tsx` (3 occurrences)
- [ ] `src/features/inventory/components/warehouse-list-view.tsx` (2 occurrences)
- [ ] `src/features/inventory/components/stock-ledger-view.tsx` (2 occurrences)

### Manufacturing/Quality Routes Batch (8 files)
- [ ] `src/features/manufacturing/components/manufacturing-sidebar.tsx` (4 occurrences)
- [ ] `src/features/manufacturing/components/work-order-list-view.tsx` (3 occurrences)
- [ ] `src/features/manufacturing/components/bom-list-view.tsx` (2 occurrences)
- [ ] `src/features/quality/components/quality-sidebar.tsx` (3 occurrences)
- [ ] `src/features/quality/components/inspection-list-view.tsx` (2 occurrences)
- [ ] `src/features/subcontracting/components/subcontracting-sidebar.tsx` (3 occurrences)
- [ ] `src/features/subcontracting/components/order-list-view.tsx` (2 occurrences)
- [ ] `src/features/knowledge/components/knowledge-sidebar.tsx` (3 occurrences)

### Shared Components Routes Batch (8 files)
- [ ] `src/components/layout/nav-user.tsx` (4 occurrences)
- [ ] `src/components/layout/data/sidebar-data.ts` (6 occurrences)
- [ ] `src/components/upgrade-prompt.tsx` (2 occurrences)
- [ ] `src/components/plan-badge.tsx` (2 occurrences)
- [ ] `src/components/auth/PageAccessGuard.tsx` (2 occurrences)
- [ ] `src/components/auth/SoloLawyerLockScreen.tsx` (2 occurrences)
- [ ] `src/components/crm-sidebar.tsx` (3 occurrences)
- [ ] `src/components/app-sidebar.tsx` (2 occurrences)

---

## 🟡 PRIORITY 3: Hardcoded Cache Times (79 in 42 files)

### Cache Times Batch 1 (8 files)
- [ ] `src/config/ui-constants.ts` (17 occurrences) - May need new CACHE_TIMES constants
- [ ] `src/lib/mfa-enforcement.ts` (5 occurrences)
- [ ] `src/hooks/useSmartButtons.ts` (3 occurrences) - staleTime: 0 is intentional
- [ ] `src/pages/dashboard/hr/vehicles/VehicleDetail.tsx` (3 occurrences)
- [ ] `src/contexts/CompanyContext.tsx` (2 occurrences)
- [ ] `src/hooks/useCrm.ts` (2 occurrences) - staleTime: 0 is intentional
- [ ] `src/hooks/useFinance.ts` (2 occurrences) - 5s/15s for real-time
- [ ] `src/features/crm/components/lead-scoring-dashboard.tsx` (2 occurrences)

### Cache Times Batch 2 (8 files)
- [ ] `src/config/business.ts` (2 occurrences)
- [ ] `src/services/anonymousAuthService.ts` (2 occurrences)
- [ ] `src/lib/data-retention.ts` (2 occurrences)
- [ ] `src/main.tsx` (2 occurrences)
- [ ] `src/components/hr/recruitment/StaffingPlanDialog.tsx` (2 occurrences)
- [ ] `src/hooks/useAuth.ts` (1 occurrence)
- [ ] `src/hooks/useDashboard.ts` (1 occurrence)
- [ ] `src/hooks/useNotifications.ts` (1 occurrence)

---

## 🟢 PRIORITY 4: Hardcoded Query Keys (434 in 62 files, excluding cache-invalidation.ts)

### Query Keys Batch 1 (8 files)
- [ ] `src/hooks/useFinance.ts` (54 occurrences)
- [ ] `src/hooks/useHrAnalytics.ts` (28 occurrences)
- [ ] `src/hooks/useCrm.ts` (27 occurrences)
- [ ] `src/hooks/useTasks.ts` (27 occurrences)
- [ ] `src/hooks/useRemindersAndEvents.ts` (21 occurrences)
- [ ] `src/hooks/useCasesAndClients.ts` (19 occurrences)
- [ ] `src/hooks/useDashboard.ts` (17 occurrences)
- [ ] `src/hooks/useSaudiBanking.ts` (16 occurrences)

### Query Keys Batch 2 (8 files)
- [ ] `src/hooks/useCalendar.ts` (12 occurrences)
- [ ] `src/hooks/useAttendance.ts` (11 occurrences)
- [ ] `src/hooks/usePayroll.ts` (10 occurrences)
- [ ] `src/hooks/useLeaveRequests.ts` (9 occurrences)
- [ ] `src/hooks/useEmployees.ts` (8 occurrences)
- [ ] `src/hooks/useRecruitment.ts` (7 occurrences)
- [ ] `src/hooks/useTraining.ts` (6 occurrences)
- [ ] `src/hooks/useAssets.ts` (5 occurrences)

---

## Progress Log

### Completed Batches
- [x] BATCH 1-14: Cache Invalidations (867 → 34) ✅

### Current Batch
- [ ] Batch A: Cache Invalidations (IN PROGRESS)

---

## Notes

1. **routeTree.gen.ts** - 2717 routes are AUTO-GENERATED, do NOT modify
2. **cache-invalidation.ts** - 979 query keys are EXPECTED (this is the centralized file)
3. **staleTime: 0** - Some hooks intentionally use 0 for real-time data
4. **Comments in api.ts** - Documentation examples, not actual code

---

*Last Updated: 2025-12-27*
