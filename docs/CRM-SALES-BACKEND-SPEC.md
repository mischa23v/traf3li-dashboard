# CRM/Sales Backend Specification

## Overview

This document specifies the backend calculations, transactions, and state transitions for the CRM and Sales modules. The goal is to match the Finance module pattern where **backend does 90% of the work** and frontend is primarily for display.

---

## Core Principles

1. **Backend-First Calculations**: All totals, scores, commissions, and metrics are calculated server-side
2. **Transactional Integrity**: All state changes are atomic and auditable
3. **Event-Driven Updates**: State transitions trigger cascading updates
4. **Validation at Server**: All business rules validated server-side
5. **Audit Trail**: Every change is logged with who/what/when

---

## 1. Lead Management

### 1.1 Lead Score Calculation (Server-Side)

The lead score should be calculated by the backend, not frontend.

```javascript
// Backend: services/leadScoring.service.js

calculateLeadScore(lead) {
  let score = 0;

  // BANT Scoring (Budget, Authority, Need, Timeline)
  const bantScores = {
    budget: {
      'unknown': 0, 'under_10k': 10, '10k_50k': 20,
      '50k_100k': 30, '100k_500k': 40, 'above_500k': 50
    },
    authority: {
      'unknown': 0, 'no_authority': 5, 'influencer': 15,
      'recommender': 20, 'decision_maker': 30, 'final_approver': 35
    },
    need: {
      'unknown': 0, 'no_need': 0, 'exploring': 10,
      'researching': 15, 'evaluating': 20, 'urgent': 25, 'critical': 30
    },
    timeline: {
      'unknown': 0, 'no_timeline': 5, 'next_year': 10,
      'this_year': 15, 'this_quarter': 20, 'this_month': 25,
      'this_week': 30, 'immediate': 35
    }
  };

  score += bantScores.budget[lead.qualification?.budget] || 0;
  score += bantScores.authority[lead.qualification?.authority] || 0;
  score += bantScores.need[lead.qualification?.need] || 0;
  score += bantScores.timeline[lead.qualification?.timeline] || 0;

  // Engagement Scoring
  if (lead.email) score += 5;
  if (lead.phone) score += 5;
  if (lead.company) score += 5;
  if (lead.estimatedValue > 0) score += 10;
  if (lead.intake?.practiceArea) score += 5;
  if (lead.conflictCheck?.status === 'clear') score += 10;
  if (lead.isVIP) score += 10;

  // Activity-Based Scoring (from activity logs)
  const recentActivities = await this.getRecentActivities(lead._id, 30); // last 30 days
  score += Math.min(recentActivities.length * 2, 20); // max 20 points

  // Decay: Reduce score if no contact in 30+ days
  const daysSinceContact = this.daysSince(lead.followUp?.lastContactDate);
  if (daysSinceContact > 30) score -= 10;
  if (daysSinceContact > 60) score -= 20;

  return Math.max(0, Math.min(score, 150)); // 0-150 range
}
```

### 1.2 Lead State Transitions

```javascript
// Backend: services/leadStateMachine.service.js

const LEAD_STATES = {
  new: ['contacted', 'disqualified'],
  contacted: ['qualified', 'nurturing', 'disqualified'],
  qualified: ['proposal', 'nurturing', 'disqualified'],
  proposal: ['negotiation', 'won', 'lost'],
  negotiation: ['won', 'lost', 'proposal'],
  won: [], // Terminal state
  lost: ['reopened'],
  disqualified: ['reopened'],
  nurturing: ['contacted', 'disqualified']
};

async transitionLead(leadId, newStatus, userId, reason) {
  const lead = await Lead.findById(leadId);
  const currentStatus = lead.status;

  // Validate transition is allowed
  if (!LEAD_STATES[currentStatus].includes(newStatus)) {
    throw new BusinessError(`Cannot transition from ${currentStatus} to ${newStatus}`);
  }

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update lead status
    lead.status = newStatus;
    lead.statusHistory.push({
      from: currentStatus,
      to: newStatus,
      changedBy: userId,
      changedAt: new Date(),
      reason
    });

    // Trigger side effects based on transition
    await this.handleTransitionSideEffects(lead, currentStatus, newStatus, session);

    await lead.save({ session });
    await session.commitTransaction();

    // Emit event for real-time updates
    eventEmitter.emit('lead:statusChanged', { leadId, from: currentStatus, to: newStatus });

    return lead;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}

async handleTransitionSideEffects(lead, from, to, session) {
  // When lead is won
  if (to === 'won') {
    // Create client record
    await this.createClientFromLead(lead, session);
    // Create case if applicable
    if (lead.intake?.caseType) {
      await this.createCaseFromLead(lead, session);
    }
    // Update conversion metrics
    await this.updateConversionMetrics(lead, session);
    // Send notification
    await this.sendWonNotification(lead);
  }

  // When lead is lost
  if (to === 'lost') {
    await this.recordLostReason(lead, session);
    await this.updateLostMetrics(lead, session);
  }

  // When proposal is sent
  if (to === 'proposal') {
    await this.createQuoteFromLead(lead, session);
  }
}
```

### 1.3 Lead Transactions (Audit Log)

```javascript
// Backend: models/LeadTransaction.js

const LeadTransactionSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  transactionType: {
    type: String,
    enum: [
      'created', 'updated', 'status_changed', 'assigned',
      'activity_logged', 'note_added', 'converted',
      'merged', 'archived', 'restored'
    ]
  },
  previousValues: Schema.Types.Mixed,
  newValues: Schema.Types.Mixed,
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  performedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  metadata: Schema.Types.Mixed
});

// Every lead change creates a transaction record
```

---

## 2. Quote/Proposal Management

### 2.1 Quote Calculations (Server-Side)

```javascript
// Backend: services/quoteCalculation.service.js

calculateQuoteTotals(quote) {
  // Calculate line item totals
  const lineItems = quote.items.map(item => {
    const baseAmount = item.quantity * item.unitPrice;

    // Apply line-level discount
    let discountAmount = 0;
    if (item.discountType === 'percentage') {
      discountAmount = baseAmount * (item.discountValue / 100);
    } else if (item.discountType === 'fixed') {
      discountAmount = item.discountValue;
    }

    const lineTotal = baseAmount - discountAmount;

    return {
      ...item,
      baseAmount,
      discountAmount,
      lineTotal,
      taxAmount: item.taxable ? lineTotal * (quote.vatRate / 100) : 0
    };
  });

  // Calculate subtotals
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  // Apply quote-level discount
  let quoteDiscount = 0;
  if (quote.discountType === 'percentage') {
    quoteDiscount = subtotal * (quote.discountValue / 100);
  } else if (quote.discountType === 'fixed') {
    quoteDiscount = quote.discountValue;
  }

  const afterDiscount = subtotal - quoteDiscount;

  // Calculate VAT
  const vatAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);

  // Final total
  const total = afterDiscount + vatAmount;

  // Calculate weighted value for forecasting
  const weightedValue = total * (quote.probability / 100);

  return {
    items: lineItems,
    subtotal,
    discountAmount: quoteDiscount,
    afterDiscount,
    vatAmount,
    total,
    weightedValue,
    totalInWords: this.numberToArabicWords(total)
  };
}
```

### 2.2 Quote State Machine

```javascript
// Backend: services/quoteStateMachine.service.js

const QUOTE_STATES = {
  draft: ['pending_approval', 'sent', 'cancelled'],
  pending_approval: ['approved', 'rejected', 'draft'],
  approved: ['sent', 'draft'],
  sent: ['viewed', 'accepted', 'rejected', 'expired', 'revised'],
  viewed: ['accepted', 'rejected', 'expired', 'revised'],
  accepted: ['converted'],  // Converted to invoice/case
  rejected: ['revised', 'archived'],
  expired: ['revised', 'archived'],
  revised: ['draft'],
  converted: [],  // Terminal
  cancelled: [],
  archived: ['draft']  // Can be restored
};

async transitionQuote(quoteId, newStatus, userId, metadata) {
  // Similar pattern to lead transitions
  // Includes validation, transaction, side effects
}

// Side effects
async handleQuoteSideEffects(quote, from, to, session) {
  if (to === 'sent') {
    await this.sendQuoteEmail(quote);
    await this.createActivity(quote.leadId, 'quote_sent', quote._id);
    await this.scheduleFollowUp(quote);
  }

  if (to === 'accepted') {
    await this.updateLeadStatus(quote.leadId, 'won');
  }

  if (to === 'converted') {
    await this.createInvoiceFromQuote(quote, session);
    await this.createCaseFromQuote(quote, session);
  }

  if (to === 'expired') {
    await this.sendExpirationNotification(quote);
  }
}
```

### 2.3 Quote Versioning

```javascript
// Backend: services/quoteVersioning.service.js

async createRevision(quoteId, changes, userId) {
  const quote = await Quote.findById(quoteId);

  // Archive current version
  const archivedVersion = {
    version: quote.version,
    data: quote.toObject(),
    archivedAt: new Date(),
    archivedBy: userId
  };

  quote.versionHistory.push(archivedVersion);
  quote.version += 1;
  quote.status = 'draft';

  // Apply changes
  Object.assign(quote, changes);

  // Recalculate totals
  const calculations = this.calculateQuoteTotals(quote);
  Object.assign(quote, calculations);

  await quote.save();

  return quote;
}
```

---

## 3. Pipeline Management

### 3.1 Pipeline Metrics Calculation

```javascript
// Backend: services/pipelineMetrics.service.js

async calculatePipelineMetrics(pipelineId, dateRange) {
  const pipeline = await Pipeline.findById(pipelineId).populate('stages');

  const metrics = {
    totalValue: 0,
    weightedValue: 0,
    leadCount: 0,
    stageBreakdown: [],
    velocity: {},
    conversionRates: {}
  };

  for (const stage of pipeline.stages) {
    const stageLeads = await Lead.find({
      pipelineId,
      stageId: stage._id,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const stageWeighted = stageValue * (stage.probability / 100);

    metrics.stageBreakdown.push({
      stageId: stage._id,
      stageName: stage.name,
      leadCount: stageLeads.length,
      totalValue: stageValue,
      weightedValue: stageWeighted,
      avgDaysInStage: await this.calculateAvgDaysInStage(stage._id)
    });

    metrics.totalValue += stageValue;
    metrics.weightedValue += stageWeighted;
    metrics.leadCount += stageLeads.length;
  }

  // Calculate conversion rates between stages
  metrics.conversionRates = await this.calculateStageConversions(pipelineId, dateRange);

  // Calculate velocity (avg days to close)
  metrics.velocity = await this.calculatePipelineVelocity(pipelineId, dateRange);

  return metrics;
}

async calculateStageConversions(pipelineId, dateRange) {
  // Aggregate conversion rates from stage transition logs
  const transitions = await LeadTransaction.aggregate([
    {
      $match: {
        transactionType: 'status_changed',
        performedAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: { from: '$previousValues.stageId', to: '$newValues.stageId' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Calculate conversion percentages
  return this.buildConversionMatrix(transitions);
}
```

### 3.2 Forecast Generation

```javascript
// Backend: services/forecast.service.js

async generateForecast(userId, period) {
  const leads = await Lead.find({
    assignedTo: userId,
    status: { $in: ['qualified', 'proposal', 'negotiation'] },
    expectedCloseDate: { $gte: period.start, $lte: period.end }
  });

  const forecast = {
    period,
    best_case: 0,
    most_likely: 0,
    worst_case: 0,
    pipeline_value: 0,
    weighted_pipeline: 0,
    deals: []
  };

  for (const lead of leads) {
    const dealValue = lead.estimatedValue || 0;
    const probability = lead.probability || 50;

    forecast.pipeline_value += dealValue;
    forecast.weighted_pipeline += dealValue * (probability / 100);

    // Calculate scenarios
    if (probability >= 80) {
      forecast.best_case += dealValue;
      forecast.most_likely += dealValue * 0.9;
      forecast.worst_case += dealValue * 0.7;
    } else if (probability >= 50) {
      forecast.best_case += dealValue;
      forecast.most_likely += dealValue * 0.6;
      forecast.worst_case += dealValue * 0.3;
    } else {
      forecast.best_case += dealValue * 0.5;
      forecast.most_likely += dealValue * 0.2;
      forecast.worst_case += 0;
    }

    forecast.deals.push({
      leadId: lead._id,
      name: lead.displayName,
      value: dealValue,
      probability,
      expectedClose: lead.expectedCloseDate,
      weighted: dealValue * (probability / 100)
    });
  }

  return forecast;
}
```

---

## 4. Commission Calculations

### 4.1 Sales Commission Engine

```javascript
// Backend: services/commission.service.js

async calculateCommission(dealId) {
  const deal = await Lead.findById(dealId).populate('assignedTo');
  const settings = await CommissionSettings.findOne({ userId: deal.assignedTo._id });

  if (!settings) {
    settings = await CommissionSettings.findOne({ isDefault: true });
  }

  const dealValue = deal.actualValue || deal.estimatedValue;
  let commission = 0;

  // Tiered commission calculation
  if (settings.tierType === 'graduated') {
    commission = this.calculateGraduatedCommission(dealValue, settings.tiers);
  } else if (settings.tierType === 'flat') {
    commission = dealValue * (settings.flatRate / 100);
  } else if (settings.tierType === 'incremental') {
    commission = this.calculateIncrementalCommission(dealValue, settings.tiers, deal.assignedTo._id);
  }

  // Apply adjustments
  if (deal.source?.type === 'referral') {
    commission *= (1 - (settings.referralDeduction / 100));
  }

  // Team split if applicable
  if (deal.teamMembers?.length > 1) {
    return this.splitCommission(commission, deal.teamMembers, settings);
  }

  // Create commission record
  await Commission.create({
    dealId,
    userId: deal.assignedTo._id,
    dealValue,
    commissionAmount: commission,
    rate: (commission / dealValue) * 100,
    status: 'pending',
    payoutDate: this.getNextPayoutDate()
  });

  return commission;
}

calculateGraduatedCommission(value, tiers) {
  let commission = 0;
  let remaining = value;

  for (const tier of tiers.sort((a, b) => a.minValue - b.minValue)) {
    if (remaining <= 0) break;

    const tierRange = (tier.maxValue || Infinity) - tier.minValue;
    const applicableAmount = Math.min(remaining, tierRange);

    commission += applicableAmount * (tier.rate / 100);
    remaining -= applicableAmount;
  }

  return commission;
}
```

---

## 5. Activity & Engagement Tracking

### 5.1 Activity Logging (Server-Side)

```javascript
// Backend: services/activity.service.js

async logActivity(params) {
  const { type, entityType, entityId, userId, metadata } = params;

  const activity = await Activity.create({
    type, // call, email, meeting, note, task, etc.
    entityType, // lead, quote, client, case
    entityId,
    performedBy: userId,
    performedAt: new Date(),
    duration: metadata.duration,
    outcome: metadata.outcome,
    notes: metadata.notes
  });

  // Update entity's last contact date
  await this.updateLastContact(entityType, entityId);

  // Update lead score based on activity
  if (entityType === 'lead') {
    await this.leadScoringService.recalculateScore(entityId);
  }

  // Check for automation triggers
  await this.automationService.checkTriggers('activity_logged', {
    activity,
    entityType,
    entityId
  });

  return activity;
}
```

### 5.2 Stale Lead Detection

```javascript
// Backend: jobs/staleLeadDetection.job.js

async detectStaleLeads() {
  const staleThresholds = {
    new: 3,        // 3 days without contact
    contacted: 7,   // 7 days
    qualified: 14,  // 14 days
    proposal: 7,    // 7 days after proposal sent
    negotiation: 5  // 5 days during negotiation
  };

  const staleLeads = [];

  for (const [status, threshold] of Object.entries(staleThresholds)) {
    const leads = await Lead.find({
      status,
      $or: [
        { 'followUp.lastContactDate': { $lt: this.daysAgo(threshold) } },
        { 'followUp.lastContactDate': null, createdAt: { $lt: this.daysAgo(threshold) } }
      ]
    });

    for (const lead of leads) {
      // Mark as stale
      lead.isStale = true;
      lead.staleReason = `No contact in ${threshold}+ days`;
      await lead.save();

      // Send notification to assigned user
      await this.notificationService.send({
        userId: lead.assignedTo,
        type: 'stale_lead',
        title: 'عميل محتمل متأخر',
        message: `${lead.displayName} لم يتم التواصل معه منذ ${threshold} يوم`,
        entityType: 'lead',
        entityId: lead._id
      });

      staleLeads.push(lead);
    }
  }

  return staleLeads;
}
```

---

## 6. Dashboard Aggregations (Aggregated Endpoints)

### 6.1 Sales Dashboard Aggregation

```javascript
// Backend: controllers/dashboard.controller.js

// Single endpoint that returns ALL dashboard data
async getSalesDashboard(req, res) {
  const { userId, period, teamId } = req.query;

  // Execute all queries in parallel
  const [
    pipelineData,
    quotaProgress,
    teamPerformance,
    recentActivities,
    alerts,
    forecast,
    leaderboard
  ] = await Promise.all([
    this.pipelineService.getMetrics(userId, period),
    this.quotaService.getProgress(userId, period),
    this.teamService.getPerformance(teamId, period),
    this.activityService.getRecent(userId, 10),
    this.alertService.getAlerts(userId),
    this.forecastService.generate(userId, period),
    this.leaderboardService.get(teamId, period)
  ]);

  // Calculate derived metrics
  const summary = {
    totalRevenue: pipelineData.closedWon,
    pipelineValue: pipelineData.totalValue,
    weightedPipeline: pipelineData.weightedValue,
    quotaAttainment: (quotaProgress.achieved / quotaProgress.target) * 100,
    activitiesThisWeek: recentActivities.filter(a => this.isThisWeek(a.date)).length,
    dealsAtRisk: alerts.filter(a => a.type === 'deal_at_risk').length
  };

  res.json({
    success: true,
    data: {
      summary,
      pipeline: pipelineData,
      quota: quotaProgress,
      team: teamPerformance,
      activities: recentActivities,
      alerts,
      forecast,
      leaderboard
    },
    meta: {
      generatedAt: new Date(),
      period,
      cacheExpiry: 300 // 5 minutes
    }
  });
}
```

### 6.2 CRM Dashboard Aggregation

```javascript
// Backend: controllers/crmDashboard.controller.js

async getCrmDashboard(req, res) {
  const { userId, period } = req.query;

  const [
    leadStats,
    dealHealth,
    activitySummary,
    conversionMetrics,
    dataQuality,
    pipelineVelocity
  ] = await Promise.all([
    this.leadService.getStats(userId, period),
    this.dealService.getHealth(userId),
    this.activityService.getSummary(userId, period),
    this.conversionService.getMetrics(period),
    this.dataQualityService.getScore(userId),
    this.pipelineService.getVelocity(period)
  ]);

  res.json({
    success: true,
    data: {
      leads: leadStats,
      deals: dealHealth,
      activities: activitySummary,
      conversions: conversionMetrics,
      dataQuality,
      velocity: pipelineVelocity
    },
    meta: {
      generatedAt: new Date(),
      cacheExpiry: 300
    }
  });
}
```

---

## 7. Conflict of Interest Check

### 7.1 Automated Conflict Detection

```javascript
// Backend: services/conflictCheck.service.js

async checkForConflicts(leadData) {
  const conflicts = [];

  // Search by opposing party
  if (leadData.opposingParty) {
    const matchingClients = await Client.find({
      $text: { $search: leadData.opposingParty }
    });

    if (matchingClients.length > 0) {
      conflicts.push({
        type: 'opposing_party_match',
        severity: 'high',
        matches: matchingClients.map(c => ({
          clientId: c._id,
          name: c.name,
          matchScore: c.textScore
        }))
      });
    }
  }

  // Search by company
  if (leadData.company) {
    const relatedCases = await Case.find({
      $or: [
        { 'parties.name': { $regex: leadData.company, $options: 'i' } },
        { 'relatedEntities': { $regex: leadData.company, $options: 'i' } }
      ]
    });

    if (relatedCases.length > 0) {
      conflicts.push({
        type: 'company_involvement',
        severity: 'medium',
        cases: relatedCases.map(c => ({
          caseId: c._id,
          caseNumber: c.caseNumber,
          involvement: c.parties.find(p => p.name.includes(leadData.company))?.role
        }))
      });
    }
  }

  // Check staff relationships
  const staffConflicts = await this.checkStaffRelationships(leadData);
  conflicts.push(...staffConflicts);

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    checkedAt: new Date(),
    requiresReview: conflicts.some(c => c.severity === 'high')
  };
}
```

---

## 8. API Endpoints Summary

### 8.1 Aggregated Endpoints (Single Call)

| Endpoint | Purpose | Data Returned |
|----------|---------|---------------|
| `GET /api/dashboard/sales` | Sales dashboard | Pipeline, quota, team, activities, alerts, forecast |
| `GET /api/dashboard/crm` | CRM dashboard | Leads, deals, activities, conversions, data quality |
| `GET /api/leads/:id/summary` | Lead detail summary | Lead data, score, activities, timeline, related entities |
| `GET /api/pipeline/metrics` | Pipeline analysis | Stage breakdown, velocity, conversion rates |

### 8.2 State Transition Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/leads/:id/transition` | Change lead status |
| `POST /api/quotes/:id/transition` | Change quote status |
| `POST /api/quotes/:id/send` | Send quote and transition |
| `POST /api/quotes/:id/accept` | Mark quote accepted |

### 8.3 Calculation Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/leads/:id/score` | Get calculated lead score |
| `POST /api/quotes/:id/calculate` | Calculate quote totals |
| `GET /api/forecast/generate` | Generate sales forecast |
| `GET /api/commissions/calculate/:dealId` | Calculate commission |

---

## 9. Caching Strategy

```javascript
// Backend: middleware/cache.middleware.js

const cacheConfig = {
  // Dashboard data - 5 minute cache
  'dashboard:sales': 300,
  'dashboard:crm': 300,

  // Pipeline metrics - 10 minute cache
  'pipeline:metrics': 600,

  // Forecasts - 15 minute cache
  'forecast:*': 900,

  // Lead scores - 30 minute cache (recalculated on activity)
  'lead:score:*': 1800,

  // Static data - 1 hour cache
  'settings:*': 3600,
  'stages:*': 3600
};

// Invalidate cache on data changes
eventEmitter.on('lead:updated', (leadId) => {
  cache.invalidate(`lead:score:${leadId}`);
  cache.invalidate('dashboard:*');
});
```

---

## 10. Event-Driven Architecture

```javascript
// Backend: events/eventHandlers.js

// Lead events
eventEmitter.on('lead:created', async (lead) => {
  await leadScoringService.calculateInitialScore(lead._id);
  await notificationService.notifyAssignee(lead);
  await activityService.logActivity({
    type: 'lead_created',
    entityId: lead._id,
    entityType: 'lead'
  });
});

eventEmitter.on('lead:won', async (lead) => {
  await clientService.createFromLead(lead);
  await commissionService.calculate(lead._id);
  await metricsService.updateConversion(lead);
  await celebrationService.notify(lead); // Team celebration!
});

// Quote events
eventEmitter.on('quote:sent', async (quote) => {
  await emailService.sendQuote(quote);
  await activityService.logActivity({
    type: 'quote_sent',
    entityId: quote._id,
    entityType: 'quote'
  });
  await reminderService.scheduleFollowUp(quote, 3); // 3 days
});

eventEmitter.on('quote:viewed', async (quote) => {
  await notificationService.notifyOwner(quote, 'Quote viewed by client');
  await activityService.logActivity({
    type: 'quote_viewed',
    entityId: quote._id,
    entityType: 'quote'
  });
});
```

---

## Implementation Priority

### Phase 1 - Core (Week 1-2)
1. Lead scoring calculation (server-side)
2. Lead state machine
3. Quote calculations
4. Aggregated dashboard endpoints

### Phase 2 - Advanced (Week 3-4)
1. Pipeline metrics
2. Forecast generation
3. Commission engine
4. Conflict checking

### Phase 3 - Polish (Week 5)
1. Event-driven updates
2. Caching layer
3. Real-time notifications
4. Audit trail

---

## Notes for Frontend

1. **Don't calculate totals** - Always use server response
2. **Don't validate complex rules** - Server will reject invalid data
3. **Use aggregated endpoints** - One call for dashboard data
4. **Trust server state** - Don't maintain local state machines
5. **Handle optimistic updates** - But revert on server rejection
