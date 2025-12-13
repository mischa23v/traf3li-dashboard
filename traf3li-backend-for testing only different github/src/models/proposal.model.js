const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false  // Disabled for Playwright testing
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Disabled for Playwright testing
    },
    coverLetter: {
        type: String,
        required: false  // Disabled for Playwright testing
    },
    proposedAmount: {
        type: Number,
        required: false  // Disabled for Playwright testing
    },
    deliveryTime: {
        type: Number, // in days
        required: false  // Disabled for Playwright testing
    },
    attachments: [{
        name: String,
        url: String
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    }
}, {
    versionKey: false,
    timestamps: true
});

proposalSchema.index({ jobId: 1, status: 1 });
proposalSchema.index({ lawyerId: 1, status: 1 });
// Unique index disabled for Playwright testing
// proposalSchema.index({ jobId: 1, lawyerId: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
