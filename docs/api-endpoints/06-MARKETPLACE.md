# Marketplace API Endpoints

## Gigs API (Service Offerings)

### Base URL: `/api/gigs`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/gigs` | title, description, category, price, cover, shortTitle, shortDesc, deliveryTime, revisionNumber, features[], consultationType, languages[], duration, isActive | Gig object (201) | Yes (Seller) |
| GET | `/gigs` | Query: category, search, min, max, userID, sort | Gigs array | No |
| GET | `/gigs/single/:_id` | _id | Gig with seller profile | No |
| DELETE | `/gigs/:_id` | _id | Success message | Yes (Owner) |

### Consultation Types
- `video`, `phone`, `in-person`, `document-review`, `email`

---

## Jobs API (Service Requests)

### Base URL: `/api/jobs`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/jobs` | title, description, category, budget.min, budget.max, deadline, location, requirements[], attachments[] | Job object (201) | Yes |
| GET | `/jobs` | Query: category, status, minBudget, maxBudget | Jobs array | No |
| GET | `/jobs/my-jobs` | None | User's posted jobs | Yes |
| GET | `/jobs/:_id` | _id | Single job (increments views) | No |
| PATCH | `/jobs/:_id` | Job fields | Updated job | Yes (Owner) |
| DELETE | `/jobs/:_id` | _id | Success (deletes proposals too) | Yes (Owner) |

### Job Categories
- `labor`, `commercial`, `personal-status`, `criminal`, `real-estate`, `traffic`, `administrative`, `other`

### Job Status
- `open`, `in-progress`, `completed`, `cancelled`

---

## Proposals API (Service Bids)

### Base URL: `/api/proposals`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/proposals` | jobId, coverLetter, proposedAmount, deliveryTime, attachments[] | Proposal (201) + notification | Yes |
| GET | `/proposals/job/:jobId` | jobId | Proposals for job (owner only) | Yes |
| GET | `/proposals/my-proposals` | None | User's submitted proposals | Yes |
| PATCH | `/proposals/accept/:_id` | _id | Accepted proposal (rejects others) | Yes (Job owner) |
| PATCH | `/proposals/reject/:_id` | _id | Rejected proposal + notification | Yes (Job owner) |
| PATCH | `/proposals/withdraw/:_id` | _id | Withdrawn proposal | Yes (Proposal owner) |

### Proposal Status
- `pending`, `accepted`, `rejected`, `withdrawn`

---

## Reviews API

### Base URL: `/api/reviews`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/reviews` | gigID, star (1-5), description | Review object (201) | Yes |
| GET | `/reviews/:gigID` | gigID | Reviews array (sorted newest first) | No |
| DELETE | `/reviews/:_id` | _id | Success message | Yes |

---

## Peer Reviews API (NOT MOUNTED)

### Base URL: `/api/peerReview` (defined but not registered)

| Method | Endpoint | Parameters | Returns | Status |
|--------|----------|------------|---------|--------|
| POST | `/peerReview` | toLawyer, competence, integrity, communication, ethics, comment | Peer review | ⚠️ NOT MOUNTED |
| GET | `/peerReview/:lawyerId` | lawyerId | Reviews + avgRating + totalReviews | ⚠️ NOT MOUNTED |
| PATCH | `/peerReview/verify/:_id` | _id | Verified review | ⚠️ NOT MOUNTED |

---

## Lawyer Score API (NOT MOUNTED)

### Base URL: `/api/score` (defined but not registered)

| Method | Endpoint | Parameters | Returns | Status |
|--------|----------|------------|---------|--------|
| GET | `/score/:lawyerId` | lawyerId | Complete score object | ⚠️ NOT MOUNTED |
| POST | `/score/recalculate/:lawyerId` | lawyerId | Recalculated score | ⚠️ NOT MOUNTED |
| GET | `/score/top/lawyers` | Query: limit | Top lawyers array | ⚠️ NOT MOUNTED |

### Score Components
- Client Rating: 25%
- Peer Rating: 20%
- Win Rate: 20%
- Experience: 15%
- Response Rate: 10%
- Engagement: 10%

### Badge Levels
- `none`, `bronze`, `silver`, `gold`, `platinum`

---

## Q&A API

### Questions (`/api/questions`)

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/questions` | title, description, category, tags[] | Question (201) | Yes |
| GET | `/questions` | Query: search, category, status | Questions array | No |
| GET | `/questions/:_id` | _id | Question with answers (increments views) | No |
| PATCH | `/questions/:_id` | Question fields | Updated question | Yes (Owner) |
| DELETE | `/questions/:_id` | _id | Success (deletes answers too) | Yes (Owner) |

### Question Categories
- `labor`, `commercial`, `family`, `criminal`, `real-estate`, `corporate`, `immigration`, `tax`, `intellectual-property`, `other`

### Question Status
- `open`, `answered`, `closed`

### Answers (`/api/answers`)

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/answers` | questionId, content | Answer (201) | Yes (Lawyer only) |
| GET | `/answers/:questionId` | questionId | Answers (sorted by verified, likes, newest) | No |
| PATCH | `/answers/:_id` | Answer fields | Updated answer | Yes (Owner) |
| DELETE | `/answers/:_id` | _id | Success | Yes (Owner) |
| POST | `/answers/like/:_id` | _id | Answer with incremented likes | Yes |
| PATCH | `/answers/verify/:_id` | _id | Verified answer | Yes (Admin) |

---

## Users/Lawyers API

### Base URL: `/api/users`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/users/lawyers` | Query: search, specialization, city, minRating, minPrice, maxPrice, page, limit | Lawyers + pagination | No |
| GET | `/users/:_id` | _id | User profile (no password) | No |
| GET | `/users/lawyer/:username` | username | Comprehensive profile with gigs, reviews, stats | No |
| PATCH | `/users/:_id` | User fields | Updated user | Yes (Own profile) |
| DELETE | `/users/:_id` | _id | Success | Yes (Own account) |

### Lawyer Profile Stats
- Total projects
- Active projects
- Average rating
- Total reviews
- Completion rate
- Response time
- Member duration

---

## Order Payments (Stripe)

### Base URL: `/api/orders`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/orders` | None | Completed orders for user | Yes |
| POST | `/orders/create-payment-intent/:_id` | _id (gigId) | `{ clientSecret }` (INR) | Yes |
| POST | `/orders/create-proposal-payment-intent/:_id` | _id (proposalId) | `{ clientSecret }` (SAR) | Yes |
| PATCH | `/orders` | payment_intent | Success + notification | Yes |

### Test Mode Endpoints (TEST_MODE=true)
| Method | Endpoint | Parameters | Returns |
|--------|----------|------------|---------|
| POST | `/orders/create-test-contract/:_id` | _id (gigId) | Test order |
| POST | `/orders/create-test-proposal-contract/:_id` | _id (proposalId) | Test order |

---

**Total Marketplace Endpoints: 31+**
