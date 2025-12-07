const mongoose = require('mongoose');

const employeeBenefitSchema = new mongoose.Schema({
    // ==================== IDENTIFICATION ====================
    benefitEnrollmentId: {
        type: String,
        unique: true,
        index: true
    },
    enrollmentNumber: {
        type: String,
        trim: true
    },

    // ==================== EMPLOYEE REFERENCE ====================
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    employeeNumber: {
        type: String,
        trim: true
    },
    employeeName: {
        type: String,
        required: true,
        trim: true
    },
    employeeNameAr: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },

    // ==================== BENEFIT DETAILS ====================
    benefitType: {
        type: String,
        enum: [
            'health_insurance', 'life_insurance', 'disability_insurance',
            'dental_insurance', 'vision_insurance', 'pension', 'savings_plan',
            'education_allowance', 'transportation', 'housing', 'meal_allowance',
            'mobile_allowance', 'gym_membership', 'professional_membership', 'other'
        ],
        required: true,
        index: true
    },
    benefitCategory: {
        type: String,
        enum: ['insurance', 'allowance', 'retirement', 'perks', 'flexible_benefits', 'mandatory', 'voluntary'],
        required: true,
        index: true
    },
    benefitName: {
        type: String,
        required: true,
        trim: true
    },
    benefitNameAr: {
        type: String,
        trim: true
    },
    benefitDescription: {
        type: String,
        maxlength: 2000
    },
    benefitDescriptionAr: {
        type: String,
        maxlength: 2000
    },

    // ==================== PLAN DETAILS ====================
    planId: {
        type: String,
        trim: true
    },
    planCode: {
        type: String,
        trim: true
    },
    planName: {
        type: String,
        trim: true
    },
    planNameAr: {
        type: String,
        trim: true
    },

    // ==================== PROVIDER ====================
    providerType: {
        type: String,
        enum: ['insurance_company', 'fund', 'company_managed', 'third_party']
    },
    providerName: {
        type: String,
        trim: true
    },
    providerNameAr: {
        type: String,
        trim: true
    },
    providerContact: {
        contactPerson: { type: String, trim: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
        website: { type: String, trim: true }
    },

    // ==================== ENROLLMENT ====================
    enrollmentType: {
        type: String,
        enum: ['new_hire', 'annual_enrollment', 'qualifying_event', 'mid_year_change', 're_enrollment'],
        required: true
    },
    enrollmentDate: {
        type: Date,
        required: true,
        index: true
    },
    effectiveDate: {
        type: Date,
        required: true,
        index: true
    },
    coverageEndDate: {
        type: Date
    },

    // ==================== COVERAGE LEVEL ====================
    coverageLevel: {
        type: String,
        enum: ['employee_only', 'employee_spouse', 'employee_children', 'employee_family', 'employee_parents']
    },

    // ==================== COVERED DEPENDENTS ====================
    coveredDependents: [{
        memberId: { type: String },
        name: { type: String, trim: true },
        nameAr: { type: String, trim: true },
        relationship: {
            type: String,
            enum: ['spouse', 'child', 'parent', 'other']
        },
        dateOfBirth: { type: Date },
        age: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        active: { type: Boolean, default: true },
        documentsVerified: { type: Boolean, default: false },
        verificationDate: { type: Date }
    }],

    // ==================== BENEFICIARIES (for life insurance) ====================
    beneficiaries: [{
        beneficiaryId: { type: String },
        beneficiaryType: {
            type: String,
            enum: ['primary', 'contingent']
        },
        name: { type: String, trim: true },
        nameAr: { type: String, trim: true },
        relationship: { type: String, trim: true },
        dateOfBirth: { type: Date },
        nationalId: { type: String, trim: true },
        contactPhone: { type: String, trim: true },
        contactEmail: { type: String, trim: true },
        percentage: { type: Number, min: 0, max: 100 },
        designation: { type: Number }
    }],

    // ==================== STATUS ====================
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'terminated', 'expired'],
        default: 'pending',
        index: true
    },
    statusDate: {
        type: Date,
        default: Date.now
    },
    statusReason: {
        type: String,
        trim: true
    },

    // ==================== COST ====================
    employerCost: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    employeeCost: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'SAR'
    },

    // Cost Breakdown
    costBreakdown: {
        employeeCost: {
            monthlyDeduction: { type: Number, default: 0 },
            annualCost: { type: Number, default: 0 },
            preTaxDeduction: { type: Boolean, default: false },
            deductedFromPayroll: { type: Boolean, default: true },
            ytdDeductions: { type: Number, default: 0 }
        },
        employerCost: {
            monthlyCost: { type: Number, default: 0 },
            annualCost: { type: Number, default: 0 },
            ytdCost: { type: Number, default: 0 }
        },
        totalBenefitValue: { type: Number, default: 0 },
        employerSharePercentage: { type: Number, default: 0 },
        employeeSharePercentage: { type: Number, default: 0 }
    },

    // ==================== HEALTH INSURANCE DETAILS ====================
    healthInsurance: {
        insuranceProvider: { type: String, trim: true },
        policyNumber: { type: String, trim: true },
        groupNumber: { type: String, trim: true },
        memberNumber: { type: String, trim: true },
        memberId: { type: String, trim: true },
        cardNumber: { type: String, trim: true },
        cardExpiryDate: { type: Date },
        coverageType: {
            type: String,
            enum: ['individual', 'family']
        },
        planType: {
            type: String,
            enum: ['basic', 'standard', 'premium', 'executive']
        },
        networkType: {
            type: String,
            enum: ['in_network', 'out_of_network', 'both']
        },
        annualDeductible: { type: Number },
        copayPercentage: { type: Number },
        annualMaximum: { type: Number },
        inpatientCoverage: { type: Boolean },
        inpatientLimit: { type: Number },
        outpatientCoverage: { type: Boolean },
        outpatientLimit: { type: Number },
        maternityCoverage: { type: Boolean },
        dentalCoverage: { type: Boolean },
        visionCoverage: { type: Boolean },
        preAuthRequired: { type: Boolean },
        geographicCoverage: {
            type: String,
            enum: ['saudi_only', 'gcc', 'mena', 'worldwide']
        }
    },

    // ==================== LIFE INSURANCE DETAILS ====================
    lifeInsurance: {
        insuranceProvider: { type: String, trim: true },
        policyNumber: { type: String, trim: true },
        certificateNumber: { type: String, trim: true },
        coverageAmount: { type: Number },
        coverageMultiple: { type: Number },
        coverageType: {
            type: String,
            enum: ['term', 'whole_life', 'group_term']
        },
        accidentalDeath: { type: Boolean },
        accidentalDeathMultiplier: { type: Number },
        criticalIllness: { type: Boolean },
        criticalIllnessBenefit: { type: Number },
        primaryBeneficiaries: { type: Number },
        contingentBeneficiaries: { type: Number }
    },

    // ==================== ALLOWANCE DETAILS ====================
    allowance: {
        allowanceType: { type: String, trim: true },
        allowanceName: { type: String, trim: true },
        allowanceNameAr: { type: String, trim: true },
        allowanceAmount: { type: Number },
        calculationType: {
            type: String,
            enum: ['fixed', 'percentage_of_salary', 'tiered', 'reimbursement']
        },
        percentageOfSalary: { type: Number },
        paymentFrequency: {
            type: String,
            enum: ['monthly', 'quarterly', 'annual', 'one_time', 'as_incurred']
        },
        annualLimit: { type: Number },
        usedToDate: { type: Number, default: 0 },
        remainingLimit: { type: Number },
        taxable: { type: Boolean, default: true },
        includedInGOSI: { type: Boolean, default: false },
        includedInEOSB: { type: Boolean, default: false }
    },

    // ==================== COMPLIANCE ====================
    cchiCompliant: { type: Boolean },
    cchiRegistrationNumber: { type: String, trim: true },
    gosiReported: { type: Boolean, default: false },

    // ==================== NOTES ====================
    notes: {
        employeeNotes: { type: String, maxlength: 2000 },
        hrNotes: { type: String, maxlength: 2000 },
        internalNotes: { type: String, maxlength: 2000 }
    },

    // ==================== DOCUMENTS ====================
    documents: [{
        documentType: {
            type: String,
            enum: [
                'enrollment_form', 'beneficiary_designation', 'insurance_card',
                'policy_document', 'summary_of_benefits', 'claim_form',
                'medical_certificate', 'dependent_proof', 'termination_notice',
                'continuation_notice', 'receipt', 'other'
            ]
        },
        documentName: { type: String, trim: true },
        documentNameAr: { type: String, trim: true },
        fileUrl: { type: String },
        fileName: { type: String },
        fileSize: { type: Number },
        uploadedOn: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        expiryDate: { type: Date },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verificationDate: { type: Date }
    }],

    // ==================== AUDIT ====================
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' }
});

// ==================== INDEXES ====================
employeeBenefitSchema.index({ employeeId: 1, status: 1 });
employeeBenefitSchema.index({ benefitType: 1, status: 1 });
employeeBenefitSchema.index({ benefitCategory: 1 });
employeeBenefitSchema.index({ effectiveDate: -1 });
employeeBenefitSchema.index({ createdBy: 1, status: 1 });
employeeBenefitSchema.index({ enrollmentDate: -1, effectiveDate: -1 });

// ==================== PRE-SAVE HOOK ====================
employeeBenefitSchema.pre('save', async function(next) {
    // Auto-generate benefitEnrollmentId
    if (!this.benefitEnrollmentId) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            benefitEnrollmentId: new RegExp(`^BEN-${year}-`)
        });
        this.benefitEnrollmentId = `BEN-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    // Calculate total cost
    this.totalCost = (this.employerCost || 0) + (this.employeeCost || 0);

    // Calculate cost breakdown percentages
    if (this.totalCost > 0) {
        this.costBreakdown = this.costBreakdown || {};
        this.costBreakdown.employerSharePercentage = Math.round((this.employerCost / this.totalCost) * 100);
        this.costBreakdown.employeeSharePercentage = Math.round((this.employeeCost / this.totalCost) * 100);
        this.costBreakdown.totalBenefitValue = this.totalCost;
    }

    next();
});

// ==================== STATIC METHODS ====================

// Get benefit statistics
employeeBenefitSchema.statics.getBenefitStats = async function(filters = {}) {
    const matchStage = {};

    if (filters.createdBy) matchStage.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
    if (filters.employeeId) matchStage.employeeId = new mongoose.Types.ObjectId(filters.employeeId);
    if (filters.benefitType) matchStage.benefitType = filters.benefitType;
    if (filters.benefitCategory) matchStage.benefitCategory = filters.benefitCategory;
    if (filters.status) matchStage.status = filters.status;

    if (filters.fromDate || filters.toDate) {
        matchStage.effectiveDate = {};
        if (filters.fromDate) matchStage.effectiveDate.$gte = new Date(filters.fromDate);
        if (filters.toDate) matchStage.effectiveDate.$lte = new Date(filters.toDate);
    }

    const [
        totalBenefits,
        activeEnrollments,
        pendingEnrollments,
        byType,
        byCategory,
        byStatus,
        costAggregation
    ] = await Promise.all([
        this.countDocuments(matchStage),
        this.countDocuments({ ...matchStage, status: 'active' }),
        this.countDocuments({ ...matchStage, status: 'pending' }),
        this.aggregate([
            { $match: matchStage },
            { $group: { _id: '$benefitType', count: { $sum: 1 } } }
        ]),
        this.aggregate([
            { $match: matchStage },
            { $group: { _id: '$benefitCategory', count: { $sum: 1 } } }
        ]),
        this.aggregate([
            { $match: matchStage },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.aggregate([
            { $match: { ...matchStage, status: 'active' } },
            {
                $group: {
                    _id: null,
                    totalEmployerCost: { $sum: '$employerCost' },
                    totalEmployeeCost: { $sum: '$employeeCost' },
                    avgBenefitValue: { $avg: { $add: ['$employerCost', '$employeeCost'] } }
                }
            }
        ])
    ]);

    return {
        totalBenefits,
        activeEnrollments,
        pendingEnrollments,
        totalEmployerCost: costAggregation[0]?.totalEmployerCost || 0,
        totalEmployeeCost: costAggregation[0]?.totalEmployeeCost || 0,
        averageBenefitValue: costAggregation[0]?.avgBenefitValue || 0,
        byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
        byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        coverageRate: totalBenefits > 0 ? Math.round((activeEnrollments / totalBenefits) * 100) : 0
    };
};

// Get benefits by type
employeeBenefitSchema.statics.getBenefitsByType = async function(filters = {}) {
    const matchStage = {};

    if (filters.createdBy) matchStage.createdBy = new mongoose.Types.ObjectId(filters.createdBy);
    if (filters.status) matchStage.status = filters.status;

    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$benefitType',
                totalCost: { $sum: { $add: ['$employerCost', '$employeeCost'] } },
                employerCost: { $sum: '$employerCost' },
                employeeCost: { $sum: '$employeeCost' },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                benefitType: '$_id',
                totalCost: 1,
                employerCost: 1,
                employeeCost: 1,
                count: 1,
                _id: 0
            }
        },
        { $sort: { totalCost: -1 } }
    ]);
};

module.exports = mongoose.model('EmployeeBenefit', employeeBenefitSchema);
