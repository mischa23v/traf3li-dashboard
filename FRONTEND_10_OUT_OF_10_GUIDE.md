# TRAF3LI Frontend Integration Guide - 10/10 Features

## Overview

This guide provides comprehensive frontend component specifications and API documentation for all new features implemented to achieve 10/10 scores across all modules.

---

## Table of Contents

1. [HR Module (9.5 → 10/10)](#1-hr-module-95--1010)
2. [Finance Module (9.0 → 10/10)](#2-finance-module-90--1010)
3. [CRM Module (8.5 → 10/10)](#3-crm-module-85--1010)
4. [Tasks Module (9.5 → 10/10)](#4-tasks-module-95--1010)
5. [Document Analysis](#5-document-analysis-general-1010)
6. [NPM Packages](#6-npm-packages-to-install-frontend)
7. [TypeScript Interfaces](#7-typescript-interfaces-complete)

---

## 1. HR MODULE (9.5 → 10/10)

### A. Biometric Attendance Dashboard

**Route:** `/hr/biometric`

```typescript
// Components needed:
interface BiometricDashboard {
  DeviceManagement: {
    DeviceList: Component;      // Table with device status indicators
    DeviceForm: Component;      // Add/edit device modal
    DeviceSync: Component;      // Sync status and controls
    DeviceHealth: Component;    // Real-time heartbeat indicators
  };
  EmployeeEnrollment: {
    EnrollmentWizard: Component;  // Step-by-step enrollment
    FingerprintCapture: Component; // Fingerprint scanner UI
    FacialCapture: Component;      // Camera capture for facial
    CardAssignment: Component;     // RFID card assignment
    EnrollmentStatus: Component;   // Progress tracking
  };
  AttendanceLogs: {
    LogsTable: Component;        // Paginated verification logs
    LiveFeed: Component;         // Real-time verification feed
    ExportLogs: Component;       // CSV/Excel export
  };
}

// API Hooks:
const useDevices = () => useSWR('/api/biometric/devices');
const useEnrollments = () => useSWR('/api/biometric/enrollments');
const useLogs = (filters) => useSWR(`/api/biometric/logs?${qs.stringify(filters)}`);
const useVerify = () => useMutation('/api/biometric/verify');
```

### B. Geo-Fencing Manager

**Route:** `/hr/geofencing`

```typescript
interface GeofencingComponents {
  ZoneMap: Component;           // Interactive map with zones
  ZoneEditor: Component;        // Draw/edit circle or polygon zones
  ZoneList: Component;          // List of all geofence zones
  EmployeeLocation: Component;  // Real-time employee locations
  ViolationAlerts: Component;   // Alerts for boundary violations
}

// API Endpoints:
POST /api/biometric/geofences          // Create zone
GET /api/biometric/geofences           // List zones
PUT /api/biometric/geofences/:id       // Update zone
DELETE /api/biometric/geofences/:id    // Delete zone
POST /api/biometric/geofences/check    // Check if location is in zone
```

**Map Integration (Leaflet/Google Maps):**

```tsx
import { MapContainer, TileLayer, Circle, Polygon } from 'react-leaflet';

function GeofenceMap({ zones }) {
  return (
    <MapContainer center={[24.7136, 46.6753]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {zones.map(zone => (
        zone.type === 'circle'
          ? <Circle center={zone.center} radius={zone.radius} />
          : <Polygon positions={zone.coordinates} />
      ))}
    </MapContainer>
  );
}
```

### C. HR Analytics Dashboard

**Route:** `/hr/analytics`

```typescript
interface HRAnalyticsComponents {
  // Dashboard Widgets
  WorkforceOverview: Component;      // Employee count, turnover rate
  HeadcountTrend: Component;         // Line chart over time
  DepartmentBreakdown: Component;    // Pie chart by department
  TenureDistribution: Component;     // Bar chart

  // Specific Analytics
  AttendanceAnalytics: Component;    // Attendance patterns, late trends
  LeaveAnalytics: Component;         // Leave balance, patterns
  PayrollAnalytics: Component;       // Salary distribution, costs
  PerformanceAnalytics: Component;   // Performance scores, reviews
  RecruitmentAnalytics: Component;   // Pipeline metrics, time-to-hire
  TrainingAnalytics: Component;      // Completion rates, effectiveness
  DiversityAnalytics: Component;     // Gender, age distribution
  CompensationAnalytics: Component;  // Salary bands, benefits
  AttritionAnalytics: Component;     // Turnover analysis
}

// API Endpoints:
GET /api/hr-analytics/workforce-overview
GET /api/hr-analytics/headcount-trends?startDate=&endDate=&groupBy=month
GET /api/hr-analytics/department-breakdown
GET /api/hr-analytics/tenure-distribution
GET /api/hr-analytics/attendance
GET /api/hr-analytics/leave
GET /api/hr-analytics/payroll
GET /api/hr-analytics/performance
GET /api/hr-analytics/recruitment
GET /api/hr-analytics/training
GET /api/hr-analytics/diversity
GET /api/hr-analytics/compensation
GET /api/hr-analytics/attrition
GET /api/hr-analytics/executive-summary
POST /api/hr-analytics/snapshot  // Save snapshot
```

### D. AI Predictions Panel

**Route:** `/hr/predictions`

```typescript
interface AIPredictionsComponents {
  AttritionRiskTable: Component;     // Employees sorted by risk score
  AttritionRiskDetail: Component;    // Individual risk breakdown
  WorkforceForecast: Component;      // Projected headcount
  TurnoverForecast: Component;       // Predicted turnover
  HiringNeedsForecast: Component;    // Future hiring requirements
  PromotionReadiness: Component;     // Employees ready for promotion
}

// API Endpoints:
GET /api/hr-analytics/predictions/attrition-risk
GET /api/hr-analytics/predictions/attrition-risk/:employeeId
GET /api/hr-analytics/predictions/workforce-forecast?months=12
GET /api/hr-analytics/predictions/promotion-readiness?threshold=75

// Response structure for attrition risk:
{
  "success": true,
  "data": {
    "highRisk": [...],      // Risk > 70%
    "mediumRisk": [...],    // Risk 40-70%
    "lowRisk": [...]        // Risk < 40%
  },
  "summary": {
    "totalAtRisk": 15,
    "averageRisk": 45.2,
    "costAtRisk": 250000
  }
}
```

---

## 2. FINANCE MODULE (9.0 → 10/10)

### A. Bank Reconciliation Center

**Route:** `/finance/reconciliation`

```typescript
interface BankReconciliationComponents {
  // Bank Feed Management
  BankFeedList: Component;           // Connected bank accounts
  ConnectBank: Component;            // Add Plaid/manual connection
  ImportTransactions: Component;     // CSV/OFX upload

  // Transaction Matching
  UnmatchedTransactions: Component;  // Pending matches
  MatchingRules: Component;          // Auto-match rules editor
  ManualMatch: Component;            // Match transactions manually
  MatchSuggestions: Component;       // AI suggestions

  // Reports
  ReconciliationReport: Component;   // Balance comparison
  VarianceAnalysis: Component;       // Discrepancies
}

// API Endpoints:
POST /api/bank-reconciliations/feeds                    // Create bank feed
GET /api/bank-reconciliations/feeds                     // List feeds
POST /api/bank-reconciliations/feeds/:id/import         // Import transactions
POST /api/bank-reconciliations/feeds/:id/import/csv     // CSV import
POST /api/bank-reconciliations/feeds/:id/import/ofx     // OFX import
POST /api/bank-reconciliations/feeds/:id/fetch          // Fetch from Plaid
GET /api/bank-reconciliations/feeds/:id/transactions    // Get transactions
POST /api/bank-reconciliations/match                    // Create match
POST /api/bank-reconciliations/auto-match               // Auto-match all
DELETE /api/bank-reconciliations/matches/:id            // Unmatch
POST /api/bank-reconciliations/rules                    // Create rule
GET /api/bank-reconciliations/rules                     // List rules
GET /api/bank-reconciliations/report                    // Get report
```

**CSV Import Component:**

```tsx
function CSVImport({ bankFeedId }) {
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState({
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    referenceColumn: 'Reference'
  });

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMapping', JSON.stringify(mapping));
    formData.append('dateFormat', 'MM/DD/YYYY');

    await api.post(`/api/bank-reconciliations/feeds/${bankFeedId}/import/csv`, formData);
  };

  return (
    <div>
      <FileUpload accept=".csv" onChange={setFile} />
      <ColumnMapper columns={csvColumns} mapping={mapping} onChange={setMapping} />
      <Button onClick={handleUpload}>Import Transactions</Button>
    </div>
  );
}
```

### B. Multi-Currency Manager

**Route:** `/finance/currency`

```typescript
interface MultiCurrencyComponents {
  ExchangeRates: Component;          // Current rates table
  RateHistory: Component;            // Historical rates chart
  CurrencyConverter: Component;      // Quick conversion tool
  BaseCurrencySettings: Component;   // Set firm base currency
  AutoUpdateSettings: Component;     // Rate update frequency
}

// API Endpoints:
GET /api/currency/rates                           // Get all rates
GET /api/currency/rates/:from/:to                 // Get specific rate
GET /api/currency/rates/:from/:to/history         // Rate history
POST /api/currency/convert                        // Convert amount
POST /api/currency/rates/refresh                  // Update rates from API
PUT /api/currency/settings                        // Update settings

// Conversion request:
POST /api/currency/convert
{
  "amount": 1000,
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "date": "2024-01-15"  // Optional, for historical rate
}
```

---

## 3. CRM MODULE (8.5 → 10/10)

### A. Email Marketing Center

**Route:** `/crm/email-marketing`

```typescript
interface EmailMarketingComponents {
  // Campaigns
  CampaignList: Component;           // All campaigns with status
  CampaignBuilder: Component;        // Visual campaign editor
  CampaignAnalytics: Component;      // Open rates, clicks, etc.

  // Templates
  TemplateList: Component;           // Email templates
  TemplateEditor: Component;         // Drag-drop email builder
  TemplatePreview: Component;        // Desktop/mobile preview

  // Subscribers
  SubscriberList: Component;         // Contacts list
  SubscriberImport: Component;       // CSV import
  SubscriberSegments: Component;     // Audience segments

  // Drip Campaigns
  DripFlowBuilder: Component;        // Visual flow editor
  DripStepConfig: Component;         // Configure each step

  // A/B Testing
  ABTestSetup: Component;            // Configure A/B test
  ABTestResults: Component;          // Winner analysis
}

// API Endpoints:
// Templates
POST /api/email-marketing/templates
GET /api/email-marketing/templates
GET /api/email-marketing/templates/:id
PUT /api/email-marketing/templates/:id
DELETE /api/email-marketing/templates/:id
POST /api/email-marketing/templates/:id/preview

// Campaigns
POST /api/email-marketing/campaigns
GET /api/email-marketing/campaigns
GET /api/email-marketing/campaigns/:id
PUT /api/email-marketing/campaigns/:id
DELETE /api/email-marketing/campaigns/:id
POST /api/email-marketing/campaigns/:id/send
POST /api/email-marketing/campaigns/:id/schedule
POST /api/email-marketing/campaigns/:id/pause
POST /api/email-marketing/campaigns/:id/resume
GET /api/email-marketing/campaigns/:id/analytics

// Drip Campaigns
POST /api/email-marketing/drip-campaigns
GET /api/email-marketing/drip-campaigns/:id
POST /api/email-marketing/drip-campaigns/:id/activate
POST /api/email-marketing/drip-campaigns/:id/enroll

// A/B Testing
POST /api/email-marketing/campaigns/:id/ab-test
GET /api/email-marketing/campaigns/:id/ab-test/results
POST /api/email-marketing/campaigns/:id/ab-test/pick-winner

// Subscribers
POST /api/email-marketing/subscribers
GET /api/email-marketing/subscribers
POST /api/email-marketing/subscribers/import
POST /api/email-marketing/subscribers/:id/unsubscribe

// Segments
POST /api/email-marketing/segments
GET /api/email-marketing/segments
GET /api/email-marketing/segments/:id/preview
```

**Visual Flow Builder Component:**

```tsx
import ReactFlow, { Controls, Background } from 'reactflow';

function DripFlowBuilder({ steps, onUpdate }) {
  const nodes = steps.map((step, i) => ({
    id: step._id,
    type: step.type, // 'email', 'wait', 'condition'
    position: { x: 100, y: i * 150 },
    data: step
  }));

  const edges = steps.slice(1).map((step, i) => ({
    id: `e${i}`,
    source: steps[i]._id,
    target: step._id
  }));

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Controls />
      <Background />
    </ReactFlow>
  );
}
```

### B. AI Lead Scoring Dashboard

**Route:** `/crm/lead-scoring`

```typescript
interface LeadScoringComponents {
  // Dashboard
  ScoreOverview: Component;          // Score distribution chart
  TopLeads: Component;               // Highest scoring leads
  RecentScoreChanges: Component;     // Score movement alerts

  // Lead Details
  LeadScoreCard: Component;          // Individual lead score
  ScoreBreakdown: Component;         // Score by dimension
  ScoreHistory: Component;           // Score trend chart

  // Configuration
  ScoringRulesConfig: Component;     // Weight configuration
  ScoreThresholds: Component;        // A/B/C/D/F thresholds
  DecaySettings: Component;          // Score decay rules

  // Automation
  AutoScoringSettings: Component;    // Enable/disable auto-scoring
  ScoringTriggers: Component;        // Event triggers
}

// API Endpoints:
GET /api/lead-scoring/scores                      // All lead scores
GET /api/lead-scoring/scores/:leadId              // Single lead score
POST /api/lead-scoring/calculate/:leadId          // Calculate score
POST /api/lead-scoring/calculate-all              // Batch calculate
GET /api/lead-scoring/leaderboard                 // Top leads
GET /api/lead-scoring/distribution                // Score distribution
POST /api/lead-scoring/track-behavior             // Track lead behavior
POST /api/lead-scoring/apply-decay                // Apply time decay
GET /api/lead-scoring/config                      // Get config
PUT /api/lead-scoring/config                      // Update config

// Score response structure:
{
  "success": true,
  "data": {
    "leadId": "...",
    "totalScore": 75,
    "grade": "B",
    "dimensions": {
      "demographic": { "score": 20, "maxScore": 25, "factors": [...] },
      "bant": { "score": 18, "maxScore": 25, "factors": [...] },
      "behavioral": { "score": 22, "maxScore": 25, "factors": [...] },
      "engagement": { "score": 15, "maxScore": 25, "factors": [...] }
    },
    "trend": "increasing",
    "lastActivity": "2024-01-15T10:30:00Z"
  }
}
```

### C. WhatsApp Integration

**Route:** `/crm/whatsapp`

```typescript
interface WhatsAppComponents {
  // Conversations
  ConversationList: Component;       // All conversations
  ChatWindow: Component;             // Individual chat UI
  QuickReplies: Component;           // Template quick replies

  // Templates
  TemplateList: Component;           // Approved templates
  TemplateSubmit: Component;         // Submit for approval

  // Broadcasts
  BroadcastComposer: Component;      // Send to multiple contacts
  BroadcastHistory: Component;       // Past broadcasts

  // Settings
  PhoneSettings: Component;          // Connected phone numbers
  BusinessProfile: Component;        // WhatsApp business profile
}

// API Endpoints:
GET /api/whatsapp/conversations
GET /api/whatsapp/conversations/:id
POST /api/whatsapp/conversations/:id/messages
POST /api/whatsapp/messages/send
POST /api/whatsapp/messages/send-template
POST /api/whatsapp/broadcasts
GET /api/whatsapp/templates
POST /api/whatsapp/templates
GET /api/whatsapp/templates/:id/status
```

---

## 4. TASKS MODULE (9.5 → 10/10)

### A. Gantt Chart View

**Route:** `/tasks/gantt` or `/cases/:caseId/gantt`

```typescript
interface GanttComponents {
  // Main Gantt
  GanttChart: Component;             // DHTMLX Gantt or similar
  TaskBar: Component;                // Individual task bar
  DependencyArrow: Component;        // Task dependency lines

  // Controls
  TimeScaleSelector: Component;      // Day/Week/Month view
  FilterPanel: Component;            // Filter by assignee, status
  ZoomControls: Component;           // Zoom in/out

  // Features
  CriticalPath: Component;           // Highlight critical path
  MilestoneMarkers: Component;       // Milestone indicators
  ResourceView: Component;           // Resource assignment view
  ProgressOverlay: Component;        // Progress percentage

  // Interactions
  TaskEditor: Component;             // Edit task modal
  DependencyEditor: Component;       // Add/remove dependencies
  DragHandler: Component;            // Drag to reschedule
  ResizeHandler: Component;          // Resize to change duration
}

// API Endpoints:
GET /api/gantt/case/:caseId                       // Get Gantt data for case
GET /api/gantt/case/:caseId/dhtmlx               // DHTMLX format
PUT /api/gantt/task/:taskId/schedule             // Update schedule
POST /api/gantt/task/:taskId/dependencies        // Add dependency
DELETE /api/gantt/task/:taskId/dependencies/:depId // Remove dependency
GET /api/gantt/case/:caseId/critical-path        // Get critical path
GET /api/gantt/case/:caseId/milestones           // Get milestones
POST /api/gantt/case/:caseId/milestones          // Add milestone
PUT /api/gantt/case/:caseId/baseline             // Save baseline
POST /api/gantt/case/:caseId/auto-schedule       // Auto-schedule
GET /api/gantt/case/:caseId/resource-loading     // Resource workload

// DHTMLX-compatible response:
{
  "data": [
    {
      "id": "task_123",
      "text": "Draft Contract",
      "start_date": "2024-01-15 00:00",
      "duration": 5,
      "progress": 0.6,
      "parent": "0",
      "type": "task",
      "assignee": "John Doe",
      "priority": "high"
    }
  ],
  "links": [
    {
      "id": "link_1",
      "source": "task_123",
      "target": "task_456",
      "type": "0"  // 0=FS, 1=SS, 2=FF, 3=SF
    }
  ]
}
```

**DHTMLX Gantt Integration:**

```tsx
import { Gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

function GanttView({ caseId }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Gantt
    gantt.init(containerRef.current);

    // Configure columns
    gantt.config.columns = [
      { name: "text", label: "Task", tree: true, width: 200 },
      { name: "start_date", label: "Start", align: "center" },
      { name: "duration", label: "Days", align: "center" },
      { name: "assignee", label: "Assignee" },
      { name: "progress", label: "Progress", template: (obj) => `${Math.round(obj.progress * 100)}%` }
    ];

    // Enable critical path
    gantt.config.highlight_critical_path = true;

    // Load data
    fetch(`/api/gantt/case/${caseId}/dhtmlx`)
      .then(res => res.json())
      .then(data => gantt.parse(data));

    // Handle updates
    gantt.attachEvent("onAfterTaskDrag", (id, mode) => {
      const task = gantt.getTask(id);
      fetch(`/api/gantt/task/${id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({
          startDate: task.start_date,
          endDate: task.end_date,
          duration: task.duration
        })
      });
    });

    return () => gantt.clearAll();
  }, [caseId]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}
```

### B. Real-time Collaboration

**Socket.io Events:**

```typescript
// Client-side setup
import { io } from 'socket.io-client';

const socket = io(API_URL, {
  auth: { token: accessToken }
});

// Join entity room
socket.emit('join:entity', {
  entityType: 'case',
  entityId: caseId
});

// Track user presence
socket.emit('presence:join', {
  entityType: 'case',
  entityId: caseId,
  user: { id: userId, name: userName }
});

// Share cursor position
socket.emit('cursor:move', {
  entityType: 'case',
  entityId: caseId,
  position: { x: 100, y: 200 },
  element: 'task-description-123'
});

// Lock entity for editing
socket.emit('lock:acquire', {
  entityType: 'task',
  entityId: taskId,
  field: 'description'  // Optional: lock specific field
});

// Listen for events
socket.on('presence:users', (users) => {
  // Update active users list
});

socket.on('cursor:update', (data) => {
  // Show other users' cursors
});

socket.on('lock:status', (data) => {
  // Update lock indicators
});

socket.on('entity:updated', (data) => {
  // Refresh entity data
});

// Gantt-specific events
socket.on('gantt:task:updated', (data) => {
  gantt.updateTask(data.taskId, data.changes);
});

socket.on('gantt:link:added', (data) => {
  gantt.addLink(data.link);
});
```

---

## 5. DOCUMENT ANALYSIS (General 10/10)

### AI Document Analysis

**Route:** `/documents/analysis` or within document viewer

```typescript
interface DocumentAnalysisComponents {
  // Analysis Dashboard
  AnalysisQueue: Component;          // Documents pending analysis
  AnalysisResults: Component;        // Completed analyses

  // Individual Analysis
  DocumentSummary: Component;        // AI-generated summary
  EntityExtraction: Component;       // Parties, dates, amounts
  ContractAnalysis: Component;       // Risk, obligations, terms
  KeyFindings: Component;            // Important findings

  // Multi-document
  DocumentComparison: Component;     // Compare 2 documents
  BulkAnalysis: Component;           // Analyze multiple docs

  // Search
  SemanticSearch: Component;         // AI-powered search
  SimilarDocuments: Component;       // Find similar docs
}

// API Endpoints:
POST /api/document-analysis/analyze/:documentId                // Analyze single doc
POST /api/document-analysis/analyze/:documentId/summary        // Summary only
POST /api/document-analysis/analyze/:documentId/entities       // Extract entities
POST /api/document-analysis/analyze/:documentId/contract       // Contract analysis
POST /api/document-analysis/compare                            // Compare docs
POST /api/document-analysis/bulk                               // Bulk analyze
GET /api/document-analysis/:documentId                         // Get analysis results
GET /api/document-analysis/:documentId/history                 // Analysis history
POST /api/document-analysis/search                             // Semantic search

// Analysis response:
{
  "success": true,
  "data": {
    "documentId": "...",
    "summary": {
      "brief": "Employment agreement for software engineer position...",
      "keyPoints": ["2-year term", "Non-compete clause", "Equity vesting"],
      "wordCount": 5420,
      "readingTime": "22 minutes"
    },
    "entities": {
      "parties": [
        { "name": "Acme Corp", "role": "employer", "confidence": 0.95 },
        { "name": "John Doe", "role": "employee", "confidence": 0.98 }
      ],
      "dates": [
        { "value": "2024-01-15", "context": "effective date", "confidence": 0.99 }
      ],
      "amounts": [
        { "value": 150000, "currency": "USD", "context": "base salary", "confidence": 0.97 }
      ],
      "obligations": [...]
    },
    "classification": {
      "type": "employment_agreement",
      "subType": "executive",
      "confidence": 0.92
    },
    "risks": [
      {
        "severity": "medium",
        "description": "Broad non-compete clause may be unenforceable",
        "section": "Section 8.2",
        "recommendation": "Consider narrowing geographic scope"
      }
    ]
  }
}
```

---

## 6. NPM PACKAGES TO INSTALL (Frontend)

```bash
# Charts & Visualization
npm install recharts @nivo/core @nivo/pie @nivo/line

# Gantt Chart
npm install dhtmlx-gantt
# OR
npm install react-gantt-timeline

# Maps (Geofencing)
npm install react-leaflet leaflet
# OR
npm install @react-google-maps/api

# Email Template Builder
npm install react-email-editor
# OR
npm install @unlayer/react-email-editor

# Flow Builder (Drip Campaigns)
npm install reactflow

# Real-time
npm install socket.io-client

# File Upload
npm install react-dropzone

# Date handling
npm install date-fns

# Data tables
npm install @tanstack/react-table

# PDF Viewer (for document analysis)
npm install react-pdf
```

---

## 7. TYPESCRIPT INTERFACES (Complete)

```typescript
// ========== HR ==========
interface BiometricDevice {
  _id: string;
  firmId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'fingerprint' | 'facial' | 'card_reader' | 'iris' | 'palm' | 'multi_modal';
  manufacturer: 'zkteco' | 'suprema' | 'hikvision' | 'dahua' | 'generic';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  connection: {
    type: 'tcp' | 'http' | 'usb' | 'serial';
    ipAddress?: string;
    port?: number;
    serialPort?: string;
  };
  location: {
    name: string;
    coordinates?: { latitude: number; longitude: number };
    geofenceRadius?: number;
  };
  capabilities: {
    fingerprint: boolean;
    facial: boolean;
    card: boolean;
    pin: boolean;
    antiSpoofing: boolean;
  };
}

interface BiometricEnrollment {
  _id: string;
  firmId: string;
  employeeId: string;
  status: 'pending' | 'partial' | 'complete' | 'suspended' | 'revoked';
  fingerprints: Array<{
    finger: string;
    template: string;
    quality: number;
    enrolledAt: Date;
  }>;
  facial?: {
    photo: string;
    template: string;
    quality: number;
    enrolledAt: Date;
  };
  card?: {
    cardNumber: string;
    cardType: 'rfid' | 'nfc' | 'magnetic' | 'smart';
    issuedAt: Date;
    expiresAt?: Date;
  };
  pin?: string;
}

interface GeofenceZone {
  _id: string;
  firmId: string;
  name: string;
  type: 'circle' | 'polygon';
  center?: { latitude: number; longitude: number };
  radius?: number;
  coordinates?: Array<{ latitude: number; longitude: number }>;
  settings: {
    allowClockIn: boolean;
    allowClockOut: boolean;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    restrictedHours?: { start: string; end: string };
  };
  isActive: boolean;
}

interface HRAnalyticsSnapshot {
  _id: string;
  firmId: string;
  type: 'workforce_overview' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'recruitment' | 'training' | 'diversity' | 'compensation' | 'attrition';
  period: { start: Date; end: Date };
  data: any;
  createdBy: string;
}

interface AttritionRiskPrediction {
  employeeId: string;
  employee: { name: string; department: string; position: string };
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
    description: string;
  }>;
  recommendations: string[];
  estimatedCost: number;
}

// ========== Finance ==========
interface BankFeed {
  _id: string;
  firmId: string;
  bankAccountId: string;
  provider: 'plaid' | 'yodlee' | 'manual';
  credentials?: { accessToken: string; itemId: string };
  status: 'active' | 'error' | 'disconnected' | 'pending';
  lastSync?: Date;
  syncFrequency: 'realtime' | 'daily' | 'weekly' | 'manual';
}

interface BankTransactionMatch {
  _id: string;
  firmId: string;
  bankTransactionId: string;
  matchedType: 'invoice' | 'expense' | 'payment' | 'transfer' | 'journal_entry';
  matchedId: string;
  matchMethod: 'auto' | 'rule' | 'manual' | 'ai';
  confidence: number;
  status: 'suggested' | 'confirmed' | 'rejected';
}

interface ExchangeRate {
  _id: string;
  firmId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: 'manual' | 'api' | 'ecb' | 'openexchange';
  effectiveDate: Date;
}

// ========== CRM ==========
interface EmailCampaign {
  _id: string;
  firmId: string;
  name: string;
  type: 'regular' | 'drip' | 'transactional' | 'automated';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  template: string;
  subject: string;
  preheaderText?: string;
  recipients: {
    type: 'all' | 'segment' | 'list' | 'manual';
    segmentId?: string;
    subscriberIds?: string[];
    excludeUnsubscribed: boolean;
  };
  schedule?: { sendAt: Date; timezone: string };
  abTest?: {
    enabled: boolean;
    variants: Array<{ name: string; subject?: string; template?: string; weight: number }>;
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion';
    testDuration: number;
    winner?: string;
  };
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    complained: number;
  };
}

interface DripCampaign {
  _id: string;
  firmId: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  trigger: {
    type: 'signup' | 'tag_added' | 'lead_created' | 'custom';
    conditions?: any;
  };
  steps: Array<{
    order: number;
    type: 'email' | 'wait' | 'condition' | 'action';
    emailId?: string;
    waitDuration?: { value: number; unit: 'hours' | 'days' | 'weeks' };
    condition?: { field: string; operator: string; value: any };
    action?: { type: string; params: any };
  }>;
}

interface LeadScore {
  _id: string;
  firmId: string;
  leadId: string;
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: {
    demographic: { score: number; maxScore: number; factors: any[] };
    bant: { score: number; maxScore: number; factors: any[] };
    behavioral: { score: number; maxScore: number; factors: any[] };
    engagement: { score: number; maxScore: number; factors: any[] };
  };
  trend: 'increasing' | 'stable' | 'decreasing';
  history: Array<{ date: Date; score: number; reason: string }>;
}

interface WhatsAppConversation {
  _id: string;
  firmId: string;
  phoneNumber: string;
  contactId?: string;
  leadId?: string;
  status: 'active' | 'closed' | 'pending';
  lastMessageAt: Date;
  unreadCount: number;
  assignedTo?: string;
}

// ========== Tasks ==========
interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  end_date?: string;
  duration: number;
  progress: number;
  parent: string;
  type: 'task' | 'project' | 'milestone';
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isCritical?: boolean;
}

interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: '0' | '1' | '2' | '3'; // 0=FS, 1=SS, 2=FF, 3=SF
  lag?: number;
}

// ========== Document Analysis ==========
interface DocumentAnalysis {
  _id: string;
  firmId: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisTypes: Array<'summary' | 'entities' | 'classification' | 'contract' | 'comparison'>;
  results: {
    summary?: {
      brief: string;
      keyPoints: string[];
      wordCount: number;
      readingTime: string;
    };
    entities?: {
      parties: Array<{ name: string; role: string; confidence: number }>;
      dates: Array<{ value: string; context: string; confidence: number }>;
      amounts: Array<{ value: number; currency: string; context: string; confidence: number }>;
      obligations: Array<{ party: string; obligation: string; deadline?: string }>;
    };
    classification?: {
      type: string;
      subType?: string;
      confidence: number;
      suggestedTags: string[];
    };
    risks?: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      section?: string;
      recommendation?: string;
    }>;
  };
  aiModel: string;
  processingTime: number;
  createdAt: Date;
}
```

---

## SUMMARY

### Implementation Complete:

| Module | Score | Features |
|--------|-------|----------|
| **HR Module** | 10/10 | Biometric, Geo-fencing, Analytics, AI Predictions |
| **Finance Module** | 10/10 | Bank Reconciliation, Multi-Currency |
| **CRM Module** | 10/10 | Email Marketing, AI Lead Scoring, WhatsApp |
| **Tasks Module** | 10/10 | Gantt Charts, Real-time Collaboration |
| **General** | 10/10 | AI Document Analysis |

### New API Endpoints Count:

| Module | Endpoints | Features |
|--------|-----------|----------|
| **Biometric** | 35+ | Device mgmt, enrollment, verification, geo-fencing |
| **HR Analytics** | 21 | Demographics, turnover, AI predictions |
| **Bank Reconciliation** | 19 | Import, auto-match, rules, multi-currency |
| **Email Marketing** | 30+ | Campaigns, templates, segments, A/B testing |
| **Lead Scoring** | 15 | AI scoring, behavioral tracking |
| **WhatsApp** | 15 | Messages, conversations, templates |
| **Gantt** | 30+ | Charts, dependencies, resources, collaboration |
| **Real-time** | 20+ events | Socket.io collaboration |

**Total: 185+ new API endpoints**

---

## Version

- Guide Version: 1.0.0
- Date: December 8, 2025
