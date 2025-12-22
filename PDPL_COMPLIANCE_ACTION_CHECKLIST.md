# PDPL Compliance - Developer Action Checklist

**Repository:** https://github.com/mischa23v/traf3li-backend
**Priority:** CRITICAL - Start Immediately
**Deadline:** 30 days for critical items

---

## 🔴 CRITICAL PRIORITY - Week 1-2 (Days 1-14)

### 1. Data Protection Officer (DPO) Designation

**Files to Create:**
```
/src/models/dataProtectionOfficer.model.js
/src/controllers/dpo.controller.js
/src/routes/dpo.route.js
```

**Schema:**
```javascript
const dpoSchema = new mongoose.Schema({
    firmId: { type: ObjectId, ref: 'Firm', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: String,
    appointmentDate: { type: Date, default: Date.now },
    responsibilities: [String],
    isActive: { type: Boolean, default: true },
});
```

**API Endpoints:**
- [ ] `POST /api/dpo` - Designate DPO
- [ ] `GET /api/dpo` - Get DPO information (public)
- [ ] `PUT /api/dpo/:id` - Update DPO information
- [ ] `POST /api/dpo/contact` - Contact DPO form

**Frontend Tasks:**
- [ ] Add DPO contact page: `/privacy/dpo`
- [ ] Add DPO info to privacy policy footer
- [ ] Add "Contact DPO" button on privacy settings page

**Testing:**
- [ ] Unit tests for DPO CRUD operations
- [ ] Integration test for DPO contact form
- [ ] Verify public accessibility of DPO information

---

### 2. 72-Hour Data Breach Notification

**Files to Create:**
```
/src/services/breachNotification.service.js
/src/controllers/breachNotification.controller.js
/src/routes/breachNotification.route.js
/src/jobs/breachDeadlineMonitor.job.js
/src/templates/emails/breach-notification-sdaia.ejs
/src/templates/emails/breach-notification-user.ejs
```

**Service Implementation:**
```javascript
class BreachNotificationService {
    async notifyDataBreach(incident) {
        const deadline = new Date(incident.detectedAt);
        deadline.setHours(deadline.getHours() + 72);

        // 1. Assess breach severity
        const assessment = await this.assessBreachImpact(incident);

        // 2. Notify SDAIA if required
        if (assessment.requiresRegulatorNotification) {
            await this.notifySDAIA({
                incidentId: incident._id,
                breachType: incident.type,
                affectedRecords: assessment.affectedRecords,
                discoveryTime: incident.detectedAt,
                deadline: deadline,
            });
        }

        // 3. Notify affected users
        if (assessment.affectedUsers.length > 0) {
            await this.notifyAffectedUsers({
                users: assessment.affectedUsers,
                incident: incident,
                severity: assessment.severity,
            });
        }

        // 4. Create breach notification record
        return await BreachNotification.create({
            incidentId: incident._id,
            notifiedSDSIA: assessment.requiresRegulatorNotification,
            sdaiaNotifiedAt: new Date(),
            affectedUserCount: assessment.affectedUsers.length,
            usersNotifiedAt: new Date(),
            deadline: deadline,
            status: 'notified',
        });
    }
}
```

**Tasks:**
- [ ] Create breach impact assessment logic
- [ ] Implement SDAIA notification workflow
- [ ] Create email templates for user notification
- [ ] Add 72-hour countdown timer
- [ ] Create breach notification dashboard
- [ ] Add automated reminders at 24h, 48h, 60h marks
- [ ] Log all notifications for audit trail

**Testing:**
- [ ] Test breach impact assessment with different scenarios
- [ ] Test SDAIA notification (use sandbox/test endpoint)
- [ ] Test user notification batch processing
- [ ] Test deadline monitoring job
- [ ] Verify audit logging of all notifications

---

### 3. Privacy Impact Assessment (PIA)

**Files to Create:**
```
/src/models/privacyImpactAssessment.model.js
/src/controllers/pia.controller.js
/src/routes/pia.route.js
/docs/compliance/PRIVACY_IMPACT_ASSESSMENT_TEMPLATE.md
```

**Schema:**
```javascript
const piaSchema = new mongoose.Schema({
    firmId: ObjectId,
    processingActivity: String,
    dataCategories: [String],
    purposeOfProcessing: String,
    legalBasis: String,
    riskLevel: { enum: ['low', 'medium', 'high', 'critical'] },
    riskMitigations: [String],
    assessmentDate: Date,
    nextReviewDate: Date,
    assessor: { type: ObjectId, ref: 'User' },
    status: { enum: ['draft', 'in-review', 'approved', 'rejected'] },
    findings: [{
        risk: String,
        likelihood: String,
        impact: String,
        mitigation: String,
    }],
});
```

**Tasks:**
- [ ] Create PIA template document
- [ ] Build PIA wizard/form for admins
- [ ] Implement risk scoring algorithm
- [ ] Add PIA dashboard for tracking
- [ ] Schedule annual PIA review reminders
- [ ] Create PIA export to PDF

**Initial PIAs Required:**
- [ ] PIA for AI/ML lead scoring
- [ ] PIA for NLP services
- [ ] PIA for biometric processing
- [ ] PIA for location tracking
- [ ] PIA for credit scoring (if applicable)

**Testing:**
- [ ] Test PIA creation workflow
- [ ] Test risk scoring logic
- [ ] Verify PIA approval process
- [ ] Test annual review reminders

---

## 🔴 CRITICAL PRIORITY - Week 3-4 (Days 15-30)

### 4. Children's Consent Management

**Files to Update:**
```
/src/models/user.model.js
/src/controllers/auth.controller.js
/src/validators/auth.validator.js
```

**Schema Changes:**
```javascript
// Add to User model
userSchema.add({
    dateOfBirth: {
        type: Date,
        required: true, // Make required for new users
    },
    isMinor: {
        type: Boolean,
        default: false,
    },
    parentalConsent: {
        granted: { type: Boolean, default: false },
        parentEmail: String,
        parentName: String,
        verificationToken: String,
        verifiedAt: Date,
        expiresAt: Date,
    },
});

// Add virtual field
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Add pre-save hook
userSchema.pre('save', function(next) {
    if (this.dateOfBirth) {
        this.isMinor = this.age < 18;
    }
    next();
});
```

**New Service:**
```javascript
// /src/services/parentalConsent.service.js
class ParentalConsentService {
    async requestParentalConsent(userId, parentEmail, parentName) {
        const token = crypto.randomBytes(32).toString('hex');
        const user = await User.findById(userId);

        user.parentalConsent = {
            granted: false,
            parentEmail,
            parentName,
            verificationToken: token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };
        await user.save();

        // Send email to parent
        await emailService.sendParentalConsentRequest({
            to: parentEmail,
            parentName,
            childName: `${user.firstName} ${user.lastName}`,
            verificationLink: `${process.env.FRONTEND_URL}/verify-parental-consent/${token}`,
        });

        return { success: true, message: 'Parental consent request sent' };
    }

    async verifyParentalConsent(token) {
        const user = await User.findOne({
            'parentalConsent.verificationToken': token,
            'parentalConsent.expiresAt': { $gt: new Date() },
        });

        if (!user) {
            throw new Error('Invalid or expired consent token');
        }

        user.parentalConsent.granted = true;
        user.parentalConsent.verifiedAt = new Date();
        user.parentalConsent.verificationToken = null;
        await user.save();

        return { success: true, message: 'Parental consent verified' };
    }
}
```

**Tasks:**
- [ ] Add dateOfBirth field to user registration
- [ ] Add age calculation logic
- [ ] Block registration for users under 18 without parental consent
- [ ] Create parental consent request workflow
- [ ] Create parental consent verification endpoint
- [ ] Add parental consent email templates
- [ ] Add UI for parental consent status
- [ ] Block certain features for minors (even with consent)

**API Endpoints:**
- [ ] `POST /api/auth/request-parental-consent`
- [ ] `GET /api/auth/verify-parental-consent/:token`
- [ ] `GET /api/auth/parental-consent-status`

**Testing:**
- [ ] Test age calculation accuracy
- [ ] Test parental consent request
- [ ] Test token expiration (7 days)
- [ ] Test consent verification
- [ ] Test minor access restrictions

---

### 5. Data Processing Inventory (ROPA)

**Files to Create:**
```
/src/models/recordOfProcessingActivity.model.js
/src/controllers/ropa.controller.js
/src/routes/ropa.route.js
/docs/compliance/ROPA.md
```

**Schema:**
```javascript
const ropaSchema = new mongoose.Schema({
    firmId: ObjectId,
    activityName: { type: String, required: true },
    purpose: { type: String, required: true },
    legalBasis: {
        type: String,
        enum: ['consent', 'contract', 'legal_obligation', 'legitimate_interest'],
        required: true,
    },
    dataCategories: [{
        category: String, // e.g., 'Personal identifiers', 'Financial data'
        fields: [String],  // e.g., ['name', 'email', 'phone']
        sensitivity: { enum: ['normal', 'sensitive'] },
    }],
    dataSubjects: [String], // e.g., ['employees', 'clients', 'leads']
    recipients: [{
        name: String,
        type: { enum: ['internal', 'processor', 'third_party'] },
        country: String,
        safeguards: String, // SCCs, adequacy decision, etc.
    }],
    retentionPeriod: String,
    technicalMeasures: [String],
    organizationalMeasures: [String],
    dataController: {
        name: String,
        role: String,
        contact: String,
    },
    lastReviewedAt: Date,
    nextReviewDue: Date,
});
```

**Tasks:**
- [ ] Document all current processing activities
- [ ] Identify legal basis for each activity
- [ ] Map data flows between systems
- [ ] Identify all data processors
- [ ] Create ROPA management dashboard
- [ ] Add ROPA export to PDF/Excel
- [ ] Schedule annual ROPA review

**Initial ROPA Entries Required:**
- [ ] User authentication
- [ ] Case management
- [ ] Financial transactions
- [ ] Email marketing
- [ ] AI/ML lead scoring
- [ ] Analytics tracking
- [ ] Third-party integrations (Stripe, AWS, etc.)

**Testing:**
- [ ] Test ROPA CRUD operations
- [ ] Test ROPA export
- [ ] Verify review reminder scheduling

---

### 6. Automated Decision-Making Disclosure

**Files to Update:**
```
/src/services/leadScoring.service.js
/src/services/nlp.service.js
/src/models/consent.model.js
```

**Consent Model Changes:**
```javascript
// Add to consent schema
consents: {
    // ... existing consents
    automatedDecisionMaking: {
        granted: { type: Boolean, default: false },
        timestamp: Date,
        version: String,
        disclosures: [{
            feature: String, // 'lead_scoring', 'nlp_analysis', etc.
            purpose: String,
            logic: String, // Brief explanation
            optedOut: { type: Boolean, default: false },
            optedOutAt: Date,
        }],
    },
},
```

**Lead Scoring Service Update:**
```javascript
// Add opt-out check
async scoreLead(leadId) {
    const lead = await Lead.findById(leadId).populate('userId');

    // Check if user opted out of automated decision-making
    const consent = await Consent.findOne({ userId: lead.userId });
    if (consent?.consents?.automatedDecisionMaking?.optedOut) {
        console.log(`User ${lead.userId} opted out of lead scoring`);
        return {
            score: null,
            reason: 'User opted out of automated decision-making',
            optedOut: true,
        };
    }

    // Proceed with scoring
    const score = await this.calculateLeadScore(lead);
    return { score, optedOut: false };
}
```

**Tasks:**
- [ ] Add automatedDecisionMaking consent category
- [ ] Create AI/ML disclosure page explaining algorithms
- [ ] Add opt-out mechanism for each AI feature
- [ ] Update lead scoring to respect opt-out
- [ ] Update NLP service to respect opt-out
- [ ] Add AI disclosure to privacy policy
- [ ] Create UI for AI opt-out preferences

**API Endpoints:**
- [ ] `GET /api/consent/automated-decisions` - Get AI disclosures
- [ ] `POST /api/consent/automated-decisions/opt-out` - Opt out of AI
- [ ] `GET /api/consent/automated-decisions/explanation` - Explain decision

**Testing:**
- [ ] Test AI opt-out workflow
- [ ] Test lead scoring with opt-out users
- [ ] Test NLP with opt-out users
- [ ] Verify audit logging of opt-outs

---

## 🟡 MEDIUM PRIORITY - Month 2 (Days 31-60)

### 7. Right to Rectification API

**Files to Create:**
```
/src/controllers/rectification.controller.js
/src/routes/rectification.route.js
/src/models/rectificationRequest.model.js
```

**Schema:**
```javascript
const rectificationRequestSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: true },
    dataType: String, // 'personalInfo', 'address', 'contact', etc.
    field: String,
    currentValue: String,
    requestedValue: String,
    reason: String,
    status: { enum: ['pending', 'approved', 'rejected', 'completed'] },
    reviewedBy: ObjectId,
    reviewNotes: String,
    completedAt: Date,
});
```

**API Endpoints:**
- [ ] `POST /api/rectification/request` - Submit rectification request
- [ ] `GET /api/rectification/requests` - Get user's requests
- [ ] `PATCH /api/rectification/:id/approve` - Approve (admin)
- [ ] `PATCH /api/rectification/:id/reject` - Reject (admin)

**Tasks:**
- [ ] Create rectification request form
- [ ] Build admin review interface
- [ ] Add auto-approval for certain fields
- [ ] Send notification when completed
- [ ] Add audit logging

---

### 8. Privacy Policy Updates

**Files to Update:**
```
/docs/legal/PRIVACY_POLICY.md
/src/templates/legal/privacy-policy.ejs
```

**Required Sections:**
- [ ] Data controller identity and contact
- [ ] DPO contact information
- [ ] Legal basis for each processing purpose
- [ ] Data categories collected
- [ ] Third-party processors list
- [ ] International data transfers (with safeguards)
- [ ] Data retention periods
- [ ] User rights (access, rectification, erasure, object, portability)
- [ ] Automated decision-making disclosure
- [ ] Cookie policy
- [ ] Children's privacy (under 18)
- [ ] Data breach notification procedure
- [ ] PDPL compliance statement

**Languages:**
- [ ] Arabic version (primary)
- [ ] English version (secondary)

---

### 9. Retention Policy Documentation

**Files to Create:**
```
/docs/legal/DATA_RETENTION_POLICY.md
/src/templates/legal/retention-policy.ejs
```

**Frontend Pages:**
- [ ] `/privacy/retention-policy` - Public retention policy
- [ ] Add retention info to privacy settings
- [ ] Show retention periods in data export UI

**Required Content:**
- [ ] Retention periods for each data category
- [ ] Legal basis for retention
- [ ] Deletion timeline for departed users
- [ ] Archive vs. deletion explanation
- [ ] User notification before deletion

---

### 10. Right to Object Workflow

**API Endpoints:**
- [ ] `POST /api/consent/object` - Object to processing
- [ ] `GET /api/consent/objections` - Get objection history

**Tasks:**
- [ ] Create objection request form
- [ ] Add objection processing workflow
- [ ] Update privacy settings UI
- [ ] Send objection confirmation email

---

## Testing Checklist

### Unit Tests
- [ ] All new models have test coverage
- [ ] All new controllers have test coverage
- [ ] All new services have test coverage

### Integration Tests
- [ ] DPO contact workflow
- [ ] Breach notification end-to-end
- [ ] Parental consent flow
- [ ] AI opt-out flow
- [ ] Rectification request flow

### Compliance Tests
- [ ] ROPA export includes all required fields
- [ ] Privacy policy includes all PDPL requirements
- [ ] 72-hour deadline monitoring works correctly
- [ ] Age verification prevents minor registration
- [ ] Audit logs capture all required events

---

## Documentation Checklist

### Technical Documentation
- [ ] API documentation updated
- [ ] Database schema documentation updated
- [ ] Deployment guide updated

### Legal Documentation
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie policy created
- [ ] Retention policy created
- [ ] DPO contact page created

### Compliance Documentation
- [ ] ROPA document completed
- [ ] PIA documents completed
- [ ] Data breach response plan documented
- [ ] Third-party processor list created

---

## Deployment Checklist

### Pre-Deployment
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Legal review completed
- [ ] Security review completed
- [ ] Performance testing completed

### Deployment
- [ ] Database migrations executed
- [ ] Environment variables configured
- [ ] Monitoring and alerts configured
- [ ] Backup and rollback plan ready

### Post-Deployment
- [ ] Smoke tests completed
- [ ] DPO information published
- [ ] Privacy policy updated
- [ ] User communication sent
- [ ] Compliance audit scheduled

---

## Success Metrics

### Technical Metrics
- [ ] 100% test coverage for new features
- [ ] Zero critical security vulnerabilities
- [ ] API response time < 200ms
- [ ] Email delivery rate > 99%

### Compliance Metrics
- [ ] DPO contact information publicly accessible
- [ ] 72-hour breach notification workflow tested
- [ ] Privacy policy updated in both languages
- [ ] ROPA document completed for all processing
- [ ] PIA completed for high-risk processing
- [ ] 100% of minors have parental consent
- [ ] AI opt-out functionality working

### Business Metrics
- [ ] Zero PDPL complaints or violations
- [ ] Legal sign-off obtained
- [ ] External compliance audit passed
- [ ] User trust score improved

---

## Resources & Tools

### Development Tools
- **Linting:** ESLint with PDPL-specific rules
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI
- **Audit Logging:** Winston + MongoDB

### External Services
- **Email:** Use existing email service
- **Legal:** Engage PDPL legal counsel
- **Compliance:** External compliance auditor
- **DPO:** Consider DPO certification training

### Reference Materials
- PDPL Royal Decree No. M/19
- SDAIA Implementing Regulations
- NCA Essential Cybersecurity Controls
- ISO 27001/27701 standards

---

## Team Assignments

### Backend Team
- **Developer 1:** DPO, breach notification, PIA
- **Developer 2:** Children's consent, ROPA, AI disclosure

### Frontend Team
- **Developer 3:** Privacy policy pages, user consent UI
- **Developer 4:** DPO contact, rectification forms

### Legal/Compliance
- **Legal Counsel:** Review all policies and templates
- **DPO (once appointed):** Oversee implementation, conduct training

### QA Team
- **QA 1:** Write and execute test plans
- **QA 2:** Compliance testing and audit preparation

---

## Timeline Summary

```
Week 1-2: DPO, Breach Notification, PIA
Week 3-4: Children's Consent, ROPA, AI Disclosure
Week 5-6: Rectification API, Privacy Policy Updates
Week 7-8: Retention Policy, Right to Object
Week 9-10: Testing, Documentation, Review
Week 11-12: External Audit, Final Fixes, Deployment
```

**Total Duration:** 90 days (3 months)
**Team Size:** 4 developers + 1 QA + 1 legal + 1 DPO
**Budget:** SAR 300,000 - 400,000

---

**Last Updated:** December 22, 2025
**Next Review:** January 1, 2026
**Owner:** CTO / Engineering Lead
