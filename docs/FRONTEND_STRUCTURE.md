# Frontend Structure Documentation

> Auto-generated on 2026-01-09
> Run `npm run docs:frontend` to regenerate

## Summary

| Category | Count |
|----------|-------|
| Features/Modules | 47 |
| Pages | 427 |
| Components | 818 |
| Hooks | 159 |
| Services | 180 |
| **Interfaces (Entity Shapes)** | 3508 |
| **Type Aliases** | 167 |
| **Enums** | 92 |
| **Zod Schemas** | 212 |
| **API Endpoints** | 3711 |
| **Request Types** | 186 |
| **Response Types** | 880 |
| Routes Defined | 512 |
| Query Keys | 1040 |

---

## Table of Contents

- [Features/Modules](#featuresmodules)
- [Entity Interfaces](#entity-interfaces)
- [Type Aliases](#type-aliases)
- [Enums](#enums)
- [Zod Schemas](#zod-schemas)
- [API Endpoints](#api-endpoints)
- [Request/Response Types](#requestresponse-types)
- [Pages](#pages)
- [Hooks](#hooks)
- [Routes](#routes)
- [Query Keys](#query-keys)

---

## Features/Modules

### activities
| Type | Count |
|------|-------|
| Components | 4 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `activity-bell`, `activity-list`, `activity-scheduler`, `activity-stats`

---

### appointments
| Type | Count |
|------|-------|
| Components | 3 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `appointment-detail-dialog`, `appointments-view`, `manage-availability-dialog`

---

### apps
| Type | Count |
|------|-------|
| Components | 0 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

---

### assets
| Type | Count |
|------|-------|
| Components | 10 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `asset-details-view`, `assets-list-view`, `assets-settings-view`, `assets-sidebar`, `category-list-view`, `create-asset-view`, `create-category-view`, `create-maintenance-view`, `index`, `maintenance-list-view`

---

### auth
| Type | Count |
|------|-------|
| Components | 0 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

---

### automated-actions
| Type | Count |
|------|-------|
| Components | 2 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `automated-action-list`, `domain-builder`

---

### billing-rates
| Type | Count |
|------|-------|
| Components | 13 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `group-action-dialog`, `group-delete-dialog`, `group-view-dialog`, `groups-columns`, `groups-row-actions`, `groups-table`, `rate-action-dialog`, `rate-delete-dialog`, `rate-view-dialog`, `rates-columns`, `rates-provider`, `rates-row-actions`, `rates-table`

---

### buying
| Type | Count |
|------|-------|
| Components | 9 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `buying-list-view`, `buying-settings-view`, `buying-sidebar`, `create-purchase-order-view`, `create-supplier-view`, `index`, `purchase-order-details-view`, `purchase-order-list-view`, `supplier-details-view`

---

### case-notion
| Type | Count |
|------|-------|
| Components | 15 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `block-editor`, `case-notion-list-view`, `case-notion-sidebar`, `notion-page-view`, `notion-sidebar`, `block-connections`, `block-detail-panel`, `case-info-sidebar`, `frame-renderer`, `index`, `shape-renderer`, `shape-selector`, `whiteboard-block`, `whiteboard-canvas`, `whiteboard-view`

---

### case-workflows
| Type | Count |
|------|-------|
| Components | 12 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-table-row-actions`, `data-table-toolbar`, `workflows-action-dialog`, `workflows-columns`, `workflows-delete-dialog`, `workflows-dialogs`, `workflows-duplicate-dialog`, `workflows-primary-buttons`, `workflows-provider`, `workflows-stages-dialog`, `workflows-table`, `workflows-view-dialog`

---

### cases
| Type | Count |
|------|-------|
| Components | 15 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `case-details-view`, `case-pipeline-board-view`, `case-pipeline-detail-view`, `case-pipeline-list-view`, `case-pipeline-sidebar`, `case-pipeline-view`, `cases-kanban-view`, `cases-list-view`, `cases-view`, `create-case-form`, `create-case-view`, `practice-sidebar`, `rich-document-form`, `rich-document-view`, `rich-documents-list`

---

### chats
| Type | Count |
|------|-------|
| Components | 1 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `new-chat`

---

### chatter
| Type | Count |
|------|-------|
| Components | 1 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `chatter`

---

### clients
| Type | Count |
|------|-------|
| Components | 12 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `clients-action-dialog`, `clients-columns`, `clients-delete-dialog`, `clients-dialogs`, `clients-primary-buttons`, `clients-provider`, `clients-sidebar`, `clients-table`, `clients-view-dialog`, `create-client-view`, `data-table-bulk-actions`, `data-table-row-actions`

---

### companies
| Type | Count |
|------|-------|
| Components | 3 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `company-management-page`, `company-switcher`, `company-tree-view`

---

### contacts
| Type | Count |
|------|-------|
| Components | 12 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `contact-details-view`, `contacts-action-dialog`, `contacts-columns`, `contacts-delete-dialog`, `contacts-dialogs`, `contacts-primary-buttons`, `contacts-provider`, `contacts-table`, `contacts-view-dialog`, `create-contact-view`, `data-table-bulk-actions`, `data-table-row-actions`

---

### crm
| Type | Count |
|------|-------|
| Components | 45 |
| Pages/Views | 50 |
| Hooks | 0 |
| Types | 0 |

**Components:** `activities-view`, `activity-details-view`, `activity-plan-builder`, `create-activity-view`, `create-lead-view`, `create-referral-view`, `crm-reports-create-view`, `crm-reports-details-view`, `crm-reports-list-view`, `crm-setup-wizard`, `crm-sidebar`, `duplicate-detection-panel`, `email-campaign-create-view`, `email-campaign-details-view`, `email-marketing-list-view`, `lead-details-view`, `lead-scoring-dashboard`, `leads-list-view`, `office-type-selector`, `pipeline-automation-dialog`, `pipeline-view`, `quota-progress-widget`, `referral-details-view`, `referrals-list-view`, `activity-analytics-report`, `campaign-efficiency-report`, `deal-aging-report`, `first-response-time-report`, `index`, `lead-conversion-time-report`, `lead-owner-efficiency-report`, `leads-by-source-report`, `lost-opportunity-report`, `prospects-engaged-report`, `revenue-forecast-report`, `sales-funnel-report`, `sales-pipeline-analytics-report`, `win-loss-analysis-report`, `revenue-forecast-chart`, `sales-sidebar`, `stale-lead-indicator`, `whatsapp-conversation-view`, `whatsapp-list-view`, `whatsapp-new-conversation`, `whatsapp-start-conversation`

**Pages:** `activities-calendar-view`, `barcode-scanner-dialog`, `brands-list`, `campaign-detail-view`, `campaign-form-view`, `campaigns-list-view`, `client-detail-view`, `contact-detail-view`, `contact-form-view`, `contacts-list-view`, `crm-dashboard-view`, `crm-reports-dashboard-view`, `activity-settings-section`, `campaign-settings-section`, `crm-settings-field`, `email-settings-section`, `general-settings-section`, `integration-settings-section`, `lead-settings-section`, `notification-settings-section`, `pipeline-settings-section`, `quote-settings-section`, `referral-settings-section`, `crm-settings-view`, `crm-transactions-view`, `index`, `pipeline-kanban-view`, `product-barcodes-tab`, `product-detail-view`, `product-form-view`, `product-suppliers-tab`, `product-variants-tab`, `products-list-view`, `quote-form-view`, `quotes-list-view`, `activity-plans-settings-view`, `crm-settings-view`, `duplicate-detection-settings-view`, `email-templates-view`, `general-settings-view`, `index`, `lost-reasons-view`, `quotas-settings-view`, `sales-teams-view`, `tags-view`, `teams-view`, `territories-view`, `tasks-list-view`, `units-of-measure-list`, `variant-generator-dialog`

---

### dashboard
| Type | Count |
|------|-------|
| Components | 15 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `analytics-chart`, `analytics-tab`, `analytics`, `calendar-sync-dialog`, `calendar-view`, `fullcalendar-view`, `hero-banner`, `kpi-metrics`, `notifications-tab`, `overview-chart`, `overview-stats`, `overview-tab`, `overview`, `recent-sales`, `reports-tab`

---

### dashboard-settings
| Type | Count |
|------|-------|
| Components | 0 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

---

### data-export
| Type | Count |
|------|-------|
| Components | 4 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-export-sidebar`, `export-dialog`, `import-dialog`, `job-history`

---

### documents
| Type | Count |
|------|-------|
| Components | 17 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-table-bulk-actions`, `data-table-row-actions`, `data-table-toolbar`, `document-versions`, `documents-columns`, `documents-delete-dialog`, `documents-dialogs`, `documents-edit-dialog`, `documents-primary-buttons`, `documents-provider`, `documents-share-dialog`, `documents-table`, `documents-upload-dialog`, `documents-versions-dialog`, `documents-view-dialog`, `version-compare`, `version-upload-dialog`

---

### errors
| Type | Count |
|------|-------|
| Components | 0 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

---

### finance
| Type | Count |
|------|-------|
| Components | 109 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 28 |

**Components:** `account-activity-dashboard`, `account-form-dialog`, `account-statement-dashboard`, `accounts-dashboard`, `activity-details-view`, `bill-details-view`, `bills-dashboard`, `budget-check-dialog`, `budgets-dashboard`, `card-reconciliation-view`, `chart-of-accounts-view`, `compliance-dashboard-view`, `corporate-cards-dashboard`, `create-account-activity-view`, `create-bill-view`, `create-credit-note-view`, `create-expense-view`, `create-invoice-view`, `create-journal-entry-view`, `create-payment-view`, `create-quote-view`, `create-recurring-view`, `create-retainer-view`, `create-statement-view`, `create-time-entry-view`, `create-vendor-view`, `credit-note-details-view`, `credit-notes-dashboard`, `csv-import-dialog`, `currency-create-view`, `currency-details-view`, `currency-list-view`, `debit-notes-dashboard`, `edit-account-activity-view`, `edit-expense-view`, `edit-invoice-view`, `edit-statement-view`, `edit-time-entry-view`, `expense-budget-integration-example`, `expense-details-view`, `expenses-dashboard`, `finance-reports-create-view`, `finance-reports-details-view`, `finance-reports-list-view`, `finance-setup-wizard`, `finance-sidebar`, `fiscal-periods-dashboard`, `fiscal-periods-view`, `full-reports-view`, `general-ledger-view`, `gl-transactions-view.example`, `gl-transactions-view`, `gosi-calculator-view`, `gosi-dashboard-view`, `inter-company-balances`, `inter-company-dashboard`, `inter-company-reconciliation`, `inter-company-transaction`, `invoice-approvals-view`, `invoice-dashboard`, `invoice-details-view`, `invoices-dashboard`, `iqama-alerts-view`, `journal-entries-dashboard`, `journal-entry-details-view`, `month-calendar-view`, `opening-balances-view`, `payment-details-view`, `payment-receipt-template`, `payments-dashboard`, `pending-approvals-badge`, `quote-details-view`, `quotes-dashboard`, `reconciliation-create-view`, `reconciliation-details-view`, `reconciliation-list-view`, `recurring-details-view`, `recurring-invoice-details`, `recurring-invoice-form`, `recurring-invoices-list`, `recurring-transactions-dashboard`, `accounts-aging-report`, `financial-reports-dashboard`, `index`, `outstanding-invoices-report`, `reports-dashboard`, `revenue-by-client-report`, `time-entries-report`, `retainer-details-view`, `retainers-dashboard`, `saudi-banking-lean-view`, `saudi-banking-list-view`, `saudi-banking-mudad-view`, `saudi-banking-sadad-pay-view`, `saudi-banking-sadad-view`, `saudi-banking-wps-create-view`, `saudi-banking-wps-view`, `statement-details-view`, `statements-history-dashboard`, `time-entries-dashboard`, `time-entry-approvals-view`, `time-entry-details-view`, `transactions-dashboard`, `vendor-details-view`, `vendors-action-dialog`, `vendors-dashboard`, `vendors-delete-dialog`, `weekly-time-entries-view`, `wps-generator-view`

---

### followups
| Type | Count |
|------|-------|
| Components | 13 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-table-bulk-actions`, `data-table-row-actions`, `data-table-toolbar`, `followups-action-dialog`, `followups-columns`, `followups-complete-dialog`, `followups-delete-dialog`, `followups-dialogs`, `followups-primary-buttons`, `followups-provider`, `followups-reschedule-dialog`, `followups-table`, `followups-view-dialog`

---

### help
| Type | Count |
|------|-------|
| Components | 1 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `help-sidebar`

---

### hr
| Type | Count |
|------|-------|
| Components | 95 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `advances-create-view`, `advances-details-view`, `advances-list-view`, `applicant-create-view`, `applicant-details-view`, `applicants-list-view`, `asset-assignment-create-view`, `asset-assignment-details-view`, `asset-assignment-list-view`, `attendance-record-create-view`, `attendance-record-details-view`, `attendance-records-list-view`, `benefits-create-view`, `benefits-details-view`, `benefits-list-view`, `biometric-create-view`, `biometric-dashboard`, `biometric-details-view`, `biometric-list-view`, `bulk-leave-allocation-dialog`, `compensation-create-view`, `compensation-details-view`, `compensation-list-view`, `employee-create-view`, `employee-details-view`, `employee-promotions-list-view`, `employee-transfer-create-view`, `employee-transfer-details-view`, `employee-transfers-list-view`, `employees-list-view`, `expense-claims-create-view`, `expense-claims-details-view`, `expense-claims-list-view`, `geofencing-create-view`, `geofencing-details-view`, `geofencing-interactive-map`, `geofencing-list-view`, `geofencing-map`, `grievances-create-view`, `grievances-details-view`, `grievances-list-view`, `hr-analytics-dashboard`, `hr-predictions-dashboard`, `hr-setup-wizard`, `hr-sidebar`, `job-positions-create-view`, `job-positions-details-view`, `job-positions-list-view`, `job-posting-create-view`, `job-posting-details-view`, `job-postings-list-view`, `leave-allocation-create-view`, `leave-allocations-list-view`, `leave-periods-list-view`, `leave-policies-list-view`, `leave-policy-action-dialog`, `leave-policy-assign-dialog`, `leave-policy-assignments-list-view`, `leave-request-create-view`, `leave-request-details-view`, `leave-requests-list-view`, `loans-create-view`, `loans-details-view`, `loans-list-view`, `offboarding-create-view`, `offboarding-details-view`, `offboarding-list-view`, `onboarding-create-view`, `onboarding-details-view`, `onboarding-list-view`, `organizational-structure-create-view`, `organizational-structure-details-view`, `organizational-structure-list-view`, `payroll-create-view`, `payroll-details-view`, `payroll-list-view`, `payroll-run-create-view`, `payroll-run-details-view`, `payroll-runs-list-view`, `performance-review-create-view`, `performance-review-details-view`, `performance-reviews-list-view`, `promotion-create-view`, `promotion-details-view`, `reports-create-view`, `reports-details-view`, `reports-list-view`, `shift-assignments-list-view`, `shift-types-list-view`, `succession-planning-create-view`, `succession-planning-details-view`, `succession-planning-list-view`, `training-create-view`, `training-details-view`, `training-list-view`

---

### inventory
| Type | Count |
|------|-------|
| Components | 9 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-item-view`, `create-warehouse-view`, `index`, `inventory-list-view`, `inventory-settings-view`, `inventory-sidebar`, `item-details-view`, `warehouse-details-view`, `warehouse-list-view`

---

### invoice-templates
| Type | Count |
|------|-------|
| Components | 8 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `template-action-dialog`, `template-delete-dialog`, `template-duplicate-dialog`, `template-view-dialog`, `templates-columns`, `templates-provider`, `templates-row-actions`, `templates-table`

---

### jobs
| Type | Count |
|------|-------|
| Components | 2 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `browse-jobs`, `jobs-sidebar`

---

### knowledge
| Type | Count |
|------|-------|
| Components | 4 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `forms-view`, `judgments-view`, `knowledge-sidebar`, `laws-view`

---

### leads
| Type | Count |
|------|-------|
| Components | 1 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-lead-view`

---

### lock-dates
| Type | Count |
|------|-------|
| Components | 2 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `date-locked-warning`, `lock-date-settings`

---

### messages
| Type | Count |
|------|-------|
| Components | 2 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `chat-view`, `email-view`

---

### ml-scoring
| Type | Count |
|------|-------|
| Components | 5 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `index`, `ml-score-card`, `priority-queue`, `score-explanation`, `sla-dashboard`

---

### notifications
| Type | Count |
|------|-------|
| Components | 0 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

---

### onboarding
| Type | Count |
|------|-------|
| Components | 10 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `feature-tour`, `index`, `initial-setup-wizard`, `quick-start-checklist`, `setup-celebration`, `setup-orchestrator`, `setup-progress-sidebar`, `setup-reminder-banner`, `welcome-modal`, `welcome-screen`

---

### organizations
| Type | Count |
|------|-------|
| Components | 12 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-organization-view`, `data-table-bulk-actions`, `data-table-row-actions`, `organization-details-view`, `organizations-action-dialog`, `organizations-columns`, `organizations-delete-dialog`, `organizations-dialogs`, `organizations-primary-buttons`, `organizations-provider`, `organizations-table`, `organizations-view-dialog`

---

### reports
| Type | Count |
|------|-------|
| Components | 9 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `company-comparison-chart`, `consolidated-financial-report`, `consolidated-report`, `index`, `inter-company-elimination`, `report-config-dialog`, `report-viewer`, `reports-sidebar`, `saved-reports-list`

---

### reputation
| Type | Count |
|------|-------|
| Components | 2 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `badges-view`, `reputation-sidebar`

---

### sales
| Type | Count |
|------|-------|
| Components | 20 |
| Pages/Views | 1 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-lead-view`, `lead-details-view`, `leads-dashboard`, `leads-page-example`, `sales-reports-create-view`, `sales-reports-details-view`, `sales-reports-list-view`, `commission-settings-section`, `delivery-settings-section`, `discount-settings-section`, `document-settings-section`, `general-settings-section`, `order-settings-section`, `pricing-settings-section`, `quote-settings-section`, `return-settings-section`, `sales-settings-page`, `sequence-settings-section`, `settings-field`, `tax-settings-section`

**Pages:** `sales-transactions-view`

---

### settings
| Type | Count |
|------|-------|
| Components | 36 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `api-keys-settings`, `audit-log-viewer`, `billing-history`, `billing-settings`, `captcha-settings`, `company-settings`, `content-section`, `create-api-key-dialog`, `crm-settings`, `email-settings`, `email-signatures-manager`, `email-templates-list`, `enterprise-settings`, `expense-policies-settings`, `finance-settings`, `integration-card`, `integrations-settings`, `ldap-config-form`, `ldap-settings`, `ldap-test-dialog`, `payment-method-settings`, `payment-modes-settings`, `payment-terms-settings`, `plan-comparison`, `plan-upgrade-example`, `plan-upgrade-modal`, `pricing-table`, `settings-sidebar`, `sidebar-nav`, `smtp-config-form`, `sso-provider-card`, `sso-settings`, `tax-settings`, `webhook-dialog`, `webhook-logs`, `webhooks-settings`

---

### staff
| Type | Count |
|------|-------|
| Components | 14 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-staff-view`, `data-table-bulk-actions`, `data-table-row-actions`, `staff-action-dialog`, `staff-columns`, `staff-delete-dialog`, `staff-departure-dialog`, `staff-details-view`, `staff-dialogs`, `staff-primary-buttons`, `staff-provider`, `staff-reinstate-dialog`, `staff-table`, `staff-view-dialog`

---

### subscriptions
| Type | Count |
|------|-------|
| Components | 5 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 17 |

**Components:** `subscription-create-view`, `subscription-detail-view`, `subscription-plan-form-view`, `subscription-plans-list-view`, `subscriptions-list-view`

---

### support
| Type | Count |
|------|-------|
| Components | 8 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `create-sla-view`, `create-ticket-view`, `index`, `sla-list-view`, `support-list-view`, `support-settings-view`, `support-sidebar`, `ticket-details-view`

---

### tags
| Type | Count |
|------|-------|
| Components | 12 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-table-bulk-actions`, `data-table-row-actions`, `data-table-toolbar`, `tag-input`, `tags-action-dialog`, `tags-columns`, `tags-delete-dialog`, `tags-dialogs`, `tags-primary-buttons`, `tags-provider`, `tags-table`, `tags-view-dialog`

---

### tasks
| Type | Count |
|------|-------|
| Components | 29 |
| Pages/Views | 0 |
| Hooks | 1 |
| Types | 0 |

**Components:** `attachment-versions-dialog`, `create-event-view`, `create-reminder-view`, `create-task-view`, `data-table-bulk-actions`, `data-table-row-actions`, `document-editor-dialog`, `event-details-view`, `events-view`, `gantt-view`, `reminder-details-view`, `reminders-view`, `task-details-view`, `task-report-template`, `tasks-columns`, `tasks-dialogs`, `tasks-import-dialog`, `tasks-list-view`, `tasks-multi-delete-dialog`, `tasks-mutate-drawer`, `tasks-primary-buttons`, `tasks-provider`, `tasks-reports-create-view`, `tasks-reports-details-view`, `tasks-reports-list-view`, `tasks-sidebar`, `tasks-table`, `tasks-timeline-view`, `voice-memo-recorder`

---

### users
| Type | Count |
|------|-------|
| Components | 11 |
| Pages/Views | 0 |
| Hooks | 0 |
| Types | 0 |

**Components:** `data-table-bulk-actions`, `data-table-row-actions`, `users-action-dialog`, `users-columns`, `users-delete-dialog`, `users-dialogs`, `users-invite-dialog`, `users-multi-delete-dialog`, `users-primary-buttons`, `users-provider`, `users-table`

---

## Entity Interfaces

| Interface | Fields | Extends | Path |
|-----------|--------|---------|------|
| `CaptchaChallengeRef` | 1 | - | components/auth/captcha-challenge.tsx |
| `CaptchaConfig` | 1 | - | components/auth/captcha-config.ts |
| `CaptchaSettings` | 1 | - | components/auth/captcha-config.ts |
| `BreadcrumbItem` | 1 | - | components/breadcrumb.tsx |
| `MentionUser` | 1 | - | components/chatter/chatter-input.tsx |
| `DealHealthFactor` | 1 | - | components/deal-health-indicator.tsx |
| `KanbanStage` | 1 | - | components/kanban/kanban-board.tsx |
| `KanbanCard` | 1 | - | components/kanban/kanban-board.tsx |
| `KanbanCard` | 1 | - | components/kanban/kanban-card.tsx |
| `PasswordStrengthResult` | 1 | - | components/password-strength.tsx |
| `SmartButtonConfig` | 1 | - | components/smart-button/smart-button-config.ts |
| `ValidationError` | 1 | - | components/validation-errors.tsx |
| `FeatureFlag` | 1 | - | config/feature-flags.ts |
| `PlanConfig` | 15 | - | config/plans.ts |
| `FeatureConfig` | 7 | - | config/plans.ts |
| `PlanLimits` | 5 | - | config/plans.ts |
| `UpgradePath` | 4 | - | config/plans.ts |
| `OfficeTypeConfig` | 1 | - | constants/crm-constants.ts |
| `LeadStatusConfig` | 1 | - | constants/crm-constants.ts |
| `LeadSourceConfig` | 1 | - | constants/crm-constants.ts |
| `ActivityTypeConfig` | 1 | - | constants/crm-constants.ts |
| `PriorityConfig` | 1 | - | constants/crm-constants.ts |
| `ErrorMetadata` | 1 | - | constants/errorCodes.ts |
| `GosiContributionBreakdown` | 1 | - | constants/saudi-banking.ts |
| `Notification` | 1 | - | context/socket-provider.tsx |
| `AppointmentDetail` | 1 | - | features/appointments/components/appointment-detail-dialog.tsx |
| `Block` | 1 | - | features/case-notion/data/schema.ts |
| `HistorySnapshot` | 1 | - | features/case-notion/stores/whiteboard-history.ts |
| `CasePipelineStage` | 1 | - | features/cases/data/case-pipeline-schema.ts |
| `CasePipelineConfig` | 1 | - | features/cases/data/case-pipeline-schema.ts |
| `CasePipelineCard` | 1 | - | features/cases/data/case-pipeline-schema.ts |
| `ChatParticipant` | 1 | - | features/chats/data/chat-types.ts |
| `CaseStats` | 1 | - | features/dashboard/types.ts |
| `TaskStats` | 1 | - | features/dashboard/types.ts |
| `ReminderStats` | 1 | - | features/dashboard/types.ts |
| `HeroStats` | 1 | - | features/dashboard/types.ts |
| `ApprovalStep` | 3 | - | features/finance/types/approval-types.ts |
| `ApprovalHistory` | 1 | ApprovalStep | features/finance/types/approval-types.ts |
| `ApprovalWorkflowConfig` | 1 | - | features/finance/types/approval-types.ts |
| `InvoiceApprovalData` | 1 | - | features/finance/types/approval-types.ts |
| `ApprovalQueueFilters` | 1 | - | features/finance/types/approval-types.ts |
| `SubmitForApprovalData` | 1 | - | features/finance/types/approval-types.ts |
| `ApproveInvoiceData` | 1 | - | features/finance/types/approval-types.ts |
| `RejectInvoiceData` | 1 | - | features/finance/types/approval-types.ts |
| `RequestChangesData` | 1 | - | features/finance/types/approval-types.ts |
| `EscalateApprovalData` | 1 | - | features/finance/types/approval-types.ts |
| `CorporateCard` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CardTransaction` | 1 | - | features/finance/types/corporate-card-types.ts |
| `ReconciliationMatch` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CardStatistics` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CSVImportResult` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CreateCorporateCardData` | 1 | - | features/finance/types/corporate-card-types.ts |
| `UpdateCorporateCardData` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CreateCardTransactionData` | 1 | - | features/finance/types/corporate-card-types.ts |
| `ReconcileTransactionData` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CardTransactionFilters` | 1 | - | features/finance/types/corporate-card-types.ts |
| `CorporateCardFilters` | 1 | - | features/finance/types/corporate-card-types.ts |
| `TimeEntryLockStatus` | 3 | - | features/finance/types/time-entry-lock-types.ts |
| `TimeEntryUnlockRecord` | 3 | - | features/finance/types/time-entry-lock-types.ts |
| `LockTimeEntryData` | 1 | - | features/finance/types/time-entry-lock-types.ts |
| `UnlockTimeEntryData` | 1 | - | features/finance/types/time-entry-lock-types.ts |
| `BulkLockTimeEntriesData` | 1 | - | features/finance/types/time-entry-lock-types.ts |
| `LockByDateRangeData` | 1 | - | features/finance/types/time-entry-lock-types.ts |
| `LockOperationResult` | 1 | - | features/finance/types/time-entry-lock-types.ts |
| `ReportTypeOption` | 1 | - | features/reports/data/data.ts |
| `PeriodOption` | 1 | - | features/reports/data/data.ts |
| `FormatOption` | 1 | - | features/reports/data/data.ts |
| `ChartTypeOption` | 1 | - | features/reports/data/data.ts |
| `ExportFormatOption` | 1 | - | features/reports/data/data.ts |
| `ScheduleFrequencyOption` | 1 | - | features/reports/data/data.ts |
| `QuickDateRange` | 2 | - | features/reports/data/data.ts |
| `PlanFeature` | 1 | - | features/settings/components/pricing-table.tsx |
| `SubscriptionPlan` | 33 | - | features/subscriptions/types/subscription-types.ts |
| `CreateSubscriptionPlanData` | 28 | - | features/subscriptions/types/subscription-types.ts |
| `UpdateSubscriptionPlanData` | 0 | Partial<CreateSubscriptionPlanData> | features/subscriptions/types/subscription-types.ts |
| `Subscription` | 10 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionHistoryEntry` | 11 | - | features/subscriptions/types/subscription-types.ts |
| `CreateSubscriptionData` | 16 | - | features/subscriptions/types/subscription-types.ts |
| `UpdateSubscriptionData` | 9 | - | features/subscriptions/types/subscription-types.ts |
| `ChangePlanData` | 4 | - | features/subscriptions/types/subscription-types.ts |
| `ConsumeHoursData` | 6 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionPlanFilters` | 12 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionFilters` | 17 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionPlanListResponse` | 5 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionListResponse` | 5 | - | features/subscriptions/types/subscription-types.ts |
| `SubscriptionStats` | 18 | - | features/subscriptions/types/subscription-types.ts |
| `UpcomingInvoicePreview` | 15 | - | features/subscriptions/types/subscription-types.ts |
| `HoursUsageSummary` | 3 | - | features/subscriptions/types/subscription-types.ts |
| `RenewalPreview` | 8 | - | features/subscriptions/types/subscription-types.ts |
| `StatusOption` | 1 | - | features/tasks/constants/task-options.ts |
| `PriorityOption` | 1 | - | features/tasks/constants/task-options.ts |
| `CategoryOption` | 1 | - | features/tasks/constants/task-options.ts |
| `TaskFormData` | 1 | - | features/tasks/hooks/useTaskFormValidation.ts |
| `DateRangeFilters` | 1 | - | hooks/use-crm-reports.ts |
| `PipelineFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `ForecastFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `QuotaFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `LeaderboardFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `TeamFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `RepFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `HealthScoreFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `TerritoryFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `TransactionFilters` | 1 | DateRangeFilters | hooks/use-crm-reports.ts |
| `PipelineOverview` | 1 | - | hooks/use-crm-reports.ts |
| `PipelineVelocity` | 1 | - | hooks/use-crm-reports.ts |
| `StageDuration` | 1 | - | hooks/use-crm-reports.ts |
| `DealAging` | 1 | - | hooks/use-crm-reports.ts |
| `PipelineMovement` | 1 | - | hooks/use-crm-reports.ts |
| `LeadsBySource` | 1 | - | hooks/use-crm-reports.ts |
| `LeadConversionFunnel` | 1 | - | hooks/use-crm-reports.ts |
| `LeadResponseTime` | 1 | - | hooks/use-crm-reports.ts |
| `LeadVelocityRate` | 1 | - | hooks/use-crm-reports.ts |
| `LeadDistribution` | 1 | - | hooks/use-crm-reports.ts |
| `ActivitySummary` | 1 | - | hooks/use-crm-reports.ts |
| `CallAnalytics` | 1 | - | hooks/use-crm-reports.ts |
| `EmailEngagement` | 1 | - | hooks/use-crm-reports.ts |
| `MeetingAnalytics` | 1 | - | hooks/use-crm-reports.ts |
| `TaskCompletion` | 1 | - | hooks/use-crm-reports.ts |
| `SalesForecast` | 1 | - | hooks/use-crm-reports.ts |
| `RevenueAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `QuotaAttainment` | 1 | - | hooks/use-crm-reports.ts |
| `WinRateAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `DealSizeAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `SalesLeaderboard` | 1 | - | hooks/use-crm-reports.ts |
| `TeamPerformance` | 1 | - | hooks/use-crm-reports.ts |
| `RepScorecard` | 1 | - | hooks/use-crm-reports.ts |
| `ActivityMetricsByRep` | 1 | - | hooks/use-crm-reports.ts |
| `CustomerLifetimeValue` | 1 | - | hooks/use-crm-reports.ts |
| `ChurnAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `CustomerHealthScore` | 1 | - | hooks/use-crm-reports.ts |
| `AccountEngagement` | 1 | - | hooks/use-crm-reports.ts |
| `WinLossAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `LostDealsAnalysis` | 1 | - | hooks/use-crm-reports.ts |
| `CompetitorTracking` | 1 | - | hooks/use-crm-reports.ts |
| `TerritoryPerformance` | 1 | - | hooks/use-crm-reports.ts |
| `RegionalSales` | 1 | - | hooks/use-crm-reports.ts |
| `GeographicPipeline` | 1 | - | hooks/use-crm-reports.ts |
| `CrmTransaction` | 2 | - | hooks/use-crm-reports.ts |
| `CrmTransactionsList` | 1 | - | hooks/use-crm-reports.ts |
| `CrmTransactionSummary` | 1 | - | hooks/use-crm-reports.ts |
| `ExportOptions` | 1 | - | hooks/use-crm-reports.ts |
| `ValidationError` | 1 | - | hooks/useApiError.tsx |
| `AppointmentFilters` | 1 | - | hooks/useAppointments.ts |
| `BlockedTimeFilters` | 1 | - | hooks/useAppointments.ts |
| `StatsFilters` | 1 | - | hooks/useAppointments.ts |
| `SidebarData` | 1 | - | hooks/useCalendar.ts |
| `UseCaptchaOptions` | 1 | - | hooks/useCaptcha.ts |
| `UseCaptchaReturn` | 1 | - | hooks/useCaptcha.ts |
| `Message` | 1 | - | hooks/useChat.ts |
| `Conversation` | 1 | - | hooks/useChat.ts |
| `DashboardParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `RevenueParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `FunnelParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `DateRangeParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `PipelineParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `TeamParams` | 1 | - | hooks/useCrmAnalytics.ts |
| `UseFeatureFlagResult` | 1 | - | hooks/useFeatureFlag.ts |
| `InvoicesWithStats` | 1 | - | hooks/useFinance.ts |
| `PaymentsWithSummary` | 1 | - | hooks/useFinance.ts |
| `PaymentFilters` | 1 | - | hooks/useFinance.ts |
| `Payment` | 1 | - | hooks/useFinance.ts |
| `FinancialOverviewData` | 1 | - | hooks/useFinance.ts |
| `FieldConfig` | 1 | - | hooks/useFormValidation.ts |
| `ValidationSchema` | 1 | - | hooks/useFormValidation.ts |
| `CharacterCount` | 1 | - | hooks/useFormValidation.ts |
| `HRAnalyticsDashboardData` | 1 | - | hooks/useHrAnalytics.ts |
| `UseKanbanOptions` | 1 | - | hooks/useKanban.ts |
| `ModuleLinks` | 1 | - | hooks/useKeyboardShortcuts.ts |
| `ListCallbacks` | 1 | - | hooks/useKeyboardShortcuts.ts |
| `DetailCallbacks` | 1 | - | hooks/useKeyboardShortcuts.ts |
| `CreateCallbacks` | 1 | - | hooks/useKeyboardShortcuts.ts |
| `UseKeyboardShortcutsOptions` | 1 | - | hooks/useKeyboardShortcuts.ts |
| `EventsWithStats` | 1 | - | hooks/useRemindersAndEvents.ts |
| `RemindersWithStats` | 1 | - | hooks/useRemindersAndEvents.ts |
| `LeanCustomer` | 1 | - | hooks/useSaudiBanking.ts |
| `LeanEntity` | 1 | - | hooks/useSaudiBanking.ts |
| `LeanAccount` | 1 | - | hooks/useSaudiBanking.ts |
| `LeanBank` | 1 | - | hooks/useSaudiBanking.ts |
| `LeanTransaction` | 1 | - | hooks/useSaudiBanking.ts |
| `WPSEstablishment` | 1 | Omit<ServiceWPSEstablishment, 'establishmentId' | 'establishmentName'> | hooks/useSaudiBanking.ts |
| `WPSEmployee` | 1 | - | hooks/useSaudiBanking.ts |
| `WPSFile` | 1 | - | hooks/useSaudiBanking.ts |
| `SARIEBank` | 1 | - | hooks/useSaudiBanking.ts |
| `SADADBiller` | 1 | - | hooks/useSaudiBanking.ts |
| `SADADBill` | 1 | - | hooks/useSaudiBanking.ts |
| `SADADPayment` | 1 | - | hooks/useSaudiBanking.ts |
| `MudadEmployee` | 1 | - | hooks/useSaudiBanking.ts |
| `NitaqatResult` | 1 | - | hooks/useSaudiBanking.ts |
| `MinimumWageResult` | 1 | - | hooks/useSaudiBanking.ts |
| `SmartButtonCount` | 1 | - | hooks/useSmartButtonCounts.ts |
| `SmartButtonCountsResult` | 1 | - | hooks/useSmartButtonCounts.ts |
| `UseSmartButtonsResult` | 1 | - | hooks/useSmartButtons.ts |
| `UseSmartButtonsBatchResult` | 1 | - | hooks/useSmartButtons.ts |
| `CreateStaffData` | 1 | - | hooks/useStaff.ts |
| `InviteStaffData` | 1 | - | hooks/useStaff.ts |
| `UpdateStaffData` | 0 | Partial<CreateStaffData> | hooks/useStaff.ts |
| `TaskWithRelated` | 1 | - | hooks/useTasks.ts |
| `AdminDashboardData` | 1 | - | hooks/useUIAccess.ts |
| `DebugError` | 1 | - | lib/aggressive-debug.ts |
| `ApiCallTrace` | 1 | - | lib/api-debug.ts |
| `ApiError` | 2 | - | lib/api.ts |
| `RateLimitInfo` | 1 | - | lib/api.ts |
| `BilingualError` | 1 | - | lib/bilingualErrorHandler.ts |
| `ConsentRecord` | 1 | - | lib/consent-manager.ts |
| `ConsentHistoryEntry` | 1 | - | lib/consent-manager.ts |
| `SecureCookieOptions` | 1 | - | lib/cookies.ts |
| `RetainedDataItem` | 1 | - | lib/data-retention.ts |
| `LogEntry` | 1 | - | lib/document-debug-logger.ts |
| `ErrorContext` | 1 | - | lib/error-handling.ts |
| `HandledError` | 1 | - | lib/error-handling.ts |
| `ValidationResult` | 1 | - | lib/file-validation.ts |
| `SmartPreviewOptions` | 1 | - | lib/file-viewer.ts |
| `SmartPreviewResult` | 1 | - | lib/file-viewer.ts |
| `LogContext` | 1 | - | lib/logger.ts |
| `LogEntry` | 1 | - | lib/logger.ts |
| `LoggerConfig` | 1 | - | lib/logger.ts |
| `IbanValidationResult` | 1 | - | lib/saudi-banking-validation.ts |
| `SaudiIdValidationResult` | 1 | - | lib/saudi-banking-validation.ts |
| `SalaryValidationResult` | 1 | - | lib/saudi-banking-validation.ts |
| `TokenPair` | 1 | - | lib/secure-auth.ts |
| `SecureAuthConfig` | 1 | - | lib/secure-auth.ts |
| `SecurityHeader` | 2 | - | lib/security-headers.ts |
| `CSPDirectives` | 0 | - | lib/security-headers.ts |
| `WPSEmployeeRecord` | 1 | - | lib/wps-file-generator.ts |
| `WPSEstablishmentRecord` | 1 | - | lib/wps-file-generator.ts |
| `WPSGenerationOptions` | 1 | - | lib/wps-file-generator.ts |
| `WPSValidationResult` | 1 | - | lib/wps-file-generator.ts |
| `WPSValidationError` | 1 | - | lib/wps-file-generator.ts |
| `WPSFilePreview` | 1 | - | lib/wps-file-generator.ts |
| `FileRoutesByFullPath` | 0 | - | routeTree.gen.ts |
| `FileRoutesByTo` | 0 | - | routeTree.gen.ts |
| `FileRoutesById` | 1 | - | routeTree.gen.ts |
| `FileRouteTypes` | 1 | - | routeTree.gen.ts |
| `RootRouteChildren` | 1 | - | routeTree.gen.ts |
| `User` | 29 | - | sdk/core/src/types.ts |
| `UserFirm` | 4 | - | sdk/core/src/types.ts |
| `UserPermissions` | 15 | - | sdk/core/src/types.ts |
| `LoginCredentials` | 4 | - | sdk/core/src/types.ts |
| `RegisterData` | 9 | - | sdk/core/src/types.ts |
| `AuthResult` | 6 | - | sdk/core/src/types.ts |
| `AuthTokens` | 2 | - | sdk/core/src/types.ts |
| `MfaSetupResult` | 3 | - | sdk/core/src/types.ts |
| `MfaVerifyResult` | 2 | - | sdk/core/src/types.ts |
| `MfaChallengeData` | 3 | - | sdk/core/src/types.ts |
| `Session` | 9 | - | sdk/core/src/types.ts |
| `OAuthConfig` | 4 | - | sdk/core/src/types.ts |
| `GoogleOneTapConfig` | 5 | - | sdk/core/src/types.ts |
| `GoogleOneTapResponse` | 3 | - | sdk/core/src/types.ts |
| `SSOProvider` | 7 | - | sdk/core/src/types.ts |
| `SSODetectionResult` | 4 | - | sdk/core/src/types.ts |
| `PasswordStrength` | 3 | - | sdk/core/src/types.ts |
| `ForgotPasswordData` | 1 | - | sdk/core/src/types.ts |
| `ResetPasswordData` | 2 | - | sdk/core/src/types.ts |
| `ChangePasswordData` | 2 | - | sdk/core/src/types.ts |
| `SendOtpData` | 2 | - | sdk/core/src/types.ts |
| `VerifyOtpData` | 3 | - | sdk/core/src/types.ts |
| `OtpResult` | 4 | - | sdk/core/src/types.ts |
| `MagicLinkData` | 2 | - | sdk/core/src/types.ts |
| `MagicLinkResult` | 3 | - | sdk/core/src/types.ts |
| `TrafAuthConfig` | 8 | - | sdk/core/src/types.ts |
| `TrafAuthError` | 6 | Error | sdk/core/src/types.ts |
| `GoogleOneTapConfig` | 9 | - | sdk/integrations/google-onetap/types.ts |
| `GoogleCredentialResponse` | 3 | - | sdk/integrations/google-onetap/types.ts |
| `GoogleOneTapNotification` | 6 | - | sdk/integrations/google-onetap/types.ts |
| `GoogleOneTapResult` | 6 | - | sdk/integrations/google-onetap/types.ts |
| `GoogleOneTapCallbacks` | 3 | - | sdk/integrations/google-onetap/types.ts |
| `DecodedGoogleToken` | 15 | - | sdk/integrations/google-onetap/types.ts |
| `UseGoogleOneTapOptions` | 7 | Omit<GoogleOneTapConfig, 'apiUrl' | 'clientId'> | sdk/integrations/google-onetap/useGoogleOneTap.ts |
| `UseGoogleOneTapReturn` | 11 | - | sdk/integrations/google-onetap/useGoogleOneTap.ts |
| `TemplateManagerConfig` | 2 | - | sdk/integrations/organization-templates/TemplateManager.ts |
| `AuthMethodConfig` | 3 | - | sdk/integrations/organization-templates/types.ts |
| `PasswordPolicy` | 10 | - | sdk/integrations/organization-templates/types.ts |
| `MFAPolicy` | 6 | - | sdk/integrations/organization-templates/types.ts |
| `SessionPolicy` | 6 | - | sdk/integrations/organization-templates/types.ts |
| `SSOPolicy` | 6 | - | sdk/integrations/organization-templates/types.ts |
| `SecurityPolicy` | 8 | - | sdk/integrations/organization-templates/types.ts |
| `BrandingConfig` | 7 | - | sdk/integrations/organization-templates/types.ts |
| `ComplianceConfig` | 9 | - | sdk/integrations/organization-templates/types.ts |
| `NotificationConfig` | 6 | - | sdk/integrations/organization-templates/types.ts |
| `OrganizationTemplate` | 11 | - | sdk/integrations/organization-templates/types.ts |
| `TemplateApplication` | 5 | - | sdk/integrations/organization-templates/types.ts |
| `UseOrganizationTemplateOptions` | 2 | TemplateManagerConfig | sdk/integrations/organization-templates/useOrganizationTemplate.ts |
| `UseOrganizationTemplateReturn` | 12 | - | sdk/integrations/organization-templates/useOrganizationTemplate.ts |
| `SSOProvider` | 9 | - | sdk/integrations/sso-detection/types.ts |
| `SSODomainMapping` | 7 | - | sdk/integrations/sso-detection/types.ts |
| `SSODetectionConfig` | 5 | - | sdk/integrations/sso-detection/types.ts |
| `SSODetectionResult` | 5 | - | sdk/integrations/sso-detection/types.ts |
| `SSOLoginOptions` | 4 | - | sdk/integrations/sso-detection/types.ts |
| `SSOSession` | 12 | - | sdk/integrations/sso-detection/types.ts |
| `UseSSODetectionOptions` | 1 | SSODetectionConfig | sdk/integrations/sso-detection/useSSODetection.ts |
| `UseSSODetectionReturn` | 7 | - | sdk/integrations/sso-detection/useSSODetection.ts |
| `AuthRouteHandlerConfig` | 5 | - | sdk/nextjs/src/api/index.ts |
| `AuthMiddlewareConfig` | 7 | - | sdk/nextjs/src/middleware/index.ts |
| `WithAuthOptions` | 0 | Omit<AuthGuardProps, 'children'> | sdk/react/src/hoc/withAuth.tsx |
| `LinkedAccount` | 6 | - | sdk/react/src/hooks/useAccountLinking.ts |
| `UseAccountLinkingReturn` | 7 | - | sdk/react/src/hooks/useAccountLinking.ts |
| `AnonymousSession` | 5 | - | sdk/react/src/hooks/useAnonymousSession.ts |
| `ConvertToAccountData` | 4 | - | sdk/react/src/hooks/useAnonymousSession.ts |
| `UseAnonymousSessionReturn` | 9 | - | sdk/react/src/hooks/useAnonymousSession.ts |
| `ApiKey` | 8 | - | sdk/react/src/hooks/useApiKeys.ts |

*... and 3208 more*

---

## Type Aliases

| Type | Kind | Definition |
|------|------|------------|
| `DatePreset` | union | `| 'today'
  | 'yesterday'
  | 'last7days'
  | 'las...` |
| `StatStatus` | union | `'normal' | 'attention' | 'zero'` |
| `PlanId` | union | `'free' | 'starter' | 'professional' | 'enterprise'` |
| `FeatureId` | union | `| 'basic_cases'
  | 'basic_clients'
  | 'basic_inv...` |
| `OfficeType` | union | `'solo' | 'small' | 'medium' | 'firm'

export inter...` |
| `ProspectLevel` | union | `'PL_NONE' | 'PL_LOW' | 'PL_MEDIUM' | 'PL_HIGH' | '...` |
| `ValidationState` | union | `'unknown' | 'valid' | 'invalid' | 'bounced'

expor...` |
| `ErrorCode` | union | `(typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/*...` |
| `NajizIdentityType` | alias | `typeof NAJIZ_IDENTITY_TYPES[number]['value']

// ═...` |
| `RouteParams` | object | `{
  // Cases
  caseId: string` |
| `RouteFunction` | function | `(...args: string[]) => string` |
| `StaticRoute` | union | `Extract<
  | typeof ROUTES[keyof typeof ROUTES]
  ...` |
| `InvoiceStatus` | union | `| 'draft'
  | 'pending_approval'
  | 'approved'
  ...` |
| `TimeEntryLockReason` | union | `'approved' | 'billed' | 'period_closed' | 'manual'...` |
| `BillingPeriod` | union | `'weekly' | 'biweekly' | 'monthly' | 'quarterly' | ...` |
| `SubscriptionStatus` | union | `| 'draft'           // Not yet activated
  | 'tria...` |
| `SubscriptionPlanType` | union | `| 'retainer'        // Monthly retainer package
  ...` |
| `ProrationBehavior` | union | `| 'create_prorations'    // Calculate prorated amo...` |
| `SubscriptionCurrency` | union | `'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED'` |
| `SubscriptionAction` | union | `| 'activate'
  | 'pause'
  | 'resume'
  | 'cancel'...` |
| `CircuitState` | union | `'CLOSED' | 'OPEN' | 'HALF_OPEN'

interface Circuit...` |
| `LogLevel` | union | `'debug' | 'info' | 'warn' | 'error'

export type D...` |
| `LogLevel` | union | `'debug' | 'info' | 'warn' | 'error' | 'none'

expo...` |
| `QueryKeyFactory` | function | `typeof QueryKeys

// ==================== MAIN FAC...` |
| `UserRole` | union | `'client' | 'lawyer' | 'admin'` |
| `FirmRole` | union | `| 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
 ...` |
| `FirmStatus` | union | `'active' | 'departed' | 'suspended' | 'pending' | ...` |
| `LawyerWorkMode` | union | `'solo' | 'firm_owner' | 'firm_member' | null` |
| `Plan` | union | `'free' | 'starter' | 'professional' | 'enterprise'` |
| `MfaMethod` | union | `'totp' | 'sms' | 'email'` |
| `OAuthProvider` | union | `'google' | 'microsoft' | 'apple' | 'github'` |
| `OtpPurpose` | union | `'login' | 'registration' | 'password_reset' | 'ema...` |
| `TemplateType` | union | `| 'startup'
  | 'enterprise'
  | 'healthcare'
  | ...` |
| `SSOProviderType` | union | `| 'saml'
  | 'oidc'
  | 'google'
  | 'microsoft'
 ...` |
| `WebhookEvent` | union | `| 'user.created'
  | 'user.updated'
  | 'user.dele...` |
| `MFASetupMethod` | union | `'totp' | 'sms' | 'email'` |
| `MFAMethod` | union | `'totp' | 'sms' | 'email'` |
| `SocialProvider` | union | `'google' | 'microsoft' | 'apple' | 'github' | 'fac...` |
| `ThemeMode` | union | `'light' | 'dark' | 'system'` |
| `ThemeDirection` | union | `'ltr' | 'rtl'` |
| `AccountTypeEnum` | union | `'Asset' | 'Liability' | 'Equity' | 'Income' | 'Exp...` |
| `AccountType` | union | `'asset' | 'liability' | 'equity' | 'income' | 'exp...` |
| `FiscalPeriodStatus` | union | `'future' | 'open' | 'closed' | 'locked'

export in...` |
| `PricingType` | union | `'percentage' | 'fixed' | 'rate_table'

export inte...` |
| `DebitNoteStatus` | union | `'draft' | 'pending' | 'approved' | 'applied' | 'ca...` |
| `RetainerStatus` | union | `'active' | 'exhausted' | 'refunded' | 'closed'

ex...` |
| `LeadStage` | union | `'new' | 'contacted' | 'qualified' | 'proposal' | '...` |
| `ActivityType` | union | `| 'task_created'
  | 'task_updated'
  | 'task_comp...` |
| `AdvanceType` | union | `'salary' | 'emergency' | 'travel' | 'relocation' |...` |
| `DayOfWeek` | union | `0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Appointment dura...` |
| `AssetAssignmentStatus` | union | `'assigned' | 'in_use' | 'returned' | 'lost' | 'dam...` |
| `CheckMethod` | union | `'biometric' | 'mobile' | 'manual' | 'web' | 'card_...` |
| `LoginResponse` | union | `LoginOTPRequiredResponse | LoginResult

/**
 * ...` |
| `OTPPurpose` | union | `'login' | 'registration' | 'verify_email'

/**
...` |
| `BenefitType` | union | `'health_insurance' | 'life_insurance' | 'disabilit...` |
| `RateType` | union | `'hourly' | 'flat' | 'contingency' | 'retainer' | '...` |
| `RequirementType` | union | `'document_upload' | 'approval' | 'payment' | 'sign...` |
| `PartyType` | union | `'individual' | 'company' | 'government'

/**
 * En...` |
| `RiskTier` | union | `'healthy' | 'monitor' | 'at_risk' | 'critical'

//...` |
| `UpdateCompensationInput` | intersection | `Partial<CreateCompensationInput>

// API Functions...` |
| `CompensatoryLeaveStatus` | union | `| 'draft'
  | 'pending_approval'
  | 'approved'
  ...` |
| `TransactionExportFormat` | union | `'csv' | 'xlsx' | 'json' | 'pdf'

// ==============...` |
| `ExportFormat` | union | `'xlsx' | 'csv' | 'pdf' | 'json'
export type Entity...` |
| `VersionType` | union | `'major' | 'minor' | 'patch'

/**
 * Result of comp...` |
| `DocumentCategory` | union | `(typeof documentCategories)[number]

// Document i...` |
| `IncentiveType` | union | `| 'spot_bonus'
  | 'performance_bonus'
  | 'sales_...` |
| `UpdateEmployeeIncentiveData` | union | `Partial<CreateEmployeeIncentiveData>

export inter...` |
| `UpdatePromotionInput` | alias | `Partial<CreatePromotionInput>

export interface Pr...` |
| `TransferType` | union | `'internal' | 'external' | 'temporary' | 'permanent...` |
| `EventType` | union | `| 'meeting'       // Contract: Meeting
  | 'sessio...` |
| `RevaluationStatus` | union | `'draft' | 'posted' | 'reversed'

export interface ...` |
| `ExpenseCategory` | union | `'travel' | 'meals' | 'accommodation' | 'transporta...` |
| `ExpenseStatus` | union | `'draft' | 'pending_approval' | 'submitted' | 'appr...` |
| `FollowupType` | union | `(typeof followupTypes)[number]

// Follow-up statu...` |
| `GLReferenceModel` | union | `'Invoice' | 'Payment' | 'Expense' | 'Bill' | 'Jour...` |
| `GrievanceType` | union | `'compensation' | 'benefits' | 'working_conditions'...` |
| `NationalIdType` | union | `'saudi_id' | 'iqama' | 'gcc_id' | 'passport'
expor...` |
| `PositionType` | union | `'regular' | 'temporary' | 'project_based' | 'seaso...` |
| `JournalEntryStatus` | union | `'draft' | 'posted' | 'voided'

/**
 * Journal Entr...` |
| `LeaveType` | union | `| 'annual'       // إجازة سنوية (المادة 109)
  | '...` |
| `LoanType` | union | `'personal' | 'housing' | 'vehicle' | 'education' |...` |
| `MFAMethod` | union | `'totp' | 'backup_code' | 'webauthn' | 'sms' | 'ema...` |
| `PriorityTier` | union | `'P1_HOT' | 'P2_WARM' | 'P3_COOL' | 'P4_NURTURE'

e...` |
| `ContactType` | union | `'call' | 'email' | 'meeting' | 'whatsapp'

export ...` |
| `OAuthProvider` | union | `| 'google'
  | 'facebook'
  | 'apple'
  | 'twitter...` |
| `ExitType` | union | `'resignation' | 'termination' | 'contract_end' | '...` |
| `OnboardingStatus` | union | `'pending' | 'in_progress' | 'completed' | 'on_hold...` |
| `UnitType` | union | `'company' | 'division' | 'department' | 'section' ...` |
| `PasswordStrengthLevel` | union | `| 'very_weak'
  | 'weak'
  | 'medium'
  | 'strong'...` |
| `PayrollRunStatus` | union | `'draft' | 'calculating' | 'calculated' | 'approved...` |
| `PaymentStatus` | union | `'draft' | 'approved' | 'processing' | 'paid' | 'fa...` |
| `ReviewType` | union | `'annual' | 'mid_year' | 'quarterly' | 'probation' ...` |
| `OTPPurpose` | union | `'login' | 'registration' | 'verify_phone' | 'mfa'
...` |
| `QuoteStatus` | union | `| 'draft'
  | 'pending'
  | 'sent'
  | 'accepted'
...` |
| `EmploymentType` | union | `'full_time' | 'part_time' | 'contract' | 'temporar...` |
| `ReminderPriority` | union | `'low' | 'medium' | 'high' | 'urgent'

// Reminder ...` |
| `CreateReportInput` | union | `Omit<Report, 'reportId' | 'recordNumber' | 'create...` |
| `RetainerStatus` | union | `'active' | 'depleted' | 'refunded' | 'expired' | '...` |
| `ComponentType` | union | `'earning' | 'deduction'
export type ApplicableFor ...` |
| `ShiftAssignmentStatus` | union | `'active' | 'inactive' | 'scheduled'

// Shift Requ...` |
| `BreakType` | union | `'paid' | 'unpaid'

// Day of Week
export type DayO...` |
| `SkillCategory` | union | `'technical' | 'soft_skill' | 'language' | 'legal' ...` |
| `PlanStatus` | union | `'draft' | 'active' | 'closed'
export type PlanPrio...` |
| `ReauthMethod` | union | `'password' | 'totp' | 'email' | 'sms'

/**
 * Reau...` |
| `UpdateSuccessionPlanInput` | intersection | `Partial<CreateSuccessionPlanInput>

// API Functio...` |
| `EntityType` | union | `'case' | 'client' | 'invoice' | 'document' | 'task...` |
| `TaskStatus` | union | `'backlog' | 'todo' | 'in_progress' | 'done' | 'can...` |
| `TeamMemberStatus` | union | `| 'pending'
  | 'pending_approval'
  | 'active'
  ...` |
| `TimeType` | union | `'billable' | 'non_billable' | 'pro_bono' | 'intern...` |
| `TrainingType` | union | `'internal' | 'external' | 'online' | 'certificatio...` |
| `TrustAccountType` | union | `'iolta' | 'client_trust' | 'escrow' | 'retainer'

...` |
| `VehicleType` | union | `'sedan' | 'suv' | 'van' | 'truck' | 'motorcycle' |...` |
| `CountryCode` | union | `'SA' | 'AE' | 'US' | 'GB' | string

/**
 * Currenc...` |
| `WorkflowTriggerType` | union | `'manual' | 'event' | 'schedule'
export type Workfl...` |
| `AssetStatus` | union | `'draft' | 'submitted' | 'partially_depreciated' | ...` |
| `AutomatedActionTrigger` | union | `| 'on_create' // When record is created
  | 'on_wr...` |
| `LeadStatus` | union | `| 'new'
  | 'contacted'
  | 'qualified'
  | 'propo...` |
| `AutoActionTrigger` | union | `'enter' | 'exit' | 'stay'
export type AutoActionTy...` |
| `DocumentCategory` | union | `| 'contract'
  | 'pleading'
  | 'evidence'
  | 'co...` |
| `GanttTaskType` | union | `'task' | 'project' | 'milestone'
export type TaskP...` |
| `EmployeeStatus` | union | `'active' | 'inactive' | 'on_leave' | 'terminated' ...` |
| `IPType` | union | `'IPv4' | 'IPv6' | 'CIDR' | 'Range'

/**
 * Valid d...` |
| `LostReasonCategory` | union | `| 'price'        // Price-related issues (too high...` |
| `ThreadMessageType` | union | `| 'comment' // User comment (public or internal)
 ...` |
| `NajizIdentityType` | union | `| 'national_id'
  | 'iqama'
  | 'gcc_id'
  | 'pass...` |
| `OrganizationStatus` | union | `'active' | 'inactive' | 'suspended' | 'dissolved'
...` |
| `ProductType` | union | `'product' | 'service' | 'subscription' | 'retainer...` |
| `FirmRole` | union | `| 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
 ...` |
| `TicketStatus` | union | `'open' | 'replied' | 'resolved' | 'closed' | 'on_h...` |
| `UserRole` | union | `| 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
 ...` |
| `SanitizationType` | union | `'html' | 'url'` |
| `ValidationPatternKey` | union | `| 'nationalId'
  | 'iban'
  | 'phone'
  | 'crNumbe...` |
| `ValidationResult` | object | `{
  isValid: boolean` |
| `ErrorMessages` | object | `{
  en: string` |

---

## Enums

### ISSUE_SSO_TOKENS_MISSING (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | CRITICAL |
| endpoint | POST /api/auth/sso/callback |
| symptom | Users login via SSO but get 401 on all subsequent requests |
| frontendFile | src/services/oauthService.ts:311-330 |
| fix | Return accessToken and refreshToken at root level of response |

### ISSUE_CSRF_COOKIE (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | CRITICAL |
| endpoint | GET /api/auth/csrf + all mutating endpoints |
| symptom | 403 errors on POST/PUT/PATCH/DELETE,  |
| frontendFile | src/lib/api.ts:291-402 |
| fix | Set cookie with httpOnly:false, sameSite:none, secure:true; return in body |

### ISSUE_TOKEN_REFRESH (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | CRITICAL |
| endpoint | POST /api/auth/refresh |
| symptom | Users get logged out unexpectedly,  |
| frontendFile | src/lib/api.ts:232-263 |
| fix | Accept refreshToken in body, return both accessToken and refreshToken |

### ISSUE_LOGIN_MFA (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | HIGH |
| endpoint | POST /api/auth/login |
| symptom | MFA flow broken, users with MFA enabled can bypass it |
| frontendFile | src/services/authService.ts:93-148 |
| fix | Include mfaEnabled, mfaPending, mfaMethod, firmId, firm, permissions in response |

### ISSUE_CORS (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | HIGH |
| endpoint | All endpoints |
| symptom | Network errors, CORS errors in console, cookies not sent |
| frontendFile | src/lib/api.ts |
| fix | Configure CORS with credentials:true and proper origins |

### ISSUE_OTP_TOKENS (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | HIGH |
| endpoint | POST /api/auth/verify-otp |
| symptom | OTP verification succeeds but user not authenticated |
| frontendFile | src/services/authService.ts:891-933 |
| fix | Return accessToken and refreshToken after successful OTP verification |

### ISSUE_CAPTCHA (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | MEDIUM |
| endpoint | POST /api/auth/forgot-password |
| symptom | Security vulnerability if CAPTCHA not validated |
| frontendFile | src/features/auth/forgot-password/components/forgot-password-form.tsx |
| fix | Validate captchaToken with Cloudflare Turnstile API |

### ISSUE_RATE_LIMIT (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | MEDIUM |
| endpoint | All rate-limited endpoints |
| symptom | UI shows wrong wait time on rate limit |
| frontendFile | src/lib/api.ts:596-620, 936-980 |
| fix | Include waitTime/retryAfter in 429 response body and Retry-After header |

### ISSUE_ACCOUNT_LOCKOUT (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | MEDIUM |
| endpoint | POST /api/auth/login |
| symptom | UI shows wrong lockout time |
| frontendFile | src/lib/api.ts:912-933 |
| fix | Include remainingTime (minutes) in 423 response |

### ISSUE_SESSION_HEADERS (const)
**Path:** `config/BACKEND_AUTH_ISSUES.ts`

| Key | Value |
|-----|-------|
| severity | MEDIUM |
| endpoint | All authenticated endpoints |
| symptom | Users get logged out without warning |
| frontendFile | src/lib/api.ts:844-865 |
| fix | Send x-session-* headers when approaching timeout |

### API_CONFIG (const)
**Path:** `config/api.ts`

| Key | Value |
|-----|-------|
| version | v1 |

### FeatureStatus (const)
**Path:** `config/feature-flags.ts`

| Key | Value |
|-----|-------|
| AVAILABLE | available |
| NOT_IMPLEMENTED | not_implemented |
| NOT_MOUNTED | not_mounted |
| PARTIAL | partial |
| TEST_ONLY | test_only |

### TAX_CONFIG (const)
**Path:** `config/tax.ts`

| Key | Value |
|-----|-------|
| VAT_NUMBER_PREFIX | 3 |

### EXPORT (const)
**Path:** `config/ui-constants.ts`

| Key | Value |
|-----|-------|
| DEFAULT_PAGE_SIZE | a4 |
| DEFAULT_ORIENTATION | portrait |

### ERROR_CODES (const)
**Path:** `constants/errorCodes.ts`

| Key | Value |
|-----|-------|
| RATE_LIMIT_EXCEEDED | RATE_LIMIT_EXCEEDED |
| AUTH_RATE_LIMIT | AUTH_RATE_LIMIT |
| TOKEN_EXPIRED | TOKEN_EXPIRED |
| INVALID_TOKEN | INVALID_TOKEN |
| TOKEN_NOT_ACTIVE | TOKEN_NOT_ACTIVE |
| SESSION_IDLE_TIMEOUT | SESSION_IDLE_TIMEOUT |
| SESSION_ABSOLUTE_TIMEOUT | SESSION_ABSOLUTE_TIMEOUT |
| ACCOUNT_LOCKED | ACCOUNT_LOCKED |
| INVALID_CREDENTIALS | INVALID_CREDENTIALS |
| USER_NOT_FOUND | USER_NOT_FOUND |
| CSRF_TOKEN_INVALID | CSRF_TOKEN_INVALID |
| CSRF_TOKEN_MISSING | CSRF_TOKEN_MISSING |
| VALIDATION_ERROR | VALIDATION_ERROR |
| CIRCUIT_OPEN | CIRCUIT_OPEN |
| CANCELLED | CANCELLED |

### EmployeeNationality
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| SAUDI | SA |
| GCC | GCC |
| EXPAT | EXPAT |

### NitaqatBand
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| PLATINUM | platinum |
| GREEN_HIGH | green_high |
| GREEN_MID | green_mid |
| GREEN_LOW | green_low |
| YELLOW | yellow |
| RED | red |

### GosiRegistrationStatus
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| ACTIVE | active |
| PENDING | pending |
| SUSPENDED | suspended |
| TERMINATED | terminated |

### WpsPaymentStatus
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| PENDING | pending |
| SUBMITTED | submitted |
| PROCESSING | processing |
| COMPLETED | completed |
| REJECTED | rejected |
| FAILED | failed |

### SadadPaymentStatus
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| PENDING | pending |
| PAID | paid |
| OVERDUE | overdue |
| CANCELLED | cancelled |

### MudadSubmissionStatus
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| DRAFT | draft |
| SUBMITTED | submitted |
| ACCEPTED | accepted |
| REJECTED | rejected |
| CORRECTION_REQUIRED | correction_required |

### WPS_CONSTRAINTS (const)
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| FILE_FORMAT | SIF |
| ENCODING | UTF-8 |

### REGULATORY_DATES (const)
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| GOSI_REFORM_DATE | 2024-07-03 |
| WPS_MANDATORY_DATE | 2013-09-01 |

### SARIE_BANK_IDS (const)
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| SABB | 45 |
| ALRAJHI | 80 |
| SNB | 10 |
| ALAHLI | 10 |
| RIYADBANK | 20 |
| BANQUE_SAUDI_FRANSI | 55 |
| ARAB_NATIONAL_BANK | 30 |
| SAMBA | 40 |
| ALINMA | 05 |
| ALBILAD | 15 |
| ALJAZIRA | 60 |
| GULF_INTERNATIONAL | 65 |
| EMIRATES_NBD | 70 |
| FIRST_ABU_DHABI | 75 |

### SAUDI_BANKING_ERROR_CODES (const)
**Path:** `constants/saudi-banking.ts`

| Key | Value |
|-----|-------|
| GOSI_INVALID_ID | GOSI_001 |
| GOSI_EMPLOYEE_NOT_FOUND | GOSI_002 |
| GOSI_DUPLICATE_REGISTRATION | GOSI_003 |
| GOSI_INVALID_SALARY | GOSI_004 |
| GOSI_SUBSCRIPTION_EXPIRED | GOSI_005 |
| WPS_INVALID_FILE_FORMAT | WPS_001 |
| WPS_MISSING_EMPLOYEE_DATA | WPS_002 |
| WPS_INVALID_BANK_CODE | WPS_003 |
| WPS_BATCH_SIZE_EXCEEDED | WPS_004 |
| WPS_DUPLICATE_PAYMENT | WPS_005 |
| SADAD_INVALID_BILL_NUMBER | SADAD_001 |
| SADAD_PAYMENT_FAILED | SADAD_002 |
| SADAD_INSUFFICIENT_BALANCE | SADAD_003 |
| SADAD_BILL_ALREADY_PAID | SADAD_004 |
| MUDAD_SUBMISSION_FAILED | MUDAD_001 |
| ... | +7 more |

### KBD_COLORS (const)
**Path:** `hooks/useKeyboardShortcuts.ts`

| Key | Value |
|-----|-------|
| emerald | bg-emerald-100 text-emerald-600 |
| blue | bg-blue-100 text-blue-600 |
| amber | bg-amber-100 text-amber-600 |
| red | bg-red-100 text-red-500 |
| slate | bg-slate-100 text-slate-500 |

### HSTS_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | Strict-Transport-Security |
| value | max-age=31536000; includeSubDomains; preload |

### X_FRAME_OPTIONS_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | X-Frame-Options |
| value | DENY |

### X_CONTENT_TYPE_OPTIONS_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | X-Content-Type-Options |
| value | nosniff |

### X_XSS_PROTECTION_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | X-XSS-Protection |
| value | 1; mode=block |

### REFERRER_POLICY_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | Referrer-Policy |
| value | strict-origin-when-cross-origin |

### PERMISSIONS_POLICY_HEADER (const)
**Path:** `lib/security-headers.ts`

| Key | Value |
|-----|-------|
| key | Permissions-Policy |
| value | camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=() |

### AUTH_ENDPOINTS (const)
**Path:** `sdk/core/src/constants.ts`

| Key | Value |
|-----|-------|
| LOGIN | /auth/login |
| REGISTER | /auth/register |
| LOGOUT | /auth/logout |
| ME | /auth/me |
| REFRESH | /auth/refresh |
| CHECK_AVAILABILITY | /auth/check-availability |
| OAUTH_GOOGLE | /auth/oauth/google |
| OAUTH_MICROSOFT | /auth/oauth/microsoft |
| OAUTH_CALLBACK | /auth/oauth/callback |
| GOOGLE_ONE_TAP | /auth/google/one-tap |
| SSO_DETECT | /auth/sso/detect |
| SSO_INITIATE | /auth/sso/initiate |
| SSO_CALLBACK | /auth/sso/callback |
| SEND_OTP | /auth/send-otp |
| VERIFY_OTP | /auth/verify-otp |
| ... | +21 more |

### STORAGE_KEYS (const)
**Path:** `sdk/core/src/constants.ts`

| Key | Value |
|-----|-------|
| ACCESS_TOKEN | traf3li_access_token |
| REFRESH_TOKEN | traf3li_refresh_token |
| USER | traf3li_user |
| DEVICE_ID | traf3li_device_id |
| MFA_PENDING | traf3li_mfa_pending |

### ERROR_CODES (const)
**Path:** `sdk/core/src/constants.ts`

| Key | Value |
|-----|-------|
| INVALID_CREDENTIALS | INVALID_CREDENTIALS |
| ACCOUNT_LOCKED | ACCOUNT_LOCKED |
| ACCOUNT_DISABLED | ACCOUNT_DISABLED |
| EMAIL_NOT_VERIFIED | EMAIL_NOT_VERIFIED |
| MFA_REQUIRED | MFA_REQUIRED |
| MFA_INVALID | MFA_INVALID |
| TOKEN_EXPIRED | TOKEN_EXPIRED |
| TOKEN_INVALID | TOKEN_INVALID |
| REFRESH_TOKEN_EXPIRED | REFRESH_TOKEN_EXPIRED |
| RATE_LIMITED | RATE_LIMITED |
| TOO_MANY_ATTEMPTS | TOO_MANY_ATTEMPTS |
| VALIDATION_ERROR | VALIDATION_ERROR |
| EMAIL_TAKEN | EMAIL_TAKEN |
| USERNAME_TAKEN | USERNAME_TAKEN |
| PHONE_TAKEN | PHONE_TAKEN |
| ... | +8 more |

### DEFAULT_CONFIG (const)
**Path:** `sdk/core/src/constants.ts`

| Key | Value |
|-----|-------|
| storage | localStorage |

### CompensationStatus
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| ACTIVE | active |
| PENDING | pending |
| HISTORICAL | historical |
| CANCELLED | cancelled |

### PaymentFrequency
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| MONTHLY | monthly |
| BI_WEEKLY | bi_weekly |
| WEEKLY | weekly |

### SalaryBasis
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| MONTHLY | monthly |
| ANNUAL | annual |
| HOURLY | hourly |
| DAILY | daily |

### PaymentMethod
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| BANK_TRANSFER | bank_transfer |
| CASH | cash |
| CHECK | check |

### CalculationType
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| FIXED | fixed |
| PERCENTAGE_OF_BASIC | percentage_of_basic |

### AllowanceType
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| HOUSING | housing |
| TRANSPORTATION | transportation |
| MOBILE | mobile |
| EDUCATION | education |
| MEAL | meal |
| COST_OF_LIVING | cost_of_living |
| SHIFT | shift |
| HAZARD | hazard |
| PROFESSIONAL | professional |
| LANGUAGE | language |
| CLOTHING | clothing |
| RELOCATION | relocation |
| UTILITIES | utilities |
| OTHER | other |

### BonusType
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| DISCRETIONARY | discretionary |
| PERFORMANCE_BASED | performance_based |
| PROFIT_SHARING | profit_sharing |
| GUARANTEED | guaranteed |

### ChangeType
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| NEW_HIRE | new_hire |
| MERIT_INCREASE | merit_increase |
| PROMOTION | promotion |
| MARKET_ADJUSTMENT | market_adjustment |
| COST_OF_LIVING | cost_of_living |
| RETENTION | retention |
| EQUITY_ADJUSTMENT | equity_adjustment |
| RECLASSIFICATION | reclassification |
| DEMOTION | demotion |
| CORRECTION | correction |
| OTHER | other |

### ReviewStatus
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| NOT_STARTED | not_started |
| IN_PROGRESS | in_progress |
| PENDING_APPROVAL | pending_approval |
| APPROVED | approved |
| IMPLEMENTED | implemented |
| DEFERRED | deferred |
| DECLINED | declined |

### CompaRatioCategory
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| BELOW_RANGE | below_range |
| IN_RANGE_LOW | in_range_low |
| IN_RANGE_MID | in_range_mid |
| IN_RANGE_HIGH | in_range_high |
| ABOVE_RANGE | above_range |

### CompensationModel
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| SALARY | salary |
| SALARY_PLUS_BONUS | salary_plus_bonus |
| EAT_WHAT_YOU_KILL | eat_what_you_kill |
| LOCKSTEP | lockstep |
| MODIFIED_LOCKSTEP | modified_lockstep |
| HYBRID | hybrid |

### PartnershipTier
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| EQUITY_PARTNER | equity_partner |
| NON_EQUITY_PARTNER | non_equity_partner |
| INCOME_PARTNER | income_partner |
| OF_COUNSEL | of_counsel |

### EmploymentType
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| FULL_TIME | full_time |
| PART_TIME | part_time |
| CONTRACT | contract |

### MaritalStatus
**Path:** `services/compensationService.ts`

| Key | Value |
|-----|-------|
| SINGLE | single |
| MARRIED | married |
| DIVORCED | divorced |
| WIDOWED | widowed |

### PromotionStatus
**Path:** `services/employeePromotionService.ts`

| Key | Value |
|-----|-------|
| DRAFT | draft |
| PENDING_APPROVAL | pending_approval |
| APPROVED | approved |
| REJECTED | rejected |
| CANCELLED | cancelled |

### PromotionProperty
**Path:** `services/employeePromotionService.ts`

| Key | Value |
|-----|-------|
| DEPARTMENT | department |
| DESIGNATION | designation |
| GRADE | grade |
| SALARY | salary |
| BRANCH | branch |

### ApprovalStepStatus
**Path:** `services/employeePromotionService.ts`

| Key | Value |
|-----|-------|
| PENDING | pending |
| APPROVED | approved |
| REJECTED | rejected |
| SKIPPED | skipped |

### ReportSection
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| HR | hr |
| FINANCE | finance |
| TASKS | tasks |
| CRM | crm |
| SALES | sales |
| GENERAL | general |

### ReportCategory
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| HR | auto |
| Categories | auto |
| EMPLOYEE_DATA | employee_data |
| PAYROLL | payroll |
| ATTENDANCE | attendance |
| TIME_TRACKING | time_tracking |
| PERFORMANCE | performance |
| RECRUITMENT | recruitment |
| TRAINING | training |
| BENEFITS | benefits |
| COMPENSATION | compensation |
| SUCCESSION | succession |
| Finance | auto |
| Categories | auto |
| INVOICES | invoices |
| ... | +49 more |

### ReportType
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| STANDARD | standard |
| CUSTOM | custom |
| DASHBOARD | dashboard |
| KPI | kpi |
| ANALYTICS | analytics |
| COMPLIANCE | compliance |
| AUDIT | audit |
| EXCEPTION | exception |
| TREND | trend |
| COMPARISON | comparison |

### ReportFormat
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| TABULAR | tabular |
| SUMMARY | summary |
| DETAILED | detailed |
| GRAPH | graph |
| CHART | chart |
| PIVOT | pivot |
| MATRIX | matrix |
| DASHBOARD | dashboard |
| SCORECARD | scorecard |

### OutputFormat
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| PDF | pdf |
| EXCEL | excel |
| CSV | csv |
| WORD | word |
| POWERPOINT | powerpoint |
| HTML | html |
| JSON | json |
| XML | xml |

### UsageFrequency
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| DAILY | daily |
| WEEKLY | weekly |
| MONTHLY | monthly |
| QUARTERLY | quarterly |
| ANNUAL | annual |
| AD_HOC | ad_hoc |

### CriticalityLevel
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| CRITICAL | critical |
| IMPORTANT | important |
| STANDARD | standard |
| NICE_TO_HAVE | nice_to_have |

### DataSourceType
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| DATABASE | database |
| API | api |
| FILE | file |
| EXTERNAL_SYSTEM | external_system |
| DATA_WAREHOUSE | data_warehouse |

### DataRefreshRate
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| REAL_TIME | real_time |
| HOURLY | hourly |
| DAILY | daily |
| WEEKLY | weekly |
| ON_DEMAND | on_demand |

### ParameterType
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| DATE | date |
| DATE_RANGE | date_range |
| EMPLOYEE | employee |
| DEPARTMENT | department |
| LOCATION | location |
| JOB_LEVEL | job_level |
| SALARY_GRADE | salary_grade |
| STATUS | status |
| DROPDOWN | dropdown |
| MULTI_SELECT | multi_select |
| TEXT | text |
| NUMBER | number |

### FilterOperator
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| EQUALS | equals |
| NOT_EQUALS | not_equals |
| CONTAINS | contains |
| STARTS_WITH | starts_with |
| GREATER_THAN | greater_than |
| LESS_THAN | less_than |
| BETWEEN | between |
| IN | in |
| NOT_IN | not_in |

### ChartType
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| BAR | bar |
| COLUMN | column |
| LINE | line |
| PIE | pie |
| DONUT | donut |
| AREA | area |
| SCATTER | scatter |
| BUBBLE | bubble |
| GAUGE | gauge |
| FUNNEL | funnel |
| WATERFALL | waterfall |
| HEATMAP | heatmap |
| TREEMAP | treemap |

### ScheduleFrequency
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| DAILY | daily |
| WEEKLY | weekly |
| MONTHLY | monthly |
| QUARTERLY | quarterly |
| ANNUAL | annual |

### ScheduleStatus
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| ACTIVE | active |
| PAUSED | paused |
| EXPIRED | expired |
| COMPLETED | completed |

### ExecutionStatus
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| SCHEDULED | scheduled |
| RUNNING | running |
| COMPLETED | completed |
| FAILED | failed |
| CANCELLED | cancelled |

### AccessLevel
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| PUBLIC | public |
| INTERNAL | internal |
| MANAGEMENT | management |
| HR | hr |
| FINANCE | finance |
| EXECUTIVE | executive |
| RESTRICTED | restricted |
| CONFIDENTIAL | confidential |

### ReportStatus
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| ACTIVE | active |
| INACTIVE | inactive |
| DRAFT | draft |
| ARCHIVED | archived |
| DEPRECATED | deprecated |

### DataModule
**Path:** `services/reportsService.ts`

| Key | Value |
|-----|-------|
| HR | auto |
| Modules | auto |
| EMPLOYEES | employees |
| PAYROLL | payroll |
| ATTENDANCE | attendance |
| PERFORMANCE | performance |
| RECRUITMENT | recruitment |
| TRAINING | training |
| BENEFITS | benefits |
| COMPENSATION | compensation |
| SUCCESSION | succession |
| GRIEVANCES | grievances |
| ORGANIZATIONAL_STRUCTURE | organizational_structure |
| JOB_POSITIONS | job_positions |
| Finance | auto |
| ... | +39 more |

### BonusType
**Path:** `services/retentionBonusService.ts`

| Key | Value |
|-----|-------|
| RETENTION | retention |
| SIGNING | signing |
| PROJECT_COMPLETION | project_completion |
| PERFORMANCE | performance |
| LOYALTY | loyalty |
| REFERRAL | referral |

### BonusStatus
**Path:** `services/retentionBonusService.ts`

| Key | Value |
|-----|-------|
| DRAFT | draft |
| PENDING_APPROVAL | pending_approval |
| APPROVED | approved |
| PAID | paid |
| CLAWED_BACK | clawed_back |
| CANCELLED | cancelled |

### PaymentMethod
**Path:** `services/retentionBonusService.ts`

| Key | Value |
|-----|-------|
| PAYROLL | payroll |
| SEPARATE_PAYMENT | separate_payment |

### ApprovalStatus
**Path:** `services/retentionBonusService.ts`

| Key | Value |
|-----|-------|
| PENDING | pending |
| APPROVED | approved |
| REJECTED | rejected |

### PositionCriticality
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| CRITICAL | critical |
| HIGH | high |
| MEDIUM | medium |
| LOW | low |

### RiskLevel
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| HIGH | high |
| MEDIUM | medium |
| LOW | low |

### PlanStatus
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| DRAFT | draft |
| ACTIVE | active |
| UNDER_REVIEW | under_review |
| APPROVED | approved |
| ON_HOLD | on_hold |
| COMPLETED | completed |
| ARCHIVED | archived |

### PlanType
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| INDIVIDUAL | individual |
| DEPARTMENT | department |
| ORGANIZATION_WIDE | organization_wide |
| EMERGENCY | emergency |

### PlanScope
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| SINGLE_POSITION | single_position |
| MULTIPLE_POSITIONS | multiple_positions |
| LEADERSHIP_TIER | leadership_tier |
| CRITICAL_ROLES | critical_roles |

### ReviewCycle
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| QUARTERLY | quarterly |
| SEMI_ANNUAL | semi_annual |
| ANNUAL | annual |
| BIENNIAL | biennial |

### ReadinessLevel
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| READY_NOW | ready_now |
| READY_1_YEAR | ready_1_year |
| READY_2_YEARS | ready_2_years |
| READY_3_PLUS_YEARS | ready_3_plus_years |
| NOT_READY | not_ready |

### PerformanceRating
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| EXCEPTIONAL | exceptional |
| EXCEEDS | exceeds |
| MEETS | meets |
| NEEDS_IMPROVEMENT | needs_improvement |
| UNSATISFACTORY | unsatisfactory |

### PotentialRating
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| HIGH | high |
| MEDIUM | medium |
| LOW | low |
| UNKNOWN | unknown |

### RetentionRisk
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| HIGH | high |
| MEDIUM | medium |
| LOW | low |

### ApprovalStatus
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| PENDING | pending |
| APPROVED | approved |
| REJECTED | rejected |
| REVISION_REQUIRED | revision_required |

### TransferStatus
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| NOT_STARTED | not_started |
| IN_PROGRESS | in_progress |
| COMPLETED | completed |
| DELAYED | delayed |

### BenchStrengthScore
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| STRONG | strong |
| ADEQUATE | adequate |
| WEAK | weak |
| CRITICAL | critical |

### PartnerTrack
**Path:** `services/successionPlanningService.ts`

| Key | Value |
|-----|-------|
| EQUITY | equity |
| NON_EQUITY | non_equity |
| COUNSEL | counsel |
| OF_COUNSEL | of_counsel |

### MESSAGE_SUBTYPES (const)
**Path:** `types/message.ts`

| Key | Value |
|-----|-------|
| COMMENT | mail.mt_comment |
| NOTE | mail.mt_note |
| ACTIVITIES | mail.mt_activities |
| STAGE_CHANGE | mail.mt_stage_change |
| TRACKING | mail.mt_tracking |

### AUTH_ERROR_CODES (const)
**Path:** `utils/authErrors.ts`

| Key | Value |
|-----|-------|
| INVALID_CREDENTIALS | INVALID_CREDENTIALS |
| ACCOUNT_LOCKED | ACCOUNT_LOCKED |
| ACCOUNT_DISABLED | ACCOUNT_DISABLED |
| ACCOUNT_SUSPENDED | ACCOUNT_SUSPENDED |
| EMAIL_NOT_VERIFIED | EMAIL_NOT_VERIFIED |
| PHONE_NOT_VERIFIED | PHONE_NOT_VERIFIED |
| MFA_REQUIRED | MFA_REQUIRED |
| MFA_INVALID_CODE | MFA_INVALID_CODE |
| MFA_NOT_ENABLED | MFA_NOT_ENABLED |
| MFA_ALREADY_ENABLED | MFA_ALREADY_ENABLED |
| SESSION_EXPIRED | SESSION_EXPIRED |
| SESSION_IDLE_TIMEOUT | SESSION_IDLE_TIMEOUT |
| SESSION_ABSOLUTE_TIMEOUT | SESSION_ABSOLUTE_TIMEOUT |
| REAUTHENTICATION_REQUIRED | REAUTHENTICATION_REQUIRED |
| CONCURRENT_SESSION_LIMIT | CONCURRENT_SESSION_LIMIT |
| ... | +33 more |

---

## Zod Schemas

| Schema | Type | Path |
|--------|------|------|
| `shiftAssignmentSchema` | object | components/hr/attendance/ShiftAssignmentDialog.tsx |
| `shiftRequestSchema` | object | components/hr/attendance/ShiftRequestDialog.tsx |
| `incentiveFormSchema` | object | components/hr/compensation/EmployeeIncentiveDialog.tsx |
| `bonusFormSchema` | object | components/hr/compensation/RetentionBonusDialog.tsx |
| `educationSchema` | object | components/hr/employees/EducationDialog.tsx |
| `workHistoryFormSchema` | object | components/hr/employees/WorkHistoryDialog.tsx |
| `compensatoryLeaveFormSchema` | object | components/hr/leave/CompensatoryLeaveDialog.tsx |
| `encashmentFormSchema` | object | components/hr/leave/LeaveEncashmentDialog.tsx |
| `leavePeriodSchema` | object | components/hr/leave/LeavePeriodDialog.tsx |
| `salaryComponentSchema` | object | components/hr/payroll/SalaryComponentDialog.tsx |
| `formSchema` | object | components/hr/recruitment/StaffingPlanDetailDialog.tsx |
| `formSchema` | object | components/hr/recruitment/StaffingPlanDialog.tsx |
| `approveTrainingSchema` | object | components/hr/training/TrainingDialogs.tsx |
| `rejectTrainingSchema` | object | components/hr/training/TrainingDialogs.tsx |
| `completeTrainingSchema` | object | components/hr/training/TrainingDialogs.tsx |
| `trainingEvaluationSchema` | object | components/hr/training/TrainingDialogs.tsx |
| `vehicleSchema` | object | components/hr/vehicles/VehicleDialog.tsx |
| `vehicleLogSchema` | object | components/hr/vehicles/VehicleLogDialog.tsx |
| `formSchema` | object | features/auth/otp/components/otp-form.tsx |
| `registrationSchema` | object | features/auth/sign-up/data/schema.ts |
| `formSchema` | object | features/billing-rates/components/group-action-dialog.tsx |
| `formSchema` | object | features/billing-rates/components/rate-action-dialog.tsx |
| `rateTypeSchema` | enum | features/billing-rates/data/schema.ts |
| `rateCategorySchema` | enum | features/billing-rates/data/schema.ts |
| `currencySchema` | enum | features/billing-rates/data/schema.ts |
| `billingRateSchema` | object | features/billing-rates/data/schema.ts |
| `rateGroupSchema` | object | features/billing-rates/data/schema.ts |
| `timeEntryStatusSchema` | enum | features/billing-rates/data/schema.ts |
| `timeEntrySchema` | object | features/billing-rates/data/schema.ts |
| `richTextAnnotationSchema` | object | features/case-notion/data/schema.ts |
| `richTextItemSchema` | object | features/case-notion/data/schema.ts |
| `blockConnectionSchema` | object | features/case-notion/data/schema.ts |
| `pageIconSchema` | object | features/case-notion/data/schema.ts |
| `pageCoverSchema` | object | features/case-notion/data/schema.ts |
| `caseNotionPageSchema` | object | features/case-notion/data/schema.ts |
| `syncedBlockSchema` | object | features/case-notion/data/schema.ts |
| `pageTemplateSchema` | object | features/case-notion/data/schema.ts |
| `blockCommentSchema` | object | features/case-notion/data/schema.ts |
| `pageActivitySchema` | object | features/case-notion/data/schema.ts |
| `createPageInputSchema` | object | features/case-notion/data/schema.ts |
| `updatePageInputSchema` | object | features/case-notion/data/schema.ts |
| `pageFiltersSchema` | object | features/case-notion/data/schema.ts |
| `createBlockInputSchema` | object | features/case-notion/data/schema.ts |
| `updateBlockInputSchema` | object | features/case-notion/data/schema.ts |
| `moveBlockInputSchema` | object | features/case-notion/data/schema.ts |
| `formSchema` | object | features/case-workflows/components/workflows-action-dialog.tsx |
| `formSchema` | object | features/case-workflows/components/workflows-duplicate-dialog.tsx |
| `stageFormSchema` | object | features/case-workflows/components/workflows-stages-dialog.tsx |
| `stageRequirementSchema` | object | features/case-workflows/data/schema.ts |
| `workflowStageSchema` | object | features/case-workflows/data/schema.ts |
| `stageTransitionSchema` | object | features/case-workflows/data/schema.ts |
| `workflowTemplateSchema` | object | features/case-workflows/data/schema.ts |
| `stageHistoryEntrySchema` | object | features/case-workflows/data/schema.ts |
| `completedRequirementSchema` | object | features/case-workflows/data/schema.ts |
| `caseStageProgressSchema` | object | features/case-workflows/data/schema.ts |
| `createCaseSchema` | object | features/cases/components/create-case-form.tsx |
| `createCaseSchema` | object | features/cases/components/create-case-view.tsx |
| `moveCaseToStageSchema` | object | features/cases/data/case-pipeline-schema.ts |
| `endCaseSchema` | object | features/cases/data/case-pipeline-schema.ts |
| `formSchema` | object | features/clients/components/clients-action-dialog.tsx |
| `identityTypeSchema` | enum | features/clients/data/schema.ts |
| `genderSchema` | enum | features/clients/data/schema.ts |
| `maritalStatusSchema` | enum | features/clients/data/schema.ts |
| `gccCountrySchema` | enum | features/clients/data/schema.ts |
| `clientSchema` | object | features/clients/data/schema.ts |
| `clientListSchema` | array | features/clients/data/schema.ts |
| `createClientSchema` | object | features/clients/data/schema.ts |
| `contactTypeSchema` | enum | features/contacts/data/schema.ts |
| `contactCategorySchema` | enum | features/contacts/data/schema.ts |
| `contactStatusSchema` | enum | features/contacts/data/schema.ts |
| `arabicNameSchema` | object | features/contacts/data/schema.ts |
| `contactSchema` | object | features/contacts/data/schema.ts |
| `createContactSchema` | object | features/contacts/data/schema.ts |
| `quoteFormSchema` | object | features/crm/views/quote-form-view.tsx |
| `profileFormSchema` | object | features/dashboard-settings/profile-page.tsx |
| `exportFormatSchema` | enum | features/data-export/data/schema.ts |
| `entityTypeSchema` | enum | features/data-export/data/schema.ts |
| `exportJobStatusSchema` | enum | features/data-export/data/schema.ts |
| `importJobStatusSchema` | enum | features/data-export/data/schema.ts |
| `exportOptionsSchema` | object | features/data-export/data/schema.ts |
| `exportJobSchema` | object | features/data-export/data/schema.ts |
| `importOptionsSchema` | object | features/data-export/data/schema.ts |
| `importErrorSchema` | object | features/data-export/data/schema.ts |
| `importJobSchema` | object | features/data-export/data/schema.ts |
| `importPreviewSchema` | object | features/data-export/data/schema.ts |
| `exportTemplateSchema` | object | features/data-export/data/schema.ts |
| `entityColumnSchema` | object | features/data-export/data/schema.ts |
| `documentSchema` | object | features/documents/data/schema.ts |
| `documentVersionSchema` | object | features/documents/data/schema.ts |
| `createDocumentSchema` | object | features/documents/data/schema.ts |
| `updateDocumentSchema` | object | features/documents/data/schema.ts |
| `documentFiltersSchema` | object | features/documents/data/schema.ts |
| `formSchema` | object | features/finance/components/vendors-action-dialog.tsx |
| `followupHistoryEntrySchema` | object | features/followups/data/schema.ts |
| `followupSchema` | object | features/followups/data/schema.ts |
| `createFollowupSchema` | object | features/followups/data/schema.ts |
| `shiftTypeFormSchema` | object | features/hr/components/shift-types-list-view.tsx |
| `formSchema` | object | features/invoice-templates/components/template-action-dialog.tsx |
| `formSchema` | object | features/invoice-templates/components/template-duplicate-dialog.tsx |
| `templateTypeSchema` | enum | features/invoice-templates/data/schema.ts |
| `headerSchema` | object | features/invoice-templates/data/schema.ts |
| `clientSectionSchema` | object | features/invoice-templates/data/schema.ts |
| `itemsSectionSchema` | object | features/invoice-templates/data/schema.ts |
| `footerSchema` | object | features/invoice-templates/data/schema.ts |
| `stylingSchema` | object | features/invoice-templates/data/schema.ts |
| `numberingFormatSchema` | object | features/invoice-templates/data/schema.ts |
| `taxSettingsSchema` | object | features/invoice-templates/data/schema.ts |
| `invoiceTemplateSchema` | object | features/invoice-templates/data/schema.ts |
| `createLeadSchema` | object | features/leads/components/create-lead-view.tsx |
| `organizationTypeSchema` | enum | features/organizations/data/schema.ts |
| `organizationSizeSchema` | enum | features/organizations/data/schema.ts |
| `organizationStatusSchema` | enum | features/organizations/data/schema.ts |
| `conflictCheckStatusSchema` | enum | features/organizations/data/schema.ts |
| `keyContactSchema` | object | features/organizations/data/schema.ts |
| `organizationSchema` | object | features/organizations/data/schema.ts |
| `reportConfigSchema` | object | features/reports/components/report-config-dialog.tsx |
| `reportTypeSchema` | enum | features/reports/data/schema.ts |
| `reportPeriodSchema` | enum | features/reports/data/schema.ts |
| `reportFormatSchema` | enum | features/reports/data/schema.ts |
| `chartTypeSchema` | enum | features/reports/data/schema.ts |
| `scheduleFrequencySchema` | enum | features/reports/data/schema.ts |
| `reportFiltersSchema` | object | features/reports/data/schema.ts |
| `reportConfigSchema` | object | features/reports/data/schema.ts |
| `savedReportSchema` | object | features/reports/data/schema.ts |
| `widgetSizeSchema` | enum | features/reports/data/schema.ts |
| `widgetTypeSchema` | enum | features/reports/data/schema.ts |
| `dashboardWidgetSchema` | object | features/reports/data/schema.ts |
| `revenueByPeriodSchema` | object | features/reports/data/schema.ts |
| `revenueByClientSchema` | object | features/reports/data/schema.ts |
| `revenueReportSchema` | object | features/reports/data/schema.ts |
| `caseReportSchema` | object | features/reports/data/schema.ts |
| `reportSummarySchema` | object | features/reports/data/schema.ts |
| `createReportConfigSchema` | object | features/reports/data/schema.ts |
| `appearanceFormSchema` | object | features/settings/appearance/appearance-form.tsx |
| `displayFormSchema` | object | features/settings/display/display-form.tsx |
| `notificationsFormSchema` | object | features/settings/notifications/notifications-form.tsx |
| `editFormSchema` | object | features/staff/components/staff-action-dialog.tsx |
| `inviteFormSchema` | object | features/staff/components/staff-action-dialog.tsx |
| `staffSchema` | object | features/staff/data/schema.ts |
| `staffListSchema` | array | features/staff/data/schema.ts |
| `processDepartureSchema` | object | features/staff/data/schema.ts |
| `subscriptionFormSchema` | object | features/subscriptions/components/subscription-create-view.tsx |
| `subscriptionPlanSchema` | object | features/subscriptions/components/subscription-plan-form-view.tsx |
| `tagSchema` | object | features/tags/data/schema.ts |
| `createTagSchema` | object | features/tags/data/schema.ts |
| `tagFiltersSchema` | object | features/tags/data/schema.ts |
| `formSchema` | object | features/tasks/components/tasks-import-dialog.tsx |
| `subtaskSchema` | object | features/tasks/data/schema.ts |
| `checklistItemSchema` | object | features/tasks/data/schema.ts |
| `checklistSchema` | object | features/tasks/data/schema.ts |
| `timeSessionSchema` | object | features/tasks/data/schema.ts |
| `timeTrackingSchema` | object | features/tasks/data/schema.ts |
| `taskBillingSchema` | object | features/tasks/data/schema.ts |
| `statutoryReferenceSchema` | object | features/tasks/data/schema.ts |
| `hijriDateSchema` | object | features/tasks/data/schema.ts |
| `attachmentSchema` | object | features/tasks/data/schema.ts |
| `commentSchema` | object | features/tasks/data/schema.ts |
| `historyEntrySchema` | object | features/tasks/data/schema.ts |
| `linkedJudgmentSchema` | object | features/tasks/data/schema.ts |
| `linkedLawSchema` | object | features/tasks/data/schema.ts |
| `knowledgeLinksSchema` | object | features/tasks/data/schema.ts |
| `relatedDocumentSchema` | object | features/tasks/data/schema.ts |
| `locationSchema` | object | features/tasks/data/schema.ts |
| `locationTriggerSchema` | object | features/tasks/data/schema.ts |
| `recurringConfigSchema` | object | features/tasks/data/schema.ts |
| `taskReminderSchema` | object | features/tasks/data/schema.ts |
| `userReferenceSchema` | object | features/tasks/data/schema.ts |
| `caseReferenceSchema` | object | features/tasks/data/schema.ts |
| `clientReferenceSchema` | object | features/tasks/data/schema.ts |
| `taskSchema` | object | features/tasks/data/schema.ts |
| `taskFormSchema` | object | features/tasks/data/schema.ts |
| `taskFiltersSchema` | object | features/tasks/data/schema.ts |
| `formSchema` | object | features/users/components/users-invite-dialog.tsx |
| `userSchema` | object | features/users/data/schema.ts |
| `userListSchema` | array | features/users/data/schema.ts |
| `paginationSchema` | object | lib/shared-schemas.ts |
| `searchSchema` | object | lib/shared-schemas.ts |
| `bulkOperationSchema` | object | lib/shared-schemas.ts |
| `searchSchema` | object | routes/(auth)/magic-link.tsx |
| `searchSchema` | object | routes/(auth)/mfa-challenge.tsx |
| `otpSearchSchema` | object | routes/(auth)/otp.tsx |
| `searchSchema` | object | routes/(auth)/sign-in.tsx |
| `signUpSearchSchema` | object | routes/(auth)/sign-up.tsx |
| `searchSchema` | object | routes/(auth)/verify-email.tsx |
| `appsSearchSchema` | object | routes/_authenticated/apps/index.tsx |
| `appsSearchSchema` | object | routes/_authenticated/dashboard.apps.index.tsx |
| `billingRatesSearchSchema` | object | routes/_authenticated/dashboard.billing-rates.index.tsx |
| `caseWorkflowsSearchSchema` | object | routes/_authenticated/dashboard.case-workflows.index.tsx |
| `clientsSearchSchema` | object | routes/_authenticated/dashboard.clients.index.tsx |
| `contactsSearchSchema` | object | routes/_authenticated/dashboard.contacts.index.tsx |
| `dataExportSearchSchema` | object | routes/_authenticated/dashboard.data-export.index.tsx |
| `documentsSearchSchema` | object | routes/_authenticated/dashboard.documents.index.tsx |
| `followupsSearchSchema` | object | routes/_authenticated/dashboard.followups.index.tsx |
| `invoiceTemplatesSearchSchema` | object | routes/_authenticated/dashboard.invoice-templates.index.tsx |
| `organizationsSearchSchema` | object | routes/_authenticated/dashboard.organizations.index.tsx |
| `reportsSearchSchema` | object | routes/_authenticated/dashboard.reports.index.tsx |
| `staffSearchSchema` | object | routes/_authenticated/dashboard.staff.index.tsx |
| `tagsSearchSchema` | object | routes/_authenticated/dashboard.tags.index.tsx |
| `usersSearchSchema` | object | routes/_authenticated/users/index.tsx |
| `createAssetSchema` | object | types/assets.ts |
| `createSupplierSchema` | object | types/buying.ts |
| `createPurchaseOrderSchema` | object | types/buying.ts |
| `createItemSchema` | object | types/inventory.ts |
| `createWarehouseSchema` | object | types/inventory.ts |
| `createStockEntrySchema` | object | types/inventory.ts |
| `arabicNameSchema` | object | types/najiz.ts |
| `nationalAddressSchema` | object | types/najiz.ts |
| `sponsorSchema` | object | types/najiz.ts |
| `poBoxSchema` | object | types/najiz.ts |
| `najizPersonFieldsSchema` | object | types/najiz.ts |
| `najizCompanyFieldsSchema` | object | types/najiz.ts |
| `createTicketSchema` | object | types/support.ts |

---

## API Endpoints

| Method | Endpoint | Response Type | Source |
|--------|----------|---------------|--------|
| POST | `:param ثانية` | - | components/otp-input.tsx |
| POST | `:params (:parammin)` | - | services/authService.ts |
| GET | `:params (:parammin)` | - | services/authService.ts |
| POST | `:paramx:param` | - | services/captchaService.ts |
| POST | `@keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } } .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }` | - | features/auth/sign-up/components/sign-up-form.tsx |
| POST | `/${entityType}s/${entityId}/counts` | - | hooks/useSmartButtonCounts.ts |
| GET | `/accounts` | - | services/accountService.ts |
| POST | `/accounts` | - | services/accountService.ts |
| GET | `/accounts/${id}` | - | services/accountService.ts |
| PATCH | `/accounts/${id}` | - | services/accountService.ts |
| DELETE | `/accounts/${id}` | - | services/accountService.ts |
| GET | `/accounts/${id}/balance` | - | services/accountService.ts |
| GET | `/accounts/types` | - | services/accountService.ts |
| POST | `/activities` | - | services/activityService.ts |
| GET | `/activities` | - | services/financeService.ts |
| GET | `/activities?${params.toString()}` | - | services/activityService.ts |
| GET | `/activities/${id}` | - | services/activityService.ts |
| PATCH | `/activities/${id}` | - | services/financeService.ts |
| DELETE | `/activities/${id}` | - | services/financeService.ts |
| POST | `/activities/${id}/cancel` | - | services/odooActivityService.ts |
| POST | `/activities/${id}/done` | - | services/odooActivityService.ts |
| PATCH | `/activities/${id}/reassign` | - | services/odooActivityService.ts |
| PATCH | `/activities/${id}/reschedule` | - | services/odooActivityService.ts |
| GET | `/activities/entity/${entityType}/${entityId}?limit=${limit}` | - | services/activityService.ts |
| GET | `/activities/my?${params.toString()}` | - | services/odooActivityService.ts |
| GET | `/activities/overview` | - | services/activityService.ts |
| GET | `/activities/stats` | - | services/odooActivityService.ts |
| GET | `/activities/summary` | - | services/activityService.ts |
| GET | `/activities/types` | - | services/odooActivityService.ts |
| POST | `/activities/types` | - | services/odooActivityService.ts |
| PATCH | `/activities/types/${id}` | - | services/odooActivityService.ts |
| DELETE | `/activities/types/${id}` | - | services/odooActivityService.ts |
| GET | `/admin/dashboard` | - | hooks/useUIAccess.ts |
| POST | `/analytics-reports` | - | services/reportsService.ts |
| GET | `/analytics-reports?:param` | - | services/reportsService.ts |
| GET | `/analytics-reports?${params.toString()}` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param` | - | services/reportsService.ts |
| PATCH | `/analytics-reports/:param` | - | services/reportsService.ts |
| PUT | `/analytics-reports/:param` | - | services/reportsService.ts |
| DELETE | `/analytics-reports/:param` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/clone` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/export` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/favorite` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/pin` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/run` | - | services/reportsService.ts |
| POST | `/analytics-reports/:param/schedule` | - | services/reportsService.ts |
| DELETE | `/analytics-reports/:param/schedule` | - | services/reportsService.ts |
| GET | `/analytics-reports/${id}` | - | services/reportsService.ts |
| PATCH | `/analytics-reports/${id}` | - | services/reportsService.ts |
| PUT | `/analytics-reports/${id}` | - | services/reportsService.ts |
| DELETE | `/analytics-reports/${id}` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/clone` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/export` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/favorite` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/pin` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/run` | - | services/reportsService.ts |
| POST | `/analytics-reports/${id}/schedule` | - | services/reportsService.ts |
| DELETE | `/analytics-reports/${id}/schedule` | - | services/reportsService.ts |
| POST | `/analytics-reports/bulk-delete` | - | services/reportsService.ts |
| GET | `/analytics-reports/favorites` | - | services/reportsService.ts |
| POST | `/analytics-reports/from-template/:param` | - | services/reportsService.ts |
| POST | `/analytics-reports/from-template/${templateId}` | - | services/reportsService.ts |
| GET | `/analytics-reports/pinned` | - | services/reportsService.ts |
| GET | `/analytics-reports/section/:param` | - | services/reportsService.ts |
| GET | `/analytics-reports/section/${section}` | - | services/reportsService.ts |
| GET | `/analytics-reports/stats` | - | services/reportsService.ts |
| GET | `/analytics-reports/templates` | - | services/reportsService.ts |
| POST | `/answers` | - | services/answerService.ts |
| PATCH | `/answers/${id}` | - | services/answerService.ts |
| DELETE | `/answers/${id}` | - | services/answerService.ts |
| GET | `/answers/${questionId}` | - | services/answerService.ts |
| POST | `/answers/like/${id}` | - | services/answerService.ts |
| PATCH | `/answers/verify/${id}` | - | services/answerService.ts |
| GET | `/api-keys` | - | services/apiKeysService.ts |
| POST | `/api-keys` | - | services/apiKeysService.ts |
| DELETE | `/api-keys/${keyId}` | - | services/apiKeysService.ts |
| PATCH | `/api-keys/${keyId}` | - | services/apiKeysService.ts |
| GET | `/api-keys/stats` | - | services/apiKeysService.ts |
| GET | `/api/inter-company/balances` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/balances/between` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/exchange-rate` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/firms` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/reconciliations` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/reconciliations/${id}` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/adjustments` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/approve` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/auto-match` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/complete` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/manual-match` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reconciliations/${reconciliationId}/unmatch` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/reports/export` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/reports/summary` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/transactions` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/transactions` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/transactions/${id}` | - | services/interCompanyService.ts |
| PUT | `/api/inter-company/transactions/${id}` | - | services/interCompanyService.ts |
| DELETE | `/api/inter-company/transactions/${id}` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/transactions/${id}/cancel` | - | services/interCompanyService.ts |
| POST | `/api/inter-company/transactions/${id}/post` | - | services/interCompanyService.ts |
| GET | `/api/inter-company/transactions/between` | - | services/interCompanyService.ts |
| GET | `/api/settings/sales` | - | services/salesSettingsService.ts |
| GET | `/api/settings/sales/export` | - | services/salesSettingsService.ts |
| GET | `/api/settings/sales/history?limit=${limit}` | - | services/salesSettingsService.ts |
| GET | `/api/settings/sales/import` | - | services/salesSettingsService.ts |
| GET | `/api/settings/sales/reset/${section}` | - | services/salesSettingsService.ts |
| GET | `/api/settings/sales/validate` | - | services/salesSettingsService.ts |
| GET | `/api/users/${userId}` | - | utils/cache.ts |
| GET | `/appointments/${id}/calendar.ics` | - | services/appointmentsService.ts |
| GET | `/approvals/${id}` | - | services/approvalService.ts |
| POST | `/approvals/${id}/approve` | - | services/approvalService.ts |
| POST | `/approvals/${id}/cancel` | - | services/approvalService.ts |
| POST | `/approvals/${id}/reject` | - | services/approvalService.ts |
| POST | `/approvals/check` | - | services/approvalService.ts |
| GET | `/approvals/my-requests` | - | services/approvalService.ts |
| GET | `/approvals/pending` | - | services/approvalService.ts |
| GET | `/approvals/rules` | - | services/approvalService.ts |
| PUT | `/approvals/rules` | - | services/approvalService.ts |
| POST | `/approvals/rules` | - | services/approvalService.ts |
| DELETE | `/approvals/rules/${ruleId}` | - | services/approvalService.ts |
| GET | `/approvals/stats` | - | services/approvalService.ts |
| GET | `/approvals/templates` | - | services/approvalService.ts |
| GET | `/apps` | - | services/appsService.ts |
| GET | `/apps/${appId}` | - | services/appsService.ts |
| POST | `/apps/${appId}/connect` | - | services/appsService.ts |
| POST | `/apps/${appId}/disconnect` | - | services/appsService.ts |
| GET | `/assets` | { assets: Asset[]; total: number; page: number; limit: number } | services/assetsService.ts |
| POST | `/assets` | Asset | services/assetsService.ts |
| GET | `/assets/:param` | - | services/assetsService.ts |
| POST | `/assets/:param` | - | services/assetsService.ts |
| DELETE | `/assets/:param` | - | services/assetsService.ts |
| GET | `/assets/:param/depreciation` | - | services/assetsService.ts |
| POST | `/assets/:param/depreciation` | - | services/assetsService.ts |
| GET | `/assets/:param/maintenance` | - | services/assetsService.ts |
| PUT | `/assets/:param/maintenance/:param` | - | services/assetsService.ts |
| PATCH | `/assets/:param/maintenance/:param/complete` | - | services/assetsService.ts |
| PATCH | `/assets/:param/scrap` | - | services/assetsService.ts |
| PATCH | `/assets/:param/sell` | - | services/assetsService.ts |
| PATCH | `/assets/:param/submit` | - | services/assetsService.ts |
| GET | `/assets/${assetId}/depreciation` | DepreciationEntry[] | services/assetsService.ts |
| POST | `/assets/${assetId}/depreciation` | DepreciationEntry | services/assetsService.ts |
| POST | `/assets/${assetId}/maintenance` | MaintenanceSchedule | services/assetsService.ts |
| PUT | `/assets/${assetId}/maintenance/${scheduleId}` | MaintenanceSchedule | services/assetsService.ts |
| PATCH | `/assets/${assetId}/maintenance/${scheduleId}/complete` | MaintenanceSchedule | services/assetsService.ts |
| GET | `/assets/${id}` | Asset | services/assetsService.ts |
| PUT | `/assets/${id}` | Asset | services/assetsService.ts |
| DELETE | `/assets/${id}` | - | services/assetsService.ts |
| PATCH | `/assets/${id}/scrap` | Asset | services/assetsService.ts |
| PATCH | `/assets/${id}/sell` | Asset | services/assetsService.ts |
| PATCH | `/assets/${id}/submit` | Asset | services/assetsService.ts |
| GET | `/assets/categories` | AssetCategory[] | services/assetsService.ts |
| POST | `/assets/categories` | AssetCategory | services/assetsService.ts |
| GET | `/assets/categories/:param` | - | services/assetsService.ts |
| POST | `/assets/categories/:param` | - | services/assetsService.ts |
| DELETE | `/assets/categories/:param` | - | services/assetsService.ts |
| GET | `/assets/categories/${id}` | AssetCategory | services/assetsService.ts |
| PUT | `/assets/categories/${id}` | AssetCategory | services/assetsService.ts |
| DELETE | `/assets/categories/${id}` | - | services/assetsService.ts |
| GET | `/assets/maintenance` | MaintenanceSchedule[] | services/assetsService.ts |
| GET | `/assets/movements` | AssetMovement[] | services/assetsService.ts |
| POST | `/assets/movements` | AssetMovement | services/assetsService.ts |
| GET | `/assets/repairs` | AssetRepair[] | services/assetsService.ts |
| POST | `/assets/repairs` | AssetRepair | services/assetsService.ts |
| GET | `/assets/repairs/:param` | - | services/assetsService.ts |
| POST | `/assets/repairs/:param` | - | services/assetsService.ts |
| PATCH | `/assets/repairs/:param/complete` | - | services/assetsService.ts |
| GET | `/assets/repairs/${id}` | AssetRepair | services/assetsService.ts |
| PUT | `/assets/repairs/${id}` | AssetRepair | services/assetsService.ts |
| PATCH | `/assets/repairs/${id}/complete` | AssetRepair | services/assetsService.ts |
| GET | `/assets/settings` | AssetSettings | services/assetsService.ts |
| PUT | `/assets/settings` | AssetSettings | services/assetsService.ts |
| GET | `/assets/stats` | AssetStats | services/assetsService.ts |
| POST | `/attendance` | - | services/attendanceService.ts |
| GET | `/attendance?:param` | - | services/attendanceService.ts |
| GET | `/attendance?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/:param` | - | services/attendanceService.ts |
| POST | `/attendance/:param` | - | services/attendanceService.ts |
| DELETE | `/attendance/:param` | - | services/attendanceService.ts |
| POST | `/attendance/:param/approve` | - | services/attendanceService.ts |
| POST | `/attendance/:param/approve-early-departure` | - | services/attendanceService.ts |
| POST | `/attendance/:param/approve-overtime` | - | services/attendanceService.ts |
| POST | `/attendance/:param/approve-timesheet` | - | services/attendanceService.ts |
| POST | `/attendance/:param/break/end` | - | services/attendanceService.ts |
| POST | `/attendance/:param/break/start` | - | services/attendanceService.ts |
| POST | `/attendance/:param/breaks` | - | services/attendanceService.ts |
| GET | `/attendance/:param/breaks` | - | services/attendanceService.ts |
| POST | `/attendance/:param/corrections` | - | services/attendanceService.ts |
| PUT | `/attendance/:param/corrections/:param` | - | services/attendanceService.ts |
| POST | `/attendance/:param/excuse-late` | - | services/attendanceService.ts |
| POST | `/attendance/:param/overtime/approve` | - | services/attendanceService.ts |
| POST | `/attendance/:param/reject` | - | services/attendanceService.ts |
| POST | `/attendance/:param/reject-timesheet` | - | services/attendanceService.ts |
| POST | `/attendance/:param/violations` | - | services/attendanceService.ts |
| POST | `/attendance/:param/violations/:param/appeal` | - | services/attendanceService.ts |
| POST | `/attendance/:param/violations/:param/confirm` | - | services/attendanceService.ts |
| POST | `/attendance/:param/violations/:param/dismiss` | - | services/attendanceService.ts |
| PUT | `/attendance/:param/violations/:param/resolve` | - | services/attendanceService.ts |
| GET | `/attendance/${recordId}` | - | services/attendanceService.ts |
| PUT | `/attendance/${recordId}` | - | services/attendanceService.ts |
| DELETE | `/attendance/${recordId}` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/approve` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/approve-early-departure` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/approve-overtime` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/approve-timesheet` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/break/end` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/break/start` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/breaks` | - | services/attendanceService.ts |
| GET | `/attendance/${recordId}/breaks` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/corrections` | - | services/attendanceService.ts |
| PUT | `/attendance/${recordId}/corrections/${correctionId}` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/excuse-late` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/overtime/approve` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/reject` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/reject-timesheet` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/violations` | - | services/attendanceService.ts |
| GET | `/attendance/${recordId}/violations` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/violations/${violationId}/confirm` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/violations/${violationId}/dismiss` | - | services/attendanceService.ts |
| POST | `/attendance/${recordId}/violations/${violationIndex}/appeal` | - | services/attendanceService.ts |
| PUT | `/attendance/${recordId}/violations/${violationIndex}/resolve` | - | services/attendanceService.ts |
| POST | `/attendance/bulk` | - | services/attendanceService.ts |
| POST | `/attendance/check-in` | - | services/attendanceService.ts |
| POST | `/attendance/check-out` | - | services/attendanceService.ts |
| GET | `/attendance/compliance-report?:param` | - | services/attendanceService.ts |
| GET | `/attendance/compliance-report?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/corrections/pending` | - | services/attendanceService.ts |
| GET | `/attendance/daily-summary?:param` | - | services/attendanceService.ts |
| GET | `/attendance/daily-summary?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/employee-summary/:param?:param` | - | services/attendanceService.ts |
| GET | `/attendance/employee-summary/${employeeId}?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/employee/:param/date/:param` | - | services/attendanceService.ts |
| GET | `/attendance/employee/${employeeId}/date/${date}` | - | services/attendanceService.ts |
| POST | `/attendance/import` | - | services/attendanceService.ts |
| POST | `/attendance/lock-for-payroll` | - | services/attendanceService.ts |
| POST | `/attendance/mark-absences` | - | services/attendanceService.ts |
| GET | `/attendance/report/monthly?:param` | - | services/attendanceService.ts |
| GET | `/attendance/report/monthly?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/stats?:param` | - | services/attendanceService.ts |
| GET | `/attendance/stats?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/stats/department?:param` | - | services/attendanceService.ts |
| GET | `/attendance/stats/department?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/status/:param` | - | services/attendanceService.ts |
| GET | `/attendance/status/${employeeId}` | - | services/attendanceService.ts |
| GET | `/attendance/summary/:param?:param` | - | services/attendanceService.ts |
| GET | `/attendance/summary/${employeeId}?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/today?:param` | - | services/attendanceService.ts |
| GET | `/attendance/today?${params.toString()}` | - | services/attendanceService.ts |
| GET | `/attendance/violations` | - | services/attendanceService.ts |
| GET | `/audit-logs` | - | services/auditLogService.ts |
| POST | `/audit-logs` | - | services/auditService.ts |
| POST | `/audit-logs/batch` | - | services/auditService.ts |
| POST | `/audit-logs/check-brute-force` | - | services/auditLogService.ts |
| GET | `/audit-logs/entity/${type}/${id}` | - | services/auditLogService.ts |
| GET | `/audit-logs/export` | - | services/auditLogService.ts |
| GET | `/audit-logs/failed-logins` | - | services/auditLogService.ts |
| GET | `/audit-logs/resource/${resource}/${resourceId}` | - | services/auditService.ts |
| GET | `/audit-logs/security` | - | services/auditLogService.ts |
| GET | `/audit-logs/stats` | - | services/auditService.ts |
| GET | `/audit-logs/suspicious` | - | services/auditLogService.ts |
| GET | `/audit-logs/user/${id}` | - | services/auditLogService.ts |
| GET | `/audit-logs/user/${userId}` | - | services/auditService.ts |
| POST | `/auth/anonymous` | AnonymousAuthResponse | services/anonymousAuthService.ts |
| DELETE | `/auth/anonymous` | - | services/anonymousAuthService.ts |
| POST | `/auth/anonymous/convert` | {
        error: boolean
        message: string
        user?: User
        accessToken?: string
        refreshToken?: string
      } | services/anonymousAuthService.ts |
| POST | `/auth/anonymous/extend` | { expiresAt: string } | services/anonymousAuthService.ts |
| POST | `/auth/captcha/check-required` | CaptchaRequirementCheck | services/captchaService.ts |
| GET | `/auth/captcha/settings` | CaptchaSettings | services/captchaService.ts |
| PUT | `/auth/captcha/settings` | CaptchaSettings | services/captchaService.ts |
| POST | `/auth/captcha/verify` | VerifyCaptchaResponse | services/captchaService.ts |
| POST | `/auth/change-password` | {
        success: boolean
        message: string
      } | services/passwordService.ts |
| POST | `/auth/check-availability` | - | features/auth/sign-up/components/sign-up-form.tsx |
| POST | `/auth/forgot-password` | {
        success: boolean
        message: string
      } | services/passwordService.ts |
| POST | `/auth/login` | AuthResponse | services/authService.ts |
| POST | `/auth/logout` | - | services/authService.ts |
| POST | `/auth/magic-link/send` | {
        success: boolean
        message: string
        expiresIn?: number
      } | services/authService.ts |
| POST | `/auth/magic-link/verify` | AuthResponse | services/authService.ts |
| GET | `/auth/me` | AuthResponse | services/authService.ts |
| GET | `/auth/mfa/backup-codes/count` | {
        error?: boolean
        remainingCodes: number
      } | services/mfaService.ts |
| POST | `/auth/mfa/backup-codes/generate` | {
        error?: boolean
        message?: string
        codes?: string[]
        backupCodes?: string[]
        remainingCodes?: number
      } | services/mfaService.ts |
| POST | `/auth/mfa/disable` | { success: boolean; message: string } | services/mfaService.ts |
| POST | `/auth/mfa/email/send` | {
        success: boolean
        expiresIn: number
      } | services/mfaService.ts |
| GET | `/auth/mfa/required` | { required: boolean } | services/mfaService.ts |
| POST | `/auth/mfa/setup` | TOTPSetupResponse | services/mfaService.ts |
| POST | `/auth/mfa/sms/send` | {
        success: boolean
        expiresIn: number
      } | services/mfaService.ts |
| GET | `/auth/mfa/status` | MFAStatus | services/mfaService.ts |
| POST | `/auth/mfa/verify` | MFAVerifyResponse | services/mfaService.ts |
| POST | `/auth/mfa/verify-setup` | { success: boolean; message: string } | services/mfaService.ts |
| POST | `/auth/onboarding-progress` | - | services/onboardingWizardService.ts |
| GET | `/auth/onboarding-status` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/company-info` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/company-logo` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/complete` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/modules` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/skip` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/user-avatar` | - | services/onboardingWizardService.ts |
| POST | `/auth/onboarding/user-profile` | - | services/onboardingWizardService.ts |
| GET | `/auth/otp-status` | {
        success: boolean
        data: {
          attemptsRemaining: number
          resetTime?: string
        }
      } | services/authService.ts |
| GET | `/auth/password-status` | {
        hasPassword: boolean
        lastChangedAt?: string
        expiresAt?: string
        isExpired: boolean
        mustChange: boolean
        requirements: {
          minLength: number
          requireUppercase: boolean
          requireLowercase: boolean
          requireNumbers: boolean
          requireSpecialChars: boolean
        }
      } | services/passwordService.ts |
| POST | `/auth/password/check-breach` | {
        breached: boolean
        count?: number
      } | services/passwordService.ts |
| GET | `/auth/phone/otp-status` | OTPStatusResponse | services/phoneAuthService.ts |
| POST | `/auth/phone/resend-otp` | PhoneOTPResponse | services/phoneAuthService.ts |
| POST | `/auth/phone/send-otp` | PhoneOTPResponse | services/phoneAuthService.ts |
| POST | `/auth/phone/verify` | {
        success: boolean
        message: string
      } | services/phoneAuthService.ts |
| POST | `/auth/phone/verify-otp` | PhoneAuthResponse | services/phoneAuthService.ts |
| POST | `/auth/reauthenticate` | { success: boolean; message: string } | services/stepUpAuthService.ts |
| POST | `/auth/reauthenticate/challenge` | ReauthChallenge | services/stepUpAuthService.ts |
| GET | `/auth/reauthenticate/methods` | { methods: ReauthMethod[] } | services/stepUpAuthService.ts |
| GET | `/auth/reauthenticate/status` | {
        isRecent: boolean
        lastAuthAt?: string
        expiresAt?: string
        requiredFor?: string[]
      } | services/stepUpAuthService.ts |
| POST | `/auth/reauthenticate/verify` | { success: boolean; message: string } | services/stepUpAuthService.ts |
| POST | `/auth/refresh-activity` | - | hooks/use-session-warning.ts |
| POST | `/auth/register` | - | features/auth/sign-up/components/sign-up-form.tsx |
| POST | `/auth/resend-otp` | SendOtpResponse | services/otpService.ts |
| POST | `/auth/resend-verification` | {
        error: boolean
        success?: boolean
        message: string
        messageEn?: string
        expiresAt?: string
      } | services/authService.ts |
| POST | `/auth/reset-password` | {
        success: boolean
        message: string
      } | services/passwordService.ts |
| GET | `/auth/reset-password/validate` | {
        valid: boolean
        email?: string
      } | services/passwordService.ts |
| POST | `/auth/send-otp` | - | components/otp-input.tsx |
| GET | `/auth/sessions` | { sessions: any[] } | services/sessionService.ts |
| DELETE | `/auth/sessions` | { terminatedCount: number; count?: number } | services/sessionService.ts |
| GET | `/auth/sessions/:param` | - | services/sessionService.ts |
| DELETE | `/auth/sessions/:param/report` | - | services/sessionService.ts |
| DELETE | `/auth/sessions/${sessionId}` | - | services/sessionService.ts |
| POST | `/auth/sessions/${sessionId}/report` | - | services/sessionService.ts |
| GET | `/auth/sessions/current` | any | services/sessionService.ts |
| POST | `/auth/sessions/extend` | { expiresAt: string } | services/sessionService.ts |
| POST | `/auth/sso/callback` | OAuthCallbackResponse | services/oauthService.ts |
| POST | `/auth/sso/initiate` | OAuthAuthorizeResponse | services/oauthService.ts |
| POST | `/auth/sso/link` | { authUrl: string } | services/oauthService.ts |
| GET | `/auth/sso/providers` | {
        providers: OAuthProvider[]
      } | services/oauthService.ts |
| GET | `/auth/sso/unlink/:param` | - | services/oauthService.ts |
| DELETE | `/auth/sso/unlink/${provider}` | - | services/oauthService.ts |
| POST | `/auth/verify-email` | {
        error: boolean
        success?: boolean
        message: string
        messageEn?: string
        user?: {
          id: string
          email: string
          isEmailVerified: boolean
          emailVerifiedAt: string
        }
      } | services/authService.ts |
| POST | `/auth/verify-otp` | - | components/otp-input.tsx |
| POST | `/automated-actions` | - | services/automatedActionService.ts |
| GET | `/automated-actions?${params.toString()}` | - | services/automatedActionService.ts |
| GET | `/automated-actions/${actionId}/logs?${params.toString()}` | - | services/automatedActionService.ts |
| GET | `/automated-actions/${id}` | - | services/automatedActionService.ts |
| PUT | `/automated-actions/${id}` | - | services/automatedActionService.ts |
| DELETE | `/automated-actions/${id}` | - | services/automatedActionService.ts |
| POST | `/automated-actions/${id}/duplicate` | - | services/automatedActionService.ts |
| POST | `/automated-actions/${id}/test` | - | services/automatedActionService.ts |
| POST | `/automated-actions/${id}/toggle` | - | services/automatedActionService.ts |
| DELETE | `/automated-actions/bulk` | - | services/automatedActionService.ts |
| POST | `/automated-actions/bulk/disable` | - | services/automatedActionService.ts |
| POST | `/automated-actions/bulk/enable` | - | services/automatedActionService.ts |
| GET | `/automated-actions/logs?${params.toString()}` | - | services/automatedActionService.ts |
| GET | `/automated-actions/models` | - | services/automatedActionService.ts |
| GET | `/automated-actions/models/${modelName}/fields` | - | services/automatedActionService.ts |
| POST | `/bank-accounts` | - | services/bankAccountService.ts |
| GET | `/bank-accounts` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/:param` | - | services/bankAccountService.ts |
| PUT | `/bank-accounts/:param` | - | services/bankAccountService.ts |
| DELETE | `/bank-accounts/:param` | - | services/bankAccountService.ts |
| GET | `/bank-accounts/:param/balance-history` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/:param/disconnect` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/:param/set-default` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/:param/sync` | - | services/bankAccountService.ts |
| GET | `/bank-accounts/${id}` | - | services/bankAccountService.ts |
| PUT | `/bank-accounts/${id}` | - | services/bankAccountService.ts |
| DELETE | `/bank-accounts/${id}` | - | services/bankAccountService.ts |
| GET | `/bank-accounts/${id}/balance-history` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/${id}/disconnect` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/${id}/set-default` | - | services/bankAccountService.ts |
| POST | `/bank-accounts/${id}/sync` | - | services/bankAccountService.ts |
| GET | `/bank-accounts/summary` | - | services/bankAccountService.ts |
| POST | `/bank-reconciliation` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/:param` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/:param/cancel` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/:param/clear` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/:param/complete` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/:param/unclear` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/${id}` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/${id}/cancel` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/${id}/clear` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/${id}/complete` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/${id}/unclear` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/auto-match/:param` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/auto-match/${accountId}` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/currency/convert` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/currency/rates` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/currency/rates` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/currency/supported` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/currency/update` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/feeds` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/feeds` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/feeds/:param` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/feeds/:param` | - | services/bankReconciliationService.ts |
| PUT | `/bank-reconciliation/feeds/${id}` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/feeds/${id}` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/feeds/${id}` | - | services/financeAdvancedService.ts |
| POST | `/bank-reconciliation/feeds/${id}/fetch` | - | services/financeAdvancedService.ts |
| GET | `/bank-reconciliation/feeds/${id}/transactions` | - | services/financeAdvancedService.ts |
| POST | `/bank-reconciliation/import/csv` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/import/ofx` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/import/template` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/match/:param` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/match/${id}` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/match/${matchId}` | - | services/financeAdvancedService.ts |
| POST | `/bank-reconciliation/match/confirm/:param` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/match/confirm/${id}` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/match/confirm/${matchId}` | - | services/financeAdvancedService.ts |
| POST | `/bank-reconciliation/match/reject/:param` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/match/reject/${id}` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/match/reject/${matchId}` | - | services/financeAdvancedService.ts |
| POST | `/bank-reconciliation/match/split` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/rules` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/rules` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/rules/:param` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/rules/:param` | - | services/bankReconciliationService.ts |
| PUT | `/bank-reconciliation/rules/${id}` | - | services/bankReconciliationService.ts |
| DELETE | `/bank-reconciliation/rules/${id}` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/statistics/matches` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/statistics/rules` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/status/:param` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/status/${accountId}` | - | services/bankReconciliationService.ts |
| POST | `/bank-reconciliation/suggestions/:param` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/suggestions/${accountId}` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/unmatched/:param` | - | services/bankReconciliationService.ts |
| GET | `/bank-reconciliation/unmatched/${accountId}` | - | services/bankReconciliationService.ts |
| POST | `/bank-transactions` | - | services/bankTransactionService.ts |
| GET | `/bank-transactions` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/:param` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/:param/match` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/:param/unmatch` | - | services/bankTransactionService.ts |
| GET | `/bank-transactions/${id}` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/${transactionId}/match` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/${transactionId}/unmatch` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/import/:param` | - | services/bankTransactionService.ts |
| POST | `/bank-transactions/import/${accountId}` | - | services/bankTransactionService.ts |
| POST | `/bank-transfers` | - | services/bankTransferService.ts |
| GET | `/bank-transfers` | - | services/bankTransferService.ts |
| POST | `/bank-transfers/:param` | - | services/bankTransferService.ts |
| POST | `/bank-transfers/:param/cancel` | - | services/bankTransferService.ts |
| GET | `/bank-transfers/${id}` | - | services/bankTransferService.ts |
| POST | `/bank-transfers/${id}/cancel` | - | services/bankTransferService.ts |
| POST | `/bill-payments` | - | services/billPaymentService.ts |
| GET | `/bill-payments` | - | services/billPaymentService.ts |
| GET | `/bill-payments/${id}` | - | services/billPaymentService.ts |
| POST | `/bill-payments/${id}/cancel` | - | services/billPaymentService.ts |
| DELETE | `/billing/groups/${id}` | - | services/billingRatesService.ts |
| GET | `/billing/invoices` | - | services/billingService.ts |
| GET | `/billing/invoices/${id}` | - | services/billingService.ts |
| GET | `/billing/invoices/${id}/download` | - | services/billingService.ts |
| POST | `/billing/invoices/${id}/pay` | - | services/billingService.ts |
| GET | `/billing/payment-methods` | - | services/billingService.ts |
| POST | `/billing/payment-methods` | - | services/billingService.ts |
| DELETE | `/billing/payment-methods/${id}` | - | services/billingService.ts |
| PATCH | `/billing/payment-methods/${id}/set-default` | - | services/billingService.ts |
| POST | `/billing/payment-methods/setup-intent` | - | services/billingService.ts |
| DELETE | `/billing/rates/${id}` | - | services/billingRatesService.ts |
| GET | `/billing/subscription` | - | services/billingService.ts |
| POST | `/billing/subscription/cancel` | - | services/billingService.ts |
| POST | `/billing/subscription/change-plan` | - | services/billingService.ts |
| POST | `/billing/subscription/reactivate` | - | services/billingService.ts |
| GET | `/billing/subscription/upcoming-invoice` | - | services/billingService.ts |
| DELETE | `/billing/time-entries/${id}` | - | services/billingRatesService.ts |
| GET | `/billing/usage` | - | services/billingService.ts |
| GET | `/bills` | - | services/accountingService.ts |
| POST | `/bills` | - | services/accountingService.ts |
| GET | `/bills/${billId}/debit-notes` | - | services/accountingService.ts |
| GET | `/bills/${id}` | - | services/accountingService.ts |
| PUT | `/bills/${id}` | - | services/accountingService.ts |
| DELETE | `/bills/${id}` | - | services/accountingService.ts |
| POST | `/bills/${id}/approve` | - | services/accountingService.ts |
| POST | `/bills/${id}/attachments` | - | services/accountingService.ts |
| DELETE | `/bills/${id}/attachments/${attachmentId}` | - | services/accountingService.ts |
| POST | `/bills/${id}/cancel` | - | services/accountingService.ts |
| POST | `/bills/${id}/duplicate` | - | services/accountingService.ts |
| POST | `/bills/${id}/generate-next` | - | services/accountingService.ts |
| POST | `/bills/${id}/pay` | - | services/accountingService.ts |
| POST | `/bills/${id}/post-to-gl` | - | services/accountingService.ts |
| POST | `/bills/${id}/receive` | - | services/accountingService.ts |
| POST | `/bills/${id}/stop-recurring` | - | services/accountingService.ts |
| GET | `/bills/export` | - | services/accountingService.ts |
| GET | `/bills/overdue` | - | services/accountingService.ts |
| GET | `/bills/recurring` | - | services/accountingService.ts |
| GET | `/bills/reports/aging` | - | services/accountingService.ts |
| GET | `/bills/summary` | - | services/accountingService.ts |
| POST | `/biometric/checkin-gps` | - | services/biometricService.ts |
| GET | `/biometric/devices` | - | services/biometricService.ts |
| POST | `/biometric/devices` | - | services/biometricService.ts |
| GET | `/biometric/devices/${id}` | - | services/biometricService.ts |
| PUT | `/biometric/devices/${id}` | - | services/biometricService.ts |
| DELETE | `/biometric/devices/${id}` | - | services/biometricService.ts |
| POST | `/biometric/devices/${id}/heartbeat` | - | services/biometricService.ts |
| POST | `/biometric/devices/${id}/sync` | - | services/biometricService.ts |
| GET | `/biometric/enrollments` | - | services/biometricService.ts |
| POST | `/biometric/enrollments` | - | services/biometricService.ts |
| POST | `/biometric/enrollments/${enrollmentId}/card` | - | services/biometricService.ts |
| POST | `/biometric/enrollments/${enrollmentId}/facial` | - | services/biometricService.ts |
| POST | `/biometric/enrollments/${enrollmentId}/fingerprint` | - | services/biometricService.ts |
| POST | `/biometric/enrollments/${enrollmentId}/pin` | - | services/biometricService.ts |
| GET | `/biometric/enrollments/${id}` | - | services/biometricService.ts |
| POST | `/biometric/enrollments/${id}/revoke` | - | services/biometricService.ts |
| GET | `/biometric/enrollments/employee/${employeeId}` | - | services/biometricService.ts |
| GET | `/biometric/enrollments/stats` | - | services/biometricService.ts |
| GET | `/biometric/geofence` | - | services/biometricService.ts |
| POST | `/biometric/geofence` | - | services/biometricService.ts |
| GET | `/biometric/geofence/${id}` | - | services/biometricService.ts |
| PUT | `/biometric/geofence/${id}` | - | services/biometricService.ts |

*... and 3211 more endpoints*

---

## Request/Response Types

### Request Types (186)
| Type | Path |
|------|------|
| `ArabicNameInputProps` | components/arabic-name-input.tsx |
| `ChatterInputProps` | components/chatter/chatter-input.tsx |
| `CurrencyInputProps` | components/currency-input.tsx |
| `ShiftRequestDialogProps` | components/hr/attendance/ShiftRequestDialog.tsx |
| `ShiftRequestFormData` | components/hr/attendance/ShiftRequestDialog.tsx |
| `NationalAddressInputProps` | components/national-address-input.tsx |
| `OtpInputProps` | components/otp-input.tsx |
| `PasswordInputProps` | components/password-input.tsx |
| `RouteParams` | constants/routes.ts |
| `CreatePageInput` | features/case-notion/data/schema.ts |
| `UpdatePageInput` | features/case-notion/data/schema.ts |
| `CreateBlockInput` | features/case-notion/data/schema.ts |
| `UpdateBlockInput` | features/case-notion/data/schema.ts |
| `MoveBlockInput` | features/case-notion/data/schema.ts |
| `CreateClientInput` | features/clients/data/schema.ts |
| `CreateContactInput` | features/contacts/data/schema.ts |
| `RequestChangesData` | features/finance/types/approval-types.ts |
| `TagInputProps` | features/tags/components/tag-input.tsx |
| `AttendeeInput` | features/tasks/components/create-event-view.tsx |
| `SubtaskInput` | features/tasks/components/create-task-view.tsx |
| `AiTaskInput` | features/tasks/components/tasks-list-view.tsx |
| `AiSuggestionRequest` | features/tasks/components/tasks-list-view.tsx |
| `UseCancellableRequestOptions` | hooks/use-cancellable-request.ts |
| `UseTableUrlStateParams` | hooks/use-table-url-state.ts |
| `DashboardParams` | hooks/useCrmAnalytics.ts |
| `RevenueParams` | hooks/useCrmAnalytics.ts |
| `FunnelParams` | hooks/useCrmAnalytics.ts |
| `DateRangeParams` | hooks/useCrmAnalytics.ts |
| `PipelineParams` | hooks/useCrmAnalytics.ts |
| `TeamParams` | hooks/useCrmAnalytics.ts |
| `EventParams` | lib/analytics.ts |
| `PendingRequest` | lib/request-deduplication.ts |
| `CreateClientInput` | lib/shared-schemas.ts |
| `UpdateClientInput` | lib/shared-schemas.ts |
| `CreateVendorInput` | lib/shared-schemas.ts |
| `CreateEmployeeInput` | lib/shared-schemas.ts |
| `CreateUserInput` | lib/shared-schemas.ts |
| `LoginInput` | lib/shared-schemas.ts |
| `RegisterInput` | lib/shared-schemas.ts |
| `CreateInvoiceInput` | lib/shared-schemas.ts |
| `CreatePaymentInput` | lib/shared-schemas.ts |
| `OtpSearchParams` | routes/(auth)/otp.tsx |
| `SignUpSearchParams` | routes/(auth)/sign-up.tsx |
| `RequestOptions` | sdk/core/src/api.ts |
| `OTPInputProps` | sdk/react-ui/src/components/OTPInput.tsx |
| `CreateActivityInput` | services/activityService.ts |
| `RequestStatus` | services/advancesService.ts |
| `ChatRequest` | services/ai.service.ts |
| `SummarizeRequest` | services/ai.service.ts |
| `CreateApiKeyRequest` | services/apiKeysService.ts |
| `CreateAvailabilityRequest` | services/appointmentsService.ts |
| `UpdateAvailabilityRequest` | services/appointmentsService.ts |
| `CreateBlockedTimeRequest` | services/appointmentsService.ts |
| `BookAppointmentRequest` | services/appointmentsService.ts |
| `UpdateAppointmentRequest` | services/appointmentsService.ts |
| `GetAvailableSlotsRequest` | services/appointmentsService.ts |
| `UpdateSettingsRequest` | services/appointmentsService.ts |
| `PublicBookingRequest` | services/appointmentsService.ts |
| `ApprovalRequest` | services/approvalService.ts |
| `CheckApprovalRequiredPayload` | services/approvalService.ts |
| `GetAppsParams` | services/appsService.ts |
| `CorrectionRequest` | services/attendanceService.ts |
| `ExportAuditLogParams` | services/auditLogService.ts |
| `ExportAuditParams` | services/auditService.ts |
| `VerifyCaptchaRequest` | services/captchaService.ts |
| `HealthScoreListParams` | services/churnService.ts |
| `HealthScoreHistoryParams` | services/churnService.ts |
| `ChurnEventListParams` | services/churnService.ts |
| `ChurnRateParams` | services/churnService.ts |
| `CohortAnalysisParams` | services/churnService.ts |
| `InterventionListParams` | services/churnService.ts |
| `AtRiskCustomersParams` | services/churnService.ts |
| `CreateCompensationInput` | services/compensationService.ts |
| `UpdateCompensationInput` | services/compensationService.ts |
| `CompensatoryLeaveRequest` | services/compensatoryLeaveService.ts |
| `CreateCompensatoryLeaveRequestData` | services/compensatoryLeaveService.ts |
| `CompensatoryLeaveRequestsResponse` | services/compensatoryLeaveService.ts |
| `ConflictCheckRequest` | services/conflictCheckService.ts |
| `PaginationParams` | services/crmReportsService.ts |
| `ConvertAmountRequest` | services/currencyService.ts |
| `CreatePromotionInput` | services/employeePromotionService.ts |
| `UpdatePromotionInput` | services/employeePromotionService.ts |
| `GetGigsParams` | services/gigsService.ts |
| `CreateGoogleEventRequest` | services/googleCalendarService.ts |
| `UpdateCalendarsRequest` | services/googleCalendarService.ts |
| `EnableAutoSyncRequest` | services/googleCalendarService.ts |
| `CompensationInput` | services/hrService.ts |
| `BatchQuotesRequest` | services/investmentSearchService.ts |
| `CreateInvitationRequest` | services/invitationService.ts |
| `AllocateLeavesRequest` | services/leavePeriodService.ts |
| `LeaveRequest` | services/leaveService.ts |
| `CreateLeaveRequestData` | services/leaveService.ts |
| `LeaveRequestsResponse` | services/leaveService.ts |
| `LeaveRequestFilters` | services/leaveService.ts |
| `CreateMicrosoftEventRequest` | services/microsoftCalendarService.ts |
| `MicrosoftImportRequest` | services/microsoftCalendarService.ts |
| `EnableMicrosoftAutoSyncRequest` | services/microsoftCalendarService.ts |
| `GetMLScoresParams` | services/mlScoringApi.ts |
| `GetPriorityQueueParams` | services/mlScoringApi.ts |
| `GetMLDashboardParams` | services/mlScoringApi.ts |
| `GetOrdersParams` | services/ordersService.ts |
| `SendOtpRequest` | services/otpService.ts |
| `VerifyOtpRequest` | services/otpService.ts |
| `AddJobPayload` | services/queueService.ts |
| `BulkJobPayload` | services/queueService.ts |
| `CleanJobsPayload` | services/queueService.ts |
| `CreateReportInput` | services/reportsService.ts |
| `UpdateReportInput` | services/reportsService.ts |
| `CreateRetentionBonusInput` | services/retentionBonusService.ts |
| `UpdateRetentionBonusInput` | services/retentionBonusService.ts |
| `GetReviewsParams` | services/reviewsService.ts |
| `CalculateComponentParams` | services/salaryComponentService.ts |
| `ShiftRequestStatus` | services/shiftAssignmentService.ts |
| `ShiftRequest` | services/shiftAssignmentService.ts |
| `CreateShiftRequestData` | services/shiftAssignmentService.ts |
| `ShiftRequestsResponse` | services/shiftAssignmentService.ts |
| `ShiftRequestFilters` | services/shiftAssignmentService.ts |
| `ShiftRequestStats` | services/shiftAssignmentService.ts |
| `TestConnectionRequest` | services/ssoService.ts |
| `SaveProviderRequest` | services/ssoService.ts |
| `CreateSuccessionPlanInput` | services/successionPlanningService.ts |
| `UpdateSuccessionPlanInput` | services/successionPlanningService.ts |
| `RequestedChange` | services/timeTrackingService.ts |
| `RequestStatus` | services/trainingService.ts |
| `GetLawyersParams` | services/usersService.ts |
| `GetUsersParams` | services/usersService.ts |
| `CreateWorkflowTemplateRequest` | services/workflowService.ts |
| `UpdateWorkflowTemplateRequest` | services/workflowService.ts |
| `CreateWorkflowInstanceRequest` | services/workflowService.ts |
| `AdvanceWorkflowInstanceRequest` | services/workflowService.ts |
| `LoginRequest` | types/api.ts |
| `SocketAuthTokenExpiredPayload` | types/api.ts |
| `SocketAuthTokenInvalidPayload` | types/api.ts |
| `AppointmentBookingRequest` | types/appointment.ts |
| `CreateAssetInput` | types/assets.ts |
| `BudgetCheckRequest` | types/budget.ts |
| `GenerateDistributionRequest` | types/budget.ts |
| `MaterialRequestType` | types/buying.ts |
| `MaterialRequestStatus` | types/buying.ts |
| `MaterialRequestItem` | types/buying.ts |
| `MaterialRequest` | types/buying.ts |
| `CreateMaterialRequestData` | types/buying.ts |
| `RequestForQuotation` | types/buying.ts |
| `CreateSupplierInput` | types/buying.ts |
| `CreatePurchaseOrderInput` | types/buying.ts |
| `CreateRichDocumentInput` | types/caseRichDocument.ts |
| `UpdateRichDocumentInput` | types/caseRichDocument.ts |
| `CreateCompetitorInput` | types/competitor.ts |
| `UpdateCompetitorInput` | types/competitor.ts |
| `ForecastRequest` | types/crm-enhanced.ts |

### Response Types (880)
| Type | Path |
|------|------|
| `ShiftAssignmentFormData` | components/hr/attendance/ShiftAssignmentDialog.tsx |
| `ShiftRequestFormData` | components/hr/attendance/ShiftRequestDialog.tsx |
| `EducationFormData` | components/hr/employees/EducationDialog.tsx |
| `LeavePeriodFormData` | components/hr/leave/LeavePeriodDialog.tsx |
| `SalaryComponentFormData` | components/hr/payroll/SalaryComponentDialog.tsx |
| `ApproveTrainingData` | components/hr/training/TrainingDialogs.tsx |
| `RejectTrainingData` | components/hr/training/TrainingDialogs.tsx |
| `CompleteTrainingData` | components/hr/training/TrainingDialogs.tsx |
| `TrainingEvaluationData` | components/hr/training/TrainingDialogs.tsx |
| `VehicleFormData` | components/hr/vehicles/VehicleDialog.tsx |
| `VehicleLogFormData` | components/hr/vehicles/VehicleLogDialog.tsx |
| `SidebarData` | components/layout/types.ts |
| `PasswordStrengthResult` | components/password-strength.tsx |
| `CreateCategoryFormData` | features/assets/components/create-category-view.tsx |
| `MaintenanceFormData` | features/assets/components/create-maintenance-view.tsx |
| `DataTableRowActionsProps` | features/case-workflows/components/data-table-row-actions.tsx |
| `DataTableToolbarProps` | features/case-workflows/components/data-table-toolbar.tsx |
| `CaseCardData` | features/cases/components/case-pipeline-board-view.tsx |
| `CreateCaseFormData` | features/cases/components/create-case-form.tsx |
| `CreateCaseFormData` | features/cases/components/create-case-view.tsx |
| `MoveCaseToStageData` | features/cases/data/case-pipeline-schema.ts |
| `EndCaseData` | features/cases/data/case-pipeline-schema.ts |
| `DataTableProps` | features/clients/components/clients-table.tsx |
| `WathqResponse` | features/clients/components/create-client-view.tsx |
| `MOJResponse` | features/clients/components/create-client-view.tsx |
| `DataTableBulkActionsProps` | features/clients/components/data-table-bulk-actions.tsx |
| `DataTableRowActionsProps` | features/clients/components/data-table-row-actions.tsx |
| `WizardData` | features/crm/components/crm-setup-wizard.tsx |
| `FirstResponseTimeFilters` | features/crm/components/reports/first-response-time-report.tsx |
| `ResponseTimeMetrics` | features/crm/components/reports/first-response-time-report.tsx |
| `ConversionData` | features/crm/components/reports/lead-conversion-time-report.tsx |
| `QuoteFormData` | features/crm/views/quote-form-view.tsx |
| `CrmSettingsFormData` | features/crm/views/settings/crm-settings-view.tsx |
| `QuotaFormData` | features/crm/views/settings/quotas-settings-view.tsx |
| `TerritoryFormData` | features/crm/views/settings/territories-view.tsx |
| `DataExportSidebarProps` | features/data-export/components/data-export-sidebar.tsx |
| `CreateExportTemplateData` | features/data-export/data/schema.ts |
| `DataTableRowActionsProps` | features/documents/components/data-table-row-actions.tsx |
| `CreateDocumentData` | features/documents/data/schema.ts |
| `UpdateDocumentData` | features/documents/data/schema.ts |
| `AccountFormData` | features/finance/components/account-form-dialog.tsx |
| `WizardData` | features/finance/components/finance-setup-wizard.tsx |
| `CalculationResult` | features/finance/components/gosi-calculator-view.tsx |
| `InvoiceApprovalData` | features/finance/types/approval-types.ts |
| `SubmitForApprovalData` | features/finance/types/approval-types.ts |
| `ApproveInvoiceData` | features/finance/types/approval-types.ts |
| `RejectInvoiceData` | features/finance/types/approval-types.ts |
| `RequestChangesData` | features/finance/types/approval-types.ts |
| `EscalateApprovalData` | features/finance/types/approval-types.ts |
| `CSVImportResult` | features/finance/types/corporate-card-types.ts |
| `CreateCorporateCardData` | features/finance/types/corporate-card-types.ts |
| `UpdateCorporateCardData` | features/finance/types/corporate-card-types.ts |
| `CreateCardTransactionData` | features/finance/types/corporate-card-types.ts |
| `ReconcileTransactionData` | features/finance/types/corporate-card-types.ts |
| `LockTimeEntryData` | features/finance/types/time-entry-lock-types.ts |
| `UnlockTimeEntryData` | features/finance/types/time-entry-lock-types.ts |
| `BulkLockTimeEntriesData` | features/finance/types/time-entry-lock-types.ts |
| `LockByDateRangeData` | features/finance/types/time-entry-lock-types.ts |
| `LockOperationResult` | features/finance/types/time-entry-lock-types.ts |
| `DataTableRowActionsProps` | features/followups/components/data-table-row-actions.tsx |
| `CreateFollowupData` | features/followups/data/schema.ts |
| `UpdateFollowupData` | features/followups/data/schema.ts |
| `GeofenceZoneData` | features/hr/components/geofencing-interactive-map.tsx |
| `WizardData` | features/hr/components/hr-setup-wizard.tsx |
| `PolicyFormData` | features/hr/components/leave-policy-action-dialog.tsx |
| `AssignFormData` | features/hr/components/leave-policy-assign-dialog.tsx |
| `ExtendedWarehouseData` | features/inventory/components/create-warehouse-view.tsx |
| `InventorySettingsFormData` | features/inventory/components/inventory-settings-view.tsx |
| `ReportData` | features/reports/components/report-viewer.tsx |
| `CreateReportConfigData` | features/reports/data/schema.ts |
| `SignatureFormData` | features/settings/components/email-signatures-manager.tsx |
| `TemplateFormData` | features/settings/components/email-templates-list.tsx |
| `DataTableBulkActionsProps` | features/staff/components/data-table-bulk-actions.tsx |
| `DataTableRowActionsProps` | features/staff/components/data-table-row-actions.tsx |
| `DataTableProps` | features/staff/components/staff-table.tsx |
| `ProcessDepartureData` | features/staff/data/schema.ts |
| `SubscriptionFormData` | features/subscriptions/components/subscription-create-view.tsx |
| `SubscriptionPlanFormData` | features/subscriptions/components/subscription-plan-form-view.tsx |
| `CreateSubscriptionPlanData` | features/subscriptions/types/subscription-types.ts |
| `CreateSubscriptionData` | features/subscriptions/types/subscription-types.ts |
| `UpdateSubscriptionData` | features/subscriptions/types/subscription-types.ts |
| `ChangePlanData` | features/subscriptions/types/subscription-types.ts |
| `ConsumeHoursData` | features/subscriptions/types/subscription-types.ts |
| `SubscriptionPlanListResponse` | features/subscriptions/types/subscription-types.ts |
| `SubscriptionListResponse` | features/subscriptions/types/subscription-types.ts |
| `DataTableRowActionsProps` | features/tags/components/data-table-row-actions.tsx |
| `CreateTagData` | features/tags/data/schema.ts |
| `UpdateTagData` | features/tags/data/schema.ts |
| `AiSuggestionResponse` | features/tasks/components/tasks-list-view.tsx |
| `DataTableProps` | features/tasks/components/tasks-table.tsx |
| `TaskFormData` | features/tasks/data/schema.ts |
| `TaskFormData` | features/tasks/hooks/useTaskFormValidation.ts |
| `DataTableRowActionsProps` | features/users/components/data-table-row-actions.tsx |
| `DataTableProps` | features/users/components/users-table.tsx |
| `LeadResponseTime` | hooks/use-crm-reports.ts |
| `HealthResponse` | hooks/use-service-health.ts |
| `SidebarData` | hooks/use-sidebar-data.ts |
| `SidebarData` | hooks/useCalendar.ts |
| `UseFeatureFlagResult` | hooks/useFeatureFlag.ts |
| `FinancialOverviewData` | hooks/useFinance.ts |
| `HRAnalyticsDashboardData` | hooks/useHrAnalytics.ts |
| `UseImagesLoaderResult` | hooks/useImageLoader.ts |
| `NitaqatResult` | hooks/useSaudiBanking.ts |
| `MinimumWageResult` | hooks/useSaudiBanking.ts |
| `SmartButtonCountsResult` | hooks/useSmartButtonCounts.ts |
| `UseSmartButtonsResult` | hooks/useSmartButtons.ts |
| `UseSmartButtonsBatchResult` | hooks/useSmartButtons.ts |
| `CreateStaffData` | hooks/useStaff.ts |
| `InviteStaffData` | hooks/useStaff.ts |
| `AdminDashboardData` | hooks/useUIAccess.ts |
| `RetainedDataItem` | lib/data-retention.ts |
| `ValidationResult` | lib/file-validation.ts |
| `SmartPreviewResult` | lib/file-viewer.ts |
| `IbanValidationResult` | lib/saudi-banking-validation.ts |
| `SaudiIdValidationResult` | lib/saudi-banking-validation.ts |
| `SalaryValidationResult` | lib/saudi-banking-validation.ts |
| `WPSValidationResult` | lib/wps-file-generator.ts |
| `RegisterData` | sdk/core/src/types.ts |
| `AuthResult` | sdk/core/src/types.ts |
| `MfaSetupResult` | sdk/core/src/types.ts |
| `MfaVerifyResult` | sdk/core/src/types.ts |
| `MfaChallengeData` | sdk/core/src/types.ts |
| `GoogleOneTapResponse` | sdk/core/src/types.ts |
| `SSODetectionResult` | sdk/core/src/types.ts |
| `ForgotPasswordData` | sdk/core/src/types.ts |
| `ResetPasswordData` | sdk/core/src/types.ts |
| `ChangePasswordData` | sdk/core/src/types.ts |
| `SendOtpData` | sdk/core/src/types.ts |
| `VerifyOtpData` | sdk/core/src/types.ts |
| `OtpResult` | sdk/core/src/types.ts |
| `MagicLinkData` | sdk/core/src/types.ts |
| `MagicLinkResult` | sdk/core/src/types.ts |
| `GoogleCredentialResponse` | sdk/integrations/google-onetap/types.ts |
| `GoogleOneTapResult` | sdk/integrations/google-onetap/types.ts |
| `SSODetectionResult` | sdk/integrations/sso-detection/types.ts |
| `ConvertToAccountData` | sdk/react/src/hooks/useAnonymousSession.ts |
| `CreateApiKeyData` | sdk/react/src/hooks/useApiKeys.ts |
| `CreateWebhookData` | sdk/react/src/hooks/useWebhooks.ts |
| `CreateApiKeyData` | sdk/react-ui/src/components/ApiKeyManager.tsx |
| `SignupFormData` | sdk/react-ui/src/components/SignupForm.tsx |
| `UserProfileData` | sdk/react-ui/src/components/UserProfile.tsx |
| `ValidationResult` | sdk/react-ui/src/utils/validation.ts |
| `AccountBalanceData` | services/accountService.ts |
| `CreateAccountData` | services/accountService.ts |
| `AccountTypesResponse` | services/accountingService.ts |
| `CreateJournalEntryData` | services/accountingService.ts |
| `SimpleJournalEntryData` | services/accountingService.ts |
| `CanPostResponse` | services/accountingService.ts |
| `CreateRecurringTransactionData` | services/accountingService.ts |
| `CreatePriceLevelData` | services/accountingService.ts |

---

## Pages

| Page | Route | Hooks Used |
|------|-------|------------|
| __root | `/--root` |  |
| index | `/-authenticated` |  |
| index | `/-authenticated/apps` |  |
| index | `/-authenticated/chats` |  |
| dashboard.appointments | `/-authenticated/dashboard.appointments` |  |
| dashboard.apps.index | `/-authenticated/dashboard.apps.index` |  |
| dashboard.assets | `/-authenticated/dashboard.assets` |  |
| dashboard.assets.$assetId | `/-authenticated/dashboard.assets.:assetId` |  |
| dashboard.assets.categories | `/-authenticated/dashboard.assets.categories` |  |
| dashboard.assets.categories.create | `/-authenticated/dashboard.assets.categories.create` |  |
| dashboard.assets.categories.index | `/-authenticated/dashboard.assets.categories.index` |  |
| dashboard.assets.create | `/-authenticated/dashboard.assets.create` |  |
| dashboard.assets.index | `/-authenticated/dashboard.assets.index` |  |
| dashboard.assets.maintenance | `/-authenticated/dashboard.assets.maintenance` |  |
| dashboard.assets.maintenance.create | `/-authenticated/dashboard.assets.maintenance.create` |  |
| dashboard.assets.maintenance.index | `/-authenticated/dashboard.assets.maintenance.index` |  |
| dashboard.assets.settings | `/-authenticated/dashboard.assets.settings` |  |
| dashboard.billing-rates.index | `/-authenticated/dashboard.billing-rates.index` |  |
| dashboard.buying.$supplierId | `/-authenticated/dashboard.buying.:supplierId` |  |
| dashboard.buying.create | `/-authenticated/dashboard.buying.create` |  |
| dashboard.buying.index | `/-authenticated/dashboard.buying.index` |  |
| dashboard.buying.purchase-orders | `/-authenticated/dashboard.buying.purchase-orders` |  |
| dashboard.buying.purchase-orders.$purchaseOrderId | `/-authenticated/dashboard.buying.purchase-orders.:purchaseOrderId` |  |
| dashboard.buying.purchase-orders.create | `/-authenticated/dashboard.buying.purchase-orders.create` |  |
| dashboard.buying.settings | `/-authenticated/dashboard.buying.settings` |  |
| dashboard.calendar | `/-authenticated/dashboard.calendar` |  |
| dashboard.case-workflows.index | `/-authenticated/dashboard.case-workflows.index` |  |
| dashboard.cases | `/-authenticated/dashboard.cases` |  |
| dashboard.cases.$caseId | `/-authenticated/dashboard.cases.:caseId` |  |
| dashboard.cases.$caseId.notion | `/-authenticated/dashboard.cases.:caseId.notion` |  |
| dashboard.cases.$caseId.notion.$pageId | `/-authenticated/dashboard.cases.:caseId.notion.:pageId` | useParams |
| dashboard.cases.$caseId.pipeline | `/-authenticated/dashboard.cases.:caseId.pipeline` |  |
| dashboard.cases.index | `/-authenticated/dashboard.cases.index` |  |
| dashboard.cases.kanban | `/-authenticated/dashboard.cases.kanban` |  |
| dashboard.cases.new | `/-authenticated/dashboard.cases.new` |  |
| dashboard.cases.pipeline | `/-authenticated/dashboard.cases.pipeline` |  |
| dashboard.cases.pipeline.board | `/-authenticated/dashboard.cases.pipeline.board` |  |
| dashboard.clients.$clientId | `/-authenticated/dashboard.clients.:clientId` |  |
| dashboard.clients.index | `/-authenticated/dashboard.clients.index` |  |
| dashboard.clients.new | `/-authenticated/dashboard.clients.new` |  |
| dashboard.contacts.$contactId | `/-authenticated/dashboard.contacts.:contactId` |  |
| dashboard.contacts.index | `/-authenticated/dashboard.contacts.index` |  |
| dashboard.contacts.new | `/-authenticated/dashboard.contacts.new` |  |
| dashboard.crm | `/-authenticated/dashboard.crm` |  |
| dashboard.crm.activities.$activityId | `/-authenticated/dashboard.crm.activities.:activityId` |  |
| dashboard.crm.activities.index | `/-authenticated/dashboard.crm.activities.index` |  |
| dashboard.crm.activities.new | `/-authenticated/dashboard.crm.activities.new` |  |
| dashboard.crm.appointments | `/-authenticated/dashboard.crm.appointments` | useState, useTranslation, useAppointments... |
| dashboard.crm.campaigns.$campaignId | `/-authenticated/dashboard.crm.campaigns.:campaignId` |  |
| dashboard.crm.campaigns.index | `/-authenticated/dashboard.crm.campaigns.index` |  |
| dashboard.crm.campaigns.new | `/-authenticated/dashboard.crm.campaigns.new` |  |
| dashboard.crm.clients.$clientId | `/-authenticated/dashboard.crm.clients.:clientId` |  |
| dashboard.crm.clients.index | `/-authenticated/dashboard.crm.clients.index` |  |
| dashboard.crm.contacts.$contactId | `/-authenticated/dashboard.crm.contacts.:contactId` |  |
| dashboard.crm.contacts.index | `/-authenticated/dashboard.crm.contacts.index` |  |
| dashboard.crm.contacts.new | `/-authenticated/dashboard.crm.contacts.new` |  |
| dashboard.crm.crm-reports | `/-authenticated/dashboard.crm.crm-reports` |  |
| dashboard.crm.email-marketing.$campaignId | `/-authenticated/dashboard.crm.email-marketing.:campaignId` |  |
| dashboard.crm.email-marketing.index | `/-authenticated/dashboard.crm.email-marketing.index` |  |
| dashboard.crm.email-marketing.new | `/-authenticated/dashboard.crm.email-marketing.new` |  |
| dashboard.crm.index | `/-authenticated/dashboard.crm.index` |  |
| dashboard.crm.lead-scoring.index | `/-authenticated/dashboard.crm.lead-scoring.index` |  |
| dashboard.crm.leads.$leadId | `/-authenticated/dashboard.crm.leads.:leadId` |  |
| dashboard.crm.leads.index | `/-authenticated/dashboard.crm.leads.index` |  |
| dashboard.crm.leads.new | `/-authenticated/dashboard.crm.leads.new` |  |
| dashboard.crm.pipeline | `/-authenticated/dashboard.crm.pipeline` |  |
| dashboard.crm.products.$productId | `/-authenticated/dashboard.crm.products.:productId` |  |
| dashboard.crm.products.index | `/-authenticated/dashboard.crm.products.index` |  |
| dashboard.crm.products.new | `/-authenticated/dashboard.crm.products.new` |  |
| dashboard.crm.quotes.$quoteId | `/-authenticated/dashboard.crm.quotes.:quoteId` |  |
| dashboard.crm.quotes.index | `/-authenticated/dashboard.crm.quotes.index` |  |
| dashboard.crm.quotes.new | `/-authenticated/dashboard.crm.quotes.new` |  |
| dashboard.crm.referrals.$referralId | `/-authenticated/dashboard.crm.referrals.:referralId` |  |
| dashboard.crm.referrals.index | `/-authenticated/dashboard.crm.referrals.index` |  |
| dashboard.crm.referrals.new | `/-authenticated/dashboard.crm.referrals.new` |  |
| dashboard.crm.reports.$reportId | `/-authenticated/dashboard.crm.reports.:reportId` |  |
| dashboard.crm.reports.activities | `/-authenticated/dashboard.crm.reports.activities` |  |
| dashboard.crm.reports.aging | `/-authenticated/dashboard.crm.reports.aging` |  |
| dashboard.crm.reports.forecast | `/-authenticated/dashboard.crm.reports.forecast` |  |
| dashboard.crm.reports.funnel | `/-authenticated/dashboard.crm.reports.funnel` |  |
| dashboard.crm.reports.index | `/-authenticated/dashboard.crm.reports.index` |  |
| dashboard.crm.reports.leads-source | `/-authenticated/dashboard.crm.reports.leads-source` |  |
| dashboard.crm.reports.new | `/-authenticated/dashboard.crm.reports.new` |  |
| dashboard.crm.reports.win-loss | `/-authenticated/dashboard.crm.reports.win-loss` |  |
| dashboard.crm.sales-persons | `/-authenticated/dashboard.crm.sales-persons` | useState, useTranslation |
| dashboard.crm.settings.email-templates | `/-authenticated/dashboard.crm.settings.email-templates` |  |
| dashboard.crm.settings.index | `/-authenticated/dashboard.crm.settings.index` |  |
| dashboard.crm.settings.lost-reasons | `/-authenticated/dashboard.crm.settings.lost-reasons` |  |
| dashboard.crm.settings.tags | `/-authenticated/dashboard.crm.settings.tags` |  |
| dashboard.crm.settings.teams | `/-authenticated/dashboard.crm.settings.teams` |  |
| dashboard.crm.settings.territories | `/-authenticated/dashboard.crm.settings.territories` |  |
| dashboard.crm.setup-wizard | `/-authenticated/dashboard.crm.setup-wizard` |  |
| dashboard.crm.territories | `/-authenticated/dashboard.crm.territories` | useState, useTranslation |
| dashboard.crm.whatsapp.$conversationId | `/-authenticated/dashboard.crm.whatsapp.:conversationId` |  |
| dashboard.crm.whatsapp.index | `/-authenticated/dashboard.crm.whatsapp.index` |  |
| dashboard.crm.whatsapp.new | `/-authenticated/dashboard.crm.whatsapp.new` |  |
| dashboard.crm.whatsapp.start | `/-authenticated/dashboard.crm.whatsapp.start` |  |
| dashboard.data-export.index | `/-authenticated/dashboard.data-export.index` |  |
| dashboard.date-range-picker-test | `/-authenticated/dashboard.date-range-picker-test` |  |
| dashboard.documents.index | `/-authenticated/dashboard.documents.index` |  |
| dashboard.finance | `/-authenticated/dashboard.finance` |  |
| dashboard.finance.activity.$activityId | `/-authenticated/dashboard.finance.activity.:activityId` |  |
| dashboard.finance.activity.$activityId.edit | `/-authenticated/dashboard.finance.activity.:activityId.edit` |  |
| dashboard.finance.activity.index | `/-authenticated/dashboard.finance.activity.index` |  |
| dashboard.finance.activity.new | `/-authenticated/dashboard.finance.activity.new` |  |
| dashboard.finance.bills.$billId | `/-authenticated/dashboard.finance.bills.:billId` |  |
| dashboard.finance.bills.$billId.edit | `/-authenticated/dashboard.finance.bills.:billId.edit` |  |
| dashboard.finance.bills.index | `/-authenticated/dashboard.finance.bills.index` |  |
| dashboard.finance.bills.new | `/-authenticated/dashboard.finance.bills.new` |  |
| dashboard.finance.chart-of-accounts | `/-authenticated/dashboard.finance.chart-of-accounts` |  |
| dashboard.finance.consolidated-reports | `/-authenticated/dashboard.finance.consolidated-reports` |  |
| dashboard.finance.corporate-cards | `/-authenticated/dashboard.finance.corporate-cards` |  |
| dashboard.finance.corporate-cards.$cardId.reconcile | `/-authenticated/dashboard.finance.corporate-cards.:cardId.reconcile` |  |
| dashboard.finance.credit-notes.$creditNoteId | `/-authenticated/dashboard.finance.credit-notes.:creditNoteId` |  |
| dashboard.finance.credit-notes.index | `/-authenticated/dashboard.finance.credit-notes.index` |  |
| dashboard.finance.credit-notes.new | `/-authenticated/dashboard.finance.credit-notes.new` |  |
| dashboard.finance.currency.$rateId | `/-authenticated/dashboard.finance.currency.:rateId` |  |
| dashboard.finance.currency.index | `/-authenticated/dashboard.finance.currency.index` |  |
| dashboard.finance.currency.new | `/-authenticated/dashboard.finance.currency.new` |  |
| dashboard.finance.expenses.$expenseId | `/-authenticated/dashboard.finance.expenses.:expenseId` |  |
| dashboard.finance.expenses.$expenseId.edit | `/-authenticated/dashboard.finance.expenses.:expenseId.edit` |  |
| dashboard.finance.expenses.index | `/-authenticated/dashboard.finance.expenses.index` |  |
| dashboard.finance.expenses.new | `/-authenticated/dashboard.finance.expenses.new` |  |
| dashboard.finance.fiscal-periods.index | `/-authenticated/dashboard.finance.fiscal-periods.index` |  |
| dashboard.finance.full-reports.index | `/-authenticated/dashboard.finance.full-reports.index` |  |
| dashboard.finance.general-ledger | `/-authenticated/dashboard.finance.general-ledger` |  |
| dashboard.finance.invoices.$invoiceId | `/-authenticated/dashboard.finance.invoices.:invoiceId` |  |
| dashboard.finance.invoices.$invoiceId.edit | `/-authenticated/dashboard.finance.invoices.:invoiceId.edit` |  |
| dashboard.finance.invoices.approvals | `/-authenticated/dashboard.finance.invoices.approvals` |  |
| dashboard.finance.invoices.index | `/-authenticated/dashboard.finance.invoices.index` |  |
| dashboard.finance.invoices.new | `/-authenticated/dashboard.finance.invoices.new` |  |
| dashboard.finance.journal-entries.$id | `/-authenticated/dashboard.finance.journal-entries.:id` |  |
| dashboard.finance.journal-entries.index | `/-authenticated/dashboard.finance.journal-entries.index` |  |
| dashboard.finance.journal-entries.new | `/-authenticated/dashboard.finance.journal-entries.new` |  |
| dashboard.finance.opening-balances | `/-authenticated/dashboard.finance.opening-balances` |  |
| dashboard.finance.overview | `/-authenticated/dashboard.finance.overview` |  |
| dashboard.finance.payments.$paymentId | `/-authenticated/dashboard.finance.payments.:paymentId` |  |
| dashboard.finance.payments.index | `/-authenticated/dashboard.finance.payments.index` |  |
| dashboard.finance.payments.new | `/-authenticated/dashboard.finance.payments.new` |  |
| dashboard.finance.quotes.$quoteId | `/-authenticated/dashboard.finance.quotes.:quoteId` |  |
| dashboard.finance.quotes.index | `/-authenticated/dashboard.finance.quotes.index` |  |
| dashboard.finance.quotes.new | `/-authenticated/dashboard.finance.quotes.new` |  |
| dashboard.finance.reconciliation.$feedId | `/-authenticated/dashboard.finance.reconciliation.:feedId` |  |
| dashboard.finance.reconciliation.index | `/-authenticated/dashboard.finance.reconciliation.index` |  |
| dashboard.finance.reconciliation.new | `/-authenticated/dashboard.finance.reconciliation.new` |  |
| dashboard.finance.recurring-invoices.$id | `/-authenticated/dashboard.finance.recurring-invoices.:id` | useParams |
| dashboard.finance.recurring-invoices.$id.edit | `/-authenticated/dashboard.finance.recurring-invoices.:id.edit` | useRecurringInvoice, useFinance, useParams |
| dashboard.finance.recurring-invoices.index | `/-authenticated/dashboard.finance.recurring-invoices.index` |  |
| dashboard.finance.recurring-invoices.new | `/-authenticated/dashboard.finance.recurring-invoices.new` |  |
| dashboard.finance.recurring.index | `/-authenticated/dashboard.finance.recurring.index` |  |
| dashboard.finance.reports.$reportId | `/-authenticated/dashboard.finance.reports.:reportId` |  |
| dashboard.finance.reports.accounts-aging | `/-authenticated/dashboard.finance.reports.accounts-aging` |  |
| dashboard.finance.reports.financial | `/-authenticated/dashboard.finance.reports.financial` |  |
| dashboard.finance.reports.index | `/-authenticated/dashboard.finance.reports.index` |  |
| dashboard.finance.reports.new | `/-authenticated/dashboard.finance.reports.new` |  |
| dashboard.finance.reports.outstanding-invoices | `/-authenticated/dashboard.finance.reports.outstanding-invoices` |  |
| dashboard.finance.reports.revenue-by-client | `/-authenticated/dashboard.finance.reports.revenue-by-client` |  |
| dashboard.finance.reports.time-entries | `/-authenticated/dashboard.finance.reports.time-entries` |  |
| dashboard.finance.retainers.$retainerId | `/-authenticated/dashboard.finance.retainers.:retainerId` |  |
| dashboard.finance.retainers.index | `/-authenticated/dashboard.finance.retainers.index` |  |
| dashboard.finance.retainers.new | `/-authenticated/dashboard.finance.retainers.new` |  |
| dashboard.finance.saudi-banking.compliance.index | `/-authenticated/dashboard.finance.saudi-banking.compliance.index` |  |
| dashboard.finance.saudi-banking.compliance.iqama-alerts | `/-authenticated/dashboard.finance.saudi-banking.compliance.iqama-alerts` |  |
| dashboard.finance.saudi-banking.gosi.calculator | `/-authenticated/dashboard.finance.saudi-banking.gosi.calculator` |  |
| dashboard.finance.saudi-banking.gosi.index | `/-authenticated/dashboard.finance.saudi-banking.gosi.index` |  |
| dashboard.finance.saudi-banking.index | `/-authenticated/dashboard.finance.saudi-banking.index` |  |
| dashboard.finance.saudi-banking.lean | `/-authenticated/dashboard.finance.saudi-banking.lean` |  |
| dashboard.finance.saudi-banking.mudad | `/-authenticated/dashboard.finance.saudi-banking.mudad` |  |
| dashboard.finance.saudi-banking.sadad.index | `/-authenticated/dashboard.finance.saudi-banking.sadad.index` |  |
| dashboard.finance.saudi-banking.sadad.pay | `/-authenticated/dashboard.finance.saudi-banking.sadad.pay` |  |
| dashboard.finance.saudi-banking.wps.generate | `/-authenticated/dashboard.finance.saudi-banking.wps.generate` |  |
| dashboard.finance.saudi-banking.wps.index | `/-authenticated/dashboard.finance.saudi-banking.wps.index` |  |
| dashboard.finance.saudi-banking.wps.new | `/-authenticated/dashboard.finance.saudi-banking.wps.new` |  |
| dashboard.finance.setup-wizard | `/-authenticated/dashboard.finance.setup-wizard` |  |
| dashboard.finance.statements.$statementId | `/-authenticated/dashboard.finance.statements.:statementId` |  |
| dashboard.finance.statements.$statementId.edit | `/-authenticated/dashboard.finance.statements.:statementId.edit` |  |
| dashboard.finance.statements.index | `/-authenticated/dashboard.finance.statements.index` |  |
| dashboard.finance.statements.new | `/-authenticated/dashboard.finance.statements.new` |  |
| dashboard.finance.subscription-plans.$planId | `/-authenticated/dashboard.finance.subscription-plans.:planId` |  |
| dashboard.finance.subscription-plans.$planId.edit | `/-authenticated/dashboard.finance.subscription-plans.:planId.edit` |  |
| dashboard.finance.subscription-plans.index | `/-authenticated/dashboard.finance.subscription-plans.index` |  |
| dashboard.finance.subscription-plans.new | `/-authenticated/dashboard.finance.subscription-plans.new` |  |
| dashboard.finance.subscriptions.$subscriptionId | `/-authenticated/dashboard.finance.subscriptions.:subscriptionId` |  |
| dashboard.finance.subscriptions.$subscriptionId.edit | `/-authenticated/dashboard.finance.subscriptions.:subscriptionId.edit` |  |
| dashboard.finance.subscriptions.index | `/-authenticated/dashboard.finance.subscriptions.index` |  |
| dashboard.finance.subscriptions.new | `/-authenticated/dashboard.finance.subscriptions.new` |  |
| dashboard.finance.time-tracking.$entryId | `/-authenticated/dashboard.finance.time-tracking.:entryId` |  |
| dashboard.finance.time-tracking.$entryId.edit | `/-authenticated/dashboard.finance.time-tracking.:entryId.edit` |  |
| dashboard.finance.time-tracking.approvals | `/-authenticated/dashboard.finance.time-tracking.approvals` |  |
| dashboard.finance.time-tracking.index | `/-authenticated/dashboard.finance.time-tracking.index` |  |
| dashboard.finance.time-tracking.monthly | `/-authenticated/dashboard.finance.time-tracking.monthly` |  |
| dashboard.finance.time-tracking.new | `/-authenticated/dashboard.finance.time-tracking.new` |  |
| dashboard.finance.time-tracking.weekly | `/-authenticated/dashboard.finance.time-tracking.weekly` |  |
| dashboard.finance.transactions-history.index | `/-authenticated/dashboard.finance.transactions-history.index` |  |
| dashboard.finance.transactions.index | `/-authenticated/dashboard.finance.transactions.index` |  |
| dashboard.finance.vendors.$vendorId | `/-authenticated/dashboard.finance.vendors.:vendorId` |  |
| dashboard.finance.vendors.$vendorId.edit | `/-authenticated/dashboard.finance.vendors.:vendorId.edit` |  |
| dashboard.finance.vendors.index | `/-authenticated/dashboard.finance.vendors.index` |  |
| dashboard.finance.vendors.new | `/-authenticated/dashboard.finance.vendors.new` |  |
| dashboard.followups.index | `/-authenticated/dashboard.followups.index` |  |
| dashboard.help | `/-authenticated/dashboard.help` |  |
| dashboard.hr | `/-authenticated/dashboard.hr` |  |
| dashboard.hr.advances.$advanceId | `/-authenticated/dashboard.hr.advances.:advanceId` |  |
| dashboard.hr.advances.index | `/-authenticated/dashboard.hr.advances.index` |  |
| dashboard.hr.advances.new | `/-authenticated/dashboard.hr.advances.new` |  |
| dashboard.hr.analytics.index | `/-authenticated/dashboard.hr.analytics.index` |  |
| dashboard.hr.asset-assignment.$assignmentId | `/-authenticated/dashboard.hr.asset-assignment.:assignmentId` |  |
| dashboard.hr.asset-assignment.index | `/-authenticated/dashboard.hr.asset-assignment.index` |  |
| dashboard.hr.asset-assignment.new | `/-authenticated/dashboard.hr.asset-assignment.new` |  |
| dashboard.hr.attendance.$recordId | `/-authenticated/dashboard.hr.attendance.:recordId` |  |
| dashboard.hr.attendance.index | `/-authenticated/dashboard.hr.attendance.index` |  |
| dashboard.hr.attendance.new | `/-authenticated/dashboard.hr.attendance.new` |  |
| dashboard.hr.benefits.$benefitId | `/-authenticated/dashboard.hr.benefits.:benefitId` |  |
| dashboard.hr.benefits.index | `/-authenticated/dashboard.hr.benefits.index` |  |
| dashboard.hr.benefits.new | `/-authenticated/dashboard.hr.benefits.new` |  |
| dashboard.hr.biometric.$deviceId | `/-authenticated/dashboard.hr.biometric.:deviceId` |  |
| dashboard.hr.biometric.index | `/-authenticated/dashboard.hr.biometric.index` |  |
| dashboard.hr.biometric.new | `/-authenticated/dashboard.hr.biometric.new` |  |
| dashboard.hr.compensation.$compensationId | `/-authenticated/dashboard.hr.compensation.:compensationId` |  |
| dashboard.hr.compensation.incentives | `/-authenticated/dashboard.hr.compensation.incentives` |  |
| dashboard.hr.compensation.index | `/-authenticated/dashboard.hr.compensation.index` |  |
| dashboard.hr.compensation.new | `/-authenticated/dashboard.hr.compensation.new` |  |
| dashboard.hr.compensation.retention-bonuses | `/-authenticated/dashboard.hr.compensation.retention-bonuses` |  |
| dashboard.hr.employee-transfers.$transferId | `/-authenticated/dashboard.hr.employee-transfers.:transferId` |  |
| dashboard.hr.employee-transfers.index | `/-authenticated/dashboard.hr.employee-transfers.index` |  |
| dashboard.hr.employee-transfers.new | `/-authenticated/dashboard.hr.employee-transfers.new` |  |
| dashboard.hr.employees.$employeeId | `/-authenticated/dashboard.hr.employees.:employeeId` |  |
| dashboard.hr.employees.index | `/-authenticated/dashboard.hr.employees.index` |  |
| dashboard.hr.employees.new | `/-authenticated/dashboard.hr.employees.new` |  |
| dashboard.hr.expense-claims.$claimId | `/-authenticated/dashboard.hr.expense-claims.:claimId` |  |
| dashboard.hr.expense-claims.index | `/-authenticated/dashboard.hr.expense-claims.index` |  |
| dashboard.hr.expense-claims.new | `/-authenticated/dashboard.hr.expense-claims.new` |  |
| dashboard.hr.geofencing.$zoneId | `/-authenticated/dashboard.hr.geofencing.:zoneId` |  |
| dashboard.hr.geofencing.index | `/-authenticated/dashboard.hr.geofencing.index` |  |
| dashboard.hr.geofencing.new | `/-authenticated/dashboard.hr.geofencing.new` |  |
| dashboard.hr.grievances.$grievanceId | `/-authenticated/dashboard.hr.grievances.:grievanceId` |  |
| dashboard.hr.grievances.index | `/-authenticated/dashboard.hr.grievances.index` |  |
| dashboard.hr.grievances.new | `/-authenticated/dashboard.hr.grievances.new` |  |
| dashboard.hr.job-positions.$positionId | `/-authenticated/dashboard.hr.job-positions.:positionId` |  |
| dashboard.hr.job-positions.index | `/-authenticated/dashboard.hr.job-positions.index` |  |
| dashboard.hr.job-positions.new | `/-authenticated/dashboard.hr.job-positions.new` |  |
| dashboard.hr.leave.$requestId | `/-authenticated/dashboard.hr.leave.:requestId` |  |
| dashboard.hr.leave.allocations | `/-authenticated/dashboard.hr.leave.allocations` |  |
| dashboard.hr.leave.compensatory | `/-authenticated/dashboard.hr.leave.compensatory` |  |
| dashboard.hr.leave.encashments | `/-authenticated/dashboard.hr.leave.encashments` |  |
| dashboard.hr.leave.index | `/-authenticated/dashboard.hr.leave.index` |  |
| dashboard.hr.leave.new | `/-authenticated/dashboard.hr.leave.new` |  |
| dashboard.hr.leave.periods | `/-authenticated/dashboard.hr.leave.periods` |  |
| dashboard.hr.leave.policies | `/-authenticated/dashboard.hr.leave.policies` |  |
| dashboard.hr.loans.$loanId | `/-authenticated/dashboard.hr.loans.:loanId` |  |
| dashboard.hr.loans.index | `/-authenticated/dashboard.hr.loans.index` |  |
| dashboard.hr.loans.new | `/-authenticated/dashboard.hr.loans.new` |  |
| dashboard.hr.offboarding.$offboardingId | `/-authenticated/dashboard.hr.offboarding.:offboardingId` |  |
| dashboard.hr.offboarding.index | `/-authenticated/dashboard.hr.offboarding.index` |  |
| dashboard.hr.offboarding.new | `/-authenticated/dashboard.hr.offboarding.new` |  |
| dashboard.hr.onboarding.$onboardingId | `/-authenticated/dashboard.hr.onboarding.:onboardingId` |  |
| dashboard.hr.onboarding.index | `/-authenticated/dashboard.hr.onboarding.index` |  |
| dashboard.hr.onboarding.new | `/-authenticated/dashboard.hr.onboarding.new` |  |
| dashboard.hr.organizational-structure.$unitId | `/-authenticated/dashboard.hr.organizational-structure.:unitId` |  |
| dashboard.hr.organizational-structure.index | `/-authenticated/dashboard.hr.organizational-structure.index` |  |
| dashboard.hr.organizational-structure.new | `/-authenticated/dashboard.hr.organizational-structure.new` |  |
| dashboard.hr.payroll-runs.$runId | `/-authenticated/dashboard.hr.payroll-runs.:runId` |  |
| dashboard.hr.payroll-runs.index | `/-authenticated/dashboard.hr.payroll-runs.index` |  |
| dashboard.hr.payroll-runs.new | `/-authenticated/dashboard.hr.payroll-runs.new` |  |
| dashboard.hr.payroll.$slipId | `/-authenticated/dashboard.hr.payroll.:slipId` |  |
| dashboard.hr.payroll.index | `/-authenticated/dashboard.hr.payroll.index` |  |
| dashboard.hr.payroll.new | `/-authenticated/dashboard.hr.payroll.new` |  |
| dashboard.hr.payroll.salary-components | `/-authenticated/dashboard.hr.payroll.salary-components` |  |
| dashboard.hr.performance.$reviewId | `/-authenticated/dashboard.hr.performance.:reviewId` |  |
| dashboard.hr.performance.index | `/-authenticated/dashboard.hr.performance.index` |  |
| dashboard.hr.performance.new | `/-authenticated/dashboard.hr.performance.new` |  |
| dashboard.hr.predictions.index | `/-authenticated/dashboard.hr.predictions.index` |  |
| dashboard.hr.promotions.$promotionId | `/-authenticated/dashboard.hr.promotions.:promotionId` |  |
| dashboard.hr.promotions.$promotionId.edit | `/-authenticated/dashboard.hr.promotions.:promotionId.edit` |  |
| dashboard.hr.promotions.index | `/-authenticated/dashboard.hr.promotions.index` |  |
| dashboard.hr.promotions.new | `/-authenticated/dashboard.hr.promotions.new` |  |
| dashboard.hr.recruitment.applicants.$applicantId | `/-authenticated/dashboard.hr.recruitment.applicants.:applicantId` |  |
| dashboard.hr.recruitment.applicants.index | `/-authenticated/dashboard.hr.recruitment.applicants.index` |  |
| dashboard.hr.recruitment.applicants.new | `/-authenticated/dashboard.hr.recruitment.applicants.new` |  |
| dashboard.hr.recruitment.jobs.$jobId | `/-authenticated/dashboard.hr.recruitment.jobs.:jobId` |  |
| dashboard.hr.recruitment.jobs.index | `/-authenticated/dashboard.hr.recruitment.jobs.index` |  |
| dashboard.hr.recruitment.jobs.new | `/-authenticated/dashboard.hr.recruitment.jobs.new` |  |
| dashboard.hr.recruitment.staffing-plans | `/-authenticated/dashboard.hr.recruitment.staffing-plans` |  |
| dashboard.hr.reports.$reportId | `/-authenticated/dashboard.hr.reports.:reportId` |  |
| dashboard.hr.reports.index | `/-authenticated/dashboard.hr.reports.index` |  |
| dashboard.hr.reports.new | `/-authenticated/dashboard.hr.reports.new` |  |
| dashboard.hr.settings.shift-types.index | `/-authenticated/dashboard.hr.settings.shift-types.index` |  |
| dashboard.hr.setup-wizard | `/-authenticated/dashboard.hr.setup-wizard` |  |
| dashboard.hr.shift-assignments.$assignmentId | `/-authenticated/dashboard.hr.shift-assignments.:assignmentId` | useNavigate, useShiftAssignment, useParams |
| dashboard.hr.shift-assignments.index | `/-authenticated/dashboard.hr.shift-assignments.index` |  |
| dashboard.hr.skills.index | `/-authenticated/dashboard.hr.skills.index` |  |
| dashboard.hr.skills.matrix | `/-authenticated/dashboard.hr.skills.matrix` |  |
| dashboard.hr.succession-planning.$planId | `/-authenticated/dashboard.hr.succession-planning.:planId` |  |
| dashboard.hr.succession-planning.index | `/-authenticated/dashboard.hr.succession-planning.index` |  |
| dashboard.hr.succession-planning.new | `/-authenticated/dashboard.hr.succession-planning.new` |  |
| dashboard.hr.training.$trainingId | `/-authenticated/dashboard.hr.training.:trainingId` |  |
| dashboard.hr.training.index | `/-authenticated/dashboard.hr.training.index` |  |
| dashboard.hr.training.new | `/-authenticated/dashboard.hr.training.new` |  |
| dashboard.hr.vehicles.index | `/-authenticated/dashboard.hr.vehicles.index` |  |
| dashboard.inventory | `/-authenticated/dashboard.inventory` |  |
| dashboard.inventory.$itemId | `/-authenticated/dashboard.inventory.:itemId` |  |
| dashboard.inventory.create | `/-authenticated/dashboard.inventory.create` |  |
| dashboard.inventory.index | `/-authenticated/dashboard.inventory.index` |  |
| dashboard.inventory.settings | `/-authenticated/dashboard.inventory.settings` |  |
| dashboard.inventory.warehouses.$warehouseId | `/-authenticated/dashboard.inventory.warehouses.:warehouseId` |  |
| dashboard.inventory.warehouses.create | `/-authenticated/dashboard.inventory.warehouses.create` |  |
| dashboard.inventory.warehouses.index | `/-authenticated/dashboard.inventory.warehouses.index` |  |
| dashboard.invoice-templates.index | `/-authenticated/dashboard.invoice-templates.index` |  |
| dashboard.jobs.browse | `/-authenticated/dashboard.jobs.browse` |  |
| dashboard.jobs.my-services | `/-authenticated/dashboard.jobs.my-services` |  |
| dashboard.knowledge.forms | `/-authenticated/dashboard.knowledge.forms` |  |
| dashboard.knowledge.judgments | `/-authenticated/dashboard.knowledge.judgments` |  |
| dashboard.knowledge.laws | `/-authenticated/dashboard.knowledge.laws` |  |
| dashboard.messages.chat | `/-authenticated/dashboard.messages.chat` |  |
| dashboard.messages.email | `/-authenticated/dashboard.messages.email` |  |
| dashboard.ml.analytics | `/-authenticated/dashboard.ml.analytics` |  |
| dashboard.ml.queue | `/-authenticated/dashboard.ml.queue` | useTranslation |
| dashboard.ml.sla | `/-authenticated/dashboard.ml.sla` | useTranslation |
| dashboard.notifications.index | `/-authenticated/dashboard.notifications.index` |  |
| dashboard.notifications.settings | `/-authenticated/dashboard.notifications.settings` |  |
| dashboard.notion | `/-authenticated/dashboard.notion` |  |
| dashboard.organizations.$organizationId | `/-authenticated/dashboard.organizations.:organizationId` |  |
| dashboard.organizations.index | `/-authenticated/dashboard.organizations.index` |  |
| dashboard.organizations.new | `/-authenticated/dashboard.organizations.new` |  |
| dashboard.reports.index | `/-authenticated/dashboard.reports.index` |  |
| dashboard.reputation.badges | `/-authenticated/dashboard.reputation.badges` |  |
| dashboard.reputation.overview | `/-authenticated/dashboard.reputation.overview` |  |
| dashboard.sales.leads.index | `/-authenticated/dashboard.sales.leads.index` |  |
| dashboard.sales.reports.$reportId | `/-authenticated/dashboard.sales.reports.:reportId` |  |
| dashboard.sales.reports.index | `/-authenticated/dashboard.sales.reports.index` |  |
| dashboard.sales.reports.new | `/-authenticated/dashboard.sales.reports.new` |  |
| dashboard.settings | `/-authenticated/dashboard.settings` |  |
| dashboard.settings.company | `/-authenticated/dashboard.settings.company` |  |
| dashboard.settings.crm | `/-authenticated/dashboard.settings.crm` |  |
| dashboard.settings.expense-policies | `/-authenticated/dashboard.settings.expense-policies` |  |
| dashboard.settings.finance | `/-authenticated/dashboard.settings.finance` |  |
| dashboard.settings.payment-modes | `/-authenticated/dashboard.settings.payment-modes` |  |
| dashboard.settings.payment-terms | `/-authenticated/dashboard.settings.payment-terms` |  |
| dashboard.settings.preferences | `/-authenticated/dashboard.settings.preferences` |  |
| dashboard.settings.profile | `/-authenticated/dashboard.settings.profile` |  |
| dashboard.settings.security | `/-authenticated/dashboard.settings.security` |  |
| dashboard.settings.taxes | `/-authenticated/dashboard.settings.taxes` |  |
| dashboard.setup-orchestrator | `/-authenticated/dashboard.setup-orchestrator` |  |
| dashboard.staff.index | `/-authenticated/dashboard.staff.index` |  |
| dashboard.staff.new | `/-authenticated/dashboard.staff.new` |  |
| dashboard.support.$ticketId | `/-authenticated/dashboard.support.:ticketId` |  |
| dashboard.support.create | `/-authenticated/dashboard.support.create` |  |
| dashboard.support.index | `/-authenticated/dashboard.support.index` |  |
| dashboard.support.settings | `/-authenticated/dashboard.support.settings` |  |
| dashboard.support.sla | `/-authenticated/dashboard.support.sla` |  |
| dashboard.support.sla.create | `/-authenticated/dashboard.support.sla.create` |  |
| dashboard.support.sla.index | `/-authenticated/dashboard.support.sla.index` |  |
| dashboard.tags.index | `/-authenticated/dashboard.tags.index` |  |
| dashboard.tasks | `/-authenticated/dashboard.tasks` |  |
| dashboard.tasks.$taskId | `/-authenticated/dashboard.tasks.:taskId` |  |
| dashboard.tasks.events.$eventId | `/-authenticated/dashboard.tasks.events.:eventId` |  |
| dashboard.tasks.events.index | `/-authenticated/dashboard.tasks.events.index` |  |
| dashboard.tasks.events.new | `/-authenticated/dashboard.tasks.events.new` |  |
| dashboard.tasks.gantt | `/-authenticated/dashboard.tasks.gantt` |  |
| dashboard.tasks.list | `/-authenticated/dashboard.tasks.list` |  |
| dashboard.tasks.new | `/-authenticated/dashboard.tasks.new` |  |
| dashboard.tasks.reminders.$reminderId | `/-authenticated/dashboard.tasks.reminders.:reminderId` |  |
| dashboard.tasks.reminders.index | `/-authenticated/dashboard.tasks.reminders.index` |  |
| dashboard.tasks.reminders.new | `/-authenticated/dashboard.tasks.reminders.new` |  |
| dashboard.tasks.reports.$reportId | `/-authenticated/dashboard.tasks.reports.:reportId` |  |
| dashboard.tasks.reports.index | `/-authenticated/dashboard.tasks.reports.index` |  |
| dashboard.tasks.reports.new | `/-authenticated/dashboard.tasks.reports.new` |  |
| sales | `/-authenticated/dashboard/settings/sales` |  |
| $error | `/-authenticated/errors/:error` | useParams |
| index | `/-authenticated/help-center` |  |
| route | `/-authenticated/route` | useAuthStore |
| index | `/-authenticated/settings` |  |
| account | `/-authenticated/settings/account` |  |
| api-keys | `/-authenticated/settings/api-keys` |  |
| appearance | `/-authenticated/settings/appearance` |  |
| billing | `/-authenticated/settings/billing` |  |
| display | `/-authenticated/settings/display` |  |
| email | `/-authenticated/settings/email` |  |
| integrations | `/-authenticated/settings/integrations` |  |
| modules | `/-authenticated/settings/modules` |  |
| notifications | `/-authenticated/settings/notifications` |  |
| route | `/-authenticated/settings/route` |  |
| webhooks | `/-authenticated/settings/webhooks` |  |
| index | `/-authenticated/users` |  |
| auth.callback.$provider | `/(auth)/auth.callback.:provider` | useNavigate, useEffect, useState... |
| conflict-policy | `/(auth)/conflict-policy` |  |
| forgot-password | `/(auth)/forgot-password` |  |
| magic-link | `/(auth)/magic-link` |  |
| mfa-challenge | `/(auth)/mfa-challenge` |  |
| no-firm | `/(auth)/no-firm` |  |
| otp | `/(auth)/otp` |  |
| privacy | `/(auth)/privacy` |  |
| sign-in | `/(auth)/sign-in` |  |
| sign-in-2 | `/(auth)/sign-in-2` |  |
| sign-up | `/(auth)/sign-up` |  |
| sign-up.complete-profile | `/(auth)/sign-up.complete-profile` |  |
| terms | `/(auth)/terms` |  |
| verify-email | `/(auth)/verify-email` |  |
| 401 | `/(errors)/401` |  |
| 403 | `/(errors)/403` |  |
| 404 | `/(errors)/404` |  |
| 500 | `/(errors)/500` |  |
| 503 | `/(errors)/503` |  |
| account-activity | `/account-activity` |  |
| account-statements | `/account-statements` |  |
| case-details | `/case-details` |  |
| cases-dashboard | `/cases-dashboard` |  |
| route | `/clerk/-authenticated/route` |  |
| user-management | `/clerk/-authenticated/user-management` | useEffect, useState, useNavigate... |
| route | `/clerk/(auth)/route` |  |
| sign-in | `/clerk/(auth)/sign-in` |  |
| sign-up | `/clerk/(auth)/sign-up` |  |
| route | `/clerk/route` |  |
| events | `/events` |  |
| expenses | `/expenses` |  |
| generate-statement | `/generate-statement` |  |
| gosi-chat | `/gosi-chat` |  |
| improved-calendar | `/improved-calendar` |  |
| improved-case | `/improved-case` |  |
| improved-tasks | `/improved-tasks` |  |
| invoices | `/invoices` |  |
| legal-tasks | `/legal-tasks` |  |
| reminders | `/reminders` |  |
| statements-history | `/statements-history` |  |
| task-details | `/task-details` |  |
| tasks | `/tasks` |  |
| time-entries | `/time-entries` |  |

---

## Hooks

| Hook | Returns | API Calls |
|------|---------|------------|
| `index` | - | 0 |
| `index` | - | 0 |
| `use-assets` | - | 0 |
| `use-buying` | - | 0 |
| `use-cancellable-request` | makeRequest, cancelRequest, isRequestPending | 0 |
| `use-crm-reports` | - | 37 |
| `use-dialog-state` | - | 0 |
| `use-idle-prefetch` | - | 0 |
| `use-inventory` | - | 0 |
| `use-mobile` | - | 0 |
| `use-organizations` | - | 0 |
| `use-permissions` | isLoading, error, noFirmAssociated | 0 |
| `use-route-prefetch` | - | 0 |
| `use-service-health` | health, isLoading, error | 2 |
| `use-session-warning` | warning, showModal, setShowModal | 1 |
| `use-sidebar-data` | ...item, items | 0 |
| `use-support` | - | 0 |
| `use-table-url-state` | pageIndex, pageNum - 1), pageSize | 0 |
| `use-toast` | - | 0 |
| `useAccounting` | - | 0 |
| `useActivities` | ...old, activities, ...old.activities] | 0 |
| `useAdaptiveDebounce` | debouncedCallback, recordKeypress, currentDelay | 0 |
| `useAdvances` | - | 0 |
| `useAnonymousAuth` | isAnonymous, expiresAt, daysRemaining | 0 |
| `useApiError` | message, status, validationErrors | 1 |
| `useApiError.helpers` | - | 0 |
| `useApiKeys` | - | 0 |
| `useAppointments` | previousData | 0 |
| `useApps` | ...old, apps | 0 |
| `useAssetAssignment` | - | 0 |
| `useAttendance` | - | 0 |
| `useAuditLog` | create, resourceId, details? | 0 |
| `useAuth` | - | 0 |
| `useAutomatedActions` | - | 0 |
| `useBenefits` | - | 0 |
| `useBilling` | - | 0 |
| `useBillingRates` | ...old, rates, ...old.rates] | 0 |
| `useBillingSettings` | - | 0 |
| `useBiometric` | - | 0 |
| `useBudgets` | ...old, budgets, ...old.budgets] | 0 |
| `useCalendar` | prefetchPrevMonth, prefetchNextMonth | 1 |
| `useCalendarIntegration` | previousStatus | 0 |
| `useCampaigns` | ...old, data, ...old.data] | 0 |
| `useCaptcha` | execute, reset, isReady | 0 |
| `useCaseNotion` | - | 0 |
| `useCasesAndClients` | total, active, closed | 0 |
| `useCaseWorkflows` | ...old, workflows, ...old.workflows] | 0 |
| `useChat` | - | 7 |
| `useChatter` | - | 0 |
| `useClients` | ...old, data, ...old.data] | 0 |
| `useCompanies` | - | 0 |
| `useCompensation` | - | 1 |
| `useCompensatoryLeave` | - | 0 |
| `useConsolidatedReport` | - | 0 |
| `useContacts` | ...old, data, ...old.data] | 0 |
| `useConversations` | - | 0 |
| `useCorporateCards` | - | 0 |
| `useCrm` | ...old, leads, ...old.leads] | 0 |
| `useCrmAdvanced` | - | 0 |
| `useCrmAnalytics` | - | 0 |
| `useCrmSettingsComprehensive` | - | 0 |
| `useDashboard` | - | 0 |
| `useDataExport` | - | 0 |
| `useDebounce` | - | 0 |
| `useDebounce.test` | - | 0 |
| `useDocuments` | ...old, documents, ...old.documents] | 0 |
| `useDocumentVersions` | - | 0 |
| `useEmailSettings` | ...old, signatures, ...old.signatures] | 0 |
| `useEmployeeIncentive` | - | 0 |
| `useEmployeePromotion` | - | 0 |
| `useEmployeeSkillMap` | - | 0 |
| `useEmployeeTransfer` | - | 0 |
| `useEnterprisePermissions` | ...old, policies, ...old.policies] | 0 |
| `useExpenseClaims` | - | 0 |
| `useExpensePolicies` | ...old, policies, ...old.policies] | 0 |
| `useFeatureFlag` | isEnabled, status, description | 0 |
| `useFinance` | ...old, invoices, ...old.invoices] | 3 |
| `useFinance.approval-hooks` | - | 0 |
| `useFinanceAdvanced` | - | 0 |
| `useFollowups` | ...old, followups, ...old.followups] | 0 |
| `useFormValidation` | isValid, firstErrorField | 0 |
| `useGantt` | - | 0 |
| `useGrievances` | - | 0 |
| `useHR` | - | 0 |
| `useHrAnalytics` | - | 1 |
| `useImageLoader` | ...state, load, reset | 0 |
| `useIntegrations` | - | 0 |
| `useInterCompany` | - | 0 |
| `useInvoiceTemplates` | ...old, templates, ...old.templates] | 0 |
| `useJobPositions` | - | 0 |
| `useJobs` | total, open, inProgress | 0 |
| `useKanban` | ...old, cases, currentStage | 0 |
| `useKeyboardShortcuts` | main, bulk, navigation | 0 |
| `useLDAP` | - | 0 |
| `useLeave` | - | 0 |
| `useLeaveAllocation` | - | 0 |
| `useLeaveEncashment` | - | 0 |
| `useLeavePeriod` | - | 0 |
| `useLeavePolicy` | - | 0 |
| `useLoans` | - | 0 |
| `useLockDates` | checkDate, checkDateRange | 0 |
| `useMessages` | - | 0 |
| `useMFA` | requireMFA, showModal, setShowModal | 0 |
| `useMlScoring` | - | 0 |
| `useNotifications` | ...old, notifications, read | 0 |
| `useOAuth` | - | 0 |
| `useOdooActivities` | - | 0 |
| `useOffboarding` | - | 0 |
| `useOnboarding` | - | 0 |
| `useOnboardingWizard` | - | 0 |
| `useOnlineStatus` | isOnline, isOffline | 0 |
| `useOrganizationalStructure` | - | 0 |
| `useOrganizations` | ...old, organizations, ...old.organizations] | 0 |
| `usePassword` | valid, message | 0 |
| `usePayroll` | - | 0 |
| `usePayrollRun` | - | 0 |
| `usePerformanceReviews` | - | 0 |
| `usePhoneAuth` | setPhone, otp, setOtp | 0 |
| `usePlanFeatures` | users, cases, clients | 0 |
| `usePlanFeatures.example` | - | 0 |
| `useProductEnhanced` | - | 0 |
| `useProducts` | ...old, data, ...old.data] | 0 |
| `useQuotes` | ...old, data, ...old.data] | 0 |
| `useRateLimit` | status, isAllowed, isLocked | 0 |
| `useReceipt` | isLoading, error, downloadReceipt | 0 |
| `useRecruitment` | - | 0 |
| `useRemindersAndEvents` | ...old, data, ...old.data] | 2 |
| `useReports` | data, total | 1 |
| `useRetentionBonus` | - | 1 |
| `useSalaryComponent` | - | 0 |
| `useSalesSettings` | - | 0 |
| `useSaudiBanking` | - | 43 |
| `useSearchCache` | size, hitRate, avgAge | 0 |
| `useSessions` | - | 0 |
| `useSessionTimeout` | remainingTime, isWarning, resetTimer | 0 |
| `useSessionTimeout.test` | - | 0 |
| `useSettings` | - | 0 |
| `useSetupOrchestration` | hasAnyPending, hasCriticalPending, isLoading | 0 |
| `useShiftAssignment` | - | 0 |
| `useShiftType` | - | 0 |
| `useSkill` | - | 0 |
| `useSmartButtonCounts` | counts, isLoading, error | 1 |
| `useSmartButtons` | counts, isLoading, isError | 0 |
| `useSSO` | - | 0 |
| `useStaff` | - | 4 |
| `useStaffingPlan` | - | 0 |
| `useStepUpAuth` | showReauthModal, setShowReauthModal, executeWithReauth | 0 |
| `useSubscriptions` | - | 0 |
| `useSuccessionPlanning` | - | 1 |
| `useTags` | - | 0 |
| `useTasks` | ...old, tasks, ...old.tasks] | 1 |
| `useTraining` | - | 0 |
| `useTrustAccount` | - | 0 |
| `useUIAccess` | - | 1 |
| `useUsers` | - | 0 |
| `useVehicle` | - | 0 |
| `useWebhooks` | - | 0 |
| `useWelcome` | - | 0 |
| `useWindowSize` | - | 0 |

---

## Routes

| Name | Path | Dynamic |
|------|------|--------|
| heroStats | `/dashboard/hero-stats` |  |
| stats | `/dashboard/stats` |  |
| summary | `/dashboard/summary` |  |
| todayEvents | `/dashboard/today-events` |  |
| financialSummary | `/dashboard/financial-summary` |  |
| recentMessages | `/dashboard/recent-messages` |  |
| activity | `/dashboard/activity` |  |
| crmStats | `/dashboard/crm-stats` |  |
| hrStats | `/dashboard/hr-stats` |  |
| financeStats | `/dashboard/finance-stats` |  |
| hearingsUpcoming | `/dashboard/hearings/upcoming` |  |
| deadlinesUpcoming | `/dashboard/deadlines/upcoming` |  |
| timeEntriesSummary | `/dashboard/time-entries/summary` |  |
| documentsPending | `/dashboard/documents/pending` |  |
| casesChart | `/reports/cases-chart` |  |
| revenueChart | `/reports/revenue-chart` |  |
| tasksChart | `/reports/tasks-chart` |  |
| stats | `/messages/stats` |  |
| signIn | `/sign-in` |  |
| signIn2 | `/sign-in-2` |  |
| signUp | `/sign-up` |  |
| signUpCompleteProfile | `/sign-up/complete-profile` |  |
| forgotPassword | `/forgot-password` |  |
| verifyEmail | `/verify-email` |  |
| magicLink | `/magic-link` |  |
| mfaChallenge | `/mfa-challenge` |  |
| otp | `/otp` |  |
| noFirm | `/no-firm` |  |
| terms | `/terms` |  |
| privacy | `/privacy` |  |
| conflictPolicy | `/conflict-policy` |  |
| signIn | `/clerk/sign-in` |  |
| signUp | `/clerk/sign-up` |  |
| userManagement | `/clerk/user-management` |  |
| home | `/` |  |
| overview | `/dashboard/overview` |  |
| help | `/dashboard/help` |  |
| list | `/dashboard/cases` |  |
| new | `/dashboard/cases/new` |  |
| kanban | `/dashboard/cases/kanban` |  |
| pipeline | `/dashboard/cases/pipeline` |  |
| pipelineBoard | `/dashboard/cases/pipeline/board` |  |
| list | `/dashboard/case-workflows` |  |
| list | `/dashboard/clients` |  |
| new | `/dashboard/clients/new` |  |
| list | `/dashboard/contacts` |  |
| new | `/dashboard/contacts/new` |  |
| list | `/dashboard/organizations` |  |
| new | `/dashboard/organizations/new` |  |
| list | `/dashboard/staff` |  |
| new | `/dashboard/staff/new` |  |
| activities | `/dashboard/activities` |  |
| calendar | `/dashboard/calendar` |  |
| appointments | `/dashboard/appointments` |  |
| notion | `/dashboard/notion` |  |
| list | `/dashboard/followups` |  |
| new | `/dashboard/followups/new` |  |
| list | `/dashboard/tasks/list` |  |
| new | `/dashboard/tasks/new` |  |
| gantt | `/dashboard/tasks/gantt` |  |
| list | `/dashboard/tasks/events` |  |
| new | `/dashboard/tasks/events/new` |  |
| list | `/dashboard/tasks/reminders` |  |
| new | `/dashboard/tasks/reminders/new` |  |
| list | `/dashboard/tasks/reports` |  |
| new | `/dashboard/tasks/reports/new` |  |
| overview | `/dashboard/finance/overview` |  |
| setupWizard | `/dashboard/finance/setup-wizard` |  |
| list | `/dashboard/finance/invoices` |  |
| new | `/dashboard/finance/invoices/new` |  |
| approvals | `/dashboard/finance/invoices/approvals` |  |
| list | `/dashboard/finance/recurring-invoices` |  |
| new | `/dashboard/finance/recurring-invoices/new` |  |
| list | `/dashboard/finance/recurring` |  |
| list | `/dashboard/finance/subscriptions` |  |
| new | `/dashboard/finance/subscriptions/new` |  |
| list | `/dashboard/finance/subscription-plans` |  |
| new | `/dashboard/finance/subscription-plans/new` |  |
| list | `/dashboard/finance/quotes` |  |
| new | `/dashboard/finance/quotes/new` |  |
| list | `/dashboard/finance/credit-notes` |  |
| new | `/dashboard/finance/credit-notes/new` |  |
| list | `/dashboard/finance/debit-notes` |  |
| new | `/dashboard/finance/debit-notes/new` |  |
| list | `/dashboard/finance/bills` |  |
| new | `/dashboard/finance/bills/new` |  |
| list | `/dashboard/finance/payments` |  |
| new | `/dashboard/finance/payments/new` |  |
| list | `/dashboard/finance/expenses` |  |
| new | `/dashboard/finance/expenses/new` |  |
| list | `/dashboard/finance/vendors` |  |
| new | `/dashboard/finance/vendors/new` |  |
| list | `/dashboard/finance/retainers` |  |
| new | `/dashboard/finance/retainers/new` |  |
| list | `/dashboard/finance/statements` |  |
| new | `/dashboard/finance/statements/new` |  |
| list | `/dashboard/finance/activity` |  |
| new | `/dashboard/finance/activity/new` |  |
| list | `/dashboard/finance/time-tracking` |  |
| new | `/dashboard/finance/time-tracking/new` |  |
| weekly | `/dashboard/finance/time-tracking/weekly` |  |
| monthly | `/dashboard/finance/time-tracking/monthly` |  |
| approvals | `/dashboard/finance/time-tracking/approvals` |  |
| list | `/dashboard/finance/journal-entries` |  |
| new | `/dashboard/finance/journal-entries/new` |  |
| list | `/dashboard/finance/reconciliation` |  |
| new | `/dashboard/finance/reconciliation/new` |  |
| list | `/dashboard/finance/currency` |  |
| new | `/dashboard/finance/currency/new` |  |
| list | `/dashboard/finance/reports` |  |
| new | `/dashboard/finance/reports/new` |  |
| financial | `/dashboard/finance/reports/financial` |  |
| accountsAging | `/dashboard/finance/reports/accounts-aging` |  |
| outstandingInvoices | `/dashboard/finance/reports/outstanding-invoices` |  |
| revenueByClient | `/dashboard/finance/reports/revenue-by-client` |  |
| timeEntries | `/dashboard/finance/reports/time-entries` |  |
| list | `/dashboard/finance/full-reports` |  |
| consolidatedReports | `/dashboard/finance/consolidated-reports` |  |
| chartOfAccounts | `/dashboard/finance/chart-of-accounts` |  |
| generalLedger | `/dashboard/finance/general-ledger` |  |
| openingBalances | `/dashboard/finance/opening-balances` |  |
| list | `/dashboard/finance/fiscal-periods` |  |
| list | `/dashboard/finance/transactions` |  |
| new | `/dashboard/finance/transactions/new` |  |
| list | `/dashboard/finance/transactions-history` |  |
| list | `/dashboard/finance/corporate-cards` |  |
| new | `/dashboard/finance/corporate-cards/new` |  |
| reconcileAll | `/dashboard/finance/corporate-cards/reconcile` |  |
| index | `/dashboard/finance/saudi-banking` |  |
| lean | `/dashboard/finance/saudi-banking/lean` |  |
| mudad | `/dashboard/finance/saudi-banking/mudad` |  |
| index | `/dashboard/finance/saudi-banking/sadad` |  |
| pay | `/dashboard/finance/saudi-banking/sadad/pay` |  |
| index | `/dashboard/finance/saudi-banking/wps` |  |
| new | `/dashboard/finance/saudi-banking/wps/new` |  |
| generate | `/dashboard/finance/saudi-banking/wps/generate` |  |
| history | `/dashboard/finance/saudi-banking/wps/history` |  |
| index | `/dashboard/finance/saudi-banking/gosi` |  |
| calculator | `/dashboard/finance/saudi-banking/gosi/calculator` |  |
| reports | `/dashboard/finance/saudi-banking/gosi/reports` |  |
| newReport | `/dashboard/finance/saudi-banking/gosi/reports/new` |  |
| index | `/dashboard/finance/saudi-banking/compliance` |  |
| nitaqat | `/dashboard/finance/saudi-banking/compliance/nitaqat` |  |
| deadlines | `/dashboard/finance/saudi-banking/compliance/deadlines` |  |
| iqamaAlerts | `/dashboard/finance/saudi-banking/compliance/iqama-alerts` |  |
| list | `/dashboard/finance/inter-company` |  |
| new | `/dashboard/finance/inter-company/new` |  |
| balances | `/dashboard/finance/inter-company/balances` |  |
| reconciliation | `/dashboard/finance/inter-company/reconciliation` |  |
| list | `/dashboard/finance/budgets` |  |
| new | `/dashboard/finance/budgets/new` |  |
| setupWizard | `/dashboard/hr/setup-wizard` |  |
| list | `/dashboard/hr/employees` |  |
| new | `/dashboard/hr/employees/new` |  |
| list | `/dashboard/hr/attendance` |  |
| new | `/dashboard/hr/attendance/new` |  |
| list | `/dashboard/hr/leave` |  |
| new | `/dashboard/hr/leave/new` |  |
| allocations | `/dashboard/hr/leave/allocations` |  |
| list | `/dashboard/hr/leave/compensatory` |  |
| new | `/dashboard/hr/leave/compensatory/new` |  |
| list | `/dashboard/hr/leave/encashments` |  |
| new | `/dashboard/hr/leave/encashments/new` |  |
| periods | `/dashboard/hr/leave/periods` |  |
| policies | `/dashboard/hr/leave/policies` |  |
| list | `/dashboard/hr/payroll` |  |
| new | `/dashboard/hr/payroll/new` |  |
| salaryComponents | `/dashboard/hr/payroll/salary-components` |  |
| list | `/dashboard/hr/payroll-runs` |  |
| new | `/dashboard/hr/payroll-runs/new` |  |
| list | `/dashboard/hr/compensation` |  |
| new | `/dashboard/hr/compensation/new` |  |
| incentives | `/dashboard/hr/compensation/incentives` |  |
| retentionBonuses | `/dashboard/hr/compensation/retention-bonuses` |  |
| list | `/dashboard/hr/benefits` |  |
| new | `/dashboard/hr/benefits/new` |  |
| list | `/dashboard/hr/loans` |  |
| new | `/dashboard/hr/loans/new` |  |
| list | `/dashboard/hr/advances` |  |
| new | `/dashboard/hr/advances/new` |  |
| list | `/dashboard/hr/expense-claims` |  |
| new | `/dashboard/hr/expense-claims/new` |  |
| list | `/dashboard/hr/asset-assignment` |  |
| new | `/dashboard/hr/asset-assignment/new` |  |
| list | `/dashboard/hr/recruitment/jobs` |  |
| new | `/dashboard/hr/recruitment/jobs/new` |  |
| list | `/dashboard/hr/recruitment/applicants` |  |
| new | `/dashboard/hr/recruitment/applicants/new` |  |
| list | `/dashboard/hr/recruitment/staffing-plans` |  |
| list | `/dashboard/hr/onboarding` |  |
| new | `/dashboard/hr/onboarding/new` |  |
| list | `/dashboard/hr/offboarding` |  |
| new | `/dashboard/hr/offboarding/new` |  |
| list | `/dashboard/hr/performance` |  |
| new | `/dashboard/hr/performance/new` |  |
| list | `/dashboard/hr/training` |  |
| new | `/dashboard/hr/training/new` |  |
| list | `/dashboard/hr/job-positions` |  |
| new | `/dashboard/hr/job-positions/new` |  |
| list | `/dashboard/hr/organizational-structure` |  |
| new | `/dashboard/hr/organizational-structure/new` |  |
| list | `/dashboard/hr/employee-transfers` |  |
| new | `/dashboard/hr/employee-transfers/new` |  |
| list | `/dashboard/hr/promotions` |  |
| new | `/dashboard/hr/promotions/new` |  |
| list | `/dashboard/hr/succession-planning` |  |
| new | `/dashboard/hr/succession-planning/new` |  |
| list | `/dashboard/hr/shift-assignments` |  |
| list | `/dashboard/hr/biometric` |  |
| new | `/dashboard/hr/biometric/new` |  |
| list | `/dashboard/hr/geofencing` |  |
| new | `/dashboard/hr/geofencing/new` |  |
| list | `/dashboard/hr/vehicles` |  |
| list | `/dashboard/hr/grievances` |  |
| new | `/dashboard/hr/grievances/new` |  |
| list | `/dashboard/hr/salaries` |  |
| new | `/dashboard/hr/salaries/new` |  |
| list | `/dashboard/hr/evaluations` |  |
| new | `/dashboard/hr/evaluations/new` |  |
| list | `/dashboard/hr/skills` |  |
| matrix | `/dashboard/hr/skills/matrix` |  |
| list | `/dashboard/hr/analytics` |  |
| list | `/dashboard/hr/predictions` |  |
| list | `/dashboard/hr/reports` |  |
| new | `/dashboard/hr/reports/new` |  |
| list | `/dashboard/hr/settings/shift-types` |  |
| index | `/dashboard/crm` |  |
| setupWizard | `/dashboard/crm/setup-wizard` |  |
| pipeline | `/dashboard/crm/pipeline` |  |
| appointments | `/dashboard/crm/appointments` |  |
| crmReports | `/dashboard/crm/crm-reports` |  |
| salesPersons | `/dashboard/crm/sales-persons` |  |
| territories | `/dashboard/crm/territories` |  |
| transactions | `/dashboard/crm/transactions` |  |
| list | `/dashboard/crm/contacts` |  |
| new | `/dashboard/crm/contacts/new` |  |
| list | `/dashboard/crm/campaigns` |  |
| new | `/dashboard/crm/campaigns/new` |  |
| list | `/dashboard/crm/leads` |  |
| new | `/dashboard/crm/leads/new` |  |
| list | `/dashboard/crm/lead-scoring` |  |
| list | `/dashboard/crm/activities` |  |
| new | `/dashboard/crm/activities/new` |  |
| calendar | `/dashboard/crm/activities/calendar` |  |
| list | `/dashboard/crm/referrals` |  |
| new | `/dashboard/crm/referrals/new` |  |
| list | `/dashboard/crm/email-marketing` |  |
| new | `/dashboard/crm/email-marketing/new` |  |
| list | `/dashboard/crm/whatsapp` |  |
| new | `/dashboard/crm/whatsapp/new` |  |
| start | `/dashboard/crm/whatsapp/start` |  |
| list | `/dashboard/crm/reports` |  |
| new | `/dashboard/crm/reports/new` |  |
| list | `/dashboard/crm/products` |  |
| new | `/dashboard/crm/products/new` |  |
| list | `/dashboard/crm/quotes` |  |
| new | `/dashboard/crm/quotes/new` |  |
| general | `/dashboard/crm/settings/general` |  |
| duplicateDetection | `/dashboard/crm/settings/duplicate-detection` |  |
| activityPlans | `/dashboard/crm/settings/activity-plans` |  |
| quotas | `/dashboard/crm/settings/quotas` |  |
| lostReasons | `/dashboard/crm/settings/lost-reasons` |  |
| salesTeams | `/dashboard/crm/settings/sales-teams` |  |
| tags | `/dashboard/crm/settings/tags` |  |
| territories | `/dashboard/crm/settings/territories` |  |
| emailTemplates | `/dashboard/crm/settings/email-templates` |  |
| list | `/dashboard/inventory` |  |
| create | `/dashboard/inventory/create` |  |
| settings | `/dashboard/inventory/settings` |  |
| list | `/dashboard/inventory/warehouses` |  |
| create | `/dashboard/inventory/warehouses/create` |  |
| list | `/dashboard/assets` |  |
| create | `/dashboard/assets/create` |  |
| settings | `/dashboard/assets/settings` |  |
| list | `/dashboard/assets/categories` |  |
| create | `/dashboard/assets/categories/create` |  |
| list | `/dashboard/assets/maintenance` |  |
| create | `/dashboard/assets/maintenance/create` |  |
| list | `/dashboard/assets/depreciation` |  |
| list | `/dashboard/assets/movements` |  |
| list | `/dashboard/buying` |  |
| create | `/dashboard/buying/create` |  |
| settings | `/dashboard/buying/settings` |  |
| list | `/dashboard/buying/suppliers` |  |
| new | `/dashboard/buying/suppliers/new` |  |
| list | `/dashboard/buying/purchase-orders` |  |
| create | `/dashboard/buying/purchase-orders/create` |  |
| list | `/dashboard/buying/purchase-receipts` |  |
| index | `/dashboard/sales` |  |
| list | `/dashboard/sales/leads` |  |
| new | `/dashboard/sales/leads/new` |  |
| list | `/dashboard/sales/reports` |  |
| new | `/dashboard/sales/reports/new` |  |
| transactions | `/dashboard/sales/transactions` |  |
| settings | `/dashboard/sales/settings` |  |
| pipeline | `/dashboard/sales/pipeline` |  |
| list | `/dashboard/sales/quotes` |  |
| new | `/dashboard/sales/quotes/new` |  |
| list | `/dashboard/sales/orders` |  |
| new | `/dashboard/sales/orders/new` |  |
| list | `/dashboard/sales/customers` |  |
| new | `/dashboard/sales/customers/new` |  |
| list | `/dashboard/support` |  |
| create | `/dashboard/support/create` |  |
| settings | `/dashboard/support/settings` |  |
| requestAccess | `/dashboard/support/request-access` |  |
| list | `/dashboard/support/sla` |  |
| create | `/dashboard/support/sla/create` |  |
| queue | `/dashboard/ml/queue` |  |
| sla | `/dashboard/ml/sla` |  |
| analytics | `/dashboard/ml/analytics` |  |
| chat | `/dashboard/messages/chat` |  |
| email | `/dashboard/messages/email` |  |
| list | `/dashboard/knowledge/forms` |  |
| new | `/dashboard/knowledge/forms/new` |  |
| list | `/dashboard/knowledge/judgments` |  |
| new | `/dashboard/knowledge/judgments/new` |  |
| list | `/dashboard/knowledge/laws` |  |
| new | `/dashboard/knowledge/laws/new` |  |
| list | `/dashboard/jobs` |  |
| new | `/dashboard/jobs/new` |  |
| browse | `/dashboard/jobs/browse` |  |
| myServices | `/dashboard/jobs/my-services` |  |
| overview | `/dashboard/reputation/overview` |  |
| badges | `/dashboard/reputation/badges` |  |
| list | `/dashboard/notifications` |  |
| settings | `/dashboard/notifications/settings` |  |
| list | `/dashboard/documents` |  |
| new | `/dashboard/documents/new` |  |
| list | `/dashboard/reports` |  |
| list | `/dashboard/tags` |  |
| list | `/dashboard/billing-rates` |  |
| list | `/dashboard/invoice-templates` |  |
| list | `/dashboard/data-export` |  |
| list | `/dashboard/apps` |  |
| setupOrchestrator | `/dashboard/setup-orchestrator` |  |
| index | `/dashboard/settings` |  |
| profile | `/dashboard/settings/profile` |  |
| company | `/dashboard/settings/company` |  |
| security | `/dashboard/settings/security` |  |
| preferences | `/dashboard/settings/preferences` |  |
| finance | `/dashboard/settings/finance` |  |
| crm | `/dashboard/settings/crm` |  |
| sales | `/dashboard/settings/sales` |  |
| taxes | `/dashboard/settings/taxes` |  |
| paymentModes | `/dashboard/settings/payment-modes` |  |
| paymentTerms | `/dashboard/settings/payment-terms` |  |
| expensePolicies | `/dashboard/settings/expense-policies` |  |
| index | `/settings` |  |
| account | `/settings/account` |  |
| appearance | `/settings/appearance` |  |
| display | `/settings/display` |  |
| notifications | `/settings/notifications` |  |
| billing | `/settings/billing` |  |
| integrations | `/settings/integrations` |  |
| webhooks | `/settings/webhooks` |  |
| apiKeys | `/settings/api-keys` |  |
| email | `/settings/email` |  |
| modules | `/settings/modules` |  |
| list | `/users` |  |
| list | `/apps` |  |
| list | `/chats` |  |
| index | `/help-center` |  |
| unauthorized | `/401` |  |
| forbidden | `/403` |  |
| notFound | `/404` |  |
| serverError | `/500` |  |
| maintenance | `/503` |  |
| casesDashboard | `/cases-dashboard` |  |
| caseDetails | `/case-details` |  |
| improvedCase | `/improved-case` |  |
| improvedCalendar | `/improved-calendar` |  |
| improvedTasks | `/improved-tasks` |  |
| tasks | `/tasks` |  |
| legalTasks | `/legal-tasks` |  |
| events | `/events` |  |
| reminders | `/reminders` |  |
| taskDetails | `/task-details` |  |
| timeEntries | `/time-entries` |  |
| expenses | `/expenses` |  |
| invoices | `/invoices` |  |
| accountActivity | `/account-activity` |  |
| accountStatements | `/account-statements` |  |
| statementsHistory | `/statements-history` |  |
| generateStatement | `/generate-statement` |  |
| gosiChat | `/gosi-chat` |  |
| Returns | `/dashboard/cases/case-123` |  |
| callback | `/auth/callback/${provider}` | ✓ |
| detail | `/dashboard/cases/${caseId}` | ✓ |
| notion | `/dashboard/cases/${caseId}/notion` | ✓ |
| notionPage | `/dashboard/cases/${caseId}/notion/${pageId}` | ✓ |
| casePipeline | `/dashboard/cases/${caseId}/pipeline` | ✓ |
| detail | `/dashboard/clients/${clientId}` | ✓ |
| detail | `/dashboard/contacts/${contactId}` | ✓ |
| detail | `/dashboard/organizations/${organizationId}` | ✓ |
| detail | `/dashboard/staff/${staffId}` | ✓ |
| edit | `/dashboard/staff/${staffId}/edit` | ✓ |
| detail | `/dashboard/tasks/${taskId}` | ✓ |
| detail | `/dashboard/tasks/events/${eventId}` | ✓ |
| detail | `/dashboard/tasks/reminders/${reminderId}` | ✓ |
| detail | `/dashboard/tasks/reports/${reportId}` | ✓ |
| detail | `/dashboard/finance/invoices/${invoiceId}` | ✓ |
| edit | `/dashboard/finance/invoices/${invoiceId}/edit` | ✓ |
| detail | `/dashboard/finance/recurring-invoices/${id}` | ✓ |
| edit | `/dashboard/finance/recurring-invoices/${id}/edit` | ✓ |
| detail | `/dashboard/finance/subscriptions/${subscriptionId}` | ✓ |
| edit | `/dashboard/finance/subscriptions/${subscriptionId}/edit` | ✓ |
| detail | `/dashboard/finance/subscription-plans/${planId}` | ✓ |
| edit | `/dashboard/finance/subscription-plans/${planId}/edit` | ✓ |
| detail | `/dashboard/finance/quotes/${quoteId}` | ✓ |
| detail | `/dashboard/finance/credit-notes/${creditNoteId}` | ✓ |
| edit | `/dashboard/finance/credit-notes/${creditNoteId}/edit` | ✓ |
| detail | `/dashboard/finance/debit-notes/${debitNoteId}` | ✓ |
| detail | `/dashboard/finance/bills/${billId}` | ✓ |
| edit | `/dashboard/finance/bills/${billId}/edit` | ✓ |
| detail | `/dashboard/finance/payments/${paymentId}` | ✓ |
| detail | `/dashboard/finance/expenses/${expenseId}` | ✓ |
| edit | `/dashboard/finance/expenses/${expenseId}/edit` | ✓ |
| detail | `/dashboard/finance/vendors/${vendorId}` | ✓ |
| edit | `/dashboard/finance/vendors/${vendorId}/edit` | ✓ |
| detail | `/dashboard/finance/retainers/${retainerId}` | ✓ |
| detail | `/dashboard/finance/statements/${statementId}` | ✓ |
| edit | `/dashboard/finance/statements/${statementId}/edit` | ✓ |
| detail | `/dashboard/finance/activity/${activityId}` | ✓ |
| edit | `/dashboard/finance/activity/${activityId}/edit` | ✓ |
| detail | `/dashboard/finance/time-tracking/${entryId}` | ✓ |
| edit | `/dashboard/finance/time-tracking/${entryId}/edit` | ✓ |
| detail | `/dashboard/finance/journal-entries/${id}` | ✓ |
| detail | `/dashboard/finance/reconciliation/${feedId}` | ✓ |
| detail | `/dashboard/finance/currency/${rateId}` | ✓ |
| detail | `/dashboard/finance/reports/${reportId}` | ✓ |
| detail | `/dashboard/finance/transactions/${transactionId}` | ✓ |
| detail | `/dashboard/finance/corporate-cards/${cardId}` | ✓ |
| reconcile | `/dashboard/finance/corporate-cards/${cardId}/reconcile` | ✓ |
| detail | `/dashboard/finance/saudi-banking/wps/${fileId}` | ✓ |
| detail | `/dashboard/finance/inter-company/${transactionId}` | ✓ |
| reconciliationDetail | `/dashboard/finance/inter-company/reconciliation/${reconciliationId}` | ✓ |
| detail | `/dashboard/finance/budgets/${budgetId}` | ✓ |
| edit | `/dashboard/finance/budgets/${budgetId}/edit` | ✓ |
| detail | `/dashboard/hr/employees/${employeeId}` | ✓ |
| detail | `/dashboard/hr/attendance/${recordId}` | ✓ |
| detail | `/dashboard/hr/leave/${requestId}` | ✓ |
| detail | `/dashboard/hr/leave/compensatory/${requestId}` | ✓ |
| edit | `/dashboard/hr/leave/compensatory/${requestId}/edit` | ✓ |
| detail | `/dashboard/hr/leave/encashments/${encashmentId}` | ✓ |
| edit | `/dashboard/hr/leave/encashments/${encashmentId}/edit` | ✓ |
| detail | `/dashboard/hr/payroll/${slipId}` | ✓ |
| detail | `/dashboard/hr/payroll-runs/${runId}` | ✓ |
| detail | `/dashboard/hr/compensation/${compensationId}` | ✓ |
| detail | `/dashboard/hr/benefits/${benefitId}` | ✓ |
| detail | `/dashboard/hr/loans/${loanId}` | ✓ |
| detail | `/dashboard/hr/advances/${advanceId}` | ✓ |
| detail | `/dashboard/hr/expense-claims/${claimId}` | ✓ |
| detail | `/dashboard/hr/asset-assignment/${assignmentId}` | ✓ |
| detail | `/dashboard/hr/recruitment/jobs/${jobId}` | ✓ |
| detail | `/dashboard/hr/recruitment/applicants/${applicantId}` | ✓ |
| detail | `/dashboard/hr/recruitment/staffing-plans/${planId}` | ✓ |
| detail | `/dashboard/hr/onboarding/${onboardingId}` | ✓ |
| detail | `/dashboard/hr/offboarding/${offboardingId}` | ✓ |
| detail | `/dashboard/hr/performance/${reviewId}` | ✓ |
| detail | `/dashboard/hr/training/${trainingId}` | ✓ |
| detail | `/dashboard/hr/job-positions/${positionId}` | ✓ |
| detail | `/dashboard/hr/organizational-structure/${unitId}` | ✓ |
| detail | `/dashboard/hr/employee-transfers/${transferId}` | ✓ |
| detail | `/dashboard/hr/promotions/${promotionId}` | ✓ |
| edit | `/dashboard/hr/promotions/${promotionId}/edit` | ✓ |
| detail | `/dashboard/hr/succession-planning/${planId}` | ✓ |
| detail | `/dashboard/hr/shift-assignments/${assignmentId}` | ✓ |
| detail | `/dashboard/hr/biometric/${deviceId}` | ✓ |
| detail | `/dashboard/hr/geofencing/${zoneId}` | ✓ |
| detail | `/dashboard/hr/vehicles/${vehicleId}` | ✓ |
| detail | `/dashboard/hr/grievances/${grievanceId}` | ✓ |
| detail | `/dashboard/hr/salaries/${salaryId}` | ✓ |
| detail | `/dashboard/hr/evaluations/${evaluationId}` | ✓ |
| detail | `/dashboard/hr/reports/${reportId}` | ✓ |
| detail | `/dashboard/crm/contacts/${contactId}` | ✓ |
| detail | `/dashboard/crm/campaigns/${campaignId}` | ✓ |
| detail | `/dashboard/crm/leads/${leadId}` | ✓ |
| detail | `/dashboard/crm/activities/${activityId}` | ✓ |
| detail | `/dashboard/crm/referrals/${referralId}` | ✓ |
| detail | `/dashboard/crm/email-marketing/${campaignId}` | ✓ |
| detail | `/dashboard/crm/whatsapp/${conversationId}` | ✓ |
| detail | `/dashboard/crm/reports/${reportId}` | ✓ |
| detail | `/dashboard/crm/products/${productId}` | ✓ |
| edit | `/dashboard/crm/products/${productId}/edit` | ✓ |
| detail | `/dashboard/crm/quotes/${quoteId}` | ✓ |
| detail | `/dashboard/inventory/${itemId}` | ✓ |
| detail | `/dashboard/inventory/warehouses/${warehouseId}` | ✓ |
| edit | `/dashboard/inventory/warehouses/${warehouseId}/edit` | ✓ |
| detail | `/dashboard/assets/${assetId}` | ✓ |
| edit | `/dashboard/assets/${assetId}/edit` | ✓ |
| detail | `/dashboard/assets/categories/${categoryId}` | ✓ |
| edit | `/dashboard/assets/categories/${categoryId}/edit` | ✓ |
| detail | `/dashboard/assets/maintenance/${scheduleId}` | ✓ |
| start | `/dashboard/assets/maintenance/${scheduleId}/start` | ✓ |
| edit | `/dashboard/assets/maintenance/${scheduleId}/edit` | ✓ |
| detail | `/dashboard/buying/${supplierId}` | ✓ |
| detail | `/dashboard/buying/suppliers/${supplierId}` | ✓ |
| edit | `/dashboard/buying/suppliers/${supplierId}/edit` | ✓ |
| detail | `/dashboard/buying/purchase-orders/${purchaseOrderId}` | ✓ |
| detail | `/dashboard/sales/leads/${leadId}` | ✓ |
| detail | `/dashboard/sales/reports/${reportId}` | ✓ |
| detail | `/dashboard/sales/quotes/${quoteId}` | ✓ |
| detail | `/dashboard/sales/orders/${orderId}` | ✓ |
| detail | `/dashboard/sales/customers/${customerId}` | ✓ |
| detail | `/dashboard/support/${ticketId}` | ✓ |
| detail | `/dashboard/knowledge/forms/${formId}` | ✓ |
| detail | `/dashboard/knowledge/judgments/${judgmentId}` | ✓ |
| detail | `/dashboard/knowledge/laws/${lawId}` | ✓ |
| detail | `/dashboard/jobs/${jobId}` | ✓ |
| detail | `/dashboard/documents/${documentId}` | ✓ |
| custom | `/errors/${error}` | ✓ |

---

## Query Keys

| Key | Definition |
|-----|------------|
| all | `() => ['tasks']` |
| lists | `() => [...QueryKeys.tasks.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.tasks.lists...` |
| details | `() => [...QueryKeys.tasks.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.tasks.details(), id]` |
| upcoming | `(days: number) => [...QueryKeys.tasks.all(), 'upcoming', day...` |
| overdue | `() => [...QueryKeys.tasks.all(), 'overdue']` |
| dueToday | `() => [...QueryKeys.tasks.all(), 'due-today']` |
| myTasks | `(filters?: Record<string, any>) => [...QueryKeys.tasks.all()...` |
| stats | `(filters?: Record<string, any>) => [...QueryKeys.tasks.all()...` |
| templates | `() => [...QueryKeys.tasks.all(), 'templates']` |
| timeTracking | `(taskId: string) => [...QueryKeys.tasks.all(), taskId, 'time...` |
| recurrenceHistory | `(taskId: string) => [...QueryKeys.tasks.all(), taskId, 'recu...` |
| attachmentVersions | `(taskId: string, attachmentId: string) => ['task-attachment-...` |
| all | `() => ['cases']` |
| lists | `() => [...QueryKeys.cases.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.cases.lists...` |
| details | `() => [...QueryKeys.cases.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.cases.details(), id]` |
| stats | `() => [...QueryKeys.cases.all(), 'stats']` |
| pipeline | `() => [...QueryKeys.cases.all(), 'pipeline']` |
| pipelineByStage | `(stageId?: string) => [...QueryKeys.cases.pipeline(), stageI...` |
| all | `() => ['clients']` |
| lists | `() => [...QueryKeys.clients.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.clients.lis...` |
| details | `() => [...QueryKeys.clients.all(), 'detail']` |
| detail | `(clientId: string) => [...QueryKeys.clients.details(), clien...` |
| search | `(query: string) => [...QueryKeys.clients.all(), 'search', qu...` |
| stats | `() => [...QueryKeys.clients.all(), 'stats']` |
| topRevenue | `(limit: number) => [...QueryKeys.clients.all(), 'top-revenue...` |
| cases | `(clientId: string, params?: Record<string, any>) => [...Quer...` |
| invoices | `(clientId: string, params?: Record<string, any>) => [...Quer...` |
| quotes | `(clientId: string, params?: Record<string, any>) => [...Quer...` |
| activities | `(clientId: string, params?: Record<string, any>) => [...Quer...` |
| payments | `(clientId: string, params?: Record<string, any>) => [...Quer...` |
| billingInfo | `(clientId: string) => [...QueryKeys.clients.all(), clientId,...` |
| wathq | `(clientId: string, dataType: string) => [...QueryKeys.client...` |
| all | `() => ['contacts']` |
| lists | `() => [...QueryKeys.contacts.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.contacts.li...` |
| details | `() => [...QueryKeys.contacts.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.contacts.details(), id]` |
| stats | `() => [...QueryKeys.contacts.all(), 'stats']` |
| search | `(query: string) => [...QueryKeys.contacts.all(), 'search', q...` |
| recent | `() => [...QueryKeys.contacts.all(), 'recent']` |
| favorites | `() => [...QueryKeys.contacts.all(), 'favorites']` |
| all | `() => ['invoices']` |
| lists | `() => [...QueryKeys.invoices.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.invoices.li...` |
| details | `() => [...QueryKeys.invoices.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.invoices.details(), id]` |
| stats | `() => [...QueryKeys.invoices.all(), 'stats']` |
| recurring | `() => [...QueryKeys.invoices.all(), 'recurring']` |
| overdue | `() => [...QueryKeys.invoices.all(), 'overdue']` |
| draft | `() => [...QueryKeys.invoices.all(), 'draft']` |
| all | `() => ['invoice-templates']` |
| lists | `() => [...QueryKeys.invoiceTemplates.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.invoiceTemp...` |
| details | `() => [...QueryKeys.invoiceTemplates.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.invoiceTemplates.details(), id...` |
| default | `() => [...QueryKeys.invoiceTemplates.all(), 'default']` |
| preview | `(id: string) => [...QueryKeys.invoiceTemplates.detail(id), '...` |
| all | `() => ['payments']` |
| lists | `() => [...QueryKeys.payments.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.payments.li...` |
| details | `() => [...QueryKeys.payments.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.payments.details(), id]` |
| stats | `() => [...QueryKeys.payments.all(), 'stats']` |
| methods | `() => ['payment-methods']` |
| modes | `() => ['payment-modes']` |
| terms | `() => ['payment-terms']` |
| term | `(id: string) => [...QueryKeys.payments.terms(), id]` |
| all | `() => ['expenses']` |
| lists | `() => [...QueryKeys.expenses.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.expenses.li...` |
| details | `() => [...QueryKeys.expenses.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.expenses.details(), id]` |
| stats | `() => [...QueryKeys.expenses.all(), 'stats']` |
| categories | `() => [...QueryKeys.expenses.all(), 'categories']` |
| all | `() => ['expense-claims']` |
| lists | `() => [...QueryKeys.expenseClaims.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.expenseClai...` |
| details | `() => [...QueryKeys.expenseClaims.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.expenseClaims.details(), id]` |
| stats | `() => [...QueryKeys.expenseClaims.all(), 'stats']` |
| pendingApprovals | `() => [...QueryKeys.expenseClaims.all(), 'pending-approvals'...` |
| pendingPayments | `() => [...QueryKeys.expenseClaims.all(), 'pending-payments']` |
| employeeClaims | `(employeeId: string) => [...QueryKeys.expenseClaims.all(), '...` |
| mileageRates | `() => [...QueryKeys.expenseClaims.all(), 'mileage-rates']` |
| corporateCard | `(employeeId: string) => [...QueryKeys.expenseClaims.all(), '...` |
| all | `() => ['expense-policies']` |
| lists | `() => [...QueryKeys.expensePolicies.all(), 'list']` |
| list | `() => [...QueryKeys.expensePolicies.lists()]` |
| details | `() => [...QueryKeys.expensePolicies.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.expensePolicies.details(), id]` |
| default | `() => [...QueryKeys.expensePolicies.all(), 'default']` |
| all | `() => ['quotes']` |
| lists | `() => [...QueryKeys.quotes.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.quotes.list...` |
| details | `() => [...QueryKeys.quotes.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.quotes.details(), id]` |
| history | `(id: string) => [...QueryKeys.quotes.detail(id), 'history']` |
| stats | `() => [...QueryKeys.quotes.all(), 'stats']` |
| summary | `(filters?: Record<string, any>) => [...QueryKeys.quotes.all(...` |
| all | `() => ['creditNotes']` |
| lists | `() => [...QueryKeys.creditNotes.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.creditNotes...` |
| details | `() => [...QueryKeys.creditNotes.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.creditNotes.details(), id]` |
| all | `() => ['accounting']` |
| accounts | `() => [...QueryKeys.accounting.all(), 'accounts']` |
| accountsList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| account | `(id: string) => [...QueryKeys.accounting.accounts(), id]` |
| accountTypes | `() => [...QueryKeys.accounting.accounts(), 'types']` |
| glEntries | `() => [...QueryKeys.accounting.all(), 'gl-entries']` |
| glEntriesList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| glEntry | `(id: string) => [...QueryKeys.accounting.glEntries(), id]` |
| journalEntries | `() => [...QueryKeys.accounting.all(), 'journal-entries']` |
| journalEntriesList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| journalEntry | `(id: string) => [...QueryKeys.accounting.journalEntries(), i...` |
| fiscalPeriods | `() => [...QueryKeys.accounting.all(), 'fiscal-periods']` |
| fiscalPeriodsList | `() => [...QueryKeys.accounting.fiscalPeriods(), 'list']` |
| fiscalPeriod | `(id: string) => [...QueryKeys.accounting.fiscalPeriods(), id...` |
| fiscalPeriodBalances | `(id: string) => [...QueryKeys.accounting.fiscalPeriods(), id...` |
| currentFiscalPeriod | `() => [...QueryKeys.accounting.fiscalPeriods(), 'current']` |
| fiscalYearsSummary | `() => [...QueryKeys.accounting.fiscalPeriods(), 'years-summa...` |
| canPost | `(date: string) => [...QueryKeys.accounting.fiscalPeriods(), ...` |
| recurring | `() => [...QueryKeys.accounting.all(), 'recurring']` |
| recurringList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| recurringItem | `(id: string) => [...QueryKeys.accounting.recurring(), id]` |
| recurringUpcoming | `() => [...QueryKeys.accounting.recurring(), 'upcoming']` |
| priceLevels | `() => [...QueryKeys.accounting.all(), 'price-levels']` |
| priceLevelsList | `() => [...QueryKeys.accounting.priceLevels(), 'list']` |
| priceLevel | `(id: string) => [...QueryKeys.accounting.priceLevels(), id]` |
| clientRate | `(clientId: string, baseRate: number, serviceType?: string) =...` |
| bills | `() => [...QueryKeys.accounting.all(), 'bills']` |
| billsList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| bill | `(id: string) => [...QueryKeys.accounting.bills(), id]` |
| debitNotes | `() => [...QueryKeys.accounting.all(), 'debit-notes']` |
| debitNotesList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| debitNote | `(id: string) => [...QueryKeys.accounting.debitNotes(), id]` |
| billDebitNotes | `(billId: string) => [...QueryKeys.accounting.bills(), billId...` |
| vendors | `() => [...QueryKeys.accounting.all(), 'vendors']` |
| vendorsList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| vendor | `(id: string) => [...QueryKeys.accounting.vendors(), id]` |
| retainers | `() => [...QueryKeys.accounting.all(), 'retainers']` |
| retainersList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| retainer | `(id: string) => [...QueryKeys.accounting.retainers(), id]` |
| retainerTransactions | `(id: string) => [...QueryKeys.accounting.retainers(), id, 't...` |
| leads | `() => [...QueryKeys.accounting.all(), 'leads']` |
| leadsList | `(filters?: Record<string, any>) => [...QueryKeys.accounting....` |
| lead | `(id: string) => [...QueryKeys.accounting.leads(), id]` |
| leadStats | `() => [...QueryKeys.accounting.leads(), 'stats']` |
| reports | `() => [...QueryKeys.accounting.all(), 'reports']` |
| profitLoss | `(startDate: string, endDate: string) => [...QueryKeys.accoun...` |
| balanceSheet | `(asOfDate?: string) => [...QueryKeys.accounting.reports(), '...` |
| trialBalance | `(asOfDate?: string) => [...QueryKeys.accounting.reports(), '...` |
| arAging | `() => [...QueryKeys.accounting.reports(), 'ar-aging']` |
| caseProfitability | `(startDate: string, endDate: string) => [...QueryKeys.accoun...` |
| all | `() => ['finance-advanced']` |
| bankFeeds | `() => ['bank-feeds']` |
| bankFeed | `(id: string) => ['bank-feed', id]` |
| bankFeedList | `(filters?: Record<string, any>) => ['bank-feeds', filters]` |
| bankTransactions | `() => ['bank-transactions']` |
| bankTransactionsList | `(id: string, filters?: Record<string, any>) => ['bank-transa...` |
| matchSuggestions | `(accountId: string) => ['match-suggestions', accountId]` |
| matchingRules | `() => ['matching-rules']` |
| reconciliationReport | `(accountId: string, params?: Record<string, any>) => ['recon...` |
| exchangeRates | `() => ['exchange-rates']` |
| exchangeRate | `(fromCurrency: string, toCurrency: string) => ['exchange-rat...` |
| rateHistory | `(fromCurrency: string, toCurrency: string, params?: Record<s...` |
| currencySettings | `() => ['currency-settings']` |
| all | `() => ['billing']` |
| rates | `() => [...QueryKeys.billing.all(), 'rates']` |
| ratesList | `(filters?: Record<string, any>) => [...QueryKeys.billing.rat...` |
| rateDetail | `(id: string) => [...QueryKeys.billing.rates(), 'detail', id]` |
| groups | `() => [...QueryKeys.billing.all(), 'groups']` |
| groupsList | `(filters?: Record<string, any>) => [...QueryKeys.billing.gro...` |
| groupDetail | `(id: string) => [...QueryKeys.billing.groups(), 'detail', id...` |
| rateCards | `() => [...QueryKeys.billing.all(), 'rate-cards']` |
| rateCardsList | `(filters?: Record<string, any>) => [...QueryKeys.billing.rat...` |
| rateCardForEntity | `(entityType: string, entityId: string) =>
      [...QueryKey...` |
| timeEntries | `() => [...QueryKeys.billing.all(), 'time-entries']` |
| timeEntriesList | `(filters?: Record<string, any>) => [...QueryKeys.billing.tim...` |
| pendingTimeEntries | `() => ['pendingTimeEntries']` |
| timer | `() => ['timer']` |
| statistics | `() => [...QueryKeys.billing.all(), 'statistics']` |
| settings | `() => ['company-settings']` |
| taxes | `() => ['taxes']` |
| financeSettings | `() => ['finance-settings']` |
| all | `() => ['trust-accounts']` |
| lists | `() => [...QueryKeys.trustAccounts.all(), 'list']` |
| list | `(filters?: Record<string, any>) => [...QueryKeys.trustAccoun...` |
| details | `() => [...QueryKeys.trustAccounts.all(), 'detail']` |
| detail | `(id: string) => [...QueryKeys.trustAccounts.details(), id]` |
| clientBalances | `(params?: Record<string, any>) => [...QueryKeys.trustAccount...` |
| clientLedger | `(accountId: string, clientId: string, params?: Record<string...` |
| reconciliation | `(id: string) => [...QueryKeys.trustAccounts.all(), id, 'reco...` |
| stats | `() => [...QueryKeys.trustAccounts.all(), 'stats']` |
| all | `() => ['inter-company']` |
