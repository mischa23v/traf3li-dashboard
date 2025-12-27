# HR & Employee Management API Endpoints

## Employees API

### Base URL: `/api/hr/employees`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/hr/employees` | personalInfo, employment, compensation, leave, gosi | Employee object | Yes |
| GET | `/hr/employees` | Query: search, status, department, employmentType, nationality, isSaudi, onProbation, sortBy, sortOrder, page, limit | Employees + pagination | Yes |
| GET | `/hr/employees/stats` | None | Employee statistics | Yes |
| GET | `/hr/options` | None | Departments, positions, locations | Yes |
| GET | `/hr/employees/:id` | id | Single employee | Yes |
| PUT | `/hr/employees/:id` | Any employee fields | Updated employee | Yes |
| DELETE | `/hr/employees/:id` | id | Success (204) | Yes |
| POST | `/hr/employees/bulk-delete` | ids[] | Success (204) | Yes |

### Employee Allowances
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/hr/employees/:id/allowances` | allowanceName, amount, taxable, includedInEOSB, includedInGOSI | Employee |
| DELETE | `/hr/employees/:id/allowances/:allowanceId` | id, allowanceId | Employee |

### Employee Documents
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/hr/employees/:id/documents` | id | Documents array |
| POST | `/hr/employees/:id/documents` | file (multipart), documentType, expiryDate | Document |
| DELETE | `/hr/employees/:id/documents/:documentId` | id, documentId | Success (204) |
| POST | `/hr/employees/:id/documents/:documentId/verify` | verifiedBy, verificationNotes | Document |

---

## Payroll API

### Base URL: `/api/payroll`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/payroll` | Query: employeeId, month, year, status, department, search, page, limit | Salary slips |
| GET | `/payroll/:id` | id | Single salary slip |
| POST | `/payroll` | CreateSalarySlipData | Salary slip |
| PUT | `/payroll/:id` | Partial data | Updated slip |
| DELETE | `/payroll/:id` | id | Success (204) |
| POST | `/payroll/:id/approve` | id | Approved slip |
| POST | `/payroll/:id/pay` | transactionReference | Paid slip |
| GET | `/payroll/stats` | Query: month, year | Statistics |
| POST | `/payroll/generate` | month, year, employeeIds[] | Generated slips |
| POST | `/payroll/approve` | ids[] | `{ approved: count }` |
| POST | `/payroll/pay` | ids[] | `{ paid: count }` |
| POST | `/payroll/wps/submit` | ids[] | WPS submission result |

### Payroll Runs
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/hr/payroll-runs/:id/employees/:empId/exclude` | id, empId, reason | PayrollRun |
| POST | `/hr/payroll-runs/:id/employees/:empId/include` | id, empId | PayrollRun |
| POST | `/hr/payroll-runs/:id/employees/:empId/recalculate` | id, empId | RecalculateResult |
| GET | `/hr/payroll-runs/:id/export` | format (csv/json/xlsx/pdf) | Binary file |

---

## Leave Management API

### Base URL: `/api/leave-periods`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/leave-periods` | Query: company, isActive, year, page, limit | Leave periods |
| GET | `/leave-periods/:id` | id | Single period |
| POST | `/leave-periods` | CreateLeavePeriodData | Leave period |
| PATCH | `/leave-periods/:id` | UpdateLeavePeriodData | Updated period |
| DELETE | `/leave-periods/:id` | id | Success (204) |
| GET | `/leave-periods/active` | None | Active period or null |
| POST | `/leave-periods/:id/allocate` | employeeIds[], leaveTypes[], overwriteExisting | Allocation result |
| GET | `/leave-periods/:id/statistics` | id | Period statistics |
| POST | `/leave-periods/:id/activate` | id | Activated period |
| POST | `/leave-periods/:id/deactivate` | id | Deactivated period |
| GET | `/leave-periods/year/:year` | year | Periods for year |
| GET | `/leave-periods/check-date` | Query: date | `{ inPeriod, period }` |
| GET | `/leave-periods/:id/allocation-summary` | id | Allocation summary |

---

## Attendance API

### Base URL: `/api/attendance`

### Core CRUD
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/attendance` | Query: employeeId, date, status, department, page, limit | Records |
| GET | `/attendance/:recordId` | recordId | Single record |
| POST | `/attendance` | Attendance data | Record |
| PUT | `/attendance/:recordId` | recordId, data | Updated record |
| DELETE | `/attendance/:recordId` | recordId | Success (204) |

### Check-in/Check-out
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/attendance/check-in` | location, biometric, notes | Record |
| POST | `/attendance/check-out` | notes | Record |

### Breaks
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/attendance/:recordId/breaks` | BreakRecord | Record |
| POST | `/attendance/:recordId/break/start` | Break data | Record |
| POST | `/attendance/:recordId/break/end` | recordId | Record |
| GET | `/attendance/:recordId/breaks` | recordId | Breaks array |

### Corrections & Approvals
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/attendance/:recordId/corrections` | Correction data | Record |
| PUT | `/attendance/:recordId/corrections/:correctionId` | Decision | Record |
| POST | `/attendance/:recordId/excuse-late` | reason | Record |
| POST | `/attendance/:recordId/approve-early-departure` | comments | Record |
| POST | `/attendance/:recordId/approve-timesheet` | comments | Record |
| POST | `/attendance/:recordId/reject-timesheet` | reason | Record |
| POST | `/attendance/:recordId/approve-overtime` | approvedHours, comments | Record |

### Violations
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/attendance/:recordId/violations` | Violation data | Record |
| PUT | `/attendance/:recordId/violations/:violationIndex/resolve` | Resolution | Record |
| POST | `/attendance/:recordId/violations/:violationIndex/appeal` | Appeal data | Record |
| GET | `/attendance/:recordId/violations` | recordId | Violations |
| POST | `/attendance/:recordId/violations/:violationId/confirm` | violationId | Record |
| POST | `/attendance/:recordId/violations/:violationId/dismiss` | reason | Record |

### Reports & Analytics
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/attendance/daily-summary` | Query: date, department, page, limit | Daily summary |
| GET | `/attendance/employee-summary/:employeeId` | startDate, endDate | Employee summary |
| GET | `/attendance/stats` | Query: startDate, endDate, department | Statistics |
| GET | `/attendance/today` | Query: department, page, limit | Today's records |
| GET | `/attendance/corrections/pending` | None | Pending corrections |
| GET | `/attendance/violations` | None | All violations |
| GET | `/attendance/report/monthly` | Query: month, year, department | Monthly report |
| GET | `/attendance/stats/department` | Query: month, year | Department stats |
| GET | `/attendance/status/:employeeId` | employeeId | Current status |
| GET | `/attendance/summary/:employeeId` | Query: month, year | Employee summary |
| GET | `/attendance/employee/:employeeId/date/:date` | employeeId, date | Specific record |
| GET | `/attendance/compliance-report` | Query: startDate, endDate, department | Compliance report |

### Bulk Operations
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/attendance/mark-absences` | date, departmentId | Marked records |
| POST | `/attendance/import` | records[] | Import result |
| POST | `/attendance/bulk` | records[] | Created records |
| POST | `/attendance/lock-for-payroll` | recordIds[], payrollRunId | Locked records |

---

## Offboarding API

### Base URL: `/api/hr/offboarding`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/hr/offboarding` | Query: status, exitType, department, exitDateFrom, exitDateTo, search, page, limit | Offboarding records |
| GET | `/hr/offboarding/:offboardingId` | offboardingId | Single record |
| POST | `/hr/offboarding` | CreateOffboardingData | Record |
| PATCH | `/hr/offboarding/:offboardingId` | UpdateOffboardingData | Updated record |
| DELETE | `/hr/offboarding/:offboardingId` | offboardingId | Success (204) |
| GET | `/hr/offboarding/stats` | None | Statistics |
| PATCH | `/hr/offboarding/:offboardingId/status` | status | Updated record |
| POST | `/hr/offboarding/:offboardingId/exit-interview` | ExitInterview data | Record |
| POST | `/hr/offboarding/:offboardingId/clearance/items` | ClearanceItem | Record |
| PATCH | `/hr/offboarding/:offboardingId/clearance/items/:itemId` | Item updates | Record |
| POST | `/hr/offboarding/:offboardingId/clearance/:section/complete` | section (it/finance/hr/department/manager) | Record |
| POST | `/hr/offboarding/:offboardingId/calculate-settlement` | offboardingId | Record |
| POST | `/hr/offboarding/:offboardingId/approve-settlement` | offboardingId | Record |
| POST | `/hr/offboarding/:offboardingId/process-payment` | paymentMethod, paymentReference, bankDetails | Record |
| POST | `/hr/offboarding/:offboardingId/issue-experience-certificate` | offboardingId | Record |
| POST | `/hr/offboarding/:offboardingId/complete` | offboardingId | Record |
| POST | `/hr/offboarding/bulk-delete` | ids[] | `{ deleted: count }` |
| GET | `/hr/offboarding/by-employee/:employeeId` | employeeId | Record or null |
| GET | `/hr/offboarding/pending-clearances` | None | Pending clearances |
| GET | `/hr/offboarding/pending-settlements` | None | Pending settlements |
| PATCH | `/hr/offboarding/:offboardingId/rehire-eligibility` | eligibilityCategory, eligibilityReason, conditions, notes | Record |

---

## Recruitment API

### Base URL: `/api/hr/recruitment`

### Job Postings
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/hr/recruitment/jobs` | Query: search, status, department, location, urgency, page, limit | Job postings |
| GET | `/hr/recruitment/jobs/:jobId` | jobId | Single posting |
| POST | `/hr/recruitment/jobs` | Job posting data | Posting |
| PATCH | `/hr/recruitment/jobs/:jobId` | Partial data | Updated posting |
| DELETE | `/hr/recruitment/jobs/:jobId` | jobId | Success (204) |
| POST | `/hr/recruitment/jobs/:jobId/publish` | jobId | Published posting |
| POST | `/hr/recruitment/jobs/:jobId/close` | reason | Closed posting |
| POST | `/hr/recruitment/jobs/:jobId/hold` | reason | On-hold posting |
| POST | `/hr/recruitment/jobs/:jobId/duplicate` | jobId | Duplicated posting |
| GET | `/hr/recruitment/jobs/:jobId/pipeline` | jobId | Job with applicants |
| GET | `/hr/recruitment/jobs/nearing-deadline` | None | Jobs array |

### Applicants (50+ endpoints - see full HR doc)
- CRUD operations
- Status/stage management
- Screening & assessments
- Interviews
- Background checks
- Offer management
- Hiring & references
- Communications & notes
- Bulk operations

---

## Time Tracking API

### Base URL: `/api/time-tracking`

### Pending Approval
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/time-tracking/entries/pending-approval` | Query: employeeId, projectId, status, startDate, endDate, isBillable, search, page, limit | Entries + summary |
| POST | `/time-tracking/entries/:id/submit` | id | Entry |
| POST | `/time-tracking/entries/bulk-submit` | ids[] | BulkSubmitResult |
| POST | `/time-tracking/entries/:id/request-changes` | reason | Entry |
| POST | `/time-tracking/entries/bulk-reject` | ids[], reason | BulkRejectResult |
| POST | `/time-tracking/entries/:id/approve` | id | Entry |
| POST | `/time-tracking/entries/bulk-approve` | ids[] | `{ success, approved }` |

---

## HR Settings API

### Base URL: `/api/settings/hr`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/settings/hr` | None | All HR settings |
| PATCH | `/settings/hr` | UpdateHRSettingsData | Updated settings |
| PATCH | `/settings/hr/employee` | Employee settings | Updated settings |
| PATCH | `/settings/hr/leave` | Leave settings | Updated settings |
| PATCH | `/settings/hr/attendance` | Attendance settings | Updated settings |
| PATCH | `/settings/hr/payroll` | Payroll settings | Updated settings |
| PATCH | `/settings/hr/expense` | Expense settings | Updated settings |

---

## HR Analytics API

### Base URL: `/api/v1/hr-analytics`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/v1/hr-analytics/dashboard` | None | Dashboard data |
| GET | `/v1/hr-analytics/turnover` | Query: startDate, endDate, department | Turnover data |
| GET | `/v1/hr-analytics/compensation` | Query: department, grade | Compensation data |
| GET | `/v1/hr-analytics/training` | Query: department, year | Training data |
| GET | `/v1/hr-analytics/saudization` | None | Saudization metrics |
| GET | `/v1/hr-analytics/attrition-risk` | None | Attrition predictions |
| GET | `/v1/hr-analytics/workforce-forecast` | Query: months | Workforce forecast |
| GET | `/v1/hr-analytics/high-potential` | None | High-potential employees |
| GET | `/v1/hr-analytics/flight-risk` | None | Flight risk analysis |
| GET | `/v1/hr-analytics/absence-prediction` | None | Absence predictions |
| GET | `/v1/hr-analytics/engagement-prediction` | None | Engagement predictions |

---

## Employee Benefits API

### Base URL: `/api/benefits`

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/benefits` | Benefit data | Benefit |
| GET | `/benefits` | Query: page, limit | Benefits array |
| GET | `/benefits/stats` | None | Statistics |
| GET | `/benefits/by-type` | None | Grouped by type |
| GET | `/benefits/export` | None | Export data |
| GET | `/benefits/employee/:employeeId` | employeeId | Employee benefits |
| POST | `/benefits/bulk-delete` | ids[] | Success |
| GET | `/benefits/:id` | id | Single benefit |
| PUT | `/benefits/:id` | Benefit data | Updated benefit |
| PATCH | `/benefits/:id` | Partial data | Updated benefit |
| DELETE | `/benefits/:id` | id | Success |
| POST | `/benefits/:id/activate` | id | Activated benefit |
| POST | `/benefits/:id/suspend` | id | Suspended benefit |
| POST | `/benefits/:id/terminate` | id | Terminated benefit |
| POST | `/benefits/:id/dependents` | Dependent data | Updated benefit |
| DELETE | `/benefits/:id/dependents/:memberId` | id, memberId | Updated benefit |
| POST | `/benefits/:id/beneficiaries` | Beneficiary data | Updated benefit |
| PATCH | `/benefits/:id/beneficiaries/:beneficiaryId` | Beneficiary data | Updated benefit |
| DELETE | `/benefits/:id/beneficiaries/:beneficiaryId` | id, beneficiaryId | Updated benefit |
| POST | `/benefits/:id/documents` | Document data | Updated benefit |

---

**Total HR Endpoints: 200+**
