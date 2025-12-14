const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    // ==================== REFERENCES ====================
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false  // Optional for external cases
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Optional for external cases
    },
    clientName: {
        type: String,
        required: false  // For external clients not on platform
    },
    clientPhone: {
        type: String,
        required: false  // For external clients
    },

    // ==================== BASIC INFO ====================
    title: {
        type: String,
        required: false,  // Disabled for Playwright testing
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    category: {
        type: String,
        enum: ['labor', 'commercial', 'civil', 'criminal', 'family', 'administrative', 'other'],
        required: false  // Disabled for Playwright testing
    },
    subCategory: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    filingDate: {
        type: Date
    },
    caseNumber: {
        type: String,
        trim: true  // Court case number: "12345/1445"
    },
    internalReference: {
        type: String,
        trim: true  // Internal: "CASE-2024-001"
    },

    // ==================== PLAINTIFF (المدعي) ====================
    plaintiffType: {
        type: String,
        enum: ['individual', 'company', 'government']
    },
    plaintiff: {
        // Individual fields
        name: { type: String, trim: true },
        nationalId: { type: String, trim: true },  // 10 digits, starts with 1 (Saudi) or 2 (Iqama)
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },

        // Company fields
        companyName: { type: String, trim: true },
        crNumber: { type: String, trim: true },  // 10 digits Commercial Registration
        representativeName: { type: String, trim: true },
        representativePosition: { type: String, trim: true },

        // Government fields
        entityName: { type: String, trim: true },
        representative: { type: String, trim: true }
    },

    // ==================== DEFENDANT (المدعى عليه) ====================
    defendantType: {
        type: String,
        enum: ['individual', 'company', 'government']
    },
    defendant: {
        // Individual fields
        name: { type: String, trim: true },
        nationalId: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },

        // Company fields
        companyName: { type: String, trim: true },
        crNumber: { type: String, trim: true },
        representativeName: { type: String, trim: true },
        representativePosition: { type: String, trim: true },

        // Government fields
        entityName: { type: String, trim: true },
        representative: { type: String, trim: true }
    },

    // ==================== COURT/COMMITTEE DETAILS ====================
    courtDetails: {
        entityType: { type: String, enum: ['court', 'committee'] },
        court: { type: String, trim: true },       // Court code: 'general', 'labor', etc.
        committee: { type: String, trim: true },   // Committee code: 'banking', 'securities', etc.
        region: { type: String, trim: true },      // Region code: 'riyadh', 'makkah', etc.
        city: { type: String, trim: true },        // City name in Arabic
        circuitNumber: { type: String, trim: true }, // "الدائرة الأولى"
        judgeName: { type: String, trim: true },
        courtRoom: { type: String, trim: true }    // "قاعة 5"
    },

    // Legacy court field (keep for backward compatibility)
    court: {
        type: String,
        trim: true
    },
    judge: {
        type: String,
        trim: true
    },

    // ==================== CASE SUBJECT & LEGAL BASIS ====================
    caseSubject: {
        type: String,
        trim: true  // موضوع الدعوى
    },
    legalBasis: {
        type: String,
        trim: true  // السند النظامي
    },

    // ==================== POWER OF ATTORNEY ====================
    powerOfAttorney: {
        poaNumber: { type: String, trim: true },
        poaDate: { type: Date },
        poaExpiry: { type: Date },
        poaScope: { type: String, enum: ['general', 'specific', 'litigation'] },
        poaIssuer: { type: String, trim: true }  // كاتب العدل
    },

    // ==================== TEAM ASSIGNMENT ====================
    team: {
        assignedLawyer: { type: String, trim: true },
        assistants: [{ type: String, trim: true }]
    },

    // ==================== LABOR CASE SPECIFIC ====================
    laborCaseSpecific: {
        jobTitle: { type: String, trim: true },
        employmentStartDate: { type: Date },
        employmentEndDate: { type: Date },
        monthlySalary: { type: Number, min: 0 },
        terminationReason: { type: String, trim: true }
    },

    // Legacy labor case details (keep for backward compatibility)
    laborCaseDetails: {
        plaintiff: {
            name: { type: String, required: false },
            nationalId: { type: String, required: false },
            phone: { type: String, required: false },
            address: { type: String, required: false },
            city: { type: String, required: false }
        },
        company: {
            name: { type: String, required: false },
            registrationNumber: { type: String, required: false },
            address: { type: String, required: false },
            city: { type: String, required: false }
        }
    },

    // ==================== PERSONAL STATUS (FAMILY) CASE SPECIFIC ====================
    personalStatusDetails: {
        marriageDate: { type: Date },
        marriageCity: { type: String, trim: true },
        childrenCount: { type: Number, min: 0 },
        children: [{
            name: { type: String, trim: true },
            birthDate: { type: Date },
            gender: { type: String, enum: ['male', 'female'] }
        }]
    },

    // ==================== COMMERCIAL CASE SPECIFIC ====================
    commercialDetails: {
        contractDate: { type: Date },
        contractValue: { type: Number, min: 0 },
        commercialPapers: [{
            type: { type: String, enum: ['cheque', 'promissory_note', 'bill_of_exchange'] },
            number: { type: String, trim: true },
            amount: { type: Number, min: 0 },
            date: { type: Date },
            bankName: { type: String, trim: true },
            status: { type: String, enum: ['pending', 'bounced', 'paid'] }
        }]
    },

    // ==================== CLAIMS ====================
    claims: [{
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        period: {
            type: String,
            trim: true  // "من - إلى"
        },
        description: {
            type: String,
            trim: true
        }
    }],

    // ==================== FINANCIAL ====================
    claimAmount: {
        type: Number,
        default: 0
    },
    expectedWinAmount: {
        type: Number,
        default: 0
    },

    // ==================== STATUS & PROGRESS ====================
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'appeal', 'settlement', 'on-hold', 'completed', 'won', 'lost', 'settled'],
        default: 'active'
    },
    outcome: {
        type: String,
        enum: ['won', 'lost', 'settled', 'ongoing'],
        default: 'ongoing'
    },

    // ==================== TIMELINE ====================
    timeline: [{
        event: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['court', 'filing', 'deadline', 'general'],
            default: 'general'
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed'],
            default: 'upcoming'
        }
    }],

    // ==================== NOTES ====================
    notes: [{
        text: String,
        date: { type: Date, default: Date.now }
    }],

    // ==================== DOCUMENTS ====================
    documents: [{
        filename: String,
        url: String,
        type: String,
        size: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: { type: Date, default: Date.now },
        category: {
            type: String,
            enum: ['contract', 'evidence', 'correspondence', 'court_document', 'poa', 'id_document', 'other'],
            default: 'other'
        }
    }],

    // ==================== HEARINGS ====================
    hearings: [{
        date: Date,
        location: String,
        notes: String,
        attended: { type: Boolean, default: false },
        outcome: { type: String, trim: true }
    }],
    nextHearing: {
        type: Date,
        required: false
    },

    // ==================== DATES ====================
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false
    },

    // ==================== SOURCE ====================
    source: {
        type: String,
        enum: ['platform', 'external'],
        default: 'external'  // Track where case came from
    }
}, {
    versionKey: false,
    timestamps: true
});

// Indexes for performance
caseSchema.index({ lawyerId: 1, status: 1 });
caseSchema.index({ clientId: 1, status: 1 });
caseSchema.index({ category: 1, status: 1 });
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ internalReference: 1 });
caseSchema.index({ 'courtDetails.court': 1 });
caseSchema.index({ 'courtDetails.region': 1 });
caseSchema.index({ filingDate: -1 });

module.exports = mongoose.model('Case', caseSchema);
