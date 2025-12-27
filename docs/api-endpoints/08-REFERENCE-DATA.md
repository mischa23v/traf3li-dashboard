# Reference Data API Endpoints

## Base URL: `/api/reference`

**Authentication: None required (all public)**

---

## Courts & Committees

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/reference/courts` | None | All Saudi courts |
| GET | `/reference/committees` | None | All Saudi committees |

### Court Types
- `general`, `criminal`, `commercial`, `labor`, `family`, `administrative`, `appeal`, `supreme`

### Committee Types
- `banking`, `securities`, `insurance`, `customs`, `tax`, `labor_primary`, `labor_supreme`, `real_estate`, `competition`

---

## Regions & Cities

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/reference/regions` | None | All Saudi regions with codes |
| GET | `/reference/regions-with-cities` | None | Regions with their cities |
| GET | `/reference/regions/:code/cities` | code | Cities for specific region |

### Region Codes
- `riyadh`, `makkah`, `madinah`, `qassim`, `eastern`, `asir`, `tabuk`, `hail`, `northern`, `jazan`, `najran`, `baha`, `jawf`

---

## Case Categories

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/reference/categories` | None | All case categories |
| GET | `/reference/categories/:code/sub-categories` | code | Sub-categories for category |
| GET | `/reference/categories-full` | None | All categories with sub-categories |

### Categories & Sub-Categories

**Labor (عمالية)**
- wages, termination, end_of_service, work_injury, vacation, contract_dispute

**Commercial (تجارية)**
- contracts, partnership, bankruptcy, cheques, promissory, agency, franchise, insurance

**Civil (مدنية)**
- property, rent, compensation, debt, inheritance

**Criminal (جنائية)**
- fraud, forgery, embezzlement, defamation, assault

**Family/Personal Status (أحوال شخصية)**
- divorce, khula, custody, alimony, visitation, marriage_contract, inheritance_division

**Administrative (إدارية)**
- government_decision, tender, employment, license

**Other (أخرى)**
- general

---

## Claims & Legal Scopes

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/reference/claim-types` | None | All claim types (13 types) |
| GET | `/reference/poa-scopes` | None | Power of Attorney scopes |
| GET | `/reference/party-types` | None | Party types |
| GET | `/reference/document-categories` | None | Document categories |

### Claim Types
- `wages`, `end_of_service`, `vacation`, `compensation`, `allowances`, `overtime`, `notice_period`, `housing`, `transport`, `medical`, `bonus`, `commission`, `other`

### POA Scopes
- `general`, `specific`, `litigation`

### Party Types
- `individual`, `company`, `government`

### Document Categories
- `contract`, `evidence`, `correspondence`, `court_document`, `poa`, `id_document`, `other`

---

## All Reference Data

| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| GET | `/reference/all` | None | All reference data in single request |

### Response Structure
```json
{
  "courts": [...],
  "committees": [...],
  "regions": [...],
  "categories": [...],
  "claimTypes": [...],
  "poaScopes": [...],
  "partyTypes": [...],
  "documentCategories": [...]
}
```

---

## Currency API

### Base URL: `/api/currency`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/currency/settings` | None | Currency settings | Yes |
| GET | `/currency/rates` | None | Exchange rates | Yes |
| POST | `/currency/convert` | amount, fromCurrency, toCurrency | Converted amount | Yes |
| POST | `/currency/rates` | Custom rate data | Saved rate | Yes |
| GET | `/currency/supported` | None | Supported currencies | Yes |
| POST | `/currency/update` | Rate update data | Updated confirmation | Yes |

### Default Currency
- SAR (Saudi Riyal)

---

## Health Check

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/health` | None | `{ status, timestamp, uptime }` | No |

---

**Total Reference Endpoints: 18**
