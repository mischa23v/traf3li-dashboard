# CRM & Client Management API Endpoints

## Clients API

### Base URL: `/api/clients`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/clients` | fullName, email, phone, alternatePhone, nationalId, companyName, crNumber, address, city, country, notes, preferredContactMethod, language, status, clientType, gender, nationality, legalRepresentative | Client object (201) | Yes |
| GET | `/clients` | Query: status, search, city, country, page, limit | Clients array + pagination | Yes |
| GET | `/clients/search` | Query: q (min 2 chars) | Matching clients (max 50) | Yes |
| GET | `/clients/stats` | None | Statistics object | Yes |
| GET | `/clients/top-revenue` | Query: limit (default 10) | Top clients by revenue | Yes |
| GET | `/clients/:id` | id | Client + cases, invoices, payments, summary | Yes |
| PUT | `/clients/:id` | Any client fields | Updated client | Yes |
| DELETE | `/clients/:id` | id | Success (only if no active cases/unpaid invoices) | Yes |
| DELETE | `/clients/bulk` | clientIds[] | Success + count | Yes |

### Client Types
- `individual`
- `company`

### Client Status
- `active`
- `inactive`
- `archived`

---

## Cases API (Deals/Opportunities)

### Base URL: `/api/cases`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/cases` | contractId, clientId, clientName, clientPhone, title, description, category, caseNumber, court, startDate, documents, laborCaseDetails | Case object (201) | Yes |
| GET | `/cases` | Query: status, outcome | Cases array | Yes |
| GET | `/cases/:_id` | _id | Case with details | Yes |
| PATCH | `/cases/:_id` | Any case fields | Updated case | Yes |
| POST | `/cases/:_id/note` | text | Case with new note | Yes |
| POST | `/cases/:_id/document` | name, url | Case with new document | Yes |
| POST | `/cases/:_id/hearing` | hearing details | Case with hearing | Yes |
| PATCH | `/cases/:_id/status` | status | Updated case | Yes |
| PATCH | `/cases/:_id/outcome` | outcome | Updated case | Yes |

### Case Categories
- `labor`
- `commercial`
- `civil`
- `criminal`
- `family`
- `administrative`
- `other`

### Case Status
- `active`
- `closed`
- `appeal`
- `settlement`
- `on-hold`
- `completed`
- `won`
- `lost`
- `settled`

### Case Outcome
- `won`
- `lost`
- `settled`
- `ongoing`

---

## Conversations API

### Base URL: `/api/conversations`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/conversations` | to, from | Conversation object (201) | Yes |
| GET | `/conversations` | None | All conversations for user | Yes |
| GET | `/conversations/single/:sellerID/:buyerID` | sellerID, buyerID | Specific conversation | Yes |
| PATCH | `/conversations/:conversationID` | conversationID | Updated conversation | Yes |

---

## Messages API

### Base URL: `/api/messages`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/messages` | conversationID, description, files (up to 5) | Message object (201) | Yes |
| GET | `/messages/:conversationID` | conversationID | Messages array | Yes |
| PATCH | `/messages/:conversationID/read` | conversationID | Success message | Yes |

### File Upload Config
- Max files: 5
- Max size: 10MB per file
- Allowed: jpeg, jpg, png, gif, pdf, doc, docx, txt, mp4, webm

---

## Dashboard API

### Base URL: `/api/dashboard`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/dashboard/hero-stats` | None | Top-level metrics (cases, tasks, invoices, orders) | Yes |
| GET | `/dashboard/stats` | None | Detailed statistics | Yes |
| GET | `/dashboard/financial-summary` | None | Financial data | Yes |
| GET | `/dashboard/today-events` | None | Today's events | Yes |
| GET | `/dashboard/recent-messages` | None | Recent messages | Yes |
| GET | `/dashboard/activity` | None | Activity overview | Yes |

---

## Activities API

### Base URL: `/api/activities`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/activities` | None | Activity overview | Yes |

---

## Firms API (NOT MOUNTED)

### Base URL: `/api/firms` (defined but not registered in server)

| Method | Endpoint | Parameters | Returns | Status |
|--------|----------|------------|---------|--------|
| POST | `/firms` | name, description, address, city, website, logo, practiceAreas, awards | Firm object | ⚠️ NOT MOUNTED |
| GET | `/firms` | None | All firms | ⚠️ NOT MOUNTED |
| GET | `/firms/:_id` | _id | Single firm | ⚠️ NOT MOUNTED |
| PATCH | `/firms/:_id` | Firm fields | Updated firm | ⚠️ NOT MOUNTED |
| POST | `/firms/lawyer/add` | firmId, lawyerId | Updated firm | ⚠️ NOT MOUNTED |
| POST | `/firms/lawyer/remove` | firmId, lawyerId | Updated firm | ⚠️ NOT MOUNTED |

---

## CRM Settings API (Frontend-Defined, Backend Status Unknown)

### Sales Teams
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/crm-settings/sales-teams` | Query: page, limit, search | Sales teams list |
| POST | `/crm-settings/sales-teams` | name, nameAr, description, descriptionAr, leaderId | Created team |
| PUT | `/crm-settings/sales-teams/:id` | id, update data | Updated team |
| DELETE | `/crm-settings/sales-teams/:id` | id | Success |
| POST | `/crm-settings/sales-teams/:id/members` | userId, role | Added member |
| DELETE | `/crm-settings/sales-teams/:id/members/:memberId` | id, memberId | Removed member |

### Territories
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/crm-settings/territories` | Query: page, limit, type | Territories list |
| POST | `/crm-settings/territories` | name, nameAr, type, description, parentId | Created territory |
| PUT | `/crm-settings/territories/:id` | id, update data | Updated territory |
| DELETE | `/crm-settings/territories/:id` | id | Success |
| PATCH | `/crm-settings/territories/reorder` | `[{ territoryId, order }]` | Reordered |
| POST | `/crm-settings/territories/:id/assign-user` | userId | Assigned user |
| POST | `/crm-settings/territories/:id/assign-team` | teamId | Assigned team |

### Lost Reasons
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/crm-settings/lost-reasons` | Query: page, limit | Lost reasons list |
| POST | `/crm-settings/lost-reasons` | reason, reasonAr, category | Created reason |
| PUT | `/crm-settings/lost-reasons/:id` | id, update data | Updated reason |
| DELETE | `/crm-settings/lost-reasons/:id` | id | Success |

### Tags/Labels
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/crm-settings/tags` | Query: page, limit, search | Tags list |
| POST | `/crm-settings/tags` | name, nameAr, color | Created tag |
| PUT | `/crm-settings/tags/:id` | id, update data | Updated tag |
| DELETE | `/crm-settings/tags/:id` | id | Success |

---

**Total CRM Endpoints: 77+**
