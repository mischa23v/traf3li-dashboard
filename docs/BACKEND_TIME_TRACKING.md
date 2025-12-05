# Backend Instructions: Time Tracking API

## Overview

The Time Tracking module allows attorneys and legal staff to record billable and non-billable time against clients and cases. The system supports multiple time entry methods (direct duration, start/end times, and live timer) and integrates with UTBMS activity codes for standardized legal billing.

**Key Features**:
- UTBMS Activity Code classification
- Multiple time entry methods
- Time type classification (billable, non-billable, pro bono, internal)
- Write-off and write-down functionality
- Integration with invoicing

---

## API Endpoints Required

### 1. POST `/api/time-tracking/entries`

Create a new time entry.

**Request Body:**

```typescript
interface CreateTimeEntryRequest {
  // Required fields
  clientId: string              // MongoDB ObjectId
  date: string                  // ISO date: "2025-01-15"
  description: string           // Min 10 characters
  duration: number              // In minutes
  hourlyRate: number            // In halalas (SAR * 100)

  // Optional - Related entities
  caseId?: string               // MongoDB ObjectId
  assigneeId?: string           // Attorney/User ID (defaults to current user)

  // Activity & Classification
  activityCode?: string         // UTBMS code e.g., 'L110', 'L210'
  timeType?: 'billable' | 'non_billable' | 'pro_bono' | 'internal'
  isBillable?: boolean          // Computed from timeType if not provided

  // Billing adjustments
  billStatus?: 'draft' | 'unbilled' | 'billed' | 'written_off'
  writeOff?: boolean
  writeOffReason?: string       // Required if writeOff is true
  writeDown?: boolean
  writeDownAmount?: number      // In halalas
  writeDownReason?: string      // Required if writeDown is true

  // Time tracking method data
  startTime?: string            // HH:mm format "09:30"
  endTime?: string              // HH:mm format "11:45"
  breakMinutes?: number         // Minutes to subtract

  // Organization
  departmentId?: string
  locationId?: string
  practiceArea?: string
  phase?: string
  taskId?: string

  // Notes
  notes?: string
}
```

**Expected Response:**

```typescript
{
  success: true,
  data: {
    timeEntry: TimeEntry
  }
}
```

### 2. GET `/api/time-tracking/entries`

Fetch time entries with filters.

**Query Parameters:**

```typescript
interface TimeEntryFilters {
  // Date filters
  startDate?: string            // ISO date
  endDate?: string              // ISO date

  // Filter by entities
  caseId?: string
  clientId?: string
  assigneeId?: string           // Filter by attorney

  // Status filters
  status?: string               // 'pending' | 'approved' | 'rejected'
  billStatus?: string           // 'draft' | 'unbilled' | 'billed' | 'written_off'
  isBillable?: boolean
  timeType?: string

  // Activity filter
  activityCode?: string

  // Pagination
  page?: number                 // Default: 1
  limit?: number                // Default: 25
}
```

**Expected Response:**

```typescript
{
  success: true,
  data: {
    entries: TimeEntry[],
    total: number,
    page: number,
    totalPages: number,
    summary: {
      totalDuration: number,    // Total minutes
      totalBillable: number,    // Total billable minutes
      totalAmount: number,      // Total amount in halalas
      byTimeType: {
        billable: number,
        non_billable: number,
        pro_bono: number,
        internal: number
      }
    }
  }
}
```

### 3. GET `/api/time-tracking/entries/:id`

Get a single time entry by ID.

### 4. PATCH `/api/time-tracking/entries/:id`

Update an existing time entry.

### 5. DELETE `/api/time-tracking/entries/:id`

Delete a time entry (soft delete recommended).

---

## TimeEntry Schema

```typescript
interface TimeEntry {
  _id: string
  entryId: string               // Format: "TE-YYYY-NNNN"
  firmId: string                // Required - tenant isolation

  // Description
  description: string

  // Assignment
  lawyerId: string              // Deprecated - use assigneeId
  assigneeId: string            // Attorney who performed the work
  userId: string                // User who created the entry

  // Related entities (populated)
  clientId: {
    _id: string
    firstName: string
    lastName: string
  }
  caseId?: {
    _id: string
    caseNumber: string
    title: string
  }

  // Time data
  date: string                  // ISO date
  startTime?: string            // HH:mm
  endTime?: string              // HH:mm
  breakMinutes?: number
  duration: number              // In minutes
  hours: number                 // Computed: duration / 60

  // Activity & Classification
  activityCode?: string         // UTBMS code
  timeType: 'billable' | 'non_billable' | 'pro_bono' | 'internal'

  // Billing
  hourlyRate: number            // In halalas
  totalAmount: number           // Computed: (duration / 60) * hourlyRate
  isBillable: boolean
  isBilled: boolean
  billStatus: 'draft' | 'unbilled' | 'billed' | 'written_off'
  invoiceId?: string            // Reference to invoice when billed

  // Write-off / Write-down
  writeOff: boolean
  writeOffReason?: string
  writeOffBy?: string           // User who approved write-off
  writeOffAt?: string
  writeDown: boolean
  writeDownAmount?: number      // In halalas
  writeDownReason?: string
  writeDownBy?: string
  writeDownAt?: string

  // Organization
  departmentId?: string
  locationId?: string
  practiceArea?: string
  phase?: string
  taskId?: string

  // Timer
  wasTimerBased: boolean
  timerStartedAt?: string

  // Status & Approval
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  // Notes
  notes?: string

  // Audit
  history: Array<{
    action: string
    performedBy: string
    timestamp: string
    details?: any
  }>
  createdAt: string
  updatedAt: string
}
```

---

## UTBMS Activity Codes

The system uses UTBMS (Uniform Task-Based Management System) codes for standardized legal billing:

### L100 - Case Assessment & Strategy
| Code | Description (EN) | Description (AR) |
|------|-----------------|------------------|
| L110 | Legal consultation | استشارة قانونية |
| L120 | Legal research | بحث قانوني |
| L130 | Drafting documents | صياغة مستندات |
| L140 | Document review | مراجعة مستندات |
| L150 | Case analysis | تحليل قضية |

### L200 - Court & Legal Proceedings
| Code | Description (EN) | Description (AR) |
|------|-----------------|------------------|
| L210 | Court attendance | حضور جلسة محكمة |
| L220 | Client meeting | اجتماع مع العميل |
| L230 | Phone call/conference | مكالمة هاتفية/مؤتمر |
| L240 | Correspondence | مراسلات |
| L250 | Negotiations | مفاوضات |
| L260 | Mediation | وساطة |
| L270 | Arbitration | تحكيم |

### L300 - Travel & Waiting
| Code | Description (EN) | Description (AR) |
|------|-----------------|------------------|
| L310 | Travel time | وقت السفر |
| L320 | Waiting time | وقت الانتظار |

### L400 - Administrative
| Code | Description (EN) | Description (AR) |
|------|-----------------|------------------|
| L410 | Administrative tasks | أعمال إدارية |
| L420 | File organization | تنظيم ملفات |

### L500 - Training & Development
| Code | Description (EN) | Description (AR) |
|------|-----------------|------------------|
| L510 | Training & development | تدريب وتطوير |
| L520 | Legal research (educational) | بحث قانوني (تعليمي) |

**Backend Implementation:**

```javascript
const UTBMS_CODES = {
  'L110': { category: 'case_assessment', description: 'Legal consultation', descriptionAr: 'استشارة قانونية' },
  'L120': { category: 'case_assessment', description: 'Legal research', descriptionAr: 'بحث قانوني' },
  // ... etc
};

// Validate activity code on create/update
if (data.activityCode && !UTBMS_CODES[data.activityCode]) {
  throw new Error('Invalid UTBMS activity code');
}
```

---

## Time Type Classification

| Type | Label (AR) | Description | Billing |
|------|-----------|-------------|---------|
| `billable` | قابل للفوترة | Client-chargeable work | Charged to client |
| `non_billable` | غير قابل للفوترة | Work not charged to client | Not invoiced |
| `pro_bono` | خدمات مجانية | Free legal services | Tracked but not charged |
| `internal` | داخلي | Firm administration | Internal tracking only |

**Backend Logic:**

```javascript
// Auto-set isBillable based on timeType
const isBillable = data.timeType === 'billable';

// Calculate total amount
const totalAmount = isBillable && !data.writeOff
  ? (data.duration / 60) * data.hourlyRate - (data.writeDownAmount || 0)
  : 0;
```

---

## Write-Off and Write-Down

### Write-Off (شطب الوقت)
- Completely removes time from billing
- Sets `isBillable = false` and `billStatus = 'written_off'`
- Requires `writeOffReason`
- Records `writeOffBy` and `writeOffAt`

### Write-Down (تخفيض المبلغ)
- Reduces the billable amount
- Keeps time billable but at reduced rate
- `finalAmount = totalAmount - writeDownAmount`
- Requires `writeDownReason`
- Records `writeDownBy` and `writeDownAt`

**Backend Implementation:**

```javascript
async createTimeEntry(data, userId) {
  let totalAmount = 0;
  let billStatus = data.billStatus || 'draft';

  if (data.timeType === 'billable') {
    const baseAmount = (data.duration / 60) * data.hourlyRate;

    if (data.writeOff) {
      totalAmount = 0;
      billStatus = 'written_off';
      data.writeOffBy = userId;
      data.writeOffAt = new Date();
    } else if (data.writeDown) {
      totalAmount = baseAmount - (data.writeDownAmount || 0);
      data.writeDownBy = userId;
      data.writeDownAt = new Date();
    } else {
      totalAmount = baseAmount;
    }
  }

  const entry = new TimeEntry({
    ...data,
    totalAmount,
    billStatus,
    isBillable: data.timeType === 'billable' && !data.writeOff,
    hours: data.duration / 60,
    createdBy: userId,
  });

  return entry.save();
}
```

---

## Timer Support

The frontend supports live timer functionality. When using timer:

1. **Start Timer**: Frontend records `timerStartedAt`
2. **Stop Timer**: Frontend calculates duration
3. **Submit**: Sends `wasTimerBased: true` and `timerStartedAt`

**Timer State Management:**

```javascript
// Optional: Server-side timer state (for persistence across sessions)
const TimerStateSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  firmId: { type: ObjectId, ref: 'Firm', required: true },
  clientId: { type: ObjectId, ref: 'Client' },
  caseId: { type: ObjectId, ref: 'Case' },
  description: String,
  activityCode: String,
  startedAt: { type: Date, required: true },
  pausedAt: Date,
  totalPausedDuration: { type: Number, default: 0 }, // in seconds
  isRunning: { type: Boolean, default: true },
});
```

---

## Approval Workflow (Optional)

For firms requiring time entry approval:

```javascript
// Status transitions
const ALLOWED_TRANSITIONS = {
  'pending': ['approved', 'rejected'],
  'approved': ['pending'], // Allow un-approve
  'rejected': ['pending'], // Allow resubmit
};

async approveTimeEntry(entryId, userId) {
  const entry = await TimeEntry.findById(entryId);

  if (entry.status !== 'pending') {
    throw new Error('Only pending entries can be approved');
  }

  entry.status = 'approved';
  entry.approvedBy = userId;
  entry.approvedAt = new Date();
  entry.billStatus = 'unbilled'; // Ready for invoicing

  return entry.save();
}
```

---

## Integration with Invoicing

When time entries are added to an invoice:

1. Set `isBilled = true`
2. Set `billStatus = 'billed'`
3. Set `invoiceId` reference
4. Record in history

```javascript
async billTimeEntries(entryIds, invoiceId, userId) {
  await TimeEntry.updateMany(
    { _id: { $in: entryIds } },
    {
      $set: {
        isBilled: true,
        billStatus: 'billed',
        invoiceId,
      },
      $push: {
        history: {
          action: 'billed',
          performedBy: userId,
          timestamp: new Date(),
          details: { invoiceId }
        }
      }
    }
  );
}
```

---

## MongoDB Schema

```javascript
const TimeEntrySchema = new mongoose.Schema({
  firmId: { type: ObjectId, ref: 'Firm', required: true, index: true },
  entryId: { type: String, required: true, unique: true },

  description: { type: String, required: true, minlength: 10 },

  // Assignment
  assigneeId: { type: ObjectId, ref: 'User', required: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true },

  // Related entities
  clientId: { type: ObjectId, ref: 'Client', required: true, index: true },
  caseId: { type: ObjectId, ref: 'Case', index: true },

  // Time data
  date: { type: Date, required: true, index: true },
  startTime: String,
  endTime: String,
  breakMinutes: { type: Number, default: 0 },
  duration: { type: Number, required: true }, // minutes
  hours: { type: Number }, // computed

  // Activity
  activityCode: { type: String, index: true },
  timeType: {
    type: String,
    enum: ['billable', 'non_billable', 'pro_bono', 'internal'],
    default: 'billable',
    index: true
  },

  // Billing
  hourlyRate: { type: Number, required: true }, // halalas
  totalAmount: { type: Number, default: 0 }, // halalas
  isBillable: { type: Boolean, default: true, index: true },
  isBilled: { type: Boolean, default: false, index: true },
  billStatus: {
    type: String,
    enum: ['draft', 'unbilled', 'billed', 'written_off'],
    default: 'draft',
    index: true
  },
  invoiceId: { type: ObjectId, ref: 'Invoice' },

  // Write-off / Write-down
  writeOff: { type: Boolean, default: false },
  writeOffReason: String,
  writeOffBy: { type: ObjectId, ref: 'User' },
  writeOffAt: Date,
  writeDown: { type: Boolean, default: false },
  writeDownAmount: Number,
  writeDownReason: String,
  writeDownBy: { type: ObjectId, ref: 'User' },
  writeDownAt: Date,

  // Organization
  departmentId: { type: ObjectId, ref: 'Department' },
  locationId: { type: ObjectId, ref: 'Location' },
  practiceArea: String,
  phase: String,
  taskId: { type: ObjectId, ref: 'Task' },

  // Timer
  wasTimerBased: { type: Boolean, default: false },
  timerStartedAt: Date,

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  approvedBy: { type: ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedBy: { type: ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectionReason: String,

  // Notes & History
  notes: String,
  history: [{
    action: String,
    performedBy: { type: ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
}, {
  timestamps: true
});

// Indexes
TimeEntrySchema.index({ firmId: 1, date: -1 });
TimeEntrySchema.index({ firmId: 1, assigneeId: 1, date: -1 });
TimeEntrySchema.index({ firmId: 1, clientId: 1, date: -1 });
TimeEntrySchema.index({ firmId: 1, caseId: 1, date: -1 });
TimeEntrySchema.index({ firmId: 1, billStatus: 1, isBillable: 1 });

// Pre-save hook
TimeEntrySchema.pre('save', function(next) {
  // Compute hours
  this.hours = this.duration / 60;

  // Generate entry ID if new
  if (this.isNew && !this.entryId) {
    // Generate in controller with proper sequence
  }

  next();
});
```

---

## Entry ID Generation

```javascript
async generateEntryId(firmId) {
  const year = new Date().getFullYear();
  const lastEntry = await TimeEntry.findOne({
    firmId,
    entryId: new RegExp(`^TE-${year}-`)
  }).sort({ entryId: -1 });

  let sequence = 1;
  if (lastEntry) {
    const lastNum = parseInt(lastEntry.entryId.split('-')[2]);
    sequence = lastNum + 1;
  }

  return `TE-${year}-${String(sequence).padStart(4, '0')}`;
}
```

---

## Permissions (RBAC)

| Role | Create | View Own | View All | Edit Own | Edit All | Delete | Approve | Write-Off |
|------|--------|----------|----------|----------|----------|--------|---------|-----------|
| Owner | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Partner | Yes | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Lawyer | Yes | Yes | No | Yes | No | No | No | No |
| Paralegal | Yes | Yes | No | Yes | No | No | No | No |
| Secretary | Yes | Yes | No | Yes | No | No | No | No |
| Accountant | No | No | Yes | No | No | No | No | Yes |

---

## Validation Rules

1. **Required Fields**: clientId, date, description (min 10 chars), duration, hourlyRate
2. **Duration**: Must be > 0 and <= 1440 (24 hours max)
3. **Date**: Cannot be in the future
4. **Activity Code**: Must be valid UTBMS code if provided
5. **Write-Off**: Requires writeOffReason
6. **Write-Down**: Requires writeDownAmount and writeDownReason
7. **Start/End Time**: If both provided, endTime must be after startTime

```javascript
const validateTimeEntry = (data) => {
  const errors = [];

  if (!data.clientId) errors.push('Client is required');
  if (!data.date) errors.push('Date is required');
  if (!data.description || data.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!data.duration || data.duration <= 0) errors.push('Duration must be positive');
  if (data.duration > 1440) errors.push('Duration cannot exceed 24 hours');

  if (new Date(data.date) > new Date()) {
    errors.push('Date cannot be in the future');
  }

  if (data.writeOff && !data.writeOffReason) {
    errors.push('Write-off reason is required');
  }

  if (data.writeDown && (!data.writeDownAmount || !data.writeDownReason)) {
    errors.push('Write-down amount and reason are required');
  }

  return errors;
};
```

---

## Testing Checklist

- [ ] Create time entry with all fields
- [ ] Create time entry with minimum required fields
- [ ] Validate UTBMS activity codes
- [ ] Test each time type (billable, non_billable, pro_bono, internal)
- [ ] Test write-off functionality
- [ ] Test write-down functionality
- [ ] Test start/end time calculation with break
- [ ] Filter by date range
- [ ] Filter by client
- [ ] Filter by case
- [ ] Filter by assignee
- [ ] Filter by time type
- [ ] Filter by bill status
- [ ] Pagination works correctly
- [ ] Update existing entry
- [ ] Approval workflow (if enabled)
- [ ] Integration with invoicing (bill entries)
- [ ] Permissions enforced correctly

---

## Currency Handling

**Important**: All amounts are stored in **halalas** (SAR * 100).

- `hourlyRate`: 50000 = SAR 500.00/hour
- `totalAmount`: 150050 = SAR 1,500.50
- `writeDownAmount`: 10000 = SAR 100.00

Frontend converts using:
```typescript
const halalasToSAR = (halalas: number) => halalas / 100;
const SARToHalalas = (sar: number) => Math.round(sar * 100);
```

---

## Questions?

Contact the frontend team if you need clarification on:
- Expected response formats
- Filter parameter handling
- Error response formats
- Real-time updates (WebSocket for timer sync)
